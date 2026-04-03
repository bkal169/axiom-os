import { useState } from "react";
import { Card, AxiomTable, Badge, Button } from "../../components/ui/components";
import { useLS } from "../../hooks/useLS";

interface Document {
    id: string;
    name: string;
    category: string;
    phase: string;
    uploadedAt: string;
    size: string;
}

const CATEGORIES = ["LOI", "PSA", "Title Report", "Survey", "Environmental", "Engineering", "Legal", "Financial", "Other"] as const;
const PHASES = ["Pre-Acquisition", "Due Diligence", "Entitlement", "Construction", "Disposition"] as const;

const REQUIRED_DOCS: Record<string, string[]> = {
    "Pre-Acquisition": ["LOI", "PSA", "Financial"],
    "Due Diligence": ["Title Report", "Survey", "Environmental", "Engineering", "Financial"],
    "Entitlement": ["Survey", "Engineering", "Legal"],
    "Construction": ["Engineering", "Legal", "Financial"],
    "Disposition": ["Legal", "Financial"],
};

const CATEGORY_COLORS: Record<string, string> = {
    LOI: "var(--c-gold)", PSA: "var(--c-gold)", "Title Report": "var(--c-blue)",
    Survey: "var(--c-teal)", Environmental: "var(--c-green)", Engineering: "var(--c-purple)",
    Legal: "var(--c-amber)", Financial: "var(--c-blue)", Other: "var(--c-dim)",
};

export function DocumentVault() {
    const [docs, setDocs] = useLS<Document[]>("axiom_documents", []);
    const [showForm, setShowForm] = useState(false);
    const [newDoc, setNewDoc] = useState({ name: "", category: CATEGORIES[0], phase: PHASES[0] });
    const [activePhase, setActivePhase] = useState<string>("Due Diligence");

    const addDoc = () => {
        if (!newDoc.name.trim()) return;
        const doc: Document = {
            id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
            name: newDoc.name,
            category: newDoc.category,
            phase: newDoc.phase,
            uploadedAt: new Date().toISOString().split("T")[0],
            size: `${Math.floor(Math.random() * 5000 + 100)} KB`,
        };
        setDocs([...docs, doc]);
        setNewDoc({ name: "", category: CATEGORIES[0], phase: PHASES[0] });
        setShowForm(false);
    };

    const deleteDoc = (id: string) => {
        setDocs(docs.filter(d => d.id !== id));
    };

    // Required documents checklist for active phase
    const requiredForPhase = REQUIRED_DOCS[activePhase] ?? [];
    const existingCategories = new Set(docs.filter(d => d.phase === activePhase).map(d => d.category));

    return (
        <div>
            <Card title="Document Vault">
                <div className="axiom-flex-gap-12 axiom-mb-24">
                    <Button variant="gold" label="+ Add Document" onClick={() => setShowForm(true)} />
                </div>

                {showForm && (
                    <div className="axiom-bg-2 axiom-p-16 axiom-radius-6 axiom-mb-24" style={{ border: "1px solid var(--c-border)" }}>
                        <div className="axiom-grid-3" style={{ gap: 12, marginBottom: 12 }}>
                            <div>
                                <label className="axiom-label">Document Name</label>
                                <input className="axiom-input" value={newDoc.name} onChange={e => setNewDoc({ ...newDoc, name: e.target.value })} placeholder="e.g., Phase I ESA Report" title="Document Name" />
                            </div>
                            <div>
                                <label className="axiom-label">Category</label>
                                <select className="axiom-select" value={newDoc.category} onChange={e => setNewDoc({ ...newDoc, category: e.target.value })} title="Category">
                                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="axiom-label">Phase</label>
                                <select className="axiom-select" value={newDoc.phase} onChange={e => setNewDoc({ ...newDoc, phase: e.target.value })} title="Phase">
                                    {PHASES.map(p => <option key={p} value={p}>{p}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="axiom-flex-gap-12">
                            <Button variant="gold" label="Save Document" onClick={addDoc} />
                            <Button label="Cancel" onClick={() => setShowForm(false)} />
                        </div>
                    </div>
                )}

                <AxiomTable headers={["Name", "Category", "Phase", "Uploaded", "Size", ""]} emptyMessage="No documents uploaded. Click + Add Document to get started.">
                    {docs.map((doc) => (
                        <tr key={doc.id}>
                            <td className="axiom-td axiom-text-sub axiom-text-bold">{doc.name}</td>
                            <td className="axiom-td"><Badge label={doc.category} color={CATEGORY_COLORS[doc.category] ?? "var(--c-dim)"} /></td>
                            <td className="axiom-td"><Badge label={doc.phase} color="var(--c-blue)" /></td>
                            <td className="axiom-td axiom-text-10-dim">{doc.uploadedAt}</td>
                            <td className="axiom-td axiom-text-10-dim">{doc.size}</td>
                            <td className="axiom-td"><Button label="x" onClick={() => deleteDoc(doc.id)} className="axiom-btn-icon" /></td>
                        </tr>
                    ))}
                </AxiomTable>
            </Card>

            <Card title="Required Documents Checklist">
                <div className="axiom-flex-gap-6 axiom-mb-16">
                    {PHASES.map(phase => (
                        <button
                            key={phase}
                            onClick={() => setActivePhase(phase)}
                            className={activePhase === phase ? "axiom-btn axiom-btn-gold" : "axiom-btn"}
                            style={{ fontSize: 11, padding: "6px 12px" }}
                        >
                            {phase}
                        </button>
                    ))}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {requiredForPhase.map(cat => {
                        const hasDoc = existingCategories.has(cat);
                        return (
                            <div key={cat} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", borderRadius: 6, background: hasDoc ? "rgba(74, 222, 128, 0.06)" : "rgba(255,255,255,0.02)", border: `1px solid ${hasDoc ? "rgba(74,222,128,0.2)" : "var(--c-border)"}` }}>
                                <span style={{ fontSize: 14 }}>{hasDoc ? "\u2705" : "\u2B1C"}</span>
                                <span style={{ fontSize: 12, color: hasDoc ? "var(--c-green)" : "var(--c-muted)" }}>{cat}</span>
                                {!hasDoc && <span style={{ fontSize: 10, color: "var(--c-dim)", marginLeft: "auto" }}>Missing</span>}
                            </div>
                        );
                    })}
                    {requiredForPhase.length === 0 && (
                        <div style={{ fontSize: 12, color: "var(--c-dim)", padding: 12 }}>No required documents defined for this phase.</div>
                    )}
                </div>
            </Card>
        </div>
    );
}
