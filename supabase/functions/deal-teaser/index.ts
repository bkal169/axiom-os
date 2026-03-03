import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

const TEASER_PROMPT = (deal: Record<string, any>) => `
You are an elite commercial real estate investment banker. You are writing a crisp, high-impact one-page Investment Teaser for a specific property.

The goal is to grab the attention of sophisticated LP investors and lenders in under 60 seconds.
Use precise financial language. Never use vague platitudes.
Format the response strictly as markdown with clear sections.

Deal Data:
- Property Name: ${deal.name}
- Address: ${deal.address}
- Asset Type: ${deal.type}
- Stage: ${deal.stage}
- Acquisition Price: $${Number(deal.value || 0).toLocaleString()}
- Estimated NOI / Profit: $${Number(deal.profit || 0).toLocaleString()}
- Units / Sq Ft: ${deal.lots || "N/A"}
- Notes: ${deal.notes || "None provided."}

Write the teaser now in the following structure:

# 📋 Investment Teaser: [Property Name]

## Executive Summary
[2-3 sharp sentences on the opportunity]

## The Asset
[Bullet list of key property details]

## Investment Highlights
[3-5 bulleted reasons a sophisticated investor would be interested]

## Financial Snapshot
| Metric | Value |
|---|---|
[Fill with real numbers from the deal data]

## Deal Structure
[1 paragraph on expected deal structure, timeline, and exit strategy]

## Next Steps
[Call to action for interested parties]

---
*Prepared by Axiom OS · ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} · Confidential*
`;

serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        const deal = await req.json();

        if (!deal.name) {
            throw new Error("Missing deal.name in request body.");
        }

        const anthropicKey = Deno.env.get("ANTHROPIC_API_KEY");
        if (!anthropicKey) {
            throw new Error("Missing ANTHROPIC_API_KEY. Set it in Supabase secrets.");
        }

        console.log(`Generating teaser for deal: ${deal.name}`);

        const response = await fetch("https://api.anthropic.com/v1/messages", {
            method: "POST",
            headers: {
                "x-api-key": anthropicKey,
                "anthropic-version": "2023-06-01",
                "content-type": "application/json",
            },
            body: JSON.stringify({
                model: "claude-3-5-sonnet-20241022",
                max_tokens: 1500,
                temperature: 0.3,
                messages: [
                    {
                        role: "user",
                        content: TEASER_PROMPT(deal),
                    }
                ]
            })
        });

        if (!response.ok) {
            const err = await response.text();
            throw new Error(`Anthropic error: ${response.status} — ${err}`);
        }

        const data = await response.json();
        const teaser = data.content[0].text;

        console.log(`Teaser generated successfully for: ${deal.name}`);

        return new Response(JSON.stringify({ teaser }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
    } catch (err: any) {
        console.error("deal-teaser error:", err.message);
        return new Response(JSON.stringify({ error: err.message }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
    }
});
