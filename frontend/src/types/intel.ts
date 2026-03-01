export type IntelType = 'ZONING' | 'MARKET' | 'RENT_COMP' | 'COST' | 'ABSORPTION' | 'DEMOGRAPHICS' | 'OTHER';

export interface IntelRecord {
    id: string;
    user_id: string;
    record_type: IntelType;
    title: string;
    state: string;
    county: string;
    city?: string;
    zipcode?: string;

    geo_tags: string[];
    metrics: Record<string, any>;
    source?: string;
    notes?: string;
    internal_only: boolean;

    created_at: string;
    updated_at: string;
}

export const INTEL_LABELS: Record<IntelType, string> = {
    ZONING: 'Zoning Code',
    MARKET: 'Market Report',
    RENT_COMP: 'Rent Comps',
    COST: 'Construction Costs',
    ABSORPTION: 'Absorption Rate',
    DEMOGRAPHICS: 'Demographics',
    OTHER: 'Other'
};

export const MOCK_INTEL: IntelRecord[] = [
    {
        id: '1', user_id: 'system', record_type: 'MARKET', title: 'Q4 2025 Multifamily Outlook - FL',
        state: 'FL', county: 'Orange', city: 'Orlando', zipcode: '32801',
        geo_tags: ['Tier 1', 'Growth Market'],
        metrics: { cap_rate: 5.5, rent_growth: 3.2 },
        source: 'CoStar', internal_only: false,
        created_at: new Date().toISOString(), updated_at: new Date().toISOString()
    },
    {
        id: '2', user_id: 'system', record_type: 'ZONING', title: 'R-3 Density Update 2026',
        state: 'FL', county: 'Hillsborough', city: 'Tampa',
        geo_tags: ['Urban Core'],
        metrics: { max_density: 45 },
        source: 'MuniCode', internal_only: false,
        created_at: new Date().toISOString(), updated_at: new Date().toISOString()
    }
];
