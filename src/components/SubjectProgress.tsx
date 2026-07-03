import { allSubjects, subjectProgressCards } from '../data/subjects';

function CircularProgress({ progress, color, size = 70 }: { progress: number; color: string; size?: number }) {
  const strokeWidth = 4;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="progress-ring">
        <circle cx={size / 2} cy={size / 2} r={radius} stroke="rgba(56, 78, 135, 0.25)" strokeWidth={strokeWidth} fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-white font-bold text-sm">{progress}%</span>
      </div>
    </div>
  );
}

const colorHex: Record<string, string> = {
  'text-blue-400': '#3b82f6',
  'text-purple-400': '#a855f7',
  'text-teal-400': '#14b8a6',
  'text-yellow-400': '#eab308',
  'text-indigo-400': '#6366f1',
  'text-cyan-400': '#22d3ee',
  'text-orange-400': '#f97316',
  'text-amber-400': '#f59e0b',
  'text-pink-400': '#ec4899',
};

export default function SubjectProgress() {
  // Show all 9 enrolled subjects (5 in first row via grid-cols-5, 4 in second row will reflow)
  // Use 9 in 5 columns; the grid will wrap onto 2 rows
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-bold text-lg">My Subjects</h3>
        <button className="text-cyan-400 text-xs font-medium hover:text-cyan-300 transition-colors">View all</button>
      </div>
      <div className="grid grid-cols-5 gap-3">
        {allSubjects.map((subject, i) => {
          const card = subjectProgressCards[i];
          const ringColor = colorHex[card.barClass.replace('bg-', 'text-')] || colorHex[subject.color];
          return (
            <div key={subject.id} className="subject-card p-4 flex flex-col items-center text-center">
              <div className="flex items-center gap-1.5 mb-3">
                <span className="text-sm">{subject.icon}</span>
                <span className="text-white text-xs font-semibold">{subject.shortName}</span>
              </div>
              <CircularProgress progress={subject.progress} color={ringColor} />
              <p className={`text-[11px] font-medium mt-2 ${card.statusColor}`}>{card.status}</p>
              <button className="flex items-center gap-1 text-gray-400 text-[11px] mt-1.5 hover:text-cyan-400 transition-colors">
                Continue
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12,5 19,12 12,19" />
                </svg>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
