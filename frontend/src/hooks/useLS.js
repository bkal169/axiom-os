import { useEffect, useState } from "react";

/**
 * useLS — localStorage-backed useState hook.
 * Standalone module version for Phase 4 modular components.
 * Identical logic to the useLS defined in the monolith; extracted
 * here so Phase 4 modules don't need to import from the monolith.
 *
 * @param {string} key - localStorage key
 * @param {any} init - initial/default value (or a factory function)
 * @returns {[value, setter]} — same API as useState
 */
export function useLS(key, init) {
    const [val, set] = useState(() => {
        try {
            const s = localStorage.getItem(key);
            if (s) return JSON.parse(s);
        } catch { }
        return typeof init === "function" ? init() : init;
    });

    useEffect(() => {
        try {
            localStorage.setItem(key, JSON.stringify(val));
        } catch { }
    }, [key, val]);

    return [val, set];
}
