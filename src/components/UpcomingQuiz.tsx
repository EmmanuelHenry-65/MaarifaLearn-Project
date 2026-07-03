import { useTheme } from '../context/ThemeContext';

export default function UpcomingQuiz() {
  const { theme } = useTheme();
  const primaryText = theme === 'light' ? 'text-slate-900' : 'text-white';
  const bodyText = theme === 'light' ? 'text-slate-500' : 'text-gray-400';
  const innerBg = theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-[rgba(17,24,50,0.6)] border-[rgba(56,78,135,0.2)]';

  return (
    <div className="glass-card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className={`font-bold text-base ${primaryText}`}>Upcoming Quiz</h3>
        <button className="text-cyan-500 text-xs font-medium hover:text-cyan-400 transition-colors">View all</button>
      </div>
      <div className={`p-3.5 rounded-xl border ${innerBg}`}>
        <h4 className={`font-semibold text-sm ${primaryText}`}>Biology Quiz - Photosynthesis</h4>
        <div className="flex items-center gap-3 mt-2.5">
          <div className={`flex items-center gap-1.5 text-xs ${bodyText}`}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            Tomorrow, 10:00 AM
          </div>
          <span className="px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-500 text-[10px] font-semibold">
            20 Questions
          </span>
        </div>
      </div>
      <button className="w-full btn-primary mt-4 py-2.5 text-white text-sm font-semibold">
        Start Revision
      </button>
    </div>
  );
}
