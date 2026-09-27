export default function Header({ onReset, onToggleSidebar, activeDocumentTitle, isAnalyzing, overallRisk }) {
  const getRiskBadge = (risk) => {
    switch (risk) {
      case 'HIGH':
        return 'bg-rose-50 text-rose-800 border-rose-200';
      case 'MEDIUM':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'LOW':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      default:
        return 'bg-stone-100 text-stone-700 border-stone-200';
    }
  };

  return (
    <header className="sticky top-0 z-30 h-14 bg-[#FBFBFA]/95 backdrop-blur-sm border-b border-[#E7E5E4] px-4 sm:px-6 flex items-center justify-between">
      {/* Left: Mobile Toggle & Brand / Breadcrumb */}
      <div className="flex items-center gap-3">
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="md:hidden p-1.5 text-stone-500 hover:text-stone-900 rounded-md hover:bg-stone-100 transition-colors"
            aria-label="Toggle navigation menu"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>
        )}

        <div className="flex items-center gap-2.5">
          <button
            onClick={onReset}
            className="flex items-center gap-2 group text-left focus:outline-none cursor-pointer"
          >
            <span className="w-6 h-6 rounded bg-[#1C1917] text-[#FBFBFA] flex items-center justify-center font-bold text-xs tracking-wider">
              CL
            </span>
            <span className="font-semibold text-stone-900 text-sm tracking-tight group-hover:text-stone-700 transition-colors">
              ContractLens
            </span>
          </button>

          {activeDocumentTitle && (
            <>
              <span className="text-stone-300 text-xs">/</span>
              <span className="text-xs font-medium text-stone-600 truncate max-w-[200px] sm:max-w-xs md:max-w-md">
                {activeDocumentTitle}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Right: Risk status indicator + New Analysis action + Ready status */}
      <div className="flex items-center gap-3">
        {overallRisk && (
          <span className={`hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold border uppercase tracking-wide ${getRiskBadge(overallRisk)}`}>
            {overallRisk} RISK
          </span>
        )}

        <div className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-stone-500 font-medium">
          <span
            className={`w-2 h-2 rounded-full ${
              isAnalyzing ? 'bg-amber-500 animate-pulse' : 'bg-emerald-600'
            }`}
          />
          <span>{isAnalyzing ? 'Analyzing…' : 'Ready'}</span>
        </div>

        {onReset && (
          <button
            onClick={onReset}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-stone-700 hover:text-stone-950 bg-stone-100 hover:bg-stone-200/80 border border-stone-200/80 rounded transition-colors cursor-pointer"
          >
            <svg className="w-3.5 h-3.5 text-stone-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            <span>New Analysis</span>
          </button>
        )}
      </div>
    </header>
  );
}
