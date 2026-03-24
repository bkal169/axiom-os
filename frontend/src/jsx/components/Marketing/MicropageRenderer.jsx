import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { C, S } from '../../constants';
import LeadForm from './LeadForm';

export default function MicropageRenderer() {
    const { slug } = useParams();
    const [content, setContent] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!slug) { setLoading(false); return; }
        setLoading(true);
        setTimeout(() => {
            const parts = slug.split('-').filter(Boolean);
            if (parts.length < 2) { setContent(null); setLoading(false); return; }
            const asset = parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
            const city = parts[parts.length - 1].charAt(0).toUpperCase() + parts[parts.length - 1].slice(1);
            setContent({
                title: `${asset} Underwriting & Zoning Software in ${city}`,
                asset,
                city,
                hours: Math.floor(Math.random() * 10) + 8
            });
            setLoading(false);
        }, 300);
    }, [slug]);

    if (loading) return <div style={{ padding: 100, textAlign: 'center', color: C.dim }}>Loading Intelligence...</div>;

    if (!content) return (
        <div style={{ background: C.bg, minHeight: '100vh', color: C.text, fontFamily: 'Inter, sans-serif', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
            <div style={{ fontSize: 48, opacity: 0.3 }}>⬡</div>
            <h1 style={{ fontSize: 24, fontWeight: 700 }}>Page Not Found</h1>
            <p style={{ color: C.muted, fontSize: 15 }}>This use-case page doesn't exist yet.</p>
            <a href="/" style={{ color: C.gold, textDecoration: 'none', fontWeight: 600 }}>← Back to AxiomOS</a>
        </div>
    );

    return (
        <div style={{ background: C.bg, minHeight: '100vh', color: C.text, fontFamily: 'Inter, sans-serif' }}>
            <nav style={{ padding: '20px 48px', borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between' }}>
                <Link to="/" style={{ textDecoration: 'none', fontSize: 18, color: '#fff', fontWeight: 700 }}>⬡ AXIOM<span style={{ color: C.gold }}>OS</span></Link>
                <button style={S.btn("gold")}>Request Access</button>
            </nav>

            <div style={{ maxWidth: 1000, margin: '0 auto', padding: '64px 24px', display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 48 }}>
                <article>
                    <h1 style={{ fontSize: 44, fontWeight: 800, marginBottom: 24 }}>{content.title}</h1>
                    <p style={{ fontSize: 18, color: C.muted, lineHeight: 1.6, marginBottom: 32 }}>
                        Are your analysts still spending {content.hours} hours pulling zoning codes and comps for {content.asset} deals in {content.city}?
                    </p>

                    <div style={{ background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 12, padding: 32, marginBottom: 32 }}>
                        <h2 style={{ color: C.gold, fontSize: 20, marginBottom: 16 }}>The Axiom Solution</h2>
                        <div style={{ display: 'grid', gap: 24 }}>
                            <div>
                                <h3 style={{ fontSize: 16, marginBottom: 8 }}>1. Instant Zoning Heuristics</h3>
                                <p style={{ fontSize: 14, color: C.muted }}>Axiom's AI Copilot translates {content.city} municipal codes into hard maximums instantly.</p>
                            </div>
                            <div>
                                <h3 style={{ fontSize: 16, marginBottom: 8 }}>2. 3D Massing & GIS Comps</h3>
                                <p style={{ fontSize: 14, color: C.muted }}>Drop an address in {content.city} and render high-definition 3D terrain layered with local {content.asset} comps.</p>
                            </div>
                        </div>
                    </div>

                    <div style={{ fontSize: 14, color: C.muted, lineHeight: 1.7 }}>
                        <p>The highly competitive {content.city} commercial real estate market moves fast. Axiom OS replaces the disconnected workflow of legacy tools, giving you a distinct advantage in speed-to-LOI.</p>
                    </div>
                </article>

                <aside>
                    <LeadForm title="Get the Full Guide" subtitle={`${content.asset} Intelligence Report`} />
                    <div style={{ marginTop: 24, padding: 20, background: C.bg2, borderRadius: 12, border: `1px solid ${C.border}` }}>
                        <h4 style={{ fontSize: 11, color: C.gold, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>Related Markets</h4>
                        <ul style={{ listStyle: 'none', padding: 0, fontSize: 13, color: C.dim }}>
                            <li style={{ marginBottom: 8 }}>• Austin, TX</li>
                            <li style={{ marginBottom: 8 }}>• Miami, FL</li>
                            <li style={{ marginBottom: 8 }}>• Nashville, TN</li>
                        </ul>
                    </div>
                </aside>
            </div>
        </div>
    );
}
