import json
from pathlib import Path
from datetime import datetime, timezone
from typing import Dict, Any

# Adjusting to parents[1] because this file is in axiom_engine/
# parents[0] = axiom_engine, parents[1] = backend
BASE_DIR = Path(__file__).resolve().parents[1]
LOG_PATH = BASE_DIR / "deal_runs.jsonl"

def save_run(record: Dict[str, Any]) -> Dict[str, Any]:
    # Ensure directory exists just in case, though backend/ should exist
    # LOG_PATH.parent.mkdir(exist_ok=True)
    
    stamped = {
        "ts": datetime.now(timezone.utc).isoformat(),
        **record
    }
    with open(LOG_PATH, "a", encoding="utf-8") as f:
        f.write(json.dumps(stamped) + "\n")
    return stamped

def list_runs(limit: int = 20) -> Dict[str, Any]:
    if not LOG_PATH.exists():
        return {"count": 0, "runs": []}

    rows = []
    with open(LOG_PATH, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line:
                rows.append(json.loads(line))

    total = len(rows)
    n = max(1, min(limit, total))
    start = total - n
    sliced = rows[start:]

    # attach absolute indices
    runs = []
    for i, r in enumerate(sliced):
        runs.append({"index": start + i, **r})

    return {"count": total, "runs": runs}

