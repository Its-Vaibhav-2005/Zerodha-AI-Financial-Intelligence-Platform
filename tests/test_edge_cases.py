import unittest
import sys
import os

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from mcp_server.tools.portfolio_tools import validate_portfolio_completeness
from mcp_server.tools.market_tools import fetch_market_quotes
from analytics.portfolioAnalytics import PortfolioAnalytics

class TestEdgeCases(unittest.TestCase):

    def test_empty_holdings_validation(self):
        result = validate_portfolio_completeness([])
        self.assertFalse(result["is_valid"])
        self.assertIn("empty", result["error"].lower())

    def test_missing_fields_validation(self):
        incomplete_holdings = [
            {"symbol": "TCS.NS", "shares": 10} # Missing avg_buy_price, current_price
        ]
        result = validate_portfolio_completeness(incomplete_holdings)
        self.assertFalse(result["is_valid"])
        self.assertGreater(len(result["missing_report"]), 0)

    def test_market_quotes_unknown_symbol_fallback(self):
        result = fetch_market_quotes(["UNKNOWN_TICKER_9999"])
        self.assertEqual(result["status"], "success")
        self.assertIn("UNKNOWN_TICKER_9999", result["quotes"])
        # Should gracefully return fallback LTP without crashing
        self.assertGreater(result["quotes"]["UNKNOWN_TICKER_9999"]["ltp"], 0)

    def test_fallback_when_invalid_portfolio_id(self):
        analytics = PortfolioAnalytics("PORT-NON-EXISTENT-999")
        payload = analytics.generate_full_payload()
        self.assertIn("summary", payload)
        self.assertIn("holdings", payload)

if __name__ == '__main__':
    unittest.main()
