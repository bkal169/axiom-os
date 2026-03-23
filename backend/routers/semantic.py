"""
Semantic memory router — Axiom OS V5
pgvector-backed semantic search over deal and market data.
"""
import os
import logging
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from axiom_engine.dependencies import get_ctx

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/semantic", tags=["semantic"])


def _get_embedding(text: str) -> list[float]:
    """Get OpenAI embedding for text."""
    import openai
    client = openai.OpenAI(api_key=os.environ.get("OPENAI_API_KEY", ""))
    response = client.embeddings.create(model="text-embedding-3-small", input=text)
    return response.data[0].embedding


class StoreRequest(BaseModel):
    entity_type: str  # 'deal', 'market_report', 'risk_note', 'user_note'
    entity_id: str | None = None
    content: str
    metadata: dict = {}


class SearchRequest(BaseModel):
    query: str
    entity_type: str | None = None
    limit: int = 10
    similarity_threshold: float = 0.7


@router.post("/store")
async def store_memory(req: StoreRequest, ctx: dict = Depends(get_ctx)):
    """Store a document in semantic memory with embedding."""
    try:
        embedding = _get_embedding(req.content)
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Embedding failed: {e}")

    try:
        from supabase import create_client
        url = os.environ.get("SUPABASE_URL", "")
        key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", os.environ.get("SUPABASE_KEY", ""))
        if not url or not key:
            raise HTTPException(status_code=503, detail="Supabase not configured")
        sb = create_client(url, key)

        result = sb.table("semantic_memory").insert({
            "org_id": ctx.get("org_id"),
            "entity_type": req.entity_type,
            "entity_id": req.entity_id,
            "content": req.content,
            "embedding": embedding,
            "metadata": req.metadata,
        }).execute()

        return {"id": result.data[0]["id"], "stored": True}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/search")
async def search_memory(req: SearchRequest, ctx: dict = Depends(get_ctx)):
    """Semantic similarity search over stored memories."""
    try:
        query_embedding = _get_embedding(req.query)
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Embedding failed: {e}")

    try:
        from supabase import create_client
        url = os.environ.get("SUPABASE_URL", "")
        key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", os.environ.get("SUPABASE_KEY", ""))
        if not url or not key:
            raise HTTPException(status_code=503, detail="Supabase not configured")
        sb = create_client(url, key)

        # Use Supabase RPC for vector similarity search
        results = sb.rpc("match_semantic_memory", {
            "query_embedding": query_embedding,
            "match_threshold": req.similarity_threshold,
            "match_count": req.limit,
            "filter_entity_type": req.entity_type,
        }).execute()

        return results.data or []
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/memories")
async def list_memories(entity_type: str | None = None, limit: int = 20, ctx: dict = Depends(get_ctx)):
    """List stored memories."""
    try:
        from supabase import create_client
        url = os.environ.get("SUPABASE_URL", "")
        key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", os.environ.get("SUPABASE_KEY", ""))
        if not url or not key:
            return []
        sb = create_client(url, key)

        query = sb.table("semantic_memory").select("id,entity_type,entity_id,content,metadata,created_at")
        if entity_type:
            query = query.eq("entity_type", entity_type)
        result = query.order("created_at", desc=True).limit(limit).execute()
        return result.data or []
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
