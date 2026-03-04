import { useState, useEffect } from "react";
import { Card, KPI, Field } from "../../components/ui/components";
import { fmt } from "../../lib/utils";
import { supa } from "../../lib/supabase";

export function CalcHub() {
    const [active, setActive] = useState("mortgage");

    const calcs = [
        { id: "mortgage", label: "Mortgage", desc: "Monthly payment & amortization" },
        { id: "roi", label: "Flip ROI", desc: "Purchase, rehab, and profit" },
        { id: "caprate", label: "Cap Rate", desc: "NOI and value analysis" },
        { id: "construction", label: "Construction", desc: "Hard cost estimation" },
        { id: "insurance", label: "Insurance", desc: "Annual premium estimate" },
    ];

    return (
        <div className="axiom-stack-20">
            <div className="axiom-tabs-nav">
                {calcs.map(c => (
                    <div
                        key={c.id}
                        onClick={() => setActive(c.id)}
                        className={`axiom-tab-item ${active === c.id ? "active" : ""}`}
                        title={c.desc}
                        style={{ cursor: "pointer" }}
                    >
                        {c.label}
                    </div>
                ))}
            </div>

            <div className="axiom-animate-fade">
                {active === "mortgage" && <MortgageCalc />}
                {active === "roi" && <ROICalc />}
                {active === "caprate" && <CapRateCalc />}
                {active === "construction" && <ConstructionCalc />}
                {active === "insurance" && <InsuranceCalc />}
            </div>
        </div>
    );
}

function MortgageCalc() {
    const [loan, setLoan] = useState(500000);
    const [rate, setRate] = useState(6.5);
    const [years, setYears] = useState(30);
    const [result, setResult] = useState<any>(null);

    useEffect(() => {
        const t = setTimeout(() => {
            supa.callEdge("engines-calc", { type: "mortgage", loan, rate, years }).then(res => {
                if (res && res.payment !== undefined) setResult(res);
            });
        }, 400);
        return () => clearTimeout(t);
    }, [loan, rate, years]);

    const n = years * 12;
    const r = rate / 100 / 12;
    const fallbackPmt = r > 0 ? loan * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1) : loan / n;
    const pmt = result?.payment ?? fallbackPmt;

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
                    <div style={{ fontSize: 10, color: "var(--c-sub)", letterSpacing: "1px", marginBottom: 5 }}>MONTHLY PAYMENT</div>
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
    const [result, setResult] = useState<any>(null);

    useEffect(() => {
        const t = setTimeout(() => {
            supa.callEdge("engines-calc", { type: "roi", purchase: v.purchase, rehab: v.rehab, arv: v.arv }).then(res => {
                if (res && res.profit !== undefined) setResult(res);
            });
        }, 400);
        return () => clearTimeout(t);
    }, [v.purchase, v.rehab, v.arv]);

    const u = (k: string) => (e: any) => setV({ ...v, [k]: +e.target.value });

    const totalIn = v.purchase + v.rehab;
    const fallbackProfit = v.arv - totalIn;
    const profit = result?.profit ?? fallbackProfit;
    const roi = result?.roi ?? (totalIn > 0 ? (profit / totalIn) * 100 : 0);

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
    const [result, setResult] = useState<any>(null);

    useEffect(() => {
        const noi = v.gri - v.opex;
        const t = setTimeout(() => {
            supa.callEdge("engines-calc", { type: "caprate", noi, value: v.price }).then(res => {
                if (res && res.capRate !== undefined) setResult(res);
            });
        }, 400);
        return () => clearTimeout(t);
    }, [v.price, v.gri, v.opex]);

    const u = (k: string) => (e: any) => setV({ ...v, [k]: +e.target.value });

    const noi = v.gri - v.opex;
    const capRate = result?.capRate ?? (v.price > 0 ? (noi / v.price) * 100 : 0);

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

function ConstructionCalc() {
    const [sqft, setSqft] = useState(100000);
    const [costPerSf, setCostPerSf] = useState(150);
    const [contingencyPct, setContingencyPct] = useState(10);
    const [result, setResult] = useState<any>(null);

    useEffect(() => {
        const t = setTimeout(() => {
            supa.callEdge("engines-calc", { type: "construction", sqft, cost_per_sf: costPerSf, contingency_pct: contingencyPct / 100 }).then(res => {
                if (res && res.estimated_total_cost !== undefined) setResult(res);
            });
        }, 400);
        return () => clearTimeout(t);
    }, [sqft, costPerSf, contingencyPct]);

    const totalCost = result?.estimated_total_cost ?? (sqft * costPerSf * (1 + contingencyPct / 100));

    return (
        <Card title="Construction Cost Estimator">
            <div className="axiom-grid-2" style={{ marginBottom: 20 }}>
                <div className="axiom-stack-16">
                    <Field label="Total SqFt"><input className="axiom-input" type="number" value={sqft} onChange={e => setSqft(+e.target.value)} title="Total SqFt" /></Field>
                    <Field label="Cost / SqFt ($)"><input className="axiom-input" type="number" value={costPerSf} onChange={e => setCostPerSf(+e.target.value)} title="Cost / SqFt" /></Field>
                    <Field label={`Contingency (${contingencyPct}%)`}>
                        <input type="range" min="0" max="30" step="1" value={contingencyPct} onChange={e => setContingencyPct(+e.target.value)} title="Contingency" style={{ width: "100%", accentColor: "var(--c-gold)" }} />
                    </Field>
                </div>
                <div className="axiom-kpi-highlight" style={{ background: "var(--c-bg4)", border: "1px solid var(--c-border2)" }}>
                    <div style={{ fontSize: 10, color: "var(--c-sub)", letterSpacing: "1px", marginBottom: 5 }}>ESTIMATED HARD COSTS</div>
                    <div className="axiom-text-32-bold-gold">{fmt.usd(Math.round(totalCost))}</div>
                    <div style={{ fontSize: 10, color: "var(--c-dim)", marginTop: 8 }}>Including {contingencyPct}% Contingency</div>
                </div>
            </div>
        </Card>
    );
}

function InsuranceCalc() {
    const [replacementCost, setReplacementCost] = useState(1000000);
    const [assetClass, setAssetClass] = useState("multifamily");
    const [locationRisk, setLocationRisk] = useState(1.0);
    const [result, setResult] = useState<any>(null);

    useEffect(() => {
        const t = setTimeout(() => {
            supa.callEdge("engines-calc", { type: "insurance", replacement_cost: replacementCost, asset_class: assetClass, location_risk: locationRisk }).then(res => {
                if (res && res.estimated_annual_premium !== undefined) setResult(res);
            });
        }, 400);
        return () => clearTimeout(t);
    }, [replacementCost, assetClass, locationRisk]);

    const premium = result?.estimated_annual_premium ?? (replacementCost * 0.007 * locationRisk);

    return (
        <Card title="Insurance Premium Estimator">
            <div className="axiom-grid-2" style={{ marginBottom: 20 }}>
                <div className="axiom-stack-16">
                    <Field label="Replacement Cost"><input className="axiom-input" type="number" value={replacementCost} onChange={e => setReplacementCost(+e.target.value)} title="Replacement Cost" /></Field>
                    <Field label="Asset Class">
                        <select className="axiom-select" value={assetClass} onChange={e => setAssetClass(e.target.value)} title="Asset Class">
                            <option value="multifamily">Multifamily</option>
                            <option value="industrial">Industrial</option>
                            <option value="retail">Retail</option>
                            <option value="office">Office</option>
                            <option value="single_family">Single Family</option>
                        </select>
                    </Field>
                    <Field label="Risk Profile">
                        <select className="axiom-select" value={locationRisk} onChange={e => setLocationRisk(+e.target.value)} title="Risk Profile">
                            <option value="0.8">Low Risk</option>
                            <option value="1.0">Standard Risk</option>
                            <option value="1.5">High Wind</option>
                            <option value="2.5">Coastal</option>
                            <option value="3.0">Wildfire</option>
                        </select>
                    </Field>
                </div>
                <div className="axiom-kpi-highlight" style={{ background: "var(--c-bg4)", border: "1px solid var(--c-border2)" }}>
                    <div style={{ fontSize: 10, color: "var(--c-sub)", letterSpacing: "1px", marginBottom: 5 }}>ANNUAL PREMIUM</div>
                    <div className="axiom-text-32-bold-gold">{fmt.usd(Math.round(premium))}</div>
                    <div style={{ fontSize: 10, color: "var(--c-dim)", marginTop: 8 }}>Dynamic ESG Factor: {(locationRisk * 10).toFixed(1)}</div>
                </div>
            </div>
        </Card>
    );
}
