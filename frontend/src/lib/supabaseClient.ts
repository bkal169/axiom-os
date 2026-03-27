// Axiom OS — Official Supabase JS SDK client
// Uses @supabase/supabase-js for auth state management, RLS, and realtime
// Env vars: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY (set in Vercel)
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = (
    import.meta.env.VITE_SUPABASE_URL ||
    "https://ubdhpacoqmlxudcvhyuu.supabase.co"
).trim();

const supabaseAnonKey = (
    import.meta.env.VITE_SUPABASE_ANON_KEY ||
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InViZGhwYWNvcW1seHVkY3ZoeXV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE0NjAzNDIsImV4cCI6MjA4NzAzNjM0Mn0.2qZBBWis2GUarglN6Lv2OuHpkfdQTkV25m20p3bjOwQ"
).trim();

/**
 * Official Supabase JS client — use this for any feature that
 * needs the supabase-js SDK (auth state change listeners, RLS,
 * real-time subscriptions, storage).
 *
 * For legacy REST-only calls, the custom `supa` singleton in
 * v1/lib/supabase.ts is still used by the monolith.
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
