import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Map as MapIcon, Zap, Smartphone } from 'lucide-react';

export const LandingPage: React.FC = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');

    const handleRequestBeta = (e: React.FormEvent) => {
        e.preventDefault();
        console.log(`[Marketing] Beta Access Requested for: ${email}`);
        alert("Beta Request Submitted. Our team will contact you for an architecture review.");
        setEmail('');
    };

    return (
        <div className="axiom-landing-wrapper" style={{ backgroundColor: '#0A0A0A', color: '#ECECEC', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>

            {/* ─── NAVIGATION ──────────────────────────────────────────────────────── */}
            <nav style={{ padding: '24px 48px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #222' }}>
                <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: '2px', color: '#fff' }}>
                    ⬡ AXIOM<span style={{ color: '#D4A843' }}>OS</span>
                </div>
                <div style={{ display: 'flex', gap: 32, alignItems: 'center' }}>
                    <button onClick={() => navigate('/login')} style={{ background: 'transparent', border: 'none', color: '#888', cursor: 'pointer', fontSize: 14 }}>Log In</button>
                    <button
                        onClick={() => navigate('/axiom')}
                        style={{ padding: '10px 20px', background: '#D4A843', color: '#000', border: 'none', borderRadius: 6, fontWeight: 600, cursor: 'pointer' }}
                    >
                        Launch App
                    </button>
                </div>
            </nav>

            {/* ─── HERO SECTION ────────────────────────────────────────────────────── */}
            <section style={{ padding: '120px 48px', textAlign: 'center', maxWidth: 900, margin: '0 auto' }}>
                <div style={{ display: 'inline-block', padding: '6px 12px', background: 'rgba(212, 168, 67, 0.1)', color: '#D4A843', borderRadius: 20, fontSize: 13, fontWeight: 600, letterSpacing: 1, marginBottom: 24 }}>
                    V3 IS NOW LIVE — 50 INVITES REMAINING
                </div>
                <h1 style={{ fontSize: 64, fontWeight: 800, lineHeight: 1.1, marginBottom: 24, color: '#FFFFFF' }}>
                    The Physical Asset, <br />
                    <span style={{ color: '#D4A843' }}>Synchronized.</span>
                </h1>
                <p style={{ fontSize: 20, color: '#888', marginBottom: 48, lineHeight: 1.6 }}>
                    Axiom OS is the first spatial intelligence and underwriting engine designed to eliminate the friction between the physical lot and the financial model.
                </p>

                <form onSubmit={handleRequestBeta} style={{ display: 'flex', gap: 16, justifyContent: 'center', maxWidth: 500, margin: '0 auto' }}>
                    <input
                        type="email"
                        placeholder="Enter your work email..."
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        style={{ flex: 1, padding: '16px 24px', borderRadius: 8, background: '#111', border: '1px solid #333', color: '#fff', fontSize: 16, outline: 'none' }}
                        required
                    />
                    <button type="submit" style={{ padding: '16px 32px', borderRadius: 8, background: '#D4A843', color: '#000', border: 'none', fontSize: 16, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
                        Request Access <ArrowRight size={18} />
                    </button>
                </form>
            </section>

            {/* ─── THE CORE TRINITY (FEATURES) ─────────────────────────────────────── */}
            <section id="features" style={{ padding: '96px 48px', background: '#111' }}>
                <h2 style={{ textAlign: 'center', fontSize: 32, marginBottom: 64, color: '#fff' }}>The Core Trinity</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 32, maxWidth: 1200, margin: '0 auto' }}>

                    {/* Feature 1 */}
                    <div style={{ background: '#1A1A1A', padding: 40, borderRadius: 16, border: '1px solid #222' }}>
                        <div style={{ background: '#222', width: 48, height: 48, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
                            <Smartphone size={24} color="#D4A843" />
                        </div>
                        <h3 style={{ fontSize: 20, marginBottom: 16, color: '#fff' }}>Field Intelligence</h3>
                        <p style={{ color: '#888', lineHeight: 1.6 }}>
                            iPad Pro optimized. Offline sync architecture. Capture photos and dictate voice logs on-site; sync instantly to the underwriter's desk when you regain signal.
                        </p>
                    </div>

                    {/* Feature 2 */}
                    <div style={{ background: '#1A1A1A', padding: 40, borderRadius: 16, border: '1px solid #222' }}>
                        <div style={{ background: '#222', width: 48, height: 48, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
                            <MapIcon size={24} color="#D4A843" />
                        </div>
                        <h3 style={{ fontSize: 20, marginBottom: 16, color: '#fff' }}>Spatial Command</h3>
                        <p style={{ color: '#888', lineHeight: 1.6 }}>
                            3D Mapbox GIS integration. Render terrain, calculate zoning heuristics, and display 5-mile sales comps visually on high-definition satellite layers.
                        </p>
                    </div>

                    {/* Feature 3 */}
                    <div style={{ background: '#1A1A1A', padding: 40, borderRadius: 16, border: '1px solid #222' }}>
                        <div style={{ background: '#222', width: 48, height: 48, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
                            <Zap size={24} color="#D4A843" />
                        </div>
                        <h3 style={{ fontSize: 20, marginBottom: 16, color: '#fff' }}>The Financial Engine</h3>
                        <p style={{ color: '#888', lineHeight: 1.6 }}>
                            Connect directly to the Copilot. Turn zoning codes into Max GFA, and let the AI generate a 10-year baseline pro-forma projecting IRRs in seconds.
                        </p>
                    </div>

                </div>
            </section>

            {/* ─── FOOTER ──────────────────────────────────────────────────────────── */}
            <footer style={{ padding: '48px', textAlign: 'center', borderTop: '1px solid #222', color: '#666', fontSize: 14 }}>
                <p>&copy; 2026 Axiom OS by Juniper Rose Intelligence. All rights reserved.</p>
                <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginTop: 16 }}>
                    <a href="#" style={{ color: '#666', textDecoration: 'none' }}>Download E-Book</a>
                    <a href="/privacy" style={{ color: '#666', textDecoration: 'none' }}>Privacy Policy</a>
                    <a href="/terms" style={{ color: '#666', textDecoration: 'none' }}>Terms of Service</a>
                    <a href="/refund" style={{ color: '#666', textDecoration: 'none' }}>Refund Policy</a>
                    <a href="mailto:support@buildaxiom.dev" style={{ color: '#666', textDecoration: 'none' }}>Support</a>
                    <a href="mailto:support@buildaxiom.dev" style={{ color: '#666', textDecoration: 'none' }}>Contact Sales</a>
                </div>
            </footer>

        </div>
    );
};

