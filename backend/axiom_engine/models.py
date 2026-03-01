from typing import Optional
from datetime import datetime, date
from sqlmodel import Field, SQLModel, JSON
from sqlalchemy import Column, UniqueConstraint

# 1. Org
class Org(SQLModel, table=True):
    id: str = Field(primary_key=True)
    name: str
    plan: str = "FREE"  # FREE, PRO, CORE_INTERNAL
    stripe_customer_id: Optional[str] = None
    stripe_subscription_id: Optional[str] = None
    subscription_status: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

# 2. User
class User(SQLModel, table=True):
    id: str = Field(primary_key=True)
    email: str = Field(index=True, unique=True)
    password_hash: str
    role: str = "SAAS"  # SAAS, CORE
    org_id: str = Field(foreign_key="org.id", index=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)

# 3. Parcel (Canonical)
class Parcel(SQLModel, table=True):
    parcel_id: str = Field(primary_key=True)
    site_address: Optional[str] = None
    city: Optional[str] = Field(default=None, index=True)
    state: Optional[str] = Field(default=None, index=True)
    zip: Optional[str] = None
    subdivision: Optional[str] = None
    lot_sqft: float = 0.0
    bldg_sqft: float = 0.0
    year_built: int = 0
    zoning: Optional[str] = None
    land_use: Optional[str] = None
    assessed_total: float = 0.0
    last_sale_price: float = 0.0
    last_sale_date: Optional[str] = None
    owner_name: Optional[str] = None
    county: Optional[str] = None
    
    # Store extra non-canonical fields (like raw lat/lon if needed, or specific county codes)
    raw_data: Optional[dict] = Field(default={}, sa_column=Column(JSON))

# 4. Run (Deal History)
class Run(SQLModel, table=True):
    index: Optional[int] = Field(default=None, primary_key=True) # Auto-increment
    org_id: str = Field(foreign_key="org.id", index=True)
    user_id: Optional[str] = Field(foreign_key="user.id", default=None)
    property_id: str = Field(index=True)
    ts: datetime = Field(default_factory=datetime.utcnow)
    
    base_snapshot: dict = Field(default={}, sa_column=Column(JSON))
    summary: Optional[str] = None
    full_package: dict = Field(default={}, sa_column=Column(JSON))

# 5. Usage (Aggregated Daily)
class Usage(SQLModel, table=True):
    __table_args__ = (UniqueConstraint("org_id", "date", name="unique_org_date_usage"),)
    
    id: Optional[int] = Field(default=None, primary_key=True)
    org_id: str = Field(foreign_key="org.id", index=True)
    date: date
    run_count: int = 0
