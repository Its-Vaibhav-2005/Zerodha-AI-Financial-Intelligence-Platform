import os
import json
import psycopg2
from psycopg2.extras import RealDictCursor

def lookup_portfolio(portfolio_id: str) -> dict:
    """
    MCP Tool: Fetches normalized holdings, risk profile, and investment snapshot for a given portfolio ID.
    Supports NeonDB PostgreSQL with local JSON fallback.
    """
    try:
        db_url = os.getenv("NEON_DATABASE_URL")
        if db_url and db_url.startswith("postgres"):
            conn = psycopg2.connect(db_url)
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute("SELECT * FROM portfolios WHERE portfolio_id = %s", (portfolio_id,))
                row = cur.fetchone()
            conn.close()
            if row:
                return {
                    "status": "success",
                    "source": "NeonDB PostgreSQL",
                    "portfolio_id": row["portfolio_id"],
                    "investor_name": row.get("investor_name", "Valued Investor"),
                    "risk_profile": row.get("risk_profile", "Moderate"),
                    "holdings": row["holdings"],
                    "holdings_count": len(row["holdings"]) if isinstance(row["holdings"], list) else 0
                }
    except Exception as e:
        print(f"[MCP Portfolio Lookup Warning] DB query failed: {e}")

    # Local fallback
    port_num = portfolio_id.replace("PORT-100", "").replace("PORT-", "")
    if not port_num:
        port_num = "1"
    json_path = os.path.join(os.path.dirname(__file__), f"../../data/portfolio/portfolio_{port_num}.json")
    if not os.path.exists(json_path):
        json_path = os.path.join(os.path.dirname(__file__), "../../data/portfolio/portfolio_1.json")

    try:
        with open(json_path, "r") as f:
            data = json.load(f)
            return {
                "status": "success",
                "source": "Local JSON Snapshot",
                "portfolio_id": data.get("portfolio_id", portfolio_id),
                "investor_name": data.get("investor_name", "Vaibhav Pandey"),
                "risk_profile": data.get("investor_risk_profile", "Aggressive"),
                "holdings": data.get("holdings", []),
                "holdings_count": len(data.get("holdings", []))
            }
    except Exception as err:
        return {
            "status": "error",
            "message": f"Failed to load portfolio '{portfolio_id}': {str(err)}"
        }

def validate_portfolio_completeness(holdings: list) -> dict:
    """
    MCP Tool: Validates if portfolio holdings data has all required fields to compute accurate analytics.
    """
    if not holdings or not isinstance(holdings, list):
        return {
            "is_valid": False,
            "error": "Holdings list is empty or invalid format",
            "missing_fields": ["holdings"]
        }

    required_fields = ["symbol", "shares", "avg_buy_price", "current_price"]
    missing_report = []

    for idx, item in enumerate(holdings):
        for field in required_fields:
            if field not in item or item[field] is None:
                missing_report.append(f"Holding index {idx} ({item.get('symbol', 'UNKNOWN')}) missing '{field}'")

    return {
        "is_valid": len(missing_report) == 0,
        "holdings_count": len(holdings),
        "missing_report": missing_report,
        "completeness_score": round((1.0 - (len(missing_report) / (len(holdings) * len(required_fields)))) * 100, 2) if holdings else 0.0
    }
