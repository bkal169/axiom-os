import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Trial from './pages/Trial';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import Refunds from './pages/Refunds';
import Contact from './pages/Contact';
import AIChatbot from './components/AIChatbot';

function App() {
  return (
    <div style={{ position: 'relative', overflow: 'hidden', minHeight: '100vh' }}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/trial" element={<Trial />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/refunds" element={<Refunds />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/support" element={<Contact />} />
      </Routes>

      {/* Universal Chatbot accessible on all pages */}
      <AIChatbot />
    </div>
  );
}

export default App;
