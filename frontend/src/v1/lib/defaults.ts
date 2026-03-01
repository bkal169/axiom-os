// ─── src/v1/lib/defaults.ts ───────────────────────────────────────────────────
// Single source of truth for all project default state.
// Every useProjectState consumer imports from here — never hardcodes inline.

export const DEFAULT_FIN = {
    totalLots: 50,
    landCost: 3_000_000,
    closingCosts: 90_000,
    hardCostPerLot: 65_000,
    softCostPct: 18,
    contingencyPct: 10,
    salesPricePerLot: 185_000,
    salesCommission: 3,
    absorbRate: 3,
    planningFees: 120_000,
    permitFeePerLot: 8_500,
    schoolFee: 3_200,
    impactFeePerLot: 12_000,
    reservePercentage: 5,
    grm: 14.2,
};

export const DEFAULT_LOAN = {
    ltc: 70,
    rate: 9.5,
    termMonths: 24,
    extensionMonths: 12,
    origFee: 1.0,
    lender: "",
};

export const DEFAULT_EQUITY = {
    gpPct: 10,
    lpPct: 90,
    prefReturn: 8,
    promotePct: 20,
    equityMultipleTarget: 1.75,
    irrTarget: 18,
};

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

export const DEFAULT_SITE = {
    address: "", apn: "", grossAcres: "", netAcres: "",
    jurisdiction: "", county: "", state: "", shape: "Rectangular",
    legalDesc: "", frontage: "", access: "", existingUse: "Vacant Land",
};

export const DEFAULT_ZON = {
    zone: "", overlay: "", du_ac: "", maxHeight: "", minLotSize: "",
    entitlementType: "Tentative Map", entitlementStatus: "Not Started", notes: "",
};
