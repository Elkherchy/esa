"""
Tâches Celery pour l'analyse asynchrone des documents
"""
import logging
from celery import shared_task
from django.core.files.storage import default_storage

from services.ai_service import ai_service
from services.file_service import FileService

logger = logging.getLogger(__name__)


@shared_task(bind=True, max_retries=3)
def analyze_document_task(self, document_id: str):
    """
    Tâche asynchrone pour analyser un document avec l'IA
    
    Args:
        document_id: ID du document à analyser
    """
    from apps.documents.models import Document, DocumentAnalysis
    
    try:
        logger.info(f"Début de l'analyse du document {document_id}")
        
        # Récupérer le document
        document = Document.objects.get(id=document_id)
        
        # Extraire le texte du fichier
        file_path = document.file.path
        text = FileService.extract_text(file_path)
        
        if not text or len(text.strip()) < 100:
            logger.warning(f"Texte extrait trop court pour le document {document_id}")
            return {
                'success': False,
                'error': 'Texte trop court pour analyse'
            }
        
        # Analyser avec l'IA
        analysis_result = ai_service.analyze_document(text)
        
        if analysis_result.get('error'):
            logger.error(f"Erreur lors de l'analyse IA: {analysis_result}")
            return {
                'success': False,
                'error': analysis_result.get('summary', 'Erreur inconnue')
            }
        
        # Sauvegarder ou mettre à jour l'analyse
        analysis, created = DocumentAnalysis.objects.update_or_create(
            document=document,
            defaults={
                'summary': analysis_result['summary'],
                'key_points': analysis_result['key_points'],
                'model_used': analysis_result['model_used'],
            }
        )
        
        # Marquer le document comme analysé
        document.analyzed = True
        
        # Générer un snippet si vide
        if not document.snippet:
            document.snippet = FileService.generate_snippet(text)
        
        document.save()
        
        logger.info(f"Analyse du document {document_id} terminée avec succès")
        
        return {
            'success': True,
            'document_id': str(document_id),
            'analysis_id': str(analysis.id),
        }
        
    except Document.DoesNotExist:
        logger.error(f"Document {document_id} non trouvé")
        return {
            'success': False,
            'error': 'Document non trouvé'
        }
    except Exception as e:
        logger.error(f"Erreur lors de l'analyse du document {document_id}: {e}")
        # Retry si erreur
        raise self.retry(exc=e, countdown=60)



