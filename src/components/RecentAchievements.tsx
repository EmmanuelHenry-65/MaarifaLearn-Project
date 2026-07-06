import { useNavigate } from 'react-router-dom';
import type { EarnedAchievement } from '../services/achievements.service';

function formatRelativeDate(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'Yesterday';
  return `${days}d ago`;
}

interface RecentAchievementsProps {
  achievements: EarnedAchievement[];
}

export default function RecentAchievements({ achievements }: RecentAchievementsProps) {
  const navigate = useNavigate();
  const latest = achievements[0];
  const dotCount = Math.min(achievements.length, 4) || 1;

  return (
    <div className="glass-card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-bold text-base">Recent Achievements</h3>
        <button onClick={() => navigate('/accomplishments')} className="text-cyan-400 text-xs font-medium hover:text-cyan-300 transition-colors">View all</button>
      </div>
      {latest ? (
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-xl shrink-0 flex items-center justify-center text-2xl bg-cyan-500/10 border border-cyan-500/30">
            🏆
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-white font-semibold text-sm">{latest.title}</h4>
            <p className="text-gray-400 text-xs mt-0.5">{latest.description}</p>
            <p className="text-cyan-400 text-xs font-bold mt-1">{formatRelativeDate(latest.earnedAt)}</p>
          </div>
        </div>
      ) : (
        <p className="text-gray-500 text-xs text-center py-4">Complete a topic to earn your first achievement!</p>
      )}
      {achievements.length > 0 && (
        <div className="flex items-center justify-center gap-1.5 mt-4">
          {Array.from({ length: dotCount }).map((_, i) => (
            <div key={i} className={`w-1.5 h-1.5 rounded-full ${i === 0 ? 'bg-cyan-400' : 'bg-[rgba(56,78,135,0.4)]'}`} />
          ))}
        </div>
      )}
    </div>
  );
}
