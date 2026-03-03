import { useState } from "react";
import { Card, KPI, Field, Badge, Button } from "../../components/ui/components";
import { Tabs } from "../../components/ui/layout";
import { useProject } from "../../context/ProjectContext";
import { fmt } from "../../lib/utils";

const VENDOR_TYPES = ["General Contractor", "Architect", "Civil Engineer", "Structural Engineer", "MEP Engineer", "Landscape Architect", "Environmental", "Legal", "Broker"];

export function VendorNetwork() {
    const { vendors = [], setVendors } = useProject() as any;
    const [nv, setNv] = useState({ name: "", type: "General Contractor", status: "Active", contact: "", email: "", phone: "", insuranceExp: "", msaSigned: false, rating: 5 });
    const [filt, setFilt] = useState("All");

    const addVendor = () => {
        if (!nv.name) return;
        setVendors([...vendors, { ...nv, id: Date.now() }]);
        setNv({ name: "", type: "General Contractor", status: "Active", contact: "", email: "", phone: "", insuranceExp: "", msaSigned: false, rating: 5 });
    };

    const filtered = vendors.filter((v: any) => filt === "All" || v.type === filt || v.status === filt);
    const totalActive = vendors.filter((v: any) => v.status === "Active").length;
    const expiringCOIs = vendors.filter((v: any) => new Date(v.insuranceExp) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)).length;
    const executedMSAs = vendors.filter((v: any) => v.msaSigned).length;
    const avgRating = vendors.length > 0 ? (vendors.reduce((s: number, v: any) => s + v.rating, 0) / vendors.length).toFixed(1) : "N/A";

    return (
        <Tabs tabs={["Vendor Directory", "Compliance Tracking", "Bid Management"]}>
            {/* ─ Directory ─ */}
            <div>
                <div className="axiom-grid-4" style={{ marginBottom: 14 }}>
                    <KPI label="Total Active Vendors" value={totalActive} />
                    <KPI label="Expiring COIs (30d)" value={expiringCOIs} color="var(--c-amber)" />
                    <KPI label="Executed MSAs" value={executedMSAs} color="var(--c-green)" />
                    <KPI label="Avg Vendor Rating" value={avgRating} />
                </div>
                <Card title="Vendor Directory" action={
                    <select className="axiom-select" style={{ width: "auto", padding: "3px 8px", fontSize: 10 }} value={filt} onChange={e => setFilt(e.target.value)}>
                        <option>All</option>{VENDOR_TYPES.map(t => <option key={t}>{t}</option>)}<option>Active</option><option>Inactive</option>
                    </select>
                }>
                    <table className="axiom-table">
                        <thead><tr>{["Company", "Type", "Primary Contact", "MSA Signed", "COI Expiration", "Status", ""].map(h => <th key={h} className="axiom-th">{h}</th>)}</tr></thead>
                        <tbody>
                            {filtered.map((v: any) => (
                                <tr key={v.id}>
                                    <td className="axiom-td" style={{ color: "var(--c-gold)", fontWeight: 500 }}>{v.name}</td>
                                    <td className="axiom-td">{v.type}</td>
                                    <td className="axiom-td">
                                        <div style={{ color: "var(--c-text)" }}>{v.contact}</div>
                                        <div className="axiom-text-10-dim">{v.email} · {v.phone}</div>
                                    </td>
                                    <td className="axiom-td"><Badge label={v.msaSigned ? "Executed" : "Pending"} color={v.msaSigned ? "var(--c-green)" : "var(--c-amber)"} /></td>
                                    <td className="axiom-td" style={{ color: new Date(v.insuranceExp) < new Date() ? "var(--c-red)" : "var(--c-text)" }}>{v.insuranceExp || "N/A"}</td>
                                    <td className="axiom-td"><Badge label={v.status} color={v.status === "Active" ? "var(--c-green)" : "var(--c-dim)"} /></td>
                                    <td className="axiom-td"><Button label="x" onClick={() => setVendors(vendors.filter((x: any) => x.id !== v.id))} style={{ padding: "2px 7px", fontSize: 9 }} /></td>
                                </tr>
                            ))}
                            {filtered.length === 0 && <tr><td colSpan={7} className="axiom-td" style={{ textAlign: "center", color: "var(--c-dim)" }}>No vendors found. Add one below.</td></tr>}
                        </tbody>
                    </table>
                </Card>
                <Card title="Onboard New Vendor">
                    <div className="axiom-grid-4" style={{ marginBottom: 12 }}>
                        <Field label="Company Name"><input className="axiom-input" value={nv.name} onChange={e => setNv({ ...nv, name: e.target.value })} placeholder="Vendor Name..." /></Field>
                        <Field label="Type"><select className="axiom-select" value={nv.type} onChange={e => setNv({ ...nv, type: e.target.value })}>{VENDOR_TYPES.map(t => <option key={t}>{t}</option>)}</select></Field>
                        <Field label="Contact Name"><input className="axiom-input" value={nv.contact} onChange={e => setNv({ ...nv, contact: e.target.value })} /></Field>
                        <Field label="Email"><input className="axiom-input" type="email" value={nv.email} onChange={e => setNv({ ...nv, email: e.target.value })} /></Field>
                        <Field label="Phone"><input className="axiom-input" type="tel" value={nv.phone} onChange={e => setNv({ ...nv, phone: e.target.value })} /></Field>
                        <Field label="COI Expiration"><input className="axiom-input" type="date" value={nv.insuranceExp} onChange={e => setNv({ ...nv, insuranceExp: e.target.value })} /></Field>
                        <Field label="MSA Signed"><select className="axiom-select" value={nv.msaSigned ? "Yes" : "No"} onChange={e => setNv({ ...nv, msaSigned: e.target.value === "Yes" })}><option>No</option><option>Yes</option></select></Field>
                        <Field label="Status"><select className="axiom-select" value={nv.status} onChange={e => setNv({ ...nv, status: e.target.value })}><option>Active</option><option>Inactive</option><option>Do Not Use</option></select></Field>
                    </div>
                    <Button variant="gold" label="Save Vendor" onClick={addVendor} />
                </Card>
            </div>

            {/* ─ Compliance ─ */}
            <div>
                <Card title="Compliance Tracking">
                    <div style={{ color: "var(--c-dim)", padding: 40, textAlign: "center", border: "1px dashed var(--c-border)", borderRadius: 8 }}>
                        <div style={{ fontSize: 32, color: "var(--c-amber)", marginBottom: 12, opacity: 0.5 }}>🛡️</div>
                        Drag and drop Certificates of Insurance (COIs) and Master Service Agreements here.<br /><br />
                        <span style={{ fontSize: 11 }}>Axiom OS will autonomously parse the documents, update expiration dates, and notify you 30 days prior to lapse.</span>
                    </div>
                </Card>
            </div>

            {/* ─ Bids ─ */}
            <div><BidPanel /></div>
        </Tabs>
    );
}

function BidPanel() {
    const [bids, setBids] = useState([
        { id: 1, trade: "Earthwork & Grading", invited: 4, received: 3, lowBid: 1240000, status: "Leveling" },
        { id: 2, trade: "Wet Utilities", invited: 3, received: 0, lowBid: 0, status: "Bidding" },
        { id: 3, trade: "Site Concrete", invited: 5, received: 5, lowBid: 485000, status: "Awarded" },
    ]);
    const [newBid, setNewBid] = useState({ trade: "", invited: 0, received: 0, lowBid: 0, status: "Bidding" });

    return (
        <Card title="Active RFPs & Bid Management">
            <table className="axiom-table" style={{ marginBottom: 14 }}>
                <thead><tr>{["Trade / Package", "Bidders Invited", "Bids Received", "Current Low Bid", "Status", ""].map(h => <th key={h} className="axiom-th">{h}</th>)}</tr></thead>
                <tbody>
                    {bids.map(b => (
                        <tr key={b.id}>
                            <td className="axiom-td" style={{ color: "var(--c-text)" }}>{b.trade}</td>
                            <td className="axiom-td">{b.invited}</td>
                            <td className="axiom-td">{b.received}</td>
                            <td className="axiom-td" style={{ color: b.lowBid > 0 ? "var(--c-gold)" : "var(--c-dim)" }}>{b.lowBid > 0 ? fmt.usd(b.lowBid) : "--"}</td>
                            <td className="axiom-td">
                                <select className="axiom-select" style={{ width: "auto", padding: "2px 6px", fontSize: 10 }} value={b.status} onChange={e => setBids(bids.map(x => x.id === b.id ? { ...x, status: e.target.value } : x))}>
                                    {["Bidding", "Leveling", "Awarded", "Cancelled"].map(s => <option key={s}>{s}</option>)}
                                </select>
                            </td>
                            <td className="axiom-td"><Button label="x" onClick={() => setBids(bids.filter(x => x.id !== b.id))} style={{ padding: "2px 7px", fontSize: 9 }} /></td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <div className="axiom-grid-5">
                <Field label="Trade Package"><input className="axiom-input" value={newBid.trade} onChange={e => setNewBid({ ...newBid, trade: e.target.value })} placeholder="e.g. Dry Utilities" /></Field>
                <Field label="Bidders Invited"><input className="axiom-input" type="number" value={newBid.invited} onChange={e => setNewBid({ ...newBid, invited: +e.target.value })} /></Field>
                <Field label="Bids Received"><input className="axiom-input" type="number" value={newBid.received} onChange={e => setNewBid({ ...newBid, received: +e.target.value })} /></Field>
                <Field label="Low Bid ($)"><input className="axiom-input" type="number" value={newBid.lowBid} onChange={e => setNewBid({ ...newBid, lowBid: +e.target.value })} /></Field>
                <div style={{ display: "flex", alignItems: "flex-end" }}>
                    <Button variant="gold" label="Add RFP" onClick={() => { if (newBid.trade) { setBids([...bids, { ...newBid, id: Date.now() }]); setNewBid({ trade: "", invited: 0, received: 0, lowBid: 0, status: "Bidding" }); } }} />
                </div>
            </div>
        </Card>
    );
}
