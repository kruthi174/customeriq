import os
import pandas as pd
from typing import Dict, Any, Optional, List
from datetime import datetime

from app.ml.preprocessing import load_and_inspect_csv, preprocess_dataset
from app.ml.rfm import compute_rfm
from app.ml.clustering import train_and_compare_all_models
from app.ml.segmentation import profile_and_name_clusters
from app.ml.churn import construct_chronological_churn_dataset, train_churn_models
from app.ml.cross_analysis import generate_combined_insights
from app.ml.recommendations import generate_recommendations
from app.ml.pdf_report import generate_pdf_report
from app.database.db import log_action

from app.utils.paths import PROJECT_ROOT, SAMPLE_DATA_PATH, UPLOADS_DIR, REPORTS_DIR, MODELS_DIR

class DataManager:
    _instance = None

    def __init__(self):
        self.root_dir = PROJECT_ROOT
        self.sample_path = SAMPLE_DATA_PATH
        self.uploads_dir = UPLOADS_DIR
        self.reports_dir = REPORTS_DIR
        self.models_dir = MODELS_DIR

        self.current_file_path: Optional[str] = None
        self.current_dataset_name: str = "Sample Online Retail Dataset"
        self.is_sample: bool = True

        # Pipeline state
        self.raw_inspection: Optional[Dict[str, Any]] = None
        self.cleaned_df: Optional[pd.DataFrame] = None
        self.preprocessing_summary: Optional[Dict[str, Any]] = None
        
        self.rfm_df: Optional[pd.DataFrame] = None
        self.rfm_meta: Optional[Dict[str, Any]] = None
        
        self.clustering_meta: Optional[Dict[str, Any]] = None
        self.segmented_df: Optional[pd.DataFrame] = None
        self.segment_meta: Optional[Dict[str, Any]] = None
        
        self.churn_df: Optional[pd.DataFrame] = None
        self.churn_meta: Optional[Dict[str, Any]] = None
        
        self.combined_insights: Optional[Dict[str, Any]] = None
        self.recommendations: Optional[List[Dict[str, Any]]] = None

    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            cls._instance = DataManager()
        return cls._instance

    def load_dataset(self, file_path: str, dataset_name: str = "Online Retail Dataset", is_sample: bool = False):
        self.current_file_path = file_path
        self.current_dataset_name = dataset_name
        self.is_sample = is_sample

        # 1. Inspect raw CSV
        self.raw_inspection = load_and_inspect_csv(file_path)

        # 2. Automatically run initial preprocessing with standard defaults
        self.preprocess(
            remove_duplicates=True,
            remove_cancellations=True,
            remove_negative_qty=True,
            remove_missing_customers=True,
            remove_zero_price=True,
            handle_outliers=True
        )

    def preprocess(
        self,
        remove_duplicates: bool = True,
        remove_cancellations: bool = True,
        remove_negative_qty: bool = True,
        remove_missing_customers: bool = True,
        remove_zero_price: bool = True,
        handle_outliers: bool = True
    ) -> Dict[str, Any]:
        if not self.current_file_path or not os.path.exists(self.current_file_path):
            raise ValueError("No active dataset loaded.")

        self.cleaned_df, self.preprocessing_summary = preprocess_dataset(
            self.current_file_path,
            remove_duplicates=remove_duplicates,
            remove_cancellations=remove_cancellations,
            remove_negative_qty=remove_negative_qty,
            remove_missing_customers=remove_missing_customers,
            remove_zero_price=remove_zero_price,
            handle_outliers=handle_outliers
        )

        # Run RFM feature engineering
        self.rfm_df, self.rfm_meta = compute_rfm(self.cleaned_df)

        # Run Clustering & Model Comparison (k=4 default)
        self.run_clustering(n_clusters=4)

        # Train Churn Models
        self.train_churn()

        log_action("dataset_preprocessed", {
            "dataset": self.current_dataset_name,
            "final_records": len(self.cleaned_df),
            "customers": self.preprocessing_summary.get("unique_customers")
        })

        return self.preprocessing_summary

    def run_clustering(self, n_clusters: int = 4) -> Dict[str, Any]:
        if self.rfm_df is None or len(self.rfm_df) == 0:
            raise ValueError("RFM features must be computed before clustering.")

        self.clustering_meta = train_and_compare_all_models(self.rfm_df, n_clusters=n_clusters)
        
        # Profile & name segments
        self.segmented_df, self.segment_meta = profile_and_name_clusters(
            self.rfm_df,
            self.clustering_meta["cluster_labels"]
        )

        # Generate Recommendations
        self.recommendations = generate_recommendations(self.segment_meta["segments"])

        # Update combined insights if churn model was already trained
        if self.churn_meta and "customer_probabilities" in self.churn_meta:
            self.combined_insights = generate_combined_insights(
                self.segmented_df,
                self.churn_meta["customer_probabilities"]
            )

        log_action("clustering_executed", {
            "model": self.clustering_meta.get("selected_model"),
            "n_clusters": n_clusters
        })

        return {
            "clustering": self.clustering_meta,
            "segments": self.segment_meta,
            "recommendations": self.recommendations
        }

    def train_churn(self, inactivity_threshold_days: int = 90) -> Dict[str, Any]:
        if self.cleaned_df is None or len(self.cleaned_df) == 0:
            raise ValueError("Cleaned transactional data required for churn training.")

        churn_df, churn_prep_meta = construct_chronological_churn_dataset(
            self.cleaned_df,
            inactivity_threshold_days=inactivity_threshold_days
        )

        if churn_df is None or "error" in churn_prep_meta:
            self.churn_meta = {
                "error": churn_prep_meta.get("error", "Unable to construct chronological churn labels"),
                "details": churn_prep_meta.get("details", "")
            }
            return self.churn_meta

        self.churn_df = churn_df
        self.churn_meta = train_churn_models(self.churn_df)
        self.churn_meta["prep_metadata"] = churn_prep_meta

        # Compute Combined Insights
        if self.segmented_df is not None:
            self.combined_insights = generate_combined_insights(
                self.segmented_df,
                self.churn_meta["customer_probabilities"]
            )

        log_action("churn_model_trained", {
            "best_model": self.churn_meta.get("best_model"),
            "f1_score": self.churn_meta.get("model_comparison", [{}])[0].get("f1_score")
        })

        return self.churn_meta

    def get_customers(
        self,
        segment: Optional[str] = None,
        min_spend: Optional[float] = None,
        max_spend: Optional[float] = None,
        min_frequency: Optional[int] = None,
        search: Optional[str] = None,
        sort_by: str = "monetary",
        sort_order: str = "desc",
        page: int = 1,
        page_size: int = 25
    ) -> Dict[str, Any]:
        if self.segmented_df is None:
            return {"customers": [], "total_count": 0, "page": page, "total_pages": 0}

        df = self.segmented_df.copy()

        # Add Churn Probability if available
        churn_map = {}
        if self.churn_meta and "customer_probabilities" in self.churn_meta:
            churn_map = {str(x["customer_id"]): x for x in self.churn_meta["customer_probabilities"]}

        # Filters
        if segment and isinstance(segment, str) and segment.lower() != "all":
            df = df[df['segment'].str.lower() == segment.lower()]

        if min_spend is not None and isinstance(min_spend, (int, float)):
            df = df[df['monetary'] >= min_spend]

        if max_spend is not None and isinstance(max_spend, (int, float)):
            df = df[df['monetary'] <= max_spend]

        if min_frequency is not None and isinstance(min_frequency, int):
            df = df[df['frequency'] >= min_frequency]

        if search and isinstance(search, str):
            s = str(search).strip().lower()
            df = df[df['CustomerID'].astype(str).str.lower().str.contains(s)]

        # Sorting
        ascending = (sort_order.lower() == "asc")
        if sort_by in df.columns:
            df = df.sort_values(by=sort_by, ascending=ascending)
        else:
            df = df.sort_values(by='monetary', ascending=False)

        total_count = len(df)
        total_pages = max(1, (total_count + page_size - 1) // page_size)
        start_idx = (page - 1) * page_size
        end_idx = start_idx + page_size

        page_records = df.iloc[start_idx:end_idx].to_dict(orient='records')
        total_revenue = self.segmented_df['monetary'].sum() if len(self.segmented_df) > 0 else 1.0

        results = []
        for r in page_records:
            cid = str(r['CustomerID'])
            c_churn = churn_map.get(cid, {})
            churn_prob = c_churn.get("churn_probability", None)
            risk_tier = c_churn.get("risk_tier", "Unassessed")

            results.append({
                "customer_id": cid,
                "segment": r.get("segment", "Unknown"),
                "recency": int(r.get("recency", 0)),
                "frequency": int(r.get("frequency", 0)),
                "monetary": round(float(r.get("monetary", 0)), 2),
                "aov": round(float(r.get("aov", 0)), 2),
                "r_score": int(r.get("r_score", 1)),
                "f_score": int(r.get("f_score", 1)),
                "m_score": int(r.get("m_score", 1)),
                "rfm_score": str(r.get("rfm_score", "111")),
                "revenue_contribution_pct": round((float(r.get("monetary", 0)) / total_revenue) * 100, 3),
                "churn_probability": churn_prob,
                "risk_tier": risk_tier,
                "tenure": int(r.get("tenure", 0))
            })

        return {
            "customers": results,
            "total_count": total_count,
            "page": page,
            "page_size": page_size,
            "total_pages": total_pages
        }

    def get_customer_profile(self, customer_id: str) -> Optional[Dict[str, Any]]:
        if self.segmented_df is None or self.cleaned_df is None:
            return None

        c_match = self.segmented_df[self.segmented_df['CustomerID'].astype(str) == str(customer_id)]
        if len(c_match) == 0:
            return None

        c_row = c_match.iloc[0]
        # Get purchase history from cleaned transactions
        cust_tx = self.cleaned_df[self.cleaned_df['CustomerID'].astype(str) == str(customer_id)]
        
        # Sort transactions descending
        cust_tx = cust_tx.sort_values(by='InvoiceDate', ascending=False)
        tx_history = []
        for _, tx in cust_tx.head(20).iterrows():
            tx_history.append({
                "invoice_no": str(tx.get('InvoiceNo', '')),
                "stock_code": str(tx.get('StockCode', '')),
                "description": str(tx.get('Description', '')),
                "quantity": int(tx.get('Quantity', 0)),
                "unit_price": round(float(tx.get('UnitPrice', 0)), 2),
                "total_spend": round(float(tx.get('LineTotal', 0)), 2),
                "invoice_date": tx['InvoiceDate'].strftime('%Y-%m-%d %H:%M:%S') if pd.notnull(tx.get('InvoiceDate')) else '',
                "country": str(tx.get('Country', ''))
            })

        churn_prob = None
        risk_tier = "Unassessed"
        if self.churn_meta and "customer_probabilities" in self.churn_meta:
            for p in self.churn_meta["customer_probabilities"]:
                if str(p["customer_id"]) == str(customer_id):
                    churn_prob = p["churn_probability"]
                    risk_tier = p["risk_tier"]
                    break

        total_rev = self.segmented_df['monetary'].sum()

        return {
            "customer_id": str(customer_id),
            "segment": str(c_row.get('segment', 'Unknown')),
            "recency": int(c_row.get('recency', 0)),
            "frequency": int(c_row.get('frequency', 0)),
            "monetary": round(float(c_row.get('monetary', 0)), 2),
            "aov": round(float(c_row.get('aov', 0)), 2),
            "r_score": int(c_row.get('r_score', 1)),
            "f_score": int(c_row.get('f_score', 1)),
            "m_score": int(c_row.get('m_score', 1)),
            "rfm_score": str(c_row.get('rfm_score', "111")),
            "revenue_contribution_pct": round((float(c_row.get('monetary', 0)) / total_rev) * 100, 3) if total_rev > 0 else 0,
            "churn_probability": churn_prob,
            "risk_tier": risk_tier,
            "tenure_days": int(c_row.get('tenure', 0)),
            "transactions_count": len(cust_tx),
            "transaction_history": tx_history
        }

    def generate_pdf(self) -> str:
        return generate_pdf_report(
            summary_data=self.preprocessing_summary,
            rfm_meta=self.rfm_meta,
            clustering_meta=self.clustering_meta,
            segment_meta=self.segment_meta,
            churn_meta=self.churn_meta,
            recommendations=self.recommendations or []
        )
