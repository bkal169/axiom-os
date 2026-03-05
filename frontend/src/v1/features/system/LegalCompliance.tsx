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
        <div className="axiom-flex-gap-24 axiom-h-full">
            <div className="axiom-flex-col axiom-flex-gap-16 axiom-flex-1">
                <div className="axiom-flex-sb-center">
                    <div>
                        <div className="axiom-page-title">Legal & Compliance</div>
                        <div className="axiom-text-13-dim">Track regulatory requirements, filings, and legal obligations.</div>
                    </div>
                    <Button variant="gold" onClick={() => {
                        const title = prompt("Enter new filing title:");
                        if (title) alert(`Success: Created draft filing for '${title}'`);
                    }}>+ New Filing</Button>
                </div>

                <div className="axiom-grid-4 axiom-flex-gap-12">
                    <KPI label="⚖️ Active Filings" value="12" />
                    <KPI label="⏳ Pending Approval" value="4" color="var(--c-amber)" />
                    <KPI label="✅ Approved" value="7" color="var(--c-teal)" />
                    <KPI label="⚠️ At Risk" value="1" color="var(--c-red)" />
                </div>

                <div className="axiom-flex-1 axiom-overflow-y-auto">
                    <Card title="Compliance Tracker">
                        <div className="axiom-card-neg-margin">
                            <table className="axiom-table">
                                <thead>
                                    <tr>
                                        <th className="axiom-th axiom-pl-16">Requirement</th>
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
                                            <tr key={c.id}>
                                                <td className="axiom-td axiom-pl-16 axiom-text-sub axiom-text-500">
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

            <div className="axiom-w-320 axiom-flex-col axiom-flex-gap-16 axiom-shrink-0">
                <div className="axiom-flex-col axiom-flex-1">
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
