import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Analytics } from '@vercel/analytics/react';
import './index.css';
// @ts-ignore - AxiomOS_v20.jsx is not typed
import App from './AxiomOS_v20.jsx';
import AppV1 from './v1/AppV1';
import { DebugErrorBoundary } from './components/DebugErrorBoundary';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Failed to find the root element');
}

console.log('Mounting React Application...');

const USE_V1_ARCHITECTURE = true; // V1 modular architecture — all features live

const ActiveApp = USE_V1_ARCHITECTURE ? AppV1 : App;

try {
  createRoot(rootElement).render(
    <StrictMode>
      <DebugErrorBoundary>
        <ActiveApp />
        <Analytics />
      </DebugErrorBoundary>
    </StrictMode>,
  );
  console.log('React Mount call successful');
} catch (e) {
  console.error('Failed to render app', e);
  rootElement.innerHTML = `<div style="padding: 20px; color: red;"><h1>App Crashed</h1><pre>${e}</pre></div>`;
}

// Service Worker Registration for Phase 6 (Offline Support)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(reg => console.log('SW registered:', reg))
      .catch(err => console.error('SW reg failed:', err));
  });
}

