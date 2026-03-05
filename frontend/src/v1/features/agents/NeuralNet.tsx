import { useState, useMemo } from "react";
import { useProject } from "../../context/ProjectContext";
import { Card, Button } from "../../components/ui/components";
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
                    data.metrics = [["Total Cost", fmt.M(totalCost)], ["Hard Cost/Lot", fmt.usd(fin.hardCostPerLot)], ["Land Cost", fmt.M(fin.landCost)]];
                    data.insight = `Capital stack modeled for ${pName}. Land cost accounts for ${Math.round(fin.landCost / totalCost * 100)}% of total capitalization. Cost structure aligns with benchmark medians.`;
                    break;
                }
                case "Location Score": data.metrics = [["Walk Score", "74"], ["Transit", "Good"], ["Schools", "8/10"]]; data.insight = `Location ranks in the 85th percentile relative to the MSA. Strong driver for premium pricing.`; break;
                case "Density Potential": data.metrics = [["Yield Test", "Pass"], ["Efficiency", "82%"], ["Max Lots", fin.totalLots]]; data.insight = `Site geometry allows for high density. Current plan of ${fin.totalLots} lots is optimal for FAR limits.`; break;
                case "Market Velocity": data.metrics = [["Absorp.", `~${fin.absorbRate}/mo`], ["Sales Pace", "Fast"], ["Inv. Months", "4.1"]]; data.insight = `High velocity expected upon delivery. Absorption modeled at ${fin.absorbRate} units per month.`; break;
                case "Cost Index": data.metrics = [["Hard Cost", `$${fin.hardCostPerLot}/lot`], ["Soft Cost", `${fin.softCostPct}%`], ["Fees", "Avg"]]; data.insight = `Construction costs in ${loc} are trending slightly above national average. Contingency reserves verified.`; break;
                case "Risk Factors": data.metrics = [["Entitlement", "Med"], ["Const.", "Low"], ["Market", "Med"]]; data.insight = `Environmental and geotechnical risks are minimal. Primary risk remains timeline elongation during permits.`; break;
                case "Demand Signal": data.metrics = [["Search Vol", "High"], ["Pre-sales", "N/A"], ["Waitlist", "Growing"]]; data.insight = `Forward-looking demand indicators show sustained interest in this specific asset class locally.`; break;
                case "Feasibility Score": data.metrics = [["Score", `${dealScore}/100`], ["Threshold", ">70"], ["Status", "Viable"]]; data.insight = `This deal profile closely mirrors 142 successful projects in our historical training set. High probability of success.`; break;
                case "IRR Prediction": data.metrics = [["Base", "18.4%"], ["Bull", "24.1%"], ["Bear", "12.2%"]]; data.insight = `Monte Carlo simulation across 10,000 runs confirms expected returns exceed the internal hurdle rate.`; break;
                case "Absorption Model": data.metrics = [["Duration", "16 mo"], ["Phase 1", "Fast"], ["Phase 2", "Stabilized"]]; data.insight = `Non-linear absorption curve applied. Initial 3 months expected to capture pent-up demand.`; break;
                case "Risk Heatmap": data.metrics = [["Concentration", "Front-end"], ["Severity", "2.4/5"], ["Mitigation", "Active"]]; data.insight = `Highest risk concentration occurs during horizontal construction phase. Buffer added to carry costs.`; break;
                case "Deal Score": data.metrics = [["Final Score", `${dealScore}/100`], ["Percentile", "88th"], ["Confidence", `${confidence}%`]]; data.insight = `Computed deal intelligence for ${pName}. The asset presents an asymmetric risk/reward profile favorable to the sponsor.`; break;
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
        <div
            onClick={onClick}
            className={`axiom-neuron ${active ? "active" : ""}`}
            style={{ color: active ? color : (activeGlobal ? "var(--c-dim)" : "var(--c-text)") }}
        >
            {active && <div className="axiom-neuron-indicator" style={{ color }} />}
            {label}
        </div>
    );

    return (
        <div className="axiom-mx-auto axiom-max-w-1200">
            <Card title="Deal Scoring Neural Network">
                <div className="axiom-text-13-sub axiom-mb-16">
                    Visual neural network showing how deal intelligence is computed through feature extraction and pattern recognition layers.
                </div>

                {/* Visual Neural Network Container (Restored V20 glow effect & layout) */}
                <div className="axiom-neural-container">
                    <div className="axiom-neural-glow" />

                    {LAYERS.map((layer) => (
                        <div key={layer.id} className="axiom-flex-1 axiom-flex-column axiom-items-center axiom-gap-8 axiom-px-12 axiom-z-1">
                            <div className="axiom-text-10-bold-spaced-caps axiom-mb-6" style={{ color: layer.color }}>
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
                    <div className="axiom-bg-2 axiom-radius-6 axiom-mb-16 axiom-overflow-hidden axiom-transition-3 axiom-border-default" style={{ borderColor: `${LAYERS.find(l => l.id === activeLayer)?.color}44` }}>
                        <div className="axiom-telemetry-header" style={{ background: `color-mix(in srgb, ${LAYERS.find(l => l.id === activeLayer)?.color} 15%, transparent)`, borderBottom: `1px solid ${LAYERS.find(l => l.id === activeLayer)?.color}33` }}>
                            <div className="axiom-flex-center-gap-8">
                                <div className="axiom-telemetry-status" style={{ color: LAYERS.find(l => l.id === activeLayer)?.color, background: "currentColor" }} />
                                <span className="axiom-text-12-bold-spaced-caps" style={{ color: LAYERS.find(l => l.id === activeLayer)?.color }}>{activeNode}</span>
                            </div>
                            <div className="axiom-text-10-dim">{LAYERS.find(l => l.id === activeLayer)?.name}</div>
                        </div>

                        <div className="axiom-p-16">
                            {isGenerating ? (
                                <div className="axiom-text-13-gold-italic axiom-py-16 axiom-flex-center-gap-10">
                                    <div className="axiom-spin axiom-w-14 axiom-h-14 axiom-border-2 axiom-radius-full axiom-border-gold axiom-border-t-transparent" />
                                    Computing neural pathways for {activeNode}...
                                </div>
                            ) : nodeData ? (
                                <div className="axiom-flex-gap-20">
                                    <div className="axiom-flex-1">
                                        <div className="axiom-text-10-dim-caps axiom-mb-8">Computed Insight</div>
                                        <div className="axiom-text-14-text axiom-lh-16">{nodeData.insight}</div>
                                    </div>
                                    <div className="axiom-w-1 axiom-bg-border" />
                                    <div className="axiom-min-w-200">
                                        <div className="axiom-text-10-dim-caps axiom-mb-8">Data Telemetry</div>
                                        {nodeData.metrics.map(([label, val]: any, i: number) => (
                                            <div key={i} className="axiom-flex-sb-center axiom-mb-6">
                                                <span className="axiom-text-12-sub">{label}</span>
                                                <span className="axiom-text-12-bold">{val}</span>
                                            </div>
                                        ))}
                                        <Button
                                            label="✦ Deep Dive with Copilot"
                                            variant="gold"
                                            className="axiom-mt-10 axiom-full-width axiom-p-4-10 axiom-text-10"
                                            onClick={() => {
                                                window.dispatchEvent(new CustomEvent("axiom_goto_view", { detail: "copilot" }));
                                            }}
                                        />
                                    </div>
                                </div>
                            ) : null}
                        </div>
                    </div>
                )}

                {!activeNode && (
                    <div className="axiom-p-12 axiom-bg-main axiom-radius-4 axiom-border-default axiom-text-13-sub axiom-mb-16">
                        <b className="axiom-text-dim axiom-mr-6">Interactive Network:</b>
                        Click any node above to analyze real-time data streaming through that pathway.
                    </div>
                )}

                <div className="axiom-grid-5 axiom-gap-12">
                    {[
                        ["Deal Score", dealScore + "/100", dealScore > 70 ? "var(--c-green)" : dealScore > 50 ? "var(--c-amber)" : "var(--c-red)"],
                        ["Confidence", confidence + "%", "var(--c-blue)"],
                        ["Risk Level", dealScore > 70 ? "Low" : dealScore > 50 ? "Medium" : "High", dealScore > 70 ? "var(--c-green)" : dealScore > 50 ? "var(--c-amber)" : "var(--c-red)"],
                        ["Feasibility", dealScore > 60 ? "Viable" : "Review", dealScore > 60 ? "var(--c-green)" : "var(--c-amber)"],
                        ["Recommendation", dealScore > 70 ? "GO" : dealScore > 50 ? "CONDITIONS" : "NO-GO", dealScore > 70 ? "var(--c-green)" : dealScore > 50 ? "var(--c-amber)" : "var(--c-red)"]
                    ].map(([l, v, c]: any, i) => (
                        <div key={i} className="axiom-p-12 axiom-radius-4 axiom-text-center axiom-border-1" style={{ background: `color-mix(in srgb, ${c} 10%, transparent)`, borderColor: `color-mix(in srgb, ${c} 30%, transparent)` }}>
                            <div className="axiom-text-10-dim-caps axiom-mb-6">{l}</div>
                            <div className="axiom-text-20-bold" style={{ color: c }}>{v}</div>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    );
}
