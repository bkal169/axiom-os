import { useProject } from "../../context/ProjectContext";
import { Card, KPI, Field, Button } from "../../components/ui/components";
import { Agent } from "../agents/Agent";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { fmt } from "../../lib/utils";

export function ConceptDesign() {
    const { fin = {}, setFin } = useProject() as any;

    // Simplified yield calculation for V1
    const grossAcres = fin.grossAcres || 10;
    const netAcres = grossAcres * 0.75;
    const streetPct = 15;
    const openSpacePct = 15;
    const utilityPct = 5;

    const devSF = netAcres * 43560 * (1 - (streetPct + openSpacePct + utilityPct) / 100);
    const smallLotAvg = 4500;
    const largeLotAvg = 7500;
    const smallLotPct = 60;

    const smallLots = Math.floor(devSF * smallLotPct / 100 / smallLotAvg);
    const largeLots = Math.floor(devSF * (100 - smallLotPct) / 100 / largeLotAvg);
    const total = smallLots + largeLots;

    const pieD = [
        { name: "Streets", value: streetPct, fill: "var(--c-blue)" },
        { name: "Open Space", value: openSpacePct, fill: "var(--c-teal)" },
        { name: "Utilities", value: utilityPct, fill: "var(--c-purple)" },
        { name: "Residential", value: 100 - streetPct - openSpacePct - utilityPct, fill: "var(--c-gold)" },
    ];

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div className="axiom-grid-4">
                <KPI label="Small SFR Lots" value={smallLots} sub={`avg ${fmt.num(smallLotAvg)} SF`} />
                <KPI label="Large SFR Lots" value={largeLots} sub={`avg ${fmt.num(largeLotAvg)} SF`} />
                <KPI label="Total Yield" value={total} color="var(--c-green)" sub="Concept only" />
                <KPI label="Concept Density" value={(total / netAcres).toFixed(1)} color="var(--c-gold)" sub="DU/AC" />
            </div>

            <div className="axiom-grid-2">
                <Card title="Yield Configuration">
                    <div className="axiom-grid-2" style={{ marginBottom: 15 }}>
                        <Field label="Gross Acres"><input className="axiom-input" type="number" value={grossAcres} onChange={e => setFin({ ...fin, grossAcres: +e.target.value })} title="Gross Acres" /></Field>
                        <Field label="Small Lot %"><input className="axiom-input" type="number" defaultValue={smallLotPct} title="Small Lot %" /></Field>
                    </div>
                    <Button
                        variant="gold"
                        label="Sync to Financial Model"
                        onClick={() => setFin({ ...fin, totalLots: total })}
                    />
                </Card>

                <Card title="Land Use Mix">
                    <div style={{ height: 200 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={pieD} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={60} label={({ name, value }) => `${name} ${value}%`}>
                                    {pieD.map((d, i) => <Cell key={i} fill={d.fill} />)}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            </div>

            <Card title="Planner Agent">
                <Agent id="planner" system="You are a land planner and subdivision designer." placeholder="Describe your site and I'll help with layout ideas..." />
            </Card>
        </div>
    );
}
