import numpy as np
import pandas as pd
import datetime

def compute_portfolio_metrics(portfolio_id: str, benchmark: str = "^NSEI", force_refresh: bool = False) -> dict:
    """
    MCP Tool: Computes deterministic analytics including sector concentration, drawdown, volatility, stock contribution, and benchmark beta.
    """
    from analytics.portfolioAnalytics import PortfolioAnalytics
    engine = PortfolioAnalytics(portfolio_id, benchmark=benchmark, force_refresh=force_refresh)
    payload = engine.generate_full_payload()
    return payload

def calculate_risk_alerts(sector_allocation: dict, volatility_pct: float, max_drawdown_pct: float) -> dict:
    """
    MCP Tool: Evaluates sector concentration, drawdown thresholds, and volatility levels to generate governed risk warnings.
    """
    alerts = []
    
    # 1. Sector concentration rule (>40%)
    for sector, pct in sector_allocation.items():
        if pct > 40.0:
            alerts.append({
                "type": "SECTOR_CONCENTRATION",
                "severity": "CRITICAL" if pct > 60.0 else "WARNING",
                "sector": sector,
                "allocation_pct": pct,
                "message": f"Heavy concentration in {sector} ({pct}% of total equity). Exposes portfolio to single-sector regulatory and macro headwinds."
            })
            
    # 2. Volatility threshold rule (>22%)
    if volatility_pct > 22.0:
        alerts.append({
            "type": "HIGH_VOLATILITY",
            "severity": "WARNING",
            "volatility_pct": volatility_pct,
            "message": f"Annualized volatility is {volatility_pct}%, which is higher than the NIFTY 50 baseline (~14%). Expect wider day-to-day portfolio swings."
        })

    # 3. Peak Drawdown threshold rule (>15%)
    if abs(max_drawdown_pct) > 15.0:
        alerts.append({
            "type": "ELEVATED_DRAWDOWN",
            "severity": "CRITICAL",
            "max_drawdown_pct": max_drawdown_pct,
            "message": f"Historical maximum drawdown reached {max_drawdown_pct}%. Suggests vulnerability during sharp sector corrections."
        })

    return {
        "alert_count": len(alerts),
        "risk_level": "HIGH" if any(a["severity"] == "CRITICAL" for a in alerts) else ("MODERATE" if alerts else "LOW"),
        "alerts": alerts,
        "evaluated_at": datetime.datetime.now(datetime.timezone.utc).isoformat()
    }
