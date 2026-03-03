import { useEffect, useState, useCallback } from "react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../contexts/AuthContext";
import { useLS } from "./useLS";

/**
 * useProjectState — dual-mode (local / remote) project state hook.
 *
 * Mode is driven by "axiom_mode" in localStorage:
 *   "local"  → persists to localStorage only (zero config, offline-first)
 *   "remote" → loads from Supabase `projects` table, upserts on every update
 *
 * Falls back gracefully — if Supabase is unavailable, reads localState.
 * Great for: financial engine, deal data, site inputs — any structured
 * state that should sync across devices when Remote Mode is enabled.
 *
 * @param {string} projectId - Unique project identifier
 * @returns {{ project, updateProject, loading, mode }}
 */
export function useProjectState(projectId) {
    const { session, tenantId } = useAuth();
    const [mode] = useLS("axiom_mode", "local"); // "local" | "remote"
    const [localState, setLocalState] = useLS(
        `axiom_project_${projectId}`,
        () => ({ name: "Untitled Project", state: {} })
    );
    const [remoteState, setRemoteState] = useState(null);
    const [loading, setLoading] = useState(mode === "remote");

    // Load remote state when in remote mode and session is available
    useEffect(() => {
        if (mode !== "remote" || !session || !tenantId) {
            setLoading(false);
            return;
        }

        let cancelled = false;

        (async () => {
            setLoading(true);
            const { data, error } = await supabase
                .from("projects")
                .select("id,name,state")
                .eq("id", projectId)
                .single();

            if (!cancelled) {
                if (error || !data) {
                    console.warn("Supabase load failed, using local fallback:", error);
                    setRemoteState(null);
                } else {
                    setRemoteState(data);
                }
                setLoading(false);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [mode, projectId, session, tenantId]);

    /**
     * updateProject — accepts a new state object or an updater function (like useState).
     * In remote mode: immediately updates remoteState and fires a Supabase upsert.
     * In local mode: writes to localStorage via setLocalState.
     */
    const updateProject = useCallback(
        async (updater) => {
            if (mode === "remote" && session && tenantId) {
                setRemoteState((prev) => {
                    const base = prev || localState;
                    const next =
                        typeof updater === "function" ? updater(base) : updater;

                    // Fire-and-forget upsert with error logging
                    supabase
                        .from("projects")
                        .upsert({
                            id: projectId,
                            tenant_id: tenantId,
                            owner_id: session.user.id,
                            name: next.name || "Untitled",
                            state: next.state || {},
                            updated_at: new Date().toISOString(),
                        })
                        .then(({ error }) => {
                            if (error) console.error("Supabase upsert failed:", error);
                        });

                    return next;
                });
            } else {
                // Local-first mode
                setLocalState((prev) =>
                    typeof updater === "function" ? updater(prev) : updater
                );
            }
        },
        [mode, projectId, session, tenantId, setLocalState, localState]
    );

    // Effective state = remote if available, otherwise fall back to local
    const effective =
        mode === "remote" ? remoteState || localState : localState;

    return { project: effective, updateProject, loading, mode };
}
