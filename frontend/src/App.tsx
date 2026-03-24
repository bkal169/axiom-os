import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthGate } from './components/Auth/AuthGate';
import { LoginPage } from './pages/LoginPage';
import { LandingPage } from './pages/LandingPage';
import { PrivacyPolicy } from './pages/PrivacyPolicy';
import { TermsOfService } from './pages/TermsOfService';
import { RefundPolicy } from './pages/RefundPolicy';

// Modular AxiomOS app (JSX architecture)
// @ts-expect-error: JSX module, not typed
import AxiomModular from './jsx/AxiomApp';

// Marketing components
// @ts-expect-error: JSX module, not typed
import VanguardLanding from './jsx/components/Marketing/VanguardLanding';
// @ts-expect-error: JSX module, not typed
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
  hostname.startsWith('app.');

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
  // Login page is public; every other path requires authentication.
  // AxiomModular owns its own internal sidebar navigation, so mounting it
  // at /* works: React Router v6 just hands it the full URL, which it ignores.
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
  // Purely public. Session lives on the app domain, not here.
  // Login CTA in VanguardLanding links directly to app.buildaxiom.dev.
  return (
    <Routes>
      <Route path="/" element={<VanguardLanding />} />
      <Route path="/v1" element={<LandingPage />} />
      <Route path="/use-cases/:slug" element={<MicropageRenderer />} />
      <Route path="/privacy" element={<PrivacyPolicy />} />
      <Route path="/terms" element={<TermsOfService />} />
      <Route path="/refund" element={<RefundPolicy />} />

      {/* If someone lands on /login on the marketing domain,
          hard-redirect to the app domain's login page. */}
      <Route
        path="/login"
        element={<ExternalRedirect to="https://app.buildaxiom.dev/login" />}
      />

      {/* Catch-all → home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
