import type { ExamSubject } from '../../services/examinations.service';
import { useTheme } from '../../context/ThemeContext';

interface SubjectSelectorProps {
  subjects: ExamSubject[];
  selectedSubject: string;
  onSelect: (subjectId: string) => void;
}

const ACCENTS: Record<string, string> = {
  mathematics: 'from-blue-500 to-cyan-400',
  english: 'from-indigo-500 to-blue-400',
  kiswahili: 'from-teal-500 to-emerald-400',
  ict: 'from-cyan-500 to-sky-500',
  pe: 'from-indigo-500 to-purple-500',
  csl: 'from-emerald-500 to-teal-400',
  physics: 'from-amber-500 to-yellow-400',
  chemistry: 'from-orange-500 to-red-400',
  'computer-studies': 'from-sky-500 to-cyan-400',
};
const DEFAULT_ACCENT = 'from-slate-500 to-slate-400';

export default function SubjectSelector({ subjects, selectedSubject, onSelect }: SubjectSelectorProps) {
  const { theme } = useTheme();
  const textColor = theme === 'light' ? 'text-slate-900' : 'text-white';
  const mutedColor = theme === 'light' ? 'text-slate-500' : 'text-gray-400';

  return (
    <div className="glass-card p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className={`font-bold text-base ${textColor}`}>Subject Selection</h3>
          <p className={`text-xs mt-1 ${mutedColor}`}>Choose one of the nine supported examination subjects.</p>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {subjects.map((subject) => (
          <button
            key={subject.id}
            onClick={() => onSelect(subject.id)}
            className={`text-left p-3 rounded-xl border transition-all ${
              selectedSubject === subject.id
                ? 'bg-cyan-500/10 border-cyan-500/35 shadow-lg shadow-cyan-500/10'
                : theme === 'light'
                  ? 'bg-white border-slate-200 hover:border-cyan-400'
                  : 'bg-[rgba(17,24,50,0.55)] border-[rgba(56,78,135,0.18)] hover:border-cyan-500/30'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${ACCENTS[subject.colorKey] ?? DEFAULT_ACCENT} flex items-center justify-center text-xl shadow-lg shadow-cyan-500/10`}>
                {subject.icon}
              </div>
              <div className="min-w-0">
                <p className={`font-bold text-sm truncate ${textColor}`}>{subject.name}</p>
                <p className="text-cyan-600 text-xs font-bold">{subject.readiness}% ready</p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}