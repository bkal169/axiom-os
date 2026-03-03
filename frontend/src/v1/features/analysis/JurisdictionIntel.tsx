import { useState } from "react";
import { Card, Badge, Button } from "../../components/ui/components";
import { Agent } from "../agents/Agent";

interface EntPhase { phase: string; duration: string; notes: string; }
interface FeeRow { type: string; range: string; notes: string; }
interface EnvRow { item: string; detail: string; }

interface StateData {
    name: string; abbr: string; flag: string;
    overview: string;
    entitlement: EntPhase[];
    fees: FeeRow[];
    env: EnvRow[];
    zones: string;
    tips: string[];
}

const JURIS_DATA: Record<string, StateData> = {
    FL: { name: "Florida", abbr: "FL", flag: "🌴", overview: "Florida has a streamlined subdivision approval process under the Florida Subdivision Act (Ch. 177 F.S.). No CEQA equivalent. Primary regulators: FDEP (water/wetlands), SFWMD/WMDs, county/city planning departments.", entitlement: [{ phase: "Pre-Application Conference", duration: "2–4 weeks", notes: "Required by most FL counties. Identify issues early." }, { phase: "Preliminary Plat", duration: "30–60 days", notes: "Staff review, DRC review. Public notice required." }, { phase: "Planning Commission Hearing", duration: "30–45 days", notes: "Quasi-judicial in FL. Must present competent substantial evidence." }, { phase: "BCC/City Commission Approval", duration: "30–45 days", notes: "Final approval. Conditions of approval issued." }, { phase: "Final Plat Survey & Engineering", duration: "60–120 days", notes: "Boundary survey, legal descriptions, engineer certification." }, { phase: "Final Plat Recording", duration: "2–4 weeks", notes: "Filed with Clerk of Courts. Recorded in plat book." }, { phase: "ERP Permit (if wetlands)", duration: "60–120 days", notes: "Environmental Resource Permit from SFWMD. Required for >0.5 ac disturbance." }], fees: [{ type: "Impact Fees (Roads)", range: "$3,000–$8,000/unit", notes: "Varies by county. Hillsborough ~$6,200, Orange ~$5,800, Lee ~$4,100" }, { type: "Impact Fees (Schools)", range: "$2,500–$6,500/unit", notes: "School board adopted. Broward ~$6,200, Collier ~$5,900" }, { type: "Impact Fees (Water/Sewer)", range: "$3,000–$9,000/unit", notes: "Utility-set. JEA ~$7,400, TOHO ~$6,100." }, { type: "Plat Recording Fee", range: "$10–$15/lot", notes: "Clerk of Courts. Nominal." }], env: [{ item: "Wetlands / ERP", detail: "FDEP & WMD jurisdiction. ERP permit required. Mitigation ratio typically 1.5:1–2:1." }, { item: "Listed Species", detail: "Florida Scrub Jay, Gopher Tortoise, Florida Panther (SW FL). FWC coordination required." }, { item: "Stormwater / NPDES", detail: "FDEP NPDES permit for >1 ac disturbance. NOI required. SWPPP mandatory." }, { item: "DRI Review", detail: "Development of Regional Impact: >3,000 residential units triggers DRI review under FL Ch. 380." }], zones: "FL zoning is municipality/county-specific. Common residential: R-1 (single-family, 6,000–10,000 SF min lot), R-2/R-3 (multi-family), PUD (most common for subdivisions). ADUs allowed by statute since 2020.", tips: ["DRI thresholds: >3,000 residential units in many counties triggers DRI review.", "Concurrency: FL Statute Ch. 163 requires concurrency for roads, schools, utilities.", "Impact fee credits: Donate ROW or build infrastructure for credits.", "Wetland mitigation banking well-established — use banks vs. on-site mitigation.", "School concurrency: Certificate required before building permits."] },
    TX: { name: "Texas", abbr: "TX", flag: "⭐", overview: "Texas is developer-friendly with minimal state-level land use regulation. Cities have broad zoning authority but counties have limited power. No state environmental review. Primary regulators: TCEQ (environmental), TWDB (water), TxDOT (state roads), local municipalities.", entitlement: [{ phase: "Pre-Application Meeting", duration: "1–2 weeks", notes: "Optional but recommended." }, { phase: "Preliminary Plat", duration: "30 days statutory", notes: "Texas LGC 212.009: 30 days to approve/deny or deemed approved." }, { phase: "P&Z Commission", duration: "30–45 days", notes: "Public hearing. Most TX cities have P&Z for plat recommendations." }, { phase: "City Council Approval", duration: "30 days", notes: "Final authority." }, { phase: "Construction Plan Approval", duration: "30–60 days", notes: "Engineering plans for utilities, streets, drainage." }, { phase: "Final Plat", duration: "30 days", notes: "Filed with county clerk after construction complete or bonded." }], fees: [{ type: "Plat Application Fee", range: "$500–$5,000", notes: "City-specific. Austin ~$3,500+, Dallas ~$2,000, Houston minimal" }, { type: "Impact Fees", range: "$0–$15,000/unit", notes: "TX LGC Ch. 395. Austin ~$12,000+/unit, Frisco ~$10,000, smaller cities often $0–3,000" }, { type: "MUD Tap Fees", range: "$2,000–$8,000/unit", notes: "Municipal Utility District tap fees common." }, { type: "TCEQ Stormwater", range: "$100 NOI fee", notes: "Phase II MS4. SWPPP required for >1 ac." }], env: [{ item: "No State CEQA", detail: "Texas has no CEQA/SEPA equivalent. Environmental review is federal (NEPA) only when federal nexus." }, { item: "TCEQ / Stormwater", detail: "TCEQ Construction General Permit (TXR150000). NOI required for >1 ac. SWPPP required." }, { item: "Wetlands", detail: "US Army Corps Section 404 only. Texas has no additional state wetland permitting layer." }, { item: "Edwards Aquifer", detail: "EARIP rules for Barton Springs area. Impervious cover limits 15–25%." }], zones: "Texas cities zone independently. Common: SF-1/SF-2 (single-family, 7,500–10,000 SF min), PD (planned development), TH (townhome). Houston: no city-wide zoning code — deed restrictions substitute.", tips: ["Deemed approved: TX LGC 212.009 — city doesn't act within 30 days, plat deemed approved.", "MUD strategy: Create a MUD for infrastructure finance. Bonds issued, residents pay via tax rate.", "Unincorporated areas: Counties can require plats but cannot zone.", "Austin: Most complex TX market. Consult local land use attorney.", "Impact fee caps: Ch. 395 limits impact fees to 50% of capital costs."] },
    CA: { name: "California", abbr: "CA", flag: "🌉", overview: "California has the most complex and regulated land development environment in the US. The Subdivision Map Act governs platting. CEQA environmental review is required for most discretionary permits. HCD (Housing & Community Development) enforces housing law. Multiple regional agencies.", entitlement: [{ phase: "Pre-Application Conference", duration: "2–6 weeks", notes: "Required in most CA jurisdictions. Formal PAC process." }, { phase: "Application Submittal & Completeness", duration: "30 days", notes: "Govt Code 65943: agency must determine completeness within 30 days." }, { phase: "CEQA / Environmental Review", duration: "3–18 months", notes: "Neg Dec, MND, or EIR depending on impacts. 45-day public review for EIR." }, { phase: "Tentative Map / Planning Commission", duration: "3–6 months", notes: "Public hearing. Planning Commission approval or recommendation." }, { phase: "City Council / Board of Supervisors", duration: "1–3 months", notes: "Final approval for discretionary entitlements. Legislative act for rezonings." }, { phase: "Final Map / Engineering", duration: "6–18 months", notes: "Civil engineering, improvement agreements, bonds required before recordation." }, { phase: "Final Map Recordation", duration: "1–3 months", notes: "County Recorder. Creates legal parcels." }], fees: [{ type: "Development Impact Fees", range: "$10,000–$100,000+/unit", notes: "CA highest in nation. Bay Area cities often $50,000–100,000+/unit." }, { type: "School Fees (Level 1)", range: "$4.93/SF residential", notes: "State-mandated minimum. Level 2 & 3 much higher with state funding." }, { type: "Park Fees (Quimby Act)", range: "$5,000–$30,000/unit", notes: "Quimby Act: 3 acres/1,000 residents. In-lieu fees negotiable." }, { type: "CEQA Document Prep", range: "$20,000–$500,000+", notes: "MND $15K-$75K, focused EIR $100K-$300K, full EIR $300K-$1M+" }], env: [{ item: "CEQA", detail: "California Environmental Quality Act — required for virtually all discretionary permits. EIR for significant impacts. 45-day public review period. Litigation risk." }, { item: "Wetlands / 401/404", detail: "USACE Section 404, SWRCB Section 401 certification, CDFW 1600 Streambed Alteration Agreement required for wetland/stream impacts. 3+ agency coordination." }, { item: "Listed Species", detail: "CESA (state) + federal ESA. California Gnatcatcher, California Tiger Salamander, Swainson's Hawk, Vernal Pool species. Biological assessment required." }, { item: "Air Quality / GHG", detail: "Air Districts (SCAQMD, BAAQMD, etc.) jurisdiction. CEQA GHG significance thresholds. Cumulative impacts analysis required." }], zones: "CA zoning entirely local under state enabling law. Common: R-1/RS (single-family), RM (multi-family), PD (planned development), AG (agricultural). SB 9 (2021): duplex and lot split allowed by-right on most single-family lots. SB 10: streamlined upzoning near transit.", tips: ["CEQA litigation: Most significant risk in CA. Anti-litigation strategies include MND + community outreach.", "SB 330 Housing Crisis Act: Prohibits downzoning, caps fees, mandates streamlined review for housing projects.", "Density Bonus Law: Gov Code 65915 — 50%+ affordable triggers up to 80% density bonus.", "Builder's Remedy: If HCD non-compliance, developers can propose projects inconsistent with zoning.", "Water supply: SB 610/221 require water supply assessment/verification before entitlement."] },
    AZ: { name: "Arizona", abbr: "AZ", flag: "🌵", overview: "Arizona is one of the most developer-friendly states with strong private property rights (ARS 12-1134). No state environmental review law. Water resource restrictions are a critical evolving constraint since 2023 Colorado River shortage declaration.", entitlement: [{ phase: "Pre-Application Conference", duration: "1–3 weeks", notes: "Required in Phoenix, Scottsdale. Formal PAC process." }, { phase: "Rezoning Application", duration: "60–90 days", notes: "Public hearing before P&Z Commission. 300–1,000 ft neighbor notification." }, { phase: "City Council Approval", duration: "30–45 days", notes: "Legislative act." }, { phase: "Preliminary Subdivision Plat", duration: "30–60 days", notes: "DRC review." }, { phase: "Construction Plans", duration: "30–60 days", notes: "Civil engineering plans." }, { phase: "Final Subdivision Plat", duration: "30 days", notes: "Recorded with County Recorder." }], fees: [{ type: "Development Impact Fees", range: "$3,000–$20,000/unit", notes: "ARS 9-463.05. Phoenix ~$8,000, Scottsdale ~$12,000, Queen Creek ~$18,000" }, { type: "ADWR Water Report", range: "$100–$500", notes: "100-year Assured Water Supply (AWS) designation required." }, { type: "Plat Application Fee", range: "$1,000–$5,000", notes: "City-specific. Plus per-lot fee ($10–50/lot)." }, { type: "AZPDES / Stormwater", range: "$0 fee (ADEQ)", notes: "NOI required. SWPPP preparation cost $2,000–8,000." }], env: [{ item: "Assured Water Supply", detail: "ADWR requires 100-year AWS demonstration for new residential subdivisions in AMAs. Critical constraint since 2023." }, { item: "AZ Native Plant Law", detail: "ARS 3-904: Protected native plants (saguaro, ironwood, blue palo verde) cannot be removed without ADA permit." }, { item: "Washes & Floodplains", detail: "AZ washes ephemeral but FEMA FIRM maps apply. CLOMR/LOMR often needed." }, { item: "Listed Species", detail: "USFWS federal ESA only for most species. State: AZ Game & Fish for AZ state-listed." }], zones: "AZ zoning municipal/county. Common: R1-6, R1-8, R1-10 (min lot size in thousands SF), PAD (planned area development, most common for subdivisions). State Trust Land must be purchased at ASLD auction. AZ legislature preempted local ADU restrictions 2023.", tips: ["Water supply is existential — verify AWS designation before LOI. Engage water utility or ADWR first.", "State Trust Land: ~9.2M acres in AZ. Must be purchased at auction from ASLD.", "Development fee cap: ARS 9-463.05 — cities can only charge for 10 years of infrastructure at buildout.", "Queen Creek/Pinal County: Explosive growth. Impact fees highest in state.", "Takings: ARS 12-1134 (Prop 207) — regulations reducing property value >50% require compensation."] },
};

const STATES = Object.keys(JURIS_DATA);
const TABS = ["Overview", "Entitlement Timeline", "Fees & Costs", "Environmental", "Zoning", "AI Advisor"];

export function JurisdictionIntel() {
    const [sel, setSel] = useState("CA");
    const [tab, setTab] = useState(0);
    const data = JURIS_DATA[sel] || JURIS_DATA.CA;

    const aiSystem = `You are a senior real estate development regulatory expert specializing in ${data.name}. Entitlement phases: ${data.entitlement.map(e => e.phase).join(", ")}. Key fees: ${data.fees.map(f => f.type).join(", ")}. Environmental constraints: ${data.env.map(e => e.item).join(", ")}. Tips: ${data.tips.join(" | ")}. Provide accurate, specific, actionable guidance. Reference specific statutes, agencies, timelines, and dollar amounts.`;

    return (
        <div>
            {/* State selector */}
            <div className="axiom-flex-row" style={{ gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
                <div className="axiom-text-10-dim" style={{ fontWeight: 700, letterSpacing: 1 }}>SELECT STATE:</div>
                {STATES.map(st => (
                    <button key={st} style={{ padding: "5px 12px", fontSize: 10, fontWeight: sel === st ? 700 : 400, background: sel === st ? "var(--c-gold)" : "var(--c-bg2)", color: sel === st ? "#000" : "var(--c-sub)", border: `1px solid ${sel === st ? "var(--c-gold)" : "var(--c-border)"}`, borderRadius: 3, cursor: "pointer" }} onClick={() => setSel(st)}>
                        {JURIS_DATA[st].flag} {JURIS_DATA[st].abbr}
                    </button>
                ))}
            </div>

            {/* State header */}
            <div style={{ background: "var(--c-bg2)", border: "1px solid rgba(212,168,67,0.25)", borderRadius: 6, padding: "14px 18px", marginBottom: 14 }} className="axiom-flex-between">
                <div>
                    <div style={{ fontSize: 20, fontWeight: 700, color: "var(--c-gold)" }}>{data.flag} {data.name} Development Intelligence</div>
                    <div style={{ fontSize: 12, color: "var(--c-sub)", marginTop: 4, maxWidth: 640, lineHeight: 1.5 }}>{data.overview}</div>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0, marginLeft: 16 }}>
                    <div className="axiom-text-11-dim">Entitlement Phases</div>
                    <div style={{ fontSize: 28, fontWeight: 700, color: "var(--c-text)" }}>{data.entitlement.length}</div>
                    <div className="axiom-text-11-dim" style={{ marginTop: 4 }}>Typical Timeline</div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "var(--c-amber)" }}>6–18 months</div>
                </div>
            </div>

            {/* Tab bar */}
            <div className="axiom-flex-row" style={{ gap: 6, marginBottom: 14, flexWrap: "wrap" }}>
                {TABS.map((t, i) => (
                    <button key={i} style={{ padding: "5px 12px", fontSize: 10, fontWeight: tab === i ? 700 : 400, background: tab === i ? "var(--c-gold)" : "var(--c-bg2)", color: tab === i ? "#000" : "var(--c-sub)", border: `1px solid ${tab === i ? "var(--c-gold)" : "var(--c-border)"}`, borderRadius: 3, cursor: "pointer" }} onClick={() => setTab(i)}>{t}</button>
                ))}
            </div>

            {/* Tab: Overview */}
            {tab === 0 && (
                <div className="axiom-grid-2" style={{ gap: 12 }}>
                    <Card title={`${data.name} Developer Tips`}>
                        {data.tips.map((tip, i) => (
                            <div key={i} className="axiom-flex-row" style={{ gap: 10, padding: "8px 0", borderBottom: "1px solid var(--c-border)", alignItems: "flex-start" }}>
                                <span style={{ color: "var(--c-gold)", fontWeight: 700, flexShrink: 0 }}>{i + 1}.</span>
                                <div style={{ fontSize: 12, color: "var(--c-sub)", lineHeight: 1.5 }}>{tip}</div>
                            </div>
                        ))}
                    </Card>
                    <Card title="Zoning Framework">
                        <div style={{ fontSize: 12, color: "var(--c-sub)", lineHeight: 1.7 }}>{data.zones}</div>
                    </Card>
                </div>
            )}

            {/* Tab: Entitlement Timeline */}
            {tab === 1 && (
                <Card title={`${data.name} Entitlement Timeline`}>
                    <div style={{ position: "relative", paddingLeft: 24 }}>
                        <div style={{ position: "absolute", left: 10, top: 0, bottom: 0, width: 2, background: "rgba(212,168,67,0.3)" }} />
                        {data.entitlement.map((e, i) => (
                            <div key={i} style={{ position: "relative", marginBottom: 18, paddingLeft: 20 }}>
                                <div style={{ position: "absolute", left: -18, top: 4, width: 10, height: 10, borderRadius: "50%", background: "var(--c-gold)", border: "2px solid var(--c-bg)" }} />
                                <div className="axiom-flex-between">
                                    <div style={{ fontSize: 13, color: "var(--c-text)", fontWeight: 600 }}>Phase {i + 1}: {e.phase}</div>
                                    <Badge label={e.duration} color="var(--c-blue)" />
                                </div>
                                <div className="axiom-text-11-dim" style={{ marginTop: 3 }}>{e.notes}</div>
                            </div>
                        ))}
                    </div>
                </Card>
            )}

            {/* Tab: Fees */}
            {tab === 2 && (
                <Card title={`${data.name} Fee Schedule`}>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                            <tr>
                                <th className="axiom-th">Fee Type</th>
                                <th className="axiom-th">Typical Range</th>
                                <th className="axiom-th">Notes</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.fees.map((f, i) => (
                                <tr key={i}>
                                    <td className="axiom-td" style={{ color: "var(--c-gold)", fontWeight: 600 }}>{f.type}</td>
                                    <td className="axiom-td" style={{ color: "var(--c-green)", fontWeight: 700 }}>{f.range}</td>
                                    <td className="axiom-td" style={{ fontSize: 10 }}>{f.notes}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </Card>
            )}

            {/* Tab: Environmental */}
            {tab === 3 && (
                <Card title={`${data.name} Environmental Requirements`}>
                    {data.env.map((e, i) => (
                        <div key={i} style={{ padding: "12px 0", borderBottom: "1px solid var(--c-border)" }}>
                            <div style={{ fontSize: 13, color: "var(--c-text)", fontWeight: 600, marginBottom: 4 }}>🌿 {e.item}</div>
                            <div style={{ fontSize: 12, color: "var(--c-sub)", lineHeight: 1.6 }}>{e.detail}</div>
                        </div>
                    ))}
                </Card>
            )}

            {/* Tab: Zoning */}
            {tab === 4 && (
                <Card title={`${data.name} Zoning & Land Use`}>
                    <div style={{ fontSize: 13, color: "var(--c-sub)", lineHeight: 1.8 }}>{data.zones}</div>
                </Card>
            )}

            {/* Tab: AI Advisor */}
            {tab === 5 && (
                <Card title={`${data.name} AI Regulatory Advisor`} action={<Badge label={`${data.flag} ${data.name} Expert`} color="var(--c-gold)" />}>
                    <div className="axiom-text-12-dim" style={{ marginBottom: 10 }}>AI advisor pre-loaded with {data.name} regulations, timelines, fees, and environmental requirements.</div>
                    <div className="axiom-flex-row" style={{ gap: 6, marginBottom: 12, flexWrap: "wrap" }}>
                        {[
                            `What is the entitlement timeline in ${data.name}?`,
                            `Estimate impact fees for 50-lot SFR subdivision in ${data.name}`,
                            `Key environmental constraints in ${data.name}?`,
                            `Biggest deal-killers for developers in ${data.name}?`,
                        ].map((q, i) => (
                            <Button key={i} label={q.length > 50 ? q.substring(0, 47) + "..." : q} onClick={() => { const el = document.getElementById("JurisAI-input") as HTMLInputElement | null; if (el) { el.value = q; el.dispatchEvent(new Event("input", { bubbles: true })); } }} />
                        ))}
                    </div>
                    <Agent id="JurisAI" system={aiSystem} placeholder={`Ask about ${data.name} development regulations, fees, and entitlements...`} />
                </Card>
            )}
        </div>
    );
}
