import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

# On Vercel serverless, filesystem is read-only except /tmp
default_db_url = "sqlite:////tmp/portfolio.db" if os.getenv("VERCEL") else "sqlite:///./portfolio.db"
DATABASE_URL = os.getenv("DATABASE_URL", default_db_url)

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {},
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
