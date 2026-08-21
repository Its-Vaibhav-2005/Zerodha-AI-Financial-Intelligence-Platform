import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Layers, 
  Activity, 
  RotateCcw, 
  ChevronDown, 
  ChevronUp, 
  Sparkles, 
  CheckCircle2, 
  Info,
  Clock
} from 'lucide-react';

const CATEGORY_ICONS = {
  "Risk Attention": <ShieldAlert className="w-5 h-5 text-[#FF5252]" />,
  "Diversification Review": <Layers className="w-5 h-5 text-[#00E676]" />,
  "Watchlist & Catalyst Monitoring": <Activity className="w-5 h-5 text-[#3B82F6]" />,
  "Portfolio Rebalancing Follow-up": <RotateCcw className="w-5 h-5 text-[#8B5CF6]" />
};

const CATEGORY_BADGES = {
  "Risk Attention": "pill-red text-[#FF5252] bg-[#FF5252]/10 border-[#FF5252]/30",
  "Diversification Review": "pill-green text-[#00E676] bg-[#00E676]/10 border-[#00E676]/30",
  "Watchlist & Catalyst Monitoring": "pill-blue text-[#3B82F6] bg-[#3B82F6]/10 border-[#3B82F6]/30",
  "Portfolio Rebalancing Follow-up": "pill-purple text-[#8B5CF6] bg-[#8B5CF6]/10 border-[#8B5CF6]/30"
};

export default function ExplainableRecommendationCards({ cards = [] }) {
  const [expandedCardId, setExpandedCardId] = useState(cards[0]?.id || 'REC-01');

  if (!cards || cards.length === 0) {
    return null;
  }

  const toggleExpand = (id) => {
    setExpandedCardId(prev => (prev === id ? null : id));
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#8B5CF6]/15 flex items-center justify-center text-[#8B5CF6]">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-[var(--text-primary)]">
              Explainable Recommendation Console
            </h3>
            <p className="text-xs text-[var(--text-muted)]">
              Governed, non-execution decision support cards with data-backed rationale
            </p>
          </div>
        </div>
        <span className="text-[11px] font-mono text-[var(--text-muted)] bg-[var(--bg-input)] px-2.5 py-1 rounded-lg border border-[var(--border-subtle)]">
          {cards.length} Categorized Insights
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {cards.map((card) => {
          const isExpanded = expandedCardId === card.id;
          const confidencePct = Math.round((card.confidence || 0.95) * 100);
          const icon = CATEGORY_ICONS[card.category] || <Info className="w-5 h-5 text-[#8B5CF6]" />;
          const badgeClass = CATEGORY_BADGES[card.category] || "pill-purple";

          return (
            <div 
              key={card.id}
              className={`surface-card rounded-2xl border transition-all duration-200 ${
                isExpanded 
                  ? 'border-[#8B5CF6]/50 shadow-md ring-1 ring-[#8B5CF6]/20' 
                  : 'border-[var(--border-subtle)] hover:border-[var(--border-subtle)]/80'
              }`}
            >
              {/* Card Header */}
              <div 
                className="p-4 cursor-pointer flex items-start justify-between gap-3"
                onClick={() => toggleExpand(card.id)}
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-[var(--bg-base)] border border-[var(--border-subtle)] mt-0.5 shrink-0">
                    {icon}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${badgeClass}`}>
                        {card.category}
                      </span>
                      <span className="text-[11px] font-mono text-[var(--text-muted)]">
                        {card.id}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-[var(--text-primary)] leading-snug">
                      {card.title}
                    </h4>
                    <p className="text-xs text-[var(--text-secondary)] line-clamp-1 font-medium">
                      {card.signal}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[11px] font-mono font-bold text-[#00E676] bg-[#00E676]/10 px-2 py-0.5 rounded-md border border-[#00E676]/20 hidden sm:inline-block">
                    {confidencePct}% Conf.
                  </span>
                  <button className="text-[var(--text-muted)] p-1 hover:text-[var(--text-primary)]">
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Collapsible Deep Details */}
              {isExpanded && (
                <div className="px-4 pb-4 pt-2 border-t border-[var(--border-subtle)] space-y-3 text-xs animate-fadeIn">
                  {/* Rationale */}
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] block mb-1">
                      Data-Backed Rationale
                    </span>
                    <p className="text-[var(--text-secondary)] leading-relaxed bg-[var(--bg-base)] p-3 rounded-xl border border-[var(--border-subtle)]">
                      {card.rationale}
                    </p>
                  </div>

                  {/* Supporting Metrics */}
                  {card.supporting_metrics && card.supporting_metrics.length > 0 && (
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] block mb-1.5">
                        Supporting Analytical Signals
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {card.supporting_metrics.map((m, idx) => (
                          <span 
                            key={idx}
                            className="bg-[var(--bg-input)] border border-[var(--border-subtle)] px-2.5 py-1 rounded-lg text-[11px] font-mono text-[var(--text-primary)]"
                          >
                            {m}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Suggested Non-Execution Review Action */}
                  <div className="bg-[#00E676]/10 border border-[#00E676]/30 p-3 rounded-xl flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#00E676] shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#00E676] block mb-0.5">
                        Next-Best Review Step
                      </span>
                      <p className="text-[11px] font-semibold text-[var(--text-primary)]">
                        {card.suggested_review_action}
                      </p>
                    </div>
                  </div>

                  {/* Disclaimer & Freshness Footer */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[10px] text-[var(--text-muted)] pt-1">
                    <span className="italic">
                      {card.disclaimer || "Educational risk analysis only; not SEBI-registered individualized advice."}
                    </span>
                    <span className="flex items-center gap-1 font-mono shrink-0">
                      <Clock className="w-3 h-3" />
                      Live Governed Output
                    </span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
