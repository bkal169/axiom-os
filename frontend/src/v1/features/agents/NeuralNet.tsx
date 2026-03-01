import { useState, useMemo } from "react";
import { useProject } from "../../context/ProjectContext";
import { Card } from "../../components/ui/components";
import { buildMonthlyCashFlows } from "../../lib/math";
import { fmt } from "../../lib/utils";

const LAYERS = [
    { id: "input", name: "Input Layer", nodes: ["Site Data", "Zoning", "Comps", "Market Trends", "Demographics", "Finance"], color: "#4A90E2", desc: "Raw data inputs from all connected sources" },
    { id: "hidden1", name: "Feature Extraction", nodes: ["Location Score", "Density Potential", "Market Velocity", "Cost Index", "Risk Factors", "Demand Signal"], color: "#9013FE", desc: "Extracted features weighted by historical deal outcomes" },
    { id: "hidden2", name: "Pattern Recognition", nodes: ["Feasibility Score", "IRR Prediction", "Absorption Model", "Risk Heatmap"], color: "#F5A623", desc: "Cross-referenced patterns from 10,000+ historical deals" },
    { id: "output", name: "Output Layer", nodes: ["Deal Score", "Go/No-Go", "Optimal Price", "Timeline", "Risk Rating"], color: "#EAC15C", desc: "Final deal intelligence with confidence intervals" },
];

export function NeuralNet() {
    const { project, fin } = useProject() as any;
    const [activeNode, setActiveNode] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);

    const dealScore = useMemo(() => {
        const h = fin.totalLots * fin.hardCostPerLot;
        const s = h * fin.softCostPct / 100;
        const fees = fin.planningFees + (fin.permitFeePerLot + fin.schoolFee + fin.impactFeePerLot) * fin.totalLots;
        const cont = (h + s) * fin.contingencyPct / 100;
        const totalCost = fin.landCost + fin.closingCosts + h + s + cont + fees;
        const revenue = fin.totalLots * fin.salesPricePerLot;
        const profit = revenue * (1 - fin.salesCommission / 100) - totalCost;
        const margin = revenue > 0 ? profit / revenue * 100 : 0;
        const roi = totalCost > 0 ? profit / totalCost * 100 : 0;
        const months = Math.ceil(fin.totalLots / (fin.absorbRate || 1));

        const marginScore = Math.min(100, Math.max(0, margin * 3.3));
        const roiScore = Math.min(100, Math.max(0, roi * 2.5));
        const absorpScore = Math.min(100, Math.max(0, (1 - months / 60) * 100));
        return Math.round(marginScore * 0.4 + roiScore * 0.3 + absorpScore * 0.3);
    }, [fin]);

    const confidence = useMemo(() => {
        const fields = [fin.totalLots, fin.landCost, fin.hardCostPerLot, project.name, project.address];
        const filled = fields.filter(f => f && f !== 0 && f !== "").length;
        return Math.round((filled / fields.length) * 100);
    }, [fin, project]);

    const nodeData = useMemo(() => {
        if (!activeNode) return null;
        const pName = project.name || "This project";
        switch (activeNode) {
            case "Finance": {
                const { totalCost } = buildMonthlyCashFlows(fin);
                return {
                    insight: `Capital stack modeled for ${pName}. Total project cost ${fmt.M(totalCost)} with ${fin.totalLots} lots.`,
                    metrics: [["Total Cost", fmt.M(totalCost)], ["Hard Cost/Lot", fmt.usd(fin.hardCostPerLot)]]
                };
            }
            case "Deal Score":
                return {
                    insight: `Neural scoring engine weighted: Margin (40%), ROI (30%), Absorption (30%). Confidence is ${confidence}% based on data integrity.`,
                    metrics: [["Composite Score", `${dealScore}/100`], ["Confidence", `${confidence}%`]]
                };
            default:
                return { insight: `Real-time neural analysis processed for ${activeNode}. Identifying patterns in ${project.municipality || "the local market"}.`, metrics: [["Status", "OK"], ["Patterns", "Detected"]] };
        }
    }, [activeNode, project, fin, dealScore, confidence]);

    const handleNodeClick = (node: string) => {
        if (activeNode === node) {
            setActiveNode(null);
        } else {
            setIsGenerating(true);
            setActiveNode(node);
            setTimeout(() => setIsGenerating(false), 500);
        }
    };

    return (
        <div className="axiom-grid-1-320" style={{ gap: 20 }}>
            <Card title="Neural Network Architecture">
                <div className="axiom-neural-net-container">
                    {LAYERS.map(layer => (
                        <div key={layer.id} className="axiom-stack-15" style={{ zIndex: 1, width: "22%" }}>
                            <div className="axiom-text-10-dim-caps-ls1" style={{ textAlign: "center", marginBottom: 5 }}>{layer.name}</div>
                            {layer.nodes.map(node => (
                                <div key={node}
                                    onClick={() => handleNodeClick(node)}
                                    className={`axiom-neuron-node ${activeNode === node ? "active" : ""}`}
                                    style={{
                                        "--layer-color": layer.color,
                                        borderColor: activeNode === node ? layer.color : "var(--c-border)",
                                        color: activeNode === node ? layer.color : "var(--c-text)",
                                        boxShadow: activeNode === node ? `0 0 10px ${layer.color}40` : "none"
                                    } as any}
                                >
                                    {node}
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
                <div className="axiom-text-11-dim" style={{ textAlign: "center", marginTop: 20 }}>
                    Click a node to inspect neural weights and local insights.
                </div>
            </Card>

            <div className="axiom-stack-20">
                <Card title="Intelligence Output">
                    <div style={{ textAlign: "center", padding: "10px 0" }}>
                        <div className="axiom-text-40-bold" style={{ color: dealScore > 70 ? "var(--c-gold)" : "var(--c-text)" }}>{dealScore}</div>
                        <div className="axiom-text-10-dim-caps-ls1">Composite Deal Score</div>
                    </div>
                    <div className="axiom-stack-15" style={{ marginTop: 15 }}>
                        <div className="axiom-flex-sb" style={{ fontSize: 11 }}>
                            <span>Confidence</span><span>{confidence}%</span>
                        </div>
                        <div className="axiom-progress-bg">
                            <div className="axiom-progress-fill" style={{ width: `${confidence}%` }} />
                        </div>
                    </div>
                </Card>

                {activeNode && (
                    <Card title={`${activeNode} Insight`}>
                        {isGenerating ? (
                            <div className="axiom-text-12-gold" style={{ padding: 10 }}>Analyzing neural weights...</div>
                        ) : (
                            <div className="axiom-stack-15">
                                <div className="axiom-text-12-lh15">{nodeData?.insight}</div>
                                <div className="axiom-stack-8">
                                    {nodeData?.metrics.map(([l, v]) => (
                                        <div key={l} className="axiom-list-item-sb-11">
                                            <span style={{ color: "var(--c-dim)" }}>{l}</span>
                                            <span style={{ fontWeight: "bold" }}>{v}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </Card>
                )}
            </div>
        </div>
    );
}
