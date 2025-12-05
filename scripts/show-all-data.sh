#!/bin/bash

# Script pour afficher toutes les données de l'API
# Usage: ./scripts/show-all-data.sh

# Couleurs
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

API_URL="http://159.69.127.212:8000"
EMAIL="admin@esa-tez.com"
PASSWORD="admin123"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}   DONNÉES DE L'API ESA-TEZ${NC}"
echo -e "${BLUE}========================================${NC}\n"

# Connexion
echo -e "${YELLOW}🔐 Connexion...${NC}"
LOGIN=$(curl -s -X POST "${API_URL}/api/auth/login/" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"${EMAIL}\",\"password\":\"${PASSWORD}\"}")

TOKEN=$(echo $LOGIN | grep -o '"access":"[^"]*' | sed 's/"access":"//')

if [ -z "$TOKEN" ]; then
  echo -e "${RED}❌ Échec de connexion${NC}"
  exit 1
fi

echo -e "${GREEN}✅ Connecté${NC}\n"

# ==================== STATISTIQUES ====================
echo -e "${BLUE}📊 STATISTIQUES${NC}"
echo -e "${BLUE}========================================${NC}"

curl -s -X GET "${API_URL}/api/documents/stats/" \
  -H "Authorization: Bearer ${TOKEN}" | python3 -m json.tool 2>/dev/null || echo "{}"

# ==================== TOUS LES DOCUMENTS ====================
echo -e "\n${BLUE}📄 DOCUMENTS${NC}"
echo -e "${BLUE}========================================${NC}"

DOCS=$(curl -s -X GET "${API_URL}/api/documents/?page_size=100" \
  -H "Authorization: Bearer ${TOKEN}")

echo "$DOCS" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    docs = data.get('results', [])
    print(f'Total: {data.get(\"count\", 0)} documents\n')
    for i, doc in enumerate(docs[:10], 1):
        title = doc.get('title', 'Sans titre')
        analyzed = '✅' if doc.get('analyzed') else '❌'
        visibility = doc.get('visibility', 'N/A')
        owner = doc.get('owner', {}).get('display_name', 'N/A')
        tags = ', '.join([t if isinstance(t, str) else t.get('name', '') for t in doc.get('tags', [])])
        print(f'{i}. {title}')
        print(f'   Analysé: {analyzed} | Visibilité: {visibility} | Propriétaire: {owner}')
        if tags:
            print(f'   Tags: {tags}')
        print()
except:
    print('Erreur de parsing JSON')
" 2>/dev/null || echo "Aucun document"

# ==================== TAGS ====================
echo -e "${BLUE}🏷️  TAGS${NC}"
echo -e "${BLUE}========================================${NC}"

TAGS=$(curl -s -X GET "${API_URL}/api/documents/tags/" \
  -H "Authorization: Bearer ${TOKEN}")

echo "$TAGS" | python3 -c "
import sys, json
try:
    tags = json.load(sys.stdin)
    print(f'Total: {len(tags)} tags\n')
    for tag in tags:
        name = tag.get('name', 'N/A')
        color = tag.get('color', '#1D4ED8')
        print(f'• {name} ({color})')
except:
    print('Aucun tag')
" 2>/dev/null || echo "Aucun tag"

# ==================== UTILISATEURS ====================
echo -e "\n${BLUE}👥 UTILISATEURS${NC}"
echo -e "${BLUE}========================================${NC}"

USERS=$(curl -s -X GET "${API_URL}/api/auth/users/" \
  -H "Authorization: Bearer ${TOKEN}")

echo "$USERS" | python3 -c "
import sys, json
try:
    users = json.load(sys.stdin)
    if isinstance(users, list):
        print(f'Total: {len(users)} utilisateurs\n')
        for i, user in enumerate(users, 1):
            name = user.get('display_name', user.get('username', 'N/A'))
            email = user.get('email', 'N/A')
            role = '👑 ADMIN' if user.get('is_admin') else '👤 USER'
            status = '✅ Actif' if user.get('is_active') else '❌ Inactif'
            print(f'{i}. {name} ({email})')
            print(f'   Rôle: {role} | Statut: {status}')
            print()
    else:
        print('Format de réponse inattendu')
except Exception as e:
    print(f'Erreur: {str(e)}')
" 2>/dev/null || echo "Impossible de récupérer les utilisateurs"

echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}✅ Affichage terminé${NC}\n"

