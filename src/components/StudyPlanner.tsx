import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getOrCreateDefaultPlan, getTasksInRange, getTaskStatus, toISODate, type StudyTask } from '../services/studyPlanner.service';

// Dashboard summary widget: shows the next task on today's schedule that
// isn't finished yet (in-progress or upcoming), or a friendly empty state.
export default function StudyPlanner() {
  const { user } = useAuth();
  const [nextTask, setNextTask] = useState<StudyTask | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    getOrCreateDefaultPlan(user.id)
      .then(async (planId) => {
        const today = toISODate(new Date());
        const tasks = await getTasksInRange(planId, today, today);
        if (cancelled) return;
        const upcoming = tasks
          .filter((t) => getTaskStatus(t) !== 'completed')
          .sort((a, b) => (a.startTime ?? '99:99').localeCompare(b.startTime ?? '99:99'));
        setNextTask(upcoming[0] ?? null);
      })
      .catch(() => {
        if (!cancelled) setNextTask(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [user]);

  return (
    <div className="glass-card p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400">
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          <h3 className="text-white font-bold text-base">Study Planner</h3>
        </div>
        <Link to="/study-planner" className="text-cyan-400 text-xs font-medium hover:text-cyan-300 transition-colors">
          View planner
        </Link>
      </div>
      <h4 className="text-gray-300 text-sm font-semibold mb-3">Today's Schedule</h4>

      {loading ? (
        <div className="p-3 rounded-xl bg-[rgba(17,24,50,0.5)] border border-[rgba(56,78,135,0.15)] text-gray-500 text-xs">Loading…</div>
      ) : nextTask ? (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-[rgba(17,24,50,0.5)] border border-[rgba(56,78,135,0.15)] flex-wrap">
          {nextTask.startTime && nextTask.endTime && (
            <span className="text-gray-400 text-xs font-medium">
              {nextTask.startTime} – {nextTask.endTime}
            </span>
          )}
          {nextTask.subject && (
            <span className="px-2 py-0.5 rounded-full bg-green-500/15 text-green-400 text-[10px] font-semibold">{nextTask.subject}</span>
          )}
          <Link to="/study-planner" className="text-gray-400 text-xs flex items-center gap-1 hover:text-gray-300">
            {nextTask.title}
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="9,18 15,12 9,6" />
            </svg>
          </Link>
        </div>
      ) : (
        <div className="p-3 rounded-xl bg-[rgba(17,24,50,0.5)] border border-[rgba(56,78,135,0.15)] text-gray-500 text-xs">
          Nothing left on today's schedule.
        </div>
      )}
    </div>
  );
}
