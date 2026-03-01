from datetime import date
from typing import Dict, Any
from .db import load_db, save_db

def _today_key() -> str:
    return date.today().isoformat()  # server local date; good enough for MVP

def get_today_runs(org_id: str) -> int:
    db = load_db()
    usage = db.get("usage", {})
    day = _today_key()
    return int(usage.get(org_id, {}).get(day, {}).get("runs", 0))

def increment_runs(org_id: str, inc: int = 1) -> int:
    db = load_db()
    if "usage" not in db:
        db["usage"] = {}

    day = _today_key()
    db["usage"].setdefault(org_id, {})
    db["usage"][org_id].setdefault(day, {"runs": 0})
    db["usage"][org_id][day]["runs"] += inc

    save_db(db)
    return int(db["usage"][org_id][day]["runs"])

def enforce_run_limit(org_id: str, plan_config: Dict[str, Any]) -> None:
    limit = int(plan_config.get("max_runs_per_day", 0))
    if limit <= 0:
        return  # treat 0 as unlimited
    used = get_today_runs(org_id)
    if used >= limit:
        raise PermissionError("RUN_LIMIT_EXCEEDED")
