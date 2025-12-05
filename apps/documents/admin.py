from django.contrib import admin
from .models import Document, DocumentTag, DocumentAnalysis


@admin.register(DocumentTag)
class DocumentTagAdmin(admin.ModelAdmin):
    list_display = ['name', 'color', 'created_at']
    search_fields = ['name']
    ordering = ['name']


class DocumentAnalysisInline(admin.StackedInline):
    model = DocumentAnalysis
    extra = 0
    readonly_fields = ['analyzed_at', 'updated_at']


@admin.register(Document)
class DocumentAdmin(admin.ModelAdmin):
    list_display = ['title', 'owner', 'visibility', 'analyzed', 'file_size', 'created_at']
    list_filter = ['visibility', 'analyzed', 'created_at', 'tags']
    search_fields = ['title', 'description', 'owner__email']
    readonly_fields = ['id', 'file_size', 'page_count', 'created_at', 'updated_at']
    filter_horizontal = ['tags']
    inlines = [DocumentAnalysisInline]
    
    fieldsets = (
        ('Informations générales', {
            'fields': ('id', 'title', 'description', 'owner')
        }),
        ('Fichier', {
            'fields': ('file', 'file_size', 'page_count', 'snippet')
        }),
        ('Configuration', {
            'fields': ('visibility', 'tags', 'analyzed')
        }),
        ('Intégration', {
            'fields': ('mayan_document_id',)
        }),
        ('Dates', {
            'fields': ('created_at', 'updated_at')
        }),
    )


@admin.register(DocumentAnalysis)
class DocumentAnalysisAdmin(admin.ModelAdmin):
    list_display = ['document', 'model_used', 'analyzed_at']
    list_filter = ['model_used', 'analyzed_at']
    search_fields = ['document__title', 'summary']
    readonly_fields = ['analyzed_at', 'updated_at']



