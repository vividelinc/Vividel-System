import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-medium transition-all duration-200 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface-1 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap';

  const variants = {
    primary:
      'bg-primary text-primary-foreground hover:bg-primary-strong shadow-elevation-2 font-semibold',
    secondary:
      'bg-surface-2 text-on-surface hover:bg-surface-3 border border-outline font-semibold',
    outline:
      'border border-primary/70 bg-transparent text-primary hover:bg-primary-soft font-semibold',
    danger:
      'bg-rose-500/15 text-rose-700 border border-rose-300 hover:bg-rose-500/20',
    ghost:
      'text-on-surface-variant hover:text-on-surface hover:bg-surface-2'
  };

  const sizes = {
    sm: 'text-xs px-3 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2.5 gap-2',
    lg: 'text-base px-6 py-3 gap-2.5'
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </button>
  );
};
