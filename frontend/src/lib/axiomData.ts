/**
 * Axiom OS — Supabase Data Layer with localStorage Fallback
 * 
 * This module provides CRUD hooks for contacts, deals, and intel.
 * When Supabase is configured (VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY),
 * data syncs to the cloud. Otherwise, it gracefully falls back to localStorage.
 */
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// --- Soft Supabase Client ---
let sb: SupabaseClient | null = null;
const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
if (url && key) {
    try {
        sb = createClient(url, key, {
            auth: {
                persistSession: true,
                autoRefreshToken: true,
                detectSessionInUrl: true,
                lock: (async (_name: any, acquireOrTimeout: any, maybeAcquire?: any) => {
                    const acquire = typeof acquireOrTimeout === 'function' ? acquireOrTimeout : maybeAcquire;
                    if (typeof acquire === 'function') return await acquire();
                }) as any
            }
        });
        console.log('[Axiom] Supabase connected');
    } catch (e) {
        console.warn('[Axiom] Supabase init failed, using localStorage:', e);
        sb = null;
    }
} else {
    console.log('[Axiom] Supabase not configured — using localStorage fallback');
}

export const supabaseClient = sb;
export const isSupabaseConnected = (): boolean => sb !== null;

// --- Generic CRUD Helpers ---
type Row = Record<string, any>;

function lsGet<T>(key: string, fallback: T): T {
    try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : fallback;
    } catch { return fallback; }
}
function lsSet<T>(key: string, data: T): void {
    localStorage.setItem(key, JSON.stringify(data));
}

// --- Contacts ---
const CONTACTS_KEY = 'axiom_contacts';
const CONTACTS_TABLE = 'contacts';

export async function fetchContacts(): Promise<Row[]> {
    if (sb) {
        const { data, error } = await sb.from(CONTACTS_TABLE).select('*').order('created_at', { ascending: false });
        if (!error && data) { lsSet(CONTACTS_KEY, data); return data; }
        console.warn('[Axiom] Supabase contacts fetch failed, using cache:', error?.message);
    }
    return lsGet(CONTACTS_KEY, []);
}

export async function upsertContact(contact: Row): Promise<Row | null> {
    if (sb) {
        const { data, error } = await sb.from(CONTACTS_TABLE).upsert(contact).select().single();
        if (!error && data) return data;
        console.warn('[Axiom] Supabase contact upsert failed:', error?.message);
    }
    // localStorage fallback
    const all = lsGet<Row[]>(CONTACTS_KEY, []);
    const idx = all.findIndex(c => c.id === contact.id);
    if (idx >= 0) all[idx] = { ...all[idx], ...contact };
    else all.unshift({ ...contact, id: contact.id || Date.now() });
    lsSet(CONTACTS_KEY, all);
    return contact;
}

export async function deleteContact(id: string | number): Promise<boolean> {
    if (sb) {
        const { error } = await sb.from(CONTACTS_TABLE).delete().eq('id', id);
        if (!error) return true;
        console.warn('[Axiom] Supabase contact delete failed:', error?.message);
    }
    const all = lsGet<Row[]>(CONTACTS_KEY, []);
    lsSet(CONTACTS_KEY, all.filter(c => c.id !== id));
    return true;
}

// --- Deals ---
const DEALS_KEY = 'axiom_deals';
const DEALS_TABLE = 'deals';

export async function fetchDeals(): Promise<Row[]> {
    if (sb) {
        const { data, error } = await sb.from(DEALS_TABLE).select('*').order('updated', { ascending: false });
        if (!error && data) { lsSet(DEALS_KEY, data); return data; }
        console.warn('[Axiom] Supabase deals fetch failed, using cache:', error?.message);
    }
    return lsGet(DEALS_KEY, []);
}

export async function upsertDeal(deal: Row): Promise<Row | null> {
    if (sb) {
        const { data, error } = await sb.from(DEALS_TABLE).upsert(deal).select().single();
        if (!error && data) return data;
        console.warn('[Axiom] Supabase deal upsert failed:', error?.message);
    }
    const all = lsGet<Row[]>(DEALS_KEY, []);
    const idx = all.findIndex(d => d.id === deal.id);
    if (idx >= 0) all[idx] = { ...all[idx], ...deal };
    else all.unshift({ ...deal, id: deal.id || Date.now() });
    lsSet(DEALS_KEY, all);
    return deal;
}

export async function deleteDeal(id: string | number): Promise<boolean> {
    if (sb) {
        const { error } = await sb.from(DEALS_TABLE).delete().eq('id', id);
        if (!error) return true;
        console.warn('[Axiom] Supabase deal delete failed:', error?.message);
    }
    const all = lsGet<Row[]>(DEALS_KEY, []);
    lsSet(DEALS_KEY, all.filter(d => d.id !== id));
    return true;
}

// --- Intel Records ---
const INTEL_KEY = 'axiom_intel';
const INTEL_TABLE = 'intel_records';

export async function fetchIntel(): Promise<Row[]> {
    if (sb) {
        const { data, error } = await sb.from(INTEL_TABLE).select('*').order('date', { ascending: false });
        if (!error && data) { lsSet(INTEL_KEY, data); return data; }
        console.warn('[Axiom] Supabase intel fetch failed, using cache:', error?.message);
    }
    return lsGet(INTEL_KEY, []);
}

export async function upsertIntel(record: Row): Promise<Row | null> {
    if (sb) {
        const { data, error } = await sb.from(INTEL_TABLE).upsert(record).select().single();
        if (!error && data) return data;
        console.warn('[Axiom] Supabase intel upsert failed:', error?.message);
    }
    const all = lsGet<Row[]>(INTEL_KEY, []);
    const idx = all.findIndex(r => r.id === record.id);
    if (idx >= 0) all[idx] = { ...all[idx], ...record };
    else all.unshift({ ...record, id: record.id || Date.now() });
    lsSet(INTEL_KEY, all);
    return record;
}

export async function deleteIntel(id: string | number): Promise<boolean> {
    if (sb) {
        const { error } = await sb.from(INTEL_TABLE).delete().eq('id', id);
        if (!error) return true;
        console.warn('[Axiom] Supabase intel delete failed:', error?.message);
    }
    const all = lsGet<Row[]>(INTEL_KEY, []);
    lsSet(INTEL_KEY, all.filter(r => r.id !== id));
    return true;
}

// --- Auth Helpers ---
export async function signIn(email: string, password: string) {
    if (!sb) return { error: { message: 'Supabase not configured' } };
    return sb.auth.signInWithPassword({ email, password });
}

export async function signUp(email: string, password: string) {
    if (!sb) return { error: { message: 'Supabase not configured' } };
    return sb.auth.signUp({ email, password });
}

export async function signOut() {
    if (!sb) return;
    return sb.auth.signOut();
}

export async function getUser() {
    if (!sb) return null;
    const { data } = await sb.auth.getUser();
    return data?.user || null;
}

// --- Connection Status ---
export async function testConnection(): Promise<{ connected: boolean; tables: string[] }> {
    if (!sb) return { connected: false, tables: [] };
    try {
        const tables: string[] = [];
        for (const t of [CONTACTS_TABLE, DEALS_TABLE, INTEL_TABLE]) {
            const { error } = await sb.from(t).select('id').limit(1);
            if (!error) tables.push(t);
        }
        return { connected: true, tables };
    } catch {
        return { connected: false, tables: [] };
    }
}
