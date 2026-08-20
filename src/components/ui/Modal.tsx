import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl';
  closeOnOverlayClick?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = 'md',
  closeOnOverlayClick = true
}) => {
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const widthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
    '5xl': 'max-w-5xl',
    '6xl': 'max-w-6xl',
    '7xl': 'max-w-7xl'
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-surface-1/70 p-4 backdrop-blur-md"
      onClick={closeOnOverlayClick ? onClose : undefined}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        onClick={(event) => event.stopPropagation()}
        className={`w-full overflow-hidden rounded-[1.75rem] border border-outline bg-surface-1 shadow-elevation-5 ${widthClasses[maxWidth]}`}
      >
        <div className="flex items-center justify-between border-b border-outline bg-surface-2 px-6 py-4">
          <h3 className="text-lg font-semibold text-on-surface">{title}</h3>
          <button
            type="button"
            aria-label="Close dialog"
            onClick={onClose}
            className="rounded-full p-2 text-on-surface-variant transition hover:bg-surface-1 hover:text-on-surface"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="max-h-[88vh] overflow-y-auto p-6">{children}</div>
      </div>
    </div>
  );
};
