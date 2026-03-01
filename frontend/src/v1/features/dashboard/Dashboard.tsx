import { useMemo } from "react";
import { useProjectState } from "../../hooks/useProjectState";

import { Card, KPI, Button, Badge } from "../../components/ui/components";
import { fmt } from "../../lib/utils";
import { DEFAULT_FIN, DEFAULT_RISKS, DEFAULT_PERMITS } from "../../lib/defaults";
import { buildMonthlyCashFlows, calcIRR } from "../../lib/math";

interface Props { projectId: string; }

export function Dashboard({ projectId }: Props) {
    const { project, updateProject, syncError } = useProjectState(projectId);
    // usePrj available for chart-click UI state when needed

    const fin = project.financials ?? DEFAULT_FIN;
    const risks = project.risks ?? DEFAULT_RISKS;
    const permits = project.permits ?? DEFAULT_PERMITS;
    const ddChecks = project.ddChecks ?? {};

    // ── Quick snapshot calculations ────────────────────────
    const snap = useMemo(() => {
        const hard = fin.totalLots * fin.hardCostPerLot;
        const soft = hard * (fin.softCostPct / 100);
        const fees = fin.planningFees + (fin.permitFeePerLot + fin.schoolFee + fin.impactFeePerLot) * fin.totalLots;
        const cont = (hard + soft) * (fin.contingencyPct / 100);
        const totalCost = fin.landCost + fin.closingCosts + hard + soft + cont + fees;
        const revenue = fin.totalLots * fin.salesPricePerLot;
        const profit = revenue * 0.97 - totalCost;
        const margin = revenue > 0 ? (profit / revenue) * 100 : 0;
        const { flows, constMonths } = buildMonthlyCashFlows(fin);
        const irr = (Math.pow(1 + (calcIRR(flows) || 0), 12) - 1) * 100;
        return { totalCost, revenue, profit, margin, irr, constMonths };
    }, [fin]);

    const openRisks = risks.filter(r => r.status === "Open").length;
    const ddDone = Object.values(ddChecks).filter(Boolean).length;
    const approvedPm = permits.filter(p => p.status === "Approved").length;

    return (
        <div className="axiom-stack-32">

            {/* ── Sync error banner ──────────────────────── */}
            {syncError && (
                <div style={{ padding: "8px 12px", background: "var(--c-bg3)", border: "1px solid var(--c-amber)", borderRadius: 4, fontSize: 11, color: "var(--c-amber)" }}>
                    ⚠ {syncError}
                </div>
            )}

            {/* ── Top bar ────────────────────────────────── */}
            <div className="axiom-top-bar">
                <div>
                    <div className="axiom-breadcrumb">Command Center</div>
                    <div className="axiom-page-title">{project.name || "Unnamed Project"}</div>
                </div>
                <div className="axiom-flex-gap-12">
                    <Button label="Export Summary" variant="gold" />
                    <Button label="Refresh Data" />
                </div>
            </div>

            {/* ── Financial KPIs ──────────────────────────── */}
            <div className="axiom-grid-4">
                <KPI label="Total Lots" value={fmt.num(fin.totalLots)} />
                <KPI label="Project Revenue" value={fmt.M(snap.revenue)} color="var(--c-green)" />
                <KPI label="Net Profit" value={fmt.M(snap.profit)} color={snap.profit >= 0 ? "var(--c-green)" : "var(--c-red)"} />
                <KPI label="Levered IRR" value={fmt.pct(snap.irr)} color="var(--c-blue)" />
            </div>

            {/* ── Status KPIs ─────────────────────────────── */}
            <div className="axiom-grid-4">
                <KPI label="Open Risks" value={String(openRisks)} color={openRisks > 3 ? "var(--c-amber)" : "var(--c-green)"} />
                <KPI label="DD Items Done" value={String(ddDone)} color="var(--c-blue)" />
                <KPI label="Permits Approved" value={String(approvedPm)} color="var(--c-teal)" />
                <KPI label="Profit Margin" value={fmt.pct(snap.margin)} color={snap.margin > 15 ? "var(--c-green)" : "var(--c-gold)"} />
            </div>

            {/* ── Project Meta ────────────────────────────── */}
            <Card title="Project Meta" action={<Badge label="Auto-Saved" color="var(--c-green)" />}>
                <div className="axiom-grid-2">
                    <div>
                        <div className="axiom-label" style={{ marginBottom: 8 }}>PROJECT NAME</div>
                        <input
                            className="axiom-input"
                            value={project.name || ""}
                            onChange={e => updateProject({ name: e.target.value })}
                            title="Project Name"
                        />
                    </div>
                    <div>
                        <div className="axiom-label" style={{ marginBottom: 8 }}>STATE</div>
                        <input
                            className="axiom-input"
                            value={project.state || ""}
                            onChange={e => updateProject({ state: e.target.value })}
                            placeholder="e.g. FL"
                            title="State"
                        />
                    </div>
                    <div>
                        <div className="axiom-label" style={{ marginBottom: 8 }}>MUNICIPALITY</div>
                        <input
                            className="axiom-input"
                            value={project.municipality || ""}
                            onChange={e => updateProject({ municipality: e.target.value })}
                            placeholder="City / County"
                            title="Municipality"
                        />
                    </div>
                    <div>
                        <div className="axiom-label" style={{ marginBottom: 8 }}>ENTITLEMENT STATUS</div>
                        <select
                            className="axiom-select"
                            value={project.entitlementStatus || "Not Started"}
                            onChange={e => updateProject({ entitlementStatus: e.target.value })}
                        >
                            {["Not Started", "In Progress", "Submitted", "Approved"].map(o => <option key={o}>{o}</option>)}
                        </select>
                    </div>
                </div>
            </Card>

            {/* ── Footer ──────────────────────────────────── */}
            <div className="axiom-footer">
                <div className="axiom-breadcrumb">Axiom OS · V1 Architecture</div>
                <div className="axiom-text-11-dim" style={{ marginTop: 8 }}>
                    AI-assisted underwriting engine · All data persisted locally and optionally synced to cloud.
                </div>
            </div>
        </div>
    );
}
