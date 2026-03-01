export type DealStage = 'sourcing' | 'screening' | 'due_diligence' | 'committee' | 'closing' | 'asset_mgmt' | 'dead' | 'sold';

export interface Deal {
    id: string;
    user_id: string;
    project_name: string;
    location: string;
    asset_type: string;
    stage: DealStage;
    internal_only: boolean;

    acquisition_price: number;
    renovation_cost: number;
    projected_value: number;
    capital_required: number;
    capital_raised: number;
    projected_profit?: number; // Computed

    tags: string[];
    image_urls: string[];
    notes?: string;

    created_at: string;
    updated_at: string;
}

export const STAGE_LABELS: Record<DealStage, string> = {
    sourcing: 'Sourcing',
    screening: 'Screening',
    due_diligence: 'Due Diligence',
    committee: 'Committee',
    closing: 'Closing',
    asset_mgmt: 'Asset Mgmt',
    dead: 'Dead',
    sold: 'Sold',
};
