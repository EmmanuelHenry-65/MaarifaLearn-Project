import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import {
  ensureProfile,
  getMyLearningData,
  getUpcomingLessons,
  toggleBookmark,
  computeStreak,
  computePerformanceStats,
  type LearningTopic,
  type UpcomingLesson,
} from '../services/learning.service';
import { styleFor } from '../lib/subjectStyle';

function formatRelativeTime(iso: string | null): string {
  if (!iso) return 'Not started yet';
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function formatDueLabel(iso: string | null): string {
  if (!iso) return 'No date';
  const due = new Date(`${iso}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffDays = Math.round((due.getTime() - today.getTime()) / 86400000);
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  return due.toLocaleDateString('en-US', { day: '2-digit', month: 'short' });
}

type Tab = 'In Progress' | 'Completed' | 'Bookmarked';

export default function MyLearningView() {
  const [activeTab, setActiveTab] = useState<Tab>('In Progress');
  const [topics, setTopics] = useState<LearningTopic[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [performancePeriod, setPerformancePeriod] = useState<'week' | 'month'>('week');
  const [currentMonth, setCurrentMonth] = useState(() => new Date());
  const [upcomingLessons, setUpcomingLessons] = useState<UpcomingLesson[]>([]);
  const [upcomingLoading, setUpcomingLoading] = useState(true);

  const { theme } = useTheme();
  const { user } = useAuth();
  const navigate = useNavigate();

  const rowBg = theme === 'light' ? 'bg-white border-slate-200' : 'bg-[rgba(17,24,50,0.5)] border-[rgba(56,78,135,0.15)]';
  const cardBg = theme === 'light' ? 'bg-white border-slate-200' : 'bg-[rgba(17,24,50,0.6)] border-[rgba(56,78,135,0.2)]';
  const textColor = theme === 'light' ? 'text-slate-900' : 'text-white';
  const mutedColor = theme === 'light' ? 'text-slate-500' : 'text-gray-500';
  const subTextColor = theme === 'light' ? 'text-slate-600' : 'text-gray-400';

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    setLoading(true);
    setLoadError(null);
    (async () => {
      try {
        await ensureProfile(user);
        const data = await getMyLearningData();
        if (!cancelled) setTopics(data);
      } catch (err) {
        if (!cancelled) setLoadError(err instanceof Error ? err.message : 'Failed to load your learning data.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    setUpcomingLoading(true);
    (async () => {
      try {
        const data = await getUpcomingLessons(currentMonth);
        if (!cancelled) setUpcomingLessons(data);
      } catch {
        if (!cancelled) setUpcomingLessons([]);
      } finally {
        if (!cancelled) setUpcomingLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, currentMonth]);

  const continueLearning = useMemo(
    () =>
      [...topics]
        .filter((t) => !t.completed && t.lastAccessedAt)
        .sort((a, b) => new Date(b.lastAccessedAt as string).getTime() - new Date(a.lastAccessedAt as string).getTime())
        .slice(0, 4),
    [topics],
  );

  const inProgress = useMemo(
    () => [...topics].filter((t) => !t.completed && t.lastAccessedAt).sort((a, b) => new Date(b.lastAccessedAt as string).getTime() - new Date(a.lastAccessedAt as string).getTime()),
    [topics],
  );
  const completedTopics = useMemo(() => topics.filter((t) => t.completed), [topics]);
  const bookmarkedTopics = useMemo(() => topics.filter((t) => t.bookmarked), [topics]);

  const recommendations = useMemo(
    () =>
      [...topics]
        .filter((t) => !t.lastAccessedAt)
        .sort((a, b) => a.lessonOrder - b.lessonOrder)
        .slice(0, 3),
    [topics],
  );

  const activeList = activeTab === 'In Progress' ? inProgress : activeTab === 'Completed' ? completedTopics : bookmarkedTopics;

  const performanceStats = useMemo(() => computePerformanceStats(topics, performancePeriod), [topics, performancePeriod]);
  const streak = useMemo(() => computeStreak(topics), [topics]);

  async function handleToggleBookmark(topic: LearningTopic) {
    if (!user) return;
    const nextBookmarked = !topic.bookmarked;
    setTopics((prev) => prev.map((t) => (t.topicId === topic.topicId ? { ...t, bookmarked: nextBookmarked } : t)));
    try {
      await toggleBookmark(user.id, topic.topicId, nextBookmarked);
    } catch {
      setTopics((prev) => prev.map((t) => (t.topicId === topic.topicId ? { ...t, bookmarked: !nextBookmarked } : t)));
    }
  }

  const goToWorkspace = (subjectCode: string) => navigate(`/workspace/${subjectCode}`);
  const goToSubjects = () => navigate('/subjects');
  const goToPlanner = () => navigate('/study-planner');
  const goToPrevMonth = () => setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  const goToNextMonth = () => setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-0">
        <p className={mutedColor}>Loading your learning data...</p>
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
      {/* Left/Center Column */}
      <div className="flex-1 min-w-0 space-y-4 overflow-y-auto pr-1">

        {/* Continue Learning Row */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-bold text-lg">Continue Learning</h3>
            <button onClick={goToSubjects} className="text-cyan-400 text-xs font-medium hover:text-cyan-300 transition-colors">View all</button>
          </div>
          {continueLearning.length === 0 ? (
            <button onClick={goToSubjects} className={`w-full text-center py-6 rounded-xl border border-dashed ${mutedColor} hover:border-cyan-500/40 hover:text-cyan-400 transition-colors text-sm`}>
              You haven't started a lesson yet. Browse subjects to get going.
            </button>
          ) : (
            <div className="grid grid-cols-4 gap-3">
              {continueLearning.map((topic) => {
                const style = styleFor(topic.subjectCode);
                return (
                  <div key={topic.topicId} className={`border hover:border-cyan-500/30 rounded-xl p-3.5 transition-all flex flex-col justify-between ${cardBg}`}>
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`w-7 h-7 rounded-lg border flex items-center justify-center text-sm font-semibold ${style.iconColor}`}>
                          {style.icon}
                        </span>
                        <div>
                          <p className={`${mutedColor} text-[10px] uppercase font-bold tracking-wider leading-tight`}>{topic.subjectName}</p>
                          <p className={`text-xs font-bold leading-tight line-clamp-1 ${textColor}`}>{topic.topicTitle}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-3.5">
                        <div className={`flex-1 h-1.5 rounded-full overflow-hidden mr-2 ${theme === 'light' ? 'bg-slate-200' : 'bg-[rgba(56,78,135,0.2)]'}`}>
                          <div className={`h-full rounded-full ${style.barColor}`} style={{ width: `${topic.masteryScore}%` }} />
                        </div>
                        <span className={`${subTextColor} text-[10px] font-bold whitespace-nowrap`}>{topic.masteryScore}%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <div className={`flex items-center gap-1 text-[10px] ${mutedColor}`}>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <circle cx="12" cy="12" r="10" />
                          <polyline points="12,6 12,12 16,14" />
                        </svg>
                        {formatRelativeTime(topic.lastAccessedAt)}
                      </div>
                      <button onClick={() => goToWorkspace(topic.subjectCode)} className="w-6 h-6 rounded-full bg-cyan-500 flex items-center justify-center text-white shadow-md shadow-cyan-500/20 hover:scale-105 transition-transform">
                        <svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor">
                          <polygon points="5,3 19,12 5,21" />
                        </svg>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Tab List Section */}
        <div className="glass-card p-5">
          {/* Sub Tabs */}
          <div className="flex items-center gap-4 mb-4 border-b border-[rgba(56,78,135,0.15)] pb-2">
            {(['In Progress', 'Completed', 'Bookmarked'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`text-sm font-semibold pb-1.5 border-b-2 transition-all relative ${
                  activeTab === tab
                    ? 'text-cyan-400 border-cyan-400 font-bold'
                    : 'text-gray-500 border-transparent hover:text-gray-300'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Lessons list */}
          {activeList.length === 0 ? (
            <p className={`text-sm text-center py-6 ${mutedColor}`}>
              {activeTab === 'In Progress' && 'No lessons in progress yet.'}
              {activeTab === 'Completed' && 'No completed lessons yet.'}
              {activeTab === 'Bookmarked' && 'No bookmarks yet — tap the bookmark icon on a lesson to save it here.'}
            </p>
          ) : (
            <div className="space-y-2.5">
              {activeList.map((topic) => {
                const style = styleFor(topic.subjectCode);
                return (
                  <div key={topic.topicId} className={`flex items-center justify-between p-3 rounded-xl border hover:border-cyan-500/30 transition-all ${rowBg}`}>
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className={`w-9 h-9 rounded-lg border flex items-center justify-center text-base font-semibold flex-shrink-0 ${style.iconColor}`}>
                        {style.icon}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className={`text-sm font-semibold leading-tight ${textColor}`}>{topic.topicTitle}</p>
                        <p className={`${mutedColor} text-[11px] leading-tight mt-0.5`}>{topic.subjectName} • {topic.lessonTitle}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      {/* Progress bar */}
                      <div className="flex items-center gap-2 w-44">
                        <div className={`flex-1 h-1.5 rounded-full overflow-hidden ${theme === 'light' ? 'bg-slate-200' : 'bg-[rgba(56,78,135,0.2)]'}`}>
                          <div className={`h-full rounded-full ${style.barColor}`} style={{ width: `${topic.masteryScore}%` }} />
                        </div>
                        <span className={`${subTextColor} text-xs font-semibold w-8 text-right`}>{topic.masteryScore}%</span>
                      </div>

                      {/* Continue Button */}
                      <button onClick={() => goToWorkspace(topic.subjectCode)} className="px-4 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-600 text-xs font-bold hover:bg-cyan-500/20 transition-colors">
                        Continue
                      </button>

                      {/* Bookmark Button */}
                      <button onClick={() => handleToggleBookmark(topic)} className={`${topic.bookmarked ? 'text-cyan-500' : mutedColor} hover:text-cyan-500 transition-colors`}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill={topic.bookmarked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <button onClick={goToSubjects} className={`w-full text-center text-xs font-semibold mt-4 py-1.5 transition-colors ${mutedColor} hover:text-cyan-500`}>
            View All My Learning
          </button>
        </div>

        {/* Recommended for You */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-3.5">
            <div>
              <h3 className="text-white font-bold text-base leading-tight">Recommended for You</h3>
              <p className="text-gray-500 text-xs">Topics you haven't started yet</p>
            </div>
            <button onClick={goToSubjects} className="text-cyan-400 text-xs font-medium hover:text-cyan-300 transition-colors">View all</button>
          </div>
          {recommendations.length === 0 ? (
            <p className="text-gray-500 text-xs text-center py-4">You've started every topic in your curriculum. Great work!</p>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              {recommendations.map((topic) => {
                const style = styleFor(topic.subjectCode);
                return (
                  <div key={topic.topicId} className="flex items-center justify-between p-3 rounded-xl bg-[rgba(17,24,50,0.5)] border border-[rgba(56,78,135,0.15)] hover:border-[rgba(56,78,135,0.3)] transition-all">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{style.icon}</span>
                      <div>
                        <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">Next Up: <span className="text-gray-300 normal-case font-medium">{topic.topicTitle}</span></p>
                        <p className="text-gray-500 text-[10px] mt-0.5">{topic.subjectName} • {topic.lessonTitle}</p>
                      </div>
                    </div>
                    <button onClick={() => goToWorkspace(topic.subjectCode)} className="w-6 h-6 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 hover:bg-cyan-500 hover:text-white transition-colors">
                      <svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor">
                        <polygon points="5,3 19,12 5,21" />
                      </svg>
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

      {/* Right Column */}
      <div className="w-[300px] flex-shrink-0 space-y-4 overflow-y-auto pb-6">
        {/* My Performance */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-bold text-base">My Performance</h3>
            <select
              value={performancePeriod}
              onChange={(e) => setPerformancePeriod(e.target.value as 'week' | 'month')}
              className="bg-[rgba(17,24,50,0.8)] border border-[rgba(56,78,135,0.3)] text-gray-300 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none"
            >
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
          </div>
          <div className="flex items-center gap-4">
            {/* Avg Score Circular progress */}
            <div className="relative w-24 h-24 flex-shrink-0">
              <svg width="96" height="94" className="progress-ring">
                <circle
                  cx="48"
                  cy="47"
                  r="38"
                  stroke="rgba(56, 78, 135, 0.2)"
                  strokeWidth="6"
                  fill="none"
                />
                <circle
                  cx="48"
                  cy="47"
                  r="38"
                  stroke="url(#performance-gradient)"
                  strokeWidth="6"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 38}
                  strokeDashoffset={2 * Math.PI * 38 * (1 - performanceStats.avgMastery / 100)}
                />
                <defs>
                  <linearGradient id="performance-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#22d3ee" />
                    <stop offset="100%" stopColor="#3b82f6" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-white font-extrabold text-lg leading-none">{performanceStats.avgMastery}%</span>
                <span className="text-gray-500 text-[9px] mt-0.5">Avg Score</span>
              </div>
            </div>

            {/* mini stats */}
            <div className="flex-1 space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                  </svg>
                </div>
                <div>
                  <p className="text-gray-500 text-[10px]">Lessons Completed</p>
                  <p className="text-white text-xs font-bold leading-tight">{performanceStats.lessonsCompleted}</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <circle cx="12" cy="12" r="10" />
                    <circle cx="12" cy="12" r="6" />
                    <circle cx="12" cy="12" r="2" />
                  </svg>
                </div>
                <div>
                  <p className="text-gray-500 text-[10px]">Topics Started</p>
                  <p className="text-white text-xs font-bold leading-tight">{performanceStats.topicsStarted}</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                  <span className="text-[10px] font-black leading-none">XP</span>
                </div>
                <div>
                  <p className="text-gray-500 text-[10px]">XP Earned</p>
                  <p className="text-white text-xs font-bold leading-tight">{performanceStats.xp.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Study Streak */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-1.5">
              <span className="text-base">🔥</span>
              <h3 className="text-white font-bold text-base">Study Streak</h3>
            </div>
            <span className="text-orange-400 font-bold text-xs">{streak.currentStreak} {streak.currentStreak === 1 ? 'Day' : 'Days'}</span>
          </div>
          <div className="flex items-center justify-between px-1">
            {streak.days.map((sd) => (
              <div key={sd.date} className="flex flex-col items-center">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                    sd.active
                      ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-md shadow-green-500/20'
                      : 'bg-[rgba(17,24,50,0.5)] border border-[rgba(56,78,135,0.2)] text-gray-500'
                  }`}
                >
                  {sd.active ? (
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20,6 9,17 4,12" />
                    </svg>
                  ) : (
                    sd.label
                  )}
                </div>
              </div>
            ))}
          </div>
          <p className="text-gray-400 text-xs text-center mt-4">
            {streak.currentStreak > 0 ? "You're on fire! Keep it up! 🔥" : 'Study today to start a streak!'}
          </p>
        </div>

        {/* Upcoming Lessons */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-bold text-base">Upcoming Lessons</h3>
            <button onClick={goToPlanner} className="text-cyan-400 text-xs font-medium hover:text-cyan-300 transition-colors">View Calendar</button>
          </div>

          {/* Month navigator */}
          <div className="flex items-center justify-between bg-[rgba(17,24,50,0.4)] border border-[rgba(56,78,135,0.15)] rounded-lg px-3 py-1.5 mb-3">
            <button onClick={goToPrevMonth} className="text-gray-500 hover:text-white transition-colors">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="15,18 9,12 15,6" />
              </svg>
            </button>
            <span className="text-white text-xs font-bold">{currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
            <button onClick={goToNextMonth} className="text-gray-500 hover:text-white transition-colors">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="9,18 15,12 9,6" />
              </svg>
            </button>
          </div>

          {upcomingLoading ? (
            <p className="text-gray-500 text-xs text-center py-4">Loading...</p>
          ) : upcomingLessons.length === 0 ? (
            <p className="text-gray-500 text-xs text-center py-4">No upcoming lessons scheduled this month.</p>
          ) : (
            <div className="space-y-2.5">
              {upcomingLessons.map((lesson) => {
                const style = styleFor(lesson.subjectCode ?? '');
                return (
                  <div key={lesson.id} className="flex items-center justify-between p-2.5 rounded-xl bg-[rgba(17,24,50,0.5)] border border-[rgba(56,78,135,0.15)]">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-lg border flex items-center justify-center text-sm ${style.iconColor}`}>
                        {style.icon}
                      </div>
                      <div>
                        <p className="text-white text-xs font-bold leading-tight">{lesson.title}</p>
                        <p className="text-gray-500 text-[10px] mt-0.5">{lesson.subjectName ?? 'General'}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-cyan-400 text-[10px] font-bold leading-tight">{formatDueLabel(lesson.dueDate)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <button onClick={goToPlanner} className="w-full btn-primary mt-4 py-2 text-white text-xs font-bold rounded-xl">
            Go to Study Planner
          </button>
        </div>

      </div>
    </div>
  );
}
