from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from sqlmodel import Session, select
from axiom_engine.database import get_session
from axiom_engine.models import User, Org
from axiom_engine.auth import make_token, hash_pw, verify_pw, new_id
from axiom_engine.dependencies import get_ctx

router = APIRouter(prefix="/auth", tags=["auth"])

class SignupIn(BaseModel):
    org_name: str
    email: str
    password: str
    role: str = "SAAS"

class LoginIn(BaseModel):
    email: str
    password: str

@router.post("/signup")
def signup(
    payload: SignupIn,
    session: Session = Depends(get_session)
):
    # Check email uniqueness
    existing_user = session.exec(select(User).where(User.email == payload.email)).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="EMAIL_EXISTS")

    # Create Org
    org_id = new_id("org")
    org = Org(
        id=org_id,
        name=payload.org_name,
        plan="FREE"
    )
    session.add(org)
    session.commit()
    session.refresh(org)

    # Create User
    user_id = new_id("usr")
    user = User(
        id=user_id,
        email=payload.email,
        password_hash=hash_pw(payload.password),
        org_id=org_id,
        role=payload.role
    )
    session.add(user)
    session.commit()
    session.refresh(user)

    token = make_token({
        "user_id": user.id,
        "org_id": org.id,
        "role": user.role,
        "email": user.email,
    })

    return {"org": org, "user": user, "token": token}

@router.post("/login")
def login(
    payload: LoginIn,
    session: Session = Depends(get_session)
):
    # Find user
    statement = select(User).where(User.email == payload.email)
    user = session.exec(statement).first()
    
    if not user or not verify_pw(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="BAD_CREDENTIALS")

    # Find org
    org = session.get(Org, user.org_id)
    if not org:
        raise HTTPException(status_code=401, detail="ORG_NOT_FOUND")

    token = make_token({
        "user_id": user.id,
        "org_id": org.id,
        "role": user.role,
        "email": user.email,
    })

    return {"org": org, "user": user, "token": token}

@router.get("/me")
def get_current_user_info(ctx: dict = Depends(get_ctx)):
    return {
        "user_id": ctx["user_id"],
        "email": ctx["email"],
        "org_id": ctx["org_id"],
        "role": ctx["role"],
        "plan": ctx["plan"]
    }
