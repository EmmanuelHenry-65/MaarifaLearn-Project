import { useEffect, useState } from 'react';
import type { WorkspaceLesson, WorkspaceMode, WorkspaceSubject, WorkspaceTopic } from '../../data/workspaceData';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { toggleBookmark, type LearningTopic } from '../../services/learning.service';
import { getEarnedAchievements } from '../../services/achievements.service';
import {
  getNotesForTopic,
  createNote,
  deleteNote,
  toggleNotePinned,
  getResourcesForTopic,
  getQuestionsForTopic,
  getBookmarkedTopicsForSubject,
  type WorkspaceNote,
  type TopicResource,
  type TopicQuestion,
  type BookmarkedTopic,
} from '../../services/workspace.service';

interface LessonContentProps {
  subject: WorkspaceSubject;
  activeMode: WorkspaceMode;
  activeLesson?: WorkspaceLesson;
  activeTopic?: WorkspaceTopic;
  topicRow: LearningTopic | null;
  subjectTopics: LearningTopic[];
  onProgressBump: () => void | Promise<void>;
  onBookmarkChanged: () => void | Promise<unknown>;
}

export default function LessonContent({ subject, activeMode, activeLesson, activeTopic, topicRow, subjectTopics, onProgressBump, onBookmarkChanged }: LessonContentProps) {
  const { theme } = useTheme();
  const { user } = useAuth();

  const textColor = theme === 'light' ? 'text-slate-900' : 'text-white';
  const mutedColor = theme === 'light' ? 'text-slate-500' : 'text-gray-400';
  const panelBg = theme === 'light' ? 'bg-white border-slate-200 shadow-sm' : 'bg-[rgba(17,24,50,0.55)] border-[rgba(56,78,135,0.18)]';
  const softBg = theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-[rgba(17,24,50,0.45)] border-[rgba(56,78,135,0.14)]';
  const barBg = theme === 'light' ? 'bg-slate-200' : 'bg-[rgba(56,78,135,0.25)]';

  const currentLesson = activeLesson ?? subject.units[0].lessons[0];
  const currentTopic = activeTopic ?? currentLesson.topics[0];
  const masteryFor = (topicSlug: string) => subjectTopics.find((t) => t.topicSlug === topicSlug)?.masteryScore ?? 0;

  if (activeMode === 'overview') {
    return <OverviewPanel subject={subject} textColor={textColor} mutedColor={mutedColor} panelBg={panelBg} />;
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
            <div className="flex items-center gap-2 flex-shrink-0">
              <BookmarkButton user={user} topicRow={topicRow} onBookmarkChanged={onBookmarkChanged} />
              <button onClick={onProgressBump} className="px-4 py-2 rounded-lg bg-green-500/10 border border-green-500/25 text-green-600 text-xs font-bold hover:bg-green-500/20 transition-colors">
                Mark Progress
              </button>
            </div>
          </div>
          <div className="mt-5 grid grid-cols-3 gap-3">
            {currentLesson.topics.map((topic) => (
              <div key={topic.id} className={`rounded-xl border p-3 ${softBg}`}>
                <p className={`text-sm font-bold ${textColor}`}>{topic.title}</p>
                <p className={`text-xs mt-1 ${mutedColor}`}>{topic.duration}</p>
                <div className={`mt-2 h-1.5 rounded-full overflow-hidden ${barBg}`}>
                  <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full" style={{ width: `${masteryFor(topic.id)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className={`rounded-2xl border p-5 ${panelBg}`}>
          <h4 className={`font-bold text-base ${textColor}`}>Lesson Viewer</h4>
          <p className={`mt-2 text-sm leading-relaxed ${mutedColor}`}>
            This workspace combines concise lesson notes, guided examples, practice activities, and AI-ready context. Use the Notes tab to save your own notes, or open the AI assistant for help with this topic.
          </p>
        </div>
      </div>
    );
  }

  if (activeMode === 'notes') {
    return <NotesPanel userId={user?.id} topicId={topicRow?.topicId ?? null} textColor={textColor} mutedColor={mutedColor} panelBg={panelBg} softBg={softBg} />;
  }

  if (activeMode === 'flashcards') {
    return <ComingSoonPanel title="Flashcards" message="AI-generated flashcards for this topic are coming soon." textColor={textColor} mutedColor={mutedColor} panelBg={panelBg} />;
  }

  if (activeMode === 'practice' || activeMode === 'past-questions') {
    return (
      <QuestionsPanel
        topicId={topicRow?.topicId ?? null}
        title={activeMode === 'practice' ? 'Practice Questions' : 'Past Questions'}
        textColor={textColor}
        mutedColor={mutedColor}
        panelBg={panelBg}
        softBg={softBg}
      />
    );
  }

  if (activeMode === 'videos' || activeMode === 'worksheets' || activeMode === 'resources') {
    const typeFilter = activeMode === 'videos' ? 'video' : activeMode === 'worksheets' ? 'pdf' : null;
    return (
      <ResourcesPanel
        topicId={topicRow?.topicId ?? null}
        typeFilter={typeFilter}
        title={activeMode === 'videos' ? 'Videos' : activeMode === 'worksheets' ? 'Worksheets' : 'Resources'}
        textColor={textColor}
        mutedColor={mutedColor}
        panelBg={panelBg}
      />
    );
  }

  if (activeMode === 'bookmarks') {
    return <BookmarksPanel userId={user?.id} subjectCode={subject.id} textColor={textColor} mutedColor={mutedColor} panelBg={panelBg} />;
  }

  // progress
  return <ProgressPanel subjectTopics={subjectTopics} textColor={textColor} mutedColor={mutedColor} />;
}

function BookmarkButton({ user, topicRow, onBookmarkChanged }: { user: { id: string } | null; topicRow: LearningTopic | null; onBookmarkChanged: () => void | Promise<unknown> }) {
  const [busy, setBusy] = useState(false);
  const bookmarked = topicRow?.bookmarked ?? false;

  async function handleClick() {
    if (!user || !topicRow || busy) return;
    setBusy(true);
    try {
      await toggleBookmark(user.id, topicRow.topicId, !bookmarked);
      await onBookmarkChanged();
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={!topicRow || busy}
      className={`px-4 py-2 rounded-lg border text-xs font-bold transition-colors disabled:opacity-50 ${
        bookmarked ? 'bg-cyan-500/15 border-cyan-500/30 text-cyan-500' : 'bg-cyan-500/10 border-cyan-500/20 text-cyan-600 hover:bg-cyan-500/20'
      }`}
    >
      {bookmarked ? '★ Bookmarked' : '☆ Bookmark'}
    </button>
  );
}

function OverviewPanel({ subject, textColor, mutedColor, panelBg }: { subject: WorkspaceSubject; textColor: string; mutedColor: string; panelBg: string }) {
  const { user } = useAuth();
  const [achievementCount, setAchievementCount] = useState<number | null>(null);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    getEarnedAchievements(user.id)
      .then((list) => {
        if (!cancelled) setAchievementCount(list.length);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [user]);

  return (
    <div className="space-y-4">
      <div className="glass-card p-5">
        <h3 className={`font-bold text-lg ${textColor}`}>Syllabus Overview</h3>
        <p className={`mt-2 text-sm leading-relaxed ${mutedColor}`}>{subject.syllabus}</p>
        <div className="mt-4 grid grid-cols-4 gap-3">
          <Metric title="Topics" value={`${subject.lessonsCompleted}/${subject.totalLessons}`} />
          <Metric title="Study Time" value={subject.studyTime} />
          <Metric title="Mastery" value={`${subject.progress}%`} />
          <Metric title="Achievements" value={achievementCount == null ? '—' : String(achievementCount)} />
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

function NotesPanel({ userId, topicId, textColor, mutedColor, panelBg, softBg }: { userId: string | undefined; topicId: string | null; textColor: string; mutedColor: string; panelBg: string; softBg: string }) {
  const [notes, setNotes] = useState<WorkspaceNote[]>([]);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(true);

  function reload() {
    if (!userId || !topicId) {
      setNotes([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    getNotesForTopic(userId, topicId)
      .then(setNotes)
      .catch(() => setNotes([]))
      .finally(() => setLoading(false));
  }

  useEffect(reload, [userId, topicId]);

  async function handleAdd() {
    if (!userId || !topicId || !draft.trim()) return;
    await createNote(userId, topicId, `Note ${notes.length + 1}`, draft.trim());
    setDraft('');
    reload();
  }

  async function handlePin(note: WorkspaceNote) {
    await toggleNotePinned(note.id, !note.pinned);
    reload();
  }

  async function handleDelete(note: WorkspaceNote) {
    await deleteNote(note.id);
    reload();
  }

  return (
    <div className="glass-card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className={`font-bold text-lg ${textColor}`}>Lesson Notes</h3>
        <button onClick={handleAdd} disabled={!topicId} className="px-4 py-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-600 text-xs font-bold disabled:opacity-50">
          Add Note
        </button>
      </div>
      <textarea
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        placeholder="Create a note from this lesson..."
        className={`w-full min-h-[90px] rounded-xl border p-3 text-sm focus:outline-none focus:border-cyan-500/40 ${panelBg}`}
      />
      {loading ? (
        <p className={`text-sm mt-4 ${mutedColor}`}>Loading notes...</p>
      ) : notes.length === 0 ? (
        <p className={`text-sm mt-4 ${mutedColor}`}>No notes yet for this topic.</p>
      ) : (
        <div className="mt-4 grid grid-cols-2 gap-3">
          {notes.map((note) => (
            <div key={note.id} className={`rounded-xl border p-3 ${softBg}`}>
              <div className="flex items-center justify-between mb-2">
                <p className={`font-bold text-sm ${textColor}`}>{note.pinned ? '📌 ' : ''}{note.title}</p>
                <div className="flex gap-2">
                  <button onClick={() => handlePin(note)} className="text-cyan-600 text-xs font-bold">{note.pinned ? 'Unpin' : 'Pin'}</button>
                  <button onClick={() => handleDelete(note)} className="text-red-500 text-xs font-bold">Delete</button>
                </div>
              </div>
              <p className={`text-xs leading-relaxed ${mutedColor}`}>{note.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function QuestionsPanel({ topicId, title, textColor, mutedColor, panelBg, softBg }: { topicId: string | null; title: string; textColor: string; mutedColor: string; panelBg: string; softBg: string }) {
  const [questions, setQuestions] = useState<TopicQuestion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!topicId) {
      setQuestions([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    getQuestionsForTopic(topicId)
      .then(setQuestions)
      .catch(() => setQuestions([]))
      .finally(() => setLoading(false));
  }, [topicId]);

  return (
    <div className="glass-card p-5">
      <h3 className={`font-bold text-lg mb-4 ${textColor}`}>{title}</h3>
      {loading ? (
        <p className={`text-sm ${mutedColor}`}>Loading questions...</p>
      ) : questions.length === 0 ? (
        <p className={`text-sm ${mutedColor}`}>No {title.toLowerCase()} for this topic yet.</p>
      ) : (
        <div className="space-y-4">
          {questions.map((q, i) => (
            <div key={q.id} className={`rounded-xl border p-4 ${softBg}`}>
              <p className={`text-sm font-semibold ${textColor}`}>{i + 1}. {q.questionText}</p>
              <div className="mt-3 grid grid-cols-2 gap-2">
                {[q.optionA, q.optionB, q.optionC, q.optionD].filter(Boolean).map((option, idx) => (
                  <div key={idx} className={`px-3 py-2 rounded-lg border text-xs ${panelBg} ${mutedColor}`}>
                    {String.fromCharCode(65 + idx)}. {option}
                  </div>
                ))}
              </div>
              <p className={`text-[11px] mt-2 ${mutedColor}`}>{q.marks} {q.marks === 1 ? 'mark' : 'marks'} • grading coming soon</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ResourcesPanel({ topicId, typeFilter, title, textColor, mutedColor, panelBg }: { topicId: string | null; typeFilter: string | null; title: string; textColor: string; mutedColor: string; panelBg: string }) {
  const [resources, setResources] = useState<TopicResource[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!topicId) {
      setResources([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    getResourcesForTopic(topicId)
      .then(setResources)
      .catch(() => setResources([]))
      .finally(() => setLoading(false));
  }, [topicId]);

  const filtered = typeFilter ? resources.filter((r) => r.resourceType === typeFilter) : resources;

  return (
    <div className="glass-card p-5">
      <h3 className={`font-bold text-lg mb-4 ${textColor}`}>{title}</h3>
      {loading ? (
        <p className={`text-sm ${mutedColor}`}>Loading...</p>
      ) : filtered.length === 0 ? (
        <p className={`text-sm ${mutedColor}`}>No {title.toLowerCase()} for this topic yet.</p>
      ) : (
        <div className="grid grid-cols-3 gap-3">
          {filtered.map((resource) => (
            <a
              key={resource.id}
              href={resource.url ?? undefined}
              target="_blank"
              rel="noreferrer"
              className={`text-left rounded-xl border p-4 ${panelBg} hover:border-cyan-500/30 transition-all block`}
            >
              <p className={`font-bold text-sm ${textColor}`}>{resource.title}</p>
              <p className={`text-xs mt-1 uppercase tracking-wide ${mutedColor}`}>{resource.resourceType}</p>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

function BookmarksPanel({ userId, subjectCode, textColor, mutedColor, panelBg }: { userId: string | undefined; subjectCode: string; textColor: string; mutedColor: string; panelBg: string }) {
  const [bookmarks, setBookmarks] = useState<BookmarkedTopic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setBookmarks([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    getBookmarkedTopicsForSubject(userId, subjectCode)
      .then(setBookmarks)
      .catch(() => setBookmarks([]))
      .finally(() => setLoading(false));
  }, [userId, subjectCode]);

  return (
    <div className="glass-card p-5">
      <h3 className={`font-bold text-lg mb-4 ${textColor}`}>Bookmarked Topics</h3>
      {loading ? (
        <p className={`text-sm ${mutedColor}`}>Loading...</p>
      ) : bookmarks.length === 0 ? (
        <p className={`text-sm ${mutedColor}`}>You haven't bookmarked any topics in this subject yet.</p>
      ) : (
        <div className="grid grid-cols-3 gap-3">
          {bookmarks.map((b) => (
            <div key={b.topicId} className={`rounded-xl border p-4 ${panelBg}`}>
              <p className={`font-bold text-sm ${textColor}`}>{b.topicTitle}</p>
              <p className={`text-xs mt-1 ${mutedColor}`}>{b.lessonTitle}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ProgressPanel({ subjectTopics, textColor, mutedColor }: { subjectTopics: LearningTopic[]; textColor: string; mutedColor: string }) {
  const completed = subjectTopics.filter((t) => t.completed).length;
  const started = subjectTopics.filter((t) => t.lastAccessedAt).length;
  const total = subjectTopics.length;
  const touched = subjectTopics.filter((t) => t.lastAccessedAt);
  const avgMastery = touched.length ? Math.round(touched.reduce((sum, t) => sum + t.masteryScore, 0) / touched.length) : 0;

  return (
    <div className="glass-card p-5">
      <h3 className={`font-bold text-lg mb-4 ${textColor}`}>Progress Dashboard</h3>
      <div className="grid grid-cols-3 gap-3">
        <Metric title="Topics Completed" value={`${completed}/${total}`} />
        <Metric title="Topics Started" value={`${started}/${total}`} />
        <Metric title="Average Mastery" value={`${avgMastery}%`} />
      </div>
      <p className={`text-xs mt-4 ${mutedColor}`}>Real account-wide stats (full streak, rank, XP) are on the Accomplishments page.</p>
    </div>
  );
}

function ComingSoonPanel({ title, message, textColor, mutedColor, panelBg }: { title: string; message: string; textColor: string; mutedColor: string; panelBg: string }) {
  return (
    <div className={`glass-card p-10 flex flex-col items-center justify-center text-center ${panelBg}`}>
      <h3 className={`font-bold text-lg mb-2 ${textColor}`}>{title}</h3>
      <p className={`text-sm ${mutedColor}`}>{message}</p>
    </div>
  );
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
