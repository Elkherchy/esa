from django.urls import path
from . import views

app_name = 'documents'

urlpatterns = [
    # Documents
    path('', views.DocumentListCreateView.as_view(), name='document_list'),
    path('<uuid:pk>/', views.DocumentDetailView.as_view(), name='document_detail'),
    path('<uuid:pk>/analyze/', views.analyze_document, name='document_analyze'),
    
    # Tags
    path('tags/', views.document_tags, name='document_tags'),
    
    # Stats
    path('stats/', views.document_stats, name='document_stats'),
]



