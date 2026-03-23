import React from 'react';

export const C = {
    gold: "var(--c-gold)", gold2: "var(--c-gold2)", bg: "var(--c-bg)", bg2: "var(--c-bg2)", bg3: "var(--c-bg3)",
    bg4: "var(--c-bg4)", border: "var(--c-border)", border2: "var(--c-border2)", dim: "var(--c-dim)",
    text: "var(--c-text)", muted: "var(--c-muted)", sub: "var(--c-sub)",
    green: "var(--c-green)", blue: "var(--c-blue)", purple: "var(--c-purple)",
    red: "var(--c-red)", amber: "var(--c-amber)", teal: "var(--c-teal)",
};

export const RC = { Low: C.green, Medium: C.amber, High: C.red, Critical: C.purple };

export const PP = [C.gold, C.blue, C.teal, C.purple, "#F87171", C.amber, C.green];

export const US_STATES = ["", "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", "Delaware", "District of Columbia", "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan", "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire", "New Jersey", "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota", "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming"];

export const ST_ABBR = { "": "", "Alabama": "AL", "Alaska": "AK", "Arizona": "AZ", "Arkansas": "AR", "California": "CA", "Colorado": "CO", "Connecticut": "CT", "Delaware": "DE", "District of Columbia": "DC", "Florida": "FL", "Georgia": "GA", "Hawaii": "HI", "Idaho": "ID", "Illinois": "IL", "Indiana": "IN", "Iowa": "IA", "Kansas": "KS", "Kentucky": "KY", "Louisiana": "LA", "Maine": "ME", "Maryland": "MD", "Massachusetts": "MA", "Michigan": "MI", "Minnesota": "MN", "Mississippi": "MS", "Missouri": "MO", "Montana": "MT", "Nebraska": "NE", "Nevada": "NV", "New Hampshire": "NH", "New Jersey": "NJ", "New Mexico": "NM", "New York": "NY", "North Carolina": "NC", "North Dakota": "ND", "Ohio": "OH", "Oklahoma": "OK", "Oregon": "OR", "Pennsylvania": "PA", "Rhode Island": "RI", "South Carolina": "SC", "South Dakota": "SD", "Tennessee": "TN", "Texas": "TX", "Utah": "UT", "Vermont": "VT", "Virginia": "VA", "Washington": "WA", "West Virginia": "WV", "Wisconsin": "WI", "Wyoming": "WY" };

export const NAV = [
    { id: "dashboard", label: "Command Center", group: "Overview" },
    { id: "connectors", label: "Connectors & APIs", group: "Overview" },
    { id: "contacts", label: "Contacts", group: "CRM" },
    { id: "pipeline", label: "Deal Pipeline", group: "CRM" },
    { id: "analyzer", label: "Deal Analyzer", group: "CRM" },
    { id: "financial", label: "Financial Engine", group: "Finance" },
    { id: "invoices", label: "Invoices & Payments", group: "Finance" },
    { id: "calchub", label: "Calculator Hub", group: "Finance" },
    { id: "site", label: "Site & Entitlements", group: "Site" },
    { id: "infrastructure", label: "Infrastructure", group: "Site" },
    { id: "design", label: "Concept & Design", group: "Site" },
    { id: "network", label: "Professional Network", group: "Site" },
    { id: "market", label: "Market Intelligence", group: "Market" },
    { id: "mls", label: "MLS & Listings", group: "Market" },
    { id: "dataintel", label: "Data & Intel", group: "Market" },
    { id: "juris", label: "Jurisdiction Intel", group: "Market" },
    { id: "process", label: "Process Control", group: "Execution" },
    { id: "sitemgmt", label: "Site Management", group: "Execution" },
    { id: "risk", label: "Risk Command", group: "Execution" },
    { id: "notes", label: "Notes", group: "Workspace" },
    { id: "calendar", label: "Calendar", group: "Workspace" },
    { id: "email", label: "Email", group: "Workspace" },
    { id: "sheets", label: "Spreadsheets", group: "Workspace" },
    { id: "workflows", label: "Workflows", group: "Workspace" },
    { id: "resources", label: "Resource Center", group: "Workspace" },
    { id: "reports", label: "Reports & Binder", group: "Output" },
    { id: "agents", label: "AI Agent Hub", group: "Output" },
    { id: "copilot", label: "Copilot", group: "Output" },
    { id: "neural", label: "Neural Intelligence", group: "Output" },
    { id: "billing", label: "Billing & Plans", group: "System" },
    { id: "legal", label: "Legal & Compliance", group: "System" },
    { id: "settings", label: "Settings", group: "System" },
    { id: "agent_pipeline", label: "Agent Pipeline", icon: "🤖", group: "V5", tier: "core" },
    { id: "risk_calibration", label: "Risk Intelligence", icon: "⚡", group: "V5", tier: "core" },
    { id: "tax_intel", label: "Tax Intelligence", icon: "💰", group: "V5", tier: "core" },
    { id: "portfolio_governance", label: "Portfolio Gov", icon: "🏛", group: "V5", tier: "core" },
    { id: "site_map_3d", label: "3D Site Map", icon: "🗺", group: "V5", tier: "core" },
];

// Derived from NAV — maps each module id to its display title for the top bar.
export const TITLE_MAP = Object.fromEntries(NAV.map(n => [n.id, n.label]));

export const S = {
    app: { display: "flex", height: "100vh", background: C.bg, fontFamily: "'Inter', sans-serif", color: C.text, overflow: "hidden" },
    side: { width: 238, background: C.bg2, borderRight: `1px solid ${C.border}`, display: "flex", flexDirection: "column", flexShrink: 0, overflow: "hidden" },
    main: { flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" },
    bar: { height: 50, background: C.bg2, borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", padding: "0 20px", gap: 12, flexShrink: 0 },
    cnt: { flex: 1, overflowY: "auto", padding: 20 },
    card: { background: C.bg3, border: `1px solid ${C.border}`, borderRadius: 4, padding: 18, marginBottom: 14 },
    ct: { fontSize: 10, letterSpacing: 3, color: C.gold, textTransform: "uppercase", marginBottom: 14, borderBottom: `1px solid ${C.border}`, paddingBottom: 7, display: "flex", alignItems: "center", justifyContent: "space-between" },
    g2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 },
    g3: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 },
    g4: { display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 },
    g5: { display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 10 },
    kpi: { background: C.bg, border: `1px solid ${C.border}`, borderRadius: 4, padding: "12px 14px" },
    inp: { background: C.bg, border: `1px solid ${C.border2}`, borderRadius: 3, color: C.text, fontSize: 13, padding: "6px 9px", width: "100%", fontFamily: "inherit", outline: "none", boxSizing: "border-box" },
    sel: { background: C.bg, border: `1px solid ${C.border2}`, borderRadius: 3, color: C.text, fontSize: 13, padding: "6px 9px", width: "100%", fontFamily: "inherit", outline: "none" },
    lbl: { fontSize: 9, color: C.dim, letterSpacing: 2, textTransform: "uppercase", marginBottom: 3, display: "block" },
    btn: (v = "gold") => ({ padding: "7px 14px", borderRadius: 3, fontSize: 10, letterSpacing: 2, textTransform: "uppercase", cursor: "pointer", fontFamily: "inherit", border: v === "gold" ? `1px solid ${C.gold}` : `1px solid ${C.border2}`, background: v === "gold" ? C.gold : "transparent", color: v === "gold" ? C.bg : C.muted, fontWeight: 700, transition: "all 0.12s" }),
    tbl: { width: "100%", borderCollapse: "collapse", fontSize: 13 },
    th: { padding: "7px 9px", textAlign: "left", fontSize: 9, letterSpacing: 2, color: C.dim, borderBottom: `1px solid ${C.border}`, textTransform: "uppercase" },
    td: { padding: "8px 9px", borderBottom: "1px solid #0F1117", color: C.sub },
    tag: (c = C.gold) => ({ display: "inline-block", padding: "2px 7px", borderRadius: 2, fontSize: 9, letterSpacing: 1, fontWeight: 700, textTransform: "uppercase", background: `color-mix(in srgb, ${c} 15%, transparent)`, color: c, border: `1px solid color-mix(in srgb, ${c} 25%, transparent)` }),
    ta: { background: C.bg, border: `1px solid ${C.border2}`, borderRadius: 3, color: C.text, fontSize: 13, padding: "7px 9px", width: "100%", fontFamily: "inherit", outline: "none", resize: "vertical", boxSizing: "border-box" },
    bub: (r) => ({ background: r === "user" ? C.bg4 : C.bg, border: `1px solid ${r === "user" ? C.border2 : C.border}`, borderRadius: 4, padding: "9px 12px", marginBottom: 7, fontSize: 13, color: r === "user" ? "#94A3B8" : C.text, borderLeft: r === "assistant" ? `3px solid ${C.gold}` : "none" }),
    dot: (c) => ({ width: 7, height: 7, borderRadius: "50%", background: c, display: "inline-block", marginRight: 5 }),
    tab: (a) => ({ padding: "6px 14px", fontSize: 10, letterSpacing: 2, textTransform: "uppercase", cursor: "pointer", fontFamily: "inherit", border: "none", borderBottom: a ? `2px solid ${C.gold}` : "2px solid transparent", background: "transparent", color: a ? C.gold : C.dim, fontWeight: a ? 700 : 400, transition: "all 0.12s" }),
    hbar: { display: "flex", background: C.bg2, borderBottom: `1px solid ${C.border}`, marginBottom: 16 },
    navg: { fontSize: 11, color: C.dim, letterSpacing: 3, textTransform: "uppercase", padding: "14px 16px 6px", marginTop: 4, opacity: 0.6 },
    navi: (a, collapsed) => ({ display: "flex", alignItems: "center", gap: 12, padding: collapsed ? "12px 0" : "10px 16px", justifyContent: collapsed ? "center" : "flex-start", cursor: "pointer", fontSize: 14, letterSpacing: 0.5, background: a ? `color-mix(in srgb, var(--c-text) 5%, transparent)` : "transparent", borderLeft: a ? `3px solid ${C.gold}` : "3px solid transparent", color: a ? C.gold : C.muted, transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)", userSelect: "none" }),
};

// PremiereStyles JSX component removed — canonical definition lives in
// src/jsx/components/UI/PremiereStyles.jsx; AxiomApp.jsx imports from there.

export const MODELS = [
    { id: "claude-sonnet-4-20250514", label: "Claude Sonnet 4", provider: "anthropic" },
    { id: "claude-opus-4-20250514", label: "Claude Opus 4", provider: "anthropic" },
    { id: "claude-3-5-haiku-20241022", label: "Claude Haiku 3.5", provider: "anthropic" },
    { id: "gpt-4o", label: "GPT-4o", provider: "openai" },
    { id: "gpt-4o-mini", label: "GPT-4o Mini", provider: "openai" },
    { id: "llama-3.3-70b-versatile", label: "Llama 3.3 70B (free)", provider: "groq" },
    { id: "mixtral-8x7b-32768", label: "Mixtral 8x7B (free)", provider: "groq" },
    { id: "gemma2-9b-it", label: "Gemma 2 9B (free)", provider: "groq" },
    { id: "meta-llama/Llama-3.3-70B-Instruct-Turbo", label: "Llama 3.3 70B (Together)", provider: "together" },
    { id: "mistralai/Mixtral-8x7B-Instruct-v0.1", label: "Mixtral 8x7B (Together)", provider: "together" },
];

export const ENDPOINTS = {
    anthropic: "https://api.anthropic.com/v1/messages",
    openai: "https://api.openai.com/v1/chat/completions",
    groq: "https://api.groq.com/openai/v1/chat/completions",
    together: "https://api.together.xyz/v1/chat/completions",
};
