import json
import pandas as pd
import numpy as np
import psycopg2
from psycopg2.extras import RealDictCursor
import os
from dotenv import load_dotenv

try:
    from analytics.marketData import fetch_market_data, fetch_ticker_news
except ModuleNotFoundError:
    from marketData import fetch_market_data, fetch_ticker_news

load_dotenv()

class PortfolioAnalytics:
    def __init__(self, portfolio_id: str):
        self.portfolio_id = portfolio_id
        self.portfolio_data = self._fetch_from_neon()
        self.df = pd.DataFrame(self.portfolio_data['holdings'])

    def _fetch_from_neon(self) -> dict:
        """Fetches portfolio holdings from NeonDB PostgreSQL with local JSON fallback."""
        try:
            db_url = os.getenv("NEON_DATABASE_URL")
            if not db_url:
                raise ValueError("NEON_DATABASE_URL missing")
                
            conn = psycopg2.connect(db_url)
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute("SELECT * FROM portfolios WHERE portfolio_id = %s", (self.portfolio_id,))
                row = cur.fetchone()
            conn.close()
            
            if row:
                return {
                    "portfolio_id": row["portfolio_id"],
                    "investor_name": row["investor_name"],
                    "risk_profile": row["risk_profile"],
                    "holdings": row["holdings"]
                }
        except Exception as e:
            print(f"[DB Warning] Could not connect to NeonDB ({e}). Falling back to local JSON data...")

        # Fallback to local JSON file if DB connection fails
        json_path = os.path.join(os.path.dirname(__file__), "../data/mock_portfolio_1.json")
        with open(json_path, "r") as f:
            data = json.load(f)
            return {
                "portfolio_id": data.get("portfolio_id", self.portfolio_id),
                "investor_name": data.get("investor_name", "Vaibhav Pandey"),
                "risk_profile": data.get("investor_risk_profile", "Aggressive"),
                "holdings": data["holdings"]
            }

    def generate_full_payload(self) -> dict:
        """Computes basic, sector, risk, and news context for the AI layer."""
        symbols = self.df['symbol'].tolist()
        
        # 1. Fetch Market Prices & News
        market_df = fetch_market_data(symbols)
        all_news = {sym: fetch_ticker_news(sym) for sym in symbols}

        # 2. Holdings P&L Calculation
        self.df['invested_value'] = self.df['shares'] * self.df['avg_buy_price']
        self.df['current_value'] = self.df['shares'] * self.df['current_price']
        self.df['pnl'] = self.df['current_value'] - self.df['invested_value']
        
        total_invested = float(self.df['invested_value'].sum())
        total_current = float(self.df['current_value'].sum())
        total_pnl = total_current - total_invested

        # 3. Sector Breakdown & Alerts
        sector_group = self.df.groupby('sector')['current_value'].sum()
        sector_pcts = (sector_group / total_current * 100).round(2).to_dict()
        concentration_alerts = [f"Concentration Risk: {sec} accounts for {pct}% of portfolio" 
                                for sec, pct in sector_pcts.items() if pct > 40.0]

        # 4. Volatility & Benchmark Relative Return
        daily_returns = market_df.pct_change().dropna()
        weights = (self.df.set_index('symbol')['current_value'] / total_current).to_dict()
        
        portfolio_daily = sum(daily_returns[sym] * weights.get(sym, 0) for sym in symbols if sym in daily_returns)
        volatility = float(portfolio_daily.std() * np.sqrt(252) * 100)
        
        cum_returns = (1 + portfolio_daily).cumprod()
        peak = cum_returns.cummax()
        max_drawdown = float(((cum_returns - peak) / peak).min() * 100)

        return {
            "metadata": {
                "portfolio_id": self.portfolio_id,
                "investor_name": self.portfolio_data["investor_name"],
                "risk_profile": self.portfolio_data["risk_profile"]
            },
            "summary": {
                "total_invested": round(total_invested, 2),
                "total_current_value": round(total_current, 2),
                "total_pnl": round(total_pnl, 2),
                "pnl_pct": round((total_pnl / total_invested) * 100, 2)
            },
            "sector_allocation": sector_pcts,
            "concentration_alerts": concentration_alerts,
            "risk_metrics": {
                "annualized_volatility_pct": round(volatility, 2),
                "max_drawdown_pct": round(max_drawdown, 2),
                "risk_flag": "HIGH" if volatility > 22.0 else "NORMAL"
            },
            "holdings_news": all_news
        }

if __name__ == "__main__":
    engine = PortfolioAnalytics("PORT-1001")
    print(json.dumps(engine.generate_full_payload(), indent=2))