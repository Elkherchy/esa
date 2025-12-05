import React, { useState, useEffect } from 'react';
import { Search, Filter, Clock, Sparkles, FileText, TrendingUp } from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Chip } from '../ui/Chip';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { apiService } from '../../services/api';

interface UserDashboardProps {
  userName: string;
  onNavigate: (page: string, documentId?: string) => void;
}

export function UserDashboard({ userName, onNavigate }: UserDashboardProps) {
  const [recentDocuments, setRecentDocuments] = useState<any[]>([]);
  const [aiStats, setAiStats] = useState({
    totalDocuments: 0,
    analyzedDocuments: 0,
    analyzedPercentage: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      // Charger les documents récents
      const docsResponse = await apiService.getDocuments({
        ordering: '-created_at',
        page_size: 4
      });

      if (docsResponse.data) {
        setRecentDocuments(docsResponse.data.results || []);
      }

      // Charger les statistiques
      const statsResponse = await apiService.getDocumentStats();
      if (statsResponse.data) {
        setAiStats({
          totalDocuments: statsResponse.data.total_documents,
          analyzedDocuments: statsResponse.data.analyzed_documents,
          analyzedPercentage: statsResponse.data.analyzed_percentage,
        });
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données du dashboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInDays > 0) {
      return `${diffInDays}j`;
    } else if (diffInHours > 0) {
      return `${diffInHours}h`;
    } else {
      return 'maintenant';
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome section */}
      <div>
        <h1 className="text-[#111827] mb-1">Bonjour, {userName}</h1>
        <p className="text-[#6B7280]">Bienvenue dans votre coffre-fort documentaire intelligent</p>
      </div>

      {/* Global search */}
      <Card className="bg-gradient-to-br from-white to-[#F9FAFB]">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9CA3AF]" />
            <input
              type="text"
              placeholder="Rechercher dans vos documents…"
              className="w-full pl-11 pr-4 py-3 rounded-lg border border-[#E5E7EB] bg-white text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#1D4ED8] focus:border-transparent"
            />
          </div>
          <Button variant="ghost" className="border border-[#E5E7EB]">
            <Filter className="w-4 h-4" />
            Filtres
          </Button>
        </div>
      </Card>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent documents - takes 2 columns on desktop */}
        <div className="lg:col-span-2">
          <Card>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-[#1D4ED8]" />
                <h3 className="text-[#111827]">Documents récents</h3>
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => onNavigate('documents')}
              >
                Voir tout
              </Button>
            </div>

            <div className="space-y-3">
              {isLoading ? (
                <div className="py-12 text-center">
                  <div className="w-8 h-8 border-2 border-[#1D4ED8] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-sm text-[#6B7280]">Chargement...</p>
                </div>
              ) : recentDocuments.length === 0 ? (
                <div className="py-12 text-center">
                  <p className="text-sm text-[#6B7280]">Aucun document récent</p>
                </div>
              ) : (
                recentDocuments.map((doc) => {
                  const tags = doc.tags || [];
                  const createdAt = doc.created_at || doc.createdAt;
                  return (
                    <div
                      key={doc.id}
                      onClick={() => onNavigate('document-detail', doc.id)}
                      className="p-4 rounded-lg border border-[#E5E7EB] hover:border-[#1D4ED8] hover:bg-[#F9FAFB] cursor-pointer transition-all group"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-3 flex-1">
                          <div className="w-10 h-10 bg-[#DBEAFE] rounded-lg flex items-center justify-center flex-shrink-0">
                            <FileText className="w-5 h-5 text-[#1D4ED8]" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-[#111827] text-sm mb-1 truncate">{doc.title}</h4>
                            <div className="flex flex-wrap gap-1.5">
                              {tags.map((tag: any, i: number) => (
                                <Chip key={i} variant="secondary">
                                  {typeof tag === 'string' ? tag : tag.name}
                                </Chip>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                          {doc.analyzed && (
                            <Badge variant="success" size="sm">
                              <Sparkles className="w-3 h-3 mr-1" />
                              Analysé
                            </Badge>
                          )}
                          <span className="text-xs text-[#9CA3AF]">
                            {getTimeAgo(createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </Card>
        </div>

        {/* AI Activity */}
        <div className="space-y-6">
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-[#06B6D4]" />
              <h3 className="text-[#111827]">Activité IA</h3>
            </div>

            <div className="space-y-4">
              {isLoading ? (
                <div className="py-8 text-center">
                  <div className="w-6 h-6 border-2 border-[#1D4ED8] border-t-transparent rounded-full animate-spin mx-auto"></div>
                </div>
              ) : (
                <>
                  <div className="p-4 rounded-lg bg-gradient-to-br from-[#DBEAFE] to-[#CFFAFE]">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-[#0891B2]">Documents analysés</span>
                      <TrendingUp className="w-4 h-4 text-[#0891B2]" />
                    </div>
                    <div className="text-2xl text-[#1D4ED8] mb-1">{aiStats.analyzedDocuments}</div>
                    <div className="text-xs text-[#0891B2]">
                      {aiStats.analyzedPercentage.toFixed(0)}% du total
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between py-2 border-b border-[#E5E7EB]">
                      <span className="text-xs text-[#6B7280]">Total documents</span>
                      <span className="text-xs text-[#111827]">{aiStats.totalDocuments}</span>
                    </div>
                    
                    <div className="flex items-center justify-between py-2 border-b border-[#E5E7EB]">
                      <span className="text-xs text-[#6B7280]">Analysés</span>
                      <span className="text-xs text-[#111827]">{aiStats.analyzedDocuments}</span>
                    </div>
                    
                    <div className="flex items-center justify-between py-2">
                      <span className="text-xs text-[#6B7280]">En attente</span>
                      <span className="text-xs text-[#111827]">
                        {aiStats.totalDocuments - aiStats.analyzedDocuments}
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-[#1D4ED8] to-[#06B6D4] text-white">
            <Sparkles className="w-8 h-8 mb-3 opacity-90" />
            <h4 className="mb-2">IA locale</h4>
            <p className="text-sm opacity-90 mb-4">
              Tous vos documents sont analysés localement, garantissant une confidentialité totale.
            </p>
            <Badge variant="neutral" size="sm" className="bg-white/20 text-white border-white/30">
              Model: local-llm-v1
            </Badge>
          </Card>
        </div>
      </div>
    </div>
  );
}