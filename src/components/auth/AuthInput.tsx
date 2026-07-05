import React from 'react';
import { useTheme } from '../../context/ThemeContext';

interface AuthInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export default function AuthInput({ label, className, ...props }: AuthInputProps) {
  const { theme } = useTheme();
  const inputClass = theme === 'light'
    ? 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-cyan-500'
    : 'bg-[rgba(17,24,50,0.6)] border-[rgba(56,78,135,0.3)] text-white placeholder-gray-500 focus:border-cyan-500/50';

  return (
    <div className="space-y-1.5">
      <label className={`block text-sm font-semibold ${theme === 'light' ? 'text-slate-700' : 'text-gray-300'}`}>{label}</label>
      <input
        className={`w-full px-4 py-3 rounded-xl border outline-none transition-all ${inputClass} ${className}`}
        {...props}
      />
    </div>
  );
}
