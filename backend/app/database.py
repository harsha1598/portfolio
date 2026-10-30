import os
import ssl
from sqlalchemy import create_engine, text
from sqlalchemy.orm import declarative_base, sessionmaker

# On Vercel serverless, filesystem is read-only except /tmp
default_sqlite_path = "/tmp/portfolio.db" if os.getenv("VERCEL") else "./portfolio.db"
raw_db_url = os.getenv("DATABASE_URL", "").strip()

db_status = {
    "type": "SQLite",
    "connected": True,
    "error": None,
    "driver": "sqlite",
}


def _create_sqlite_engine():
    return create_engine(
        f"sqlite:///{default_sqlite_path}",
        connect_args={"check_same_thread": False},
    )


engine = None

if raw_db_url:
    target_url = raw_db_url
    if target_url.startswith("postgres://"):
        target_url = target_url.replace("postgres://", "postgresql+pg8000://", 1)
    elif target_url.startswith("postgresql://"):
        target_url = target_url.replace("postgresql://", "postgresql+pg8000://", 1)

    connect_args = {}
    if "postgresql" in target_url:
        try:
            from sqlalchemy.engine.url import make_url
            url_obj = make_url(target_url)
            query_dict = dict(url_obj.query)
            # Remove parameters not accepted by pg8000.connect
            query_dict.pop("sslmode", None)
            query_dict.pop("sslrootcert", None)
            target_url = url_obj.set(query=query_dict).render_as_string(hide_password=False)
        except Exception as parse_err:
            print("URL query cleanup warning:", parse_err)

        try:
            # Supabase PostgreSQL requires SSL encryption
            ssl_ctx = ssl.create_default_context()
            ssl_ctx.check_hostname = False
            ssl_ctx.verify_mode = ssl.CERT_NONE
            connect_args["ssl_context"] = ssl_ctx
            connect_args["timeout"] = 5  # Fail fast to preserve Vercel execution window
        except Exception as ssl_err:
            print("SSL context setup warning:", ssl_err)

    try:
        test_engine = create_engine(
            target_url,
            connect_args=connect_args,
            pool_pre_ping=True,
            pool_recycle=300,
        )
        # Test connection immediately to verify credentials and connectivity
        with test_engine.connect() as conn:
            conn.execute(text("SELECT 1"))

        engine = test_engine
        db_status["type"] = "PostgreSQL (Supabase)"
        db_status["connected"] = True
        db_status["error"] = None
        db_status["driver"] = "pg8000"
        print("Connected to PostgreSQL (Supabase) successfully!")
    except Exception as e:
        error_msg = str(e)
        print(f"Warning: Failed to connect to DATABASE_URL: {error_msg}. Falling back to SQLite.")
        db_status["type"] = "SQLite (Fallback)"
        db_status["connected"] = False
        db_status["error"] = error_msg
        db_status["driver"] = "sqlite"
        engine = _create_sqlite_engine()
else:
    engine = _create_sqlite_engine()
    db_status["type"] = "SQLite"
    db_status["connected"] = True
    db_status["error"] = None
    db_status["driver"] = "sqlite"

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
