import { useState, useEffect } from "react";
import { Card, Badge, Button } from "../../components/ui/components";
import { Agent } from "../agents/Agent";
import { AgentHandoff } from "../agents/AgentHandoff";
import { swarmEngine } from "../../services/SwarmEngine";

function relativeTime(ts: number): string {
    const diff = Date.now() - ts;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
}

interface AgentInfo {
    id: string;
    icon: string;
    color: string;
    desc: string;
    system: string;
    placeholder: string;
}

export function AgentHub() {
    const agents: AgentInfo[] = [
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
    const [lastRuns, setLastRuns] = useState<Record<string, number>>({});

    useEffect(() => {
        const runs: Record<string, number> = {};
        agents.forEach(a => {
            const v = localStorage.getItem(`axiom_agent_${a.id}_last`);
            if (v) runs[a.id] = parseInt(v, 10);
        });
        setLastRuns(runs);
    }, []);

    const launchAgent = (idx: number) => {
        const a = agents[idx];
        const now = Date.now();
        localStorage.setItem(`axiom_agent_${a.id}_last`, String(now));
        setLastRuns(prev => ({ ...prev, [a.id]: now }));
        setActive(idx);
    };

    const startDemoSwarm = () => {
        swarmEngine.init("Site Feasibility & Acquisition Analysis");
        swarmEngine.addTask("Analyze zoning density for 455 Northeast 2nd St", "LEGAL");
        swarmEngine.addTask("Calculate ProForma based on legal yield max", "FINANCIAL");
        swarmEngine.addTask("Vet off-market comps for target area", "MARKET");
    };

    if (active !== null) {
        const a = agents[active];
        return (
            <div>
                <div className="axiom-flex-center-gap-14 axiom-mb-20">
                    <Button label="← Back to Hub" onClick={() => setActive(null)} title="Return to Agent Hub" />
                    <div className="axiom-text-18-bold axiom-text-gold">{a.id}</div>
                </div>
                <Card title={`${a.id} - ✦ Live Session`}>
                    <Agent id={a.id} system={a.system} placeholder={a.placeholder} />
                </Card>
            </div>
        );
    }

    return (
        <>
            <div className="axiom-grid-1-280 axiom-gap-20">
                <div className="axiom-stack-20">
                    <Card title="AI Agent Hub - 12 Specialized Agents">
                        <div className="axiom-text-12-dim axiom-mb-16">
                            Each agent is a specialized instance with domain-specific context. Select an agent to open a live session.
                        </div>
                        <div className="axiom-grid-3 axiom-gap-14">
                            {agents.map((a, i) => (
                                <div key={i}
                                    className="axiom-bg-1 axiom-border-1 axiom-radius-4 axiom-p-14 axiom-pointer axiom-transition-12"
                                    style={{ borderLeft: `3px solid ${a.color}` }}
                                    onClick={() => launchAgent(i)}
                                    title={`Launch ${a.id}`}
                                >
                                    <div className="axiom-text-18-bold axiom-mb-6" style={{ color: a.color }}>{a.icon}</div>
                                    <div className="axiom-text-13-text-bold axiom-mb-4">{a.id}</div>
                                    <div className="axiom-text-10-dim axiom-lh-14">{a.desc}</div>
                                    <div className="axiom-mt-10">
                                        <Badge label="Launch Agent" color="var(--c-gold)" />
                                    </div>
                                    <div style={{ fontSize: 10, color: "var(--c-dim)", marginTop: 4 }}>
                                        {lastRuns[a.id] ? `Last run: ${relativeTime(lastRuns[a.id])}` : "Never used"}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                    <Card title="Multi-Agent Query">
                        <div className="axiom-text-12-dim axiom-mb-12">
                            Broadcast a question to all agents simultaneously and compare their specialized perspectives.
                        </div>
                        <Agent id="MultiAgent" system="You are an orchestrating AI agent for real estate development." placeholder="Ask a question and get input from all specialist perspectives..." />
                    </Card>
                </div>
                <div className="axiom-stack-20">
                    <Card title="Swarm Orchestrator">
                        <div className="axiom-text-10-dim axiom-mb-14">
                            Coordinate multiple specialized agents on a single project objective.
                        </div>
                        <AgentHandoff />
                        <div className="axiom-mt-20">
                            <Button label="🚀 Launch Demo Swarm" onClick={startDemoSwarm} className="axiom-full-width axiom-btn-blue-soft" />
                        </div>
                    </Card>
                </div>
            </div>
        </>
    );
}
