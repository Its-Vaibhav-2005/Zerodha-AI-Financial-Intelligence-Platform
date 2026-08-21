import React, { useState } from 'react';
import { TrendingUp, TrendingDown, BarChart2, Calendar, Info } from 'lucide-react';

export default function MarketCandlesChart({ 
  candles = [], 
  selectedSymbol = "^NSEI", 
  symbolName = "NIFTY 50",
  period = "1mo",
  onPeriodChange = () => {},
  onSymbolChange = () => {}
}) {
  const [hoveredCandle, setHoveredCandle] = useState(null);

  if (!candles || candles.length === 0) {
    return (
      <div className="surface-card p-6 text-center text-xs text-[var(--text-muted)] animate-pulse">
        Loading Candlestick Data...
      </div>
    );
  }

  // Calculate SVG Dimensions & Scales
  const width = 800;
  const height = 340;
  const padding = { top: 20, right: 60, bottom: 40, left: 10 };

  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  // Extract Min and Max values for prices and volumes
  const minPrice = Math.min(...candles.map(c => c.low));
  const maxPrice = Math.max(...candles.map(c => c.high));
  const maxVolume = Math.max(...candles.map(c => c.volume || 1));

  const priceRange = (maxPrice - minPrice) || 1;

  // Coordinate mapping functions
  const getX = (index) => {
    if (candles.length <= 1) return padding.left + chartWidth / 2;
    return padding.left + (index / (candles.length - 1)) * chartWidth;
  };

  const getY = (price) => {
    return padding.top + chartHeight - ((price - minPrice) / priceRange) * chartHeight;
  };

  const getVolY = (vol) => {
    const volHeight = (vol / maxVolume) * (chartHeight * 0.25);
    return padding.top + chartHeight - volHeight;
  };

  // Candle width based on count
  const candleWidth = Math.max(2, Math.min(18, (chartWidth / candles.length) * 0.65));

  // Determine Overall Trend
  const firstCandle = candles[0];
  const lastCandle = candles[candles.length - 1];
  const priceDiff = lastCandle.close - firstCandle.open;
  const isOverallBullish = priceDiff >= 0;

  const displayCandle = hoveredCandle || lastCandle;

  return (
    <div className="surface-card p-5 md:p-6 space-y-5 border border-[var(--border-subtle)] shadow-xl relative">
      {/* Header controls & Summary info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--border-subtle)] pb-4">
        
        {/* Left: Index selector pills & Current Price */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-extrabold text-lg md:text-xl text-[var(--text-primary)] tracking-tight">
              {symbolName}
            </span>
            <span className="font-mono text-xs text-[var(--text-muted)] bg-[var(--bg-input)] px-2 py-0.5 rounded-md">
              {selectedSymbol}
            </span>
            <span className={`pill-badge ${isOverallBullish ? 'pill-green' : 'pill-red'}`}>
              {isOverallBullish ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
              {priceDiff >= 0 ? `+${priceDiff.toFixed(2)}` : priceDiff.toFixed(2)}
            </span>
          </div>

          <p className="text-xs text-[var(--text-muted)] flex items-center gap-1.5 font-mono">
            <span>High: ₹{maxPrice.toLocaleString()}</span>
            <span>•</span>
            <span>Low: ₹{minPrice.toLocaleString()}</span>
          </p>
        </div>

        {/* Right: Timeframe Selectors */}
        <div className="flex items-center gap-1 bg-[var(--bg-input)] p-1 rounded-xl border border-[var(--border-subtle)]">
          {['1d', '1wk', '1mo', '3mo', '1y'].map((p) => (
            <button
              key={p}
              onClick={() => onPeriodChange(p)}
              className={`px-3 py-1 text-xs font-bold font-mono rounded-lg transition-all cursor-pointer ${
                period === p
                  ? 'bg-[#3B82F6] text-white shadow-sm'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              {p.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Hover OHLC Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 bg-[var(--bg-input)]/60 p-3 rounded-xl border border-[var(--border-subtle)]/70 font-mono text-xs">
        <div>
          <span className="text-[var(--text-muted)] block text-[10px]">DATE</span>
          <span className="font-bold text-[var(--text-primary)]">{displayCandle.date}</span>
        </div>
        <div>
          <span className="text-[var(--text-muted)] block text-[10px]">OPEN</span>
          <span className="font-bold text-[var(--text-primary)]">₹{displayCandle.open?.toLocaleString()}</span>
        </div>
        <div>
          <span className="text-[var(--text-muted)] block text-[10px]">HIGH</span>
          <span className="font-bold text-[#00E676]">₹{displayCandle.high?.toLocaleString()}</span>
        </div>
        <div>
          <span className="text-[var(--text-muted)] block text-[10px]">LOW</span>
          <span className="font-bold text-[#FF5252]">₹{displayCandle.low?.toLocaleString()}</span>
        </div>
        <div>
          <span className="text-[var(--text-muted)] block text-[10px]">CLOSE</span>
          <span className={`font-bold ${displayCandle.close >= displayCandle.open ? 'text-[#00E676]' : 'text-[#FF5252]'}`}>
            ₹{displayCandle.close?.toLocaleString()}
          </span>
        </div>
      </div>

      {/* SVG Candlestick Chart Render */}
      <div className="relative w-full overflow-hidden">
        <svg 
          viewBox={`0 0 ${width} ${height}`} 
          className="w-full h-auto overflow-visible select-none"
          onMouseLeave={() => setHoveredCandle(null)}
        >
          <defs>
            {/* Grid & Gradient definitions */}
            <linearGradient id="bullishGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#00E676" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#10B981" stopOpacity="0.3" />
            </linearGradient>
            <linearGradient id="bearishGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FF5252" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#DC2626" stopOpacity="0.3" />
            </linearGradient>
          </defs>

          {/* Horizontal Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
            const pVal = minPrice + ratio * priceRange;
            const yPos = getY(pVal);
            return (
              <g key={i}>
                <line 
                  x1={padding.left} 
                  y1={yPos} 
                  x2={width - padding.right} 
                  y2={yPos} 
                  stroke="var(--border-subtle)" 
                  strokeDasharray="4 4" 
                  strokeWidth="1"
                />
                <text 
                  x={width - padding.right + 8} 
                  y={yPos + 4} 
                  fill="var(--text-muted)" 
                  fontSize="10" 
                  fontFamily="monospace"
                >
                  ₹{Math.round(pVal)}
                </text>
              </g>
            );
          })}

          {/* Render Volume Bars & Candlesticks */}
          {candles.map((c, i) => {
            const x = getX(i);
            const openY = getY(c.open);
            const closeY = getY(c.close);
            const highY = getY(c.high);
            const lowY = getY(c.low);
            const isBullish = c.close >= c.open;

            const bodyTop = Math.min(openY, closeY);
            const bodyHeight = Math.max(2, Math.abs(closeY - openY));
            const volY = getVolY(c.volume || 1);
            const volHeight = padding.top + chartHeight - volY;

            return (
              <g 
                key={i} 
                className="cursor-pointer transition-opacity hover:opacity-100 opacity-90"
                onMouseEnter={() => setHoveredCandle(c)}
              >
                {/* Volume Bar */}
                <rect
                  x={x - candleWidth / 2}
                  y={volY}
                  width={candleWidth}
                  height={volHeight}
                  fill={isBullish ? 'rgba(0, 230, 118, 0.15)' : 'rgba(255, 82, 82, 0.15)'}
                />

                {/* Wick (Upper & Lower) */}
                <line
                  x1={x}
                  y1={highY}
                  x2={x}
                  y2={lowY}
                  stroke={isBullish ? '#00E676' : '#FF5252'}
                  strokeWidth="1.5"
                />

                {/* Real Body */}
                <rect
                  x={x - candleWidth / 2}
                  y={bodyTop}
                  width={candleWidth}
                  height={bodyHeight}
                  rx="1"
                  fill={isBullish ? '#00E676' : '#FF5252'}
                  stroke={isBullish ? '#00E676' : '#FF5252'}
                  strokeWidth="0.5"
                />

                {/* Active Hover Guide Line */}
                {hoveredCandle?.date === c.date && (
                  <line
                    x1={x}
                    y1={padding.top}
                    x2={x}
                    y2={padding.top + chartHeight}
                    stroke="#3B82F6"
                    strokeWidth="1"
                    strokeDasharray="2 2"
                  />
                )}
              </g>
            );
          })}
        </svg>
      </div>

      <div className="flex items-center justify-between text-[11px] text-[var(--text-muted)] font-mono pt-2 border-t border-[var(--border-subtle)]">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#00E676]"></span> Bullish Candle
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FF5252]"></span> Bearish Candle
          </span>
        </div>
        <span>Live yfinance Index Feed</span>
      </div>
    </div>
  );
}
