# 🚀 GUIDE D'INSTALLATION COMPLET - FRONTEND

## ✅ CE QUI A ÉTÉ CRÉÉ

### Fichiers créés (15+ fichiers):
```
src/
├── lib/
│   ├── utils.ts              ✅ Utilitaires + formatage
│   ├── api.ts                ✅ Configuration API axios
│   └── authStore.ts          ✅ Store authentification Zustand
├── components/
│   ├── shared/
│   │   ├── LoadingSpinner.tsx     ✅ Composant loading
│   │   └── EmptyState.tsx         ✅ État vide
│   └── client/
│       ├── OffreCard.tsx          ✅ Carte offre design moderne
│       └── Navbar.tsx             ✅ Navigation responsive
├── pages/
│   ├── client/
│   │   ├── HomePage.tsx           ✅ Page accueil super design
│   │   └── CataloguePage.tsx      ✅ Catalogue avec filtres
│   ├── partenaire/
│   │   └── DashboardPartenaire.tsx ✅ Dashboard partenaire
│   └── admin/
│       └── DashboardAdmin.tsx      ✅ Dashboard admin
```

---

## 📦 ÉTAPE 1: INSTALLER LES DÉPENDANCES

```bash
cd "c:\PROJETS_ANGE\COURS REACT\Projet-Joris"

# 1. Installer shadcn/ui (IMPORTANT!)
npx shadcn@latest init

# Répondez aux questions:
# - Style: New York
# - Color: Slate  
# - CSS variables: Yes
# - Tailwind config: tailwind.config.js
# - CSS globals: src/index.css
# - Components location: src/components/ui
# - Utils location: src/lib/utils.ts (déjà créé, écraser: Yes)
```

### 2. Installer tous les composants shadcn/ui nécessaires

```bash
# Installer d'un coup (recommandé)
npx shadcn@latest add button card input select dialog badge table tabs avatar alert dropdown-menu form sheet calendar tooltip separator label checkbox radio-group switch

# OU un par un:
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add input
npx shadcn@latest add select
npx shadcn@latest add badge
npx shadcn@latest add dialog
npx shadcn@latest add table
# ... etc
```

### 3. Installer les dépendances NPM

```bash
# Dépendances obligatoires
npm install zod zustand axios lucide-react clsx tailwind-merge

# Pour les graphiques (recharts)
npm install recharts

# Pour les tableaux avancés
npm install @tanstack/react-table

# Pour zustand persist
npm install zustand

# React Router (déjà installé normalement)
npm install react-router-dom

# Types TypeScript
npm install --save-dev @types/node
```

---

## ⚙️ ÉTAPE 2: CONFIGURATION

### 1. Mettre à jour `vite.config.js`

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
```

### 2. Créer/Mettre à jour `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",

    /* Linting */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,

    /* Path aliases */
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

### 3. Créer `.env` pour les variables d'environnement

```env
VITE_API_URL=http://localhost:3000
```

### 4. Mettre à jour `src/index.css`

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 222.2 47.4% 11.2%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 222.2 84% 4.9%;
    --radius: 0.5rem;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;
    --primary: 210 40% 98%;
    --primary-foreground: 222.2 47.4% 11.2%;
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 212.7 26.8% 83.9%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}
```

---

## 🔄 ÉTAPE 3: CRÉER LE ROUTING

Créer `src/App.tsx`:

```tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'

// Layouts
import { ClientLayout } from '@/layouts/ClientLayout'
import { PartenaireLayout } from '@/layouts/PartenaireLayout'
import { AdminLayout } from '@/layouts/AdminLayout'

// Pages Client
import { HomePage } from '@/pages/client/HomePage'
import { CataloguePage } from '@/pages/client/CataloguePage'

// Pages Partenaire
import { DashboardPartenaire } from '@/pages/partenaire/DashboardPartenaire'

// Pages Admin
import { DashboardAdmin } from '@/pages/admin/DashboardAdmin'

// Auth
import { LoginPage } from '@/pages/auth/LoginPage'

function App() {
  const { isAuthenticated, userType } = useAuthStore()

  return (
    <BrowserRouter>
      <Routes>
        {/* Routes publiques CLIENT */}
        <Route path="/" element={<ClientLayout />}>
          <Route index element={<HomePage />} />
          <Route path="catalogue" element={<CataloguePage />} />
        </Route>

        {/* Routes PARTENAIRE */}
        <Route path="/partenaire" element={<PartenaireLayout />}>
          <Route index element={<DashboardPartenaire />} />
        </Route>

        {/* Routes ADMIN */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<DashboardAdmin />} />
        </Route>

        {/* Auth */}
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
```

---

## 📂 ÉTAPE 4: CRÉER LES LAYOUTS

### `src/layouts/ClientLayout.tsx`

```tsx
import { Outlet } from 'react-router-dom'
import { Navbar } from '@/components/client/Navbar'

export function ClientLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t py-6 bg-muted/50">
        <div className="container text-center text-sm text-muted-foreground">
          © 2025 Joris Streaming. Tous droits réservés.
        </div>
      </footer>
    </div>
  )
}
```

### `src/layouts/PartenaireLayout.tsx`

```tsx
import { Outlet } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { SidebarPartenaire } from '@/components/partenaire/SidebarPartenaire'

export function PartenaireLayout() {
  const { user } = useAuthStore()

  return (
    <div className="flex min-h-screen">
      <SidebarPartenaire />
      <main className="flex-1 p-8">
        <Outlet />
      </main>
    </div>
  )
}
```

### `src/layouts/AdminLayout.tsx`

```tsx
import { Outlet } from 'react-router-dom'
import { SidebarAdmin } from '@/components/admin/SidebarAdmin'

export function AdminLayout() {
  return (
    <div className="flex min-h-screen">
      <SidebarAdmin />
      <main className="flex-1 p-8">
        <Outlet />
      </main>
    </div>
  )
}
```

---

## 🎨 ÉTAPE 5: PERSONNALISATION DES COULEURS (Optionnel)

Dans `tailwind.config.js`, vous pouvez personnaliser les couleurs:

```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "hsl(262.1 83.3% 57.8%)", // Violet
          foreground: "hsl(210 40% 98%)",
        },
        // Ou avec des couleurs personnalisées:
        brand: {
          50: '#f5f3ff',
          500: '#8b5cf6',
          900: '#4c1d95',
        },
      },
    },
  },
}
```

---

## ✅ ÉTAPE 6: VÉRIFICATION

### 1. Vérifier que tout compile

```bash
npm run dev
```

### 2. Ouvrir http://localhost:5173

Vous devriez voir la page d'accueil avec:
- ✅ Hero section moderne avec gradient
- ✅ Barre de recherche
- ✅ Catégories cliquables
- ✅ Cartes d'offres design
- ✅ Sections "Pourquoi nous choisir"

### 3. Tester la navigation

- `/` → Page d'accueil
- `/catalogue` → Catalogue avec filtres
- `/partenaire` → Dashboard partenaire (protégé)
- `/admin` → Dashboard admin (protégé)

---

## 🐛 RÉSOLUTION DES ERREURS COURANTES

### Erreur: "Cannot find module '@/components/ui/button'"

**Solution**: Installer les composants shadcn/ui
```bash
npx shadcn@latest add button card input badge
```

### Erreur: "Property 'env' does not exist on type 'ImportMeta'"

**Solution**: Créer `src/vite-env.d.ts`:
```typescript
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
```

### Erreur: "Module path alias '@/*' not working"

**Solution**: 
1. Vérifier `vite.config.js` (alias configuré)
2. Vérifier `tsconfig.json` (paths configuré)
3. Redémarrer VS Code

### Erreur TypeScript "implicitly has 'any' type"

**Solution**: Ajouter les types explicites ou désactiver temporairement:
```json
// tsconfig.json
{
  "compilerOptions": {
    "noImplicitAny": false
  }
}
```

---

## 📋 CHECKLIST FINALE

- [ ] shadcn/ui installé et init fait
- [ ] Tous les composants UI ajoutés
- [ ] Dépendances NPM installées
- [ ] vite.config.js configuré avec alias @
- [ ] tsconfig.json configuré
- [ ] .env créé avec VITE_API_URL
- [ ] src/index.css mis à jour
- [ ] App.tsx avec routing créé
- [ ] Layouts créés
- [ ] `npm run dev` fonctionne
- [ ] Page d'accueil s'affiche correctement

---

## 🎯 PROCHAINES ÉTAPES

1. **Créer les pages manquantes**:
   - Page détail offre
   - Page paiement CinetPay
   - Page login/register
   - Pages CRUD partenaire (créer offre, liste clients)
   - Pages admin (liste partenaires, stats globales)

2. **Implémenter l'authentification**:
   - Formulaires login
   - Protection des routes
   - Gestion tokens JWT

3. **Intégrer l'API backend**:
   - Connecter les endpoints
   - Gérer les erreurs
   - Loading states

4. **Optimiser**:
   - Lazy loading des pages
   - Optimisation images
   - Performance

---

## 🆘 BESOIN D'AIDE ?

Si vous rencontrez des erreurs:
1. Vérifier que Node.js >= 18
2. Supprimer `node_modules` et `package-lock.json` puis `npm install`
3. Vérifier que l'API backend tourne sur port 3000
4. Consulter la console navigateur pour les erreurs

**Date**: 19 Novembre 2025  
**Version**: 1.0.0
**Statut**: Prêt pour installation ! 🚀
