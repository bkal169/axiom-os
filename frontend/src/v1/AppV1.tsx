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
import { WorkflowHub } from "./features/agents/WorkflowHub";
import { ResourceCenter } from "./features/workspace/ResourceCenter";
import { JurisdictionIntel } from "./features/analysis/JurisdictionIntel";
import { ProspectingEngine } from "./features/prospecting/ProspectingEngine";
import FieldDashboard from "./features/field/FieldDashboard";
import { TopNav } from "./components/layout/TopNav";
import { AuthGate, OnboardingWizard } from "./components/auth/AuthGate";
import { supa } from "./lib/supabase";
import { useAuth } from "./context/AuthContext";
import { useProject } from "./context/ProjectContext";
import { DataExplorerModal } from "./components/ui/components";
import { CommandPalette } from "./components/ui/CommandPalette";
import { ChatPanel } from "./components/ui/ChatPanel";
import { TickerStrip } from "./components/ui/TickerStrip";
import { FloatingToolbar } from "./components/ui/FloatingToolbar";
import { MeetingRecorder } from "./components/ui/MeetingRecorder";
import { FloatingPanel } from "./components/ui/FloatingPanel";
import { Dialer } from "./components/ui/components";
import { useEffect } from "react";
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
            { id: "prospecting", label: "⬡ Prospecting Engine" },
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
            { id: "field", label: "⬡ Field Dashboard" },
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
            <div className="axiom-nav-section-icon-mode">
                {items.map(item => (
                    <div
                        key={item.id}
                        onClick={() => onSelect(item.id)}
                        title={item.label.replace("⬡ ", "")}
                        className={`axiom-nav-item-icon ${activeView === item.id ? 'active' : ''}`}
                    >
                        ◆
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="axiom-mb-4">
            {/* Section header — clickable to collapse */}
            <div
                onClick={() => setOpen((o: any) => !o)}
                className="axiom-nav-section-header"
            >
                <span className="axiom-nav-section-label">
                    {group}
                </span>
                <span className={`axiom-nav-section-caret ${open ? 'open' : ''}`}>
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
                        className={`axiom-nav-item ${isActive ? 'active' : ''}`}
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
        case "prospecting": return <ProspectingEngine />;
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
        case "field": return <FieldDashboard />;
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
        case "audit": return <div className="axiom-p-0"><AuditLog /></div>;
        // ─── INTEL ───────────────────────────────────────
        case "jurisdintel": return <JurisdictionIntel />;
        // ─── WORKSPACE ───────────────────────────────────
        case "notes": return <Notes />;
        case "calendar": return <CalendarView />;
        case "email": return <Email />;
        case "sheets": return <Spreadsheets />;
        case "workflows": return <WorkflowHub />;
        case "resources": return <ResourceCenter />;
        default: return <ComingSoon name={view} />;
    }
}

// ─── MAIN APP CONTENT ─────────────────────────────────────────
function AppContent() {
    const [view, setView] = useState("dashboard");
    const [isSplit, setIsSplit] = useState(false);
    const [splitView, setSplitView] = useState("notes");
    const [floatingPanels, setFloatingPanels] = useState<string[]>([]);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [cpOpen, setCpOpen] = useState(false);
    const [chatOpen, setChatOpen] = useState(false);
    const [meetingOpen, setMeetingOpen] = useState(false);
    const [dialerOpen, setDialerOpen] = useState(false);
    const [dialerData, setDialerData] = useState({ number: '', name: '' });
    const [tickerOpen, setTickerOpen] = useState(true);
    const { activeProjectId, chartSel, setChartSel } = useProject() as unknown as { activeProjectId: string | null; chartSel: string | null; setChartSel: (sel: string | null) => void };

    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "k") {
                e.preventDefault();
                setCpOpen(prev => !prev);
            }
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, []);

    // ─── Global Event Listeners ─────────────────────────────────
    useEffect(() => {
        const handleOpenDialer = (e: Event) => {
            const customEvent = e as CustomEvent;
            setDialerOpen(true);
            setDialerData(customEvent.detail || { number: '', name: '' });
        };
        const handleGotoView = (e: Event) => {
            const customEvent = e as CustomEvent;
            if (customEvent.detail) setView(customEvent.detail);
        };
        window.addEventListener("axiom_open_dialer", handleOpenDialer);
        window.addEventListener("axiom_goto_view", handleGotoView);
        return () => {
            window.removeEventListener("axiom_open_dialer", handleOpenDialer);
            window.removeEventListener("axiom_goto_view", handleGotoView);
        };
    }, []);

    const sidebarWidth = sidebarCollapsed ? 54 : 220;

    return (
        <div className="axiom-layout">
            {/* ─── SIDEBAR ──────────────────────────────────── */}
            <div className={`axiom-sidebar ${sidebarCollapsed ? 'collapsed' : ''}`} style={{ width: sidebarWidth, minWidth: sidebarWidth }}>
                {/* Header */}
                <div className={`axiom-sidebar-header ${sidebarCollapsed ? 'collapsed' : ''}`}>
                    {!sidebarCollapsed && (
                        <div className="axiom-sidebar-logo">
                            AXIOM <span className="axiom-sidebar-logo-os">OS</span>
                        </div>
                    )}
                    <button
                        onClick={() => setSidebarCollapsed((c: any) => !c)}
                        title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                        className="axiom-sidebar-toggle"
                    >
                        {sidebarCollapsed ? "▶" : "◀"}
                    </button>
                </div>

                {/* ⌘K Search trigger */}
                {!sidebarCollapsed && (
                    <button
                        onClick={() => setCpOpen(true)}
                        title="Search Axiom OS (Ctrl+K / ⌘K)"
                        className="axiom-sidebar-search-btn"
                    >
                        <span className="axiom-text-13">⌕</span>
                        <span className="axiom-flex-1">Search...</span>
                        <kbd className="axiom-kbd">⌘K</kbd>
                    </button>
                )}

                {/* Nav */}
                <nav className="axiom-sidebar-nav">
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
                    <div className="axiom-sidebar-footer">
                        AXIOM OS · V1 · 2026
                    </div>
                )}
            </div>

            {/* ─── MAIN CONTENT ─────────────────────────────── */}
            <div className="axiom-main-content-col">
                <TopNav
                    title={NAV_GROUPS.flatMap(g => g.items).find(i => i.id === view)?.label?.replace("⬡ ", "")?.toUpperCase() || "COMMAND CENTER"}
                    setView={setView}
                    tickerOpen={tickerOpen} setTickerOpen={setTickerOpen}
                    chatOpen={chatOpen} setChatOpen={setChatOpen}
                    meetingOpen={meetingOpen} setMeetingOpen={setMeetingOpen}
                    isSplit={isSplit} setIsSplit={setIsSplit}
                    splitView={splitView} setSplitView={setSplitView}
                    onDetach={() => setFloatingPanels((prev: any) => [...prev, view])}
                />
                <div className={`axiom-main-content-area ${isSplit ? 'split' : ''}`}>
                    {renderView(view, activeProjectId || "default")}
                    {isSplit && (
                        <div className="axiom-split-pane">
                            {renderView(splitView, activeProjectId || "default")}
                        </div>
                    )}
                </div>
            </div>

            {/* Global Modals */}
            {chartSel && <DataExplorerModal data={chartSel} onClose={() => setChartSel(null)} />}

            {/* Global Command Palette */}
            <CommandPalette
                open={cpOpen}
                onClose={() => setCpOpen(false)}
                onNavigate={(id) => { setView(id); setCpOpen(false); }}
            />

            {/* Phase 4 Overlays */}
            {floatingPanels.map((fp: any, idx: number) => (
                <FloatingPanel
                    key={`${fp}-${idx}`}
                    id={fp}
                    title={NAV_GROUPS.flatMap(g => g.items).find(i => i.id === fp)?.label?.replace("⬡ ", "") || "Panel"}
                    onClose={() => setFloatingPanels((prev: any) => prev.filter((_: any, i: number) => i !== idx))}
                    initialX={200 + (idx * 30)}
                    initialY={200 + (idx * 30)}
                >
                    {renderView(fp, activeProjectId || "default")}
                </FloatingPanel>
            ))}

            <ChatPanel open={chatOpen} onClose={() => setChatOpen(false)} />
            <TickerStrip visible={tickerOpen} />
            <FloatingToolbar />
            <MeetingRecorder open={meetingOpen} onClose={() => setMeetingOpen(false)} />
            <Dialer open={dialerOpen} onClose={() => setDialerOpen(false)} initialNumber={dialerData.number} initialName={dialerData.name} />
        </div>
    );
}

// ─── AUTH ROUTER ────────────────────────────────────────────────
function AuthRouter() {
    const authCtx = useAuth();
    const projCtx = useProject();
    if (!authCtx || !projCtx) return null;

    const { user, userProfile, authLoading } = authCtx;
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
