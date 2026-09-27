import { analyzeContract } from '../lib/gemini.js';

export const config = { maxDuration: 60 };

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'your_api_key_here') {
    return res.status(500).json({
      error: 'Gemini API key is not configured. Set GEMINI_API_KEY in Vercel environment variables.',
    });
  }

  const { text } = req.body;
  if (!text || typeof text !== 'string') {
    return res.status(400).json({ error: 'Please provide contract text to analyze.' });
  }
  if (text.trim().length < 50) {
    return res.status(400).json({ error: 'Contract text is too short. Please provide at least 50 characters.' });
  }
  if (text.length > 100_000) {
    return res.status(400).json({ error: 'Contract text is too long. Please limit to 100,000 characters.' });
  }

  try {
    const modelName = process.env.GEMINI_MODEL || 'gemini-3.8-flash';
    const result = await analyzeContract(text, apiKey, modelName);
    res.json(result);
  } catch (error) {
    console.error('Analysis error:', error.message);
    res.status(500).json({ error: error.message || 'Analysis failed. Please try again.' });
  }
}
