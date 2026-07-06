import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { aggregateSubjects, type LearningTopic } from '../services/learning.service';

interface LearningJourneyProps {
  topics: LearningTopic[];
}

export default function LearningJourney({ topics }: LearningJourneyProps) {
  const navigate = useNavigate();

  const focusSubjectCode = useMemo(() => {
    const subjects = aggregateSubjects(topics);
    if (subjects.length === 0) return null;
    const touched = [...subjects].filter((s) => s.lastAccessedAt).sort((a, b) => new Date(b.lastAccessedAt as string).getTime() - new Date(a.lastAccessedAt as string).getTime());
    return (touched[0] ?? subjects[0]).code;
  }, [topics]);

  const { nodes, subjectName } = useMemo(() => {
    if (!focusSubjectCode) return { nodes: [], subjectName: '' };

    const subjectTopics = topics.filter((t) => t.subjectCode === focusSubjectCode);
    const byLesson = new Map<string, { title: string; order: number; topics: LearningTopic[] }>();
    for (const t of subjectTopics) {
      const entry = byLesson.get(t.lessonId) ?? { title: t.lessonTitle, order: t.lessonOrder, topics: [] };
      entry.topics.push(t);
      byLesson.set(t.lessonId, entry);
    }

    const lessons = Array.from(byLesson.values()).sort((a, b) => a.order - b.order).slice(0, 5);
    const firstIncompleteIndex = lessons.findIndex((lesson) => !lesson.topics.every((t) => t.completed));

    const nodes = lessons.map((lesson, i) => ({
      name: lesson.title,
      completed: lesson.topics.every((t) => t.completed),
      current: i === firstIncompleteIndex,
      locked: firstIncompleteIndex !== -1 && i > firstIncompleteIndex,
    }));

    return { nodes, subjectName: subjectTopics[0]?.subjectName ?? '' };
  }, [topics, focusSubjectCode]);

  const completedCount = nodes.filter((n) => n.completed).length;
  const connectorWidth = nodes.length > 1 ? (completedCount / (nodes.length - 1)) * 100 : 0;

  if (nodes.length === 0) {
    return (
      <div className="glass-card p-5 h-full flex flex-col items-center justify-center text-center">
        <h3 className="text-white font-bold text-base mb-2">Learning Journey</h3>
        <p className="text-gray-500 text-sm">Start a lesson to see your journey here.</p>
      </div>
    );
  }

  return (
    <div className="glass-card p-5 h-full flex flex-col">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-white font-bold text-base">Learning Journey</h3>
          <p className="text-gray-500 text-[11px] mt-0.5">{subjectName}</p>
        </div>
        <button onClick={() => navigate(`/subjects/${focusSubjectCode}`)} className="text-cyan-400 text-xs font-medium hover:text-cyan-300 transition-colors">View full map</button>
      </div>
      <div className="flex-1 flex items-center">
        <div className="flex items-start justify-between w-full relative">
          <div className="absolute top-5 left-[10%] right-[10%] h-[2px] bg-[rgba(56,78,135,0.3)]" />
          <div className="absolute top-5 left-[10%] h-[2px] bg-gradient-to-r from-green-500 to-cyan-500" style={{ width: `${connectorWidth * 0.8}%` }} />

          {nodes.map((node, i) => (
            <button
              key={i}
              onClick={() => navigate(`/workspace/${focusSubjectCode}`)}
              className="flex flex-col items-center relative z-10"
              style={{ width: `${100 / nodes.length}%` }}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  node.current
                    ? 'bg-gradient-to-br from-cyan-400 to-cyan-600 shadow-lg shadow-cyan-500/40 ring-2 ring-cyan-400/30'
                    : node.completed
                    ? 'bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg shadow-green-500/20'
                    : 'bg-[#111832] border-2 border-[rgba(56,78,135,0.35)]'
                }`}
              >
                {node.locked ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-600">
                    <rect x="3" y="11" width="18" height="11" rx="2" />
                    <path d="M7 11V7a5 5 0 0110 0v4" />
                  </svg>
                ) : (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20,6 9,17 4,12" />
                  </svg>
                )}
              </div>
              <span className={`text-[10px] mt-2.5 text-center leading-tight font-medium whitespace-pre-line ${
                node.current ? 'text-cyan-400 font-semibold' : node.completed ? 'text-gray-300' : 'text-gray-600'
              }`}>
                {node.name}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
