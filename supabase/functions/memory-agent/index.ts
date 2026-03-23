import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { buildAgentContext } from "../_shared/memory/contextBuilder.ts";
import { writeEpisodic, writeMemoryFeedback } from "../_shared/memory/MEMORY_WRITER.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { action, ...payload } = body;

    if (action === 'retrieve') {
      const { contextString, results } = await buildAgentContext(payload as any);
      return new Response(JSON.stringify({ contextString, results }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    
    if (action === 'writeEpisodic') {
      const id = await writeEpisodic(payload as any);
      return new Response(JSON.stringify({ id }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    if (action === 'writeFeedback') {
      await writeMemoryFeedback(payload as any);
      return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    return new Response(JSON.stringify({ error: 'invalid action' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
