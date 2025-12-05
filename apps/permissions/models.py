import uuid
from django.db import models
from django.conf import settings
from django.utils import timezone


class Permission(models.Model):
    """Permissions d'accès temporaires aux documents"""
    
    TYPE_CHOICES = [
        ('user', 'Utilisateur'),
        ('role', 'Rôle'),
    ]
    
    STATUS_CHOICES = [
        ('active', 'Actif'),
        ('expired', 'Expiré'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    document = models.ForeignKey(
        'documents.Document',
        on_delete=models.CASCADE,
        related_name='permissions',
        verbose_name='Document'
    )
    
    type = models.CharField(
        max_length=10,
        choices=TYPE_CHOICES,
        verbose_name='Type'
    )
    
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='document_permissions',
        verbose_name='Utilisateur'
    )
    
    role = models.CharField(
        max_length=50,
        blank=True,
        null=True,
        verbose_name='Rôle'
    )
    
    start_time = models.DateTimeField(verbose_name='Début')
    end_time = models.DateTimeField(verbose_name='Fin')
    
    status = models.CharField(
        max_length=10,
        choices=STATUS_CHOICES,
        default='active',
        verbose_name='Statut'
    )
    
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Créé le')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Modifié le')
    
    class Meta:
        verbose_name = 'Permission'
        verbose_name_plural = 'Permissions'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['document', 'status']),
            models.Index(fields=['user', 'status']),
        ]
    
    def __str__(self):
        if self.type == 'user':
            return f"Permission pour {self.user} sur {self.document.title}"
        return f"Permission pour rôle {self.role} sur {self.document.title}"
    
    def is_active(self):
        """Vérifie si la permission est actuellement active"""
        now = timezone.now()
        return (
            self.status == 'active' and
            self.start_time <= now <= self.end_time
        )
    
    def update_status(self):
        """Met à jour le statut en fonction de la date"""
        if timezone.now() > self.end_time and self.status == 'active':
            self.status = 'expired'
            self.save()


