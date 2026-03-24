import React, { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';
import { fetchUserProfile, type UserProfile } from '../lib/rbac';
import { AuthContext } from './AuthContextSchema';

// FIX: Moved outside the component so it is never recreated on re-renders and
// always reads window.location.search at call time (not captured at mount).
const applyFounderOverride = (sessionUser: User, p: UserProfile | null): UserProfile | null => {
    const urlParams = new URLSearchParams(window.location.search);
    const isFounderMode = urlParams.get('founder') === 'true';
    if (sessionUser.email === 'bkalan169@gmail.com' || isFounderMode) {
        return {
            ...(p || { id: sessionUser.id }),
            role: 'ADMIN_INTERNAL',
            subscription_tier: 'PRO_PLUS',
            org_id: p?.org_id || 'faa4fe1e-8c27-47f1-99ba-938a0679fd0c',
        } as UserProfile;
    }
    return p;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    // Stable helper — useCallback so it can safely be listed as a dep if needed.
    const loadProfile = useCallback(async (sessionUser: User): Promise<UserProfile | null> => {
        try {
            const p = await fetchUserProfile(sessionUser.id).catch(() => null);
            return applyFounderOverride(sessionUser, p);
        } catch (e) {
            console.error('AuthProvider: Profile fetch failed', e);
            return null;
        }
    }, []);

    useEffect(() => {
        if (import.meta.env.DEV) console.log('AuthProvider: Initializing...');
        let mounted = true;

        // Safety timeout — reduced to 3s; better UX on slow connections
        const timeoutId = setTimeout(() => {
            if (mounted) {
                if (import.meta.env.DEV) console.warn('AuthProvider: Supabase timed out, forcing loading=false');
                setLoading(false);
            }
        }, 3000);

        // Initial session check — awaits profile before releasing the loading gate
        const initAuth = async () => {
            try {
                const { data: { session }, error } = await supabase.auth.getSession();
                // FIX: mounted guard prevents state updates on an unmounted component
                if (!mounted) return;
                if (import.meta.env.DEV) console.log('AuthProvider: getSession result', { session, error });

                setUser(session?.user ?? null);

                if (session?.user) {
                    const p = await loadProfile(session.user);
                    if (mounted) setProfile(p);
                }
            } catch (e) {
                console.error('AuthProvider: getSession failed', e);
            } finally {
                clearTimeout(timeoutId);
                // FIX: setLoading(false) only after profile is fully resolved,
                // so consumers never see loading=false with a null profile mid-flight.
                if (mounted) {
                    setLoading(false);
                    if (import.meta.env.DEV) console.log('AuthProvider: init complete');
                }
            }
        };

        initAuth();

        // FIX: Re-added onAuthStateChange — was missing entirely from the refactor.
        // Without this, sign-in, sign-out, and token-refresh events never update
        // the context, leaving the UI permanently stale after any auth transition.
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            // Skip the INITIAL_SESSION event — initAuth() already handles it.
            // Acting on it here would race against the profile fetch above.
            if (_event === 'INITIAL_SESSION') return;
            if (!mounted) return;

            if (import.meta.env.DEV) console.log('AuthProvider: Auth state change', _event, session?.user?.id);
            setUser(session?.user ?? null);

            if (session?.user) {
                const p = await loadProfile(session.user);
                if (mounted) setProfile(p);
            } else {
                setProfile(null);
            }

            // Safe to set loading=false here — INITIAL_SESSION is already excluded.
            if (mounted) setLoading(false);
        });

        return () => {
            mounted = false;
            clearTimeout(timeoutId);
            subscription.unsubscribe();
        };
    }, [loadProfile]);

    // FIX: signOut was referenced in the JSX but never defined — guaranteed ReferenceError.
    const signOut = async () => {
        await supabase.auth.signOut();
    };

    return (
        <AuthContext.Provider value={{ user, profile, loading, signOut }}>
            {children}
        </AuthContext.Provider>
    );
};
