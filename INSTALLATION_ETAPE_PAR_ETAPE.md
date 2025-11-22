# 🚀 INSTALLATION ÉTAPE PAR ÉTAPE - VOIR LA NOUVELLE INTERFACE

## 📍 VOUS ÊTES ICI (capture d'écran)
Vous voyez actuellement votre **ancienne interface**:
- Header "N RICHESSES STREAMING"
- Logos services simples
- Design basique

## 🎯 OBJECTIF
Voir la **NOUVELLE interface moderne** que j'ai créée:
- Hero section avec gradient
- Cartes design premium
- Filtres avancés
- Dashboard admin/partenaire

---

## ⚡ INSTALLATION EN 5 MINUTES

### ✅ **ÉTAPE 1/5: Ouvrir le terminal PowerShell**

1. Appuyez sur `Windows + X`
2. Cliquez sur "Terminal" ou "PowerShell"
3. Tapez:

```powershell
cd "c:\PROJETS_ANGE\COURS REACT\Projet-Joris"
```

---

### ✅ **ÉTAPE 2/5: Installer shadcn/ui**

Copiez-collez cette commande:

```bash
npx shadcn@latest init
```

**Répondez aux questions comme ceci:**

```
? Which style would you like to use? 
  → New York

? Which color would you like to use as base color? 
  → Slate

? Would you like to use CSS variables for colors? 
  → Yes

? Where is your global CSS file? 
  → src/index.css

? Would you like to use CSS variables for colors? 
  → Yes

? Where is your tailwind.config.js located? 
  → tailwind.config.js

? Configure the import alias for components: 
  → @/components

? Configure the import alias for utils: 
  → @/lib/utils

? Are you using React Server Components? 
  → No

? Write configuration to components.json. Proceed? 
  → Yes
```

⏰ **Temps**: ~30 secondes

---

### ✅ **ÉTAPE 3/5: Installer les composants UI**

Copiez-collez cette commande:

```bash
npx shadcn@latest add button card input select badge dialog table
```

Appuyez sur **Entrée** pour tout installer.

⏰ **Temps**: ~45 secondes

---

### ✅ **ÉTAPE 4/5: Installer les dépendances**

```bash
npm install zustand axios lucide-react clsx tailwind-merge recharts
```

⏰ **Temps**: ~1 minute

---

### ✅ **ÉTAPE 5/5: Renommer les fichiers et activer la nouvelle interface**

**Option A: Automatique** (Recommandé)

Double-cliquez sur ce fichier:
```
c:\PROJETS_ANGE\COURS REACT\Projet-Joris\RENOMMER_FICHIERS.bat
```

**Option B: Manuel**

Renommez ces fichiers:
- `src/pages/client/HomePage.tsx` → `HomePage.jsx`
- `src/pages/client/CataloguePage.tsx` → `CataloguePage.jsx`
- `src/components/client/Navbar.tsx` → `Navbar.jsx`
- `src/components/client/OffreCard.tsx` → `OffreCard.jsx`
- `src/components/shared/LoadingSpinner.tsx` → `LoadingSpinner.jsx`
- `src/components/shared/EmptyState.tsx` → `EmptyState.jsx`

---

### ✅ **ÉTAPE BONUS: Remplacer App.jsx**

**Sauvegardez votre ancien fichier:**
```bash
ren src\App.jsx src\App_ANCIENNE_VERSION.jsx
```

**Copiez le nouveau:**
```bash
ren src\App_NOUVELLE_VERSION.jsx src\App.jsx
```

---

## 🚀 DÉMARRER L'APPLICATION

```bash
npm run dev
```

**Ouvrez dans le navigateur:**
```
http://localhost:5173
```

---

## 🎉 RÉSULTAT ATTENDU

Vous devriez maintenant voir:

### **Page d'accueil (localhost:5173/)**
```
╔════════════════════════════════════════╗
║  🎬 Joris Streaming     [🔍] [Login]  ║
╠════════════════════════════════════════╣
║                                        ║
║  ✨ +500 offres de streaming          ║
║                                        ║
║  VOS ABONNEMENTS STREAMING             ║
║  AU MEILLEUR PRIX 💜                   ║
║                                        ║
║  [🔍 Rechercher Netflix, Spotify...] ║
║                                        ║
║  500+ Offres | 50+ Partenaires        ║
║                                        ║
╠════════════════════════════════════════╣
║  🎬 Films  🎵 Musique  🎮 Gaming      ║
╠════════════════════════════════════════╣
║  🔥 OFFRES POPULAIRES                  ║
║                                        ║
║  [Carte Netflix] [Carte Spotify]      ║
║                                        ║
╚════════════════════════════════════════╝
```

### **Pages disponibles:**
- ✅ `/` → Nouvelle page d'accueil moderne
- ✅ `/catalogue` → Catalogue avec filtres
- ✅ `/partenaire` → Dashboard partenaire
- ✅ `/admin` → Dashboard admin

---

## 🐛 SI VOUS AVEZ DES ERREURS

### Erreur: "Cannot find module '@/components/ui/button'"
```bash
npx shadcn@latest add button
```

### Erreur: "Module not found: Error: Can't resolve '@/lib/utils'"
Vérifiez que `src/lib/utils.ts` ou `src/lib/utils.js` existe.

### Page blanche
1. Ouvrez la console (F12)
2. Regardez les erreurs
3. Vérifiez que shadcn/ui est bien installé

### Toujours l'ancienne page
Vérifiez que vous avez bien remplacé `App.jsx`

---

## 🔄 RETOUR À L'ANCIENNE VERSION

Si vous voulez revenir en arrière:

```bash
# Restaurer l'ancien App.jsx
ren src\App.jsx src\App_NOUVELLE_VERSION.jsx
ren src\App_ANCIENNE_VERSION.jsx src\App.jsx

# Redémarrer
npm run dev
```

---

## 📞 AIDE

**Vous bloquez à quelle étape ?**
1. Installation shadcn/ui ?
2. Renommage des fichiers ?
3. Application ne démarre pas ?
4. Autre ?

**Dites-moi et je vous aide ! 🚀**

---

## ✅ CHECKLIST DE VÉRIFICATION

Avant de démarrer, assurez-vous:
- [ ] Node.js >= 18 installé
- [ ] npm fonctionne
- [ ] Terminal ouvert dans le bon dossier
- [ ] Application actuelle stoppée (Ctrl+C)

Après installation, vous devriez avoir:
- [ ] Dossier `src/components/ui/` créé (par shadcn)
- [ ] Fichiers renommés en .jsx
- [ ] `npm run dev` démarre sans erreur
- [ ] Nouvelle interface visible sur localhost:5173

---

**Temps total estimé**: ⏰ **5 minutes**

**Date**: 19 Novembre 2025
