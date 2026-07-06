import { useEffect, useMemo, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { styleFor } from '../lib/subjectStyle';
import { ensureProfile, getMyLearningData, type LearningTopic } from '../services/learning.service';

export default function SubjectDetailPage() {
  const { subjectId = '' } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [topics, setTopics] = useState<LearningTopic[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    setLoading(true);
    setLoadError(null);
    (async () => {
      try {
        await ensureProfile(user);
        const data = await getMyLearningData();
        if (!cancelled) setTopics(data);
      } catch (err) {
        if (!cancelled) setLoadError(err instanceof Error ? err.message : 'Failed to load this subject.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const subjectTopics = useMemo(() => topics.filter((t) => t.subjectCode === subjectId), [topics, subjectId]);

  const lessons = useMemo(() => {
    const byLesson = new Map<string, { lessonTitle: string; lessonOrder: number; topics: LearningTopic[] }>();
    for (const topic of subjectTopics) {
      const entry = byLesson.get(topic.lessonId) ?? { lessonTitle: topic.lessonTitle, lessonOrder: topic.lessonOrder, topics: [] };
      entry.topics.push(topic);
      byLesson.set(topic.lessonId, entry);
    }
    return Array.from(byLesson.values()).sort((a, b) => a.lessonOrder - b.lessonOrder);
  }, [subjectTopics]);

  const style = styleFor(subjectId);
  const subjectName = subjectTopics[0]?.subjectName ?? subjectId.replace(/-/g, ' ');
  const completedCount = subjectTopics.filter((t) => t.completed).length;
  const totalCount = subjectTopics.length;
  const progress = totalCount ? Math.round((completedCount / totalCount) * 100) : 0;
  const touched = subjectTopics.filter((t) => t.lastAccessedAt);
  const averageMastery = touched.length ? Math.round(touched.reduce((sum, t) => sum + t.masteryScore, 0) / touched.length) : 0;

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-0">
        <p className="text-gray-500">Loading subject...</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-0">
        <p className="text-red-400 text-sm">{loadError}</p>
      </div>
    );
  }

  if (totalCount === 0) {
    return (
      <div className="flex-1 min-w-0 space-y-4 overflow-y-auto pr-1">
        <Link to="/subjects" className="inline-flex items-center gap-1.5 text-cyan-400 text-sm font-semibold hover:text-cyan-300 transition-colors">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15,18 9,12 15,6" /></svg>
          Back to Subjects
        </Link>
        <div className="glass-card p-10 flex flex-col items-center justify-center text-center">
          <span className="text-3xl mb-3">🔍</span>
          <p className="text-white font-bold text-sm">Subject not found</p>
          <p className="text-gray-500 text-xs mt-1">"{subjectId}" isn't in the curriculum.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 min-w-0 space-y-4 overflow-y-auto pr-1">
      <Link to="/subjects" className="inline-flex items-center gap-1.5 text-cyan-400 text-sm font-semibold hover:text-cyan-300 transition-colors">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15,18 9,12 15,6" /></svg>
        Back to Subjects
      </Link>

      <div className="glass-card p-6">
        <div className="flex items-center gap-4">
          <div className={`w-16 h-16 rounded-2xl border flex items-center justify-center text-3xl ${style.iconColor}`}>
            {style.icon}
          </div>
          <div className="flex-1">
            <h2 className="text-white font-extrabold text-2xl capitalize">{subjectName}</h2>
            <p className="text-gray-400 text-sm mt-1">{completedCount} of {totalCount} topics completed</p>
          </div>
          <button onClick={() => navigate(`/workspace/${subjectId}`)} className="px-4 py-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-sm font-bold hover:bg-cyan-500/20">
            Open Workspace
          </button>
          <button onClick={() => navigate('/ai-tutor')} className="px-4 py-2 rounded-lg bg-purple-500/10 border border-purple-500/30 text-purple-400 text-sm font-bold hover:bg-purple-500/20">
            Ask AI Tutor
          </button>
        </div>
        <div className="mt-5">
          <div className="flex justify-between text-sm mb-1.5">
            <span className="text-gray-300 font-semibold">Overall Progress</span>
            <span className="text-cyan-400 font-bold">{progress}%</span>
          </div>
          <div className="h-2 rounded-full bg-[rgba(56,78,135,0.25)] overflow-hidden">
            <div className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-cyan-400" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="glass-card p-5">
          <h3 className="text-white font-bold text-base mb-3">Topics Completed</h3>
          <p className="text-3xl font-extrabold text-cyan-400">{completedCount}</p>
          <p className="text-gray-500 text-xs mt-1">out of {totalCount} total topics</p>
        </div>
        <div className="glass-card p-5">
          <h3 className="text-white font-bold text-base mb-3">Average Mastery</h3>
          <p className="text-3xl font-extrabold text-green-400">{averageMastery}%</p>
          <p className="text-gray-500 text-xs mt-1">across topics you've studied</p>
        </div>
        <div className="glass-card p-5">
          <h3 className="text-white font-bold text-base mb-3">Topics Started</h3>
          <p className="text-3xl font-extrabold text-purple-400">{touched.length}</p>
          <p className="text-gray-500 text-xs mt-1">out of {totalCount} total topics</p>
        </div>
      </div>

      <div className="glass-card p-5">
        <h3 className="text-white font-bold text-base mb-4">Lessons</h3>
        <div className="space-y-2.5">
          {lessons.map((lesson) => {
            const lessonCompleted = lesson.topics.filter((t) => t.completed).length;
            return (
              <div key={lesson.lessonTitle} className="flex items-center justify-between p-3 rounded-xl bg-[rgba(17,24,50,0.5)] border border-[rgba(56,78,135,0.15)]">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-lg border flex items-center justify-center ${style.iconColor}`}>{style.icon}</div>
                  <div>
                    <p className="text-white text-sm font-semibold leading-tight">{lesson.lessonTitle}</p>
                    <p className="text-gray-500 text-[11px] mt-0.5">{lessonCompleted} / {lesson.topics.length} topics completed</p>
                  </div>
                </div>
                <button onClick={() => navigate(`/workspace/${subjectId}`)} className="px-3 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold hover:bg-cyan-500/20">
                  Continue
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
