import { useState } from "react";
import { Card, Button } from "../../components/ui/components";
import { Agent } from "./Agent";

const AGENTS = [
    { id: "Acquisition Scout", icon: "A", color: "#EAC15C", desc: "Identifies and scores acquisition opportunities based on your criteria", system: "You are a real estate acquisition analyst. Help identify and evaluate potential land acquisition opportunities and score sites against development criteria.", placeholder: "Describe your acquisition criteria and I'll help evaluate opportunities..." },
    { id: "Zoning Navigator", icon: "Z", color: "#4A90E2", desc: "Decodes zoning codes and maps entitlement pathways", system: "You are a land use attorney and zoning consultant. Decode zoning codes, identify entitlement pathways, advise on variances and density bonuses.", placeholder: "Describe the zoning situation and I'll map the entitlement pathway..." },
    { id: "Appraisal Analyst", icon: "V", color: "#3B8C8C", desc: "Performs market value analysis using comparable sales methodology", system: "You are a certified real estate appraiser specializing in land and subdivision analysis. Apply the sales comparison approach, income approach, and land residual method.", placeholder: "Provide comp data and I'll perform an appraisal-grade value analysis..." },
    { id: "Construction Estimator", icon: "C", color: "#F5A623", desc: "Generates construction cost estimates from RSMeans and market data", system: "You are a construction cost estimator specializing in residential subdivision and land development. Provide detailed cost breakdowns for grading, utilities, streets, lots, and vertical construction.", placeholder: "Describe the project scope and I'll generate a detailed cost estimate..." },
    { id: "Environmental Scout", icon: "E", color: "#7ED321", desc: "Screens for environmental constraints and CEQA requirements", system: "You are an environmental planner specializing in CEQA, wetlands, biological resources, and Phase I/II ESAs for California residential development.", placeholder: "Describe the site location and I'll screen for environmental constraints..." },
    { id: "Permit Coordinator", icon: "P", color: "#BD10E0", desc: "Sequences permit applications and maps agency dependencies", system: "You are a permit expediter and municipal liaison. Map permit sequences, estimate agency timelines, identify critical path items, and advise on agency relationship strategies.", placeholder: "Describe your project and jurisdiction and I'll map the permit sequence..." },
    { id: "Financial Underwriter", icon: "F", color: "#D0021B", desc: "Underwrites deals and stress-tests financial assumptions", system: "You are a real estate development underwriter. Underwrite development deals, stress-test assumptions, calculate IRR and equity multiples, and size construction loans.", placeholder: "Share your pro forma and I'll underwrite the deal..." },
    { id: "Title Decoder", icon: "T", color: "#F8E71C", desc: "Interprets title reports and identifies encumbrances", system: "You are a real estate title officer specializing in land title issues. Interpret preliminary title reports, identify exceptions, assess encumbrance risks, and advise on curative actions.", placeholder: "Paste title report exceptions and I'll decode them..." },
];

export function AgentHub() {
    const [active, setActive] = useState<number | null>(null);

    if (active !== null) {
        const a = AGENTS[active];
        return (
            <div>
                <div className="axiom-flex-center-gap-15" style={{ marginBottom: 20 }}>
                    <Button onClick={() => setActive(null)}>← Back to Hub</Button>
                    <div className="axiom-text-16-bold" style={{ color: a.color }}>{a.id}</div>
                    <div className="axiom-text-12-dim">{a.desc}</div>
                </div>
                <Card title={`${a.id} — Live Session`}>
                    <div style={{ height: 600 }}>
                        <Agent id={a.id} system={a.system} placeholder={a.placeholder} />
                    </div>
                </Card>
            </div>
        );
    }

    return (
        <div className="axiom-grid-auto-fill-280" style={{ gap: 15 }}>
            {AGENTS.map((a, i) => (
                <div key={i}
                    onClick={() => setActive(i)}
                    className="axiom-agent-card"
                    style={{ borderLeftColor: a.color }}
                >
                    <div className="axiom-text-24-bold" style={{ color: a.color, marginBottom: 10 }}>{a.icon}</div>
                    <div className="axiom-text-14-bold" style={{ marginBottom: 5 }}>{a.id}</div>
                    <div className="axiom-text-11-dim-lh14" style={{ marginBottom: 15 }}>{a.desc}</div>
                    <Button variant="gold" className="w-full" onClick={(e?: any) => { e?.stopPropagation(); setActive(i); }}>Launch Agent</Button>
                </div>
            ))}
        </div>
    );
}
