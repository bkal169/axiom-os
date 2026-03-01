from typing import Dict
from fastapi import HTTPException
from .plans import get_plan_config

def get_plan_from_header(role_header: str | None) -> str:
    if not role_header:
        return "FREE"
    return role_header.strip().upper()

def require_feature(plan: str, feature: str):
    config = get_plan_config(plan)
    if not config.get(feature, False):
        raise HTTPException(status_code=403, detail=f"Plan {plan} does not support {feature}")

def get_limit(plan: str, limit_name: str) -> int:
    config = get_plan_config(plan)
    return config.get(limit_name, 0)

from typing import Literal
Role = Literal["CORE", "SAAS"]

def get_role_from_header(role_header: str | None) -> Role:
    if not role_header:
        return "SAAS"
    r = role_header.strip().upper()
    return "CORE" if r == "CORE" else "SAAS"

def require_core(role: Role):
    if role != "CORE":
        raise PermissionError("CORE_ONLY")

