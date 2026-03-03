import React, { useEffect, useState } from "react";

const C = {
    bg: "#05070b",
    card: "#0b0f18",
    border: "#1f2933",
    gold: "#d4a843",
    green: "#10b981",
    red: "#ef4444",
    amber: "#f59e0b",
    text: "#e5e7eb",
    dim: "#6b7280",
};

const cardStyle = {
    background: C.card,
    border: `1px solid ${C.border}`,
    borderRadius: 4,
    padding: 14,
    fontSize: 13,
};

const inputStyle = {
    background: C.bg,
    border: `1px solid ${C.border}`,
    borderRadius: 3,
    color: C.text,
    fontSize: 11,
    padding: "6px 8px",
    outline: "none",
};

const buttonStyle = (loading) => ({
    padding: "6px 10px",
    fontSize: 10,
    letterSpacing: 2,
    textTransform: "uppercase",
    borderRadius: 3,
    border: `1px solid ${C.gold}`,
    background: loading ? "transparent" : C.gold,
    color: loading ? C.gold : "#05070b",
    cursor: loading ? "default" : "pointer",
});

/**
 * ScenarioDeck — displays and creates financial scenarios for a project.
 * Fetches from the Supabase Edge Function `project-scenarios` (Phase 4).
 * Renders scenario cards with IRR, equity multiple, index assumptions.
 */
export function ScenarioDeck({ projectId }) {
    const [scenarios, setScenarios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [newScenario, setNewScenario] = useState({
        name: "Custom Scenario",
        horizon_months: 24,
        labor_index: 1.0,
        materials_index: 1.0,
        rate_delta_bps: 0,
        rent_growth_delta_pct: 0,
    });

    useEffect(() => {
        if (!projectId) return;
        (async () => {
            setLoading(true);
            try {
                // Routes to Supabase Edge Function: supabase/functions/project-scenarios/index.ts
                const res = await fetch(`/api/projects/${projectId}/scenarios`);
                const json = await res.json();
                setScenarios(json.scenarios || []);
            } catch (e) {
                console.error("ScenarioDeck fetch error:", e);
            } finally {
                setLoading(false);
            }
        })();
    }, [projectId]);

    const createScenario = async () => {
        setCreating(true);
        try {
            const res = await fetch(`/api/projects/${projectId}/scenarios`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newScenario),
            });
            const json = await res.json();
            if (json.scenario) {
                setScenarios((prev) => [json.scenario, ...prev]);
            } else if (json.error) {
                console.error("Scenario creation error:", json.error);
            }
        } finally {
            setCreating(false);
        }
    };

    return (
        <div style={{ ...cardStyle }}>
            <div style={{ fontSize: 10, letterSpacing: 3, textTransform: "uppercase", color: C.dim, marginBottom: 10, display: "flex", justifyContent: "space-between" }}>
                <span>Scenario Deck</span>
                <span>{scenarios.length} scenarios</span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1.2fr repeat(4, 0.8fr)", gap: 6, alignItems: "center", marginBottom: 10 }}>
                <input style={inputStyle} placeholder="Name" value={newScenario.name} onChange={(e) => setNewScenario((s) => ({ ...s, name: e.target.value }))} />
                <input style={inputStyle} type="number" placeholder="Horizon (mo)" value={newScenario.horizon_months} onChange={(e) => setNewScenario((s) => ({ ...s, horizon_months: Number(e.target.value || 0) }))} />
                <input style={inputStyle} type="number" step="0.01" placeholder="Labor idx" value={newScenario.labor_index} onChange={(e) => setNewScenario((s) => ({ ...s, labor_index: Number(e.target.value || 1) }))} />
                <input style={inputStyle} type="number" step="0.01" placeholder="Mat. idx" value={newScenario.materials_index} onChange={(e) => setNewScenario((s) => ({ ...s, materials_index: Number(e.target.value || 1) }))} />
                <button style={buttonStyle(creating)} onClick={createScenario} disabled={creating}>
                    {creating ? "Creating…" : "Add Scenario"}
                </button>
            </div>

            {loading ? (
                <div style={{ color: C.dim, fontSize: 12 }}>Loading scenarios…</div>
            ) : scenarios.length === 0 ? (
                <div style={{ color: C.dim, fontSize: 12 }}>No scenarios yet. Add one above.</div>
            ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 8 }}>
                    {scenarios.map((s) => <ScenarioCard key={s.id} scenario={s} />)}
                </div>
            )}
        </div>
    );
}

function ScenarioCard({ scenario }) {
    const riskColor =
        (scenario.outputs?.irr ?? 0) >= 18 ? C.green
            : (scenario.outputs?.irr ?? 0) >= 12 ? C.amber
                : C.red;

    return (
        <div style={{ borderRadius: 4, border: `1px solid ${C.border}`, padding: 10, background: C.bg, fontSize: 12 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: C.text, marginBottom: 4 }}>{scenario.name}</div>
            <div style={{ color: C.dim, fontSize: 10, marginBottom: 6 }}>
                {scenario.kind === "system" ? "System" : "Custom"} · {scenario.horizon_months} mo
            </div>
            <div style={{ color: C.dim, fontSize: 11, marginBottom: 4 }}>
                Labor: <span style={{ color: C.text }}>{scenario.labor_index?.toFixed(2)}</span>
                {"  ·  "}Mat: <span style={{ color: C.text }}>{scenario.materials_index?.toFixed(2)}</span>
            </div>
            {scenario.outputs && (
                <>
                    <div style={{ color: C.dim, fontSize: 11 }}>
                        IRR: <span style={{ color: riskColor, fontWeight: 600 }}>{scenario.outputs.irr?.toFixed(1)}%</span>
                    </div>
                    <div style={{ color: C.dim, fontSize: 11 }}>
                        Equity Multiple: <span style={{ color: C.text }}>{scenario.outputs.equity_multiple?.toFixed(2)}×</span>
                    </div>
                </>
            )}
        </div>
    );
}
