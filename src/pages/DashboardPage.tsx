import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  ensureProfile,
  getMyLearningData,
  computeStreak,
  computeLongestStreak,
  XP_PER_COMPLETED_TOPIC,
  type LearningTopic,
} from '../services/learning.service';
import { getAchievementContext, syncEarnedBadges, getEarnedAchievements, getRank, type EarnedAchievement } from '../services/achievements.service';
import { getTodayStudyTasks, hasConversationToday, type TodayTask } from '../services/dashboard.service';
import Spinner from '../components/common/Spinner';
import StatsCards from '../components/StatsCards';
import ContinueLearning from '../components/ContinueLearning';
import TodaysMission from '../components/TodaysMission';
import AITutor from '../components/AITutor';
import SubjectProgress from '../components/SubjectProgress';
import UpcomingQuiz from '../components/UpcomingQuiz';
import StudyPlanner from '../components/StudyPlanner';
import LearningJourney from '../components/LearningJourney';
import RecentAchievements from '../components/RecentAchievements';

export default function DashboardPage() {
  const { user } = useAuth();
  const [topics, setTopics] = useState<LearningTopic[]>([]);
  const [achievements, setAchievements] = useState<EarnedAchievement[]>([]);
  const [rank, setRank] = useState<number | null>(null);
  const [todayTasks, setTodayTasks] = useState<TodayTask[]>([]);
  const [askedAiToday, setAskedAiToday] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

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
        await syncEarnedBadges(user.id, ctx);

        const [fetchedAchievements, fetchedRank, fetchedTasks, fetchedAskedAi] = await Promise.all([
          getEarnedAchievements(user.id),
          getRank(),
          getTodayStudyTasks(),
          hasConversationToday(user.id),
        ]);

        if (!cancelled) {
          setTopics(fetchedTopics);
          setAchievements(fetchedAchievements);
          setRank(fetchedRank);
          setTodayTasks(fetchedTasks);
          setAskedAiToday(fetchedAskedAi);
        }
      } catch (err) {
        if (!cancelled) setLoadError(err instanceof Error ? err.message : 'Failed to load your dashboard.');
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
  const xp = useMemo(() => topics.filter((t) => t.completed).length * XP_PER_COMPLETED_TOPIC, [topics]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-0">
        <Spinner size="md" label="Loading your dashboard..." />
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
        <StatsCards currentStreak={streak.currentStreak} longestStreak={longestStreak} xp={xp} rank={rank} />
        <div className="grid grid-cols-5 gap-4">
          <div className="col-span-3">
            <ContinueLearning topics={topics} />
          </div>
          <div className="col-span-2">
            <TodaysMission topics={topics} askedAiToday={askedAiToday} />
          </div>
        </div>
        <SubjectProgress topics={topics} />
        <div className="grid grid-cols-5 gap-4 pb-6">
          <div className="col-span-2">
            <StudyPlanner tasks={todayTasks} />
          </div>
          <div className="col-span-3">
            <LearningJourney topics={topics} />
          </div>
        </div>
      </div>

      {/* Right Column */}
      <div className="w-[300px] flex-shrink-0 space-y-4 overflow-y-auto pb-6">
        <AITutor topics={topics} />
        <UpcomingQuiz topics={topics} />
        <RecentAchievements achievements={achievements} />
      </div>
    </div>
  );
}
