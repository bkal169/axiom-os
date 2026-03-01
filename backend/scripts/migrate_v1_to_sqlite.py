import sys
from pathlib import Path
import json
from datetime import datetime, date

# Add backend to path (scripts/.. -> backend/)
BACKEND_DIR = Path(__file__).resolve().parents[1]
sys.path.append(str(BACKEND_DIR))

from sqlmodel import Session, select
from axiom_engine.database import engine, create_db_and_tables
from axiom_engine.models import Org, User, Parcel, Run, Usage

def migrate():
    print("--- Starting Migration v1 -> SQLite ---")
    create_db_and_tables()
    
    with Session(engine) as session:
        # 1. Migrate Orgs & Users
        db_path = BACKEND_DIR / "db.json"
        if db_path.exists():
            data = json.loads(db_path.read_text(encoding="utf-8"))
            
            # Orgs
            orgs_map = data.get("orgs", {})
            print(f"Migrating {len(orgs_map)} Orgs...")
            for oid, o in orgs_map.items():
                # Check if exists
                existing = session.get(Org, oid)
                if not existing:
                    org = Org(
                        id=oid,
                        name=o.get("name"),
                        plan=o.get("plan", "FREE"),
                        stripe_customer_id=o.get("stripe_customer_id"),
                        stripe_subscription_id=o.get("stripe_subscription_id"),
                        subscription_status=o.get("subscription_status")
                    )
                    session.add(org)
            
            # Users
            users_map = data.get("users", {})
            print(f"Migrating {len(users_map)} Users...")
            for uid, u in users_map.items():
                existing_u = session.get(User, uid)
                if not existing_u:
                    user = User(
                        id=uid,
                        email=u.get("email"),
                        password_hash=u.get("pw_hash"),
                        role=u.get("role", "SAAS"),
                        org_id=u.get("org_id")
                    )
                    session.add(user)
                    
            # Usage
            usage_map = data.get("usage", {})
            print(f"Migrating Usage stats...")
            for oid, dates in usage_map.items():
                for date_str, stats in dates.items():
                    # check unique layout
                    # simplistic check: try to find by org/date (requires date obj)
                    from datetime import date
                    d = date.fromisoformat(date_str)
                    
                    # Ideally use select statement
                    # For migration simplicity, just insert and let constraints handle or check manually
                    # checking manually via select
                    stmt = select(Usage).where(Usage.org_id == oid, Usage.date == d)
                    existing_usage = session.exec(stmt).first()
                    
                    if not existing_usage:
                        usage = Usage(
                            org_id=oid,
                            date=d,
                            run_count=stats.get("runs", 0)
                        )
                        session.add(usage)

        # 2. Migrate Parcels
        parcels_path = BACKEND_DIR / "parcels.jsonl"
        if parcels_path.exists():
            print("Migrating Parcels (this may take a moment)...")
            count = 0
            with open(parcels_path, "r", encoding="utf-8") as f:
                for line in f:
                    line = line.strip()
                    if not line: continue
                    try:
                        p_data = json.loads(line)
                    except json.JSONDecodeError:
                        continue
                        
                    pid = p_data.get("parcel_id")
                    
                    if not pid or session.get(Parcel, pid):
                        continue
                        
                    # Extract canonical fields
                    try:
                        parcel = Parcel(
                            parcel_id=pid,
                            site_address=p_data.get("site_address"),
                            city=p_data.get("city"),
                            state=p_data.get("state"),
                            zip=p_data.get("zip"),
                            lot_sqft=float(p_data.get("lot_sqft") or 0),
                            bldg_sqft=float(p_data.get("bldg_sqft") or 0),
                            year_built=int(float(p_data.get("year_built") or 0)),
                            zoning=p_data.get("zoning"),
                            land_use=p_data.get("land_use"),
                            assessed_total=float(p_data.get("assessed_total") or 0),
                            last_sale_price=float(p_data.get("last_sale_price") or 0),
                            last_sale_date=str(p_data.get("last_sale_date") or ""),
                            owner_name=p_data.get("owner_name"),
                            county=p_data.get("county"),
                            raw_data=p_data 
                        )
                        session.add(parcel)
                        count += 1
                    except Exception as e:
                        print(f"Skipping bad parcel {pid}: {e}")
            print(f"Migrated {count} Parcels.")

        # 3. Migrate Deal Runs
        runs_path = BACKEND_DIR / "deal_runs.jsonl"
        if runs_path.exists():
            print("Migrating Deal Runs...")
            count = 0
            with open(runs_path, "r", encoding="utf-8") as f:
                for line in f:
                    line = line.strip()
                    if not line: continue
                    r_data = json.loads(line)
                    
                    # We don't have a PK in file (index was dynamic).
                    # We'll just append them.
                    
                    # Extract fields
                    ts_str = r_data.get("ts")
                    try:
                        ts = datetime.fromisoformat(ts_str) if ts_str else datetime.utcnow()
                    except:
                        ts = datetime.utcnow()

                    if not r_data.get("org_id"):
                        print(f"Skipping run missing org_id (ts={ts})")
                        continue

                    run = Run(
                        org_id=r_data.get("org_id"),
                        user_id=r_data.get("user_id"), # Optional
                        property_id=r_data.get("property_id"),
                        ts=ts,
                        base_snapshot=r_data.get("base", {}),
                        summary=r_data.get("summary"),
                        full_package=r_data # Store full blob
                    )
                    session.add(run)
                    count += 1
            print(f"Migrated {count} Runs.")

        session.commit()
    print("--- Migration Complete ---")

if __name__ == "__main__":
    migrate()
