import os
import tempfile

# app/utils/paths.py -> app/utils -> app -> backend
BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
PROJECT_ROOT = os.path.dirname(BACKEND_DIR)

# Sample dataset candidate paths across monorepo root or backend-only root
CANDIDATE_DATA_PATHS = [
    os.path.join(PROJECT_ROOT, "data", "sample", "online_retail_sample.csv"),
    os.path.join(BACKEND_DIR, "data", "sample", "online_retail_sample.csv"),
    os.path.join(BACKEND_DIR, "app", "data", "sample", "online_retail_sample.csv"),
    os.path.join(os.getcwd(), "data", "sample", "online_retail_sample.csv"),
    os.path.join(os.getcwd(), "backend", "data", "sample", "online_retail_sample.csv"),
]

SAMPLE_DATA_PATH = CANDIDATE_DATA_PATHS[0]
for p in CANDIDATE_DATA_PATHS:
    if os.path.exists(p):
        SAMPLE_DATA_PATH = p
        break

# Dynamic writable directories for Render / local / Docker
DATA_DIR = os.path.join(PROJECT_ROOT, "data")
UPLOADS_DIR = os.environ.get("UPLOAD_DIR", os.path.join(PROJECT_ROOT, "data", "uploads"))
if not os.path.exists(os.path.dirname(UPLOADS_DIR)):
    UPLOADS_DIR = os.path.join(BACKEND_DIR, "data", "uploads")

MODELS_DIR = os.environ.get("MODELS_DIR", os.path.join(PROJECT_ROOT, "trained_models"))
if not os.path.exists(os.path.dirname(MODELS_DIR)):
    MODELS_DIR = os.path.join(BACKEND_DIR, "trained_models")

REPORTS_DIR = os.environ.get("REPORTS_DIR", os.path.join(PROJECT_ROOT, "reports"))
if not os.path.exists(os.path.dirname(REPORTS_DIR)):
    REPORTS_DIR = os.path.join(BACKEND_DIR, "reports")

FRONTEND_DIST = os.path.join(PROJECT_ROOT, "frontend", "dist")

DB_PATH = os.environ.get("DATABASE_PATH", os.path.join(PROJECT_ROOT, "customeriq.db"))
if not os.path.exists(os.path.dirname(DB_PATH)):
    DB_PATH = os.path.join(BACKEND_DIR, "customeriq.db")

for d in [UPLOADS_DIR, MODELS_DIR, REPORTS_DIR]:
    try:
        os.makedirs(d, exist_ok=True)
    except Exception:
        pass
