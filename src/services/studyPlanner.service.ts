// Data access + pure computation for the Study Planner. Components fetch a
// window of tasks once and derive the weekly overview, streak, goals, and
// deadlines from it client-side (see the compute* functions below) rather
// than issuing a separate round trip for every widget.
import { supabase } from '../lib/supabase';

export type TaskType = 'lesson' | 'practice' | 'task' | 'past_paper' | 'revision';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface StudyTask {
  id: string;
  studyPlanId: string;
  title: string;
  subject: string | null;
  taskType: TaskType;
  dueDate: string | null; // ISO date (YYYY-MM-DD)
  startTime: string | null; // HH:MM
  endTime: string | null; // HH:MM
  priority: TaskPriority;
  completed: boolean;
}

interface StudyTaskRow {
  id: string;
  study_plan_id: string;
  title: string;
  subject: string | null;
  task_type: string | null;
  due_date: string | null;
  start_time: string | null;
  end_time: string | null;
  priority: string;
  completed: boolean;
}

function mapTaskRow(row: StudyTaskRow): StudyTask {
  return {
    id: row.id,
    studyPlanId: row.study_plan_id,
    title: row.title,
    subject: row.subject,
    taskType: (row.task_type as TaskType) ?? 'task',
    dueDate: row.due_date,
    startTime: row.start_time?.slice(0, 5) ?? null,
    endTime: row.end_time?.slice(0, 5) ?? null,
    priority: (row.priority as TaskPriority) ?? 'medium',
    completed: row.completed,
  };
}

export class StudyPlannerError extends Error {}

const TASK_COLUMNS = 'id, study_plan_id, title, subject, task_type, due_date, start_time, end_time, priority, completed';

/** Every user gets one implicit study plan — the UI has no concept of multiple plans. */
export async function getOrCreateDefaultPlan(userId: string): Promise<string> {
  const { data: existing, error: selectError } = await supabase
    .from('study_plans')
    .select('id')
    .eq('profile_id', userId)
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle<{ id: string }>();

  if (selectError) throw new StudyPlannerError('Could not load your study plan.');
  if (existing) return existing.id;

  const { data: created, error: insertError } = await supabase
    .from('study_plans')
    .insert({ profile_id: userId, title: 'My Study Plan' })
    .select('id')
    .single<{ id: string }>();

  if (insertError) throw new StudyPlannerError('Could not create your study plan.');
  return created.id;
}

/** Fetches every task with a due date inside [startDate, endDate] (inclusive, ISO dates). */
export async function getTasksInRange(planId: string, startDate: string, endDate: string): Promise<StudyTask[]> {
  const { data, error } = await supabase
    .from('study_tasks')
    .select(TASK_COLUMNS)
    .eq('study_plan_id', planId)
    .gte('due_date', startDate)
    .lte('due_date', endDate)
    .order('due_date', { ascending: true })
    .order('start_time', { ascending: true, nullsFirst: false })
    .returns<StudyTaskRow[]>();

  if (error) throw new StudyPlannerError('Could not load your study tasks.');
  return (data ?? []).map(mapTaskRow);
}

export interface TaskInput {
  title: string;
  subject: string | null;
  taskType: TaskType;
  dueDate: string;
  startTime: string | null;
  endTime: string | null;
  priority: TaskPriority;
}

export async function createTask(planId: string, input: TaskInput): Promise<StudyTask> {
  const { data, error } = await supabase
    .from('study_tasks')
    .insert({
      study_plan_id: planId,
      title: input.title.trim(),
      subject: input.subject,
      task_type: input.taskType,
      due_date: input.dueDate,
      start_time: input.startTime,
      end_time: input.endTime,
      priority: input.priority,
    })
    .select(TASK_COLUMNS)
    .single<StudyTaskRow>();

  if (error) throw new StudyPlannerError('Could not create the task.');
  return mapTaskRow(data);
}

export async function updateTask(taskId: string, patch: Partial<TaskInput & { completed: boolean }>): Promise<StudyTask> {
  const payload: Record<string, unknown> = {};
  if (patch.title !== undefined) payload.title = patch.title.trim();
  if (patch.subject !== undefined) payload.subject = patch.subject;
  if (patch.taskType !== undefined) payload.task_type = patch.taskType;
  if (patch.dueDate !== undefined) payload.due_date = patch.dueDate;
  if (patch.startTime !== undefined) payload.start_time = patch.startTime;
  if (patch.endTime !== undefined) payload.end_time = patch.endTime;
  if (patch.priority !== undefined) payload.priority = patch.priority;
  if (patch.completed !== undefined) payload.completed = patch.completed;

  const { data, error } = await supabase
    .from('study_tasks')
    .update(payload)
    .eq('id', taskId)
    .select(TASK_COLUMNS)
    .single<StudyTaskRow>();

  if (error) throw new StudyPlannerError('Could not update the task.');
  return mapTaskRow(data);
}

export async function deleteTask(taskId: string): Promise<void> {
  const { error } = await supabase.from('study_tasks').delete().eq('id', taskId);
  if (error) throw new StudyPlannerError('Could not delete the task.');
}

// ---------------------------------------------------------------------------
// Pure computation — no Supabase calls below this line, easy to unit test.
// ---------------------------------------------------------------------------

// Local calendar date, NOT toISOString() — that converts to UTC first, which
// silently shifts the date by a day in any timezone ahead of UTC (e.g. Kenya,
// UTC+3) for a chunk of every day.
export const toISODate = (d: Date): string => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export function startOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay(); // 0 = Sunday
  const diff = day === 0 ? -6 : 1 - day; // shift back to Monday
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export interface DaySummary {
  date: string;
  label: string;
  dayNumber: string;
  totalTasks: number;
  completedTasks: number;
  isToday: boolean;
}

/** One entry per day of the Mon-Sun week containing weekStart. */
export function computeWeekSummary(tasks: StudyTask[], weekStart: Date): DaySummary[] {
  const todayISO = toISODate(new Date());
  const byDate = new Map<string, StudyTask[]>();
  for (const task of tasks) {
    if (!task.dueDate) continue;
    const list = byDate.get(task.dueDate) ?? [];
    list.push(task);
    byDate.set(task.dueDate, list);
  }

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    const iso = toISODate(d);
    const dayTasks = byDate.get(iso) ?? [];
    return {
      date: iso,
      label: d.toLocaleDateString('en-US', { weekday: 'short' }),
      dayNumber: d.toLocaleDateString('en-US', { day: '2-digit', month: 'short' }),
      totalTasks: dayTasks.length,
      completedTasks: dayTasks.filter((t) => t.completed).length,
      isToday: iso === todayISO,
    };
  });
}

/** Consecutive days (walking back from today) where every task due that day was completed. */
export function computeStreak(tasks: StudyTask[]): number {
  const byDate = new Map<string, StudyTask[]>();
  for (const task of tasks) {
    if (!task.dueDate) continue;
    const list = byDate.get(task.dueDate) ?? [];
    list.push(task);
    byDate.set(task.dueDate, list);
  }

  let streak = 0;
  const cursor = new Date();
  for (let i = 0; i < 365; i++) {
    const iso = toISODate(cursor);
    const dayTasks = byDate.get(iso);
    if (!dayTasks || dayTasks.length === 0) {
      // A day with nothing planned doesn't break the streak on today itself
      // (it just hasn't started yet), but does for every earlier day.
      if (i === 0) {
        cursor.setDate(cursor.getDate() - 1);
        continue;
      }
      break;
    }
    if (!dayTasks.every((t) => t.completed)) break;
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export type TaskStatus = 'completed' | 'in_progress' | 'upcoming' | 'overdue';

/** Status is derived, not stored — "in progress"/"overdue" only make sense relative to the current moment. */
export function getTaskStatus(task: StudyTask, now: Date = new Date()): TaskStatus {
  if (task.completed) return 'completed';
  if (!task.dueDate) return 'upcoming';

  const todayISO = toISODate(now);
  if (task.dueDate > todayISO) return 'upcoming';
  if (task.dueDate < todayISO) return 'overdue';

  // Due today: compare against the time window when one is set.
  if (task.startTime && task.endTime) {
    const nowMinutes = now.getHours() * 60 + now.getMinutes();
    const [startH, startM] = task.startTime.split(':').map(Number);
    const [endH, endM] = task.endTime.split(':').map(Number);
    const startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;
    if (nowMinutes < startMinutes) return 'upcoming';
    if (nowMinutes > endMinutes) return 'overdue';
    return 'in_progress';
  }
  return 'upcoming';
}

export interface GoalsSummary {
  tasksCompleted: number;
  tasksTotal: number;
  hoursStudied: number;
  pastPapersAttempted: number;
}

/** Rolls the current week's tasks up into the stats shown in the "Study Goals" card. */
export function computeGoalsSummary(weekTasks: StudyTask[]): GoalsSummary {
  let hoursStudied = 0;
  let pastPapersAttempted = 0;

  for (const task of weekTasks) {
    if (!task.completed) continue;
    if (task.taskType === 'past_paper') pastPapersAttempted++;
    if (task.startTime && task.endTime) {
      const [startH, startM] = task.startTime.split(':').map(Number);
      const [endH, endM] = task.endTime.split(':').map(Number);
      hoursStudied += Math.max(0, (endH * 60 + endM - (startH * 60 + startM)) / 60);
    }
  }

  return {
    tasksCompleted: weekTasks.filter((t) => t.completed).length,
    tasksTotal: weekTasks.length,
    hoursStudied: Math.round(hoursStudied * 10) / 10,
    pastPapersAttempted,
  };
}

/** Next few incomplete tasks due strictly after today, soonest first. */
export function getUpcomingDeadlines(tasks: StudyTask[], limit = 3): StudyTask[] {
  const todayISO = toISODate(new Date());
  return tasks
    .filter((t) => !t.completed && t.dueDate && t.dueDate > todayISO)
    .sort((a, b) => (a.dueDate ?? '').localeCompare(b.dueDate ?? ''))
    .slice(0, limit);
}
