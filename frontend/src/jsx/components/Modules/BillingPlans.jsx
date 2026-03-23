import React, { useState, useEffect } from 'react';
import { C, S } from '../../constants';
import { useLS } from '../../utils';
import { supabase } from '../../../lib/supabase';

const TIERS = [
    {
        id: "freemium",
        name: "Freemium",
        price: "$0",
        period: "",
        range: "No credit card required",
        seats: "1 user",
        desc: "Explore the platform. Understand the depth. No commitment.",
        color: "var(--c-teal)",
        cta: "Start Free",
        badge: null,
        features: [
            "3 active deals",
            "Basic calculator hub (IRR / cap rate)",
            "Command Center dashboard",
            "Public market data access",
            "1 AI Copilot session / day",
            "Community support",
        ],
        locked: [
            "AI agent pipeline",
            "Neural scoring",
            "Full market intelligence",
            "PDF / CSV export",
        ],
    },
    {
        id: "pro",
        name: "Pro",
        price: "$79",
        period: "/mo",
        range: "$79 / mo · billed monthly",
        seats: "1 user",
        desc: "For individual investors and operators running active acquisitions.",
        color: "var(--c-blue)",
        cta: "Upgrade to Pro",
        badge: null,
        features: [
            "Unlimited active deals",
            "Full calculator hub (all 9 calculators)",
            "Full market intelligence + FRED macro",
            "AI Copilot (unlimited sessions)",
            "Deal pipeline & CRM",
            "PDF & CSV export",
            "MLS comps integration",
            "Notes, calendar, email workspace",
            "Email support",
        ],
        locked: [
            "AI agent pipeline (9-stage)",
            "Neural intelligence scoring",
            "Tax intelligence (OZ / MACRS)",
            "Risk calibration dashboard",
        ],
    },
    {
        id: "pro_plus",
        name: "Pro+",
        price: "$299",
        period: "/mo",
        range: "$299 / mo · billed monthly",
        seats: "1–3 users",
        desc: "For power investors who need AI underwriting and advanced deal intelligence.",
        color: "var(--c-purple)",
        cta: "Upgrade to Pro+",
        badge: "Best Value",
        features: [
            "Everything in Pro",
            "AI agent pipeline (9-stage underwriting)",
            "Neural intelligence scoring",
            "Tax intelligence (OZ, MACRS, depreciation)",
            "Risk calibration dashboard",
            "Semantic memory across deals",
            "Portfolio governance (basic)",
            "2D / 3D site mapping",
            "Priority email support",
        ],
        locked: [
            "Bring-your-own-key (CoStar / Anthropic)",
            "Custom ML risk scoring",
            "Multi-user collaboration (4+ seats)",
            "Offline field mode",
        ],
    },
    {
        id: "boutique",
        name: "Boutique",
        price: "From $1,500",
        period: "/mo",
        range: "$1,500 – $2,500 / mo",
        seats: "1–5 users",
        desc: "Full-platform access for boutique firms, family offices, and active deal teams.",
        color: "var(--c-amber)",
        cta: "Request Access",
        badge: null,
        features: [
            "Everything in Pro+",
            "Multi-user collaboration (up to 5 seats)",
            "Offline-capable field mode",
            "Realtime agent swarm (parallel underwriting)",
            "Full portfolio governance dashboard",
            "IC memo generator (LP-quality)",
            "Dedicated onboarding call",
            "Phone + email support",
        ],
        locked: [
            "Bring-your-own-key (CoStar / Anthropic)",
            "Custom ML scoring",
            "White-label branding",
        ],
    },
    {
        id: "enterprise",
        name: "Enterprise",
        price: "From $5,000",
        period: "/mo",
        range: "$5,000 – $8,500 / mo + compute",
        seats: "10–25 users",
        desc: "Custom intelligence for growth-stage firms running multi-market portfolios.",
        color: "var(--c-gold)",
        cta: "Schedule Demo",
        badge: "Most Selected",
        features: [
            "Everything in Boutique",
            "Bring-your-own-key (CoStar / Anthropic / OpenAI)",
            "Custom ML risk scoring & TT-SI calibration",
            "Metered compute at 15% passthrough",
            "Role-based access control (10–25 seats)",
            "Dedicated account manager",
            "API access",
            "SLA: 99.5% uptime",
        ],
        locked: [
            "White-label branding & custom domain",
            "Bespoke data lake integration",
            "Dedicated engineering pod",
        ],
    },
    {
        id: "enterprise_plus",
        name: "Enterprise+",
        price: "Custom",
        period: "",
        range: "From $150,000 / yr · White Glove",
        seats: "Unlimited users",
        desc: "Fully managed, white-label deployment for institutional platforms and capital market teams.",
        color: "var(--c-red)",
        cta: "Contact Enterprise Sales",
        badge: "White Glove",
        features: [
            "Everything in Enterprise",
            "White-label branding & custom domain",
            "Bespoke spatial intelligence engine",
            "Custom data lake (ATTOM / CoStar / RCA)",
            "BIM-aware agents (Speckle / Procore)",
            "SOC2 Type II compliance package",
            "On-prem / private cloud deployment",
            "Custom ML fine-tuning on your deal history",
            "Dedicated engineering pod",
            "SLA: 99.9% uptime + concierge onboarding",
        ],
        locked: [],
    },
];

const UNIT_ECONOMICS = [
    { label: "Labor saved / analyst / week", value: "15 hrs" },
    { label: "Annual labor value per seat", value: "$75K+" },
    { label: "Gross margin", value: "87%" },
    { label: "Net Revenue Retention", value: "135%" },
];

export default function BillingPlans() {
    const [current, setCurrent] = useLS("axiom_tier", "freemium");
    const [loading, setLoading] = useState(null);
    const [profile, setProfile] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        supabase?.auth?.getUser?.().then(({ data: { user } }) => {
            if (!user) return;
            supabase
                .from("user_profiles")
                .select("stripe_customer_id, subscription_tier, stripe_current_period_end")
                .eq("id", user.id)
                .single()
                .then(({ data }) => {
                    if (data) {
                        setProfile(data);
                        if (data.subscription_tier) setCurrent(data.subscription_tier.toLowerCase());
                    }
                });
        }).catch(() => {});
    }, []);

    const handleCTA = async (tier) => {
        if (tier.id === "freemium") { setCurrent("freemium"); return; }
        if (["enterprise", "enterprise_plus"].includes(tier.id)) {
            const sub = tier.id === "enterprise_plus"
                ? "Enterprise%2B%20White%20Glove%20Inquiry"
                : "Enterprise%20Demo%20Request";
            window.open(`mailto:enterprise@axiom-os.com?subject=${sub}%20%E2%80%94%20Axiom%20OS`, "_blank");
            return;
        }
        setError(null);
        setLoading(tier.id);
        try {
            const { data, error: fnError } = await supabase.functions.invoke("stripe-checkout", {
                body: { action: "create_checkout", tier: tier.id, customerId: profile?.stripe_customer_id || undefined },
            });
            if (fnError) throw new Error(fnError.message);
            if (data?.url) { window.location.href = data.url; return; }
        } catch { /* fall through */ }
        window.open(`mailto:enterprise@axiom-os.com?subject=${encodeURIComponent(tier.name + ' Access Request — Axiom OS')}`, "_blank");
        setLoading(null);
    };

    const handleManage = async () => {
        setLoading("portal");
        try {
            const { data, error: fnError } = await supabase.functions.invoke("stripe-checkout", {
                body: { action: "create_portal", customerId: profile?.stripe_customer_id, return_url: window.location.href },
            });
            if (fnError) throw new Error(fnError.message);
            if (data?.url) window.location.href = data.url;
        } catch (e) { setError(e.message); }
        finally { setLoading(null); }
    };

    return (
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
            {/* Header */}
            <div style={{ textAlign: "center", marginBottom: 24 }}>
                <div style={{ fontSize: 9, color: C.gold, letterSpacing: 3, textTransform: "uppercase", marginBottom: 6 }}>
                    Seat + Compute Pricing · Enterprise OS
                </div>
                <div style={{ fontSize: 26, color: C.text, fontWeight: 700, marginBottom: 8 }}>
                    Axiom OS Platform Access
                </div>
                <div style={{ fontSize: 12, color: C.dim, maxWidth: 480, margin: "0 auto" }}>
                    Start free. Scale to institutional. Transparent metered billing — cancel anytime.
                </div>
            </div>

            {/* ROI strip */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, marginBottom: 22, padding: "12px 20px", background: `color-mix(in srgb, ${C.gold} 6%, transparent)`, border: `1px solid color-mix(in srgb, ${C.gold} 20%, transparent)`, borderRadius: 6 }}>
                {UNIT_ECONOMICS.map(({ label, value }) => (
                    <div key={label} style={{ textAlign: "center" }}>
                        <div style={{ fontSize: 18, fontWeight: 700, color: C.gold }}>{value}</div>
                        <div style={{ fontSize: 9, color: C.dim, letterSpacing: 1, textTransform: "uppercase", marginTop: 2 }}>{label}</div>
                    </div>
                ))}
            </div>

            {error && (
                <div style={{ background: "rgba(239,68,68,0.1)", border: `1px solid ${C.red}`, borderRadius: 4, padding: "10px 14px", marginBottom: 14, fontSize: 12, color: C.red }}>⚠ {error}</div>
            )}

            {/* 6-tier grid — 3 + 3 */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, marginBottom: 14 }}>
                {TIERS.slice(0, 3).map(t => <TierCard key={t.id} t={t} current={current} loading={loading} onCTA={handleCTA} />)}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, marginBottom: 22 }}>
                {TIERS.slice(3).map(t => <TierCard key={t.id} t={t} current={current} loading={loading} onCTA={handleCTA} />)}
            </div>

            {/* Data marketplace */}
            <div style={{ background: C.bg3, border: `1px solid ${C.border}`, borderRadius: 6, padding: "12px 18px", marginBottom: 16, display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ fontSize: 16 }}>📊</div>
                <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: C.text, marginBottom: 2 }}>Data Marketplace — 15% Passthrough</div>
                    <div style={{ fontSize: 11, color: C.dim }}>No own ATTOM / CoStar / Anthropic license? Data fetches and inferences billed at cost + 15% markup. Usage-based, no seat charge.</div>
                </div>
                <button style={{ ...S.btn(), fontSize: 9, whiteSpace: "nowrap" }} onClick={() => window.open("mailto:enterprise@axiom-os.com?subject=Data%20Marketplace%20Inquiry", "_blank")}>
                    Learn More
                </button>
            </div>

            {profile?.stripe_customer_id && current !== "freemium" && (
                <div style={{ textAlign: "center", marginBottom: 14 }}>
                    <button style={{ ...S.btn(), fontSize: 10 }} onClick={handleManage} disabled={loading === "portal"}>
                        {loading === "portal" ? "Opening portal…" : "Manage Subscription & Invoices →"}
                    </button>
                </div>
            )}

            <div style={{ textAlign: "center", fontSize: 10, color: C.dim, lineHeight: 1.8 }}>
                All plans include 256-bit encryption and SOC2-aligned data handling.<br />
                Axiom saves 15 hrs/analyst/week — ~$75K/yr per seat. A $60K/yr contract pays for itself on day one.<br />
                <span style={{ color: C.gold }}>enterprise@axiom-os.com</span> · Axiom OS by Juniper Rose Investments & Holdings · Sarasota, FL
            </div>
        </div>
    );
}

function TierCard({ t, current, loading, onCTA }) {
    const isCurrent = current === t.id;
    const isLoading = loading === t.id;
    return (
        <div style={{
            background: C.bg3,
            border: `1px solid ${t.badge === "Most Selected" || t.badge === "Best Value" ? t.color : isCurrent ? t.color : C.border}`,
            borderRadius: 8, padding: 20, position: "relative",
            display: "flex", flexDirection: "column",
            boxShadow: (t.badge === "Most Selected" || t.badge === "Best Value")
                ? `0 0 20px color-mix(in srgb, ${t.color} 10%, transparent)` : "none",
        }}>
            {t.badge && (
                <div style={{
                    position: "absolute", top: -10, left: "50%", transform: "translateX(-50%)",
                    background: t.badge === "White Glove" ? "var(--c-red)" : t.badge === "Best Value" ? "var(--c-purple)" : C.gold,
                    color: "#fff",
                    fontSize: 8, fontWeight: 800, letterSpacing: 2, padding: "2px 10px",
                    borderRadius: 20, textTransform: "uppercase", whiteSpace: "nowrap"
                }}>
                    {t.badge}
                </div>
            )}

            <div style={{ marginBottom: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 5 }}>
                    <div style={{ width: 5, height: 5, borderRadius: "50%", background: t.color, flexShrink: 0 }} />
                    <span style={{ fontSize: 10, color: t.color, letterSpacing: 2, textTransform: "uppercase", fontWeight: 700 }}>{t.name}</span>
                    <span style={{ fontSize: 9, color: C.dim, marginLeft: "auto" }}>{t.seats}</span>
                </div>
                <div style={{ fontSize: 22, color: C.text, fontWeight: 800, lineHeight: 1 }}>
                    {t.price}<span style={{ fontSize: 11, color: C.dim, fontWeight: 400 }}>{t.period}</span>
                </div>
                <div style={{ fontSize: 9, color: C.dim, marginTop: 3 }}>{t.range}</div>
            </div>

            <div style={{ fontSize: 11, color: C.dim, marginBottom: 12, lineHeight: 1.5 }}>{t.desc}</div>

            <button
                onClick={() => !isCurrent && !isLoading && onCTA(t)}
                disabled={isCurrent || isLoading}
                style={{
                    ...S.btn("gold"), marginBottom: 14, width: "100%", padding: "8px 12px", fontSize: 9,
                    background: isCurrent ? "transparent"
                        : (t.badge === "Most Selected" || t.badge === "Best Value") ? t.color : "transparent",
                    color: isCurrent ? C.dim
                        : (t.badge === "Most Selected" || t.badge === "Best Value") ? (t.id === "enterprise" ? C.bg : "#fff") : t.color,
                    borderColor: isCurrent ? C.border : t.color,
                    opacity: isLoading ? 0.6 : 1,
                    cursor: isCurrent ? "default" : "pointer",
                }}
            >
                {isLoading ? "Processing…" : isCurrent ? "✓ Current Plan" : t.cta}
            </button>

            <ul style={{ margin: 0, padding: 0, listStyle: "none", flex: 1 }}>
                {t.features.map(f => (
                    <li key={f} style={{ display: "flex", gap: 7, alignItems: "flex-start", marginBottom: 6 }}>
                        <span style={{ color: t.color, fontSize: 10, flexShrink: 0, marginTop: 1 }}>✓</span>
                        <span style={{ fontSize: 11, color: C.sub, lineHeight: 1.4 }}>{f}</span>
                    </li>
                ))}
                {t.locked.map(f => (
                    <li key={f} style={{ display: "flex", gap: 7, alignItems: "flex-start", marginBottom: 6, opacity: 0.28 }}>
                        <span style={{ fontSize: 10, flexShrink: 0, marginTop: 1 }}>—</span>
                        <span style={{ fontSize: 11, color: C.dim, lineHeight: 1.4 }}>{f}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
}
