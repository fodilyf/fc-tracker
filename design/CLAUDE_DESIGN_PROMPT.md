# 🎨 Prompt master pour Claude Design

Voilà le prompt à **copier-coller dans Claude Design** (claude.ai/design). Lance une nouvelle conversation et colle tel quel. Tu obtiendras des maquettes interactives live que tu pourras itérer.

---

## 🚀 PROMPT À COLLER

```
Je veux que tu designes l'interface complète d'une app web qui s'appelle "FC TRACKER".

== CONTEXTE ==
C'est une app pour suivre les matchs FIFA / FC 25 entre potes. On ajoute son score, le pote valide, et il y a un classement live + des stats par duo. Il y a aussi un système de "titres humiliants" : si tu perds 3 fois de suite contre quelqu'un, tu deviens son "lkebda" (boucher), 5 fois → "zawja" (mariée), 10 fois → "l9a7ba" (interprétation soft). L'avatar emoji du joueur change automatiquement selon son pire titre.

== VIBE ==
Inspiration : EA Sports FIFA, FUT cards, broadcast sport TV, gaming arène, streetwear nocturne. Ambiance : énergie, compétition, fun entre potes.

== DESIGN SYSTEM ==

Couleurs (dark mode obligatoire) :
- Background principal : #0A0E1A (sombre profond)
- Background cards : #0F1729
- Border : #1E2A47
- Neon vert (signature) : #00FF87
- Or (podium #1, FUT cards) : #FFD700
- Rose accent : #FF0080 (badges, notifs)
- Violet : #9D4EDD (titre l9a7ba)
- Rouge : #FF3D5A (défaites)
- Jaune : #FFB800 (lkebda, warnings)

Typo :
- Display (titres, scores) : Bebas Neue ou équivalent condensé sport
- Body : Inter
- Numeric : Inter tabular ou JetBrains Mono pour les chiffres

Effets :
- Glass morphism sur cards (backdrop-blur)
- Glow néon sur boutons et highlights
- Grille de fond subtile (style terrain de foot)
- Gradients radial sombres
- Animations smooth (250ms cubic-bezier)
- Hover : translate-y et glow plus fort

== PAGES À DESIGNER ==

Génère ces 8 écrans, mobile-first (375x812 iPhone) avec versions desktop (1440x900) :

1. LANDING (utilisateur non connecté)
   - Hero : "FC TRACKER" gigantesque néon
   - Tagline : "Track your matches. Crown your kings. Shame your lkebdas."
   - 3 cards features : Classement live • Duels head-to-head • Titres légendaires
   - CTA : "Commencer" + "Voir le classement"

2. LEADERBOARD (classement)
   - Liste des joueurs triés par points
   - Top 3 avec médailles 🥇🥈🥉 et fond doré pour #1
   - Chaque joueur : avatar emoji rond avec halo (couleur signature perso), pseudo, V/N/D, +/-, points en GROS
   - Mobile : cards verticales empilées
   - Desktop : table propre
   - Animation : entrée en cascade (stagger)

3. AJOUT DE MATCH (formulaire)
   - 2 cards côte à côte (Joueur 1 vs Joueur 2)
   - Chaque card : sélecteur joueur, sélecteur équipe FIFA (PSG, Real, etc.), GROS input score au centre
   - Date/heure picker
   - Notes optionnelles
   - Gros CTA "⚽ Enregistrer le match"
   - Animation : pulse léger sur le score quand on tape

4. PROFIL JOUEUR (/player/[username])
   - Bandeau hero : carte FUT style (ratio 3:4) au centre avec :
     * Avatar emoji énorme dans un cercle entouré d'or
     * Pseudo en display
     * Rank au classement (#1 doré, #2 argent...)
     * Bio en italique
     * Équipe fétiche
   - Grille de stats : Matchs, V, D, BP, BC, %V (chiffres énormes)
   - Section "Titres en cours" :
     * "Domine" : liste des potes qu'il domine (avec emoji titre)
     * "Subit" : liste des potes qui le dominent (rouge)
   - Liste 10 derniers matchs

5. DUELS (head-to-head + Hall of Shame)
   - Top : 2 selects pour choisir 2 joueurs
   - Display : 2 avatars face-à-face avec score H2H au milieu (style FIFA pré-match)
   - Stats du duo : buts, win streak, etc.
   - Section "Hall of Shame" : liste des titres actifs dans toute la ligue, style médaille
   - Cards titres avec :
     * Avatar de la victime + flèche + avatar du dominant
     * Badge énorme du titre (LKEBDA / ZAWJA / L9A7BA) avec emoji
     * Compteur "X défaites de suite"

6. NOTIFICATIONS (avec onglets)
   - 3 tabs : "⏳ À valider" / "❌ Mes refusés" / "⚖️ À arbitrer"
   - Chaque tab : badge avec compteur si > 0
   - Cards de match en attente :
     * Score, joueurs, "Ajouté par X"
     * Boutons "✅ Valider" / "❌ Refuser"
   - Système d'arbitrage : workflow clair

7. SETTINGS (édition profil)
   - Carte FUT preview en haut (live update quand on change)
   - Grid de 32 emojis pour choisir avatar
   - Input pseudo, bio, équipe favorite
   - Color picker pour couleur signature
   - Note : "Si tu deviens lkebda, ton avatar sera remplacé temporairement 🥩"

8. CARTE DE PARTAGE MATCH (1080x1080 image générée)
   - Style FUT card mais format carré pour Instagram
   - Bordure dorée épaisse
   - Pattern grid en fond
   - 2 avatars face-à-face avec leur couleur signature en halo
   - Score CENTER en énorme (jaune si vainqueur)
   - Noms + équipes
   - Badge "👑 GAGNANT" sur le vainqueur
   - Date en bas + watermark "FC TRACKER" néon
   - Cette carte doit donner envie d'être partagée sur WhatsApp/Insta

== MICRO-INTERACTIONS À INCLURE ==

- Boutons : scale(0.97) au press
- Cards : translate-y(-2px) au hover + glow plus fort
- Score qui monte : count-up animation
- Confettis quand match validé qui te fait gagner
- Pulse permanent sur badge notif > 0
- Avatar lkebda : effet "shake" puis remplacement
- Stagger sur entrée de listes (50ms entre rows)
- Pull-to-refresh sur mobile

== LIVRABLE ==

Génère un fichier HTML + Tailwind interactif. Chaque page accessible via une nav. Inclus une bottom nav mobile (5 icônes : Classmt, Histo, +Match, Duels, Notifs) et un FAB "+" flottant.

Bonus : 
- Effet "ON FIRE" 🔥 au-dessus du #1 du classement
- Easter egg : à 10 victoires consécutives, animation spéciale
- Mode "broadcast" : style overlay TV pour un match en cours
```

---

## 🎯 Comment l'utiliser ?

### Étape 1 : Ouvre Claude Design
- Va sur **https://claude.ai/design** (avec un abonnement Claude Pro)
- Lance une **nouvelle conversation**

### Étape 2 : Colle le prompt ci-dessus
- Copie tout le bloc de code entre les `` ``` `` ci-dessus
- Colle dans Claude Design
- Envoie

### Étape 3 : Itère
Claude Design va te générer une **première version interactive**. Ensuite tu peux dire :
- "Le bouton est trop petit, fais-le plus prominent"
- "Ajoute un effet de glass plus prononcé sur les cards"
- "La page Duels est trop chargée, simplifie le top"
- "Génère 3 variantes de la carte FUT joueur"

### Étape 4 : Récupère le code
Quand tu es content, Claude Design te donne le code (HTML + Tailwind ou React + Tailwind).

### Étape 5 : J'intègre le code dans FC Tracker
Tu me partages les composants/pages générés et je les **intègre proprement** dans le projet Next.js existant en branchant la logique Supabase, les actions, etc.

---

## 💡 Conseils pro

1. **Itère page par page** : ne demande pas tout d'un coup. Commence par 1 page, peaufine, puis enchaîne.
2. **Demande des variantes** : "Donne-moi 3 versions de cette card" → tu choisis la meilleure.
3. **Sois précis sur les détails** : "Le glow doit être plus subtil, 8px max" plutôt que "moins de glow".
4. **Mobile d'abord** : demande toujours la version mobile en premier (375px), puis desktop.
5. **Garde le brief sous les yeux** : si Claude Design dévie, recolle la palette + typo.

---

## 🚀 Workflow complet

```
1. Tu utilises Claude Design pour générer les maquettes interactives
2. Tu itères jusqu'à ce que ça te plaise
3. Tu me partages le code généré (ou tu télécharges)
4. Je l'intègre dans le projet Next.js (en gardant la logique Supabase)
5. Push → Vercel rebuild → site mis à jour
```

Tu peux aussi me dire **"intègre tel screen"** et je fais directement les modifications dans le code FC Tracker actuel sans passer par Claude Design.
