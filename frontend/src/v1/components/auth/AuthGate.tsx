import React, { useState, useCallback, useRef, useEffect } from "react";
import { useAuth, useTier } from "../../context/AuthContext";
import { supa, SUPA_URL, SUPA_KEY, IS_PROD_CONFIGURED } from "../../lib/supabase";
import { useLS } from "../../hooks/useLS";
import "../ui/theme.css";

const US_STATES = [
    "", "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA", "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD", "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ", "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC", "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"
];

// Simplified Styles compatible with V20
const S = {
    btn: (variant = "ghost") => ({
        padding: "7px 14px",
        borderRadius: 3,
        fontSize: 10,
        letterSpacing: 2,
        textTransform: "uppercase" as const,
        cursor: "pointer",
        fontFamily: "inherit",
        fontWeight: 700,
        transition: "all 0.12s",
        border: variant === "gold" ? "1px solid var(--c-gold)" : "1px solid var(--c-border2)",
        background: variant === "gold" ? "var(--c-gold)" : "transparent",
        color: variant === "gold" ? "var(--c-bg)" : "var(--c-muted)",
    }),
    inp: {
        background: "var(--c-bg)",
        border: "1px solid var(--c-border2)",
        borderRadius: 3,
        color: "var(--c-text)",
        fontSize: 13,
        padding: "6px 9px",
        width: "100%",
        fontFamily: "inherit",
        outline: "none",
        boxSizing: "border-box" as const,
    },
    sel: {
        background: "var(--c-bg)",
        border: "1px solid var(--c-border2)",
        borderRadius: 3,
        color: "var(--c-text)",
        fontSize: 13,
        padding: "6px 9px",
        width: "100%",
        fontFamily: "inherit",
        outline: "none",
        cursor: "pointer",
    }
};

// ─── AUTH GATE (Login / Signup) ─────────────────────────────────
export function AuthGate() {
    const [mode, setMode] = useState("login");
    const [email, setEmail] = useState("");
    const [pw, setPw] = useState("");
    const [err, setErr] = useState("");
    const [loading, setLoading] = useState(false);
    const [tosAccepted, setTosAccepted] = useState(false);
    const [supaUrl, setSupaUrl] = useLS("axiom_supa_url", SUPA_URL);
    const [supaKey, setSupaKey] = useLS("axiom_supa_key", SUPA_KEY);
    const [showConfig, setShowConfig] = useState(!SUPA_URL && !IS_PROD_CONFIGURED);
    const auth = useAuth() as any;

    const handle = async () => {
        setErr(""); setLoading(true);
        try {
            if (mode === "reset") {
                const res = await fetch(`${supa.url}/auth/v1/recover`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json", "apikey": supa.key },
                    body: JSON.stringify({ email })
                });
                if (res.ok) setErr("✓ Check your email for a reset link.");
                else setErr("Failed to send reset email.");
            } else if (mode === "login") {
                await auth.login(email, pw);
            } else {
                const data = await auth.signup(email, pw);
                if (!data.user) setErr("Check your email for a confirmation link.");
            }
        } catch (e: any) { setErr(e.message); }
        setLoading(false);
    };

    const saveConfig = () => {
        localStorage.setItem("axiom_supa_url", supaUrl);
        localStorage.setItem("axiom_supa_key", supaKey);
        supa.url = supaUrl; supa.key = supaKey;
        setShowConfig(false);
        window.location.reload();
    };

    return (
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#08090D" }}>
            <div style={{ width: 380, padding: 40, background: "var(--c-bg2)", borderRadius: 12, border: "1px solid var(--c-border)" }}>
                <div style={{ textAlign: "center", marginBottom: 32 }}>
                    <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: 4, color: "var(--c-gold)", marginBottom: 4 }}>AXIOM OS</div>
                    <div style={{ fontSize: 11, color: "var(--c-dim)", letterSpacing: 1 }}>NEURAL INTELLIGENCE PLATFORM</div>
                </div>

                {showConfig ? (
                    <div>
                        <div style={{ fontSize: 11, color: "var(--c-sub)", marginBottom: 12 }}>Configure your Supabase connection:</div>
                        <div style={{ marginBottom: 12 }}>
                            <div style={{ fontSize: 10, color: "var(--c-dim)", marginBottom: 4 }}>Supabase URL</div>
                            <input style={{ ...S.inp, width: "100%" }} value={supaUrl} onChange={e => setSupaUrl(e.target.value)} placeholder="https://xxxxx.supabase.co" />
                        </div>
                        <div style={{ marginBottom: 16 }}>
                            <div style={{ fontSize: 10, color: "var(--c-dim)", marginBottom: 4 }}>Anon Key</div>
                            <input style={{ ...S.inp, width: "100%" }} value={supaKey} onChange={e => setSupaKey(e.target.value)} placeholder="eyJhbGci..." />
                        </div>
                        <button style={{ ...S.btn("gold"), width: "100%" }} onClick={saveConfig}>Connect</button>
                    </div>
                ) : (
                    <div>
                        <div style={{ display: "flex", gap: 0, marginBottom: 20 }}>
                            {["login", "signup"].map(m => (
                                <button key={m} onClick={() => { setMode(m); setErr(""); }}
                                    style={{
                                        flex: 1, padding: "8px 0", fontSize: 11, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase", cursor: "pointer",
                                        background: mode === m ? "var(--c-bg3)" : "transparent", color: mode === m ? "var(--c-gold)" : "var(--c-dim)",
                                        border: `1px solid ${mode === m ? "var(--c-gold)" : "var(--c-border)"}`, borderRadius: m === "login" ? "6px 0 0 6px" : "0 6px 6px 0",
                                    }}>{m}</button>
                            ))}
                        </div>
                        <div style={{ marginBottom: 12 }}>
                            <div style={{ fontSize: 10, color: "var(--c-dim)", marginBottom: 4 }}>Email</div>
                            <input style={{ ...S.inp, width: "100%" }} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@company.com" onKeyDown={e => e.key === "Enter" && handle()} />
                        </div>
                        {mode !== "reset" && <div style={{ marginBottom: 16 }}>
                            <div style={{ fontSize: 10, color: "var(--c-dim)", marginBottom: 4 }}>Password</div>
                            <input style={{ ...S.inp, width: "100%" }} type="password" value={pw} onChange={e => setPw(e.target.value)} placeholder="••••••••" onKeyDown={e => e.key === "Enter" && handle()} />
                        </div>}
                        {err && <div style={{ fontSize: 10, color: err.startsWith("✓") ? "var(--c-green)" : "var(--c-red)", marginBottom: 12, padding: "6px 10px", background: err.startsWith("✓") ? "color-mix(in srgb, var(--c-green) 10%, transparent)" : "color-mix(in srgb, var(--c-red) 10%, transparent)", borderRadius: 4 }}>{err}</div>}
                        {mode === "signup" && (
                            <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 14, padding: "10px 12px", background: "var(--c-bg3)", borderRadius: 6, border: `1px solid ${tosAccepted ? "var(--c-green)" : "var(--c-border)"}`, transition: "border-color 0.2s" }}>
                                <input
                                    id="tos-checkbox"
                                    type="checkbox"
                                    checked={tosAccepted}
                                    onChange={e => setTosAccepted(e.target.checked)}
                                    style={{ marginTop: 2, accentColor: "var(--c-gold)", flexShrink: 0, cursor: "pointer", width: 14, height: 14 }}
                                />
                                <label htmlFor="tos-checkbox" style={{ fontSize: 10, color: "var(--c-sub)", lineHeight: 1.5, cursor: "pointer" }}>
                                    I agree to the{" "}
                                    <a href="https://buildaxiom.dev/terms" target="_blank" rel="noopener noreferrer" style={{ color: "var(--c-gold)", textDecoration: "underline" }}>Terms of Service</a>
                                    {" "}and{" "}
                                    <a href="https://buildaxiom.dev/privacy" target="_blank" rel="noopener noreferrer" style={{ color: "var(--c-gold)", textDecoration: "underline" }}>Privacy Policy</a>
                                </label>
                            </div>
                        )}
                        <button style={{ ...S.btn("gold"), width: "100%", opacity: (loading || (mode === "signup" && !tosAccepted)) ? 0.5 : 1 }} onClick={handle} disabled={loading || (mode === "signup" && !tosAccepted)}>
                            {loading ? "..." : mode === "login" ? "Sign In" : mode === "signup" ? "Create Account" : "Send Reset Link"}
                        </button>
                        <div style={{ textAlign: "center", marginTop: 12, display: "flex", justifyContent: "center", gap: 16 }}>
                            {mode === "login" && <button style={{ fontSize: 10, color: "var(--c-dim)", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }} onClick={() => { setMode("reset"); setErr(""); }}>Forgot password?</button>}
                            {mode === "reset" && <button style={{ fontSize: 10, color: "var(--c-dim)", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }} onClick={() => { setMode("login"); setErr(""); }}>Back to login</button>}
                        </div>
                        <div style={{ textAlign: "center", marginTop: 8 }}>
                            <button style={{ fontSize: 10, color: "var(--c-dim)", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }} onClick={() => setShowConfig(true)}>
                                Configure Supabase
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// ─── ONBOARDING WIZARD ──────────────────────────────────────────
export function OnboardingWizard({ onComplete }: { onComplete: (orgName: string, state: string) => Promise<void> }) {
    const [step, setStep] = useState(0);
    const [orgName, setOrgName] = useState("");
    const [state, setState] = useState("FL");
    const [useCase, setUseCase] = useState("");
    const [busy, setBusy] = useState(false);

    const STEPS = [
        { title: "Welcome to Axiom OS", sub: "Let's set up your workspace in under 2 minutes" },
        { title: "About Your Organization", sub: "Tell us about your development firm" },
        { title: "Your Focus Market", sub: "We'll pre-load jurisdiction intelligence for your state" },
        { title: "You're All Set", sub: "Your workspace is ready" },
    ];

    const USE_CASES = ["Residential Land Development", "Commercial Development", "Mixed-Use Development", "Industrial / Flex", "Multifamily / Apartment", "Other"];

    const handleFinish = async () => {
        setBusy(true);
        await onComplete(orgName || "My Organization", state);
        setBusy(false);
    };

    return (
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#08090D" }}>
            <div style={{ width: 480, padding: 48, background: "var(--c-bg2)", borderRadius: 16, border: "1px solid var(--c-border)" }}>
                {/* Progress */}
                <div style={{ display: "flex", gap: 6, marginBottom: 36 }}>
                    {STEPS.map((_, i) => <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i <= step ? "var(--c-gold)" : "var(--c-border)", transition: "background 0.3s" }} />)}
                </div>

                <div style={{ textAlign: "center", marginBottom: 32 }}>
                    <div style={{ fontSize: 10, color: "var(--c-gold)", letterSpacing: 3, textTransform: "uppercase", marginBottom: 8 }}>AXIOM OS</div>
                    <div style={{ fontSize: 22, fontWeight: 700, color: "var(--c-text)", marginBottom: 8 }}>{STEPS[step].title}</div>
                    <div style={{ fontSize: 13, color: "var(--c-dim)" }}>{STEPS[step].sub}</div>
                </div>

                {step === 0 && (
                    <div style={{ textAlign: "center" }}>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 28 }}>
                            {["Deal Pipeline", "Financial Engine", "AI Agent Hub", "Jurisdiction Intel", "Risk Command", "Due Diligence"].map(f => (
                                <div key={f} style={{ padding: "10px 14px", background: "var(--c-bg3)", borderRadius: 8, border: "1px solid var(--c-border)", fontSize: 11, color: "var(--c-sub)", display: "flex", alignItems: "center", gap: 8 }}>
                                    <span style={{ color: "var(--c-green)" }}>✓</span>{f}
                                </div>
                            ))}
                        </div>
                        <button style={{ ...S.btn("gold"), width: "100%", padding: "12px 0", fontSize: 13 }} onClick={() => setStep(1)}>Get Started →</button>
                    </div>
                )}

                {step === 1 && (
                    <div>
                        <div style={{ marginBottom: 16 }}>
                            <div style={{ fontSize: 10, color: "var(--c-dim)", marginBottom: 6 }}>Company / Firm Name</div>
                            <input style={{ ...S.inp, width: "100%", fontSize: 13, padding: "10px 12px" }} value={orgName} onChange={e => setOrgName(e.target.value)} placeholder="e.g. Horizon Land Development" />
                        </div>
                        <div style={{ marginBottom: 16 }}>
                            <div style={{ fontSize: 10, color: "var(--c-dim)", marginBottom: 6 }}>Primary Use Case</div>
                            <select style={{ ...S.sel, width: "100%", fontSize: 13, padding: "10px 12px" }} value={useCase} onChange={e => setUseCase(e.target.value)}>
                                <option value="">Select use case...</option>
                                {USE_CASES.map(u => <option key={u}>{u}</option>)}
                            </select>
                        </div>
                        <div style={{ display: "flex", gap: 10 }}>
                            <button style={{ ...S.btn(), flex: 1, padding: "10px 0" }} onClick={() => setStep(0)}>← Back</button>
                            <button style={{ ...S.btn("gold"), flex: 2, padding: "10px 0" }} onClick={() => setStep(2)} disabled={!orgName}>Continue →</button>
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div>
                        <div style={{ marginBottom: 16 }}>
                            <div style={{ fontSize: 10, color: "var(--c-dim)", marginBottom: 6 }}>Primary Market State</div>
                            <select style={{ ...S.sel, width: "100%", fontSize: 13, padding: "10px 12px" }} value={state} onChange={e => setState(e.target.value)}>
                                {US_STATES.filter(s => s).map(s => <option key={s}>{s}</option>)}
                            </select>
                            <div style={{ fontSize: 10, color: "var(--c-dim)", marginTop: 6 }}>We'll load jurisdiction-specific regulations, permit timelines, and impact fee schedules for this state.</div>
                        </div>
                        <div style={{ display: "flex", gap: 10 }}>
                            <button style={{ ...S.btn(), flex: 1, padding: "10px 0" }} onClick={() => setStep(1)}>← Back</button>
                            <button style={{ ...S.btn("gold"), flex: 2, padding: "10px 0" }} onClick={() => setStep(3)}>Continue →</button>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div style={{ textAlign: "center" }}>
                        <div style={{ fontSize: 48, marginBottom: 16 }}>🎯</div>
                        <div style={{ fontSize: 14, color: "var(--c-sub)", marginBottom: 8 }}>
                            <strong style={{ color: "var(--c-gold)" }}>{orgName}</strong> workspace configured
                        </div>
                        <div style={{ fontSize: 12, color: "var(--c-dim)", marginBottom: 24 }}>
                            Primary market: <strong style={{ color: "var(--c-text)" }}>{state}</strong><br />
                            Jurisdiction intel pre-loaded • First project created • AI agents ready
                        </div>
                        <button style={{ ...S.btn("gold"), width: "100%", padding: "12px 0", fontSize: 13, opacity: busy ? 0.6 : 1 }} onClick={handleFinish} disabled={busy}>
                            {busy ? "Setting up workspace..." : "Launch Axiom OS →"}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
