import { supabase } from '../lib/supabase';

export interface TodayTask {
  id: string;
  title: string;
  dueDate: string | null;
  subjectCode: string | null;
  subjectName: string | null;
  lessonTitle: string | null;
}

function todayISODate(): string {
  return new Date().toISOString().slice(0, 10);
}

/** This user's not-yet-completed study tasks due today. */
export async function getTodayStudyTasks(): Promise<TodayTask[]> {
  const { data, error } = await supabase
    .from('study_tasks')
    .select(
      `
      id, title, due_date, subject,
      lesson:lessons ( title, subject:subjects ( code, name ) )
    `,
    )
    .eq('due_date', todayISODate())
    .eq('completed', false)
    .order('created_at', { ascending: true })
    .returns<
      {
        id: string;
        title: string;
        due_date: string | null;
        subject: string | null;
        lesson: { title: string; subject: { code: string; name: string } | null } | null;
      }[]
    >();

  if (error) throw error;

  return (data ?? []).map((row) => ({
    id: row.id,
    title: row.title,
    dueDate: row.due_date,
    // Lesson-linked tasks get their subject from the curriculum; ad-hoc tasks
    // (created from the Study Planner page without a lesson) fall back to
    // the free-text subject entered there.
    subjectCode: row.lesson?.subject?.code ?? null,
    subjectName: row.lesson?.subject?.name ?? row.subject ?? null,
    lessonTitle: row.lesson?.title ?? null,
  }));
}

/** Whether this user has started an AI tutor conversation today - backs the "Ask the AI tutor" daily mission. */
export async function hasConversationToday(userId: string): Promise<boolean> {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const { count, error } = await supabase
    .from('conversations')
    .select('id', { count: 'exact', head: true })
    .eq('profile_id', userId)
    .gte('created_at', startOfToday.toISOString());

  if (error) throw error;
  return (count ?? 0) > 0;
}
