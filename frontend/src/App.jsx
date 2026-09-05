import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import StocksTab from './components/market/StocksTab';
import FnoIpoTab from './components/market/FnoIpoTab';
import MutualFundsTab from './components/market/MutualFundsTab';
import OperationsDashboard from './components/operations/OperationsDashboard';
import ComplianceReviewPanel from './components/compliance/ComplianceReviewPanel';
import { AuthProvider, useAuth } from './context/AuthContext';
import AuthModal from './components/auth/AuthModal';
import PortfolioUploadModal from './components/upload/PortfolioUploadModal';
import { API_BASE_URL } from './config/api';
import { 
  Cpu, 
  ShieldCheck, 
  ChevronDown, 
  Sparkles, 
  Sun, 
  Moon, 
  LogIn, 
  LogOut, 
  UploadCloud, 
  User, 
  BarChart2,
  TrendingUp,
  Flame,
  PieChart,
  LayoutDashboard,
  Server,
  FileCheck
} from 'lucide-react';

function AppContent() {
  const { user, isAuthenticated, logout, authFetch } = useAuth();

  // Navigation Tabs: 'stocks' | 'fno_ipo' | 'mutual_funds' | 'dashboard' | 'operations' | 'compliance'
  const [activeTab, setActiveTab] = useState('stocks');

  const [selectedPortfolio, setSelectedPortfolio] = useState('PORT-1001');
  const [selectedBenchmark, setSelectedBenchmark] = useState('^NSEI');
  const [userRiskProfile, setUserRiskProfile] = useState('Aggressive Tech Growth');
  const [portfoliosList, setPortfoliosList] = useState([
    { portfolio_id: 'PORT-1001', investor_name: 'Vaibhav - Tech Growth', risk_profile: 'Aggressive Tech Growth' },
    { portfolio_id: 'PORT-1002', investor_name: 'Rahul - Moderate Bluechip', risk_profile: 'Moderate Bluechip' },
    { portfolio_id: 'PORT-1003', investor_name: 'Ananya - High Beta Consumer', risk_profile: 'High Beta Consumer' },
  ]);

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('zerodha_theme') || 'dark';
  });

  const fetchUserPortfolios = async () => {
    if (!isAuthenticated) return;
    try {
      const url = user?.id ? `${API_BASE_URL}/api/portfolios?user_id=${user.id}` : `${API_BASE_URL}/api/portfolios`;
      const res = await authFetch(url);
      if (res.ok) {
        const json = await res.json();
        if (json.portfolios && json.portfolios.length > 0) {
          setPortfoliosList(json.portfolios);
          
          const userPort = json.portfolios.find(p => p.portfolio_id === `PORT-${user?.id}`);
          if (userPort) {
            setSelectedPortfolio(userPort.portfolio_id);
            if (userPort.risk_profile) setUserRiskProfile(userPort.risk_profile);
          } else {
            setSelectedPortfolio(json.portfolios[0].portfolio_id);
            if (json.portfolios[0].risk_profile) setUserRiskProfile(json.portfolios[0].risk_profile);
          }
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
    setActiveTab('dashboard');
    fetchUserPortfolios();
  };

  const handleSelectPortfolioOption = (val) => {
    if (val === '__UPLOAD_NEW__') {
      setIsUploadModalOpen(true);
    } else {
      setSelectedPortfolio(val);
      const found = portfoliosList.find(p => p.portfolio_id === val);
      if (found?.risk_profile) {
        setUserRiskProfile(found.risk_profile);
      }
    }
  };

  const tabsConfig = [
    { id: 'stocks', label: 'Stocks & Indices', icon: <TrendingUp className="w-4 h-4" /> },
    { id: 'fno_ipo', label: 'F&O & IPOs', icon: <Flame className="w-4 h-4 text-[#FF5252]" /> },
    { id: 'mutual_funds', label: 'Mutual Funds', icon: <PieChart className="w-4 h-4 text-[#00E676]" /> },
    { id: 'dashboard', label: 'Portfolio AI Hub', icon: <LayoutDashboard className="w-4 h-4 text-[#8B5CF6]" /> },
    { id: 'operations', label: 'Operations & MCP', icon: <Server className="w-4 h-4 text-[#3B82F6]" /> },
    { id: 'compliance', label: 'Compliance Audit', icon: <FileCheck className="w-4 h-4 text-amber-400" /> },
  ];

  return (
    <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)] flex flex-col font-sans transition-colors duration-200">
      
      {/* Top Brand Navigation Header */}
      <header className="sticky top-0 z-40 bg-[var(--bg-surface)]/95 backdrop-blur-md border-b border-[var(--border-subtle)] px-4 md:px-8 py-2 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          
          {/* Left: Brand Logo & Tagline */}
          <div className="flex items-center gap-3 shrink-0 cursor-pointer" onClick={() => setActiveTab('stocks')}>
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-[#00E676] via-[#3B82F6] to-[#8B5CF6] p-0.5 shadow-lg shadow-[#00E676]/20 shrink-0">
              <div className="w-full h-full bg-[var(--bg-surface)] rounded-[14px] flex items-center justify-center text-[#00E676]">
                <Cpu className="w-5 h-5" />
              </div>
            </div>
            <div className="hidden sm:block">
              <div className="flex items-center gap-2">
                <span className="font-black text-base md:text-lg text-[var(--text-primary)] tracking-tight">Zerodha</span>
                <span className="pill-badge pill-purple text-[10px] py-0 px-2">
                  <Sparkles className="w-3 h-3" />
                  AI Intelligence
                </span>
              </div>
              <p className="text-[10px] text-[var(--text-muted)] font-medium">Financial Intelligence Platform</p>
            </div>
          </div>

          {/* Center: 6 TABS NAVIGATION */}
          <nav className="flex items-center gap-1 bg-[var(--bg-input)] p-1 rounded-2xl border border-[var(--border-subtle)] overflow-x-auto max-w-full">
            {tabsConfig.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    if (tab.id === 'dashboard' && !isAuthenticated) {
                      setIsAuthModalOpen(true);
                    } else {
                      setActiveTab(tab.id);
                    }
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl whitespace-nowrap transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-sm border border-[var(--border-subtle)]'
                      : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)]/50'
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Action Widgets */}
          <div className="flex items-center gap-2 shrink-0">
            
            {/* Benchmark Selector */}
            <div className="hidden xl:flex items-center gap-1.5 bg-[var(--bg-input)] border border-[var(--border-subtle)] px-2.5 py-1.5 rounded-xl text-xs font-mono">
              <BarChart2 className="w-3.5 h-3.5 text-[#3B82F6]" />
              <select
                value={selectedBenchmark}
                onChange={(e) => setSelectedBenchmark(e.target.value)}
                className="bg-transparent border-none text-[11px] font-mono font-bold text-[var(--text-primary)] focus:outline-none cursor-pointer"
              >
                <option value="^NSEI" className="bg-[var(--bg-surface)]">NIFTY 50</option>
                <option value="^BSESN" className="bg-[var(--bg-surface)]">SENSEX</option>
                <option value="^NSEBANK" className="bg-[var(--bg-surface)]">BANKNIFTY</option>
              </select>
            </div>

            {/* Portfolio Dropdown & CSV Upload */}
            {isAuthenticated && (
              <div className="flex items-center gap-1.5">
                <div className="relative">
                  <select
                    value={selectedPortfolio}
                    onChange={(e) => handleSelectPortfolioOption(e.target.value)}
                    className="appearance-none bg-[var(--bg-input)] border border-[var(--border-subtle)] hover:border-[#8B5CF6] text-xs text-[var(--text-primary)] font-mono py-1.5 pl-2.5 pr-6 rounded-xl focus:outline-none transition-all cursor-pointer max-w-[110px] sm:max-w-none"
                  >
                    {portfoliosList.map((p) => (
                      <option key={p.portfolio_id} value={p.portfolio_id} className="bg-[var(--bg-surface)]">
                        {p.portfolio_id}
                      </option>
                    ))}
                    <option value="__UPLOAD_NEW__" className="bg-[var(--bg-surface)] font-bold text-[#00E676]">
                      + Upload File
                    </option>
                  </select>
                  <ChevronDown className="w-3 h-3 text-[var(--text-muted)] absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>

                <button
                  onClick={() => setIsUploadModalOpen(true)}
                  title="Upload Zerodha Holdings CSV/Excel"
                  className="p-1.5 btn-secondary text-[#00E676] hover:bg-[#00E676]/10 rounded-xl cursor-pointer transition-all flex items-center justify-center"
                >
                  <UploadCloud className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              title={`Switch Theme`}
              className="p-1.5 btn-secondary rounded-xl cursor-pointer transition-all"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
            </button>

            {/* Auth Controls */}
            {isAuthenticated && user ? (
              <div className="flex items-center gap-1.5 pl-1.5 border-l border-[var(--border-subtle)]">
                <div className="pill-badge pill-purple text-[11px] py-1 px-2.5">
                  <User className="w-3 h-3" />
                  <span className="font-mono">{user.email?.split('@')[0]}</span>
                </div>
                <button
                  onClick={logout}
                  title="Sign Out"
                  className="p-1.5 btn-secondary text-[#FF5252] hover:bg-[#FF5252]/10 rounded-xl transition-all cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="btn-primary px-3 py-1.5 text-xs font-bold flex items-center gap-1.5 cursor-pointer ml-1"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            )}

          </div>
        </div>
      </header>

      {/* Main Multi-Tab Workspace Content */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-6 md:py-8">
        {activeTab === 'stocks' && (
          <StocksTab 
            userRiskProfile={userRiskProfile}
            onNavigateToDashboard={() => {
              if (!isAuthenticated) setIsAuthModalOpen(true);
              else setActiveTab('dashboard');
            }}
          />
        )}

        {activeTab === 'fno_ipo' && (
          <FnoIpoTab 
            userRiskProfile={userRiskProfile}
            onNavigateToDashboard={() => {
              if (!isAuthenticated) setIsAuthModalOpen(true);
              else setActiveTab('dashboard');
            }}
          />
        )}

        {activeTab === 'mutual_funds' && (
          <MutualFundsTab 
            userRiskProfile={userRiskProfile}
            onNavigateToDashboard={() => {
              if (!isAuthenticated) setIsAuthModalOpen(true);
              else setActiveTab('dashboard');
            }}
          />
        )}

        {activeTab === 'dashboard' && (
          <Dashboard 
            portfolioId={selectedPortfolio}
            selectedBenchmark={selectedBenchmark}
          />
        )}

        {activeTab === 'operations' && (
          <OperationsDashboard />
        )}

        {activeTab === 'compliance' && (
          <ComplianceReviewPanel />
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
            <span>Zerodha AI Compliance & Decision Governance Standard (SEBI-Safe Non-Execution)</span>
          </div>
          <p className="text-[var(--text-muted)] font-mono">
            MCP Protocol v2025-06-18 • PostgreSQL Ingestion • Gemini 1.5 Flash
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
