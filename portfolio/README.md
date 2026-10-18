# Portfolio — Jonathan (Développeur Frontend)

Site portfolio responsive (HTML/CSS/JS) avec un backend Node.js/Express
et une base de données Supabase pour :
- stocker les messages envoyés depuis le formulaire de contact,
- (optionnel) alimenter dynamiquement la section "Mes projets récents".

## Structure

```
portfolio/
├── public/                 # Frontend statique
│   ├── index.html
│   ├── css/style.css
│   ├── js/main.js
│   └── assets/img/
├── server/                 # Backend Node.js
│   ├── server.js
│   ├── routes/
│   │   ├── contact.js      # POST /api/contact
│   │   └── projects.js     # GET  /api/projects
│   └── lib/supabaseClient.js
├── supabase/schema.sql     # Tables à créer dans Supabase
├── .env.example
└── package.json
```

## 1. Créer le projet Supabase

1. Va sur https://supabase.com et crée un nouveau projet.
2. Dans **SQL Editor**, colle et exécute le contenu de `supabase/schema.sql`.
   Cela crée deux tables : `contact_messages` et `projects`.
3. Dans **Settings → API**, récupère :
   - `Project URL` → `SUPABASE_URL`
   - `service_role` key (secrète, ne jamais l'exposer côté navigateur) → `SUPABASE_SERVICE_ROLE_KEY`

## 2. Configurer les variables d'environnement

```bash
cp .env.example .env
```

Remplis `.env` avec tes vraies valeurs Supabase.

## 3. Installer et lancer

```bash
npm install
npm run dev      # avec nodemon (rechargement auto)
# ou
npm start        # production
```

Le site est servi sur **http://localhost:3000** — le frontend et l'API
tournent sur le même serveur (pas de souci CORS).

## Endpoints API

| Méthode | Route             | Description                                  |
|---------|--------------------|-----------------------------------------------|
| POST    | `/api/contact`     | Enregistre un message (name, email, subject, message) |
| GET     | `/api/projects`    | Retourne la liste des projets (table `projects`) |
| GET     | `/api/health`       | Vérifie que le serveur tourne                |

Le formulaire de contact du site appelle automatiquement `/api/contact`
(voir `public/js/main.js`). Si `/api/projects` ne répond pas encore
(Supabase pas configuré), la grille de projets statique déjà présente
dans `index.html` reste affichée — le site fonctionne donc même sans
backend actif.

## À personnaliser

- **Photo de profil** : remplace `public/assets/img/portrait-placeholder.svg`
  par ta vraie photo (garde le nom de fichier ou mets à jour `index.html`).
- **CV** : place ton CV en PDF dans `public/assets/cv-jonathan.pdf`
  (le bouton "Télécharger mon CV" pointe déjà vers ce fichier).
- **Liens sociaux** : mets à jour les URLs GitHub / LinkedIn / Instagram /
  YouTube dans `index.html` (elles pointent vers des placeholders génériques).
- **Couleurs / polices** : tout est centralisé dans les variables CSS en
  haut de `public/css/style.css` (`:root { --primary; --secondary; ... }`).

## Déploiement

Le backend sert aussi les fichiers statiques, donc un seul déploiement
suffit (Render, Railway, Fly.io, un VPS, etc.). Pense à définir
`SUPABASE_URL` et `SUPABASE_SERVICE_ROLE_KEY` comme variables
d'environnement sur la plateforme choisie — ne les commite jamais dans
le dépôt Git (le fichier `.env` doit rester dans `.gitignore`).
