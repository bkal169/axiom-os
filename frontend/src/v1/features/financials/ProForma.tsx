import { useMemo } from "react";
import { useProject } from "../../context/ProjectContext";
import { Card, KPI, Field, Progress } from "../../components/ui/components";
import { Agent } from "../agents/Agent";
import { buildMonthlyCashFlows, calcIRR } from "../../lib/math";
import { fmt } from "../../lib/utils";
import {
    BarChart, Bar, AreaChart, Area, Cell,
    ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, CartesianGrid
} from "recharts";

export function ProForma() {
    const { project, fin, setFin, loan, equity } = useProject() as any;

    const u = (k: string) => (e: any) => setFin({ ...fin, [k]: parseFloat(e.target.value) || 0 });

    const calculations = useMemo(() => {
        const hard = fin.totalLots * fin.hardCostPerLot;
        const soft = hard * (fin.softCostPct / 100);
        const fees = fin.planningFees + (fin.permitFeePerLot + fin.schoolFee + fin.impactFeePerLot) * fin.totalLots;
        const cont = (hard + soft) * (fin.contingencyPct / 100);
        const totalBaseCost = fin.landCost + fin.closingCosts + hard + soft + cont + fees;

        const revenue = fin.totalLots * fin.salesPricePerLot;
        const commission = (revenue * fin.salesCommission) / 100;
        const reserves = (totalBaseCost * (fin.reservePercentage || 5)) / 100;

        // Loan & Equity
        const loanAmount = totalBaseCost * (loan.ltc / 100);
        const equityNeed = totalBaseCost - loanAmount;
        const originationFee = (loanAmount * loan.origFee) / 100;

        const { flows, constMonths, totalMonths } = buildMonthlyCashFlows(fin);
        const avgDraw = loanAmount * 0.55;
        const idc = avgDraw * (loan.rate / 100) * (constMonths / 12);

        const totalProjectCost = totalBaseCost + originationFee + idc;
        const netProfit = revenue - commission - reserves - totalProjectCost;

        const margin = revenue > 0 ? (netProfit / revenue) * 100 : 0;
        const roi = totalProjectCost > 0 ? (netProfit / totalProjectCost) * 100 : 0;

        // Equity Waterfall
        const lpEquity = (equityNeed * equity.lpPct) / 100;
        const gpEquity = (equityNeed * equity.gpPct) / 100;
        const prefReturnAmt = lpEquity * (equity.prefReturn / 100) * (totalMonths / 12);
        const profitAfterPref = Math.max(0, netProfit - prefReturnAmt);
        const promoteAmt = (profitAfterPref * equity.promotePct) / 100;

        const lpProfit = prefReturnAmt + (profitAfterPref - promoteAmt) * (equity.lpPct / 100);
        const gpProfit = promoteAmt + (profitAfterPref - promoteAmt) * (equity.gpPct / 100);

        const lpMultiple = lpEquity > 0 ? (lpEquity + lpProfit) / lpEquity : 0;
        const gpMultiple = gpEquity > 0 ? (gpEquity + gpProfit) / gpEquity : 0;

        // Adjusted IRR
        const adjFlows = [...flows];
        adjFlows[0] = adjFlows[0] - originationFee;
        const monthlyInterest = (avgDraw * (loan.rate / 100)) / 12;
        for (let m = 1; m <= constMonths && m < adjFlows.length; m++) {
            adjFlows[m] -= monthlyInterest;
        }
        const irr = calcIRR(adjFlows) || 0;
        const annualIRR = (Math.pow(1 + irr, 12) - 1) * 100;

        return {
            hard, soft, fees, cont, totalBaseCost, revenue, commission, reserves,
            loanAmount, equityNeed, originationFee, idc, totalProjectCost, netProfit,
            margin, roi, lpEquity, gpEquity, prefReturnAmt, promoteAmt, lpProfit, gpProfit,
            lpMultiple, gpMultiple, annualIRR, constMonths, totalMonths, adjFlows
        };
    }, [fin, loan, equity]);

    const waterfallData = [
        { name: "Revenue", value: calculations.revenue / 1e6, fill: "#7ED321" },
        { name: "Land", value: -(fin.landCost + fin.closingCosts) / 1e6, fill: "#D0021B88" },
        { name: "Hard Cost", value: -calculations.hard / 1e6, fill: "#D0021B88" },
        { name: "Soft Cost", value: -calculations.soft / 1e6, fill: "#F5A62388" },
        { name: "Fees", value: -calculations.fees / 1e6, fill: "#BD10E088" },
        { name: "Profit", value: calculations.netProfit / 1e6, fill: calculations.netProfit >= 0 ? "#7ED321" : "#D0021B" },
    ];

    const cfChartData = calculations.adjFlows.map((cf, i) => ({
        month: i,
        cf: Math.round(cf),
        cumulative: Math.round(calculations.adjFlows.slice(0, i + 1).reduce((s, v) => s + v, 0))
    }));

    return (
        <div className="axiom-grid-1-340" style={{ gap: 20 }}>
            <div className="axiom-stack-20">
                <div className="axiom-grid-4">
                    <KPI label="Net Profit" value={fmt.M(calculations.netProfit)} color={calculations.netProfit >= 0 ? "var(--c-green)" : "var(--c-red)"} />
                    <KPI label="Profit Margin" value={fmt.pct(calculations.margin)} color={calculations.margin > 15 ? "var(--c-green)" : "var(--c-gold)"} />
                    <KPI label="Levered IRR" value={fmt.pct(calculations.annualIRR)} color="var(--c-blue)" />
                    <KPI label="Total Project Cost" value={fmt.M(calculations.totalProjectCost)} color="var(--c-text)" />
                </div>

                <div className="axiom-grid-2">
                    <Card title="Input Assumptions">
                        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                            <Field label="Total Lots">
                                <input className="axiom-input" type="number" value={fin.totalLots} onChange={u("totalLots")} title="Total Lots" />
                            </Field>
                            <Field label="Land Cost ($)">
                                <input className="axiom-input" type="number" value={fin.landCost} onChange={u("landCost")} title="Land Cost" />
                            </Field>
                            <Field label="Hard Cost / Lot ($)">
                                <input className="axiom-input" type="number" value={fin.hardCostPerLot} onChange={u("hardCostPerLot")} title="Hard Cost per Lot" />
                            </Field>
                            <Field label="Soft Cost %">
                                <input className="axiom-input" type="number" value={fin.softCostPct} onChange={u("softCostPct")} title="Soft Cost Percentage" />
                            </Field>
                            <Field label="Sales Price / Lot ($)">
                                <input className="axiom-input" type="number" value={fin.salesPricePerLot} onChange={u("salesPricePerLot")} title="Sales Price per Lot" />
                            </Field>
                        </div>
                    </Card>

                    <Card title="Waterfall Analysis ($M)">
                        <div style={{ height: 260 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={waterfallData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="var(--c-border)" vertical={false} />
                                    <XAxis dataKey="name" stroke="var(--c-dim)" fontSize={10} />
                                    <YAxis stroke="var(--c-dim)" fontSize={10} />
                                    <Tooltip contentStyle={{ background: "var(--c-bg2)", border: "1px solid var(--c-border)" }} />
                                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                                        {waterfallData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.fill} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>
                </div>

                <Card title="Cash Flow Projection">
                    <div style={{ height: 300 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={cfChartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--c-border)" vertical={false} />
                                <XAxis dataKey="month" stroke="var(--c-dim)" fontSize={10} />
                                <YAxis stroke="var(--c-dim)" fontSize={10} />
                                <Tooltip contentStyle={{ background: "var(--c-bg2)", border: "1px solid var(--c-border)" }} />
                                <Area type="monotone" dataKey="cf" name="Monthly" stroke="var(--c-blue)" fill="var(--c-blue)" fillOpacity={0.1} />
                                <Area type="monotone" dataKey="cumulative" name="Cumulative" stroke="var(--c-gold)" fill="var(--c-gold)" fillOpacity={0.05} />
                                <Legend />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            </div>

            <div className="axiom-stack-20">
                <Card title="Financing Stack">
                    <div className="axiom-stack-15">
                        <div className="axiom-flex-between">
                            <span className="axiom-dim-12">Senior Debt</span>
                            <span className="axiom-bold">{fmt.M(calculations.loanAmount)}</span>
                        </div>
                        <Progress value={loan.ltc} color="var(--c-blue)" />
                        <div className="axiom-flex-between">
                            <span className="axiom-kpi-sub">Equity Required</span>
                            <span className="axiom-bold">{fmt.M(calculations.equityNeed)}</span>
                        </div>
                        <div style={{ borderTop: "1px solid var(--c-border)", paddingTop: 10 }}>
                            <div className="axiom-flex-between" style={{ padding: "2px 0" }}>
                                <span className="axiom-kpi-sub">LP Equity ({equity.lpPct}%)</span>
                                <span className="axiom-text-11">{fmt.M(calculations.lpEquity)}</span>
                            </div>
                            <div className="axiom-flex-between" style={{ padding: "2px 0" }}>
                                <span className="axiom-kpi-sub">GP Equity ({equity.gpPct}%)</span>
                                <span className="axiom-text-11">{fmt.M(calculations.gpEquity)}</span>
                            </div>
                        </div>
                    </div>
                </Card>

                <Card title="Return Metrics">
                    <div className="axiom-stack-12">
                        <div className="axiom-flex-between" style={{ padding: "8px 0", borderBottom: "1px solid var(--c-bg)" }}>
                            <span className="axiom-kpi-sub">LP Multiple</span>
                            <span style={{ fontSize: 14, fontWeight: "bold", color: "var(--c-gold)" }}>{calculations.lpMultiple.toFixed(2)}x</span>
                        </div>
                        <div className="axiom-flex-between" style={{ padding: "8px 0", borderBottom: "1px solid var(--c-bg)" }}>
                            <span className="axiom-kpi-sub">GP Multiple</span>
                            <span style={{ fontSize: 14, fontWeight: "bold", color: "var(--c-gold)" }}>{calculations.gpMultiple.toFixed(2)}x</span>
                        </div>
                        <div className="axiom-flex-between" style={{ padding: "8px 0" }}>
                            <span className="axiom-kpi-sub">ROI (Unlevered)</span>
                            <span style={{ fontSize: 14, fontWeight: "bold" }}>{calculations.roi.toFixed(1)}%</span>
                        </div>
                    </div>
                </Card>

                <Card title="Underwriter Notes">
                    <Agent
                        id="ProFormaAgent"
                        system={`You are a pro forma underwriting AI. Analyze the project: ${project.name}. Lots: ${fin.totalLots}, Revenue: $${calculations.revenue}, Profit: $${calculations.netProfit}, Margin: ${calculations.margin.toFixed(1)}%, IRR: ${calculations.annualIRR.toFixed(1)}%. Highlight risks in the cost structure or sales assumptions.`}
                        placeholder="Ask about these projections..."
                    />
                </Card>
            </div>
        </div>
    );
}
