import { AuthProvider, TierProvider } from "./context/AuthContext";
import { ProjectProvider } from "./context/ProjectContext";
import { useState } from "react";
import { Dashboard } from "./features/dashboard/Dashboard";
import { Contacts } from "./features/crm/Contacts";
import { Deals } from "./features/deals/Deals";
import { NeuralAgents } from "./features/agents/NeuralAgents";
import { Financials } from "./features/financials/Financials";
import { SiteAnalysis } from "./features/analysis/SiteAnalysis";
import { ProjectManagement } from "./features/management/ProjectManagement";
import { RiskRegistry } from "./features/management/RiskRegistry";
import { MarketIntel } from "./features/analysis/MarketIntel";
// import { PropertyProfile } from "./features/analysis/PropertyProfile";
import { AgentHub } from "./features/output/AgentHub";
import { Reports } from "./features/output/Reports";
import { Settings } from "./features/system/Settings";
import { Connectors } from "./features/system/Connectors";
// import { DealFinancials } from "./features/financials/DealFinancials";
// import { CapStack } from "./features/financials/CapStack";
// import { RiskModels } from "./features/management/RiskModels";
import "./components/ui/theme.css";

function NavItem({ label, active, onClick }: { label: string, active: boolean, onClick: () => void }) {
    return (
        <div
            onClick={onClick}
            className={`axiom-sidebar-item ${active ? "active" : ""}`}
        >
            {label}
        </div>
    );
}

function AppContent() {
    const [view, setView] = useState("dashboard");

    return (
        <div className="axiom-layout">
            <div className="axiom-sidebar">
                <div className="axiom-sidebar-header">
                    AXIOM OS <span style={{ fontSize: 9, color: "var(--c-dim)", verticalAlign: "top" }}>V1</span>
                </div>
                <nav className="axiom-sidebar-nav">
                    <div className="axiom-breadcrumb" style={{ marginBottom: 12, paddingLeft: 12 }}>OVERVIEW</div>
                    <NavItem label="Command Center" active={view === "dashboard"} onClick={() => setView("dashboard")} />
                    <NavItem label="Contacts" active={view === "contacts"} onClick={() => setView("contacts")} />
                    <NavItem label="Deals Pipeline" active={view === "deals"} onClick={() => setView("deals")} />

                    <div className="axiom-breadcrumb" style={{ marginBottom: 12, marginTop: 20, paddingLeft: 12 }}>INTELLIGENCE</div>
                    <NavItem label="Property Profile" active={view === "profile"} onClick={() => setView("profile")} />
                    <NavItem label="Market Intel" active={view === "market"} onClick={() => setView("market")} />
                    <NavItem label="Site Analysis" active={view === "analysis"} onClick={() => setView("analysis")} />
                    <NavItem label="Neural Agents" active={view === "agents"} onClick={() => setView("agents")} />
                    <NavItem label="Agent Hub" active={view === "hub"} onClick={() => setView("hub")} />

                    <div className="axiom-breadcrumb" style={{ marginBottom: 12, marginTop: 20, paddingLeft: 12 }}>EXECUTION</div>
                    <NavItem label="Financials" active={view === "financials"} onClick={() => setView("financials")} />
                    <NavItem label="Deal Models" active={view === "deal-financials"} onClick={() => setView("deal-financials")} />
                    <NavItem label="Capital Stack" active={view === "capstack"} onClick={() => setView("capstack")} />
                    <NavItem label="Project Management" active={view === "process"} onClick={() => setView("process")} />
                    <NavItem label="Risk Command" active={view === "risk"} onClick={() => setView("risk")} />
                    <NavItem label="Risk Models" active={view === "riskmodels"} onClick={() => setView("riskmodels")} />
                    <NavItem label="Reports & Binders" active={view === "reports"} onClick={() => setView("reports")} />

                    <div className="axiom-breadcrumb" style={{ marginBottom: 12, marginTop: 20, paddingLeft: 12 }}>SYSTEM</div>
                    <NavItem label="Settings" active={view === "settings"} onClick={() => setView("settings")} />
                    <NavItem label="Connectors" active={view === "connectors"} onClick={() => setView("connectors")} />
                </nav>
            </div>
            <div className="axiom-main">
                {view === "dashboard" && <Dashboard projectId="default" />}
                {view === "contacts" && <Contacts />}
                {view === "deals" && <Deals />}
                {view === "profile" && <div style={{ padding: 24 }}>Property Profile module migrating to V2.</div>}
                {view === "market" && <MarketIntel projectId="default" />}
                {view === "analysis" && <SiteAnalysis projectId="default" />}
                {view === "agents" && <NeuralAgents />}
                {view === "hub" && <AgentHub />}
                {view === "financials" && <Financials />}
                {view === "deal-financials" && <div style={{ padding: 24 }}>Deal Financials module migrating to V2.</div>}
                {view === "capstack" && <div style={{ padding: 24 }}>Cap Stack module migrating to V2.</div>}
                {view === "process" && <ProjectManagement projectId="default" />}
                {view === "risk" && <RiskRegistry projectId="default" />}
                {view === "riskmodels" && <div style={{ padding: 24 }}>Risk Models module migrating to V2.</div>}
                {view === "reports" && <Reports />}
                {view === "settings" && <Settings />}
                {view === "connectors" && <Connectors />}
            </div>
        </div>
    );
}

export default function AppV1() {
    return (
        <AuthProvider>
            <TierProvider>
                <ProjectProvider>
                    <AppContent />
                </ProjectProvider>
            </TierProvider>
        </AuthProvider>
    );
}
