import { useTheme } from '../context/ThemeContext';

export function ThemeToggleCompact() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="flex items-center justify-between w-full p-3 rounded-xl bg-[rgba(17,24,50,0.55)] border border-[rgba(56,78,135,0.2)] text-gray-200 text-sm hover:border-cyan-500/30 transition-all"
    >
      <div className="flex items-center gap-3">
        <span className="text-sm">{theme === 'dark' ? '🌙' : '☀️'}</span>
        <span className="font-semibold">{theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</span>
      </div>
      <div className={`w-10 h-5 rounded-full relative transition-colors ${theme === 'dark' ? 'bg-cyan-600' : 'bg-slate-400'}`}>
        <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${theme === 'dark' ? 'left-6' : 'left-1'}`} />
      </div>
    </button>
  );
}

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="relative p-2.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--card-border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-cyan-500/50 transition-all overflow-hidden group"
      aria-label="Toggle Theme"
    >
      <div className={`transition-transform duration-500 flex items-center justify-center ${theme === 'dark' ? 'rotate-0' : 'rotate-[360deg]'}`}>
        {theme === 'dark' ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-500 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]">
            <circle cx="12" cy="12" r="5" />
            <line x1="12" y1="1" x2="12" y2="3" />
            <line x1="12" y1="21" x2="12" y2="23" />
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
            <line x1="1" y1="12" x2="3" y2="12" />
            <line x1="21" y1="12" x2="23" y2="12" />
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
          </svg>
        )}
      </div>
      <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
    </button>
  );
}
