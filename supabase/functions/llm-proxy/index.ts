// llm-proxy v2 — routes to OpenAI, Anthropic, Groq, or Together AI
// All provider keys are Supabase secrets. Frontend selects model; proxy routes to correct provider.
import { corsHeaders } from "../_shared/cors.ts";

// --- Enterprise Telemetry ---
function logTrace(event: string, meta: Record<string, any>) {
    console.log(JSON.stringify({
        timestamp: new Date().toISOString(),
        service: "llm-proxy",
        event,
        ...meta
    }));
}

const PROVIDER_ENDPOINTS: Record<string, string> = {
    openai: "https://api.openai.com/v1/chat/completions",
    anthropic: "https://api.anthropic.com/v1/messages",
    groq: "https://api.groq.com/openai/v1/chat/completions",
    together: "https://api.together.xyz/v1/chat/completions",
};

const MODEL_PROVIDER: Record<string, string> = {
    // OpenAI
    "gpt-4o": "openai", "gpt-4o-mini": "openai", "gpt-4-turbo": "openai",
    "gpt-3.5-turbo": "openai", "gpt-4": "openai",
    // Anthropic
    "claude-opus-4-20250514": "anthropic", "claude-sonnet-4-20250514": "anthropic",
    "claude-3-5-haiku-20241022": "anthropic", "claude-3-5-sonnet-20241022": "anthropic",
    "claude-3-opus-20240229": "anthropic", "claude-3-sonnet-20240229": "anthropic",
    // Groq
    "llama-3.3-70b-versatile": "groq", "mixtral-8x7b-32768": "groq", "gemma2-9b-it": "groq",
    "llama-3.1-70b-versatile": "groq",
    // Together
    "meta-llama/Llama-3.3-70B-Instruct-Turbo": "together",
    "mistralai/Mixtral-8x7B-Instruct-v0.1": "together",
};

function getKey(provider: string): string | undefined {
    switch (provider) {
        case "openai": return Deno.env.get("OPENAI_API_KEY");
        case "anthropic": return Deno.env.get("ANTHROPIC_API_KEY");
        case "groq": return Deno.env.get("GROQ_API_KEY");
        case "together": return Deno.env.get("TOGETHER_API_KEY");
        default: return undefined;
    }
}

Deno.serve(async (req) => {
    if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

    const t0 = performance.now();
    let correlationId = req.headers.get("x-correlation-id") || crypto.randomUUID();

    try {
        const body = await req.json();
        const { model = "gpt-4o-mini", messages, temperature = 0.7, max_tokens = 1200, system } = body;

        if (body.correlation_id) correlationId = body.correlation_id;

        // Determine provider — infer from model name if not specified
        const provider = body.provider ?? MODEL_PROVIDER[model] ?? "openai";

        logTrace("request_started", { correlation_id: correlationId, model, provider });

        const apiKey = getKey(provider);

        if (!apiKey) {
            return new Response(JSON.stringify({ error: `${provider.toUpperCase()}_API_KEY not configured as Supabase secret` }), {
                status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        const endpoint = PROVIDER_ENDPOINTS[provider];
        let reqBody: Record<string, unknown>;
        let reqHeaders: Record<string, string>;

        if (provider === "anthropic") {
            // Automatically upgrade legacy Claude 3 models to the available Claude 4 (2026) series
            let finalModel = model;
            if (model.includes("haiku")) finalModel = "claude-haiku-4-5-20251001";
            else if (model.includes("sonnet")) finalModel = "claude-sonnet-4-6";
            else if (model.includes("opus")) finalModel = "claude-opus-4-6";
            else finalModel = "claude-sonnet-4-6"; // fallback to capable model

            // Anthropic messages API format
            reqHeaders = {
                "Content-Type": "application/json",
                "x-api-key": apiKey,
                "anthropic-version": "2023-06-01",
            };
            reqBody = {
                model: finalModel,
                max_tokens,
                system: system || "You are an expert real estate development analyst. Be concise, precise, and actionable.",
                messages,
            };
        } else {
            // OpenAI-compatible format (OpenAI, Groq, Together)
            reqHeaders = {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`,
            };
            const sysMsg = system
                ? [{ role: "system", content: system }]
                : [{ role: "system", content: "You are an expert real estate development analyst. Be concise, precise, and actionable." }];
            reqBody = { model, max_tokens, temperature, messages: [...sysMsg, ...messages] };
        }

        const response = await fetch(endpoint, {
            method: "POST",
            headers: reqHeaders,
            body: JSON.stringify(reqBody),
        });

        const data = await response.json();

        if (!response.ok) {
            return new Response(JSON.stringify({ error: data.error?.message ?? `${provider} error`, raw: data }), {
                status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        // Normalize response to { content, model, usage }
        let content: string;
        if (provider === "anthropic") {
            content = (data.content as { type: string; text?: string }[])?.find(b => b.type === "text")?.text ?? "";
        } else {
            content = data.choices?.[0]?.message?.content ?? "";
        }

        const duration = performance.now() - t0;
        logTrace("request_completed", { correlation_id: correlationId, duration_ms: Math.round(duration), usage: data.usage });

        return new Response(JSON.stringify({ content, model, provider, usage: data.usage }), {
            headers: {
                ...corsHeaders,
                "Content-Type": "application/json",
                // Stale-While-Revalidate Edge Caching strategy for LLM responses (cache exactly identical systemic requests for 1 hour to save inference costs)
                "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400"
            },
        });
    } catch (err: any) {
        logTrace("request_failed", { correlation_id: correlationId, error: err.message });
        return new Response(JSON.stringify({ error: err.message }), {
            status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }
});
