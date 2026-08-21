import React from 'react';
import { AlertCircle, RefreshCw, Database, ServerOff } from 'lucide-react';

export default function FallbackState({ error, onRetry, onUseDemoData }) {
  return (
    <div className="w-full max-w-3xl mx-auto my-12 p-8 surface-card rounded-3xl border border-[#FF5252]/30 text-center space-y-6 shadow-xl">
      <div className="w-16 h-16 bg-[#FF5252]/10 border border-[#FF5252]/20 rounded-full flex items-center justify-center mx-auto text-[#FF5252]">
        <ServerOff className="w-8 h-8" />
      </div>

      <div className="space-y-2">
        <h2 className="text-xl md:text-2xl font-black text-[var(--text-primary)] tracking-wide">
          Real-time Insights Temporarily Unavailable
        </h2>
        <p className="text-[var(--text-muted)] text-sm max-w-md mx-auto">
          We encountered an issue connecting to the AI Portfolio Intelligence Engine at <code className="text-xs bg-[var(--bg-input)] px-1.5 py-0.5 rounded text-[var(--text-primary)] font-mono">http://localhost:5000</code>.
        </p>
      </div>

      {error && (
        <div className="bg-[#FF5252]/10 border border-[#FF5252]/30 p-4 rounded-2xl text-left text-xs text-[#FF5252] font-mono overflow-x-auto max-w-xl mx-auto">
          <div className="flex items-center gap-2 mb-1 font-bold">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>Diagnostic Error Details:</span>
          </div>
          <p className="pl-6 break-words">{typeof error === 'string' ? error : error.message || JSON.stringify(error)}</p>
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
        <button
          onClick={onRetry}
          className="w-full sm:w-auto btn-primary px-6 py-2.5 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Retry Backend Connection</span>
        </button>

        {onUseDemoData && (
          <button
            onClick={onUseDemoData}
            className="w-full sm:w-auto btn-secondary px-6 py-2.5 text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer"
          >
            <Database className="w-4 h-4 text-[#00E676]" />
            <span>Load Offline Demo Insights</span>
          </button>
        )}
      </div>

      <p className="text-xs text-[var(--text-muted)] pt-2 font-mono">
        Ensure backend Flask server is running on port 5000 (`python backend/app.py`).
      </p>
    </div>
  );
}
