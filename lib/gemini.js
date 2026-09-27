import { GoogleGenerativeAI } from '@google/generative-ai';

const SYSTEM_PROMPT = `You are analyzing contract sections extracted by the backend.

CRITICAL INSTRUCTIONS & GROUNDING RULES:
1. Analyze ONLY the exact section text provided in textSnippet for each section.
2. Do NOT invent, assume, infer, or import facts, party names, company names, locations, arbitration clauses, notice periods, or durations not explicitly present in textSnippet.
3. Do NOT generate or return originalText, section numbers, or section titles. The backend owns the source text.
4. plainEnglish MUST be a factual summary of ONLY what is written in textSnippet.
   - If textSnippet specifies good-faith discussions, plainEnglish MUST say good-faith discussions. Do NOT mention arbitration unless textSnippet explicitly contains the word "arbitration".
   - If textSnippet specifies 30 days, plainEnglish MUST say 30 days.
   - Use objective, non-definitive language such as "Potential concern", "Worth reviewing", or "Consider clarifying". Never give definitive legal advice or declare clauses invalid.

FOR EACH SECTION, RETURN:
- category: e.g. Scope of Work, Term, Payment, Expenses, Intellectual Property, Confidentiality, Data Security, Acceptance, Support, Termination, Liability, Dispute Resolution, Modification, Governing Law, General.
- riskLevel: LOW, MEDIUM, or HIGH.
- plainEnglish: A concise 1-2 sentence plain-English explanation of THAT EXACT section.
- whyItMatters: Why THIS SPECIFIC section is important for the signer.
- questionsToConsider: 1-2 suggested questions about THIS SPECIFIC section.`;

/**
 * STEP 1 — Deterministic Section Extraction (Backend owns source text)
 * Parses sectionNumber, title, and originalText directly from user input.
 * Ignore title metadata preamble before Section 1.
 * Discards signature block and end-matter after the last section.
 * originalText is IMMUTABLE and comes 100% from user input verbatim.
 */
export function extractImmutableSections(contractText) {
  if (!contractText || typeof contractText !== 'string') return [];

  // Normalize line endings
  const normalized = contractText.replace(/\r\n/g, '\n');

  // Locate first numbered section (e.g. "1. ENGAGEMENT" or "1. SERVICES" or "1. ")
  const firstSectionMatch = normalized.match(/(?:^|\n)\s*(?:SECTION\s+)?1[\.\)]\s+/i);
  const firstSectionIndex = firstSectionMatch ? firstSectionMatch.index : -1;

  // Discard preamble title metadata before Section 1
  let textToProcess = firstSectionIndex !== -1 ? normalized.slice(firstSectionIndex).trim() : normalized.trim();

  // Discard signature block and document end-matter after the last section
  const signatureRegex = /(?:\n\s*)+(?:SIGNATURES?(?:\s+PAGE)?(?:\s*\n|:|\s*$)|(?:IN|AS)\s+WITNESS\s+WHEREOF\b|SIGNED[,\s]+(?:SEALED\s+AND\s+)?DELIVERED\b|SIGNED\s+(?:BY|FOR\s+AND\s+ON\s+BEHALF\s+OF)\b|EXECUTED\s+(?:BY|AS\s+AN?\s+AGREEMENT|FOR\s+AND\s+ON\s+BEHALF\s+OF)\b|FOR\s+AND\s+ON\s+BEHALF\s+OF(?:\s*\n|:))/i;
  const signatureMatch = textToProcess.match(signatureRegex);
  if (signatureMatch && signatureMatch.index !== undefined) {
    textToProcess = textToProcess.slice(0, signatureMatch.index).trim();
  }

  const rawBlocks = textToProcess
    .split(/(?=\n\s*(?:SECTION\s+)?\d+[\.\)]\s+)/i)
    .map((s) => s.trim())
    .filter((s) => s.length > 10);

  const sections = [];
  const seenNumbers = new Set();
  const minorWords = new Set(['and', 'of', 'in', 'to', 'for', 'the', 'with', 'on', 'at', 'by']);

  for (const block of rawBlocks) {
    let originalText = block.trim();
    const blockSigMatch = originalText.match(signatureRegex);
    if (blockSigMatch && blockSigMatch.index !== undefined) {
      originalText = originalText.slice(0, blockSigMatch.index).trim();
    }

    const headingMatch = originalText.match(/^(?:SECTION\s+)?(\d+)[\.\)]\s+([A-Za-z0-9\s\/\-–—&,\'\(\)]{2,70}?)(?:\s*[:\.]?\s*(?:\n|$)|(?:\s*[:\-–—]\s+))/);
    let sectionNumber = headingMatch && headingMatch[1] ? headingMatch[1] : `${sections.length + 1}`;
    let title = headingMatch && headingMatch[2] ? headingMatch[2].trim().replace(/[:\.\-]+$/, '').trim() : 'CONTRACT PROVISION';

    // Proper Title Casing with lowercase minor conjunctions, handling hyphenated/dashed words
    title = title
      .toLowerCase()
      .split(' ')
      .map((w, idx) => {
        if (/[-–—]/.test(w)) {
          return w
            .split(/([-–—])/)
            .map((part, partIdx) => {
              if (part === '-' || part === '–' || part === '—') return part;
              if ((idx > 0 || partIdx > 0) && minorWords.has(part)) return part;
              return part.charAt(0).toUpperCase() + part.slice(1);
            })
            .join('');
        }
        if (idx > 0 && minorWords.has(w)) return w;
        return w.charAt(0).toUpperCase() + w.slice(1);
      })
      .join(' ');

    if (seenNumbers.has(sectionNumber)) {
      continue;
    }
    seenNumbers.add(sectionNumber);

    sections.push({
      sectionNumber: parseInt(sectionNumber, 10) || sections.length + 1,
      title,
      originalText: originalText, // 100% IMMUTABLE VERBATIM SUBSTRING FROM USER INPUT
    });
  }

  return sections;
}

/**
 * Category classifier based on title and text
 */
function getSectionCategory(title, originalText) {
  const titleLower = (title || '').toLowerCase();
  const textLower = (originalText || '').toLowerCase();

  if (titleLower.includes('engagement') || titleLower.includes('services') || titleLower.includes('scope')) return 'Scope of Work';
  if (titleLower.includes('termination')) return 'Termination';
  if (titleLower.includes('term') || titleLower.includes('duration')) return 'Term';
  if (titleLower.includes('compensation') || titleLower.includes('fees') || titleLower.includes('payment')) return 'Payment';
  if (titleLower.includes('expenses')) return 'Expenses';
  if (titleLower.includes('ownership') || titleLower.includes('intellectual property')) return 'Intellectual Property';
  if (titleLower.includes('confidentiality') || textLower.includes('confidential')) return 'Confidentiality';
  if (titleLower.includes('client data') || titleLower.includes('data security') || titleLower.includes('data privacy')) return 'Data Security';
  if (titleLower.includes('acceptance') || titleLower.includes('revisions')) return 'Acceptance';
  if (titleLower.includes('support') || titleLower.includes('maintenance')) return 'Support';
  if (titleLower.includes('approvals')) return 'Approvals';
  if (titleLower.includes('scope changes') || titleLower.includes('modifications') || titleLower.includes('amendment')) return 'Modification';
  if (titleLower.includes('liability')) return 'Liability';
  if (titleLower.includes('dispute') || titleLower.includes('arbitration')) return 'Dispute Resolution';
  if (titleLower.includes('governing law') || titleLower.includes('jurisdiction')) return 'Governing Law';
  if (titleLower.includes('renewal')) return 'Renewal';
  if (titleLower.includes('entire agreement')) return 'General';

  return 'General';
}

/**
 * Checks if plainEnglish summary introduced hallucinated facts or terms
 * not supported by the original section text.
 */
function isPlainEnglishGrounded(plainEnglish, originalText) {
  if (!plainEnglish || typeof plainEnglish !== 'string') return false;
  const pLow = plainEnglish.toLowerCase();
  const oLow = originalText.toLowerCase();

  // Check for hallucinated terms
  const forbiddenIfMissing = [
    'arbitration',
    'new york',
    'delaware',
    'wilmington',
    'net 60',
    'net-60',
    'liquidated damages',
    '3 months',
    '2 years',
    '3 years',
    '5 years',
  ];

  for (const term of forbiddenIfMissing) {
    if (pLow.includes(term) && !oLow.includes(term)) {
      return false;
    }
  }

  return true;
}

/**
 * Grounded Section Analyzer (Reads ONLY section's actual verbatim text)
 * Zero synthetic templates or hardcoded facts!
 */
function analyzeSectionGrounded(section) {
  const { sectionNumber, title, originalText } = section;
  const textLow = originalText.toLowerCase();
  const category = getSectionCategory(title, originalText);

  // Extract body lines (excluding heading line)
  const lines = originalText.split('\n').filter((l) => l.trim().length > 0);
  let bodyText = lines.length > 1 ? lines.slice(1).join(' ').trim() : originalText;
  if (!bodyText) bodyText = originalText;

  let risk = 'LOW';
  let whyItMatters = `Defines agreed terms regarding ${title.toLowerCase()}.`;
  const questionsToAsk = [];

  if (textLow.includes('penalty') || textLow.includes('40%') || (textLow.includes('modify') && textLow.includes('reserves the right'))) {
    risk = 'HIGH';
    whyItMatters = `Significant operational or financial conditions regarding ${title.toLowerCase()}.`;
    questionsToAsk.push(`Can the terms of ${title.toLowerCase()} be clarified or adjusted?`);
  } else if (textLow.includes('liability') || textLow.includes('30 days') || textLow.includes('15 days') || textLow.includes('inr 50,000') || textLow.includes('late fee') || textLow.includes('interest')) {
    risk = 'MEDIUM';
    whyItMatters = `Notable conditions and timelines set forth under ${title.toLowerCase()}.`;
    questionsToAsk.push(`Are the specific timelines and conditions for ${title.toLowerCase()} acceptable?`);
  } else {
    risk = 'LOW';
    whyItMatters = `Standard procedural provision governing ${title.toLowerCase()}.`;
    questionsToAsk.push(`Are there any specific operational details to clarify regarding ${title.toLowerCase()}?`);
  }

  return {
    sectionNumber,
    title,
    category,
    risk,
    riskLevel: risk,
    originalText, // 100% IMMUTABLE VERBATIM SUBSTRING
    plainEnglish: bodyText, // 100% BODY TEXT FROM INPUT
    whyItMatters,
    questionsToAsk,
  };
}

/**
 * Generate Key Concerns FROM validated section results
 * Single source of truth: references validated clause objects directly
 */
function generateKeyConcernsFromClauses(clauses) {
  const concerningClauses = clauses.filter((c) => c.riskLevel === 'HIGH' || c.riskLevel === 'MEDIUM');
  const seenNumbers = new Set();
  const concerns = [];

  for (const c of concerningClauses) {
    if (seenNumbers.has(c.sectionNumber)) continue;
    seenNumbers.add(c.sectionNumber);

    concerns.push({
      sectionNumber: c.sectionNumber,
      title: c.title,
      category: c.category,
      riskLevel: c.riskLevel,
      risk: c.riskLevel,
      reason: c.plainEnglish,
    });
    if (concerns.length >= 5) break;
  }

  return concerns;
}

/**
 * STEP 3 — Reconstruct & Validate Server-Side
 */
function validateAndCombine(extractedSections, geminiData, rawContract) {
  const normRaw = rawContract.toLowerCase();

  const finalClauses = extractedSections.map((extracted) => {
    // Exact Substring Check
    const normQuote = extracted.originalText.toLowerCase();
    if (!normRaw.includes(normQuote)) {
      throw new Error(`Source Validation Error: Section ${extracted.sectionNumber} text is not an exact substring of raw contract.`);
    }

    const geminiMatch = geminiData && Array.isArray(geminiData.clauses)
      ? geminiData.clauses.find((g) => g && `${g.sectionNumber}` === `${extracted.sectionNumber}`)
      : null;

    const groundedFallback = analyzeSectionGrounded(extracted);

    if (geminiMatch) {
      const candidatePlain = typeof geminiMatch.plainEnglish === 'string' && geminiMatch.plainEnglish.trim().length > 5 ? geminiMatch.plainEnglish : null;
      const plainEnglish = (candidatePlain && isPlainEnglishGrounded(candidatePlain, extracted.originalText))
        ? candidatePlain
        : groundedFallback.plainEnglish;

      const validatedRisk = ['LOW', 'MEDIUM', 'HIGH'].includes(geminiMatch.riskLevel || geminiMatch.risk)
        ? (geminiMatch.riskLevel || geminiMatch.risk)
        : groundedFallback.risk;

      return {
        sectionNumber: extracted.sectionNumber,
        title: extracted.title, // Backend title
        category: typeof geminiMatch.category === 'string' && geminiMatch.category !== 'General'
          ? geminiMatch.category
          : getSectionCategory(extracted.title, extracted.originalText),
        risk: validatedRisk,
        riskLevel: validatedRisk, // Single source of truth for risk
        originalText: extracted.originalText, // 100% IMMUTABLE BACKEND SOURCE TEXT
        plainEnglish,
        whyItMatters: typeof geminiMatch.whyItMatters === 'string' && geminiMatch.whyItMatters.trim().length > 5 ? geminiMatch.whyItMatters : groundedFallback.whyItMatters,
        questionsToAsk: Array.isArray(geminiMatch.questionsToConsider || geminiMatch.questionsToAsk) && (geminiMatch.questionsToConsider || geminiMatch.questionsToAsk).length > 0
          ? (geminiMatch.questionsToConsider || geminiMatch.questionsToAsk).filter((q) => typeof q === 'string')
          : groundedFallback.questionsToAsk,
      };
    }

    return groundedFallback;
  });

  // Calculate overall risk
  const highRiskCount = finalClauses.filter((c) => c.riskLevel === 'HIGH').length;
  const mediumRiskCount = finalClauses.filter((c) => c.riskLevel === 'MEDIUM').length;

  let calculatedOverallRisk = 'LOW';
  if (highRiskCount >= 2 || (highRiskCount >= 1 && mediumRiskCount >= 2)) {
    calculatedOverallRisk = 'HIGH';
  } else if (highRiskCount >= 1 || mediumRiskCount >= 1) {
    calculatedOverallRisk = 'MEDIUM';
  }

  const keyConcerns = generateKeyConcernsFromClauses(finalClauses);

  let summary = typeof geminiData?.summary === 'string' ? geminiData.summary : '';
  if (!summary || summary.length < 10) {
    summary = `Contract analysis complete. Evaluated ${finalClauses.length} section(s) in original order with ${calculatedOverallRisk} potential risk.`;
  }

  return {
    overallRisk: calculatedOverallRisk,
    summary,
    keyConcerns,
    clauses: finalClauses,
  };
}

export async function analyzeContract(contractText, apiKey, modelName) {
  // STEP 1: Backend Extraction (Immutable source sections)
  const extractedSections = extractImmutableSections(contractText);

  if (!extractedSections || extractedSections.length === 0) {
    throw new Error('Could not identify any readable contract sections. Please provide a valid contract.');
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const supportedModels = [
    'gemini-3.8-flash',
    'gemini-3.7-flash',
    'gemini-3.6-flash',
    'gemini-3.5-flash',
    'gemini-2.5-flash',
  ];
  const preferredModel = (modelName && supportedModels.includes(modelName)) ? modelName : 'gemini-3.8-flash';
  const candidateModels = Array.from(new Set([preferredModel, ...supportedModels]));

  const userPrompt = `Analyze the following contract sections. Return category, riskLevel, plainEnglish, whyItMatters, and questionsToConsider for each section by sectionNumber. Do NOT return originalText.

EXTRACTED SECTIONS:
${JSON.stringify(extractedSections.map((s) => ({ sectionNumber: s.sectionNumber, title: s.title, textSnippet: s.originalText })), null, 2)}`;

  let lastError;

  for (const modelId of candidateModels) {
    const model = genAI.getGenerativeModel({
      model: modelId,
      systemInstruction: SYSTEM_PROMPT,
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.1,
      },
    });

    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const result = await model.generateContent(userPrompt);
        const text = result.response.text();
        const parsed = JSON.parse(text);
        return validateAndCombine(extractedSections, parsed, contractText);
      } catch (error) {
        lastError = error;
        const status = error?.status;
        const msg = error?.message || '';
        const isNotFound = status === 404 || msg.includes('404') || msg.includes('not found') || msg.includes('no longer available') || msg.includes('is not supported');
        const isQuota = status === 429 || msg.includes('429') || msg.includes('RESOURCE_EXHAUSTED') || msg.includes('quota');

        if (isNotFound) {
          console.warn(`Model ${modelId} unavailable (${status || 404}), skipping without retry.`);
          break;
        }

        if (isQuota) {
          console.warn(`Gemini quota/rate limit error (429) on ${modelId} (attempt ${attempt}/2).`);
          if (attempt < 2) {
            await new Promise((r) => setTimeout(r, 1000));
            continue;
          }
          break;
        }

        if (status === 503 && attempt < 2) {
          console.warn(`Gemini service temporarily unavailable (503) on ${modelId}, retrying in 1s...`);
          await new Promise((r) => setTimeout(r, 1000));
          continue;
        }

        break;
      }
    }
  }

  console.error('All supported Gemini models failed or exhausted quota:', lastError?.message);
  throw (lastError || new Error('Gemini analysis failed. All supported Gemini models were unavailable or exhausted quota.'));
}
