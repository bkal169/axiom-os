import { useState, useEffect } from "react";
import { Card, Field, Badge, Button } from "../../components/ui/components";
import { Tabs } from "../../components/ui/layout";
import { useLS } from "../../hooks/useLS";
import { fmt } from "../../lib/utils";
import { supa } from "../../lib/supabase";

const STATUS_COL: Record<string, string> = {
    Connected: "var(--c-green)", Idle: "var(--c-amber)", Error: "var(--c-red)"
};
const TYPE_COL: Record<string, string> = {
    Zillow: "var(--c-blue)", Redfin: "var(--c-red)", MLS: "var(--c-gold)",
    Realtor: "var(--c-green)", ATTOM: "var(--c-purple)"
};
const LISTING_COL: Record<string, string> = {
    Active: "var(--c-green)", "Price Reduced": "var(--c-amber)",
    New: "var(--c-blue)", Pending: "var(--c-purple)", Sold: "var(--c-dim)"
};

export function MLSListings() {
    const [feeds, setFeeds] = useLS("axiom_mls_feeds", [
        { id: 1, name: "Zillow ZAPI", type: "Zillow", status: "Connected", endpoint: "https://api.bridgedataoutput.com/api/v2/zillow", lastSync: "2025-02-20 14:30", records: 2450 },
        { id: 2, name: "Redfin Data", type: "Redfin", status: "Connected", endpoint: "https://redfin-com.p.rapidapi.com", lastSync: "2025-02-20 12:15", records: 1820 },
        { id: 3, name: "MLS (RESO)", type: "MLS", status: "Idle", endpoint: "https://api.reso.org/v2", lastSync: "", records: 0 },
        { id: 4, name: "Realtor.com", type: "Realtor", status: "Idle", endpoint: "https://api.realtor.com/listings", lastSync: "", records: 0 },
        { id: 5, name: "ATTOM Property", type: "ATTOM", status: "Connected", endpoint: "https://api.attomdata.com/property", lastSync: "2025-02-19 09:00", records: 5600 },
    ] as any[]);

    const [searches, setSearches] = useLS("axiom_saved_searches", [
        { id: 1, name: "Infill SFR Lots - Bay Area", criteria: "5-50 acres, R-1/R-2, <$5M, Bay Area", alerts: true, results: 12, lastRun: "2025-02-20" },
        { id: 2, name: "Raw Land - Central Valley", criteria: "20-200 acres, AG/Rural, <$2M, Fresno/Kern", alerts: true, results: 34, lastRun: "2025-02-19" },
        { id: 3, name: "Entitled Subdivisions", criteria: "Approved TM, 20-100 lots, CA", alerts: false, results: 8, lastRun: "2025-02-18" },
    ] as any[]);

    const [ns, setNs] = useState({ name: "", criteria: "", alerts: true });

    const defaultListings = [
        { id: 1, address: "123 Oak Valley Rd", city: "Sacramento", price: 2800000, acres: 8.5, lots: "Est. 35", zoning: "R-1", source: "Zillow", dom: 45, status: "Active" },
        { id: 2, address: "4500 Hillside Dr", city: "El Dorado Hills", price: 4200000, acres: 12.3, lots: "Est. 48", zoning: "PD", source: "Redfin", dom: 12, status: "Active" },
        { id: 3, address: "890 Ranch Rd", city: "Folsom", price: 1950000, acres: 5.2, lots: "Est. 22", zoning: "R-2", source: "MLS", dom: 78, status: "Price Reduced" },
        { id: 4, address: "2200 Valley View", city: "Roseville", price: 6100000, acres: 18.7, lots: "Est. 72", zoning: "R-1", source: "ATTOM", dom: 30, status: "Active" },
        { id: 5, address: "777 Creek Crossing", city: "Lincoln", price: 3400000, acres: 10.1, lots: "Est. 40", zoning: "PD", source: "Zillow", dom: 5, status: "New" },
    ];

    const [listings, setListings] = useState<any[]>(defaultListings);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setLoading(true);
        supa.callEdge("comps-fetch", { limit: 12, city: "Sacramento", state: "CA" })
            .then(res => {
                if (res && res.comps && res.comps.length > 0) {
                    setListings(res.comps.map((c: any) => ({
                        id: c.id,
                        address: c.address,
                        city: c.city,
                        price: c.price || 450000,
                        acres: c.sqft ? parseFloat((c.sqft / 43560).toFixed(1)) : (c.lots ? c.lots / 4 : 5.0),
                        lots: c.lots ? `Est. ${c.lots}` : "N/A",
                        zoning: c.asset_type || "R-1",
                        source: c.source || res.provider || "ATTOM",
                        dom: Math.floor(Math.random() * 30),
                        status: c.status || "Active"
                    })));
                }
            })
            .catch(e => console.warn("Failed to load live listings via edge function", e))
            .finally(() => setLoading(false));
    }, []);

    const toggle = (id: number) =>
        setFeeds((feeds as any[]).map((f: any) => f.id === id
            ? { ...f, status: f.status === "Connected" ? "Idle" : "Connected" } : f));

    const addSearch = () => {
        if (!ns.name) return;
        setSearches([...(searches as any[]), { ...ns, id: Date.now(), results: 0, lastRun: new Date().toISOString().split("T")[0] }]);
        setNs({ name: "", criteria: "", alerts: true });
    };

    return (
        <Tabs tabs={["Active Listings", "Saved Searches", "Data Feeds", "Property Alerts"]}>
            {/* ─ Active Listings ─ */}
            <div>
                <div className="axiom-flex-gap-8 axiom-mb-14">
                    <input className="axiom-input axiom-flex-1" placeholder="Search by address, city, APN, or keyword..." title="Search Listings" />
                    <select className="axiom-select" title="Filter by Source"><option>All Sources</option><option>Zillow</option><option>Redfin</option><option>MLS</option><option>ATTOM</option></select>
                    <select className="axiom-select" title="Filter by Status"><option>All Statuses</option><option>Active</option><option>New</option><option>Price Reduced</option></select>
                    <Button variant="gold" label="Search" onClick={() => { }} />
                </div>
                <Card title="Matching Properties" action={<Badge label={loading ? "Syncing APIs..." : listings.length + " Results"} color={loading ? "var(--c-amber)" : "var(--c-blue)"} />}>
                    <table className="axiom-table">
                        <thead><tr>{["Address", "City", "Price", "Acres", "Est. Lots", "Zoning", "Source", "DOM", "Status", ""].map(h => <th key={h} className="axiom-th">{h}</th>)}</tr></thead>
                        <tbody>{listings.map(l => (
                            <tr key={l.id}>
                                <td className="axiom-td axiom-text-sub axiom-text-bold">{l.address}</td>
                                <td className="axiom-td">{l.city}</td>
                                <td className="axiom-td axiom-text-gold">{fmt.usd(l.price)}</td>
                                <td className="axiom-td">{l.acres} ac</td>
                                <td className="axiom-td">{l.lots}</td>
                                <td className="axiom-td"><Badge label={l.zoning} color="var(--c-blue)" /></td>
                                <td className="axiom-td"><Badge label={l.source} color={TYPE_COL[l.source] || "var(--c-dim)"} /></td>
                                <td className="axiom-td">{l.dom}d</td>
                                <td className="axiom-td"><Badge label={l.status} color={LISTING_COL[l.status] || "var(--c-dim)"} /></td>
                                <td className="axiom-td">
                                    <Button label="Import" onClick={() => { }} className="axiom-p-2-8 axiom-text-9" />
                                </td>
                            </tr>
                        ))}</tbody>
                    </table>
                </Card>
            </div>

            {/* ─ Saved Searches ─ */}
            <div>
                <Card title="Saved Searches" action={<Badge label={(searches as any[]).length + " Saved"} color="var(--c-gold)" />}>
                    {(searches as any[]).map((s: any) => (
                        <div key={s.id} className="axiom-flex-sb-center axiom-py-20" style={{ borderBottom: "1px solid var(--c-border)" }}>
                            <div className="axiom-flex-1">
                                <div className="axiom-text-13-text-bold axiom-text-white">{s.name}</div>
                                <div className="axiom-text-10-dim axiom-mt-4">{s.criteria}</div>
                            </div>
                            <Badge label={s.results + " results"} color="var(--c-blue)" />
                            <span className="axiom-text-10-dim axiom-mx-8">{s.lastRun}</span>
                            <Badge label={s.alerts ? "Alerts On" : "Alerts Off"} color={s.alerts ? "var(--c-green)" : "var(--c-dim)"} />
                            <Button label="x" onClick={() => setSearches((searches as any[]).filter((x: any) => x.id !== s.id))} className="axiom-ml-8 axiom-p-2-7 axiom-text-9" />
                        </div>
                    ))}
                </Card>
                <Card title="Create Saved Search">
                    <div className="axiom-grid-2 axiom-mb-12">
                        <Field label="Search Name"><input className="axiom-input" value={ns.name} onChange={e => setNs({ ...ns, name: e.target.value })} placeholder="e.g., Infill Lots - Sacramento" title="Search Name" /></Field>
                        <Field label="Criteria"><input className="axiom-input" value={ns.criteria} onChange={e => setNs({ ...ns, criteria: e.target.value })} placeholder="Acreage, zoning, price range, location..." title="Criteria" /></Field>
                    </div>
                    <div className="axiom-flex-gap-8 axiom-mb-12 axiom-items-center">
                        <input type="checkbox" checked={ns.alerts} onChange={() => setNs({ ...ns, alerts: !ns.alerts })} className="axiom-checkbox" title="Email Alerts" id="listing-alerts" />
                        <label htmlFor="listing-alerts" className="axiom-text-12 color-sub axiom-pointer">Email alerts when new matches found</label>
                    </div>
                    <Button variant="gold" label="Save Search" onClick={addSearch} />
                </Card>
            </div>

            {/* ─ Data Feeds ─ */}
            <div>
                <Card title="MLS & Listing Data Feeds">
                    <table className="axiom-table">
                        <thead><tr>{["Feed Name", "Type", "Endpoint", "Records", "Last Sync", "Status", "Actions"].map(h => <th key={h} className="axiom-th">{h}</th>)}</tr></thead>
                        <tbody>{(feeds as any[]).map((f: any) => (
                            <tr key={f.id}>
                                <td className="axiom-td axiom-text-sub axiom-text-bold">{f.name}</td>
                                <td className="axiom-td"><Badge label={f.type} color={TYPE_COL[f.type] || "var(--c-dim)"} /></td>
                                <td className="axiom-td axiom-text-10-dim">{f.endpoint}</td>
                                <td className="axiom-td axiom-text-gold">{f.records.toLocaleString()}</td>
                                <td className="axiom-td axiom-text-10-dim">{f.lastSync || "Never"}</td>
                                <td className="axiom-td">
                                    <div className="axiom-flex-center-gap-6">
                                        <span className="axiom-w-7 axiom-h-7 axiom-radius-50p" style={{ background: STATUS_COL[f.status] }} title={f.status} />
                                        <span className="axiom-text-12">{f.status}</span>
                                    </div>
                                </td>
                                <td className="axiom-td">
                                    <div className="axiom-flex-gap-4">
                                        <Button label={f.status === "Connected" ? "Pause" : "Connect"} onClick={() => toggle(f.id)} className="axiom-p-2-8 axiom-text-9" />
                                        <Button label="Sync" onClick={() => { }} className="axiom-p-2-8 axiom-text-9" />
                                    </div>
                                </td>
                            </tr>
                        ))}</tbody>
                    </table>
                </Card>
            </div>

            {/* ─ Property Alerts ─ */}
            <div>
                <Card title="Property Alert Configuration">
                    {[
                        ["New Listings in Target Areas", "Immediate notification for new land listings matching your criteria"],
                        ["Price Reductions", "Alert when watched properties reduce price by 5%+"],
                        ["Days on Market Threshold", "Properties exceeding 60 DOM"],
                        ["Foreclosure / REO", "Bank-owned and distressed properties in target markets"],
                        ["Off-Market Opportunities", "Broker network leads and pocket listings"],
                        ["Permit Activity", "New entitlement applications near target areas"],
                    ].map(([t, d], i) => (
                        <div key={i} className="axiom-flex-sb-center axiom-mb-8 axiom-py-8" style={{ borderBottom: "1px solid var(--c-border)" }}>
                            <div className="axiom-flex-center-gap-10 axiom-flex-1">
                                <input type="checkbox" defaultChecked={i < 3} className="axiom-checkbox" title={t} id={`alert-${i}`} />
                                <div>
                                    <label htmlFor={`alert-${i}`} className="axiom-text-13-text-bold axiom-text-white axiom-pointer">{t}</label>
                                    <div className="axiom-text-10-dim">{d}</div>
                                </div>
                            </div>
                            <select className="axiom-select axiom-w-90 axiom-p-3-6 axiom-text-10" title="Notification Channel">
                                <option>Email</option><option>SMS</option><option>Both</option><option>Off</option>
                            </select>
                        </div>
                    ))}
                </Card>
            </div>
        </Tabs>
    );
}
