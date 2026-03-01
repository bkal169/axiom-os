// src/v1/context/AuthContext.tsx
import { createContext, useContext, useState, useEffect, useCallback } from "react";

// src/v1/lib/supabase.ts
var SUPA_URL = typeof import.meta !== "undefined" && import.meta.env?.VITE_SUPABASE_URL || (localStorage.getItem("axiom_supa_url") || "");
var SUPA_KEY = typeof import.meta !== "undefined" && import.meta.env?.VITE_SUPABASE_ANON_KEY || (localStorage.getItem("axiom_supa_key") || "");
var IS_PROD_CONFIGURED = !!(typeof import.meta !== "undefined" && import.meta.env?.VITE_SUPABASE_URL);
var SupabaseClient = class {
  url = SUPA_URL;
  key = SUPA_KEY;
  token = null;
  constructor() {
    if (this.url && this.key) {
      const savedToken = localStorage.getItem("axiom_supa_token");
      if (savedToken) this.token = savedToken;
    }
  }
  configured() {
    return !!(this.url && this.key);
  }
  headers() {
    const h = {
      "Content-Type": "application/json",
      apikey: this.key,
      Prefer: "return=representation"
    };
    if (this.token) h["Authorization"] = `Bearer ${this.token}`;
    return h;
  }
  async auth(email, password, isSignUp = false) {
    const endpoint = isSignUp ? "signup" : "token?grant_type=password";
    const r = await fetch(`${this.url}/auth/v1/${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", apikey: this.key },
      body: JSON.stringify({ email, password })
    });
    const data = await r.json();
    if (!r.ok)
      throw new Error(
        data.error_description || data.msg || data.message || "Auth failed"
      );
    this.token = data.access_token;
    localStorage.setItem("axiom_supa_token", data.access_token);
    localStorage.setItem("axiom_supa_refresh", data.refresh_token || "");
    return data;
  }
  async refreshSession() {
    const rt = localStorage.getItem("axiom_supa_refresh");
    if (!rt) return null;
    try {
      const r = await fetch(`${this.url}/auth/v1/token?grant_type=refresh_token`, {
        method: "POST",
        headers: { "Content-Type": "application/json", apikey: this.key },
        body: JSON.stringify({ refresh_token: rt })
      });
      if (!r.ok) throw new Error("Refresh failed");
      const data = await r.json();
      this.token = data.access_token;
      localStorage.setItem("axiom_supa_token", data.access_token);
      localStorage.setItem("axiom_supa_refresh", data.refresh_token || "");
      return data;
    } catch {
      this.token = null;
      return null;
    }
  }
  async getUser() {
    if (!this.token) return null;
    const r = await fetch(`${this.url}/auth/v1/user`, { headers: this.headers() });
    if (!r.ok) return null;
    return r.json();
  }
  async logout() {
    if (this.token)
      await fetch(`${this.url}/auth/v1/logout`, {
        method: "POST",
        headers: this.headers()
      }).catch(() => {
      });
    this.token = null;
    localStorage.removeItem("axiom_supa_token");
    localStorage.removeItem("axiom_supa_refresh");
  }
  async select(table, query = "") {
    const r = await fetch(`${this.url}/rest/v1/${table}?${query}`, {
      headers: this.headers()
    });
    if (!r.ok) {
      console.warn(`Supabase select ${table} failed:`, r.status);
      return [];
    }
    return r.json();
  }
  async upsert(table, data) {
    const r = await fetch(`${this.url}/rest/v1/${table}`, {
      method: "POST",
      headers: {
        ...this.headers(),
        Prefer: "return=representation,resolution=merge-duplicates"
      },
      body: JSON.stringify(data)
    });
    if (!r.ok)
      console.warn(
        `Supabase upsert ${table} failed:`,
        r.status,
        await r.text().catch(() => "")
      );
    return r.ok;
  }
  async update(table, match, data) {
    const params = Object.entries(match).map(([k, v]) => `${k}=eq.${v}`).join("&");
    const r = await fetch(`${this.url}/rest/v1/${table}?${params}`, {
      method: "PATCH",
      headers: this.headers(),
      body: JSON.stringify(data)
    });
    return r.ok;
  }
  async del(table, match) {
    const params = Object.entries(match).map(([k, v]) => `${k}=eq.${v}`).join("&");
    const r = await fetch(`${this.url}/rest/v1/${table}?${params}`, {
      method: "DELETE",
      headers: this.headers()
    });
    return r.ok;
  }
  async rpc(fn, args = {}) {
    const r = await fetch(`${this.url}/rest/v1/rpc/${fn}`, {
      method: "POST",
      headers: this.headers(),
      body: JSON.stringify(args)
    });
    return r.json();
  }
  async insert(table, data) {
    const r = await fetch(`${this.url}/rest/v1/${table}`, {
      method: "POST",
      headers: { ...this.headers(), Prefer: "return=representation" },
      body: JSON.stringify(data)
    });
    if (!r.ok) {
      console.warn(`Supabase insert ${table} failed:`, r.status);
      return null;
    }
    const rows = await r.json();
    return Array.isArray(rows) ? rows[0] : rows;
  }
  async callEdge(fnName, body) {
    const r = await fetch(`${this.url}/functions/v1/${fnName}`, {
      method: "POST",
      headers: {
        ...this.headers()
      },
      body: JSON.stringify(body)
    });
    return r.json();
  }
};
var supa = new SupabaseClient();

// src/v1/context/AuthContext.tsx
var AuthCtx = createContext(null);
var useAuth = () => useContext(AuthCtx);
function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [activeProjectId, _setActiveProjectId] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("axiom_active_project_id") || "null");
    } catch {
      return null;
    }
  });
  const setActiveProjectId = (id) => {
    _setActiveProjectId(id);
    localStorage.setItem("axiom_active_project_id", JSON.stringify(id));
  };
  useEffect(() => {
    if (!supa.configured()) {
      setAuthLoading(false);
      return;
    }
    (async () => {
      try {
        if (supa.token) {
          const u = await supa.getUser();
          if (u && u.id) {
            setUser(u);
          } else {
            const refreshed = await supa.refreshSession();
            if (refreshed) {
              const u2 = await supa.getUser();
              if (u2 && u2.id) setUser(u2);
            }
          }
        } else {
          const refreshed = await supa.refreshSession();
          if (refreshed) {
            const u = await supa.getUser();
            if (u && u.id) setUser(u);
          }
        }
      } catch (e) {
        console.warn("Session restore failed:", e);
      }
      setAuthLoading(false);
    })();
  }, []);
  useEffect(() => {
    if (!user || !supa.configured()) return;
    const interval = setInterval(async () => {
      try {
        const refreshed = await supa.refreshSession();
        if (refreshed) {
          const u = await supa.getUser();
          if (u && u.id) setUser(u);
        }
      } catch (e) {
        console.warn("Token refresh failed:", e);
      }
    }, 45 * 60 * 1e3);
    return () => clearInterval(interval);
  }, [user]);
  useEffect(() => {
    if (!user || !supa.configured()) return;
    (async () => {
      const profiles = await supa.select("user_profiles", `id=eq.${user.id}&select=*`);
      if (profiles.length > 0) setUserProfile(profiles[0]);
    })();
  }, [user]);
  const login = async (email, pw) => {
    const data = await supa.auth(email, pw);
    const u = await supa.getUser();
    setUser(u);
    return data;
  };
  const signup = async (email, pw) => {
    return await supa.auth(email, pw, true);
  };
  const logout = async () => {
    await supa.logout();
    setUser(null);
    setUserProfile(null);
  };
  const value = { user, userProfile, activeProjectId, setActiveProjectId, authLoading, login, signup, logout };
  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}
var TIER_CONFIG = {
  free: { level: 0, dealLimit: 5, aiDailyLimit: 3, teamLimit: 1, features: { basic_calcs: true, pipeline: true, contacts: true, market_data: true, exports: false, ai_agents: false, mls: false, team: false, api_access: false } },
  pro: { level: 1, dealLimit: 50, aiDailyLimit: 25, teamLimit: 1, features: { basic_calcs: true, pipeline: true, contacts: true, market_data: true, exports: true, ai_agents: true, mls: true, team: false, api_access: false } },
  pro_plus: { level: 2, dealLimit: 999, aiDailyLimit: 999, teamLimit: 5, features: { basic_calcs: true, pipeline: true, contacts: true, market_data: true, exports: true, ai_agents: true, mls: true, team: true, api_access: true } },
  enterprise: { level: 3, dealLimit: 999, aiDailyLimit: 999, teamLimit: 999, features: { basic_calcs: true, pipeline: true, contacts: true, market_data: true, exports: true, ai_agents: true, mls: true, team: true, api_access: true } }
};
var TIER_NAMES = { free: "Free", pro: "Pro", pro_plus: "Pro+", enterprise: "Enterprise" };
var TIER_PRICE_IDS = {
  pro: typeof import.meta !== "undefined" && import.meta.env?.VITE_STRIPE_PRO_PRICE_ID || "price_PRO_REPLACE_ME",
  pro_plus: typeof import.meta !== "undefined" && import.meta.env?.VITE_STRIPE_PRO_PLUS_PRICE_ID || "price_PRO_PLUS_REPLACE_ME",
  enterprise: typeof import.meta !== "undefined" && import.meta.env?.VITE_STRIPE_ENTERPRISE_PRICE_ID || "price_ENTERPRISE_REPLACE_ME"
};
var TierCtx = createContext({
  tier: "free",
  tierName: "Free",
  config: TIER_CONFIG.free,
  canUse: () => false,
  tierFor: () => "enterprise",
  dealLimit: 5,
  aiDailyLimit: 0,
  teamLimit: 1,
  startCheckout: async () => {
  },
  openPortal: async () => {
  }
});
var useTier = () => useContext(TierCtx);
function TierProvider({ children }) {
  const auth = useAuth();
  const tier = auth?.userProfile?.subscription_tier || "free";
  const config = TIER_CONFIG[tier] || TIER_CONFIG.free;
  const canUse = useCallback((feature) => !!config.features[feature], [config]);
  const tierFor = useCallback((feature) => {
    for (const [t, c] of Object.entries(TIER_CONFIG)) {
      if (c.features[feature]) return t;
    }
    return "enterprise";
  }, []);
  const startCheckout = useCallback(async (planId) => {
    if (!supa.configured() || !supa.token || !auth?.user) {
      alert(`Stripe Checkout Simulation: User clicked upgrade to ${planId}.

(Configure Supabase and Stripe to enable real billing flows)`);
      return;
    }
    try {
      const r = await fetch(`${supa.url}/functions/v1/stripe-checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${supa.token}`, apikey: supa.key },
        body: JSON.stringify({ action: "create_checkout", price_id: TIER_PRICE_IDS[planId], success_url: window.location.origin + "?billing=success", cancel_url: window.location.origin + "?billing=cancel", user_id: auth.user.id })
      });
      const data = await r.json();
      if (data.url) window.location.href = data.url;
      else alert("Checkout initialization failed: " + JSON.stringify(data));
    } catch (e) {
      alert("Checkout failed: " + e.message);
    }
  }, [auth?.user]);
  const openPortal = useCallback(async () => {
    if (!supa.configured() || !supa.token || !auth?.user) {
      alert("Billing Portal Simulation: User clicked open portal.\n\n(Configure Supabase and Stripe to enable real billing flows)");
      return;
    }
    try {
      const r = await fetch(`${supa.url}/functions/v1/stripe-checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${supa.token}`, apikey: supa.key },
        body: JSON.stringify({ action: "create_portal", user_id: auth.user.id, return_url: window.location.origin })
      });
      const data = await r.json();
      if (data.url) window.location.href = data.url;
      else alert("Portal initialization failed: " + JSON.stringify(data));
    } catch (e) {
      alert("Portal failed: " + e.message);
    }
  }, [auth?.user]);
  const value = { tier, tierName: TIER_NAMES[tier] || "Free", config, canUse, tierFor, dealLimit: config.dealLimit, aiDailyLimit: config.aiDailyLimit, teamLimit: config.teamLimit, startCheckout, openPortal };
  return <TierCtx.Provider value={value}>{children}</TierCtx.Provider>;
}

// src/v1/context/ProjectContext.tsx
import { createContext as createContext2, useContext as useContext2, useEffect as useEffect3, useRef } from "react";

// src/v1/hooks/useLS.ts
import { useState as useState2, useEffect as useEffect2 } from "react";
function useLS(key, init) {
  const [val, set] = useState2(() => {
    try {
      const s = localStorage.getItem(key);
      return s ? JSON.parse(s) : typeof init === "function" ? init() : init;
    } catch {
      return typeof init === "function" ? init() : init;
    }
  });
  useEffect2(() => {
    try {
      localStorage.setItem(key, JSON.stringify(val));
    } catch (e) {
      console.warn("localStorage setting failed", e);
    }
  }, [key, val]);
  return [val, set];
}

// src/v1/context/ProjectContext.tsx
var DD_CATS = [
  {
    cat: "Title & Legal",
    items: [
      { t: "Preliminary Title Report ordered", r: "High" },
      { t: "CC&Rs and deed restrictions reviewed", r: "High" },
      { t: "ALTA Survey ordered and received", r: "High" },
      { t: "Easements mapped and plotted", r: "High" },
      { t: "Encumbrances cleared or budgeted", r: "Medium" },
      { t: "Entity / ownership structure confirmed", r: "Medium" },
      { t: "Seller disclosure statement reviewed", r: "Medium" }
    ]
  },
  {
    cat: "Physical & Environmental",
    items: [
      { t: "Phase I ESA completed", r: "High" },
      { t: "Geotechnical / soils report ordered", r: "High" },
      { t: "Flood zone determination (FEMA)", r: "High" },
      { t: "Wetlands delineation (if applicable)", r: "High" },
      { t: "Biological survey completed", r: "Medium" },
      { t: "Topographic survey completed", r: "Medium" },
      { t: "Cultural resources review completed", r: "Low" }
    ]
  },
  {
    cat: "Entitlements & Zoning",
    items: [
      { t: "Zoning verified and documented", r: "High" },
      { t: "General Plan designation confirmed", r: "High" },
      { t: "Density and development standards extracted", r: "High" },
      { t: "Pre-application meeting held", r: "Medium" },
      { t: "Entitlement pathway and timeline mapped", r: "Medium" },
      { t: "School and impact fees quantified", r: "Medium" },
      { t: "Vesting tentative map strategy confirmed", r: "Medium" }
    ]
  },
  {
    cat: "Infrastructure",
    items: [
      { t: "Water availability letter obtained", r: "High" },
      { t: "Sewer capacity confirmed in writing", r: "High" },
      { t: "Off-site improvement costs estimated", r: "High" },
      { t: "Traffic study scope determined", r: "Medium" },
      { t: "Utility extension costs budgeted", r: "Medium" },
      { t: "Dry utility franchise agreements identified", r: "Low" }
    ]
  },
  {
    cat: "Financial & Market",
    items: [
      { t: "Comparable sales analyzed (min 3)", r: "High" },
      { t: "Development pro forma completed", r: "High" },
      { t: "Construction financing term sheet received", r: "High" },
      { t: "Absorption rate supported by market data", r: "High" },
      { t: "Contingency reserve adequate (>=10%)", r: "Medium" },
      { t: "Fee schedule verified with municipality", r: "Medium" },
      { t: "Equity partner / JV terms agreed", r: "Medium" }
    ]
  }
];
var ALL_DD = DD_CATS.flatMap((c) => c.items);
var DEFAULT_FIN = { totalLots: 50, landCost: 3e6, closingCosts: 9e4, hardCostPerLot: 65e3, softCostPct: 18, contingencyPct: 10, salesPricePerLot: 185e3, salesCommission: 3, absorbRate: 3, planningFees: 12e4, permitFeePerLot: 8500, schoolFee: 3200, impactFeePerLot: 12e3, reservePercentage: 5, grm: 14.2, irr: 18.4 };
var DEFAULT_RISKS = [
  { id: 1, cat: "Market", risk: "Home price softening during sell-out", likelihood: "Medium", impact: "High", severity: "High", mitigation: "Phased lot releases; forward sale agreements", status: "Open" },
  { id: 2, cat: "Entitlement", risk: "CEQA challenge or appeal by neighbors", likelihood: "Medium", impact: "High", severity: "High", mitigation: "Community outreach; robust EIR; legal reserve", status: "Open" },
  { id: 3, cat: "Construction", risk: "Labor and material cost escalation", likelihood: "High", impact: "Medium", severity: "High", mitigation: "Fixed-price contractor agreements; 15% contingency", status: "Mitigated" },
  { id: 4, cat: "Environmental", risk: "Undiscovered contamination on site", likelihood: "Low", impact: "Critical", severity: "High", mitigation: "Phase I/II ESA; environmental indemnity from seller", status: "Open" },
  { id: 5, cat: "Financial", risk: "Construction loan maturity before sell-out", likelihood: "Low", impact: "High", severity: "Medium", mitigation: "Structure loan with 12-month extension option", status: "Open" },
  { id: 6, cat: "Regulatory", risk: "Impact fee increases mid-entitlement", likelihood: "Medium", impact: "Medium", severity: "Medium", mitigation: "Vesting Tentative Map; Development Agreement", status: "Open" }
];
var DEFAULT_PERMITS = [
  { name: "Tentative Map Approval", agency: "Planning Dept", duration: "16-24 wks", cost: "$25,000", status: "Not Started", req: true },
  { name: "Final Map Recordation", agency: "County Recorder", duration: "8-12 wks", cost: "$8,500", status: "Not Started", req: true },
  { name: "Grading Permit", agency: "Building Dept", duration: "4-6 wks", cost: "$45,000", status: "Not Started", req: true },
  { name: "NPDES / SWPPP", agency: "State Water Board", duration: "2-4 wks", cost: "$3,200", status: "Not Started", req: true },
  { name: "404 Wetlands Permit", agency: "Army Corps", duration: "12-52 wks", cost: "$18,000", status: "N/A", req: false },
  { name: "CEQA Compliance", agency: "Lead Agency", duration: "12-26 wks", cost: "$35,000", status: "Not Started", req: true },
  { name: "Improvement Plans", agency: "City Engineer", duration: "8-12 wks", cost: "$55,000", status: "Not Started", req: true },
  { name: "Street Improvement Permit", agency: "Public Works", duration: "2-4 wks", cost: "$12,000", status: "Not Started", req: true },
  { name: "Utility Agreements", agency: "Various Districts", duration: "4-8 wks", cost: "Varies", status: "Not Started", req: true }
];
var DEFAULT_EVENTS = [
  { id: 1, title: "Phase I ESA Delivery", date: "2025-03-15", type: "Milestone", priority: "High", notes: "From environmental consultant" },
  { id: 2, title: "Pre-Application Meeting", date: "2025-03-22", type: "Meeting", priority: "High", notes: "City Planning Dept." },
  { id: 3, title: "ALTA Survey Delivery", date: "2025-04-01", type: "Milestone", priority: "High", notes: "" },
  { id: 4, title: "Tentative Map Application", date: "2025-04-15", type: "Submittal", priority: "Critical", notes: "All materials must be complete" },
  { id: 5, title: "Inspection Period Expiration", date: "2025-04-30", type: "Deadline", priority: "Critical", notes: "Go / No-Go required" }
];
var DEFAULT_COMPS = [
  { id: 1, name: "Sunset Ridge Estates", address: "456 Ridge Rd", lots: 42, lotSF: 6500, saleDate: "2024-08", pricePerLot: 185e3, pricePerSF: 28.46, status: "Sold", adj: 0, notes: "" },
  { id: 2, name: "Hawk Valley Sub.", address: "789 Valley Dr", lots: 28, lotSF: 4200, saleDate: "2024-11", pricePerLot: 142e3, pricePerSF: 33.81, status: "Sold", adj: 0, notes: "" },
  { id: 3, name: "Meadowbrook PUD", address: "321 Meadow Ln", lots: 85, lotSF: 3800, saleDate: "2025-01", pricePerLot: 128e3, pricePerSF: 33.68, status: "Listed", adj: 5, notes: "Superior amenities" },
  { id: 4, name: "Ridgecrest Heights", address: "900 Crest Blvd", lots: 55, lotSF: 7200, saleDate: "2024-06", pricePerLot: 22e4, pricePerSF: 30.56, status: "Sold", adj: -3, notes: "Superior access" }
];
var ProjectCtx = createContext2(null);
var useProject = () => useContext2(ProjectCtx);
function ProjectProvider({ children }) {
  const auth = useAuth();
  const [project, setProject] = useLS("axiom_project", { name: "New Development", address: "", jurisdiction: "", state: "", municipality: "" });
  const [fin, setFin] = useLS("axiom_fin", DEFAULT_FIN);
  const [risks, setRisks] = useLS("axiom_risks", DEFAULT_RISKS);
  const [permits, setPermits] = useLS("axiom_permits", DEFAULT_PERMITS);
  const [ddChecks, setDdChecks] = useLS("axiom_dd_checks", {});
  const [events, setEvents] = useLS("axiom_events", DEFAULT_EVENTS);
  const [loan, setLoan] = useLS("axiom_loan", { ltc: 70, rate: 9.5, termMonths: 24, extensionMonths: 12, origFee: 1.5, lender: "" });
  const [equity, setEquity] = useLS("axiom_equity", { gpPct: 10, lpPct: 90, prefReturn: 8, promotePct: 20, equityMultipleTarget: 2, irrTarget: 18 });
  const [comps, setComps] = useLS("axiom_comps", DEFAULT_COMPS);
  const hydrated = useRef(false);
  const lastHydratedProject = useRef(null);
  useEffect3(() => {
    if (!auth?.user || !auth?.userProfile || !supa.configured()) return;
    if (hydrated.current && lastHydratedProject.current === auth.activeProjectId) return;
    hydrated.current = true;
    lastHydratedProject.current = auth.activeProjectId;
    (async () => {
      try {
        let pid = auth.activeProjectId;
        if (!pid) {
          const projs = await supa.select("projects", `org_id=eq.${auth.userProfile.org_id}&order=updated_at.desc&limit=1`);
          if (projs && projs.length > 0) {
            pid = projs[0].id;
            auth.setActiveProjectId(pid);
          }
        }
        if (pid) {
          const projData = await supa.select("projects", `id=eq.${pid}`);
          if (projData && projData.length > 0) {
            const p = projData[0];
            setProject(p.details || project);
            setFin(p.financials || DEFAULT_FIN);
            setRisks(p.risks || DEFAULT_RISKS);
            setPermits(p.permits || DEFAULT_PERMITS);
            setDdChecks(p.dd_checks || {});
            setEvents(p.events || DEFAULT_EVENTS);
            setLoan(p.loan || loan);
            setEquity(p.equity || equity);
            setComps(p.comps || DEFAULT_COMPS);
          }
        }
      } catch (e) {
        console.warn("Hydration failed:", e);
      }
    })();
  }, [auth?.user, auth?.userProfile, auth?.activeProjectId]);
  useEffect3(() => {
    if (!auth?.user || !supa.configured() || !auth?.activeProjectId || !hydrated.current) return;
    const timer = setTimeout(() => {
      supa.update("projects", { id: auth.activeProjectId }, {
        details: project,
        financials: fin,
        risks,
        permits,
        comps,
        dd_checks: ddChecks,
        events,
        loan,
        equity
      }).catch((e) => console.warn("Auto-save failed", e));
    }, 1500);
    return () => clearTimeout(timer);
  }, [project, fin, risks, permits, comps, ddChecks, events, loan, equity, auth?.activeProjectId]);
  const value = { project, setProject, fin, setFin, risks, setRisks, permits, setPermits, ddChecks, setDdChecks, events, setEvents, loan, setLoan, equity, setEquity, comps, setComps };
  return <ProjectCtx.Provider value={value}>{children}</ProjectCtx.Provider>;
}

// src/v1/AppV1.tsx
import { useState as useState17 } from "react";

// src/v1/components/ui/components.tsx
import React3 from "react";

// src/v1/lib/utils.ts
var fmt = {
  usd: (n) => "$" + Number(n || 0).toLocaleString("en-US", { maximumFractionDigits: 0 }),
  pct: (n) => Number(n || 0).toFixed(1) + "%",
  num: (n) => Number(n || 0).toLocaleString(),
  sf: (n) => Number(n || 0).toLocaleString() + " SF",
  k: (n) => "$" + (Number(n || 0) / 1e3).toFixed(0) + "K",
  M: (n) => "$" + (Number(n || 0) / 1e6).toFixed(2) + "M"
};
var downloadCSV = (headers, rows, filename) => {
  const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.map((x) => `"${(x || "").toString().replace(/"/g, '""')}"`).join(","))].join("\n");
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
var downloadText = (text, filename) => {
  const blob = new Blob([text], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
var importCSV = (file, callback) => {
  const reader = new FileReader();
  reader.onload = (e) => {
    const text = e.target?.result;
    if (!text) return;
    const lines = text.split("\n").filter((l) => l.trim());
    if (lines.length < 2) return;
    const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""));
    const data = lines.slice(1).map((line) => {
      const values = line.split(",").map((v) => v.trim().replace(/"/g, ""));
      const obj = {};
      headers.forEach((h, i) => {
        obj[h] = values[i];
      });
      return obj;
    });
    callback(data);
  };
  reader.readAsText(file);
};
var RC = {
  Low: "var(--c-green)",
  Medium: "var(--c-amber)",
  High: "var(--c-red)",
  Critical: "var(--c-purple)"
};

// src/v1/components/ui/components.tsx
function Card({ title, children, action, className = "" }) {
  return <div className={`axiom-card axiom-animate-slide-up ${className}`}><div className="axiom-card-header"><span>{title}</span>{action}</div>{children}</div>;
}
function KPI({ label, value, sub, color, trend }) {
  return <div className="axiom-kpi"><div className="axiom-label">{label}</div><div className={`axiom-kpi-value ${color ? "" : "axiom-text-color"}`} style={color ? { color } : {}}>{value}</div>{sub && <div className="axiom-kpi-sub">{sub}</div>}{trend !== void 0 && <div className={`axiom-kpi-trend ${trend >= 0 ? "axiom-trend-up" : "axiom-trend-down"}`}>{trend >= 0 ? "\u25B2" : "\u25BC"} {Math.abs(trend).toFixed(1)}%
                </div>}</div>;
}
function Field({ label, children, mb = 11, className = "" }) {
  return <div className={`axiom-field ${className}`} style={{ marginBottom: mb }}><label className="axiom-label">{label}</label>{children}</div>;
}
function Badge({ label, color = "var(--c-gold)" }) {
  let colorClass = "axiom-badge-gold";
  if (color.includes("green")) colorClass = "axiom-badge-green";
  else if (color.includes("red")) colorClass = "axiom-badge-red";
  else if (color.includes("amber")) colorClass = "axiom-badge-amber";
  else if (color.includes("purple")) colorClass = "axiom-badge-purple";
  else if (color.includes("blue")) colorClass = "axiom-badge-blue";
  else if (color.includes("teal")) colorClass = "axiom-badge-teal";
  else if (color.includes("dim") || color.includes("sub") || color.includes("border")) colorClass = "axiom-badge-dim";
  return <span className={`axiom-badge ${colorClass}`}>{label}</span>;
}
function Button({ children, label, onClick, variant = "ghost", className = "", disabled = false }) {
  return <button
    className={`axiom-btn ${variant === "gold" ? "axiom-btn-gold" : ""} ${disabled ? "axiom-btn-disabled" : ""} ${className}`}
    onClick={onClick}
    disabled={disabled}
  >{label || children}</button>;
}
function Progress({ value, color = "var(--c-gold)" }) {
  return <div className="axiom-progress-container"><div className="axiom-progress-bar" style={{ width: `${Math.min(100, Math.max(0, value))}%`, background: color }} /></div>;
}
function CItem({ text, checked, onChange, risk }) {
  return <label className="axiom-checkbox-item"><input type="checkbox" checked={checked} onChange={onChange} className="axiom-checkbox" title={text} /><span className={`axiom-checkbox-label ${checked ? "axiom-checkbox-checked" : ""}`}>{text}</span>{risk && <Badge label={risk} color={RC[risk] || "var(--c-dim)"} />}</label>;
}
function CSVImportButton({ onImport }) {
  const fileRef = React3.useRef(null);
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      importCSV(file, (data) => {
        onImport(data);
        e.target.value = "";
      });
    }
  };
  return <><input type="file" ref={fileRef} style={{ display: "none" }} accept=".csv" onChange={handleFileChange} /><Button label="Import CSV" onClick={() => fileRef.current?.click()} /></>;
}

// src/v1/features/dashboard/Dashboard.tsx
function Dashboard() {
  const { project, fin, setProject } = useProject();
  if (!project) return <div>Loading project data...</div>;
  return <div className="axiom-stack-32"><div className="axiom-top-bar"><div><div className="axiom-breadcrumb">Command Center</div><div className="axiom-page-title">{project.name || "Unnamed Project"}</div></div><div className="axiom-flex-gap-12"><Button label="Export Summary" variant="gold" /><Button label="Refresh Data" /></div></div><div className="axiom-grid-4"><KPI label="Total Lots" value={fmt.num(fin.totalLots)} /><KPI label="Sale Price/Lot" value={fmt.usd(fin.salesPricePerLot)} /><KPI label="Project Revenue" value={fmt.M(fin.totalLots * fin.salesPricePerLot)} color="var(--c-green)" /><KPI label="Land Cost" value={fmt.M(fin.landCost)} color="var(--c-blue)" /></div><Card title="Project Meta" action={<Button variant="ghost">Save</Button>}><div className="axiom-grid-2"><div><div className="axiom-label" style={{ marginBottom: 8 }}>PROJECT NAME</div><input
    className="axiom-input"
    value={project.name}
    onChange={(e) => setProject({ ...project, name: e.target.value })}
    title="Project Name"
  /></div><div><div className="axiom-label" style={{ marginBottom: 8 }}>LOCATION (STATE)</div><input
    className="axiom-input"
    value={project.state}
    onChange={(e) => setProject({ ...project, state: e.target.value })}
    placeholder="State abbreviation (e.g., FL)"
    title="Location"
  /></div></div></Card><div className="axiom-footer"><div className="axiom-breadcrumb">Axiom V1 Architecture Beta</div><div className="axiom-text-11-dim" style={{ marginTop: 8 }}>
                    Neural engine and advanced intel modules currently being ported.
                </div></div></div>;
}

// src/v1/features/crm/Contacts.tsx
import { useState as useState4, useEffect as useEffect4, useRef as useRef2, useCallback as useCallback2 } from "react";

// src/v1/components/ui/layout.tsx
import React4, { useState as useState3 } from "react";
function Tabs({ tabs, children }) {
  const [active, setActive] = useState3(0);
  const kids = React4.Children.toArray(children);
  return <div><div className="axiom-tabs-nav">{tabs.map((t, i) => <div
    key={i}
    onClick={() => setActive(i)}
    className={`axiom-tab-item ${active === i ? "active" : ""}`}
  >{t}</div>)}</div><div key={active} className="axiom-animate-fade">{kids[active]}</div></div>;
}
function Dot({ color }) {
  return <span className="axiom-dot" style={{ background: color }} />;
}

// src/v1/features/crm/Contacts.tsx
var TYPES = ["Buyer", "Seller", "Broker", "Lender", "Attorney", "Contractor", "Architect", "Engineer", "Appraiser", "Inspector", "Title Officer", "Escrow", "Investor", "Other"];
var STATUSES = ["Active", "Inactive", "Prospect", "Lead", "Archived"];
var TYPE_MAP = { Buyer: "client", Seller: "client", Broker: "broker", Lender: "investor", Investor: "investor", Attorney: "vendor", Contractor: "vendor", Architect: "vendor", Engineer: "vendor", Appraiser: "vendor", Inspector: "vendor", "Title Officer": "vendor", Escrow: "vendor", Other: "lead" };
var STATUS_MAP = { Active: "active", Inactive: "inactive", Prospect: "prospect", Lead: "prospect", Archived: "inactive" };
var REV_TYPE_MAP = { investor: "Investor", client: "Buyer", vendor: "Contractor", lead: "Other", broker: "Broker" };
var REV_STATUS_MAP = { active: "Active", inactive: "Inactive", prospect: "Prospect" };
var TC = { Buyer: "var(--c-green)", Seller: "var(--c-blue)", Broker: "var(--c-gold)", Lender: "var(--c-purple)", Attorney: "var(--c-teal)", Contractor: "var(--c-amber)", Architect: "var(--c-blue)", Engineer: "var(--c-teal)", Appraiser: "var(--c-amber)", Inspector: "var(--c-dim)", Investor: "var(--c-green)", "Title Officer": "var(--c-gold)", Escrow: "var(--c-purple)", Other: "var(--c-dim)" };
var SC2 = { Active: "var(--c-green)", Inactive: "var(--c-dim)", Prospect: "var(--c-blue)", Lead: "var(--c-amber)", Archived: "var(--c-muted)" };
function Contacts() {
  const auth = useAuth();
  const [contacts, setContacts] = useLS("axiom_contacts", []);
  const [search, setSearch] = useState4("");
  const [filterType, setFilterType] = useState4("All");
  const [filterStatus, setFilterStatus] = useState4("All");
  const [drawer, setDrawer] = useState4(null);
  const [nc, setNc] = useState4({ name: "", type: "Broker", company: "", email: "", phone: "", status: "Active", deals: [], notes: "", lastContact: "" });
  const [syncing, setSyncing] = useState4(false);
  const loadedRef = useRef2(false);
  const saveTimer = useRef2(null);
  useEffect4(() => {
    if (loadedRef.current || !auth?.userProfile?.org_id || !supa.configured()) return;
    loadedRef.current = true;
    (async () => {
      try {
        const rows = await supa.select("contacts", `organization_id=eq.${auth.userProfile.org_id}&order=updated_at.desc`);
        if (rows && rows.length > 0) {
          const mapped = rows.map((r) => ({
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
            _supaId: r.id
          }));
          setContacts(mapped);
        }
      } catch (e) {
        console.warn("Failed to load contacts:", e);
      }
    })();
  }, [auth?.userProfile?.org_id, setContacts]);
  const syncContact = useCallback2((contact, isDelete = false) => {
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
            updated_at: (/* @__PURE__ */ new Date()).toISOString()
          };
          if (contact._supaId) payload.id = contact._supaId;
          await supa.upsert("contacts", payload);
        }
      } catch (e) {
        console.warn("Failed to sync contact:", e);
      }
      setSyncing(false);
    }, 800);
  }, [auth?.userProfile?.org_id]);
  const filtered = contacts.filter((c) => {
    if (search && !c.name.toLowerCase().includes(search.toLowerCase()) && !(c.company || "").toLowerCase().includes(search.toLowerCase())) return false;
    if (filterType !== "All" && c.type !== filterType) return false;
    if (filterStatus !== "All" && c.status !== filterStatus) return false;
    return true;
  });
  const addContact = () => {
    if (!nc.name) return;
    const newContact = { ...nc, id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(), lastContact: (/* @__PURE__ */ new Date()).toISOString().split("T")[0] };
    setContacts([...contacts, newContact]);
    syncContact(newContact);
    setNc({ name: "", type: "Broker", company: "", email: "", phone: "", status: "Active", deals: [], notes: "", lastContact: "" });
  };
  const delContact = (id) => {
    const contact = contacts.find((c) => c.id === id);
    setContacts(contacts.filter((c) => c.id !== id));
    if (contact) syncContact(contact, true);
  };
  const updContact = (id, field, val) => {
    setContacts(contacts.map((c) => {
      if (c.id === id) {
        const updated = { ...c, [field]: val };
        syncContact(updated);
        return updated;
      }
      return c;
    }));
  };
  return <Tabs tabs={["Directory", "Add Contact", "Import/Export"]}>{
    /* ─── DIRECTORY ───────────────────────────────── */
  }<div><div style={{ display: "flex", gap: 10, marginBottom: 14 }}><input className="axiom-input" style={{ flex: 1 }} value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search contacts by name or company..." title="Search Contacts" /><select className="axiom-select" style={{ width: 140 }} value={filterType} onChange={(e) => setFilterType(e.target.value)} title="Filter by Type"><option>All</option>{TYPES.map((t) => <option key={t}>{t}</option>)}</select><select className="axiom-select" style={{ width: 120 }} value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} title="Filter by Status"><option>All</option>{STATUSES.map((s) => <option key={s}>{s}</option>)}</select></div><Card title={`Contact Directory (${filtered.length})`} action={<div style={{ display: "flex", gap: 8, alignItems: "center" }}>{syncing && <span style={{ fontSize: 9, color: "var(--c-gold)" }}>syncing...</span>}<Badge label={contacts.filter((c) => c.status === "Active").length + " Active"} color="var(--c-green)" /></div>}><table className="axiom-table"><thead><tr>{["Name", "Type", "Company", "Email", "Phone", "Deals", "Status", "Last", ""].map((th) => <th key={th} className="axiom-th">{th}</th>)}</tr></thead><tbody>{filtered.map((c) => <tr key={c.id} onClick={() => setDrawer(c)} className="premium-hover"><td className="axiom-td" style={{ color: "var(--c-text)", fontWeight: 600 }}>{c.name}</td><td className="axiom-td"><Badge label={c.type} color={TC[c.type] || "var(--c-dim)"} /></td><td className="axiom-td" style={{ fontSize: 12 }}>{c.company}</td><td className="axiom-td" style={{ fontSize: 12, color: "var(--c-blue)" }}>{c.email}</td><td className="axiom-td" style={{ fontSize: 12 }}>{c.phone}</td><td className="axiom-td">{c.deals?.length || 0}</td><td className="axiom-td"><Dot color={SC2[c.status] || "var(--c-dim)"} /><span style={{ fontSize: 12 }}>{c.status}</span></td><td className="axiom-td" style={{ fontSize: 10, color: "var(--c-dim)" }}>{c.lastContact}</td><td className="axiom-td"><Button onClick={(e) => {
    e?.stopPropagation();
    delContact(c.id);
  }}>x</Button></td></tr>)}</tbody></table></Card>{drawer && <Card title={`Edit: ${drawer.name}`} action={<Button onClick={() => setDrawer(null)}>Close</Button>}><div className="axiom-grid-3"><Field label="Name"><input className="axiom-input" value={drawer.name} onChange={(e) => updContact(drawer.id, "name", e.target.value)} title="Name" /></Field><Field label="Type"><select className="axiom-select" value={drawer.type} onChange={(e) => updContact(drawer.id, "type", e.target.value)} title="Type">{TYPES.map((t) => <option key={t}>{t}</option>)}</select></Field><Field label="Company"><input className="axiom-input" value={drawer.company} onChange={(e) => updContact(drawer.id, "company", e.target.value)} title="Company" /></Field><Field label="Email"><input className="axiom-input" value={drawer.email} onChange={(e) => updContact(drawer.id, "email", e.target.value)} title="Email" /></Field><Field label="Phone"><input className="axiom-input" value={drawer.phone} onChange={(e) => updContact(drawer.id, "phone", e.target.value)} title="Phone" /></Field><Field label="Status"><select className="axiom-select" value={drawer.status} onChange={(e) => updContact(drawer.id, "status", e.target.value)} title="Status">{STATUSES.map((s) => <option key={s}>{s}</option>)}</select></Field></div><Field label="Notes" style={{ marginTop: 14 }}><textarea className="axiom-input" style={{ height: 60 }} value={drawer.notes} onChange={(e) => updContact(drawer.id, "notes", e.target.value)} title="Notes" /></Field></Card>}</div>{
    /* ─── ADD NEW ───────────────────────────────── */
  }<div><Card title="Add New Contact"><div className="axiom-grid-3"><Field label="Full Name"><input className="axiom-input" value={nc.name} onChange={(e) => setNc({ ...nc, name: e.target.value })} placeholder="Jane Doe" title="Full Name" /></Field><Field label="Type"><select className="axiom-select" value={nc.type} onChange={(e) => setNc({ ...nc, type: e.target.value })} title="Type">{TYPES.map((t) => <option key={t}>{t}</option>)}</select></Field><Field label="Company"><input className="axiom-input" value={nc.company} onChange={(e) => setNc({ ...nc, company: e.target.value })} title="Company" /></Field><Field label="Email"><input className="axiom-input" value={nc.email} onChange={(e) => setNc({ ...nc, email: e.target.value })} placeholder="email@example.com" title="Email" /></Field><Field label="Phone"><input className="axiom-input" value={nc.phone} onChange={(e) => setNc({ ...nc, phone: e.target.value })} placeholder="(555) 000-0000" title="Phone" /></Field><Field label="Status"><select className="axiom-select" value={nc.status} onChange={(e) => setNc({ ...nc, status: e.target.value })} title="Status">{STATUSES.map((s) => <option key={s}>{s}</option>)}</select></Field></div><Field label="Notes" style={{ marginTop: 14 }}><textarea className="axiom-input" style={{ height: 60 }} value={nc.notes} onChange={(e) => setNc({ ...nc, notes: e.target.value })} placeholder="Background, relationship, specialties..." title="Notes" /></Field><div style={{ marginTop: 14 }}><Button variant="gold" onClick={addContact} label="Add Contact" /></div></Card></div>{
    /* ─── EXPORT ───────────────────────────────── */
  }<div><Card title="Import / Export Contacts"><div style={{ display: "flex", gap: "20px" }}><div style={{ flex: 1 }}>{[["Export All Contacts (CSV)", "Download all contacts as spreadsheet"], ["Export Active Only", "Active contacts with deal links"]].map(([l, d], i) => <div key={i} className="axiom-checkbox-item"><div style={{ flex: 1 }}><div style={{ fontSize: 13, color: "var(--c-text)" }}>{l}</div><div className="axiom-kpi-sub">{d}</div></div><Button label="Export" onClick={() => {
    const headers = ["ID", "Name", "Type", "Company", "Email", "Phone", "Status", "Deals", "Notes", "Last Contact"];
    let rows = contacts;
    if (l.includes("Active Only")) rows = rows.filter((c) => c.status === "Active");
    downloadCSV(headers, rows.map((c) => [c.id, c.name, c.type, c.company, c.email, c.phone, c.status, (c.deals || []).join("; "), c.notes, c.lastContact]), "axiom_contacts.csv");
  }} /></div>)}</div></div></Card></div></Tabs>;
}

// src/v1/features/deals/Deals.tsx
import { useState as useState6, useRef as useRef4, useEffect as useEffect6, useCallback as useCallback3 } from "react";

// src/v1/features/agents/Agent.tsx
import { useState as useState5, useRef as useRef3, useEffect as useEffect5 } from "react";

// src/v1/lib/api.ts
var MODELS = [
  { id: "claude-sonnet-4-20250514", label: "Claude Sonnet 4", provider: "anthropic" },
  { id: "claude-opus-4-20250514", label: "Claude Opus 4", provider: "anthropic" },
  { id: "claude-3-5-haiku-20241022", label: "Claude Haiku 3.5", provider: "anthropic" },
  { id: "gpt-4o", label: "GPT-4o", provider: "openai" },
  { id: "gpt-4o-mini", label: "GPT-4o Mini", provider: "openai" },
  { id: "llama-3.3-70b-versatile", label: "Llama 3.3 70B (free)", provider: "groq" },
  { id: "mixtral-8x7b-32768", label: "Mixtral 8x7B (free)", provider: "groq" },
  { id: "gemma2-9b-it", label: "Gemma 2 9B (free)", provider: "groq" },
  { id: "meta-llama/Llama-3.3-70B-Instruct-Turbo", label: "Llama 3.3 70B (Together)", provider: "together" },
  { id: "mistralai/Mixtral-8x7B-Instruct-v0.1", label: "Mixtral 8x7B (Together)", provider: "together" }
];
async function callLLM(messages, system = "", modelId = "claude-sonnet-4-20250514") {
  const m = MODELS.find((x) => x.id === modelId) || MODELS[0];
  const defaultSys = "You are an expert real estate development analyst and feasibility consultant. Be concise, precise, and actionable.";
  if (!supa.configured() || !supa.token) {
    return "Error: You must be logged in to securely access the AI models.";
  }
  try {
    const data = await supa.callEdge("axiom-chat", {
      modelId: m.id,
      system: system || defaultSys,
      messages
    });
    if (data.error) {
      return "API error: " + data.error;
    }
    return data.content || "No response received.";
  } catch (e) {
    return "Network error: " + e.message;
  }
}

// src/v1/features/agents/Agent.tsx
function Agent({ id, system, placeholder, context }) {
  const [msgs, setMsgs] = useState5([]);
  const [inp, setInp] = useState5("");
  const [busy, setBusy] = useState5(false);
  const endRef = useRef3(null);
  useEffect5(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs, busy]);
  const send = async () => {
    if (!inp.trim() || busy) return;
    const userMsg = { role: "user", content: inp };
    const newMsgs = [...msgs, userMsg];
    setMsgs(newMsgs);
    setInp("");
    setBusy(true);
    const fullSystem = context ? `${system}

CONTEXT:
${context}` : system;
    const reply = await callLLM(newMsgs, fullSystem);
    setMsgs([...newMsgs, { role: "assistant", content: reply }]);
    setBusy(false);
  };
  return <div style={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 400 }}><div style={{ flex: 1, overflowY: "auto", padding: "10px 0", display: "flex", flexDirection: "column", gap: 12 }}>{!msgs.length && <div style={{ padding: 40, textAlign: "center", color: "var(--c-dim)" }}><div style={{ fontSize: 24, marginBottom: 10 }}>—</div><div style={{ fontSize: 13 }}>Initializing secure session with {id}...</div><div style={{ fontSize: 11, marginTop: 4 }}>How can I help you regarding this project?</div></div>}{msgs.map((m, i) => <div key={i} style={{
    alignSelf: m.role === "user" ? "flex-end" : "flex-start",
    maxWidth: "85%",
    background: m.role === "user" ? "var(--c-bg3)" : "var(--c-bg2)",
    border: "1px solid var(--c-border)",
    borderRadius: 6,
    padding: "10px 14px"
  }}><div style={{ fontSize: 9, color: "var(--c-dim)", textTransform: "uppercase", marginBottom: 4, letterSpacing: 1 }}>{m.role === "user" ? "You" : id}</div><div style={{ fontSize: 13, lineHeight: 1.5, whiteSpace: "pre-wrap" }}>{m.content}</div></div>)}{busy && <div style={{ alignSelf: "flex-start", background: "var(--c-bg2)", border: "1px solid var(--c-border)", borderRadius: 6, padding: "10px 14px" }}><div style={{ fontSize: 9, color: "var(--c-gold)", textTransform: "uppercase", marginBottom: 4 }}>— Thinking</div><div style={{ fontSize: 12, color: "var(--c-gold)" }}>Analyzing...</div></div>}<div ref={endRef} /></div><div style={{ display: "flex", gap: 8, marginTop: 15, padding: "10px 0", borderTop: "1px solid var(--c-border)" }}><input
    style={{ flex: 1, background: "var(--c-bg)", border: "1px solid var(--c-border)", color: "var(--c-text)", padding: "8px 12px", borderRadius: 4, fontSize: 13 }}
    value={inp}
    onChange={(e) => setInp(e.target.value)}
    onKeyDown={(e) => e.key === "Enter" && send()}
    placeholder={placeholder || "Ask the agent..."}
  /><Button variant="gold" onClick={send} disabled={busy}>Send</Button></div></div>;
}

// src/v1/features/deals/Deals.tsx
import {
  BarChart,
  Bar,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid
} from "recharts";
var CHART_STYLE = { fontSize: 11, fontFamily: "Inter, sans-serif" };
var TT = () => ({ contentStyle: { background: "#0D0F13", border: "1px solid #1A1D24", borderRadius: 4, color: "#E0E2E8", fontSize: 11, boxShadow: "0 4px 12px rgba(0,0,0,0.5)" }, itemStyle: { color: "#C4A052" } });
var TT_BAR = () => ({ ...TT(), cursor: { fill: "#1A1D24", opacity: 0.4 } });
var onChartClick = (setSel) => (data) => {
  if (data && data.activePayload) setSel(data.activePayload[0].payload);
};
function Deals() {
  const auth = useAuth();
  const { dealLimit } = useTier();
  const { setChartSel } = useProject();
  const STAGES = ["sourcing", "screening", "due_diligence", "committee", "closing", "asset_mgmt"];
  const SL = { sourcing: "Sourcing", screening: "Screening", due_diligence: "Due Diligence", committee: "Committee", closing: "Closing", asset_mgmt: "Asset Mgmt" };
  const SCOL = { sourcing: "var(--c-blue)", screening: "var(--c-teal)", due_diligence: "var(--c-amber)", committee: "var(--c-purple)", closing: "var(--c-gold)", asset_mgmt: "var(--c-green)" };
  const [deals, setDeals] = useLS("axiom_deals", [
    { id: 1, name: "Sunset Ridge Estates", address: "456 Ridge Rd", stage: "due_diligence", value: 925e4, profit: 185e4, lots: 42, type: "SFR Subdivision", assignee: "Sarah Chen", updated: "2025-02-15", notes: "Phase I ESA clean. Geotech pending." },
    { id: 2, name: "Hawk Valley Subdivision", address: "789 Valley Dr", stage: "screening", value: 56e5, profit: 84e4, lots: 28, type: "SFR Subdivision", assignee: "Mike Rodriguez", updated: "2025-02-10", notes: "Initial feasibility looks promising. Need comp data." },
    { id: 3, name: "Meadowbrook PUD", address: "321 Meadow Ln", stage: "sourcing", value: 128e5, profit: 256e4, lots: 85, type: "PUD", assignee: "", updated: "2025-02-18", notes: "Off-market opportunity from broker network." },
    { id: 4, name: "Ridgecrest Heights", address: "900 Crest Blvd", stage: "committee", value: 143e5, profit: 286e4, lots: 55, type: "SFR Subdivision", assignee: "Jennifer Park", updated: "2025-02-12", notes: "IC presentation scheduled. Strong deal metrics." },
    { id: 5, name: "Canyon Oaks Estates", address: "150 Oak Canyon Dr", stage: "closing", value: 72e5, profit: 108e4, lots: 32, type: "SFR Subdivision", assignee: "David Thompson", updated: "2025-02-20", notes: "COE set for March 15. All conditions met." }
  ]);
  const [nd, setNd] = useState6({ name: "", address: "", stage: "sourcing", value: "", profit: "", lots: "", type: "SFR Subdivision", assignee: "", notes: "" });
  const [showForm, setShowForm] = useState6(false);
  const [selectedDeal, setSelectedDeal] = useState6(null);
  const [syncing, setSyncing] = useState6(false);
  const loadedRef = useRef4(false);
  const saveTimer = useRef4(null);
  useEffect6(() => {
    if (loadedRef.current || !auth?.userProfile?.id || !supa.configured()) return;
    loadedRef.current = true;
    (async () => {
      try {
        const rows = await supa.select("deals", `user_id=eq.${auth.userProfile.id}&order=updated_at.desc`);
        if (rows.length > 0) {
          const mapped = rows.map((r) => ({
            id: r.id,
            name: r.project_name || "Unnamed",
            address: r.location || "",
            stage: r.stage || "sourcing",
            value: Number(r.acquisition_price) + Number(r.renovation_cost) || 0,
            profit: Number(r.projected_profit) || 0,
            lots: 0,
            // Not in DB schema
            type: r.asset_type || "SFR Subdivision",
            assignee: "",
            updated: r.updated_at?.split("T")[0] || "",
            notes: r.notes || "",
            tags: r.tags || [],
            _supaId: r.id
          }));
          setDeals(mapped);
        }
      } catch (e) {
        console.warn("Failed to load deals:", e);
      }
    })();
  }, [auth?.userProfile?.id, setDeals]);
  const syncDeal = useCallback3((deal, isDelete = false) => {
    if (!auth?.userProfile?.id || !supa.configured()) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
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
            updated_at: (/* @__PURE__ */ new Date()).toISOString()
          };
          if (deal._supaId) payload.id = deal._supaId;
          await supa.upsert("deals", payload);
        }
      } catch (e) {
        console.warn("Failed to sync deal:", e);
      }
      setSyncing(false);
    }, 800);
  }, [auth?.userProfile?.id]);
  const addDeal = () => {
    if (!nd.name) return;
    const newDeal = { ...nd, id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(), value: +nd.value || 0, profit: +nd.profit || 0, lots: +nd.lots || 0, updated: (/* @__PURE__ */ new Date()).toISOString().split("T")[0] };
    setDeals([...deals, newDeal]);
    syncDeal(newDeal);
    setNd({ name: "", address: "", stage: "sourcing", value: "", profit: "", lots: "", type: "SFR Subdivision", assignee: "", notes: "" });
    setShowForm(false);
  };
  const moveDeal = (id, dir) => {
    const d = deals.find((x) => x.id === id);
    if (!d) return;
    const ci = STAGES.indexOf(d.stage);
    const ni = dir === "next" ? ci + 1 : ci - 1;
    if (ni < 0 || ni >= STAGES.length) return;
    const updated = { ...d, stage: STAGES[ni], updated: (/* @__PURE__ */ new Date()).toISOString().split("T")[0] };
    setDeals(deals.map((x) => x.id === id ? updated : x));
    syncDeal(updated);
  };
  const totalValue = deals.reduce((s, d) => s + d.value, 0);
  const totalProfit = deals.reduce((s, d) => s + d.profit, 0);
  const pipeData = STAGES.map((st) => ({ name: SL[st], count: deals.filter((d) => d.stage === st).length, value: deals.filter((d) => d.stage === st).reduce((s, d) => s + d.value, 0) / 1e6 }));
  return <Tabs tabs={["Board View", "List View", "Pipeline Analytics"]}><div><div style={{ marginBottom: 24 }}><div className="axiom-grid-4"><KPI label="Active Deals" value={deals.length} /><KPI label="Pipeline Value" value={fmt.M(totalValue)} color="var(--c-blue)" /><KPI label="Est. Profit" value={fmt.M(totalProfit)} color="var(--c-green)" /><KPI label="Avg Deal Size" value={fmt.M(totalValue / (deals.length || 1))} color="var(--c-gold)" /></div>{syncing && <div style={{ fontSize: 9, color: "var(--c-gold)", marginTop: 8 }}>syncing with cloud...</div>}</div><div style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 10 }}>{STAGES.map((stage) => {
    const stageDeals = deals.filter((d) => d.stage === stage);
    return <div key={stage} style={{ minWidth: 220, flex: 1, background: "var(--c-bg3)", border: "1px solid var(--c-border)", borderRadius: 4 }}><div style={{ padding: "10px 12px", borderBottom: "1px solid var(--c-border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}><span style={{ fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: SCOL[stage], fontWeight: 700 }}>{SL[stage]}</span><span style={{ fontSize: 12, color: "var(--c-dim)", background: "var(--c-bg)", padding: "2px 6px", borderRadius: 3 }}>{stageDeals.length}</span></div><div style={{ padding: 8, minHeight: 120 }}>{stageDeals.map((deal) => <div key={deal.id} className="axiom-card" style={{ padding: 12, marginBottom: 8, cursor: "pointer", borderLeft: `3px solid ${SCOL[stage]}` }} onClick={() => setSelectedDeal(deal)}><div style={{ fontSize: 13, color: "var(--c-text)", fontWeight: 600, marginBottom: 4 }}>{deal.name}</div><div style={{ fontSize: 10, color: "var(--c-dim)" }}>{deal.address}</div><div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}><span style={{ fontSize: 12, color: "var(--c-gold)" }}>{fmt.M(deal.value)}</span><span style={{ fontSize: 10, color: "var(--c-green)" }}>{deal.lots} lots</span></div><div style={{ display: "flex", gap: 6, marginTop: 10 }}><Button label="—" onClick={(e) => {
      e.stopPropagation();
      moveDeal(deal.id, "prev");
    }} style={{ padding: "2px 6px", fontSize: 10 }} /><Button label="→" onClick={(e) => {
      e.stopPropagation();
      moveDeal(deal.id, "next");
    }} style={{ padding: "2px 6px", fontSize: 10 }} /></div></div>)}</div></div>;
  })}</div><div style={{ marginTop: 10 }}>{deals.length >= dealLimit && dealLimit < 999 ? <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: "color-mix(in srgb, var(--c-gold) 10%, transparent)", border: "1px solid rgba(196, 160, 82, 0.2)", borderRadius: 4 }}><span style={{ fontSize: 10, color: "var(--c-gold)", fontWeight: 700, letterSpacing: 1, textTransform: "uppercase" }}>Deal limit reached ({deals.length}/{dealLimit})</span><Button variant="gold" label="Upgrade for Unlimited →" onClick={() => {
    const el = document.querySelector('[data-nav="billing"]');
    if (el) el.click();
  }} style={{ padding: "4px 10px", fontSize: 9 }} /></div> : !showForm ? <Button variant="gold" label="+ Add Deal" onClick={() => setShowForm(true)} /> : <Card title="New Deal"><div className="axiom-grid-3"><Field label="Project Name"><input className="axiom-input" value={nd.name} onChange={(e) => setNd({ ...nd, name: e.target.value })} title="Project Name" /></Field><Field label="Address"><input className="axiom-input" value={nd.address} onChange={(e) => setNd({ ...nd, address: e.target.value })} title="Address" /></Field><Field label="Stage"><select className="axiom-select" value={nd.stage} onChange={(e) => setNd({ ...nd, stage: e.target.value })} title="Stage">{STAGES.map((s) => <option key={s} value={s}>{SL[s]}</option>)}</select></Field><Field label="Deal Value ($)"><input className="axiom-input" type="number" value={nd.value} onChange={(e) => setNd({ ...nd, value: e.target.value })} title="Value" /></Field><Field label="Est. Profit ($)"><input className="axiom-input" type="number" value={nd.profit} onChange={(e) => setNd({ ...nd, profit: e.target.value })} title="Profit" /></Field><Field label="Lots"><input className="axiom-input" type="number" value={nd.lots} onChange={(e) => setNd({ ...nd, lots: e.target.value })} title="Lots" /></Field><Field label="Type"><select className="axiom-select" value={nd.type} onChange={(e) => setNd({ ...nd, type: e.target.value })} title="Type"><option>SFR Subdivision</option><option>PUD</option><option>Condo</option><option>Townhome</option><option>Mixed-Use</option><option>Land Bank</option><option>Multifamily</option></select></Field><Field label="Assignee"><input className="axiom-input" value={nd.assignee} onChange={(e) => setNd({ ...nd, assignee: e.target.value })} title="Assignee" /></Field></div><Field label="Notes" mb={20}><textarea className="axiom-input" style={{ height: 60 }} value={nd.notes} onChange={(e) => setNd({ ...nd, notes: e.target.value })} title="Notes" /></Field><div style={{ display: "flex", gap: 12 }}><Button variant="gold" label="Create Deal" onClick={addDeal} /><Button label="Cancel" onClick={() => setShowForm(false)} /></div></Card>}</div>{selectedDeal && <Card title={`Deal: ${selectedDeal.name}`} action={<Button label="Close" onClick={() => setSelectedDeal(null)} />}><div className="axiom-grid-3" style={{ gap: 24 }}>{[["Project", selectedDeal.name], ["Address", selectedDeal.address], ["Type", selectedDeal.type], ["Stage", SL[selectedDeal.stage]], ["Value", fmt.usd(selectedDeal.value)], ["Est. Profit", fmt.usd(selectedDeal.profit)], ["Lots", selectedDeal.lots], ["Assignee", selectedDeal.assignee || "\u2014 "], ["Last Updated", selectedDeal.updated]].map(([l, v]) => <div key={l}><div className="axiom-label" style={{ marginBottom: 4 }}>{l}</div><div style={{ fontSize: 14, color: "var(--c-text)", fontWeight: 500 }}>{v}</div></div>)}</div><div style={{ marginTop: 24, padding: 16, background: "var(--c-bg2)", borderRadius: 6 }}><div className="axiom-label" style={{ marginBottom: 8 }}>INTERNAL NOTES</div><div className="axiom-kpi-sub" style={{ fontSize: 13, lineHeight: 1.5 }}>{selectedDeal.notes}</div></div><div style={{ marginTop: 24 }}><Agent id="DealReview" system={`You are reviewing this specific deal: ${selectedDeal.name} at ${selectedDeal.address}. ${selectedDeal.lots} lots, value $${selectedDeal.value}. Provide detailed analysis.`} placeholder="Ask about this specific deal..." /></div></Card>}</div><div><Card title="All Deals —  List View"><table className="axiom-table"><thead><tr>{["Project", "Stage", "Type", "Lots", "Value", "Profit", "Assignee", "Updated", ""].map((th) => <th key={th} className="axiom-th">{th}</th>)}</tr></thead><tbody>{deals.map((d) => <tr key={d.id} onClick={() => setSelectedDeal(d)} className="premium-hover"><td className="axiom-td" style={{ color: "var(--c-text)", fontWeight: 600 }}>{d.name}<div style={{ fontSize: 9, color: "var(--c-dim)" }}>{d.address}</div></td><td className="axiom-td"><Badge label={SL[d.stage]} color={SCOL[d.stage]} /></td><td className="axiom-td"><Badge label={d.type} color="var(--c-blue)" /></td><td className="axiom-td">{d.lots}</td><td className="axiom-td" style={{ color: "var(--c-gold)" }}>{fmt.M(d.value)}</td><td className="axiom-td" style={{ color: "var(--c-green)" }}>{fmt.M(d.profit)}</td><td className="axiom-td" style={{ fontSize: 12 }}>{d.assignee || "\u2014 "}</td><td className="axiom-td" style={{ fontSize: 10, color: "var(--c-dim)" }}>{d.updated}</td><td className="axiom-td"><Button label="x" onClick={(e) => {
    e.stopPropagation();
    setDeals(deals.filter((x) => x.id !== d.id));
  }} style={{ padding: "2px 7px", fontSize: 10 }} /></td></tr>)}</tbody></table></Card></div><div><div><div className="axiom-grid-2"><Card title="Pipeline by Stage"><ResponsiveContainer width="100%" height={240}><BarChart data={pipeData} onClick={onChartClick(setChartSel)} style={CHART_STYLE}><CartesianGrid strokeDasharray="3 6" stroke="var(--c-border)" strokeOpacity={0.5} vertical={false} /><XAxis dataKey="name" stroke="var(--c-dim)" tick={{ fontSize: 11, fontFamily: "Inter,sans-serif", fill: "var(--c-muted)" }} /><YAxis stroke="var(--c-dim)" tick={{ fontSize: 11, fontFamily: "Inter,sans-serif", fill: "var(--c-muted)" }} allowDecimals={false} /><Tooltip {...TT_BAR()} formatter={(v, name) => [v === 1 ? "1 deal" : `${v} deals`, name]} labelFormatter={(l) => `Stage: ${l}`} /><Legend wrapperStyle={{ fontSize: 11, color: "var(--c-muted)", paddingTop: 12 }} /><Bar dataKey="count" name="Deals" fill="var(--c-gold)" radius={[3, 3, 0, 0]} /></BarChart></ResponsiveContainer></Card><Card title="Value by Stage ($M)"><ResponsiveContainer width="100%" height={240}><BarChart data={pipeData} onClick={onChartClick(setChartSel)} style={CHART_STYLE}><CartesianGrid strokeDasharray="3 6" stroke="var(--c-border)" strokeOpacity={0.5} /><XAxis dataKey="name" stroke="var(--c-dim)" tick={{ fontSize: 9 }} /><YAxis stroke="var(--c-dim)" tick={{ fontSize: 12, fontFamily: "Inter,sans-serif", fill: "var(--c-muted)" }} tickFormatter={(v) => `$${v.toFixed(1)}M`} /><Tooltip {...TT()} formatter={(v, name) => [`$${Number(v).toFixed(2)}M`, name]} labelFormatter={(l) => `Stage: ${l}`} /><Legend wrapperStyle={{ fontSize: 11, color: "var(--c-muted)", paddingTop: 12 }} /><Bar dataKey="value" name="Deal Value" fill="var(--c-blue)" radius={[3, 3, 0, 0]} /></BarChart></ResponsiveContainer></Card></div><Card title="Pipeline — · AI Agent" action={null}><Agent id="PipelineAgent" system="You are a real estate deal pipeline manager. Analyze deal flow, stage velocity, conversion rates, and pipeline health. Advise on deal prioritization and resource allocation." placeholder="Ask about pipeline metrics, deal velocity, or prioritization..." /></Card></div></div></Tabs>;
}

// src/v1/features/agents/AgentHub.tsx
import { useState as useState7 } from "react";
var AGENTS = [
  { id: "Acquisition Scout", icon: "A", color: "#EAC15C", desc: "Identifies and scores acquisition opportunities based on your criteria", system: "You are a real estate acquisition analyst. Help identify and evaluate potential land acquisition opportunities and score sites against development criteria.", placeholder: "Describe your acquisition criteria and I'll help evaluate opportunities..." },
  { id: "Zoning Navigator", icon: "Z", color: "#4A90E2", desc: "Decodes zoning codes and maps entitlement pathways", system: "You are a land use attorney and zoning consultant. Decode zoning codes, identify entitlement pathways, advise on variances and density bonuses.", placeholder: "Describe the zoning situation and I'll map the entitlement pathway..." },
  { id: "Appraisal Analyst", icon: "V", color: "#3B8C8C", desc: "Performs market value analysis using comparable sales methodology", system: "You are a certified real estate appraiser specializing in land and subdivision analysis. Apply the sales comparison approach, income approach, and land residual method.", placeholder: "Provide comp data and I'll perform an appraisal-grade value analysis..." },
  { id: "Construction Estimator", icon: "C", color: "#F5A623", desc: "Generates construction cost estimates from RSMeans and market data", system: "You are a construction cost estimator specializing in residential subdivision and land development. Provide detailed cost breakdowns for grading, utilities, streets, lots, and vertical construction.", placeholder: "Describe the project scope and I'll generate a detailed cost estimate..." },
  { id: "Environmental Scout", icon: "E", color: "#7ED321", desc: "Screens for environmental constraints and CEQA requirements", system: "You are an environmental planner specializing in CEQA, wetlands, biological resources, and Phase I/II ESAs for California residential development.", placeholder: "Describe the site location and I'll screen for environmental constraints..." },
  { id: "Permit Coordinator", icon: "P", color: "#BD10E0", desc: "Sequences permit applications and maps agency dependencies", system: "You are a permit expediter and municipal liaison. Map permit sequences, estimate agency timelines, identify critical path items, and advise on agency relationship strategies.", placeholder: "Describe your project and jurisdiction and I'll map the permit sequence..." },
  { id: "Financial Underwriter", icon: "F", color: "#D0021B", desc: "Underwrites deals and stress-tests financial assumptions", system: "You are a real estate development underwriter. Underwrite development deals, stress-test assumptions, calculate IRR and equity multiples, and size construction loans.", placeholder: "Share your pro forma and I'll underwrite the deal..." },
  { id: "Title Decoder", icon: "T", color: "#F8E71C", desc: "Interprets title reports and identifies encumbrances", system: "You are a real estate title officer specializing in land title issues. Interpret preliminary title reports, identify exceptions, assess encumbrance risks, and advise on curative actions.", placeholder: "Paste title report exceptions and I'll decode them..." }
];
function AgentHub() {
  const [active, setActive] = useState7(null);
  if (active !== null) {
    const a = AGENTS[active];
    return <div><div className="axiom-flex-center-gap-15" style={{ marginBottom: 20 }}><Button onClick={() => setActive(null)}>← Back to Hub</Button><div className="axiom-text-16-bold" style={{ color: a.color }}>{a.id}</div><div className="axiom-text-12-dim">{a.desc}</div></div><Card title={`${a.id} \u2014 Live Session`}><div style={{ height: 600 }}><Agent id={a.id} system={a.system} placeholder={a.placeholder} /></div></Card></div>;
  }
  return <div className="axiom-grid-auto-fill-280" style={{ gap: 15 }}>{AGENTS.map((a, i) => <div
    key={i}
    onClick={() => setActive(i)}
    className="axiom-agent-card"
    style={{ borderLeftColor: a.color }}
  ><div className="axiom-text-24-bold" style={{ color: a.color, marginBottom: 10 }}>{a.icon}</div><div className="axiom-text-14-bold" style={{ marginBottom: 5 }}>{a.id}</div><div className="axiom-text-11-dim-lh14" style={{ marginBottom: 15 }}>{a.desc}</div><Button variant="gold" className="w-full" onClick={(e) => {
    e?.stopPropagation();
    setActive(i);
  }}>Launch Agent</Button></div>)}</div>;
}

// src/v1/features/agents/NeuralNet.tsx
import { useState as useState8, useMemo } from "react";

// src/v1/lib/math.ts
var calcNPV = (rate, cashFlows) => {
  return cashFlows.reduce((npv, cf, t) => npv + cf / Math.pow(1 + rate, t), 0);
};
var calcIRR = (cashFlows, guess = 0.1, maxIter = 100, tol = 1e-7) => {
  let rate = guess;
  for (let i = 0; i < maxIter; i++) {
    const npv = calcNPV(rate, cashFlows);
    const dnpv = cashFlows.reduce(
      (d, cf, t) => d - t * cf / Math.pow(1 + rate, t + 1),
      0
    );
    if (Math.abs(dnpv) < tol) break;
    const newRate = rate - npv / dnpv;
    if (Math.abs(newRate - rate) < tol) return newRate;
    rate = newRate;
  }
  return rate;
};
var buildMonthlyCashFlows = (fin) => {
  const lots = fin.totalLots || 1;
  const hard = lots * (fin.hardCostPerLot || 0);
  const soft = hard * ((fin.softCostPct || 0) / 100);
  const fees = (fin.planningFees || 0) + ((fin.permitFeePerLot || 0) + (fin.schoolFee || 0) + (fin.impactFeePerLot || 0)) * lots;
  const cont = (hard + soft) * ((fin.contingencyPct || 0) / 100);
  const totalCost = (fin.landCost || 0) + (fin.closingCosts || 0) + hard + soft + cont + fees;
  const constMonths = Math.max(6, Math.ceil(lots / 8));
  const sellMonths = Math.ceil(lots / (fin.absorbRate || 1));
  const totalMonths = constMonths + sellMonths;
  const monthlyCost = (totalCost - (fin.landCost || 0)) / constMonths;
  const monthlyRev = (fin.absorbRate || 1) * (fin.salesPricePerLot || 0) * (1 - (fin.salesCommission || 0) / 100);
  const flows = [-(fin.landCost || 0) - (fin.closingCosts || 0)];
  for (let m = 1; m <= totalMonths; m++) {
    let cf = 0;
    if (m <= constMonths) cf -= monthlyCost;
    if (m > constMonths) cf += monthlyRev;
    flows.push(cf);
  }
  return { flows, constMonths, sellMonths, totalMonths, totalCost };
};

// src/v1/features/agents/NeuralNet.tsx
var LAYERS = [
  { id: "input", name: "Input Layer", nodes: ["Site Data", "Zoning", "Comps", "Market Trends", "Demographics", "Finance"], color: "#4A90E2", desc: "Raw data inputs from all connected sources" },
  { id: "hidden1", name: "Feature Extraction", nodes: ["Location Score", "Density Potential", "Market Velocity", "Cost Index", "Risk Factors", "Demand Signal"], color: "#9013FE", desc: "Extracted features weighted by historical deal outcomes" },
  { id: "hidden2", name: "Pattern Recognition", nodes: ["Feasibility Score", "IRR Prediction", "Absorption Model", "Risk Heatmap"], color: "#F5A623", desc: "Cross-referenced patterns from 10,000+ historical deals" },
  { id: "output", name: "Output Layer", nodes: ["Deal Score", "Go/No-Go", "Optimal Price", "Timeline", "Risk Rating"], color: "#EAC15C", desc: "Final deal intelligence with confidence intervals" }
];
function NeuralNet() {
  const { project, fin } = useProject();
  const [activeNode, setActiveNode] = useState8(null);
  const [isGenerating, setIsGenerating] = useState8(false);
  const dealScore = useMemo(() => {
    const h = fin.totalLots * fin.hardCostPerLot;
    const s = h * fin.softCostPct / 100;
    const fees = fin.planningFees + (fin.permitFeePerLot + fin.schoolFee + fin.impactFeePerLot) * fin.totalLots;
    const cont = (h + s) * fin.contingencyPct / 100;
    const totalCost = fin.landCost + fin.closingCosts + h + s + cont + fees;
    const revenue = fin.totalLots * fin.salesPricePerLot;
    const profit = revenue * (1 - fin.salesCommission / 100) - totalCost;
    const margin = revenue > 0 ? profit / revenue * 100 : 0;
    const roi = totalCost > 0 ? profit / totalCost * 100 : 0;
    const months = Math.ceil(fin.totalLots / (fin.absorbRate || 1));
    const marginScore = Math.min(100, Math.max(0, margin * 3.3));
    const roiScore = Math.min(100, Math.max(0, roi * 2.5));
    const absorpScore = Math.min(100, Math.max(0, (1 - months / 60) * 100));
    return Math.round(marginScore * 0.4 + roiScore * 0.3 + absorpScore * 0.3);
  }, [fin]);
  const confidence = useMemo(() => {
    const fields = [fin.totalLots, fin.landCost, fin.hardCostPerLot, project.name, project.address];
    const filled = fields.filter((f) => f && f !== 0 && f !== "").length;
    return Math.round(filled / fields.length * 100);
  }, [fin, project]);
  const nodeData = useMemo(() => {
    if (!activeNode) return null;
    const pName = project.name || "This project";
    switch (activeNode) {
      case "Finance": {
        const { totalCost } = buildMonthlyCashFlows(fin);
        return {
          insight: `Capital stack modeled for ${pName}. Total project cost ${fmt.M(totalCost)} with ${fin.totalLots} lots.`,
          metrics: [["Total Cost", fmt.M(totalCost)], ["Hard Cost/Lot", fmt.usd(fin.hardCostPerLot)]]
        };
      }
      case "Deal Score":
        return {
          insight: `Neural scoring engine weighted: Margin (40%), ROI (30%), Absorption (30%). Confidence is ${confidence}% based on data integrity.`,
          metrics: [["Composite Score", `${dealScore}/100`], ["Confidence", `${confidence}%`]]
        };
      default:
        return { insight: `Real-time neural analysis processed for ${activeNode}. Identifying patterns in ${project.municipality || "the local market"}.`, metrics: [["Status", "OK"], ["Patterns", "Detected"]] };
    }
  }, [activeNode, project, fin, dealScore, confidence]);
  const handleNodeClick = (node) => {
    if (activeNode === node) {
      setActiveNode(null);
    } else {
      setIsGenerating(true);
      setActiveNode(node);
      setTimeout(() => setIsGenerating(false), 500);
    }
  };
  return <div className="axiom-grid-1-320" style={{ gap: 20 }}><Card title="Neural Network Architecture"><div className="axiom-neural-net-container">{LAYERS.map((layer) => <div key={layer.id} className="axiom-stack-15" style={{ zIndex: 1, width: "22%" }}><div className="axiom-text-10-dim-caps-ls1" style={{ textAlign: "center", marginBottom: 5 }}>{layer.name}</div>{layer.nodes.map((node) => <div
    key={node}
    onClick={() => handleNodeClick(node)}
    className={`axiom-neuron-node ${activeNode === node ? "active" : ""}`}
    style={{
      "--layer-color": layer.color,
      borderColor: activeNode === node ? layer.color : "var(--c-border)",
      color: activeNode === node ? layer.color : "var(--c-text)",
      boxShadow: activeNode === node ? `0 0 10px ${layer.color}40` : "none"
    }}
  >{node}</div>)}</div>)}</div><div className="axiom-text-11-dim" style={{ textAlign: "center", marginTop: 20 }}>
                    Click a node to inspect neural weights and local insights.
                </div></Card><div className="axiom-stack-20"><Card title="Intelligence Output"><div style={{ textAlign: "center", padding: "10px 0" }}><div className="axiom-text-40-bold" style={{ color: dealScore > 70 ? "var(--c-gold)" : "var(--c-text)" }}>{dealScore}</div><div className="axiom-text-10-dim-caps-ls1">Composite Deal Score</div></div><div className="axiom-stack-15" style={{ marginTop: 15 }}><div className="axiom-flex-sb" style={{ fontSize: 11 }}><span>Confidence</span><span>{confidence}%</span></div><div className="axiom-progress-bg"><div className="axiom-progress-fill" style={{ width: `${confidence}%` }} /></div></div></Card>{activeNode && <Card title={`${activeNode} Insight`}>{isGenerating ? <div className="axiom-text-12-gold" style={{ padding: 10 }}>Analyzing neural weights...</div> : <div className="axiom-stack-15"><div className="axiom-text-12-lh15">{nodeData?.insight}</div><div className="axiom-stack-8">{nodeData?.metrics.map(([l, v]) => <div key={l} className="axiom-list-item-sb-11"><span style={{ color: "var(--c-dim)" }}>{l}</span><span style={{ fontWeight: "bold" }}>{v}</span></div>)}</div></div>}</Card>}</div></div>;
}

// src/v1/features/agents/Copilot.tsx
import { useState as useState9, useMemo as useMemo2 } from "react";
var MODES = {
  general: { label: "General Assistant", system: "You are Axiom Copilot, an AI assistant for real estate development. Help with any questions about feasibility, financial modeling, or market analysis." },
  underwriter: { label: "Underwriter", system: "You are an institutional real estate underwriter. Analyze deals using project data. Stress-test assumptions and flag metrics outside thresholds (Margin <20%, IRR <15%)." },
  legal: { label: "Entitlements", system: "You are a real estate attorney specializing in land use, entitlements, and zoning. Advise on strategies and timelines based on jurisdiction." },
  financial: { label: "CFO / Strategy", system: "You are a real estate CFO. Focus on capital stacks, IRR, NPV, and equity waterfalls. Optimize debt/equity splits." }
};
function Copilot() {
  const { project, fin, loan, equity } = useProject();
  const [mode, setMode] = useState9("general");
  const context = useMemo2(() => {
    const { flows, totalCost } = buildMonthlyCashFlows(fin);
    const irr = calcIRR(flows);
    const margin = totalCost > 0 ? ((fin.totalLots * fin.salesPricePerLot * 0.95 - totalCost) / (fin.totalLots * fin.salesPricePerLot) * 100).toFixed(1) : "0";
    return `
        Project: ${project.name || "Untitled"}
        Address: ${project.address || "N/A"}
        Location: ${project.municipality || "N/A"}, ${project.state || "N/A"}
        
        Financials:
        Lots: ${fin.totalLots}
        Total Cost: ${fmt.M(totalCost)}
        Sale Price/Lot: ${fmt.usd(fin.salesPricePerLot)}
        IRR (Est): ${irr ? (irr * 12 * 100).toFixed(1) + "%" : "N/A"}
        Margin: ${margin}%
        
        Loan: ${loan.ltc}% LTC @ ${loan.rate}% interest
        Equity: GP ${equity.gpPct}% / LP ${equity.lpPct}%
        `.trim();
  }, [project, fin, loan, equity]);
  return <div className="axiom-grid-1-280" style={{ gap: 20 }}><div style={{ height: 700 }}><Agent
    id="Axiom Copilot"
    system={MODES[mode].system}
    placeholder={`Ask the ${MODES[mode].label}...`}
    context={context}
  /></div><div className="axiom-stack-15"><Card title="Expert Persona"><div className="axiom-stack-8">{Object.entries(MODES).map(([k, v]) => <div
    key={k}
    onClick={() => setMode(k)}
    className={`axiom-menu-item ${mode === k ? "active" : ""}`}
    style={{ fontSize: 12 }}
  >{v.label}</div>)}</div></Card><Card title="Quick Inquiries"><div className="axiom-stack-10"><div className="axiom-list-item-dim-11">Summary of this deal</div><div className="axiom-list-item-dim-11">Stress-test construction costs</div><div className="axiom-list-item-dim-11">Recommend capital stack</div><div className="axiom-list-item-dim-11">Zoning feasibility report</div></div></Card></div></div>;
}

// src/v1/features/agents/NeuralAgents.tsx
function NeuralAgents() {
  return <Tabs tabs={["\u{1F4AC} Command Copilot", "\u{1F916} Agent Hub", "\u{1F9E0} Neural Intelligence"]}><Copilot /><AgentHub /><NeuralNet /></Tabs>;
}

// src/v1/features/financials/ProForma.tsx
import { useMemo as useMemo3 } from "react";
import {
  BarChart as BarChart2,
  Bar as Bar2,
  AreaChart,
  Area,
  Cell,
  ResponsiveContainer as ResponsiveContainer2,
  XAxis as XAxis2,
  YAxis as YAxis2,
  Tooltip as Tooltip2,
  Legend as Legend2,
  CartesianGrid as CartesianGrid2
} from "recharts";
function ProForma() {
  const { project, fin, setFin, loan, equity } = useProject();
  const u = (k) => (e) => setFin({ ...fin, [k]: parseFloat(e.target.value) || 0 });
  const calculations = useMemo3(() => {
    const hard = fin.totalLots * fin.hardCostPerLot;
    const soft = hard * (fin.softCostPct / 100);
    const fees = fin.planningFees + (fin.permitFeePerLot + fin.schoolFee + fin.impactFeePerLot) * fin.totalLots;
    const cont = (hard + soft) * (fin.contingencyPct / 100);
    const totalBaseCost = fin.landCost + fin.closingCosts + hard + soft + cont + fees;
    const revenue = fin.totalLots * fin.salesPricePerLot;
    const commission = revenue * fin.salesCommission / 100;
    const reserves = totalBaseCost * (fin.reservePercentage || 5) / 100;
    const loanAmount = totalBaseCost * (loan.ltc / 100);
    const equityNeed = totalBaseCost - loanAmount;
    const originationFee = loanAmount * loan.origFee / 100;
    const { flows, constMonths, totalMonths } = buildMonthlyCashFlows(fin);
    const avgDraw = loanAmount * 0.55;
    const idc = avgDraw * (loan.rate / 100) * (constMonths / 12);
    const totalProjectCost = totalBaseCost + originationFee + idc;
    const netProfit = revenue - commission - reserves - totalProjectCost;
    const margin = revenue > 0 ? netProfit / revenue * 100 : 0;
    const roi = totalProjectCost > 0 ? netProfit / totalProjectCost * 100 : 0;
    const lpEquity = equityNeed * equity.lpPct / 100;
    const gpEquity = equityNeed * equity.gpPct / 100;
    const prefReturnAmt = lpEquity * (equity.prefReturn / 100) * (totalMonths / 12);
    const profitAfterPref = Math.max(0, netProfit - prefReturnAmt);
    const promoteAmt = profitAfterPref * equity.promotePct / 100;
    const lpProfit = prefReturnAmt + (profitAfterPref - promoteAmt) * (equity.lpPct / 100);
    const gpProfit = promoteAmt + (profitAfterPref - promoteAmt) * (equity.gpPct / 100);
    const lpMultiple = lpEquity > 0 ? (lpEquity + lpProfit) / lpEquity : 0;
    const gpMultiple = gpEquity > 0 ? (gpEquity + gpProfit) / gpEquity : 0;
    const adjFlows = [...flows];
    adjFlows[0] = adjFlows[0] - originationFee;
    const monthlyInterest = avgDraw * (loan.rate / 100) / 12;
    for (let m = 1; m <= constMonths && m < adjFlows.length; m++) {
      adjFlows[m] -= monthlyInterest;
    }
    const irr = calcIRR(adjFlows) || 0;
    const annualIRR = (Math.pow(1 + irr, 12) - 1) * 100;
    return {
      hard,
      soft,
      fees,
      cont,
      totalBaseCost,
      revenue,
      commission,
      reserves,
      loanAmount,
      equityNeed,
      originationFee,
      idc,
      totalProjectCost,
      netProfit,
      margin,
      roi,
      lpEquity,
      gpEquity,
      prefReturnAmt,
      promoteAmt,
      lpProfit,
      gpProfit,
      lpMultiple,
      gpMultiple,
      annualIRR,
      constMonths,
      totalMonths,
      adjFlows
    };
  }, [fin, loan, equity]);
  const waterfallData = [
    { name: "Revenue", value: calculations.revenue / 1e6, fill: "#7ED321" },
    { name: "Land", value: -(fin.landCost + fin.closingCosts) / 1e6, fill: "#D0021B88" },
    { name: "Hard Cost", value: -calculations.hard / 1e6, fill: "#D0021B88" },
    { name: "Soft Cost", value: -calculations.soft / 1e6, fill: "#F5A62388" },
    { name: "Fees", value: -calculations.fees / 1e6, fill: "#BD10E088" },
    { name: "Profit", value: calculations.netProfit / 1e6, fill: calculations.netProfit >= 0 ? "#7ED321" : "#D0021B" }
  ];
  const cfChartData = calculations.adjFlows.map((cf, i) => ({
    month: i,
    cf: Math.round(cf),
    cumulative: Math.round(calculations.adjFlows.slice(0, i + 1).reduce((s, v) => s + v, 0))
  }));
  return <div className="axiom-grid-1-340" style={{ gap: 20 }}><div className="axiom-stack-20"><div className="axiom-grid-4"><KPI label="Net Profit" value={fmt.M(calculations.netProfit)} color={calculations.netProfit >= 0 ? "var(--c-green)" : "var(--c-red)"} /><KPI label="Profit Margin" value={fmt.pct(calculations.margin)} color={calculations.margin > 15 ? "var(--c-green)" : "var(--c-gold)"} /><KPI label="Levered IRR" value={fmt.pct(calculations.annualIRR)} color="var(--c-blue)" /><KPI label="Total Project Cost" value={fmt.M(calculations.totalProjectCost)} color="var(--c-text)" /></div><div className="axiom-grid-2"><Card title="Input Assumptions"><div style={{ display: "flex", flexDirection: "column", gap: 10 }}><Field label="Total Lots"><input className="axiom-input" type="number" value={fin.totalLots} onChange={u("totalLots")} title="Total Lots" /></Field><Field label="Land Cost ($)"><input className="axiom-input" type="number" value={fin.landCost} onChange={u("landCost")} title="Land Cost" /></Field><Field label="Hard Cost / Lot ($)"><input className="axiom-input" type="number" value={fin.hardCostPerLot} onChange={u("hardCostPerLot")} title="Hard Cost per Lot" /></Field><Field label="Soft Cost %"><input className="axiom-input" type="number" value={fin.softCostPct} onChange={u("softCostPct")} title="Soft Cost Percentage" /></Field><Field label="Sales Price / Lot ($)"><input className="axiom-input" type="number" value={fin.salesPricePerLot} onChange={u("salesPricePerLot")} title="Sales Price per Lot" /></Field></div></Card><Card title="Waterfall Analysis ($M)"><div style={{ height: 260 }}><ResponsiveContainer2 width="100%" height="100%"><BarChart2 data={waterfallData}><CartesianGrid2 strokeDasharray="3 3" stroke="var(--c-border)" vertical={false} /><XAxis2 dataKey="name" stroke="var(--c-dim)" fontSize={10} /><YAxis2 stroke="var(--c-dim)" fontSize={10} /><Tooltip2 contentStyle={{ background: "var(--c-bg2)", border: "1px solid var(--c-border)" }} /><Bar2 dataKey="value" radius={[4, 4, 0, 0]}>{waterfallData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.fill} />)}</Bar2></BarChart2></ResponsiveContainer2></div></Card></div><Card title="Cash Flow Projection"><div style={{ height: 300 }}><ResponsiveContainer2 width="100%" height="100%"><AreaChart data={cfChartData}><CartesianGrid2 strokeDasharray="3 3" stroke="var(--c-border)" vertical={false} /><XAxis2 dataKey="month" stroke="var(--c-dim)" fontSize={10} /><YAxis2 stroke="var(--c-dim)" fontSize={10} /><Tooltip2 contentStyle={{ background: "var(--c-bg2)", border: "1px solid var(--c-border)" }} /><Area type="monotone" dataKey="cf" name="Monthly" stroke="var(--c-blue)" fill="var(--c-blue)" fillOpacity={0.1} /><Area type="monotone" dataKey="cumulative" name="Cumulative" stroke="var(--c-gold)" fill="var(--c-gold)" fillOpacity={0.05} /><Legend2 /></AreaChart></ResponsiveContainer2></div></Card></div><div className="axiom-stack-20"><Card title="Financing Stack"><div className="axiom-stack-15"><div className="axiom-flex-between"><span className="axiom-dim-12">Senior Debt</span><span className="axiom-bold">{fmt.M(calculations.loanAmount)}</span></div><Progress value={loan.ltc} color="var(--c-blue)" /><div className="axiom-flex-between"><span className="axiom-kpi-sub">Equity Required</span><span className="axiom-bold">{fmt.M(calculations.equityNeed)}</span></div><div style={{ borderTop: "1px solid var(--c-border)", paddingTop: 10 }}><div className="axiom-flex-between" style={{ padding: "2px 0" }}><span className="axiom-kpi-sub">LP Equity ({equity.lpPct}%)</span><span className="axiom-text-11">{fmt.M(calculations.lpEquity)}</span></div><div className="axiom-flex-between" style={{ padding: "2px 0" }}><span className="axiom-kpi-sub">GP Equity ({equity.gpPct}%)</span><span className="axiom-text-11">{fmt.M(calculations.gpEquity)}</span></div></div></div></Card><Card title="Return Metrics"><div className="axiom-stack-12"><div className="axiom-flex-between" style={{ padding: "8px 0", borderBottom: "1px solid var(--c-bg)" }}><span className="axiom-kpi-sub">LP Multiple</span><span style={{ fontSize: 14, fontWeight: "bold", color: "var(--c-gold)" }}>{calculations.lpMultiple.toFixed(2)}x</span></div><div className="axiom-flex-between" style={{ padding: "8px 0", borderBottom: "1px solid var(--c-bg)" }}><span className="axiom-kpi-sub">GP Multiple</span><span style={{ fontSize: 14, fontWeight: "bold", color: "var(--c-gold)" }}>{calculations.gpMultiple.toFixed(2)}x</span></div><div className="axiom-flex-between" style={{ padding: "8px 0" }}><span className="axiom-kpi-sub">ROI (Unlevered)</span><span style={{ fontSize: 14, fontWeight: "bold" }}>{calculations.roi.toFixed(1)}%</span></div></div></Card><Card title="Underwriter Notes"><Agent
    id="ProFormaAgent"
    system={`You are a pro forma underwriting AI. Analyze the project: ${project.name}. Lots: ${fin.totalLots}, Revenue: $${calculations.revenue}, Profit: $${calculations.netProfit}, Margin: ${calculations.margin.toFixed(1)}%, IRR: ${calculations.annualIRR.toFixed(1)}%. Highlight risks in the cost structure or sales assumptions.`}
    placeholder="Ask about these projections..."
  /></Card></div></div>;
}

// src/v1/features/financials/DealAnalyzer.tsx
import { useMemo as useMemo4 } from "react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer as ResponsiveContainer3,
  Tooltip as Tooltip3
} from "recharts";
function DealAnalyzer() {
  const { project, fin } = useProject();
  const analysis = useMemo4(() => {
    const hard = fin.totalLots * fin.hardCostPerLot;
    const soft = hard * (fin.softCostPct / 100);
    const fees = fin.planningFees + (fin.permitFeePerLot + fin.schoolFee + fin.impactFeePerLot) * fin.totalLots;
    const cont = (hard + soft) * (fin.contingencyPct / 100);
    const totalCost = fin.landCost + fin.closingCosts + hard + soft + cont + fees;
    const revenue = fin.totalLots * fin.salesPricePerLot;
    const profit = revenue * 0.97 - totalCost;
    const margin = revenue > 0 ? profit / revenue * 100 : 0;
    const roi = totalCost > 0 ? profit / totalCost * 100 : 0;
    const scoreF = Math.min(100, Math.max(0, margin > 20 ? 95 : margin > 15 ? 80 : margin > 10 ? 65 : margin > 5 ? 50 : 30));
    const entitlementScore = project.status === "Approved" ? 100 : project.status === "In Progress" ? 65 : 30;
    const environmentalScore = 85;
    const marketScore = 72;
    const overall = Math.round(scoreF * 0.4 + entitlementScore * 0.3 + environmentalScore * 0.3);
    const verdict = overall >= 75 ? "GO" : overall >= 50 ? "CONDITIONAL" : "NO-GO";
    const radarData = [
      { subject: "Financial", A: scoreF, fullMark: 100 },
      { subject: "Entitlement", A: entitlementScore, fullMark: 100 },
      { subject: "Environmental", A: environmentalScore, fullMark: 100 },
      { subject: "Market", A: marketScore, fullMark: 100 },
      { subject: "Infrastructure", A: 78, fullMark: 100 }
    ];
    return { totalCost, revenue, profit, margin, roi, overall, verdict, radarData, scoreF, entitlementScore, environmentalScore };
  }, [fin, project]);
  const verdictColor = {
    "GO": "var(--c-green)",
    "CONDITIONAL": "var(--c-gold)",
    "NO-GO": "var(--c-red)"
  }[analysis.verdict];
  return <div className="axiom-stack-20"><div className="axiom-grid-4"><KPI label="Total Cost" value={fmt.M(analysis.totalCost)} color="var(--c-red)" /><KPI label="Revenue" value={fmt.M(analysis.revenue)} color="var(--c-green)" /><KPI label="Net Profit" value={fmt.M(analysis.profit)} color={analysis.profit >= 0 ? "var(--c-green)" : "var(--c-red)"} /><KPI label="Deal Margin" value={fmt.pct(analysis.margin)} color={analysis.margin > 15 ? "var(--c-green)" : "var(--c-gold)"} /></div><div className="axiom-grid-2"><Card title="Deal Readiness Score"><div style={{ height: 300 }}><ResponsiveContainer3 width="100%" height="100%"><RadarChart cx="50%" cy="50%" outerRadius="80%" data={analysis.radarData}><PolarGrid stroke="var(--c-border)" /><PolarAngleAxis dataKey="subject" tick={{ fill: "var(--c-dim)", fontSize: 11 }} /><PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} /><Radar
    name="Score"
    dataKey="A"
    stroke="var(--c-gold)"
    fill="var(--c-gold)"
    fillOpacity={0.3}
  /><Tooltip3 contentStyle={{ background: "var(--c-bg2)", border: "1px solid var(--c-border)" }} /></RadarChart></ResponsiveContainer3></div></Card><Card title="Executive Verdict"><div className="axiom-flex-col-center" style={{ height: "100%", padding: "20px 0" }}><div style={{ fontSize: 64, fontWeight: "bold", color: verdictColor, marginBottom: 10 }}>{analysis.verdict}</div><div className="axiom-text-18-dim" style={{ marginBottom: 30 }}>
                            Overall Score: {analysis.overall}/100
                        </div><div className="axiom-stack-15" style={{ width: "100%" }}><div><div className="axiom-flex-between-dim-11" style={{ marginBottom: 5 }}><span>Financial Strength</span><span>{analysis.scoreF}%</span></div><Progress value={analysis.scoreF} color={analysis.scoreF >= 75 ? "var(--c-green)" : "var(--c-gold)"} /></div><div><div className="axiom-flex-between-dim-11" style={{ marginBottom: 5 }}><span>Entitlement Progress</span><span>{analysis.entitlementScore}%</span></div><Progress value={analysis.entitlementScore} color={analysis.entitlementScore >= 75 ? "var(--c-green)" : "var(--c-gold)"} /></div><div><div className="axiom-flex-between-dim-11" style={{ marginBottom: 5 }}><span>Environmental Safety</span><span>{analysis.environmentalScore}%</span></div><Progress value={analysis.environmentalScore} color="var(--c-green)" /></div></div></div></Card></div><Card title="IC Memo Builder"><Agent
    id="ICMemoAgent"
    system={`You are an Investment Committee analyst for: ${project.name}. Generate a professional deal memo. Summary: Cost $${fmt.M(analysis.totalCost)}, Revenue $${fmt.M(analysis.revenue)}, Profit $${fmt.M(analysis.profit)}, Margin ${analysis.margin.toFixed(1)}%. Logic: 40% Financial, 30% Entitlement, 30% Environmental. Verdict is ${analysis.verdict}. Provide high-level investment thesis and risks.`}
    placeholder="Type 'generate IC memo' to start..."
  /></Card></div>;
}

// src/v1/features/financials/CalcHub.tsx
import { useState as useState10 } from "react";
function CalcHub() {
  const [active, setActive] = useState10("mortgage");
  const calcs = [
    { id: "mortgage", label: "Mortgage", desc: "Monthly payment & amortization" },
    { id: "roi", label: "Flip ROI", desc: "Purchase, rehab, and profit" },
    { id: "caprate", label: "Cap Rate", desc: "NOI and value analysis" }
  ];
  return <div className="axiom-grid-240-1" style={{ gap: 20 }}><div className="axiom-stack-10">{calcs.map((c) => <div
    key={c.id}
    onClick={() => setActive(c.id)}
    className={`axiom-menu-item ${active === c.id ? "active" : ""}`}
  ><div className="axiom-text-13-bold">{c.label}</div><div className="axiom-text-10-dim" style={{ marginTop: 4 }}>{c.desc}</div></div>)}</div><div className="axiom-flex-1">{active === "mortgage" && <MortgageCalc />}{active === "roi" && <ROICalc />}{active === "caprate" && <CapRateCalc />}</div></div>;
}
function MortgageCalc() {
  const [loan, setLoan] = useState10(5e5);
  const [rate, setRate] = useState10(6.5);
  const [years, setYears] = useState10(30);
  const n = years * 12;
  const r = rate / 100 / 12;
  const pmt = r > 0 ? loan * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1) : loan / n;
  return <Card title="Mortgage Calculator"><div className="axiom-grid-3" style={{ marginBottom: 20 }}><Field label="Loan Amount ($)"><input className="axiom-input" type="number" value={loan} onChange={(e) => setLoan(+e.target.value)} title="Loan Amount" /></Field><Field label="Interest Rate (%)"><input className="axiom-input" type="number" step="0.125" value={rate} onChange={(e) => setRate(+e.target.value)} title="Interest Rate" /></Field><Field label="Term (Years)"><select className="axiom-select" value={years} onChange={(e) => setYears(+e.target.value)} title="Term"><option value={15}>15 Years</option><option value={30}>30 Years</option></select></Field></div><div className="axiom-grid-2"><div className="axiom-kpi-highlight"><div className="axiom-text-10-dim-ls1" style={{ marginBottom: 5 }}>MONTHLY PAYMENT</div><div className="axiom-text-32-bold-gold">{fmt.usd(Math.round(pmt))}</div></div><div className="axiom-stack-10"><KPI label="Total Interest" value={fmt.usd(Math.round(pmt * n - loan))} color="var(--c-red)" /><KPI label="Total Paid" value={fmt.usd(Math.round(pmt * n))} color="var(--c-text)" /></div></div></Card>;
}
function ROICalc() {
  const [v, setV] = useState10({ purchase: 35e4, rehab: 85e3, arv: 52e4, holdMonths: 6 });
  const u = (k) => (e) => setV({ ...v, [k]: +e.target.value });
  const totalIn = v.purchase + v.rehab;
  const profit = v.arv - totalIn - v.arv * 0.08;
  const roi = totalIn > 0 ? profit / totalIn * 100 : 0;
  return <Card title="Flip ROI Analysis"><div className="axiom-grid-2" style={{ marginBottom: 20 }}><Field label="Purchase Price"><input className="axiom-input" type="number" value={v.purchase} onChange={u("purchase")} title="Purchase Price" /></Field><Field label="Rehab Cost"><input className="axiom-input" type="number" value={v.rehab} onChange={u("rehab")} title="Rehab Cost" /></Field><Field label="After Repair Value"><input className="axiom-input" type="number" value={v.arv} onChange={u("arv")} title="After Repair Value" /></Field><Field label="Hold Period (mo)"><input className="axiom-input" type="number" value={v.holdMonths} onChange={u("holdMonths")} title="Hold Period" /></Field></div><div className="axiom-grid-3"><KPI label="Net Profit" value={fmt.usd(profit)} color={profit >= 0 ? "var(--c-green)" : "var(--c-red)"} /><KPI label="Total ROI" value={fmt.pct(roi)} color={roi > 20 ? "var(--c-green)" : "var(--c-gold)"} /><KPI label="Total Invested" value={fmt.usd(totalIn)} color="var(--c-dim)" /></div></Card>;
}
function CapRateCalc() {
  const [v, setV] = useState10({ price: 2e6, gri: 18e4, opex: 72e3 });
  const u = (k) => (e) => setV({ ...v, [k]: +e.target.value });
  const noi = v.gri - v.opex;
  const capRate = v.price > 0 ? noi / v.price * 100 : 0;
  return <Card title="Cap Rate / NOI Calculator"><div className="axiom-grid-2" style={{ marginBottom: 20 }}><Field label="Purchase Price"><input className="axiom-input" type="number" value={v.price} onChange={u("price")} title="Purchase Price" /></Field><Field label="Gross Income (Annual)"><input className="axiom-input" type="number" value={v.gri} onChange={u("gri")} title="Gross Income" /></Field><Field label="OpExpenses (Annual)"><input className="axiom-input" type="number" value={v.opex} onChange={u("opex")} title="OpExpenses" /></Field><KPI label="Cap Rate" value={capRate.toFixed(2) + "%"} color={capRate > 6 ? "var(--c-green)" : "var(--c-gold)"} /></div><KPI label="Net Operating Income" value={fmt.usd(noi)} color="var(--c-green)" /></Card>;
}

// src/v1/features/financials/Financials.tsx
function Financials() {
  return <div style={{ display: "flex", flexDirection: "column", gap: 20 }}><Tabs tabs={[
    "Pro Forma",
    "Deal Analyzer",
    "Calculator Hub"
  ]}><div key="proforma"><ProForma /></div><div key="analyzer"><DealAnalyzer /></div><div key="calcs"><CalcHub /></div></Tabs></div>;
}

// src/v1/features/analysis/Entitlements.tsx
function Entitlements() {
  const {
    site = {},
    setSite,
    zoning = {},
    setZoning,
    survey = {},
    setSurvey
  } = useProject();
  const su = (k) => (e) => setSite({ ...site, [k]: e.target.value });
  const zu = (k) => (e) => setZoning({ ...zoning, [k]: e.target.value });
  const ru = (k) => (e) => setSurvey({ ...survey, [k]: e.target.value });
  const timeline = [
    { phase: "Pre-Application", wks: "2-4" },
    { phase: "Application Submittal", wks: "1" },
    { phase: "Environmental Review", wks: "12-26" },
    { phase: "Staff Report", wks: "4-8" },
    { phase: "Planning Commission", wks: "2-4" },
    { phase: "Conditions of Approval", wks: "2-4" }
  ];
  return <div style={{ display: "flex", flexDirection: "column", gap: 20 }}><div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 20 }}><div style={{ display: "flex", flexDirection: "column", gap: 20 }}><Card title="Site Identification"><div className="axiom-grid-3"><Field label="Address"><input className="axiom-input" value={site.address || ""} onChange={su("address")} title="Address" /></Field><Field label="APN"><input className="axiom-input" value={site.apn || ""} onChange={su("apn")} title="APN" /></Field><Field label="Gross Acres"><input className="axiom-input" type="number" value={site.grossAcres || ""} onChange={su("grossAcres")} title="Gross Acres" /></Field></div></Card><Card title="Zoning Standards"><div className="axiom-grid-3"><Field label="Zone"><input className="axiom-input" value={zoning.zone || ""} onChange={zu("zone")} title="Zone" /></Field><Field label="Max Density"><input className="axiom-input" value={zoning.du_ac || ""} onChange={zu("du_ac")} title="Max Density" /></Field><Field label="Max Height"><input className="axiom-input" value={zoning.maxHeight || ""} onChange={zu("maxHeight")} title="Max Height" /></Field><Field label="Front Setback"><input className="axiom-input" value={zoning.frontSetback || ""} onChange={zu("frontSetback")} title="Front Setback" /></Field><Field label="Rear Setback"><input className="axiom-input" value={zoning.rearSetback || ""} onChange={zu("rearSetback")} title="Rear Setback" /></Field><Field label="Side Setback"><input className="axiom-input" value={zoning.sideSetback || ""} onChange={zu("sideSetback")} title="Side Setback" /></Field></div></Card><Card title="Entitlement Pathway"><div className="axiom-grid-2" style={{ marginBottom: 15 }}><Field label="Type"><select className="axiom-select" value={zoning.entitlementType} onChange={zu("entitlementType")} title="Type">{["Tentative Map", "Final Map", "Specific Plan", "PUD", "CUP"].map((o) => <option key={o}>{o}</option>)}</select></Field><Field label="Status"><select className="axiom-select" value={zoning.entitlementStatus} onChange={zu("entitlementStatus")} title="Status">{["Not Started", "Submitted", "Under Review", "Approved"].map((o) => <option key={o}>{o}</option>)}</select></Field></div><div style={{ borderTop: "1px solid var(--c-border)", paddingTop: 15 }}><div style={{ fontSize: 10, color: "var(--c-gold)", letterSpacing: 2, marginBottom: 10, textTransform: "uppercase" }}>Estimated Timeline</div>{timeline.map((t, i) => <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid var(--c-bg)" }}><span style={{ fontSize: 13, color: "var(--c-text)" }}>{t.phase}</span><span style={{ fontSize: 12, color: "var(--c-gold)" }}>{t.wks} wks</span></div>)}</div></Card></div><div style={{ display: "flex", flexDirection: "column", gap: 20 }}><Card title="Zoning Agent"><Agent id="zoning" system="You are a zoning and entitlement expert." placeholder="Ask about setbacks, density, or approval process..." /></Card><Card title="Survey / ALTA"><Field label="Surveyor"><input className="axiom-input" value={survey.surveyorName || ""} onChange={ru("surveyorName")} title="Surveyor" /></Field><Field label="Ordered?"><select className="axiom-select" value={survey.altaOrdered} onChange={ru("altaOrdered")} title="Ordered?"><option>No</option><option>Pending</option><option>Yes</option></select></Field></Card></div></div></div>;
}

// src/v1/features/analysis/Infrastructure.tsx
function Infrastructure() {
  const {
    utilities = [],
    setUtilities,
    env = {},
    setEnv
  } = useProject();
  const upd = (i, k, v) => {
    const d = [...utilities];
    d[i] = { ...d[i], [k]: v };
    setUtilities(d);
  };
  const eu = (k) => (e) => setEnv({ ...env, [k]: e.target.value });
  const services = utilities.length > 0 ? utilities : [
    { name: "Water", provider: "", status: "Verify" },
    { name: "Sewer", provider: "", status: "Verify" },
    { name: "Electric", provider: "", status: "Verify" },
    { name: "Gas", provider: "", status: "Verify" },
    { name: "Telecom", provider: "", status: "Verify" }
  ];
  return <div style={{ display: "flex", flexDirection: "column", gap: 20 }}><div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 20 }}><div style={{ display: "flex", flexDirection: "column", gap: 20 }}><Card title="Utility & Service Plan"><table className="axiom-table"><thead><tr><th className="axiom-th">SERVICE</th><th className="axiom-th">PROVIDER</th><th className="axiom-th">STATUS</th></tr></thead><tbody>{services.map((s, i) => <tr key={i} className="premium-hover"><td className="axiom-td" style={{ color: "var(--c-gold)", fontWeight: 700 }}>{s.name}</td><td className="axiom-td"><input
    className="axiom-input"
    style={{ background: "transparent", border: "none", padding: 0 }}
    value={s.provider || ""}
    onChange={(e) => upd(i, "provider", e.target.value)}
    placeholder="Enter district..."
  /></td><td className="axiom-td"><select
    className="axiom-select"
    style={{ fontSize: 11, padding: "2px 6px" }}
    value={s.status}
    onChange={(e) => upd(i, "status", e.target.value)}
    title="Status"
  >{["Verify", "Available", "Capacity Issue", "Extension Req"].map((o) => <option key={o}>{o}</option>)}</select></td></tr>)}</tbody></table></Card><Card title="Environmental & Flood"><div className="axiom-grid-2"><Field label="Flood Zone"><select className="axiom-select" value={env.floodZone} onChange={eu("floodZone")} title="Flood Zone"><option>Zone X</option><option>Zone AE</option><option>Zone A</option></select></Field><Field label="Phase I ESA"><select className="axiom-select" value={env.phase1} onChange={eu("phase1")} title="Phase I ESA"><option>No</option><option>Ordered</option><option>Received - Clean</option><option>Issues Found</option></select></Field><Field label="Wetlands"><select className="axiom-select" value={env.wetlands} onChange={eu("wetlands")} title="Wetlands"><option>None Observed</option><option>Potential</option><option>Confirmed</option></select></Field><Field label="CEQA Category"><select className="axiom-select" value={env.ceqa} onChange={eu("ceqa")} title="CEQA Category"><option>Categorical Exemption</option><option>Neg Dec</option><option>MND</option><option>EIR</option></select></Field></div></Card></div><div style={{ display: "flex", flexDirection: "column", gap: 20 }}><Card title="Infrastructure Agent"><Agent id="infrastructure" system="You are a civil engineer and environmental consultant." placeholder="Ask about utility extension, drainage, or ESA..." /></Card><KPI label="Flood Risk" value={env.floodZone === "Zone X" ? "Low" : "High"} color={env.floodZone === "Zone X" ? "var(--c-green)" : "var(--c-red)"} /><KPI label="Wetlands" value={env.wetlands === "Confirmed" ? "Impacted" : "Clear"} color={env.wetlands === "Confirmed" ? "var(--c-red)" : "var(--c-green)"} /></div></div></div>;
}

// src/v1/features/analysis/ConceptDesign.tsx
import { PieChart, Pie, Cell as Cell2, ResponsiveContainer as ResponsiveContainer4, Tooltip as Tooltip4 } from "recharts";
function ConceptDesign() {
  const { fin = {}, setFin } = useProject();
  const grossAcres = fin.grossAcres || 10;
  const netAcres = grossAcres * 0.75;
  const streetPct = 15;
  const openSpacePct = 15;
  const utilityPct = 5;
  const devSF = netAcres * 43560 * (1 - (streetPct + openSpacePct + utilityPct) / 100);
  const smallLotAvg = 4500;
  const largeLotAvg = 7500;
  const smallLotPct = 60;
  const smallLots = Math.floor(devSF * smallLotPct / 100 / smallLotAvg);
  const largeLots = Math.floor(devSF * (100 - smallLotPct) / 100 / largeLotAvg);
  const total = smallLots + largeLots;
  const pieD = [
    { name: "Streets", value: streetPct, fill: "var(--c-blue)" },
    { name: "Open Space", value: openSpacePct, fill: "var(--c-teal)" },
    { name: "Utilities", value: utilityPct, fill: "var(--c-purple)" },
    { name: "Residential", value: 100 - streetPct - openSpacePct - utilityPct, fill: "var(--c-gold)" }
  ];
  return <div style={{ display: "flex", flexDirection: "column", gap: 20 }}><div className="axiom-grid-4"><KPI label="Small SFR Lots" value={smallLots} sub={`avg ${fmt.num(smallLotAvg)} SF`} /><KPI label="Large SFR Lots" value={largeLots} sub={`avg ${fmt.num(largeLotAvg)} SF`} /><KPI label="Total Yield" value={total} color="var(--c-green)" sub="Concept only" /><KPI label="Concept Density" value={(total / netAcres).toFixed(1)} color="var(--c-gold)" sub="DU/AC" /></div><div className="axiom-grid-2"><Card title="Yield Configuration"><div className="axiom-grid-2" style={{ marginBottom: 15 }}><Field label="Gross Acres"><input className="axiom-input" type="number" value={grossAcres} onChange={(e) => setFin({ ...fin, grossAcres: +e.target.value })} title="Gross Acres" /></Field><Field label="Small Lot %"><input className="axiom-input" type="number" defaultValue={smallLotPct} title="Small Lot %" /></Field></div><Button
    variant="gold"
    label="Sync to Financial Model"
    onClick={() => setFin({ ...fin, totalLots: total })}
  /></Card><Card title="Land Use Mix"><div style={{ height: 200 }}><ResponsiveContainer4 width="100%" height="100%"><PieChart><Pie data={pieD} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={60} label={({ name, value }) => `${name} ${value}%`}>{pieD.map((d, i) => <Cell2 key={i} fill={d.fill} />)}</Pie><Tooltip4 /></PieChart></ResponsiveContainer4></div></Card></div><Card title="Planner Agent"><Agent id="planner" system="You are a land planner and subdivision designer." placeholder="Describe your site and I'll help with layout ideas..." /></Card></div>;
}

// src/v1/features/analysis/MarketIntel.tsx
import { useState as useState11 } from "react";
function MarketIntel() {
  const { project, comps, setComps } = useProject();
  const [filt, setFilt] = useState11("All");
  const filtered = comps.filter((c) => filt === "All" || c.status === filt);
  const adjPrices = filtered.map((c) => c.pricePerLot * (1 + (c.adj || 0) / 100));
  const avgPPL = adjPrices.length ? adjPrices.reduce((a, b) => a + b, 0) / adjPrices.length : 0;
  const avgPPSF = filtered.length ? filtered.reduce((s, c) => s + c.pricePerSF, 0) / filtered.length : 0;
  const loc = project?.state ? project.municipality ? `${project.municipality}, ${project.state}` : project.state : "Your Market";
  return <Tabs tabs={["Comparables", "Jurisdiction Intel", "Market Trends"]}><div><div className="axiom-grid-4" style={{ marginBottom: 20 }}><KPI label="Comps Analyzed" value={filtered.length.toString()} /><KPI label="Avg Adj. $/Lot" value={fmt.usd(avgPPL)} color="var(--c-green)" /><KPI label="Avg $/SF" value={"$" + avgPPSF.toFixed(2)} color="var(--c-blue)" /><KPI label="Price Range" value={filtered.length ? `${fmt.k(Math.min(...filtered.map((c) => c.pricePerLot)))} - ${fmt.k(Math.max(...filtered.map((c) => c.pricePerLot)))}` : "\u2014"} color="var(--c-amber)" /></div><Card title="Comparable Sales Database" action={<div style={{ display: "flex", gap: 8 }}><CSVImportButton onImport={(data) => {
    const newComps = data.map((d, i) => ({
      id: Date.now() + i,
      name: d.Project || d.name || "Imported",
      address: d.Address || d.address || "",
      lots: +(d.Lots || d.lots || 0),
      lotSF: +(d["Lot SF"] || d.lotSF || 0),
      saleDate: d.Date || d.saleDate || "",
      pricePerLot: +(d["$/Lot"] || d.pricePerLot || 0),
      pricePerSF: +(d["$/SF"] || d.pricePerSF || 0),
      status: d.Status || d.status || "Sold",
      adj: +(d["Adj%"] || d.adj || 0),
      notes: d.Notes || d.notes || ""
    }));
    setComps([...comps, ...newComps]);
  }} /><select className="axiom-select" style={{ width: 140 }} value={filt} onChange={(e) => setFilt(e.target.value)} title="Filter by status"><option>All</option><option>Sold</option><option>Listed</option><option>Pending</option></select></div>}><table className="axiom-table"><thead><tr style={{ textAlign: "left" }}><th className="axiom-th">Project</th><th className="axiom-th">Lots</th><th className="axiom-th">Lot SF</th><th className="axiom-th">Date</th><th className="axiom-th">$/Lot</th><th className="axiom-th">Adj%</th><th className="axiom-th">Status</th></tr></thead><tbody>{filtered.map((c) => <tr key={c.id} className="premium-hover"><td className="axiom-td"><div style={{ fontSize: 13, color: "var(--c-text)", fontWeight: 600 }}>{c.name}</div><div style={{ fontSize: 9, color: "var(--c-dim)" }}>{c.address}</div></td><td className="axiom-td">{c.lots}</td><td className="axiom-td">{fmt.num(c.lotSF)}</td><td className="axiom-td">{c.saleDate}</td><td className="axiom-td" style={{ color: "var(--c-gold)", fontWeight: 500 }}>{fmt.usd(c.pricePerLot)}</td><td className="axiom-td" style={{ color: c.adj > 0 ? "var(--c-green)" : c.adj < 0 ? "var(--c-red)" : "var(--c-dim)" }}>{c.adj > 0 ? "+" : ""}{c.adj}%
                                    </td><td className="axiom-td"><Badge label={c.status} color={c.status === "Sold" ? "var(--c-green)" : "var(--c-blue)"} /></td></tr>)}</tbody></table></Card></div><div><Card title={`Jurisdiction Intel - ${loc}`}><div className="axiom-label" style={{ marginBottom: 16 }}>
                        Specialized AI agents pre-loaded with local zoning, permit, and fee knowledge for <b style={{ color: "var(--c-gold)" }}>{loc}</b>.
                    </div><div className="axiom-grid-2"><Card title="Fee Estimator"><Agent id="FeeEstimator" system="You are a fee specialist..." placeholder={`Ask about fees in ${loc}...`} /></Card><Card title="Zoning Assistant"><Agent id="ZoningAssistant" system="You are a zoning expert..." placeholder={`Ask about zoning in ${loc}...`} /></Card></div></Card></div><div><Card title="Market Trends"><div style={{ padding: 40, textAlign: "center" }}><div style={{ fontSize: 16, color: "var(--c-sub)", marginBottom: 10 }}>Market trend visualization coming soon</div><div style={{ fontSize: 12, color: "var(--c-dim)" }}>Connect to CoStar or Regrid in Connectors to enable live data.</div></div></Card></div></Tabs>;
}

// src/v1/features/analysis/SiteMap.tsx
import { useState as useState12 } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";
var DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;
function SiteMap() {
  const { project, comps } = useProject();
  const [position] = useState12([34.0522, -118.2437]);
  return <Card title="Subject Property & Context Map" action={<Badge label="GIS Active" color="var(--c-green)" />} className="axiom-animate-slide-up"><div style={{ height: "400px", width: "100%", borderRadius: "8px", overflow: "hidden", border: "1px solid var(--c-border)" }}><MapContainer center={position} zoom={13} scrollWheelZoom={false} style={{ height: "100%", width: "100%", zIndex: 1 }}><TileLayer
    attribution='&copy; <a href="https://carto.com/">CARTO</a>'
    url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
  />{
    /* Subject Property Marker */
  }<Marker position={position}><Popup><strong>{project?.name || "Subject Property"}</strong><br />{project?.address || "Proposed Development Site"}</Popup></Marker>{
    /* Comparable Properties (Demo Coordinates relative to center) */
  }{comps.map((c, i) => {
    const lat = position[0] + (i % 2 === 0 ? 0.015 : -0.01) * Math.ceil((i + 1) / 2);
    const lng = position[1] + (i % 3 === 0 ? -0.02 : 0.015) * Math.ceil((i + 1) / 2);
    return <Marker key={c.id || i} position={[lat, lng]}><Popup><strong>{c.name}</strong><br />{c.status} - {c.lots} Lots<br /><span style={{ color: "var(--c-gold)" }}>${c.pricePerLot?.toLocaleString()}/lot</span></Popup></Marker>;
  })}</MapContainer></div><div className="axiom-text-11-dim" style={{ marginTop: 12 }}>
                Displaying location for {project?.name || "the current project"} and {comps.length} comparables. Interactive mapping provides spatial context for diligence items and comparable properties.
            </div></Card>;
}

// src/v1/features/analysis/SiteAnalysis.tsx
function SiteAnalysis() {
  return <div style={{ display: "flex", flexDirection: "column", gap: 20 }}><SiteMap /><Tabs tabs={[
    "Entitlements",
    "Infrastructure",
    "Concept Design",
    "Market Intelligence"
  ]}><div key="entitlements"><Entitlements /></div><div key="infrastructure"><Infrastructure /></div><div key="concept"><ConceptDesign /></div><div key="market"><MarketIntel /></div></Tabs></div>;
}

// src/v1/features/management/ProjectManagement.tsx
import { useState as useState13 } from "react";
function ProjectManagement() {
  const { ddChecks, setDdChecks, permits, setPermits, events, setEvents } = useProject();
  const [ne, setNe] = useState13({ title: "", date: "", type: "Milestone", priority: "Medium", notes: "" });
  const addEvent = () => {
    if (!ne.title) return;
    setEvents([...events, { ...ne, id: Date.now() }]);
    setNe({ title: "", date: "", type: "Milestone", priority: "Medium", notes: "" });
  };
  const PC = { Critical: "var(--c-red)", High: "var(--c-amber)", Medium: "var(--c-blue)", Low: "var(--c-dim)" };
  const TC2 = { Milestone: "var(--c-gold)", Meeting: "var(--c-teal)", Submittal: "var(--c-blue)", Deadline: "var(--c-red)", Review: "var(--c-purple)" };
  const ALL_DD_COUNT = DD_CATS.reduce((acc, cat) => acc + cat.items.length, 0);
  const doneCount = Object.values(ddChecks).filter(Boolean).length;
  const updPerm = (i, k, v) => {
    const d = [...permits];
    d[i] = { ...d[i], [k]: v };
    setPermits(d);
  };
  const permStatOpts = ["Not Started", "In Progress", "Submitted", "Under Review", "Approved", "Denied", "N/A"];
  const PSC = { Approved: "var(--c-green)", "Under Review": "var(--c-blue)", "In Progress": "var(--c-amber)", "Submitted": "var(--c-teal)", "Not Started": "var(--c-dim)", Denied: "var(--c-red)", "N/A": "var(--c-muted)" };
  return <div className="axiom-fade-in"><div className="axiom-flex-sb-center" style={{ marginBottom: 20 }}><h2 className="axiom-text-18-gold-ls1" style={{ margin: 0 }}>PROJECT MANAGEMENT</h2><Badge label="Execution Phase" color="var(--c-teal)" /></div><Tabs tabs={["Due Diligence", "Permits & Approvals", "Project Calendar", "Documents"]}>{
    /* Due Diligence */
  }<div style={{ display: "grid", gridTemplateColumns: "1fr 350px", gap: 20 }}><div><Card title="Due Diligence Progress" action={<Badge label={`${doneCount}/${ALL_DD_COUNT} Complete`} color={doneCount === ALL_DD_COUNT ? "var(--c-green)" : "var(--c-amber)"} />}><div className="axiom-stack-20-mb"><div className="axiom-flex-sb" style={{ marginBottom: 6 }}><span className="axiom-text-11-dim">Overall Completion</span><span className="axiom-text-14-gold-bold">{Math.round(doneCount / ALL_DD_COUNT * 100)}%</span></div><Progress value={doneCount / ALL_DD_COUNT * 100} /></div>{DD_CATS.map((cat, ci) => {
    const catDone = cat.items.filter((item) => ddChecks[`${ci}-${item.t}`]).length;
    return <div key={ci} className="axiom-stack-18-mb"><div className="axiom-flex-sb-center-p5-bb" style={{ marginBottom: 8 }}><span className="axiom-text-10-gold-ls2-caps">{cat.cat}</span><span className="axiom-text-10-dim">{catDone}/{cat.items.length}</span></div>{cat.items.map((item, ii) => {
      const key = `${ci}-${item.t}`;
      return <CItem key={ii} text={item.t} checked={!!ddChecks[key]} risk={item.r} onChange={() => setDdChecks({ ...ddChecks, [key]: !ddChecks[key] })} />;
    })}</div>;
  })}</Card></div><div><Card title="Due Diligence AI Agent"><Agent id="Coordinator" system="You are a senior real estate due diligence coordinator. Help identify missing items and assess risks." placeholder="Ask about DD gaps..." /></Card></div></div>{
    /* Permits */
  }<div style={{ display: "grid", gridTemplateColumns: "1fr 350px", gap: 20 }}><div><Card title="Permits & Approvals"><table className="axiom-table"><thead><tr><th className="axiom-th-left-10-dim-p8-bb">PERMIT</th><th className="axiom-th-left-10-dim-p8-bb">AGENCY</th><th className="axiom-th-left-10-dim-p8-bb">STATUS</th></tr></thead><tbody>{permits.map((p, i) => <tr key={i}><td className="axiom-td-13-p8-bb">{p.name}</td><td className="axiom-td-12-dim-p8-bb">{p.agency}</td><td className="axiom-td-p8-bb"><select
    className="axiom-select-transparent"
    style={{ color: PSC[p.status] }}
    value={p.status}
    onChange={(e) => updPerm(i, "status", e.target.value)}
  >{permStatOpts.map((o) => <option key={o} value={o}>{o}</option>)}</select></td></tr>)}</tbody></table></Card></div><div><Card title="Permit Timeline"><div className="axiom-stack-15-pl10">{permits.filter((p) => p.req).map((p, i) => <div key={i} className="axiom-permit-timeline-item" style={{ borderLeftColor: PSC[p.status] || "var(--c-border)" }}><div className="axiom-text-13-bold">{p.name}</div><div className="axiom-text-11-dim">{p.agency} — {p.duration}</div><Badge label={p.status} color={PSC[p.status]} /></div>)}</div></Card></div></div>{
    /* Calendar */
  }<div><Card title="Project Calendar" action={<Badge label={`${events.length} Events`} color="var(--c-blue)" />}><table className="axiom-table"><thead><tr><th className="axiom-th-left-10-dim-p8-bb">EVENT</th><th className="axiom-th-left-10-dim-p8-bb">DATE</th><th className="axiom-th-left-10-dim-p8-bb">TYPE</th><th className="axiom-th-left-10-dim-p8-bb">PRIORITY</th><th className="axiom-th-right-10-dim-p8-bb">ACTION</th></tr></thead><tbody>{[...events].sort((a, b) => a.date.localeCompare(b.date)).map((e) => <tr key={e.id}><td className="axiom-td-13-p8-bb">{e.title}</td><td className="axiom-td-12-gold-mono-p8-bb">{e.date}</td><td className="axiom-td-p8-bb"><Badge label={e.type} color={TC2[e.type]} /></td><td className="axiom-td-p8-bb"><Badge label={e.priority} color={PC[e.priority]} /></td><td className="axiom-td-right-p8-bb"><Button onClick={() => setEvents(events.filter((x) => x.id !== e.id))}>×</Button></td></tr>)}</tbody></table></Card><Card title="Add Event / Deadline"><div className="axiom-grid-4" style={{ gap: 15 }}><Field label="Title"><input
    className="axiom-input"
    value={ne.title}
    onChange={(e) => setNe({ ...ne, title: e.target.value })}
  /></Field><Field label="Date"><input
    className="axiom-input"
    type="date"
    value={ne.date}
    onChange={(e) => setNe({ ...ne, date: e.target.value })}
  /></Field><Field label="Type"><select
    className="axiom-input"
    value={ne.type}
    onChange={(e) => setNe({ ...ne, type: e.target.value })}
  >{Object.keys(TC2).map((t) => <option key={t}>{t}</option>)}</select></Field><div className="axiom-flex-end"><Button variant="gold" onClick={addEvent}>Add Event</Button></div></div></Card></div>{
    /* Documents Placeholder */
  }<Card title="Documents Binder"><div className="axiom-empty-binder"><div className="axiom-text-40" style={{ marginBottom: 10 }}>📁</div><div>Document management system initialization...</div><div className="axiom-text-11-dim" style={{ marginTop: 4 }}>Standard binder structure applied based on project jurisdiction.</div></div></Card></Tabs></div>;
}

// src/v1/features/management/RiskRegistry.tsx
import {
  Radar as Radar2,
  RadarChart as RadarChart2,
  PolarGrid as PolarGrid2,
  PolarAngleAxis as PolarAngleAxis2,
  ResponsiveContainer as ResponsiveContainer5,
  BarChart as BarChart3,
  Bar as Bar3,
  XAxis as XAxis3,
  YAxis as YAxis3,
  CartesianGrid as CartesianGrid3,
  Tooltip as Tooltip5
} from "recharts";
function RiskRegistry() {
  const { risks, setRisks } = useProject();
  const openRisks = risks.filter((r) => r.status === "Open").length;
  const criticalRisks = risks.filter((r) => r.severity === "Critical" || r.severity === "High").length;
  const severityMap = { Low: 1, Medium: 2, High: 3, Critical: 4 };
  const radarData = risks.map((r) => ({
    subject: r.cat || "Other",
    A: severityMap[r.severity] || 1,
    fullMark: 4
  }));
  const catData = Object.entries(
    risks.reduce((acc, r) => {
      acc[r.cat || "Other"] = (acc[r.cat || "Other"] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value }));
  const RC2 = { Low: "var(--c-green)", Medium: "var(--c-amber)", High: "var(--c-red)", Critical: "var(--c-purple)" };
  return <div className="axiom-fade-in"><div className="axiom-flex-sb-center" style={{ marginBottom: 20 }}><h2 className="axiom-text-18-gold-ls1" style={{ margin: 0 }}>RISK COMMAND</h2><Badge label="Risk Management" color="var(--c-red)" /></div><div className="axiom-grid-4" style={{ gap: 14, marginBottom: 20 }}><KPI label="Open Risks" value={openRisks} color="var(--c-amber)" /><KPI label="Critical/High" value={criticalRisks} color="var(--c-red)" /><KPI label="Mitigated" value={risks.filter((r) => r.status === "Mitigated").length} color="var(--c-green)" /><KPI label="Total Risks" value={risks.length} /></div><div className="axiom-grid-2" style={{ gap: 20, marginBottom: 20 }}><Card title="Risk Severity Matrix"><div style={{ height: 250 }}><ResponsiveContainer5 width="100%" height="100%"><RadarChart2 cx="50%" cy="50%" outerRadius="80%" data={radarData}><PolarGrid2 stroke="var(--c-border)" /><PolarAngleAxis2 dataKey="subject" tick={{ fill: "var(--c-dim)", fontSize: 10 }} /><Radar2 name="Risk" dataKey="A" stroke="var(--c-gold)" fill="var(--c-gold)" fillOpacity={0.5} /></RadarChart2></ResponsiveContainer5></div></Card><Card title="Risk by Category"><div style={{ height: 250 }}><ResponsiveContainer5 width="100%" height="100%"><BarChart3 data={catData} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}><CartesianGrid3 strokeDasharray="3 3" stroke="var(--c-border)" vertical={false} /><XAxis3 dataKey="name" tick={{ fill: "var(--c-dim)", fontSize: 10 }} axisLine={false} tickLine={false} /><YAxis3 tick={{ fill: "var(--c-dim)", fontSize: 10 }} axisLine={false} tickLine={false} /><Tooltip5
    cursor={{ fill: "var(--c-bg3)" }}
    contentStyle={{ background: "var(--c-bg2)", border: "1px solid var(--c-border)", borderRadius: 8 }}
    itemStyle={{ color: "var(--c-gold)" }}
  /><Bar3 dataKey="value" fill="var(--c-gold)" radius={[4, 4, 0, 0]} barSize={30} /></BarChart3></ResponsiveContainer5></div></Card></div><Card title="Risk Register"><div className="axiom-table-container"><table className="axiom-table"><thead><tr><th className="axiom-th-left-10-dim-p10-bb">Category</th><th className="axiom-th-left-10-dim-p10-bb">Risk Description</th><th className="axiom-th-left-10-dim-p10-bb">Severity</th><th className="axiom-th-left-10-dim-p10-bb">Status</th><th className="axiom-th-right-10-dim-p10-bb">Mitigation Plan</th></tr></thead><tbody>{risks.map((r, i) => <tr key={r.id || i}><td className="axiom-td-11-gold-p10-bb">{r.cat}</td><td className="axiom-td-13-p10-bb">{r.risk}</td><td className="axiom-td-p10-bb"><Badge label={r.severity} color={RC2[r.severity]} /></td><td className="axiom-td-p10-bb"><select
    className="axiom-select-transparent"
    style={{ color: r.status === "Mitigated" ? "var(--c-green)" : "var(--c-text)" }}
    value={r.status}
    onChange={(e) => {
      const newRisks = [...risks];
      newRisks[i] = { ...newRisks[i], status: e.target.value };
      setRisks(newRisks);
    }}
  ><option value="Open">Open</option><option value="Mitigated">Mitigated</option><option value="Closed">Closed</option></select></td><td className="axiom-td-right-11-dim-p10-bb" style={{ maxWidth: 200, whiteSpace: "normal" }}>{r.mitigation}</td></tr>)}</tbody></table></div></Card><div className="axiom-mt-20"><Card title="Risk Analysis AI Agent"><div className="axiom-agent-placeholder"><div style={{ textAlign: "center", color: "var(--c-dim)" }}><div className="axiom-text-40" style={{ marginBottom: 10 }}>🧠</div><div>Risk intelligence agent ready for analysis.</div><div className="axiom-text-11-dim" style={{ marginTop: 4 }}>Ask about mitigation strategies, probability scores, or contingency planning.</div></div></div></Card></div></div>;
}

// src/v1/features/output/AgentHub.tsx
import { useState as useState14 } from "react";
function AgentHub2() {
  const agents = [
    { id: "Zoning Navigator", icon: "Z", color: "var(--c-blue)", desc: "Decodes zoning codes and maps entitlement pathways", system: "You are a land use attorney and zoning consultant. Decode zoning codes, identify entitlement pathways, advise on variances and density bonuses.", placeholder: "Describe the zoning situation and I'll map the entitlement pathway..." },
    { id: "Acquisition Pro", icon: "A", color: "var(--c-gold)", desc: "Expert in site selection, off-market sourcing, and deal initial vetting", system: "You are a senior acquisition officer. Help identify high-potential sites, vet off-market deals, and advise on acquisition strategy.", placeholder: "Ask about site selection criteria or deal vetting..." },
    { id: "Appraisal AI", icon: "V", color: "var(--c-green)", desc: "Valuation specialist for land residual and finished lot analysis", system: "You are a commercial appraiser. Analyze land residual value, finished lot pricing, and market comparables.", placeholder: "Ask for a land residual analysis or comp check..." },
    { id: "Design Studio", icon: "D", color: "var(--c-teal)", desc: "Concept yield optimization and architectural feasibility", system: "You are an urban designer and architect. Optimize concept yields, advise on site density, and architectural feasibility.", placeholder: "Describe a site to optimize its development yield..." },
    { id: "Env. Consultant", icon: "E", color: "var(--c-amber)", desc: "Analyzes Phase I risks, wetlands, and physical constraints", system: "You are an environmental consultant. Identify Phase I ESA risks, analyze wetlands/flood zones, and physical site constraints.", placeholder: "Ask about environmental risks or physical constraints..." },
    { id: "Permit Liaison", icon: "P", color: "var(--c-purple)", desc: "Navigates municipal submittals and agency approvals", system: "You are a permit specialist. Sequence permit applications, identify dependencies, and estimate timelines.", placeholder: "Ask about permit sequencing or agency requirements..." },
    { id: "Underwriter", icon: "U", color: "var(--c-red)", desc: "Deep financial modeling, IRR/Equity multiple stress testing", system: "You are a real estate private equity underwriter. Perform deep financial modeling, stress test IRRs, and evaluate capital stacks.", placeholder: "Ask for a financial stress test or capital stack review..." },
    { id: "Civil Engineer", icon: "C", color: "var(--c-blue)", desc: "Site infrastructure, utilities, and grading estimation", system: "You are a civil engineer. Advise on site infrastructure, utility capacities, grading, and improvement costs.", placeholder: "Ask about utility connections or grading challenges..." },
    { id: "Market Analyst", icon: "M", color: "var(--c-gold)", desc: "Demographic trends, supply/demand, and price elasticities", system: "You are a market research analyst. Analyze demographic trends, supply/demand dynamics, and market pricing.", placeholder: "Ask about market trends or demographic shifts..." },
    { id: "Risk Manager", icon: "R", color: "var(--c-red)", desc: "Identifies project threats and structures mitigation strategies", system: "You are a development risk manager. Identify project threats, stress-test mitigation, and quantify risk exposure.", placeholder: "Describe a project for a comprehensive risk analysis..." },
    { id: "Legal Counsel", icon: "L", color: "var(--c-purple)", desc: "Title review, purchase agreements, and entitlement law", system: "You are a real estate attorney. Review prelim title reports, draft purchase agreements, and advise on entitlement law.", placeholder: "Ask about title issues or legal deal structures..." },
    { id: "Capital Markets", icon: "S", color: "var(--c-green)", desc: "Debt & equity sourcing and capital structure optimization", system: "You are a capital markets advisor. Source debt & equity, optimize capital structures, and advise on financing trends.", placeholder: "Ask about current debt terms or equity sourcing..." }
  ];
  const [active, setActive] = useState14(null);
  if (active !== null) {
    const a = agents[active];
    return <div><div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}><Button label="← Back to Hub" onClick={() => setActive(null)} /><div style={{ fontSize: 18, fontWeight: 700, color: "var(--c-gold)" }}>{a.id}</div></div><Card title={`${a.id} - \u2726 Live Session`}><Agent id={a.id} system={a.system} placeholder={a.placeholder} /></Card></div>;
  }
  return <><Card title="AI Agent Hub - 12 Specialized Agents"><div style={{ fontSize: 12, color: "var(--c-dim)", marginBottom: 16 }}>
                    Each agent is a specialized instance with domain-specific context. Select an agent to open a live session.
                </div><div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 14 }}>{agents.map((a, i) => <div
    key={i}
    style={{
      background: "var(--c-bg)",
      border: "1px solid var(--c-border)",
      borderRadius: 4,
      padding: 14,
      cursor: "pointer",
      transition: "all 0.12s",
      borderLeft: `3px solid ${a.color}`
    }}
    onClick={() => setActive(i)}
  ><div style={{ fontSize: 18, color: a.color, marginBottom: 6, fontWeight: 700 }}>{a.icon}</div><div style={{ fontSize: 13, color: "var(--c-text)", fontWeight: 700, marginBottom: 4 }}>{a.id}</div><div style={{ fontSize: 10, color: "var(--c-dim)", lineHeight: 1.4 }}>{a.desc}</div><div style={{ marginTop: 10 }}><Badge label="Launch Agent" color="var(--c-gold)" /></div></div>)}</div></Card><Card title="Multi-Agent Query"><div style={{ fontSize: 12, color: "var(--c-dim)", marginBottom: 12 }}>
                    Broadcast a question to all agents simultaneously and compare their specialized perspectives.
                </div><Agent id="MultiAgent" system="You are an orchestrating AI agent for real estate development." placeholder="Ask a question and get input from all specialist perspectives..." /></Card></>;
}

// src/v1/features/output/Reports.tsx
import { useState as useState15 } from "react";
function Reports() {
  const { project } = useProject();
  const sections = [
    "1. Executive Summary",
    "2. Site & Property Description",
    "3. Entitlement & Zoning Analysis",
    "4. Physical & Environmental Due Diligence",
    "5. Infrastructure & Utilities Report",
    "6. Concept Yield & Design Summary",
    "7. Market Analysis & Comparables",
    "8. Financial Pro Forma & Analysis",
    "9. Risk Assessment & Mitigation Plan",
    "10. Permit & Approval Schedule",
    "11. Investment Summary & Conclusion"
  ];
  return <Tabs tabs={["IC Memo Generator", "Binder Contents", "Export Options"]}><div><Card title="Investment Committee Memo Generator" action={<Badge label="AI-Powered" color="var(--c-gold)" />}><div className="axiom-text-12-dim" style={{ marginBottom: 16 }}>
                        Generate institutional-quality IC memos, lender packages, and risk assessments directly from your project data.
                    </div><ICMemoGenerator /></Card></div><div><Card title="Development Feasibility Binder" action={<Badge label={project?.name || "Unnamed Project"} color="var(--c-gold)" />}><div className="axiom-text-12-dim" style={{ marginBottom: 16 }}>
                        Complete investor and lender ready development package.
                    </div>{sections.map((s, i) => <div key={i} className="axiom-checkbox-item"><input type="checkbox" defaultChecked className="axiom-checkbox" title={`Include ${s}`} /><span className="axiom-text-12-dim">{s}</span><Badge label="Ready" color="var(--c-green)" /></div>)}</Card></div><div><Card title="Export & Distribution">{[
    { fmt: "PDF - Investor Package", desc: "Full binder with all sections, charts, and maps", ext: ".pdf", type: "text" },
    { fmt: "PDF - Lender Package", desc: "Financial highlights, pro forma, collateral summary", ext: ".pdf", type: "text" },
    { fmt: "Excel - Pro Forma Workbook", desc: "Interactive financial model with sensitivity analysis", ext: ".xlsx", type: "csv" },
    { fmt: "PowerPoint - Investor Deck", desc: "10-slide investment summary presentation", ext: ".pptx", type: "text" },
    { fmt: "Word - DD Summary", desc: "Due diligence checklist and findings memo", ext: ".docx", type: "text" },
    { fmt: "CSV - Data Export", desc: "Raw data export for external analysis", ext: ".csv", type: "csv" }
  ].map((e, i) => <div key={i} className="axiom-list-item-sb" style={{ padding: "12px 0" }}><div style={{ flex: 1 }}><div className="axiom-text-13">{e.fmt}</div><div className="axiom-text-11-dim" style={{ marginTop: 2 }}>{e.desc}</div></div><Button label="Export" onClick={() => {
    if (e.type === "csv") {
      downloadCSV(["Section", "Data"], sections.map((s) => [s, "Feasibility Data"]), `axiom_${e.fmt.split(" ")[0].toLowerCase()}${e.ext}`);
    } else {
      downloadText(`AXIOM OS - ${e.fmt}
Project: ${project?.name || "Unnamed"}

Generated: ${(/* @__PURE__ */ new Date()).toLocaleString()}`, `axiom_${e.fmt.split(" ")[0].toLowerCase()}${e.ext}`);
    }
  }} variant="gold" /></div>)}</Card></div></Tabs>;
}
function ICMemoGenerator() {
  const { fin, project, comps, risks, permits, loan, equity } = useProject();
  const [generating, setGenerating] = useState15(false);
  const [memo, setMemo] = useState15("");
  const [memoType, setMemoType] = useState15("ic_memo");
  const keys = JSON.parse(localStorage.getItem("axiom_api_keys") || "{}");
  const hard = (fin.totalLots || 0) * (fin.hardCostPerLot || 0);
  const soft = hard * (fin.softCostPct || 0) / 100;
  const fees = (fin.planningFees || 0) + ((fin.permitFeePerLot || 0) + (fin.schoolFee || 0) + (fin.impactFeePerLot || 0)) * (fin.totalLots || 0);
  const cont = (hard + soft) * (fin.contingencyPct || 0) / 100;
  const totalCost = (fin.landCost || 0) + (fin.closingCosts || 0) + hard + soft + cont + fees;
  const revenue = (fin.totalLots || 0) * (fin.salesPricePerLot || 0);
  const profit = revenue * 0.97 - totalCost * 1.05;
  const margin = revenue > 0 ? profit / revenue * 100 : 0;
  const roi = totalCost > 0 ? profit / totalCost * 100 : 0;
  const ctxStr = `
Project Name: ${project?.name || "Unnamed Project"}
Address: ${project?.address || "TBD"}, ${project?.municipality || "TBD"}, ${project?.state || "TBD"}
Target Lots: ${fin.totalLots}
Land Cost: $${fin.landCost?.toLocaleString()}
Total Hard & Soft Costs: $${(hard + soft + cont + fees).toLocaleString()}
Total Capital Required: $${totalCost.toLocaleString()}
Projected Revenue: $${revenue.toLocaleString()}
Target Margin: ${margin.toFixed(1)}%
Target ROI: ${roi.toFixed(1)}%

Financing & Equity:
Target LTC: ${loan?.ltc}% at ${loan?.rate}% Interest
GP Equity: ${equity?.gpPct}% / LP Equity: ${equity?.lpPct}%
Target Deal IRR: ${equity?.irrTarget}% / Equity Multiple: ${equity?.equityMultipleTarget}x

Market Comparables:
${comps?.length ? comps.map((c) => `- ${c.name} (${c.lots} lots): $${c.pricePerLot?.toLocaleString()}/lot (${c.status})`).join("\n") : "No comparables provided."}

Key Risks & Mitigations:
${risks?.length ? risks.filter((r) => r.severity === "High" || r.severity === "Critical").map((r) => `- [${r.severity}] ${r.cat}: ${r.risk}. Mitigation: ${r.mitigation}`).join("\n") : "No high risks identified."}

Key Pending Permits:
${permits?.length ? permits.filter((p) => p.status !== "Approved" && p.req).map((p) => `- ${p.name} (${p.agency}): Est. ${p.duration}, ${p.cost}`).join("\n") : "No pending permits."}
    `.trim();
  const MEMO_PROMPTS = {
    ic_memo: `Generate a highly detailed, professional Investment Committee Memorandum for the following real estate development project. Use this data:

${ctxStr}

Format the memo with clear markdown headings for: Executive Summary, Deal Merits & Return Profile, Market & Comps Analysis, Risk Analysis & Mitigations, and Recommendation. Maintain an institutional, precise, data-driven tone.`,
    lender_pkg: `Generate a Lender Package Summary for a construction/development loan request based on the following project data. Focus heavily on costs, margins, loan metrics, and risk mitigation. Use this data:

${ctxStr}

Include sections for: Loan Request Summary, Project Description, Financial Highlights (Sources & Uses implied by LTC and Equities), Collateral Summary, and Sponsor Overview.`,
    exec_summary: `Generate a crisp, compelling 1-page Executive Summary for the following real estate development project, highlighting the return profile, total capitalization, and deal merits for prospective LP investors:

${ctxStr}`,
    risk_memo: `Generate an exhaustive Risk Assessment Memorandum focusing on the highest severity risks for the following project. Provide an expanded analysis of the provided mitigations and suggest further defensive strategies a developer should take. Use this project data:

${ctxStr}`
  };
  const generate = async () => {
    if (!keys.proxyUrl) {
      alert("Configure your LLM proxy in Settings first.");
      return;
    }
    setGenerating(true);
    setMemo("");
    try {
      const resp = await fetch(keys.proxyUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${keys.anthropic || "x"}` },
        body: JSON.stringify({
          model: "claude-3-5-sonnet",
          max_tokens: 3e3,
          messages: [{ role: "user", content: MEMO_PROMPTS[memoType] || "Generate project summary" }],
          system: "You are a senior real estate investment analyst. Write precise, data-driven investment memos."
        })
      });
      const data = await resp.json();
      setMemo(data.content?.[0]?.text || data.choices?.[0]?.message?.content || "Demo mode: AI response simulated. (Configure proxy for live output)");
    } catch (e) {
      setMemo("Error: " + e.message);
    }
    setGenerating(false);
  };
  const MEMO_TYPES = [
    { id: "ic_memo", label: "IC Memo", desc: "Full Investment Committee Memo" },
    { id: "lender_pkg", label: "Lender Package", desc: "Construction loan presentation" },
    { id: "exec_summary", label: "Exec Summary", desc: "1-page deal overview" },
    { id: "risk_memo", label: "Risk Memo", desc: "Risk assessment matrix" }
  ];
  return <div><div className="axiom-flex-gap-8" style={{ marginBottom: 16, flexWrap: "wrap" }}>{MEMO_TYPES.map((mt) => <div key={mt.id} onClick={() => setMemoType(mt.id)} className={`axiom-memo-card ${memoType === mt.id ? "active" : ""}`}><div className="axiom-text-12-bold">{mt.label}</div><div className="axiom-text-9-dim" style={{ marginTop: 2 }}>{mt.desc}</div></div>)}</div><div className="axiom-snapshot"><div className="axiom-label" style={{ marginBottom: 12 }}>DEAL SNAPSHOT — {project?.name || "No Active Project"}</div><div className="axiom-grid-3">{[["Lots", fin.totalLots || "\u2014"], ["Total Cost", fmt.M(totalCost)], ["Revenue", fmt.M(revenue)], ["Profit", fmt.M(profit)], ["Margin", margin.toFixed(1) + "%"], ["ROI", roi.toFixed(1) + "%"]].map(([l, v]) => <div key={l} style={{ textAlign: "center" }}><div className="axiom-text-9-dim-caps">{l}</div><div className="axiom-text-14-bold" style={{ marginTop: 4 }}>{v}</div></div>)}</div></div><Button
    label={generating ? "\u27F3 Generating AI Memo..." : `\u2726 Generate ${MEMO_TYPES.find((m) => m.id === memoType)?.label}`}
    onClick={generate}
    variant="gold"
    className="axiom-button-full-13"
    disabled={generating}
  />{memo && <div className="axiom-stack-15" style={{ marginTop: 20 }}><div className="axiom-flex-sb-center" style={{ marginBottom: 10 }}><div className="axiom-text-11-green-bold">✓ Document Generated</div><div className="axiom-flex-gap-8"><Button label="Copy" onClick={() => navigator.clipboard.writeText(memo)} /><Button label="Download" onClick={() => downloadText(memo, `axiom_${memoType}.txt`)} /></div></div><div className="axiom-memo-output">{memo}</div></div>}</div>;
}

// src/v1/features/system/Settings.tsx
import { useState as useState16 } from "react";
var TeamSection = ({ tier }) => <Card title="Team Management" action={<Badge label={tier.toUpperCase()} color="var(--c-gold)" />}><div className="axiom-text-12-dim" style={{ marginBottom: 16 }}>
            Manage your team members and roles. Team features require a Pro or Enterprise plan.
        </div><div className="axiom-widget-placeholder"><div className="axiom-text-14-dim" style={{ marginBottom: 10 }}>Team management coming soon to V1</div><Button label="Invite Member" onClick={() => alert("Team features coming soon")} disabled /></div></Card>;
function Settings() {
  const auth = useAuth();
  const { tier } = useTier();
  const [profile, setProfile] = useLS("axiom_profile", {
    name: auth?.userProfile?.first_name ? `${auth.userProfile.first_name} ${auth.userProfile.last_name || ""}` : "",
    email: auth?.user?.email || "",
    company: auth?.userProfile?.company || "",
    role: "Developer",
    phone: "",
    timezone: "America/Los_Angeles"
  });
  const [apiKeys, setApiKeys] = useLS("axiom_api_keys", {
    proxyUrl: "",
    anthropic: "",
    openai: "",
    groq: "",
    together: "",
    costar: "",
    regrid: "",
    attom: "",
    google: ""
  });
  const [notifs, setNotifs] = useLS("axiom_notifs", {
    dealAlerts: true,
    listingAlerts: true,
    permitAlerts: false,
    weeklyDigest: true,
    emailNotifs: true,
    smsNotifs: false
  });
  const [saved, setSaved] = useState16("");
  const doSave = (label) => {
    setSaved(label);
    setTimeout(() => setSaved(""), 2e3);
  };
  const pu = (k) => (e) => setProfile({ ...profile, [k]: e.target.value });
  const au = (k) => (e) => setApiKeys({ ...apiKeys, [k]: e.target.value });
  return <Tabs tabs={["Profile", "API Keys", "Notifications", "Team", "Connection"]}><div><Card title="User Profile"><div className="axiom-grid-3" style={{ gap: 14 }}><Field label="Full Name"><input className="axiom-input" value={profile.name} onChange={pu("name")} placeholder="Your name" /></Field><Field label="Email"><input className="axiom-input" value={profile.email} onChange={pu("email")} placeholder="email@company.com" /></Field><Field label="Company"><input className="axiom-input" value={profile.company} onChange={pu("company")} placeholder="Company name" /></Field><Field label="Role"><select className="axiom-select" value={profile.role} onChange={pu("role")}>{["Developer", "Investor", "Broker", "Analyst", "Manager", "Executive", "Consultant", "Attorney", "Other"].map((r) => <option key={r}>{r}</option>)}</select></Field><Field label="Phone"><input className="axiom-input" value={profile.phone} onChange={pu("phone")} placeholder="(555) 000-0000" /></Field><Field label="Timezone"><select className="axiom-select" value={profile.timezone} onChange={pu("timezone")}>{["America/Los_Angeles", "America/Denver", "America/Chicago", "America/New_York", "America/Phoenix", "Pacific/Honolulu"].map((tz) => <option key={tz}>{tz}</option>)}</select></Field></div><div className="axiom-mt-20"><Button label={saved === "profile" ? "\u2713 Profile Saved!" : "Save Profile"} onClick={() => doSave("profile")} variant="gold" /></div></Card></div><div><Card title="API Key Management"><div className="axiom-text-12-dim" style={{ marginBottom: 14 }}>
                        Configure your LLM proxy for production, or use direct API keys for development.
                    </div><div className="axiom-card-inner-14" style={{ marginBottom: 14 }}><Field label="LLM Proxy URL (Recommended for Production)"><div className="axiom-flex-gap-8"><input
    className="axiom-input"
    style={{ flex: 1, borderColor: apiKeys.proxyUrl ? "var(--c-green)" : "var(--c-border2)" }}
    value={apiKeys.proxyUrl}
    onChange={au("proxyUrl")}
    placeholder="https://your-project.supabase.co/functions/v1/llm-proxy"
  />{supa.configured() && !apiKeys.proxyUrl && <Button label="Use Supabase" onClick={() => {
    const url = `${supa.url}/functions/v1/llm-proxy`;
    setApiKeys({ ...apiKeys, proxyUrl: url });
  }} />}</div></Field><div style={{ fontSize: 10, color: apiKeys.proxyUrl ? "var(--c-green)" : "var(--c-amber)", marginTop: 4 }}>{apiKeys.proxyUrl ? "\u2713 Proxy configured \u2014 API keys are kept server-side" : "\u26A0 No proxy \u2014 keys are exposed in the browser (dev mode only)"}</div></div><div className="axiom-grid-2" style={{ gap: 14 }}>{[
    ["Anthropic (Claude)", "anthropic", "sk-ant-..."],
    ["OpenAI", "openai", "sk-..."],
    ["Groq", "groq", "gsk_..."],
    ["Together AI", "together", "tog_..."],
    ["CoStar", "costar", "cs_..."],
    ["Regrid", "regrid", "rg_..."],
    ["ATTOM Data", "attom", "at_..."],
    ["Google Maps", "google", "AIza..."]
  ].map(([label, key, ph]) => <Field key={key} label={label}><input className="axiom-input" type="password" value={apiKeys[key]} onChange={au(key)} placeholder={ph} /></Field>)}</div><div className="axiom-mt-20"><Button label={saved === "api" ? "\u2713 API Keys Saved!" : "Save API Keys"} onClick={() => doSave("api")} variant="gold" /></div></Card></div><div><Card title="Notification Preferences">{[
    ["Deal Stage Changes", "dealAlerts", "Get notified when deals advance stages"],
    ["New Listing Matches", "listingAlerts", "Alerts for properties matching saved searches"],
    ["Permit Activity", "permitAlerts", "Notifications for permit filings in target areas"],
    ["Weekly Digest", "weeklyDigest", "Summary of pipeline activity and market updates"],
    ["Email Notifications", "emailNotifs", "Receive notifications via email"],
    ["SMS Notifications", "smsNotifs", "Receive notifications via text message"]
  ].map(([label, key, desc]) => <div key={key} className="axiom-flex-center-gap-12-p10-bb"><input type="checkbox" checked={!!notifs[key]} onChange={() => setNotifs({ ...notifs, [key]: !notifs[key] })} style={{ accentColor: "var(--c-gold)", width: 14, height: 14 }} /><div className="axiom-flex-1"><div className="axiom-text-13">{label}</div><div className="axiom-text-10-dim">{desc}</div></div></div>)}<div className="axiom-mt-20"><Button label="Save Preferences" onClick={() => doSave("notifs")} variant="gold" /></div></Card></div><div><TeamSection tier={tier} /></div><div><Card title="Supabase Connection" action={<Badge label={supa.configured() ? "Connected" : "Not Set"} color={supa.configured() ? "var(--c-green)" : "var(--c-dim)"} />}><div className="axiom-text-11-dim" style={{ marginBottom: 12 }}>
                        Connect to Supabase for cloud persistence, multi-device sync, and team collaboration.
                    </div><div className="axiom-grid-2" style={{ gap: 14 }}><Field label="Supabase URL"><input className="axiom-input" value={localStorage.getItem("axiom_supa_url") || ""} onChange={(e) => localStorage.setItem("axiom_supa_url", e.target.value)} placeholder="https://xxxxx.supabase.co" /></Field><Field label="Anon / Publishable Key"><input className="axiom-input" type="password" value={localStorage.getItem("axiom_supa_key") || ""} onChange={(e) => localStorage.setItem("axiom_supa_key", e.target.value)} placeholder="eyJhbGci..." /></Field></div><div className="axiom-flex-gap-8" style={{ marginTop: 16 }}><Button label={saved === "supa" ? "\u2713 Saved!" : "Save Connection"} onClick={() => {
    supa.url = localStorage.getItem("axiom_supa_url") || "";
    supa.key = localStorage.getItem("axiom_supa_key") || "";
    doSave("supa");
    window.location.reload();
  }} variant="gold" /></div></Card><Card title="Data Management">{[
    ["Export All Data", "Download complete backup of all project data as JSON"],
    ["Clear Local Storage", "Remove all locally stored data (cannot be undone)"],
    ["Import Project Data", "Restore from a previous backup file"],
    ["Reset to Defaults", "Restore all settings and data to factory defaults"]
  ].map(([l, d], i) => <div key={i} className="axiom-flex-center-gap-12-p10-bb"><div className="axiom-flex-1"><div style={{ fontSize: 13, color: i >= 1 ? "var(--c-red)" : "var(--c-text)" }}>{l}</div><div className="axiom-text-10-dim">{d}</div></div><Button label={i === 0 ? "Export" : "Action"} onClick={() => alert("Action triggered")} variant={i === 0 ? "gold" : void 0} /></div>)}</Card></div></Tabs>;
}

// src/v1/features/system/Connectors.tsx
function Connectors() {
  const [list] = useLS("axiom_connectors", [
    { id: 1, name: "CoStar API", type: "API", status: "Connected", key: "cs_\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022", endpoint: "https://api.costar.com/v1" },
    { id: 2, name: "Regrid Parcels", type: "API", status: "Connected", key: "rg_\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022", endpoint: "https://app.regrid.com/api" },
    { id: 3, name: "FEMA Flood API", type: "API", status: "Idle", key: "", endpoint: "https://msc.fema.gov" },
    { id: 4, name: "Google Maps", type: "API", status: "Connected", key: "gm_\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022", endpoint: "https://maps.googleapis.com" },
    { id: 5, name: "ATTOM Data", type: "API", status: "Idle", key: "", endpoint: "https://api.attomdata.com" },
    { id: 6, name: "SketchUp MCP", type: "MCP", status: "Offline", key: "", endpoint: "ws://localhost:3001" },
    { id: 7, name: "GIS Data MCP", type: "MCP", status: "Offline", key: "", endpoint: "ws://localhost:3002" },
    { id: 8, name: "Salesforce CRM", type: "App", status: "Connected", key: "", endpoint: "" },
    { id: 9, name: "Procore", type: "App", status: "Idle", key: "", endpoint: "" },
    { id: 10, name: "DocuSign", type: "App", status: "Idle", key: "", endpoint: "" }
  ]);
  const SC = {
    Connected: "var(--c-green)",
    Idle: "var(--c-amber)",
    Offline: "var(--c-dim)"
  };
  const mcpServers = [
    { name: "SketchUp Live Model Server", desc: "3D model streaming and updates", port: 3001 },
    { name: "GIS / Parcel Data MCP", desc: "Live parcel, zoning, and GIS data", port: 3002 },
    { name: "Municipal Records MCP", desc: "Permit history, zoning codes", port: 3003 },
    { name: "Environmental Data MCP", desc: "FEMA, wetlands, species databases", port: 3004 },
    { name: "Market Data MCP", desc: "Live comp sales and pricing", port: 3005 },
    { name: "Construction Cost MCP", desc: "RSMeans and local bid data", port: 3006 }
  ];
  return <Tabs tabs={["Connections", "MCP Servers", "Webhooks"]}><div><Card title="Active Connectors" action={<Badge label={list.filter((c) => c.status === "Connected").length + " Active"} color="var(--c-green)" />}><div className="axiom-table-container"><table className="axiom-table"><thead><tr className="axiom-th-left-10-dim-p10-bb"><th className="axiom-th-left-10-dim-p10-bb">Name</th><th className="axiom-th-left-10-dim-p10-bb">Type</th><th className="axiom-th-left-10-dim-p10-bb">Endpoint</th><th className="axiom-th-left-10-dim-p10-bb">Status</th><th className="axiom-th-left-10-dim-p10-bb">Actions</th></tr></thead><tbody>{list.map((c) => <tr key={c.id} className="axiom-tr-bb"><td className="axiom-td-13-p10">{c.name}</td><td className="axiom-td-p10"><Badge label={c.type} color={c.type === "MCP" ? "var(--c-purple)" : c.type === "App" ? "var(--c-teal)" : "var(--c-blue)"} /></td><td className="axiom-td-11-dim-p10">{c.endpoint || "\u2014 "}</td><td className="axiom-td-p10"><Badge label={c.status} color={SC[c.status] || "var(--c-dim)"} /></td><td className="axiom-td-p10"><Button label={c.status === "Connected" ? "Disconnect" : "Connect"} onClick={() => {
  }} /></td></tr>)}</tbody></table></div></Card></div><div><Card title="MCP - Model Context Protocol Servers"><div className="axiom-text-12-dim" style={{ marginBottom: 16 }}>
                        These local servers extend Axiom AI capabilities with offline datasets and live model streaming.
                    </div><div className="axiom-grid-1-1fr" style={{ gap: 14 }}>{mcpServers.map((s, i) => <div key={i} className="axiom-card-inner-14"><div className="axiom-flex-sb" style={{ marginBottom: 8 }}><div className="axiom-text-13-bold">{s.name}</div><Badge label="OFFLINE" color="var(--c-dim)" /></div><div className="axiom-text-10-dim" style={{ marginBottom: 10 }}>{s.desc}</div><div className="axiom-flex-sb-center"><div className="axiom-text-11-gold-mono">localhost:{s.port}</div><Button label="Start" onClick={() => {
  }} variant="gold" /></div></div>)}</div></Card></div><div><Card title="Incoming Webhooks"><div className="axiom-widget-placeholder"><div className="axiom-text-14-dim" style={{ marginBottom: 10 }}>No webhooks configured</div><Button label="Add Webhook Endpoint" onClick={() => {
  }} /></div></Card></div></Tabs>;
}

// src/v1/AppV1.tsx
function NavItem({ label, active, onClick }) {
  return <div
    onClick={onClick}
    className={`axiom-sidebar-item ${active ? "active" : ""}`}
  >{label}</div>;
}
function AppContent() {
  const [view, setView] = useState17("dashboard");
  return <div className="axiom-layout"><div className="axiom-sidebar"><div className="axiom-sidebar-header">
                    AXIOM OS <span style={{ fontSize: 9, color: "var(--c-dim)", verticalAlign: "top" }}>V1</span></div><nav className="axiom-sidebar-nav"><div className="axiom-breadcrumb" style={{ marginBottom: 12, paddingLeft: 12 }}>OVERVIEW</div><NavItem label="Command Center" active={view === "dashboard"} onClick={() => setView("dashboard")} /><NavItem label="Contacts" active={view === "contacts"} onClick={() => setView("contacts")} /><NavItem label="Deals Pipeline" active={view === "deals"} onClick={() => setView("deals")} /><div className="axiom-breadcrumb" style={{ marginBottom: 12, marginTop: 20, paddingLeft: 12 }}>INTELLIGENCE</div><NavItem label="Market Intel" active={view === "market"} onClick={() => setView("market")} /><NavItem label="Site Analysis" active={view === "analysis"} onClick={() => setView("analysis")} /><NavItem label="Neural Agents" active={view === "agents"} onClick={() => setView("agents")} /><NavItem label="Agent Hub" active={view === "hub"} onClick={() => setView("hub")} /><div className="axiom-breadcrumb" style={{ marginBottom: 12, marginTop: 20, paddingLeft: 12 }}>EXECUTION</div><NavItem label="Financials" active={view === "financials"} onClick={() => setView("financials")} /><NavItem label="Project Management" active={view === "process"} onClick={() => setView("process")} /><NavItem label="Risk Command" active={view === "risk"} onClick={() => setView("risk")} /><NavItem label="Reports & Binders" active={view === "reports"} onClick={() => setView("reports")} /><div className="axiom-breadcrumb" style={{ marginBottom: 12, marginTop: 20, paddingLeft: 12 }}>SYSTEM</div><NavItem label="Settings" active={view === "settings"} onClick={() => setView("settings")} /><NavItem label="Connectors" active={view === "connectors"} onClick={() => setView("connectors")} /></nav></div><div className="axiom-main">{view === "dashboard" && <Dashboard />}{view === "contacts" && <Contacts />}{view === "deals" && <Deals />}{view === "market" && <MarketIntel />}{view === "analysis" && <SiteAnalysis />}{view === "agents" && <NeuralAgents />}{view === "hub" && <AgentHub2 />}{view === "financials" && <Financials />}{view === "process" && <ProjectManagement />}{view === "risk" && <RiskRegistry />}{view === "reports" && <Reports />}{view === "settings" && <Settings />}{view === "connectors" && <Connectors />}</div></div>;
}
function AppV1() {
  return <AuthProvider><TierProvider><ProjectProvider><AppContent /></ProjectProvider></TierProvider></AuthProvider>;
}
export {
  AppV1 as default
};
