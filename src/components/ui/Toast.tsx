import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

interface ToastProps {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
}

export function Toast({ message, type, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);
  
  const styles = {
    success: 'bg-[#D1FAE5] text-[#065F46] border-[#10B981]',
    error: 'bg-[#FEE2E2] text-[#991B1B] border-[#EF4444]'
  };
  
  const Icon = type === 'success' ? CheckCircle2 : AlertCircle;
  
  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-lg border ${styles[type]} shadow-lg min-w-[300px]`}>
      <Icon className="w-5 h-5 flex-shrink-0" />
      <p className="flex-1">{message}</p>
      <button onClick={onClose} className="flex-shrink-0 hover:opacity-70">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}