import os
import sys
import logging
from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, Request, Header, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
from rate_limit import limiter

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="AXIOM Shared Engine MVP")
# Attach shared limiter — 60 req/min global floor, AI routes use ai_limit (10/min)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.add_middleware(SlowAPIMiddleware)
logger.info("AXIOM app initialized")

STRIPE_WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET", "")

ALLOWED_ORIGINS = [
    "https://axiom-juniper-rose.vercel.app",
    "https://axiom-os.vercel.app",
    "https://axiom-os-git-main-axiom-by-juniper-rose.vercel.app",
    "http://localhost:8008",
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "X-Request-ID"],
)


@app.exception_handler(PermissionError)
def permission_error_handler(request, exc: PermissionError):
    msg = str(exc)
    if msg == "CORE_ONLY":
        return JSONResponse(status_code=403, content={"detail": "CORE_ONLY"})
    if msg == "RUN_LIMIT_EXCEEDED":
        return JSONResponse(status_code=429, content={"detail": "RUN_LIMIT_EXCEEDED"})
    return JSONResponse(status_code=403, content={"detail": "FORBIDDEN"})


# ── Health (must always respond) ────────────────────────────────────────────
@app.get("/health")
def health():
    return {"ok": True, "version": "v5"}


# ── Core routers (guarded) ──────────────────────────────────────────────────
def _include(module_path: str, label: str):
    try:
        import importlib
        mod = importlib.import_module(module_path)
        app.include_router(mod.router)
        logger.info(f"[router] {label} loaded")
    except Exception as e:
        logger.warning(f"[router] {label} NOT loaded: {e}")


_include("routers.auth", "auth")
_include("routers.admin", "admin")
_include("routers.deals", "deals")
_include("routers.parcels", "parcels")
_include("routers.calc", "calc")
_include("routers.copilot_v2", "copilot_v2")
_include("axiom_engine.scenarios", "scenarios")
_include("axiom_engine.tax", "tax")

# V5 routers
_include("routers.agents", "agents")
_include("routers.risk", "risk")
_include("routers.semantic", "semantic")


# ── Startup / Shutdown ──────────────────────────────────────────────────────
@app.on_event("startup")
async def startup_event():
    try:
        from axiom_engine.agents.manager import start_agents
        start_agents()
    except Exception as e:
        logger.warning(f"[Agent Manager] not started: {e}")


@app.on_event("shutdown")
async def shutdown_event():
    try:
        from axiom_engine.agents.manager import stop_agents
        stop_agents()
    except Exception:
        pass


# ── Stripe Webhook ──────────────────────────────────────────────────────────
@app.post("/stripe/webhook")
async def stripe_webhook(request: Request, stripe_signature: str | None = Header(default=None)):
    raw = await request.body()
    if not stripe_signature:
        return JSONResponse(status_code=400, content={"error": "MISSING_STRIPE_SIGNATURE"})
    try:
        from axiom_engine.stripe_verify import verify_stripe_signature
        verify_stripe_signature(raw, stripe_signature, STRIPE_WEBHOOK_SECRET)
    except Exception as e:
        if not STRIPE_WEBHOOK_SECRET or STRIPE_WEBHOOK_SECRET == "whsec_placeholder":
            logger.warning(f"Stripe webhook sig failed (dev mode): {e}")
        else:
            return JSONResponse(status_code=400, content={"error": "SIGNATURE_VERIFY_FAILED", "detail": str(e)})

    payload = await request.json()
    event_type = payload.get("type")
    try:
        from axiom_engine.webhooks import handle_subscription_change
        result = handle_subscription_change(event_type, payload)
        return JSONResponse(status_code=200, content=result)
    except Exception as e:
        logger.error(f"Webhook handler error: {e}")
        return JSONResponse(status_code=500, content={"error": "Handler Error", "detail": str(e)})


# ── Market Intel ────────────────────────────────────────────────────────────
@app.get("/market/intel")
def market_intel(state_fips: str = "12"):
    try:
        from axiom_engine.connectors.census import get_demographics
        from axiom_engine.connectors.rates import get_10yr_treasury
        from axiom_engine.dependencies import get_ctx
        census = get_demographics(state_fips=state_fips)
        rates = get_10yr_treasury()
        return {"census": census, "rates": rates}
    except Exception as e:
        logger.warning(f"market/intel error: {e}")
        return {"census": {}, "rates": {}, "error": str(e)}


# ── Runs History ────────────────────────────────────────────────────────────
@app.get("/runs")
def get_runs_route(limit: int = 20):
    try:
        from axiom_engine.persist import list_runs
        return list_runs(limit)
    except Exception as e:
        return {"count": 0, "runs": [], "error": str(e)}


@app.get("/runs/{index}")
def get_run_route(index: int):
    try:
        from axiom_engine.persist_read import get_run_by_index
        run = get_run_by_index(index)
        if run is None:
            raise HTTPException(status_code=404, detail=f"Run index {index} not found")
        return run
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/runs/{index}/report")
def run_report_route(index: int):
    try:
        from axiom_engine.persist_read import get_run_by_index
        r = get_run_by_index(index)
        if not r:
            return {"error": "not_found", "index": index}
        md = [
            "# AXIOM Saved Run Report", "",
            f"**Timestamp (UTC):** {r.get('ts')}",
            f"**Property ID:** {r.get('property_id')}", "",
            "## Summary", "```", r.get("summary", ""), "```", "",
            "## Base Case (Saved)"
        ]
        for k, v in r.get("base", {}).items():
            md.append(f"- **{k}**: {v}")
        return {"index": index, "markdown": "\n".join(md)}
    except Exception as e:
        return {"error": str(e), "index": index}


@app.get("/core/55plus")
def core_55plus():
    try:
        from axiom_engine.core55 import placeholder_55plus
        return placeholder_55plus()
    except Exception as e:
        raise HTTPException(status_code=503, detail=str(e))
