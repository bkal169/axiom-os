import { useState, useRef, useEffect, useCallback } from "react";
import { Card, KPI, Field, Badge, Button } from "../../components/ui/components";
import { Agent } from "../agents/Agent";
import { Tabs } from "../../components/ui/layout";
import { useAuth, useTier } from "../../context/AuthContext";
import { useProject } from "../../context/ProjectContext";
import { supa } from "../../lib/supabase";
import { fmt } from "../../lib/utils";
import { useLS } from "../../hooks/useLS";
import { OMIngestor } from "./OMIngestor";
import { DealTeaser } from "./DealTeaser";
import {
    BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, CartesianGrid
} from "recharts";

const CHART_STYLE = { fontSize: 11, fontFamily: "Inter, sans-serif" };
const TT = () => ({ contentStyle: { background: "#0D0F13", border: "1px solid #1A1D24", borderRadius: 4, color: "#E0E2E8", fontSize: 11, boxShadow: "0 4px 12px rgba(0,0,0,0.5)" }, itemStyle: { color: "#C4A052" } });
const TT_BAR = () => ({ ...TT(), cursor: { fill: "#1A1D24", opacity: 0.4 } });
const onChartClick = (setSel: (data: unknown) => void) => (data: any) => {
    if (data && data.activePayload) setSel(data.activePayload[0].payload);
};

interface Deal {
    id: string | number;
    name: string;
    address: string;
    stage: string;
    value: number;
    profit: number;
    lots: number;
    type: string;
    assignee: string;
    updated: string;
    notes: string;
    tags?: string[];
    _supaId?: string;
}

export function Deals() {
    const auth = useAuth();
    const { dealLimit } = useTier();
    const { setChartSel } = useProject() as any;
    const STAGES = ["sourcing", "screening", "due_diligence", "committee", "closing", "asset_mgmt"];
    const SL: Record<string, string> = { sourcing: "Sourcing", screening: "Screening", due_diligence: "Due Diligence", committee: "Committee", closing: "Closing", asset_mgmt: "Asset Mgmt" };
    const SCOL: Record<string, string> = { sourcing: "var(--c-blue)", screening: "var(--c-teal)", due_diligence: "var(--c-amber)", committee: "var(--c-purple)", closing: "var(--c-gold)", asset_mgmt: "var(--c-green)" };
    const [deals, setDeals] = useLS<Deal[]>("axiom_deals", [
        { id: 1, name: "Sunset Ridge Estates", address: "456 Ridge Rd", stage: "due_diligence", value: 9250000, profit: 1850000, lots: 42, type: "SFR Subdivision", assignee: "Sarah Chen", updated: "2025-02-15", notes: "Phase I ESA clean. Geotech pending." },
        { id: 2, name: "Hawk Valley Subdivision", address: "789 Valley Dr", stage: "screening", value: 5600000, profit: 840000, lots: 28, type: "SFR Subdivision", assignee: "Mike Rodriguez", updated: "2025-02-10", notes: "Initial feasibility looks promising. Need comp data." },
        { id: 3, name: "Meadowbrook PUD", address: "321 Meadow Ln", stage: "sourcing", value: 12800000, profit: 2560000, lots: 85, type: "PUD", assignee: "", updated: "2025-02-18", notes: "Off-market opportunity from broker network." },
        { id: 4, name: "Ridgecrest Heights", address: "900 Crest Blvd", stage: "committee", value: 14300000, profit: 2860000, lots: 55, type: "SFR Subdivision", assignee: "Jennifer Park", updated: "2025-02-12", notes: "IC presentation scheduled. Strong deal metrics." },
        { id: 5, name: "Canyon Oaks Estates", address: "150 Oak Canyon Dr", stage: "closing", value: 7200000, profit: 1080000, lots: 32, type: "SFR Subdivision", assignee: "David Thompson", updated: "2025-02-20", notes: "COE set for March 15. All conditions met." },
    ]);
    const [nd, setNd] = useState({ name: "", address: "", stage: "sourcing", value: "", profit: "", lots: "", type: "SFR Subdivision", assignee: "", notes: "" });
    const [showForm, setShowForm] = useState(false);
    const [showOMIngestor, setShowOMIngestor] = useState(false);
    const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
    const [syncing, setSyncing] = useState(false);
    const loadedRef = useRef(false);
    const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Load deals from Supabase on mount
    useEffect(() => {
        if (loadedRef.current || !auth?.userProfile?.id || !supa.configured()) return;
        loadedRef.current = true;
        (async () => {
            try {
                const rows = await supa.select("deals", `user_id=eq.${auth.userProfile.id}&order=updated_at.desc`);
                if (rows.length > 0) {
                    const mapped: Deal[] = rows.map((r: any) => ({
                        id: r.id,
                        name: r.project_name || "Unnamed",
                        address: r.location || "",
                        stage: r.stage || "sourcing",
                        value: Number(r.acquisition_price) + Number(r.renovation_cost) || 0,
                        profit: Number(r.projected_profit) || 0,
                        lots: 0, // Not in DB schema
                        type: r.asset_type || "SFR Subdivision",
                        assignee: "",
                        updated: r.updated_at?.split("T")[0] || "",
                        notes: r.notes || "",
                        tags: r.tags || [],
                        _supaId: r.id,
                    }));
                    setDeals(mapped);
                }
            } catch (e) { console.warn("Failed to load deals:", e); }
        })();
    }, [auth?.userProfile?.id, setDeals]);

    // Sync deal to Supabase
    const syncDeal = useCallback((deal: Deal, isDelete = false) => {
        if (!auth?.userProfile?.id || !supa.configured()) return;
        if (saveTimer.current) clearTimeout(saveTimer.current);
        saveTimer.current = setTimeout(async () => {
            setSyncing(true);
            try {
                if (isDelete) {
                    if (deal._supaId) await supa.del("deals", { id: deal._supaId });
                } else {
                    const payload: Record<string, unknown> = {
                        user_id: auth.userProfile.id,
                        project_name: deal.name,
                        location: deal.address,
                        asset_type: deal.type,
                        stage: deal.stage,
                        acquisition_price: deal.value || 0,
                        projected_value: (deal.value || 0) + (deal.profit || 0),
                        notes: deal.notes,
                        tags: deal.tags || [],
                        updated_at: new Date().toISOString(),
                    };
                    if (deal._supaId) payload.id = deal._supaId;
                    await supa.upsert("deals", payload);
                }
            } catch (e) { console.warn("Failed to sync deal:", e); }
            setSyncing(false);
        }, 800);
    }, [auth?.userProfile?.id]);

    const addDeal = () => {
        if (!nd.name) return;
        const newDeal: Deal = { ...nd, id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(), value: +nd.value || 0, profit: +nd.profit || 0, lots: +nd.lots || 0, updated: new Date().toISOString().split("T")[0] };
        setDeals([...deals, newDeal]);
        syncDeal(newDeal);
        setNd({ name: "", address: "", stage: "sourcing", value: "", profit: "", lots: "", type: "SFR Subdivision", assignee: "", notes: "" });
        setShowForm(false);
    };
    const moveDeal = (id: string | number, dir: string) => {
        const d = deals.find((x: Deal) => x.id === id);
        if (!d) return;
        const ci: number = STAGES.indexOf(d.stage as string);
        const ni = dir === "next" ? ci + 1 : ci - 1;
        if (ni < 0 || ni >= STAGES.length) return;
        const updated = { ...d, stage: STAGES[ni], updated: new Date().toISOString().split("T")[0] };
        setDeals(deals.map((x: Deal) => x.id === id ? updated : x));
        syncDeal(updated);
    };
    const totalValue = deals.reduce((s: number, d: Deal) => s + d.value, 0);
    const totalProfit = deals.reduce((s: number, d: Deal) => s + d.profit, 0);
    const pipeData = STAGES.map(st => ({ name: SL[st], count: deals.filter((d: Deal) => d.stage === st).length, value: deals.filter((d: Deal) => d.stage === st).reduce((s: number, d: Deal) => s + d.value, 0) / 1e6 }));
    return (
        <Tabs tabs={["Board View", "List View", "Pipeline Analytics"]}>
            <div>
                <div style={{ marginBottom: 24 }}>
                    <div className="axiom-grid-4">
                        <KPI label="Active Deals" value={deals.length} />
                        <KPI label="Pipeline Value" value={fmt.M(totalValue)} color="var(--c-blue)" />
                        <KPI label="Est. Profit" value={fmt.M(totalProfit)} color="var(--c-green)" />
                        <KPI label="Avg Deal Size" value={fmt.M(totalValue / (deals.length || 1))} color="var(--c-gold)" />
                    </div>
                    {syncing && <div style={{ fontSize: 9, color: "var(--c-gold)", marginTop: 8 }}>syncing with cloud...</div>}
                </div>
                <div style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 10 }}>
                    {STAGES.map(stage => {
                        const stageDeals = deals.filter((d: Deal) => d.stage === stage);
                        return (
                            <div key={stage} style={{ minWidth: 220, flex: 1, background: "var(--c-bg3)", border: "1px solid var(--c-border)", borderRadius: 4 }}>
                                <div style={{ padding: "10px 12px", borderBottom: "1px solid var(--c-border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <span style={{ fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: SCOL[stage], fontWeight: 700 }}>{SL[stage]}</span>
                                    <span style={{ fontSize: 12, color: "var(--c-dim)", background: "var(--c-bg)", padding: "2px 6px", borderRadius: 3 }}>{stageDeals.length}</span>
                                </div>
                                <div style={{ padding: 8, minHeight: 120 }}>
                                    {stageDeals.map((deal: Deal) => (
                                        <div key={deal.id} className="axiom-card" style={{ padding: 12, marginBottom: 8, cursor: "pointer", borderLeft: `3px solid ${SCOL[stage]}` }} onClick={() => setSelectedDeal(deal)}>
                                            <div style={{ fontSize: 13, color: "var(--c-text)", fontWeight: 600, marginBottom: 4 }}>{deal.name}</div>
                                            <div style={{ fontSize: 10, color: "var(--c-dim)" }}>{deal.address}</div>
                                            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
                                                <span style={{ fontSize: 12, color: "var(--c-gold)" }}>{fmt.M(deal.value)}</span>
                                                <span style={{ fontSize: 10, color: "var(--c-green)" }}>{deal.lots} lots</span>
                                            </div>
                                            <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
                                                <Button label="—" onClick={(e: any) => { e.stopPropagation(); moveDeal(deal.id, "prev"); }} style={{ padding: "2px 6px", fontSize: 10 }} />
                                                <Button label="→" onClick={(e: any) => { e.stopPropagation(); moveDeal(deal.id, "next"); }} style={{ padding: "2px 6px", fontSize: 10 }} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
                <div style={{ marginTop: 10 }}>
                    {deals.length >= dealLimit && dealLimit < 999 ? (
                        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: "color-mix(in srgb, var(--c-gold) 10%, transparent)", border: "1px solid rgba(196, 160, 82, 0.2)", borderRadius: 4 }}>
                            <span style={{ fontSize: 10, color: "var(--c-gold)", fontWeight: 700, letterSpacing: 1, textTransform: "uppercase" }}>Deal limit reached ({deals.length}/{dealLimit})</span>
                            <Button variant="gold" label="Upgrade for Unlimited →" onClick={() => { const el = document.querySelector('[data-nav="billing"]') as HTMLElement; if (el) el.click(); }} style={{ padding: "4px 10px", fontSize: 9 }} />
                        </div>
                    ) : !showForm && !showOMIngestor ? (
                        <div style={{ display: "flex", gap: 12 }}>
                            <Button variant="gold" label="+ Add Deal (Manual)" onClick={() => setShowForm(true)} />
                            <Button label="📄 Upload OM (Auto-Parse)" onClick={() => setShowOMIngestor(true)} style={{ background: "color-mix(in srgb, var(--c-blue) 25%, transparent)", color: "var(--c-blue)", borderColor: "color-mix(in srgb, var(--c-blue) 40%, transparent)" }} />
                        </div>
                    ) : showOMIngestor ? (
                        <OMIngestor
                            onCancel={() => setShowOMIngestor(false)}
                            onComplete={(parsedData) => {
                                setNd({
                                    ...nd,
                                    name: parsedData.name || "",
                                    address: parsedData.address || "",
                                    type: parsedData.asset_type || "SFR Subdivision",
                                    value: parsedData.purchase_price ? parsedData.purchase_price.toString() : "",
                                    profit: parsedData.noi ? parsedData.noi.toString() : "",
                                    lots: parsedData.units_or_sqft ? parsedData.units_or_sqft.toString() : "",
                                    notes: (parsedData.description || "") + "\n\n" + (parsedData.rent_roll_summary || "") + "\n\n" + (parsedData.financials_summary || "")
                                });
                                setShowOMIngestor(false);
                                setShowForm(true); // Switch to manual form for review
                            }}
                        />
                    ) : (
                        <Card title="New Deal">
                            <div className="axiom-grid-3">
                                <Field label="Project Name"><input className="axiom-input" value={nd.name} onChange={e => setNd({ ...nd, name: e.target.value })} title="Project Name" /></Field>
                                <Field label="Address"><input className="axiom-input" value={nd.address} onChange={e => setNd({ ...nd, address: e.target.value })} title="Address" /></Field>
                                <Field label="Stage"><select className="axiom-select" value={nd.stage} onChange={e => setNd({ ...nd, stage: e.target.value })} title="Stage">{STAGES.map(s => <option key={s} value={s}>{SL[s]}</option>)}</select></Field>
                                <Field label="Deal Value ($)"><input className="axiom-input" type="number" value={nd.value} onChange={e => setNd({ ...nd, value: e.target.value })} title="Value" /></Field>
                                <Field label="Est. Profit ($)"><input className="axiom-input" type="number" value={nd.profit} onChange={e => setNd({ ...nd, profit: e.target.value })} title="Profit" /></Field>
                                <Field label="Lots"><input className="axiom-input" type="number" value={nd.lots} onChange={e => setNd({ ...nd, lots: e.target.value })} title="Lots" /></Field>
                                <Field label="Type"><select className="axiom-select" value={nd.type} onChange={e => setNd({ ...nd, type: e.target.value })} title="Type"><option>SFR Subdivision</option><option>PUD</option><option>Condo</option><option>Townhome</option><option>Mixed-Use</option><option>Land Bank</option><option>Multifamily</option></select></Field>
                                <Field label="Assignee"><input className="axiom-input" value={nd.assignee} onChange={e => setNd({ ...nd, assignee: e.target.value })} title="Assignee" /></Field>
                            </div>
                            <Field label="Notes" mb={20}><textarea className="axiom-input" style={{ height: 60 }} value={nd.notes} onChange={e => setNd({ ...nd, notes: e.target.value })} title="Notes" /></Field>
                            <div style={{ display: "flex", gap: 12 }}>
                                <Button variant="gold" label="Create Deal" onClick={addDeal} />
                                <Button label="Cancel" onClick={() => setShowForm(false)} />
                            </div>
                        </Card>
                    )}
                </div>
                {selectedDeal && (
                    <Card title={`Deal: ${selectedDeal.name}`} action={<Button label="Close" onClick={() => setSelectedDeal(null)} />}>
                        <div className="axiom-grid-3" style={{ gap: 24 }}>
                            {[["Project", selectedDeal.name], ["Address", selectedDeal.address], ["Type", selectedDeal.type], ["Stage", SL[selectedDeal.stage]], ["Value", fmt.usd(selectedDeal.value)], ["Est. Profit", fmt.usd(selectedDeal.profit)], ["Lots", selectedDeal.lots], ["Assignee", selectedDeal.assignee || "— "], ["Last Updated", selectedDeal.updated]].map(([l, v]) => (
                                <div key={l as string}>
                                    <div className="axiom-label" style={{ marginBottom: 4 }}>{l as string}</div>
                                    <div style={{ fontSize: 14, color: "var(--c-text)", fontWeight: 500 }}>{v as string | number}</div>
                                </div>
                            ))}
                        </div>
                        <div style={{ marginTop: 24, padding: 16, background: "var(--c-bg2)", borderRadius: 6 }}>
                            <div className="axiom-label" style={{ marginBottom: 8 }}>INTERNAL NOTES</div>
                            <div className="axiom-kpi-sub" style={{ fontSize: 13, lineHeight: 1.5 }}>{selectedDeal.notes}</div>
                        </div>
                        <div style={{ marginTop: 24 }}>
                            <Agent id="DealReview" system={`You are reviewing this specific deal: ${selectedDeal.name} at ${selectedDeal.address}. ${selectedDeal.lots} lots, value $${selectedDeal.value}. Provide detailed analysis.`} placeholder="Ask about this specific deal..." />
                        </div>
                        <DealTeaser deal={selectedDeal as any} />
                    </Card>
                )}
            </div>
            <div>
                <Card title="All Deals —  List View">
                    <table className="axiom-table">
                        <thead>
                            <tr>
                                {["Project", "Stage", "Type", "Lots", "Value", "Profit", "Assignee", "Updated", ""].map(th => <th key={th} className="axiom-th">{th}</th>)}
                            </tr>
                        </thead>
                        <tbody>{deals.map((d: Deal) => (
                            <tr key={d.id} onClick={() => setSelectedDeal(d)} className="premium-hover">
                                <td className="axiom-td" style={{ color: "var(--c-text)", fontWeight: 600 }}>{d.name}<div style={{ fontSize: 9, color: "var(--c-dim)" }}>{d.address}</div></td>
                                <td className="axiom-td"><Badge label={SL[d.stage]} color={SCOL[d.stage]} /></td>
                                <td className="axiom-td"><Badge label={d.type} color="var(--c-blue)" /></td>
                                <td className="axiom-td">{d.lots}</td>
                                <td className="axiom-td" style={{ color: "var(--c-gold)" }}>{fmt.M(d.value)}</td>
                                <td className="axiom-td" style={{ color: "var(--c-green)" }}>{fmt.M(d.profit)}</td>
                                <td className="axiom-td" style={{ fontSize: 12 }}>{d.assignee || "— "}</td>
                                <td className="axiom-td" style={{ fontSize: 10, color: "var(--c-dim)" }}>{d.updated}</td>
                                <td className="axiom-td"><Button label="x" onClick={(e: any) => { e.stopPropagation(); setDeals(deals.filter((x: Deal) => x.id !== d.id)); }} style={{ padding: "2px 7px", fontSize: 10 }} /></td>
                            </tr>
                        ))}</tbody>
                    </table>
                </Card>
            </div>
            <div>
                <div>
                    <div className="axiom-grid-2">
                        <Card title="Pipeline by Stage">
                            <ResponsiveContainer width="100%" height={240}>
                                <BarChart data={pipeData} onClick={onChartClick(setChartSel) as any} style={CHART_STYLE}>
                                    <CartesianGrid strokeDasharray="3 6" stroke="var(--c-border)" strokeOpacity={0.5} vertical={false} />
                                    <XAxis dataKey="name" stroke="var(--c-dim)" tick={{ fontSize: 11, fontFamily: 'Inter,sans-serif', fill: 'var(--c-muted)' }} />
                                    <YAxis stroke="var(--c-dim)" tick={{ fontSize: 11, fontFamily: 'Inter,sans-serif', fill: 'var(--c-muted)' }} allowDecimals={false} />
                                    <Tooltip {...TT_BAR()} formatter={(v: any, name: any) => [v === 1 ? "1 deal" : `${v} deals`, name]} labelFormatter={l => `Stage: ${l}`} />
                                    <Legend wrapperStyle={{ fontSize: 11, color: 'var(--c-muted)', paddingTop: 12 }} />
                                    <Bar dataKey="count" name="Deals" fill="var(--c-gold)" radius={[3, 3, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </Card>
                        <Card title="Value by Stage ($M)">
                            <ResponsiveContainer width="100%" height={240}>
                                <BarChart data={pipeData} onClick={onChartClick(setChartSel) as any} style={CHART_STYLE}>
                                    <CartesianGrid strokeDasharray="3 6" stroke="var(--c-border)" strokeOpacity={0.5} />
                                    <XAxis dataKey="name" stroke="var(--c-dim)" tick={{ fontSize: 9, fill: 'var(--c-muted)' }} />
                                    <YAxis stroke="var(--c-dim)" tick={{ fontSize: 12, fontFamily: 'Inter,sans-serif', fill: 'var(--c-muted)' }} tickFormatter={v => `$${v.toFixed(1)}M`} />
                                    <Tooltip {...TT()} formatter={(v: any, name: any) => [`$${Number(v).toFixed(2)}M`, name]} labelFormatter={l => `Stage: ${l}`} />
                                    <Legend wrapperStyle={{ fontSize: 11, color: 'var(--c-muted)', paddingTop: 12 }} />
                                    <Bar dataKey="value" name="Deal Value" fill="var(--c-blue)" radius={[3, 3, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </Card>
                    </div>
                    <Card title="Pipeline — · AI Agent" action={null}>
                        <Agent id="PipelineAgent" system="You are a real estate deal pipeline manager. Analyze deal flow, stage velocity, conversion rates, and pipeline health. Advise on deal prioritization and resource allocation." placeholder="Ask about pipeline metrics, deal velocity, or prioritization..." />
                    </Card>
                </div>
            </div>
        </Tabs>
    );
}
