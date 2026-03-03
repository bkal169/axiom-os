import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

const LAST_UPDATED = 'March 1, 2026';

const Privacy = () => {
    useEffect(() => { window.scrollTo(0, 0); }, []);
    return (
        <>
            <Header />
            <main style={{ paddingTop: '120px', paddingBottom: '80px' }}>
                <div className="container" style={{ maxWidth: '780px' }}>
                    <div style={{ marginBottom: '48px' }}>
                        <div style={{ fontSize: '0.85rem', color: 'var(--color-accent-cyan)', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '12px' }}>Legal</div>
                        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '12px' }}>Privacy Policy</h1>
                        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>Last Updated: {LAST_UPDATED} · Effective immediately.</p>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '40px', color: 'var(--color-text-secondary)', lineHeight: 1.8, fontSize: '0.97rem' }}>
                        <Section title="1. Overview">
                            Axiom OS, Inc. ("Axiom OS," "we," "us," or "our") operates the platform available at buildaxiom.dev and app.buildaxiom.dev (the "Service"). This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our Service. By accessing or using Axiom OS, you agree to the collection and use of information in accordance with this policy.
                        </Section>

                        <Section title="2. Information We Collect">
                            <strong style={{ color: 'var(--color-text-primary)' }}>Account Information:</strong> When you register, we collect your name, email address, company name, and professional role. This information is used to create and manage your account.<br /><br />
                            <strong style={{ color: 'var(--color-text-primary)' }}>Platform Usage Data:</strong> We collect data you enter into the platform, including deal pipeline information, financial model inputs, due diligence notes, contact records, and AI agent queries. This data is used exclusively to power your workspace.<br /><br />
                            <strong style={{ color: 'var(--color-text-primary)' }}>Payment Information:</strong> Billing and payment data is processed directly by Stripe, Inc. Axiom OS does not store full credit card numbers. We receive and store a tokenized customer ID and subscription status provided by Stripe.<br /><br />
                            <strong style={{ color: 'var(--color-text-primary)' }}>Technical Data:</strong> We automatically collect IP address, browser type, device identifiers, referring URLs, and session activity logs for security, analytics, and product improvement.
                        </Section>

                        <Section title="3. How We Use Your Information">
                            We use your information to: (a) provide, maintain, and improve the Service; (b) process transactions and send billing-related communications; (c) respond to inquiries and customer support requests; (d) send product updates and marketing communications, with your consent; (e) monitor for security incidents, abuse, and compliance with our Terms of Service; and (f) comply with applicable laws and regulations.
                        </Section>

                        <Section title="4. Data Sharing and Disclosure">
                            We do not sell your personal data. We may share information with: (a) <strong style={{ color: 'var(--color-text-primary)' }}>Service Providers</strong> — third-party vendors including Supabase (database infrastructure), Stripe (payments), and Vercel (hosting) who process data solely on our behalf; (b) <strong style={{ color: 'var(--color-text-primary)' }}>Legal Compliance</strong> — if required by law, court order, or governmental regulation; (c) <strong style={{ color: 'var(--color-text-primary)' }}>Business Transfers</strong> — in connection with a merger, acquisition, or asset sale, with advance notice to users.
                        </Section>

                        <Section title="5. Data Retention">
                            We retain your account data for as long as your account is active or as needed to provide the Service. Upon account deletion, user-generated workspace data is purged within 30 days. Anonymized usage analytics may be retained indefinitely for product research.
                        </Section>

                        <Section title="6. Data Security">
                            We implement industry-standard technical and organizational safeguards including TLS encryption in transit, AES-256 encryption at rest, role-based access controls, and regular security audits. However, no method of transmission over the Internet is 100% secure, and we cannot guarantee absolute security.
                        </Section>

                        <Section title="7. Your Rights">
                            Depending on your jurisdiction, you may have the right to access, correct, or delete your personal data; restrict or object to processing; and request data portability. To exercise these rights, contact us at <a href="mailto:support@buildaxiom.dev" style={{ color: 'var(--color-accent-cyan)' }}>support@buildaxiom.dev</a>. We will respond within 30 days.
                        </Section>

                        <Section title="8. Cookies">
                            We use essential cookies for authentication and session management. Analytics cookies may be used to understand aggregate usage patterns. You may configure your browser to refuse cookies, though this may limit certain Service functionality.
                        </Section>

                        <Section title="9. Children's Privacy">
                            The Service is not directed to individuals under 18. We do not knowingly collect personal information from minors. If we become aware that a minor has provided us personal data, we will delete it immediately.
                        </Section>

                        <Section title="10. Changes to This Policy">
                            We may update this Privacy Policy periodically. Material changes will be announced via email or in-app notification at least 14 days prior to taking effect. Continued use of the Service after changes constitutes acceptance.
                        </Section>

                        <Section title="11. Contact">
                            For privacy-related questions, contact our Data Privacy team at: <a href="mailto:support@buildaxiom.dev" style={{ color: 'var(--color-accent-cyan)' }}>support@buildaxiom.dev</a> or via our <Link to="/contact" style={{ color: 'var(--color-accent-cyan)' }}>Contact page</Link>.
                        </Section>
                    </div>

                    <div style={{ marginTop: '60px', paddingTop: '32px', borderTop: '1px solid var(--border-subtle)', display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
                        <Link to="/terms" style={{ color: 'var(--color-accent-cyan)', fontSize: '0.9rem' }}>Terms of Service →</Link>
                        <Link to="/refunds" style={{ color: 'var(--color-accent-cyan)', fontSize: '0.9rem' }}>Refund Policy →</Link>
                        <Link to="/contact" style={{ color: 'var(--color-accent-cyan)', fontSize: '0.9rem' }}>Contact Us →</Link>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
};

function Section({ title, children }) {
    return (
        <div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '12px', paddingBottom: '8px', borderBottom: '1px solid var(--border-subtle)' }}>{title}</h2>
            <p style={{ margin: 0 }}>{children}</p>
        </div>
    );
}

export default Privacy;
