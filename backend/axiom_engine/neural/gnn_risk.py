"""Axiom OS V5 — GNN Risk Engine"""
import logging
logger = logging.getLogger(__name__)

try:
    import torch
    import torch.nn.functional as F
    from torch_geometric.nn import GCNConv
    TORCH_AVAILABLE = True
except ImportError:
    TORCH_AVAILABLE = False
    logger.warning("PyTorch/PyG not installed. Using heuristic fallback.")


class RiskGNN(torch.nn.Module if TORCH_AVAILABLE else object):
    def __init__(self, num_features=12, hidden=64, num_classes=1):
        if not TORCH_AVAILABLE:
            raise ImportError("pip install torch torch_geometric")
        super().__init__()
        self.conv1 = GCNConv(num_features, hidden)
        self.conv2 = GCNConv(hidden, num_classes)

    def forward(self, x, edge_index):
        x = F.relu(self.conv1(x, edge_index))
        x = F.dropout(x, p=0.2, training=self.training)
        return torch.sigmoid(self.conv2(x, edge_index))


def build_risk_graph(deal: dict) -> dict:
    nodes = [
        [float(deal.get("irr") or 0), float(deal.get("cap_rate") or 0), float(deal.get("ltv") or 0)],
        [float(deal.get("market_vacancy") or 0.05), float(deal.get("absorption_rate") or 0.5), float(deal.get("market_score") or 0.5)],
        [float(deal.get("permit_risk") or 0.3), float(deal.get("entitlement_risk") or 0.3), float(deal.get("environmental_risk") or 0.1)],
        [float(deal.get("treasury_10yr") or 0.045), float(deal.get("interest_rate") or 0.07), float(deal.get("inflation_rate") or 0.035)],
    ]
    edges = [[0,1],[1,0],[0,2],[2,0],[0,3],[3,0],[1,3],[3,1],[2,3],[3,2]]
    return {"nodes": nodes, "edges": edges}


def heuristic_risk_score(deal: dict) -> float:
    score = 0.5
    irr = float(deal.get("irr") or 0)
    ltv = float(deal.get("ltv") or 0)
    cap_rate = float(deal.get("cap_rate") or 0)
    if irr < 0.12: score += 0.15
    elif irr > 0.20: score -= 0.10
    if ltv > 0.80: score += 0.15
    elif ltv < 0.60: score -= 0.10
    if cap_rate < 0.05: score += 0.10
    return min(max(score, 0.0), 1.0)


def score_deal(deal_id: str, deal: dict, supabase) -> float:
    if not TORCH_AVAILABLE:
        risk_score = heuristic_risk_score(deal)
    else:
        try:
            graph = build_risk_graph(deal)
            model = RiskGNN(num_features=3, hidden=32, num_classes=1)
            model.eval()
            x = torch.tensor(graph["nodes"], dtype=torch.float)
            edge_index = torch.tensor(graph["edges"], dtype=torch.long).t().contiguous()
            with torch.no_grad():
                risk_score = float(model(x, edge_index).mean().item())
        except Exception as e:
            logger.error(f"GNN failed for {deal_id}: {e}")
            risk_score = heuristic_risk_score(deal)
    try:
        g = build_risk_graph(deal)
        supabase.table("risk_graphs").insert({"deal_id": deal_id, "nodes": g["nodes"], "edges": g["edges"], "feature_matrix": {}}).execute()
        supabase.table("risks").update({"gnn_risk_score": risk_score, "gnn_computed_at": "now()"}).eq("deal_id", deal_id).execute()
    except Exception as e:
        logger.warning(f"Could not persist GNN score: {e}")
    return risk_score
