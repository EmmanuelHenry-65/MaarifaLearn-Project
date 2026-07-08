import { useEffect, useMemo, useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { getDefaultLesson, getDefaultTopic, getWorkspaceSubject } from '../data/workspaceData';
import type { WorkspaceLesson, WorkspaceMode, WorkspaceTopic } from '../data/workspaceData';
import { useAuth } from '../context/AuthContext';
import { useAchievementCelebration } from '../context/AchievementCelebrationContext';
import {
  touchTopicAccess,
  recordTopicProgress,
  resolveTopicId,
  getSubjectResources,
  getSubjectProgressSummary,
  getMyLearningData,
  type SubjectResource,
  type SubjectProgressSummary,
  type TopicProgressBySlug,
} from '../services/learning.service';
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
  const [progressBump, setProgressBump] = useState(0);
  const [resolvedTopicId, setResolvedTopicId] = useState<string | null>(null);
  const [resources, setResources] = useState<SubjectResource[]>([]);
  const [resourcesLoading, setResourcesLoading] = useState(false);
  const [progressSummary, setProgressSummary] = useState<SubjectProgressSummary | null>(null);
  const [progressLoading, setProgressLoading] = useState(false);
  const [progressRefreshTick, setProgressRefreshTick] = useState(0);
  const [topicProgress, setTopicProgress] = useState<TopicProgressBySlug>({});

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

  useEffect(() => {
    if (!subject) return;
    let cancelled = false;
    setResourcesLoading(true);
    getSubjectResources(subject.id)
      .then((rows) => {
        if (!cancelled) setResources(rows);
      })
      .catch(() => {
        if (!cancelled) setResources([]);
      })
      .finally(() => {
        if (!cancelled) setResourcesLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [subject]);

  useEffect(() => {
    if (!subject || !user) {
      setProgressSummary(null);
      return;
    }
    let cancelled = false;
    setProgressLoading(true);
    getSubjectProgressSummary(user.id, subject.id)
      .then((summary) => {
        if (!cancelled) setProgressSummary(summary);
      })
      .catch(() => {
        if (!cancelled) setProgressSummary(null);
      })
      .finally(() => {
        if (!cancelled) setProgressLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [subject, user, progressRefreshTick]);

  useEffect(() => {
    if (!subject || !user) {
      setTopicProgress({});
      return;
    }
    let cancelled = false;
    getMyLearningData()
      .then((topics) => {
        if (cancelled) return;
        const map: TopicProgressBySlug = {};
        for (const topic of topics) {
          if (topic.subjectCode === subject.id) {
            map[topic.topicSlug] = { completed: topic.completed, masteryScore: topic.masteryScore };
          }
        }
        setTopicProgress(map);
      })
      .catch(() => {
        if (!cancelled) setTopicProgress({});
      });
    return () => {
      cancelled = true;
    };
  }, [subject, user, progressRefreshTick]);

  useEffect(() => {
    setResolvedTopicId(null);
    if (!user || !activeTopic) return;
    let cancelled = false;
    resolveTopicId(activeTopic.id).then((id) => {
      if (cancelled || !id) return;
      setResolvedTopicId(id);
      touchTopicAccess(user.id, id)
        .then(() => checkForNewAchievements(user.id))
        .then((newlyEarned) => {
          if (!cancelled) celebrate(newlyEarned);
        })
        .catch(() => {});
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, activeTopic?.id]);

  const isUnknownSubject = Boolean(subjectId && !subject);
  const progress = useMemo(() => Math.min(100, (subject?.progress ?? 0) + progressBump), [progressBump, subject?.progress]);

  if (!subjectId) return <SubjectSelection />;
  if (isUnknownSubject) return <Navigate to="/workspace" replace />;
  if (!subject) return null;

  const selectLesson = (lesson: WorkspaceLesson, topic?: WorkspaceTopic) => {
    setActiveLesson(lesson);
    setActiveTopic(topic ?? lesson.topics[0]);
    setActiveMode('lesson');
  };

  return (
    <div className="flex flex-col gap-4 flex-1 min-h-0">
      <WorkspaceHeader subject={{ ...subject, progress }} activeMode={activeMode} query={query} onQueryChange={setQuery} progressSummary={progressSummary} />

      <div className="flex gap-4 flex-1 min-h-0">
        <SubjectSidebar
          subject={subject}
          collapsed={collapsed}
          activeMode={activeMode}
          activeLessonId={activeLesson?.id}
          activeTopicId={activeTopic?.id}
          query={query}
          topicProgress={topicProgress}
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
            resources={resources}
            resourcesLoading={resourcesLoading}
            userId={user?.id ?? null}
            resolvedTopicId={resolvedTopicId}
            progressSummary={progressSummary}
            progressLoading={progressLoading}
            progressBump={progressBump}
            onProgressBump={() => {
              setProgressBump((value) => Math.min(18, value + 2));
              if (user && resolvedTopicId) {
                recordTopicProgress(user.id, resolvedTopicId, 15)
                  .then(() => checkForNewAchievements(user.id))
                  .then((newlyEarned) => {
                    celebrate(newlyEarned);
                    setProgressRefreshTick((v) => v + 1);
                  })
                  .catch(() => {});
              }
            }}
          />
        </main>
      </div>

      <FloatingAIButton isOpen={aiOpen} onClick={() => setAiOpen((value) => !value)} />
      <AISidePanel open={aiOpen} subject={subject} lesson={activeLesson} topic={activeTopic} userId={user?.id ?? null} onClose={() => setAiOpen(false)} />
    </div>
  );
}