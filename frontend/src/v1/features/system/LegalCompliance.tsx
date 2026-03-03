import { Card, KPI, Button, Badge } from "../../components/ui/components";
import { Agent } from "../agents/Agent";

const MOCK_COMPLIANCE = [
    { id: "c1", requirement: "Environmental Impact Report (EIR)", jurisdiction: "State (CEQA)", status: "Pending Review", due: "Oct 15, 2026", owner: "E. Rodriguez" },
    { id: "c2", requirement: "Zoning Variance Application", jurisdiction: "City Planning", status: "Approved", due: "Sep 01, 2026", owner: "S. Jenkins" },
    { id: "c3", requirement: "Traffic Study Submission", jurisdiction: "Dept of Transportation", status: "Drafting", due: "Nov 12, 2026", owner: "M. Webb" },
    { id: "c4", requirement: "Affordable Housing Allocation Plan", jurisdiction: "County Housing Auth", status: "Not Started", due: "Dec 05, 2026", owner: "Legal Team" },
    { id: "c5", requirement: "Building Permit #B-2026-892", jurisdiction: "Dept of Building", status: "In Review", due: "Oct 30, 2026", owner: "D. Chen" },
];

export function LegalCompliance() {
    return (
        <div style={{ display: "flex", gap: 24, height: "100%" }}>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                        <div style={{ fontSize: 24, fontWeight: 300, color: "var(--c-text)", marginBottom: 4 }}>Legal & Compliance</div>
                        <div style={{ color: "var(--c-dim)", fontSize: 13 }}>Track regulatory requirements, filings, and legal obligations.</div>
                    </div>
                    <Button variant="gold">+ New Filing</Button>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12 }}>
                    <KPI label="⚖️ Active Filings" value="12" />
                    <KPI label="⏳ Pending Approval" value="4" />
                    <KPI label="✅ Approved" value="7" />
                    <KPI label="⚠️ At Risk" value="1" color="var(--c-red)" />
                </div>

                <div style={{ flex: 1, overflowY: "auto" }}>
                    <Card title="Compliance Tracker">
                        <div style={{ margin: "-16px" }}>
                            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                                <thead>
                                    <tr>
                                        <th className="axiom-th" style={{ paddingLeft: 16 }}>Requirement</th>
                                        <th className="axiom-th">Jurisdiction</th>
                                        <th className="axiom-th">Status</th>
                                        <th className="axiom-th">Due Date</th>
                                        <th className="axiom-th">Owner</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {MOCK_COMPLIANCE.map(c => {
                                        let badgeColor = "var(--c-dim)";
                                        if (c.status === "Approved") badgeColor = "var(--c-green)";
                                        if (c.status === "Pending Review" || c.status === "In Review") badgeColor = "var(--c-amber)";
                                        if (c.status === "Drafting") badgeColor = "var(--c-blue)";

                                        return (
                                            <tr key={c.id} style={{ borderBottom: "1px solid var(--c-border)" }}>
                                                <td className="axiom-td" style={{ paddingLeft: 16, color: "var(--c-text)", fontWeight: 500 }}>
                                                    {c.requirement}
                                                </td>
                                                <td className="axiom-td">{c.jurisdiction}</td>
                                                <td className="axiom-td">
                                                    <Badge label={c.status} color={badgeColor} />
                                                </td>
                                                <td className="axiom-td">{c.due}</td>
                                                <td className="axiom-td">{c.owner}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>
            </div>

            <div style={{ width: 320, display: "flex", flexDirection: "column", gap: 16, flexShrink: 0 }}>
                <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                    <Card title="Legal Intelligence">
                        <Agent
                            id="LegalAdvisor"
                            system="You are an AI Legal & Compliance Advisor for a real estate development firm. Help the user understand local zoning codes, environmental regulations (like CEQA), entitlement timelines, and general legal obligations. Provide strategic advice on navigating the approval process."
                            placeholder="Ask about compliance..."
                        />
                    </Card>
                </div>
            </div>
        </div>
    );
}
