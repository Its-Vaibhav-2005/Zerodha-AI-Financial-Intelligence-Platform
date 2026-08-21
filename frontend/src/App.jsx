import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import MarketOverviewDashboard from './components/market/MarketOverviewDashboard';
import { AuthProvider, useAuth } from './context/AuthContext';
import AuthModal from './components/auth/AuthModal';
import PortfolioUploadModal from './components/upload/PortfolioUploadModal';
import { Cpu, ShieldCheck, ChevronDown, Sparkles, Sun, Moon, LogIn, LogOut, UploadCloud, User, BarChart2 } from 'lucide-react';

function AppContent() {
  const { user, isAuthenticated, logout, authFetch } = useAuth();

  const [selectedPortfolio, setSelectedPortfolio] = useState('PORT-1001');
  const [selectedBenchmark, setSelectedBenchmark] = useState('^NSEI');
  const [portfoliosList, setPortfoliosList] = useState([
    { portfolio_id: 'PORT-1001', investor_name: 'Vaibhav - Tech Growth', risk_profile: 'Aggressive' },
    { portfolio_id: 'PORT-1002', investor_name: 'Rahul - Moderate Bluechip', risk_profile: 'Moderate' },
    { portfolio_id: 'PORT-1003', investor_name: 'Ananya - High Beta Consumer', risk_profile: 'High Beta' },
  ]);

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('zerodha_theme') || 'dark';
  });

  // Dynamic fetch query for portfolios linked to user_id
  const fetchUserPortfolios = async () => {
    if (!isAuthenticated) return;
    try {
      const url = user?.id ? `http://localhost:5000/api/portfolios?user_id=${user.id}` : 'http://localhost:5000/api/portfolios';
      const res = await authFetch(url);
      if (res.ok) {
        const json = await res.json();
        if (json.portfolios && json.portfolios.length > 0) {
          setPortfoliosList(json.portfolios);
          
          // Check if current user already has an uploaded portfolio
          const userPort = json.portfolios.find(p => p.portfolio_id === `PORT-${user?.id}`);
          if (userPort) {
            setSelectedPortfolio(userPort.portfolio_id);
          } else {
            // New user without uploaded portfolio -> set default target and automatically prompt CSV/Excel upload modal
            setSelectedPortfolio(`PORT-${user?.id || 1}`);
            setIsUploadModalOpen(true);
          }
        } else {
          // Empty database or new user -> auto prompt file upload modal
          setSelectedPortfolio(`PORT-${user?.id || 1}`);
          setIsUploadModalOpen(true);
        }
      }
    } catch (err) {
      console.warn('[Portfolios List Fetch Warning]:', err);
    }
  };

  useEffect(() => {
    fetchUserPortfolios();
  }, [user, isAuthenticated]);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'light') {
      root.classList.add('light');
    } else {
      root.classList.remove('light');
    }
    localStorage.setItem('zerodha_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const handleUploadSuccess = (newPortfolioId) => {
    setSelectedPortfolio(newPortfolioId);
    fetchUserPortfolios();
  };

  const handleSelectPortfolioOption = (val) => {
    if (val === '__UPLOAD_NEW__') {
      setIsUploadModalOpen(true);
    } else {
      setSelectedPortfolio(val);
    }
    setIsDropdownOpen(false);
  };

  return (
    <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)] flex flex-col font-sans transition-colors duration-200">
      
      {/* Top Brand Navigation Header */}
      <header className="sticky top-0 z-40 bg-[var(--bg-surface)]/90 backdrop-blur-md border-b border-[var(--border-subtle)] px-4 md:px-8 py-3 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-4">
          
          {/* Logo & Platform Name */}
          <div className="flex items-center gap-3 w-full lg:w-auto justify-between lg:justify-start">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#00E676] via-[#3B82F6] to-[#8B5CF6] p-0.5 shadow-lg shadow-[#00E676]/20">
                <div className="w-full h-full bg-[var(--bg-surface)] rounded-[14px] flex items-center justify-center text-[#00E676]">
                  <Cpu className="w-5 h-5" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-black text-lg text-[var(--text-primary)] tracking-tight">Zerodha</span>
                  <span className="pill-badge pill-purple text-[10px]">
                    <Sparkles className="w-3 h-3" />
                    AI Hub
                  </span>
                </div>
                <p className="text-[11px] text-[var(--text-muted)] font-medium">Financial Intelligence & Risk Governance</p>
              </div>
            </div>

            {/* Mobile Auth Button */}
            <div className="flex lg:hidden items-center gap-2">
              {!isAuthenticated ? (
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="btn-primary px-3 py-1.5 text-xs font-bold flex items-center gap-1 cursor-pointer"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Login</span>
                </button>
              ) : (
                <button
                  onClick={logout}
                  className="p-2 btn-secondary text-xs rounded-xl text-[#FF5252]"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Controls: Portfolio Switcher / Benchmark / Theme & Auth Widget */}
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-between lg:justify-end">
            
            {/* Dynamic Benchmark Dropdown */}
            <div className="flex items-center gap-1.5 bg-[var(--bg-input)] border border-[var(--border-subtle)] px-3 py-1.5 rounded-2xl">
              <BarChart2 className="w-3.5 h-3.5 text-[#3B82F6]" />
              <label className="text-[11px] font-medium text-[var(--text-muted)] hidden sm:inline">Benchmark:</label>
              <select
                value={selectedBenchmark}
                onChange={(e) => setSelectedBenchmark(e.target.value)}
                className="bg-transparent border-none text-xs font-mono font-bold text-[var(--text-primary)] focus:outline-none cursor-pointer"
              >
                <option value="^NSEI" className="bg-[var(--bg-surface)] text-[var(--text-primary)]">NIFTY 50 (^NSEI)</option>
                <option value="^BSESN" className="bg-[var(--bg-surface)] text-[var(--text-primary)]">BSE SENSEX (^BSESN)</option>
                <option value="^NSEBANK" className="bg-[var(--bg-surface)] text-[var(--text-primary)]">NIFTY BANK (^NSEBANK)</option>
              </select>
            </div>

            {/* Render Portfolio Switcher & Upload CSV ONLY when Authenticated */}
            {isAuthenticated && (
              <>
                {/* Multi-Tenant Portfolio Switcher Dropdown */}
                <div className="relative">
                  <select
                    value={selectedPortfolio}
                    onChange={(e) => handleSelectPortfolioOption(e.target.value)}
                    className="appearance-none bg-[var(--bg-input)] border border-[var(--border-subtle)] hover:border-[#8B5CF6] text-xs text-[var(--text-primary)] font-mono py-2 pl-3 pr-8 rounded-2xl focus:outline-none transition-all cursor-pointer"
                  >
                    {portfoliosList.map((p) => (
                      <option key={p.portfolio_id} value={p.portfolio_id} className="bg-[var(--bg-surface)]">
                        {p.portfolio_id} ({p.investor_name})
                      </option>
                    ))}
                    <option value="__UPLOAD_NEW__" className="bg-[var(--bg-surface)] font-bold text-[#00E676]">
                      + Upload Zerodha CSV
                    </option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-[var(--text-muted)] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>

                {/* Quick Upload Action Button */}
                <button
                  onClick={() => setIsUploadModalOpen(true)}
                  title="Upload Zerodha Kite CSV file"
                  className="p-2 btn-secondary text-[#00E676] hover:bg-[#00E676]/10 rounded-2xl cursor-pointer transition-all flex items-center justify-center"
                >
                  <UploadCloud className="w-4 h-4" />
                </button>
              </>
            )}

            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
              className="p-2 btn-secondary rounded-2xl cursor-pointer transition-all flex items-center justify-center"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-indigo-600" />
              )}
            </button>

            {/* User Profile / Auth Action Widget */}
            <div className="hidden lg:flex items-center gap-2 pl-2 border-l border-[var(--border-subtle)]">
              {isAuthenticated && user ? (
                <div className="flex items-center gap-2">
                  <div className="pill-badge pill-purple">
                    <User className="w-3.5 h-3.5" />
                    <span className="font-mono">{user.email}</span>
                  </div>
                  <button
                    onClick={logout}
                    title="Sign Out"
                    className="p-2 btn-secondary text-[#FF5252] hover:bg-[#FF5252]/10 rounded-2xl transition-all cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="btn-primary px-4 py-2 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign In / Register</span>
                </button>
              )}
            </div>

          </div>
        </div>
      </header>

      {/* Main Container: Render Market Overview when logged out, Dashboard when logged in */}
      <main className="flex-1">
        {isAuthenticated ? (
          <Dashboard 
            portfolioId={selectedPortfolio}
            selectedBenchmark={selectedBenchmark}
          />
        ) : (
          <MarketOverviewDashboard 
            onOpenAuthModal={() => setIsAuthModalOpen(true)} 
          />
        )}
      </main>


      {/* Modals */}
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
      />

      <PortfolioUploadModal 
        isOpen={isUploadModalOpen} 
        onClose={() => setIsUploadModalOpen(false)}
        onUploadSuccess={handleUploadSuccess}
      />

      {/* Footer Governance Disclaimer */}
      <footer className="border-t border-[var(--border-subtle)] bg-[var(--bg-surface)] py-6 px-4 text-center text-xs text-[var(--text-muted)] space-y-2">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2 text-[11px]">
          <div className="flex items-center gap-1.5 text-[var(--text-secondary)] font-medium">
            <ShieldCheck className="w-4 h-4 text-[#00E676]" />
            <span>Zerodha AI Compliance & Decision Governance Standard</span>
          </div>
          <p className="text-[var(--text-muted)] font-mono">
            JWT Authenticated • NeonDB Postgres Ingestion • yfinance Live Benchmark Context
          </p>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
