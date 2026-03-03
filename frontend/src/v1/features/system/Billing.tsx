import { useState, useEffect } from "react";
import { Card, Button } from "../../components/ui/components";
import { useAuth, useTier } from "../../context/AuthContext";
import { useLS } from "../../hooks/useLS";

const TIERS = [
    {
        id: "free", name: "Free", price: 0, color: "var(--c-dim)",
        desc: "Explore the platform. No credit card required.",
        features: ["5 Active Deals", "3 AI Sessions/day", "Basic Calculators", "Public Data Access", "Deal Pipeline"],
    },
    {
        id: "pro", name: "Pro", price: 29, color: "var(--c-gold)", recommended: true,
        desc: "For serious land acquisition managers.",
        features: ["50 Active Deals", "25 AI Sessions/day", "All Calculators", "CSV/PDF Exports", "MLS Feeds", "IC Memo Generator", "Email Support"],
    },
    {
        id: "pro_plus", name: "Pro+", price: 99, color: "var(--c-purple)",
        desc: "For growing development firms with teams.",
        features: ["Unlimited Deals", "Unlimited AI", "Team (5 seats)", "API Access", "White-Label Reports", "Jurisdiction Intel", "Priority Support"],
    },
    {
        id: "enterprise", name: "Enterprise", price: 499, color: "var(--c-teal)",
        desc: "For institutional-grade development platforms.",
        features: ["Everything in Pro+", "Unlimited Seats", "Custom AI Training", "SLA 99.9% Uptime", "Dedicated Success Manager", "Custom Integrations", "On-Prem Option"],
    },
];

export function Billing() {
    const { tier, startCheckout, openPortal, dealLimit, aiDailyLimit } = useTier() as any;
    const auth = useAuth() as any;
    const [deals] = useLS("axiom_deals", []);
    const dealCount = Array.isArray(deals) ? deals.length : 0;
    const [msg, setMsg] = useState("");

    useEffect(() => {
        const p = new URLSearchParams(window.location.search);
        if (p.get("billing") === "success") {
            setMsg("✓ Subscription activated! Refreshing...");
            window.history.replaceState({}, "", window.location.pathname);
            setTimeout(() => window.location.reload(), 2000);
        }
        if (p.get("billing") === "cancel") {
            setMsg("Checkout cancelled.");
            window.history.replaceState({}, "", window.location.pathname);
        }
    }, []);

    return (
        <div>
            {msg && (
                <div style={{ padding: "10px 16px", marginBottom: 14, borderRadius: 4, fontSize: 12, border: "1px solid", borderColor: msg.startsWith("✓") ? "var(--c-green)" : "var(--c-amber)", color: msg.startsWith("✓") ? "var(--c-green)" : "var(--c-amber)", background: msg.startsWith("✓") ? "rgba(34,197,94,0.08)" : "rgba(245,158,11,0.08)" }}>{msg}</div>
            )}
            <div style={{ textAlign: "center", marginBottom: 24 }}>
                <div style={{ fontSize: 9, color: "var(--c-gold)", letterSpacing: 3, textTransform: "uppercase" }}>Pricing</div>
                <div style={{ fontSize: 25, color: "var(--c-text)", fontWeight: 700, marginTop: 4 }}>Choose your plan</div>
                <div style={{ fontSize: 13, color: "var(--c-dim)", marginTop: 4 }}>Start small and scale as your portfolio grows. No hidden fees.</div>
            </div>

            <div className="axiom-grid-4" style={{ marginBottom: 24 }}>
                {TIERS.map(t => {
                    const isCurrent = tier === t.id;
                    return (
                        <div key={t.id} style={{ background: "var(--c-bg3)", border: `1px solid ${isCurrent ? "var(--c-green)" : (t as any).recommended ? "var(--c-gold)" : "var(--c-border)"}`, borderRadius: 6, padding: 20, position: "relative", display: "flex", flexDirection: "column" }}>
                            {isCurrent && <div style={{ position: "absolute", top: -8, right: 12, fontSize: 8, background: "var(--c-green)", color: "#fff", padding: "2px 6px", borderRadius: 3, letterSpacing: 1 }}>CURRENT</div>}
                            {(t as any).recommended && !isCurrent && <div style={{ position: "absolute", top: 0, right: 0, padding: "4px 8px", background: "var(--c-gold)", color: "#000", fontSize: 9, fontWeight: 800, letterSpacing: 1, borderTopRightRadius: 5, borderBottomLeftRadius: 4 }}>POPULAR</div>}
                            <div style={{ fontSize: 16, color: "var(--c-text)", fontWeight: 700 }}>{t.name}</div>
                            <div style={{ marginTop: 8 }}><span style={{ fontSize: 32, color: t.color, fontWeight: 700 }}>${t.price}</span><span style={{ fontSize: 12, color: "var(--c-dim)" }}>/mo</span></div>
                            <div style={{ fontSize: 12, color: "var(--c-dim)", marginTop: 6 }}>{t.desc}</div>
                            <button
                                style={{ marginTop: 14, padding: "8px 12px", borderRadius: 4, cursor: isCurrent ? "default" : "pointer", opacity: isCurrent ? 0.5 : 1, fontSize: 12, fontWeight: 600, background: isCurrent ? "var(--c-bg4)" : "var(--c-gold)", color: isCurrent ? "var(--c-dim)" : "#000", border: "none", transition: "transform 0.1s" }}
                                onClick={() => { if (!isCurrent && t.id !== "free" && startCheckout) startCheckout(t.id); }}
                                disabled={isCurrent}
                            >
                                {isCurrent ? "Current Plan" : t.id === "free" ? "Free Forever" : `Upgrade to ${t.name}`}
                            </button>
                            <div style={{ marginTop: 14, flex: 1 }}>
                                {t.features.map((f, i) => (
                                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, padding: "3px 0" }}>
                                        <span style={{ color: "var(--c-green)", fontSize: 12 }}>✓</span>
                                        <span style={{ fontSize: 10, color: "var(--c-sub)" }}>{f}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>

            <Card title="Usage & Limits">
                <div className="axiom-grid-4">
                    {[
                        { label: "Deals", current: dealCount, max: dealLimit || 5, color: dealCount >= (dealLimit || 5) ? "var(--c-red)" : "var(--c-gold)" },
                        { label: "AI Sessions Today", current: 0, max: aiDailyLimit || 3, color: "var(--c-blue)" },
                    ].map(u => (
                        <div key={u.label}>
                            <div style={{ fontSize: 9, color: "var(--c-dim)", textTransform: "uppercase", letterSpacing: 2, marginBottom: 4 }}>{u.label}</div>
                            <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                                <span style={{ fontSize: 22, color: u.color, fontWeight: 700 }}>{u.current}</span>
                                <span style={{ fontSize: 11, color: "var(--c-dim)" }}>/ {u.max >= 999 ? "∞" : u.max}</span>
                            </div>
                            <div style={{ height: 3, background: "var(--c-bg)", borderRadius: 2, marginTop: 4 }}>
                                <div style={{ height: "100%", width: `${Math.min(100, (u.current / u.max) * 100)}%`, background: u.color, borderRadius: 2 }} />
                            </div>
                        </div>
                    ))}
                </div>
            </Card>

            <Card title="Subscription">
                <div className="axiom-flex-between">
                    <div>
                        <div style={{ fontSize: 9, color: "var(--c-dim)", textTransform: "uppercase", letterSpacing: 2, marginBottom: 4 }}>CURRENT PLAN</div>
                        <div style={{ fontSize: 21, color: "var(--c-gold)", fontWeight: 700, textTransform: "uppercase" }}>{(tier || "free").replace("_", " ")}</div>
                        {auth?.userProfile?.stripe_current_period_end && (
                            <div style={{ fontSize: 12, color: "var(--c-dim)", marginTop: 4 }}>Renews: {new Date(auth.userProfile.stripe_current_period_end).toLocaleDateString()}</div>
                        )}
                    </div>
                    <div className="axiom-flex-row" style={{ gap: 8 }}>
                        {tier === "free" ? (
                            <Button variant="gold" label="Upgrade to Pro" onClick={() => startCheckout?.("pro")} />
                        ) : (
                            <>
                                <Button label="Manage Billing" onClick={() => openPortal?.()} />
                                <Button label="Update Payment" onClick={() => openPortal?.()} />
                            </>
                        )}
                    </div>
                </div>
            </Card>
        </div>
    );
}
