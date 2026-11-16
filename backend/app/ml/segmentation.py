import pandas as pd
import numpy as np
from typing import Dict, Any, List, Tuple

SEGMENT_METADATA = {
    "Champions": {
        "color": "#10B981", # Emerald
        "badge_bg": "#ECFDF5",
        "badge_text": "#047857",
        "importance": "Critical (Highest Value)",
        "behavior": "High purchase frequency, exceptional lifetime spend, and recent brand engagement. Key brand advocates.",
        "strategy": "VIP rewards, exclusive perks, early access to new lines, priority customer care."
    },
    "Loyal Customers": {
        "color": "#3B82F6", # Blue
        "badge_bg": "#EFF6FF",
        "badge_text": "#1D4ED8",
        "importance": "High",
        "behavior": "Consistently repeat purchases over extended periods with dependable average basket size.",
        "strategy": "Tiered membership rewards, personalized upsells, referral bonuses."
    },
    "Potential Loyalists": {
        "color": "#6366F1", # Indigo
        "badge_bg": "#EEF2FF",
        "badge_text": "#4338CA",
        "importance": "Moderate - Growth Opportunity",
        "behavior": "Recent customers with multiple transactions and moderate spending. High trajectory potential.",
        "strategy": "Targeted product recommendations, second-purchase incentives, cross-sell bundles."
    },
    "Big Spenders": {
        "color": "#8B5CF6", # Purple
        "badge_bg": "#F5F3FF",
        "badge_text": "#6D28D9",
        "importance": "High Revenue Impact",
        "behavior": "Substantial transaction amounts but modest transaction frequency. Premium buyers.",
        "strategy": "High-ticket item alerts, premium tier services, dedicated account consultation."
    },
    "New Customers": {
        "color": "#06B6D4", # Cyan
        "badge_bg": "#ECFEFF",
        "badge_text": "#0E7490",
        "importance": "Moderate - Onboarding Priority",
        "behavior": "Recent initial transactions with low historical frequency. Early in relationship lifecycle.",
        "strategy": "Welcome series, onboarding education, first-repeat incentive voucher."
    },
    "At-Risk Customers": {
        "color": "#F59E0B", # Amber
        "badge_bg": "#FFFBEB",
        "badge_text": "#B45309",
        "importance": "High Churn Risk",
        "behavior": "Formerly frequent or high spenders who have ceased purchasing for an extended duration.",
        "strategy": "Win-back email flows, reactivation discounts, feedback surveys to uncover friction."
    },
    "Hibernating Customers": {
        "color": "#EF4444", # Rose/Red
        "badge_bg": "#FEF2F2",
        "badge_text": "#B91C1C",
        "importance": "Low - Selective Re-engagement",
        "behavior": "Very long dormancy period, minimal frequency, low historical spend.",
        "strategy": "Automated low-cost win-back triggers; suppress expensive outreach to preserve margin."
    }
}

def profile_and_name_clusters(rfm_df: pd.DataFrame, cluster_labels: List[int]) -> Tuple[pd.DataFrame, Dict[str, Any]]:
    df = rfm_df.copy()
    df['cluster'] = cluster_labels
    
    total_customers = len(df)
    total_revenue = df['monetary'].sum()
    
    # Calculate dataset-wide medians as reference baselines
    med_r = df['recency'].median()
    med_f = df['frequency'].median()
    med_m = df['monetary'].median()
    
    unique_clusters = sorted(df['cluster'].unique())
    cluster_profiles = []
    
    # Track used names so we don't assign exact duplicates if possible
    assigned_names = []
    
    for c in unique_clusters:
        c_df = df[df['cluster'] == c]
        c_count = len(c_df)
        c_revenue = c_df['monetary'].sum()
        
        avg_r = c_df['recency'].mean()
        avg_f = c_df['frequency'].mean()
        avg_m = c_df['monetary'].mean()
        
        cluster_profiles.append({
            "cluster_id": int(c),
            "count": c_count,
            "revenue": c_revenue,
            "avg_recency": avg_r,
            "avg_frequency": avg_f,
            "avg_monetary": avg_m,
            "median_recency": c_df['recency'].median(),
            "median_frequency": c_df['frequency'].median(),
            "median_monetary": c_df['monetary'].median()
        })
        
    # Dynamically assign meaningful segment name based on relative rankings
    # Rank by Recency ascending (lower is better/more recent), Frequency desc, Monetary desc
    cluster_profiles.sort(key=lambda x: (x['avg_recency'], -x['avg_frequency'], -x['avg_monetary']))
    
    cluster_to_segment = {}
    
    for i, prof in enumerate(cluster_profiles):
        c_id = prof['cluster_id']
        r = prof['avg_recency']
        f = prof['avg_frequency']
        m = prof['avg_monetary']
        
        # Segment labeling heuristics based on actual RFM characteristics
        candidate = None
        if r <= med_r and f >= med_f and m >= med_m:
            candidate = "Champions" if m > med_m * 1.5 else "Loyal Customers"
        elif r <= med_r and f <= med_f and m > med_m * 1.4:
            candidate = "Big Spenders"
        elif r <= med_r and f <= 2:
            candidate = "New Customers"
        elif r <= med_r and f > 1:
            candidate = "Potential Loyalists"
        elif r > med_r and f >= med_f:
            candidate = "At-Risk Customers"
        else:
            candidate = "Hibernating Customers"
            
        # Ensure distinct meaningful names where possible
        if candidate in assigned_names:
            fallbacks = ["Loyal Customers", "Potential Loyalists", "At-Risk Customers", "Big Spenders", "Hibernating Customers", "Champions"]
            for fb in fallbacks:
                if fb not in assigned_names:
                    candidate = fb
                    break
                    
        assigned_names.append(candidate)
        cluster_to_segment[c_id] = candidate

    # Apply assigned names to dataframe
    df['segment'] = df['cluster'].map(cluster_to_segment)
    
    # Calculate detailed segment summaries
    segments_summary = []
    for c_id, seg_name in cluster_to_segment.items():
        s_df = df[df['cluster'] == c_id]
        meta = SEGMENT_METADATA.get(seg_name, SEGMENT_METADATA["Loyal Customers"])
        
        s_count = len(s_df)
        s_rev = float(s_df['monetary'].sum())
        
        segments_summary.append({
            "cluster_id": int(c_id),
            "name": seg_name,
            "color": meta["color"],
            "badge_bg": meta["badge_bg"],
            "badge_text": meta["badge_text"],
            "customer_count": s_count,
            "customer_pct": round((s_count / total_customers) * 100, 2) if total_customers > 0 else 0,
            "total_revenue": round(s_rev, 2),
            "revenue_contribution_pct": round((s_rev / total_revenue) * 100, 2) if total_revenue > 0 else 0,
            "avg_recency_days": round(float(s_df['recency'].mean()), 1),
            "avg_frequency_orders": round(float(s_df['frequency'].mean()), 1),
            "avg_monetary_spend": round(float(s_df['monetary'].mean()), 2),
            "avg_order_value": round(float(s_df['aov'].mean()), 2),
            "importance": meta["importance"],
            "behavior": meta["behavior"],
            "strategy": meta["strategy"]
        })
        
    # Sort segments by total revenue descending
    segments_summary.sort(key=lambda x: x['total_revenue'], reverse=True)
    
    return df, {
        "segments": segments_summary,
        "total_customers": total_customers,
        "total_revenue": round(float(total_revenue), 2)
    }
