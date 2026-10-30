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
    "host": None,
    "port": None,
    "user": None,
    "database": None,
    "masked_url": None,
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
    elif "://" in target_url and not target_url.startswith("postgresql+pg8000://") and "postgresql" in target_url:
        prefix = target_url.split("://")[0]
        target_url = target_url.replace(prefix + "://", "postgresql+pg8000://", 1)

    connect_args = {}
    if "postgresql" in target_url:
        try:
            from sqlalchemy.engine.url import make_url
            url_obj = make_url(target_url)
            db_status["host"] = url_obj.host
            db_status["port"] = url_obj.port
            db_status["user"] = url_obj.username
            db_status["database"] = url_obj.database
            db_status["masked_url"] = url_obj.render_as_string(hide_password=True)

            query_dict = dict(url_obj.query)
            # Remove parameters not accepted by pg8000.connect
            query_dict.pop("sslmode", None)
            query_dict.pop("sslrootcert", None)
            target_url = url_obj.set(query=query_dict).render_as_string(hide_password=False)
        except Exception as parse_err:
            print("URL query cleanup warning:", parse_err)
            db_status["parse_warning"] = str(parse_err)

        try:
            # Supabase PostgreSQL requires SSL encryption
            ssl_ctx = ssl.create_default_context()
            ssl_ctx.check_hostname = False
            ssl_ctx.verify_mode = ssl.CERT_NONE
            connect_args["ssl_context"] = ssl_ctx
            connect_args["timeout"] = 10  # Connection timeout
        except Exception as ssl_err:
            print("SSL context setup warning:", ssl_err)

    # Supabase allocates projects across pooler clusters (aws-0, aws-1) and offers
    # both transaction mode (:6543) and session mode (:5432).
    # Prepare smart candidate variations if connecting to the shared pooler.
    candidate_urls = [target_url]
    if "aws-0-" in target_url:
        candidate_urls.append(target_url.replace("aws-0-", "aws-1-"))
    elif "aws-1-" in target_url:
        candidate_urls.append(target_url.replace("aws-1-", "aws-0-"))

    # Also prepare session mode (:5432) alternatives if transaction mode (:6543) was given
    url_variations = []
    for c_url in candidate_urls:
        if c_url not in url_variations:
            url_variations.append(c_url)
        if ":6543/" in c_url:
            alt = c_url.replace(":6543/", ":5432/")
            if alt not in url_variations:
                url_variations.append(alt)
        elif ":5432/" in c_url and "pooler.supabase.com" in c_url:
            alt = c_url.replace(":5432/", ":6543/")
            if alt not in url_variations:
                url_variations.append(alt)

    db_status["attempts"] = []
    connected = False
    last_error = None

    for attempt_url in url_variations:
        masked_attempt = attempt_url
        try:
            from sqlalchemy.engine.url import make_url
            masked_attempt = make_url(attempt_url).render_as_string(hide_password=True)
        except Exception:
            pass

        try:
            test_engine = create_engine(
                attempt_url,
                connect_args=connect_args,
                pool_pre_ping=True,
                pool_recycle=300,
            )
            with test_engine.connect() as conn:
                conn.execute(text("SELECT 1"))

            engine = test_engine
            db_status["type"] = "PostgreSQL (Supabase)"
            db_status["connected"] = True
            db_status["error"] = None
            db_status["driver"] = "pg8000"
            try:
                from sqlalchemy.engine.url import make_url
                u = make_url(attempt_url)
                db_status["host"] = u.host
                db_status["port"] = u.port
                db_status["user"] = u.username
                db_status["database"] = u.database
                db_status["masked_url"] = masked_attempt
            except Exception:
                pass
            db_status["attempts"].append({"url": masked_attempt, "status": "connected"})
            connected = True
            print(f"Connected to PostgreSQL ({masked_attempt}) successfully!")
            break
        except Exception as e:
            last_error = str(e)
            db_status["attempts"].append({"url": masked_attempt, "status": "failed", "error": last_error})
            print(f"Connection attempt to {masked_attempt} failed: {last_error}")
            continue

    if not connected:
        print(f"Warning: Failed to connect to DATABASE_URL: {last_error}. Falling back to SQLite.")
        db_status["type"] = "SQLite (Fallback)"
        db_status["connected"] = False
        db_status["error"] = last_error
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
