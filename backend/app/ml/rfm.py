import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from typing import Dict, Any, Tuple

def compute_rfm(df: pd.DataFrame, reference_date: datetime = None) -> Tuple[pd.DataFrame, Dict[str, Any]]:
    if 'CustomerID' not in df.columns or 'InvoiceDate' not in df.columns or 'InvoiceNo' not in df.columns:
        raise ValueError("DataFrame must contain CustomerID, InvoiceDate, and InvoiceNo.")
    
    # Ensure LineTotal exists
    if 'LineTotal' not in df.columns:
        df['LineTotal'] = df['Quantity'] * df['UnitPrice']
        
    # Determine reference date
    max_invoice_date = df['InvoiceDate'].max()
    if reference_date is None:
        ref_date = max_invoice_date + timedelta(days=1)
    else:
        ref_date = reference_date

    # Group by customer
    rfm_df = df.groupby('CustomerID').agg({
        'InvoiceDate': [
            lambda x: (ref_date - x.max()).days, # Recency
            lambda x: (ref_date - x.min()).days, # Tenure
            'max' # Last purchase date
        ],
        'InvoiceNo': 'nunique', # Frequency
        'LineTotal': 'sum'      # Monetary
    })
    
    rfm_df.columns = ['recency', 'tenure', 'last_purchase_date', 'frequency', 'monetary']
    rfm_df = rfm_df.reset_index()
    
    # Round Monetary and compute Average Order Value (AOV)
    rfm_df['monetary'] = rfm_df['monetary'].round(2)
    rfm_df['aov'] = (rfm_df['monetary'] / rfm_df['frequency']).round(2)
    
    # Quantile scores (1-5)
    # Recency: lower is better (inverted)
    try:
        rfm_df['r_score'] = pd.qcut(rfm_df['recency'], q=5, labels=[5, 4, 3, 2, 1]).astype(int)
    except Exception:
        rfm_df['r_score'] = pd.cut(rfm_df['recency'], bins=5, labels=[5, 4, 3, 2, 1]).astype(int)
        
    try:
        rfm_df['f_score'] = pd.qcut(rfm_df['frequency'].rank(method='first'), q=5, labels=[1, 2, 3, 4, 5]).astype(int)
    except Exception:
        rfm_df['f_score'] = pd.cut(rfm_df['frequency'], bins=5, labels=[1, 2, 3, 4, 5]).astype(int)
        
    try:
        rfm_df['m_score'] = pd.qcut(rfm_df['monetary'].rank(method='first'), q=5, labels=[1, 2, 3, 4, 5]).astype(int)
    except Exception:
        rfm_df['m_score'] = pd.cut(rfm_df['monetary'], bins=5, labels=[1, 2, 3, 4, 5]).astype(int)

    rfm_df['rfm_score'] = rfm_df['r_score'].astype(str) + rfm_df['f_score'].astype(str) + rfm_df['m_score'].astype(str)
    
    # Calculate distributions & histogram bins for visualizations
    def get_hist(series, bins=10):
        counts, edges = np.histogram(series.dropna(), bins=bins)
        return [{"bin_start": round(float(edges[i]), 2), "bin_end": round(float(edges[i+1]), 2), "count": int(counts[i])} for i in range(len(counts))]
    
    recency_hist = get_hist(rfm_df['recency'], bins=10)
    frequency_hist = get_hist(rfm_df['frequency'], bins=min(10, max(2, rfm_df['frequency'].nunique())))
    monetary_hist = get_hist(rfm_df['monetary'], bins=10)
    
    # Summary statistics
    def col_stats(series):
        return {
            "mean": round(float(series.mean()), 2),
            "median": round(float(series.median()), 2),
            "std": round(float(series.std()), 2) if len(series) > 1 else 0.0,
            "min": round(float(series.min()), 2),
            "max": round(float(series.max()), 2),
            "p25": round(float(series.quantile(0.25)), 2),
            "p75": round(float(series.quantile(0.75)), 2),
            "skewness": round(float(series.skew()), 2) if len(series) > 2 else 0.0
        }
        
    stats = {
        "recency": col_stats(rfm_df['recency']),
        "frequency": col_stats(rfm_df['frequency']),
        "monetary": col_stats(rfm_df['monetary']),
        "aov": col_stats(rfm_df['aov'])
    }
    
    # Correlation matrix
    corr_cols = ['recency', 'frequency', 'monetary', 'aov', 'tenure']
    corr_df = rfm_df[corr_cols].corr().round(3)
    corr_matrix = {
        "features": corr_cols,
        "matrix": [[float(corr_df.loc[row, col]) for col in corr_cols] for row in corr_cols]
    }
    
    # Spending tiers breakdown
    tiers = [
        {"tier": "Micro (< $100)", "count": int((rfm_df['monetary'] < 100).sum())},
        {"tier": "Low ($100 - $500)", "count": int(((rfm_df['monetary'] >= 100) & (rfm_df['monetary'] < 500)).sum())},
        {"tier": "Mid ($500 - $1,500)", "count": int(((rfm_df['monetary'] >= 500) & (rfm_df['monetary'] < 1500)).sum())},
        {"tier": "High ($1,500 - $3,500)", "count": int(((rfm_df['monetary'] >= 1500) & (rfm_df['monetary'] < 3500)).sum())},
        {"tier": "VIP ($3,500+)", "count": int((rfm_df['monetary'] >= 3500).sum())}
    ]

    metadata = {
        "reference_date": ref_date.strftime("%Y-%m-%d %H:%M:%S"),
        "customer_count": len(rfm_df),
        "total_revenue": round(float(rfm_df['monetary'].sum()), 2),
        "average_order_value": round(float(rfm_df['monetary'].sum() / rfm_df['frequency'].sum()), 2) if rfm_df['frequency'].sum() > 0 else 0,
        "statistics": stats,
        "distributions": {
            "recency": recency_hist,
            "frequency": frequency_hist,
            "monetary": monetary_hist
        },
        "correlation": corr_matrix,
        "spending_tiers": tiers
    }
    
    return rfm_df, metadata
