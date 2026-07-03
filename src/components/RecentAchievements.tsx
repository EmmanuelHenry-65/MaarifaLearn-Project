import { recentAchievements, getSubject } from '../data/subjects';

export default function RecentAchievements() {
  const first = recentAchievements[0];
  const sub = getSubject(first.subjectId);
  return (
    <div className="glass-card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-bold text-base">Recent Achievements</h3>
        <button className="text-cyan-400 text-xs font-medium hover:text-cyan-300 transition-colors">View all</button>
      </div>
      <div className="flex items-center gap-3">
        <div className={`w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center text-2xl ${sub.iconBg}`}>
          {sub.icon}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-white font-semibold text-sm">{first.title}</h4>
          <p className="text-gray-400 text-xs mt-0.5">{first.time}</p>
          <p className="text-green-400 text-xs font-bold mt-1">{first.xp}</p>
        </div>
      </div>
      <div className="flex items-center justify-center gap-1.5 mt-4">
        <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
        <div className="w-1.5 h-1.5 rounded-full bg-[rgba(56,78,135,0.4)]" />
        <div className="w-1.5 h-1.5 rounded-full bg-[rgba(56,78,135,0.4)]" />
        <div className="w-1.5 h-1.5 rounded-full bg-[rgba(56,78,135,0.4)]" />
      </div>
    </div>
  );
}
