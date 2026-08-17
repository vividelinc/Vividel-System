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
    'inline-flex items-center justify-center font-medium transition-all duration-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2DD4BF]/50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap';

  const variants = {
    primary:
      'bg-[#2DD4BF] text-[#0A0D10] hover:bg-[#5EEAD4] shadow-md shadow-[#2DD4BF]/20 font-bold',
    secondary:
      'bg-[#1D242B] text-[#F2F4F5] hover:bg-[#262D34] border border-[#333C45] font-semibold',
    outline:
      'border border-[#2DD4BF]/70 text-[#2DD4BF] hover:bg-[#2DD4BF]/10 font-semibold',
    danger:
      'bg-rose-600/20 text-rose-300 border border-rose-500/30 hover:bg-rose-600/30',
    ghost:
      'text-[#F2F4F5]/80 hover:text-[#F2F4F5] hover:bg-[#171D23]'
  };

  const sizes = {
    sm: 'text-xs px-3 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2 gap-2',
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
