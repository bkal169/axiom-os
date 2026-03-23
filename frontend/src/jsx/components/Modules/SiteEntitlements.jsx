import React, { useState } from 'react';
import { C, S } from '../../constants';
import { useLS } from '../../utils';
import { Tabs } from '../UI/Tabs';
import { Card } from '../UI/Card';
import { Badge } from '../UI/Badge';
import { Field } from '../UI/Field';
import { Agent } from '../UI/Agent';

export default function SiteEntitlements() {
    const [site, setSite] = useLS("axiom_site", { address: "", apn: "", grossAcres: "", netAcres: "", jurisdiction: "", county: "", state: "", generalPlan: "", existingUse: "", proposedUse: "SFR Subdivision", shape: "Rectangular", frontage: "", access: "", legalDesc: "", floodZone: "" });
    const [zon, setZon] = useLS("axiom_zoning", { zone: "", overlay: "", du_ac: "", maxHeight: "", minLotSize: "", minLotWidth: "", minLotDepth: "", frontSetback: "", rearSetback: "", sideSetback: "", maxLot: "", parkingRatio: "", entitlementType: "Tentative Map", entitlementStatus: "Not Started", notes: "" });
    const [sur, setSur] = useLS("axiom_survey", { altaOrdered: "No", altaDate: "", surveyorName: "", easements: "", encroachments: "", soilType: "", percRate: "", slopeMax: "", cutFill: "", expansiveSoil: "No", liquefaction: "No" });
    const [altaA, setAltaA] = useLS("axiom_alta", ["1-Monuments", "2-Address", "3-Flood Zone", "4-Topography", "5-Utilities", "6-Parking", "7-Setbacks", "8-Substantial Features", "11a-Utilities", "13-Adjoiner Names", "16-Wetlands", "17-Gov't Agency", "18-Offsite Easements", "20a-Zoning Label"].map(i => ({ item: i, checked: false })));

    const [femaBusy, setFemaBusy] = useState(false);
    const [femaMsg, setFemaMsg] = useState("");

    const fetchFEMA = async () => {
        if (!site.address) { setFemaMsg("Enter an address first"); return; }
        setFemaBusy(true); setFemaMsg("Querying FEMA NFHL API...");
        try {
            const keys = JSON.parse(localStorage.getItem('axiom_keys') || '{}');
            const p = keys.proxyUrl || 'https://ubdhpacoqmlxudcvhyuu.supabase.co/functions/v1';
            let headers = { "Content-Type": "application/json" };
            if (keys.anonKey) headers["Authorization"] = `Bearer ${keys.anonKey}`;
            
            const r = await fetch(`${p.replace(/\/+$/, '')}/fema-lookup`, {
                method: "POST", headers, body: JSON.stringify({ address: site.address })
            });
            const d = await r.json();
            if (d.error) throw new Error(d.error);
            const z = d.floodZone || "X";
            
            setSite(s => ({ ...s, floodZone: z,
                jurisdiction: d.county || s.jurisdiction,
                county: d.county || s.county,
                state: d.state || s.state
            }));
            
            let risk = "Low";
            if(z.startsWith('A') || z.startsWith('V')) risk = "High";
            else if(z === 'B' || z.includes('500')) risk = "Moderate";
            
            setZon(zState => ({ ...zState, overlay: `Flood Zone ${z} (${risk} Risk) ${zState.overlay ? '| '+zState.overlay : ''}` }));
            setFemaMsg("✓ FEMA Data Linked");
            setTimeout(() => setFemaMsg(""), 3000);
        } catch(e) {
            setFemaMsg(`Error: ${e.message}`);
        } finally {
            setFemaBusy(false);
        }
    };

    const su = k => e => setSite({ ...site, [k]: e.target.value });
    const zu = k => e => setZon({ ...zon, [k]: e.target.value });
    const ru = k => e => setSur({ ...sur, [k]: e.target.value });

    const constraints = [
        { name: "Easements", status: "Review", note: "Verify utility & access easements on ALTA" },
        { name: "Setbacks", status: "Confirm", note: "Front/rear/side per zoning code" },
        { name: "Open Space Req.", status: "Required", note: "15% minimum per local ordinance" },
        { name: "Tree Preservation", status: "Survey Needed", note: "Heritage trees require certified arborist" },
        { name: "Slope > 25%", status: "Analyze", note: "Areas exceeding 25% slope non-developable" },
        { name: "Flight Path / FAA", status: "Clear", note: "Outside airport influence area" },
        { name: "HOA / CC&Rs", status: "Pending", note: "Request from seller / title company" },
    ];
    const csc = { Review: C.gold, Confirm: C.blue, Required: C.red, "Survey Needed": C.purple, Clear: C.green, Pending: C.gold, Analyze: C.amber, "N/A": C.dim };
    const etl = [
        { phase: "Pre-Application Meeting", wks: "2-4" }, { phase: "Application Submittal", wks: "1" },
        { phase: "CEQA / Environmental Review", wks: "12-26" }, { phase: "Staff Report", wks: "4-8" },
        { phase: "Planning Commission Hearing", wks: "2-4" }, { phase: "City Council (if req.)", wks: "4-8" },
        { phase: "Conditions of Approval", wks: "2-4" }, { phase: "Final Map Recording", wks: "8-16" },
    ];

    return (
        <Tabs tabs={["Site ID", "Zoning & Entitlements", "Survey & ALTA", "Constraints", "Design Import"]}>
            <div>
                <Card title="Property Identification">
                    <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            {femaMsg && <span style={{ fontSize: 10, color: femaBusy ? C.gold : C.green }}>{femaMsg}</span>}
                            <button style={S.btn(femaBusy ? "dim" : "gold")} onClick={fetchFEMA} disabled={femaBusy}>
                                {femaBusy ? "Lookup..." : "🌎 FEMA Auto-Lookup"}
                            </button>
                        </div>
                    </div>
                    <div style={S.g3}>
                        {[["Site Address", "address", "123 Main St"], ["APN / Parcel Number", "apn", "000-000-000"], ["Gross Acres", "grossAcres", ""], ["Net Developable Acres", "netAcres", ""], ["Jurisdiction", "jurisdiction", "City of..."], ["County", "county", ""], ["State", "state", "CA"], ["General Plan", "generalPlan", "Low Density Residential"], ["Existing Use", "existingUse", "Vacant Land"], ["Proposed Use", "proposedUse", ""], ["Street Frontage (ft)", "frontage", ""], ["Site Access", "access", ""], ["FEMA Flood Zone", "floodZone", "X"]].map(([l, k, ph]) => (
                            <Field key={k} label={l}><input style={S.inp} value={site[k] || ""} onChange={su(k)} placeholder={ph || ""} /></Field>
                        ))}
                        <Field label="Parcel Shape"><select style={S.sel} value={site.shape} onChange={su("shape")}>{["Rectangular", "Irregular", "Flag Lot", "Triangular", "L-Shaped", "Corner Lot", "Other"].map(o => <option key={o}>{o}</option>)}</select></Field>
                    </div>
                    <Field label="Legal Description"><textarea style={{ ...S.ta, height: 50 }} value={site.legalDesc || ""} onChange={su("legalDesc")} placeholder="Lot X, Tract XXXXX per Map recorded in Book XX, Page XX..." /></Field>
                </Card>
                <Card title="Site Analysis · AI Agent">
                    <Agent id="SiteAnalysis" system="You are a land development consultant specializing in site analysis for residential subdivisions. Analyze sites for development potential, physical constraints, access, shape efficiency, infrastructure proximity, and highest & best use." placeholder="Describe the site for development potential analysis..." />
                </Card>
            </div>
            <div>
                <Card title="Zoning Development Standards">
                    <div style={S.g3}>
                        {[["Zone Designation", "zone", "R-1, R-2, PD..."], ["Overlay District", "overlay", "Flood, Scenic..."], ["Max Density (DU/AC)", "du_ac", ""], ["Max Height (ft)", "maxHeight", ""], ["Min Lot Size (SF)", "minLotSize", ""], ["Min Lot Width (ft)", "minLotWidth", ""], ["Min Lot Depth (ft)", "minLotDepth", ""], ["Front Setback (ft)", "frontSetback", ""], ["Rear Setback (ft)", "rearSetback", ""], ["Side Setback (ft)", "sideSetback", ""], ["Max Lot Coverage %", "maxLot", ""], ["Parking Ratio", "parkingRatio", "2.0 spaces/unit"]].map(([l, k, ph]) => (
                            <Field key={k} label={l}><input style={S.inp} value={zon[k] || ""} onChange={zu(k)} placeholder={ph || ""} /></Field>
                        ))}
                    </div>
                </Card>
                <Card title="Entitlement Pathway">
                    <div style={S.g2}>
                        <Field label="Entitlement Type"><select style={S.sel} value={zon.entitlementType} onChange={zu("entitlementType")}>{["Tentative Map", "Final Map", "Parcel Map", "Specific Plan", "PUD", "CUP", "Variance", "Zone Change", "General Plan Amendment", "Development Agreement"].map(o => <option key={o}>{o}</option>)}</select></Field>
                        <Field label="Current Status"><select style={S.sel} value={zon.entitlementStatus} onChange={zu("entitlementStatus")}>{["Not Started", "Pre-App Submitted", "Application Filed", "Under Review", "CEQA in Progress", "Hearing Scheduled", "Approved", "Appealed", "Final Map Recorded"].map(o => <option key={o}>{o}</option>)}</select></Field>
                    </div>
                    <Field label="Notes / Conditions"><textarea style={{ ...S.ta, height: 50 }} value={zon.notes || ""} onChange={zu("notes")} placeholder="Conditions of approval, special requirements..." /></Field>
                    <div style={{ marginTop: 14, borderTop: `1px solid ${C.border}`, paddingTop: 14 }}>
                        <div style={{ fontSize: 9, color: C.gold, letterSpacing: 2, marginBottom: 10, textTransform: "uppercase" }}>Entitlement Timeline</div>
                        {etl.map((t, i) => (
                            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "5px 0", borderBottom: "1px solid #0F1117" }}>
                                <div style={{ width: 18, height: 18, borderRadius: "50%", border: `1px solid ${C.gold}44`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, color: C.dim, flexShrink: 0 }}>{i + 1}</div>
                                <span style={{ flex: 1, fontSize: 12 }}>{t.phase}</span>
                                <span style={{ fontSize: 10, color: C.gold }}>{t.wks} wks</span>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>
            <div>
                <Card title="ALTA / NSPS Survey Decoder">
                    <div style={S.g3}>
                        <Field label="Survey Ordered?"><select style={S.sel} value={sur.altaOrdered} onChange={ru("altaOrdered")}><option>No</option><option>Ordered - Pending</option><option>Yes - Received</option></select></Field>
                        <Field label="Date Received"><input style={S.inp} type="date" value={sur.altaDate || ""} onChange={ru("altaDate")} /></Field>
                        <Field label="Surveyor / Firm"><input style={S.inp} value={sur.surveyorName || ""} onChange={ru("surveyorName")} /></Field>
                    </div>
                    <div style={{ fontSize: 9, color: C.gold, letterSpacing: 2, textTransform: "uppercase", margin: "12px 0 8px" }}>Table A Optional Items</div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 }}>
                        {altaA.map((item, i) => (
                            <div key={i} style={{ display: "flex", alignItems: "center", gap: 7, padding: "5px 8px", background: C.bg, borderRadius: 3, cursor: "pointer" }} onClick={() => { const d = [...altaA]; d[i] = { ...d[i], checked: !d[i].checked }; setAltaA(d); }}>
                                <input type="checkbox" checked={item.checked} readOnly style={{ accentColor: C.gold }} />
                                <span style={{ fontSize: 10, color: item.checked ? C.gold : C.dim }}>{item.item}</span>
                            </div>
                        ))}
                    </div>
                    <div style={{ marginTop: 12 }}>
                        <Field label="Easements Identified"><textarea style={{ ...S.ta, height: 55 }} value={sur.easements || ""} onChange={ru("easements")} placeholder="List easements by type, width, beneficiary..." /></Field>
                        <Field label="Encroachments / Issues"><textarea style={{ ...S.ta, height: 55 }} value={sur.encroachments || ""} onChange={ru("encroachments")} placeholder="Encroachments, gaps, overlaps, boundary disputes..." /></Field>
                    </div>
                </Card>
                <Card title="Soils & Topography">
                    <div style={S.g3}>
                        {[["Soil Classification", "soilType", "Sandy loam, clay..."], ["Perc Rate (min/inch)", "percRate", ""], ["Max Slope %", "slopeMax", ""], ["Est. Cut/Fill (CY)", "cutFill", ""]].map(([l, k, ph]) => (
                            <Field key={k} label={l}><input style={S.inp} value={sur[k] || ""} onChange={ru(k)} placeholder={ph} /></Field>
                        ))}
                        <Field label="Expansive Soil?"><select style={S.sel} value={sur.expansiveSoil} onChange={ru("expansiveSoil")}><option>No</option><option>Yes - Geotech Required</option><option>Unknown - Testing Needed</option></select></Field>
                        <Field label="Liquefaction Zone?"><select style={S.sel} value={sur.liquefaction} onChange={ru("liquefaction")}><option>No</option><option>Yes</option><option>Review State Maps</option></select></Field>
                    </div>
                </Card>
            </div>
            <div>
                <Card title="Constraints Matrix">
                    <table style={S.tbl}>
                        <thead><tr><th style={S.th}>Constraint</th><th style={S.th}>Status</th><th style={S.th}>Notes</th></tr></thead>
                        <tbody>{constraints.map((c, i) => (
                            <tr key={i}>
                                <td style={{ ...S.td, color: C.text, fontWeight: 500 }}>{c.name}</td>
                                <td style={S.td}><Badge label={c.status} color={csc[c.status] || C.dim} /></td>
                                <td style={{ ...S.td, color: C.dim, fontSize: 12 }}>{c.note}</td>
                            </tr>
                        ))}</tbody>
                    </table>
                </Card>
            </div>
            <div>
                <Card title="Design File Import">
                    <div style={{ border: `2px dashed ${C.border2}`, borderRadius: 4, padding: 36, textAlign: "center", color: C.dim }}>
                        <div style={{ fontSize: 37, marginBottom: 10, color: C.gold }}>+</div>
                        <div style={{ fontSize: 14, color: C.sub, marginBottom: 6 }}>Drop SketchUp files, CAD exports, site plans, or design PDFs</div>
                        <div style={{ fontSize: 10, color: C.dim, marginBottom: 16 }}>Supports: .skp · .dwg · .dxf · .pdf · .png · .jpg · .geojson</div>
                        <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
                            <button style={S.btn("gold")}>Browse Files</button>
                            <button style={S.btn()}>Connect SketchUp MCP</button>
                            <button style={S.btn()}>Import from URL</button>
                        </div>
                    </div>
                </Card>
            </div>
        </Tabs>
    );
}
