# Architecture Projet-Joris (Frontend)

## Structure des dossiers

```
src/
├── components/       # Composants réutilisables
│   ├── NavBarClient.jsx, NavBarModerne.jsx  # Navigation
│   ├── Footer.jsx
│   ├── forfaitCard.jsx, AbonnementCard.jsx
│   └── ...
├── layout/           # Layouts par zone (client, admin, partenaire)
│   ├── LayoutClient.jsx
│   ├── LayoutAdmin.jsx
│   └── LayoutPartenaire.jsx
├── pages/            # Pages par fonctionnalité
│   ├── [client]      # Catalogue, DetailOffre, PaiementNouveau, etc.
│   ├── admin/        # Dashboard, Offres, Clients, Partenaires
│   └── partenaire/   # Dashboard, Commandes, Offres, Clients, Stats
├── services/         # Appels API (axios, Stripe, CinetPay, BillMap)
├── lib/              # API structurée (abonnementsAPI, statsAPI, etc.)
├── store/            # État global (abonnement, souscription, user, modalite)
├── Utils/            # Utilitaires et constantes
├── router/           # Configuration des routes
└── assets/           # Images, icônes, polices
```

## Flux de données

- **Catalogue / Offres** : `lib/api.ts` → `abonnementsAPI` → Backend `/abonnements`
- **Paiements** : `services/BillMapService` → Backend API BillMap (MTN, Moov, Orange, Wave)
- **Auth** : `lib/api.ts` → `authAPI` → Backend `/auth`
- **Stats** : `lib/api.ts` → `statsAPI` → Backend `/stats`

## Thème

Palette professionnelle : **slate** (gris-bleu). Pas de couleurs fluorescentes.
