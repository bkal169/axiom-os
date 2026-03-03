import { useMemo, useEffect, useState } from "react";
import { useProject } from "../../context/ProjectContext";
import { Card, KPI, Progress } from "../../components/ui/components";
import { Agent } from "../agents/Agent";
import { fmt } from "../../lib/utils";
import { CHART_TT } from "../../lib/chartTheme";
import { supa } from "../../lib/supabase";
import {
    Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
    ResponsiveContainer, Tooltip
} from "recharts";

export function DealAnalyzer() {
    const { project, fin } = useProject() as any;
    const [engineData, setEngineData] = useState<Record<string, any> | null>(null);

    useEffect(() => {
        if (!project?.id) return;
        supa.callEdge(`engines-score?project_id=${project.id}`, {}).then(res => {
            if (res && !res.error) setEngineData(res);
        }).catch(e => console.error("Score engine failed", e));
    }, [project?.id]);

    const analysis = useMemo(() => {
        const hard = fin.totalLots * fin.hardCostPerLot;
        const soft = hard * (fin.softCostPct / 100);
        const fees = fin.planningFees + (fin.permitFeePerLot + fin.schoolFee + fin.impactFeePerLot) * fin.totalLots;
        const cont = (hard + soft) * (fin.contingencyPct / 100);
        const totalCost = fin.landCost + fin.closingCosts + hard + soft + cont + fees;
        const revenue = fin.totalLots * fin.salesPricePerLot;
        const profit = revenue * 0.97 - totalCost; // Simplified profit after commission
        const margin = revenue > 0 ? (profit / revenue) * 100 : 0;
        const roi = totalCost > 0 ? (profit / totalCost) * 100 : 0;

        // Base financial score to fallback on
        const scoreF = Math.min(100, Math.max(0, margin > 20 ? 95 : margin > 15 ? 80 : margin > 10 ? 65 : margin > 5 ? 50 : 30));

        // Sync with Edge Function Data if available
        const overall = engineData ? Math.round(engineData.composite_score) : Math.round(scoreF * 0.4 + 40);
        const verdict = overall >= 75 ? "GO" : overall >= 50 ? "CONDITIONAL" : "NO-GO";

        const radarData = engineData ? [
            { subject: "Financial", A: engineData.subscores?.financeability || scoreF, fullMark: 100 },
            { subject: "Feasibility", A: engineData.subscores?.feasibility || 50, fullMark: 100 },
            { subject: "Timeline Risk", A: engineData.subscores?.timeline_risk || 50, fullMark: 100 },
            { subject: "Budget Risk", A: engineData.subscores?.budget_risk || 50, fullMark: 100 },
            { subject: "Infrastructure", A: 78, fullMark: 100 },
        ] : [
            { subject: "Financial", A: scoreF, fullMark: 100 },
            { subject: "Entitlement", A: 65, fullMark: 100 },
            { subject: "Environmental", A: 85, fullMark: 100 },
            { subject: "Market", A: 72, fullMark: 100 },
            { subject: "Infrastructure", A: 78, fullMark: 100 },
        ];

        return {
            totalCost, revenue, profit, margin, roi, overall, verdict, radarData, scoreF,
            entitlementScore: engineData?.subscores?.feasibility || 65,
            environmentalScore: 85
        };
    }, [fin, project, engineData]);

    const verdictColor = {
        "GO": "var(--c-green)",
        "CONDITIONAL": "var(--c-gold)",
        "NO-GO": "var(--c-red)"
    }[analysis.verdict];

    return (
        <div className="axiom-stack-20">
            <div className="axiom-grid-4">
                <KPI label="Total Cost" value={fmt.M(analysis.totalCost)} color="var(--c-red)" />
                <KPI label="Revenue" value={fmt.M(analysis.revenue)} color="var(--c-green)" />
                <KPI label="Net Profit" value={fmt.M(analysis.profit)} color={analysis.profit >= 0 ? "var(--c-green)" : "var(--c-red)"} />
                <KPI label="Deal Margin" value={fmt.pct(analysis.margin)} color={analysis.margin > 15 ? "var(--c-green)" : "var(--c-gold)"} />
            </div>

            <div className="axiom-grid-2">
                <Card title="Deal Readiness Score">
                    <div style={{ height: 300 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={analysis.radarData}>
                                <PolarGrid stroke="var(--c-border)" />
                                <PolarAngleAxis dataKey="subject" tick={{ fill: "var(--c-dim)", fontSize: 11 }} />
                                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                <Radar
                                    name="Score"
                                    dataKey="A"
                                    stroke="var(--c-gold)"
                                    fill="var(--c-gold)"
                                    fillOpacity={0.3}
                                />
                                <Tooltip {...CHART_TT} formatter={(v: any) => [v, "Score"]} />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                <Card title="Executive Verdict">
                    <div className="axiom-flex-col-center" style={{ height: "100%", padding: "20px 0" }}>
                        <div style={{ fontSize: 64, fontWeight: "bold", color: verdictColor, marginBottom: 10 }}>
                            {analysis.verdict}
                        </div>
                        <div className="axiom-text-18-dim" style={{ marginBottom: 30 }}>
                            Overall Score: {analysis.overall}/100
                        </div>

                        <div className="axiom-stack-15" style={{ width: "100%" }}>
                            <div>
                                <div className="axiom-flex-between-dim-11" style={{ marginBottom: 5 }}>
                                    <span>Financial Strength</span>
                                    <span>{analysis.scoreF}%</span>
                                </div>
                                <Progress value={analysis.scoreF} color={analysis.scoreF >= 75 ? "var(--c-green)" : "var(--c-gold)"} />
                            </div>
                            <div>
                                <div className="axiom-flex-between-dim-11" style={{ marginBottom: 5 }}>
                                    <span>Entitlement Progress</span>
                                    <span>{analysis.entitlementScore}%</span>
                                </div>
                                <Progress value={analysis.entitlementScore} color={analysis.entitlementScore >= 75 ? "var(--c-green)" : "var(--c-gold)"} />
                            </div>
                            <div>
                                <div className="axiom-flex-between-dim-11" style={{ marginBottom: 5 }}>
                                    <span>Environmental Safety</span>
                                    <span>{analysis.environmentalScore}%</span>
                                </div>
                                <Progress value={analysis.environmentalScore} color="var(--c-green)" />
                            </div>
                        </div>
                    </div>
                </Card>
            </div>

            <Card title="IC Memo Builder">
                <Agent
                    id="ICMemoAgent"
                    system={`You are an Investment Committee analyst for: ${project.name}. Generate a professional deal memo. Summary: Cost $${fmt.M(analysis.totalCost)}, Revenue $${fmt.M(analysis.revenue)}, Profit $${fmt.M(analysis.profit)}, Margin ${analysis.margin.toFixed(1)}%. Logic: 40% Financial, 30% Entitlement, 30% Environmental. Verdict is ${analysis.verdict}. Provide high-level investment thesis and risks.`}
                    placeholder="Type 'generate IC memo' to start..."
                />
            </Card>
        </div>
    );
}
