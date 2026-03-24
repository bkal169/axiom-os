import React, { useState } from 'react';
import { ArrowRight, ChevronRight, Layers, Map as MapIcon, Zap, Smartphone, Download } from 'lucide-react';
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
                @media (max-width: 768px) {
                    .axiom-hero-title { font-size: 42px !important; }
                    .axiom-hero-section { padding: 80px 24px 60px !important; }
                    .axiom-hero-form { flex-direction: column !important; }
                    .axiom-hero-form input { width: 100% !important; }
                    .axiom-nav { padding: 16px 24px !important; }
                    .axiom-nav-links { display: none !important; }
                    .axiom-features-grid { grid-template-columns: 1fr !important; }
                    .axiom-ebook-grid { grid-template-columns: 1fr !important; }
                    .axiom-footer-links { flex-direction: column !important; gap: 32px !important; }
                    .axiom-footer-top { flex-direction: column !important; gap: 32px !important; }
                }
            `}</style>

            {/* ─── NAVIGATION ──────────────────────────────────────────────────────── */}
            <nav className="axiom-nav" style={{ padding: '24px 48px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #222', position: 'sticky', top: 0, backgroundColor: 'rgba(10,10,10,0.8)', backdropFilter: 'blur(10px)', zIndex: 100 }}>
                <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: '2px', color: '#fff' }}>
                    ⬡ AXIOM<span style={{ color: '#D4A843' }}>OS</span>
                </div>
                <div className="axiom-nav-links" style={{ display: 'flex', gap: 32, alignItems: 'center' }}>
                    <a href="#features" className="nav-link" style={{ color: '#888', textDecoration: 'none', transition: '0.2s', fontSize: 14, fontWeight: 500 }}>Features</a>
                    <a href="#roi" className="nav-link" style={{ color: '#888', textDecoration: 'none', transition: '0.2s', fontSize: 14, fontWeight: 500 }}>ROI Calculator</a>
                    <a href="#ebook" className="nav-link" style={{ color: '#888', textDecoration: 'none', transition: '0.2s', fontSize: 14, fontWeight: 500 }}>E-Book</a>
                    <a href={`${APP_ORIGIN}/login`} style={{ color: '#888', textDecoration: 'none', fontSize: 14, fontWeight: 500 }}>Log In</a>
                    <a href={`${APP_ORIGIN}/login`} className="gold-glow" style={{ ...S.btn("gold"), padding: '8px 20px', textDecoration: 'none', display: 'inline-block' }}>Launch App →</a>
                </div>
            </nav>

            {/* ─── HERO SECTION ────────────────────────────────────────────────────── */}
            <section className="axiom-hero-section" style={{
                padding: '140px 48px 100px',
                textAlign: 'center',
                maxWidth: 1000,
                margin: '0 auto',
                position: 'relative',
                backgroundImage: 'radial-gradient(circle at center, rgba(212, 168, 67, 0.05) 0%, transparent 70%)'
            }}>
                <div style={{
                    position: 'absolute',
                    top: -100,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '120%',
                    height: '100%',
                    backgroundImage: 'url(/src/assets/v3_hero.png)',
                    backgroundSize: 'contain',
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'center',
                    opacity: 0.15,
                    zIndex: -1,
                    filter: 'blur(40px)'
                }} />
                <div className="floating-ui" style={{ position: 'absolute', top: 40, left: -100, opacity: 0.1 }}>
                    <Layers size={200} color="#D4A843" />
                </div>
                <div style={{ display: 'inline-block', padding: '6px 12px', background: 'rgba(212, 168, 67, 0.1)', color: '#D4A843', borderRadius: 20, fontSize: 12, fontWeight: 700, letterSpacing: 2, marginBottom: 32, border: '1px solid rgba(212,168,67,0.2)' }}>
                    AXIOM OS V3 IS ONLINE
                </div>
                <h1 className="axiom-hero-title" style={{ fontSize: 72, fontWeight: 800, lineHeight: 1.05, marginBottom: 28, color: '#FFFFFF', letterSpacing: '-0.02em' }}>
                    The Physical Asset, <br />
                    <span style={{ color: '#D4A843' }}>Synchronized.</span>
                </h1>
                <p style={{ fontSize: 22, color: '#94A3B8', marginBottom: 56, lineHeight: 1.6, maxWidth: 800, margin: '0 auto 56px' }}>
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
                            {betaStatus === 'loading' ? 'Submitting...' : <><span>Request Access</span> <ArrowRight size={20} /></>}
                        </button>
                    </form>
                )}
                {betaStatus === 'error' && (
                    <p style={{ textAlign: 'center', color: '#f87171', fontSize: 13, marginTop: 12 }}>
                        Something went wrong. Email us directly at <a href="mailto:enterprise@buildaxiom.dev" style={{ color: '#D4A843' }}>enterprise@buildaxiom.dev</a>
                    </p>
                )}

                <div style={{ marginTop: 24, fontSize: 13, color: '#64748B' }}>
                    Already have access?{' '}
                    <a href={`${APP_ORIGIN}/login`} style={{ color: '#D4A843', textDecoration: 'none', fontWeight: 600 }}>
                        Sign in to AxiomOS →
                    </a>
                </div>

                <div style={{ marginTop: 80, opacity: 0.4, display: 'flex', justifyContent: 'center', gap: 48, fontSize: 12, letterSpacing: 2, fontWeight: 600 }}>
                    <span>TRUSTED BY TOP 20 REPE FIRMS</span>
                    <span>SPATIAL FIRST DESIGN</span>
                    <span>AI-CORE ARCHITECTURE</span>
                </div>
            </section>

            {/* ─── THE CORE TRINITY ─────────────────────────────────────────────────── */}
            <section id="features" style={{ padding: '120px 48px', background: '#0F0F0F' }}>
                <div style={{ maxWidth: 1200, margin: '0 auto' }}>
                    <div style={{ textAlign: 'center', marginBottom: 80 }}>
                        <h2 style={{ fontSize: 40, fontWeight: 800, marginBottom: 20 }}>Unified Intelligence</h2>
                        <p style={{ color: '#64748B', maxWidth: 600, margin: '0 auto' }}>One operating system for the entire lifecycle of a physical asset.</p>
                    </div>

                    <div className="axiom-features-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 32 }}>
                        {[
                            { icon: <Smartphone size={32} color="#D4A843" />, title: "Field Intelligence", desc: "iPad Pro optimized. Offline sync architecture. Capture site conditions and voice logs; sync to the desk instantly." },
                            { icon: <MapIcon size={32} color="#D4A843" />, title: "Spatial Command", desc: "3D Mapbox GL integration. Render complex topography and zoning heuristics on high-definition satellite imagery." },
                            { icon: <Zap size={32} color="#D4A843" />, title: "The Financial Engine", desc: "AI-driven underwriting. Translate municipal codes into 10-year pro-formas with institutional precision in seconds." }
                        ].map((f, i) => (
                            <div key={i} style={{ background: '#161616', padding: 48, borderRadius: 20, border: '1px solid #222', transition: 'all 0.3s' }}>
                                <div style={{ marginBottom: 28 }}>{f.icon}</div>
                                <h3 style={{ fontSize: 24, fontWeight: 700, marginBottom: 16 }}>{f.title}</h3>
                                <p style={{ color: '#94A3B8', lineHeight: 1.7, fontSize: 16 }}>{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── ROI CALCULATOR ──────────────────────────────────────────────────── */}
            <section id="roi" style={{ padding: '120px 48px' }}>
                <div style={{ maxWidth: 900, margin: '0 auto' }}>
                    <ROICalculator />
                </div>
            </section>

            {/* ─── LEAD CAPTURE (E-BOOK) ────────────────────────────────────────────── */}
            <section id="ebook" style={{ padding: '120px 48px', background: '#0F0F0F' }}>
                <div className="axiom-ebook-grid" style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center' }}>
                    <div>
                        <h2 style={{ fontSize: 48, fontWeight: 800, marginBottom: 24, lineHeight: 1.1 }}>Mastering Spatial Intelligence in CRE</h2>
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
            <footer style={{ padding: '80px 48px', borderTop: '1px solid #222', background: '#0A0A0A' }}>
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
                            <a href="mailto:enterprise@buildaxiom.dev" style={{ color: '#64748B', textDecoration: 'none', fontSize: 14 }}>Contact Sales</a>
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

        </div>
    );
}
