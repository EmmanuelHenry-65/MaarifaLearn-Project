import { useNavigate } from 'react-router-dom';
import type { TodayTask } from '../services/dashboard.service';

interface StudyPlannerProps {
  tasks: TodayTask[];
}

export default function StudyPlanner({ tasks }: StudyPlannerProps) {
  const navigate = useNavigate();

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
        <button onClick={() => navigate('/study-planner')} className="text-cyan-400 text-xs font-medium hover:text-cyan-300 transition-colors">View planner</button>
      </div>
      <h4 className="text-gray-300 text-sm font-semibold mb-3">Today's Schedule</h4>
      {tasks.length === 0 ? (
        <p className="text-gray-500 text-xs text-center py-3">Nothing scheduled for today.</p>
      ) : (
        <div className="space-y-2">
          {tasks.slice(0, 3).map((task) => (
            <div key={task.id} className="flex items-center gap-2 p-3 rounded-xl bg-[rgba(17,24,50,0.5)] border border-[rgba(56,78,135,0.15)]">
              <span className="text-gray-300 text-xs font-medium flex-1 min-w-0 truncate">{task.title}</span>
              {task.subjectName && (
                <span className="px-2 py-0.5 rounded-full bg-green-500/15 text-green-400 text-[10px] font-semibold whitespace-nowrap">{task.subjectName}</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
