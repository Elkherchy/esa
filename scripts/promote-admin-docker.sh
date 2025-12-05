#!/bin/bash

# Script pour promouvoir un utilisateur en ADMIN via Docker
# À exécuter sur le serveur backend (159.69.127.212)

# Couleurs
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}   Promotion en ADMIN via Docker${NC}"
echo -e "${BLUE}========================================${NC}\n"

# Configuration
EMAIL="${1:-superadmin@esa-tez.com}"
CONTAINER_NAME="${2:-web}"  # Nom par défaut du conteneur

echo -e "${YELLOW}📧 Email à promouvoir: ${EMAIL}${NC}"
echo -e "${YELLOW}🐳 Conteneur Docker: ${CONTAINER_NAME}${NC}\n"

# Vérifier si le conteneur existe
echo -e "${YELLOW}🔍 Vérification du conteneur...${NC}"
if ! docker ps --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
    echo -e "${RED}❌ Conteneur '${CONTAINER_NAME}' introuvable!${NC}\n"
    echo -e "${YELLOW}📋 Conteneurs disponibles:${NC}"
    docker ps --format "   - {{.Names}}"
    echo -e "\n${YELLOW}💡 Usage: $0 <email> <container_name>${NC}"
    echo -e "   Exemple: $0 superadmin@esa-tez.com django_web_1"
    exit 1
fi

echo -e "${GREEN}✅ Conteneur trouvé${NC}\n"

# Script Python pour promouvoir l'utilisateur
PYTHON_SCRIPT="
from django.contrib.auth import get_user_model
User = get_user_model()
try:
    user = User.objects.get(email='${EMAIL}')
    print('📋 Utilisateur trouvé:')
    print(f'   Email: {user.email}')
    print(f'   Username: {user.username}')
    print(f'   is_staff (avant): {user.is_staff}')
    print(f'   is_superuser (avant): {user.is_superuser}')
    print()
    
    user.is_staff = True
    user.is_superuser = True
    user.is_active = True
    user.save()
    
    print('✅ Promotion réussie!')
    print(f'   is_staff (après): {user.is_staff}')
    print(f'   is_superuser (après): {user.is_superuser}')
    print()
    print('🎉 ${EMAIL} est maintenant SUPER ADMIN!')
except User.DoesNotExist:
    print('❌ Utilisateur ${EMAIL} introuvable!')
    print('💡 Créez d\'abord le compte avec: ./scripts/quick-create-admin.sh')
    exit(1)
except Exception as e:
    print(f'❌ Erreur: {str(e)}')
    exit(1)
"

echo -e "${YELLOW}🔄 Promotion en cours...${NC}\n"

# Exécuter le script dans le conteneur
docker exec -i ${CONTAINER_NAME} python manage.py shell <<EOF
${PYTHON_SCRIPT}
EOF

EXIT_CODE=$?

if [ $EXIT_CODE -eq 0 ]; then
    echo -e "\n${GREEN}========================================${NC}"
    echo -e "${GREEN}   ✅ PROMOTION TERMINÉE AVEC SUCCÈS${NC}"
    echo -e "${GREEN}========================================${NC}"
    echo -e "\n${YELLOW}🔑 Vous pouvez maintenant vous connecter avec:${NC}"
    echo -e "   Email: ${BLUE}${EMAIL}${NC}"
    echo -e "   Rôle: ${GREEN}SUPER ADMIN${NC}"
else
    echo -e "\n${RED}========================================${NC}"
    echo -e "${RED}   ❌ ÉCHEC DE LA PROMOTION${NC}"
    echo -e "${RED}========================================${NC}"
fi

echo ""

