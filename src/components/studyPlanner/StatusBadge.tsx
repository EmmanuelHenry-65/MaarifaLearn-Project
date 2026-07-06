import type { TaskStatus } from '../../services/studyPlanner.service';

export default function StatusBadge({ status }: { status: TaskStatus }) {
  if (status === 'completed') {
    return (
      <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-500/10 border border-green-500/25 text-green-600 text-xs font-bold whitespace-nowrap">
        Completed
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20,6 9,17 4,12" />
        </svg>
      </span>
    );
  }
  if (status === 'in_progress') {
    return (
      <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/25 text-cyan-600 text-xs font-bold whitespace-nowrap">
        In Progress
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <circle cx="12" cy="12" r="9" />
        </svg>
      </span>
    );
  }
  if (status === 'overdue') {
    return (
      <span className="px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/25 text-red-500 text-xs font-bold whitespace-nowrap">
        Overdue
      </span>
    );
  }
  return (
    <span className="px-3 py-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/25 text-indigo-600 text-xs font-bold whitespace-nowrap">
      Upcoming
    </span>
  );
}
