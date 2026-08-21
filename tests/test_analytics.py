import unittest
import sys
import os
import numpy as np
import pandas as pd

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from analytics.portfolioAnalytics import PortfolioAnalytics

class TestPortfolioAnalytics(unittest.TestCase):
    def setUp(self):
        self.analytics = PortfolioAnalytics("PORT-1001")

    def test_payload_structure(self):
        payload = self.analytics.generate_full_payload()
        self.assertIn("metadata", payload)
        self.assertIn("summary", payload)
        self.assertIn("holdings", payload)
        self.assertIn("sector_allocation", payload)
        self.assertIn("risk_metrics", payload)

    def test_pnl_calculations(self):
        payload = self.analytics.generate_full_payload()
        summary = payload["summary"]
        self.assertGreaterEqual(summary["total_invested"], 0.0)
        self.assertGreaterEqual(summary["total_current_value"], 0.0)
        expected_pnl = summary["total_current_value"] - summary["total_invested"]
        self.assertAlmostEqual(summary["total_pnl"], round(expected_pnl, 2), delta=1.0)

    def test_sector_concentration(self):
        payload = self.analytics.generate_full_payload()
        sector_alloc = payload["sector_allocation"]
        total_pct = sum(sector_alloc.values())
        self.assertAlmostEqual(total_pct, 100.0, delta=1.0)
        
        # PORT-1001 is a tech-heavy portfolio (>40% concentration check)
        self.assertTrue(any(pct > 40.0 for pct in sector_alloc.values()))
        self.assertGreater(len(payload["concentration_alerts"]), 0)

    def test_stock_contributions(self):
        payload = self.analytics.generate_full_payload()
        holdings = payload["holdings"]
        self.assertGreater(len(holdings), 0)
        for h in holdings:
            self.assertIn("symbol", h)
            self.assertIn("allocation_pct", h)
            self.assertIn("pnl_contribution_pct", h)

    def test_beta_and_volatility(self):
        payload = self.analytics.generate_full_payload()
        risk_metrics = payload["risk_metrics"]
        self.assertGreater(risk_metrics["annualized_volatility_pct"], 0.0)
        self.assertIsInstance(risk_metrics["portfolio_beta"], (int, float))

if __name__ == '__main__':
    unittest.main()
