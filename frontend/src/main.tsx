import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
// @ts-ignore - AxiomOS_v17.jsx is not typed
import App from './AxiomOS_v17.jsx';
import AppV1 from './v1/AppV1';
import { DebugErrorBoundary } from './components/DebugErrorBoundary';
import { Analytics } from '@vercel/analytics/react';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Failed to find the root element');
}

console.log('Mounting React Application...');

const USE_V1_ARCHITECTURE = false; // Toggle this to true to boot the new modular V1

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
