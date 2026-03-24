from typing import Dict

PLANS = {
    "FREE": {
        "max_runs_per_day": 5,
        "max_deals": 3,
        "can_compare": False,
        "can_export": False,
        "can_agent_pipeline": False,
        "can_neural": False,
        "can_tax_intel": False,
        "can_field_mode": False,
        "can_api_access": False,
        "can_byok": False,
        "can_55plus": False,
    },
    "PRO": {
        "max_runs_per_day": 200,
        "max_deals": -1,          # unlimited
        "can_compare": True,
        "can_export": True,
        "can_agent_pipeline": False,
        "can_neural": False,
        "can_tax_intel": False,
        "can_field_mode": False,
        "can_api_access": False,
        "can_byok": False,
        "can_55plus": False,
    },
    "PRO_PLUS": {
        "max_runs_per_day": 1000,
        "max_deals": -1,
        "can_compare": True,
        "can_export": True,
        "can_agent_pipeline": True,
        "can_neural": True,
        "can_tax_intel": True,
        "can_field_mode": False,
        "can_api_access": False,
        "can_byok": False,
        "can_55plus": False,
    },
    "BOUTIQUE": {
        "max_runs_per_day": 5000,
        "max_deals": -1,
        "can_compare": True,
        "can_export": True,
        "can_agent_pipeline": True,
        "can_neural": True,
        "can_tax_intel": True,
        "can_field_mode": True,
        "can_api_access": False,
        "can_byok": False,
        "can_55plus": True,
    },
    "ENTERPRISE": {
        "max_runs_per_day": 50000,
        "max_deals": -1,
        "can_compare": True,
        "can_export": True,
        "can_agent_pipeline": True,
        "can_neural": True,
        "can_tax_intel": True,
        "can_field_mode": True,
        "can_api_access": True,
        "can_byok": True,
        "can_55plus": True,
    },
    "ENTERPRISE_PLUS": {
        "max_runs_per_day": 999999,
        "max_deals": -1,
        "can_compare": True,
        "can_export": True,
        "can_agent_pipeline": True,
        "can_neural": True,
        "can_tax_intel": True,
        "can_field_mode": True,
        "can_api_access": True,
        "can_byok": True,
        "can_55plus": True,
    },
    # Legacy internal tier
    "CORE_INTERNAL": {
        "max_runs_per_day": 999999,
        "max_deals": -1,
        "can_compare": True,
        "can_export": True,
        "can_agent_pipeline": True,
        "can_neural": True,
        "can_tax_intel": True,
        "can_field_mode": True,
        "can_api_access": True,
        "can_byok": True,
        "can_55plus": True,
    },
}

def get_plan_config(plan: str) -> Dict:
    return PLANS.get(plan.upper(), PLANS["FREE"])

def can(plan: str, feature: str) -> bool:
    return get_plan_config(plan).get(feature, False)

def get_limit(plan: str, limit_name: str) -> int:
    return get_plan_config(plan).get(limit_name, 0)
