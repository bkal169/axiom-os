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
    highlight: { background: 'rgba(212,168,67,0.08)', border: '1px solid rgba(212,168,67,0.2)', borderRadius: 8, padding: '16px 20px', marginBottom: 24 } as React.CSSProperties,
    footer: { padding: '32px 48px', borderTop: '1px solid #222', textAlign: 'center' as const, color: '#64748B', fontSize: 13 },
};

export const TermsOfService: React.FC = () => (
    <div style={S.page}>
        <nav style={S.nav}>
            <a href="/" style={{ fontSize: 20, fontWeight: 700, letterSpacing: '2px', color: '#fff', textDecoration: 'none' }}>
                ⬡ AXIOM<span style={{ color: '#D4A843' }}>OS</span>
            </a>
            <a href="/" style={{ color: '#888', fontSize: 14, textDecoration: 'none' }}>← Back to Home</a>
        </nav>

        <div style={S.wrap}>
            <h1 style={S.h1}>Terms of Service</h1>
            <p style={S.meta}>Last Updated: March 23, 2026 · Effective: March 23, 2026</p>

            <p style={S.p}>
                These Terms of Service ("Terms") govern your access to and use of Axiom OS ("Service"), operated by Juniper Rose Intelligence LLC ("Company," "we," "us"). By creating an account or using the Service, you agree to these Terms.
            </p>

            <h2 style={S.h2}>1. The Service</h2>
            <p style={S.p}>Axiom OS is a SaaS real estate intelligence and underwriting platform providing financial modeling, spatial analysis, AI-assisted underwriting, market data aggregation, and deal management tools. Features available to you depend on your subscription tier as defined at <a href="/pricing" style={{ color: '#D4A843' }}>buildaxiom.dev/pricing</a>.</p>

            <h2 style={S.h2}>2. Accounts & Eligibility</h2>
            <ul style={S.ul}>
                <li>You must be at least 18 years old and able to form a binding contract.</li>
                <li>You are responsible for maintaining the confidentiality of your login credentials.</li>
                <li>One account per natural person unless your plan includes multiple seats.</li>
                <li>You agree to provide accurate, current information during registration.</li>
            </ul>

            <h2 style={S.h2}>3. Subscription Plans & Billing</h2>
            <div style={S.highlight}>
                <p style={{ ...S.p, marginBottom: 8 }}><strong style={{ color: '#D4A843' }}>Current Plans:</strong></p>
                <ul style={{ ...S.ul, marginBottom: 0 }}>
                    <li><strong style={{ color: '#fff' }}>Free</strong> — $0/mo · 3 deals · 5 analysis runs/day</li>
                    <li><strong style={{ color: '#fff' }}>Pro</strong> — $100/mo · Unlimited deals · 200 runs/day · Export & Compare</li>
                    <li><strong style={{ color: '#fff' }}>Pro+</strong> — $200/mo · 1,000 runs/day · Agent Pipeline · Neural Scoring · Tax Intelligence</li>
                    <li><strong style={{ color: '#fff' }}>Boutique</strong> — $500/mo · 5,000 runs/day · Field Mode · Up to 5 seats</li>
                    <li><strong style={{ color: '#fff' }}>Enterprise</strong> — $1,500/mo · 50,000 runs/day · API Access · Up to 25 seats</li>
                    <li><strong style={{ color: '#fff' }}>Enterprise+</strong> — Custom pricing · Unlimited · White-glove onboarding</li>
                </ul>
            </div>
            <p style={S.p}>Subscriptions are billed monthly in advance. Your subscription renews automatically on the same day each month until cancelled. All prices are in USD.</p>
            <p style={S.p}>Plan limits (runs per day, deal count, feature gates) are enforced in real-time. Exceeding limits will result in temporary restriction until the next billing cycle or an upgrade.</p>

            <h2 style={S.h2}>4. Cancellation Policy</h2>
            <div style={S.highlight}>
                <p style={{ ...S.p, marginBottom: 8 }}><strong style={{ color: '#D4A843' }}>How to Cancel:</strong> Log in → Billing → "Manage Subscription" → Cancel. Alternatively email <a href="mailto:support@buildaxiom.dev" style={{ color: '#D4A843' }}>support@buildaxiom.dev</a>.</p>
                <p style={{ ...S.p, marginBottom: 0 }}><strong style={{ color: '#D4A843' }}>When It Takes Effect:</strong> Cancellation takes effect at the end of your current paid billing period. You retain full access until that date.</p>
            </div>

            <h2 style={S.h2}>5. Refund Policy</h2>
            <p style={S.p}><strong style={{ color: '#fff' }}>Monthly subscriptions</strong> are non-refundable except in the following cases:</p>
            <ul style={S.ul}>
                <li>You were charged in error (duplicate charge, incorrect amount)</li>
                <li>The Service was unavailable for more than 24 consecutive hours in a billing period due to our fault</li>
                <li>You cancel within 48 hours of your first-ever charge (new subscriber only, one time)</li>
            </ul>
            <p style={S.p}>To request a refund, email <a href="mailto:support@buildaxiom.dev" style={{ color: '#D4A843' }}>support@buildaxiom.dev</a> within 30 days of the charge with your account email and reason. Approved refunds are credited back to the original payment method within 5–10 business days.</p>
            <p style={S.p}>Data marketplace charges (ATTOM, CoStar, Anthropic compute) are usage-based and non-refundable once the data has been retrieved.</p>

            <h2 style={S.h2}>6. Acceptable Use</h2>
            <p style={S.p}>You agree not to:</p>
            <ul style={S.ul}>
                <li>Reverse engineer, decompile, or attempt to extract source code</li>
                <li>Share login credentials or resell access to the Service</li>
                <li>Use the Service to train competing AI models</li>
                <li>Scrape or bulk-export data in violation of third-party data provider terms</li>
                <li>Use the AI Copilot to generate illegal, defamatory, or fraudulent content</li>
                <li>Attempt to circumvent plan limits or billing controls</li>
            </ul>

            <h2 style={S.h2}>7. Intellectual Property</h2>
            <p style={S.p}>The Axiom OS platform, branding, and underlying technology are owned by Juniper Rose Intelligence LLC. Your project data, financial models, and documents remain your property. You grant us a limited license to process your data solely to provide the Service.</p>

            <h2 style={S.h2}>8. Disclaimer of Warranties</h2>
            <p style={S.p}>THE SERVICE IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND. AXIOM OS OUTPUTS ARE FOR INFORMATIONAL PURPOSES ONLY AND DO NOT CONSTITUTE FINANCIAL, LEGAL, OR INVESTMENT ADVICE. YOU ARE SOLELY RESPONSIBLE FOR ALL INVESTMENT DECISIONS.</p>

            <h2 style={S.h2}>9. Limitation of Liability</h2>
            <p style={S.p}>TO THE MAXIMUM EXTENT PERMITTED BY LAW, OUR LIABILITY TO YOU FOR ANY CAUSE OF ACTION SHALL NOT EXCEED THE AMOUNT YOU PAID US IN THE 3 MONTHS PRECEDING THE CLAIM. WE ARE NOT LIABLE FOR INDIRECT, INCIDENTAL, OR CONSEQUENTIAL DAMAGES.</p>

            <h2 style={S.h2}>10. Governing Law</h2>
            <p style={S.p}>These Terms are governed by the laws of the State of Florida, without regard to conflict of law principles. Disputes shall be resolved in the courts of Sarasota County, Florida.</p>

            <h2 style={S.h2}>11. Changes to Terms</h2>
            <p style={S.p}>We may update these Terms. We will notify you by email at least 14 days before material changes take effect. Continued use after the effective date constitutes acceptance.</p>

            <h2 style={S.h2}>12. Contact</h2>
            <p style={S.p}>
                Juniper Rose Intelligence LLC<br />
                Sarasota, FL 34233<br />
                Email: <a href="mailto:support@buildaxiom.dev" style={{ color: '#D4A843' }}>support@buildaxiom.dev</a><br />
                Enterprise: <a href="mailto:support@buildaxiom.dev" style={{ color: '#D4A843' }}>support@buildaxiom.dev</a>
            </p>
        </div>

        <footer style={S.footer}>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginBottom: 12 }}>
                <a href="/privacy" style={{ color: '#64748B', textDecoration: 'none' }}>Privacy Policy</a>
                <a href="/refund" style={{ color: '#64748B', textDecoration: 'none' }}>Refund Policy</a>
                <a href="mailto:support@buildaxiom.dev" style={{ color: '#64748B', textDecoration: 'none' }}>Support</a>
            </div>
            © 2026 Juniper Rose Intelligence LLC · Sarasota, FL
        </footer>
    </div>
);
