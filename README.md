# 📦 Coffre-Fort Documentaire IA - ESA-TEZ

Application web moderne de gestion documentaire sécurisée avec intelligence artificielle locale, intégrant recherche OCR, résumé automatique de documents et gestion fine des permissions.

## 🎯 Vue d'ensemble

Cette application permet de :
- **Téléverser et gérer** des documents (PDF, DOCX, TXT)
- **Analyser automatiquement** les documents avec un modèle IA local (Mistral 7B)
- **Rechercher** dans les documents via OCR et recherche sémantique
- **Gérer les permissions** avec contrôle temporel et basé sur les rôles
- **Administrer** les utilisateurs et les documents
- **Sécuriser** les accès avec authentification JWT

## 🏗️ Architecture

### Schéma d'architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT WEB (React)                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  Frontend    │  │  API Service │  │  UI Components│          │
│  │  (Vite)      │  │  (TypeScript)│  │  (shadcn-ui)  │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└────────────────────────────┬──────────────────────────────────┘
                              │ HTTP/REST (JWT)
                              │
┌─────────────────────────────▼──────────────────────────────────┐
│                    BACKEND API (Django REST)                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  Auth        │  │  Documents   │  │  Permissions │          │
│  │  (JWT)       │  │  (CRUD)      │  │  (RBAC)      │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  Analytics   │  │  Search      │  │  Tags        │          │
│  │  (Stats)     │  │  (OCR/Full)  │  │  (Metadata)  │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└────────────────────────────┬──────────────────────────────────┘
                              │
                    ┌─────────┴─────────┐
                    │                   │
        ┌───────────▼──────────┐  ┌────▼──────────────────────┐
        │   Mayan EDMS          │  │   Service IA Local        │
        │   (Stockage)          │  │   (Mistral 7B)            │
        │                       │  │                          │
        │  - Documents          │  │  - Analyse de texte      │
        │  - OCR                │  │  - Résumé automatique    │
        │  - Métadonnées        │  │  - Extraction mots-clés  │
        └───────────────────────┘  └──────────────────────────┘
                              │
                    ┌─────────┴─────────┐
                    │                   │
        ┌───────────▼──────────┐  ┌────▼──────────────────────┐
        │   PostgreSQL          │  │   Redis (Optionnel)       │
        │   (Base de données)   │  │   (Cache/Tasks)           │
        └───────────────────────┘  └──────────────────────────┘
```

### Composants principaux

1. **Frontend (React + TypeScript + Vite)**
   - Interface utilisateur moderne avec shadcn-ui
   - Gestion d'état avec React Hooks
   - Service API centralisé pour communiquer avec le backend
   - Authentification JWT avec refresh automatique

2. **Backend (Django REST Framework)**
   - API RESTful complète
   - Authentification JWT (djangorestframework-simplejwt)
   - Intégration avec Mayan EDMS pour le stockage
   - Service d'analyse IA local
   - Gestion des permissions temporelles

3. **Mayan EDMS**
   - Stockage sécurisé des documents
   - OCR automatique
   - Gestion des versions
   - Métadonnées enrichies

4. **Service IA (Mistral 7B)**
   - Analyse locale des documents
   - Génération de résumés
   - Extraction de mots-clés
   - Pas de données envoyées à l'extérieur

## 🚀 Installation rapide

### Prérequis

- Docker et Docker Compose installés
- Git
- 8 GB de RAM minimum (pour le modèle IA)
- Ports disponibles : 3000 (frontend), 8001 (backend), 8000 (Mayan)

### Installation en une commande

```bash
# Cloner le dépôt
git clone https://github.com/Elkherchy/esa.git
cd esa

# Lancer tous les services
docker-compose up -d

# Attendre que tous les services soient prêts (environ 2-3 minutes)
docker-compose logs -f
```

L'application sera accessible sur :
- **Frontend** : http://localhost:3000
- **Backend API** : http://localhost:8001
- **Mayan EDMS** : http://localhost:8000
- **Documentation API** : http://localhost:8001/api/docs/

### Comptes par défaut

Après le premier lancement, créez un compte administrateur :

```bash
# Accéder au conteneur backend
docker-compose exec backend python manage.py createsuperuser

# Ou utiliser le script d'initialisation
docker-compose exec backend python manage.py init_admin
```

**Compte de test** (si créé) :
- Email : `admin@esa-tez.com`
- Mot de passe : `admin123`

## 📋 Configuration

### Variables d'environnement

#### Frontend (`.env`)

```env
VITE_API_BASE_URL=http://localhost:8001
```

#### Backend (`backend/.env`)

```env
SECRET_KEY=your-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Base de données
DATABASE_URL=postgresql://mayan:mayan@db:5432/mayan

# Mayan EDMS
MAYAN_BASE_URL=http://mayan:8000
MAYAN_API_KEY=your-mayan-api-key

# IA Service
AI_SERVICE_URL=http://ai-service:5000
AI_MODEL=mistral:7b

# JWT
JWT_SECRET_KEY=your-jwt-secret
JWT_ALGORITHM=HS256
JWT_ACCESS_TOKEN_LIFETIME=3600
JWT_REFRESH_TOKEN_LIFETIME=86400
```

### Configuration Docker Compose

Le fichier `docker-compose.yml` configure automatiquement :
- Réseau Docker pour la communication inter-services
- Volumes persistants pour les données
- Variables d'environnement
- Health checks pour tous les services

## 🎮 Utilisation

### 1. Connexion

1. Accédez à http://localhost:3000
2. Connectez-vous avec vos identifiants
3. Vous serez redirigé vers le dashboard selon votre rôle

### 2. Téléverser un document

1. Cliquez sur **"Téléverser un document"** (admin) ou **"Mes documents"** (utilisateur)
2. Glissez-déposez un fichier ou cliquez pour parcourir
3. Remplissez les métadonnées (titre, visibilité, tags)
4. Cliquez sur **"Téléverser"**

Le document sera :
- Stocké dans Mayan EDMS
- Analysé par OCR automatiquement
- Disponible pour l'analyse IA

### 3. Analyser un document avec l'IA

1. Ouvrez un document depuis la liste
2. Cliquez sur **"Analyser le document"**
3. Attendez quelques secondes (analyse locale)
4. Consultez le résumé et les mots-clés générés

### 4. Rechercher des documents

1. Utilisez la barre de recherche dans **"Mes documents"**
2. Filtrez par :
   - Visibilité (Privé, Par rôle, Public)
   - Tags
   - Date de création
   - Statut d'analyse

### 5. Gérer les permissions (Admin)

1. Accédez à **"Gérer les permissions"**
2. Cliquez sur **"Ajouter une permission"**
3. Sélectionnez :
   - Document
   - Bénéficiaire (utilisateur ou rôle)
   - Période d'accès (début et fin)
4. La permission sera appliquée automatiquement

## 🔧 Développement

### Structure du projet

```
.
├── src/                          # Code source frontend
│   ├── components/              # Composants React
│   │   ├── layout/              # Layout principal
│   │   ├── pages/               # Pages de l'application
│   │   └── ui/                  # Composants UI (shadcn-ui)
│   ├── services/                # Services (API, etc.)
│   └── App.tsx                  # Point d'entrée
├── backend/                      # Code source backend
│   ├── apps/                    # Applications Django
│   │   ├── accounts/            # Gestion des utilisateurs
│   │   ├── documents/           # Gestion des documents
│   │   ├── permissions/         # Gestion des permissions
│   │   ├── analytics/           # Statistiques
│   │   └── search/              # Recherche
│   ├── config/                  # Configuration Django
│   └── requirements.txt         # Dépendances Python
├── docker-compose.yml           # Configuration Docker
├── Dockerfile                   # Image Docker frontend
└── README.md                    # Ce fichier
```

### Lancer en mode développement

#### Frontend

```bash
cd frontend
npm install
npm run dev
```

#### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### Tests

```bash
# Backend
cd backend
python manage.py test

# Frontend
cd frontend
npm test
```

## 📡 API Documentation

### Authentification

#### Se connecter

```bash
POST /api/auth/login/
Content-Type: application/json

{
  "email": "admin@esa-tez.com",
  "password": "admin123"
}

Response:
{
  "user": { ... },
  "tokens": {
    "access": "eyJ...",
    "refresh": "eyJ..."
  },
  "message": "Connexion réussie"
}
```

#### Rafraîchir le token

```bash
POST /api/auth/refresh/
Content-Type: application/json

{
  "refresh": "eyJ..."
}

Response:
{
  "access": "eyJ..."
}
```

### Documents

#### Téléverser un document

```bash
POST /api/documents/
Authorization: Bearer <token>
Content-Type: multipart/form-data

file: <fichier>
title: "Mon document"
description: "Description"
visibility: "PRIVATE" | "ROLE_BASED" | "PUBLIC"
tags: "tag1,tag2"
```

#### Lister les documents

```bash
GET /api/documents/?search=rapport&visibility=PRIVATE&tags=Finance
Authorization: Bearer <token>
```

#### Analyser un document

```bash
POST /api/documents/{id}/analyze/
Authorization: Bearer <token>
```

### Permissions

#### Créer une permission

```bash
POST /api/permissions/
Authorization: Bearer <token>
Content-Type: application/json

{
  "document": "uuid",
  "user": "uuid",  # ou "role": "ADMIN"
  "start_time": "2024-01-01T00:00:00Z",
  "end_time": "2024-12-31T23:59:59Z"
}
```

Consultez la documentation complète sur http://localhost:8001/api/docs/

## 🐳 Docker

### Commandes utiles

```bash
# Lancer tous les services
docker-compose up -d

# Voir les logs
docker-compose logs -f

# Arrêter tous les services
docker-compose down

# Reconstruire les images
docker-compose build --no-cache

# Accéder au shell du backend
docker-compose exec backend bash

# Exécuter des commandes Django
docker-compose exec backend python manage.py migrate
docker-compose exec backend python manage.py createsuperuser
```

### Volumes persistants

Les données sont stockées dans des volumes Docker :
- `mayan_data` : Documents et métadonnées Mayan
- `postgres_data` : Base de données PostgreSQL
- `ai_models` : Modèles IA téléchargés

## 🔒 Sécurité

### Authentification
- JWT avec refresh tokens
- Tokens stockés dans localStorage (frontend)
- Expiration automatique des tokens
- Refresh automatique avant expiration

### Permissions
- Contrôle d'accès basé sur les rôles (RBAC)
- Permissions temporelles (début/fin)
- Vérification côté serveur et client
- Isolation des données par utilisateur

### Chiffrement
- HTTPS recommandé en production
- Documents chiffrés dans Mayan EDMS
- Mots de passe hashés (bcrypt)

## 🧪 Tests et Démonstration

### Scénario de test complet

1. **Création de compte**
   ```bash
   POST /api/auth/register/
   ```

2. **Connexion**
   - Utiliser les identifiants créés
   - Vérifier la réception des tokens

3. **Téléversement de document**
   - Téléverser un PDF
   - Vérifier l'OCR automatique
   - Vérifier l'analyse IA

4. **Recherche**
   - Rechercher par mots-clés
   - Filtrer par tags
   - Vérifier les résultats

5. **Gestion des permissions**
   - Créer une permission temporaire
   - Vérifier l'accès limité dans le temps

### Vidéo de démonstration

Une vidéo de 3-5 minutes est disponible dans le dépôt :
- Installation Docker
- Démonstration de l'analyse IA
- Démonstration de la recherche OCR
- Gestion des permissions
- (Bonus) Connexion SSO

## 🐛 Dépannage

### Problèmes courants

#### Le frontend ne se connecte pas au backend

```bash
# Vérifier que le backend est démarré
docker-compose ps

# Vérifier les logs
docker-compose logs backend

# Vérifier la variable d'environnement
cat .env
```

#### L'analyse IA ne fonctionne pas

```bash
# Vérifier que le service IA est démarré
docker-compose ps ai-service

# Vérifier les logs
docker-compose logs ai-service

# Vérifier que le modèle est téléchargé
docker-compose exec ai-service ls -lh /models
```

#### Erreur de base de données

```bash
# Réinitialiser la base de données
docker-compose down -v
docker-compose up -d

# Appliquer les migrations
docker-compose exec backend python manage.py migrate
```

## 📚 Technologies utilisées

### Frontend
- **React 18** : Bibliothèque UI
- **TypeScript** : Typage statique
- **Vite** : Build tool moderne
- **Tailwind CSS** : Framework CSS
- **shadcn-ui** : Composants UI
- **React Router** : Navigation
- **Axios/Fetch** : Requêtes HTTP

### Backend
- **Django 4.2** : Framework web Python
- **Django REST Framework** : API REST
- **djangorestframework-simplejwt** : Authentification JWT
- **PostgreSQL** : Base de données
- **Celery** (optionnel) : Tâches asynchrones
- **Redis** (optionnel) : Cache

### Infrastructure
- **Docker** : Conteneurisation
- **Docker Compose** : Orchestration
- **Mayan EDMS** : Gestion documentaire
- **Mistral 7B** : Modèle IA local
- **Ollama** : Runtime IA

## 🤝 Contribution

Les contributions sont les bienvenues ! Pour contribuer :

1. Fork le projet
2. Créez une branche (`git checkout -b feature/AmazingFeature`)
3. Committez vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

## 📝 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 👥 Auteurs

- **ESA-TEZ Team** - Développement initial

## 🙏 Remerciements

- Mayan EDMS pour la gestion documentaire
- Mistral AI pour le modèle de langage
- La communauté open source

## 📞 Support

Pour toute question ou problème :
- Ouvrir une issue sur GitHub
- Contacter l'équipe : support@esa-tez.com

---

**Note** : Ce projet est en développement actif. Certaines fonctionnalités peuvent évoluer.