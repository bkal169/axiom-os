import { useState } from "react";
import { Card, Button } from "../../components/ui/components";
import { Agent } from "./Agent";

const AGENTS = [
    { id: "Acquisition Scout", icon: "A", color: "var(--c-gold)", desc: "Identifies and scores acquisition opportunities.", system: "You are a real estate acquisition analyst. Help identify and evaluate potential land acquisition opportunities." },
    { id: "Zoning Navigator", icon: "Z", color: "var(--c-blue)", desc: "Decodes zoning codes and maps entitlement pathways.", system: "You are a land use attorney and zoning consultant. Decode zoning codes and identify entitlement pathways." },
    { id: "Appraisal Analyst", icon: "V", color: "var(--c-teal)", desc: "Performs market value analysis using comps.", system: "You are a certified real estate appraiser specializing in land and subdivision analysis." },
    { id: "Construction Estimator", icon: "C", color: "var(--c-amber)", desc: "Generates construction cost estimates.", system: "You are a construction cost estimator specializing in residential subdivision and land development." },
    { id: "Environmental Scout", icon: "E", color: "var(--c-green)", desc: "Screens for environmental constraints.", system: "You are an environmental planner specializing in CEQA and wetlands." },
    { id: "Permit Coordinator", icon: "P", color: "var(--c-purple)", desc: "Sequences permit applications.", system: "You are a permit expediter and municipal liaison. Map permit sequences and estimate timelines." },
    { id: "Financial Underwriter", icon: "F", color: "var(--c-red)", desc: "Underwrites deals and stress-tests assumptions.", system: "You are a real estate development underwriter. Analyze financial assumptions and return metrics." },
    { id: "Risk Profiler", icon: "R", color: "var(--c-amber)", desc: "Identifies and quantifies risk exposure.", system: "You are a real estate development risk manager. Identify hidden risks and develop mitigation strategies." },
    { id: "Absorption Modeler", icon: "M", color: "var(--c-teal)", desc: "Models lot absorption and sell-out projections.", system: "You are a housing market analyst. Analyze supply/demand dynamics and project absorption rates." },
    { id: "Deal Structurer", icon: "D", color: "var(--c-blue)", desc: "Optimizes deal structure for equity and debt.", system: "You are a real estate deal structurer. Optimize capital stack configurations and equity waterfalls." },
    { id: "Title Decoder", icon: "T", color: "var(--c-gold)", desc: "Interprets title reports and identifies encumbrances.", system: "You are a real estate title officer. Interpret title reports and assess encumbrance risks." },
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
