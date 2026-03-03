import React, { useEffect, useState } from "react";

const C = {
    green: "#10b981",
    amber: "#f59e0b",
    red: "#ef4444",
    dim: "#6b7280",
};

/**
 * SecurityStatusBadge — fetches tenant security status and shows a
 * colour-coded badge (Secure / Degraded / Incident).
 * Calls /api/security/status which is served by the security Edge Function.
 */
export function SecurityStatusBadge({ tenantId }) {
    const [status, setStatus] = useState("loading");

    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                const res = await fetch(`/api/security/status?tenant_id=${tenantId}`);
                if (!res.ok) throw new Error("status error");
                const json = await res.json();
                if (mounted) setStatus(json.status || "ok");
            } catch {
                if (mounted) setStatus("degraded");
            }
        })();
        return () => { mounted = false; };
    }, [tenantId]);

    let color = C.green;
    let label = "Secure";
    if (status === "degraded") { color = C.amber; label = "Degraded"; }
    else if (status === "incident") { color = C.red; label = "Incident"; }

    return (
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "2px 8px", borderRadius: 999, border: `1px solid ${color}44`, fontSize: 10, letterSpacing: 1, textTransform: "uppercase", color }}>
            <span style={{ width: 6, height: 6, borderRadius: 999, background: color }} />
            <span>{label}</span>
        </span>
    );
}
