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
    title?: string;
}

export function Agent({ id, system, placeholder, context, title }: AgentProps) {
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
        <div className="axiom-flex-column axiom-h-full axiom-min-h-400">
            {title && (
                <div className="axiom-pb-10 axiom-border-b-default axiom-mb-10">
                    <div className="axiom-text-10-gold-ls2-caps">{title}</div>
                </div>
            )}
            <div className="axiom-flex-1 axiom-overflow-y-auto axiom-py-10 axiom-flex-column axiom-gap-12">
                {!msgs.length && (
                    <div className="axiom-p-40 axiom-text-center axiom-text-dim">
                        <div className="axiom-text-24 axiom-mb-10">—</div>
                        <div className="axiom-text-13-teal-bold">✓ Secure session established with {id}</div>
                        <div className="axiom-text-11-text axiom-mt-6">Waiting for your input...</div>
                    </div>
                )}
                {msgs.map((m, i) => (
                    <div key={i}
                        className={`axiom-p-10-14 axiom-radius-6 axiom-border-1 axiom-max-w-85-pct ${m.role === "user" ? "axiom-self-end axiom-bg-3" : "axiom-self-start axiom-bg-2"}`}
                    >
                        <div className="axiom-text-9-dim-caps axiom-mb-4-spaced">
                            {m.role === "user" ? "You" : id}
                        </div>
                        <div className={`axiom-text-13-lh-15 axiom-whitespace-pre-wrap ${m.role === "user" ? "axiom-text-slate-400" : "axiom-text-main"}`}>
                            {m.content}
                        </div>
                    </div>
                ))}
                {busy && (
                    <div className="axiom-self-start axiom-bg-2 axiom-border-1 axiom-radius-6 axiom-p-10-14">
                        <div className="axiom-text-9-gold-caps axiom-mb-4">— Thinking</div>
                        <div className="axiom-text-12-gold">Analyzing...</div>
                    </div>
                )}
                <div ref={endRef} />
            </div>

            <div className="axiom-flex-gap-8 axiom-mt-15 axiom-py-10 axiom-border-t-default">
                <input
                    className="axiom-flex-1 axiom-bg-main axiom-border-default axiom-text-main axiom-p-8-12 axiom-radius-4 axiom-text-13"
                    value={inp}
                    onChange={e => setInp(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && send()}
                    placeholder={placeholder || "Ask the agent..."}
                    title="Agent message input"
                />
                <Button variant="gold" onClick={send} disabled={busy} label="Send" />
            </div>
        </div>
    );
}
