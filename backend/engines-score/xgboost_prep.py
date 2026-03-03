import os
import csv
import psycopg2
from psycopg2.extras import RealDictCursor
from dotenv import load_dotenv

# Load environment variables
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

DB_PASS = os.getenv("SUPABASE_DB_PASSWORD")
if not DB_PASS:
    print("Error: SUPABASE_DB_PASSWORD not found in environment.")
    exit(1)

# Supabase direct connection string
DB_HOST = "aws-0-us-east-1.pooler.supabase.com"
DB_PORT = "6543"
DB_USER = "postgres.ubdhpacoqmlxudcvhyuu"
DB_NAME = "postgres"


def fetch_training_data():
    """Fetches combined project, scenario, and signal data to build the XGBoost training CSV."""

    query = """
    SELECT 
        p.id as project_id,
        p.asset_type,
        p.status,
        -- Extract base scenario config metrics (if available)
        s.config->>'ltc' as ltc_pct,
        s.config->>'interest_rate' as interest_rate_pct,
        s.config->>'exit_cap_rate' as exit_cap_pct,
        s.config->>'hold_period_months' as hold_period,
        -- Generate binary target variable (1 = Won/Active, 0 = Lost/Passed)
        CASE 
            WHEN p.status IN ('active', 'won', 'closed') THEN 1 
            ELSE 0 
        END as is_viable_deal
    FROM projects p
    LEFT JOIN scenarios s ON p.id::text = s.project_id
    WHERE s.name = 'Base Case' OR s.name IS NULL
    """

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

        cur.execute(query)
        records = cur.fetchall()

        if not records:
            print("No training data found.")
            return

        # Export to CSV
        output_file = os.path.join(os.path.dirname(
            __file__), 'training_data_export.csv')

        with open(output_file, 'w', newline='') as f:
            if len(records) > 0:
                writer = csv.DictWriter(f, fieldnames=records[0].keys())
                writer.writeheader()
                writer.writerows(records)

        print(
            f"Successfully exported {len(records)} deal records to {output_file}")
        print("Data is now structured for XGBoost DMatrix ingestion.")

    except psycopg2.Error as e:
        print(f"Database error: {e}")
    finally:
        if 'conn' in locals() and conn is not None:
            cur.close()
            conn.close()


if __name__ == "__main__":
    fetch_training_data()
