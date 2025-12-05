#!/usr/bin/env python3
"""
Script pour promouvoir un utilisateur en ADMIN via Django
À exécuter directement sur le serveur backend Django

Usage sur le serveur backend:
    python promote-to-admin-django.py superadmin@esa-tez.com
    
Ou via manage.py:
    python manage.py shell < promote-to-admin-django.py
"""

import os
import sys
import django

# Configuration Django (adapter selon votre projet)
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')  # Adapter le chemin
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()

def promote_to_admin(email):
    """Promouvoir un utilisateur en administrateur"""
    try:
        user = User.objects.get(email=email)
        
        print(f"\n📋 Utilisateur trouvé:")
        print(f"   Email: {user.email}")
        print(f"   Username: {user.username}")
        print(f"   Nom: {user.get_full_name() or user.display_name}")
        print(f"   is_staff: {user.is_staff}")
        print(f"   is_superuser: {user.is_superuser}")
        print(f"   is_active: {user.is_active}")
        
        if user.is_staff and user.is_superuser:
            print(f"\n✅ {user.email} est déjà SUPER ADMIN!")
            return
        
        # Promouvoir
        print(f"\n🔄 Promotion en cours...")
        user.is_staff = True
        user.is_superuser = True
        user.is_active = True
        user.save()
        
        print(f"\n✅ {user.email} est maintenant SUPER ADMIN!")
        print(f"\n📋 Nouvelles permissions:")
        print(f"   is_staff: {user.is_staff}")
        print(f"   is_superuser: {user.is_superuser}")
        print(f"   is_active: {user.is_active}")
        
    except User.DoesNotExist:
        print(f"\n❌ Utilisateur {email} introuvable!")
        print(f"\n💡 Créez d'abord le compte via l'API:")
        print(f"   ./scripts/quick-create-admin.sh")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Erreur: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python promote-to-admin-django.py <email>")
        print("Exemple: python promote-to-admin-django.py superadmin@esa-tez.com")
        sys.exit(1)
    
    email = sys.argv[1]
    promote_to_admin(email)

