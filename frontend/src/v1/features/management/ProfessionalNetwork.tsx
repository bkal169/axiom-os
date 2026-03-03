import { useState } from "react";
import { Card, KPI, Button } from "../../components/ui/components";
import { Agent } from "../agents/Agent";

const MOCK_PROS = [
    { id: "p1", name: "David Chen", role: "Principal Architect", firm: "Chen & Associates", location: "Miami, FL", rating: 4.8, projects: 12 },
    { id: "p2", name: "Sarah Jenkins", role: "Zoning Counsel", firm: "Jenkins Legal Group", location: "Orlando, FL", rating: 4.9, projects: 5 },
    { id: "p3", name: "Marcus Webb", role: "Civil Engineer", firm: "Apex Engineering", location: "Tampa, FL", rating: 4.6, projects: 8 },
    { id: "p4", name: "Elena Rodriguez", role: "Environmental Consultant", firm: "EcoTerra Solutions", location: "Jacksonville, FL", rating: 4.7, projects: 3 },
    { id: "p5", name: "James Holden", role: "Structural Engineer", firm: "Holden Structures", location: "Miami, FL", rating: 4.9, projects: 15 },
];

export function ProfessionalNetwork() {
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("All");

    const filteredPros = MOCK_PROS.filter(p => {
        if (filter !== "All" && !p.role.includes(filter)) return false;
        if (search && !p.name.toLowerCase().includes(search.toLowerCase()) && !p.firm.toLowerCase().includes(search.toLowerCase())) return false;
        return true;
    });

    return (
        <div style={{ display: "flex", gap: 24, height: "100%" }}>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                        <div style={{ fontSize: 24, fontWeight: 300, color: "var(--c-text)", marginBottom: 4 }}>Professional Network</div>
                        <div style={{ color: "var(--c-dim)", fontSize: 13 }}>Manage relationships with architects, engineers, and legal counsel.</div>
                    </div>
                    <Button variant="gold">+ Add Professional</Button>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12 }}>
                    <KPI label="👥 Total Contacts" value="142" />
                    <KPI label="🏛️ Legal & Zoning" value="18" />
                    <KPI label="📐 Architects" value="34" />
                    <KPI label="🏗️ Engineers" value="56" />
                </div>

                <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
                    <input
                        style={{ flex: 1, background: "var(--c-bg)", border: "1px solid var(--c-border)", color: "var(--c-text)", padding: "8px 12px", borderRadius: 4, fontSize: 13 }}
                        placeholder="Search by name or firm..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                    <select
                        style={{ width: 180, background: "var(--c-bg)", border: "1px solid var(--c-border)", color: "var(--c-text)", padding: "8px 12px", borderRadius: 4, fontSize: 13 }}
                        value={filter}
                        onChange={e => setFilter(e.target.value)}
                    >
                        <option value="All">All Disciplines</option>
                        <option value="Architect">Architects</option>
                        <option value="Engineer">Engineers</option>
                        <option value="Counsel">Legal Counsel</option>
                        <option value="Consultant">Consultants</option>
                    </select>
                </div>

                <div style={{ flex: 1, overflowY: "auto" }}>
                    <Card title="Network Directory">
                        <div style={{ margin: "-16px" }}>
                            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                                <thead>
                                    <tr>
                                        <th className="axiom-th" style={{ paddingLeft: 16 }}>Professional</th>
                                        <th className="axiom-th">Firm</th>
                                        <th className="axiom-th">Location</th>
                                        <th className="axiom-th">Projects</th>
                                        <th className="axiom-th" style={{ paddingRight: 16, textAlign: "right" }}>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredPros.map(p => (
                                        <tr key={p.id} style={{ borderBottom: "1px solid var(--c-border)" }}>
                                            <td className="axiom-td" style={{ paddingLeft: 16 }}>
                                                <div style={{ color: "var(--c-text)", fontWeight: 500 }}>{p.name}</div>
                                                <div style={{ fontSize: 11, color: "var(--c-dim)" }}>{p.role}</div>
                                            </td>
                                            <td className="axiom-td">{p.firm}</td>
                                            <td className="axiom-td">{p.location}</td>
                                            <td className="axiom-td">{p.projects}</td>
                                            <td className="axiom-td" style={{ paddingRight: 16, textAlign: "right" }}>
                                                <Button variant="ghost" style={{ padding: "4px 8px", fontSize: 11 }}>View Profile</Button>
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredPros.length === 0 && (
                                        <tr>
                                            <td colSpan={5} style={{ padding: 32, textAlign: "center", color: "var(--c-dim)" }}>
                                                No professionals found matching your search.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>
            </div>

            <div style={{ width: 320, display: "flex", flexDirection: "column", gap: 16, flexShrink: 0 }}>
                <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                    <Card title="Relationship Intelligence">
                        <Agent
                            id="NetworkAdvisor"
                            system="You are an AI Relationship Manager for a real estate development firm. Help the user find the right professional for their project, summarize past performance of vendors, and suggest new connections based on project needs (e.g. asking for a Miami zoning lawyer)."
                            placeholder="Ask about your network..."
                        />
                    </Card>
                </div>
            </div>
        </div>
    );
}
