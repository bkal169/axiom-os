import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.1";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        const authHeader = req.headers.get("Authorization");
        if (!authHeader) throw new Error("Missing Authorization header");

        const supabaseUrl = Deno.env.get("SUPABASE_URL");
        const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
        if (!supabaseUrl || !supabaseAnonKey) throw new Error("Missing Supabase env vars");

        const supabase = createClient(supabaseUrl, supabaseAnonKey, {
            global: { headers: { Authorization: authHeader } },
        });

        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) throw new Error("Unauthorized user");

        const { messages, modelId, system } = await req.json();

        const provider = getProvider(modelId);
        let apiKey = "";

        switch (provider) {
            case "anthropic":
                apiKey = Deno.env.get("ANTHROPIC_API_KEY") || "";
                break;
            case "openai":
                apiKey = Deno.env.get("OPENAI_API_KEY") || "";
                break;
            case "groq":
                apiKey = Deno.env.get("GROQ_API_KEY") || "";
                break;
            case "together":
                apiKey = Deno.env.get("TOGETHER_API_KEY") || "";
                break;
            default:
                throw new Error("Unsupported provider");
        }

        if (!apiKey) throw new Error(`API key not configured for provider: ${provider}`);

        let result;
        if (provider === "anthropic") {
            result = await callAnthropic(apiKey, modelId, system, messages);
        } else {
            result = await callOpenAILike(provider, apiKey, modelId, system, messages);
        }

        return new Response(JSON.stringify(result), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
        });
    } catch (error: any) {
        console.error("Error processing request:", error);
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 500,
        });
    }
});

function getProvider(modelId: string) {
    if (modelId.includes("claude")) return "anthropic";
    if (modelId.includes("gpt")) return "openai";
    if (["llama-3.3-70b-versatile", "mixtral-8x7b-32768", "gemma2-9b-it"].includes(modelId)) return "groq";
    if (modelId.includes("meta-llama") || modelId.includes("mistralai")) return "together";
    return "anthropic"; // default fallback
}

const ENDPOINTS = {
    openai: "https://api.openai.com/v1/chat/completions",
    groq: "https://api.groq.com/openai/v1/chat/completions",
    together: "https://api.together.xyz/v1/chat/completions",
};

async function callAnthropic(apiKey: string, modelId: string, system: string, messages: any[]) {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "x-api-key": apiKey,
            "anthropic-version": "2023-06-01"
        },
        body: JSON.stringify({
            model: modelId,
            max_tokens: 1200,
            system: system || "You are an expert real estate development analyst and feasibility consultant.",
            messages
        }),
    });

    const d = await r.json();
    if (!r.ok) throw new Error(d.error?.message || "Anthropic API Error");

    return { content: d.content?.map((b: any) => b.text || "").join("\n") || "" };
}

async function callOpenAILike(provider: string, apiKey: string, modelId: string, system: string, messages: any[]) {
    const sysMsg = { role: "system", content: system || "You are an expert real estate development analyst and feasibility consultant." };

    const endpoint = ENDPOINTS[provider as keyof typeof ENDPOINTS];
    if (!endpoint) throw new Error("Invalid generic provider endpoint");

    const r = await fetch(endpoint, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: modelId,
            max_tokens: 1200,
            messages: [sysMsg, ...messages]
        }),
    });

    const d = await r.json();
    if (!r.ok) throw new Error(d.error?.message || `${provider} API Error`);

    return { content: d.choices?.[0]?.message?.content || "" };
}
