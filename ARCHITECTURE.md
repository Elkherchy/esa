# 🏗️ Architecture ESA-TEZ

Ce document décrit l'architecture technique complète du système ESA-TEZ.

---

## 📊 Vue d'Ensemble

ESA-TEZ est une application de gestion documentaire avec analyse IA locale, construite sur une architecture microservices conteneurisée.

### Principes Architecturaux

1. **Microservices** : Séparation claire des responsabilités
2. **Conteneurisation** : Docker pour isolation et portabilité
3. **Privacy-First** : Traitement IA 100% local
4. **API-First** : Backend REST pour flexibilité
5. **Asynchrone** : Celery pour tâches longues

---

## 🐳 Architecture Docker

```
┌─────────────────────────────────────────────────────────────────┐
│                     Docker Network: esa-network                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌────────────────┐         ┌────────────────┐                  │
│  │   Frontend     │────────►│   Backend      │                  │
│  │   (futur)      │  HTTP   │   Django API   │                  │
│  │   Port: 3000   │         │   Port: 8000   │                  │
│  └────────────────┘         └────────┬───────┘                  │
│                                      │                           │
│                       ┌──────────────┼──────────────┐           │
│                       │              │              │            │
│                       ▼              ▼              ▼            │
│              ┌─────────────┐  ┌──────────┐  ┌──────────┐       │
│              │   Ollama    │  │  Mayan   │  │   DB     │       │
│              │  Mistral7B  │  │   EDMS   │  │  PG 15   │       │
│              │  Port:11434 │  │ Port:8001│  │Port:5432 │       │
│              └─────────────┘  └──────────┘  └──────────┘       │
│                       ▲                           ▲              │
│                       │                           │              │
│                       │      ┌──────────┐         │              │
│                       │      │  Celery  │─────────┘              │
│                       │      │ Workers  │                        │
│                       │      └────┬─────┘                        │
│                       │           │                              │
│                       │      ┌────▼─────┐                        │
│                       └──────│  Redis   │                        │
│                              │ Port:6379│                        │
│                              └──────────┘                        │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

### Services et Rôles

| Service | Image | Rôle | Dépendances |
|---------|-------|------|-------------|
| **backend** | Python 3.11 | API REST Django | db, redis, ollama |
| **db** | PostgreSQL 15 | Base de données | - |
| **ollama** | ollama/ollama | Service IA local | - |
| **mayan** | mayanedms/mayanedms:4.5 | Gestion documentaire | db |
| **redis** | Redis 7 | Cache & broker | - |
| **celery** | Python 3.11 | Tâches async | db, redis, ollama |

---

## 🎯 Architecture Backend Django

### Structure des Applications

```
backend/
├── config/                    # Configuration Django
│   ├── settings.py           # Settings principaux
│   ├── urls.py               # Routing principal
│   ├── celery.py             # Config Celery
│   └── wsgi.py               # WSGI entry point
│
├── apps/                      # Applications Django
│   ├── accounts/             # 👤 Authentification & Users
│   │   ├── models.py         # User personnalisé
│   │   ├── serializers.py    # JWT, Login, Register
│   │   ├── views.py          # API endpoints auth
│   │   └── urls.py           # Routes auth
│   │
│   ├── documents/            # 📄 Gestion Documents
│   │   ├── models.py         # Document, DocumentAnalysis, Tag
│   │   ├── serializers.py    # CRUD documents
│   │   ├── views.py          # Upload, liste, détails
│   │   ├── tasks.py          # Celery: analyse IA
│   │   └── urls.py           # Routes documents
│   │
│   ├── permissions/          # 🔐 Gestion Accès
│   │   ├── models.py         # Permission (accès temporaires)
│   │   └── admin.py          # Interface admin
│   │
│   ├── analytics/            # 📊 Statistiques
│   │   ├── models.py         # DocumentAccessLog
│   │   └── views.py          # Dashboards, stats
│   │
│   └── search/               # 🔍 Recherche Avancée
│       ├── models.py         # SearchQuery (historique)
│       └── views.py          # Recherche sémantique
│
├── services/                  # 🛠️ Services Métier
│   ├── ai_service.py         # Interface Ollama/Mistral
│   ├── file_service.py       # Extraction PDF/DOCX
│   └── mayan_service.py      # Intégration Mayan EDMS
│
└── utils/                     # 🔧 Utilitaires
    └── permissions.py        # Custom permissions
```

---

## 🔄 Flux de Données Principaux

### 1. Upload et Analyse de Document

```
┌──────────┐                                              
│  Client  │                                              
└────┬─────┘                                              
     │ POST /api/documents/                              
     │ (multipart/form-data)                             
     ▼                                                    
┌─────────────────┐                                      
│  Backend API    │                                      
│  DocumentView   │                                      
└────┬────────────┘                                      
     │                                                    
     │ 1. Valider fichier (FileService)                 
     │ 2. Sauvegarder Document                          
     │ 3. Extraire infos (pages, taille)                
     │ 4. Lancer tâche Celery                           
     │                                                    
     ▼                                                    
┌─────────────────┐                                      
│  Celery Worker  │                                      
│  analyze_task   │                                      
└────┬────────────┘                                      
     │                                                    
     │ 1. Extraire texte (FileService)                  
     ├──► extract_text_from_pdf()                       
     │                                                    
     │ 2. Analyser avec IA (AIService)                  
     ├──► generate_summary()                            
     │    └──► Ollama/Mistral 7B                        
     │                                                    
     ├──► extract_keywords()                            
     │    └──► Ollama/Mistral 7B                        
     │                                                    
     │ 3. Sauvegarder DocumentAnalysis                  
     │                                                    
     │ 4. Upload vers Mayan (optionnel)                 
     └──► MayanService.upload_document()                
          └──► Mayan EDMS API                           
```

### 2. Authentification JWT

```
┌──────────┐                                    
│  Client  │                                    
└────┬─────┘                                    
     │ POST /api/auth/login/                    
     │ {email, password}                        
     ▼                                          
┌─────────────────┐                            
│  Backend API    │                            
│  LoginView      │                            
└────┬────────────┘                            
     │                                          
     │ 1. Valider credentials                  
     │    Django authenticate()                
     │                                          
     │ 2. Générer tokens JWT                   
     │    RefreshToken.for_user()              
     │                                          
     │ 3. Retourner user + tokens              
     ▼                                          
┌──────────┐                                    
│  Client  │                                    
│  Store:  │                                    
│  - access_token (1h)                         
│  - refresh_token (7j)                        
└──────────┘                                    
                                                
     │ Requêtes suivantes                      
     │ Authorization: Bearer {access_token}    
     ▼                                          
┌─────────────────┐                            
│  Backend API    │                            
│  JWT Middleware │                            
└─────────────────┘                            
     │ Valide token                            
     │ Charge user                             
     ▼                                          
   Accès autorisé                              
```

### 3. Recherche de Documents

```
┌──────────┐                                              
│  Client  │                                              
└────┬─────┘                                              
     │ GET /api/documents/?search=rapport&tags=Finance   
     ▼                                                    
┌─────────────────┐                                      
│  Backend API    │                                      
│  DocumentList   │                                      
└────┬────────────┘                                      
     │                                                    
     │ 1. Appliquer filtres permissions                 
     │    - Owner = user                                 
     │    - visibility = PUBLIC                          
     │    - Role-based access                            
     │                                                    
     │ 2. Filtres de recherche                          
     │    Q(title__icontains=search) |                   
     │    Q(description__icontains=search) |             
     │    Q(snippet__icontains=search)                   
     │                                                    
     │ 3. Filtres tags                                   
     │    .filter(tags__name__in=tags)                   
     │                                                    
     │ 4. Ordering & Pagination                          
     │    .order_by('-created_at')                       
     │                                                    
     │ 5. Sérialiser résultats                           
     ▼                                                    
┌──────────┐                                              
│  Client  │                                              
│  {count, results[]}                                    
└──────────┘                                              
```

---

## 🤖 Service IA - Architecture Détaillée

### Composants

```
┌────────────────────────────────────────────────┐
│           AIService (ai_service.py)            │
├────────────────────────────────────────────────┤
│                                                 │
│  ┌──────────────────────────────────────────┐ │
│  │  analyze_document(text)                  │ │
│  │  ├─► generate_summary(text)              │ │
│  │  │   └─► Ollama.generate(mistral:7b)    │ │
│  │  │                                        │ │
│  │  └─► extract_keywords(text)              │ │
│  │      └─► Ollama.generate(mistral:7b)    │ │
│  └──────────────────────────────────────────┘ │
│                                                 │
│  Configuration:                                 │
│  - Model: mistral:7b                           │
│  - Host: http://ollama:11434                   │
│  - Timeout: 60s                                │
│  - Temperature: 0.3 (résumé), 0.2 (keywords)  │
│                                                 │
└────────────────────────────────────────────────┘
```

### Prompts Utilisés

**Résumé:**
```
Tu es un assistant spécialisé dans l'analyse de documents.
Génère un résumé concis et pertinent en français du document suivant (maximum 150 mots).
Le résumé doit capturer les points principaux et les idées clés.

Document:
{text[:4000]}

Résumé:
```

**Mots-clés:**
```
Tu es un assistant spécialisé dans l'analyse de documents.
Extrait exactement 7 mots-clés ou expressions clés qui représentent les thèmes principaux du document suivant.
Réponds uniquement avec les mots-clés séparés par des virgules, sans numérotation ni explication.

Document:
{text[:4000]}

Mots-clés:
```

### Performance

| Métrique | Valeur | Notes |
|----------|--------|-------|
| Temps de réponse | 5-15s | Dépend de la longueur |
| Limite de texte | 4000 chars | Pour éviter timeouts |
| Température (résumé) | 0.3 | Pour cohérence |
| Température (keywords) | 0.2 | Pour précision |
| Max tokens | 300 | ~150 mots |

---

## 🔐 Sécurité et Permissions

### Niveaux d'Autorisation

```
┌─────────────────────────────────────────────────┐
│              Matrice de Permissions              │
├─────────────────┬───────────────┬───────────────┤
│    Action       │   USER        │    ADMIN      │
├─────────────────┼───────────────┼───────────────┤
│ Voir ses docs   │      ✅       │      ✅       │
│ Voir docs PUBLIC│      ✅       │      ✅       │
│ Voir tous docs  │      ❌       │      ✅       │
│ Upload doc      │      ✅       │      ✅       │
│ Modifier son doc│      ✅       │      ✅       │
│ Modifier autres │      ❌       │      ✅       │
│ Supprimer son   │      ✅       │      ✅       │
│ Supprimer autres│      ❌       │      ✅       │
│ Gérer users     │      ❌       │      ✅       │
│ Voir stats      │ Ses stats     │ Toutes stats  │
└─────────────────┴───────────────┴───────────────┘
```

### Visibilité des Documents

```python
class Document:
    VISIBILITY_CHOICES = [
        ('PRIVATE', 'Privé'),          # Seul le propriétaire
        ('ROLE_BASED', 'Par rôle'),    # Selon le rôle de l'user
        ('PUBLIC', 'Public'),          # Tous les users auth
    ]
```

### JWT Configuration

```python
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(hours=1),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
}
```

---

## 📦 Modèles de Données

### Diagramme ER

```
┌─────────────────┐         ┌─────────────────┐
│      User       │         │  DocumentTag    │
├─────────────────┤         ├─────────────────┤
│ id (UUID) PK    │         │ id (UUID) PK    │
│ email           │         │ name            │
│ role            │         │ color           │
│ origin          │         └─────────────────┘
│ is_active       │                 │
└────────┬────────┘                 │
         │                           │
         │ 1:N                       │ M:N
         │                           │
         ▼                           ▼
┌─────────────────┐         ┌─────────────────┐
│    Document     │◄────────┤  Doc-Tag Link   │
├─────────────────┤  M:N    └─────────────────┘
│ id (UUID) PK    │
│ title           │
│ file            │         ┌─────────────────┐
│ owner FK        │────────►│ DocumentAnalysis│
│ visibility      │  1:1    ├─────────────────┤
│ analyzed        │         │ id (UUID) PK    │
│ mayan_doc_id    │         │ document FK     │
└────────┬────────┘         │ summary         │
         │                  │ key_points JSON │
         │ 1:N              │ model_used      │
         │                  └─────────────────┘
         ▼
┌─────────────────┐
│   Permission    │
├─────────────────┤
│ id (UUID) PK    │
│ document FK     │
│ type            │
│ user FK         │
│ role            │
│ start_time      │
│ end_time        │
│ status          │
└─────────────────┘
```

---

## 🔧 Configuration et Variables

### Variables d'Environnement Critiques

```env
# Django Core
DJANGO_SECRET_KEY          # Clé secrète Django (IMPORTANT)
DEBUG                      # Mode debug (True/False)
ALLOWED_HOSTS             # Hôtes autorisés

# Database
DATABASE_URL              # URL PostgreSQL complète
POSTGRES_DB               # Nom de la base
POSTGRES_USER             # Utilisateur DB
POSTGRES_PASSWORD         # Mot de passe DB

# IA Service
OLLAMA_HOST               # URL du service Ollama
OLLAMA_MODEL              # Modèle à utiliser (mistral:7b)
OLLAMA_TIMEOUT            # Timeout en secondes

# Mayan EDMS
MAYAN_HOST                # URL de Mayan
MAYAN_API_URL             # API endpoint
MAYAN_USERNAME            # User Mayan
MAYAN_PASSWORD            # Password Mayan

# Celery
REDIS_URL                 # URL Redis pour Celery
```

---

## 📈 Scalabilité

### Points d'Extension

1. **Horizontal Scaling**
   - Backend : Ajout de workers Django/Gunicorn
   - Celery : Ajout de workers Celery
   - Redis : Redis Cluster pour haute disponibilité

2. **Caching**
   - Redis pour cache applicatif
   - Cache Django pour requêtes fréquentes
   - Cache Nginx pour fichiers statiques

3. **Load Balancing**
   - Nginx reverse proxy
   - Round-robin pour backends
   - Session sticky pour WebSockets

4. **Database**
   - PostgreSQL read replicas
   - Connection pooling (PgBouncer)
   - Partitionnement des tables

---

## 🚀 Améliorations Futures

### Court Terme

- [ ] OCR pour images (Tesseract)
- [ ] Webhooks pour événements
- [ ] API de recherche sémantique avancée
- [ ] Export de documents (ZIP)

### Moyen Terme

- [ ] Versioning de documents
- [ ] Collaboration en temps réel
- [ ] Notifications push
- [ ] SSO complet (OIDC/SAML)

### Long Terme

- [ ] Modèle IA fine-tuné sur domaine spécifique
- [ ] Classification automatique de documents
- [ ] Détection d'anomalies
- [ ] Dashboard analytics avancé

---

## 📚 Références

- [Django REST Framework](https://www.django-rest-framework.org/)
- [Ollama Documentation](https://ollama.ai/docs)
- [Mistral AI](https://mistral.ai/)
- [Mayan EDMS](https://www.mayan-edms.com/)
- [Celery](https://docs.celeryproject.org/)
- [Docker Compose](https://docs.docker.com/compose/)

---

**Dernière mise à jour:** Décembre 2024  
**Version:** 1.0.0

