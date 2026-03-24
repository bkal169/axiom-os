"""
Shared rate limiter instance.

Import `limiter` and `ai_limit` in any router to apply endpoint-level limits.

Usage:
    from rate_limit import limiter, ai_limit
    from fastapi import Request

    @router.post("/expensive")
    @limiter.limit(ai_limit)
    async def my_endpoint(request: Request, ...):
        ...

Tier guidance (enforced by plan checks in axiom_engine.usage; these limits
are a transport-layer safety net against abuse, not a substitute for billing):
    Free        →  60 req/min  (global default)
    Pro         → 120 req/min
    Pro+        → 300 req/min
    Boutique    → 600 req/min
    Enterprise  →  unlimited

AI endpoints (copilot, agents, semantic) receive a stricter default of
10 req/min per IP to cap LLM token spend from unauthenticated/abusive callers.
"""
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address, default_limits=["60/minute"])

# Convenience string for high-cost AI routes
ai_limit = "10/minute"
