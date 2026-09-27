import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import multer from 'multer';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import { analyzeContract, extractImmutableSections } from '../lib/gemini.js';

const require = createRequire(import.meta.url);
const { PDFParse } = require('pdf-parse');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// CORS configuration supporting production domains while preserving local development
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map((o) => o.trim())
  : null;

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (!allowedOrigins || allowedOrigins.includes('*') || origin.startsWith('http://localhost:')) {
        return callback(null, true);
      }
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error('Not allowed by CORS'));
    },
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type'],
  })
);

app.use(express.json({ limit: '10mb' }));

// Health check endpoint for deployment monitoring
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Multer memory storage (no permanent disk storage)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB limit
  },
});

// ── PDF Extraction Endpoint ──────────────────────────────────
app.post(
  '/api/extract-pdf',
  (req, res, next) => {
    upload.single('file')(req, res, (err) => {
      if (err) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ error: 'PDF must be smaller than 10 MB.' });
        }
        return res.status(400).json({ error: err.message || 'File upload failed.' });
      }
      next();
    });
  },
  async (req, res) => {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: 'Please upload a PDF file.' });
    }

    // Server-side type & magic bytes validation
    const filename = file.originalname || 'document.pdf';
    const isPdfExt = filename.toLowerCase().endsWith('.pdf');
    const isPdfMime = file.mimetype === 'application/pdf' || file.mimetype === 'application/x-pdf';
    const hasPdfMagic = file.buffer && file.buffer.length >= 4 && file.buffer.slice(0, 4).toString() === '%PDF';

    if (!isPdfExt && !isPdfMime && !hasPdfMagic) {
      return res.status(400).json({ error: 'Please upload a PDF file.' });
    }

    if (!file.buffer || file.buffer.length === 0) {
      return res.status(400).json({ error: "We couldn't extract readable text from this PDF." });
    }

    try {
      const parser = new PDFParse({ data: file.buffer });
      const result = await parser.getText();
      await parser.destroy();

      let text = (result.text || '')
        .replace(/\n*-- \d+ of \d+ --\n*/g, '\n\n')
        .replace(/\f/g, '\n')
        .trim();

      // Check if meaningful, selectable text exists
      const cleanChars = text.replace(/[\s\d\W]/g, '');
      if (!text || text.length < 50 || cleanChars.length < 25) {
        return res.status(400).json({
          error:
            'This PDF appears to contain scanned images rather than selectable text. Please use a text-based PDF or paste the contract text.',
        });
      }

      // Check section extraction count
      const sections = extractImmutableSections(text);

      return res.json({
        text,
        filename,
        sectionCount: sections.length,
        message: 'Text extracted successfully',
      });
    } catch (error) {
      console.error('PDF extraction failed:', error.message);
      return res.status(400).json({
        error: "We couldn't extract readable text from this PDF. Please check if the file is corrupted or password-protected.",
      });
    }
  }
);

// ── Contract Analysis Endpoint ────────────────────────────────
app.post('/api/analyze', async (req, res) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'your_api_key_here') {
    return res.status(500).json({
      error: 'Gemini API key is not configured. Add GEMINI_API_KEY to your .env file.',
    });
  }

  const { text } = req.body;
  if (!text || typeof text !== 'string') {
    return res.status(400).json({ error: 'Please provide contract text to analyze.' });
  }
  if (text.trim().length < 50) {
    return res.status(400).json({ error: 'Contract text is too short. Please provide at least 50 characters.' });
  }
  if (text.length > 250_000) {
    return res.status(400).json({ error: 'Contract text is too long. Please limit to 250,000 characters.' });
  }

  try {
    const modelName = process.env.GEMINI_MODEL || 'gemini-3.8-flash';
    const result = await analyzeContract(text, apiKey, modelName);
    res.json(result);
  } catch (error) {
    console.error('Analysis error:', error.message);
    res.status(500).json({ error: error.message || 'Analysis failed. Please try again.' });
  }
});

// ── Serve frontend in production ──────────────────────────────
const distPath = path.join(__dirname, '..', 'dist');
app.use(express.static(distPath));
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

// ── Start ─────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n  ContractLens server running at http://localhost:${PORT}`);
  console.log(`  Gemini model: ${process.env.GEMINI_MODEL || 'gemini-3.8-flash'}`);
  console.log(`  API key: ${process.env.GEMINI_API_KEY ? '✓ configured' : '✗ missing'}\n`);
});
