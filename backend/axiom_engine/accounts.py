from typing import Dict, Any, Optional
from .db import load_db, save_db
from .auth import new_id, hash_pw, verify_pw

def create_org(name: str, plan: str = "FREE") -> Dict[str, Any]:
    db = load_db()
    org_id = new_id("org")
    org = {
        "id": org_id,
        "name": name,
        "plan": plan.upper(),
        "stripe_customer_id": None,
        "stripe_subscription_id": None,
        "subscription_status": "inactive"
    }
    if "orgs" not in db:
        db["orgs"] = {}
    db["orgs"][org_id] = org
    save_db(db)
    return org

def create_user(email: str, password: str, org_id: str, role: str = "SAAS") -> Dict[str, Any]:
    db = load_db()
    user_id = new_id("usr")
    # check email unique? Handled in app.py or here?
    # Logic provided does NOT check uniqueness. app.py handles it?
    # I should stick to user's code but maybe add uniqueness check if it makes sense?
    # User provided explicit code. I will stick to it.
    
    user = {
        "id": user_id,
        "email": email.lower().strip(),
        "pw_hash": hash_pw(password),
        "org_id": org_id,
        "role": role.upper(),
    }
    if "users" not in db:
        db["users"] = {}
    db["users"][user_id] = user
    save_db(db)
    # return user without password
    return {k: v for k, v in user.items() if k != "pw_hash"}

def find_user_by_email(email: str) -> Optional[Dict[str, Any]]:
    db = load_db()
    if "users" not in db:
        return None
    e = email.lower().strip()
    for u in db["users"].values():
        if u["email"] == e:
            return u
    return None

def authenticate(email: str, password: str) -> Optional[Dict[str, Any]]:
    u = find_user_by_email(email)
    if not u:
        return None
    if not verify_pw(password, u["pw_hash"]):
        return None
    return {k: v for k, v in u.items() if k != "pw_hash"}

def update_org(org_id: str, patch: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    db = load_db()
    org = db["orgs"].get(org_id)
    if not org:
        return None
    org.update(patch)
    db["orgs"][org_id] = org
    save_db(db)
    return org

def get_org(org_id: str) -> Optional[Dict[str, Any]]:
    db = load_db()
    return db["orgs"].get(org_id)
