
# Axiom CRM Deployment Guide

This guide details how to deploy the Axiom CRM "Lean Launch" MVP.

## 1. Database (Supabase)
The database is already managed by Supabase.
- **Production URL**: Ensure `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set in your deployment environments.
- **Migrations**: Run `supabase/schema.sql` in the SQL Editor of your production Supabase project.
- **Seed Data**: Run `supabase/seed_intel.sql` to populate initial market data.

## 2. Frontend (Vercel)
The React frontend is optimized for Vercel.

### Steps:
1.  Push `axiom/frontend` to a GitHub repository.
2.  Import the project into Vercel.
3.  Set the **Framework Preset** to `Vite`.
4.  **Environment Variables**:
    -   `VITE_SUPABASE_URL`: Your Supabase Project URL.
    -   `VITE_SUPABASE_ANON_KEY`: Your Supabase Anon Key.
5.  **Deploy**.

### Configuration:
A `vercel.json` has been added to handle client-side routing (SPAs):
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

## 3. Backend (Render / Railway / Fly.io)
The Python Engine requires a containerized environment.

### Steps:
1.  Push `axiom/backend` to a GitHub repository.
2.  Connect to a PaaS provider (e.g., Render, Railway).
3.  **Docker Deployment**: The `Dockerfile` is present in the root of `backend/`.
4.  **Environment Variables**:
    -   `STRIPE_WEBHOOK_SECRET`: Your Stripe Webhook Secret (for billing events).
    -   `OPENAI_API_KEY` (if using Copilot features).
5.  **Deploy**.
6.  **Public URL**: Note the public URL (e.g., `https://axiom-engine.onrender.com`).

### 4. Integration
4.  **Integration**
    -   Once both are deployed, update your Frontend environment variables to point to the live Backend URL.
    -   For local development, the frontend now runs on `http://localhost:8008`.
