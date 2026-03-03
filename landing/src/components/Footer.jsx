import React from 'react';
import { Link } from 'react-router-dom';
import { Hexagon, Twitter, Linkedin, Mail } from 'lucide-react';

const Footer = () => {
    return (
        <footer style={{
            background: 'var(--color-bg-surface)',
            borderTop: '1px solid var(--border-subtle)',
            padding: '80px 0 40px 0',
            marginTop: '100px'
        }}>
            <div className="container" style={{
                display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '48px', marginBottom: '80px'
            }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <a href="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', color: 'white' }}>
                        <img src="/logo-full.png" alt="Axiom OS" style={{ height: '32px', width: 'auto', display: 'block' }}
                            onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
                        <div style={{ display: 'none', alignItems: 'center', gap: '8px' }}>
                            <Hexagon size={24} color="var(--color-accent-purple)" />
                            <span style={{ fontSize: '1.25rem', fontWeight: 700, letterSpacing: '-0.5px' }}>
                                Axiom<span className="text-gradient">OS</span>
                            </span>
                        </div>
                    </a>
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem', lineHeight: 1.6 }}>
                        The AI execution engine for modern real estate sponsors and developers.
                    </p>
                    <div style={{ display: 'flex', gap: '16px' }}>
                        <a href="#" style={{ color: 'var(--color-text-muted)' }}><Twitter size={20} /></a>
                        <a href="#" style={{ color: 'var(--color-text-muted)' }}><Linkedin size={20} /></a>
                    </div>
                </div>

                <div>
                    <h4 style={{ color: 'white', fontWeight: 600, marginBottom: '20px' }}>Product</h4>
                    <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <li><a href="#features" style={{ color: 'var(--color-text-secondary)', textDecoration: 'none' }}>Features</a></li>
                        <li><a href="#pricing" style={{ color: 'var(--color-text-secondary)', textDecoration: 'none' }}>Pricing</a></li>
                        <li><a href="https://app.buildaxiom.dev" style={{ color: 'var(--color-text-secondary)', textDecoration: 'none' }}>Log In</a></li>
                    </ul>
                </div>

                <div>
                    <h4 style={{ color: 'white', fontWeight: 600, marginBottom: '20px' }}>Legal</h4>
                    <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <li><Link to="/privacy" style={{ color: 'var(--color-text-secondary)', textDecoration: 'none' }}>Privacy Policy</Link></li>
                        <li><Link to="/terms" style={{ color: 'var(--color-text-secondary)', textDecoration: 'none' }}>Terms of Service</Link></li>
                        <li><Link to="/refunds" style={{ color: 'var(--color-text-secondary)', textDecoration: 'none' }}>Refund Policy</Link></li>
                    </ul>
                </div>

                <div>
                    <h4 style={{ color: 'white', fontWeight: 600, marginBottom: '20px' }}>Support</h4>
                    <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <li><Link to="/contact" style={{ color: 'var(--color-text-secondary)', textDecoration: 'none' }}>Contact Us</Link></li>
                        <li><Link to="/support" style={{ color: 'var(--color-text-secondary)', textDecoration: 'none' }}>Support Center</Link></li>
                        <li><a href="mailto:support@buildaxiom.dev" style={{ color: 'var(--color-text-secondary)', textDecoration: 'none' }}>support@buildaxiom.dev</a></li>
                        <li><span style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', cursor: 'pointer' }} onClick={() => { const el = document.getElementById('axiom-chatbot-toggle'); if (el) el.click(); }}>Live Chat ↗</span></li>
                    </ul>
                </div>
            </div>

            <div className="container" style={{
                borderTop: '1px solid var(--border-subtle)', paddingTop: '32px',
                display: 'flex', justifyContent: 'space-between', color: 'var(--color-text-muted)', fontSize: '0.85rem'
            }}>
                <p>&copy; {new Date().getFullYear()} Axiom OS. All rights reserved.</p>
                <p>Built for Execution.</p>
            </div>
        </footer>
    );
}

export default Footer;
