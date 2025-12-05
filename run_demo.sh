#!/bin/bash

# Script de lancement de la démonstration ESA-TEZ API
# Usage: ./run_demo.sh [--url URL] [--test TYPE]

set -e

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration par défaut
DEFAULT_URL="http://localhost:8001"
DEFAULT_TEST="all"

# Affiche l'aide
show_help() {
    echo -e "${BLUE}Script de démonstration ESA-TEZ API${NC}"
    echo ""
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  --url URL     URL de base de l'API (défaut: $DEFAULT_URL)"
    echo "  --test TYPE   Type de test: auth, users, documents, all (défaut: $DEFAULT_TEST)"
    echo "  --help        Affiche cette aide"
    echo ""
    echo "Exemples:"
    echo "  $0                                    # Exécute tous les tests"
    echo "  $0 --test auth                        # Teste uniquement l'authentification"
    echo "  $0 --url http://api.example.com       # Utilise une URL différente"
    echo "  $0 --test documents --url localhost:8000  # Teste les documents sur port 8000"
}

# Parse des arguments
URL="$DEFAULT_URL"
TEST="$DEFAULT_TEST"

while [[ $# -gt 0 ]]; do
    case $1 in
        --url)
            URL="$2"
            shift 2
            ;;
        --test)
            TEST="$2"
            shift 2
            ;;
        --help)
            show_help
            exit 0
            ;;
        *)
            echo -e "${RED}Option inconnue: $1${NC}"
            show_help
            exit 1
            ;;
    esac
done

# Vérification que Python est disponible
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}❌ Python 3 n'est pas installé ou introuvable${NC}"
    exit 1
fi

# Vérification que requests est disponible
if ! python3 -c "import requests" 2>/dev/null; then
    echo -e "${YELLOW}⚠️  Le module 'requests' n'est pas installé${NC}"
    echo -e "${BLUE}Installation en cours...${NC}"
    
    if command -v pip3 &> /dev/null; then
        pip3 install requests
    elif command -v pip &> /dev/null; then
        pip install requests
    else
        echo -e "${RED}❌ pip n'est pas disponible. Installez 'requests' manuellement:${NC}"
        echo "   python3 -m pip install requests"
        exit 1
    fi
fi

# Vérification optionnelle de reportlab pour générer de vrais PDFs
if ! python3 -c "import reportlab" 2>/dev/null; then
    echo -e "${YELLOW}ℹ️  Le module 'reportlab' n'est pas installé (optionnel)${NC}"
    echo -e "${BLUE}   Pour générer de vrais PDFs, installez-le: pip3 install reportlab${NC}"
    echo -e "${BLUE}   Le script fonctionnera avec des PDFs simplifiés sans ce module.${NC}"
fi

echo -e "${GREEN}🚀 Lancement de la démonstration ESA-TEZ API${NC}"
echo -e "${BLUE}📍 URL: ${URL}${NC}"
echo -e "${BLUE}🧪 Type de test: ${TEST}${NC}"
echo ""

# Test de connectivité de base
echo -e "${BLUE}🔍 Test de connectivité...${NC}"
if curl -s --max-time 10 "$URL" >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Serveur accessible${NC}"
else
    echo -e "${YELLOW}⚠️  Impossible de joindre le serveur à $URL${NC}"
    echo -e "${YELLOW}   Le script va continuer, mais vérifiez que le serveur fonctionne.${NC}"
fi

echo ""

# Exécution du script Python
echo -e "${GREEN}▶️  Exécution du script de démonstration...${NC}"
python3 demo_script.py --url "$URL" --test "$TEST"

exit_code=$?

if [ $exit_code -eq 0 ]; then
    echo -e "\n${GREEN}✅ Démonstration terminée avec succès!${NC}"
else
    echo -e "\n${RED}❌ Démonstration terminée avec des erreurs (code: $exit_code)${NC}"
fi

exit $exit_code
