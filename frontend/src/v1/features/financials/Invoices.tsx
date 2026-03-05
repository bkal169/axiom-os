import { useState } from "react";
import { Card, KPI, Field, Badge, Button, AxiomTable } from "../../components/ui/components";
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
                <div className="axiom-grid-3 axiom-mb-14">
                    <KPI label="Total Invoiced" value={fmt.usd(totalInvoiced)} color="var(--c-text)" />
                    <KPI label="Paid" value={fmt.usd(totalPaid)} color="var(--c-green)" />
                    <KPI label="Pending" value={fmt.usd(totalPending)} color="var(--c-amber)" />
                </div>
                {showAdd && (
                    <Card title="Add Invoice">
                        <div className="axiom-grid-3 axiom-mb-12">
                            <Field label="Vendor"><input className="axiom-input" value={ni.vendor} onChange={e => setNi({ ...ni, vendor: e.target.value })} placeholder="Vendor name" title="Vendor Name" /></Field>
                            <Field label="Amount ($)"><input className="axiom-input" type="number" value={ni.amount} onChange={e => setNi({ ...ni, amount: e.target.value })} placeholder="0.00" title="Invoice Amount" /></Field>
                            <Field label="Date"><input className="axiom-input" type="date" value={ni.date} onChange={e => setNi({ ...ni, date: e.target.value })} title="Invoice Date" /></Field>
                            <Field label="Category"><select className="axiom-select" value={ni.category} onChange={e => setNi({ ...ni, category: e.target.value })} title="Invoice Category">{CATS.map(c => <option key={c}>{c}</option>)}</select></Field>
                            <Field label="Status"><select className="axiom-select" value={ni.status} onChange={e => setNi({ ...ni, status: e.target.value })} title="Invoice Status">{STATUSES.map(s => <option key={s}>{s}</option>)}</select></Field>
                            <Field label="Deal / Project"><input className="axiom-input" value={ni.deal} onChange={e => setNi({ ...ni, deal: e.target.value })} placeholder="Deal name" title="Linked Deal" /></Field>
                        </div>
                        <div className="axiom-flex-row axiom-gap-8">
                            <Button variant="gold" label="Save Invoice" onClick={addInvoice} />
                            <Button label="Cancel" onClick={() => setShowAdd(false)} />
                        </div>
                    </Card>
                )}
                <Card title="Invoice Management" action={<Button variant="gold" label="+ Ingest Invoice" onClick={() => setShowAdd(v => !v)} title="Add New Invoice" />}>
                    <AxiomTable headers={["Vendor", "Category", "Amount", "Date", "Status", "Deal"]}>
                        {(invoices as any[]).map((i: any) => (
                            <tr key={i.id} className="premium-hover">
                                <td className="axiom-td axiom-text-bold">{i.vendor}</td>
                                <td className="axiom-td"><Badge label={i.category} color="var(--c-blue)" /></td>
                                <td className="axiom-td axiom-text-gold">{fmt.usd(i.amount)}</td>
                                <td className="axiom-td">{i.date}</td>
                                <td className="axiom-td">
                                    <div className="axiom-flex-center-gap-6">
                                        <span className={`axiom-w-8 axiom-h-8 axiom-radius-full ${i.status === "Paid" ? "axiom-bg-green" : "axiom-bg-amber"}`} />
                                        {i.status}
                                    </div>
                                </td>
                                <td className="axiom-td">{i.deal}</td>
                            </tr>
                        ))}
                    </AxiomTable>
                </Card>
            </div>

            {/* ─ Draw Requests ─ */}
            <div>
                <Card title="Digital Draw Requests">
                    <div className="axiom-text-12-dim axiom-mb-16">Automated AIA G702/G703 style draw documentation for bank submission.</div>
                    {[["Draw #04 - Feb 2025", "$145,200", "Pending"], ["Draw #03 - Jan 2025", "$212,000", "Paid"], ["Draw #02 - Dec 2024", "$88,500", "Paid"]].map(([n, v, s], i) => (
                        <div key={i} className="axiom-list-item-sb axiom-py-12">
                            <div className="axiom-flex-1">
                                <div className="axiom-text-13-text-bold">{n}</div>
                                <div className="axiom-text-10-dim">Submission Package: All Invoices + Lien Waivers</div>
                            </div>
                            <div className="axiom-text-14-bold axiom-text-gold axiom-mx-12">{v}</div>
                            <Badge label={s} color={s === "Paid" ? "var(--c-green)" : "var(--c-amber)"} />
                            <Button label="Review" onClick={() => { }} title={`Review ${n}`} className="axiom-ml-8" />
                        </div>
                    ))}
                </Card>
            </div>

            {/* ─ Approval Workflow ─ */}
            <div>
                <Card title="Payment Approval Flow">
                    <div className="axiom-text-12-dim axiom-mb-12">Multi-stage approval for construction disbursements.</div>
                    <div className="axiom-flex-sb-center axiom-p-14 axiom-bg-2 axiom-radius-4">
                        <div className="axiom-flex-1">
                            <div className="axiom-text-13-text-bold axiom-text-gold">A+ Grading Services - $28,000</div>
                            <div className="axiom-text-10-dim">Invoice #INV-9284 · Sunset Ridge</div>
                        </div>
                        <div className="axiom-flex-row axiom-gap-6">
                            <Button variant="gold" label="Approve" onClick={() => { }} title="Approve Payment" />
                            <Button label="Reject" onClick={() => { }} title="Reject Payment" />
                        </div>
                    </div>
                </Card>
            </div>
        </Tabs>
    );
}
