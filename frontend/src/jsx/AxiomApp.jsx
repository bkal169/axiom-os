import React, { useState, useEffect, lazy, Suspense } from 'react';
import { C, S, NAV, US_STATES, TITLE_MAP } from './constants';
import { useLS } from './utils';
import { ProjectContext } from './context/ProjectContext';
import { DEFAULT_FIN, DEFAULT_RISKS, DEFAULT_PERMITS } from './data/defaults';

// UI Components — kept static: always needed, small
import { Sidebar } from './components/UI/Sidebar';
import { CommandKModal } from './components/UI/CommandKModal';
import { DataExplorerModal } from './components/UI/DataExplorerModal';
import { NotifBell } from './components/UI/NotifBell';
import { PremiereStyles } from './components/UI/PremiereStyles';

// P2-2: Lazy-load all modules so only the active view is downloaded.
// Each import() becomes a separate chunk → eliminates the 3.38 MB monolith.
const Dashboard        = lazy(() => import('./components/Modules/Dashboard'));
const Connectors       = lazy(() => import('./components/Modules/Connectors'));
const Contacts         = lazy(() => import('./components/Modules/Contacts'));
const DealPipeline     = lazy(() => import('./components/Modules/DealPipeline'));
const DealAnalyzer     = lazy(() => import('./components/Modules/DealAnalyzer'));
const FinancialEngine  = lazy(() => import('./components/Modules/FinancialEngine'));
const InvoicesPayments = lazy(() => import('./components/Modules/InvoicesPayments'));
const CalcHub          = lazy(() => import('./components/Modules/CalcHub'));
const SiteEntitlements = lazy(() => import('./components/Modules/SiteEntitlements'));
const Infrastructure   = lazy(() => import('./components/Modules/Infrastructure'));
const ConceptDesign    = lazy(() => import('./components/Modules/ConceptDesign'));
const VendorNetwork    = lazy(() => import('./components/Modules/VendorNetwork'));
const MarketIntelligence = lazy(() => import('./components/Modules/MarketIntelligence'));
const MLSListings      = lazy(() => import('./components/Modules/MLSListings'));
const DataIntel        = lazy(() => import('./components/Modules/DataIntel'));
const JurisdictionIntel = lazy(() => import('./components/Modules/JurisdictionIntel'));
const ProcessControl   = lazy(() => import('./components/Modules/ProcessControl'));
const SiteManagement   = lazy(() => import('./components/Modules/SiteManagement'));
const RiskCommand      = lazy(() => import('./components/Modules/RiskCommand'));
const Notes            = lazy(() => import('./components/Modules/Notes'));
const FullCalendar     = lazy(() => import('./components/Modules/Calendar'));
const EmailSection     = lazy(() => import('./components/Modules/Email.jsx'));
const Spreadsheets     = lazy(() => import('./components/Modules/Spreadsheets'));
const Workflows        = lazy(() => import('./components/Modules/Workflows'));
const ResourceCenter   = lazy(() => import('./components/Modules/ResourceCenter'));
const ReportsBinder    = lazy(() => import('./components/Modules/ReportsBinder'));
const AgentHub         = lazy(() => import('./components/Modules/AgentHub'));
const CopilotPanel     = lazy(() => import('./components/Modules/Copilot'));
const NeuralNet        = lazy(() => import('./components/Modules/NeuralNet'));
const BillingPlans     = lazy(() => import('./components/Modules/BillingPlans'));
const Legal            = lazy(() => import('./components/Modules/Legal'));
const SystemSettings   = lazy(() => import('./components/Modules/SystemSettings'));

// V5 feature sections
const AgentPipelineSection     = lazy(() => import('./sections/AgentPipelineSection'));
const RiskCalibrationSection   = lazy(() => import('./sections/RiskCalibrationSection'));
const TaxIntelSection          = lazy(() => import('./sections/TaxIntelSection'));
const PortfolioGovernanceSection = lazy(() => import('./sections/PortfolioGovernanceSection'));
const SiteMap3DSection         = lazy(() => import('./sections/SiteMap3DSection'));

// Component reference map — do NOT pre-construct JSX here.
// The active module is resolved and rendered inside <Suspense> below.
const SECTIONS = {
    dashboard: Dashboard,    connectors: Connectors,
    contacts: Contacts,      pipeline: DealPipeline,    analyzer: DealAnalyzer,
    financial: FinancialEngine, invoices: InvoicesPayments, calchub: CalcHub,
    site: SiteEntitlements,  infrastructure: Infrastructure, design: ConceptDesign, network: VendorNetwork,
    market: MarketIntelligence, mls: MLSListings, dataintel: DataIntel, juris: JurisdictionIntel,
    process: ProcessControl, sitemgmt: SiteManagement, risk: RiskCommand,
    notes: Notes,            calendar: FullCalendar,   email: EmailSection,
    sheets: Spreadsheets,    workflows: Workflows,      resources: ResourceCenter,
    reports: ReportsBinder,  agents: AgentHub,          copilot: CopilotPanel, neural: NeuralNet,
    billing: BillingPlans,   legal: Legal,              settings: SystemSettings,
    agent_pipeline: AgentPipelineSection,
    risk_calibration: RiskCalibrationSection,
    tax_intel: TaxIntelSection,
    portfolio_governance: PortfolioGovernanceSection,
    site_map_3d: SiteMap3DSection,
};

const ModuleFallback = () => (
    <div style={{ padding: 40, textAlign: "center", color: C.dim, fontSize: 13 }}>
        Loading…
    </div>
);

export default function AxiomApp() {
    const [active, setActive] = useState("dashboard");
    const [collapsed, setCollapsed] = useLS("axiom_side_collapsed", false);
    const [lightMode, setLightMode] = useLS("axiom_light_mode", false);
    const [chartSel, setChartSel] = useState(null);
    const [cmdKOpen, setCmdKOpen] = useState(false);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setCmdKOpen(prev => !prev); }
            if (e.key === 'Escape') setCmdKOpen(false);
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    useEffect(() => {
        if (lightMode) document.body.classList.add('light-mode');
        else document.body.classList.remove('light-mode');
    }, [lightMode]);

    const [project, setProject] = useLS("axiom_project", { name: "New Development", address: "", jurisdiction: "", state: "", municipality: "" });
    const [fin, setFin] = useLS("axiom_fin", DEFAULT_FIN);
    const [risks, setRisks] = useLS("axiom_risks", DEFAULT_RISKS);
    const [permits, setPermits] = useLS("axiom_permits", DEFAULT_PERMITS);
    const [ddChecks, setDdChecks] = useLS("axiom_dd", {});
    const [vendors, setVendors] = useLS("axiom_vendors", []);

    // BUG-C2 fix: chartSel/setChartSel were defined here but never included in ctx,
    // so child components calling setChartSel would throw ReferenceError.
    const ctx = { project, setProject, fin, setFin, risks, setRisks, permits, setPermits, ddChecks, setDdChecks, vendors, setVendors, chartSel, setChartSel };

    const ActiveModule = SECTIONS[active] || null;

    return (
        <ProjectContext.Provider value={ctx}>
            <PremiereStyles />
            <div style={S.app}>
                <Sidebar active={active} setActive={setActive} collapsed={collapsed} setCollapsed={setCollapsed} />
                <div style={{ ...S.main, width: collapsed ? "calc(100% - 64px)" : "calc(100% - 218px)", transition: "width 0.3s" }}>
                    <div style={S.bar}>
                        <div style={{ fontSize: 14, color: C.gold, letterSpacing: 2, flex: 1, fontWeight: 600 }}>{TITLE_MAP[active]}</div>
                        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                            <button style={{ ...S.btn(), padding: "4px 8px", fontSize: 10 }} onClick={() => setLightMode(!lightMode)}>
                                {lightMode ? "🌙 Dark" : "☀️ Light"}
                            </button>
                            <input style={{ ...S.inp, width: 160 }} value={project.name} onChange={e => setProject({ ...project, name: e.target.value })} placeholder="Project Name" />
                            <select style={{ ...S.sel, width: 100 }} value={project.state} onChange={e => setProject({ ...project, state: e.target.value })}>{US_STATES.map(s => <option key={s} value={s}>{s || "State"}</option>)}</select>
                            <NotifBell setActive={setActive} />
                        </div>
                    </div>
                    <div style={S.cnt}>
                        <Suspense fallback={<ModuleFallback />}>
                            {ActiveModule
                                ? <ActiveModule />
                                : <div style={{ color: C.dim, padding: 40, textAlign: "center" }}>Section not found.</div>
                            }
                        </Suspense>
                    </div>
                </div>
            </div>
            <DataExplorerModal data={chartSel} onClose={() => setChartSel(null)} />
            <CommandKModal isOpen={cmdKOpen} onClose={() => setCmdKOpen(false)} onSelect={(id) => setActive(id)} />
        </ProjectContext.Provider>
    );
}
