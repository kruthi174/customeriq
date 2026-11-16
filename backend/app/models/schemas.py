from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

class PreprocessRequest(BaseModel):
    remove_duplicates: bool = True
    remove_cancellations: bool = True
    remove_negative_qty: bool = True
    remove_missing_customers: bool = True
    remove_zero_price: bool = True
    handle_outliers: bool = True
    outlier_method: str = "iqr"  # 'iqr' or 'none'

class ClusteringRequest(BaseModel):
    algorithm: str = "kmeans"  # 'kmeans', 'hierarchical', 'dbscan', or 'all'
    n_clusters: Optional[int] = 4
    linkage: Optional[str] = "ward"
    dbscan_eps: Optional[float] = 0.5
    dbscan_min_samples: Optional[int] = 5

class ChurnTrainRequest(BaseModel):
    model_type: str = "all"  # 'logistic_regression', 'random_forest', 'gradient_boosting', or 'all'
    inactivity_threshold_days: int = 90
    test_size: float = 0.25
    random_state: int = 42

class CustomerFilterRequest(BaseModel):
    segment: Optional[str] = None
    min_spend: Optional[float] = None
    max_spend: Optional[float] = None
    min_frequency: Optional[int] = None
    search: Optional[str] = None
    sort_by: Optional[str] = "monetary"
    sort_order: Optional[str] = "desc"
    page: int = 1
    page_size: int = 25
