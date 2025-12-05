#!/usr/bin/env python3
"""
Script de démonstration pour l'API ESA-TEZ
Ce script teste tous les endpoints avec des données d'exemple.
"""

import requests
import json
import time
import os
import sys
from pathlib import Path
from io import BytesIO
import argparse

class ESATezAPIDemo:
    def __init__(self, base_url="http://localhost:8001"):
        self.base_url = base_url
        self.access_token = None
        self.refresh_token = None
        self.users = []
        self.documents = []
        
    def print_section(self, title):
        """Affiche une section formatée"""
        print(f"\n{'='*60}")
        print(f"🚀 {title}")
        print('='*60)
    
    def print_result(self, operation, response, show_data=True):
        """Affiche le résultat d'une opération"""
        status = "✅" if response.status_code < 400 else "❌"
        print(f"{status} {operation} - Status: {response.status_code}")
        
        if show_data:
            try:
                data = response.json()
                print(json.dumps(data, indent=2, ensure_ascii=False)[:500] + "...")
            except:
                print(response.text[:200] + "...")
        print("-" * 60)
    
    def create_sample_pdf(self, filename="sample_document.pdf"):
        """Crée un fichier PDF d'exemple simple"""
        try:
            from reportlab.pdfgen import canvas
            from reportlab.lib.pagesizes import letter
        except ImportError:
            # Créer un faux PDF simple si reportlab n'est pas disponible
            content = b"""%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
>>
endobj

4 0 obj
<<
/Length 44
>>
stream
BT
/F1 12 Tf
72 720 Td
(Document de démonstration ESA-TEZ) Tj
ET
endstream
endobj

xref
0 5
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000206 00000 n 
trailer
<<
/Size 5
/Root 1 0 R
>>
startxref
299
%%EOF"""
            with open(filename, 'wb') as f:
                f.write(content)
            return filename
        
        # Créer un PDF avec reportlab
        c = canvas.Canvas(filename, pagesize=letter)
        width, height = letter
        
        c.setFont("Helvetica-Bold", 16)
        c.drawString(72, height - 72, "Document de Démonstration ESA-TEZ")
        
        c.setFont("Helvetica", 12)
        content_lines = [
            "",
            "Ce document a été généré automatiquement pour tester",
            "les fonctionnalités d'upload et d'analyse de l'API.",
            "",
            "Contenu du document:",
            "- Rapport financier Q4 2024",
            "- Croissance de 23% du chiffre d'affaires", 
            "- Expansion sur les marchés internationaux",
            "- Amélioration de la rentabilité",
            "- Innovation produit et services",
            "",
            "Points clés:",
            "✓ Performance exceptionnelle",
            "✓ Stratégie d'expansion réussie", 
            "✓ Innovation continue",
            "✓ Satisfaction client élevée",
            "",
            "Ce document contient des informations importantes",
            "pour l'analyse automatique par IA.",
        ]
        
        y_position = height - 120
        for line in content_lines:
            c.drawString(72, y_position, line)
            y_position -= 20
            if y_position < 72:
                c.showPage()
                y_position = height - 72
                
        c.save()
        return filename

    # ================== AUTHENTIFICATION ==================
    
    def test_auth_register(self):
        """Teste l'inscription d'un nouvel utilisateur"""
        self.print_section("AUTHENTIFICATION - Inscription")
        
        users_data = [
            {
                "email": "jean.dupont@example.com",
                "username": "jeandupont", 
                "first_name": "Jean",
                "last_name": "Dupont",
                "password": "MotDePasseSecure123",
                "password_confirm": "MotDePasseSecure123"
            },
            {
                "email": "marie.martin@example.com",
                "username": "mariemartin",
                "first_name": "Marie", 
                "last_name": "Martin",
                "password": "AutreMotDePasse456",
                "password_confirm": "AutreMotDePasse456"
            }
        ]
        
        for user_data in users_data:
            response = requests.post(
                f"{self.base_url}/api/auth/register/",
                json=user_data
            )
            self.print_result(f"Inscription {user_data['email']}", response)
            
            if response.status_code == 201:
                data = response.json()
                self.users.append({
                    'id': data['user']['id'],
                    'email': data['user']['email'],
                    'tokens': data['tokens']
                })
    
    def test_auth_login(self):
        """Teste la connexion"""
        self.print_section("AUTHENTIFICATION - Connexion")
        
        login_data = {
            "email": "admin@esa-tez.com",
            "password": "admin123"
        }
        
        response = requests.post(
            f"{self.base_url}/api/auth/login/",
            json=login_data
        )
        self.print_result("Connexion admin", response)
        
        if response.status_code == 200:
            data = response.json()
            self.access_token = data['tokens']['access']
            self.refresh_token = data['tokens']['refresh']
            print(f"🔑 Token d'accès obtenu: {self.access_token[:50]}...")
    
    def test_auth_refresh(self):
        """Teste le rafraîchissement du token"""
        if not self.refresh_token:
            print("❌ Aucun refresh token disponible")
            return
            
        self.print_section("AUTHENTIFICATION - Rafraîchissement Token")
        
        response = requests.post(
            f"{self.base_url}/api/auth/refresh/",
            json={"refresh": self.refresh_token}
        )
        self.print_result("Rafraîchissement token", response)
        
        if response.status_code == 200:
            data = response.json()
            self.access_token = data['access']
    
    def test_auth_me(self):
        """Teste la récupération des infos utilisateur"""
        if not self.access_token:
            print("❌ Aucun token d'accès disponible")
            return
            
        self.print_section("AUTHENTIFICATION - Infos Utilisateur")
        
        headers = {"Authorization": f"Bearer {self.access_token}"}
        response = requests.get(
            f"{self.base_url}/api/auth/me/",
            headers=headers
        )
        self.print_result("Infos utilisateur", response)
    
    def test_auth_logout(self):
        """Teste la déconnexion"""
        if not self.access_token:
            print("❌ Aucun token d'accès disponible")
            return
            
        self.print_section("AUTHENTIFICATION - Déconnexion")
        
        headers = {"Authorization": f"Bearer {self.access_token}"}
        response = requests.post(
            f"{self.base_url}/api/auth/logout/",
            headers=headers
        )
        self.print_result("Déconnexion", response)

    # ================== GESTION UTILISATEURS ==================
    
    def test_users_list(self):
        """Teste la liste des utilisateurs (admin)"""
        if not self.access_token:
            print("❌ Aucun token d'accès disponible")
            return
            
        self.print_section("UTILISATEURS - Liste")
        
        headers = {"Authorization": f"Bearer {self.access_token}"}
        
        # Teste différents filtres
        test_params = [
            {},
            {"search": "jean"},
            {"role": "USER"},
            {"is_active": "true"},
        ]
        
        for params in test_params:
            response = requests.get(
                f"{self.base_url}/api/auth/users/",
                headers=headers,
                params=params
            )
            param_str = ", ".join([f"{k}={v}" for k, v in params.items()]) or "aucun filtre"
            self.print_result(f"Liste utilisateurs ({param_str})", response)
    
    def test_users_detail(self):
        """Teste les détails d'un utilisateur"""
        if not self.access_token or not self.users:
            print("❌ Aucun token ou utilisateur disponible")
            return
            
        self.print_section("UTILISATEURS - Détails")
        
        headers = {"Authorization": f"Bearer {self.access_token}"}
        user_id = self.users[0]['id']
        
        response = requests.get(
            f"{self.base_url}/api/auth/users/{user_id}/",
            headers=headers
        )
        self.print_result(f"Détails utilisateur {user_id}", response)
    
    def test_users_update(self):
        """Teste la mise à jour d'un utilisateur"""
        if not self.access_token or not self.users:
            print("❌ Aucun token ou utilisateur disponible")
            return
            
        self.print_section("UTILISATEURS - Mise à jour")
        
        headers = {"Authorization": f"Bearer {self.access_token}"}
        user_id = self.users[0]['id']
        
        update_data = {
            "role": "ADMIN",
            "is_active": True
        }
        
        response = requests.patch(
            f"{self.base_url}/api/auth/users/{user_id}/",
            headers=headers,
            json=update_data
        )
        self.print_result(f"Mise à jour utilisateur {user_id}", response)

    # ================== GESTION DOCUMENTS ==================
    
    def test_documents_upload(self):
        """Teste l'upload de documents"""
        if not self.access_token:
            print("❌ Aucun token d'accès disponible")
            return
            
        self.print_section("DOCUMENTS - Upload")
        
        headers = {"Authorization": f"Bearer {self.access_token}"}
        
        # Crée des fichiers d'exemple
        test_documents = [
            {
                "title": "Rapport Financier Q4 2024",
                "description": "Rapport trimestriel détaillé avec analyse des performances",
                "visibility": "PRIVATE",
                "tags": "Finance,Rapport,2024"
            },
            {
                "title": "Manuel Utilisateur ESA-TEZ",
                "description": "Guide complet d'utilisation de la plateforme",
                "visibility": "PUBLIC", 
                "tags": "Documentation,Manuel,Guide"
            },
            {
                "title": "Étude de Marché 2024",
                "description": "Analyse concurrentielle et opportunités",
                "visibility": "ROLE_BASED",
                "tags": "Marketing,Étude,Stratégie"
            }
        ]
        
        for i, doc_data in enumerate(test_documents):
            # Crée un fichier PDF d'exemple
            filename = f"sample_doc_{i+1}.pdf"
            pdf_path = self.create_sample_pdf(filename)
            
            try:
                with open(pdf_path, 'rb') as file:
                    files = {'file': file}
                    data = doc_data
                    
                    response = requests.post(
                        f"{self.base_url}/api/documents/",
                        headers=headers,
                        files=files,
                        data=data
                    )
                    
                    self.print_result(f"Upload {doc_data['title']}", response)
                    
                    if response.status_code == 201:
                        doc_info = response.json()
                        self.documents.append(doc_info)
                        
            except Exception as e:
                print(f"❌ Erreur upload {doc_data['title']}: {e}")
            finally:
                # Nettoie le fichier temporaire
                if os.path.exists(pdf_path):
                    os.remove(pdf_path)
    
    def test_documents_list(self):
        """Teste la liste des documents avec filtres"""
        if not self.access_token:
            print("❌ Aucun token d'accès disponible") 
            return
            
        self.print_section("DOCUMENTS - Liste et Filtres")
        
        headers = {"Authorization": f"Bearer {self.access_token}"}
        
        # Teste différents filtres
        test_params = [
            {},
            {"search": "rapport"},
            {"visibility": "PRIVATE"},
            {"tags": "Finance"},
            {"analyzed": "true"},
            {"ordering": "-created_at"},
            {"search": "manuel", "visibility": "PUBLIC"},
        ]
        
        for params in test_params:
            response = requests.get(
                f"{self.base_url}/api/documents/",
                headers=headers,
                params=params
            )
            param_str = ", ".join([f"{k}={v}" for k, v in params.items()]) or "aucun filtre"
            self.print_result(f"Liste documents ({param_str})", response, show_data=False)
            
            # Affiche le nombre de résultats
            if response.status_code == 200:
                try:
                    data = response.json()
                    count = data.get('count', len(data.get('results', [])))
                    print(f"   📊 Nombre de résultats: {count}")
                except:
                    pass
    
    def test_documents_detail(self):
        """Teste les détails d'un document"""
        if not self.access_token or not self.documents:
            print("❌ Aucun token ou document disponible")
            return
            
        self.print_section("DOCUMENTS - Détails")
        
        headers = {"Authorization": f"Bearer {self.access_token}"}
        
        for doc in self.documents[:2]:  # Teste les 2 premiers documents
            response = requests.get(
                f"{self.base_url}/api/documents/{doc['id']}/",
                headers=headers
            )
            self.print_result(f"Détails {doc['title']}", response)
    
    def test_documents_analyze(self):
        """Teste l'analyse manuelle d'un document"""
        if not self.access_token or not self.documents:
            print("❌ Aucun token ou document disponible")
            return
            
        self.print_section("DOCUMENTS - Analyse IA")
        
        headers = {"Authorization": f"Bearer {self.access_token}"}
        doc_id = self.documents[0]['id']
        
        response = requests.post(
            f"{self.base_url}/api/documents/{doc_id}/analyze/",
            headers=headers
        )
        self.print_result(f"Lancement analyse {doc_id}", response)
        
        if response.status_code == 200:
            print("⏳ Attente de l'analyse (jusqu'à 30 secondes)...")
            
            # Polling pour vérifier l'état de l'analyse
            for attempt in range(15):
                time.sleep(2)
                
                detail_response = requests.get(
                    f"{self.base_url}/api/documents/{doc_id}/",
                    headers=headers
                )
                
                if detail_response.status_code == 200:
                    doc_data = detail_response.json()
                    if doc_data.get('analyzed'):
                        print("✅ Analyse terminée!")
                        analysis = doc_data.get('analysis', {})
                        print(f"📝 Résumé: {analysis.get('summary', 'N/A')[:100]}...")
                        print(f"🔍 Points clés: {', '.join(analysis.get('key_points', []))}")
                        break
                        
                print(f"   ⏳ Tentative {attempt + 1}/15...")
            else:
                print("⚠️  Analyse non terminée dans le délai imparti")
    
    def test_documents_update(self):
        """Teste la mise à jour d'un document"""
        if not self.access_token or not self.documents:
            print("❌ Aucun token ou document disponible")
            return
            
        self.print_section("DOCUMENTS - Mise à jour")
        
        headers = {"Authorization": f"Bearer {self.access_token}"}
        doc_id = self.documents[0]['id']
        
        update_data = {
            "title": "Rapport Financier Q4 2024 - Version Finale",
            "description": "Version finalisée après révision",
            "visibility": "PUBLIC",
            "tags": ["Finance", "Rapport", "Final"]
        }
        
        response = requests.patch(
            f"{self.base_url}/api/documents/{doc_id}/",
            headers=headers,
            json=update_data
        )
        self.print_result(f"Mise à jour document {doc_id}", response)
    
    def test_documents_tags(self):
        """Teste la liste des tags"""
        if not self.access_token:
            print("❌ Aucun token d'accès disponible")
            return
            
        self.print_section("DOCUMENTS - Tags")
        
        headers = {"Authorization": f"Bearer {self.access_token}"}
        
        response = requests.get(
            f"{self.base_url}/api/documents/tags/",
            headers=headers
        )
        self.print_result("Liste des tags", response)
    
    def test_documents_stats(self):
        """Teste les statistiques des documents"""
        if not self.access_token:
            print("❌ Aucun token d'accès disponible")
            return
            
        self.print_section("DOCUMENTS - Statistiques")
        
        headers = {"Authorization": f"Bearer {self.access_token}"}
        
        response = requests.get(
            f"{self.base_url}/api/documents/stats/",
            headers=headers
        )
        self.print_result("Statistiques documents", response)

    # ================== NETTOYAGE ==================
    
    def cleanup_test_documents(self):
        """Supprime les documents de test créés"""
        if not self.access_token or not self.documents:
            return
            
        self.print_section("NETTOYAGE - Suppression des documents de test")
        
        headers = {"Authorization": f"Bearer {self.access_token}"}
        
        for doc in self.documents:
            response = requests.delete(
                f"{self.base_url}/api/documents/{doc['id']}/",
                headers=headers
            )
            status = "✅" if response.status_code == 204 else "❌"
            print(f"{status} Suppression {doc['title']} - Status: {response.status_code}")

    # ================== EXÉCUTION PRINCIPALE ==================
    
    def run_full_demo(self):
        """Exécute la démonstration complète"""
        print("🚀 Démarrage de la démonstration ESA-TEZ API")
        print(f"🌐 URL de base: {self.base_url}")
        print("📝 Ce script va tester tous les endpoints disponibles")
        
        try:
            # Tests d'authentification
            self.test_auth_register()
            self.test_auth_login()
            self.test_auth_refresh() 
            self.test_auth_me()
            
            # Tests de gestion des utilisateurs
            self.test_users_list()
            self.test_users_detail()
            self.test_users_update()
            
            # Tests de gestion des documents
            self.test_documents_upload()
            self.test_documents_list()
            self.test_documents_detail()
            self.test_documents_analyze()
            self.test_documents_update()
            self.test_documents_tags()
            self.test_documents_stats()
            
            # Déconnexion
            self.test_auth_logout()
            
            print("\n" + "="*60)
            print("✅ Démonstration terminée avec succès!")
            print("📊 Résumé:")
            print(f"   - Utilisateurs créés: {len(self.users)}")
            print(f"   - Documents uploadés: {len(self.documents)}")
            print("="*60)
            
        except KeyboardInterrupt:
            print("\n⚠️  Démonstration interrompue par l'utilisateur")
        except Exception as e:
            print(f"\n❌ Erreur pendant la démonstration: {e}")
        finally:
            # Nettoyage optionnel
            cleanup = input("\n🧹 Voulez-vous supprimer les documents de test? (y/N): ")
            if cleanup.lower() in ['y', 'yes', 'o', 'oui']:
                self.cleanup_test_documents()

def main():
    """Point d'entrée principal"""
    parser = argparse.ArgumentParser(description='Script de démonstration ESA-TEZ API')
    parser.add_argument(
        '--url', 
        default='http://localhost:8001',
        help='URL de base de l\'API (défaut: http://localhost:8001)'
    )
    parser.add_argument(
        '--test', 
        choices=['auth', 'users', 'documents', 'all'],
        default='all',
        help='Type de test à exécuter (défaut: all)'
    )
    
    args = parser.parse_args()
    
    demo = ESATezAPIDemo(args.url)
    
    if args.test == 'auth':
        demo.test_auth_register()
        demo.test_auth_login() 
        demo.test_auth_refresh()
        demo.test_auth_me()
        demo.test_auth_logout()
    elif args.test == 'users':
        demo.test_auth_login()
        demo.test_users_list()
        demo.test_users_detail()
        demo.test_users_update()
    elif args.test == 'documents':
        demo.test_auth_login()
        demo.test_documents_upload()
        demo.test_documents_list()
        demo.test_documents_detail()
        demo.test_documents_analyze()
        demo.test_documents_update()
        demo.test_documents_tags()
        demo.test_documents_stats()
    else:
        demo.run_full_demo()

if __name__ == "__main__":
    main()
