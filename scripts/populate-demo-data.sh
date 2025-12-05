#!/bin/bash

# Script pour peupler la base de données avec des données de démonstration
# Usage: ./scripts/populate-demo-data.sh

set -e

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
API_URL="http://159.69.127.212:8000"
EMAIL="admin@esa-tez.com"
PASSWORD="admin123"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}   Peuplement de la Base de Données${NC}"
echo -e "${BLUE}========================================${NC}\n"

# ==================== CONNEXION ====================
echo -e "${YELLOW}[1/4] Connexion à l'API...${NC}"

LOGIN_RESPONSE=$(curl -s -X POST "${API_URL}/api/auth/login/" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"${EMAIL}\",\"password\":\"${PASSWORD}\"}")

ACCESS_TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"access":"[^"]*' | sed 's/"access":"//')

if [ -z "$ACCESS_TOKEN" ]; then
  echo -e "${RED}❌ Échec de la connexion${NC}"
  exit 1
else
  echo -e "${GREEN}✅ Connecté avec succès${NC}\n"
fi

# ==================== CRÉATION D'UTILISATEURS ====================
echo -e "${YELLOW}[2/4] Création d'utilisateurs de démonstration...${NC}"

# Liste d'utilisateurs à créer
USERS=(
  '{"email":"marie.martin@esa-tez.com","username":"marie","first_name":"Marie","last_name":"Martin","password":"demo123","password_confirm":"demo123"}'
  '{"email":"jean.dupont@esa-tez.com","username":"jean","first_name":"Jean","last_name":"Dupont","password":"demo123","password_confirm":"demo123"}'
  '{"email":"sophie.laurent@esa-tez.com","username":"sophie","first_name":"Sophie","last_name":"Laurent","password":"demo123","password_confirm":"demo123"}'
  '{"email":"pierre.durand@esa-tez.com","username":"pierre","first_name":"Pierre","last_name":"Durand","password":"demo123","password_confirm":"demo123"}'
)

USER_COUNT=0
for user_data in "${USERS[@]}"; do
  email=$(echo $user_data | grep -o '"email":"[^"]*' | sed 's/"email":"//')
  echo -e "  → Création de l'utilisateur: ${email}"
  
  REGISTER_RESPONSE=$(curl -s -X POST "${API_URL}/api/auth/register/" \
    -H "Content-Type: application/json" \
    -d "$user_data")
  
  if echo "$REGISTER_RESPONSE" | grep -q "user"; then
    echo -e "${GREEN}    ✅ Utilisateur créé${NC}"
    USER_COUNT=$((USER_COUNT + 1))
  else
    echo -e "${YELLOW}    ⚠️  Utilisateur existe déjà ou erreur${NC}"
  fi
done

echo -e "\n${GREEN}✅ ${USER_COUNT} utilisateurs traités${NC}\n"

# ==================== CRÉATION DE DOCUMENTS DE DÉMO ====================
echo -e "${YELLOW}[3/4] Création de documents de démonstration...${NC}"

# Créer des fichiers de test temporaires
TEMP_DIR="/tmp/esa-tez-demo"
mkdir -p "$TEMP_DIR"

# Document 1 : Rapport Annuel
cat > "$TEMP_DIR/rapport-annuel-2024.txt" << 'EOF'
RAPPORT ANNUEL 2024 - ESA-TEZ

1. RÉSUMÉ EXÉCUTIF
L'année 2024 a été marquée par une croissance significative de notre entreprise. 
Nous avons enregistré une augmentation de 23% de notre chiffre d'affaires, 
avec une expansion réussie sur les marchés internationaux.

2. PERFORMANCES FINANCIÈRES
- Chiffre d'affaires: 15,2M€ (+23%)
- Résultat net: 2,1M€ (+18%)
- Marge opérationnelle: 14,2%

3. INNOVATIONS PRODUIT
Lancement de 5 nouveaux produits qui ont rencontré un franc succès auprès de nos clients.
Investissement de 1,2M€ en R&D pour développer les technologies de demain.

4. DÉVELOPPEMENT DURABLE
Réduction de 30% de notre empreinte carbone grâce à nos initiatives écologiques.

5. PERSPECTIVES 2025
Objectif de croissance: +20%
Expansion en Asie
Nouvelles embauches: 25 postes
EOF

# Document 2 : Politique de Sécurité
cat > "$TEMP_DIR/politique-securite-it.txt" << 'EOF'
POLITIQUE DE SÉCURITÉ INFORMATIQUE

1. OBJECTIF
Définir les règles et procédures pour assurer la sécurité des systèmes d'information.

2. MOTS DE PASSE
- Longueur minimale: 12 caractères
- Complexité: majuscules, minuscules, chiffres, caractères spéciaux
- Renouvellement: tous les 90 jours
- Interdiction de réutilisation des 5 derniers mots de passe

3. ACCÈS AUX DONNÉES
- Principe du moindre privilège
- Authentification à deux facteurs obligatoire
- Logs d'accès conservés pendant 1 an

4. SAUVEGARDE
- Sauvegarde quotidienne automatique
- Rétention: 30 jours
- Tests de restauration mensuels

5. INCIDENTS DE SÉCURITÉ
Tout incident doit être signalé immédiatement au responsable sécurité.
EOF

# Document 3 : Procédure Onboarding
cat > "$TEMP_DIR/procedure-onboarding.txt" << 'EOF'
PROCÉDURE D'INTÉGRATION DES NOUVEAUX EMPLOYÉS

1. AVANT L'ARRIVÉE (J-7)
- Créer compte utilisateur
- Préparer poste de travail
- Commander badge d'accès
- Envoyer kit de bienvenue

2. PREMIER JOUR
- 09h00: Accueil par RH
- 10h00: Visite des locaux
- 11h00: Rencontre équipe
- 14h00: Formation sécurité
- 16h00: Installation poste de travail

3. PREMIÈRE SEMAINE
- Formation aux outils internes
- Présentation des processus
- Définition des objectifs
- Point quotidien avec manager

4. PREMIER MOIS
- Évaluation intermédiaire
- Ajustement des objectifs
- Intégration sociale
- Feedback

5. SUIVI
Évaluation à 3 mois, 6 mois et 1 an
EOF

# Document 4 : Budget Prévisionnel
cat > "$TEMP_DIR/budget-previsionnel-2025.txt" << 'EOF'
BUDGET PRÉVISIONNEL 2025

1. REVENUS PRÉVISIONNELS
Ventes produits: 12M€
Services: 5M€
Total: 17M€ (+12% vs 2024)

2. DÉPENSES OPÉRATIONNELLES
Salaires et charges: 7,5M€
Marketing et ventes: 2M€
R&D: 1,5M€
Infrastructure IT: 800K€
Locaux: 600K€
Autres: 400K€
Total: 12,8M€

3. INVESTISSEMENTS
Nouveaux équipements: 1M€
Développement logiciel: 500K€
Formation: 200K€
Total: 1,7M€

4. RÉSULTAT PRÉVISIONNEL
Revenus: 17M€
Dépenses: 12,8M€
Investissements: 1,7M€
Résultat net: 2,5M€ (+19% vs 2024)

5. TRÉSORERIE
Cash début d'année: 3M€
Cash fin d'année prévue: 3,8M€
EOF

# Document 5 : Contrat Partenariat
cat > "$TEMP_DIR/contrat-partenariat-techcorp.txt" << 'EOF'
CONTRAT DE PARTENARIAT - TECHCORP

Date: 15 janvier 2025
Parties: ESA-TEZ et TECHCORP SAS

1. OBJET
Partenariat commercial pour la distribution de nos solutions en Amérique du Nord.

2. DURÉE
3 ans à compter du 1er février 2025, renouvelable tacitement.

3. ENGAGEMENT DE VOLUMES
- Année 1: 500 licences minimum
- Année 2: 750 licences minimum
- Année 3: 1000 licences minimum

4. CONDITIONS FINANCIÈRES
- Commission: 20% sur les ventes
- Support technique: inclus
- Formation initiale: incluse
- Formations supplémentaires: 500€/jour

5. TERRITOIRE
États-Unis, Canada, Mexique (exclusivité)

6. CONFIDENTIALITÉ
Les deux parties s'engagent à maintenir la confidentialité des informations échangées.
EOF

# Upload des documents
echo -e "  → Upload des documents...\n"

DOC_COUNT=0
DOCS=(
  "$TEMP_DIR/rapport-annuel-2024.txt|Rapport Annuel 2024|Rapport financier détaillé de l'année 2024|PRIVATE|Finance,Rapport,2024"
  "$TEMP_DIR/politique-securite-it.txt|Politique de Sécurité IT|Règles et procédures de sécurité informatique|ROLE_BASED|IT,Sécurité,Politique"
  "$TEMP_DIR/procedure-onboarding.txt|Procédure Onboarding 2024|Guide d'intégration des nouveaux employés|PUBLIC|RH,Onboarding,Procédure"
  "$TEMP_DIR/budget-previsionnel-2025.txt|Budget Prévisionnel 2025|Prévisions budgétaires pour l'année 2025|PRIVATE|Finance,Budget,2025"
  "$TEMP_DIR/contrat-partenariat-techcorp.txt|Contrat Partenariat TechCorp|Accord de partenariat commercial|ROLE_BASED|Contrat,Juridique,Partenariat"
)

for doc_info in "${DOCS[@]}"; do
  IFS='|' read -r file title desc visibility tags <<< "$doc_info"
  
  echo -e "    📄 ${title}"
  
  UPLOAD_RESPONSE=$(curl -s -X POST "${API_URL}/api/documents/" \
    -H "Authorization: Bearer ${ACCESS_TOKEN}" \
    -F "file=@${file}" \
    -F "title=${title}" \
    -F "description=${desc}" \
    -F "visibility=${visibility}" \
    -F "tags=${tags}")
  
  if echo "$UPLOAD_RESPONSE" | grep -q '"id"'; then
    echo -e "${GREEN}       ✅ Document créé${NC}"
    DOC_COUNT=$((DOC_COUNT + 1))
    
    # Extraire l'ID du document
    DOC_ID=$(echo $UPLOAD_RESPONSE | grep -o '"id":"[^"]*' | head -1 | sed 's/"id":"//')
    echo -e "       ID: ${DOC_ID}"
    echo -e "       Tags: ${tags}"
    echo -e "       Visibilité: ${visibility}"
  else
    echo -e "${RED}       ❌ Échec de création${NC}"
  fi
  echo ""
  sleep 1
done

# Nettoyage
rm -rf "$TEMP_DIR"

echo -e "${GREEN}✅ ${DOC_COUNT} documents créés${NC}\n"

# ==================== VÉRIFICATION ====================
echo -e "${YELLOW}[4/4] Vérification des données...${NC}"

# Statistiques finales
STATS=$(curl -s -X GET "${API_URL}/api/documents/stats/" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}")

TOTAL=$(echo $STATS | grep -o '"total_documents":[0-9]*' | grep -o '[0-9]*')
ANALYZED=$(echo $STATS | grep -o '"analyzed_documents":[0-9]*' | grep -o '[0-9]*')

echo -e "  Total documents: ${TOTAL}"
echo -e "  Documents analysés: ${ANALYZED}"

# Tags
TAGS=$(curl -s -X GET "${API_URL}/api/documents/tags/" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}")
TAG_COUNT=$(echo $TAGS | grep -o '"name":"[^"]*' | wc -l)
echo -e "  Total tags: ${TAG_COUNT}"

# ==================== RÉSUMÉ ====================
echo -e "\n${BLUE}========================================${NC}"
echo -e "${BLUE}   DONNÉES DE DÉMONSTRATION CRÉÉES${NC}"
echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}✅ Utilisateurs créés: ${USER_COUNT}${NC}"
echo -e "${GREEN}✅ Documents créés: ${DOC_COUNT}${NC}"
echo -e "${GREEN}✅ Tags créés: ${TAG_COUNT}${NC}"
echo -e "\n${YELLOW}📝 Identifiants des utilisateurs de démo:${NC}"
echo -e "   Email: [prenom].[nom]@esa-tez.com"
echo -e "   Mot de passe: demo123"
echo -e "\n${GREEN}🎉 Base de données peuplée avec succès !${NC}\n"

