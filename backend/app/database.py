import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

# On Vercel serverless, filesystem is read-only except /tmp
default_db_url = "sqlite:////tmp/portfolio.db" if os.getenv("VERCEL") else "sqlite:///./portfolio.db"
DATABASE_URL = os.getenv("DATABASE_URL", default_db_url)

if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

connect_args = {}
if DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}
elif DATABASE_URL.startswith("postgresql://"):
    try:
        import psycopg2
    except ImportError:
        try:
            import pg8000
            DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+pg8000://", 1)
        except ImportError:
            pass

engine = create_engine(
    DATABASE_URL,
    connect_args=connect_args,
    pool_pre_ping=True,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
