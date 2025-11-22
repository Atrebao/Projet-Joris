# 🚀 TESTEZ LES NOUVELLES PAGES - GUIDE SIMPLE

## ⚡ ÉTAPE 1: REDÉMARRER LE SERVEUR (IMPORTANT!)

### **Dans votre terminal:**

1. **Arrêtez le serveur** (si il tourne):
   ```
   Ctrl + C
   ```

2. **Redémarrez:**
   ```bash
   npm run dev
   ```

3. **Attendez ce message:**
   ```
   ➜  Local:   http://localhost:5173/
   ```

---

## ✅ ÉTAPE 2: TESTER LA PAGE CATALOGUE

### **Ouvrez dans votre navigateur:**

```
http://localhost:5173/#/catalogue
```

### **Ce que vous DEVEZ voir:**

```
╔═══════════════════════════════════════════════════════╗
║  Catalogue des offres                                 ║
║  6 offres disponibles                                 ║
╠═══════════════════════════════════════════════════════╣
║  [🔍 Rechercher une offre...]                         ║
╠═══════════════════════════════════════════════════════╣
║  🔧 FILTRES                    [Réinitialiser]        ║
╠═══════════════════════════════════════════════════════╣
║  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐║
║  │              │  │              │  │              │║
║  │   NETFLIX    │  │   SPOTIFY    │  │   DISNEY+    │║
║  │   (en gros)  │  │   (en gros)  │  │   (en gros)  │║
║  │              │  │              │  │              │║
║  │ 7,000 F      │  │ 5,000 F      │  │ 6,500 F      │║
║  │ [Voir]       │  │ [Voir]       │  │ [Voir]       │║
║  └──────────────┘  └──────────────┘  └──────────────┘║
║                                                       ║
║  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐║
║  │ PLAYSTATION  │  │    PRIME     │  │    APPLE     │║
║  │     (PS)     │  │    (Prime)   │  │   (Apple)    │║
║  │ 8,000 F      │  │ 4,500 F      │  │ 4,000 F      │║
║  └──────────────┘  └──────────────┘  └──────────────┘║
╚═══════════════════════════════════════════════════════╝
```

### **Caractéristiques des cartes:**
- ✅ **NOM DU SERVICE EN GROS** au centre (Netflix, Spotify, Disney+, etc.)
- ✅ Badge catégorie en haut à gauche (🎬 Films, 🎵 Musique, etc.)
- ✅ Note ⭐ en haut à droite
- ✅ Prix en bas
- ✅ Bouton "Voir" en bas

---

## ✅ ÉTAPE 3: CLIQUER SUR UNE CARTE

### **Cliquez sur la carte "NETFLIX"**

Vous devez être redirigé vers:
```
http://localhost:5173/#/offre/1
```

### **Ce que vous DEVEZ voir:**

```
╔═══════════════════════════════════════════════════════╗
║  ← Retour au catalogue                                ║
╠═══════════════════════════════════════════════════════╣
║  ┌─────────────────────┬──────────────────────────┐   ║
║  │                     │                          │   ║
║  │   [IMAGE NETFLIX]   │   Netflix Premium        │   ║
║  │                     │                          │   ║
║  │   ⚠️ Plus que 15 !   │   ⭐ 4.8   ⏰ 1 mois     │   ║
║  │                     │                          │   ║
║  ├─────────────────────┤   7,000 F                │   ║
║  │                     │                          │   ║
║  │ À PROPOS PARTENAIRE │   📋 FORMULAIRE          │   ║
║  │ 👤 StreamPro        │   Quantité: [1 ▼]        │   ║
║  │ ⭐ 4.8              │                          │   ║
║  │ 📍 Abidjan          │   Email:                 │   ║
║  │ ✅ 245+ ventes      │   [____________]         │   ║
║  │                     │                          │   ║
║  ├─────────────────────┤   Téléphone:             │   ║
║  │ ✨ CARACTÉRISTIQUES │   [____________]         │   ║
║  │ ✅ 4 écrans         │                          │   ║
║  │ ✅ Ultra HD         │   Total: 7,000 F         │   ║
║  │ ✅ Téléchargement   │                          │   ║
║  │ ✅ Son surround     │   [Souscrire maintenant] │   ║
║  │ ✅ Tous appareils   │                          │   ║
║  │                     │   🛡️ Paiement sécurisé   │   ║
║  ├─────────────────────┤   ✅ Identifiants envoyés│   ║
║  │ ⚡ MODE D'EMPLOI    │   ⚡ Activation 5 min    │   ║
║  │ 1️⃣ Identifiants mail│                          │   ║
║  │ 2️⃣ Connectez-vous   │                          │   ║
║  │ 3️⃣ Profitez         │                          │   ║
║  │ 4️⃣ Support 24/7     │                          │   ║
║  └─────────────────────┴──────────────────────────┘   ║
╚═══════════════════════════════════════════════════════╝
```

---

## ✅ ÉTAPE 4: REMPLIR LE FORMULAIRE

1. **Sélectionnez quantité:** 1 (ou autre)
2. **Entrez email:** `test@email.com`
3. **Entrez téléphone:** `+225 01 02 03 04 05`
4. **Cliquez sur:** "Souscrire maintenant 🚀"

### **Résultat attendu:**
Redirection vers `/paiement` avec les données de l'offre.

---

## ✅ ÉTAPE 5: TESTER LES FILTRES

### **Retournez sur:**
```
http://localhost:5173/#/catalogue
```

### **Testez:**

1. **Filtre Catégorie:**
   - Sélectionnez "🎵 Musique"
   - → Vous devez voir SEULEMENT Spotify et Apple Music

2. **Recherche:**
   - Tapez "Netflix" dans la barre
   - → Vous devez voir SEULEMENT Netflix

3. **Bouton Réinitialiser:**
   - Cliquez dessus
   - → Toutes les offres réapparaissent

---

## ✅ ÉTAPE 6: TESTER DEPUIS LA PAGE D'ACCUEIL

### **Allez sur:**
```
http://localhost:5173/#/
```

### **Cliquez sur une catégorie** (exemple: 🎵 Musique)

**Résultat attendu:**
- Redirection vers `/catalogue?categorie=MUSIQUE`
- Affichage automatique des offres musique

---

## 🐛 SI VOUS NE VOYEZ PAS LES PAGES

### **Problème 1: Page 404 sur /catalogue**

**Solution:**
1. Vérifiez que le serveur est bien **redémarré** (`Ctrl+C` puis `npm run dev`)
2. Videz le cache: `Ctrl + Shift + R`
3. Vérifiez l'URL: `http://localhost:5173/#/catalogue` (avec le `#`)

### **Problème 2: Les cartes n'affichent pas les services**

**Solution:**
1. Ouvrez la console (F12)
2. Regardez s'il y a des erreurs
3. Vérifiez que vous êtes bien sur `/catalogue` et pas `/home-ancienne`

### **Problème 3: Le clic sur une carte ne fonctionne pas**

**Solution:**
1. Ouvrez la console (F12)
2. Cliquez sur une carte
3. Vérifiez si une erreur s'affiche
4. Essayez d'aller directement sur `http://localhost:5173/#/offre/1`

### **Problème 4: Page blanche**

**Solution:**
1. Ouvrez la console (F12)
2. Copiez l'erreur complète
3. Partagez-la avec moi

---

## 📸 CAPTURES D'ÉCRAN À VÉRIFIER

### **Sur /catalogue, vous devez voir:**
- ✅ Titre "Catalogue des offres"
- ✅ "6 offres disponibles"
- ✅ Barre de recherche
- ✅ 3 filtres (Catégorie, Durée, Prix)
- ✅ **6 cartes avec NOM DU SERVICE EN GROS** (Netflix, Spotify, Disney+, PlayStation, Prime, Apple)
- ✅ Prix sur chaque carte
- ✅ Bouton "Voir" sur chaque carte

### **Sur /offre/1, vous devez voir:**
- ✅ Bouton "← Retour au catalogue"
- ✅ Grande image Netflix
- ✅ Titre "Netflix Premium"
- ✅ Section "À propos du partenaire"
- ✅ Section "Caractéristiques" avec ✅
- ✅ Section "Mode d'emploi" avec numéros
- ✅ **FORMULAIRE avec Email et Téléphone**
- ✅ Bouton "Souscrire maintenant 🚀"

---

## ✅ CHECKLIST FINALE

Cochez ce que vous voyez:

**Page Catalogue:**
- [ ] URL fonctionne: `http://localhost:5173/#/catalogue`
- [ ] Titre "Catalogue des offres" visible
- [ ] 6 cartes d'offres visibles
- [ ] **Services affichés EN GROS** (Netflix, Spotify, etc.)
- [ ] Prix visibles sur chaque carte
- [ ] Filtres fonctionnent

**Page Détail:**
- [ ] URL fonctionne: `http://localhost:5173/#/offre/1`
- [ ] Détails de l'offre visibles
- [ ] **Formulaire visible** (Email + Téléphone)
- [ ] Bouton "Souscrire maintenant" visible
- [ ] Clic sur "Souscrire" redirige vers `/paiement`

---

## 🆘 AIDE RAPIDE

### **Le serveur tourne?**
```bash
# Vérifiez dans le terminal, vous devez voir:
➜  Local:   http://localhost:5173/
```

### **Les fichiers existent?**
```
src/pages/Catalogue.jsx ✅
src/pages/DetailOffre.jsx ✅
```

### **Les routes sont configurées?**
```javascript
// Dans src/router/AppRoute.jsx:
{ path: "catalogue", element: <Catalogue /> }
{ path: "offre/:id", element: <DetailOffre /> }
```

---

**Créé le:** 19 Novembre 2025  
**Temps de test:** 5 minutes

🚀 **IMPORTANT: Redémarrez le serveur AVANT de tester !**

```bash
Ctrl + C
npm run dev
```

Puis testez: `http://localhost:5173/#/catalogue`
