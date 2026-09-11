/**
 * A.BÂT INGÉNIERIE — backend server
 * Serves the static site and handles the "Demander un devis" and
 * newsletter forms. Submissions are stored to a local JSON file and,
 * if SMTP environment variables are configured, forwarded by email.
 */

const express = require("express");
const path = require("path");
const fs = require("fs");
const rateLimit = require("express-rate-limit");

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, "data");
const DEVIS_FILE = path.join(DATA_DIR, "devis.json");
const NEWSLETTER_FILE = path.join(DATA_DIR, "newsletter.json");

/* ---------- helpers ---------- */
function ensureDataFiles() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  [DEVIS_FILE, NEWSLETTER_FILE].forEach((file) => {
    if (!fs.existsSync(file)) fs.writeFileSync(file, "[]", "utf8");
  });
}

function readJSON(file) {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    return [];
  }
}

function appendJSON(file, entry) {
  const list = readJSON(file);
  list.push(entry);
  fs.writeFileSync(file, JSON.stringify(list, null, 2), "utf8");
}

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/* ---------- optional email forwarding (Nodemailer) ---------- */
let mailer = null;
if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
  try {
    const nodemailer = require("nodemailer");
    mailer = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
  } catch (err) {
    console.warn("Nodemailer not installed / configured — emails will not be sent.", err.message);
  }
}

async function sendMail(subject, text) {
  if (!mailer) return;
  try {
    await mailer.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: process.env.CONTACT_EMAIL || "contact@ingenieurbatiment.com",
      subject,
      text,
    });
  } catch (err) {
    console.error("Email send failed:", err.message);
  }
}

/* ---------- middleware ---------- */
app.use(express.json({ limit: "100kb" }));
app.use(express.static(path.join(__dirname, "public"), { extensions: ["html"] }));

const formLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Trop de requêtes. Merci de réessayer plus tard." },
});

/* ---------- routes ---------- */
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", uptime: process.uptime() });
});

app.post("/api/devis", formLimiter, async (req, res) => {
  const { name, phone, email, service, message } = req.body || {};

  if (!name || !phone || !email || !service || !message) {
    return res.status(400).json({ error: "Tous les champs sont requis." });
  }
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: "Adresse email invalide." });
  }

  const entry = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
    name: String(name).slice(0, 120),
    phone: String(phone).slice(0, 40),
    email: String(email).slice(0, 120),
    service: String(service).slice(0, 80),
    message: String(message).slice(0, 2000),
    createdAt: new Date().toISOString(),
  };

  try {
    appendJSON(DEVIS_FILE, entry);
    await sendMail(
      `Nouvelle demande de devis — ${entry.name}`,
      `Nom: ${entry.name}\nTéléphone: ${entry.phone}\nEmail: ${entry.email}\nService: ${entry.service}\nMessage: ${entry.message}`
    );
    res.status(201).json({ ok: true, message: "Demande envoyée avec succès." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur, veuillez réessayer." });
  }
});

app.post("/api/newsletter", formLimiter, (req, res) => {
  const { email } = req.body || {};
  if (!email || !emailRegex.test(email)) {
    return res.status(400).json({ error: "Adresse email invalide." });
  }

  try {
    const list = readJSON(NEWSLETTER_FILE);
    if (list.some((e) => e.email.toLowerCase() === String(email).toLowerCase())) {
      return res.status(200).json({ ok: true, message: "Déjà inscrit." });
    }
    appendJSON(NEWSLETTER_FILE, { email, createdAt: new Date().toISOString() });
    res.status(201).json({ ok: true, message: "Inscription réussie." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur, veuillez réessayer." });
  }
});

/* simple admin read-only endpoints, protect with a token in production */
app.get("/api/admin/devis", (req, res) => {
  if (req.query.token !== (process.env.ADMIN_TOKEN || "")) {
    return res.status(401).json({ error: "Non autorisé." });
  }
  res.json(readJSON(DEVIS_FILE));
});

/* 404 for unknown API routes */
app.use("/api", (req, res) => {
  res.status(404).json({ error: "Route inconnue." });
});

/* fallback to index.html for any other route */
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

/* ---------- start ---------- */
ensureDataFiles();
app.listen(PORT, () => {
  console.log(`A.BÂT INGÉNIERIE server running on port ${PORT}`);
});
