import { useProjectState } from "../../hooks/useProjectState";
import { Card, KPI, Field } from "../../components/ui/components";
import { Agent } from "../agents/Agent";

interface Props { projectId: string; }

const DEFAULT_UTILITIES = [
    { name: "Water", provider: "", status: "Verify" },
    { name: "Sewer", provider: "", status: "Verify" },
    { name: "Electric", provider: "", status: "Verify" },
    { name: "Gas", provider: "", status: "Verify" },
    { name: "Telecom", provider: "", status: "Verify" },
];

export function Infrastructure({ projectId }: Props) {
    const { project, updateProject } = useProjectState(projectId);

    const utilities: any[] = project.utilities?.length ? project.utilities : DEFAULT_UTILITIES;
    const env: any = project.env ?? {};

    const upd = (i: number, k: string, v: string) => {
        const d = [...utilities];
        d[i] = { ...d[i], [k]: v };
        updateProject({ utilities: d });
    };

    const eu = (k: string) => (e: any) =>
        updateProject({ env: { ...env, [k]: e.target.value } });

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 20 }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                    <Card title="Utility & Service Plan">
                        <table className="axiom-table">
                            <thead>
                                <tr>
                                    <th className="axiom-th">SERVICE</th>
                                    <th className="axiom-th">PROVIDER</th>
                                    <th className="axiom-th">STATUS</th>
                                </tr>
                            </thead>
                            <tbody>
                                {utilities.map((s: any, i: number) => (
                                    <tr key={i} className="premium-hover">
                                        <td className="axiom-td" style={{ color: "var(--c-gold)", fontWeight: 700 }}>{s.name}</td>
                                        <td className="axiom-td">
                                            <input
                                                className="axiom-input"
                                                style={{ background: "transparent", border: "none", padding: 0 }}
                                                value={s.provider || ""}
                                                onChange={e => upd(i, "provider", e.target.value)}
                                                placeholder="Enter district..."
                                            />
                                        </td>
                                        <td className="axiom-td">
                                            <select
                                                className="axiom-select"
                                                style={{ fontSize: 11, padding: "2px 6px" }}
                                                value={s.status}
                                                onChange={e => upd(i, "status", e.target.value)}
                                                title="Status"
                                            >
                                                {["Verify", "Available", "Capacity Issue", "Extension Req"].map(o => <option key={o}>{o}</option>)}
                                            </select>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </Card>

                    <Card title="Environmental & Flood">
                        <div className="axiom-grid-2">
                            <Field label="Flood Zone">
                                <select className="axiom-select" value={env.floodZone} onChange={eu("floodZone")} title="Flood Zone">
                                    <option>Zone X</option>
                                    <option>Zone AE</option>
                                    <option>Zone A</option>
                                </select>
                            </Field>
                            <Field label="Phase I ESA">
                                <select className="axiom-select" value={env.phase1} onChange={eu("phase1")} title="Phase I ESA">
                                    <option>No</option>
                                    <option>Ordered</option>
                                    <option>Received - Clean</option>
                                    <option>Issues Found</option>
                                </select>
                            </Field>
                            <Field label="Wetlands">
                                <select className="axiom-select" value={env.wetlands} onChange={eu("wetlands")} title="Wetlands">
                                    <option>None Observed</option>
                                    <option>Potential</option>
                                    <option>Confirmed</option>
                                </select>
                            </Field>
                            <Field label="CEQA Category">
                                <select className="axiom-select" value={env.ceqa} onChange={eu("ceqa")} title="CEQA Category">
                                    <option>Categorical Exemption</option>
                                    <option>Neg Dec</option>
                                    <option>MND</option>
                                    <option>EIR</option>
                                </select>
                            </Field>
                        </div>
                    </Card>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                    <Card title="Infrastructure Agent">
                        <Agent id="infrastructure" system="You are a civil engineer and environmental consultant." placeholder="Ask about utility extension, drainage, or ESA..." />
                    </Card>
                    <KPI label="Flood Risk" value={env.floodZone === "Zone X" ? "Low" : "High"} color={env.floodZone === "Zone X" ? "var(--c-green)" : "var(--c-red)"} />
                    <KPI label="Wetlands" value={env.wetlands === "Confirmed" ? "Impacted" : "Clear"} color={env.wetlands === "Confirmed" ? "var(--c-red)" : "var(--c-green)"} />
                </div>
            </div>
        </div>
    );
}
