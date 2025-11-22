# 🎨 Installation et Configuration shadcn/ui

## Étape 1: Installation des dépendances

```bash
cd "c:\PROJETS_ANGE\COURS REACT\Projet-Joris"

# Installer shadcn/ui CLI
npx shadcn@latest init
```

### Répondre aux questions:

```
✔ Which style would you like to use? › New York
✔ Which color would you like to use as base color? › Slate
✔ Would you like to use CSS variables for colors? › yes
```

## Étape 2: Configuration Tailwind

Le fichier `tailwind.config.js` sera automatiquement mis à jour.

Vérifier qu'il contient:

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
```

## Étape 3: Installer les composants de base

```bash
# Button
npx shadcn@latest add button

# Card
npx shadcn@latest add card

# Input
npx shadcn@latest add input

# Select
npx shadcn@latest add select

# Dialog
npx shadcn@latest add dialog

# Badge
npx shadcn@latest add badge

# Table
npx shadcn@latest add table

# Tabs
npx shadcn@latest add tabs

# Avatar
npx shadcn@latest add avatar

# Alert
npx shadcn@latest add alert

# Dropdown Menu
npx shadcn@latest add dropdown-menu

# Form (avec react-hook-form + zod)
npx shadcn@latest add form

# Sheet (sidebar mobile)
npx shadcn@latest add sheet

# Calendar
npx shadcn@latest add calendar

# Tooltip
npx shadcn@latest add tooltip

# Separator
npx shadcn@latest add separator

# Label
npx shadcn@latest add label

# Checkbox
npx shadcn@latest add checkbox

# Radio Group
npx shadcn@latest add radio-group

# Switch
npx shadcn@latest add switch
```

## Étape 4: Installer les dépendances supplémentaires

```bash
# Zod pour validation
npm install zod

# React Hook Form (déjà installé)
# npm install react-hook-form

# Date-fns (déjà installé)
# npm install date-fns

# Recharts pour les graphiques avancés
npm install recharts

# React Table pour tableaux avancés
npm install @tanstack/react-table

# Sonner pour les notifications (alternative à react-hot-toast)
npm install sonner

# clsx et tailwind-merge pour classes conditionnelles
npm install clsx tailwind-merge

# Lucide React (déjà installé)
# npm install lucide-react
```

## Étape 5: Créer la structure de dossiers

```
src/
├── components/
│   ├── ui/              # Composants shadcn/ui générés
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   └── ...
│   ├── client/          # Composants spécifiques client
│   │   ├── offre-card.tsx
│   │   ├── catalogue-grid.tsx
│   │   └── payment-form.tsx
│   ├── partenaire/      # Composants partenaire
│   │   ├── dashboard-stats.tsx
│   │   ├── offre-form.tsx
│   │   └── clients-table.tsx
│   └── admin/           # Composants super admin
│       ├── global-stats.tsx
│       └── partenaire-validation.tsx
├── lib/
│   ├── utils.ts         # Utilitaires (cn, etc.)
│   └── api.ts           # Configuration Axios
├── hooks/               # Custom hooks
│   ├── use-offres.ts
│   ├── use-auth.ts
│   └── use-toast.ts
└── app/ ou pages/       # Routes
```

## Étape 6: Fichier utils.ts

Créer `src/lib/utils.ts`:

```typescript
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XOF',
    minimumFractionDigits: 0,
  }).format(price)
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date(date))
}
```

## Étape 7: Configuration des variables CSS

Le fichier `src/index.css` doit contenir:

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

## Étape 8: Test

Créer un fichier de test `src/pages/TestShadcn.jsx`:

```jsx
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function TestShadcn() {
  return (
    <div className="p-8 space-y-4">
      <h1 className="text-3xl font-bold">Test shadcn/ui</h1>
      
      <div className="space-x-2">
        <Button>Default</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="destructive">Destructive</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="ghost">Ghost</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Test Card</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Ceci est un test de carte shadcn/ui</p>
        </CardContent>
      </Card>
    </div>
  )
}
```

## Étape 9: Mise à jour vite.config.js

Ajouter l'alias `@`:

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

## Étape 10: Mise à jour tsconfig.json

Si vous utilisez TypeScript, ajouter:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

## Commandes utiles

```bash
# Voir tous les composants disponibles
npx shadcn@latest add

# Ajouter un composant spécifique
npx shadcn@latest add [component-name]

# Mettre à jour shadcn/ui
npm update
```

## Prêt ! 🎉

Vous pouvez maintenant utiliser shadcn/ui dans votre application React !
