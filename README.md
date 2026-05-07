# 🛒 E-commerce Analytics Platform

Plateforme complète d'analyse de données e-commerce basée sur MongoDB, Node.js et Docker.

> Mini-projet réalisé dans le cadre du cours de bases de données NoSQL  
> Encadré par Pr. Zaidouni Dounia

---
## 🏗️ Architecture

| Composant | Rôle | Port |
|---|---|---|
| 🗄️ **MongoDB** | Stockage des 50 000+ documents | 27017 |
| ⚙️ **Node.js + Express** | API REST — expose les analyses | 3000 |
| 🔧 **Data Generator** | Génère les données au premier lancement | - |
| 📊 **Dashboard** | Interface de visualisation Chart.js | 8080 |

**Flux des données :**
MongoDB  ←→  Node.js / Express API  ←→  Dashboard (navigateur)

> Tous les services sont orchestrés par **Docker Compose** et lancés avec une seule commande.

---

## 🚀 Lancement du projet

### Prérequis
- Docker Desktop installé et lancé

### Une seule commande
```bash
docker-compose up --build
```

### Accès aux services
| Service | URL |
|---|---|
| 📊 Dashboard | http://localhost:8080 |
| 🔌 API Backend | http://localhost:3000 |
| 🗄️ MongoDB | localhost:27017 |

---

## 📡 Endpoints API

| Méthode | Endpoint | Description |
|---|---|---|
| GET | `/api/revenue/stats` | KPIs globaux |
| GET | `/api/revenue/monthly?year=2024` | CA par mois |
| GET | `/api/revenue/by-city` | CA par ville |
| GET | `/api/revenue/trend` | Tendance hebdomadaire |
| GET | `/api/products/top?limit=10` | Top produits |
| GET | `/api/products/by-category` | CA par catégorie |
| GET | `/api/products/list` | Liste des produits |
| GET | `/api/customers/segmentation` | Segmentation RFM |
| GET | `/api/customers/segments-summary` | Résumé segments |
| GET | `/api/customers/delivery-performance` | Performance livraisons |
| GET | `/api/performance` | Stats avant/après index |
| POST | `/api/indexes/create` | Créer les index |

---
## 📁 Structure du projet

```text
ecommerce-analytics/
├── docker-compose.yml
├── README.md
├── backend/
│   ├── Dockerfile
│   ├── server.js
│   └── src/
│       ├── config/        (db.js, indexes.js, performance.js)
│       ├── routes/        (revenue.js, products.js, customers.js)
│       ├── controllers/   (logique metier)
│       └── aggregations/  (pipelines MongoDB)
├── data-generator/
│   ├── Dockerfile
│   └── generate.js
└── frontend/
    ├── Dockerfile
    ├── index.html
    ├── css/style.css
    └── js/  (api.js, charts.js, main.js)
```

---

## 🗄️ Modélisation MongoDB

### Collection `orders` — document principal avec embedded documents
```json
{
  "order_id": "ORD-000001",
  "date": "2024-12-15T14:30:00Z",
  "status": "delivered",
  "customer": {
    "customer_id": "CUST-1234",
    "name": "Ayoub Benali",
    "location": { "city": "Casablanca", "country": "MA" },
    "segment": "VIP"
  },
  "items": [
    {
      "product_id": "PROD-002",
      "name": "iPhone 15",
      "category": "Électronique",
      "quantity": 1,
      "unit_price": 9800,
      "discount": 0.10,
      "final_price": 8820
    }
  ],
  "payment": {
    "method": "carte_bancaire",
    "total_amount": 8820,
    "currency": "MAD"
  },
  "delivery": {
    "carrier": "Amana",
    "estimated_days": 3,
    "actual_days": 2,
    "status": "delivered"
  }
}
```

### Collection `products` — référence séparée
```json
{
  "product_id": "PROD-002",
  "name": "iPhone 15",
  "category": "Électronique",
  "price": 9800,
  "popularity_score": 5,
  "stock": 120
}
```

---

## 📊 Analyses implementées

| # | Analyse | Type |
|---|---|---|
| 1 | CA par mois | Aggregation Pipeline |
| 2 | CA par ville | Aggregation Pipeline |
| 3 | Tendance hebdomadaire | Aggregation Pipeline |
| 4 | Top produits les plus vendus | Aggregation Pipeline + $unwind |
| 5 | CA par catégorie | Aggregation Pipeline + $unwind |
| 6 | Segmentation clients RFM | Pipeline complexe multi-étapes |
| 7 | Résumé segments | Aggregation Pipeline |
| 8 | Performance livraisons | Aggregation Pipeline |

---

## 🔍 Indexation

Index créés sur la collection `orders` :

| Index | Champ(s) | Utilité |
|---|---|---|
| `idx_status` | `status` | Filtre par statut |
| `idx_date` | `date` | Analyses temporelles |
| `idx_status_date` | `status + date` | Requêtes combinées |
| `idx_city` | `customer.location.city` | Analyse géographique |
| `idx_segment` | `customer.segment` | Segmentation clients |
| `idx_amount` | `payment.total_amount` | Analyses financières |
| `idx_items_category` | `items.category` | Analyse par catégorie |
| `idx_carrier` | `delivery.carrier` | Performance livraisons |

### Résultats — Avant vs Après indexation

| Test | Docs examinés AVANT | Docs examinés APRÈS | Gain |
|---|---|---|---|
| Filtre par statut | 50 000 | 39 998 | -20% |
| Filtre par ville | 50 000 | 14 913 | -70% |
| Statut + date | 50 000 | 24 145 | -52% |
| Filtre segment VIP | 50 000 | 5 052 | -90% |

---

## 🧠 Logique de génération des données

Les 50 000 commandes ont été générées avec une logique métier réaliste :

- **Saisonnalité** : pics en Décembre, Novembre (Black Friday) et Avril (Ramadan)
- **Popularité produits** : loi de Pareto — produits peu chers = plus vendus
- **Segmentation** : 60% Occasionnels, 30% Standard, 10% VIP
- **Géographie** : Casablanca 30%, Rabat 15%, Marrakech 12%...
- **Cohérence temporelle** : statut d'une commande dépend de sa date

---

## 🛠️ Stack technique

| Technologie | Version | Rôle |
|---|---|---|
| MongoDB | 7.0 | Base de données orientée documents |
| Node.js | 22 | Runtime JavaScript backend |
| Express.js | 4.x | Framework API REST |
| Chart.js | 4.x | Visualisation des données |
| Docker | 29.x | Conteneurisation |
| Docker Compose | 3.8 | Orchestration des services |
| Faker.js | 9.x | Génération de données réalistes |
