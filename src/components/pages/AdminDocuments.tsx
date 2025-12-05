import React, { useState, useEffect } from 'react';
import { Upload, Eye, Shield, Globe, Lock, Users, X, FileText, CheckCircle2 } from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Chip } from '../ui/Chip';
import { apiService } from '../../services/api';

interface AdminDocumentsProps {
  onNavigate: (page: string, documentId?: string) => void;
}

export function AdminDocuments({ onNavigate }: AdminDocumentsProps) {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    visibility: 'PRIVATE',
    tags: [] as string[]
  });
  const [tagInput, setTagInput] = useState('');
  const [fileError, setFileError] = useState('');

  const [documents, setDocuments] = useState<any[]>([]);
  const [isLoadingDocuments, setIsLoadingDocuments] = useState(true);
  const [uploadError, setUploadError] = useState('');

  // Charger les documents au montage du composant
  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    setIsLoadingDocuments(true);
    try {
      const response = await apiService.getDocuments({ ordering: '-created_at' });
      
      console.log('📄 Réponse documents:', response);
      
      if (response.error) {
        console.error('❌ Erreur API:', response.error, 'Status:', response.status);
        // Afficher un message d'erreur à l'utilisateur
        if (response.status === 500) {
          alert('Erreur serveur (500). Vérifiez que le backend est bien démarré.');
        } else if (response.status === 403) {
          alert('Accès refusé. Vous devez être administrateur.');
        }
        setDocuments([]);
      } else if (response.data) {
        setDocuments(response.data.results || []);
        console.log('✅ Documents chargés:', response.data.results?.length || 0);
      }
    } catch (error) {
      console.error('❌ Exception lors du chargement:', error);
      setDocuments([]);
    } finally {
      setIsLoadingDocuments(false);
    }
  };

  const getVisibilityConfig = (visibility: string) => {
    const configs = {
      PRIVATE: { icon: Lock, label: 'Privé', variant: 'error' as const },
      ROLE_BASED: { icon: Users, label: 'Par rôle', variant: 'warning' as const },
      PUBLIC: { icon: Globe, label: 'Public', variant: 'success' as const }
    };
    return configs[visibility as keyof typeof configs];
  };

  const validateFile = (file: File): string | null => {
    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
    const maxSize = 50 * 1024 * 1024; // 50MB

    if (!allowedTypes.includes(file.type) && !file.name.match(/\.(pdf|docx|txt)$/i)) {
      return 'Type de fichier non supporté. Formats acceptés: PDF, DOCX, TXT';
    }

    if (file.size > maxSize) {
      return 'Le fichier est trop volumineux. Taille maximale: 50MB';
    }

    return null;
  };

  const handleFileSelect = (file: File | null) => {
    if (!file) {
      setSelectedFile(null);
      setFileError('');
      return;
    }

    const error = validateFile(file);
    if (error) {
      setFileError(error);
      setSelectedFile(null);
      return;
    }

    setFileError('');
    setSelectedFile(file);
    
    // Auto-remplir le titre si vide
    if (!formData.title) {
      const fileNameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
      setFormData({ ...formData, title: fileNameWithoutExt });
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    handleFileSelect(file);
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tagInput.trim()]
      });
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(tag => tag !== tagToRemove)
    });
  };

  const handleTagInputKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const resetForm = () => {
    setSelectedFile(null);
    setFormData({
      title: '',
      visibility: 'PRIVATE',
      tags: []
    });
    setTagInput('');
    setFileError('');
    setUploadProgress(0);
    setUploadSuccess(false);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setFileError('Veuillez sélectionner un fichier');
      return;
    }

    if (!formData.title.trim()) {
      setFileError('Veuillez saisir un titre');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setFileError('');
    setUploadError('');
    
    try {
      // Simuler la progression pendant l'upload
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // Appel API réel
      const response = await apiService.uploadDocument(selectedFile, {
        title: formData.title,
        visibility: formData.visibility as 'PRIVATE' | 'ROLE_BASED' | 'PUBLIC',
        tags: formData.tags,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (response.error) {
        setUploadError(response.error);
        setIsUploading(false);
        return;
      }

      if (response.data) {
        setIsUploading(false);
        setUploadSuccess(true);
        
        // Recharger la liste des documents
        await loadDocuments();
        
        setTimeout(() => {
          setShowUploadModal(false);
          resetForm();
        }, 2000);
      }
    } catch (error) {
      setUploadError('Une erreur est survenue lors du téléversement');
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleCloseModal = () => {
    if (!isUploading) {
      setShowUploadModal(false);
      resetForm();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-[#111827] mb-2">Gestion des documents</h1>
          <p className="text-[#6B7280]">Gérez tous les documents du système</p>
        </div>
        <Button 
          variant="primary"
          onClick={() => setShowUploadModal(true)}
        >
          <Upload className="w-4 h-4" />
          Téléverser un document
        </Button>
      </div>

      {/* Documents table */}
      <Card padding="none" className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead className="bg-[#F9FAFB] border-b border-[#E5E7EB]">
              <tr>
                <th className="text-left px-6 py-4 text-xs text-[#6B7280]">Titre</th>
                <th className="text-left px-6 py-4 text-xs text-[#6B7280]">Propriétaire</th>
                <th className="text-left px-6 py-4 text-xs text-[#6B7280]">Visibilité</th>
                <th className="text-left px-6 py-4 text-xs text-[#6B7280]">Créé le</th>
                <th className="text-left px-6 py-4 text-xs text-[#6B7280]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB]">
              {isLoadingDocuments ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-[#1D4ED8] border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-sm text-[#6B7280]">Chargement des documents...</span>
                    </div>
                  </td>
                </tr>
              ) : documents.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <p className="text-sm text-[#6B7280]">Aucun document trouvé</p>
                  </td>
                </tr>
              ) : (
                documents.map((doc) => {
                  const visConfig = getVisibilityConfig(doc.visibility);
                  const VisIcon = visConfig.icon;
                  const ownerName = doc.owner?.display_name || doc.owner?.email || 'Inconnu';
                  const createdAt = doc.created_at || doc.createdAt;
                  
                  return (
                    <tr key={doc.id} className="hover:bg-[#F9FAFB] transition-colors">
                      <td className="px-6 py-4">
                        <div className="text-sm text-[#111827]">{doc.title}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-[#6B7280]">{ownerName}</div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={visConfig.variant}>
                          <VisIcon className="w-3 h-3 mr-1" />
                          {visConfig.label}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-[#6B7280]">
                          {new Date(createdAt).toLocaleDateString('fr-FR')}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => onNavigate('document-detail', doc.id)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => onNavigate('admin-permissions', doc.id)}
                          >
                            <Shield className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Upload Modal */}
      {showUploadModal && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget && !isUploading) {
              handleCloseModal();
            }
          }}
        >
          <Card className="w-full max-w-[720px] max-h-[90vh] overflow-y-auto bg-white shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-[#111827]">Téléverser un document</h2>
              <button 
                onClick={handleCloseModal}
                className="text-[#6B7280] hover:text-[#111827] disabled:opacity-50 transition-colors"
                disabled={isUploading}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {uploadSuccess ? (
              <div className="py-12 text-center">
                <div className="w-16 h-16 bg-[#D1FAE5] rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-8 h-8 text-[#10B981]" />
                </div>
                <h3 className="text-[#111827] mb-2">Document téléversé avec succès!</h3>
                <p className="text-[#6B7280] text-sm">L'analyse IA sera lancée automatiquement</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* File upload zone */}
                <div>
                  <label className="text-sm font-medium text-[#374151] mb-2 block">Fichier <span className="text-[#EF4444]">*</span></label>
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => document.getElementById('file-input')?.click()}
                    className={`border-2 border-dashed rounded-lg p-8 text-center transition-all cursor-pointer ${
                      isDragging
                        ? 'border-[#1D4ED8] bg-[#F0F9FF]'
                        : selectedFile
                        ? 'border-[#10B981] bg-[#F0FDF4]'
                        : 'border-[#E5E7EB] hover:border-[#1D4ED8] hover:bg-[#F9FAFB]'
                    }`}
                  >
                    <input
                      id="file-input"
                      type="file"
                      accept=".pdf,.docx,.txt"
                      onChange={handleFileInputChange}
                      className="hidden"
                      disabled={isUploading}
                    />
                    {selectedFile ? (
                      <>
                        <FileText className="w-12 h-12 text-[#10B981] mx-auto mb-3" />
                        <p className="text-sm font-medium text-[#111827] mb-1">
                          {selectedFile.name}
                        </p>
                        <p className="text-xs text-[#6B7280]">
                          {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedFile(null);
                            setFileError('');
                          }}
                          className="mt-3 text-xs text-[#EF4444] hover:underline"
                          disabled={isUploading}
                        >
                          Supprimer
                        </button>
                      </>
                    ) : (
                      <>
                        <Upload className="w-12 h-12 text-[#9CA3AF] mx-auto mb-3" />
                        <p className="text-sm text-[#111827] mb-1">
                          Glissez-déposez votre fichier ici
                        </p>
                        <p className="text-xs text-[#6B7280] mb-3">
                          ou cliquez pour parcourir
                        </p>
                        <p className="text-xs text-[#9CA3AF]">
                          PDF, DOCX, TXT jusqu'à 50MB
                        </p>
                      </>
                    )}
                  </div>
                  {fileError && (
                    <p className="text-xs text-[#EF4444] mt-2">{fileError}</p>
                  )}
                </div>

                <Input
                  label="Titre du document"
                  placeholder="Ex: Rapport annuel 2024"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  disabled={isUploading}
                  required
                />

                <Select
                  label="Visibilité"
                  value={formData.visibility}
                  onChange={(e) => setFormData({ ...formData, visibility: e.target.value })}
                  options={[
                    { value: 'PRIVATE', label: 'Privé - Uniquement vous' },
                    { value: 'ROLE_BASED', label: 'Par rôle - Selon les permissions' },
                    { value: 'PUBLIC', label: 'Public - Tous les utilisateurs' }
                  ]}
                  disabled={isUploading}
                />

                <div>
                  <label className="text-sm font-medium text-[#374151] mb-2 block">Tags</label>
                  {formData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {formData.tags.map((tag) => (
                        <Chip 
                          key={tag}
                          onRemove={isUploading ? undefined : () => handleRemoveTag(tag)}
                        >
                          {tag}
                        </Chip>
                      ))}
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Input 
                      placeholder="Ajouter un tag..." 
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyPress={handleTagInputKeyPress}
                      disabled={isUploading}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={handleAddTag}
                      disabled={isUploading || !tagInput.trim()}
                    >
                      Ajouter
                    </Button>
                  </div>
                </div>

                {(isUploading || uploadError) && (
                  <div>
                    {uploadError && (
                      <div className="mb-3 p-3 bg-[#FEE2E2] rounded-lg border border-[#FCA5A5]">
                        <p className="text-sm text-[#DC2626]">{uploadError}</p>
                      </div>
                    )}
                    {isUploading && (
                      <>
                        <div className="flex items-center justify-between text-sm mb-2">
                          <span className="text-[#6B7280]">Téléversement en cours...</span>
                          <span className="text-[#111827]">{uploadProgress}%</span>
                        </div>
                        <div className="h-2 bg-[#E5E7EB] rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-[#1D4ED8] to-[#06B6D4] transition-all duration-300"
                            style={{ width: `${uploadProgress}%` }}
                          />
                        </div>
                      </>
                    )}
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <Button 
                    variant="primary" 
                    className="flex-1"
                    onClick={handleUpload}
                    disabled={isUploading}
                  >
                    {isUploading ? 'Téléversement...' : 'Téléverser'}
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="flex-1 border border-[#E5E7EB]"
                    onClick={handleCloseModal}
                    disabled={isUploading}
                  >
                    Annuler
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}
