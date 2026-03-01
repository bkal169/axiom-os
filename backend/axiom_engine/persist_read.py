import json
from pathlib import Path
from typing import Dict, Any, List

BASE_DIR = Path(__file__).resolve().parents[1]  # backend/
LOG_PATH = BASE_DIR / "deal_runs.jsonl"

def _read_all() -> List[Dict[str, Any]]:
    if not LOG_PATH.exists():
        return []
    rows = []
    with open(LOG_PATH, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line:
                rows.append(json.loads(line))
    return rows

def get_run_by_index(index: int) -> Dict[str, Any] | None:
    rows = _read_all()
    if index < 0 or index >= len(rows):
        return None
    return rows[index]

from datetime import datetime, timedelta, timezone

def count_recent_runs(org_id: str | None = None, seconds: int = 86400) -> int:
    """Count runs in the last N seconds (default 24h)."""
    rows = _read_all()
    if not rows:
        return 0
    
    limit = datetime.now(timezone.utc) - timedelta(seconds=seconds)
    count = 0
    for r in rows:
        # If filtering by org_id, skip if it doesn't match
        if org_id and r.get("org_id") != org_id:
            continue
            
        try:
            ts_str = r.get("ts")
            if ts_str:
                dt = datetime.fromisoformat(ts_str)
                if dt > limit:
                    count += 1
        except (ValueError, TypeError):
            continue
    return count
