import { useState } from "react";
import { Card, KPI, Field } from "../../components/ui/components";
import { fmt } from "../../lib/utils";

export function CalcHub() {
    const [active, setActive] = useState("mortgage");

    const calcs = [
        { id: "mortgage", label: "Mortgage", desc: "Monthly payment & amortization" },
        { id: "roi", label: "Flip ROI", desc: "Purchase, rehab, and profit" },
        { id: "caprate", label: "Cap Rate", desc: "NOI and value analysis" },
    ];

    return (
        <div className="axiom-grid-240-1" style={{ gap: 20 }}>
            <div className="axiom-stack-10">
                {calcs.map(c => (
                    <div
                        key={c.id}
                        onClick={() => setActive(c.id)}
                        className={`axiom-menu-item ${active === c.id ? "active" : ""}`}
                    >
                        <div className="axiom-text-13-bold">{c.label}</div>
                        <div className="axiom-text-10-dim" style={{ marginTop: 4 }}>{c.desc}</div>
                    </div>
                ))}
            </div>

            <div className="axiom-flex-1">
                {active === "mortgage" && <MortgageCalc />}
                {active === "roi" && <ROICalc />}
                {active === "caprate" && <CapRateCalc />}
            </div>
        </div>
    );
}

function MortgageCalc() {
    const [loan, setLoan] = useState(500000);
    const [rate, setRate] = useState(6.5);
    const [years, setYears] = useState(30);

    const n = years * 12;
    const r = rate / 100 / 12;
    const pmt = r > 0 ? loan * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1) : loan / n;

    return (
        <Card title="Mortgage Calculator">
            <div className="axiom-grid-3" style={{ marginBottom: 20 }}>
                <Field label="Loan Amount ($)">
                    <input className="axiom-input" type="number" value={loan} onChange={e => setLoan(+e.target.value)} title="Loan Amount" />
                </Field>
                <Field label="Interest Rate (%)">
                    <input className="axiom-input" type="number" step="0.125" value={rate} onChange={e => setRate(+e.target.value)} title="Interest Rate" />
                </Field>
                <Field label="Term (Years)">
                    <select className="axiom-select" value={years} onChange={e => setYears(+e.target.value)} title="Term">
                        <option value={15}>15 Years</option>
                        <option value={30}>30 Years</option>
                    </select>
                </Field>
            </div>
            <div className="axiom-grid-2">
                <div className="axiom-kpi-highlight">
                    <div className="axiom-text-10-dim-ls1" style={{ marginBottom: 5 }}>MONTHLY PAYMENT</div>
                    <div className="axiom-text-32-bold-gold">{fmt.usd(Math.round(pmt))}</div>
                </div>
                <div className="axiom-stack-10">
                    <KPI label="Total Interest" value={fmt.usd(Math.round(pmt * n - loan))} color="var(--c-red)" />
                    <KPI label="Total Paid" value={fmt.usd(Math.round(pmt * n))} color="var(--c-text)" />
                </div>
            </div>
        </Card>
    );
}

function ROICalc() {
    const [v, setV] = useState({ purchase: 350000, rehab: 85000, arv: 520000, holdMonths: 6 });
    const u = (k: string) => (e: any) => setV({ ...v, [k]: +e.target.value });

    const totalIn = v.purchase + v.rehab;
    const profit = v.arv - totalIn - (v.arv * 0.08); // Simplified 8% closing/comm
    const roi = totalIn > 0 ? (profit / totalIn) * 100 : 0;

    return (
        <Card title="Flip ROI Analysis">
            <div className="axiom-grid-2" style={{ marginBottom: 20 }}>
                <Field label="Purchase Price"><input className="axiom-input" type="number" value={v.purchase} onChange={u("purchase")} title="Purchase Price" /></Field>
                <Field label="Rehab Cost"><input className="axiom-input" type="number" value={v.rehab} onChange={u("rehab")} title="Rehab Cost" /></Field>
                <Field label="After Repair Value"><input className="axiom-input" type="number" value={v.arv} onChange={u("arv")} title="After Repair Value" /></Field>
                <Field label="Hold Period (mo)"><input className="axiom-input" type="number" value={v.holdMonths} onChange={u("holdMonths")} title="Hold Period" /></Field>
            </div>
            <div className="axiom-grid-3">
                <KPI label="Net Profit" value={fmt.usd(profit)} color={profit >= 0 ? "var(--c-green)" : "var(--c-red)"} />
                <KPI label="Total ROI" value={fmt.pct(roi)} color={roi > 20 ? "var(--c-green)" : "var(--c-gold)"} />
                <KPI label="Total Invested" value={fmt.usd(totalIn)} color="var(--c-dim)" />
            </div>
        </Card>
    );
}

function CapRateCalc() {
    const [v, setV] = useState({ price: 2000000, gri: 180000, opex: 72000 });
    const u = (k: string) => (e: any) => setV({ ...v, [k]: +e.target.value });

    const noi = v.gri - v.opex;
    const capRate = v.price > 0 ? (noi / v.price) * 100 : 0;

    return (
        <Card title="Cap Rate / NOI Calculator">
            <div className="axiom-grid-2" style={{ marginBottom: 20 }}>
                <Field label="Purchase Price"><input className="axiom-input" type="number" value={v.price} onChange={u("price")} title="Purchase Price" /></Field>
                <Field label="Gross Income (Annual)"><input className="axiom-input" type="number" value={v.gri} onChange={u("gri")} title="Gross Income" /></Field>
                <Field label="OpExpenses (Annual)"><input className="axiom-input" type="number" value={v.opex} onChange={u("opex")} title="OpExpenses" /></Field>
                <KPI label="Cap Rate" value={capRate.toFixed(2) + "%"} color={capRate > 6 ? "var(--c-green)" : "var(--c-gold)"} />
            </div>
            <KPI label="Net Operating Income" value={fmt.usd(noi)} color="var(--c-green)" />
        </Card>
    );
}
