import { useState, useRef } from 'react';
import { sampleContracts } from '../data/sampleContract';

export default function ContractInput({
  value,
  onChange,
  onAnalyze,
  onLoadPreset,
  selectedPresetTitle,
  onDocumentTitleChange,
}) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [pdfInfo, setPdfInfo] = useState(null);
  const [pdfError, setPdfError] = useState('');
  const fileInputRef = useRef(null);

  const wordCount = value.trim() ? value.trim().split(/\s+/).length : 0;
  const charCount = value.length;
  const canAnalyze = charCount >= 50 && !isExtracting;

  const handleFileSelect = async (file) => {
    if (!file) return;

    setPdfError('');

    // Client-side validation
    const filename = file.name || 'contract.pdf';
    if (!filename.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
      setPdfError('Please upload a PDF file.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setPdfError('PDF must be smaller than 10 MB.');
      return;
    }

    setIsExtracting(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const apiBase = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');
      const res = await fetch(`${apiBase}/api/extract-pdf`, {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to extract text from PDF.');
      }

      // Update contract text with raw extracted PDF text
      onChange(data.text);
      setPdfInfo({
        filename: data.filename,
        sectionCount: data.sectionCount,
      });

      if (onDocumentTitleChange) {
        const cleanTitle = data.filename.replace(/\.pdf$/i, '').replace(/[-_]/g, ' ');
        onDocumentTitleChange(cleanTitle);
      }
    } catch (err) {
      setPdfError(err.message || "We couldn't extract readable text from this PDF.");
    } finally {
      setIsExtracting(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleClear = () => {
    onChange('');
    setPdfInfo(null);
    setPdfError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="max-w-3xl mx-auto py-4 sm:py-8">
      {/* Header / Intro */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-stone-900 mb-2">
          Understand your contract before you sign.
        </h1>
        <p className="text-sm sm:text-base text-stone-600 leading-relaxed max-w-2xl">
          Upload a contract PDF or paste text to review potential concerns, understand difficult clauses, and identify questions worth clarifying.
        </p>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          PDF UPLOAD ZONE
         ═══════════════════════════════════════════════════════════ */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,application/pdf"
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleFileSelect(e.target.files[0]);
          }
        }}
      />

      {!pdfInfo ? (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => !isExtracting && fileInputRef.current?.click()}
          className={`p-6 sm:p-8 rounded-lg border-2 border-dashed transition-all duration-150 cursor-pointer text-center ${
            isDragOver
              ? 'border-stone-500 bg-stone-100/80'
              : 'border-stone-300 hover:border-stone-400 bg-white hover:bg-[#FAF9F7]'
          } ${isExtracting ? 'opacity-70 pointer-events-none' : ''}`}
        >
          {isExtracting ? (
            <div className="py-2 flex flex-col items-center justify-center space-y-2">
              <svg className="w-6 h-6 text-stone-600 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              <span className="text-xs font-medium text-stone-700">Reading contract…</span>
              <span className="text-[11px] text-stone-400">Extracting raw text from PDF</span>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="w-10 h-10 mx-auto rounded bg-stone-100 flex items-center justify-center text-stone-600">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m6.75 12l-3-3m0 0l-3 3m3-3v6m-1.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
              </div>
              <div className="text-sm font-medium text-stone-800">
                <span>Drop PDF contract here</span>{' '}
                <span className="text-stone-500 font-normal">or</span>{' '}
                <span className="text-stone-900 underline underline-offset-2">click to browse</span>
              </div>
              <p className="text-xs text-stone-400">
                PDF up to 10 MB · Text-based agreements
              </p>
            </div>
          )}
        </div>
      ) : (
        /* PDF PREVIEW STATE */
        <div className="p-4 bg-white border border-stone-200 rounded-lg shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded bg-stone-100 border border-stone-200 flex items-center justify-center text-stone-700 shrink-0">
              <svg className="w-5 h-5 text-rose-700" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-9.5 8.5h-2v1h2c.55 0 1-.45 1-1s-.45-1-1-1zm6 3h-2v-4h2c.55 0 1 .45 1 1v2c0 .55-.45 1-1 1zm-8-7h2c1.1 0 2 .9 2 2s-.9 2-2 2h-2v-4zm6 0h2c1.1 0 2 .9 2 2v2c0 1.1-.9 2-2 2h-2v-6z"/>
              </svg>
            </div>
            <div className="min-w-0">
              <div className="text-xs font-semibold text-stone-900 truncate">
                {pdfInfo.filename}
              </div>
              <div className="text-[11px] text-emerald-700 font-medium flex items-center gap-1.5 mt-0.5">
                <span>✓ Text extracted successfully</span>
                {pdfInfo.sectionCount > 0 && (
                  <span className="text-stone-500 font-normal">
                    · {pdfInfo.sectionCount} sections detected
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="text-xs text-stone-600 hover:text-stone-900 underline underline-offset-2 px-2 py-1 cursor-pointer"
            >
              Replace PDF
            </button>
            <button
              onClick={handleClear}
              className="text-xs text-stone-400 hover:text-stone-700 p-1 rounded cursor-pointer"
              title="Remove PDF"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {pdfError && (
        <div className="mt-2.5 p-3 rounded bg-rose-50 border border-rose-200 text-xs text-rose-800 leading-relaxed">
          {pdfError}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════
          DIVIDER
         ═══════════════════════════════════════════════════════════ */}
      <div className="my-5 flex items-center justify-between gap-3 text-xs text-stone-400">
        <div className="flex-1 h-[1px] bg-stone-200" />
        <span className="uppercase tracking-wider text-[10px] font-semibold text-stone-400">
          or paste contract text
        </span>
        <div className="flex-1 h-[1px] bg-stone-200" />
      </div>

      {/* Preset Quick Load Bar */}
      <div className="mb-3 flex flex-wrap items-center gap-2 text-xs">
        <span className="text-stone-400 font-medium">Sample contracts:</span>
        {sampleContracts.map((item) => (
          <button
            key={item.id}
            onClick={() => {
              setPdfInfo(null);
              setPdfError('');
              onLoadPreset(item.text, item.title);
            }}
            className="px-2.5 py-1 rounded bg-stone-100 hover:bg-stone-200 text-stone-700 font-medium transition-colors cursor-pointer border border-stone-200/60"
          >
            {item.title}
          </button>
        ))}
      </div>

      {/* ═══════════════════════════════════════════════════════════
          DOCUMENT EDITOR CONTAINER (Paper style)
         ═══════════════════════════════════════════════════════════ */}
      <div className="bg-white border border-[#E7E5E4] rounded-lg shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
        {/* Editor Title Bar */}
        <div className="px-4 py-2.5 bg-[#FAF9F7] border-b border-[#E7E5E4] flex items-center justify-between text-xs text-stone-500">
          <div className="flex items-center gap-2 truncate">
            <svg className="w-4 h-4 text-stone-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
            <span className="font-medium text-stone-700 truncate">
              {pdfInfo ? pdfInfo.filename : selectedPresetTitle || 'Contract Text'}
            </span>
          </div>
          {value.length > 0 && (
            <button
              onClick={handleClear}
              className="text-stone-400 hover:text-stone-700 transition-colors cursor-pointer shrink-0"
            >
              Clear
            </button>
          )}
        </div>

        {/* Textarea */}
        <div className="p-4 sm:p-5">
          <textarea
            value={value}
            onChange={(e) => {
              onChange(e.target.value);
            }}
            placeholder={`Paste your contract here...

Start with the full agreement text, including numbered sections and standard terms.`}
            rows={12}
            className="w-full text-stone-800 text-sm font-document leading-relaxed placeholder-stone-400 resize-y focus:outline-none bg-transparent"
            style={{ minHeight: '220px' }}
          />
        </div>

        {/* Footer info bar */}
        <div className="px-4 py-2 bg-[#FAF9F7] border-t border-[#E7E5E4] flex items-center justify-between text-xs text-stone-500">
          <span>
            {wordCount.toLocaleString()} words · {charCount.toLocaleString()} characters
          </span>
          <span className="text-[11px] text-stone-400">
            {canAnalyze ? 'Ready to review' : 'Min. 50 characters required'}
          </span>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          ACTION BUTTON
         ═══════════════════════════════════════════════════════════ */}
      <div className="mt-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <button
          onClick={onAnalyze}
          disabled={!canAnalyze}
          className="px-6 py-2.5 bg-[#1C1917] hover:bg-stone-800 disabled:bg-stone-300 text-white font-medium text-sm rounded shadow-sm transition-all duration-150 cursor-pointer disabled:cursor-not-allowed text-center"
        >
          Analyze Contract
        </button>

        {!canAnalyze && value.length > 0 && !isExtracting && (
          <p className="text-xs text-stone-500">
            Please provide at least 50 characters before analyzing. (Currently {charCount})
          </p>
        )}
      </div>

      {/* ═══════════════════════════════════════════════════════════
          PRIVACY & DISCLAIMER NOTICE
         ═══════════════════════════════════════════════════════════ */}
      <div className="mt-8 pt-5 border-t border-stone-200/80 text-xs text-stone-500 space-y-1.5 leading-relaxed">
        <p>
          <strong className="text-stone-700 font-medium">Privacy Notice:</strong> Contracts may contain confidential information. Your text is processed by Google Gemini to generate this analysis. Avoid submitting highly sensitive information unless you are comfortable with this processing.
        </p>
        <p className="text-[11px] text-stone-400">
          Educational information only — not legal advice. Always review with legal counsel.
        </p>
      </div>
    </div>
  );
}
