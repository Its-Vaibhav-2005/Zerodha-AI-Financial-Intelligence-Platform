import os
import time
import pandas as pd
import yfinance as yf

# Directory to cache market data locally
CACHE_DIR = os.path.join(os.path.dirname(__file__), "../data/market")
CACHE_FILE = os.path.join(CACHE_DIR, "market_cache.csv")
CACHE_EXPIRY_SECONDS = 900  # 15 minutes cache

def normalize_symbol(symbol: str, default_exchange: str = "NS") -> str:
    """
    Normalizes a stock ticker symbol by trimming whitespace, converting to uppercase,
    and ensuring Indian equity tickers have .NS or .BO suffix (e.g., RELIANCE -> RELIANCE.NS).
    Benchmark symbols starting with '^' (e.g., ^NSEI, ^BSESN, ^NSEBANK) are left intact.
    """
    if not symbol or not isinstance(symbol, str):
        return ""
    clean = symbol.strip().upper()
    if clean.startswith("^"):
        return clean
    if clean.endswith(".NS") or clean.endswith(".BO"):
        return clean
    return f"{clean}.{default_exchange.upper()}"

def normalize_tickers(symbols: list[str], default_exchange: str = "NS") -> list[str]:
    """Applies normalize_symbol across a list of raw ticker strings."""
    return [normalize_symbol(s, default_exchange=default_exchange) for s in symbols if s]

def fetch_market_data(
    tickers: list[str], 
    benchmark: str = "^NSEI", 
    period: str = "6mo", 
    force_refresh: bool = False
) -> pd.DataFrame:
    """
    Fetches historical closing prices for portfolio holdings and a configurable market benchmark.
    Supports ^NSEI (NIFTY 50), ^BSESN (SENSEX), ^NSEBANK (Bank NIFTY), etc.
    Uses a local CSV cache unless force_refresh is True.
    """
    normalized_tickers = normalize_tickers(tickers)
    normalized_benchmark = normalize_symbol(benchmark)
    
    # Always include the benchmark index
    all_tickers = list(set(normalized_tickers + [normalized_benchmark]))
    
    # Check if a fresh cache exists when force_refresh is False
    if not force_refresh and os.path.exists(CACHE_FILE):
        file_age = time.time() - os.path.getmtime(CACHE_FILE)
        if file_age < CACHE_EXPIRY_SECONDS:
            print("[MarketData] Returning cached market data...")
            cached_df = pd.read_csv(CACHE_FILE, index_col=0, parse_dates=True)
            if all(col in cached_df.columns for col in all_tickers):
                return cached_df

    print(f"[MarketData] Fetching fresh price data from Yahoo Finance (force_refresh={force_refresh}) for: {all_tickers}")
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
        stock = yf.Ticker(normalize_symbol(ticker))
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
    # Test normalization
    print("Testing Normalization:")
    print("RELIANCE ->", normalize_symbol("RELIANCE"))
    print("TCS.NS ->", normalize_symbol("TCS.NS"))
    print("^BSESN ->", normalize_symbol("^BSESN"))
    
    # Test script with holdings from PORT-1001 and ^BSESN benchmark
    sample_tickers = ["TCS", "INFY", "RELIANCE.NS"]
    prices = fetch_market_data(sample_tickers, benchmark="^BSESN", force_refresh=True)
    print("\n--- Market Closing Prices Sample ---")
    print(prices.tail())
    
    print("\n--- Recent News Sample (TCS.NS) ---")
    print(fetch_ticker_news("TCS.NS"))