import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';

interface LayoutProps {
  children: React.ReactNode;
  currentPage: string;
  onNavigate: (page: string) => void;
  userName: string;
  userRole: 'ADMIN' | 'USER';
  onLogout: () => void;
}

export function Layout({ children, currentPage, onNavigate, userName, userRole, onLogout }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#F3F4F6]">
      {/* Sidebar - Fixed on left */}
      <Sidebar 
        userRole={userRole}
        currentPage={currentPage}
        onNavigate={onNavigate}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />
      
      {/* Main content area */}
      <div className="flex-1 flex flex-col lg:ml-64 min-w-0">
        {/* Top bar - sticky */}
        <TopBar 
          userName={userName}
          userRole={userRole}
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
          onLogout={onLogout}
        />
        
        {/* Page content - scrollable */}
        <main className="flex-1 p-6 lg:p-8 overflow-y-auto overflow-x-hidden">
          <div className="max-w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}