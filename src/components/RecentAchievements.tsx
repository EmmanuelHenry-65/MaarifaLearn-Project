import { useTheme } from '../context/ThemeContext';

export default function RecentAchievements() {
  const { theme } = useTheme();
  const primaryText = theme === 'light' ? 'text-slate-900' : 'text-white';
  const bodyText = theme === 'light' ? 'text-slate-500' : 'text-gray-400';

  return (
    <div className="glass-card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className={`font-bold text-base ${primaryText}`}>Recent Achievements</h3>
        <button className="text-cyan-500 text-xs font-medium hover:text-cyan-400 transition-colors">View all</button>
      </div>
      <div className="flex items-center gap-3">
        <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0">
          <img
            src="/images/achievement-badge.png"
            alt="Achievement"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className={`font-semibold text-sm ${primaryText}`}>Science Explorer</h4>
          <p className={`text-xs mt-0.5 ${bodyText}`}>Completed 5 Biology lessons</p>
          <p className="text-green-500 text-xs font-bold mt-1">+100 XP</p>
        </div>
      </div>
      <div className="flex items-center justify-center gap-1.5 mt-4">
        <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
        <div className={`w-1.5 h-1.5 rounded-full ${theme === 'light' ? 'bg-slate-300' : 'bg-[rgba(56,78,135,0.4)]'}`} />
        <div className={`w-1.5 h-1.5 rounded-full ${theme === 'light' ? 'bg-slate-300' : 'bg-[rgba(56,78,135,0.4)]'}`} />
        <div className={`w-1.5 h-1.5 rounded-full ${theme === 'light' ? 'bg-slate-300' : 'bg-[rgba(56,78,135,0.4)]'}`} />
      </div>
    </div>
  );
}
