import { createContext } from 'react';
import type { User } from '@supabase/supabase-js';
import type { UserProfile } from '../lib/rbac';

export interface AuthContextType {
    user: User | null;
    profile: UserProfile | null;
    loading: boolean;
    signOut: () => Promise<void>;
}

// FIX: Use null (not a default object) so that useAuth.ts can detect when a
// consumer is rendered outside <AuthProvider> and throw a meaningful error.
// createContext(defaultObject) never returns undefined, making the
// `context === undefined` guard in useAuth dead code.
export const AuthContext = createContext<AuthContextType | null>(null);
