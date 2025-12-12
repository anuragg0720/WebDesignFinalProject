const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const fs = require('fs');
const path = require('path');

// --- Load simple Northeastern FAQ data for lightweight RAG ---
let neuFaqs = [];
try {
  const ragPath = path.join(__dirname, '..', 'data', 'neu-faqs.json');
  const raw = fs.readFileSync(ragPath, 'utf8');
  neuFaqs = JSON.parse(raw);
  console.log(`Loaded ${neuFaqs.length} NEU FAQ items for Husky AI.`);
} catch (err) {
  console.warn('Could not load neu-faqs.json, Husky RAG will be disabled:', err.message);
}

// Very small keyword-based matcher: scores FAQs by overlapping words + tags
function findBestNeuEntry(message) {
  if (!neuFaqs || neuFaqs.length === 0 || !message) return null;
  const text = message.toLowerCase();

  let best = null;
  let bestScore = 0;

  for (const item of neuFaqs) {
    const haystack = (
      (item.question || '') +
      ' ' +
      (item.category || '') +
      ' ' +
      (item.tags || []).join(' ')
    ).toLowerCase();

    let score = 0;
    const words = text.split(/[^a-z0-9]+/).filter(Boolean);
    for (const w of words) {
      if (haystack.includes(w)) score += 1;
    }

    if (score > bestScore) {
      bestScore = score;
      best = item;
    }
  }

  // require at least a little overlap
  return bestScore >= 1 ? best : null;
}

// POST /api/chat  (mounted under /api in server.js)
router.post('/', auth(), async (req, res) => {
  try {
    const { message, context } = req.body || {};

    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'message is required' });
    }

    // --- Build RAG-style context from NEU FAQ data ---
    const neuEntry = findBestNeuEntry(message);
    let ragContextText = '';

    if (neuEntry) {
      const links = Array.isArray(neuEntry.links) ? neuEntry.links.join('\n') : '';
      ragContextText =
        `Here is trustworthy Northeastern University context that may help you answer:\n` +
        `Title: ${neuEntry.question}\n` +
        `Summary: ${neuEntry.answer}\n` +
        (links ? `Links:\n${links}\n` : '');
    }

    const ollamaUrl = process.env.OLLAMA_URL || 'http://127.0.0.1:11434';
    const model = process.env.OLLAMA_MODEL || 'llama3.1';

    const messages = [
      {
        role: 'system',
        content:
          'You are Husky AI, a helpful assistant for Northeastern University students, faculty, and staff. ' +
          'Use the provided Northeastern context and links when available. Keep answers concise, and when you reference a policy or process, suggest that students confirm details on the official NU site.'
      }
    ];

    if (ragContextText) {
      messages.push({
        role: 'system',
        content: ragContextText
      });
    }

    // optional short history from frontend
    if (Array.isArray(context)) {
      for (const c of context) {
        if (c && typeof c.role === 'string' && typeof c.content === 'string') {
          messages.push({ role: c.role, content: c.content });
        }
      }
    }

    messages.push({ role: 'user', content: message });

    // Node 22 has global fetch
    const ollamaRes = await fetch(`${ollamaUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        messages,
        stream: false
      })
    });

    if (!ollamaRes.ok) {
      const text = await ollamaRes.text();
      console.error('❌ Ollama error', ollamaRes.status, text);
      return res
        .status(500)
        .json({ error: 'Error calling Husky AI model (Ollama).' });
    }

    const data = await ollamaRes.json();
    const reply =
      data?.message?.content ||
      data?.message?.[0]?.content ||
      'Sorry, I could not generate a reply at the moment.';

    return res.json({ reply });
  } catch (err) {
    console.error('❌ Chat route error:', err);
    return res.status(500).json({ error: 'Unexpected server error in chat.' });
  }
});

module.exports = router;
