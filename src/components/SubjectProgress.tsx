interface Subject {
  name: string;
  progress: number;
  icon: string;
  color: string;
  bgColor: string;
  status: string;
  statusColor: string;
}

const subjects: Subject[] = [
  { name: 'Mathematics', progress: 84, icon: '📐', color: '#3b82f6', bgColor: 'from-blue-500/20 to-blue-600/10', status: 'Strong', statusColor: 'text-blue-400' },
  { name: 'Biology', progress: 61, icon: '🧬', color: '#22c55e', bgColor: 'from-green-500/20 to-green-600/10', status: 'Good', statusColor: 'text-green-400' },
  { name: 'Physics', progress: 39, icon: '⚛️', color: '#f59e0b', bgColor: 'from-amber-500/20 to-amber-600/10', status: 'Needs focus', statusColor: 'text-amber-400' },
  { name: 'Chemistry', progress: 75, icon: '🧪', color: '#a855f7', bgColor: 'from-purple-500/20 to-purple-600/10', status: 'Good', statusColor: 'text-purple-400' },
  { name: 'English', progress: 68, icon: '📝', color: '#f97316', bgColor: 'from-orange-500/20 to-orange-600/10', status: 'Good', statusColor: 'text-orange-400' },
];

function CircularProgress({ progress, color, size = 70 }: { progress: number; color: string; size?: number }) {
  const strokeWidth = 4;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="progress-ring">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(56, 78, 135, 0.25)"
          strokeWidth={strokeWidth}
          fill="none"
        />
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

export default function SubjectProgress() {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-bold text-lg">My Subjects</h3>
        <button className="text-cyan-400 text-xs font-medium hover:text-cyan-300 transition-colors">View all</button>
      </div>
      <div className="grid grid-cols-5 gap-3">
        {subjects.map((subject) => (
          <div key={subject.name} className="subject-card p-4 flex flex-col items-center text-center">
            <div className="flex items-center gap-1.5 mb-3">
              <span className="text-sm">{subject.icon}</span>
              <span className="text-white text-xs font-semibold">{subject.name}</span>
            </div>
            <CircularProgress progress={subject.progress} color={subject.color} />
            <p className={`text-[11px] font-medium mt-2 ${subject.statusColor}`}>{subject.status}</p>
            <button className="flex items-center gap-1 text-gray-400 text-[11px] mt-1.5 hover:text-cyan-400 transition-colors">
              Continue
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12,5 19,12 12,19" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
