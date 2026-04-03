// Axiom OS — Official Supabase JS SDK client
// Uses @supabase/supabase-js for auth state management, RLS, and realtime
// Env vars: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY (set in Vercel)
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim() || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim() || "";

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn(
        "[Axiom] VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY is not set. " +
        "Set these in .env.local or configure in Vercel dashboard."
    );
}

/**
 * Official Supabase JS client — use this for any feature that
 * needs the supabase-js SDK (auth state change listeners, RLS,
 * real-time subscriptions, storage).
 *
 * For legacy REST-only calls, the custom `supa` singleton in
 * v1/lib/supabase.ts is still used by the monolith.
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
