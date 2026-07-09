import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { workspaceSubjects } from '../../data/workspaceData';
import { aggregateSubjects, getMyLearningData, type SubjectSummary } from '../../services/learning.service';

export default function SubjectSelection() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [summaries, setSummaries] = useState<SubjectSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const textColor = theme === 'light' ? 'text-slate-900' : 'text-white';
  const mutedColor = theme === 'light' ? 'text-slate-500' : 'text-gray-400';
  const barBg = theme === 'light' ? 'bg-slate-200' : 'bg-[rgba(56,78,135,0.25)]';

  useEffect(() => {
    if (!user) {
      setSummaries([]);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    getMyLearningData()
      .then((topics) => {
        if (!cancelled) setSummaries(aggregateSubjects(topics));
      })
      .catch(() => {
        if (!cancelled) setSummaries([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [user]);

  const summaryByCode = useMemo(() => new Map(summaries.map((s) => [s.code, s])), [summaries]);

  return (
    <div className="flex-1 overflow-y-auto pr-1">
      <div className="glass-card p-6 mb-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className={`text-2xl font-extrabold ${textColor}`}>Open Learning Workspace</h2>
            <p className={`text-sm mt-1 ${mutedColor}`}>Choose a CBE subject to enter an immersive study environment.</p>
          </div>
          <div className="hidden lg:flex items-center gap-2 px-3 py-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-600 text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            AI-ready workspace
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {workspaceSubjects.map((subject) => {
          const summary = summaryByCode.get(subject.id);
          const completed = summary?.completedCount ?? 0;
          const total = summary?.totalCount ?? 0;
          const progress = summary?.progress ?? 0;

          return (
            <Link
              key={subject.id}
              to={`/workspace/${subject.id}`}
              className="glass-card p-5 hover:border-cyan-500/35 transition-all group"
            >
              <div className="flex items-start justify-between gap-3">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${subject.accent} flex items-center justify-center text-2xl shadow-lg shadow-cyan-500/10 group-hover:scale-105 transition-transform`}>
                  {subject.icon}
                </div>
                <span className="px-2 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-600 text-[10px] font-bold uppercase">
                  {subject.category}
                </span>
              </div>
              <h3 className={`mt-4 text-lg font-bold ${textColor}`}>{subject.name}</h3>
              <p className={`mt-1 text-xs leading-relaxed ${mutedColor}`}>{subject.syllabus}</p>
              <div className="mt-4">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className={mutedColor}>{loading ? '…' : `${completed}/${total} topics`}</span>
                  <span className="text-cyan-600 font-bold">{loading ? '…' : `${progress}%`}</span>
                </div>
                <div className={`h-1.5 rounded-full overflow-hidden ${barBg}`}>
                  <div className={`h-full rounded-full bg-gradient-to-r ${subject.accent}`} style={{ width: `${loading ? 0 : progress}%` }} />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2">
                <span className="flex-1 text-center px-3 py-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-600 text-xs font-bold group-hover:bg-cyan-500/20 transition-colors">
                  Enter Workspace
                </span>
                {/* Inside the card's <Link>, so intercept the click -- "Ask AI"
                    must actually open the AI Tutor, not silently enter the workspace. */}
                <span
                  role="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    navigate(`/ai-tutor?q=${encodeURIComponent(`Help me study ${subject.name} — what should I focus on first?`)}`);
                  }}
                  className="px-3 py-2 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-600 text-xs font-bold hover:bg-purple-500/20 transition-colors"
                >
                  Ask AI
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}