import { useCallback, useEffect, useMemo, useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { getDefaultLesson, getDefaultTopic, getWorkspaceSubject } from '../data/workspaceData';
import type { WorkspaceLesson, WorkspaceMode, WorkspaceTopic } from '../data/workspaceData';
import { useAuth } from '../context/AuthContext';
import { useAchievementCelebration } from '../context/AchievementCelebrationContext';
import { touchTopicAccess, recordTopicProgress, getMyLearningData, aggregateSubjects, type LearningTopic } from '../services/learning.service';
import { checkForNewAchievements } from '../services/achievements.service';
import AISidePanel from '../components/workspace/AISidePanel';
import FloatingAIButton from '../components/workspace/FloatingAIButton';
import LessonContent from '../components/workspace/LessonContent';
import SubjectSelection from '../components/workspace/SubjectSelection';
import SubjectSidebar from '../components/workspace/SubjectSidebar';
import WorkspaceHeader from '../components/workspace/WorkspaceHeader';

export default function WorkspaceView() {
  const { subjectId } = useParams();
  const subject = getWorkspaceSubject(subjectId);
  const { user } = useAuth();
  const { celebrate } = useAchievementCelebration();
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem('workspace-sidebar-collapsed') === 'true');
  const [activeMode, setActiveMode] = useState<WorkspaceMode>('overview');
  const [activeLesson, setActiveLesson] = useState<WorkspaceLesson | undefined>(undefined);
  const [activeTopic, setActiveTopic] = useState<WorkspaceTopic | undefined>(undefined);
  const [query, setQuery] = useState('');
  const [aiOpen, setAiOpen] = useState(false);
  const [topics, setTopics] = useState<LearningTopic[]>([]);

  useEffect(() => {
    localStorage.setItem('workspace-sidebar-collapsed', String(collapsed));
  }, [collapsed]);

  useEffect(() => {
    if (!subject) return;
    const lesson = getDefaultLesson(subject);
    setActiveLesson(lesson);
    setActiveTopic(getDefaultTopic(subject));
    setActiveMode(subjectId ? 'lesson' : 'overview');
  }, [subject, subjectId]);

  const refetchTopics = useCallback(async () => {
    const data = await getMyLearningData();
    setTopics(data);
    return data;
  }, []);

  useEffect(() => {
    if (!user) return;
    refetchTopics().catch(() => {});
  }, [user?.id, refetchTopics]);

  // The real Supabase row behind the currently-selected static topic, matched by slug.
  const currentTopicRow = useMemo(
    () => topics.find((t) => t.topicSlug === activeTopic?.id) ?? null,
    [topics, activeTopic],
  );

  useEffect(() => {
    if (!user || !currentTopicRow) return;
    let cancelled = false;
    touchTopicAccess(user.id, currentTopicRow.topicId)
      .then(() => checkForNewAchievements(user.id))
      .then((newlyEarned) => {
        if (!cancelled) celebrate(newlyEarned);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, currentTopicRow?.topicId]);

  const subjectTopics = useMemo(() => (subject ? topics.filter((t) => t.subjectCode === subject.id) : []), [topics, subject]);

  const displaySubject = useMemo(() => {
    if (!subject) return null;
    const summary = aggregateSubjects(topics).find((s) => s.code === subject.id);
    return summary
      ? { ...subject, progress: summary.progress, lessonsCompleted: summary.completedCount, totalLessons: summary.totalCount }
      : subject;
  }, [subject, topics]);

  const isUnknownSubject = Boolean(subjectId && !subject);

  if (!subjectId) return <SubjectSelection />;
  if (isUnknownSubject) return <Navigate to="/workspace" replace />;
  if (!subject || !displaySubject) return null;

  const selectLesson = (lesson: WorkspaceLesson, topic?: WorkspaceTopic) => {
    setActiveLesson(lesson);
    setActiveTopic(topic ?? lesson.topics[0]);
    setActiveMode('lesson');
  };

  async function handleProgressBump() {
    if (!user || !currentTopicRow) return;
    try {
      await recordTopicProgress(user.id, currentTopicRow.topicId, 15);
      await refetchTopics();
      const newlyEarned = await checkForNewAchievements(user.id);
      celebrate(newlyEarned);
    } catch {
      // best-effort - the UI simply won't reflect this bump if it fails
    }
  }

  return (
    <div className="flex flex-col gap-4 flex-1 min-h-0">
      <WorkspaceHeader subject={displaySubject} activeMode={activeMode} query={query} onQueryChange={setQuery} />

      <div className="flex gap-4 flex-1 min-h-0">
        <SubjectSidebar
          subject={subject}
          collapsed={collapsed}
          activeMode={activeMode}
          activeLessonId={activeLesson?.id}
          activeTopicId={activeTopic?.id}
          query={query}
          onToggleCollapsed={() => setCollapsed((value) => !value)}
          onModeChange={setActiveMode}
          onSelectLesson={selectLesson}
        />

        <main className="flex-1 min-w-0 overflow-y-auto space-y-4 pr-1">
          <LessonContent
            subject={subject}
            activeMode={activeMode}
            activeLesson={activeLesson}
            activeTopic={activeTopic}
            topicRow={currentTopicRow}
            subjectTopics={subjectTopics}
            onProgressBump={handleProgressBump}
            onBookmarkChanged={refetchTopics}
          />
        </main>
      </div>

      <FloatingAIButton isOpen={aiOpen} onClick={() => setAiOpen((value) => !value)} />
      <AISidePanel open={aiOpen} subject={subject} lesson={activeLesson} topic={activeTopic} onClose={() => setAiOpen(false)} />
    </div>
  );
}
