import { createContext, useContext } from 'react';

const SupabaseContext = createContext(null);

export function useSupabase() {
  const ctx = useContext(SupabaseContext);
  if (ctx) return ctx;
  return { supabase: null };
}

export { SupabaseContext };
