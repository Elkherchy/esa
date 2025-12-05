FROM ollama/ollama:latest

# Créer le répertoire pour les modèles
RUN mkdir -p /root/.ollama

# Copier le script d'initialisation
COPY init.sh /init.sh
RUN chmod +x /init.sh

# Exposer le port Ollama
EXPOSE 11434

# Lancer Ollama et télécharger Mistral
ENTRYPOINT ["/init.sh"]



