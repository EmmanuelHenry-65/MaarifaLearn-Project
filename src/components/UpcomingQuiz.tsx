import { upcomingQuizzes, getSubject } from '../data/subjects';

export default function UpcomingQuiz() {
  const first = upcomingQuizzes[0];
  const sub = getSubject(first.subjectId);
  return (
    <div className="glass-card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-bold text-base">Upcoming Quiz</h3>
        <button className="text-cyan-400 text-xs font-medium hover:text-cyan-300 transition-colors">View all</button>
      </div>
      <div className="p-3.5 rounded-xl bg-[rgba(17,24,50,0.6)] border border-[rgba(56,78,135,0.2)]">
        <h4 className="text-white font-semibold text-sm">{first.title}</h4>
        <div className="flex items-center gap-3 mt-2.5">
          <div className="flex items-center gap-1.5 text-gray-400 text-xs">
            <span className={`text-sm ${sub.color}`}>{sub.icon}</span>
            <span>{sub.shortName}</span>
          </div>
          <div className="flex items-center gap-1.5 text-gray-400 text-xs">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            {first.date}
          </div>
          <span className="px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-400 text-[10px] font-semibold">
            {first.questions} Questions
          </span>
        </div>
      </div>
      <button className="w-full btn-primary mt-4 py-2.5 text-white text-sm font-semibold">
        Start Revision
      </button>
    </div>
  );
}
