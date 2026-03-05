import { useMemo, useState } from "react";
import { useProjectState } from "../../hooks/useProjectState";
import { Card, KPI, Button, Badge } from "../../components/ui/components";
import { useProject, type ProjectContextType } from "../../context/ProjectContext";
import { fmt } from "../../lib/utils";
import { DEFAULT_FIN, DEFAULT_RISKS, DEFAULT_PERMITS } from "../../lib/defaults";
import { buildMonthlyCashFlows, calcIRR } from "../../lib/math";
import { CHART_TT, CHART_TT_BAR } from "../../lib/chartTheme";
import {
    AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

interface Props { projectId: string; }

// ─── CHART THEME ─────────────────────────────────────────────
const PIE_COLORS = ["#D4A843", "#3B82F6", "#22C55E", "#8B5CF6", "#F59E0B", "#10B981", "#EF4444"];
const AXIS_STYLE = { fontSize: 10, fill: "var(--c-dim)" };
const GRID_STROKE = "rgba(255,255,255,0.05)";

export function Dashboard({ projectId }: Props) {
    const { project, updateProject, syncError } = useProjectState(projectId);
    const { setChartSel } = useProject() as ProjectContextType;
    const [selectedSlice, setSelectedSlice] = useState<string | null>(null);

    const fin = project.financials ?? DEFAULT_FIN;
    const risks = project.risks ?? DEFAULT_RISKS;
    const permits = project.permits ?? DEFAULT_PERMITS;
    const ddChecks = project.ddChecks ?? {};

    // ── Snapshot calcs ────────────────────────────────────────
    const snap = useMemo(() => {
        const hard = fin.totalLots * fin.hardCostPerLot;
        const soft = hard * (fin.softCostPct / 100);
        const fees = fin.planningFees + (fin.permitFeePerLot + fin.schoolFee + fin.impactFeePerLot) * fin.totalLots;
        const cont = (hard + soft) * (fin.contingencyPct / 100);
        const landCost = fin.landCost + fin.closingCosts;
        const totalCost = landCost + hard + soft + cont + fees;
        const revenue = fin.totalLots * fin.salesPricePerLot;
        const profit = revenue * 0.97 - totalCost;
        const margin = revenue > 0 ? (profit / revenue) * 100 : 0;
        const { flows, constMonths } = buildMonthlyCashFlows(fin);
        const irr = (Math.pow(1 + (calcIRR(flows) || 0), 12) - 1) * 100;

        const costBreakdown = [
            { name: "Land", value: Math.round(landCost / 1000) },
            { name: "Hard Cost", value: Math.round(hard / 1000) },
            { name: "Soft Cost", value: Math.round(soft / 1000) },
            { name: "Fees", value: Math.round(fees / 1000) },
            { name: "Contingency", value: Math.round(cont / 1000) },
        ];

        const cashFlowData = flows.slice(0, 24).map((v, i) => ({
            month: `M${i + 1}`,
            cashFlow: Math.round(v / 1000),
            cumulative: Math.round(flows.slice(0, i + 1).reduce((s, x) => s + x, 0) / 1000),
        }));

        const scenarios = [
            { name: "Bear", revenue: revenue * 0.85, cost: totalCost * 1.1 },
            { name: "Base", revenue, cost: totalCost },
            { name: "Bull", revenue: revenue * 1.15, cost: totalCost * 0.95 },
        ].map(s => ({
            ...s,
            profit: Math.round((s.revenue * 0.97 - s.cost) / 1000),
            margin: Math.round(((s.revenue * 0.97 - s.cost) / s.revenue) * 100),
        }));

        return { totalCost, revenue, profit, margin, irr, constMonths, costBreakdown, cashFlowData, scenarios };
    }, [fin]);

    const openRisks = risks.filter((r: any) => r.status === "Open").length;
    const ddDone = Object.values(ddChecks).filter(Boolean).length;
    const approvedPm = permits.filter((p: any) => p.status === "Approved").length;
    const riskSeverity = [
        { name: "Low", value: risks.filter((r: any) => r.severity === "Low").length, color: "var(--c-green)" },
        { name: "Medium", value: risks.filter((r: any) => r.severity === "Medium").length, color: "var(--c-amber)" },
        { name: "High", value: risks.filter((r: any) => r.severity === "High").length, color: "var(--c-red)" },
        { name: "Critical", value: risks.filter((r: any) => r.severity === "Critical").length, color: "var(--c-purple)" },
    ].filter(r => r.value > 0);

    return (
        <div className="axiom-stack-32">
            {syncError && (
                <div className="axiom-p-8-12 axiom-bg-3 axiom-border-amber axiom-radius-4 axiom-text-11-amber">
                    ⚠ {syncError}
                </div>
            )}

            <div className="axiom-top-bar">
                <div>
                    <div className="axiom-breadcrumb">Command Center</div>
                    <div className="axiom-page-title">{project.name || "Unnamed Project"}</div>
                </div>
                <div className="axiom-flex-gap-12">
                    <Button label="Export Summary" variant="gold" onClick={() => {
                        const blob = new Blob([JSON.stringify(snap, null, 2)], { type: 'application/json' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url; a.download = 'Axiom-Project-Export.json';
                        document.body.appendChild(a); a.click(); document.body.removeChild(a);
                    }} />
                    <Button label="Refresh Data" onClick={() => updateProject({ lastRefresh: Date.now() })} />
                </div>
            </div>

            <div className="axiom-grid-4">
                <KPI label="Total Lots" value={fmt.num(fin.totalLots)} color="var(--c-gold)" />
                <KPI label="Project Revenue" value={fmt.M(snap.revenue)} color="var(--c-green)" />
                <KPI label="Net Profit" value={fmt.M(snap.profit)} color={snap.profit >= 0 ? "var(--c-green)" : "var(--c-red)"} />
                <KPI label="Levered IRR" value={fmt.pct(snap.irr)} color="var(--c-blue)" />
                <KPI label="Open Risks" value={String(openRisks)} color={openRisks > 3 ? "var(--c-amber)" : "var(--c-green)"} sub="active items" />
                <KPI label="DD Items Done" value={String(ddDone)} color="var(--c-blue)" sub="complete" />
                <KPI label="Permits Approved" value={String(approvedPm)} color="var(--c-teal)" sub="of total" />
                <KPI label="Profit Margin" value={fmt.pct(snap.margin)} color={snap.margin > 15 ? "var(--c-green)" : "var(--c-gold)"} sub="net margin" />
            </div>

            <div className="axiom-grid-2">
                <Card title="Monthly Cash Flow — 24 Month View">
                    <ResponsiveContainer width="100%" height={240}>
                        <AreaChart data={snap.cashFlowData} onClick={(e: any) => { if (e && e.activePayload && e.activePayload[0]) setChartSel(e.activePayload[0]); }} style={{ cursor: "pointer" }}>
                            <defs>
                                <linearGradient id="cfGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="var(--c-gold)" stopOpacity={0.25} />
                                    <stop offset="95%" stopColor="var(--c-gold)" stopOpacity={0.02} />
                                </linearGradient>
                                <linearGradient id="cumGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="var(--c-blue)" stopOpacity={0.2} />
                                    <stop offset="95%" stopColor="var(--c-blue)" stopOpacity={0.02} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} />
                            <XAxis dataKey="month" tick={AXIS_STYLE} interval={3} />
                            <YAxis tick={AXIS_STYLE} tickFormatter={v => `$${v}K`} />
                            <Tooltip {...CHART_TT} formatter={(v: any) => [`$${Number(v).toLocaleString()}K`, ""]} />
                            <Legend wrapperStyle={{ fontSize: 10, color: "var(--c-dim)" }} />
                            <Area type="monotone" dataKey="cashFlow" stroke="var(--c-gold)" fill="url(#cfGrad)" strokeWidth={2} dot={false} name="Monthly" />
                            <Area type="monotone" dataKey="cumulative" stroke="var(--c-blue)" fill="url(#cumGrad)" strokeWidth={2} dot={false} name="Cumulative" />
                        </AreaChart>
                    </ResponsiveContainer>
                </Card>

                <Card title="Cost Structure Breakdown">
                    <div className="axiom-flex axiom-items-center axiom-gap-16">
                        <ResponsiveContainer width={160} height={200}>
                            <PieChart>
                                <Pie
                                    data={snap.costBreakdown}
                                    cx="50%" cy="50%"
                                    innerRadius={50} outerRadius={75}
                                    dataKey="value"
                                    onClick={(e) => { if (e && e.name) setSelectedSlice(e.name); setChartSel(e); }}
                                    style={{ cursor: "pointer" }}
                                >
                                    {snap.costBreakdown.map((_, i) => (
                                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} opacity={selectedSlice && _.name !== selectedSlice ? 0.4 : 1} />
                                    ))}
                                </Pie>
                                <Tooltip {...CHART_TT} formatter={(v: any) => [`$${Number(v).toLocaleString()}K`, ""]} />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="axiom-flex-1">
                            {snap.costBreakdown.map((item, i) => (
                                <div key={item.name} className="axiom-flex-sb-center axiom-py-4 axiom-border-b-1 axiom-pointer"
                                    onClick={() => setSelectedSlice(s => s === item.name ? null : item.name)}>
                                    <div className="axiom-flex-center-gap-8">
                                        <div className="axiom-w-8 axiom-h-8 axiom-radius-2" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                                        <span className="axiom-text-11-sub">{item.name}</span>
                                    </div>
                                    <span className="axiom-text-11-bold">${item.value.toLocaleString()}K</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </Card>
            </div>

            <div className="axiom-grid-2">
                <Card title="Scenario Analysis — Profit Comparison">
                    <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={snap.scenarios} onClick={(e: any) => { if (e && e.activePayload && e.activePayload[0]) setChartSel(e.activePayload[0]); }} style={{ cursor: "pointer" }}>
                            <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} />
                            <XAxis dataKey="name" tick={AXIS_STYLE} />
                            <YAxis tick={AXIS_STYLE} tickFormatter={v => `$${v}K`} />
                            <Tooltip {...CHART_TT_BAR} formatter={(v: any) => [`$${Number(v).toLocaleString()}K`, "Profit"]} />
                            <Legend wrapperStyle={{ fontSize: 10, color: "var(--c-dim)" }} />
                            <Bar dataKey="profit" name="Profit">
                                {snap.scenarios.map((s, i) => (
                                    <Cell key={i} fill={s.profit >= 0 ? ["var(--c-amber)", "var(--c-gold)", "var(--c-green)"][i] || "var(--c-gold)" : "var(--c-red)"} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </Card>

                <Card title="Risk Severity Distribution">
                    {riskSeverity.length > 0 ? (
                        <div className="axiom-flex axiom-items-center axiom-gap-16">
                            <ResponsiveContainer width={140} height={180}>
                                <PieChart onClick={(e: any) => { if (e && e.activePayload && e.activePayload[0]) setChartSel(e.activePayload[0]); }} style={{ cursor: 'pointer' }}>
                                    <Pie data={riskSeverity} cx="50%" cy="50%" outerRadius={65} dataKey="value">
                                        {riskSeverity.map((item, i) => (
                                            <Cell key={i} fill={item.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip {...CHART_TT_BAR} formatter={(v: any) => [Number(v).toLocaleString(), "risks"]} />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="axiom-flex-1">
                                {riskSeverity.map(r => (
                                    <div key={r.name} className="axiom-flex-sb axiom-py-5 axiom-border-b-1">
                                        <div className="axiom-flex-center-gap-8">
                                            <div className="axiom-w-8 axiom-h-8 axiom-radius-circle" style={{ background: r.color }} />
                                            <span className="axiom-text-11-sub">{r.name}</span>
                                        </div>
                                        <span className="axiom-text-11-bold" style={{ color: r.color }}>{r.value}</span>
                                    </div>
                                ))}
                                <div className="axiom-mt-10 axiom-text-10-dim">
                                    {risks.length} total risks tracked
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="axiom-text-12-dim axiom-py-20">No risks tracked yet. Add risks in the Risk Command module.</div>
                    )}
                </Card>
            </div>

            <Card title="Project Meta" action={<Badge label="Auto-Saved" color="var(--c-green)" />}>
                <div className="axiom-grid-2">
                    <div>
                        <div className="axiom-label axiom-mb-8">PROJECT NAME</div>
                        <input className="axiom-input-field axiom-w-full" value={project.name || ""} onChange={e => updateProject({ name: e.target.value })} title="Project Name" />
                    </div>
                    <div>
                        <div className="axiom-label axiom-mb-8">STATE</div>
                        <input className="axiom-input-field axiom-w-full" value={project.state || ""} onChange={e => updateProject({ state: e.target.value })} placeholder="e.g. FL" title="State" />
                    </div>
                    <div>
                        <div className="axiom-label axiom-mb-8">MUNICIPALITY</div>
                        <input className="axiom-input-field axiom-w-full" value={project.municipality || ""} onChange={e => updateProject({ municipality: e.target.value })} placeholder="City / County" title="Municipality" />
                    </div>
                    <div>
                        <div className="axiom-label axiom-mb-8">ENTITLEMENT STATUS</div>
                        <select className="axiom-select-field axiom-w-full" value={project.entitlementStatus || "Not Started"} onChange={e => updateProject({ entitlementStatus: e.target.value })} title="Entitlement Status">
                            {["Not Started", "In Progress", "Submitted", "Approved"].map(o => <option key={o}>{o}</option>)}
                        </select>
                    </div>
                </div>
            </Card>

            <div className="axiom-footer">
                <div className="axiom-breadcrumb">Axiom OS · V1 Architecture · Real Estate Intelligence</div>
            </div>
        </div>
    );
}
