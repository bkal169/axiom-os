import React from "react";
import "./theme.css";
import { importCSV, RC } from "../../lib/utils";


export function Card({ title, children, action, className = "" }: { title: string, children: React.ReactNode, action?: React.ReactNode, className?: string }) {
    return (
        <div className={`axiom-card axiom-animate-slide-up ${className}`}>
            <div className="axiom-card-header">
                <span>{title}</span>
                {action}
            </div>
            {children}
        </div>
    );
}

export function KPI({ label, value, sub, color, trend, onUpdate }: { label: string, value: string | number, sub?: string, color?: string, trend?: string | number, onUpdate?: (val: any) => void }) {
    const [isEditing, setIsEditing] = React.useState(false);
    const [editValue, setEditValue] = React.useState(value);

    const handleBlur = () => {
        setIsEditing(false);
        if (onUpdate && editValue !== value) onUpdate(editValue);
    };

    return (
        <div className="axiom-kpi" onClick={() => onUpdate && !isEditing && setIsEditing(true)}>
            <div className="axiom-label">{label}</div>
            {isEditing ? (
                <input
                    autoFocus
                    className="axiom-input"
                    style={{ fontSize: 18, padding: "2px 4px", height: "auto", border: "1px solid var(--c-gold)" }}
                    value={editValue}
                    onChange={e => setEditValue(e.target.value)}
                    onBlur={handleBlur}
                    onKeyDown={e => e.key === 'Enter' && handleBlur()}
                />
            ) : (
                <div className="axiom-kpi-value" style={{ color: color || "inherit", cursor: onUpdate ? "pointer" : "default" }}>
                    {value}
                    {onUpdate && <span style={{ fontSize: 8, marginLeft: 4, opacity: 0.5 }}>✎</span>}
                </div>
            )}
            {sub && <div className="axiom-kpi-sub">{sub}</div>}
            {trend !== undefined && (
                <div className={`axiom-kpi-trend ${Number(trend) >= 0 ? "axiom-trend-up" : "axiom-trend-down"}`}>
                    {Number(trend) >= 0 ? "▲" : "▼"} {Math.abs(Number(trend)).toFixed(1)}%
                </div>
            )}
        </div>
    );
}

export function Field({ label, children, mb = 11, className = "", onUpdate, value }: { label: string, children: React.ReactNode, mb?: number, className?: string, onUpdate?: (val: any) => void, value?: any }) {
    const [isEditing, setIsEditing] = React.useState(false);
    const [editValue, setEditValue] = React.useState(value);

    const handleBlur = () => {
        setIsEditing(false);
        if (onUpdate && editValue !== value) onUpdate(editValue);
    };

    return (
        <div className={`axiom-field ${className}`} style={{ marginBottom: mb }}>
            <label className="axiom-label" style={{ display: "flex", justifyContent: "space-between" }}>
                {label}
                {onUpdate && !isEditing && <span onClick={() => setIsEditing(true)} style={{ cursor: "pointer", fontSize: 8, opacity: 0.5 }}>✎ EDIT</span>}
            </label>
            {isEditing ? (
                <input
                    autoFocus
                    className="axiom-input"
                    value={editValue}
                    onChange={e => setEditValue(e.target.value)}
                    onBlur={handleBlur}
                    onKeyDown={e => e.key === 'Enter' && handleBlur()}
                />
            ) : children}
        </div>
    );
}

export function Tooltip({ children, content }: { children: React.ReactNode, content: React.ReactNode }) {
    return (
        <div className="axiom-tooltip-wrapper">
            {children}
            <div className="axiom-tooltip">{content}</div>
        </div>
    );
}

export function Badge({ label, color = "var(--c-gold)" }: { label: string, color?: string }) {
    // Determine a semantic class name based on the raw color string to avoid inline color-mix,
    // which some environments or linters might flag or mishandle.
    let colorClass = "axiom-badge-gold";
    if (color.includes("green")) colorClass = "axiom-badge-green";
    else if (color.includes("red")) colorClass = "axiom-badge-red";
    else if (color.includes("amber")) colorClass = "axiom-badge-amber";
    else if (color.includes("purple")) colorClass = "axiom-badge-purple";
    else if (color.includes("blue")) colorClass = "axiom-badge-blue";
    else if (color.includes("teal")) colorClass = "axiom-badge-teal";
    else if (color.includes("dim") || color.includes("sub") || color.includes("border")) colorClass = "axiom-badge-dim";

    return (
        <span className={`axiom-badge ${colorClass}`}>
            {label}
        </span>
    );
}

export function Button({ children, label, onClick, variant = "ghost", className = "", style, disabled = false }: { children?: React.ReactNode, label?: string, onClick?: (e?: any) => void, variant?: "gold" | "ghost", className?: string, style?: React.CSSProperties, disabled?: boolean }) {
    return (
        <button
            className={`axiom-btn ${variant === "gold" ? "axiom-btn-gold" : ""} ${disabled ? "axiom-btn-disabled" : ""} ${className}`}
            onClick={onClick}
            style={style}
            disabled={disabled}
        >
            {label || children}
        </button>
    );
}

// Agent component moved to features/agents/Agent.tsx

export function Progress({ value, color = "var(--c-gold)" }: { value: number, color?: string }) {
    return (
        <div className="axiom-progress-container">
            <div className="axiom-progress-bar" style={{ width: `${Math.min(100, Math.max(0, value))}%`, background: color }}></div>
        </div>
    );
}

export function CItem({ text, checked, onChange, risk }: { text: string, checked: boolean, onChange: () => void, risk?: string }) {
    return (
        <label className="axiom-checkbox-item">
            <input type="checkbox" checked={checked} onChange={onChange} className="axiom-checkbox" title={text} />
            <span className={`axiom-checkbox-label ${checked ? "axiom-checkbox-checked" : ""}`}>{text}</span>
            {risk && <Badge label={risk} color={RC[risk as keyof typeof RC] || "var(--c-dim)"} />}
        </label>
    );
}



export function CSVImportButton({ onImport }: { onImport: (data: any[]) => void }) {
    const fileRef = React.useRef<HTMLInputElement>(null);
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            importCSV(file, (data) => {
                onImport(data);
                e.target.value = '';
            });
        }
    };
    return (
        <>
            <input type="file" ref={fileRef} style={{ display: "none" }} accept=".csv" onChange={handleFileChange} />
            <Button label="Import CSV" onClick={() => fileRef.current?.click()} />
        </>
    );
}
export function DataExplorerModal({ data, onClose }: { data: any, onClose: () => void }) {
    if (!data) return null;
    const pd = data.payload || data;
    return (
        <div className="axiom-modal-overlay" onClick={onClose}>
            <div className="axiom-modal-content axiom-animate-scale-in" onClick={e => e.stopPropagation()}>
                <div className="axiom-modal-header" style={{ marginBottom: 20 }}>
                    <div className="axiom-label">DATA INSPECTOR</div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: "var(--c-gold)", marginTop: 4 }}>
                        {pd.name || pd.subject || pd.label || "Datapoint Details"}
                    </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 20px" }}>
                    {Object.entries(pd).map(([k, v]) => {
                        if (typeof v === "object" || k === "fill") return null;
                        return (
                            <div key={k} style={{ borderBottom: "1px solid var(--c-border)", padding: "8px 0" }}>
                                <div style={{ fontSize: 9, color: "var(--c-dim)", textTransform: "uppercase", letterSpacing: 1 }}>{k.replace(/_/g, " ")}</div>
                                <div style={{ fontSize: 14, color: "var(--c-text)", fontWeight: 500, marginTop: 2 }}>{String(v)}</div>
                            </div>
                        );
                    })}
                </div>
                <Button variant="gold" className="w-full" style={{ marginTop: 30 }} onClick={onClose}>Close Inspector</Button>
            </div>
        </div>
    );
}
