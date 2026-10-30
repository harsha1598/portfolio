import os
import sys

# Ensure backend modules can be imported in Vercel Serverless runtime
current_dir = os.path.dirname(os.path.abspath(__file__))
root_dir = os.path.dirname(current_dir)
if root_dir not in sys.path:
    sys.path.insert(0, root_dir)
backend_dir = os.path.join(root_dir, "backend")
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from backend.app.database import Base, engine, SessionLocal
from backend.app.seed import seed_database
from backend.app.main import app

# Ensure database tables and seed are initialized on serverless cold-start
try:
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    seed_database(db)
    db.close()
except Exception as e:
    print("Database init on cold start:", e)

# Vercel entrypoint
handler = app
