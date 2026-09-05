import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  ShieldCheck, 
  TrendingUp, 
  Star, 
  PieChart, 
  Compass, 
  Filter, 
  ArrowUpRight,
  ShieldAlert
} from 'lucide-react';
import { API_BASE_URL } from '../../config/api';

export default function MutualFundsTab({ userRiskProfile = "Aggressive Tech Growth", onNavigateToDashboard = () => {} }) {
  const [data, setData] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isLoading, setIsLoading] = useState(true);

  const fetchFunds = async () => {
    setIsLoading(true);
    try {
      const url = `${API_BASE_URL}/api/market/mutual-funds?risk_profile=${encodeURIComponent(userRiskProfile)}`;
      const res = await fetch(url);
      if (res.ok) {
        const json = await res.json();
        if (json.status === 'success') {
          setData(json);
        }
      }
    } catch (err) {
      console.warn("[Mutual Funds Fetch Error]:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFunds();
  }, [userRiskProfile]);

  const aiRec = data?.ai_recommendation || {
    tag: "Alpha Generation & Sector Balance",
    title: "Quant Mid Cap & Parag Parikh Flexi Cap",
    rationale: "Your current portfolio exhibits 81% tech exposure. Allocating monthly SIPs into Parag Parikh Flexi Cap and Quant Mid Cap will capture upside while expanding sector diversification beyond IT.",
    risk_note: "Mid-cap funds carry short-term NAV volatility during market consolidations.",
    confidence: 0.95,
    suggested_action: "Review Holdings Rebalancing"
  };

  const defaultFunds = [
    {
      name: "Parag Parikh Flexi Cap Direct-Growth",
      category: "Flexi Cap",
      cagr_1y: 28.4,
      cagr_3y: 21.8,
      cagr_5y: 24.2,
      rating: 5,
      aum: "₹62,400 Cr",
      expense_ratio: "0.58%",
      risk_level: "Moderate",
      top_holdings: "HDFC Bank, ITC, Alphabet, Microsoft"
    },
    {
      name: "Quant Mid Cap Fund Direct-Growth",
      category: "Mid Cap",
      cagr_1y: 38.6,
      cagr_3y: 31.4,
      cagr_5y: 29.5,
      rating: 5,
      aum: "₹14,200 Cr",
      expense_ratio: "0.64%",
      risk_level: "Aggressive",
      top_holdings: "Reliance, Jio Financial, Tata Comm"
    },
    {
      name: "Mirae Asset Large & Midcap Direct-Growth",
      category: "Large & Mid Cap",
      cagr_1y: 24.2,
      cagr_3y: 18.6,
      cagr_5y: 19.8,
      rating: 4,
      aum: "₹38,100 Cr",
      expense_ratio: "0.52%",
      risk_level: "Moderate",
      top_holdings: "HDFC Bank, ICICI Bank, Infosys, L&T"
    },
    {
      name: "ICICI Prudential Balanced Advantage Direct",
      category: "Hybrid / Dynamic",
      cagr_1y: 18.5,
      cagr_3y: 15.2,
      cagr_5y: 16.1,
      rating: 5,
      aum: "₹56,800 Cr",
      expense_ratio: "0.78%",
      risk_level: "Low Risk",
      top_holdings: "Govt Bonds (35%), ICICI, Bharti Airtel"
    },
    {
      name: "Nippon India Small Cap Fund Direct-Growth",
      category: "Small Cap",
      cagr_1y: 42.1,
      cagr_3y: 34.8,
      cagr_5y: 32.2,
      rating: 4,
      aum: "₹48,900 Cr",
      expense_ratio: "0.68%",
      risk_level: "Aggressive",
      top_holdings: "Tube Investments, Apar Ind, HDFC Bank"
    },
    {
      name: "HDFC Corporate Bond Fund Direct-Growth",
      category: "Debt / Fixed Income",
      cagr_1y: 8.4,
      cagr_3y: 7.6,
      cagr_5y: 7.9,
      rating: 5,
      aum: "₹28,500 Cr",
      expense_ratio: "0.32%",
      risk_level: "Conservative",
      top_holdings: "NABARD AAA, REC AAA, HDFC AAA"
    }
  ];

  const funds = data?.funds || defaultFunds;

  const categories = ['All', 'Flexi Cap', 'Mid Cap', 'Large & Mid Cap', 'Small Cap', 'Hybrid / Dynamic', 'Debt / Fixed Income'];

  const filteredFunds = selectedCategory === 'All' 
    ? funds 
    : funds.filter(f => f.category.toLowerCase().includes(selectedCategory.toLowerCase()));

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* 1. Profile-Tailored AI Recommendation Card */}
      <div className="surface-card p-5 md:p-6 rounded-3xl border border-[#00E676]/30 bg-gradient-to-br from-[var(--bg-surface)] via-[var(--bg-input)] to-[#00E676]/10 relative overflow-hidden shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
          <div className="space-y-2 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="pill-badge pill-green text-xs">
                <ShieldCheck className="w-3.5 h-3.5 text-[#00E676]" />
                {aiRec.tag}
              </span>
              <span className="pill-badge pill-purple text-xs font-mono">
                Risk Profile: {userRiskProfile}
              </span>
              <span className="pill-badge pill-blue text-xs font-mono">
                {Math.round(aiRec.confidence * 100)}% Confidence
              </span>
            </div>

            <h3 className="text-lg md:text-xl font-black tracking-tight text-[var(--text-primary)]">
              {aiRec.title}
            </h3>

            <p className="text-xs md:text-sm text-[var(--text-secondary)] leading-relaxed">
              {aiRec.rationale}
            </p>

            <div className="flex items-center gap-2 text-[11px] text-[var(--text-muted)] pt-1">
              <ShieldAlert className="w-3.5 h-3.5 text-[#FF5252]" />
              <span>{aiRec.risk_note}</span>
            </div>
          </div>

          <button
            onClick={onNavigateToDashboard}
            className="btn-primary px-5 py-2.5 text-xs font-bold shrink-0 self-start lg:self-center flex items-center gap-1.5 cursor-pointer"
          >
            <Compass className="w-4 h-4" />
            <span>{aiRec.suggested_action}</span>
          </button>
        </div>
      </div>

      {/* 2. Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              selectedCategory === cat
                ? 'bg-[#00E676] text-[#041A10] shadow-md'
                : 'btn-secondary text-[var(--text-muted)] hover:text-white'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* 3. Top Mutual Funds Grid */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PieChart className="w-5 h-5 text-[#00E676]" />
            <h2 className="text-lg font-black text-[var(--text-primary)] tracking-tight">
              Top Rated Mutual Funds & Systematic Plans (SIP)
            </h2>
          </div>
          <span className="pill-badge pill-purple">
            {filteredFunds.length} Funds Found
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredFunds.map((fund, idx) => (
            <div 
              key={idx}
              className="surface-card surface-card-hover p-5 border border-[var(--border-subtle)] space-y-4 rounded-3xl flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#3B82F6]/15 text-[#3B82F6]">
                    {fund.category}
                  </span>
                  <div className="flex items-center gap-0.5 text-amber-400 text-xs">
                    {Array.from({ length: fund.rating }).map((_, r) => (
                      <Star key={r} className="w-3.5 h-3.5 fill-current" />
                    ))}
                  </div>
                </div>

                <h4 className="text-sm md:text-base font-extrabold text-[var(--text-primary)] tracking-tight line-clamp-2">
                  {fund.name}
                </h4>

                <div className="text-[11px] text-[var(--text-muted)]">
                  Top Assets: <span className="text-[var(--text-secondary)] font-medium">{fund.top_holdings}</span>
                </div>
              </div>

              {/* CAGR Returns Grid */}
              <div className="grid grid-cols-3 gap-2 p-3 bg-[var(--bg-input)] rounded-2xl text-center font-mono">
                <div>
                  <span className="text-[10px] text-[var(--text-muted)] block">1Y CAGR</span>
                  <span className="text-xs font-black text-[#00E676]">+{fund.cagr_1y}%</span>
                </div>
                <div>
                  <span className="text-[10px] text-[var(--text-muted)] block">3Y CAGR</span>
                  <span className="text-xs font-black text-[#00E676]">+{fund.cagr_3y}%</span>
                </div>
                <div>
                  <span className="text-[10px] text-[var(--text-muted)] block">5Y CAGR</span>
                  <span className="text-xs font-black text-[#00E676]">+{fund.cagr_5y}%</span>
                </div>
              </div>

              {/* Fund Metadata Footer */}
              <div className="flex items-center justify-between text-[11px] text-[var(--text-muted)] pt-2 border-t border-[var(--border-subtle)] font-mono">
                <span>AUM: <strong className="text-[var(--text-secondary)]">{fund.aum}</strong></span>
                <span>TER: <strong className="text-[var(--text-secondary)]">{fund.expense_ratio}</strong></span>
                <span className="text-[#A78BFA] font-bold">{fund.risk_level}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
