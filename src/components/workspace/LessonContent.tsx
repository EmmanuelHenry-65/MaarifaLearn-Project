import { useMemo, useState } from 'react';
import type { WorkspaceLesson, WorkspaceMode, WorkspaceSubject, WorkspaceTopic } from '../../data/workspaceData';
import { useTheme } from '../../context/ThemeContext';

interface WorkspaceNote {
  id: string;
  title: string;
  content: string;
  pinned: boolean;
  bookmarked: boolean;
}

interface LessonContentProps {
  subject: WorkspaceSubject;
  activeMode: WorkspaceMode;
  activeLesson?: WorkspaceLesson;
  activeTopic?: WorkspaceTopic;
  progressBump: number;
  onProgressBump: () => void;
}

export default function LessonContent({ subject, activeMode, activeLesson, activeTopic, progressBump, onProgressBump }: LessonContentProps) {
  const { theme } = useTheme();
  const [notes, setNotes] = useState<WorkspaceNote[]>([
    { id: 'note-1', title: 'Key idea', content: `Remember the core concept for ${activeLesson?.title ?? subject.name}.`, pinned: true, bookmarked: true },
    { id: 'note-2', title: 'Question for AI', content: 'Ask for a simpler explanation and two examples.', pinned: false, bookmarked: false },
  ]);
  const [draft, setDraft] = useState('');
  const [flashIndex, setFlashIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [practiceTab, setPracticeTab] = useState<'quiz' | 'questions' | 'examples' | 'challenge' | 'reflection' | 'assessment'>('quiz');
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});

  const textColor = theme === 'light' ? 'text-slate-900' : 'text-white';
  const mutedColor = theme === 'light' ? 'text-slate-500' : 'text-gray-400';
  const panelBg = theme === 'light' ? 'bg-white border-slate-200 shadow-sm' : 'bg-[rgba(17,24,50,0.55)] border-[rgba(56,78,135,0.18)]';
  const softBg = theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-[rgba(17,24,50,0.45)] border-[rgba(56,78,135,0.14)]';
  const barBg = theme === 'light' ? 'bg-slate-200' : 'bg-[rgba(56,78,135,0.25)]';

  const currentLesson = activeLesson ?? subject.units[0].lessons[0];
  const currentTopic = activeTopic ?? currentLesson.topics[0];

  const flashcards = useMemo(() => [
    { q: `What is the main idea in ${currentTopic.title}?`, a: currentTopic.summary },
    { q: `How does ${currentTopic.title} connect to CBE skills?`, a: 'It builds problem solving, communication, and self-directed learning.' },
    { q: 'What should I practice next?', a: `Complete a quick quiz and one worked example from ${currentLesson.title}.` },
  ], [currentLesson.title, currentTopic.summary, currentTopic.title]);

  if (activeMode === 'overview') {
    return (
      <div className="space-y-4">
        <div className="glass-card p-5">
          <h3 className={`font-bold text-lg ${textColor}`}>Syllabus Overview</h3>
          <p className={`mt-2 text-sm leading-relaxed ${mutedColor}`}>{subject.syllabus}</p>
          <div className="mt-4 grid grid-cols-4 gap-3">
            <Metric title="Lessons" value={`${subject.lessonsCompleted}/${subject.totalLessons}`} />
            <Metric title="Study Time" value={subject.studyTime} />
            <Metric title="Mastery" value={`${Math.min(100, subject.progress + progressBump)}%`} />
            <Metric title="Achievements" value="6" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <ListPanel title="Competencies" items={subject.competencies} />
          <ListPanel title="Learning Objectives" items={subject.objectives} />
        </div>
        <div className="glass-card p-5">
          <h3 className={`font-bold text-base mb-3 ${textColor}`}>Recommended Study Path</h3>
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {subject.recommendedPath.map((step, index) => (
              <div key={step} className={`min-w-[150px] p-3 rounded-xl border ${panelBg}`}>
                <span className="w-7 h-7 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-600 flex items-center justify-center text-xs font-bold mb-2">{index + 1}</span>
                <p className={`text-xs font-bold ${textColor}`}>{step}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (activeMode === 'lesson') {
    return (
      <div className="space-y-4">
        <div className="glass-card p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-cyan-600 text-xs font-bold uppercase tracking-wider">{subject.name}</p>
              <h3 className={`text-2xl font-extrabold mt-1 ${textColor}`}>{currentLesson.title}</h3>
              <p className={`mt-2 text-sm ${mutedColor}`}>{currentTopic.summary}</p>
            </div>
            <button onClick={onProgressBump} className="px-4 py-2 rounded-lg bg-green-500/10 border border-green-500/25 text-green-600 text-xs font-bold hover:bg-green-500/20 transition-colors">
              Mark Progress
            </button>
          </div>
          <div className="mt-5 grid grid-cols-3 gap-3">
            {currentLesson.topics.map((topic) => (
              <div key={topic.id} className={`rounded-xl border p-3 ${softBg}`}>
                <p className={`text-sm font-bold ${textColor}`}>{topic.title}</p>
                <p className={`text-xs mt-1 ${mutedColor}`}>{topic.duration}</p>
                <div className={`mt-2 h-1.5 rounded-full overflow-hidden ${barBg}`}>
                  <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full" style={{ width: `${topic.mastery}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className={`rounded-2xl border p-5 ${panelBg}`}>
          <h4 className={`font-bold text-base ${textColor}`}>Lesson Viewer</h4>
          <p className={`mt-2 text-sm leading-relaxed ${mutedColor}`}>
            This workspace combines concise lesson notes, guided examples, practice activities, and AI-ready context. Learners can highlight ideas, save notes, bookmark content, or jump into practice without leaving the lesson.
          </p>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {['Highlight key sentence', 'Bookmark lesson', 'Open worked example', 'Start reflection'].map((action) => (
              <button key={action} onClick={onProgressBump} className="px-3 py-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-600 text-xs font-bold hover:bg-cyan-500/20 transition-colors">
                {action}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (activeMode === 'notes') {
    return (
      <div className="glass-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className={`font-bold text-lg ${textColor}`}>Lesson Notes</h3>
          <button
            onClick={() => {
              if (!draft.trim()) return;
              setNotes((prev) => [{ id: crypto.randomUUID(), title: `Note ${prev.length + 1}`, content: draft, pinned: false, bookmarked: false }, ...prev]);
              setDraft('');
            }}
            className="px-4 py-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-600 text-xs font-bold"
          >
            Add Note
          </button>
        </div>
        <textarea value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Create a note from this lesson..." className={`w-full min-h-[90px] rounded-xl border p-3 text-sm focus:outline-none focus:border-cyan-500/40 ${panelBg}`} />
        <div className="mt-4 grid grid-cols-2 gap-3">
          {notes.map((note) => (
            <div key={note.id} className={`rounded-xl border p-3 ${softBg}`}>
              <div className="flex items-center justify-between mb-2">
                <p className={`font-bold text-sm ${textColor}`}>{note.pinned ? '📌 ' : ''}{note.title}</p>
                <div className="flex gap-1">
                  <button onClick={() => setNotes((prev) => prev.map((n) => n.id === note.id ? { ...n, pinned: !n.pinned } : n))} className="text-cyan-600 text-xs font-bold">Pin</button>
                  <button onClick={() => setNotes((prev) => prev.map((n) => n.id === note.id ? { ...n, bookmarked: !n.bookmarked } : n))} className="text-purple-600 text-xs font-bold">{note.bookmarked ? 'Saved' : 'Save'}</button>
                  <button onClick={() => setNotes((prev) => prev.filter((n) => n.id !== note.id))} className="text-red-500 text-xs font-bold">Delete</button>
                </div>
              </div>
              <p className={`text-xs leading-relaxed ${mutedColor}`}>{note.content}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (activeMode === 'flashcards') {
    const current = flashcards[flashIndex];
    return (
      <div className="glass-card p-5">
        <h3 className={`font-bold text-lg mb-4 ${textColor}`}>Interactive Flashcards</h3>
        <button onClick={() => setFlipped((value) => !value)} className={`w-full min-h-[220px] rounded-2xl border p-8 text-center ${panelBg}`}>
          <p className="text-cyan-600 text-xs font-bold uppercase mb-3">{flipped ? 'Answer' : 'Question'}</p>
          <p className={`text-xl font-extrabold ${textColor}`}>{flipped ? current.a : current.q}</p>
          <p className={`text-xs mt-4 ${mutedColor}`}>Click card to flip</p>
        </button>
        <div className="flex justify-center gap-2 mt-4">
          <button onClick={() => { setFlipped(false); setFlashIndex((flashIndex + flashcards.length - 1) % flashcards.length); }} className="px-4 py-2 rounded-lg bg-cyan-500/10 text-cyan-600 text-xs font-bold">Previous</button>
          <button onClick={() => { setFlipped(false); setFlashIndex((flashIndex + 1) % flashcards.length); onProgressBump(); }} className="px-4 py-2 rounded-lg bg-cyan-500 text-white text-xs font-bold">Next Card</button>
        </div>
      </div>
    );
  }

  if (activeMode === 'practice') {
    const tabs = [
      ['quiz', 'Quick Quiz'], ['questions', 'Practice Questions'], ['examples', 'Worked Examples'], ['challenge', 'Challenge'], ['reflection', 'Reflection'], ['assessment', 'Self Assessment'],
    ] as const;
    return (
      <div className="glass-card p-5">
        <div className="flex flex-wrap gap-2 mb-4">
          {tabs.map(([id, label]) => (
            <button key={id} onClick={() => setPracticeTab(id)} className={`px-3 py-2 rounded-lg border text-xs font-bold ${practiceTab === id ? 'bg-cyan-500 text-white border-cyan-500' : 'bg-cyan-500/10 text-cyan-600 border-cyan-500/20'}`}>{label}</button>
          ))}
        </div>
        <div className={`rounded-xl border p-4 ${panelBg}`}>
          <h3 className={`font-bold text-lg ${textColor}`}>{tabs.find(([id]) => id === practiceTab)?.[1]}</h3>
          <p className={`text-sm mt-1 ${mutedColor}`}>Complete this activity to update your mock mastery score.</p>
          <div className="mt-4 space-y-3">
            {['A', 'B', 'C'].map((choice) => (
              <button
                key={choice}
                onClick={() => { setSelectedAnswers((prev) => ({ ...prev, [practiceTab]: choice })); onProgressBump(); }}
                className={`w-full text-left px-4 py-3 rounded-xl border text-sm font-semibold ${selectedAnswers[practiceTab] === choice ? 'bg-green-500/10 border-green-500/30 text-green-600' : softBg}`}
              >
                {choice}. {practiceTab === 'examples' ? 'Show guided solution step' : `Interactive ${practiceTab} response option`}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return <GenericPanel mode={activeMode} subject={subject} textColor={textColor} mutedColor={mutedColor} panelBg={panelBg} onProgressBump={onProgressBump} />;
}

function Metric({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-xl bg-cyan-500/10 border border-cyan-500/20 p-3">
      <p className="text-cyan-600 text-xs font-bold">{title}</p>
      <p className="text-lg font-extrabold text-cyan-700 mt-1">{value}</p>
    </div>
  );
}

function ListPanel({ title, items }: { title: string; items: string[] }) {
  const { theme } = useTheme();
  const textColor = theme === 'light' ? 'text-slate-900' : 'text-white';
  const mutedColor = theme === 'light' ? 'text-slate-600' : 'text-gray-400';

  return (
    <div className="glass-card p-5">
      <h3 className={`font-bold text-base mb-3 ${textColor}`}>{title}</h3>
      <div className="space-y-2">
        {items.map((item) => (
          <div key={item} className="flex items-start gap-2">
            <span className="mt-1 w-2 h-2 rounded-full bg-cyan-500 flex-shrink-0" />
            <p className={`text-sm ${mutedColor}`}>{item}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function GenericPanel({ mode, subject, textColor, mutedColor, panelBg, onProgressBump }: { mode: WorkspaceMode; subject: WorkspaceSubject; textColor: string; mutedColor: string; panelBg: string; onProgressBump: () => void }) {
  const labels: Record<string, string> = {
    videos: 'Subject Videos',
    worksheets: 'Worksheets',
    resources: 'Learning Resources',
    'past-questions': 'Past Questions',
    bookmarks: 'Bookmarked Content',
    progress: 'Progress Dashboard',
  };

  const items = mode === 'progress'
    ? ['Completed lessons: 24', 'Completed topics: 62', 'Study streak: 7 days', 'Mastery: 82%', 'Weekly activity: 4h 30m']
    : [`${subject.name} ${labels[mode] ?? mode} 1`, `${subject.name} ${labels[mode] ?? mode} 2`, `${subject.name} ${labels[mode] ?? mode} 3`];

  return (
    <div className="glass-card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className={`font-bold text-lg ${textColor}`}>{labels[mode] ?? 'Workspace Panel'}</h3>
        <button onClick={onProgressBump} className="px-3 py-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-600 text-xs font-bold">Refresh</button>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {items.map((item, index) => (
          <button key={item} onClick={onProgressBump} className={`text-left rounded-xl border p-4 ${panelBg} hover:border-cyan-500/30 transition-all`}>
            <span className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-600 flex items-center justify-center mb-3 font-bold">{index + 1}</span>
            <p className={`font-bold text-sm ${textColor}`}>{item}</p>
            <p className={`text-xs mt-1 ${mutedColor}`}>Open, review, complete, bookmark, or ask AI about this item.</p>
          </button>
        ))}
      </div>
    </div>
  );
}