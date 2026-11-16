import pandas as pd
import numpy as np
from datetime import datetime
from typing import Dict, Any, Tuple, Optional
import io
import os

COLUMN_ALIASES = {
    'InvoiceNo': ['invoiceno', 'invoice_no', 'invoice', 'invoicenumber', 'order_id', 'trans_id'],
    'StockCode': ['stockcode', 'stock_code', 'item_code', 'sku', 'product_id'],
    'Description': ['description', 'desc', 'product_name', 'item_name', 'product'],
    'Quantity': ['quantity', 'qty', 'units', 'volume'],
    'InvoiceDate': ['invoicedate', 'invoice_date', 'date', 'timestamp', 'transaction_date'],
    'UnitPrice': ['unitprice', 'unit_price', 'price', 'unit_cost', 'rate'],
    'CustomerID': ['customerid', 'customer_id', 'client_id', 'cust_id', 'user_id', 'account_id'],
    'Country': ['country', 'region', 'nation', 'location']
}

def identify_and_standardize_columns(df: pd.DataFrame) -> Tuple[pd.DataFrame, Dict[str, str], list]:
    mapping = {}
    missing_required = []
    lower_cols = {col.strip().lower(): col for col in df.columns}
    
    for standard_col, aliases in COLUMN_ALIASES.items():
        found = False
        for alias in aliases:
            if alias in lower_cols:
                mapping[lower_cols[alias]] = standard_col
                found = True
                break
        if not found:
            if standard_col in ['InvoiceNo', 'Quantity', 'InvoiceDate', 'UnitPrice', 'CustomerID']:
                missing_required.append(standard_col)
    
    renamed_df = df.rename(columns=mapping)
    return renamed_df, mapping, missing_required

def load_and_inspect_csv(file_path: str) -> Dict[str, Any]:
    # Try different encodings
    encodings = ['utf-8', 'latin1', 'iso-8859-1', 'cp1252']
    df = None
    used_encoding = 'utf-8'
    
    for enc in encodings:
        try:
            df = pd.read_csv(file_path, encoding=enc, low_memory=False)
            used_encoding = enc
            break
        except UnicodeDecodeError:
            continue
        except Exception as e:
            raise ValueError(f"Failed to read CSV: {str(e)}")
            
    if df is None:
        raise ValueError("Could not decode file with standard encodings (utf-8, latin1, iso-8859-1).")

    raw_row_count = len(df)
    raw_col_count = len(df.columns)
    
    # Standardize columns
    standardized_df, col_mapping, missing_cols = identify_and_standardize_columns(df)
    
    # Column inspection
    columns_info = []
    for col in standardized_df.columns:
        null_count = int(standardized_df[col].isnull().sum())
        null_pct = round((null_count / raw_row_count) * 100, 2) if raw_row_count > 0 else 0
        sample_vals = standardized_df[col].dropna().head(3).tolist()
        sample_vals_str = [str(x) for x in sample_vals]
        
        columns_info.append({
            "name": col,
            "original_name": [orig for orig, mapped in col_mapping.items() if mapped == col][0] if col in col_mapping.values() else col,
            "dtype": str(standardized_df[col].dtype),
            "missing_count": null_count,
            "missing_percentage": null_pct,
            "sample_values": sample_vals_str
        })
    
    # Preview top 10
    preview_df = standardized_df.head(10).fillna("")
    preview_records = preview_df.to_dict(orient='records')
    
    # Missing values overview
    missing_summary = {
        col: int(standardized_df[col].isnull().sum())
        for col in standardized_df.columns if standardized_df[col].isnull().sum() > 0
    }
    
    duplicate_count = int(standardized_df.duplicated().sum())

    return {
        "raw_row_count": raw_row_count,
        "raw_col_count": raw_col_count,
        "encoding": used_encoding,
        "columns": columns_info,
        "missing_required_columns": missing_cols,
        "duplicate_count": duplicate_count,
        "missing_summary": missing_summary,
        "preview": preview_records
    }

def preprocess_dataset(
    file_path: str,
    remove_duplicates: bool = True,
    remove_cancellations: bool = True,
    remove_negative_qty: bool = True,
    remove_missing_customers: bool = True,
    remove_zero_price: bool = True,
    handle_outliers: bool = True
) -> Tuple[pd.DataFrame, Dict[str, Any]]:
    # Read file
    encodings = ['utf-8', 'latin1', 'iso-8859-1']
    df = None
    for enc in encodings:
        try:
            df = pd.read_csv(file_path, encoding=enc, low_memory=False)
            break
        except UnicodeDecodeError:
            continue
            
    if df is None:
        raise ValueError("Could not read dataset with standard encodings.")
        
    df, _, _ = identify_and_standardize_columns(df)
    initial_count = len(df)
    audit = {}
    
    # 1. Missing Customer IDs
    missing_cust_count = 0
    if 'CustomerID' in df.columns:
        missing_cust_count = int(df['CustomerID'].isnull().sum())
        if remove_missing_customers:
            df = df.dropna(subset=['CustomerID'])
            audit['missing_customer_ids_removed'] = {
                "count": missing_cust_count,
                "reason": "Transactional records without CustomerID cannot be attributed to a specific customer entity for behavioral segmentation."
            }
            # Cast CustomerID to clean string or integer
            try:
                df['CustomerID'] = df['CustomerID'].astype(float).astype(int).astype(str)
            except Exception:
                df['CustomerID'] = df['CustomerID'].astype(str)
                
    # 2. Duplicate records
    duplicate_count = int(df.duplicated().sum())
    if remove_duplicates and duplicate_count > 0:
        df = df.drop_duplicates()
        audit['duplicate_records_removed'] = {
            "count": duplicate_count,
            "reason": "Exact duplicate transaction entries inflate revenue metrics and distort frequency."
        }

    # 3. Cancelled orders
    cancellation_count = 0
    if 'InvoiceNo' in df.columns:
        df['InvoiceNo'] = df['InvoiceNo'].astype(str)
        cancel_mask = df['InvoiceNo'].str.startswith('C', na=False)
        cancellation_count = int(cancel_mask.sum())
        if remove_cancellations and cancellation_count > 0:
            df = df[~cancel_mask]
            audit['cancellations_filtered'] = {
                "count": cancellation_count,
                "reason": "Cancelled orders (Invoice starting with 'C') represent unfulfilled purchases and reversals."
            }

    # 4. Negative / Zero Quantity
    neg_qty_count = 0
    if 'Quantity' in df.columns:
        df['Quantity'] = pd.to_numeric(df['Quantity'], errors='coerce')
        df = df.dropna(subset=['Quantity'])
        neg_qty_mask = df['Quantity'] <= 0
        neg_qty_count = int(neg_qty_mask.sum())
        if remove_negative_qty and neg_qty_count > 0:
            df = df[~neg_qty_mask]
            audit['negative_quantities_filtered'] = {
                "count": neg_qty_count,
                "reason": "Negative or zero quantities reflect returns, inventory write-offs, or accounting adjustments."
            }

    # 5. Zero or Negative UnitPrice
    zero_price_count = 0
    if 'UnitPrice' in df.columns:
        df['UnitPrice'] = pd.to_numeric(df['UnitPrice'], errors='coerce')
        df = df.dropna(subset=['UnitPrice'])
        zero_price_mask = df['UnitPrice'] <= 0
        zero_price_count = int(zero_price_mask.sum())
        if remove_zero_price and zero_price_count > 0:
            df = df[~zero_price_mask]
            audit['zero_or_negative_price_filtered'] = {
                "count": zero_price_count,
                "reason": "Zero or negative prices represent product samples, bad debt, or data entry errors."
            }

    # 6. Parse InvoiceDate
    if 'InvoiceDate' in df.columns:
        df['InvoiceDate'] = pd.to_datetime(df['InvoiceDate'], errors='coerce')
        df = df.dropna(subset=['InvoiceDate'])
        
    # Calculate LineTotal / Spending
    df['LineTotal'] = df['Quantity'] * df['UnitPrice']
    
    # 7. Outliers detection (IQR on LineTotal)
    outlier_count = 0
    if handle_outliers and len(df) > 20:
        q1 = df['LineTotal'].quantile(0.01)
        q3 = df['LineTotal'].quantile(0.99)
        iqr = q3 - q1
        upper_bound = q3 + 3.0 * iqr
        outlier_mask = df['LineTotal'] > upper_bound
        outlier_count = int(outlier_mask.sum())
        if outlier_count > 0:
            # We filter extreme transaction anomalies (> 99th percentile + 3*IQR)
            df = df[~outlier_mask]
            audit['extreme_outliers_filtered'] = {
                "count": outlier_count,
                "threshold": round(float(upper_bound), 2),
                "reason": f"Removed extreme bulk/wholesale transactions exceeding spending threshold of ${upper_bound:.2f} to prevent model skew."
            }

    final_count = len(df)
    unique_customers = int(df['CustomerID'].nunique()) if 'CustomerID' in df.columns else 0
    unique_invoices = int(df['InvoiceNo'].nunique()) if 'InvoiceNo' in df.columns else 0
    total_revenue = float(df['LineTotal'].sum()) if 'LineTotal' in df.columns else 0.0
    
    min_date = df['InvoiceDate'].min().strftime('%Y-%m-%d') if 'InvoiceDate' in df.columns and len(df) > 0 else "N/A"
    max_date = df['InvoiceDate'].max().strftime('%Y-%m-%d') if 'InvoiceDate' in df.columns and len(df) > 0 else "N/A"
    
    summary = {
        "initial_records": initial_count,
        "final_records": final_count,
        "removed_records": initial_count - final_count,
        "retention_rate_pct": round((final_count / initial_count) * 100, 2) if initial_count > 0 else 0,
        "unique_customers": unique_customers,
        "unique_invoices": unique_invoices,
        "total_revenue": round(total_revenue, 2),
        "date_range": {
            "start_date": min_date,
            "end_date": max_date,
            "days_span": (df['InvoiceDate'].max() - df['InvoiceDate'].min()).days if 'InvoiceDate' in df.columns and len(df) > 0 else 0
        },
        "audit_trail": audit
    }
    
    return df, summary
