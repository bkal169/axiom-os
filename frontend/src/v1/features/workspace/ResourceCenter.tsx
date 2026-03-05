import { useState } from "react";
import { Card, Badge, Button } from "../../components/ui/components";
import { Tabs } from "../../components/ui/layout";

interface Resource {
    id: number;
    title: string;
    category: string;
    type: string;
    desc: string;
    readTime: string;
    level: string;
    content: string;
}

const CATS = ["All", "Getting Started", "Financial Modeling", "Entitlements", "Market Analysis", "Legal", "Construction", "Best Practices"];

const RESOURCES: Resource[] = [
    { id: 1, title: "Land Development Feasibility Guide", category: "Getting Started", type: "Guide", desc: "Complete walkthrough of the development feasibility process from site identification through entitlement and construction.", readTime: "15 min", level: "Beginner", content: "LAND DEVELOPMENT FEASIBILITY GUIDE\n\n1. SITE IDENTIFICATION\n• Define target market: geography, price point, product type\n• Source: MLS, off-market, broker networks, auctions\n• Screen: zoning, size, access, utilities, flood zone\n\n2. FINANCIAL FEASIBILITY\n• Build preliminary pro forma:\n  - Land cost + closing costs\n  - Hard costs: grading, utilities, roads, landscaping\n  - Soft costs: engineering, architecture, permits, legal\n  - Impact fees: city, school, park, drainage\n  - Contingency: 10-15% of hard + soft costs\n• Revenue: comparable lot sales, absorption rate\n• Target: 15-25% margin on cost, 20%+ unlevered IRR\n\n3. DUE DILIGENCE\n• Phase I ESA • Title Report • ALTA Survey\n• Geotech • Bio/Cultural Survey • Traffic Study\n\n4. ENTITLEMENT\n• Pre-app meeting → Tentative Map → CEQA\n• Design Review → Planning Commission → Council" },
    { id: 2, title: "Pro Forma Modeling Best Practices", category: "Financial Modeling", type: "Guide", desc: "How to structure a development pro forma, including cost categories, revenue assumptions, and sensitivity analysis.", readTime: "20 min", level: "Intermediate", content: "PRO FORMA MODELING BEST PRACTICES\n\n1. HARD COSTS (Direct Construction)\n• Grading: $8K-$15K/lot\n• Wet utilities: $15K-$25K/lot\n• Roads & paving: $6K-$12K/lot\n\n2. SOFT COSTS\n• Civil engineering: 5-8% of hard costs\n• Legal: $50K-$150K\n\n3. FEES & EXACTIONS\n• City: $5K-$30K/lot • School: $3-$5/SF\n\n4. FINANCING\n• Construction loan interest (monthly draws)\n• Origination fee: 0.5-1.5%\n\n5. CONTINGENCY: 10% hard, 5-10% soft\n\nKEY METRICS: Gross margin, Developer spread,\nUnlevered IRR (20%+), Cash-on-cash, Breakeven lots" },
    { id: 3, title: "CEQA Compliance Roadmap", category: "Entitlements", type: "Reference", desc: "Step-by-step guide to California Environmental Quality Act compliance for residential subdivisions.", readTime: "25 min", level: "Advanced", content: "CEQA COMPLIANCE ROADMAP\n\nSTEP 1: DETERMINE APPLICABILITY\n• Is it a 'project' under CEQA?\n• Does an exemption apply?\n  - Class 32 (Infill Development)\n\nSTEP 2: INITIAL STUDY\nPrepare IS using Appendix G checklist:\nAesthetics, Air Quality, Biological Resources,\nCultural Resources, Geology, GHG, Hazards,\nHydrology, Noise, Transportation, Utilities\n\nSTEP 3: DOCUMENT TYPE\n• Negative Declaration (ND): no significant impacts\n• Mitigated ND (MND): mitigated to less-than-significant\n• EIR: significant unavoidable impacts\n\nTIMELINES\n• MND: 3-6 months\n• EIR: 12-24 months\n\nCOSTS: MND $15K-$50K, EIR $200K-$500K+" },
    { id: 4, title: "Comparable Sales Analysis", category: "Market Analysis", type: "Guide", desc: "How to identify, analyze, and adjust comparable land and lot sales for pricing accuracy.", readTime: "12 min", level: "Intermediate", content: "COMPARABLE SALES ANALYSIS\n\n1. IDENTIFY COMPS\n• Same submarket, 5-mile radius\n• Sold within 12 months\n• Similar lot count (±25%)\nSources: MLS, CoStar, county recorder, brokers\n\n2. ADJUSTMENT CATEGORIES\n• Time: 3-8% annual appreciation\n• Location: school district, access (5-15%)\n• Physical: lot size, slope (5-20%)\n• Entitlement: raw +0%, entitled +20-40%,\n  finished lots +60-100%\n\n3. CALCULATE\n• Price per lot or per SF/acre\n• Net adjustment ≤25% total\n• Use 3-6 comps minimum" },
    { id: 5, title: "Understanding Impact Fees", category: "Legal", type: "Reference", desc: "Overview of development impact fees, Quimby Act, school fees, and mitigation measures.", readTime: "18 min", level: "Intermediate", content: "UNDERSTANDING IMPACT FEES\n\nCITY/COUNTY FEES (per unit)\n• Traffic: $2K-$15K • Water: $3K-$12K\n• Sewer: $3K-$10K • Storm: $1K-$5K\n\nSCHOOL FEES\n• Level 1 (statutory): $4.79/SF residential\n• Level 2: higher, requires state approval\n\nPARK (QUIMBY ACT)\n• 3 acres per 1,000 residents\n• In-lieu fees: $3K-$10K/lot\n\nNEGOTIATION STRATEGIES\n• Request fee deferral to building permit\n• Seek credits for oversized infrastructure\n• Lock in fee schedule at tentative map" },
    { id: 6, title: "Construction Cost Estimation", category: "Construction", type: "Guide", desc: "Methods for estimating horizontal improvement costs per lot for subdivision development.", readTime: "15 min", level: "Intermediate", content: "CONSTRUCTION COST ESTIMATION\n\nMASS GRADING: $8K-$15K/lot\n• Balanced cut/fill: $3-$5/CY\n• Import/export: $8-$15/CY + trucking\n\nWET UTILITIES: $15K-$25K/lot\n• 8\" water main: $45-$65/LF\n• 8\" sewer main: $55-$80/LF\n• Storm drain 18\": $40-$60/LF\n\nDRY UTILITIES: $3K-$8K/lot\n• Electric: $2K-$5K/lot (underground)\n• Gas: $1.5K-$3K/lot\n\nROADS: $6K-$12K/lot\n• Asphalt 2\": $4-$7/SF • Curb: $25-$40/LF\n\nESCALATION: 4-6% annual, add 10% contingency" },
    { id: 7, title: "Due Diligence Master Checklist", category: "Best Practices", type: "Template", desc: "Complete due diligence checklist covering all phases of land acquisition and entitlement.", readTime: "10 min", level: "All Levels", content: "DUE DILIGENCE CHECKLIST — MASTER\n\n✅ TITLE & LEGAL\n  ✅ Preliminary title report\n  ✅ Easements reviewed and mapped\n  ✅ CC&Rs and deed restrictions\n  ✅ Liens and encumbrances cleared\n\n✅ PHYSICAL / ENVIRONMENTAL\n  ✅ Phase I ESA\n  ✅ Geotech investigation\n  ✅ ALTA/NSPS survey\n  ✅ Biological survey\n  ✅ Wetlands delineation\n\n✅ UTILITIES\n  ✅ Water will-serve ✅ Sewer will-serve\n  ✅ Electric & Gas confirmation\n\n✅ ENTITLEMENT\n  ✅ Zoning confirmed ✅ General Plan\n  ✅ Pre-app meeting ✅ CEQA pathway\n\n✅ MARKET & FINANCIAL\n  ✅ Comps pulled (3-6) ✅ Absorption study\n  ✅ Pro forma ✅ Sensitivity analysis" },
    { id: 8, title: "Getting Started with Axiom OS", category: "Getting Started", type: "Video", desc: "Full walkthrough of the Axiom OS platform — navigating sections, entering data, and running analysis.", readTime: "12 min", level: "Beginner", content: "GETTING STARTED WITH AXIOM OS\n\nNAVIGATION\nClick any section in the left sidebar.\nGroups: CORE, FINANCE, SITE, INTEL,\nEXECUTION, OUTPUT, SYSTEM\n\nQUICK START\n1. Set project name in the top bar\n2. Enter site info in Site & Entitlements\n3. Add comps in Market Intelligence\n4. Build pro forma in Financial Engine\n5. Run analysis with AI Copilot\n\nAI MODELS\nSelect model in any Agent dropdown.\nSet API keys in Settings > API Keys.\n\nWORKSPACE TOOLS\nNotes, Calendar, Email, Spreadsheets,\nWorkflows, Resource Center" },
];

const TYPE_COLOR: Record<string, string> = { Guide: "var(--c-blue)", Reference: "var(--c-purple)", Template: "var(--c-gold)", Video: "var(--c-green)" };
const LEVEL_COLOR: Record<string, string> = { Beginner: "var(--c-green)", Intermediate: "var(--c-amber)", Advanced: "var(--c-red)", "All Levels": "var(--c-gold)" };

const EXTERNAL_LINKS = [
    ["California CEQA Guidelines", "https://resources.ca.gov/ceqa", "Government"],
    ["FEMA Flood Map Service", "https://msc.fema.gov", "Government"],
    ["CoStar Market Analytics", "https://www.costar.com", "Data Provider"],
    ["National Association of Home Builders", "https://www.nahb.org", "Industry"],
    ["Urban Land Institute", "https://uli.org", "Industry"],
    ["ENR Construction Cost Index", "https://www.enr.com", "Data Provider"],
];

export function ResourceCenter() {
    const [filterCat, setFilterCat] = useState("All");
    const [search, setSearch] = useState("");
    const [activeRes, setActiveRes] = useState<number | null>(null);

    const filtered = RESOURCES
        .filter(r => filterCat === "All" || r.category === filterCat)
        .filter(r => !search || r.title.toLowerCase().includes(search.toLowerCase()) || r.desc.toLowerCase().includes(search.toLowerCase()));

    if (activeRes !== null) {
        const r = RESOURCES.find(x => x.id === activeRes);
        if (r) return (
            <div>
                <Button label="← Back to Library" onClick={() => setActiveRes(null)} />
                <div className="axiom-mt-14">
                    <Card title={r.title} action={
                        <div className="axiom-flex-row axiom-gap-6">
                            <Badge label={r.type} color={TYPE_COLOR[r.type] || "var(--c-blue)"} />
                            <Badge label={r.level} color={LEVEL_COLOR[r.level] || "var(--c-dim)"} />
                            <Badge label={r.readTime} color="var(--c-dim)" />
                        </div>
                    }>
                        <div className="axiom-text-13-sub axiom-lh-14 axiom-mb-12">{r.desc}</div>
                        <pre className="axiom-resource-content">{r.content}</pre>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <Tabs tabs={["Library", "Video Tutorials", "Templates", "External Resources"]}>
            {/* ─ Library ─ */}
            <div>
                <div className="axiom-flex-row" style={{ gap: 10, marginBottom: 14 }}>
                    <input className="axiom-input" style={{ flex: 1 }} value={search} onChange={e => setSearch(e.target.value)} placeholder="Search resources..." />
                    <select className="axiom-select" style={{ width: 160 }} value={filterCat} onChange={e => setFilterCat(e.target.value)}>
                        {CATS.map(c => <option key={c}>{c}</option>)}
                    </select>
                </div>
                <div className="axiom-resource-grid">
                    {filtered.map(r => (
                        <div key={r.id} onClick={() => setActiveRes(r.id)} className="axiom-resource-card">
                            <div className="axiom-flex-row axiom-gap-6 axiom-mb-8">
                                <Badge label={r.type} color={TYPE_COLOR[r.type] || "var(--c-blue)"} />
                                <Badge label={r.level} color={LEVEL_COLOR[r.level] || "var(--c-dim)"} />
                            </div>
                            <div className="axiom-text-14-bold axiom-text-main axiom-mb-4">{r.title}</div>
                            <div className="axiom-text-12-sub axiom-lh-14 axiom-mb-8">{r.desc}</div>
                            <div className="axiom-flex-between-center">
                                <span className="axiom-text-10-dim">{r.readTime} · {r.category}</span>
                                <Button variant="gold" label={r.type === "Video" ? "Watch" : "Read"} onClick={() => setActiveRes(r.id)} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* ─ Video Tutorials ─ */}
            <div>
                <Card title="Video Tutorials">
                    {RESOURCES.filter(r => r.type === "Video").map(r => (
                        <div key={r.id} className="axiom-flex-row axiom-gap-12 axiom-py-12 axiom-border-b">
                            <div className="axiom-w-120 axiom-h-68 axiom-bg-2 axiom-rounded-3 axiom-flex-center axiom-flex-shrink-0 axiom-border">
                                <span className="axiom-text-28 axiom-text-gold">▶</span>
                            </div>
                            <div className="axiom-flex-1">
                                <div className="axiom-text-14 axiom-text-main axiom-font-semibold">{r.title}</div>
                                <div className="axiom-text-12-sub axiom-mt-3">{r.desc}</div>
                                <div className="axiom-flex-row axiom-gap-8 axiom-mt-6">
                                    <Badge label={r.level} color={LEVEL_COLOR[r.level]} />
                                    <span className="axiom-text-10-dim">{r.readTime}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </Card>
            </div>

            {/* ─ Templates ─ */}
            <div>
                <Card title="Downloadable Templates">
                    {[
                        ["Development Pro Forma Template", "Excel spreadsheet with pre-built financial model", "xlsx"],
                        ["Due Diligence Checklist", "Comprehensive DD tracking template", "xlsx"],
                        ["LOI Template", "Letter of Intent template for land acquisition", "docx"],
                        ["Investment Memo Template", "IC memo format with deal analysis sections", "docx"],
                        ["Comparable Sales Grid", "Structured comp analysis spreadsheet", "xlsx"],
                        ["Construction Budget Template", "Horizontal improvement cost tracking", "xlsx"],
                    ].map(([t, d, ext], i) => (
                        <div key={i} className="axiom-flex-row" style={{ gap: 12, padding: "10px 0", borderBottom: "1px solid var(--c-border)" }}>
                            <Badge label={ext.toUpperCase()} color={ext === "xlsx" ? "var(--c-green)" : "var(--c-blue)"} />
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: 13, color: "var(--c-text)" }}>{t}</div>
                                <div className="axiom-text-10-dim">{d}</div>
                            </div>
                            <Button variant="gold" label="Download" onClick={() => { }} />
                        </div>
                    ))}
                </Card>
            </div>

            {/* ─ External Resources ─ */}
            <div>
                <Card title="External Resources & Links">
                    {EXTERNAL_LINKS.map(([t, u, cat], i) => (
                        <div key={i} className="axiom-flex-row" style={{ gap: 12, padding: "8px 0", borderBottom: "1px solid var(--c-border)" }}>
                            <Badge label={cat} color={cat === "Government" ? "var(--c-blue)" : cat === "Data Provider" ? "var(--c-green)" : "var(--c-gold)"} />
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: 13, color: "var(--c-text)" }}>{t}</div>
                                <div className="axiom-text-10-dim">{u}</div>
                            </div>
                            <Button label="Open" onClick={() => window.open(u, "_blank")} />
                        </div>
                    ))}
                </Card>
            </div>
        </Tabs>
    );
}
