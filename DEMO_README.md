# 🚀 Script de Démonstration ESA-TEZ API

Ce répertoire contient un script de démonstration complet qui teste tous les endpoints de l'API ESA-TEZ avec des données d'exemple réalistes.

## 📁 Fichiers

- **`demo_script.py`** - Script Python principal de démonstration
- **`run_demo.sh`** - Script shell pour faciliter le lancement 
- **`DEMO_README.md`** - Ce fichier de documentation

## ⚡ Démarrage Rapide

### Option 1: Script shell (recommandé)

```bash
# Rendre le script exécutable
chmod +x run_demo.sh

# Exécuter la démonstration complète
./run_demo.sh

# Ou avec des options spécifiques
./run_demo.sh --test auth
./run_demo.sh --url http://localhost:8000 --test documents
```

### Option 2: Script Python direct

```bash
# Installer les dépendances
pip3 install requests reportlab  # reportlab optionnel

# Exécuter
python3 demo_script.py
python3 demo_script.py --url http://localhost:8000 --test auth
```

## 🧪 Types de Tests Disponibles

| Type | Description | Endpoints testés |
|------|-------------|------------------|
| `all` | Tous les tests (défaut) | Tous les endpoints disponibles |
| `auth` | Authentification | register, login, refresh, me, logout |
| `users` | Gestion utilisateurs | users list/detail/update (admin) |
| `documents` | Gestion documents | upload, list, detail, analyze, update, tags, stats |

## 📋 Fonctionnalités Testées

### 🔐 Authentification
- ✅ Inscription de nouveaux utilisateurs
- ✅ Connexion avec email/mot de passe
- ✅ Rafraîchissement des tokens JWT
- ✅ Récupération des infos utilisateur
- ✅ Déconnexion

### 👥 Gestion des Utilisateurs (Admin)
- ✅ Liste des utilisateurs avec filtres
- ✅ Détails d'un utilisateur spécifique
- ✅ Mise à jour des rôles et statuts

### 📄 Gestion des Documents
- ✅ Upload de fichiers PDF avec métadonnées
- ✅ Liste avec filtres avancés (recherche, tags, visibilité)
- ✅ Récupération des détails d'un document
- ✅ Analyse IA automatique et manuelle
- ✅ Mise à jour des métadonnées
- ✅ Gestion des tags
- ✅ Statistiques globales

### 🤖 Analyse IA
- ✅ Génération automatique de résumés
- ✅ Extraction de mots-clés
- ✅ Polling pour suivre le statut d'analyse

## 📊 Données de Test Générées

Le script crée automatiquement:

### Utilisateurs
```json
{
  "email": "jean.dupont@example.com",
  "username": "jeandupont",
  "first_name": "Jean", 
  "last_name": "Dupont"
}
```

### Documents PDF
- **Rapport Financier Q4 2024** (Privé, tags: Finance,Rapport,2024)
- **Manuel Utilisateur ESA-TEZ** (Public, tags: Documentation,Manuel,Guide)  
- **Étude de Marché 2024** (Basé sur rôle, tags: Marketing,Étude,Stratégie)

Les PDFs contiennent du texte réaliste pour tester l'analyse IA.

## 🔧 Configuration

### Variables d'environnement
```bash
export API_URL="http://localhost:8001"  # URL de l'API
export DEMO_CLEANUP="yes"                # Nettoyer après les tests
```

### Prérequis
- Python 3.6+
- Module `requests` (installé automatiquement)
- Module `reportlab` (optionnel, pour de vrais PDFs)
- Serveur ESA-TEZ fonctionnel

## 📈 Exemple de Sortie

```
🚀 Démarrage de la démonstration ESA-TEZ API
🌐 URL de base: http://localhost:8001
📝 Ce script va tester tous les endpoints disponibles

============================================================
🚀 AUTHENTIFICATION - Inscription
============================================================
✅ Inscription jean.dupont@example.com - Status: 201
{
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "jean.dupont@example.com",
    "display_name": "Jean Dupont",
    "role": "USER"
  },
  "tokens": {
    "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
    "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
  }
}...

============================================================
🚀 DOCUMENTS - Upload
============================================================
✅ Upload Rapport Financier Q4 2024 - Status: 201
{
  "id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
  "title": "Rapport Financier Q4 2024",
  "file_url": "http://localhost:8001/media/documents/2024/12/sample_doc_1.pdf",
  "analyzed": false,
  "tags": [
    {"name": "Finance", "color": "#1D4ED8"}
  ]
}...

============================================================
🚀 DOCUMENTS - Analyse IA  
============================================================
✅ Lancement analyse 7c9e6679-7425-40de-944b-e07fc1f90ae7 - Status: 200
⏳ Attente de l'analyse (jusqu'à 30 secondes)...
✅ Analyse terminée!
📝 Résumé: Ce rapport présente une analyse détaillée des performances financières...
🔍 Points clés: Croissance de 23%, Expansion internationale, Rentabilité améliorée
```

## 🚨 Gestion des Erreurs

Le script gère automatiquement:
- **Connexion échoue**: Affiche le message d'erreur et continue
- **Upload échoue**: Passe au document suivant
- **Analyse timeout**: Signale mais continue les autres tests
- **Token expiré**: Tente un rafraîchissement automatique

## 🧹 Nettoyage

Le script propose automatiquement de supprimer les données de test:
```
🧹 Voulez-vous supprimer les documents de test? (y/N): y

============================================================
🚀 NETTOYAGE - Suppression des documents de test  
============================================================
✅ Suppression Rapport Financier Q4 2024 - Status: 204
✅ Suppression Manuel Utilisateur ESA-TEZ - Status: 204
✅ Suppression Étude de Marché 2024 - Status: 204
```

## 🔧 Personnalisation

### Modifier les données de test

Éditez `demo_script.py` pour personnaliser:

```python
# Utilisateurs de test
users_data = [
    {
        "email": "votre.email@example.com",
        "username": "votreusername",
        "first_name": "Votre",
        "last_name": "Nom",
        "password": "VotreMotDePasse123",
        "password_confirm": "VotreMotDePasse123"
    }
]

# Documents de test  
test_documents = [
    {
        "title": "Votre Document",
        "description": "Description personnalisée",
        "visibility": "PRIVATE",
        "tags": "Tag1,Tag2,Tag3"
    }
]
```

### Ajouter de nouveaux tests

```python
def test_custom_endpoint(self):
    """Teste un endpoint personnalisé"""
    if not self.access_token:
        return
        
    headers = {"Authorization": f"Bearer {self.access_token}"}
    response = requests.get(
        f"{self.base_url}/api/custom/endpoint/",
        headers=headers
    )
    self.print_result("Test personnalisé", response)
```

## 📖 Utilisation en CI/CD

Le script peut être intégré dans des pipelines:

```yaml
# .github/workflows/api-demo.yml
name: API Demo Tests
on: [push, pull_request]

jobs:
  demo:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Python
        uses: actions/setup-python@v2
        with:
          python-version: '3.8'
      - name: Install dependencies
        run: pip install requests reportlab
      - name: Start ESA-TEZ server
        run: docker-compose up -d
      - name: Wait for server
        run: sleep 30
      - name: Run demo script
        run: python3 demo_script.py --test all
```

## 🤝 Contribution

Pour ajouter de nouveaux tests:

1. Forkez le projet
2. Créez une branche: `git checkout -b feature/nouveau-test`
3. Ajoutez vos tests dans `demo_script.py`
4. Testez: `./run_demo.sh`
5. Commitez: `git commit -m "Ajout test XXX"`
6. Push: `git push origin feature/nouveau-test`
7. Créez une Pull Request

## 📞 Support

En cas de problème:

1. Vérifiez que le serveur ESA-TEZ fonctionne
2. Vérifiez les logs du serveur Django
3. Testez les endpoints manuellement avec curl
4. Consultez la documentation API dans `API_EXAMPLES.md`

## 📜 Licence

Ce script de démonstration suit la même licence que le projet ESA-TEZ principal.

---

**🎯 Objectif**: Fournir une démonstration complète et automatisée des capacités de l'API ESA-TEZ pour les développeurs, testeurs, et parties prenantes.
