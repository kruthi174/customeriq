import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes.api import router
from app.services.data_manager import DataManager
from app.database.db import init_db

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: initialize database and pre-load sample dataset for instant zero-config demonstration
    init_db()
    dm = DataManager.get_instance()
    if os.path.exists(dm.sample_path):
        try:
            print(f"[CustomerIQ] Auto-loading demonstration dataset from {dm.sample_path}...")
            dm.load_dataset(dm.sample_path, dataset_name="Online Retail Sample (UCI E-Commerce)", is_sample=True)
            print(f"[CustomerIQ] Preloaded successfully. Clean records: {len(dm.cleaned_df)}, Customers: {dm.preprocessing_summary.get('unique_customers')}")
        except Exception as e:
            print(f"[CustomerIQ] Auto-load notice: {e}")
    yield
    # Shutdown logic if any
    print("[CustomerIQ] Service shutting down.")

app = FastAPI(
    title="CustomerIQ Enterprise Analytics API",
    description="Academic Project Title: Customer Behaviour Segmentation & Insight Discovery Platform. Tagline: Understand Customers. Discover Patterns. Drive Growth.",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "*"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API routes
app.include_router(router)

# Mount frontend static distribution if built
from app.utils.paths import FRONTEND_DIST
from fastapi.staticfiles import StaticFiles

if os.path.exists(FRONTEND_DIST) and os.path.exists(os.path.join(FRONTEND_DIST, "index.html")):
    app.mount("/", StaticFiles(directory=FRONTEND_DIST, html=True), name="static")
else:
    @app.get("/")
    def root():
        return {
            "product": "CustomerIQ",
            "title": "Customer Behaviour Segmentation & Insight Discovery Platform",
            "tagline": "Understand Customers. Discover Patterns. Drive Growth.",
            "api_docs": "/docs",
            "status": "online"
        }
