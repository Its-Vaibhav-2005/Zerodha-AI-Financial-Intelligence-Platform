import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ThumbsUp, Flag, CheckCircle2, Send, AlertTriangle, X, ShieldAlert } from 'lucide-react';

export default function InsightFeedbackBar({ portfolioId = 'PORT-1001', promptHash = '' }) {
  const { authFetch } = useAuth();
  
  const [ratingState, setRatingState] = useState(null); // null | 'helpful' | 'reported'
  const [isReportDrawerOpen, setIsReportDrawerOpen] = useState(false);
  const [reportReason, setReportReason] = useState('Hallucinated data');
  const [customComment, setCustomComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleHelpfulClick = async () => {
    if (ratingState === 'helpful') return;
    setIsSubmitting(true);
    try {
      await authFetch('http://localhost:5000/api/feedback', {
        method: 'POST',
        body: JSON.stringify({
          portfolio_id: portfolioId,
          rating: 'HELPFUL',
          feedback_text: 'User found AI insight helpful.',
          model_version: 'gemini-3.5-flash',
          prompt_hash: promptHash || 'hash-auto-generated'
        }),
      });
      setRatingState('helpful');
    } catch (err) {
      console.error('[Feedback Error]:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReportSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const fullText = `${reportReason}${customComment ? `: ${customComment}` : ''}`;
      await authFetch('http://localhost:5000/api/feedback', {
        method: 'POST',
        body: JSON.stringify({
          portfolio_id: portfolioId,
          rating: 'REPORTED',
          feedback_text: fullText,
          model_version: 'gemini-3.5-flash',
          prompt_hash: promptHash || 'hash-auto-generated'
        }),
      });
      setRatingState('reported');
      setSubmitSuccess(true);
      setTimeout(() => {
        setIsReportDrawerOpen(false);
        setSubmitSuccess(false);
      }, 1500);
    } catch (err) {
      console.error('[Report Feedback Error]:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pt-4 border-t border-[var(--border-subtle)] mt-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        
        {/* Left Label */}
        <div className="flex items-center gap-2 text-[var(--text-muted)] font-medium">
          <ShieldAlert className="w-3.5 h-3.5 text-[#8B5CF6]" />
          <span>AI Insight Governance & Feedback Audit</span>
        </div>

        {/* Action Triggers */}
        <div className="flex items-center gap-2">
          
          {/* Helpful Button */}
          <button
            onClick={handleHelpfulClick}
            disabled={isSubmitting || ratingState === 'helpful'}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border font-semibold transition-all cursor-pointer ${
              ratingState === 'helpful'
                ? 'bg-[#00E676]/15 border-[#00E676]/40 text-[#00E676]'
                : 'bg-[var(--bg-input)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[#00E676] hover:border-[#00E676]/40'
            }`}
          >
            {ratingState === 'helpful' ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-[#00E676]" />
                <span>Helpful Registered</span>
              </>
            ) : (
              <>
                <ThumbsUp className="w-3.5 h-3.5" />
                <span>Helpful</span>
              </>
            )}
          </button>

          {/* Report Button */}
          <button
            onClick={() => setIsReportDrawerOpen(true)}
            disabled={isSubmitting}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border font-semibold transition-all cursor-pointer ${
              ratingState === 'reported'
                ? 'bg-[#FF5252]/15 border-[#FF5252]/40 text-[#FF5252]'
                : 'bg-[var(--bg-input)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[#FF5252] hover:border-[#FF5252]/40'
            }`}
          >
            <Flag className="w-3.5 h-3.5" />
            <span>{ratingState === 'reported' ? 'Reported' : 'Report Insight'}</span>
          </button>
        </div>
      </div>

      {/* Report Modal / Drawer */}
      {isReportDrawerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-fadeIn">
          <div className="relative w-full max-w-md bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-3xl p-6 shadow-2xl space-y-4 text-[var(--text-primary)]">
            
            <button
              onClick={() => setIsReportDrawerOpen(false)}
              className="absolute top-4 right-4 p-1.5 text-[var(--text-muted)] hover:text-white hover:bg-[var(--bg-input)] rounded-full transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 text-[#FF5252] font-bold text-sm">
              <AlertTriangle className="w-4 h-4" />
              <span>Report AI Insight Quality Issue</span>
            </div>

            <p className="text-xs text-[var(--text-muted)]">
              Your feedback is audited to refine model prompts & prevent hallucinations.
            </p>

            {submitSuccess ? (
              <div className="py-6 text-center space-y-2 text-[#00E676]">
                <CheckCircle2 className="w-8 h-8 mx-auto" />
                <p className="text-xs font-bold">Feedback Logged in NeonDB Audit System!</p>
              </div>
            ) : (
              <form onSubmit={handleReportSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[var(--text-secondary)]">Primary Issue Category</label>
                  <select
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    className="w-full py-2 px-3 bg-[var(--bg-input)] border border-[var(--border-subtle)] rounded-xl text-xs text-[var(--text-primary)] focus:outline-none focus:border-[#FF5252] cursor-pointer"
                  >
                    <option value="Hallucinated data">Hallucinated ticker or company facts</option>
                    <option value="Incorrect P&L">Incorrect P&L calculation</option>
                    <option value="Outdated market prices">Outdated market price info</option>
                    <option value="Irrelevant suggestion">Irrelevant risk mitigation suggestion</option>
                    <option value="Other">Other compliance issue</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[var(--text-secondary)]">Additional Details (Optional)</label>
                  <textarea
                    rows={3}
                    placeholder="Describe what seemed inaccurate..."
                    value={customComment}
                    onChange={(e) => setCustomComment(e.target.value)}
                    className="w-full p-3 bg-[var(--bg-input)] border border-[var(--border-subtle)] rounded-xl text-xs text-[var(--text-primary)] focus:outline-none focus:border-[#FF5252]"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsReportDrawerOpen(false)}
                    className="flex-1 py-2 btn-secondary text-xs font-bold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 py-2 bg-gradient-to-r from-[#FF5252] to-[#EF4444] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-md hover:brightness-110"
                  >
                    {isSubmitting ? (
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Submit Audit Log</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
