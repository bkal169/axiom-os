import { useState } from "react";
import { Card, KPI, Field, Badge, Button } from "../../components/ui/components";
import { Tabs } from "../../components/ui/layout";
import { useLS } from "../../hooks/useLS";

const TRIGGERS = [
    "Deal moves to new stage", "Time-based schedule", "New MLS listing matches criteria",
    "Risk score changes", "DD item completed", "Contact updated",
    "Financial threshold crossed", "Document uploaded", "Manual trigger"
];

interface Workflow {
    id: number;
    name: string;
    trigger: string;
    condition: string;
    actions: string[];
    status: string;
    runs: number;
    lastRun: string;
}

const SEED_WORKFLOWS: Workflow[] = [
    { id: 1, name: "Deal Stage Transition Alerts", trigger: "Deal moves to new stage", condition: "Any deal", actions: ["Send email notification to team", "Log activity in deal timeline", "Update dashboard KPIs"], status: "Active", runs: 24, lastRun: "2025-02-20" },
    { id: 2, name: "DD Deadline Reminders", trigger: "3 days before DD deadline", condition: "Deals in Due Diligence stage", actions: ["Send email reminder to deal assignee", "Create calendar event", "Push notification"], status: "Active", runs: 8, lastRun: "2025-02-18" },
    { id: 3, name: "New Listing Alert", trigger: "New MLS listing matches saved search", condition: "Price < $5M, 5+ acres, R-1 zoning", actions: ["Send email with listing details", "Add to Data & Intel feed", "Create note with property summary"], status: "Active", runs: 12, lastRun: "2025-02-19" },
    { id: 4, name: "Weekly Pipeline Report", trigger: "Every Monday at 8:00 AM", condition: "Always", actions: ["Generate pipeline summary", "Email to team distribution list", "Archive to Reports & Binder"], status: "Active", runs: 6, lastRun: "2025-02-17" },
    { id: 5, name: "Risk Score Alert", trigger: "Risk score drops below 50", condition: "Any active deal", actions: ["Notify deal lead", "Create risk review meeting", "Flag in Command Center"], status: "Paused", runs: 2, lastRun: "2025-02-05" },
];

const TEMPLATES = [
    { name: "Deal Stage Notifications", trigger: "Deal moves to new stage", condition: "Any deal", actions: ["Send email notification to team", "Log activity in deal timeline"] },
    { name: "DD Deadline Tracker", trigger: "3 days before DD deadline", condition: "Deals in Due Diligence stage", actions: ["Send email reminder", "Create calendar event"] },
    { name: "Listing Price Drop Alert", trigger: "New MLS listing matches saved search", condition: "Price reduction > 5%", actions: ["Send email with listing details", "Add to Data & Intel feed"] },
    { name: "Weekly Pipeline Digest", trigger: "Time-based schedule", condition: "Every Monday at 8:00 AM", actions: ["Generate pipeline summary", "Email to team distribution list"] },
    { name: "Risk Score Monitor", trigger: "Risk score changes", condition: "Any active deal", actions: ["Notify deal lead", "Create risk review meeting"] },
    { name: "Investor Report Generator", trigger: "Time-based schedule", condition: "First day of each month", actions: ["Generate investor KPI report", "Email to investor list"] },
];

const LOG_ENTRIES = [
    ["Deal Stage Transition", "Sunset Ridge moved to Due Diligence", "2025-02-20 14:30", "var(--c-green)"],
    ["DD Deadline Reminder", "Hawk Valley - Geotech report due in 3 days", "2025-02-18 08:00", "var(--c-amber)"],
    ["New Listing Match", "4500 Hillside Dr - matches 'Infill SFR' search", "2025-02-19 10:15", "var(--c-blue)"],
    ["Weekly Report", "Pipeline report generated and emailed", "2025-02-17 08:00", "var(--c-gold)"],
    ["Risk Alert", "Meadowbrook PUD risk score dropped to 42", "2025-02-05 16:00", "var(--c-red)"],
];

export function Workflows() {
    const [workflows, setWorkflows] = useLS<Workflow[]>("axiom_workflows", SEED_WORKFLOWS);
    const [nw, setNw] = useState({ name: "", trigger: TRIGGERS[0], condition: "", actions: [""], status: "Active" });

    const toggle = (id: number) => setWorkflows((workflows as Workflow[]).map(w => w.id === id ? { ...w, status: w.status === "Active" ? "Paused" : "Active" } : w));
    const delWf = (id: number) => setWorkflows((workflows as Workflow[]).filter(w => w.id !== id));
    const addWf = () => {
        if (!nw.name) return;
        setWorkflows([...(workflows as Workflow[]), { ...nw, id: Date.now(), runs: 0, lastRun: "Never" }]);
        setNw({ name: "", trigger: TRIGGERS[0], condition: "", actions: [""], status: "Active" });
    };
    const addAction = () => setNw({ ...nw, actions: [...nw.actions, ""] });
    const updAction = (i: number, val: string) => { const a = [...nw.actions]; a[i] = val; setNw({ ...nw, actions: a }); };

    const sorted = [...(workflows as Workflow[])].sort((a, b) => b.lastRun.localeCompare(a.lastRun));

    return (
        <Tabs tabs={["Active Workflows", "Create Workflow", "Templates", "Automation Log"]}>
            {/* ─ Active Workflows ─ */}
            <div>
                <div className="axiom-grid-4" style={{ marginBottom: 14 }}>
                    <KPI label="Total Workflows" value={(workflows as Workflow[]).length} />
                    <KPI label="Active" value={(workflows as Workflow[]).filter(w => w.status === "Active").length} color="var(--c-green)" />
                    <KPI label="Total Runs" value={(workflows as Workflow[]).reduce((s, w) => s + w.runs, 0)} color="var(--c-gold)" />
                    <KPI label="Last Run" value={sorted[0]?.lastRun || "Never"} color="var(--c-dim)" />
                </div>
                {(workflows as Workflow[]).map(w => (
                    <Card key={w.id} title={w.name} action={
                        <div className="axiom-flex-row" style={{ gap: 6 }}>
                            <Badge label={w.status} color={w.status === "Active" ? "var(--c-green)" : "var(--c-amber)"} />
                            <Button label={w.status === "Active" ? "Pause" : "Resume"} onClick={() => toggle(w.id)} />
                            <Button label="×" onClick={() => delWf(w.id)} />
                        </div>
                    }>
                        <div className="axiom-grid-3">
                            <div>
                                <div className="axiom-text-10-dim" style={{ letterSpacing: 1, textTransform: "uppercase", marginBottom: 3 }}>Trigger</div>
                                <div style={{ fontSize: 12, color: "var(--c-blue)" }}>{w.trigger}</div>
                            </div>
                            <div>
                                <div className="axiom-text-10-dim" style={{ letterSpacing: 1, textTransform: "uppercase", marginBottom: 3 }}>Condition</div>
                                <div style={{ fontSize: 12, color: "var(--c-sub)" }}>{w.condition}</div>
                            </div>
                            <div>
                                <div className="axiom-text-10-dim" style={{ letterSpacing: 1, textTransform: "uppercase", marginBottom: 3 }}>Runs / Last</div>
                                <div style={{ fontSize: 12, color: "var(--c-gold)" }}>{w.runs} runs · {w.lastRun}</div>
                            </div>
                        </div>
                        <div style={{ marginTop: 8 }}>
                            <div className="axiom-text-10-dim" style={{ letterSpacing: 1, textTransform: "uppercase", marginBottom: 4 }}>Actions</div>
                            {w.actions.map((a, i) => (
                                <div key={i} className="axiom-flex-row axiom-text-12-sub" style={{ gap: 6, padding: "2px 0" }}>
                                    <span style={{ color: "var(--c-gold)" }}>{i + 1}.</span>{a}
                                </div>
                            ))}
                        </div>
                    </Card>
                ))}
            </div>

            {/* ─ Create Workflow ─ */}
            <div>
                <Card title="Create New Workflow">
                    <div className="axiom-grid-2" style={{ marginBottom: 10 }}>
                        <Field label="Workflow Name"><input className="axiom-input" value={nw.name} onChange={e => setNw({ ...nw, name: e.target.value })} placeholder="e.g., Deal Stage Alert" /></Field>
                        <Field label="Trigger"><select className="axiom-select" value={nw.trigger} onChange={e => setNw({ ...nw, trigger: e.target.value })}>{TRIGGERS.map(t => <option key={t}>{t}</option>)}</select></Field>
                    </div>
                    <Field label="Condition"><input className="axiom-input" value={nw.condition} onChange={e => setNw({ ...nw, condition: e.target.value })} placeholder="When specific conditions are met..." /></Field>
                    <div className="axiom-text-10-dim" style={{ letterSpacing: 2, textTransform: "uppercase", margin: "10px 0 6px" }}>Actions (executed in order)</div>
                    {nw.actions.map((a, i) => (
                        <Field key={i} label={`Action ${i + 1}`}><input className="axiom-input" value={a} onChange={e => updAction(i, e.target.value)} placeholder="What should happen..." /></Field>
                    ))}
                    <div className="axiom-flex-row" style={{ gap: 8, marginTop: 10 }}>
                        <Button label="+ Add Action" onClick={addAction} />
                        <Button variant="gold" label="Save Workflow" onClick={addWf} />
                    </div>
                </Card>
            </div>

            {/* ─ Templates ─ */}
            <div>
                <Card title="Pre-Built Templates">
                    {TEMPLATES.map((t, i) => (
                        <div key={i} className="axiom-flex-between" style={{ padding: "10px 0", borderBottom: "1px solid var(--c-border)" }}>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: 13, color: "var(--c-text)" }}>{t.name}</div>
                                <div className="axiom-text-10-dim">{t.condition}</div>
                            </div>
                            <Button variant="gold" label="Use Template" onClick={() => setNw({ name: t.name, trigger: t.trigger, condition: t.condition, actions: t.actions, status: "Active" })} />
                        </div>
                    ))}
                </Card>
            </div>

            {/* ─ Automation Log ─ */}
            <div>
                <Card title="Recent Automation Activity">
                    {LOG_ENTRIES.map(([name, detail, time, color], i) => (
                        <div key={i} className="axiom-flex-row" style={{ gap: 10, padding: "8px 0", borderBottom: "1px solid var(--c-border)" }}>
                            <div style={{ width: 8, height: 8, borderRadius: 4, background: color as string, flexShrink: 0, marginTop: 4 }} />
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: 12, color: "var(--c-text)" }}>{name as string}</div>
                                <div className="axiom-text-10-dim">{detail as string}</div>
                            </div>
                            <span className="axiom-text-10-dim">{time as string}</span>
                        </div>
                    ))}
                </Card>
            </div>
        </Tabs>
    );
}
