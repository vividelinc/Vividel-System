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
    'inline-flex items-center justify-center font-medium transition-all duration-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#40E0D0]/50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap';

  const variants = {
    primary:
      'bg-[#40E0D0] text-[#2B2414] hover:bg-[#00FFEF] shadow-md shadow-[#40E0D0]/20 font-bold',
    secondary:
      'bg-[#775B45] text-[#E9E4DC] hover:bg-[#8A6A52] border border-[#BCA890]/30 font-semibold',
    outline:
      'border border-[#40E0D0]/70 text-[#40E0D0] hover:bg-[#40E0D0]/10 font-semibold',
    danger:
      'bg-rose-600/20 text-rose-300 border border-rose-500/30 hover:bg-rose-600/30',
    ghost:
      'text-[#E9E4DC]/80 hover:text-[#E9E4DC] hover:bg-[#3E3521]'
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
