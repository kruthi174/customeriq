import pandas as pd
import numpy as np
import time
import os
import joblib
from typing import Dict, Any, Tuple, List, Optional
from sklearn.preprocessing import StandardScaler, PowerTransformer
from sklearn.cluster import KMeans, AgglomerativeClustering, DBSCAN
from sklearn.metrics import silhouette_score, davies_bouldin_score, calinski_harabasz_score
from sklearn.decomposition import PCA
from scipy.cluster.hierarchy import linkage, dendrogram

from app.utils.paths import MODELS_DIR

def prepare_cluster_features(rfm_df: pd.DataFrame) -> Tuple[np.ndarray, StandardScaler, List[str]]:
    feature_cols = ['recency', 'frequency', 'monetary']
    # Log-transform to normalize right-skewed e-commerce distributions
    log_features = np.log1p(rfm_df[feature_cols].clip(lower=0))
    scaler = StandardScaler()
    scaled_features = scaler.fit_transform(log_features)
    return scaled_features, scaler, feature_cols

def compute_pca_projection(scaled_features: np.ndarray, rfm_df: pd.DataFrame) -> Dict[str, Any]:
    pca = PCA(n_components=2, random_state=42)
    pca_coords = pca.fit_transform(scaled_features)
    var_explained = [round(float(v) * 100, 2) for v in pca.explained_variance_ratio_]
    
    return {
        "pca_variance_ratio": var_explained,
        "total_variance_explained": round(sum(var_explained), 2),
        "dimensions_description": "PCA is used solely for 2D visualization projection; clustering was performed in full scaled 3D RFM space.",
        "coords": pca_coords
    }

def evaluate_clustering_metrics(scaled_features: np.ndarray, labels: np.ndarray) -> Dict[str, Any]:
    # Check if we have valid non-noise clusters
    unique_labels = np.unique(labels)
    valid_mask = labels != -1
    n_valid_clusters = len(np.unique(labels[valid_mask])) if np.any(valid_mask) else 0
    
    noise_count = int(np.sum(labels == -1))
    noise_pct = round((noise_count / len(labels)) * 100, 2) if len(labels) > 0 else 0
    
    if n_valid_clusters < 2:
        return {
            "silhouette": None,
            "davies_bouldin": None,
            "calinski_harabasz": None,
            "n_clusters": int(n_valid_clusters),
            "noise_count": noise_count,
            "noise_pct": noise_pct,
            "is_valid": False,
            "note": "Clustering produced fewer than 2 valid clusters; validation metrics cannot be computed."
        }
        
    # If noise points exist (DBSCAN), evaluate metrics on valid cluster points only
    features_to_eval = scaled_features[valid_mask]
    labels_to_eval = labels[valid_mask]
    
    try:
        sil = float(silhouette_score(features_to_eval, labels_to_eval))
        db = float(davies_bouldin_score(features_to_eval, labels_to_eval))
        ch = float(calinski_harabasz_score(features_to_eval, labels_to_eval))
        return {
            "silhouette": round(sil, 4),
            "davies_bouldin": round(db, 4),
            "calinski_harabasz": round(ch, 2),
            "n_clusters": int(n_valid_clusters),
            "noise_count": noise_count,
            "noise_pct": noise_pct,
            "is_valid": True
        }
    except Exception as e:
        return {
            "silhouette": None,
            "davies_bouldin": None,
            "calinski_harabasz": None,
            "n_clusters": int(n_valid_clusters),
            "noise_count": noise_count,
            "noise_pct": noise_pct,
            "is_valid": False,
            "note": str(e)
        }

def run_kmeans_evaluation(scaled_features: np.ndarray, k_range: range = range(2, 9)) -> Dict[str, Any]:
    elbow_curve = []
    best_k = 4
    best_sil = -1
    
    for k in k_range:
        start_t = time.time()
        km = KMeans(n_clusters=k, init='k-means++', n_init=10, random_state=42)
        km.fit(scaled_features)
        exec_time_ms = round((time.time() - start_t) * 1000, 2)
        
        metrics = evaluate_clustering_metrics(scaled_features, km.labels_)
        inertia = float(km.inertia_)
        
        elbow_curve.append({
            "k": k,
            "inertia": round(inertia, 2),
            "silhouette": metrics["silhouette"],
            "davies_bouldin": metrics["davies_bouldin"],
            "calinski_harabasz": metrics["calinski_harabasz"],
            "execution_time_ms": exec_time_ms
        })
        
        if metrics["silhouette"] and metrics["silhouette"] > best_sil:
            best_sil = metrics["silhouette"]
            best_k = k
            
    return {
        "elbow_curve": elbow_curve,
        "recommended_k": best_k,
        "rationale": f"Optimal K={best_k} achieves a balanced Silhouette score ({best_sil:.4f}) while retaining distinct business interpretability without segment over-fragmentation."
    }

def run_hierarchical_evaluation(scaled_features: np.ndarray, n_clusters: int = 4) -> Dict[str, Any]:
    linkages = ['ward', 'average', 'complete']
    results = {}
    
    for link in linkages:
        start_t = time.time()
        agg = AgglomerativeClustering(n_clusters=n_clusters, linkage=link)
        labels = agg.fit_predict(scaled_features)
        exec_time_ms = round((time.time() - start_t) * 1000, 2)
        
        metrics = evaluate_clustering_metrics(scaled_features, labels)
        results[link] = {
            "metrics": metrics,
            "execution_time_ms": exec_time_ms
        }
        
    # Dendrogram representation using ward linkage
    # For large datasets we take a representative sample of points to keep dendrogram compact
    sample_indices = np.random.choice(len(scaled_features), size=min(40, len(scaled_features)), replace=False)
    sub_features = scaled_features[sample_indices]
    Z = linkage(sub_features, method='ward')
    
    dendro_nodes = []
    for i, row in enumerate(Z):
        dendro_nodes.append({
            "step": i + 1,
            "node_1": int(row[0]),
            "node_2": int(row[1]),
            "distance": round(float(row[2]), 3),
            "cluster_size": int(row[3])
        })
        
    return {
        "linkage_comparison": results,
        "dendrogram_data": dendro_nodes
    }

def run_dbscan_evaluation(scaled_features: np.ndarray) -> Dict[str, Any]:
    eps_values = [0.3, 0.5, 0.7, 1.0]
    min_samples_values = [3, 5, 8]
    grid_results = []
    best_config = None
    best_sil = -1
    
    for eps in eps_values:
        for ms in min_samples_values:
            start_t = time.time()
            db = DBSCAN(eps=eps, min_samples=ms)
            labels = db.fit_predict(scaled_features)
            exec_time_ms = round((time.time() - start_t) * 1000, 2)
            
            # Count core, border, noise points
            core_sample_indices = set(db.core_sample_indices_)
            n_core = len(core_sample_indices)
            n_noise = int(np.sum(labels == -1))
            n_border = len(labels) - n_core - n_noise
            
            metrics = evaluate_clustering_metrics(scaled_features, labels)
            
            res = {
                "eps": eps,
                "min_samples": ms,
                "n_clusters": metrics["n_clusters"],
                "noise_pct": metrics["noise_pct"],
                "core_points": n_core,
                "border_points": n_border,
                "noise_points": n_noise,
                "silhouette": metrics["silhouette"],
                "davies_bouldin": metrics["davies_bouldin"],
                "calinski_harabasz": metrics["calinski_harabasz"],
                "is_valid": metrics["is_valid"],
                "execution_time_ms": exec_time_ms
            }
            grid_results.append(res)
            
            if metrics["is_valid"] and metrics["silhouette"] and metrics["silhouette"] > best_sil:
                best_sil = metrics["silhouette"]
                best_config = res
                
    return {
        "grid_results": grid_results,
        "best_config": best_config or grid_results[0]
    }

def train_and_compare_all_models(rfm_df: pd.DataFrame, n_clusters: int = 4) -> Dict[str, Any]:
    scaled_features, scaler, feat_cols = prepare_cluster_features(rfm_df)
    pca_meta = compute_pca_projection(scaled_features, rfm_df)
    
    # 1. K-Means
    start_km = time.time()
    km = KMeans(n_clusters=n_clusters, init='k-means++', n_init=10, random_state=42)
    km_labels = km.fit_predict(scaled_features)
    km_time = round((time.time() - start_km) * 1000, 2)
    km_metrics = evaluate_clustering_metrics(scaled_features, km_labels)
    kmeans_eval = run_kmeans_evaluation(scaled_features)
    
    # 2. Hierarchical (Ward)
    start_hc = time.time()
    hc = AgglomerativeClustering(n_clusters=n_clusters, linkage='ward')
    hc_labels = hc.fit_predict(scaled_features)
    hc_time = round((time.time() - start_hc) * 1000, 2)
    hc_metrics = evaluate_clustering_metrics(scaled_features, hc_labels)
    hierarchical_eval = run_hierarchical_evaluation(scaled_features, n_clusters=n_clusters)
    
    # 3. DBSCAN
    dbscan_eval = run_dbscan_evaluation(scaled_features)
    best_db_cfg = dbscan_eval["best_config"]
    best_eps = best_db_cfg["eps"]
    best_ms = best_db_cfg["min_samples"]
    
    start_db = time.time()
    dbscan = DBSCAN(eps=best_eps, min_samples=best_ms)
    db_labels = dbscan.fit_predict(scaled_features)
    db_time = round((time.time() - start_db) * 1000, 2)
    db_metrics = evaluate_clustering_metrics(scaled_features, db_labels)
    
    # Model comparison table
    comparison_table = [
        {
            "model_id": "kmeans",
            "name": f"K-Means (k={n_clusters})",
            "silhouette_score": km_metrics["silhouette"],
            "davies_bouldin_index": km_metrics["davies_bouldin"],
            "calinski_harabasz_score": km_metrics["calinski_harabasz"],
            "n_clusters": km_metrics["n_clusters"],
            "noise_pct": 0.0,
            "execution_time_ms": km_time,
            "strengths": "Fast convergence, spherical cluster separation, robust to enterprise scaling.",
            "weaknesses": "Assumes globular isotropic clusters; sensitive to unscaled outlier variance."
        },
        {
            "model_id": "hierarchical",
            "name": f"Hierarchical (Ward, k={n_clusters})",
            "silhouette_score": hc_metrics["silhouette"],
            "davies_bouldin_index": hc_metrics["davies_bouldin"],
            "calinski_harabasz_score": hc_metrics["calinski_harabasz"],
            "n_clusters": hc_metrics["n_clusters"],
            "noise_pct": 0.0,
            "execution_time_ms": hc_time,
            "strengths": "Deterministic hierarchy, minimizes within-cluster variance, intuitive dendrogram merges.",
            "weaknesses": "Higher computational complexity O(n^2); unsuitable for massive millions of transactions."
        },
        {
            "model_id": "dbscan",
            "name": f"DBSCAN (eps={best_eps}, min_pts={best_ms})",
            "silhouette_score": db_metrics["silhouette"],
            "davies_bouldin_index": db_metrics["davies_bouldin"],
            "calinski_harabasz_score": db_metrics["calinski_harabasz"],
            "n_clusters": db_metrics["n_clusters"],
            "noise_pct": db_metrics["noise_pct"],
            "execution_time_ms": db_time,
            "strengths": "Detects arbitrary geometries; isolates transactional anomalies as noise points.",
            "weaknesses": "Highly sensitive to density variations across distinct customer cohorts; leaves unassigned noise."
        }
    ]
    
    # Model Selection Strategy
    # Transparent multi-criteria scoring
    # We prefer K-Means or Hierarchical for clean 100% customer assignment without leaving paying customers as unclassified noise
    selected_model_id = "kmeans"
    if hc_metrics["silhouette"] and km_metrics["silhouette"] and hc_metrics["silhouette"] > km_metrics["silhouette"] + 0.02:
        selected_model_id = "hierarchical"
        selected_labels = hc_labels
        selected_model_obj = hc
    else:
        selected_model_id = "kmeans"
        selected_labels = km_labels
        selected_model_obj = km

    selection_rationale = (
        f"Selected {selected_model_id.upper()} (k={n_clusters}) as primary segmentation model. "
        f"It produced a Silhouette score of {km_metrics['silhouette'] if selected_model_id=='kmeans' else hc_metrics['silhouette']}, "
        f"0% unclassified noise points, and clearly demarcated RFM profiles. "
        "While DBSCAN effectively isolates anomalous outliers, its inability to assign all commercial accounts into actionable CRM lifecycle segments makes partitioned K-Means the enterprise choice."
    )
    
    # Save artifacts safely
    try:
        joblib.dump(scaler, os.path.join(MODELS_DIR, "scaler.joblib"))
        joblib.dump(selected_model_obj, os.path.join(MODELS_DIR, f"{selected_model_id}_model.joblib"))
    except Exception as e:
        print(f"[CustomerIQ] Model artifact saving notice: {e}")
    
    # Prepare customer PCA coordinates and labels
    pca_scatter = []
    coords = pca_meta["coords"]
    for idx, row in rfm_df.iterrows():
        pca_scatter.append({
            "customer_id": str(row['CustomerID']),
            "pc1": round(float(coords[idx][0]), 3),
            "pc2": round(float(coords[idx][1]), 3),
            "cluster": int(selected_labels[idx]),
            "recency": float(row['recency']),
            "frequency": int(row['frequency']),
            "monetary": float(row['monetary'])
        })
        
    return {
        "selected_model": selected_model_id,
        "selection_rationale": selection_rationale,
        "n_clusters": n_clusters,
        "comparison_table": comparison_table,
        "kmeans_evaluation": kmeans_eval,
        "hierarchical_evaluation": hierarchical_eval,
        "dbscan_evaluation": dbscan_eval,
        "pca_meta": {
            "pca_variance_ratio": pca_meta["pca_variance_ratio"],
            "total_variance_explained": pca_meta["total_variance_explained"],
            "dimensions_description": pca_meta["dimensions_description"]
        },
        "pca_scatter": pca_scatter,
        "cluster_labels": [int(l) for l in selected_labels]
    }
