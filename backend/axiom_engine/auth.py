import os
import time
import uuid
from typing import Dict, Any, Optional

import jwt
import bcrypt as _bcrypt

_raw_secret = os.environ.get("JWT_SECRET", "")
if not _raw_secret:
    import warnings
    warnings.warn(
        "JWT_SECRET env var is not set — using insecure fallback. "
        "Set JWT_SECRET in your .env / deployment secrets.",
        RuntimeWarning,
        stacklevel=1,
    )
    _raw_secret = "axiom-change-me-set-JWT_SECRET-env-var"

JWT_SECRET = _raw_secret
JWT_ALG = "HS256"
JWT_EXP_SECONDS = 60 * 60 * 24  # 24h

def new_id(prefix: str) -> str:
    return f"{prefix}_{uuid.uuid4().hex[:12]}"

def hash_pw(pw: str) -> str:
    return _bcrypt.hashpw(pw.encode("utf-8"), _bcrypt.gensalt()).decode("utf-8")

def verify_pw(pw: str, pw_hash: str) -> bool:
    return _bcrypt.checkpw(pw.encode("utf-8"), pw_hash.encode("utf-8"))

def make_token(claims: Dict[str, Any]) -> str:
    now = int(time.time())
    payload = {**claims, "iat": now, "exp": now + JWT_EXP_SECONDS}
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALG)

def decode_token(token: str) -> Dict[str, Any]:
    return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALG])
