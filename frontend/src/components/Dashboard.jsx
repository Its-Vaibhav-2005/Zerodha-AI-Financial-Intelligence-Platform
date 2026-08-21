import React, { useState, useEffect } from 'react';
import ExecutiveSummary from './ExecutiveSummary';
import RiskAlertBanner from './RiskAlertBanner';
import PerformanceDriverCard from './PerformanceDriverCard';
import DebugAuditPanel from './DebugAuditPanel';
import SkeletonLoader from './SkeletonLoader';
import FallbackState from './FallbackState';
import RelativePerformanceCard from './RelativePerformanceCard';
import InsightFeedbackBar from './feedback/InsightFeedbackBar';
import ExplainableRecommendationCards from './recommendations/ExplainableRecommendationCards';
import { useAuth } from '../context/AuthContext';
import { RefreshCw, Sparkles, AlertTriangle, Zap } from 'lucide-react';

const MOCK_FALLBACK_DATA = {
  "PORT-1001": {
    status: "success",
    portfolio_id: "PORT-1001",
    insights: {
      executive_summary: "Portfolio demonstrates robust performance with a +29.42% net gain, primarily powered by strong earnings in TCS and INFY. However, capital distribution is highly skewed with an 81.68% Tech sector concentration.",
      key_performance_drivers: [
        {
          symbol: "TCS.NS",
          impact: "POSITIVE",
          pnl_contribution: "+18.2%",
          explanation: "Tata Consultancy Services reported record deal wins in cloud transformation and AI integration, driving double-digit P&L growth."
        },
        {
          symbol: "INFY.NS",
          impact: "POSITIVE",
          pnl_contribution: "+12.1%",
          explanation: "Infosys exceeded annual operating margin guidance, acting as a major positive contributor to portfolio valuation."
        },
        {
          symbol: "RELIANCE.NS",
          impact: "NEGATIVE",
          pnl_contribution: "-0.9%",
          explanation: "Oil-to-chemicals refining margin pressure posted minor unrealized headwinds on non-technology holdings."
        }
      ],
      risk_analysis: {
        risk_level: "HIGH",
        primary_risks: [
          "Sector Concentration Risk: Technology assets represent 81.68% of total equity holdings.",
          "Historical Peak Drawdown Exposure: Historical maximum drawdown reached -14.2% during tech sector pullbacks."
        ],
        mitigation_context: "Over-weighting in a single industry elevates portfolio standard deviation. Gradual dollar-cost averaging into FMCG or Banking assets is recommended to cushion macro volatility.",
        portfolio_beta_context: "Portfolio Beta is 1.18 relative to NIFTY 50."
      },
      recommendation_cards: [
        {
          id: "REC-01",
          category: "Risk Attention",
          title: "Technology Allocation Exceeds 40% Prudential Threshold",
          signal: "Heavy Concentration Alert (81.68% Tech Exposure)",
          rationale: "Technology stocks comprise over four-fifths of equity capital. A single regulatory or global tech demand contraction will disproportionately affect net worth.",
          supporting_metrics: ["Tech Allocation: 81.68%", "Volatility: 24.8%"],
          suggested_review_action: "Examine rebalancing options to cap technology exposure under 35% of total portfolio value.",
          confidence: 0.96,
          disclaimer: "Educational risk analysis only; not SEBI-registered individualized advice."
        },
        {
          id: "REC-02",
          category: "Diversification Review",
          title: "Asset Allocation & Defensive Balancing",
          signal: "Broad-Market Multi-Asset SIP Strategy",
          rationale: "Adding exposure in banking, FMCG, and hybrid balanced funds cushions sharp sector-specific drawdowns.",
          supporting_metrics: ["Beta: 1.18", "Historical Max Drawdown: 14.2%"],
          suggested_review_action: "Allocate upcoming SIP flows into large-cap index funds or flexi-cap funds.",
          confidence: 0.94,
          disclaimer: "Educational risk analysis only; not SEBI-registered individualized advice."
        },
        {
          id: "REC-03",
          category: "Watchlist & Catalyst Monitoring",
          title: "Upcoming Q4 Earnings & Cloud Guidance",
          signal: "TCS & Infosys Earnings Calendar",
          rationale: "Management commentary on North American IT deal ramp-ups will determine short-to-medium term trajectory.",
          supporting_metrics: ["Institutional Volume Surge", "Deal Pipeline > $1B"],
          suggested_review_action: "Set price alert thresholds around support levels on Kite.",
          confidence: 0.92,
          disclaimer: "Educational risk analysis only; not SEBI-registered individualized advice."
        },
        {
          id: "REC-04",
          category: "Portfolio Rebalancing Follow-up",
          title: "Disciplined Quarterly Profit Realignment",
          signal: "Unrealized Gain Locking Strategy",
          rationale: "With +29.42% net unrealized gain, locking a portion of tech outperformance into defensive debt preserves compounding.",
          supporting_metrics: ["Total P&L: ₹1,32,400", "Net Return: +29.42%"],
          suggested_review_action: "Schedule periodic quarterly rebalancing check.",
          confidence: 0.97,
          disclaimer: "Educational risk analysis only; not SEBI-registered individualized advice."
        }
      ],
      confidence_score: 0.96
    },
    summary: {
      total_invested: 450000.00,
      total_current_value: 582400.00,
      total_pnl: 132400.00,
      pnl_pct: 29.42
    },
    metadata: {
      portfolio_id: "PORT-1001",
      investor_name: "Vaibhav Pandey",
      risk_profile: "Aggressive Tech Growth"
    },
    sector_allocation: {
      Technology: 81.68,
      Energy: 18.32
    },
    risk_metrics: {
      annualized_volatility_pct: 24.8,
      max_drawdown_pct: 14.2,
      portfolio_beta: 1.18,
      risk_flag: "HIGH"
    }
  }
};

export default function Dashboard({ 
  portfolioId = "PORT-1001", 
  selectedBenchmark = "^NSEI", 
  isForceRefresh = false,
  onResetRefresh = () => {}
}) {
  const { authFetch } = useAuth();

  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDemoMode, setIsDemoMode] = useState(false);

  const fetchInsights = async (forceBypassCache = false) => {
    setIsLoading(true);
    setError(null);
    setIsDemoMode(false);

    try {
      const url = `http://localhost:5000/api/portfolio/${portfolioId}/insights?benchmark=${selectedBenchmark}&refresh=${forceBypassCache || isForceRefresh}`;
      
      const response = await authFetch(url, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
      }

      const json = await response.json();
      
      if (json.status === 'error') {
        throw new Error(json.message || 'Flask backend returned an error status.');
      }

      setData(json);
    } catch (err) {
      console.warn("[Backend Fetch Error]:", err);
      setError(err.message || "Failed to connect to backend Flask API.");
    } finally {
      setIsLoading(false);
      onResetRefresh();
    }
  };

  useEffect(() => {
    fetchInsights();
  }, [portfolioId, selectedBenchmark]);

  const handleForceRefreshClick = () => {
    fetchInsights(true);
  };

  const handleUseDemoData = () => {
    const selectedFallback = MOCK_FALLBACK_DATA[portfolioId] || MOCK_FALLBACK_DATA["PORT-1001"];
    setData(selectedFallback);
    setError(null);
    setIsDemoMode(true);
    setIsLoading(false);
  };

  if (isLoading) {
    return <SkeletonLoader />;
  }

  if (error && !data) {
    return (
      <FallbackState 
        error={error} 
        onRetry={() => fetchInsights(true)} 
        onUseDemoData={handleUseDemoData} 
      />
    );
  }

  const insightsObj = data?.insights || {};
  const drivers = insightsObj?.key_performance_drivers || insightsObj?.insights?.key_performance_drivers || [];
  const riskAnalysis = insightsObj?.risk_analysis || insightsObj?.insights?.risk_analysis || {};
  const recommendationCards = insightsObj?.recommendation_cards || insightsObj?.insights?.recommendation_cards || [];
  const confidenceScore = insightsObj?.confidence_score || insightsObj?.insights?.confidence_score || 0.95;
  const promptHash = data?.prompt_hash || insightsObj?.prompt_hash || '';

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-6 md:py-8 space-y-8 animate-fadeIn">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="flex items-center gap-2">
          {isDemoMode ? (
            <span className="pill-badge pill-yellow">
              <AlertTriangle className="w-3.5 h-3.5" />
              Offline Demo Mode Active ({portfolioId})
            </span>
          ) : (
            <span className="pill-badge pill-green">
              <Zap className="w-3.5 h-3.5 text-[#00E676]" />
              Live Backend Connected
            </span>
          )}
        </div>

        {/* Refresh AI Insights Button */}
        <button
          onClick={handleForceRefreshClick}
          className="btn-secondary px-4 py-2 text-xs font-bold flex items-center gap-2 cursor-pointer shadow-xs"
        >
          <RefreshCw className="w-3.5 h-3.5 text-[#3B82F6]" />
          <span>Refresh AI Insights (Bypass Cache)</span>
        </button>
      </div>

      {/* Dynamic Benchmark Relative Performance Card */}
      <RelativePerformanceCard 
        analytics={data?.analytics}
        benchmark={selectedBenchmark}
        summary={data?.summary}
      />

      {/* 1. Investor Portfolio Intelligence Hub (Executive Summary) */}
      <div className="space-y-4">
        <ExecutiveSummary 
          insights={insightsObj} 
          metadata={data?.metadata} 
          summary={data?.summary} 
        />
        
        <InsightFeedbackBar 
          portfolioId={portfolioId} 
          promptHash={promptHash} 
        />
      </div>

      {/* 2. Risk & Exposure Panel */}
      <RiskAlertBanner 
        riskAnalysis={riskAnalysis} 
        riskMetrics={data?.risk_metrics || data?.analytics?.risk_metrics}
        sectorAllocation={data?.sector_allocation || data?.analytics?.sector_allocation}
        concentrationAlerts={data?.concentration_alerts || data?.analytics?.concentration_alerts}
      />

      {/* 3. Market Movement Explainer (Key Performance Drivers Grid) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-extrabold text-[var(--text-primary)] tracking-tight flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#8B5CF6]" />
              Market Movement Explainer
            </h2>
            <p className="text-xs text-[var(--text-muted)]">AI attribution analysis of key stock contributors & detractors</p>
          </div>
          <span className="pill-badge pill-purple">
            {drivers.length} Drivers Identified
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {drivers.map((driver, idx) => (
            <PerformanceDriverCard 
              key={idx} 
              driver={driver} 
              newsData={data?.holdings_news || data?.analytics?.holdings_news}
            />
          ))}
        </div>
      </section>

      {/* 4. Explainable Recommendation Console (4 Structured Cards) */}
      <ExplainableRecommendationCards cards={recommendationCards} />

      {/* 5. Operations / Debug Audit View */}
      <DebugAuditPanel 
        rawData={data} 
        confidenceScore={confidenceScore} 
      />
    </div>
  );
}
