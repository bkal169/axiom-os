import { supabase } from './supabase';

const API_URL = 'http://localhost:8001'; // Changed to 8001 due to port conflict

export interface MarketIntel {
    census: {
        population_growth: number;
        median_income: number;
        unemployment: number;
    };
    rates: {
        treasury_10yr: number;
        date: string;
    };
}

export const api = {
    async getHealth(): Promise<boolean> {
        try {
            const res = await fetch(`${API_URL}/health`);
            return res.ok;
        } catch (e) {
            // console.warn('Backend not reachable');
            return false;
        }
    },

    async getMarketIntel(stateFips: string = '12'): Promise<MarketIntel | null> {
        try {
            const res = await fetch(`${API_URL}/market/intel?state_fips=${stateFips}`);
            if (!res.ok) throw new Error('Failed to fetch metrics');
            return await res.json();
        } catch (e) {
            console.error('Error fetching market intel:', e);
            return null;
        }
    },

    async analyzeDeal(deal: any): Promise<string> {
        try {
            const res = await fetch(`${API_URL}/copilot/analyze`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ deal_data: deal, user_notes: "" })
            });
            if (!res.ok) throw new Error('Analysis failed');
            const data = await res.json();
            return data.analysis;
        } catch (e) {
            console.error('Error analyzing deal:', e);
            throw e;
        }
    },

    async getProjections(inputs: any): Promise<any> {
        try {
            const res = await fetch(`${API_URL}/calc/projections`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(inputs)
            });
            if (!res.ok) throw new Error('Projection failed');
            return await res.json();
        } catch (e) {
            console.error('Error getting projections:', e);
            return null;
        }
    },

    async findAndRunCopilot(text: string): Promise<any> {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;

            const res = await fetch(`${API_URL}/copilot/find_and_run`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                },
                body: JSON.stringify({ text })
            });

            if (!res.ok) {
                const errData = await res.json().catch(() => null);
                throw new Error(errData?.detail || 'Copilot search failed');
            }
            return await res.json();
        } catch (e) {
            console.error('Error running copilot:', e);
            throw e;
        }
    },

    async getMortgageSchedule(principal: number, rate: number, years: number): Promise<any> {
        try {
            const res = await fetch(`${API_URL}/calc/mortgage?principal=${principal}&annual_rate=${rate}&amort_years=${years}&months_preview=12`);
            if (!res.ok) throw new Error('Mortgage calc failed');
            return await res.json();
        } catch (e) {
            console.error('Error getting mortgage schedule:', e);
            return null;
        }
    },

    async getInsuranceEstimate(replacementCost: number, assetClass: string, locationRisk: number): Promise<any> {
        try {
            const res = await fetch(`${API_URL}/calc/insurance?replacement_cost=${replacementCost}&asset_class=${assetClass}&location_risk=${locationRisk}`);
            if (!res.ok) throw new Error('Insurance calc failed');
            return await res.json();
        } catch (e) {
            console.error('Error getting insurance estimate:', e);
            return null;
        }
    },

    async getConstructionEstimate(sqft: number, costPerSf: number, contingencyPct: number = 0.10): Promise<any> {
        try {
            const res = await fetch(`${API_URL}/calc/construction?sqft=${sqft}&cost_per_sf=${costPerSf}&contingency_pct=${contingencyPct}`);
            if (!res.ok) throw new Error('Construction calc failed');
            return await res.json();
        } catch (e) {
            console.error('Error getting construction estimate:', e);
            return null;
        }
    },

    async updateDeal(id: string, data: any): Promise<boolean> {
        try {
            const { error } = await supabase.from('deals').update(data).eq('id', id);
            return !error;
        } catch (e) {
            console.error('Error updating deal:', e);
            return false;
        }
    },

    async getLeases(dealId: string): Promise<any[]> {
        const { data, error } = await supabase
            .from('leases')
            .select('*, tenant:tenants(*)')
            .eq('deal_id', dealId);
        if (error) throw error;
        return data || [];
    },

    async getTenants(): Promise<any[]> {
        const { data, error } = await supabase
            .from('tenants')
            .select('*');
        if (error) throw error;
        return data || [];
    }
};
