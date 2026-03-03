import { useState, useEffect } from "react";
import { Card, Field, Badge, Button } from "../../components/ui/components";
import { Tabs } from "../../components/ui/layout";
import { Agent } from "../agents/Agent";
import { useLS } from "../../hooks/useLS";
import { CHART_TT_BAR, AXIS_TICK, GRID_STROKE } from "../../lib/chartTheme";
import { supa } from "../../lib/supabase";

import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";

const INTEL_TYPES = ["Zoning Change", "Permit Activity", "Market Report", "Comp Sale", "Development News", "Infrastructure", "Political", "Public Record", "Broker Intel", "Other"];
const REL_COL: Record<string, string> = { High: "var(--c-red)", Medium: "var(--c-amber)", Low: "var(--c-dim)" };
const TYPE_COL: Record<string, string> = {
    "Zoning Change": "var(--c-purple)", "Permit Activity": "var(--c-amber)",
    "Market Report": "var(--c-blue)", "Comp Sale": "var(--c-green)",
    "Development News": "var(--c-teal)", Infrastructure: "var(--c-gold)",
    Political: "var(--c-red)", "Public Record": "var(--c-dim)",
    "Broker Intel": "var(--c-gold)", Other: "var(--c-muted)",
};

const LIVE_METRICS = [
    { metric: "Median Home Price (MSA)", value: "$485,000", change: "+3.2%", src: "Zillow" },
    { metric: "Active Land Listings", value: "127", change: "+8", src: "MLS" },
    { metric: "Avg Days on Market (Land)", value: "62 days", change: "-5", src: "Redfin" },
    { metric: "New Permits Filed (30d)", value: "23", change: "+4", src: "County" },
    { metric: "Mortgage Rate (30-yr)", value: "6.75%", change: "+0.125%", src: "Freddie Mac" },
    { metric: "Construction Cost Index", value: "1,142", change: "+2.1%", src: "ENR" },
    { metric: "Land Price PSF (SFR)", value: "$28.50", change: "+5.4%", src: "CoStar" },
    { metric: "Absorption Rate (lots/mo)", value: "3.2", change: "-0.3", src: "Market Study" },
];

export function DataIntel() {
    const [records, setRecords] = useLS("axiom_intel", [
        { id: 1, type: "Zoning Change", title: "Rezoning Application - 500 Elm St", source: "City Planning Portal", date: "2025-02-15", relevance: "High", summary: "Adjacent parcel rezoning from C-2 to R-3 could increase density allowance for subject.", linked: true },
        { id: 2, type: "Market Report", title: "Q4 2024 Land Sales Report - Sacramento MSA", source: "CoStar Analytics", date: "2025-01-20", relevance: "Medium", summary: "Finished lot prices up 8% YoY. Absorption rates steady at 3.2 lots/month for SFR.", linked: true },
        { id: 3, type: "Permit Activity", title: "125-Lot Subdivision Approved - Oak Grove", source: "County Records", date: "2025-02-08", relevance: "High", summary: "Competing project 2 miles from subject site. Expected to begin construction Q3 2025.", linked: false },
        { id: 4, type: "Infrastructure", title: "Highway 50 Interchange Improvement", source: "Caltrans", date: "2025-01-30", relevance: "Medium", summary: "$42M interchange project begins 2026. Will improve access to subject by 8 minutes.", linked: false },
        { id: 5, type: "Comp Sale", title: "Lot Sale - 45 lots @ $178K/lot", source: "MLS / Public Records", date: "2025-02-12", relevance: "High", summary: "Comparable subdivision sold. 45 finished lots averaging 5,200 SF at $178,000 per lot.", linked: true },
    ] as any[]);

    const [filterType, setFilterType] = useState("All");
    const [filterRel, setFilterRel] = useState("All");
    const [nr, setNr] = useState({ type: "Market Report", title: "", source: "", summary: "", relevance: "Medium", linked: false });
    const [liveMetrics, setLiveMetrics] = useState<any[]>(LIVE_METRICS);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        loadLiveMetrics();
    }, []);

    const loadLiveMetrics = async () => {
        try {
            // @ts-ignore - bypassing wrapper limitations
            const r = await fetch(`${supa.url || import.meta.env.VITE_SUPABASE_URL || "http://127.0.0.1:54321"}/rest/v1/signals?select=*&order=created_at.desc&limit=8`, {
                // @ts-ignore
                headers: supa.headers()
            });
            const data: any[] = await r.json();

            if (data && Array.isArray(data) && data.length > 0) {
                setLiveMetrics(data.map(s => ({
                    metric: s.title || s.domain,
                    value: s.summary ? s.summary.split(" ")[0] : s.direction,
                    change: s.direction === "inflationary" ? "+ Trend" : (s.direction === "deflationary" ? "- Trend" : "Neutral"),
                    src: s.source_name || "API"
                })));
            }
        } catch (e) {
            console.warn("Could not load live metrics from signals table.", e);
        }
    };

    const handleRefreshData = async () => {
        setRefreshing(true);
        try {
            await supa.callEdge("fred-ingestor", {});
            await loadLiveMetrics();
        } catch (e) {
            console.error("Failed to ingest FRED data", e);
        } finally {
            setRefreshing(false);
        }
    };

    const filtered = (records as any[]).filter((r: any) => {
        if (filterType !== "All" && r.type !== filterType) return false;
        if (filterRel !== "All" && r.relevance !== filterRel) return false;
        return true;
    });

    const addRec = () => {
        if (!nr.title) return;
        setRecords([...(records as any[]), { ...nr, id: Date.now(), date: new Date().toISOString().split("T")[0] }]);
        setNr({ type: "Market Report", title: "", source: "", summary: "", relevance: "Medium", linked: false });
    };

    const chartData = INTEL_TYPES.map(t => ({
        name: t.split(" ")[0],
        count: (records as any[]).filter((r: any) => r.type === t).length,
    }));

    return (
        <Tabs tabs={["Intel Feed", "Add Record", "Analytics", "Live Market"]}>
            {/* ─ Intel Feed ─ */}
            <div>
                <div className="axiom-flex-row" style={{ gap: 8, marginBottom: 14 }}>
                    <input className="axiom-input" style={{ flex: 1 }} placeholder="Search intel records..." />
                    <select className="axiom-select" value={filterType} onChange={e => setFilterType(e.target.value)}>
                        <option>All</option>{INTEL_TYPES.map(t => <option key={t}>{t}</option>)}
                    </select>
                    <select className="axiom-select" value={filterRel} onChange={e => setFilterRel(e.target.value)}>
                        <option>All</option><option>High</option><option>Medium</option><option>Low</option>
                    </select>
                </div>
                <Card title={`Intelligence Feed (${filtered.length} records)`}>
                    {filtered.map((r: any) => (
                        <div key={r.id} className="axiom-flex-row" style={{ gap: 12, padding: "12px 0", borderBottom: "1px solid var(--c-border)" }}>
                            <div style={{ flex: 1 }}>
                                <div className="axiom-flex-row" style={{ gap: 6, alignItems: "center", marginBottom: 4 }}>
                                    <Badge label={r.type} color={TYPE_COL[r.type] || "var(--c-dim)"} />
                                    <Badge label={r.relevance} color={REL_COL[r.relevance] || "var(--c-dim)"} />
                                    {r.linked && <Badge label="Linked" color="var(--c-gold)" />}
                                    <span className="axiom-text-10-dim" style={{ marginLeft: "auto" }}>{r.date}</span>
                                </div>
                                <div style={{ fontSize: 13, color: "var(--c-text)", fontWeight: 600, marginBottom: 2 }}>{r.title}</div>
                                <div className="axiom-text-10-dim">Source: {r.source}</div>
                                <div style={{ fontSize: 12, color: "var(--c-sub)", lineHeight: 1.4, marginTop: 2 }}>{r.summary}</div>
                            </div>
                            <div className="axiom-flex-col" style={{ gap: 4 }}>
                                <Button label="x" onClick={() => setRecords((records as any[]).filter((x: any) => x.id !== r.id))} style={{ padding: "2px 7px", fontSize: 9 }} />
                            </div>
                        </div>
                    ))}
                </Card>
            </div>

            {/* ─ Add Record ─ */}
            <div>
                <Card title="Add Intel Record">
                    <div className="axiom-grid-3" style={{ marginBottom: 12 }}>
                        <Field label="Intel Type"><select className="axiom-select" value={nr.type} onChange={e => setNr({ ...nr, type: e.target.value })}>{INTEL_TYPES.map(t => <option key={t}>{t}</option>)}</select></Field>
                        <Field label="Title"><input className="axiom-input" value={nr.title} onChange={e => setNr({ ...nr, title: e.target.value })} placeholder="Brief descriptive title" /></Field>
                        <Field label="Source"><input className="axiom-input" value={nr.source} onChange={e => setNr({ ...nr, source: e.target.value })} placeholder="CoStar, County Records, MLS..." /></Field>
                    </div>
                    <Field label="Summary / Analysis" mb={12}>
                        <textarea className="axiom-input" style={{ height: 80 }} value={nr.summary} onChange={e => setNr({ ...nr, summary: e.target.value })} placeholder="Detailed analysis and implications..." />
                    </Field>
                    <div className="axiom-grid-2" style={{ marginBottom: 12 }}>
                        <Field label="Relevance"><select className="axiom-select" value={nr.relevance} onChange={e => setNr({ ...nr, relevance: e.target.value })}><option>High</option><option>Medium</option><option>Low</option></select></Field>
                        <Field label="Link to Active Deal?"><select className="axiom-select" value={nr.linked ? "Yes" : "No"} onChange={e => setNr({ ...nr, linked: e.target.value === "Yes" })}><option>No</option><option>Yes</option></select></Field>
                    </div>
                    <Button variant="gold" label="Save Intel Record" onClick={addRec} />
                </Card>
            </div>

            {/* ─ Analytics ─ */}
            <div>
                <Card title="Intel by Category">
                    <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 6" stroke={GRID_STROKE} vertical={false} />
                            <XAxis dataKey="name" tick={AXIS_TICK} axisLine={false} tickLine={false} />
                            <YAxis tick={AXIS_TICK} axisLine={false} tickLine={false} allowDecimals={false} />
                            <Tooltip {...CHART_TT_BAR} formatter={(v: any) => [v === 1 ? "1 record" : `${v} records`, "Intel Records"]} />
                            <Bar dataKey="count" name="Intel Records" fill="var(--c-gold)" radius={[3, 3, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </Card>
                <Card title="Data Intelligence — AI Agent">
                    <Agent id="DataIntel" system="You are a real estate market intelligence analyst. Analyze market data, identify trends, connect intel records to deal implications, and produce actionable market briefs." placeholder="Ask about market trends, intel analysis, or data implications for your deals..." />
                </Card>
            </div>

            {/* ─ Live Market ─ */}
            <div>
                <Card title="Live Market Feed" action={<Button label={refreshing ? "Syncing..." : "Sync FRED APIs"} onClick={handleRefreshData} variant="gold" />}>
                    <div className="axiom-text-12-dim" style={{ marginBottom: 14 }}>Real-time data from connected APIs and MCP servers.</div>
                    {liveMetrics.map((m, i) => (
                        <div key={i} className="axiom-flex-between" style={{ padding: "8px 0", borderBottom: "1px solid var(--c-border)" }}>
                            <div style={{ flex: 1, fontSize: 13, color: "var(--c-text)" }}>{m.metric}</div>
                            <div style={{ fontSize: 15, color: "var(--c-gold)", fontWeight: 700 }}>{m.value}</div>
                            <div style={{ fontSize: 12, color: m.change.includes("-") ? "var(--c-red)" : "var(--c-green)", width: 64, textAlign: "right" }}>{m.change}</div>
                            <div className="axiom-text-10-dim" style={{ width: 70, textAlign: "right" }}>{m.src}</div>
                        </div>
                    ))}
                </Card>
            </div>
        </Tabs>
    );
}
