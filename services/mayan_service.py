"""
Service d'intégration avec Mayan EDMS
"""
import logging
import requests
from typing import Optional, Dict
from django.conf import settings

logger = logging.getLogger(__name__)


class MayanService:
    """Service pour l'intégration avec Mayan EDMS"""
    
    def __init__(self):
        self.base_url = settings.MAYAN_API_URL
        self.username = settings.MAYAN_USERNAME
        self.password = settings.MAYAN_PASSWORD
        self.session = requests.Session()
        self.session.auth = (self.username, self.password)
    
    def is_available(self) -> bool:
        """Vérifie si Mayan EDMS est disponible"""
        try:
            response = self.session.get(f"{self.base_url}/", timeout=5)
            return response.status_code == 200
        except Exception as e:
            logger.error(f"Mayan EDMS non disponible: {e}")
            return False
    
    def upload_document(self, file_path: str, metadata: Dict) -> Optional[str]:
        """
        Upload un document vers Mayan EDMS
        
        Args:
            file_path: Chemin vers le fichier
            metadata: Métadonnées du document
            
        Returns:
            ID du document dans Mayan ou None
        """
        if not self.is_available():
            logger.warning("Mayan EDMS non disponible, upload ignoré")
            return None
        
        try:
            # Endpoint pour l'upload de documents
            url = f"{self.base_url}/documents/"
            
            with open(file_path, 'rb') as file:
                files = {'file': file}
                data = {
                    'label': metadata.get('title', 'Document'),
                    'description': metadata.get('description', ''),
                }
                
                response = self.session.post(url, files=files, data=data, timeout=30)
                
                if response.status_code in [200, 201]:
                    document_data = response.json()
                    document_id = document_data.get('id')
                    logger.info(f"Document uploadé vers Mayan avec l'ID: {document_id}")
                    return str(document_id)
                else:
                    logger.error(f"Erreur lors de l'upload vers Mayan: {response.status_code}")
                    return None
                    
        except Exception as e:
            logger.error(f"Erreur lors de l'upload vers Mayan: {e}")
            return None
    
    def get_document_url(self, mayan_id: str) -> str:
        """
        Récupère l'URL d'un document dans Mayan
        
        Args:
            mayan_id: ID du document dans Mayan
            
        Returns:
            URL du document
        """
        return f"{settings.MAYAN_HOST}/documents/{mayan_id}/"
    
    def get_document_info(self, mayan_id: str) -> Optional[Dict]:
        """
        Récupère les informations d'un document depuis Mayan
        
        Args:
            mayan_id: ID du document dans Mayan
            
        Returns:
            Informations du document ou None
        """
        if not self.is_available():
            return None
        
        try:
            url = f"{self.base_url}/documents/{mayan_id}/"
            response = self.session.get(url, timeout=10)
            
            if response.status_code == 200:
                return response.json()
            else:
                logger.error(f"Document {mayan_id} non trouvé dans Mayan")
                return None
                
        except Exception as e:
            logger.error(f"Erreur lors de la récupération du document: {e}")
            return None
    
    def delete_document(self, mayan_id: str) -> bool:
        """
        Supprime un document de Mayan
        
        Args:
            mayan_id: ID du document dans Mayan
            
        Returns:
            True si succès, False sinon
        """
        if not self.is_available():
            return False
        
        try:
            url = f"{self.base_url}/documents/{mayan_id}/"
            response = self.session.delete(url, timeout=10)
            
            if response.status_code in [200, 204]:
                logger.info(f"Document {mayan_id} supprimé de Mayan")
                return True
            else:
                logger.error(f"Erreur lors de la suppression du document: {response.status_code}")
                return False
                
        except Exception as e:
            logger.error(f"Erreur lors de la suppression du document: {e}")
            return False
    
    def sync_document(self, document_id: str, file_path: str, metadata: Dict) -> Optional[str]:
        """
        Synchronise un document avec Mayan EDMS
        
        Args:
            document_id: ID du document local
            file_path: Chemin vers le fichier
            metadata: Métadonnées du document
            
        Returns:
            ID Mayan ou None
        """
        # Pour l'instant, on fait juste un upload
        # On pourrait implémenter une logique de mise à jour si le document existe déjà
        return self.upload_document(file_path, metadata)


# Instance globale du service
mayan_service = MayanService()



