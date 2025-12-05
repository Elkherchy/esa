from django.contrib import admin
from .models import Permission


@admin.register(Permission)
class PermissionAdmin(admin.ModelAdmin):
    list_display = ['document', 'type', 'user', 'role', 'start_time', 'end_time', 'status', 'created_at']
    list_filter = ['type', 'status', 'created_at']
    search_fields = ['document__title', 'user__email', 'role']
    readonly_fields = ['id', 'created_at', 'updated_at']
    
    fieldsets = (
        ('Information', {
            'fields': ('id', 'document', 'type')
        }),
        ('Cible', {
            'fields': ('user', 'role')
        }),
        ('Période', {
            'fields': ('start_time', 'end_time', 'status')
        }),
        ('Dates', {
            'fields': ('created_at', 'updated_at')
        }),
    )
    
    def save_model(self, request, obj, form, change):
        obj.update_status()
        super().save_model(request, obj, form, change)


