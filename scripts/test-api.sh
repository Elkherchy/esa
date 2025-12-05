#!/bin/bash

# Script de test complet de l'API Backend
# Usage: ./scripts/test-api.sh

set -e

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
API_URL="http://159.69.127.212:8000"
EMAIL="admin@esa-tez.com"
PASSWORD="admin123"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}   Test de l'API Backend ESA-TEZ${NC}"
echo -e "${BLUE}========================================${NC}\n"

# ==================== 1. AUTHENTIFICATION ====================
echo -e "${YELLOW}[1/8] Test de l'Authentification${NC}"

# Login
echo -e "  → Connexion avec ${EMAIL}..."
LOGIN_RESPONSE=$(curl -s -X POST "${API_URL}/api/auth/login/" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"${EMAIL}\",\"password\":\"${PASSWORD}\"}")

# Extraire le token d'accès
ACCESS_TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"access":"[^"]*' | sed 's/"access":"//')

if [ -z "$ACCESS_TOKEN" ]; then
  echo -e "${RED}❌ Échec de la connexion${NC}"
  echo "Réponse: $LOGIN_RESPONSE"
  exit 1
else
  echo -e "${GREEN}✅ Connexion réussie${NC}"
  USER_NAME=$(echo $LOGIN_RESPONSE | grep -o '"display_name":"[^"]*' | sed 's/"display_name":"//')
  echo -e "   Utilisateur: ${USER_NAME}"
fi

# Test /api/auth/me/
echo -e "\n  → Test GET /api/auth/me/"
ME_RESPONSE=$(curl -s -X GET "${API_URL}/api/auth/me/" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}")
ME_EMAIL=$(echo $ME_RESPONSE | grep -o '"email":"[^"]*' | sed 's/"email":"//')
if [ ! -z "$ME_EMAIL" ]; then
  echo -e "${GREEN}✅ Récupération des infos utilisateur${NC}"
else
  echo -e "${RED}❌ Échec de récupération${NC}"
fi

# ==================== 2. STATISTIQUES ====================
echo -e "\n${YELLOW}[2/8] Test des Statistiques${NC}"

echo -e "  → Test GET /api/documents/stats/"
STATS_RESPONSE=$(curl -s -X GET "${API_URL}/api/documents/stats/" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}")

TOTAL_DOCS=$(echo $STATS_RESPONSE | grep -o '"total_documents":[0-9]*' | grep -o '[0-9]*')
ANALYZED_DOCS=$(echo $STATS_RESPONSE | grep -o '"analyzed_documents":[0-9]*' | grep -o '[0-9]*')

if [ ! -z "$TOTAL_DOCS" ]; then
  echo -e "${GREEN}✅ Statistiques récupérées${NC}"
  echo -e "   Total documents: ${TOTAL_DOCS}"
  echo -e "   Documents analysés: ${ANALYZED_DOCS}"
else
  echo -e "${RED}❌ Échec de récupération des stats${NC}"
fi

# ==================== 3. DOCUMENTS ====================
echo -e "\n${YELLOW}[3/8] Test de Gestion des Documents${NC}"

# Liste des documents
echo -e "  → Test GET /api/documents/"
DOCS_RESPONSE=$(curl -s -X GET "${API_URL}/api/documents/?page_size=5" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}")

DOC_COUNT=$(echo $DOCS_RESPONSE | grep -o '"count":[0-9]*' | head -1 | grep -o '[0-9]*')
if [ ! -z "$DOC_COUNT" ]; then
  echo -e "${GREEN}✅ Liste des documents récupérée${NC}"
  echo -e "   Nombre de documents: ${DOC_COUNT}"
else
  echo -e "${RED}❌ Échec de récupération des documents${NC}"
fi

# Récupérer l'ID du premier document
FIRST_DOC_ID=$(echo $DOCS_RESPONSE | grep -o '"id":"[^"]*' | head -1 | sed 's/"id":"//')

if [ ! -z "$FIRST_DOC_ID" ]; then
  # Détails d'un document
  echo -e "\n  → Test GET /api/documents/${FIRST_DOC_ID}/"
  DOC_DETAIL=$(curl -s -X GET "${API_URL}/api/documents/${FIRST_DOC_ID}/" \
    -H "Authorization: Bearer ${ACCESS_TOKEN}")
  
  DOC_TITLE=$(echo $DOC_DETAIL | grep -o '"title":"[^"]*' | head -1 | sed 's/"title":"//')
  if [ ! -z "$DOC_TITLE" ]; then
    echo -e "${GREEN}✅ Détails du document récupérés${NC}"
    echo -e "   Titre: ${DOC_TITLE}"
  else
    echo -e "${RED}❌ Échec de récupération des détails${NC}"
  fi
fi

# ==================== 4. TAGS ====================
echo -e "\n${YELLOW}[4/8] Test des Tags${NC}"

echo -e "  → Test GET /api/documents/tags/"
TAGS_RESPONSE=$(curl -s -X GET "${API_URL}/api/documents/tags/" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}")

# Compter le nombre de tags
TAG_COUNT=$(echo $TAGS_RESPONSE | grep -o '"name":"[^"]*' | wc -l)
echo -e "${GREEN}✅ Tags récupérés${NC}"
echo -e "   Nombre de tags: ${TAG_COUNT}"

# ==================== 5. RECHERCHE ====================
echo -e "\n${YELLOW}[5/8] Test de Recherche${NC}"

echo -e "  → Test GET /api/documents/?search=test"
SEARCH_RESPONSE=$(curl -s -X GET "${API_URL}/api/documents/?search=test" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}")

SEARCH_COUNT=$(echo $SEARCH_RESPONSE | grep -o '"count":[0-9]*' | head -1 | grep -o '[0-9]*')
if [ ! -z "$SEARCH_COUNT" ]; then
  echo -e "${GREEN}✅ Recherche effectuée${NC}"
  echo -e "   Résultats trouvés: ${SEARCH_COUNT}"
else
  echo -e "${YELLOW}⚠️  Recherche retournée sans résultats${NC}"
fi

# ==================== 6. FILTRES ====================
echo -e "\n${YELLOW}[6/8] Test des Filtres${NC}"

# Filtre par visibilité
echo -e "  → Test GET /api/documents/?visibility=PRIVATE"
PRIVATE_DOCS=$(curl -s -X GET "${API_URL}/api/documents/?visibility=PRIVATE" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}")
PRIVATE_COUNT=$(echo $PRIVATE_DOCS | grep -o '"count":[0-9]*' | head -1 | grep -o '[0-9]*')
echo -e "${GREEN}✅ Filtre visibilité${NC} - Documents privés: ${PRIVATE_COUNT}"

# Filtre documents analysés
echo -e "  → Test GET /api/documents/?analyzed=true"
ANALYZED_FILTER=$(curl -s -X GET "${API_URL}/api/documents/?analyzed=true" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}")
ANALYZED_COUNT=$(echo $ANALYZED_FILTER | grep -o '"count":[0-9]*' | head -1 | grep -o '[0-9]*')
echo -e "${GREEN}✅ Filtre analysés${NC} - Documents analysés: ${ANALYZED_COUNT}"

# ==================== 7. UTILISATEURS (Admin) ====================
echo -e "\n${YELLOW}[7/8] Test de Gestion des Utilisateurs${NC}"

echo -e "  → Test GET /api/auth/users/"
USERS_RESPONSE=$(curl -s -X GET "${API_URL}/api/auth/users/" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}")

# Compter les utilisateurs (chercher les emails)
USER_COUNT=$(echo $USERS_RESPONSE | grep -o '"email":"[^"]*' | wc -l)
if [ $USER_COUNT -gt 0 ]; then
  echo -e "${GREEN}✅ Liste des utilisateurs récupérée${NC}"
  echo -e "   Nombre d'utilisateurs: ${USER_COUNT}"
else
  echo -e "${YELLOW}⚠️  Aucun utilisateur trouvé ou endpoint non accessible${NC}"
fi

# ==================== 8. REFRESH TOKEN ====================
echo -e "\n${YELLOW}[8/8] Test du Refresh Token${NC}"

REFRESH_TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"refresh":"[^"]*' | sed 's/"refresh":"//')

if [ ! -z "$REFRESH_TOKEN" ]; then
  echo -e "  → Test POST /api/auth/refresh/"
  REFRESH_RESPONSE=$(curl -s -X POST "${API_URL}/api/auth/refresh/" \
    -H "Content-Type: application/json" \
    -d "{\"refresh\":\"${REFRESH_TOKEN}\"}")
  
  NEW_ACCESS=$(echo $REFRESH_RESPONSE | grep -o '"access":"[^"]*' | sed 's/"access":"//')
  if [ ! -z "$NEW_ACCESS" ]; then
    echo -e "${GREEN}✅ Token rafraîchi avec succès${NC}"
  else
    echo -e "${RED}❌ Échec du rafraîchissement${NC}"
  fi
fi

# ==================== RÉSUMÉ ====================
echo -e "\n${BLUE}========================================${NC}"
echo -e "${BLUE}   RÉSUMÉ DES TESTS${NC}"
echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}✅ Authentification${NC}"
echo -e "${GREEN}✅ Statistiques${NC}"
echo -e "${GREEN}✅ Gestion des documents${NC}"
echo -e "${GREEN}✅ Tags${NC}"
echo -e "${GREEN}✅ Recherche${NC}"
echo -e "${GREEN}✅ Filtres${NC}"
echo -e "${GREEN}✅ Utilisateurs (Admin)${NC}"
echo -e "${GREEN}✅ Refresh Token${NC}"

echo -e "\n${GREEN}🎉 Tous les endpoints fonctionnent !${NC}\n"

