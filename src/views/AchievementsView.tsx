const topStats = [
  { value: '34', label: 'Total Achievements', sub: 'Keep it up! You\'re doing great.', iconBg: 'text-blue-400 bg-blue-500/10 border-blue-500/20', iconType: 'trophy' },
  { value: '12', label: 'Day Streak', sub: 'You\'re on fire!', iconBg: 'text-green-400 bg-green-500/10 border-green-500/20', iconType: 'fire' },
  { value: '860', label: 'XP Earned', sub: 'Keep learning, earn more XP!', iconBg: 'text-purple-400 bg-purple-500/10 border-purple-500/20', iconType: 'star' },
  { value: '5', label: 'Rank', sub: 'Top 12% of learners in Grade 10', iconBg: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20', iconType: 'crown' },
];

function StatIcon({ type, className }: { type: string; className?: string }) {
  if (type === 'trophy') {
    return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" /><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" /><path d="M4 22h16" /><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" /><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" /><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" /></svg>;
  }
  if (type === 'fire') {
    return <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M12 23c-3.866 0-7-3.134-7-7 0-3.037 2.328-5.634 3.5-6.5.5-.37 1.5-.5 1.5.5 0 .5.5 1 1 1s1-.5 1-1c0-1 1-.87 1.5-.5C14.672 10.366 17 12.963 17 16c0 3.866-3.134 7-7 7z" /></svg>;
  }
  if (type === 'star') {
    return <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>;
  }
  if (type === 'crown') {
    return <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14v2H5v-2z" /></svg>;
  }
  return null;
}

const badges = [
  { name: 'First Steps', desc: 'Complete your first lesson', image: '/images/badge-first-steps.png', earned: true, date: 'May 10, 2025', glowColor: 'shadow-purple-500/40' },
  { name: 'Consistent Learner', desc: 'Study for 7 days in a row', image: '/images/badge-consistent-learner.png', earned: true, date: 'May 20, 2025', glowColor: 'shadow-green-500/40' },
  { name: 'Quiz Master', desc: 'Score 90% or more in 5 quizzes', image: '/images/badge-quiz-master.png', earned: true, date: 'May 24, 2025', glowColor: 'shadow-blue-500/40' },
  { name: 'Top Performer', desc: 'Score 80% or more in 10 quizzes', image: '/images/badge-top-performer.png', earned: true, date: 'May 24, 2025', glowColor: 'shadow-yellow-500/40' },
  { name: 'Knowledge Seeker', desc: 'Complete 20 lessons', image: '/images/badge-knowledge-seeker.png', earned: true, date: 'Jun 1, 2025', glowColor: 'shadow-purple-500/40' },
  { name: 'Exam Ready', desc: 'Complete 5 past papers', icon: '🔒', color: 'bg-slate-500', earned: false, progress: '3 / 5' },
];

const milestones = [
  { name: 'Lessons Completed', current: 45, total: 50, percent: 90, color: 'bg-green-500', icon: '🎯', iconBg: 'bg-green-500/15 border-green-500/30 text-green-400' },
  { name: 'Quizzes Attempted', current: 28, total: 30, percent: 93, color: 'bg-blue-500', icon: '📝', iconBg: 'bg-blue-500/15 border-blue-500/30 text-blue-400' },
  { name: 'Study Hours', current: 36, total: 50, percent: 72, color: 'bg-purple-500', icon: '⏱️', iconBg: 'bg-purple-500/15 border-purple-500/30 text-purple-400' },
  { name: 'Past Papers Solved', current: 6, total: 10, percent: 60, color: 'bg-orange-500', icon: '📄', iconBg: 'bg-orange-500/15 border-orange-500/30 text-orange-400' },
  { name: 'XP Goal', current: 860, total: 1000, percent: 86, color: 'bg-cyan-500', icon: '⭐', iconBg: 'bg-cyan-500/15 border-cyan-500/30 text-cyan-400' },
];

const recentAchievements = [
  { icon: '📖', title: 'Completed a lesson in Biology', xp: '+20 XP', time: '2 days ago', color: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' },
  { icon: '🧪', title: 'Scored 95% in Chemistry Quiz', xp: '+30 XP', time: 'Yesterday', color: 'bg-orange-500/10 border-orange-500/30 text-orange-400' },
  { icon: '🔥', title: '7 Day Study Streak', xp: '+50 XP', time: '2 days ago', color: 'bg-purple-500/10 border-purple-500/30 text-purple-400' },
  { icon: '📐', title: 'Completed Mathematics Lesson', xp: '+20 XP', time: '3 days ago', color: 'bg-blue-500/10 border-blue-500/30 text-blue-400' },
  { icon: '📝', title: 'Solved a Past Paper', xp: '+40 XP', time: '5 days ago', color: 'bg-pink-500/10 border-pink-500/30 text-pink-400' },
];

const streakDays = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const streakCompleted = [true, true, true, true, true, true, false];

export default function AchievementsView() {
  return (
    <div className="flex gap-6 mt-2 flex-1 min-h-0">
      {/* Main Content */}
      <div className="flex-1 min-w-0 space-y-4 overflow-y-auto pr-1">

        {/* Top Stats */}
        <div className="grid grid-cols-4 gap-4">
          {topStats.map((stat, i) => (
            <div key={i} className="glass-card p-4 flex items-center gap-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 border ${stat.iconBg}`}>
                <StatIcon type={stat.iconType} className="w-6 h-6" />
              </div>
              <div>
                <p className="text-2xl font-extrabold text-white leading-none">{stat.value}</p>
                <p className="text-white font-semibold text-xs mt-1">{stat.label}</p>
                <p className="text-gray-500 text-[10px] mt-0.5">{stat.sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Badges */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-white font-bold text-base">Badges</h3>
              <p className="text-gray-500 text-xs">Earn badges by completing tasks and achieving milestones.</p>
            </div>
            <button className="text-cyan-400 text-xs font-medium hover:text-cyan-300">View all badges</button>
          </div>
          <div className="grid grid-cols-6 gap-3">
            {badges.map((badge, i) => (
              <div key={i} className="bg-[rgba(17,24,50,0.6)] border border-[rgba(56,78,135,0.2)] rounded-xl p-4 text-center flex flex-col items-center hover:border-cyan-500/30 transition-all group">
                {badge.earned ? (
                  <div className={`w-16 h-16 rounded-full overflow-hidden mb-3 shadow-lg ${badge.glowColor} group-hover:scale-110 transition-transform`}>
                    <img src={badge.image} alt={badge.name} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-full bg-slate-700/50 border border-slate-600 flex items-center justify-center text-3xl mb-3 grayscale-[0.6]">
                    {badge.icon}
                  </div>
                )}
                <p className="text-white font-bold text-xs leading-tight">{badge.name}</p>
                <p className="text-gray-500 text-[10px] mt-1 leading-tight line-clamp-2">{badge.desc}</p>
                {badge.earned ? (
                  <span className="mt-2 px-2.5 py-0.5 rounded-full bg-green-500/15 text-green-400 text-[10px] font-bold border border-green-500/20">Earned</span>
                ) : (
                  <div className="mt-2 w-full">
                    <div className="h-1.5 bg-[rgba(56,78,135,0.25)] rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: '60%' }} />
                    </div>
                    <p className="text-[10px] text-gray-500 mt-1">{badge.progress}</p>
                  </div>
                )}
                {badge.earned && <p className="text-gray-600 text-[10px] mt-1">{badge.date}</p>}
              </div>
            ))}
          </div>
        </div>

        {/* Milestones */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-bold text-base">Milestones</h3>
            <button className="text-cyan-400 text-xs font-medium hover:text-cyan-300">View all milestones</button>
          </div>
          <div className="grid grid-cols-5 gap-3">
            {milestones.map((m, i) => (
              <div key={i} className="bg-[rgba(17,24,50,0.5)] border border-[rgba(56,78,135,0.15)] rounded-xl p-4 hover:border-cyan-500/20 transition-all">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-9 h-9 rounded-full border flex items-center justify-center text-base ${m.iconBg}`}>
                    {m.icon}
                  </div>
                  <p className="text-white text-xs font-semibold leading-tight">{m.name}</p>
                </div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-gray-300 font-bold">{m.current} / {m.total}</span>
                  <span className="text-gray-500">{m.percent}%</span>
                </div>
                <div className="h-1.5 bg-[rgba(56,78,135,0.25)] rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${m.color}`} style={{ width: `${m.percent}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Right Sidebar */}
      <div className="w-[300px] flex-shrink-0 space-y-4 overflow-y-auto pb-6">

        {/* Recent Achievements */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-bold text-base">Recent Achievements</h3>
            <button className="text-cyan-400 text-xs font-medium hover:text-cyan-300">View all activity</button>
          </div>
          <div className="space-y-3">
            {recentAchievements.map((ach, i) => (
              <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-[rgba(17,24,50,0.5)] border border-[rgba(56,78,135,0.1)]">
                <div className={`w-8 h-8 rounded-lg border flex items-center justify-center flex-shrink-0 ${ach.color}`}>
                  {ach.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-xs font-semibold leading-tight">{ach.title}</p>
                  <p className="text-green-400 text-[10px] font-bold mt-0.5">{ach.xp}</p>
                </div>
                <span className="text-gray-500 text-[10px] whitespace-nowrap">{ach.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Streak Calendar */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-white font-bold text-base">Streak Calendar</h3>
              <p className="text-gray-500 text-xs">12 days</p>
            </div>
            <span className="text-orange-400 text-xs font-bold">🔥</span>
          </div>
          <p className="text-gray-400 text-xs mb-3">You've studied 12 days in a row. Keep it going!</p>
          <div className="grid grid-cols-7 gap-1 text-center">
            {streakDays.map((day, i) => (
              <div key={i} className="text-[10px] text-gray-500 mb-1">{day}</div>
            ))}
            {streakCompleted.map((done, i) => (
              <div key={i} className={`w-6 h-6 mx-auto rounded-full flex items-center justify-center text-[10px] font-bold ${done ? 'bg-green-500 text-white' : i === 6 ? 'border border-cyan-400 text-cyan-400' : 'bg-[rgba(56,78,135,0.3)] text-gray-600'}`}>
                {done ? '✓' : i === 6 ? '12' : ''}
              </div>
            ))}
          </div>
          <p className="text-orange-400 text-xs mt-3">Longest streak: 12 days</p>
        </div>

        {/* Your Next Achievement */}
        <div className="glass-card p-5">
          <h3 className="text-white font-bold text-base mb-3">Your Next Achievement</h3>
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-full bg-slate-700/60 border border-slate-600 flex items-center justify-center text-2xl flex-shrink-0">
              🛡️
            </div>
            <div className="flex-1">
              <p className="text-white font-semibold text-sm">Exam Ready</p>
              <p className="text-gray-500 text-xs">Complete 5 past papers</p>
              <div className="mt-2 h-1.5 bg-[rgba(56,78,135,0.25)] rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-400" style={{ width: '60%' }} />
              </div>
              <p className="text-gray-500 text-[10px] mt-1">3 / 5</p>
              <button className="mt-3 text-xs font-bold text-cyan-400 hover:text-cyan-300">View Past Papers →</button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
