"""Axiom OS V5 — Semantic Memory Store (pgvector)"""
import os
import logging
from typing import Optional

logger = logging.getLogger(__name__)


def embed(text: str, client=None) -> list:
    try:
        from openai import OpenAI
        _client = client or OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))
        response = _client.embeddings.create(input=text[:8000], model="text-embedding-3-small")
        return response.data[0].embedding
    except ImportError:
        logger.warning("openai not installed. Returning zero vector.")
        return [0.0] * 1536
    except Exception as e:
        logger.error(f"Embedding failed: {e}")
        return [0.0] * 1536


def store_action(action: dict, supabase, client=None) -> Optional[str]:
    try:
        text = f"{action.get('action_type', '')}: {action.get('description', '')}"
        if action.get("outcome"):
            text += f" -> {action['outcome']}"
        embedding = embed(text, client)
        result = supabase.table("agent_actions").insert({**action, "embedding": embedding}).execute()
        if result.data:
            return result.data[0]["id"]
    except Exception as e:
        logger.error(f"store_action failed: {e}")
    return None


def find_similar(query: str, supabase, threshold: float = 0.75, limit: int = 3, client=None) -> list:
    try:
        embedding = embed(query, client)
        result = supabase.rpc("find_similar_actions", {
            "query_embedding": embedding, "similarity_threshold": threshold, "match_count": limit,
        }).execute()
        return result.data or []
    except Exception as e:
        logger.error(f"find_similar failed: {e}")
        return []


def get_context_for_deal(deal_id: str, action_type: str, supabase, client=None) -> str:
    similar = find_similar(f"{action_type} for deal {deal_id}", supabase, threshold=0.70, limit=3, client=client)
    if not similar:
        return "No relevant past actions found in semantic memory."
    lines = ["Relevant past actions from semantic memory:"]
    for item in similar:
        lines.append(f"- [{item.get('action_type')}] {item.get('description')} -> {item.get('outcome','unknown')} (similarity: {item.get('similarity',0):.2f})")
    return "\n".join(lines)
