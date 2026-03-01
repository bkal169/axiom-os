from fastapi import Header, HTTPException, Depends
from sqlmodel import Session
from axiom_engine.database import get_session
from axiom_engine.models import Org
from axiom_engine.auth import decode_token
# from axiom_engine.accounts import get_org # Deprecated
from axiom_engine.plans import get_plan_config
from axiom_engine.authz2 import get_limit
from axiom_engine.persist_read import count_recent_runs # Needs refactor too

def get_plan_from_header(plan_header: str | None):
    if not plan_header:
        return "FREE"
    return plan_header.strip().upper()

def get_ctx(
    authorization: str | None = Header(default=None),
    session: Session = Depends(get_session)
):
    """
    Authorization: Bearer <token>
    """
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(status_code=401, detail="MISSING_TOKEN")

    token = authorization.split(" ", 1)[1].strip()
    try:
        claims = decode_token(token)
    except Exception:
        raise HTTPException(status_code=401, detail="INVALID_TOKEN")

    # DB Lookup using SQLModel
    org = session.get(Org, claims["org_id"])
    if not org:
        raise HTTPException(status_code=401, detail="ORG_NOT_FOUND")

    plan = org.plan
    config = get_plan_config(plan)

    return {
        "user_id": claims["user_id"],
        "org_id": claims["org_id"],
        "role": claims.get("role", "SAAS"),
        "plan": plan,
        "plan_config": config,
        "email": claims.get("email"),
        "db": session # Pass session to downstream deps/routes via ctx
    }

def check_run_limit(plan: str, org_id: str | None = None):
    limit = get_limit(plan, "max_runs_per_day")
    if count_recent_runs(org_id=org_id) >= limit:
        raise HTTPException(status_code=429, detail="DAILY_RUN_LIMIT_EXCEEDED")
