import { useTheme } from '../../context/ThemeContext';

export default function LoadingScreen() {
  const { theme } = useTheme();
  
  return (
    <div className={`min-h-screen w-full flex flex-col items-center justify-center ${theme === 'light' ? 'bg-slate-50' : 'bg-[#0a0e1a]'}`}>
      <div className="relative">
        <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-2xl shadow-cyan-500/30 animate-pulse">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
          </svg>
        </div>
        <div className="absolute -inset-4 bg-cyan-500/20 rounded-full blur-xl animate-ping" />
      </div>
      <h1 className={`mt-8 text-2xl font-extrabold tracking-tight ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
        Maarifa <span className="text-cyan-500">Learn</span>
      </h1>
      <p className="mt-2 text-sm text-gray-500 animate-pulse">Loading your learning environment...</p>
    </div>
  );
}
