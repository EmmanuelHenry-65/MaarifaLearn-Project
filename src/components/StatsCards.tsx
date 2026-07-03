import { useTheme } from '../context/ThemeContext';

export default function StatsCards() {
  const { theme } = useTheme();
  const primaryText = theme === 'light' ? 'text-slate-900' : 'text-white';
  const mutedText = theme === 'light' ? 'text-slate-500' : 'text-gray-500';

  return (
    <div className="grid grid-cols-4 gap-4">
      {/* Day Streak */}
      <div className="stat-card p-4 flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center shadow-lg shadow-orange-500/20 flex-shrink-0">
          <span className="text-lg">🔥</span>
        </div>
        <div>
          <p className={`text-xl font-bold leading-tight ${primaryText}`}>7</p>
          <p className="text-xs font-semibold mt-0.5 text-orange-400">Day Streak</p>
          <p className={`text-[11px] mt-0.5 ${mutedText}`}>Keep it up!</p>
        </div>
      </div>

      {/* Total XP */}
      <div className="stat-card p-4 flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 flex-shrink-0">
          <span className="text-white font-black text-[11px]">XP</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className={`text-xl font-bold leading-tight ${primaryText}`}>2,560</p>
          <p className="text-xs font-semibold mt-0.5 text-cyan-400">Total XP</p>
          <p className={`text-[11px] mt-0.5 ${mutedText}`}>Next level: 3,000 XP</p>
          <div className={`mt-1.5 h-1 rounded-full overflow-hidden ${theme === 'light' ? 'bg-slate-200' : 'bg-[rgba(56,78,135,0.3)]'}`}>
            <div className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-cyan-400" style={{ width: '85%' }} />
          </div>
        </div>
      </div>

      {/* Your Rank */}
      <div className="stat-card p-4 flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-yellow-500 to-amber-500 flex items-center justify-center shadow-lg shadow-yellow-500/20 flex-shrink-0">
          <span className="text-lg">🏆</span>
        </div>
        <div>
          <p className={`text-xl font-bold leading-tight ${primaryText}`}>18</p>
          <p className="text-xs font-semibold mt-0.5 text-yellow-500">Your Rank</p>
          <p className={`text-[11px] mt-0.5 ${mutedText}`}>Top 5% learners</p>
        </div>
      </div>

      {/* Study Time */}
      <div className="stat-card p-4 flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/20 flex-shrink-0">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12,6 12,12 16,14" />
          </svg>
        </div>
        <div>
          <p className={`text-xl font-bold leading-tight ${primaryText}`}>34h 20m</p>
          <p className="text-xs font-semibold mt-0.5 text-purple-400">Study Time</p>
          <p className={`text-[11px] mt-0.5 ${mutedText}`}>This week</p>
        </div>
      </div>
    </div>
  );
}
