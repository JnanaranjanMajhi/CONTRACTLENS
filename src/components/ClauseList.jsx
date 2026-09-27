export default function ClauseList({ clauses = [], onSelectClause, activeSectionNumber }) {
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
    <div className="pt-6 animate-clean-fade">
      <div className="flex items-center justify-between mb-3 border-b border-stone-200/80 pb-2">
        <div>
          <h2 className="text-sm font-semibold text-stone-900 tracking-tight">
            All sections
          </h2>
          <p className="text-xs text-stone-500">
            Document table of contents · Click any section to inspect verbatim source & Gemini analysis
          </p>
        </div>
        <span className="text-xs font-mono text-stone-400">
          {clauses.length} items
        </span>
      </div>

      {/* Document Table of Contents Index */}
      <div className="bg-white border border-stone-200/90 rounded divide-y divide-stone-100 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
        {clauses.map((clause) => {
          const formattedNum = String(clause.sectionNumber).padStart(2, '0');
          const isActive = activeSectionNumber === clause.sectionNumber;

          return (
            <div
              key={clause.sectionNumber}
              onClick={() => onSelectClause(clause)}
              className={`p-3 sm:px-4 sm:py-3.5 flex items-center justify-between gap-4 transition-colors cursor-pointer group ${
                isActive
                  ? 'bg-stone-100/90 font-medium'
                  : 'hover:bg-[#FAF9F7]'
              }`}
            >
              {/* Left: Number + Title + Category */}
              <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                <span className="font-mono text-xs text-stone-400 font-semibold group-hover:text-stone-700 transition-colors shrink-0">
                  {formattedNum}
                </span>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-stone-900 text-xs sm:text-sm truncate group-hover:text-stone-950 transition-colors">
                      {clause.title}
                    </span>
                    <span className="hidden sm:inline-block text-[11px] text-stone-400 font-normal truncate">
                      · {clause.category}
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-500 truncate max-w-sm sm:max-w-md md:max-w-xl mt-0.5">
                    {clause.plainEnglish}
                  </p>
                </div>
              </div>

              {/* Right: Risk Badge + Arrow */}
              <div className="flex items-center gap-3 shrink-0">
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded uppercase tracking-wider border ${getRiskBadge(
                    clause.risk
                  )}`}
                >
                  {clause.risk}
                </span>

                <svg
                  className="w-4 h-4 text-stone-400 group-hover:text-stone-700 group-hover:translate-x-0.5 transition-all"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
