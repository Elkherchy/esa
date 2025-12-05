#!/bin/bash

# Script de démarrage simplifié pour ESA-TEZ
# Usage: ./start.sh

set -e

echo "🚀 Démarrage de ESA-TEZ - Coffre-Fort Documentaire Intelligent"
echo "================================================================"
echo ""

# Vérifier que Docker est installé
if ! command -v docker &> /dev/null; then
    echo "❌ Docker n'est pas installé. Veuillez installer Docker Desktop."
    exit 1
fi

# Vérifier que Docker Compose est disponible
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose n'est pas disponible."
    exit 1
fi

echo "✅ Docker est installé"
echo ""

# Vérifier si .env existe
if [ ! -f .env ]; then
    echo "⚠️  Fichier .env non trouvé. Création à partir de .env.example..."
    if [ -f .env.example ]; then
        cp .env.example .env
        echo "✅ Fichier .env créé"
    else
        echo "❌ .env.example non trouvé"
        exit 1
    fi
fi

echo "📦 Construction et démarrage des services Docker..."
echo ""
echo "⏳ Cela peut prendre 5-10 minutes au premier démarrage"
echo "   (téléchargement de Mistral 7B ~4.1 GB)"
echo ""

# Démarrer les services
docker-compose up --build -d

echo ""
echo "⏳ Attente du démarrage des services..."
sleep 10

# Vérifier l'état des services
echo ""
echo "📊 État des services:"
docker-compose ps

echo ""
echo "================================================================"
echo "✅ ESA-TEZ est démarré !"
echo "================================================================"
echo ""
echo "📡 Services disponibles:"
echo "   - API Backend:     http://localhost:8001"
echo "   - Admin Django:    http://localhost:8001/admin"
echo "   - Mayan EDMS:      http://localhost:8002"
echo ""
echo "🔑 Compte admin par défaut:"
echo "   Email:    admin@esa-tez.com"
echo "   Password: admin123"
echo ""
echo "📚 Documentation:"
echo "   - README.md     : Guide complet"
echo "   - TESTING.md    : Guide de test"
echo ""
echo "🔍 Commandes utiles:"
echo "   - Voir les logs:        docker-compose logs -f"
echo "   - Arrêter:              docker-compose down"
echo "   - Redémarrer:           docker-compose restart"
echo ""
echo "⚠️  Note: Attendez ~2 minutes pour le téléchargement de Mistral 7B"
echo "   Vérifiez: docker-compose logs ollama"
echo ""



