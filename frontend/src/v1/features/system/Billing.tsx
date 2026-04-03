import { useState, useEffect } from "react";
import { Card, Button, Badge } from "../../components/ui/components";
import { useAuth, useTier } from "../../context/AuthContext";
import { useLS } from "../../hooks/useLS";

interface Tier {
    id: string;
    name: string;
    price: number | null;
    priceLabel?: string;
    color: string;
    desc: string;
    seats: string;
    features: string[];
    recommended?: boolean;
    cta?: string;
    ctaHref?: string;
}

const TIERS: Tier[] = [
    {
        id: "free", name: "Free", price: 0, color: "var(--c-dim)", seats: "1 user",
        desc: "Explore the platform. No credit card required.",
        features: ["3 Active Deals", "5 AI Sessions/day", "Basic Calculators", "Community Support"],
    },
    {
        id: "pro", name: "Pro", price: 100, color: "var(--c-gold)", recommended: true, seats: "1 user",
        desc: "For serious land acquisition managers.",
        features: ["50 Deals", "25 AI Sessions/day", "All Calculators", "CSV/PDF Exports", "MLS Feeds", "Email Support"],
    },
    {
        id: "pro_plus", name: "Pro+", price: 200, color: "var(--c-purple)", seats: "3 users",
        desc: "For growing development firms with teams.",
        features: ["Unlimited Deals", "Unlimited AI", "Team (3 seats)", "Copilot", "Scenario Modeling", "Priority Support"],
    },
    {
        id: "boutique", name: "Boutique", price: 500, color: "var(--c-blue)", seats: "5 users",
        desc: "For boutique firms scaling their pipeline.",
        features: ["Agent Pipeline", "Neural Scoring", "Tax Intel", "Field Mode", "API Access"],
    },
    {
        id: "enterprise", name: "Enterprise", price: 1500, color: "var(--c-teal)", seats: "10-25 users",
        desc: "For institutional-grade development platforms.",
        features: ["Custom AI Models", "SLA 99.9% Uptime", "Dedicated Success Manager", "Custom Integrations"],
    },
    {
        id: "enterprise_plus", name: "Enterprise+", price: null, priceLabel: "Custom", color: "var(--c-teal)", seats: "Unlimited",
        desc: "White glove onboarding and dedicated infrastructure.",
        features: ["White Glove Onboarding", "On-Prem Deployment", "Custom AI Training", "Dedicated Infrastructure"],
        cta: "Contact Sales",
        ctaHref: "mailto:support@buildaxiom.dev",
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
        <div className="axiom-stack-24">
            {msg && (
                <div className={`axiom-p-10-16 axiom-radius-4 axiom-text-12 axiom-border-1 ${msg.startsWith("✓") ? "axiom-bg-green-soft axiom-text-green axiom-border-green" : "axiom-bg-amber-soft axiom-text-amber axiom-border-amber"}`}>
                    {msg}
                </div>
            )}

            <div className="axiom-text-center">
                <div className="axiom-text-9-gold-ls3-caps">Pricing</div>
                <div className="axiom-text-25-text-bold axiom-mt-4">Choose your plan</div>
                <div className="axiom-text-13-dim axiom-mt-4">Start small and scale as your portfolio grows. No hidden fees.</div>
            </div>

            <div className="axiom-grid-3" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
                {TIERS.map(t => {
                    const isCurrent = tier === t.id;
                    return (
                        <div key={t.id} className={`axiom-card-base axiom-p-20 axiom-relative axiom-flex-col ${isCurrent ? "axiom-border-green" : t.recommended ? "axiom-border-gold" : "axiom-border-1"}`}>
                            {isCurrent && <div className="axiom-badge-top-right"><Badge label="CURRENT" color="var(--c-green)" /></div>}
                            {t.recommended && !isCurrent && <div className="axiom-badge-top-right"><Badge label="POPULAR" color="var(--c-gold)" /></div>}

                            <div className="axiom-text-16-text-bold">{t.name}</div>
                            <div className="axiom-mt-8">
                                {t.price !== null ? (
                                    <>
                                        <span className="axiom-text-32-bold" style={{ color: t.color }}>${t.price.toLocaleString()}</span>
                                        <span className="axiom-text-12-dim">/mo</span>
                                    </>
                                ) : (
                                    <span className="axiom-text-32-bold" style={{ color: t.color }}>{t.priceLabel}</span>
                                )}
                            </div>
                            <div className="axiom-text-11-dim axiom-mt-4">{t.seats}</div>
                            <div className="axiom-text-12-dim axiom-mt-6">{t.desc}</div>

                            {t.ctaHref ? (
                                <a href={t.ctaHref} style={{ textDecoration: "none" }}>
                                    <Button
                                        className="axiom-mt-14"
                                        variant="gold"
                                        label={t.cta || "Contact Sales"}
                                    />
                                </a>
                            ) : (
                                <Button
                                    className="axiom-mt-14"
                                    variant={isCurrent ? "ghost" : "gold"}
                                    onClick={() => { if (!isCurrent && t.id !== "free" && startCheckout) startCheckout(t.id); }}
                                    disabled={isCurrent}
                                    label={isCurrent ? "Current Plan" : t.id === "free" ? "Free Forever" : `Upgrade to ${t.name}`}
                                />
                            )}

                            <div className="axiom-mt-14 axiom-flex-1">
                                {t.features.map((f, i) => (
                                    <div key={i} className="axiom-flex-center-gap-6 axiom-py-3">
                                        <span className="axiom-text-green axiom-text-12">✓</span>
                                        <span className="axiom-text-10-sub">{f}</span>
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
                            <div className="axiom-text-9-dim-ls2-caps axiom-mb-4">{u.label}</div>
                            <div className="axiom-flex-baseline-gap-4">
                                <span className="axiom-text-22-bold" style={{ color: u.color }}>{u.current}</span>
                                <span className="axiom-text-11-dim">/ {u.max >= 999 ? "∞" : u.max}</span>
                            </div>
                            <div className="axiom-progress-bg axiom-mt-4">
                                <div className="axiom-progress-bar" style={{ width: `${Math.min(100, (u.current / u.max) * 100)}%`, background: u.color }} />
                            </div>
                        </div>
                    ))}
                </div>
            </Card>

            <Card title="Subscription">
                <div className="axiom-flex-sb-center">
                    <div>
                        <div className="axiom-text-9-dim-ls2-caps axiom-mb-4">CURRENT PLAN</div>
                        <div className="axiom-text-21-gold-bold-caps">{(tier || "free").replace("_", " ")}</div>
                        {auth?.userProfile?.stripe_current_period_end && (
                            <div className="axiom-text-12-dim axiom-mt-4">Renews: {new Date(auth.userProfile.stripe_current_period_end).toLocaleDateString()}</div>
                        )}
                    </div>
                    <div className="axiom-flex-row-gap-8">
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
