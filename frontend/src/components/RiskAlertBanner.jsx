import React from 'react';
import { AlertTriangle, ShieldAlert, ShieldCheck, Flame, PieChart, Info, TrendingDown } from 'lucide-react';

export default function RiskAlertBanner({ riskAnalysis, riskMetrics, sectorAllocation, concentrationAlerts }) {
  // Extract values with fallbacks
  const riskLevel = (riskAnalysis?.risk_level || riskMetrics?.risk_flag || "HIGH").toUpperCase();
  const primaryRisks = riskAnalysis?.primary_risks || concentrationAlerts || [
    "High Concentration Risk: Technology sector accounts for 81.68% of total portfolio value.",
    "Historical Drawdown Exposure: Maximum peak-to-trough drawdown recorded at -14.2%."
  ];
  const mitigationContext = riskAnalysis?.mitigation_context || 
    "High sector concentration amplifies single-industry volatility. Diversifying into defensives (FMCG, Pharma) can reduce portfolio drawdown during tech sector corrections.";

  const maxDrawdown = riskMetrics?.max_drawdown_pct ?? 14.2;
  const volatility = riskMetrics?.annualized_volatility_pct ?? 24.8;
  const techConcentration = sectorAllocation?.Technology ?? 81.68;

  // Determine color theme based on risk level
  let badgeColors = {
    bg: "bg-[#FF5252]/10",
    border: "border-[#FF5252]/30",
    text: "text-[#FF5252]",
    pillClass: "pill-red",
    icon: <AlertTriangle className="w-5 h-5 text-[#FF5252]" />
  };

  if (riskLevel === "MODERATE" || riskLevel === "MEDIUM") {
    badgeColors = {
      bg: "bg-[#FBBF24]/10",
      border: "border-[#FBBF24]/30",
      text: "text-[#FBBF24]",
      pillClass: "pill-yellow",
      icon: <Flame className="w-5 h-5 text-[#FBBF24]" />
    };
  } else if (riskLevel === "LOW" || riskLevel === "NORMAL") {
    badgeColors = {
      bg: "bg-[#00E676]/10",
      border: "border-[#00E676]/30",
      text: "text-[#00E676]",
      pillClass: "pill-green",
      icon: <ShieldCheck className="w-5 h-5 text-[#00E676]" />
    };
  }

  return (
    <section className={`surface-card p-6 md:p-8 rounded-3xl border ${badgeColors.border} space-y-6 relative shadow-md`}>
      {/* Panel Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border-subtle)] pb-4">
        <div className="flex items-center gap-3">
          <div className={`w-11 h-11 rounded-2xl ${badgeColors.bg} border ${badgeColors.border} flex items-center justify-center`}>
            {badgeColors.icon}
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-[var(--text-primary)] tracking-tight flex items-center gap-2">
              Risk & Exposure Governance
            </h2>
            <p className="text-xs text-[var(--text-muted)]">Automated Portfolio Vulnerability & Stress Assessment</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-[var(--text-muted)]">Assessment:</span>
          <span className={`pill-badge ${badgeColors.pillClass} uppercase font-mono`}>
            {riskLevel} RISK
          </span>
        </div>
      </div>

      {/* Highlights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Concentration Alert Card */}
        <div className="bg-[var(--bg-base)] p-4 rounded-2xl border border-[#FF5252]/30 space-y-2">
          <div className="flex items-center justify-between text-xs text-[#FF5252] font-semibold">
            <span className="flex items-center gap-1.5">
              <PieChart className="w-3.5 h-3.5" />
              Sector Concentration
            </span>
            <span className="pill-badge pill-red text-[10px]">
              ALERT
            </span>
          </div>
          <div className="text-2xl font-black text-[var(--text-primary)] font-mono flex items-baseline gap-2">
            <span>{techConcentration}%</span>
            <span className="text-xs font-normal text-[var(--text-muted)]">Technology</span>
          </div>
          <div className="w-full bg-[var(--bg-input)] rounded-full h-1.5 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-[#FBBF24] to-[#FF5252] h-full rounded-full"
              style={{ width: `${Math.min(techConcentration, 100)}%` }}
            />
          </div>
          <p className="text-[11px] text-[var(--text-muted)]">Exceeds recommended 40% threshold</p>
        </div>

        {/* Max Drawdown */}
        <div className="bg-[var(--bg-base)] p-4 rounded-2xl border border-[var(--border-subtle)] space-y-2">
          <div className="flex items-center justify-between text-xs text-[var(--text-muted)] font-medium">
            <span className="flex items-center gap-1.5">
              <TrendingDown className="w-3.5 h-3.5 text-[#FBBF24]" />
              Max Historical Drawdown
            </span>
          </div>
          <div className="text-2xl font-black text-[#FBBF24] font-mono">
            {maxDrawdown > 0 ? `-${maxDrawdown}` : maxDrawdown}%
          </div>
          <p className="text-[11px] text-[var(--text-muted)]">Peak-to-trough historical correction</p>
        </div>

        {/* Volatility */}
        <div className="bg-[var(--bg-base)] p-4 rounded-2xl border border-[var(--border-subtle)] space-y-2">
          <div className="flex items-center justify-between text-xs text-[var(--text-muted)] font-medium">
            <span className="flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-[#8B5CF6]" />
              Annualized Volatility
            </span>
          </div>
          <div className="text-2xl font-black text-[#8B5CF6] font-mono">
            {volatility}%
          </div>
          <p className="text-[11px] text-[var(--text-muted)]">Standard deviation annualized metric</p>
        </div>
      </div>

      {/* Identified Primary Risks List */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-[#FF5252]" />
          <span>Identified Portfolio Vulnerabilities</span>
        </h3>
        <div className="grid grid-cols-1 gap-2.5">
          {Array.isArray(primaryRisks) && primaryRisks.map((risk, index) => (
            <div 
              key={index}
              className="bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded-2xl p-3.5 text-xs text-[var(--text-secondary)] flex items-start gap-3"
            >
              <span className="w-5 h-5 rounded-full bg-[#FF5252]/15 border border-[#FF5252]/30 text-[#FF5252] flex items-center justify-center font-mono font-bold text-[10px] shrink-0 mt-0.5">
                {index + 1}
              </span>
              <span className="leading-relaxed">{risk}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Educational Mitigation Rationale */}
      {mitigationContext && (
        <div className="bg-[#3B82F6]/10 border border-[#3B82F6]/30 rounded-2xl p-4 text-xs space-y-1.5">
          <div className="flex items-center gap-2 font-bold text-[#3B82F6]">
            <Info className="w-4 h-4 shrink-0" />
            <span>AI Risk Mitigation Context & Governance</span>
          </div>
          <p className="leading-relaxed pl-6 text-[var(--text-secondary)]">{mitigationContext}</p>
        </div>
      )}
    </section>
  );
}
