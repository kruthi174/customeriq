import os

# app/utils/paths.py -> app/utils -> app -> backend -> CustomerIQ
BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
PROJECT_ROOT = os.path.dirname(BACKEND_DIR)

DATA_DIR = os.path.join(PROJECT_ROOT, "data")
SAMPLE_DATA_PATH = os.path.join(DATA_DIR, "sample", "online_retail_sample.csv")
UPLOADS_DIR = os.path.join(DATA_DIR, "uploads")
MODELS_DIR = os.path.join(PROJECT_ROOT, "trained_models")
REPORTS_DIR = os.path.join(PROJECT_ROOT, "reports")
FRONTEND_DIST = os.path.join(PROJECT_ROOT, "frontend", "dist")
DB_PATH = os.path.join(PROJECT_ROOT, "customeriq.db")

for d in [UPLOADS_DIR, MODELS_DIR, REPORTS_DIR]:
    try:
        os.makedirs(d, exist_ok=True)
    except Exception:
        pass
