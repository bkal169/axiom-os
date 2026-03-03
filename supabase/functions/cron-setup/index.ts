// cron-setup — establishes pg_cron schedule for FRED daily signal ingest
// POST /functions/v1/cron-setup  (call once; idempotent)
import postgres from "https://deno.land/x/postgresjs@v3.4.5/mod.js";

Deno.serve(async (_req) => {
    const dbUrl = Deno.env.get("SUPABASE_DB_URL");
    if (!dbUrl) {
        return new Response(JSON.stringify({ error: "SUPABASE_DB_URL not available" }), { status: 500 });
    }

    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const projectUrl = Deno.env.get("SUPABASE_URL") ?? "";

    const sql = postgres(dbUrl, { max: 1, idle_timeout: 20, connect_timeout: 10 });
    const results: { job: string; status: string; error?: string }[] = [];

    const jobs = [
        {
            name: "fred-daily-ingest",
            schedule: "0 6 * * *",  // 6am UTC daily
            body: JSON.stringify({ series: ["SOFR", "DGS10", "WPUIP2311001", "CES2000000003", "USSTHPI", "MORTGAGE30US", "CUSR0000SEHC"] }),
            url: `${projectUrl}/functions/v1/fred-ingestor`,
        },
    ];

    for (const job of jobs) {
        try {
            // Unschedule old version if exists (idempotent)
            await sql.unsafe(`SELECT cron.unschedule('${job.name}') WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = '${job.name}')`).catch(() => { });

            // Schedule via pg_net + pg_cron
            await sql.unsafe(`
        SELECT cron.schedule(
          '${job.name}',
          '${job.schedule}',
          $$
            SELECT net.http_post(
              url := '${job.url}',
              headers := jsonb_build_object(
                'Content-Type', 'application/json',
                'Authorization', 'Bearer ${serviceKey}',
                'apikey', '${serviceKey}'
              ),
              body := '${job.body}'::jsonb
            );
          $$
        )
      `);
            results.push({ job: job.name, status: "scheduled" });
        } catch (err: any) {
            results.push({ job: job.name, status: "error", error: err.message });
        }
    }

    await sql.end();

    return new Response(JSON.stringify({ results, note: "FRED ingest will run daily at 06:00 UTC" }), {
        headers: { "Content-Type": "application/json" },
    });
});
