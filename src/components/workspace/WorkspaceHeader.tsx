import type { WorkspaceMode, WorkspaceSubject } from '../../data/workspaceData';
import { useTheme } from '../../context/ThemeContext';

interface WorkspaceHeaderProps {
  subject: WorkspaceSubject;
  activeMode: WorkspaceMode;
  query: string;
  onQueryChange: (value: string) => void;
}

const modeLabels: Record<WorkspaceMode, string> = {
  overview: 'Overview',
  lesson: 'Lesson Workspace',
  videos: 'Videos',
  notes: 'Notes',
  worksheets: 'Worksheets',
  resources: 'Resources',
  flashcards: 'Flashcards',
  practice: 'Practice',
  'past-questions': 'Past Questions',
  bookmarks: 'Bookmarks',
  progress: 'Progress',
};

export default function WorkspaceHeader({ subject, activeMode, query, onQueryChange }: WorkspaceHeaderProps) {
  const { theme } = useTheme();
  const textColor = theme === 'light' ? 'text-slate-900' : 'text-white';
  const mutedColor = theme === 'light' ? 'text-slate-500' : 'text-gray-400';
  const inputClass = theme === 'light'
    ? 'bg-white border-slate-200 text-slate-900 placeholder-slate-400 shadow-sm'
    : 'bg-[rgba(17,24,50,0.8)] border-[rgba(56,78,135,0.3)] text-gray-200 placeholder-gray-600';

  return (
    <div className="glass-card p-4 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3 min-w-0">
        <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${subject.accent} flex items-center justify-center text-2xl shadow-lg shadow-cyan-500/10`}>
          {subject.icon}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h2 className={`font-extrabold text-xl truncate ${textColor}`}>{subject.name}</h2>
            <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-600 text-[10px] font-bold uppercase">
              {subject.category}
            </span>
          </div>
          <p className={`text-xs mt-0.5 ${mutedColor}`}>{modeLabels[activeMode]} • {subject.lessonsCompleted}/{subject.totalLessons} topics complete</p>
        </div>
      </div>

      <div className="flex items-center gap-3 flex-shrink-0">
        <div className="relative hidden xl:block">
          <input
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Search lessons, notes, tools..."
            className={`w-72 px-4 py-2.5 pr-10 rounded-xl border text-sm focus:outline-none focus:border-cyan-500/50 ${inputClass}`}
          />
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="absolute right-3 top-1/2 -translate-y-1/2 text-cyan-500">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </div>
        <div className="px-3 py-2 rounded-xl bg-green-500/10 border border-green-500/20 text-green-600 text-xs font-bold">
          {subject.progress}% mastery
        </div>
      </div>
    </div>
  );
}