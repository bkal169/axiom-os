import { useState } from "react";
import { Card, KPI, Field, Badge, Button } from "../../components/ui/components";
import { Tabs } from "../../components/ui/layout";
import { useLS } from "../../hooks/useLS";
import { fmt } from "../../lib/utils";

const CATS = ["Land", "Acquisition", "Hard Costs", "Soft Costs", "Fees", "Legal", "Other"];
const STATUSES = ["New", "Approved", "Paid", "Pending", "Rejected"];

export function Invoices() {
    const [invoices, setInvoices] = useLS("axiom_invoices", [
        { id: 1, vendor: "Thompson Civil Engineering", amount: 12500, date: "2025-02-15", status: "Paid", category: "Soft Costs", deal: "Sunset Ridge" },
        { id: 2, vendor: "Pacific Realty Group", amount: 45000, date: "2025-02-10", status: "Pending", category: "Acquisition", deal: "Sunset Ridge" },
        { id: 3, vendor: "City of Sacramento", amount: 8500, date: "2025-02-18", status: "Approved", category: "Fees", deal: "Hawk Valley" },
        { id: 4, vendor: "A+ Grading Services", amount: 28000, date: "2025-02-22", status: "New", category: "Hard Costs", deal: "Sunset Ridge" },
    ] as any[]);

    const [showAdd, setShowAdd] = useState(false);
    const [ni, setNi] = useState({ vendor: "", amount: "", date: new Date().toISOString().split("T")[0], status: "New", category: "Soft Costs", deal: "" });

    const addInvoice = () => {
        if (!ni.vendor || !ni.amount) return;
        const newInv = { ...ni, id: Date.now(), amount: parseFloat(ni.amount) || 0 };
        setInvoices([...(invoices as any[]), newInv]);
        setNi({ vendor: "", amount: "", date: new Date().toISOString().split("T")[0], status: "New", category: "Soft Costs", deal: "" });
        setShowAdd(false);
    };

    const totalInvoiced = (invoices as any[]).reduce((a: number, b: any) => a + b.amount, 0);
    const totalPaid = (invoices as any[]).filter((i: any) => i.status === "Paid").reduce((a: number, b: any) => a + b.amount, 0);
    const totalPending = (invoices as any[]).filter((i: any) => i.status !== "Paid").reduce((a: number, b: any) => a + b.amount, 0);

    return (
        <Tabs tabs={["Invoices", "Draw Requests", "Approval Workflow"]}>
            {/* ─ Invoices ─ */}
            <div>
                <div className="axiom-grid-3" style={{ marginBottom: 14 }}>
                    <KPI label="Total Invoiced" value={fmt.usd(totalInvoiced)} color="var(--c-text)" />
                    <KPI label="Paid" value={fmt.usd(totalPaid)} color="var(--c-green)" />
                    <KPI label="Pending" value={fmt.usd(totalPending)} color="var(--c-amber)" />
                </div>
                {showAdd && (
                    <Card title="Add Invoice">
                        <div className="axiom-grid-3" style={{ marginBottom: 12 }}>
                            <Field label="Vendor"><input className="axiom-input" value={ni.vendor} onChange={e => setNi({ ...ni, vendor: e.target.value })} placeholder="Vendor name" /></Field>
                            <Field label="Amount ($)"><input className="axiom-input" type="number" value={ni.amount} onChange={e => setNi({ ...ni, amount: e.target.value })} placeholder="0.00" /></Field>
                            <Field label="Date"><input className="axiom-input" type="date" value={ni.date} onChange={e => setNi({ ...ni, date: e.target.value })} /></Field>
                            <Field label="Category"><select className="axiom-select" value={ni.category} onChange={e => setNi({ ...ni, category: e.target.value })}>{CATS.map(c => <option key={c}>{c}</option>)}</select></Field>
                            <Field label="Status"><select className="axiom-select" value={ni.status} onChange={e => setNi({ ...ni, status: e.target.value })}>{STATUSES.map(s => <option key={s}>{s}</option>)}</select></Field>
                            <Field label="Deal / Project"><input className="axiom-input" value={ni.deal} onChange={e => setNi({ ...ni, deal: e.target.value })} placeholder="Deal name" /></Field>
                        </div>
                        <div className="axiom-flex-row" style={{ gap: 8 }}>
                            <Button variant="gold" label="Save Invoice" onClick={addInvoice} />
                            <Button label="Cancel" onClick={() => setShowAdd(false)} />
                        </div>
                    </Card>
                )}
                <Card title="Invoice Management" action={<Button variant="gold" label="+ Ingest Invoice" onClick={() => setShowAdd(v => !v)} />}>
                    <table className="axiom-table">
                        <thead><tr>{["Vendor", "Category", "Amount", "Date", "Status", "Deal"].map(h => <th key={h} className="axiom-th">{h}</th>)}</tr></thead>
                        <tbody>
                            {(invoices as any[]).map((i: any) => (
                                <tr key={i.id}>
                                    <td className="axiom-td" style={{ fontWeight: 600 }}>{i.vendor}</td>
                                    <td className="axiom-td"><Badge label={i.category} color="var(--c-blue)" /></td>
                                    <td className="axiom-td" style={{ color: "var(--c-gold)" }}>{fmt.usd(i.amount)}</td>
                                    <td className="axiom-td">{i.date}</td>
                                    <td className="axiom-td">
                                        <span style={{ display: "inline-block", width: 7, height: 7, borderRadius: "50%", background: i.status === "Paid" ? "var(--c-green)" : "var(--c-amber)", marginRight: 6 }} />
                                        {i.status}
                                    </td>
                                    <td className="axiom-td">{i.deal}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </Card>
            </div>

            {/* ─ Draw Requests ─ */}
            <div>
                <Card title="Digital Draw Requests">
                    <div className="axiom-text-12-dim" style={{ marginBottom: 16 }}>Automated AIA G702/G703 style draw documentation for bank submission.</div>
                    {[["Draw #04 - Feb 2025", "$145,200", "Pending"], ["Draw #03 - Jan 2025", "$212,000", "Paid"], ["Draw #02 - Dec 2024", "$88,500", "Paid"]].map(([n, v, s], i) => (
                        <div key={i} className="axiom-flex-between" style={{ padding: "12px 0", borderBottom: "1px solid var(--c-border)" }}>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: 13, color: "var(--c-text)" }}>{n}</div>
                                <div className="axiom-text-10-dim">Submission Package: All Invoices + Lien Waivers</div>
                            </div>
                            <div style={{ fontSize: 14, color: "var(--c-gold)", fontWeight: 700, margin: "0 12px" }}>{v}</div>
                            <Badge label={s} color={s === "Paid" ? "var(--c-green)" : "var(--c-amber)"} />
                            <Button label="Review" onClick={() => { }} style={{ marginLeft: 8 }} />
                        </div>
                    ))}
                </Card>
            </div>

            {/* ─ Approval Workflow ─ */}
            <div>
                <Card title="Payment Approval Flow">
                    <div className="axiom-text-12-dim" style={{ marginBottom: 12 }}>Multi-stage approval for construction disbursements.</div>
                    <div className="axiom-flex-between" style={{ padding: 14, background: "var(--c-bg2)", borderRadius: 4 }}>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 13, color: "var(--c-gold)", fontWeight: 700 }}>A+ Grading Services - $28,000</div>
                            <div className="axiom-text-10-dim">Invoice #INV-9284 · Sunset Ridge</div>
                        </div>
                        <div className="axiom-flex-row" style={{ gap: 6 }}>
                            <Button variant="gold" label="Approve" onClick={() => { }} />
                            <Button label="Reject" onClick={() => { }} />
                        </div>
                    </div>
                </Card>
            </div>
        </Tabs>
    );
}
