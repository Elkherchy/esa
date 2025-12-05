import uuid
from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """Modèle utilisateur personnalisé avec gestion des rôles"""
    
    ROLE_CHOICES = [
        ('USER', 'Utilisateur'),
        ('ADMIN', 'Administrateur'),
    ]
    
    ORIGIN_CHOICES = [
        ('LOCAL', 'Local'),
        ('SSO', 'SSO'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True, verbose_name='Email')
    username = models.CharField(max_length=150, unique=True)
    first_name = models.CharField(max_length=150, verbose_name='Prénom')
    last_name = models.CharField(max_length=150, verbose_name='Nom')
    role = models.CharField(
        max_length=10,
        choices=ROLE_CHOICES,
        default='USER',
        verbose_name='Rôle'
    )
    origin = models.CharField(
        max_length=10,
        choices=ORIGIN_CHOICES,
        default='LOCAL',
        verbose_name='Origine'
    )
    is_active = models.BooleanField(default=True, verbose_name='Actif')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Créé le')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Modifié le')
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'first_name', 'last_name']
    
    class Meta:
        verbose_name = 'Utilisateur'
        verbose_name_plural = 'Utilisateurs'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.email})"
    
    @property
    def display_name(self):
        """Nom d'affichage de l'utilisateur"""
        return f"{self.first_name} {self.last_name}".strip() or self.username
    
    @property
    def is_admin(self):
        """Vérifie si l'utilisateur est admin"""
        return self.role == 'ADMIN'


