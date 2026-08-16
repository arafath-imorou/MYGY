# ERP CENTRAL GY MAISON COUTURE

Écosystème ERP centralisé et interconnecté pour la Maison de Haute Couture **GY MAISON COUTURE**, avec 3 portes d'entrée distinctes sur la même base de données et les mêmes workflows métier :

1. **GY ADMIN** — Back-office Direction, CRM 360°, Stock, Commandes, Finance & RH (`/admin`)
2. **GY ATELIER** — Interface tactile simplifiée pour tablettes/mobiles d'atelier (`/atelier`)
3. **MY GY** — Espace privé VIP pour les clients haute couture (`/client`)

---

## 🌟 Fonctionnalités Clés

- **Une Seule Base de Données Centralisée** : Prisma ORM + SQLite (configuré zéro-dépendance localement, compatible PostgreSQL).
- **Architecture Multi-Portails** : Synchronisation temps-réel entre la direction, l'atelier et les clients.
- **CRM 360° & Mensurations** : Plus de 20 mesures de couture datées et historisées, morphologie, posture et aisance.
- **Stock Physique vs Réservé vs Disponible** : Suivi exact des métrages de tissus (Mikado de Soie, Satin Duchesse, Perles d'Or).
- **Atelier Tactile & QR Code** : Démarrage/Fin de tâches en un clic, scan QR code des pièces et signalement des blocages.
- **Sécurité RBAC & Protection Tenant Client** : Empêche un utilisateur atelier de voir les marges ou un client d'accéder aux données d'un autre client.
- **Workflows Visualisables** : Conversion transparente des étapes internes atelier en 8 jalons élégants pour la cliente sur MY GY.

---

## 🚀 Démarrage Rapide (Environnement de Développement)

```bash
# 1. Cloner le projet et installer les dépendances
npm install

# 2. Synchroniser la base de données SQLite & générer le client Prisma
npm run db:push

# 3. Charger les données de démonstration complets (Clients VIP, Modèles, Commandes, Tissus)
npm run db:seed

# 4. Lancer le serveur de développement
npm run dev
```

L'application est disponible sur `http://localhost:3000`.

---

## 🔑 Comptes de Démonstration (Développement & Test)

| Portail | Email | Mot de passe | Rôle |
|---|---|---|---|
| **GY ADMIN** | `admin@gy-maisoncouture.bj` | `demo123` | Direction / Super Admin |
| **GY ATELIER** | `atelier@gy-maisoncouture.bj` | `demo123` | Responsable Atelier |
| **MY GY (Client)** | `client1@gmail.com` | `demo123` | Client VIP Diamond |

---

## 🧪 Exécution des Tests Automatisés E2E

```bash
node .\node_modules\ts-node\dist\bin.js tests/workflows.test.ts
```

Vérifie l'isolation des données client, le calcul des marges, l'arithmétique des stocks et la transformation des workflows.
