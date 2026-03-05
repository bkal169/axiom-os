import { useState, useEffect, useRef } from "react";
import { Card, Badge } from "./components";
import { Phone, PhoneOff, X } from "lucide-react";

interface DialerProps {
    open: boolean;
    onClose: () => void;
    initialNumber?: string;
    initialName?: string;
}

export function Dialer({ open, onClose, initialNumber = "", initialName = "" }: DialerProps) {
    const [number, setNumber] = useState(initialNumber);
    const [status, setStatus] = useState<"idle" | "ringing" | "connected" | "ended">("idle");
    const [duration, setDuration] = useState(0);
    const timerRef = useRef<any>(null);

    useEffect(() => {
        if (open) {
            setNumber(initialNumber);
            setStatus("idle");
            setDuration(0);
        }
    }, [open, initialNumber]);

    const handleCall = () => {
        if (!number) return;
        setStatus("ringing");

        // Mock Production VoIP Handshake
        console.log(`[VOIP] Initializing outbound call to ${number} via Twilio Trunk...`);

        setTimeout(() => {
            setStatus("connected");
            timerRef.current = setInterval(() => setDuration(d => d + 1), 1000);
        }, 2000);
    };

    const handleHangup = () => {
        setStatus("ended");
        clearInterval(timerRef.current);

        // Finalize production session
        console.log(`[VOIP] Session ended. Duration: ${duration}s. Syncing to Audit Log...`);

        // In a real app, this would use the audit store logic
        localStorage.setItem('axiom_last_call', JSON.stringify({
            number,
            timestamp: new Date().toISOString(),
            duration
        }));

        setTimeout(() => {
            onClose();
            setStatus("idle");
            setDuration(0);
        }, 1500);
    };

    if (!open) return null;

    const formatTime = (secs: number) => {
        const m = Math.floor(secs / 60);
        const s = secs % 60;
        return `${m}:${s < 10 ? "0" : ""}${s}`;
    };

    return (
        <div style={{
            position: "fixed",
            bottom: 32,
            right: 32,
            width: 320,
            zIndex: 9999,
            animation: "slideUp 0.3s ease-out"
        }}>
            <Card title="Axiom VoIP Dialer" action={<button onClick={onClose} className="axiom-btn-icon"><X size={16} /></button>}>
                <div style={{ display: "flex", flexDirection: "column", gap: 16, alignItems: "center", padding: "10px 0" }}>

                    {/* Status Badge */}
                    <div style={{ height: 24 }}>
                        {status === "ringing" && <Badge label="Ringing..." color="var(--c-amber)" />}
                        {status === "connected" && <Badge label={`Connected - ${formatTime(duration)}`} color="var(--c-green)" />}
                        {status === "ended" && <Badge label="Call Ended" color="var(--c-dim)" />}
                    </div>

                    {/* Number Display */}
                    <div style={{
                        fontSize: 28,
                        fontWeight: 300,
                        letterSpacing: 2,
                        color: status === "connected" ? "var(--c-green)" : "var(--c-text)",
                        textAlign: "center",
                        minHeight: 40
                    }}>
                        {number || "Enter Number"}
                    </div>
                    {initialName && <div style={{ fontSize: 12, color: "var(--c-dim)", marginTop: -10 }}>{initialName}</div>}

                    {/* Keypad */}
                    <div style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(3, 1fr)",
                        gap: 12,
                        width: "100%",
                        padding: "0 20px"
                    }}>
                        {["1", "2", "3", "4", "5", "6", "7", "8", "9", "*", "0", "#"].map(digit => (
                            <button
                                key={digit}
                                onClick={() => status === "idle" && setNumber(n => n + digit)}
                                disabled={status !== "idle"}
                                style={{
                                    background: "var(--c-bg3)",
                                    border: "1px solid var(--c-border)",
                                    borderRadius: "50%",
                                    width: 56,
                                    height: 56,
                                    margin: "0 auto",
                                    fontSize: 20,
                                    color: "var(--c-text)",
                                    cursor: status === "idle" ? "pointer" : "not-allowed",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    transition: "0.15s",
                                    opacity: status === "idle" ? 1 : 0.5
                                }}
                                onMouseEnter={e => { if (status === "idle") e.currentTarget.style.borderColor = "var(--c-gold)"; }}
                                onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--c-border)"; }}
                            >
                                {digit}
                            </button>
                        ))}
                    </div>

                    {/* Action Buttons */}
                    <div style={{ display: "flex", gap: 16, marginTop: 10, justifyContent: "center" }}>
                        {status === "idle" ? (
                            <>
                                <button
                                    onClick={handleCall}
                                    style={{
                                        background: "var(--c-green)",
                                        border: "none",
                                        borderRadius: "50%",
                                        width: 64,
                                        height: 64,
                                        cursor: "pointer",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        fontSize: 24,
                                        boxShadow: "0 0 20px rgba(0, 200, 83, 0.2)"
                                    }}
                                >
                                    <Phone size={24} color="#fff" />
                                </button>
                                <button
                                    onClick={() => setNumber(n => n.slice(0, -1))}
                                    className="axiom-dialer-btn-secondary"
                                >
                                    ⌫
                                </button>
                            </>
                        ) : (
                            <button
                                onClick={handleHangup}
                                className="axiom-dialer-btn-hangup"
                            >
                                <PhoneOff size={24} color="#fff" />
                            </button>
                        )}
                    </div>

                </div>
            </Card>
        </div>
    );
}
