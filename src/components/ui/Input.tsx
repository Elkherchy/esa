import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className = '', ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label className="text-[#374151]">
          {label}
        </label>
      )}
      <input
        className={`px-4 py-3 rounded-lg border border-[#E5E7EB] bg-white text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#1D4ED8] focus:border-transparent transition-all ${error ? 'border-[#EF4444]' : ''} ${className}`}
        {...props}
      />
      {error && (
        <span className="caption text-[#EF4444]">{error}</span>
      )}
    </div>
  );
}