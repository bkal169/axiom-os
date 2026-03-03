import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { supa } from "../lib/supabase";

// ─── AUTH CONTEXT ─────────────────────────────────
interface AuthContextType {
    user: any;
    userProfile: any;
    activeProjectId: string | null;
    authLoading: boolean;
    login: (email: string, pw?: string) => Promise<any>;
    signup: (email: string, pw: string) => Promise<any>;
    logout: () => Promise<void>;
    setActiveProjectId: (id: string | null) => void;
}

const AuthCtx = createContext<AuthContextType | null>(null);
export const useAuth = () => useContext(AuthCtx);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<any>(null);
    const [userProfile, setUserProfile] = useState<any>(null);
    const [authLoading, setAuthLoading] = useState(true);

    // Use localStorage directly here to avoid circular dependencies with useLS
    const [activeProjectId, _setActiveProjectId] = useState<string | null>(() => {
        try { return JSON.parse(localStorage.getItem("axiom_active_project_id") || "null"); } catch { return null; }
    });

    const setActiveProjectId = (id: string | null) => {
        _setActiveProjectId(id);
        localStorage.setItem("axiom_active_project_id", JSON.stringify(id));
    };

    useEffect(() => {
        if (!supa.configured()) { setAuthLoading(false); return; }
        (async () => {
            try {
                if (supa.token) {
                    const u = await supa.getUser();
                    if (u && u.id) { setUser(u); } else {
                        const refreshed = await supa.refreshSession();
                        if (refreshed) { const u2 = await supa.getUser(); if (u2 && u2.id) setUser(u2); }
                    }
                } else {
                    const refreshed = await supa.refreshSession();
                    if (refreshed) { const u = await supa.getUser(); if (u && u.id) setUser(u); }
                }
            } catch (e) { console.warn("Session restore failed:", e); }
            setAuthLoading(false);
        })();
    }, []);

    useEffect(() => {
        if (!user || !supa.configured()) return;
        const interval = setInterval(async () => {
            try {
                const refreshed = await supa.refreshSession();
                if (refreshed) {
                    const u = await supa.getUser();
                    if (u && u.id) setUser(u);
                }
            } catch (e) { console.warn("Token refresh failed:", e); }
        }, 45 * 60 * 1000);
        return () => clearInterval(interval);
    }, [user]);

    useEffect(() => {
        if (!user || !supa.configured()) return;
        (async () => {
            const profiles = await supa.select("user_profiles", `id=eq.${user.id}&select=*`);
            if (profiles.length > 0) setUserProfile(profiles[0]);
        })();
    }, [user]);

    const login = async (email: string, pw?: string) => {
        const data = await supa.auth(email, pw);
        const u = await supa.getUser();
        setUser(u);
        if (u && u.id) {
            supa.callEdge("security-log-event", {
                user_id: u.id,
                event_type: "LOGIN",
                metadata: { email, source: "AppV1" }
            }).catch(e => console.warn("Failed to log security event", e));
        }
        return data;
    };

    const signup = async (email: string, pw: string) => {
        const res = await supa.auth(email, pw, true);
        const u = await supa.getUser();
        if (u && u.id) {
            supa.callEdge("security-log-event", {
                user_id: u.id,
                event_type: "SIGNUP",
                metadata: { email, source: "AppV1" }
            }).catch(e => console.warn("Failed to log security event", e));
        }
        return res;
    };

    const logout = async () => {
        if (user && user.id) {
            await supa.callEdge("security-log-event", {
                user_id: user.id,
                event_type: "LOGOUT",
                metadata: { source: "AppV1" }
            }).catch(e => console.warn("Failed to log security event", e));
        }
        await supa.logout();
        setUser(null);
        setUserProfile(null);
    };

    const value = { user, userProfile, activeProjectId, setActiveProjectId, authLoading, login, signup, logout };
    return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

// ─── TIER CONTEXT ─────────────────────────────────
const TIER_CONFIG: Record<string, any> = {
    free: { level: 0, dealLimit: 5, aiDailyLimit: 3, teamLimit: 1, features: { basic_calcs: true, pipeline: true, contacts: true, market_data: true, exports: false, ai_agents: false, mls: false, team: false, api_access: false } },
    pro: { level: 1, dealLimit: 50, aiDailyLimit: 25, teamLimit: 1, features: { basic_calcs: true, pipeline: true, contacts: true, market_data: true, exports: true, ai_agents: true, mls: true, team: false, api_access: false } },
    pro_plus: { level: 2, dealLimit: 999, aiDailyLimit: 999, teamLimit: 5, features: { basic_calcs: true, pipeline: true, contacts: true, market_data: true, exports: true, ai_agents: true, mls: true, team: true, api_access: true } },
    enterprise: { level: 3, dealLimit: 999, aiDailyLimit: 999, teamLimit: 999, features: { basic_calcs: true, pipeline: true, contacts: true, market_data: true, exports: true, ai_agents: true, mls: true, team: true, api_access: true } },
};
const TIER_NAMES: Record<string, string> = { free: "Free", pro: "Pro", pro_plus: "Pro+", enterprise: "Enterprise" };
// TIER_PRICES is not used in V1 yet
const TIER_PRICE_IDS: Record<string, string> = {
    pro: (typeof import.meta !== "undefined" && import.meta.env?.VITE_STRIPE_PRO_PRICE_ID) || "price_PRO_REPLACE_ME",
    pro_plus: (typeof import.meta !== "undefined" && import.meta.env?.VITE_STRIPE_PRO_PLUS_PRICE_ID) || "price_PRO_PLUS_REPLACE_ME",
    enterprise: (typeof import.meta !== "undefined" && import.meta.env?.VITE_STRIPE_ENTERPRISE_PRICE_ID) || "price_ENTERPRISE_REPLACE_ME",
};

interface TierContextType {
    tier: string;
    tierName: string;
    config: any;
    canUse: (feature: string) => boolean;
    tierFor: (feature: string) => string;
    dealLimit: number;
    aiDailyLimit: number;
    teamLimit: number;
    startCheckout: (planId: string) => Promise<void>;
    openPortal: () => Promise<void>;
}

const TierCtx = createContext<TierContextType>({
    tier: "free", tierName: "Free", config: TIER_CONFIG.free, canUse: () => false, tierFor: () => "enterprise",
    dealLimit: 5, aiDailyLimit: 0, teamLimit: 1, startCheckout: async () => { }, openPortal: async () => { }
});
export const useTier = () => useContext(TierCtx);

export function TierProvider({ children }: { children: React.ReactNode }) {
    const auth = useAuth();
    const tier = (auth?.userProfile?.subscription_tier || "free").toLowerCase();
    const config = TIER_CONFIG[tier] || TIER_CONFIG.free;

    const canUse = useCallback((feature: string) => !!config.features[feature], [config]);

    const tierFor = useCallback((feature: string) => {
        for (const [t, c] of Object.entries(TIER_CONFIG)) { if (c.features[feature]) return t; }
        return "enterprise";
    }, []);

    const startCheckout = useCallback(async (planId: string) => {
        if (!supa.configured() || !supa.token || !auth?.user) {
            alert(`Stripe Checkout Simulation: User clicked upgrade to ${planId}.\n\n(Configure Supabase and Stripe to enable real billing flows)`);
            return;
        }
        try {
            const r = await fetch(`${supa.url}/functions/v1/stripe-checkout`, {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${supa.token}`, apikey: supa.key },
                body: JSON.stringify({ action: "create_checkout", price_id: TIER_PRICE_IDS[planId], success_url: window.location.origin + "?billing=success", cancel_url: window.location.origin + "?billing=cancel", user_id: auth.user.id }),
            });
            const data = await r.json();
            if (data.url) window.location.href = data.url;
            else alert("Checkout initialization failed: " + JSON.stringify(data));
        } catch (e: any) { alert("Checkout failed: " + e.message); }
    }, [auth?.user]);

    const openPortal = useCallback(async () => {
        if (!supa.configured() || !supa.token || !auth?.user) {
            alert("Billing Portal Simulation: User clicked open portal.\n\n(Configure Supabase and Stripe to enable real billing flows)");
            return;
        }
        try {
            const r = await fetch(`${supa.url}/functions/v1/stripe-checkout`, {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${supa.token}`, apikey: supa.key },
                body: JSON.stringify({ action: "create_portal", user_id: auth.user.id, return_url: window.location.origin }),
            });
            const data = await r.json();
            if (data.url) window.location.href = data.url;
            else alert("Portal initialization failed: " + JSON.stringify(data));
        } catch (e: any) { alert("Portal failed: " + e.message); }
    }, [auth?.user]);

    const value = { tier, tierName: TIER_NAMES[tier] || "Free", config, canUse, tierFor, dealLimit: config.dealLimit, aiDailyLimit: config.aiDailyLimit, teamLimit: config.teamLimit, startCheckout, openPortal };
    return <TierCtx.Provider value={value}>{children}</TierCtx.Provider>;
}
