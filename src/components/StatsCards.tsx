import { allSubjects } from '../data/subjects';

export default function StatsCards() {
  // Compute totals from the centralized subject registry
  const totalLessons = allSubjects.reduce((acc, s) => acc + s.totalLessons, 0);
  const completedLessons = allSubjects.reduce((acc, s) => acc + s.lessonsCompleted, 0);
  const avgProgress = Math.round(
    allSubjects.reduce((acc, s) => acc + s.progress, 0) / allSubjects.length
  );

  // XP / rank values are derived (mock)
  const xpFromProgress = Math.round(completedLessons * 100);
  const totalXP = Math.max(xpFromProgress, 1500);

  return (
    <div className="grid grid-cols-4 gap-4">
      {/* Day Streak */}
      <div className="stat-card p-4 flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center shadow-lg shadow-orange-500/20 flex-shrink-0">
          <span className="text-lg">🔥</span>
        </div>
        <div>
          <p className="text-xl font-bold text-white leading-tight">7</p>
          <p className="text-xs font-semibold mt-0.5 text-orange-400">Day Streak</p>
          <p className="text-[11px] text-gray-500 mt-0.5">Keep it up!</p>
        </div>
      </div>

      {/* Total XP */}
      <div className="stat-card p-4 flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 flex-shrink-0">
          <span className="text-white font-black text-[11px]">XP</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xl font-bold text-white leading-tight">{totalXP.toLocaleString()}</p>
          <p className="text-xs font-semibold mt-0.5 text-cyan-400">Total XP</p>
          <p className="text-[11px] text-gray-500 mt-0.5">Next level: {(totalXP + 440).toLocaleString()} XP</p>
          <div className="mt-1.5 h-1 rounded-full bg-[rgba(56,78,135,0.3)] overflow-hidden">
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
          <p className="text-xl font-bold text-white leading-tight">{Math.max(1, 100 - avgProgress)}</p>
          <p className="text-xs font-semibold mt-0.5 text-yellow-400">Your Rank</p>
          <p className="text-[11px] text-gray-500 mt-0.5">Top {100 - avgProgress + 5}% learners</p>
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
          <p className="text-xl font-bold text-white leading-tight">{Math.round(completedLessons * 0.6)}h {Math.round((completedLessons * 0.6 % 1) * 60)}m</p>
          <p className="text-xs font-semibold mt-0.5 text-purple-400">Study Time</p>
          <p className="text-[11px] text-gray-500 mt-0.5">{completedLessons} / {totalLessons} lessons</p>
        </div>
      </div>
    </div>
  );
}
