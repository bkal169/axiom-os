import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim();
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();

// FIX: Throw early with a clear message instead of passing empty strings to
// createClient(), which silently succeeds but causes all requests to fail with
// cryptic network/auth errors that are hard to trace back to config.
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    '[Supabase] Missing environment variables.\n' +
    `  VITE_SUPABASE_URL: ${supabaseUrl ? '✓' : '✗ not set'}\n` +
    `  VITE_SUPABASE_ANON_KEY: ${supabaseAnonKey ? '✓' : '✗ not set'}\n` +
    'Ensure your .env file exists and the dev server was restarted after changes.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    // Provide a no-op lock function to bypass Navigator LockManager timeouts in some dev environments
    lock: (async (_name: any, acquireOrTimeout: any, maybeAcquire?: any) => {
      const acquire = typeof acquireOrTimeout === 'function' ? acquireOrTimeout : maybeAcquire;
      if (typeof acquire === 'function') return await acquire();
    }) as any
  }
});
