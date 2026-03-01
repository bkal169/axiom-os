import { useState } from "react";
import { useProjectState } from "../../hooks/useProjectState";
import { Card, KPI, Badge, CSVImportButton } from "../../components/ui/components";
import { Tabs } from "../../components/ui/layout";
import { fmt } from "../../lib/utils";
import { Agent } from "../agents/Agent";

interface Props { projectId: string; }

const EMPTY_COMP = {
    name: "", address: "", lots: "", lotSF: "",
    saleDate: "", pricePerLot: "", pricePerSF: "",
    status: "Sold", adj: 0, notes: ""
};

export function MarketIntel({ projectId }: Props) {
    const { project, updateProject } = useProjectState(projectId);
    const comps: any[] = project.comps ?? [];

    const [filt, setFilt] = useState("All");
    const [nc, setNc] = useState(EMPTY_COMP);

    // ── Derived stats ─────────────────────────────────────────
    const filtered = comps.filter(c => filt === "All" || c.status === filt);
    const adjPrices = filtered.map(c => c.pricePerLot * (1 + (c.adj || 0) / 100));
    const avgPPL = adjPrices.length ? adjPrices.reduce((a, b) => a + b, 0) / adjPrices.length : 0;
    const avgPPSF = filtered.length ? filtered.reduce((s, c) => s + c.pricePerSF, 0) / filtered.length : 0;

    const loc = project?.state
        ? (project.municipality ? `${project.municipality}, ${project.state}` : project.state)
        : "Your Market";

    // ── Write helpers ─────────────────────────────────────────
    const addComp = () => {
        if (!nc.name.trim()) return;
        updateProject({
            comps: [...comps, {
                ...nc,
                id: Date.now(),
                lots: +nc.lots, lotSF: +nc.lotSF,
                pricePerLot: +nc.pricePerLot, pricePerSF: +nc.pricePerSF,
                adj: +nc.adj,
            }]
        });
        setNc(EMPTY_COMP);
    };

    const removeComp = (id: number) =>
        updateProject({ comps: comps.filter(c => c.id !== id) });

    const updateCompAdj = (i: number, adj: number) => {
        const next = [...comps];
        next[i] = { ...next[i], adj };
        updateProject({ comps: next });
    };

    const importComps = (data: any[]) => {
        const newComps = data.map((d, i) => ({
            id: Date.now() + i,
            name: d.Project || d.name || "Imported",
            address: d.Address || d.address || "",
            lots: +(d.Lots || d.lots || 0),
            lotSF: +(d["Lot SF"] || d.lotSF || 0),
            saleDate: d.Date || d.saleDate || "",
            pricePerLot: +(d["$/Lot"] || d.pricePerLot || 0),
            pricePerSF: +(d["$/SF"] || d.pricePerSF || 0),
            status: d.Status || d.status || "Sold",
            adj: +(d["Adj%"] || d.adj || 0),
            notes: d.Notes || d.notes || "",
        }));
        updateProject({ comps: [...comps, ...newComps] });
    };

    return (
        <Tabs tabs={["Comparables", "Jurisdiction Intel", "Market Trends"]}>

            {/* ── Tab 1: Comparables ───────────────────────── */}
            <div>
                <div className="axiom-grid-4" style={{ marginBottom: 20 }}>
                    <KPI label="Comps Analyzed" value={filtered.length.toString()} />
                    <KPI label="Avg Adj. $/Lot" value={fmt.usd(avgPPL)} color="var(--c-green)" />
                    <KPI label="Avg $/SF" value={"$" + avgPPSF.toFixed(2)} color="var(--c-blue)" />
                    <KPI
                        label="Price Range"
                        value={filtered.length
                            ? `${fmt.k(Math.min(...filtered.map(c => c.pricePerLot)))} - ${fmt.k(Math.max(...filtered.map(c => c.pricePerLot)))}`
                            : "—"}
                        color="var(--c-amber)"
                    />
                </div>

                <Card title="Comparable Sales Database" action={
                    <div style={{ display: "flex", gap: 8 }}>
                        <CSVImportButton onImport={importComps} />
                        <select className="axiom-select" style={{ width: 140 }} value={filt} onChange={e => setFilt(e.target.value)} title="Filter by status">
                            <option>All</option>
                            <option>Sold</option>
                            <option>Listed</option>
                            <option>Pending</option>
                        </select>
                    </div>
                }>
                    <table className="axiom-table">
                        <thead>
                            <tr style={{ textAlign: "left" }}>
                                <th className="axiom-th">Project</th>
                                <th className="axiom-th">Lots</th>
                                <th className="axiom-th">Lot SF</th>
                                <th className="axiom-th">Date</th>
                                <th className="axiom-th">$/Lot</th>
                                <th className="axiom-th">Adj%</th>
                                <th className="axiom-th">Adj $/Lot</th>
                                <th className="axiom-th">Status</th>
                                <th className="axiom-th"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((c: any) => (
                                <tr key={c.id} className="premium-hover">
                                    <td className="axiom-td">
                                        <div style={{ fontSize: 13, color: "var(--c-text)", fontWeight: 600 }}>{c.name}</div>
                                        <div style={{ fontSize: 9, color: "var(--c-dim)" }}>{c.address}</div>
                                    </td>
                                    <td className="axiom-td">{c.lots}</td>
                                    <td className="axiom-td">{fmt.num(c.lotSF)}</td>
                                    <td className="axiom-td">{c.saleDate}</td>
                                    <td className="axiom-td" style={{ color: "var(--c-gold)", fontWeight: 500 }}>{fmt.usd(c.pricePerLot)}</td>
                                    <td className="axiom-td">
                                        <input
                                            type="number"
                                            style={{ width: 60, background: "transparent", border: "none", color: c.adj > 0 ? "var(--c-green)" : c.adj < 0 ? "var(--c-red)" : "var(--c-dim)", fontSize: 12 }}
                                            value={c.adj}
                                            onChange={e => updateCompAdj(comps.findIndex(x => x.id === c.id), +e.target.value)}
                                        />%
                                    </td>
                                    <td className="axiom-td" style={{ color: "var(--c-gold)", fontWeight: 600 }}>
                                        {fmt.usd(c.pricePerLot * (1 + c.adj / 100))}
                                    </td>
                                    <td className="axiom-td">
                                        <Badge label={c.status} color={c.status === "Sold" ? "var(--c-green)" : "var(--c-blue)"} />
                                    </td>
                                    <td className="axiom-td">
                                        <button onClick={() => removeComp(c.id)} style={{ background: "none", border: "none", color: "var(--c-dim)", cursor: "pointer" }}>×</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </Card>

                {/* ── Add Comp form ──────────────────────────── */}
                <Card title="Add Comparable">
                    <div className="axiom-grid-4" style={{ gap: 10, marginBottom: 10 }}>
                        {[
                            ["Project Name", "name", "text"],
                            ["Address", "address", "text"],
                            ["# Lots", "lots", "number"],
                            ["Avg Lot SF", "lotSF", "number"],
                            ["Sale Date", "saleDate", "month"],
                            ["$/Lot", "pricePerLot", "number"],
                            ["$/SF", "pricePerSF", "number"],
                        ].map(([label, key, type]) => (
                            <div key={key as string}>
                                <label className="axiom-label">{label}</label>
                                <input
                                    className="axiom-input"
                                    type={type as string}
                                    value={(nc as any)[key as string]}
                                    onChange={e => setNc({ ...nc, [key as string]: e.target.value })}
                                />
                            </div>
                        ))}
                        <div>
                            <label className="axiom-label">Status</label>
                            <select className="axiom-input" value={nc.status} onChange={e => setNc({ ...nc, status: e.target.value })}>
                                <option>Sold</option><option>Listed</option><option>Pending</option><option>Off-Market</option>
                            </select>
                        </div>
                    </div>
                    <button className="axiom-btn-gold" onClick={addComp}>Add Comparable</button>
                </Card>

                <Card title="Market Intelligence AI">
                    <Agent
                        id="MarketAnalysis"
                        system="You are a real estate appraiser and market analyst. Analyze comparable sales, apply adjustments, and identify absorption trends."
                        placeholder="Describe subject property for market value analysis..."
                    />
                </Card>
            </div>

            {/* ── Tab 2: Jurisdiction Intel ─────────────────── */}
            <div>
                <Card title={`Jurisdiction Intel — ${loc}`}>
                    <div className="axiom-label" style={{ marginBottom: 16 }}>
                        Specialized AI agents pre-loaded with local zoning, permit, and fee knowledge for <b style={{ color: "var(--c-gold)" }}>{loc}</b>.
                    </div>
                    <div className="axiom-grid-2">
                        <Card title="Fee Estimator">
                            <Agent id="FeeEstimator" system="You are a fee specialist for real estate development. Estimate impact fees, permit fees, and school fees." placeholder={`Ask about fees in ${loc}...`} />
                        </Card>
                        <Card title="Zoning Assistant">
                            <Agent id="ZoningAssistant" system="You are a zoning expert. Analyze zoning codes, density requirements, and entitlement pathways." placeholder={`Ask about zoning in ${loc}...`} />
                        </Card>
                    </div>
                </Card>
            </div>

            {/* ── Tab 3: Trends (placeholder) ──────────────── */}
            <div>
                <Card title="Market Trends">
                    <div style={{ padding: 40, textAlign: "center" }}>
                        <div style={{ fontSize: 16, color: "var(--c-sub)", marginBottom: 10 }}>Market trend visualization coming soon</div>
                        <div style={{ fontSize: 12, color: "var(--c-dim)" }}>Connect to CoStar or Regrid in Connectors to enable live data.</div>
                    </div>
                </Card>
            </div>

        </Tabs>
    );
}
