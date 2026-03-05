/**
 * FloatingToolbar — Axiom OS Phase 2.4
 * A draggable, collapsible rich-text formatting toolbar.
 * Floats over the app as a small gold ✏️ icon, expands on click.
 * Works with any focused contenteditable / Tiptap editor.
 */

import { useState, useRef, useCallback, useEffect } from "react";

// ─── Color palette ────────────────────────────────────────────────────────────
const TEXT_COLORS = [
    { label: "White", value: "#F8FAFC" },
    { label: "Gold", value: "#D4A843" },
    { label: "Dim", value: "#E2E8F0" },
    { label: "Green", value: "#22C55E" },
    { label: "Blue", value: "#3B82F6" },
    { label: "Red", value: "#EF4444" },
    { label: "Amber", value: "#F59E0B" },
    { label: "Purple", value: "#8B5CF6" },
];

const FONT_SIZES = ["10", "11", "12", "13", "14", "16", "18", "20", "24", "28", "32"];
const FONT_FAMILIES = [
    { label: "Inter", value: "'Inter', sans-serif" },
    { label: "Courier", value: "'Courier New', monospace" },
    { label: "Georgia", value: "Georgia, serif" },
    { label: "System", value: "-apple-system, sans-serif" },
];

// ─── execCommand helpers (works with contenteditable globally) ───────────────
function exec(cmd: string, value?: string) {
    document.execCommand(cmd, false, value);
}

function applyFontSize(size: string) {
    // Find focused contenteditable
    const el = document.activeElement;
    if (el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA")) return;
    exec("fontSize", "7"); // Max size hack
    const fontEls = document.querySelectorAll("font[size='7']");
    fontEls.forEach(f => {
        (f as HTMLElement).removeAttribute("size");
        (f as HTMLElement).style.fontSize = `${size}px`;
    });
}

// ─── Component ───────────────────────────────────────────────────────────────
export function FloatingToolbar() {
    const [expanded, setExpanded] = useState(false);
    const [pos, setPos] = useState({ x: window.innerWidth - 320, y: window.innerHeight - 160 });
    const [dragging, setDragging] = useState(false);
    const [activeFontSize, setActiveFontSize] = useState("13");
    const dragOffset = useRef({ x: 0, y: 0 });
    const toolbarRef = useRef<HTMLDivElement>(null);

    // ─── Drag logic ───────────────────────────────────────────────────────
    const onMouseDown = useCallback((e: React.MouseEvent) => {
        if ((e.target as HTMLElement).closest(".axiom-ft-controls")) return;
        e.preventDefault();
        setDragging(true);
        dragOffset.current = { x: e.clientX - pos.x, y: e.clientY - pos.y };
    }, [pos]);

    useEffect(() => {
        if (!dragging) return;
        const move = (e: MouseEvent) => {
            const nx = Math.max(0, Math.min(window.innerWidth - 60, e.clientX - dragOffset.current.x));
            const ny = Math.max(0, Math.min(window.innerHeight - 60, e.clientY - dragOffset.current.y));
            setPos({ x: nx, y: ny });
        };
        const up = () => setDragging(false);
        window.addEventListener("mousemove", move);
        window.addEventListener("mouseup", up);
        return () => { window.removeEventListener("mousemove", move); window.removeEventListener("mouseup", up); };
    }, [dragging]);

    return (
        <div
            ref={toolbarRef}
            className={`axiom-ft-container${expanded ? " axiom-ft-container--expanded" : ""}`}
            style={{ left: pos.x, top: pos.y, cursor: dragging ? "grabbing" : "grab" }}
            onMouseDown={onMouseDown}
        >
            {/* Collapsed toggle button */}
            <button
                className="axiom-ft-toggle"
                onClick={() => setExpanded(e => !e)}
                title={expanded ? "Collapse toolbar" : "Formatting toolbar"}
            >
                {expanded ? "✕" : "✏"}
            </button>

            {/* Expanded controls */}
            {expanded && (
                <div className="axiom-ft-controls" onMouseDown={e => e.stopPropagation()}>
                    <div className="axiom-ft-row">
                        {/* Font Family */}
                        <select
                            className="axiom-ft-select"
                            onChange={e => exec("fontName", e.target.value)}
                            title="Font Family"
                        >
                            {FONT_FAMILIES.map(f => (
                                <option key={f.value} value={f.value}>{f.label}</option>
                            ))}
                        </select>

                        {/* Font Size */}
                        <select
                            className="axiom-ft-select axiom-ft-select--sm"
                            value={activeFontSize}
                            onChange={e => { setActiveFontSize(e.target.value); applyFontSize(e.target.value); }}
                            title="Font Size"
                        >
                            {FONT_SIZES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>

                    <div className="axiom-ft-divider" />

                    <div className="axiom-ft-row">
                        {/* Format buttons */}
                        {[
                            { cmd: "bold", label: "B", title: "Bold", style: { fontWeight: 700 } },
                            { cmd: "italic", label: "I", title: "Italic", style: { fontStyle: "italic" } },
                            { cmd: "underline", label: "U", title: "Underline", style: { textDecoration: "underline" } },
                            { cmd: "strikeThrough", label: "S̶", title: "Strikethrough", style: {} },
                        ].map(btn => (
                            <button
                                key={btn.cmd}
                                className="axiom-ft-btn"
                                onClick={() => exec(btn.cmd)}
                                title={btn.title}
                                style={btn.style}
                            >
                                {btn.label}
                            </button>
                        ))}

                        <div className="axiom-ft-sep" />

                        {/* Alignment */}
                        {[
                            { cmd: "justifyLeft", label: "⫷", title: "Align Left" },
                            { cmd: "justifyCenter", label: "≡", title: "Center" },
                            { cmd: "justifyRight", label: "⫸", title: "Align Right" },
                        ].map(btn => (
                            <button key={btn.cmd} className="axiom-ft-btn" onClick={() => exec(btn.cmd)} title={btn.title}>
                                {btn.label}
                            </button>
                        ))}

                        <div className="axiom-ft-sep" />

                        {/* Lists */}
                        <button className="axiom-ft-btn" onClick={() => exec("insertUnorderedList")} title="Bullet List">• —</button>
                        <button className="axiom-ft-btn" onClick={() => exec("insertOrderedList")} title="Numbered List">1.</button>
                    </div>

                    <div className="axiom-ft-divider" />

                    <div className="axiom-ft-row">
                        {/* Text Color swatches */}
                        <span className="axiom-ft-label">Color:</span>
                        {TEXT_COLORS.map(c => (
                            <button
                                key={c.value}
                                className="axiom-ft-swatch"
                                style={{ background: c.value }}
                                onClick={() => exec("foreColor", c.value)}
                                title={c.label}
                            />
                        ))}

                        <div className="axiom-ft-sep" />

                        {/* Highlight */}
                        <span className="axiom-ft-label">Hi:</span>
                        {["rgba(212,168,67,0.25)", "rgba(34,197,94,0.2)", "rgba(59,130,246,0.2)", "rgba(239,68,68,0.2)"].map(c => (
                            <button
                                key={c}
                                className="axiom-ft-swatch"
                                style={{ background: c, border: "1px solid rgba(255,255,255,0.15)" }}
                                onClick={() => exec("hiliteColor", c)}
                                title="Highlight"
                            />
                        ))}
                    </div>

                    <div className="axiom-ft-divider" />

                    <div className="axiom-ft-row">
                        {/* Clipboard / clear */}
                        <button className="axiom-ft-btn axiom-ft-btn--text" onClick={() => exec("copy")} title="Copy">Copy</button>
                        <button className="axiom-ft-btn axiom-ft-btn--text" onClick={() => exec("paste")} title="Paste">Paste</button>
                        <button className="axiom-ft-btn axiom-ft-btn--text" onClick={() => exec("selectAll")} title="Select All">All</button>
                        <div className="axiom-ft-sep" />
                        <button className="axiom-ft-btn axiom-ft-btn--text axiom-ft-btn--dim" onClick={() => exec("removeFormat")} title="Clear Formatting">Clear</button>
                    </div>
                </div>
            )}
        </div>
    );
}
