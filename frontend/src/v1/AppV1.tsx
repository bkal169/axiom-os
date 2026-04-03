import { AuthProvider, TierProvider } from "./context/AuthContext";
import { ProjectProvider } from "./context/ProjectContext";

// All feature modules are lazy-loaded — each becomes a separate chunk (~3-15 KB)
// downloaded only when the user navigates to that module.
import { lazy, Suspense, useState, useEffect, useRef } from "react";
import { useLS } from "./hooks/useLS";

const Dashboard = lazy(() => import("./features/dashboard/Dashboard").then(m => ({ default: m.Dashboard })));
const Contacts = lazy(() => import("./features/crm/Contacts").then(m => ({ default: m.Contacts })));
const Deals = lazy(() => import("./features/deals/Deals").then(m => ({ default: m.Deals })));
const DealAnalyzer = lazy(() => import("./features/financials/DealAnalyzer").then(m => ({ default: m.DealAnalyzer })));
const NeuralNet = lazy(() => import("./features/agents/NeuralNet").then(m => ({ default: m.NeuralNet })));
const Copilot = lazy(() => import("./features/agents/Copilot").then(m => ({ default: m.Copilot })));
const Financials = lazy(() => import("./features/financials/Financials").then(m => ({ default: m.Financials })));
const CalcHub = lazy(() => import("./features/financials/CalcHub").then(m => ({ default: m.CalcHub })));
const Invoices = lazy(() => import("./features/financials/Invoices").then(m => ({ default: m.Invoices })));
const SiteAnalysis = lazy(() => import("./features/analysis/SiteAnalysis").then(m => ({ default: m.SiteAnalysis })));
const Entitlements = lazy(() => import("./features/analysis/Entitlements").then(m => ({ default: m.Entitlements })));
const Infrastructure = lazy(() => import("./features/analysis/Infrastructure").then(m => ({ default: m.Infrastructure })));
const ConceptDesign = lazy(() => import("./features/analysis/ConceptDesign").then(m => ({ default: m.ConceptDesign })));
const SiteMap = lazy(() => import("./features/analysis/SiteMap").then(m => ({ default: m.SiteMap })));
const MLSListings = lazy(() => import("./features/analysis/MLSListings").then(m => ({ default: m.MLSListings })));
const DataIntel = lazy(() => import("./features/analysis/DataIntel").then(m => ({ default: m.DataIntel })));
const ProjectManagement = lazy(() => import("./features/management/ProjectManagement").then(m => ({ default: m.ProjectManagement })));
const RiskRegistry = lazy(() => import("./features/management/RiskRegistry").then(m => ({ default: m.RiskRegistry })));
const SiteManagement = lazy(() => import("./features/management/SiteManagement").then(m => ({ default: m.SiteManagement })));
const VendorNetwork = lazy(() => import("./features/management/VendorNetwork").then(m => ({ default: m.VendorNetwork })));
const ProfessionalNetwork = lazy(() => import("./features/management/ProfessionalNetwork").then(m => ({ default: m.ProfessionalNetwork })));
const MarketIntel = lazy(() => import("./features/analysis/MarketIntel").then(m => ({ default: m.MarketIntel })));
const AgentHub = lazy(() => import("./features/output/AgentHub").then(m => ({ default: m.AgentHub })));
const Reports = lazy(() => import("./features/output/Reports").then(m => ({ default: m.Reports })));
const Settings = lazy(() => import("./features/system/Settings").then(m => ({ default: m.Settings })));
const Connectors = lazy(() => import("./features/system/Connectors").then(m => ({ default: m.Connectors })));
const Billing = lazy(() => import("./features/system/Billing").then(m => ({ default: m.Billing })));
const LegalCompliance = lazy(() => import("./features/system/LegalCompliance").then(m => ({ default: m.LegalCompliance })));
const AuditLog = lazy(() => import("./features/security/AuditLog").then(m => ({ default: m.AuditLog })));
const Notes = lazy(() => import("./features/workspace/Notes").then(m => ({ default: m.Notes })));
const CalendarView = lazy(() => import("./features/workspace/CalendarView").then(m => ({ default: m.CalendarView })));
const Email = lazy(() => import("./features/workspace/Email").then(m => ({ default: m.Email })));
const Spreadsheets = lazy(() => import("./features/workspace/Spreadsheets").then(m => ({ default: m.Spreadsheets })));
const WorkflowHub = lazy(() => import("./features/agents/WorkflowHub").then(m => ({ default: m.WorkflowHub })));
const ResourceCenter = lazy(() => import("./features/workspace/ResourceCenter").then(m => ({ default: m.ResourceCenter })));
const JurisdictionIntel = lazy(() => import("./features/analysis/JurisdictionIntel").then(m => ({ default: m.JurisdictionIntel })));
const ProspectingEngine = lazy(() => import("./features/prospecting/ProspectingEngine").then(m => ({ default: m.ProspectingEngine })));
const FieldDashboard = lazy(() => import("./features/field/FieldDashboard"));
const PortfolioDashboard = lazy(() => import("./features/dashboard/PortfolioDashboard").then(m => ({ default: m.PortfolioDashboard })));
const GanttTimeline = lazy(() => import("./features/execution/GanttTimeline").then(m => ({ default: m.GanttTimeline })));
const DocumentVault = lazy(() => import("./features/workspace/DocumentVault").then(m => ({ default: m.DocumentVault })));
const LPReport = lazy(() => import("./features/output/LPReport").then(m => ({ default: m.LPReport })));

// V5 feature sections
const AgentPipelineSection = lazy(() => import("../v5/features/neural/AgentHandoff").then(m => ({ default: m.AgentHandoff })));
const RiskCalibrationDashboard = lazy(() => import("../v5/features/neural/RiskCalibrationDashboard").then(m => ({ default: m.RiskCalibrationDashboard })));
const TaxIntelPanel = lazy(() => import("../v5/features/tax/TaxIntelPanel").then(m => ({ default: m.TaxIntelPanel })));
const PortfolioGovernance = lazy(() => import("../v5/features/governance/PortfolioGovernance").then(m => ({ default: m.PortfolioGovernance })));
const SiteMap3D = lazy(() => import("../v5/features/gis/SiteMap3D").then(m => ({ default: m.SiteMap3D })));

// UI components — kept static: always needed, small
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
import "./components/ui/theme.css";

// ─── NAV STRUCTURE (matches V20 groups) ──────────────────────
const NAV_GROUPS = [
    {
        group: "OVERVIEW",
        items: [
            { id: "dashboard", label: "⬡ Command Center" },
            { id: "connectors", label: "⬡ Connectors & APIs" },
            { id: "portfolio", label: "⬡ Portfolio Dashboard" },
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
            { id: "sitemap3d", label: "⬡ Site Map 3D" },
        ],
    },
    {
        group: "INTEL",
        items: [
            { id: "market", label: "⬡ Market Intelligence" },
            { id: "mls", label: "⬡ MLS & Listings" },
            { id: "dataintel", label: "⬡ Data Intelligence" },
            { id: "jurisdintel", label: "⬡ Jurisdiction Intel" },
            { id: "taxintel", label: "⬡ Tax Intelligence" },
        ],
    },
    {
        group: "EXECUTION",
        items: [
            { id: "field", label: "⬡ Field Dashboard" },
            { id: "process", label: "⬡ Process Control" },
            { id: "risk", label: "⬡ Risk Command" },
            { id: "riskcal", label: "⬡ Risk Calibration" },
            { id: "sitemgmt", label: "⬡ Site Management" },
            { id: "vendors", label: "⬡ Vendor Network" },
            { id: "network", label: "⬡ Professional Network" },
            { id: "reports", label: "⬡ Reports & Binder" },
            { id: "gantt", label: "⬡ Project Timeline" },
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
            { id: "documents", label: "⬡ Document Vault" },
        ],
    },
    {
        group: "OUTPUT",
        items: [
            { id: "copilot", label: "⬡ Axiom Copilot" },
            { id: "neuralos", label: "⬡ Neural OS" },
            { id: "hub", label: "⬡ AI Agent Hub" },
            { id: "agentpipe", label: "⬡ Agent Pipeline" },
            { id: "governance", label: "⬡ Portfolio Governance" },
            { id: "lpreport", label: "⬡ LP Report" },
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

// ─── MODULE LOADING SHIMMER ─────────────────────────────────
function ModuleShimmer() {
    return (
        <div style={{ padding: 24 }}>
            <div style={{ height: 32, width: 200, background: "var(--c-bg3)", borderRadius: 4, marginBottom: 16, animation: "axiom-shimmer 1.4s ease-in-out infinite" }} />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 20 }}>
                {[1,2,3,4].map(i => <div key={i} style={{ height: 72, background: "var(--c-bg3)", borderRadius: 4, animation: `axiom-shimmer 1.4s ease-in-out ${i * 0.1}s infinite` }} />)}
            </div>
            <div style={{ height: 200, background: "var(--c-bg3)", borderRadius: 4, animation: "axiom-shimmer 1.4s ease-in-out 0.5s infinite" }} />
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
        case "taxintel": return <TaxIntelPanel />;
        // ─── V5 ──────────────────────────────────────────
        case "riskcal": return <RiskCalibrationDashboard supabase={supa} />;
        case "sitemap3d": return <SiteMap3D />;
        case "agentpipe": return <AgentPipelineSection dealId="" />;
        case "governance": return <PortfolioGovernance orgId="" supabase={supa} />;
        // ─── WORKSPACE ───────────────────────────────────
        case "notes": return <Notes />;
        case "calendar": return <CalendarView />;
        case "email": return <Email />;
        case "sheets": return <Spreadsheets />;
        case "workflows": return <WorkflowHub />;
        case "resources": return <ResourceCenter />;
        // ─── SPRINT 4+5 ─────────────────────────────
        case "portfolio": return <PortfolioDashboard />;
        case "gantt": return <GanttTimeline />;
        case "documents": return <DocumentVault />;
        case "lpreport": return <LPReport />;
        default: return <ComingSoon name={view} />;
    }
}

// ─── MAIN APP CONTENT ─────────────────────────────────────────
function AppContent() {
    const [view, setView] = useState("dashboard");
    const [isSplit, setIsSplit] = useState(false);
    const [splitView, setSplitView] = useState("notes");
    const [floatingPanels, setFloatingPanels] = useState<string[]>([]);
    const [sidebarCollapsed, setSidebarCollapsed] = useLS("axiom_sidebar_collapsed", false);
    const [cpOpen, setCpOpen] = useState(false);
    const [chatOpen, setChatOpen] = useState(false);
    const [meetingOpen, setMeetingOpen] = useState(false);
    const [dialerOpen, setDialerOpen] = useState(false);
    const [dialerData, setDialerData] = useState({ number: "", name: "" });
    const contentRef = useRef<HTMLDivElement>(null);

    // ─── Scroll Reset ──────────────────────────────────────────
    useEffect(() => {
        if (contentRef.current) {
            contentRef.current.scrollTop = 0;
            // Also reset split panes if they exist
            contentRef.current.querySelectorAll('.axiom-split-pane, .axiom-main-content-area > div').forEach(el => {
                el.scrollTop = 0;
            });
        }
    }, [view, isSplit]);

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
                <div ref={contentRef} className={`axiom-main-content-area ${isSplit ? 'split' : ''}`}>
                    <Suspense fallback={<ModuleShimmer />}>
                        {renderView(view, activeProjectId || "default")}
                    </Suspense>
                    {isSplit && (
                        <div className="axiom-split-pane">
                            <Suspense fallback={<ModuleShimmer />}>
                                {renderView(splitView, activeProjectId || "default")}
                            </Suspense>
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
