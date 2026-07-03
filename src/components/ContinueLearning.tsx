import { continueLearning, getSubject } from '../data/subjects';

export default function ContinueLearning() {
  // Featured lesson = first item (Mathematics — Quadratic Equations)
  const featured = continueLearning[0];
  const subj = getSubject(featured.subjectId);

  return (
    <div className="glass-card p-5 h-full">
      <h3 className="text-white font-bold text-lg mb-3">Continue Learning</h3>
      <div className="flex gap-4">
        <div className={`w-36 h-36 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center text-6xl bg-gradient-to-br ${subj.iconBg.replace('border-', 'from-').replace('/30', '/20')}`}>
          <span>{subj.icon}</span>
        </div>
        <div className="flex-1 flex flex-col justify-between min-w-0">
          <div>
            <span className={`text-xs font-semibold ${subj.color}`}>{subj.shortName}</span>
            <h4 className="text-white font-bold text-base mt-0.5">{featured.topic}</h4>
            <div className="flex items-center gap-3 mt-2.5">
              <div className="flex-1 h-2 rounded-full bg-[rgba(56,78,135,0.3)] overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-cyan-400" style={{ width: `${featured.progress}%` }} />
              </div>
              <span className="text-gray-400 text-xs font-medium whitespace-nowrap">{featured.progress}%</span>
            </div>
            <p className="text-gray-400 text-xs mt-2 leading-relaxed">
              {subj.description}
            </p>
          </div>
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-1.5 text-gray-500 text-xs">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12,6 12,12 16,14" />
              </svg>
              {featured.timeLeft}
            </div>
            <button className="btn-primary px-4 py-2 text-white text-[13px] flex items-center gap-2">
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
