import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { useLS } from "../hooks/useLS";
import { useAuth } from "./AuthContext";
import { supa } from "../lib/supabase";

export const DD_CATS = [
    {
        cat: "Title & Legal", items: [
            { t: "Preliminary Title Report ordered", r: "High" }, { t: "CC&Rs and deed restrictions reviewed", r: "High" },
            { t: "ALTA Survey ordered and received", r: "High" }, { t: "Easements mapped and plotted", r: "High" },
            { t: "Encumbrances cleared or budgeted", r: "Medium" }, { t: "Entity / ownership structure confirmed", r: "Medium" },
            { t: "Seller disclosure statement reviewed", r: "Medium" },
        ]
    },
    {
        cat: "Physical & Environmental", items: [
            { t: "Phase I ESA completed", r: "High" }, { t: "Geotechnical / soils report ordered", r: "High" },
            { t: "Flood zone determination (FEMA)", r: "High" }, { t: "Wetlands delineation (if applicable)", r: "High" },
            { t: "Biological survey completed", r: "Medium" }, { t: "Topographic survey completed", r: "Medium" },
            { t: "Cultural resources review completed", r: "Low" },
        ]
    },
    {
        cat: "Entitlements & Zoning", items: [
            { t: "Zoning verified and documented", r: "High" }, { t: "General Plan designation confirmed", r: "High" },
            { t: "Density and development standards extracted", r: "High" }, { t: "Pre-application meeting held", r: "Medium" },
            { t: "Entitlement pathway and timeline mapped", r: "Medium" }, { t: "School and impact fees quantified", r: "Medium" },
            { t: "Vesting tentative map strategy confirmed", r: "Medium" },
        ]
    },
    {
        cat: "Infrastructure", items: [
            { t: "Water availability letter obtained", r: "High" }, { t: "Sewer capacity confirmed in writing", r: "High" },
            { t: "Off-site improvement costs estimated", r: "High" }, { t: "Traffic study scope determined", r: "Medium" },
            { t: "Utility extension costs budgeted", r: "Medium" }, { t: "Dry utility franchise agreements identified", r: "Low" },
        ]
    },
    {
        cat: "Financial & Market", items: [
            { t: "Comparable sales analyzed (min 3)", r: "High" }, { t: "Development pro forma completed", r: "High" },
            { t: "Construction financing term sheet received", r: "High" }, { t: "Absorption rate supported by market data", r: "High" },
            { t: "Contingency reserve adequate (>=10%)", r: "Medium" }, { t: "Fee schedule verified with municipality", r: "Medium" },
            { t: "Equity partner / JV terms agreed", r: "Medium" },
        ]
    },
];
export const ALL_DD = DD_CATS.flatMap(c => c.items);

export const DEFAULT_FIN = { totalLots: 50, landCost: 3000000, closingCosts: 90000, hardCostPerLot: 65000, softCostPct: 18, contingencyPct: 10, salesPricePerLot: 185000, salesCommission: 3, absorbRate: 3, planningFees: 120000, permitFeePerLot: 8500, schoolFee: 3200, impactFeePerLot: 12000, reservePercentage: 5, grm: 14.2, irr: 18.4 };
export const DEFAULT_RISKS = [
    { id: 1, cat: "Market", risk: "Home price softening during sell-out", likelihood: "Medium", impact: "High", severity: "High", mitigation: "Phased lot releases; forward sale agreements", status: "Open" },
    { id: 2, cat: "Entitlement", risk: "CEQA challenge or appeal by neighbors", likelihood: "Medium", impact: "High", severity: "High", mitigation: "Community outreach; robust EIR; legal reserve", status: "Open" },
    { id: 3, cat: "Construction", risk: "Labor and material cost escalation", likelihood: "High", impact: "Medium", severity: "High", mitigation: "Fixed-price contractor agreements; 15% contingency", status: "Mitigated" },
    { id: 4, cat: "Environmental", risk: "Undiscovered contamination on site", likelihood: "Low", impact: "Critical", severity: "High", mitigation: "Phase I/II ESA; environmental indemnity from seller", status: "Open" },
    { id: 5, cat: "Financial", risk: "Construction loan maturity before sell-out", likelihood: "Low", impact: "High", severity: "Medium", mitigation: "Structure loan with 12-month extension option", status: "Open" },
    { id: 6, cat: "Regulatory", risk: "Impact fee increases mid-entitlement", likelihood: "Medium", impact: "Medium", severity: "Medium", mitigation: "Vesting Tentative Map; Development Agreement", status: "Open" },
];
export const DEFAULT_PERMITS = [
    { name: "Tentative Map Approval", agency: "Planning Dept", duration: "16-24 wks", cost: "$25,000", status: "Not Started", req: true },
    { name: "Final Map Recordation", agency: "County Recorder", duration: "8-12 wks", cost: "$8,500", status: "Not Started", req: true },
    { name: "Grading Permit", agency: "Building Dept", duration: "4-6 wks", cost: "$45,000", status: "Not Started", req: true },
    { name: "NPDES / SWPPP", agency: "State Water Board", duration: "2-4 wks", cost: "$3,200", status: "Not Started", req: true },
    { name: "404 Wetlands Permit", agency: "Army Corps", duration: "12-52 wks", cost: "$18,000", status: "N/A", req: false },
    { name: "CEQA Compliance", agency: "Lead Agency", duration: "12-26 wks", cost: "$35,000", status: "Not Started", req: true },
    { name: "Improvement Plans", agency: "City Engineer", duration: "8-12 wks", cost: "$55,000", status: "Not Started", req: true },
    { name: "Street Improvement Permit", agency: "Public Works", duration: "2-4 wks", cost: "$12,000", status: "Not Started", req: true },
    { name: "Utility Agreements", agency: "Various Districts", duration: "4-8 wks", cost: "Varies", status: "Not Started", req: true },
];
export const DEFAULT_EVENTS = [
    { id: 1, title: "Phase I ESA Delivery", date: "2025-03-15", type: "Milestone", priority: "High", notes: "From environmental consultant" },
    { id: 2, title: "Pre-Application Meeting", date: "2025-03-22", type: "Meeting", priority: "High", notes: "City Planning Dept." },
    { id: 3, title: "ALTA Survey Delivery", date: "2025-04-01", type: "Milestone", priority: "High", notes: "" },
    { id: 4, title: "Tentative Map Application", date: "2025-04-15", type: "Submittal", priority: "Critical", notes: "All materials must be complete" },
    { id: 5, title: "Inspection Period Expiration", date: "2025-04-30", type: "Deadline", priority: "Critical", notes: "Go / No-Go required" },
];

export const DEFAULT_COMPS = [
    { id: 1, name: "Sunset Ridge Estates", address: "456 Ridge Rd", lots: 42, lotSF: 6500, saleDate: "2024-08", pricePerLot: 185000, pricePerSF: 28.46, status: "Sold", adj: 0, notes: "" },
    { id: 2, name: "Hawk Valley Sub.", address: "789 Valley Dr", lots: 28, lotSF: 4200, saleDate: "2024-11", pricePerLot: 142000, pricePerSF: 33.81, status: "Sold", adj: 0, notes: "" },
    { id: 3, name: "Meadowbrook PUD", address: "321 Meadow Ln", lots: 85, lotSF: 3800, saleDate: "2025-01", pricePerLot: 128000, pricePerSF: 33.68, status: "Listed", adj: 5, notes: "Superior amenities" },
    { id: 4, name: "Ridgecrest Heights", address: "900 Crest Blvd", lots: 55, lotSF: 7200, saleDate: "2024-06", pricePerLot: 220000, pricePerSF: 30.56, status: "Sold", adj: -3, notes: "Superior access" },
];

export interface ProjectContextType {
    project: any; setProject: any;
    fin: any; setFin: any;
    risks: any; setRisks: any;
    permits: any; setPermits: any;
    ddChecks: any; setDdChecks: any;
    events: any; setEvents: any;
    loan: any; setLoan: any;
    equity: any; setEquity: any;
    comps: any; setComps: any;
    allProjects: any[]; setAllProjects: any;
    createProject: (n: string, s: string, a: string) => Promise<void>;
    switchProject: (id: string) => void;
    setChartSel?: any;
}

const ProjectCtx = createContext<ProjectContextType | null>(null);
export const useProject = () => useContext(ProjectCtx);

export function ProjectProvider({ children }: { children: React.ReactNode }) {
    const auth = useAuth();

    const [project, setProject] = useLS("axiom_project", { name: "New Development", address: "", jurisdiction: "", state: "", municipality: "" });
    const [fin, setFin] = useLS("axiom_fin", DEFAULT_FIN);
    const [risks, setRisks] = useLS("axiom_risks", DEFAULT_RISKS);
    const [permits, setPermits] = useLS("axiom_permits", DEFAULT_PERMITS);
    const [ddChecks, setDdChecks] = useLS("axiom_dd_checks", {});
    const [events, setEvents] = useLS("axiom_events", DEFAULT_EVENTS);
    const [loan, setLoan] = useLS("axiom_loan", { ltc: 70, rate: 9.5, termMonths: 24, extensionMonths: 12, origFee: 1.5, lender: "" });
    const [equity, setEquity] = useLS("axiom_equity", { gpPct: 10, lpPct: 90, prefReturn: 8, promotePct: 20, equityMultipleTarget: 2.0, irrTarget: 18 });
    const [comps, setComps] = useLS("axiom_comps", DEFAULT_COMPS);
    const [allProjects, setAllProjects] = useState<any[]>([]);

    const createProject = async (name: string, _state: string, _address: string) => {
        const tempId = "proj_" + Date.now();
        setAllProjects((prev: any[]) => [...prev, { id: tempId, name }]);
        auth?.setActiveProjectId(tempId);
    };

    const switchProject = (id: string) => {
        auth?.setActiveProjectId(id);
    };

    // HYDRATION LOGIC (Simplified from monolith for this base pass)
    const hydrated = useRef(false);
    const lastHydratedProject = useRef<string | null>(null);

    useEffect(() => {
        if (!auth?.user || !auth?.userProfile || !supa.configured()) return;
        if (hydrated.current && lastHydratedProject.current === auth.activeProjectId) return;

        hydrated.current = true;
        lastHydratedProject.current = auth.activeProjectId;

        (async () => {
            try {
                let pid = auth.activeProjectId;
                const projs = await supa.select("projects", `org_id=eq.${auth.userProfile.org_id}&order=updated_at.desc&limit=100`);
                if (projs && Array.isArray(projs) && projs.length > 0) {
                    setAllProjects(projs);
                    if (!pid || !projs.find((p: any) => p.id === pid)) {
                        pid = projs[0].id;
                        auth.setActiveProjectId(pid);
                    }
                } else {
                    setAllProjects([]);
                }
                if (pid) {
                    const projData = await supa.select("projects", `id=eq.${pid}`);
                    if (projData && projData.length > 0) {
                        const p = projData[0];
                        setProject(p.details || project);
                        setFin(p.financials || DEFAULT_FIN);
                        setRisks(p.risks || DEFAULT_RISKS);
                        setPermits(p.permits || DEFAULT_PERMITS);
                        setDdChecks(p.dd_checks || {});
                        setEvents(p.events || DEFAULT_EVENTS);
                        setLoan(p.loan || loan);
                        setEquity(p.equity || equity);
                        setComps(p.comps || DEFAULT_COMPS);
                    }
                }
            } catch (e) {
                console.warn("Hydration failed:", e);
            }
        })();
    }, [auth?.user, auth?.userProfile, auth?.activeProjectId]);

    // AUTO-SAVE LOGIC
    useEffect(() => {
        if (!auth?.user || !supa.configured() || !auth?.activeProjectId || !hydrated.current) return;
        const timer = setTimeout(() => {
            supa.update("projects", { id: auth.activeProjectId }, {
                details: project,
                financials: fin,
                risks: risks,
                permits: permits,
                comps: comps,
                dd_checks: ddChecks,
                events: events,
                loan: loan,
                equity: equity
            }).catch(e => console.warn("Auto-save failed", e));
        }, 1500);
        return () => clearTimeout(timer);
    }, [project, fin, risks, permits, comps, ddChecks, events, loan, equity, auth?.activeProjectId]);

    const value = { project, setProject, fin, setFin, risks, setRisks, permits, setPermits, ddChecks, setDdChecks, events, setEvents, loan, setLoan, equity, setEquity, comps, setComps, allProjects, setAllProjects, createProject, switchProject };
    return <ProjectCtx.Provider value={value}>{children}</ProjectCtx.Provider>;
}
