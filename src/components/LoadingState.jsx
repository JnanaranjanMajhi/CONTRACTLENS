import { useState, useEffect } from 'react';

const STEPS = [
  'Reading contract structure…',
  'Extracting immutable numbered sections…',
  'Evaluating operational and legal conditions…',
  'Synthesizing plain-English clause breakdown…',
  'Compiling document review…',
];

export default function LoadingState() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setStep((prev) => (prev < STEPS.length - 1 ? prev + 1 : prev));
    }, 2800);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="max-w-md mx-auto text-center py-24 animate-clean-fade">
      {/* Document Icon */}
      <div className="w-12 h-12 mx-auto mb-5 rounded bg-stone-100 border border-stone-200 flex items-center justify-center text-stone-700">
        <svg className="w-6 h-6 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
        </svg>
      </div>

      <h2 className="text-lg font-semibold text-stone-900 mb-1">
        Reviewing Document
      </h2>
      <p className="text-xs text-stone-500 mb-6 h-5 transition-opacity duration-300">
        {STEPS[step]}
      </p>

      {/* Progress Line */}
      <div className="w-full max-w-xs mx-auto h-1 bg-stone-200 rounded-full overflow-hidden mb-3">
        <div className="h-full bg-stone-800 rounded-full animate-progress-clean" />
      </div>

      <p className="text-[11px] text-stone-400">
        Analysis powered by Google Gemini · Usually takes 5–15 seconds
      </p>
    </div>
  );
}
