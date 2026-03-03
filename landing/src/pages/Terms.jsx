import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

const LAST_UPDATED = 'March 1, 2026';

const Terms = () => {
    useEffect(() => { window.scrollTo(0, 0); }, []);
    return (
        <>
            <Header />
            <main style={{ paddingTop: '120px', paddingBottom: '80px' }}>
                <div className="container" style={{ maxWidth: '780px' }}>
                    <div style={{ marginBottom: '48px' }}>
                        <div style={{ fontSize: '0.85rem', color: 'var(--color-accent-cyan)', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '12px' }}>Legal</div>
                        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '12px' }}>Terms of Service</h1>
                        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>Last Updated: {LAST_UPDATED} · By creating an account, you agree to these Terms.</p>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '40px', color: 'var(--color-text-secondary)', lineHeight: 1.8, fontSize: '0.97rem' }}>
                        <Section title="1. Acceptance of Terms">
                            These Terms of Service ("Terms") constitute a legally binding agreement between you ("User," "you," or "your") and Axiom OS, Inc. ("Axiom OS," "we," or "us"). By accessing or using our platform at buildaxiom.dev or app.buildaxiom.dev (the "Service"), you agree to be bound by these Terms. If you do not agree, do not use the Service.
                        </Section>

                        <Section title="2. Description of Service">
                            Axiom OS is a real estate development intelligence platform providing AI-powered tools for deal pipeline management, financial modeling, market analysis, due diligence, and automated output generation (including IC Memos). The Service is available on a Software-as-a-Service (SaaS) subscription basis under the tiers described in our current Pricing page.
                        </Section>

                        <Section title="3. Account Registration">
                            You must provide accurate, current, and complete information during registration and keep your account credentials secure. You are responsible for all activity that occurs under your account. You must be at least 18 years of age and have legal authority to enter contracts to register. Corporate users represent that they have authority to bind their organization to these Terms.
                        </Section>

                        <Section title="4. Subscription Plans and Billing">
                            <strong style={{ color: 'var(--color-text-primary)' }}>Free Plan:</strong> Available at no charge with limited features (up to 5 active deals, 3 AI sessions/day).<br /><br />
                            <strong style={{ color: 'var(--color-text-primary)' }}>Pro Plan ($29/month):</strong> 50 active deals, 25 AI sessions/day, CSV/PDF exports, IC Memo generation, MLS data feeds.<br /><br />
                            <strong style={{ color: 'var(--color-text-primary)' }}>Pro+ Plan ($99/month):</strong> Unlimited deals and AI sessions, team collaboration (5 seats), API access, jurisdiction intelligence, white-label reports.<br /><br />
                            <strong style={{ color: 'var(--color-text-primary)' }}>Enterprise Plan ($499/month):</strong> All Pro+ features plus unlimited seats, custom AI training, 99.9% uptime SLA, dedicated success manager, optional on-premise deployment.<br /><br />
                            Subscriptions are billed monthly and renew automatically. Billing is processed by Stripe. You authorize Axiom OS to charge your payment method on each billing cycle.
                        </Section>

                        <Section title="5. Acceptable Use">
                            You agree not to: (a) use the Service for unlawful purposes or in violation of any applicable laws; (b) attempt to gain unauthorized access to any portion of the Service or its infrastructure; (c) reverse engineer, decompile, or disassemble any component of the Service; (d) use automated systems to scrape, crawl, or extract data without our consent; (e) transmit malware, spam, or harmful content; (f) resell, sublicense, or make the Service commercially available to third parties without written permission; or (g) use the AI features to generate misleading financial representations or fraudulent documents.
                        </Section>

                        <Section title="6. Intellectual Property">
                            All content, features, and functionality of the Service (excluding user-generated data) are owned by Axiom OS and protected by U.S. and international copyright, trademark, patent, trade secret, and other intellectual property laws. You are granted a limited, non-exclusive, non-transferable, revocable license to access and use the Service solely for your internal business purposes.
                        </Section>

                        <Section title="7. User Data and AI-Generated Content">
                            You retain full ownership of all data, documents, and information you input into the Service ("User Data"). By submitting User Data, you grant Axiom OS a limited license to process it solely to deliver the Service features. AI-generated content (IC Memos, reports, analyses) is provided for informational purposes only and does not constitute legal, financial, or investment advice. You are solely responsible for verifying the accuracy of AI-generated outputs before relying on them.
                        </Section>

                        <Section title="8. Confidentiality">
                            Both parties agree to maintain the confidentiality of proprietary information disclosed in connection with the Service. Axiom OS will handle your User Data in accordance with our Privacy Policy. You agree not to disclose non-public features, pricing, or roadmap information obtained through the Service.
                        </Section>

                        <Section title="9. Disclaimer of Warranties">
                            THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. AXIOM OS DOES NOT WARRANT THAT THE SERVICE WILL BE ERROR-FREE, UNINTERRUPTED, OR THAT OUTPUTS WILL BE ACCURATE OR COMPLETE.
                        </Section>

                        <Section title="10. Limitation of Liability">
                            TO THE MAXIMUM EXTENT PERMITTED BY LAW, AXIOM OS SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING LOSS OF PROFITS, DATA, BUSINESS OPPORTUNITIES, OR GOODWILL. IN NO EVENT SHALL AXIOM OS'S AGGREGATE LIABILITY EXCEED THE AMOUNTS PAID BY YOU IN THE TWELVE (12) MONTHS PRECEDING THE CLAIM.
                        </Section>

                        <Section title="11. Termination">
                            You may cancel your subscription at any time through your billing settings. Axiom OS may suspend or terminate your account immediately for material breach of these Terms, fraudulent activity, or non-payment. Upon termination, your right to access the Service ceases. User data will be retained for 30 days post-termination, after which it will be deleted.
                        </Section>

                        <Section title="12. Governing Law">
                            These Terms shall be governed by and construed in accordance with the laws of the State of Delaware, without regard to conflict of law provisions. Any disputes shall be resolved by binding arbitration under the rules of the American Arbitration Association, with proceedings conducted in English in Delaware. You waive any right to participate in class-action proceedings.
                        </Section>

                        <Section title="13. Modifications">
                            We reserve the right to modify these Terms at any time. Material changes will be communicated via email or in-app notice at least 14 days in advance. Continued use after changes constitutes acceptance. If you disagree with modifications, you may cancel your subscription before the changes take effect.
                        </Section>

                        <Section title="14. Contact">
                            Legal inquiries and notices should be directed to: <a href="mailto:support@buildaxiom.dev" style={{ color: 'var(--color-accent-cyan)' }}>support@buildaxiom.dev</a> · Axiom OS, Inc.
                        </Section>
                    </div>

                    <div style={{ marginTop: '60px', paddingTop: '32px', borderTop: '1px solid var(--border-subtle)', display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
                        <Link to="/privacy" style={{ color: 'var(--color-accent-cyan)', fontSize: '0.9rem' }}>Privacy Policy →</Link>
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

export default Terms;
