import { useEffect, useMemo, useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import {
  getOrCreateDefaultPlan,
  getTasksInRange,
  createTask,
  updateTask,
  deleteTask,
  startOfWeek,
  toISODate,
  computeWeekSummary,
  computeStreak,
  computeGoalsSummary,
  getUpcomingDeadlines,
  StudyPlannerError,
  type StudyTask,
  type TaskInput,
} from '../services/studyPlanner.service';
import TaskItem from '../components/studyPlanner/TaskItem';
import TaskModal from '../components/studyPlanner/TaskModal';

const FETCH_PAST_DAYS = 60;
const FETCH_FUTURE_DAYS = 90;

const addDays = (d: Date, days: number) => {
  const copy = new Date(d);
  copy.setDate(copy.getDate() + days);
  return copy;
};

export default function StudyPlannerView() {
  const { theme } = useTheme();
  const { user } = useAuth();

  const [planId, setPlanId] = useState<string | null>(null);
  const [tasks, setTasks] = useState<StudyTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()));
  const [selectedDate, setSelectedDate] = useState(() => toISODate(new Date()));
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<StudyTask | null>(null);

  const textColor = theme === 'light' ? 'text-slate-900' : 'text-white';
  const mutedColor = theme === 'light' ? 'text-slate-500' : 'text-gray-500';
  const progressBarBg = theme === 'light' ? 'bg-slate-200' : 'bg-[rgba(56,78,135,0.25)]';

  // Loads the user's own study plan (creating one on first visit) and a wide
  // window of tasks around today, so the weekly view, streak, and deadlines
  // can all be derived from a single fetch.
  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    setLoading(true);
    setError(null);
    getOrCreateDefaultPlan(user.id)
      .then(async (id) => {
        if (cancelled) return;
        setPlanId(id);
        const today = new Date();
        const rangeStart = toISODate(addDays(today, -FETCH_PAST_DAYS));
        const rangeEnd = toISODate(addDays(today, FETCH_FUTURE_DAYS));
        const data = await getTasksInRange(id, rangeStart, rangeEnd);
        if (!cancelled) setTasks(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Could not load your study planner.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const weekSummary = useMemo(() => computeWeekSummary(tasks, weekStart), [tasks, weekStart]);
  const streak = useMemo(() => computeStreak(tasks), [tasks]);
  const weekTasksTotal = weekSummary.reduce((sum, d) => sum + d.totalTasks, 0);
  const weekTasksCompleted = weekSummary.reduce((sum, d) => sum + d.completedTasks, 0);
  const weekProgressPct = weekTasksTotal ? Math.round((weekTasksCompleted / weekTasksTotal) * 100) : 0;

  const weekTasksForGoals = useMemo(() => {
    const weekEnd = toISODate(addDays(weekStart, 6));
    const weekStartISO = toISODate(weekStart);
    return tasks.filter((t) => t.dueDate && t.dueDate >= weekStartISO && t.dueDate <= weekEnd);
  }, [tasks, weekStart]);
  const goals = useMemo(() => computeGoalsSummary(weekTasksForGoals), [weekTasksForGoals]);
  const deadlines = useMemo(() => getUpcomingDeadlines(tasks), [tasks]);

  const selectedDateTasks = useMemo(
    () => tasks.filter((t) => t.dueDate === selectedDate).sort((a, b) => (a.startTime ?? '99:99').localeCompare(b.startTime ?? '99:99')),
    [tasks, selectedDate],
  );
  const selectedDateLabel = useMemo(
    () => new Date(`${selectedDate}T00:00:00`).toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
    [selectedDate],
  );

  function openAddModal() {
    setEditingTask(null);
    setModalOpen(true);
  }

  function openEditModal(task: StudyTask) {
    setEditingTask(task);
    setModalOpen(true);
  }

  async function handleSaveTask(input: TaskInput) {
    if (editingTask) {
      const updated = await updateTask(editingTask.id, input);
      setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    } else {
      if (!planId) throw new StudyPlannerError('Your study plan is still loading — try again in a moment.');
      const created = await createTask(planId, input);
      setTasks((prev) => [...prev, created]);
    }
    setModalOpen(false);
    setEditingTask(null);
  }

  async function handleToggleComplete(task: StudyTask) {
    const previous = tasks;
    setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, completed: !t.completed } : t)));
    try {
      await updateTask(task.id, { completed: !task.completed });
    } catch {
      setTasks(previous);
      setError('Could not update the task. Please try again.');
    }
  }

  async function handleDeleteTask(task: StudyTask) {
    const previous = tasks;
    setTasks((prev) => prev.filter((t) => t.id !== task.id));
    try {
      await deleteTask(task.id);
    } catch {
      setTasks(previous);
      setError('Could not delete the task. Please try again.');
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center flex-1 min-h-0">
        <p className={mutedColor}>Loading your study planner…</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6 mt-2 flex-1 min-h-0">
      {/* Left/Center Column */}
      <div className="flex-1 min-w-0 space-y-4 overflow-y-auto pr-1">
        {error && (
          <div className="px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-500 text-sm font-medium">{error}</div>
        )}

        {/* Weekly Overview */}
        <div className="glass-card p-4 sm:p-5">
          <div className="flex items-center justify-between mb-5 gap-2">
            <div>
              <h3 className={`font-bold text-lg leading-tight ${textColor}`}>Weekly Overview</h3>
              <p className={`${mutedColor} text-xs mt-1`}>
                {weekSummary[0].dayNumber} – {weekSummary[6].dayNumber}
              </p>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setWeekStart((prev) => addDays(prev, -7))}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-cyan-500/10 border border-cyan-500/25 text-cyan-600 hover:bg-cyan-500/20 transition-colors"
                aria-label="Previous week"
              >
                ‹
              </button>
              <button
                type="button"
                onClick={() => setWeekStart(startOfWeek(new Date()))}
                className="px-3 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/25 text-cyan-600 text-xs font-bold hover:bg-cyan-500/20 transition-colors"
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => setWeekStart((prev) => addDays(prev, 7))}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-cyan-500/10 border border-cyan-500/25 text-cyan-600 hover:bg-cyan-500/20 transition-colors"
                aria-label="Next week"
              >
                ›
              </button>
            </div>
          </div>

          {/* Week Days */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {weekSummary.map((wd) => {
              const isSelected = wd.date === selectedDate;
              const allDone = wd.totalTasks > 0 && wd.completedTasks === wd.totalTasks;
              return (
                <button
                  key={wd.date}
                  type="button"
                  onClick={() => setSelectedDate(wd.date)}
                  className={`flex flex-col items-center py-2.5 sm:py-3.5 px-0.5 sm:px-1 rounded-xl transition-all ${
                    isSelected
                      ? theme === 'light'
                        ? 'bg-cyan-50 border border-cyan-200 shadow-sm'
                        : 'bg-[rgba(30,42,90,0.55)] border border-cyan-500/30 shadow-lg shadow-cyan-500/5'
                      : 'bg-transparent border border-transparent'
                  }`}
                >
                  <span className={`text-[11px] sm:text-xs font-bold ${isSelected ? (theme === 'light' ? 'text-cyan-700' : 'text-white') : (theme === 'light' ? 'text-slate-600' : 'text-gray-300')}`}>
                    {wd.label}
                  </span>
                  <span className={`${mutedColor} text-[9px] sm:text-[10px] mt-0.5`}>{wd.dayNumber}</span>
                  {wd.isToday && (
                    <>
                      <span className="text-cyan-600 text-[9px] sm:text-[10px] font-bold mt-1.5">Today</span>
                      <span className="w-4 h-px bg-cyan-500/50 mt-1" />
                    </>
                  )}
                  <div className="mt-2 mb-1 sm:mt-2.5 sm:mb-1.5">
                    {allDone ? (
                      <span className="w-6 h-6 sm:w-7 sm:h-7 rounded-full border-2 border-green-500 flex items-center justify-center text-green-600">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20,6 9,17 4,12" />
                        </svg>
                      </span>
                    ) : (
                      <span className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full border-2 block ${theme === 'light' ? 'border-slate-200' : 'border-[rgba(56,78,135,0.4)]'}`} />
                    )}
                  </div>
                  <span className={`text-[9px] sm:text-[10px] font-semibold ${isSelected ? (theme === 'light' ? 'text-cyan-700' : 'text-gray-200') : mutedColor}`}>
                    {wd.completedTasks}/{wd.totalTasks} tasks
                  </span>
                </button>
              );
            })}
          </div>

          {/* Weekly Progress */}
          <div className="mt-5 pt-4 border-t border-[rgba(56,78,135,0.15)]">
            <div className="flex items-center justify-between mb-2 flex-wrap gap-1">
              <span className={`text-sm font-bold ${textColor}`}>Weekly Progress</span>
              <span className={`${mutedColor} text-xs`}>
                {weekTasksCompleted} / {weekTasksTotal} tasks completed <span className="text-cyan-600 font-bold ml-1">{weekProgressPct}%</span>
              </span>
            </div>
            <div className={`h-1.5 rounded-full overflow-hidden ${progressBarBg}`}>
              <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all" style={{ width: `${weekProgressPct}%` }} />
            </div>
          </div>
        </div>

        {/* Selected Day's Plan */}
        <div className="glass-card p-4 sm:p-5">
          <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
            <div className="flex items-baseline gap-3 min-w-0">
              <h3 className={`font-bold text-lg ${textColor}`}>{selectedDate === toISODate(new Date()) ? "Today's Plan" : 'Plan'}</h3>
              <span className={`${mutedColor} text-xs truncate`}>{selectedDateLabel}</span>
            </div>
            <button
              type="button"
              onClick={openAddModal}
              className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-600 text-xs font-bold hover:bg-blue-500/20 transition-colors"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Add Task
            </button>
          </div>

          {selectedDateTasks.length === 0 ? (
            <p className={`${mutedColor} text-sm text-center py-8`}>Nothing planned for this day yet.</p>
          ) : (
            <div className="space-y-2.5">
              {selectedDateTasks.map((task) => (
                <TaskItem key={task.id} task={task} onToggleComplete={handleToggleComplete} onEdit={openEditModal} onDelete={handleDeleteTask} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right Column */}
      <div className="w-full lg:w-[300px] flex-shrink-0 space-y-4 lg:overflow-y-auto pb-6">
        {/* Study Streak */}
        <div className="glass-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-base">🔥</span>
            <h3 className={`font-bold text-base ${textColor}`}>Study Streak</h3>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <p className={`font-extrabold text-3xl leading-none ${textColor}`}>{streak}</p>
              <p className={`${mutedColor} text-xs mt-1`}>{streak === 1 ? 'Day' : 'Days'}</p>
            </div>
            <div className="flex-1">
              <p className={`text-xs font-bold ${textColor}`}>{streak > 0 ? 'Keep it up! 🔥' : 'Start your streak today!'}</p>
              <p className={`${mutedColor} text-[11px] mt-0.5 leading-relaxed`}>
                {streak > 0 ? "You're building a great habit." : 'Complete a task to get going.'}
              </p>
            </div>
          </div>
        </div>

        {/* Study Goals */}
        <div className="glass-card p-5">
          <h3 className={`font-bold text-base mb-4 ${textColor}`}>This Week's Goals</h3>
          <div className="space-y-4">
            <GoalRow
              icon="✅"
              iconColor="text-green-500"
              label={`Complete ${goals.tasksTotal || 'your'} tasks`}
              value={goals.tasksTotal}
              progress={goals.tasksTotal ? Math.round((goals.tasksCompleted / goals.tasksTotal) * 100) : 0}
              display={`${goals.tasksCompleted} / ${goals.tasksTotal}`}
              progressBarBg={progressBarBg}
            />
            <GoalRow
              icon="⏱️"
              iconColor="text-purple-500"
              label="Hours studied"
              value={goals.hoursStudied}
              progress={Math.min(100, Math.round((goals.hoursStudied / 15) * 100))}
              display={`${goals.hoursStudied} hrs`}
              progressBarBg={progressBarBg}
            />
            <GoalRow
              icon="📄"
              iconColor="text-blue-500"
              label="Past papers attempted"
              value={goals.pastPapersAttempted}
              progress={Math.min(100, Math.round((goals.pastPapersAttempted / 3) * 100))}
              display={`${goals.pastPapersAttempted}`}
              progressBarBg={progressBarBg}
            />
          </div>
        </div>

        {/* Upcoming Deadlines */}
        <div className="glass-card p-5">
          <h3 className={`font-bold text-base mb-4 ${textColor}`}>Upcoming Deadlines</h3>
          {deadlines.length === 0 ? (
            <p className={`${mutedColor} text-xs`}>No upcoming deadlines. You're all caught up!</p>
          ) : (
            <div className="space-y-2.5">
              {deadlines.map((task) => {
                const d = new Date(`${task.dueDate}T00:00:00`);
                const daysAway = Math.round((d.getTime() - Date.now()) / 86400000);
                return (
                  <button
                    key={task.id}
                    type="button"
                    onClick={() => setSelectedDate(task.dueDate as string)}
                    className={`w-full flex items-center gap-3 p-2.5 rounded-xl border hover:border-cyan-500/30 transition-all text-left ${
                      theme === 'light' ? 'bg-white border-slate-200 shadow-sm' : 'bg-[rgba(17,24,50,0.5)] border-[rgba(56,78,135,0.15)]'
                    }`}
                  >
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex flex-col items-center justify-center text-white flex-shrink-0 shadow-lg">
                      <span className="text-sm font-extrabold leading-none">{d.toLocaleDateString('en-US', { day: '2-digit' })}</span>
                      <span className="text-[8px] font-bold mt-0.5">{d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase()}</span>
                    </div>
                    <div className="min-w-0">
                      <p className={`text-xs font-bold leading-tight ${textColor}`}>{task.title}</p>
                      <p className={`${mutedColor} text-[11px] mt-0.5`}>Due in {daysAway} {daysAway === 1 ? 'day' : 'days'}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Focus Tip */}
        <div className="glass-card p-5 relative overflow-hidden">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-yellow-500">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 18h6M10 22h4" />
                <path d="M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.4 1 2.3h6c0-.9.4-1.8 1-2.3A7 7 0 0 0 12 2z" />
              </svg>
            </span>
            <h3 className={`font-bold text-base ${textColor}`}>Focus Tip</h3>
          </div>
          <div className="flex items-start gap-3">
            <p className={`${mutedColor} text-xs leading-relaxed flex-1`}>
              Break your study into small sessions. 25 minutes of focus can take you further than you think.
            </p>
            <div className={`w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0 text-3xl ${theme === 'light' ? 'bg-blue-50 border border-blue-100' : 'bg-gradient-to-br from-purple-500/20 to-indigo-500/10 border border-purple-500/20'}`}>
              ⏳
            </div>
          </div>
        </div>
      </div>

      {modalOpen && (
        <TaskModal
          defaultDate={selectedDate}
          editingTask={editingTask}
          onSave={handleSaveTask}
          onClose={() => {
            setModalOpen(false);
            setEditingTask(null);
          }}
        />
      )}
    </div>
  );
}

function GoalRow({
  icon,
  iconColor,
  label,
  progress,
  display,
  progressBarBg,
}: {
  icon: string;
  iconColor: string;
  label: string;
  value: number;
  progress: number;
  display: string;
  progressBarBg: string;
}) {
  const { theme } = useTheme();
  const textColor = theme === 'light' ? 'text-slate-900' : 'text-white';
  const mutedColor = theme === 'light' ? 'text-slate-500' : 'text-gray-500';

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className={`flex items-center gap-2 text-xs font-semibold ${textColor}`}>
          <span className={`text-sm ${iconColor}`}>{icon}</span>
          {label}
        </span>
        <span className={`${mutedColor} text-[11px] font-semibold`}>{display}</span>
      </div>
      <div className={`h-1.5 rounded-full overflow-hidden ml-6 ${progressBarBg}`}>
        <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all" style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
}
