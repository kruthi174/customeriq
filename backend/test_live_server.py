import os
import sys
import time
import subprocess
import urllib.request
import json

def test_live_http_server():
    print("\n=======================================================")
    print("CUSTOMER IQ: LIVE LOCAL SERVER HTTP PROBING TEST")
    print("=======================================================\n")

    backend_dir = os.path.dirname(os.path.abspath(__file__))
    cmd = [sys.executable, "-m", "uvicorn", "app.main:app", "--host", "127.0.0.1", "--port", "8008"]
    
    print("[SERVER] Starting uvicorn process on http://127.0.0.1:8008...")
    proc = subprocess.Popen(cmd, cwd=backend_dir, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    
    # Wait for server to bind
    time.sleep(3)
    
    base_url = "http://127.0.0.1:8008"
    endpoints_to_test = [
        ("/", "Root endpoint"),
        ("/docs", "OpenAPI Swagger UI"),
        ("/api/health", "Health Check"),
        ("/api/dataset-summary", "Dataset Summary"),
        ("/api/rfm-analysis", "RFM Feature Analysis"),
        ("/api/customer-segments", "Customer Segments List"),
        ("/api/customers?page=1&page_size=5", "Customers Directory"),
        ("/api/model-comparison", "Model Comparison Matrix"),
        ("/api/churn-results", "Supervised Churn Results"),
        ("/api/combined-insights", "Combined Segment x Churn Matrix"),
        ("/api/business-recommendations", "Business Recommendations"),
        ("/api/export-report", "Executive PDF Report"),
        ("/api/export-csv/customers", "Customer CSV Export")
    ]
    
    all_passed = True
    try:
        for path, desc in endpoints_to_test:
            url = f"{base_url}{path}"
            req = urllib.request.Request(url, headers={"User-Agent": "CustomerIQ-Verifier"})
            try:
                with urllib.request.urlopen(req, timeout=5) as response:
                    status = response.status
                    content_type = response.headers.get("Content-Type", "")
                    body = response.read(150)
                    print(f"[PROBE] {status} OK: {desc:32} -> {path} ({content_type})")
                    if status != 200:
                        all_passed = False
            except Exception as e:
                print(f"[FAIL] Error accessing {url}: {e}")
                all_passed = False
    finally:
        print("\n[SERVER] Terminating uvicorn process...")
        proc.terminate()
        try:
            proc.wait(timeout=2)
        except subprocess.TimeoutExpired:
            proc.kill()

    if all_passed:
        print("\n=======================================================")
        print("ALL LIVE HTTP PROBES COMPLETED SUCCESSFULLY (100% OK)!")
        print("=======================================================\n")
    else:
        sys.exit(1)

if __name__ == "__main__":
    test_live_http_server()
