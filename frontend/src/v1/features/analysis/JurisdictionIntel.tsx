import { useState } from "react";
import { Card, Badge, Button } from "../../components/ui/components";
import { Agent } from "../agents/Agent";

interface EntPhase { phase: string; duration: string; notes: string; }
interface FeeRow { type: string; range: string; notes: string; }
interface EnvRow { item: string; detail: string; }
interface ResourceLink { name: string; url: string; desc: string; }

interface StateData {
    name: string; abbr: string; flag: string;
    overview: string;
    entitlement: EntPhase[];
    fees: FeeRow[];
    env: EnvRow[];
    zones: string;
    tips: string[];
    resources: ResourceLink[];
}

const JURIS_DATA: Record<string, StateData> = {
    FL: { name: "Florida", abbr: "FL", flag: "🌴", overview: "Florida has a streamlined subdivision approval process under the Florida Subdivision Act (Ch. 177 F.S.). No CEQA equivalent. Primary regulators: FDEP (water/wetlands), SFWMD/WMDs, county/city planning departments.", entitlement: [{ phase: "Pre-Application Conference", duration: "2–4 weeks", notes: "Required by most FL counties. Identify issues early." }, { phase: "Preliminary Plat", duration: "30–60 days", notes: "Staff review, DRC review. Public notice required." }, { phase: "Planning Commission Hearing", duration: "30–45 days", notes: "Quasi-judicial in FL. Must present competent substantial evidence." }, { phase: "BCC/City Commission Approval", duration: "30–45 days", notes: "Final approval. Conditions of approval issued." }, { phase: "Final Plat Survey & Engineering", duration: "60–120 days", notes: "Boundary survey, legal descriptions, engineer certification." }, { phase: "Final Plat Recording", duration: "2–4 weeks", notes: "Filed with Clerk of Courts. Recorded in plat book." }, { phase: "ERP Permit (if wetlands)", duration: "60–120 days", notes: "Environmental Resource Permit from SFWMD. Required for >0.5 ac disturbance." }], fees: [{ type: "Impact Fees (Roads)", range: "$3,000–$8,000/unit", notes: "Varies by county. Hillsborough ~$6,200, Orange ~$5,800, Lee ~$4,100" }, { type: "Impact Fees (Schools)", range: "$2,500–$6,500/unit", notes: "School board adopted. Broward ~$6,200, Collier ~$5,900" }, { type: "Impact Fees (Water/Sewer)", range: "$3,000–$9,000/unit", notes: "Utility-set. JEA ~$7,400, TOHO ~$6,100." }, { type: "Plat Recording Fee", range: "$10–$15/lot", notes: "Clerk of Courts. Nominal." }], env: [{ item: "Wetlands / ERP", detail: "FDEP & WMD jurisdiction. ERP permit required. Mitigation ratio typically 1.5:1–2:1." }, { item: "Listed Species", detail: "Florida Scrub Jay, Gopher Tortoise, Florida Panther (SW FL). FWC coordination required." }, { item: "Stormwater / NPDES", detail: "FDEP NPDES permit for >1 ac disturbance. NOI required. SWPPP mandatory." }, { item: "DRI Review", detail: "Development of Regional Impact: >3,000 residential units triggers DRI review under FL Ch. 380." }], zones: "FL zoning is municipality/county-specific. Common residential: R-1 (single-family, 6,000–10,000 SF min lot), R-2/R-3 (multi-family), PUD (most common for subdivisions). ADUs allowed by statute since 2020.", tips: ["DRI thresholds: >3,000 residential units in many counties triggers DRI review.", "Concurrency: FL Statute Ch. 163 requires concurrency for roads, schools, utilities.", "Impact fee credits: Donate ROW or build infrastructure for credits.", "Wetland mitigation banking well-established — use banks vs. on-site mitigation.", "School concurrency: Certificate required before building permits."], resources: [{ name: "Florida DEP - Business Portal", url: "https://floridadep.gov/", desc: "Environmental Resource Permitting (ERP) and state water quality standards." }, { name: "South Florida Water Management District", url: "https://www.sfwmd.gov/", desc: "Permitting for stormwater, wetlands, and consumptive water use in South Florida." }, { name: "Florida Dept. of Economic Opportunity", url: "https://floridajobs.org/", desc: "Comprehensive planning and DRI (Development of Regional Impact) resources." }] },
    TX: { name: "Texas", abbr: "TX", flag: "⭐", overview: "Texas is developer-friendly with minimal state-level land use regulation. Cities have broad zoning authority but counties have limited power. No state environmental review. Primary regulators: TCEQ (environmental), TWDB (water), TxDOT (state roads), local municipalities.", entitlement: [{ phase: "Pre-Application Meeting", duration: "1–2 weeks", notes: "Optional but recommended." }, { phase: "Preliminary Plat", duration: "30 days statutory", notes: "Texas LGC 212.009: 30 days to approve/deny or deemed approved." }, { phase: "P&Z Commission", duration: "30–45 days", notes: "Public hearing. Most TX cities have P&Z for plat recommendations." }, { phase: "City Council Approval", duration: "30 days", notes: "Final authority." }, { phase: "Construction Plan Approval", duration: "30–60 days", notes: "Engineering plans for utilities, streets, drainage." }, { phase: "Final Plat", duration: "30 days", notes: "Filed with county clerk after construction complete or bonded." }], fees: [{ type: "Plat Application Fee", range: "$500–$5,000", notes: "City-specific. Austin ~$3,500+, Dallas ~$2,000, Houston minimal" }, { type: "Impact Fees", range: "$0–$15,000/unit", notes: "TX LGC Ch. 395. Austin ~$12,000+/unit, Frisco ~$10,000, smaller cities often $0–3,000" }, { type: "MUD Tap Fees", range: "$2,000–$8,000/unit", notes: "Municipal Utility District tap fees common." }, { type: "TCEQ Stormwater", range: "$100 NOI fee", notes: "Phase II MS4. SWPPP required for >1 ac." }], env: [{ item: "No State CEQA", detail: "Texas has no CEQA/SEPA equivalent. Environmental review is federal (NEPA) only when federal nexus." }, { item: "TCEQ / Stormwater", detail: "TCEQ Construction General Permit (TXR150000). NOI required for >1 ac. SWPPP required." }, { item: "Wetlands", detail: "US Army Corps Section 404 only. Texas has no additional state wetland permitting layer." }, { item: "Edwards Aquifer", detail: "EARIP rules for Barton Springs area. Impervious cover limits 15–25%." }], zones: "Texas cities zone independently. Common: SF-1/SF-2 (single-family, 7,500–10,000 SF min), PD (planned development), TH (townhome). Houston: no city-wide zoning code — deed restrictions substitute.", tips: ["Deemed approved: TX LGC 212.009 — city doesn't act within 30 days, plat deemed approved.", "MUD strategy: Create a MUD for infrastructure finance. Bonds issued, residents pay via tax rate.", "Unincorporated areas: Counties can require plats but cannot zone.", "Austin: Most complex TX market. Consult local land use attorney.", "Impact fee caps: Ch. 395 limits impact fees to 50% of capital costs."], resources: [{ name: "TCEQ Water Permitting", url: "https://www.tceq.texas.gov/", desc: "Texas Commission on Environmental Quality - storm water and wastewater permits." }, { name: "Texas Water Development Board", url: "https://www.twdb.texas.gov/", desc: "State water planning, flood science, and financial assistance." }, { name: "TxDOT Highway Permitting", url: "https://www.txdot.gov/", desc: "Driveway, utility, and drainage permits for state highway access." }] },
    CA: { name: "California", abbr: "CA", flag: "🌉", overview: "California has the most complex and regulated land development environment in the US. The Subdivision Map Act governs platting. CEQA environmental review is required for most discretionary permits. HCD (Housing & Community Development) enforces housing law. Multiple regional agencies.", entitlement: [{ phase: "Pre-Application Conference", duration: "2–6 weeks", notes: "Required in most CA jurisdictions. Formal PAC process." }, { phase: "Application Submittal & Completeness", duration: "30 days", notes: "Govt Code 65943: agency must determine completeness within 30 days." }, { phase: "CEQA / Environmental Review", duration: "3–18 months", notes: "Neg Dec, MND, or EIR depending on impacts. 45-day public review for EIR." }, { phase: "Tentative Map / Planning Commission", duration: "3–6 months", notes: "Public hearing. Planning Commission approval or recommendation." }, { phase: "City Council / Board of Supervisors", duration: "1–3 months", notes: "Final approval for discretionary entitlements. Legislative act for rezonings." }, { phase: "Final Map / Engineering", duration: "6–18 months", notes: "Civil engineering, improvement agreements, bonds required before recordation." }, { phase: "Final Map Recordation", duration: "1–3 months", notes: "County Recorder. Creates legal parcels." }], fees: [{ type: "Development Impact Fees", range: "$10,000–$100,000+/unit", notes: "CA highest in nation. Bay Area cities often $50,000–100,000+/unit." }, { type: "School Fees (Level 1)", range: "$4.93/SF residential", notes: "State-mandated minimum. Level 2 & 3 much higher with state funding." }, { type: "Park Fees (Quimby Act)", range: "$5,000–$30,000/unit", notes: "Quimby Act: 3 acres/1,000 residents. In-lieu fees negotiable." }, { type: "CEQA Document Prep", range: "$20,000–$500,000+", notes: "MND $15K-$75K, focused EIR $100K-$300K, full EIR $300K-$1M+" }], env: [{ item: "CEQA", detail: "California Environmental Quality Act — required for virtually all discretionary permits. EIR for significant impacts. 45-day public review period. Litigation risk." }, { item: "Wetlands / 401/404", detail: "USACE Section 404, SWRCB Section 401 certification, CDFW 1600 Streambed Alteration Agreement required for wetland/stream impacts. 3+ agency coordination." }, { item: "Listed Species", detail: "CESA (state) + federal ESA. California Gnatcatcher, California Tiger Salamander, Swainson's Hawk, Vernal Pool species. Biological assessment required." }, { item: "Air Quality / GHG", detail: "Air Districts (SCAQMD, BAAQMD, etc.) jurisdiction. CEQA GHG significance thresholds. Cumulative impacts analysis required." }], zones: "CA zoning entirely local under state enabling law. Common: R-1/RS (single-family), RM (multi-family), PD (planned development), AG (agricultural). SB 9 (2021): duplex and lot split allowed by-right on most single-family lots. SB 10: streamlined upzoning near transit.", tips: ["CEQA litigation: Most significant risk in CA. Anti-litigation strategies include MND + community outreach.", "SB 330 Housing Crisis Act: Prohibits downzoning, caps fees, mandates streamlined review for housing projects.", "Density Bonus Law: Gov Code 65915 — 50%+ affordable triggers up to 80% density bonus.", "Builder's Remedy: If HCD non-compliance, developers can propose projects inconsistent with zoning.", "Water supply: SB 610/221 require water supply assessment/verification before entitlement."], resources: [{ name: "CEQAnet Web Portal", url: "https://ceqanet.opr.ca.gov/", desc: "Database of environmental documents for California Environmental Quality Act (CEQA)." }, { name: "CA Dept. of Housing and Community Development", url: "https://www.hcd.ca.gov/", desc: "Guidance on Housing Elements, SB 9, SB 330, and Density Bonus Law." }, { name: "State Water Resources Control Board", url: "https://www.waterboards.ca.gov/", desc: "Section 401 Water Quality Certifications and construction stormwater." }] },
    AZ: { name: "Arizona", abbr: "AZ", flag: "🌵", overview: "Arizona is one of the most developer-friendly states with strong private property rights (ARS 12-1134). No state environmental review law. Water resource restrictions are a critical evolving constraint since 2023 Colorado River shortage declaration.", entitlement: [{ phase: "Pre-Application Conference", duration: "1–3 weeks", notes: "Required in Phoenix, Scottsdale. Formal PAC process." }, { phase: "Rezoning Application", duration: "60–90 days", notes: "Public hearing before P&Z Commission. 300–1,000 ft neighbor notification." }, { phase: "City Council Approval", duration: "30–45 days", notes: "Legislative act." }, { phase: "Preliminary Subdivision Plat", duration: "30–60 days", notes: "DRC review." }, { phase: "Construction Plans", duration: "30–60 days", notes: "Civil engineering plans." }, { phase: "Final Subdivision Plat", duration: "30 days", notes: "Recorded with County Recorder." }], fees: [{ type: "Development Impact Fees", range: "$3,000–$20,000/unit", notes: "ARS 9-463.05. Phoenix ~$8,000, Scottsdale ~$12,000, Queen Creek ~$18,000" }, { type: "ADWR Water Report", range: "$100–$500", notes: "100-year Assured Water Supply (AWS) designation required." }, { type: "Plat Application Fee", range: "$1,000–$5,000", notes: "City-specific. Plus per-lot fee ($10–50/lot)." }, { type: "AZPDES / Stormwater", range: "$0 fee (ADEQ)", notes: "NOI required. SWPPP preparation cost $2,000–8,000." }], env: [{ item: "Assured Water Supply", detail: "ADWR requires 100-year AWS demonstration for new residential subdivisions in AMAs. Critical constraint since 2023." }, { item: "AZ Native Plant Law", detail: "ARS 3-904: Protected native plants (saguaro, ironwood, blue palo verde) cannot be removed without ADA permit." }, { item: "Washes & Floodplains", detail: "AZ washes ephemeral but FEMA FIRM maps apply. CLOMR/LOMR often needed." }, { item: "Listed Species", detail: "USFWS federal ESA only for most species. State: AZ Game & Fish for AZ state-listed." }], zones: "AZ zoning municipal/county. Common: R1-6, R1-8, R1-10 (min lot size in thousands SF), PAD (planned area development, most common for subdivisions). State Trust Land must be purchased at ASLD auction. AZ legislature preempted local ADU restrictions 2023.", tips: ["Water supply is existential — verify AWS designation before LOI. Engage water utility or ADWR first.", "State Trust Land: ~9.2M acres in AZ. Must be purchased at auction from ASLD.", "Development fee cap: ARS 9-463.05 — cities can only charge for 10 years of infrastructure at buildout.", "Queen Creek/Pinal County: Explosive growth. Impact fees highest in state.", "Takings: ARS 12-1134 (Prop 207) — regulations reducing property value >50% require compensation."], resources: [{ name: "Arizona Dept. of Water Resources", url: "https://new.azwater.gov/", desc: "Assured Water Supply (AWS) program for subdivisions in Active Management Areas." }, { name: "Arizona State Land Department", url: "https://land.az.gov/", desc: "Information on state trust land auctions, zoning, and rights-of-way." }, { name: "Maricopa County Planning & Development", url: "https://www.maricopa.gov/149/Planning-Development", desc: "Zoning, building, and environmental services for the state's largest county." }] },
    CO: {
        name: "Colorado", abbr: "CO", flag: "⛰️",
        overview: "Colorado has a complex and increasingly regulated development environment. High-altitude development adds geotechnical complexity. CDPHE governs environmental regulation. Water rights are a critical separate legal domain (prior appropriation doctrine). SB23-213 (2023) significantly reformed land use.",
        entitlement: [
            { phase: "Pre-Application Conference", duration: "2–6 weeks", notes: "Required in most Front Range municipalities. Formal PAC process common." },
            { phase: "Referral & Utility Coordination", duration: "3–6 weeks", notes: "Multi-agency referral to water/ditch companies, school districts, fire districts." },
            { phase: "Sketch / Concept Plan", duration: "30–60 days", notes: "Planning Commission concept review. Public hearing typically not required." },
            { phase: "Preliminary Plan / PUD", duration: "45–90 days", notes: "Planning Commission public hearing. For rezonings, separate legislative hearing." },
            { phase: "Board of County Commissioners / City Council", duration: "30–60 days", notes: "Final land use authority. For PUD or rezoning — legislative act." },
            { phase: "Final Plat", duration: "30–60 days", notes: "Sealed plat, improvements agreement, financial guarantee." }
        ],
        fees: [
            { type: "Development Impact Fees", range: "$5,000–$30,000+/unit", notes: "Denver ~$8,000, Boulder ~$25,000+, Broomfield ~$12,000, Aurora ~$7,500" },
            { type: "Water Tap Fees", range: "$10,000–$40,000/unit", notes: "Most expensive in nation. Denver Water ~$28,000/SF tap, Colorado Springs ~$15,000." },
            { type: "School Impact Fees", range: "$2,000–$7,000/unit", notes: "School district-set. Jefferson Co., Douglas Co., Adams Co. adopt independently." }
        ],
        env: [
            { item: "Water Rights (Prior Appropriation)", detail: "Separate Water Court proceedings. Must purchase water rights ($5,000–$100,000+/acre-foot) or obtain augmentation plan approval." },
            { item: "Wildfire Mitigation", detail: "HB22-1049: Wildfire Mitigation Impact Fee allowed. WUI areas require defensible space, Class A roofing, ember-resistant vents." }
        ],
        zones: "CO zoning local under C.R.S. 30-28-101 (counties) and 31-23-201 (municipalities). Common: R-1/R-2/R-3 (single-family), PUD (primary tool). SB23-213 (2023): Cities >5,000 must allow ADUs by-right, multi-unit near transit, lot splitting. Metro Districts (CO version of MUDs) common.",
        tips: ["Water rights are separate from land rights — purchase water or prove augmentation BEFORE major investment.", "Wildfire: WUI development adds $20,000–60,000/lot for fire mitigation.", "Metro Districts: Special district formation for infrastructure finance common on Front Range."], resources: [{ name: "Colorado Division of Water Resources", url: "https://dwr.colorado.gov/", desc: "Administration of water rights (prior appropriation), well permits, and augmentation plans." }, { name: "Colorado Dept. of Public Health & Environment", url: "https://cdphe.colorado.gov/", desc: "Water quality (stormwater), air quality, and hazardous waste regulation." }, { name: "Colorado Department of Local Affairs", url: "https://cdola.colorado.gov/", desc: "Land use planning resources, demographics, and special district (Metro District) info." }]
    },
    NV: {
        name: "Nevada", abbr: "NV", flag: "🎰",
        overview: "Nevada land development is heavily influenced by federal land ownership (BLM owns ~67% of the state). Las Vegas and Reno/Sparks MSAs dominate growth. Water availability (SNWA in south, TMWA in north) is the overriding constraint. Local jurisdictions hold strong zoning authority.",
        entitlement: [
            { phase: "Pre-Application / Project Review", duration: "2–4 weeks", notes: "Often required to gauge infrastructure availability and zoning compatibility." },
            { phase: "Zone Change / Master Plan Amendment", duration: "90–120 days", notes: "If required. Includes neighborhood meetings and multiple public hearings." },
            { phase: "Tentative Map", duration: "45–60 days", notes: "Reviewed by Planning Commission. Subject to strict conditions of approval." },
            { phase: "Improvement Plans", duration: "60–90 days", notes: "Detailed civil engineering review for grading, drainage, streets, utilities." },
            { phase: "Final Map", duration: "30–45 days", notes: "Requires bonding for improvements. Recorded to create legal lots." }
        ],
        fees: [
            { type: "Water Connection / Facility Charge", range: "$3,000–$8,000/unit", notes: "SNWA (Vegas) or TMWA (Reno). Plus actual meter installation." },
            { type: "Park/Residential Construction Tax", range: "$500–$1,500/unit", notes: "Statutory cap exists but usually maxed out by local entities." },
            { type: "Traffic / Regional Transportation", range: "$1,000–$3,500/unit", notes: "RTC fees in Clark and Washoe counties." },
            { type: "School District Impact Fee", range: "$1,600–$3,500/unit", notes: "Varies; CCSD and WCSD have established fees for new residential." }
        ],
        env: [
            { item: "Water Resources", detail: "Extremely tight. SNWA enforces turf limits, pool size limits, and requires commitment long before Final Map." },
            { item: "Desert Tortoise (Clark Cty)", detail: "ESA protected. Clark County MSHCP fee (approx. $550/acre) usually required prior to grading." },
            { item: "Air Quality / Dust Control", detail: "DAQem (Clark County) requires strict dust control permits and constant monitoring during grading." }
        ],
        zones: "Clark County/Las Vegas and Washoe County/Reno dictate most NV zoning. R-1, R-2, R-3 typical. Master Planned Communities (MPCs) use specific plan zoning (e.g., Summerlin, Inspirada).",
        tips: ["BLM Land Auctions (SNPLMA): Major way land is acquired given fed ownership. Cash intensive.", "Water is EVERYTHING. Verify commitment from SNWA/TMWA before any non-refundable money goes hard.", "Dust control enforcement is severe; factor water truck costs into site prep."], resources: [{ name: "Southern Nevada Water Authority", url: "https://www.snwa.com/", desc: "Water resource planning, conservation rules, and development commitment policies for Las Vegas." }, { name: "Nevada Division of Environmental Protection", url: "https://ndep.nv.gov/", desc: "Statewide environmental permits, construction stormwater, and water quality." }, { name: "Clark County Comprehensive Planning", url: "https://www.clarkcountynv.gov/", desc: "Zoning, master plans, and public hearing schedules for Las Vegas metro." }]
    },
    PA: {
        name: "Pennsylvania", abbr: "PA", flag: "🔔",
        overview: "PA development is hyper-local, governed by the Municipalities Planning Code (MPC) across ~2,500 fragmented municipalities (townships, boroughs, cities). DEP regulates harsh stormwater and environmental rules (NPDES). 'By-right' development is legally strong if you meet ordinances.",
        entitlement: [
            { phase: "Sketch Plan", duration: "30 days", notes: "Optional but highly recommended to gauge township engineer and planning commission reception." },
            { phase: "Preliminary Land Development / Subdivision", duration: "90–120 days", notes: "MPC allows 90 days for review. Often requires time extensions. Full engineering required." },
            { phase: "Conditional Use / Special Exception", duration: "45–90 days", notes: "If required by zoning. Hearing before Supervisors (Conditional) or Zoning Hearing Board (Special)." },
            { phase: "Conservation District / NPDES", duration: "90–180+ days", notes: "E&S and Post-Construction Stormwater Mgmt (PCSM). Often the critical path." },
            { phase: "Final Plan", duration: "30–60 days", notes: "Requires executed development agreements, posted financial security, and outside agency permits." }
        ],
        fees: [
            { type: "Sewer Tapping Fees", range: "$1,500–$8,000+/EDU", notes: "Governed by Act 57. Highly variable depending on local authority capacity." },
            { type: "Traffic Impact Fees", range: "$1,000–$3,000/peak trip", notes: "Only where an Act 209 study has been adopted (common in growth townships)." },
            { type: "Fee-in-Lieu of Recreation", range: "$1,000–$3,000/unit", notes: "Or land dedication. Township-specific." },
            { type: "Escrows (Legal/Eng)", range: "$5,000–$50,000", notes: "Developer pays all municipal consultant review fees. Must replenish." }
        ],
        env: [
            { item: "NPDES / Stormwater", detail: "Chapter 102. Extreme scrutiny on volume control, water quality, and rate. County Conservation Districts are tough." },
            { item: "Wetlands / Streams", detail: "Chapter 105 (Joint Permit with USACE). Exceptional Value (EV) or High Quality (HQ) watersheds trigger massive buffer and stormwater restrictions." },
            { item: "PNDI Search", detail: "PA Natural Diversity Inventory. Required for NPDES. Bog Turtle (SE/SC PA) habitat surveys frequently delay projects 6-12 months." }
        ],
        zones: "Governed by local zoning ordinances. Townships often use large-lot zoning to deter dense residential, making curative amendments or rezoning difficult. Age-restricted (55+) overlays are popular to avoid school impacts.",
        tips: ["Never underestimate the power of the Township Engineer; they control your fate on technical reviews.", "PNDI Hits (Bog Turtle, bats) dictate survey windows. Miss the spring window, lose a year.", "Act 250 (PennDOT) Highway Occupancy Permits (HOP) take 6-12 months. Start traffic studies immediately.", "Township Supervisors are elected; NIMBYism is powerful. By-right plans are safest."], resources: [{ name: "Pennsylvania DEP - ePermitting", url: "https://www.dep.pa.gov/", desc: "Chapter 102 (Erosion) and Chapter 105 (Waterways) permt applications." }, { name: "PA Natural Diversity Inventory (PNDI)", url: "https://conservationexplorer.dcnr.pa.gov/", desc: "Required environmental review tool for threatened and endangered species (e.g., Bog Turtle)." }, { name: "PennDOT Highway Occupancy Permits", url: "https://www.penndot.pa.gov/", desc: "Requirements for access to State Highways (Act 209 studies)." }]
    },
    GA: {
        name: "Georgia", abbr: "GA", flag: "🍑",
        overview: "Georgia's development process is county/city-driven with moderate regulation. State oversight via EPD (Environmental Protection Division) for water quality and wetlands. Most suburbs in Atlanta metro have robust planning departments with detailed UDCs.",
        entitlement: [
            { phase: "Pre-Application Concept Review", duration: "2–4 weeks", notes: "Informal. Most GA counties encourage this step." },
            { phase: "Preliminary Plat / Development Plan", duration: "30–60 days", notes: "Staff review + DRC. Traffic study may be triggered." },
            { phase: "Planning Commission Hearing", duration: "30–60 days", notes: "Advisory recommendation in most GA jurisdictions." },
            { phase: "Board of Commissioners / City Council", duration: "30–45 days", notes: "Final decision authority." },
            { phase: "Construction Plans / LDP", duration: "30–60 days", notes: "Land Disturbance Permit required for any disturbance >1 ac." }
        ],
        fees: [
            { type: "Development Impact Fees", range: "$1,000–$8,000/unit", notes: "Gwinnett ~$5,200, Cherokee ~$3,800, Forsyth ~$4,500" },
            { type: "School Impact Fees", range: "$1,000–$4,000/unit", notes: "Not all GA counties charge." },
            { type: "Water/Sewer Connection", range: "$3,000–$8,000/unit", notes: "County water/sewer authorities." }
        ],
        env: [
            { item: "GA EPD / Erosion Control", detail: "GSWCC certified plan required for LDP. Inspection program rigorous." },
            { item: "Wetlands / Stream Buffers", detail: "State buffer law: 25-ft undisturbed buffer + 25-ft impervious setback from state waters. Federal 404 applies." }
        ],
        zones: "GA zoning entirely local. AG (Agricultural) zoning common for undeveloped land — rezoning to residential required. PD/PRD popular for mixed density.",
        tips: ["Stream buffers are a major constraint — map all state waters early with GIS and field survey.", "Traffic studies triggered at 100+ peak hour trips.", "Forsyth/Cherokee: Explosive growth counties. Entitlement timelines stretch due to workload."], resources: [{ name: "Georgia Environmental Protection Division", url: "https://epd.georgia.gov/", desc: "NPDES, stream buffer variances, and water withdrawal permits." }, { name: "Atlanta Regional Commission (ARC)", url: "https://atlantaregional.org/", desc: "Development of Regional Impact (DRI) review and regional planning for metro Atlanta." }, { name: "Georgia Soil and Water Conservation Comm.", url: "https://gaswcc.georgia.gov/", desc: "Erosion and sediment control regulations and design manuals." }]
    },
    NC: {
        name: "North Carolina", abbr: "NC", flag: "🦅",
        overview: "North Carolina has a hybrid state/local development framework. NCDEQ oversees water quality, wetlands, and erosion control statewide. Local governments have broad zoning and subdivision authority under NCGS Ch. 160D.",
        entitlement: [
            { phase: "Pre-Application Conference", duration: "1–3 weeks", notes: "NC 160D-802 encourages pre-application." },
            { phase: "Preliminary Subdivision Plat", duration: "30–60 days", notes: "Technical Review Committee. Public comment period." },
            { phase: "Planning Board Recommendation", duration: "30–45 days", notes: "Advisory to governing board." },
            { phase: "Board of Commissioners / City Council", duration: "30–45 days", notes: "Final approval." },
            { phase: "Erosion Control Plan / NPDES", duration: "30–60 days", notes: "NCDEQ DEMLR. Required for >1 ac." }
        ],
        fees: [
            { type: "Subdivision Application Fee", range: "$500–$4,000", notes: "Mecklenburg ~$3,500, Wake ~$2,800." },
            { type: "Water/Sewer Tap Fees", range: "$2,000–$6,000/unit", notes: "Utility authority-specific. Charlotte Water, OWASA." },
            { type: "Transportation Impact Fee", range: "$1,000–$8,000/unit", notes: "Wake Co, Charlotte, Cary. NCDOT TIA required for >100 trip generators." }
        ],
        env: [
            { item: "Riparian Buffers", detail: "Jordan Lake Watershed: 50-ft Zone 1 (no disturbance) + 50-ft Zone 2 from streams." },
            { item: "Erosion Control", detail: "NC Sedimentation Pollution Control Act — rigorous program. >1 ac requires approved plan with financial assurance." }
        ],
        zones: "Zoning governed by NCGS Ch. 160D. CD (conditional district) rezoning primary tool — approved with binding site plan.",
        tips: ["Conditional Zoning: CD rezonings come with binding conditions — negotiate carefully.", "Jordan Lake buffer: Major constraint in Chatham, Orange, Durham, Wake counties.", "Vested rights: NC 160D-108.1 provides 5-year vested right upon approved preliminary subdivision plat."], resources: [{ name: "NC Dept. of Environmental Quality", url: "https://deq.nc.gov/", desc: "Oversight of water resources, erosion control, and coastal management." }, { name: "NCDOT Traffic Engineering", url: "https://www.ncdot.gov/", desc: "Traffic Impact Analysis (TIA) guidelines and driveway permits." }, { name: "NC OneMap", url: "https://www.nconemap.gov/", desc: "Comprehensive statewide GIS clearinghouse for parcels, elevation, and environmental layers." }]
    },
    TN: {
        name: "Tennessee", abbr: "TN", flag: "🎸",
        overview: "Tennessee is business-friendly with low regulatory burden outside major metros. No state environmental review law. TDEC handles water, air, and waste. County governments control most rural development.",
        entitlement: [
            { phase: "Sketch Plan Review", duration: "2–4 weeks", notes: "Optional informal review." },
            { phase: "Preliminary Plat Submission", duration: "30–60 days", notes: "Regional Planning Commission review." },
            { phase: "Planning Commission Approval", duration: "30–60 days", notes: "Planning Commission has full approval authority for preliminary plats in TN." },
            { phase: "Construction Plan Approval", duration: "30–60 days", notes: "County/city engineer or road department review." },
            { phase: "Final Plat", duration: "30–45 days", notes: "Sealed surveyor plat." }
        ],
        fees: [
            { type: "Impact Fees", range: "$500–$5,000/unit", notes: "TCA 13-20-601. Williamson Co. ~$4,500, Nashville ~$4,200." },
            { type: "Water/Sewer Connection", range: "$1,500–$5,000/unit", notes: "Nashville Water Services, MLGW." }
        ],
        env: [
            { item: "TDEC Construction / NPDES", detail: "Construction General Permit required for >1 ac disturbance." },
            { item: "Karst / Sinkholes", detail: "Significant karst terrain. Geotechnical study required in karst areas. Can void entitlements." }
        ],
        zones: "Nashville suburbs: R-1, R-2, PD/PUD most common for large subdivisions. Many rural TN counties have no county zoning — only subdivision regulations apply.",
        tips: ["Karst study: Required in Middle TN limestone areas. Budget $15,000–40,000 for survey + borings.", "Rural TN: Fast approvals possible due to lack of county zoning.", "Nashville MSA: Explosive growth. Williamson County is highly competitive."], resources: [{ name: "TN Dept. of Environment & Conservation", url: "https://www.tn.gov/environment.html", desc: "Construction General Permit (NPDES), ARAP permits, and state regulatory resources." }, { name: "Tennessee Comptroller - Local Govt", url: "https://comptroller.tn.gov/", desc: "Information on utility districts, impact fee legality, and local government finance." }, { name: "Nashville Metro Planning Department", url: "https://www.nashville.gov/", desc: "Zoning, subdivision regulations, and planning commission schedules for Davidson County." }]
    }
};

const STATES = Object.keys(JURIS_DATA);
const TABS = ["Overview", "Entitlement Timeline", "Fees & Costs", "Environmental", "Zoning", "External Resources", "AI Advisor"];

export function JurisdictionIntel() {
    const [sel, setSel] = useState("CA");
    const [tab, setTab] = useState(0);
    const data = JURIS_DATA[sel] || JURIS_DATA.CA;

    const aiSystem = `You are a senior real estate development regulatory expert specializing in ${data.name}. Entitlement phases: ${data.entitlement.map(e => e.phase).join(", ")}. Key fees: ${data.fees.map(f => f.type).join(", ")}. Environmental constraints: ${data.env.map(e => e.item).join(", ")}. Tips: ${data.tips.join(" | ")}. Provide accurate, specific, actionable guidance. Reference specific statutes, agencies, timelines, and dollar amounts.`;

    return (
        <div className="axiom-flex-col axiom-flex-gap-24">
            {/* State selector */}
            <div className="axiom-flex-gap-8 axiom-flex-wrap">
                <div className="axiom-text-10-dim axiom-text-bold-700 axiom-ls-1">SELECT STATE:</div>
                <div className="axiom-flex-gap-6 axiom-flex-wrap">
                    {STATES.map(st => (
                        <button
                            key={st}
                            className={`axiom-p-5-12 axiom-text-10 axiom-radius-3 axiom-pointer ${sel === st ? "axiom-btn-gold axiom-text-bold-700" : "axiom-btn-secondary"}`}
                            onClick={() => setSel(st)}
                        >
                            {JURIS_DATA[st].flag} {JURIS_DATA[st].abbr}
                        </button>
                    ))}
                </div>
            </div>

            {/* State header */}
            <div className="axiom-flex-sb-center axiom-bg-2 axiom-p-14-18 axiom-radius-6 axiom-mb-14" style={{ border: "1px solid rgba(212,168,67,0.25)" }}>
                <div>
                    <div className="axiom-text-20-gold-bold">{data.flag} {data.name} Development Intelligence</div>
                    <div className="axiom-text-12-sub axiom-mt-4 axiom-max-w-640 axiom-lh-15">{data.overview}</div>
                </div>
                <div className="axiom-text-right axiom-flex-shrink-0 axiom-ml-16">
                    <div className="axiom-text-11-dim">Entitlement Phases</div>
                    <div className="axiom-text-28-bold axiom-text-white">{data.entitlement.length}</div>
                    <div className="axiom-text-11-dim axiom-mt-4">Typical Timeline</div>
                    <div className="axiom-text-14-bold axiom-text-amber">6–18 months</div>
                </div>
            </div>

            {/* Tab bar */}
            <div className="axiom-flex-gap-6 axiom-mb-14 axiom-flex-wrap">
                {TABS.map((t, i) => (
                    <button
                        key={i}
                        className={`axiom-p-5-12 axiom-text-10 axiom-radius-3 axiom-pointer ${tab === i ? "axiom-btn-gold axiom-text-bold-700" : "axiom-btn-secondary"}`}
                        onClick={() => setTab(i)}
                    >
                        {t}
                    </button>
                ))}
            </div>

            {/* Tab: Overview */}
            {tab === 0 && (
                <div className="axiom-grid-2" style={{ gap: 12 }}>
                    <Card title={`${data.name} Developer Tips`}>
                        {data.tips.map((tip, i) => (
                            <div key={i} className="axiom-flex-gap-10 axiom-py-8 axiom-items-start" style={{ borderBottom: "1px solid var(--c-border)" }}>
                                <span className="axiom-text-gold axiom-text-bold-700 axiom-flex-shrink-0">{i + 1}.</span>
                                <div className="axiom-text-12-sub axiom-lh-15">{tip}</div>
                            </div>
                        ))}
                    </Card>
                    <Card title="Zoning Framework">
                        <div className="axiom-text-12-sub axiom-lh-17">{data.zones}</div>
                    </Card>
                </div>
            )}

            {/* Tab: Entitlement Timeline */}
            {tab === 1 && (
                <Card title={`${data.name} Entitlement Timeline`}>
                    <div style={{ position: "relative", paddingLeft: 24 }}>
                        <div style={{ position: "absolute", left: 10, top: 0, bottom: 0, width: 2, background: "rgba(212,168,67,0.3)" }} />
                        {data.entitlement.map((e, i) => (
                            <div key={i} className="axiom-relative axiom-mb-18 axiom-pl-20">
                                <div className="axiom-absolute axiom-w-10 axiom-h-10 axiom-radius-50p axiom-bg-gold" style={{ left: -18, top: 4, border: "2px solid var(--c-bg)" }} />
                                <div className="axiom-flex-sb-center">
                                    <div className="axiom-text-13-text-bold axiom-text-white">Phase {i + 1}: {e.phase}</div>
                                    <Badge label={e.duration} color="var(--c-blue)" />
                                </div>
                                <div className="axiom-text-11-dim axiom-mt-3">{e.notes}</div>
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
                                    <td className="axiom-td axiom-text-gold-bold">{f.type}</td>
                                    <td className="axiom-td axiom-text-green-bold-700">{f.range}</td>
                                    <td className="axiom-td axiom-text-10">{f.notes}</td>
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
                        <div key={i} className="axiom-py-12" style={{ borderBottom: "1px solid var(--c-border)" }}>
                            <div className="axiom-text-13-text-bold axiom-text-white axiom-mb-4">🌿 {e.item}</div>
                            <div className="axiom-text-12-sub axiom-lh-16">{e.detail}</div>
                        </div>
                    ))}
                </Card>
            )}

            {/* Tab: Zoning */}
            {tab === 4 && (
                <Card title={`${data.name} Zoning & Land Use`}>
                    <div className="axiom-text-13-sub axiom-lh-18">{data.zones}</div>
                </Card>
            )}

            {/* Tab: External Resources */}
            {tab === 5 && (
                <Card title={`${data.name} Regulatory Resources`}>
                    <div className="axiom-flex-col axiom-flex-gap-12">
                        {data.resources.map((r, i) => (
                            <a key={i} href={r.url} target="_blank" rel="noreferrer" className="axiom-btn-link-card">
                                <div className="axiom-text-13-gold-bold axiom-mb-4">{r.name} ↗</div>
                                <div className="axiom-text-12-sub axiom-lh-15">{r.desc}</div>
                            </a>
                        ))}
                    </div>
                </Card>
            )}

            {/* Tab: AI Advisor */}
            {tab === 6 && (
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
