import { useEffect } from 'react';

export default function ClauseDetail({
  clause,
  onClose,
  onNext,
  onPrev,
  hasPrev,
  hasNext,
  totalClauses,
}) {
  // Keyboard navigation: Escape to close, Arrows to navigate
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight' && hasNext && onNext) onNext();
      if (e.key === 'ArrowLeft' && hasPrev && onPrev) onPrev();
    };
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [onClose, onNext, onPrev, hasPrev, hasNext]);

  const formattedNum = String(clause.sectionNumber).padStart(2, '0');

  const getRiskBadge = (risk) => {
    switch (risk) {
      case 'HIGH':
        return {
          bg: 'bg-rose-50 text-rose-800 border-rose-200',
          label: 'HIGH CONCERN',
        };
      case 'MEDIUM':
        return {
          bg: 'bg-amber-50 text-amber-800 border-amber-200',
          label: 'MEDIUM CONCERN',
        };
      case 'LOW':
        return {
          bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
          label: 'LOW CONCERN',
        };
      default:
        return {
          bg: 'bg-stone-100 text-stone-700 border-stone-200',
          label: 'ASSESSMENT',
        };
    }
  };

  const riskBadge = getRiskBadge(clause.risk);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-stone-900/40 backdrop-blur-[2px] animate-clean-fade"
      onClick={onClose}
    >
      {/* Split Workspace Modal */}
      <div
        className="relative w-full max-w-5xl max-h-[92vh] flex flex-col bg-[#FBFBFA] border border-[#D6D3D1] rounded-lg shadow-2xl overflow-hidden animate-clean-modal"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Workspace Header Bar */}
        <div className="px-4 sm:px-6 py-3 bg-[#FAF9F7] border-b border-[#E7E5E4] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs font-semibold text-stone-500 bg-stone-200/80 px-2 py-0.5 rounded">
              Section {formattedNum} of {totalClauses || '—'}
            </span>
            <h2 className="text-sm sm:text-base font-semibold text-stone-900 truncate">
              {clause.title}
            </h2>
            <span className="hidden sm:inline-block text-xs text-stone-400">
              · {clause.category}
            </span>
          </div>

          {/* Navigation & Close */}
          <div className="flex items-center gap-2">
            <div className="flex items-center border border-stone-200 rounded overflow-hidden">
              <button
                onClick={onPrev}
                disabled={!hasPrev}
                className="px-2.5 py-1 text-xs text-stone-600 hover:text-stone-900 hover:bg-stone-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                title="Previous section (Left arrow)"
              >
                ← Prev
              </button>
              <div className="w-[1px] h-4 bg-stone-200" />
              <button
                onClick={onNext}
                disabled={!hasNext}
                className="px-2.5 py-1 text-xs text-stone-600 hover:text-stone-900 hover:bg-stone-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                title="Next section (Right arrow)"
              >
                Next →
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-stone-800 rounded hover:bg-stone-100 transition-colors cursor-pointer"
              aria-label="Close overview (Esc)"
              title="Close (Esc)"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Split Workspace Columns */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-[#E7E5E4]">
          {/* ════════════════════════════════════════════════════════════════
              LEFT COLUMN: ORIGINAL CONTRACT (Verbatim Source Text)
             ════════════════════════════════════════════════════════════════ */}
          <div className="p-5 sm:p-6 bg-[#FAF9F7] flex flex-col justify-between">
            <div>
              {/* Header Label */}
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-stone-200/80">
                <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                  Original Contract
                </span>
                <span className="text-[10px] font-semibold text-stone-400 uppercase tracking-widest bg-stone-100 border border-stone-200 px-1.5 py-0.5 rounded">
                  Verbatim Source
                </span>
              </div>

              {/* Exact Source Clause Text in Serif Font */}
              <div className="font-document text-sm sm:text-base text-stone-900 leading-relaxed whitespace-pre-line bg-white p-4 sm:p-5 rounded border border-stone-200 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                {clause.originalText}
              </div>
            </div>

            {/* Document Grounding Guarantee */}
            <div className="mt-6 pt-3 border-t border-stone-200/70 text-[11px] text-stone-400 flex items-center justify-between">
              <span>Exact excerpt from submitted agreement</span>
              <span className="font-mono text-[10px]">100% Unaltered</span>
            </div>
          </div>

          {/* ════════════════════════════════════════════════════════════════
              RIGHT COLUMN: CONTRACTLENS ANALYSIS (Gemini Review)
             ════════════════════════════════════════════════════════════════ */}
          <div className="p-5 sm:p-6 bg-white flex flex-col justify-between space-y-6">
            <div className="space-y-5">
              {/* Header Label & Risk Badge */}
              <div className="flex items-center justify-between pb-3 border-b border-stone-200/80">
                <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                  ContractLens Analysis
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider border ${riskBadge.bg}`}
                >
                  {riskBadge.label}
                </span>
              </div>

              {/* Plain English Explanation */}
              <div>
                <h3 className="text-xs font-semibold text-stone-900 uppercase tracking-wider mb-1.5">
                  Plain English
                </h3>
                <p className="text-stone-700 text-sm leading-relaxed">
                  {clause.plainEnglish}
                </p>
              </div>

              {/* Why It Matters */}
              <div>
                <h3 className="text-xs font-semibold text-stone-900 uppercase tracking-wider mb-1.5">
                  Why It Matters
                </h3>
                <p className="text-stone-700 text-sm leading-relaxed">
                  {clause.whyItMatters}
                </p>
              </div>

              {/* Questions to Consider */}
              {clause.questionsToAsk && clause.questionsToAsk.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold text-stone-900 uppercase tracking-wider mb-2">
                    Questions to Consider
                  </h3>
                  <ul className="space-y-1.5">
                    {clause.questionsToAsk.map((q, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-stone-700 leading-relaxed">
                        <span className="text-stone-400 mt-0.5 shrink-0 font-bold">•</span>
                        <span>{q}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Analysis Metadata Footer */}
            <div className="pt-3 border-t border-stone-100 text-[11px] text-stone-400 flex items-center justify-between">
              <span>Analysis generated by Google Gemini</span>
              <span>Educational review · Not legal advice</span>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Quick Back Button */}
        <div className="px-4 py-2.5 bg-[#FAF9F7] border-t border-[#E7E5E4] flex items-center justify-between text-xs text-stone-500 shrink-0">
          <span className="text-[11px] text-stone-400">
            Use Left / Right arrow keys to switch sections · Esc to close
          </span>
          <button
            onClick={onClose}
            className="text-stone-700 hover:text-stone-950 font-medium underline underline-offset-2 cursor-pointer"
          >
            ← Back to Overview
          </button>
        </div>
      </div>
    </div>
  );
}
