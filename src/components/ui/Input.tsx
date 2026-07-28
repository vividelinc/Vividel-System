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
        <label className="block text-xs font-semibold uppercase tracking-wider text-[#BCA890]">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {icon && (
          <div className="absolute left-3 text-[#40E0D0] pointer-events-none">
            {icon}
          </div>
        )}
        <input
          className={`w-full bg-[#2B2414] text-[#E9E4DC] placeholder-[#BCA890]/40 border rounded-lg py-2.5 px-3 text-sm focus:outline-none focus:border-[#40E0D0] focus:ring-1 focus:ring-[#40E0D0] transition-all duration-150 ${
            icon ? 'pl-10' : ''
          } ${error ? 'border-rose-500' : 'border-[#554A32]'} ${className}`}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-rose-400 mt-1">{error}</p>}
    </div>
  );
};
