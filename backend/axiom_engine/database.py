from sqlmodel import SQLModel, create_engine, Session
from pathlib import Path

# DB Path
BASE_DIR = Path(__file__).resolve().parents[2] # backend/
SQLITE_FILE_NAME = "axiom.db"
SQLITE_URL = f"sqlite:///{BASE_DIR / SQLITE_FILE_NAME}"

engine = create_engine(SQLITE_URL, echo=False)

def create_db_and_tables():
    SQLModel.metadata.create_all(engine)

def get_session():
    with Session(engine) as session:
        yield session
