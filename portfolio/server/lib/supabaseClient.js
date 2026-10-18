const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
// Use the SERVICE ROLE key on the server only — never expose it to the browser.
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.warn(
    '[supabaseClient] SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is missing. ' +
    'Set them in your .env file — see .env.example.'
  );
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { persistSession: false }
});

module.exports = supabase;
