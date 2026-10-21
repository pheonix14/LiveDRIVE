import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({ icon, className = '', ...props }) => {
  return (
    <div className="relative w-full flex items-center">
      {icon && (
        <span className="absolute left-3.5 text-cream-muted pointer-events-none flex items-center justify-center">
          {icon}
        </span>
      )}
      <input
        className={`w-full bg-bg-card text-cream placeholder-cream-darker border border-bg-border rounded-lg text-sm transition-all duration-200 outline-none focus:border-gold focus:ring-1 focus:ring-gold/40 disabled:opacity-50 ${
          icon ? 'pl-10 pr-4' : 'px-4'
        } py-2.5 ${className}`}
        {...props}
      />
    </div>
  );
};
