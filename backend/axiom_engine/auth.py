import time
import uuid
from typing import Dict, Any, Optional

import jwt
from passlib.hash import bcrypt

JWT_SECRET = "CHANGE_ME_NOW"   # later: env var
JWT_ALG = "HS256"
JWT_EXP_SECONDS = 60 * 60 * 24  # 24h

def new_id(prefix: str) -> str:
    return f"{prefix}_{uuid.uuid4().hex[:12]}"

def hash_pw(pw: str) -> str:
    return bcrypt.hash(pw)

def verify_pw(pw: str, pw_hash: str) -> bool:
    return bcrypt.verify(pw, pw_hash)

def make_token(claims: Dict[str, Any]) -> str:
    now = int(time.time())
    payload = {**claims, "iat": now, "exp": now + JWT_EXP_SECONDS}
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALG)

def decode_token(token: str) -> Dict[str, Any]:
    return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALG])
