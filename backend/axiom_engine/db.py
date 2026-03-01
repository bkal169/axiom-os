import json
from pathlib import Path
from typing import Dict, Any

DB_PATH = Path(__file__).resolve().parents[2] / "db.json"  # backend/db.json

DEFAULT = {
    "orgs": {},   # org_id -> {id, name, plan}
    "users": {},  # user_id -> {id, email, pw_hash, org_id, role}
    "usage": {}   # org_id -> {"YYYY-MM-DD": {"runs": int}}
}

def load_db() -> Dict[str, Any]:
    if not DB_PATH.exists():
        save_db(DEFAULT)
    return json.loads(DB_PATH.read_text(encoding="utf-8"))

def save_db(db: Dict[str, Any]) -> None:
    DB_PATH.write_text(json.dumps(db, indent=2), encoding="utf-8")
