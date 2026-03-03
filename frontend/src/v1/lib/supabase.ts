/**
 * Supabase Client Wrapper for Axiom OS
 */

// Production: reads VITE_ env vars baked by Vercel at build time
const getLocalString = (key: string) => {
    try {
        const val = localStorage.getItem(key);
        if (!val) return "";
        try { return JSON.parse(val); } catch { return val; }
    } catch { return ""; }
};

export const SUPA_URL =
    (typeof import.meta !== "undefined" && import.meta.env?.VITE_SUPABASE_URL) || getLocalString("axiom_supa_url");

export const SUPA_KEY =
    (typeof import.meta !== "undefined" && import.meta.env?.VITE_SUPABASE_ANON_KEY) || getLocalString("axiom_supa_key");

if (!SUPA_URL || !SUPA_KEY) {
    console.warn(
        "[Axiom] VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY is not set. " +
        "Set these in .env.local for development or configure them in Vercel."
    );
}

export const IS_PROD_CONFIGURED = !!(SUPA_URL && SUPA_KEY);

class SupabaseClient {
    url: string = SUPA_URL;
    key: string = SUPA_KEY;
    token: string | null = null;

    constructor() {
        if (this.url && this.key) {
            const savedToken = localStorage.getItem("axiom_supa_token");
            if (savedToken) this.token = savedToken;
        }
    }

    configured() {
        return !!(this.url && this.key);
    }

    headers() {
        const h: Record<string, string> = {
            "Content-Type": "application/json",
            apikey: this.key,
            Prefer: "return=representation",
        };
        if (this.token) h["Authorization"] = `Bearer ${this.token}`;
        return h;
    }

    async auth(email: string, password?: string, isSignUp = false) {
        const endpoint = isSignUp ? "signup" : "token?grant_type=password";
        const r = await fetch(`${this.url}/auth/v1/${endpoint}`, {
            method: "POST",
            headers: { "Content-Type": "application/json", apikey: this.key },
            body: JSON.stringify({ email, password }),
        });
        const data = await r.json();
        if (!r.ok)
            throw new Error(
                data.error_description || data.msg || data.message || "Auth failed"
            );
        this.token = data.access_token;
        localStorage.setItem("axiom_supa_token", data.access_token);
        localStorage.setItem("axiom_supa_refresh", data.refresh_token || "");
        return data;
    }

    async refreshSession() {
        const rt = localStorage.getItem("axiom_supa_refresh");
        if (!rt) return null;
        try {
            const r = await fetch(`${this.url}/auth/v1/token?grant_type=refresh_token`, {
                method: "POST",
                headers: { "Content-Type": "application/json", apikey: this.key },
                body: JSON.stringify({ refresh_token: rt }),
            });
            if (!r.ok) throw new Error("Refresh failed");
            const data = await r.json();
            this.token = data.access_token;
            localStorage.setItem("axiom_supa_token", data.access_token);
            localStorage.setItem("axiom_supa_refresh", data.refresh_token || "");
            return data;
        } catch {
            this.token = null;
            return null;
        }
    }

    async getUser() {
        if (!this.token) return null;
        const r = await fetch(`${this.url}/auth/v1/user`, { headers: this.headers() });
        if (!r.ok) return null;
        return r.json();
    }

    async logout() {
        if (this.token)
            await fetch(`${this.url}/auth/v1/logout`, {
                method: "POST",
                headers: this.headers(),
            }).catch(() => { });
        this.token = null;
        localStorage.removeItem("axiom_supa_token");
        localStorage.removeItem("axiom_supa_refresh");
    }

    async select(table: string, query = "") {
        const r = await fetch(`${this.url}/rest/v1/${table}?${query}`, {
            headers: this.headers(),
        });
        if (!r.ok) {
            console.warn(`Supabase select ${table} failed:`, r.status);
            return [];
        }
        return r.json();
    }

    async upsert(table: string, data: any) {
        const r = await fetch(`${this.url}/rest/v1/${table}`, {
            method: "POST",
            headers: {
                ...this.headers(),
                Prefer: "return=representation,resolution=merge-duplicates",
            },
            body: JSON.stringify(data),
        });
        if (!r.ok)
            console.warn(
                `Supabase upsert ${table} failed:`,
                r.status,
                await r.text().catch(() => "")
            );
        return r.ok;
    }

    async update(table: string, match: Record<string, any>, data: any) {
        const params = Object.entries(match)
            .map(([k, v]) => `${k}=eq.${v}`)
            .join("&");
        const r = await fetch(`${this.url}/rest/v1/${table}?${params}`, {
            method: "PATCH",
            headers: this.headers(),
            body: JSON.stringify(data),
        });
        return r.ok;
    }

    async del(table: string, match: Record<string, any>) {
        const params = Object.entries(match)
            .map(([k, v]) => `${k}=eq.${v}`)
            .join("&");
        const r = await fetch(`${this.url}/rest/v1/${table}?${params}`, {
            method: "DELETE",
            headers: this.headers(),
        });
        return r.ok;
    }

    async rpc(fn: string, args = {}) {
        const r = await fetch(`${this.url}/rest/v1/rpc/${fn}`, {
            method: "POST",
            headers: this.headers(),
            body: JSON.stringify(args),
        });
        return r.json();
    }

    async insert(table: string, data: any) {
        const r = await fetch(`${this.url}/rest/v1/${table}`, {
            method: "POST",
            headers: { ...this.headers(), Prefer: "return=representation" },
            body: JSON.stringify(data),
        });
        if (!r.ok) {
            console.warn(`Supabase insert ${table} failed:`, r.status);
            return null;
        }
        const rows = await r.json();
        return Array.isArray(rows) ? rows[0] : rows;
    }

    async callEdge(fnName: string, body: any) {
        const r = await fetch(`${this.url}/functions/v1/${fnName}`, {
            method: "POST",
            headers: {
                ...this.headers(),
            },
            body: JSON.stringify(body),
        });
        return r.json();
    }
}

export const supa = new SupabaseClient();
