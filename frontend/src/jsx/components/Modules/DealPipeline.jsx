import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { C, S } from '../../constants';
import { fmt, useLS } from '../../utils';
import { Tabs } from '../UI/Tabs';
import { Card } from '../UI/Card';
import { KPI } from '../UI/KPI';
import { Badge } from '../UI/Badge';
import { Field } from '../UI/Field';
import { Agent } from '../UI/Agent';

const STAGES = ["sourcing", "screening", "due_diligence", "committee", "closing", "asset_mgmt"];
const SL = { sourcing: "Sourcing", screening: "Screening", due_diligence: "Due Diligence", committee: "Committee", closing: "Closing", asset_mgmt: "Asset Mgmt" };
const SCOL = { sourcing: C.blue, screening: C.teal, due_diligence: C.amber, committee: C.purple, closing: C.gold, asset_mgmt: C.green };

export default function DealPipeline() {
    const [deals, setDeals] = useLS("axiom_deals", [
        { id: 1, name: "Sunset Ridge Estates", address: "456 Ridge Rd", stage: "due_diligence", value: 9250000, profit: 1850000, lots: 42, type: "SFR Subdivision", assignee: "Sarah Chen", updated: "2025-02-15", notes: "Phase I ESA clean. Geotech pending." },
        { id: 2, name: "Hawk Valley Subdivision", address: "789 Valley Dr", stage: "screening", value: 5600000, profit: 840000, lots: 28, type: "SFR Subdivision", assignee: "Mike Rodriguez", updated: "2025-02-10", notes: "Initial feasibility looks promising. Need comp data." },
    ]);
    const [nd, setNd] = useState({ name: "", address: "", stage: "sourcing", value: "", profit: "", lots: "", type: "SFR Subdivision", assignee: "", notes: "" });
    const [showForm, setShowForm] = useState(false);
    const [selectedDeal, setSelectedDeal] = useState(null);
    const [speckleStatus, setSpeckleStatus] = useState("");

    const handleSpeckleLoad = async (deal) => {
        setSpeckleStatus("Authenticating with Speckle...");
        try {
            const keys = JSON.parse(localStorage.getItem('axiom_keys') || '{}');
            const p = keys.proxyUrl || 'https://ubdhpacoqmlxudcvhyuu.supabase.co/functions/v1';
            let headers = { "Content-Type": "application/json" };
            if (keys.anonKey) headers["Authorization"] = `Bearer ${keys.anonKey}`;
            
            const r = await fetch(`${p.replace(/\/+$/, '')}/speckle-ingestor`, {
                method: "POST", headers, body: JSON.stringify({ action: "auth", project_id: deal.id })
            });
            const d = await r.json();
            if (d.error) throw new Error(d.error);
            setSpeckleStatus("BIM Model Stream Loaded ✓");
            setTimeout(() => setSpeckleStatus(""), 3000);
        } catch(e) {
            setSpeckleStatus(`Error: ${e.message}`);
        }
    };

    const addDeal = () => { if (!nd.name) return; setDeals([...deals, { ...nd, id: Date.now(), value: +nd.value || 0, profit: +nd.profit || 0, lots: +nd.lots || 0, updated: new Date().toISOString().split("T")[0] }]); setNd({ name: "", address: "", stage: "sourcing", value: "", profit: "", lots: "", type: "SFR Subdivision", assignee: "", notes: "" }); setShowForm(false); };
    const moveDeal = (id, dir) => { const d = deals.find(x => x.id === id); if (!d) return; const ci = STAGES.indexOf(d.stage); const ni = dir === "next" ? ci + 1 : ci - 1; if (ni < 0 || ni >= STAGES.length) return; setDeals(deals.map(x => x.id === id ? { ...x, stage: STAGES[ni], updated: new Date().toISOString().split("T")[0] } : x)); };

    const totalValue = deals.reduce((s, d) => s + d.value, 0);
    const totalProfit = deals.reduce((s, d) => s + d.profit, 0);
    const pipeData = STAGES.map(st => ({ name: SL[st], count: deals.filter(d => d.stage === st).length, value: deals.filter(d => d.stage === st).reduce((s, d) => s + d.value, 0) / 1e6 }));

    return (
        <Tabs tabs={["Board View", "List View", "Pipeline Analytics"]}>
            <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                    <div style={S.g4}>
                        <KPI label="Active Deals" value={deals.length} />
                        <KPI label="Pipeline Value" value={fmt.M(totalValue)} color={C.blue} />
                        <KPI label="Est. Profit" value={fmt.M(totalProfit)} color={C.green} />
                        <KPI label="Avg Deal Size" value={fmt.M(totalValue / (deals.length || 1))} color={C.gold} />
                    </div>
                </div>
                <div style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 10 }}>
                    {STAGES.map(stage => (
                        <div key={stage} style={{ minWidth: 220, flex: 1, background: C.bg3, border: `1px solid ${C.border}`, borderRadius: 4 }}>
                            <div style={{ padding: "10px 12px", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <span style={{ fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: SCOL[stage], fontWeight: 700 }}>{SL[stage]}</span>
                                <span style={{ fontSize: 12, color: C.dim, background: C.bg, padding: "2px 6px", borderRadius: 3 }}>{deals.filter(d => d.stage === stage).length}</span>
                            </div>
                            <div style={{ padding: 8, minHeight: 120 }}>
                                {deals.filter(d => d.stage === stage).map(deal => (
                                    <div key={deal.id} style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 3, padding: 10, marginBottom: 6, cursor: "pointer", borderLeft: `3px solid ${SCOL[stage]}` }} onClick={() => setSelectedDeal(deal)}>
                                        <div style={{ fontSize: 13, color: C.text, fontWeight: 600, marginBottom: 3 }}>{deal.name}</div>
                                        <div style={{ fontSize: 10, color: C.dim }}>{deal.address}</div>
                                        <div style={{ display: "flex", gap: 4, marginTop: 6 }}>
                                            <button style={{ ...S.btn(), padding: "2px 6px", fontSize: 8 }} onClick={e => { e.stopPropagation(); moveDeal(deal.id, "prev"); }}>—</button>
                                            <button style={{ ...S.btn(), padding: "2px 6px", fontSize: 8 }} onClick={e => { e.stopPropagation(); moveDeal(deal.id, "next"); }}>→</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
                {!showForm ? <button style={S.btn("gold")} onClick={() => setShowForm(true)}>+ Add Deal</button> : (
                    <Card title="New Deal">
                        <div style={S.g3}>
                            <Field label="Project Name"><input style={S.inp} value={nd.name} onChange={e => setNd({ ...nd, name: e.target.value })} /></Field>
                            <Field label="Stage"><select style={S.sel} value={nd.stage} onChange={e => setNd({ ...nd, stage: e.target.value })}>{STAGES.map(s => <option key={s} value={s}>{SL[s]}</option>)}</select></Field>
                            <Field label="Deal Value ($)"><input style={S.inp} type="number" value={nd.value} onChange={e => setNd({ ...nd, value: e.target.value })} /></Field>
                        </div>
                        <div style={{ display: "flex", gap: 8 }}><button style={S.btn("gold")} onClick={addDeal}>Create Deal</button><button style={S.btn()} onClick={() => setShowForm(false)}>Cancel</button></div>
                    </Card>
                )}

                {selectedDeal && (
                    <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.8)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <div style={{ width: 600, background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: 24, boxShadow: "0 12px 40px rgba(0,0,0,0.5)" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
                                <h3 style={{ margin: 0, color: C.text }}>{selectedDeal.name}</h3>
                                <button style={S.btn()} onClick={() => setSelectedDeal(null)}>Close</button>
                            </div>
                            <div style={{ marginBottom: 16, color: C.dim, fontSize: 13 }}>{selectedDeal.address} • {SL[selectedDeal.stage]} • {fmt.M(selectedDeal.value)}</div>
                            <Card title="BIM & Arch Integration">
                                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                    <button style={S.btn("blue")} onClick={() => handleSpeckleLoad(selectedDeal)}>🏗️ Load Speckle BIM Data</button>
                                    {speckleStatus && <span style={{ fontSize: 12, color: speckleStatus.includes("Error") ? C.red : C.green }}>{speckleStatus}</span>}
                                </div>
                                <div style={{ marginTop: 12, padding: 12, border: `1px dashed ${C.border2}`, borderRadius: 4, height: 120, display: "flex", alignItems: "center", justifyContent: "center", color: C.dim, fontSize: 11 }}>
                                    {speckleStatus.includes("Loaded") ? "Speckle Viewer Stream Active (Simulated)" : "3D Viewer Container (Awaiting Stream)"}
                                </div>
                            </Card>
                        </div>
                    </div>
                )}
            </div>
        </Tabs>
    );
}
