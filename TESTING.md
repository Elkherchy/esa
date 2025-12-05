# 🧪 Guide de Test - ESA-TEZ

Ce document décrit comment tester toutes les fonctionnalités du système.

---

## 📋 Prérequis

1. Système démarré avec `docker-compose up`
2. Tous les services opérationnels (vérifier avec `docker-compose ps`)
3. Ollama a téléchargé Mistral 7B (vérifier les logs : `docker-compose logs ollama`)

---

## ✅ Checklist des Tests

### 1. Infrastructure Docker

```bash
# Vérifier que tous les services sont UP
docker-compose ps

# Résultat attendu : tous les services avec state "Up"
# - esa-tez-backend (Up)
# - esa-tez-db (Up, healthy)
# - esa-tez-ollama (Up)
# - esa-tez-mayan (Up)
# - esa-tez-redis (Up, healthy)
# - esa-tez-celery (Up)
```

### 2. Test de l'API Backend

#### a) Healthcheck
```bash
curl http://localhost:8001/admin/
# Devrait retourner la page d'admin Django (200 OK)
```

#### b) Connexion Admin
```bash
curl -X POST http://localhost:8001/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@esa-tez.com",
    "password": "admin123"
  }'
```

**Résultat attendu :**
```json
{
  "user": {
    "id": "...",
    "email": "admin@esa-tez.com",
    "role": "ADMIN",
    "display_name": "Admin ESA-TEZ"
  },
  "tokens": {
    "access": "eyJ0eXAiOiJKV1...",
    "refresh": "eyJ0eXAiOiJKV1..."
  },
  "message": "Connexion réussie"
}
```

**⚠️ Important :** Copier le token `access` pour les tests suivants.

### 3. Test Upload de Document

#### Créer un fichier de test
```bash
# Créer un PDF de test
echo "Ceci est un document de test pour l'analyse IA.
Ce document contient plusieurs paragraphes de texte qui seront analysés par Mistral 7B.
L'objectif est de tester les capacités de résumé automatique et d'extraction de mots-clés.
Le système devrait être capable d'identifier les thèmes principaux de ce document." > test.txt

# Ou utiliser un vrai PDF si disponible
```

#### Upload via curl
```bash
export ACCESS_TOKEN="votre_token_ici"

curl -X POST http://localhost:8001/api/documents/ \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -F "file=@test.txt" \
  -F "title=Document de Test IA" \
  -F "description=Test de l'analyse automatique" \
  -F "visibility=PRIVATE"
```

**Résultat attendu :**
```json
{
  "id": "uuid-du-document",
  "title": "Document de Test IA",
  "description": "Test de l'analyse automatique",
  "file": "/media/documents/2024/12/test.txt",
  "owner": {...},
  "analyzed": false,  // Sera true après analyse
  ...
}
```

### 4. Test de l'Analyse IA

#### a) Vérifier que Ollama est opérationnel
```bash
docker-compose exec ollama ollama list
# Devrait afficher mistral:7b
```

#### b) Lancer l'analyse manuellement
```bash
export DOCUMENT_ID="uuid-du-document"

curl -X POST http://localhost:8001/api/documents/$DOCUMENT_ID/analyze/ \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

**Résultat attendu :**
```json
{
  "message": "Analyse lancée",
  "task_id": "...",
  "document_id": "..."
}
```

#### c) Vérifier les logs Celery
```bash
docker-compose logs -f celery
# Devrait afficher :
# - "Début de l'analyse du document..."
# - "Résumé généré en X.XXs"
# - "Mots-clés extraits en X.XXs"
# - "Analyse du document terminée avec succès"
```

#### d) Récupérer le document analysé
```bash
curl -X GET http://localhost:8001/api/documents/$DOCUMENT_ID/ \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

**Résultat attendu :**
```json
{
  "id": "...",
  "title": "Document de Test IA",
  "analyzed": true,
  "analysis": {
    "summary": "Ce document présente...",  // Résumé généré par Mistral
    "key_points": [
      "analyse IA",
      "résumé automatique",
      "extraction de mots-clés",
      ...
    ],
    "model_used": "mistral:7b",
    "analyzed_at": "2024-12-05T..."
  },
  ...
}
```

### 5. Test de Recherche

```bash
curl -X GET "http://localhost:8001/api/documents/?search=test" \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

### 6. Test des Permissions

#### a) Créer un utilisateur normal
```bash
curl -X POST http://localhost:8001/api/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@test.com",
    "username": "testuser",
    "first_name": "Test",
    "last_name": "User",
    "password": "testpass123",
    "password_confirm": "testpass123"
  }'
```

#### b) Tester l'accès aux documents
```bash
# Se connecter avec le nouvel utilisateur
curl -X POST http://localhost:8001/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@test.com",
    "password": "testpass123"
  }'

# Essayer d'accéder aux documents
# L'utilisateur ne devrait voir que ses propres documents + documents publics
```

### 7. Test de Mayan EDMS

```bash
# Accéder à Mayan
open http://localhost:8001

# Login par défaut :
# Username: admin
# Password: admin
```

**À vérifier :**
- [ ] Les documents uploadés via l'API apparaissent dans Mayan
- [ ] Les métadonnées sont synchronisées

### 8. Test des Statistiques (Admin)

```bash
curl -X GET http://localhost:8001/api/documents/stats/ \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

**Résultat attendu :**
```json
{
  "total_documents": 1,
  "analyzed_documents": 1,
  "analyzed_percentage": 100.0
}
```

---

## 🎬 Scénario de Démonstration Complet

### Préparation
1. Démarrer le système : `docker-compose up`
2. Attendre que tous les services soient prêts (~5 min au premier démarrage)
3. Vérifier Ollama : `docker-compose logs ollama | grep "Mistral 7B"`

### Démonstration (5 minutes)

**0:00 - 0:30 : Présentation de l'architecture**
```bash
docker-compose ps
# Montrer les 6 services opérationnels
```

**0:30 - 1:30 : Connexion et Upload**
```bash
# Se connecter
curl -X POST http://localhost:8001/api/auth/login/ ...

# Uploader un document PDF
curl -X POST http://localhost:8001/api/documents/ ...
```

**1:30 - 3:00 : Analyse IA en Direct**
```bash
# Suivre les logs Celery
docker-compose logs -f celery

# Montrer :
# - Extraction du texte
# - Appel à Ollama/Mistral
# - Génération du résumé
# - Extraction des mots-clés
```

**3:00 - 4:00 : Résultats de l'Analyse**
```bash
# Récupérer le document avec analyse
curl -X GET http://localhost:8001/api/documents/$DOCUMENT_ID/

# Montrer :
# - Le résumé généré
# - Les mots-clés extraits
# - Le modèle utilisé (mistral:7b)
```

**4:00 - 5:00 : Mayan EDMS**
```bash
# Ouvrir Mayan
open http://localhost:8001

# Montrer :
# - Le document stocké
# - Les métadonnées synchronisées
# - L'interface native de Mayan
```

---

## 📊 Métriques de Performance

### Temps d'Analyse Attendus

| Taille Document | Temps d'Analyse | Résultat |
|-----------------|-----------------|----------|
| < 1 page | 3-5 secondes | ✅ Excellent |
| 1-5 pages | 5-15 secondes | ✅ Bon |
| 5-10 pages | 15-30 secondes | ⚠️ Acceptable |
| > 10 pages | 30-60 secondes | ⚠️ Limite |

### Utilisation des Ressources

```bash
# Vérifier l'utilisation des ressources
docker stats

# Résultats typiques :
# - ollama: 2-4 GB RAM pendant l'analyse
# - backend: 200-500 MB RAM
# - db: 50-100 MB RAM
```

---

## 🐛 Troubleshooting

### Problème : Ollama ne télécharge pas Mistral

```bash
# Vérifier les logs
docker-compose logs ollama

# Solution : télécharger manuellement
docker-compose exec ollama ollama pull mistral:7b
```

### Problème : Analyse IA échoue

```bash
# Vérifier que Ollama répond
docker-compose exec backend curl http://ollama:11434

# Relancer Celery
docker-compose restart celery
```

### Problème : Base de données non accessible

```bash
# Vérifier PostgreSQL
docker-compose exec db pg_isready -U esa_user

# Relancer les migrations
docker-compose exec backend python manage.py migrate
```

---

## ✅ Checklist Finale

- [ ] Tous les services Docker sont UP
- [ ] Mistral 7B est téléchargé dans Ollama
- [ ] Connexion API fonctionne
- [ ] Upload de document fonctionne
- [ ] Analyse IA génère un résumé pertinent
- [ ] Les mots-clés sont extraits correctement
- [ ] Document visible dans Mayan EDMS
- [ ] Permissions fonctionnent (admin vs user)
- [ ] Recherche fonctionne
- [ ] Statistiques affichées correctement

---

**🎉 Système prêt pour la démonstration !**



