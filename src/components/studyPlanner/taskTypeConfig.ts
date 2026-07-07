import type { TaskType } from '../../services/studyPlanner.service';

export const TASK_TYPE_OPTIONS: { label: string; value: TaskType }[] = [
  { label: 'Lesson', value: 'lesson' },
  { label: 'Practice', value: 'practice' },
  { label: 'Task', value: 'task' },
  { label: 'Past Paper', value: 'past_paper' },
  { label: 'Revision', value: 'revision' },
];

export const TASK_TYPE_STYLE: Record<TaskType, { icon: string; iconBg: string }> = {
  lesson: { icon: '🌿', iconBg: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400' },
  practice: { icon: '⨍', iconBg: 'bg-blue-500/15 border-blue-500/30 text-blue-400' },
  task: { icon: '📖', iconBg: 'bg-orange-500/15 border-orange-500/30 text-orange-400' },
  past_paper: { icon: '🎯', iconBg: 'bg-pink-500/15 border-pink-500/30 text-pink-400' },
  revision: { icon: '📋', iconBg: 'bg-teal-500/15 border-teal-500/30 text-teal-400' },
};

export const PRIORITY_OPTIONS = [
  { label: 'Low', value: 'low' },
  { label: 'Medium', value: 'medium' },
  { label: 'High', value: 'high' },
];
