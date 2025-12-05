import React, { useState } from 'react';
import { Search, Filter, Sparkles, FileText, Calendar } from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Chip } from '../ui/Chip';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { apiService } from '../../services/api';

interface SearchPageProps {
  onNavigate: (page: string, documentId?: string) => void;
}

export function SearchPage({ onNavigate }: SearchPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      return;
    }

    setIsSearching(true);
    setSearchPerformed(true);
    
    try {
      const response = await apiService.getDocuments({
        search: searchQuery.trim(),
        ordering: '-created_at'
      });

      if (response.data) {
        setSearchResults(response.data.results || []);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Erreur lors de la recherche:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-[#111827] mb-2">Recherche intelligente</h1>
        <p className="text-[#6B7280]">Recherchez dans vos documents avec l'aide de l'IA</p>
      </div>

      {/* Search box */}
      <Card className="bg-gradient-to-br from-white to-[#F9FAFB]">
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-[#9CA3AF]" />
              <input
                type="text"
                placeholder="Rechercher par titre, contenu, mots-clés IA..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full pl-14 pr-4 py-4 rounded-lg border-2 border-[#E5E7EB] bg-white text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#1D4ED8] focus:border-transparent text-base"
              />
            </div>
            <Button variant="primary" size="lg" onClick={handleSearch}>
              <Search className="w-5 h-5" />
              Rechercher
            </Button>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-[#6B7280]">Suggestions:</span>
            <button 
              className="px-3 py-1 rounded-full bg-[#F3F4F6] text-xs text-[#6B7280] hover:bg-[#E5E7EB] transition-colors"
              onClick={() => handleSuggestionClick('rapport')}
            >
              rapport
            </button>
            <button 
              className="px-3 py-1 rounded-full bg-[#F3F4F6] text-xs text-[#6B7280] hover:bg-[#E5E7EB] transition-colors"
              onClick={() => handleSuggestionClick('contrat')}
            >
              contrat
            </button>
            <button 
              className="px-3 py-1 rounded-full bg-[#F3F4F6] text-xs text-[#6B7280] hover:bg-[#E5E7EB] transition-colors"
              onClick={() => handleSuggestionClick('stratégie')}
            >
              stratégie
            </button>
            <button 
              className="px-3 py-1 rounded-full bg-[#F3F4F6] text-xs text-[#6B7280] hover:bg-[#E5E7EB] transition-colors"
              onClick={() => handleSuggestionClick('budget')}
            >
              budget
            </button>
          </div>
        </div>
      </Card>

      {/* AI Info */}
      <Card className="bg-gradient-to-br from-[#DBEAFE] to-[#CFFAFE] border-[#93C5FD]">
        <div className="flex gap-3">
          <Sparkles className="w-5 h-5 text-[#1D4ED8] flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-[#1D4ED8] text-sm mb-1">Recherche alimentée par l'IA</h4>
            <p className="text-xs text-[#0891B2]">
              Notre IA locale analyse le contenu et les métadonnées pour vous fournir les résultats les plus pertinents.
            </p>
          </div>
        </div>
      </Card>

      {/* Results */}
      {searchPerformed ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-[#111827]">
              {isSearching ? 'Recherche en cours...' : (
                `${searchResults.length} résultat${searchResults.length > 1 ? 's' : ''} trouvé${searchResults.length > 1 ? 's' : ''}`
              )}
            </h3>
          </div>

          {isSearching ? (
            <Card>
              <div className="py-12 text-center">
                <div className="w-8 h-8 border-2 border-[#1D4ED8] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-sm text-[#6B7280]">Recherche en cours...</p>
              </div>
            </Card>
          ) : searchResults.length === 0 ? (
            <Card>
              <div className="py-12 text-center">
                <p className="text-sm text-[#6B7280]">Aucun résultat trouvé pour "{searchQuery}"</p>
              </div>
            </Card>
          ) : (
            searchResults.map((result) => {
              const tags = result.tags || [];
              const createdAt = result.created_at || result.createdAt;
              const snippet = result.snippet || result.description || 'Pas de description disponible';
              const analyzed = result.analyzed || false;
              const aiKeywords = result.analysis?.key_points || [];

              return (
                <Card 
                  key={result.id}
                  className="hover:border-[#1D4ED8] cursor-pointer transition-all"
                  onClick={() => onNavigate('document-detail', result.id)}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-[#DBEAFE] rounded-lg flex items-center justify-center flex-shrink-0">
                      <FileText className="w-6 h-6 text-[#1D4ED8]" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <h3 className="text-[#111827]">{result.title}</h3>
                        {analyzed && (
                          <Badge variant="success" size="sm">
                            <Sparkles className="w-3 h-3 mr-1" />
                            Analysé
                          </Badge>
                        )}
                      </div>

                      <p className="text-sm text-[#6B7280] mb-3 line-clamp-2">
                        {snippet}
                      </p>

                      <div className="flex flex-wrap items-center gap-3 mb-3">
                        <div className="flex items-center gap-1.5 text-xs text-[#6B7280]">
                          <Calendar className="w-3.5 h-3.5" />
                          {new Date(createdAt).toLocaleDateString('fr-FR')}
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {tags.map((tag: any, i: number) => (
                            <Chip key={i} variant="secondary">
                              {typeof tag === 'string' ? tag : tag.name}
                            </Chip>
                          ))}
                        </div>
                      </div>

                      {analyzed && aiKeywords.length > 0 && (
                        <div className="flex items-center gap-2 flex-wrap">
                          <div className="flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-[#06B6D4]" />
                            <span className="text-xs text-[#6B7280]">Mots-clés IA:</span>
                          </div>
                          {aiKeywords.map((keyword: string, i: number) => (
                            <span key={i} className="text-xs text-[#06B6D4]">
                              {keyword}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      ) : (
        <Card className="py-16">
          <div className="text-center">
            <div className="w-16 h-16 bg-[#F3F4F6] rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-[#9CA3AF]" />
            </div>
            <h3 className="text-[#111827] mb-2">Commencez votre recherche</h3>
            <p className="text-sm text-[#6B7280]">
              Utilisez la barre de recherche ci-dessus pour trouver vos documents
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}
