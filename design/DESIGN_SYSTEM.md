# 🎨 FC TRACKER — Design System

**Vibe** : Gaming pur (FIFA / FUT / EA Sports)
**Cible** : Jeunes 18-35 ans, fans de FIFA/FC qui veulent traquer leurs matchs entre potes
**Plateforme principale** : Mobile (téléphone) + Desktop secondaire

---

## 🎨 Palette de couleurs

### Couleurs principales

| Rôle | Hex | Usage |
|---|---|---|
| `bg-deep` | `#05080F` | Background ultra sombre |
| `bg` | `#0A0E1A` | Background principal |
| `bg-card` | `#0F1729` | Cards, modales |
| `bg-card-hover` | `#162038` | Hover sur cards |
| `border` | `#1E2A47` | Bordures par défaut |
| `border-hover` | `#2D3E66` | Bordures hover |

### Couleurs d'accent

| Rôle | Hex | Usage |
|---|---|---|
| `neon` ⭐ | `#00FF87` | Couleur signature (boutons, highlights, victoires) |
| `neon-dark` | `#00CC6A` | Variante sombre du neon (hover) |
| `gold` 🏆 | `#FFD700` | Podium #1, trophys, FUT cards |
| `silver` | `#C0C0C0` | Podium #2 |
| `bronze` | `#CD7F32` | Podium #3 |
| `accent-pink` | `#FF0080` | Notifications, badge urgent |
| `accent-purple` | `#9D4EDD` | L9a7ba titre, événements spéciaux |

### Couleurs sémantiques

| Rôle | Hex | Usage |
|---|---|---|
| `win` | `#00FF87` | Victoires, validations |
| `loss` | `#FF3D5A` | Défaites, refus |
| `draw` | `#94A3B8` | Nuls |
| `warning` | `#FFB800` | En attente, disputed |

### Couleurs des titres

| Titre | Couleur | Effet |
|---|---|---|
| LKEBDA 🥩 | `#FFB800` (jaune) | Halo doux |
| ZAWJA 👰 | `#FF6BAA` (rose) | Halo médium |
| L9A7BA 💃 | `#FF3D5A` (rouge vif) | Halo intense + pulse |

---

## 🔤 Typographie

### Stack typographique

- **Display** : `"Bebas Neue"` (titres, scores, noms en gros) — condensé, sport
- **Body** : `"Inter"` (texte courant, descriptions, navigation) — lisible
- **Numeric** : `"JetBrains Mono"` ou tabular `Inter` (stats, classement)

### Échelle typographique

| Token | Taille | Poids | Usage |
|---|---|---|---|
| `display-1` | 72px / 5rem | 900 | Hero, scores énormes |
| `display-2` | 56px / 3.5rem | 900 | Titres de page |
| `display-3` | 40px / 2.5rem | 800 | Sous-titres |
| `h1` | 32px | 700 | Sections |
| `h2` | 24px | 700 | Cards titre |
| `h3` | 20px | 600 | Sub-cards |
| `body` | 16px | 400 | Texte courant |
| `caption` | 14px | 500 | Labels |
| `micro` | 11px | 700 | Tags uppercase, badges |
| `mono` | 14px | 600 | Stats numériques |

### Spacing letters
- **Display** : `tracking-tight` (-0.02em)
- **Micro/labels** : `tracking-widest` (0.15em), uppercase

---

## 📏 Espacements

Utilise une grille de **4px** :
- `xs` 4px • `sm` 8px • `md` 16px • `lg` 24px • `xl` 32px • `2xl` 48px • `3xl` 64px

---

## 🧱 Composants clés

### Cards
- Background : `bg-card`
- Border : 1px `border` (2px sur cards spéciales)
- Radius : `12px` (cards) / `16px` (gros containers) / `24px` (carte FUT match)
- Backdrop-filter : `blur(12px)` (effet glass)
- Padding : 16-20px (mobile) / 20-24px (desktop)

### Boutons primaires (CTA)
- Background : gradient `from-neon to-neon-dark`
- Text : `bg-deep` (couleur sombre sur bouton clair)
- Padding : 12px 24px
- Radius : `8px`
- Shadow : `0 0 20px rgba(0,255,135,0.4)`
- Hover : `translate-y(-1px)` + shadow 30px
- Min-height : 44px (touch target iOS)

### Boutons secondaires
- Background : transparent
- Border : 1px `border`
- Hover : border `neon`, text `neon`

### Inputs
- Background : `bg-deep`
- Border : 1px `border`, focus 2px `neon`
- Radius : `8px`
- Padding : 12px 16px
- Font-size : 16px (anti-zoom iOS)

### Carte FUT (joueur)
- Format : ratio 3:4 (style carte UT)
- Bordure : `gold` 3px
- Background : gradient subtil + photo
- Coins : `12px` radius
- Shadow : intense gold glow

### Carte match (broadcast)
- Format : 1080×1080 (Insta) ou 16:9 (TV)
- 2 joueurs face à face
- Score CENTER massive
- Top : badge "FC TRACKER MATCH"
- Bottom : date + watermark

---

## ✨ Animations

### Tokens
- `instant` : 0ms
- `fast` : 150ms
- `base` : 250ms
- `slow` : 400ms
- `slower` : 600ms

### Easings
- Tout en `cubic-bezier(0.4, 0.0, 0.2, 1)` (smooth ease)
- Bounce pour confirmations : `cubic-bezier(0.34, 1.56, 0.64, 1)`

### Micro-interactions à intégrer
1. **Score qui monte** : à la confirmation d'un match, le score s'incrémente de 0→X (count-up animation)
2. **Card flip** : la carte FUT joueur se retourne quand on tap dessus (face → stats détaillées)
3. **Lkebda transition** : quand quelqu'un devient lkebda, son avatar fait un effet "shake + replace" avec le 🥩
4. **Leaderboard entrance** : les rows arrivent en cascade (stagger 50ms entre chaque)
5. **Bouton press** : `scale(0.97)` au tap
6. **Notif badge** : pulse continu si > 0
7. **Confettis** : à chaque match validé qui te fait gagner

---

## 📱 Layout patterns

### Mobile (priorité)
- **Bottom nav** fixe avec 5 onglets icônes (Classmt, Histo, +Match, Duels, Notifs)
- **Floating Action Button** "+ Match" en bas à droite (alternative)
- **Pull-to-refresh** sur listes
- **Swipe gestures** : sur un match, swipe gauche pour partager, droite pour supprimer

### Desktop (secondaire)
- Sidebar gauche fixe avec nav verticale
- Contenu principal centré max 1200px
- Footer fin avec version + lien GitHub

---

## 🎯 Pages à designer (dans cet ordre)

1. **Landing / Hero** — page d'accueil non-connecté (vendre l'app)
2. **Leaderboard mobile + desktop** — classement live avec animations
3. **Ajout de match** — étape par étape, satisfaisant
4. **Profil joueur** (`/player/[username]`) — carte FUT + stats + matchs
5. **Page Duels** — head-to-head + Hall of Shame des titres
6. **Notifications** — onglets clean
7. **Settings** — édition profil avec preview de la carte FUT
8. **Carte de partage match** — image générée 1080×1080

---

## 🎁 Easter eggs & touches FUT

- À 10 victoires consécutives → animation "🔥 ON FIRE" qui apparaît
- Quand tu changes ton emoji en Settings → ta carte FUT se retourne en preview
- Le Hall of Shame a un effet "vieux parchemin" / médaille déchirée
- Les boutons "Valider/Refuser" font un effet "stamp" comme un cachet de courrier
