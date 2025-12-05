import React, { useState, useEffect } from 'react';
import { Search, Filter, X, ChevronRight, Eye, Globe, Lock, Users } from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Chip } from '../ui/Chip';
import { Button } from '../ui/Button';
import { Select } from '../ui/Select';
import { apiService } from '../../services/api';

interface DocumentsListProps {
  onNavigate: (page: string, documentId?: string) => void;
}

export function DocumentsList({ onNavigate }: DocumentsListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [dateFilter, setDateFilter] = useState('all');
  const [visibilityFilter, setVisibilityFilter] = useState('all');
  const [tagFilter, setTagFilter] = useState('all');

  const [documents, setDocuments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [availableTags, setAvailableTags] = useState<string[]>([]);

  // Charger les documents et tags au montage
  useEffect(() => {
    loadDocuments();
    loadTags();
  }, []);

  // Recharger les documents quand les filtres changent
  useEffect(() => {
    loadDocuments();
  }, [searchQuery, visibilityFilter, tagFilter, dateFilter]);

  const loadDocuments = async () => {
    setIsLoading(true);
    try {
      const params: any = {
        ordering: '-created_at',
      };

      if (searchQuery.trim()) {
        params.search = searchQuery.trim();
      }

      if (visibilityFilter !== 'all') {
        params.visibility = visibilityFilter.toUpperCase();
      }

      if (tagFilter !== 'all') {
        params.tags = tagFilter;
      }

      // Gestion des dates
      if (dateFilter !== 'all') {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        
        switch (dateFilter) {
          case 'today':
            params.date_from = today.toISOString().split('T')[0];
            break;
          case 'week':
            const weekAgo = new Date(today);
            weekAgo.setDate(weekAgo.getDate() - 7);
            params.date_from = weekAgo.toISOString().split('T')[0];
            break;
          case 'month':
            const monthAgo = new Date(today);
            monthAgo.setMonth(monthAgo.getMonth() - 1);
            params.date_from = monthAgo.toISOString().split('T')[0];
            break;
        }
      }

      const response = await apiService.getDocuments(params);
      if (response.data) {
        setDocuments(response.data.results || []);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des documents:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadTags = async () => {
    try {
      const response = await apiService.getTags();
      if (response.data) {
        setAvailableTags(response.data.map((tag: any) => tag.name));
      }
    } catch (error) {
      console.error('Erreur lors du chargement des tags:', error);
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

  // Les filtres sont maintenant gérés côté serveur via l'API
  const filteredDocuments = documents;

  const handleResetFilters = () => {
    setSearchQuery('');
    setDateFilter('all');
    setVisibilityFilter('all');
    setTagFilter('all');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-[#111827] mb-2">Mes documents</h1>
        <p className="text-[#6B7280]">Gérez et recherchez vos documents</p>
      </div>

      {/* Search and filters */}
      <Card>
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9CA3AF]" />
              <input
                type="text"
                placeholder="Rechercher par titre, tags, contenu..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 rounded-lg border border-[#E5E7EB] bg-white text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#1D4ED8] focus:border-transparent"
              />
            </div>
            <Button 
              variant="ghost" 
              className="border border-[#E5E7EB]"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="w-4 h-4" />
              Filtres
            </Button>
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-[#E5E7EB]">
              <Select
                label="Date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                options={[
                  { value: 'all', label: 'Toutes les dates' },
                  { value: 'today', label: "Aujourd'hui" },
                  { value: 'week', label: 'Cette semaine' },
                  { value: 'month', label: 'Ce mois' }
                ]}
              />
              
              <Select
                label="Visibilité"
                value={visibilityFilter}
                onChange={(e) => setVisibilityFilter(e.target.value)}
                options={[
                  { value: 'all', label: 'Toutes' },
                  { value: 'PRIVATE', label: 'Privé' },
                  { value: 'ROLE_BASED', label: 'Par rôle' },
                  { value: 'PUBLIC', label: 'Public' }
                ]}
              />
              
              <Select
                label="Tag"
                value={tagFilter}
                onChange={(e) => setTagFilter(e.target.value)}
                options={[
                  { value: 'all', label: 'Tous les tags' },
                  ...availableTags.map(tag => ({ value: tag, label: tag }))
                ]}
              />
              
              <div className="md:col-span-3 flex justify-end">
                <button 
                  onClick={handleResetFilters}
                  className="text-sm text-[#1D4ED8] hover:text-[#1E40AF] flex items-center gap-1"
                >
                  <X className="w-4 h-4" />
                  Réinitialiser les filtres
                </button>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Documents list */}
      {isLoading ? (
        <Card>
          <div className="py-12 text-center">
            <div className="flex items-center justify-center gap-2">
              <div className="w-5 h-5 border-2 border-[#1D4ED8] border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm text-[#6B7280]">Chargement des documents...</span>
            </div>
          </div>
        </Card>
      ) : filteredDocuments.length === 0 ? (
        <Card>
          <div className="py-12 text-center">
            <p className="text-sm text-[#6B7280]">Aucun document trouvé</p>
          </div>
        </Card>
      ) : (
        <Card padding="none" className="overflow-hidden">
          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto min-w-[600px]">
          <table className="w-full">
            <thead className="bg-[#F9FAFB] border-b border-[#E5E7EB]">
              <tr>
                <th className="text-left px-6 py-4 text-xs text-[#6B7280]">Titre</th>
                  <th className="text-left px-6 py-4 text-xs text-[#6B7280]">Propriétaire</th>
                <th className="text-left px-6 py-4 text-xs text-[#6B7280]">Tags</th>
                <th className="text-left px-6 py-4 text-xs text-[#6B7280]">Visibilité</th>
                  <th className="text-left px-6 py-4 text-xs text-[#6B7280]">Date</th>
                  <th className="text-left px-6 py-4 text-xs text-[#6B7280]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB]">
                {filteredDocuments.map((doc) => {
                const visConfig = getVisibilityConfig(doc.visibility);
                const VisIcon = visConfig.icon;
                  const ownerName = doc.owner?.display_name || doc.owner?.email || 'Inconnu';
                  const createdAt = doc.created_at || doc.createdAt;
                  const tags = doc.tags || [];
                
                return (
                    <tr key={doc.id} className="hover:bg-[#F9FAFB] transition-colors cursor-pointer" onClick={() => onNavigate('document-detail', doc.id)}>
                    <td className="px-6 py-4">
                      <div className="text-sm text-[#111827]">{doc.title}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-[#6B7280]">{ownerName}</div>
                    </td>
                    <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1.5">
                          {tags.map((tag: any) => (
                            <Chip key={typeof tag === 'string' ? tag : tag.name} size="sm">
                              {typeof tag === 'string' ? tag : tag.name}
                            </Chip>
                        ))}
                      </div>
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
                      <Button 
                        size="sm" 
                        variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            onNavigate('document-detail', doc.id);
                          }}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

          {/* Mobile list */}
          <div className="md:hidden divide-y divide-[#E5E7EB]">
            {filteredDocuments.map((doc) => {
          const visConfig = getVisibilityConfig(doc.visibility);
          const VisIcon = visConfig.icon;
              const ownerName = doc.owner?.display_name || doc.owner?.email || 'Inconnu';
              const createdAt = doc.created_at || doc.createdAt;
              const tags = doc.tags || [];
          
          return (
                <div 
              key={doc.id} 
                  className="p-4 cursor-pointer hover:bg-[#F9FAFB] transition-colors"
              onClick={() => onNavigate('document-detail', doc.id)}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-[#111827] mb-1">{doc.title}</h4>
                      <div className="text-xs text-[#6B7280] mb-2">{ownerName}</div>
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        {tags.map((tag: any, i: number) => (
                          <Chip key={i} size="sm">
                            {typeof tag === 'string' ? tag : tag.name}
                          </Chip>
                    ))}
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant={visConfig.variant} size="sm">
                      <VisIcon className="w-3 h-3 mr-1" />
                      {visConfig.label}
                    </Badge>
                    <span className="text-xs text-[#9CA3AF]">
                          {new Date(createdAt).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-[#9CA3AF] flex-shrink-0" />
              </div>
                </div>
          );
        })}
      </div>
        </Card>
      )}

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-[#6B7280]">
          {filteredDocuments.length === 0 ? (
            <span>Aucun document trouvé</span>
          ) : (
            <>
              Affichage de <span className="text-[#111827]">1-{filteredDocuments.length}</span> sur <span className="text-[#111827]">{filteredDocuments.length}</span> document{filteredDocuments.length > 1 ? 's' : ''}
            </>
          )}
        </p>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" disabled>
            Précédent
          </Button>
          <Button variant="ghost" size="sm" disabled>
            Suivant
          </Button>
        </div>
      </div>
    </div>
  );
}
