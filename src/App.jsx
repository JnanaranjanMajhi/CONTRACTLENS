import { useState, useMemo } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import ContractInput from './components/ContractInput';
import LoadingState from './components/LoadingState';
import RiskDashboard from './components/RiskDashboard';
import ClauseList from './components/ClauseList';
import ClauseDetail from './components/ClauseDetail';
import Disclaimer from './components/Disclaimer';
import ErrorMessage from './components/ErrorMessage';
import { PrivacyModal, AboutModal } from './components/InfoModals';

export default function App() {
  const [view, setView] = useState('input'); // input | loading | results | error
  const [contractText, setContractText] = useState('');
  const [documentTitle, setDocumentTitle] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState('');
  const [selectedClause, setSelectedClause] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);

  // Helper to deduce document title from first non-empty line
  const deriveDocumentTitle = (text, fallback) => {
    if (fallback) return fallback;
    if (!text || typeof text !== 'string') return 'Contract Document';
    const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
    if (lines.length > 0) {
      const firstLine = lines[0];
      if (firstLine.length < 80 && !firstLine.match(/^\d+[\.\)]/)) {
        return firstLine
          .toLowerCase()
          .split(' ')
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(' ');
      }
    }
    return 'Contract Document';
  };

  const handleAnalyze = async () => {
    if (contractText.trim().length < 50) return;

    setView('loading');
    setError('');

    // Ensure document title is set
    const title = deriveDocumentTitle(contractText, documentTitle);
    setDocumentTitle(title);

    try {
      const apiBase = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');
      const response = await fetch(`${apiBase}/api/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: contractText }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Request failed (${response.status})`);
      }

      if (!data.clauses || !Array.isArray(data.clauses) || data.clauses.length === 0) {
        throw new Error('The analysis returned no readable clauses. Please try with a different contract.');
      }

      setAnalysis(data);
      setView('results');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setError(err.message || 'Something went wrong while analyzing the contract.');
      setView('error');
    }
  };

  const handleNewAnalysis = () => {
    setView('input');
    setSelectedClause(null);
    setError('');
  };

  const handleLoadPreset = (text, title) => {
    setContractText(text);
    setDocumentTitle(title);
    if (view !== 'input') {
      setView('input');
      setAnalysis(null);
      setSelectedClause(null);
    }
  };

  // Sorted clauses (or in original section order for clean document index)
  const clauses = analysis?.clauses || [];

  // Next / Previous clause navigation logic
  const currentClauseIndex = useMemo(() => {
    if (!selectedClause || !clauses.length) return -1;
    return clauses.findIndex((c) => c.sectionNumber === selectedClause.sectionNumber);
  }, [selectedClause, clauses]);

  const handleNextClause = () => {
    if (currentClauseIndex >= 0 && currentClauseIndex < clauses.length - 1) {
      setSelectedClause(clauses[currentClauseIndex + 1]);
    }
  };

  const handlePrevClause = () => {
    if (currentClauseIndex > 0) {
      setSelectedClause(clauses[currentClauseIndex - 1]);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#FBFBFA] text-[#1C1917]">
      {/* Desktop & Mobile Responsive Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onNewAnalysis={handleNewAnalysis}
        onSelectPreset={handleLoadPreset}
        currentContractTitle={documentTitle}
        clauses={clauses}
        onSelectClause={(clause) => setSelectedClause(clause)}
        activeSectionNumber={selectedClause?.sectionNumber}
        onOpenPrivacy={() => setIsPrivacyOpen(true)}
        onOpenAbout={() => setIsAboutOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          onReset={view === 'results' ? handleNewAnalysis : null}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          activeDocumentTitle={view === 'results' ? documentTitle : null}
          isAnalyzing={view === 'loading'}
          overallRisk={view === 'results' ? analysis?.overallRisk : null}
        />

        <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-8 py-6 sm:py-10">
          {/* View 1: Focused Document Input Workspace */}
          {view === 'input' && (
            <div className="animate-clean-fade">
              <ContractInput
                value={contractText}
                onChange={setContractText}
                onAnalyze={handleAnalyze}
                onLoadPreset={handleLoadPreset}
                selectedPresetTitle={documentTitle}
                onDocumentTitleChange={setDocumentTitle}
              />
            </div>
          )}

          {/* View 2: Professional Loading State */}
          {view === 'loading' && <LoadingState />}

          {/* View 3: Error Message */}
          {view === 'error' && (
            <ErrorMessage
              message={error}
              onRetry={handleAnalyze}
              onBack={() => setView('input')}
            />
          )}

          {/* View 4: Document Analysis Dashboard & Table of Contents */}
          {view === 'results' && analysis && (
            <div className="space-y-6">
              <RiskDashboard
                analysis={analysis}
                documentTitle={documentTitle}
                onSelectClause={(clause) => setSelectedClause(clause)}
              />

              <ClauseList
                clauses={clauses}
                onSelectClause={(clause) => setSelectedClause(clause)}
                activeSectionNumber={selectedClause?.sectionNumber}
              />

              <Disclaimer />
            </div>
          )}
        </main>
      </div>

      {/* Split Document-Analysis Workspace Modal */}
      {selectedClause && (
        <ClauseDetail
          clause={selectedClause}
          onClose={() => setSelectedClause(null)}
          onNext={handleNextClause}
          onPrev={handlePrevClause}
          hasNext={currentClauseIndex >= 0 && currentClauseIndex < clauses.length - 1}
          hasPrev={currentClauseIndex > 0}
          totalClauses={clauses.length}
        />
      )}

      {/* Info Modals */}
      <PrivacyModal isOpen={isPrivacyOpen} onClose={() => setIsPrivacyOpen(false)} />
      <AboutModal isOpen={isAboutOpen} onClose={() => setIsAboutOpen(false)} />
    </div>
  );
}
