import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  ShieldAlert, 
  Flame, 
  ArrowUpRight, 
  ArrowDownRight, 
  Clock, 
  CheckCircle2, 
  Layers, 
  Info,
  Calendar,
  Compass
} from 'lucide-react';

export default function FnoIpoTab({ userRiskProfile = "Aggressive Tech Growth", onNavigateToDashboard = () => {} }) {
  const [data, setData] = useState(null);
  const [activeSubTab, setActiveSubTab] = useState('all'); // 'all' | 'fno' | 'ipo'
  const [isLoading, setIsLoading] = useState(true);

  const fetchFnoIpoData = async () => {
    setIsLoading(true);
    try {
      const url = `http://localhost:5000/api/market/fno-ipo?risk_profile=${encodeURIComponent(userRiskProfile)}`;
      const res = await fetch(url);
      if (res.ok) {
        const json = await res.json();
        if (json.status === 'success') {
          setData(json);
        }
      }
    } catch (err) {
      console.warn("[F&O IPO Fetch Warning]:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFnoIpoData();
  }, [userRiskProfile]);

  const aiRec = data?.ai_recommendation || {
    tag: "High Beta Derivative Alert",
    title: "NIFTY IT & Auto Long Call Momentum",
    rationale: "Strong positive PCR (1.18) in NIFTY combined with breakout volume in Tata Motors suggests selective call option buying or bull-call spread hedging rather than unhedged futures.",
    risk_note: "F&O positions carry high leverage risk. Enforce hard stop-losses at previous session swing lows.",
    confidence: 0.94,
    suggested_action: "Review Protective Hedging on Dashboard"
  };

  const fno = data?.fno_data || {
    pcr_ratio: 1.18,
    max_pain_strike: 22400,
    nifty_futures_price: 22510.40,
    contracts: [
      { instrument: "NIFTY 22500 CE", expiry: "28-MAR", ltp: 164.20, change_pct: 14.5, oi: "4.2M", type: "CALL" },
      { instrument: "NIFTY 22400 PE", expiry: "28-MAR", ltp: 98.40, change_pct: -22.4, oi: "5.8M", type: "PUT" },
      { instrument: "BANKNIFTY 48000 CE", expiry: "28-MAR", ltp: 320.10, change_pct: 6.8, oi: "2.1M", type: "CALL" },
      { instrument: "BANKNIFTY 47500 PE", expiry: "28-MAR", ltp: 185.00, change_pct: -15.2, oi: "3.4M", type: "PUT" }
    ],
    oi_gainers: [
      { symbol: "TCS", oi_change: "+45.0%", price_change: "+2.40%", interpretation: "Long Buildup (Bullish)" },
      { symbol: "TATAMOTORS", oi_change: "+32.1%", price_change: "+3.10%", interpretation: "Long Buildup (Bullish)" }
    ]
  };

  const ipos = data?.ipos || [
    {
      company: "Tata EV Mobility Ltd",
      category: "Mainboard",
      issue_size: "₹3,500 Cr",
      price_band: "₹480 - ₹510",
      gmp: "+₹145 (28.4%)",
      subscription: "24.5x",
      status: "OPEN",
      close_date: "24 Mar 2026",
      risk_rating: "Moderate"
    },
    {
      company: "NexGen AI Robotics",
      category: "SME",
      issue_size: "₹120 Cr",
      price_band: "₹140 - ₹150",
      gmp: "+₹65 (43.3%)",
      subscription: "85.2x",
      status: "OPEN",
      close_date: "25 Mar 2026",
      risk_rating: "High Beta"
    }
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* 1. Profile-Tailored AI Recommendation Card */}
      <div className="surface-card p-5 md:p-6 rounded-3xl border border-[#FF5252]/30 bg-gradient-to-br from-[var(--bg-surface)] via-[var(--bg-input)] to-[#FF5252]/10 relative overflow-hidden shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
          <div className="space-y-2 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="pill-badge pill-red text-xs">
                <Flame className="w-3.5 h-3.5" />
                {aiRec.tag}
              </span>
              <span className="pill-badge pill-purple text-xs font-mono">
                Risk Profile: {userRiskProfile}
              </span>
              <span className="pill-badge pill-green text-xs font-mono">
                {Math.round(aiRec.confidence * 100)}% Confidence
              </span>
            </div>

            <h3 className="text-lg md:text-xl font-black tracking-tight text-[var(--text-primary)]">
              {aiRec.title}
            </h3>

            <p className="text-xs md:text-sm text-[var(--text-secondary)] leading-relaxed">
              {aiRec.rationale}
            </p>

            <div className="flex items-center gap-2 text-[11px] text-[#FF5252] pt-1">
              <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
              <span>{aiRec.risk_note}</span>
            </div>
          </div>

          <button
            onClick={onNavigateToDashboard}
            className="btn-secondary px-5 py-2.5 text-xs font-bold shrink-0 self-start lg:self-center flex items-center gap-1.5 cursor-pointer border-[#FF5252]/40 text-[#FF5252] hover:bg-[#FF5252]/10"
          >
            <Compass className="w-4 h-4" />
            <span>{aiRec.suggested_action}</span>
          </button>
        </div>
      </div>

      {/* 2. Sub-tab Filter Controls */}
      <div className="flex items-center gap-2 border-b border-[var(--border-subtle)] pb-2">
        <button
          onClick={() => setActiveSubTab('all')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            activeSubTab === 'all'
              ? 'bg-[#3B82F6] text-white shadow-md'
              : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
          }`}
        >
          All (F&O & IPOs)
        </button>
        <button
          onClick={() => setActiveSubTab('fno')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            activeSubTab === 'fno'
              ? 'bg-[#3B82F6] text-white shadow-md'
              : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
          }`}
        >
          Futures & Options (Derivatives)
        </button>
        <button
          onClick={() => setActiveSubTab('ipo')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            activeSubTab === 'ipo'
              ? 'bg-[#3B82F6] text-white shadow-md'
              : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
          }`}
        >
          IPOs & Primary Market
        </button>
      </div>

      {/* 3. F&O Market Sentiment & Contracts Section */}
      {(activeSubTab === 'all' || activeSubTab === 'fno') && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-[#3B82F6]" />
              <h2 className="text-lg font-black text-[var(--text-primary)] tracking-tight">
                Live F&O Market Sentiment & Open Interest
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="pill-badge pill-blue font-mono">
                PCR: {fno.pcr_ratio}
              </span>
              <span className="pill-badge pill-purple font-mono">
                Max Pain: {fno.max_pain_strike}
              </span>
            </div>
          </div>

          {/* F&O Key Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="surface-card p-4 space-y-1">
              <div className="text-xs text-[var(--text-muted)] font-medium">NIFTY Put-Call Ratio (PCR)</div>
              <div className="text-2xl font-black font-mono text-[#00E676]">{fno.pcr_ratio}</div>
              <div className="text-[11px] text-[var(--text-muted)]">Bullish sentiment bias (&gt; 1.0)</div>
            </div>

            <div className="surface-card p-4 space-y-1">
              <div className="text-xs text-[var(--text-muted)] font-medium">Option Chain Max Pain Strike</div>
              <div className="text-2xl font-black font-mono text-[var(--text-primary)]">{fno.max_pain_strike}</div>
              <div className="text-[11px] text-[var(--text-muted)]">Expiry price gravity zone</div>
            </div>

            <div className="surface-card p-4 space-y-1">
              <div className="text-xs text-[var(--text-muted)] font-medium">NIFTY Current Month Futures</div>
              <div className="text-2xl font-black font-mono text-[#3B82F6]">₹{fno.nifty_futures_price?.toLocaleString()}</div>
              <div className="text-[11px] text-[#00E676] font-mono">+24.80 pts premium over spot</div>
            </div>
          </div>

          {/* Most Active Contracts Table */}
          <div className="surface-card rounded-2xl overflow-hidden border border-[var(--border-subtle)]">
            <div className="p-4 bg-[var(--bg-input)] border-b border-[var(--border-subtle)] font-bold text-xs text-[var(--text-primary)] flex items-center justify-between">
              <span>Most Active Strike Contracts</span>
              <span className="text-[10px] text-[var(--text-muted)] font-mono">Live NSE Derivatives</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-[var(--bg-surface)] text-[var(--text-muted)] text-[10px] uppercase border-b border-[var(--border-subtle)]">
                  <tr>
                    <th className="p-3">Contract Instrument</th>
                    <th className="p-3">Type</th>
                    <th className="p-3 text-right">LTP (?)</th>
                    <th className="p-3 text-right">Price Change</th>
                    <th className="p-3 text-right">Open Interest (OI)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-subtle)]">
                  {fno.contracts.map((c, i) => {
                    const isCall = c.type === 'CALL';
                    const isUp = c.change_pct >= 0;
                    return (
                      <tr key={i} className="hover:bg-[var(--bg-surface-hover)] transition-colors">
                        <td className="p-3 font-bold text-[var(--text-primary)]">{c.instrument}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            isCall ? 'bg-[#00E676]/10 text-[#00E676]' : 'bg-[#FF5252]/10 text-[#FF5252]'
                          }`}>
                            {c.type}
                          </span>
                        </td>
                        <td className="p-3 text-right font-black">₹{c.ltp.toFixed(2)}</td>
                        <td className={`p-3 text-right font-bold ${isUp ? 'text-[#00E676]' : 'text-[#FF5252]'}`}>
                          {isUp ? `+${c.change_pct}%` : `${c.change_pct}%`}
                        </td>
                        <td className="p-3 text-right text-[var(--text-secondary)]">{c.oi}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* 4. IPO Opportunities Tracker */}
      {(activeSubTab === 'all' || activeSubTab === 'ipo') && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-[#FBBF24]" />
              <h2 className="text-lg font-black text-[var(--text-primary)] tracking-tight">
                Live & Upcoming IPO Opportunities
              </h2>
            </div>
            <span className="pill-badge pill-yellow">
              {ipos.length} Active Issues
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ipos.map((ipo, idx) => {
              const isOpen = ipo.status === 'OPEN';
              return (
                <div 
                  key={idx} 
                  className="surface-card surface-card-hover p-5 border border-[var(--border-subtle)] space-y-4 rounded-3xl"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold font-mono ${
                          isOpen ? 'bg-[#00E676]/15 text-[#00E676]' : 'bg-[#3B82F6]/15 text-[#3B82F6]'
                        }`}>
                          {ipo.status}
                        </span>
                        <span className="text-[10px] text-[var(--text-muted)] font-mono bg-[var(--bg-input)] px-2 py-0.5 rounded">
                          {ipo.category}
                        </span>
                      </div>
                      <h4 className="text-base font-black text-[var(--text-primary)]">
                        {ipo.company}
                      </h4>
                    </div>

                    <div className="text-right font-mono">
                      <div className="text-xs text-[var(--text-muted)]">Grey Market (GMP)</div>
                      <div className="text-sm font-black text-[#00E676]">{ipo.gmp}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 p-3 bg-[var(--bg-input)] rounded-2xl text-xs font-mono">
                    <div>
                      <span className="text-[10px] text-[var(--text-muted)] block">PRICE BAND</span>
                      <span className="font-bold text-[var(--text-primary)]">{ipo.price_band}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[var(--text-muted)] block">ISSUE SIZE</span>
                      <span className="font-bold text-[var(--text-primary)]">{ipo.issue_size}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[var(--text-muted)] block">SUBSCRIPTION</span>
                      <span className="font-bold text-[#3B82F6]">{ipo.subscription}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="text-[var(--text-muted)] flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      Closes: <strong className="text-[var(--text-secondary)]">{ipo.close_date}</strong>
                    </span>
                    <span className="pill-badge pill-purple text-[10px]">
                      Risk: {ipo.risk_rating}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

    </div>
  );
}
