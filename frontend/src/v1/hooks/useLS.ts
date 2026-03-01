import { useState, useEffect } from "react";

export function useLS<T>(key: string, init: T | (() => T)): [T, React.Dispatch<React.SetStateAction<T>>] {
    const [val, set] = useState<T>(() => {
        try {
            const s = localStorage.getItem(key);
            return s ? JSON.parse(s) : (typeof init === "function" ? (init as Function)() : init);
        } catch {
            return typeof init === "function" ? (init as Function)() : init;
        }
    });

    useEffect(() => {
        try {
            localStorage.setItem(key, JSON.stringify(val));
        } catch (e) {
            console.warn("localStorage setting failed", e);
        }
    }, [key, val]);

    return [val, set];
}
