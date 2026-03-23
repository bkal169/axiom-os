import React, { useState } from 'react';
import { C, S } from '../../constants';
import { fmt, useLS } from '../../utils';
import { Tabs } from '../UI/Tabs';
import { Card } from '../UI/Card';
import { Badge, Dot } from '../UI/Badge';
import { Field } from '../UI/Field';

export default function MLSListings() {
    const [feeds, setFeeds] = useLS("axiom_mls_feeds", [
        { id: 1, name: "Zillow ZAPI", type: "Zillow", status: "Connected", endpoint: "https://api.bridgedataoutput.com/api/v2/zillow", key: "zw_— ¢— ¢— ¢— ¢", lastSync: "2025-02-20 14:30", records: 2450 },
        { id: 2, name: "Redfin Data", type: "Redfin", status: "Connected", endpoint: "https://redfin-com.p.rapidapi.com", key: "rf_— ¢— ¢— ¢— ¢", lastSync: "2025-02-20 12:15", records: 1820 },
        { id: 3, name: "MLS (RESO)", type: "MLS", status: "Idle", endpoint: "https://api.reso.org/v2", key: "", lastSync: "", records: 0 },
        { id: 4, name: "Realtor.com", type: "Realtor", status: "Idle", endpoint: "https://api.realtor.com/listings", key: "", lastSync: "", records: 0 },
        { id: 5, name: "ATTOM Property", type: "ATTOM", status: "Connected", endpoint: "https://api.attomdata.com/property", key: "at_— ¢— ¢— ¢— ¢", lastSync: "2025-02-19 09:00", records: 5600 },
    ]);
    const [searches, setSearches] = useLS("axiom_saved_searches", [
        { id: 1, name: "Infill SFR Lots - Bay Area", criteria: "5-50 acres, R-1/R-2, < $5M, Bay Area", alerts: true, results: 12, lastRun: "2025-02-20" },
        { id: 2, name: "Raw Land - Central Valley", criteria: "20-200 acres, AG/Rural, < $2M, Fresno/Kern", alerts: true, results: 34, lastRun: "2025-02-19" },
        { id: 3, name: "Entitled Subdivisions", criteria: "Approved TM, 20-100 lots, CA", alerts: false, results: 8, lastRun: "2025-02-18" },
    ]);
    const [ns, setNs] = useState({ name: "", criteria: "", alerts: true });
    const [syncing, setSyncing] = useState(false);

    const SC = { Connected: C.green, Idle: C.amber, Error: C.red };
    const TC2 = { Zillow: C.blue, Redfin: C.red, MLS: C.gold, Realtor: C.green, ATTOM: C.purple };
    const toggle = (id) => setFeeds(feeds.map(f => f.id === id ? { ...f, status: f.status === "Connected" ? "Idle" : "Connected" } : f));
    const addSearch = () => { if (!ns.name) return; setSearches([...searches, { ...ns, id: Date.now(), results: 0, lastRun: new Date().toISOString().split("T")[0] }]); setNs({ name: "", criteria: "", alerts: true }); };

    const handleMlsSync = async () => {
        setSyncing(true);
        try {
            const keys = JSON.parse(localStorage.getItem('axiom_keys') || '{}');
            const p = keys.proxyUrl || 'https://ubdhpacoqmlxudcvhyuu.supabase.co/functions/v1';
            let headers = { "Content-Type": "application/json" };
            if (keys.anonKey) headers["Authorization"] = `Bearer ${keys.anonKey}`;
            
            const r = await fetch(`${p.replace(/\/+$/, '')}/comps-fetch`, {
                method: "POST", headers, body: JSON.stringify({ action: "sync_reso" })
            });
            const d = await r.json();
            if (d.error) throw new Error(d.error);
            setFeeds(feeds.map(f => f.type === "MLS" ? { ...f, status: "Connected", records: d.records_synced || 1250, lastSync: new Date().toLocaleString() } : f));
        } catch(e) {
            console.error("MLS Sync Error:", e);
            setFeeds(feeds.map(f => f.type === "MLS" ? { ...f, status: "Error" } : f));
        } finally {
            setSyncing(false);
        }
    };
    const listings = [
        { id: 1, address: "123 Oak Valley Rd", city: "Sacramento", price: 2800000, acres: 8.5, lots: "Est. 35", zoning: "R-1", source: "Zillow", daysOnMarket: 45, status: "Active" },
        { id: 2, address: "4500 Hillside Dr", city: "El Dorado Hills", price: 4200000, acres: 12.3, lots: "Est. 48", zoning: "PD", source: "Redfin", daysOnMarket: 12, status: "Active" },
        { id: 3, address: "890 Ranch Rd", city: "Folsom", price: 1950000, acres: 5.2, lots: "Est. 22", zoning: "R-2", source: "MLS", daysOnMarket: 78, status: "Price Reduced" },
        { id: 4, address: "2200 Valley View", city: "Roseville", price: 6100000, acres: 18.7, lots: "Est. 72", zoning: "R-1", source: "ATTOM", daysOnMarket: 30, status: "Active" },
        { id: 5, address: "777 Creek Crossing", city: "Lincoln", price: 3400000, acres: 10.1, lots: "Est. 40", zoning: "PD", source: "Zillow", daysOnMarket: 5, status: "New" },
    ];
    const LSC = { Active: C.green, "Price Reduced": C.amber, New: C.blue, Pending: C.purple, Sold: C.dim };

    return (
        <Tabs tabs={["Active Listings", "Saved Searches", "Data Feeds", "Property Alerts"]}>
            <div>
                <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
                    <input style={{ ...S.inp, flex: 1 }} placeholder="Search by address, city, APN, or keyword..." />
                    <select style={{ ...S.sel, width: 120 }}><option>All Sources</option><option>Zillow</option><option>Redfin</option><option>MLS</option><option>ATTOM</option></select>
                    <select style={{ ...S.sel, width: 120 }}><option>All Statuses</option><option>Active</option><option>New</option><option>Price Reduced</option><option>Pending</option></select>
                    <button style={S.btn("gold")}>Search</button>
                </div>
                <Card title="Matching Properties" action={<Badge label={listings.length + " Results"} color={C.blue} />}>
                    <table style={S.tbl}>
                        <thead><tr><th style={S.th}>Address</th><th style={S.th}>City</th><th style={S.th}>Price</th><th style={S.th}>Acres</th><th style={S.th}>Est. Lots</th><th style={S.th}>Zoning</th><th style={S.th}>Source</th><th style={S.th}>DOM</th><th style={S.th}>Status</th><th style={S.th}></th></tr></thead>
                        <tbody>{listings.map(l => (
                            <tr key={l.id}>
                                <td style={{ ...S.td, color: C.text, fontWeight: 600 }}>{l.address}</td>
                                <td style={{ ...S.td, fontSize: 12 }}>{l.city}</td>
                                <td style={{ ...S.td, color: C.gold }}>{fmt.usd(l.price)}</td>
                                <td style={S.td}>{l.acres} ac</td>
                                <td style={S.td}>{l.lots}</td>
                                <td style={S.td}><Badge label={l.zoning} color={C.blue} /></td>
                                <td style={S.td}><Badge label={l.source} color={TC2[l.source] || C.dim} /></td>
                                <td style={S.td}>{l.daysOnMarket}d</td>
                                <td style={S.td}><Badge label={l.status} color={LSC[l.status] || C.dim} /></td>
                                <td style={S.td}><button style={{ ...S.btn("gold"), padding: "3px 8px", fontSize: 9 }}>Import</button></td>
                            </tr>
                        ))}</tbody>
                    </table>
                </Card>
            </div>
            <div>
                <Card title="Saved Searches" action={<Badge label={searches.length + " Saved"} color={C.gold} />}>
                    {searches.map(s => (
                        <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: "1px solid #0F1117" }}>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: 13, color: C.text, fontWeight: 600 }}>{s.name}</div>
                                <div style={{ fontSize: 10, color: C.dim, marginTop: 2 }}>{s.criteria}</div>
                            </div>
                            <Badge label={s.results + " results"} color={C.blue} />
                            <span style={{ fontSize: 10, color: C.dim }}>{s.lastRun}</span>
                            <Badge label={s.alerts ? "Alerts On" : "Alerts Off"} color={s.alerts ? C.green : C.dim} />
                            <button style={{ ...S.btn(), padding: "3px 8px", fontSize: 9 }}>Run</button>
                            <button style={{ ...S.btn(), padding: "3px 8px", fontSize: 9 }} onClick={() => setSearches(searches.filter(x => x.id !== s.id))}>x</button>
                        </div>
                    ))}
                </Card>
            </div>
            <div>
                <Card title="Data Feeds & Integrations">
                    {feeds.map(f => (
                        <div key={f.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: `1px solid ${C.border}` }}>
                            <div style={{ flex: 1 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                    <span style={{ fontSize: 13, color: C.text, fontWeight: 600 }}>{f.name}</span>
                                    <Badge label={f.type} color={TC2[f.type]} />
                                </div>
                                <div style={{ fontSize: 10, color: C.dim, marginTop: 4 }}>{f.endpoint}</div>
                            </div>
                            <div style={{ textAlign: "right", marginRight: 16 }}>
                                <div style={{ fontSize: 11, color: C.text }}>{f.records.toLocaleString()} records</div>
                                <div style={{ fontSize: 9, color: C.dim }}>Last sync: {f.lastSync || "Never"}</div>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, width: 140 }}>
                                <Dot color={SC[f.status] || C.dim} />
                                <span style={{ fontSize: 11, color: C.text }}>{f.status}</span>
                            </div>
                            {f.type === "MLS" ? (
                                <button style={S.btn(syncing ? "dim" : "gold")} onClick={handleMlsSync} disabled={syncing}>
                                    {syncing ? "Syncing..." : "Sync Now"}
                                </button>
                            ) : (
                                <button style={S.btn()} onClick={() => toggle(f.id)}>
                                    {f.status === "Connected" ? "Disconnect" : "Connect"}
                                </button>
                            )}
                        </div>
                    ))}
                </Card>
            </div>
        </Tabs>
    );
}
