import React from 'react';
import { ChevronRight, Cpu } from 'lucide-react';
import { Link } from 'react-router-dom';

const Hero = () => {
    return (
        <section style={{ paddingTop: '160px', paddingBottom: '100px', textAlign: 'center', position: 'relative' }}>
            <div className="container animate-fade-up">
                <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: '8px',
                    background: 'rgba(6, 182, 212, 0.1)', border: '1px solid rgba(6, 182, 212, 0.2)',
                    padding: '6px 16px', borderRadius: 'var(--radius-pill)', color: 'var(--color-accent-cyan)',
                    fontSize: '0.85rem', fontWeight: 600, letterSpacing: '0.5px', marginBottom: '32px'
                }}>
                    <Cpu size={14} /> NEW: Axiom V1 Execution Engine is Live
                </div>

                <h1 style={{
                    fontSize: 'clamp(3rem, 5vw, 4.5rem)', fontWeight: 800, lineHeight: 1.1,
                    letterSpacing: '-1.5px', marginBottom: '24px', color: 'white'
                }}>
                    Real Estate Intelligence,<br />
                    <span className="text-gradient-accent">Automated by AI.</span>
                </h1>

                <p style={{
                    fontSize: '1.125rem', color: 'var(--color-text-secondary)', maxWidth: '600px',
                    margin: '0 auto 40px auto', lineHeight: 1.6
                }}>
                    Source comparables, underwrite deals in seconds, and instantly generate lender-ready Investment Committee Memos. The ultimate operating system for modern sponsors.
                </p>

                <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
                    <Link to="/trial" className="btn btn-primary" style={{ padding: '14px 28px', fontSize: '1rem' }}>
                        Start Free Trial <ChevronRight size={18} />
                    </Link>
                    <a href="#features" className="btn btn-secondary" style={{ padding: '14px 28px', fontSize: '1rem' }}>
                        Explore Platform
                    </a>
                </div>

                {/* Video Preview Section */}
                <div className="animate-fade-up delay-300" style={{
                    marginTop: '64px', width: '100%', maxWidth: '1000px', margin: '64px auto 0',
                    position: 'relative'
                }}>
                    <div style={{
                        background: 'linear-gradient(180deg, rgba(20,22,40,0.8) 0%, rgba(10,11,22,0.9) 100%)',
                        border: '1px solid var(--border-subtle)',
                        borderTop: '1px solid rgba(255,255,255,0.2)',
                        borderRadius: 'var(--radius-lg)',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.6), 0 0 60px rgba(6, 182, 212, 0.15)',
                        overflow: 'hidden', position: 'relative', padding: '8px'
                    }}>
                        <div style={{ borderRadius: 'var(--radius-md)', overflow: 'hidden', position: 'relative', background: '#000', aspectRatio: '16/9' }}>
                            <video
                                autoPlay loop muted playsInline
                                style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8 }}
                                poster="/video-poster.jpg"
                            >
                                <source src="/axiom-preview.mp4" type="video/mp4" />
                                {/* Fallback pattern if video missing */}
                                <div style={{ width: '100%', height: '100%', background: 'var(--color-bg-base)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <span style={{ color: 'var(--color-text-muted)' }}>[OS Video Preview Placeholder]</span>
                                </div>
                            </video>

                            {/* Gold Callouts */}
                            <div style={{ position: 'absolute', top: '20%', left: '10%', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#FCD34D', boxShadow: '0 0 12px #FCD34D' }}></div>
                                <div style={{ height: '1px', width: '40px', background: 'linear-gradient(90deg, #FCD34D, transparent)' }}></div>
                                <span style={{ color: '#FCD34D', fontSize: '0.85rem', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase' }}>AI Underwriting Agent</span>
                            </div>

                            <div style={{ position: 'absolute', bottom: '30%', right: '10%', display: 'flex', flexDirection: 'row-reverse', alignItems: 'center', gap: '12px' }}>
                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#FCD34D', boxShadow: '0 0 12px #FCD34D' }}></div>
                                <div style={{ height: '1px', width: '40px', background: 'linear-gradient(270deg, #FCD34D, transparent)' }}></div>
                                <span style={{ color: '#FCD34D', fontSize: '0.85rem', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase' }}>Automated IC Memos</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default Hero;
