import { useState } from "react";
import { useProjectState } from "../../hooks/useProjectState";
import { Card, KPI, Badge } from "../../components/ui/components";
import { DEFAULT_RISKS } from "../../lib/defaults";
import {
    Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer,
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip
} from "recharts";

interface Props { projectId: string; }

export function RiskRegistry({ projectId }: Props) {
    const { project, updateProject } = useProjectState(projectId);
    const risks: any[] = project.risks ?? DEFAULT_RISKS;

    const [nr, setNr] = useState({
        cat: "Market", risk: "", likelihood: "Medium",
        impact: "Medium", severity: "Medium", mitigation: "", status: "Open"
    });

    // ── Derived stats ─────────────────────────────────────────
    const openRisks = risks.filter(r => r.status === "Open").length;
    const criticalRisks = risks.filter(r => r.severity === "Critical" || r.severity === "High").length;

    // ── Chart data ────────────────────────────────────────────
    const severityMap: any = { Low: 1, Medium: 2, High: 3, Critical: 4 };
    const radarData = risks.map(r => ({
        subject: r.cat || "Other",
        A: severityMap[r.severity] || 1,
        fullMark: 4,
    }));

    const catData = Object.entries(
        risks.reduce((acc: any, r: any) => {
            acc[r.cat || "Other"] = (acc[r.cat || "Other"] || 0) + 1;
            return acc;
        }, {})
    ).map(([name, value]) => ({ name, value }));

    const RC: any = {
        Low: "var(--c-green)", Medium: "var(--c-amber)",
        High: "var(--c-red)", Critical: "var(--c-purple)"
    };

    // ── Write helpers ─────────────────────────────────────────
    const setRiskStatus = (i: number, status: string) => {
        const next = [...risks];
        next[i] = { ...next[i], status };
        updateProject({ risks: next });
    };

    const addRisk = () => {
        if (!nr.risk.trim()) return;
        updateProject({ risks: [...risks, { ...nr, id: Date.now() }] });
        setNr({ cat: "Market", risk: "", likelihood: "Medium", impact: "Medium", severity: "Medium", mitigation: "", status: "Open" });
    };

    const removeRisk = (id: number) =>
        updateProject({ risks: risks.filter(r => r.id !== id) });

    return (
        <div className="axiom-fade-in">
            <div className="axiom-flex-sb-center" style={{ marginBottom: 20 }}>
                <h2 className="axiom-text-18-gold-ls1" style={{ margin: 0 }}>RISK COMMAND</h2>
                <Badge label="Risk Management" color="var(--c-red)" />
            </div>

            {/* ── KPIs ─────────────────────────────────────── */}
            <div className="axiom-grid-4" style={{ gap: 14, marginBottom: 20 }}>
                <KPI label="Open Risks" value={openRisks} color="var(--c-amber)" />
                <KPI label="Critical/High" value={criticalRisks} color="var(--c-red)" />
                <KPI label="Mitigated" value={risks.filter(r => r.status === "Mitigated").length} color="var(--c-green)" />
                <KPI label="Total Risks" value={risks.length} />
            </div>

            {/* ── Charts ───────────────────────────────────── */}
            <div className="axiom-grid-2" style={{ gap: 20, marginBottom: 20 }}>
                <Card title="Risk Severity Matrix">
                    <div style={{ height: 250 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                                <PolarGrid stroke="var(--c-border)" />
                                <PolarAngleAxis dataKey="subject" tick={{ fill: "var(--c-dim)", fontSize: 10 }} />
                                <Radar name="Risk" dataKey="A" stroke="var(--c-gold)" fill="var(--c-gold)" fillOpacity={0.5} />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                <Card title="Risk by Category">
                    <div style={{ height: 250 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={catData} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--c-border)" vertical={false} />
                                <XAxis dataKey="name" tick={{ fill: "var(--c-dim)", fontSize: 10 }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fill: "var(--c-dim)", fontSize: 10 }} axisLine={false} tickLine={false} />
                                <Tooltip
                                    cursor={{ fill: "var(--c-bg3)" }}
                                    contentStyle={{ background: "var(--c-bg2)", border: "1px solid var(--c-border)", borderRadius: 8 }}
                                    itemStyle={{ color: "var(--c-gold)" }}
                                />
                                <Bar dataKey="value" fill="var(--c-gold)" radius={[4, 4, 0, 0]} barSize={30} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            </div>

            {/* ── Risk Register table ───────────────────────── */}
            <Card title="Risk Register">
                <div className="axiom-table-container">
                    <table className="axiom-table">
                        <thead>
                            <tr>
                                <th className="axiom-th-left-10-dim-p10-bb">Category</th>
                                <th className="axiom-th-left-10-dim-p10-bb">Risk Description</th>
                                <th className="axiom-th-left-10-dim-p10-bb">Severity</th>
                                <th className="axiom-th-left-10-dim-p10-bb">Status</th>
                                <th className="axiom-th-right-10-dim-p10-bb">Mitigation Plan</th>
                                <th className="axiom-th-right-10-dim-p10-bb"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {risks.map((r: any, i: number) => (
                                <tr key={r.id || i}>
                                    <td className="axiom-td-11-gold-p10-bb">{r.cat}</td>
                                    <td className="axiom-td-13-p10-bb">{r.risk}</td>
                                    <td className="axiom-td-p10-bb">
                                        <Badge label={r.severity} color={RC[r.severity]} />
                                    </td>
                                    <td className="axiom-td-p10-bb">
                                        <select
                                            className="axiom-select-transparent"
                                            style={{ color: r.status === "Mitigated" ? "var(--c-green)" : "var(--c-text)" }}
                                            value={r.status}
                                            onChange={e => setRiskStatus(i, e.target.value)}
                                        >
                                            <option value="Open">Open</option>
                                            <option value="Mitigated">Mitigated</option>
                                            <option value="Closed">Closed</option>
                                        </select>
                                    </td>
                                    <td className="axiom-td-right-11-dim-p10-bb" style={{ maxWidth: 200, whiteSpace: "normal" }}>
                                        {r.mitigation}
                                    </td>
                                    <td className="axiom-td-right-p10-bb">
                                        <button
                                            onClick={() => removeRisk(r.id)}
                                            style={{ background: "none", border: "none", color: "var(--c-dim)", cursor: "pointer", fontSize: 14 }}
                                        >×</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* ── Add Risk form ─────────────────────────────── */}
            <Card title="Add Risk" >
                <div className="axiom-grid-3" style={{ gap: 12, marginBottom: 12 }}>
                    <div>
                        <label className="axiom-label">Category</label>
                        <select className="axiom-input" value={nr.cat} onChange={e => setNr({ ...nr, cat: e.target.value })}>
                            {["Market", "Entitlement", "Construction", "Environmental", "Financial", "Regulatory", "Title", "Political"].map(o => <option key={o}>{o}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="axiom-label">Likelihood</label>
                        <select className="axiom-input" value={nr.likelihood} onChange={e => setNr({ ...nr, likelihood: e.target.value })}>
                            {["Low", "Medium", "High", "Critical"].map(o => <option key={o}>{o}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="axiom-label">Impact</label>
                        <select className="axiom-input" value={nr.impact} onChange={e => setNr({ ...nr, impact: e.target.value })}>
                            {["Low", "Medium", "High", "Critical"].map(o => <option key={o}>{o}</option>)}
                        </select>
                    </div>
                </div>
                <div style={{ marginBottom: 10 }}>
                    <label className="axiom-label">Risk Description</label>
                    <input className="axiom-input" value={nr.risk} onChange={e => setNr({ ...nr, risk: e.target.value })} placeholder="Describe the risk event..." />
                </div>
                <div style={{ marginBottom: 12 }}>
                    <label className="axiom-label">Mitigation Strategy</label>
                    <textarea className="axiom-input" style={{ height: 60, resize: "vertical" }} value={nr.mitigation} onChange={e => setNr({ ...nr, mitigation: e.target.value })} placeholder="How will this risk be managed or transferred?" />
                </div>
                <button className="axiom-btn-gold" onClick={addRisk}>Add to Risk Register</button>
            </Card>
        </div>
    );
}
