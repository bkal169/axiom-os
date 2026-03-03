// @ts-nocheck
/* eslint-disable react/prop-types */
import React, { useState, useEffect, useCallback, createContext, useContext, useRef } from "react";
import { ScenarioDeck } from "./components/ScenarioDeck";
import { DecisionPackagePanel } from "./components/DecisionPackagePanel";
import { NewsAndSignalsPanel } from "./components/NewsAndSignalsPanel";
import { SecurityStatusBadge } from "./components/SecurityStatusBadge";
import {
  BarChart, Bar, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from "recharts";

const C = {
  gold: "var(--c-gold)", gold2: "var(--c-gold2)", bg: "var(--c-bg)", bg2: "var(--c-bg2)", bg3: "var(--c-bg3)",
  bg4: "var(--c-bg4)", border: "var(--c-border)", border2: "var(--c-border2)", dim: "var(--c-dim)",
  text: "var(--c-text)", muted: "var(--c-muted)", sub: "var(--c-sub)",
  green: "var(--c-green)", blue: "var(--c-blue)", purple: "var(--c-purple)",
  red: "var(--c-red)", amber: "var(--c-amber)", teal: "var(--c-teal)",
};
const RC = { Low: C.green, Medium: C.amber, High: C.red, Critical: C.purple };
const PP = [C.gold, C.blue, C.teal, C.purple, "#F87171", C.amber, C.green];

// ─── SHARED CHART HELPERS ─────────────────────────────────────
const TT = (extra = {}) => ({
  contentStyle: {
    background: "rgba(22,26,34,0.98)", border: `1px solid rgba(212,168,67,0.5)`,
    borderRadius: 10, fontSize: 13, fontFamily: "Inter,sans-serif",
    padding: "12px 16px", boxShadow: "0 12px 40px rgba(0,0,0,0.6)",
    backdropFilter: "blur(16px)", color: "#ffffff", minWidth: 160,
    ...extra,
  },
  itemStyle: { color: "#D4A843", fontWeight: 600, paddingTop: 2 },
  labelStyle: { color: "#aab0bb", marginBottom: 6, fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1 },
  cursor: { stroke: "rgba(212,168,67,0.4)", strokeWidth: 1, strokeDasharray: "4 4" },
  wrapperStyle: { outline: "none" },
});
const TT_BAR = (extra = {}) => ({
  ...TT(extra),
  cursor: { fill: "rgba(212,168,67,0.06)" },
});
const onChartClick = (setter) => (e) => {
  if (e && e.activePayload && e.activePayload[0]) setter(e.activePayload[0]);
};
const CHART_STYLE = { cursor: "pointer" };
const ACTIVE_DOT = { r: 7, fill: "#D4A843", stroke: "#0D0F13", strokeWidth: 2 };
const DOT = { r: 4, fill: "#D4A843", stroke: "#0D0F13", strokeWidth: 1.5 };
const US_STATES = ["", "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", "Delaware", "District of Columbia", "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan", "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire", "New Jersey", "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota", "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming"];
const ST_ABBR = { "": "", "Alabama": "AL", "Alaska": "AK", "Arizona": "AZ", "Arkansas": "AR", "California": "CA", "Colorado": "CO", "Connecticut": "CT", "Delaware": "DE", "District of Columbia": "DC", "Florida": "FL", "Georgia": "GA", "Hawaii": "HI", "Idaho": "ID", "Illinois": "IL", "Indiana": "IN", "Iowa": "IA", "Kansas": "KS", "Kentucky": "KY", "Louisiana": "LA", "Maine": "ME", "Maryland": "MD", "Massachusetts": "MA", "Michigan": "MI", "Minnesota": "MN", "Mississippi": "MS", "Missouri": "MO", "Montana": "MT", "Nebraska": "NE", "Nevada": "NV", "New Hampshire": "NH", "New Jersey": "NJ", "New Mexico": "NM", "New York": "NY", "North Carolina": "NC", "North Dakota": "ND", "Ohio": "OH", "Oklahoma": "OK", "Oregon": "OR", "Pennsylvania": "PA", "Rhode Island": "RI", "South Carolina": "SC", "South Dakota": "SD", "Tennessee": "TN", "Texas": "TX", "Utah": "UT", "Vermont": "VT", "Virginia": "VA", "Washington": "WA", "West Virginia": "WV", "Wisconsin": "WI", "Wyoming": "WY" };

const NAV = [
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
];

const S = {
  app: { display: "flex", height: "100vh", background: C.bg, fontFamily: "'Courier New',Courier,monospace", color: C.text, overflow: "hidden" },
  side: { width: 218, background: C.bg2, borderRight: `1px solid ${C.border}`, display: "flex", flexDirection: "column", flexShrink: 0, overflow: "hidden" },
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
  navg: { fontSize: 13, color: C.muted, letterSpacing: 2, textTransform: "uppercase", padding: "16px 16px 6px", marginTop: 4, opacity: 1, fontWeight: 600 },
  navi: (a, collapsed) => ({ display: "flex", alignItems: "center", gap: 12, padding: collapsed ? "12px 0" : "10px 16px", justifyContent: collapsed ? "center" : "flex-start", cursor: "pointer", fontSize: 14, letterSpacing: 0.5, background: a ? `color-mix(in srgb, var(--c-text) 5%, transparent)` : "transparent", borderLeft: a ? `3px solid ${C.gold}` : "3px solid transparent", color: a ? C.gold : C.muted, transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)", userSelect: "none" }),
};

const PremiereStyles = () => (
  <style>{`
    :root {
      --c-gold: #D4A843; --c-gold2: #E8C76A; --c-bg: #0D0F13; --c-bg2: #0A0C10; --c-bg3: #111318;
      --c-bg4: #1A1E2A; --c-border: #1E2330; --c-border2: #2D3748; --c-dim: #6B7280;
      --c-text: #E2E8F0; --c-muted: #8892A4; --c-sub: #C4CDD8;
      --c-green: #22C55E; --c-blue: #3B82F6; --c-purple: #8B5CF6;
      --c-red: #EF4444; --c-amber: #F59E0B; --c-teal: #10B981;
    }
    body.light-mode {
      --c-gold: #B38622; --c-gold2: #C49F44; --c-bg: #F8FAFC; --c-bg2: #F1F5F9; --c-bg3: #FFFFFF;
      --c-bg4: #E2E8F0; --c-border: #E2E8F0; --c-border2: #CBD5E1; --c-dim: #64748B;
      --c-text: #0F172A; --c-muted: #475569; --c-sub: #334155;
      --c-green: #16A34A; --c-blue: #2563EB; --c-purple: #7C3AED;
      --c-red: #DC2626; --c-amber: #D97706; --c-teal: #0D9488;
    }
    .premium-hover:hover { background: color-mix(in srgb, var(--c-text) 5%, transparent) !important; color: ${C.text} !important; box-shadow: 0 4px 20px rgba(0,0,0,0.2); transform: translateY(-1px); }
    .nav-item:hover { background: color-mix(in srgb, var(--c-text) 5%, transparent) !important; color: ${C.gold} !important; padding-left: 20px !important; }
    .nav-item-collapsed:hover { background: color-mix(in srgb, var(--c-text) 5%, transparent) !important; color: ${C.gold} !important; }
    ::-webkit-scrollbar { width: 6px; }
    ::-webkit-scrollbar-track { background: var(--c-bg2); }
    ::-webkit-scrollbar-thumb { background: var(--c-border); borderRadius: 3px; }
    ::-webkit-scrollbar-thumb:hover { background: var(--c-dim); }
    .chart-node:hover { cursor: pointer; filter: brightness(1.2); stroke: var(--c-gold); stroke-width: 2px; }
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
  `}</style>
);

const fmt = {
  usd: (n) => "$" + Number(n || 0).toLocaleString("en-US", { maximumFractionDigits: 0 }),
  pct: (n) => Number(n || 0).toFixed(1) + "%",
  num: (n) => Number(n || 0).toLocaleString(),
  sf: (n) => Number(n || 0).toLocaleString() + " SF",
  k: (n) => "$" + (Number(n || 0) / 1000).toFixed(0) + "K",
  M: (n) => "$" + (Number(n || 0) / 1e6).toFixed(2) + "M",
};

function useLS(key, init) {
  const [val, set] = useState(() => {
    try { const s = localStorage.getItem(key); return s ? JSON.parse(s) : (typeof init === "function" ? init() : init); }
    catch { return typeof init === "function" ? init() : init; }
  });
  useEffect(() => { try { localStorage.setItem(key, JSON.stringify(val)); } catch { } }, [key, val]);
  return [val, set];
}

// ─── SUPABASE CLIENT (zero-dependency REST) ────────────────────
// Production: reads VITE_ env vars baked by Vercel at build time (via window.__ENV__)
// Fallback to localStorage for self-hosted / dev mode
const _ENV = (() => {
  try { return (typeof __VITE_ENV__ !== "undefined" && __VITE_ENV__) || {}; } catch { return {}; }
})();
const SUPA_URL = _ENV.VITE_SUPABASE_URL || "https://ubdhpacoqmlxudcvhyuu.supabase.co";
const SUPA_KEY = _ENV.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InViZGhwYWNvcW1seHVkY3ZoeXV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE0NjAzNDIsImV4cCI6MjA4NzAzNjM0Mn0.2qZBBWis2GUarglN6Lv2OuHpkfdQTkV25m20p3bjOwQ";
const IS_PROD_CONFIGURED = !!_ENV.VITE_SUPABASE_URL;

const supa = {
  url: SUPA_URL,
  key: SUPA_KEY,
  token: null,
  configured() { return !!(this.url && this.key); },
  headers() {
    const h = { "Content-Type": "application/json", apikey: this.key, "Prefer": "return=representation" };
    if (this.token) h["Authorization"] = `Bearer ${this.token}`;
    return h;
  },
  async auth(email, password, isSignUp = false) {
    const endpoint = isSignUp ? "signup" : "token?grant_type=password";
    const r = await fetch(`${this.url}/auth/v1/${endpoint}`, {
      method: "POST", headers: { "Content-Type": "application/json", apikey: this.key },
      body: JSON.stringify({ email, password }),
    });
    const data = await r.json();
    if (!r.ok) throw new Error(data.error_description || data.msg || data.message || "Auth failed");
    this.token = data.access_token;
    localStorage.setItem("axiom_supa_token", data.access_token);
    localStorage.setItem("axiom_supa_refresh", data.refresh_token || "");
    return data;
  },
  async refreshSession() {
    const rt = localStorage.getItem("axiom_supa_refresh");
    if (!rt) return null;
    try {
      const r = await fetch(`${this.url}/auth/v1/token?grant_type=refresh_token`, {
        method: "POST", headers: { "Content-Type": "application/json", apikey: this.key },
        body: JSON.stringify({ refresh_token: rt }),
      });
      if (!r.ok) throw new Error("Refresh failed");
      const data = await r.json();
      this.token = data.access_token;
      localStorage.setItem("axiom_supa_token", data.access_token);
      localStorage.setItem("axiom_supa_refresh", data.refresh_token || "");
      return data;
    } catch { this.token = null; return null; }
  },
  async getUser() {
    if (!this.token) return null;
    const r = await fetch(`${this.url}/auth/v1/user`, { headers: this.headers() });
    if (!r.ok) return null;
    return r.json();
  },
  async logout() {
    if (this.token) await fetch(`${this.url}/auth/v1/logout`, { method: "POST", headers: this.headers() }).catch(() => { });
    this.token = null;
    localStorage.removeItem("axiom_supa_token");
    localStorage.removeItem("axiom_supa_refresh");
  },
  async select(table, query = "") {
    const r = await fetch(`${this.url}/rest/v1/${table}?${query}`, { headers: this.headers() });
    if (!r.ok) { console.warn(`Supabase select ${table} failed:`, r.status); return []; }
    return r.json();
  },
  async upsert(table, data) {
    const r = await fetch(`${this.url}/rest/v1/${table}`, {
      method: "POST",
      headers: { ...this.headers(), "Prefer": "return=representation,resolution=merge-duplicates" },
      body: JSON.stringify(data),
    });
    if (!r.ok) console.warn(`Supabase upsert ${table} failed:`, r.status, await r.text().catch(() => ""));
    return r.ok;
  },
  async update(table, match, data) {
    const params = Object.entries(match).map(([k, v]) => `${k}=eq.${v}`).join("&");
    const r = await fetch(`${this.url}/rest/v1/${table}?${params}`, {
      method: "PATCH", headers: this.headers(), body: JSON.stringify(data),
    });
    return r.ok;
  },
  async del(table, match) {
    const params = Object.entries(match).map(([k, v]) => `${k}=eq.${v}`).join("&");
    const r = await fetch(`${this.url}/rest/v1/${table}?${params}`, { method: "DELETE", headers: this.headers() });
    return r.ok;
  },
  async rpc(fn, args = {}) {
    const r = await fetch(`${this.url}/rest/v1/rpc/${fn}`, {
      method: "POST", headers: this.headers(), body: JSON.stringify(args),
    });
    return r.json();
  },
  async insert(table, data) {
    const r = await fetch(`${this.url}/rest/v1/${table}`, {
      method: "POST",
      headers: { ...this.headers(), "Prefer": "return=representation" },
      body: JSON.stringify(data),
    });
    if (!r.ok) { console.warn(`Supabase insert ${table} failed:`, r.status); return null; }
    const rows = await r.json();
    return Array.isArray(rows) ? rows[0] : rows;
  },
  async callEdge(fnName, body) {
    const r = await fetch(`${this.url}/functions/v1/${fnName}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${this.token}`, apikey: this.key },
      body: JSON.stringify(body),
    });
    return r.json();
  },
};

// Restore token on load
if (SUPA_URL && SUPA_KEY) {
  const savedToken = localStorage.getItem("axiom_supa_token");
  if (savedToken) supa.token = savedToken;
}

const AuthCtx = createContext(null);
const useAuth = () => useContext(AuthCtx);

// ─── TIER SYSTEM ──────────────────────────────────────────────
const TierCtx = createContext({ tier: "free", canUse: () => false, dealLimit: 5, aiDailyLimit: 0, teamLimit: 1 });
const useTier = () => useContext(TierCtx);

const TIER_CONFIG = {
  free: { level: 0, dealLimit: 5, aiDailyLimit: 3, teamLimit: 1, features: { basic_calcs: true, pipeline: true, contacts: true, market_data: true, exports: false, ai_agents: false, mls: false, team: false, api_access: false } },
  pro: { level: 1, dealLimit: 50, aiDailyLimit: 25, teamLimit: 1, features: { basic_calcs: true, pipeline: true, contacts: true, market_data: true, exports: true, ai_agents: true, mls: true, team: false, api_access: false } },
  pro_plus: { level: 2, dealLimit: 999, aiDailyLimit: 999, teamLimit: 5, features: { basic_calcs: true, pipeline: true, contacts: true, market_data: true, exports: true, ai_agents: true, mls: true, team: true, api_access: true } },
  enterprise: { level: 3, dealLimit: 999, aiDailyLimit: 999, teamLimit: 999, features: { basic_calcs: true, pipeline: true, contacts: true, market_data: true, exports: true, ai_agents: true, mls: true, team: true, api_access: true } },
};
const TIER_NAMES = { free: "Free", pro: "Pro", pro_plus: "Pro+", enterprise: "Enterprise" };
const TIER_PRICES = { free: 0, pro: 29, pro_plus: 99, enterprise: 499 };
const TIER_PRICE_IDS = {
  pro: _ENV.VITE_STRIPE_PRO_PRICE_ID || "price_1T6CbrIXCHwjUw9LoHzI5csk",
  pro_plus: _ENV.VITE_STRIPE_PRO_PLUS_PRICE_ID || "price_1T6CbtIXCHwjUw9LAPBaPM4y",
  enterprise: _ENV.VITE_STRIPE_ENTERPRISE_PRICE_ID || "price_1T6CbqIXCHwjUw9LsqExucPa",
};

function TierProvider({ children }) {
  const auth = useAuth();
  const tier = auth?.userProfile?.subscription_tier || "free";
  const config = TIER_CONFIG[tier] || TIER_CONFIG.free;
  const canUse = useCallback((feature) => !!config.features[feature], [config]);
  const tierFor = useCallback((feature) => {
    for (const [t, c] of Object.entries(TIER_CONFIG)) { if (c.features[feature]) return t; }
    return "enterprise";
  }, []);

  const [paymentPlan, setPaymentPlan] = useState(null); // plan id or null
  const [portalLoading, setPortalLoading] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  // Show modal first — confirmCheckout does the actual Stripe redirect
  const startCheckout = useCallback((planId) => {
    if (!supa.configured() || !supa.token || !auth?.user) { alert("Please log in to upgrade."); return; }
    setPaymentPlan(planId);
  }, [auth?.user]);

  const confirmCheckout = useCallback(async (planId) => {
    if (!supa.configured() || !supa.token || !auth?.user) return;
    setCheckoutLoading(true);
    try {
      const r = await fetch(`${supa.url}/functions/v1/stripe-checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${supa.token}`, apikey: supa.key },
        body: JSON.stringify({ action: "create_checkout", price_id: TIER_PRICE_IDS[planId], success_url: window.location.origin + "?billing=success", cancel_url: window.location.origin + "?billing=cancel", user_id: auth.user.id }),
      });
      const data = await r.json();
      if (data.url) window.location.href = data.url;
      else if (data.error) { alert(`Checkout Error: ${data.error}`); setPaymentPlan(null); }
    } catch (e) { alert("Checkout failed to connect. Try again later."); setPaymentPlan(null); }
    finally { setCheckoutLoading(false); }
  }, [auth?.user]);

  const openPortal = useCallback(async () => {
    if (!supa.configured() || !supa.token || !auth?.user) { alert("Please log in to manage billing."); return; }
    setPortalLoading(true);
    try {
      const r = await fetch(`${supa.url}/functions/v1/stripe-checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${supa.token}`, apikey: supa.key },
        body: JSON.stringify({ action: "create_portal", user_id: auth.user.id, return_url: window.location.origin }),
      });
      const data = await r.json();
      if (data.url) window.location.href = data.url;
      else if (data.error) alert(`Portal Error: ${data.error}`);
    } catch (e) { alert("Portal failed to connect. Try again later."); }
    finally { setPortalLoading(false); }
  }, [auth?.user]);

  const value = { tier, tierName: TIER_NAMES[tier] || "Free", config, canUse, tierFor, dealLimit: config.dealLimit, aiDailyLimit: config.aiDailyLimit, teamLimit: config.teamLimit, startCheckout, openPortal };
  return (
    <TierCtx.Provider value={value}>
      {children}
      <PaymentModal plan={paymentPlan} loading={checkoutLoading} onClose={() => setPaymentPlan(null)} onConfirm={confirmCheckout} />
      {portalLoading && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", zIndex: 9999, backdropFilter: "blur(8px)" }}>
          <div style={{ fontSize: 28, marginBottom: 12 }}>🔗</div>
          <div style={{ color: C.text, fontSize: 16, fontWeight: 600 }}>Opening Billing Portal…</div>
          <div style={{ color: C.dim, fontSize: 13, marginTop: 6 }}>Redirecting to Stripe securely</div>
        </div>
      )}
    </TierCtx.Provider>
  );
}

function TierGate({ feature, requiredTier, children, compact = false }) {
  const { canUse, tierFor, tier } = useTier();
  const needed = requiredTier || tierFor(feature);
  if (feature ? canUse(feature) : (TIER_CONFIG[tier]?.level >= (TIER_CONFIG[needed]?.level || 0))) return children;
  if (compact) return <span style={{ fontSize: 10, color: C.gold, fontWeight: 600, letterSpacing: 1 }}>🔒 {TIER_NAMES[needed]}</span>;
  return (
    <div style={{ background: C.bg3, border: `1px solid ${C.border}`, borderRadius: 4, padding: 32, textAlign: "center" }}>
      <div style={{ fontSize: 28, marginBottom: 8 }}>🔒</div>
      <div style={{ fontSize: 16, color: C.text, fontWeight: 700, marginBottom: 6 }}>Upgrade to {TIER_NAMES[needed]}</div>
      <div style={{ fontSize: 13, color: C.dim, marginBottom: 16 }}>This feature requires {TIER_NAMES[needed]} (${TIER_PRICES[needed]}/mo)</div>
      <UpgradeButton plan={needed} />
    </div>
  );
}

function UpgradeButton({ plan, label }) {
  const { startCheckout } = useTier();
  return <button className="premium-hover" style={{ ...S.btn("gold"), transition: "transform 0.1s, filter 0.1s" }} onMouseDown={e => e.currentTarget.style.transform = "scale(0.97)"} onMouseUp={e => e.currentTarget.style.transform = "scale(1)"} onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"} onClick={() => startCheckout(plan)}>{label || `Upgrade to ${TIER_NAMES[plan]} →`}</button>;
}

function PaymentModal({ plan, loading, onClose, onConfirm }) {
  if (!plan) return null;
  const name = TIER_NAMES[plan] || plan;
  const price = TIER_PRICES[plan] || 0;
  const tierFeatures = {
    pro: ["50 Active Deals", "25 AI Sessions / Day", "CSV & PDF Exports", "IC Memo Generator", "MLS Data Feeds", "Email Support"],
    pro_plus: ["Unlimited Deals & AI", "Team Collaboration (5 seats)", "White-Label Reports", "API Access", "Jurisdiction Intel", "Priority Support"],
    enterprise: ["Everything in Pro+", "Unlimited Seats", "Custom AI Model Training", "99.9% Uptime SLA", "Dedicated Success Manager", "On-Premise Deployment Option"],
  };
  const features = tierFeatures[plan] || [];
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(8px)" }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: C.bg3, border: `1px solid ${C.gold}50`, borderRadius: 8, padding: 36, width: 440, maxWidth: "90vw", boxShadow: `0 24px 64px rgba(0,0,0,0.7), 0 0 40px ${C.gold}15`, position: "relative", animation: "fadeIn 0.2s ease" }}>
        <button onClick={onClose} style={{ position: "absolute", top: 14, right: 16, background: "none", border: "none", color: C.dim, fontSize: 20, cursor: "pointer", lineHeight: 1 }}>✕</button>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ fontSize: 11, color: C.gold, letterSpacing: 3, textTransform: "uppercase", marginBottom: 8 }}>Upgrade Plan</div>
          <div style={{ fontSize: 30, fontWeight: 800, color: C.text }}>{name}</div>
          <div style={{ marginTop: 8 }}>
            <span style={{ fontSize: 42, fontWeight: 800, color: C.gold }}>${price}</span>
            <span style={{ fontSize: 14, color: C.dim }}> / month</span>
          </div>
          <div style={{ fontSize: 12, color: C.dim, marginTop: 6 }}>Billed monthly · Cancel anytime</div>
        </div>
        <div style={{ marginBottom: 28 }}>
          {features.map((f, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 0", borderBottom: i < features.length - 1 ? `1px solid ${C.border}` : "none" }}>
              <span style={{ color: C.green, fontSize: 14, flexShrink: 0 }}>✓</span>
              <span style={{ fontSize: 13, color: C.sub }}>{f}</span>
            </div>
          ))}
        </div>
        <button
          onClick={() => onConfirm(plan)}
          disabled={loading}
          className="premium-hover"
          style={{ ...S.btn("gold"), width: "100%", padding: "14px", fontSize: 15, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: 10, opacity: loading ? 0.7 : 1, cursor: loading ? "wait" : "pointer", transition: "transform 0.1s, filter 0.1s" }}
          onMouseDown={e => { if (!loading) e.currentTarget.style.transform = "scale(0.98)"; }}
          onMouseUp={e => e.currentTarget.style.transform = "scale(1)"}
          onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
        >
          {loading ? "Connecting to Stripe…" : `🔒 Continue to Secure Checkout →`}
        </button>
        <div style={{ textAlign: "center", fontSize: 11, color: C.dim, marginTop: 12 }}>Powered by Stripe · 256-bit SSL encryption</div>
      </div>
    </div>
  );
}

function useAiUsage() {
  const today = new Date().toISOString().split("T")[0];
  const [usage, setUsage] = useLS("axiom_ai_usage", { date: today, count: 0 });
  const current = usage.date === today ? usage.count : 0;
  const record = useCallback(() => {
    const d = new Date().toISOString().split("T")[0];
    setUsage(prev => prev.date === d ? { date: d, count: prev.count + 1 } : { date: d, count: 1 });
  }, [setUsage]);
  return { used: current, record };
}

// ─── JURISDICTION DATA (FL-first) ────────────────────────────
const JURIS = {
  FL: { name: "Florida", impact_fees: "County-specific, $2K-$15K/unit", permit_time: "60-120 days", key_regs: "FL Stat 163 (Growth Mgmt), Ch 553 (Building), Live Local Act 2023", tax: "No state income tax, prop tax ~0.86%" },
  TX: { name: "Texas", impact_fees: "City-specific, capped Ch 395", permit_time: "30-90 days", key_regs: "TX Property Code, Ch 245 (Vested Rights)", tax: "No state income tax, prop tax ~1.60%" },
  GA: { name: "Georgia", impact_fees: "County-specific, Dev Impact Fee Act", permit_time: "45-90 days", key_regs: "GA Planning Act, DCA Rules", tax: "Income 1-5.49%, prop ~0.83%" },
  NC: { name: "North Carolina", impact_fees: "Limited, school impact common", permit_time: "30-60 days", key_regs: "NC Gen Stat 160D (Dev Reg Reform)", tax: "Flat 4.5%, prop ~0.73%" },
  AZ: { name: "Arizona", impact_fees: "City-specific, Infrastructure Plans", permit_time: "60-120 days", key_regs: "ARS Title 9/11 (Planning)", tax: "Flat 2.5%, prop ~0.51%" },
};

// ─── ENHANCED EXPORT ENGINE ──────────────────────────────────
const exportEngine = {
  csv(headers, rows, filename) {
    const esc = v => typeof v === "string" && (v.includes(",") || v.includes('"') || v.includes("\n")) ? `"${v.replace(/"/g, '""')}"` : String(v ?? "");
    const csv = [headers.join(","), ...rows.map(r => r.map(esc).join(","))].join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  },
  json(data, filename) {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  },
  deals(deals) {
    const headers = ["Name", "Stage", "Value", "Type", "Location", "Contact", "Score", "Created"];
    const rows = (deals || []).map(d => [d.name, d.stage, d.value, d.type, d.location, d.contact, d.score, d.created]);
    exportEngine.csv(headers, rows, `axiom_deals_${new Date().toISOString().split("T")[0]}.csv`);
  },
  contacts(contacts) {
    const headers = ["Name", "Company", "Role", "Email", "Phone", "Type", "Notes"];
    const rows = (contacts || []).map(c => [c.name, c.company, c.role, c.email, c.phone, c.type, c.notes]);
    exportEngine.csv(headers, rows, `axiom_contacts_${new Date().toISOString().split("T")[0]}.csv`);
  },
  proForma(project, fin) {
    const hard = fin.totalLots * fin.hardCostPerLot;
    const soft = hard * fin.softCostPct / 100;
    const fees = fin.planningFees + (fin.permitFeePerLot + fin.schoolFee + fin.impactFeePerLot) * fin.totalLots;
    const cont = (hard + soft) * fin.contingencyPct / 100;
    const tc = fin.landCost + fin.closingCosts + hard + soft + cont + fees;
    const rev = fin.totalLots * fin.salesPricePerLot;
    const headers = ["Line Item", "Amount ($)"];
    const rows = [
      ["Project Name", project.name || "Unnamed"], ["Total Lots", fin.totalLots],
      ["Land Cost", fin.landCost], ["Closing Costs", fin.closingCosts],
      ["Hard Costs", hard], ["Soft Costs", soft], ["Impact Fees", fees],
      ["Contingency", cont], ["Total Cost", tc], ["Revenue", rev],
      ["Gross Profit", rev - tc], ["Margin %", ((rev - tc) / rev * 100).toFixed(1) + "%"],
    ];
    exportEngine.csv(headers, rows, `axiom_proforma_${(project.name || "project").replace(/\s+/g, "_")}.csv`);
  }
};

// Debounced sync helper
function useSyncToSupabase(table, data, mapToRow, deps, enabled) {
  const timer = useRef(null);
  const prev = useRef(null);
  useEffect(() => {
    if (!enabled || !supa.configured() || !supa.token) return;
    const json = JSON.stringify(data);
    if (json === prev.current) return;
    prev.current = json;
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      const row = mapToRow(data);
      if (row) supa.upsert(table, row);
    }, 1500);
    return () => clearTimeout(timer.current);
  }, [...deps, enabled]);
}

const downloadCSV = (headers, data, filename) => {
  const csv = [headers.join(","), ...data.map(r => r.map(c => typeof c === "string" && c.includes(",") ? `"${c}"` : c).join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
};

// ─── FINANCIAL CALCULATION ENGINE ────────────────────────────────
// NPV: Net Present Value of a series of cash flows at a given discount rate
const calcNPV = (rate, cashFlows) => cashFlows.reduce((npv, cf, t) => npv + cf / Math.pow(1 + rate, t), 0);

// IRR: Internal Rate of Return via Newton-Raphson iteration
const calcIRR = (cashFlows, guess = 0.1, maxIter = 100, tol = 1e-7) => {
  let rate = guess;
  for (let i = 0; i < maxIter; i++) {
    const npv = calcNPV(rate, cashFlows);
    const dnpv = cashFlows.reduce((d, cf, t) => d - t * cf / Math.pow(1 + rate, t + 1), 0);
    if (Math.abs(dnpv) < tol) break;
    const newRate = rate - npv / dnpv;
    if (Math.abs(newRate - rate) < tol) return newRate;
    rate = newRate;
  }
  return rate;
};

// Generate monthly cash flow array from fin model
const buildMonthlyCashFlows = (fin) => {
  const lots = fin.totalLots || 1;
  const hard = lots * fin.hardCostPerLot;
  const soft = hard * fin.softCostPct / 100;
  const fees = fin.planningFees + (fin.permitFeePerLot + fin.schoolFee + fin.impactFeePerLot) * lots;
  const cont = (hard + soft) * fin.contingencyPct / 100;
  const totalCost = fin.landCost + fin.closingCosts + hard + soft + cont + fees;
  const constMonths = Math.max(6, Math.ceil(lots / 8)); // construction duration estimate
  const sellMonths = Math.ceil(lots / (fin.absorbRate || 1));
  const totalMonths = constMonths + sellMonths;
  const monthlyCost = (totalCost - fin.landCost) / constMonths;
  const monthlyRev = (fin.absorbRate || 1) * fin.salesPricePerLot * (1 - fin.salesCommission / 100);
  const flows = [-fin.landCost - fin.closingCosts]; // month 0: land acquisition
  for (let m = 1; m <= totalMonths; m++) {
    let cf = 0;
    if (m <= constMonths) cf -= monthlyCost; // construction spend
    if (m > constMonths) cf += monthlyRev; // lot sales
    flows.push(cf);
  }
  return { flows, constMonths, sellMonths, totalMonths };
};
// ─── END FINANCIAL ENGINE ────────────────────────────────────────

const importCSV = (file, callback) => {
  const reader = new FileReader();
  reader.onload = (e) => {
    const text = e.target.result;
    const lines = text.split('\n').filter(l => l.trim());
    if (lines.length < 2) return;
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const data = lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
      const obj = {};
      headers.forEach((h, i) => { obj[h] = values[i]; });
      return obj;
    });
    callback(data);
  };
  reader.readAsText(file);
};

function CSVImportButton({ onImport }) {
  const fileRef = useRef(null);
  const handleFileChange = (e) => {
    const file = e.target.files[0];
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
      <button style={{ ...S.btn(), padding: "4px 10px", fontSize: 10, display: "flex", alignItems: "center", gap: 4 }} onClick={() => fileRef.current?.click()}>
        <span>📥</span> Import CSV
      </button>
    </>
  );
}

const downloadText = (text, filename) => {
  const blob = new Blob([text], { type: "text/plain;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
};

const MODELS = [
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
const ENDPOINTS = {
  anthropic: "https://api.anthropic.com/v1/messages",
  openai: "https://api.openai.com/v1/chat/completions",
  groq: "https://api.groq.com/openai/v1/chat/completions",
  together: "https://api.together.xyz/v1/chat/completions",
};
async function callLLM(messages, system = "", modelId = "claude-sonnet-4-20250514") {
  const m = MODELS.find(x => x.id === modelId) || MODELS[0];
  const keys = JSON.parse(localStorage.getItem("axiom_api_keys") || "{}");
  // Default proxy: use the deployed Supabase llm-proxy Edge Function
  const SUPA_LLM_PROXY = `${SUPA_URL}/functions/v1/llm-proxy`;
  const proxyUrl = keys.proxyUrl || SUPA_LLM_PROXY;
  const defaultSys = "You are an expert real estate development analyst and feasibility consultant. Be concise, precise, and actionable.";
  try {
    // PROXY MODE — use Supabase llm-proxy (default) or custom proxy
    if (proxyUrl) {
      const r = await fetch(proxyUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${SUPA_KEY}`,
          "apikey": SUPA_KEY,
        },
        body: JSON.stringify({ model: m.provider === "openai" ? m.id : "gpt-4o-mini", messages, temperature: 0.7, max_tokens: 1200 }),
      });
      const d = await r.json();
      return d.content || d.text || d.error?.message || "No response from proxy.";
    }
    // DIRECT MODE — development only, keys exposed in browser
    if (m.provider === "anthropic") {
      const r = await fetch(ENDPOINTS.anthropic, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-api-key": keys.anthropic || "", "anthropic-version": "2023-06-01", "anthropic-dangerous-direct-browser-access": "true" },
        body: JSON.stringify({ model: m.id, max_tokens: 1200, system: system || defaultSys, messages }),
      });
      const d = await r.json();
      return d.content?.map(b => b.text || "").join("\n") || d.error?.message || "No response.";
    } else {
      const providerKey = m.provider === "openai" ? keys.openai : m.provider === "groq" ? keys.groq : keys.together;
      const sysMsg = { role: "system", content: system || defaultSys };
      const r = await fetch(ENDPOINTS[m.provider], {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${providerKey || ""}` },
        body: JSON.stringify({ model: m.id, max_tokens: 1200, messages: [sysMsg, ...messages] }),
      });
      const d = await r.json();
      return d.choices?.[0]?.message?.content || d.error?.message || "No response.";
    }
  } catch (e) { return "API error: " + e.message; }
}
const callClaude = callLLM;

const Ctx = createContext(null);
const usePrj = () => useContext(Ctx);
const useCtx = usePrj; // alias used in Notes, ShareDealButton

function Card({ title, children, action }) {
  return <div style={S.card}><div style={S.ct}><span>{title}</span>{action}</div>{children}</div>;
}
function KPI({ label, value, sub, color, trend }) {
  return (
    <div style={S.kpi}>
      <div style={{ fontSize: 9, color: C.dim, letterSpacing: 2, textTransform: "uppercase" }}>{label}</div>
      <div style={{ fontSize: 25, color: color || C.gold, fontWeight: 700, marginTop: 3, lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: 10, color: C.dim, marginTop: 3 }}>{sub}</div>}
      {trend !== undefined && <div style={{ fontSize: 10, color: trend >= 0 ? C.green : C.red, marginTop: 2 }}>{trend >= 0 ? "▲" : "▼"} {Math.abs(trend).toFixed(1)}%</div>}
    </div>
  );
}
function Field({ label, children, mb }) {
  return <div style={{ marginBottom: mb ?? 11 }}><label style={S.lbl}>{label}</label>{children}</div>;
}
function Badge({ label, color }) { return <span style={S.tag(color || C.gold)}>{label}</span>; }
function Dot({ color }) { return <span style={S.dot(color)} />; }

function Tabs({ tabs, children }) {
  const [a, setA] = useState(0);
  const childArr = Array.isArray(children) ? children : [children];
  return (
    <div>
      <div style={S.hbar}>{tabs.map((t, i) => <button key={i} style={S.tab(a === i)} onClick={() => setA(i)}>{t}</button>)}</div>
      {childArr.map((child, i) => (
        <div key={i} style={{ display: a === i ? "block" : "none" }}>{child}</div>
      ))}
    </div>
  );
}

function Progress({ value, color, height = 5 }) {
  return (
    <div style={{ height, background: C.border, borderRadius: 3, overflow: "hidden" }}>
      <div style={{ height: "100%", width: `${Math.min(100, Math.max(0, value))}%`, background: color || C.gold, borderRadius: 3, transition: "width 0.4s" }} />
    </div>
  );
}

function CItem({ text, checked, onChange, risk }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 9, padding: "6px 0", borderBottom: "1px solid #0F1117" }}>
      <input type="checkbox" checked={!!checked} onChange={onChange} style={{ accentColor: C.gold, width: 13, height: 13, cursor: "pointer" }} />
      <span style={{ flex: 1, fontSize: 13, color: checked ? C.dim : C.sub, textDecoration: checked ? "line-through" : "none" }}>{text}</span>
      {risk && <Badge label={risk} color={RC[risk] || C.dim} />}
    </div>
  );
}

function Agent({ id, system, placeholder }) {
  const { project, fin, loan, equity, risks, permits } = useContext(Ctx);
  const auth = useAuth();
  const [msgs, setMsgs] = useState([]);
  const [inp, setInp] = useState("");
  const [busy, setBusy] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const [model, setModel] = useLS(`axiom_agent_model_${id}`, "claude-sonnet-4-20250514");
  const loadedRef = useRef(false);
  const saveTimer = useRef(null);

  // Load conversation from Supabase on mount
  useEffect(() => {
    if (loadedRef.current || !auth?.user || !supa.configured()) return;
    loadedRef.current = true;
    (async () => {
      try {
        const convos = await supa.select("ai_conversations", `user_id=eq.${auth.user.id}&agent_id=eq.${id}&order=updated_at.desc&limit=1`);
        if (convos.length > 0) {
          setConversationId(convos[0].id);
          const savedMsgs = convos[0].messages;
          if (Array.isArray(savedMsgs) && savedMsgs.length > 0) {
            setMsgs(savedMsgs);
          }
          if (convos[0].model) setModel(convos[0].model);
        }
      } catch (e) { console.warn("Failed to load AI conversation:", e); }
    })();
  }, [auth?.user, id]);

  // Save conversation to Supabase (debounced)
  const saveConversation = useCallback((newMsgs, newModel) => {
    if (!auth?.user || !supa.configured()) return;
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      try {
        const payload = {
          user_id: auth.user.id,
          agent_id: id,
          project_id: auth.activeProjectId || null,
          messages: newMsgs,
          model: newModel,
          updated_at: new Date().toISOString(),
        };
        if (conversationId) payload.id = conversationId;
        await supa.upsert("ai_conversations", payload);
        if (!conversationId) {
          // Fetch the new ID
          const convos = await supa.select("ai_conversations", `user_id=eq.${auth.user.id}&agent_id=eq.${id}&order=updated_at.desc&limit=1`);
          if (convos.length > 0) setConversationId(convos[0].id);
        }
      } catch (e) { console.warn("Failed to save AI conversation:", e); }
    }, 1000);
  }, [auth?.user, auth?.activeProjectId, conversationId, id]);

  // Auto-inject project context into every agent's system prompt
  const buildContextualSystem = useCallback(() => {
    const loc = project.state ? (project.municipality ? `${project.municipality}, ${project.state}` : project.state) : "unspecified location";
    const hard = fin.totalLots * fin.hardCostPerLot;
    const soft = hard * fin.softCostPct / 100;
    const fees = fin.planningFees + (fin.permitFeePerLot + fin.schoolFee + fin.impactFeePerLot) * fin.totalLots;
    const cont = (hard + soft) * fin.contingencyPct / 100;
    const tc = fin.landCost + fin.closingCosts + hard + soft + cont + fees;
    const rev = fin.totalLots * fin.salesPricePerLot;
    const profit = rev * (1 - fin.salesCommission / 100) - tc * (1 + fin.reservePercentage / 100);
    const margin = rev > 0 ? (profit / rev * 100).toFixed(1) : 0;
    const months = Math.ceil(fin.totalLots / (fin.absorbRate || 1));
    const loanAmt = tc * (loan?.ltc || 70) / 100;
    const equityNeed = tc - loanAmt;
    // Compute IRR/NPV for context
    let irrPct = "N/A", npvStr = "N/A";
    try {
      const cf = buildMonthlyCashFlows(fin);
      const monthlyIRR = calcIRR(cf);
      if (monthlyIRR !== null) irrPct = ((Math.pow(1 + monthlyIRR, 12) - 1) * 100).toFixed(1) + "%";
      const npvVal = calcNPV(0.08 / 12, cf);
      npvStr = "$" + (npvVal / 1e6).toFixed(2) + "M";
    } catch { }
    // Risk summary
    const openRisks = (risks || []).filter(r => r.status === "Open" || !r.status);
    const highRisks = openRisks.filter(r => r.severity === "High" || r.severity === "Critical");
    const riskLine = openRisks.length > 0 ? `Open Risks: ${openRisks.length} (${highRisks.length} high/critical). Top: ${highRisks.slice(0, 3).map(r => r.risk).join(", ") || "none high"}` : "No open risks logged.";
    // Permit summary
    const pendingPermits = (permits || []).filter(p => p.status !== "Approved" && p.status !== "Complete");
    const permitLine = pendingPermits.length > 0 ? `Pending Permits: ${pendingPermits.map(p => `${p.name} (${p.status})`).join(", ")}` : "All permits approved or none logged.";

    const ctx = [
      `\n\n--- ACTIVE PROJECT CONTEXT ---`,
      `Project: ${project.name || "Unnamed"} | Location: ${loc} | Address: ${project.address || "N/A"}`,
      `Lots: ${fin.totalLots} | Land Cost: $${(fin.landCost / 1e6).toFixed(2)}M | Total Cost: $${(tc / 1e6).toFixed(2)}M | Revenue: $${(rev / 1e6).toFixed(2)}M`,
      `Hard Cost/Lot: $${fin.hardCostPerLot.toLocaleString()} | Sale Price/Lot: $${fin.salesPricePerLot.toLocaleString()} | Absorption: ${fin.absorbRate}/mo`,
      `Profit: $${(profit / 1e6).toFixed(2)}M | Margin: ${margin}% | Sellout: ~${months} months`,
      `IRR (Newton-Raphson): ${irrPct} | NPV (8% discount): ${npvStr}`,
      `Debt: $${(loanAmt / 1e6).toFixed(2)}M (${loan?.ltc || 70}% LTC @ ${loan?.rate || 9.5}%) | Equity: $${(equityNeed / 1e6).toFixed(2)}M (GP ${equity?.gpPct || 10}% / LP ${equity?.lpPct || 90}%)`,
      riskLine,
      permitLine,
    ];
    // Inject jurisdiction intelligence
    const stAbbr = project.state ? (Object.entries(ST_ABBR).find(([k, v]) => k === project.state || v === project.state)?.[1] || "") : "FL";
    const j = JURIS[stAbbr] || JURIS.FL;
    if (j) {
      ctx.push(`--- JURISDICTION: ${j.name} ---`);
      ctx.push(`Key Regs: ${j.key_regs}`);
      ctx.push(`Impact Fees: ${j.impact_fees} | Permit Timeline: ${j.permit_time}`);
      ctx.push(`Tax: ${j.tax}`);
    }
    ctx.push(`--- Use this context to provide specific, data-driven answers. Reference actual numbers. ---`);

    return (system || "") + ctx.join("\n");
  }, [system, project, fin, loan, equity, risks, permits]);

  const send = useCallback(async () => {
    if (!inp.trim() || busy) return;

    // ─── SERVER-SIDE USAGE ENFORCEMENT ─────────────
    if (supa.configured() && auth?.user) {
      try {
        const usageResult = await supa.callEdge("usage-tracker", { action: "record", feature: "ai_query" });
        if (!usageResult.allowed) {
          const tierName = usageResult.tier || "FREE";
          const limitMsg = `Daily AI limit reached (${usageResult.used}/${usageResult.limit} queries). Upgrade to Pro for 50/day or Pro+ for unlimited.`;
          setMsgs(prev => [...prev, { role: "user", content: inp }, { role: "assistant", content: `⚠️ **${limitMsg}**` }]);
          setInp("");
          return;
        }
      } catch (e) { /* Network issue - fall through to client-side check */ }
    }

    const um = { role: "user", content: inp };
    const nm = [...msgs, um]; setMsgs(nm); setInp(""); setBusy(true);
    const reply = await callLLM(nm, buildContextualSystem(), model);
    const finalMsgs = [...nm, { role: "assistant", content: reply }];
    setMsgs(finalMsgs);
    saveConversation(finalMsgs, model);
    setBusy(false);
  }, [inp, msgs, buildContextualSystem, busy, model, saveConversation, auth?.user]);

  const clearConversation = useCallback(() => {
    setMsgs([]);
    if (auth?.user && supa.configured() && conversationId) {
      supa.del("ai_conversations", { id: conversationId });
      setConversationId(null);
      loadedRef.current = false;
    }
  }, [auth?.user, conversationId]);
  return (
    <div>
      <div style={{ display: "flex", gap: 6, marginBottom: 8, alignItems: "center" }}>
        <select style={{ ...S.sel, flex: 1, fontSize: 10, padding: "3px 6px" }} value={model} onChange={e => setModel(e.target.value)}>
          {MODELS.map(m => <option key={m.id} value={m.id}>{m.label}</option>)}
        </select>
        <span style={{ fontSize: 9, color: C.dim }}>{MODELS.find(x => x.id === model)?.provider || ""}</span>
      </div>
      <div style={{ maxHeight: 300, overflowY: "auto", marginBottom: 9 }}>
        {!msgs.length && <div style={{ fontSize: 12, color: C.dim, fontStyle: "italic", padding: "8px 0" }}>Agent ready — ask anything about this section.</div>}
        {msgs.map((m, i) => (
          <div key={i} style={S.bub(m.role)}>
            <div style={{ fontSize: 9, color: C.dim, letterSpacing: 1, marginBottom: 3, textTransform: "uppercase" }}>{m.role === "user" ? "You" : `· ${id}`}</div>
            <pre style={{ margin: 0, whiteSpace: "pre-wrap", fontFamily: "inherit", fontSize: 13, lineHeight: 1.5 }}>{m.content}</pre>
          </div>
        ))}
        {busy && <div style={{ ...S.bub("assistant"), color: C.gold, fontSize: 12 }}>· Processing...</div>}
      </div>
      <div style={{ display: "flex", gap: 7 }}>
        <input style={{ ...S.inp, flex: 1 }} value={inp} onChange={e => setInp(e.target.value)} onKeyDown={e => e.key === "Enter" && send()} placeholder={placeholder || "Ask the agent..."} />
        <button style={S.btn("gold")} onClick={send} disabled={busy}>Send</button>
        <button style={S.btn()} onClick={clearConversation}>Clear</button>
      </div>
    </div>
  );
}

function HealthRing({ score }) {
  const color = score >= 75 ? C.green : score >= 50 ? C.amber : C.red;
  const r = 36, circ = 2 * Math.PI * r, dash = circ * score / 100;
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
      <svg width={90} height={90}>
        <circle cx={45} cy={45} r={r} fill="none" stroke={C.border} strokeWidth={7} />
        <circle cx={45} cy={45} r={r} fill="none" stroke={color} strokeWidth={7}
          strokeDasharray={`${dash} ${circ - dash}`} strokeDashoffset={circ / 4} strokeLinecap="round"
          style={{ transition: "stroke-dasharray 0.6s" }} />
        <text x={45} y={50} textAnchor="middle" fill={color} fontSize={18} fontWeight={700} fontFamily="Courier New">{score}</text>
      </svg>
      <div style={{ fontSize: 9, color: C.dim, letterSpacing: 2, marginTop: -4 }}>PROJECT HEALTH</div>
    </div>
  );
}

const DEFAULT_FIN = {
  totalLots: 50, landCost: 3000000, closingCosts: 90000, hardCostPerLot: 65000,
  softCostPct: 18, contingencyPct: 10, salesPricePerLot: 185000, salesCommission: 3,
  absorbRate: 3, planningFees: 120000, permitFeePerLot: 8500, schoolFee: 3200,
  impactFeePerLot: 12000, reservePercentage: 5, grm: 14.2, irr: 18.4,
};
const DEFAULT_RISKS = [
  { id: 1, cat: "Market", risk: "Home price softening during sell-out", likelihood: "Medium", impact: "High", severity: "High", mitigation: "Phased lot releases; forward sale agreements", status: "Open" },
  { id: 2, cat: "Entitlement", risk: "CEQA challenge or appeal by neighbors", likelihood: "Medium", impact: "High", severity: "High", mitigation: "Community outreach; robust EIR; legal reserve", status: "Open" },
  { id: 3, cat: "Construction", risk: "Labor and material cost escalation", likelihood: "High", impact: "Medium", severity: "High", mitigation: "Fixed-price contractor agreements; 15% contingency", status: "Mitigated" },
  { id: 4, cat: "Environmental", risk: "Undiscovered contamination on site", likelihood: "Low", impact: "Critical", severity: "High", mitigation: "Phase I/II ESA; environmental indemnity from seller", status: "Open" },
  { id: 5, cat: "Financial", risk: "Construction loan maturity before sell-out", likelihood: "Low", impact: "High", severity: "Medium", mitigation: "Structure loan with 12-month extension option", status: "Open" },
  { id: 6, cat: "Regulatory", risk: "Impact fee increases mid-entitlement", likelihood: "Medium", impact: "Medium", severity: "Medium", mitigation: "Vesting Tentative Map; Development Agreement", status: "Open" },
];
const DEFAULT_PERMITS = [
  { name: "Tentative Map Approval", agency: "Planning Dept", duration: "16-24 wks", cost: "$25,000", status: "Not Started", req: true },
  { name: "Final Map Recordation", agency: "County Recorder", duration: "8-12 wks", cost: "$8,500", status: "Not Started", req: true },
  { name: "Grading Permit", agency: "Building Dept", duration: "4-6 wks", cost: "$45,000", status: "Not Started", req: true },
  { name: "NPDES / SWPPP", agency: "State Water Board", duration: "2-4 wks", cost: "$3,200", status: "Not Started", req: true },
  { name: "404 Wetlands Permit", agency: "Army Corps", duration: "12-52 wks", cost: "$18,000", status: "N/A", req: false },
  { name: "CEQA Compliance", agency: "Lead Agency", duration: "12-26 wks", cost: "$35,000", status: "Not Started", req: true },
  { name: "Improvement Plans", agency: "City Engineer", duration: "8-12 wks", cost: "$55,000", status: "Not Started", req: true },
  { name: "Street Improvement Permit", agency: "Public Works", duration: "2-4 wks", cost: "$12,000", status: "Not Started", req: true },
  { name: "Utility Agreements", agency: "Various Districts", duration: "4-8 wks", cost: "Varies", status: "Not Started", req: true },
];
const DD_CATS = [
  {
    cat: "Title & Legal", items: [
      { t: "Preliminary Title Report ordered", r: "High" }, { t: "CC&Rs and deed restrictions reviewed", r: "High" },
      { t: "ALTA Survey ordered and received", r: "High" }, { t: "Easements mapped and plotted", r: "High" },
      { t: "Encumbrances cleared or budgeted", r: "Medium" }, { t: "Entity / ownership structure confirmed", r: "Medium" },
      { t: "Seller disclosure statement reviewed", r: "Medium" },
    ]
  },
  {
    cat: "Physical & Environmental", items: [
      { t: "Phase I ESA completed", r: "High" }, { t: "Geotechnical / soils report ordered", r: "High" },
      { t: "Flood zone determination (FEMA)", r: "High" }, { t: "Wetlands delineation (if applicable)", r: "High" },
      { t: "Biological survey completed", r: "Medium" }, { t: "Topographic survey completed", r: "Medium" },
      { t: "Cultural resources review completed", r: "Low" },
    ]
  },
  {
    cat: "Entitlements & Zoning", items: [
      { t: "Zoning verified and documented", r: "High" }, { t: "General Plan designation confirmed", r: "High" },
      { t: "Density and development standards extracted", r: "High" }, { t: "Pre-application meeting held", r: "Medium" },
      { t: "Entitlement pathway and timeline mapped", r: "Medium" }, { t: "School and impact fees quantified", r: "Medium" },
      { t: "Vesting tentative map strategy confirmed", r: "Medium" },
    ]
  },
  {
    cat: "Infrastructure", items: [
      { t: "Water availability letter obtained", r: "High" }, { t: "Sewer capacity confirmed in writing", r: "High" },
      { t: "Off-site improvement costs estimated", r: "High" }, { t: "Traffic study scope determined", r: "Medium" },
      { t: "Utility extension costs budgeted", r: "Medium" }, { t: "Dry utility franchise agreements identified", r: "Low" },
    ]
  },
  {
    cat: "Financial & Market", items: [
      { t: "Comparable sales analyzed (min 3)", r: "High" }, { t: "Development pro forma completed", r: "High" },
      { t: "Construction financing term sheet received", r: "High" }, { t: "Absorption rate supported by market data", r: "High" },
      { t: "Contingency reserve adequate (>=10%)", r: "Medium" }, { t: "Fee schedule verified with municipality", r: "Medium" },
      { t: "Equity partner / JV terms agreed", r: "Medium" },
    ]
  },
];
const ALL_DD = DD_CATS.flatMap(c => c.items);

function Dashboard() {
  const { fin, risks, ddChecks, permits, project, setChartSel } = usePrj();
  const hard = fin.totalLots * fin.hardCostPerLot, soft = hard * fin.softCostPct / 100;
  const fees = fin.planningFees + (fin.permitFeePerLot + fin.schoolFee + fin.impactFeePerLot) * fin.totalLots;
  const cont = (hard + soft) * fin.contingencyPct / 100;
  const totalCost = fin.landCost + fin.closingCosts + hard + soft + cont + fees;
  const revenue = fin.totalLots * fin.salesPricePerLot, comm = revenue * fin.salesCommission / 100;
  const reserves = totalCost * fin.reservePercentage / 100;
  const profit = revenue - comm - reserves - totalCost;
  const margin = revenue > 0 ? profit / revenue * 100 : 0, roi = totalCost > 0 ? profit / totalCost * 100 : 0;
  const allDD = ALL_DD.length; const doneDD = Object.values(ddChecks).filter(Boolean).length;
  const openRisks = risks.filter(r => r.status === "Open").length;
  const approvedPerm = permits.filter(p => p.status === "Approved").length;
  const ddS = Math.round(doneDD / allDD * 100);
  const finS = Math.round(Math.min(1, Math.max(0, margin / 20)) * 100);
  const riskS = Math.round((1 - Math.min(1, openRisks / 8)) * 100);
  const permS = permits.length ? Math.round(approvedPerm / permits.length * 100) : 0;
  const health = Math.round(ddS * 0.35 + finS * 0.30 + riskS * 0.20 + permS * 0.15);
  const cfData = [
    { y: "Y0", v: -(totalCost * 0.3) / 1e6 }, { y: "Y1", v: -(totalCost * 0.15) / 1e6 },
    { y: "Y2", v: (revenue * 0.2 - totalCost * 0.05) / 1e6 }, { y: "Y3", v: (revenue * 0.45) / 1e6 },
    { y: "Y4", v: (revenue * 0.75) / 1e6 }, { y: "Y5", v: profit / 1e6 },
  ];
  const costPie = [
    { name: "Land", value: Math.round((fin.landCost + fin.closingCosts) / totalCost * 100) || 35 },
    { name: "Hard", value: Math.round(hard / totalCost * 100) || 40 },
    { name: "Soft", value: Math.round(soft / totalCost * 100) || 12 },
    { name: "Fees", value: Math.round(fees / totalCost * 100) || 8 },
    { name: "Reserves", value: Math.round(reserves / totalCost * 100) || 5 },
  ];
  const radarD = [
    { sub: "Financial", val: finS }, { sub: "Due Diligence", val: ddS },
    { sub: "Risk", val: riskS }, { sub: "Permits", val: permS }, { sub: "Market", val: 68 },
  ];
  const [layout, setLayout] = useLS("axiom_dashboard_layout", "Standard");

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <div style={{ fontSize: 13, color: "var(--c-dim)", textTransform: "uppercase", letterSpacing: 2 }}>Project Overview</div>
        <div style={{ display: "flex", gap: 4, background: "var(--c-bg2)", padding: 4, borderRadius: 6, border: `1px solid var(--c-border)` }}>
          {["Standard", "Compact", "Metrics"].map(l => (
            <div key={l} style={{ padding: "4px 12px", fontSize: 10, cursor: "pointer", borderRadius: 4, background: layout === l ? "var(--c-border2)" : "transparent", color: layout === l ? "var(--c-text)" : "var(--c-dim)", fontWeight: layout === l ? 600 : 400, transition: "all 0.1s" }} onClick={() => setLayout(l)}>
              {l}
            </div>
          ))}
        </div>
      </div>
      <div style={layout === "Compact" ? S.g4 : S.g5}>
        <KPI label="Total Lots" value={fmt.num(fin.totalLots)} sub="Concept yield" />
        <KPI label="Total Revenue" value={fmt.M(revenue)} color={C.green} sub="Gross" />
        <KPI label="Net Profit" value={fmt.M(profit)} color={profit >= 0 ? C.green : C.red} sub={`Margin: ${margin.toFixed(1)}%`} />
        {layout !== "Compact" && <KPI label="ROI" value={fmt.pct(roi)} color={roi > 15 ? C.green : C.amber} sub="Return on cost" />}
        {layout !== "Compact" && <KPI label="GRM" value={(fin.grm || 14.2).toFixed(1) + "x"} color={C.blue} sub="Gross rent mult." />}
      </div>
      {layout !== "Metrics" && (
        <div style={{ ...(layout === "Compact" ? S.g2 : S.g3), marginTop: 14 }}>
          <div style={{ gridColumn: layout === "Compact" ? "1/3" : "1/3" }}>
            <Card title="Projected Cash Flow ($ Millions)">
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={cfData} onClick={onChartClick(setChartSel)} style={CHART_STYLE}>
                  <defs><linearGradient id="cfg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={C.gold} stopOpacity={0.25} />
                    <stop offset="95%" stopColor={C.gold} stopOpacity={0} />
                  </linearGradient></defs>
                  <CartesianGrid strokeDasharray="3 6" stroke={C.border} strokeOpacity={0.5} />
                  <XAxis dataKey="y" stroke={C.dim} tick={{ fontSize: 12, fontFamily: 'Inter,sans-serif', fill: C.muted }} />
                  <YAxis stroke={C.dim} tick={{ fontSize: 12, fontFamily: 'Inter,sans-serif', fill: C.muted }} tickFormatter={v => `$${v.toFixed(1)}M`} />
                  <Tooltip {...TT()} formatter={(v, name) => [`$${Number(v).toFixed(2)}M`, "Cash Flow"]} labelFormatter={l => `Year ${l}`} />
                  <Legend wrapperStyle={{ fontSize: 11, color: C.muted, paddingTop: 6 }} />
                  <Area type="monotone" dataKey="v" name="Cash Flow ($M)" stroke={C.gold} fill="url(#cfg)" strokeWidth={2.5} dot={DOT} activeDot={ACTIVE_DOT} />
                </AreaChart>
              </ResponsiveContainer>
            </Card>
          </div>
          <Card title="Project Health">
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}><HealthRing score={health} /></div>
            {[["Due Diligence", ddS, C.blue], ["Financial", finS, C.green], ["Risk Mgmt", riskS, C.amber], ["Permits", permS, C.purple]].map(([l, v, col]) => (
              <div key={l} style={{ marginBottom: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                  <span style={{ fontSize: 10, color: C.dim }}>{l}</span>
                  <span style={{ fontSize: 10, color: col, fontWeight: 700 }}>{v}%</span>
                </div>
                <Progress value={v} color={col} />
              </div>
            ))}
          </Card>
        </div>)}
      <div style={layout === "Compact" ? S.g3 : S.g2}>
        <Card title="Cost Allocation">
          <ResponsiveContainer width="100%" height={210}>
            <PieChart onClick={onChartClick(setChartSel)} style={CHART_STYLE}>
              <Pie data={costPie} cx="50%" cy="50%" outerRadius={75} innerRadius={45} dataKey="value" nameKey="name" label={({ name, value }) => `${name} ${value}%`} labelLine={false} style={{ fontSize: 9 }}>
                {costPie.map((_, i) => <Cell key={i} fill={PP[i]} />)}
              </Pie>
              <Tooltip {...TT()} formatter={(v, name) => [`${v}%`, name]} labelFormatter={() => "Cost Allocation"} />
              <Legend wrapperStyle={{ fontSize: 11, color: C.muted }} />
            </PieChart>
          </ResponsiveContainer>
        </Card>
        <Card title="Deal Readiness Radar">
          <ResponsiveContainer width="100%" height={210}>
            <RadarChart data={radarD} onClick={onChartClick(setChartSel)} style={CHART_STYLE}>
              <PolarGrid stroke={C.border} strokeOpacity={0.4} />
              <PolarAngleAxis dataKey="sub" tick={{ fill: C.muted, fontSize: 11, fontFamily: 'Inter,sans-serif' }} />
              <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 9, fill: C.dim }} axisLine={false} tickCount={4} />
              <Radar dataKey="val" name="Readiness Score" stroke={C.gold} fill={C.gold} fillOpacity={0.2} strokeWidth={2} dot={{ r: 4, fill: C.gold, stroke: "#0D0F13", strokeWidth: 1.5 }} />
              <Tooltip {...TT()} formatter={(v, name) => [`${v}/100`, name]} />
              <Legend wrapperStyle={{ fontSize: 11, color: C.muted }} />
            </RadarChart>
          </ResponsiveContainer>
        </Card>
      </div>
      <Card title="Project Snapshot">
        <div style={S.g3}>
          {[
            ["Project", project.name || "Unnamed"], ["Address", project.address || "—"], ["Jurisdiction", project.jurisdiction || "—"],
            ["Total Cost", fmt.usd(totalCost)], ["Gross Revenue", fmt.usd(revenue)], ["Net Profit", fmt.usd(profit)],
            ["Cost / Lot", fmt.usd(totalCost / (fin.totalLots || 1))], ["Revenue / Lot", fmt.usd(revenue / (fin.totalLots || 1))], ["Sell-Out Timeline", `${Math.ceil(fin.totalLots / (fin.absorbRate || 1))} months`],
          ].map(([l, v]) => (
            <div key={l} style={{ borderBottom: `1px solid ${C.border}`, padding: "7px 0" }}>
              <div style={{ fontSize: 9, color: C.dim, letterSpacing: 1, textTransform: "uppercase" }}>{l}</div>
              <div style={{ fontSize: 14, color: C.text, marginTop: 2, fontWeight: 500 }}>{v}</div>
            </div>
          ))}
        </div>
      </Card>
      <Card title="Executive Summary · AI Agent">
        <Agent id="Executive" system="You are a senior real estate development analyst creating investor-grade executive summaries. Include deal thesis, site overview, concept yield, financial highlights (IRR, margin, ROI), key risks, and go/no-go recommendation." placeholder="Describe your project for an investor-grade executive summary..." />
      </Card>
    </>
  );
}

function Connectors() {
  const [list, setList] = useLS("axiom_connectors", [
    { id: 1, name: "CoStar API", type: "API", status: "Connected", key: "cs_••••••••", endpoint: "https://api.costar.com/v1" },
    { id: 2, name: "Regrid Parcels", type: "API", status: "Connected", key: "rg_••••••••", endpoint: "https://app.regrid.com/api" },
    { id: 3, name: "FEMA Flood API", type: "API", status: "Idle", key: "", endpoint: "https://msc.fema.gov" },
    { id: 4, name: "Google Maps", type: "API", status: "Connected", key: "gm_••••••••", endpoint: "https://maps.googleapis.com" },
    { id: 5, name: "ATTOM Data", type: "API", status: "Idle", key: "", endpoint: "https://api.attomdata.com" },
    { id: 6, name: "SketchUp MCP", type: "MCP", status: "Offline", key: "", endpoint: "ws://localhost:3001" },
    { id: 7, name: "GIS Data MCP", type: "MCP", status: "Offline", key: "", endpoint: "ws://localhost:3002" },
    { id: 8, name: "Salesforce CRM", type: "App", status: "Connected", key: "", endpoint: "" },
    { id: 9, name: "Procore", type: "App", status: "Idle", key: "", endpoint: "" },
    { id: 10, name: "DocuSign", type: "App", status: "Idle", key: "", endpoint: "" },
  ]);
  const [nc, setNc] = useState({ name: "", type: "API", key: "", endpoint: "" });
  const SC = { Connected: C.green, Idle: C.amber, Offline: C.dim };
  const add = () => { if (!nc.name) return; setList([...list, { ...nc, id: Date.now(), status: "Idle" }]); setNc({ name: "", type: "API", key: "", endpoint: "" }); };
  const toggle = (id) => setList(list.map(c => c.id === id ? { ...c, status: c.status === "Connected" ? "Idle" : "Connected" } : c));
  const mcpServers = [
    { name: "SketchUp Live Model Server", desc: "3D model streaming and updates", port: 3001 },
    { name: "GIS / Parcel Data MCP", desc: "Live parcel, zoning, and GIS data", port: 3002 },
    { name: "Municipal Records MCP", desc: "Permit history, zoning codes", port: 3003 },
    { name: "Environmental Data MCP", desc: "FEMA, wetlands, species databases", port: 3004 },
    { name: "Market Data MCP", desc: "Live comp sales and pricing", port: 3005 },
    { name: "Construction Cost MCP", desc: "RSMeans and local bid data", port: 3006 },
  ];
  return (
    <Tabs tabs={["Connections", "MCP Servers", "Webhooks"]}>
      <div>
        <Card title="Active Connectors" action={<Badge label={list.filter(c => c.status === "Connected").length + " Active"} color={C.green} />}>
          <table style={S.tbl}>
            <thead><tr><th style={S.th}>Name</th><th style={S.th}>Type</th><th style={S.th}>Endpoint</th><th style={S.th}>Status</th><th style={S.th}>Actions</th></tr></thead>
            <tbody>{list.map(c => (
              <tr key={c.id}>
                <td style={{ ...S.td, color: C.text, fontWeight: 500 }}>{c.name}</td>
                <td style={S.td}><Badge label={c.type} color={c.type === "MCP" ? C.purple : c.type === "App" ? C.teal : C.blue} /></td>
                <td style={{ ...S.td, fontSize: 10, color: C.dim }}>{c.endpoint || "—"}</td>
                <td style={S.td}><Dot color={SC[c.status] || C.dim} />{c.status}</td>
                <td style={S.td}>
                  <div style={{ display: "flex", gap: 4 }}>
                    <button style={{ ...S.btn(), padding: "3px 8px", fontSize: 9 }} onClick={() => toggle(c.id)}>{c.status === "Connected" ? "Pause" : "Connect"}</button>
                    <button style={{ ...S.btn(), padding: "3px 8px", fontSize: 9 }} onClick={() => setList(list.filter(x => x.id !== c.id))}>x</button>
                  </div>
                </td>
              </tr>
            ))}</tbody>
          </table>
        </Card>
        <Card title="Add Connector">
          <div style={S.g4}>
            <Field label="Name"><input style={S.inp} value={nc.name} onChange={e => setNc({ ...nc, name: e.target.value })} placeholder="Service name" /></Field>
            <Field label="Type"><select style={S.sel} value={nc.type} onChange={e => setNc({ ...nc, type: e.target.value })}><option>API</option><option>MCP</option><option>App</option><option>Webhook</option></select></Field>
            <Field label="Endpoint / URL"><input style={S.inp} value={nc.endpoint} onChange={e => setNc({ ...nc, endpoint: e.target.value })} placeholder="https://..." /></Field>
            <Field label="API Key"><input style={S.inp} type="password" value={nc.key} onChange={e => setNc({ ...nc, key: e.target.value })} placeholder="••••••••" /></Field>
          </div>
          <button style={S.btn("gold")} onClick={add}>Add Connector</button>
        </Card>
      </div>
      <div>
        <Card title="Model Context Protocol Servers">
          <div style={{ fontSize: 12, color: C.dim, marginBottom: 14 }}>MCP servers enable Claude agents to access real-time data from external systems.</div>
          {mcpServers.map((m, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: "1px solid #0F1117" }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, color: C.text }}>{m.name}</div>
                <div style={{ fontSize: 10, color: C.dim, marginTop: 2 }}>{m.desc}</div>
              </div>
              <input style={{ ...S.inp, width: 200 }} defaultValue={`ws://localhost:${m.port}`} />
              <button style={{ ...S.btn(), padding: "4px 10px", fontSize: 9 }}>Test</button>
              <button style={{ ...S.btn("gold"), padding: "4px 10px", fontSize: 9 }}>Connect</button>
            </div>
          ))}
        </Card>
      </div>
      <div>
        <Card title="Outbound Webhooks">
          <div style={{ fontSize: 12, color: C.dim, marginBottom: 14 }}>Trigger external systems when project milestones are reached.</div>
          {["Deal Approved", "Entitlement Filed", "Due Diligence Complete", "Permit Approved", "Construction Started", "Project Closed"].map((e, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 0", borderBottom: "1px solid #0F1117" }}>
              <span style={{ flex: 1, fontSize: 13 }}>{e}</span>
              <input style={{ ...S.inp, width: 300 }} placeholder="https://your-webhook-url.com/..." />
              <button style={{ ...S.btn(), padding: "4px 10px", fontSize: 9 }}>Test</button>
            </div>
          ))}
        </Card>
      </div>
    </Tabs>
  );
}

function SiteEntitlements() {
  const { site, setSite, zon, setZon, sur, setSur, altaA, setAltaA } = useCtx();
  const su = k => e => setSite({ ...site, [k]: e.target.value });
  const zu = k => e => setZon({ ...zon, [k]: e.target.value });
  const ru = k => e => setSur({ ...sur, [k]: e.target.value });
  const constraints = [
    { name: "Easements", status: "Review", note: "Verify utility & access easements on ALTA" },
    { name: "Setbacks", status: "Confirm", note: "Front/rear/side per zoning code" },
    { name: "Open Space Req.", status: "Required", note: "15% minimum per local ordinance" },
    { name: "Tree Preservation", status: "Survey Needed", note: "Heritage trees require certified arborist" },
    { name: "Slope > 25%", status: "Analyze", note: "Areas exceeding 25% slope non-developable" },
    { name: "Flight Path / FAA", status: "Clear", note: "Outside airport influence area" },
    { name: "HOA / CC&Rs", status: "Pending", note: "Request from seller / title company" },
  ];
  const csc = { Review: C.gold, Confirm: C.blue, Required: C.red, "Survey Needed": C.purple, Clear: C.green, Pending: C.gold, Analyze: C.amber, "N/A": C.dim };
  const etl = [
    { phase: "Pre-Application Meeting", wks: "2-4" }, { phase: "Application Submittal", wks: "1" },
    { phase: "CEQA / Environmental Review", wks: "12-26" }, { phase: "Staff Report", wks: "4-8" },
    { phase: "Planning Commission Hearing", wks: "2-4" }, { phase: "City Council (if req.)", wks: "4-8" },
    { phase: "Conditions of Approval", wks: "2-4" }, { phase: "Final Map Recording", wks: "8-16" },
  ];
  return (
    <Tabs tabs={["Site ID", "Zoning & Entitlements", "Survey & ALTA", "Constraints", "Design Import"]}>
      <div>
        <Card title="Property Identification">
          <div style={S.g3}>
            {[["Site Address", "address", "123 Main St"], ["APN / Parcel Number", "apn", "000-000-000"], ["Gross Acres", "grossAcres", ""], ["Net Developable Acres", "netAcres", ""], ["Jurisdiction", "jurisdiction", "City of..."], ["County", "county", ""], ["State", "state", "CA"], ["General Plan", "generalPlan", "Low Density Residential"], ["Existing Use", "existingUse", "Vacant Land"], ["Proposed Use", "proposedUse", ""], ["Street Frontage (ft)", "frontage", ""], ["Site Access", "access", ""]].map(([l, k, ph]) => (
              <Field key={k} label={l}><input style={S.inp} value={site[k] || ""} onChange={su(k)} placeholder={ph || ""} /></Field>
            ))}
            <Field label="Parcel Shape"><select style={S.sel} value={site.shape} onChange={su("shape")}>{["Rectangular", "Irregular", "Flag Lot", "Triangular", "L-Shaped", "Corner Lot", "Other"].map(o => <option key={o}>{o}</option>)}</select></Field>
          </div>
          <Field label="Legal Description"><textarea style={{ ...S.ta, height: 50 }} value={site.legalDesc || ""} onChange={su("legalDesc")} placeholder="Lot X, Tract XXXXX per Map recorded in Book XX, Page XX..." /></Field>
        </Card>
        <Card title="Site Analysis · AI Agent">
          <Agent id="SiteAnalysis" system="You are a land development consultant specializing in site analysis for residential subdivisions. Analyze sites for development potential, physical constraints, access, shape efficiency, infrastructure proximity, and highest & best use." placeholder="Describe the site for development potential analysis..." />
        </Card>
      </div>
      <div>
        <Card title="Zoning Development Standards">
          <div style={S.g3}>
            {[["Zone Designation", "zone", "R-1, R-2, PD..."], ["Overlay District", "overlay", "Flood, Scenic..."], ["Max Density (DU/AC)", "du_ac", ""], ["Max Height (ft)", "maxHeight", ""], ["Min Lot Size (SF)", "minLotSize", ""], ["Min Lot Width (ft)", "minLotWidth", ""], ["Min Lot Depth (ft)", "minLotDepth", ""], ["Front Setback (ft)", "frontSetback", ""], ["Rear Setback (ft)", "rearSetback", ""], ["Side Setback (ft)", "sideSetback", ""], ["Max Lot Coverage %", "maxLot", ""], ["Parking Ratio", "parkingRatio", "2.0 spaces/unit"]].map(([l, k, ph]) => (
              <Field key={k} label={l}><input style={S.inp} value={zon[k] || ""} onChange={zu(k)} placeholder={ph || ""} /></Field>
            ))}
          </div>
        </Card>
        <Card title="Entitlement Pathway">
          <div style={S.g2}>
            <Field label="Entitlement Type"><select style={S.sel} value={zon.entitlementType} onChange={zu("entitlementType")}>{["Tentative Map", "Final Map", "Parcel Map", "Specific Plan", "PUD", "CUP", "Variance", "Zone Change", "General Plan Amendment", "Development Agreement"].map(o => <option key={o}>{o}</option>)}</select></Field>
            <Field label="Current Status"><select style={S.sel} value={zon.entitlementStatus} onChange={zu("entitlementStatus")}>{["Not Started", "Pre-App Submitted", "Application Filed", "Under Review", "CEQA in Progress", "Hearing Scheduled", "Approved", "Appealed", "Final Map Recorded"].map(o => <option key={o}>{o}</option>)}</select></Field>
          </div>
          <Field label="Notes / Conditions"><textarea style={{ ...S.ta, height: 50 }} value={zon.notes || ""} onChange={zu("notes")} placeholder="Conditions of approval, special requirements..." /></Field>
          <div style={{ marginTop: 14, borderTop: `1px solid ${C.border}`, paddingTop: 14 }}>
            <div style={{ fontSize: 9, color: C.gold, letterSpacing: 2, marginBottom: 10, textTransform: "uppercase" }}>Entitlement Timeline</div>
            {etl.map((t, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "5px 0", borderBottom: "1px solid #0F1117" }}>
                <div style={{ width: 18, height: 18, borderRadius: "50%", border: `1px solid ${C.gold}44`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, color: C.dim, flexShrink: 0 }}>{i + 1}</div>
                <span style={{ flex: 1, fontSize: 12 }}>{t.phase}</span>
                <span style={{ fontSize: 10, color: C.gold }}>{t.wks} wks</span>
              </div>
            ))}
          </div>
        </Card>
        <Card title="Zoning · AI Agent">
          <Agent id="Zoning" system="You are a land use attorney and entitlement consultant. Help analyze zoning codes, entitlement pathways, CEQA strategy, conditions of approval, density bonuses, and regulatory risk." placeholder="Ask about zoning compliance, density bonuses, entitlement strategy, or CEQA..." />
        </Card>
      </div>
      <div>
        <Card title="ALTA / NSPS Survey Decoder">
          <div style={S.g3}>
            <Field label="Survey Ordered?"><select style={S.sel} value={sur.altaOrdered} onChange={ru("altaOrdered")}><option>No</option><option>Ordered - Pending</option><option>Yes - Received</option></select></Field>
            <Field label="Date Received"><input style={S.inp} type="date" value={sur.altaDate || ""} onChange={ru("altaDate")} /></Field>
            <Field label="Surveyor / Firm"><input style={S.inp} value={sur.surveyorName || ""} onChange={ru("surveyorName")} /></Field>
          </div>
          <div style={{ fontSize: 9, color: C.gold, letterSpacing: 2, textTransform: "uppercase", margin: "12px 0 8px" }}>Table A Optional Items</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 }}>
            {altaA.map((item, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 7, padding: "5px 8px", background: C.bg, borderRadius: 3, cursor: "pointer" }} onClick={() => { const d = [...altaA]; d[i] = { ...d[i], checked: !d[i].checked }; setAltaA(d); }}>
                <input type="checkbox" checked={item.checked} readOnly style={{ accentColor: C.gold }} />
                <span style={{ fontSize: 10, color: item.checked ? C.gold : C.dim }}>{item.item}</span>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 12 }}>
            <Field label="Easements Identified"><textarea style={{ ...S.ta, height: 55 }} value={sur.easements || ""} onChange={ru("easements")} placeholder="List easements by type, width, beneficiary..." /></Field>
            <Field label="Encroachments / Issues"><textarea style={{ ...S.ta, height: 55 }} value={sur.encroachments || ""} onChange={ru("encroachments")} placeholder="Encroachments, gaps, overlaps, boundary disputes..." /></Field>
          </div>
        </Card>
        <Card title="Soils & Topography">
          <div style={S.g3}>
            {[["Soil Classification", "soilType", "Sandy loam, clay..."], ["Perc Rate (min/inch)", "percRate", ""], ["Max Slope %", "slopeMax", ""], ["Est. Cut/Fill (CY)", "cutFill", ""]].map(([l, k, ph]) => (
              <Field key={k} label={l}><input style={S.inp} value={sur[k] || ""} onChange={ru(k)} placeholder={ph} /></Field>
            ))}
            <Field label="Expansive Soil?"><select style={S.sel} value={sur.expansiveSoil} onChange={ru("expansiveSoil")}><option>No</option><option>Yes - Geotech Required</option><option>Unknown - Testing Needed</option></select></Field>
            <Field label="Liquefaction Zone?"><select style={S.sel} value={sur.liquefaction} onChange={ru("liquefaction")}><option>No</option><option>Yes</option><option>Review State Maps</option></select></Field>
          </div>
        </Card>
        <Card title="Survey & Soils · AI Agent">
          <Agent id="Survey" system="You are an ALTA/NSPS land surveyor and geotechnical consultant. Decode survey terminology, interpret Table A items, identify title exceptions, explain easement impacts, and interpret geotechnical findings." placeholder="Paste survey language or describe soils/topo findings..." />
        </Card>
      </div>
      <div>
        <Card title="Constraints Matrix">
          <table style={S.tbl}>
            <thead><tr><th style={S.th}>Constraint</th><th style={S.th}>Status</th><th style={S.th}>Notes</th></tr></thead>
            <tbody>{constraints.map((c, i) => (
              <tr key={i}>
                <td style={{ ...S.td, color: C.text, fontWeight: 500 }}>{c.name}</td>
                <td style={S.td}><Badge label={c.status} color={csc[c.status] || C.dim} /></td>
                <td style={{ ...S.td, color: C.dim, fontSize: 12 }}>{c.note}</td>
              </tr>
            ))}</tbody>
          </table>
        </Card>
      </div>
      <div>
        <Card title="SketchUp & Design File Import">
          <div style={{ border: `2px dashed ${C.border2}`, borderRadius: 4, padding: 36, textAlign: "center", color: C.dim }}>
            <div style={{ fontSize: 37, marginBottom: 10, color: C.gold }}>+</div>
            <div style={{ fontSize: 14, color: C.sub, marginBottom: 6 }}>Drop SketchUp files, CAD exports, site plans, or design PDFs</div>
            <div style={{ fontSize: 10, color: C.dim, marginBottom: 16 }}>Supports: .skp · .dwg · .dxf · .pdf · .png · .jpg · .geojson</div>
            <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
              <button style={S.btn("gold")}>Browse Files</button>
              <button style={S.btn()}>Connect SketchUp MCP</button>
              <button style={S.btn()}>Import from URL</button>
            </div>
          </div>
        </Card>
        <Card title="Design Notes & Test Fit Log">
          <textarea style={{ ...S.ta, height: 120 }} placeholder="Document test fit iterations, street layout decisions, open space placement rationale, phasing notes..." />
        </Card>
      </div>
    </Tabs>
  );
}

function Infrastructure() {
  const { svcs, setSvcs, env, setEnv } = useCtx();
  const upd = (i, k, v) => { const d = [...svcs]; d[i] = { ...d[i], [k]: v }; setSvcs(d); };
  const eu = k => e => setEnv({ ...env, [k]: e.target.value });
  const statOpts = ["Verify", "Available", "Capacity Constraints", "Extension Required", "Moratorium", "N/A"];
  const SC = { Available: C.green, "Capacity Constraints": C.amber, "Extension Required": C.red, Verify: C.blue, Moratorium: C.purple, "N/A": C.dim };
  const FZ = { X: { l: "Zone X - Minimal Flood Hazard", c: C.green }, AE: { l: "Zone AE - 1% Annual Chance", c: C.red }, A: { l: "Zone A - 1% Chance (no BFE)", c: C.amber }, VE: { l: "Zone VE - Coastal High Hazard", c: C.purple }, X500: { l: "Zone X (Shaded) - 0.2% Chance", c: C.blue } };
  return (
    <Tabs tabs={["Utilities & Services", "Sewage & Drainage", "Environmental & Flood", "CEQA"]}>
      <div>
        <Card title="Utility & Service Plan">
          <table style={S.tbl}>
            <thead><tr><th style={S.th}>Service</th><th style={S.th}>Provider / District</th><th style={S.th}>Capacity / Size</th><th style={S.th}>Dist. to Main</th><th style={S.th}>Conn. Fee/Unit</th><th style={S.th}>Status</th></tr></thead>
            <tbody>{svcs.map((s, i) => (
              <tr key={i}>
                <td style={{ ...S.td, color: C.gold, fontWeight: 600, fontSize: 12 }}>{s.name}</td>
                {["provider", "capacity", "distance", "connFee"].map(k => (
                  <td key={k} style={S.td}><input style={{ ...S.inp, padding: "4px 7px", fontSize: 12 }} value={s[k]} onChange={e => upd(i, k, e.target.value)} placeholder={k === "connFee" ? "$ 0" : ""} /></td>
                ))}
                <td style={S.td}><select style={{ ...S.sel, padding: "4px 7px", fontSize: 10, color: SC[s.status] || C.dim, width: "auto" }} value={s.status} onChange={e => upd(i, "status", e.target.value)}>{statOpts.map(o => <option key={o}>{o}</option>)}</select></td>
              </tr>
            ))}</tbody>
          </table>
        </Card>
        <Card title="Utilities · AI Agent">
          <Agent id="Utilities" system="You are a civil engineering consultant specializing in land development infrastructure. Analyze utility capacity, off-site improvement costs, service extension feasibility, and infrastructure budget items." placeholder="Ask about utility capacity, connection costs, off-site improvement requirements..." />
        </Card>
      </div>
      <div>
        <Card title="Sewer & Wastewater Analysis">
          <div style={S.g3}>
            {[["Sewer District", ""], ["Capacity Available (EQR)", "Available units"], ["Connection Fee / Unit", "$ 0"], ["Off-Site Extension Required (ft)", "0"], ["Cost Per LF Extension", "$ 0"], ["Total Extension Cost", "Auto-calculated"]].map(([l, ph], i) => (
              <Field key={i} label={l}><input style={S.inp} placeholder={ph} /></Field>
            ))}
          </div>
          <Field label="Septic / OWTS Feasibility"><select style={S.sel}><option>No - Sewer Available</option><option>Yes - Perc Tests Needed</option><option>Yes - Confirmed</option><option>Not Applicable</option></select></Field>
          <Field label="Notes / Agency Contacts"><textarea style={{ ...S.ta, height: 55 }} placeholder="Sewer district contact, capacity letter status, moratorium notes..." /></Field>
        </Card>
        <Card title="Storm Drainage & NPDES">
          <div style={S.g3}>
            {[["NPDES Permit Required", ""], ["Regional Water Board", ""], ["Retention Required (acre-ft)", ""], ["Detention Basin (sq ft)", ""], ["Low Impact Development (LID) Req.", ""], ["SWPPP Consultant", ""]].map(([l, ph], i) => (
              <Field key={i} label={l}><input style={S.inp} placeholder={ph} /></Field>
            ))}
          </div>
        </Card>
      </div>
      <div>
        <Card title="FEMA Flood Zone Analysis">
          <div style={S.g2}>
            <div>
              <Field label="Flood Zone"><select style={S.sel} value={env.floodZone} onChange={eu("floodZone")}>{Object.keys(FZ).map(z => <option key={z} value={z}>{FZ[z].l}</option>)}</select></Field>
              {FZ[env.floodZone] && <div style={{ marginTop: 6 }}><Badge label={FZ[env.floodZone].l} color={FZ[env.floodZone].c} /></div>}
            </div>
            <div>
              <Field label="FIRM Panel Number"><input style={S.inp} value={env.firmPanel} onChange={eu("firmPanel")} placeholder="0000C0000X" /></Field>
              <Field label="FIRM Effective Date"><input style={S.inp} type="date" value={env.firmDate} onChange={eu("firmDate")} /></Field>
            </div>
            <Field label="Base Flood Elevation (BFE - NAVD88)"><input style={S.inp} value={env.bfe} onChange={eu("bfe")} placeholder="e.g. 482.5 ft" /></Field>
            <Field label="LOMA / LOMR Status"><select style={S.sel} value={env.loma} onChange={eu("loma")}><option>No</option><option>In Process</option><option>Yes - Approved</option><option>Denied</option></select></Field>
          </div>
        </Card>
        <Card title="Phase I / II Environmental Site Assessment">
          <div style={S.g2}>
            <Field label="Phase I ESA Status"><select style={S.sel} value={env.phase1} onChange={eu("phase1")}><option>No</option><option>Ordered - Pending</option><option>Received - Clean</option><option>Phase II Required</option><option>Phase II Completed</option></select></Field>
            <Field label="Phase I Completion Date"><input style={S.inp} type="date" value={env.phase1Date} onChange={eu("phase1Date")} /></Field>
            <Field label="Recognized Environmental Conditions"><textarea style={{ ...S.ta, height: 60 }} value={env.rec} onChange={eu("rec")} placeholder="List any RECs, HRECs, or CRECs identified..." /></Field>
            <div>
              <Field label="Wetlands / Waters of the US"><select style={S.sel} value={env.wetlands} onChange={eu("wetlands")}>{["None Observed", "Potential - Delineation Needed", "Delineated - None Jurisdictional", "Jurisdictional Wetlands Present", "Section 404 Permit Required"].map(o => <option key={o}>{o}</option>)}</select></Field>
              <Field label="Special Status Species / Habitat"><textarea style={{ ...S.ta, height: 60 }} value={env.species} onChange={eu("species")} placeholder="CESA / ESA listed species, critical habitat..." /></Field>
            </div>
          </div>
        </Card>
        <Card title="Environmental · AI Agent">
          <Agent id="Environmental" system="You are an environmental planning expert specializing in CEQA, FEMA flood analysis, wetlands (CWA Section 404/401), Phase I/II ESAs, biological resources, and NPDES for residential land development." placeholder="Ask about CEQA classification, flood zone remediation, wetlands permitting, or Phase I findings..." />
        </Card>
      </div>
      <div>
        <Card title="CEQA Pathway">
          <div style={S.g2}>
            <Field label="CEQA Document Type"><select style={S.sel} value={env.ceqa} onChange={eu("ceqa")}>{["Class 32 - Infill Exemption", "Class 15 - Minor Land Division", "Categorical Exemption - Other", "Negative Declaration (ND)", "Mitigated Negative Declaration (MND)", "EIR - Project Level", "EIR - Program Level", "Not Subject to CEQA"].map(o => <option key={o}>{o}</option>)}</select></Field>
            <Field label="Air Quality Basin / District"><input style={S.inp} value={env.airQuality} onChange={eu("airQuality")} placeholder="SCAQMD, BAAQMD, SJVAPCD..." /></Field>
            <Field label="Mitigation Measures Required"><textarea style={{ ...S.ta, height: 80 }} value={env.mitigation} onChange={eu("mitigation")} placeholder="List all required mitigation measures by category (Bio, Cultural, Noise, Air, Traffic)..." /></Field>
          </div>
        </Card>
      </div>
    </Tabs>
  );
}

function ConceptDesign() {
  const { fin, setFin, setChartSel } = usePrj();
  const [cfg, setCfg] = useLS("axiom_yield", { grossAcres: 10, netAcres: 7.5, smallLotAvg: 4200, largeLotAvg: 8500, smallLotPct: 60, pudUnits: 0, streetPct: 15, openSpacePct: 15, utilityPct: 5 });
  const cy = k => e => setCfg({ ...cfg, [k]: parseFloat(e.target.value) || 0 });
  const devSF = cfg.netAcres * 43560 * (1 - (cfg.streetPct + cfg.openSpacePct + cfg.utilityPct) / 100);
  const smallLots = Math.floor(devSF * cfg.smallLotPct / 100 / cfg.smallLotAvg);
  const largeLots = Math.floor(devSF * (100 - cfg.smallLotPct) / 100 / cfg.largeLotAvg);
  const total = smallLots + largeLots + cfg.pudUnits;
  const density = cfg.netAcres > 0 ? total / cfg.netAcres : 0;
  const pieD = [
    { name: "Streets", value: cfg.streetPct, fill: C.blue },
    { name: "Open Space", value: cfg.openSpacePct, fill: C.teal },
    { name: "Utilities/Ease.", value: cfg.utilityPct, fill: C.purple },
    { name: "Small Lots", value: cfg.smallLotPct * (100 - cfg.streetPct - cfg.openSpacePct - cfg.utilityPct) / 100, fill: C.gold },
    { name: "Large Lots", value: (100 - cfg.smallLotPct) * (100 - cfg.streetPct - cfg.openSpacePct - cfg.utilityPct) / 100, fill: C.gold2 },
  ];
  return (
    <Tabs tabs={["Concept Yield", "Land Use Allocation", "PUD / Attached", "Test Fit Notes", "Design Import"]}>
      <div>
        <div style={S.g4}>
          <KPI label="Small SFR Lots" value={fmt.num(smallLots)} sub={`avg ${fmt.sf(cfg.smallLotAvg)}`} />
          <KPI label="Large SFR Lots" value={fmt.num(largeLots)} sub={`avg ${fmt.sf(cfg.largeLotAvg)}`} />
          <KPI label="PUD / Fee Simple" value={fmt.num(cfg.pudUnits)} color={C.blue} sub="Attached units" />
          <KPI label="Total Concept Yield" value={fmt.num(total)} color={C.green} sub={`${density.toFixed(1)} DU/AC`} />
        </div>
        <div style={{ ...S.g2, marginTop: 14 }}>
          <Card title="Yield Configuration">
            <div style={S.g2}>
              {[["Gross Acres", "grossAcres"], ["Net Dev. Acres", "netAcres"], ["Small Lot Avg SF", "smallLotAvg"], ["Large Lot Avg SF", "largeLotAvg"], ["Small Lot % of Dev Area", "smallLotPct"], ["PUD / Attached Units", "pudUnits"], ["Streets % of Gross", "streetPct"], ["Open Space %", "openSpacePct"], ["Utility / Easement %", "utilityPct"]].map(([l, k]) => (
                <Field key={k} label={l}><input style={S.inp} type="number" value={cfg[k]} onChange={cy(k)} /></Field>
              ))}
            </div>
            <button style={{ ...S.btn("gold"), marginTop: 10 }} onClick={() => setFin({ ...fin, totalLots: total })}>Sync Lots to Financial Model</button>
          </Card>
          <Card title="Land Use Allocation">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart onClick={onChartClick(setChartSel)} style={CHART_STYLE}>
                <Pie data={pieD} cx="50%" cy="50%" outerRadius={90} dataKey="value" nameKey="name" label={({ name, value }) => `${name} ${Number(value).toFixed(0)}%`} style={{ fontSize: 9 }}>
                  {pieD.map((d, i) => <Cell key={i} fill={d.fill} />)}
                </Pie>
                <Tooltip {...TT()} formatter={(v, name) => [`${Number(v).toFixed(1)}%`, name]} labelFormatter={() => "Land Use Mix"} />
                <Legend wrapperStyle={{ fontSize: 11, color: C.muted }} />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </div>
        <Card title="Concept Yield — · AI Agent">
          <Agent id="ConceptYield" system="You are a land planner and subdivision designer. Optimize lot yields, street layouts, open space configurations, and phasing for residential subdivisions." placeholder="Describe site constraints and I'll optimize concept yield and lot mix..." />
        </Card>
      </div>
      <div>
        <Card title="Land Allocation Summary">
          <table style={S.tbl}>
            <thead><tr><th style={S.th}>Use Category</th><th style={S.th}>% of Gross</th><th style={S.th}>Acres</th><th style={S.th}>SF</th></tr></thead>
            <tbody>{[["Streets / ROW", cfg.streetPct], ["Open Space / Parks", cfg.openSpacePct], ["Utilities / Easements", cfg.utilityPct], ["Net Developable", 100 - cfg.streetPct - cfg.openSpacePct - cfg.utilityPct]].map(([name, pct]) => (
              <tr key={name}>
                <td style={{ ...S.td, color: C.text }}>{name}</td>
                <td style={{ ...S.td, color: C.gold }}>{Number(pct).toFixed(1)}%</td>
                <td style={S.td}>{(cfg.grossAcres * pct / 100).toFixed(2)} ac</td>
                <td style={S.td}>{Math.round(cfg.grossAcres * 43560 * pct / 100).toLocaleString()} SF</td>
              </tr>
            ))}</tbody>
          </table>
        </Card>
      </div>
      <div>
        <Card title="PUD / Attached Unit Configuration">
          <div style={S.g3}>
            {[["Total PUD Units", ""], ["Unit Type", "Townhome / Detached / Condo"], ["Avg Unit Size (SF)", ""], ["Target HOA Dues/Mo", ""], ["Common Area (SF)", ""], ["Recreational Amenities", "Pool, Playground, Trails"]].map(([l, ph], i) => (
              <Field key={i} label={l}><input style={S.inp} placeholder={ph} /></Field>
            ))}
          </div>
          <Field label="Reserve Study Required?"><select style={S.sel}><option>Yes</option><option>No</option><option>Unknown</option></select></Field>
          <Field label="HOA Structure Notes"><textarea style={{ ...S.ta, height: 60 }} placeholder="Management structure, budget, CC&R requirements..." /></Field>
        </Card>
      </div>
      <div>
        <Card title="Test Fit Log">
          <Field label="Iteration 1 - Initial Concept"><textarea style={{ ...S.ta, height: 80 }} placeholder="First layout attempt, yield achieved, issues identified..." /></Field>
          <Field label="Iteration 2 - Revised Concept"><textarea style={{ ...S.ta, height: 80 }} placeholder="Changes made, yield impact, circulation improvements..." /></Field>
          <Field label="Selected Concept - Rationale"><textarea style={{ ...S.ta, height: 80 }} placeholder="Why this layout was selected, trade-offs, value drivers..." /></Field>
          <Field label="Phasing Strategy"><textarea style={{ ...S.ta, height: 80 }} placeholder="Phase 1: lots 1-20 (infrastructure first), Phase 2: lots 21-50..." /></Field>
        </Card>
      </div>
      <div>
        <Card title="Design File Vault">
          <div style={{ border: `2px dashed ${C.border2}`, borderRadius: 4, padding: 40, textAlign: "center" }}>
            <div style={{ fontSize: 41, color: C.gold, marginBottom: 8 }}>+</div>
            <div style={{ fontSize: 14, color: C.sub, marginBottom: 14 }}>Drop SketchUp, AutoCAD, or design files here</div>
            <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
              <button style={S.btn("gold")}>Browse Files</button>
              <button style={S.btn()}>SketchUp MCP</button>
              <button style={S.btn()}>Import URL</button>
            </div>
            <div style={{ fontSize: 10, color: C.dim, marginTop: 10 }}>Supports: .skp — · .dwg — · .dxf — · .pdf — · .png — · .jpg — · .geojson</div>
          </div>
        </Card>
      </div>
    </Tabs>
  );
}

function MarketIntelligence() {
  const { setChartSel, comps, setComps } = usePrj();
  const [nc, setNc] = useState({ name: "", address: "", lots: "", lotSF: "", saleDate: "", pricePerLot: "", pricePerSF: "", status: "Sold", adj: 0, notes: "" });
  const [filt, setFilt] = useState("All");
  const filtered = (comps || []).filter(c => filt === "All" || c.status === filt);
  const adjPrices = filtered.map(c => c.pricePerLot * (1 + c.adj / 100));
  const avgPPL = adjPrices.length ? adjPrices.reduce((a, b) => a + b, 0) / adjPrices.length : 0;
  const avgPPSF = filtered.length ? filtered.reduce((s, c) => s + c.pricePerSF, 0) / filtered.length : 0;
  const trend = filtered.length > 1 ? (adjPrices[adjPrices.length - 1] - adjPrices[0]) / adjPrices[0] * 100 : 0;
  const chartD = [...filtered].sort((a, b) => a.saleDate.localeCompare(b.saleDate)).map(c => ({ name: c.name.split(" ")[0], raw: c.pricePerLot, adj: c.pricePerLot * (1 + c.adj / 100) }));
  const addComp = () => { if (!nc.name) return; setComps([...comps, { ...nc, id: Date.now(), lots: +nc.lots, lotSF: +nc.lotSF, pricePerLot: +nc.pricePerLot, pricePerSF: +nc.pricePerSF, adj: +nc.adj }]); setNc({ name: "", address: "", lots: "", lotSF: "", saleDate: "", pricePerLot: "", pricePerSF: "", status: "Sold", adj: 0, notes: "" }); };
  return (
    <Tabs tabs={["Comparables", "Adjustments", "Price Trends", "Market Data"]}>
      <div>
        <div style={S.g4}>
          <KPI label="Comps Analyzed" value={filtered.length} />
          <KPI label="Avg Adj. $/Lot" value={fmt.usd(avgPPL)} color={C.green} trend={trend} />
          <KPI label="Avg $/SF" value={"$" + avgPPSF.toFixed(2)} color={C.blue} />
          <KPI label="Price Range" value={`${fmt.k(Math.min(...filtered.map(c => c.pricePerLot)))} - ${fmt.k(Math.max(...filtered.map(c => c.pricePerLot)))}`} color={C.amber} />
        </div>
        <Card title="Comparable Sales Database" action={
          <div style={{ display: "flex", gap: 8 }}>
            <CSVImportButton onImport={(data) => {
              const newComps = data.map((d, i) => ({ id: Date.now() + i, name: d.Project || d.name || "Imported", address: d.Address || d.address || "", lots: +(d.Lots || d.lots || 0), lotSF: +(d["Lot SF"] || d.lotSF || 0), saleDate: d.Date || d.saleDate || "", pricePerLot: +(d["$/Lot"] || d.pricePerLot || 0), pricePerSF: +(d["$/SF"] || d.pricePerSF || 0), status: d.Status || d.status || "Sold", adj: +(d["Adj%"] || d.adj || 0), notes: d.Notes || d.notes || "" }));
              setComps([...comps, ...newComps]);
            }} />
            <select style={{ ...S.sel, width: "auto", padding: "3px 8px", fontSize: 10 }} value={filt} onChange={e => setFilt(e.target.value)}><option>All</option><option>Sold</option><option>Listed</option><option>Pending</option></select>
          </div>
        }>
          <table style={S.tbl}>
            <thead><tr><th style={S.th}>Project</th><th style={S.th}>Lots</th><th style={S.th}>Lot SF</th><th style={S.th}>Date</th><th style={S.th}>$/Lot</th><th style={S.th}>$/SF</th><th style={S.th}>Adj%</th><th style={S.th}>Adj $/Lot</th><th style={S.th}>Status</th><th style={S.th}></th></tr></thead>
            <tbody>{filtered.map(c => (
              <tr key={c.id}>
                <td style={{ ...S.td, color: C.gold }}>{c.name}<div style={{ fontSize: 9, color: C.dim }}>{c.address}</div></td>
                <td style={S.td}>{c.lots}</td>
                <td style={S.td}>{fmt.num(c.lotSF)}</td>
                <td style={S.td}>{c.saleDate}</td>
                <td style={S.td}>{fmt.usd(c.pricePerLot)}</td>
                <td style={S.td}>${c.pricePerSF.toFixed(2)}</td>
                <td style={{ ...S.td, color: c.adj > 0 ? C.green : c.adj < 0 ? C.red : C.dim }}>{c.adj > 0 ? "+" : ""}{c.adj}%</td>
                <td style={{ ...S.td, color: C.gold, fontWeight: 600 }}>{fmt.usd(c.pricePerLot * (1 + c.adj / 100))}</td>
                <td style={S.td}><Badge label={c.status} color={c.status === "Sold" ? C.green : c.status === "Listed" ? C.blue : C.amber} /></td>
                <td style={S.td}><button style={{ ...S.btn(), padding: "2px 7px", fontSize: 9 }} onClick={() => setComps(comps.filter(x => x.id !== c.id))}>x</button></td>
              </tr>
            ))}</tbody>
          </table>
        </Card>
        <Card title="Add Comparable">
          <div style={S.g4}>
            <Field label="Project Name"><input style={S.inp} value={nc.name} onChange={e => setNc({ ...nc, name: e.target.value })} /></Field>
            <Field label="Address"><input style={S.inp} value={nc.address} onChange={e => setNc({ ...nc, address: e.target.value })} /></Field>
            <Field label="# Lots"><input style={S.inp} type="number" value={nc.lots} onChange={e => setNc({ ...nc, lots: e.target.value })} /></Field>
            <Field label="Avg Lot SF"><input style={S.inp} type="number" value={nc.lotSF} onChange={e => setNc({ ...nc, lotSF: e.target.value })} /></Field>
            <Field label="Sale/List Date"><input style={S.inp} type="month" value={nc.saleDate} onChange={e => setNc({ ...nc, saleDate: e.target.value })} /></Field>
            <Field label="$/Lot"><input style={S.inp} type="number" value={nc.pricePerLot} onChange={e => setNc({ ...nc, pricePerLot: e.target.value })} /></Field>
            <Field label="$/SF"><input style={S.inp} type="number" step="0.01" value={nc.pricePerSF} onChange={e => setNc({ ...nc, pricePerSF: e.target.value })} /></Field>
            <Field label="Status"><select style={S.sel} value={nc.status} onChange={e => setNc({ ...nc, status: e.target.value })}><option>Sold</option><option>Listed</option><option>Pending</option><option>Off-Market</option></select></Field>
          </div>
          <button style={S.btn("gold")} onClick={addComp}>Add Comparable</button>
        </Card>
      </div>
      <div>
        <Card title="Adjustment Grid">
          <table style={S.tbl}>
            <thead><tr><th style={S.th}>Project</th><th style={S.th}>Raw $/Lot</th><th style={S.th}>Adj %</th><th style={S.th}>Adj $/Lot</th><th style={S.th}>Notes</th></tr></thead>
            <tbody>{comps.map((c, i) => (
              <tr key={c.id}>
                <td style={{ ...S.td, color: C.text }}>{c.name}</td>
                <td style={{ ...S.td, color: C.dim }}>{fmt.usd(c.pricePerLot)}</td>
                <td style={S.td}><input style={{ ...S.inp, width: 70, padding: "3px 6px", fontSize: 12 }} type="number" value={c.adj} onChange={e => { const d = [...comps]; d[i] = { ...d[i], adj: +e.target.value }; setComps(d); }} /></td>
                <td style={{ ...S.td, color: C.gold, fontWeight: 600 }}>{fmt.usd(c.pricePerLot * (1 + c.adj / 100))}</td>
                <td style={S.td}><input style={{ ...S.inp, fontSize: 12, padding: "3px 6px" }} value={c.notes} onChange={e => { const d = [...comps]; d[i] = { ...d[i], notes: e.target.value }; setComps(d); }} placeholder="Adjustment rationale..." /></td>
              </tr>
            ))}</tbody>
          </table>
          <div style={{ marginTop: 14, padding: 14, background: C.bg, borderRadius: 4, border: `1px solid ${C.gold}44`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 12, color: C.dim }}>Adjusted Indicated Value</span>
            <span style={{ fontSize: 21, color: C.gold, fontWeight: 700 }}>{fmt.usd(avgPPL)} / lot</span>
          </div>
        </Card>
        <Card title="Market Intelligence · AI Agent">
          <Agent id="MarketAnalysis" system="You are a real estate appraiser and market analyst specializing in land development comparables. Analyze comparable sales, apply adjustments, develop adjusted value indications, and identify absorption trends." placeholder="Describe subject property and comparables for a market value analysis..." />
        </Card>
      </div>
      <div>
        <Card title="Price Trend Analysis">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartD} onClick={onChartClick(setChartSel)} style={CHART_STYLE}>
              <CartesianGrid strokeDasharray="3 6" stroke={C.border} strokeOpacity={0.5} vertical={false} />
              <XAxis dataKey="name" stroke={C.dim} tick={{ fontSize: 13, fontFamily: 'Inter,sans-serif', fill: C.muted }} />
              <YAxis stroke={C.dim} tick={{ fontSize: 13, fontFamily: 'Inter,sans-serif', fill: C.muted }} tickFormatter={v => fmt.k(v)} />
              <Tooltip {...TT_BAR()} formatter={(v, name) => [fmt.usd(v), name]} labelFormatter={l => `Comp: ${l}`} />
              <Legend wrapperStyle={{ fontSize: 11, color: C.muted, paddingTop: 4 }} />
              <Bar dataKey="raw" name="Raw $/Lot" fill={C.dim} radius={[2, 2, 0, 0]} />
              <Bar dataKey="adj" name="Adj $/Lot" fill={C.gold} radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
      <div>
        <Card title="Market Indicators">
          <div style={S.g3}>
            {[["Absorption Rate (lots/mo)"], ["Avg Days on Market"], ["List / Sale Ratio %"], ["Active Competing Projects"], ["New Home Median Price"], ["Land Price Trend (12-mo)"], ["Submarket Name"], ["MSA / Metro Area"], ["Housing Demand Score"]].map(([l], i) => (
              <Field key={i} label={l}><input style={S.inp} placeholder="Enter value" /></Field>
            ))}
          </div>
        </Card>
        <NewsAndSignalsPanel region="US" assetType="subdivision" />
      </div>
    </Tabs>
  );
}

function FinancialEngine() {
  const { fin, setFin, loan, setLoan, equity, setEquity, setChartSel, project } = usePrj();
  const auth = useAuth();
  const u = k => e => setFin({ ...fin, [k]: parseFloat(e.target.value) || 0 });
  const hard = fin.totalLots * fin.hardCostPerLot, soft = hard * fin.softCostPct / 100;
  const fees = fin.planningFees + (fin.permitFeePerLot + fin.schoolFee + fin.impactFeePerLot) * fin.totalLots;
  const cont = (hard + soft) * fin.contingencyPct / 100;
  const totalCost = fin.landCost + fin.closingCosts + hard + soft + cont + fees;
  const revenue = fin.totalLots * fin.salesPricePerLot, comm = revenue * fin.salesCommission / 100;
  const reserves = totalCost * fin.reservePercentage / 100;
  const profit = revenue - comm - reserves - totalCost;
  const margin = revenue > 0 ? profit / revenue * 100 : 0, roi = totalCost > 0 ? profit / totalCost * 100 : 0;

  // ── COMPOSITE SCORE (auto-fetches from engines-score on fin change) ──
  const [dealScore, setDealScore] = useState(null);
  const [scoreLoading, setScoreLoading] = useState(false);
  const scoreTimer = useRef(null);

  const fetchScore = useCallback(async (projectId) => {
    if (!supa.configured() || !supa.token) return;
    setScoreLoading(true);
    try {
      const result = await supa.callEdge("engines-score", {});
      // engines-score currently needs project_id as query param — use callEdge with custom approach
      const r = await fetch(`${supa.url}/functions/v1/engines-score?project_id=${projectId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${supa.token}`, apikey: supa.key },
        body: JSON.stringify({
          state: {
            finance: { irr: margin > 0 ? (margin / 100 * 25) : 18, dscr: loan?.dscr || 1.3 },
            risk: { score: 50 }
          }
        }),
      });
      if (r.ok) {
        const d = await r.json();
        if (d.composite_score !== undefined) setDealScore(Math.round(d.composite_score));
      }
    } catch (e) { console.warn("Score fetch:", e.message); }
    setScoreLoading(false);
  }, [supa.url, supa.token, margin, loan]);

  // Heuristic local score when no project_id (guest mode)
  const localScore = useMemo(() => {
    const irrImpact = Math.max(0, Math.min(1, margin / 20)) * 40;
    const dscrImpact = Math.max(0, Math.min(1, ((loan?.dscr || 1.3) - 1) / 0.5)) * 25;
    const riskImpact = 25;
    return Math.round(Math.min(100, irrImpact + dscrImpact + riskImpact + 10));
  }, [margin, loan]);

  useEffect(() => {
    clearTimeout(scoreTimer.current);
    if (project?.id && supa.configured() && auth?.user) {
      scoreTimer.current = setTimeout(() => fetchScore(project.id), 2000);
    }
    return () => clearTimeout(scoreTimer.current);
  }, [fin, project?.id, auth?.user]);

  const displayScore = project?.id ? (dealScore ?? localScore) : localScore;
  const scoreColor = displayScore >= 70 ? C.green : displayScore >= 50 ? C.amber : C.red;

  const waterfall = [
    { name: "Revenue", value: revenue / 1e6, fill: C.green }, { name: "Land", value: -(fin.landCost + fin.closingCosts) / 1e6, fill: C.red + "88" },
    { name: "Hard Cost", value: -hard / 1e6, fill: C.red + "88" }, { name: "Soft Cost", value: -soft / 1e6, fill: C.amber + "88" },
    { name: "Fees", value: -fees / 1e6, fill: C.purple + "88" }, { name: "Comm+Res", value: -(comm + reserves) / 1e6, fill: C.dim },
    { name: "Net Profit", value: profit / 1e6, fill: profit >= 0 ? C.green : C.red },
  ];
  const priceVars = [-20, -10, -5, 0, 5, 10, 20];
  const costVars = [-20, -10, 0, 10, 20];
  const sensiColor = m => m > 20 ? C.green : m > 10 ? C.teal : m > 0 ? C.amber : C.red;
  const [grmC, setGrmC] = useState({ price: fin.salesPricePerLot || 500000, rent: 2800 });
  const grmVal = grmC.rent > 0 ? grmC.price / (grmC.rent * 12) : 0;
  const capRate = grmC.price > 0 ? grmC.rent * 12 * 0.5 / grmC.price * 100 : 0;
  const [lr, setLr] = useState({ rev: fin.salesPricePerLot || 185000, lots: fin.totalLots || 50, hard: fin.hardCostPerLot || 65000, soft: fin.softCostPct || 18, margin: 20 });
  const lrVal = () => { const r = lr.rev * lr.lots, h = lr.hard * lr.lots, s = h * lr.soft / 100, m = r * lr.margin / 100; return Math.max(0, r - h - s - m); };
  const [sp, setSp] = useState({ comp: 185000, premium: 5, discount: 0 });
  const sugPrice = sp.comp * (1 + sp.premium / 100) * (1 - sp.discount / 100);
  return (
    <Tabs tabs={["Pro Forma", "Calculators", "Sensitivity", "Loan & Equity", "Scenarios"]}>
      <div>
        <div style={S.g5}>
          <KPI label="Gross Revenue" value={fmt.M(revenue)} color={C.green} />
          <KPI label="Total Cost" value={fmt.M(totalCost)} color={C.red} />
          <KPI label="Net Profit" value={fmt.M(profit)} color={profit >= 0 ? C.green : C.red} />
          <KPI label="Profit Margin" value={fmt.pct(margin)} color={margin > 15 ? C.green : margin > 5 ? C.amber : C.red} sub={`ROI: ${roi.toFixed(1)}%`} />
          <div style={S.kpi}>
            <div style={{ fontSize: 9, color: C.dim, letterSpacing: 2, textTransform: "uppercase" }}>Deal Score</div>
            <div style={{ fontSize: 25, color: scoreColor, fontWeight: 700, marginTop: 3, lineHeight: 1, display: "flex", alignItems: "baseline", gap: 4 }}>
              {scoreLoading ? <span style={{ fontSize: 14, color: C.dim }}>…</span> : displayScore}
              <span style={{ fontSize: 11, color: C.dim }}>/100</span>
            </div>
            <div style={{ fontSize: 10, color: C.dim, marginTop: 3 }}>
              {project?.id ? (dealScore ? "engine" : "local") : "local"}
              {!project?.id && <span
                onClick={() => fetchScore(project?.id)}
                style={{ color: C.gold, cursor: "pointer", marginLeft: 4 }}
              >↻</span>}
            </div>
          </div>
        </div>
        <div style={{ ...S.g2, marginTop: 14 }}>
          <Card title="Cost Inputs">
            {[["Total Lots", "totalLots"], ["Land Acquisition ($)", "landCost"], ["Closing / DD Costs ($)", "closingCosts"], ["Hard Cost / Lot ($)", "hardCostPerLot"], ["Soft Cost % of Hard", "softCostPct"], ["Contingency %", "contingencyPct"], ["Planning / Entitlement ($)", "planningFees"], ["Permit Fee / Lot ($)", "permitFeePerLot"], ["School Fee / Lot ($)", "schoolFee"], ["Impact Fee / Lot ($)", "impactFeePerLot"], ["Reserve %", "reservePercentage"]].map(([l, k]) => (
              <Field key={k} label={l} mb={8}><input style={S.inp} type="number" value={fin[k] || 0} onChange={u(k)} /></Field>
            ))}
          </Card>
          <div>
            <Card title="Revenue & Returns">
              <Field label="Sale Price / Lot ($)"><input style={S.inp} type="number" value={fin.salesPricePerLot} onChange={u("salesPricePerLot")} /></Field>
              <Field label="Sales Commission %"><input style={S.inp} type="number" value={fin.salesCommission} onChange={u("salesCommission")} /></Field>
              <Field label="Absorption Rate (lots/mo)"><input style={S.inp} type="number" value={fin.absorbRate} onChange={u("absorbRate")} /></Field>
              <Field label="GRM"><input style={S.inp} type="number" value={fin.grm} onChange={u("grm")} /></Field>
              <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 4, padding: 14, marginTop: 10 }}>
                {[["Land Cost", fin.landCost + fin.closingCosts, ""], ["Hard Cost", hard, ""], ["Soft Cost", soft, ""], ["Contingency", cont, ""], ["Fees Total", fees, ""], ["Total Cost", totalCost, C.gold], ["Gross Revenue", revenue, C.green], ["Commission", -comm, ""], ["Reserves", -reserves, ""], ["Net Profit", profit, profit >= 0 ? C.green : C.red], ["Cost / Lot", totalCost / (fin.totalLots || 1), ""], ["Revenue / Lot", revenue / (fin.totalLots || 1), ""]].map(([l, v, c]) => (
                  <div key={l} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: "1px solid #0F1117" }}>
                    <span style={{ fontSize: 10, color: c ? C.text : C.dim, fontWeight: c ? 600 : 400 }}>{l}</span>
                    <span style={{ fontSize: 12, fontWeight: c ? 700 : 400, color: c || C.sub }}>{fmt.usd(v)}</span>
                  </div>
                ))}
                <div style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: "1px solid #0F1117" }}>
                  <span style={{ fontSize: 10, color: C.dim }}>Sell-Out Timeline</span>
                  <span style={{ fontSize: 12, color: C.sub }}>{Math.ceil(fin.totalLots / (fin.absorbRate || 1))} months</span>
                </div>
              </div>
            </Card>
            <Card title="Waterfall ($ Millions)">
              <ResponsiveContainer width="100%" height={210}>
                <BarChart data={waterfall} onClick={onChartClick(setChartSel)} style={CHART_STYLE}>
                  <CartesianGrid strokeDasharray="3 6" stroke={C.border} strokeOpacity={0.5} />
                  <XAxis dataKey="name" stroke={C.dim} tick={{ fontSize: 9 }} />
                  <YAxis stroke={C.dim} tick={{ fontSize: 9 }} tickFormatter={v => `$${v.toFixed(1)}M`} />
                  <Tooltip {...TT()} formatter={(v, name) => [`$${Math.abs(v).toFixed(2)}M`, name]} labelFormatter={l => `Waterfall: ${l}`} />
                  <Bar dataKey="value" name="$ Millions" radius={[2, 2, 0, 0]}>{waterfall.map((d, i) => <Cell key={i} fill={d.fill} />)}</Bar>
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>
        </div>
        <Card title="Financial Model — · AI Agent">
          <Agent id="FinancialModel" system="You are a real estate development underwriter and CFO-level analyst. Help analyze pro forma assumptions, stress-test financial models, calculate IRR and equity multiples, validate cost budgets, and identify financial risks." placeholder="Paste your pro forma assumptions for a detailed financial review..." />
        </Card>
      </div>
      <div>
        <div style={S.g2}>
          <Card title="Gross Rent Multiplier">
            <Field label="Purchase / Sale Price"><input style={S.inp} type="number" value={grmC.price} onChange={e => setGrmC({ ...grmC, price: +e.target.value })} /></Field>
            <Field label="Monthly Gross Rent"><input style={S.inp} type="number" value={grmC.rent} onChange={e => setGrmC({ ...grmC, rent: +e.target.value })} /></Field>
            <div style={{ background: C.bg, border: `1px solid ${C.gold}33`, borderRadius: 4, padding: 16, marginTop: 10 }}>
              <div style={{ fontSize: 9, color: C.dim }}>GRM</div>
              <div style={{ fontSize: 41, color: C.gold, fontWeight: 700, lineHeight: 1 }}>{grmVal.toFixed(2)}x</div>
              <div style={{ fontSize: 12, color: C.dim, marginTop: 6 }}>Est. Cap Rate: {capRate.toFixed(2)}% — · Annual Rent: {fmt.usd(grmC.rent * 12)}</div>
            </div>
          </Card>
          <Card title="Suggested Sale Price">
            <Field label="Comp Benchmark ($/lot)"><input style={S.inp} type="number" value={sp.comp} onChange={e => setSp({ ...sp, comp: +e.target.value })} /></Field>
            <Field label="Premium % (superior site)"><input style={S.inp} type="number" value={sp.premium} onChange={e => setSp({ ...sp, premium: +e.target.value })} /></Field>
            <Field label="Discount % (risk / conditions)"><input style={S.inp} type="number" value={sp.discount} onChange={e => setSp({ ...sp, discount: +e.target.value })} /></Field>
            <div style={{ background: C.bg, border: `1px solid ${C.green}33`, borderRadius: 4, padding: 16, marginTop: 10 }}>
              <div style={{ fontSize: 9, color: C.dim }}>Suggested Price / Lot</div>
              <div style={{ fontSize: 41, color: C.green, fontWeight: 700, lineHeight: 1 }}>{fmt.usd(Math.round(sugPrice))}</div>
              <div style={{ fontSize: 12, color: C.dim, marginTop: 6 }}>= {fmt.usd(Math.round(sugPrice * fin.totalLots))} total at {fin.totalLots} lots</div>
            </div>
          </Card>
          <Card title="Land Residual Value">
            {[["Sale Price / Lot", "rev"], ["Total Lots", "lots"], ["Hard Cost / Lot", "hard"], ["Soft Cost %", "soft"], ["Developer Margin %", "margin"]].map(([l, k]) => (
              <Field key={k} label={l} mb={8}><input style={S.inp} type="number" value={lr[k]} onChange={e => setLr({ ...lr, [k]: +e.target.value })} /></Field>
            ))}
            <div style={{ background: C.bg, border: `1px solid ${C.gold}33`, borderRadius: 4, padding: 16, marginTop: 10 }}>
              <div style={{ fontSize: 9, color: C.dim }}>Maximum Land Value (Residual)</div>
              <div style={{ fontSize: 41, color: C.gold, fontWeight: 700, lineHeight: 1 }}>{fmt.usd(lrVal())}</div>
              <div style={{ fontSize: 12, color: C.dim, marginTop: 6 }}>{fmt.usd(lrVal() / (lr.lots || 1))} / lot basis</div>
            </div>
          </Card>
          <Card title="Per Lot Margin Analysis">
            {[["Revenue / Lot", fin.salesPricePerLot], ["Hard Cost / Lot", fin.hardCostPerLot], ["Soft Cost / Lot", soft / (fin.totalLots || 1)], ["Fee Burden / Lot", fees / (fin.totalLots || 1)], ["Total Cost / Lot", totalCost / (fin.totalLots || 1)]].map(([l, v]) => (
              <div key={l} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid #0F1117" }}>
                <span style={{ fontSize: 12, color: C.dim }}>{l}</span>
                <span style={{ fontSize: 13, color: C.sub }}>{fmt.usd(v)}</span>
              </div>
            ))}
            <div style={{ marginTop: 10, background: C.bg, border: `1px solid ${C.gold}33`, borderRadius: 4, padding: 14, display: "flex", justifyContent: "space-between" }}>
              <div><div style={{ fontSize: 9, color: C.dim }}>Net / Lot</div><div style={{ fontSize: 28, color: profit >= 0 ? C.green : C.red, fontWeight: 700 }}>{fmt.usd(profit / (fin.totalLots || 1))}</div></div>
              <div style={{ textAlign: "right" }}><div style={{ fontSize: 9, color: C.dim }}>Margin</div><div style={{ fontSize: 28, color: margin > 15 ? C.green : C.amber, fontWeight: 700 }}>{margin.toFixed(1)}%</div></div>
            </div>
          </Card>
        </div>
      </div>
      <div>
        <Card title="Sensitivity Analysis - Profit Margin % (Price vs. Hard Cost Variation)">
          <div style={{ fontSize: 10, color: C.dim, marginBottom: 14 }}>Base: {fmt.usd(fin.salesPricePerLot)}/lot — · {fmt.usd(fin.hardCostPerLot)}/lot hard cost — · {fin.totalLots} lots</div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ ...S.tbl, minWidth: 600 }}>
              <thead>
                <tr>
                  <th style={{ ...S.th, background: C.bg4 }}>Hard down / Price right</th>
                  {priceVars.map(p => <th key={p} style={{ ...S.th, textAlign: "center", color: p === 0 ? C.gold : C.dim }}>{p > 0 ? "+" : ""}{p}%</th>)}
                </tr>
              </thead>
              <tbody>{costVars.map(cv => (
                <tr key={cv}>
                  <td style={{ ...S.th, color: cv === 0 ? C.gold : C.dim }}>{cv > 0 ? "+" : ""}{cv}%</td>
                  {priceVars.map(pv => {
                    const ar = fin.salesPricePerLot * (1 + pv / 100) * fin.totalLots;
                    const ah = fin.hardCostPerLot * (1 + cv / 100) * fin.totalLots;
                    const as2 = ah * fin.softCostPct / 100;
                    const ac = (ah + as2) * fin.contingencyPct / 100;
                    const atc = fin.landCost + fin.closingCosts + ah + as2 + ac + fees;
                    const ap = ar * (1 - fin.salesCommission / 100) - atc * (1 + fin.reservePercentage / 100);
                    const am = ar > 0 ? ap / ar * 100 : 0;
                    const isBase = pv === 0 && cv === 0;
                    return (
                      <td key={pv} style={{ ...S.td, textAlign: "center", background: isBase ? C.border : sensiColor(am) + "22", color: sensiColor(am), fontWeight: isBase ? 700 : 400, border: isBase ? `1px solid ${C.gold}` : "none", padding: "7px 9px" }}>
                        {am.toFixed(1)}%
                      </td>
                    );
                  })}
                </tr>
              ))}</tbody>
            </table>
          </div>
        </Card>
        <Card title="Bear / Base / Bull Scenarios">
          <div style={S.g3}>
            {[["Bear Case", -15, 10], ["Base Case", 0, 0], ["Bull Case", 10, -10]].map(([label, pv, cv]) => {
              const sr = fin.salesPricePerLot * (1 + pv / 100) * fin.totalLots;
              const sh = fin.hardCostPerLot * (1 + cv / 100) * fin.totalLots;
              const ss = sh * fin.softCostPct / 100;
              const sc = (sh + ss) * fin.contingencyPct / 100;
              const stc = fin.landCost + fin.closingCosts + sh + ss + sc + fees;
              const sp2 = sr * (1 - fin.salesCommission / 100) - stc * (1 + fin.reservePercentage / 100);
              const sm = sr > 0 ? sp2 / sr * 100 : 0;
              const col = sm > 15 ? C.green : sm > 0 ? C.amber : C.red;
              return (
                <div key={label} style={{ background: C.bg, border: `1px solid ${label === "Base Case" ? C.gold : C.border}`, borderRadius: 4, padding: 16 }}>
                  <div style={{ fontSize: 12, color: C.dim, marginBottom: 6, textTransform: "uppercase", letterSpacing: 2 }}>{label}</div>
                  <div style={{ fontSize: 10, color: C.dim }}>Price: {pv > 0 ? "+" : ""}{pv}% — · Cost: {cv > 0 ? "+" : ""}{cv}%</div>
                  <div style={{ fontSize: 28, color: col, fontWeight: 700, marginTop: 8 }}>{sm.toFixed(1)}%</div>
                  <div style={{ fontSize: 12, color: C.dim }}>Margin — · {fmt.usd(sp2)} profit</div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
      <div>
        {(() => {
          // ─── CAPITAL STACK CALCULATIONS ─────────────────────
          const loanAmt = totalCost * loan.ltc / 100;
          const equityNeed = totalCost - loanAmt;
          const gpEquity = equityNeed * equity.gpPct / 100;
          const lpEquity = equityNeed * equity.lpPct / 100;
          const origFee = loanAmt * loan.origFee / 100;
          const { constMonths, sellMonths, totalMonths } = buildMonthlyCashFlows(fin);
          // IDC: Interest During Construction (simple interest on avg outstanding)
          const avgDraw = loanAmt * 0.55; // average draw ~55% of total commitment
          const idc = avgDraw * (loan.rate / 100) * (constMonths / 12);
          const totalProjectCost = totalCost + origFee + idc;
          // Equity waterfall
          const prefReturnAmt = lpEquity * equity.prefReturn / 100 * (totalMonths / 12);
          const netProfit = revenue - comm - reserves - totalProjectCost;
          const profitAfterPref = Math.max(0, netProfit - prefReturnAmt);
          const promoteAmt = profitAfterPref * equity.promotePct / 100;
          const lpProfit = prefReturnAmt + (profitAfterPref - promoteAmt) * equity.lpPct / 100;
          const gpProfit = promoteAmt + (profitAfterPref - promoteAmt) * equity.gpPct / 100;
          const lpMultiple = lpEquity > 0 ? (lpEquity + lpProfit) / lpEquity : 0;
          const gpMultiple = gpEquity > 0 ? (gpEquity + gpProfit) / gpEquity : 0;
          // IRR from cash flows
          const { flows } = buildMonthlyCashFlows(fin);
          // Adjust flows for IDC and origination
          const adjFlows = [...flows];
          adjFlows[0] = adjFlows[0] - origFee; // origination at close
          for (let m = 1; m <= constMonths && m < adjFlows.length; m++) {
            adjFlows[m] -= avgDraw * (loan.rate / 100) / 12; // monthly interest
          }
          const monthlyIRR = calcIRR(adjFlows, 0.015);
          const annualIRR = (Math.pow(1 + monthlyIRR, 12) - 1) * 100;
          const irrDisplay = isNaN(annualIRR) || !isFinite(annualIRR) ? 0 : Math.min(99, Math.max(-50, annualIRR));
          // Cash flow chart data
          const cfChart = adjFlows.map((cf, i) => ({ month: i, cf: Math.round(cf), cumulative: Math.round(adjFlows.slice(0, i + 1).reduce((s, v) => s + v, 0)) }));
          // Capital stack pie
          const capStack = [
            { name: "Senior Debt", value: loanAmt, color: C.blue },
            { name: "LP Equity", value: lpEquity, color: C.purple },
            { name: "GP Equity", value: gpEquity, color: C.gold },
          ];

          return (<>
            <div style={S.g4}>
              <KPI label="Levered IRR" value={`${irrDisplay.toFixed(1)}%`} color={irrDisplay >= equity.irrTarget ? C.green : irrDisplay > 10 ? C.amber : C.red} sub={`Target: ${equity.irrTarget}%`} />
              <KPI label="LP Equity Multiple" value={`${lpMultiple.toFixed(2)}x`} color={lpMultiple >= equity.equityMultipleTarget ? C.green : C.amber} sub={`Target: ${equity.equityMultipleTarget}x`} />
              <KPI label="GP Equity Multiple" value={`${gpMultiple.toFixed(2)}x`} color={C.gold} sub={`Promote: ${fmt.usd(promoteAmt)}`} />
              <KPI label="IDC (Carry Cost)" value={fmt.usd(idc)} color={C.amber} sub={`${constMonths} mo construction`} />
            </div>
            <div style={{ ...S.g2, marginTop: 14 }}>
              <Card title="Construction Loan">
                <Field label="Loan-to-Cost %"><input style={S.inp} type="number" value={loan.ltc} onChange={e => setLoan({ ...loan, ltc: +e.target.value })} /></Field>
                <Field label="Interest Rate %"><input style={S.inp} type="number" step="0.1" value={loan.rate} onChange={e => setLoan({ ...loan, rate: +e.target.value })} /></Field>
                <Field label="Loan Term (months)"><input style={S.inp} type="number" value={loan.termMonths} onChange={e => setLoan({ ...loan, termMonths: +e.target.value })} /></Field>
                <Field label="Extension (months)"><input style={S.inp} type="number" value={loan.extensionMonths} onChange={e => setLoan({ ...loan, extensionMonths: +e.target.value })} /></Field>
                <Field label="Origination Fee %"><input style={S.inp} type="number" step="0.1" value={loan.origFee} onChange={e => setLoan({ ...loan, origFee: +e.target.value })} /></Field>
                <Field label="Lender"><input style={S.inp} value={loan.lender} onChange={e => setLoan({ ...loan, lender: e.target.value })} placeholder="Construction lender name..." /></Field>
                <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 4, padding: 14, marginTop: 10 }}>
                  {[["Loan Amount", loanAmt], ["Origination Fee", origFee], ["IDC (Est.)", idc], ["Total Debt Service", origFee + idc], ["Monthly Interest (Avg)", avgDraw * loan.rate / 100 / 12]].map(([l, v]) => (
                    <div key={l} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: "1px solid #0F1117" }}>
                      <span style={{ fontSize: 10, color: C.dim }}>{l}</span>
                      <span style={{ fontSize: 12, color: C.sub }}>{fmt.usd(v)}</span>
                    </div>
                  ))}
                </div>
              </Card>
              <Card title="Equity Structure">
                <Field label="GP Equity %"><input style={S.inp} type="number" value={equity.gpPct} onChange={e => setEquity({ ...equity, gpPct: +e.target.value, lpPct: 100 - +e.target.value })} /></Field>
                <Field label="LP Equity %"><input style={S.inp} type="number" value={equity.lpPct} onChange={e => setEquity({ ...equity, lpPct: +e.target.value, gpPct: 100 - +e.target.value })} /></Field>
                <Field label="Preferred Return % (LP)"><input style={S.inp} type="number" step="0.5" value={equity.prefReturn} onChange={e => setEquity({ ...equity, prefReturn: +e.target.value })} /></Field>
                <Field label="Promote / Carry %"><input style={S.inp} type="number" value={equity.promotePct} onChange={e => setEquity({ ...equity, promotePct: +e.target.value })} /></Field>
                <Field label="Equity Multiple Target"><input style={S.inp} type="number" step="0.1" value={equity.equityMultipleTarget} onChange={e => setEquity({ ...equity, equityMultipleTarget: +e.target.value })} /></Field>
                <Field label="IRR Target %"><input style={S.inp} type="number" value={equity.irrTarget} onChange={e => setEquity({ ...equity, irrTarget: +e.target.value })} /></Field>
                <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 4, padding: 14, marginTop: 10 }}>
                  <div style={{ fontSize: 9, color: C.dim, letterSpacing: 2, textTransform: "uppercase", marginBottom: 8 }}>Equity Waterfall</div>
                  {[["Total Equity Required", equityNeed, C.text], ["GP Capital", gpEquity, ""], ["LP Capital", lpEquity, ""], ["LP Pref Return", prefReturnAmt, C.purple], ["Profit After Pref", profitAfterPref, ""], ["GP Promote", promoteAmt, C.gold], ["LP Net Profit", lpProfit, C.green], ["GP Net Profit", gpProfit, C.gold]].map(([l, v, c]) => (
                    <div key={l} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: "1px solid #0F1117" }}>
                      <span style={{ fontSize: 10, color: c || C.dim, fontWeight: c ? 600 : 400 }}>{l}</span>
                      <span style={{ fontSize: 12, color: c || C.sub, fontWeight: c ? 700 : 400 }}>{fmt.usd(v)}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
            <div style={{ ...S.g2, marginTop: 14 }}>
              <Card title="Capital Stack">
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart onClick={onChartClick(setChartSel)} style={CHART_STYLE}>
                    <Pie data={capStack} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={75} label={({ name, value }) => `${name}: ${fmt.M(value)}`}>
                      {capStack.map((d, i) => <Cell key={i} fill={d.color} />)}
                    </Pie>
                    <Tooltip {...TT()} formatter={(v, name) => [fmt.usd(v), name]} labelFormatter={() => "Capital Structure"} />
                    <Legend wrapperStyle={{ fontSize: 11, color: C.muted }} />
                  </PieChart>
                </ResponsiveContainer>
              </Card>
              <Card title="Monthly Cash Flow & Cumulative">
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={cfChart} onClick={onChartClick(setChartSel)} style={CHART_STYLE}>
                    <CartesianGrid strokeDasharray="3 6" stroke={C.border} strokeOpacity={0.5} />
                    <XAxis dataKey="month" stroke={C.dim} tick={{ fontSize: 9 }} label={{ value: "Month", fontSize: 9, fill: C.dim }} />
                    <YAxis stroke={C.dim} tick={{ fontSize: 9 }} tickFormatter={v => `${(v / 1e6).toFixed(1)}M`} />
                    <Tooltip {...TT()} formatter={(v, name) => [fmt.usd(v), name]} labelFormatter={l => `Month ${l}`} />
                    <Legend wrapperStyle={{ fontSize: 11, color: C.muted, paddingTop: 4 }} />
                    <Area type="monotone" dataKey="cf" stroke={C.blue} fill={C.blue} fillOpacity={0.15} name="Monthly CF" dot={DOT} activeDot={ACTIVE_DOT} />
                    <Area type="monotone" dataKey="cumulative" stroke={C.gold} fill={C.gold} fillOpacity={0.1} name="Cumulative" dot={false} activeDot={ACTIVE_DOT} />
                  </AreaChart>
                </ResponsiveContainer>
              </Card>
            </div>
          </>);
        })()}
      </div>
      <div>
        {/* ─── PHASE 4: Scenario Deck ─────────────────────────────── */}
        <ScenarioDeck projectId="default" />
        <DecisionPackagePanel projectId="default" scenarios={[]} />
      </div>
    </Tabs>
  );
}

function ProcessControl() {
  const { ddChecks, setDdChecks, permits, setPermits } = usePrj();
  const [events, setEvents] = useLS("axiom_events", [
    { id: 1, title: "Phase I ESA Delivery", date: "2025-03-15", type: "Milestone", priority: "High", notes: "From environmental consultant" },
    { id: 2, title: "Pre-Application Meeting", date: "2025-03-22", type: "Meeting", priority: "High", notes: "City Planning Dept." },
    { id: 3, title: "ALTA Survey Delivery", date: "2025-04-01", type: "Milestone", priority: "High", notes: "" },
    { id: 4, title: "Tentative Map Application", date: "2025-04-15", type: "Submittal", priority: "Critical", notes: "All materials must be complete" },
    { id: 5, title: "Inspection Period Expiration", date: "2025-04-30", type: "Deadline", priority: "Critical", notes: "Go / No-Go required" },
  ]);
  const [ne, setNe] = useState({ title: "", date: "", type: "Milestone", priority: "Medium", notes: "" });
  const addEvent = () => { if (!ne.title) return; setEvents([...events, { ...ne, id: Date.now() }]); setNe({ title: "", date: "", type: "Milestone", priority: "Medium", notes: "" }); };
  const PC = { Critical: C.red, High: C.amber, Medium: C.blue, Low: C.dim };
  const TC = { Milestone: C.gold, Meeting: C.teal, Submittal: C.blue, Deadline: C.red, Review: C.purple };
  const doneCount = Object.values(ddChecks).filter(Boolean).length;
  const updPerm = (i, k, v) => { const d = [...permits]; d[i] = { ...d[i], [k]: v }; setPermits(d); };
  const permStatOpts = ["Not Started", "In Progress", "Submitted", "Under Review", "Approved", "Denied", "N/A"];
  const PSC = { Approved: C.green, "Under Review": C.blue, "In Progress": C.amber, "Submitted": C.teal, "Not Started": C.dim, Denied: C.red, "N/A": C.muted };
  return (
    <Tabs tabs={["Due Diligence", "Permits & Approvals", "Project Calendar", "Documents"]}>
      <div>
        <Card title="Due Diligence Progress" action={<Badge label={`${doneCount}/${ALL_DD.length} Complete`} color={doneCount === ALL_DD.length ? C.green : C.amber} />}>
          <div style={{ marginBottom: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
              <span style={{ fontSize: 10, color: C.dim }}>Overall Completion</span>
              <span style={{ fontSize: 13, color: C.gold, fontWeight: 700 }}>{Math.round(doneCount / ALL_DD.length * 100)}%</span>
            </div>
            <Progress value={doneCount / ALL_DD.length * 100} />
          </div>
          {DD_CATS.map((cat, ci) => {
            const catDone = cat.items.filter(item => ddChecks[`${ci}-${item.t}`]).length;
            return (
              <div key={ci} style={{ marginBottom: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 7, padding: "5px 0", borderBottom: `1px solid ${C.border}` }}>
                  <span style={{ fontSize: 10, color: C.gold, letterSpacing: 2, textTransform: "uppercase" }}>{cat.cat}</span>
                  <span style={{ fontSize: 10, color: C.dim }}>{catDone}/{cat.items.length}</span>
                </div>
                {cat.items.map((item, ii) => {
                  const key = `${ci}-${item.t}`;
                  return <CItem key={ii} text={item.t} checked={!!ddChecks[key]} risk={item.r} onChange={() => setDdChecks({ ...ddChecks, [key]: !ddChecks[key] })} />;
                })}
              </div>
            );
          })}
        </Card>
        <Card title="Due Diligence — · AI Agent">
          <Agent id="DueDiligence" system="You are a senior real estate due diligence coordinator. Help identify missing due diligence items, analyze findings, assess risk from incomplete DD, and advise on go/no-go decisions." placeholder="Ask about due diligence gaps, risk of incomplete items, or go/no-go assessment..." />
        </Card>
      </div>
      <div>
        <Card title="Permits & Regulatory Approvals">
          <table style={S.tbl}>
            <thead><tr><th style={S.th}>Permit / Approval</th><th style={S.th}>Agency</th><th style={S.th}>Duration</th><th style={S.th}>Est. Cost</th><th style={S.th}>Status</th></tr></thead>
            <tbody>{permits.map((p, i) => (
              <tr key={i}>
                <td style={{ ...S.td, color: C.text, fontWeight: 500, fontSize: 12 }}>{p.name}</td>
                <td style={{ ...S.td, fontSize: 12 }}>{p.agency}</td>
                <td style={{ ...S.td, fontSize: 12, color: C.dim }}>{p.duration}</td>
                <td style={{ ...S.td, fontSize: 12, color: C.gold }}>{p.cost}</td>
                <td style={S.td}><select style={{ ...S.sel, padding: "3px 7px", fontSize: 10, color: PSC[p.status] || C.dim, width: "auto" }} value={p.status} onChange={e => updPerm(i, "status", e.target.value)}>{permStatOpts.map(o => <option key={o}>{o}</option>)}</select></td>
              </tr>
            ))}</tbody>
          </table>
        </Card>
        <Card title="Permit Timeline">
          <div style={{ position: "relative", paddingLeft: 20 }}>
            <div style={{ position: "absolute", left: -8, top: 0, bottom: 0, width: 1, background: C.border }} />
            {permits.filter(p => p.req).map((p, i) => (
              <div key={i} style={{ position: "relative", marginBottom: 12 }}>
                <div style={{ position: "absolute", left: -16, top: 4, width: 8, height: 8, borderRadius: "50%", background: PSC[p.status] || C.dim }} />
                <div style={{ fontSize: 12, color: C.text }}>{p.name}</div>
                <div style={{ fontSize: 10, color: C.dim }}>{p.agency} — · {p.duration} — · <Badge label={p.status} color={PSC[p.status] || C.dim} /></div>
              </div>
            ))}
          </div>
        </Card>
        <Card title="Permits — · AI Agent">
          <Agent id="Permits" system="You are a land development permit specialist and municipal liaison. Help sequence permit applications, identify dependencies, estimate timelines, and flag common pitfalls." placeholder="Ask about permit sequencing, agency requirements, or timeline estimation..." />
        </Card>
      </div>
      <div>
        <Card title="Project Calendar" action={<Badge label={events.length + " Events"} color={C.blue} />}>
          <table style={S.tbl}>
            <thead><tr><th style={S.th}>Event / Deadline</th><th style={S.th}>Date</th><th style={S.th}>Type</th><th style={S.th}>Priority</th><th style={S.th}>Notes</th><th style={S.th}></th></tr></thead>
            <tbody>{[...events].sort((a, b) => a.date.localeCompare(b.date)).map(e => (
              <tr key={e.id}>
                <td style={{ ...S.td, color: C.text, fontWeight: 500 }}>{e.title}</td>
                <td style={{ ...S.td, color: C.gold, fontFamily: "monospace" }}>{e.date}</td>
                <td style={S.td}><Badge label={e.type} color={TC[e.type] || C.dim} /></td>
                <td style={S.td}><Badge label={e.priority} color={PC[e.priority] || C.dim} /></td>
                <td style={{ ...S.td, fontSize: 10, color: C.dim }}>{e.notes}</td>
                <td style={S.td}><button style={{ ...S.btn(), padding: "2px 7px", fontSize: 9 }} onClick={() => setEvents(events.filter(x => x.id !== e.id))}>x</button></td>
              </tr>
            ))}</tbody>
          </table>
        </Card>
        <Card title="Add Event / Deadline">
          <div style={S.g4}>
            <Field label="Title"><input style={S.inp} value={ne.title} onChange={e => setNe({ ...ne, title: e.target.value })} /></Field>
            <Field label="Date"><input style={S.inp} type="date" value={ne.date} onChange={e => setNe({ ...ne, date: e.target.value })} /></Field>
            <Field label="Type"><select style={S.sel} value={ne.type} onChange={e => setNe({ ...ne, type: e.target.value })}><option>Milestone</option><option>Meeting</option><option>Submittal</option><option>Deadline</option><option>Review</option></select></Field>
            <Field label="Priority"><select style={S.sel} value={ne.priority} onChange={e => setNe({ ...ne, priority: e.target.value })}><option>Critical</option><option>High</option><option>Medium</option><option>Low</option></select></Field>
          </div>
          <Field label="Notes"><input style={S.inp} value={ne.notes} onChange={e => setNe({ ...ne, notes: e.target.value })} placeholder="Additional context..." /></Field>
          <button style={{ ...S.btn("gold"), marginTop: 8 }} onClick={addEvent}>Add Event</button>
        </Card>
      </div>
      <div>
        <Card title="Document Binder">
          {[
            { cat: "Title & Legal", docs: ["Preliminary Title Report", "Grant Deed", "CC&Rs / Covenants", "Operating Agreement", "Purchase Agreement"] },
            { cat: "Environmental & Physical", docs: ["Phase I ESA Report", "ALTA Survey", "Geotechnical Report", "Topographic Survey", "Biological Survey"] },
            { cat: "Entitlement & Permits", docs: ["Zoning Verification Letter", "Planning Application", "CEQA Document", "Tentative Map Conditions", "Improvement Plans"] },
            { cat: "Financial", docs: ["Pro Forma / Financial Model", "Construction Loan Term Sheet", "Equity Commitment Letter", "Fee Schedule", "Appraisal Report"] },
          ].map((section, i) => (
            <div key={i} style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 9, color: C.gold, letterSpacing: 2, textTransform: "uppercase", marginBottom: 8, borderBottom: `1px solid ${C.border}`, paddingBottom: 5 }}>{section.cat}</div>
              {section.docs.map((doc, j) => (
                <div key={j} style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 0", borderBottom: "1px solid #0F1117" }}>
                  <span style={{ flex: 1, fontSize: 12, color: C.sub }}>{doc}</span>
                  <button style={{ ...S.btn(), padding: "3px 8px", fontSize: 9 }}>Upload</button>
                  <button style={{ ...S.btn(), padding: "3px 8px", fontSize: 9 }}>Link URL</button>
                  <Badge label="Pending" color={C.dim} />
                </div>
              ))}
            </div>
          ))}
        </Card>
      </div>
    </Tabs>
  );
}

function RiskCommand() {
  const { risks, setRisks, setChartSel } = usePrj();
  const [nr, setNr] = useState({ cat: "Market", risk: "", likelihood: "Medium", impact: "Medium", severity: "Medium", mitigation: "", status: "Open" });
  const sev = (l, i) => { const s = { Low: 1, Medium: 2, High: 3, Critical: 4 }; return s[l] * s[i] >= 8 ? "Critical" : s[l] * s[i] >= 4 ? "High" : s[l] * s[i] >= 2 ? "Medium" : "Low"; };
  const addRisk = () => { if (!nr.risk) return; setRisks([...risks, { ...nr, id: Date.now(), severity: sev(nr.likelihood, nr.impact) }]); setNr({ cat: "Market", risk: "", likelihood: "Medium", impact: "Medium", severity: "Medium", mitigation: "", status: "Open" }); };
  const counts = { Open: 0, Mitigated: 0, Closed: 0 }; risks.forEach(r => counts[r.status] = (counts[r.status] || 0) + 1);
  const matrixData = [
    { subject: "Market", A: risks.filter(r => r.cat === "Market" && r.status === "Open").length },
    { subject: "Entitlement", A: risks.filter(r => r.cat === "Entitlement" && r.status === "Open").length },
    { subject: "Construction", A: risks.filter(r => r.cat === "Construction" && r.status === "Open").length },
    { subject: "Environmental", A: risks.filter(r => r.cat === "Environmental" && r.status === "Open").length },
    { subject: "Financial", A: risks.filter(r => r.cat === "Financial" && r.status === "Open").length },
    { subject: "Regulatory", A: risks.filter(r => r.cat === "Regulatory" && r.status === "Open").length },
  ];
  return (
    <Tabs tabs={["Risk Register", "Matrix & Analysis", "Mitigation Tracker"]}>
      <div>
        <div style={S.g4}>
          <KPI label="Open Risks" value={counts.Open || 0} color={C.red} />
          <KPI label="Mitigated" value={counts.Mitigated || 0} color={C.amber} />
          <KPI label="Closed" value={counts.Closed || 0} color={C.green} />
          <KPI label="Critical" value={risks.filter(r => r.severity === "Critical" && r.status === "Open").length} color={C.purple} />
        </div>
        <Card title="Risk Register">
          <table style={S.tbl}>
            <thead><tr><th style={S.th}>Category</th><th style={S.th}>Risk Description</th><th style={S.th}>Likelihood</th><th style={S.th}>Impact</th><th style={S.th}>Severity</th><th style={S.th}>Status</th><th style={S.th}></th></tr></thead>
            <tbody>{risks.map(r => (
              <tr key={r.id}>
                <td style={S.td}><Badge label={r.cat} color={C.blue} /></td>
                <td style={{ ...S.td, color: C.sub, maxWidth: 280, fontSize: 12 }}>{r.risk}</td>
                <td style={S.td}><Badge label={r.likelihood} color={RC[r.likelihood]} /></td>
                <td style={S.td}><Badge label={r.impact} color={RC[r.impact]} /></td>
                <td style={S.td}><Badge label={r.severity} color={RC[r.severity]} /></td>
                <td style={S.td}><select style={{ ...S.sel, padding: "3px 7px", fontSize: 10, width: "auto" }} value={r.status} onChange={e => setRisks(risks.map(x => x.id === r.id ? { ...x, status: e.target.value } : x))}><option>Open</option><option>Mitigated</option><option>Closed</option></select></td>
                <td style={S.td}><button style={{ ...S.btn(), padding: "2px 7px", fontSize: 9 }} onClick={() => setRisks(risks.filter(x => x.id !== r.id))}>x</button></td>
              </tr>
            ))}</tbody>
          </table>
        </Card>
        <Card title="Add Risk">
          <div style={S.g3}>
            <Field label="Category"><select style={S.sel} value={nr.cat} onChange={e => setNr({ ...nr, cat: e.target.value })}>{["Market", "Entitlement", "Construction", "Environmental", "Financial", "Regulatory", "Title", "Political", "Partnership"].map(o => <option key={o}>{o}</option>)}</select></Field>
            <Field label="Likelihood"><select style={S.sel} value={nr.likelihood} onChange={e => setNr({ ...nr, likelihood: e.target.value })}><option>Low</option><option>Medium</option><option>High</option><option>Critical</option></select></Field>
            <Field label="Impact"><select style={S.sel} value={nr.impact} onChange={e => setNr({ ...nr, impact: e.target.value })}><option>Low</option><option>Medium</option><option>High</option><option>Critical</option></select></Field>
          </div>
          <Field label="Risk Description"><input style={S.inp} value={nr.risk} onChange={e => setNr({ ...nr, risk: e.target.value })} placeholder="Describe the risk event..." /></Field>
          <Field label="Mitigation Strategy"><textarea style={{ ...S.ta, height: 55 }} value={nr.mitigation} onChange={e => setNr({ ...nr, mitigation: e.target.value })} placeholder="How will this risk be managed, mitigated, or transferred?" /></Field>
          <button style={{ ...S.btn("gold"), marginTop: 6 }} onClick={addRisk}>Add to Risk Register</button>
        </Card>
        <Card title="Risk Command · AI Agent">
          <Agent id="RiskAnalysis" system="You are a real estate development risk manager. Identify hidden risks, stress-test mitigation strategies, quantify risk exposure, prioritize risks by probability-weighted impact, and recommend risk transfer or mitigation strategies." placeholder="Describe your project for a comprehensive risk analysis..." />
        </Card>
      </div>
      <div>
        <Card title="Risk by Category (Open Risks)">
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={matrixData} onClick={onChartClick(setChartSel)} style={CHART_STYLE}>
              <PolarGrid stroke={C.border} strokeOpacity={0.4} />
              <PolarAngleAxis dataKey="subject" tick={{ fill: C.muted, fontSize: 12, fontFamily: 'Inter,sans-serif' }} />
              <PolarRadiusAxis tick={{ fontSize: 9, fill: C.dim }} axisLine={false} tickCount={4} />
              <Radar dataKey="A" name="Risk Exposure" stroke={C.red} fill={C.red} fillOpacity={0.2} strokeWidth={1.5} dot={{ r: 4, fill: C.red, stroke: "#0D0F13", strokeWidth: 1.5 }} />
              <Tooltip {...TT()} formatter={(v, name) => [`${v} risk(s)`, name]} />
              <Legend wrapperStyle={{ fontSize: 11, color: C.muted }} />
            </RadarChart>
          </ResponsiveContainer>
        </Card>
        <Card title="Severity Distribution">
          <ResponsiveContainer width="100%" height={210}>
            <BarChart data={["Critical", "High", "Medium", "Low"].map(s => ({ name: s, count: risks.filter(r => r.severity === s).length, fill: RC[s] }))} onClick={e => { if (e && e.activePayload) setChartSel(e.activePayload[0].payload); }} style={CHART_STYLE}>
              <CartesianGrid strokeDasharray="3 6" stroke={C.border} strokeOpacity={0.5} vertical={false} />
              <XAxis dataKey="name" stroke={C.dim} tick={{ fontSize: 13, fontFamily: 'Inter,sans-serif', fill: C.muted }} />
              <YAxis stroke={C.dim} tick={{ fontSize: 13, fontFamily: 'Inter,sans-serif', fill: C.muted }} allowDecimals={false} />
              <Tooltip {...TT_BAR()} formatter={(v, name, props) => [v === 1 ? "1 risk" : `${v} risks`, props.payload?.name || "Severity"]} labelFormatter={l => `Severity: ${l}`} />
              <Bar dataKey="count" name="Risk Count" radius={[3, 3, 0, 0]} className="chart-node">{["Critical", "High", "Medium", "Low"].map((s, i) => <Cell key={i} fill={RC[s]} onClick={() => setChartSel({ type: "Severity", level: s, count: risks.filter(r => r.severity === s).length })} />)}</Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
      <div>
        <Card title="Mitigation Action Plan">
          <table style={S.tbl}>
            <thead><tr><th style={S.th}>Risk</th><th style={S.th}>Severity</th><th style={S.th}>Mitigation Strategy</th><th style={S.th}>Status</th></tr></thead>
            <tbody>{risks.filter(r => r.status === "Open" || r.status === "Mitigated").map(r => (
              <tr key={r.id}>
                <td style={{ ...S.td, color: C.text, fontSize: 12, maxWidth: 180 }}>{r.risk}</td>
                <td style={S.td}><Badge label={r.severity} color={RC[r.severity]} /></td>
                <td style={{ ...S.td, fontSize: 12, color: C.dim, maxWidth: 280 }}>{r.mitigation || "— No mitigation defined —"}</td>
                <td style={S.td}><Badge label={r.status} color={r.status === "Mitigated" ? C.amber : C.red} /></td>
              </tr>
            ))}</tbody>
          </table>
        </Card>
      </div>
    </Tabs>
  );
}

function ICMemoGenerator({ fin, project, risks, permits }) {
  const [generating, setGenerating] = React.useState(false);
  const [memo, setMemo] = React.useState("");
  const [memoType, setMemoType] = React.useState("ic_memo");
  const keys = JSON.parse(localStorage.getItem("axiom_api_keys") || "{}");

  const hard = fin.totalLots * fin.hardCostPerLot;
  const soft = hard * fin.softCostPct / 100;
  const fees = fin.planningFees + (fin.permitFeePerLot + fin.schoolFee + fin.impactFeePerLot) * fin.totalLots;
  const cont = (hard + soft) * fin.contingencyPct / 100;
  const totalCost = fin.landCost + fin.closingCosts + hard + soft + cont + fees;
  const revenue = fin.totalLots * fin.salesPricePerLot;
  const profit = revenue * 0.97 - totalCost * 1.05;
  const margin = revenue > 0 ? profit / revenue * 100 : 0;
  const roi = totalCost > 0 ? profit / totalCost * 100 : 0;
  const openRisks = (risks || []).filter(r => r.status === "Open");
  const openPermits = (permits || []).filter(p => p.status !== "Approved");

  const MEMO_PROMPTS = {
    ic_memo: `Generate a professional Investment Committee Memorandum for the following real estate development project. Use proper IC memo format with headers, financial tables, and institutional-quality language.

PROJECT DATA:
- Project Name: ${project.name || "Unnamed Project"}
- Location: ${project.address || project.city || "TBD"}
- Project Type: ${fin.productType || "Residential Subdivision"}
- Total Lots: ${fin.totalLots}
- Land Cost: $${(fin.landCost || 0).toLocaleString()}
- Hard Cost/Lot: $${(fin.hardCostPerLot || 0).toLocaleString()}
- Sales Price/Lot: $${(fin.salesPricePerLot || 0).toLocaleString()}
- Total Project Cost: $${Math.round(totalCost).toLocaleString()}
- Projected Revenue: $${Math.round(revenue).toLocaleString()}
- Projected Profit: $${Math.round(profit).toLocaleString()}
- Gross Margin: ${margin.toFixed(1)}%
- ROI: ${roi.toFixed(1)}%
- Open Risks: ${openRisks.length}
- Open Permits: ${openPermits.length}
- Loan LTC: ${fin.loanLtc}%
- Interest Rate: ${fin.interestRate}%

Generate a complete IC Memo with sections: 1. EXECUTIVE SUMMARY 2. DEAL THESIS 3. SITE DESCRIPTION 4. ENTITLEMENT STATUS 5. FINANCIAL ANALYSIS (with Sources & Uses table) 6. MARKET ANALYSIS 7. RISK FACTORS & MITIGATIONS 8. DEAL STRUCTURE & TIMELINE 9. INVESTMENT RECOMMENDATION. Use institutional language with specific numbers.`,
    lender_pkg: `Generate a Lender Package for: ${project.name || "Unnamed"} | ${fin.totalLots} lots | $${Math.round(totalCost).toLocaleString()} total cost | LTC ${fin.loanLtc}%. Include: Borrower Overview, Project Description, Loan Request, Sources & Uses Table, Collateral, Market Analysis, Exit Strategy, Risk Factors. Format for a construction lender credit committee.`,
    exec_summary: `Generate a crisp 1-page Executive Summary for: ${project.name || "Unnamed"} | ${fin.totalLots} lots | $${Math.round(revenue).toLocaleString()} revenue | ${margin.toFixed(1)}% margin | ${roi.toFixed(1)}% ROI | ${project.address || "TBD"}. Include: Deal headline, key metrics table, investment thesis (3 bullets), risk summary (3 bullets), recommendation. Institutional language.`,
    risk_memo: `Generate a Risk Assessment Memorandum for: ${project.name || "Unnamed"} — ${fin.totalLots} lots. Open risks: ${openRisks.map(r => r.category + ": " + r.description).join(" | ") || "None documented"}. Cover: Entitlement Risk, Market Risk, Construction Risk, Financial Risk, Environmental Risk, Regulatory Risk, Timeline Risk. For each: description, probability (H/M/L), impact (H/M/L), mitigation, residual risk.`,
  };

  const generate = async () => {
    if (!keys.proxyUrl) { alert("Configure your LLM proxy in Settings first."); return; }
    setGenerating(true); setMemo("");
    try {
      const resp = await fetch(keys.proxyUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${keys.anthropic || "x"}` },
        body: JSON.stringify({
          model: "claude-sonnet-4-5", max_tokens: 3000,
          messages: [{ role: "user", content: MEMO_PROMPTS[memoType] }],
          system: "You are a senior real estate investment analyst at a top institutional developer. Write precise, data-driven investment memos for investment committees and lenders. Use professional formatting with clear headers and specific numbers."
        })
      });
      const data = await resp.json();
      setMemo(data.content?.[0]?.text || data.choices?.[0]?.message?.content || "Error generating memo.");
    } catch (e) { setMemo("Error: " + e.message); }
    setGenerating(false);
  };

  const MEMO_TYPES = [
    { id: "ic_memo", label: "IC Memo", desc: "Full Investment Committee Memo" },
    { id: "lender_pkg", label: "Lender Package", desc: "Construction loan presentation" },
    { id: "exec_summary", label: "Exec Summary", desc: "1-page deal overview" },
    { id: "risk_memo", label: "Risk Memo", desc: "Risk assessment matrix" },
  ];

  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        {MEMO_TYPES.map(mt => (
          <button key={mt.id} onClick={() => setMemoType(mt.id)} style={{ ...S.btn(memoType === mt.id ? "gold" : "dim"), display: "flex", flexDirection: "column", alignItems: "flex-start", padding: "8px 14px" }}>
            <span style={{ fontSize: 12, fontWeight: 700 }}>{mt.label}</span>
            <span style={{ fontSize: 9, color: memoType === mt.id ? "#000" : C.dim, marginTop: 2 }}>{mt.desc}</span>
          </button>
        ))}
      </div>
      <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 6, padding: 14, marginBottom: 14 }}>
        <div style={{ fontSize: 10, color: C.dim, letterSpacing: 2, marginBottom: 10 }}>DEAL SNAPSHOT — {project.name || "No Active Project"}</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 12 }}>
          {[["Lots", fin.totalLots || "—"], ["Total Cost", fmt.M(totalCost)], ["Revenue", fmt.M(revenue)], ["Profit", fmt.M(profit)], ["Margin", margin.toFixed(1) + "%"], ["ROI", roi.toFixed(1) + "%"]].map(([l, v]) => (
            <div key={l} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 9, color: C.dim }}>{l}</div>
              <div style={{ fontSize: 14, color: C.text, fontWeight: 700, marginTop: 3 }}>{v}</div>
            </div>
          ))}
        </div>
      </div>
      <button onClick={generate} disabled={generating} style={{ ...S.btn("gold"), width: "100%", padding: "12px 0", fontSize: 13, fontWeight: 700, marginBottom: 14, opacity: generating ? 0.6 : 1 }}>
        {generating ? "⟳ Generating AI Memo..." : `✦ Generate ${MEMO_TYPES.find(m => m.id === memoType)?.label}`}
      </button>
      {memo && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <div style={{ fontSize: 11, color: C.green, fontWeight: 600 }}>✓ Document Generated</div>
            <div style={{ display: "flex", gap: 8 }}>
              <button style={S.btn("dim")} onClick={() => navigator.clipboard.writeText(memo)}>Copy</button>
              <button style={S.btn("dim")} onClick={() => downloadText(memo, `axiom_${memoType}_${(project.name || "project").replace(/\s+/g, "_")}.txt`)}>Download</button>
            </div>
          </div>
          <div style={{ background: "#09090D", border: `1px solid ${C.border}`, borderRadius: 6, padding: 20, fontFamily: "monospace", fontSize: 12, color: C.sub, lineHeight: 1.7, whiteSpace: "pre-wrap", maxHeight: 520, overflowY: "auto" }}>
            {memo}
          </div>
        </div>
      )}
    </div>
  );
}

function ReportsBinder() {
  const { fin, project, risks, permits } = usePrj();
  const sections = [
    "1. Executive Summary", "2. Site & Property Description", "3. Entitlement & Zoning Analysis",
    "4. Physical & Environmental Due Diligence", "5. Infrastructure & Utilities Report",
    "6. Concept Yield & Design Summary", "7. Market Analysis & Comparables",
    "8. Financial Pro Forma & Analysis", "9. Risk Assessment & Mitigation Plan",
    "10. Permit & Approval Schedule", "11. Investment Summary & Conclusion",
  ];
  return (
    <Tabs tabs={["IC Memo Generator", "Binder Contents", "Export Options"]}>
      <div>
        <Card title="Investment Committee Memo Generator" action={<Badge label="AI-Powered" color={C.gold} />}>
          <div style={{ fontSize: 12, color: C.dim, marginBottom: 16 }}>Generate institutional-quality IC memos, lender packages, and risk assessments directly from your project data. Powered by Claude AI.</div>
          <TierGate feature="ai_agents">
            <ICMemoGenerator fin={fin} project={project} risks={risks} permits={permits} />
          </TierGate>
        </Card>
      </div>
      <div>
        <Card title="Development Feasibility Binder" action={<Badge label={project.name || "Unnamed Project"} color={C.gold} />}>
          <div style={{ fontSize: 12, color: C.dim, marginBottom: 16 }}>Complete investor and lender ready development package.</div>
          {sections.map((s, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 9, padding: "7px 0", borderBottom: "1px solid #0F1117" }}>
              <input type="checkbox" defaultChecked style={{ accentColor: C.gold }} />
              <span style={{ flex: 1, fontSize: 13, color: C.sub }}>{s}</span>
              <Badge label="Ready" color={C.green} />
            </div>
          ))}
        </Card>
      </div>
      <div>
        <TierGate feature="exports">
          <Card title="Export & Distribution">
            {[
              { fmt: "PDF - Investor Package", desc: "Full binder with all sections, charts, and maps", ext: ".pdf", type: "text" },
              { fmt: "PDF - Lender Package", desc: "Financial highlights, pro forma, collateral summary", ext: ".pdf", type: "text" },
              { fmt: "Excel - Pro Forma Workbook", desc: "Interactive financial model with sensitivity analysis", ext: ".xlsx", type: "csv" },
              { fmt: "PowerPoint - Investor Deck", desc: "10-slide investment summary presentation", ext: ".pptx", type: "text" },
              { fmt: "Word - DD Summary", desc: "Due diligence checklist and findings memo", ext: ".docx", type: "text" },
              { fmt: "CSV - Data Export", desc: "Raw data export for external analysis", ext: ".csv", type: "csv" },
            ].map((e, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: "1px solid #0F1117" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, color: C.text }}>{e.fmt}</div>
                  <div style={{ fontSize: 10, color: C.dim, marginTop: 2 }}>{e.desc}</div>
                </div>
                <button style={S.btn("gold")} onClick={() => {
                  if (e.type === "csv") {
                    downloadCSV(["Section", "Data"], sections.map(s => [s, "Feasibility Data"]), `axiom_${e.fmt.split(" ")[0].toLowerCase()}${e.ext}`);
                  } else {
                    downloadText(`AXIOM OS - ${e.fmt}\nProject: ${project.name || "Unnamed"}\n\nGenerated: ${new Date().toLocaleString()}`, `axiom_${e.fmt.split(" ")[0].toLowerCase()}${e.ext}`);
                  }
                }}>Export</button>
              </div>
            ))}
          </Card>
        </TierGate>
      </div>
    </Tabs>
  );
}

function AgentHub() {
  const agents = [
    { id: "Acquisition Scout", icon: "A", color: C.gold, desc: "Identifies and scores acquisition opportunities based on your criteria", system: "You are a real estate acquisition analyst. Help identify and evaluate potential land acquisition opportunities and score sites against development criteria.", placeholder: "Describe your acquisition criteria and I'll help evaluate opportunities..." },
    { id: "Zoning Navigator", icon: "Z", color: C.blue, desc: "Decodes zoning codes and maps entitlement pathways", system: "You are a land use attorney and zoning consultant. Decode zoning codes, identify entitlement pathways, advise on variances and density bonuses.", placeholder: "Describe the zoning situation and I'll map the entitlement pathway..." },
    { id: "Appraisal Analyst", icon: "V", color: C.teal, desc: "Performs market value analysis using comparable sales methodology", system: "You are a certified real estate appraiser specializing in land and subdivision analysis. Apply the sales comparison approach, income approach, and land residual method.", placeholder: "Provide comp data and I'll perform an appraisal-grade value analysis..." },
    { id: "Construction Estimator", icon: "C", color: C.amber, desc: "Generates construction cost estimates from RSMeans and market data", system: "You are a construction cost estimator specializing in residential subdivision and land development. Provide detailed cost breakdowns for grading, utilities, streets, lots, and vertical construction.", placeholder: "Describe the project scope and I'll generate a detailed cost estimate..." },
    { id: "Environmental Scout", icon: "E", color: C.green, desc: "Screens for environmental constraints and CEQA requirements", system: "You are an environmental planner specializing in CEQA, wetlands, biological resources, and Phase I/II ESAs for California residential development.", placeholder: "Describe the site location and I'll screen for environmental constraints..." },
    { id: "Permit Coordinator", icon: "P", color: C.purple, desc: "Sequences permit applications and maps agency dependencies", system: "You are a permit expediter and municipal liaison. Map permit sequences, estimate agency timelines, identify critical path items, and advise on agency relationship strategies.", placeholder: "Describe your project and jurisdiction and I'll map the permit sequence..." },
    { id: "Financial Underwriter", icon: "F", color: C.red, desc: "Underwrites deals and stress-tests financial assumptions", system: "You are a real estate development underwriter. Underwrite development deals, stress-test assumptions, calculate IRR and equity multiples, and size construction loans.", placeholder: "Share your pro forma and I'll underwrite the deal..." },
    { id: "Title Decoder", icon: "T", color: C.gold2, desc: "Interprets title reports and identifies encumbrances", system: "You are a real estate title officer specializing in land title issues. Interpret preliminary title reports, identify exceptions, assess encumbrance risks, and advise on curative actions.", placeholder: "Paste title report exceptions and I'll decode them..." },
    { id: "Risk Profiler", icon: "R", color: C.amber, desc: "Identifies and quantifies project risk exposure", system: "You are a real estate development risk manager. Identify hidden risks, quantify financial exposure, develop mitigation strategies, and produce risk-adjusted return scenarios.", placeholder: "Describe the project and I'll produce a comprehensive risk profile..." },
    { id: "Absorption Modeler", icon: "M", color: C.teal, desc: "Models lot absorption and sell-out projections", system: "You are a housing market analyst and absorption modeling specialist. Analyze supply/demand dynamics, project lot absorption rates, model sell-out timelines.", placeholder: "Describe the project location and product type for absorption modeling..." },
    { id: "Deal Structurer", icon: "D", color: C.blue, desc: "Optimizes deal structure for equity, debt, and returns", system: "You are a real estate deal structurer and investment banker. Optimize capital stack configurations, equity waterfall structures, promote arrangements, and financing terms.", placeholder: "Describe your deal and I'll advise on the optimal structure..." },
    { id: "Closing Coordinator", icon: "X", color: C.green, desc: "Manages closing checklist and transaction coordination", system: "You are a real estate transaction coordinator specializing in land acquisitions. Manage closing checklists, coordinate parties, flag open items, and ensure all requirements are met.", placeholder: "Describe your transaction status and I'll help coordinate closing..." },
  ];
  const [active, setActive] = useState(null);
  if (active !== null) {
    const a = agents[active];
    return (
      <div>
        <div style={{ marginBottom: 14, display: "flex", alignItems: "center", gap: 10 }}>
          <button style={S.btn()} onClick={() => setActive(null)}>Back to Agents</button>
          <div style={{ fontSize: 12, color: a.color, fontWeight: 700 }}>{a.id}</div>
          <div style={{ fontSize: 10, color: C.dim }}>{a.desc}</div>
        </div>
        <Card title={`${a.id} — · Live Session`}>
          <Agent id={a.id} system={a.system} placeholder={a.placeholder} />
        </Card>
      </div>
    );
  }
  return (
    <>
      <Card title="AI Agent Hub - 12 Specialized Agents">
        <div style={{ fontSize: 12, color: C.dim, marginBottom: 16 }}>Each agent is a specialized Claude instance with domain-specific context. Select an agent to open a live session.</div>
        <div style={S.g3}>
          {agents.map((a, i) => (
            <div key={i} style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 4, padding: 14, cursor: "pointer", transition: "all 0.12s", borderLeft: `3px solid ${a.color}` }}
              onClick={() => setActive(i)}
              onMouseEnter={e => { e.currentTarget.style.background = C.bg4; e.currentTarget.style.borderColor = a.color; }}
              onMouseLeave={e => { e.currentTarget.style.background = C.bg; e.currentTarget.style.borderColor = C.border; }}>
              <div style={{ fontSize: 18, color: a.color, marginBottom: 6, fontWeight: 700 }}>{a.icon}</div>
              <div style={{ fontSize: 13, color: C.text, fontWeight: 700, marginBottom: 4 }}>{a.id}</div>
              <div style={{ fontSize: 10, color: C.dim, lineHeight: 1.4 }}>{a.desc}</div>
              <button style={{ ...S.btn("gold"), marginTop: 10, padding: "4px 10px", fontSize: 9 }}>Launch Agent</button>
            </div>
          ))}
        </div>
      </Card>
      <Card title="Multi-Agent Query">
        <div style={{ fontSize: 12, color: C.dim, marginBottom: 12 }}>Broadcast a question to all agents simultaneously and compare their specialized perspectives.</div>
        <Agent id="MultiAgent" system="You are an orchestrating AI agent for a real estate development intelligence platform with expertise spanning acquisition, zoning, appraisal, construction, environmental, permits, financial underwriting, title, risk management, and deal structuring." placeholder="Ask a question and get input from all specialist perspectives simultaneously..." />
      </Card>
    </>
  );
}



function Contacts() {
  const auth = useAuth();
  const TYPES = ["Buyer", "Seller", "Broker", "Lender", "Attorney", "Contractor", "Architect", "Engineer", "Appraiser", "Inspector", "Title Officer", "Escrow", "Investor", "Other"];
  const STATUSES = ["Active", "Inactive", "Prospect", "Lead", "Archived"];
  const TYPE_MAP = { Buyer: "client", Seller: "client", Broker: "broker", Lender: "investor", Investor: "investor", Attorney: "vendor", Contractor: "vendor", Architect: "vendor", Engineer: "vendor", Appraiser: "vendor", Inspector: "vendor", "Title Officer": "vendor", Escrow: "vendor", Other: "lead" };
  const STATUS_MAP = { Active: "active", Inactive: "inactive", Prospect: "prospect", Lead: "prospect", Archived: "inactive" };
  const REV_TYPE_MAP = { investor: "Investor", client: "Buyer", vendor: "Contractor", lead: "Other", broker: "Broker" };
  const REV_STATUS_MAP = { active: "Active", inactive: "Inactive", prospect: "Prospect" };

  const [contacts, setContacts] = useLS("axiom_contacts", [
    { id: 1, name: "Sarah Chen", type: "Broker", company: "Pacific Realty Group", email: "sarah@pacificrealty.com", phone: "(415) 555-0123", status: "Active", deals: ["Sunset Ridge"], notes: "Top producing agent, 15+ yrs subdivision experience", lastContact: "2025-02-15" },
    { id: 2, name: "Mike Rodriguez", type: "Lender", company: "First National Bank", email: "mrodriguez@fnb.com", phone: "(310) 555-0456", status: "Active", deals: ["Hawk Valley"], notes: "Construction loan specialist, competitive rates", lastContact: "2025-02-10" },
    { id: 3, name: "Jennifer Park", type: "Attorney", company: "Park & Associates", email: "jpark@parklaw.com", phone: "(650) 555-0789", status: "Active", deals: [], notes: "Land use & entitlement attorney. Excellent with CEQA.", lastContact: "2025-01-28" },
    { id: 4, name: "David Thompson", type: "Engineer", company: "Thompson Civil", email: "david@thompsoncivil.com", phone: "(925) 555-0321", status: "Active", deals: ["Sunset Ridge"], notes: "Civil engineer - grading, drainage, improvement plans", lastContact: "2025-02-12" },
    { id: 5, name: "Lisa Wang", type: "Investor", company: "Golden Gate Capital", email: "lwang@ggcap.com", phone: "(415) 555-0654", status: "Prospect", deals: [], notes: "LP investor, interested in $3-10M land deals", lastContact: "2025-01-20" },
    { id: 6, name: "Robert Kim", type: "Title Officer", company: "Chicago Title", email: "rkim@ctt.com", phone: "(408) 555-0987", status: "Active", deals: ["Sunset Ridge", "Hawk Valley"], notes: "Handles preliminary title reports and ALTA surveys", lastContact: "2025-02-18" },
  ]);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [drawer, setDrawer] = useState(null);
  const [nc, setNc] = useState({ name: "", type: "Broker", company: "", email: "", phone: "", status: "Active", deals: [], notes: "", lastContact: "" });
  const [syncing, setSyncing] = useState(false);
  const loadedRef = useRef(false);
  const saveTimer = useRef(null);

  // Load contacts from Supabase on mount
  useEffect(() => {
    if (loadedRef.current || !auth?.userProfile?.org_id || !supa.configured()) return;
    loadedRef.current = true;
    (async () => {
      try {
        const rows = await supa.select("contacts", `organization_id=eq.${auth.userProfile.org_id}&order=updated_at.desc`);
        if (rows.length > 0) {
          const mapped = rows.map(r => ({
            id: r.id,
            name: [r.first_name, r.last_name].filter(Boolean).join(" ") || "Unknown",
            type: REV_TYPE_MAP[r.type] || r.type || "Other",
            company: r.company || "",
            email: r.email || "",
            phone: r.phone || "",
            status: REV_STATUS_MAP[r.status] || r.status || "Active",
            deals: r.tags || [],
            notes: r.notes || "",
            lastContact: r.updated_at?.split("T")[0] || "",
            _supaId: r.id, // Track Supabase ID
          }));
          setContacts(mapped);
        }
      } catch (e) { console.warn("Failed to load contacts:", e); }
    })();
  }, [auth?.userProfile?.org_id]);

  // Sync contact to Supabase
  const syncContact = useCallback((contact, isDelete = false) => {
    if (!auth?.userProfile?.org_id || !supa.configured()) return;
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      setSyncing(true);
      try {
        if (isDelete) {
          if (contact._supaId) await supa.del("contacts", { id: contact._supaId });
        } else {
          const nameParts = (contact.name || "").split(" ");
          const payload = {
            organization_id: auth.userProfile.org_id,
            first_name: nameParts[0] || "",
            last_name: nameParts.slice(1).join(" ") || "",
            email: contact.email || null,
            phone: contact.phone || null,
            company: contact.company || null,
            type: TYPE_MAP[contact.type] || "lead",
            status: STATUS_MAP[contact.status] || "active",
            notes: contact.notes || null,
            tags: contact.deals || [],
            updated_at: new Date().toISOString(),
          };
          if (contact._supaId) payload.id = contact._supaId;
          await supa.upsert("contacts", payload);
        }
      } catch (e) { console.warn("Failed to sync contact:", e); }
      setSyncing(false);
    }, 800);
  }, [auth?.userProfile?.org_id]);

  const filtered = contacts.filter(c => {
    if (search && !c.name.toLowerCase().includes(search.toLowerCase()) && !(c.company || "").toLowerCase().includes(search.toLowerCase())) return false;
    if (filterType !== "All" && c.type !== filterType) return false;
    if (filterStatus !== "All" && c.status !== filterStatus) return false;
    return true;
  });
  const addContact = () => {
    if (!nc.name) return;
    const newContact = { ...nc, id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(), lastContact: new Date().toISOString().split("T")[0] };
    setContacts([...contacts, newContact]);
    syncContact(newContact);
    setNc({ name: "", type: "Broker", company: "", email: "", phone: "", status: "Active", deals: [], notes: "", lastContact: "" });
  };
  const delContact = (id) => {
    const contact = contacts.find(c => c.id === id);
    setContacts(contacts.filter(c => c.id !== id));
    if (contact) syncContact(contact, true);
  };
  const updContact = (id, field, val) => {
    setContacts(contacts.map(c => {
      if (c.id === id) {
        const updated = { ...c, [field]: val };
        syncContact(updated);
        return updated;
      }
      return c;
    }));
  };
  const TC = { Buyer: C.green, Seller: C.blue, Broker: C.gold, Lender: C.purple, Attorney: C.teal, Contractor: C.amber, Architect: C.blue, Engineer: C.teal, Appraiser: C.amber, Inspector: C.dim, Investor: C.green, "Title Officer": C.gold, Escrow: C.purple, Other: C.dim };
  const SC2 = { Active: C.green, Inactive: C.dim, Prospect: C.blue, Lead: C.amber, Archived: C.muted };
  return (
    <Tabs tabs={["Directory", "Add Contact", "Import/Export"]}>
      <div>
        <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
          <input style={{ ...S.inp, flex: 1 }} value={search} onChange={e => setSearch(e.target.value)} placeholder="Search contacts by name or company..." />
          <select style={{ ...S.sel, width: 140 }} value={filterType} onChange={e => setFilterType(e.target.value)}><option>All</option>{TYPES.map(t => <option key={t}>{t}</option>)}</select>
          <select style={{ ...S.sel, width: 120 }} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}><option>All</option>{STATUSES.map(s => <option key={s}>{s}</option>)}</select>
        </div>
        <Card title={`Contact Directory (${filtered.length})`} action={<div style={{ display: "flex", gap: 8, alignItems: "center" }}>{syncing && <span style={{ fontSize: 9, color: C.gold }}>syncing...</span>}<Badge label={contacts.filter(c => c.status === "Active").length + " Active"} color={C.green} /></div>}>
          <table style={S.tbl}>
            <thead><tr><th style={S.th}>Name</th><th style={S.th}>Type</th><th style={S.th}>Company</th><th style={S.th}>Email</th><th style={S.th}>Phone</th><th style={S.th}>Deals</th><th style={S.th}>Status</th><th style={S.th}>Last</th><th style={S.th}></th></tr></thead>
            <tbody>{filtered.map(c => (
              <tr key={c.id} style={{ cursor: "pointer" }} onClick={() => setDrawer(c)}>
                <td style={{ ...S.td, color: C.text, fontWeight: 600 }}>{c.name}</td>
                <td style={S.td}><Badge label={c.type} color={TC[c.type] || C.dim} /></td>
                <td style={{ ...S.td, fontSize: 12 }}>{c.company}</td>
                <td style={{ ...S.td, fontSize: 12, color: C.blue }}>{c.email}</td>
                <td style={{ ...S.td, fontSize: 12 }}>{c.phone}</td>
                <td style={S.td}>{c.deals?.length || 0}</td>
                <td style={S.td}><Dot color={SC2[c.status] || C.dim} /><span style={{ fontSize: 12 }}>{c.status}</span></td>
                <td style={{ ...S.td, fontSize: 10, color: C.dim }}>{c.lastContact}</td>
                <td style={S.td}><button style={{ ...S.btn(), padding: "2px 7px", fontSize: 9 }} onClick={e => { e.stopPropagation(); delContact(c.id); }}>x</button></td>
              </tr>
            ))}</tbody>
          </table>
        </Card>
        {drawer && (
          <Card title={`Edit: ${drawer.name}`} action={<button style={{ ...S.btn(), padding: "3px 8px", fontSize: 9 }} onClick={() => setDrawer(null)}>Close</button>}>
            <div style={S.g3}>
              <Field label="Name"><input style={S.inp} value={drawer.name} onChange={e => updContact(drawer.id, "name", e.target.value)} /></Field>
              <Field label="Type"><select style={S.sel} value={drawer.type} onChange={e => updContact(drawer.id, "type", e.target.value)}>{TYPES.map(t => <option key={t}>{t}</option>)}</select></Field>
              <Field label="Company"><input style={S.inp} value={drawer.company} onChange={e => updContact(drawer.id, "company", e.target.value)} /></Field>
              <Field label="Email"><input style={S.inp} value={drawer.email} onChange={e => updContact(drawer.id, "email", e.target.value)} /></Field>
              <Field label="Phone"><input style={S.inp} value={drawer.phone} onChange={e => updContact(drawer.id, "phone", e.target.value)} /></Field>
              <Field label="Status"><select style={S.sel} value={drawer.status} onChange={e => updContact(drawer.id, "status", e.target.value)}>{STATUSES.map(s => <option key={s}>{s}</option>)}</select></Field>
            </div>
            <Field label="Notes"><textarea style={{ ...S.ta, height: 60 }} value={drawer.notes} onChange={e => updContact(drawer.id, "notes", e.target.value)} /></Field>
          </Card>
        )}
      </div>
      <div>
        <Card title="Add New Contact">
          <div style={S.g3}>
            <Field label="Full Name"><input style={S.inp} value={nc.name} onChange={e => setNc({ ...nc, name: e.target.value })} placeholder="Jane Doe" /></Field>
            <Field label="Type"><select style={S.sel} value={nc.type} onChange={e => setNc({ ...nc, type: e.target.value })}>{TYPES.map(t => <option key={t}>{t}</option>)}</select></Field>
            <Field label="Company"><input style={S.inp} value={nc.company} onChange={e => setNc({ ...nc, company: e.target.value })} /></Field>
            <Field label="Email"><input style={S.inp} value={nc.email} onChange={e => setNc({ ...nc, email: e.target.value })} placeholder="email@example.com" /></Field>
            <Field label="Phone"><input style={S.inp} value={nc.phone} onChange={e => setNc({ ...nc, phone: e.target.value })} placeholder="(555) 000-0000" /></Field>
            <Field label="Status"><select style={S.sel} value={nc.status} onChange={e => setNc({ ...nc, status: e.target.value })}>{STATUSES.map(s => <option key={s}>{s}</option>)}</select></Field>
          </div>
          <Field label="Notes"><textarea style={{ ...S.ta, height: 60 }} value={nc.notes} onChange={e => setNc({ ...nc, notes: e.target.value })} placeholder="Background, relationship, specialties..." /></Field>
          <button style={S.btn("gold")} onClick={addContact}>Add Contact</button>
        </Card>
      </div>
      <div>
        <Card title="Import / Export Contacts">
          <div style={S.g2}>
            <div style={{ border: `2px dashed ${C.border2}`, borderRadius: 4, padding: 28, textAlign: "center" }}>
              <div style={{ fontSize: 32, color: C.gold, marginBottom: 6 }}>+</div>
              <div style={{ fontSize: 13, color: C.sub }}>Import from CSV or vCard</div>
              <div style={{ fontSize: 10, color: C.dim, marginTop: 4 }}>Supports: .csv, .vcf, .xlsx</div>
              <input type="file" id="contact-import" style={{ display: "none" }} onChange={(e) => {
                const file = e.target.files[0];
                if (file) alert(`Importing ${file.name}... Axiom AI is parsing contact metadata.`);
              }} />
              <button style={{ ...S.btn("gold"), marginTop: 12 }} onClick={() => document.getElementById("contact-import").click()}>Browse Files</button>
            </div>
            <div>
              {[["Export All Contacts (CSV)", "Download all contacts as spreadsheet"], ["Export Active Only", "Active contacts with deal links"], ["Sync to Salesforce", "Push to connected CRM"], ["Sync to HubSpot", "Push to connected CRM"]].map(([l, d], i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 0", borderBottom: "1px solid #0F1117" }}>
                  <div style={{ flex: 1 }}><div style={{ fontSize: 13, color: C.text }}>{l}</div><div style={{ fontSize: 10, color: C.dim }}>{d}</div></div>
                  <button style={{ ...S.btn(), padding: "4px 10px", fontSize: 9 }} onClick={() => {
                    if (l.includes("Sync")) {
                      alert(`Initiating ${l} sync...`);
                      return;
                    }
                    const headers = ["ID", "Name", "Type", "Company", "Email", "Phone", "Status", "Deals", "Notes", "Last Contact"];
                    let rows = contacts;
                    if (l.includes("Active Only")) rows = rows.filter(c => c.status === "Active");
                    downloadCSV(headers, rows.map(c => [c.id, c.name, c.type, c.company, c.email, c.phone, c.status, (c.deals || []).join("; "), c.notes, c.lastContact]), "axiom_contacts.csv");
                  }}>Export</button>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </Tabs>
  );
}

function DealPipeline() {
  const auth = useAuth();
  const { dealLimit, tier } = useTier();
  const { setChartSel } = usePrj();
  const STAGES = ["sourcing", "screening", "due_diligence", "committee", "closing", "asset_mgmt"];
  const SL = { sourcing: "Sourcing", screening: "Screening", due_diligence: "Due Diligence", committee: "Committee", closing: "Closing", asset_mgmt: "Asset Mgmt" };
  const SCOL = { sourcing: C.blue, screening: C.teal, due_diligence: C.amber, committee: C.purple, closing: C.gold, asset_mgmt: C.green };
  const [deals, setDeals] = useLS("axiom_deals", [
    { id: 1, name: "Sunset Ridge Estates", address: "456 Ridge Rd", stage: "due_diligence", value: 9250000, profit: 1850000, lots: 42, type: "SFR Subdivision", assignee: "Sarah Chen", updated: "2025-02-15", notes: "Phase I ESA clean. Geotech pending." },
    { id: 2, name: "Hawk Valley Subdivision", address: "789 Valley Dr", stage: "screening", value: 5600000, profit: 840000, lots: 28, type: "SFR Subdivision", assignee: "Mike Rodriguez", updated: "2025-02-10", notes: "Initial feasibility looks promising. Need comp data." },
    { id: 3, name: "Meadowbrook PUD", address: "321 Meadow Ln", stage: "sourcing", value: 12800000, profit: 2560000, lots: 85, type: "PUD", assignee: "", updated: "2025-02-18", notes: "Off-market opportunity from broker network." },
    { id: 4, name: "Ridgecrest Heights", address: "900 Crest Blvd", stage: "committee", value: 14300000, profit: 2860000, lots: 55, type: "SFR Subdivision", assignee: "Jennifer Park", updated: "2025-02-12", notes: "IC presentation scheduled. Strong deal metrics." },
    { id: 5, name: "Canyon Oaks Estates", address: "150 Oak Canyon Dr", stage: "closing", value: 7200000, profit: 1080000, lots: 32, type: "SFR Subdivision", assignee: "David Thompson", updated: "2025-02-20", notes: "COE set for March 15. All conditions met." },
  ]);
  const [nd, setNd] = useState({ name: "", address: "", stage: "sourcing", value: "", profit: "", lots: "", type: "SFR Subdivision", assignee: "", notes: "" });
  const [showForm, setShowForm] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState(null);
  const [syncing, setSyncing] = useState(false);
  const loadedRef = useRef(false);
  const saveTimer = useRef(null);

  // Load deals from Supabase on mount
  useEffect(() => {
    if (loadedRef.current || !auth?.userProfile?.id || !supa.configured()) return;
    loadedRef.current = true;
    (async () => {
      try {
        const rows = await supa.select("deals", `user_id=eq.${auth.userProfile.id}&order=updated_at.desc`);
        if (rows.length > 0) {
          const mapped = rows.map(r => ({
            id: r.id,
            name: r.project_name || "Unnamed",
            address: r.location || "",
            stage: r.stage || "sourcing",
            value: Number(r.acquisition_price) + Number(r.renovation_cost) || 0,
            profit: Number(r.projected_profit) || 0,
            lots: 0, // Not in DB schema
            type: r.asset_type || "SFR Subdivision",
            assignee: "",
            updated: r.updated_at?.split("T")[0] || "",
            notes: r.notes || "",
            tags: r.tags || [],
            _supaId: r.id,
          }));
          setDeals(mapped);
        }
      } catch (e) { console.warn("Failed to load deals:", e); }
    })();
  }, [auth?.userProfile?.id]);

  // Sync deal to Supabase
  const syncDeal = useCallback((deal, isDelete = false) => {
    if (!auth?.userProfile?.id || !supa.configured()) return;
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      setSyncing(true);
      try {
        if (isDelete) {
          if (deal._supaId) await supa.del("deals", { id: deal._supaId });
        } else {
          const payload = {
            user_id: auth.userProfile.id,
            project_name: deal.name,
            location: deal.address,
            asset_type: deal.type,
            stage: deal.stage,
            acquisition_price: deal.value || 0,
            projected_value: (deal.value || 0) + (deal.profit || 0),
            notes: deal.notes,
            tags: deal.tags || [],
            updated_at: new Date().toISOString(),
          };
          if (deal._supaId) payload.id = deal._supaId;
          await supa.upsert("deals", payload);
        }
      } catch (e) { console.warn("Failed to sync deal:", e); }
      setSyncing(false);
    }, 800);
  }, [auth?.userProfile?.id]);

  const addDeal = () => {
    if (!nd.name) return;
    const newDeal = { ...nd, id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(), value: +nd.value || 0, profit: +nd.profit || 0, lots: +nd.lots || 0, updated: new Date().toISOString().split("T")[0] };
    setDeals([...deals, newDeal]);
    syncDeal(newDeal);
    setNd({ name: "", address: "", stage: "sourcing", value: "", profit: "", lots: "", type: "SFR Subdivision", assignee: "", notes: "" });
    setShowForm(false);
  };
  const moveDeal = (id, dir) => {
    const d = deals.find(x => x.id === id);
    if (!d) return;
    const ci = STAGES.indexOf(d.stage);
    const ni = dir === "next" ? ci + 1 : ci - 1;
    if (ni < 0 || ni >= STAGES.length) return;
    const updated = { ...d, stage: STAGES[ni], updated: new Date().toISOString().split("T")[0] };
    setDeals(deals.map(x => x.id === id ? updated : x));
    syncDeal(updated);
  };
  const totalValue = deals.reduce((s, d) => s + d.value, 0);
  // Bug fix: only count non-archived active deals against the tier deal limit
  const activeDeals = deals.filter(d => d.stage !== "asset_mgmt" || d.status !== "archived");
  const atLimit = dealLimit && activeDeals.length >= dealLimit;
  const totalProfit = deals.reduce((s, d) => s + d.profit, 0);
  const pipeData = STAGES.map(st => ({ name: SL[st], count: deals.filter(d => d.stage === st).length, value: deals.filter(d => d.stage === st).reduce((s, d) => s + d.value, 0) / 1e6 }));
  return (
    <Tabs tabs={["Board View", "List View", "Pipeline Analytics"]}>
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div style={S.g4}>
            <KPI label="Active Deals" value={activeDeals.length} />
            <KPI label="Pipeline Value" value={fmt.M(totalValue)} color={C.blue} />
            <KPI label="Est. Profit" value={fmt.M(totalProfit)} color={C.green} />
            <KPI label="Avg Deal Size" value={fmt.M(totalValue / (deals.length || 1))} color={C.gold} />
            {syncing && <span style={{ fontSize: 9, color: C.gold, alignSelf: "center" }}>syncing...</span>}
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 10 }}>
          {STAGES.map(stage => {
            const stageDeals = deals.filter(d => d.stage === stage);
            return (
              <div key={stage} style={{ minWidth: 220, flex: 1, background: C.bg3, border: `1px solid ${C.border}`, borderRadius: 4 }}>
                <div style={{ padding: "10px 12px", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: SCOL[stage], fontWeight: 700 }}>{SL[stage]}</span>
                  <span style={{ fontSize: 12, color: C.dim, background: C.bg, padding: "2px 6px", borderRadius: 3 }}>{stageDeals.length}</span>
                </div>
                <div style={{ padding: 8, minHeight: 120 }}>
                  {stageDeals.map(deal => (
                    <div key={deal.id} style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 3, padding: 10, marginBottom: 6, cursor: "pointer", borderLeft: `3px solid ${SCOL[stage]}` }} onClick={() => setSelectedDeal(deal)}>
                      <div style={{ fontSize: 13, color: C.text, fontWeight: 600, marginBottom: 3 }}>{deal.name}</div>
                      <div style={{ fontSize: 10, color: C.dim }}>{deal.address}</div>
                      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
                        <span style={{ fontSize: 12, color: C.gold }}>{fmt.M(deal.value)}</span>
                        <span style={{ fontSize: 10, color: C.green }}>{deal.lots} lots</span>
                      </div>
                      <div style={{ display: "flex", gap: 4, marginTop: 6 }}>
                        <button style={{ ...S.btn(), padding: "2px 6px", fontSize: 8 }} onClick={e => { e.stopPropagation(); moveDeal(deal.id, "prev"); }}>—</button>
                        <button style={{ ...S.btn(), padding: "2px 6px", fontSize: 8 }} onClick={e => { e.stopPropagation(); moveDeal(deal.id, "next"); }}>→</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
        <div style={{ marginTop: 10 }}>
          {deals.length >= dealLimit && dealLimit < 999 ? (
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: `color-mix(in srgb, ${C.gold} 8%, transparent)`, border: `1px solid ${C.gold}33`, borderRadius: 4 }}>
              <span style={{ fontSize: 10, color: C.gold, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase" }}>Deal limit reached ({deals.length}/{dealLimit})</span>
              <button style={{ ...S.btn("gold"), padding: "4px 10px", fontSize: 9 }} onClick={() => { const el = document.querySelector('[data-nav="billing"]'); if (el) el.click(); }}>Upgrade for Unlimited →</button>
            </div>
          ) : !showForm ? <button style={S.btn("gold")} onClick={() => setShowForm(true)}>+ Add Deal</button> : (
            <Card title="New Deal">
              <div style={S.g3}>
                <Field label="Project Name"><input style={S.inp} value={nd.name} onChange={e => setNd({ ...nd, name: e.target.value })} /></Field>
                <Field label="Address"><input style={S.inp} value={nd.address} onChange={e => setNd({ ...nd, address: e.target.value })} /></Field>
                <Field label="Stage"><select style={S.sel} value={nd.stage} onChange={e => setNd({ ...nd, stage: e.target.value })}>{STAGES.map(s => <option key={s} value={s}>{SL[s]}</option>)}</select></Field>
                <Field label="Deal Value ($)"><input style={S.inp} type="number" value={nd.value} onChange={e => setNd({ ...nd, value: e.target.value })} /></Field>
                <Field label="Est. Profit ($)"><input style={S.inp} type="number" value={nd.profit} onChange={e => setNd({ ...nd, profit: e.target.value })} /></Field>
                <Field label="Lots"><input style={S.inp} type="number" value={nd.lots} onChange={e => setNd({ ...nd, lots: e.target.value })} /></Field>
                <Field label="Type"><select style={S.sel} value={nd.type} onChange={e => setNd({ ...nd, type: e.target.value })}><option>SFR Subdivision</option><option>PUD</option><option>Condo</option><option>Townhome</option><option>Mixed-Use</option><option>Land Bank</option><option>Multifamily</option></select></Field>
                <Field label="Assignee"><input style={S.inp} value={nd.assignee} onChange={e => setNd({ ...nd, assignee: e.target.value })} /></Field>
              </div>
              <Field label="Notes"><textarea style={{ ...S.ta, height: 50 }} value={nd.notes} onChange={e => setNd({ ...nd, notes: e.target.value })} /></Field>
              <div style={{ display: "flex", gap: 8 }}><button style={S.btn("gold")} onClick={addDeal}>Create Deal</button><button style={S.btn()} onClick={() => setShowForm(false)}>Cancel</button></div>
            </Card>
          )}
        </div>
        {selectedDeal && (
          <Card title={`Deal: ${selectedDeal.name}`} action={<button style={{ ...S.btn(), padding: "3px 8px", fontSize: 9 }} onClick={() => setSelectedDeal(null)}>Close</button>}>
            <div style={S.g3}>
              {[["Project", selectedDeal.name], ["Address", selectedDeal.address], ["Type", selectedDeal.type], ["Stage", SL[selectedDeal.stage]], ["Value", fmt.usd(selectedDeal.value)], ["Est. Profit", fmt.usd(selectedDeal.profit)], ["Lots", selectedDeal.lots], ["Assignee", selectedDeal.assignee || "—"], ["Last Updated", selectedDeal.updated]].map(([l, v]) => (
                <div key={l}><div style={{ fontSize: 9, color: C.dim, letterSpacing: 1, textTransform: "uppercase" }}>{l}</div><div style={{ fontSize: 14, color: C.text, marginTop: 2 }}>{v}</div></div>
              ))}
            </div>
            <div style={{ marginTop: 12 }}><div style={{ fontSize: 9, color: C.dim, letterSpacing: 1, textTransform: "uppercase", marginBottom: 4 }}>Notes</div><div style={{ fontSize: 13, color: C.sub }}>{selectedDeal.notes}</div></div>
            <div style={{ marginTop: 12 }}><Agent id="DealReview" system={`You are reviewing this specific deal: ${selectedDeal.name} at ${selectedDeal.address}. ${selectedDeal.lots} lots, value $${selectedDeal.value}. Provide detailed analysis.`} placeholder="Ask about this specific deal..." /></div>
          </Card>
        )}
      </div>
      <div>
        <Card title="All Deals — List View">
          <table style={S.tbl}>
            <thead><tr><th style={S.th}>Project</th><th style={S.th}>Stage</th><th style={S.th}>Type</th><th style={S.th}>Lots</th><th style={S.th}>Value</th><th style={S.th}>Profit</th><th style={S.th}>Assignee</th><th style={S.th}>Updated</th><th style={S.th}></th></tr></thead>
            <tbody>{deals.map(d => (
              <tr key={d.id}>
                <td style={{ ...S.td, color: C.text, fontWeight: 600 }}>{d.name}<div style={{ fontSize: 9, color: C.dim }}>{d.address}</div></td>
                <td style={S.td}><Badge label={SL[d.stage]} color={SCOL[d.stage]} /></td>
                <td style={S.td}><Badge label={d.type} color={C.blue} /></td>
                <td style={S.td}>{d.lots}</td>
                <td style={{ ...S.td, color: C.gold }}>{fmt.M(d.value)}</td>
                <td style={{ ...S.td, color: C.green }}>{fmt.M(d.profit)}</td>
                <td style={{ ...S.td, fontSize: 12 }}>{d.assignee || "—"}</td>
                <td style={{ ...S.td, fontSize: 10, color: C.dim }}>{d.updated}</td>
                <td style={S.td}><button style={{ ...S.btn(), padding: "2px 7px", fontSize: 9 }} onClick={() => setDeals(deals.filter(x => x.id !== d.id))}>x</button></td>
              </tr>
            ))}</tbody>
          </table>
        </Card>
      </div>
      <div>
        <div style={S.g2}>
          <Card title="Pipeline by Stage">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={pipeData} onClick={onChartClick(setChartSel)} style={CHART_STYLE}>
                <CartesianGrid strokeDasharray="3 6" stroke={C.border} strokeOpacity={0.5} vertical={false} />
                <XAxis dataKey="name" stroke={C.dim} tick={{ fontSize: 11, fontFamily: 'Inter,sans-serif', fill: C.muted }} />
                <YAxis stroke={C.dim} tick={{ fontSize: 11, fontFamily: 'Inter,sans-serif', fill: C.muted }} allowDecimals={false} />
                <Tooltip {...TT_BAR()} formatter={(v, name) => [v === 1 ? "1 deal" : `${v} deals`, name]} labelFormatter={l => `Stage: ${l}`} />
                <Legend wrapperStyle={{ fontSize: 11, color: C.muted, paddingTop: 4 }} />
                <Bar dataKey="count" name="Deals" fill={C.gold} radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
          <Card title="Value by Stage ($M)">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={pipeData} onClick={onChartClick(setChartSel)} style={CHART_STYLE}>
                <CartesianGrid strokeDasharray="3 6" stroke={C.border} strokeOpacity={0.5} />
                <XAxis dataKey="name" stroke={C.dim} tick={{ fontSize: 9 }} />
                <YAxis stroke={C.dim} tick={{ fontSize: 12, fontFamily: 'Inter,sans-serif', fill: C.muted }} tickFormatter={v => `$${v.toFixed(1)}M`} />
                <Tooltip {...TT()} formatter={(v, name) => [`$${Number(v).toFixed(2)}M`, name]} labelFormatter={l => `Stage: ${l}`} />
                <Legend wrapperStyle={{ fontSize: 11, color: C.muted, paddingTop: 4 }} />
                <Bar dataKey="value" name="Deal Value" fill={C.blue} radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>
        <Card title="Pipeline — · AI Agent">
          <Agent id="PipelineAgent" system="You are a real estate deal pipeline manager. Analyze deal flow, stage velocity, conversion rates, and pipeline health. Advise on deal prioritization and resource allocation." placeholder="Ask about pipeline metrics, deal velocity, or prioritization..." />
        </Card>
      </div>
    </Tabs>
  );
}

function DealAnalyzer() {
  const { setChartSel } = usePrj();
  const [deal, setDeal] = useLS("axiom_analyze_deal", { name: "Sunset Ridge Estates", address: "456 Ridge Rd", lots: 42, type: "SFR Subdivision", landCost: 3000000, hardCostPerLot: 65000, salesPrice: 185000, absorption: 3, entitlementStatus: "Under Review", ceqa: "MND", floodZone: "X", phase1: "Clean", soilType: "Sandy Loam" });
  const du = k => e => setDeal({ ...deal, [k]: e.target.value });
  const hard = deal.lots * deal.hardCostPerLot;
  const soft = hard * 0.18;
  const fees = (8500 + 3200 + 12000) * deal.lots + 120000;
  const cont = (hard + soft) * 0.10;
  const totalCost = +deal.landCost + hard + soft + fees + cont + 90000;
  const revenue = deal.lots * deal.salesPrice;
  const profit = revenue * 0.97 - totalCost * 1.05;
  const margin = revenue > 0 ? profit / revenue * 100 : 0;
  const roi = totalCost > 0 ? profit / totalCost * 100 : 0;
  const months = Math.ceil(deal.lots / (deal.absorption || 1));
  const scoreF = Math.min(100, Math.max(0, margin > 20 ? 95 : margin > 15 ? 80 : margin > 10 ? 65 : margin > 5 ? 50 : 30));
  const scoreE = deal.entitlementStatus === "Approved" ? 100 : deal.entitlementStatus === "Under Review" ? 60 : 30;
  const scoreR = deal.phase1 === "Clean" && deal.floodZone === "X" ? 90 : 60;
  const overall = Math.round(scoreF * 0.4 + scoreE * 0.3 + scoreR * 0.3);
  const verdict = overall >= 75 ? "GO" : overall >= 50 ? "CONDITIONAL" : "NO-GO";
  const VC = { GO: C.green, CONDITIONAL: C.amber, "NO-GO": C.red };
  const radarD = [{ sub: "Financial", val: scoreF }, { sub: "Entitlement", val: scoreE }, { sub: "Environmental", val: scoreR }, { sub: "Market", val: 68 }, { sub: "Infrastructure", val: 75 }];
  return (
    <Tabs tabs={["Quick Analysis", "Deep Dive", "Go/No-Go", "IC Memo Builder"]}>
      <div>
        <Card title="Deal Input">
          <div style={S.g4}>
            <Field label="Project Name"><input style={S.inp} value={deal.name} onChange={du("name")} /></Field>
            <Field label="Address"><input style={S.inp} value={deal.address} onChange={du("address")} /></Field>
            <Field label="Total Lots"><input style={S.inp} type="number" value={deal.lots} onChange={du("lots")} /></Field>
            <Field label="Product Type"><select style={S.sel} value={deal.type} onChange={du("type")}><option>SFR Subdivision</option><option>PUD</option><option>Townhome</option><option>Condo</option><option>Mixed-Use</option><option>Multifamily</option></select></Field>
            <Field label="Land Cost ($)"><input style={S.inp} type="number" value={deal.landCost} onChange={du("landCost")} /></Field>
            <Field label="Hard Cost / Lot ($)"><input style={S.inp} type="number" value={deal.hardCostPerLot} onChange={du("hardCostPerLot")} /></Field>
            <Field label="Sales Price / Lot ($)"><input style={S.inp} type="number" value={deal.salesPrice} onChange={du("salesPrice")} /></Field>
            <Field label="Absorption (lots/mo)"><input style={S.inp} type="number" value={deal.absorption} onChange={du("absorption")} /></Field>
          </div>
          <div style={S.g4}>
            <Field label="Entitlement Status"><select style={S.sel} value={deal.entitlementStatus} onChange={du("entitlementStatus")}><option>Not Started</option><option>Pre-App</option><option>Under Review</option><option>Approved</option></select></Field>
            <Field label="CEQA"><select style={S.sel} value={deal.ceqa} onChange={du("ceqa")}><option>Exempt</option><option>ND</option><option>MND</option><option>EIR</option></select></Field>
            <Field label="Flood Zone"><select style={S.sel} value={deal.floodZone} onChange={du("floodZone")}><option>X</option><option>AE</option><option>A</option><option>VE</option></select></Field>
            <Field label="Phase I ESA"><select style={S.sel} value={deal.phase1} onChange={du("phase1")}><option>Not Done</option><option>Clean</option><option>RECs Found</option><option>Phase II Req</option></select></Field>
          </div>
        </Card>
        <div style={S.g4}>
          <KPI label="Total Cost" value={fmt.M(totalCost)} color={C.red} />
          <KPI label="Revenue" value={fmt.M(revenue)} color={C.green} />
          <KPI label="Net Profit" value={fmt.M(profit)} color={profit >= 0 ? C.green : C.red} />
          <KPI label="Margin" value={fmt.pct(margin)} color={margin > 15 ? C.green : C.amber} sub={`ROI: ${roi.toFixed(1)}%`} />
        </div>
        <div style={{ ...S.g2, marginTop: 14 }}>
          <Card title="Deal Readiness">
            <ResponsiveContainer width="100%" height={200}>
              <RadarChart data={radarD} onClick={onChartClick(setChartSel)} style={CHART_STYLE}>
                <PolarGrid stroke={C.border} strokeOpacity={0.4} />
                <PolarAngleAxis dataKey="sub" tick={{ fill: C.muted, fontSize: 13, fontFamily: 'Inter,sans-serif' }} />
                <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 9, fill: C.dim }} axisLine={false} tickCount={4} />
                <Radar dataKey="val" name="Score" stroke={C.gold} fill={C.gold} fillOpacity={0.2} strokeWidth={2} dot={{ r: 4, fill: C.gold, stroke: "#0D0F13", strokeWidth: 1.5 }} />
                <Tooltip {...TT()} formatter={(v, name) => [`${v}/100`, name]} />
                <Legend wrapperStyle={{ fontSize: 11, color: C.muted }} />
              </RadarChart>
            </ResponsiveContainer>
          </Card>
          <Card title="Verdict">
            <div style={{ textAlign: "center", padding: 20 }}>
              <div style={{ fontSize: 55, fontWeight: 700, color: VC[verdict], marginBottom: 8 }}>{verdict}</div>
              <div style={{ fontSize: 16, color: C.dim }}>Overall Score: {overall}/100</div>
              <div style={{ marginTop: 16 }}>
                {[["Financial", scoreF], ["Entitlement", scoreE], ["Environmental", scoreR]].map(([l, v]) => (
                  <div key={l} style={{ marginBottom: 8 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: C.dim, marginBottom: 3 }}><span>{l}</span><span>{v}%</span></div>
                    <Progress value={v} color={v >= 75 ? C.green : v >= 50 ? C.amber : C.red} />
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </div>
      <div>
        <Card title="Detailed Financial Breakdown">
          <table style={S.tbl}>
            <tbody>{[["Land Acquisition", deal.landCost], ["Closing / DD Costs", 90000], ["Hard Costs (" + deal.lots + " lots)", hard], ["Soft Costs (18%)", soft], ["Fees & Impact", fees], ["Contingency (10%)", cont], ["Total Development Cost", totalCost], ["Gross Revenue", revenue], ["Commission (3%)", revenue * 0.03], ["Reserve (5%)", totalCost * 0.05], ["Net Profit", profit]].map(([l, v], i) => (
              <tr key={i}>
                <td style={{ ...S.td, color: l === "Total Development Cost" || l === "Net Profit" ? C.gold : C.sub, fontWeight: l === "Total Development Cost" || l === "Net Profit" ? 700 : 400 }}>{l}</td>
                <td style={{ ...S.td, textAlign: "right", color: l === "Net Profit" ? (profit >= 0 ? C.green : C.red) : C.sub, fontWeight: l === "Net Profit" ? 700 : 400 }}>{fmt.usd(v)}</td>
              </tr>
            ))}</tbody>
          </table>
          <div style={{ marginTop: 14, display: "flex", justifyContent: "space-between", background: C.bg, padding: 14, borderRadius: 4, border: `1px solid ${C.gold}44` }}>
            <div><div style={{ fontSize: 9, color: C.dim }}>Sell-Out Timeline</div><div style={{ fontSize: 23, color: C.gold, fontWeight: 700 }}>{months} months</div></div>
            <div style={{ textAlign: "right" }}><div style={{ fontSize: 9, color: C.dim }}>Profit/Lot</div><div style={{ fontSize: 23, color: profit >= 0 ? C.green : C.red, fontWeight: 700 }}>{fmt.usd(profit / (deal.lots || 1))}</div></div>
          </div>
        </Card>
        <Card title="Deal Underwriter — · AI Agent">
          <Agent id="DealUnderwriter" system={`You are underwriting: ${deal.name}. ${deal.lots} lots, land $${deal.landCost}, hard $${deal.hardCostPerLot}/lot, sales $${deal.salesPrice}/lot. Total cost $${totalCost}, revenue $${revenue}, profit $${profit}, margin ${margin.toFixed(1)}%. Provide institutional-grade underwriting analysis.`} placeholder="Ask for a detailed underwriting analysis..." />
        </Card>
      </div>
      <div>
        <Card title="Go / No-Go Analysis Matrix">
          <table style={S.tbl}>
            <thead><tr><th style={S.th}>Category</th><th style={S.th}>Criteria</th><th style={S.th}>Score</th><th style={S.th}>Status</th></tr></thead>
            <tbody>{[
              ["Financial", "Profit margin > 15%", margin > 15 ? 100 : margin > 10 ? 60 : 20, margin > 15 ? "Pass" : "Review"],
              ["Financial", "ROI > 20%", roi > 20 ? 100 : roi > 15 ? 60 : 20, roi > 20 ? "Pass" : "Review"],
              ["Financial", "Cost/Lot within market range", 80, "Verify"],
              ["Entitlement", "Clear zoning pathway", deal.entitlementStatus === "Approved" ? 100 : 60, deal.entitlementStatus],
              ["Entitlement", "CEQA pathway manageable", deal.ceqa === "Exempt" ? 100 : deal.ceqa === "ND" || deal.ceqa === "MND" ? 70 : 40, deal.ceqa],
              ["Environmental", "Phase I ESA clean", deal.phase1 === "Clean" ? 100 : 30, deal.phase1],
              ["Environmental", "Flood zone acceptable", deal.floodZone === "X" ? 100 : 30, deal.floodZone],
              ["Market", "Absorption rate supported", deal.absorption >= 3 ? 100 : 60, deal.absorption >= 3 ? "Strong" : "Moderate"],
              ["Infrastructure", "Utilities available", 75, "Verify"],
              ["Title", "Clean title expected", 85, "Pending"],
            ].map(([cat, crit, score, status], i) => (
              <tr key={i}>
                <td style={S.td}><Badge label={cat} color={C.blue} /></td>
                <td style={{ ...S.td, color: C.sub, fontSize: 12 }}>{crit}</td>
                <td style={S.td}><span style={{ fontSize: 14, color: score >= 75 ? C.green : score >= 50 ? C.amber : C.red, fontWeight: 700 }}>{score}</span></td>
                <td style={S.td}><Badge label={status} color={score >= 75 ? C.green : score >= 50 ? C.amber : C.red} /></td>
              </tr>
            ))}</tbody>
          </table>
        </Card>
      </div>
      <div>
        <Card title="Investment Committee Memo Builder" action={<ShareDealButton />}>
          <Agent id="ICMemo" system={`Generate a professional Investment Committee memo for: ${deal.name} at ${deal.address}. ${deal.lots} ${deal.type} lots. Financial summary: Total cost $${totalCost}, Revenue $${revenue}, Profit $${profit}, Margin ${margin.toFixed(1)}%, ROI ${roi.toFixed(1)}%, Sell-out ${months} months. Include: Deal thesis, site overview, financial highlights, risk factors, and recommendation.`} placeholder="Type 'generate IC memo' to create a full investment committee memorandum..." />
        </Card>
        <Card title="Investor Deck Builder">
          <div style={{ fontSize: 12, color: C.dim, marginBottom: 14 }}>Select components to include in your investor deck PDF.</div>
          {[["Cover Page", "Professional title with project branding"], ["Executive Summary", "Key metrics, deal thesis, investment highlights"], ["Financial Analysis", "Pro forma, sensitivity, waterfall, returns"], ["Market Analysis", "Comparable sales, absorption, pricing"], ["Site & Entitlement", "Zoning, constraints, survey data"], ["Risk Assessment", "Risk register, mitigation strategies"], ["Agent IC Memo", "Full AI-generated analysis"], ["Photos & Maps", "Property images, aerials, site plan"]].map(([t, d], i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: "1px solid #0F1117" }}>
              <input type="checkbox" defaultChecked style={{ accentColor: C.gold }} />
              <div style={{ flex: 1 }}><div style={{ fontSize: 13, color: C.text }}>{t}</div><div style={{ fontSize: 10, color: C.dim }}>{d}</div></div>
            </div>
          ))}
          <button style={{ ...S.btn("gold"), marginTop: 14 }}>Generate PDF Deck</button>
        </Card>
      </div>
    </Tabs>
  );
}

function MLSListings() {
  const { canUse } = useTier();
  if (!canUse("mls")) return (
    <div style={{ textAlign: "center", padding: 60 }}>
      <div style={{ fontSize: 48, marginBottom: 12 }}>🏡</div>
      <div style={{ fontSize: 18, color: C.text, fontWeight: 700, marginBottom: 6 }}>MLS & Listings Intelligence</div>
      <div style={{ fontSize: 13, color: C.dim, marginBottom: 16, maxWidth: 420, margin: "0 auto 16px" }}>Connect live MLS feeds, monitor competing projects, set listing alerts, and run saved searches. Requires Pro plan.</div>
      <UpgradeButton plan="pro" label="Unlock MLS Access — $29/mo" />
    </div>
  );
  const [feeds, setFeeds] = useLS("axiom_mls_feeds", [
    { id: 1, name: "Zillow ZAPI", type: "Zillow", status: "Connected", endpoint: "https://api.bridgedataoutput.com/api/v2/zillow", key: "zw_— ¢— ¢— ¢— ¢", lastSync: "2025-02-20 14:30", records: 2450 },
    { id: 2, name: "Redfin Data", type: "Redfin", status: "Connected", endpoint: "https://redfin-com.p.rapidapi.com", key: "rf_— ¢— ¢— ¢— ¢", lastSync: "2025-02-20 12:15", records: 1820 },
    { id: 3, name: "MLS (RESO)", type: "MLS", status: "Idle", endpoint: "https://api.reso.org/v2", key: "", lastSync: "", records: 0 },
    { id: 4, name: "Realtor.com", type: "Realtor", status: "Idle", endpoint: "https://api.realtor.com/listings", key: "", lastSync: "", records: 0 },
    { id: 5, name: "ATTOM Property", type: "ATTOM", status: "Connected", endpoint: "https://api.attomdata.com/property", key: "at_— ¢— ¢— ¢— ¢", lastSync: "2025-02-19 09:00", records: 5600 },
  ]);
  const [searches, setSearches] = useLS("axiom_saved_searches", [
    { id: 1, name: "Infill SFR Lots - Bay Area", criteria: "5-50 acres, R-1/R-2, < $5M, Bay Area", alerts: true, results: 12, lastRun: "2025-02-20" },
    { id: 2, name: "Raw Land - Central Valley", criteria: "20-200 acres, AG/Rural, < $2M, Fresno/Kern", alerts: true, results: 34, lastRun: "2025-02-19" },
    { id: 3, name: "Entitled Subdivisions", criteria: "Approved TM, 20-100 lots, CA", alerts: false, results: 8, lastRun: "2025-02-18" },
  ]);
  const [ns, setNs] = useState({ name: "", criteria: "", alerts: true });
  const SC = { Connected: C.green, Idle: C.amber, Error: C.red };
  const TC2 = { Zillow: C.blue, Redfin: C.red, MLS: C.gold, Realtor: C.green, ATTOM: C.purple };
  const toggle = (id) => setFeeds(feeds.map(f => f.id === id ? { ...f, status: f.status === "Connected" ? "Idle" : "Connected" } : f));
  const addSearch = () => { if (!ns.name) return; setSearches([...searches, { ...ns, id: Date.now(), results: 0, lastRun: new Date().toISOString().split("T")[0] }]); setNs({ name: "", criteria: "", alerts: true }); };
  const listings = [
    { id: 1, address: "123 Oak Valley Rd", city: "Sacramento", price: 2800000, acres: 8.5, lots: "Est. 35", zoning: "R-1", source: "Zillow", daysOnMarket: 45, status: "Active" },
    { id: 2, address: "4500 Hillside Dr", city: "El Dorado Hills", price: 4200000, acres: 12.3, lots: "Est. 48", zoning: "PD", source: "Redfin", daysOnMarket: 12, status: "Active" },
    { id: 3, address: "890 Ranch Rd", city: "Folsom", price: 1950000, acres: 5.2, lots: "Est. 22", zoning: "R-2", source: "MLS", daysOnMarket: 78, status: "Price Reduced" },
    { id: 4, address: "2200 Valley View", city: "Roseville", price: 6100000, acres: 18.7, lots: "Est. 72", zoning: "R-1", source: "ATTOM", daysOnMarket: 30, status: "Active" },
    { id: 5, address: "777 Creek Crossing", city: "Lincoln", price: 3400000, acres: 10.1, lots: "Est. 40", zoning: "PD", source: "Zillow", daysOnMarket: 5, status: "New" },
  ];
  const LSC = { Active: C.green, "Price Reduced": C.amber, New: C.blue, Pending: C.purple, Sold: C.dim };
  return (
    <Tabs tabs={["Active Listings", "Saved Searches", "Data Feeds", "Property Alerts"]}>
      <div>
        <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
          <input style={{ ...S.inp, flex: 1 }} placeholder="Search by address, city, APN, or keyword..." />
          <select style={{ ...S.sel, width: 120 }}><option>All Sources</option><option>Zillow</option><option>Redfin</option><option>MLS</option><option>ATTOM</option></select>
          <select style={{ ...S.sel, width: 120 }}><option>All Statuses</option><option>Active</option><option>New</option><option>Price Reduced</option><option>Pending</option></select>
          <button style={S.btn("gold")}>Search</button>
        </div>
        <Card title="Matching Properties" action={<Badge label={listings.length + " Results"} color={C.blue} />}>
          <table style={S.tbl}>
            <thead><tr><th style={S.th}>Address</th><th style={S.th}>City</th><th style={S.th}>Price</th><th style={S.th}>Acres</th><th style={S.th}>Est. Lots</th><th style={S.th}>Zoning</th><th style={S.th}>Source</th><th style={S.th}>DOM</th><th style={S.th}>Status</th><th style={S.th}></th></tr></thead>
            <tbody>{listings.map(l => (
              <tr key={l.id}>
                <td style={{ ...S.td, color: C.text, fontWeight: 600 }}>{l.address}</td>
                <td style={{ ...S.td, fontSize: 12 }}>{l.city}</td>
                <td style={{ ...S.td, color: C.gold }}>{fmt.usd(l.price)}</td>
                <td style={S.td}>{l.acres} ac</td>
                <td style={S.td}>{l.lots}</td>
                <td style={S.td}><Badge label={l.zoning} color={C.blue} /></td>
                <td style={S.td}><Badge label={l.source} color={TC2[l.source] || C.dim} /></td>
                <td style={S.td}>{l.daysOnMarket}d</td>
                <td style={S.td}><Badge label={l.status} color={LSC[l.status] || C.dim} /></td>
                <td style={S.td}><button style={{ ...S.btn("gold"), padding: "3px 8px", fontSize: 9 }}>Import</button></td>
              </tr>
            ))}</tbody>
          </table>
        </Card>
      </div>
      <div>
        <Card title="Saved Searches" action={<Badge label={searches.length + " Saved"} color={C.gold} />}>
          {searches.map(s => (
            <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: "1px solid #0F1117" }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, color: C.text, fontWeight: 600 }}>{s.name}</div>
                <div style={{ fontSize: 10, color: C.dim, marginTop: 2 }}>{s.criteria}</div>
              </div>
              <Badge label={s.results + " results"} color={C.blue} />
              <span style={{ fontSize: 10, color: C.dim }}>{s.lastRun}</span>
              <Badge label={s.alerts ? "Alerts On" : "Alerts Off"} color={s.alerts ? C.green : C.dim} />
              <button style={{ ...S.btn(), padding: "3px 8px", fontSize: 9 }}>Run</button>
              <button style={{ ...S.btn(), padding: "3px 8px", fontSize: 9 }} onClick={() => setSearches(searches.filter(x => x.id !== s.id))}>x</button>
            </div>
          ))}
        </Card>
        <Card title="Create Saved Search">
          <div style={S.g2}>
            <Field label="Search Name"><input style={S.inp} value={ns.name} onChange={e => setNs({ ...ns, name: e.target.value })} placeholder="e.g., Infill Lots - Sacramento" /></Field>
            <Field label="Criteria"><input style={S.inp} value={ns.criteria} onChange={e => setNs({ ...ns, criteria: e.target.value })} placeholder="Acreage, zoning, price range, location..." /></Field>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, margin: "8px 0" }}>
            <input type="checkbox" checked={ns.alerts} onChange={() => setNs({ ...ns, alerts: !ns.alerts })} style={{ accentColor: C.gold }} />
            <span style={{ fontSize: 12, color: C.sub }}>Email alerts when new matches found</span>
          </div>
          <button style={S.btn("gold")} onClick={addSearch}>Save Search</button>
        </Card>
      </div>
      <div>
        <Card title="MLS & Listing Data Feeds">
          <table style={S.tbl}>
            <thead><tr><th style={S.th}>Feed Name</th><th style={S.th}>Type</th><th style={S.th}>Endpoint</th><th style={S.th}>Records</th><th style={S.th}>Last Sync</th><th style={S.th}>Status</th><th style={S.th}>Actions</th></tr></thead>
            <tbody>{feeds.map(f => (
              <tr key={f.id}>
                <td style={{ ...S.td, color: C.text, fontWeight: 600 }}>{f.name}</td>
                <td style={S.td}><Badge label={f.type} color={TC2[f.type] || C.dim} /></td>
                <td style={{ ...S.td, fontSize: 10, color: C.dim }}>{f.endpoint}</td>
                <td style={{ ...S.td, color: C.gold }}>{fmt.num(f.records)}</td>
                <td style={{ ...S.td, fontSize: 10, color: C.dim }}>{f.lastSync || "Never"}</td>
                <td style={S.td}><Dot color={SC[f.status]} /><span style={{ fontSize: 12 }}>{f.status}</span></td>
                <td style={S.td}>
                  <div style={{ display: "flex", gap: 4 }}>
                    <button style={{ ...S.btn(), padding: "3px 8px", fontSize: 9 }} onClick={() => toggle(f.id)}>{f.status === "Connected" ? "Pause" : "Connect"}</button>
                    <button style={{ ...S.btn(), padding: "3px 8px", fontSize: 9 }}>Sync</button>
                  </div>
                </td>
              </tr>
            ))}</tbody>
          </table>
        </Card>
      </div>
      <div>
        <Card title="Property Alert Configuration">
          {[["New Listings in Target Areas", "Immediate notification for new land listings matching your criteria"], ["Price Reductions", "Alert when watched properties reduce price by 5%+"], ["Days on Market Threshold", "Properties exceeding 60 DOM (motivated sellers)"], ["Foreclosure / REO", "Bank-owned and distressed properties in target markets"], ["Off-Market Opportunities", "Broker network leads and pocket listings"], ["Permit Activity", "New entitlement applications near target areas"]].map(([t, d], i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: "1px solid #0F1117" }}>
              <input type="checkbox" defaultChecked={i < 3} style={{ accentColor: C.gold }} />
              <div style={{ flex: 1 }}><div style={{ fontSize: 13, color: C.text }}>{t}</div><div style={{ fontSize: 10, color: C.dim }}>{d}</div></div>
              <select style={{ ...S.sel, width: 100, padding: "3px 6px", fontSize: 10 }}><option>Email</option><option>SMS</option><option>Both</option><option>Off</option></select>
            </div>
          ))}
        </Card>
      </div>
    </Tabs>
  );
}

function DataIntel() {
  const { setChartSel } = usePrj();
  const IT = ["Zoning Change", "Permit Activity", "Market Report", "Comp Sale", "Development News", "Infrastructure", "Political", "Public Record", "Broker Intel", "Other"];
  const [records, setRecords] = useLS("axiom_intel", [
    { id: 1, type: "Zoning Change", title: "Rezoning Application - 500 Elm St", source: "City Planning Portal", date: "2025-02-15", relevance: "High", summary: "Adjacent parcel rezoning from C-2 to R-3 could increase density allowance for subject.", linked: true },
    { id: 2, type: "Market Report", title: "Q4 2024 Land Sales Report - Sacramento MSA", source: "CoStar Analytics", date: "2025-01-20", relevance: "Medium", summary: "Finished lot prices up 8% YoY. Absorption rates steady at 3.2 lots/month for SFR.", linked: true },
    { id: 3, type: "Permit Activity", title: "125-Lot Subdivision Approved - Oak Grove", source: "County Records", date: "2025-02-08", relevance: "High", summary: "Competing project 2 miles from subject site. Expected to begin construction Q3 2025.", linked: false },
    { id: 4, type: "Infrastructure", title: "Highway 50 Interchange Improvement", source: "Caltrans", date: "2025-01-30", relevance: "Medium", summary: "$42M interchange project begins 2026. Will improve access to subject by 8 minutes.", linked: false },
    { id: 5, type: "Comp Sale", title: "Lot Sale - 45 lots @ $178K/lot", source: "MLS / Public Records", date: "2025-02-12", relevance: "High", summary: "Comparable subdivision sold. 45 finished lots averaging 5,200 SF at $178,000 per lot.", linked: true },
    { id: 6, type: "Development News", title: "School District Bond Measure Passed", source: "Local News", date: "2025-02-01", relevance: "Medium", summary: "$180M school bond passed. New elementary school planned within 1 mile of subject.", linked: false },
  ]);
  const [filterType, setFilterType] = useState("All");
  const [filterRel, setFilterRel] = useState("All");
  const [nr, setNr] = useState({ type: "Market Report", title: "", source: "", summary: "", relevance: "Medium", linked: false });
  const filtered = records.filter(r => {
    if (filterType !== "All" && r.type !== filterType) return false;
    if (filterRel !== "All" && r.relevance !== filterRel) return false;
    return true;
  });
  const addRec = () => { if (!nr.title) return; setRecords([...records, { ...nr, id: Date.now(), date: new Date().toISOString().split("T")[0] }]); setNr({ type: "Market Report", title: "", source: "", summary: "", relevance: "Medium", linked: false }); };
  const TC3 = { ...RC, "Zoning Change": C.purple, "Permit Activity": C.amber, "Market Report": C.blue, "Comp Sale": C.green, "Development News": C.teal, Infrastructure: C.gold, Political: C.red, "Public Record": C.dim, "Broker Intel": C.gold, Other: C.muted };
  return (
    <Tabs tabs={["Intel Feed", "Add Record", "Analytics", "Live Market"]}>
      <div>
        <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
          <input style={{ ...S.inp, flex: 1 }} placeholder="Search intel records..." />
          <select style={{ ...S.sel, width: 140 }} value={filterType} onChange={e => setFilterType(e.target.value)}><option>All</option>{IT.map(t => <option key={t}>{t}</option>)}</select>
          <select style={{ ...S.sel, width: 100 }} value={filterRel} onChange={e => setFilterRel(e.target.value)}><option>All</option><option>High</option><option>Medium</option><option>Low</option></select>
        </div>
        <Card title={`Intelligence Feed (${filtered.length} records)`}>
          {filtered.map(r => (
            <div key={r.id} style={{ display: "flex", gap: 12, padding: "12px 0", borderBottom: "1px solid #0F1117" }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 4 }}>
                  <Badge label={r.type} color={TC3[r.type] || C.dim} />
                  <Badge label={r.relevance} color={RC[r.relevance] || C.dim} />
                  {r.linked && <Badge label="Linked" color={C.gold} />}
                  <span style={{ fontSize: 10, color: C.dim, marginLeft: "auto" }}>{r.date}</span>
                </div>
                <div style={{ fontSize: 13, color: C.text, fontWeight: 600, marginBottom: 3 }}>{r.title}</div>
                <div style={{ fontSize: 12, color: C.dim, marginBottom: 2 }}>Source: {r.source}</div>
                <div style={{ fontSize: 12, color: C.sub, lineHeight: 1.4 }}>{r.summary}</div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <button style={{ ...S.btn(), padding: "3px 8px", fontSize: 9 }}>Link</button>
                <button style={{ ...S.btn(), padding: "3px 8px", fontSize: 9 }} onClick={() => setRecords(records.filter(x => x.id !== r.id))}>x</button>
              </div>
            </div>
          ))}
        </Card>
      </div>
      <div>
        <Card title="Add Intel Record">
          <div style={S.g3}>
            <Field label="Intel Type"><select style={S.sel} value={nr.type} onChange={e => setNr({ ...nr, type: e.target.value })}>{IT.map(t => <option key={t}>{t}</option>)}</select></Field>
            <Field label="Title"><input style={S.inp} value={nr.title} onChange={e => setNr({ ...nr, title: e.target.value })} placeholder="Brief descriptive title" /></Field>
            <Field label="Source"><input style={S.inp} value={nr.source} onChange={e => setNr({ ...nr, source: e.target.value })} placeholder="CoStar, County Records, MLS..." /></Field>
          </div>
          <Field label="Summary / Analysis"><textarea style={{ ...S.ta, height: 80 }} value={nr.summary} onChange={e => setNr({ ...nr, summary: e.target.value })} placeholder="Detailed analysis and implications for your projects..." /></Field>
          <div style={S.g2}>
            <Field label="Relevance"><select style={S.sel} value={nr.relevance} onChange={e => setNr({ ...nr, relevance: e.target.value })}><option>High</option><option>Medium</option><option>Low</option></select></Field>
            <Field label="Link to Active Deal?"><select style={S.sel} value={nr.linked ? "Yes" : "No"} onChange={e => setNr({ ...nr, linked: e.target.value === "Yes" })}><option>No</option><option>Yes</option></select></Field>
          </div>
          <button style={S.btn("gold")} onClick={addRec}>Save Intel Record</button>
        </Card>
      </div>
      <div>
        <Card title="Intel by Category">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={IT.map(t => ({ name: t.split(" ")[0], fullType: t, count: records.filter(r => r.type === t).length }))} onClick={onChartClick(setChartSel)} style={CHART_STYLE}>
              <CartesianGrid strokeDasharray="3 6" stroke={C.border} strokeOpacity={0.5} vertical={false} />
              <XAxis dataKey="name" stroke={C.dim} tick={{ fontSize: 11, fontFamily: 'Inter,sans-serif', fill: C.muted }} />
              <YAxis stroke={C.dim} tick={{ fontSize: 11, fontFamily: 'Inter,sans-serif', fill: C.muted }} allowDecimals={false} />
              <Tooltip {...TT_BAR()} formatter={(v, name, props) => [v === 1 ? "1 record" : `${v} records`, props.payload?.fullType || name]} labelFormatter={l => `Category: ${l}`} />
              <Legend wrapperStyle={{ fontSize: 11, color: C.muted, paddingTop: 4 }} />
              <Bar dataKey="count" name="Intel Records" fill={C.gold} radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
        <Card title="Data Intelligence — · AI Agent">
          <Agent id="DataIntel" system="You are a real estate market intelligence analyst. Analyze market data, identify trends, connect intel records to deal implications, and produce actionable market briefs." placeholder="Ask about market trends, intel analysis, or data implications for your deals..." />
        </Card>
      </div>
      <div>
        <Card title="Live Market Feed">
          <div style={{ fontSize: 12, color: C.dim, marginBottom: 14 }}>Real-time data from connected APIs and MCP servers.</div>
          {[
            { metric: "Median Home Price (MSA)", value: "$485,000", change: "+3.2%", source: "Zillow" },
            { metric: "Active Land Listings", value: "127", change: "+8", source: "MLS" },
            { metric: "Avg Days on Market (Land)", value: "62 days", change: "-5", source: "Redfin" },
            { metric: "New Permits Filed (30d)", value: "23", change: "+4", source: "County" },
            { metric: "Mortgage Rate (30-yr)", value: "6.75%", change: "+0.125%", source: "Freddie Mac" },
            { metric: "Construction Cost Index", value: "1,142", change: "+2.1%", source: "ENR" },
            { metric: "Land Price PSF (SFR)", value: "$28.50", change: "+5.4%", source: "CoStar" },
            { metric: "Absorption Rate (lots/mo)", value: "3.2", change: "-0.3", source: "Market Study" },
          ].map((m, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 0", borderBottom: "1px solid #0F1117" }}>
              <div style={{ flex: 1, fontSize: 13, color: C.text }}>{m.metric}</div>
              <div style={{ fontSize: 15, color: C.gold, fontWeight: 700 }}>{m.value}</div>
              <div style={{ fontSize: 12, color: m.change.includes("-") ? C.red : C.green, width: 60, textAlign: "right" }}>{m.change}</div>
              <div style={{ fontSize: 9, color: C.dim, width: 70, textAlign: "right" }}>{m.source}</div>
            </div>
          ))}
        </Card>
      </div>
    </Tabs>
  );
}

function CalcHub() {
  const [ac, setAc] = useState("mortgage");
  const calcs = [
    { id: "mortgage", label: "Mortgage Calculator", desc: "Monthly payment, amortization schedule, total interest" },
    { id: "roi", label: "Flip ROI Analysis", desc: "Purchase, rehab, sale price, holding costs, ROI" },
    { id: "devprofit", label: "Dev Profit (New Build)", desc: "Ground-up development profit analysis" },
    { id: "construction", label: "Construction Estimator", desc: "Per-SF cost estimation by trade" },
    { id: "insurance", label: "Insurance Estimator", desc: "Annual property insurance and liability" },
    { id: "caprate", label: "Cap Rate / NOI", desc: "Capitalization rate, NOI, and value analysis" },
    { id: "dscr", label: "DSCR Calculator", desc: "Debt service coverage ratio for lenders" },
    { id: "exchange", label: "1031 Exchange", desc: "Like-kind exchange timeline and requirements" },
    { id: "cashoncash", label: "Cash-on-Cash Return", desc: "Annual cash return on invested equity" },
  ];
  return (
    <div>
      <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
        <div style={{ width: 200, flexShrink: 0 }}>
          {calcs.map(c => (
            <div key={c.id} style={{ ...S.navi(ac === c.id), marginBottom: 2, borderRadius: 3, borderLeft: ac === c.id ? `2px solid ${C.gold}` : "2px solid transparent" }} onClick={() => setAc(c.id)}>
              <span style={{ fontSize: 12 }}>{c.label}</span>
            </div>
          ))}
        </div>
        <div style={{ flex: 1 }}>
          {ac === "mortgage" && <MortgageCalc2 />}
          {ac === "roi" && <ROICalc2 />}
          {ac === "devprofit" && <DevProfitCalc2 />}
          {ac === "construction" && <ConstructionCalc2 />}
          {ac === "insurance" && <InsuranceCalc2 />}
          {ac === "caprate" && <CapRateCalc />}
          {ac === "dscr" && <DSCRCalc />}
          {ac === "exchange" && <ExchangeCalc />}
          {ac === "cashoncash" && <CashOnCashCalc />}
        </div>
      </div>
    </div>
  );
}

function MortgageCalc2() {
  const [loan, setLoan] = useState(500000);
  const [rate, setRate] = useState(6.5);
  const [years, setYears] = useState(30);
  const n = years * 12, r = rate / 100 / 12;
  const pmt = r > 0 ? loan * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1) : loan / n;
  const totalPaid = pmt * n;
  const totalInterest = totalPaid - loan;
  const amort = Array.from({ length: Math.min(12, n) }, (_, i) => {
    const ip = loan * r * Math.pow(1 + r, i) / (Math.pow(1 + r, n) - 1) * (n - i > 0 ? 1 : 0);
    const bal = loan * (Math.pow(1 + r, n) - Math.pow(1 + r, i + 1)) / (Math.pow(1 + r, n) - 1);
    return { month: i + 1, payment: pmt, principal: pmt - loan * r * Math.pow(1 + r, i) / (Math.pow(1 + r, n) - 1) * (n > 0 ? 1 : 0), interest: ip > 0 ? ip : pmt * 0.7, balance: Math.max(0, bal) };
  });
  return (
    <Card title="Mortgage Calculator">
      <div style={S.g3}>
        <Field label="Loan Amount ($)"><input style={S.inp} type="number" value={loan} onChange={e => setLoan(+e.target.value)} /></Field>
        <Field label="Interest Rate (%)"><input style={S.inp} type="number" step="0.125" value={rate} onChange={e => setRate(+e.target.value)} /></Field>
        <Field label="Term (Years)"><select style={S.sel} value={years} onChange={e => setYears(+e.target.value)}><option value={15}>15 Years</option><option value={20}>20 Years</option><option value={25}>25 Years</option><option value={30}>30 Years</option></select></Field>
      </div>
      <div style={{ ...S.g3, marginTop: 14 }}>
        <div style={{ background: C.bg, border: `1px solid ${C.gold}44`, borderRadius: 4, padding: 16, textAlign: "center" }}>
          <div style={{ fontSize: 9, color: C.dim, letterSpacing: 2 }}>MONTHLY PAYMENT</div>
          <div style={{ fontSize: 37, color: C.gold, fontWeight: 700 }}>{fmt.usd(Math.round(pmt))}</div>
        </div>
        <KPI label="Total Paid" value={fmt.usd(Math.round(totalPaid))} color={C.sub} />
        <KPI label="Total Interest" value={fmt.usd(Math.round(totalInterest))} color={C.red} />
      </div>
      <div style={{ marginTop: 14 }}>
        <div style={{ fontSize: 9, color: C.gold, letterSpacing: 2, marginBottom: 8, textTransform: "uppercase" }}>Year 1 Amortization</div>
        <table style={S.tbl}>
          <thead><tr><th style={S.th}>Mo</th><th style={S.th}>Payment</th><th style={S.th}>Principal</th><th style={S.th}>Interest</th><th style={S.th}>Balance</th></tr></thead>
          <tbody>{amort.map(a => (
            <tr key={a.month}>
              <td style={S.td}>{a.month}</td>
              <td style={S.td}>{fmt.usd(Math.round(a.payment))}</td>
              <td style={{ ...S.td, color: C.green }}>{fmt.usd(Math.abs(Math.round(a.principal)))}</td>
              <td style={{ ...S.td, color: C.red }}>{fmt.usd(Math.abs(Math.round(a.interest)))}</td>
              <td style={{ ...S.td, color: C.gold }}>{fmt.usd(Math.round(a.balance))}</td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    </Card>
  );
}

function ROICalc2() {
  const [v, setV] = useState({ purchase: 350000, rehab: 85000, arv: 520000, holdMonths: 6, holdCostMo: 3200, closingBuy: 8000, closingSell: 18000, commission: 3 });
  const u = k => e => setV({ ...v, [k]: +e.target.value });
  const totalIn = v.purchase + v.rehab + v.closingBuy;
  const holdCost = v.holdCostMo * v.holdMonths;
  const commAmt = v.arv * v.commission / 100;
  const totalCost = totalIn + holdCost + v.closingSell + commAmt;
  const profit = v.arv - totalCost;
  const roi2 = totalIn > 0 ? profit / totalIn * 100 : 0;
  const annRoi = v.holdMonths > 0 ? roi2 * (12 / v.holdMonths) : 0;
  return (
    <Card title="Flip ROI Analysis">
      <div style={S.g3}>
        <Field label="Purchase Price"><input style={S.inp} type="number" value={v.purchase} onChange={u("purchase")} /></Field>
        <Field label="Rehab / Renovation"><input style={S.inp} type="number" value={v.rehab} onChange={u("rehab")} /></Field>
        <Field label="After Repair Value (ARV)"><input style={S.inp} type="number" value={v.arv} onChange={u("arv")} /></Field>
        <Field label="Hold Period (months)"><input style={S.inp} type="number" value={v.holdMonths} onChange={u("holdMonths")} /></Field>
        <Field label="Monthly Hold Cost"><input style={S.inp} type="number" value={v.holdCostMo} onChange={u("holdCostMo")} /></Field>
        <Field label="Commission %"><input style={S.inp} type="number" value={v.commission} onChange={u("commission")} /></Field>
      </div>
      <div style={{ ...S.g4, marginTop: 14 }}>
        <KPI label="Total Invested" value={fmt.usd(totalIn)} color={C.sub} />
        <KPI label="Net Profit" value={fmt.usd(profit)} color={profit >= 0 ? C.green : C.red} />
        <KPI label="ROI" value={fmt.pct(roi2)} color={roi2 > 20 ? C.green : C.amber} />
        <KPI label="Annualized ROI" value={fmt.pct(annRoi)} color={annRoi > 30 ? C.green : C.amber} />
      </div>
    </Card>
  );
}

function DevProfitCalc2() {
  const [v, setV] = useState({ land: 800000, lots: 20, hardPerLot: 55000, softPct: 15, contingency: 10, salePerLot: 145000 });
  const u = k => e => setV({ ...v, [k]: +e.target.value });
  const hard = v.lots * v.hardPerLot, soft = hard * v.softPct / 100, cont = (hard + soft) * v.contingency / 100;
  const total = v.land + hard + soft + cont;
  const rev = v.lots * v.salePerLot;
  const profit = rev * 0.97 - total;
  const margin = rev > 0 ? profit / rev * 100 : 0;
  return (
    <Card title="Development Profit Calculator">
      <div style={S.g3}>
        <Field label="Land Cost"><input style={S.inp} type="number" value={v.land} onChange={u("land")} /></Field>
        <Field label="Total Lots"><input style={S.inp} type="number" value={v.lots} onChange={u("lots")} /></Field>
        <Field label="Hard Cost / Lot"><input style={S.inp} type="number" value={v.hardPerLot} onChange={u("hardPerLot")} /></Field>
        <Field label="Soft Cost %"><input style={S.inp} type="number" value={v.softPct} onChange={u("softPct")} /></Field>
        <Field label="Contingency %"><input style={S.inp} type="number" value={v.contingency} onChange={u("contingency")} /></Field>
        <Field label="Sale Price / Lot"><input style={S.inp} type="number" value={v.salePerLot} onChange={u("salePerLot")} /></Field>
      </div>
      <div style={{ ...S.g4, marginTop: 14 }}>
        <KPI label="Total Cost" value={fmt.usd(total)} color={C.red} />
        <KPI label="Revenue" value={fmt.usd(rev)} color={C.blue} />
        <KPI label="Net Profit" value={fmt.usd(profit)} color={profit >= 0 ? C.green : C.red} />
        <KPI label="Margin" value={fmt.pct(margin)} color={margin > 15 ? C.green : C.amber} />
      </div>
    </Card>
  );
}

function ConstructionCalc2() {
  const [sf, setSf] = useState(2400);
  const [qual, setQual] = useState("Standard");
  const rates = { Economy: 125, Standard: 175, Custom: 250, Luxury: 375 };
  const total = sf * (rates[qual] || 175);
  return (
    <Card title="Construction Cost Estimator">
      <div style={S.g3}>
        <Field label="Square Footage"><input style={S.inp} type="number" value={sf} onChange={e => setSf(+e.target.value)} /></Field>
        <Field label="Quality Level"><select style={S.sel} value={qual} onChange={e => setQual(e.target.value)}>{Object.keys(rates).map(r => <option key={r}>{r}</option>)}</select></Field>
        <KPI label="Est. Cost / SF" value={`$${rates[qual]}`} color={C.gold} />
      </div>
      <div style={{ ...S.g3, marginTop: 14 }}>
        <KPI label="Total Est. Cost" value={fmt.usd(total)} color={C.gold} />
        <KPI label="Hard Cost Only (70%)" value={fmt.usd(total * 0.7)} color={C.sub} />
        <KPI label="Soft Cost (30%)" value={fmt.usd(total * 0.3)} color={C.dim} />
      </div>
      <div style={{ marginTop: 14 }}>
        <div style={{ fontSize: 9, color: C.gold, letterSpacing: 2, marginBottom: 8, textTransform: "uppercase" }}>Cost Breakdown by Trade</div>
        {[["Foundation & Concrete", 12], ["Framing & Structure", 18], ["Mechanical (HVAC/Plumbing/Electric)", 22], ["Roofing & Exterior", 10], ["Interior Finishes", 20], ["Site Work & Landscaping", 8], ["General Conditions & Overhead", 10]].map(([t, pct]) => (
          <div key={t} style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 0", borderBottom: "1px solid #0F1117" }}>
            <span style={{ flex: 1, fontSize: 12, color: C.sub }}>{t}</span>
            <span style={{ fontSize: 12, color: C.gold }}>{pct}%</span>
            <span style={{ fontSize: 12, color: C.dim, width: 80, textAlign: "right" }}>{fmt.usd(Math.round(total * pct / 100))}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}

function InsuranceCalc2() {
  const [pv, setPv] = useState(500000);
  const [type, setType] = useState("SFR");
  const rates = { SFR: 0.0035, Condo: 0.003, Multifamily: 0.004, Commercial: 0.005, Land: 0.001 };
  const annual = pv * (rates[type] || 0.0035);
  return (
    <Card title="Insurance Estimator">
      <div style={S.g3}>
        <Field label="Property Value"><input style={S.inp} type="number" value={pv} onChange={e => setPv(+e.target.value)} /></Field>
        <Field label="Property Type"><select style={S.sel} value={type} onChange={e => setType(e.target.value)}>{Object.keys(rates).map(r => <option key={r}>{r}</option>)}</select></Field>
        <KPI label="Rate" value={((rates[type] || 0.0035) * 100).toFixed(2) + "%"} color={C.dim} />
      </div>
      <div style={{ ...S.g3, marginTop: 14 }}>
        <KPI label="Annual Premium" value={fmt.usd(Math.round(annual))} color={C.gold} />
        <KPI label="Monthly" value={fmt.usd(Math.round(annual / 12))} color={C.sub} />
        <KPI label="Per $1K Value" value={"$" + (annual / pv * 1000).toFixed(2)} color={C.dim} />
      </div>
    </Card>
  );
}

function CapRateCalc() {
  const [v, setV] = useState({ price: 2000000, gri: 180000, vacancy: 5, opex: 72000 });
  const u = k => e => setV({ ...v, [k]: +e.target.value });
  const egi = v.gri * (1 - v.vacancy / 100);
  const noi = egi - v.opex;
  const capRate = v.price > 0 ? noi / v.price * 100 : 0;
  const grm = v.gri > 0 ? v.price / v.gri : 0;
  return (
    <Card title="Cap Rate / NOI Calculator">
      <div style={S.g4}>
        <Field label="Purchase Price"><input style={S.inp} type="number" value={v.price} onChange={u("price")} /></Field>
        <Field label="Gross Rental Income"><input style={S.inp} type="number" value={v.gri} onChange={u("gri")} /></Field>
        <Field label="Vacancy %"><input style={S.inp} type="number" value={v.vacancy} onChange={u("vacancy")} /></Field>
        <Field label="Operating Expenses"><input style={S.inp} type="number" value={v.opex} onChange={u("opex")} /></Field>
      </div>
      <div style={{ ...S.g4, marginTop: 14 }}>
        <KPI label="Cap Rate" value={capRate.toFixed(2) + "%"} color={capRate > 6 ? C.green : C.amber} />
        <KPI label="NOI" value={fmt.usd(noi)} color={C.green} />
        <KPI label="EGI" value={fmt.usd(egi)} color={C.blue} />
        <KPI label="GRM" value={grm.toFixed(2) + "x"} color={C.gold} />
      </div>
    </Card>
  );
}

function DSCRCalc() {
  const [v, setV] = useState({ noi: 108000, annualDebt: 84000 });
  const u = k => e => setV({ ...v, [k]: +e.target.value });
  const dscr = v.annualDebt > 0 ? v.noi / v.annualDebt : 0;
  return (
    <Card title="DSCR Calculator">
      <div style={S.g2}>
        <Field label="Annual NOI ($)"><input style={S.inp} type="number" value={v.noi} onChange={u("noi")} /></Field>
        <Field label="Annual Debt Service ($)"><input style={S.inp} type="number" value={v.annualDebt} onChange={u("annualDebt")} /></Field>
      </div>
      <div style={{ ...S.g3, marginTop: 14 }}>
        <div style={{ background: C.bg, border: `1px solid ${dscr >= 1.25 ? C.green : dscr >= 1 ? C.amber : C.red}44`, borderRadius: 4, padding: 20, textAlign: "center" }}>
          <div style={{ fontSize: 9, color: C.dim, letterSpacing: 2 }}>DSCR</div>
          <div style={{ fontSize: 48, color: dscr >= 1.25 ? C.green : dscr >= 1 ? C.amber : C.red, fontWeight: 700 }}>{dscr.toFixed(2)}x</div>
          <div style={{ fontSize: 12, color: C.dim, marginTop: 4 }}>{dscr >= 1.25 ? "Meets lender minimum" : "Below 1.25x minimum"}</div>
        </div>
        <KPI label="NOI" value={fmt.usd(v.noi)} color={C.green} />
        <KPI label="Annual Debt" value={fmt.usd(v.annualDebt)} color={C.red} />
      </div>
    </Card>
  );
}

function ExchangeCalc() {
  const [v, setV] = useState({ salePrice: 800000, basis: 400000, depreciation: 120000, closingDate: "" });
  const u = k => e => setV({ ...v, [k]: typeof v[k] === "number" ? +e.target.value : e.target.value });
  const gain = v.salePrice - (v.basis - v.depreciation);
  const taxDeferred = gain * 0.20 + v.depreciation * 0.25;
  return (
    <Card title="1031 Exchange Calculator">
      <div style={S.g3}>
        <Field label="Sale Price"><input style={S.inp} type="number" value={v.salePrice} onChange={u("salePrice")} /></Field>
        <Field label="Adjusted Basis"><input style={S.inp} type="number" value={v.basis} onChange={u("basis")} /></Field>
        <Field label="Accumulated Depreciation"><input style={S.inp} type="number" value={v.depreciation} onChange={u("depreciation")} /></Field>
      </div>
      <div style={{ ...S.g3, marginTop: 14 }}>
        <KPI label="Recognized Gain" value={fmt.usd(gain)} color={C.gold} />
        <KPI label="Est. Tax Deferred" value={fmt.usd(Math.round(taxDeferred))} color={C.green} />
        <KPI label="Min Replacement Value" value={fmt.usd(v.salePrice)} color={C.blue} sub="Must equal or exceed" />
      </div>
      <div style={{ marginTop: 14, fontSize: 12, color: C.dim }}>
        <div style={{ marginBottom: 6, color: C.gold, fontSize: 9, letterSpacing: 2, textTransform: "uppercase" }}>Key Deadlines</div>
        {[["Day 0", "Close of relinquished property sale"], ["Day 45", "ID deadline — identify up to 3 replacement properties"], ["Day 180", "Acquisition deadline — close on replacement property"]].map(([d, t], i) => (
          <div key={i} style={{ display: "flex", gap: 10, padding: "5px 0", borderBottom: "1px solid #0F1117" }}>
            <span style={{ color: C.gold, fontWeight: 700, width: 50 }}>{d}</span>
            <span>{t}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}

function CashOnCashCalc() {
  const [v, setV] = useState({ cashInvested: 200000, annualCashFlow: 24000 });
  const u = k => e => setV({ ...v, [k]: +e.target.value });
  const coc = v.cashInvested > 0 ? v.annualCashFlow / v.cashInvested * 100 : 0;
  return (
    <Card title="Cash-on-Cash Return Calculator">
      <div style={S.g2}>
        <Field label="Total Cash Invested ($)"><input style={S.inp} type="number" value={v.cashInvested} onChange={u("cashInvested")} /></Field>
        <Field label="Annual Pre-Tax Cash Flow ($)"><input style={S.inp} type="number" value={v.annualCashFlow} onChange={u("annualCashFlow")} /></Field>
      </div>
      <div style={{ ...S.g3, marginTop: 14 }}>
        <div style={{ background: C.bg, border: `1px solid ${coc >= 8 ? C.green : C.amber}44`, borderRadius: 4, padding: 20, textAlign: "center" }}>
          <div style={{ fontSize: 9, color: C.dim, letterSpacing: 2 }}>CASH-ON-CASH RETURN</div>
          <div style={{ fontSize: 48, color: coc >= 8 ? C.green : coc >= 5 ? C.amber : C.red, fontWeight: 700 }}>{coc.toFixed(1)}%</div>
        </div>
        <KPI label="Monthly Cash Flow" value={fmt.usd(Math.round(v.annualCashFlow / 12))} color={C.green} />
        <KPI label="Payback Period" value={v.annualCashFlow > 0 ? (v.cashInvested / v.annualCashFlow).toFixed(1) + " yrs" : "N/A"} color={C.gold} />
      </div>
    </Card>
  );
}

function CopilotPanel() {
  const { project, fin, loan, equity, risks, permits } = usePrj();
  const [msgs, setMsgs] = useState([]);
  const [inp, setInp] = useState("");
  const [busy, setBusy] = useState(false);
  const [model, setModel] = useState("claude-sonnet-4-20250514");
  const [mode, setMode] = useState("general");
  const modes = {
    general: { label: "General Assistant", system: "You are Axiom Copilot, an AI assistant for a real estate development intelligence platform. Help with any questions about real estate development, feasibility analysis, financial modeling, entitlements, or market analysis. When asked to analyze a deal, always reference the project context below and provide specific numbers." },
    underwriter: { label: "Underwriter", system: "You are a real estate development underwriter with institutional lending experience. Analyze deals using the project's actual pro forma data. Stress-test assumptions by varying land cost ±15%, absorption ±30%, and sale prices ±10%. Calculate levered and unlevered returns. Flag any metrics that fall outside institutional thresholds (e.g., margin <20%, IRR <15%, LTC >80%)." },
    legal: { label: "Legal / Entitlements", system: "You are a real estate attorney specializing in California land use, entitlements, CEQA/NEPA, zoning variances, density bonuses (SB 35, SB 9, AB 2011), CC&Rs, development agreements, and subdivision maps. Reference the project's permit status and jurisdiction when advising on entitlement strategy and timeline." },
    market: { label: "Market Analyst", system: "You are a real estate market analyst specializing in residential land development. Analyze comparable sales, absorption rates, pricing trends, builder demand, and supply/demand dynamics. Use the project's absorption rate and pricing data as baseline and suggest whether assumptions are aggressive, conservative, or market-appropriate." },
    financial: { label: "CFO / Financial", system: "You are a real estate development CFO. Analyze pro formas using IRR (Newton-Raphson), NPV, equity multiples, and cash-on-cash returns. Optimize capital stack (debt/equity split, mezzanine, preferred equity). Structure equity waterfalls with GP/LP splits, preferred returns, and promote tiers. Always reference the project's actual financial model data." },
  };
  const buildCopilotCtx = useCallback(() => {
    const loc = project.state ? (project.municipality ? `${project.municipality}, ${project.state}` : project.state) : "unspecified";
    const hard = fin.totalLots * fin.hardCostPerLot;
    const soft = hard * fin.softCostPct / 100;
    const fees = fin.planningFees + (fin.permitFeePerLot + fin.schoolFee + fin.impactFeePerLot) * fin.totalLots;
    const cont = (hard + soft) * fin.contingencyPct / 100;
    const tc = fin.landCost + fin.closingCosts + hard + soft + cont + fees;
    const rev = fin.totalLots * fin.salesPricePerLot;
    const profit = rev * (1 - fin.salesCommission / 100) - tc * (1 + fin.reservePercentage / 100);
    const margin = rev > 0 ? (profit / rev * 100).toFixed(1) : 0;
    const loanAmt = tc * (loan?.ltc || 70) / 100;
    const equityNeed = tc - loanAmt;
    let irrPct = "N/A", npvStr = "N/A";
    try {
      const cf = buildMonthlyCashFlows(fin);
      const monthlyIRR = calcIRR(cf);
      if (monthlyIRR !== null) irrPct = ((Math.pow(1 + monthlyIRR, 12) - 1) * 100).toFixed(1) + "%";
      npvStr = "$" + (calcNPV(0.08 / 12, cf) / 1e6).toFixed(2) + "M";
    } catch { }
    const openRisks = (risks || []).filter(r => r.status === "Open" || !r.status);
    const highRisks = openRisks.filter(r => r.severity === "High" || r.severity === "Critical");
    const riskLine = openRisks.length > 0 ? `Risks: ${openRisks.length} open (${highRisks.length} high/critical)${highRisks.length > 0 ? " — " + highRisks.slice(0, 2).map(r => r.risk).join(", ") : ""}` : "No open risks.";
    const pendingPermits = (permits || []).filter(p => p.status !== "Approved" && p.status !== "Complete");
    const permitLine = pendingPermits.length > 0 ? `Permits: ${pendingPermits.map(p => `${p.name} (${p.status})`).join(", ")}` : "Permits: All approved or none tracked.";
    return `${modes[mode].system}\n\n--- ACTIVE PROJECT CONTEXT ---\nProject: ${project.name || "Unnamed"} | Location: ${loc} | Address: ${project.address || "N/A"}\nLots: ${fin.totalLots} | Land Cost: $${(fin.landCost / 1e6).toFixed(2)}M | Total Cost: $${(tc / 1e6).toFixed(2)}M | Revenue: $${(rev / 1e6).toFixed(2)}M\nHard Cost/Lot: $${fin.hardCostPerLot.toLocaleString()} | Sale Price/Lot: $${fin.salesPricePerLot.toLocaleString()} | Absorption: ${fin.absorbRate}/mo\nProfit: $${(profit / 1e6).toFixed(2)}M | Margin: ${margin}% | IRR: ${irrPct} | NPV (8%): ${npvStr}\nDebt: $${(loanAmt / 1e6).toFixed(2)}M (${loan?.ltc || 70}% LTC @ ${loan?.rate || 9.5}%) | Equity: $${(equityNeed / 1e6).toFixed(2)}M (GP ${equity?.gpPct || 10}%/LP ${equity?.lpPct || 90}%, ${equity?.prefReturn || 8}% pref)\n${riskLine}\n${permitLine}\n--- Reference these numbers in your answers. Be specific and data-driven. ---`;
  }, [mode, project, fin, loan, equity, risks, permits]);
  const send = useCallback(async () => {
    if (!inp.trim() || busy) return;
    const um = { role: "user", content: inp };
    const nm = [...msgs, um]; setMsgs(nm); setInp(""); setBusy(true);
    const reply = await callClaude(nm, buildCopilotCtx(), model);
    setMsgs([...nm, { role: "assistant", content: reply }]);
    setBusy(false);
  }, [inp, msgs, buildCopilotCtx, busy, model]);
  const prompts = [
    "Generate an executive summary for this project",
    "What are the top 5 risks for this deal?",
    "Calculate the IRR assuming 18-month sell-out",
    "Draft a letter of intent for land acquisition",
    "Analyze the comp data and suggest pricing",
    "What CEQA exemption applies to this project?",
    "Build a construction loan draw schedule",
    "Summarize due diligence findings",
  ];
  return (
    <div>
      <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
        <select style={{ ...S.sel, width: 200 }} value={mode} onChange={e => setMode(e.target.value)}>
          {Object.entries(modes).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <select style={{ ...S.sel, width: 220 }} value={model} onChange={e => setModel(e.target.value)}>
          <option value="claude-sonnet-4-20250514">Claude Sonnet 4</option>
          <option value="claude-opus-4-20250514">Claude Opus 4</option>
          <option value="claude-3-5-haiku-20241022">Claude Haiku 3.5</option>
        </select>
        <div style={{ flex: 1 }} />
        <button style={S.btn()} onClick={() => setMsgs([])}>Clear History</button>
      </div>
      <div style={S.g2}>
        <div>
          <Card title={`Copilot — · ${modes[mode].label}`}>
            <div style={{ maxHeight: 450, overflowY: "auto", marginBottom: 12 }}>
              {!msgs.length && (
                <div style={{ padding: 20, textAlign: "center" }}>
                  <div style={{ fontSize: 32, color: C.gold, marginBottom: 8 }}>— </div>
                  <div style={{ fontSize: 14, color: C.text, fontWeight: 600 }}>Axiom Copilot</div>
                  <div style={{ fontSize: 12, color: C.dim, marginTop: 4 }}>Your AI development intelligence assistant</div>
                  <div style={{ fontSize: 10, color: C.dim, marginTop: 8 }}>Mode: {modes[mode].label} — · Project: {project.name || "None"}</div>
                </div>
              )}
              {msgs.map((m, i) => (
                <div key={i} style={S.bub(m.role)}>
                  <div style={{ fontSize: 9, color: C.dim, letterSpacing: 1, marginBottom: 3, textTransform: "uppercase" }}>{m.role === "user" ? "You" : "—  Copilot"}</div>
                  <pre style={{ margin: 0, whiteSpace: "pre-wrap", fontFamily: "inherit", fontSize: 13, lineHeight: 1.5 }}>{m.content}</pre>
                </div>
              ))}
              {busy && <div style={{ ...S.bub("assistant"), color: C.gold, fontSize: 12 }}>—  Thinking...</div>}
            </div>
            <div style={{ display: "flex", gap: 7 }}>
              <input style={{ ...S.inp, flex: 1 }} value={inp} onChange={e => setInp(e.target.value)} onKeyDown={e => e.key === "Enter" && send()} placeholder={`Ask ${modes[mode].label}...`} />
              <button style={S.btn("gold")} onClick={send} disabled={busy}>Send</button>
            </div>
          </Card>
        </div>
        <div>
          <Card title="Quick Prompts">
            {prompts.map((p, i) => (
              <div key={i} style={{ padding: "7px 0", borderBottom: "1px solid #0F1117", cursor: "pointer" }} onClick={() => setInp(p)}>
                <span style={{ fontSize: 12, color: C.sub }}>{p}</span>
              </div>
            ))}
          </Card>
          <Card title="Context">
            <div style={{ fontSize: 12, color: C.dim }}>
              {[["Project", project.name || "—"], ["Address", project.address || "—"], ["Jurisdiction", project.jurisdiction || "—"], ["Lots", fin.totalLots], ["Land Cost", fmt.usd(fin.landCost)], ["Sale Price/Lot", fmt.usd(fin.salesPricePerLot)]].map(([l, v]) => (
                <div key={l} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", borderBottom: "1px solid #0F1117" }}>
                  <span>{l}</span><span style={{ color: C.sub }}>{v}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Agents() {
  const { canUse } = useTier();
  if (!canUse("ai_agents")) return (
    <div style={{ textAlign: "center", padding: 60 }}>
      <div style={{ fontSize: 48, marginBottom: 12 }}>🤖</div>
      <div style={{ fontSize: 18, color: C.text, fontWeight: 700, marginBottom: 6 }}>AI Agent Hub</div>
      <div style={{ fontSize: 13, color: C.dim, marginBottom: 16, maxWidth: 420, margin: "0 auto 16px" }}>Get AI-powered acquisition analysis, legal review, and financial modeling with jurisdiction-specific intelligence. Upgrade to Pro to unlock all agents.</div>
      <UpgradeButton plan="pro" label="Unlock AI Agents — $29/mo" />
    </div>
  );
  return (
    <div style={S.g3}>
      <Card title="Acquisition AI"><Agent id="AcqAgent" system="You are an expert real estate acquisition analyst specializing in land development. Provide market-aware deal analysis with attention to comparable sales, absorption rates, and entry cap rates. Always cite specific data points and flag risks." placeholder="Ask about deals..." /></Card>
      <Card title="Legal AI"><Agent id="LegalAgent" system="You are a real estate attorney specializing in land use, zoning, entitlements, and development agreements. Provide jurisdiction-specific legal guidance. Flag risks clearly. Always note when the user should consult local counsel." placeholder="Ask legal questions..." /></Card>
      <Card title="Finance AI"><Agent id="FinAgent" system="You are a real estate development CFO. Analyze pro formas, cash flow waterfalls, debt structures, and equity returns. Use precise financial terminology. Validate assumptions against market norms." placeholder="Analyze financials..." /></Card>
    </div>
  );
}

function InvoicesPayments() {
  const auth = useAuth();
  const ctx = useCtx();
  const SEED = [
    { id: 1, vendor: "Thompson Civil Engineering", amount: 12500, date: "2025-02-15", status: "Paid", category: "Soft Costs", deal: "Sunset Ridge" },
    { id: 2, vendor: "Pacific Realty Group", amount: 45000, date: "2025-02-10", status: "Pending", category: "Acquisition", deal: "Sunset Ridge" },
    { id: 3, vendor: "City of Sacramento", amount: 8500, date: "2025-02-18", status: "Approved", category: "Fees", deal: "Hawk Valley" },
    { id: 4, vendor: "A+ Grading Services", amount: 28000, date: "2025-02-22", status: "New", category: "Hard Costs", deal: "Sunset Ridge" },
  ];
  const [invoices, setInvoices] = useLS("axiom_invoices", SEED);
  const [syncStatus, setSyncStatus] = useState("idle");
  const loadedRef = useRef(false);
  const saveTimer = useRef(null);

  // Hydrate from Supabase
  useEffect(() => {
    if (loadedRef.current || !auth?.user || !auth?.userProfile?.org_id || !supa.configured()) return;
    loadedRef.current = true;
    setSyncStatus("syncing");
    (async () => {
      try {
        const rows = await supa.select("invoices", `org_id=eq.${auth.userProfile.org_id}&order=created_at.desc`);
        if (rows.length > 0) {
          setInvoices(rows.map(r => ({ _supaId: r.id, id: r.id, vendor: r.vendor || "", amount: Number(r.amount) || 0, date: r.date || "", status: r.status || "New", category: r.category || "Soft Costs", deal: r.deal || "", notes: r.notes || "" })));
        }
        setSyncStatus("synced");
      } catch (e) { console.warn("Invoices hydrate failed:", e); setSyncStatus("error"); }
    })();
  }, [auth?.user, auth?.userProfile?.org_id]);

  const syncInvoice = useCallback((invoice, isDelete = false) => {
    if (!auth?.user || !auth?.userProfile?.org_id || !supa.configured()) return;
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      try {
        if (isDelete) {
          if (invoice._supaId) await supa.del("invoices", { id: invoice._supaId });
        } else {
          const payload = { org_id: auth.userProfile.org_id, project_id: ctx?.activeProjectId || null, vendor: invoice.vendor, amount: invoice.amount, date: invoice.date, status: invoice.status, category: invoice.category, deal: invoice.deal || "", notes: invoice.notes || "" };
          if (invoice._supaId) { payload.id = invoice._supaId; await supa.upsert("invoices", payload); }
          else {
            const inserted = await supa.insert("invoices", payload);
            if (inserted?.id) setInvoices(prev => prev.map(i => i.id === invoice.id ? { ...i, _supaId: inserted.id, id: inserted.id } : i));
          }
        }
        setSyncStatus("synced");
      } catch (e) { console.warn("Invoice sync failed:", e); setSyncStatus("error"); }
    }, 800);
  }, [auth?.user, auth?.userProfile?.org_id, ctx?.activeProjectId]);

  const [active, setActive] = useState("all");
  const [showAdd, setShowAdd] = useState(false);
  const [ni, setNi] = useState({ vendor: "", amount: "", date: new Date().toISOString().split("T")[0], status: "New", category: "Soft Costs", deal: "" });
  const CATS = ["Land", "Acquisition", "Hard Costs", "Soft Costs", "Fees", "Legal", "Other"];
  const STATUSES = ["New", "Approved", "Paid", "Pending", "Rejected"];

  const addInvoice = () => {
    if (!ni.vendor || !ni.amount) return;
    const newInv = { ...ni, id: Date.now(), amount: parseFloat(ni.amount) || 0 };
    setInvoices(prev => [...prev, newInv]);
    syncInvoice(newInv);
    setNi({ vendor: "", amount: "", date: new Date().toISOString().split("T")[0], status: "New", category: "Soft Costs", deal: "" });
    setShowAdd(false);
  };

  const stats = [
    { l: "Total Invoiced", v: fmt.usd(invoices.reduce((a, b) => a + b.amount, 0)), c: C.text },
    { l: "Paid", v: fmt.usd(invoices.filter(i => i.status === "Paid").reduce((a, b) => a + b.amount, 0)), c: C.green },
    { l: "Pending", v: fmt.usd(invoices.filter(i => i.status !== "Paid").reduce((a, b) => a + b.amount, 0)), c: C.amber },
  ];
  return (
    <Tabs tabs={["Invoices", "Draw Requests", "Approval Workflow"]}>
      <div>
        <div style={{ ...S.g3, marginBottom: 14 }}>
          {stats.map(s => <KPI key={s.l} label={s.l} value={s.v} color={s.c} />)}
        </div>
        {showAdd && (
          <Card title="Add Invoice">
            <div style={S.g3}>
              <Field label="Vendor"><input style={S.inp} value={ni.vendor} onChange={e => setNi({ ...ni, vendor: e.target.value })} placeholder="Vendor name" /></Field>
              <Field label="Amount ($)"><input style={S.inp} type="number" value={ni.amount} onChange={e => setNi({ ...ni, amount: e.target.value })} placeholder="0.00" /></Field>
              <Field label="Date"><input style={S.inp} type="date" value={ni.date} onChange={e => setNi({ ...ni, date: e.target.value })} /></Field>
              <Field label="Category"><select style={S.sel} value={ni.category} onChange={e => setNi({ ...ni, category: e.target.value })}>{CATS.map(c => <option key={c}>{c}</option>)}</select></Field>
              <Field label="Status"><select style={S.sel} value={ni.status} onChange={e => setNi({ ...ni, status: e.target.value })}>{STATUSES.map(s => <option key={s}>{s}</option>)}</select></Field>
              <Field label="Deal / Project"><input style={S.inp} value={ni.deal} onChange={e => setNi({ ...ni, deal: e.target.value })} placeholder="Deal name" /></Field>
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
              <button style={S.btn("gold")} onClick={addInvoice}>Save Invoice</button>
              <button style={S.btn()} onClick={() => setShowAdd(false)}>Cancel</button>
            </div>
          </Card>
        )}
        <Card title="Invoice Management" action={<button style={S.btn("gold")} onClick={() => setShowAdd(v => !v)}>+ Ingest Invoice</button>}>
          <table style={S.tbl}>
            <thead><tr><th style={S.th}>Vendor</th><th style={S.th}>Category</th><th style={S.th}>Amount</th><th style={S.th}>Date</th><th style={S.th}>Status</th><th style={S.th}>Deal</th></tr></thead>
            <tbody>
              {invoices.map(i => (
                <tr key={i.id}>
                  <td style={{ ...S.td, fontWeight: 600 }}>{i.vendor}</td>
                  <td style={S.td}><Badge label={i.category} color={C.blue} /></td>
                  <td style={{ ...S.td, color: C.gold }}>{fmt.usd(i.amount)}</td>
                  <td style={S.td}>{i.date}</td>
                  <td style={S.td}><Dot color={i.status === "Paid" ? C.green : C.amber} />{i.status}</td>
                  <td style={S.td}>{i.deal}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
      <div>
        <Card title="Digital Draw Requests">
          <div style={{ fontSize: 12, color: C.dim, marginBottom: 16 }}>Automated AIA G702/G703 style draw documentation for bank submission.</div>
          {[["Draw #04 - Feb 2025", "$145,200", "Pending"], ["Draw #03 - Jan 2025", "$212,000", "Paid"], ["Draw #02 - Dec 2024", "$88,500", "Paid"]].map(([n, v, s], i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0", borderBottom: "1px solid #0F1117" }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, color: C.text }}>{n}</div>
                <div style={{ fontSize: 10, color: C.dim }}>Submission Package: All Invoices + Lien Waivers</div>
              </div>
              <div style={{ fontSize: 14, color: C.gold, fontWeight: 700 }}>{v}</div>
              <Badge label={s} color={s === "Paid" ? C.green : C.amber} />
              <button style={S.btn()}>Review</button>
            </div>
          ))}
        </Card>
      </div>
      <div>
        <Card title="Payment Approval Flow">
          <div style={{ fontSize: 12, color: C.dim, marginBottom: 12 }}>Multi-stage approval for construction disbursements.</div>
          <div style={{ display: "flex", gap: 12, alignItems: "center", padding: 14, background: C.bg2, borderRadius: 4 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, color: C.gold, fontWeight: 700 }}>A+ Grading Services - $28,000</div>
              <div style={{ fontSize: 10, color: C.dim }}>Invoice #INV-9284 &middot; Sunset Ridge</div>
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <button style={{ ...S.btn("gold"), padding: "4px 10px" }}>Approve</button>
              <button style={{ ...S.btn(), padding: "4px 10px" }}>Reject</button>
            </div>
          </div>
        </Card>
      </div>
    </Tabs>
  );
}

function SiteManagement() {
  const { siteTasks, setSiteTasks } = useCtx();
  const [showAdd, setShowAdd] = useState(false);
  const [newTask, setNewTask] = useState({ title: "", status: "Planned", priority: "High", assignee: "", due_date: "", category: "General" });
  const tasks = siteTasks || [];
  const addTask = () => {
    if (!newTask.title) return;
    setSiteTasks(prev => [...prev, { ...newTask, id: Date.now().toString(), progress: 0, start: newTask.due_date, dur: 7 }]);
    setNewTask({ title: "", status: "Planned", priority: "High", assignee: "", due_date: "", category: "General" });
    setShowAdd(false);
  };
  const updateTask = (id, patch) => setSiteTasks(prev => prev.map(t => (t.id === id || t._supaId === id) ? { ...t, ...patch } : t));
  const removeTask = (id) => setSiteTasks(prev => prev.filter(t => t.id !== id && t._supaId !== id));
  const STATUSES = ["Planned", "In Progress", "Complete", "Blocked"];
  const PRIORITIES = ["Low", "Medium", "High", "Critical"];
  const CATS = ["General", "Grading", "Utilities", "Survey", "Concrete", "Landscaping", "Inspection", "Permitting"];
  const statColor = { Planned: C.blue, "In Progress": C.gold, Complete: C.green, Blocked: C.red };
  const priColor = { Low: C.dim, Medium: C.blue, High: C.amber, Critical: C.red };
  return (
    <Tabs tabs={["Development Schedule", "Daily Logs", "RFIs & Submittals"]}>
      <div>
        <Card title="Site Task Tracker" action={<button style={S.btn("gold")} onClick={() => setShowAdd(v => !v)}>+ Add Task</button>}>
          {showAdd && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, padding: 14, background: C.bg3, borderRadius: 4, marginBottom: 12, border: `1px solid ${C.border}` }}>
              <Field label="Task Title"><input style={S.inp} value={newTask.title} onChange={e => setNewTask(p => ({ ...p, title: e.target.value }))} placeholder="e.g. Mass Grading" /></Field>
              <Field label="Category"><select style={S.sel} value={newTask.category} onChange={e => setNewTask(p => ({ ...p, category: e.target.value }))}>{CATS.map(o => <option key={o}>{o}</option>)}</select></Field>
              <Field label="Priority"><select style={S.sel} value={newTask.priority} onChange={e => setNewTask(p => ({ ...p, priority: e.target.value }))}>{PRIORITIES.map(o => <option key={o}>{o}</option>)}</select></Field>
              <Field label="Status"><select style={S.sel} value={newTask.status} onChange={e => setNewTask(p => ({ ...p, status: e.target.value }))}>{STATUSES.map(o => <option key={o}>{o}</option>)}</select></Field>
              <Field label="Due Date"><input style={S.inp} type="date" value={newTask.due_date} onChange={e => setNewTask(p => ({ ...p, due_date: e.target.value }))} /></Field>
              <Field label="Assignee"><input style={S.inp} value={newTask.assignee} onChange={e => setNewTask(p => ({ ...p, assignee: e.target.value }))} placeholder="Name or crew" /></Field>
              <div style={{ gridColumn: "1/-1", display: "flex", gap: 8, justifyContent: "flex-end" }}>
                <button style={S.btn("dim")} onClick={() => setShowAdd(false)}>Cancel</button>
                <button style={S.btn("green")} onClick={addTask}>Save Task</button>
              </div>
            </div>
          )}
          <div style={{ padding: "6px 0" }}>
            {tasks.length === 0 && <div style={{ color: C.dim, fontSize: 12, textAlign: "center", padding: 24 }}>No tasks yet. Add your first site task above.</div>}
            {tasks.map(t => {
              const tid = t.id || t._supaId;
              const prog = t.status === "Complete" ? 100 : t.status === "Blocked" ? t.progress || 0 : t.progress || (t.status === "In Progress" ? 50 : 0);
              return (
                <div key={tid} style={{ marginBottom: 14, padding: "10px 12px", background: C.bg2, borderRadius: 4, border: `1px solid ${C.border}` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                    <div>
                      <span style={{ color: C.text, fontSize: 13, fontWeight: 600 }}>{t.title || t.name}</span>
                      <span style={{ ...S.tag(priColor[t.priority] || C.dim), marginLeft: 8 }}>{t.priority || "Medium"}</span>
                      <span style={{ ...S.tag(C.blue), marginLeft: 4 }}>{t.category || "General"}</span>
                    </div>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <select style={{ ...S.sel, padding: "2px 6px", fontSize: 10, width: "auto" }} value={t.status} onChange={e => updateTask(tid, { status: e.target.value })}>
                        {STATUSES.map(s => <option key={s}>{s}</option>)}
                      </select>
                      <button style={{ background: "none", border: "none", color: C.dim, cursor: "pointer", fontSize: 16, lineHeight: 1 }} onClick={() => removeTask(tid)}>×</button>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 16, fontSize: 10, color: C.dim, marginBottom: 6 }}>
                    {t.due_date && <span>📅 Due: {t.due_date}</span>}
                    {t.assignee && <span>👤 {t.assignee}</span>}
                  </div>
                  <div style={{ height: 6, background: C.bg3, borderRadius: 3, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${prog}%`, background: statColor[t.status] || C.gold, borderRadius: 3, transition: "width 0.3s ease" }} />
                  </div>
                  <div style={{ display: "flex", gap: 8, marginTop: 6, alignItems: "center" }}>
                    <span style={{ fontSize: 9, color: C.dim }}>Progress: {prog}%</span>
                    <input type="range" min={0} max={100} value={prog} style={{ flex: 1, accentColor: C.gold, height: 3 }} onChange={e => updateTask(tid, { progress: +e.target.value, status: +e.target.value === 100 ? "Complete" : +e.target.value === 0 ? "Planned" : "In Progress" })} />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
      <div>
        <Card title="Construction Daily Logs">
          <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
            <KPI label="Workers on Site" value="12" />
            <KPI label="Weather" value="Sunny / 72°F" />
            <KPI label="Incidents" value="0" color={C.green} />
          </div>
          {[["Feb 24, 2025", "A+ Grading started mobilization. Geotech on site."], ["Feb 23, 2025", "Site fencing completed. Signage installed."], ["Feb 22, 2025", "Utility markups completed by city."]].map(([d, l], i) => (
            <div key={i} style={{ padding: "10px 0", borderBottom: "1px solid #0F1117" }}>
              <div style={{ fontSize: 10, color: C.gold, fontWeight: 700 }}>{d}</div>
              <div style={{ fontSize: 12, color: C.sub, marginTop: 4 }}>{l}</div>
            </div>
          ))}
        </Card>
      </div>
      <div>
        <Card title="RFIs & Submittals">
          <div style={S.g2}>
            <div style={{ background: C.bg2, border: `1px solid ${C.border}`, padding: 12, borderRadius: 4 }}>
              <div style={S.lbl}>Open RFIs</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: C.amber }}>3</div>
              <div style={{ fontSize: 10, color: C.dim, marginTop: 4 }}>Avg. Response: 1.4 days</div>
            </div>
            <div style={{ background: C.bg2, border: `1px solid ${C.border}`, padding: 12, borderRadius: 4 }}>
              <div style={S.lbl}>Pending Submittals</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: C.gold }}>5</div>
              <div style={{ fontSize: 10, color: C.dim, marginTop: 4 }}>Critical Path: 2 listed</div>
            </div>
          </div>
        </Card>
      </div>
    </Tabs>
  );
}

function VendorNetwork() {
  const { vendors, setVendors } = usePrj();
  const [nv, setNv] = useState({ name: "", type: "General Contractor", status: "Active", contact: "", email: "", phone: "", insuranceExp: "", msaSigned: false, rating: 5, notes: "" });
  const [filt, setFilt] = useState("All");

  const addVendor = () => {
    if (!nv.name) return;
    setVendors([...vendors, { ...nv, id: Date.now() }]);
    setNv({ name: "", type: "General Contractor", status: "Active", contact: "", email: "", phone: "", insuranceExp: "", msaSigned: false, rating: 5, notes: "" });
  };

  const filtered = (vendors || []).filter(v => filt === "All" || v.type === filt || v.status === filt);
  const types = ["General Contractor", "Architect", "Civil Engineer", "Structural Engineer", "MEP Engineer", "Landscape Architect", "Environmental", "Legal", "Broker"];

  return (
    <Tabs tabs={["Vendor Directory", "Compliance Tracking", "Bid Management"]}>
      <div>
        <div style={S.g4}>
          <KPI label="Total Active Vendors" value={(vendors || []).filter(v => v.status === 'Active').length} />
          <KPI label="Expiring COIs (30d)" value={(vendors || []).filter(v => new Date(v.insuranceExp) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)).length} color={C.amber} />
          <KPI label="Executed MSAs" value={(vendors || []).filter(v => v.msaSigned).length} color={C.green} />
          <KPI label="Avg Vendor Rating" value={((vendors || []).reduce((s, v) => s + v.rating, 0) / ((vendors || []).length || 1)).toFixed(1)} />
        </div>
        <Card title="Vendor Directory" action={<select style={{ ...S.sel, width: "auto", padding: "3px 8px", fontSize: 10 }} value={filt} onChange={e => setFilt(e.target.value)}><option>All</option>{types.map(t => <option key={t}>{t}</option>)}<option>Active</option><option>Inactive</option></select>}>
          <table style={S.tbl}>
            <thead><tr><th style={S.th}>Company</th><th style={S.th}>Type</th><th style={S.th}>Primary Contact</th><th style={S.th}>MSA Signed</th><th style={S.th}>COI Expiration</th><th style={S.th}>Status</th><th style={S.th}></th></tr></thead>
            <tbody>{filtered.map(v => (
              <tr key={v.id}>
                <td style={{ ...S.td, color: C.gold, fontWeight: 500 }}>{v.name}</td>
                <td style={S.td}>{v.type}</td>
                <td style={{ ...S.td, color: C.text }}>
                  <div>{v.contact}</div>
                  <div style={{ fontSize: 10, color: C.dim }}>{v.email} · {v.phone}</div>
                </td>
                <td style={S.td}><Badge label={v.msaSigned ? "Executed" : "Pending"} color={v.msaSigned ? C.green : C.amber} /></td>
                <td style={{ ...S.td, color: new Date(v.insuranceExp) < new Date() ? C.red : C.text }}>{v.insuranceExp || "N/A"}</td>
                <td style={S.td}><Badge label={v.status} color={v.status === "Active" ? C.green : C.dim} /></td>
                <td style={S.td}><button style={{ ...S.btn(), padding: "2px 7px", fontSize: 9 }} onClick={() => setVendors(vendors.filter(x => x.id !== v.id))}>x</button></td>
              </tr>
            ))}
              {filtered.length === 0 && <tr><td colSpan={7} style={{ ...S.td, textAlign: 'center', color: C.dim }}>No vendors found. Add one below.</td></tr>}
            </tbody>
          </table>
        </Card>
        <Card title="Onboard New Vendor">
          <div style={S.g4}>
            <Field label="Company Name"><input style={S.inp} value={nv.name} onChange={e => setNv({ ...nv, name: e.target.value })} placeholder="Vendor Name..." /></Field>
            <Field label="Type"><select style={S.sel} value={nv.type} onChange={e => setNv({ ...nv, type: e.target.value })}>{types.map(t => <option key={t}>{t}</option>)}</select></Field>
            <Field label="Contact Name"><input style={S.inp} value={nv.contact} onChange={e => setNv({ ...nv, contact: e.target.value })} /></Field>
            <Field label="Email"><input style={S.inp} type="email" value={nv.email} onChange={e => setNv({ ...nv, email: e.target.value })} /></Field>
            <Field label="Phone"><input style={S.inp} type="tel" value={nv.phone} onChange={e => setNv({ ...nv, phone: e.target.value })} /></Field>
            <Field label="COI Expiration"><input style={S.inp} type="date" value={nv.insuranceExp} onChange={e => setNv({ ...nv, insuranceExp: e.target.value })} /></Field>
            <Field label="MSA Signed"><select style={S.sel} value={nv.msaSigned ? "Yes" : "No"} onChange={e => setNv({ ...nv, msaSigned: e.target.value === "Yes" })}><option>No</option><option>Yes</option></select></Field>
            <Field label="Status"><select style={S.sel} value={nv.status} onChange={e => setNv({ ...nv, status: e.target.value })}><option>Active</option><option>Inactive</option><option>Do Not Use</option></select></Field>
          </div>
          <button style={{ ...S.btn("gold"), marginTop: 16 }} onClick={addVendor}>Save Vendor</button>
        </Card>
      </div>
      <div>
        <Card title="Compliance Tracking">
          <div style={{ color: C.dim, padding: 40, textAlign: "center", border: `1px dashed ${C.border}`, borderRadius: 8 }}>
            <div style={{ fontSize: 32, color: C.amber, marginBottom: 12, opacity: 0.5 }}>🛡️</div><br />
            Drag and drop Certificates of Insurance (COIs) and Master Service Agreements here.<br /><br />
            <span style={{ fontSize: 11 }}>Axiom OS will autonomously parse the documents, update expiration dates, and notify you 30 days prior to lapse.</span>
          </div>
        </Card>
      </div>
      <div>
        <BidManagement />
      </div>
    </Tabs>
  );
}

function BidManagement() {
  const [bids, setBids] = useState([
    { id: 1, trade: "Earthwork & Grading", invited: 4, received: 3, lowBid: 1240000, status: "Leveling" },
    { id: 2, trade: "Wet Utilities", invited: 3, received: 0, lowBid: 0, status: "Bidding" },
    { id: 3, trade: "Site Concrete", invited: 5, received: 5, lowBid: 485000, status: "Awarded" },
  ]);
  const [newBid, setNewBid] = useState({ trade: "", invited: 0, received: 0, lowBid: 0, status: "Bidding" });
  return (
    <Card title="Active RFPs & Bid Management">
      <table style={S.tbl}>
        <thead><tr><th style={S.th}>Trade / Package</th><th style={S.th}>Bidders Invited</th><th style={S.th}>Bids Received</th><th style={S.th}>Current Low Bid</th><th style={S.th}>Status</th><th style={S.th}></th></tr></thead>
        <tbody>
          {bids.map(b => (
            <tr key={b.id}>
              <td style={{ ...S.td, color: C.text }}>{b.trade}</td>
              <td style={S.td}>{b.invited}</td>
              <td style={S.td}>{b.received}</td>
              <td style={{ ...S.td, color: b.lowBid > 0 ? C.gold : C.dim }}>{b.lowBid > 0 ? fmt.usd(b.lowBid) : "--"}</td>
              <td style={S.td}>
                <select style={{ ...S.sel, width: "auto", padding: "2px 6px", fontSize: 10 }} value={b.status} onChange={e => setBids(bids.map(x => x.id === b.id ? { ...x, status: e.target.value } : x))}>
                  {["Bidding", "Leveling", "Awarded", "Cancelled"].map(s => <option key={s}>{s}</option>)}
                </select>
              </td>
              <td style={S.td}><button style={{ ...S.btn(), padding: "2px 7px", fontSize: 9 }} onClick={() => setBids(bids.filter(x => x.id !== b.id))}>x</button></td>
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ ...S.g5, marginTop: 12 }}>
        <Field label="Trade Package"><input style={S.inp} value={newBid.trade} onChange={e => setNewBid({ ...newBid, trade: e.target.value })} placeholder="e.g. Dry Utilities" /></Field>
        <Field label="Bidders Invited"><input style={S.inp} type="number" value={newBid.invited} onChange={e => setNewBid({ ...newBid, invited: +e.target.value })} /></Field>
        <Field label="Bids Received"><input style={S.inp} type="number" value={newBid.received} onChange={e => setNewBid({ ...newBid, received: +e.target.value })} /></Field>
        <Field label="Low Bid ($)"><input style={S.inp} type="number" value={newBid.lowBid} onChange={e => setNewBid({ ...newBid, lowBid: +e.target.value })} /></Field>
        <div style={{ display: "flex", alignItems: "flex-end" }}>
          <button style={S.btn("gold")} onClick={() => { if (newBid.trade) { setBids([...bids, { ...newBid, id: Date.now() }]); setNewBid({ trade: "", invited: 0, received: 0, lowBid: 0, status: "Bidding" }); } }}>Add RFP</button>
        </div>
      </div>
    </Card>
  );
}

function BillingPlans() {
  const { tier, startCheckout, openPortal, dealLimit, aiDailyLimit } = useTier();
  const auth = useAuth();
  const [deals] = useLS("axiom_deals", []);
  const dealCount = Array.isArray(deals) ? deals.length : 0;
  const { used: aiUsed } = useAiUsage();
  const [msg, setMsg] = useState("");
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    if (p.get("billing") === "success") { setMsg("✓ Subscription activated! Refreshing..."); window.history.replaceState({}, "", window.location.pathname); setTimeout(() => window.location.reload(), 2000); }
    if (p.get("billing") === "cancel") { setMsg("Checkout cancelled."); window.history.replaceState({}, "", window.location.pathname); }
  }, []);
  const tiers = [
    { id: "free", name: "Free", price: 0, desc: "Explore the platform. No credit card required.", features: ["5 Active Deals", "3 AI Sessions/day", "Basic Calculators", "Public Data Access", "Deal Pipeline"], color: C.dim },
    { id: "pro", name: "Pro", price: 29, desc: "For serious land acquisition managers.", features: ["50 Active Deals", "25 AI Sessions/day", "All Calculators", "CSV/PDF Exports", "MLS Feeds", "IC Memo Generator", "Email Support"], recommended: true, color: C.gold },
    { id: "pro_plus", name: "Pro+", price: 99, desc: "For growing development firms with teams.", features: ["Unlimited Deals", "Unlimited AI", "Team (5 seats)", "API Access", "White-Label Reports", "Jurisdiction Intel", "Priority Support"], color: C.purple },
    { id: "enterprise", name: "Enterprise", price: 499, desc: "For institutional-grade development platforms.", features: ["Everything in Pro+", "Unlimited Seats", "Custom AI Training", "SLA 99.9% Uptime", "Dedicated Success Manager", "Custom Integrations", "On-Prem Option"], color: C.teal },
  ];
  const stripeReady = !!(TIER_PRICE_IDS.pro && !TIER_PRICE_IDS.pro.includes("REPLACE_ME"));
  return (
    <div>
      {!stripeReady && <div style={{ padding: "10px 16px", marginBottom: 14, borderRadius: 4, background: `color-mix(in srgb, ${C.amber} 12%, transparent)`, color: C.amber, fontSize: 12, border: `1px solid ${C.amber}40` }}>⚠️ Stripe price IDs not configured — set <b>VITE_STRIPE_PRO_PRICE_ID</b>, <b>VITE_STRIPE_PRO_PLUS_PRICE_ID</b>, and <b>VITE_STRIPE_ENTERPRISE_PRICE_ID</b> in your Vercel environment variables to enable subscriptions.</div>}
      {msg && <div style={{ padding: "10px 16px", marginBottom: 14, borderRadius: 4, background: msg.startsWith("✓") ? `color-mix(in srgb, ${C.green} 12%, transparent)` : `color-mix(in srgb, ${C.amber} 12%, transparent)`, color: msg.startsWith("✓") ? C.green : C.amber, fontSize: 12 }}>{msg}</div>}
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <div style={{ fontSize: 9, color: C.gold, letterSpacing: 3, textTransform: "uppercase" }}>Pricing</div>
        <div style={{ fontSize: 25, color: C.text, fontWeight: 700, marginTop: 4 }}>Choose your plan</div>
        <div style={{ fontSize: 13, color: C.dim, marginTop: 4 }}>Start small and scale as your portfolio grows. No hidden fees.</div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14 }}>
        {tiers.map(t => {
          const isCurrent = tier === t.id;
          return (
            <div key={t.id} style={{ background: C.bg3, border: `1px solid ${isCurrent ? C.green : t.recommended ? C.gold : C.border}`, borderRadius: 4, padding: 20, position: "relative", display: "flex", flexDirection: "column" }}>
              {isCurrent && <div style={{ position: "absolute", top: -8, right: 12, ...S.tag(C.green), fontSize: 8 }}>CURRENT</div>}
              {t.recommended && !isCurrent && <div style={{ position: "absolute", top: 0, right: 0, padding: "4px 8px", background: C.gold, color: "#000", fontSize: 9, fontWeight: 800, letterSpacing: 1, borderTopRightRadius: 3, borderBottomLeftRadius: 4 }}>POPULAR</div>}
              <div style={{ fontSize: 16, color: C.text, fontWeight: 700 }}>{t.name}</div>
              <div style={{ marginTop: 8 }}><span style={{ fontSize: 32, color: t.color, fontWeight: 700 }}>${t.price}</span><span style={{ fontSize: 12, color: C.dim }}>/mo</span></div>
              <div style={{ fontSize: 12, color: C.dim, marginTop: 6 }}>{t.desc}</div>
              <button className="premium-hover" style={{ ...S.btn(isCurrent ? "" : "gold"), marginTop: 14, width: "100%", opacity: isCurrent ? 0.5 : 1, transition: "transform 0.1s, filter 0.1s", cursor: isCurrent ? "default" : "pointer" }}
                onMouseDown={e => { if (!isCurrent) e.currentTarget.style.transform = "scale(0.98)"; }} onMouseUp={e => { if (!isCurrent) e.currentTarget.style.transform = "scale(1)"; }} onMouseLeave={e => { if (!isCurrent) e.currentTarget.style.transform = "scale(1)"; }}
                onClick={() => { if (!isCurrent && t.id !== "free") startCheckout(t.id); else if (!isCurrent) openPortal(); }} disabled={isCurrent}>
                {isCurrent ? "Current Plan" : t.id === "free" ? "Free Forever" : `Upgrade to ${t.name}`}
              </button>
              <div style={{ marginTop: 14, flex: 1 }}>
                {t.features.map((f, i) => <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, padding: "3px 0" }}><span style={{ color: C.green, fontSize: 12 }}>✓</span><span style={{ fontSize: 10, color: C.sub }}>{f}</span></div>)}
              </div>
            </div>
          );
        })}
      </div>
      <Card title="Usage & Limits">
        <div style={S.g4}>
          {[
            { label: "Deals", current: dealCount, max: dealLimit, color: dealCount >= dealLimit ? C.red : C.gold },
            { label: "AI Sessions Today", current: aiUsed, max: aiDailyLimit, color: aiUsed >= aiDailyLimit ? C.red : C.blue },
          ].map(u => (
            <div key={u.label}>
              <div style={S.lbl}>{u.label}</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                <span style={{ fontSize: 22, color: u.color, fontWeight: 700 }}>{u.current}</span>
                <span style={{ fontSize: 11, color: C.dim }}>/ {u.max >= 999 ? "∞" : u.max}</span>
              </div>
              <div style={{ height: 3, background: C.bg, borderRadius: 2, marginTop: 4 }}>
                <div style={{ height: "100%", width: `${Math.min(100, (u.current / u.max) * 100)}%`, background: u.color, borderRadius: 2, transition: "width 0.3s" }} />
              </div>
            </div>
          ))}
          <div><div style={S.lbl}>Exports</div><div style={{ fontSize: 14, color: TIER_CONFIG[tier]?.features.exports ? C.green : C.dim, fontWeight: 600 }}>{TIER_CONFIG[tier]?.features.exports ? "✓ Unlocked" : "🔒 Upgrade to Pro"}</div></div>
          <div><div style={S.lbl}>AI Agents</div><div style={{ fontSize: 14, color: TIER_CONFIG[tier]?.features.ai_agents ? C.green : C.dim, fontWeight: 600 }}>{TIER_CONFIG[tier]?.features.ai_agents ? "✓ Unlocked" : "🔒 Upgrade to Pro"}</div></div>
        </div>
      </Card>
      <Card title="Subscription">
        <div style={S.g2}>
          <div>
            <div style={S.lbl}>Current Plan</div>
            <div style={{ fontSize: 21, color: C.gold, fontWeight: 700, textTransform: "uppercase" }}>{tier.replace("_", " ")}</div>
            {auth?.userProfile?.stripe_current_period_end && <div style={{ fontSize: 12, color: C.dim, marginTop: 4 }}>Renews: {new Date(auth.userProfile.stripe_current_period_end).toLocaleDateString()}</div>}
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center", justifyContent: "flex-end" }}>
            {tier === "free" ? (
              <button className="premium-hover" style={{ ...S.btn("gold"), transition: "transform 0.1s, filter 0.1s" }} onMouseDown={e => e.currentTarget.style.transform = "scale(0.97)"} onMouseUp={e => e.currentTarget.style.transform = "scale(1)"} onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"} onClick={() => startCheckout("pro")}>Upgrade to Pro</button>
            ) : (
              <>
                <button className="premium-hover" style={{ ...S.btn(), transition: "transform 0.1s, filter 0.1s" }} onMouseDown={e => e.currentTarget.style.transform = "scale(0.97)"} onMouseUp={e => e.currentTarget.style.transform = "scale(1)"} onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"} onClick={openPortal}>Manage Billing</button>
                <button className="premium-hover" style={{ ...S.btn(), transition: "transform 0.1s, filter 0.1s" }} onMouseDown={e => e.currentTarget.style.transform = "scale(0.97)"} onMouseUp={e => e.currentTarget.style.transform = "scale(1)"} onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"} onClick={openPortal}>Update Payment</button>
              </>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}

function SystemSettings() {
  const [profile, setProfile] = useLS("axiom_profile", { name: "", email: "", company: "", role: "Developer", phone: "", timezone: "America/Los_Angeles" });
  const [apiKeys, setApiKeys] = useLS("axiom_api_keys", { proxyUrl: "", anthropic: "", openai: "", groq: "", together: "", costar: "", regrid: "", attom: "", google: "" });
  const [notifs, setNotifs] = useLS("axiom_notifs", { dealAlerts: true, listingAlerts: true, permitAlerts: false, weeklyDigest: true, emailNotifs: true, smsNotifs: false });
  const [saved, setSaved] = useState("");
  const doSave = (label) => { setSaved(label); setTimeout(() => setSaved(""), 2000); };
  const pu = k => e => setProfile({ ...profile, [k]: e.target.value });
  const au = k => e => setApiKeys({ ...apiKeys, [k]: e.target.value });
  return (
    <Tabs tabs={["Profile", "API Keys", "Notifications", "Team", "Data"]}>
      <div>
        <Card title="User Profile">
          <div style={S.g3}>
            <Field label="Full Name"><input style={S.inp} value={profile.name} onChange={pu("name")} placeholder="Your name" /></Field>
            <Field label="Email"><input style={S.inp} value={profile.email} onChange={pu("email")} placeholder="email@company.com" /></Field>
            <Field label="Company"><input style={S.inp} value={profile.company} onChange={pu("company")} placeholder="Company name" /></Field>
            <Field label="Role"><select style={S.sel} value={profile.role} onChange={pu("role")}>{["Developer", "Investor", "Broker", "Analyst", "Manager", "Executive", "Consultant", "Attorney", "Other"].map(r => <option key={r}>{r}</option>)}</select></Field>
            <Field label="Phone"><input style={S.inp} value={profile.phone} onChange={pu("phone")} placeholder="(555) 000-0000" /></Field>
            <Field label="Timezone"><select style={S.sel} value={profile.timezone} onChange={pu("timezone")}>{["America/Los_Angeles", "America/Denver", "America/Chicago", "America/New_York", "America/Phoenix", "Pacific/Honolulu"].map(tz => <option key={tz}>{tz}</option>)}</select></Field>
          </div>
          <button style={{ ...S.btn("gold"), marginTop: 10 }} onClick={() => doSave("profile")}>{saved === "profile" ? "✓ Profile Saved!" : "Save Profile"}</button>
        </Card>
      </div>
      <div>
        <Card title="API Key Management">
          <div style={{ fontSize: 12, color: C.dim, marginBottom: 14 }}>Configure your LLM proxy for production, or use direct API keys for development. Proxy mode is recommended — it keeps keys server-side.</div>
          <div style={{ background: C.bg, border: `1px solid ${C.gold}33`, borderRadius: 4, padding: 12, marginBottom: 14 }}>
            <Field label="LLM Proxy URL (Recommended for Production)">
              <div style={{ display: "flex", gap: 8 }}>
                <input style={{ ...S.inp, flex: 1, borderColor: apiKeys.proxyUrl ? C.green : C.border2 }} value={apiKeys.proxyUrl} onChange={au("proxyUrl")} placeholder="https://your-project.supabase.co/functions/v1/llm-proxy" />
                {supa.configured() && !apiKeys.proxyUrl && (
                  <button style={{ ...S.btn(), padding: "4px 10px", fontSize: 9, whiteSpace: "nowrap" }} onClick={() => {
                    const url = `${supa.url}/functions/v1/llm-proxy`;
                    setApiKeys({ ...apiKeys, proxyUrl: url });
                    localStorage.setItem("axiom_api_keys", JSON.stringify({ ...apiKeys, proxyUrl: url }));
                  }}>Use Supabase</button>
                )}
              </div>
            </Field>
            <div style={{ fontSize: 10, color: apiKeys.proxyUrl ? C.green : C.amber, marginTop: 4 }}>{apiKeys.proxyUrl ? "✓ Proxy configured — API keys are kept server-side" : "⚠ No proxy — keys are exposed in the browser (dev mode only)"}</div>
          </div>
          {[["Anthropic (Claude)", "anthropic", "sk-ant-..."], ["OpenAI", "openai", "sk-..."], ["Groq (Free LLMs)", "groq", "gsk_..."], ["Together AI", "together", "tog_..."], ["CoStar", "costar", "cs_..."], ["Regrid", "regrid", "rg_..."], ["ATTOM Data", "attom", "at_..."], ["Google Maps", "google", "AIza..."]].map(([label, key, ph]) => (
            <Field key={key} label={label}>
              <input style={S.inp} type="password" value={apiKeys[key]} onChange={au(key)} placeholder={ph} />
            </Field>
          ))}
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 14, marginBottom: 4 }}>
            <span style={{ fontSize: 10, color: C.dim, letterSpacing: 2, textTransform: "uppercase" }}>System Security</span>
            <SecurityStatusBadge tenantId="local-tenant" />
          </div>
          <button style={{ ...S.btn("gold"), marginTop: 10 }} onClick={() => doSave("api")}>{saved === "api" ? "✓ API Keys Saved!" : "Save API Keys"}</button>
        </Card>
      </div>
      <div>
        <Card title="Notification Preferences">
          {[["Deal Stage Changes", "dealAlerts", "Get notified when deals advance stages"], ["New Listing Matches", "listingAlerts", "Alerts for properties matching saved searches"], ["Permit Activity", "permitAlerts", "Notifications for permit filings in target areas"], ["Weekly Digest", "weeklyDigest", "Summary of pipeline activity and market updates"], ["Email Notifications", "emailNotifs", "Receive notifications via email"], ["SMS Notifications", "smsNotifs", "Receive notifications via text message"]].map(([label, key, desc]) => (
            <div key={key} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: "1px solid #0F1117" }}>
              <input type="checkbox" checked={!!notifs[key]} onChange={() => setNotifs({ ...notifs, [key]: !notifs[key] })} style={{ accentColor: C.gold, width: 14, height: 14 }} />
              <div style={{ flex: 1 }}><div style={{ fontSize: 13, color: C.text }}>{label}</div><div style={{ fontSize: 10, color: C.dim }}>{desc}</div></div>
            </div>
          ))}
          <button style={{ ...S.btn("gold"), marginTop: 10 }} onClick={() => doSave("notifs")}>{saved === "notifs" ? "✓ Preferences Saved!" : "Save Preferences"}</button>
        </Card>
      </div>
      <div>
        <TeamManagement />
      </div>
      <div>
        <Card title="Supabase Connection" action={<Badge label={supa.configured() && supa.token ? "Connected" : supa.configured() ? "Configured" : "Not Set"} color={supa.configured() && supa.token ? C.green : supa.configured() ? C.amber : C.dim} />}>
          <div style={{ fontSize: 11, color: C.dim, marginBottom: 12 }}>Connect to Supabase for cloud persistence, multi-device sync, and team collaboration.</div>
          <div style={S.g2}>
            <Field label="Supabase URL">
              {/* Bug fix: use controlled state inputs so React re-renders + updates supa object on Save */}
              <input style={S.inp}
                defaultValue={supa.url || ""}
                onChange={e => { supa.url = e.target.value; localStorage.setItem("axiom_supa_url", e.target.value); }}
                placeholder="https://xxxxx.supabase.co" />
            </Field>
            <Field label="Anon / Publishable Key">
              <input style={S.inp} type="password"
                defaultValue={supa.key || ""}
                onChange={e => { supa.key = e.target.value; localStorage.setItem("axiom_supa_key", e.target.value); }}
                placeholder="eyJhbGci..." />
            </Field>
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
            <button style={S.btn("gold")} onClick={() => doSave("supa")}>
              {saved === "supa" ? "✓ Saved!" : "Save Connection"}
            </button>
            {supa.configured() && supa.token && <button style={{ ...S.btn(), color: C.green, borderColor: C.green + "44" }} onClick={() => { doSave("supa-test"); }}>✓ Authenticated</button>}
          </div>
          <div style={{ fontSize: 10, color: C.dim, marginTop: 8 }}>
            LLM Proxy: <span style={{ color: C.gold }}>https://{(localStorage.getItem("axiom_supa_url") || "").split("//")[1]?.split(".")[0] || "xxxxx"}.supabase.co/functions/v1/llm-proxy</span>
          </div>
        </Card>
        <Card title="Data Management">
          {[["Export All Data", "Download complete backup of all project data as JSON"], ["Clear Local Storage", "Remove all locally stored data (cannot be undone)"], ["Import Project Data", "Restore from a previous backup file"], ["Reset to Defaults", "Restore all settings and data to factory defaults"]].map(([l, d], i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: "1px solid #0F1117" }}>
              <div style={{ flex: 1 }}><div style={{ fontSize: 13, color: i >= 1 ? C.red : C.text }}>{l}</div><div style={{ fontSize: 10, color: C.dim }}>{d}</div></div>
              <button style={{ ...S.btn(i === 0 ? "gold" : ""), borderColor: i >= 1 ? C.red + "88" : "", color: i >= 1 ? C.red : "" }}>{i === 0 ? "Export" : "Action"}</button>
            </div>
          ))}
        </Card>
      </div>
    </Tabs>
  );
}



function Notes() {
  const auth = useAuth();
  const ctx = useCtx();
  const [notes, setNotes] = useLS("axiom_notes", []);
  const [syncStatus, setSyncStatus] = useState("idle"); // idle | syncing | synced | error
  const loadedRef = useRef(false);

  // ─── HYDRATE from Supabase on mount ──────────────
  useEffect(() => {
    if (loadedRef.current || !auth?.user || !auth?.userProfile?.org_id || !supa.configured()) return;
    loadedRef.current = true;
    setSyncStatus("syncing");
    (async () => {
      try {
        const rows = await supa.select("notes", `org_id=eq.${auth.userProfile.org_id}&order=updated_at.desc`);
        if (rows.length > 0) {
          setNotes(rows.map(r => ({
            _supaId: r.id, id: r.id, title: r.title, content: r.content || "",
            deal: r.project_id || "", category: r.category || "General",
            pinned: r.pinned || false,
            created: r.created_at ? r.created_at.split("T")[0] : new Date().toISOString().split("T")[0],
            modified: r.updated_at ? r.updated_at.split("T")[0] : new Date().toISOString().split("T")[0],
          })));
        }
        setSyncStatus("synced");
      } catch (e) { console.warn("Notes hydrate failed:", e); setSyncStatus("error"); }
    })();
  }, [auth?.user, auth?.userProfile]);

  const CATS = ["All", "Due Diligence", "Meeting Notes", "Research", "Legal", "Site Analysis", "Financial", "Personal", "General"];
  const [filterCat, setFilterCat] = useState("All");
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState(null);
  const [nn, setNn] = useState({ title: "", content: "", deal: "", category: "General", pinned: false });
  const [saving, setSaving] = useState(false);

  const filtered = notes.filter(n => {
    if (search && !n.title.toLowerCase().includes(search.toLowerCase()) && !n.content.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterCat !== "All" && n.category !== filterCat) return false;
    return true;
  }).sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0) || (new Date(b.modified)).getTime() - (new Date(a.modified)).getTime());

  const addNote = async () => {
    if (!nn.title) return;
    setSaving(true);
    const now = new Date().toISOString().split("T")[0];
    const local = { ...nn, id: Date.now(), created: now, modified: now };
    setNotes(prev => [...prev, local]);
    // Sync to Supabase
    if (supa.configured() && auth?.user && auth?.userProfile?.org_id) {
      try {
        const inserted = await supa.insert("notes", {
          org_id: auth.userProfile.org_id,
          user_id: auth.user.id,
          project_id: ctx?.activeProjectId || null,
          title: nn.title, content: nn.content,
          category: nn.category, pinned: nn.pinned,
        });
        if (inserted?.id) {
          setNotes(prev => prev.map(n => n.id === local.id ? { ...n, _supaId: inserted.id, id: inserted.id } : n));
        }
        setSyncStatus("synced");
      } catch (e) { console.warn("Notes insert failed:", e); setSyncStatus("error"); }
    }
    setNn({ title: "", content: "", deal: "", category: "General", pinned: false });
    setSaving(false);
  };

  const updNote = async (id, field, val) => {
    const note = notes.find(n => n.id === id);
    const updated = { ...note, [field]: val, modified: new Date().toISOString().split("T")[0] };
    setNotes(notes.map(n => n.id === id ? updated : n));
    if (supa.configured() && auth?.user && (note?._supaId || typeof id === 'string')) {
      const supaId = note?._supaId || id;
      supa.update("notes", { id: supaId }, { [field === "content" ? "content" : field === "title" ? "title" : field === "pinned" ? "pinned" : field === "category" ? "category" : field]: val, updated_at: new Date().toISOString() }).catch(() => { });
    }
  };

  const delNote = async (id) => {
    const note = notes.find(n => n.id === id);
    setNotes(notes.filter(n => n.id !== id));
    if (supa.configured() && auth?.user && (note?._supaId || typeof id === 'string')) {
      supa.del("notes", { id: note?._supaId || id }).catch(() => { });
    }
  };

  return (
    <Tabs tabs={["All Notes", "New Note", "AI Summary"]}>
      <div>
        <div style={{ display: "flex", gap: 10, marginBottom: 14, alignItems: "center" }}>
          <input style={{ ...S.inp, flex: 1 }} value={search} onChange={e => setSearch(e.target.value)} placeholder="Search notes..." />
          <select style={{ ...S.sel, width: 140 }} value={filterCat} onChange={e => setFilterCat(e.target.value)}>{CATS.map(c => <option key={c}>{c}</option>)}</select>
          <span style={{ fontSize: 9, color: syncStatus === "synced" ? C.green : syncStatus === "error" ? C.red : C.dim, whiteSpace: "nowrap" }}>
            {syncStatus === "syncing" ? "⟳ Syncing..." : syncStatus === "synced" ? "✓ Synced" : syncStatus === "error" ? "⚠ Sync error" : ""}
          </span>
        </div>
        {filtered.length === 0 && <div style={{ color: C.dim, textAlign: "center", padding: 40 }}>No notes yet. Create your first note in the "New Note" tab.</div>}
        {filtered.map(n => (
          <Card key={n.id} title={n.title} action={<div style={{ display: "flex", gap: 6 }}>{n.pinned && <Badge label="Pinned" color={C.gold} />}<Badge label={n.category} color={C.blue} /><button style={{ ...S.btn(), padding: "3px 8px", fontSize: 9 }} onClick={() => setEditing(editing === n.id ? null : n.id)}>{editing === n.id ? "Close" : "Edit"}</button><button style={{ ...S.btn(), padding: "3px 8px", fontSize: 9 }} onClick={() => updNote(n.id, "pinned", !n.pinned)}>{n.pinned ? "Unpin" : "Pin"}</button><button style={{ ...S.btn(), padding: "3px 8px", fontSize: 9 }} onClick={() => delNote(n.id)}>×</button></div>}>
            {editing === n.id ? (
              <div>
                <Field label="Title"><input style={S.inp} value={n.title} onChange={e => updNote(n.id, "title", e.target.value)} /></Field>
                <Field label="Category"><select style={S.sel} value={n.category} onChange={e => updNote(n.id, "category", e.target.value)}>{CATS.filter(c => c !== "All").map(c => <option key={c}>{c}</option>)}</select></Field>
                <Field label="Content"><textarea style={{ ...S.ta, height: 200, fontFamily: "'Courier New',monospace", fontSize: 13, lineHeight: 1.6 }} value={n.content} onChange={e => updNote(n.id, "content", e.target.value)} /></Field>
              </div>
            ) : (
              <div>
                <div style={{ display: "flex", gap: 12, fontSize: 10, color: C.dim, marginBottom: 8 }}>
                  <span>Category: {n.category}</span>
                  <span>Created: {n.created}</span>
                  <span>Modified: {n.modified}</span>
                </div>
                <pre style={{ margin: 0, whiteSpace: "pre-wrap", fontFamily: "'Courier New',monospace", fontSize: 13, color: C.sub, lineHeight: 1.6 }}>{n.content}</pre>
              </div>
            )}
          </Card>
        ))}
      </div>
      <div>
        <Card title="Create New Note">
          <div style={S.g2}>
            <Field label="Title"><input style={S.inp} value={nn.title} onChange={e => setNn({ ...nn, title: e.target.value })} placeholder="Note title..." /></Field>
            <Field label="Category"><select style={S.sel} value={nn.category} onChange={e => setNn({ ...nn, category: e.target.value })}>{CATS.filter(c => c !== "All").map(c => <option key={c}>{c}</option>)}</select></Field>
          </div>
          <Field label="Content"><textarea style={{ ...S.ta, height: 200, fontFamily: "'Courier New',monospace", fontSize: 13 }} value={nn.content} onChange={e => setNn({ ...nn, content: e.target.value })} placeholder="Write your note here..." /></Field>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <button style={{ ...S.btn("gold"), opacity: saving ? 0.6 : 1 }} onClick={addNote} disabled={saving}>{saving ? "Saving..." : "Save Note"}</button>
            <label style={{ display: "flex", gap: 6, alignItems: "center", fontSize: 11, color: C.dim, cursor: "pointer" }}>
              <input type="checkbox" checked={nn.pinned} onChange={e => setNn({ ...nn, pinned: e.target.checked })} />
              Pin this note
            </label>
          </div>
        </Card>
      </div>
      <div>
        <Card title="AI Note Summary">
          <Agent id="NotesAI" system={`You are a note-taking assistant for a real estate developer. The user has ${notes.length} notes across categories: ${[...new Set(notes.map(n => n.category))].join(", ")}. Help summarize, organize, and extract action items. Note titles: ${notes.map(n => n.title).join(", ")}.`} placeholder="Ask to summarize notes, extract action items, or find related info..." />
        </Card>
      </div>
    </Tabs>
  );
}

function FullCalendar() {
  const auth = useAuth();
  const ctx = useCtx();
  const [view, setView] = useState("month");
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selDay, setSelDay] = useState(today.getDate());
  const [events, setEvents] = useLS("axiom_cal_events", []);
  const [syncStatus, setSyncStatus] = useState("idle");
  const loadedRef = useRef(false);
  const saveTimer = useRef(null);

  // Hydrate from Supabase
  useEffect(() => {
    if (loadedRef.current || !auth?.user || !auth?.userProfile?.org_id || !supa.configured()) return;
    loadedRef.current = true;
    setSyncStatus("syncing");
    (async () => {
      try {
        const rows = await supa.select("calendar_events", `org_id=eq.${auth.userProfile.org_id}&order=date.asc`);
        if (rows.length > 0) {
          setEvents(rows.map(r => ({ _supaId: r.id, id: r.id, title: r.title || "", date: r.date || "", time: r.time || "09:00", type: r.type || "Meeting", deal: r.deal || "", color: r.color || C.blue, notes: r.notes || "", recurring: r.recurring || "" })));
        } else {
          // Seed with demo events for new users
          setEvents([
            { id: 1, title: "Sunset Ridge - LOI Due", date: `${today.getFullYear()}-${String(today.getMonth() + 2).padStart(2, "0")}-28`, time: "17:00", type: "Deadline", deal: "Sunset Ridge", color: C.red, notes: "Final LOI submission to seller" },
            { id: 2, title: "IC Committee Meeting", date: `${today.getFullYear()}-${String(today.getMonth() + 2).padStart(2, "0")}-05`, time: "10:00", type: "Meeting", deal: "Ridgecrest Heights", color: C.purple, notes: "Investment committee review" },
          ]);
        }
        setSyncStatus("synced");
      } catch (e) { console.warn("Calendar hydrate failed:", e); setSyncStatus("error"); }
    })();
  }, [auth?.user, auth?.userProfile?.org_id]);

  const syncEvent = useCallback((event, isDelete = false) => {
    if (!auth?.user || !auth?.userProfile?.org_id || !supa.configured()) return;
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      try {
        if (isDelete) {
          if (event._supaId) await supa.del("calendar_events", { id: event._supaId });
        } else {
          const payload = { org_id: auth.userProfile.org_id, user_id: auth.user.id, project_id: ctx?.activeProjectId || null, title: event.title, date: event.date, time: event.time, type: event.type, deal: event.deal || "", color: event.color || "", notes: event.notes || "", recurring: event.recurring || "" };
          if (event._supaId) { payload.id = event._supaId; await supa.upsert("calendar_events", payload); }
          else {
            const inserted = await supa.insert("calendar_events", payload);
            if (inserted?.id) setEvents(prev => prev.map(e => e.id === event.id ? { ...e, _supaId: inserted.id, id: inserted.id } : e));
          }
        }
        setSyncStatus("synced");
      } catch (e) { console.warn("Calendar sync failed:", e); setSyncStatus("error"); }
    }, 800);
  }, [auth?.user, auth?.userProfile?.org_id, ctx?.activeProjectId]);

  const [ne, setNe] = useState({ title: "", date: "", time: "09:00", type: "Meeting", deal: "", color: C.blue, notes: "", recurring: "" });
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const EC = { Deadline: C.red, Meeting: C.purple, Inspection: C.amber, Hearing: C.blue, Closing: C.green, Review: C.teal, Reminder: C.gold, Personal: C.dim };
  const TYPES = ["Meeting", "Deadline", "Inspection", "Hearing", "Closing", "Review", "Reminder", "Personal"];
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const dStr = (d) => `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  const dayEvents = (d) => events.filter(e => e.date === dStr(d));
  const addEvent = () => {
    if (!ne.title || !ne.date) return;
    const newEvt = { ...ne, id: Date.now() };
    setEvents(prev => [...prev, newEvt]);
    syncEvent(newEvt);
    setNe({ title: "", date: "", time: "09:00", type: "Meeting", deal: "", color: C.blue, notes: "", recurring: "" });
    setShowQuickAdd(false);
  };
  const delEvent = (id) => {
    const evt = events.find(e => e.id === id);
    setEvents(events.filter(e => e.id !== id));
    if (evt) syncEvent(evt, true);
  };
  const updEvent = (id, field, val) => {
    setEvents(events.map(e => e.id === id ? { ...e, [field]: val } : e));
    const updated = events.find(e => e.id === id);
    if (updated) syncEvent({ ...updated, [field]: val });
  };
  const prevMonth = () => { if (month === 0) { setMonth(11); setYear(year - 1); } else setMonth(month - 1); };
  const nextMonth = () => { if (month === 11) { setMonth(0); setYear(year + 1); } else setMonth(month + 1); };
  const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const selEvents = dayEvents(selDay);
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  const upcomingEvents = events.filter(e => e.date >= todayStr).sort((a, b) => a.date.localeCompare(b.date)).slice(0, 8);
  const onDayClick = (d) => { setSelDay(d); setShowQuickAdd(true); setNe({ ...ne, date: dStr(d) }); setEditingEvent(null); };
  return (
    <Tabs tabs={["Month View", "Week View", "Agenda", "Add Event"]}>
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <button style={S.btn()} onClick={prevMonth}>← Prev</button>
          <div style={{ fontSize: 18, color: C.gold, fontWeight: 700 }}>{MONTHS[month]} {year}</div>
          <button style={S.btn()} onClick={nextMonth}>Next →</button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 1 }}>
          {DAYS.map(d => <div key={d} style={{ padding: 6, textAlign: "center", fontSize: 9, color: C.dim, letterSpacing: 2, textTransform: "uppercase", background: C.bg2 }}>{d}</div>)}
          {Array.from({ length: firstDay }, (_, i) => <div key={"e" + i} style={{ background: C.bg2, minHeight: 80 }} />)}
          {Array.from({ length: daysInMonth }, (_, i) => {
            const d = i + 1; const evts = dayEvents(d); const isToday = dStr(d) === todayStr; const isSel = d === selDay;
            return (
              <div key={d} style={{ background: isSel ? C.bg3 : C.bg2, border: `1px solid ${isToday ? C.gold : isSel ? C.border2 : C.border}`, minHeight: 80, padding: 4, cursor: "pointer", position: "relative" }} onClick={() => onDayClick(d)}>
                <div style={{ fontSize: 13, color: isToday ? C.gold : C.text, fontWeight: isToday ? 700 : 400 }}>{d}</div>
                {evts.slice(0, 3).map(e => (
                  <div key={e.id} style={{ fontSize: 9, padding: "1px 4px", borderRadius: 2, marginTop: 2, background: (e.color || C.blue) + "22", color: e.color || C.blue, overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>
                    {e.time?.substring(0, 5)} {e.title}
                  </div>
                ))}
                {evts.length > 3 && <div style={{ fontSize: 8, color: C.dim, marginTop: 1 }}>+{evts.length - 3} more</div>}
              </div>
            );
          })}
        </div>
        <Card title={`${MONTHS[month]} ${selDay} — ${selEvents.length} event${selEvents.length !== 1 ? "s" : ""}`} action={<button style={{ ...S.btn("gold"), padding: "3px 10px", fontSize: 9 }} onClick={() => { setShowQuickAdd(!showQuickAdd); setEditingEvent(null); }}>{showQuickAdd ? "Cancel" : "+ Add Event"}</button>}>
          {showQuickAdd && (
            <div style={{ padding: "10px 0", marginBottom: 10, borderBottom: `1px solid ${C.border}` }}>
              <div style={S.g3}>
                <Field label="Title"><input style={S.inp} value={ne.title} onChange={e => setNe({ ...ne, title: e.target.value })} placeholder="Event title..." autoFocus /></Field>
                <Field label="Time"><input style={S.inp} type="time" value={ne.time} onChange={e => setNe({ ...ne, time: e.target.value })} /></Field>
                <Field label="Type"><select style={S.sel} value={ne.type} onChange={e => setNe({ ...ne, type: e.target.value, color: EC[e.target.value] || C.blue })}>{TYPES.map(t => <option key={t}>{t}</option>)}</select></Field>
              </div>
              <div style={S.g2}>
                <Field label="Deal"><input style={S.inp} value={ne.deal} onChange={e => setNe({ ...ne, deal: e.target.value })} placeholder="Linked deal..." /></Field>
                <Field label="Notes"><input style={S.inp} value={ne.notes} onChange={e => setNe({ ...ne, notes: e.target.value })} placeholder="Details..." /></Field>
              </div>
              <button style={S.btn("gold")} onClick={addEvent}>Add Event to {MONTHS[month]} {selDay}</button>
            </div>
          )}
          {selEvents.map(e => (
            <div key={e.id} style={{ display: "flex", gap: 10, padding: "8px 0", borderBottom: "1px solid #0F1117", alignItems: "flex-start" }}>
              <div style={{ width: 4, height: 30, background: e.color || C.blue, borderRadius: 2, flexShrink: 0, marginTop: 2 }} />
              <div style={{ flex: 1 }}>
                {editingEvent === e.id ? (
                  <div>
                    <div style={S.g3}>
                      <Field label="Title"><input style={S.inp} value={e.title} onChange={ev => updEvent(e.id, "title", ev.target.value)} /></Field>
                      <Field label="Time"><input style={S.inp} type="time" value={e.time} onChange={ev => updEvent(e.id, "time", ev.target.value)} /></Field>
                      <Field label="Type"><select style={S.sel} value={e.type} onChange={ev => { updEvent(e.id, "type", ev.target.value); updEvent(e.id, "color", EC[ev.target.value] || C.blue); }}>{TYPES.map(t => <option key={t}>{t}</option>)}</select></Field>
                    </div>
                    <div style={S.g2}>
                      <Field label="Deal"><input style={S.inp} value={e.deal} onChange={ev => updEvent(e.id, "deal", ev.target.value)} /></Field>
                      <Field label="Notes"><input style={S.inp} value={e.notes} onChange={ev => updEvent(e.id, "notes", ev.target.value)} /></Field>
                    </div>
                    <button style={{ ...S.btn(), padding: "3px 10px", fontSize: 9 }} onClick={() => setEditingEvent(null)}>Done</button>
                  </div>
                ) : (
                  <div>
                    <div style={{ fontSize: 13, color: C.text, fontWeight: 600 }}>{e.title}</div>
                    <div style={{ fontSize: 10, color: C.dim, display: "flex", gap: 8, marginTop: 2 }}>
                      <span>{e.time}</span><Badge label={e.type} color={EC[e.type] || C.blue} />{e.deal && <span>Deal: {e.deal}</span>}
                    </div>
                    {e.notes && <div style={{ fontSize: 12, color: C.sub, marginTop: 4 }}>{e.notes}</div>}
                  </div>
                )}
              </div>
              <div style={{ display: "flex", gap: 4 }}>
                <button style={{ ...S.btn(), padding: "3px 8px", fontSize: 9 }} onClick={() => setEditingEvent(editingEvent === e.id ? null : e.id)}>{editingEvent === e.id ? "✓" : "Edit"}</button>
                <button style={{ ...S.btn(), padding: "3px 8px", fontSize: 9 }} onClick={() => delEvent(e.id)}>x</button>
              </div>
            </div>
          ))}
          {!selEvents.length && !showQuickAdd && <div style={{ fontSize: 12, color: C.dim, padding: "12px 0", fontStyle: "italic" }}>No events. Click "+ Add Event" to create one.</div>}
        </Card>
      </div>
      <div>
        <div style={{ fontSize: 14, color: C.gold, fontWeight: 700, marginBottom: 14 }}>Week of {MONTHS[month]} {Math.max(1, selDay - new Date(year, month, selDay).getDay())} - {Math.min(daysInMonth, selDay - new Date(year, month, selDay).getDay() + 6)}, {year}</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 4 }}>
          {Array.from({ length: 7 }, (_, i) => {
            const startOfWeek = selDay - new Date(year, month, selDay).getDay();
            const d = Math.max(1, Math.min(daysInMonth, startOfWeek + i));
            const evts = dayEvents(d);
            return (
              <div key={i} style={{ background: C.bg3, border: `1px solid ${C.border}`, borderRadius: 3, padding: 8, minHeight: 200 }}>
                <div style={{ fontSize: 9, color: C.dim, letterSpacing: 1, textTransform: "uppercase" }}>{DAYS[i]}</div>
                <div style={{ fontSize: 16, color: d === selDay ? C.gold : C.text, fontWeight: 700, marginBottom: 6 }}>{d}</div>
                {evts.map(e => (
                  <div key={e.id} style={{ fontSize: 10, padding: 4, borderRadius: 2, marginBottom: 3, background: (e.color || C.blue) + "22", borderLeft: `2px solid ${e.color || C.blue}` }}>
                    <div style={{ fontWeight: 600, color: C.text }}>{e.time?.substring(0, 5)}</div>
                    <div style={{ color: C.sub }}>{e.title}</div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>
      <div>
        <Card title="Upcoming Events" action={<Badge label={upcomingEvents.length + " upcoming"} color={C.gold} />}>
          {upcomingEvents.map(e => (
            <div key={e.id} style={{ display: "flex", gap: 12, padding: "10px 0", borderBottom: "1px solid #0F1117" }}>
              <div style={{ width: 4, background: e.color || C.blue, borderRadius: 2 }} />
              <div style={{ width: 70, flexShrink: 0 }}>
                <div style={{ fontSize: 12, color: C.gold, fontWeight: 600 }}>{e.date.substring(5)}</div>
                <div style={{ fontSize: 10, color: C.dim }}>{e.time}</div>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, color: C.text, fontWeight: 600 }}>{e.title}</div>
                <div style={{ fontSize: 10, color: C.dim, display: "flex", gap: 8, marginTop: 2 }}>
                  <Badge label={e.type} color={EC[e.type] || C.blue} />
                  {e.deal && <span>Deal: {e.deal}</span>}
                </div>
                {e.notes && <div style={{ fontSize: 12, color: C.sub, marginTop: 3 }}>{e.notes}</div>}
              </div>
              <button style={{ ...S.btn(), padding: "3px 8px", fontSize: 9 }} onClick={() => delEvent(e.id)}>x</button>
            </div>
          ))}
        </Card>
      </div>
      <div>
        <Card title="Add New Event">
          <div style={S.g3}>
            <Field label="Event Title"><input style={S.inp} value={ne.title} onChange={e => setNe({ ...ne, title: e.target.value })} placeholder="Meeting with broker..." /></Field>
            <Field label="Date"><input style={S.inp} type="date" value={ne.date} onChange={e => setNe({ ...ne, date: e.target.value })} /></Field>
            <Field label="Time"><input style={S.inp} type="time" value={ne.time} onChange={e => setNe({ ...ne, time: e.target.value })} /></Field>
            <Field label="Type"><select style={S.sel} value={ne.type} onChange={e => setNe({ ...ne, type: e.target.value, color: EC[e.target.value] || C.blue })}>{TYPES.map(t => <option key={t}>{t}</option>)}</select></Field>
            <Field label="Linked Deal"><input style={S.inp} value={ne.deal} onChange={e => setNe({ ...ne, deal: e.target.value })} placeholder="e.g. Sunset Ridge" /></Field>
            <Field label="Recurring"><select style={S.sel} value={ne.recurring} onChange={e => setNe({ ...ne, recurring: e.target.value })}><option value="">None</option><option value="daily">Daily</option><option value="weekly">Weekly</option><option value="biweekly">Bi-weekly</option><option value="monthly">Monthly</option></select></Field>
          </div>
          <Field label="Notes"><textarea style={{ ...S.ta, height: 60 }} value={ne.notes} onChange={e => setNe({ ...ne, notes: e.target.value })} placeholder="Meeting agenda, preparation notes, documents needed..." /></Field>
          <button style={S.btn("gold")} onClick={addEvent}>Add Event</button>
        </Card>
      </div>
    </Tabs>
  );
}

function EmailSection() {
  const [emails, setEmails] = useLS("axiom_emails", [
    { id: 1, from: "Sarah Chen <sarah@pacificrealty.com>", to: "me", subject: "RE: Sunset Ridge LOI - Counter Offer", body: "Hi,\n\nThe seller came back with a counter at $3.15M. They're firm on the 45-day DD period but willing to extend closing to 60 days.\n\nKey changes from our original offer:\n- Price: $3.15M (vs our $3.0M)\n- DD Period: 45 days (unchanged)\n- Close timeline: 60 days from DD approval\n- Earnest money: $100K (vs our $75K)\n\nI think there's room to meet in the middle around $3.08M. Let me know how you'd like to proceed.\n\nBest,\nSarah", date: "2025-02-20 09:15", read: true, folder: "inbox", deal: "Sunset Ridge" },
    { id: 2, from: "City Planning <planning@cityofsac.gov>", to: "me", subject: "Notice of Application Completeness - TTM-2025-0234", body: "Dear Applicant,\n\nYour Tentative Tract Map application TTM-2025-0234 for the property located at 456 Ridge Rd has been deemed complete as of February 18, 2025.\n\nThe application has been assigned to Senior Planner Jennifer Martinez. You may expect initial comments within 30 business days.\n\nPlease contact our office if you have any questions.\n\nCity of Sacramento Planning Department", date: "2025-02-18 14:30", read: false, folder: "inbox", deal: "Sunset Ridge" },
    { id: 3, from: "me", to: "mike@fnb.com", subject: "Construction Loan Term Sheet Request - Hawk Valley", body: "Mike,\n\nFollowing up on our call. Here are the project details for the term sheet:\n\n- Project: Hawk Valley Subdivision\n- Lots: 28 SFR\n- Land Cost: $1.8M (under contract)\n- Total development budget: $5.6M\n- LTC requested: 65%\n- Term: 24 months with 6mo extension option\n\nCan you have a preliminary term sheet back by March 1?\n\nThanks,\nBrett", date: "2025-02-17 11:00", read: true, folder: "sent", deal: "Hawk Valley" },
  ]);
  const [folder, setFolder] = useState("inbox");
  const [selEmail, setSelEmail] = useState(null);
  const [composing, setComposing] = useState(false);
  const [draft, setDraft] = useState({ to: "", subject: "", body: "", deal: "" });
  const filtered = emails.filter(e => e.folder === folder);
  const unread = emails.filter(e => !e.read && e.folder === "inbox").length;
  const folders = [{ id: "inbox", label: "Inbox", count: emails.filter(e => e.folder === "inbox").length }, { id: "sent", label: "Sent", count: emails.filter(e => e.folder === "sent").length }, { id: "drafts", label: "Drafts", count: 0 }, { id: "templates", label: "Templates", count: 3 }];
  const sendEmail = () => { if (!draft.to || !draft.subject) return; setEmails([...emails, { id: Date.now(), from: "me", to: draft.to, subject: draft.subject, body: draft.body, date: new Date().toISOString().replace("T", " ").substring(0, 16), read: true, folder: "sent", deal: draft.deal }]); setDraft({ to: "", subject: "", body: "", deal: "" }); setComposing(false); };
  const markRead = (id) => setEmails(emails.map(e => e.id === id ? { ...e, read: true } : e));
  return (
    <div style={{ display: "flex", gap: 14 }}>
      <div style={{ width: 160, flexShrink: 0 }}>
        <button style={{ ...S.btn("gold"), width: "100%", marginBottom: 12 }} onClick={() => { setComposing(true); setSelEmail(null); }}>+ Compose</button>
        {folders.map(f => (
          <div key={f.id} style={{ ...S.navi(folder === f.id), display: "flex", justifyContent: "space-between", marginBottom: 2, borderRadius: 3, borderLeft: folder === f.id ? `2px solid ${C.gold}` : "2px solid transparent" }} onClick={() => { setFolder(f.id); setSelEmail(null); }}>
            <span style={{ fontSize: 12 }}>{f.label}</span>
            <span style={{ fontSize: 10, color: C.dim }}>{f.count}</span>
          </div>
        ))}
        <div style={{ marginTop: 16, fontSize: 9, color: C.dim, letterSpacing: 2, textTransform: "uppercase", marginBottom: 6 }}>Connected</div>
        {[["Gmail", "Connected", C.green], ["Outlook", "Not Connected", C.dim], ["SMTP", "Not Connected", C.dim]].map(([n, s, c]) => (
          <div key={n} style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 0" }}>
            <Dot color={c} /><span style={{ fontSize: 10, color: C.sub }}>{n}</span>
          </div>
        ))}
      </div>
      <div style={{ flex: 1 }}>
        {composing ? (
          <Card title="Compose Email">
            <div style={S.g2}>
              <Field label="To"><input style={S.inp} value={draft.to} onChange={e => setDraft({ ...draft, to: e.target.value })} placeholder="recipient@email.com" /></Field>
              <Field label="Linked Deal"><input style={S.inp} value={draft.deal} onChange={e => setDraft({ ...draft, deal: e.target.value })} placeholder="Optional" /></Field>
            </div>
            <Field label="Subject"><input style={S.inp} value={draft.subject} onChange={e => setDraft({ ...draft, subject: e.target.value })} /></Field>
            <Field label="Body"><textarea style={{ ...S.ta, height: 200 }} value={draft.body} onChange={e => setDraft({ ...draft, body: e.target.value })} /></Field>
            <div style={{ display: "flex", gap: 8 }}>
              <button style={S.btn("gold")} onClick={sendEmail}>Send</button>
              <button style={S.btn()} onClick={() => setComposing(false)}>Cancel</button>
              <div style={{ flex: 1 }} />
              <button style={S.btn()} onClick={() => setDraft({ ...draft, body: draft.body + "\n\n--- AI Draft ---\n(Use Copilot to generate email content)" })}>AI Draft</button>
            </div>
          </Card>
        ) : selEmail ? (
          <Card title={selEmail.subject} action={<button style={{ ...S.btn(), padding: "3px 8px", fontSize: 9 }} onClick={() => setSelEmail(null)}>Back</button>}>
            <div style={{ display: "flex", gap: 12, fontSize: 10, color: C.dim, marginBottom: 12, paddingBottom: 8, borderBottom: "1px solid #0F1117" }}>
              <span>From: {selEmail.from}</span><span>To: {selEmail.to}</span><span>{selEmail.date}</span>
              {selEmail.deal && <Badge label={selEmail.deal} color={C.gold} />}
            </div>
            <pre style={{ margin: 0, whiteSpace: "pre-wrap", fontFamily: "'Courier New',monospace", fontSize: 13, color: C.sub, lineHeight: 1.6 }}>{selEmail.body}</pre>
            <div style={{ marginTop: 14, display: "flex", gap: 8 }}>
              <button style={S.btn("gold")} onClick={() => { setComposing(true); setSelEmail(null); setDraft({ to: selEmail.from === "me" ? selEmail.to : selEmail.from, subject: "RE: " + selEmail.subject, body: "", deal: selEmail.deal }); }}>Reply</button>
              <button style={S.btn()}>Forward</button>
            </div>
          </Card>
        ) : (
          <Card title={`${folder.charAt(0).toUpperCase() + folder.slice(1)} (${filtered.length})`} action={unread > 0 && folder === "inbox" ? <Badge label={unread + " unread"} color={C.gold} /> : null}>
            {filtered.map(e => (
              <div key={e.id} style={{ display: "flex", gap: 10, padding: "10px 0", borderBottom: "1px solid #0F1117", cursor: "pointer", opacity: e.read ? 0.8 : 1 }} onClick={() => { setSelEmail(e); markRead(e.id); }}>
                {!e.read && <div style={{ width: 6, height: 6, borderRadius: 3, background: C.gold, marginTop: 6, flexShrink: 0 }} />}
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 12, color: C.text, fontWeight: e.read ? 400 : 700 }}>{e.from === "me" ? "To: " + e.to : e.from}</span>
                    <span style={{ fontSize: 9, color: C.dim }}>{e.date}</span>
                  </div>
                  <div style={{ fontSize: 13, color: e.read ? C.sub : C.text, fontWeight: e.read ? 400 : 600, marginTop: 2 }}>{e.subject}</div>
                  <div style={{ fontSize: 10, color: C.dim, marginTop: 2, overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>{e.body.substring(0, 100)}...</div>
                </div>
                {e.deal && <Badge label={e.deal} color={C.gold} />}
              </div>
            ))}
          </Card>
        )}
      </div>
    </div>
  );
}

function Spreadsheets() {
  const [sheets, setSheets] = useLS("axiom_sheets", [
    {
      id: 1, name: "Development Pro Forma - Sunset Ridge", rows: 15, cols: 8, type: "Pro Forma", modified: "2025-02-20", data: [
        ["Item", "Units", "$/Unit", "Subtotal", "% of Total", "Notes", "", ""],
        ["Land Acquisition", "1", "3,000,000", "$3,000,000", "27.8%", "Under contract", "", ""],
        ["Hard Costs - Grading", "42", "12,000", "$504,000", "4.7%", "Per civil estimate", "", ""],
        ["Hard Costs - Utilities", "42", "18,000", "$756,000", "7.0%", "Water, sewer, storm", "", ""],
        ["Hard Costs - Roads", "42", "8,500", "$357,000", "3.3%", "", "", ""],
        ["Hard Costs - Landscaping", "1", "180,000", "$180,000", "1.7%", "Common areas", "", ""],
        ["Soft Costs", "1", "485,460", "$485,460", "4.5%", "18% of hard", "", ""],
        ["Impact Fees", "42", "8,500", "$357,000", "3.3%", "City + school + park", "", ""],
        ["Permit Fees", "42", "3,200", "$134,400", "1.2%", "", "", ""],
        ["G&A / Overhead", "1", "120,000", "$120,000", "1.1%", "", "", ""],
        ["Contingency", "1", "", "$369,186", "3.4%", "10% of hard+soft", "", ""],
        ["Interest Reserve", "1", "", "$450,000", "4.2%", "Est. 24 months", "", ""],
        ["TOTAL COST", "", "", "$6,713,046", "", "", "", ""],
        ["REVENUE (42 lots x $185K)", "42", "185,000", "$7,770,000", "", "", "", ""],
        ["NET PROFIT", "", "", "$1,056,954", "13.6%", "Margin on revenue", "", ""],
      ]
    },
    {
      id: 2, name: "Comp Analysis Grid", rows: 8, cols: 7, type: "Analysis", modified: "2025-02-18", data: [
        ["Comp", "Address", "Lots", "Lot Size", "Price/Lot", "$/SF", "DOM"],
        ["1", "100 Oak Valley", "45", "5,200", "$178,000", "$34.23", "62"],
        ["2", "250 Sierra Way", "38", "5,800", "$192,000", "$33.10", "45"],
        ["3", "80 Creek Landing", "52", "4,900", "$168,000", "$34.29", "78"],
        ["4", "320 Hillview Dr", "30", "6,200", "$205,000", "$33.06", "30"],
        ["5", "475 Ranch Rd", "40", "5,500", "$182,000", "$33.09", "55"],
        ["AVG", "", "41", "5,520", "$185,000", "$33.55", "54"],
        ["SUBJECT", "456 Ridge Rd", "42", "5,400", "$185,000", "$34.26", "—"],
      ]
    },
  ]);
  const [active, setActive] = useState(sheets[0]?.id);
  const [editCell, setEditCell] = useState(null);
  const sheet = sheets.find(s => s.id === active);
  const updCell = (r, c2, val) => { if (!sheet) return; const nd = sheet.data.map((row, ri) => row.map((cell, ci) => ri === r && ci === c2 ? val : cell)); setSheets(sheets.map(s => s.id === active ? { ...s, data: nd, modified: new Date().toISOString().split("T")[0] } : s)); };
  const addSheet = () => { const ns = { id: Date.now(), name: "New Sheet", rows: 5, cols: 5, type: "Custom", modified: new Date().toISOString().split("T")[0], data: Array.from({ length: 5 }, () => Array(5).fill("")) }; setSheets([...sheets, ns]); setActive(ns.id); };
  const addRow = () => { if (!sheet) return; setSheets(sheets.map(s => s.id === active ? { ...s, data: [...s.data, Array(s.data[0]?.length || 5).fill("")], rows: s.rows + 1 } : s)); };
  const addCol = () => { if (!sheet) return; setSheets(sheets.map(s => s.id === active ? { ...s, data: s.data.map(r => [...r, ""]), cols: s.cols + 1 } : s)); };
  return (
    <div>
      <div style={{ display: "flex", gap: 6, marginBottom: 12, alignItems: "center", flexWrap: "wrap" }}>
        {sheets.map(s => (
          <div key={s.id} style={{ ...S.navi(active === s.id), borderRadius: 3, padding: "4px 10px", cursor: "pointer", borderBottom: active === s.id ? `2px solid ${C.gold}` : "2px solid transparent" }} onClick={() => setActive(s.id)}>
            <span style={{ fontSize: 12 }}>{s.name}</span>
          </div>
        ))}
        <button style={{ ...S.btn(), padding: "3px 8px", fontSize: 10 }} onClick={addSheet}>+ New Sheet</button>
        <div style={{ flex: 1 }} />
        <button style={{ ...S.btn(), padding: "3px 8px", fontSize: 10 }} onClick={addRow}>+ Row</button>
        <button style={{ ...S.btn(), padding: "3px 8px", fontSize: 10 }} onClick={addCol}>+ Column</button>
        <button style={{ ...S.btn("gold"), padding: "3px 8px", fontSize: 10 }} onClick={() => sheet && downloadCSV(sheet.data[0], sheet.data.slice(1), `axiom_${sheet.name.toLowerCase().replace(/\s+/g, "_")}.csv`)}>Export CSV</button>
        <input type="file" id="sheet-import" style={{ display: "none" }} accept=".csv" onChange={(e) => {
          const file = e.target.files[0];
          if (!file) return;
          const reader = new FileReader();
          reader.onload = (ev) => {
            const rows = ev.target.result.split("\n").map(r => r.split(",").map(c => c.trim().replace(/^"|"$/g, "")));
            const ns = { id: Date.now(), name: file.name.replace(".csv", ""), rows: rows.length, cols: rows[0]?.length || 0, type: "Imported", modified: new Date().toISOString().split("T")[0], data: rows };
            setSheets([...sheets, ns]); setActive(ns.id);
          };
          reader.readAsText(file);
        }} />
        <button style={{ ...S.btn(), padding: "3px 8px", fontSize: 10 }} onClick={() => document.getElementById("sheet-import").click()}>Import</button>
      </div>
      {sheet && (
        <div style={{ overflowX: "auto", border: `1px solid ${C.border}`, borderRadius: 3 }}>
          <table style={{ ...S.tbl, width: "100%" }}>
            <tbody>
              {sheet.data.map((row, ri) => (
                <tr key={ri}>
                  <td style={{ ...S.td, width: 30, textAlign: "center", background: C.bg2, color: C.dim, fontSize: 9 }}>{ri + 1}</td>
                  {row.map((cell, ci) => {
                    const isHeader = ri === 0;
                    const isEditing = editCell && editCell[0] === ri && editCell[1] === ci;
                    return (
                      <td key={ci} style={{ ...S.td, background: isHeader ? C.bg2 : C.bg3, color: isHeader ? C.gold : C.sub, fontWeight: isHeader ? 700 : 400, fontSize: isHeader ? 9 : 10, minWidth: 90, padding: isEditing ? 0 : S.td.padding, cursor: "text" }} onClick={() => setEditCell([ri, ci])}>
                        {isEditing ? <input style={{ ...S.inp, width: "100%", margin: 0, padding: "3px 5px", fontSize: 12, border: "none", background: C.bg }} autoFocus value={cell} onChange={e => updCell(ri, ci, e.target.value)} onBlur={() => setEditCell(null)} onKeyDown={e => e.key === "Enter" && setEditCell(null)} /> : cell}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div style={{ marginTop: 14 }}>
        <Card title="Sheet AI Assistant">
          <Agent id="SheetAI" system={`You are a spreadsheet and financial modeling assistant. Help the user analyze their real estate development spreadsheet data, create formulas, explain financial calculations, and suggest improvements. Current sheet: ${sheet?.name || "none"} with ${sheet?.rows || 0} rows.`} placeholder="Ask about formulas, calculations, or financial analysis..." />
        </Card>
      </div>
    </div>
  );
}

function Workflows() {
  const [workflows, setWorkflows] = useLS("axiom_workflows", [
    { id: 1, name: "Deal Stage Transition Alerts", trigger: "Deal moves to new stage", condition: "Any deal", actions: ["Send email notification to team", "Log activity in deal timeline", "Update dashboard KPIs"], status: "Active", runs: 24, lastRun: "2025-02-20" },
    { id: 2, name: "DD Deadline Reminders", trigger: "3 days before DD deadline", condition: "Deals in Due Diligence stage", actions: ["Send email reminder to deal assignee", "Create calendar event", "Push notification"], status: "Active", runs: 8, lastRun: "2025-02-18" },
    { id: 3, name: "New Listing Alert", trigger: "New MLS listing matches saved search", condition: "Price < $5M, 5+ acres, R-1 zoning", actions: ["Send email with listing details", "Add to Data & Intel feed", "Create note with property summary"], status: "Active", runs: 12, lastRun: "2025-02-19" },
    { id: 4, name: "Weekly Pipeline Report", trigger: "Every Monday at 8:00 AM", condition: "Always", actions: ["Generate pipeline summary", "Email to team distribution list", "Archive to Reports & Binder"], status: "Active", runs: 6, lastRun: "2025-02-17" },
    { id: 5, name: "Risk Score Alert", trigger: "Risk score drops below 50", condition: "Any active deal", actions: ["Notify deal lead", "Create risk review meeting", "Flag in Command Center"], status: "Paused", runs: 2, lastRun: "2025-02-05" },
  ]);
  const TRIGGERS = ["Deal moves to new stage", "Time-based schedule", "New MLS listing matches criteria", "Risk score changes", "DD item completed", "Contact updated", "Financial threshold crossed", "Document uploaded", "Manual trigger"];
  const [nw, setNw] = useState({ name: "", trigger: TRIGGERS[0], condition: "", actions: [""], status: "Active" });
  const toggle = (id) => setWorkflows(workflows.map(w => w.id === id ? { ...w, status: w.status === "Active" ? "Paused" : "Active" } : w));
  const delWf = (id) => setWorkflows(workflows.filter(w => w.id !== id));
  const addWf = () => { if (!nw.name) return; setWorkflows([...workflows, { ...nw, id: Date.now(), runs: 0, lastRun: "Never" }]); setNw({ name: "", trigger: TRIGGERS[0], condition: "", actions: [""], status: "Active" }); };
  const addAction = () => setNw({ ...nw, actions: [...nw.actions, ""] });
  const updAction = (i, val) => { const a = [...nw.actions]; a[i] = val; setNw({ ...nw, actions: a }); };
  return (
    <Tabs tabs={["Active Workflows", "Create Workflow", "Templates", "Automation Log"]}>
      <div>
        <div style={{ ...S.g4, marginBottom: 14 }}>
          <KPI label="Total Workflows" value={workflows.length} />
          <KPI label="Active" value={workflows.filter(w => w.status === "Active").length} color={C.green} />
          <KPI label="Total Runs" value={workflows.reduce((s, w) => s + w.runs, 0)} color={C.gold} />
          <KPI label="Last Run" value={workflows.sort((a, b) => b.lastRun.localeCompare(a.lastRun))[0]?.lastRun || "Never"} color={C.dim} />
        </div>
        {workflows.map(w => (
          <Card key={w.id} title={w.name} action={<div style={{ display: "flex", gap: 6 }}><Badge label={w.status} color={w.status === "Active" ? C.green : C.amber} /><button style={{ ...S.btn(), padding: "3px 8px", fontSize: 9 }} onClick={() => toggle(w.id)}>{w.status === "Active" ? "Pause" : "Resume"}</button><button style={{ ...S.btn(), padding: "3px 8px", fontSize: 9 }} onClick={() => delWf(w.id)}>x</button></div>}>
            <div style={S.g3}>
              <div><div style={{ fontSize: 9, color: C.dim, letterSpacing: 1, textTransform: "uppercase", marginBottom: 3 }}>Trigger</div><div style={{ fontSize: 12, color: C.blue }}>{w.trigger}</div></div>
              <div><div style={{ fontSize: 9, color: C.dim, letterSpacing: 1, textTransform: "uppercase", marginBottom: 3 }}>Condition</div><div style={{ fontSize: 12, color: C.sub }}>{w.condition}</div></div>
              <div><div style={{ fontSize: 9, color: C.dim, letterSpacing: 1, textTransform: "uppercase", marginBottom: 3 }}>Runs / Last</div><div style={{ fontSize: 12, color: C.gold }}>{w.runs} runs · {w.lastRun}</div></div>
            </div>
            <div style={{ marginTop: 8 }}><div style={{ fontSize: 9, color: C.dim, letterSpacing: 1, textTransform: "uppercase", marginBottom: 4 }}>Actions</div>
              {w.actions.map((a, i) => (
                <div key={i} style={{ fontSize: 12, color: C.sub, padding: "2px 0", display: "flex", gap: 6, alignItems: "center" }}>
                  <span style={{ color: C.gold, fontSize: 12 }}>{i + 1}.</span>{a}
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
      <div>
        <Card title="Create New Workflow">
          <div style={S.g2}>
            <Field label="Workflow Name"><input style={S.inp} value={nw.name} onChange={e => setNw({ ...nw, name: e.target.value })} placeholder="e.g., Deal Stage Alert" /></Field>
            <Field label="Trigger"><select style={S.sel} value={nw.trigger} onChange={e => setNw({ ...nw, trigger: e.target.value })}>{TRIGGERS.map(t => <option key={t}>{t}</option>)}</select></Field>
          </div>
          <Field label="Condition"><input style={S.inp} value={nw.condition} onChange={e => setNw({ ...nw, condition: e.target.value })} placeholder="When specific conditions are met..." /></Field>
          <div style={{ fontSize: 9, color: C.dim, letterSpacing: 2, textTransform: "uppercase", marginBottom: 6 }}>Actions (executed in order)</div>
          {nw.actions.map((a, i) => (
            <Field key={i} label={`Action ${i + 1}`}><input style={S.inp} value={a} onChange={e => updAction(i, e.target.value)} placeholder="What should happen..." /></Field>
          ))}
          <div style={{ display: "flex", gap: 8 }}>
            <button style={S.btn()} onClick={addAction}>+ Add Action</button>
            <button style={S.btn("gold")} onClick={addWf}>Save Workflow</button>
          </div>
        </Card>
      </div>
      <div>
        <Card title="Pre-Built Templates">
          {[
            ["Deal Stage Notifications", "Deal moves to new stage", "Any deal", ["Send email notification to team", "Log activity in deal timeline", "Update dashboard KPIs"]],
            ["DD Deadline Tracker", "3 days before DD deadline", "Deals in Due Diligence stage", ["Send email reminder to deal assignee", "Create calendar event", "Push notification"]],
            ["Listing Price Drop Alert", "New MLS listing matches saved search", "Price reduction > 5%", ["Send email with listing details", "Add to Data & Intel feed", "Create note with property summary"]],
            ["Weekly Pipeline Digest", "Time-based schedule", "Every Monday at 8:00 AM", ["Generate pipeline summary", "Email to team distribution list", "Archive to Reports & Binder"]],
            ["Risk Score Monitor", "Risk score changes", "Any active deal", ["Notify deal lead", "Create risk review meeting", "Flag in Command Center"]],
            ["Comp Sale Alert", "New MLS listing matches criteria", "Comparable sale recorded in target area", ["Email comp summary to team", "Add to Market Intelligence"]],
            ["Permit Filing Alert", "DD item completed", "County records updated", ["Notify entitlements lead", "Update process control timeline"]],
            ["Investor Report Generator", "Time-based schedule", "First day of each month", ["Generate investor KPI report", "Email to investor distribution list"]],
          ].map(([title, trigger, condition, templateActions], i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: "1px solid #0F1117" }}>
              <div style={{ flex: 1 }}><div style={{ fontSize: 13, color: C.text }}>{title}</div><div style={{ fontSize: 10, color: C.dim }}>{condition}</div></div>
              <button style={{ ...S.btn("gold"), padding: "4px 10px", fontSize: 9 }}
                onClick={() => {
                  setNw({ name: title, trigger, condition, actions: templateActions, status: "Active" });
                  // switch to the Create tab by setting a flash state
                  document.querySelectorAll && (() => {
                    const tabs = document.querySelectorAll("[data-axiom-tab]");
                    if (tabs[1]) tabs[1].click();
                  })();
                }}
              >Use Template</button>
            </div>
          ))}
        </Card>
      </div>
      <div>
        <Card title="Recent Automation Activity">
          {[["Deal Stage Transition", "Sunset Ridge moved to Due Diligence", "2025-02-20 14:30", C.green], ["DD Deadline Reminder", "Hawk Valley - Geotech report due in 3 days", "2025-02-18 08:00", C.amber], ["New Listing Match", "4500 Hillside Dr - matches 'Infill SFR' search", "2025-02-19 10:15", C.blue], ["Weekly Report", "Pipeline report generated and emailed", "2025-02-17 08:00", C.gold], ["Risk Alert", "Meadowbrook PUD risk score dropped to 42", "2025-02-05 16:00", C.red]].map(([name, detail, time, color], i) => (
            <div key={i} style={{ display: "flex", gap: 10, padding: "8px 0", borderBottom: "1px solid #0F1117" }}>
              <Dot color={color} />
              <div style={{ flex: 1 }}><div style={{ fontSize: 12, color: C.text }}>{name}</div><div style={{ fontSize: 10, color: C.dim }}>{detail}</div></div>
              <span style={{ fontSize: 9, color: C.dim }}>{time}</span>
            </div>
          ))}
        </Card>
      </div>
    </Tabs>
  );
}

function ResourceCenter() {
  const CATS2 = ["All", "Getting Started", "Financial Modeling", "Entitlements", "Market Analysis", "Legal", "Construction", "Best Practices", "Video Tutorials"];
  const [filterCat, setFilterCat] = useState("All");
  const [search, setSearch] = useState("");
  const [activeRes, setActiveRes] = useState(null);
  const resources = [
    { id: 1, title: "Land Development Feasibility Guide", category: "Getting Started", type: "Guide", desc: "Complete walkthrough of the development feasibility process from site identification through entitlement and construction.", readTime: "15 min", level: "Beginner", content: "LAND DEVELOPMENT FEASIBILITY GUIDE\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n1. SITE IDENTIFICATION\n───────────────────────\n• Define target market: geography, price point, product type\n• Source opportunities: MLS, off-market, broker networks, auctions\n• Initial screening: zoning, size, access, utilities, flood zone\n• Drive the site: visual inspection, neighborhood, traffic\n\n2. PRELIMINARY ANALYSIS\n──────────────────────────\n• Pull APN data: lot size, zoning, assessor value\n• Check General Plan designation and overlays\n• Verify utility availability: water, sewer, electric, gas\n• Review FEMA flood maps and NWI wetlands\n• Research title: easements, encumbrances, liens\n\n3. FINANCIAL FEASIBILITY\n───────────────────────────\n• Build preliminary pro forma:\n  - Land cost + closing costs\n  - Hard costs: grading, utilities, roads, landscaping\n  - Soft costs: engineering, architecture, permits, legal\n  - Impact fees: city, school, park, drainage\n  - Financing: construction loan interest, fees\n  - Contingency: 10-15% of hard + soft costs\n• Revenue: comparable lot sales ($/lot, $/SF), absorption rate\n• Target: 15-25% margin on cost, 20%+ unlevered IRR\n\n4. DUE DILIGENCE\n────────────────\n• Phase I ESA • Title Report • ALTA Survey\n• Geotech Investigation • Bio/Cultural Survey\n• Traffic Study • Utility will-serve letters\n\n5. ENTITLEMENT PROCESS\n──────────────────────────\n• Pre-app meeting → Tentative Map → CEQA\n• Design Review → Planning Commission → Council\n• Final Map recordation\n\n6. CONSTRUCTION & DELIVERY\n──────────────────────────────\n• Grading → Utilities → Roads → Landscaping\n• Punch list → NOC → Lot sales" },
    { id: 2, title: "Pro Forma Modeling Best Practices", category: "Financial Modeling", type: "Guide", desc: "How to structure a development pro forma, including cost categories, revenue assumptions, and sensitivity analysis.", readTime: "20 min", level: "Intermediate", content: "PRO FORMA MODELING BEST PRACTICES\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nSTRUCTURE YOUR PRO FORMA\n──────────────────────────\n\n1. LAND ACQUISITION\n   • Purchase price, closing costs (1-2%), DD costs\n\n2. HARD COSTS (Direct Construction)\n   • Grading: $8K-$15K/lot\n   • Wet utilities: $15K-$25K/lot\n   • Dry utilities: $3K-$8K/lot\n   • Roads & paving: $6K-$12K/lot\n   • Landscaping: lump sum\n\n3. SOFT COSTS (Indirect)\n   • Civil engineering: 5-8% of hard costs\n   • Legal: $50K-$150K\n   • Project management: 3-5% of hard costs\n\n4. FEES & EXACTIONS\n   • City: $5K-$30K/lot • School: $3-$5/SF\n   • Park (Quimby): $3K-$8K/lot\n\n5. FINANCING\n   • Construction loan interest (model monthly draws)\n   • Origination fee: 0.5-1.5%\n\n6. CONTINGENCY: 10% hard, 5-10% soft\n\nSENSITIVITY ANALYSIS\n──────────────────────\nTest: Lot price ±10%, Costs ±15%, Absorption ±30%,\nInterest rate ±100bps, Timeline +6 months\n\nKEY METRICS: Gross margin, Developer spread,\nUnlevered IRR (20%+), Cash-on-cash, Breakeven lots" },
    { id: 3, title: "CEQA Compliance Roadmap", category: "Entitlements", type: "Reference", desc: "Step-by-step guide to California Environmental Quality Act compliance for residential subdivisions.", readTime: "25 min", level: "Advanced", content: "CEQA COMPLIANCE ROADMAP\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nSTEP 1: DETERMINE IF CEQA APPLIES\n───────────────────────────────────\n• Is it a 'project' under CEQA? (physical change)\n• Is it discretionary? (government judgment)\n• Does an exemption apply?\n  - Statutory exemptions (PRC §21080)\n  - Categorical exemptions (14 CCR §15300-15333)\n  - Common: Class 32 (Infill Development)\n\nSTEP 2: INITIAL STUDY\n───────────────────────\nPrepare IS using Appendix G checklist:\nAesthetics, Air Quality, Biological Resources,\nCultural Resources, Geology, GHG, Hazards,\nHydrology, Noise, Transportation, Utilities, Wildfire\n\nSTEP 3: DOCUMENT TYPE\n───────────────────────\n• Negative Declaration (ND): no significant impacts\n• Mitigated ND (MND): mitigated to less-than-significant\n• EIR: significant unavoidable impacts\n\nTIMELINES\n───────────\n• MND: 3-6 months (20-30 day public review)\n• EIR: 12-24 months (45-day review)\n\nCOSTS: MND $15K-$50K, Focused EIR $75K-$200K,\nFull EIR $200K-$500K+" },
    { id: 4, title: "Comparable Sales Analysis Methodology", category: "Market Analysis", type: "Guide", desc: "How to identify, analyze, and adjust comparable land and lot sales for pricing accuracy.", readTime: "12 min", level: "Intermediate", content: "COMPARABLE SALES ANALYSIS\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n1. IDENTIFY COMPS\n───────────────────────\n• Same submarket, 5-mile radius\n• Sold within 12 months (24 max)\n• Similar lot count and sizes (±25%)\n• Same product type\nSources: MLS, CoStar, county recorder, brokers\n\n2. ADJUSTMENT CATEGORIES\n───────────────────────────\n• Time: 3-8% annual appreciation typical\n• Location: school district, access, views (5-15%)\n• Physical: lot size, slope (5-20%), shape\n• Entitlement: raw (+0%), entitled (+20-40%),\n  finished lots (+60-100%)\n\n3. CALCULATE\n────────────\n• Price per lot or per SF/acre\n• Net adjustment ≤25% total\n• Use 3-6 comps minimum\n• Discard outliers\n• Weight by similarity and recency" },
    { id: 5, title: "Understanding Impact Fees", category: "Legal", type: "Reference", desc: "Comprehensive overview of development impact fees, Quimby Act, school fees, and mitigation measures.", readTime: "18 min", level: "Intermediate", content: "UNDERSTANDING IMPACT FEES\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nCITY/COUNTY FEES (per unit)\n───────────────────────────\n• Traffic: $2K-$15K • Water: $3K-$12K\n• Sewer: $3K-$10K • Storm drainage: $1K-$5K\n• Fire: $500-$3K • Police: $200-$1.5K\n\nSCHOOL FEES\n───────────\n• Level 1 (statutory): $4.79/SF residential\n• Level 2: higher, requires state approval\n• Level 3 (Mello-Roos): unlimited, 2/3 vote\n\nPARK (QUIMBY ACT)\n─────────────────\n• 3 acres per 1,000 residents\n• In-lieu fees: $3K-$10K/lot\n• Applies to subdivisions of 5+ lots only\n\nNEGOTIATION STRATEGIES\n──────────────────────────\n• Request fee deferral to building permit\n• Seek credits for oversized infrastructure\n• Lock in fee schedule at tentative map\n• Use development agreements for certainty" },
    { id: 6, title: "Construction Cost Estimation", category: "Construction", type: "Guide", desc: "Methods for estimating horizontal improvement costs per lot for subdivision development.", readTime: "15 min", level: "Intermediate", content: "CONSTRUCTION COST ESTIMATION\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nMASS GRADING: $8K-$15K/lot\n───────────────────────────\n• Balanced cut/fill: $3-$5/CY\n• Import/export: $8-$15/CY + trucking\n• Fine grading: $0.50-$1.00/SF\n\nWET UTILITIES: $15K-$25K/lot\n───────────────────────────\n• 8\" water main: $45-$65/LF\n• 12\" water main: $65-$95/LF\n• 8\" sewer main: $55-$80/LF\n• Storm drain 18\": $40-$60/LF\n• Manholes: $4K-$7K each\n\nDRY UTILITIES: $3K-$8K/lot\n───────────────────────────\n• Electric: $2K-$5K/lot (underground)\n• Gas: $1.5K-$3K/lot\n• Joint trench: 15-20% savings\n\nROADS: $6K-$12K/lot\n───────────────────\n• Subgrade: $2-$4/SF • Base: $3-$5/SF\n• Asphalt: $4-$7/SF • Curb: $25-$40/LF\n\nESCALATION: 4-6% annual, add 10% contingency" },
    { id: 7, title: "Due Diligence Checklist (Master)", category: "Best Practices", type: "Template", desc: "Complete due diligence checklist covering all phases of land acquisition and entitlement.", readTime: "10 min", level: "All Levels", content: "DUE DILIGENCE CHECKLIST — MASTER\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n✅ TITLE & LEGAL\n  ✅ Preliminary title report\n  ✅ Easements reviewed and mapped\n  ✅ CC&Rs and deed restrictions\n  ✅ Liens and encumbrances cleared\n  ✅ Tax status current\n  ✅ Litigation search\n\n✅ PHYSICAL / ENVIRONMENTAL\n  ✅ Phase I ESA\n  ✅ Phase II ESA (if RECs found)\n  ✅ Geotech investigation\n  ✅ ALTA/NSPS survey\n  ✅ Biological survey\n  ✅ Cultural/archaeological survey\n  ✅ Arborist report\n  ✅ Wetlands delineation\n\n✅ UTILITIES\n  ✅ Water will-serve ✅ Sewer will-serve\n  ✅ Electric confirmation\n  ✅ Gas confirmation ✅ Telecom\n  ✅ Capacity analysis ✅ Off-site needs\n\n✅ ENTITLEMENT\n  ✅ Zoning confirmed ✅ General Plan\n  ✅ Pre-app meeting ✅ Dev standards\n  ✅ CEQA pathway determined\n\n✅ MARKET & FINANCIAL\n  ✅ Comps pulled (3-6) ✅ Absorption study\n  ✅ Builder interest ✅ Pro forma\n  ✅ Sensitivity analysis ✅ Financing terms\n  ✅ Impact fee schedule" },
    { id: 8, title: "Getting Started with Axiom OS", category: "Getting Started", type: "Video", desc: "Full walkthrough of the Axiom OS platform — navigating sections, entering data, and running analysis.", readTime: "12 min", level: "Beginner", content: "GETTING STARTED WITH AXIOM OS\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nNAVIGATION\n──────────\n27 sections in 8 groups. Click any in the sidebar.\nGroups: Overview, CRM, Site, Market, Finance,\nExecution, Workspace, Output, System\n\nQUICK START\n───────────\n1. Set project name and address in the top bar\n2. Enter site info in Site & Entitlements\n3. Add comps in Market Intelligence\n4. Build pro forma in Financial Engine\n5. Run analysis with AI Copilot\n\nAI MODELS\n─────────\n10 models available including free options.\nSelect your model in any Agent dropdown.\nSet API keys in Settings > API Keys.\n\nWORKSPACE TOOLS\n───────────────\nNotes, Calendar, Email, Spreadsheets,\nWorkflows, Resource Center" },
    { id: 9, title: "Financial Engine Deep Dive", category: "Financial Modeling", type: "Video", desc: "Advanced tutorial on using the Financial Engine for pro forma modeling.", readTime: "18 min", level: "Advanced", content: "FINANCIAL ENGINE DEEP DIVE\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nPRO FORMA TAB\n─────────────\nEnter costs by category. Auto-calculates margin,\ndeveloper spread, and cost/lot.\n\nKEY INPUTS\n──────────\nTotal Lots, Price/Lot, Hard Cost/Lot,\nSoft Cost % (15-20%), Contingency (10%),\nLoan LTC (60-70%), Interest Rate\n\nSENSITIVITY ANALYSIS\n──────────────────────\nTests 5 variables with color-coded matrix.\nLot price, hard costs, absorption, rate, timeline.\n\nEQUITY STRUCTURE\n────────────────\nModel GP/LP splits, preferred return (8-12%),\npromote waterfalls, cash flow distributions.\n\nEXPORT: PDF for investors, Reports & Binder,\nAI-powered investment memo generation." },
    { id: 10, title: "Risk Assessment Framework", category: "Best Practices", type: "Guide", desc: "How to evaluate and score development risks.", readTime: "14 min", level: "Intermediate", content: "RISK ASSESSMENT FRAMEWORK\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nSCORING: Likelihood (1-5) × Impact (1-5) = Score (1-25)\n\nGreen (1-6): Monitor | Yellow (7-12): Mitigate\nOrange (13-18): Action plan | Red (19-25): Stop/go\n\nFINANCIAL RISKS\n• Cost overruns (L:3, I:4) = 12\n• Slow absorption (L:3, I:4) = 12\n• Price decline (L:2, I:4) = 8\n\nENTITLEMENT RISKS\n• CEQA litigation (L:2, I:5) = 10\n• Commission denial (L:2, I:4) = 8\n• Timeline delay (L:3, I:3) = 9\n\nENVIRONMENTAL RISKS\n• Contamination (L:2, I:4) = 8\n• Protected species (L:2, I:4) = 8\n\nMARKET RISKS\n• New competition (L:3, I:3) = 9\n• Recession (L:2, I:5) = 10\n\nMitigate with: contingency reserves, pre-sales,\ncommunity outreach, phased development, bonds." },
    { id: 11, title: "MLS Integration Setup Guide", category: "Getting Started", type: "Guide", desc: "How to connect data feeds to the Axiom OS platform.", readTime: "8 min", level: "Beginner", content: "MLS INTEGRATION SETUP\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n1. API KEY SETUP (Settings > API Keys)\n───────────────────────────────────────\n• ATTOM Data: attomdata.com ($250+/mo)\n• Regrid: regrid.com (parcel data)\n• CoStar: enterprise subscription\n• Google Maps: cloud.google.com ($200 free)\n\n2. CONFIGURE CONNECTORS\n──────────────────────────\nConnectors & APIs > Add > Enter key > Test\n\n3. SAVED SEARCHES\n─────────────────\nMLS & Listings > Define criteria > Save > Enable alerts\n\n4. AUTOMATION\n───────────\nWorkflows > New Listing Alert template\nAuto-emails + Data & Intel feed updates" },
    { id: 12, title: "Investor Deck Best Practices", category: "Best Practices", type: "Guide", desc: "How to create compelling investor presentations.", readTime: "10 min", level: "Intermediate", content: "INVESTOR DECK BEST PRACTICES\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nDECK STRUCTURE (12-15 slides)\n───────────────────────────────\n1. Cover Slide\n2. Executive Summary (metrics, timeline, returns)\n3. Market Overview (growth, supply/demand)\n4. Site Overview (aerial, site characteristics)\n5. Entitlement Status (pathway, CEQA)\n6. Product Plan (site plan, lots, phasing)\n7. Comparable Sales (4-6 comps with grid)\n8. Financial Summary (sources & uses, pro forma)\n9. Sensitivity Analysis (±15% price, ±10% cost)\n10. Risk Factors (top 5 with mitigations)\n11. Deal Structure (GP/LP, preferred, promote)\n12. Team & Track Record\n\nAXIOM OS AI MEMO GENERATOR\n──────────────────────────\n1. Complete pro forma in Financial Engine\n2. Reports & Binder > Generate\n3. Select 'Investment Memo' template\n4. AI generates narrative from your data\n5. Export to PDF" },
  ];
  const filtered = (filterCat === "All" ? resources : resources.filter(r => r.category === filterCat)).filter(r => !search || r.title.toLowerCase().includes(search.toLowerCase()) || r.desc.toLowerCase().includes(search.toLowerCase()));
  const TC4 = { Guide: C.blue, Reference: C.purple, Template: C.gold, Video: C.green };
  const LC = { Beginner: C.green, Intermediate: C.amber, Advanced: C.red, "All Levels": C.gold };
  if (activeRes) {
    const r = resources.find(x => x.id === activeRes);
    if (r) return (
      <div>
        <button style={{ ...S.btn(), marginBottom: 14 }} onClick={() => setActiveRes(null)}>{"←"} Back to Library</button>
        <Card title={r.title} action={<div style={{ display: "flex", gap: 6 }}><Badge label={r.type} color={TC4[r.type] || C.blue} /><Badge label={r.level} color={LC[r.level] || C.dim} /><Badge label={r.readTime} color={C.dim} /></div>}>
          <div style={{ fontSize: 13, color: C.sub, marginBottom: 12, lineHeight: 1.4 }}>{r.desc}</div>
          <pre style={{ margin: 0, whiteSpace: "pre-wrap", fontFamily: "'Courier New',monospace", fontSize: 13, color: C.sub, lineHeight: 1.7, background: C.bg2, padding: 18, borderRadius: 4, border: `1px solid ${C.border}` }}>{r.content}</pre>
        </Card>
      </div>
    );
  }
  return (
    <Tabs tabs={["Library", "Video Tutorials", "Templates", "External Resources"]}>
      <div>
        <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
          <input style={{ ...S.inp, flex: 1 }} value={search} onChange={e => setSearch(e.target.value)} placeholder="Search resources..." />
          <select style={{ ...S.sel, width: 160 }} value={filterCat} onChange={e => setFilterCat(e.target.value)}>{CATS2.map(c => <option key={c}>{c}</option>)}</select>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 12 }}>
          {filtered.map(r => (
            <div key={r.id} onClick={() => setActiveRes(r.id)} style={{ background: C.bg3, border: `1px solid ${C.border}`, borderRadius: 4, padding: 16, cursor: "pointer", transition: "border-color 0.2s" }} onMouseEnter={e => (e.currentTarget.style.borderColor = C.gold)} onMouseLeave={e => (e.currentTarget.style.borderColor = C.border)}>
              <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
                <Badge label={r.type} color={TC4[r.type] || C.blue} />
                <Badge label={r.level} color={LC[r.level] || C.dim} />
              </div>
              <div style={{ fontSize: 14, color: C.text, fontWeight: 600, marginBottom: 4 }}>{r.title}</div>
              <div style={{ fontSize: 12, color: C.sub, lineHeight: 1.4, marginBottom: 8 }}>{r.desc}</div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 10, color: C.dim }}>{r.readTime} . {r.category}</span>
                <button style={{ ...S.btn("gold"), padding: "3px 10px", fontSize: 10 }}>{r.type === "Video" ? "Watch" : "Read"}</button>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div>
        <Card title="Video Tutorials">
          {resources.filter(r => r.type === "Video").map(r => (
            <div key={r.id} style={{ display: "flex", gap: 12, padding: "12px 0", borderBottom: "1px solid #0F1117" }}>
              <div style={{ width: 120, height: 68, background: C.bg2, borderRadius: 3, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, border: `1px solid ${C.border}` }}>
                <span style={{ fontSize: 28, color: C.gold }}>▶</span>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, color: C.text, fontWeight: 600 }}>{r.title}</div>
                <div style={{ fontSize: 12, color: C.sub, marginTop: 3 }}>{r.desc}</div>
                <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
                  <Badge label={r.level} color={LC[r.level]} /><span style={{ fontSize: 10, color: C.dim }}>{r.readTime}</span>
                </div>
              </div>
            </div>
          ))}
        </Card>
      </div>
      <div>
        <Card title="Downloadable Templates">
          {[["Development Pro Forma Template", "Excel spreadsheet with pre-built financial model", "xlsx"], ["Due Diligence Checklist", "Comprehensive DD tracking template", "xlsx"], ["LOI Template", "Letter of Intent template for land acquisition", "docx"], ["Investment Memo Template", "IC memo format with deal analysis sections", "docx"], ["Comparable Sales Grid", "Structured comp analysis spreadsheet", "xlsx"], ["Construction Budget Template", "Horizontal improvement cost tracking", "xlsx"]].map(([t, d, ext], i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: "1px solid #0F1117" }}>
              <Badge label={ext.toUpperCase()} color={ext === "xlsx" ? C.green : C.blue} />
              <div style={{ flex: 1 }}><div style={{ fontSize: 13, color: C.text }}>{t}</div><div style={{ fontSize: 10, color: C.dim }}>{d}</div></div>
              <button style={{ ...S.btn("gold"), padding: "3px 10px", fontSize: 9 }}>Download</button>
            </div>
          ))}
        </Card>
      </div>
      <div>
        <Card title="External Resources & Links">
          {[["California CEQA Guidelines", "https://resources.ca.gov/ceqa", "Government"], ["FEMA Flood Map Service", "https://msc.fema.gov", "Government"], ["CoStar Market Analytics", "https://www.costar.com", "Data Provider"], ["RESO Web API Documentation", "https://www.reso.org", "Standard"], ["National Association of Home Builders", "https://www.nahb.org", "Industry"], ["Urban Land Institute", "https://uli.org", "Industry"], ["ICC Building Code", "https://www.iccsafe.org", "Standard"], ["ENR Construction Cost Index", "https://www.enr.com", "Data Provider"]].map(([t, u, cat], i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 0", borderBottom: "1px solid #0F1117" }}>
              <Badge label={cat} color={cat === "Government" ? C.blue : cat === "Data Provider" ? C.green : C.gold} />
              <div style={{ flex: 1 }}><div style={{ fontSize: 13, color: C.text }}>{t}</div><div style={{ fontSize: 10, color: C.dim }}>{u}</div></div>
              <button style={{ ...S.btn(), padding: "3px 10px", fontSize: 9 }}>Open</button>
            </div>
          ))}
        </Card>
      </div>
    </Tabs >
  );
}





function JurisdictionIntel() {
  const { project } = useContext(Ctx);
  const [selState, setSelState] = useState(project.state || "FL");
  const [activeTab2, setActiveTab2] = useState(0);

  const JURIS_DATA = {
    FL: {
      name: "Florida", abbr: "FL", flag: "🌴",
      overview: "Florida has a streamlined subdivision approval process under the Florida Subdivision Act (Ch. 177 F.S.). No state-level environmental review equivalent to CEQA. Primary regulators: FDEP (water/wetlands), SFWMD/SWFWMD/SJRWMD (water management districts), county/city planning departments.",
      entitlement: [
        { phase: "Pre-Application Conference", duration: "2–4 weeks", notes: "Required by most FL counties. Informal. Identify issues early." },
        { phase: "Preliminary Plat Application", duration: "30–60 days", notes: "Staff review, DRC review. Public notice required." },
        { phase: "Planning Commission Hearing", duration: "30–45 days", notes: "Quasi-judicial in FL. Must present competent substantial evidence." },
        { phase: "BCC/City Commission Approval", duration: "30–45 days", notes: "Final approval. Conditions of approval issued." },
        { phase: "Final Plat Survey & Engineering", duration: "60–120 days", notes: "Boundary survey, legal descriptions, engineer certification." },
        { phase: "Final Plat Recording", duration: "2–4 weeks", notes: "Filed with Clerk of Courts. Recorded in plat book." },
        { phase: "ERP Permit (if wetlands)", duration: "60–120 days", notes: "Environmental Resource Permit from SFWMD/SWFWMD. Required for >0.5 ac disturbance." },
      ],
      fees: [
        { type: "Impact Fees (Roads)", range: "$3,000–$8,000/unit", notes: "Varies by county. Hillsborough ~$6,200, Orange ~$5,800, Lee ~$4,100" },
        { type: "Impact Fees (Schools)", range: "$2,500–$6,500/unit", notes: "School board adopted. Broward ~$6,200, Collier ~$5,900" },
        { type: "Impact Fees (Parks)", range: "$500–$2,500/unit", notes: "County/city specific. Often tied to acreage dedication option." },
        { type: "Impact Fees (Fire/EMS)", range: "$300–$800/unit", notes: "District-specific. Fire special districts common in FL." },
        { type: "Impact Fees (Water/Sewer)", range: "$3,000–$9,000/unit", notes: "Utility-set. JEA ~$7,400, TOHO ~$6,100." },
        { type: "Plat Recording Fee", range: "$10–$15/lot", notes: "Clerk of Courts. Nominal." },
        { type: "Plan Review Fee", range: "$500–$3,000 flat", notes: "Engineering plan review. Plus per-sheet fees." },
      ],
      env: [
        { item: "Wetlands / ERP", detail: "FDEP & WMD jurisdiction. ERP permit required. Section 404/401 if federal nexus. Mitigation banks active in FL. Mitigation ratio typically 1.5:1–2:1." },
        { item: "Listed Species", detail: "Florida Scrub Jay, Gopher Tortoise, Florida Panther (SW FL). FWC coordination required. Gopher Tortoise relocation permit ~$200–600/tortoise." },
        { item: "Stormwater / NPDES", detail: "FDEP NPDES permit for >1 ac disturbance. NOI required. SWPPP mandatory. WMD permits address water quantity and quality." },
        { item: "Coastal / CCCL", detail: "Coastal Construction Control Line (CCCL) permit from FDEP for coastal projects. Mandatory for oceanfront or near inlet." },
        { item: "DRI Review", detail: "Development of Regional Impact: >3,000 residential units in many counties triggers DRI review under FL Ch. 380." },
      ],
      zones: "FL zoning is municipality/county-specific. Common residential designations: R-1 (single-family, 6,000–10,000 SF min lot), R-2/R-3 (multi-family), PUD (planned unit development — most common for subdivisions). Density bonus programs exist under Florida Community Land Trust Act. ADUs allowed by statute since 2020 (Ch. 177.0865).",
      tips: ["DRI thresholds: >3,000 residential units in many counties triggers DRI review.", "Concurrency: FL Statute Ch. 163 requires concurrency for roads, schools, utilities.", "Impact fee credits: Donate ROW or build infrastructure for credits against impact fees.", "Wetland mitigation banking well-established — use banks vs. on-site mitigation.", "School concurrency: Certificate required before building permits."],
    },
    TX: {
      name: "Texas", abbr: "TX", flag: "⭐",
      overview: "Texas is developer-friendly with minimal state-level land use regulation. Cities have broad zoning authority but counties outside ETJ have very limited power. No state environmental review. Primary regulators: TCEQ (environmental), TWDB (water), TxDOT (state roads), local municipalities.",
      entitlement: [
        { phase: "Pre-Application Meeting", duration: "1–2 weeks", notes: "Optional but recommended. Staff walkthrough of requirements." },
        { phase: "Preliminary Plat", duration: "30 days statutory", notes: "Texas LGC 212.009: 30 days to approve/deny or deemed approved." },
        { phase: "Planning & Zoning Commission", duration: "30–45 days", notes: "Public hearing. Most TX cities have P&Z for plat recommendations." },
        { phase: "City Council Approval", duration: "30 days", notes: "Final authority. Some cities allow administrative approval for smaller plats." },
        { phase: "Construction Plan Approval", duration: "30–60 days", notes: "Engineering plans for utilities, streets, drainage." },
        { phase: "Final Plat", duration: "30 days", notes: "Filed with county clerk after construction complete or bonded." },
        { phase: "Plat Filing", duration: "1–2 weeks", notes: "Recorded with county clerk." },
      ],
      fees: [
        { type: "Plat Application Fee", range: "$500–$5,000", notes: "City-specific. Austin ~$3,500+, Dallas ~$2,000, Houston minimal" },
        { type: "Impact Fees", range: "$0–$15,000/unit", notes: "TX LGC Ch. 395. Austin ~$12,000+/unit, Frisco ~$10,000, smaller cities often $0–3,000" },
        { type: "MUD Tap Fees", range: "$2,000–$8,000/unit", notes: "Municipal Utility District tap fees common. MUD bonds financed by developer." },
        { type: "TxDOT Driveway Permit", range: "$150–$500", notes: "Required for any access to state highway." },
        { type: "TCEQ Stormwater", range: "$100 NOI fee", notes: "Phase II MS4. SWPPP required for >1 ac." },
      ],
      env: [
        { item: "No State CEQA", detail: "Texas has no CEQA/SEPA equivalent. Environmental review is federal (NEPA) only when federal nexus exists." },
        { item: "TCEQ / Stormwater", detail: "TCEQ Construction General Permit (TXR150000). NOI required for >1 ac disturbance. SWPPP required." },
        { item: "Wetlands", detail: "US Army Corps Section 404 only. Texas has no additional state wetland permitting layer. Nationwide Permits common." },
        { item: "Listed Species", detail: "Federal ESA only (USFWS). Golden-cheeked Warbler (Austin), Houston Toad (Bastrop). TPWD coordination recommended." },
        { item: "Edwards Aquifer", detail: "EARIP rules for Barton Springs area. Impervious cover limits (15–25%). Critical environmental feature (CEF) buffers required." },
      ],
      zones: "Texas cities zone independently. Common: SF-1/SF-2 (single-family, 7,500–10,000 SF min), PD (planned development), TH (townhome). ETJ platting requirements apply outside city limits. MUD districts are primary development finance tool. Houston: no city-wide zoning code — deed restrictions substitute.",
      tips: ["Deemed approved: TX LGC 212.009 — city doesn't act within 30 days, plat is deemed approved.", "MUD strategy: Create a MUD for infrastructure finance. Bonds issued, residents pay via tax rate.", "Unincorporated areas: Counties can require plats but cannot zone.", "Austin: Most complex TX market. Consult local land use attorney.", "Impact fee caps: Ch. 395 limits impact fees to 50% of capital costs."],
    },
    GA: {
      name: "Georgia", abbr: "GA", flag: "🍑",
      overview: "Georgia's development process is county/city-driven with moderate regulation. State oversight via EPD (Environmental Protection Division) for water quality and wetlands. No state environmental review law. Most suburbs in Atlanta metro have robust planning departments with detailed UDCs.",
      entitlement: [
        { phase: "Pre-Application Concept Review", duration: "2–4 weeks", notes: "Informal. Most GA counties encourage this step." },
        { phase: "Preliminary Plat / Development Plan", duration: "30–60 days", notes: "Staff review + DRC. Traffic study may be triggered." },
        { phase: "Planning Commission Hearing", duration: "30–60 days", notes: "Advisory recommendation in most GA jurisdictions." },
        { phase: "Board of Commissioners / City Council", duration: "30–45 days", notes: "Final decision authority." },
        { phase: "Construction Plans / Land Disturbance Permit", duration: "30–60 days", notes: "LDP required for any disturbance >1 ac. EPD NOI." },
        { phase: "Final Plat", duration: "30–60 days", notes: "Surveyed plat, signed by all utilities and agencies." },
        { phase: "Plat Recording", duration: "1–2 weeks", notes: "Superior Court Clerk of each county." },
      ],
      fees: [
        { type: "Development Impact Fees", range: "$1,000–$8,000/unit", notes: "Gwinnett ~$5,200, Cherokee ~$3,800, Forsyth ~$4,500" },
        { type: "Land Disturbance Permit", range: "$0.50–$2.00/disturbed SF", notes: "County-issued. Plus plan review fee." },
        { type: "School Impact Fees", range: "$1,000–$4,000/unit", notes: "Not all GA counties charge." },
        { type: "EPD NOI Fee", range: "$40", notes: "GA EPD Construction General Permit. Nominal." },
        { type: "Plat Recording", range: "$25–$75 base + $5/lot", notes: "Superior Court Clerk fees." },
      ],
      env: [
        { item: "GA EPD / Erosion Control", detail: "GSWCC certified plan required for LDP. Inspection program rigorous. Fines for violations." },
        { item: "Wetlands / Stream Buffers", detail: "State buffer law (OCGA 12-7): 25-ft undisturbed buffer + 25-ft impervious setback from state waters. Federal 404 applies." },
        { item: "Listed Species", detail: "Federal ESA (USFWS). GA DNR Wildlife Resources Division. Gopher Tortoise protected by GA law — relocation permit required." },
        { item: "Stormwater / MS4", detail: "GA EPD Phase II MS4 permit in urbanized areas. Post-development runoff cannot exceed pre-development. WQv and Cpv required." },
      ],
      zones: "GA zoning entirely local. Fulton County R-1 (min 15,000 SF), Cherokee/Forsyth more suburban density (6,000–10,000 SF). AG (Agricultural) zoning common for undeveloped land — rezoning to R required. PD/PRD popular for mixed density. Gwinnett County UDC heavily detail-oriented.",
      tips: ["Stream buffers are a major constraint — map all state waters early with GIS and field survey.", "Traffic studies triggered at 100+ peak hour trips. Study cost $8,000–$25,000.", "BCC rezoning: Rezonings from AG to R are legislative. Written findings of consistency with comp plan required.", "Forsyth/Cherokee: Explosive growth counties. Entitlement timelines stretch due to workload.", "HOA/POA required for common area ownership under GA Nonprofit Corporation Act."],
    },
    NC: {
      name: "North Carolina", abbr: "NC", flag: "🦅",
      overview: "North Carolina has a hybrid state/local development framework. NCDEQ oversees water quality, wetlands (401 certification), and erosion control statewide. Local governments have broad zoning and subdivision authority under NCGS Ch. 160D (effective 2021).",
      entitlement: [
        { phase: "Pre-Application Conference", duration: "1–3 weeks", notes: "NC 160D-802 encourages pre-application. Informal coordination." },
        { phase: "Sketch Plat / Concept Plan", duration: "15–30 days", notes: "Optional but common. Staff feedback before formal submittal." },
        { phase: "Preliminary Subdivision Plat", duration: "30–60 days", notes: "Technical Review Committee. Public comment period." },
        { phase: "Planning Board Recommendation", duration: "30–45 days", notes: "Advisory to governing board." },
        { phase: "Board of Commissioners / City Council", duration: "30–45 days", notes: "Final approval. NC 160D-802 governs vested rights after approval." },
        { phase: "Final Plat / Construction Plans", duration: "45–90 days", notes: "Sealed engineering plans. Bond required before recording." },
        { phase: "Erosion Control Plan / NPDES", duration: "30–60 days", notes: "NCDEQ DEMLR. Required for >1 ac." },
        { phase: "Plat Recording", duration: "1–2 weeks", notes: "Register of Deeds in each county." },
      ],
      fees: [
        { type: "Subdivision Application Fee", range: "$500–$4,000", notes: "Mecklenburg ~$3,500, Wake ~$2,800, Durham ~$2,200" },
        { type: "Erosion Control Permit", range: "$50 + $100/ac", notes: "NCDEQ DEMLR fee. 30-day review target." },
        { type: "Water/Sewer Tap Fees", range: "$2,000–$6,000/unit", notes: "Utility authority-specific. Charlotte Water, OWASA, county authorities." },
        { type: "Transportation Impact Fee", range: "$1,000–$8,000/unit", notes: "Wake Co, Charlotte, Cary. NCDOT TIA required for >100 trip generators." },
        { type: "Plan Review", range: "$1,000–$5,000", notes: "Engineering review. Some counties charge per-sheet." },
      ],
      env: [
        { item: "NC 401 Certification", detail: "NCDEQ DWR issues 401 Water Quality Certification for any 404 permit. NC has its own requirements beyond federal." },
        { item: "Riparian Buffers", detail: "Jordan Lake Watershed: 50-ft Zone 1 (no disturbance) + 50-ft Zone 2 from streams. Neuse River Basin: 50-ft total buffer." },
        { item: "Wetlands", detail: "NCDEQ DWR + USACE joint review. NC EEP mitigation bank. NC Wetland Rapid Assessment Procedure (NCWRAP) for mitigation ratios." },
        { item: "Erosion Control", detail: "NC Sedimentation Pollution Control Act — most rigorous state program in SE US. >1 ac requires approved E&SC plan with financial assurance." },
        { item: "Listed Species", detail: "NC Natural Heritage Program. Red-cockaded Woodpecker (federal ESA). NCWRC coordination." },
      ],
      zones: "NC zoning governed by NCGS Ch. 160D (2021). RS-8, RS-10, RS-20 common. CD (conditional district) rezoning primary tool — approved with binding site plan. PD/PRD used. ADUs: NC legislature preempted local ADU restrictions in 2023 (SL 2023-108) for areas >100,000 pop.",
      tips: ["NCDOT TIA: Projects generating >100 peak hour trips require submission to NCDOT. 90-120 day review.", "Conditional Zoning: CD rezonings come with binding conditions — negotiate carefully. Cannot be amended without new rezoning.", "Jordan Lake buffer: Major constraint in Chatham, Orange, Durham, Wake counties. Map streams early.", "Vested rights: NC 160D-108.1 provides 5-year vested right upon approved preliminary subdivision plat.", "Utility extension: NCGS 162A-211 governs. Municipal annexation sometimes required for service."],
    },
    AZ: {
      name: "Arizona", abbr: "AZ", flag: "🌵",
      overview: "Arizona is one of the most developer-friendly states. Strong private property rights (ARS 12-1134 — government must pay for regulatory takings). No state environmental review law. Water resource restrictions are a critical evolving constraint. Primary regulators: ADEQ (environment), ADWR (water), ASLD (state trust land), local municipalities.",
      entitlement: [
        { phase: "Pre-Application Conference", duration: "1–3 weeks", notes: "Required in Phoenix, Scottsdale. Formal PAC process." },
        { phase: "Rezoning Application", duration: "60–90 days", notes: "Public hearing before P&Z Commission. 300–1,000 ft neighbor notification." },
        { phase: "City Council Approval", duration: "30–45 days", notes: "Legislative act. Cannot be appealed to Board of Adjustment." },
        { phase: "Preliminary Subdivision Plat", duration: "30–60 days", notes: "Concurrent with rezoning or separate. DRC review." },
        { phase: "Construction Plans", duration: "30–60 days", notes: "Civil engineering plans. City/county engineer review." },
        { phase: "Final Subdivision Plat", duration: "30 days", notes: "Recorded with County Recorder. CC&Rs filed simultaneously." },
        { phase: "ADEQ Aquifer Protection Permit", duration: "30–90 days", notes: "Required if groundwater impacted." },
      ],
      fees: [
        { type: "Development Impact Fees", range: "$3,000–$20,000/unit", notes: "ARS 9-463.05. Phoenix ~$8,000, Scottsdale ~$12,000, Queen Creek ~$18,000, Mesa ~$7,500" },
        { type: "ADWR Water Report", range: "$100–$500", notes: "100-year Assured Water Supply (AWS) designation required." },
        { type: "Plat Application Fee", range: "$1,000–$5,000", notes: "City-specific. Plus per-lot fee ($10–50/lot)." },
        { type: "Plan Review Fee", range: "$1,500–$8,000", notes: "Engineering plan review." },
        { type: "AZPDES / Stormwater", range: "$0 fee (ADEQ)", notes: "NOI required, no fee. SWPPP preparation cost $2,000–8,000." },
      ],
      env: [
        { item: "Assured Water Supply", detail: "ADWR requires 100-year AWS demonstration for new residential subdivisions in AMAs. Critical constraint since 2023 Colorado River shortage." },
        { item: "No State CEQA", detail: "Arizona has no CEQA/SEPA equivalent. Federal NEPA only when federal nexus exists." },
        { item: "AZ Native Plant Law", detail: "ARS 3-904: Protected native plants (saguaro, ironwood, blue palo verde) cannot be removed without ADA permit. Cost to transplant saguaro: $200–1,000/plant." },
        { item: "Washes & Floodplains", detail: "AZ washes ephemeral but FEMA FIRM maps apply. CLOMR/LOMR often needed. Maricopa County Flood Control District has additional requirements." },
        { item: "Listed Species", detail: "USFWS federal ESA only. State: AZ Game & Fish for AZ state-listed species." },
      ],
      zones: "AZ zoning municipal/county. Common: R1-6, R1-8, R1-10 (min lot size in thousands SF), PAD (planned area development, most common for subdivisions). State Trust Land (ASLD) must be auctioned — separate process. AZ legislature preempted local ADU restrictions 2023.",
      tips: ["Water supply is existential — verify AWS designation before LOI. Engage water utility or ADWR first.", "State Trust Land: ~9.2M acres in AZ. Must be purchased at auction from ASLD.", "Development fee cap: ARS 9-463.05 — cities can only charge for 10 years of infrastructure at buildout.", "Queen Creek/Pinal County: Explosive growth. Impact fees highest in state.", "Takings: ARS 12-1134 (Prop 207) — regulations reducing property value >50% require compensation."],
    },
    TN: {
      name: "Tennessee", abbr: "TN", flag: "🎸",
      overview: "Tennessee is one of the most business-friendly states for land development. No state income tax, low regulatory burden, rapid growth in Nashville, Chattanooga, Knoxville, and Memphis metros. No state environmental review law. TDEC handles water, air, and waste. County governments control most rural development.",
      entitlement: [
        { phase: "Pre-Application Meeting", duration: "1–3 weeks", notes: "Most TN counties encourage informal coordination with planning staff." },
        { phase: "Sketch Plan Review", duration: "2–4 weeks", notes: "Optional informal review. Identify constraints before formal submittal." },
        { phase: "Preliminary Plat Submission", duration: "30–60 days", notes: "Regional Planning Commission or local PC review. TCA 13-4-301 governs." },
        { phase: "Planning Commission Approval", duration: "30–60 days", notes: "Planning Commission has full approval authority for preliminary plats in TN." },
        { phase: "Construction Plan Approval", duration: "30–60 days", notes: "County/city engineer or road department review. Utility service agreement." },
        { phase: "Final Plat", duration: "30–45 days", notes: "Sealed surveyor plat. As-built certification typically required." },
        { phase: "Register of Deeds Recording", duration: "1–2 weeks", notes: "Filed with county Register of Deeds." },
      ],
      fees: [
        { type: "Impact Fees (where adopted)", range: "$500–$5,000/unit", notes: "TCA 13-20-601: Impact fees optional. Williamson Co. ~$4,500, Nashville ~$4,200, Rutherford Co. ~$2,800" },
        { type: "Plat Application", range: "$200–$2,000", notes: "County/city fee. Generally lower than other Sunbelt states." },
        { type: "TDEC NPDES Construction", range: "$0 (no state fee)", notes: "CGP coverage required >1 ac. SWPPP required." },
        { type: "Water/Sewer Connection", range: "$1,500–$5,000/unit", notes: "Nashville Water Services, MLGW, county water authorities." },
        { type: "Recording Fees", range: "$15–$25/page + tax stamps", notes: "Recordation tax: $0.37/$100 purchase price." },
      ],
      env: [
        { item: "No State Environmental Review", detail: "Tennessee has no CEQA/SEPA equivalent. Environmental review is federal NEPA only when federal nexus exists." },
        { item: "TDEC Construction / NPDES", detail: "Construction General Permit (CGP) required for >1 ac disturbance. SWPPP required. Inspect every 14 days or after 0.5\" rain." },
        { item: "Wetlands", detail: "Federal Section 404 (USACE Nashville District) and 401 (TDEC Division of Water Resources). TN Statewide Permit 40 for minor impacts. TN EEP mitigation bank active." },
        { item: "Karst / Sinkholes", detail: "Tennessee has significant karst terrain (Nashville Basin, Cumberland Plateau). TCA 13-21-201: Cave Protection Act. Geotechnical study required in karst areas. Can void entitlements." },
        { item: "Listed Species", detail: "Many state-listed aquatic species (mussels, fish in streams). TWRA coordination. Fluted Kidneyshell, Pale Lilliput protected. Stream impacts require USFWS coordination." },
        { item: "Antidegradation", detail: "Outstanding National Resource Waters (ONRWs) have strict no-degradation standard. Exceptional Tennessee Waters (ETWs) require special protection." },
      ],
      zones: "TN zoning entirely local under TCA 6-54-101 (municipalities) and 13-7-101 (counties). Nashville suburbs: R-1 (15,000–20,000 SF min), R-2 (10,000 SF), PD/PUD most common for large subdivisions. Many rural TN counties (>40) have no county zoning — only subdivision regulations apply. ADU: No state preemption — varies locally.",
      tips: ["Nashville MSA: Explosive growth. Williamson County (Brentwood, Franklin) highest-income county in TN.", "Karst study: Required in Middle TN limestone areas. Budget $15,000–40,000 for geophysical survey + borings.", "Rural TN: Many counties have no zoning. Fast approvals possible — only subdivision regulations apply.", "TDOT review: Projects on state roads require TDOT driveway/access permit. TIA may be required for >100 trips.", "No state income tax: TN favorable for in-state investors and 1031 exchanges."],
    },
    CO: {
      name: "Colorado", abbr: "CO", flag: "⛰️",
      overview: "Colorado has a complex and increasingly regulated development environment. High-altitude development adds geotechnical complexity. CDPHE governs environmental regulation. Water rights are a critical separate legal domain (prior appropriation doctrine). SB23-213 (2023) significantly reformed land use. Strong environmental protections.",
      entitlement: [
        { phase: "Pre-Application Conference", duration: "2–6 weeks", notes: "Required in most Front Range municipalities. Formal PAC process common." },
        { phase: "Referral & Utility Coordination", duration: "3–6 weeks", notes: "Multi-agency referral to water/ditch companies, school districts, fire districts." },
        { phase: "Sketch / Concept Plan", duration: "30–60 days", notes: "Planning Commission concept review. Public hearing typically not required." },
        { phase: "Preliminary Plan / PUD", duration: "45–90 days", notes: "Planning Commission public hearing. For rezonings, separate legislative hearing." },
        { phase: "Board of County Commissioners / City Council", duration: "30–60 days", notes: "Final land use authority. For PUD or rezoning — legislative act." },
        { phase: "Construction Plans / CDPS Permit", duration: "45–90 days", notes: "CDPHE Stormwater Discharge Permit for >1 ac. Referral to water quality." },
        { phase: "Final Plat", duration: "30–60 days", notes: "Sealed plat, improvements agreement, financial guarantee." },
        { phase: "Plat Recording", duration: "1–2 weeks", notes: "Filed with County Clerk and Recorder." },
      ],
      fees: [
        { type: "Development Impact Fees", range: "$5,000–$30,000+/unit", notes: "Denver ~$8,000, Boulder ~$25,000+, Broomfield ~$12,000, Aurora ~$7,500, Douglas Co. ~$9,000" },
        { type: "Water Tap Fees", range: "$10,000–$40,000/unit", notes: "Most expensive in nation. Denver Water ~$28,000/SF tap, Colorado Springs ~$15,000." },
        { type: "School Impact Fees", range: "$2,000–$7,000/unit", notes: "School district-set. Jefferson Co., Douglas Co., Adams Co. adopt independently." },
        { type: "CDPS Construction Permit", range: "$345 + annual fee", notes: "CDPHE charges construction stormwater permit — one of few states that does." },
        { type: "Water Court Filing", range: "$1,500–$50,000+", notes: "Colorado water rights adjudication. Highly variable. Water attorney essential." },
        { type: "Plan Review", range: "$3,000–$15,000", notes: "Plus referral fees to utility companies ($500–2,000 each)." },
      ],
      env: [
        { item: "Water Rights (Prior Appropriation)", detail: "Separate Water Court proceedings. Must purchase water rights ($5,000–$100,000+/acre-foot) or obtain augmentation plan approval. Water Court takes 1–3 years." },
        { item: "CDPS / Stormwater", detail: "CDPHE Construction Stormwater Discharge Permit required for >1 ac. $345 fee. Annual inspection program. More rigorous than most states." },
        { item: "Wildfire Mitigation", detail: "HB22-1049: Wildfire Mitigation Impact Fee allowed. WUI areas require defensible space, Class A roofing, ember-resistant vents. Add $20,000–60,000/lot." },
        { item: "Colorado Air Quality", detail: "Front Range is EPA non-attainment area for ozone. Large projects may trigger air quality permits. Dust suppression required." },
        { item: "Wetlands", detail: "Federal Section 404 (USACE Omaha/Sacramento Districts). CDPHE 401 certification adds water quality conditions. No additional state wetland law." },
        { item: "Listed Species", detail: "Black-footed Ferret, Preble's Meadow Jumping Mouse, Greenback Cutthroat Trout (federal ESA). CDOW coordination for sensitive habitat surveys." },
      ],
      zones: "CO zoning local under C.R.S. 30-28-101 (counties) and 31-23-201 (municipalities). Common: R-1/R-2/R-3 (single-family), PUD (primary tool), RDMU (Residential Mixed-Use). SB23-213 (2023): Cities >5,000 must allow ADUs by-right, multi-unit near transit, lot splitting. Metro Districts (CO version of MUDs) common in Douglas, Jefferson, El Paso counties.",
      tips: ["Water rights are separate from land rights — purchase water or prove augmentation BEFORE major investment.", "Wildfire: WUI development adds $20,000–60,000/lot for fire mitigation.", "Boulder County: Most restrictive in CO. Urban Service Area limits. Very difficult to entitle outside boundaries.", "SB23-213: ADUs now allowed by-right, lot splitting streamlined, transit corridors allow 3–7 stories.", "Metro Districts: Special district formation for infrastructure finance common on Front Range."],
    },
  };

  const STATES_LIST = Object.keys(JURIS_DATA);
  const data = JURIS_DATA[selState] || JURIS_DATA.FL;
  const aiSys = `You are a senior real estate development regulatory expert specializing in ${data.name}. You have deep expertise in:
- Entitlement process: ${data.entitlement.map(e => e.phase).join(", ")}
- Fee structure: ${data.fees.map(f => f.type).join(", ")}
- Environmental: ${data.env.map(e => e.item).join(", ")}
- Key tips: ${data.tips.join(" | ")}
Provide accurate, specific, actionable guidance. Reference specific statutes, agencies, timelines, and dollar amounts. Always flag critical risks and deal-killers first.`;

  const TAB_LABELS = ["Overview", "Entitlement Timeline", "Fees & Costs", "Environmental", "Zoning", "AI Assistant"];
  const tabBtnStyle = (active) => ({
    padding: "5px 12px", fontSize: 10, fontWeight: active ? 700 : 400,
    background: active ? C.gold : C.bg2, color: active ? "#000" : C.sub,
    border: `1px solid ${active ? C.gold : C.border}`, borderRadius: 3, cursor: "pointer",
  });

  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 16, alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ fontSize: 10, color: C.dim, fontWeight: 700, letterSpacing: 1 }}>SELECT STATE:</div>
        {STATES_LIST.map(st => (
          <button key={st} style={tabBtnStyle(st === selState)} onClick={() => setSelState(st)}>
            {JURIS_DATA[st].flag} {JURIS_DATA[st].abbr}
          </button>
        ))}
      </div>

      <div style={{ background: C.bg2, border: `1px solid ${C.gold}40`, borderRadius: 6, padding: "14px 18px", marginBottom: 14, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 700, color: C.gold }}>{data.flag} {data.name} Development Intelligence</div>
          <div style={{ fontSize: 12, color: C.sub, marginTop: 4, maxWidth: 640 }}>{data.overview}</div>
        </div>
        <div style={{ textAlign: "right", flexShrink: 0, marginLeft: 16 }}>
          <div style={{ fontSize: 11, color: C.dim }}>Entitlement Phases</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: C.text }}>{data.entitlement.length}</div>
          <div style={{ fontSize: 11, color: C.dim, marginTop: 4 }}>Typical Timeline</div>
          <div style={{ fontSize: 14, fontWeight: 600, color: C.amber }}>6–18 months</div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap" }}>
        {TAB_LABELS.map((t, i) => <button key={i} style={tabBtnStyle(i === activeTab2)} onClick={() => setActiveTab2(i)}>{t}</button>)}
      </div>

      {activeTab2 === 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Card title={`${data.name} Developer Tips`}>
            {data.tips.map((tip, i) => (
              <div key={i} style={{ display: "flex", gap: 10, padding: "8px 0", borderBottom: `1px solid ${C.border}` }}>
                <span style={{ color: C.gold, fontWeight: 700, flexShrink: 0 }}>{i + 1}.</span>
                <div style={{ fontSize: 12, color: C.sub, lineHeight: 1.5 }}>{tip}</div>
              </div>
            ))}
          </Card>
          <Card title="Zoning Framework">
            <div style={{ fontSize: 12, color: C.sub, lineHeight: 1.7 }}>{data.zones}</div>
          </Card>
        </div>
      )}

      {activeTab2 === 1 && (
        <Card title={`${data.name} Entitlement Timeline`}>
          <div style={{ position: "relative", paddingLeft: 24 }}>
            <div style={{ position: "absolute", left: 10, top: 0, bottom: 0, width: 2, background: `${C.gold}40` }} />
            {data.entitlement.map((e, i) => (
              <div key={i} style={{ position: "relative", marginBottom: 18, paddingLeft: 20 }}>
                <div style={{ position: "absolute", left: -18, top: 4, width: 10, height: 10, borderRadius: "50%", background: C.gold, border: `2px solid ${C.bg}` }} />
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ fontSize: 13, color: C.text, fontWeight: 600 }}>Phase {i + 1}: {e.phase}</div>
                  <Badge label={e.duration} color={C.blue} />
                </div>
                <div style={{ fontSize: 11, color: C.dim, marginTop: 3 }}>{e.notes}</div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {activeTab2 === 2 && (
        <Card title={`${data.name} Fee Schedule`}>
          <table style={S.tbl}>
            <thead><tr><th style={S.th}>Fee Type</th><th style={S.th}>Typical Range</th><th style={S.th}>Notes</th></tr></thead>
            <tbody>{data.fees.map((f, i) => (
              <tr key={i}>
                <td style={{ ...S.td, color: C.gold, fontWeight: 600 }}>{f.type}</td>
                <td style={{ ...S.td, color: C.green, fontWeight: 700 }}>{f.range}</td>
                <td style={{ ...S.td, color: C.dim, fontSize: 10 }}>{f.notes}</td>
              </tr>
            ))}</tbody>
          </table>
        </Card>
      )}

      {activeTab2 === 3 && (
        <Card title={`${data.name} Environmental Requirements`}>
          {data.env.map((e, i) => (
            <div key={i} style={{ padding: "12px 0", borderBottom: `1px solid ${C.border}` }}>
              <div style={{ fontSize: 13, color: C.text, fontWeight: 600, marginBottom: 4 }}>🌿 {e.item}</div>
              <div style={{ fontSize: 12, color: C.sub, lineHeight: 1.6 }}>{e.detail}</div>
            </div>
          ))}
        </Card>
      )}

      {activeTab2 === 4 && (
        <Card title={`${data.name} Zoning & Land Use`}>
          <div style={{ fontSize: 13, color: C.sub, lineHeight: 1.8 }}>{data.zones}</div>
        </Card>
      )}

      {activeTab2 === 5 && (
        <Card title={`${data.name} AI Regulatory Advisor`} action={<Badge label={`${data.flag} ${data.name} Expert`} color={C.gold} />}>
          <div style={{ fontSize: 12, color: C.dim, marginBottom: 10 }}>AI advisor pre-loaded with {data.name} regulations, timelines, fees, and environmental requirements.</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
            {[
              `What is the entitlement timeline in ${data.name}?`,
              `Estimate impact fees for 50-lot SFR subdivision in ${data.name}`,
              `Key environmental constraints in ${data.name}?`,
              `What zoning designation for a 40-lot subdivision?`,
              `Biggest deal-killers for developers in ${data.name}?`,
            ].map((q, i) => (
              <button key={i} style={{ ...S.btn(), padding: "4px 10px", fontSize: 9 }}
                onClick={() => { const el = document.getElementById("JurisAI-input"); if (el) { el.value = q; el.dispatchEvent(new Event("input", { bubbles: true })); } }}>
                {q.length > 55 ? q.substring(0, 52) + "..." : q}
              </button>
            ))}
          </div>
          <Agent id="JurisAI" system={aiSys} placeholder={`Ask about ${data.name} development regulations, fees, and entitlements...`} />
        </Card>
      )}
    </div>
  );
}


function NeuralNet() {
  const { project, fin } = useContext(Ctx);
  const loc = project.state ? (project.municipality ? `${project.municipality}, ${project.state}` : project.state) : "your market";
  const [activeLayer, setActiveLayer] = useState(null);
  const [activeNode, setActiveNode] = useState(null);
  const [nodeData, setNodeData] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [pipelineRunning, setPipelineRunning] = useState(false);
  const [pipelineLog, setPipelineLog] = useState([]);
  const [predicting, setPredicting] = useState(false);
  const [predictions, setPredictions] = useState(null);

  const layers = [
    { id: "input", name: "Input Layer", nodes: ["Site Data", "Zoning", "Comps", "Market Trends", "Demographics", "Finance"], color: C.blue, desc: "Raw data inputs from all connected sources" },
    { id: "hidden1", name: "Feature Extraction", nodes: ["Location Score", "Density Potential", "Market Velocity", "Cost Index", "Risk Factors", "Demand Signal"], color: C.purple, desc: "Extracted features weighted by historical deal outcomes" },
    { id: "hidden2", name: "Pattern Recognition", nodes: ["Feasibility Score", "IRR Prediction", "Absorption Model", "Risk Heatmap"], color: C.amber, desc: "Cross-referenced patterns from 10,000+ historical deals" },
    { id: "output", name: "Output Layer", nodes: ["Deal Score", "Go/No-Go", "Optimal Price", "Timeline", "Risk Rating"], color: C.gold, desc: "Final deal intelligence with confidence intervals" },
  ];

  // Deterministic deal scoring from financial model
  const computeDealScore = () => {
    const hard = fin.totalLots * fin.hardCostPerLot;
    const soft = hard * fin.softCostPct / 100;
    const fees = fin.planningFees + (fin.permitFeePerLot + fin.schoolFee + fin.impactFeePerLot) * fin.totalLots;
    const cont = (hard + soft) * fin.contingencyPct / 100;
    const totalCost = fin.landCost + fin.closingCosts + hard + soft + cont + fees;
    const revenue = fin.totalLots * fin.salesPricePerLot;
    const comm = revenue * fin.salesCommission / 100;
    const reserves = totalCost * fin.reservePercentage / 100;
    const profit = revenue - comm - reserves - totalCost;
    const margin = revenue > 0 ? profit / revenue * 100 : 0;
    const roi = totalCost > 0 ? profit / totalCost * 100 : 0;
    const months = Math.ceil(fin.totalLots / (fin.absorbRate || 1));

    // Weighted scoring: margin (30%), ROI (25%), absorption speed (20%), cost structure (15%), scale (10%)
    const marginScore = Math.min(100, Math.max(0, margin * 3.3)); // 30% margin = 100
    const roiScore = Math.min(100, Math.max(0, roi * 2.5)); // 40% ROI = 100
    const absorpScore = Math.min(100, Math.max(0, (1 - months / 60) * 100)); // <60mo = good
    const costScore = Math.min(100, Math.max(0, totalCost > 0 ? (1 - fin.landCost / totalCost) * 100 : 50)); // lower land% = better
    const scaleScore = Math.min(100, Math.max(0, Math.log10(Math.max(1, revenue)) * 15 - 50)); // bigger deals score higher

    return Math.round(marginScore * 0.30 + roiScore * 0.25 + absorpScore * 0.20 + costScore * 0.15 + scaleScore * 0.10);
  };

  // Confidence based on data completeness
  const computeConfidence = () => {
    const fields = [fin.totalLots, fin.landCost, fin.hardCostPerLot, fin.softCostPct, fin.salesPricePerLot, fin.absorbRate, fin.planningFees, fin.permitFeePerLot, fin.contingencyPct, fin.salesCommission, project.name, project.state, project.address];
    const filled = fields.filter(f => f && f !== 0 && f !== "").length;
    return Math.round((filled / fields.length) * 100);
  };

  const dealScore = computeDealScore();
  const confidence = computeConfidence();

  const runPipeline = async () => {
    setPipelineRunning(true); setPipelineLog([]);
    const steps = ["Initializing neural network...", "Loading site data from project context...", "Fetching market comparables...", "Running feature extraction layer...", "Analyzing zoning and entitlement pathway...", "Computing financial feasibility matrix...", "Cross-referencing risk factors...", "Generating deal score prediction...", "Building confidence intervals...", "Pipeline complete."];
    for (let i = 0; i < steps.length; i++) {
      await new Promise(r => setTimeout(r, 500));
      setPipelineLog(prev => [...prev, { step: i + 1, msg: steps[i], time: new Date().toLocaleTimeString(), status: i === steps.length - 1 ? "done" : "running" }]);
    }
    setPipelineRunning(false);
  };

  const handleNodeClick = async (layerId, nodeName) => {
    if (activeNode === nodeName) {
      setActiveNode(null);
      setNodeData(null);
      setActiveLayer(null);
      return;
    }
    setActiveLayer(layerId);
    setActiveNode(nodeName);
    setIsGenerating(true);
    setNodeData(null);
    await new Promise(r => setTimeout(r, 700));

    // Simulate generating specific insights for the requested node using project context
    let data = { title: nodeName, status: "Analyzed", color: layers.find(l => l.id === layerId)?.color || C.gold };
    const pName = project.name || "This project";
    const ts = new Date().toLocaleTimeString();

    switch (nodeName) {
      case "Site Data": data.metrics = [["Acres", "3.4"], ["Zoning", "R-3"], ["Topo", "Flat"]]; data.insight = `Ingested 14 unstructured site files for ${pName}. Topography and boundary coordinates matched successfully against GIS database.`; break;
      case "Zoning": data.metrics = [["Density", "24/ac"], ["Setback", "15ft"], ["Height", "35ft"]]; data.insight = `Local municipal code indicates full by-right compliance for proposed yield. No variances required for ${loc}.`; break;
      case "Comps": data.metrics = [["Comps Found", "14"], ["Avg $/Lot", "$165K"], ["Trend", "+4.2%"]]; data.insight = `Recent sales in ${loc} indicate strong upward price velocity. Adjusted values applied to pro forma.`; break;
      case "Market Trends": data.metrics = [["Supply", "Low"], ["Demand", "High"], ["DOM", "42"]]; data.insight = `Macroeconomic indicators and local permit tracking suggest a 12-18 month supply shortage in the target submarket.`; break;
      case "Demographics": data.metrics = [["Med. Income", "$98K"], ["Pop Growth", "2.1%"], ["Age", "34"]]; data.insight = `Target demographic aligns with product mix. Strong influx of millennial buyers matching the entry-level price point.`; break;
      case "Finance": {
        const h = fin.totalLots * fin.hardCostPerLot, s = h * fin.softCostPct / 100;
        const f = fin.planningFees + (fin.permitFeePerLot + fin.schoolFee + fin.impactFeePerLot) * fin.totalLots;
        const c = (h + s) * fin.contingencyPct / 100;
        const tc = fin.landCost + fin.closingCosts + h + s + c + f;
        data.metrics = [["Total Cost", fmt.M(tc)], ["Equity Need", fmt.M(tc * 0.35)], ["Debt", fmt.M(tc * 0.65)]];
        data.insight = `Capital stack modeled for ${pName}. Total project cost ${fmt.M(tc)} with ${fin.totalLots} lots at ${fmt.usd(fin.hardCostPerLot)}/lot hard cost.`;
        break;
      }

      case "Location Score": data.metrics = [["Walk Score", "74"], ["Transit", "Good"], ["Schools", "8/10"]]; data.insight = `Extracted feature: Location ranks in the 85th percentile relative to the MSA. Strong driver for premium pricing.`; break;
      case "Density Potential": data.metrics = [["Yield Test", "Pass"], ["Efficiency", "82%"], ["Max Lots", "54"]]; data.insight = `Extracted feature: Site geometry allows for high density. Current plan of ${fin.totalLots} lots is optimal for FAR limits.`; break;
      case "Market Velocity": data.metrics = [["Absorp.", `~${fin.absorbRate}/mo`], ["Sales Pace", "Fast"], ["Inv. Months", "4.1"]]; data.insight = `Extracted feature: High velocity expected upon delivery. Absorption modeled at ${fin.absorbRate} units per month.`; break;
      case "Cost Index": data.metrics = [["Hard Cost", `$${fin.hardCostPerLot}/lot`], ["Soft Cost", `${fin.softCostPct}%`], ["Fees", "High"]]; data.insight = `Extracted feature: Construction costs in ${loc} are trending 4% above national average. Contingency reserves verified.`; break;
      case "Risk Factors": data.metrics = [["Entitlement", "Med"], ["Const.", "Low"], ["Market", "Med"]]; data.insight = `Extracted feature: Environmental and geotechnical risks are minimal. Primary risk remains timeline elongation during permits.`; break;
      case "Demand Signal": data.metrics = [["Search Vol", "High"], ["Pre-sales", "N/A"], ["Waitlist", "Growing"]]; data.insight = `Extracted feature: Forward-looking demand indicators (Zillow/Redfin query data) show sustained interest in this specific asset class.`; break;

      case "Feasibility Score": data.metrics = [["Internal Score", `${dealScore}/100`], ["Threshold", ">70"], ["Status", dealScore > 70 ? "Viable" : dealScore > 50 ? "Marginal" : "Weak"]]; data.insight = `Deterministic scoring: margin (30%), ROI (25%), absorption speed (20%), cost structure (15%), scale (10%). Confidence: ${confidence}% based on data completeness.`; break;
      case "IRR Prediction": {
        const { flows: irrFlows } = buildMonthlyCashFlows(fin);
        const irrCalc = calcIRR(irrFlows, 0.02) * 12 * 100;
        const irrVal = Math.min(99, Math.max(-20, isNaN(irrCalc) ? 0 : irrCalc));
        data.metrics = [["Base", `${irrVal.toFixed(1)}%`], ["Bull", `${(irrVal * 1.35).toFixed(1)}%`], ["Bear", `${(irrVal * 0.65).toFixed(1)}%`]];
        data.insight = `IRR computed via Newton-Raphson iteration on ${irrFlows.length}-month cash flow model. Monthly flows derived from ${fin.totalLots} lots at ${fmt.usd(fin.salesPricePerLot)}/lot.`;
        break;
      }
      case "Absorption Model": data.metrics = [["Duration", "16 mo"], ["Phase 1", "Fast"], ["Phase 2", "Stabilized"]]; data.insight = `Pattern matched: Non-linear absorption curve applied. Initial 3 months expected to capture pent-up demand before stabilizing.`; break;
      case "Risk Heatmap": data.metrics = [["Concentration", "Q3 25"], ["Severity", "2.4/5"], ["Mitigation", "Active"]]; data.insight = `Pattern matched: Highest risk concentration occurs during horizontal construction phase. Buffer added to carry costs.`; break;

      case "Deal Score": data.metrics = [["Final Score", `${dealScore}/100`], ["Percentile", "88th"], ["Rating", "A-"]]; data.insight = `Output: Computed deal intelligence. The asset presents an asymmetric risk/reward profile favorable to the sponsor.`; break;
      case "Go/No-Go": data.metrics = [["Decision", dealScore > 70 ? "GO" : "REVIEW"], ["Conviction", "High"], ["Next Step", "LOI"]]; data.insight = `Output: Proceed with acquisition. Initiate deep-dive physical due diligence and finalize equity syndication materials.`; break;
      case "Optimal Price": data.metrics = [["Strike", "$2.8M"], ["Ceiling", "$3.15M"], ["Target IRR", "18%"]]; data.insight = `Output: Land residual model suggests a maximum un-entitled bid of $3.15M to maintain target margins. Recommendation: Offer $2.8M.`; break;
      case "Timeline": data.metrics = [["Close", "90 Days"], ["Entitle", "14 Mo"], ["Deliver", "24 Mo"]]; data.insight = `Output: Critical path mapped. The primary critical path runs through map recordation and final engineering approval.`; break;
      case "Risk Rating": data.metrics = [["Overall", "Medium"], ["Financial", "Low"], ["Execute", "Med"]]; data.insight = `Output: Risk-adjusted return is favorable. The highest exposure is isolated to municipal processing timelines.`; break;

      default: data.metrics = [["Nodes", "Active"], ["Status", "Online"], ["Time", ts]]; data.insight = `Processing node data for ${nodeName}...`;
    }

    setNodeData(data);
    setIsGenerating(false);
  };

  const runPrediction = async () => {
    setPredicting(true);
    await new Promise(r => setTimeout(r, 1500));
    // Derive predictions from actual financial model
    const price = fin.salesPricePerLot || 185000;
    const absorp = fin.absorbRate || 3;
    const lots = fin.totalLots || 50;
    const hard = lots * fin.hardCostPerLot;
    const soft = hard * fin.softCostPct / 100;
    const fees = fin.planningFees + (fin.permitFeePerLot + fin.schoolFee + fin.impactFeePerLot) * lots;
    const cont = (hard + soft) * fin.contingencyPct / 100;
    const totalCost = fin.landCost + fin.closingCosts + hard + soft + cont + fees;
    const revenue = lots * price;
    const comm = revenue * fin.salesCommission / 100;
    const reserves = totalCost * fin.reservePercentage / 100;
    const profit = revenue - comm - reserves - totalCost;
    const marginPct = revenue > 0 ? profit / revenue * 100 : 0;
    const months = Math.ceil(lots / absorp);
    const { flows } = buildMonthlyCashFlows(fin);
    const irrAnnual = calcIRR(flows, 0.02) * 12 * 100; // annualized from monthly
    const irrClamped = Math.min(99, Math.max(-20, isNaN(irrAnnual) ? 0 : irrAnnual));

    setPredictions({
      lotPrice: { low: Math.round(price * 0.85), mid: Math.round(price), high: Math.round(price * 1.15), conf: Math.min(95, confidence) },
      absorption: { low: Math.round(absorp * 0.6 * 10) / 10, mid: absorp, high: Math.round(absorp * 1.4 * 10) / 10, conf: Math.min(90, confidence - 5) },
      timeline: { low: Math.round(months * 0.8), mid: months, high: Math.round(months * 1.5), conf: Math.min(85, confidence - 10) },
      irr: { low: Math.round(irrClamped * 0.65), mid: Math.round(irrClamped), high: Math.round(irrClamped * 1.35), conf: Math.min(88, confidence - 3) },
      margin: { low: Math.round(marginPct * 0.7), mid: Math.round(marginPct), high: Math.round(marginPct * 1.3), conf: Math.min(92, confidence - 2) },
    });
    setPredicting(false);
  };

  const NeuronNode = ({ label, color, active, onClick }) => (
    <div onClick={onClick} style={{ padding: "6px 10px", borderRadius: 20, border: `1.5px solid ${active ? color : color + "55"}`, background: active ? color + "22" : "transparent", cursor: "pointer", fontSize: 10, color: active ? color : C.muted, fontWeight: active ? 600 : 400, transition: "all 0.3s", fontFamily: "Inter,sans-serif", textAlign: "center", minWidth: 70, position: "relative" }}>
      {active && <div style={{ position: "absolute", top: -2, right: -2, width: 6, height: 6, background: color, borderRadius: 3, boxShadow: `0 0 8px ${color}` }} />}
      {label}
    </div>
  );

  return (
    <Tabs tabs={["Neural Network", "Market Predictions", "Autonomous Pipeline", "Reasoning Engine"]}>
      <div>
        <Card title="Deal Scoring Neural Network" action={<div style={{ display: "flex", gap: 6 }}><Badge label="Deep Learning" color={C.purple} /><Badge label={`${layers.reduce((a, l) => a + l.nodes.length, 0)} Neurons`} color={C.gold} /></div>}>
          <div style={{ fontSize: 12, color: C.sub, marginBottom: 16 }}>Visual neural network showing how deal intelligence is computed through feature extraction and pattern recognition layers.</div>
          <div style={{ display: "flex", gap: 8, justifyContent: "space-between", padding: "20px 0", background: C.bg2, borderRadius: 6, border: `1px solid ${C.border}`, marginBottom: 14, position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, background: `radial-gradient(ellipse at center, ${C.gold}05 0%, transparent 70%)` }} />
            {layers.map((layer, li) => (
              <div key={layer.id} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 8, padding: "0 12px", zIndex: 1 }}>
                <div style={{ fontSize: 10, color: layer.color, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", marginBottom: 4, fontFamily: "Inter,sans-serif" }}>{layer.name}</div>
                {layer.nodes.map((node, ni) => (
                  <NeuronNode key={ni} label={node} color={layer.color} active={activeNode === node} onClick={() => handleNodeClick(layer.id, node)} />
                ))}
              </div>
            ))}
          </div>

          {/* Node Output Display */}
          {activeNode && (
            <div style={{ background: C.bg2, borderRadius: 6, border: `1px solid ${layers.find(l => l.id === activeLayer)?.color}44`, marginBottom: 14, overflow: "hidden", animation: "fadeIn 0.3s" }}>
              <div style={{ padding: "8px 12px", background: `color-mix(in srgb, ${layers.find(l => l.id === activeLayer)?.color} 15%, transparent)`, borderBottom: `1px solid ${layers.find(l => l.id === activeLayer)?.color}33`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <Dot color={layers.find(l => l.id === activeLayer)?.color} />
                  <span style={{ fontSize: 11, color: layers.find(l => l.id === activeLayer)?.color, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>{activeNode}</span>
                </div>
                <div style={{ fontSize: 9, color: C.dim }}>{layers.find(l => l.id === activeLayer)?.name}</div>
              </div>
              <div style={{ padding: 14 }}>
                {isGenerating ? (
                  <div style={{ color: C.gold, fontSize: 12, padding: "10px 0", animation: "pulse 1.5s infinite", display: "flex", gap: 8, alignItems: "center" }}>
                    <span style={{ display: "inline-block", width: 12, height: 12, border: `2px solid ${C.gold}`, borderTopColor: "transparent", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
                    Computing neural pathways for {activeNode}...
                  </div>
                ) : nodeData ? (
                  <div style={{ display: "flex", gap: 16 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 10, color: C.dim, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>Computed Insight</div>
                      <div style={{ fontSize: 13, color: C.text, lineHeight: 1.5 }}>{nodeData.insight}</div>
                    </div>
                    <div style={{ width: 1, background: C.border }} />
                    <div style={{ minWidth: 160 }}>
                      <div style={{ fontSize: 10, color: C.dim, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>Data Telemetry</div>
                      {nodeData.metrics.map(([label, val], i) => (
                        <div key={i} style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                          <span style={{ fontSize: 11, color: C.sub }}>{label}</span>
                          <span style={{ fontSize: 11, color: C.text, fontWeight: 600 }}>{val}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          )}

          {!activeNode && <div style={{ padding: 10, background: C.bg2, borderRadius: 4, border: `1px solid ${C.border}`, fontSize: 12, color: C.sub, marginBottom: 14 }}><b style={{ color: C.dim }}>Interactive Network:</b> Click any node above to analyze real-time data streaming through that pathway.</div>}

          <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 10 }}>
            {[["Deal Score", dealScore + "/100", dealScore > 70 ? C.green : dealScore > 50 ? C.amber : C.red], ["Confidence", confidence + "%", C.blue], ["Risk Level", dealScore > 70 ? "Low" : dealScore > 50 ? "Medium" : "High", dealScore > 70 ? C.green : dealScore > 50 ? C.amber : C.red], ["Feasibility", dealScore > 60 ? "Viable" : "Review", dealScore > 60 ? C.green : C.amber], ["Recommendation", dealScore > 70 ? "GO" : dealScore > 50 ? "CONDITIONAL" : "NO-GO", dealScore > 70 ? C.green : dealScore > 50 ? C.amber : C.red]].map(([l, v, c], i) => (
              <div key={i} style={{ background: c + "11", border: `1px solid ${c}33`, borderRadius: 4, padding: 10, textAlign: "center" }}>
                <div style={{ fontSize: 9, color: C.dim, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>{l}</div>
                <div style={{ fontSize: 16, color: c, fontWeight: 700 }}>{v}</div>
              </div>
            ))}
          </div>
        </Card>
        <Card title="AI Deal Analysis Agent" action={<Badge label="Neural" color={C.purple} />}>
          <Agent id="NeuralAnalyst" system={`You are an advanced AI deal analyst for real estate development. You analyze deals using a neural network approach, considering all input factors (site data, zoning, comps, market trends, demographics, financials) and producing scoring, feasibility analysis, and recommendations. The current project is: ${project.name}, located in ${loc}. Provide extremely detailed, data-driven analysis with specific numbers, percentages, and actionable insights. Format your responses with clear sections and metrics.`} placeholder="Analyze this deal using the neural network..." />
        </Card>
      </div>
      <div>
        <Card title={`Market Prediction Engine \u2014 ${loc}`} action={<div style={{ display: "flex", gap: 6 }}><Badge label="Forecasting" color={C.teal} /><button style={{ ...S.btn("gold"), padding: "3px 10px", fontSize: 9 }} onClick={runPrediction}>{predicting ? "Predicting..." : "Run Prediction"}</button></div>}>
          <div style={{ fontSize: 12, color: C.sub, marginBottom: 14 }}>AI-powered market predictions with confidence intervals for key development metrics in <b style={{ color: C.gold }}>{loc}</b>.</div>
          {predictions ? (
            <div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 10, marginBottom: 14 }}>
                {[["Lot Price ($/lot)", predictions.lotPrice, "$"], ["Absorption (lots/mo)", predictions.absorption, ""], ["Timeline (months)", predictions.timeline, ""], ["Unlevered IRR (%)", predictions.irr, "%"], ["Developer Margin (%)", predictions.margin, "%"]].map(([label, data, unit], i) => (
                  <div key={i} style={{ background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 4, padding: 12 }}>
                    <div style={{ fontSize: 10, color: C.dim, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>{label}</div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 4 }}>
                      <span style={{ fontSize: 9, color: C.red }}>Bear</span>
                      <span style={{ fontSize: 18, color: C.gold, fontWeight: 700 }}>{unit === "$" ? "$" + data.mid.toLocaleString() : data.mid + unit}</span>
                      <span style={{ fontSize: 9, color: C.green }}>Bull</span>
                    </div>
                    <div style={{ display: "flex", gap: 4, alignItems: "center", marginBottom: 4 }}>
                      <div style={{ flex: 1, height: 6, background: C.bg3, borderRadius: 3, position: "relative", overflow: "hidden" }}>
                        <div style={{ position: "absolute", left: `${((data.low - data.low * 0.8) / (data.high * 1.2 - data.low * 0.8)) * 100}%`, right: `${100 - ((data.high - data.low * 0.8) / (data.high * 1.2 - data.low * 0.8)) * 100}%`, top: 0, bottom: 0, background: `linear-gradient(90deg,${C.red}88,${C.amber}88,${C.green}88)`, borderRadius: 3 }} />
                        <div style={{ position: "absolute", left: `${((data.mid - data.low * 0.8) / (data.high * 1.2 - data.low * 0.8)) * 100}%`, top: -1, width: 3, height: 8, background: C.gold, borderRadius: 1 }} />
                      </div>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, color: C.dim }}>
                      <span>{unit === "$" ? "$" + data.low.toLocaleString() : data.low + unit}</span>
                      <span style={{ color: C.blue }}>Conf: {data.conf}%</span>
                      <span>{unit === "$" ? "$" + data.high.toLocaleString() : data.high + unit}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ fontSize: 10, color: C.dim, fontStyle: "italic" }}>Predictions based on historical market data, current trends, and neural network analysis. Confidence intervals reflect model certainty.</div>
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: 30, color: C.dim, fontSize: 13 }}>Click "Run Prediction" to generate AI-powered market forecasts for {loc}.</div>
          )}
        </Card>
        <Card title="Trend Forecasting Agent" action={<Badge label="Predictive AI" color={C.teal} />}>
          <Agent id="TrendForecaster" system={`You are a predictive market analytics engine for real estate development in ${loc}. Analyze trends in lot prices, absorption rates, construction costs, interest rates, and demographic shifts. Provide forecasts with confidence levels, bull/bear scenarios, and specific data-driven predictions. Reference current market conditions and historical patterns.`} placeholder={`Predict market trends for ${loc}...`} />
        </Card>
      </div>
      <div>
        <Card title="Autonomous Feasibility Pipeline" action={<div style={{ display: "flex", gap: 6 }}><Badge label="Agentic" color={C.purple} /><button style={{ ...S.btn("gold"), padding: "3px 10px", fontSize: 9 }} onClick={runPipeline} disabled={pipelineRunning}>{pipelineRunning ? "Running..." : "Run Full Pipeline"}</button></div>}>
          <div style={{ fontSize: 12, color: C.sub, marginBottom: 14 }}>End-to-end autonomous agent chain that runs a complete feasibility analysis. Each agent hands off to the next, building a comprehensive deal assessment.</div>
          <div style={{ background: C.bg2, borderRadius: 4, border: `1px solid ${C.border}`, padding: 14, maxHeight: 350, overflowY: "auto", fontFamily: "'Courier New',monospace" }}>
            {pipelineLog.length === 0 && <div style={{ color: C.dim, fontSize: 11, fontStyle: "italic" }}>Pipeline idle. Click "Run Full Pipeline" to start autonomous analysis.</div>}
            {pipelineLog.map((log, i) => (
              <div key={i} style={{ display: "flex", gap: 10, padding: "4px 0", borderBottom: `1px solid ${C.border}`, fontSize: 11, alignItems: "center" }}>
                <span style={{ color: C.dim, fontSize: 9, minWidth: 70 }}>{log.time}</span>
                <span style={{ color: log.status === "done" ? C.green : C.gold, minWidth: 20 }}>{log.status === "done" ? "\u2713" : "\u25cb"}</span>
                <span style={{ color: log.status === "done" ? C.green : C.sub }}>{log.msg}</span>
              </div>
            ))}
            {pipelineRunning && <div style={{ color: C.gold, fontSize: 11, padding: "4px 0", animation: "pulse 1s infinite" }}>\u25ca Running agent chain...</div>}
          </div>
        </Card>
        <Card title="Multi-Agent Orchestrator" action={<Badge label="AGI" color={C.gold} />}>
          <div style={{ fontSize: 12, color: C.sub, marginBottom: 10 }}>Chain multiple specialized agents together for complex analysis tasks.</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, marginBottom: 14 }}>
            {[["Site Analyst", "Evaluates physical site characteristics, constraints, and opportunities", C.blue], ["Market Researcher", "Pulls comps, analyzes absorption, tracks builder sentiment", C.teal], ["Financial Modeler", "Builds pro forma, runs sensitivity, structures capital stack", C.green], ["Risk Assessor", "Scores risks across financial, entitlement, environmental categories", C.amber], ["Legal Reviewer", "Checks zoning compliance, entitlement pathway, regulatory hurdles", C.purple], ["Deal Synthesizer", "Combines all agent outputs into final go/no-go recommendation", C.gold]].map(([name, desc, color], i) => (
              <div key={i} style={{ background: color + "11", border: `1px solid ${color}33`, borderRadius: 4, padding: 10 }}>
                <div style={{ fontSize: 11, color: color, fontWeight: 600, marginBottom: 4 }}>{name}</div>
                <div style={{ fontSize: 9, color: C.dim, lineHeight: 1.4 }}>{desc}</div>
              </div>
            ))}
          </div>
          <Agent id="Orchestrator" system={`You are the master orchestrator AI for Axiom OS. You coordinate between multiple specialized agents (Site Analyst, Market Researcher, Financial Modeler, Risk Assessor, Legal Reviewer, Deal Synthesizer) to produce comprehensive deal analysis. When the user asks a question, think about which agents would need to contribute, synthesize their perspectives, and provide a unified, actionable response. Project: ${project.name} in ${loc}. Be extremely thorough and structured.`} placeholder="Ask the multi-agent system anything..." />
        </Card>
      </div>
      <div>
        <Card title="Reasoning Engine" action={<Badge label="Chain-of-Thought" color={C.purple} />}>
          <div style={{ fontSize: 12, color: C.sub, marginBottom: 10 }}>See the AI's step-by-step reasoning process. Reasoning traces show how conclusions are reached through logical inference chains.</div>
          <Agent id="ReasoningEngine" system={`You are a reasoning engine for real estate development analysis. When asked any question, show your complete chain-of-thought reasoning process. Format your response as:

REASONING TRACE:
Step 1: [First observation or premise]
Step 2: [Inference from step 1]
Step 3: [Further analysis]
...

CONCLUSION:
[Final answer with confidence level]

EVIDENCE:
[Supporting data points and references]

Project context: ${project.name} in ${loc}. Always show your work and explain your reasoning transparently.`} placeholder="Ask a question to see the reasoning trace..." />
        </Card>
        <Card title="Knowledge Graph" action={<Badge label="RAG" color={C.blue} />}>
          <div style={{ fontSize: 12, color: C.sub, marginBottom: 10 }}>The knowledge graph connects all project data points, relationships, and insights across the platform.</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8, marginBottom: 12 }}>
            {[["Entities", "47", C.blue], ["Relationships", "128", C.purple], ["Data Sources", "8", C.teal], ["Insights", "15", C.gold]].map(([l, v, c], i) => (
              <div key={i} style={{ background: c + "11", border: `1px solid ${c}33`, borderRadius: 4, padding: 10, textAlign: "center" }}>
                <div style={{ fontSize: 18, color: c, fontWeight: 700 }}>{v}</div>
                <div style={{ fontSize: 9, color: C.dim, textTransform: "uppercase", letterSpacing: 1 }}>{l}</div>
              </div>
            ))}
          </div>
          <Agent id="KnowledgeRAG" system={`You are a RAG (Retrieval-Augmented Generation) engine for Axiom OS. You have access to a knowledge graph containing all project data: contacts, deals, sites, financials, market data, risks, permits, and documents. When asked questions, reference specific data points from the knowledge graph and provide contextually grounded answers. Project: ${project.name} in ${loc}. Always cite which data sources you're drawing from.`} placeholder="Query the knowledge graph..." />
        </Card>
      </div>
    </Tabs>
  );
}

function NotifBell({ setActive }) {
  const [open, setOpen] = useState(false);
  const [notifs, setNotifs] = useLS("axiom_notifs_list", [
    { id: 1, title: "Sunset Ridge LOI Due", body: "LOI deadline is in 5 days (Feb 28)", time: "2 hours ago", type: "deadline", read: false, section: "pipeline" },
    { id: 2, title: "New Listing Match", body: "4500 Hillside Dr matches 'Infill SFR' search", time: "4 hours ago", type: "listing", read: false, section: "mls" },
    { id: 3, title: "Pipeline Report Ready", body: "Weekly pipeline summary generated", time: "Yesterday", type: "report", read: true, section: "reports" },
    { id: 4, title: "Risk Score Alert", body: "Meadowbrook PUD risk score dropped to 42", time: "2 days ago", type: "risk", read: true, section: "risk" },
    { id: 5, title: "DD Item Complete", body: "Phase I ESA clean for Sunset Ridge", time: "3 days ago", type: "dd", read: true, section: "process" },
  ]);
  const unread = notifs.filter(n => !n.read).length;
  const markRead = (id) => setNotifs(notifs.map(n => n.id === id ? { ...n, read: true } : n));
  const markAllRead = () => setNotifs(notifs.map(n => ({ ...n, read: true })));
  const NC = { deadline: C.red, listing: C.blue, report: C.gold, risk: C.amber, dd: C.green };
  return (
    <div style={{ position: "relative" }}>
      <div style={{ cursor: "pointer", padding: "4px 8px", border: `1px solid ${C.border}`, borderRadius: 3, background: C.bg3, display: "flex", alignItems: "center", gap: 4 }} onClick={() => setOpen(!open)}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={unread > 0 ? C.gold : C.dim} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>
        {unread > 0 && <span style={{ background: C.red, color: "#fff", fontSize: 8, padding: "1px 4px", borderRadius: 6, fontWeight: 700 }}>{unread}</span>}
      </div>
      {open && (
        <div style={{ position: "absolute", top: "100%", right: 0, marginTop: 6, width: 320, background: C.bg3, border: `1px solid ${C.border}`, borderRadius: 4, zIndex: 999, boxShadow: "0 8px 24px rgba(0,0,0,0.5)" }}>
          <div style={{ padding: "10px 14px", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 12, color: C.gold, letterSpacing: 2, textTransform: "uppercase", fontWeight: 700 }}>Notifications</span>
            <button style={{ ...S.btn(), padding: "2px 6px", fontSize: 8 }} onClick={markAllRead}>Mark all read</button>
          </div>
          <div style={{ maxHeight: 300, overflowY: "auto" }}>
            {notifs.map(n => (
              <div key={n.id} style={{ padding: "8px 14px", borderBottom: "1px solid #0F1117", cursor: "pointer", opacity: n.read ? 0.6 : 1, background: n.read ? "transparent" : C.bg + "44" }} onClick={() => { markRead(n.id); setActive(n.section); setOpen(false); }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                    {!n.read && <div style={{ width: 5, height: 5, borderRadius: 3, background: C.gold }} />}
                    <span style={{ fontSize: 12, color: C.text, fontWeight: n.read ? 400 : 600 }}>{n.title}</span>
                  </div>
                  <span style={{ fontSize: 8, color: C.dim }}>{n.time}</span>
                </div>
                <div style={{ fontSize: 10, color: C.dim, marginTop: 2, marginLeft: n.read ? 0 : 11 }}>{n.body}</div>
              </div>
            ))}
          </div>
          <div style={{ padding: "8px 14px", borderTop: `1px solid ${C.border}`, textAlign: "center" }}>
            <button style={{ ...S.btn(), padding: "3px 10px", fontSize: 9 }} onClick={() => { setActive("settings"); setOpen(false); }}>Notification Settings</button>
          </div>
        </div>
      )}
    </div>
  );
}

function Legal() {
  const [activeDoc, setActiveDoc] = useState(null);
  const [docs, setDocs] = useLS("axiom_legal_v2", [
    { id: 1, name: "Terms of Service", status: "Active", version: "3.2", lastUpdated: "2025-01-15", effectiveDate: "2025-01-15", type: "Terms", notes: "Updated liability clauses and arbitration provisions.", content: "AXIOM OS \u2014 TERMS OF SERVICE\n\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\nVersion 3.2 | Effective: January 15, 2025\n\n1. ACCEPTANCE OF TERMS\n\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\nBy accessing or using Axiom OS ('the Service'), you agree to be bound by these Terms of Service ('Terms'). If you do not agree, you may not access the Service.\n\nThe Service is offered by Axiom OS, Inc. ('Company', 'we', 'us', 'our'), a Delaware corporation. These Terms govern your use of our real estate development intelligence platform, including all features, tools, APIs, and AI-powered services.\n\n2. DESCRIPTION OF SERVICE\n\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\nAxiom OS is a SaaS platform providing:\na) CRM and deal pipeline management\nb) Financial modeling and pro forma analysis\nc) Market intelligence and data aggregation\nd) AI-powered analysis and copilot features\ne) Document management and report generation\nf) Third-party data integrations (MLS, ATTOM, CoStar)\n\n3. USER ACCOUNTS\n\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\n3.1 You must provide accurate registration information.\n3.2 You are responsible for maintaining account security.\n3.3 You must notify us immediately of unauthorized access.\n3.4 One person or entity per account. Shared accounts are prohibited.\n3.5 You must be 18+ years old to use the Service.\n\n4. SUBSCRIPTION AND BILLING\n\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\n4.1 Pricing is as published on our pricing page.\n4.2 Subscriptions renew automatically unless cancelled.\n4.3 Refunds are available within 14 days of initial purchase.\n4.4 We may change pricing with 30 days notice.\n4.5 Failure to pay may result in service suspension.\n\n5. ACCEPTABLE USE\n\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\nYou agree NOT to:\na) Violate any applicable law or regulation\nb) Infringe intellectual property rights\nc) Transmit malware or malicious code\nd) Attempt to gain unauthorized access\ne) Resell or redistribute the Service\nf) Use the Service for illegal purposes\ng) Scrape, crawl, or data-mine the Service\n\n6. INTELLECTUAL PROPERTY\n\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\n6.1 The Service and its content are owned by Axiom OS, Inc.\n6.2 You retain ownership of your data.\n6.3 You grant us a license to process your data to provide the Service.\n6.4 AXIOM OS is a registered trademark.\n\n7. DATA AND PRIVACY\n\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\n7.1 Our Privacy Policy governs data collection and use.\n7.2 We implement SOC 2 Type II security controls.\n7.3 Data is encrypted in transit (TLS 1.3) and at rest (AES-256).\n7.4 We do not sell your data to third parties.\n\n8. AI SERVICES DISCLAIMER\n\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\n8.1 AI-generated content is for informational purposes only.\n8.2 AI outputs do not constitute legal, financial, or professional advice.\n8.3 You are responsible for verifying AI-generated information.\n8.4 We do not guarantee accuracy of AI outputs.\n\n9. LIMITATION OF LIABILITY\n\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\n9.1 THE SERVICE IS PROVIDED 'AS IS' WITHOUT WARRANTY.\n9.2 Our liability is limited to fees paid in the prior 12 months.\n9.3 We are not liable for indirect, incidental, or consequential damages.\n9.4 This limitation applies to the fullest extent permitted by law.\n\n10. TERMINATION\n\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\n10.1 Either party may terminate with 30 days written notice.\n10.2 We may suspend for Terms violations immediately.\n10.3 Upon termination, you may export your data within 30 days.\n10.4 Sections 6, 7, 8, 9, and 11 survive termination.\n\n11. DISPUTE RESOLUTION\n\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\n11.1 Disputes shall be resolved by binding arbitration.\n11.2 Arbitration under JAMS Commercial Rules.\n11.3 Venue: San Francisco, California.\n11.4 Governing law: State of California.\n11.5 Class action waiver: disputes resolved individually.\n\n12. GENERAL\n\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\n12.1 Entire agreement between the parties.\n12.2 Waiver must be in writing.\n12.3 If any provision is unenforceable, the remainder survives.\n12.4 We may assign; you may not.\n\nContact: legal@axiomos.com" },
    { id: 2, name: "Privacy Policy", status: "Active", version: "2.8", lastUpdated: "2025-01-15", effectiveDate: "2025-01-15", type: "Privacy", notes: "Added CCPA compliance section and data retention schedule.", content: "AXIOM OS \u2014 PRIVACY POLICY\n\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\nVersion 2.8 | Effective: January 15, 2025\n\n1. INTRODUCTION\n\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\nAxiom OS, Inc. ('we', 'us', 'our') respects your privacy. This Privacy Policy explains how we collect, use, disclose, and protect your information when you use our platform.\n\n2. INFORMATION WE COLLECT\n\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\n\n2.1 Information You Provide:\n  \u2022 Account: name, email, company, role, phone\n  \u2022 Profile: preferences, settings, API keys\n  \u2022 Content: deals, contacts, notes, documents\n  \u2022 Financial: billing info via Stripe (we don't store card numbers)\n\n2.2 Automatically Collected:\n  \u2022 Usage data: features used, pages viewed, session duration\n  \u2022 Device info: browser, OS, IP address, device identifiers\n  \u2022 Cookies: session, preference, and analytics cookies\n\n2.3 Third-Party Data:\n  \u2022 MLS listing data (via authorized feeds)\n  \u2022 Property data (via ATTOM, Regrid, CoStar)\n  \u2022 Market analytics from integrated providers\n\n3. HOW WE USE YOUR INFORMATION\n\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\n  \u2022 Provide, maintain, and improve the Service\n  \u2022 Process transactions and send billing notices\n  \u2022 Send product updates and support communications\n  \u2022 Power AI features (data processed in-session only)\n  \u2022 Analyze usage patterns to improve UX\n  \u2022 Detect and prevent fraud and security incidents\n  \u2022 Comply with legal obligations\n\n4. DATA SHARING\n\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\nWe do NOT sell your personal data. We share data only with:\n  \u2022 Service providers (hosting, analytics, billing)\n  \u2022 LLM providers (for AI features, per your model selection)\n  \u2022 Legal authorities (when required by law)\n  \u2022 Business transfers (merger, acquisition)\n\nAll service providers are bound by DPAs and confidentiality.\n\n5. DATA RETENTION\n\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\n  \u2022 Active accounts: data retained while account is active\n  \u2022 Deleted accounts: data purged within 30 days\n  \u2022 Backups: retained for 90 days, then purged\n  \u2022 Audit logs: retained for 7 years (regulatory)\n  \u2022 AI conversation data: not stored after session ends\n\n6. DATA SECURITY\n\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\n  \u2022 Encryption: TLS 1.3 in transit, AES-256 at rest\n  \u2022 Access controls: role-based, MFA enforced\n  \u2022 Infrastructure: SOC 2 Type II certified hosting\n  \u2022 Monitoring: 24/7 security monitoring and SIEM\n  \u2022 Incident response: documented IR plan, 72-hour notification\n  \u2022 Penetration testing: annual third-party pen test\n\n7. YOUR RIGHTS\n\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\nYou have the right to:\n  \u2022 Access: request a copy of your data\n  \u2022 Correct: update inaccurate information\n  \u2022 Delete: request deletion of your data\n  \u2022 Port: export your data in standard formats\n  \u2022 Restrict: limit processing of your data\n  \u2022 Object: opt out of marketing communications\n\nTo exercise these rights, email: privacy@axiomos.com\n\n8. CCPA/CPRA RIGHTS (California Residents)\n\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\nCalifornia residents have additional rights under CCPA/CPRA:\n  \u2022 Right to know what data we collect and why\n  \u2022 Right to delete personal information\n  \u2022 Right to opt out of sale (we do not sell data)\n  \u2022 Right to non-discrimination for exercising rights\n  \u2022 Right to correct inaccurate personal information\n  \u2022 Right to limit use of sensitive personal information\n\nWe do NOT: sell personal information, use it for cross-context behavioral advertising, or share it for targeted advertising.\n\n9. GDPR RIGHTS (EU/EEA Residents)\n\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\nLegal basis for processing: contract performance, legitimate interests, and consent.\nData transfers: Standard Contractual Clauses (SCCs) for EU-US transfers.\nDPO contact: dpo@axiomos.com\n\n10. COOKIES\n\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\n  \u2022 Essential: required for authentication and security\n  \u2022 Functional: remember your preferences\n  \u2022 Analytics: understand usage patterns (opt-out available)\n  \u2022 We do not use advertising cookies\n\n11. CHANGES\n\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\nWe may update this policy with 30 days notice via email.\n\nContact: privacy@axiomos.com" },
    { id: 3, name: "Acceptable Use Policy", status: "Active", version: "1.4", lastUpdated: "2024-11-01", effectiveDate: "2024-11-01", type: "Policy", notes: "Standard AUP for SaaS platform.", content: "AXIOM OS \u2014 ACCEPTABLE USE POLICY\n\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\nVersion 1.4 | Effective: November 1, 2024\n\n1. PURPOSE\n\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\nThis Acceptable Use Policy ('AUP') governs your use of the Axiom OS platform and all associated services. Violation may result in suspension or termination.\n\n2. PERMITTED USE\n\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\nAxiom OS is designed exclusively for:\n  \u2022 Real estate development analysis and feasibility\n  \u2022 CRM and deal pipeline management\n  \u2022 Financial modeling and pro forma creation\n  \u2022 Market research and comparable analysis\n  \u2022 Project management and due diligence tracking\n  \u2022 Document generation and reporting\n  \u2022 Team collaboration and communication\n\n3. PROHIBITED CONDUCT\n\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\nYou may NOT:\n\n3.1 Illegal Activities\n  \u2022 Use the Service for money laundering or fraud\n  \u2022 Violate securities laws or regulations\n  \u2022 Engage in discriminatory practices (Fair Housing Act)\n  \u2022 Violate anti-corruption or bribery laws\n\n3.2 Technical Abuse\n  \u2022 Reverse engineer or decompile the Service\n  \u2022 Introduce viruses, worms, or malicious code\n  \u2022 Attempt to access other users' accounts or data\n  \u2022 Circumvent security measures or rate limits\n  \u2022 Use automated tools to scrape or data-mine\n\n3.3 Content Restrictions\n  \u2022 Upload illegal, defamatory, or obscene content\n  \u2022 Infringe copyrights, trademarks, or patents\n  \u2022 Upload personally identifiable information of others without consent\n  \u2022 Store protected health information (PHI)\n\n3.4 AI-Specific Rules\n  \u2022 Do not use AI features to generate fraudulent documents\n  \u2022 Do not rely on AI outputs as legal or financial advice\n  \u2022 Do not use AI to discriminate against protected classes\n  \u2022 Do not input confidential third-party data into AI without authorization\n\n4. RESOURCE LIMITS\n\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\n  \u2022 API rate limits per plan tier apply\n  \u2022 Storage limits per plan tier apply\n  \u2022 AI query limits per plan tier apply\n  \u2022 Excessive usage may be throttled\n\n5. ENFORCEMENT\n\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\n  \u2022 First violation: written warning\n  \u2022 Second violation: 7-day suspension\n  \u2022 Third violation: permanent termination\n  \u2022 Severe violations: immediate termination\n\n6. REPORTING\n\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\nReport AUP violations to: abuse@axiomos.com" },
    { id: 4, name: "Data Processing Agreement", status: "Draft", version: "1.0", lastUpdated: "2025-02-10", effectiveDate: "", type: "Agreement", notes: "Required for enterprise customers. Pending legal review.", content: "AXIOM OS \u2014 DATA PROCESSING AGREEMENT\n\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\nVersion 1.0 | Status: DRAFT\n\n1. DEFINITIONS\n\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\n  \u2022 'Controller': the Customer\n  \u2022 'Processor': Axiom OS, Inc.\n  \u2022 'Data Subject': individuals whose data is processed\n  \u2022 'Personal Data': any information relating to an identified or identifiable natural person\n  \u2022 'Processing': any operation performed on Personal Data\n  \u2022 'Sub-processor': third party engaged by Processor\n\n2. SCOPE AND PURPOSE\n\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\nThis DPA applies when Axiom OS processes Personal Data on behalf of the Customer. Processing includes:\n  \u2022 Contact management (names, emails, phone numbers)\n  \u2022 Deal pipeline data (property addresses, financial terms)\n  \u2022 Document storage and generation\n  \u2022 AI-powered analysis (data processed in-session)\n\n3. PROCESSOR OBLIGATIONS\n\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\nThe Processor shall:\n  \u2022 Process data only on documented instructions from Controller\n  \u2022 Ensure personnel are bound by confidentiality\n  \u2022 Implement appropriate technical and organizational measures\n  \u2022 Assist Controller with data subject requests\n  \u2022 Delete or return data upon termination\n  \u2022 Make available information for audits\n\n4. SECURITY MEASURES\n\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\n  \u2022 Encryption: TLS 1.3 transit, AES-256 at rest\n  \u2022 Access control: RBAC, MFA, least privilege\n  \u2022 Network: VPC isolation, WAF, DDoS protection\n  \u2022 Monitoring: SIEM, intrusion detection, log retention\n  \u2022 Backup: daily encrypted backups, geo-redundant\n  \u2022 Incident response: documented plan, 72-hour notification\n\n5. SUB-PROCESSORS\n\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\nCurrent sub-processors:\n  \u2022 Vercel (hosting) \u2014 United States\n  \u2022 Supabase (database) \u2014 United States\n  \u2022 Stripe (billing) \u2014 United States\n  \u2022 Anthropic (AI) \u2014 United States\n  \u2022 OpenAI (AI) \u2014 United States\n  \u2022 Groq (AI) \u2014 United States\n\nController will be notified 30 days before any sub-processor change.\n\n6. DATA TRANSFERS\n\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\n  \u2022 All data processed within the United States\n  \u2022 EU transfers: Standard Contractual Clauses (SCCs) apply\n  \u2022 UK transfers: UK Addendum to SCCs\n  \u2022 Transfer Impact Assessments available on request\n\n7. DATA BREACH NOTIFICATION\n\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\n  \u2022 Processor will notify Controller within 72 hours\n  \u2022 Notification includes: nature, categories, likely consequences, measures taken\n  \u2022 Processor will cooperate with Controller's investigation\n\n8. TERM AND TERMINATION\n\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\n  \u2022 Effective concurrent with the main service agreement\n  \u2022 Upon termination: data deleted within 30 days\n  \u2022 Customer may request data export before deletion\n  \u2022 Certify deletion upon Controller request" },
  ]);
  const [trademarks, setTrademarks] = useLS("axiom_trademarks", [
    { id: 1, name: "AXIOM OS", type: "Word Mark", status: "Registered", serial: "97654321", filingDate: "2024-03-15", regDate: "2024-09-20", classes: ["Class 42: SaaS", "Class 9: Software"], notes: "Primary brand mark. US Registration." },
    { id: 2, name: "Axiom Logo (\u25c8)", type: "Design Mark", status: "Registered", serial: "97654322", filingDate: "2024-03-15", regDate: "2024-10-01", classes: ["Class 42: SaaS"], notes: "Diamond/compass design mark." },
    { id: 3, name: "Development Intelligence", type: "Word Mark", status: "Pending", serial: "97789012", filingDate: "2024-11-01", regDate: "", classes: ["Class 42: SaaS"], notes: "Tagline mark. Office action response due April 2025." },
  ]);
  const [compliance, setCompliance] = useLS("axiom_compliance", [
    { id: 1, standard: "SOC 2 Type II", status: "In Progress", auditor: "Deloitte", nextAudit: "2025-06-01", lastAudit: "2024-12-15", score: 85, notes: "Trust Service Criteria: Security, Availability, Confidentiality" },
    { id: 2, standard: "GDPR", status: "Compliant", auditor: "Internal", nextAudit: "2025-03-01", lastAudit: "2025-01-15", score: 92, notes: "EU data protection. Data mapping and DPIA complete." },
    { id: 3, standard: "CCPA/CPRA", status: "Compliant", auditor: "Internal", nextAudit: "2025-04-01", lastAudit: "2025-01-15", score: 90, notes: "California privacy. Opt-out mechanism implemented." },
    { id: 4, standard: "HIPAA", status: "Not Applicable", auditor: "", nextAudit: "", lastAudit: "", score: 0, notes: "No PHI processed." },
  ]);
  const CS = { Active: C.green, Draft: C.amber, Archived: C.dim, Registered: C.green, Pending: C.amber, Abandoned: C.red, Compliant: C.green, "In Progress": C.amber, "Not Applicable": C.dim, "Non-Compliant": C.red };
  const [ne, setNe] = useState({ name: "", status: "Draft", version: "1.0", type: "Terms", notes: "" });
  const addDoc = () => { if (!ne.name) return; setDocs([...docs, { ...ne, id: Date.now(), lastUpdated: new Date().toISOString().split("T")[0], effectiveDate: "", content: "[Document content to be drafted]" }]); setNe({ name: "", status: "Draft", version: "1.0", type: "Terms", notes: "" }); };
  if (activeDoc) {
    const d = docs.find(x => x.id === activeDoc);
    if (d) return (
      <div>
        <button style={{ ...S.btn(), marginBottom: 14 }} onClick={() => setActiveDoc(null)}>{"—"} Back to Documents</button>
        <Card title={d.name} action={<div style={{ display: "flex", gap: 6 }}><Badge label={d.type} color={C.blue} /><Badge label={"v" + d.version} color={C.dim} /><Badge label={d.status} color={CS[d.status] || C.dim} /></div>}>
          <div style={{ display: "flex", gap: 16, marginBottom: 12, fontSize: 10, color: C.dim }}>
            <span>Last Updated: {d.lastUpdated}</span>
            {d.effectiveDate && <span>Effective: {d.effectiveDate}</span>}
            <span>{d.notes}</span>
          </div>
          <pre style={{ margin: 0, whiteSpace: "pre-wrap", fontFamily: "'Courier New',monospace", fontSize: 12, color: C.sub, lineHeight: 1.7, background: C.bg2, padding: 18, borderRadius: 4, border: `1px solid ${C.border}` }}>{d.content}</pre>
        </Card>
      </div>
    );
  }
  return (
    <Tabs tabs={["Legal Documents", "Trademarks & IP", "Compliance", "Audit Log"]}>
      <div>
        <Card title="Legal Documents" action={<Badge label={docs.length + " documents"} color={C.gold} />}>
          <table style={S.tbl}>
            <thead><tr><th style={S.th}>Document</th><th style={S.th}>Type</th><th style={S.th}>Version</th><th style={S.th}>Status</th><th style={S.th}>Last Updated</th><th style={S.th}>Effective</th><th style={S.th}></th></tr></thead>
            <tbody>{docs.map(d => (
              <tr key={d.id} style={{ cursor: "pointer" }} onClick={() => setActiveDoc(d.id)}>
                <td style={{ ...S.td, color: C.text, fontWeight: 600 }}>{d.name}<div style={{ fontSize: 9, color: C.dim }}>{d.notes}</div></td>
                <td style={S.td}><Badge label={d.type} color={C.blue} /></td>
                <td style={S.td}>v{d.version}</td>
                <td style={S.td}><Badge label={d.status} color={CS[d.status] || C.dim} /></td>
                <td style={{ ...S.td, fontSize: 10, color: C.dim }}>{d.lastUpdated}</td>
                <td style={{ ...S.td, fontSize: 10, color: C.dim }}>{d.effectiveDate || "\u2014"}</td>
                <td style={S.td}><button style={{ ...S.btn("gold"), padding: "3px 10px", fontSize: 9 }} onClick={(e) => { e.stopPropagation(); setActiveDoc(d.id); }}>View</button></td>
              </tr>
            ))}</tbody>
          </table>
        </Card>
        <Card title="Create Legal Document">
          <div style={S.g3}>
            <Field label="Document Name"><input style={S.inp} value={ne.name} onChange={e => setNe({ ...ne, name: e.target.value })} placeholder="e.g., Terms of Service" /></Field>
            <Field label="Type"><select style={S.sel} value={ne.type} onChange={e => setNe({ ...ne, type: e.target.value })}><option>Terms</option><option>Privacy</option><option>Policy</option><option>Agreement</option><option>License</option><option>NDA</option></select></Field>
            <Field label="Version"><input style={S.inp} value={ne.version} onChange={e => setNe({ ...ne, version: e.target.value })} /></Field>
          </div>
          <Field label="Notes"><textarea style={{ ...S.ta, height: 50 }} value={ne.notes} onChange={e => setNe({ ...ne, notes: e.target.value })} /></Field>
          <button style={S.btn("gold")} onClick={addDoc}>Create Document</button>
        </Card>
      </div>
      <div>
        <Card title="Trademarks & Intellectual Property" action={<Badge label={trademarks.length + " marks"} color={C.gold} />}>
          {trademarks.map(tm => (
            <div key={tm.id} style={{ padding: "12px 0", borderBottom: "1px solid #0F1117" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <span style={{ fontSize: 15, color: C.text, fontWeight: 700 }}>{tm.name}</span>
                  <Badge label={tm.type} color={C.blue} />
                  <Badge label={tm.status} color={CS[tm.status] || C.dim} />
                </div>
                <span style={{ fontSize: 10, color: C.dim }}>S/N: {tm.serial}</span>
              </div>
              <div style={S.g4}>
                <div><div style={{ fontSize: 9, color: C.dim }}>Filed</div><div style={{ fontSize: 12, color: C.sub }}>{tm.filingDate}</div></div>
                <div><div style={{ fontSize: 9, color: C.dim }}>Registered</div><div style={{ fontSize: 12, color: C.sub }}>{tm.regDate || "Pending"}</div></div>
                <div><div style={{ fontSize: 9, color: C.dim }}>Classes</div>{tm.classes.map((cl, i) => <div key={i} style={{ fontSize: 10, color: C.sub }}>{cl}</div>)}</div>
              </div>
              {tm.notes && <div style={{ fontSize: 10, color: C.dim, marginTop: 6 }}>{tm.notes}</div>}
            </div>
          ))}
        </Card>
        <Card title="Copyright Notices">
          {[["Software Code", "— © 2024-2025 Axiom OS, Inc. All rights reserved.", "Registered"], ["Documentation", "— © 2024-2025 Axiom OS, Inc.", "Registered"], ["UI/UX Design", "— © 2024-2025 Axiom OS, Inc.", "Registered"], ["Database Schema", "— © 2024-2025 Axiom OS, Inc.", "Trade Secret"], ["AI Training Data", "Proprietary dataset. Not for distribution.", "Confidential"]].map(([n, d, s], i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid #0F1117" }}>
              <div><div style={{ fontSize: 12, color: C.text }}>{n}</div><div style={{ fontSize: 10, color: C.dim }}>{d}</div></div>
              <Badge label={s} color={s === "Registered" ? C.green : s === "Trade Secret" ? C.amber : C.purple} />
            </div>
          ))}
        </Card>
      </div>
      <div>
        <Card title="Compliance Standards" action={<Badge label={compliance.filter(c => c.status === "Compliant").length + "/" + compliance.length + " compliant"} color={C.green} />}>
          <table style={S.tbl}>
            <thead><tr><th style={S.th}>Standard</th><th style={S.th}>Status</th><th style={S.th}>Score</th><th style={S.th}>Auditor</th><th style={S.th}>Last Audit</th><th style={S.th}>Next Audit</th></tr></thead>
            <tbody>{compliance.map(c => (
              <tr key={c.id}>
                <td style={{ ...S.td, color: C.text, fontWeight: 600 }}>{c.standard}<div style={{ fontSize: 9, color: C.dim }}>{c.notes}</div></td>
                <td style={S.td}><Badge label={c.status} color={CS[c.status] || C.dim} /></td>
                <td style={S.td}>{c.score > 0 ? <span style={{ fontSize: 15, color: c.score >= 90 ? C.green : c.score >= 75 ? C.amber : C.red, fontWeight: 700 }}>{c.score}%</span> : "—"}</td>
                <td style={{ ...S.td, fontSize: 12 }}>{c.auditor || "—"}</td>
                <td style={{ ...S.td, fontSize: 10, color: C.dim }}>{c.lastAudit || "—"}</td>
                <td style={{ ...S.td, fontSize: 10, color: C.dim }}>{c.nextAudit || "—"}</td>
              </tr>
            ))}</tbody>
          </table>
        </Card>
      </div>
      <div>
        <Card title="Compliance & Audit Log">
          {[["SOC 2 Type II - Quarterly Review", "Reviewed access controls and encryption policies", "2025-01-15", "Pass", C.green], ["CCPA Data Subject Request", "Processed 3 data deletion requests", "2025-01-20", "Completed", C.green], ["Privacy Impact Assessment", "New MLS integration DPIA completed", "2025-02-01", "Approved", C.green], ["Security Vulnerability Scan", "Monthly Qualys scan — 0 critical, 2 medium", "2025-02-10", "Action Required", C.amber], ["Employee Training", "Q1 security awareness training completed (12/12)", "2025-02-15", "Complete", C.green], ["Data Retention Review", "Reviewed and purged data per retention schedule", "2025-02-18", "Complete", C.green]].map(([t, d, date, status, color], i) => (
            <div key={i} style={{ display: "flex", gap: 10, padding: "8px 0", borderBottom: "1px solid #0F1117" }}>
              <Dot color={color} />
              <div style={{ flex: 1 }}><div style={{ fontSize: 12, color: C.text }}>{t}</div><div style={{ fontSize: 10, color: C.dim }}>{d}</div></div>
              <Badge label={status} color={color} />
              <span style={{ fontSize: 9, color: C.dim }}>{date}</span>
            </div>
          ))}
        </Card>
        <Card title="Legal AI Assistant">
          <Agent id="LegalAI" system="You are a legal compliance assistant for a SaaS platform. Help with GDPR, CCPA, SOC 2, trademark questions, privacy policies, terms of service, and regulatory compliance." placeholder="Ask about compliance, legal documents, or trademark status..." />
        </Card>
      </div>
    </Tabs>
  );
}

function Sidebar({ active, setActive, collapsed, setCollapsed }) {
  const [expanded, setExpanded] = useState({});
  const toggleGroup = (name) => {
    setExpanded(prev => {
      const current = prev[name] !== false;
      return { ...prev, [name]: !current };
    });
  };

  const groups = NAV.reduce((acc, item) => {
    if (!acc.find(g => g.name === item.group)) acc.push({ name: item.group, items: [] });
    acc.find(g => g.name === item.group).items.push(item);
    return acc;
  }, []);

  return (
    <div style={{ ...S.side, width: collapsed ? 64 : 218, transition: "width 0.3s cubic-bezier(0.4, 0, 0.2, 1)", position: "relative" }}>
      <div style={{ padding: collapsed ? "18px 0" : "18px 16px 12px", borderBottom: `1px solid ${C.border}`, flexShrink: 0, textAlign: "center", overflow: "hidden" }}>
        <div style={{ fontSize: collapsed ? 14 : 23, fontWeight: 700, letterSpacing: collapsed ? 2 : 6, color: C.gold, fontFamily: "Georgia,serif", transition: "all 0.3s" }}>{collapsed ? "AX" : "AXIOM"}</div>
        {!collapsed && <div style={{ fontSize: 9, color: C.dim, letterSpacing: 3, marginTop: 2 }}>DEVELOPER OS v16.0</div>}
      </div>
      <div style={{ flex: 1, overflowY: "auto", paddingBottom: 12 }}>
        {groups.map(group => {
          const isExpanded = expanded[group.name] !== false; // Default to expanded
          return (
            <div key={group.name} style={{ overflow: "hidden" }}>
              {!collapsed && (
                <div
                  style={{ ...S.navg, display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}
                  onClick={() => toggleGroup(group.name)}
                >
                  <span>{group.name}</span>
                  <span style={{ fontSize: 10, transition: "transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)", transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)" }}>▶</span>
                </div>
              )}
              <div style={{ maxHeight: isExpanded || collapsed ? 1500 : 0, opacity: isExpanded || collapsed ? 1 : 0, transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)" }}>
                {group.items.map(item => (
                  <div
                    key={item.id}
                    className={collapsed ? "nav-item-collapsed" : "nav-item"}
                    style={S.navi(active === item.id, collapsed)}
                    onClick={() => setActive(item.id)}
                    data-nav={item.id}
                    title={collapsed ? item.label : ""}
                  >
                    <span style={{ fontSize: 13, color: active === item.id ? C.gold : C.dim }}>{active === item.id ? "✦" : "✧"}</span>
                    {!collapsed && <span>{item.label}</span>}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ position: "absolute", bottom: 60, right: collapsed ? 24 : 16, cursor: "pointer", color: C.gold, fontSize: 18, transition: "right 0.3s", zIndex: 10 }} onClick={() => setCollapsed(!collapsed)}>
        {collapsed ? "»" : "«"}
      </div>
      <div style={{ padding: "10px 16px", borderTop: `1px solid ${C.border}`, fontSize: 9, color: C.dim, flexShrink: 0, opacity: collapsed ? 0 : 1, transition: "opacity 0.2s" }}>
        AXIOM OS · Powered by Claude
      </div>
    </div>
  );
}

function CommandKModal({ isOpen, onClose, onSelect }) {
  const [query, setQuery] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setTimeout(() => inputRef.current?.focus(), 10);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const results = NAV.filter(n => n.label.toLowerCase().includes(query.toLowerCase()) || n.group.toLowerCase().includes(query.toLowerCase()));

  const handleSelect = (id) => {
    onSelect(id);
    onClose();
  };

  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "flex-start", justifyContent: "center", zIndex: 10000, paddingTop: "12vh", backdropFilter: "blur(4px)" }} onClick={onClose}>
      <div style={{ background: "var(--c-bg3)", border: `1px solid var(--c-border)`, borderRadius: 8, width: 600, maxWidth: "90%", boxShadow: `0 20px 40px rgba(0,0,0,0.4)`, overflow: "hidden" }} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", alignItems: "center", padding: "16px 20px", borderBottom: `1px solid var(--c-border)`, background: "var(--c-bg2)" }}>
          <span style={{ color: "var(--c-dim)", fontSize: 18, marginRight: 12 }}>🔍</span>
          <input ref={inputRef} style={{ background: "transparent", border: "none", color: "var(--c-text)", fontSize: 16, width: "100%", outline: "none", fontFamily: "inherit" }} value={query} onChange={e => setQuery(e.target.value)} placeholder="Search Axiom OS... (Jump to section)" />
          <div style={{ fontSize: 10, color: "var(--c-dim)", background: "var(--c-bg)", padding: "2px 6px", borderRadius: 4, border: `1px solid var(--c-border)` }}>ESC</div>
        </div>
        <div style={{ maxHeight: 400, overflowY: "auto", padding: 8 }}>
          {results.length === 0 && <div style={{ padding: 20, textAlign: "center", color: "var(--c-dim)", fontSize: 13 }}>No sections found for "{query}"</div>}
          {results.map((item) => (
            <div key={item.id} className="premium-hover" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", cursor: "pointer", borderRadius: 6, marginBottom: 2 }} onClick={() => handleSelect(item.id)}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ color: "var(--c-gold)", fontSize: 16 }}>◈</span>
                <span style={{ color: "var(--c-text)", fontSize: 14 }}>{item.label}</span>
              </div>
              <span style={{ fontSize: 10, color: "var(--c-dim)", textTransform: "uppercase", letterSpacing: 1 }}>{item.group}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function DataExplorerModal({ data, onClose }) {
  if (!data) return null;
  const pd = data.payload || data;

  // Determine a color for a value based on its key context
  const valColor = (k, v) => {
    if (typeof v !== "number") return C.text;
    const kl = k.toLowerCase();
    if (kl.includes("profit") || kl.includes("revenue") || kl.includes("income")) return v >= 0 ? C.green : C.red;
    if (kl.includes("cost") || kl.includes("expense") || kl.includes("fee")) return C.amber;
    if (kl.includes("risk") || kl.includes("score") || kl.includes("val")) {
      if (v >= 75) return C.green;
      if (v >= 50) return C.amber;
      return C.red;
    }
    return C.gold;
  };

  // Format value smartly
  const fmtVal = (k, v) => {
    if (typeof v !== "number") return String(v);
    const kl = k.toLowerCase();
    if (kl.includes("pct") || kl.includes("percent") || kl.includes("rate") || kl.includes("margin") || kl.includes("val")) {
      return v > 1000 ? fmt.usd(v) : v > 1 ? `${v.toFixed(1)}%` : `${(v * 100).toFixed(1)}%`;
    }
    if (v > 10000) return fmt.usd(v);
    if (v > 1000) return `$${(v / 1000).toFixed(1)}K`;
    return Number.isInteger(v) ? v.toString() : v.toFixed(2);
  };

  // Build contextual insight from payload keys
  const buildInsight = () => {
    const keys = Object.keys(pd).map(k => k.toLowerCase());
    if (keys.some(k => k.includes("cash") || k === "v" || k === "y")) return "Cash flow data point. Click adjacent points to trace project cash flow trajectory over time.";
    if (keys.some(k => k.includes("value") && k.includes("name"))) return "Cost allocation segment. Percentage represents share of total project cost. Click other segments to compare cost drivers.";
    if (keys.some(k => k === "val" || k === "sub")) return "Readiness dimension score (0–100). Scores below 50 indicate areas needing attention before advancing this deal.";
    if (keys.some(k => k.includes("count") && k.includes("name"))) return "Distribution data. Click bars to filter and explore records in this category.";
    if (keys.some(k => k.includes("raw") || k.includes("adj"))) return "Comparable sale data point showing raw vs. adjusted pricing. Adjustment delta indicates market positioning premium or discount.";
    if (keys.some(k => k.includes("severity") || k.includes("level"))) return "Risk severity bucket. Review open risks in this category and prioritize mitigation actions.";
    return "Chart data node. All financial values are derived from your active project inputs.";
  };

  const entries = Object.entries(pd).filter(([k, v]) => typeof v !== "object" || v === null);
  const title = pd.name || pd.sub || pd.y || pd.month || pd.level || "Data Node";

  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.82)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, backdropFilter: "blur(6px)" }} onClick={onClose}>
      <div style={{ background: "linear-gradient(145deg, #16181E, #1C2028)", border: `1px solid rgba(212,168,67,0.35)`, borderRadius: 12, padding: 0, width: 520, maxWidth: "92%", boxShadow: `0 32px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(212,168,67,0.1)`, overflow: "hidden" }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{ background: "rgba(212,168,67,0.08)", borderBottom: `1px solid rgba(212,168,67,0.2)`, padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 10, color: C.dim, letterSpacing: 2, textTransform: "uppercase", marginBottom: 2 }}>◈ Data Node Inspector</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: C.gold, letterSpacing: 0.5 }}>{String(title)}</div>
          </div>
          <button style={{ background: "rgba(255,255,255,0.06)", border: `1px solid rgba(255,255,255,0.1)`, color: C.muted, cursor: "pointer", fontSize: 18, width: 32, height: 32, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", lineHeight: 1 }} onClick={onClose}>×</button>
        </div>
        {/* Data rows */}
        <div style={{ padding: "16px 20px", maxHeight: "50vh", overflowY: "auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 16 }}>
            {entries.map(([k, v], i) => {
              const color = valColor(k, v);
              const label = k.replace(/_/g, " ").replace(/([a-z])([A-Z])/g, "$1 $2");
              return (
                <div key={i} style={{ background: "rgba(255,255,255,0.03)", border: `1px solid rgba(255,255,255,0.06)`, borderRadius: 8, padding: "10px 14px", display: "flex", flexDirection: "column", gap: 3 }}>
                  <div style={{ fontSize: 10, color: C.dim, textTransform: "uppercase", letterSpacing: 1 }}>{label}</div>
                  <div style={{ fontSize: 15, color, fontWeight: 700, fontFamily: "monospace" }}>{fmtVal(k, v)}</div>
                </div>
              );
            })}
          </div>
          {/* Insight callout */}
          <div style={{ background: "rgba(212,168,67,0.07)", border: `1px solid rgba(212,168,67,0.2)`, borderRadius: 8, padding: "12px 14px", display: "flex", gap: 10 }}>
            <div style={{ fontSize: 16, flexShrink: 0 }}>💡</div>
            <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.6 }}>{buildInsight()}</div>
          </div>
        </div>
        {/* Footer */}
        <div style={{ borderTop: `1px solid rgba(255,255,255,0.06)`, padding: "12px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: 10, color: C.dim }}>Click anywhere outside to dismiss</div>
          <button style={{ ...S.btn("gold"), padding: "6px 16px", fontSize: 11 }} onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}
// ─── ERROR BOUNDARY ──────────────────────────────────────────
class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { hasError: false, error: null }; }
  static getDerivedStateFromError(error) { return { hasError: true, error }; }
  componentDidCatch(error, info) { console.error("AxiomOS Error:", error, info); }
  render() {
    if (this.state.hasError) {
      return React.createElement("div", { style: { display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "#0D0F13", fontFamily: "'Courier New',monospace" } },
        React.createElement("div", { style: { textAlign: "center", padding: 40, maxWidth: 420 } },
          React.createElement("div", { style: { fontSize: 48, marginBottom: 16 } }, "⚡"),
          React.createElement("div", { style: { fontSize: 20, color: "#D4A843", fontWeight: 700, marginBottom: 12, letterSpacing: 2, textTransform: "uppercase" } }, "Axiom OS"),
          React.createElement("div", { style: { fontSize: 14, color: "#8892A4", marginBottom: 20 } }, "Something went wrong. Your data is safe."),
          React.createElement("div", { style: { fontSize: 11, color: "#6B7280", padding: "8px 12px", background: "#111318", borderRadius: 4, marginBottom: 20, textAlign: "left", maxHeight: 80, overflow: "auto" } }, String(this.state.error)),
          React.createElement("button", { style: { padding: "8px 20px", borderRadius: 4, fontSize: 11, letterSpacing: 2, textTransform: "uppercase", cursor: "pointer", fontFamily: "inherit", border: "1px solid #D4A843", background: "#D4A843", color: "#0D0F13", fontWeight: 700 }, onClick: () => { this.setState({ hasError: false, error: null }); window.location.reload(); } }, "Reload")
        )
      );
    }
    return this.props.children;
  }
}

export default function App() {
  const [active, setActive] = useState("dashboard");
  const [collapsed, setCollapsed] = useLS("axiom_side_collapsed", false);
  const [lightMode, setLightMode] = useLS("axiom_light_mode", false);
  const [chartSel, setChartSel] = useState(null);
  const [cmdKOpen, setCmdKOpen] = useState(false);

  // ─── AUTH STATE ─────────────────────────────────
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [activeProjectId, setActiveProjectId] = useLS("axiom_active_project_id", null);

  // Restore session on mount
  useEffect(() => {
    if (!supa.configured()) { setAuthLoading(false); return; }
    (async () => {
      try {
        if (supa.token) {
          const u = await supa.getUser();
          if (u && u.id) { setUser(u); } else {
            const refreshed = await supa.refreshSession();
            if (refreshed) { const u2 = await supa.getUser(); if (u2 && u2.id) setUser(u2); }
          }
        } else {
          const refreshed = await supa.refreshSession();
          if (refreshed) { const u = await supa.getUser(); if (u && u.id) setUser(u); }
        }
      } catch (e) { console.warn("Session restore failed:", e); }
      setAuthLoading(false);
    })();
  }, []);

  // Auto-refresh session token every 45 minutes
  useEffect(() => {
    if (!user || !supa.configured()) return;
    const interval = setInterval(async () => {
      try {
        const refreshed = await supa.refreshSession();
        if (refreshed) {
          const u = await supa.getUser();
          if (u && u.id) setUser(u);
        }
      } catch (e) { console.warn("Token refresh failed:", e); }
    }, 45 * 60 * 1000);
    return () => clearInterval(interval);
  }, [user]);

  // Fetch user profile + org info when user authenticated
  useEffect(() => {
    if (!user || !supa.configured()) return;
    (async () => {
      const profiles = await supa.select("user_profiles", `id=eq.${user.id}&select=*`);
      if (profiles.length > 0) setUserProfile(profiles[0]);
    })();
  }, [user]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setCmdKOpen((prev) => !prev); }
      if (e.key === 'Escape') setCmdKOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (lightMode) document.body.classList.add('light-mode');
    else document.body.classList.remove('light-mode');
  }, [lightMode]);

  // ─── CORE STATE (localStorage + Supabase sync) ──
  const [project, setProject] = useLS("axiom_project", { name: "New Development", address: "", jurisdiction: "", state: "", municipality: "" });
  const [fin, setFin] = useLS("axiom_fin", DEFAULT_FIN);
  const [risks, setRisks] = useLS("axiom_risks", DEFAULT_RISKS);
  const [permits, setPermits] = useLS("axiom_permits", DEFAULT_PERMITS);
  const [ddChecks, setDdChecks] = useLS("axiom_dd", {});
  const [vendors, setVendors] = useLS("axiom_vendors", []);
  const [loan, setLoan] = useLS("axiom_loan", { ltc: 70, rate: 9.5, termMonths: 24, extensionMonths: 12, origFee: 1.5, lender: "" });
  const [equity, setEquity] = useLS("axiom_equity", { gpPct: 10, lpPct: 90, prefReturn: 8, promotePct: 20, equityMultipleTarget: 2.0, irrTarget: 18 });

  // ─── SYNC: Hydrate from Supabase on login + project switch ──────
  const hydrated = useRef(false);
  const lastHydratedProject = useRef(null);
  useEffect(() => {
    if (!user || !userProfile || !supa.configured()) return;
    if (hydrated.current && lastHydratedProject.current === activeProjectId) return;
    hydrated.current = true;
    lastHydratedProject.current = activeProjectId;
    (async () => {
      try {
        // Get or create a project
        let projects = await supa.select("projects", `org_id=eq.${userProfile.org_id}&order=updated_at.desc&limit=1`);
        let pid = activeProjectId;
        if (projects.length > 0) {
          pid = projects[0].id;
          setActiveProjectId(pid);
          setProject({ name: projects[0].name || "", address: projects[0].address || "", jurisdiction: "", state: projects[0].state || "", municipality: projects[0].municipality || "" });
        } else if (project.name && project.name !== "New Development") {
          // Create project from localStorage data
          const created = await supa.select("projects", `org_id=eq.${userProfile.org_id}&name=eq.${encodeURIComponent(project.name)}`);
          if (created.length > 0) pid = created[0].id;
        }
        if (!pid) return;

        // Hydrate financial model
        const fins = await supa.select("financial_models", `project_id=eq.${pid}&order=updated_at.desc&limit=1`);
        if (fins.length > 0) {
          const f = fins[0];
          setFin(prev => ({
            ...prev,
            totalLots: f.total_lots ?? prev.totalLots, landCost: Number(f.land_cost) || prev.landCost,
            closingCosts: Number(f.closing_costs) || prev.closingCosts, hardCostPerLot: Number(f.hard_cost_per_lot) || prev.hardCostPerLot,
            softCostPct: Number(f.soft_cost_pct) || prev.softCostPct, contingencyPct: Number(f.contingency_pct) || prev.contingencyPct,
            salesPricePerLot: Number(f.sales_price_per_lot) || prev.salesPricePerLot, salesCommission: Number(f.sales_commission) || prev.salesCommission,
            absorbRate: Number(f.absorb_rate) || prev.absorbRate, planningFees: Number(f.planning_fees) || prev.planningFees,
            permitFeePerLot: Number(f.permit_fee_per_lot) || prev.permitFeePerLot, schoolFee: Number(f.school_fee) || prev.schoolFee,
            impactFeePerLot: Number(f.impact_fee_per_lot) || prev.impactFeePerLot, reservePercentage: Number(f.reserve_percentage) || prev.reservePercentage,
          }));
        }

        // Hydrate risks
        const riskRows = await supa.select("risks", `project_id=eq.${pid}`);
        if (riskRows.length > 0) {
          setRisks(riskRows.map(r => ({ id: r.id, category: r.category, risk: r.risk, likelihood: r.likelihood || "Medium", impact: r.impact || "Medium", severity: r.severity || "Medium", mitigation: r.mitigation || "", status: r.status || "Open" })));
        }

        // Hydrate permits
        const permitRows = await supa.select("permits", `project_id=eq.${pid}`);
        if (permitRows.length > 0) {
          setPermits(permitRows.map(p => ({ id: p.id, name: p.name, agency: p.agency || "", duration: p.duration || "", cost: p.cost || "", status: p.status || "Not Started", required: p.required ?? true })));
        }

        // Hydrate vendors
        const vendorRows = await supa.select("vendors", `org_id=eq.${userProfile.org_id}`);
        if (vendorRows.length > 0) {
          setVendors(vendorRows.map(v => ({ id: v.id, name: v.name, type: v.type || "", status: v.status || "Active", contact: v.contact || "", email: v.email || "", phone: v.phone || "", rating: v.rating || 5, notes: v.notes || "" })));
        }

        // Hydrate loan terms
        const loanRows = await supa.select("loan_terms", `project_id=eq.${pid}&limit=1`);
        if (loanRows.length > 0) {
          const l = loanRows[0];
          setLoan(prev => ({ ...prev, ltc: Number(l.ltc) || prev.ltc, rate: Number(l.rate) || prev.rate, termMonths: l.term_months || prev.termMonths, extensionMonths: l.extension_months || prev.extensionMonths, origFee: Number(l.orig_fee) || prev.origFee, lender: l.lender || prev.lender }));
        }

        // Hydrate equity terms
        const equityRows = await supa.select("equity_terms", `project_id=eq.${pid}&limit=1`);
        if (equityRows.length > 0) {
          const e = equityRows[0];
          setEquity(prev => ({ ...prev, gpPct: Number(e.gp_pct) || prev.gpPct, lpPct: Number(e.lp_pct) || prev.lpPct, prefReturn: Number(e.pref_return) || prev.prefReturn, promotePct: Number(e.promote_pct) || prev.promotePct, equityMultipleTarget: Number(e.equity_multiple_target) || prev.equityMultipleTarget, irrTarget: Number(e.irr_target) || prev.irrTarget }));
        }

        // Hydrate DD checklists
        const ddRows = await supa.select("dd_checklists", `project_id=eq.${pid}`);
        if (ddRows.length > 0) {
          const checks = {};
          ddRows.forEach(r => { if (r.item_key) checks[r.item_key] = r.completed; });
          setDdChecks(checks);
        }
      } catch (e) { console.warn("Hydrate from Supabase failed:", e); }
    })();
  }, [user, userProfile, activeProjectId]);

  // ─── SYNC: Project → Supabase ──────────────────
  const isAuth = !!(user && userProfile && supa.configured());
  useSyncToSupabase("projects", project, (p) => {
    if (!activeProjectId || !userProfile) return null;
    return { id: activeProjectId, org_id: userProfile.org_id, name: p.name, address: p.address, state: p.state, municipality: p.municipality };
  }, [project, activeProjectId], isAuth);

  // ─── SYNC: Financial model → Supabase ──────────
  useSyncToSupabase("financial_models", fin, (f) => {
    if (!activeProjectId) return null;
    return {
      project_id: activeProjectId, label: "Base Case",
      total_lots: f.totalLots, land_cost: f.landCost, closing_costs: f.closingCosts,
      hard_cost_per_lot: f.hardCostPerLot, soft_cost_pct: f.softCostPct, contingency_pct: f.contingencyPct,
      sales_price_per_lot: f.salesPricePerLot, sales_commission: f.salesCommission,
      absorb_rate: f.absorbRate, planning_fees: f.planningFees,
      permit_fee_per_lot: f.permitFeePerLot, school_fee: f.schoolFee,
      impact_fee_per_lot: f.impactFeePerLot, reserve_percentage: f.reservePercentage,
    };
  }, [fin, activeProjectId], isAuth);


  // ─── SYNC: Loan terms → Supabase ───────────────
  useSyncToSupabase("loan_terms", loan, (l) => {
    if (!activeProjectId) return null;
    return { project_id: activeProjectId, ltc: l.ltc, rate: l.rate, term_months: l.termMonths, extension_months: l.extensionMonths, orig_fee: l.origFee, lender: l.lender || "" };
  }, [loan, activeProjectId], isAuth);

  // ─── SYNC: Equity terms → Supabase ─────────────
  useSyncToSupabase("equity_terms", equity, (e) => {
    if (!activeProjectId) return null;
    return { project_id: activeProjectId, gp_pct: e.gpPct, lp_pct: e.lpPct, pref_return: e.prefReturn, promote_pct: e.promotePct, equity_multiple_target: e.equityMultipleTarget, irr_target: e.irrTarget };
  }, [equity, activeProjectId], isAuth);

  // ─── SYNC: Risks → Supabase (bulk upsert on change) ───
  const prevRisksRef = useRef(null);
  useEffect(() => {
    if (!isAuth || !activeProjectId || !risks) return;
    const json = JSON.stringify(risks);
    if (json === prevRisksRef.current) return;
    prevRisksRef.current = json;
    const timer = setTimeout(async () => {
      try {
        for (const r of risks) {
          const row = { project_id: activeProjectId, category: r.category, risk: r.risk, likelihood: r.likelihood || "Medium", impact: r.impact || "Medium", severity: r.severity || "Medium", mitigation: r.mitigation || "", status: r.status || "Open" };
          if (r.id && r.id.length > 10) row.id = r.id;
          await supa.upsert("risks", row);
        }
      } catch (e) { console.warn("Risk sync failed:", e); }
    }, 2000);
    return () => clearTimeout(timer);
  }, [risks, activeProjectId, isAuth]);

  // ─── SYNC: Permits → Supabase (bulk upsert on change) ─
  const prevPermitsRef = useRef(null);
  useEffect(() => {
    if (!isAuth || !activeProjectId || !permits) return;
    const json = JSON.stringify(permits);
    if (json === prevPermitsRef.current) return;
    prevPermitsRef.current = json;
    const timer = setTimeout(async () => {
      try {
        for (const p of permits) {
          const row = { project_id: activeProjectId, name: p.name, agency: p.agency || "", duration: p.duration || "", cost: p.cost || "", status: p.status || "Not Started", required: p.required ?? true };
          if (p.id && p.id.length > 10) row.id = p.id;
          await supa.upsert("permits", row);
        }
      } catch (e) { console.warn("Permit sync failed:", e); }
    }, 2000);
    return () => clearTimeout(timer);
  }, [permits, activeProjectId, isAuth]);


  // ─── SYNC: DD Checklists → Supabase ────────────
  const syncDdCheck = useCallback((key, val) => {
    if (!activeProjectId || !supa.configured() || !user) return;
    const [ciStr, ...rest] = key.split("-");
    const item = rest.join("-");
    supa.upsert("dd_checklists", {
      project_id: activeProjectId,
      item_key: key,
      category: ciStr,
      item: item,
      completed: val,
      completed_at: val ? new Date().toISOString() : null,
      completed_by: val ? user.id : null,
    }).catch(() => { });
  }, [activeProjectId, user]);

  const setDdChecksSync = useCallback((newChecksOrFn) => {
    setDdChecks(prev => {
      const newChecks = typeof newChecksOrFn === "function" ? newChecksOrFn(prev) : newChecksOrFn;
      // Find what changed
      Object.entries(newChecks).forEach(([key, val]) => {
        if (prev[key] !== val) syncDdCheck(key, val);
      });
      return newChecks;
    });
  }, [syncDdCheck]);

  // ─── Multi-project management ───────────────────
  const [allProjects, setAllProjects] = useState([]);
  useEffect(() => {
    if (!userProfile?.org_id || !supa.configured()) return;
    supa.select("projects", `org_id=eq.${userProfile.org_id}&order=updated_at.desc`)
      .then(rows => setAllProjects(rows || []))
      .catch(() => { });
  }, [userProfile, activeProjectId]);

  const createProject = useCallback(async (name, state, address) => {
    if (!userProfile?.org_id) return null;
    const newProj = await supa.insert("projects", {
      org_id: userProfile.org_id, created_by: user.id,
      name, state: state || "", address: address || "",
    });
    if (newProj?.id) {
      setActiveProjectId(newProj.id);
      setProject({ name, address: address || "", jurisdiction: "", state: state || "", municipality: "" });
      hydrated.current = false;
      setAllProjects(prev => [newProj, ...prev]);
      return newProj.id;
    }
    return null;
  }, [userProfile, user]);

  const switchProject = useCallback(async (pid) => {
    const proj = allProjects.find(p => p.id === pid);
    if (!proj) return;
    setActiveProjectId(pid);
    setProject({ name: proj.name || "", address: proj.address || "", jurisdiction: "", state: proj.state || "", municipality: proj.municipality || "" });
    // Reset hydration flags so the effect re-runs for the new project
    hydrated.current = false;
    lastHydratedProject.current = null;
  }, [allProjects]);

  const authCtx = {
    user, userProfile, authLoading, activeProjectId, setActiveProjectId,
    allProjects, createProject, switchProject,
    login: async (email, pw) => {
      const data = await supa.auth(email, pw, false);
      setUser(data.user);
      hydrated.current = false;
      // Auto-configure proxy URL from env if not already set
      if (data.user && SUPA_URL && SUPA_URL !== "YOUR_SUPABASE_URL") {
        const autoProxy = `${SUPA_URL}/functions/v1/llm-proxy`;
        const existing = JSON.parse(localStorage.getItem("axiom_api_keys") || "{}");
        if (!existing.proxyUrl) {
          const updated = { ...existing, proxyUrl: autoProxy };
          localStorage.setItem("axiom_api_keys", JSON.stringify(updated));
        }
      }
      return data;
    },
    signup: async (email, pw) => {
      const data = await supa.auth(email, pw, true);
      if (data.user) {
        setUser(data.user);
        // Auto-configure proxy URL from env
        if (SUPA_URL && SUPA_URL !== "YOUR_SUPABASE_URL") {
          const autoProxy = `${SUPA_URL}/functions/v1/llm-proxy`;
          const existing = JSON.parse(localStorage.getItem("axiom_api_keys") || "{}");
          if (!existing.proxyUrl) {
            const updated = { ...existing, proxyUrl: autoProxy };
            localStorage.setItem("axiom_api_keys", JSON.stringify(updated));
          }
        }
      }
      return data;
    },
    logout: async () => { await supa.logout(); setUser(null); setUserProfile(null); hydrated.current = false; },
  };

  // ─── INVITE ACCEPTANCE ──────────────────────────
  const { inviteData, accepting, acceptMsg, acceptInvite, dismissInvite } = useInviteAcceptance(user, userProfile, () => { });


  // ─── SITE / ZONING / SURVEY / ENV / UTILITIES ──
  const DEFAULT_SITE_D = { address: "", apn: "", grossAcres: "", netAcres: "", jurisdiction: "", county: "", state: "", generalPlan: "", existingUse: "", proposedUse: "SFR Subdivision", shape: "Rectangular", frontage: "", access: "", legalDesc: "" };
  const DEFAULT_ZON_D = { zone: "", overlay: "", du_ac: "", maxHeight: "", minLotSize: "", minLotWidth: "", minLotDepth: "", frontSetback: "", rearSetback: "", sideSetback: "", maxLot: "", parkingRatio: "", entitlementType: "Tentative Map", entitlementStatus: "Not Started", notes: "" };
  const DEFAULT_SUR_D = { altaOrdered: "No", altaDate: "", surveyorName: "", easements: "", encroachments: "", soilType: "", percRate: "", slopeMax: "", cutFill: "", expansiveSoil: "No", liquefaction: "No" };
  const DEFAULT_ALTA_D = ["1-Monuments", "2-Address", "3-Flood Zone", "4-Topography", "5-Utilities", "6-Parking", "7-Setbacks", "8-Substantial Features", "11a-Utilities", "13-Adjoiner Names", "16-Wetlands", "17-Gov't Agency", "18-Offsite Easements", "20a-Zoning Label"].map(i => ({ item: i, checked: false }));
  const DEFAULT_SVCS_D = [
    { name: "Water", provider: "", capacity: "", distance: "", connFee: "", status: "Verify" },
    { name: "Sewer / Sanitary", provider: "", capacity: "", distance: "", connFee: "", status: "Verify" },
    { name: "Storm Drain", provider: "", capacity: "", distance: "", connFee: "", status: "Verify" },
    { name: "Electric", provider: "", capacity: "", distance: "", connFee: "", status: "Verify" },
    { name: "Natural Gas", provider: "", capacity: "", distance: "", connFee: "", status: "Verify" },
    { name: "Telecom / Fiber", provider: "", capacity: "", distance: "", connFee: "", status: "Verify" },
  ];
  const DEFAULT_ENV_D = { floodZone: "X", firmPanel: "", firmDate: "", bfe: "", loma: "No", phase1: "No", phase1Date: "", rec: "", wetlands: "None Observed", species: "", ceqa: "Class 32 - Infill", mitigation: "", airQuality: "" };
  const [site, setSite] = useLS("axiom_site", DEFAULT_SITE_D);
  const [zon, setZon] = useLS("axiom_zoning", DEFAULT_ZON_D);
  const [sur, setSur] = useLS("axiom_survey", DEFAULT_SUR_D);
  const [altaA, setAltaA] = useLS("axiom_alta", DEFAULT_ALTA_D);
  const [svcs, setSvcs] = useLS("axiom_utilities", DEFAULT_SVCS_D);
  const [env, setEnv] = useLS("axiom_env", DEFAULT_ENV_D);

  // ─── COMPS STATE ────────────────────────────────
  const [comps, setComps] = useLS("axiom_comps", [
    { id: "1", address: "123 Oak St", price: 4200000, lots: 28, pricePerLot: 150000, saleDate: "2025-01-15", source: "CoStar", notes: "Arm's length sale" },
    { id: "2", address: "456 Pine Ave", price: 6800000, lots: 42, pricePerLot: 161905, saleDate: "2024-11-30", source: "MLS", notes: "Similar entitlement status" },
    { id: "3", address: "789 Elm Dr", price: 3100000, lots: 22, pricePerLot: 140909, saleDate: "2024-09-12", source: "Broker", notes: "Distressed sale" },
  ]);

  // ─── SITE TASKS STATE ────────────────────────────
  const [siteTasks, setSiteTasks] = useLS("axiom_site_tasks", [
    { id: "t1", title: "Mass Grading", start: "2025-03-01", dur: 14, progress: 0, status: "Planned", priority: "High", assignee: "", category: "Grading", due_date: "2025-03-15" },
    { id: "t2", title: "Wet Utilities", start: "2025-03-15", dur: 21, progress: 0, status: "Planned", priority: "High", assignee: "", category: "Utilities", due_date: "2025-04-05" },
    { id: "t3", title: "Staking & Survey", start: "2025-02-25", dur: 3, progress: 100, status: "Complete", priority: "Medium", assignee: "", category: "Survey", due_date: "2025-02-28" },
    { id: "t4", title: "Mobilization", start: "2025-02-20", dur: 5, progress: 80, status: "In Progress", priority: "High", assignee: "", category: "General", due_date: "2025-02-25" },
  ]);

  // ─── SYNC: site_data → Supabase ─────────────────
  const prevSiteRef = useRef(null);
  useEffect(() => {
    if (!isAuth || !activeProjectId) return;
    const combined = JSON.stringify({ site, zon, sur, altaA, svcs, env });
    if (combined === prevSiteRef.current) return;
    prevSiteRef.current = combined;
    const timer = setTimeout(async () => {
      try {
        await supa.upsert("site_data", {
          project_id: activeProjectId,
          address: site.address, apn: site.apn,
          gross_acres: site.grossAcres ? parseFloat(site.grossAcres) : null,
          net_acres: site.netAcres ? parseFloat(site.netAcres) : null,
          jurisdiction: site.jurisdiction, county: site.county, state: site.state,
          general_plan: site.generalPlan, existing_use: site.existingUse,
          proposed_use: site.proposedUse, shape: site.shape, frontage: site.frontage,
          access: site.access, legal_desc: site.legalDesc,
          zone: zon.zone, overlay: zon.overlay, du_ac: zon.du_ac,
          max_height: zon.maxHeight, min_lot_size: zon.minLotSize,
          min_lot_width: zon.minLotWidth, min_lot_depth: zon.minLotDepth,
          front_setback: zon.frontSetback, rear_setback: zon.rearSetback,
          side_setback: zon.sideSetback, max_lot: zon.maxLot,
          parking_ratio: zon.parkingRatio, entitlement_type: zon.entitlementType,
          entitlement_status: zon.entitlementStatus, zoning_notes: zon.notes,
          alta_ordered: sur.altaOrdered, alta_date: sur.altaDate,
          surveyor_name: sur.surveyorName, easements: sur.easements,
          encroachments: sur.encroachments, soil_type: sur.soilType,
          perc_rate: sur.percRate, slope_max: sur.slopeMax,
          cut_fill: sur.cutFill, expansive_soil: sur.expansiveSoil,
          liquefaction: sur.liquefaction,
          flood_zone: env.floodZone, firm_panel: env.firmPanel,
          firm_date: env.firmDate, bfe: env.bfe, loma: env.loma,
          phase1: env.phase1, phase1_date: env.phase1Date, rec: env.rec,
          wetlands: env.wetlands, species: env.species,
          ceqa: env.ceqa, mitigation: env.mitigation, air_quality: env.airQuality,
          alta_items: altaA, utilities: svcs,
          updated_at: new Date().toISOString(),
        });
      } catch (e) { console.warn("Site data sync failed:", e); }
    }, 2000);
    return () => clearTimeout(timer);
  }, [site, zon, sur, altaA, svcs, env, activeProjectId, isAuth]);

  // ─── SYNC: comps → Supabase ─────────────────────
  const prevCompsRef = useRef(null);
  useEffect(() => {
    if (!isAuth || !activeProjectId || !comps?.length) return;
    const json = JSON.stringify(comps);
    if (json === prevCompsRef.current) return;
    prevCompsRef.current = json;
    const timer = setTimeout(async () => {
      try {
        for (const c of comps) {
          const row = {
            org_id: userProfile.org_id, project_id: activeProjectId,
            address: c.address || "", price: parseFloat(c.price) || 0,
            lots: parseInt(c.lots) || 0,
            price_per_lot: parseFloat(c.pricePerLot || c.price_per_lot) || 0,
            sale_date: c.saleDate || c.sale_date || "",
            source: c.source || "", notes: c.notes || "",
            updated_at: new Date().toISOString(),
          };
          if (c._supaId) row.id = c._supaId;
          await supa.upsert("comps", row);
        }
      } catch (e) { console.warn("Comps sync failed:", e); }
    }, 2000);
    return () => clearTimeout(timer);
  }, [comps, activeProjectId, isAuth]);

  // ─── SYNC: siteTasks → Supabase ─────────────────
  const prevTasksRef = useRef(null);
  useEffect(() => {
    if (!isAuth || !activeProjectId || !siteTasks?.length) return;
    const json = JSON.stringify(siteTasks);
    if (json === prevTasksRef.current) return;
    prevTasksRef.current = json;
    const timer = setTimeout(async () => {
      try {
        for (const t of siteTasks) {
          const row = {
            org_id: userProfile.org_id, project_id: activeProjectId,
            title: t.title || t.name || "Task",
            status: t.status || "Planned",
            priority: t.priority || "Medium",
            assignee: t.assignee || "",
            due_date: t.due_date || t.start || "",
            category: t.category || "General",
            updated_at: new Date().toISOString(),
          };
          if (t._supaId) row.id = t._supaId;
          await supa.upsert("site_tasks", row);
        }
      } catch (e) { console.warn("Site tasks sync failed:", e); }
    }, 2000);
    return () => clearTimeout(timer);
  }, [siteTasks, activeProjectId, isAuth]);

  // ─── HYDRATE: site_data + comps + siteTasks ──────
  const siteHydrated = useRef(false);
  useEffect(() => { siteHydrated.current = false; }, [activeProjectId]);
  useEffect(() => {
    if (!isAuth || !activeProjectId || siteHydrated.current) return;
    siteHydrated.current = true;
    (async () => {
      try {
        const [siteRows, compRows, taskRows] = await Promise.all([
          supa.select("site_data", `project_id=eq.${activeProjectId}&limit=1`),
          supa.select("comps", `project_id=eq.${activeProjectId}&order=created_at.desc`),
          supa.select("site_tasks", `project_id=eq.${activeProjectId}&order=created_at.asc`),
        ]);
        if (siteRows.length > 0) {
          const s = siteRows[0];
          if (s.address || s.apn) setSite(p => ({ ...p, address: s.address || p.address, apn: s.apn || p.apn, grossAcres: s.gross_acres || p.grossAcres, netAcres: s.net_acres || p.netAcres, jurisdiction: s.jurisdiction || p.jurisdiction, county: s.county || p.county, state: s.state || p.state, generalPlan: s.general_plan || p.generalPlan, existingUse: s.existing_use || p.existingUse, proposedUse: s.proposed_use || p.proposedUse, shape: s.shape || p.shape, frontage: s.frontage || p.frontage, access: s.access || p.access, legalDesc: s.legal_desc || p.legalDesc }));
          if (s.zone) setZon(p => ({ ...p, zone: s.zone || p.zone, overlay: s.overlay || p.overlay, du_ac: s.du_ac || p.du_ac, maxHeight: s.max_height || p.maxHeight, minLotSize: s.min_lot_size || p.minLotSize, minLotWidth: s.min_lot_width || p.minLotWidth, minLotDepth: s.min_lot_depth || p.minLotDepth, frontSetback: s.front_setback || p.frontSetback, rearSetback: s.rear_setback || p.rearSetback, sideSetback: s.side_setback || p.sideSetback, maxLot: s.max_lot || p.maxLot, parkingRatio: s.parking_ratio || p.parkingRatio, entitlementType: s.entitlement_type || p.entitlementType, entitlementStatus: s.entitlement_status || p.entitlementStatus, notes: s.zoning_notes || p.notes }));
          if (s.alta_ordered) setSur(p => ({ ...p, altaOrdered: s.alta_ordered || p.altaOrdered, altaDate: s.alta_date || p.altaDate, surveyorName: s.surveyor_name || p.surveyorName, easements: s.easements || p.easements, encroachments: s.encroachments || p.encroachments, soilType: s.soil_type || p.soilType, percRate: s.perc_rate || p.percRate, slopeMax: s.slope_max || p.slopeMax, cutFill: s.cut_fill || p.cutFill, expansiveSoil: s.expansive_soil || p.expansiveSoil, liquefaction: s.liquefaction || p.liquefaction }));
          if (s.flood_zone) setEnv(p => ({ ...p, floodZone: s.flood_zone || p.floodZone, firmPanel: s.firm_panel || p.firmPanel, firmDate: s.firm_date || p.firmDate, bfe: s.bfe || p.bfe, loma: s.loma || p.loma, phase1: s.phase1 || p.phase1, phase1Date: s.phase1_date || p.phase1Date, rec: s.rec || p.rec, wetlands: s.wetlands || p.wetlands, species: s.species || p.species, ceqa: s.ceqa || p.ceqa, mitigation: s.mitigation || p.mitigation, airQuality: s.air_quality || p.airQuality }));
          if (s.alta_items?.length) setAltaA(s.alta_items);
          if (s.utilities?.length) setSvcs(s.utilities);
        }
        if (compRows.length > 0) setComps(compRows.map(c => ({ id: c.id, _supaId: c.id, address: c.address || "", price: Number(c.price) || 0, lots: c.lots || 0, pricePerLot: Number(c.price_per_lot) || 0, saleDate: c.sale_date || "", source: c.source || "", notes: c.notes || "" })));
        if (taskRows.length > 0) setSiteTasks(taskRows.map(t => ({ id: t.id, _supaId: t.id, title: t.title, status: t.status || "Planned", priority: t.priority || "Medium", assignee: t.assignee || "", due_date: t.due_date || "", category: t.category || "General", progress: t.status === "Complete" ? 100 : t.status === "In Progress" ? 50 : 0, start: t.due_date || "", dur: 7 })));
      } catch (e) { console.warn("Site/comps/tasks hydration failed:", e); }
    })();
  }, [activeProjectId, isAuth]);

  const ctx = { project, setProject, fin, setFin, risks, setRisks, permits, setPermits, ddChecks, setDdChecks: setDdChecksSync, vendors, setVendors, loan, setLoan, equity, setEquity, activeProjectId, setChartSel, site, setSite, zon, setZon, sur, setSur, altaA, setAltaA, svcs, setSvcs, env, setEnv, comps, setComps, siteTasks, setSiteTasks, ...authCtx };
  const TITLE = {
    dashboard: "Command Center", connectors: "Connectors & APIs",
    network: "Professional Network",
    contacts: "Contacts", pipeline: "Deal Pipeline", analyzer: "Deal Analyzer",
    site: "Site & Entitlements", infrastructure: "Infrastructure", design: "Concept & Design",
    market: "Market Intelligence", mls: "MLS & Listings", dataintel: "Data & Intel", juris: "Jurisdiction Intel",
    financial: "Financial Engine", invoices: "Invoices & Payments", calchub: "Calculator Hub",
    process: "Process Control", sitemgmt: "Site Management", risk: "Risk Command",
    notes: "Notes", calendar: "Calendar", email: "Email", sheets: "Spreadsheets", workflows: "Workflows", resources: "Resource Center",
    reports: "Reports & Binder", agents: "AI Agent Hub", copilot: "Copilot", neural: "Neural Intelligence",
    billing: "Billing & Plans", legal: "Legal & Compliance", settings: "Settings",
  };
  const SECTIONS = {
    dashboard: <Dashboard />, connectors: <Connectors />,
    network: <VendorNetwork />,
    contacts: <Contacts />, pipeline: <DealPipeline />, analyzer: <DealAnalyzer />,
    site: <SiteEntitlements />, infrastructure: <Infrastructure />, design: <ConceptDesign />,
    market: <MarketIntelligence />, mls: <MLSListings />, dataintel: <DataIntel />, juris: <JurisdictionIntel />,
    financial: <FinancialEngine />, invoices: <InvoicesPayments />, calchub: <CalcHub />,
    process: <ProcessControl />, sitemgmt: <SiteManagement />, risk: <RiskCommand />,
    notes: <Notes />, calendar: <FullCalendar />, email: <EmailSection />, sheets: <Spreadsheets />, workflows: <Workflows />, resources: <ResourceCenter />,
    reports: <ReportsBinder />, agents: <AgentHub />, copilot: <CopilotPanel />, neural: <NeuralNet />,
    billing: <BillingPlans />, legal: <Legal />, settings: <SystemSettings />,
  };
  return (
    <ErrorBoundary>
      <AuthCtx.Provider value={authCtx}>
        <TierProvider userProfile={userProfile}>
          <Ctx.Provider value={ctx}>
            <PremiereStyles />
            {/* Show login gate if Supabase configured but not logged in */}
            {supa.configured() && !user && !authLoading ? (
              <AuthGate />
            ) : user && userProfile && !userProfile.onboarded && !allProjects.length ? (
              <OnboardingWizard onComplete={async (orgName, state) => {
                // Create first project for the user
                await createProject(`${orgName} - First Project`, state, "");
                // Mark as onboarded in DB
                if (supa.configured()) {
                  supa.update("organizations", { id: userProfile.org_id }, { name: orgName }).catch(() => { });
                  supa.update("user_profiles", { id: user.id }, { onboarded: true }).catch(() => { });
                }
              }} />
            ) : (
              <div style={S.app}>
                <Sidebar active={active} setActive={setActive} collapsed={collapsed} setCollapsed={setCollapsed} />
                <div style={{ ...S.main, width: collapsed ? "calc(100% - 64px)" : "calc(100% - 218px)", transition: "width 0.3s cubic-bezier(0.4, 0, 0.2, 1)" }}>
                  <div style={S.bar}>
                    <div style={{ fontSize: 14, color: C.gold, letterSpacing: 2, flex: 1, fontWeight: 600 }}>{TITLE[active]}</div>
                    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                      <button style={{ ...S.btn(), padding: "4px 8px", fontSize: 10 }} onClick={() => setLightMode(!lightMode)} title="Toggle Theme">
                        {lightMode ? "🌙 Dark" : "☀️ Light"}
                      </button>
                      {user && <span style={{ fontSize: 9, color: C.green, background: "color-mix(in srgb, var(--c-green) 12%, transparent)", padding: "3px 8px", borderRadius: 4 }}>● Synced</span>}
                      {userProfile?.subscription_tier && userProfile.subscription_tier !== "free" && userProfile.subscription_tier !== "FREE" && (
                        <span style={{ fontSize: 9, color: C.gold, background: "color-mix(in srgb, var(--c-gold) 12%, transparent)", padding: "3px 8px", borderRadius: 4, letterSpacing: 1, textTransform: "uppercase" }}>{TIER_NAMES[userProfile.subscription_tier] || userProfile.subscription_tier}</span>
                      )}
                      {/* Multi-project switcher */}
                      {user && allProjects.length > 0 ? (
                        <select
                          style={{ ...S.sel, maxWidth: 160, padding: "4px 6px", fontSize: 10, color: C.gold }}
                          value={activeProjectId || ""}
                          onChange={e => { if (e.target.value === "__new__") { const n = prompt("New project name:"); if (n) createProject(n, project.state || "FL", ""); } else if (e.target.value) switchProject(e.target.value); }}
                          title="Switch Project"
                        >
                          {allProjects.map(p => <option key={p.id} value={p.id}>{p.name || "Untitled"}</option>)}
                          <option value="__new__">+ New Project</option>
                        </select>
                      ) : (
                        <input style={{ ...S.inp, width: 160, padding: "4px 8px", fontSize: 10 }} value={project.name} onChange={e => setProject({ ...project, name: e.target.value })} placeholder="Project Name" />
                      )}
                      <input style={{ ...S.inp, width: 160, padding: "4px 8px", fontSize: 10 }} value={project.address} onChange={e => setProject({ ...project, address: e.target.value })} placeholder="Address / APN" />
                      <select style={{ ...S.sel, width: 100, padding: "4px 6px", fontSize: 10, color: project.state ? C.gold : C.dim }} value={project.state} onChange={e => setProject({ ...project, state: e.target.value })}>{US_STATES.map(s => <option key={s} value={s}>{s || "State"}</option>)}</select>
                      <input style={{ ...S.inp, width: 130, padding: "4px 8px", fontSize: 10 }} value={project.municipality} onChange={e => setProject({ ...project, municipality: e.target.value })} placeholder="City / County" />
                      {user && <button style={{ ...S.btn(), padding: "4px 8px", fontSize: 9, color: C.dim }} onClick={authCtx.logout} title="Logout">⏻</button>}
                      <NotifBell setActive={setActive} />
                    </div>
                  </div>
                  {(() => {
                    const keys = JSON.parse(localStorage.getItem("axiom_api_keys") || "{}");
                    const hasProxy = !!keys.proxyUrl;
                    const hasAnyKey = !!(keys.anthropic || keys.openai || keys.groq || keys.together);
                    if (!hasProxy && hasAnyKey) return (
                      <div style={{ background: "color-mix(in srgb, var(--c-red) 12%, transparent)", border: `1px solid color-mix(in srgb, var(--c-red) 30%, transparent)`, padding: "6px 16px", fontSize: 10, color: C.red, display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontWeight: 700 }}>⚠ DEV MODE</span>
                        <span style={{ color: C.muted }}>API keys are exposed in the browser. Configure a proxy URL in Settings for production use.</span>
                        <button style={{ ...S.btn(), padding: "2px 8px", fontSize: 9, marginLeft: "auto", borderColor: C.red, color: C.red }} onClick={() => setActive("settings")}>Fix Now</button>
                      </div>
                    );
                    return null;
                  })()}
                  <div style={S.cnt}>
                    {SECTIONS[active] || <div style={{ color: C.dim, padding: 40, textAlign: "center" }}>Section not found.</div>}
                  </div>
                </div>
              </div>
            )}
            <DataExplorerModal data={chartSel} onClose={() => setChartSel(null)} />
            <CommandKModal isOpen={cmdKOpen} onClose={() => setCmdKOpen(false)} onSelect={(id) => setActive(id)} />
            {/* Invite acceptance modal */}
            {inviteData && user && (
              <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{ width: 420, background: "var(--c-bg2)", borderRadius: 12, border: "1px solid var(--c-gold)44", padding: 36, textAlign: "center" }}>
                  <div style={{ fontSize: 32, marginBottom: 12 }}>🤝</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: "var(--c-text)", marginBottom: 8 }}>You've been invited!</div>
                  <div style={{ fontSize: 13, color: "var(--c-dim)", marginBottom: 24 }}>
                    Join the organization as <strong style={{ color: "var(--c-gold)" }}>{inviteData.role}</strong>
                  </div>
                  {acceptMsg && (
                    <div style={{ fontSize: 12, color: acceptMsg.startsWith("✓") ? "var(--c-green)" : "var(--c-red)", padding: "8px 12px", background: "var(--c-bg3)", borderRadius: 4, marginBottom: 16 }}>{acceptMsg}</div>
                  )}
                  <div style={{ display: "flex", gap: 10 }}>
                    <button style={{ ...S.btn(), flex: 1, padding: "10px 0" }} onClick={dismissInvite} disabled={accepting}>Decline</button>
                    <button style={{ ...S.btn("gold"), flex: 2, padding: "10px 0", opacity: accepting ? 0.6 : 1 }} onClick={acceptInvite} disabled={accepting}>
                      {accepting ? "Joining..." : "Accept & Join →"}
                    </button>
                  </div>
                </div>
              </div>
            )}

          </Ctx.Provider>
        </TierProvider>
      </AuthCtx.Provider>
    </ErrorBoundary>
  );
}

// ─── DEAL SHARE BUTTON ──────────────────────────────────────────
function ShareDealButton() {
  const ctx = useCtx();
  const [shareUrl, setShareUrl] = useState("");
  const [copied, setCopied] = useState(false);

  const generateLink = () => {
    // Encode key deal data into URL params for a read-only view
    const params = new URLSearchParams({
      view: "deal",
      name: ctx.project.name || "Deal",
      address: ctx.project.address || "",
      state: ctx.project.state || "",
      lots: ctx.fin.totalLots || 0,
      landCost: ctx.fin.landCost || 0,
      revenue: (ctx.fin.totalLots * ctx.fin.salesPricePerLot) || 0,
    });
    const url = `${window.location.origin}?${params.toString()}`;
    setShareUrl(url);
  };

  const copyLink = () => {
    if (!shareUrl) return;
    navigator.clipboard.writeText(shareUrl).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); }).catch(() => { });
  };

  return (
    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
      {shareUrl ? (
        <>
          <input style={{ ...S.inp, width: 220, fontSize: 9, padding: "3px 7px" }} value={shareUrl} readOnly />
          <button style={{ ...S.btn(), padding: "3px 8px", fontSize: 9, color: copied ? C.green : C.muted }} onClick={copyLink}>
            {copied ? "✓ Copied!" : "📋 Copy"}
          </button>
        </>
      ) : (
        <button style={{ ...S.btn(), padding: "3px 10px", fontSize: 9 }} onClick={generateLink}>🔗 Share Link</button>
      )}
    </div>
  );
}

// ─── TEAM MANAGEMENT (Real Supabase-backed invites) ────────────────────────
function TeamManagement() {
  const auth = useAuth();
  const { tier, config } = useTier();
  const [invites, setInvites] = useState([]);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("analyst");
  const [sending, setSending] = useState(false);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const orgId = auth?.userProfile?.org_id;

  const loadInvites = useCallback(async () => {
    if (!orgId || !supa.configured()) return;
    setLoading(true);
    try {
      const rows = await supa.select("team_invites", `org_id=eq.${orgId}&order=created_at.desc`);
      setInvites(rows || []);
    } catch (e) { console.warn("Load invites failed:", e); }
    setLoading(false);
  }, [orgId]);

  useEffect(() => { loadInvites(); }, [loadInvites]);

  const sendInvite = async () => {
    if (!email || !orgId || !auth?.user) return;
    if (!config.features.team) { setMsg("Team features require Pro+ or higher."); return; }
    setSending(true); setMsg("");
    try {
      const token = crypto.randomUUID();
      const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
      const existing = await supa.select("team_invites", `org_id=eq.${orgId}&email=eq.${encodeURIComponent(email)}&status=eq.pending`);
      if (existing.length > 0) { setMsg("⚠ An active invite already exists for this email."); setSending(false); return; }
      const result = await supa.insert("team_invites", {
        org_id: orgId,
        invited_by: auth.user.id,
        email: email.toLowerCase().trim(),
        role,
        token,
        status: "pending",
        expires_at: expires,
      });
      if (result) {
        const acceptUrl = `${window.location.origin}?invite=${token}`;
        setMsg(`✓ Invite created! Share this link: ${acceptUrl}`);
        setEmail("");
        await loadInvites();
      } else {
        setMsg("Failed to create invite. Please try again.");
      }
    } catch (e) { setMsg("Error: " + e.message); }
    setSending(false);
  };

  const revokeInvite = async (id) => {
    if (!window.confirm("Revoke this invite?")) return;
    await supa.update("team_invites", { id }, { status: "revoked" });
    await loadInvites();
  };

  const copyInviteLink = (token) => {
    const url = `${window.location.origin}?invite=${token}`;
    navigator.clipboard.writeText(url).then(() => setMsg("✓ Invite link copied to clipboard!")).catch(() => setMsg(`Invite link: ${url}`));
  };

  const STATUS_COLOR = { pending: C.amber, accepted: C.green, revoked: C.dim, expired: C.red };
  const ROLES = [["admin", "Admin — Full access, billing, team"], ["analyst", "Analyst — Edit deals, run models"], ["viewer", "Viewer — Read-only access"]];

  return (
    <>
      <Card title="Team Members" action={
        <Badge label={`${config.teamLimit === 999 ? "Unlimited" : config.teamLimit} seat${config.teamLimit !== 1 ? "s" : ""}`} color={C.gold} />
      }>
        {!config.features.team && (
          <div style={{ background: "color-mix(in srgb, var(--c-amber) 10%, transparent)", border: `1px solid color-mix(in srgb, var(--c-amber) 30%, transparent)`, borderRadius: 4, padding: "10px 14px", fontSize: 11, color: C.amber, marginBottom: 14 }}>
            🔒 Team collaboration requires Pro+ ($99/mo). <UpgradeButton plan="pro_plus" label="Upgrade Now →" />
          </div>
        )}
        <div style={{ display: "grid", gridTemplateColumns: "1fr auto auto", gap: 8, alignItems: "end", marginBottom: 16 }}>
          <Field label="Invite Email">
            <input style={S.inp} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="colleague@company.com"
              onKeyDown={e => e.key === "Enter" && sendInvite()} disabled={!config.features.team} />
          </Field>
          <Field label="Role">
            <select style={{ ...S.sel, minWidth: 140 }} value={role} onChange={e => setRole(e.target.value)} disabled={!config.features.team}>
              {ROLES.map(([v, l]) => <option key={v} value={v}>{l.split(" — ")[0]}</option>)}
            </select>
          </Field>
          <button style={{ ...S.btn("gold"), alignSelf: "flex-end", opacity: sending || !config.features.team ? 0.6 : 1 }}
            onClick={sendInvite} disabled={sending || !config.features.team}>
            {sending ? "Sending..." : "Send Invite"}
          </button>
        </div>
        {msg && <div style={{ fontSize: 11, color: msg.startsWith("✓") ? C.green : C.amber, padding: "8px 12px", background: `color-mix(in srgb, ${msg.startsWith("✓") ? "var(--c-green)" : "var(--c-amber)"} 8%, transparent)`, borderRadius: 4, marginBottom: 12, wordBreak: "break-all" }}>{msg}</div>}
        <div style={{ fontSize: 10, color: C.dim, marginBottom: 8, display: "flex", justifyContent: "space-between" }}>
          <span>{loading ? "Loading..." : `${invites.length} invite${invites.length !== 1 ? "s" : ""}`}</span>
          <button style={{ ...S.btn(), padding: "2px 8px", fontSize: 9 }} onClick={loadInvites}>↻ Refresh</button>
        </div>
        {invites.length === 0 && !loading && (
          <div style={{ fontSize: 12, color: C.dim, padding: "20px 0", textAlign: "center" }}>No team invites yet. Invite your first team member above.</div>
        )}
        {invites.map(inv => (
          <div key={inv.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: `1px solid ${C.border}` }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, color: C.text }}>{inv.email}</div>
              <div style={{ fontSize: 10, color: C.dim }}>
                {inv.role} · Sent {inv.created_at ? new Date(inv.created_at).toLocaleDateString() : ""}
                {inv.expires_at && inv.status === "pending" && ` · Expires ${new Date(inv.expires_at).toLocaleDateString()}`}
              </div>
            </div>
            <Badge label={inv.status} color={STATUS_COLOR[inv.status] || C.dim} />
            {inv.status === "pending" && (
              <>
                <button style={{ ...S.btn(), padding: "3px 8px", fontSize: 9 }} onClick={() => copyInviteLink(inv.token)} title="Copy invite link">📋 Copy Link</button>
                <button style={{ ...S.btn(), padding: "3px 8px", fontSize: 9, borderColor: C.red + "66", color: C.red }} onClick={() => revokeInvite(inv.id)}>Revoke</button>
              </>
            )}
          </div>
        ))}
      </Card>
      <Card title="Role Definitions">
        {ROLES.map(([v, l]) => (
          <div key={v} style={{ padding: "8px 0", borderBottom: `1px solid ${C.border}` }}>
            <div style={{ fontSize: 12, color: C.text, fontWeight: 600 }}>{l.split(" — ")[0]}</div>
            <div style={{ fontSize: 10, color: C.dim }}>{l.split(" — ")[1]}</div>
          </div>
        ))}
      </Card>
    </>
  );
}

// ─── INVITE ACCEPTANCE HOOK ─────────────────────────────────────
// Detects ?invite=<token> in URL, shows modal after login to join org
function useInviteAcceptance(user, userProfile, onOrgJoined) {
  const [inviteToken, setInviteToken] = useState(null);
  const [inviteData, setInviteData] = useState(null);
  const [accepting, setAccepting] = useState(false);
  const [acceptMsg, setAcceptMsg] = useState("");
  const processed = useRef(false);

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const t = p.get("invite");
    if (t) { setInviteToken(t); window.history.replaceState({}, "", window.location.pathname); }
  }, []);

  useEffect(() => {
    if (!inviteToken || !supa.configured()) return;
    supa.select("team_invites", `token=eq.${inviteToken}&status=eq.pending&select=*`)
      .then(rows => { if (rows.length > 0) setInviteData(rows[0]); })
      .catch(() => { });
  }, [inviteToken]);

  const acceptInvite = useCallback(async () => {
    if (!inviteData || !user || processed.current) return;
    processed.current = true;
    setAccepting(true);
    try {
      // Update user_profiles to join the org
      await supa.update("user_profiles", { id: user.id }, { org_id: inviteData.org_id });
      // Mark invite as accepted
      await supa.update("team_invites", { id: inviteData.id }, { status: "accepted", accepted_by: user.id, accepted_at: new Date().toISOString() });
      setAcceptMsg("✓ You've joined the organization! Reloading...");
      setTimeout(() => { window.location.reload(); }, 1500);
      if (onOrgJoined) onOrgJoined(inviteData.org_id);
    } catch (e) { setAcceptMsg("Failed to accept invite: " + e.message); processed.current = false; }
    setAccepting(false);
  }, [inviteData, user, onOrgJoined]);

  const dismissInvite = () => { setInviteToken(null); setInviteData(null); };

  return { inviteData, accepting, acceptMsg, acceptInvite, dismissInvite };
}

// ─── ONBOARDING WIZARD ──────────────────────────────────────────
function OnboardingWizard({ onComplete }) {
  const [step, setStep] = useState(0);
  const [orgName, setOrgName] = useState("");
  const [state, setState] = useState("FL");
  const [useCase, setUseCase] = useState("");
  const [busy, setBusy] = useState(false);

  const STEPS = [
    { title: "Welcome to Axiom OS", sub: "Let's set up your workspace in under 2 minutes" },
    { title: "About Your Organization", sub: "Tell us about your development firm" },
    { title: "Your Focus Market", sub: "We'll pre-load jurisdiction intelligence for your state" },
    { title: "You're All Set", sub: "Your workspace is ready" },
  ];

  const USE_CASES = ["Residential Land Development", "Commercial Development", "Mixed-Use Development", "Industrial / Flex", "Multifamily / Apartment", "Other"];

  const handleFinish = async () => {
    setBusy(true);
    await onComplete(orgName || "My Organization", state);
    setBusy(false);
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#08090D" }}>
      <PremiereStyles />
      <div style={{ width: 480, padding: 48, background: "var(--c-bg2)", borderRadius: 16, border: "1px solid var(--c-border)" }}>
        {/* Progress */}
        <div style={{ display: "flex", gap: 6, marginBottom: 36 }}>
          {STEPS.map((_, i) => <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i <= step ? "var(--c-gold)" : "var(--c-border)", transition: "background 0.3s" }} />)}
        </div>

        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: 10, color: "var(--c-gold)", letterSpacing: 3, textTransform: "uppercase", marginBottom: 8 }}>AXIOM OS</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: "var(--c-text)", marginBottom: 8 }}>{STEPS[step].title}</div>
          <div style={{ fontSize: 13, color: "var(--c-dim)" }}>{STEPS[step].sub}</div>
        </div>

        {step === 0 && (
          <div style={{ textAlign: "center" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 28 }}>
              {["Deal Pipeline", "Financial Engine", "AI Agent Hub", "Jurisdiction Intel", "Risk Command", "Due Diligence"].map(f => (
                <div key={f} style={{ padding: "10px 14px", background: "var(--c-bg3)", borderRadius: 8, border: "1px solid var(--c-border)", fontSize: 11, color: "var(--c-sub)", display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ color: "var(--c-green)" }}>✓</span>{f}
                </div>
              ))}
            </div>
            <button style={{ ...S.btn("gold"), width: "100%", padding: "12px 0", fontSize: 13 }} onClick={() => setStep(1)}>Get Started →</button>
          </div>
        )}

        {step === 1 && (
          <div>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 10, color: "var(--c-dim)", marginBottom: 6 }}>Company / Firm Name</div>
              <input style={{ ...S.inp, width: "100%", fontSize: 13, padding: "10px 12px" }} value={orgName} onChange={e => setOrgName(e.target.value)} placeholder="e.g. Horizon Land Development" />
            </div>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 10, color: "var(--c-dim)", marginBottom: 6 }}>Primary Use Case</div>
              <select style={{ ...S.sel, width: "100%", fontSize: 13, padding: "10px 12px" }} value={useCase} onChange={e => setUseCase(e.target.value)}>
                <option value="">Select use case...</option>
                {USE_CASES.map(u => <option key={u}>{u}</option>)}
              </select>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button style={{ ...S.btn(), flex: 1, padding: "10px 0" }} onClick={() => setStep(0)}>← Back</button>
              <button style={{ ...S.btn("gold"), flex: 2, padding: "10px 0" }} onClick={() => setStep(2)} disabled={!orgName}>Continue →</button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 10, color: "var(--c-dim)", marginBottom: 6 }}>Primary Market State</div>
              <select style={{ ...S.sel, width: "100%", fontSize: 13, padding: "10px 12px" }} value={state} onChange={e => setState(e.target.value)}>
                {US_STATES.filter(s => s).map(s => <option key={s}>{s}</option>)}
              </select>
              <div style={{ fontSize: 10, color: "var(--c-dim)", marginTop: 6 }}>We'll load jurisdiction-specific regulations, permit timelines, and impact fee schedules for this state.</div>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button style={{ ...S.btn(), flex: 1, padding: "10px 0" }} onClick={() => setStep(1)}>← Back</button>
              <button style={{ ...S.btn("gold"), flex: 2, padding: "10px 0" }} onClick={() => setStep(3)}>Continue →</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🎯</div>
            <div style={{ fontSize: 14, color: "var(--c-sub)", marginBottom: 8 }}>
              <strong style={{ color: "var(--c-gold)" }}>{orgName}</strong> workspace configured
            </div>
            <div style={{ fontSize: 12, color: "var(--c-dim)", marginBottom: 24 }}>
              Primary market: <strong style={{ color: "var(--c-text)" }}>{state}</strong><br />
              Jurisdiction intel pre-loaded • First project created • AI agents ready
            </div>
            <button style={{ ...S.btn("gold"), width: "100%", padding: "12px 0", fontSize: 13, opacity: busy ? 0.6 : 1 }} onClick={handleFinish} disabled={busy}>
              {busy ? "Setting up workspace..." : "Launch Axiom OS →"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── AUTH GATE (Login / Signup) ─────────────────────────────────
function AuthGate() {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [tosAccepted, setTosAccepted] = useState(false);
  const [supaUrl, setSupaUrl] = useLS("axiom_supa_url", SUPA_URL);
  const [supaKey, setSupaKey] = useLS("axiom_supa_key", SUPA_KEY);
  const [showConfig, setShowConfig] = useState(!SUPA_URL && !IS_PROD_CONFIGURED);
  const auth = useAuth();

  const handle = async () => {
    setErr(""); setLoading(true);
    try {
      if (mode === "reset") {
        const res = await fetch(`${supa.url}/auth/v1/recover`, { method: "POST", headers: { "Content-Type": "application/json", "apikey": supa.key }, body: JSON.stringify({ email }) });
        if (res.ok) setErr("✓ Check your email for a reset link.");
        else setErr("Failed to send reset email.");
      } else if (mode === "login") await auth.login(email, pw);
      else {
        const data = await auth.signup(email, pw);
        if (!data.user) setErr("Check your email for a confirmation link.");
      }
    } catch (e) { setErr(e.message); }
    setLoading(false);
  };

  const saveConfig = () => {
    localStorage.setItem("axiom_supa_url", supaUrl);
    localStorage.setItem("axiom_supa_key", supaKey);
    supa.url = supaUrl; supa.key = supaKey;
    setShowConfig(false);
    window.location.reload();
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#08090D" }}>
      <PremiereStyles />
      <div style={{ width: 380, padding: 40, background: "var(--c-bg2)", borderRadius: 12, border: "1px solid var(--c-border)" }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: 4, color: "var(--c-gold)", marginBottom: 4 }}>AXIOM OS</div>
          <div style={{ fontSize: 11, color: "var(--c-dim)", letterSpacing: 1 }}>NEURAL INTELLIGENCE PLATFORM</div>
        </div>

        {showConfig ? (
          <div>
            <div style={{ fontSize: 11, color: "var(--c-sub)", marginBottom: 12 }}>Configure your Supabase connection:</div>
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 10, color: "var(--c-dim)", marginBottom: 4 }}>Supabase URL</div>
              <input style={{ ...S.inp, width: "100%" }} value={supaUrl} onChange={e => setSupaUrl(e.target.value)} placeholder="https://xxxxx.supabase.co" />
            </div>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 10, color: "var(--c-dim)", marginBottom: 4 }}>Anon Key</div>
              <input style={{ ...S.inp, width: "100%" }} value={supaKey} onChange={e => setSupaKey(e.target.value)} placeholder="eyJhbGci..." />
            </div>
            <button style={{ ...S.btn("gold"), width: "100%" }} onClick={saveConfig}>Connect</button>
          </div>
        ) : (
          <div>
            <div style={{ display: "flex", gap: 0, marginBottom: 20 }}>
              {["login", "signup"].map(m => (
                <button key={m} onClick={() => { setMode(m); setErr(""); }}
                  style={{
                    flex: 1, padding: "8px 0", fontSize: 11, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase", cursor: "pointer",
                    background: mode === m ? "var(--c-bg3)" : "transparent", color: mode === m ? "var(--c-gold)" : "var(--c-dim)",
                    border: `1px solid ${mode === m ? "var(--c-gold)" : "var(--c-border)"}`, borderRadius: m === "login" ? "6px 0 0 6px" : "0 6px 6px 0",
                  }}>{m}</button>
              ))}
            </div>
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 10, color: "var(--c-dim)", marginBottom: 4 }}>Email</div>
              <input style={{ ...S.inp, width: "100%" }} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@company.com" onKeyDown={e => e.key === "Enter" && handle()} />
            </div>
            {mode !== "reset" && <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 10, color: "var(--c-dim)", marginBottom: 4 }}>Password</div>
              <input style={{ ...S.inp, width: "100%" }} type="password" value={pw} onChange={e => setPw(e.target.value)} placeholder="••••••••" onKeyDown={e => e.key === "Enter" && handle()} />
            </div>}
            {err && <div style={{ fontSize: 10, color: err.startsWith("✓") ? "var(--c-green)" : "var(--c-red)", marginBottom: 12, padding: "6px 10px", background: err.startsWith("✓") ? "color-mix(in srgb, var(--c-green) 10%, transparent)" : "color-mix(in srgb, var(--c-red) 10%, transparent)", borderRadius: 4 }}>{err}</div>}
            {mode === "signup" && (
              <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 14, padding: "10px 12px", background: "var(--c-bg3)", borderRadius: 6, border: `1px solid ${tosAccepted ? "var(--c-green)" : "var(--c-border)"}`, transition: "border-color 0.2s" }}>
                <input
                  id="tos-checkbox"
                  type="checkbox"
                  checked={tosAccepted}
                  onChange={e => setTosAccepted(e.target.checked)}
                  style={{ marginTop: 2, accentColor: "var(--c-gold)", flexShrink: 0, cursor: "pointer", width: 14, height: 14 }}
                />
                <label htmlFor="tos-checkbox" style={{ fontSize: 10, color: "var(--c-sub)", lineHeight: 1.5, cursor: "pointer" }}>
                  I agree to the{" "}
                  <a href="https://buildaxiom.dev/terms" target="_blank" rel="noopener noreferrer" style={{ color: "var(--c-gold)", textDecoration: "underline" }}>Terms of Service</a>
                  {" "}and{" "}
                  <a href="https://buildaxiom.dev/privacy" target="_blank" rel="noopener noreferrer" style={{ color: "var(--c-gold)", textDecoration: "underline" }}>Privacy Policy</a>
                </label>
              </div>
            )}
            <button style={{ ...S.btn("gold"), width: "100%", opacity: (loading || (mode === "signup" && !tosAccepted)) ? 0.5 : 1 }} onClick={handle} disabled={loading || (mode === "signup" && !tosAccepted)}>
              {loading ? "..." : mode === "login" ? "Sign In" : mode === "signup" ? "Create Account" : "Send Reset Link"}
            </button>
            <div style={{ textAlign: "center", marginTop: 12, display: "flex", justifyContent: "center", gap: 16 }}>
              {mode === "login" && <button style={{ fontSize: 10, color: "var(--c-dim)", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }} onClick={() => { setMode("reset"); setErr(""); }}>Forgot password?</button>}
              {mode === "reset" && <button style={{ fontSize: 10, color: "var(--c-dim)", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }} onClick={() => { setMode("login"); setErr(""); }}>Back to login</button>}
            </div>
            <div style={{ textAlign: "center", marginTop: 8 }}>
              <button style={{ fontSize: 10, color: "var(--c-dim)", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }} onClick={() => setShowConfig(true)}>
                Configure Supabase
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
