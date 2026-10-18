const express = require('express');
const router = express.Router();
const supabase = require('../lib/supabaseClient');

// Very small in-memory rate limiter (per IP) to reduce spam.
// For production, replace with a proper store (Redis) or a service like Cloudflare.
const rateLimit = new Map();
const WINDOW_MS = 60 * 1000;
const MAX_REQUESTS = 5;

function isRateLimited(ip) {
  const now = Date.now();
  const entry = rateLimit.get(ip) || { count: 0, start: now };
  if (now - entry.start > WINDOW_MS) {
    entry.count = 0;
    entry.start = now;
  }
  entry.count += 1;
  rateLimit.set(ip, entry);
  return entry.count > MAX_REQUESTS;
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// POST /api/contact — store a contact message in Supabase
router.post('/', async (req, res) => {
  try {
    const ip = req.ip;
    if (isRateLimited(ip)) {
      return res.status(429).json({ error: 'Trop de messages envoyés. Réessayez dans une minute.' });
    }

    const { name, email, subject, message } = req.body || {};

    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Les champs nom, email et message sont obligatoires.' });
    }
    if (!isValidEmail(email)) {
      return res.status(400).json({ error: 'Adresse email invalide.' });
    }
    if (String(message).length > 5000) {
      return res.status(400).json({ error: 'Le message est trop long.' });
    }

    const { data, error } = await supabase
      .from('contact_messages')
      .insert([{
        name: String(name).trim().slice(0, 200),
        email: String(email).trim().slice(0, 200),
        subject: subject ? String(subject).trim().slice(0, 200) : null,
        message: String(message).trim(),
      }])
      .select()
      .single();

    if (error) {
      console.error('Supabase insert error:', error.message);
      return res.status(500).json({ error: "Impossible d'enregistrer le message pour le moment." });
    }

    return res.status(201).json({ success: true, id: data.id });
  } catch (err) {
    console.error('Contact route error:', err);
    return res.status(500).json({ error: 'Erreur serveur.' });
  }
});

module.exports = router;
