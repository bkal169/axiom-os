import json
import os
from pathlib import Path

# Load zoning codes
DATA_PATH = Path(__file__).parent.parent / "data" / "zoning_codes.json"

def analyze_zoning(zoning_code: str, site_sqft: float) -> str:
    """
    Analyzes buildable capacity based on zoning code and site size.
    Returns a formatted description.
    """
    if not os.path.exists(DATA_PATH):
        return f"Zoning data unavailable (Missing {DATA_PATH})."

    try:
        with open(DATA_PATH, "r") as f:
            data = json.load(f)
        
        code_data = data.get(zoning_code.upper())
        if not code_data:
            return f"Zoning code '{zoning_code}' not found in database."

        far = code_data.get("far", 0)
        units_per_acre = code_data.get("units_per_acre", 0)
        max_height = code_data.get("max_height", 0)
        
        acres = site_sqft / 43560
        max_sqft = site_sqft * far
        max_units = int(acres * units_per_acre)

        out = f"## Zoning Analysis: {zoning_code} ({code_data['name']})\n"
        out += f"- Site Size: {acres:.2f} Acres ({int(site_sqft):,} Sqft)\n"
        out += f"- Floor Area Ratio (FAR): {far}\n"
        out += f"- Max Buildable Area: {int(max_sqft):,} Sqft\n"
        if units_per_acre > 0:
            out += f"- Max Residential Density: {units_per_acre} units/acre ({max_units} units total)\n"
        out += f"- Max Height: {max_height} Stories\n"
        out += f"- Description: {code_data['description']}\n"
        
        return out

    except Exception as e:
        return f"Error analyzing zoning: {str(e)}"
