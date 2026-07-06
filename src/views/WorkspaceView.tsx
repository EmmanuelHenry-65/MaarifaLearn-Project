import { useEffect, useMemo, useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { getDefaultLesson, getDefaultTopic, getWorkspaceSubject } from '../data/workspaceData';
import type { WorkspaceLesson, WorkspaceMode, WorkspaceTopic } from '../data/workspaceData';
import { useAuth } from '../context/AuthContext';
import { touchTopicAccess, recordTopicProgress } from '../services/learning.service';
import AISidePanel from '../components/workspace/AISidePanel';
import FloatingAIButton from '../components/workspace/FloatingAIButton';
import LessonContent from '../components/workspace/LessonContent';
import SubjectSelection from '../components/workspace/SubjectSelection';
import SubjectSidebar from '../components/workspace/SubjectSidebar';
import SubjectTools from '../components/workspace/SubjectTools';
import WorkspaceHeader from '../components/workspace/WorkspaceHeader';

export default function WorkspaceView() {
  const { subjectId } = useParams();
  const subject = getWorkspaceSubject(subjectId);
  const { user } = useAuth();
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem('workspace-sidebar-collapsed') === 'true');
  const [activeMode, setActiveMode] = useState<WorkspaceMode>('overview');
  const [activeLesson, setActiveLesson] = useState<WorkspaceLesson | undefined>(undefined);
  const [activeTopic, setActiveTopic] = useState<WorkspaceTopic | undefined>(undefined);
  const [query, setQuery] = useState('');
  const [activeTool, setActiveTool] = useState('');
  const [aiOpen, setAiOpen] = useState(false);
  const [progressBump, setProgressBump] = useState(0);

  useEffect(() => {
    localStorage.setItem('workspace-sidebar-collapsed', String(collapsed));
  }, [collapsed]);

  useEffect(() => {
    if (!subject) return;
    const lesson = getDefaultLesson(subject);
    setActiveLesson(lesson);
    setActiveTopic(getDefaultTopic(subject));
    setActiveTool(subject.tools[0] ?? 'Workspace tool');
    setActiveMode(subjectId ? 'lesson' : 'overview');
  }, [subject, subjectId]);

  useEffect(() => {
    if (!user || !activeTopic) return;
    touchTopicAccess(user.id, activeTopic.id).catch(() => {});
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
      <WorkspaceHeader subject={{ ...subject, progress }} activeMode={activeMode} query={query} onQueryChange={setQuery} />

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
          <SubjectTools subject={subject} activeTool={activeTool} onToolChange={setActiveTool} />
          <LessonContent
            subject={subject}
            activeMode={activeMode}
            activeLesson={activeLesson}
            activeTopic={activeTopic}
            progressBump={progressBump}
            onProgressBump={() => {
              setProgressBump((value) => Math.min(18, value + 2));
              if (user && activeTopic) {
                recordTopicProgress(user.id, activeTopic.id, 15).catch(() => {});
              }
            }}
          />
        </main>
      </div>

      <FloatingAIButton isOpen={aiOpen} onClick={() => setAiOpen((value) => !value)} />
      <AISidePanel open={aiOpen} subject={subject} lesson={activeLesson} topic={activeTopic} onClose={() => setAiOpen(false)} />
    </div>
  );
}