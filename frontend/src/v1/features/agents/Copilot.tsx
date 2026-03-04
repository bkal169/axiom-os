import { useState, useMemo } from "react";
import { useProject } from "../../context/ProjectContext";
import { Card } from "../../components/ui/components";
import { Agent } from "./Agent";
import { buildMonthlyCashFlows, calcIRR } from "../../lib/math";
import { fmt } from "../../lib/utils";

const MODES = {
    general: { label: "General Assistant", system: "You are Axiom Copilot, an AI assistant for real estate development. Help with any questions about feasibility, financial modeling, or market analysis." },
    underwriter: { label: "Underwriter", system: "You are an institutional real estate underwriter. Analyze deals using project data. Stress-test assumptions and flag metrics outside thresholds (Margin <20%, IRR <15%)." },
    legal: { label: "Entitlements", system: "You are a real estate attorney specializing in land use, entitlements, and zoning. Advise on strategies and timelines based on jurisdiction." },
    financial: { label: "CFO / Strategy", system: "You are a real estate CFO. Focus on capital stacks, IRR, NPV, and equity waterfalls. Optimize debt/equity splits." },
};

export function Copilot() {
    const { project, fin, loan, equity } = useProject() as any;
    const [mode, setMode] = useState<keyof typeof MODES>("general");

    const context = useMemo(() => {
        const { flows, totalCost } = buildMonthlyCashFlows(fin);
        const irr = calcIRR(flows);
        const margin = totalCost > 0 ? ((fin.totalLots * fin.salesPricePerLot * 0.95 - totalCost) / (fin.totalLots * fin.salesPricePerLot) * 100).toFixed(1) : "0";

        return `
        Project: ${project.name || "Untitled"}
        Address: ${project.address || "N/A"}
        Location: ${project.municipality || "N/A"}, ${project.state || "N/A"}
        
        Financials:
        Lots: ${fin.totalLots}
        Total Cost: ${fmt.M(totalCost)}
        Sale Price/Lot: ${fmt.usd(fin.salesPricePerLot)}
        IRR (Est): ${irr ? (irr * 12 * 100).toFixed(1) + "%" : "N/A"}
        Margin: ${margin}%
        
        Loan: ${loan.ltc}% LTC @ ${loan.rate}% interest
        Equity: GP ${equity.gpPct}% / LP ${equity.lpPct}%
        `.trim();
    }, [project, fin, loan, equity]);

    return (
        <div className="axiom-grid-1-280" style={{ gap: 20 }}>
            <div style={{ height: 500 }}>
                <Agent
                    id="Axiom Copilot"
                    system={MODES[mode].system}
                    placeholder={`Ask the ${MODES[mode].label}...`}
                    context={context}
                />
            </div>
            <div className="axiom-stack-15">
                <Card title="Quick Inquiry">
                    <div className="axiom-stack-8">
                        {(Object.entries(MODES) as [keyof typeof MODES, any][]).map(([k, v]) => (
                            <div key={k}
                                onClick={() => setMode(k)}
                                className={`axiom-menu-item ${mode === k ? "active" : ""}`}
                                style={{ fontSize: 12, padding: "8px 12px", background: "var(--c-bg2)", cursor: "pointer", borderRadius: 4, border: mode === k ? "1px solid var(--c-gold)" : "1px solid var(--c-border)", color: mode === k ? "var(--c-gold)" : "var(--c-dim)" }}
                            >
                                {v.label}
                            </div>
                        ))}
                    </div>
                </Card>
            </div>
        </div>
    );
}
