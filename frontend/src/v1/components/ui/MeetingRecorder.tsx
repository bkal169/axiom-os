import { useState, useRef, useEffect } from "react";
import { Card, Button } from "./components";

interface MeetingRecorderProps {
    open: boolean;
    onClose: () => void;
}

export function MeetingRecorder({ open, onClose }: MeetingRecorderProps) {
    const [isRecording, setIsRecording] = useState(false);
    const [duration, setDuration] = useState(0);
    const [status, setStatus] = useState<"idle" | "recording" | "processing" | "done">("idle");
    const [transcript, setTranscript] = useState("");
    const [summary, setSummary] = useState("");
    const [actionItems, setActionItems] = useState<string[]>([]);

    const timerRef = useRef<any>(null);

    // Simulated recording timer
    useEffect(() => {
        if (isRecording) {
            timerRef.current = setInterval(() => {
                setDuration(d => d + 1);
            }, 1000);
        } else {
            if (timerRef.current) clearInterval(timerRef.current);
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [isRecording]);

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    const handleStartStop = () => {
        if (isRecording) {
            setIsRecording(false);
            processAudio();
        } else {
            setIsRecording(true);
            setStatus("recording");
            setDuration(0);
            setTranscript("");
            setSummary("");
            setActionItems([]);
        }
    };

    const processAudio = async () => {
        setStatus("processing");

        // Simulate sending to OpenAI Whisper
        await new Promise(r => setTimeout(r, 2000));

        const mockTranscript = "Alright team, let's review the Sunset Ridge deal. The seller countered our $3.0M offer with $3.15M. They also want $100K in earnest money, up from $75K. However, they are cool with the 45-day due diligence period and even offered a 60-day close. I think we should counter back at $3.08M and hold firm on that. Sarah, can you draft that addendum and send it over? Also, Mike, we need to get the term sheet from First National by Friday for the Hawk Valley construction loan. That's a $5.6M total budget with a $1.8M land cost. Let's ask for 65% LTC.";
        setTranscript(mockTranscript);

        // Simulate sending transcript to @Axiom GPT-4 for summary
        await new Promise(r => setTimeout(r, 1500));

        setSummary("Discussed Sunset Ridge counter-offer ($3.15M, $100K EM). Decided to counter at $3.08M firm. Also reviewed Hawk Valley construction loan requirements ($5.6M budget, 65% LTC) needed by Friday.");
        setActionItems([
            "Draft Sunset Ridge counter-offer addendum at $3.08M (Assigned to: Sarah)",
            "Obtain Hawk Valley term sheet from First National (Assigned to: Mike, Due: Friday)"
        ]);

        setStatus("done");
    };

    if (!open) return null;

    return (
        <div style={{
            position: "fixed", top: 80, right: 32, width: 380, zIndex: 9000
        }}>
            <Card title="Axiom Meeting Recorder" action={<button style={{ background: "transparent", border: "none", color: "var(--c-dim)", cursor: "pointer", fontSize: 16 }} onClick={onClose}>✕</button>} className="axiom-animate-slide-up">

                <div style={{ padding: "16px 0", textAlign: "center", borderBottom: "1px solid var(--c-border)", marginBottom: 16 }}>
                    <div style={{
                        fontSize: 48, fontWeight: 200, fontFamily: "'Courier New', monospace",
                        color: isRecording ? "var(--c-red)" : status === "processing" ? "var(--c-gold)" : "var(--c-text)",
                        textShadow: isRecording ? "0 0 20px var(--c-red)" : "none",
                        transition: "all 0.3s"
                    }}>
                        {formatTime(duration)}
                    </div>
                    <div style={{ fontSize: 11, color: "var(--c-dim)", marginTop: 8, letterSpacing: 2, textTransform: "uppercase" }}>
                        {status === "idle" ? "Ready" : status === "recording" ? "Recording..." : status === "processing" ? "Transcribing (Whisper AI)..." : "Processing Complete"}
                    </div>
                </div>

                {status === "idle" || status === "recording" ? (
                    <div className="axiom-flex-row" style={{ justifyContent: "center", marginBottom: 12 }}>
                        <button
                            onClick={handleStartStop}
                            style={{
                                width: 64, height: 64, borderRadius: 32,
                                background: isRecording ? "transparent" : "var(--c-red)",
                                border: isRecording ? "2px solid var(--c-red)" : "none",
                                cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                                transition: "all 0.2s"
                            }}
                        >
                            {isRecording ? (
                                <div style={{ width: 24, height: 24, background: "var(--c-red)", borderRadius: 4 }} />
                            ) : (
                                <div style={{ width: 24, height: 24, background: "#fff", borderRadius: 12 }} />
                            )}
                        </button>
                    </div>
                ) : null}

                {status === "processing" && (
                    <div style={{ padding: 24, textAlign: "center" }}>
                        <div style={{ width: 40, height: 40, border: "3px solid var(--c-border)", borderTopColor: "var(--c-gold)", borderRadius: 20, animation: "spin 1s linear infinite", margin: "0 auto 16px" }} />
                        <div className="axiom-text-12-dim">Analyzing audio streams...</div>
                    </div>
                )}

                {status === "done" && (
                    <div className="axiom-animate-fade-in" style={{ maxHeight: 400, overflowY: "auto" }}>

                        <div style={{ background: "color-mix(in srgb, var(--c-gold) 10%, var(--c-bg2))", padding: 16, borderRadius: 4, marginBottom: 16, borderLeft: "2px solid var(--c-gold)" }}>
                            <div style={{ fontSize: 10, color: "var(--c-gold)", textTransform: "uppercase", letterSpacing: 1, fontWeight: 700, marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
                                <div style={{ width: 12, height: 12, borderRadius: 6, background: "var(--c-gold)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 7, color: "var(--c-bg)" }}>⬡</div>
                                Executive Summary
                            </div>
                            <div style={{ fontSize: 13, color: "var(--c-text)", lineHeight: 1.5 }}>
                                {summary}
                            </div>
                        </div>

                        <div style={{ marginBottom: 16 }}>
                            <div style={{ fontSize: 11, color: "var(--c-text)", fontWeight: 600, marginBottom: 8 }}>Action Items Extracted</div>
                            {actionItems.map((item, idx) => (
                                <div key={idx} style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "8px 10px", background: "var(--c-bg3)", borderRadius: 4, marginBottom: 4 }}>
                                    <input type="checkbox" style={{ marginTop: 3, accentColor: "var(--c-gold)" }} />
                                    <div style={{ fontSize: 12, color: "var(--c-sub)" }}>{item}</div>
                                </div>
                            ))}
                        </div>

                        <div>
                            <div style={{ fontSize: 11, color: "var(--c-dim)", fontWeight: 600, marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>Raw Transcript</div>
                            <pre style={{ margin: 0, padding: 12, background: "var(--c-bg)", borderRadius: 4, border: "1px solid var(--c-border)", whiteSpace: "pre-wrap", fontFamily: "'Inter', sans-serif", fontSize: 11, color: "var(--c-muted)", lineHeight: 1.6 }}>
                                {transcript}
                            </pre>
                        </div>

                        <div className="axiom-flex-row" style={{ gap: 8, marginTop: 16 }}>
                            <Button variant="gold" label="Attach to Project" className="axiom-full-width" onClick={() => {
                                const notes = JSON.parse(localStorage.getItem("axiom_notes") || "[]");
                                const now = new Date().toISOString().split("T")[0];
                                const newNote = {
                                    id: Date.now(),
                                    title: `Meeting Summary - ${now}`,
                                    content: `${summary}\n\nAction Items:\n${actionItems.map(i => `- ${i}`).join("\n")}\n\nTranscript:\n${transcript}`,
                                    deal: "General",
                                    category: "Meeting Notes",
                                    pinned: false,
                                    created: now,
                                    modified: now
                                };
                                localStorage.setItem("axiom_notes", JSON.stringify([...notes, newNote]));
                                alert("Meeting summary attached to Notes.");
                                setStatus("idle");
                                onClose();
                            }} />
                            <Button label="Discard" onClick={() => setStatus("idle")} className="axiom-full-width" />
                        </div>
                    </div>
                )}
            </Card>

            <style>{`
                @keyframes spin { 100% { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
}
