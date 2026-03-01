import { useProjectState } from "../../hooks/useProjectState";
import { Card, Field } from "../../components/ui/components";
import { Agent } from "../agents/Agent";
import { DEFAULT_SITE, DEFAULT_ZON } from "../../lib/defaults";

interface Props { projectId: string; }

const ENTITLEMENT_TYPES = ["Tentative Map", "Final Map", "Specific Plan", "PUD", "CUP"];
const ENTITLEMENT_STATUSES = ["Not Started", "Submitted", "Under Review", "Approved"];

const TIMELINE = [
    { phase: "Pre-Application", wks: "2-4" },
    { phase: "Application Submittal", wks: "1" },
    { phase: "Environmental Review", wks: "12-26" },
    { phase: "Staff Report", wks: "4-8" },
    { phase: "Planning Commission", wks: "2-4" },
    { phase: "Conditions of Approval", wks: "2-4" },
];

export function Entitlements({ projectId }: Props) {
    const { project, updateProject } = useProjectState(projectId);

    const site = project.site ?? DEFAULT_SITE;
    const zoning = project.zoning ?? DEFAULT_ZON;
    const survey = project.survey ?? { surveyorName: "", altaOrdered: "No" };

    // Unified updaters — each writes only its slice
    const su = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
        updateProject({ site: { ...site, [k]: e.target.value } });

    const zu = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
        updateProject({ zoning: { ...zoning, [k]: e.target.value } });

    const ru = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
        updateProject({ survey: { ...survey, [k]: e.target.value } });

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 20 }}>

                {/* ── Left column ───────────────────────────── */}
                <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

                    <Card title="Site Identification">
                        <div className="axiom-grid-3">
                            <Field label="Address">
                                <input className="axiom-input" value={site.address || ""} onChange={su("address")} title="Address" />
                            </Field>
                            <Field label="APN">
                                <input className="axiom-input" value={site.apn || ""} onChange={su("apn")} title="APN" />
                            </Field>
                            <Field label="Gross Acres">
                                <input className="axiom-input" type="number" value={site.grossAcres || ""} onChange={su("grossAcres")} title="Gross Acres" />
                            </Field>
                            <Field label="Net Acres">
                                <input className="axiom-input" type="number" value={site.netAcres || ""} onChange={su("netAcres")} title="Net Acres" />
                            </Field>
                            <Field label="Jurisdiction">
                                <input className="axiom-input" value={site.jurisdiction || ""} onChange={su("jurisdiction")} title="Jurisdiction" />
                            </Field>
                            <Field label="County">
                                <input className="axiom-input" value={site.county || ""} onChange={su("county")} title="County" />
                            </Field>
                        </div>
                    </Card>

                    <Card title="Zoning Standards">
                        <div className="axiom-grid-3">
                            <Field label="Zone">
                                <input className="axiom-input" value={zoning.zone || ""} onChange={zu("zone")} title="Zone" />
                            </Field>
                            <Field label="Max Density (du/ac)">
                                <input className="axiom-input" value={zoning.du_ac || ""} onChange={zu("du_ac")} title="Max Density" />
                            </Field>
                            <Field label="Max Height">
                                <input className="axiom-input" value={zoning.maxHeight || ""} onChange={zu("maxHeight")} title="Max Height" />
                            </Field>
                            <Field label="Front Setback">
                                <input className="axiom-input" value={zoning.frontSetback || ""} onChange={zu("frontSetback")} title="Front Setback" />
                            </Field>
                            <Field label="Rear Setback">
                                <input className="axiom-input" value={zoning.rearSetback || ""} onChange={zu("rearSetback")} title="Rear Setback" />
                            </Field>
                            <Field label="Side Setback">
                                <input className="axiom-input" value={zoning.sideSetback || ""} onChange={zu("sideSetback")} title="Side Setback" />
                            </Field>
                        </div>
                    </Card>

                    <Card title="Entitlement Pathway">
                        <div className="axiom-grid-2" style={{ marginBottom: 15 }}>
                            <Field label="Type">
                                <select
                                    className="axiom-select"
                                    value={zoning.entitlementType || "Tentative Map"}
                                    onChange={zu("entitlementType")}
                                    title="Type"
                                >
                                    {ENTITLEMENT_TYPES.map(o => <option key={o}>{o}</option>)}
                                </select>
                            </Field>
                            <Field label="Status">
                                <select
                                    className="axiom-select"
                                    value={zoning.entitlementStatus || "Not Started"}
                                    onChange={zu("entitlementStatus")}
                                    title="Status"
                                >
                                    {ENTITLEMENT_STATUSES.map(o => <option key={o}>{o}</option>)}
                                </select>
                            </Field>
                        </div>

                        <div style={{ borderTop: "1px solid var(--c-border)", paddingTop: 15 }}>
                            <div style={{ fontSize: 10, color: "var(--c-gold)", letterSpacing: 2, marginBottom: 10, textTransform: "uppercase" }}>
                                Estimated Timeline
                            </div>
                            {TIMELINE.map((t, i) => (
                                <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid var(--c-bg)" }}>
                                    <span style={{ fontSize: 13, color: "var(--c-text)" }}>{t.phase}</span>
                                    <span style={{ fontSize: 12, color: "var(--c-gold)" }}>{t.wks} wks</span>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>

                {/* ── Right column ──────────────────────────── */}
                <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                    <Card title="Zoning Agent">
                        <Agent
                            id="zoning"
                            system={`You are a zoning and entitlement expert. Project site: ${site.address || "unknown"}, Zone: ${zoning.zone || "unknown"}, Entitlement type: ${zoning.entitlementType || "Tentative Map"}.`}
                            placeholder="Ask about setbacks, density, or approval process..."
                        />
                    </Card>

                    <Card title="Survey / ALTA">
                        <Field label="Surveyor">
                            <input className="axiom-input" value={survey.surveyorName || ""} onChange={ru("surveyorName")} title="Surveyor" />
                        </Field>
                        <Field label="Ordered?">
                            <select className="axiom-select" value={survey.altaOrdered || "No"} onChange={ru("altaOrdered")} title="Ordered?">
                                <option>No</option>
                                <option>Pending</option>
                                <option>Yes</option>
                            </select>
                        </Field>
                        <Field label="Notes">
                            <textarea
                                className="axiom-input"
                                style={{ height: 60, resize: "vertical" }}
                                value={survey.notes || ""}
                                onChange={ru("notes") as any}
                                placeholder="Boundary dispute issues, easement findings, etc."
                            />
                        </Field>
                    </Card>
                </div>
            </div>
        </div>
    );
}
