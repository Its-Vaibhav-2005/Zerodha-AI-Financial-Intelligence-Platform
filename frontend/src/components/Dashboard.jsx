import React, { useState, useEffect } from 'react';
import ExecutiveSummary from './ExecutiveSummary';
import RiskAlertBanner from './RiskAlertBanner';
import PerformanceDriverCard from './PerformanceDriverCard';
import DebugAuditPanel from './DebugAuditPanel';
import SkeletonLoader from './SkeletonLoader';
import FallbackState from './FallbackState';
import RelativePerformanceCard from './RelativePerformanceCard';
import InsightFeedbackBar from './feedback/InsightFeedbackBar';
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
          explanation: "Tata Consultancy Services reported record deal wins in cloud transformation and AI integration, driving double-digit P&L growth."
        },
        {
          symbol: "INFY.NS",
          impact: "POSITIVE",
          explanation: "Infosys exceeded annual operating margin guidance, acting as a major positive contributor to portfolio valuation."
        },
        {
          symbol: "RELIANCE.NS",
          impact: "NEGATIVE",
          explanation: "Oil-to-chemicals refining margin pressure posted minor unrealized headwinds on non-technology holdings."
        }
      ],
      risk_analysis: {
        risk_level: "HIGH",
        primary_risks: [
          "Sector Concentration Risk: Technology assets represent 81.68% of total equity holdings.",
          "Historical Peak Drawdown Exposure: Historical maximum drawdown reached -14.2% during tech sector pullbacks."
        ],
        mitigation_context: "Over-weighting in a single industry elevates portfolio standard deviation. Gradual dollar-cost averaging into FMCG or Banking assets is recommended to cushion macro volatility."
      },
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
      risk_flag: "HIGH"
    }
  },
  "PORT-1002": {
    status: "success",
    portfolio_id: "PORT-1002",
    insights: {
      executive_summary: "Balanced conservative portfolio yielding a stable +17.85% return across large-cap financial services and consumer goods, displaying low drawdowns and defensive positioning.",
      key_performance_drivers: [
        {
          symbol: "HDFCBANK.NS",
          impact: "POSITIVE",
          explanation: "HDFC Bank deposit growth and net interest margin recovery bolstered financial sector returns."
        },
        {
          symbol: "ITC.NS",
          impact: "POSITIVE",
          explanation: "ITC agribusiness and FMCG expansion provided reliable dividend yield and capital appreciation."
        },
        {
          symbol: "LT.NS",
          impact: "POSITIVE",
          explanation: "Larsen & Toubro international infrastructure order inflows drove steady industrial outperformance."
        }
      ],
      risk_analysis: {
        risk_level: "LOW",
        primary_risks: [
          "Interest Rate Sensitivity: Financial services exposure is vulnerable to central bank rate adjustments.",
          "Moderate Concentration: Financials account for 48.2% of current allocation."
        ],
        mitigation_context: "Diversified exposure across Banking, FMCG, and Construction provides strong downside protection during broader market corrections."
      },
      confidence_score: 0.98
    },
    summary: {
      total_invested: 386200.00,
      total_current_value: 455140.00,
      total_pnl: 68940.00,
      pnl_pct: 17.85
    },
    metadata: {
      portfolio_id: "PORT-1002",
      investor_name: "Rahul Sharma",
      risk_profile: "Moderate Bluechip"
    },
    sector_allocation: {
      "Financial Services": 48.20,
      "Consumer Goods": 28.50,
      "Construction": 23.30
    },
    risk_metrics: {
      annualized_volatility_pct: 13.5,
      max_drawdown_pct: 6.8,
      risk_flag: "LOW"
    }
  },
  "PORT-1003": {
    status: "success",
    portfolio_id: "PORT-1003",
    insights: {
      executive_summary: "High-beta growth portfolio generating +24.15% gains powered by EV sector momentum in Tata Motors and Zomato volume growth, offset by fintech regulatory drag.",
      key_performance_drivers: [
        {
          symbol: "ZOMATO.NS",
          impact: "POSITIVE",
          explanation: "Blinkit quick-commerce expansion accelerated revenue growth, driving sharp upside re-rating."
        },
        {
          symbol: "TATAMOTORS.NS",
          impact: "POSITIVE",
          explanation: "JLR margin expansion and domestic EV market leadership boosted equity returns."
        },
        {
          symbol: "PAYTM.NS",
          impact: "NEGATIVE",
          explanation: "Payment gateway regulatory compliance headwinds weighed on fintech allocation P&L."
        }
      ],
      risk_analysis: {
        risk_level: "MODERATE",
        primary_risks: [
          "High Beta Volatility: New-age consumer internet stocks experience high price swings.",
          "Regulatory Risk: Regulatory compliance changes in fintech space affect valuation multiples."
        ],
        mitigation_context: "High-growth portfolios benefit from dynamic trailing stop-losses and rebalancing into cash reserves after major rallies."
      },
      confidence_score: 0.94
    },
    summary: {
      total_invested: 242500.00,
      total_current_value: 301050.00,
      total_pnl: 58550.00,
      pnl_pct: 24.15
    },
    metadata: {
      portfolio_id: "PORT-1003",
      investor_name: "Ananya Roy",
      risk_profile: "High Beta Consumer Growth"
    },
    sector_allocation: {
      "Consumer Discretionary": 42.10,
      "Automobile": 38.60,
      "Financial Technology": 19.30
    },
    risk_metrics: {
      annualized_volatility_pct: 28.4,
      max_drawdown_pct: 18.6,
      risk_flag: "MODERATE"
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
      
      // Inject Authorization Bearer token automatically via authFetch
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

  // Handle explicit cache refresh button click
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

  // Extract nested properties gracefully
  const insightsObj = data?.insights || {};
  const drivers = insightsObj?.key_performance_drivers || insightsObj?.insights?.key_performance_drivers || [];
  const riskAnalysis = insightsObj?.risk_analysis || insightsObj?.insights?.risk_analysis || {};
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

        {/* Refresh AI Insights Button (Bypasses yfinance 15-min cache) */}
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
        
        {/* Module 4: Compliance Audit & Feedback Interaction Bar embedded under AI Insight Card */}
        <InsightFeedbackBar 
          portfolioId={portfolioId} 
          promptHash={promptHash} 
        />
      </div>

      {/* 2. Risk & Exposure Panel */}
      <RiskAlertBanner 
        riskAnalysis={riskAnalysis} 
        riskMetrics={data?.risk_metrics}
        sectorAllocation={data?.sector_allocation}
        concentrationAlerts={data?.concentration_alerts}
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
              newsData={data?.holdings_news}
            />
          ))}
        </div>
      </section>

      {/* 4. Operations / Debug Audit View */}
      <DebugAuditPanel 
        rawData={data} 
        confidenceScore={confidenceScore} 
      />
    </div>
  );
}
