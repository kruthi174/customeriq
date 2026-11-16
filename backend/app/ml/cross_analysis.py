import pandas as pd
from typing import Dict, Any, List

COMPARISON_MATRIX = [
    {
        "dimension": "Learning Paradigm",
        "segmentation": "Unsupervised Machine Learning",
        "churn": "Supervised Machine Learning"
    },
    {
        "dimension": "Primary Objective",
        "segmentation": "Discover natural behavioral clusters and latent customer archetypes without ground-truth labels.",
        "churn": "Predict binary departure event (P(Churn)) within a future 90-day inactivity horizon."
    },
    {
        "dimension": "Input Feature Space",
        "segmentation": "Standardized RFM vectors: Recency (days), Frequency (transactions), Monetary spend ($).",
        "churn": "Chronological pre-cutoff features: cadence, basket diversity, interval drift, order variance."
    },
    {
        "dimension": "Model Output",
        "segmentation": "Discrete cohort assignments (e.g., Champions, Loyal Customers, At-Risk).",
        "churn": "Continuous probability score [0.0 - 1.0] and risk classifications (High, Medium, Low)."
    },
    {
        "dimension": "Core Algorithms",
        "segmentation": "K-Means++, Agglomerative Hierarchical (Ward), DBSCAN.",
        "churn": "Random Forest, Gradient Boosting, L2 Logistic Regression."
    },
    {
        "dimension": "Evaluation Metrics",
        "segmentation": "Silhouette Score, Davies-Bouldin Index, Calinski-Harabasz Score, Elbow WCSS.",
        "churn": "ROC-AUC, Precision-Recall Curve, F1-Score, Confusion Matrix."
    },
    {
        "dimension": "Strategic Application",
        "segmentation": "Market positioning, catalog curation, personalized lifecycle journeys, tier benefits.",
        "churn": "High-urgency proactive retention alerts, win-back incentives, salvage discount campaigns."
    },
    {
        "dimension": "Primary Advantage",
        "segmentation": "Requires zero historical labels; immediately segments any transactional population.",
        "churn": "Quantifies exact individual departure risk with actionable probability calibration."
    },
    {
        "dimension": "Core Limitation",
        "segmentation": "Cluster boundaries can be heuristic; does not forecast time-to-attrition directly.",
        "churn": "Strictly requires mature longitudinal history and careful cutoff windows to prevent leakage."
    }
]

def generate_combined_insights(
    segmented_rfm_df: pd.DataFrame,
    churn_probabilities: List[Dict[str, Any]]
) -> Dict[str, Any]:
    # Build churn lookup by customer_id
    churn_map = {str(item["customer_id"]): item for item in churn_probabilities}
    
    cross_data = []
    matrix_counts = {}
    
    for _, row in segmented_rfm_df.iterrows():
        cid = str(row['CustomerID'])
        seg = row.get('segment', 'Unknown')
        
        churn_info = churn_map.get(cid, None)
        churn_prob = churn_info['churn_probability'] if churn_info else 0.5
        risk_tier = churn_info['risk_tier'] if churn_info else 'Medium'
        
        cross_data.append({
            "customer_id": cid,
            "segment": seg,
            "recency": float(row['recency']),
            "frequency": int(row['frequency']),
            "monetary": float(row['monetary']),
            "churn_probability": churn_prob,
            "risk_tier": risk_tier
        })
        
        key = (seg, risk_tier)
        matrix_counts[key] = matrix_counts.get(key, 0) + 1

    # Cross-tabulation grid
    unique_segments = sorted(list(set(row.get('segment', 'Unknown') for _, row in segmented_rfm_df.iterrows())))
    grid = []
    for s in unique_segments:
        high = matrix_counts.get((s, "High"), 0)
        med = matrix_counts.get((s, "Medium"), 0)
        low = matrix_counts.get((s, "Low"), 0)
        total = high + med + low
        grid.append({
            "segment": s,
            "high_risk": high,
            "medium_risk": med,
            "low_risk": low,
            "total": total,
            "high_risk_pct": round((high / total) * 100, 1) if total > 0 else 0
        })

    # High Value Retention Queue (Champions / Loyal / Big Spenders with High or Medium Churn Risk)
    priority_retention = [
        item for item in cross_data
        if item["segment"] in ["Champions", "Loyal Customers", "Big Spenders"] and item["risk_tier"] in ["High", "Medium"]
    ]
    priority_retention.sort(key=lambda x: (x["risk_tier"] == "High", x["monetary"]), reverse=True)

    # Actionable summary findings
    urgent_champions = len([x for x in priority_retention if x["segment"] == "Champions" and x["risk_tier"] == "High"])
    urgent_loyal = len([x for x in priority_retention if x["segment"] == "Loyal Customers" and x["risk_tier"] == "High"])
    urgent_spenders = len([x for x in priority_retention if x["segment"] == "Big Spenders" and x["risk_tier"] == "High"])
    
    total_at_risk_revenue = sum(x["monetary"] for x in priority_retention if x["risk_tier"] == "High")

    return {
        "comparison_matrix": COMPARISON_MATRIX,
        "cross_tabulation": grid,
        "priority_retention_queue": priority_retention[:20], # top 20 urgent accounts
        "total_urgent_vip_count": len(priority_retention),
        "total_revenue_at_stake": round(float(total_at_risk_revenue), 2),
        "strategic_takeaway": (
            f"Detected {urgent_champions} Champions, {urgent_loyal} Loyal Customers, and {urgent_spenders} Big Spenders "
            f"exhibiting high statistical churn risk. Total VIP revenue at stake is ${total_at_risk_revenue:,.2f}. "
            "Prioritize these accounts in executive win-back campaigns immediately."
        )
    }
