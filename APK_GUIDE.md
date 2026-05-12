# 📱 Guide : Transformer FC Tracker en APK Android

Étapes pour avoir un vrai fichier `.apk` à installer sur Android (ou à mettre sur Google Play).

---

## 🎯 Plan

1. Générer les icônes PNG (5 min)
2. Push le code mis à jour sur GitHub (1 min)
3. Attendre que Vercel déploie (2 min)
4. Aller sur PWABuilder.com et générer l'APK (5 min)
5. Installer l'APK sur Android (2 min)

**Temps total : 15-20 minutes** pour avoir une vraie app Android installable.

---

## ÉTAPE 1 — Générer les icônes PNG

J'ai créé une page qui génère les icônes automatiquement.

1. Lance le dev server :
   ```bash
   npm run dev
   ```

2. Ouvre dans ton navigateur :
   **http://localhost:3000/generate-icons.html**

3. Clique sur les 2 boutons :
   - ⬇️ Télécharger `icon-192.png`
   - ⬇️ Télécharger `icon-512.png`

4. Les 2 fichiers se téléchargent dans `Téléchargements/`. Déplace-les dans :
   `C:\Users\fodil\Desktop\TAF\fc-tracker\public\`

5. Vérifie que tu as bien :
   - `public/icon-192.png` ✅
   - `public/icon-512.png` ✅

---

## ÉTAPE 2 — Push sur GitHub

```bash
cd C:\Users\fodil\Desktop\TAF\fc-tracker
git add .
git commit -m "Feat: PWA manifest + Service Worker + icons for APK"
git push
```

Vercel va automatiquement rebuilder. Attends 1-2 min.

---

## ÉTAPE 3 — Vérifier que la PWA est valide

Va sur **https://fc-tracker-seven.vercel.app** (ton URL Vercel) avec Chrome **sur ton téléphone**.

Tu devrais voir :
- ✅ Un bandeau "Ajouter à l'écran d'accueil" en bas (sur Android Chrome)
- ✅ Ou l'option dans le menu ⋮ → "Installer l'application"

**Teste l'installation** : ça devrait créer une icône sur ton écran d'accueil. C'est ta PWA, déjà utilisable !

---

## ÉTAPE 4 — Générer l'APK avec PWABuilder

PWABuilder est l'outil officiel de Microsoft pour transformer une PWA en APK Android.

### 1. Va sur **https://www.pwabuilder.com**

### 2. Entre l'URL de ton site
Dans le champ "Enter your URL", colle :
```
https://fc-tracker-seven.vercel.app
```
(remplace par ton vraie URL Vercel)

Clique **"Start"**.

### 3. PWABuilder analyse ton site

Il va te donner un **score** sur 3 catégories :
- 📱 **Manifest** : devrait être 100% ✅
- ⚙️ **Service Worker** : devrait être 100% ✅
- 🔒 **Security** : devrait être 100% ✅ (HTTPS Vercel)

Si tu vois des warnings, corrige-les avec les boutons "Fix" intégrés.

### 4. Clique sur "Package For Stores"

En haut à droite, tu verras un bouton **"Package for stores"** ou **"Generate Package"**.

### 5. Choisis Android

Tu vas voir plusieurs options :
- 🤖 **Android** → c'est ce qu'on veut
- 🍎 iOS
- 🖥️ Windows
- 🐧 Linux

Clique **"Generate"** sous Android.

### 6. Remplis le formulaire

PWABuilder te demande quelques infos :

| Champ | Valeur |
|---|---|
| **Package ID** | `app.fctracker.web` (unique, format domaine inversé) |
| **App name** | `FC Tracker` |
| **Launcher name** | `FCTracker` |
| **App version** | `1.0.0` |
| **Display mode** | `standalone` (déjà coché) |
| **Status bar color** | `#0a0e1a` |
| **Splash screen color** | `#0a0e1a` |
| **Min SDK version** | `21` (Android 5.0+) |
| **Signing key** | Choisis **"PWABuilder will generate one for me"** ⭐ |

⚠️ **Important** : à la fin, **télécharge le keystore** (`.keystore` + mot de passe) — c'est ce qui te permettra de mettre à jour ton app plus tard. **GARDE-LE PRÉCIEUSEMENT.**

### 7. Clique "Download"

Tu obtiens un fichier ZIP contenant :
- 📦 `app-release-signed.apk` ← **C'est ton APK !**
- 📦 `app-release-bundle.aab` ← (pour Google Play)
- 🔑 `signing.keystore` ← **À SAUVEGARDER**
- 📄 README + assetlinks.json

---

## ÉTAPE 5 — Installer l'APK sur ton téléphone Android

### Option A — Direct depuis ton PC
1. Branche ton tél en USB
2. Copie `app-release-signed.apk` sur ton téléphone
3. Ouvre le fichier sur le téléphone
4. Android te dit "Source inconnue, autoriser ?" → **OK**
5. Clique **Installer**
6. 🎉 **FC Tracker est sur ton téléphone !**

### Option B — Via WhatsApp / Email
1. Envoie-toi le `.apk` par WhatsApp ou email
2. Télécharge sur le téléphone
3. Ouvre → Installer

### Option C — Pour tes potes
1. Mets le `.apk` sur un Drive / Dropbox
2. Partage le lien
3. Ils téléchargent et installent comme ci-dessus

---

## 🏪 BONUS : Mettre sur Google Play Store

Si tu veux que tes potes l'installent depuis le Play Store officiel :

1. Crée un compte développeur Google Play : **https://play.google.com/console**
   - **Coût : 25$ une fois** (pas par an, à vie)
2. Sur PWABuilder, télécharge le `.aab` (App Bundle) au lieu du `.apk`
3. Sur Google Play Console → Créer une nouvelle app → Upload du `.aab`
4. Remplis fiche : description, screenshots, classification
5. Soumets pour review (24-48h)
6. ✅ Ton app est dans le Play Store

---

## 🔄 Mises à jour de l'app

**Le truc cool** : tu n'as PAS besoin de rebuild l'APK à chaque modif !

L'APK généré par PWABuilder est un **TWA (Trusted Web Activity)** = il affiche ton site Vercel en plein écran. Donc :

```
Tu push du code → Vercel rebuild → Les utilisateurs ont l'app à jour automatiquement 🎉
```

Tu ne dois reconstruire l'APK QUE si tu changes :
- 📛 Le nom de l'app
- 🎨 L'icône
- 🎨 Les couleurs du splash screen
- 🔢 La version (1.0.0 → 1.1.0)

Sinon, **0 maintenance** sur l'APK.

---

## 🐛 Problèmes fréquents

### "Mon APK ne s'installe pas"
→ Active "Sources inconnues" dans les paramètres Android (Sécurité → Sources inconnues)

### "L'app s'ouvre dans le navigateur au lieu de plein écran"
→ Le fichier `assetlinks.json` doit être déployé sur ton site.
PWABuilder te donne ce fichier dans le ZIP → mets-le dans `public/.well-known/assetlinks.json` et push.

### "Score PWA pas à 100%"
→ Vérifie que :
- ✅ Le manifest a bien les 2 icônes (192 + 512)
- ✅ Le Service Worker est bien servi (test : ouvre `/sw.js` dans le navigateur)
- ✅ Le site est en HTTPS (Vercel le fait auto)

### "Je veux changer l'icône après coup"
→ Génère de nouvelles icônes, push, et regénère l'APK sur PWABuilder. La nouvelle version remplacera l'ancienne sur les téléphones.

---

## 📚 Ressources

- **PWABuilder** : https://www.pwabuilder.com
- **PWA Stats** : https://web.dev/measure/ (audit complet)
- **Google Play Console** : https://play.google.com/console
- **Assetlinks tester** : https://developers.google.com/digital-asset-links/tools/generator

---

✅ Voilà, t'as tout ce qu'il faut. Une vraie app Android FC Tracker en 20 min ! 🚀
