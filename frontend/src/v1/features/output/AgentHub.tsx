import { useState } from "react";
import { Card, Badge, Button } from "../../components/ui/components";
import { Agent } from "../agents/Agent";

export function AgentHub() {
    const agents = [
        { id: "Zoning Navigator", icon: "Z", color: "var(--c-blue)", desc: "Decodes zoning codes and maps entitlement pathways", system: "You are a land use attorney and zoning consultant. Decode zoning codes, identify entitlement pathways, advise on variances and density bonuses.", placeholder: "Describe the zoning situation and I'll map the entitlement pathway..." },
        { id: "Acquisition Pro", icon: "A", color: "var(--c-gold)", desc: "Expert in site selection, off-market sourcing, and deal initial vetting", system: "You are a senior acquisition officer. Help identify high-potential sites, vet off-market deals, and advise on acquisition strategy.", placeholder: "Ask about site selection criteria or deal vetting..." },
        { id: "Appraisal AI", icon: "V", color: "var(--c-green)", desc: "Valuation specialist for land residual and finished lot analysis", system: "You are a commercial appraiser. Analyze land residual value, finished lot pricing, and market comparables.", placeholder: "Ask for a land residual analysis or comp check..." },
        { id: "Design Studio", icon: "D", color: "var(--c-teal)", desc: "Concept yield optimization and architectural feasibility", system: "You are an urban designer and architect. Optimize concept yields, advise on site density, and architectural feasibility.", placeholder: "Describe a site to optimize its development yield..." },
        { id: "Env. Consultant", icon: "E", color: "var(--c-amber)", desc: "Analyzes Phase I risks, wetlands, and physical constraints", system: "You are an environmental consultant. Identify Phase I ESA risks, analyze wetlands/flood zones, and physical site constraints.", placeholder: "Ask about environmental risks or physical constraints..." },
        { id: "Permit Liaison", icon: "P", color: "var(--c-purple)", desc: "Navigates municipal submittals and agency approvals", system: "You are a permit specialist. Sequence permit applications, identify dependencies, and estimate timelines.", placeholder: "Ask about permit sequencing or agency requirements..." },
        { id: "Underwriter", icon: "U", color: "var(--c-red)", desc: "Deep financial modeling, IRR/Equity multiple stress testing", system: "You are a real estate private equity underwriter. Perform deep financial modeling, stress test IRRs, and evaluate capital stacks.", placeholder: "Ask for a financial stress test or capital stack review..." },
        { id: "Civil Engineer", icon: "C", color: "var(--c-blue)", desc: "Site infrastructure, utilities, and grading estimation", system: "You are a civil engineer. Advise on site infrastructure, utility capacities, grading, and improvement costs.", placeholder: "Ask about utility connections or grading challenges..." },
        { id: "Market Analyst", icon: "M", color: "var(--c-gold)", desc: "Demographic trends, supply/demand, and price elasticities", system: "You are a market research analyst. Analyze demographic trends, supply/demand dynamics, and market pricing.", placeholder: "Ask about market trends or demographic shifts..." },
        { id: "Risk Manager", icon: "R", color: "var(--c-red)", desc: "Identifies project threats and structures mitigation strategies", system: "You are a development risk manager. Identify project threats, stress-test mitigation, and quantify risk exposure.", placeholder: "Describe a project for a comprehensive risk analysis..." },
        { id: "Legal Counsel", icon: "L", color: "var(--c-purple)", desc: "Title review, purchase agreements, and entitlement law", system: "You are a real estate attorney. Review prelim title reports, draft purchase agreements, and advise on entitlement law.", placeholder: "Ask about title issues or legal deal structures..." },
        { id: "Capital Markets", icon: "S", color: "var(--c-green)", desc: "Debt & equity sourcing and capital structure optimization", system: "You are a capital markets advisor. Source debt & equity, optimize capital structures, and advise on financing trends.", placeholder: "Ask about current debt terms or equity sourcing..." },
    ];

    const [active, setActive] = useState<number | null>(null);

    if (active !== null) {
        const a = agents[active];
        return (
            <div>
                <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
                    <Button label="← Back to Hub" onClick={() => setActive(null)} />
                    <div style={{ fontSize: 18, fontWeight: 700, color: "var(--c-gold)" }}>{a.id}</div>
                </div>
                <Card title={`${a.id} - ✦ Live Session`}>
                    <Agent id={a.id} system={a.system} placeholder={a.placeholder} />
                </Card>
            </div>
        );
    }

    return (
        <>
            <Card title="AI Agent Hub - 12 Specialized Agents">
                <div style={{ fontSize: 12, color: "var(--c-dim)", marginBottom: 16 }}>
                    Each agent is a specialized instance with domain-specific context. Select an agent to open a live session.
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 14 }}>
                    {agents.map((a, i) => (
                        <div key={i}
                            style={{
                                background: "var(--c-bg)", border: "1px solid var(--c-border)", borderRadius: 4,
                                padding: 14, cursor: "pointer", transition: "all 0.12s", borderLeft: `3px solid ${a.color}`
                            }}
                            onClick={() => setActive(i)}
                        >
                            <div style={{ fontSize: 18, color: a.color, marginBottom: 6, fontWeight: 700 }}>{a.icon}</div>
                            <div style={{ fontSize: 13, color: "var(--c-text)", fontWeight: 700, marginBottom: 4 }}>{a.id}</div>
                            <div style={{ fontSize: 10, color: "var(--c-dim)", lineHeight: 1.4 }}>{a.desc}</div>
                            <div style={{ marginTop: 10 }}>
                                <Badge label="Launch Agent" color="var(--c-gold)" />
                            </div>
                        </div>
                    ))}
                </div>
            </Card>
            <Card title="Multi-Agent Query">
                <div style={{ fontSize: 12, color: "var(--c-dim)", marginBottom: 12 }}>
                    Broadcast a question to all agents simultaneously and compare their specialized perspectives.
                </div>
                <Agent id="MultiAgent" system="You are an orchestrating AI agent for real estate development." placeholder="Ask a question and get input from all specialist perspectives..." />
            </Card>
        </>
    );
}
