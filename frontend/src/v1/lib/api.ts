import { supa } from "./supabase";

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

export async function callLLM(messages: any[], system: string = "", modelId: string = "claude-sonnet-4-20250514") {
    const m = MODELS.find(x => x.id === modelId) || MODELS[0];
    const defaultSys = "You are an expert real estate development analyst and feasibility consultant. Be concise, precise, and actionable.";

    if (!supa.configured() || !supa.token) {
        return "Error: You must be logged in to securely access the AI models.";
    }

    try {
        const data = await supa.callEdge("axiom-chat", {
            modelId: m.id,
            system: system || defaultSys,
            messages,
        });

        if (data.error) {
            return "API error: " + data.error;
        }

        return data.content || "No response received.";
    } catch (e: any) {
        return "Network error: " + e.message;
    }
}

export const callClaude = callLLM;
