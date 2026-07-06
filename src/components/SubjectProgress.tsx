import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { styleFor } from '../lib/subjectStyle';
import { aggregateSubjects, type LearningTopic } from '../services/learning.service';

function statusFor(progress: number): { label: string; color: string } {
  if (progress >= 70) return { label: 'Strong', color: 'text-blue-500' };
  if (progress >= 40) return { label: 'Good', color: 'text-green-500' };
  return { label: 'Needs focus', color: 'text-amber-500' };
}

function CircularProgress({ progress, hexColor, size = 70, theme }: { progress: number; hexColor: string; size?: number; theme: 'dark' | 'light' }) {
  const strokeWidth = 4;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;
  const textColor = theme === 'light' ? '#0f172a' : '#ffffff';

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="progress-ring">
        <circle cx={size / 2} cy={size / 2} r={radius} stroke={theme === 'light' ? '#e2e8f0' : 'rgba(56, 78, 135, 0.25)'} strokeWidth={strokeWidth} fill="none" />
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          stroke={hexColor} strokeWidth={strokeWidth} fill="none" strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="font-bold text-sm" style={{ color: textColor }}>{progress}%</span>
      </div>
    </div>
  );
}

const SUBJECT_HEX: Record<string, string> = {
  mathematics: '#3b82f6',
  english: '#a855f7',
  kiswahili: '#14b8a6',
  ict: '#22d3ee',
  pe: '#6366f1',
  csl: '#10b981',
  physics: '#f59e0b',
  chemistry: '#f97316',
  'computer-studies': '#0ea5e9',
};

interface SubjectProgressProps {
  topics: LearningTopic[];
}

export default function SubjectProgress({ topics }: SubjectProgressProps) {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const titleColor = theme === 'light' ? 'text-slate-900' : 'text-white';
  const textColor = theme === 'light' ? 'text-slate-700' : 'text-white';
  const mutedColor = theme === 'light' ? 'text-slate-500' : 'text-gray-400';

  const subjects = useMemo(() => aggregateSubjects(topics), [topics]);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className={`font-bold text-lg ${titleColor}`}>My Subjects</h3>
        <button onClick={() => navigate('/subjects')} className="text-cyan-600 text-xs font-medium hover:text-cyan-700 transition-colors">View all</button>
      </div>
      <div className="grid grid-cols-5 gap-3">
        {subjects.map((subject) => {
          const status = statusFor(subject.progress);
          const style = styleFor(subject.code);
          return (
            <div key={subject.code} className="subject-card p-4 flex flex-col items-center text-center">
              <div className="flex items-center gap-1.5 mb-3">
                <span className="text-sm">{style.icon}</span>
                <span className={`text-xs font-semibold ${textColor}`}>{subject.name}</span>
              </div>
              <CircularProgress progress={subject.progress} hexColor={SUBJECT_HEX[subject.code] ?? '#22d3ee'} theme={theme} />
              <p className={`text-[11px] font-medium mt-2 ${status.color}`}>{status.label}</p>
              <button onClick={() => navigate(`/workspace/${subject.code}`)} className={`flex items-center gap-1 text-[11px] mt-1.5 hover:text-cyan-500 transition-colors ${mutedColor}`}>
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
