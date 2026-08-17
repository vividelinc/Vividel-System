import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  icon,
  className = '',
  ...props
}) => {
  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label className="block text-[11px] font-semibold uppercase tracking-[0.18em] text-on-surface-variant">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {icon && <div className="pointer-events-none absolute left-3 text-primary">{icon}</div>}
        <input
          className={`w-full rounded-[1rem] border bg-surface-2 px-3 py-2.5 text-sm text-on-surface placeholder:text-on-surface-variant/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/25 transition-all duration-150 ${
            icon ? 'pl-10' : ''
          } ${error ? 'border-rose-500' : 'border-outline'} ${className}`}
          {...props}
        />
      </div>
      {error && <p className="mt-1 text-xs text-rose-500">{error}</p>}
    </div>
  );
};
