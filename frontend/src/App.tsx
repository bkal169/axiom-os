import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthGate } from './components/Auth/AuthGate';
import { LoginPage } from './pages/LoginPage';
import { PrivacyPolicy } from './pages/PrivacyPolicy';
import { TermsOfService } from './pages/TermsOfService';
import { RefundPolicy } from './pages/RefundPolicy';
import { PricingPage } from './components/Billing/PricingPage';

// Modular AxiomOS app (JSX architecture) — typed via src/types/jsx-modules.d.ts
import AxiomModular from './jsx/AxiomApp';

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

        {/* Auth-gated shell */}
        <Route element={<AuthGate />}>
          <Route path="/*" element={<AxiomModular />} />
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

      {/* Catch-all → home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
