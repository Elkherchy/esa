import React, { useState } from 'react';
import { ArrowLeft, Plus, Trash2, User, Users as UsersIcon, Calendar, CheckCircle, Clock, X, Search, Filter, AlertCircle, Shield, FileText } from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Select } from '../ui/Select';
import { Input } from '../ui/Input';

interface AdminPermissionsProps {
  documentId: string;
  onNavigate: (page: string) => void;
}

export function AdminPermissions({ documentId, onNavigate }: AdminPermissionsProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedPermission, setSelectedPermission] = useState<string | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    type: 'user',
    user: '',
    role: '',
    startTime: '',
    endTime: ''
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const document = {
    id: documentId,
    title: 'Rapport annuel 2024',
    owner: 'Jean Dupont',
    visibility: 'PRIVATE'
  };

  const permissions = [
    {
      id: '1',
      type: 'user',
      name: 'Marie Martin',
      email: 'marie.martin@entreprise.fr',
      startTime: '2024-02-01T09:00:00',
      endTime: '2024-03-01T18:00:00',
      status: 'active'
    },
    {
      id: '2',
      type: 'role',
      name: 'Finance Team',
      role: 'FINANCE',
      startTime: '2024-01-15T00:00:00',
      endTime: '2024-12-31T23:59:59',
      status: 'active'
    },
    {
      id: '3',
      type: 'user',
      name: 'Pierre Durand',
      email: 'pierre.durand@entreprise.fr',
      startTime: '2024-01-01T09:00:00',
      endTime: '2024-01-31T18:00:00',
      status: 'expired'
    },
    {
      id: '4',
      type: 'role',
      name: 'Management',
      role: 'MANAGER',
      startTime: '2024-02-01T00:00:00',
      endTime: '2024-06-30T23:59:59',
      status: 'active'
    }
  ];

  const stats = {
    total: permissions.length,
    active: permissions.filter(p => p.status === 'active').length,
    expired: permissions.filter(p => p.status === 'expired').length,
    expiringSoon: permissions.filter(p => {
      const endTime = new Date(p.endTime);
      const now = new Date();
      const daysUntilExpiry = (endTime.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
      return p.status === 'active' && daysUntilExpiry <= 7 && daysUntilExpiry > 0;
    }).length
  };

  const filterPermissions = () => {
    let filtered = [...permissions];

    // Filtre par recherche
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(query) ||
        (p.type === 'user' && p.email.toLowerCase().includes(query)) ||
        (p.type === 'role' && p.role.toLowerCase().includes(query))
      );
    }

    // Filtre par statut
    if (statusFilter !== 'all') {
      filtered = filtered.filter(p => p.status === statusFilter);
    }

    // Filtre par type
    if (typeFilter !== 'all') {
      filtered = filtered.filter(p => p.type === typeFilter);
    }

    return filtered;
  };

  const filteredPermissions = filterPermissions();

  const getStatusBadge = (permission: typeof permissions[0]) => {
    const now = new Date();
    const endTime = new Date(permission.endTime);
    const daysUntilExpiry = (endTime.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);

    if (permission.status === 'expired') {
      return <Badge variant="neutral"><Clock className="w-3 h-3 mr-1" />Expirée</Badge>;
    }
    
    if (daysUntilExpiry <= 7 && daysUntilExpiry > 0) {
      return <Badge variant="warning"><AlertCircle className="w-3 h-3 mr-1" />Expire dans {Math.ceil(daysUntilExpiry)}j</Badge>;
    }
    
    return <Badge variant="success"><CheckCircle className="w-3 h-3 mr-1" />Active</Badge>;
  };

  const handleDelete = (permissionId: string) => {
    setSelectedPermission(permissionId);
    // TODO: Implémenter la confirmation et la suppression
    console.log('Supprimer permission', permissionId);
  };

  // Mock users and roles - à remplacer par des appels API
  const users = [
    { id: 'user1', name: 'Marie Martin', email: 'marie.martin@entreprise.fr' },
    { id: 'user2', name: 'Pierre Durand', email: 'pierre.durand@entreprise.fr' },
    { id: 'user3', name: 'Sophie Laurent', email: 'sophie.laurent@entreprise.fr' },
    { id: 'user4', name: 'Marc Bernard', email: 'marc.bernard@entreprise.fr' }
  ];

  const roles = [
    { id: 'FINANCE', name: 'Finance Team' },
    { id: 'MANAGER', name: 'Management' },
    { id: 'IT', name: 'IT Team' },
    { id: 'HR', name: 'Ressources Humaines' }
  ];

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (formData.type === 'user' && !formData.user) {
      errors.user = 'Veuillez sélectionner un utilisateur';
    }

    if (formData.type === 'role' && !formData.role) {
      errors.role = 'Veuillez sélectionner un rôle';
    }

    if (!formData.startTime) {
      errors.startTime = 'La date de début est requise';
    }

    if (!formData.endTime) {
      errors.endTime = 'La date de fin est requise';
    }

    if (formData.startTime && formData.endTime) {
      const start = new Date(formData.startTime);
      const end = new Date(formData.endTime);
      if (start >= end) {
        errors.endTime = 'La date de fin doit être après la date de début';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    // TODO: Appel API pour créer la permission
    try {
      // Simuler un appel API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Réinitialiser le formulaire
      setFormData({
        type: 'user',
        user: '',
        role: '',
        startTime: '',
        endTime: ''
      });
      setFormErrors({});
      setShowAddModal(false);
      
      // TODO: Afficher un toast de succès
      console.log('Permission créée avec succès');
    } catch (error) {
      console.error('Erreur lors de la création de la permission:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetForm = () => {
    setFormData({
      type: 'user',
      user: '',
      role: '',
      startTime: '',
      endTime: ''
    });
    setFormErrors({});
    setShowAddModal(false);
  };

  // Générer les options datetime-local avec la date actuelle comme minimum
  const getMinDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  };

  const EmptyState = () => (
    <div className="py-16 text-center">
      <div className="w-16 h-16 bg-[#F3F4F6] rounded-full flex items-center justify-center mx-auto mb-4">
        <UsersIcon className="w-8 h-8 text-[#9CA3AF]" />
      </div>
      <h3 className="text-[#111827] mb-2">Aucune permission définie</h3>
      <p className="text-sm text-[#6B7280] mb-6">
        Ajoutez des permissions pour contrôler l'accès à ce document
      </p>
      <Button variant="primary" onClick={() => setShowAddModal(true)}>
        <Plus className="w-4 h-4" />
        Ajouter une permission
      </Button>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => onNavigate('admin-documents')}
          >
            <ArrowLeft className="w-4 h-4" />
            Retour
          </Button>
          <div>
            <h1 className="text-[#111827] mb-1">Permissions du document</h1>
            <p className="text-sm text-[#6B7280]">{document.title}</p>
          </div>
        </div>
          <Button variant="primary" onClick={() => setShowAddModal(true)}>
            <Plus className="w-4 h-4" />
          Ajouter une permission
          </Button>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card padding="sm">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl text-[#111827] mb-1">{stats.total}</div>
              <div className="text-xs text-[#6B7280]">Total permissions</div>
            </div>
            <Shield className="w-8 h-8 text-[#1D4ED8]" />
          </div>
        </Card>
        <Card padding="sm">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl text-[#111827] mb-1">{stats.active}</div>
              <div className="text-xs text-[#6B7280]">Actives</div>
            </div>
            <CheckCircle className="w-8 h-8 text-[#10B981]" />
          </div>
        </Card>
        <Card padding="sm">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl text-[#111827] mb-1">{stats.expired}</div>
              <div className="text-xs text-[#6B7280]">Expirées</div>
            </div>
            <Clock className="w-8 h-8 text-[#6B7280]" />
          </div>
        </Card>
        <Card padding="sm">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl text-[#111827] mb-1">{stats.expiringSoon}</div>
              <div className="text-xs text-[#6B7280]">Expirent bientôt</div>
            </div>
            <AlertCircle className="w-8 h-8 text-[#F59E0B]" />
          </div>
        </Card>
      </div>

      {/* Search and filters */}
      <Card>
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9CA3AF]" />
              <input
                type="text"
                placeholder="Rechercher par utilisateur, rôle..."
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-[#E5E7EB]">
              <Select
                label="Statut"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                options={[
                  { value: 'all', label: 'Tous les statuts' },
                  { value: 'active', label: 'Actives' },
                  { value: 'expired', label: 'Expirées' }
                ]}
              />
              
              <Select
                label="Type"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                options={[
                  { value: 'all', label: 'Tous les types' },
                  { value: 'user', label: 'Utilisateur' },
                  { value: 'role', label: 'Rôle' }
                ]}
              />
            </div>
          )}
        </div>
      </Card>

      {/* Info card */}
      <Card className="bg-gradient-to-br from-[#DBEAFE] to-[#CFFAFE] border-[#93C5FD]">
        <div className="flex gap-3">
          <Clock className="w-5 h-5 text-[#1D4ED8] flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-[#1D4ED8] text-sm font-medium mb-1">Fenêtres d'accès temporaire</h4>
            <p className="text-xs text-[#1E40AF] leading-relaxed">
              Définissez des périodes d'accès spécifiques pour contrôler qui peut consulter ce document et quand.
              Les permissions expirées sont automatiquement désactivées.
            </p>
          </div>
        </div>
      </Card>

      {/* Permissions list */}
      {filteredPermissions.length === 0 ? (
        <Card>
          <EmptyState />
        </Card>
      ) : (
        <Card padding="none">
          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#F9FAFB] border-b border-[#E5E7EB]">
                <tr>
                  <th className="text-left px-6 py-4 text-xs text-[#6B7280] font-medium">Utilisateur / Rôle</th>
                  <th className="text-left px-6 py-4 text-xs text-[#6B7280] font-medium">Période d'accès</th>
                  <th className="text-left px-6 py-4 text-xs text-[#6B7280] font-medium">Statut</th>
                  <th className="text-left px-6 py-4 text-xs text-[#6B7280] font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                {filteredPermissions.map((permission) => (
                  <tr key={permission.id} className="hover:bg-[#F9FAFB] transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          permission.type === 'user' ? 'bg-[#DBEAFE]' : 'bg-[#CFFAFE]'
                        }`}>
                          {permission.type === 'user' ? (
                            <User className="w-5 h-5 text-[#1D4ED8]" />
                          ) : (
                            <UsersIcon className="w-5 h-5 text-[#06B6D4]" />
                          )}
                        </div>
                        <div>
                          <div className="text-sm text-[#111827]">{permission.name}</div>
                          {permission.type === 'user' ? (
                            <div className="text-xs text-[#6B7280]">{permission.email}</div>
                          ) : (
                            <Badge variant="secondary" size="sm">Rôle: {permission.role}</Badge>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-[#6B7280]" />
                          <div>
                            <div className="text-sm text-[#111827] font-medium">
                              {new Date(permission.startTime).toLocaleDateString('fr-FR', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric'
                              })}
                      </div>
                            <div className="text-xs text-[#6B7280]">
                        {new Date(permission.startTime).toLocaleTimeString('fr-FR', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-[#6B7280]" />
                          <div>
                            <div className="text-sm text-[#111827] font-medium">
                              {new Date(permission.endTime).toLocaleDateString('fr-FR', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric'
                              })}
                      </div>
                            <div className="text-xs text-[#6B7280]">
                        {new Date(permission.endTime).toLocaleTimeString('fr-FR', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                            </div>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(permission)}
                    </td>
                    <td className="px-6 py-4">
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="text-[#EF4444] hover:bg-[#FEE2E2] hover:text-[#DC2626] transition-colors"
                        onClick={() => handleDelete(permission.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                        Supprimer
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile list */}
          <div className="md:hidden divide-y divide-[#E5E7EB]">
            {filteredPermissions.map((permission) => (
              <div key={permission.id} className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      permission.type === 'user' ? 'bg-[#DBEAFE]' : 'bg-[#CFFAFE]'
                    }`}>
                      {permission.type === 'user' ? (
                        <User className="w-5 h-5 text-[#1D4ED8]" />
                      ) : (
                        <UsersIcon className="w-5 h-5 text-[#06B6D4]" />
                      )}
                    </div>
                    <div>
                      <div className="text-sm text-[#111827]">{permission.name}</div>
                      {permission.type === 'user' ? (
                        <div className="text-xs text-[#6B7280]">{permission.email}</div>
                      ) : (
                        <Badge variant="secondary" size="sm">Rôle: {permission.role}</Badge>
                      )}
                    </div>
                  </div>
                  <Button size="sm" variant="ghost" className="text-[#EF4444]">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#6B7280]">Début:</span>
                    <span className="text-[#111827]">
                      {new Date(permission.startTime).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#6B7280]">Fin:</span>
                    <span className="text-[#111827]">
                      {new Date(permission.endTime).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#6B7280]">Statut:</span>
                    {getStatusBadge(permission)}
                  </div>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="w-full mt-2 text-[#EF4444] hover:bg-[#FEE2E2]"
                    onClick={() => handleDelete(permission.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                    Supprimer
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Add permission modal */}
      {showAddModal && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              handleResetForm();
            }
          }}
        >
          <Card className="w-full max-w-2xl my-8 max-h-[90vh] overflow-y-auto bg-white shadow-xl">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#E5E7EB]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-[#1D4ED8] to-[#06B6D4] rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-[#111827]">Ajouter une permission</h2>
                  <p className="text-xs text-[#6B7280] mt-0.5">Définir un accès temporaire au document</p>
                </div>
              </div>
              <button 
                onClick={handleResetForm}
                className="text-[#6B7280] hover:text-[#111827] hover:bg-[#F3F4F6] rounded-lg p-1.5 transition-colors"
                type="button"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Document info */}
              <div className="p-4 bg-gradient-to-br from-[#DBEAFE] to-[#CFFAFE] rounded-lg border border-[#93C5FD]">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
                    <FileText className="w-6 h-6 text-[#1D4ED8]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-[#111827] mb-1 truncate">{document.title}</div>
                    <div className="text-xs text-[#6B7280] mb-2">Propriétaire: {document.owner}</div>
                    <Badge variant="neutral" size="sm">
                      {document.visibility === 'PRIVATE' ? 'Privé' : 
                       document.visibility === 'ROLE_BASED' ? 'Par rôle' : 'Public'}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Type selection */}
              <div>
                <label className="text-sm font-medium text-[#374151] mb-2.5 block">
                  Type d'accès <span className="text-[#EF4444]">*</span>
                </label>
              <Select
                  value={formData.type}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      type: e.target.value,
                      user: '',
                      role: ''
                    });
                    setFormErrors({ ...formErrors, user: '', role: '' });
                  }}
                options={[
                  { value: 'user', label: 'Utilisateur spécifique' },
                  { value: 'role', label: 'Rôle' }
                ]}
              />
              </div>

              {/* User/Role selection - Conditionnel */}
              {formData.type === 'user' ? (
                <div>
                  <label className="text-sm font-medium text-[#374151] mb-2.5 block">
                    Utilisateur <span className="text-[#EF4444]">*</span>
                  </label>
                  <Select
                    value={formData.user}
                    onChange={(e) => {
                      setFormData({ ...formData, user: e.target.value });
                      setFormErrors({ ...formErrors, user: '' });
                    }}
                    options={users.map(user => ({
                      value: user.id,
                      label: `${user.name} (${user.email})`
                    }))}
                  />
                  {formErrors.user && (
                    <p className="text-xs text-[#EF4444] mt-1.5 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {formErrors.user}
                    </p>
                  )}
                </div>
              ) : (
                <div>
                  <label className="text-sm font-medium text-[#374151] mb-2.5 block">
                    Rôle <span className="text-[#EF4444]">*</span>
                  </label>
              <Select
                    value={formData.role}
                    onChange={(e) => {
                      setFormData({ ...formData, role: e.target.value });
                      setFormErrors({ ...formErrors, role: '' });
                    }}
                    options={roles.map(role => ({
                      value: role.id,
                      label: role.name
                    }))}
                  />
                  {formErrors.role && (
                    <p className="text-xs text-[#EF4444] mt-1.5 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {formErrors.role}
                    </p>
                  )}
                </div>
              )}

              {/* Date range */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-[#374151] mb-2.5 block">
                    Date et heure de début <span className="text-[#EF4444]">*</span>
                  </label>
                <Input
                  type="datetime-local"
                    value={formData.startTime}
                    onChange={(e) => {
                      setFormData({ ...formData, startTime: e.target.value });
                      setFormErrors({ ...formErrors, startTime: '', endTime: '' });
                    }}
                    min={getMinDateTime()}
                    className="w-full"
                  />
                  {formErrors.startTime && (
                    <p className="text-xs text-[#EF4444] mt-1.5 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {formErrors.startTime}
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium text-[#374151] mb-2.5 block">
                    Date et heure de fin <span className="text-[#EF4444]">*</span>
                  </label>
                <Input
                  type="datetime-local"
                    value={formData.endTime}
                    onChange={(e) => {
                      setFormData({ ...formData, endTime: e.target.value });
                      setFormErrors({ ...formErrors, endTime: '' });
                    }}
                    min={formData.startTime || getMinDateTime()}
                    className="w-full"
                  />
                  {formErrors.endTime && (
                    <p className="text-xs text-[#EF4444] mt-1.5 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {formErrors.endTime}
                    </p>
                  )}
                </div>
              </div>

              {/* Durée calculée */}
              {formData.startTime && formData.endTime && (
                <div className="p-3.5 bg-[#F0FDF4] rounded-lg border border-[#86EFAC]">
                  <div className="flex items-center gap-2 text-sm font-medium text-[#166534]">
                    <Calendar className="w-4 h-4" />
                    <span>
                      Durée: {Math.ceil((new Date(formData.endTime).getTime() - new Date(formData.startTime).getTime()) / (1000 * 60 * 60 * 24))} jour(s)
                    </span>
                  </div>
                </div>
              )}

              {/* Info card */}
              <div className="p-4 bg-[#DBEAFE] rounded-lg border border-[#93C5FD]">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-[#1D4ED8] flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-[#1E40AF] leading-relaxed">
                      <strong className="font-semibold">Note:</strong> La permission sera automatiquement désactivée à la date de fin. 
                      Vous pouvez la modifier ou la supprimer à tout moment depuis cette page.
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-[#E5E7EB]">
                <Button 
                  type="submit"
                  variant="primary" 
                  className="flex-1"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Enregistrement...' : 'Enregistrer la permission'}
                </Button>
                <Button 
                  type="button"
                  variant="ghost" 
                  className="flex-1 border border-[#E5E7EB]"
                  onClick={handleResetForm}
                  disabled={isSubmitting}
                >
                  Annuler
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
