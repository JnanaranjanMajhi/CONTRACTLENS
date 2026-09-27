# ContractLens 🔍

> **Understand your contract before you sign it.**

ContractLens is an AI-powered contract analysis tool that breaks down complex legal documents into structured, clause-by-clause insights with risk assessments, plain-English explanations, and actionable questions to ask before signing.

**Built for Campulsy Hack Days 2026** · Solo Project

## 🎯 The Problem

Most people sign contracts, leases, and terms of service without fully understanding what they're agreeing to. Legal language is deliberately dense and complex. Professional legal review is expensive and inaccessible to most individuals and freelancers.

## 💡 The Solution

ContractLens uses **Google Gemini AI** to perform deep, multi-step contract analysis:

1. **Clause Segmentation** — Identifies and isolates individual contractual provisions
2. **Clause Classification** — Categorizes each clause (Payment, IP, Termination, Non-Compete, etc.)
3. **Risk Assessment** — Rates each clause as High, Medium, or Low risk
4. **Plain-English Translation** — Converts legalese into accessible, everyday language
5. **Concern Identification** — Flags potential issues and explains their practical impact
6. **Question Generation** — Suggests specific questions to ask before signing

All analysis uses **structured JSON output** with enforced schema validation — Gemini performs 6 distinct analytical tasks in a single API call, making it a core functional component rather than a superficial wrapper.

## 📸 Screenshots

_See the deployed application for a live demo._

**Landing Page** → Clean contract input with sample loader

**Risk Dashboard** → Overall risk score, heatmap bar, stat cards, key concerns

**Clause Cards** → Color-coded risk grid sorted by severity

**Clause Detail** → Side-by-side original text and plain-English explanation with questions to consider

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite, Tailwind CSS v4 |
| Backend | Node.js, Express |
| AI | Google Gemini API (`gemini-2.0-flash`) |
| Deployment | Vercel / Render |

## 🤖 Gemini API Integration

Gemini is **essential** to ContractLens — removing it would eliminate the entire product's functionality. The integration uses:

- **Structured JSON Output** — `responseMimeType: "application/json"` with a strict `responseSchema` enforcing the exact output structure
- **System Instructions** — Carefully engineered prompt that prevents hallucination, enforces accurate quoting, and distinguishes factual extraction from interpretation
- **Multi-Step Reasoning** — Single API call performs clause segmentation → classification → risk assessment → translation → concern identification → question generation
- **Response Validation** — Server-side validation with safe defaults ensures the frontend never receives malformed data
- **Retry Logic** — Automatic retry with exponential backoff on rate limits (429) and server errors (503)

### Schema

```json
{
  "overallRisk": "LOW | MEDIUM | HIGH",
  "summary": "Plain-English contract summary",
  "keyConcerns": ["Concern 1", "Concern 2"],
  "clauses": [
    {
      "title": "Clause name",
      "category": "Category",
      "risk": "LOW | MEDIUM | HIGH",
      "originalText": "Quoted from contract",
      "plainEnglish": "What this means",
      "whyItMatters": "Practical impact",
      "questionsToAsk": ["Question 1", "Question 2"]
    }
  ]
}
```

## 🚀 Local Setup

### Prerequisites

- Node.js 18+
- Google Gemini API key ([get one here](https://aistudio.google.com/apikey))

### Steps

```bash
# Clone
git clone https://github.com/JnanaranjanMajhi/CONTRACTLENS.git
cd CONTRACTLENS

# Install
npm install

# Configure
cp .env.example .env
# Edit .env and add your GEMINI_API_KEY

# Run (starts both frontend and backend)
npm run dev:all
```

Open [http://localhost:5173](http://localhost:5173)

### Environment Variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `GEMINI_API_KEY` | ✅ (Server) | — | Google Gemini API key (Server-side only — never bundled in client) |
| `GEMINI_MODEL` | ❌ (Server) | `gemini-3.8-flash` | Gemini model name (supports automatic fallback) |
| `PORT` | ❌ (Server) | `3001` | Backend Express server port (automatically assigned by cloud hosts) |
| `ALLOWED_ORIGINS` | ❌ (Server) | Localhost | Comma-separated allowed frontend origins for CORS |
| `VITE_API_URL` | ❌ (Client) | Relative (`/api`) | Base URL for backend API (leave empty if served on same domain or via proxy) |

## 🏗️ Production Architecture

ContractLens implements a strict source-grounding separation:

```text
User Contract / PDF
        ↓
In-Memory PDF / Text Extraction (Express + pdf-parse)
        ↓
Deterministic Section Parser (lib/gemini.js)
        ↓
Immutable Source Clauses (100% Verbatim from User Document)
        ↓
Gemini AI Analysis (Operational risk, plain English, questions)
        ↓
Server-Side Substring Validation (Backend owns source text)
        ↓
React 19 Risk Dashboard & Clause Inspector
```

* **Gemini never generates `originalText`**: The backend parses and owns the source text.
* **In-Memory Processing**: Uploaded PDFs are processed in memory and never written to permanent disk storage.
* **Zero Secret Leakage**: `GEMINI_API_KEY` is strictly confined to server-side execution.

## 🌐 Production Deployment Guide

### Option A: Render (Fullstack Web Service — Simplest & Recommended)
Because the Express server serves both the production API endpoints (`/api/extract-pdf`, `/api/analyze`, `/health`) and the built static React frontend (`dist/`), deploying to Render as a Web Service is the most reliable single-step option:

1. Connect your GitHub repository to [Render](https://render.com).
2. Choose **Web Service** with **Node** runtime.
3. Configure:
   * **Build Command**: `npm install && npm run build`
   * **Start Command**: `node server/index.js`
4. In **Environment Variables**, add:
   * `GEMINI_API_KEY`: Your Google Gemini API Key
   * `GEMINI_MODEL`: `gemini-3.8-flash` (or `gemini-2.0-flash`)
5. Deploy. Render will automatically bind the `PORT` and provide your live HTTPS URL.

### Option B: Frontend on Vercel + Backend on Render
If hosting the React frontend on Vercel and backend on Render:

1. **Backend (Render)**:
   * Deploy via Option A instructions above.
   * Note the backend URL (e.g., `https://contractlens-api.onrender.com`).
   * Set `ALLOWED_ORIGINS=https://your-app.vercel.app` on Render.
2. **Frontend (Vercel)**:
   * Import repository on [Vercel](https://vercel.com).
   * Framework Preset: **Vite**.
   * In **Environment Variables**, set:
     * `VITE_API_URL`: `https://contractlens-api.onrender.com`
   * Deploy. Vercel will build and serve the frontend, routing all extraction and analysis requests to your Render backend.

## ⚠️ Limitations & Disclaimers

- ContractLens provides **AI-generated analysis for educational and informational purposes only**
- It is **not legal advice** and should not be relied upon as such
- Always consult a qualified legal professional for important legal decisions
- AI analysis may contain inaccuracies — verify important findings independently
- Analysis quality depends on the clarity and completeness of the input text
- Very long contracts may be subject to API token limits

## 🔮 Future Improvements

- Side-by-side comparison of two contract versions
- Exportable risk report (PDF)
- Jurisdiction-specific analysis context
- Contract history and saved analyses

## 📄 License

MIT
