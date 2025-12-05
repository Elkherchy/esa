import React, { useState, useEffect } from 'react';
import { UserCog, Edit2, X, ArrowLeft } from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Select } from '../ui/Select';
import { apiService } from '../../services/api';

interface AdminUsersProps {
  onNavigate: (page: string) => void;
}

export function AdminUsers({ onNavigate }: AdminUsersProps) {
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [editFormData, setEditFormData] = useState({
    role: 'USER',
    is_active: true
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const response = await apiService.getUsers();
      
      console.log('👥 Réponse API Users:', response);
      console.log('👥 Status:', response.status);
      console.log('👥 Error:', response.error);
      console.log('👥 Data:', response.data);
      
      if (response.error) {
        console.error('❌ Erreur API:', response.error);
        if (response.status === 403) {
          alert('Accès refusé. Vous devez être super admin pour voir les utilisateurs.');
        } else if (response.status === 500) {
          alert('Erreur serveur (500). La table users n\'existe peut-être pas.');
        } else {
          alert(`Erreur ${response.status}: ${response.error}`);
        }
        setUsers([]);
      } else if (response.data) {
        const usersList = Array.isArray(response.data) ? response.data : [];
        console.log('✅ Utilisateurs chargés:', usersList.length);
        setUsers(usersList);
      } else {
        console.warn('⚠️ Réponse vide');
        setUsers([]);
      }
    } catch (error) {
      console.error('❌ Exception lors du chargement des utilisateurs:', error);
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditUser = (user: any) => {
    setSelectedUser(user);
    setEditFormData({
      role: user.is_admin ? 'ADMIN' : 'USER',
      is_active: user.is_active
    });
    setShowEditModal(true);
  };

  const handleSaveUser = async () => {
    if (!selectedUser) return;

    setIsSaving(true);
    try {
      const response = await apiService.updateUser(selectedUser.id, {
        role: editFormData.role,
        is_active: editFormData.is_active
      });

      if (response.error) {
        console.error('Erreur lors de la modification:', response.error);
        alert('Erreur: ' + response.error);
      } else {
        // Recharger la liste des utilisateurs
        await loadUsers();
        setShowEditModal(false);
        setSelectedUser(null);
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      alert('Une erreur est survenue');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onNavigate('admin')}
            className="text-[#6B7280] hover:text-[#111827] hover:bg-[#F3F4F6]"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour
          </Button>
        </div>
        <h1 className="text-[#111827] mb-2">Gestion des utilisateurs</h1>
        <p className="text-[#6B7280]">Gérez les utilisateurs et leurs rôles</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card padding="sm">
          {isLoading ? (
            <div className="w-6 h-6 border-2 border-[#1D4ED8] border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <>
              <div className="text-2xl text-[#111827] mb-1">
                {users.length}
              </div>
              <div className="text-xs text-[#6B7280]">Total utilisateurs</div>
            </>
          )}
        </Card>
        <Card padding="sm">
          {isLoading ? (
            <div className="w-6 h-6 border-2 border-[#1D4ED8] border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <>
              <div className="text-2xl text-[#111827] mb-1">
                {users.filter(u => u.is_admin).length}
              </div>
              <div className="text-xs text-[#6B7280]">Administrateurs</div>
            </>
          )}
        </Card>
        <Card padding="sm">
          {isLoading ? (
            <div className="w-6 h-6 border-2 border-[#1D4ED8] border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <>
              <div className="text-2xl text-[#111827] mb-1">
                {users.filter(u => u.is_active).length}
              </div>
              <div className="text-xs text-[#6B7280]">Actifs</div>
            </>
          )}
        </Card>
      </div>

      {/* Users table */}
      <Card padding="none" className="overflow-hidden">
        {/* Desktop table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#F9FAFB] border-b border-[#E5E7EB]">
              <tr>
                <th className="text-left px-6 py-4 text-xs text-[#6B7280]">Nom</th>
                <th className="text-left px-6 py-4 text-xs text-[#6B7280]">Email</th>
                <th className="text-left px-6 py-4 text-xs text-[#6B7280]">Rôle</th>
                <th className="text-left px-6 py-4 text-xs text-[#6B7280]">Statut</th>
                <th className="text-left px-6 py-4 text-xs text-[#6B7280]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB]">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-[#1D4ED8] border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-sm text-[#6B7280]">Chargement...</span>
                    </div>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <p className="text-sm text-[#6B7280]">Aucun utilisateur trouvé</p>
                  </td>
                </tr>
              ) : (
                users.map((user) => {
                  const displayName = user.display_name || `${user.first_name} ${user.last_name}`.trim() || user.username;
                  const initials = displayName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
                  const createdAt = user.created_at || user.createdAt;
                  
                  return (
                    <tr key={user.id} className="hover:bg-[#F9FAFB] transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-[#1D4ED8] to-[#06B6D4] rounded-full flex items-center justify-center">
                            <span className="text-white text-sm">
                              {initials}
                            </span>
                          </div>
                          <div>
                            <div className="text-sm text-[#111827]">{displayName}</div>
                            <div className="text-xs text-[#6B7280]">
                              Créé le {new Date(createdAt).toLocaleDateString('fr-FR')}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-[#6B7280]">{user.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={user.is_admin ? 'primary' : 'neutral'}>
                          {user.is_admin ? 'ADMIN' : 'USER'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={user.is_active ? 'success' : 'neutral'}>
                          {user.is_active ? 'Actif' : 'Inactif'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => handleEditUser(user)}
                        >
                          <Edit2 className="w-4 h-4" />
                          Modifier
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile list */}
        <div className="md:hidden divide-y divide-[#E5E7EB]">
          {isLoading ? (
            <div className="p-12 text-center">
              <div className="w-6 h-6 border-2 border-[#1D4ED8] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-sm text-[#6B7280]">Chargement...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-sm text-[#6B7280]">Aucun utilisateur trouvé</p>
            </div>
          ) : (
            users.map((user) => {
              const displayName = user.display_name || `${user.first_name} ${user.last_name}`.trim() || user.username;
              const initials = displayName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
              
              return (
                <div key={user.id} className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-[#1D4ED8] to-[#06B6D4] rounded-full flex items-center justify-center">
                        <span className="text-white">
                          {initials}
                        </span>
                      </div>
                      <div>
                        <div className="text-sm text-[#111827] mb-1">{displayName}</div>
                        <div className="text-xs text-[#6B7280]">{user.email}</div>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-3">
                    <Badge variant={user.is_admin ? 'primary' : 'neutral'} size="sm">
                      {user.is_admin ? 'ADMIN' : 'USER'}
                    </Badge>
                    <Badge variant={user.is_active ? 'success' : 'neutral'} size="sm">
                      {user.is_active ? 'Actif' : 'Inactif'}
                    </Badge>
                  </div>
                  <Button 
                    size="sm" 
                    variant="ghost"
                    className="w-full border border-[#E5E7EB]"
                    onClick={() => handleEditUser(user)}
                  >
                    <Edit2 className="w-4 h-4" />
                    Modifier
                  </Button>
                </div>
              );
            })
          )}
        </div>
      </Card>

      {/* Edit user modal */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <Card className="w-full max-w-2.5xl my-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <UserCog className="w-6 h-6 text-[#1D4ED8]" />
                <h2 className="text-[#111827]">Modifier l'utilisateur</h2>
              </div>
              <button 
                onClick={() => setShowEditModal(false)}
                className="text-[#6B7280] hover:text-[#111827] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              {/* User info header */}
              <div className="flex items-center gap-4 p-4 bg-[#F9FAFB] rounded-lg border border-[#E5E7EB]">
                <div className="w-16 h-16 bg-gradient-to-br from-[#1D4ED8] to-[#06B6D4] rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-lg font-medium">
                    {(selectedUser.display_name || selectedUser.username).split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-base font-medium text-[#111827] mb-1">
                    {selectedUser.display_name || selectedUser.username}
                  </div>
                  <div className="text-sm text-[#6B7280]">{selectedUser.email}</div>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant={selectedUser.is_admin ? 'primary' : 'neutral'} size="sm">
                      {selectedUser.is_admin ? 'ADMIN' : 'USER'}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Edit form */}
              <div className="space-y-6">
                <div>
                  <label className="text-sm font-medium text-[#374151] mb-3 block">Rôle</label>
                  <Select
                    options={[
                      { value: 'USER', label: 'USER - Utilisateur standard' },
                      { value: 'ADMIN', label: 'ADMIN - Administrateur' }
                    ]}
                    value={editFormData.role}
                    onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value })}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-[#374151] mb-3 block">Statut</label>
                  <div className="flex gap-6">
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <input 
                        type="radio" 
                        name="status" 
                        value="active"
                        checked={editFormData.is_active === true}
                        onChange={() => setEditFormData({ ...editFormData, is_active: true })}
                        className="w-4 h-4 text-[#1D4ED8] border-[#E5E7EB] focus:ring-2 focus:ring-[#1D4ED8] focus:ring-offset-2 cursor-pointer"
                      />
                      <span className="text-sm text-[#111827] group-hover:text-[#1D4ED8] transition-colors">Actif</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <input 
                        type="radio" 
                        name="status" 
                        value="inactive"
                        checked={editFormData.is_active === false}
                        onChange={() => setEditFormData({ ...editFormData, is_active: false })}
                        className="w-4 h-4 text-[#1D4ED8] border-[#E5E7EB] focus:ring-2 focus:ring-[#1D4ED8] focus:ring-offset-2 cursor-pointer"
                      />
                      <span className="text-sm text-[#111827] group-hover:text-[#1D4ED8] transition-colors">Inactif</span>
                    </label>
                  </div>
                </div>

                {/* Info card */}
                {selectedUser.origin === 'SSO' && (
                  <div className="p-4 bg-[#DBEAFE] rounded-lg border border-[#93C5FD]">
                    <p className="text-sm text-[#1E40AF] leading-relaxed">
                      <strong className="font-semibold">Note:</strong> Les utilisateurs SSO ne peuvent pas être supprimés. 
                      Vous pouvez seulement les désactiver ou modifier leur rôle.
                    </p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-[#E5E7EB]">
                <Button 
                  variant="primary" 
                  className="flex-1"
                  onClick={handleSaveUser}
                  disabled={isSaving}
                >
                  {isSaving ? 'Enregistrement...' : 'Enregistrer les modifications'}
                </Button>
                <Button 
                  variant="ghost" 
                  className="flex-1 border border-[#E5E7EB]"
                  onClick={() => setShowEditModal(false)}
                  disabled={isSaving}
                >
                  Annuler
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
