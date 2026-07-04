import type { WorkspaceLesson, WorkspaceMode, WorkspaceSubject, WorkspaceTopic } from '../../data/workspaceData';
import { useTheme } from '../../context/ThemeContext';

interface SubjectSidebarProps {
  subject: WorkspaceSubject;
  collapsed: boolean;
  activeMode: WorkspaceMode;
  activeLessonId?: string;
  activeTopicId?: string;
  query: string;
  onToggleCollapsed: () => void;
  onModeChange: (mode: WorkspaceMode) => void;
  onSelectLesson: (lesson: WorkspaceLesson, topic?: WorkspaceTopic) => void;
}

const navItems: Array<{ mode: WorkspaceMode; label: string; icon: string }> = [
  { mode: 'overview', label: 'Subject Overview', icon: '⌁' },
  { mode: 'videos', label: 'Videos', icon: '▶' },
  { mode: 'notes', label: 'Notes', icon: '✎' },
  { mode: 'worksheets', label: 'Worksheets', icon: '▦' },
  { mode: 'resources', label: 'Resources', icon: '◈' },
  { mode: 'flashcards', label: 'Flashcards', icon: '◇' },
  { mode: 'practice', label: 'Practice', icon: '✓' },
  { mode: 'past-questions', label: 'Past Questions', icon: '?' },
  { mode: 'bookmarks', label: 'Bookmarks', icon: '☆' },
  { mode: 'progress', label: 'Progress', icon: '↗' },
];

export default function SubjectSidebar({
  subject,
  collapsed,
  activeMode,
  activeLessonId,
  activeTopicId,
  query,
  onToggleCollapsed,
  onModeChange,
  onSelectLesson,
}: SubjectSidebarProps) {
  const { theme } = useTheme();
  const textColor = theme === 'light' ? 'text-slate-900' : 'text-white';
  const mutedColor = theme === 'light' ? 'text-slate-500' : 'text-gray-500';
  const surface = theme === 'light' ? 'bg-white border-slate-200' : 'bg-[rgba(17,24,50,0.55)] border-[rgba(56,78,135,0.18)]';

  const normalizedQuery = query.trim().toLowerCase();
  const visibleUnits = subject.units
    .map((unit) => ({
      ...unit,
      lessons: unit.lessons
        .map((lesson) => ({
          ...lesson,
          topics: lesson.topics.filter((topic) => !normalizedQuery || `${lesson.title} ${topic.title}`.toLowerCase().includes(normalizedQuery)),
        }))
        .filter((lesson) => !normalizedQuery || lesson.title.toLowerCase().includes(normalizedQuery) || lesson.topics.length > 0),
    }))
    .filter((unit) => !normalizedQuery || unit.title.toLowerCase().includes(normalizedQuery) || unit.lessons.length > 0);

  return (
    <aside className={`glass-card transition-all duration-300 overflow-hidden flex-shrink-0 ${collapsed ? 'w-[72px]' : 'w-[280px]'}`}>
      <div className="p-3 border-b border-[rgba(56,78,135,0.15)] flex items-center justify-between">
        {!collapsed && <p className={`font-bold text-sm ${textColor}`}>Workspace Menu</p>}
        <button onClick={onToggleCollapsed} className="w-9 h-9 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-600 flex items-center justify-center hover:bg-cyan-500/20 transition-colors">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points={collapsed ? '9 18 15 12 9 6' : '15 18 9 12 15 6'} />
          </svg>
        </button>
      </div>

      <div className="p-3 space-y-2 overflow-y-auto max-h-[calc(100vh-230px)]">
        {navItems.map((item) => (
          <button
            key={item.mode}
            onClick={() => onModeChange(item.mode)}
            title={item.label}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeMode === item.mode
                ? 'bg-cyan-500/10 text-cyan-600 border border-cyan-500/25'
                : `${mutedColor} hover:text-cyan-600 hover:bg-cyan-500/5`
            }`}
          >
            <span className="w-5 text-center">{item.icon}</span>
            {!collapsed && <span className="truncate">{item.label}</span>}
          </button>
        ))}

        {!collapsed && (
          <div className="pt-3 mt-3 border-t border-[rgba(56,78,135,0.15)]">
            <p className={`text-xs font-bold uppercase tracking-wider mb-2 ${mutedColor}`}>Lessons</p>
            <div className="space-y-2">
              {visibleUnits.map((unit) => (
                <div key={unit.id} className={`rounded-xl border p-2 ${surface}`}>
                  <p className={`text-xs font-bold mb-1.5 ${textColor}`}>{unit.title}</p>
                  <div className="space-y-1">
                    {unit.lessons.map((lesson) => (
                      <div key={lesson.id}>
                        <button
                          onClick={() => onSelectLesson(lesson)}
                          className={`w-full text-left px-2 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                            activeLessonId === lesson.id && activeMode === 'lesson'
                              ? 'bg-cyan-500/10 text-cyan-600'
                              : `${mutedColor} hover:text-cyan-600 hover:bg-cyan-500/5`
                          }`}
                        >
                          {lesson.completed ? '✓' : '○'} {lesson.title}
                        </button>
                        <div className="ml-4 mt-1 space-y-1">
                          {lesson.topics.map((topic) => (
                            <button
                              key={topic.id}
                              onClick={() => onSelectLesson(lesson, topic)}
                              className={`w-full text-left px-2 py-1 rounded-md text-[11px] transition-all ${
                                activeTopicId === topic.id && activeMode === 'lesson'
                                  ? 'text-cyan-600 bg-cyan-500/10 font-bold'
                                  : `${mutedColor} hover:text-cyan-600`
                              }`}
                            >
                              {topic.title}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}