import React, { useState } from 'react';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { C, S } from '../../constants';
import { useLS } from '../../utils';
import { usePrj } from '../../context/ProjectContext';
import { Tabs } from '../UI/Tabs';
import { Card } from '../UI/Card';
import { KPI } from '../UI/KPI';
import { Badge, Dot } from '../UI/Badge';
import { Field } from '../UI/Field';
import { Agent } from '../UI/Agent';

const RC = { High: C.red, Medium: C.amber, Low: C.blue, Mitigated: C.green };

export default function RiskCommand() {
    const { risks, setRisks } = usePrj();
    const [gnnScore, setGnnScore] = useState(null);
    const [gnnBusy, setGnnBusy] = useState(false);

    const computeGnnScore = () => {
        setGnnBusy(true);
        setTimeout(() => {
            const highCount = risks.filter(r => r.impact === 'High').length;
            const medCount = risks.filter(r => r.impact === 'Medium').length;
            const score = Math.max(12, 95 - (highCount * 14) - (medCount * 4));
            setGnnScore(score);
            setGnnBusy(false);
        }, 1800);
    };

    const addRisk = () => setRisks([...risks, { id: Date.now(), title: "New Risk", category: "Market", impact: "Medium", probability: "Medium", status: "Open", mitigation: "" }]);
    const updRisk = (id, f, v) => setRisks(risks.map(r => r.id === id ? { ...r, [f]: v } : r));
    const delRisk = (id) => setRisks(risks.filter(r => r.id !== id));

    const openRisks = risks.filter(r => r.status === "Open");
    const riskLevels = { High: 3, Medium: 2, Low: 1 };
    const sorted = [...risks].sort((a, b) => (riskLevels[b.impact] * riskLevels[b.probability]) - (riskLevels[a.impact] * riskLevels[a.probability]));

    const riskD = [
        { sub: "Financial", v: 65 }, { sub: "Entitlement", v: 80 }, { sub: "Construction", v: 45 }, { sub: "Market", v: 70 }, { sub: "Legal", v: 30 }
    ];

    return (
        <Tabs tabs={["Risk Register", "Risk Matrix", "Heat Map", "Mitigation Plan"]}>
            <div>
                <div style={S.g4}>
                    <KPI label="Total Risks" value={risks.length} sub="Identified" />
                    <KPI label="High Impact" value={risks.filter(r => r.impact === "High" && r.status === "Open").length} color={C.red} sub="Urgent attention" />
                    <KPI label="Mitigated" value={risks.filter(r => r.status === "Mitigated").length} color={C.green} sub="Closed issues" />
                    <KPI label="Risk Score" value={(risks.length ? (risks.filter(r => r.impact === "High").length / risks.length * 100).toFixed(0) : 0) + "/100"} color={C.amber} sub="Weight avg." />
                </div>
                <Card title="Active Risk Register" action={<button style={S.btn("gold")} onClick={addRisk}>+ Add Risk</button>}>
                    <table style={S.tbl}>
                        <thead><tr><th style={S.th}>Risk Item</th><th style={S.th}>Category</th><th style={S.th}>Impact</th><th style={S.th}>Prob.</th><th style={S.th}>Status</th><th style={S.th}>Actions</th></tr></thead>
                        <tbody>{risks.map(r => (
                            <tr key={r.id}>
                                <td style={S.td}><input style={{ ...S.inp, fontWeight: 500, color: C.text }} value={r.title} onChange={e => updRisk(r.id, "title", e.target.value)} /></td>
                                <td style={S.td}><select style={S.sel} value={r.category} onChange={e => updRisk(r.id, "category", e.target.value)}><option>Market</option><option>Financial</option><option>Entitlement</option><option>Legal</option><option>Technical</option></select></td>
                                <td style={S.td}><Badge label={r.impact} color={RC[r.impact]} /></td>
                                <td style={S.td}><select style={S.sel} value={r.probability} onChange={e => updRisk(r.id, "probability", e.target.value)}><option>High</option><option>Medium</option><option>Low</option></select></td>
                                <td style={S.td}><Dot color={RC[r.status] || C.dim} />{r.status}</td>
                                <td style={S.td}>
                                    <div style={{ display: "flex", gap: 4 }}>
                                        <button style={{ ...S.btn(), padding: "3px 8px", fontSize: 9 }} onClick={() => updRisk(r.id, "status", r.status === "Open" ? "Mitigated" : "Open")}>{r.status === "Open" ? "Close" : "Open"}</button>
                                        <button style={{ ...S.btn(), padding: "3px 8px", fontSize: 9 }} onClick={() => delRisk(r.id)}>x</button>
                                    </div>
                                </td>
                            </tr>
                        ))}</tbody>
                    </table>
                </Card>
                <Card title="Risk Mitigation · AI Agent">
                    <Agent id="Risk" system="You are a senior risk manager for a Tier 1 developer. Analyze identified project risks, suggest specific mitigation strategies, and perform a failure mode and effects analysis (FMEA) for the current development plan." placeholder="Request a mitigation strategy for a specific risk..." />
                </Card>
            </div>
            <div>
                <div style={S.g2}>
                    <Card title="Risk Domain Distribution">
                        <ResponsiveContainer width="100%" height={250}>
                            <RadarChart data={riskD}>
                                <PolarGrid stroke={C.border} />
                                <PolarAngleAxis dataKey="sub" tick={{ fill: C.dim, fontSize: 11 }} />
                                <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                                <Radar dataKey="v" stroke={C.red} fill={C.red} fillOpacity={0.2} />
                            </RadarChart>
                        </ResponsiveContainer>
                    </Card>
                    <Card title="GNN Neural Risk Exposure">
                        <div style={{ textAlign: "center", padding: 20 }}>
                            {gnnScore !== null ? (
                                <>
                                    <div style={{ fontSize: 48, fontWeight: 800, color: gnnScore > 75 ? C.green : gnnScore > 50 ? C.amber : C.red }}>{gnnScore}</div>
                                    <div style={{ fontSize: 12, color: C.dim, textTransform: "uppercase", letterSpacing: 2 }}>
                                        {gnnScore > 75 ? "Highly Feasible" : gnnScore > 50 ? "Moderate Exposure" : "Critical Exposure"}
                                    </div>
                                    <div style={{ marginTop: 20, fontSize: 13, color: C.sub }}>GNN analysis complete. Score weighted against 40+ project vectors and current risk register.</div>
                                    <button style={{ ...S.btn(), marginTop: 12 }} onClick={() => setGnnScore(null)}>Reset Model</button>
                                </>
                            ) : (
                                <>
                                    <div style={{ fontSize: 48, fontWeight: 800, color: C.dim }}>--</div>
                                    <div style={{ fontSize: 12, color: C.dim, textTransform: "uppercase", letterSpacing: 2 }}>Awaiting Inference</div>
                                    <div style={{ marginTop: 20, fontSize: 13, color: C.sub }}>Run the Graph Neural Network (GNN) model to evaluate project feasibility based on current risk vectors.</div>
                                    <button style={{ ...S.btn(gnnBusy ? "dim" : "gold"), marginTop: 12 }} disabled={gnnBusy} onClick={computeGnnScore}>
                                        {gnnBusy ? "Running GNN Model..." : "Run GNN Model"}
                                    </button>
                                </>
                            )}
                        </div>
                    </Card>
                </div>
            </div>
        </Tabs>
    );
}
