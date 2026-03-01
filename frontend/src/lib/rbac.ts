import { supabase } from './supabase';

export type UserRole = 'ADMIN_INTERNAL' | 'CLIENT_SAAS' | 'VIEWER';
export type SubscriptionTier = 'FREE' | 'PRO' | 'PRO_PLUS';

export interface UserProfile {
    id: string;
    role: UserRole;
    subscription_tier: SubscriptionTier;
    org_id?: string;
    stripe_customer_id?: string;
}

export async function fetchUserProfile(userId: string): Promise<UserProfile | null> {
    const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

    if (error) {
        console.error('Error fetching profile:', error);
        return null;
    }
    return data as UserProfile;
}

export function isInternalAdmin(profile: UserProfile | null): boolean {
    return profile?.role === 'ADMIN_INTERNAL';
}

export function isSaaS(profile: UserProfile | null): boolean {
    return profile?.role === 'CLIENT_SAAS';
}

export function currentTier(profile: UserProfile | null): SubscriptionTier {
    return profile?.subscription_tier || 'FREE';
}
