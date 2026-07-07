import React from 'react';
import { useTheme } from '../../context/ThemeContext';

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string | null;
  icon?: string;
}

// Reusable labeled text input with theme-aware styling and inline validation
// error display. Used by both the account information and password forms.
export default function FormInput({ label, error, icon, className, id, ...props }: FormInputProps) {
  const { theme } = useTheme();
  const inputId = id ?? `field-${label.toLowerCase().replace(/\s+/g, '-')}`;

  const baseBg = theme === 'light'
    ? 'bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-cyan-500'
    : 'bg-[rgba(17,24,50,0.55)] border-[rgba(56,78,135,0.2)] text-white placeholder-gray-500 focus:border-cyan-500/50';
  const labelColor = theme === 'light' ? 'text-slate-500' : 'text-gray-500';
  const errorBorder = error ? 'border-red-500/60 focus:border-red-500' : '';

  return (
    <div className="space-y-2">
      <label htmlFor={inputId} className={`block text-xs font-medium ${labelColor}`}>
        {label}
      </label>
      <div className="relative">
        {icon && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">{icon}</span>}
        <input
          id={inputId}
          className={`w-full py-3 rounded-lg border text-sm outline-none transition-colors ${icon ? 'pl-9 pr-3' : 'px-3'} ${baseBg} ${errorBorder} ${className ?? ''}`}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${inputId}-error` : undefined}
          {...props}
        />
      </div>
      {error && (
        <p id={`${inputId}-error`} className="text-xs text-red-500">
          {error}
        </p>
      )}
    </div>
  );
}
