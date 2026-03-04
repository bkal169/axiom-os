import { useMemo } from "react";
import { useProject } from "../../context/ProjectContext";
import { Card, KPI, Field, Progress } from "../../components/ui/components";
import { Agent } from "../agents/Agent";
import { fmt } from "../../lib/utils";
import { CHART_TT, AXIS_TICK, GRID_STROKE } from "../../lib/chartTheme";
import {
    BarChart, Bar, AreaChart, Area, Cell,
    ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid
} from "recharts";

export function ProForma() {
    const { project, setProject, fin, setFin, loan, equity, setEquity, setChartSel } = useProject() as any;

    const calculations = useMemo(() => {
        const totalLots = fin.totalLots || 50;
        const salesPrice = fin.salesPricePerLot || 185000;
        const landCost = fin.landCost || 3000000;
        const hardCosts = totalLots * (fin.hardCostPerLot || 65000);
        const softCosts = (landCost + hardCosts) * ((fin.softCostPct || 18) / 100);
        const contingency = hardCosts * ((fin.contingencyPct || 10) / 100);
        const totalProjectCost = landCost + hardCosts + softCosts + contingency;
        const revenue = totalLots * salesPrice * (1 - (fin.salesCommission || 3) / 100);
        const profit = revenue - totalProjectCost;
        const margin = revenue > 0 ? (profit / revenue) * 100 : 0;

        const loanAmount = totalProjectCost * (loan.ltc / 100);
        const equityRequired = totalProjectCost - loanAmount;

        // Deal Score Heuristic (0-100)
        let score = 0;
        if (margin > 25) score += 40; else if (margin > 15) score += 25; else if (margin > 10) score += 10;
        if (loan.ltc < 65) score += 30; else if (loan.ltc < 75) score += 15;
        score += 30; // Base "Institutional Grade" placeholder points
        const dealScore = Math.min(score, 100);

        return {
            totalLots,
            revenue,
            totalProjectCost,
            profit,
            margin,
            loanAmount,
            equityRequired,
            dealScore,
            landCost,
            hardCosts,
            softCosts,
            contingency
        };
    }, [fin, loan]);

    const waterfallData = [
        { name: "Revenue", value: calculations.revenue, fill: "var(--c-gold)" },
        { name: "Land", value: -calculations.landCost, fill: "var(--c-red)" },
        { name: "Hard Costs", value: -calculations.hardCosts, fill: "var(--c-amber)" },
        { name: "Soft Costs", value: -calculations.softCosts, fill: "var(--c-purple)" },
        { name: "Contingency", value: -calculations.contingency, fill: "var(--c-blue)" },
        { name: "Profit", value: calculations.profit, fill: "var(--c-green)" },
    ];

    const cashFlowData = useMemo(() => {
        const base = calculations.totalProjectCost / 24;
        return Array.from({ length: 24 }, (_, i) => ({
            month: i + 1,
            outflow: base * (0.8 + Math.sin(i / 3) * 0.2), // Deterministic pseudo-randomness
            balance: calculations.totalProjectCost - (base * i)
        }));
    }, [calculations.totalProjectCost]);

    // Sensitivity Matrix (Price vs Hard Cost)
    const sensitivityX = [-15, -10, -5, 0, 5, 10, 15]; // Price delta %
    const sensitivityY = [-10, -5, 0, 5, 10]; // Hard Cost delta %

    const calcSensitivity = (pDelta: number, hDelta: number) => {
        const p = calculations.revenue * (1 + pDelta / 100);
        const h = calculations.hardCosts * (1 + hDelta / 100);
        const total = calculations.totalProjectCost - calculations.hardCosts + h;
        return p > 0 ? ((p - total) / p) * 100 : 0;
    };

    return (
        <div className="axiom-stack-16 axiom-animate-fade">
            <div className="axiom-grid-3">
                <div className="axiom-deal-score-container">
                    <div className="axiom-deal-score-circle">
                        <svg width="50" height="50">
                            <circle cx="25" cy="25" r="22" fill="none" stroke="var(--c-border)" strokeWidth="4" />
                            <circle cx="25" cy="25" r="22" fill="none" stroke={calculations.dealScore >= 70 ? "var(--c-green)" : calculations.dealScore >= 50 ? "var(--c-gold)" : "var(--c-red)"} strokeWidth="4"
                                strokeDasharray={`${2 * Math.PI * 22 * calculations.dealScore / 100} ${2 * Math.PI * 22}`}
                                strokeDashoffset={2 * Math.PI * 22 / 4}
                                strokeLinecap="round"
                            />
                        </svg>
                        <div className="axiom-deal-score-text" style={{ color: calculations.dealScore >= 70 ? "var(--c-green)" : calculations.dealScore >= 50 ? "var(--c-gold)" : "var(--c-red)" }}>
                            {calculations.dealScore}
                        </div>
                    </div>
                    <div className="axiom-stack-4">
                        <span className="axiom-label" style={{ marginBottom: 0 }}>DEAL SCORE</span>
                        <span className="axiom-text-10-dim">Institutional Grade</span>
                    </div>
                </div>

                <KPI label="Total Revenue" value={fmt.usd(calculations.revenue)} sub="Net of Commission" />
                <KPI label="Project Profit" value={fmt.usd(calculations.profit)} sub={`${calculations.margin.toFixed(1)}% Margin`} trend={calculations.margin > 15 ? "+2.4%" : "-1.2%"} color={calculations.margin > 15 ? "var(--c-green)" : "var(--c-red)"} />
            </div>

            <div className="axiom-grid-3">
                <KPI label="Total Project Cost" value={fmt.usd(calculations.totalProjectCost)} sub={`$${(calculations.totalProjectCost / calculations.totalLots).toLocaleString()} / Lot`} />
                <KPI label="Loan Amount" value={fmt.usd(calculations.loanAmount)} sub={`${loan.ltc}% LTC @ ${loan.rate}%`} />
                <KPI label="Equity Required" value={fmt.usd(calculations.equityRequired)} sub={`${equity.lpPct}% LP / ${equity.gpPct}% GP`} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 400px", gap: 16 }}>
                <Card title="Waterfall Cost Analysis">
                    <div style={{ height: 260 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={waterfallData} onClick={(data: any) => data && setChartSel(data.activePayload?.[0]?.payload)}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={GRID_STROKE} />
                                <XAxis dataKey="name" stroke={AXIS_TICK.fill} tick={AXIS_TICK} axisLine={false} tickLine={false} />
                                <YAxis hide />
                                <Tooltip
                                    cursor={{ fill: 'transparent' }}
                                    contentStyle={CHART_TT.contentStyle}
                                    itemStyle={CHART_TT.itemStyle}
                                    labelStyle={CHART_TT.labelStyle}
                                />
                                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                                    {waterfallData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.fill} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                <div className="axiom-stack-16">
                    <Card title="Market Scenario Comparison">
                        <div className="axiom-scenario-grid">
                            <div className="axiom-scenario-card">
                                <div className="axiom-label">BEAR CASE</div>
                                <div className="axiom-text-14-bold">{fmt.usd(calculations.profit * 0.6)}</div>
                                <div className="axiom-text-10-dim">{(calculations.margin * 0.7).toFixed(1)}% Margin</div>
                            </div>
                            <div className="axiom-scenario-card axiom-scenario-card-base">
                                <div className="axiom-label" style={{ color: 'var(--c-gold)' }}>BASE CASE</div>
                                <div className="axiom-text-14-bold">{fmt.usd(calculations.profit)}</div>
                                <div className="axiom-text-10-dim">{calculations.margin.toFixed(1)}% Margin</div>
                            </div>
                            <div className="axiom-scenario-card">
                                <div className="axiom-label">BULL CASE</div>
                                <div className="axiom-text-14-bold">{fmt.usd(calculations.profit * 1.3)}</div>
                                <div className="axiom-text-10-dim">{(calculations.margin * 1.25).toFixed(1)}% Margin</div>
                            </div>
                        </div>
                    </Card>

                    <Card title="Return Metrics">
                        <div className="axiom-stack-12">
                            <Field
                                label="Target IRR"
                                value={equity.irrTarget}
                                onUpdate={(v) => setEquity({ ...equity, irrTarget: Number(v) })}
                            >
                                <Progress value={equity.irrTarget} color="var(--c-purple)" />
                                <div className="axiom-flex-sb" style={{ marginTop: 4 }}>
                                    <span className="axiom-text-11-dim">Current Projection</span>
                                    <span className="axiom-text-12-bold">18.4%</span>
                                </div>
                            </Field>
                            <Field
                                label="Equity Multiple"
                                value={equity.equityMultipleTarget}
                                onUpdate={(v) => setEquity({ ...equity, equityMultipleTarget: Number(v) })}
                            >
                                <div className="axiom-text-20-bold">{equity.equityMultipleTarget}x</div>
                                <div className="axiom-text-10-dim">Institutional Threshold: 1.8x</div>
                            </Field>
                        </div>
                    </Card>
                </div>
            </div>

            <Card title="Sensitivity Analysis: Profit Margin %">
                <div className="axiom-sensitivity-container">
                    <table className="axiom-sensitivity-table">
                        <thead>
                            <tr>
                                <th className="axiom-sensitivity-th-corner">Hard Cost \ Price</th>
                                {sensitivityX.map(x => (
                                    <th key={x} className="axiom-sensitivity-th">{x > 0 ? `+${x}` : x}%</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {sensitivityY.map(y => (
                                <tr key={y}>
                                    <th className="axiom-sensitivity-th">{y > 0 ? `+${y}` : y}%</th>
                                    {sensitivityX.map(x => {
                                        const val = calcSensitivity(x, y);
                                        return (
                                            <td key={x} className={`axiom-sensitivity-td ${x === 0 && y === 0 ? 'axiom-sensitivity-td-base' : ''}`} style={{ color: val > 20 ? 'var(--c-green)' : val > 10 ? 'var(--c-gold)' : 'var(--c-red)' }}>
                                                {val.toFixed(1)}%
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            <Card title="Cash Flow Projection (24 Mo)">
                <div style={{ height: 180 }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={cashFlowData} onClick={(data: any) => data && setChartSel(data.activePayload?.[0]?.payload)}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={GRID_STROKE} />
                            <XAxis dataKey="month" stroke={AXIS_TICK.fill} tick={AXIS_TICK} axisLine={false} tickLine={false} />
                            <YAxis hide />
                            <Tooltip
                                contentStyle={CHART_TT.contentStyle}
                                itemStyle={CHART_TT.itemStyle}
                                labelStyle={CHART_TT.labelStyle}
                                cursor={CHART_TT.cursor as any}
                            />
                            <Area type="monotone" dataKey="balance" stroke="var(--c-gold)" fill="var(--c-gold)" fillOpacity={0.1} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </Card>

            <Card title="Project Meta & AI Insights">
                <div style={{ display: "grid", gridTemplateColumns: "1fr 350px", gap: 20 }}>
                    <div className="axiom-stack-16">
                        <div className="axiom-grid-2">
                            <Field
                                label="Project Name"
                                value={project.name}
                                onUpdate={(v) => setProject({ ...project, name: v })}
                            >
                                {project.name}
                            </Field>
                            <Field
                                label="Jurisdiction"
                                value={project.jurisdiction}
                                onUpdate={(v) => setProject({ ...project, jurisdiction: v })}
                            >
                                {project.jurisdiction || "Not Set"}
                            </Field>
                        </div>
                        <div className="axiom-grid-2">
                            <Field
                                label="Total Lots"
                                value={fin.totalLots}
                                onUpdate={(v) => setFin({ ...fin, totalLots: Number(v) })}
                            >
                                <span className="axiom-text-high-contrast" style={{ fontSize: 18, fontWeight: 700 }}>
                                    {calculations.totalLots}
                                </span>
                            </Field>
                            <Field
                                label="Land Cost"
                                value={fin.landCost}
                                onUpdate={(v) => setFin({ ...fin, landCost: Number(v) })}
                            >
                                {fmt.usd(calculations.landCost)}
                            </Field>
                        </div>
                    </div>
                    <Agent id="FinancialAdvisor" system={`You are a senior real estate financial analyst. Analyze the current pro forma for ${project.name}.`} placeholder="Analyze deal structure..." />
                </div>
            </Card>
        </div>
    );
}
