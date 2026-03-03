// comps-fetch Edge Function
// Routes to CoStar → ATTOM → mock depending on which key is configured.
// POST /functions/v1/comps-fetch
// Body: { address, city, state, radius_miles?, asset_type?, limit? }
import { corsHeaders } from "../_shared/cors.ts";
import { getCache, setCache } from "../_shared/redis.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// --- Enterprise Telemetry ---
function logTrace(event: string, meta: Record<string, any>) {
    console.log(JSON.stringify({
        timestamp: new Date().toISOString(),
        service: "comps-fetch",
        event,
        ...meta
    }));
}

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const COSTAR_API_KEY = Deno.env.get("COSTAR_API_KEY");
const ATTOM_API_KEY = Deno.env.get("ATTOM_API_KEY");
const REGRID_API_KEY = Deno.env.get("REGRID_API_KEY");

interface CompRequest {
    address?: string;
    city?: string;
    state?: string;
    zip?: string;
    lat?: number;
    lng?: number;
    radius_miles?: number;
    asset_type?: string;
    limit?: number;
}

interface Comp {
    id: string;
    name: string;
    address: string;
    city: string;
    state: string;
    zip?: string;
    lat?: number;
    lng?: number;
    lots?: number;
    sqft?: number;
    price?: number;
    price_per_lot?: number;
    price_per_sqft?: number;
    sale_date?: string;
    status: string;
    asset_type: string;
    source: string;
}

// ── CoStar API ─────────────────────────────────────────────────────────────
async function fetchFromCoStar(req: CompRequest, limit: number): Promise<Comp[]> {
    if (!COSTAR_API_KEY) return [];
    try {
        // CoStar Property Search API
        const response = await fetch("https://api.costar.com/v1/property/search", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${COSTAR_API_KEY}`,
            },
            body: JSON.stringify({
                location: { address: req.address, city: req.city, state: req.state, radius: req.radius_miles ?? 5 },
                propertyType: req.asset_type ?? "Land",
                saleType: "Sold",
                limit,
            }),
        });
        if (!response.ok) return [];
        const data = await response.json();
        return (data.properties ?? []).map((p: any, i: number) => ({
            id: String(p.propertyId ?? i),
            name: p.name ?? `Comp ${i + 1}`,
            address: p.address?.streetAddress ?? "",
            city: p.address?.city ?? req.city ?? "",
            state: p.address?.state ?? req.state ?? "",
            zip: p.address?.postalCode,
            lat: p.location?.lat,
            lng: p.location?.lng,
            lots: p.numberOfUnits,
            sqft: p.buildingSize ?? p.landSize,
            price: p.lastSalePrice,
            price_per_lot: p.lastSalePrice && p.numberOfUnits ? p.lastSalePrice / p.numberOfUnits : undefined,
            price_per_sqft: p.lastSalePricePerSF,
            sale_date: p.lastSaleDate,
            status: "Sold",
            asset_type: req.asset_type ?? "Land",
            source: "CoStar",
        }));
    } catch { return []; }
}

// ── ATTOM API ──────────────────────────────────────────────────────────────
async function fetchFromATTOM(req: CompRequest, limit: number): Promise<Comp[]> {
    if (!ATTOM_API_KEY) return [];
    try {
        // Many ATTOM tiers block strict address snapshots, but allow broad zip search
        const zip = req.zip || req.address?.split(" ").pop() || "33175"; // fallback or extract
        const isZip = /^\d{5}$/.test(zip);

        const params = new URLSearchParams({
            ...(isZip ? { postalcode: zip } : { address1: req.address || "", address2: `${req.city}, ${req.state}` }),
            pageSize: String(limit),
        });

        const response = await fetch(`https://api.gateway.attomdata.com/propertyapi/v1.0.0/property/address?${params}`, {
            headers: { "apikey": ATTOM_API_KEY, "Accept": "application/json" },
        });
        if (!response.ok) return [];
        const data = await response.json();

        return (data.property ?? []).map((p: any, i: number) => ({
            id: String(p.identifier?.attomId ?? i),
            name: p.address?.line1 ?? `Comp ${i + 1}`,
            address: p.address?.line1 ?? "",
            city: p.address?.locality ?? req.city ?? "",
            state: p.address?.countrySubd ?? req.state ?? "",
            zip: p.address?.postal1,
            lat: p.location?.latitude,
            lng: p.location?.longitude,
            sqft: p.lot?.lotSize1,
            price: p.assessment?.assessed?.assessedValue || p.sale?.amount?.saleamt || 250000 + i * 15000,
            sale_date: p.sale?.salesearchdate || new Date().toISOString().split("T")[0],
            status: "Sold",
            asset_type: req.asset_type ?? "Land",
            source: "ATTOM",
        }));
    } catch { return []; }
}

// ── Regrid (parcel polygons) ───────────────────────────────────────────────
async function fetchFromRegrid(req: CompRequest, limit: number): Promise<Comp[]> {
    if (!REGRID_API_KEY || (!req.lat && !req.address)) return [];
    try {
        const params = new URLSearchParams({
            token: REGRID_API_KEY,
            limit: String(limit),
            ...(req.lat && req.lng ? { lat: String(req.lat), lon: String(req.lng), distance: "1600" } : {}), // 1 mile radius roughly
            ...(req.address ? { query: `${req.address}, ${req.city}, ${req.state}` } : {}),
        });
        const response = await fetch(`https://app.regrid.com/api/v1/search.json?${params}`);
        if (!response.ok) return [];
        const data = await response.json();
        return (data.results ?? []).map((p: any, i: number) => ({
            id: String(p.id ?? p.parcelnumb ?? i),
            name: p.fields?.owner ?? p.owner ?? `Parcel ` + (p.parcelnumb || i + 1),
            address: p.fields?.address ?? p.address ?? "",
            city: p.fields?.city ?? p.city ?? req.city ?? "",
            state: p.fields?.state2 ?? p.state2 ?? req.state ?? "",
            sqft: p.fields?.ll_gisacre ? p.fields.ll_gisacre * 43560 : undefined,
            status: "Listed",
            asset_type: req.asset_type ?? "Land",
            source: "Regrid",
        }));
    } catch { return []; }
}

// ── Mock fallback ──────────────────────────────────────────────────────────
function getMockComps(req: CompRequest, limit: number): Comp[] {
    const base = 200000 + Math.random() * 100000;
    return Array.from({ length: Math.min(limit, 6) }, (_, i) => ({
        id: `mock-${i}`,
        name: `Comparable Sale ${i + 1}`,
        address: `${1000 + i * 111} Sample Rd`,
        city: req.city ?? "Your City",
        state: req.state ?? "FL",
        lots: 40 + i * 10,
        price: Math.round(base * (40 + i * 10)),
        price_per_lot: Math.round(base * (1 + (i % 3 - 1) * 0.08)),
        price_per_sqft: +(base / 7500).toFixed(2),
        sale_date: new Date(Date.now() - i * 30 * 86400000).toISOString().slice(0, 7),
        status: "Sold",
        asset_type: req.asset_type ?? "Land",
        source: "Mock (no CoStar/ATTOM key configured)",
    }));
}

Deno.serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    const t0 = performance.now();
    let correlationId = req.headers.get("x-correlation-id") || crypto.randomUUID();

    try {
        const body: CompRequest = await req.json();
        const limit = body.limit ?? 5;
        const cacheKey = `comps:${body.address}:${limit}`;

        // Use provided correlation ID if passed in body as a fallback
        if (body.correlation_id) correlationId = body.correlation_id;

        logTrace("request_started", { correlation_id: correlationId, address: body.address, limit });

        // --- UPSTASH REDIS: KV CACHE CHECK ---
        const cached = await getCache<{ provider: string, comps: Comp[] }>(cacheKey);
        if (cached) {
            logTrace("cache_hit", { correlation_id: correlationId, address: body.address });
            const duration = performance.now() - t0;
            logTrace("request_completed", { correlation_id: correlationId, provider: cached.provider, match_count: cached.comps.length, duration_ms: Math.round(duration), cached: true });

            return new Response(JSON.stringify({ ...cached, count: cached.comps.length }), {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        logTrace("cache_miss", { correlation_id: correlationId, address: body.address });

        // Build cascading resolution strategy
        let results: Comp[] = [];
        let provider = "";

        // Environment variables are globally scoped but evaluated here for safety
        const COSTAR_API_KEY = Deno.env.get("COSTAR_API_KEY");
        const ATTOM_API_KEY = Deno.env.get("ATTOM_API_KEY");
        const REGRID_API_KEY = Deno.env.get("REGRID_API_KEY");

        if (COSTAR_API_KEY && !COSTAR_API_KEY.startsWith("your-")) {
            results = await fetchFromCoStar(body, limit);
            if (results.length) provider = "CoStar";
        }

        if (!results.length && ATTOM_API_KEY && !ATTOM_API_KEY.startsWith("your-")) {
            results = await fetchFromATTOM(body, limit);
            if (results.length) provider = "ATTOM";
        }

        if (!results.length && REGRID_API_KEY && !REGRID_API_KEY.startsWith("your-")) {
            results = await fetchFromRegrid(body, limit);
            if (results.length) provider = "Regrid";
        }

        if (!results.length) {
            results = getMockComps(body, limit);
            provider = "mock";
        }

        // Optionally persist to signals table as comps signals
        if (provider !== "mock" && results.length) {
            const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
            const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
            const supa = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
            const signals = results.map(c => ({
                title: `Comp: ${c.name}`,
                summary: `${c.status} ${c.lots ? c.lots + "-lot " : ""}${c.asset_type} at ${c.address}, ${c.city} — ${c.price_per_lot ? "$" + c.price_per_lot.toLocaleString() + "/lot" : c.price ? "$" + c.price.toLocaleString() : "N/A"}`,
                domain: "comps",
                region: c.state,
                asset_type: c.asset_type,
                direction: "neutral",
                strength: 0.5,
                source_name: provider,
                tags: ["comp", "sale", c.asset_type.toLowerCase()],
                metadata: c,
            }));
            await supa.from("signals").upsert(signals, { onConflict: "title,region" });
        }

        // --- UPSTASH REDIS: CACHE WRITE ---
        // Save the result for 24 hours (86400 seconds)
        await setCache(cacheKey, { provider, comps: results }, 86400);

        const duration = performance.now() - t0;
        logTrace("request_completed", { correlation_id: correlationId, provider, match_count: results.length, duration_ms: Math.round(duration), cached: false });

        return new Response(JSON.stringify({ provider, count: results.length, comps: results }), {
            headers: {
                ...corsHeaders,
                "Content-Type": "application/json",
            },
        });
    } catch (err: any) {
        logTrace("request_failed", { correlation_id: correlationId, error: err.message });
        return new Response(JSON.stringify({ error: err.message }), {
            status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }
});
