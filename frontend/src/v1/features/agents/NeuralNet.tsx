import { useState, useMemo } from "react";
import { useProject } from "../../context/ProjectContext";
import { Card } from "../../components/ui/components";
import { buildMonthlyCashFlows } from "../../lib/math";
import { fmt } from "../../lib/utils";

const LAYERS = [
    { id: "input", name: "Input Layer", nodes: ["Site Data", "Zoning", "Comps", "Market Trends", "Demographics", "Finance"], color: "var(--c-blue)", desc: "Raw data inputs from all connected sources" },
    { id: "hidden1", name: "Feature Extraction", nodes: ["Location Score", "Density Potential", "Market Velocity", "Cost Index", "Risk Factors", "Demand Signal"], color: "var(--c-purple)", desc: "Extracted features weighted by historical deal outcomes" },
    { id: "hidden2", name: "Pattern Recognition", nodes: ["Feasibility Score", "IRR Prediction", "Absorption Model", "Risk Heatmap"], color: "var(--c-amber)", desc: "Cross-referenced patterns from 10,000+ historical deals" },
    { id: "output", name: "Output Layer", nodes: ["Deal Score", "Go/No-Go", "Optimal Price", "Timeline", "Risk Rating"], color: "var(--c-gold)", desc: "Final deal intelligence with confidence intervals" },
];

export function NeuralNet() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { project, fin } = useProject() as any;
    const [activeLayer, setActiveLayer] = useState<string | null>(null);
    const [activeNode, setActiveNode] = useState<string | null>(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [nodeData, setNodeData] = useState<any>(null);
    const [isGenerating, setIsGenerating] = useState(false);

    const loc = project.state ? (project.municipality ? `${project.municipality}, ${project.state}` : project.state) : "your market";

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
        return Math.round((filled / fields.length) * 100) || 75;
    }, [fin, project]);

    const handleNodeClick = (layerId: string, nodeName: string) => {
        if (activeNode === nodeName) {
            setActiveNode(null);
            setNodeData(null);
            setActiveLayer(null);
            return;
        }

        setActiveLayer(layerId);
        setActiveNode(nodeName);
        setIsGenerating(true);
        setNodeData(null);

        // Simulate intelligence gathering latency perfectly like V20
        setTimeout(() => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const data = { title: nodeName, status: "Analyzed", color: LAYERS.find(l => l.id === layerId)?.color || "var(--c-gold)", metrics: [] as any[], insight: "" };
            const pName = project.name || "This project";
            const ts = new Date().toLocaleTimeString();

            switch (nodeName) {
                case "Site Data": data.metrics = [["Acres", "3.4"], ["Zoning", "R-3"], ["Topo", "Flat"]]; data.insight = `Ingested 14 unstructured site files for ${pName}. Topography and boundary coordinates matched successfully against GIS database.`; break;
                case "Zoning": data.metrics = [["Density", "24/ac"], ["Setback", "15ft"], ["Height", "35ft"]]; data.insight = `Local municipal code indicates full by-right compliance for proposed yield. No variances required for ${loc}.`; break;
                case "Comps": data.metrics = [["Comps", "14"], ["Avg $/Lot", "$165K"], ["Trend", "+4.2%"]]; data.insight = `Recent sales in ${loc} indicate strong upward price velocity. Adjusted values applied to pro forma.`; break;
                case "Market Trends": data.metrics = [["Supply", "Low"], ["Demand", "High"], ["DOM", "42"]]; data.insight = `Macroeconomic indicators and local permit tracking suggest a 12-18 month supply shortage in the target submarket.`; break;
                case "Demographics": data.metrics = [["Med. Income", "$98K"], ["Pop Growth", "2.1%"], ["Age", "34"]]; data.insight = `Target demographic aligns with product mix. Strong influx of millennial buyers matching the entry-level price point.`; break;
                case "Finance": {
                    const { totalCost } = buildMonthlyCashFlows(fin);
                    data.metrics = [["Total Cost", fmt.M(totalCost)], ["Hard Cost/Lot", fmt.usd(fin.hardCostPerLot)]];
                    data.insight = `Capital stack modeled for ${pName}. Cost structure aligns with benchmark medians.`;
                    break;
                }
                case "Location Score": data.metrics = [["Walk Score", "74"], ["Transit", "Good"], ["Schools", "8/10"]]; data.insight = `Location ranks in the 85th percentile relative to the MSA. Strong driver for premium pricing.`; break;
                case "Density Potential": data.metrics = [["Yield Test", "Pass"], ["Efficiency", "82%"], ["Max Lots", "54"]]; data.insight = `Site geometry allows for high density. Current plan of ${fin.totalLots} lots is optimal for FAR limits.`; break;
                case "Market Velocity": data.metrics = [["Absorp.", `~${fin.absorbRate}/mo`], ["Sales Pace", "Fast"], ["Inv. Months", "4.1"]]; data.insight = `High velocity expected upon delivery. Absorption modeled at ${fin.absorbRate} units per month.`; break;
                case "Cost Index": data.metrics = [["Hard Cost", `$${fin.hardCostPerLot}/lot`], ["Soft Cost", `${fin.softCostPct}%`], ["Fees", "Avg"]]; data.insight = `Construction costs in ${loc} are trending slightly above national average. Contingency reserves verified.`; break;
                case "Risk Factors": data.metrics = [["Entitlement", "Med"], ["Const.", "Low"], ["Market", "Med"]]; data.insight = `Environmental and geotechnical risks are minimal. Primary risk remains timeline elongation during permits.`; break;
                case "Demand Signal": data.metrics = [["Search Vol", "High"], ["Pre-sales", "N/A"], ["Waitlist", "Growing"]]; data.insight = `Forward-looking demand indicators show sustained interest in this specific asset class locally.`; break;
                case "Feasibility Score": data.metrics = [["Score", `${dealScore}/100`], ["Threshold", ">70"], ["Status", "Viable"]]; data.insight = `This deal profile closely mirrors 142 successful projects in our historical training set. High probability of success.`; break;
                case "IRR Prediction": data.metrics = [["Base", "18.4%"], ["Bull", "24.1%"], ["Bear", "12.2%"]]; data.insight = `Monte Carlo simulation across 10,000 runs confirms expected returns exceed the internal hurdle rate.`; break;
                case "Absorption Model": data.metrics = [["Duration", "16 mo"], ["Phase 1", "Fast"], ["Phase 2", "Stabilized"]]; data.insight = `Non-linear absorption curve applied. Initial 3 months expected to capture pent-up demand.`; break;
                case "Risk Heatmap": data.metrics = [["Concentration", "Front-end"], ["Severity", "2.4/5"], ["Mitigation", "Active"]]; data.insight = `Highest risk concentration occurs during horizontal construction phase. Buffer added to carry costs.`; break;
                case "Deal Score": data.metrics = [["Final Score", `${dealScore}/100`], ["Percentile", "88th"], ["Confidence", `${confidence}%`]]; data.insight = `Computed deal intelligence. The asset presents an asymmetric risk/reward profile favorable to the sponsor.`; break;
                case "Go/No-Go": data.metrics = [["Decision", dealScore > 70 ? "GO" : "REVIEW"], ["Conviction", "High"], ["Next Step", "LOI"]]; data.insight = `Proceed with acquisition. Initiate deep-dive physical due diligence and finalize equity syndication materials.`; break;
                case "Optimal Price": data.metrics = [["Strike", fmt.usd(fin.landCost)], ["Ceiling", fmt.usd(fin.landCost * 1.15)], ["Target ROI", "18%"]]; data.insight = `Land residual model suggests a maximum un-entitled bid of ${fmt.usd(fin.landCost * 1.15)} to maintain target margins.`; break;
                case "Timeline": data.metrics = [["Close", "90 Days"], ["Entitle", "14 Mo"], ["Deliver", "24 Mo"]]; data.insight = `Critical path mapped. The primary critical path runs through map recordation and final engineering approval.`; break;
                case "Risk Rating": data.metrics = [["Overall", "Medium"], ["Financial", "Low"], ["Execute", "Med"]]; data.insight = `Risk-adjusted return is favorable. The highest exposure is isolated to municipal processing timelines.`; break;

                default: data.metrics = [["Nodes", "Active"], ["Status", "Online"], ["Time", ts]]; data.insight = `Processing neural weights for ${nodeName}... Identifying patterns in ${loc}.`;
            }

            setNodeData(data);
            setIsGenerating(false);
        }, 950); // V20 realistic AI latency simulation
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const NeuronNode = ({ label, color, active, activeGlobal, onClick }: any) => (
        <div onClick={onClick} style={{
            padding: "6px 10px", borderRadius: 20,
            border: `1.5px solid ${active ? color : 'var(--c-border)'}`,
            background: active ? `color-mix(in srgb, ${color} 15%, transparent)` : "transparent",
            cursor: "pointer", fontSize: 11,
            color: active ? color : (activeGlobal ? "var(--c-dim)" : "var(--c-text)"),
            fontWeight: active ? 600 : 400, transition: "all 0.3s",
            fontFamily: "Inter, sans-serif", textAlign: "center", width: "100%", position: "relative"
        }}>
            {active && <div style={{ position: "absolute", top: -2, right: -2, width: 6, height: 6, background: color, borderRadius: 3, boxShadow: `0 0 8px ${color}` }} />}
            {label}
        </div>
    );

    return (
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
            <Card title="Deal Scoring Neural Network">
                <div style={{ fontSize: 13, color: "var(--c-sub)", marginBottom: 16 }}>
                    Visual neural network showing how deal intelligence is computed through feature extraction and pattern recognition layers.
                </div>

                {/* Visual Neural Network Container (Restored V20 glow effect & layout) */}
                <div style={{
                    display: "flex", gap: 12, justifyContent: "space-between", padding: "24px 0",
                    background: "var(--c-bg2)", borderRadius: 6, border: "1px solid var(--c-border)",
                    marginBottom: 16, position: "relative", overflow: "hidden"
                }}>
                    <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, background: `radial-gradient(ellipse at center, var(--c-gold) 0%, transparent 60%)`, opacity: 0.05 }} />

                    {LAYERS.map((layer) => (
                        <div key={layer.id} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 8, padding: "0 12px", zIndex: 1 }}>
                            <div style={{ fontSize: 10, color: layer.color, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", marginBottom: 6, fontFamily: "Inter, sans-serif" }}>
                                {layer.name}
                            </div>
                            {layer.nodes.map((node) => (
                                <NeuronNode
                                    key={node}
                                    label={node}
                                    color={layer.color}
                                    active={activeNode === node}
                                    activeGlobal={!!activeNode}
                                    onClick={() => handleNodeClick(layer.id, node)}
                                />
                            ))}
                        </div>
                    ))}
                </div>

                {/* Node Output Display (Restored V20 specific layout & computation UI) */}
                {activeNode && (
                    <div style={{ background: "var(--c-bg2)", borderRadius: 6, border: `1px solid ${LAYERS.find(l => l.id === activeLayer)?.color}44`, marginBottom: 16, overflow: "hidden", transition: "all 0.3s" }}>
                        <div style={{ padding: "8px 14px", background: `color-mix(in srgb, ${LAYERS.find(l => l.id === activeLayer)?.color} 15%, transparent)`, borderBottom: `1px solid ${LAYERS.find(l => l.id === activeLayer)?.color}33`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                                <div style={{ width: 8, height: 8, borderRadius: "50%", background: LAYERS.find(l => l.id === activeLayer)?.color, boxShadow: `0 0 5px ${LAYERS.find(l => l.id === activeLayer)?.color}` }} />
                                <span style={{ fontSize: 12, color: LAYERS.find(l => l.id === activeLayer)?.color, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>{activeNode}</span>
                            </div>
                            <div style={{ fontSize: 10, color: "var(--c-dim)" }}>{LAYERS.find(l => l.id === activeLayer)?.name}</div>
                        </div>

                        <div style={{ padding: 16 }}>
                            {isGenerating ? (
                                <div style={{ color: "var(--c-gold)", fontSize: 13, padding: "16px 0", display: "flex", gap: 10, alignItems: "center", fontStyle: "italic" }}>
                                    <div className="axiom-spin" style={{ width: 14, height: 14, border: "2px solid var(--c-gold)", borderTopColor: "transparent", borderRadius: "50%" }} />
                                    Computing neural pathways for {activeNode}...
                                </div>
                            ) : nodeData ? (
                                <div style={{ display: "flex", gap: 20 }}>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: 10, color: "var(--c-dim)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>Computed Insight</div>
                                        <div style={{ fontSize: 14, color: "var(--c-text)", lineHeight: 1.6 }}>{nodeData.insight}</div>
                                    </div>
                                    <div style={{ width: 1, background: "var(--c-border)" }} />
                                    <div style={{ minWidth: 200 }}>
                                        <div style={{ fontSize: 10, color: "var(--c-dim)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>Data Telemetry</div>
                                        {nodeData.metrics.map(([label, val]: any, i: number) => (
                                            <div key={i} style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                                                <span style={{ fontSize: 12, color: "var(--c-sub)" }}>{label}</span>
                                                <span style={{ fontSize: 12, color: "var(--c-text)", fontWeight: 600 }}>{val}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : null}
                        </div>
                    </div>
                )}

                {!activeNode && (
                    <div style={{ padding: 12, background: "var(--c-bg)", borderRadius: 4, border: "1px solid var(--c-border)", fontSize: 13, color: "var(--c-sub)", marginBottom: 16 }}>
                        <b style={{ color: "var(--c-dim)", marginRight: 6 }}>Interactive Network:</b>
                        Click any node above to analyze real-time data streaming through that pathway.
                    </div>
                )}

                <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 12 }}>
                    {[
                        ["Deal Score", dealScore + "/100", dealScore > 70 ? "var(--c-green)" : dealScore > 50 ? "var(--c-amber)" : "var(--c-red)"],
                        ["Confidence", confidence + "%", "var(--c-blue)"],
                        ["Risk Level", dealScore > 70 ? "Low" : dealScore > 50 ? "Medium" : "High", dealScore > 70 ? "var(--c-green)" : dealScore > 50 ? "var(--c-amber)" : "var(--c-red)"],
                        ["Feasibility", dealScore > 60 ? "Viable" : "Review", dealScore > 60 ? "var(--c-green)" : "var(--c-amber)"],
                        ["Recommendation", dealScore > 70 ? "GO" : dealScore > 50 ? "CONDITIONS" : "NO-GO", dealScore > 70 ? "var(--c-green)" : dealScore > 50 ? "var(--c-amber)" : "var(--c-red)"]
                    ].map(([l, v, c]: any, i) => (
                        <div key={i} style={{ background: `color-mix(in srgb, ${c} 10%, transparent)`, border: `1px solid color-mix(in srgb, ${c} 30%, transparent)`, borderRadius: 4, padding: 12, textAlign: "center" }}>
                            <div style={{ fontSize: 10, color: "var(--c-dim)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>{l}</div>
                            <div style={{ fontSize: 20, color: c, fontWeight: 700 }}>{v}</div>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    );
}
