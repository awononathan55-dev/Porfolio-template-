require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const contactRouter = require('./routes/contact');
const projectsRouter = require('./routes/projects');

const app = express();
const PORT = process.env.PORT || 3000;

app.set('trust proxy', 1); // needed for correct req.ip behind a proxy (Render, Railway, etc.)

app.use(helmet({
  contentSecurityPolicy: false // relaxed for simplicity; tighten before production
}));
app.use(cors());
app.use(morgan('dev'));
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: true }));

// API routes
app.use('/api/contact', contactRouter);
app.use('/api/projects', projectsRouter);

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// Serve the static frontend (public/) — same-origin, so no CORS issues from the browser
app.use(express.static(path.join(__dirname, '..', 'public')));

// Fallback to index.html for any non-API route (simple SPA-friendly routing)
app.get(/^(?!\/api).*/, (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`✅ Portfolio server running on http://localhost:${PORT}`);
});
