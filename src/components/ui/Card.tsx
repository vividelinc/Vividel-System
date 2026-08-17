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
      className={`rounded-[1.5rem] border border-outline bg-surface-1 p-5 shadow-elevation-2 backdrop-blur-sm transition-all duration-200 ${
        onClick ? 'cursor-pointer hover:border-primary/60 hover:bg-surface-2' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
};
