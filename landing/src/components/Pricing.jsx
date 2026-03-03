import React from 'react';
import { Check } from 'lucide-react';
import { Link } from 'react-router-dom';

const Pricing = () => {
    const tiers = [
        {
            name: "Free",
            price: "$0",
            desc: "For exploring the workspace.",
            features: ["Pipeline Management", "Basic CRM Tracker", "Static Map Viewer"],
            btn: "Start Free Trial",
            link: "/trial",
            isRouterLink: true,
            accent: false
        },
        {
            name: "Pro",
            price: "$29",
            period: "/mo",
            desc: "For active sponsors.",
            features: ["Advanced Deal Automation", "Unlimited Modeling", "IC Memo Generation", "Export to PDF/Excel"],
            btn: "Upgrade to Pro",
            link: "https://app.buildaxiom.dev",
            isRouterLink: false,
            accent: true
        },
        {
            name: "Pro+",
            price: "$99",
            period: "/mo",
            desc: "For power users.",
            features: ["Pro Features Included", "Live Comps Database", "Local Jurisdiction AI Agent", "Priority Support"],
            btn: "Upgrade to Pro+",
            link: "https://app.buildaxiom.dev",
            isRouterLink: false,
            accent: false
        },
        {
            name: "Enterprise",
            price: "$499",
            period: "/mo",
            desc: "For scaling teams.",
            features: ["Bespoke Local AI Training", "API Automation Connectors", "On-Premise Deployment", "Dedicated Account Rep"],
            btn: "Contact Sales",
            link: "mailto:support@buildaxiom.dev",
            isRouterLink: false,
            accent: false
        }
    ];

    return (
        <section id="pricing" style={{ padding: '100px 0', borderTop: '1px solid var(--border-subtle)' }}>
            <div className="container">
                <div style={{ textAlign: 'center', marginBottom: '64px' }}>
                    <h2 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '16px' }}>
                        Predictable <span className="text-gradient">Pricing.</span>
                    </h2>
                    <p style={{ color: 'var(--color-text-secondary)', fontSize: '1.1rem' }}>
                        Transparent tiers designed to scale alongside your AUM.
                    </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px', alignItems: 'flex-start' }}>
                    {tiers.map((t, i) => (
                        <div key={i} className="glass-panel" style={{
                            padding: '40px 24px', position: 'relative',
                            border: t.accent ? '1px solid var(--border-focus)' : '1px solid var(--border-subtle)',
                            boxShadow: t.accent ? 'var(--shadow-glow)' : 'none',
                            transform: t.accent ? 'scale(1.02)' : 'scale(1)',
                            zIndex: t.accent ? 10 : 1
                        }}>
                            {t.accent && <div style={{
                                background: 'var(--color-accent-purple)', color: 'white', fontSize: '0.75rem',
                                fontWeight: 700, padding: '4px 12px', borderRadius: '12px', position: 'absolute',
                                top: '-12px', left: '50%', transform: 'translateX(-50%)', textTransform: 'uppercase', letterSpacing: '1px'
                            }}>Most Popular</div>}

                            <h3 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '8px' }}>{t.name}</h3>
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '16px' }}>
                                <span style={{ fontSize: '2.5rem', fontWeight: 800 }}>{t.price}</span>
                                {t.period && <span style={{ color: 'var(--color-text-secondary)', fontWeight: 500 }}>{t.period}</span>}
                            </div>
                            <p style={{ color: 'var(--color-text-muted)', marginBottom: '32px', paddingBottom: '32px', borderBottom: '1px solid var(--border-subtle)' }}>
                                {t.desc}
                            </p>

                            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '40px' }}>
                                {t.features.map((feat, fi) => (
                                    <li key={fi} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', color: 'var(--color-text-primary)' }}>
                                        <div style={{ background: 'rgba(6,182,212,0.1)', borderRadius: '50%', padding: '4px', marginTop: '2px' }}>
                                            <Check size={14} color="var(--color-accent-cyan)" />
                                        </div>
                                        <span style={{ fontSize: '0.9rem', lineHeight: 1.4 }}>{feat}</span>
                                    </li>
                                ))}
                            </ul>

                            {t.isRouterLink ? (
                                <Link to={t.link} className={`btn ${t.accent ? 'btn-primary' : 'btn-secondary'}`} style={{ width: '100%' }}>
                                    {t.btn}
                                </Link>
                            ) : (
                                <a href={t.link} className={`btn ${t.accent ? 'btn-primary' : 'btn-secondary'}`} style={{ width: '100%' }}>
                                    {t.btn}
                                </a>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

export default Pricing;
