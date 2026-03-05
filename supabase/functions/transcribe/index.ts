import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: { 'Access-Control-Allow-Origin': '*' } })
    }

    try {
        const formData = await req.formData()
        const audioFile = formData.get('file')

        if (!OPENAI_API_KEY) throw new Error("Missing OpenAI API Key")
        if (!audioFile) throw new Error("Missing audio file")

        // Forward to OpenAI Whisper API
        const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${OPENAI_API_KEY}`,
            },
            body: formData, // Send formData directly (includes file + model='whisper-1')
        })

        const data = await response.json()

        if (data.error) throw new Error(data.error.message)

        return new Response(
            JSON.stringify({ success: true, text: data.text }),
            { headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } },
        )
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 400,
            headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
        })
    }
})
