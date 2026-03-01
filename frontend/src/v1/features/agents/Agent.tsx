import { useState, useRef, useEffect } from "react";
import { callLLM } from "../../lib/api";
import { Button } from "../../components/ui/components";

interface Message {
    role: "user" | "assistant";
    content: string;
}

interface AgentProps {
    id: string;
    system: string;
    placeholder?: string;
    context?: string;
}

export function Agent({ id, system, placeholder, context }: AgentProps) {
    const [msgs, setMsgs] = useState<Message[]>([]);
    const [inp, setInp] = useState("");
    const [busy, setBusy] = useState(false);
    const endRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [msgs, busy]);

    const send = async () => {
        if (!inp.trim() || busy) return;
        const userMsg: Message = { role: "user", content: inp };
        const newMsgs = [...msgs, userMsg];
        setMsgs(newMsgs);
        setInp("");
        setBusy(true);

        const fullSystem = context ? `${system}\n\nCONTEXT:\n${context}` : system;
        const reply = await callLLM(newMsgs, fullSystem);

        setMsgs([...newMsgs, { role: "assistant", content: reply }]);
        setBusy(false);
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 400 }}>
            <div style={{ flex: 1, overflowY: "auto", padding: "10px 0", display: "flex", flexDirection: "column", gap: 12 }}>
                {!msgs.length && (
                    <div style={{ padding: 40, textAlign: "center", color: "var(--c-dim)" }}>
                        <div style={{ fontSize: 24, marginBottom: 10 }}>—</div>
                        <div style={{ fontSize: 13 }}>Initializing secure session with {id}...</div>
                        <div style={{ fontSize: 11, marginTop: 4 }}>How can I help you regarding this project?</div>
                    </div>
                )}
                {msgs.map((m, i) => (
                    <div key={i} style={{
                        alignSelf: m.role === "user" ? "flex-end" : "flex-start",
                        maxWidth: "85%",
                        background: m.role === "user" ? "var(--c-bg3)" : "var(--c-bg2)",
                        border: "1px solid var(--c-border)",
                        borderRadius: 6,
                        padding: "10px 14px"
                    }}>
                        <div style={{ fontSize: 9, color: "var(--c-dim)", textTransform: "uppercase", marginBottom: 4, letterSpacing: 1 }}>
                            {m.role === "user" ? "You" : id}
                        </div>
                        <div style={{ fontSize: 13, lineHeight: 1.5, whiteSpace: "pre-wrap" }}>{m.content}</div>
                    </div>
                ))}
                {busy && (
                    <div style={{ alignSelf: "flex-start", background: "var(--c-bg2)", border: "1px solid var(--c-border)", borderRadius: 6, padding: "10px 14px" }}>
                        <div style={{ fontSize: 9, color: "var(--c-gold)", textTransform: "uppercase", marginBottom: 4 }}>— Thinking</div>
                        <div style={{ fontSize: 12, color: "var(--c-gold)" }}>Analyzing...</div>
                    </div>
                )}
                <div ref={endRef} />
            </div>

            <div style={{ display: "flex", gap: 8, marginTop: 15, padding: "10px 0", borderTop: "1px solid var(--c-border)" }}>
                <input
                    style={{ flex: 1, background: "var(--c-bg)", border: "1px solid var(--c-border)", color: "var(--c-text)", padding: "8px 12px", borderRadius: 4, fontSize: 13 }}
                    value={inp}
                    onChange={e => setInp(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && send()}
                    placeholder={placeholder || "Ask the agent..."}
                />
                <Button variant="gold" onClick={send} disabled={busy}>Send</Button>
            </div>
        </div>
    );
}
