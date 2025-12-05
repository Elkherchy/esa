from django.contrib import admin
from .models import DocumentAccessLog


@admin.register(DocumentAccessLog)
class DocumentAccessLogAdmin(admin.ModelAdmin):
    list_display = ['document', 'user', 'action', 'accessed_at']
    list_filter = ['action', 'accessed_at']
    search_fields = ['document__title', 'user__email']
    readonly_fields = ['id', 'accessed_at']
    date_hierarchy = 'accessed_at'


