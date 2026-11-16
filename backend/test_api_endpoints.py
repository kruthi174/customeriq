import os
import sys

# Add backend directory to sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.services.data_manager import DataManager
from app.routes.api import (
    health_check,
    get_dataset_summary,
    preprocess_dataset_endpoint,
    get_rfm_analysis,
    run_clustering_endpoint,
    get_model_comparison,
    get_customer_segments,
    get_single_segment,
    get_customers,
    get_customer_profile,
    get_business_recommendations,
    train_churn_model,
    get_churn_results,
    get_combined_insights,
    export_report_endpoint,
    export_csv_endpoint
)
from app.models.schemas import PreprocessRequest, ClusteringRequest, ChurnTrainRequest

def run_tests():
    print("\n=======================================================")
    print("CUSTOMER IQ: FULL END-TO-END ROUTE & PIPELINE TEST SUITE")
    print("=======================================================\n")

    # Ensure dataset is loaded
    dm = DataManager.get_instance()
    if dm.cleaned_df is None:
        dm.load_dataset(dm.sample_path, is_sample=True)

    # 1. Health check
    print("[1/16] Testing health_check()...")
    h = health_check()
    assert h["status"] == "healthy"
    print(f"       -> Service: {h['service']}, Active Dataset: {h['active_dataset']}")

    # 2. Dataset summary
    print("[2/16] Testing get_dataset_summary()...")
    ds = get_dataset_summary()
    assert ds["dataset_name"] is not None
    print(f"       -> Dataset: {ds['dataset_name']}, Rows: {ds['preprocessing_summary']['final_records']}")

    # 3. Preprocess endpoint
    print("[3/16] Testing preprocess_dataset_endpoint()...")
    p_req = PreprocessRequest(
        remove_duplicates=True,
        remove_cancellations=True,
        remove_negative_qty=True,
        remove_missing_customers=True,
        remove_zero_price=True,
        handle_outliers=True
    )
    p_res = preprocess_dataset_endpoint(p_req)
    assert p_res["summary"]["final_records"] > 0
    print(f"       -> Unique Customers: {p_res['summary']['unique_customers']}")

    # 4. RFM Analysis
    print("[4/16] Testing get_rfm_analysis()...")
    rfm = get_rfm_analysis()
    assert rfm["customer_count"] > 0
    print(f"       -> Customer Count: {rfm['customer_count']}, Total Revenue: ${rfm['total_revenue']:,.2f}")

    # 5. Run Clustering
    print("[5/16] Testing run_clustering_endpoint()...")
    c_req = ClusteringRequest(algorithm="kmeans", n_clusters=4)
    c_res = run_clustering_endpoint(c_req)
    assert c_res["clustering"]["n_clusters"] == 4
    print(f"       -> Selected Model: {c_res['clustering']['selected_model']}")

    # 6. Model Comparison
    print("[6/16] Testing get_model_comparison()...")
    mc = get_model_comparison()
    assert len(mc["comparison_table"]) == 3
    print(f"       -> Algorithms compared: {len(mc['comparison_table'])}")
    for m in mc["comparison_table"]:
        print(f"          * {m['name']}: Silhouette={m['silhouette_score']}, DB={m['davies_bouldin_index']}")

    # 7. Customer Segments
    print("[7/16] Testing get_customer_segments()...")
    segs = get_customer_segments()["segments"]
    assert len(segs) > 0
    print(f"       -> Profiled Segments: {len(segs)}")
    for s in segs:
        print(f"          * {s['name']}: {s['customer_count']} customers ({s['revenue_contribution_pct']}% rev)")

    # 8. Single Segment Detail
    first_seg_name = segs[0]["name"]
    print(f"[8/16] Testing get_single_segment('{first_seg_name}')...")
    seg_detail = get_single_segment(first_seg_name)
    assert seg_detail["segment"]["name"] == first_seg_name
    print(f"       -> Retrieved {len(seg_detail['customers'])} customers for {first_seg_name}")

    # 9. Customers Directory
    print("[9/16] Testing get_customers()...")
    cust_res = get_customers(sort_by="monetary", sort_order="desc", page=1, page_size=10)
    assert len(cust_res["customers"]) > 0
    print(f"       -> Retrieved {len(cust_res['customers'])} of {cust_res['total_count']} customers")
    first_cid = cust_res["customers"][0]["customer_id"]

    # 10. Customer Profile Detail
    print(f"[10/16] Testing get_customer_profile('{first_cid}')...")
    prof = get_customer_profile(first_cid)
    assert prof["customer_id"] == first_cid
    print(f"       -> Profile #{prof['customer_id']}: Spend=${prof['monetary']:,.2f}, Transactions={prof['transactions_count']}")

    # 11. Business Recommendations
    print("[11/16] Testing get_business_recommendations()...")
    recs = get_business_recommendations()["recommendations"]
    assert len(recs) > 0
    print(f"       -> Generated {len(recs)} prescriptive strategies")

    # 12. Train Churn Model
    print("[12/16] Testing train_churn_model()...")
    ch_req = ChurnTrainRequest(inactivity_threshold_days=90)
    ch_res = train_churn_model(ch_req)
    assert ch_res["best_model"] is not None
    print(f"       -> Best Churn Classifier: {ch_res['best_model_name']}")

    # 13. Churn Results
    print("[13/16] Testing get_churn_results()...")
    ch_info = get_churn_results()
    assert "risk_breakdown" in ch_info
    print(f"       -> Risk Breakdown: High={ch_info['risk_breakdown']['high_risk']}, Medium={ch_info['risk_breakdown']['medium_risk']}, Low={ch_info['risk_breakdown']['low_risk']}")

    # 14. Combined Insights
    print("[14/16] Testing get_combined_insights()...")
    comb = get_combined_insights()
    assert "cross_tabulation" in comb
    print(f"       -> Cross-Tab Rows: {len(comb['cross_tabulation'])}, Revenue At Stake: ${comb['total_revenue_at_stake']:,.2f}")

    # 15. Export Report (PDF)
    print("[15/16] Testing export_report_endpoint()...")
    pdf_resp = export_report_endpoint()
    assert pdf_resp.media_type == "application/pdf"
    assert os.path.exists(pdf_resp.path)
    print(f"       -> Generated PDF Report: {pdf_resp.path} ({os.path.getsize(pdf_resp.path)} bytes)")

    # 16. Export CSV
    print("[16/16] Testing export_csv_endpoint('customers')...")
    csv_resp = export_csv_endpoint("customers")
    assert csv_resp.media_type == "text/csv"
    print(f"       -> Generated Customers CSV Stream successfully")

    print("\n=======================================================")
    print("ALL 16 ROUTE HANDLERS VERIFIED AND PASSED 100%!")
    print("=======================================================\n")

if __name__ == "__main__":
    run_tests()
