export interface Tenant {
    id: string;
    user_id: string;
    name: string;
    industry?: string;
    credit_rating?: string;
    notes?: string;
    created_at: string;
}

export interface Lease {
    id: string;
    deal_id: string;
    tenant_id: string;
    floor?: string;
    sqft: number;
    annual_rent: number;
    start_date?: string;
    end_date?: string;
    status: 'active' | 'pipeline' | 'expired';
    notes?: string;
    tenant?: Tenant; // Joined
    created_at: string;
}
