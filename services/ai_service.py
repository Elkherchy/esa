"""
Service d'analyse IA avec Ollama/Mistral
"""
import logging
import time
from typing import Dict, List, Optional
from django.conf import settings

try:
    import ollama
    OLLAMA_AVAILABLE = True
except ImportError:
    OLLAMA_AVAILABLE = False
    logging.warning("Ollama package not installed. AI features will be disabled.")

logger = logging.getLogger(__name__)


class AIService:
    """Service pour l'analyse de documents avec Mistral via Ollama"""
    
    def __init__(self):
        self.model = settings.OLLAMA_MODEL
        self.host = settings.OLLAMA_HOST
        self.timeout = settings.OLLAMA_TIMEOUT
        
        if OLLAMA_AVAILABLE:
            self.client = ollama.Client(host=self.host)
        else:
            self.client = None
            logger.warning("Ollama client not available")
    
    def is_available(self) -> bool:
        """Vérifie si le service IA est disponible"""
        if not OLLAMA_AVAILABLE or not self.client:
            return False
        
        try:
            # Test de connexion simple
            self.client.list()
            return True
        except Exception as e:
            logger.error(f"Service Ollama non disponible: {e}")
            return False
    
    def generate_summary(self, text: str, max_words: int = 150) -> str:
        """
        Génère un résumé concis d'un texte
        
        Args:
            text: Texte à résumer
            max_words: Nombre maximum de mots dans le résumé
            
        Returns:
            Résumé généré
        """
        if not self.is_available():
            return "Service d'IA non disponible"
        
        if not text or len(text.strip()) < 100:
            return "Texte trop court pour générer un résumé"
        
        # Limiter la taille du texte envoyé (4000 caractères max)
        text_sample = text[:4000]
        
        prompt = f"""Tu es un assistant spécialisé dans l'analyse de documents.
Génère un résumé concis et pertinent en français du document suivant (maximum {max_words} mots).
Le résumé doit capturer les points principaux et les idées clés.

Document:
{text_sample}

Résumé:"""
        
        try:
            start_time = time.time()
            
            response = self.client.generate(
                model=self.model,
                prompt=prompt,
                options={
                    'temperature': 0.3,
                    'num_predict': max_words * 2,  # Approximation mots -> tokens
                }
            )
            
            elapsed_time = time.time() - start_time
            logger.info(f"Résumé généré en {elapsed_time:.2f}s")
            
            summary = response['response'].strip()
            return summary if summary else "Impossible de générer un résumé"
            
        except Exception as e:
            logger.error(f"Erreur lors de la génération du résumé: {e}")
            return f"Erreur lors de la génération du résumé: {str(e)}"
    
    def extract_keywords(self, text: str, num_keywords: int = 7) -> List[str]:
        """
        Extrait les mots-clés principaux d'un texte
        
        Args:
            text: Texte à analyser
            num_keywords: Nombre de mots-clés à extraire
            
        Returns:
            Liste de mots-clés
        """
        if not self.is_available():
            return ["Service IA non disponible"]
        
        if not text or len(text.strip()) < 100:
            return ["Texte trop court"]
        
        # Limiter la taille du texte
        text_sample = text[:4000]
        
        prompt = f"""Tu es un assistant spécialisé dans l'analyse de documents.
Extrait exactement {num_keywords} mots-clés ou expressions clés qui représentent les thèmes principaux du document suivant.
Réponds uniquement avec les mots-clés séparés par des virgules, sans numérotation ni explication.

Document:
{text_sample}

Mots-clés:"""
        
        try:
            start_time = time.time()
            
            response = self.client.generate(
                model=self.model,
                prompt=prompt,
                options={
                    'temperature': 0.2,
                    'num_predict': 100,
                }
            )
            
            elapsed_time = time.time() - start_time
            logger.info(f"Mots-clés extraits en {elapsed_time:.2f}s")
            
            keywords_text = response['response'].strip()
            
            # Parser la réponse pour extraire les mots-clés
            keywords = [kw.strip() for kw in keywords_text.split(',')]
            keywords = [kw for kw in keywords if kw and len(kw) > 2]
            
            return keywords[:num_keywords]
            
        except Exception as e:
            logger.error(f"Erreur lors de l'extraction des mots-clés: {e}")
            return [f"Erreur: {str(e)}"]
    
    def analyze_document(self, text: str) -> Dict:
        """
        Analyse complète d'un document (résumé + mots-clés)
        
        Args:
            text: Texte du document
            
        Returns:
            Dict avec summary, key_points, model_used
        """
        logger.info("Début de l'analyse du document")
        
        if not self.is_available():
            return {
                'summary': 'Service d\'IA non disponible',
                'key_points': ['Service non disponible'],
                'model_used': self.model,
                'error': True
            }
        
        try:
            # Générer le résumé
            summary = self.generate_summary(text)
            
            # Extraire les mots-clés
            keywords = self.extract_keywords(text)
            
            logger.info("Analyse du document terminée avec succès")
            
            return {
                'summary': summary,
                'key_points': keywords,
                'model_used': self.model,
                'error': False
            }
            
        except Exception as e:
            logger.error(f"Erreur lors de l'analyse du document: {e}")
            return {
                'summary': f'Erreur lors de l\'analyse: {str(e)}',
                'key_points': ['Erreur d\'analyse'],
                'model_used': self.model,
                'error': True
            }
    
    def generate_search_query_expansion(self, query: str) -> List[str]:
        """
        Génère des variations d'une requête de recherche pour améliorer les résultats
        
        Args:
            query: Requête de recherche originale
            
        Returns:
            Liste de requêtes similaires/élargies
        """
        if not self.is_available():
            return [query]
        
        prompt = f"""Génère 3 variations ou reformulations de la requête de recherche suivante.
Réponds uniquement avec les variations séparées par des points-virgules, sans explication.

Requête: {query}

Variations:"""
        
        try:
            response = self.client.generate(
                model=self.model,
                prompt=prompt,
                options={
                    'temperature': 0.5,
                    'num_predict': 100,
                }
            )
            
            variations_text = response['response'].strip()
            variations = [v.strip() for v in variations_text.split(';')]
            variations = [v for v in variations if v]
            
            return [query] + variations[:3]
            
        except Exception as e:
            logger.error(f"Erreur lors de l'expansion de la requête: {e}")
            return [query]


# Instance globale du service
ai_service = AIService()



