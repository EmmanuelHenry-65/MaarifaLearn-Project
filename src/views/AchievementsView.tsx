import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAchievementCelebration } from '../context/AchievementCelebrationContext';
import { ensureProfile, getMyLearningData, computeStreak, computeLongestStreak, type LearningTopic } from '../services/learning.service';
import Spinner from '../components/common/Spinner';
import {
  BADGE_DEFINITIONS,
  MILESTONE_DEFINITIONS,
  getAchievementContext,
  syncEarnedBadges,
  getEarnedAchievements,
  getRank,
  type AchievementContext,
  type EarnedAchievement,
} from '../services/achievements.service';

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

function formatRelativeDate(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function AchievementsView() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { celebrate } = useAchievementCelebration();
  const [topics, setTopics] = useState<LearningTopic[]>([]);
  const [earned, setEarned] = useState<EarnedAchievement[]>([]);
  const [rank, setRank] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [showAllActivity, setShowAllActivity] = useState(false);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    setLoading(true);
    setLoadError(null);
    (async () => {
      try {
        await ensureProfile(user);
        const fetchedTopics = await getMyLearningData();
        const streak = computeStreak(fetchedTopics);
        const longestStreak = computeLongestStreak(fetchedTopics);
        const ctx = getAchievementContext(fetchedTopics, streak.currentStreak, longestStreak);
        const newlyEarned = await syncEarnedBadges(user.id, ctx);
        const [fetchedEarned, fetchedRank] = await Promise.all([getEarnedAchievements(user.id), getRank()]);
        if (!cancelled) {
          setTopics(fetchedTopics);
          setEarned(fetchedEarned);
          setRank(fetchedRank);
          celebrate(newlyEarned);
        }
      } catch (err) {
        if (!cancelled) setLoadError(err instanceof Error ? err.message : 'Failed to load your achievements.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const streak = useMemo(() => computeStreak(topics), [topics]);
  const longestStreak = useMemo(() => computeLongestStreak(topics), [topics]);
  const ctx: AchievementContext = useMemo(
    () => getAchievementContext(topics, streak.currentStreak, longestStreak),
    [topics, streak.currentStreak, longestStreak],
  );

  const badges = useMemo(
    () =>
      BADGE_DEFINITIONS.map((def) => {
        const earnedRow = earned.find((e) => e.title === def.name);
        return {
          def,
          isEarned: Boolean(earnedRow),
          earnedAt: earnedRow?.earnedAt ?? null,
          percent: def.progressPercent(ctx),
          label: def.progressLabel(ctx),
        };
      }),
    [earned, ctx],
  );

  const milestones = useMemo(
    () =>
      MILESTONE_DEFINITIONS.map((def) => {
        const current = def.current(ctx);
        const total = def.total(ctx);
        return { def, current, total, percent: total ? Math.min(100, Math.round((current / total) * 100)) : 0 };
      }),
    [ctx],
  );

  const nextBadge = useMemo(
    () => [...badges].filter((b) => !b.isEarned).sort((a, b) => b.percent - a.percent)[0],
    [badges],
  );

  const topStats = [
    { value: String(earned.length), label: 'Total Achievements', sub: earned.length > 0 ? 'Keep it up! You\'re doing great.' : 'Start learning to earn your first one.', iconBg: 'text-blue-400 bg-blue-500/10 border-blue-500/20', iconType: 'trophy' },
    { value: String(streak.currentStreak), label: 'Day Streak', sub: streak.currentStreak > 0 ? "You're on fire!" : 'Study today to start a streak.', iconBg: 'text-green-400 bg-green-500/10 border-green-500/20', iconType: 'fire' },
    { value: ctx.xp.toLocaleString(), label: 'XP Earned', sub: 'Keep learning, earn more XP!', iconBg: 'text-purple-400 bg-purple-500/10 border-purple-500/20', iconType: 'star' },
    { value: rank != null ? `#${rank}` : '—', label: 'Rank', sub: 'Among all learners on Maarifa', iconBg: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20', iconType: 'crown' },
  ];

  const visibleActivity = showAllActivity ? earned : earned.slice(0, 5);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-0">
        <Spinner size="md" label="Loading your achievements..." />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-0">
        <p className="text-red-400 text-sm">{loadError}</p>
      </div>
    );
  }

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
              <p className="text-gray-500 text-xs">Earn badges by completing topics and achieving milestones.</p>
            </div>
          </div>
          <div className="grid grid-cols-6 gap-3">
            {badges.map(({ def, isEarned, earnedAt, percent, label }) => (
              <div key={def.key} className="bg-[rgba(17,24,50,0.6)] border border-[rgba(56,78,135,0.2)] rounded-xl p-4 text-center flex flex-col items-center hover:border-cyan-500/30 transition-all group">
                {isEarned && def.image ? (
                  <div className={`w-16 h-16 rounded-full overflow-hidden mb-3 shadow-lg ${def.glowColor} group-hover:scale-110 transition-transform`}>
                    <img src={def.image} alt={def.name} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className={`w-16 h-16 rounded-full bg-slate-700/50 border border-slate-600 flex items-center justify-center text-3xl mb-3 ${isEarned ? '' : 'grayscale-[0.6]'}`}>
                    {def.icon ?? '🔒'}
                  </div>
                )}
                <p className="text-white font-bold text-xs leading-tight">{def.name}</p>
                <p className="text-gray-500 text-[10px] mt-1 leading-tight line-clamp-2">{def.desc}</p>
                {isEarned ? (
                  <span className="mt-2 px-2.5 py-0.5 rounded-full bg-green-500/15 text-green-400 text-[10px] font-bold border border-green-500/20">Earned</span>
                ) : (
                  <div className="mt-2 w-full">
                    <div className="h-1.5 bg-[rgba(56,78,135,0.25)] rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: `${percent}%` }} />
                    </div>
                    <p className="text-[10px] text-gray-500 mt-1">{label}</p>
                  </div>
                )}
                {isEarned && earnedAt && <p className="text-gray-600 text-[10px] mt-1">{formatRelativeDate(earnedAt)}</p>}
              </div>
            ))}
          </div>
        </div>

        {/* Milestones */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-bold text-base">Milestones</h3>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {milestones.map(({ def, current, total, percent }) => (
              <div key={def.key} className="bg-[rgba(17,24,50,0.5)] border border-[rgba(56,78,135,0.15)] rounded-xl p-4 hover:border-cyan-500/20 transition-all">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-9 h-9 rounded-full border flex items-center justify-center text-base ${def.iconBg}`}>
                    {def.icon}
                  </div>
                  <p className="text-white text-xs font-semibold leading-tight">{def.name}</p>
                </div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-gray-300 font-bold">{current} / {total}</span>
                  <span className="text-gray-500">{percent}%</span>
                </div>
                <div className="h-1.5 bg-[rgba(56,78,135,0.25)] rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${def.color}`} style={{ width: `${percent}%` }} />
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
            {earned.length > 5 && (
              <button onClick={() => setShowAllActivity((v) => !v)} className="text-cyan-400 text-xs font-medium hover:text-cyan-300">
                {showAllActivity ? 'Show less' : 'View all activity'}
              </button>
            )}
          </div>
          {visibleActivity.length === 0 ? (
            <p className="text-gray-500 text-xs text-center py-4">Complete topics to start earning achievements!</p>
          ) : (
            <div className="space-y-3">
              {visibleActivity.map((ach, i) => (
                <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-[rgba(17,24,50,0.5)] border border-[rgba(56,78,135,0.1)]">
                  <div className="w-8 h-8 rounded-lg border flex items-center justify-center flex-shrink-0 bg-cyan-500/10 border-cyan-500/30 text-cyan-400">
                    🏆
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-xs font-semibold leading-tight">{ach.title}</p>
                    <p className="text-gray-500 text-[10px] mt-0.5 leading-tight">{ach.description}</p>
                  </div>
                  <span className="text-gray-500 text-[10px] whitespace-nowrap">{formatRelativeDate(ach.earnedAt)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Streak Calendar */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-white font-bold text-base">Streak Calendar</h3>
              <p className="text-gray-500 text-xs">{streak.currentStreak} {streak.currentStreak === 1 ? 'day' : 'days'}</p>
            </div>
            <span className="text-orange-400 text-xs font-bold">🔥</span>
          </div>
          <p className="text-gray-400 text-xs mb-3">
            {streak.currentStreak > 0 ? `You've studied ${streak.currentStreak} days in a row. Keep it going!` : 'Study today to start a streak!'}
          </p>
          <div className="grid grid-cols-7 gap-1 text-center">
            {streak.days.map((d) => (
              <div key={`label-${d.date}`} className="text-[10px] text-gray-500 mb-1">{d.label}</div>
            ))}
            {streak.days.map((d) => (
              <div key={d.date} className={`w-6 h-6 mx-auto rounded-full flex items-center justify-center text-[10px] font-bold ${d.active ? 'bg-green-500 text-white' : 'bg-[rgba(56,78,135,0.3)] text-gray-600'}`}>
                {d.active ? '✓' : ''}
              </div>
            ))}
          </div>
          <p className="text-orange-400 text-xs mt-3">Longest streak: {longestStreak} {longestStreak === 1 ? 'day' : 'days'}</p>
        </div>

        {/* Your Next Achievement */}
        <div className="glass-card p-5">
          <h3 className="text-white font-bold text-base mb-3">Your Next Achievement</h3>
          {nextBadge ? (
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-full bg-slate-700/60 border border-slate-600 flex items-center justify-center text-2xl flex-shrink-0">
                {nextBadge.def.icon ?? '🛡️'}
              </div>
              <div className="flex-1">
                <p className="text-white font-semibold text-sm">{nextBadge.def.name}</p>
                <p className="text-gray-500 text-xs">{nextBadge.def.desc}</p>
                <div className="mt-2 h-1.5 bg-[rgba(56,78,135,0.25)] rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-400" style={{ width: `${nextBadge.percent}%` }} />
                </div>
                <p className="text-gray-500 text-[10px] mt-1">{nextBadge.label}</p>
                <button onClick={() => navigate(nextBadge.def.ctaRoute)} className="mt-3 text-xs font-bold text-cyan-400 hover:text-cyan-300">
                  {nextBadge.def.ctaLabel} →
                </button>
              </div>
            </div>
          ) : (
            <p className="text-gray-400 text-sm">You've earned every badge. Amazing work! 🎉</p>
          )}
        </div>

      </div>
    </div>
  );
}
