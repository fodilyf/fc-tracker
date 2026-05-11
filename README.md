# ⚽ FC TRACKER

Site pour suivre vos matchs FIFA / FC entre potes : classement live, historique, stats par joueur et par duo, et le **système de titres légendaire** (lkebda / zawja / l9a7ba).

Stack : **Next.js 14** (App Router) + **Supabase** (Auth + Postgres + Realtime) + **Tailwind**. Déploiement gratuit sur **Vercel**.

---

## 🎭 Le système de titres

Calculé entre chaque paire de joueurs, basé sur les **défaites consécutives actuelles** :

| Défaites de suite | Titre | Emoji |
|---|---|---|
| 3+ | **LKEBDA** | 🥩 |
| 5+ | **ZAWJA** | 💍 |
| 10+ | **L9A7BA** | 👠 |

Une seule victoire (ou un nul) suffit à briser la série.
Affichage dans l'onglet **Duels** + un **Hall of Shame** global.

---

## 🚀 Déploiement complet (15 minutes)

### 1) Crée un projet Supabase (gratuit)

1. Va sur [supabase.com](https://supabase.com) → **New Project**
2. Choisis un nom (ex: `fc-tracker`), un mot de passe DB, une région proche
3. Attends 1-2 min que le projet soit prêt

### 2) Crée le schéma de la base

1. Dans Supabase → **SQL Editor** → **New Query**
2. Copie tout le contenu de [`supabase/schema.sql`](./supabase/schema.sql)
3. Clique **Run** ✅

### 3) (Optionnel) Désactive la confirmation par email

Pour que tes potes puissent se connecter direct sans valider leur email :
- Supabase → **Authentication** → **Providers** → **Email**
- Décoche **Confirm email**

### 4) Récupère les clés Supabase

- Supabase → **Project Settings** → **API**
- Copie `Project URL` et `anon public key`

### 5) Pousse le code sur GitHub

```bash
cd fc-tracker
git init
git add .
git commit -m "Initial commit"
gh repo create fc-tracker --public --source=. --push
# OU manuellement : créer le repo sur github.com puis :
# git remote add origin https://github.com/<toi>/fc-tracker.git
# git push -u origin main
```

### 6) Déploie sur Vercel

1. Va sur [vercel.com](https://vercel.com) → **Add New Project**
2. Importe ton repo `fc-tracker`
3. Dans **Environment Variables**, ajoute :
   - `NEXT_PUBLIC_SUPABASE_URL` = ton Project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = ton anon key
4. Clique **Deploy** 🎉

Tu obtiens un lien du type `https://fc-tracker.vercel.app` à partager avec tes potes.

---

## 🛠️ Développement local

```bash
cd fc-tracker
npm install
cp .env.local.example .env.local
# édite .env.local avec tes clés Supabase
npm run dev
```

Ouvre [http://localhost:3000](http://localhost:3000).

---

## 📁 Structure

```
fc-tracker/
├── app/
│   ├── page.tsx              # Landing
│   ├── login/                # Inscription / connexion
│   ├── leaderboard/          # Classement live (realtime)
│   ├── add-match/            # Ajout d'un match
│   ├── history/              # Historique des matchs
│   ├── duels/                # Head-to-head + Hall of Shame
│   └── stats/                # Stats détaillées par joueur
├── components/
│   └── Nav.tsx               # Navigation + auth
├── lib/
│   ├── supabase-browser.ts
│   ├── supabase-server.ts
│   └── titles.ts             # Logique des titres
├── supabase/
│   └── schema.sql            # ⭐ À exécuter dans Supabase
└── README.md
```

---

## 🎯 Fonctionnalités

- ✅ **Comptes individuels** (email + mot de passe)
- ✅ **Classement live** — points (3/1/0), V/N/D, BP/BC, +/-, % victoires
- ✅ **Historique complet** des matchs (suppression possible par le créateur)
- ✅ **Stats par joueur** — meilleure victoire, pire défaite, séries, équipe préférée, rivalités
- ✅ **Stats par duo** — head-to-head complet
- ✅ **Système de titres** lkebda / zawja / l9a7ba avec Hall of Shame
- ✅ **Realtime** — toutes les pages se mettent à jour quand un match est ajouté
- ✅ **Design FIFA/EA Sports** — sombre, néon vert, look gaming

---

## 🔒 Sécurité

- Row Level Security activé sur toutes les tables
- Lecture publique (pour que tout le monde voie les stats)
- Insertion réservée aux utilisateurs authentifiés
- Suppression d'un match réservée à son créateur

---

Bon match ! ⚽🔥
