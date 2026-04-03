import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthGate } from './components/Auth/AuthGate';
import { LoginPage } from './pages/LoginPage';
import { PrivacyPolicy } from './pages/PrivacyPolicy';
import { TermsOfService } from './pages/TermsOfService';
import { RefundPolicy } from './pages/RefundPolicy';
import { PricingPage } from './components/Billing/PricingPage';

// V1 modular app — the full-featured architecture with accordion sidebar,
// TopNav, split pane, chat panel, floating panels, command palette.
import AppV1 from './v1/AppV1';

// Marketing components
import VanguardLanding from './jsx/components/Marketing/VanguardLanding';
import MicropageRenderer from './jsx/components/Marketing/MicropageRenderer';

// ---------------------------------------------------------------------------
// Domain detection
//   app.buildaxiom.dev   → authenticated app shell
//   www.buildaxiom.dev   → consumer-facing marketing site
//   localhost / 127.*    → dev: treated as app domain
// ---------------------------------------------------------------------------
const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
export const IS_APP_DOMAIN =
  hostname === 'localhost' ||
  hostname.startsWith('127.') ||
  hostname === 'app.buildaxiom.dev' ||
  hostname.startsWith('app.') ||
  hostname.endsWith('.vercel.app');  // Vercel preview deployments → show app

// Cross-domain redirect helper (React Router <Navigate> is same-origin only)
const ExternalRedirect: React.FC<{ to: string }> = ({ to }) => {
  React.useEffect(() => {
    window.location.href = to;
  }, [to]);
  return null;
};

// ---------------------------------------------------------------------------
// App
// ---------------------------------------------------------------------------
export const App: React.FC = () => {
  // ── APP SHELL: app.buildaxiom.dev ──────────────────────────────────────
  if (IS_APP_DOMAIN) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        {/* Auth-gated shell — AppV1 wraps its own providers internally */}
        <Route element={<AuthGate />}>
          <Route path="/*" element={<AppV1 />} />
        </Route>

        {/* Safety fallback — AuthGate already redirects to /login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  // ── MARKETING SITE: www.buildaxiom.dev ────────────────────────────────
  return (
    <Routes>
      <Route path="/" element={<VanguardLanding />} />
      <Route path="/pricing" element={<PricingPage />} />
      <Route path="/use-cases/:slug" element={<MicropageRenderer />} />
      <Route path="/privacy" element={<PrivacyPolicy />} />
      <Route path="/terms" element={<TermsOfService />} />
      <Route path="/refund" element={<RefundPolicy />} />

      {/* /v1 was the old landing page — redirect to current home */}
      <Route path="/v1" element={<Navigate to="/" replace />} />

      {/* /login on marketing domain → hard-redirect to app domain */}
      <Route
        path="/login"
        element={<ExternalRedirect to="https://app.buildaxiom.dev/login" />}
      />

      {/* 404 */}
      <Route path="*" element={
        <div style={{ backgroundColor: '#0A0A0A', color: '#ECECEC', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, sans-serif', textAlign: 'center', padding: 48 }}>
          <div style={{ fontSize: 72, fontWeight: 800, fontFamily: 'Syne, Inter, sans-serif', marginBottom: 16 }}>
            4<span style={{ color: '#D4A843' }}>0</span>4
          </div>
          <p style={{ color: '#64748B', fontSize: 18, marginBottom: 32 }}>This page doesn't exist.</p>
          <a href="/" style={{ padding: '14px 32px', borderRadius: 8, background: '#D4A843', color: '#000', fontSize: 16, fontWeight: 700, textDecoration: 'none' }}>
            Back to Home
          </a>
        </div>
      } />
    </Routes>
  );
};
