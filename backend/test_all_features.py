import unittest
import json
import io
import os
import sys

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from analytics.marketData import normalize_symbol, normalize_tickers, fetch_market_data
from backend.app import app, lookup_sector
from backend.db import init_db

class TestZerodhaAIFeatures(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        init_db()
        cls.client = app.test_client()

    def test_1_ticker_normalization(self):
        print("\n[TEST] 1. Ticker Normalization Engine")
        self.assertEqual(normalize_symbol("RELIANCE"), "RELIANCE.NS")
        self.assertEqual(normalize_symbol("TCS.NS"), "TCS.NS")
        self.assertEqual(normalize_symbol("TATASTEEL.BO"), "TATASTEEL.BO")
        self.assertEqual(normalize_symbol("^NSEBANK"), "^NSEBANK")
        self.assertEqual(normalize_tickers(["INFY", "HDFCBANK.NS", "^BSESN"]), ["INFY.NS", "HDFCBANK.NS", "^BSESN"])

    def test_2_auth_flow(self):
        print("\n[TEST] 2. User Authentication & JWT")
        test_email = "investor_test_100@example.com"
        test_password = "SecurePassword123!"

        # Register
        res_reg = self.client.post('/api/auth/register', json={
            "email": test_email,
            "password": test_password
        })
        self.assertIn(res_reg.status_code, [201, 409]) # 201 created or 409 if already exists

        # Login
        res_login = self.client.post('/api/auth/login', json={
            "email": test_email,
            "password": test_password
        })
        self.assertEqual(res_login.status_code, 200)
        data = res_login.get_json()
        self.assertEqual(data["status"], "success")
        self.assertIn("access_token", data)

    def test_3_csv_portfolio_upload(self):
        print("\n[TEST] 3. Zerodha CSV Portfolio Upload Endpoint")
        csv_data = "Instrument,Qty.,Avg. cost,Cur. val\nRELIANCE,30,2500.0,2900.0\nTCS,50,3800.0,4120.0\nINFY,100,1450.0,1820.0\n"
        
        data = {
            'user_id': '1001',
            'file': (io.BytesIO(csv_data.encode('utf-8')), 'zerodha_holdings.csv')
        }
        res = self.client.post('/api/portfolio/upload', data=data, content_type='multipart/form-data')
        self.assertEqual(res.status_code, 200)
        json_resp = res.get_json()
        self.assertEqual(json_resp["status"], "success")
        self.assertEqual(json_resp["portfolio_id"], "PORT-1001")
        self.assertEqual(json_resp["holdings_count"], 3)

    def test_4_dynamic_insights_endpoint(self):
        print("\n[TEST] 4. Dynamic Insights Endpoint with ^BSESN Benchmark & force_refresh")
        res = self.client.get('/api/portfolio/PORT-1001/insights?benchmark=^BSESN&refresh=true')
        self.assertEqual(res.status_code, 200)
        json_resp = res.get_json()
        self.assertEqual(json_resp["status"], "success")
        self.assertEqual(json_resp["benchmark"], "^BSESN")
        self.assertTrue(json_resp["force_refresh"])

    def test_5_feedback_audit_endpoint(self):
        print("\n[TEST] 5. Feedback & Compliance Audit Log Endpoint")
        feedback_payload = {
            "portfolio_id": "PORT-1001",
            "rating": "Helpful",
            "model_version": "gemini-3.5-flash",
            "feedback_text": "Clear sector concentration warning."
        }
        res = self.client.post('/api/feedback', json=feedback_payload)
        self.assertEqual(res.status_code, 200)
        json_resp = res.get_json()
        self.assertEqual(json_resp["status"], "recorded")
        self.assertEqual(json_resp["rating"], "Helpful")
        self.assertIn("prompt_hash", json_resp)

if __name__ == '__main__':
    unittest.main()
