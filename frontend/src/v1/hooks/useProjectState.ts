/**
 * useProjectState — v1/hooks local shim
 *
 * Persists project data to localStorage under a per-project key.
 * When axiom_storage_mode === "remote" it also syncs to the
 * /api/projects edge function (requires a valid Supabase session).
 */
import { useState, useEffect, useCallback, useRef } from "react";
import { useLS } from "./useLS";

const MODE_KEY = "axiom_storage_mode";   // "local" | "remote"
const TOKEN_KEY = "axiom_supa_token";

function getToken() { return localStorage.getItem(TOKEN_KEY) || ""; }
function getMode() { return localStorage.getItem(MODE_KEY) || "local"; }

async function authFetch(url: string, opts: RequestInit = {}) {
    const token = getToken();
    const res = await fetch(url, {
        ...opts,
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...(opts.headers || {}),
        },
    });
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    return res.json();
}

export function useProjectState(projectId = "default") {
    const lsKey = `axiom_project_${projectId}`;
    const [project, setProjectLS] = useLS<Record<string, any>>(lsKey, {});
    const [syncError, setSyncError] = useState<string | null>(null);
    const syncTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const mode = getMode();

    // ── Load from remote once on mount (remote mode only) ────────────────
    useEffect(() => {
        if (mode !== "remote") return;
        (async () => {
            try {
                const remote = await authFetch(`/api/projects/${projectId}`);
                if (remote?.updatedAt && remote.updatedAt > (project.updatedAt || 0)) {
                    setProjectLS(remote);
                }
            } catch {
                // Remote unavailable — silently fall back to local data
            }
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [projectId]);

    // ── Debounced remote sync ─────────────────────────────────────────────
    const syncToRemote = useCallback((next: Record<string, any>) => {
        if (mode !== "remote") return;
        if (syncTimer.current) clearTimeout(syncTimer.current);
        syncTimer.current = setTimeout(async () => {
            try {
                setSyncError(null);
                await authFetch(`/api/projects/${projectId}`, {
                    method: "PATCH",
                    body: JSON.stringify({ data: next, updatedAt: Date.now() }),
                });
            } catch {
                setSyncError("Save failed — changes stored locally.");
            }
        }, 1500);
    }, [mode, projectId]);

    // ── updateProject — merge patch, persist local, optionally sync ───────
    const updateProject = useCallback((patch: Record<string, any>) => {
        setProjectLS((prev: Record<string, any>) => {
            const next = { ...prev, ...patch, updatedAt: Date.now() };
            syncToRemote(next);
            return next;
        });
    }, [setProjectLS, syncToRemote]);

    return { project, updateProject, syncError };
}
