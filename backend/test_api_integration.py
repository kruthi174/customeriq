import os
import sys
from fastapi.testclient import TestClient

# Add backend directory to sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.main import app

def test_api_suite():
    print("\n=======================================================")
    print("CUSTOMER IQ: FULL END-TO-END API INTEGRATION TEST SUITE")
    print("=======================================================\n")

    with TestClient(app) as client:
        # 1. Health check
        print("[1/18] Testing GET /api/health...")
        res = client.get("/api/health")
        assert res.status_code == 200, f"Expected 200, got {res.status_code}"
        print(f"       -> Status: {res.json()['status']}, Service: {res.json()['service']}")

        # 2. Dataset summary
        print("[2/18] Testing GET /api/dataset-summary...")
        res = client.get("/api/dataset-summary")
        assert res.status_code == 200
        data = res.json()
        print(f"       -> Dataset: {data['dataset_name']}, Clean Rows: {data['preprocessing_summary']['final_records']}")

        # 3. Preprocess endpoint
        print("[3/18] Testing POST /api/preprocess...")
        res = client.post("/api/preprocess", json={
            "remove_duplicates": True,
            "remove_cancellations": True,
            "remove_negative_qty": True,
            "remove_missing_customers": True,
            "remove_zero_price": True,
            "handle_outliers": True
        })
        assert res.status_code == 200
        print(f"       -> Unique Customers: {res.json()['summary']['unique_customers']}")

        # 4. RFM Analysis
        print("[4/18] Testing GET /api/rfm-analysis...")
        res = client.get("/api/rfm-analysis")
        assert res.status_code == 200
        rfm = res.json()
        print(f"       -> Customer Count: {rfm['customer_count']}, Total Revenue: ${rfm['total_revenue']:,.2f}")

        # 5. Run Clustering
        print("[5/18] Testing POST /api/run-clustering...")
        res = client.post("/api/run-clustering", json={"algorithm": "kmeans", "n_clusters": 4})
        assert res.status_code == 200
        cl = res.json()
        print(f"       -> Selected Model: {cl['clustering']['selected_model']}, Clusters: {cl['clustering']['n_clusters']}")

        # 6. Model Comparison
        print("[6/18] Testing GET /api/model-comparison...")
        res = client.get("/api/model-comparison")
        assert res.status_code == 200
        mc = res.json()
        print(f"       -> Algorithms compared: {len(mc['comparison_table'])}")
        for m in mc['comparison_table']:
            print(f"          * {m['name']}: Silhouette={m['silhouette_score']}, DB={m['davies_bouldin_index']}")

        # 7. Customer Segments
        print("[7/18] Testing GET /api/customer-segments...")
        res = client.get("/api/customer-segments")
        assert res.status_code == 200
        segs = res.json()['segments']
        print(f"       -> Number of Segments: {len(segs)}")
        for s in segs:
            print(f"          * {s['name']}: {s['customer_count']} customers ({s['revenue_contribution_pct']}% rev)")

        # 8. Single Segment Detail
        first_seg_name = segs[0]['name']
        print(f"[8/18] Testing GET /api/customer-segments/{first_seg_name}...")
        res = client.get(f"/api/customer-segments/{first_seg_name}")
        assert res.status_code == 200
        print(f"       -> Fetched details for: {res.json()['segment']['name']}")

        # 9. Customers Directory
        print("[9/18] Testing GET /api/customers...")
        res = client.get("/api/customers?page=1&page_size=10&sort_by=monetary&sort_order=desc")
        assert res.status_code == 200
        cust_data = res.json()
        print(f"       -> Retrieved {len(cust_data['customers'])} customers of {cust_data['total_count']} total")
        first_cust_id = cust_data['customers'][0]['customer_id']

        # 10. Customer Profile Detail
        print(f"[10/18] Testing GET /api/customers/{first_cust_id}...")
        res = client.get(f"/api/customers/{first_cust_id}")
        assert res.status_code == 200
        profile = res.json()
        print(f"       -> Profile #{profile['customer_id']}: Spend=${profile['monetary']:,.2f}, Transactions={profile['transactions_count']}")

        # 11. Business Recommendations
        print("[11/18] Testing GET /api/business-recommendations...")
        res = client.get("/api/business-recommendations")
        assert res.status_code == 200
        recs = res.json()['recommendations']
        print(f"       -> Generated {len(recs)} prescriptive strategies")

        # 12. Train Churn Model
        print("[12/18] Testing POST /api/train-churn-model...")
        res = client.post("/api/train-churn-model", json={"inactivity_threshold_days": 90})
        assert res.status_code == 200
        churn_res = res.json()
        print(f"       -> Best Churn Classifier: {churn_res['best_model_name']}")

        # 13. Churn Results
        print("[13/18] Testing GET /api/churn-results...")
        res = client.get("/api/churn-results")
        assert res.status_code == 200
        churn_info = res.json()
        print(f"       -> High Risk Count: {churn_info['risk_breakdown']['high_risk']}")

        # 14. Combined Insights
        print("[14/18] Testing GET /api/combined-insights...")
        res = client.get("/api/combined-insights")
        assert res.status_code == 200
        comb = res.json()
        print(f"       -> Cross-Tab Rows: {len(comb['cross_tabulation'])}, Revenue At Stake: ${comb['total_revenue_at_stake']:,.2f}")

        # 15. Export PDF Report
        print("[15/18] Testing GET /api/export-report (PDF)...")
        res = client.get("/api/export-report")
        assert res.status_code == 200
        assert res.headers["content-type"] == "application/pdf"
        print(f"       -> PDF streamed successfully: {len(res.content)} bytes")

        # 16. Export CSV Customers
        print("[16/18] Testing GET /api/export-csv/customers...")
        res = client.get("/api/export-csv/customers")
        assert res.status_code == 200
        assert "text/csv" in res.headers["content-type"]
        print(f"       -> Customers CSV streamed: {len(res.content)} bytes")

        # 17. Export CSV RFM
        print("[17/18] Testing GET /api/export-csv/rfm...")
        res = client.get("/api/export-csv/rfm")
        assert res.status_code == 200
        print(f"       -> RFM CSV streamed: {len(res.content)} bytes")

        # 18. Export CSV Cleaned
        print("[18/18] Testing GET /api/export-csv/cleaned...")
        res = client.get("/api/export-csv/cleaned")
        assert res.status_code == 200
        print(f"       -> Cleaned CSV streamed: {len(res.content)} bytes")

        print("\n=======================================================")
        print("ALL 18 API ENDPOINTS VERIFIED AND PASSED 100%!")
        print("=======================================================\n")

if __name__ == "__main__":
    test_api_suite()
