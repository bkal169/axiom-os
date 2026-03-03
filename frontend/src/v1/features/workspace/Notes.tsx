import { useState } from "react";
import { Card, Field, Badge, Button } from "../../components/ui/components";
import { Tabs } from "../../components/ui/layout";
import { Agent } from "../agents/Agent";
import { useLS } from "../../hooks/useLS";

const CATS = ["All", "Due Diligence", "Meeting Notes", "Research", "Legal", "Site Analysis", "Financial", "Personal", "General"];

interface Note {
    id: number;
    title: string;
    content: string;
    deal: string;
    category: string;
    pinned: boolean;
    created: string;
    modified: string;
}

export function Notes() {
    const [notes, setNotes] = useLS<Note[]>("axiom_notes", []);
    const [filterCat, setFilterCat] = useState("All");
    const [search, setSearch] = useState("");
    const [editing, setEditing] = useState<number | null>(null);
    const [nn, setNn] = useState({ title: "", content: "", deal: "", category: "General", pinned: false });

    const filtered = (notes as Note[]).filter(n => {
        if (search && !n.title.toLowerCase().includes(search.toLowerCase()) && !n.content.toLowerCase().includes(search.toLowerCase())) return false;
        if (filterCat !== "All" && n.category !== filterCat) return false;
        return true;
    }).sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0) || new Date(b.modified).getTime() - new Date(a.modified).getTime());

    const addNote = () => {
        if (!nn.title) return;
        const now = new Date().toISOString().split("T")[0];
        const newNote: Note = { ...nn, id: Date.now(), created: now, modified: now };
        setNotes([...(notes as Note[]), newNote]);
        setNn({ title: "", content: "", deal: "", category: "General", pinned: false });
    };

    const updNote = (id: number, field: string, val: string | boolean) => {
        setNotes((notes as Note[]).map(n => n.id === id ? { ...n, [field]: val, modified: new Date().toISOString().split("T")[0] } : n));
    };

    const delNote = (id: number) => setNotes((notes as Note[]).filter(n => n.id !== id));

    return (
        <Tabs tabs={["All Notes", "New Note", "AI Summary"]}>
            {/* ─ All Notes ─ */}
            <div>
                <div className="axiom-flex-row" style={{ marginBottom: 14, gap: 8 }}>
                    <input className="axiom-input" style={{ flex: 1 }} value={search} onChange={e => setSearch(e.target.value)} placeholder="Search notes..." />
                    <select className="axiom-select" style={{ width: 140 }} value={filterCat} onChange={e => setFilterCat(e.target.value)}>
                        {CATS.map(c => <option key={c}>{c}</option>)}
                    </select>
                </div>
                {filtered.length === 0 && (
                    <div className="axiom-text-12-dim" style={{ textAlign: "center", padding: 40 }}>No notes yet. Create your first note in the "New Note" tab.</div>
                )}
                {filtered.map(n => (
                    <Card key={n.id} title={n.title} action={
                        <div className="axiom-flex-row" style={{ gap: 6 }}>
                            {n.pinned && <Badge label="Pinned" color="var(--c-gold)" />}
                            <Badge label={n.category} color="var(--c-blue)" />
                            <Button label={editing === n.id ? "Close" : "Edit"} onClick={() => setEditing(editing === n.id ? null : n.id)} />
                            <Button label={n.pinned ? "Unpin" : "Pin"} onClick={() => updNote(n.id, "pinned", !n.pinned)} />
                            <Button label="×" onClick={() => delNote(n.id)} />
                        </div>
                    }>
                        {editing === n.id ? (
                            <div>
                                <Field label="Title"><input className="axiom-input" value={n.title} onChange={e => updNote(n.id, "title", e.target.value)} /></Field>
                                <Field label="Category">
                                    <select className="axiom-select" value={n.category} onChange={e => updNote(n.id, "category", e.target.value)}>
                                        {CATS.filter(c => c !== "All").map(c => <option key={c}>{c}</option>)}
                                    </select>
                                </Field>
                                <Field label="Content">
                                    <textarea className="axiom-textarea" style={{ height: 200, fontFamily: "'Courier New',monospace", fontSize: 13 }} value={n.content} onChange={e => updNote(n.id, "content", e.target.value)} />
                                </Field>
                            </div>
                        ) : (
                            <div>
                                <div className="axiom-flex-row axiom-text-10-dim" style={{ gap: 12, marginBottom: 8 }}>
                                    <span>Category: {n.category}</span>
                                    <span>Created: {n.created}</span>
                                    <span>Modified: {n.modified}</span>
                                </div>
                                <pre style={{ margin: 0, whiteSpace: "pre-wrap", fontFamily: "'Courier New',monospace", fontSize: 13, color: "var(--c-sub)", lineHeight: 1.6 }}>{n.content}</pre>
                            </div>
                        )}
                    </Card>
                ))}
            </div>

            {/* ─ New Note ─ */}
            <div>
                <Card title="Create New Note">
                    <div className="axiom-grid-2" style={{ marginBottom: 12 }}>
                        <Field label="Title"><input className="axiom-input" value={nn.title} onChange={e => setNn({ ...nn, title: e.target.value })} placeholder="Note title..." /></Field>
                        <Field label="Category">
                            <select className="axiom-select" value={nn.category} onChange={e => setNn({ ...nn, category: e.target.value })}>
                                {CATS.filter(c => c !== "All").map(c => <option key={c}>{c}</option>)}
                            </select>
                        </Field>
                    </div>
                    <Field label="Content">
                        <textarea className="axiom-textarea" style={{ height: 200, fontFamily: "'Courier New',monospace", fontSize: 13 }} value={nn.content} onChange={e => setNn({ ...nn, content: e.target.value })} placeholder="Write your note here..." />
                    </Field>
                    <div className="axiom-flex-row" style={{ gap: 10, marginTop: 10. }}>
                        <Button variant="gold" label="Save Note" onClick={addNote} />
                        <label className="axiom-flex-row axiom-text-11-dim" style={{ gap: 6, cursor: "pointer" }}>
                            <input type="checkbox" checked={nn.pinned} onChange={e => setNn({ ...nn, pinned: e.target.checked })} />
                            Pin this note
                        </label>
                    </div>
                </Card>
            </div>

            {/* ─ AI Summary ─ */}
            <div>
                <Card title="AI Note Summary">
                    <Agent id="NotesAI" system={`You are a note-taking assistant for a real estate developer. The user has ${(notes as Note[]).length} notes. Note titles: ${(notes as Note[]).map(n => n.title).join(", ")}.`} placeholder="Ask to summarize notes, extract action items, or find related info..." />
                </Card>
            </div>
        </Tabs>
    );
}
