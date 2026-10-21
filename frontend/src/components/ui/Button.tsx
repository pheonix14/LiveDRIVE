import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'gold' | 'ghost' | 'danger' | 'subtle';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'gold',
  size = 'md',
  className = '',
  children,
  ...props
}) => {
  const base =
    'inline-flex items-center justify-center font-medium transition-all duration-200 select-none disabled:opacity-40 disabled:cursor-not-allowed outline-none';

  const sizes = {
    sm: 'text-xs px-2.5 py-1.5 rounded-md gap-1.5',
    md: 'text-sm px-4 py-2 rounded-lg gap-2',
    lg: 'text-base px-6 py-3 rounded-xl gap-2.5 font-semibold',
    icon: 'p-2 rounded-lg aspect-square',
  };

  const variants = {
    gold: 'bg-gold text-bg font-bold hover:bg-gold-hover shadow-[0_0_15px_rgba(242,193,46,0.3)] active:scale-95',
    ghost:
      'bg-transparent text-cream border border-gold/30 hover:border-gold hover:text-gold hover:bg-gold/10 active:scale-95',
    danger:
      'bg-crimson/15 text-crimson border border-crimson/30 hover:bg-crimson hover:text-white active:scale-95',
    subtle:
      'bg-bg-elevated text-cream-muted hover:text-cream hover:bg-bg-card active:scale-95 border border-white/5',
  };

  return (
    <button
      className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
