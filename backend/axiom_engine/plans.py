from typing import Dict

PLANS = {
    "FREE": {
        "max_runs_per_day": 5,
        "can_compare": False,
        "can_export": False,
    },
    "PRO": {
        "max_runs_per_day": 1000,
        "can_compare": True,
        "can_export": True,
    },
    "CORE_INTERNAL": {
        "max_runs_per_day": 9999,
        "can_compare": True,
        "can_export": True,
        "can_55plus": True,
    }
}

def get_plan_config(plan: str) -> Dict:
    return PLANS.get(plan.upper(), PLANS["FREE"])
