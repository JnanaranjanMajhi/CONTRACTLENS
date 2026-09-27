export default function ErrorMessage({ message, onRetry, onBack }) {
  return (
    <div className="max-w-md mx-auto text-center py-20 animate-clean-fade">
      {/* Icon */}
      <div className="w-12 h-12 mx-auto mb-4 rounded bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-700">
        <svg
          className="w-6 h-6"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
          />
        </svg>
      </div>

      <h2 className="text-lg font-semibold text-stone-900 mb-1.5">
        Unable to complete document analysis
      </h2>
      <p className="text-xs sm:text-sm text-stone-600 mb-6 max-w-sm mx-auto leading-relaxed">
        {message || 'An unexpected issue occurred while analyzing the document.'}
      </p>

      <div className="flex items-center justify-center gap-3">
        <button
          onClick={onRetry}
          className="px-5 py-2 bg-[#1C1917] hover:bg-stone-800 text-white font-medium text-xs rounded transition-colors cursor-pointer"
        >
          Try Again
        </button>
        {onBack && (
          <button
            onClick={onBack}
            className="px-5 py-2 border border-stone-300 text-stone-700 hover:text-stone-900 hover:bg-stone-100 rounded text-xs transition-colors cursor-pointer"
          >
            Edit Contract Text
          </button>
        )}
      </div>
    </div>
  );
}
