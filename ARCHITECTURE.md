# Architecture Technique — GY MAISON COUTURE ERP

```
                        ┌──────────────────────────────────────────┐
                        │         GY MAISON COUTURE ERP            │
                        │    Full-stack Next.js 14+ / React 18     │
                        └────────────────────┬─────────────────────┘
                                             │
               ┌─────────────────────────────┼─────────────────────────────┐
               ▼                             ▼                             ▼
┌─────────────────────────────┐   ┌────────────────────┐     ┌───────────────────────────┐
│          GY ADMIN           │   │     GY ATELIER     │     │           MY GY           │
│ Back-office Direction &     │   │ Interface Tactile  │     │ Portail Client VIP        │
│ Administration              │   │ Tablettes & Mobiles│     │ Suivi de Confection       │
└──────────────┬──────────────┘   └──────────┬─────────┘     └─────────────┬─────────────┘
               │                             │                             │
               └─────────────────────────────┼─────────────────────────────┘
                                             ▼
                       ┌───────────────────────────────────────────┐
                       │          COUCHE COMMUNE CENTRALISÉE       │
                       ├───────────────────────────────────────────┤
                       │  • Controller API REST / RPC              │
                       │  • Middleware Sécurité & RBAC Strict      │
                       │  • Workflows Méthodes / State Engine       │
                       │  • Journal d'Audit & Notifications        │
                       │  • Prisma ORM / SQLite / PostgreSQL       │
                       └───────────────────────────────────────────┘
```

---

## 1. Single Source of Truth (Base Unifiée)

- **PostgreSQL / SQLite via Prisma ORM** : Toutes les données métier (clients, commandes, mensurations, stocks, essayages, réclamations, transactions) sont stockées dans une base unique.
- **Synchronisation en Temps Réel** : Lorsqu'un artisan termine une étape dans GY ATELIER, le statut de la commande est automatiquement mis à jour dans GY ADMIN et la timeline du client sur MY GY progresse à l'étape correspondante.

---

## 2. Structure Modulaire du Code

- `/src/app/(admin)/admin` : Code du portail Back-office Direction.
- `/src/app/(atelier)/atelier` : Code du portail Tactile Atelier.
- `/src/app/(client)/client` : Code du portail Espace Client VIP.
- `/src/app/api` : Endpoints API sécurisés partagés par les 3 portails.
- `/src/lib` : Moteurs de workflows, calculs financiers/stocks, sécurité RBAC et instance Prisma.
- `/prisma` : Schéma de base de données (40+ entités) et script de seed de démonstration.
- `/tests` : Tests d'intégration et de validation des règles métier.
