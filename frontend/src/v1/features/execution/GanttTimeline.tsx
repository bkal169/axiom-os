import { Card } from "../../components/ui/components";
import { useProject } from "../../context/ProjectContext";

const STATUS_COLORS: Record<string, string> = {
    "Active": "var(--c-gold)",
    "Approved": "var(--c-green)",
    "Completed": "var(--c-green)",
    "Not Started": "#3d4454",
    "Pending": "#3d4454",
    "N/A": "#2a2a3a",
};

function parseDurationWeeks(duration: string): number {
    // Parse strings like "16-24 wks", "4-6 wks", "12-52 wks"
    const match = duration.match(/(\d+)[-–]?(\d+)?\s*wk/i);
    if (!match) return 4;
    const low = parseInt(match[1], 10);
    const high = match[2] ? parseInt(match[2], 10) : low;
    return Math.round((low + high) / 2);
}

export function GanttTimeline() {
    const ctx = useProject();
    const permits = ctx?.permits ?? [];

    const maxWeeks = Math.max(...permits.map((p: any) => parseDurationWeeks(p.duration || "4 wks")), 1);

    return (
        <Card title="Project Timeline">
            <div style={{ fontFamily: "DM Mono, monospace", fontSize: 10, color: "var(--c-dim)", marginBottom: 16, letterSpacing: 1, textTransform: "uppercase" }}>
                Entitlement Phase Gantt — {permits.length} permits
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "200px 1fr", gap: "6px 12px", alignItems: "center" }}>
                {/* Header row */}
                <div style={{ fontSize: 10, color: "var(--c-dim)", fontWeight: 600, letterSpacing: 1, textTransform: "uppercase" }}>
                    Phase
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, color: "var(--c-dim)" }}>
                    {Array.from({ length: Math.min(Math.ceil(maxWeeks / 4) + 1, 14) }, (_, i) => (
                        <span key={i}>W{i * 4}</span>
                    ))}
                </div>

                {/* Permit rows */}
                {permits.map((permit: any, idx: number) => {
                    const weeks = parseDurationWeeks(permit.duration || "4 wks");
                    const widthPct = Math.max((weeks / maxWeeks) * 100, 5);
                    const statusColor = STATUS_COLORS[permit.status] ?? STATUS_COLORS["Pending"];

                    return (
                        <React.Fragment key={idx}>
                            <div style={{ fontSize: 11, color: "var(--c-text)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} title={permit.name}>
                                {permit.name}
                            </div>
                            <div style={{ position: "relative", height: 28, background: "var(--c-bg3)", borderRadius: 4 }}>
                                <div
                                    style={{
                                        position: "absolute",
                                        left: 0,
                                        top: 2,
                                        height: 24,
                                        width: `${widthPct}%`,
                                        background: statusColor,
                                        borderRadius: 3,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        transition: "width 0.3s",
                                        opacity: permit.status === "N/A" ? 0.3 : 0.85,
                                    }}
                                >
                                    <span style={{ fontSize: 9, color: "#fff", fontWeight: 600, textShadow: "0 1px 2px rgba(0,0,0,0.4)" }}>
                                        {weeks}w
                                    </span>
                                </div>
                            </div>
                        </React.Fragment>
                    );
                })}
            </div>

            {/* Legend */}
            <div style={{ display: "flex", gap: 16, marginTop: 20, fontSize: 10, color: "var(--c-dim)" }}>
                {[["Active", "var(--c-gold)"], ["Approved", "var(--c-green)"], ["Pending", "#3d4454"]].map(([label, color]) => (
                    <div key={label} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <div style={{ width: 10, height: 10, borderRadius: 2, background: color }} />
                        <span>{label}</span>
                    </div>
                ))}
            </div>
        </Card>
    );
}

import React from "react";
