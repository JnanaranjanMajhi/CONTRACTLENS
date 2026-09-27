export function PrivacyModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-[2px] animate-clean-fade"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-white border border-stone-300 rounded-lg p-6 shadow-xl animate-clean-modal text-stone-800"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-stone-200">
          <h2 className="text-base font-bold text-stone-900">
            Privacy Notice
          </h2>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-700 p-1 rounded"
          >
            ✕
          </button>
        </div>

        <div className="space-y-3 text-xs leading-relaxed text-stone-600">
          <p>
            <strong className="text-stone-900">Data Processing:</strong> Contracts may contain confidential information. Your text is processed by Google Gemini to generate this analysis. Avoid submitting highly sensitive information unless you are comfortable with this processing.
          </p>
          <p>
            <strong className="text-stone-900">Third-Party Cloud APIs:</strong> When you click Analyze Contract, the document text is transmitted to Google API endpoints for clause segmentation and risk evaluation.
          </p>
          <p>
            <strong className="text-stone-900">Educational Review:</strong> ContractLens is designed for educational and informational purposes only — not legal advice. Always review terms with a qualified legal professional before signing.
          </p>
        </div>

        <div className="mt-6 pt-4 border-t border-stone-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#1C1917] hover:bg-stone-800 text-white text-xs font-medium rounded cursor-pointer"
          >
            Understood
          </button>
        </div>
      </div>
    </div>
  );
}

export function AboutModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-[2px] animate-clean-fade"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-white border border-stone-300 rounded-lg p-6 shadow-xl animate-clean-modal text-stone-800"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-stone-200">
          <div>
            <h2 className="text-base font-bold text-stone-900">
              About ContractLens
            </h2>
            <p className="text-[11px] text-stone-500">Understand the contract before you sign it.</p>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-700 p-1 rounded"
          >
            ✕
          </button>
        </div>

        <div className="space-y-3 text-xs leading-relaxed text-stone-600">
          <p>
            ContractLens is a document-first legal technology tool created to make complex agreements accessible, clear, and reviewable before signing.
          </p>
          <p>
            Traditional AI legal tools often rewrite or hallucinate clause text. ContractLens implements a strict <strong>100% immutable verbatim source pipeline</strong>, ensuring that every quoted clause is an exact, unaltered substring of your submitted document.
          </p>
          <p>
            Google Gemini is leveraged exclusively to evaluate operational risk, explain complex clauses in plain English, and surface strategic questions worth clarifying prior to signing.
          </p>
        </div>

        <div className="mt-6 pt-4 border-t border-stone-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#1C1917] hover:bg-stone-800 text-white text-xs font-medium rounded cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
