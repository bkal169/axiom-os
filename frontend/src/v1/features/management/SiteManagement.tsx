import { useState } from "react";
import { Card, KPI, Field, Badge, Button } from "../../components/ui/components";
import { Tabs } from "../../components/ui/layout";
import { useProject } from "../../context/ProjectContext";

const STATUSES = ["Planned", "In Progress", "Complete", "Blocked"];
const PRIORITIES = ["Low", "Medium", "High", "Critical"];
const CATS = ["General", "Grading", "Utilities", "Survey", "Concrete", "Landscaping", "Inspection", "Permitting"];

const STAT_COL: Record<string, string> = {
    Planned: "var(--c-blue)", "In Progress": "var(--c-gold)", Complete: "var(--c-green)", Blocked: "var(--c-red)"
};
const PRI_COL: Record<string, string> = {
    Low: "var(--c-dim)", Medium: "var(--c-blue)", High: "var(--c-amber)", Critical: "var(--c-red)"
};

export function SiteManagement() {
    const { siteTasks = [], setSiteTasks } = useProject() as any;
    const [showAdd, setShowAdd] = useState(false);
    const [newTask, setNewTask] = useState({
        title: "", status: "Planned", priority: "High", assignee: "", due_date: "", category: "General"
    });

    const addTask = () => {
        if (!newTask.title) return;
        setSiteTasks((prev: any[]) => [...prev, { ...newTask, id: Date.now().toString(), progress: 0 }]);
        setNewTask({ title: "", status: "Planned", priority: "High", assignee: "", due_date: "", category: "General" });
        setShowAdd(false);
    };

    const updateTask = (id: string, patch: any) =>
        setSiteTasks((prev: any[]) => prev.map(t => t.id === id ? { ...t, ...patch } : t));
    const removeTask = (id: string) =>
        setSiteTasks((prev: any[]) => prev.filter(t => t.id !== id));

    return (
        <Tabs tabs={["Development Schedule", "Daily Logs", "RFIs & Submittals"]}>
            {/* ─ Schedule ─ */}
            <div>
                <Card title="Site Task Tracker" action={<Button variant="gold" label="+ Add Task" onClick={() => setShowAdd(v => !v)} />}>
                    {showAdd && (
                        <div className="axiom-grid-3" style={{ gap: 10, padding: 14, background: "var(--c-bg3)", borderRadius: 4, marginBottom: 12, border: "1px solid var(--c-border)" }}>
                            <Field label="Task Title"><input className="axiom-input" value={newTask.title} onChange={e => setNewTask(p => ({ ...p, title: e.target.value }))} placeholder="e.g. Mass Grading" /></Field>
                            <Field label="Category"><select className="axiom-select" value={newTask.category} onChange={e => setNewTask(p => ({ ...p, category: e.target.value }))}>{CATS.map(o => <option key={o}>{o}</option>)}</select></Field>
                            <Field label="Priority"><select className="axiom-select" value={newTask.priority} onChange={e => setNewTask(p => ({ ...p, priority: e.target.value }))}>{PRIORITIES.map(o => <option key={o}>{o}</option>)}</select></Field>
                            <Field label="Status"><select className="axiom-select" value={newTask.status} onChange={e => setNewTask(p => ({ ...p, status: e.target.value }))}>{STATUSES.map(o => <option key={o}>{o}</option>)}</select></Field>
                            <Field label="Due Date"><input className="axiom-input" type="date" value={newTask.due_date} onChange={e => setNewTask(p => ({ ...p, due_date: e.target.value }))} /></Field>
                            <Field label="Assignee"><input className="axiom-input" value={newTask.assignee} onChange={e => setNewTask(p => ({ ...p, assignee: e.target.value }))} placeholder="Name or crew" /></Field>
                            <div style={{ gridColumn: "1/-1", display: "flex", gap: 8, justifyContent: "flex-end" }}>
                                <Button label="Cancel" onClick={() => setShowAdd(false)} />
                                <Button variant="gold" label="Save Task" onClick={addTask} />
                            </div>
                        </div>
                    )}
                    <div style={{ padding: "6px 0" }}>
                        {siteTasks.length === 0 && <div className="axiom-text-12-dim" style={{ textAlign: "center", padding: 24 }}>No tasks yet. Add your first site task above.</div>}
                        {siteTasks.map((t: any) => {
                            const prog = t.status === "Complete" ? 100 : t.status === "Blocked" ? t.progress || 0 : t.progress || (t.status === "In Progress" ? 50 : 0);
                            return (
                                <div key={t.id} style={{ marginBottom: 14, padding: "10px 12px", background: "var(--c-bg2)", borderRadius: 4, border: "1px solid var(--c-border)" }}>
                                    <div className="axiom-flex-between" style={{ marginBottom: 6 }}>
                                        <div>
                                            <span style={{ color: "var(--c-text)", fontSize: 13, fontWeight: 600 }}>{t.title}</span>
                                            <Badge label={t.priority || "Medium"} color={PRI_COL[t.priority] || "var(--c-dim)"} />
                                            <Badge label={t.category || "General"} color="var(--c-blue)" />
                                        </div>
                                        <div className="axiom-flex-row" style={{ gap: 8 }}>
                                            <select className="axiom-select" style={{ padding: "2px 6px", fontSize: 10, width: "auto" }} value={t.status} onChange={e => updateTask(t.id, { status: e.target.value })}>
                                                {STATUSES.map(s => <option key={s}>{s}</option>)}
                                            </select>
                                            <button style={{ background: "none", border: "none", color: "var(--c-dim)", cursor: "pointer", fontSize: 16 }} onClick={() => removeTask(t.id)}>×</button>
                                        </div>
                                    </div>
                                    <div className="axiom-flex-row axiom-text-10-dim" style={{ gap: 16, marginBottom: 6 }}>
                                        {t.due_date && <span>📅 Due: {t.due_date}</span>}
                                        {t.assignee && <span>👤 {t.assignee}</span>}
                                    </div>
                                    <div style={{ height: 6, background: "var(--c-bg3)", borderRadius: 3, overflow: "hidden" }}>
                                        <div style={{ height: "100%", width: `${prog}%`, background: STAT_COL[t.status] || "var(--c-gold)", borderRadius: 3, transition: "width 0.3s" }} />
                                    </div>
                                    <div className="axiom-flex-row axiom-text-10-dim" style={{ gap: 8, marginTop: 6 }}>
                                        <span>Progress: {prog}%</span>
                                        <input type="range" min={0} max={100} value={prog} style={{ flex: 1, accentColor: "var(--c-gold)", height: 3 }}
                                            onChange={e => updateTask(t.id, { progress: +e.target.value, status: +e.target.value === 100 ? "Complete" : +e.target.value === 0 ? "Planned" : "In Progress" })} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </Card>
            </div>

            {/* ─ Daily Logs ─ */}
            <div>
                <Card title="Construction Daily Logs">
                    <div className="axiom-flex-row" style={{ gap: 10, marginBottom: 14 }}>
                        <KPI label="Workers on Site" value="12" />
                        <KPI label="Weather" value="Sunny / 72°F" />
                        <KPI label="Incidents" value="0" color="var(--c-green)" />
                    </div>
                    {[["Feb 24, 2025", "A+ Grading started mobilization. Geotech on site."], ["Feb 23, 2025", "Site fencing completed. Signage installed."], ["Feb 22, 2025", "Utility markups completed by city."]].map(([d, l], i) => (
                        <div key={i} style={{ padding: "10px 0", borderBottom: "1px solid var(--c-border)" }}>
                            <div style={{ fontSize: 10, color: "var(--c-gold)", fontWeight: 700 }}>{d}</div>
                            <div style={{ fontSize: 12, color: "var(--c-sub)", marginTop: 4 }}>{l}</div>
                        </div>
                    ))}
                </Card>
            </div>

            {/* ─ RFIs ─ */}
            <div>
                <Card title="RFIs & Submittals">
                    <div className="axiom-grid-2">
                        <div style={{ background: "var(--c-bg2)", border: "1px solid var(--c-border)", padding: 12, borderRadius: 4 }}>
                            <div className="axiom-text-10-dim-ls1" style={{ marginBottom: 4 }}>OPEN RFIS</div>
                            <div style={{ fontSize: 24, fontWeight: 700, color: "var(--c-amber)" }}>3</div>
                            <div className="axiom-text-10-dim" style={{ marginTop: 4 }}>Avg. Response: 1.4 days</div>
                        </div>
                        <div style={{ background: "var(--c-bg2)", border: "1px solid var(--c-border)", padding: 12, borderRadius: 4 }}>
                            <div className="axiom-text-10-dim-ls1" style={{ marginBottom: 4 }}>PENDING SUBMITTALS</div>
                            <div style={{ fontSize: 24, fontWeight: 700, color: "var(--c-gold)" }}>5</div>
                            <div className="axiom-text-10-dim" style={{ marginTop: 4 }}>Critical Path: 2 listed</div>
                        </div>
                    </div>
                </Card>
            </div>
        </Tabs>
    );
}
