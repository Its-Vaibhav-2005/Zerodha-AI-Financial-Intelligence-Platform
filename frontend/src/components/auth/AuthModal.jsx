import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { X, Lock, Mail, User, Shield, Sparkles, LogIn, UserPlus, AlertCircle } from 'lucide-react';

export default function AuthModal({ isOpen, onClose }) {
  const { login, register, isLoading, authError, setAuthError } = useAuth();
  const [activeTab, setActiveTab] = useState('login'); // 'login' | 'register'

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [riskProfile, setRiskProfile] = useState('Aggressive');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAuthError(null);
    try {
      if (activeTab === 'login') {
        await login(email, password);
      } else {
        await register(email, password, name, riskProfile);
      }
      onClose();
    } catch (err) {
      // Error handled by AuthContext
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-3xl shadow-2xl overflow-hidden text-[var(--text-primary)]">
        
        {/* Top Header Glow Banner */}
        <div className="h-2 bg-gradient-to-r from-[#00E676] via-[#8B5CF6] to-[#3B82F6]" />

        {/* Modal Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-[var(--text-muted)] hover:text-white hover:bg-[var(--bg-input)] rounded-full transition-all cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 md:p-8 space-y-6">
          
          {/* Brand Badge */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#8B5CF6]/10 border border-[#8B5CF6]/30 text-[#A78BFA] text-xs font-bold rounded-full">
              <Sparkles className="w-3.5 h-3.5" />
              Zerodha AI Authentication
            </div>
            <h2 className="text-2xl font-black tracking-tight text-[var(--text-primary)]">
              {activeTab === 'login' ? 'Welcome Back' : 'Create Intelligence Account'}
            </h2>
            <p className="text-xs text-[var(--text-muted)]">
              Access AI portfolio governance & deep financial insights
            </p>
          </div>

          {/* Tab Switcher */}
          <div className="flex p-1 bg-[var(--bg-input)] rounded-2xl border border-[var(--border-subtle)]">
            <button
              type="button"
              onClick={() => { setActiveTab('login'); setAuthError(null); }}
              className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === 'login'
                  ? 'bg-gradient-to-r from-[#00E676] to-[#10B981] text-[#041A10] shadow-md'
                  : 'text-[var(--text-secondary)] hover:text-white'
              }`}
            >
              <LogIn className="w-4 h-4" />
              Login
            </button>
            <button
              type="button"
              onClick={() => { setActiveTab('register'); setAuthError(null); }}
              className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === 'register'
                  ? 'bg-gradient-to-r from-[#8B5CF6] to-[#7C3AED] text-white shadow-md'
                  : 'text-[var(--text-secondary)] hover:text-white'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              Register
            </button>
          </div>

          {/* Auth Error Banner */}
          {authError && (
            <div className="p-3 bg-[#FF5252]/10 border border-[#FF5252]/30 rounded-xl text-xs text-[#FF5252] flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {activeTab === 'register' && (
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[var(--text-secondary)]">Investor Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-[var(--text-muted)] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Vaibhav Pandey"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-[var(--bg-input)] border border-[var(--border-subtle)] rounded-xl text-xs text-[var(--text-primary)] focus:outline-none focus:border-[#8B5CF6] transition-colors"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[var(--text-secondary)]">Email or Username</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[var(--text-muted)] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Test123 or investor@zerodha.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-[var(--bg-input)] border border-[var(--border-subtle)] rounded-xl text-xs text-[var(--text-primary)] focus:outline-none focus:border-[#00E676] transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[var(--text-secondary)]">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[var(--text-muted)] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-[var(--bg-input)] border border-[var(--border-subtle)] rounded-xl text-xs text-[var(--text-primary)] focus:outline-none focus:border-[#00E676] transition-colors"
                />
              </div>
            </div>

            {activeTab === 'register' && (
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[var(--text-secondary)] flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-[#8B5CF6]" />
                  Risk Profile Preference
                </label>
                <select
                  value={riskProfile}
                  onChange={(e) => setRiskProfile(e.target.value)}
                  className="w-full py-2.5 px-3 bg-[var(--bg-input)] border border-[var(--border-subtle)] rounded-xl text-xs text-[var(--text-primary)] focus:outline-none focus:border-[#8B5CF6] transition-colors cursor-pointer"
                >
                  <option value="Conservative">Conservative (Capital Preservation)</option>
                  <option value="Moderate">Moderate (Balanced Bluechip Growth)</option>
                  <option value="Aggressive">Aggressive (Tech & High-Beta Growth)</option>
                </select>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 mt-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg ${
                activeTab === 'login'
                  ? 'btn-primary'
                  : 'bg-gradient-to-r from-[#8B5CF6] to-[#7C3AED] text-white hover:brightness-110 shadow-purple-500/20'
              } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : activeTab === 'login' ? (
                'Sign In to Dashboard'
              ) : (
                'Register Account'
              )}
            </button>
          </form>

          {/* Footer note */}
          <p className="text-[10px] text-center text-[var(--text-muted)]">
            By continuing, you agree to Zerodha AI Financial Intelligence Risk Governance Policy.
          </p>
        </div>
      </div>
    </div>
  );
}
