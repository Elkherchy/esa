from rest_framework import serializers
from .models import Document, DocumentTag, DocumentAnalysis
from apps.accounts.serializers import UserSerializer


class DocumentTagSerializer(serializers.ModelSerializer):
    """Serializer pour les tags"""
    
    class Meta:
        model = DocumentTag
        fields = ['id', 'name', 'color', 'created_at']
        read_only_fields = ['id', 'created_at']


class DocumentAnalysisSerializer(serializers.ModelSerializer):
    """Serializer pour l'analyse de document"""
    
    class Meta:
        model = DocumentAnalysis
        fields = ['id', 'summary', 'key_points', 'model_used', 'analyzed_at', 'updated_at']
        read_only_fields = ['id', 'analyzed_at', 'updated_at']


class DocumentSerializer(serializers.ModelSerializer):
    """Serializer complet pour les documents"""
    owner = UserSerializer(read_only=True)
    tags = DocumentTagSerializer(many=True, read_only=True)
    analysis = DocumentAnalysisSerializer(read_only=True)
    file_url = serializers.SerializerMethodField()
    
    class Meta:
        model = Document
        fields = [
            'id', 'title', 'description', 'file', 'file_url', 'file_size',
            'page_count', 'owner', 'visibility', 'analyzed', 'tags',
            'analysis', 'snippet', 'mayan_document_id',
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'owner', 'file_size', 'page_count', 'analyzed',
            'snippet', 'mayan_document_id', 'created_at', 'updated_at'
        ]
    
    def get_file_url(self, obj):
        if obj.file:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.file.url)
            return obj.file.url
        return None


class DocumentCreateSerializer(serializers.ModelSerializer):
    """Serializer pour la création de documents"""
    tags = serializers.ListField(
        child=serializers.CharField(),
        required=False,
        write_only=True
    )
    
    class Meta:
        model = Document
        fields = ['title', 'description', 'file', 'visibility', 'tags']
    
    def create(self, validated_data):
        tags_data = validated_data.pop('tags', [])
        
        # Créer le document
        document = Document.objects.create(**validated_data)
        
        # Ajouter les tags
        for tag_name in tags_data:
            tag, _ = DocumentTag.objects.get_or_create(
                name=tag_name.strip(),
                defaults={'color': '#1D4ED8'}
            )
            document.tags.add(tag)
        
        # Extraire les infos du fichier
        from services.file_service import FileService
        
        file_path = document.file.path
        file_info = FileService.get_file_info(file_path)
        
        document.file_size = file_info['size']
        document.page_count = file_info['page_count']
        
        # Extraire un snippet
        text = FileService.extract_text(file_path)
        if text:
            document.snippet = FileService.generate_snippet(text)
        
        document.save()
        
        return document


class DocumentUpdateSerializer(serializers.ModelSerializer):
    """Serializer pour la mise à jour de documents"""
    tags = serializers.ListField(
        child=serializers.CharField(),
        required=False,
        write_only=True
    )
    
    class Meta:
        model = Document
        fields = ['title', 'description', 'visibility', 'tags']
    
    def update(self, instance, validated_data):
        tags_data = validated_data.pop('tags', None)
        
        # Mettre à jour les champs
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        # Mettre à jour les tags si fournis
        if tags_data is not None:
            instance.tags.clear()
            for tag_name in tags_data:
                tag, _ = DocumentTag.objects.get_or_create(
                    name=tag_name.strip(),
                    defaults={'color': '#1D4ED8'}
                )
                instance.tags.add(tag)
        
        instance.save()
        return instance


class DocumentListSerializer(serializers.ModelSerializer):
    """Serializer léger pour les listes de documents"""
    owner = UserSerializer(read_only=True)
    tags = DocumentTagSerializer(many=True, read_only=True)
    has_analysis = serializers.SerializerMethodField()
    
    class Meta:
        model = Document
        fields = [
            'id', 'title', 'description', 'file_size', 'page_count',
            'owner', 'visibility', 'analyzed', 'has_analysis', 'tags',
            'snippet', 'created_at', 'updated_at'
        ]
    
    def get_has_analysis(self, obj):
        return hasattr(obj, 'analysis')


