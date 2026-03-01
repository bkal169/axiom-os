import { useState } from "react";
import { useProjectState } from "../../hooks/useProjectState";
import { DD_CATS } from "../../context/ProjectContext"; // static data only, OK to keep
import { DEFAULT_PERMITS, DEFAULT_EVENTS } from "../../lib/defaults";
import { Card, Badge, Progress, CItem, Button, Field } from "../../components/ui/components";
import { Tabs } from "../../components/ui/layout";
import { Agent } from "../agents/Agent";

interface Props { projectId: string; }

const ALL_DD_COUNT = DD_CATS.reduce((acc, cat) => acc + cat.items.length, 0);

const PC: any = { Critical: "var(--c-red)", High: "var(--c-amber)", Medium: "var(--c-blue)", Low: "var(--c-dim)" };
const TC: any = { Milestone: "var(--c-gold)", Meeting: "var(--c-teal)", Submittal: "var(--c-blue)", Deadline: "var(--c-red)", Review: "var(--c-purple)" };
const PSC: any = { Approved: "var(--c-green)", "Under Review": "var(--c-blue)", "In Progress": "var(--c-amber)", Submitted: "var(--c-teal)", "Not Started": "var(--c-dim)", Denied: "var(--c-red)", "N/A": "var(--c-muted)" };
const PERM_OPTS = ["Not Started", "In Progress", "Submitted", "Under Review", "Approved", "Denied", "N/A"];

export function ProjectManagement({ projectId }: Props) {
    const { project, updateProject } = useProjectState(projectId);

    const ddChecks: Record<string, boolean> = project.ddChecks ?? {};
    const permits: any[] = project.permits ?? DEFAULT_PERMITS;
    const events: any[] = project.events ?? DEFAULT_EVENTS;

    const [ne, setNe] = useState({ title: "", date: "", type: "Milestone", priority: "Medium", notes: "" });

    // ── Due Diligence ─────────────────────────────────────────
    const toggleDD = (key: string) =>
        updateProject({ ddChecks: { ...ddChecks, [key]: !ddChecks[key] } });

    const doneCount = Object.values(ddChecks).filter(Boolean).length;

    // ── Permits ───────────────────────────────────────────────
    const updPerm = (i: number, k: string, v: any) => {
        const next = [...permits];
        next[i] = { ...next[i], [k]: v };
        updateProject({ permits: next });
    };

    // ── Events ────────────────────────────────────────────────
    const addEvent = () => {
        if (!ne.title.trim()) return;
        updateProject({ events: [...events, { ...ne, id: Date.now() }] });
        setNe({ title: "", date: "", type: "Milestone", priority: "Medium", notes: "" });
    };

    const removeEvent = (id: number) =>
        updateProject({ events: events.filter((e: any) => e.id !== id) });

    return (
        <div className="axiom-fade-in">
            <div className="axiom-flex-sb-center" style={{ marginBottom: 20 }}>
                <h2 className="axiom-text-18-gold-ls1" style={{ margin: 0 }}>PROJECT MANAGEMENT</h2>
                <Badge label="Execution Phase" color="var(--c-teal)" />
            </div>

            <Tabs tabs={["Due Diligence", "Permits & Approvals", "Project Calendar", "Documents"]}>

                {/* ── Tab 1: Due Diligence ─────────────────── */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 350px", gap: 20 }}>
                    <div>
                        <Card
                            title="Due Diligence Progress"
                            action={<Badge label={`${doneCount}/${ALL_DD_COUNT} Complete`} color={doneCount === ALL_DD_COUNT ? "var(--c-green)" : "var(--c-amber)"} />}
                        >
                            <div className="axiom-stack-20-mb">
                                <div className="axiom-flex-sb" style={{ marginBottom: 6 }}>
                                    <span className="axiom-text-11-dim">Overall Completion</span>
                                    <span className="axiom-text-14-gold-bold">{Math.round(doneCount / ALL_DD_COUNT * 100)}%</span>
                                </div>
                                <Progress value={doneCount / ALL_DD_COUNT * 100} />
                            </div>
                            {DD_CATS.map((cat, ci) => {
                                const catDone = cat.items.filter(item => ddChecks[`${ci}-${item.t}`]).length;
                                return (
                                    <div key={ci} className="axiom-stack-18-mb">
                                        <div className="axiom-flex-sb-center-p5-bb" style={{ marginBottom: 8 }}>
                                            <span className="axiom-text-10-gold-ls2-caps">{cat.cat}</span>
                                            <span className="axiom-text-10-dim">{catDone}/{cat.items.length}</span>
                                        </div>
                                        {cat.items.map((item, ii) => {
                                            const key = `${ci}-${item.t}`;
                                            return (
                                                <CItem
                                                    key={ii}
                                                    text={item.t}
                                                    checked={!!ddChecks[key]}
                                                    risk={item.r}
                                                    onChange={() => toggleDD(key)}
                                                />
                                            );
                                        })}
                                    </div>
                                );
                            })}
                        </Card>
                    </div>
                    <div>
                        <Card title="Due Diligence AI Agent">
                            <Agent id="Coordinator" system="You are a senior real estate due diligence coordinator. Help identify missing items and assess risks." placeholder="Ask about DD gaps..." />
                        </Card>
                    </div>
                </div>

                {/* ── Tab 2: Permits ───────────────────────── */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 350px", gap: 20 }}>
                    <div>
                        <Card title="Permits & Approvals">
                            <table className="axiom-table">
                                <thead>
                                    <tr>
                                        <th className="axiom-th-left-10-dim-p8-bb">PERMIT</th>
                                        <th className="axiom-th-left-10-dim-p8-bb">AGENCY</th>
                                        <th className="axiom-th-left-10-dim-p8-bb">STATUS</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {permits.map((p: any, i: number) => (
                                        <tr key={i}>
                                            <td className="axiom-td-13-p8-bb">{p.name}</td>
                                            <td className="axiom-td-12-dim-p8-bb">{p.agency}</td>
                                            <td className="axiom-td-p8-bb">
                                                <select
                                                    className="axiom-select-transparent"
                                                    style={{ color: PSC[p.status] }}
                                                    value={p.status}
                                                    onChange={e => updPerm(i, "status", e.target.value)}
                                                >
                                                    {PERM_OPTS.map(o => <option key={o} value={o}>{o}</option>)}
                                                </select>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </Card>
                    </div>
                    <div>
                        <Card title="Permit Timeline">
                            <div className="axiom-stack-15-pl10">
                                {permits.filter((p: any) => p.req).map((p: any, i: number) => (
                                    <div key={i} className="axiom-permit-timeline-item" style={{ borderLeftColor: PSC[p.status] || "var(--c-border)" }}>
                                        <div className="axiom-text-13-bold">{p.name}</div>
                                        <div className="axiom-text-11-dim">{p.agency} — {p.duration}</div>
                                        <Badge label={p.status} color={PSC[p.status]} />
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </div>
                </div>

                {/* ── Tab 3: Calendar ──────────────────────── */}
                <div>
                    <Card title="Project Calendar" action={<Badge label={`${events.length} Events`} color="var(--c-blue)" />}>
                        <table className="axiom-table">
                            <thead>
                                <tr>
                                    <th className="axiom-th-left-10-dim-p8-bb">EVENT</th>
                                    <th className="axiom-th-left-10-dim-p8-bb">DATE</th>
                                    <th className="axiom-th-left-10-dim-p8-bb">TYPE</th>
                                    <th className="axiom-th-left-10-dim-p8-bb">PRIORITY</th>
                                    <th className="axiom-th-right-10-dim-p8-bb">ACTION</th>
                                </tr>
                            </thead>
                            <tbody>
                                {[...events].sort((a: any, b: any) => a.date.localeCompare(b.date)).map((e: any) => (
                                    <tr key={e.id}>
                                        <td className="axiom-td-13-p8-bb">{e.title}</td>
                                        <td className="axiom-td-12-gold-mono-p8-bb">{e.date}</td>
                                        <td className="axiom-td-p8-bb"><Badge label={e.type} color={TC[e.type]} /></td>
                                        <td className="axiom-td-p8-bb"><Badge label={e.priority} color={PC[e.priority]} /></td>
                                        <td className="axiom-td-right-p8-bb">
                                            <Button onClick={() => removeEvent(e.id)}>×</Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </Card>

                    <Card title="Add Event / Deadline">
                        <div className="axiom-grid-4" style={{ gap: 15 }}>
                            <Field label="Title">
                                <input className="axiom-input" value={ne.title} onChange={e => setNe({ ...ne, title: e.target.value })} />
                            </Field>
                            <Field label="Date">
                                <input className="axiom-input" type="date" value={ne.date} onChange={e => setNe({ ...ne, date: e.target.value })} />
                            </Field>
                            <Field label="Type">
                                <select className="axiom-input" value={ne.type} onChange={e => setNe({ ...ne, type: e.target.value })}>
                                    {Object.keys(TC).map(t => <option key={t}>{t}</option>)}
                                </select>
                            </Field>
                            <div className="axiom-flex-end">
                                <Button variant="gold" onClick={addEvent}>Add Event</Button>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* ── Tab 4: Documents ─────────────────────── */}
                <Card title="Documents Binder">
                    <div className="axiom-empty-binder">
                        <div className="axiom-text-40" style={{ marginBottom: 10 }}>📁</div>
                        <div>Document management system initialization...</div>
                        <div className="axiom-text-11-dim" style={{ marginTop: 4 }}>Standard binder structure applied based on project jurisdiction.</div>
                    </div>
                </Card>

            </Tabs>
        </div>
    );
}
