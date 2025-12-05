#!/bin/bash

echo "🚀 Démarrage du service Ollama..."

# Démarrer Ollama en arrière-plan
ollama serve &

# Attendre que le service soit prêt
echo "⏳ Attente du service Ollama..."
sleep 10

# Vérifier si le modèle Mistral est déjà téléchargé
if ollama list | grep -q "mistral:7b"; then
    echo "✅ Modèle Mistral 7B déjà présent"
else
    echo "📥 Téléchargement du modèle Mistral 7B..."
    ollama pull mistral:7b
    echo "✅ Modèle Mistral 7B téléchargé avec succès"
fi

echo "🎉 Service Ollama prêt avec Mistral 7B!"

# Garder le conteneur actif
wait


