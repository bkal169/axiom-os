export type ContactType = 'investor' | 'lender' | 'client' | 'vendor' | 'lead' | 'broker';
export type ContactStatus = 'active' | 'inactive' | 'prospect';

export interface Contact {
    id: string;
    first_name: string;
    last_name: string;
    email: string | null;
    phone: string | null;
    type: ContactType;
    status: ContactStatus;
    tags: string[];
    notes: string | null;
    min_check_size: number;
    max_check_size: number;
    preferred_geographies: string[];
    max_ltv: number;
    min_loan_size: number;
    max_loan_size: number;
    debt_types: string[];
    organization_id: string;
    created_at: string;
    updated_at: string;
}

export interface Business {
    id: string;
    name: string;
    industry: string;
    website: string | null;
    address: string | null;
    primary_contact_id: string | null;
    created_at: string;
}

export interface DealContact {
    id: string;
    deal_id: string;
    contact_id: string;
    role: string;
    contact?: Contact; // joined
}
