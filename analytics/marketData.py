import os
import time
import pandas as pd
import yfinance as yf

# Directory to cache market data locally
CACHE_DIR = os.path.join(os.path.dirname(__file__), "../data/market")
CACHE_FILE = os.path.join(CACHE_DIR, "market_cache.csv")
CACHE_EXPIRY_SECONDS = 900  # 15 minutes cache

def fetch_market_data(tickers: list[str], period: str = "6mo") -> pd.DataFrame:
    """
    Fetches historical closing prices for portfolio holdings and market benchmarks (^NSEI).
    Uses a local CSV cache to reduce latency and yfinance rate limits.
    """
    # Always include the benchmark index (NIFTY 50)
    all_tickers = list(set(tickers + ["^NSEI"]))
    
    # Check if a fresh cache exists
    if os.path.exists(CACHE_FILE):
        file_age = time.time() - os.path.getmtime(CACHE_FILE)
        if file_age < CACHE_EXPIRY_SECONDS:
            print("[MarketData] Returning cached market data...")
            return pd.read_csv(CACHE_FILE, index_col=0, parse_dates=True)

    print(f"[MarketData] Fetching fresh price data from Yahoo Finance for: {all_tickers}")
    try:
        # Download historical closing prices
        data = yf.download(all_tickers, period=period, progress=False)["Close"]
        
        # Ensure data directory exists and save to local cache
        os.makedirs(CACHE_DIR, exist_ok=True)
        data.to_csv(CACHE_FILE)
        
        return data
    except Exception as e:
        print(f"[MarketData Error] Failed to fetch market data: {e}")
        # Return cached file if available as fallback, even if expired
        if os.path.exists(CACHE_FILE):
            return pd.read_csv(CACHE_FILE, index_col=0, parse_dates=True)
        raise e

def fetch_ticker_news(ticker: str) -> list[dict]:
    """
    Fetches recent news headlines for a stock ticker, 
    supporting both legacy and current nested yfinance news formats.
    """
    try:
        stock = yf.Ticker(ticker)
        news_items = stock.news
        cleaned_news = []

        if not news_items:
            return []

        for item in news_items[:3]:  # Top 3 headlines
            # Handle new nested 'content' structure
            content = item.get("content", {}) if isinstance(item, dict) else {}
            
            title = content.get("title") or item.get("title")
            
            # Extract publisher / provider
            provider = content.get("provider", {})
            publisher = provider.get("displayName") if isinstance(provider, dict) else item.get("publisher")
            
            # Extract link
            canonical_url = content.get("canonicalUrl", {})
            link = canonical_url.get("url") if isinstance(canonical_url, dict) else item.get("link")

            if title:
                cleaned_news.append({
                    "title": title,
                    "publisher": publisher or "Financial News",
                    "link": link or ""
                })

        return cleaned_news
    except Exception as e:
        print(f"[News Fetch Error] {e}")
        return []

if __name__ == "__main__":
    # Test script with holdings from PORT-1001
    sample_tickers = ["TCS.NS", "INFY.NS", "RELIANCE.NS"]
    prices = fetch_market_data(sample_tickers)
    print("\n--- Market Closing Prices Sample ---")
    print(prices.tail())
    
    print("\n--- Recent News Sample (TCS.NS) ---")
    print(fetch_ticker_news("TCS.NS"))