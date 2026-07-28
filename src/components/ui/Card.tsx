import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({ children, className = '', onClick }) => {
  return (
    <div
      onClick={onClick}
      className={`bg-[#3E3521]/90 border border-[#554A32] rounded-xl p-5 shadow-xl backdrop-blur-sm transition-all duration-200 ${
        onClick ? 'cursor-pointer hover:border-[#40E0D0]/60 hover:bg-[#483E28]' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
};
