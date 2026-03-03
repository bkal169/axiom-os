import React, { useState } from 'react';
import { Check, X, ExternalLink, CreditCard } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabaseClient';

const TIER_PRICE_IDS: Record<string, string> = {
    pro: 'price_axiom_pro_monthly',
    pro_plus: 'price_axiom_pro_plus_monthly',
};

const TIERS = [
    {
        name: 'Free',
        id: 'free',
        price: 0,
        description: 'For individuals exploring the market.',
        features: [
            '5 Active Deals',
            'Basic Mortgage Calculator',
            'Public Data Access',
            'Community Support',
        ],
        notIncluded: [
            'Export to PDF/CSV',
            'Advanced ROI Calculators',
            'Intel Record Linking',
            'Priority Support',
        ],
    },
    {
        name: 'Pro',
        id: 'pro',
        price: 29,
        description: 'For serious investors building a portfolio.',
        features: [
            'Unlimited Deals',
            'All Calculators (ROI, Dev Profit)',
            'PDF & CSV Exports',
            'Intel Record Linking',
            'Email Support',
        ],
        notIncluded: [
            'Team Collaboration',
            'API Access',
        ],
        recommended: true,
    },
    {
        name: 'Pro+',
        id: 'pro_plus',
        price: 99,
        description: 'For agencies and teams scaling up.',
        features: [
            'Everything in Pro',
            'Team Collaboration (Up to 5 seats)',
            'API Access',
            'Dedicated Account Manager',
            'Custom Branding',
        ],
        notIncluded: [],
    },
];

export const PricingPage: React.FC = () => {
    const { user, profile } = useAuth();
    const [loading, setLoading] = useState<string | null>(null);

    const handleSubscribe = async (tierId: string) => {
        if (!user) {
            alert('Please log in to upgrade.');
            return;
        }
        setLoading(tierId);

        try {
            const priceId = TIER_PRICE_IDS[tierId];
            if (!priceId) {
                alert('This plan is not yet available for purchase. Contact us.');
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
            alert(`Checkout failed: ${err.message}`);
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
    const isProPlus = currentTier === 'pro_plus';

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
                <div style={{ fontSize: 14, color: 'var(--c-dim)', maxWidth: 500, margin: '0 auto' }}>
                    Start small and scale as your portfolio grows. No hidden fees, transparent metered billing.
                </div>
            </div>

            {/* Manage Billing Banner — only for paying users */}
            {currentTier !== 'free' && (
                <div style={{ maxWidth: 860, margin: '0 auto 32px auto', background: 'rgba(196, 160, 82, 0.08)', border: '1px solid rgba(196, 160, 82, 0.25)', borderRadius: 8, padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--c-gold)' }}>You are on the <strong>{currentTier.toUpperCase()}</strong> plan</div>
                        <div style={{ fontSize: 11, color: 'var(--c-dim)', marginTop: 4 }}>Manage invoices, payment methods, and upgrade options in the Stripe portal.</div>
                    </div>
                    <button
                        onClick={handleManageBilling}
                        disabled={loading === 'portal'}
                        style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', background: 'transparent', border: '1px solid rgba(196,160,82,0.4)', borderRadius: 6, color: 'var(--c-gold)', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}
                    >
                        <CreditCard size={14} />
                        {loading === 'portal' ? 'Opening portal...' : 'Manage Billing'}
                        <ExternalLink size={12} />
                    </button>
                </div>
            )}

            {/* PRO+ API Compute Usage Meter */}
            {isProPlus && (
                <div style={{ maxWidth: 860, margin: '0 auto 32px auto', background: 'var(--c-bg2)', border: '1px solid var(--c-border)', borderRadius: 8, padding: 24 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--c-text)', marginBottom: 8 }}>API Compute Usage — Current Billing Cycle</div>
                    <div style={{ fontSize: 12, color: 'var(--c-dim)', marginBottom: 16 }}>
                        High-volume inferences and data fetches are passed through at a 15% markup. Monthly cap: <strong style={{ color: 'var(--c-gold)' }}>$500.00</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                        <span style={{ fontSize: 12, color: 'var(--c-muted)' }}>Estimated Current Spend</span>
                        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--c-green)' }}>$142.50 / $500.00</span>
                    </div>
                    <div style={{ height: 6, background: 'var(--c-bg3)', borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: '28.5%', background: 'var(--c-green)', borderRadius: 3, transition: 'width 1s ease' }} />
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--c-dim)', marginTop: 8 }}>Data delayed by up to 15 minutes. Final billing handled via Stripe.</div>
                </div>
            )}

            {/* Tier Cards */}
            <div style={{ maxWidth: 860, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
                {TIERS.map((tier) => {
                    const isCurrent = currentTier === tier.id;
                    const isRec = tier.recommended;
                    return (
                        <div key={tier.name} style={{
                            background: 'var(--c-bg2)',
                            border: `1px solid ${isRec ? 'rgba(196,160,82,0.5)' : 'var(--c-border)'}`,
                            borderRadius: 12,
                            padding: 28,
                            display: 'flex',
                            flexDirection: 'column',
                            position: 'relative',
                            boxShadow: isRec ? '0 0 30px rgba(196,160,82,0.1)' : 'none'
                        }}>
                            {isRec && (
                                <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: 'var(--c-gold)', color: '#000', fontSize: 10, fontWeight: 800, padding: '3px 12px', borderRadius: 20, letterSpacing: 2, textTransform: 'uppercase' }}>
                                    Most Popular
                                </div>
                            )}
                            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--c-text)', marginBottom: 8 }}>{tier.name}</div>
                            <div style={{ marginBottom: 16 }}>
                                <span style={{ fontSize: 32, fontWeight: 800, color: 'var(--c-text)' }}>${tier.price}</span>
                                <span style={{ fontSize: 13, color: 'var(--c-dim)' }}>/mo</span>
                            </div>
                            <div style={{ fontSize: 12, color: 'var(--c-dim)', marginBottom: 24 }}>{tier.description}</div>
                            <button
                                onClick={() => handleSubscribe(tier.id)}
                                disabled={!!loading || isCurrent || tier.price === 0}
                                style={{
                                    padding: '10px 16px',
                                    borderRadius: 6,
                                    border: 'none',
                                    fontWeight: 700,
                                    fontSize: 13,
                                    cursor: isCurrent || tier.price === 0 ? 'default' : 'pointer',
                                    marginBottom: 24,
                                    background: isCurrent ? 'var(--c-bg3)' : isRec ? 'var(--c-gold)' : 'var(--c-bg3)',
                                    color: isCurrent ? 'var(--c-dim)' : isRec ? '#000' : 'var(--c-text)',
                                    opacity: loading && loading !== tier.id ? 0.6 : 1,
                                    transition: 'all 0.2s'
                                }}
                            >
                                {loading === tier.id ? 'Redirecting...' : isCurrent ? '✓ Current Plan' : tier.price === 0 ? 'Free Forever' : `Subscribe to ${tier.name} →`}
                            </button>
                            <ul style={{ listStyle: 'none', padding: 0, margin: 0, flex: 1 }}>
                                {tier.features.map(f => (
                                    <li key={f} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 10 }}>
                                        <Check size={14} style={{ color: 'var(--c-green)', flexShrink: 0, marginTop: 2 }} />
                                        <span style={{ fontSize: 12, color: 'var(--c-muted)' }}>{f}</span>
                                    </li>
                                ))}
                                {tier.notIncluded.map(f => (
                                    <li key={f} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 10, opacity: 0.35 }}>
                                        <X size={14} style={{ flexShrink: 0, marginTop: 2 }} />
                                        <span style={{ fontSize: 12, color: 'var(--c-dim)' }}>{f}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    );
                })}
            </div>

            {/* Footer note */}
            <div style={{ textAlign: 'center', marginTop: 40, fontSize: 11, color: 'var(--c-dim)' }}>
                All plans include 256-bit encryption, SOC2-aligned data handling, and dedicated uptime SLAs.<br />
                Questions? <a href="mailto:enterprise@axiom-os.com" style={{ color: 'var(--c-gold)' }}>enterprise@axiom-os.com</a>
            </div>
        </div>
    );
};
