import uuid
from django.db import models
from django.conf import settings


class DocumentAccessLog(models.Model):
    """Logs d'accès aux documents"""
    
    ACTION_CHOICES = [
        ('view', 'Visualisation'),
        ('download', 'Téléchargement'),
        ('share', 'Partage'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    document = models.ForeignKey(
        'documents.Document',
        on_delete=models.CASCADE,
        related_name='access_logs',
        verbose_name='Document'
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='document_accesses',
        verbose_name='Utilisateur'
    )
    action = models.CharField(
        max_length=10,
        choices=ACTION_CHOICES,
        verbose_name='Action'
    )
    accessed_at = models.DateTimeField(auto_now_add=True, verbose_name='Date d\'accès')
    
    class Meta:
        verbose_name = 'Log d\'accès'
        verbose_name_plural = 'Logs d\'accès'
        ordering = ['-accessed_at']
        indexes = [
            models.Index(fields=['-accessed_at']),
            models.Index(fields=['document', '-accessed_at']),
            models.Index(fields=['user', '-accessed_at']),
        ]
    
    def __str__(self):
        return f"{self.user} - {self.action} - {self.document.title}"



