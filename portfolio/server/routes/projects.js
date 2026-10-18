const express = require('express');
const router = express.Router();
const supabase = require('../lib/supabaseClient');

// GET /api/projects — list published projects (used to render the "Mes projets récents" grid)
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('id, title, description, image_url, tags, project_url, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase select error:', error.message);
      return res.status(500).json({ error: 'Impossible de charger les projets.' });
    }

    return res.json(data || []);
  } catch (err) {
    console.error('Projects route error:', err);
    return res.status(500).json({ error: 'Erreur serveur.' });
  }
});

module.exports = router;
