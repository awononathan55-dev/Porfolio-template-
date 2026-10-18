// ===================================================================
// Jonathan — Portfolio | main.js
// ===================================================================

const API_BASE = window.location.origin; // backend served from same origin

document.addEventListener('DOMContentLoaded', () => {
  initMobileNav();
  initScrollSpy();
  initContactForm();
  initFooterYear();
  loadProjects(); // optional: replaces static cards if API responds
});

/* ---------- Mobile nav ---------- */
function initMobileNav(){
  const burger = document.getElementById('burger');
  const nav = document.getElementById('nav');
  if(!burger || !nav) return;

  burger.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('open');
    burger.classList.toggle('open', isOpen);
    burger.setAttribute('aria-expanded', String(isOpen));
  });

  nav.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      nav.classList.remove('open');
      burger.classList.remove('open');
      burger.setAttribute('aria-expanded', 'false');
    });
  });
}

/* ---------- Highlight nav link for section in view ---------- */
function initScrollSpy(){
  const links = document.querySelectorAll('.nav-link');
  const sections = Array.from(links)
    .map(l => document.querySelector(l.getAttribute('href')))
    .filter(Boolean);

  if(!('IntersectionObserver' in window) || sections.length === 0) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if(entry.isIntersecting){
        const id = '#' + entry.target.id;
        links.forEach(l => l.classList.toggle('active', l.getAttribute('href') === id));
      }
    });
  }, { rootMargin: '-40% 0px -50% 0px' });

  sections.forEach(sec => observer.observe(sec));
}

/* ---------- Footer year ---------- */
function initFooterYear(){
  const yearEl = document.getElementById('year');
  if(yearEl) yearEl.textContent = new Date().getFullYear();
}

/* ---------- Contact form -> POST /api/contact (Node + Supabase) ---------- */
function initContactForm(){
  const form = document.getElementById('contact-form');
  const status = document.getElementById('form-status');
  const submitBtn = document.getElementById('contact-submit');
  if(!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    status.textContent = '';
    status.className = 'form-status';

    const data = Object.fromEntries(new FormData(form).entries());

    if(!data.name || !data.email || !data.message){
      status.textContent = 'Merci de remplir les champs obligatoires.';
      status.classList.add('error');
      return;
    }

    submitBtn.disabled = true;
    const originalLabel = submitBtn.textContent;
    submitBtn.textContent = 'Envoi en cours...';

    try {
      const res = await fetch(`${API_BASE}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      const json = await res.json().catch(() => ({}));

      if(!res.ok){
        throw new Error(json.error || 'Une erreur est survenue.');
      }

      status.textContent = 'Message envoyé avec succès. Je vous répondrai bientôt !';
      status.classList.add('success');
      form.reset();
    } catch (err) {
      status.textContent = err.message || 'Impossible d\'envoyer le message pour le moment.';
      status.classList.add('error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = originalLabel;
    }
  });
}

/* ---------- Load projects dynamically from Supabase via API ---------- */
async function loadProjects(){
  const grid = document.getElementById('project-grid');
  if(!grid) return;

  try {
    const res = await fetch(`${API_BASE}/api/projects`);
    if(!res.ok) return; // keep static fallback markup already in the HTML
    const projects = await res.json();
    if(!Array.isArray(projects) || projects.length === 0) return;

    grid.innerHTML = projects.map(p => `
      <article class="project-card">
        <div class="project-thumb" style="${p.image_url ? `background-image:url('${escapeHtml(p.image_url)}')` : ''}"></div>
        <div class="project-body">
          <h3>${escapeHtml(p.title)}</h3>
          <p>${escapeHtml(p.description || '')}</p>
          <div class="tags">${(p.tags || []).map(t => `<span>${escapeHtml(t)}</span>`).join('')}</div>
        </div>
      </article>
    `).join('');
  } catch (err) {
    // Silent fallback: static HTML cards remain visible
    console.warn('Projects API unavailable, showing static fallback.', err.message);
  }
}

function escapeHtml(str = ''){
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
