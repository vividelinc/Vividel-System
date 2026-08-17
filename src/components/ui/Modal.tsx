import React from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = 'md'
}) => {
  if (!isOpen) return null;

  const widthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div
        className={`w-full bg-[#171D23] border border-[#262D34] rounded-2xl shadow-2xl overflow-hidden ${widthClasses[maxWidth]}`}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#262D34] bg-[#10151A]">
          <h3 className="text-lg font-semibold text-[#F2F4F5]">{title}</h3>
          <button
            onClick={onClose}
            className="text-[#F2F4F5]/60 hover:text-[#F2F4F5] p-1 rounded-lg hover:bg-[#262D34] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 max-h-[80vh] overflow-y-auto">{children}</div>
      </div>
    </div>
  );
};
