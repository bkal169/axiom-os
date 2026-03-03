"""
Axiom OS V2 — XGBoost Training Data Pipeline
Fetches deal data from Supabase, enriches it with macro signals, and exports
both a local CSV and uploads to Supabase Storage for cloud-accessible model training.

Usage:
    python xgboost_prep.py

Requires:
    SUPABASE_DB_PASSWORD — direct Supabase Postgres password
    SUPABASE_URL         — project URL (for Storage API upload)
    SUPABASE_SERVICE_KEY — service role key (for Storage API upload)
"""

import os
import csv
import io
import psycopg2
from psycopg2.extras import RealDictCursor
from dotenv import load_dotenv
from datetime import datetime
import urllib.request
import urllib.error
import json

# Load environment variables
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

DB_PASS = os.getenv("SUPABASE_DB_PASSWORD")
SUPABASE_URL = os.getenv(
    "SUPABASE_URL", "https://ubdhpacoqmlxudcvhyuu.supabase.co")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY")

if not DB_PASS:
    print("Error: SUPABASE_DB_PASSWORD not found in environment.")
    exit(1)

# Supabase direct connection string
DB_HOST = "aws-0-us-east-1.pooler.supabase.com"
DB_PORT = "6543"
DB_USER = "postgres.ubdhpacoqmlxudcvhyuu"
DB_NAME = "postgres"

# ─── Queries ───────────────────────────────────────────────────

TRAINING_QUERY = """
SELECT
    p.id AS project_id,
    p.asset_type,
    p.status,
    p.city,
    p.state,
    p.created_at::date AS deal_sourced_date,
    -- Scenario underwriting assumptions (Base Case)
    s.config->>'ltc' AS ltc_pct,
    s.config->>'interest_rate' AS interest_rate_pct,
    s.config->>'exit_cap_rate' AS exit_cap_pct,
    s.config->>'hold_period_months' AS hold_period,
    s.config->>'acquisition_price' AS acquisition_price,
    s.config->>'projected_profit' AS projected_profit,
    -- Risk score from ML models (if scored)
    da.output->'risk_score' AS risk_score,
    da.output->'deal_score' AS deal_score,
    -- Market signals at time of deal sourcing (latest available)
    (
        SELECT sig.strength
        FROM signals sig
        WHERE sig.domain = 'macro' AND sig.created_at < p.created_at
        ORDER BY sig.created_at DESC
        LIMIT 1
    ) AS macro_signal_strength,
    -- Binary target variable: 1 = went to committee or beyond, 0 = died in screening
    CASE
        WHEN p.status IN ('active', 'won', 'closed', 'asset_mgmt', 'committee') THEN 1
        ELSE 0
    END AS is_viable_deal
FROM projects p
LEFT JOIN scenarios s ON p.id::text = s.project_id AND s.name = 'Base Case'
LEFT JOIN LATERAL (
    SELECT output FROM decision_artifacts
    WHERE project_id::text = p.id::text
    ORDER BY created_at DESC LIMIT 1
) da ON TRUE
WHERE p.created_at > NOW() - INTERVAL '24 months'
ORDER BY p.created_at DESC;
"""


def upload_to_supabase_storage(csv_content: str, filename: str) -> bool:
    """Upload CSV to Supabase Storage bucket 'ml-training-data'."""
    if not SUPABASE_SERVICE_KEY:
        print("Warning: SUPABASE_SERVICE_KEY not set. Skipping cloud upload.")
        return False

    storage_url = f"{SUPABASE_URL}/storage/v1/object/ml-training-data/{filename}"
    data = csv_content.encode("utf-8")
    req = urllib.request.Request(
        storage_url,
        data=data,
        method="POST",
        headers={
            "Authorization": f"Bearer {SUPABASE_SERVICE_KEY}",
            "Content-Type": "text/csv",
            "x-upsert": "true",  # overwrite if exists
        }
    )

    try:
        with urllib.request.urlopen(req) as resp:
            body = resp.read().decode()
            print(f"Uploaded to Supabase Storage: {storage_url}")
            print(f"Response: {body}")
            return True
    except urllib.error.HTTPError as e:
        print(f"Storage upload failed: {e.code} — {e.read().decode()}")
        return False


def fetch_training_data():
    """Fetches enriched deal data and exports a structured XGBoost training CSV."""
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    output_filename = f"axiom_training_{timestamp}.csv"
    output_path = os.path.join(os.path.dirname(__file__), output_filename)

    try:
        conn = psycopg2.connect(
            host=DB_HOST,
            database=DB_NAME,
            user=DB_USER,
            password=DB_PASS,
            port=DB_PORT
        )
        cur = conn.cursor(cursor_factory=RealDictCursor)
        print("Connected to Supabase. Executing XGBoost feature extraction...")

        cur.execute(TRAINING_QUERY)
        records = cur.fetchall()

        if not records:
            print("No training data found. Skipping export.")
            return

        print(f"Fetched {len(records)} deal records from Supabase.")

        # Build CSV in memory
        csv_buffer = io.StringIO()
        writer = csv.DictWriter(csv_buffer, fieldnames=records[0].keys())
        writer.writeheader()
        writer.writerows(records)
        csv_content = csv_buffer.getvalue()

        # Write to local file
        with open(output_path, 'w', newline='') as f:
            f.write(csv_content)

        print(f"Local export: {output_path}")
        print(f"Columns: {list(records[0].keys())}")
        print(f"Records: {len(records)}")
        print(
            f"Viable deals (label=1): {sum(1 for r in records if r.get('is_viable_deal') == 1)}")
        print(
            f"Non-viable deals (label=0): {sum(1 for r in records if r.get('is_viable_deal') == 0)}")

        # Upload to Supabase Storage
        uploaded = upload_to_supabase_storage(csv_content, output_filename)
        if uploaded:
            print(
                f"Cloud backup: supabase://ml-training-data/{output_filename}")
        else:
            print("Note: Set SUPABASE_SERVICE_KEY to enable automatic cloud backup.")

        print("\nData is now structured for XGBoost DMatrix ingestion.")
        print("Next step: Run train_xgboost.py to begin model training.")

    except psycopg2.Error as e:
        print(f"Database error: {e}")
    finally:
        if 'conn' in locals() and conn is not None:
            cur.close()
            conn.close()


if __name__ == "__main__":
    fetch_training_data()
