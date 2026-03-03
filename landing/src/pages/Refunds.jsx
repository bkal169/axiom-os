import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

const LAST_UPDATED = 'March 1, 2026';

const Refunds = () => {
    useEffect(() => { window.scrollTo(0, 0); }, []);
    return (
        <>
            <Header />
            <main style={{ paddingTop: '120px', paddingBottom: '80px' }}>
                <div className="container" style={{ maxWidth: '780px' }}>
                    <div style={{ marginBottom: '48px' }}>
                        <div style={{ fontSize: '0.85rem', color: 'var(--color-accent-cyan)', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '12px' }}>Legal</div>
                        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '12px' }}>Refund Policy</h1>
                        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>Last Updated: {LAST_UPDATED}</p>
                    </div>

                    {/* Summary box */}
                    <div className="glass-panel" style={{ padding: '24px 28px', marginBottom: '48px', borderLeft: '3px solid var(--color-accent-cyan)' }}>
                        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-accent-cyan)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Summary</div>
                        <p style={{ color: 'var(--color-text-secondary)', margin: 0, lineHeight: 1.7 }}>
                            We offer a <strong style={{ color: 'white' }}>7-day money-back guarantee</strong> on your first paid month. Subscriptions can be cancelled at any time. Annual plans are refundable within 30 days of purchase.
                        </p>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '40px', color: 'var(--color-text-secondary)', lineHeight: 1.8, fontSize: '0.97rem' }}>
                        <Section title="1. Free Trial">
                            Axiom OS offers a free tier with no credit card required. You can explore the platform's core features at no cost. No refund is applicable to the Free plan as no payment is taken.
                        </Section>

                        <Section title="2. 7-Day Money-Back Guarantee">
                            If you subscribe to a paid plan (Pro, Pro+, or Enterprise) and are not satisfied with the Service, you may request a full refund within <strong style={{ color: 'white' }}>7 calendar days</strong> of your first charge. To request a refund under this guarantee, contact <a href="mailto:support@buildaxiom.dev" style={{ color: 'var(--color-accent-cyan)' }}>support@buildaxiom.dev</a> with your account email and reason for cancellation. Refunds under this guarantee are limited to one per customer.
                        </Section>

                        <Section title="3. Monthly Subscriptions">
                            After the 7-day guarantee period, monthly subscription payments are <strong style={{ color: 'white' }}>non-refundable</strong>. You may cancel at any time through your Billing settings in the app, and your access will continue until the end of the current billing period. You will not be charged again after cancellation.
                        </Section>

                        <Section title="4. Annual Plans">
                            Annual subscription payments are refundable within <strong style={{ color: 'white' }}>30 days</strong> of the initial purchase date. After 30 days, annual plans are non-refundable, but you may downgrade or cancel to prevent future renewal charges.
                        </Section>

                        <Section title="5. Partial Refunds">
                            We do not offer partial refunds for unused portions of the subscription period, mid-cycle downgrades, or temporary non-use of the platform. If you believe exceptional circumstances warrant a partial refund, contact our support team and we will review your case on an individual basis.
                        </Section>

                        <Section title="6. Enterprise Contracts">
                            Enterprise plans negotiated with custom pricing and SLAs are subject to the refund terms stated in the individual Master Service Agreement (MSA) executed with Axiom OS. In the absence of a separate MSA, the standard refund policy above applies.
                        </Section>

                        <Section title="7. Disputed Charges">
                            If you believe you have been charged in error, contact <a href="mailto:support@buildaxiom.dev" style={{ color: 'var(--color-accent-cyan)' }}>support@buildaxiom.dev</a> before initiating a chargeback with your card issuer. We will investigate and resolve valid billing errors within 5 business days. Unresolved chargebacks may result in account suspension.
                        </Section>

                        <Section title="8. How to Cancel or Request a Refund">
                            <strong style={{ color: 'white' }}>To cancel your subscription:</strong> Log in to the app → Billing → Manage Billing → Cancel Plan.<br /><br />
                            <strong style={{ color: 'white' }}>To request a refund:</strong> Email <a href="mailto:support@buildaxiom.dev" style={{ color: 'var(--color-accent-cyan)' }}>support@buildaxiom.dev</a> with subject line "Refund Request" and include your registered email address and the reason for your request. Approved refunds are processed within 5–10 business days to your original payment method.
                        </Section>
                    </div>

                    <div style={{ marginTop: '60px', paddingTop: '32px', borderTop: '1px solid var(--border-subtle)', display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
                        <Link to="/privacy" style={{ color: 'var(--color-accent-cyan)', fontSize: '0.9rem' }}>Privacy Policy →</Link>
                        <Link to="/terms" style={{ color: 'var(--color-accent-cyan)', fontSize: '0.9rem' }}>Terms of Service →</Link>
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

export default Refunds;
