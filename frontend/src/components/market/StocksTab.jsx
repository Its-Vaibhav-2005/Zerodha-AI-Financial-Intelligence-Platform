import React, { useState, useEffect } from 'react';
import MarketCandlesChart from './MarketCandlesChart';
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart2, 
  Sparkles, 
  Zap, 
  Activity, 
  ArrowUpRight, 
  ArrowDownRight,
  Layers,
  ShieldAlert,
  Compass
} from 'lucide-react';
import { API_BASE_URL } from '../../config/api';

export default function StocksTab({ userRiskProfile = "Aggressive Tech Growth", onNavigateToDashboard = () => {} }) {
  const [selectedSymbol, setSelectedSymbol] = useState('^NSEI');
  const [period, setPeriod] = useState('1mo');
  const [marketData, setMarketData] = useState(null);
  const [candles, setCandles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Profile-based stock recommendation logic
  const getProfileStockRecommendation = () => {
    if (userRiskProfile.includes("Aggressive")) {
      return {
        tag: "Tech Overweight Hedging Notice",
        title: "Diversify into Momentum Auto & High-Growth Energy",
        rationale: "Your aggressive tech profile is heavily exposed to global IT spending headwinds. Consider balancing tech volatility with domestic-demand drivers such as Tata Motors and Reliance Industries which show strong relative strength index (RSI) support.",
        risk_note: "Keep single-stock exposure capped at 15% to limit downside during sector drawdowns.",
        confidence: 96,
        action: "View Sector Allocation on Dashboard"
      };
    } else if (userRiskProfile.includes("Moderate")) {
      return {
        tag: "Core Bluechip Stability",
        title: "Accumulate Large-Cap Banking & FMCG on Dips",
        rationale: "For a moderate risk horizon, HDFC Bank and ITC offer defensive cash-flow yields and low historical drawdowns compared to high-beta midcaps.",
        risk_note: "Financials are sensitive to RBI monetary policy shifts.",
        confidence: 97,
        action: "Review Holdings Exposure"
      };
    } else {
      return {
        tag: "Capital Preservation Insight",
        title: "Focus on High Dividend Bluechips & Index Leaders",
        rationale: "Given your conservative profile, direct equities should be restricted to NIFTY 50 dividend leaders (e.g. TCS, ITC) paired with cash or debt allocation.",
        risk_note: "Equities still carry systematic market risk.",
        confidence: 99,
        action: "Inspect Risk Governance"
      };
    }
  };

  const rec = getProfileStockRecommendation();

  const fetchMarketData = async () => {
    setIsLoading(true);
    try {
      const url = `${API_BASE_URL}/api/market/overview?symbol=${encodeURIComponent(selectedSymbol)}&period=${period}`;
      const res = await fetch(url);
      if (res.ok) {
        const json = await res.json();
        if (json.status === 'success') {
          setMarketData(json);
          setCandles(json.candles || []);
        }
      }
    } catch (err) {
      console.warn("[Market Fetch Error]:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMarketData();
  }, [selectedSymbol, period]);

  const defaultIndices = [
    { symbol: "^NSEI", name: "NIFTY 50", price: 22485.60, change: 142.30, change_pct: 0.64, high_52w: 23110.00, low_52w: 19120.00 },
    { symbol: "^BSESN", name: "BSE SENSEX", price: 74120.40, change: 410.80, change_pct: 0.56, high_52w: 75900.00, low_52w: 62800.00 },
    { symbol: "^NSEBANK", name: "NIFTY BANK", price: 47850.25, change: -115.40, change_pct: -0.24, high_52w: 49250.00, low_52w: 42100.00 },
    { symbol: "^CNXIT", name: "NIFTY IT", price: 36940.10, change: 580.20, change_pct: 1.60, high_52w: 39100.00, low_52w: 28400.00 }
  ];

  const indices = marketData?.indices || defaultIndices;
  const topMovers = marketData?.top_movers || [
    { symbol: "RELIANCE", name: "Reliance Industries", price: 2980.50, change_pct: 1.85, type: "gainer", sector: "Energy" },
    { symbol: "TCS", name: "Tata Consultancy Services", price: 4120.00, change_pct: 2.40, type: "gainer", sector: "Technology" },
    { symbol: "INFY", name: "Infosys Ltd", price: 1640.20, change_pct: 1.92, type: "gainer", sector: "Technology" },
    { symbol: "HDFCBANK", name: "HDFC Bank Ltd", price: 1450.00, change_pct: -0.65, type: "loser", sector: "Financials" },
    { symbol: "TATAMOTORS", name: "Tata Motors Ltd", price: 975.80, change_pct: 3.10, type: "gainer", sector: "Automobile" },
    { symbol: "PAYTM", name: "One97 Communications", price: 410.20, change_pct: -2.15, type: "loser", sector: "Fintech" },
    { symbol: "ITC", name: "ITC Limited", price: 435.50, change_pct: 0.80, type: "gainer", sector: "Consumer Goods" },
    { symbol: "ICICIBANK", name: "ICICI Bank Ltd", price: 1085.30, change_pct: 0.45, type: "gainer", sector: "Financials" }
  ];

  const activeIndexObj = indices.find(i => i.symbol === selectedSymbol) || indices[0];

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* 1. Profile-Tailored AI Recommendation Card */}
      <div className="surface-card p-5 md:p-6 rounded-3xl border border-[#8B5CF6]/30 bg-gradient-to-br from-[var(--bg-surface)] via-[var(--bg-input)] to-[#8B5CF6]/10 relative overflow-hidden shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
          <div className="space-y-2 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="pill-badge pill-purple text-xs">
                <Sparkles className="w-3.5 h-3.5" />
                AI Profile Recommendation
              </span>
              <span className="pill-badge pill-blue text-xs font-mono">
                Target: {userRiskProfile}
              </span>
              <span className="pill-badge pill-green text-xs font-mono">
                {rec.confidence}% Confidence
              </span>
            </div>

            <h3 className="text-lg md:text-xl font-black tracking-tight text-[var(--text-primary)]">
              {rec.title}
            </h3>

            <p className="text-xs md:text-sm text-[var(--text-secondary)] leading-relaxed">
              {rec.rationale}
            </p>

            <div className="flex items-center gap-2 text-[11px] text-[var(--text-muted)] pt-1">
              <ShieldAlert className="w-3.5 h-3.5 text-[#FF5252]" />
              <span>{rec.risk_note}</span>
            </div>
          </div>

          <button
            onClick={onNavigateToDashboard}
            className="btn-primary px-5 py-2.5 text-xs font-bold shrink-0 self-start lg:self-center flex items-center gap-1.5 cursor-pointer"
          >
            <Compass className="w-4 h-4" />
            <span>{rec.action}</span>
          </button>
        </div>
      </div>

      {/* 2. Live Indices Grid */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-[#3B82F6]" />
            <h2 className="text-lg font-black text-[var(--text-primary)] tracking-tight">
              Major Market Indices
            </h2>
          </div>
          <span className="text-xs text-[var(--text-muted)] font-mono">
            Click index card to inspect candles
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {indices.map((idx) => {
            const isSelected = idx.symbol === selectedSymbol;
            const isBullish = idx.change >= 0;
            const low52 = idx.low_52w || (idx.price * 0.85);
            const high52 = idx.high_52w || (idx.price * 1.15);
            const pctPos = Math.min(100, Math.max(0, ((idx.price - low52) / (high52 - low52)) * 100));

            return (
              <div
                key={idx.symbol}
                onClick={() => setSelectedSymbol(idx.symbol)}
                className={`surface-card p-5 cursor-pointer transition-all border ${
                  isSelected 
                    ? 'border-[#3B82F6] ring-2 ring-[#3B82F6]/20 bg-[var(--bg-surface-hover)] shadow-lg' 
                    : 'border-[var(--border-subtle)] hover:border-[#3B82F6]/50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-extrabold text-sm text-[var(--text-primary)]">{idx.name}</span>
                  <span className="text-[10px] font-mono text-[var(--text-muted)] bg-[var(--bg-input)] px-2 py-0.5 rounded-md">
                    {idx.symbol}
                  </span>
                </div>

                <div className="space-y-1 mb-4">
                  <div className="text-xl md:text-2xl font-mono font-black text-[var(--text-primary)] tracking-tight">
                    ₹{idx.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </div>

                  <div className="flex items-center gap-1.5 font-mono text-xs font-bold">
                    <span className={`flex items-center gap-0.5 ${isBullish ? 'text-[#00E676]' : 'text-[#FF5252]'}`}>
                      {isBullish ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                      {isBullish ? `+${idx.change.toFixed(2)}` : idx.change.toFixed(2)}
                    </span>
                    <span className={`px-1.5 py-0.5 rounded text-[11px] ${
                      isBullish ? 'bg-[#00E676]/10 text-[#00E676]' : 'bg-[#FF5252]/10 text-[#FF5252]'
                    }`}>
                      {isBullish ? `+${idx.change_pct.toFixed(2)}%` : `${idx.change_pct.toFixed(2)}%`}
                    </span>
                  </div>
                </div>

                {/* 52W Range Bar */}
                <div className="space-y-1 pt-2 border-t border-[var(--border-subtle)]">
                  <div className="flex justify-between text-[10px] text-[var(--text-muted)] font-mono">
                    <span>52W L: ₹{Math.round(low52).toLocaleString()}</span>
                    <span>52W H: ₹{Math.round(high52).toLocaleString()}</span>
                  </div>
                  <div className="w-full h-1.5 bg-[var(--bg-input)] rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-[#3B82F6] to-[#00E676] rounded-full"
                      style={{ width: `${pctPos}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. Interactive Candlestick Chart */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-[#8B5CF6]" />
            <h2 className="text-lg font-black text-[var(--text-primary)] tracking-tight">
              Interactive Candlestick Chart ({activeIndexObj?.name})
            </h2>
          </div>
          
          <div className="hidden sm:flex items-center gap-1.5 bg-[var(--bg-input)] p-1 rounded-2xl border border-[var(--border-subtle)]">
            {indices.map((idx) => (
              <button
                key={idx.symbol}
                onClick={() => setSelectedSymbol(idx.symbol)}
                className={`px-3 py-1 text-xs font-bold font-mono rounded-xl transition-all cursor-pointer ${
                  selectedSymbol === idx.symbol
                    ? 'bg-[#8B5CF6] text-white shadow-sm'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                }`}
              >
                {idx.name}
              </button>
            ))}
          </div>
        </div>

        <MarketCandlesChart 
          candles={candles}
          selectedSymbol={selectedSymbol}
          symbolName={activeIndexObj?.name}
          period={period}
          onPeriodChange={(newP) => setPeriod(newP)}
          onSymbolChange={(newS) => setSelectedSymbol(newS)}
        />
      </section>

      {/* 4. Top Gainers & Losers */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-[#00E676]" />
            <h2 className="text-lg font-black text-[var(--text-primary)] tracking-tight">
              Market Movers & Sector Highlights
            </h2>
          </div>
          <span className="pill-badge pill-blue">
            {topMovers.length} Active Stocks
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {topMovers.map((stk) => {
            const isGain = stk.change_pct >= 0;
            return (
              <div 
                key={stk.symbol} 
                className="surface-card surface-card-hover p-4 border border-[var(--border-subtle)] space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-mono font-black text-sm text-[var(--text-primary)] block">
                      {stk.symbol}
                    </span>
                    <span className="text-[11px] text-[var(--text-muted)] truncate block max-w-[130px]">
                      {stk.name}
                    </span>
                  </div>
                  <span className="text-[10px] font-semibold text-[var(--text-muted)] bg-[var(--bg-input)] px-2 py-0.5 rounded-full">
                    {stk.sector}
                  </span>
                </div>

                <div className="flex items-baseline justify-between pt-2 border-t border-[var(--border-subtle)] font-mono">
                  <span className="text-sm font-bold text-[var(--text-primary)]">
                    ₹{stk.price.toLocaleString()}
                  </span>
                  <span className={`text-xs font-bold flex items-center gap-0.5 ${
                    isGain ? 'text-[#00E676]' : 'text-[#FF5252]'
                  }`}>
                    {isGain ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                    {isGain ? `+${stk.change_pct}%` : `${stk.change_pct}%`}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

    </div>
  );
}
