import { useState } from "react";
import { Card, Badge, Progress, Button, AxiomTable } from "../../components/ui/components";
import { Tabs } from "../../components/ui/layout";

interface SiteVisit {
    id: number;
    date: string;
    inspector: string;
    type: string;
    result: "Pass" | "Fail" | "Incomplete";
    notes: string;
}

export function SiteManagement() {
    const [visits] = useState<SiteVisit[]>([
        { id: 1, date: "2026-03-01", inspector: "J. Miller", type: "Foundation Prep", result: "Pass", notes: "Forms verified, rebar placement correct." },
        { id: 2, date: "2026-02-15", inspector: "S. Chen", type: "Utility Rough-in", result: "Incomplete", notes: "Sewer lateral pending city tie-in." },
        { id: 3, date: "2026-02-01", inspector: "B. Davis", type: "SWPPP Compliance", result: "Pass", notes: "Silt fences maintained after rain event." },
    ]);

    const stats = {
        permitsIssued: 12,
        permitsTotal: 15,
        inspectionsPassed: 42,
        inspectionsTotal: 45,
        safetyDays: 124,
    };

    return (
        <Tabs tabs={["Inspections", "Permit Status", "Site Safety", "Logistics"]}>
            <div className="axiom-stack-20">
                <div className="axiom-grid-3">
                    <Card title="Permitting Progress">
                        <div className="axiom-flex-sb axiom-mb-8">
                            <span className="axiom-text-11-dim">Entitlements & Permits</span>
                            <span className="axiom-text-11-gold-bold">{stats.permitsIssued} / {stats.permitsTotal}</span>
                        </div>
                        <Progress value={(stats.permitsIssued / stats.permitsTotal) * 100} color="var(--c-gold)" />
                        <div className="axiom-text-9-dim axiom-mt-8">3 Permits Pending Municipal Review</div>
                    </Card>

                    <Card title="Inspection Success Rate">
                        <div className="axiom-flex-sb axiom-mb-8">
                            <span className="axiom-text-11-dim">Field Compliance</span>
                            <span className="axiom-text-11-teal-bold">{Math.round((stats.inspectionsPassed / stats.inspectionsTotal) * 100)}%</span>
                        </div>
                        <Progress value={(stats.inspectionsPassed / stats.inspectionsTotal) * 100} color="var(--c-teal)" />
                        <div className="axiom-text-9-dim axiom-mt-8">42 Passed, 3 Outstanding / Re-inspect</div>
                    </Card>

                    <Card title="Site Safety Metric">
                        <div className="axiom-flex-sb axiom-mb-8">
                            <span className="axiom-text-11-dim">Days Without Incident</span>
                            <span className="axiom-text-24-gold-bold">{stats.safetyDays}</span>
                        </div>
                        <div className="axiom-text-9-teal-bold">✓ EXCEEDS REGIONAL TARGET (90 DAYS)</div>
                    </Card>
                </div>

                <div className="axiom-grid-6-4">
                    <Card title="Recent Field Inspections" className="axiom-flex-1">
                        <AxiomTable headers={["Date", "Inspector", "Category", "Result", "Notes"]}>
                            {visits.map(v => (
                                <tr key={v.id}>
                                    <td className="axiom-td-dim">{v.date}</td>
                                    <td className="axiom-td-13-bold">{v.inspector}</td>
                                    <td className="axiom-td">{v.type}</td>
                                    <td className="axiom-td">
                                        <Badge
                                            label={v.result}
                                            color={v.result === "Pass" ? "var(--c-teal)" : v.result === "Fail" ? "var(--c-red)" : "var(--c-amber)"}
                                        />
                                    </td>
                                    <td className="axiom-td-dim">{v.notes}</td>
                                </tr>
                            ))}
                        </AxiomTable>
                    </Card>

                    <div className="axiom-stack-20">
                        <Card title="Utility & POC Tracking">
                            <div className="axiom-stack-12">
                                <div className="axiom-flex-sb axiom-p4-8 axiom-bg-2 axiom-radius-4">
                                    <span className="axiom-text-11-text-bold">Potable Water</span>
                                    <Badge label="Connected" color="var(--c-teal)" />
                                </div>
                                <div className="axiom-flex-sb axiom-p4-8 axiom-bg-2 axiom-radius-4">
                                    <span className="axiom-text-11-text-bold">Sewer Main</span>
                                    <Badge label="In Progress" color="var(--c-amber)" />
                                </div>
                                <div className="axiom-flex-sb axiom-p4-8 axiom-bg-2 axiom-radius-4">
                                    <span className="axiom-text-11-text-bold">Electrical Grid</span>
                                    <Badge label="Permit Only" color="var(--c-dim)" />
                                </div>
                            </div>
                        </Card>

                        <Card title="Quick Action">
                            <div className="axiom-stack-10">
                                <Button variant="gold" label="Request City Inspection" className="axiom-w-full" />
                                <Button label="Upload Field Report" className="axiom-w-full" />
                            </div>
                        </Card>
                    </div>
                </div>
            </div>

            <div>
                <Card title="Site Logistics AI">
                    <div className="axiom-p-20 axiom-text-center">
                        <div className="axiom-text-13-gold-bold axiom-mb-10">Logistics Optimization Active</div>
                        <p className="axiom-text-11-dim">
                            Axiom is cross-referencing weather patterns with concrete pour schedules.
                            Recommend shifting Slab On Grade pour to Thursday morning to avoid forecasted 0.5" precipitation.
                        </p>
                    </div>
                </Card>
            </div>
        </Tabs>
    );
}
