import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.routes.api import router
from app.services.data_manager import DataManager
from app.database.db import init_db

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: initialize database and pre-load sample dataset for instant zero-config demonstration
    try:
        init_db()
    except Exception as e:
        print(f"[CustomerIQ] Database initialization notice: {e}")

    dm = DataManager.get_instance()
    if os.path.exists(dm.sample_path):
        try:
            print(f"[CustomerIQ] Auto-loading demonstration dataset from {dm.sample_path}...")
            dm.load_dataset(dm.sample_path, dataset_name="Online Retail Sample (UCI E-Commerce)", is_sample=True)
            print(f"[CustomerIQ] Preloaded successfully. Clean records: {len(dm.cleaned_df)}, Customers: {dm.preprocessing_summary.get('unique_customers')}")
        except Exception as e:
            print(f"[CustomerIQ] Auto-load notice: {e}")
    else:
        print(f"[CustomerIQ] Notice: Sample data path does not exist at {dm.sample_path}")

    yield
    print("[CustomerIQ] Service shutting down.")

app = FastAPI(
    title="CustomerIQ Enterprise Analytics API",
    description="Academic Project Title: Customer Behaviour Segmentation & Insight Discovery Platform. Tagline: Understand Customers. Discover Patterns. Drive Growth.",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS for local development and Render deployments
allowed_origins_env = os.environ.get("ALLOWED_ORIGINS", "")
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://customeriq-frontend-99nl.onrender.com",
]

if allowed_origins_env:
    for o in allowed_origins_env.split(","):
        cleaned = o.strip()
        if cleaned and cleaned not in origins:
            origins.append(cleaned)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=r"^https:\/\/.*(\.onrender\.com|\.vercel\.app)$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Register API routes
app.include_router(router)

# Root endpoint for health check & platform information
@app.get("/")
def root():
    dm = DataManager.get_instance()
    return {
        "product": "CustomerIQ",
        "title": "Customer Behaviour Segmentation & Insight Discovery Platform",
        "tagline": "Understand Customers. Discover Patterns. Drive Growth.",
        "api_docs": "/docs",
        "status": "online",
        "active_dataset": dm.current_dataset_name,
        "records_loaded": len(dm.cleaned_df) if dm.cleaned_df is not None else 0
    }
