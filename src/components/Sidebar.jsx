import { sampleContracts } from '../data/sampleContract';

export default function Sidebar({
  isOpen,
  onClose,
  onNewAnalysis,
  onSelectPreset,
  currentContractTitle,
  clauses,
  onSelectClause,
  activeSectionNumber,
  onOpenPrivacy,
  onOpenAbout,
}) {
  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-stone-900/20 backdrop-blur-[2px] md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-50 md:z-20 h-screen w-64 shrink-0 bg-[#FBFBFA] border-r border-[#E7E5E4] flex flex-col justify-between transition-transform duration-200 ease-in-out md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Top: Brand & Primary Action */}
        <div className="p-4 border-b border-[#E7E5E4]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded bg-[#1C1917] text-[#FBFBFA] flex items-center justify-center font-bold text-[10px] tracking-wider">
                  CL
                </span>
                <span className="font-semibold text-stone-900 text-sm tracking-tight">
                  ContractLens
                </span>
              </div>
              <p className="text-[11px] text-stone-500 mt-1 leading-tight">
                Understand the contract before you sign it.
              </p>
            </div>

            <button
              onClick={onClose}
              className="md:hidden p-1 text-stone-400 hover:text-stone-700 rounded"
              aria-label="Close navigation"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <button
            onClick={() => {
              onNewAnalysis();
              if (onClose) onClose();
            }}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold text-white bg-[#1C1917] hover:bg-stone-800 rounded transition-colors cursor-pointer"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            <span>+ New Analysis</span>
          </button>
        </div>

        {/* Scrollable Navigation Body */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 text-xs">
          {/* Active Contract Sections (Table of Contents Jump List) */}
          {clauses && clauses.length > 0 && (
            <div>
              <div className="px-2 mb-2 flex items-center justify-between text-[11px] font-semibold text-stone-400 uppercase tracking-wider">
                <span>Document Sections</span>
                <span className="font-normal text-stone-500">{clauses.length}</span>
              </div>
              <div className="space-y-0.5">
                {clauses.map((clause) => {
                  const isActive = activeSectionNumber === clause.sectionNumber;
                  const formattedNum = String(clause.sectionNumber).padStart(2, '0');
                  return (
                    <button
                      key={clause.sectionNumber}
                      onClick={() => {
                        onSelectClause(clause);
                        if (onClose) onClose();
                      }}
                      className={`w-full text-left px-2.5 py-1.5 rounded flex items-center justify-between transition-colors cursor-pointer group ${
                        isActive
                          ? 'bg-stone-200/80 text-stone-900 font-semibold'
                          : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate pr-2">
                        <span className="font-mono text-[11px] text-stone-400 group-hover:text-stone-600">
                          {formattedNum}
                        </span>
                        <span className="truncate">{clause.title}</span>
                      </div>
                      <span
                        className={`text-[9px] font-semibold px-1 py-0.2 rounded uppercase ${
                          clause.risk === 'HIGH'
                            ? 'text-rose-700 bg-rose-50'
                            : clause.risk === 'MEDIUM'
                            ? 'text-amber-700 bg-amber-50'
                            : 'text-stone-400'
                        }`}
                      >
                        {clause.risk === 'LOW' ? '' : clause.risk}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Sample Contracts Preset List */}
          <div>
            <div className="px-2 mb-2 text-[11px] font-semibold text-stone-400 uppercase tracking-wider">
              Presets & Sample Agreements
            </div>
            <div className="space-y-1">
              {sampleContracts.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectPreset(item.text, item.title);
                    if (onClose) onClose();
                  }}
                  className="w-full text-left p-2 rounded hover:bg-stone-100 transition-colors cursor-pointer group"
                >
                  <div className="font-medium text-stone-800 group-hover:text-stone-950 truncate">
                    {item.title}
                  </div>
                  <div className="text-[10px] text-stone-400 truncate mt-0.5">
                    {item.subtitle}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom: Legal & Powered By */}
        <div className="p-3 border-t border-[#E7E5E4] text-[11px] text-stone-500 space-y-2 bg-[#F6F6F4]">
          <div className="flex items-center justify-between px-1">
            <button
              onClick={onOpenPrivacy}
              className="hover:text-stone-800 transition-colors cursor-pointer underline underline-offset-2"
            >
              Privacy Notice
            </button>
            <span>·</span>
            <button
              onClick={onOpenAbout}
              className="hover:text-stone-800 transition-colors cursor-pointer underline underline-offset-2"
            >
              About ContractLens
            </button>
          </div>
          <div className="px-1 text-[10px] text-stone-400">
            Analysis powered by Google Gemini
          </div>
        </div>
      </aside>
    </>
  );
}
