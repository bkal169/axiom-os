def estimate_renovation_costs(asset_type: str, units: int = 1, sqft: int = 0) -> str:
    """
    Provides renovation cost estimates based on asset type and scale.
    Simple heuristic model for MVP.
    """
    asset_type = asset_type.lower()
    
    estimates = []
    
    if "multifamily" in asset_type or "apartment" in asset_type:
        estimates.append("## Renovation Estimates (Multifamily)")
        estimates.append(f"- Cosmetic Update (Flooring/Paint): ${5_000 * units:,.0f} - ${8_000 * units:,.0f}")
        estimates.append(f"- Standard Reno (Kitchen/Bath): ${12_000 * units:,.0f} - ${18_000 * units:,.0f}")
        estimates.append(f"- Heavy Value-Add (Gut): ${25_000 * units:,.0f} - ${40_000 * units:,.0f}")
        
    elif "office" in asset_type or "retail" in asset_type:
        estimates.append("## TI / Renovation Estimates (Commercial)")
        estimates.append(f"- Light TI (Paint/Carpet): ${20 * sqft:,.0f} - ${30 * sqft:,.0f}")
        estimates.append(f"- Standard TI: ${50 * sqft:,.0f} - ${80 * sqft:,.0f}")
        
    else:
        estimates.append("## General Renovation benchmarks")
        estimates.append("- Hard Costs: typically 60-70% of budget")
        estimates.append("- Soft Costs: typically 30-40% of budget")

    return "\n".join(estimates)
