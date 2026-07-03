export default function RecentAchievements() {
  return (
    <div className="glass-card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-bold text-base">Recent Achievements</h3>
        <button className="text-cyan-400 text-xs font-medium hover:text-cyan-300 transition-colors">
          View all
        </button>
      </div>
      <div className="flex items-center gap-3">
        <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0">
          <img
            src="/images/achievement-badge.png"
            alt="Achievement"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-white font-semibold text-sm">Science Explorer</h4>
          <p className="text-gray-400 text-xs mt-0.5">
            Completed 5 Biology lessons
          </p>
          <p className="text-green-400 text-xs font-bold mt-1">+100 XP</p>
        </div>
      </div>
      {/* Dots */}
      <div className="flex items-center justify-center gap-1.5 mt-4">
        <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
        <div className="w-1.5 h-1.5 rounded-full bg-[rgba(56,78,135,0.4)]" />
        <div className="w-1.5 h-1.5 rounded-full bg-[rgba(56,78,135,0.4)]" />
        <div className="w-1.5 h-1.5 rounded-full bg-[rgba(56,78,135,0.4)]" />
      </div>
    </div>
  );
}
