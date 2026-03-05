import { useState, useEffect, useCallback } from "react";
import { useProjectState } from "../../hooks/useProjectState";
import { Card, KPI, Badge, CSVImportButton } from "../../components/ui/components";
import { Tabs } from "../../components/ui/layout";
import { fmt } from "../../lib/utils";
import { Agent } from "../agents/Agent";
import { supabase } from "../../../lib/supabaseClient";


interface Signal {
    id: string;
    title: string;
    summary: string;
    domain: string;
    direction: string;
    strength: number;
    source_name: string;
    created_at: string;
    tags: string[];
}

const DIRECTION_COLOR: Record<string, string> = {
    inflationary: "var(--c-red)",
    deflationary: "var(--c-green)",
    neutral: "var(--c-amber)",
};

function LiveSignals() {
    const [signals, setSignals] = useState<Signal[]>([]);
    const [loading, setLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState<string>("");

    const fetchSignals = useCallback(async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase.functions.invoke("signals-recent", {
                body: { region: "US", limit: 20 },
            });
            if (!error && data?.signals) {
                setSignals(data.signals);
                setLastUpdated(new Date().toLocaleTimeString());
            }
        } catch {
            // silently handle
        }
        setLoading(false);
    }, []);

    useEffect(() => { fetchSignals(); }, [fetchSignals]);

    return (
        <Card
            title="Live Market Signals"
            action={
                <div className="axiom-flex-center axiom-flex-gap-10">
                    {lastUpdated && <span className="axiom-text-11-dim">Updated {lastUpdated}</span>}
                    <button className="axiom-btn axiom-p-4-10 axiom-text-11" onClick={fetchSignals} disabled={loading} title="Refresh Signals">
                        {loading ? "..." : "↺ Refresh"}
                    </button>
                </div>
            }
        >
            {loading && !signals.length ? (
                <div className="axiom-p-32 axiom-text-center axiom-text-13-dim">Loading signals...</div>
            ) : signals.length === 0 ? (
                <div className="axiom-p-32 axiom-text-center axiom-text-13-dim">No signals. FRED ingest runs daily at 06:00 UTC.</div>
            ) : (
                <div className="axiom-flex-col axiom-flex-gap-1">
                    {signals.map((s) => (
                        <div key={s.id} className="axiom-py-10 axiom-px-12 axiom-grid-2-auto-gap-10 axiom-items-start" style={{ borderBottom: "1px solid var(--c-border)" }}>
                            <div>
                                <div className="axiom-flex-center-gap-8 axiom-mb-4">
                                    <span className="axiom-text-13-bold axiom-text-sub">{s.title}</span>
                                    {s.direction && (
                                        <span className="axiom-text-10-b-up-ls1" style={{ color: DIRECTION_COLOR[s.direction] || "var(--c-dim)" }}>
                                            {s.direction === "inflationary" ? "▲" : s.direction === "deflationary" ? "▼" : "→"} {s.direction}
                                        </span>
                                    )}
                                </div>
                                <div className="axiom-text-12 axiom-text-sub axiom-lh-15">{s.summary}</div>
                                {s.strength != null && (
                                    <div className="axiom-flex-center-gap-8 axiom-mt-6">
                                        <div className="axiom-flex-1 axiom-h-3 axiom-bg-border axiom-radius-2">
                                            <div className="axiom-h-full axiom-radius-2 axiom-trans-w-400" style={{ width: `${Math.min(1, s.strength) * 100}%`, background: DIRECTION_COLOR[s.direction] || "var(--c-gold)" }} />
                                        </div>
                                        <span className="axiom-text-9-dim axiom-w-28">{(s.strength * 100).toFixed(0)}%</span>
                                    </div>
                                )}
                            </div>
                            <div className="axiom-text-right axiom-flex-shrink-0">
                                <div className="axiom-text-9-dim-ls1-up">{s.domain}</div>
                                <div className="axiom-text-9-dim axiom-mt-2">{s.source_name}</div>
                                <div className="axiom-text-9-dim axiom-mt-2">{new Date(s.created_at).toLocaleDateString()}</div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </Card>
    );
}

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

    // ── Derived stats ──────────────────────────────────────────
    const filtered = comps.filter(c => filt === "All" || c.status === filt);
    const adjPrices = filtered.map(c => c.pricePerLot * (1 + (c.adj || 0) / 100));
    const avgPPL = adjPrices.length ? adjPrices.reduce((a, b) => a + b, 0) / adjPrices.length : 0;
    const avgPPSF = filtered.length ? filtered.reduce((s, c) => s + c.pricePerSF, 0) / filtered.length : 0;

    const loc = project?.state
        ? (project.municipality ? `${project.municipality}, ${project.state}` : project.state)
        : "Your Market";

    // ── Write helpers ──────────────────────────────────────────
    const addComp = useCallback(() => {
        if (!nc.name.trim()) return;
        const id = Date.now();
        updateProject({
            comps: [...comps, {
                ...nc,
                id,
                lots: +nc.lots, lotSF: +nc.lotSF,
                pricePerLot: +nc.pricePerLot, pricePerSF: +nc.pricePerSF,
                adj: +nc.adj,
            }]
        });
        setNc(EMPTY_COMP);
    }, [nc, comps, updateProject]);

    const removeComp = (id: number) =>
        updateProject({ comps: comps.filter(c => c.id !== id) });

    const updateCompAdj = (i: number, adj: number) => {
        const next = [...comps];
        next[i] = { ...next[i], adj };
        updateProject({ comps: next });
    };

    const importComps = (data: Record<string, string>[]) => {
        const newComps = data.map((d, i) => ({
            id: i + 1,
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
        <Tabs tabs={["Comparables", "Jurisdiction Intel", "Market Signals"]}>

            {/* ── Tab 1: Comparables ────────────────────────── */}
            <div>
                <div className="axiom-grid-4 axiom-mb-20">
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
                    <div className="axiom-flex-gap-8">
                        <CSVImportButton onImport={importComps} />
                        <select className="axiom-select axiom-w-140" value={filt} onChange={e => setFilt(e.target.value)} title="Filter by status">
                            <option>All</option>
                            <option>Sold</option>
                            <option>Listed</option>
                            <option>Pending</option>
                        </select>
                    </div>
                }>
                    <table className="axiom-table">
                        <thead>
                            <tr className="axiom-text-left">
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
                                        <div className="axiom-text-13 axiom-text-bold axiom-text-sub">{c.name}</div>
                                        <div className="axiom-text-9-dim">{c.address}</div>
                                    </td>
                                    <td className="axiom-td">{c.lots}</td>
                                    <td className="axiom-td">{fmt.num(c.lotSF)}</td>
                                    <td className="axiom-td">{c.saleDate}</td>
                                    <td className="axiom-td axiom-text-gold axiom-text-bold-500">{fmt.usd(c.pricePerLot)}</td>
                                    <td className="axiom-td">
                                        <input
                                            type="number"
                                            title="Adjustment %"
                                            placeholder="0"
                                            className="axiom-w-60 axiom-bg-trans axiom-border-none axiom-text-12"
                                            style={{ color: c.adj > 0 ? "var(--c-green)" : c.adj < 0 ? "var(--c-red)" : "var(--c-dim)" }}
                                            value={c.adj}
                                            onChange={e => updateCompAdj(comps.findIndex(x => x.id === c.id), +e.target.value)}
                                        />%
                                    </td>
                                    <td className="axiom-td axiom-text-gold axiom-text-bold">
                                        {fmt.usd(c.pricePerLot * (1 + c.adj / 100))}
                                    </td>
                                    <td className="axiom-td">
                                        <Badge label={c.status} color={c.status === "Sold" ? "var(--c-green)" : "var(--c-blue)"} />
                                    </td>
                                    <td className="axiom-td">
                                        <button onClick={() => removeComp(c.id)} className="axiom-bg-none axiom-border-none axiom-text-dim axiom-pointer">×</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </Card>

                {/* ── Add Comp form ──────────────────────────── */}
                <Card title="Add Comparable">
                    <div className="axiom-grid-4 axiom-flex-gap-10 axiom-mb-10">
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
                                    placeholder={label as string}
                                    title={label as string}
                                    value={(nc as any)[key as string]}
                                    onChange={e => setNc({ ...nc, [key as string]: e.target.value })}
                                />
                            </div>
                        ))}
                        <div>
                            <label className="axiom-label">Status</label>
                            <select className="axiom-input" title="Status" value={nc.status} onChange={e => setNc({ ...nc, status: e.target.value })}>
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

            {/* ── Tab 2: Jurisdiction Intel ────────────────── */}
            <div>
                <Card title={`Jurisdiction Intel — ${loc}`}>
                    <div className="axiom-label axiom-mb-16">
                        Specialized AI agents pre-loaded with local zoning, permit, and fee knowledge for <b className="axiom-text-gold">{loc}</b>.
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

            {/* ── Tab 3: Live Market Signals ────────────────── */}
            <div>
                <LiveSignals />
            </div>

        </Tabs>
    );
}
