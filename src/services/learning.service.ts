import type { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

export interface LearningTopic {
  topicId: string;
  topicSlug: string;
  topicTitle: string;
  lessonId: string;
  lessonSlug: string;
  lessonTitle: string;
  lessonOrder: number;
  subjectId: string;
  subjectCode: string;
  subjectName: string;
  completed: boolean;
  masteryScore: number;
  lastAccessedAt: string | null;
  bookmarked: boolean;
}

export interface UpcomingLesson {
  id: string;
  title: string;
  dueDate: string | null;
  subjectCode: string | null;
  subjectName: string | null;
  lessonTitle: string | null;
}

export interface StreakDay {
  label: string;
  date: string;
  active: boolean;
}

export interface StreakInfo {
  days: StreakDay[];
  currentStreak: number;
}

export interface PerformanceStats {
  avgMastery: number;
  lessonsCompleted: number;
  topicsStarted: number;
  xp: number;
}

export interface SubjectSummary {
  code: string;
  name: string;
  completedCount: number;
  totalCount: number;
  progress: number;
  lastAccessedAt: string | null;
}

/** Ensures a profiles row exists for this user without clobbering existing fields. */
export async function ensureProfile(user: User): Promise<void> {
  const { error } = await supabase.from('profiles').upsert(
    {
      id: user.id,
      full_name: (user.user_metadata?.full_name as string | undefined) ?? user.email?.split('@')[0] ?? 'Learner',
      email: user.email,
    },
    { onConflict: 'id', ignoreDuplicates: true },
  );
  if (error) throw error;
}

interface RawTopicRow {
  id: string;
  slug: string | null;
  title: string;
  lesson: {
    id: string;
    slug: string | null;
    title: string;
    lesson_order: number | null;
    subject: { id: string; code: string; name: string } | null;
  } | null;
  progress: { completed: boolean; mastery_score: number | string; last_accessed_at: string | null }[];
  bookmarks: { id: string }[];
}

/** All curriculum topics joined with this user's own progress/bookmark rows (RLS scopes those automatically). */
export async function getMyLearningData(): Promise<LearningTopic[]> {
  const { data, error } = await supabase
    .from('topics')
    .select(
      `
      id, slug, title,
      lesson:lessons (
        id, slug, title, lesson_order,
        subject:subjects ( id, code, name )
      ),
      progress ( completed, mastery_score, last_accessed_at ),
      bookmarks ( id )
    `,
    )
    .returns<RawTopicRow[]>();

  if (error) throw error;

  return (data ?? [])
    .filter((row): row is RawTopicRow & { lesson: NonNullable<RawTopicRow['lesson']> } => Boolean(row.lesson?.subject))
    .map((row) => {
      const progressRow = row.progress[0];
      return {
        topicId: row.id,
        topicSlug: row.slug ?? row.id,
        topicTitle: row.title,
        lessonId: row.lesson.id,
        lessonSlug: row.lesson.slug ?? row.lesson.id,
        lessonTitle: row.lesson.title,
        lessonOrder: row.lesson.lesson_order ?? 0,
        subjectId: row.lesson.subject!.id,
        subjectCode: row.lesson.subject!.code,
        subjectName: row.lesson.subject!.name,
        completed: progressRow?.completed ?? false,
        masteryScore: Number(progressRow?.mastery_score ?? 0),
        lastAccessedAt: progressRow?.last_accessed_at ?? null,
        bookmarked: row.bookmarks.length > 0,
      };
    })
    .sort((a, b) => a.subjectName.localeCompare(b.subjectName) || a.lessonOrder - b.lessonOrder);
}

/** Not-yet-completed study tasks due in the given month, from the user's own study plans. */
export async function getUpcomingLessons(monthDate: Date): Promise<UpcomingLesson[]> {
  const start = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
  const end = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);
  const toISODate = (d: Date) => d.toISOString().slice(0, 10);

  const { data, error } = await supabase
    .from('study_tasks')
    .select(
      `
      id, title, due_date,
      lesson:lessons ( title, subject:subjects ( code, name ) )
    `,
    )
    .eq('completed', false)
    .gte('due_date', toISODate(start))
    .lte('due_date', toISODate(end))
    .order('due_date', { ascending: true })
    .returns<
      { id: string; title: string; due_date: string | null; lesson: { title: string; subject: { code: string; name: string } | null } | null }[]
    >();

  if (error) throw error;

  return (data ?? []).map((row) => ({
    id: row.id,
    title: row.title,
    dueDate: row.due_date,
    subjectCode: row.lesson?.subject?.code ?? null,
    subjectName: row.lesson?.subject?.name ?? null,
    lessonTitle: row.lesson?.title ?? null,
  }));
}

const topicIdBySlug = new Map<string, string>();

/** Resolves a workspace curriculum slug (e.g. "linear-equations-topic-1") to its real topics.id UUID. */
export async function resolveTopicId(topicSlug: string): Promise<string | null> {
  const cached = topicIdBySlug.get(topicSlug);
  if (cached) return cached;

  const { data, error } = await supabase.from('topics').select('id').eq('slug', topicSlug).maybeSingle();
  if (error || !data) return null;

  topicIdBySlug.set(topicSlug, data.id);
  return data.id;
}

export async function toggleBookmark(userId: string, topicId: string, shouldBookmark: boolean): Promise<void> {
  if (shouldBookmark) {
    const { error } = await supabase
      .from('bookmarks')
      .upsert({ profile_id: userId, topic_id: topicId }, { onConflict: 'profile_id,topic_id' });
    if (error) throw error;
  } else {
    const { error } = await supabase.from('bookmarks').delete().eq('profile_id', userId).eq('topic_id', topicId);
    if (error) throw error;
  }
}

/** Marks a topic as opened, creating its progress row if this is the first visit. */
export async function touchTopicAccess(userId: string, topicId: string): Promise<void> {
  const { error } = await supabase
    .from('progress')
    .upsert(
      { profile_id: userId, topic_id: topicId, last_accessed_at: new Date().toISOString() },
      { onConflict: 'profile_id,topic_id' },
    );
  if (error) throw error;
}

/** Bumps a topic's mastery score (capped at 100) and flips completed once it hits 100. */
export async function recordTopicProgress(userId: string, topicId: string, delta: number): Promise<number> {
  const { data: existing, error: fetchError } = await supabase
    .from('progress')
    .select('mastery_score')
    .eq('profile_id', userId)
    .eq('topic_id', topicId)
    .maybeSingle();
  if (fetchError) throw fetchError;

  const nextScore = Math.min(100, Number(existing?.mastery_score ?? 0) + delta);

  const { error } = await supabase.from('progress').upsert(
    {
      profile_id: userId,
      topic_id: topicId,
      mastery_score: nextScore,
      completed: nextScore >= 100,
      last_accessed_at: new Date().toISOString(),
    },
    { onConflict: 'profile_id,topic_id' },
  );
  if (error) throw error;

  return nextScore;
}

/** Trailing 7 days of activity plus the current consecutive-day streak. */
export function computeStreak(topics: LearningTopic[]): StreakInfo {
  const activeDates = new Set(
    topics.filter((t) => t.lastAccessedAt).map((t) => new Date(t.lastAccessedAt as string).toISOString().slice(0, 10)),
  );

  const today = new Date();
  const days: StreakDay[] = Array.from({ length: 7 }, (_, indexFromPast) => {
    const offset = 6 - indexFromPast;
    const d = new Date(today);
    d.setDate(d.getDate() - offset);
    const iso = d.toISOString().slice(0, 10);
    return { label: d.toLocaleDateString('en-US', { weekday: 'narrow' }), date: iso, active: activeDates.has(iso) };
  });

  let currentStreak = 0;
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    if (!activeDates.has(d.toISOString().slice(0, 10))) break;
    currentStreak++;
  }

  return { days, currentStreak };
}

/** One summary row per distinct subject in the curriculum, including subjects with zero progress. */
export function aggregateSubjects(topics: LearningTopic[]): SubjectSummary[] {
  const bySubject = new Map<string, { name: string; completed: number; total: number; lastAccessedAt: string | null }>();

  for (const topic of topics) {
    const entry = bySubject.get(topic.subjectCode) ?? { name: topic.subjectName, completed: 0, total: 0, lastAccessedAt: null };
    entry.total += 1;
    if (topic.completed) entry.completed += 1;
    if (topic.lastAccessedAt && (!entry.lastAccessedAt || topic.lastAccessedAt > entry.lastAccessedAt)) {
      entry.lastAccessedAt = topic.lastAccessedAt;
    }
    bySubject.set(topic.subjectCode, entry);
  }

  return Array.from(bySubject.entries())
    .map(([code, entry]) => ({
      code,
      name: entry.name,
      completedCount: entry.completed,
      totalCount: entry.total,
      progress: entry.total ? Math.round((entry.completed / entry.total) * 100) : 0,
      lastAccessedAt: entry.lastAccessedAt,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

/** Longest-ever consecutive-day streak, scanning every distinct active date (not just the trailing week). */
export function computeLongestStreak(topics: LearningTopic[]): number {
  const activeDates = Array.from(
    new Set(topics.filter((t) => t.lastAccessedAt).map((t) => new Date(t.lastAccessedAt as string).toISOString().slice(0, 10))),
  ).sort();

  if (activeDates.length === 0) return 0;

  let longest = 1;
  let current = 1;
  for (let i = 1; i < activeDates.length; i++) {
    const diffDays = Math.round((new Date(activeDates[i]).getTime() - new Date(activeDates[i - 1]).getTime()) / 86400000);
    current = diffDays === 1 ? current + 1 : 1;
    longest = Math.max(longest, current);
  }
  return longest;
}

const XP_PER_COMPLETED_TOPIC = 50;

/** Aggregate stats over the trailing week/month, derived entirely from real progress rows. */
export function computePerformanceStats(topics: LearningTopic[], period: 'week' | 'month'): PerformanceStats {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - (period === 'week' ? 7 : 30));

  const touched = topics.filter((t) => t.lastAccessedAt && new Date(t.lastAccessedAt) >= cutoff);
  const completed = touched.filter((t) => t.completed);
  const avgMastery = touched.length
    ? Math.round(touched.reduce((sum, t) => sum + t.masteryScore, 0) / touched.length)
    : 0;

  return {
    avgMastery,
    lessonsCompleted: completed.length,
    topicsStarted: touched.length,
    xp: completed.length * XP_PER_COMPLETED_TOPIC,
  };
}
