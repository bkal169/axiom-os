"""Axiom OS V5 — TT-SI (Test-Time Self-Improvement)"""
import logging
logger = logging.getLogger(__name__)


def should_apply_tts(confidence: float, threshold: float = 0.70) -> bool:
    return confidence < threshold


def generate_synthetic_examples(deal: dict, risk_score: float, brain_fn) -> list:
    prompt = f"""CRE risk analyst. Deal: IRR={deal.get('irr')}, Cap={deal.get('cap_rate')}, LTV={deal.get('ltv')}.
Risk score: {risk_score:.2f}. Confidence LOW.
Generate 3 synthetic variants as JSON array with keys: irr, cap_rate, ltv, risk_direction (higher|lower), rationale.
JSON only."""
    try:
        resp = brain_fn(system="CRE expert. JSON only.", user=prompt, json_mode=True)
        if isinstance(resp, list): return resp
        if isinstance(resp, dict) and "examples" in resp: return resp["examples"]
        return []
    except Exception as e:
        logger.warning(f"TT-SI generation failed: {e}")
        return []


def refine_with_context(original_score: float, synthetic_examples: list,
                         brain_fn, deal_context: str = "") -> tuple:
    if not synthetic_examples:
        return original_score, 0.65
    examples_text = "\n".join([
        f"- IRR {ex.get('irr')}, Cap {ex.get('cap_rate')}, LTV {ex.get('ltv')} -> {ex.get('risk_direction')} risk: {ex.get('rationale','')}"
        for ex in synthetic_examples
    ])
    prompt = f"Calibrate score {original_score:.3f}\nExamples:\n{examples_text}\nContext: {deal_context[:300]}\nJSON: {{\"refined_score\": 0.XX, \"confidence\": 0.XX}}"
    try:
        result = brain_fn(system="Risk calibration. JSON only.", user=prompt, json_mode=True)
        return min(max(float(result.get("refined_score", original_score)), 0.0), 1.0), \
               min(max(float(result.get("confidence", 0.75)), 0.0), 1.0)
    except Exception as e:
        logger.warning(f"TT-SI refinement failed: {e}")
        return original_score, 0.65


def write_calibration_event(deal_id: str, risk_type: str, predicted_prob: float,
                             confidence: float, tts_applied: bool, model_version: str, supabase) -> None:
    try:
        supabase.table("risk_events").insert({
            "deal_id": deal_id, "risk_type": risk_type, "predicted_prob": predicted_prob,
            "confidence": confidence, "tts_applied": tts_applied, "model_version": model_version,
        }).execute()
    except Exception as e:
        logger.warning(f"Calibration event write failed: {e}")
