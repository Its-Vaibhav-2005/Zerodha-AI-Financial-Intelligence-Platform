import React, { useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { UploadCloud, FileText, CheckCircle2, AlertCircle, X, Sparkles, RefreshCw, ChevronRight } from 'lucide-react';

export default function PortfolioUploadModal({ isOpen, onClose, onUploadSuccess }) {
  const { authFetch, user } = useAuth();
  
  // State machine: 'idle' | 'uploading' | 'success' | 'error'
  const [status, setStatus] = useState('idle');
  const [selectedFile, setSelectedFile] = useState(null);
  const [investorName, setInvestorName] = useState(user?.email ? user.email.split('@')[0] : 'Zerodha Investor');
  const [riskProfile, setRiskProfile] = useState('Aggressive');
  const [errorMessage, setErrorMessage] = useState('');
  const [uploadResult, setUploadResult] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const validateAndSetFile = (file) => {
    setErrorMessage('');
    if (!file) return;

    const fileName = file.name.toLowerCase();
    if (!fileName.endsWith('.csv') && !fileName.endsWith('.xlsx') && !fileName.endsWith('.xls')) {
      setErrorMessage('Invalid file format. Please upload a valid CSV (.csv) or Excel (.xlsx, .xls) file.');
      setSelectedFile(null);
      return;
    }
    setSelectedFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setErrorMessage('Please select a Zerodha CSV file to upload.');
      return;
    }

    setStatus('uploading');
    setErrorMessage('');

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('investor_name', investorName);
      formData.append('risk_profile', riskProfile);
      formData.append('user_id', user?.id ? String(user.id) : '1');

      const response = await authFetch('http://localhost:5000/api/portfolio/upload', {
        method: 'POST',
        body: formData,
      });

      const json = await response.json();

      if (!response.ok || json.status === 'error') {
        throw new Error(json.message || 'Failed to upload portfolio CSV.');
      }

      // Success
      setUploadResult(json);
      setStatus('success');

      if (onUploadSuccess) {
        onUploadSuccess(json.portfolio_id, json);
      }
    } catch (err) {
      console.error('[CSV Upload Error]:', err);
      setErrorMessage(err.message || 'An unexpected error occurred during upload.');
      setStatus('error');
    }
  };

  const handleReset = () => {
    setStatus('idle');
    setSelectedFile(null);
    setUploadResult(null);
    setErrorMessage('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-3xl shadow-2xl overflow-hidden text-[var(--text-primary)]">
        
        {/* Top Accent Strip */}
        <div className="h-2 bg-gradient-to-r from-[#00E676] via-[#3B82F6] to-[#8B5CF6]" />

        {/* Modal Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-[var(--text-muted)] hover:text-white hover:bg-[var(--bg-input)] rounded-full transition-all cursor-pointer z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 md:p-8 space-y-6">
          
          {/* Header */}
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#00E676]/10 border border-[#00E676]/30 text-[#00E676] text-xs font-bold rounded-full">
              <Sparkles className="w-3.5 h-3.5" />
              Zerodha Kite CSV Ingestion
            </div>
            <h2 className="text-2xl font-black tracking-tight">Import Holdings Portfolio</h2>
            <p className="text-xs text-[var(--text-muted)]">
              Upload your Kite holdings export to trigger AI sector normalization & risk scoring
            </p>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3 bg-[#FF5252]/10 border border-[#FF5252]/30 rounded-xl text-xs text-[#FF5252] flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* STATE 1: IDLE */}
          {(status === 'idle' || status === 'error') && (
            <form onSubmit={handleUploadSubmit} className="space-y-5">
              
              {/* Drag and Drop Box */}
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current?.click()}
                className={`relative border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                  isDragOver
                    ? 'border-[#00E676] bg-[#00E676]/10 scale-[1.01]'
                    : selectedFile
                    ? 'border-[#3B82F6] bg-[#3B82F6]/5'
                    : 'border-[var(--border-subtle)] hover:border-[#00E676]/50 bg-[var(--bg-input)]'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv, .xlsx, .xls"
                  className="hidden"
                  onChange={(e) => e.target.files && validateAndSetFile(e.target.files[0])}
                />

                {selectedFile ? (
                  <div className="flex items-center justify-center gap-3">
                    <div className="p-3 rounded-xl bg-[#3B82F6]/10 border border-[#3B82F6]/30 text-[#3B82F6]">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-bold text-[var(--text-primary)] truncate max-w-[220px]">
                        {selectedFile.name}
                      </p>
                      <p className="text-[11px] text-[var(--text-muted)] font-mono">
                        {(selectedFile.size / 1024).toFixed(1)} KB • File Ready
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="w-12 h-12 mx-auto rounded-2xl bg-[#00E676]/10 border border-[#00E676]/30 flex items-center justify-center text-[#00E676]">
                      <UploadCloud className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[var(--text-primary)]">
                        Drag & Drop your Zerodha CSV or Excel file here
                      </p>
                      <p className="text-[11px] text-[var(--text-muted)] mt-1">
                        Or click to browse files from your device (.csv, .xlsx, .xls)
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Form Metadata Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[var(--text-secondary)]">Investor / Portfolio Tag</label>
                  <input
                    type="text"
                    required
                    value={investorName}
                    onChange={(e) => setInvestorName(e.target.value)}
                    className="w-full px-3 py-2 bg-[var(--bg-input)] border border-[var(--border-subtle)] rounded-xl text-xs text-[var(--text-primary)] focus:outline-none focus:border-[#00E676]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[var(--text-secondary)]">Risk Target</label>
                  <select
                    value={riskProfile}
                    onChange={(e) => setRiskProfile(e.target.value)}
                    className="w-full px-3 py-2 bg-[var(--bg-input)] border border-[var(--border-subtle)] rounded-xl text-xs text-[var(--text-primary)] focus:outline-none focus:border-[#00E676] cursor-pointer"
                  >
                    <option value="Aggressive">Aggressive Tech Growth</option>
                    <option value="Moderate">Moderate Bluechip</option>
                    <option value="Conservative">Conservative Capital</option>
                  </select>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={!selectedFile}
                className={`w-full py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg ${
                  selectedFile
                    ? 'btn-primary'
                    : 'bg-[var(--bg-input)] text-[var(--text-muted)] cursor-not-allowed border border-[var(--border-subtle)]'
                }`}
              >
                <UploadCloud className="w-4 h-4" />
                Upload & Process Zerodha CSV
              </button>
            </form>
          )}

          {/* STATE 2: UPLOADING / PARSING */}
          {status === 'uploading' && (
            <div className="py-8 space-y-6 text-center animate-pulse">
              <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-4 border-[#00E676]/20 border-t-[#00E676] animate-spin" />
                <RefreshCw className="w-7 h-7 text-[#00E676] animate-spin" />
              </div>
              <div className="space-y-2">
                <h3 className="text-base font-bold text-[var(--text-primary)]">
                  Normalizing & Parsing Zerodha Holdings...
                </h3>
                <p className="text-xs text-[var(--text-muted)] font-mono">
                  Standardizing tickers (`normalize_symbol`), mapping sectors & calculating P&L metrics
                </p>
              </div>

              {/* Shimmer Progress Steps */}
              <div className="p-4 bg-[var(--bg-input)] rounded-2xl border border-[var(--border-subtle)] space-y-2 text-left text-xs font-mono text-[var(--text-secondary)]">
                <div className="flex items-center justify-between text-[#00E676]">
                  <span>✓ Parsing CSV column mappings</span>
                  <span className="text-[10px]">100%</span>
                </div>
                <div className="flex items-center justify-between text-[#3B82F6]">
                  <span>⚡ Normalizing Zerodha symbols to NSE tickers</span>
                  <span className="text-[10px]">Processing...</span>
                </div>
                <div className="flex items-center justify-between text-[var(--text-muted)]">
                  <span>○ Ingesting holdings into NeonDB portfolio store</span>
                  <span className="text-[10px]">Pending</span>
                </div>
              </div>
            </div>
          )}

          {/* STATE 3: SUCCESS */}
          {status === 'success' && uploadResult && (
            <div className="py-6 space-y-6 text-center animate-fadeIn">
              <div className="w-16 h-16 mx-auto rounded-full bg-[#00E676]/15 border border-[#00E676]/40 flex items-center justify-center text-[#00E676]">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div className="space-y-1">
                <h3 className="text-xl font-extrabold text-[var(--text-primary)]">
                  Portfolio Ingested Successfully!
                </h3>
                <p className="text-xs text-[var(--text-muted)]">
                  Created new portfolio ID: <span className="font-mono text-[#00E676] font-bold">{uploadResult.portfolio_id}</span>
                </p>
              </div>

              {/* Success Metrics Box */}
              <div className="grid grid-cols-2 gap-3 p-4 bg-[var(--bg-input)] rounded-2xl border border-[var(--border-subtle)]">
                <div className="text-center">
                  <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider font-semibold">Imported Stocks</p>
                  <p className="text-xl font-black text-[#00E676]">{uploadResult.holdings_count}</p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider font-semibold">Status</p>
                  <p className="text-xs font-bold text-[#3B82F6] mt-1">Ready for AI Insights</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleReset}
                  className="flex-1 py-2.5 btn-secondary text-xs font-bold cursor-pointer"
                >
                  Upload Another
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 py-2.5 btn-primary text-xs font-bold flex items-center justify-center gap-1 cursor-pointer"
                >
                  <span>Open Portfolio</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
