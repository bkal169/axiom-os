import React from 'react';

const S = {
    page: { backgroundColor: '#0A0A0A', color: '#ECECEC', minHeight: '100vh', fontFamily: 'Inter, sans-serif' } as React.CSSProperties,
    nav: { padding: '24px 48px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #222' } as React.CSSProperties,
    wrap: { maxWidth: 800, margin: '0 auto', padding: '64px 48px' } as React.CSSProperties,
    h1: { fontSize: 36, fontWeight: 800, color: '#fff', marginBottom: 8 } as React.CSSProperties,
    h2: { fontSize: 20, fontWeight: 700, color: '#fff', marginTop: 40, marginBottom: 12 } as React.CSSProperties,
    p: { color: '#94A3B8', lineHeight: 1.8, fontSize: 15, marginBottom: 16 } as React.CSSProperties,
    ul: { color: '#94A3B8', lineHeight: 1.8, fontSize: 15, paddingLeft: 24, marginBottom: 16 } as React.CSSProperties,
    meta: { color: '#64748B', fontSize: 13, marginBottom: 48 } as React.CSSProperties,
    box: { background: 'rgba(212,168,67,0.08)', border: '1px solid rgba(212,168,67,0.2)', borderRadius: 8, padding: '20px 24px', marginBottom: 32 } as React.CSSProperties,
    footer: { padding: '32px 48px', borderTop: '1px solid #222', textAlign: 'center' as const, color: '#64748B', fontSize: 13 },
};

export const RefundPolicy: React.FC = () => (
    <div style={S.page}>
        <nav style={S.nav}>
            <a href="/" style={{ fontSize: 20, fontWeight: 700, letterSpacing: '2px', color: '#fff', textDecoration: 'none' }}>
                ⬡ AXIOM<span style={{ color: '#D4A843' }}>OS</span>
            </a>
            <a href="/" style={{ color: '#888', fontSize: 14, textDecoration: 'none' }}>← Back to Home</a>
        </nav>

        <div style={S.wrap}>
            <h1 style={S.h1}>Refund & Cancellation Policy</h1>
            <p style={S.meta}>Last Updated: March 23, 2026</p>

            <div style={S.box}>
                <p style={{ ...S.p, marginBottom: 0, color: '#D4A843', fontWeight: 600 }}>Summary</p>
                <p style={{ ...S.p, marginBottom: 0 }}>Cancel anytime — access continues through your paid period. Refunds are available within 48 hours of your first charge or if we make a billing error. Usage-based charges are non-refundable.</p>
            </div>

            <h2 style={S.h2}>Cancellation</h2>
            <p style={S.p}><strong style={{ color: '#fff' }}>How to cancel:</strong></p>
            <ul style={S.ul}>
                <li>Log in to Axiom OS → go to <strong style={{ color: '#fff' }}>Billing</strong> → click <strong style={{ color: '#fff' }}>"Manage Subscription"</strong> → Cancel Plan</li>
                <li>Or email <a href="mailto:support@buildaxiom.dev" style={{ color: '#D4A843' }}>support@buildaxiom.dev</a> with subject "Cancel Subscription"</li>
            </ul>
            <p style={S.p}><strong style={{ color: '#fff' }}>When cancellation takes effect:</strong> At the end of your current billing period. You keep full access until then — no partial-month clawback.</p>
            <p style={S.p}><strong style={{ color: '#fff' }}>Downgrading:</strong> You can downgrade to a lower plan at any time. The new plan takes effect at the next billing cycle.</p>

            <h2 style={S.h2}>Refunds</h2>
            <p style={S.p}>We issue refunds in these situations:</p>
            <ul style={S.ul}>
                <li><strong style={{ color: '#fff' }}>New subscriber 48-hour guarantee</strong> — If you cancel within 48 hours of your very first subscription charge, you'll receive a full refund. One time per account.</li>
                <li><strong style={{ color: '#fff' }}>Billing error</strong> — Duplicate charge, wrong amount, or charge after documented cancellation. We'll refund within 5 business days.</li>
                <li><strong style={{ color: '#fff' }}>Extended downtime</strong> — If Axiom OS is unavailable for more than 24 consecutive hours in a given billing period due to our infrastructure failure, we'll pro-rate a credit for that period.</li>
            </ul>

            <h2 style={S.h2}>Non-Refundable Charges</h2>
            <ul style={S.ul}>
                <li>Monthly subscription fees after the 48-hour new-subscriber window</li>
                <li>Data marketplace charges (ATTOM, CoStar, Regrid, Anthropic compute) — these are usage-based and billed at cost once data is retrieved</li>
                <li>Annual plan fees after the first 14 days (if annual plans become available)</li>
            </ul>

            <h2 style={S.h2}>How to Request a Refund</h2>
            <p style={S.p}>Email <a href="mailto:support@buildaxiom.dev" style={{ color: '#D4A843' }}>support@buildaxiom.dev</a> within 30 days of the charge with:</p>
            <ul style={S.ul}>
                <li>Your account email address</li>
                <li>The charge date and amount</li>
                <li>Reason for the refund request</li>
            </ul>
            <p style={S.p}>We respond within 2 business days. Approved refunds are returned to your original payment method within 5–10 business days depending on your bank.</p>

            <h2 style={S.h2}>Enterprise & Boutique Plans</h2>
            <p style={S.p}>Enterprise and Enterprise+ contracts may have custom refund terms outlined in your agreement. Contact <a href="mailto:support@buildaxiom.dev" style={{ color: '#D4A843' }}>support@buildaxiom.dev</a> for assistance.</p>

            <h2 style={S.h2}>Contact</h2>
            <p style={S.p}>
                Juniper Rose Intelligence LLC<br />
                Sarasota, FL 34233<br />
                <a href="mailto:support@buildaxiom.dev" style={{ color: '#D4A843' }}>support@buildaxiom.dev</a>
            </p>
        </div>

        <footer style={S.footer}>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginBottom: 12 }}>
                <a href="/privacy" style={{ color: '#64748B', textDecoration: 'none' }}>Privacy Policy</a>
                <a href="/terms" style={{ color: '#64748B', textDecoration: 'none' }}>Terms of Service</a>
                <a href="mailto:support@buildaxiom.dev" style={{ color: '#64748B', textDecoration: 'none' }}>Support</a>
            </div>
            © 2026 Juniper Rose Intelligence LLC · Sarasota, FL
        </footer>
    </div>
);
