import React, { useState } from 'react';
import { Menu, ChevronDown, LogOut, User } from 'lucide-react';
import { Badge } from '../ui/Badge';

interface TopBarProps {
  userName: string;
  userRole: 'ADMIN' | 'USER';
  onMenuToggle: () => void;
  onLogout: () => void;
}

export function TopBar({ userName, userRole, onMenuToggle, onLogout }: TopBarProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-[#E5E7EB] px-4 lg:px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left side */}
        <div className="flex items-center gap-4">
          <button 
            onClick={onMenuToggle}
            className="lg:hidden text-[#6B7280] hover:text-[#111827] p-1"
            aria-label="Toggle menu"
          >
            <Menu className="w-6 h-6" />
          </button>
          
          <div className="flex items-center gap-3">
            <h1 className="text-[#111827] whitespace-nowrap">Coffre-Fort Documentaire IA</h1>
          </div>
        </div>

        {/* Right side - User menu */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[#F3F4F6] transition-colors"
          >
            <div className="w-9 h-9 bg-gradient-to-br from-[#1D4ED8] to-[#06B6D4] rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div className="hidden md:block text-left">
              <div className="text-[#111827]">{userName}</div>
              <div className="caption text-[#6B7280]">{userRole}</div>
            </div>
            <ChevronDown className={`w-4 h-4 text-[#6B7280] transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Dropdown menu */}
          {dropdownOpen && (
            <>
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setDropdownOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-[#E5E7EB] py-2 z-20">
                <div className="px-4 py-3 border-b border-[#E5E7EB]">
                  <div className="text-[#111827]">{userName}</div>
                  <div className="caption text-[#6B7280]">{userRole}</div>
                </div>
                <button className="w-full flex items-center gap-3 px-4 py-2 text-[#6B7280] hover:bg-[#F3F4F6] transition-colors">
                  <User className="w-4 h-4" />
                  Mon profil
                </button>
                <button 
                  onClick={() => {
                    setDropdownOpen(false);
                    onLogout();
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2 text-[#EF4444] hover:bg-[#FEE2E2] transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Se déconnecter
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}