from fastapi import HTTPException
from axiom_engine.persist_read import get_run_by_index
from axiom_engine.persist import list_runs
from fastapi import Depends
from axiom_engine.dependencies import get_ctx
from axiom_engine.connectors.rates import get_10yr_treasury
from axiom_engine.connectors.census import get_demographics
from routers import auth, admin, parcels, deals, calc, copilot_v2
from axiom_engine import scenarios
from axiom_engine.tax import router as tax_router
from axiom_engine.db import load_db, save_db
from axiom_engine.stripe_verify import verify_stripe_signature
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi import FastAPI, Request, Header
import os
import sys
import logging
from dotenv import load_dotenv
load_dotenv()  # Load env vars before any other imports

logger = logging.getLogger(__name__)

app = FastAPI(title="AXIOM Shared Engine MVP")
logger.info("AXIOM app initialized")

STRIPE_WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET", "")

ALLOWED_ORIGINS = [
    "https://axiom-os.vercel.app",
    "https://axiom-os-git-main-axiom-by-juniper-rose.vercel.app",
    "http://localhost:8008",  # Vite dev server
    "http://localhost:3000",
]


@app.on_event("startup")
async def startup_event():
    # Start Agents
    try:
        from axiom_engine.agents.manager import start_agents
        start_agents()
    except Exception as e:
        print(f"[Agent Manager] Failed to start agents: {e}", file=sys.stderr)


@app.on_event("shutdown")
async def shutdown_event():
    try:
        from axiom_engine.agents.manager import stop_agents
        stop_agents()
    except:
        pass

# Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "X-Request-ID"],
)

# Exception Handlers


@app.exception_handler(PermissionError)
def permission_error_handler(request, exc: PermissionError):
    msg = str(exc)
    if msg == "CORE_ONLY":
        return JSONResponse(status_code=403, content={"detail": "CORE_ONLY"})
    if msg == "RUN_LIMIT_EXCEEDED":
        return JSONResponse(status_code=429, content={"detail": "RUN_LIMIT_EXCEEDED"})
    return JSONResponse(status_code=403, content={"detail": "FORBIDDEN"})

# Health


@app.get("/health")
def health():
    return {"ok": True}


# Include Routers
app.include_router(auth.router)
app.include_router(admin.router)
app.include_router(deals.router)
app.include_router(parcels.router)
app.include_router(calc.router)
app.include_router(copilot_v2.router)
app.include_router(scenarios.router)
app.include_router(tax_router)

try:
    from routers import agents as agents_router
    app.include_router(agents_router.router)
except Exception as e:
    logger.warning(f"[V5] agents router not loaded: {e}")

try:
    from routers import risk as risk_router
    app.include_router(risk_router.router)
except Exception as e:
    logger.warning(f"[V5] risk router not loaded: {e}")

try:
    from routers import semantic as semantic_router
    app.include_router(semantic_router.router)
except Exception as e:
    logger.warning(f"[V5] semantic router not loaded: {e}")

# Stripe Webhook (kept in app.py or moved? Let's keep it here or misc. It's unique.)
# It depends on load_db/save_db. Let's keep it in app.py for now to avoid over-fragmentation,
# or move to routers/webhooks.py later. For now, I'll inline it to ensure I don't break it
# by missing dependencies.


@app.post("/stripe/webhook")
async def stripe_webhook(request: Request, stripe_signature: str | None = Header(default=None)):
    raw = await request.body()
    if not stripe_signature:
        return JSONResponse(status_code=400, content={"error": "MISSING_STRIPE_SIGNATURE"})

    try:
        verify_stripe_signature(raw, stripe_signature, STRIPE_WEBHOOK_SECRET)
    except Exception as e:
        if not STRIPE_WEBHOOK_SECRET or STRIPE_WEBHOOK_SECRET == "whsec_placeholder":
            logger.warning(f"Stripe webhook signature failed: {e} — DEV secret in use, allowing.")
        else:
            return JSONResponse(status_code=400, content={"error": "SIGNATURE_VERIFY_FAILED", "detail": str(e)})

    # Now safe to parse JSON
    payload = await request.json()
    event_type = payload.get("type")

    # Use the new Supabase-integrated handler
    from axiom_engine.webhooks import handle_subscription_change

    try:
        result = handle_subscription_change(event_type, payload)
        return JSONResponse(status_code=200, content=result)
    except Exception as e:
        logger.error(f"Webhook handler error: {e}")
        return JSONResponse(status_code=500, content={"error": "Handler Error", "detail": str(e)})

# Market Intel (Small enough to keep here or move to deals? Let's keep for now)


@app.get("/market/intel")
def market_intel(
    state_fips: str = "12",
    ctx: dict = Depends(get_ctx)
):
    census = get_demographics(state_fips=state_fips)
    rates = get_10yr_treasury()
    return {
        "census": census,
        "rates": rates
    }


# Runs History

# Note: get_runs was in app.py. Ideally move to deals.py or separate users.py.
# Let's verify where I put it. I didn't put it in deals.py.
# It fits in deals.py (user's deals) or auth.py (user profile stuff).
# Let's add it to app.py for now to ensure we don't lose it, or append to deals.py.
# Accessing deals.py to check if I added it. I did NOT.
# I will append these to app.py for now to be safe.


@app.get("/runs")
def get_runs_route(
    limit: int = 20,
    ctx: dict = Depends(get_ctx)
):
    return list_runs(limit)


@app.get("/runs/{index}")
def get_run_route(
    index: int,
    ctx: dict = Depends(get_ctx)
):
    run = get_run_by_index(index)
    if run is None:
        raise HTTPException(
            status_code=404, detail=f"Run index {index} not found")
    return run


@app.get("/runs/{index}/report")
def run_report_route(
    index: int,
    ctx: dict = Depends(get_ctx)
):
    r = get_run_by_index(index)
    if not r:
        return {"error": "not_found", "index": index}

    md = []
    md.append("# AXIOM Saved Run Report")
    md.append("")
    md.append(f"**Timestamp (UTC):** {r.get('ts')}")
    md.append(f"**Property ID:** {r.get('property_id')}")
    md.append("")
    md.append("## Summary")
    md.append("```")
    md.append(r.get("summary", ""))
    md.append("```")
    md.append("")
    md.append("## Base Case (Saved)")
    base = r.get("base", {})
    for k, v in base.items():
        md.append(f"- **{k}**: {v}")

    return {"index": index, "markdown": "\n".join(md)}


@app.get("/core/55plus")
def core_55plus(ctx: dict = Depends(get_ctx)):
    if ctx["role"] != "CORE" and not ctx["plan_config"].get("can_55plus"):
        raise HTTPException(status_code=403, detail="CORE_ONLY")
    from axiom_engine.core55 import placeholder_55plus
    return placeholder_55plus()
