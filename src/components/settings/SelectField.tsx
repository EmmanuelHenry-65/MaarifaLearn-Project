import React from 'react';
import { useTheme } from '../../context/ThemeContext';

interface SelectFieldProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  icon?: string;
  options: { label: string; value: string }[];
  placeholder?: string;
}

// Reusable labeled <select>. Used for enumerable account fields (grade,
// curriculum, learning pathway) and the "default learning view" preference.
export default function SelectField({ label, icon, options, placeholder, id, className, ...props }: SelectFieldProps) {
  const { theme } = useTheme();
  const selectId = id ?? `field-${label.toLowerCase().replace(/\s+/g, '-')}`;

  const baseBg = theme === 'light'
    ? 'bg-white border-slate-200 text-slate-900 focus:border-cyan-500 focus:ring-cyan-500/15'
    : 'bg-[rgba(17,24,50,0.55)] border-[rgba(56,78,135,0.25)] text-white focus:border-cyan-500/60 focus:ring-cyan-500/10';
  const labelColor = theme === 'light' ? 'text-slate-500' : 'text-gray-500';

  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={selectId} className={`block text-[11px] font-semibold uppercase tracking-wide ${labelColor}`}>
          {label}
        </label>
      )}
      <div className="relative">
        {icon && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500 pointer-events-none">{icon}</span>}
        <select
          id={selectId}
          className={`w-full py-3 rounded-xl border text-sm outline-none transition-all duration-200 appearance-none cursor-pointer focus:ring-4 ${icon ? 'pl-9 pr-8' : 'px-3 pr-8'} ${baseBg} ${className ?? ''}`}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs pointer-events-none">▾</span>
      </div>
    </div>
  );
}
