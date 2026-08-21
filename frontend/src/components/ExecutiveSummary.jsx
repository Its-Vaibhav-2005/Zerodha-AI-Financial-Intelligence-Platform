import React from 'react';
import { TrendingUp, TrendingDown, User, ShieldAlert, Sparkles, Wallet, PieChart, Activity } from 'lucide-react';

export default function ExecutiveSummary({ insights, metadata, summary }) {
  // Extract executive summary from insights payload or top-level
  const execSummaryText = insights?.executive_summary || insights?.insights?.executive_summary || "Portfolio analysis ready.";
  
  // Extract numerical metrics
  const investorName = metadata?.investor_name || "Vaibhav Pandey";
  const portfolioId = metadata?.portfolio_id || "PORT-1001";
  const riskProfile = metadata?.risk_profile || "Aggressive Growth";

  const totalInvested = summary?.total_invested ?? 450000;
  const totalCurrentValue = summary?.total_current_value ?? 582400;
  const totalPnl = summary?.total_pnl ?? (totalCurrentValue - totalInvested);
  const pnlPct = summary?.pnl_pct ?? (totalInvested ? ((totalPnl / totalInvested) * 100).toFixed(2) : 0);

  const isPositivePnl = totalPnl >= 0;

  const formatINR = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    }).format(val);
  };

  return (
    <section className="surface-card p-6 md:p-8 rounded-3xl space-y-6 shadow-xl relative overflow-hidden">
      {/* Top Accent Strip matching design system image */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#00E676] via-[#8B5CF6] to-[#3B82F6]" />

      {/* Header & Investor Metadata */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-[var(--border-subtle)] pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold tracking-wider text-[#3B82F6] uppercase mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Investor Portfolio Intelligence Hub</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-[var(--text-primary)] tracking-tight flex items-center gap-3">
            <span>Portfolio Overview</span>
            <span className="pill-badge pill-purple text-xs font-mono">
              {portfolioId}
            </span>
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="pill-badge pill-blue">
            <User className="w-3.5 h-3.5 text-[#3B82F6]" />
            <span className="text-[var(--text-muted)]">Investor:</span>
            <span className="font-semibold text-[var(--text-primary)]">{investorName}</span>
          </div>
          <div className="pill-badge pill-purple">
            <ShieldAlert className="w-3.5 h-3.5 text-[#8B5CF6]" />
            <span className="opacity-80">Risk:</span>
            <span className="font-semibold">{riskProfile}</span>
          </div>
        </div>
      </div>

      {/* AI Plain Language Executive Summary */}
      <div className="bg-[var(--bg-base)] border border-[#8B5CF6]/30 rounded-2xl p-5 relative">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-[#8B5CF6]/15 border border-[#8B5CF6]/30 flex items-center justify-center shrink-0 text-[#A78BFA] mt-0.5">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <div className="text-xs font-bold text-[#A78BFA] tracking-wide uppercase flex items-center gap-2">
              <span>Executive AI Health Summary</span>
              <span className="w-2 h-2 rounded-full bg-[#00E676] animate-ping" />
            </div>
            <p className="text-sm md:text-base text-[var(--text-secondary)] leading-relaxed font-normal">
              {execSummaryText}
            </p>
          </div>
        </div>
      </div>

      {/* Key Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Invested */}
        <div className="bg-[var(--bg-base)] p-4 rounded-2xl border border-[var(--border-subtle)] space-y-1">
          <div className="flex items-center justify-between text-xs text-[var(--text-muted)] font-medium">
            <span>Total Invested</span>
            <Wallet className="w-4 h-4 text-[var(--text-muted)]" />
          </div>
          <div className="text-xl md:text-2xl font-black text-[var(--text-primary)] font-mono">
            {formatINR(totalInvested)}
          </div>
          <div className="text-[11px] text-[var(--text-muted)]">Initial Capital Outlay</div>
        </div>

        {/* Current Portfolio Value */}
        <div className="bg-[var(--bg-base)] p-4 rounded-2xl border border-[var(--border-subtle)] space-y-1">
          <div className="flex items-center justify-between text-xs text-[var(--text-muted)] font-medium">
            <span>Current Value</span>
            <PieChart className="w-4 h-4 text-[#3B82F6]" />
          </div>
          <div className="text-xl md:text-2xl font-black text-[var(--text-primary)] font-mono">
            {formatINR(totalCurrentValue)}
          </div>
          <div className="text-[11px] text-[#3B82F6] font-medium">Real-time valuation</div>
        </div>

        {/* Total Net P&L */}
        <div className="bg-[var(--bg-base)] p-4 rounded-2xl border border-[var(--border-subtle)] space-y-1">
          <div className="flex items-center justify-between text-xs text-[var(--text-muted)] font-medium">
            <span>Net P&L</span>
            {isPositivePnl ? (
              <TrendingUp className="w-4 h-4 text-[#00E676]" />
            ) : (
              <TrendingDown className="w-4 h-4 text-[#FF5252]" />
            )}
          </div>
          <div className={`text-xl md:text-2xl font-black font-mono ${isPositivePnl ? 'text-[#00E676]' : 'text-[#FF5252]'}`}>
            {isPositivePnl ? '+' : ''}{formatINR(totalPnl)}
          </div>
          <div className="text-[11px] text-[var(--text-muted)]">Unrealized Net P&L</div>
        </div>

        {/* Return Percentage */}
        <div className="bg-[var(--bg-base)] p-4 rounded-2xl border border-[var(--border-subtle)] space-y-1">
          <div className="flex items-center justify-between text-xs text-[var(--text-muted)] font-medium">
            <span>Return (P&L %)</span>
            <Activity className="w-4 h-4 text-[#8B5CF6]" />
          </div>
          <div className={`text-xl md:text-2xl font-black font-mono ${isPositivePnl ? 'text-[#00E676]' : 'text-[#FF5252]'}`}>
            {isPositivePnl ? '+' : ''}{pnlPct}%
          </div>
          <div className="text-[11px] text-[var(--text-muted)]">Cumulative Return</div>
        </div>
      </div>
    </section>
  );
}
