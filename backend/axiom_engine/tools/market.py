from supabase import Client
import json

def get_location_intel(supabase: Client, city: str, state: str) -> str:
    """
    Fetches IntelRecords from the database for a specific location.
    Returns a formatted string for the LLM context.
    """
    if not supabase:
        return "No database connection available."

    try:
        # Search for records matching city AND state
        response = supabase.table("intel_records") \
            .select("record_type, title, metrics, notes, source") \
            .eq("state", state) \
            .ilike("city", f"%{city}%") \
            .execute()

        records = response.data
        
        if not records:
            return f"No specific intelligence found for {city}, {state}."

        # Format the records for the LLM
        context_str = f"## Market Intelligence for {city}, {state}:\n"
        for r in records:
            context_str += f"- [{r['record_type']}] {r['title']}\n"
            context_str += f"  Source: {r.get('source', 'Unknown')}\n"
            context_str += f"  Notes: {r.get('notes', '')}\n"
            if r.get('metrics'):
                context_str += f"  Metrics: {json.dumps(r['metrics'])}\n"
            context_str += "\n"
            
        return context_str

    except Exception as e:
        return f"Error fetching market intel: {str(e)}"
