import os
import json
import time
import datetime
from typing import Dict, Any

from mcp_server.tools.portfolio_tools import lookup_portfolio, validate_portfolio_completeness
from mcp_server.tools.market_tools import fetch_market_quotes, fetch_historical_ohlc
from mcp_server.tools.news_tools import fetch_ticker_sentiment_news
from mcp_server.tools.analytics_tools import compute_portfolio_metrics, calculate_risk_alerts

TOOL_REGISTRY_PATH = os.path.join(os.path.dirname(__file__), "tool_registry.json")

class MCPServer:
    """
    Model Context Protocol (MCP) Server for Zerodha AI Financial Intelligence Platform.
    Exposes governed, schema-bound tools to AI reasoning workflows and external callers.
    """

    def __init__(self):
        self.registry = self._load_registry()
        self._handlers = {
            "lookup_portfolio": lambda args: lookup_portfolio(args.get("portfolio_id", "PORT-1001")),
            "validate_portfolio_completeness": lambda args: validate_portfolio_completeness(args.get("holdings", [])),
            "fetch_market_quotes": lambda args: fetch_market_quotes(args.get("symbols", [])),
            "fetch_historical_ohlc": lambda args: fetch_historical_ohlc(args.get("symbol", "^NSEI"), args.get("period", "1mo")),
            "fetch_ticker_sentiment_news": lambda args: fetch_ticker_sentiment_news(args.get("symbol", "TCS.NS")),
            "compute_portfolio_metrics": lambda args: compute_portfolio_metrics(
                args.get("portfolio_id", "PORT-1001"),
                args.get("benchmark", "^NSEI"),
                args.get("force_refresh", False)
            ),
            "calculate_risk_alerts": lambda args: calculate_risk_alerts(
                args.get("sector_allocation", {}),
                args.get("volatility_pct", 0.0),
                args.get("max_drawdown_pct", 0.0)
            )
        }

    def _load_registry(self) -> dict:
        if os.path.exists(TOOL_REGISTRY_PATH):
            with open(TOOL_REGISTRY_PATH, "r") as f:
                return json.load(f)
        return {"protocol_version": "2025-06-18", "tools": []}

    def get_tool_definitions(self) -> list:
        """Returns the list of registered MCP tools with parameter schemas."""
        return self.registry.get("tools", [])

    def execute_tool(self, tool_name: str, arguments: Dict[str, Any] = None) -> dict:
        """
        Executes a registered MCP tool and tracks execution duration and status.
        """
        if arguments is None:
            arguments = {}

        if tool_name not in self._handlers:
            return {
                "status": "error",
                "tool": tool_name,
                "error": f"Tool '{tool_name}' not found in MCP registry.",
                "available_tools": list(self._handlers.keys())
            }

        start_time = time.time()
        try:
            handler = self._handlers[tool_name]
            result = handler(arguments)
            elapsed_ms = round((time.time() - start_time) * 1000, 2)

            return {
                "status": "success",
                "protocol": "MCP/2025-06-18",
                "tool": tool_name,
                "execution_time_ms": elapsed_ms,
                "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat(),
                "result": result
            }
        except Exception as e:
            elapsed_ms = round((time.time() - start_time) * 1000, 2)
            return {
                "status": "error",
                "tool": tool_name,
                "execution_time_ms": elapsed_ms,
                "error": str(e),
                "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat()
            }

# Singleton instance
mcp_server_instance = MCPServer()

if __name__ == "__main__":
    server = MCPServer()
    print("[MCP Server] Registered Tools:", len(server.get_tool_definitions()))
    print("[MCP Server] Executing test tool 'lookup_portfolio'...")
    res = server.execute_tool("lookup_portfolio", {"portfolio_id": "PORT-1001"})
    print(json.dumps(res, indent=2))
