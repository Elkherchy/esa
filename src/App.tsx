import React, { useState, useEffect, useRef } from 'react';
import { Layout } from './components/layout/Layout';
import { LoginPage } from './components/pages/LoginPage';
import { UserDashboard } from './components/pages/UserDashboard';
import { DocumentsList } from './components/pages/DocumentsList';
import { DocumentDetail } from './components/pages/DocumentDetail';
import { AdminDashboard } from './components/pages/AdminDashboard';
import { AdminDocuments } from './components/pages/AdminDocuments';
import { AdminPermissions } from './components/pages/AdminPermissions';
import { AdminPermissionsGeneral } from './components/pages/AdminPermissionsGeneral';
import { AdminUsers } from './components/pages/AdminUsers';
import { SearchPage } from './components/pages/SearchPage';
import { SettingsPage } from './components/pages/SettingsPage';
import { Toast } from './components/ui/Toast';
import { apiService } from './services/api';

type Page = 
  | 'login' 
  | 'dashboard' 
  | 'documents' 
  | 'document-detail' 
  | 'search'
  | 'admin' 
  | 'admin-documents' 
  | 'admin-permissions'
  | 'admin-permissions-general'
  | 'admin-users'
  | 'settings';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('login');
  const [selectedDocumentId, setSelectedDocumentId] = useState<string>('1');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<'ADMIN' | 'USER'>('USER');
  const [userName, setUserName] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const authCheckedRef = useRef(false);

  // Vérifier l'authentification au chargement
  useEffect(() => {
    if (authCheckedRef.current) return;
    authCheckedRef.current = true;
    
    const checkAuth = async () => {
      if (apiService.isAuthenticated()) {
        try {
          const response = await apiService.getCurrentUser();
          if (response.data) {
            const user = response.data;
            // Vérifier si admin (insensible à la casse)
            const isAdmin = user.is_admin || 
                            (user.role && user.role.toUpperCase() === 'ADMIN');
            
            setIsAuthenticated(true);
            setUserRole(isAdmin ? 'ADMIN' : 'USER');
            setUserName(user.display_name || user.email);
            setCurrentPage(isAdmin ? 'admin' : 'dashboard');
          } else {
            apiService.logout();
            setIsAuthenticated(false);
          }
        } catch (error) {
          console.error('Erreur lors de la vérification de l\'authentification:', error);
          apiService.logout();
          setIsAuthenticated(false);
        }
      } else {
        setIsAuthenticated(false);
      }
      setIsLoading(false);
    };
    
    checkAuth();
  }, []);

  const handleLogin = async (email: string, password: string) => {
    setIsLoggingIn(true);
    try {
      const response = await apiService.login(email, password);
      
      if (response.error) {
        setToast({ message: response.error, type: 'error' });
        setIsLoggingIn(false);
        return;
      }

      if (!response.data || !response.data.user || !response.data.tokens) {
        setToast({ message: 'Réponse invalide du serveur', type: 'error' });
        setIsLoggingIn(false);
        return;
      }

      const { user } = response.data;
      
      // Vérifier si admin (insensible à la casse)
      const isAdmin = user.is_admin || 
                      (user.role && user.role.toUpperCase() === 'ADMIN');
      
      console.log('🔐 Connexion:', {
        email: user.email,
        role: user.role,
        is_admin: user.is_admin,
        isAdmin: isAdmin,
        redirectTo: isAdmin ? 'admin' : 'dashboard'
      });
      
      setIsAuthenticated(true);
      setUserRole(isAdmin ? 'ADMIN' : 'USER');
      setUserName(user.display_name || user.email);
      setCurrentPage(isAdmin ? 'admin' : 'dashboard');
      setToast({ 
        message: `${response.data.message || 'Connexion réussie'} - ${isAdmin ? 'Dashboard Admin' : 'Dashboard User'}`, 
        type: 'success' 
      });
      
    } catch (error) {
      console.error('Erreur lors de la connexion:', error);
      setToast({ message: 'Une erreur est survenue lors de la connexion', type: 'error' });
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleNavigate = (page: string, documentId?: string) => {
    setCurrentPage(page as Page);
    if (documentId) {
      setSelectedDocumentId(documentId);
    }
    window.scrollTo(0, 0);
  };

  const handleLogout = () => {
    apiService.logout();
    setIsAuthenticated(false);
    setUserRole('USER');
    setUserName('');
    setCurrentPage('login');
    setToast({ message: 'Déconnexion réussie', type: 'success' });
  };

  // Afficher un loader pendant la vérification initiale
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F3F4F6]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#1D4ED8] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#6B7280]">Chargement...</p>
        </div>
      </div>
    );
  }

  // Afficher la page de login si non authentifié
  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} isLoading={isLoggingIn} />;
  }

  // Render current page content
  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <UserDashboard userName={userName} onNavigate={handleNavigate} />;
      
      case 'documents':
        return <DocumentsList onNavigate={handleNavigate} />;
      
      case 'document-detail':
        return <DocumentDetail documentId={selectedDocumentId} onNavigate={handleNavigate} />;
      
      case 'search':
        return <SearchPage onNavigate={handleNavigate} />;
      
      case 'admin':
        return <AdminDashboard onNavigate={handleNavigate} />;
      
      case 'admin-documents':
        return <AdminDocuments onNavigate={handleNavigate} />;
      
      case 'admin-permissions':
        return <AdminPermissions documentId={selectedDocumentId} onNavigate={handleNavigate} />;
      
      case 'admin-permissions-general':
        return <AdminPermissionsGeneral onNavigate={handleNavigate} />;
      
      case 'admin-users':
        return <AdminUsers onNavigate={handleNavigate} />;
      
      case 'settings':
        return <SettingsPage />;
      
      default:
        return <UserDashboard userName={userName} onNavigate={handleNavigate} />;
    }
  };

  return (
    <>
      <Layout
        currentPage={currentPage}
        onNavigate={handleNavigate}
        userName={userName}
        userRole={userRole}
        onLogout={handleLogout}
      >
        {renderPage()}
      </Layout>

      {/* Toast notifications */}
      {toast && (
        <div className="fixed bottom-4 right-4 z-50">
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        </div>
      )}
    </>
  );
}