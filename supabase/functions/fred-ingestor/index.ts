// fred-ingestor — pulls key FRED series into the signals table
// Can be triggered manually via POST, or via a Supabase cron pg_cron job
// POST /functions/v1/fred-ingestor  { "series": ["SOFR", "T10Y2Y"] }  (optional — defaults to all)
// Deploy: supabase functions deploy fred-ingestor

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

// FRED series we care about for CRE dealmaking
const FRED_SERIES: Record<string, { title: string; domain: string; asset_type: string; direction_fn: (v: number, prev: number) => string; tags: string[] }> = {
    SOFR: {
        title: "Secured Overnight Financing Rate (SOFR)",
        domain: "macro", asset_type: "all",
        direction_fn: (v, p) => v > p ? "inflationary" : "deflationary",
        tags: ["rates", "sofr", "floating_rate", "construction_financing"],
    },
    DGS10: {
        title: "10-Year Treasury Constant Maturity Rate",
        domain: "macro", asset_type: "all",
        direction_fn: (v, p) => v > p ? "inflationary" : "deflationary",
        tags: ["rates", "treasury", "cap_rates", "exit_yield"],
    },
    WPUIP2311001: {
        title: "PPI: Construction Materials",
        domain: "materials", asset_type: "all",
        direction_fn: (v, p) => v > 103 ? "inflationary" : "neutral",
        tags: ["ppi", "materials", "hard_cost", "construction"],
    },
    CES2000000003: {
        title: "Average Hourly Earnings: Construction",
        domain: "labor", asset_type: "all",
        direction_fn: (v, p) => v > p ? "inflationary" : "neutral",
        tags: ["labor", "wages", "construction", "soft_cost"],
    },
    USSTHPI: {
        title: "US House Price Index",
        domain: "market", asset_type: "sfr",
        direction_fn: (v, p) => v > p ? "deflationary" : "inflationary",
        tags: ["hpi", "home_price", "sfr", "demand"],
    },
    MORTGAGE30US: {
        title: "30-Year Fixed Mortgage Rate",
        domain: "macro", asset_type: "sfr",
        direction_fn: (v, p) => v > 7 ? "inflationary" : "neutral",
        tags: ["mortgage", "rates", "affordability", "sfr"],
    },
    CUSR0000SEHC: {
        title: "CPI: Housing",
        domain: "market", asset_type: "multifamily",
        direction_fn: (v, p) => v > 300 ? "inflationary" : "neutral",
        tags: ["cpi", "housing", "rent", "multifamily"],
    },
    EMVMACROBUS006: {
        title: "Market Volatility: Macroeconomic News",
        domain: "macro", asset_type: "all",
        direction_fn: (v, p) => v > 50 ? "inflationary" : "neutral",
        tags: ["volatility", "macro", "uncertainty", "risk"],
    },
};

interface FredObservation {
    date: string;
    value: string;
}

async function fetchFredSeries(seriesId: string, apiKey: string): Promise<{ value: number; date: string; prev: number } | null> {
    const url = `https://api.stlouisfed.org/fred/series/observations?series_id=${seriesId}&api_key=${apiKey}&file_type=json&sort_order=desc&limit=2`;
    const r = await fetch(url);
    if (!r.ok) return null;
    const data = await r.json();
    const obs: FredObservation[] = data.observations || [];
    const latest = obs.find(o => o.value !== ".");
    const prev = obs.slice(1).find(o => o.value !== ".");
    if (!latest) return null;
    return {
        value: parseFloat(latest.value),
        date: latest.date,
        prev: prev ? parseFloat(prev.value) : parseFloat(latest.value),
    };
}

Deno.serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    const fredKey = Deno.env.get("FRED_API_KEY");
    if (!fredKey) {
        return new Response(JSON.stringify({ error: "FRED_API_KEY not configured" }), {
            status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }

    const supabase = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Optional filter — body can specify which series to pull
    let requestedSeries: string[] | null = null;
    try {
        const body = await req.json().catch(() => ({}));
        if (Array.isArray(body.series)) requestedSeries = body.series;
    } catch { /* empty body is fine */ }

    const seriesToFetch = requestedSeries
        ? Object.entries(FRED_SERIES).filter(([id]) => requestedSeries!.includes(id))
        : Object.entries(FRED_SERIES);

    const results: { series: string; status: string; signal_id?: string; error?: string }[] = [];

    for (const [seriesId, meta] of seriesToFetch) {
        try {
            const obs = await fetchFredSeries(seriesId, fredKey);
            if (!obs) {
                results.push({ series: seriesId, status: "no_data" });
                continue;
            }

            const signal = {
                domain: meta.domain,
                region: "US",
                asset_type: meta.asset_type,
                source_type: "ticker",
                source_name: `FRED:${seriesId}`,
                source_url: `https://fred.stlouisfed.org/series/${seriesId}`,
                title: meta.title,
                summary: `${meta.title}: latest value ${obs.value.toFixed(3)} as of ${obs.date}. Previous: ${obs.prev.toFixed(3)}. Change: ${(obs.value - obs.prev).toFixed(3)}.`,
                raw_payload: { series_id: seriesId, value: obs.value, date: obs.date, prev: obs.prev },
                direction: meta.direction_fn(obs.value, obs.prev),
                strength: Math.min(1, Math.abs(obs.value - obs.prev) / Math.max(0.01, Math.abs(obs.prev))),
                horizon_months: 6,
                tags: meta.tags,
            };

            const { data, error } = await supabase.from("signals").insert(signal).select("id").single();
            if (error) throw error;
            results.push({ series: seriesId, status: "ok", signal_id: data?.id });
        } catch (err: any) {
            results.push({ series: seriesId, status: "error", error: err.message });
        }
    }

    const ok = results.filter(r => r.status === "ok").length;
    const errors = results.filter(r => r.status === "error");

    return new Response(JSON.stringify({
        success: errors.length === 0,
        summary: `${ok}/${seriesToFetch.length} series ingested`,
        results,
        timestamp: new Date().toISOString(),
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
});
