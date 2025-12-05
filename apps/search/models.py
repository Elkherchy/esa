import uuid
from django.db import models
from django.conf import settings


class SearchQuery(models.Model):
    """Historique des recherches"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='search_queries',
        verbose_name='Utilisateur'
    )
    query = models.CharField(max_length=255, verbose_name='Requête')
    results_count = models.IntegerField(default=0, verbose_name='Nombre de résultats')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Date')
    
    class Meta:
        verbose_name = 'Recherche'
        verbose_name_plural = 'Recherches'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['-created_at']),
            models.Index(fields=['user', '-created_at']),
        ]
    
    def __str__(self):
        return f"{self.user} - {self.query}"


