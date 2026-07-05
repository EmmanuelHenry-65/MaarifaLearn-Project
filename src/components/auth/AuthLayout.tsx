import React from 'react';
import { useTheme } from '../../context/ThemeContext';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();
  const cardBg = theme === 'light' ? 'bg-white border-slate-200 shadow-2xl' : 'bg-[rgba(17,24,50,0.8)] border-[rgba(56,78,135,0.3)] backdrop-blur-xl';

  return (
    <div className={`min-h-screen w-full flex items-center justify-center p-4 ${theme === 'light' ? 'bg-slate-50' : 'bg-[#0a0e1a]'}`}>
      {/* Background Gradients */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[120px]" />
      </div>
      
      <div className={`w-full max-w-md rounded-2xl border p-8 relative z-10 ${cardBg}`}>
        {children}
      </div>
    </div>
  );
}
