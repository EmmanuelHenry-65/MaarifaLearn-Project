import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { WorkspaceLesson, WorkspaceMode, WorkspaceSubject, WorkspaceTopic } from '../../data/workspaceData';
import type {
  BookmarkedTopic,
  SubjectPastQuestion,
  SubjectProgressSummary,
  SubjectResource,
  TopicFlashcard,
  TopicProgressBySlug,
  WorkspaceNoteRow,
} from '../../services/learning.service';
import {
  createNote,
  deleteNote,
  getSubjectBookmarkedTopics,
  getSubjectPastQuestions,
  getTopicContent,
  getTopicFlashcards,
  getTopicNotes,
  toggleNotePinned,
} from '../../services/learning.service';
import { useTheme } from '../../context/ThemeContext';
import { forceDownloadUrl } from '../../utils/download';
import VideoModal from '../common/VideoModal';
import Spinner from '../common/Spinner';

interface LessonContentProps {
  subject: WorkspaceSubject;
  activeMode: WorkspaceMode;
  activeLesson?: WorkspaceLesson;
  activeTopic?: WorkspaceTopic;
  resources: SubjectResource[];
  resourcesLoading: boolean;
  userId: string | null;
  resolvedTopicId: string | null;
  progressSummary: SubjectProgressSummary | null;
  progressLoading: boolean;
  topicProgress: TopicProgressBySlug;
  onProgressBump: () => void;
}

export default function LessonContent({
  subject,
  activeMode,
  activeLesson,
  activeTopic,
  resources,
  resourcesLoading,
  userId,
  resolvedTopicId,
  progressSummary,
  progressLoading,
  topicProgress,
  onProgressBump,
}: LessonContentProps) {
  const { theme } = useTheme();

  const textColor = theme === 'light' ? 'text-slate-900' : 'text-white';
  const mutedColor = theme === 'light' ? 'text-slate-500' : 'text-gray-400';
  const panelBg = theme === 'light' ? 'bg-white border-slate-200 shadow-sm' : 'bg-[rgba(17,24,50,0.55)] border-[rgba(56,78,135,0.18)]';
  const softBg = theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-[rgba(17,24,50,0.45)] border-[rgba(56,78,135,0.14)]';
  const barBg = theme === 'light' ? 'bg-slate-200' : 'bg-[rgba(56,78,135,0.25)]';

  const currentLesson = activeLesson ?? subject.units[0].lessons[0];
  const currentTopic = activeTopic ?? currentLesson.topics[0];

  // Never fall back to workspaceData.ts's placeholder numbers here -- a
  // student whose progress fetch is slow or empty should see 0/loading,
  // never a fabricated mastery percentage presented as their real record.
  const masteryPercent = progressSummary?.totalTopics
    ? Math.round((progressSummary.topicsCompleted / progressSummary.totalTopics) * 100)
    : 0;

  if (activeMode === 'overview') {
    return (
      <div className="space-y-4">
        <div className="glass-card p-5">
          <h3 className={`font-bold text-lg ${textColor}`}>Syllabus Overview</h3>
          <p className={`mt-2 text-sm leading-relaxed ${mutedColor}`}>{subject.syllabus}</p>
          <div className="mt-4 grid grid-cols-4 gap-3">
            <Metric
              title="Topics"
              value={progressLoading ? '…' : progressSummary ? `${progressSummary.topicsCompleted}/${progressSummary.totalTopics}` : '0/0'}
            />
            <Metric title="Started" value={progressLoading ? '…' : progressSummary ? `${progressSummary.topicsStarted}` : '0'} />
            <Metric title="Mastery" value={progressLoading ? '…' : progressSummary ? `${progressSummary.averageMastery}%` : `${masteryPercent}%`} />
            <Metric title="Last Studied" value={progressLoading ? '…' : formatRelative(progressSummary?.lastAccessedAt ?? null)} />
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
            {currentLesson.topics.map((topic) => {
              const mastery = topicProgress[topic.id]?.masteryScore ?? 0;
              return (
                <div key={topic.id} className={`rounded-xl border p-3 ${softBg}`}>
                  <p className={`text-sm font-bold ${textColor}`}>{topic.title}</p>
                  <p className={`text-xs mt-1 ${mutedColor}`}>{topic.duration}</p>
                  <div className={`mt-2 h-1.5 rounded-full overflow-hidden ${barBg}`}>
                    <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full" style={{ width: `${mastery}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <LessonViewerPanel topicId={resolvedTopicId} textColor={textColor} mutedColor={mutedColor} panelBg={panelBg} softBg={softBg} />
      </div>
    );
  }

  if (activeMode === 'notes') {
    return (
      <NotesPanel
        userId={userId}
        topicId={resolvedTopicId}
        topicLabel={currentLesson.title}
        textColor={textColor}
        mutedColor={mutedColor}
        panelBg={panelBg}
        softBg={softBg}
      />
    );
  }

  if (activeMode === 'flashcards') {
    return <FlashcardsPanel topicId={resolvedTopicId} topicLabel={currentTopic.title} textColor={textColor} mutedColor={mutedColor} panelBg={panelBg} />;
  }

  if (activeMode === 'practice') {
    return <EmptyStatePanel title="Practice" textColor={textColor} mutedColor={mutedColor} message="Real practice questions for this topic aren't available yet. Try Past Questions for real exam questions on this subject in the meantime." />;
  }

  if (activeMode === 'worksheets') {
    return <EmptyStatePanel title="Worksheets" textColor={textColor} mutedColor={mutedColor} message={`No worksheet files have been uploaded for ${subject.name} yet.`} />;
  }

  if (activeMode === 'videos' || activeMode === 'resources') {
    const filtered = resources.filter((r) => (activeMode === 'videos' ? r.resourceType === 'video' : r.resourceType !== 'video'));
    return <ResourcePanel mode={activeMode} subject={subject} items={filtered} loading={resourcesLoading} textColor={textColor} mutedColor={mutedColor} panelBg={panelBg} />;
  }

  if (activeMode === 'past-questions') {
    return <PastQuestionsPanel subject={subject} textColor={textColor} mutedColor={mutedColor} panelBg={panelBg} />;
  }

  if (activeMode === 'bookmarks') {
    return <BookmarksPanel userId={userId} subject={subject} textColor={textColor} mutedColor={mutedColor} panelBg={panelBg} />;
  }

  if (activeMode === 'progress') {
    return (
      <div className="glass-card p-5">
        <h3 className={`font-bold text-lg mb-4 ${textColor}`}>Progress Dashboard</h3>
        {progressLoading ? (
          <Spinner />
        ) : progressSummary ? (
          <div className="grid grid-cols-2 gap-3">
            <Metric title="Topics Completed" value={`${progressSummary.topicsCompleted}/${progressSummary.totalTopics}`} />
            <Metric title="Topics Started" value={`${progressSummary.topicsStarted}/${progressSummary.totalTopics}`} />
            <Metric title="Average Mastery" value={`${progressSummary.averageMastery}%`} />
            <Metric title="Last Studied" value={formatRelative(progressSummary.lastAccessedAt)} />
          </div>
        ) : (
          <p className={`text-sm ${mutedColor}`}>No progress recorded yet — open a lesson to get started.</p>
        )}
      </div>
    );
  }

  return null;
}

function formatRelative(iso: string | null): string {
  if (!iso) return 'Never';
  const diffMs = Date.now() - new Date(iso).getTime();
  const diffMins = Math.round(diffMs / 60000);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.round(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${Math.round(diffHours / 24)}d ago`;
}

function LessonViewerPanel({
  topicId,
  textColor,
  mutedColor,
  panelBg,
  softBg,
}: {
  topicId: string | null;
  textColor: string;
  mutedColor: string;
  panelBg: string;
  softBg: string;
}) {
  const [explanation, setExplanation] = useState<string | null>(null);
  const [workedExample, setWorkedExample] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!topicId) {
      setExplanation(null);
      setWorkedExample(null);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    getTopicContent(topicId)
      .then((content) => {
        if (cancelled) return;
        setExplanation(content?.explanation ?? null);
        setWorkedExample(content?.workedExample ?? null);
      })
      .catch(() => {
        if (!cancelled) {
          setExplanation(null);
          setWorkedExample(null);
        }
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [topicId]);

  return (
    <div className={`rounded-2xl border p-5 ${panelBg}`}>
      <h4 className={`font-bold text-base ${textColor}`}>Lesson Viewer</h4>
      {loading ? (
        <Spinner />
      ) : explanation ? (
        <>
          <p className={`mt-2 text-sm leading-relaxed whitespace-pre-line ${mutedColor}`}>{explanation}</p>
          {workedExample && (
            <div className={`mt-4 rounded-xl border p-4 ${softBg}`}>
              <p className={`text-xs font-bold uppercase tracking-wider text-cyan-600`}>Worked Example</p>
              <p className={`mt-2 text-sm leading-relaxed whitespace-pre-line ${mutedColor}`}>{workedExample}</p>
            </div>
          )}
        </>
      ) : (
        <p className={`mt-2 text-sm leading-relaxed ${mutedColor}`}>
          Real lesson content for this topic hasn't been written yet — check back soon.
        </p>
      )}
    </div>
  );
}

function FlashcardsPanel({
  topicId,
  topicLabel,
  textColor,
  mutedColor,
  panelBg,
}: {
  topicId: string | null;
  topicLabel: string;
  textColor: string;
  mutedColor: string;
  panelBg: string;
}) {
  const [cards, setCards] = useState<TopicFlashcard[]>([]);
  const [loading, setLoading] = useState(true);
  const [flipped, setFlipped] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!topicId) {
      setCards([]);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    getTopicFlashcards(topicId)
      .then((rows) => !cancelled && setCards(rows))
      .catch(() => !cancelled && setCards([]))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [topicId]);

  if (loading) {
    return (
      <div className="glass-card p-5">
        <h3 className={`font-bold text-lg mb-2 ${textColor}`}>Flashcards</h3>
        <Spinner />
      </div>
    );
  }

  if (cards.length === 0) {
    return <EmptyStatePanel title="Flashcards" textColor={textColor} mutedColor={mutedColor} message={`Real flashcards for ${topicLabel} aren't available yet — check back soon.`} />;
  }

  return (
    <div className="glass-card p-5">
      <h3 className={`font-bold text-lg mb-1 ${textColor}`}>Flashcards — {topicLabel}</h3>
      <p className={`text-xs mb-4 ${mutedColor}`}>Click a card to flip it.</p>
      <div className="grid grid-cols-2 gap-3">
        {cards.map((card) => {
          const isFlipped = Boolean(flipped[card.id]);
          return (
            <button
              key={card.id}
              onClick={() => setFlipped((prev) => ({ ...prev, [card.id]: !prev[card.id] }))}
              className={`text-left rounded-xl border p-4 min-h-[110px] ${panelBg} hover:border-cyan-500/30 transition-all`}
            >
              <p className="text-cyan-600 text-[10px] font-bold uppercase tracking-wider mb-2">{isFlipped ? 'Answer' : 'Question'}</p>
              <p className={`text-sm leading-relaxed ${textColor}`}>{isFlipped ? card.answer : card.question}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function NotesPanel({
  userId,
  topicId,
  topicLabel,
  textColor,
  mutedColor,
  panelBg,
  softBg,
}: {
  userId: string | null;
  topicId: string | null;
  topicLabel: string;
  textColor: string;
  mutedColor: string;
  panelBg: string;
  softBg: string;
}) {
  const [notes, setNotes] = useState<WorkspaceNoteRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!userId || !topicId) {
      setNotes([]);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    getTopicNotes(userId, topicId)
      .then((rows) => !cancelled && setNotes(rows))
      .catch(() => !cancelled && setNotes([]))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [userId, topicId]);

  const addNote = async () => {
    if (!draft.trim() || !userId || !topicId) return;
    setSaving(true);
    try {
      const note = await createNote(userId, topicId, `Note ${notes.length + 1}`, draft.trim());
      setNotes((prev) => [note, ...prev]);
      setDraft('');
    } catch {
      // best-effort -- leave the draft in place so the learner doesn't lose it
    } finally {
      setSaving(false);
    }
  };

  const togglePin = async (note: WorkspaceNoteRow) => {
    setNotes((prev) => prev.map((n) => (n.id === note.id ? { ...n, pinned: !n.pinned } : n)));
    await toggleNotePinned(note.id, !note.pinned).catch(() => {});
  };

  const remove = async (noteId: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== noteId));
    await deleteNote(noteId).catch(() => {});
  };

  return (
    <div className="glass-card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className={`font-bold text-lg ${textColor}`}>Notes — {topicLabel}</h3>
        <button onClick={addNote} disabled={saving || !draft.trim()} className="px-4 py-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-600 text-xs font-bold disabled:opacity-40">
          {saving ? 'Saving...' : 'Add Note'}
        </button>
      </div>
      <textarea
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        placeholder="Create a note from this lesson..."
        className={`w-full min-h-[90px] rounded-xl border p-3 text-sm focus:outline-none focus:border-cyan-500/40 ${panelBg}`}
      />
      {loading ? (
        <Spinner />
      ) : notes.length === 0 ? (
        <p className={`text-sm mt-4 ${mutedColor}`}>No notes yet for this topic — add one above.</p>
      ) : (
        <div className="mt-4 grid grid-cols-2 gap-3">
          {notes.map((note) => (
            <div key={note.id} className={`rounded-xl border p-3 ${softBg}`}>
              <div className="flex items-center justify-between mb-2">
                <p className={`font-bold text-sm ${textColor}`}>{note.pinned ? '📌 ' : ''}{note.title}</p>
                <div className="flex gap-2">
                  <button onClick={() => togglePin(note)} className="text-cyan-600 text-xs font-bold">{note.pinned ? 'Unpin' : 'Pin'}</button>
                  <button onClick={() => remove(note.id)} className="text-red-500 text-xs font-bold">Delete</button>
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

function PastQuestionsPanel({ subject, textColor, mutedColor, panelBg }: { subject: WorkspaceSubject; textColor: string; mutedColor: string; panelBg: string }) {
  const [questions, setQuestions] = useState<SubjectPastQuestion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getSubjectPastQuestions(subject.id)
      .then((rows) => !cancelled && setQuestions(rows))
      .catch(() => !cancelled && setQuestions([]))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [subject.id]);

  return (
    <div className="glass-card p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className={`font-bold text-lg ${textColor}`}>Past Questions</h3>
          <p className={`text-xs mt-1 ${mutedColor}`}>Real questions pulled from {subject.name}'s past papers.</p>
        </div>
        <Link to="/exams" className="px-3 py-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-600 text-xs font-bold">Open Exam Center</Link>
      </div>
      {loading ? (
        <Spinner />
      ) : questions.length === 0 ? (
        <p className={`text-sm ${mutedColor}`}>No past-paper questions found for {subject.name} yet.</p>
      ) : (
        <div className="space-y-2">
          {questions.map((q) => (
            <div key={q.id} className={`rounded-xl border p-3 ${panelBg}`}>
              <p className={`text-sm font-semibold ${textColor}`}>{q.questionText}</p>
              <p className={`text-xs mt-1 ${mutedColor}`}>From {q.paperTitle}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function BookmarksPanel({ userId, subject, textColor, mutedColor, panelBg }: { userId: string | null; subject: WorkspaceSubject; textColor: string; mutedColor: string; panelBg: string }) {
  const [bookmarks, setBookmarks] = useState<BookmarkedTopic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setBookmarks([]);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    getSubjectBookmarkedTopics(userId, subject.id)
      .then((rows) => !cancelled && setBookmarks(rows))
      .catch(() => !cancelled && setBookmarks([]))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [userId, subject.id]);

  return (
    <div className="glass-card p-5">
      <h3 className={`font-bold text-lg mb-4 ${textColor}`}>Bookmarked Topics</h3>
      {loading ? (
        <Spinner />
      ) : bookmarks.length === 0 ? (
        <p className={`text-sm ${mutedColor}`}>No bookmarked topics yet for {subject.name}.</p>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {bookmarks.map((b) => (
            <div key={b.bookmarkId} className={`rounded-xl border p-3 ${panelBg}`}>
              <p className={`font-bold text-sm ${textColor}`}>{b.topicTitle}</p>
              <p className={`text-xs mt-1 ${mutedColor}`}>{b.lessonTitle}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function EmptyStatePanel({ title, message, textColor, mutedColor }: { title: string; message: string; textColor: string; mutedColor: string }) {
  return (
    <div className="glass-card p-5">
      <h3 className={`font-bold text-lg mb-2 ${textColor}`}>{title}</h3>
      <p className={`text-sm ${mutedColor}`}>{message}</p>
    </div>
  );
}

function ResourcePanel({
  mode,
  subject,
  items,
  loading,
  textColor,
  mutedColor,
  panelBg,
}: {
  mode: 'videos' | 'resources';
  subject: WorkspaceSubject;
  items: SubjectResource[];
  loading: boolean;
  textColor: string;
  mutedColor: string;
  panelBg: string;
}) {
  const title = mode === 'videos' ? 'Subject Videos' : 'Learning Resources';
  const [playing, setPlaying] = useState<SubjectResource | null>(null);

  return (
    <div className="glass-card p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className={`font-bold text-lg ${textColor}`}>{title}</h3>
          <p className={`text-xs mt-1 ${mutedColor}`}>Real {mode === 'videos' ? 'videos' : 'materials'} for {subject.name}.</p>
        </div>
      </div>

      {loading ? (
        <Spinner />
      ) : items.length === 0 ? (
        <p className={`text-sm ${mutedColor}`}>No {mode === 'videos' ? 'videos' : 'resources'} uploaded for {subject.name} yet.</p>
      ) : (
        <div className="grid grid-cols-3 gap-3">
          {items.map((item) => {
            const isVideo = item.resourceType === 'video';
            const cardClasses = `text-left rounded-xl border p-4 block w-full ${panelBg} hover:border-cyan-500/30 transition-all ${item.url ? '' : 'pointer-events-none opacity-50'}`;
            const inner = (
              <>
                <span className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-600 flex items-center justify-center mb-3 font-bold">
                  {isVideo ? '▶' : '📄'}
                </span>
                <p className={`font-bold text-sm ${textColor}`}>{item.title}</p>
                <p className={`text-xs mt-1 ${mutedColor}`}>{isVideo ? 'Watch now' : 'Download PDF'}</p>
              </>
            );

            if (isVideo) {
              return (
                <button key={item.id} onClick={() => item.url && setPlaying(item)} className={cardClasses}>
                  {inner}
                </button>
              );
            }

            return (
              <a key={item.id} href={item.url ? forceDownloadUrl(item.url, `${item.title}.pdf`) : undefined} target="_blank" rel="noopener noreferrer" className={cardClasses}>
                {inner}
              </a>
            );
          })}
        </div>
      )}

      {playing?.url && <VideoModal title={playing.title} url={playing.url} onClose={() => setPlaying(null)} />}
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
