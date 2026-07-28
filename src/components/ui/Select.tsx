import React from 'react';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
  error?: string;
}

export const Select: React.FC<SelectProps> = ({
  label,
  options,
  error,
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
      <select
        className={`w-full bg-[#2B2414] text-[#E9E4DC] border rounded-lg py-2.5 px-3 text-sm focus:outline-none focus:border-[#40E0D0] focus:ring-1 focus:ring-[#40E0D0] transition-all duration-150 ${
          error ? 'border-rose-500' : 'border-[#554A32]'
        } ${className}`}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-[#2B2414] text-[#E9E4DC]">
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-rose-400 mt-1">{error}</p>}
    </div>
  );
};
