import { Card, KPI, Badge, Button } from "../../components/ui/components";
import { useProject } from "../../context/ProjectContext";
import { calcFinancials } from "../../lib/finance";

export function LPReport() {
    const ctx = useProject();
    const project = ctx?.project ?? { name: "Untitled Project", address: "" };
    const fin = ctx?.fin ?? {};
    const loan = ctx?.loan ?? {};
    const equity = ctx?.equity ?? {};
    const risks = ctx?.risks ?? [];

    const calc = calcFinancials(fin);

    const highRisks = risks.filter((r: any) => r.severity === "High" || r.impact === "High").length;
    const criticalRisks = risks.filter((r: any) => r.severity === "Critical" || r.impact === "Critical").length;

    const fmtUsd = (n: number) => `$${n.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
    const fmtPct = (n: number) => `${n.toFixed(1)}%`;

    const generateTextReport = (): string => {
        const lines = [
            "═══════════════════════════════════════════",
            `  LP INVESTMENT SUMMARY`,
            `  ${project.name}`,
            "═══════════════════════════════════════════",
            "",
            `PROJECT: ${project.name}`,
            `ADDRESS: ${project.address || "N/A"}`,
            `LOTS: ${calc.totalLots}`,
            "",
            "── FINANCIAL SUMMARY ──────────────────────",
            `  Revenue:        ${fmtUsd(calc.revenue)}`,
            `  Total Cost:     ${fmtUsd(calc.totalProjectCost)}`,
            `  Profit:         ${fmtUsd(calc.profit)}`,
            `  Margin:         ${fmtPct(calc.margin)}`,
            `  ROI:            ${fmtPct(calc.roi)}`,
            "",
            "── FINANCING STRUCTURE ────────────────────",
            `  LTC:            ${loan.ltc ?? "--"}%`,
            `  Interest Rate:  ${loan.rate ?? "--"}%`,
            `  Term:           ${loan.termMonths ?? "--"} months`,
            `  GP / LP Split:  ${equity.gpPct ?? "--"}% / ${equity.lpPct ?? "--"}%`,
            `  Pref Return:    ${equity.prefReturn ?? "--"}%`,
            `  Promote:        ${equity.promotePct ?? "--"}%`,
            "",
            "── RISK SUMMARY ──────────────────────────",
            `  Total Risks:    ${risks.length}`,
            `  Critical:       ${criticalRisks}`,
            `  High:           ${highRisks}`,
            "",
            "── KEY MILESTONES ────────────────────────",
            `  Absorption Rate:   ${fin.absorbRate ?? "--"} lots/month`,
            `  Contingency:       ${fin.contingencyPct ?? "--"}%`,
            "",
            "═══════════════════════════════════════════",
            `  Generated: ${new Date().toISOString().split("T")[0]}`,
            `  Axiom OS`,
            "═══════════════════════════════════════════",
        ];
        return lines.join("\n");
    };

    const copyToClipboard = () => {
        const text = generateTextReport();
        navigator.clipboard.writeText(text).catch(() => {
            // Fallback
            const ta = document.createElement("textarea");
            ta.value = text;
            document.body.appendChild(ta);
            ta.select();
            document.execCommand("copy");
            document.body.removeChild(ta);
        });
    };

    return (
        <Card title={`LP Summary — ${project.name}`}>
            {/* Header KPIs */}
            <div className="axiom-grid-4 axiom-mb-24">
                <KPI label="Revenue" value={fmtUsd(calc.revenue)} color="var(--c-blue)" />
                <KPI label="Profit" value={fmtUsd(calc.profit)} color="var(--c-green)" />
                <KPI label="Margin" value={fmtPct(calc.margin)} color="var(--c-gold)" />
                <KPI label="ROI" value={fmtPct(calc.roi)} color="var(--c-gold)" />
            </div>

            {/* Financing Structure */}
            <div className="axiom-bg-2 axiom-p-16 axiom-radius-6 axiom-mb-24" style={{ border: "1px solid var(--c-border)" }}>
                <div className="axiom-label axiom-mb-8" style={{ letterSpacing: 2 }}>FINANCING STRUCTURE</div>
                <div className="axiom-grid-3" style={{ gap: 12 }}>
                    <KPI label="LTC" value={`${loan.ltc ?? "--"}%`} />
                    <KPI label="Rate" value={`${loan.rate ?? "--"}%`} />
                    <KPI label="Term" value={`${loan.termMonths ?? "--"}mo`} />
                    <KPI label="GP / LP" value={`${equity.gpPct ?? "--"}% / ${equity.lpPct ?? "--"}%`} />
                    <KPI label="Pref Return" value={`${equity.prefReturn ?? "--"}%`} />
                    <KPI label="Promote" value={`${equity.promotePct ?? "--"}%`} />
                </div>
            </div>

            {/* Risk Summary */}
            <div className="axiom-bg-2 axiom-p-16 axiom-radius-6 axiom-mb-24" style={{ border: "1px solid var(--c-border)" }}>
                <div className="axiom-label axiom-mb-8" style={{ letterSpacing: 2 }}>RISK SUMMARY</div>
                <div className="axiom-flex-gap-12">
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <Badge label={`${criticalRisks} Critical`} color="var(--c-red)" />
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <Badge label={`${highRisks} High`} color="var(--c-amber)" />
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <Badge label={`${risks.length} Total`} color="var(--c-dim)" />
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="axiom-flex-gap-12">
                <Button variant="gold" label="Copy to Clipboard" onClick={copyToClipboard} />
                <Button
                    label="Generate PDF"
                    disabled
                    style={{ opacity: 0.5, cursor: "not-allowed", display: "flex", alignItems: "center", gap: 8 }}
                >
                    <span>Generate PDF</span>
                    <span style={{ fontSize: 9, background: "rgba(232,184,75,0.15)", color: "var(--c-gold)", borderRadius: 8, padding: "2px 6px", fontWeight: 600, letterSpacing: 0.5 }}>Coming Soon</span>
                </Button>
            </div>
        </Card>
    );
}
