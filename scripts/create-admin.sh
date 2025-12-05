#!/bin/bash

# Script pour créer un compte administrateur
# Usage: ./scripts/create-admin.sh

set -e

# Couleurs
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

API_URL="http://159.69.127.212:8000"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}   Création d'un Compte Admin${NC}"
echo -e "${BLUE}========================================${NC}\n"

# Demander les informations
echo -e "${YELLOW}📝 Informations du compte admin${NC}\n"

read -p "Email: " ADMIN_EMAIL
read -p "Nom d'utilisateur: " ADMIN_USERNAME
read -p "Prénom: " ADMIN_FIRSTNAME
read -p "Nom: " ADMIN_LASTNAME
read -sp "Mot de passe: " ADMIN_PASSWORD
echo
read -sp "Confirmez le mot de passe: " ADMIN_PASSWORD_CONFIRM
echo -e "\n"

# Vérifier que les mots de passe correspondent
if [ "$ADMIN_PASSWORD" != "$ADMIN_PASSWORD_CONFIRM" ]; then
  echo -e "${RED}❌ Les mots de passe ne correspondent pas${NC}"
  exit 1
fi

# Créer le compte
echo -e "${YELLOW}🔄 Création du compte...${NC}"

REGISTER_RESPONSE=$(curl -s -X POST "${API_URL}/api/auth/register/" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"${ADMIN_EMAIL}\",
    \"username\": \"${ADMIN_USERNAME}\",
    \"first_name\": \"${ADMIN_FIRSTNAME}\",
    \"last_name\": \"${ADMIN_LASTNAME}\",
    \"password\": \"${ADMIN_PASSWORD}\",
    \"password_confirm\": \"${ADMIN_PASSWORD_CONFIRM}\"
  }")

# Vérifier la création
if echo "$REGISTER_RESPONSE" | grep -q '"user"'; then
  echo -e "${GREEN}✅ Compte créé avec succès !${NC}\n"
  
  # Afficher les infos du compte
  echo -e "${BLUE}📋 Informations du compte :${NC}"
  echo "$REGISTER_RESPONSE" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    user = data.get('user', {})
    print(f'  Email: {user.get(\"email\")}')
    print(f'  Nom d\'utilisateur: {user.get(\"username\")}')
    print(f'  Nom complet: {user.get(\"display_name\")}')
    print(f'  Rôle: {\"ADMIN\" if user.get(\"is_admin\") else \"USER\"}')
    print(f'  Actif: {\"Oui\" if user.get(\"is_active\") else \"Non\"}')
except:
    pass
" 2>/dev/null
  
  echo -e "\n${YELLOW}⚠️  Note: Le compte créé a le rôle USER par défaut.${NC}"
  echo -e "${YELLOW}   Pour le promouvoir en ADMIN, contactez un administrateur système.${NC}"
  
else
  echo -e "${RED}❌ Échec de création du compte${NC}"
  echo -e "${RED}Réponse du serveur :${NC}"
  echo "$REGISTER_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$REGISTER_RESPONSE"
  exit 1
fi

echo -e "\n${BLUE}========================================${NC}"
echo -e "${GREEN}✅ Opération terminée${NC}\n"

