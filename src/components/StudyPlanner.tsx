import { useTheme } from '../context/ThemeContext';

export default function StudyPlanner() {
  const { theme } = useTheme();
  const primaryText = theme === 'light' ? 'text-slate-900' : 'text-white';
  const secondaryText = theme === 'light' ? 'text-slate-600' : 'text-gray-300';
  const mutedText = theme === 'light' ? 'text-slate-500' : 'text-gray-400';
  const innerBg = theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-[rgba(17,24,50,0.5)] border-[rgba(56,78,135,0.15)]';

  return (
    <div className="glass-card p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={mutedText}>
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          <h3 className={`font-bold text-base ${primaryText}`}>Study Planner</h3>
        </div>
        <button className="text-cyan-500 text-xs font-medium hover:text-cyan-400 transition-colors">View planner</button>
      </div>
      <h4 className={`text-sm font-semibold mb-3 ${secondaryText}`}>Today's Schedule</h4>
      <div className={`flex items-center gap-2 p-3 rounded-xl border ${innerBg}`}>
        <span className={`text-xs font-medium ${mutedText}`}>4:00 PM – 5:00 PM</span>
        <span className="px-2 py-0.5 rounded-full bg-green-500/15 text-green-500 text-[10px] font-semibold">Biology</span>
        <span className={`text-xs flex items-center gap-1 ${mutedText}`}>
          Photosynthesis
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="9,18 15,12 9,6" />
          </svg>
        </span>
      </div>
    </div>
  );
}
