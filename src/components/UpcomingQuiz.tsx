import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { styleFor } from '../lib/subjectStyle';
import type { LearningTopic } from '../services/learning.service';

interface UpcomingQuizProps {
  topics: LearningTopic[];
}

export default function UpcomingQuiz({ topics }: UpcomingQuizProps) {
  const navigate = useNavigate();

  const recommendation = useMemo(
    () => [...topics].filter((t) => !t.lastAccessedAt).sort((a, b) => a.lessonOrder - b.lessonOrder)[0],
    [topics],
  );

  return (
    <div className="glass-card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-bold text-base">Practice Recommendation</h3>
        <button onClick={() => navigate('/my-learning')} className="text-cyan-400 text-xs font-medium hover:text-cyan-300 transition-colors">View all</button>
      </div>
      {recommendation ? (
        <>
          <div className="p-3.5 rounded-xl bg-[rgba(17,24,50,0.6)] border border-[rgba(56,78,135,0.2)]">
            <div className="flex items-center gap-2.5 mb-1.5">
              <span className={`w-6 h-6 rounded-lg border flex items-center justify-center text-xs ${styleFor(recommendation.subjectCode).iconColor}`}>
                {styleFor(recommendation.subjectCode).icon}
              </span>
              <h4 className="text-white font-semibold text-sm">{recommendation.topicTitle}</h4>
            </div>
            <div className="flex items-center gap-3 mt-2.5">
              <span className="px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-400 text-[10px] font-semibold">
                {recommendation.subjectName}
              </span>
              <span className="text-gray-500 text-xs">{recommendation.lessonTitle}</span>
            </div>
          </div>
          <button onClick={() => navigate(`/workspace/${recommendation.subjectCode}`)} className="w-full btn-primary mt-4 py-2.5 text-white text-sm font-semibold">
            Start Revision
          </button>
        </>
      ) : (
        <p className="text-gray-500 text-xs text-center py-4">You've started every topic. Great work!</p>
      )}
    </div>
  );
}
