import React from 'react';
import { LayoutDashboard, FileText, Search, Shield, Settings, Menu, X } from 'lucide-react';

interface SidebarProps {
  userRole: 'ADMIN' | 'USER';
  currentPage: string;
  onNavigate: (page: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export function Sidebar({ userRole, currentPage, onNavigate, isOpen, onToggle }: SidebarProps) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['ADMIN', 'USER'] },
    { id: 'documents', label: 'Mes documents', icon: FileText, roles: ['ADMIN', 'USER'] },
    { id: 'search', label: 'Recherche', icon: Search, roles: ['ADMIN', 'USER'] },
    { id: 'admin', label: 'Admin', icon: Shield, roles: ['ADMIN'] },
    { id: 'settings', label: 'Paramètres', icon: Settings, roles: ['ADMIN', 'USER'] },
  ];

  const filteredItems = navItems.filter(item => item.roles.includes(userRole));

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}
      
      {/* Sidebar - Fixed on desktop, slide-in on mobile */}
      <aside className={`
        fixed top-0 left-0 z-50 h-full w-64 bg-white border-r border-[#E5E7EB]
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
      `}>
        <div className="flex flex-col h-full">
          {/* Logo Header */}
          <div className="flex items-center justify-between p-6 border-b border-[#E5E7EB]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[#1D4ED8] to-[#06B6D4] rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <span className="label text-[#111827]">Coffre-Fort IA</span>
            </div>
            <button onClick={onToggle} className="lg:hidden text-[#6B7280] hover:text-[#111827]">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 overflow-y-auto">
            <ul className="space-y-1">
              {filteredItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPage === item.id;
                
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => {
                        onNavigate(item.id);
                        if (window.innerWidth < 1024) {
                          onToggle();
                        }
                      }}
                      className={`
                        w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                        ${isActive 
                          ? 'bg-[#DBEAFE] text-[#1D4ED8]' 
                          : 'text-[#6B7280] hover:bg-[#F3F4F6] hover:text-[#111827]'
                        }
                      `}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-[#E5E7EB]">
            <div className="caption text-[#9CA3AF] text-center">
              v1.0.0 • Sécurisé
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}