# A.BÂT INGÉNIERIE — Site vitrine

Site vitrine responsive (HTML / CSS / JS) avec un backend Node.js (Express) prêt à être déployé sur **Render**.

## Structure du projet

```
abat-batiment/
├── public/                # Frontend statique
│   ├── index.html
│   ├── css/style.css
│   └── js/main.js
├── data/                  # Stockage JSON des soumissions de formulaires (créé automatiquement)
├── server.js              # Serveur Express
├── package.json
├── .env.example            # Variables d'environnement à copier en .env
└── .gitignore
```

## Fonctionnalités

- Design responsive (mobile / tablette / desktop) reproduisant la maquette fournie.
- Navigation avec menu mobile, ancres et surlignage de la section active.
- Compteurs animés (années d'expérience, projets, clients, professionnels).
- Carrousel de témoignages.
- Modale "Demander un devis" avec formulaire connecté au backend (`POST /api/devis`).
- Formulaire newsletter connecté au backend (`POST /api/newsletter`).
- Backend Express : validation, limitation de débit (rate limiting), stockage JSON, envoi d'email optionnel (SMTP via Nodemailer).
- Bouton flottant WhatsApp.

## 1. Installation locale

Prérequis : [Node.js](https://nodejs.org) version 18 ou supérieure.

```bash
# 1. Se placer dans le dossier du projet
cd abat-batiment

# 2. Installer les dépendances
npm install

# 3. (Optionnel) copier le fichier d'environnement pour activer l'envoi d'email
cp .env.example .env
# puis éditer .env avec vos identifiants SMTP

# 4. Démarrer le serveur
npm start
```

Le site est alors disponible sur **http://localhost:3000**.

Pour le développement avec rechargement automatique :

```bash
npm run dev
```

## 2. Personnaliser le contenu

- **Textes / coordonnées** : modifiez directement `public/index.html` (téléphone, email, adresse, réseaux sociaux).
- **Couleurs** : les couleurs sont centralisées dans les variables CSS en haut de `public/css/style.css` (`:root`).
- **Images** : remplacez les URLs `https://images.unsplash.com/...` dans `index.html` par vos propres photos (placez-les dans `public/images/` et mettez à jour les chemins).
- **Vidéo de présentation** : dans `index.html`, remplacez le bloc `.video-placeholder` par un lecteur YouTube/Vimeo intégré (`<iframe>`).

## 3. Déploiement sur Render — étapes complètes

### Étape A — Pousser le code sur GitHub

```bash
git init
git add .
git commit -m "Initial commit — site A.BÂT INGÉNIERIE"
git branch -M main
git remote add origin https://github.com/<votre-utilisateur>/abat-batiment.git
git push -u origin main
```

### Étape B — Créer le service sur Render

1. Créez un compte sur [render.com](https://render.com) et connectez votre compte GitHub.
2. Cliquez sur **New +** → **Web Service**.
3. Sélectionnez le dépôt `abat-batiment` que vous venez de pousser.
4. Renseignez les paramètres suivants :
   - **Name** : `abat-ingenierie` (ou le nom de votre choix)
   - **Region** : la région la plus proche de vos utilisateurs
   - **Branch** : `main`
   - **Runtime** : `Node`
   - **Build Command** : `npm install`
   - **Start Command** : `npm start`
   - **Instance Type** : `Free` (suffisant pour démarrer)
5. Dans la section **Environment Variables**, ajoutez (si vous voulez l'envoi d'email) :
   - `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`, `CONTACT_EMAIL`
   - `ADMIN_TOKEN` (jeton pour protéger `/api/admin/devis`)
   - Render définit automatiquement `PORT` — ne pas la redéfinir manuellement.
6. Cliquez sur **Create Web Service**.

Render installe les dépendances, démarre `node server.js`, et vous fournit une URL du type :
`https://abat-ingenierie.onrender.com`

### Étape C — Vérifier le déploiement

- Ouvrez l'URL fournie par Render : le site doit s'afficher.
- Testez le formulaire "Demander un devis" : la soumission doit renvoyer un message de succès.
- Vérifiez `GET /api/health` → doit répondre `{"status":"ok", ...}`.

### Étape D — (Optionnel) Domaine personnalisé

Dans les paramètres du service Render → **Custom Domains**, ajoutez votre nom de domaine (ex. `www.ingenieurbatiment.com`) et suivez les instructions DNS fournies (enregistrement CNAME).

## 4. Notes importantes

- Le plan **Free** de Render met le service en veille après une période d'inactivité ; la première requête après une pause peut prendre quelques secondes.
- Le stockage des soumissions dans `data/*.json` n'est **pas persistant** sur le plan Free de Render (le système de fichiers est réinitialisé à chaque redéploiement). Pour un stockage durable en production, branchez une base de données (ex. Render PostgreSQL) ou activez l'envoi par email (SMTP) pour ne rien perdre.
- Ne committez jamais votre fichier `.env` (il est ignoré via `.gitignore`).

## 5. Licence

Projet livré pour usage libre par le client.
