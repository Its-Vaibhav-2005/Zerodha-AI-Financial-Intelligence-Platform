import React from 'react';
import { TrendingUp, TrendingDown, Target, Award, Sparkles } from 'lucide-react';

const BENCHMARK_MAP = {
  '^NSEI': 'NIFTY 50',
  '^BSESN': 'BSE SENSEX',
  '^NSEBANK': 'NIFTY BANK',
};

export default function RelativePerformanceCard({ analytics, benchmark = '^NSEI', summary }) {
  const benchmarkName = BENCHMARK_MAP[benchmark] || benchmark;
  
  // Extract or calculate portfolio P&L % and benchmark return
  const portfolioReturn = summary?.pnl_pct ?? analytics?.portfolio_metrics?.pnl_pct ?? 29.42;
  const benchmarkReturn = analytics?.benchmark_metrics?.benchmark_return_pct ?? 14.80;
  const relativeAlpha = analytics?.benchmark_metrics?.alpha_vs_benchmark ?? (portfolioReturn - benchmarkReturn);

  const isOutperforming = relativeAlpha >= 0;

  return (
    <div className="surface-card p-4 md:p-5 surface-card-hover border-l-4 border-l-[#3B82F6]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        
        {/* Metric Label & Benchmark Indicator */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="pill-badge pill-blue">
              <Target className="w-3.5 h-3.5" />
              Dynamic Benchmark Active
            </span>
            <span className="text-xs font-mono font-bold text-[var(--text-primary)]">
              {benchmarkName}
            </span>
          </div>
          <h4 className="text-sm font-extrabold text-[var(--text-primary)]">
            Relative Outperformance Alpha
          </h4>
        </div>

        {/* Relative Metric Card Pill */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="flex items-center justify-end gap-1.5 font-black text-lg">
              {isOutperforming ? (
                <>
                  <TrendingUp className="w-5 h-5 text-[#00E676]" />
                  <span className="text-[#00E676]">
                    +{relativeAlpha.toFixed(2)}%
                  </span>
                </>
              ) : (
                <>
                  <TrendingDown className="w-5 h-5 text-[#FF5252]" />
                  <span className="text-[#FF5252]">
                    {relativeAlpha.toFixed(2)}%
                  </span>
                </>
              )}
              <span className="text-xs font-semibold text-[var(--text-muted)] font-mono">
                vs {benchmarkName}
              </span>
            </div>
            <p className="text-[11px] text-[var(--text-muted)] font-mono">
              Portfolio {portfolioReturn >= 0 ? `+${portfolioReturn.toFixed(2)}%` : `${portfolioReturn.toFixed(2)}%`} | Index {benchmarkReturn >= 0 ? `+${benchmarkReturn.toFixed(2)}%` : `${benchmarkReturn.toFixed(2)}%`}
            </p>
          </div>

          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center border ${
            isOutperforming
              ? 'bg-[#00E676]/10 border-[#00E676]/30 text-[#00E676]'
              : 'bg-[#FF5252]/10 border-[#FF5252]/30 text-[#FF5252]'
          }`}>
            {isOutperforming ? <Award className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
          </div>
        </div>

      </div>
    </div>
  );
}
