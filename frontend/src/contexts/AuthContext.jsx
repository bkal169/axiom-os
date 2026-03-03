import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

/**
 * Phase 4 AuthContext — uses the official @supabase/supabase-js SDK.
 * Supports magic-link (OTP) sign-in and session state listening.
 * Exports: session, tenantId, loading, signInWithEmail, signOut
 *
 * NOTE: This coexists with the existing monolith AuthCtx (which uses
 * the custom supa REST client). Phase 4 components use this context;
 * legacy monolith components continue to use useAuth() from AuthCtx.
 */
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [session, setSession] = useState(null);
    const [tenantId, setTenantId] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Initial session load
        supabase.auth.getSession().then(({ data }) => {
            const sess = data.session;
            setSession(sess || null);
            const claims =
                sess?.user?.app_metadata || sess?.user?.user_metadata || {};
            setTenantId(claims.tenant_id || "local-tenant");
            setLoading(false);
        });

        // Reactive session listener — handles OTP confirmations, token refreshes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, sess) => {
            setSession(sess);
            const claims =
                sess?.user?.app_metadata || sess?.user?.user_metadata || {};
            setTenantId(claims.tenant_id || "local-tenant");
        });

        return () => subscription.unsubscribe();
    }, []);

    /**
     * Magic-link sign-in — sends OTP email, no password required.
     * In development or if email SMTP is not configured in Supabase,
     * the link appears in the Supabase dashboard Auth > Logs.
     */
    const signInWithEmail = async (email) => {
        const { error } = await supabase.auth.signInWithOtp({ email });
        if (error) throw error;
    };

    const signOut = async () => {
        await supabase.auth.signOut();
        setSession(null);
        setTenantId(null);
    };

    return (
        <AuthContext.Provider
            value={{ session, tenantId, loading, signInWithEmail, signOut }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
