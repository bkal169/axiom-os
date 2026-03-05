/**
 * useStorage — Axiom OS Phase 1.3
 * Routes file operations to either IndexedDB (local) or Supabase Storage (cloud),
 * based on the user's preference stored in localStorage.
 */

import { useCallback } from "react";

// ─── IndexedDB helpers ────────────────────────────────────────────────────────
const DB_NAME = "axiom-local-storage";
const DB_VERSION = 1;
const STORE_NAME = "files";

function openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        const req = indexedDB.open(DB_NAME, DB_VERSION);
        req.onupgradeneeded = () => req.result.createObjectStore(STORE_NAME, { keyPath: "key" });
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
    });
}

async function idbPut(key: string, value: Blob | string): Promise<void> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, "readwrite");
        tx.objectStore(STORE_NAME).put({ key, value });
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
    });
}

async function idbGet(key: string): Promise<Blob | string | null> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const req = db.transaction(STORE_NAME, "readonly").objectStore(STORE_NAME).get(key);
        req.onsuccess = () => resolve(req.result?.value ?? null);
        req.onerror = () => reject(req.error);
    });
}

async function idbDelete(key: string): Promise<void> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, "readwrite");
        tx.objectStore(STORE_NAME).delete(key);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
    });
}

async function idbList(prefix: string): Promise<string[]> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const req = db.transaction(STORE_NAME, "readonly").objectStore(STORE_NAME).getAllKeys();
        req.onsuccess = () => resolve((req.result as string[]).filter(k => k.startsWith(prefix)));
        req.onerror = () => reject(req.error);
    });
}

// ─── Supabase Storage helpers ─────────────────────────────────────────────────
const SUPABASE_BUCKET = "axiom-files";

async function cloudUpload(path: string, file: File): Promise<string> {
    const { supa } = await import("../lib/supabase");
    if (!supa.storage) throw new Error("Supabase storage not configured");
    const res = await supa.storage.from(SUPABASE_BUCKET).upload(path, file, { upsert: true });
    if (res.error) throw res.error;
    const { data } = supa.storage.from(SUPABASE_BUCKET).getPublicUrl(path);
    return data.publicUrl;
}

async function cloudGet(path: string): Promise<string> {
    const { supa } = await import("../lib/supabase");
    if (!supa.storage) throw new Error("Supabase storage not configured");
    const { data } = supa.storage.from(SUPABASE_BUCKET).getPublicUrl(path);
    return data.publicUrl;
}

async function cloudDelete(path: string): Promise<void> {
    const { supa } = await import("../lib/supabase");
    if (!supa.storage) throw new Error("Supabase storage not configured");
    const res = await supa.storage.from(SUPABASE_BUCKET).remove([path]);
    if (res.error) throw res.error;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export type StorageMode = "local" | "cloud";

export function getStorageMode(): StorageMode {
    return (localStorage.getItem("axiom_storage_mode") as StorageMode) ?? "local";
}

export function setStorageMode(mode: StorageMode) {
    localStorage.setItem("axiom_storage_mode", mode);
}

/** 
 * useStorage — returns upload / download / delete / list helpers 
 * that automatically use the user's selected storage backend.
 */
export function useStorage(userId?: string) {
    const mode = getStorageMode();

    const upload = useCallback(async (file: File, context: string): Promise<string> => {
        const key = `${userId ?? "anon"}/${context}/${file.name}`;
        if (mode === "cloud") {
            return cloudUpload(key, file);
        } else {
            await idbPut(key, file);
            return key; // local key as reference
        }
    }, [mode, userId]);

    const getUrl = useCallback(async (path: string): Promise<string | null> => {
        if (mode === "cloud") {
            try { return await cloudGet(path); } catch { return null; }
        } else {
            const blob = await idbGet(path);
            if (!blob) return null;
            if (blob instanceof Blob) return URL.createObjectURL(blob);
            return null;
        }
    }, [mode]);

    const remove = useCallback(async (path: string): Promise<void> => {
        if (mode === "cloud") {
            await cloudDelete(path);
        } else {
            await idbDelete(path);
        }
    }, [mode]);

    const list = useCallback(async (context: string): Promise<string[]> => {
        const prefix = `${userId ?? "anon"}/${context}/`;
        if (mode === "cloud") {
            const { supa } = await import("../lib/supabase");
            if (!supa.storage) return [];
            const { data, error } = await supa.storage.from(SUPABASE_BUCKET).list(prefix);
            if (error || !data) return [];
            return data.map((f: any) => `${prefix}${f.name}`);
        } else {
            return idbList(prefix);
        }
    }, [mode, userId]);

    return { upload, getUrl, remove, list, mode };
}
