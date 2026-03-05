import { useState } from "react";
import { Card, KPI, Button, AxiomTable } from "../../components/ui/components";
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
        <div className="axiom-flex-row axiom-gap-24 axiom-h-full">
            <div className="axiom-flex-1 axiom-flex-column axiom-gap-16">
                <div className="axiom-flex-sb-center">
                    <div>
                        <div className="axiom-text-24-light-ls1 axiom-mb-4">Professional Network</div>
                        <div className="axiom-text-13-dim">Manage relationships with architects, engineers, and legal counsel.</div>
                    </div>
                    <Button variant="gold" onClick={() => {
                        const name = prompt("Enter professional's name:");
                        if (name) alert(`Success: Added ${name} to your network.`);
                    }}>+ Add Professional</Button>
                </div>

                <div className="axiom-grid-4 axiom-gap-12">
                    <KPI label="👥 Total Contacts" value="142" />
                    <KPI label="🏛️ Legal & Zoning" value="18" />
                    <KPI label="📐 Architects" value="34" />
                    <KPI label="🏗️ Engineers" value="56" />
                </div>

                <div className="axiom-flex-row axiom-gap-12 axiom-mt-8">
                    <input
                        className="axiom-input-field axiom-flex-1"
                        placeholder="Search by name or firm..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        title="Search Professionals"
                    />
                    <select
                        className="axiom-select-field axiom-w-180"
                        value={filter}
                        onChange={e => setFilter(e.target.value)}
                        title="Filter Discipline"
                    >
                        <option value="All">All Disciplines</option>
                        <option value="Architect">Architects</option>
                        <option value="Engineer">Engineers</option>
                        <option value="Counsel">Legal Counsel</option>
                        <option value="Consultant">Consultants</option>
                    </select>
                </div>

                <div className="axiom-flex-1 axiom-overflow-y-auto">
                    <Card title="Network Directory">
                        <AxiomTable headers={["Professional", "Firm", "Location", "Projects", "Action"]}>
                            {filteredPros.map((p) => (
                                <tr key={p.id}>
                                    <td className="axiom-td">
                                        <div className="axiom-text-13-text-bold">{p.name}</div>
                                        <div className="axiom-text-11-dim">{p.role}</div>
                                    </td>
                                    <td className="axiom-td">{p.firm}</td>
                                    <td className="axiom-td">{p.location}</td>
                                    <td className="axiom-td">{p.projects}</td>
                                    <td className="axiom-td axiom-text-right">
                                        <Button variant="ghost" className="axiom-p4-8 axiom-text-11" onClick={() => alert(`Opening profile for ${p.name}`)}>View Profile</Button>
                                    </td>
                                </tr>
                            ))}
                        </AxiomTable>
                    </Card>
                </div>
            </div>

            <div className="axiom-w-320 axiom-flex-column axiom-gap-16 axiom-no-shrink">
                <div className="axiom-flex-1 axiom-flex-column">
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
