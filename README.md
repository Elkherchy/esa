# 🏆 ESA-TEZ - Coffre-Fort Documentaire Intelligent

[![Python](https://img.shields.io/badge/Python-3.11-blue.svg)](https://www.python.org/)
[![Django](https://img.shields.io/badge/Django-4.2-green.svg)](https://www.djangoproject.com/)
[![Docker](https://img.shields.io/badge/Docker-Compose-blue.svg)](https://www.docker.com/)
[![Mistral AI](https://img.shields.io/badge/AI-Mistral%207B-orange.svg)](https://mistral.ai/)

## 📋 Description

Module de Coffre-Fort Documentaire complet avec analyse IA locale, destiné à s'intégrer comme service externe au sein d'un écosystème numérique. Ce projet implémente les 4 piliers techniques du Défi National ESA-TECH.

### ✨ Fonctionnalités Principales

- 📁 **Stockage Sécurisé** : Upload et gestion de documents avec Mayan EDMS
- 🤖 **Analyse IA Locale** : Résumés automatiques et extraction de mots-clés avec Mistral 7B
- 🔐 **Gestion des Accès** : Permissions par rôles et accès temporaires
- 🔍 **Recherche Avancée** : Recherche sémantique dans les documents
- 📊 **Statistiques** : Dashboards admin et utilisateur
- 🐳 **100% Conteneurisé** : Déploiement complet avec Docker Compose

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    ESA-TEZ Architecture                      │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  Client  │  │ Backend  │  │  Ollama  │  │  Mayan   │   │
│  │   Web    │◄─┤  Django  │◄─┤ Mistral  │  │   EDMS   │   │
│  │          │  │   API    │  │    7B    │  │          │   │
│  └──────────┘  └─────┬────┘  └──────────┘  └──────────┘   │
│                      │                                       │
│                 ┌────┴────┐                                  │
│                 │ Celery  │                                  │
│                 │ Workers │                                  │
│                 └────┬────┘                                  │
│                      │                                       │
│           ┌──────────┼──────────┐                           │
│           │          │          │                            │
│      ┌────▼────┐ ┌──▼───┐  ┌───▼────┐                      │
│      │  Redis  │ │  DB  │  │ Media  │                       │
│      │         │ │ PG   │  │ Files  │                       │
│      └─────────┘ └──────┘  └────────┘                       │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### Services Docker

| Service | Port | Description |
|---------|------|-------------|
| **backend** | 8000 | API Django REST Framework |
| **db** | 5432 | PostgreSQL Database |
| **ollama** | 11434 | Service IA avec Mistral 7B |
| **mayan** | 8001 | Mayan EDMS |
| **redis** | 6379 | Cache et broker Celery |
| **celery** | - | Workers pour tâches asynchrones |

---

## 🚀 Installation et Démarrage

### Prérequis

- Docker Engine 20.10+
- Docker Compose 2.0+
- 16 GB RAM minimum (recommandé pour Mistral 7B)
- 20 GB espace disque libre

### Démarrage Rapide

1. **Cloner le repository**
```bash
git clone <repository-url>
cd esa-tez
```

2. **Copier le fichier d'environnement**
```bash
cp .env.example .env
```

3. **Lancer tous les services**
```bash
docker-compose up --build
```

⏱️ **Premier démarrage** : Comptez 5-10 minutes pour :
- Build des images Docker
- Téléchargement de Mistral 7B (~4.1 GB)
- Initialisation de la base de données

4. **Accéder aux services**
- API Backend : http://localhost:8001
- Admin Django : http://localhost:8001/admin
- Mayan EDMS : http://localhost:8001

### Compte par Défaut

```
Email: admin@esa-tez.com
Password: admin123
```

---

## 📡 API Endpoints

### Authentification

```http
POST /api/auth/register/         # Créer un compte
POST /api/auth/login/            # Se connecter
POST /api/auth/logout/           # Se déconnecter
POST /api/auth/refresh/          # Rafraîchir le token
GET  /api/auth/me/               # Infos utilisateur
```

### Documents

```http
GET    /api/documents/                   # Liste des documents
POST   /api/documents/                   # Upload un document
GET    /api/documents/{id}/              # Détails d'un document
PATCH  /api/documents/{id}/              # Modifier un document
DELETE /api/documents/{id}/              # Supprimer un document
POST   /api/documents/{id}/analyze/      # Lancer l'analyse IA
GET    /api/documents/tags/              # Liste des tags
GET    /api/documents/stats/             # Statistiques (admin)
```

### Exemples d'utilisation

**Login et récupération du token**
```bash
curl -X POST http://localhost:8001/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@esa-tez.com",
    "password": "admin123"
  }'
```

**Upload d'un document**
```bash
curl -X POST http://localhost:8001/api/documents/ \
  -H "Authorization: Bearer {ACCESS_TOKEN}" \
  -F "file=@document.pdf" \
  -F "title=Mon Document" \
  -F "description=Description du document" \
  -F "visibility=PRIVATE"
```

**Récupérer un document avec analyse IA**
```bash
curl -X GET http://localhost:8001/api/documents/{DOCUMENT_ID}/ \
  -H "Authorization: Bearer {ACCESS_TOKEN}"
```

---

## 🤖 Intelligence Artificielle

### Modèle : Mistral 7B

Le système utilise **Mistral 7B** via **Ollama** pour l'analyse locale des documents.

#### Capacités IA

1. **Résumé Automatique** : Génération de résumés concis en français
2. **Extraction de Mots-Clés** : Identification des 5-7 concepts clés
3. **Analyse Sémantique** : Compréhension du contenu documentaire
4. **Privacy-First** : Aucune donnée ne quitte le serveur local

#### Formats Supportés

- 📄 PDF (avec extraction de texte)
- 📝 DOCX / DOC
- 📃 TXT
- 🖼️ Images (avec OCR - à venir)

#### Performance

- Temps d'analyse moyen : 5-15 secondes
- Capacité : Jusqu'à 4000 caractères par analyse
- Modèle : mistral:7b (~4.1 GB)

---

## 🔐 Gestion des Permissions

### Rôles Utilisateurs

| Rôle | Description | Permissions |
|------|-------------|-------------|
| **ADMIN** | Administrateur | Gestion complète |
| **USER** | Utilisateur | Documents personnels + publics |

### Visibilité des Documents

- **PRIVATE** : Seul le propriétaire peut accéder
- **ROLE_BASED** : Accessible selon le rôle
- **PUBLIC** : Accessible à tous les utilisateurs authentifiés

### Accès Temporaires

Les administrateurs peuvent définir des fenêtres d'accès temporaires :
- Par utilisateur spécifique
- Par rôle
- Avec dates de début et fin

---

## 📊 Statistiques et Monitoring

### Dashboard Admin

- Total de documents
- Documents analysés
- Utilisateurs actifs
- Permissions temporaires actives

### Dashboard Utilisateur

- Mes documents récents
- Statistiques d'analyse IA
- Historique de recherche

---

## 🛠️ Développement

### Structure du Projet

```
esa-tez/
├── apps/
│   ├── accounts/          # Authentification & Utilisateurs
│   ├── documents/         # Gestion des documents
│   ├── permissions/       # Gestion des permissions
│   ├── analytics/         # Statistiques
│   └── search/            # Recherche avancée
├── services/
│   ├── ai_service.py      # Service d'analyse IA
│   ├── file_service.py    # Extraction de fichiers
│   └── mayan_service.py   # Intégration Mayan EDMS
├── config/                # Configuration Django
├── ollama/                # Configuration Ollama
├── docker-compose.yml     # Orchestration Docker
└── requirements.txt       # Dépendances Python
```

### Tests

```bash
# Lancer les tests
docker-compose exec backend python manage.py test

# Créer un superutilisateur
docker-compose exec backend python manage.py createsuperuser

# Migrations
docker-compose exec backend python manage.py makemigrations
docker-compose exec backend python manage.py migrate
```

### Logs

```bash
# Voir les logs de tous les services
docker-compose logs -f

# Logs d'un service spécifique
docker-compose logs -f backend
docker-compose logs -f ollama
docker-compose logs -f celery
```

---

## 🔧 Configuration Avancée

### Variables d'Environnement

Voir `.env.example` pour la configuration complète.

**Variables clés :**
```env
# Django
DJANGO_SECRET_KEY=your-secret-key
DEBUG=True

# Base de données
POSTGRES_DB=esa_tez_db
POSTGRES_USER=esa_user
POSTGRES_PASSWORD=secure_password

# Ollama IA
OLLAMA_HOST=http://ollama:11434
OLLAMA_MODEL=mistral:7b
OLLAMA_TIMEOUT=60

# Mayan EDMS
MAYAN_HOST=http://mayan:8000
MAYAN_USERNAME=admin
MAYAN_PASSWORD=admin
```

### Changer le Modèle IA

Pour utiliser un autre modèle Ollama :

1. Modifier `OLLAMA_MODEL` dans `.env`
2. Modifier `ollama/init.sh` pour télécharger le modèle souhaité
3. Rebuild : `docker-compose up --build`

Modèles disponibles : https://ollama.ai/library

---

## 📦 Production

### Checklist de Déploiement

- [ ] Changer `DEBUG=False` dans `.env`
- [ ] Définir un `DJANGO_SECRET_KEY` fort
- [ ] Configurer des mots de passe sécurisés
- [ ] Configurer `ALLOWED_HOSTS`
- [ ] Mettre en place HTTPS
- [ ] Configurer les backups de la base de données
- [ ] Limiter l'accès aux ports Docker
- [ ] Configurer un reverse proxy (Nginx)

### Backup

```bash
# Backup de la base de données
docker-compose exec db pg_dump -U esa_user esa_tez_db > backup.sql

# Backup des médias
tar -czf media_backup.tar.gz media/
```

---

## 🎯 Points Clés du Défi

### ✅ 4 Piliers Implémentés

1. **Architecture 100% Conteneurisée** ✓
   - Docker Compose avec 6 services
   - Orchestration complète
   - Une seule commande de démarrage

2. **Séparation des Responsabilités** ✓
   - Gestion des rôles (USER/ADMIN)
   - Authentification JWT
   - Permissions granulaires

3. **IA Locale et Sécurisée** ✓
   - Mistral 7B via Ollama
   - Résumés et mots-clés automatiques
   - Privacy-First : tout reste local

4. **Interface Modulaire** ✓
   - API REST complète
   - Admin Django intégré
   - Prêt pour un client frontend

### 🏅 Bonus : SSO (En cours)

L'architecture supporte l'intégration SSO via :
- OIDC (OpenID Connect)
- SAML
- OAuth2

---

## 📝 Licence

Ce projet est développé dans le cadre du Défi National Nuit de l'Info 2024.

---

## 👥 Support

Pour toute question ou problème :
1. Vérifier les logs : `docker-compose logs`
2. Redémarrer les services : `docker-compose restart`
3. Rebuild complet : `docker-compose down && docker-compose up --build`

---

## 🎉 Démonstration

### Scénario de Test

1. **Démarrer le système**
   ```bash
   docker-compose up
   ```

2. **Se connecter à l'admin**
   - URL : http://localhost:8001/admin
   - Login : admin@esa-tez.com / admin123

3. **Uploader un document PDF**
   - Via l'API ou l'admin Django
   - L'analyse IA se lance automatiquement

4. **Voir le résultat**
   - Le document est analysé par Mistral 7B
   - Résumé et mots-clés disponibles
   - Document stocké dans Mayan EDMS

---

**Fait avec ❤️ pour la Nuit de l'Info 2024**



