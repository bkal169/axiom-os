import React, { useState, useEffect } from 'react';
import { C, S } from '../../constants';
import { useLS } from '../../utils';
import { supabase } from '../../../lib/supabase';

// Gates mirror backend axiom_engine/plans.py exactly
const TIERS = [
    {
        id: "free",
        name: "Free",
        price: "$0",
        period: "",
        sub: "No credit card",
        seats: "1 user",
        color: "var(--c-teal)",
        cta: "Current",
        badge: null,
        gates: {
            "Active deals": "3",
            "Analysis runs / day": "5",
            "Calculator hub": "✓",
            "Command Center": "✓",
            "Market data": "Public only",
            "AI Copilot": "Limited",
            "PDF / CSV export": "—",
            "Scenario comparison": "—",
            "Agent pipeline": "—",
            "Neural scoring": "—",
            "Tax intelligence": "—",
            "Field mode": "—",
            "API access": "—",
        },
    },
    {
        id: "pro",
        name: "Pro",
        price: "$79",
        period: "/mo",
        sub: "Billed monthly",
        seats: "1 user",
        color: "var(--c-blue)",
        cta: "Upgrade to Pro",
        badge: null,
        gates: {
            "Active deals": "Unlimited",
            "Analysis runs / day": "200",
            "Calculator hub": "✓",
            "Command Center": "✓",
            "Market data": "Full + FRED",
            "AI Copilot": "Unlimited",
            "PDF / CSV export": "✓",
            "Scenario comparison": "✓",
            "Agent pipeline": "—",
            "Neural scoring": "—",
            "Tax intelligence": "—",
            "Field mode": "—",
            "API access": "—",
        },
    },
    {
        id: "pro_plus",
        name: "Pro+",
        price: "$99",
        period: "/mo",
        sub: "Billed monthly",
        seats: "Up to 3 users",
        color: "var(--c-purple)",
        cta: "Upgrade to Pro+",
        badge: "Best Value",
        gates: {
            "Active deals": "Unlimited",
            "Analysis runs / day": "1,000",
            "Calculator hub": "✓",
            "Command Center": "✓",
            "Market data": "Full + FRED",
            "AI Copilot": "Unlimited",
            "PDF / CSV export": "✓",
            "Scenario comparison": "✓",
            "Agent pipeline": "✓",
            "Neural scoring": "✓",
            "Tax intelligence": "✓",
            "Field mode": "—",
            "API access": "—",
        },
    },
    {
        id: "boutique",
        name: "Boutique",
        price: "From $1,500",
        period: "/mo",
        sub: "$1,500–$2,500/mo",
        seats: "Up to 5 users",
        color: "var(--c-amber)",
        cta: "Request Access",
        badge: null,
        gates: {
            "Active deals": "Unlimited",
            "Analysis runs / day": "5,000",
            "Calculator hub": "✓",
            "Command Center": "✓",
            "Market data": "Full + FRED",
            "AI Copilot": "Unlimited",
            "PDF / CSV export": "✓",
            "Scenario comparison": "✓",
            "Agent pipeline": "✓",
            "Neural scoring": "✓",
            "Tax intelligence": "✓",
            "Field mode": "✓",
            "API access": "—",
        },
    },
    {
        id: "enterprise",
        name: "Enterprise",
        price: "$499",
        period: "/mo",
        sub: "Billed monthly",
        seats: "10–25 users",
        color: "var(--c-gold)",
        cta: "Upgrade to Enterprise",
        badge: "Most Selected",
        gates: {
            "Active deals": "Unlimited",
            "Analysis runs / day": "50,000",
            "Calculator hub": "✓",
            "Command Center": "✓",
            "Market data": "Full + FRED + BYOK",
            "AI Copilot": "Unlimited",
            "PDF / CSV export": "✓",
            "Scenario comparison": "✓",
            "Agent pipeline": "✓",
            "Neural scoring": "✓",
            "Tax intelligence": "✓",
            "Field mode": "✓",
            "API access": "✓",
        },
    },
    {
        id: "enterprise_plus",
        name: "Enterprise+",
        price: "Custom",
        period: "",
        sub: "From $150,000/yr",
        seats: "Unlimited users",
        color: "var(--c-red)",
        cta: "Contact Sales",
        badge: "White Glove",
        gates: {
            "Active deals": "Unlimited",
            "Analysis runs / day": "Unlimited",
            "Calculator hub": "✓",
            "Command Center": "✓",
            "Market data": "Custom data lake",
            "AI Copilot": "Unlimited",
            "PDF / CSV export": "✓",
            "Scenario comparison": "✓",
            "Agent pipeline": "✓",
            "Neural scoring": "Custom ML",
            "Tax intelligence": "✓",
            "Field mode": "✓",
            "API access": "✓ + white-label",
        },
    },
];

const ROW_KEYS = [
    "Active deals", "Analysis runs / day", "Calculator hub",
    "Market data", "AI Copilot", "PDF / CSV export",
    "Scenario comparison", "Agent pipeline", "Neural scoring",
    "Tax intelligence", "Field mode", "API access",
];

export default function BillingPlans() {
    const [current, setCurrent] = useLS("axiom_tier", "free");
    const [loading, setLoading] = useState(null);
    const [profile, setProfile] = useState(null);
    const [error, setError] = useState(null);
    const [view, setView] = useState("cards"); // "cards" | "compare"

    useEffect(() => {
        supabase?.auth?.getUser?.().then(({ data: { user } }) => {
            if (!user) return;
            supabase.from("user_profiles")
                .select("stripe_customer_id, subscription_tier")
                .eq("id", user.id).single()
                .then(({ data }) => {
                    if (data?.subscription_tier) setCurrent(data.subscription_tier.toLowerCase());
                    if (data) setProfile(data);
                });
        }).catch(() => {});
    }, []);

    const handleCTA = async (tier) => {
        if (tier.id === "free") return;
        // High-touch tiers → sales email only (no Stripe price configured)
        if (["boutique", "enterprise_plus"].includes(tier.id)) {
            window.open(`mailto:enterprise@axiom-os.com?subject=${encodeURIComponent(tier.name + ' Inquiry — Axiom OS')}`, "_blank");
            return;
        }
        setError(null); setLoading(tier.id);
        try {
            const { data, error: e } = await supabase.functions.invoke("stripe-checkout", {
                body: { action: "create_checkout", tier: tier.id, customerId: profile?.stripe_customer_id },
            });
            if (e) throw new Error(e.message);
            if (data?.url) { window.location.href = data.url; return; }
        } catch { /* fall through to email */ }
        window.open(`mailto:enterprise@axiom-os.com?subject=${encodeURIComponent(tier.name + ' Access — Axiom OS')}`, "_blank");
        setLoading(null);
    };

    const handleManage = async () => {
        setLoading("portal");
        try {
            const { data, error: e } = await supabase.functions.invoke("stripe-checkout", {
                body: { action: "create_portal", customerId: profile?.stripe_customer_id, return_url: window.location.href },
            });
            if (e) throw new Error(e.message);
            if (data?.url) window.location.href = data.url;
        } catch (e) { setError(e.message); }
        finally { setLoading(null); }
    };

    const isLocked = (val) => val === "—";
    const isIncluded = (val) => val === "✓";

    return (
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
            {/* Header */}
            <div style={{ textAlign: "center", marginBottom: 20 }}>
                <div style={{ fontSize: 9, color: C.gold, letterSpacing: 3, textTransform: "uppercase", marginBottom: 4 }}>Pricing</div>
                <div style={{ fontSize: 24, color: C.text, fontWeight: 700, marginBottom: 6 }}>Axiom OS Platform Access</div>
                <div style={{ fontSize: 11, color: C.dim }}>Start free. Pay only for what you use. Cancel anytime.</div>
            </div>

            {/* View toggle */}
            <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 20 }}>
                {["cards", "compare"].map(v => (
                    <button key={v} onClick={() => setView(v)} style={{
                        ...S.btn(view === v ? "gold" : ""),
                        fontSize: 9, padding: "5px 14px", textTransform: "capitalize"
                    }}>{v === "cards" ? "Plans" : "Compare All"}</button>
                ))}
            </div>

            {error && <div style={{ background: "rgba(239,68,68,0.1)", border: `1px solid ${C.red}`, borderRadius: 4, padding: "10px 14px", marginBottom: 14, fontSize: 12, color: C.red }}>⚠ {error}</div>}

            {view === "cards" ? (
                <>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, marginBottom: 14 }}>
                        {TIERS.slice(0, 3).map(t => <TierCard key={t.id} t={t} current={current} loading={loading} onCTA={handleCTA} />)}
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, marginBottom: 20 }}>
                        {TIERS.slice(3).map(t => <TierCard key={t.id} t={t} current={current} loading={loading} onCTA={handleCTA} />)}
                    </div>
                </>
            ) : (
                /* Comparison table */
                <div style={{ overflowX: "auto", marginBottom: 20 }}>
                    <table style={{ ...S.tbl, tableLayout: "fixed" }}>
                        <colgroup>
                            <col style={{ width: 160 }} />
                            {TIERS.map(t => <col key={t.id} style={{ width: 140 }} />)}
                        </colgroup>
                        <thead>
                            <tr>
                                <th style={{ ...S.th, background: C.bg2 }} />
                                {TIERS.map(t => (
                                    <th key={t.id} style={{ ...S.th, background: t.id === current ? `color-mix(in srgb, ${t.color} 8%, ${C.bg2})` : C.bg2, borderBottom: `2px solid ${t.badge ? t.color : C.border}`, textAlign: "center" }}>
                                        <div style={{ color: t.color, fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase" }}>{t.name}</div>
                                        <div style={{ fontSize: 14, color: C.text, fontWeight: 700, margin: "4px 0 1px" }}>{t.price}<span style={{ fontSize: 9, color: C.dim, fontWeight: 400 }}>{t.period}</span></div>
                                        <div style={{ fontSize: 9, color: C.dim }}>{t.seats}</div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {ROW_KEYS.map((key, i) => (
                                <tr key={key} style={{ background: i % 2 === 0 ? C.bg3 : "transparent" }}>
                                    <td style={{ ...S.td, fontSize: 11, color: C.sub, fontWeight: 500 }}>{key}</td>
                                    {TIERS.map(t => {
                                        const val = t.gates[key] ?? "—";
                                        return (
                                            <td key={t.id} style={{ ...S.td, textAlign: "center", fontSize: 11 }}>
                                                <span style={{
                                                    color: isLocked(val) ? C.border : isIncluded(val) ? "var(--c-green)" : t.color,
                                                    fontWeight: isLocked(val) ? 400 : 600,
                                                }}>
                                                    {val}
                                                </span>
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                            <tr>
                                <td style={S.td} />
                                {TIERS.map(t => {
                                    const isCurrent = current === t.id;
                                    return (
                                        <td key={t.id} style={{ ...S.td, textAlign: "center", paddingTop: 12 }}>
                                            <button
                                                onClick={() => !isCurrent && handleCTA(t)}
                                                disabled={isCurrent || loading === t.id}
                                                style={{ ...S.btn(isCurrent ? "" : "gold"), fontSize: 8, padding: "5px 10px", width: "90%", borderColor: isCurrent ? C.border : t.color, color: isCurrent ? C.dim : t.color, background: "transparent", cursor: isCurrent ? "default" : "pointer" }}
                                            >
                                                {isCurrent ? "✓ Current" : t.cta}
                                            </button>
                                        </td>
                                    );
                                })}
                            </tr>
                        </tbody>
                    </table>
                </div>
            )}

            {/* Data marketplace */}
            <div style={{ background: C.bg3, border: `1px solid ${C.border}`, borderRadius: 6, padding: "11px 16px", marginBottom: 16, display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 14 }}>📊</span>
                <div style={{ flex: 1 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: C.text }}>Data Marketplace </span>
                    <span style={{ fontSize: 11, color: C.dim }}>— ATTOM / CoStar / Anthropic compute billed at cost + 15% passthrough. No seat charge, usage-based.</span>
                </div>
                <button style={{ ...S.btn(), fontSize: 9, whiteSpace: "nowrap" }} onClick={() => window.open("mailto:enterprise@axiom-os.com?subject=Data%20Marketplace", "_blank")}>Learn More</button>
            </div>

            {profile?.stripe_customer_id && current !== "free" && (
                <div style={{ textAlign: "center", marginBottom: 14 }}>
                    <button style={{ ...S.btn(), fontSize: 10 }} onClick={handleManage} disabled={loading === "portal"}>
                        {loading === "portal" ? "Opening…" : "Manage Subscription →"}
                    </button>
                </div>
            )}

            <div style={{ textAlign: "center", fontSize: 10, color: C.dim }}>
                <span style={{ color: C.gold }}>enterprise@axiom-os.com</span> · Axiom OS by Juniper Rose Investments & Holdings · Sarasota, FL
            </div>
        </div>
    );
}

function TierCard({ t, current, loading, onCTA }) {
    const isCurrent = current === t.id;
    const isLoading = loading === t.id;
    const highlight = t.badge === "Most Selected" || t.badge === "Best Value";
    return (
        <div style={{
            background: C.bg3, borderRadius: 8, padding: 18,
            border: `1px solid ${highlight || isCurrent ? t.color : C.border}`,
            position: "relative", display: "flex", flexDirection: "column",
            boxShadow: highlight ? `0 0 18px color-mix(in srgb, ${t.color} 10%, transparent)` : "none",
        }}>
            {t.badge && (
                <div style={{ position: "absolute", top: -10, left: "50%", transform: "translateX(-50%)", background: t.badge === "White Glove" ? "var(--c-red)" : t.badge === "Best Value" ? "var(--c-purple)" : C.gold, color: "#fff", fontSize: 8, fontWeight: 800, letterSpacing: 2, padding: "2px 10px", borderRadius: 20, textTransform: "uppercase", whiteSpace: "nowrap" }}>
                    {t.badge}
                </div>
            )}
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                <div style={{ width: 5, height: 5, borderRadius: "50%", background: t.color }} />
                <span style={{ fontSize: 10, color: t.color, letterSpacing: 2, textTransform: "uppercase", fontWeight: 700 }}>{t.name}</span>
                <span style={{ fontSize: 9, color: C.dim, marginLeft: "auto" }}>{t.seats}</span>
            </div>
            <div style={{ fontSize: 20, color: C.text, fontWeight: 800, lineHeight: 1, marginBottom: 2 }}>
                {t.price}<span style={{ fontSize: 10, color: C.dim, fontWeight: 400 }}>{t.period}</span>
            </div>
            <div style={{ fontSize: 9, color: C.dim, marginBottom: 12 }}>{t.sub}</div>

            <button onClick={() => !isCurrent && !isLoading && onCTA(t)} disabled={isCurrent || isLoading} style={{
                ...S.btn("gold"), marginBottom: 14, width: "100%", padding: "8px 12px", fontSize: 9,
                background: isCurrent ? "transparent" : highlight ? t.color : "transparent",
                color: isCurrent ? C.dim : highlight ? (t.id === "enterprise" ? C.bg : "#fff") : t.color,
                borderColor: isCurrent ? C.border : t.color,
                opacity: isLoading ? 0.6 : 1, cursor: isCurrent ? "default" : "pointer",
            }}>
                {isLoading ? "Processing…" : isCurrent ? "✓ Current Plan" : t.cta}
            </button>

            <ul style={{ margin: 0, padding: 0, listStyle: "none", flex: 1 }}>
                {Object.entries(t.gates).map(([key, val]) => {
                    const locked = val === "—";
                    return (
                        <li key={key} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6, opacity: locked ? 0.3 : 1 }}>
                            <span style={{ fontSize: 11, color: locked ? C.dim : C.sub }}>{key}</span>
                            <span style={{ fontSize: 11, fontWeight: 600, color: val === "✓" ? "var(--c-green)" : locked ? C.dim : t.color }}>
                                {val}
                            </span>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}
