# Model Context Protocol (MCP) Tooling Reference

## Overview
The Zerodha AI Financial Intelligence Platform implements the **Model Context Protocol (MCP)** specification (v2025-06-18) to standardize how the AI engine retrieves internal and external financial data.

---

## Registered MCP Tools

| Tool Name | Category | Description | Primary Parameters |
|---|---|---|---|
| `lookup_portfolio` | `portfolio` | Fetches normalized holdings snapshot from NeonDB / SQLite | `portfolio_id` (str) |
| `validate_portfolio_completeness` | `portfolio` | Checks required columns (symbol, qty, avg_price, ltp) | `holdings` (array) |
| `fetch_market_quotes` | `market` | Real-time LTP, 52W high/low, day range from market feeds | `symbols` (array) |
| `fetch_historical_ohlc` | `market` | Candlestick OHLC series for trends and technical charts | `symbol` (str), `period` (str) |
| `fetch_ticker_sentiment_news` | `news` | Symbol-specific news headlines with sentiment tagging | `symbol` (str) |
| `compute_portfolio_metrics` | `analytics` | Deterministic P&L, concentration, drawdown, volatility, beta | `portfolio_id` (str), `benchmark` (str) |
| `calculate_risk_alerts` | `analytics` | Evaluates concentration (>40%) and volatility (>22%) rules | `sector_allocation`, `volatility_pct` |

---

## Local MCP Execution Example

```bash
# Invocate directly via cURL or Python
curl -X POST http://localhost:5000/api/mcp/tools/execute \
  -H "Content-Type: application/json" \
  -d '{
    "tool_name": "fetch_market_quotes",
    "arguments": { "symbols": ["TCS.NS", "INFY.NS"] }
  }'
```
