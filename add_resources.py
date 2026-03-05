import re

file_path = "frontend/src/v1/features/analysis/JurisdictionIntel.tsx"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Update TS interfaces
interfaces_repl = """interface EntPhase { phase: string; duration: string; notes: string; }
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
}"""

content = re.sub(r"interface EntPhase .*?\n}",
                 interfaces_repl, content, flags=re.DOTALL)

# 2. Add resources data to JURIS_DATA objects
resources_map = {
    "FL": '[{ name: "Florida DEP - Business Portal", url: "https://floridadep.gov/", desc: "Environmental Resource Permitting (ERP) and state water quality standards." }, { name: "South Florida Water Management District", url: "https://www.sfwmd.gov/", desc: "Permitting for stormwater, wetlands, and consumptive water use in South Florida." }, { name: "Florida Dept. of Economic Opportunity", url: "https://floridajobs.org/", desc: "Comprehensive planning and DRI (Development of Regional Impact) resources." }]',
    "TX": '[{ name: "TCEQ Water Permitting", url: "https://www.tceq.texas.gov/", desc: "Texas Commission on Environmental Quality - storm water and wastewater permits." }, { name: "Texas Water Development Board", url: "https://www.twdb.texas.gov/", desc: "State water planning, flood science, and financial assistance." }, { name: "TxDOT Highway Permitting", url: "https://www.txdot.gov/", desc: "Driveway, utility, and drainage permits for state highway access." }]',
    "CA": '[{ name: "CEQAnet Web Portal", url: "https://ceqanet.opr.ca.gov/", desc: "Database of environmental documents for California Environmental Quality Act (CEQA)." }, { name: "CA Dept. of Housing and Community Development", url: "https://www.hcd.ca.gov/", desc: "Guidance on Housing Elements, SB 9, SB 330, and Density Bonus Law." }, { name: "State Water Resources Control Board", url: "https://www.waterboards.ca.gov/", desc: "Section 401 Water Quality Certifications and construction stormwater." }]',
    "AZ": '[{ name: "Arizona Dept. of Water Resources", url: "https://new.azwater.gov/", desc: "Assured Water Supply (AWS) program for subdivisions in Active Management Areas." }, { name: "Arizona State Land Department", url: "https://land.az.gov/", desc: "Information on state trust land auctions, zoning, and rights-of-way." }, { name: "Maricopa County Planning & Development", url: "https://www.maricopa.gov/149/Planning-Development", desc: "Zoning, building, and environmental services for the state\'s largest county." }]',
    "CO": '[{ name: "Colorado Division of Water Resources", url: "https://dwr.colorado.gov/", desc: "Administration of water rights (prior appropriation), well permits, and augmentation plans." }, { name: "Colorado Dept. of Public Health & Environment", url: "https://cdphe.colorado.gov/", desc: "Water quality (stormwater), air quality, and hazardous waste regulation." }, { name: "Colorado Department of Local Affairs", url: "https://cdola.colorado.gov/", desc: "Land use planning resources, demographics, and special district (Metro District) info." }]',
    "NV": '[{ name: "Southern Nevada Water Authority", url: "https://www.snwa.com/", desc: "Water resource planning, conservation rules, and development commitment policies for Las Vegas." }, { name: "Nevada Division of Environmental Protection", url: "https://ndep.nv.gov/", desc: "Statewide environmental permits, construction stormwater, and water quality." }, { name: "Clark County Comprehensive Planning", url: "https://www.clarkcountynv.gov/", desc: "Zoning, master plans, and public hearing schedules for Las Vegas metro." }]',
    "PA": '[{ name: "Pennsylvania DEP - ePermitting", url: "https://www.dep.pa.gov/", desc: "Chapter 102 (Erosion) and Chapter 105 (Waterways) permt applications." }, { name: "PA Natural Diversity Inventory (PNDI)", url: "https://conservationexplorer.dcnr.pa.gov/", desc: "Required environmental review tool for threatened and endangered species (e.g., Bog Turtle)." }, { name: "PennDOT Highway Occupancy Permits", url: "https://www.penndot.pa.gov/", desc: "Requirements for access to State Highways (Act 209 studies)." }]',
    "GA": '[{ name: "Georgia Environmental Protection Division", url: "https://epd.georgia.gov/", desc: "NPDES, stream buffer variances, and water withdrawal permits." }, { name: "Atlanta Regional Commission (ARC)", url: "https://atlantaregional.org/", desc: "Development of Regional Impact (DRI) review and regional planning for metro Atlanta." }, { name: "Georgia Soil and Water Conservation Comm.", url: "https://gaswcc.georgia.gov/", desc: "Erosion and sediment control regulations and design manuals." }]',
    "NC": '[{ name: "NC Dept. of Environmental Quality", url: "https://deq.nc.gov/", desc: "Oversight of water resources, erosion control, and coastal management." }, { name: "NCDOT Traffic Engineering", url: "https://www.ncdot.gov/", desc: "Traffic Impact Analysis (TIA) guidelines and driveway permits." }, { name: "NC OneMap", url: "https://www.nconemap.gov/", desc: "Comprehensive statewide GIS clearinghouse for parcels, elevation, and environmental layers." }]',
    "TN": '[{ name: "TN Dept. of Environment & Conservation", url: "https://www.tn.gov/environment.html", desc: "Construction General Permit (NPDES), ARAP permits, and state regulatory resources." }, { name: "Tennessee Comptroller - Local Govt", url: "https://comptroller.tn.gov/", desc: "Information on utility districts, impact fee legality, and local government finance." }, { name: "Nashville Metro Planning Department", url: "https://www.nashville.gov/", desc: "Zoning, subdivision regulations, and planning commission schedules for Davidson County." }]'
}


for state, res in resources_map.items():
    # Make sure we only replace the FIRST tips array matched AFTER the state key
    pattern = rf"({state}:\s*{{.*?tips:\s*\[.*?\])(\s*\}})"
    content = re.sub(
        pattern, rf"\1, resources: {res}\2", content, flags=re.DOTALL | re.MULTILINE, count=1)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)
