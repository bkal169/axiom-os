import { type SubscriptionTier, type UserProfile } from './rbac';

export const TIERS: Record<SubscriptionTier, number> = {
    FREE: 0,
    PRO: 1,
    PRO_PLUS: 2,
};

export const Gating = {
    canCreateDeal: (profile: UserProfile | null, currentCount: number) => {
        const tier = profile?.subscription_tier || 'FREE';
        if (tier === 'FREE') return currentCount < 3;
        if (tier === 'PRO') return currentCount < 25;
        return true; // PRO_PLUS unlimited
    },

    canUseCalculator: (profile: UserProfile | null, calcKey: 'MORTGAGE' | 'ROI' | 'INSURANCE' | 'DEV_PROFIT') => {
        const tier = TIERS[profile?.subscription_tier || 'FREE'];
        switch (calcKey) {
            case 'MORTGAGE':
            case 'ROI':
                return true; // Everyone
            case 'INSURANCE':
                return tier >= TIERS.PRO;
            case 'DEV_PROFIT':
                return tier >= TIERS.PRO_PLUS;
            default:
                return false;
        }
    },

    canUseDataLayer: (profile: UserProfile | null) => {
        const tier = TIERS[profile?.subscription_tier || 'FREE'];
        return tier >= TIERS.PRO; // Partial access for PRO? Let's say yes. Full for PRO_PLUS.
    },

    canLinkIntel: (profile: UserProfile | null) => {
        const tier = TIERS[profile?.subscription_tier || 'FREE'];
        return tier >= TIERS.PRO_PLUS;
    },

    canExportPDF: (profile: UserProfile | null) => {
        const tier = TIERS[profile?.subscription_tier || 'FREE'];
        return tier >= TIERS.PRO;
    },

    canExportInvestorSummary: (profile: UserProfile | null) => {
        const tier = TIERS[profile?.subscription_tier || 'FREE'];
        return tier >= TIERS.PRO_PLUS;
    }
};
