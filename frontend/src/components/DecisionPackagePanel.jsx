import React, { useState } from "react";

const C = {
    card: "#0b0f18",
    border: "#1f2933",
    gold: "#d4a843",
    text: "#e5e7eb",
    dim: "#6b7280",
};

/**
 * DecisionPackagePanel — selects a scenario and exports a Decision Package
 * (IC Memo + snapshots) via the decision-artifacts Edge Function.
 */
export function DecisionPackagePanel({ projectId, scenarios }) {
    const [selectedScenarioId, setSelectedScenarioId] = useState(scenarios[0]?.id || "");
    const [exporting, setExporting] = useState(false);
    const [lastLink, setLastLink] = useState(null);

    const exportPackage = async () => {
        if (!selectedScenarioId) return;
        setExporting(true);
        try {
            const res = await fetch(`/api/projects/${projectId}/decision-artifacts`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ scenario_id: selectedScenarioId }),
            });
            const json = await res.json();
            if (json.decision_artifact) {
                setLastLink(json.decision_artifact.memo_url);
            } else if (json.error) {
                console.error("Decision package error:", json.error);
            }
        } finally {
            setExporting(false);
        }
    };

    return (
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 4, padding: 14, fontSize: 13, marginTop: 10 }}>
            <div style={{ fontSize: 10, letterSpacing: 3, textTransform: "uppercase", color: C.dim, marginBottom: 10 }}>
                Decision Package
            </div>

            <div style={{ marginBottom: 8 }}>
                <label style={{ fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: C.dim, display: "block", marginBottom: 4 }}>Scenario</label>
                <select
                    style={{ width: "100%", padding: "6px 8px", background: "#05070b", borderRadius: 3, border: `1px solid ${C.border}`, color: C.text, fontSize: 12 }}
                    value={selectedScenarioId}
                    onChange={(e) => setSelectedScenarioId(e.target.value)}
                >
                    {scenarios.map((s) => (
                        <option key={s.id} value={s.id}>{s.name} ({s.horizon_months} mo)</option>
                    ))}
                </select>
            </div>

            <button
                style={{ padding: "7px 14px", fontSize: 10, letterSpacing: 2, textTransform: "uppercase", borderRadius: 3, border: `1px solid ${C.gold}`, background: exporting ? "transparent" : C.gold, color: exporting ? C.gold : "#05070b", cursor: exporting ? "default" : "pointer" }}
                onClick={exportPackage}
                disabled={exporting}
            >
                {exporting ? "Generating…" : "Export Decision Package"}
            </button>

            {lastLink && (
                <div style={{ marginTop: 10, fontSize: 12, color: C.text, wordBreak: "break-all" }}>
                    Latest memo:{" "}
                    <a href={lastLink} target="_blank" rel="noreferrer" style={{ color: C.gold }}>{lastLink}</a>
                </div>
            )}
        </div>
    );
}
