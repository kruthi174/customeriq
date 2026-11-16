import sqlite3
import json
import os
from datetime import datetime
from typing import Dict, Any, List, Optional
from app.utils.paths import DB_PATH

_global_conn = None

def get_db_connection():
    global _global_conn
    if _global_conn is None:
        try:
            # Try file database first
            conn = sqlite3.connect(DB_PATH, check_same_thread=False)
            cursor = conn.cursor()
            cursor.execute("CREATE TABLE IF NOT EXISTS _test_write (id INT)")
            conn.commit()
            conn.row_factory = sqlite3.Row
            _global_conn = conn
        except Exception:
            # Safe in-memory fallback for sandboxed/restricted environments
            conn = sqlite3.connect(":memory:", check_same_thread=False)
            conn.row_factory = sqlite3.Row
            _global_conn = conn
    return _global_conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS datasets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        file_path TEXT NOT NULL,
        is_sample BOOLEAN DEFAULT 0,
        uploaded_at TEXT NOT NULL,
        row_count INTEGER,
        customer_count INTEGER,
        is_preprocessed BOOLEAN DEFAULT 0
    )
    """)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS audit_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        action TEXT NOT NULL,
        details TEXT,
        timestamp TEXT NOT NULL
    )
    """)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT
    )
    """)
    conn.commit()

def log_action(action: str, details: Dict[str, Any] = None):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO audit_logs (action, details, timestamp) VALUES (?, ?, ?)",
            (action, json.dumps(details or {}), datetime.utcnow().isoformat())
        )
        conn.commit()
    except Exception as e:
        print(f"Failed to log action: {e}")

# Initialize on import
init_db()
