import os
import json
from openai import OpenAI

# Initialize OpenAI Client
client = None
if os.getenv("OPENAI_API_KEY"):
    client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def call_llm(system_prompt: str, user_prompt: str, json_mode: bool = True) -> str:
    """
    Generic wrapper for OpenAI Chat Completion.
    """
    if not client and not os.getenv("MOCK_LLM"):
        return json.dumps({"error": "OpenAI API Key Missing"}) if json_mode else "OpenAI API Key Missing"

    is_mock = str(os.getenv("MOCK_LLM")).lower() == "true"
    if is_mock:
        print(f"DEBUG: [Brain] Mocking LLM Call. Prompt len: {len(user_prompt)}")
        if json_mode:
            return json.dumps({
                "analysis": "Internal MOCK Analysis.",
                "score": 85,
                "recommendation": "Hold",
                "risks": ["Mock Risk"],
                "opportunities": ["Mock Opportunity"]
            })
        else:
            # Echo specific context items if found to help with verification
            echo_items = []
            if "Potential Investor" in user_prompt:
                echo_items.append("[Found Investor Matches]")
            if "Market Intel" in user_prompt or "Market Intelligence" in user_prompt:
                echo_items.append("[Found Market Intel]")
            
            # Pass through existing finds from previous agent reports
            for find in ["[Found Investor Matches]", "[Found Market Intel]"]:
                if find in user_prompt and find not in echo_items:
                    echo_items.append(find)
            
            echo_str = " ".join(echo_items)
            return f"MOCK RESPONSE {echo_str} based on: {user_prompt[:200]}..."

    try:
        print(f"DEBUG: [Brain] Proceeding to REAL LLM CALL (Mock inactive).", file=sys.stderr)
        kwargs = {
            "model": "gpt-4o",
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            "temperature": 0.7
        }
        if json_mode:
            kwargs["response_format"] = {"type": "json_object"}

        response = client.chat.completions.create(**kwargs)
        return response.choices[0].message.content
        
    except Exception as e:
        print(f"OpenAI Error: {e}")
        return json.dumps({"error": str(e)}) if json_mode else f"Error: {str(e)}"

def analyze_deal(deal_data: dict, user_notes: str = "") -> dict:
    """
    Analyzes a real estate deal using OpenAI's LLM.
    """
    if not client:
        return {
            "analysis": "AI Engine not configured (OPENAI_API_KEY missing).",
            "score": 0,
            "recommendation": "Configure API Key",
            "risks": ["API Key Missing"],
            "opportunities": []
        }

    system_prompt = """
    You are an expert real estate investment analyst. 
    Analyze the provided deal data and user notes. 
    Return a JSON response with the following structure:
    {
        "analysis": "Executive summary of the deal (2-3 sentences)",
        "score": <integer 1-100 based on cash flow and equity>,
        "recommendation": "Buy", "Hold", "Sell", or "Pass",
        "risks": ["risk 1", "risk 2", "risk 3"],
        "opportunities": ["opp 1", "opp 2"]
    }
    Be conservative in your scoring. Prioritize Cash on Cash return and DSCR.
    """

    user_prompt = f"""
    Deal Data: {json.dumps(deal_data, indent=2)}
    User Notes: {user_notes}
    """

    content = call_llm(system_prompt, user_prompt, json_mode=True)
    try:
        data = json.loads(content)
        if "error" in data and "analysis" not in data:
            return {
                "analysis": f"AI Error: {data['error']}",
                "score": 0,
                "recommendation": "Error",
                "risks": [data['error']],
                "opportunities": []
            }
        return data
    except:
        return {"analysis": "Error parsing JSON response", "score": 0, "recommendation": "Error", "risks": [], "opportunities": []}
