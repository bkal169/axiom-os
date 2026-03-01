import os

# Original clean content
content = """# Axiom Backend Environment Variables

# AI Integration (Required for Axiom Brain)
OPENAI_API_KEY=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

# Stripe Integration (Required for Webhooks)
STRIPE_WEBHOOK_SECRET=whsec_your-stripe-webhook-secret-here

# FRED API Key (Market Data)
FRED_API_KEY=0b6bb3bf6081e0658b454287e6459191

# Supabase Admin (For Webhooks)
SUPABASE_URL=https://ubdhpacoqmlxudcvhyuu.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InViZGhwYWNvcW1seHVkY3ZoeXV1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTQ2MDM0MiwiZXhwIjoyMDg3MDM2MzQyfQ.V804xM_snbTsrrt8vPNjQ9bQNK-x-_kS5eXCGM-mFxo
"""

file_path = "c:\\Users\\bkala\\.gemini\\antigravity\\scratch\\axiom\\backend\\.env"

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)
    print("Updated .env with Supabase credentials")
