import { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { getTaskStatus, type StudyTask } from '../../services/studyPlanner.service';
import { TASK_TYPE_OPTIONS, TASK_TYPE_STYLE } from './taskTypeConfig';
import StatusBadge from './StatusBadge';

interface TaskItemProps {
  task: StudyTask;
  onToggleComplete: (task: StudyTask) => void;
  onEdit: (task: StudyTask) => void;
  onDelete: (task: StudyTask) => void;
}

export default function TaskItem({ task, onToggleComplete, onEdit, onDelete }: TaskItemProps) {
  const { theme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);

  const itemBg = theme === 'light' ? 'bg-white border-slate-200 shadow-sm' : 'bg-[rgba(17,24,50,0.5)] border-[rgba(56,78,135,0.15)]';
  const mutedColor = theme === 'light' ? 'text-slate-500' : 'text-gray-500';
  const textColor = theme === 'light' ? 'text-slate-900' : 'text-white';
  const timeBadgeBg = theme === 'light' ? 'bg-slate-50 border-slate-200 text-slate-700' : 'bg-[rgba(17,24,50,0.7)] border-[rgba(56,78,135,0.25)] text-gray-300';
  const menuBg = theme === 'light' ? 'bg-white border-slate-200' : 'bg-[#131a2e] border-[rgba(56,78,135,0.3)]';

  const style = TASK_TYPE_STYLE[task.taskType];
  const typeLabel = TASK_TYPE_OPTIONS.find((o) => o.value === task.taskType)?.label ?? task.taskType;
  const status = getTaskStatus(task);
  const timeLabel = task.startTime && task.endTime ? `${task.startTime} - ${task.endTime}` : null;

  return (
    <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl border hover:border-cyan-500/30 transition-all ${itemBg}`}>
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <button
          type="button"
          onClick={() => onToggleComplete(task)}
          aria-label={task.completed ? 'Mark as not completed' : 'Mark as completed'}
          className={`w-10 h-10 rounded-xl border flex items-center justify-center text-base flex-shrink-0 transition-transform hover:scale-105 ${style.iconBg}`}
        >
          {task.completed ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20,6 9,17 4,12" />
            </svg>
          ) : (
            style.icon
          )}
        </button>
        <div className="min-w-0">
          {task.subject && <p className={`${mutedColor} text-[10px] font-bold uppercase tracking-wide leading-tight`}>{task.subject}</p>}
          <p className={`text-sm font-semibold leading-tight mt-0.5 ${textColor} ${task.completed ? 'line-through opacity-60' : ''}`}>{task.title}</p>
          <p className={`${mutedColor} text-[10px] mt-0.5 flex items-center gap-1`}>
            <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14,2 14,8 20,8" />
            </svg>
            {typeLabel}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0 sm:ml-4">
        {timeLabel && (
          <>
            <span className={`px-3 py-1.5 rounded-lg border text-xs font-semibold whitespace-nowrap ${timeBadgeBg}`}>{timeLabel}</span>
            <span className={`w-px h-6 hidden sm:block ${theme === 'light' ? 'bg-slate-200' : 'bg-[rgba(56,78,135,0.25)]'}`} />
          </>
        )}
        <StatusBadge status={status} />
        <div className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            className={`${mutedColor} hover:text-cyan-500 transition-colors p-1`}
            aria-label="Task options"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="12" cy="5" r="1.6" />
              <circle cx="12" cy="12" r="1.6" />
              <circle cx="12" cy="19" r="1.6" />
            </svg>
          </button>
          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
              <div className={`absolute right-0 top-7 z-20 w-32 rounded-lg border shadow-lg py-1 ${menuBg}`}>
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    onEdit(task);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs font-medium hover:bg-cyan-500/10 ${textColor}`}
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    onDelete(task);
                  }}
                  className="w-full text-left px-3 py-2 text-xs font-medium text-red-500 hover:bg-red-500/10"
                >
                  Delete
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
