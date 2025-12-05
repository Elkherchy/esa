import React from 'react';
import { X } from 'lucide-react';

interface ChipProps {
  children: React.ReactNode;
  onRemove?: () => void;
  variant?: 'default' | 'secondary';
}

export function Chip({ children, onRemove, variant = 'default' }: ChipProps) {
  const variants = {
    default: 'bg-[#F3F4F6] text-[#374151] hover:bg-[#E5E7EB]',
    secondary: 'bg-[#CFFAFE] text-[#0891B2] hover:bg-[#A5F3FC]'
  };
  
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full caption transition-colors ${variants[variant]}`}>
      {children}
      {onRemove && (
        <button
          onClick={onRemove}
          className="ml-1 hover:bg-black/10 rounded-full p-0.5 transition-colors"
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </span>
  );
}