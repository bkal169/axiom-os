import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";
import { supa } from "../../lib/supabase";
import { useLS } from "../../hooks/useLS";
import { Card, Field, Badge, Button } from "../../components/ui/components";
import { Tabs, Dot } from "../../components/ui/layout";
import { downloadCSV } from "../../lib/utils";

const TYPES = ["Buyer", "Seller", "Broker", "Lender", "Attorney", "Contractor", "Architect", "Engineer", "Appraiser", "Inspector", "Title Officer", "Escrow", "Investor", "Other"];
const STATUSES = ["Active", "Inactive", "Prospect", "Lead", "Archived"];
const TYPE_MAP: any = { Buyer: "client", Seller: "client", Broker: "broker", Lender: "investor", Investor: "investor", Attorney: "vendor", Contractor: "vendor", Architect: "vendor", Engineer: "vendor", Appraiser: "vendor", Inspector: "vendor", "Title Officer": "vendor", Escrow: "vendor", Other: "lead" };
const STATUS_MAP: Record<string, string> = { Active: "active", Inactive: "inactive", Prospect: "prospect", Lead: "prospect", Archived: "inactive" };
const REV_TYPE_MAP: Record<string, string> = { investor: "Investor", client: "Buyer", vendor: "Contractor", lead: "Other", broker: "Broker" };
const REV_STATUS_MAP: Record<string, string> = { active: "Active", inactive: "Inactive", prospect: "Prospect" };

const TC: Record<string, string> = { Buyer: "var(--c-green)", Seller: "var(--c-blue)", Broker: "var(--c-gold)", Lender: "var(--c-purple)", Attorney: "var(--c-teal)", Contractor: "var(--c-amber)", Architect: "var(--c-blue)", Engineer: "var(--c-teal)", Appraiser: "var(--c-amber)", Inspector: "var(--c-dim)", Investor: "var(--c-green)", "Title Officer": "var(--c-gold)", Escrow: "var(--c-purple)", Other: "var(--c-dim)" };
const SC2: Record<string, string> = { Active: "var(--c-green)", Inactive: "var(--c-dim)", Prospect: "var(--c-blue)", Lead: "var(--c-amber)", Archived: "var(--c-muted)" };

export function Contacts() {
    const auth = useAuth();

    const [contacts, setContacts] = useLS<any[]>("axiom_contacts", []);
    const [search, setSearch] = useState("");
    const [filterType, setFilterType] = useState("All");
    const [filterStatus, setFilterStatus] = useState("All");
    const [drawer, setDrawer] = useState<any>(null);
    const [nc, setNc] = useState({ name: "", type: "Broker", company: "", email: "", phone: "", status: "Active", deals: [], notes: "", lastContact: "" });
    const [syncing, setSyncing] = useState(false);
    const loadedRef = useRef(false);
    const saveTimer = useRef<any>(null);

    useEffect(() => {
        if (loadedRef.current || !auth?.userProfile?.org_id || !supa.configured()) return;
        loadedRef.current = true;
        (async () => {
            try {
                const rows = await supa.select("contacts", `organization_id=eq.${auth.userProfile.org_id}&order=updated_at.desc`);
                if (rows && rows.length > 0) {
                    const mapped = rows.map((r: any) => ({
                        id: r.id,
                        name: [r.first_name, r.last_name].filter(Boolean).join(" ") || "Unknown",
                        type: REV_TYPE_MAP[r.type] || r.type || "Other",
                        company: r.company || "",
                        email: r.email || "",
                        phone: r.phone || "",
                        status: REV_STATUS_MAP[r.status] || r.status || "Active",
                        deals: r.tags || [],
                        notes: r.notes || "",
                        lastContact: r.updated_at?.split("T")[0] || "",
                        _supaId: r.id,
                    }));
                    setContacts(mapped);
                }
            } catch (e) { console.warn("Failed to load contacts:", e); }
        })();
    }, [auth?.userProfile?.org_id, setContacts]);

    const syncContact = useCallback((contact: any, isDelete = false) => {
        if (!auth?.userProfile?.org_id || !supa.configured()) return;
        clearTimeout(saveTimer.current);
        saveTimer.current = setTimeout(async () => {
            setSyncing(true);
            try {
                if (isDelete) {
                    if (contact._supaId) await supa.del("contacts", { id: contact._supaId });
                } else {
                    const nameParts = (contact.name || "").split(" ");
                    const payload: any = {
                        organization_id: auth.userProfile.org_id,
                        first_name: nameParts[0] || "",
                        last_name: nameParts.slice(1).join(" ") || "",
                        email: contact.email || null,
                        phone: contact.phone || null,
                        company: contact.company || null,
                        type: TYPE_MAP[contact.type] || "lead",
                        status: STATUS_MAP[contact.status] || "active",
                        notes: contact.notes || null,
                        tags: contact.deals || [],
                        updated_at: new Date().toISOString(),
                    };
                    if (contact._supaId) payload.id = contact._supaId;
                    await supa.upsert("contacts", payload);
                }
            } catch (e) { console.warn("Failed to sync contact:", e); }
            setSyncing(false);
        }, 800);
    }, [auth?.userProfile?.org_id]);

    const filtered = contacts.filter(c => {
        if (search && !c.name.toLowerCase().includes(search.toLowerCase()) && !(c.company || "").toLowerCase().includes(search.toLowerCase())) return false;
        if (filterType !== "All" && c.type !== filterType) return false;
        if (filterStatus !== "All" && c.status !== filterStatus) return false;
        return true;
    });

    const addContact = () => {
        if (!nc.name) return;
        const newContact = { ...nc, id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(), lastContact: new Date().toISOString().split("T")[0] };
        setContacts([...contacts, newContact]);
        syncContact(newContact);
        setNc({ name: "", type: "Broker", company: "", email: "", phone: "", status: "Active", deals: [], notes: "", lastContact: "" });
    };

    const delContact = (id: string) => {
        const contact = contacts.find(c => c.id === id);
        setContacts(contacts.filter(c => c.id !== id));
        if (contact) syncContact(contact, true);
    };

    const updContact = (id: string, field: string, val: any) => {
        setContacts(contacts.map(c => {
            if (c.id === id) {
                const updated = { ...c, [field]: val };
                syncContact(updated);
                return updated;
            }
            return c;
        }));
    };

    return (
        <Tabs tabs={["Directory", "Add Contact", "Import/Export"]}>
            {/* ─── DIRECTORY ───────────────────────────────── */}
            <div>
                <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
                    <input className="axiom-input" style={{ flex: 1 }} value={search} onChange={e => setSearch(e.target.value)} placeholder="Search contacts by name or company..." title="Search Contacts" />
                    <select className="axiom-select" style={{ width: 140 }} value={filterType} onChange={e => setFilterType(e.target.value)} title="Filter by Type"><option>All</option>{TYPES.map(t => <option key={t}>{t}</option>)}</select>
                    <select className="axiom-select" style={{ width: 120 }} value={filterStatus} onChange={e => setFilterStatus(e.target.value)} title="Filter by Status"><option>All</option>{STATUSES.map(s => <option key={s}>{s}</option>)}</select>
                </div>
                <Card title={`Contact Directory (${filtered.length})`} action={<div style={{ display: "flex", gap: 8, alignItems: "center" }}>{syncing && <span style={{ fontSize: 9, color: "var(--c-gold)" }}>syncing...</span>}<Badge label={contacts.filter(c => c.status === "Active").length + " Active"} color="var(--c-green)" /></div>}>
                    <table className="axiom-table">
                        <thead>
                            <tr>
                                {["Name", "Type", "Company", "Email", "Phone", "Deals", "Status", "Last", ""].map(th => <th key={th} className="axiom-th">{th}</th>)}
                            </tr>
                        </thead>
                        <tbody>{filtered.map(c => (
                            <tr key={c.id} onClick={() => setDrawer(c)} className="premium-hover">
                                <td className="axiom-td" style={{ color: "var(--c-text)", fontWeight: 600 }}>{c.name}</td>
                                <td className="axiom-td"><Badge label={c.type} color={TC[c.type] || "var(--c-dim)"} /></td>
                                <td className="axiom-td" style={{ fontSize: 12 }}>{c.company}</td>
                                <td className="axiom-td" style={{ fontSize: 12, color: "var(--c-blue)" }}>{c.email}</td>
                                <td className="axiom-td" style={{ fontSize: 12 }}>{c.phone}</td>
                                <td className="axiom-td">{c.deals?.length || 0}</td>
                                <td className="axiom-td"><Dot color={SC2[c.status] || "var(--c-dim)"} /><span style={{ fontSize: 12 }}>{c.status}</span></td>
                                <td className="axiom-td" style={{ fontSize: 10, color: "var(--c-dim)" }}>{c.lastContact}</td>
                                <td className="axiom-td"><Button onClick={(e: any) => { e?.stopPropagation(); delContact(c.id); }}>x</Button></td>
                            </tr>
                        ))}</tbody>
                    </table>
                </Card>
                {drawer && (
                    <Card title={`Edit: ${drawer.name}`} action={<Button onClick={() => setDrawer(null)}>Close</Button>}>
                        <div className="axiom-grid-3">
                            <Field label="Name"><input className="axiom-input" value={drawer.name} onChange={e => updContact(drawer.id, "name", e.target.value)} title="Name" /></Field>
                            <Field label="Type"><select className="axiom-select" value={drawer.type} onChange={e => updContact(drawer.id, "type", e.target.value)} title="Type">{TYPES.map(t => <option key={t}>{t}</option>)}</select></Field>
                            <Field label="Company"><input className="axiom-input" value={drawer.company} onChange={e => updContact(drawer.id, "company", e.target.value)} title="Company" /></Field>
                            <Field label="Email"><input className="axiom-input" value={drawer.email} onChange={e => updContact(drawer.id, "email", e.target.value)} title="Email" /></Field>
                            <Field label="Phone"><input className="axiom-input" value={drawer.phone} onChange={e => updContact(drawer.id, "phone", e.target.value)} title="Phone" /></Field>
                            <Field label="Status"><select className="axiom-select" value={drawer.status} onChange={e => updContact(drawer.id, "status", e.target.value)} title="Status">{STATUSES.map(s => <option key={s}>{s}</option>)}</select></Field>
                        </div>
                        <Field label="Notes" style={{ marginTop: 14 }}><textarea className="axiom-input" style={{ height: 60 }} value={drawer.notes} onChange={e => updContact(drawer.id, "notes", e.target.value)} title="Notes" /></Field>
                    </Card>
                )}
            </div>

            {/* ─── ADD NEW ───────────────────────────────── */}
            <div>
                <Card title="Add New Contact">
                    <div className="axiom-grid-3">
                        <Field label="Full Name"><input className="axiom-input" value={nc.name} onChange={e => setNc({ ...nc, name: e.target.value })} placeholder="Jane Doe" title="Full Name" /></Field>
                        <Field label="Type"><select className="axiom-select" value={nc.type} onChange={e => setNc({ ...nc, type: e.target.value })} title="Type">{TYPES.map(t => <option key={t}>{t}</option>)}</select></Field>
                        <Field label="Company"><input className="axiom-input" value={nc.company} onChange={e => setNc({ ...nc, company: e.target.value })} title="Company" /></Field>
                        <Field label="Email"><input className="axiom-input" value={nc.email} onChange={e => setNc({ ...nc, email: e.target.value })} placeholder="email@example.com" title="Email" /></Field>
                        <Field label="Phone"><input className="axiom-input" value={nc.phone} onChange={e => setNc({ ...nc, phone: e.target.value })} placeholder="(555) 000-0000" title="Phone" /></Field>
                        <Field label="Status"><select className="axiom-select" value={nc.status} onChange={e => setNc({ ...nc, status: e.target.value })} title="Status">{STATUSES.map(s => <option key={s}>{s}</option>)}</select></Field>
                    </div>
                    <Field label="Notes" style={{ marginTop: 14 }}><textarea className="axiom-input" style={{ height: 60 }} value={nc.notes} onChange={e => setNc({ ...nc, notes: e.target.value })} placeholder="Background, relationship, specialties..." title="Notes" /></Field>
                    <div style={{ marginTop: 14 }}>
                        <Button variant="gold" onClick={addContact} label="Add Contact" />
                    </div>
                </Card>
            </div>

            {/* ─── EXPORT ───────────────────────────────── */}
            <div>
                <Card title="Import / Export Contacts">
                    <div style={{ display: "flex", gap: "20px" }}>
                        <div style={{ flex: 1 }}>
                            {[["Export All Contacts (CSV)", "Download all contacts as spreadsheet"], ["Export Active Only", "Active contacts with deal links"]].map(([l, d], i) => (
                                <div key={i} className="axiom-checkbox-item">
                                    <div style={{ flex: 1 }}><div style={{ fontSize: 13, color: "var(--c-text)" }}>{l}</div><div className="axiom-kpi-sub">{d}</div></div>
                                    <Button label="Export" onClick={() => {
                                        const headers = ["ID", "Name", "Type", "Company", "Email", "Phone", "Status", "Deals", "Notes", "Last Contact"];
                                        let rows = contacts;
                                        if (l.includes("Active Only")) rows = rows.filter(c => c.status === "Active");
                                        downloadCSV(headers, rows.map(c => [c.id, c.name, c.type, c.company, c.email, c.phone, c.status, (c.deals || []).join("; "), c.notes, c.lastContact]), "axiom_contacts.csv");
                                    }} />
                                </div>
                            ))}
                        </div>
                    </div>
                </Card>
            </div>
        </Tabs>
    );
}
