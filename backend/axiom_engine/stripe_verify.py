import hmac
import hashlib
import time
from typing import Tuple

def _parse_sig_header(sig_header: str) -> Tuple[int, str]:
    # Example: "t=1700000000,v1=abcdef..."
    parts = {}
    for item in sig_header.split(","):
        k, _, v = item.strip().partition("=")
        parts[k] = v
    ts = int(parts.get("t", "0"))
    v1 = parts.get("v1", "")
    return ts, v1

def verify_stripe_signature(
    payload: bytes,
    sig_header: str,
    secret: str,
    tolerance_sec: int = 300
) -> None:
    ts, v1 = _parse_sig_header(sig_header)

    if ts <= 0 or not v1:
        raise ValueError("BAD_SIGNATURE_HEADER")

    now = int(time.time())
    if abs(now - ts) > tolerance_sec:
        raise ValueError("SIGNATURE_TIMESTAMP_OUT_OF_TOLERANCE")

    signed_payload = f"{ts}.".encode("utf-8") + payload
    digest = hmac.new(secret.encode("utf-8"), signed_payload, hashlib.sha256).hexdigest()

    # constant-time compare
    if not hmac.compare_digest(digest, v1):
        raise ValueError("INVALID_SIGNATURE")
