import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: { 'Access-Control-Allow-Origin': '*' } })
    }

    try {
        const { action, thread, context } = await req.json()

        // Stub for communication agent (Email / SMS)
        // 1. Analyze sentiment/action items
        // 2. Draft reply
        // 3. Summarize thread

        if (!OPENAI_API_KEY) throw new Error("Missing OpenAI API Key")

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${OPENAI_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'gpt-4',
                messages: [
                    { role: 'system', content: 'You are Axiom, an autonomous real estate communication agent.' },
                    { role: 'user', content: `Perform action: ${action} on this context: ${JSON.stringify(thread)}` }
                ]
            }),
        })

        const data = await response.json()
        const result = data.choices[0].message.content

        return new Response(
            JSON.stringify({ success: true, result }),
            { headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } },
        )
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 400,
            headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
        })
    }
})
