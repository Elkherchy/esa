#!/bin/bash

set -e

echo "🔄 Attente de la base de données..."
while ! pg_isready -h db -p 5432 -U $POSTGRES_USER; do
  sleep 1
done
echo "✅ Base de données prête!"

echo "🔄 Application des migrations..."
python manage.py makemigrations --noinput
python manage.py migrate --noinput

echo "🔄 Collecte des fichiers statiques..."
python manage.py collectstatic --noinput --clear

echo "🔄 Création d'un superutilisateur par défaut..."
python manage.py shell <<EOF
from django.contrib.auth import get_user_model
User = get_user_model()
if not User.objects.filter(email='admin@esa-tez.com').exists():
    User.objects.create_superuser(
        email='admin@esa-tez.com',
        username='admin',
        password='admin123',
        first_name='Admin',
        last_name='ESA-TEZ'
    )
    print('✅ Superutilisateur créé: admin@esa-tez.com / admin123')
else:
    print('ℹ️ Superutilisateur déjà existant')
EOF

echo "🚀 Démarrage du serveur Django..."
exec python manage.py runserver 0.0.0.0:8000


