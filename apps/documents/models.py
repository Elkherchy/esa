import uuid
from django.db import models
from django.conf import settings


class DocumentTag(models.Model):
    """Tags pour organiser les documents"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=50, unique=True, verbose_name='Nom')
    color = models.CharField(max_length=7, default='#1D4ED8', verbose_name='Couleur')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Créé le')
    
    class Meta:
        verbose_name = 'Tag'
        verbose_name_plural = 'Tags'
        ordering = ['name']
    
    def __str__(self):
        return self.name


class Document(models.Model):
    """Modèle principal pour les documents"""
    
    VISIBILITY_CHOICES = [
        ('PRIVATE', 'Privé'),
        ('ROLE_BASED', 'Basé sur le rôle'),
        ('PUBLIC', 'Public'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=255, verbose_name='Titre')
    description = models.TextField(blank=True, verbose_name='Description')
    file = models.FileField(upload_to='documents/%Y/%m/', verbose_name='Fichier')
    file_size = models.BigIntegerField(default=0, verbose_name='Taille du fichier')
    page_count = models.IntegerField(default=0, verbose_name='Nombre de pages')
    
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='documents',
        verbose_name='Propriétaire'
    )
    
    visibility = models.CharField(
        max_length=15,
        choices=VISIBILITY_CHOICES,
        default='PRIVATE',
        verbose_name='Visibilité'
    )
    
    tags = models.ManyToManyField(
        DocumentTag,
        blank=True,
        related_name='documents',
        verbose_name='Tags'
    )
    
    analyzed = models.BooleanField(default=False, verbose_name='Analysé')
    snippet = models.TextField(blank=True, verbose_name='Extrait')
    mayan_document_id = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        verbose_name='ID Mayan EDMS'
    )
    
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Créé le')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Modifié le')
    
    class Meta:
        verbose_name = 'Document'
        verbose_name_plural = 'Documents'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['-created_at']),
            models.Index(fields=['owner']),
            models.Index(fields=['visibility']),
        ]
    
    def __str__(self):
        return self.title
    
    @property
    def file_url(self):
        """URL complète du fichier"""
        if self.file:
            return self.file.url
        return None


class DocumentAnalysis(models.Model):
    """Résultats de l'analyse IA d'un document"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    document = models.OneToOneField(
        Document,
        on_delete=models.CASCADE,
        related_name='analysis',
        verbose_name='Document'
    )
    summary = models.TextField(verbose_name='Résumé')
    key_points = models.JSONField(default=list, verbose_name='Points clés')
    model_used = models.CharField(max_length=100, verbose_name='Modèle utilisé')
    analyzed_at = models.DateTimeField(auto_now_add=True, verbose_name='Analysé le')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Mis à jour le')
    
    class Meta:
        verbose_name = 'Analyse de document'
        verbose_name_plural = 'Analyses de documents'
        ordering = ['-analyzed_at']
    
    def __str__(self):
        return f"Analyse de {self.document.title}"


