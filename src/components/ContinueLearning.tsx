import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { styleFor } from '../lib/subjectStyle';
import type { LearningTopic } from '../services/learning.service';

function formatRelativeTime(iso: string | null): string {
  if (!iso) return 'Not started yet';
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

interface ContinueLearningProps {
  topics: LearningTopic[];
}

export default function ContinueLearning({ topics }: ContinueLearningProps) {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const titleColor = theme === 'light' ? 'text-slate-900' : 'text-white';
  const textColor = theme === 'light' ? 'text-slate-600' : 'text-gray-400';
  const mutedColor = theme === 'light' ? 'text-slate-500' : 'text-gray-500';
  const progressBarBg = theme === 'light' ? 'bg-slate-200' : 'bg-[rgba(56,78,135,0.3)]';

  const current = useMemo(
    () =>
      [...topics]
        .filter((t) => !t.completed && t.lastAccessedAt)
        .sort((a, b) => new Date(b.lastAccessedAt as string).getTime() - new Date(a.lastAccessedAt as string).getTime())[0],
    [topics],
  );

  if (!current) {
    return (
      <div className="glass-card p-5 h-full flex flex-col items-center justify-center text-center">
        <h3 className={`font-bold text-lg mb-2 ${titleColor}`}>Continue Learning</h3>
        <p className={`text-sm mb-4 ${textColor}`}>You haven't started a lesson yet.</p>
        <button onClick={() => navigate('/subjects')} className="btn-primary px-4 py-2 text-white text-[13px]">
          Browse Subjects
        </button>
      </div>
    );
  }

  const style = styleFor(current.subjectCode);

  return (
    <div className="glass-card p-5 h-full">
      <h3 className={`font-bold text-lg mb-3 ${titleColor}`}>Continue Learning</h3>
      <div className="flex gap-4">
        <div className={`w-36 h-36 rounded-xl flex-shrink-0 flex items-center justify-center text-6xl border ${style.iconColor}`}>
          {style.icon}
        </div>
        <div className="flex-1 flex flex-col justify-between min-w-0">
          <div>
            <span className="text-cyan-600 text-xs font-semibold">{current.subjectName}</span>
            <h4 className={`font-bold text-base mt-0.5 ${titleColor}`}>{current.topicTitle}</h4>
            <div className="flex items-center gap-3 mt-2.5">
              <div className={`flex-1 h-2 rounded-full overflow-hidden ${progressBarBg}`}>
                <div className="h-full rounded-full bg-gradient-to-r from-green-500 to-emerald-400" style={{ width: `${current.masteryScore}%` }} />
              </div>
              <span className={`text-xs font-medium whitespace-nowrap ${textColor}`}>{current.masteryScore}%</span>
            </div>
            <p className={`text-xs mt-2 leading-relaxed ${textColor}`}>
              {current.lessonTitle}
            </p>
          </div>
          <div className="flex items-center justify-between mt-3">
            <div className={`flex items-center gap-1.5 text-xs ${mutedColor}`}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12,6 12,12 16,14" />
              </svg>
              {formatRelativeTime(current.lastAccessedAt)}
            </div>
            <button onClick={() => navigate(`/workspace/${current.subjectCode}`)} className="btn-primary px-4 py-2 text-white text-[13px] flex items-center gap-2">
              Continue Lesson
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="5,3 19,12 5,21" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
