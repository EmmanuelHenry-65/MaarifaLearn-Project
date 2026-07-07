import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import type { LearningTopic } from '../services/learning.service';

interface AITutorProps {
  topics: LearningTopic[];
}

export default function AITutor({ topics }: AITutorProps) {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const titleColor = theme === 'light' ? 'text-slate-900' : 'text-white';
  const textColor = theme === 'light' ? 'text-slate-600' : 'text-gray-400';
  const mutedColor = theme === 'light' ? 'text-slate-500' : 'text-gray-500';
  const inputBg = theme === 'light' ? 'bg-slate-100 border-slate-300 text-slate-900 placeholder-slate-400' : 'bg-[rgba(17,24,50,0.8)] border-[rgba(56,78,135,0.3)] text-gray-300 placeholder-gray-600';
  const suggestionBg = theme === 'light' ? 'bg-slate-50 border-slate-200 text-slate-700 hover:border-cyan-400 hover:text-slate-900' : 'bg-[rgba(17,24,50,0.5)] border-[rgba(56,78,135,0.2)] text-gray-400 hover:border-cyan-500/30 hover:text-gray-300';

  const focusTopic = useMemo(
    () =>
      [...topics].filter((t) => t.lastAccessedAt).sort((a, b) => new Date(b.lastAccessedAt as string).getTime() - new Date(a.lastAccessedAt as string).getTime())[0]
      ?? [...topics].sort((a, b) => a.lessonOrder - b.lessonOrder)[0],
    [topics],
  );

  const suggestions = useMemo(() => {
    if (!focusTopic) return ['Explain a topic to me', 'Quiz me on something I studied recently', 'Help me plan my study session'];
    return [
      `Explain ${focusTopic.topicTitle} simply`,
      `Quiz me on ${focusTopic.subjectName}`,
      `Help me understand ${focusTopic.lessonTitle}`,
    ];
  }, [focusTopic]);

  const goToTutor = () => navigate('/ai-tutor');

  return (
    <div className="glass-card p-5 relative overflow-hidden">
      <div className="absolute top-3 right-3 text-cyan-400 text-[10px] animate-pulse">✦</div>
      <div className="absolute top-8 right-8 text-cyan-300 text-[6px] animate-pulse" style={{ animationDelay: '0.5s' }}>✦</div>

      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className={`font-bold text-base ${titleColor}`}>Ask your AI Tutor</h3>
          <p className={`text-xs mt-1 leading-relaxed ${textColor}`}>
            I'm here to help you understand any topic!
          </p>
        </div>
        <div className="w-16 h-16 rounded-full flex-shrink-0 animate-float flex items-center justify-center text-3xl bg-cyan-500/10 border border-cyan-500/30">
          🤖
        </div>
      </div>

      <form
        className="flex items-center gap-2 mb-4 mt-2"
        onSubmit={(e) => {
          e.preventDefault();
          goToTutor();
        }}
      >
        <div className="flex-1 relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask anything about your curriculum..."
            className={`w-full px-3 py-2.5 rounded-xl border text-xs focus:outline-none focus:border-cyan-500/40 ${inputBg}`}
          />
        </div>
        <button type="submit" className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center flex-shrink-0 hover:shadow-lg hover:shadow-cyan-500/20 transition-all">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
          </svg>
        </button>
      </form>

      <div>
        <p className={`text-xs font-medium mb-2 ${mutedColor}`}>Try these</p>
        <div className="space-y-2">
          {suggestions.map((s, i) => (
            <button
              key={i}
              onClick={() => goToTutor()}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl border text-xs transition-all text-left ${suggestionBg}`}
            >
              <span className="leading-relaxed">{s}</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-cyan-500 flex-shrink-0 ml-2">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12,5 19,12 12,19" />
              </svg>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
