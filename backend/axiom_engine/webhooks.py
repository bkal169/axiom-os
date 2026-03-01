import os
from supabase import create_client, Client

url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_SERVICE_KEY")
supabase: Client = create_client(url, key)

def handle_subscription_change(event_type: str, data: dict):
    """
    Handles Stripe subscription events and updates user_profiles.
    """
    obj = data.get("object", {})
    customer_id = obj.get("customer")
    
    if not customer_id:
        return {"error": "no_customer_id"}

    # Map Stripe Checkouts/Portal metadata back to user_id if present
    # Usually we store stripe_customer_id on the user first.
    
    # 1. Find user by stripe_customer_id
    res = supabase.table("user_profiles").select("id").eq("stripe_customer_id", customer_id).execute()
    users = res.data
    
    if not users:
        print(f"Orphaned webhook: Customer {customer_id} not found in DB.")
        return {"ignored": True, "reason": "customer_not_found"}
        
    user_id = users[0]["id"]
    
    # 2. Determine Plan
    # Logic: map price_id or product_id to enum
    plan = "FREE"
    status = obj.get("status", "active")
    
    # Simple mapping (in reality, use Product IDs)
    # For MVP, we assume any active sub is PRO
    if status == "active":
        plan = "PRO"
    elif status in ["canceled", "unpaid"]:
        plan = "FREE"
        
    if event_type == "customer.subscription.deleted":
        plan = "FREE"
        status = "canceled"

    # 3. Update DB
    supabase.table("user_profiles").update({
        "subscription_tier": plan,
        "stripe_subscription_id": obj.get("id"),
        "stripe_current_period_end": None, # todo convert timestamp
        "updated_at": "now()"
    }).eq("id", user_id).execute()
    
    print(f"Updated User {user_id} -> {plan} ({status})")
    return {"ok": True, "user_id": user_id, "plan": plan}
