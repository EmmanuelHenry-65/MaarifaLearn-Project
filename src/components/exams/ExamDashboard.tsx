import type { ExamPaper, ExamSubject } from '../../services/examinations.service';
import { paperTypeLabel, difficultyLabel } from '../../services/examinations.service';
import { useTheme } from '../../context/ThemeContext';

interface ExamDashboardProps {
  currentSubject: ExamSubject;
  recentExams: ExamPaper[];
  recommendedPapers: ExamPaper[];
  onContinue: (paper: ExamPaper) => void;
  onSelectRecommended: (paper: ExamPaper) => void;
}

export default function ExamDashboard({ currentSubject, recentExams, recommendedPapers, onContinue, onSelectRecommended }: ExamDashboardProps) {
  const { theme } = useTheme();
  const textColor = theme === 'light' ? 'text-slate-900' : 'text-white';
  const mutedColor = theme === 'light' ? 'text-slate-500' : 'text-gray-400';
  const itemBg = theme === 'light' ? 'bg-white border-slate-200 shadow-sm' : 'bg-[rgba(17,24,50,0.55)] border-[rgba(56,78,135,0.18)]';
  const continuePaper = recentExams.find((paper) => paper.completionStatus === 'In Progress') ?? recentExams[0];
  const attemptedRecent = recentExams.filter((paper) => paper.latestScore !== null);
  const averageMarks = attemptedRecent.length
    ? Math.round(attemptedRecent.reduce((sum, paper) => sum + (paper.latestScore ?? 0), 0) / attemptedRecent.length)
    : 0;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-4">
        <SummaryCard label="Current Subject" value={currentSubject.name} icon={currentSubject.icon} />
        <SummaryCard label="Exam Readiness" value={`${currentSubject.readiness}%`} icon="⚡" />
        <SummaryCard label="Average Marks" value={`${averageMarks}%`} icon="📈" />
        <SummaryCard label="Recent Exams" value={String(recentExams.length)} icon="📝" />
      </div>

      <div className="grid grid-cols-5 gap-4">
        <div className="glass-card p-5 col-span-3">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className={`font-bold text-base ${textColor}`}>Continue Last Exam</h3>
              <p className={`text-xs mt-1 ${mutedColor}`}>Resume from your last active attempt.</p>
            </div>
            <button onClick={() => onContinue(continuePaper)} className="px-4 py-2 rounded-lg bg-cyan-500 text-white text-xs font-bold hover:bg-cyan-600">Continue</button>
          </div>
          <div className={`rounded-xl border p-4 ${itemBg}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`font-bold ${textColor}`}>{continuePaper.title}</p>
                <p className={`text-xs mt-1 ${mutedColor}`}>{continuePaper.year} • {continuePaper.term} • {continuePaper.durationMinutes} min</p>
              </div>
              <span className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-600 text-xs font-bold">{continuePaper.completionStatus}</span>
            </div>
            <div className="mt-4 h-2 rounded-full bg-slate-200/70 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full" style={{ width: `${continuePaper.latestScore ?? currentSubject.readiness}%` }} />
            </div>
          </div>
        </div>

        <div className="glass-card p-5 col-span-2">
          <h3 className={`font-bold text-base mb-3 ${textColor}`}>Recent Papers in {currentSubject.name}</h3>
          <div className="space-y-2">
            {recentExams.length === 0 && <p className={`text-xs ${mutedColor}`}>No papers yet for this subject.</p>}
            {recentExams.map((paper) => (
              <div key={paper.id}>
                <div className="flex justify-between text-xs mb-1">
                  <span className={mutedColor}>{paper.title}</span>
                  <span className="text-cyan-600 font-bold">{paper.latestScore !== null ? `${paper.latestScore}%` : paper.completionStatus}</span>
                </div>
                <div className="h-1.5 rounded-full bg-slate-200/70 overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400" style={{ width: `${paper.latestScore ?? 0}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="glass-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className={`font-bold text-base ${textColor}`}>Recommended Papers</h3>
          <span className="text-cyan-600 text-xs font-bold">Personalized</span>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {recommendedPapers.map((paper) => (
            <button key={paper.id} onClick={() => onSelectRecommended(paper)} className={`text-left rounded-xl border p-3 hover:border-cyan-500/30 transition-all ${itemBg}`}>
              <p className={`font-bold text-sm ${textColor}`}>{paper.title}</p>
              <p className={`text-xs mt-1 ${mutedColor}`}>{paperTypeLabel(paper.paperType)} • {difficultyLabel(paper.difficulty)}</p>
              <p className="text-cyan-600 text-xs font-bold mt-2">{paper.latestScore !== null ? `Your score ${paper.latestScore}%` : `Subject readiness ${currentSubject.readiness}%`}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ label, value, icon }: { label: string; value: string; icon: string }) {
  const { theme } = useTheme();
  const textColor = theme === 'light' ? 'text-slate-900' : 'text-white';
  const mutedColor = theme === 'light' ? 'text-slate-500' : 'text-gray-400';

  return (
    <div className="glass-card p-4 flex items-center gap-3">
      <div className="w-11 h-11 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-600 flex items-center justify-center text-xl">{icon}</div>
      <div>
        <p className={`font-extrabold text-lg leading-none ${textColor}`}>{value}</p>
        <p className={`text-xs mt-1 ${mutedColor}`}>{label}</p>
      </div>
    </div>
  );
}