import { useState } from "react";
import { Card, KPI, Field, Badge, Button, AxiomTable } from "../../components/ui/components";
import { Tabs } from "../../components/ui/layout";
import { useProject } from "../../context/ProjectContext";
import { fmt } from "../../lib/utils";

const VENDOR_TYPES = ["General Contractor", "Architect", "Civil Engineer", "Structural Engineer", "MEP Engineer", "Landscape Architect", "Environmental", "Legal", "Broker"];

interface Vendor {
    id: number;
    name: string;
    type: string;
    status: string;
    contact: string;
    email: string;
    phone: string;
    insuranceExp: string;
    msaSigned: boolean;
    rating: number;
}

export function VendorNetwork() {
    const { vendors = [], setVendors } = useProject() as any;
    const [nv, setNv] = useState<Omit<Vendor, "id">>({ name: "", type: "General Contractor", status: "Active", contact: "", email: "", phone: "", insuranceExp: "", msaSigned: false, rating: 5 });
    const [filt, setFilt] = useState("All");

    const addVendor = () => {
        if (!nv.name) return;
        setVendors([...vendors, { ...nv, id: Date.now() }]);
        setNv({ name: "", type: "General Contractor", status: "Active", contact: "", email: "", phone: "", insuranceExp: "", msaSigned: false, rating: 5 });
    };

    const filtered = (vendors as Vendor[]).filter(v => filt === "All" || v.type === filt || v.status === filt);
    const totalActive = (vendors as Vendor[]).filter(v => v.status === "Active").length;
    const expiringCOIs = (vendors as Vendor[]).filter(v => new Date(v.insuranceExp) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)).length;
    const executedMSAs = (vendors as Vendor[]).filter(v => v.msaSigned).length;
    const avgRating = vendors.length > 0 ? ((vendors as Vendor[]).reduce((s, v) => s + v.rating, 0) / vendors.length).toFixed(1) : "N/A";

    return (
        <Tabs tabs={["Vendor Directory", "Compliance Tracking", "Bid Management"]}>
            {/* ─ Directory ─ */}
            <div className="axiom-stack-16">
                <div className="axiom-grid-4 axiom-mb-14">
                    <KPI label="Total Active Vendors" value={totalActive} />
                    <KPI label="Expiring COIs (30d)" value={expiringCOIs} color="var(--c-amber)" />
                    <KPI label="Executed MSAs" value={executedMSAs} color="var(--c-green)" />
                    <KPI label="Avg Vendor Rating" value={avgRating} />
                </div>
                <Card title="Vendor Directory" action={
                    <select className="axiom-select-field axiom-w-auto axiom-py-3 axiom-text-10" value={filt} onChange={e => setFilt(e.target.value)} title="Filter Vendors">
                        <option>All</option>{VENDOR_TYPES.map(t => <option key={t}>{t}</option>)}<option>Active</option><option>Inactive</option>
                    </select>
                }>
                    <AxiomTable headers={["Company", "Type", "Primary Contact", "MSA Signed", "COI Expiration", "Status", ""]}>
                        {filtered.map((v) => (
                            <tr key={v.id}>
                                <td className="axiom-td axiom-text-gold axiom-font-500">{v.name}</td>
                                <td className="axiom-td">{v.type}</td>
                                <td className="axiom-td">
                                    <div className="axiom-text-main">{v.contact}</div>
                                    <div className="axiom-text-10-dim">{v.email} · {v.phone}</div>
                                </td>
                                <td className="axiom-td"><Badge label={v.msaSigned ? "Executed" : "Pending"} color={v.msaSigned ? "var(--c-green)" : "var(--c-amber)"} /></td>
                                <td className="axiom-td"><span className={new Date(v.insuranceExp) < new Date() ? "axiom-text-red" : ""}>{v.insuranceExp || "N/A"}</span></td>
                                <td className="axiom-td"><Badge label={v.status} color={v.status === "Active" ? "var(--c-green)" : "var(--c-dim)"} /></td>
                                <td className="axiom-td">
                                    <Button label="×" onClick={() => setVendors(vendors.filter((x: any) => x.id !== v.id))} className="axiom-p2-7 axiom-text-9" title="Delete Vendor" />
                                </td>
                            </tr>
                        ))}
                    </AxiomTable>
                </Card>
                <Card title="Onboard New Vendor">
                    <div className="axiom-grid-4 axiom-mb-12">
                        <Field label="Company Name"><input className="axiom-input-field" value={nv.name} onChange={e => setNv({ ...nv, name: e.target.value })} placeholder="Vendor Name..." title="Company Name" /></Field>
                        <Field label="Type"><select className="axiom-select-field" value={nv.type} onChange={e => setNv({ ...nv, type: e.target.value })} title="Vendor Type">{VENDOR_TYPES.map(t => <option key={t}>{t}</option>)}</select></Field>
                        <Field label="Contact Name"><input className="axiom-input-field" value={nv.contact} onChange={e => setNv({ ...nv, contact: e.target.value })} title="Contact Name" /></Field>
                        <Field label="Email"><input className="axiom-input-field" type="email" value={nv.email} onChange={e => setNv({ ...nv, email: e.target.value })} title="Email" /></Field>
                        <Field label="Phone"><input className="axiom-input-field" type="tel" value={nv.phone} onChange={e => setNv({ ...nv, phone: e.target.value })} title="Phone" /></Field>
                        <Field label="COI Expiration"><input className="axiom-input-field" type="date" value={nv.insuranceExp} onChange={e => setNv({ ...nv, insuranceExp: e.target.value })} title="COI Expiration" /></Field>
                        <Field label="MSA Signed"><select className="axiom-select-field" value={nv.msaSigned ? "Yes" : "No"} onChange={e => setNv({ ...nv, msaSigned: e.target.value === "Yes" })} title="MSA Signed Status"><option>No</option><option>Yes</option></select></Field>
                        <Field label="Status"><select className="axiom-select-field" value={nv.status} onChange={e => setNv({ ...nv, status: e.target.value })} title="Vendor Status"><option>Active</option><option>Inactive</option><option>Do Not Use</option></select></Field>
                    </div>
                    <Button variant="gold" label="Save Vendor" onClick={addVendor} />
                </Card>
            </div>

            {/* ─ Compliance ─ */}
            <div>
                <Card title="Compliance Tracking">
                    <div className="axiom-text-dim axiom-p-40 axiom-text-center axiom-border-dashed axiom-radius-8">
                        <div className="axiom-text-32 axiom-text-amber axiom-mb-12 axiom-opacity-50">🛡️</div>
                        Drag and drop Certificates of Insurance (COIs) and Master Service Agreements here.<br /><br />
                        <span className="axiom-text-11">Axiom OS will autonomously parse the documents, update expiration dates, and notify you 30 days prior to lapse.</span>
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
            <AxiomTable headers={["Trade / Package", "Bidders Invited", "Bids Received", "Current Low Bid", "Status", ""]} className="axiom-mb-14">
                {bids.map(b => (
                    <tr key={b.id}>
                        <td className="axiom-td axiom-text-main">{b.trade}</td>
                        <td className="axiom-td">{b.invited}</td>
                        <td className="axiom-td">{b.received}</td>
                        <td className="axiom-td"><span className={b.lowBid > 0 ? "axiom-text-gold" : "axiom-text-dim"}>{b.lowBid > 0 ? fmt.usd(b.lowBid) : "--"}</span></td>
                        <td className="axiom-td">
                            <select className="axiom-select-field axiom-w-auto axiom-py-2 axiom-px-6 axiom-text-10" value={b.status} onChange={e => setBids(bids.map(x => x.id === b.id ? { ...x, status: e.target.value } : x))} title="Update RFP Status">
                                {["Bidding", "Leveling", "Awarded", "Cancelled"].map(s => <option key={s}>{s}</option>)}
                            </select>
                        </td>
                        <td className="axiom-td">
                            <Button label="×" onClick={() => setBids(bids.filter(x => x.id !== b.id))} className="axiom-p2-7 axiom-text-9" title="Delete RFP" />
                        </td>
                    </tr>
                ))}
            </AxiomTable>
            <div className="axiom-grid-5">
                <Field label="Trade Package"><input className="axiom-input-field" value={newBid.trade} onChange={e => setNewBid({ ...newBid, trade: e.target.value })} placeholder="e.g. Dry Utilities" title="Trade Package" /></Field>
                <Field label="Bidders Invited"><input className="axiom-input-field" type="number" value={newBid.invited} onChange={e => setNewBid({ ...newBid, invited: +e.target.value })} title="Bidders Invited" /></Field>
                <Field label="Bids Received"><input className="axiom-input-field" type="number" value={newBid.received} onChange={e => setNewBid({ ...newBid, received: +e.target.value })} title="Bids Received" /></Field>
                <Field label="Low Bid ($)"><input className="axiom-input-field" type="number" value={newBid.lowBid} onChange={e => setNewBid({ ...newBid, lowBid: +e.target.value })} title="Low Bid Amount" /></Field>
                <div className="axiom-flex-end">
                    <Button variant="gold" label="Add RFP" onClick={() => { if (newBid.trade) { setBids([...bids, { ...newBid, id: Date.now() }]); setNewBid({ trade: "", invited: 0, received: 0, lowBid: 0, status: "Bidding" }); } }} />
                </div>
            </div>
        </Card>
    );
}
