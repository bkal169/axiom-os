import { useState } from "react";
import { Card, KPI, Badge, Progress, Button, Field, AxiomTable } from "../../components/ui/components";
import { Tabs } from "../../components/ui/layout";
import { useLS } from "../../hooks/useLS";

interface Risk {
    id: number;
    title: string;
    impact: "Low" | "Medium" | "High" | "Critical";
    probability: number; // 0-100
    owner: string;
    status: string;
}

const IMPACT_COLORS: Record<string, string> = { Critical: "var(--c-red)", High: "var(--c-amber)", Medium: "var(--c-blue)", Low: "var(--c-dim)" };

export function RiskRegistry({ projectId: _projectId }: { projectId: string }) {
    const [risks, setRisks] = useLS("axiom_risks", [
        { id: 1, title: "Utility Connection Delay", impact: "High", probability: 65, owner: "Thompson", status: "Mitigating" },
        { id: 2, title: "Steel Tariff Price Hike", impact: "Medium", probability: 40, owner: "Procurement", status: "Monitoring" },
        { id: 3, title: "Nesting Bird Season", impact: "High", probability: 90, owner: "Environmental", status: "Action Required" },
    ]);

    const [nr, setNr] = useState<Omit<Risk, "id">>({ title: "", impact: "Medium", probability: 50, owner: "", status: "Identified" });

    const addRisk = () => {
        if (!nr.title) return;
        setRisks([...(risks as Risk[]), { ...nr, id: Date.now() }]);
        setNr({ title: "", impact: "Medium", probability: 50, owner: "", status: "Identified" });
    };

    const avgProb = risks.length > 0 ? (risks as Risk[]).reduce((s, r) => s + r.probability, 0) / risks.length : 0;
    const criticalCount = (risks as Risk[]).filter(r => r.impact === "Critical" || r.impact === "High").length;

    return (
        <Tabs tabs={["Active Risks", "Mitigation Strategy", "Historical Data"]}>
            <div className="axiom-stack-20">
                <div className="axiom-grid-3 axiom-mb-15">
                    <KPI label="Critical / High Risks" value={criticalCount} color="var(--c-red)" />
                    <KPI label="Avg Probability" value={`${Math.round(avgProb)}%`} color="var(--c-amber)" />
                    <KPI label="Total Registered" value={risks.length} />
                </div>

                <div className="axiom-grid-6-4 axiom-gap-20">
                    <Card title="Project Risk Registry" className="axiom-flex-1">
                        <AxiomTable headers={["Risk Item", "Impact", "Probability", "Owner", "Status"]}>
                            {(risks as Risk[]).map(r => (
                                <tr key={r.id}>
                                    <td className="axiom-td-13-bold">{r.title}</td>
                                    <td className="axiom-td">
                                        <Badge label={r.impact} color={IMPACT_COLORS[r.impact]} />
                                    </td>
                                    <td className="axiom-td-w-120">
                                        <div className="axiom-flex-sb axiom-mb-2">
                                            <span className="axiom-text-9-dim">{r.probability}%</span>
                                        </div>
                                        <Progress value={r.probability} color={r.probability > 75 ? "var(--c-red)" : "var(--c-gold)"} />
                                    </td>
                                    <td className="axiom-td-dim">{r.owner}</td>
                                    <td className="axiom-td">
                                        <Badge label={r.status} color="var(--c-teal)" />
                                    </td>
                                </tr>
                            ))}
                        </AxiomTable>
                    </Card>

                    <Card title="Register New Risk" className="axiom-w-300">
                        <div className="axiom-stack-12">
                            <Field label="Risk Description">
                                <input
                                    className="axiom-input"
                                    value={nr.title}
                                    onChange={e => setNr({ ...nr, title: e.target.value })}
                                    title="Risk Description"
                                />
                            </Field>
                            <Field label="Impact Level">
                                <select
                                    className="axiom-input"
                                    value={nr.impact}
                                    onChange={e => setNr({ ...nr, impact: e.target.value as any })}
                                    title="Impact Level"
                                >
                                    {Object.keys(IMPACT_COLORS).map(k => <option key={k}>{k}</option>)}
                                </select>
                            </Field>
                            <Field label="Probability (%)">
                                <input
                                    className="axiom-input"
                                    type="number"
                                    value={nr.probability}
                                    onChange={e => setNr({ ...nr, probability: +e.target.value })}
                                    title="Probability Percentage"
                                />
                            </Field>
                            <Field label="Assign Owner">
                                <input
                                    className="axiom-input"
                                    value={nr.owner}
                                    onChange={e => setNr({ ...nr, owner: e.target.value })}
                                    title="Risk Owner"
                                />
                            </Field>
                            <Button variant="gold" label="Log Risk" onClick={addRisk} className="axiom-mt-10" />
                        </div>
                    </Card>
                </div>
            </div>

            <div>
                <Card title="AI Mitigation Insights">
                    <div className="axiom-p-30 axiom-text-center">
                        <div className="axiom-text-14-gold axiom-mb-10">Intelligent Risk Correlation Enabled</div>
                        <div className="axiom-text-11-dim">
                            Axiom is analyzing external market data and historical project performance to predict potential "Utility Connection Delay" impacts based on current municipal backlog.
                        </div>
                    </div>
                </Card>
            </div>
        </Tabs>
    );
}
