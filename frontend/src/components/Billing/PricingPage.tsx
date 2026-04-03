import React, { useState } from 'react';
import { Check, X, ExternalLink, CreditCard } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabaseClient';

const TIER_PRICE_IDS: Record<string, string> = {
    pro: import.meta.env.VITE_STRIPE_PRO_PRICE_ID || 'price_axiom_pro_monthly',
    pro_plus: import.meta.env.VITE_STRIPE_PRO_PLUS_PRICE_ID || 'price_axiom_pro_plus_monthly',
    boutique: import.meta.env.VITE_STRIPE_BOUTIQUE_PRICE_ID || 'price_axiom_boutique_monthly',
    enterprise: import.meta.env.VITE_STRIPE_ENTERPRISE_PRICE_ID || 'price_axiom_enterprise_monthly',
};

const TIERS = [
    {
        name: 'Free',
        id: 'free',
        price: 0,
        description: 'For individuals exploring the market.',
        features: [
            '3 Active Deals',
            '5 AI Sessions / Day',
            'Basic Calculators',
            'Command Center Dashboard',
            'Community Support',
        ],
        notIncluded: ['Exports', 'MLS & Listings', 'AI Copilot', 'Team Seats'],
    },
    {
        name: 'Pro',
        id: 'pro',
        price: 100,
        description: 'For serious investors building a portfolio.',
        features: [
            '50 Active Deals',
            '25 AI Sessions / Day',
            'All Calculators (ROI, Dev Profit, IRR)',
            'PDF & CSV Exports',
            'Market Data & MLS Access',
            'IC Memo Generation',
            'Email Support',
        ],
        notIncluded: ['Team Seats', 'Agent Pipeline'],
        recommended: true,
    },
    {
        name: 'Pro+',
        id: 'pro_plus',
        price: 200,
        badge: 'Best Value',
        description: 'For growing firms scaling operations.',
        features: [
            'Everything in Pro',
            'Unlimited Deals & AI',
            'Team Collaboration (3 seats)',
            'AI Copilot (Unlimited)',
            'Scenario Modeling',
            'Priority Support',
        ],
        notIncluded: [],
    },
    {
        name: 'Boutique',
        id: 'boutique',
        price: 500,
        description: 'For boutique development shops.',
        features: [
            'Everything in Pro+',
            'Team (5 seats)',
            'Agent Pipeline & Neural Scoring',
            'Tax Intelligence',
            'Field Mode (iPad)',
            'API Access',
        ],
        notIncluded: [],
    },
    {
        name: 'Enterprise',
        id: 'enterprise',
        price: 1500,
        badge: 'Most Selected',
        description: 'For institutional teams and PE firms.',
        features: [
            'Everything in Boutique',
            'Team (10–25 seats)',
            'Custom AI Models',
            'SLA 99.9% Uptime',
            'Dedicated Success Manager',
            'Custom Integrations',
        ],
        notIncluded: [],
    },
    {
        name: 'Enterprise+',
        id: 'enterprise_plus',
        price: -1,
        description: 'White-glove deployment for large organizations.',
        features: [
            'Everything in Enterprise',
            'Unlimited Seats',
            'On-Premise Option',
            'Custom AI Training',
            'Dedicated Infrastructure',
            'SLA & BAA Agreements',
        ],
        notIncluded: [],
    },
];

export const PricingPage: React.FC = () => {
    const { user, profile } = useAuth();
    const [loading, setLoading] = useState<string | null>(null);

    const handleSubscribe = async (tierId: string) => {
        if (tierId === 'enterprise_plus') {
            window.location.href = 'mailto:support@buildaxiom.dev?subject=Enterprise%2B%20Inquiry';
            return;
        }
        if (!user) {
            alert('Please log in to upgrade.');
            return;
        }
        setLoading(tierId);

        try {
            const priceId = TIER_PRICE_IDS[tierId];
            if (!priceId) {
                alert('This plan is not yet available for purchase. Contact support@buildaxiom.dev');
                setLoading(null);
                return;
            }

            const { data, error } = await supabase.functions.invoke('stripe-checkout', {
                body: {
                    price_id: priceId,
                    customerId: (profile as any)?.stripe_customer_id ?? undefined,
                    action: 'create_checkout',
                }
            });

            if (error) throw error;
            if (data?.url) {
                window.location.href = data.url;
            }
        } catch (err: any) {
            console.error('Checkout error:', err);
            window.location.href = `mailto:support@buildaxiom.dev?subject=Checkout%20Issue&body=Plan:%20${tierId}`;
        } finally {
            setLoading(null);
        }
    };

    const handleManageBilling = async () => {
        if (!user) { alert('Please log in.'); return; }
        const customerId = (profile as any)?.stripe_customer_id;
        if (!customerId) {
            alert('No active subscription found. Please subscribe to a plan first.');
            return;
        }
        setLoading('portal');
        try {
            const { data, error } = await supabase.functions.invoke('stripe-checkout', {
                body: {
                    action: 'create_portal',
                    customerId,
                    return_url: window.location.href
                }
            });
            if (error) throw error;
            if (data?.url) window.location.href = data.url;
        } catch (err: any) {
            alert(`Portal error: ${err.message}`);
        } finally {
            setLoading(null);
        }
    };

    const currentTier = (profile as any)?.subscription_tier?.toLowerCase() ?? 'free';

    return (
        <div style={{ minHeight: '100%', background: 'linear-gradient(135deg, #0D0F13 0%, #111318 100%)', padding: '40px 20px', overflowY: 'auto' }}>
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: 48 }}>
                <div style={{ fontSize: 11, letterSpacing: 3, textTransform: 'uppercase', color: 'var(--c-gold)', fontWeight: 700, marginBottom: 12 }}>
                    Axiom OS · Pricing
                </div>
                <div style={{ fontSize: 36, fontWeight: 700, color: 'var(--c-text)', marginBottom: 12 }}>
                    Choose Your Plan
                </div>
                <div style={{ fontSize: 14, color: 'var(--c-dim)', maxWidth: 600, margin: '0 auto' }}>
                    Start free and scale as your portfolio grows. Cancel anytime. No hidden fees.
                </div>
            </div>

            {/* Manage Billing Banner */}
            {currentTier !== 'free' && (
                <div style={{ maxWidth: 1200, margin: '0 auto 32px auto', background: 'rgba(196, 160, 82, 0.08)', border: '1px solid rgba(196, 160, 82, 0.25)', borderRadius: 8, padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--c-gold)' }}>You are on the <strong>{currentTier.replace('_', ' ').toUpperCase()}</strong> plan</div>
                        <div style={{ fontSize: 11, color: 'var(--c-dim)', marginTop: 4 }}>Manage invoices, payment methods, and upgrade options in the Stripe portal.</div>
                    </div>
                    <button
                        onClick={handleManageBilling}
                        disabled={loading === 'portal'}
                        style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', background: 'transparent', border: '1px solid rgba(196,160,82,0.4)', borderRadius: 6, color: 'var(--c-gold)', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}
                    >
                        <CreditCard size={14} />
                        {loading === 'portal' ? 'Opening...' : 'Manage Billing'}
                        <ExternalLink size={12} />
                    </button>
                </div>
            )}

            {/* Tier Cards — responsive 3-column grid */}
            <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                {TIERS.map((tier) => {
                    const isCurrent = currentTier === tier.id;
                    const isRec = (tier as any).recommended;
                    const hasBadge = (tier as any).badge;
                    const isCustom = tier.price === -1;
                    return (
                        <div key={tier.name} style={{
                            background: 'var(--c-bg2)',
                            border: `1px solid ${isRec || hasBadge ? 'rgba(196,160,82,0.5)' : 'var(--c-border)'}`,
                            borderRadius: 12,
                            padding: 24,
                            display: 'flex',
                            flexDirection: 'column',
                            position: 'relative',
                            boxShadow: isRec ? '0 0 30px rgba(196,160,82,0.1)' : 'none'
                        }}>
                            {(isRec || hasBadge) && (
                                <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: 'var(--c-gold)', color: '#000', fontSize: 9, fontWeight: 800, padding: '3px 10px', borderRadius: 20, letterSpacing: 2, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                                    {hasBadge || 'Recommended'}
                                </div>
                            )}
                            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--c-text)', marginBottom: 8 }}>{tier.name}</div>
                            <div style={{ marginBottom: 14 }}>
                                {isCustom ? (
                                    <span style={{ fontSize: 28, fontWeight: 800, color: 'var(--c-gold)' }}>Custom</span>
                                ) : (
                                    <>
                                        <span style={{ fontSize: 28, fontWeight: 800, color: 'var(--c-text)' }}>${tier.price}</span>
                                        <span style={{ fontSize: 12, color: 'var(--c-dim)' }}>/mo</span>
                                    </>
                                )}
                            </div>
                            <div style={{ fontSize: 11, color: 'var(--c-dim)', marginBottom: 20, minHeight: 32 }}>{tier.description}</div>
                            <button
                                onClick={() => handleSubscribe(tier.id)}
                                disabled={!!loading || isCurrent || tier.price === 0}
                                style={{
                                    padding: '9px 14px',
                                    borderRadius: 6,
                                    border: 'none',
                                    fontWeight: 700,
                                    fontSize: 12,
                                    cursor: isCurrent || tier.price === 0 ? 'default' : 'pointer',
                                    marginBottom: 20,
                                    background: isCurrent ? 'var(--c-bg3)' : isRec ? 'var(--c-gold)' : 'var(--c-bg3)',
                                    color: isCurrent ? 'var(--c-dim)' : isRec ? '#000' : 'var(--c-text)',
                                    opacity: loading && loading !== tier.id ? 0.6 : 1,
                                    transition: 'all 0.2s',
                                    fontFamily: 'inherit',
                                }}
                            >
                                {loading === tier.id ? 'Redirecting...' : isCurrent ? '✓ Current Plan' : tier.price === 0 ? 'Free Forever' : isCustom ? 'Contact Sales →' : `Subscribe →`}
                            </button>
                            <ul style={{ listStyle: 'none', padding: 0, margin: 0, flex: 1 }}>
                                {tier.features.map(f => (
                                    <li key={f} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 8 }}>
                                        <Check size={13} style={{ color: 'var(--c-green)', flexShrink: 0, marginTop: 2 }} />
                                        <span style={{ fontSize: 11, color: 'var(--c-muted)' }}>{f}</span>
                                    </li>
                                ))}
                                {tier.notIncluded.map(f => (
                                    <li key={f} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 8, opacity: 0.3 }}>
                                        <X size={13} style={{ flexShrink: 0, marginTop: 2 }} />
                                        <span style={{ fontSize: 11, color: 'var(--c-dim)' }}>{f}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    );
                })}
            </div>

            {/* Legal & compliance footer */}
            <div style={{ textAlign: 'center', marginTop: 48, fontSize: 11, color: 'var(--c-dim)', maxWidth: 700, margin: '48px auto 0' }}>
                <p>All plans include 256-bit encryption and SOC2-aligned data handling. Cancel anytime — no long-term contracts.</p>
                <p style={{ marginTop: 8 }}>
                    Data marketplace (ATTOM / CoStar / Anthropic compute) billed at cost + 15% passthrough.
                </p>
                <div style={{ marginTop: 16, display: 'flex', gap: 24, justifyContent: 'center' }}>
                    <a href="/terms" style={{ color: 'var(--c-gold)', textDecoration: 'none' }}>Terms of Service</a>
                    <a href="/privacy" style={{ color: 'var(--c-gold)', textDecoration: 'none' }}>Privacy Policy</a>
                    <a href="/refund" style={{ color: 'var(--c-gold)', textDecoration: 'none' }}>Refund Policy</a>
                    <a href="mailto:support@buildaxiom.dev" style={{ color: 'var(--c-gold)', textDecoration: 'none' }}>Contact Sales</a>
                </div>
            </div>
        </div>
    );
};
