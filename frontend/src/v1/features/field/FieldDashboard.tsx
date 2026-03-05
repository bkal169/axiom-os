import { useState } from "react";
import { Card, Button, KPI } from "../../components/ui/components";
import { useOfflineStore } from "../../hooks/useOfflineStore";
import { Camera, Mic, Save, CloudOff, Cloud } from "lucide-react";

export default function FieldDashboard() {
    const { data: fieldNotes, saveOffline, isOnline } = useOfflineStore<any[]>("field_notes", []);
    const [note, setNote] = useState("");

    const handleAddNote = () => {
        if (!note.trim()) return;
        const newNote = {
            id: Date.now(),
            text: note,
            timestamp: new Date().toISOString(),
            syncStatus: "pending"
        };
        saveOffline([...fieldNotes, newNote]);
        setNote("");
    };

    return (
        <div className="axiom-p-16 axiom-animate-fade">
            <div className="axiom-flex-sb-center axiom-mb-24">
                <div className="axiom-flex-col">
                    <h1 className="axiom-text-18-sub axiom-m-0">FIELD INTELLIGENCE</h1>
                    <div className="axiom-text-9 axiom-dim">IPAD PRO OPTIMIZED INTERFACE</div>
                </div>
                <div className={`axiom-badge ${isOnline ? "axiom-badge-teal" : "axiom-badge-amber"}`}>
                    {isOnline ? <Cloud size={10} style={{ marginRight: 6 }} /> : <CloudOff size={10} style={{ marginRight: 6 }} />}
                    <span>{isOnline ? "STABLE SIGNAL" : "OFFLINE ENGINE ACTIVE"}</span>
                </div>
            </div>

            <div className="axiom-grid-3 axiom-mb-24">
                <KPI label="Queue" value={fieldNotes.filter(n => n.syncStatus === "pending").length} color="var(--c-amber)" />
                <KPI label="Field Time" value="12.4h" sub="Session" />
                <KPI label="Location" value="Lat: 40.7, Lon: -74.0" sub="Site A-4" />
            </div>

            <Card title="SITE OBSERVATION" className="axiom-mb-24">
                <div className="axiom-flex-col axiom-gap-16">
                    <textarea
                        className="axiom-input axiom-field-textarea"
                        placeholder="Log site condition or deal markers..."
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                    />

                    <div className="axiom-grid-2">
                        <Button variant="ghost" className="axiom-flex-center axiom-field-btn-large">
                            <Camera size={20} /> <span>QUICK SHOT</span>
                        </Button>
                        <Button variant="ghost" className="axiom-flex-center axiom-field-btn-large">
                            <Mic size={20} /> <span>VOICE LOG</span>
                        </Button>
                    </div>

                    <Button variant="gold" className="axiom-full-width axiom-field-btn-save" onClick={handleAddNote}>
                        <Save size={18} style={{ marginRight: 10 }} /> CAPTURE DATA
                    </Button>
                </div>
            </Card>

            <Card title="SYNC LEDGER">
                <div className="axiom-flex-col axiom-gap-12">
                    {fieldNotes.length === 0 ? (
                        <div className="axiom-text-center axiom-py-40 axiom-text-dim axiom-mono-13">NO CACHED OBSERVATIONS</div>
                    ) : (
                        fieldNotes.slice().reverse().map((n) => (
                            <div key={n.id} className="axiom-bg axiom-p-16 axiom-radius-6 axiom-field-observation">
                                <div className="axiom-flex-sb-center axiom-mb-10">
                                    <div className="axiom-text-10 axiom-dim">{new Date(n.timestamp).toLocaleTimeString()}</div>
                                    <div className={`axiom-text-9 ${n.syncStatus === 'pending' ? 'axiom-text-amber' : 'axiom-text-teal'}`}>
                                        {n.syncStatus.toUpperCase()}
                                    </div>
                                </div>
                                <div className="axiom-text-15" style={{ color: 'var(--c-text)' }}>{n.text}</div>
                            </div>
                        ))
                    )}
                </div>
            </Card>
        </div>
    );
}
