// ─── SHARED CHART THEME ───────────────────────────────────────
// Ported from AxiomOS_v20.jsx TT() / TT_BAR() helpers.
// Import into any component that uses Recharts for consistent styling.

/** Tooltip props for Line / Area charts */
export const CHART_TT = {
    contentStyle: {
        background: "rgba(22,26,34,0.98)",
        border: "1px solid rgba(212,168,67,0.5)",
        borderRadius: 10,
        fontSize: 13,
        fontFamily: "Inter, 'Courier New', monospace",
        padding: "10px 14px",
        boxShadow: "0 12px 40px rgba(0,0,0,0.6)",
        backdropFilter: "blur(16px)",
        color: "#E2E8F0",
        minWidth: 140,
        outline: "none",
    },
    itemStyle: { color: "#D4A843", fontWeight: 600, paddingTop: 2 },
    labelStyle: {
        color: "#aab0bb",
        marginBottom: 6,
        fontSize: 11,
        fontWeight: 600,
        textTransform: "uppercase" as const,
        letterSpacing: 1,
    },
    cursor: { stroke: "rgba(212,168,67,0.4)", strokeWidth: 1, strokeDasharray: "4 4" },
    wrapperStyle: { outline: "none" },
};

/** Tooltip props for Bar charts (block cursor instead of line cursor) */
export const CHART_TT_BAR = {
    ...CHART_TT,
    cursor: { fill: "rgba(212,168,67,0.06)" },
};

/** SVG tick style for Recharts XAxis / YAxis */
export const AXIS_TICK = { fontSize: 10, fill: "#6B7280" };

/** Faint Cartesian grid stroke */
export const GRID_STROKE = "rgba(255,255,255,0.05)";

/** Legend wrapper style */
export const LEGEND_STYLE = { fontSize: 10, color: "#6B7280" };
