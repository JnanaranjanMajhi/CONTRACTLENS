export default function RiskDashboard({ analysis, documentTitle, onSelectClause }) {
  const { overallRisk, summary, keyConcerns = [], clauses = [] } = analysis;

  const highCount = clauses.filter((c) => (c.riskLevel || c.risk) === 'HIGH').length;
  const mediumCount = clauses.filter((c) => (c.riskLevel || c.risk) === 'MEDIUM').length;
  const totalSections = clauses.length;
  const keyConcernsCount = highCount + mediumCount;

  // Helper to find a clause associated with a legacy string concern
  const findMatchingClause = (concernStr) => {
    if (!concernStr || typeof concernStr !== 'string') return null;
    const lower = concernStr.toLowerCase();
    return (
      clauses.find((c) => {
        const titleLower = c.title.toLowerCase();
        const numMatch = lower.includes(`section ${c.sectionNumber}`) || lower.includes(`${c.sectionNumber}.`);
        return lower.startsWith(titleLower) || lower.includes(`(${c.category.toLowerCase()})`) || numMatch;
      }) || clauses.find((c) => (c.riskLevel || c.risk) === 'HIGH' || (c.riskLevel || c.risk) === 'MEDIUM')
    );
  };

  const getRiskLabel = (risk) => {
    switch (risk) {
      case 'HIGH':
        return { label: 'HIGH RISK', assessment: 'Significant concerns identified' };
      case 'MEDIUM':
        return { label: 'MEDIUM RISK', assessment: 'Notable terms worth reviewing' };
      default:
        return { label: 'LOW RISK', assessment: 'Standard procedural provisions' };
    }
  };

  const riskInfo = getRiskLabel(overallRisk);

  return (
    <div className="space-y-6 animate-clean-fade">
      {/* Document Header */}
      <div className="border-b border-stone-200/80 pb-4">
        <h1 className="text-xl sm:text-2xl font-bold text-stone-900 tracking-tight">
          {documentTitle || 'Contract Review'}
        </h1>
        <p className="text-xs text-stone-500 mt-1">
          {totalSections} sections · Review complete · Educational analysis
        </p>
      </div>

      {/* Compact Information Blocks (Restrained, bordered blocks) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Block 1: Potential Risk */}
        <div className="p-4 bg-white border border-stone-200/90 rounded text-left">
          <div className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider mb-1">
            Potential Risk
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`text-base font-bold ${
                overallRisk === 'HIGH'
                  ? 'text-rose-800'
                  : overallRisk === 'MEDIUM'
                  ? 'text-amber-800'
                  : 'text-emerald-800'
              }`}
            >
              {overallRisk || 'LOW'}
            </span>
            <span className="text-xs text-stone-500">· {riskInfo.assessment}</span>
          </div>
        </div>

        {/* Block 2: Sections Reviewed */}
        <div className="p-4 bg-white border border-stone-200/90 rounded text-left">
          <div className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider mb-1">
            Sections Reviewed
          </div>
          <div className="text-base font-bold text-stone-900">
            {totalSections}{' '}
            <span className="text-xs font-normal text-stone-500">
              numbered provisions
            </span>
          </div>
        </div>

        {/* Block 3: Key Concerns Count */}
        <div className="p-4 bg-white border border-stone-200/90 rounded text-left">
          <div className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider mb-1">
            Key Concerns
          </div>
          <div className="text-base font-bold text-stone-900">
            {keyConcernsCount}{' '}
            <span className="text-xs font-normal text-stone-500">
              items to verify
            </span>
          </div>
        </div>
      </div>

      {/* Summary Narrative */}
      {summary && (
        <div className="p-4 bg-white border border-stone-200/90 rounded">
          <div className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider mb-1.5">
            Executive Summary
          </div>
          <p className="text-stone-700 text-sm leading-relaxed">
            {summary}
          </p>
        </div>
      )}

      {/* Key Concerns List (Clickable Rows referencing validated clauses) */}
      {keyConcerns && keyConcerns.length > 0 && (
        <div className="pt-2">
          <div className="mb-3">
            <h2 className="text-sm font-semibold text-stone-900 tracking-tight">
              Key Concerns
            </h2>
            <p className="text-xs text-stone-500">
              Items worth clarifying before signing
            </p>
          </div>

          <div className="space-y-2">
            {keyConcerns.map((concern, index) => {
              const isObj = typeof concern === 'object' && concern !== null;
              const sectionNum = isObj ? concern.sectionNumber : null;
              const matchedClause = sectionNum
                ? clauses.find((c) => c.sectionNumber === sectionNum)
                : findMatchingClause(concern);

              // Single source of truth for risk level
              const validatedRiskLevel = matchedClause
                ? (matchedClause.riskLevel || matchedClause.risk)
                : (isObj ? (concern.riskLevel || concern.risk) : (overallRisk || 'MEDIUM'));

              let titlePart = isObj ? concern.title : null;
              let bodyPart = isObj ? concern.reason : null;

              if (!titlePart || !bodyPart) {
                const concernStr = typeof concern === 'string' ? concern : '';
                const parts = concernStr.match(/^([^:]+):\s*(.+)$/);
                titlePart = titlePart || (parts ? parts[1].trim() : matchedClause?.title || `Concern ${index + 1}`);
                bodyPart = bodyPart || (parts ? parts[2].trim() : concernStr);
              }

              return (
                <div
                  key={index}
                  onClick={() => matchedClause && onSelectClause(matchedClause)}
                  className={`p-3.5 bg-white border border-stone-200/90 rounded transition-all duration-150 ${
                    matchedClause
                      ? 'hover:border-stone-400 hover:bg-[#FAFAF9] cursor-pointer group'
                      : ''
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider border ${
                        validatedRiskLevel === 'HIGH'
                          ? 'bg-rose-50 text-rose-800 border-rose-200'
                          : 'bg-amber-50 text-amber-800 border-amber-200'
                      }`}
                    >
                      {validatedRiskLevel}
                    </span>

                    {matchedClause && (
                      <span className="text-xs text-stone-400 group-hover:text-stone-700 flex items-center gap-1 transition-colors">
                        <span>View section</span>
                        <span>→</span>
                      </span>
                    )}
                  </div>

                  <h3 className="text-xs sm:text-sm font-semibold text-stone-900 mb-1 group-hover:text-stone-950">
                    {titlePart}
                  </h3>

                  <p className="text-xs text-stone-600 leading-relaxed">
                    {bodyPart}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
