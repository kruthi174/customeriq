import os
import sys

# Add backend directory to sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.services.data_manager import DataManager

def run_test():
    print("[TEST] Initializing DataManager...")
    dm = DataManager.get_instance()
    print(f"[TEST] Sample dataset path: {dm.sample_path} (exists={os.path.exists(dm.sample_path)})")
    
    print("[TEST] Loading sample dataset and running end-to-end pipeline...")
    dm.load_dataset(dm.sample_path, is_sample=True)

    print(f"[TEST] Clean records: {len(dm.cleaned_df)}")
    print(f"[TEST] Unique customers: {dm.preprocessing_summary['unique_customers']}")
    print(f"[TEST] Total revenue: ${dm.preprocessing_summary['total_revenue']:,.2f}")
    
    print(f"[TEST] Clustering evaluation:")
    print(f"       Selected model: {dm.clustering_meta['selected_model']}")
    print(f"       Comparison table: {len(dm.clustering_meta['comparison_table'])} algorithms compared")
    for row in dm.clustering_meta['comparison_table']:
        print(f"       - {row['name']}: Silhouette={row['silhouette_score']}, DB={row['davies_bouldin_index']}, Clusters={row['n_clusters']}")

    print(f"[TEST] Segments generated: {len(dm.segment_meta['segments'])}")
    for s in dm.segment_meta['segments']:
        print(f"       - {s['name']}: {s['customer_count']} customers ({s['customer_pct']}%), Revenue: ${s['total_revenue']:,.2f} ({s['revenue_contribution_pct']}%)")

    print(f"[TEST] Churn modeling:")
    print(f"       Best model: {dm.churn_meta['best_model_name']}")
    for m in dm.churn_meta['model_comparison']:
        print(f"       - {m['name']}: Accuracy={m['accuracy']}, F1={m['f1_score']}, ROC-AUC={m['roc_auc']}")
    print(f"       Risk Breakdown: High={dm.churn_meta['risk_breakdown']['high_risk']}, Medium={dm.churn_meta['risk_breakdown']['medium_risk']}, Low={dm.churn_meta['risk_breakdown']['low_risk']}")

    print(f"[TEST] Combined Insights: {len(dm.combined_insights['cross_tabulation'])} cross-tab rows, Priority queue: {len(dm.combined_insights['priority_retention_queue'])} accounts")
    print(f"[TEST] Recommendations: {len(dm.recommendations)} actionable strategies generated")

    pdf_file = dm.generate_pdf()
    print(f"[TEST] PDF Executive Report generated: {pdf_file} (bytes: {os.path.getsize(pdf_file)})")

    # Customer directory query test
    cust_res = dm.get_customers(page=1, page_size=5)
    print(f"[TEST] Customers query success: returned {len(cust_res['customers'])} of {cust_res['total_count']} total customers")

    print("[TEST] ALL END-TO-END TESTS PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    run_test()
