import React, { useState, useEffect } from 'react';
import { ArrowRight, ChevronRight, Layers, Map as MapIcon, Zap, Smartphone, Download, ShieldCheck, Menu, X } from 'lucide-react';
import { C, S } from '../../constants';
import { supabase } from '../../../lib/supabase';
import ROICalculator from './ROICalculator';
import LeadForm from './LeadForm';

// On localhost (dev), login stays on the same origin.
// On the marketing domain, CTA links cross to the app subdomain.
const APP_ORIGIN = window.location.hostname === 'localhost'
    ? window.location.origin
    : 'https://app.buildaxiom.dev';

export default function VanguardLanding() {
    const [email, setEmail] = useState('');
    const [betaStatus, setBetaStatus] = useState('idle'); // 'idle' | 'loading' | 'success' | 'error'
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [showFloatingCta, setShowFloatingCta] = useState(false);

    useEffect(() => {
        const onScroll = () => setShowFloatingCta(window.scrollY > 600);
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    const handleRequestBeta = async (e) => {
        e.preventDefault();
        setBetaStatus('loading');
        try {
            const { error } = await supabase
                .from('beta_requests')
                .insert({ email, source: 'hero_form' });
            if (error) throw error;
            setBetaStatus('success');
            setEmail('');
        } catch (err) {
            if (import.meta.env.DEV) console.error('[Marketing] Beta request failed:', err);
            setBetaStatus('error');
        }
    };

    return (
        <div className="axiom-landing-wrapper" style={{ backgroundColor: '#0A0A0A', color: '#ECECEC', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>

            {/* Styles Hook */}
            <style>{`
                .gold-glow:hover {
                    box-shadow: 0 0 20px rgba(212, 168, 67, 0.4);
                    transform: translateY(-2px);
                    transition: all 0.3s ease;
                }
                .nav-link:hover { color: #D4A843 !important; }
                @keyframes float {
                    0% { transform: translateY(0px); }
                    50% { transform: translateY(-10px); }
                    100% { transform: translateY(0px); }
                }
                .floating-ui { animation: float 4s ease-in-out infinite; }

                /* Gold diagonal light streaks */
                @keyframes goldStreak {
                    0% { transform: translateX(-100%) rotate(-45deg); opacity: 0; }
                    50% { opacity: 0.15; }
                    100% { transform: translateX(200%) rotate(-45deg); opacity: 0; }
                }
                .axiom-hero-section::before {
                    content: '';
                    position: absolute;
                    top: -50%;
                    left: -50%;
                    width: 200%;
                    height: 200%;
                    background: linear-gradient(
                        -45deg,
                        transparent 40%,
                        rgba(212,168,67,0.06) 45%,
                        rgba(212,168,67,0.12) 50%,
                        rgba(212,168,67,0.06) 55%,
                        transparent 60%
                    );
                    animation: goldStreak 8s ease-in-out infinite;
                    pointer-events: none;
                    z-index: 0;
                }

                /* Hexagonal grid pattern */
                .axiom-hex-bg {
                    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='49' viewBox='0 0 28 49'%3E%3Cg fill-rule='evenodd'%3E%3Cg fill='%23D4A843' fill-opacity='1'%3E%3Cpath d='M13.99 9.25l13 7.5v15l-13 7.5L1 31.75v-15l12.99-7.5zM3 17.9v12.7l10.99 6.34 11-6.35V17.9l-11-6.34L3 17.9zM0 15l12.98-7.5V0h-2v6.35L0 12.69v2.3zm0 18.5L12.98 41v8h-2v-6.85L0 35.81v-2.3zM15 0v7.5L27.99 15H28v-2.31h-.01L17 6.35V0h-2zm0 49v-8l12.99-7.5H28v2.31h-.01L17 42.15V49h-2z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
                    background-size: 60px 60px;
                    opacity: 0.03;
                }

                /* Metallic gold text gradient */
                .axiom-gold-text {
                    background: linear-gradient(135deg, #D4A843 0%, #F5E6B8 40%, #D4A843 60%, #A07C2E 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                }

                /* Gold glow separator */
                .axiom-gold-divider {
                    height: 1px;
                    background: linear-gradient(90deg, transparent 0%, rgba(212,168,67,0.6) 50%, transparent 100%);
                    box-shadow: 0 0 20px rgba(212,168,67,0.15);
                    margin: 0 auto;
                    max-width: 800px;
                }

                /* Scroll fade-in */
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(30px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .axiom-fade-in { animation: fadeInUp 0.8s ease-out both; }

                /* Card ambient glow on hover */
                .axiom-card-glow {
                    transition: all 0.4s ease;
                }
                .axiom-card-glow:hover {
                    border-color: rgba(212,168,67,0.4) !important;
                    box-shadow: 0 0 40px rgba(212,168,67,0.08), inset 0 1px 0 rgba(212,168,67,0.1);
                    transform: translateY(-4px);
                }

                /* Gold shimmer on CTA buttons */
                @keyframes btnShimmer {
                    0% { background-position: -200% center; }
                    100% { background-position: 200% center; }
                }
                .gold-glow {
                    background-size: 200% auto;
                    animation: btnShimmer 3s linear infinite;
                }

                @media (max-width: 768px) {
                    .axiom-hero-title { font-size: 42px !important; }
                    .axiom-hero-section { padding: 80px 24px 60px !important; }
                    .axiom-hero-form { flex-direction: column !important; }
                    .axiom-hero-form input { width: 100% !important; }
                    .axiom-nav { padding: 16px 24px !important; }
                    .axiom-nav-links { display: none !important; }
                    .axiom-mobile-menu-btn { display: block !important; }
                    .axiom-features-grid { grid-template-columns: 1fr !important; }
                    .axiom-pricing-grid { grid-template-columns: 1fr !important; }
                    .axiom-ebook-grid { grid-template-columns: 1fr !important; }
                    .axiom-footer-links { flex-direction: column !important; gap: 32px !important; }
                    .axiom-footer-top { flex-direction: column !important; gap: 32px !important; }
                }
            `}</style>

            {/* ─── URGENCY BANNER ─────────────────────────────────────────────────── */}
            <div style={{
                background: 'linear-gradient(90deg, #0A0A0A 0%, rgba(212,168,67,0.15) 50%, #0A0A0A 100%)',
                textAlign: 'center',
                padding: '10px 24px',
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: 2,
                color: '#D4A843',
                borderBottom: '1px solid rgba(212,168,67,0.2)',
            }}>
                ⬡ BETA ACCESS CLOSING — LIMITED INSTITUTIONAL SEATS REMAINING
            </div>

            {/* ─── NAVIGATION ──────────────────────────────────────────────────────── */}
            <nav className="axiom-nav" style={{ padding: '24px 48px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #222', position: 'sticky', top: 0, backgroundColor: 'rgba(10,10,10,0.8)', backdropFilter: 'blur(10px)', zIndex: 100 }}>
                <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: '2px', color: '#fff' }}>
                    ⬡ AXIOM<span style={{ color: '#D4A843' }}>OS</span>
                </div>
                <div className="axiom-nav-links" style={{ display: 'flex', gap: 32, alignItems: 'center' }}>
                    <a href="#features" className="nav-link" style={{ color: '#888', textDecoration: 'none', transition: '0.2s', fontSize: 14, fontWeight: 500 }}>Features</a>
                    <a href="#pricing" className="nav-link" style={{ color: '#888', textDecoration: 'none', transition: '0.2s', fontSize: 14, fontWeight: 500 }}>Pricing</a>
                    <a href="#roi" className="nav-link" style={{ color: '#888', textDecoration: 'none', transition: '0.2s', fontSize: 14, fontWeight: 500 }}>ROI Calculator</a>
                    <a href="#ebook" className="nav-link" style={{ color: '#888', textDecoration: 'none', transition: '0.2s', fontSize: 14, fontWeight: 500 }}>E-Book</a>
                    <a href={`${APP_ORIGIN}/login`} style={{ color: '#888', textDecoration: 'none', fontSize: 14, fontWeight: 500 }}>Log In</a>
                    <a href={`${APP_ORIGIN}/login`} className="gold-glow" style={{ ...S.btn("gold"), padding: '8px 20px', textDecoration: 'none', display: 'inline-block' }}>Launch App →</a>
                </div>
                <button className="axiom-mobile-menu-btn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} style={{ display: 'none', background: 'none', border: 'none', color: '#D4A843', cursor: 'pointer', padding: 4 }}>
                    {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </nav>
            {mobileMenuOpen && (
                <div className="axiom-mobile-menu" style={{ background: 'rgba(10,10,10,0.95)', backdropFilter: 'blur(10px)', borderBottom: '1px solid #222', padding: '24px', display: 'flex', flexDirection: 'column', gap: 20, position: 'sticky', top: 73, zIndex: 99 }}>
                    <a href="#features" onClick={() => setMobileMenuOpen(false)} style={{ color: '#ccc', textDecoration: 'none', fontSize: 16, fontWeight: 500 }}>Features</a>
                    <a href="#pricing" onClick={() => setMobileMenuOpen(false)} style={{ color: '#ccc', textDecoration: 'none', fontSize: 16, fontWeight: 500 }}>Pricing</a>
                    <a href="#roi" onClick={() => setMobileMenuOpen(false)} style={{ color: '#ccc', textDecoration: 'none', fontSize: 16, fontWeight: 500 }}>ROI Calculator</a>
                    <a href="#ebook" onClick={() => setMobileMenuOpen(false)} style={{ color: '#ccc', textDecoration: 'none', fontSize: 16, fontWeight: 500 }}>E-Book</a>
                    <a href={`${APP_ORIGIN}/login`} style={{ color: '#ccc', textDecoration: 'none', fontSize: 16, fontWeight: 500 }}>Log In</a>
                    <a href={`${APP_ORIGIN}/login`} className="gold-glow" style={{ ...S.btn("gold"), padding: '12px 20px', textDecoration: 'none', display: 'inline-block', textAlign: 'center' }}>Launch App →</a>
                </div>
            )}

            {/* ─── HERO SECTION ────────────────────────────────────────────────────── */}
            <section className="axiom-hero-section" style={{
                padding: '140px 48px 100px',
                textAlign: 'center',
                maxWidth: 1000,
                margin: '0 auto',
                position: 'relative',
                overflow: 'hidden',
                backgroundImage: 'radial-gradient(circle at center, rgba(212, 168, 67, 0.05) 0%, transparent 70%)'
            }}>
                {/* Hex grid overlay */}
                <div className="axiom-hex-bg" style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none' }} />
                <div style={{
                    position: 'absolute',
                    top: -100,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '120%',
                    height: '100%',
                    background: 'radial-gradient(ellipse at 50% 40%, rgba(212,168,67,0.12) 0%, rgba(212,168,67,0.04) 40%, transparent 70%)',
                    opacity: 1,
                    zIndex: -1,
                    filter: 'blur(40px)'
                }} />
                <div className="floating-ui" style={{ position: 'absolute', top: 40, left: -100, opacity: 0.1 }}>
                    <Layers size={200} color="#D4A843" />
                </div>
                <div style={{ display: 'inline-block', padding: '6px 16px', background: 'rgba(212, 168, 67, 0.1)', color: '#D4A843', borderRadius: 20, fontSize: 11, fontWeight: 700, letterSpacing: 3, marginBottom: 32, border: '1px solid rgba(212,168,67,0.2)', position: 'relative', zIndex: 1 }}>
                    PRIVATE ACCESS — INSTITUTIONAL TIER
                </div>
                <h1 className="axiom-hero-title" style={{ fontSize: 84, fontWeight: 800, lineHeight: 1.05, marginBottom: 28, color: '#FFFFFF', letterSpacing: '-0.02em', fontFamily: 'Syne, Inter, sans-serif', position: 'relative', zIndex: 1 }}>
                    The Physical Asset, <br />
                    <span className="axiom-gold-text">Synchronized.</span>
                </h1>
                <div className="axiom-gold-divider" style={{ marginBottom: 48 }} />
                <p style={{ fontSize: 22, color: '#94A3B8', marginBottom: 56, lineHeight: 1.6, maxWidth: 800, margin: '0 auto 56px', position: 'relative', zIndex: 1 }}>
                    The first spatial intelligence and underwriting engine designed for elite real estate private equity. Eliminate the friction between the physical lot and the financial model.
                </p>

                {betaStatus === 'success' ? (
                    <div style={{ maxWidth: 540, margin: '0 auto', padding: '24px', background: 'rgba(212,168,67,0.08)', border: '1px solid rgba(212,168,67,0.3)', borderRadius: 12, color: '#D4A843', fontWeight: 600, fontSize: 16 }}>
                        ✓ Request received — our team will reach out within 24 hours.
                    </div>
                ) : (
                    <form onSubmit={handleRequestBeta} style={{ display: 'flex', gap: 16, justifyContent: 'center', maxWidth: 540, margin: '0 auto' }}>
                        <input
                            type="email"
                            placeholder="Enter your work email..."
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            style={{ flex: 1, padding: '18px 24px', borderRadius: 8, background: '#111', border: '1px solid #333', color: '#fff', fontSize: 16, outline: 'none' }}
                            required
                            disabled={betaStatus === 'loading'}
                        />
                        <button type="submit" className="gold-glow" disabled={betaStatus === 'loading'} style={{ padding: '18px 36px', borderRadius: 8, background: '#D4A843', color: '#000', border: 'none', fontSize: 16, fontWeight: 700, cursor: betaStatus === 'loading' ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 10, opacity: betaStatus === 'loading' ? 0.7 : 1 }}>
                            {betaStatus === 'loading' ? 'Submitting...' : <><span>Apply for Access</span> <ArrowRight size={20} /></>}
                        </button>
                    </form>
                )}
                {betaStatus === 'error' && (
                    <p style={{ textAlign: 'center', color: '#f87171', fontSize: 13, marginTop: 12 }}>
                        Something went wrong. Email us directly at <a href="mailto:support@buildaxiom.dev" style={{ color: '#D4A843' }}>support@buildaxiom.dev</a>
                    </p>
                )}

                <div style={{ marginTop: 24, fontSize: 13, color: '#64748B' }}>
                    Already have access?{' '}
                    <a href={`${APP_ORIGIN}/login`} style={{ color: '#D4A843', textDecoration: 'none', fontWeight: 600 }}>
                        Sign in to AxiomOS →
                    </a>
                </div>

                <div style={{ marginTop: 80, opacity: 0.5, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 16, fontSize: 11, letterSpacing: 2, fontWeight: 600, position: 'relative', zIndex: 1, flexWrap: 'wrap' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><ShieldCheck size={14} color="#D4A843" /> SOC 2 COMPLIANT</span>
                    <span style={{ color: '#D4A843' }}>◆</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><ShieldCheck size={14} color="#D4A843" /> 256-BIT ENCRYPTION</span>
                    <span style={{ color: '#D4A843' }}>◆</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><ShieldCheck size={14} color="#D4A843" /> INSTITUTIONAL GRADE</span>
                    <span style={{ color: '#D4A843' }}>◆</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><ShieldCheck size={14} color="#D4A843" /> 99.9% UPTIME SLA</span>
                </div>
            </section>

            <div className="axiom-gold-divider" />

            {/* ─── THE CORE TRINITY ─────────────────────────────────────────────────── */}
            <section id="features" style={{ padding: '120px 48px', background: '#0F0F0F' }}>
                <div style={{ maxWidth: 1200, margin: '0 auto' }}>
                    <div style={{ textAlign: 'center', marginBottom: 80 }}>
                        <h2 style={{ fontSize: 40, fontWeight: 800, marginBottom: 20, fontFamily: 'Syne, Inter, sans-serif' }}>Unified Intelligence</h2>
                        <p style={{ color: '#64748B', maxWidth: 600, margin: '0 auto' }}>One operating system for the entire lifecycle of a physical asset.</p>
                    </div>

                    <div className="axiom-features-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 32 }}>
                        {[
                            { icon: <Smartphone size={32} color="#D4A843" />, title: "Field Intelligence", desc: "iPad Pro optimized. Offline sync architecture. Capture site conditions and voice logs; sync to the desk instantly." },
                            { icon: <MapIcon size={32} color="#D4A843" />, title: "Spatial Command", desc: "3D Mapbox GL integration. Render complex topography and zoning heuristics on high-definition satellite imagery." },
                            { icon: <Zap size={32} color="#D4A843" />, title: "The Financial Engine", desc: "AI-driven underwriting. Translate municipal codes into 10-year pro-formas with institutional precision in seconds." }
                        ].map((f, i) => (
                            <div key={i} className="axiom-card-glow axiom-fade-in" style={{ background: '#161616', padding: 48, borderRadius: 20, border: '1px solid #222', borderTop: '2px solid rgba(212,168,67,0.3)', transition: 'all 0.3s' }}>
                                <div style={{ marginBottom: 28 }}>{f.icon}</div>
                                <h3 style={{ fontSize: 24, fontWeight: 700, marginBottom: 16 }}>{f.title}</h3>
                                <p style={{ color: '#94A3B8', lineHeight: 1.7, fontSize: 16 }}>{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── MID-PAGE CTA ──────────────────────────────────────────────────── */}
            <div style={{ padding: '48px 24px', textAlign: 'center', background: 'linear-gradient(180deg, #0F0F0F 0%, rgba(212,168,67,0.04) 50%, #0A0A0A 100%)' }}>
                <p style={{ color: '#94A3B8', fontSize: 18, marginBottom: 20 }}>Ready to see it in action?</p>
                <a href="#" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="gold-glow" style={{ ...S.btn("gold"), padding: '14px 36px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 10, fontSize: 16, fontWeight: 700 }}>
                    Apply for Access <ArrowRight size={18} />
                </a>
            </div>

            <div className="axiom-gold-divider" />

            {/* ─── PRICING ─────────────────────────────────────────────────────────── */}
            <section id="pricing" style={{ padding: '120px 48px' }}>
                <div style={{ maxWidth: 1200, margin: '0 auto' }}>
                    <div style={{ textAlign: 'center', marginBottom: 64 }}>
                        <h2 style={{ fontSize: 40, fontWeight: 800, marginBottom: 16, color: '#F0EDE6', fontFamily: 'Syne, Inter, sans-serif' }}>Transparent Pricing</h2>
                        <p style={{ color: '#8A8578', fontSize: 18, maxWidth: 600, margin: '0 auto' }}>Start free. Scale as your portfolio grows. Cancel anytime.</p>
                    </div>

                    <div className="axiom-pricing-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
                        {[
                            {
                                tier: 'Free',
                                price: '$0',
                                period: '/mo',
                                description: 'For solo investors exploring their first deals.',
                                badge: null,
                                features: ['3 Active Deals', '5 AI Queries / Day', 'Basic Calculators', 'Community Access'],
                                cta: 'Get Started',
                                href: 'https://app.buildaxiom.dev/login',
                                highlight: false,
                            },
                            {
                                tier: 'Pro',
                                price: '$100',
                                period: '/mo',
                                description: 'Full-stack underwriting for active dealmakers.',
                                badge: 'Most Popular',
                                features: ['50 Active Deals', 'All Calculators & Models', 'PDF / Excel Exports', 'MLS Integration', 'Priority Support'],
                                cta: 'Start Free Trial',
                                href: 'https://app.buildaxiom.dev/login',
                                highlight: true,
                            },
                            {
                                tier: 'Pro+',
                                price: '$200',
                                period: '/mo',
                                description: 'For power users who need AI copilot and team access.',
                                badge: 'Best Value',
                                features: ['Unlimited Deals', 'Team Access (3 Seats)', 'AI Copilot Assistant', 'Advanced Analytics', 'API Access'],
                                cta: 'Start Free Trial',
                                href: 'https://app.buildaxiom.dev/login',
                                highlight: false,
                            },
                            {
                                tier: 'Boutique',
                                price: '$500',
                                period: '/mo',
                                description: 'Small firms scaling deal flow with field intelligence.',
                                badge: null,
                                features: ['5 Team Seats', 'Agent Pipeline Automation', 'Tax Intelligence Suite', 'Field Mode (iPad)', 'Dedicated Onboarding'],
                                cta: 'Start Free Trial',
                                href: 'https://app.buildaxiom.dev/login',
                                highlight: false,
                            },
                            {
                                tier: 'Enterprise',
                                price: '$1,500',
                                period: '/mo',
                                description: 'Institutional-grade infrastructure with SLA guarantees.',
                                badge: null,
                                features: ['10–25 Team Seats', 'Custom AI Model Tuning', '99.9% SLA Guarantee', 'Full API & Webhooks', 'Dedicated CSM'],
                                cta: 'Start Free Trial',
                                href: 'https://app.buildaxiom.dev/login',
                                highlight: false,
                            },
                            {
                                tier: 'Enterprise+',
                                price: 'Custom',
                                period: '',
                                description: 'White-glove deployment for sovereign fund-scale operations.',
                                badge: null,
                                features: ['Unlimited Seats', 'On-Premise Deployment', 'White Glove Integration', 'Custom SLA & Compliance', 'Dedicated Engineering'],
                                cta: 'Contact Sales',
                                href: 'mailto:support@buildaxiom.dev',
                                highlight: false,
                            },
                        ].map((plan, i) => (
                            <div key={i} className="axiom-card-glow" style={{
                                background: plan.highlight ? 'linear-gradient(180deg, rgba(212,168,67,0.08) 0%, #161616 100%)' : '#161616',
                                padding: 36,
                                borderRadius: 16,
                                border: plan.highlight ? '1px solid rgba(212,168,67,0.4)' : '1px solid #222',
                                borderTop: plan.highlight ? '3px solid #D4A843' : '1px solid #222',
                                display: 'flex',
                                flexDirection: 'column',
                                position: 'relative',
                            }}>
                                {plan.badge && (
                                    <div style={{
                                        position: 'absolute',
                                        top: -12,
                                        right: 20,
                                        background: '#D4A843',
                                        color: '#0A0A0A',
                                        fontSize: 11,
                                        fontWeight: 700,
                                        padding: '4px 12px',
                                        borderRadius: 20,
                                        letterSpacing: 1,
                                        textTransform: 'uppercase',
                                    }}>{plan.badge}</div>
                                )}
                                <h3 style={{ fontSize: 20, fontWeight: 700, color: '#F0EDE6', marginBottom: 8 }}>{plan.tier}</h3>
                                <div style={{ marginBottom: 12 }}>
                                    <span style={{ fontSize: 36, fontWeight: 800, color: plan.highlight ? '#D4A843' : '#F0EDE6' }}>{plan.price}</span>
                                    {plan.period && <span style={{ fontSize: 16, color: '#8A8578', fontWeight: 500 }}>{plan.period}</span>}
                                </div>
                                <p style={{ fontSize: 14, color: '#8A8578', lineHeight: 1.5, marginBottom: 24 }}>{plan.description}</p>
                                <ul style={{ listStyle: 'none', padding: 0, margin: 0, marginBottom: 28, flex: 1 }}>
                                    {plan.features.map((feat, j) => (
                                        <li key={j} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, fontSize: 14, color: '#F0EDE6' }}>
                                            <ChevronRight size={14} color="#D4A843" style={{ flexShrink: 0 }} />
                                            {feat}
                                        </li>
                                    ))}
                                </ul>
                                <a
                                    href={plan.href}
                                    className="gold-glow"
                                    style={{
                                        display: 'block',
                                        textAlign: 'center',
                                        padding: '14px 24px',
                                        borderRadius: 8,
                                        background: plan.highlight ? '#D4A843' : 'transparent',
                                        color: plan.highlight ? '#0A0A0A' : '#D4A843',
                                        border: plan.highlight ? 'none' : '1px solid rgba(212,168,67,0.4)',
                                        fontSize: 14,
                                        fontWeight: 700,
                                        textDecoration: 'none',
                                        transition: 'all 0.3s ease',
                                    }}
                                >{plan.cta}</a>
                            </div>
                        ))}
                    </div>

                    {/* Legal compliance row */}
                    <div style={{ marginTop: 48, textAlign: 'center', borderTop: '1px solid #222', paddingTop: 32 }}>
                        <p style={{ color: '#8A8578', fontSize: 13, marginBottom: 12 }}>
                            Cancel anytime. No long-term contracts.
                        </p>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginBottom: 16 }}>
                            <a href="/terms" style={{ color: '#D4A843', fontSize: 13, textDecoration: 'none', fontWeight: 500 }}>Terms of Service</a>
                            <a href="/privacy" style={{ color: '#D4A843', fontSize: 13, textDecoration: 'none', fontWeight: 500 }}>Privacy Policy</a>
                            <a href="/refund" style={{ color: '#D4A843', fontSize: 13, textDecoration: 'none', fontWeight: 500 }}>Refund Policy</a>
                        </div>
                        <p style={{ color: '#8A8578', fontSize: 12, maxWidth: 600, margin: '0 auto', lineHeight: 1.5 }}>
                            Data marketplace (ATTOM / CoStar / Anthropic compute) billed at cost + 15% passthrough.
                        </p>
                    </div>
                </div>
            </section>

            <div className="axiom-gold-divider" />

            {/* ─── ROI CALCULATOR ──────────────────────────────────────────────────── */}
            <section id="roi" style={{ padding: '120px 48px' }}>
                <div style={{ maxWidth: 900, margin: '0 auto' }}>
                    <ROICalculator />
                </div>
            </section>

            <div className="axiom-gold-divider" />

            {/* ─── LEAD CAPTURE (E-BOOK) ────────────────────────────────────────────── */}
            <section id="ebook" style={{ padding: '120px 48px', background: '#0F0F0F' }}>
                <div className="axiom-ebook-grid" style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center' }}>
                    <div>
                        <h2 style={{ fontSize: 48, fontWeight: 800, marginBottom: 24, lineHeight: 1.1, fontFamily: 'Syne, Inter, sans-serif' }}>Mastering Spatial Intelligence in CRE</h2>
                        <p style={{ fontSize: 18, color: '#94A3B8', lineHeight: 1.6, marginBottom: 40 }}>
                            Download the definitive guide on how leading firms are using Axiom OS to underwrite 90% faster and mitigate entitlement risk.
                        </p>
                        <ul style={{ listStyle: 'none', padding: 0 }}>
                            {["The 5-Minute Pro-forma", "Zoning Risk Mitigation", "Real-time Field Sync Strategies"].map((item, i) => (
                                <li key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, color: '#D4A843', fontWeight: 600 }}>
                                    <Download size={18} /> {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <LeadForm title="Instant Access" subtitle="Download V3 Handbook" />
                    </div>
                </div>
            </section>

            {/* ─── FOOTER ──────────────────────────────────────────────────────────── */}
            <footer style={{ padding: '80px 48px', borderTop: '1px solid #222', background: 'linear-gradient(180deg, transparent 0%, rgba(212,168,67,0.02) 60%, rgba(212,168,67,0.04) 100%), #0A0A0A' }}>
                <div className="axiom-footer-top" style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                        <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: '2px', color: '#fff', marginBottom: 16 }}>
                            ⬡ AXIOM<span style={{ color: '#D4A843' }}>OS</span>
                        </div>
                        <p style={{ color: '#64748B', maxWidth: 300, fontSize: 14 }}>The physical asset, synchronized. Built for the future of real estate private equity.</p>
                    </div>
                    <div className="axiom-footer-links" style={{ display: 'flex', gap: 80 }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            <span style={{ color: '#fff', fontWeight: 600, fontSize: 14 }}>Product</span>
                            <a href="#features" style={{ color: '#64748B', textDecoration: 'none', fontSize: 14 }}>Features</a>
                            <a href="https://app.buildaxiom.dev" style={{ color: '#64748B', textDecoration: 'none', fontSize: 14 }}>Launch App</a>
                            <a href="#roi" style={{ color: '#64748B', textDecoration: 'none', fontSize: 14 }}>ROI Calculator</a>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            <span style={{ color: '#fff', fontWeight: 600, fontSize: 14 }}>Support</span>
                            <a href="mailto:support@buildaxiom.dev" style={{ color: '#64748B', textDecoration: 'none', fontSize: 14 }}>support@buildaxiom.dev</a>
                            <a href="mailto:support@buildaxiom.dev" style={{ color: '#64748B', textDecoration: 'none', fontSize: 14 }}>Contact Sales</a>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            <span style={{ color: '#fff', fontWeight: 600, fontSize: 14 }}>Legal</span>
                            <a href="/privacy" style={{ color: '#64748B', textDecoration: 'none', fontSize: 14 }}>Privacy Policy</a>
                            <a href="/terms" style={{ color: '#64748B', textDecoration: 'none', fontSize: 14 }}>Terms of Service</a>
                            <a href="/refund" style={{ color: '#64748B', textDecoration: 'none', fontSize: 14 }}>Refund Policy</a>
                        </div>
                    </div>
                </div>
                <div style={{ maxWidth: 1200, margin: '48px auto 0', paddingTop: 32, borderTop: '1px solid #1A1A1A', textAlign: 'center', color: '#334155', fontSize: 12, letterSpacing: 1 }}>
                    © 2026 AXIOM OS · JUNIPER ROSE INTELLIGENCE LLC · SARASOTA, FL 34233
                </div>
            </footer>

            {/* ─── FLOATING CTA ──────────────────────────────────────────────────── */}
            {showFloatingCta && (
                <a
                    href="#"
                    onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                    className="gold-glow"
                    style={{
                        position: 'fixed',
                        bottom: 24,
                        right: 24,
                        padding: '12px 24px',
                        borderRadius: 8,
                        background: '#D4A843',
                        color: '#000',
                        fontSize: 14,
                        fontWeight: 700,
                        textDecoration: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        zIndex: 200,
                        boxShadow: '0 4px 24px rgba(212,168,67,0.3)',
                    }}
                >
                    Apply for Access <ArrowRight size={16} />
                </a>
            )}

        </div>
    );
}
