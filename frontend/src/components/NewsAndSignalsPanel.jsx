import React, { useEffect, useState } from "react";

const C = {
    card: "#0b0f18",
    border: "#1f2933",
    gold: "#d4a843",
    text: "#e5e7eb",
    dim: "#6b7280",
};

/**
 * NewsAndSignalsPanel — displays recent market signals fetched from the
 * Supabase Edge Function `signals-recent`.
 * Props: region (e.g. "US", "FL"), assetType (e.g. "subdivision")
 */
export function NewsAndSignalsPanel({ region = "US", assetType = "generic" }) {
    const [signals, setSignals] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            setLoading(true);
            try {
                const res = await fetch(
                    `/api/signals/recent?region=${encodeURIComponent(region)}&asset_type=${encodeURIComponent(assetType)}&limit=20`
                );
                const json = await res.json();
                setSignals(json.signals || []);
            } catch (e) {
                console.error("NewsAndSignalsPanel error:", e);
            } finally {
                setLoading(false);
            }
        })();
    }, [region, assetType]);

    return (
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 4, padding: 14, fontSize: 13 }}>
            <div style={{ fontSize: 10, letterSpacing: 3, textTransform: "uppercase", color: C.dim, marginBottom: 10, display: "flex", justifyContent: "space-between" }}>
                <span>News & Signals</span>
                <span>{region} · {assetType}</span>
            </div>

            {loading ? (
                <div style={{ color: C.dim, fontSize: 12 }}>Loading signals…</div>
            ) : signals.length === 0 ? (
                <div style={{ color: C.dim, fontSize: 12 }}>No recent signals captured yet.</div>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {signals.map((s) => <SignalCard key={s.id} signal={s} />)}
                </div>
            )}
        </div>
    );
}

function SignalCard({ signal }) {
    const color =
        signal.direction === "inflationary" ? "#f97316"
            : signal.direction === "deflationary" ? "#22c55e"
                : C.dim;

    return (
        <div style={{ borderRadius: 4, border: `1px solid ${C.border}`, padding: 10, background: "#05070b", fontSize: 12 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: C.text, marginBottom: 2 }}>
                {signal.title || `${signal.source_name} · ${signal.domain}`}
            </div>
            {signal.summary && (
                <div style={{ color: C.dim, fontSize: 11, marginBottom: 4 }}>{signal.summary}</div>
            )}
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10 }}>
                <div style={{ color: C.dim }}>{signal.domain} · {signal.region || "Global"}</div>
                <div style={{ color }}>{signal.direction || "neutral"} · strength {signal.strength ?? "-"}</div>
            </div>
            {signal.source_url && (
                <div style={{ marginTop: 4, fontSize: 10 }}>
                    <a href={signal.source_url} target="_blank" rel="noreferrer" style={{ color: C.gold }}>View source</a>
                </div>
            )}
        </div>
    );
}
