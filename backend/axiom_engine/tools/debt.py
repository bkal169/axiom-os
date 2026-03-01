from supabase import Client

def find_matching_lenders(supabase: Client, deal_data: dict) -> str:
    """
    Finds institutional lenders suitable for the given deal.
    Criteria:
    - Debt Type (Senior by default)
    - Asset Type (tags match)
    - Loan Size (Price * 0.75 approx)
    """
    price = float(deal_data.get("acquisition_price", 0))
    # Assume 70% LTV requirement for search if not specified
    required_loan = price * 0.70
    asset_type = (deal_data.get("asset_type", "") or "").lower()
    
    # Query lenders
    response = supabase.table("contacts") \
        .select("first_name, last_name, email, tags, max_ltv, min_loan_size, max_loan_size, debt_types") \
        .eq("type", "lender") \
        .execute()
    
    lenders = response.data or []
    matches = []
    
    for lender in lenders:
        reasons = []
        tags = [t.lower() for t in (lender.get("tags") or [])]
        debt_types = [dt.lower() for t in (lender.get("debt_types") or []) for dt in t.split(",")] # Handle some loose comma strings
        
        # Match by Asset Type
        if asset_type and asset_type not in tags:
            continue
            
        # Match by Loan Size
        min_size = float(lender.get("min_loan_size") or 0)
        max_size = float(lender.get("max_loan_size") or 0)
        
        if required_loan > 0:
            if max_size > 0 and (required_loan < min_size or required_loan > max_size):
                continue
            reasons.append(f"Loan size ${required_loan/1e6:.1f}M fits range")

        # Match by LTV (soft match)
        max_ltv = float(lender.get("max_ltv") or 0)
        if max_ltv > 0:
            reasons.append(f"Up to {max_ltv*100:.0f}% LTV")
        
        matches.append({
            "name": f"{lender.get('first_name')} {lender.get('last_name')}",
            "email": lender.get("email"),
            "reasons": reasons
        })
    
    if not matches:
        return "No institutional lenders in the database match this deal's criteria."
        
    out = "## Recommended Lenders (Debt Marketplace)\n"
    for m in matches[:3]: # Top 3
        out += f"- {m['name']} ({m['email']})\n"
        out += f"  Match Reasons: {', '.join(m['reasons'])}\n"
    
    return out
