import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';

interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string | null;
}

// Password field with a show/hide toggle. The password value itself is only
// ever held in the parent form's local state and is never logged or stored
// anywhere other than being sent straight to Supabase Auth.
export default function PasswordInput({ label, error, id, className, ...props }: PasswordInputProps) {
  const { theme } = useTheme();
  const [visible, setVisible] = useState(false);
  const inputId = id ?? `field-${label.toLowerCase().replace(/\s+/g, '-')}`;

  const baseBg = theme === 'light'
    ? 'bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-cyan-500 focus:ring-cyan-500/15'
    : 'bg-[rgba(17,24,50,0.55)] border-[rgba(56,78,135,0.25)] text-white placeholder-gray-500 focus:border-cyan-500/60 focus:ring-cyan-500/10';
  const labelColor = theme === 'light' ? 'text-slate-500' : 'text-gray-500';
  const errorBorder = error ? '!border-red-500/60 focus:!ring-red-500/15' : '';

  return (
    <div className="space-y-1.5">
      <label htmlFor={inputId} className={`block text-[11px] font-semibold uppercase tracking-wide ${labelColor}`}>
        {label}
      </label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">🔒</span>
        <input
          id={inputId}
          type={visible ? 'text' : 'password'}
          autoComplete="new-password"
          className={`w-full pl-9 pr-10 py-3 rounded-xl border text-sm outline-none transition-all duration-200 focus:ring-4 ${baseBg} ${errorBorder} ${className ?? ''}`}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${inputId}-error` : undefined}
          {...props}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-cyan-500 transition-colors text-sm"
          tabIndex={-1}
          aria-label={visible ? 'Hide password' : 'Show password'}
        >
          {visible ? '🙈' : '👁️'}
        </button>
      </div>
      {error && (
        <p id={`${inputId}-error`} className="text-xs text-red-500 flex items-center gap-1">
          <span>⚠</span> {error}
        </p>
      )}
    </div>
  );
}
