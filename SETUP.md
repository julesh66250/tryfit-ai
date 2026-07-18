# TryFit AI — Guide de démarrage

## 1. Installer les dépendances

Ouvre un terminal dans ce dossier et lance :

```bash
npm install
```

## 2. Créer ton fichier .env.local

Copie le fichier exemple :

```bash
cp .env.example .env.local
```

Puis remplis les valeurs :
- **NEXT_PUBLIC_SUPABASE_URL** → dans ton projet Supabase > Settings > API
- **NEXT_PUBLIC_SUPABASE_ANON_KEY** → idem
- **FASHN_API_KEY** → sur fashn.ai après achat de crédits

## 3. Configurer Supabase

1. Crée un projet sur [supabase.com](https://supabase.com) (gratuit)
2. Va dans **SQL Editor**
3. Colle et exécute le contenu de `supabase/schema.sql`
4. Colle et exécute le contenu de `supabase/functions.sql`

## 4. Lancer l'application

```bash
npm run dev
```

Ouvre [http://localhost:3000](http://localhost:3000)

## Structure du projet

```
app/
  page.tsx              → Landing page
  (auth)/
    login/              → Connexion
    register/           → Inscription
  (app)/
    dashboard/          → Accueil utilisateur
    try-on/             → Page principale essayage
    history/            → Historique
    profile/            → Profil & crédits
    premium/            → Plans d'abonnement
  api/
    try-on/             → Route backend (clé API sécurisée ici)
```

## Modèle économique intégré

- Gratuit : 3 crédits à l'inscription
- 1 crédit = 1 essayage
- Pages Premium prêtes (paiement à brancher avec Stripe ou RevenueCat)
