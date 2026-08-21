import React, { useState } from 'react';
import { ArrowUpRight, ArrowDownRight, ChevronDown, ChevronUp, Newspaper, HelpCircle } from 'lucide-react';

export default function PerformanceDriverCard({ driver, newsData }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const rawSymbol = driver?.symbol || "STOCK";
  // Clean raw symbol (e.g. TCS.NS -> TCS)
  const cleanSymbol = rawSymbol.replace(/\.NS$/i, '');
  const tickerAvatar = cleanSymbol.slice(0, 3).toUpperCase();
  
  const impact = (driver?.impact || "POSITIVE").toUpperCase();
  const explanation = driver?.explanation || "Contributed to portfolio movement based on recent P&L and market trends.";
  const isPositive = impact === "POSITIVE" || impact === "BULLISH";

  // Check if there is specific ticker news in newsData
  const stockNews = newsData?.[rawSymbol] || newsData?.[cleanSymbol] || [];

  return (
    <div className="surface-card surface-card-hover p-5 rounded-3xl flex flex-col justify-between space-y-4 shadow-sm border border-[var(--border-subtle)]">
      {/* Top Header Row */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          {/* Avatar Icon Box */}
          <div className="w-11 h-11 rounded-2xl bg-[#3B82F6]/15 border border-[#3B82F6]/30 flex items-center justify-center font-black text-[#3B82F6] font-mono text-xs tracking-wider shrink-0 overflow-hidden shadow-inner">
            {tickerAvatar}
          </div>
          
          <div className="min-w-0">
            <div className="flex items-baseline gap-1.5">
              <span className="text-base font-black text-[var(--text-primary)] font-mono tracking-tight truncate">
                {cleanSymbol}
              </span>
              {rawSymbol.includes('.NS') && (
                <span className="text-[10px] text-[var(--text-muted)] font-mono font-medium">
                  NSE
                </span>
              )}
            </div>
            <div className="text-[11px] text-[var(--text-muted)] truncate">Performance Driver</div>
          </div>
        </div>

        {/* Impact Badge */}
        <div 
          className={`pill-badge shrink-0 font-mono ${
            isPositive 
              ? 'pill-green' 
              : 'pill-red'
          }`}
        >
          {isPositive ? (
            <>
              <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>POSITIVE</span>
            </>
          ) : (
            <>
              <ArrowDownRight className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>NEGATIVE</span>
            </>
          )}
        </div>
      </div>

      {/* Primary Movement Explanation */}
      <div className="text-xs md:text-sm text-[var(--text-secondary)] leading-relaxed font-normal">
        {explanation}
      </div>

      {/* Expand / Collapse Rationale Button */}
      <div className="pt-3 border-t border-[var(--border-subtle)]">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between text-xs font-semibold text-[#8B5CF6] hover:text-[#A78BFA] py-1 transition-all cursor-pointer group"
        >
          <span className="flex items-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>{isExpanded ? 'Hide AI Rationale' : 'Read AI Rationale & News Context'}</span>
          </span>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" />
          ) : (
            <ChevronDown className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
          )}
        </button>

        {/* Collapsible Rationale Drawer */}
        {isExpanded && (
          <div className="mt-3 p-4 bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded-2xl space-y-3 text-xs text-[var(--text-secondary)] animate-fadeIn">
            <div className="space-y-1">
              <span className="font-bold text-[#8B5CF6] block text-[11px] uppercase tracking-wider">
                Detailed AI Attribution Rationale
              </span>
              <p className="text-[var(--text-secondary)] leading-relaxed">
                {explanation} The movement in <span className="font-mono font-bold text-[var(--text-primary)]">{cleanSymbol}</span> directly impacted portfolio return. Gemini AI evaluated position sizing alongside price volatility and macro context.
              </p>
            </div>

            {stockNews.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-[var(--border-subtle)]">
                <span className="font-semibold text-[var(--text-muted)] flex items-center gap-1.5 text-[11px]">
                  <Newspaper className="w-3.5 h-3.5 text-[#3B82F6]" />
                  Headlines for {cleanSymbol}:
                </span>
                <ul className="space-y-1 pl-2 border-l-2 border-[#3B82F6]/40">
                  {stockNews.map((news, idx) => (
                    <li key={idx} className="text-[11px] text-[var(--text-secondary)]">
                      • {typeof news === 'string' ? news : news.headline || news.title || JSON.stringify(news)}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
