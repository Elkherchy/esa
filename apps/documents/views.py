from rest_framework import status, generics, filters
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser
from django.shortcuts import get_object_or_404
from django.db.models import Q

from .models import Document, DocumentTag
from .serializers import (
    DocumentSerializer, DocumentListSerializer, DocumentCreateSerializer,
    DocumentUpdateSerializer, DocumentTagSerializer
)
from .tasks import analyze_document_task
from services.file_service import FileService


class DocumentListCreateView(generics.ListCreateAPIView):
    """Liste et création de documents"""
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['created_at', 'title', 'file_size']
    ordering = ['-created_at']
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return DocumentCreateSerializer
        return DocumentListSerializer
    
    def get_queryset(self):
        user = self.request.user
        
        # Base queryset selon les permissions
        if user.is_admin:
            queryset = Document.objects.all()
        else:
            # Utilisateur voit:
            # - Ses documents
            # - Documents publics
            # - Documents role_based si il a un rôle approprié
            queryset = Document.objects.filter(
                Q(owner=user) |
                Q(visibility='PUBLIC') |
                Q(visibility='ROLE_BASED', owner__role=user.role)
            ).distinct()
        
        # Filtres
        search = self.request.query_params.get('search')
        visibility = self.request.query_params.get('visibility')
        tags = self.request.query_params.get('tags')
        analyzed = self.request.query_params.get('analyzed')
        owner = self.request.query_params.get('owner')
        date_from = self.request.query_params.get('date_from')
        date_to = self.request.query_params.get('date_to')
        
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) |
                Q(description__icontains=search) |
                Q(snippet__icontains=search)
            )
        
        if visibility:
            queryset = queryset.filter(visibility=visibility)
        
        if tags:
            tag_names = tags.split(',')
            queryset = queryset.filter(tags__name__in=tag_names)
        
        if analyzed is not None:
            is_analyzed = analyzed.lower() == 'true'
            queryset = queryset.filter(analyzed=is_analyzed)
        
        if owner and user.is_admin:
            queryset = queryset.filter(owner__id=owner)
        
        if date_from:
            queryset = queryset.filter(created_at__gte=date_from)
        
        if date_to:
            queryset = queryset.filter(created_at__lte=date_to)
        
        return queryset.select_related('owner').prefetch_related('tags')
    
    def perform_create(self, serializer):
        # Valider le fichier
        file = self.request.FILES.get('file')
        if not file:
            raise ValueError("Aucun fichier fourni")
        
        is_valid, error = FileService.validate_file(file)
        if not is_valid:
            raise ValueError(error)
        
        # Créer le document
        document = serializer.save(owner=self.request.user)
        
        # Lancer l'analyse asynchrone
        analyze_document_task.delay(str(document.id))
        
        return document


class DocumentDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Détails, mise à jour et suppression d'un document"""
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.request.method in ['PATCH', 'PUT']:
            return DocumentUpdateSerializer
        return DocumentSerializer
    
    def get_queryset(self):
        user = self.request.user
        
        if user.is_admin:
            return Document.objects.all()
        
        # Utilisateur ne peut accéder qu'à:
        # - Ses documents
        # - Documents publics
        # - Documents avec permissions appropriées
        return Document.objects.filter(
            Q(owner=user) |
            Q(visibility='PUBLIC') |
            Q(visibility='ROLE_BASED', owner__role=user.role)
        ).distinct()
    
    def perform_update(self, serializer):
        # Vérifier les permissions
        document = self.get_object()
        user = self.request.user
        
        if document.owner != user and not user.is_admin:
            raise PermissionError("Vous n'avez pas la permission de modifier ce document")
        
        serializer.save()
    
    def perform_destroy(self, instance):
        # Vérifier les permissions
        user = self.request.user
        
        if instance.owner != user and not user.is_admin:
            raise PermissionError("Vous n'avez pas la permission de supprimer ce document")
        
        # Supprimer le fichier physique
        if instance.file:
            instance.file.delete()
        
        instance.delete()


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def analyze_document(request, pk):
    """Lance l'analyse IA d'un document"""
    document = get_object_or_404(Document, pk=pk)
    
    # Vérifier les permissions
    user = request.user
    if document.owner != user and not user.is_admin:
        return Response({
            'error': 'Vous n\'avez pas la permission d\'analyser ce document'
        }, status=status.HTTP_403_FORBIDDEN)
    
    # Lancer l'analyse
    task = analyze_document_task.delay(str(document.id))
    
    return Response({
        'message': 'Analyse lancée',
        'task_id': task.id,
        'document_id': str(document.id)
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def document_tags(request):
    """Liste des tags de documents"""
    tags = DocumentTag.objects.all().order_by('name')
    serializer = DocumentTagSerializer(tags, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def document_stats(request):
    """Statistiques des documents (admin uniquement)"""
    if not request.user.is_admin:
        return Response({
            'error': 'Permission refusée'
        }, status=status.HTTP_403_FORBIDDEN)
    
    total_documents = Document.objects.count()
    analyzed_documents = Document.objects.filter(analyzed=True).count()
    
    return Response({
        'total_documents': total_documents,
        'analyzed_documents': analyzed_documents,
        'analyzed_percentage': (analyzed_documents / total_documents * 100) if total_documents > 0 else 0,
    })



