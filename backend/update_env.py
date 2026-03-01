import os

# This script creates the .env file for the backend.
# Copy .env.example and fill in your own values — never commit real keys.

content = """# Axiom Backend Environment Variables
# Copy this to .env and fill in your real values. Never commit .env to git.

# AI Integration (Required for Axiom Brain)
OPENAI_API_KEY=your-openai-api-key-here

# Stripe Integration (Required for Webhooks)
STRIPE_WEBHOOK_SECRET=whsec_your-stripe-webhook-secret-here

# FRED API Key (Market Data)
FRED_API_KEY=your-fred-api-key-here

# Supabase Admin (For Webhooks)
SUPABASE_URL=your-supabase-url-here
SUPABASE_SERVICE_KEY=your-supabase-service-key-here
"""

file_path = os.path.join(os.path.dirname(__file__), ".env")

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)
    print("Created .env template — fill in your real values before running the server.")
