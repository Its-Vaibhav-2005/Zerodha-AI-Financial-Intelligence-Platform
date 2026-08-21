import os
import psycopg2
from psycopg2.extras import RealDictCursor
import sqlite3
from dotenv import load_dotenv

load_dotenv()

SQLITE_DB_PATH = os.path.join(os.path.dirname(__file__), "../data/app.db")

def get_db_connection():
    """
    Attempts connection to NeonDB PostgreSQL using NEON_DATABASE_URL.
    If unavailable or fails, returns an SQLite connection as fallback.
    """
    db_url = os.getenv("NEON_DATABASE_URL")
    if db_url and db_url.startswith("postgres"):
        try:
            conn = psycopg2.connect(db_url)
            return conn, "postgres"
        except Exception as e:
            print(f"[DB Warning] Failed connecting to NeonDB PostgreSQL ({e}). Using local SQLite fallback.")
    
    # SQLite Fallback
    os.makedirs(os.path.dirname(SQLITE_DB_PATH), exist_ok=True)
    conn = sqlite3.connect(SQLITE_DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn, "sqlite"

def init_db():
    """Initializes database tables if they do not exist."""
    conn, db_type = get_db_connection()
    cur = conn.cursor()
    
    if db_type == "postgres":
        # PostgreSQL schema
        cur.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                email VARCHAR(255) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        """)
        cur.execute("""
            CREATE TABLE IF NOT EXISTS portfolios (
                portfolio_id VARCHAR(50) PRIMARY KEY,
                investor_name VARCHAR(100),
                risk_profile VARCHAR(50),
                holdings JSONB NOT NULL,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        """)
        cur.execute("ALTER TABLE portfolios ADD COLUMN IF NOT EXISTS user_id INT;")
        cur.execute("ALTER TABLE portfolios ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;")
        cur.execute("""
            CREATE TABLE IF NOT EXISTS feedback_audit_logs (
                id SERIAL PRIMARY KEY,
                portfolio_id VARCHAR(50),
                model_version VARCHAR(50),
                prompt_hash VARCHAR(64),
                rating VARCHAR(20),
                feedback_text TEXT,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        """)
        cur.execute("""
            CREATE TABLE IF NOT EXISTS compliance_reviews (
                id SERIAL PRIMARY KEY,
                portfolio_id VARCHAR(50),
                review_status VARCHAR(50) DEFAULT 'PENDING',
                policy_flag VARCHAR(50) DEFAULT 'NORMAL',
                reviewer_notes TEXT,
                model_version VARCHAR(50),
                prompt_hash VARCHAR(64),
                reviewed_by VARCHAR(100),
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        """)
        cur.execute("""
            CREATE TABLE IF NOT EXISTS mcp_tool_execution_logs (
                id SERIAL PRIMARY KEY,
                tool_name VARCHAR(100) NOT NULL,
                execution_time_ms NUMERIC,
                status VARCHAR(20),
                parameters_summary TEXT,
                executed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        """)
    else:
        # SQLite schema
        cur.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );
        """)
        cur.execute("""
            CREATE TABLE IF NOT EXISTS portfolios (
                portfolio_id TEXT PRIMARY KEY,
                investor_name TEXT,
                risk_profile TEXT,
                holdings TEXT NOT NULL,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );
        """)
        try:
            cur.execute("ALTER TABLE portfolios ADD COLUMN user_id INTEGER;")
        except Exception:
            pass
        try:
            cur.execute("ALTER TABLE portfolios ADD COLUMN updated_at DATETIME;")
        except Exception:
            pass
        cur.execute("""
            CREATE TABLE IF NOT EXISTS feedback_audit_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                portfolio_id TEXT,
                model_version TEXT,
                prompt_hash TEXT,
                rating TEXT,
                feedback_text TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );
        """)
        cur.execute("""
            CREATE TABLE IF NOT EXISTS compliance_reviews (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                portfolio_id TEXT,
                review_status TEXT DEFAULT 'PENDING',
                policy_flag TEXT DEFAULT 'NORMAL',
                reviewer_notes TEXT,
                model_version TEXT,
                prompt_hash TEXT,
                reviewed_by TEXT,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );
        """)
        cur.execute("""
            CREATE TABLE IF NOT EXISTS mcp_tool_execution_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                tool_name TEXT NOT NULL,
                execution_time_ms REAL,
                status TEXT,
                parameters_summary TEXT,
                executed_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );
        """)

    conn.commit()
    conn.close()

if __name__ == "__main__":
    print("[DB Init] Initializing database tables...")
    init_db()
    print("[DB Init] Database initialized successfully.")
