# 🏰 NIRD - Le Village Numérique des Irréductibles

> *"Nous sommes en 2025. Tout l'écosystème numérique est occupé par les Big Tech... Tout ? Non ! Un village peuplé d'irréductibles Gaulois résiste encore et toujours à l'envahisseur."*

![NIRD](https://img.shields.io/badge/Démarche-NIRD-c9302c)
![Nuit de l'Info](https://img.shields.io/badge/Nuit_de_l'Info-2025-ffd700)
![License](https://img.shields.io/badge/License-Libre-4a7c23)

## 🎯 C'est quoi NIRD ?

**N**umérique **I**nclusif, **R**esponsable et **D**urable

Une plateforme web inspirée du projet NIRD né au Lycée Carnot de Bruay-la-Buissière, pour accompagner les établissements scolaires dans leur transition vers les logiciels libres et leur indépendance numérique.

### 🏛️ Les 3 Piliers

| Pilier | Description |
|--------|-------------|
| 🤝 **Inclusif** | Un numérique accessible à tous, sans barrière financière ni technique |
| 🛡️ **Responsable** | Protection des données, respect de la vie privée, souveraineté numérique |
| 🌱 **Durable** | Lutter contre l'obsolescence programmée, prolonger la vie du matériel |

## ✨ Fonctionnalités

### 🎯 Quiz d'Évaluation
- Évaluez le niveau de dépendance numérique de votre établissement
- 10 questions pour mesurer votre "résistance" aux Big Tech
- Recommandations personnalisées de solutions libres

### 📚 Catalogue de Solutions Libres
- Documentation des alternatives aux logiciels propriétaires
- Linux, LibreOffice, Firefox, Nextcloud, Jitsi...
- Cycle de vie des solutions (Brouillon → Validé → Publié)

### 🧙‍♂️ Assistant Panoramix
- Chatbot intégré pour guider les utilisateurs
- Réponses sur les logiciels libres et la démarche NIRD
- Thématique gauloise immersive

### 👥 Communauté
- Gestion des contributeurs (Admin, Contributeur, Lecteur)
- Historique des contributions
- Statistiques et dashboard

### 🎵 Ambiance Gauloise
- Musique de fond thématique
- Personnages Astérix et Obélix animés
- Interface aux couleurs du village gaulois

## 🚀 Installation

### Prérequis

- Node.js >= 18.x
- PostgreSQL >= 14.x
- npm

### Installation Rapide (Windows)

```bash
# Cloner le projet
git clone <votre-repo>
cd nuit-info

# Lancer le script d'installation
scripts\start.bat
```

### Installation Manuelle

#### 1. Base de données PostgreSQL

```sql
CREATE DATABASE lifecycle_tracker;
```

#### 2. Backend

```bash
cd backend
npm install
npm run db:init
npm run dev
```

#### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

### 🔑 Compte Admin

```
Email: admin@lifecycle.local
Mot de passe: admin123
```

⚠️ **Changez ce mot de passe en production !**

## 📁 Structure du Projet

```
nuit-info/
├── 🏰 backend/
│   ├── controllers/      # Logique métier
│   ├── middlewares/      # Auth, upload, validation
│   ├── models/           # Modèles Sequelize (PostgreSQL)
│   ├── routes/           # Routes API REST
│   └── server.js         # Point d'entrée
│
├── ⚔️ frontend/
│   └── src/
│       ├── components/   # MusicPlayer, AiAssistant, GauloisCharacters...
│       ├── pages/        # Landing, Quiz, Dashboard, Login...
│       ├── context/      # AuthContext
│       └── services/     # API calls
│
├── 🎵 frontend/public/
│   ├── audio/            # Musique de fond
│   └── images/           # Astérix, Obélix...
│
└── 📜 scripts/
    └── start.bat         # Script de démarrage Windows
```

## 🔌 API Endpoints

### Authentification
```
POST   /api/auth/register    # Inscription
POST   /api/auth/login       # Connexion
GET    /api/auth/me          # Profil
```

### Solutions (Entités)
```
GET    /api/entities         # Liste des solutions
POST   /api/entities         # Créer une solution
PUT    /api/entities/:id     # Modifier
DELETE /api/entities/:id     # Supprimer
```

### Contributeurs
```
GET    /api/contributors     # Liste
DELETE /api/contributors/:id # Supprimer (admin)
```

### Statistiques
```
GET    /api/stats            # Stats globales
GET    /api/stats/timeline   # Activité
```

## 🎨 Technologies

| Composant | Technologie | Pourquoi ? |
|-----------|-------------|------------|
| Frontend | React 18 + Vite | Rapide, moderne, libre |
| Backend | Node.js + Express | Simple, performant |
| BDD | PostgreSQL | Robuste, open source |
| Auth | JWT + bcrypt | Sécurisé, standard |
| Charts | Chart.js | Libre, léger |
| Icons | Lucide React | Open source |

## 🌍 Déploiement

### Option 1 : Render.com (Gratuit)

1. Créer un compte sur [render.com](https://render.com)
2. Déployer PostgreSQL
3. Déployer le Backend (Web Service)
4. Déployer le Frontend (Static Site)

### Variables d'environnement

**Backend :**
```env
DATABASE_URL=postgresql://...
JWT_SECRET=votre_secret_long
NODE_ENV=production
```

**Frontend :**
```env
VITE_API_URL=https://votre-backend.onrender.com/api
```

## 🛡️ Sécurité & Indépendance

Cette plateforme est **100% indépendante des Big Tech** :

- ✅ Aucun Google Analytics
- ✅ Aucun service cloud obligatoire (AWS, Azure, GCP)
- ✅ Données sous votre contrôle total
- ✅ Hébergement local ou cloud privé possible
- ✅ Code source ouvert et modifiable
- ✅ Pas de tracking, pas de pub

## 🏆 Crédits

### Projet NIRD Original
- **Lycée Carnot** de Bruay-la-Buissière (Hauts-de-France)
- Site officiel : [nird.forge.apps.education.fr](https://nird.forge.apps.education.fr/)

### Inspirations
- 🏛️ Astérix et Obélix (Goscinny & Uderzo)
- 🐧 La communauté du Libre
- 🎓 L'Éducation Nationale

## 📄 License

**Licence Libre** - Utilisez, modifiez et partagez librement !

*Comme la potion magique, ce code est fait pour être partagé.* 🧪

---

<div align="center">

**🏰 Développé avec ❤️ lors de la Nuit de l'Info 2025 🌙**

*Par Toutatis, résistons ensemble aux Big Tech !* ⚔️

</div>
