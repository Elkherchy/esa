import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'neutral';
  size?: 'sm' | 'md';
}

export function Badge({ children, variant = 'neutral', size = 'md' }: BadgeProps) {
  const variants = {
    primary: 'bg-[#DBEAFE] text-[#1D4ED8]',
    secondary: 'bg-[#CFFAFE] text-[#0891B2]',
    success: 'bg-[#D1FAE5] text-[#059669]',
    warning: 'bg-[#FEF3C7] text-[#D97706]',
    error: 'bg-[#FEE2E2] text-[#DC2626]',
    neutral: 'bg-[#F3F4F6] text-[#6B7280]'
  };
  
  const sizes = {
    sm: 'px-2 py-0.5 caption',
    md: 'px-2.5 py-1 caption'
  };
  
  return (
    <span className={`inline-flex items-center rounded-full ${variants[variant]} ${sizes[size]}`}>
      {children}
    </span>
  );
}