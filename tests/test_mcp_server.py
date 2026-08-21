import unittest
import sys
import os

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from mcp_server.server import mcp_server_instance

class TestMCPServer(unittest.TestCase):
    def setUp(self):
        self.server = mcp_server_instance

    def test_tool_registry_loaded(self):
        tools = self.server.get_tool_definitions()
        self.assertGreaterEqual(len(tools), 5)
        tool_names = [t["name"] for t in tools]
        self.assertIn("lookup_portfolio", tool_names)
        self.assertIn("fetch_market_quotes", tool_names)
        self.assertIn("fetch_ticker_sentiment_news", tool_names)
        self.assertIn("compute_portfolio_metrics", tool_names)
        self.assertIn("calculate_risk_alerts", tool_names)

    def test_lookup_portfolio_tool(self):
        result = self.server.execute_tool("lookup_portfolio", {"portfolio_id": "PORT-1001"})
        self.assertEqual(result["status"], "success")
        self.assertEqual(result["tool"], "lookup_portfolio")
        self.assertIn("holdings", result["result"])
        self.assertGreater(result["result"]["holdings_count"], 0)

    def test_fetch_market_quotes_tool(self):
        result = self.server.execute_tool("fetch_market_quotes", {"symbols": ["TCS.NS", "INFY.NS"]})
        self.assertEqual(result["status"], "success")
        self.assertIn("quotes", result["result"])
        self.assertIn("TCS.NS", result["result"]["quotes"])

    def test_calculate_risk_alerts_tool(self):
        result = self.server.execute_tool("calculate_risk_alerts", {
            "sector_allocation": {"Technology": 85.0, "Energy": 15.0},
            "volatility_pct": 26.5,
            "max_drawdown_pct": 16.2
        })
        self.assertEqual(result["status"], "success")
        alerts = result["result"]["alerts"]
        self.assertGreater(len(alerts), 0)
        self.assertEqual(result["result"]["risk_level"], "HIGH")

    def test_unknown_tool_error_handling(self):
        result = self.server.execute_tool("non_existent_tool_123", {})
        self.assertEqual(result["status"], "error")
        self.assertIn("not found", result["error"])

if __name__ == '__main__':
    unittest.main()
