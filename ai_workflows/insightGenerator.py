import os
import json
import sys
from dotenv import load_dotenv
from google import genai
from google.genai import types

# Load environment variables
load_dotenv()

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from analytics.portfolioAnalytics import PortfolioAnalytics

class PortfolioInsightGenerator:
    def __init__(self):
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            raise ValueError("GEMINI_API_KEY is missing from environment variables.")
        self.client = genai.Client(api_key=api_key)

    def generate_insight_card(self, analytics_payload: dict) -> dict:
        """Sends structured analytics payload to Gemini and returns structured insight JSON."""
        
        system_instruction = """
        You are the lead AI Financial Intelligence Engine for a top brokerage platform.
        Your task is to convert raw portfolio metrics and news headlines into clear, actionable, and explainable insight cards for retail investors.

        STRICT GOVERNANCE RULES:
        1. NEVER provide direct trade execution commands (e.g., DO NOT say 'Buy 50 shares of TCS' or 'Sell Reliance').
        2. Ground every insight strictly in the provided numerical data and news context. Do NOT invent facts or prices.
        3. Explain 'WHAT happened', 'WHY it happened' (using news context), and 'WHAT RISK exists'.
        4. Maintain an objective, educational tone suitable for a retail investor.
        """

        prompt = f"""
        Analyze the following portfolio analytics payload and generate a structured JSON insight report:

        DATA PAYLOAD:
        {json.dumps(analytics_payload, indent=2)}

        REQUIRED OUTPUT JSON SCHEMA:
        Return ONLY a valid JSON object matching this schema:
        {{
            "executive_summary": "1-2 sentence plain language portfolio health summary",
            "key_performance_drivers": [
                {{
                    "symbol": "TICKER",
                    "impact": "POSITIVE/NEGATIVE",
                    "explanation": "Why this stock moved or contributed based on P&L and news"
                }}
            ],
            "risk_analysis": {{
                "risk_level": "HIGH/MODERATE/LOW",
                "primary_risks": ["List of identified risks like concentration or drawdown"],
                "mitigation_context": "Educational context on how concentration affects volatility"
            }},
            "confidence_score": 0.95
        }}
        """

        try:
            # Request JSON response format from Gemini 3.6 Flash
            response = self.client.models.generate_content(
                model="gemini-3.5-flash",
                contents=prompt,
                config=types.GenerateContentConfig(
                    system_instruction=system_instruction,
                    response_mime_type="application/json"
                )
            )
            
            return json.loads(response.text)

        except Exception as e:
            return {
                "error": "Failed to generate AI insight",
                "details": str(e)
            }

if __name__ == "__main__":
    # Test local end-to-end flow
    print("1. Fetching portfolio analytics from NeonDB & Market Data...")
    analytics_engine = PortfolioAnalytics("PORT-1001")
    payload = analytics_engine.generate_full_payload()

    print("2. Generating AI Insight Card via Gemini 3.5 Flash...")
    generator = PortfolioInsightGenerator()
    insight_card = generator.generate_insight_card(payload)

    print("\n--- GENERATED AI INSIGHT CARD ---")
    print(json.dumps(insight_card, indent=2))