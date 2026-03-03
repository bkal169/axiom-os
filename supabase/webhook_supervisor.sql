-- Supabase PostgreSQL Webhook for Supervisor Agent
-- Triggers the edge function automatically when a new project is created
CREATE TRIGGER trigger_supervisor_agent
AFTER
INSERT ON "public"."projects" FOR EACH ROW EXECUTE FUNCTION "supabase_functions"."http_request"(
        'http://supervisor-agent:54321/functions/v1/supervisor-agent',
        -- Loopback inside Supabase docker net
        'POST',
        '{"Content-type":"application/json"}',
        '{}',
        '1000'
    );