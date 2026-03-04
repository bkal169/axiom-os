import { AuthProvider, TierProvider } from "./context/AuthContext";
import { ProjectProvider } from "./context/ProjectContext";
import { useState } from "react";
import { Dashboard } from "./features/dashboard/Dashboard";
import { Contacts } from "./features/crm/Contacts";
import { Deals } from "./features/deals/Deals";
import { DealAnalyzer } from "./features/financials/DealAnalyzer";
import { NeuralNet } from "./features/agents/NeuralNet";
import { Copilot } from "./features/agents/Copilot";
import { Financials } from "./features/financials/Financials";
import { CalcHub } from "./features/financials/CalcHub";
import { Invoices } from "./features/financials/Invoices";
import { SiteAnalysis } from "./features/analysis/SiteAnalysis";
import { Entitlements } from "./features/analysis/Entitlements";
import { Infrastructure } from "./features/analysis/Infrastructure";
import { ConceptDesign } from "./features/analysis/ConceptDesign";
import { SiteMap } from "./features/analysis/SiteMap";
import { MLSListings } from "./features/analysis/MLSListings";
import { DataIntel } from "./features/analysis/DataIntel";
import { ProjectManagement } from "./features/management/ProjectManagement";
import { RiskRegistry } from "./features/management/RiskRegistry";
import { SiteManagement } from "./features/management/SiteManagement";
import { VendorNetwork } from "./features/management/VendorNetwork";
import { ProfessionalNetwork } from "./features/management/ProfessionalNetwork";
import { MarketIntel } from "./features/analysis/MarketIntel";
import { AgentHub } from "./features/output/AgentHub";
import { Reports } from "./features/output/Reports";
import { Settings } from "./features/system/Settings";
import { Connectors } from "./features/system/Connectors";
import { Billing } from "./features/system/Billing";
import { LegalCompliance } from "./features/system/LegalCompliance";
import { AuditLog } from "./features/security/AuditLog";
import { Notes } from "./features/workspace/Notes";
import { CalendarView } from "./features/workspace/CalendarView";
import { Email } from "./features/workspace/Email";
import { Spreadsheets } from "./features/workspace/Spreadsheets";
import { Workflows } from "./features/workspace/Workflows";
import { ResourceCenter } from "./features/workspace/ResourceCenter";
import { JurisdictionIntel } from "./features/analysis/JurisdictionIntel";
import { TopNav } from "./components/layout/TopNav";
import { AuthGate, OnboardingWizard } from "./components/auth/AuthGate";
import { supa } from "./lib/supabase";
import { useAuth } from "./context/AuthContext";
import { useProject } from "./context/ProjectContext";
import { DataExplorerModal } from "./components/ui/components";
import "./components/ui/theme.css";

// ─── NAV STRUCTURE (matches V20 groups) ──────────────────────
const NAV_GROUPS = [
    {
        group: "OVERVIEW",
        items: [
            { id: "dashboard", label: "⬡ Command Center" },
            { id: "connectors", label: "⬡ Connectors & APIs" },
        ],
    },
    {
        group: "CRM",
        items: [
            { id: "contacts", label: "⬡ Contacts" },
            { id: "deals", label: "⬡ Deal Pipeline" },
            { id: "analyzer", label: "⬡ Deal Analyzer" },
        ],
    },
    {
        group: "FINANCE",
        items: [
            { id: "financials", label: "⬡ Financial Engine" },
            { id: "calchub", label: "⬡ Calculator Hub" },
            { id: "invoices", label: "⬡ Invoices & Payments" },
        ],
    },
    {
        group: "SITE",
        items: [
            { id: "analysis", label: "⬡ Site & Entitlements" },
            { id: "entitlements", label: "⬡ Entitlements" },
            { id: "infrastructure", label: "⬡ Infrastructure" },
            { id: "concept", label: "⬡ Concept Design" },
            { id: "sitemap", label: "⬡ Site Map" },
        ],
    },
    {
        group: "INTEL",
        items: [
            { id: "market", label: "⬡ Market Intelligence" },
            { id: "mls", label: "⬡ MLS & Listings" },
            { id: "dataintel", label: "⬡ Data Intelligence" },
            { id: "jurisdintel", label: "⬡ Jurisdiction Intel" },
        ],
    },
    {
        group: "EXECUTION",
        items: [
            { id: "process", label: "⬡ Process Control" },
            { id: "risk", label: "⬡ Risk Command" },
            { id: "sitemgmt", label: "⬡ Site Management" },
            { id: "vendors", label: "⬡ Vendor Network" },
            { id: "network", label: "⬡ Professional Network" },
            { id: "reports", label: "⬡ Reports & Binder" },
        ],
    },
    {
        group: "WORKSPACE",
        items: [
            { id: "notes", label: "⬡ Notes" },
            { id: "calendar", label: "⬡ Calendar" },
            { id: "email", label: "⬡ Email" },
            { id: "sheets", label: "⬡ Spreadsheets" },
            { id: "workflows", label: "⬡ Workflows" },
            { id: "resources", label: "⬡ Resource Center" },
        ],
    },
    {
        group: "OUTPUT",
        items: [
            { id: "copilot", label: "⬡ Axiom Copilot" },
            { id: "neuralos", label: "⬡ Neural OS" },
            { id: "hub", label: "⬡ AI Agent Hub" },
        ],
    },
    {
        group: "SYSTEM",
        items: [
            { id: "settings", label: "⬡ Settings" },
            { id: "billing", label: "⬡ Billing & Plans" },
            { id: "legal", label: "⬡ Legal & Compliance" },
        ],
    },
    {
        group: "SECURITY",
        items: [
            { id: "audit", label: "⬡ Audit Log" },
        ],
    },
];

// ─── ACCORDION NAV SECTION ───────────────────────────────────
function NavSection({
    group, items, activeView, onSelect, collapsed: sidebarCollapsed
}: {
    group: string;
    items: { id: string; label: string }[];
    activeView: string;
    onSelect: (id: string) => void;
    collapsed: boolean;
}) {
    const [open, setOpen] = useState(false);

    if (sidebarCollapsed) {
        // Icon-only mode: show dots
        return (
            <div style={{ padding: "4px 0", borderBottom: "1px solid var(--c-border)" }}>
                {items.map(item => (
                    <div
                        key={item.id}
                        onClick={() => onSelect(item.id)}
                        title={item.label.replace("⬡ ", "")}
                        style={{
                            width: 40, height: 36,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            cursor: "pointer",
                            borderRadius: 4,
                            margin: "1px auto",
                            background: activeView === item.id ? "var(--c-bg4)" : "transparent",
                            color: activeView === item.id ? "var(--c-gold)" : "var(--c-muted)",
                            fontSize: 14,
                            transition: "all 0.15s",
                        }}
                    >
                        ◆
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div style={{ marginBottom: 4 }}>
            {/* Section header — clickable to collapse */}
            <div
                onClick={() => setOpen(o => !o)}
                style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "6px 10px 5px",
                    cursor: "pointer",
                    userSelect: "none",
                }}
            >
                <span style={{
                    fontSize: 9, letterSpacing: "2.5px", color: "var(--c-dim)",
                    textTransform: "uppercase", fontWeight: 700,
                }}>
                    {group}
                </span>
                <span style={{
                    fontSize: 9, color: "var(--c-dim)",
                    transform: open ? "rotate(0deg)" : "rotate(-90deg)",
                    transition: "transform 0.2s",
                    lineHeight: 1,
                }}>
                    ▾
                </span>
            </div>

            {/* Items */}
            {open && items.map(item => {
                const isActive = activeView === item.id;
                return (
                    <div
                        key={item.id}
                        onClick={() => onSelect(item.id)}
                        style={{
                            display: "flex", alignItems: "center",
                            padding: "8px 12px 8px 14px",
                            cursor: "pointer",
                            borderRadius: 4,
                            margin: "1px 4px",
                            fontSize: 12,
                            fontWeight: isActive ? 600 : 400,
                            color: isActive ? "var(--c-gold)" : "var(--c-sub)",
                            background: isActive ? "color-mix(in srgb, var(--c-gold) 8%, var(--c-bg3))" : "transparent",
                            borderLeft: isActive ? "2px solid var(--c-gold)" : "2px solid transparent",
                            transition: "all 0.15s",
                            letterSpacing: "0.3px",
                        }}
                        onMouseEnter={e => {
                            if (!isActive) {
                                (e.currentTarget as HTMLElement).style.background = "var(--c-bg3)";
                                (e.currentTarget as HTMLElement).style.color = "var(--c-text)";
                            }
                        }}
                        onMouseLeave={e => {
                            if (!isActive) {
                                (e.currentTarget as HTMLElement).style.background = "transparent";
                                (e.currentTarget as HTMLElement).style.color = "var(--c-sub)";
                            }
                        }}
                    >
                        {item.label}
                    </div>
                );
            })}
        </div>
    );
}

// ─── PLACEHOLDER FOR STUB SCREENS ───────────────────────────
function ComingSoon({ name }: { name: string }) {
    return (
        <div style={{ padding: 32 }}>
            <div style={{ fontSize: 10, letterSpacing: 3, color: "var(--c-dim)", textTransform: "uppercase", marginBottom: 8 }}>
                Module
            </div>
            <div style={{ fontSize: 28, fontWeight: 200, color: "var(--c-text)", marginBottom: 16 }}>
                {name}
            </div>
            <div style={{ color: "var(--c-muted)", fontSize: 13 }}>
                This module is being elevated to V1 architecture. Core data is available — full UI coming in the next sprint.
            </div>
        </div>
    );
}

// ─── VIEW RENDERER ────────────────────────────────────────────
function renderView(view: string, activeProjectId: string) {
    switch (view) {
        case "dashboard": return <Dashboard projectId={activeProjectId} />;
        case "contacts": return <Contacts />;
        case "deals": return <Deals />;
        case "analyzer": return <DealAnalyzer />;
        // ─── INTEL ───────────────────────────────────────
        case "market": return <MarketIntel projectId={activeProjectId} />;
        case "mls": return <MLSListings />;
        case "dataintel": return <DataIntel />;
        // ─── SITE ────────────────────────────────────────
        case "analysis": return <SiteAnalysis projectId={activeProjectId} />;
        case "entitlements": return <Entitlements projectId={activeProjectId} />;
        case "infrastructure": return <Infrastructure projectId={activeProjectId} />;
        case "concept": return <ConceptDesign projectId={activeProjectId} />;
        case "sitemap": return <SiteMap projectId={activeProjectId} />;
        // ─── FINANCE ─────────────────────────────────────
        case "financials": return <Financials />;
        case "calchub": return <CalcHub />;
        case "invoices": return <Invoices />;
        // ─── EXECUTION ───────────────────────────────────
        case "process": return <ProjectManagement projectId={activeProjectId} />;
        case "risk": return <RiskRegistry projectId={activeProjectId} />;
        case "sitemgmt": return <SiteManagement />;
        case "vendors": return <VendorNetwork />;
        case "network": return <ProfessionalNetwork />;
        case "reports": return <Reports />;
        // ─── OUTPUT ──────────────────────────────────────
        case "copilot": return <Copilot />;
        case "neuralos": return <NeuralNet />;
        case "hub": return <AgentHub />;
        // ─── SYSTEM ──────────────────────────────────────
        case "settings": return <Settings />;
        case "connectors": return <Connectors />;
        case "billing": return <Billing />;
        case "legal": return <LegalCompliance />;
        // ─── SECURITY ────────────────────────────────────
        case "audit": return <div style={{ padding: 0 }}><AuditLog /></div>;
        // ─── INTEL ───────────────────────────────────────
        case "jurisdintel": return <JurisdictionIntel />;
        // ─── WORKSPACE ───────────────────────────────────
        case "notes": return <Notes />;
        case "calendar": return <CalendarView />;
        case "email": return <Email />;
        case "sheets": return <Spreadsheets />;
        case "workflows": return <Workflows />;
        case "resources": return <ResourceCenter />;
        default: return <ComingSoon name={view} />;
    }
}

// ─── MAIN APP CONTENT ─────────────────────────────────────────
function AppContent() {
    const [view, setView] = useState("dashboard");
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const { activeProjectId, chartSel, setChartSel } = useProject() as any;

    const sidebarWidth = sidebarCollapsed ? 54 : 220;

    return (
        <div className="axiom-layout">
            {/* ─── SIDEBAR ──────────────────────────────────── */}
            <div style={{
                width: sidebarWidth,
                minWidth: sidebarWidth,
                background: "#09090D",
                borderRight: "1px solid var(--c-border)",
                display: "flex",
                flexDirection: "column",
                transition: "width 0.22s cubic-bezier(0.4, 0, 0.2, 1), min-width 0.22s cubic-bezier(0.4, 0, 0.2, 1)",
                overflow: "hidden",
            }}>
                {/* Header */}
                <div style={{
                    padding: sidebarCollapsed ? "16px 0" : "16px 18px",
                    borderBottom: "1px solid var(--c-border)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: sidebarCollapsed ? "center" : "space-between",
                    flexShrink: 0,
                }}>
                    {!sidebarCollapsed && (
                        <div style={{
                            fontSize: 11, fontWeight: 800, letterSpacing: "3px",
                            color: "var(--c-gold)",
                        }}>
                            AXIOM <span style={{ fontSize: 8, color: "var(--c-dim)", verticalAlign: "top" }}>OS</span>
                        </div>
                    )}
                    <button
                        onClick={() => setSidebarCollapsed(c => !c)}
                        title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                        style={{
                            background: "transparent", border: "none",
                            cursor: "pointer", padding: "2px 4px",
                            color: "var(--c-dim)", fontSize: 14,
                            lineHeight: 1, borderRadius: 3,
                            transition: "color 0.15s",
                        }}
                        onMouseEnter={e => (e.currentTarget.style.color = "var(--c-text)")}
                        onMouseLeave={e => (e.currentTarget.style.color = "var(--c-dim)")}
                    >
                        {sidebarCollapsed ? "▶" : "◀"}
                    </button>
                </div>

                {/* Nav */}
                <nav style={{ flex: 1, overflowY: "auto", padding: "10px 0", overflowX: "hidden" }}>
                    {NAV_GROUPS.map(g => (
                        <NavSection
                            key={g.group}
                            group={g.group}
                            items={g.items}
                            activeView={view}
                            onSelect={setView}
                            collapsed={sidebarCollapsed}
                        />
                    ))}
                </nav>

                {/* Footer version */}
                {!sidebarCollapsed && (
                    <div style={{
                        padding: "10px 14px",
                        borderTop: "1px solid var(--c-border)",
                        fontSize: 9, letterSpacing: 2,
                        color: "var(--c-dim)",
                    }}>
                        AXIOM OS · V1 · 2026
                    </div>
                )}
            </div>

            {/* ─── MAIN CONTENT ─────────────────────────────── */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
                <TopNav title={NAV_GROUPS.flatMap(g => g.items).find(i => i.id === view)?.label?.replace("⬡ ", "")?.toUpperCase() || "COMMAND CENTER"} setView={setView} />
                <div style={{ flex: 1, overflowY: "auto", padding: "24px 32px", position: "relative" }}>
                    {renderView(view, activeProjectId || "default")}
                </div>
            </div>

            {/* Global Modals */}
            {chartSel && <DataExplorerModal data={chartSel} onClose={() => setChartSel(null)} />}
        </div>
    );
}

// ─── AUTH ROUTER ────────────────────────────────────────────────
function AuthRouter() {
    const authCtx = useAuth() as any;
    const { user, userProfile, authLoading } = authCtx;
    const projCtx = useProject() as any;
    const { allProjects, createProject } = projCtx;

    // Show login gate if Supabase configured but not logged in
    if (supa.configured() && !user && !authLoading) {
        return <AuthGate />;
    }

    // Show onboarding if logged in but not onboarded and no projects exist
    if (user && userProfile && !userProfile.onboarded && !allProjects?.length) {
        return <OnboardingWizard onComplete={async (orgName, state) => {
            // Create first project for the user
            await createProject(`${orgName} - First Project`, state, "");
            // Mark as onboarded in DB
            if (supa.configured()) {
                supa.update("organizations", { id: userProfile.org_id }, { name: orgName }).catch(() => { });
                supa.update("user_profiles", { id: user.id }, { onboarded: true }).catch(() => { });
            }
            // Minor delay to let state catch up
            setTimeout(() => window.location.reload(), 500);
        }} />;
    }

    return <AppContent />;
}

// ─── ROOT ─────────────────────────────────────────────────────
export default function AppV1() {
    return (
        <AuthProvider>
            <TierProvider>
                <ProjectProvider>
                    <AuthRouter />
                </ProjectProvider>
            </TierProvider>
        </AuthProvider>
    );
}
