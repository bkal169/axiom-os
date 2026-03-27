import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import './index.css';
import { App } from './App';
import { AuthProvider } from './context/AuthContext';
import { DebugErrorBoundary } from './components/DebugErrorBoundary';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Failed to find the root element');

if (import.meta.env.DEV) console.log('Axiom: mounting router shell');

createRoot(rootElement).render(
  <StrictMode>
    <DebugErrorBoundary>
      {/* BrowserRouter must wrap AuthProvider because AuthProvider reads
          URL search params (founder override) via window.location — no dep on
          the router context, but keeping them co-located is cleaner. */}
      <BrowserRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
      <Analytics />
    </DebugErrorBoundary>
  </StrictMode>,
);

// Unregister any stale service worker — the old cache-first SW caused white
// screens by serving stale index.html forever. We no longer register a SW.
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then((regs) => {
    for (const reg of regs) reg.unregister();
  });
}
