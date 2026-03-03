import { useState, useCallback } from "react";
import { Card, Field, Badge, Button } from "../../components/ui/components";
import { Tabs } from "../../components/ui/layout";
import { useLS } from "../../hooks/useLS";

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const TYPES = ["Meeting", "Deadline", "Inspection", "Hearing", "Closing", "Review", "Reminder", "Personal"];
const EC: Record<string, string> = {
    Deadline: "var(--c-red)", Meeting: "var(--c-purple)", Inspection: "var(--c-amber)",
    Hearing: "var(--c-blue)", Closing: "var(--c-green)", Review: "var(--c-teal)",
    Reminder: "var(--c-gold)", Personal: "var(--c-dim)"
};

interface CalEvent {
    id: number;
    title: string;
    date: string;
    time: string;
    type: string;
    deal: string;
    color: string;
    notes: string;
    recurring: string;
}

const today = new Date();
const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

export function CalendarView() {
    const [year, setYear] = useState(today.getFullYear());
    const [month, setMonth] = useState(today.getMonth());
    const [selDay, setSelDay] = useState(today.getDate());
    const [events, setEvents] = useLS<CalEvent[]>("axiom_cal_events", [
        { id: 1, title: "Sunset Ridge - LOI Due", date: `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-28`, time: "17:00", type: "Deadline", deal: "Sunset Ridge", color: "var(--c-red)", notes: "Final LOI submission", recurring: "" },
        { id: 2, title: "IC Committee Meeting", date: `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-15`, time: "10:00", type: "Meeting", deal: "Ridgecrest Heights", color: "var(--c-purple)", notes: "Investment committee review", recurring: "" },
    ]);
    const [ne, setNe] = useState({ title: "", date: "", time: "09:00", type: "Meeting", deal: "", color: "var(--c-blue)", notes: "", recurring: "" });
    const [showQuickAdd, setShowQuickAdd] = useState(false);
    const [editingEvent, setEditingEvent] = useState<number | null>(null);

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    const dStr = useCallback((d: number) => `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`, [year, month]);
    const dayEvents = useCallback((d: number) => (events as CalEvent[]).filter(e => e.date === dStr(d)), [events, dStr]);

    const prevMonth = () => { if (month === 0) { setMonth(11); setYear(y => y - 1); } else setMonth(m => m - 1); };
    const nextMonth = () => { if (month === 11) { setMonth(0); setYear(y => y + 1); } else setMonth(m => m + 1); };

    const addEvent = () => {
        if (!ne.title || !ne.date) return;
        const newEvt: CalEvent = { ...ne, id: Date.now() };
        setEvents([...(events as CalEvent[]), newEvt]);
        setNe({ title: "", date: "", time: "09:00", type: "Meeting", deal: "", color: "var(--c-blue)", notes: "", recurring: "" });
        setShowQuickAdd(false);
    };
    const delEvent = (id: number) => setEvents((events as CalEvent[]).filter(e => e.id !== id));
    const updEvent = (id: number, field: string, val: string) => setEvents((events as CalEvent[]).map(e => e.id === id ? { ...e, [field]: val } : e));

    const onDayClick = (d: number) => { setSelDay(d); setShowQuickAdd(true); setNe(prev => ({ ...prev, date: dStr(d) })); setEditingEvent(null); };
    const selEvents = dayEvents(selDay);
    const upcomingEvents = (events as CalEvent[]).filter(e => e.date >= todayStr).sort((a, b) => a.date.localeCompare(b.date)).slice(0, 8);

    return (
        <Tabs tabs={["Month View", "Week View", "Agenda", "Add Event"]}>
            {/* ─ Month View ─ */}
            <div>
                <div className="axiom-flex-between" style={{ marginBottom: 14 }}>
                    <Button label="← Prev" onClick={prevMonth} />
                    <div style={{ fontSize: 18, color: "var(--c-gold)", fontWeight: 700 }}>{MONTHS[month]} {year}</div>
                    <Button label="Next →" onClick={nextMonth} />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 1, marginBottom: 14 }}>
                    {DAYS.map(d => <div key={d} style={{ padding: 6, textAlign: "center", fontSize: 9, color: "var(--c-dim)", letterSpacing: 2, textTransform: "uppercase", background: "var(--c-bg2)" }}>{d}</div>)}
                    {Array.from({ length: firstDay }, (_, i) => <div key={"e" + i} style={{ background: "var(--c-bg2)", minHeight: 80 }} />)}
                    {Array.from({ length: daysInMonth }, (_, i) => {
                        const d = i + 1; const evts = dayEvents(d); const isToday = dStr(d) === todayStr; const isSel = d === selDay;
                        return (
                            <div key={d} style={{ background: isSel ? "var(--c-bg3)" : "var(--c-bg2)", border: `1px solid ${isToday ? "var(--c-gold)" : isSel ? "var(--c-border2)" : "var(--c-border)"}`, minHeight: 80, padding: 4, cursor: "pointer" }} onClick={() => onDayClick(d)}>
                                <div style={{ fontSize: 13, color: isToday ? "var(--c-gold)" : "var(--c-text)", fontWeight: isToday ? 700 : 400 }}>{d}</div>
                                {evts.slice(0, 3).map(e => (
                                    <div key={e.id} style={{ fontSize: 9, padding: "1px 4px", borderRadius: 2, marginTop: 2, background: (e.color || "var(--c-blue)") + "22", color: e.color || "var(--c-blue)", overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>
                                        {e.time?.substring(0, 5)} {e.title}
                                    </div>
                                ))}
                                {evts.length > 3 && <div style={{ fontSize: 8, color: "var(--c-dim)", marginTop: 1 }}>+{evts.length - 3} more</div>}
                            </div>
                        );
                    })}
                </div>
                <Card title={`${MONTHS[month]} ${selDay} — ${selEvents.length} event${selEvents.length !== 1 ? "s" : ""}`} action={
                    <Button label={showQuickAdd ? "Cancel" : "+ Add Event"} variant={showQuickAdd ? "ghost" : "gold"} onClick={() => { setShowQuickAdd(v => !v); setEditingEvent(null); }} />
                }>
                    {showQuickAdd && (
                        <div style={{ paddingBottom: 12, marginBottom: 12, borderBottom: "1px solid var(--c-border)" }}>
                            <div className="axiom-grid-3" style={{ marginBottom: 8 }}>
                                <Field label="Title"><input className="axiom-input" value={ne.title} onChange={e => setNe(p => ({ ...p, title: e.target.value }))} placeholder="Event title..." /></Field>
                                <Field label="Time"><input className="axiom-input" type="time" value={ne.time} onChange={e => setNe(p => ({ ...p, time: e.target.value }))} /></Field>
                                <Field label="Type"><select className="axiom-select" value={ne.type} onChange={e => setNe(p => ({ ...p, type: e.target.value, color: EC[e.target.value] || "var(--c-blue)" }))}>{TYPES.map(t => <option key={t}>{t}</option>)}</select></Field>
                            </div>
                            <Field label="Deal"><input className="axiom-input" value={ne.deal} onChange={e => setNe(p => ({ ...p, deal: e.target.value }))} placeholder="Linked deal..." /></Field>
                            <Button variant="gold" label={`Add to ${MONTHS[month]} ${selDay}`} onClick={addEvent} />
                        </div>
                    )}
                    {selEvents.map(e => (
                        <div key={e.id} className="axiom-flex-row" style={{ gap: 10, padding: "8px 0", borderBottom: "1px solid var(--c-border)" }}>
                            <div style={{ width: 4, height: 30, background: e.color || "var(--c-blue)", borderRadius: 2, flexShrink: 0 }} />
                            <div style={{ flex: 1 }}>
                                {editingEvent === e.id ? (
                                    <div className="axiom-grid-3">
                                        <Field label="Title"><input className="axiom-input" value={e.title} onChange={ev => updEvent(e.id, "title", ev.target.value)} /></Field>
                                        <Field label="Time"><input className="axiom-input" type="time" value={e.time} onChange={ev => updEvent(e.id, "time", ev.target.value)} /></Field>
                                        <Field label="Type"><select className="axiom-select" value={e.type} onChange={ev => { updEvent(e.id, "type", ev.target.value); updEvent(e.id, "color", EC[ev.target.value] || "var(--c-blue)"); }}>{TYPES.map(t => <option key={t}>{t}</option>)}</select></Field>
                                    </div>
                                ) : (
                                    <div>
                                        <div style={{ fontSize: 13, color: "var(--c-text)", fontWeight: 600 }}>{e.title}</div>
                                        <div className="axiom-flex-row axiom-text-10-dim" style={{ gap: 8, marginTop: 2 }}>
                                            <span>{e.time}</span><Badge label={e.type} color={EC[e.type] || "var(--c-blue)"} />{e.deal && <span>Deal: {e.deal}</span>}
                                        </div>
                                        {e.notes && <div className="axiom-text-12-dim" style={{ marginTop: 4 }}>{e.notes}</div>}
                                    </div>
                                )}
                            </div>
                            <div className="axiom-flex-row" style={{ gap: 4 }}>
                                <Button label={editingEvent === e.id ? "✓" : "Edit"} onClick={() => setEditingEvent(editingEvent === e.id ? null : e.id)} />
                                <Button label="×" onClick={() => delEvent(e.id)} />
                            </div>
                        </div>
                    ))}
                    {!selEvents.length && !showQuickAdd && <div className="axiom-text-12-dim" style={{ fontStyle: "italic" }}>No events. Click "+ Add Event" to create one.</div>}
                </Card>
            </div>

            {/* ─ Week View ─ */}
            <div>
                <div style={{ fontSize: 14, color: "var(--c-gold)", fontWeight: 700, marginBottom: 14 }}>
                    Week of {MONTHS[month]} {Math.max(1, selDay - new Date(year, month, selDay).getDay())}–{Math.min(daysInMonth, selDay - new Date(year, month, selDay).getDay() + 6)}, {year}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 4 }}>
                    {Array.from({ length: 7 }, (_, i) => {
                        const startOfWeek = selDay - new Date(year, month, selDay).getDay();
                        const d = Math.max(1, Math.min(daysInMonth, startOfWeek + i));
                        return (
                            <div key={i} style={{ background: "var(--c-bg3)", border: "1px solid var(--c-border)", borderRadius: 3, padding: 8, minHeight: 200 }}>
                                <div className="axiom-text-10-dim" style={{ letterSpacing: 1, textTransform: "uppercase" }}>{DAYS[i]}</div>
                                <div style={{ fontSize: 16, color: d === selDay ? "var(--c-gold)" : "var(--c-text)", fontWeight: 700, marginBottom: 6 }}>{d}</div>
                                {dayEvents(d).map(e => (
                                    <div key={e.id} style={{ fontSize: 10, padding: 4, borderRadius: 2, marginBottom: 3, background: (e.color || "var(--c-blue)") + "22", borderLeft: `2px solid ${e.color || "var(--c-blue)"}` }}>
                                        <div style={{ fontWeight: 600, color: "var(--c-text)" }}>{e.time?.substring(0, 5)}</div>
                                        <div style={{ color: "var(--c-sub)" }}>{e.title}</div>
                                    </div>
                                ))}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* ─ Agenda ─ */}
            <div>
                <Card title="Upcoming Events" action={<Badge label={`${upcomingEvents.length} upcoming`} color="var(--c-gold)" />}>
                    {upcomingEvents.map(e => (
                        <div key={e.id} className="axiom-flex-row" style={{ gap: 12, padding: "10px 0", borderBottom: "1px solid var(--c-border)" }}>
                            <div style={{ width: 4, background: e.color || "var(--c-blue)", borderRadius: 2, alignSelf: "stretch" }} />
                            <div style={{ width: 70, flexShrink: 0 }}>
                                <div style={{ fontSize: 12, color: "var(--c-gold)", fontWeight: 600 }}>{e.date.substring(5)}</div>
                                <div className="axiom-text-10-dim">{e.time}</div>
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: 13, color: "var(--c-text)", fontWeight: 600 }}>{e.title}</div>
                                <div className="axiom-flex-row axiom-text-10-dim" style={{ gap: 8, marginTop: 2 }}>
                                    <Badge label={e.type} color={EC[e.type] || "var(--c-blue)"} />
                                    {e.deal && <span>Deal: {e.deal}</span>}
                                </div>
                                {e.notes && <div className="axiom-text-12-dim" style={{ marginTop: 3 }}>{e.notes}</div>}
                            </div>
                            <Button label="×" onClick={() => delEvent(e.id)} />
                        </div>
                    ))}
                    {!upcomingEvents.length && <div className="axiom-text-12-dim" style={{ padding: 20, textAlign: "center" }}>No upcoming events.</div>}
                </Card>
            </div>

            {/* ─ Add Event ─ */}
            <div>
                <Card title="Add New Event">
                    <div className="axiom-grid-3" style={{ marginBottom: 12 }}>
                        <Field label="Event Title"><input className="axiom-input" value={ne.title} onChange={e => setNe(p => ({ ...p, title: e.target.value }))} placeholder="Meeting with broker..." /></Field>
                        <Field label="Date"><input className="axiom-input" type="date" value={ne.date} onChange={e => setNe(p => ({ ...p, date: e.target.value }))} /></Field>
                        <Field label="Time"><input className="axiom-input" type="time" value={ne.time} onChange={e => setNe(p => ({ ...p, time: e.target.value }))} /></Field>
                        <Field label="Type"><select className="axiom-select" value={ne.type} onChange={e => setNe(p => ({ ...p, type: e.target.value, color: EC[e.target.value] || "var(--c-blue)" }))}>{TYPES.map(t => <option key={t}>{t}</option>)}</select></Field>
                        <Field label="Linked Deal"><input className="axiom-input" value={ne.deal} onChange={e => setNe(p => ({ ...p, deal: e.target.value }))} placeholder="e.g. Sunset Ridge" /></Field>
                        <Field label="Recurring">
                            <select className="axiom-select" value={ne.recurring} onChange={e => setNe(p => ({ ...p, recurring: e.target.value }))}>
                                <option value="">None</option>
                                <option value="daily">Daily</option>
                                <option value="weekly">Weekly</option>
                                <option value="biweekly">Bi-weekly</option>
                                <option value="monthly">Monthly</option>
                            </select>
                        </Field>
                    </div>
                    <Field label="Notes">
                        <textarea className="axiom-textarea" style={{ height: 60 }} value={ne.notes} onChange={e => setNe(p => ({ ...p, notes: e.target.value }))} placeholder="Meeting agenda, preparation notes..." />
                    </Field>
                    <Button variant="gold" label="Add Event" onClick={addEvent} />
                </Card>
            </div>
        </Tabs>
    );
}
