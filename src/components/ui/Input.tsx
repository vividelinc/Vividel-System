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
        <label className="block text-xs font-semibold uppercase tracking-wider text-[#8B96A0]">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {icon && (
          <div className="absolute left-3 text-[#2DD4BF] pointer-events-none">
            {icon}
          </div>
        )}
        <input
          className={`w-full bg-[#0A0D10] text-[#F2F4F5] placeholder-[#8B96A0]/40 border rounded-lg py-2.5 px-3 text-sm focus:outline-none focus:border-[#2DD4BF] focus:ring-1 focus:ring-[#2DD4BF] transition-all duration-150 ${
            icon ? 'pl-10' : ''
          } ${error ? 'border-rose-500' : 'border-[#262D34]'} ${className}`}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-rose-400 mt-1">{error}</p>}
    </div>
  );
};
