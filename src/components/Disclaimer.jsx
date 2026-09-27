export default function Disclaimer() {
  return (
    <footer className="mt-16 mb-8 pt-6 border-t border-stone-200/80 text-center">
      <p className="text-xs text-stone-500 max-w-2xl mx-auto leading-relaxed">
        <span className="font-semibold text-stone-700">Notice:</span> ContractLens is an educational tool designed to assist signers in identifying potential concerns and clarifying contract provisions. It is not a law firm, does not provide legal advice, and does not establish an attorney-client relationship. Always consult licensed legal counsel before executing binding agreements.
      </p>
      <p className="text-[11px] text-stone-400 mt-2">
        Analysis powered by Google Gemini
      </p>
    </footer>
  );
}
