import os
import shutil
import io
from datetime import datetime
import pandas as pd
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Query
from fastapi.responses import FileResponse, StreamingResponse
from typing import Optional

from app.services.data_manager import DataManager
from app.models.schemas import PreprocessRequest, ClusteringRequest, ChurnTrainRequest

router = APIRouter(prefix="/api")

@router.get("/health")
def health_check():
    dm = DataManager.get_instance()
    return {
        "status": "healthy",
        "service": "CustomerIQ Analytics Engine",
        "active_dataset": dm.current_dataset_name,
        "is_sample": dm.is_sample,
        "records_loaded": len(dm.cleaned_df) if dm.cleaned_df is not None else 0
    }

@router.post("/upload-dataset")
async def upload_dataset(file: UploadFile = File(...)):
    if not file.filename.endswith(('.csv', '.txt')):
        raise HTTPException(status_code=400, detail="Only CSV files are supported.")
        
    dm = DataManager.get_instance()
    target_path = os.path.join(dm.uploads_dir, file.filename)
    
    with open(target_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    try:
        dm.load_dataset(target_path, dataset_name=file.filename, is_sample=False)
        return {
            "message": "Dataset uploaded and analyzed successfully.",
            "filename": file.filename,
            "raw_inspection": dm.raw_inspection,
            "preprocessing_summary": dm.preprocessing_summary
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process dataset: {str(e)}")

@router.post("/load-sample")
def load_sample_dataset():
    dm = DataManager.get_instance()
    sample_file = dm.sample_path
    if not os.path.exists(sample_file):
        from app.utils.paths import CANDIDATE_DATA_PATHS
        for p in CANDIDATE_DATA_PATHS:
            if os.path.exists(p):
                sample_file = p
                dm.sample_path = p
                break

    if not os.path.exists(sample_file):
        raise HTTPException(status_code=404, detail="Sample dataset file not found on server.")
        
    dm.load_dataset(sample_file, dataset_name="Online Retail Sample (UCI E-Commerce)", is_sample=True)
    return {
        "message": "Sample dataset loaded successfully.",
        "dataset_name": dm.current_dataset_name,
        "is_sample": True,
        "preprocessing_summary": dm.preprocessing_summary
    }

@router.get("/dataset-summary")
def get_dataset_summary():
    dm = DataManager.get_instance()
    if dm.raw_inspection is None:
        sample_file = dm.sample_path
        if not os.path.exists(sample_file):
            from app.utils.paths import CANDIDATE_DATA_PATHS
            for p in CANDIDATE_DATA_PATHS:
                if os.path.exists(p):
                    sample_file = p
                    dm.sample_path = p
                    break
        if os.path.exists(sample_file):
            dm.load_dataset(sample_file, is_sample=True)
        
    return {
        "dataset_name": dm.current_dataset_name,
        "is_sample": dm.is_sample,
        "raw_inspection": dm.raw_inspection,
        "preprocessing_summary": dm.preprocessing_summary
    }

@router.post("/preprocess")
def preprocess_dataset_endpoint(config: PreprocessRequest):
    dm = DataManager.get_instance()
    try:
        summary = dm.preprocess(
            remove_duplicates=config.remove_duplicates,
            remove_cancellations=config.remove_cancellations,
            remove_negative_qty=config.remove_negative_qty,
            remove_missing_customers=config.remove_missing_customers,
            remove_zero_price=config.remove_zero_price,
            handle_outliers=config.handle_outliers
        )
        return {
            "message": "Preprocessing completed successfully.",
            "summary": summary
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/rfm-analysis")
def get_rfm_analysis():
    dm = DataManager.get_instance()
    if dm.rfm_meta is None:
        raise HTTPException(status_code=400, detail="RFM analysis not yet executed. Please upload or load a dataset.")
    return dm.rfm_meta

@router.post("/run-clustering")
def run_clustering_endpoint(req: ClusteringRequest):
    dm = DataManager.get_instance()
    try:
        res = dm.run_clustering(n_clusters=req.n_clusters or 4)
        return res
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/model-comparison")
def get_model_comparison():
    dm = DataManager.get_instance()
    if dm.clustering_meta is None:
        raise HTTPException(status_code=400, detail="Clustering models not yet executed.")
    return {
        "selected_model": dm.clustering_meta.get("selected_model"),
        "selection_rationale": dm.clustering_meta.get("selection_rationale"),
        "comparison_table": dm.clustering_meta.get("comparison_table"),
        "kmeans_evaluation": dm.clustering_meta.get("kmeans_evaluation"),
        "hierarchical_evaluation": dm.clustering_meta.get("hierarchical_evaluation"),
        "dbscan_evaluation": dm.clustering_meta.get("dbscan_evaluation"),
        "pca_meta": dm.clustering_meta.get("pca_meta"),
        "pca_scatter": dm.clustering_meta.get("pca_scatter")
    }

@router.get("/customer-segments")
def get_customer_segments():
    dm = DataManager.get_instance()
    if dm.segment_meta is None:
        raise HTTPException(status_code=400, detail="Segments have not been generated yet.")
    return dm.segment_meta

@router.get("/customer-segments/{segment_name}")
def get_single_segment(segment_name: str):
    dm = DataManager.get_instance()
    if dm.segment_meta is None:
        raise HTTPException(status_code=400, detail="Segments have not been generated yet.")
        
    for seg in dm.segment_meta.get("segments", []):
        if seg["name"].lower() == segment_name.lower():
            # Get customers in this segment
            cust_res = dm.get_customers(segment=seg["name"], page=1, page_size=100)
            return {
                "segment": seg,
                "customers": cust_res["customers"],
                "total_count": cust_res["total_count"]
            }
            
    raise HTTPException(status_code=404, detail=f"Segment '{segment_name}' not found.")

@router.get("/customers")
def get_customers(
    segment: Optional[str] = None,
    min_spend: Optional[float] = None,
    max_spend: Optional[float] = None,
    min_frequency: Optional[int] = None,
    search: Optional[str] = None,
    sort_by: str = "monetary",
    sort_order: str = "desc",
    page: int = 1,
    page_size: int = 25
):
    dm = DataManager.get_instance()
    return dm.get_customers(
        segment=segment,
        min_spend=min_spend,
        max_spend=max_spend,
        min_frequency=min_frequency,
        search=search,
        sort_by=sort_by,
        sort_order=sort_order,
        page=page,
        page_size=page_size
    )

@router.get("/customers/{customer_id}")
def get_customer_profile(customer_id: str):
    dm = DataManager.get_instance()
    profile = dm.get_customer_profile(customer_id)
    if profile is None:
        raise HTTPException(status_code=404, detail=f"Customer '{customer_id}' not found.")
    return profile

@router.get("/business-recommendations")
def get_business_recommendations():
    dm = DataManager.get_instance()
    if dm.recommendations is None:
        raise HTTPException(status_code=400, detail="Recommendations not yet generated.")
    return {
        "recommendations": dm.recommendations,
        "generated_at": datetime.utcnow().isoformat()
    }

@router.post("/train-churn-model")
def train_churn_model(req: ChurnTrainRequest):
    dm = DataManager.get_instance()
    try:
        res = dm.train_churn(inactivity_threshold_days=req.inactivity_threshold_days)
        return res
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/churn-results")
def get_churn_results():
    dm = DataManager.get_instance()
    if dm.churn_meta is None:
        raise HTTPException(status_code=400, detail="Churn model has not been trained yet.")
    return dm.churn_meta

@router.get("/combined-insights")
def get_combined_insights():
    dm = DataManager.get_instance()
    if dm.combined_insights is None:
        # Fallback generate if available
        if dm.segmented_df is not None and dm.churn_meta and "customer_probabilities" in dm.churn_meta:
            from app.ml.cross_analysis import generate_combined_insights
            dm.combined_insights = generate_combined_insights(
                dm.segmented_df,
                dm.churn_meta["customer_probabilities"]
            )
        else:
            raise HTTPException(status_code=400, detail="Both customer segments and churn predictions are required for combined analysis.")
    return dm.combined_insights

@router.get("/export-report")
def export_report_endpoint():
    dm = DataManager.get_instance()
    try:
        pdf_file = dm.generate_pdf()
        if not os.path.exists(pdf_file):
            raise HTTPException(status_code=500, detail="PDF generation failed.")
        return FileResponse(
            pdf_file,
            media_type="application/pdf",
            filename="CustomerIQ_Executive_Analytics_Report.pdf"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating PDF report: {str(e)}")

@router.get("/export-csv/{dataset_type}")
def export_csv_endpoint(dataset_type: str):
    dm = DataManager.get_instance()
    
    if dataset_type == "cleaned":
        if dm.cleaned_df is None:
            raise HTTPException(status_code=400, detail="Cleaned dataset not available.")
        stream = io.StringIO()
        dm.cleaned_df.to_csv(stream, index=False)
        filename = "customeriq_cleaned_transactions.csv"
    elif dataset_type == "rfm":
        if dm.rfm_df is None:
            raise HTTPException(status_code=400, detail="RFM data not available.")
        stream = io.StringIO()
        dm.rfm_df.to_csv(stream, index=False)
        filename = "customeriq_rfm_metrics.csv"
    elif dataset_type == "customers":
        if dm.segmented_df is None:
            raise HTTPException(status_code=400, detail="Customer segments not available.")
        stream = io.StringIO()
        # Merge churn probability if available
        df_export = dm.segmented_df.copy()
        if dm.churn_meta and "customer_probabilities" in dm.churn_meta:
            churn_lookup = {str(x["customer_id"]): x["churn_probability"] for x in dm.churn_meta["customer_probabilities"]}
            df_export['churn_probability'] = df_export['CustomerID'].astype(str).map(churn_lookup)
        df_export.to_csv(stream, index=False)
        filename = "customeriq_customer_segments_directory.csv"
    else:
        raise HTTPException(status_code=400, detail="Invalid export type. Supported: 'cleaned', 'rfm', 'customers'.")
        
    response = StreamingResponse(iter([stream.getvalue()]), media_type="text/csv")
    response.headers["Content-Disposition"] = f"attachment; filename={filename}"
    return response
