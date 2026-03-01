from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from sqlmodel import Session
from axiom_engine.database import get_session
from axiom_engine.models import Org

router = APIRouter(prefix="/admin", tags=["admin"])

ADMIN_SECRET = "CHANGE_ME_ADMIN"

class PlanUpdateIn(BaseModel):
    org_id: str
    plan: str
    admin_secret: str

class StripeAttachIn(BaseModel):
    org_id: str
    stripe_customer_id: str
    admin_secret: str

@router.post("/set_plan")
def admin_set_plan(
    payload: PlanUpdateIn,
    session: Session = Depends(get_session)
):
    if payload.admin_secret != ADMIN_SECRET:
        raise HTTPException(status_code=403, detail="FORBIDDEN")

    org = session.get(Org, payload.org_id)
    if not org:
        return {"error": "org_not_found"}

    org.plan = payload.plan.upper()
    session.add(org)
    session.commit()
    session.refresh(org)
    return {"ok": True, "org": org}

@router.post("/attach_stripe_customer")
def admin_attach_stripe_customer(
    payload: StripeAttachIn,
    session: Session = Depends(get_session)
):
    if payload.admin_secret != ADMIN_SECRET:
        raise HTTPException(status_code=403, detail="FORBIDDEN")

    org = session.get(Org, payload.org_id)
    if not org:
        raise HTTPException(status_code=404, detail="ORG_NOT_FOUND")

    org.stripe_customer_id = payload.stripe_customer_id
    session.add(org)
    session.commit()
    session.refresh(org)
    return {"ok": True, "org": org}
