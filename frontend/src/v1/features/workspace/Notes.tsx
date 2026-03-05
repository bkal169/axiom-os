import { useState } from "react";
import { Card, Field, Badge, Button, FileAttachment } from "../../components/ui/components";
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
                <div className="axiom-flex-gap-8 axiom-mb-14">
                    <input className="axiom-input axiom-flex-1" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search notes..." title="Search Notes" />
                    <select className="axiom-select axiom-w-140" value={filterCat} onChange={e => setFilterCat(e.target.value)} title="Filter by Category">
                        {CATS.map(c => <option key={c}>{c}</option>)}
                    </select>
                </div>
                {filtered.length === 0 && (
                    <div className="axiom-text-12-dim axiom-text-center axiom-p-40">No notes yet. Create your first note in the "New Note" tab.</div>
                )}
                {filtered.map(n => (
                    <Card key={n.id} title={n.title} action={
                        <div className="axiom-flex-gap-6">
                            {n.pinned && <Badge label="Pinned" color="var(--c-gold)" />}
                            <Badge label={n.category} color="var(--c-blue)" />
                            <Button label={editing === n.id ? "Close" : "Edit"} onClick={() => setEditing(editing === n.id ? null : n.id)} />
                            <Button label={n.pinned ? "Unpin" : "Pin"} onClick={() => updNote(n.id, "pinned", !n.pinned)} />
                            <Button label="×" onClick={() => delNote(n.id)} className="axiom-p-0" />
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
                                    <textarea className="axiom-textarea axiom-mono-13" style={{ height: 200 }} value={n.content} onChange={e => updNote(n.id, "content", e.target.value)} title="Note Content" />
                                </Field>
                            </div>
                        ) : (
                            <div>
                                <div className="axiom-flex-gap-12 axiom-mb-8 axiom-text-10-dim">
                                    <span>Category: {n.category}</span>
                                    <span>Created: {n.created}</span>
                                    <span>Modified: {n.modified}</span>
                                </div>
                                <pre className="axiom-m-0 axiom-mono-13 color-sub" style={{ whiteSpace: "pre-wrap" }}>{n.content}</pre>
                                <FileAttachment context={`notes/${n.id}`} />
                            </div>
                        )}
                    </Card>
                ))}
            </div>

            {/* ─ New Note ─ */}
            <div>
                <Card title="Create New Note">
                    <div className="axiom-grid-2 axiom-mb-12">
                        <Field label="Title"><input className="axiom-input" value={nn.title} onChange={e => setNn({ ...nn, title: e.target.value })} placeholder="Note title..." title="Note Title" /></Field>
                        <Field label="Category">
                            <select className="axiom-select" value={nn.category} onChange={e => setNn({ ...nn, category: e.target.value })}>
                                {CATS.filter(c => c !== "All").map(c => <option key={c}>{c}</option>)}
                            </select>
                        </Field>
                    </div>
                    <Field label="Content">
                        <textarea className="axiom-textarea axiom-mono-13" style={{ height: 200 }} value={nn.content} onChange={e => setNn({ ...nn, content: e.target.value })} placeholder="Write your note here..." title="Note Content" />
                    </Field>
                    <div className="axiom-flex-gap-10 axiom-mt-10">
                        <Button variant="gold" label="Save Note" onClick={addNote} />
                        <label className="axiom-flex-gap-6 axiom-text-11-dim axiom-cursor-pointer">
                            <input type="checkbox" checked={nn.pinned} onChange={e => setNn({ ...nn, pinned: e.target.checked })} title="Pin Note" className="axiom-checkbox" />
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
