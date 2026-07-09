import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { getLevelInfo } from '../services/learning.service';

interface StatsCardsProps {
  currentStreak: number;
  longestStreak: number;
  xp: number;
  rank: number | null;
}

export default function StatsCards({ currentStreak, longestStreak, xp, rank }: StatsCardsProps) {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const textColor = theme === 'light' ? 'text-slate-900' : 'text-white';
  const subTextColor = theme === 'light' ? 'text-slate-600' : 'text-gray-400';
  const progressBarBg = theme === 'light' ? 'bg-slate-200' : 'bg-[rgba(56,78,135,0.3)]';

  const level = getLevelInfo(xp);
  const goToAccomplishments = () => navigate('/accomplishments');

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {/* Day Streak */}
      <button onClick={goToAccomplishments} className="stat-card p-4 flex items-center gap-3 text-left">
        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center shadow-lg shadow-orange-500/20 flex-shrink-0">
          <span className="text-lg">🔥</span>
        </div>
        <div>
          <p className={`text-xl font-bold leading-tight ${textColor}`}>{currentStreak}</p>
          <p className="text-xs font-semibold mt-0.5 text-orange-500">Day Streak</p>
          <p className={`text-[11px] mt-0.5 ${subTextColor}`}>{currentStreak > 0 ? 'Keep it up!' : 'Study today to start one'}</p>
        </div>
      </button>

      {/* Total XP */}
      <button onClick={goToAccomplishments} className="stat-card p-4 flex items-center gap-3 text-left">
        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 flex-shrink-0">
          <span className="text-white font-black text-[11px]">XP</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className={`text-xl font-bold leading-tight ${textColor}`}>{xp.toLocaleString()}</p>
          <p className="text-xs font-semibold mt-0.5 text-cyan-600">Total XP</p>
          <p className={`text-[11px] mt-0.5 ${subTextColor}`}>Next level: {level.nextLevelThreshold.toLocaleString()} XP</p>
          <div className={`mt-1.5 h-1 rounded-full overflow-hidden ${progressBarBg}`}>
            <div className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-cyan-400" style={{ width: `${level.percent}%` }} />
          </div>
        </div>
      </button>

      {/* Your Rank */}
      <button onClick={goToAccomplishments} className="stat-card p-4 flex items-center gap-3 text-left">
        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-yellow-500 to-amber-500 flex items-center justify-center shadow-lg shadow-yellow-500/20 flex-shrink-0">
          <span className="text-lg">🏆</span>
        </div>
        <div>
          <p className={`text-xl font-bold leading-tight ${textColor}`}>{rank != null ? `#${rank}` : '—'}</p>
          <p className="text-xs font-semibold mt-0.5 text-amber-600">Your Rank</p>
          <p className={`text-[11px] mt-0.5 ${subTextColor}`}>Among all learners</p>
        </div>
      </button>

      {/* Longest Streak */}
      <button onClick={goToAccomplishments} className="stat-card p-4 flex items-center gap-3 text-left">
        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/20 flex-shrink-0">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12,6 12,12 16,14" />
          </svg>
        </div>
        <div>
          <p className={`text-xl font-bold leading-tight ${textColor}`}>{longestStreak} {longestStreak === 1 ? 'day' : 'days'}</p>
          <p className="text-xs font-semibold mt-0.5 text-purple-500">Longest Streak</p>
          <p className={`text-[11px] mt-0.5 ${subTextColor}`}>Personal best</p>
        </div>
      </button>
    </div>
  );
}
