#!/bin/bash

# Script rapide pour créer un compte admin avec valeurs par défaut
# Usage: ./scripts/quick-create-admin.sh

API_URL="http://159.69.127.212:8000"

# Couleurs
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}   Création Rapide d'Admin${NC}"
echo -e "${BLUE}========================================${NC}\n"

# Valeurs par défaut
EMAIL="superadmin@esa-tez.com"
USERNAME="superadmin"
FIRSTNAME="Super"
LASTNAME="Admin"
PASSWORD="SuperAdmin123!"

echo -e "${YELLOW}📝 Création du compte avec ces informations :${NC}"
echo -e "  Email: ${EMAIL}"
echo -e "  Username: ${USERNAME}"
echo -e "  Nom: ${FIRSTNAME} ${LASTNAME}"
echo -e "  Mot de passe: ${PASSWORD}\n"

echo -e "${YELLOW}🔄 Création du compte...${NC}"

RESPONSE=$(curl -s -X POST "${API_URL}/api/auth/register/" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"${EMAIL}\",
    \"username\": \"${USERNAME}\",
    \"first_name\": \"${FIRSTNAME}\",
    \"last_name\": \"${LASTNAME}\",
    \"password\": \"${PASSWORD}\",
    \"password_confirm\": \"${PASSWORD}\"
  }")

if echo "$RESPONSE" | grep -q '"user"'; then
  echo -e "${GREEN}✅ Compte créé avec succès !${NC}\n"
  
  echo -e "${BLUE}🔑 Identifiants de connexion :${NC}"
  echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "Email:       ${BLUE}${EMAIL}${NC}"
  echo -e "Mot de passe: ${BLUE}${PASSWORD}${NC}"
  echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  
  echo -e "\n${YELLOW}⚠️  IMPORTANT:${NC}"
  echo -e "   Le compte est créé avec le rôle USER."
  echo -e "   Pour le promouvoir en ADMIN, utilisez Django admin ou:"
  echo -e "   ${BLUE}python manage.py shell${NC}"
  echo -e "   ${BLUE}>>> from django.contrib.auth import get_user_model${NC}"
  echo -e "   ${BLUE}>>> User = get_user_model()${NC}"
  echo -e "   ${BLUE}>>> user = User.objects.get(email='${EMAIL}')${NC}"
  echo -e "   ${BLUE}>>> user.is_staff = True${NC}"
  echo -e "   ${BLUE}>>> user.is_superuser = True${NC}"
  echo -e "   ${BLUE}>>> user.save()${NC}"
  
else
  echo -e "${RED}❌ Échec de création${NC}"
  
  if echo "$RESPONSE" | grep -q "already exists"; then
    echo -e "${YELLOW}⚠️  Le compte existe déjà !${NC}\n"
    echo -e "${BLUE}Utilisez ces identifiants :${NC}"
    echo -e "  Email: ${EMAIL}"
    echo -e "  Mot de passe: ${PASSWORD}"
  else
    echo -e "${RED}Erreur :${NC}"
    echo "$RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$RESPONSE"
  fi
fi

echo -e "\n${BLUE}========================================${NC}\n"

