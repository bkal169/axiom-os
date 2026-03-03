import React, { useState } from 'react';
import { ArrowRight, Hexagon, Building, User, Mail, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

const Trial = () => {
    const [submitted, setSubmitted] = useState(false);

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
            <div className="blob blob-cyan" style={{ top: '-10%', left: '-10%' }}></div>
            <div className="blob blob-purple" style={{ bottom: '-10%', right: '-10%' }}></div>

            <header style={{ padding: '24px 0', borderBottom: '1px solid var(--border-subtle)', background: 'rgba(3,4,11,0.5)', backdropFilter: 'blur(12px)', position: 'fixed', top: 0, width: '100%', zIndex: 10 }}>
                <div className="container" style={{ display: 'flex', justifyContent: 'center' }}>
                    <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', color: 'white' }}>
                        <Hexagon size={24} color="var(--color-accent-purple)" />
                        <span style={{ fontSize: '1.25rem', fontWeight: 700, letterSpacing: '-0.5px' }}>
                            Axiom<span className="text-gradient">OS</span>
                        </span>
                    </Link>
                </div>
            </header>

            <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '120px 24px 60px' }}>
                <div className="glass-panel animate-fade-up" style={{ maxWidth: '500px', width: '100%', padding: '48px 40px', position: 'relative' }}>

                    {submitted ? (
                        <div style={{ textAlign: 'center', animation: 'fade-up 0.4s ease' }}>
                            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(6,182,212,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                                <Sparkles size={32} color="var(--color-accent-cyan)" />
                            </div>
                            <h2 style={{ fontSize: '2rem', fontWeight: 700, color: 'white', marginBottom: '16px' }}>Trial Activated</h2>
                            <p style={{ color: 'var(--color-text-secondary)', marginBottom: '32px', lineHeight: 1.6 }}>
                                Your isolated Axiom OS workspace is provisioning. You will be redirected to the platform to configure your underwriting models.
                            </p>
                            <a href="https://app.buildaxiom.dev" className="btn btn-primary" style={{ width: '100%', padding: '14px' }}>
                                Enter Workspace <ArrowRight size={18} />
                            </a>
                        </div>
                    ) : (
                        <>
                            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                                <h1 style={{ fontSize: '2rem', fontWeight: 700, color: 'white', marginBottom: '12px', letterSpacing: '-0.5px' }}>
                                    Deploy Your <span className="text-gradient-accent">Free Trial</span>
                                </h1>
                                <p style={{ color: 'var(--color-text-secondary)' }}>
                                    Experience frictionless real estate underwriting and instantly generate your first Lender Binder.
                                </p>
                            </div>

                            <form onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                <div>
                                    <label style={{ display: 'block', color: 'var(--color-text-primary)', fontSize: '0.875rem', fontWeight: 500, marginBottom: '8px' }}>Full Name</label>
                                    <div style={{ position: 'relative' }}>
                                        <User size={18} color="var(--color-text-muted)" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                                        <input required type="text" placeholder="Jane Doe" style={{ width: '100%', padding: '14px 14px 14px 44px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', color: 'white', fontSize: '1rem', outline: 'none' }}
                                            onFocus={(e) => e.target.style.borderColor = 'var(--color-accent-cyan)'}
                                            onBlur={(e) => e.target.style.borderColor = 'var(--border-subtle)'} />
                                    </div>
                                </div>

                                <div>
                                    <label style={{ display: 'block', color: 'var(--color-text-primary)', fontSize: '0.875rem', fontWeight: 500, marginBottom: '8px' }}>Corporate Email</label>
                                    <div style={{ position: 'relative' }}>
                                        <Mail size={18} color="var(--color-text-muted)" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                                        <input required type="email" placeholder="jane@equityfirm.com" style={{ width: '100%', padding: '14px 14px 14px 44px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', color: 'white', fontSize: '1rem', outline: 'none' }}
                                            onFocus={(e) => e.target.style.borderColor = 'var(--color-accent-cyan)'}
                                            onBlur={(e) => e.target.style.borderColor = 'var(--border-subtle)'} />
                                    </div>
                                </div>

                                <div>
                                    <label style={{ display: 'block', color: 'var(--color-text-primary)', fontSize: '0.875rem', fontWeight: 500, marginBottom: '8px' }}>Company / Firm Name</label>
                                    <div style={{ position: 'relative' }}>
                                        <Building size={18} color="var(--color-text-muted)" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                                        <input required type="text" placeholder="Acme Capital Partners" style={{ width: '100%', padding: '14px 14px 14px 44px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', color: 'white', fontSize: '1rem', outline: 'none' }}
                                            onFocus={(e) => e.target.style.borderColor = 'var(--color-accent-cyan)'}
                                            onBlur={(e) => e.target.style.borderColor = 'var(--border-subtle)'} />
                                    </div>
                                </div>

                                <button type="submit" className="btn btn-primary" style={{ padding: '14px', fontSize: '1.05rem', marginTop: '12px' }}>
                                    Proceed to Platform <ArrowRight size={18} />
                                </button>
                            </form>
                        </>
                    )}
                </div>
            </main>
        </div>
    );
}

export default Trial;
