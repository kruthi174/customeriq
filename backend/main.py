import uvicorn
import os
import sys

# Ensure backend root is on Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.main import app

if __name__ == "__main__":
    host = os.environ.get("HOST", "0.0.0.0")
    port = int(os.environ.get("PORT", 8000))
    debug = os.environ.get("DEBUG", "false").lower() in ("true", "1")
    uvicorn.run("app.main:app", host=host, port=port, reload=debug)
