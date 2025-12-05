import React, { useState, useEffect } from 'react';
import { FileText, Sparkles, Users, Clock, Upload, UserCog, Shield, TrendingUp, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { apiService } from '../../services/api';

interface AdminDashboardProps {
  onNavigate: (page: string) => void;
}

export function AdminDashboard({ onNavigate }: AdminDashboardProps) {
  const [stats, setStats] = useState({
    totalDocuments: 0,
    analyzedDocuments: 0,
    analyzedPercentage: 0,
    totalUsers: 0,
    activeTemporaryAccess: 0
  });

  const [recentDocuments, setRecentDocuments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      // Charger les statistiques des documents
      const statsResponse = await apiService.getDocumentStats();
      console.log('📊 Stats Response:', statsResponse);
      
      if (statsResponse.error) {
        console.error('❌ Erreur stats:', statsResponse.error);
        // Si les stats ne sont pas disponibles, calculer depuis la liste des documents
        const docsResponse = await apiService.getDocuments();
        if (docsResponse.data) {
          const total = docsResponse.data.count || 0;
          const analyzed = docsResponse.data.results?.filter((d: any) => d.analyzed).length || 0;
          setStats(prev => ({
            ...prev,
            totalDocuments: total,
            analyzedDocuments: analyzed,
            analyzedPercentage: total > 0 ? (analyzed / total) * 100 : 0,
          }));
        }
      } else if (statsResponse.data) {
        setStats(prev => ({
          ...prev,
          totalDocuments: statsResponse.data.total_documents,
          analyzedDocuments: statsResponse.data.analyzed_documents,
          analyzedPercentage: statsResponse.data.analyzed_percentage,
        }));
      }

      // Charger les utilisateurs pour obtenir le total
      const usersResponse = await apiService.getUsers();
      console.log('👥 Users Response:', usersResponse);
      
      if (usersResponse.error) {
        console.error('❌ Erreur users:', usersResponse.error);
      } else if (usersResponse.data) {
        setStats(prev => ({
          ...prev,
          totalUsers: Array.isArray(usersResponse.data) ? usersResponse.data.length : 0,
        }));
      }

      // Charger les documents récents
      const docsResponse = await apiService.getDocuments({
        ordering: '-created_at',
        page_size: 4
      });
      console.log('📄 Recent Docs Response:', docsResponse);
      
      if (docsResponse.data) {
        setRecentDocuments(docsResponse.data.results || []);
      }
    } catch (error) {
      console.error('❌ Exception dashboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getVisibilityBadge = (visibility: string) => {
    const variants = {
      PRIVATE: { label: 'Privé', variant: 'error' as const },
      ROLE_BASED: { label: 'Par rôle', variant: 'warning' as const },
      PUBLIC: { label: 'Public', variant: 'success' as const }
    };
    return variants[visibility as keyof typeof variants];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-[#111827] mb-2">Administration</h1>
        <p className="text-[#6B7280]">Vue d'ensemble et gestion du système</p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#1D4ED8]/10 to-transparent rounded-full -mr-16 -mt-16"></div>
          <div className="relative">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-[#DBEAFE] to-[#BFDBFE] rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-300">
                <FileText className="w-6 h-6 text-[#1D4ED8]" />
              </div>
            </div>
            {isLoading ? (
              <div className="py-4">
                <div className="w-6 h-6 border-2 border-[#1D4ED8] border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              <>
                <div className="text-3xl font-bold text-[#111827] mb-1">{stats.totalDocuments.toLocaleString()}</div>
                <div className="text-sm text-[#6B7280] font-medium">Total documents</div>
              </>
            )}
          </div>
        </Card>

        <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#06B6D4]/10 to-transparent rounded-full -mr-16 -mt-16"></div>
          <div className="relative">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-[#CFFAFE] to-[#A5F3FC] rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-300">
                <Sparkles className="w-6 h-6 text-[#06B6D4]" />
              </div>
              {!isLoading && (
                <Badge variant="secondary" size="sm">
                  {stats.analyzedPercentage.toFixed(0)}%
                </Badge>
              )}
            </div>
            {isLoading ? (
              <div className="py-4">
                <div className="w-6 h-6 border-2 border-[#06B6D4] border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              <>
                <div className="text-3xl font-bold text-[#111827] mb-1">{stats.analyzedDocuments.toLocaleString()}</div>
                <div className="text-sm text-[#6B7280] font-medium">Documents analysés</div>
                <div className="mt-3 w-full bg-[#E5E7EB] rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-[#06B6D4] to-[#0891B2] h-2 rounded-full transition-all duration-500" 
                    style={{ width: `${stats.analyzedPercentage}%` }}
                  ></div>
                </div>
              </>
            )}
          </div>
        </Card>

        <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#10B981]/10 to-transparent rounded-full -mr-16 -mt-16"></div>
          <div className="relative">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-[#D1FAE5] to-[#A7F3D0] rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-300">
                <Users className="w-6 h-6 text-[#10B981]" />
              </div>
            </div>
            {isLoading ? (
              <div className="py-4">
                <div className="w-6 h-6 border-2 border-[#10B981] border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              <>
                <div className="text-3xl font-bold text-[#111827] mb-1">{stats.totalUsers}</div>
                <div className="text-sm text-[#6B7280] font-medium">Utilisateurs</div>
              </>
            )}
          </div>
        </Card>

        <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#F59E0B]/10 to-transparent rounded-full -mr-16 -mt-16"></div>
          <div className="relative">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-[#FEF3C7] to-[#FDE68A] rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-300">
                <Clock className="w-6 h-6 text-[#F59E0B]" />
              </div>
              <Badge variant="warning" size="sm">Actifs</Badge>
            </div>
            <div className="text-3xl font-bold text-[#111827] mb-1">{stats.activeTemporaryAccess}</div>
            <div className="text-sm text-[#6B7280] font-medium">Accès temporaires</div>
          </div>
        </Card>
      </div>

      {/* Quick actions */}
      <Card className="bg-gradient-to-br from-white to-[#F9FAFB]">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-[#111827] mb-1">Actions rapides</h3>
            <p className="text-sm text-[#6B7280]">Accès rapide aux fonctionnalités principales</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button 
            variant="primary"
            className="justify-start h-auto py-4 px-5 group hover:shadow-md transition-all duration-300"
            onClick={() => onNavigate('admin-documents')}
          >
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center mr-3 group-hover:bg-white/30 transition-colors">
              <Upload className="w-5 h-5" />
            </div>
            <div className="text-left">
              <div className="font-semibold">Téléverser un document</div>
              <div className="text-xs opacity-90">Ajouter un nouveau fichier</div>
            </div>
          </Button>
          <Button 
            variant="ghost"
            className="justify-start h-auto py-4 px-5 border border-[#E5E7EB] hover:border-[#1D4ED8] hover:bg-[#F0F9FF] transition-all duration-300 group"
            onClick={() => onNavigate('admin-users')}
          >
            <div className="w-10 h-10 bg-[#DBEAFE] rounded-lg flex items-center justify-center mr-3 group-hover:bg-[#BFDBFE] transition-colors">
              <UserCog className="w-5 h-5 text-[#1D4ED8]" />
            </div>
            <div className="text-left">
              <div className="font-semibold text-[#111827]">Gérer les utilisateurs</div>
              <div className="text-xs text-[#6B7280]">Administrer les comptes</div>
            </div>
          </Button>
          <Button 
            variant="ghost"
            className="justify-start h-auto py-4 px-5 border border-[#E5E7EB] hover:border-[#1D4ED8] hover:bg-[#F0F9FF] transition-all duration-300 group"
            onClick={() => onNavigate('admin-permissions-general')}
          >
            <div className="w-10 h-10 bg-[#DBEAFE] rounded-lg flex items-center justify-center mr-3 group-hover:bg-[#BFDBFE] transition-colors">
              <Shield className="w-5 h-5 text-[#1D4ED8]" />
            </div>
            <div className="text-left">
              <div className="font-semibold text-[#111827]">Gérer les permissions</div>
              <div className="text-xs text-[#6B7280]">Contrôler les accès</div>
            </div>
          </Button>
        </div>
      </Card>

      {/* Recent documents */}
      <Card padding="none">
        <div className="p-6 border-b border-[#E5E7EB]">
          <div className="flex items-center justify-between">
            <h3 className="text-[#111827]">Derniers documents ajoutés</h3>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => onNavigate('admin-documents')}
            >
              Voir tout
            </Button>
          </div>
        </div>

        {/* Desktop table */}
        <div className="hidden md:block overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="h-12 px-6 font-semibold text-[#6B7280]">Titre</TableHead>
                <TableHead className="h-12 px-6 font-semibold text-[#6B7280]">Propriétaire</TableHead>
                <TableHead className="h-12 px-6 font-semibold text-[#6B7280]">Date</TableHead>
                <TableHead className="h-12 px-6 font-semibold text-[#6B7280]">Visibilité</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={4} className="px-6 py-12 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-[#1D4ED8] border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-sm text-[#6B7280]">Chargement...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : recentDocuments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="px-6 py-12 text-center">
                    <p className="text-sm text-[#6B7280]">Aucun document trouvé</p>
                  </TableCell>
                </TableRow>
              ) : (
                recentDocuments.map((doc) => {
                  const visBadge = getVisibilityBadge(doc.visibility);
                  const ownerName = doc.owner?.display_name || doc.owner?.email || 'Inconnu';
                  const createdAt = doc.created_at || doc.createdAt;
                  return (
                    <TableRow key={doc.id} className="hover:bg-[#F9FAFB] transition-colors cursor-pointer">
                      <TableCell className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-[#DBEAFE] rounded-lg flex items-center justify-center">
                            <FileText className="w-4 h-4 text-[#1D4ED8]" />
                          </div>
                          <div className="text-sm font-medium text-[#111827]">{doc.title}</div>
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        <div className="text-sm text-[#6B7280]">{ownerName}</div>
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        <div className="text-sm font-medium text-[#111827]">
                          {new Date(createdAt).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </div>
                        <div className="text-xs text-[#9CA3AF]">
                          {new Date(createdAt).toLocaleTimeString('fr-FR', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        <Badge variant={visBadge.variant} size="sm">
                          {visBadge.label}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Mobile list */}
        <div className="md:hidden divide-y divide-[#E5E7EB]">
          {isLoading ? (
            <div className="p-12 text-center">
              <div className="w-6 h-6 border-2 border-[#1D4ED8] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-sm text-[#6B7280]">Chargement...</p>
            </div>
          ) : recentDocuments.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-sm text-[#6B7280]">Aucun document trouvé</p>
            </div>
          ) : (
            recentDocuments.map((doc) => {
              const visBadge = getVisibilityBadge(doc.visibility);
              const ownerName = doc.owner?.display_name || doc.owner?.email || 'Inconnu';
              const createdAt = doc.created_at || doc.createdAt;
              return (
                <div key={doc.id} className="p-4">
                  <div className="text-sm text-[#111827] mb-1">{doc.title}</div>
                  <div className="text-xs text-[#6B7280] mb-2">{ownerName}</div>
                  <div className="flex items-center gap-2">
                    <Badge variant={visBadge.variant} size="sm">
                      {visBadge.label}
                    </Badge>
                    <span className="text-xs text-[#9CA3AF]">
                      {new Date(createdAt).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </Card>
    </div>
  );
}
