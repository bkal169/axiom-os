from supabase import Client

def find_matching_investors(supabase: Client, deal_data: dict) -> str:
    """
    Finds investors in the CRM who might be interested in this deal.
    Matching logic:
    - Must be type 'investor'
    - Matches asset_type tag if present in the contact's tags
    """
    if not supabase:
        return "CRM disconnected."

    try:
        asset_type = deal_data.get('asset_type', '').lower()
        
        # 1. Fetch all 'investor' type contacts
        response = supabase.table("contacts") \
            .select("first_name, last_name, email, tags, min_check_size, max_check_size, preferred_geographies") \
            .eq("type", "investor") \
            .execute()
        
        investors = response.data or []
        deal_capital = deal_data.get('capital_required', 0)
        deal_location = deal_data.get('location', '').lower()
        
        matches = []
        for inv in investors:
            reasons = ["CRM Investor"]
            tags = [t.lower() for t in (inv.get('tags') or [])]
            pref_geos = [g.lower() for g in (inv.get('preferred_geographies') or [])]
            min_check = float(inv.get('min_check_size') or 0)
            max_check = float(inv.get('max_check_size') or 0)
            
            # Match by asset type
            if asset_type and asset_type in tags:
                reasons.append(f"Specializes in {deal_data.get('asset_type')}")
            
            # Match by Geography
            if pref_geos:
                if any(geo in deal_location for geo in pref_geos):
                     reasons.append(f"Focuses on {deal_data.get('location')}")
                else:
                    continue # Skip if geography doesn't match and they have preferences

            # Match by Check Size
            if deal_capital > 0:
                if max_check > 0 and (deal_capital < min_check or deal_capital > max_check):
                    continue # Skip if deal size is outside their range
                reasons.append(f"Check size fits budget")

            matches.append({
                "name": f"{inv.get('first_name', '')} {inv.get('last_name', '')}".strip() or "Unknown",
                "email": inv.get('email', 'N/A'),
                "reasons": ", ".join(reasons)
            })
        
        if not matches:
             return "No matching investors found in CRM that fit this deal's size and location. (Tip: Expand geography or check-size ranges in CRM)."
             
        # Format for LLM
        out = "## Potential Investor Matches (from CRM)\n"
        for m in matches[:5]: # Top 5
            out += f"- **{m['name']}** ({m['email']})\n"
            out += f"  Match Reasons: {m['reasons']}\n"
            
        return out

    except Exception as e:
        return f"Error querying CRM: {str(e)}"
