import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthGate } from './components/Auth/AuthGate';
import { AppLayout } from './components/Layout/AppLayout';
import { LoginPage } from './pages/LoginPage';
import { LandingPage } from './pages/LandingPage';
import { DealsPage } from './pages/DealsPage';
import { CalculatorsPage } from './pages/CalculatorsPage';
import { DataPage } from './components/Data/DataPage';
import { PricingPage } from './components/Billing/PricingPage';
import { DashboardPage } from './components/Dashboard/DashboardPage';
import { ContactsPage } from './components/CRM/ContactsPage';
import AxiomApp from './pages/AxiomApp';
// DealsPage imported
// CalculatorsPage imported
// DataPage imported
// DealsPage imported
// CalculatorsPage imported
// DataPage imported

export const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/axiom" element={<AxiomApp />} />

      <Route element={<AuthGate />}>
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/deals" element={<DealsPage />} />
          <Route path="/calculators" element={<CalculatorsPage />} />
          <Route path="/data" element={<DataPage />} />
          <Route path="/contacts" element={<ContactsPage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/axiom" element={<AxiomApp />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};
