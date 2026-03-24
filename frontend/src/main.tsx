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

// Service Worker for offline support (Phase 6)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/service-worker.js')
      .then((reg) => { if (import.meta.env.DEV) console.log('SW registered:', reg.scope); })
      .catch((err) => console.warn('SW registration failed:', err));
  });
}
