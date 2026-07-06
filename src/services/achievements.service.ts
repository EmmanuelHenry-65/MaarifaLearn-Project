import { supabase } from '../lib/supabase';
import type { LearningTopic } from './learning.service';
import { createNotification } from './notifications.service';

export interface AchievementContext {
  completedCount: number;
  totalTopicsCount: number;
  subjectsTouchedCount: number;
  totalSubjectsCount: number;
  currentStreak: number;
  longestStreak: number;
  xp: number;
  bestSubjectCompletionPercent: number;
}

export interface BadgeDefinition {
  key: string;
  name: string;
  desc: string;
  image?: string;
  icon?: string;
  glowColor: string;
  ctaRoute: string;
  ctaLabel: string;
  check: (ctx: AchievementContext) => boolean;
  progressPercent: (ctx: AchievementContext) => number;
  progressLabel: (ctx: AchievementContext) => string;
}

export interface MilestoneDefinition {
  key: string;
  name: string;
  icon: string;
  iconBg: string;
  color: string;
  current: (ctx: AchievementContext) => number;
  total: (ctx: AchievementContext) => number;
}

export interface EarnedAchievement {
  title: string;
  description: string | null;
  badge: string | null;
  earnedAt: string;
}

/** Builds the deterministic context every badge/milestone rule checks against, from real progress data. */
export function getAchievementContext(topics: LearningTopic[], currentStreak: number, longestStreak: number): AchievementContext {
  const completedCount = topics.filter((t) => t.completed).length;
  const touchedSubjectCodes = new Set(topics.filter((t) => t.lastAccessedAt).map((t) => t.subjectCode));
  const allSubjectCodes = new Set(topics.map((t) => t.subjectCode));

  const bySubject = new Map<string, { completed: number; total: number }>();
  for (const t of topics) {
    const entry = bySubject.get(t.subjectCode) ?? { completed: 0, total: 0 };
    entry.total += 1;
    if (t.completed) entry.completed += 1;
    bySubject.set(t.subjectCode, entry);
  }

  let bestSubjectCompletionPercent = 0;
  for (const { completed, total } of bySubject.values()) {
    if (total > 0) bestSubjectCompletionPercent = Math.max(bestSubjectCompletionPercent, Math.round((completed / total) * 100));
  }

  return {
    completedCount,
    totalTopicsCount: topics.length,
    subjectsTouchedCount: touchedSubjectCodes.size,
    totalSubjectsCount: allSubjectCodes.size,
    currentStreak,
    longestStreak,
    xp: completedCount * 50,
    bestSubjectCompletionPercent,
  };
}

const clampPercent = (value: number) => Math.max(0, Math.min(100, value));

export const BADGE_DEFINITIONS: BadgeDefinition[] = [
  {
    key: 'first-steps',
    name: 'First Steps',
    desc: 'Complete your first topic',
    image: '/images/badge-first-steps.png',
    glowColor: 'shadow-purple-500/40',
    ctaRoute: '/my-learning',
    ctaLabel: 'Start a topic',
    check: (ctx) => ctx.completedCount >= 1,
    progressPercent: (ctx) => clampPercent(ctx.completedCount * 100),
    progressLabel: (ctx) => `${Math.min(ctx.completedCount, 1)} / 1`,
  },
  {
    key: 'consistent-learner',
    name: 'Consistent Learner',
    desc: 'Study for 7 days in a row',
    image: '/images/badge-consistent-learner.png',
    glowColor: 'shadow-green-500/40',
    ctaRoute: '/my-learning',
    ctaLabel: 'Keep your streak going',
    check: (ctx) => ctx.longestStreak >= 7,
    progressPercent: (ctx) => clampPercent(Math.round((ctx.longestStreak / 7) * 100)),
    progressLabel: (ctx) => `${Math.min(ctx.longestStreak, 7)} / 7 days`,
  },
  {
    key: 'subject-explorer',
    name: 'Subject Explorer',
    desc: 'Study topics in 3 or more different subjects',
    icon: '🧭',
    glowColor: 'shadow-teal-500/40',
    ctaRoute: '/subjects',
    ctaLabel: 'Explore subjects',
    check: (ctx) => ctx.subjectsTouchedCount >= 3,
    progressPercent: (ctx) => clampPercent(Math.round((ctx.subjectsTouchedCount / 3) * 100)),
    progressLabel: (ctx) => `${Math.min(ctx.subjectsTouchedCount, 3)} / 3 subjects`,
  },
  {
    key: 'top-performer',
    name: 'Top Performer',
    desc: 'Complete 10 topics',
    image: '/images/badge-top-performer.png',
    glowColor: 'shadow-yellow-500/40',
    ctaRoute: '/my-learning',
    ctaLabel: 'Continue learning',
    check: (ctx) => ctx.completedCount >= 10,
    progressPercent: (ctx) => clampPercent(Math.round((ctx.completedCount / 10) * 100)),
    progressLabel: (ctx) => `${Math.min(ctx.completedCount, 10)} / 10 topics`,
  },
  {
    key: 'knowledge-seeker',
    name: 'Knowledge Seeker',
    desc: 'Complete 25 topics',
    image: '/images/badge-knowledge-seeker.png',
    glowColor: 'shadow-purple-500/40',
    ctaRoute: '/my-learning',
    ctaLabel: 'Continue learning',
    check: (ctx) => ctx.completedCount >= 25,
    progressPercent: (ctx) => clampPercent(Math.round((ctx.completedCount / 25) * 100)),
    progressLabel: (ctx) => `${Math.min(ctx.completedCount, 25)} / 25 topics`,
  },
  {
    key: 'exam-ready',
    name: 'Exam Ready',
    desc: 'Fully complete every topic in at least one subject',
    icon: '🛡️',
    glowColor: 'shadow-blue-500/40',
    ctaRoute: '/subjects',
    ctaLabel: 'Finish a subject',
    check: (ctx) => ctx.bestSubjectCompletionPercent >= 100,
    progressPercent: (ctx) => clampPercent(ctx.bestSubjectCompletionPercent),
    progressLabel: (ctx) => `${ctx.bestSubjectCompletionPercent}% of your furthest subject`,
  },
];

export const MILESTONE_DEFINITIONS: MilestoneDefinition[] = [
  {
    key: 'topics-completed',
    name: 'Topics Completed',
    icon: '🎯',
    iconBg: 'bg-green-500/15 border-green-500/30 text-green-400',
    color: 'bg-green-500',
    current: (ctx) => ctx.completedCount,
    total: (ctx) => ctx.totalTopicsCount,
  },
  {
    key: 'subjects-explored',
    name: 'Subjects Explored',
    icon: '🧭',
    iconBg: 'bg-teal-500/15 border-teal-500/30 text-teal-400',
    color: 'bg-teal-500',
    current: (ctx) => ctx.subjectsTouchedCount,
    total: (ctx) => ctx.totalSubjectsCount,
  },
  {
    key: 'study-streak',
    name: 'Study Streak',
    icon: '⏱️',
    iconBg: 'bg-purple-500/15 border-purple-500/30 text-purple-400',
    color: 'bg-purple-500',
    current: (ctx) => ctx.currentStreak,
    total: () => 30,
  },
  {
    key: 'xp-goal',
    name: 'XP Goal',
    icon: '⭐',
    iconBg: 'bg-cyan-500/15 border-cyan-500/30 text-cyan-400',
    color: 'bg-cyan-500',
    current: (ctx) => ctx.xp,
    total: () => 1000,
  },
];

/** Awards any badge whose conditions are newly met. Safe to call every page load - already-earned badges are no-ops. */
export async function syncEarnedBadges(userId: string, ctx: AchievementContext): Promise<void> {
  const eligible = BADGE_DEFINITIONS.filter((badge) => badge.check(ctx));
  if (eligible.length === 0) return;

  const { data: existing, error: fetchError } = await supabase
    .from('achievements')
    .select('title')
    .eq('profile_id', userId)
    .in('title', eligible.map((badge) => badge.name))
    .returns<{ title: string }[]>();
  if (fetchError) throw fetchError;

  const existingTitles = new Set((existing ?? []).map((row) => row.title));
  const newlyEarned = eligible.filter((badge) => !existingTitles.has(badge.name));
  if (newlyEarned.length === 0) return;

  const rows = newlyEarned.map((badge) => ({
    profile_id: userId,
    title: badge.name,
    description: badge.desc,
    badge: badge.key,
  }));

  const { error } = await supabase
    .from('achievements')
    .upsert(rows, { onConflict: 'profile_id,title', ignoreDuplicates: true });
  if (error) throw error;

  await Promise.all(
    newlyEarned.map((badge) =>
      createNotification(userId, `New badge earned: ${badge.name}`, badge.desc, 'achievement').catch(() => {}),
    ),
  );
}

export async function getEarnedAchievements(userId: string): Promise<EarnedAchievement[]> {
  const { data, error } = await supabase
    .from('achievements')
    .select('title, description, badge, earned_at')
    .eq('profile_id', userId)
    .order('earned_at', { ascending: false })
    .returns<{ title: string; description: string | null; badge: string | null; earned_at: string }[]>();
  if (error) throw error;

  return (data ?? []).map((row) => ({
    title: row.title,
    description: row.description,
    badge: row.badge,
    earnedAt: row.earned_at,
  }));
}

/** Real leaderboard rank by total XP, computed server-side so no client role can read other users' progress. */
export async function getRank(): Promise<number | null> {
  const { data, error } = await supabase.rpc('get_my_rank');
  if (error) throw error;
  return (data as number | null) ?? null;
}
