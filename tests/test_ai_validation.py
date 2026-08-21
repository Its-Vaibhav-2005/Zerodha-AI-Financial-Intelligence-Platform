import unittest
import sys
import os

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from ai_workflows.insightGenerator import PortfolioInsightGenerator
from analytics.portfolioAnalytics import PortfolioAnalytics

class TestAIValidation(unittest.TestCase):
    def setUp(self):
        self.generator = PortfolioInsightGenerator()
        self.analytics = PortfolioAnalytics("PORT-1001")
        self.payload = self.analytics.generate_full_payload()

    def test_insight_schema_compliance(self):
        output = self.generator.generate_insight_card(self.payload)
        
        # Verify required keys
        self.assertIn("executive_summary", output)
        self.assertIn("key_performance_drivers", output)
        self.assertIn("risk_analysis", output)
        self.assertIn("recommendation_cards", output)
        self.assertIn("confidence_score", output)

    def test_recommendation_cards_structure(self):
        output = self.generator.generate_insight_card(self.payload)
        cards = output.get("recommendation_cards", [])
        self.assertGreaterEqual(len(cards), 3)

        categories = [c.get("category") for c in cards]
        self.assertTrue(any("Risk" in cat for cat in categories if cat))
        
        for card in cards:
            self.assertIn("title", card)
            self.assertIn("signal", card)
            self.assertIn("rationale", card)
            self.assertIn("confidence", card)
            self.assertIn("disclaimer", card)
            self.assertGreater(card["confidence"], 0.70)

    def test_non_advice_guardrails(self):
        output = self.generator.generate_insight_card(self.payload)
        summary = output.get("executive_summary", "").lower()
        
        # Check that direct aggressive execution commands do not exist
        forbidden_phrases = ["guaranteed return", "100% risk free", "buy immediately", "strong sell now"]
        for phrase in forbidden_phrases:
            self.assertNotIn(phrase, summary)

if __name__ == '__main__':
    unittest.main()
