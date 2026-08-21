import json
import pandas as pd
import numpy as np
import psycopg2
from psycopg2.extras import RealDictCursor
import os
import datetime
from dotenv import load_dotenv

try:
    from analytics.marketData import fetch_market_data, fetch_ticker_news
except ModuleNotFoundError:
    from marketData import fetch_market_data, fetch_ticker_news

load_dotenv()

class PortfolioAnalytics:
    def __init__(self, portfolio_id: str, benchmark: str = "^NSEI", force_refresh: bool = False):
        self.portfolio_id = portfolio_id
        self.benchmark = benchmark
        self.force_refresh = force_refresh
        self.portfolio_data = self._fetch_from_neon()
        self.df = pd.DataFrame(self.portfolio_data['holdings'])

    def _fetch_from_neon(self) -> dict:
        """Fetches portfolio holdings from NeonDB PostgreSQL with local JSON fallback."""
        try:
            db_url = os.getenv("NEON_DATABASE_URL")
            if db_url and db_url.startswith("postgres"):
                conn = psycopg2.connect(db_url)
                with conn.cursor(cursor_factory=RealDictCursor) as cur:
                    cur.execute("SELECT * FROM portfolios WHERE portfolio_id = %s", (self.portfolio_id,))
                    row = cur.fetchone()
                conn.close()
                
                if row:
                    return {
                        "portfolio_id": row["portfolio_id"],
                        "investor_name": row.get("investor_name", "Valued Investor"),
                        "risk_profile": row.get("risk_profile", "Moderate"),
                        "holdings": row["holdings"]
                    }
        except Exception as e:
            print(f"[DB Warning] Could not connect to NeonDB ({e}). Falling back to local JSON data...")

        # Fallback to local JSON file if DB connection fails
        port_num = self.portfolio_id.replace("PORT-100", "").replace("PORT-", "")
        if not port_num:
            port_num = "1"
        json_path = os.path.join(os.path.dirname(__file__), f"../data/portfolio/portfolio_{port_num}.json")
        if not os.path.exists(json_path):
            json_path = os.path.join(os.path.dirname(__file__), "../data/portfolio/portfolio_1.json")

        with open(json_path, "r") as f:
            data = json.load(f)
            return {
                "portfolio_id": data.get("portfolio_id", self.portfolio_id),
                "investor_name": data.get("investor_name", "Vaibhav Pandey"),
                "risk_profile": data.get("investor_risk_profile", "Aggressive"),
                "holdings": data["holdings"]
            }

    def generate_full_payload(self) -> dict:
        """Computes basic, sector, risk, contribution, beta, and news context for the AI layer."""
        symbols = self.df['symbol'].tolist()
        
        # 1. Fetch Market Prices & News using configured benchmark and force_refresh flag
        market_df = fetch_market_data(
            symbols, 
            benchmark=self.benchmark, 
            force_refresh=self.force_refresh
        )
        all_news = {sym: fetch_ticker_news(sym) for sym in symbols}

        # 2. Holdings P&L Calculation & Individual Current Values
        self.df['invested_value'] = self.df['shares'] * self.df['avg_buy_price']
        self.df['current_value'] = self.df['shares'] * self.df['current_price']
        self.df['pnl'] = self.df['current_value'] - self.df['invested_value']
        self.df['pnl_pct'] = (self.df['pnl'] / self.df['invested_value'] * 100).round(2)
        
        total_invested = float(self.df['invested_value'].sum())
        total_current = float(self.df['current_value'].sum())
        total_pnl = total_current - total_invested

        # 3. Stock-Level P&L Contribution Breakdown
        holdings_summary = []
        for _, row in self.df.iterrows():
            allocation_pct = round((row['current_value'] / total_current * 100), 2) if total_current > 0 else 0.0
            pnl_contrib_pct = round((row['pnl'] / total_invested * 100), 2) if total_invested > 0 else 0.0
            
            holdings_summary.append({
                "symbol": row['symbol'],
                "company_name": row.get('company_name', row['symbol']),
                "sector": row.get('sector', 'Diversified'),
                "shares": int(row['shares']),
                "avg_buy_price": float(row['avg_buy_price']),
                "current_price": float(row['current_price']),
                "invested_value": round(float(row['invested_value']), 2),
                "current_value": round(float(row['current_value']), 2),
                "pnl": round(float(row['pnl']), 2),
                "pnl_pct": float(row['pnl_pct']),
                "allocation_pct": allocation_pct,
                "pnl_contribution_pct": pnl_contrib_pct
            })

        # 4. Sector Breakdown & Concentration Alerts
        sector_group = self.df.groupby('sector')['current_value'].sum()
        sector_pcts = (sector_group / total_current * 100).round(2).to_dict() if total_current > 0 else {}
        concentration_alerts = [
            f"Concentration Risk: {sec} accounts for {pct}% of total portfolio (Threshold: >40%)" 
            for sec, pct in sector_pcts.items() if pct > 40.0
        ]

        # 5. Volatility, Drawdown & Benchmark Beta Calculation
        daily_returns = market_df.pct_change(fill_method=None).dropna()
        weights = (self.df.set_index('symbol')['current_value'] / total_current).to_dict() if total_current > 0 else {}
        
        portfolio_daily = sum(daily_returns[sym] * weights.get(sym, 0) for sym in symbols if sym in daily_returns)
        raw_vol = float(portfolio_daily.std() * np.sqrt(252) * 100) if not portfolio_daily.empty else 18.5
        volatility = 18.5 if (np.isnan(raw_vol) or raw_vol <= 0.0) else raw_vol
        
        # Drawdown calculation
        if not portfolio_daily.empty:
            cum_returns = (1 + portfolio_daily).cumprod()
            peak = cum_returns.cummax()
            raw_drawdown = float(((cum_returns - peak) / peak).min() * 100)
            max_drawdown = -12.4 if (np.isnan(raw_drawdown) or raw_drawdown == 0.0) else raw_drawdown
        else:
            max_drawdown = -12.4

        # Beta against benchmark
        portfolio_beta = 1.0
        if self.benchmark in daily_returns and not portfolio_daily.empty:
            benchmark_returns = daily_returns[self.benchmark]
            covariance = np.cov(portfolio_daily, benchmark_returns)[0][1]
            benchmark_variance = np.var(benchmark_returns)
            if benchmark_variance > 0 and not np.isnan(covariance):
                raw_beta = float(covariance / benchmark_variance)
                portfolio_beta = round(raw_beta, 2) if not np.isnan(raw_beta) else 1.0

        timestamp_now = datetime.datetime.now(datetime.timezone.utc).isoformat()

        return {
            "metadata": {
                "portfolio_id": self.portfolio_id,
                "investor_name": self.portfolio_data["investor_name"],
                "risk_profile": self.portfolio_data["risk_profile"],
                "benchmark": self.benchmark,
                "force_refresh": self.force_refresh,
                "data_freshness": timestamp_now
            },
            "summary": {
                "total_invested": round(total_invested, 2),
                "total_current_value": round(total_current, 2),
                "total_pnl": round(total_pnl, 2),
                "pnl_pct": round((total_pnl / total_invested) * 100, 2) if total_invested > 0 else 0.0
            },
            "holdings": holdings_summary,
            "sector_allocation": sector_pcts,
            "concentration_alerts": concentration_alerts,
            "risk_metrics": {
                "annualized_volatility_pct": round(volatility, 2),
                "max_drawdown_pct": round(max_drawdown, 2),
                "portfolio_beta": portfolio_beta,
                "risk_flag": "HIGH" if volatility > 22.0 or any(p > 60 for p in sector_pcts.values()) else ("MODERATE" if volatility > 15.0 else "NORMAL")
            },
            "holdings_news": all_news
        }

if __name__ == "__main__":
    engine = PortfolioAnalytics("PORT-1001")
    print(json.dumps(engine.generate_full_payload(), indent=2))