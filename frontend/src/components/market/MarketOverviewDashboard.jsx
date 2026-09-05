import React, { useState, useEffect } from 'react';
import MarketCandlesChart from './MarketCandlesChart';
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart2, 
  Sparkles, 
  ShieldCheck, 
  LogIn, 
  Zap, 
  Activity, 
  ArrowUpRight, 
  ArrowDownRight,
  Layers
} from 'lucide-react';
import { API_BASE_URL } from '../../config/api';

const MOCK_MARKET_FALLBACK = {
  indices: [
    { symbol: "^NSEI", name: "NIFTY 50", category: "NSE Benchmark", price: 22485.60, change: 142.30, change_pct: 0.64, high_52w: 23110.00, low_52w: 19120.00, day_high: 22530.40, day_low: 22350.10 },
    { symbol: "^BSESN", name: "BSE SENSEX", category: "BSE Benchmark", price: 74120.40, change: 410.80, change_pct: 0.56, high_52w: 75900.00, low_52w: 62800.00, day_high: 74280.00, day_low: 73700.00 },
    { symbol: "^NSEBANK", name: "NIFTY BANK", category: "Banking Sector", price: 47850.25, change: -115.40, change_pct: -0.24, high_52w: 49250.00, low_52w: 42100.00, day_high: 48100.00, day_low: 47650.00 },
    { symbol: "^CNXIT", name: "NIFTY IT", category: "Technology Sector", price: 36940.10, change: 580.20, change_pct: 1.60, high_52w: 39100.00, low_52w: 28400.00, day_high: 37120.00, day_low: 36450.00 }
  ],
  top_movers: [
    { symbol: "RELIANCE", name: "Reliance Industries", price: 2980.50, change_pct: 1.85, type: "gainer", sector: "Energy" },
    { symbol: "TCS", name: "Tata Consultancy Services", price: 4120.00, change_pct: 2.40, type: "gainer", sector: "Technology" },
    { symbol: "INFY", name: "Infosys Ltd", price: 1640.20, change_pct: 1.92, type: "gainer", sector: "Technology" },
    { symbol: "HDFCBANK", name: "HDFC Bank Ltd", price: 1450.00, change_pct: -0.65, type: "loser", sector: "Financials" },
    { symbol: "ICICIBANK", name: "ICICI Bank Ltd", price: 1085.30, change_pct: 0.45, type: "gainer", sector: "Financials" },
    { symbol: "TATAMOTORS", name: "Tata Motors Ltd", price: 975.80, change_pct: 3.10, type: "gainer", sector: "Automobile" },
    { symbol: "PAYTM", name: "One97 Communications", price: 410.20, change_pct: -2.15, type: "loser", sector: "Fintech" },
    { symbol: "ITC", name: "ITC Limited", price: 435.50, change_pct: 0.80, type: "gainer", sector: "Consumer Goods" }
  ]
};

export default function MarketOverviewDashboard({ onOpenAuthModal = () => {} }) {
  const [selectedSymbol, setSelectedSymbol] = useState('^NSEI');
  const [period, setPeriod] = useState('1mo');
  const [marketData, setMarketData] = useState(MOCK_MARKET_FALLBACK);
  const [candles, setCandles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

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
      } else {
        throw new Error("Market fetch failed");
      }
    } catch (err) {
      console.warn("[Market Overview Fetch Warning]:", err);
      // Use fallback
      setMarketData(MOCK_MARKET_FALLBACK);
      generateFallbackCandles();
    } finally {
      setIsLoading(false);
    }
  };

  const generateFallbackCandles = () => {
    const baseP = selectedSymbol === '^BSESN' ? 74120 : (selectedSymbol === '^NSEBANK' ? 47850 : (selectedSymbol === '^CNXIT' ? 36940 : 22485));
    const generated = [];
    const today = new Date();
    const count = period === '1mo' ? 22 : (period === '3mo' ? 65 : (period === '1y' ? 240 : 10));
    
    for (let i = count; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      if (d.getDay() === 0 || d.getDay() === 6) continue;
      
      const dateStr = d.toISOString().split('T')[0];
      const factor = Math.sin(i * 0.4) * (baseP * 0.015) + ((i * 37) % 80 - 40);
      const close = Math.round((baseP + factor) * 100) / 100;
      const open = Math.round((close - ((i * 19) % 60 - 30)) * 100) / 100;
      const high = Math.round((Math.max(open, close) + Math.abs((i * 13) % 40)) * 100) / 100;
      const low = Math.round((Math.min(open, close) - Math.abs((i * 17) % 40)) * 100) / 100;
      const volume = Math.floor(1200000 + (i * 54321) % 2000000);

      generated.push({ date: dateStr, open, high, low, close, volume });
    }
    setCandles(generated);
  };

  useEffect(() => {
    fetchMarketData();
  }, [selectedSymbol, period]);

  const activeIndexObj = marketData.indices.find(i => i.symbol === selectedSymbol) || marketData.indices[0];

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-6 md:py-8 space-y-8 animate-fadeIn">
      
      {/* Top Welcome & Market Live Status */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-[var(--bg-surface)] via-[var(--bg-surface)] to-[var(--bg-input)] p-6 rounded-3xl border border-[var(--border-subtle)] shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-[#3B82F6]/10 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="space-y-1.5 max-w-2xl relative z-10">
          <div className="flex items-center gap-2">
            <span className="pill-badge pill-green">
              <Zap className="w-3.5 h-3.5 text-[#00E676]" />
              Live Market Feed Active
            </span>
            <span className="pill-badge pill-purple">
              <Sparkles className="w-3.5 h-3.5" />
              Indian Benchmarks
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-[var(--text-primary)]">
            Market Intelligence Overview
          </h1>
          <p className="text-xs md:text-sm text-[var(--text-muted)] font-medium">
            Track real-time market indices, candlestick patterns, and top Indian market movers. Sign in to access your personal AI portfolio analytics.
          </p>
        </div>

        <button
          onClick={onOpenAuthModal}
          className="btn-primary px-6 py-3 text-sm font-extrabold flex items-center justify-center gap-2 cursor-pointer shadow-lg hover:scale-[1.02] transition-transform self-start md:self-center shrink-0"
        >
          <LogIn className="w-4 h-4" />
          <span>Sign In to View Portfolio</span>
        </button>
      </div>

      {/* 1. Market Indices Cards Grid */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-[#3B82F6]" />
            <h2 className="text-lg font-extrabold text-[var(--text-primary)] tracking-tight">
              Indian Market Indices
            </h2>
          </div>
          <span className="text-xs text-[var(--text-muted)] font-mono">
            Click index card to view candle chart
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {marketData.indices.map((idx) => {
            const isSelected = idx.symbol === selectedSymbol;
            const isBullish = idx.change >= 0;

            // 52W range calculation
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

                {/* 52-Week Range Slider Visual */}
                <div className="space-y-1 pt-2 border-t border-[var(--border-subtle)]">
                  <div className="flex justify-between text-[10px] text-[var(--text-muted)] font-mono">
                    <span>52W L: ₹{Math.round(low52).toLocaleString()}</span>
                    <span>52W H: ₹{Math.round(high52).toLocaleString()}</span>
                  </div>
                  <div className="w-full h-1.5 bg-[var(--bg-input)] rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-[#3B82F6] to-[#00E676] rounded-full transition-all duration-500"
                      style={{ width: `${pctPos}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 2. Interactive Market Candlestick Chart */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-[#8B5CF6]" />
            <h2 className="text-lg font-extrabold text-[var(--text-primary)] tracking-tight">
              Market Candlestick Analysis ({activeIndexObj?.name})
            </h2>
          </div>
          
          {/* Index Quick Selection Tabs */}
          <div className="hidden sm:flex items-center gap-1.5 bg-[var(--bg-input)] p-1 rounded-2xl border border-[var(--border-subtle)]">
            {marketData.indices.map((idx) => (
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

      {/* 3. Top Market Movers */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-[#00E676]" />
            <h2 className="text-lg font-extrabold text-[var(--text-primary)] tracking-tight">
              Top Market Movers & Sector Trends
            </h2>
          </div>
          <span className="pill-badge pill-blue">
            {marketData.top_movers.length} Active Movers
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {marketData.top_movers.map((stk) => {
            const isGain = stk.change_pct >= 0;
            return (
              <div 
                key={stk.symbol} 
                className="surface-card surface-card-hover p-4 border border-[var(--border-subtle)] space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-extrabold text-sm text-[var(--text-primary)] block font-mono">
                      {stk.symbol}
                    </span>
                    <span className="text-[11px] text-[var(--text-muted)] truncate block max-w-[140px]">
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

      {/* 4. Auth Call-to-Action Hero Footer Banner */}
      <div className="surface-card p-6 md:p-8 bg-gradient-to-br from-[var(--bg-surface)] via-[var(--bg-input)] to-[#8B5CF6]/10 border border-[#8B5CF6]/30 text-center space-y-4 rounded-3xl shadow-2xl">
        <div className="inline-flex p-3 rounded-2xl bg-[#8B5CF6]/20 text-[#8B5CF6] mb-1">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h3 className="text-xl md:text-2xl font-black text-[var(--text-primary)] tracking-tight">
          Unlock Personal AI Portfolio Intelligence & Risk Governance
        </h3>
        <p className="text-xs md:text-sm text-[var(--text-muted)] max-w-xl mx-auto">
          Connect your Zerodha Kite account or upload your holdings CSV to generate executive health summaries, portfolio attribution analysis, sector risk alerts, and yfinance benchmark benchmarking.
        </p>
        <div className="pt-2">
          <button
            onClick={onOpenAuthModal}
            className="btn-primary px-8 py-3 text-sm font-extrabold inline-flex items-center gap-2 cursor-pointer shadow-lg hover:scale-105 transition-transform"
          >
            <LogIn className="w-4 h-4" />
            <span>Sign In / Register Now</span>
          </button>
        </div>
      </div>
    </div>
  );
}
