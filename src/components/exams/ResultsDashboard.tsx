import type { ExamPaper } from '../../data/examData';
import { examAnalytics } from '../../data/examData';
import { useTheme } from '../../context/ThemeContext';

interface ResultsDashboardProps {
  paper: ExamPaper;
  answers: Record<string, string>;
  onReview: () => void;
  onRetry: () => void;
  onBack: () => void;
}

export default function ResultsDashboard({ paper, answers, onReview, onRetry, onBack }: ResultsDashboardProps) {
  const { theme } = useTheme();
  const textColor = theme === 'light' ? 'text-slate-900' : 'text-white';
  const mutedColor = theme === 'light' ? 'text-slate-500' : 'text-gray-400';
  const itemBg = theme === 'light' ? 'bg-white border-slate-200 shadow-sm' : 'bg-[rgba(17,24,50,0.55)] border-[rgba(56,78,135,0.18)]';
  const answered = paper.questions.filter((question) => answers[question.id]?.trim()).length;
  const correct = Math.max(1, Math.round(answered * 0.68));
  const incorrect = Math.max(0, answered - correct);
  const score = Math.min(100, Math.round((correct / paper.questions.length) * 100));
  const grade = score >= 80 ? 'A' : score >= 70 ? 'B' : score >= 60 ? 'C' : 'Needs Revision';

  return (
    <div className="space-y-4 overflow-y-auto pr-1">
      <div className="glass-card p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-cyan-600 text-xs font-bold uppercase">Results Dashboard</p>
            <h2 className={`text-2xl font-extrabold mt-1 ${textColor}`}>{paper.title}</h2>
            <p className={`text-sm mt-1 ${mutedColor}`}>Submitted successfully. Smart review and revision recommendations are ready.</p>
          </div>
          <div className="text-right">
            <p className="text-5xl font-extrabold text-cyan-600">{score}%</p>
            <p className={`text-sm font-bold ${textColor}`}>Grade {grade}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Metric label="Correct" value={String(correct)} color="text-green-600" />
        <Metric label="Incorrect" value={String(incorrect)} color="text-red-500" />
        <Metric label="Time Used" value={`${paper.durationMinutes - 18} min`} color="text-blue-600" />
        <Metric label="Completion" value={`${answered}/${paper.questions.length}`} color="text-purple-600" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="glass-card p-5">
          <h3 className={`font-bold text-base mb-4 ${textColor}`}>Topic Breakdown</h3>
          <div className="space-y-3">
            {examAnalytics.topicMastery.map((topic) => (
              <div key={topic.topic}>
                <div className="flex justify-between text-xs mb-1">
                  <span className={mutedColor}>{topic.topic}</span>
                  <span className="text-cyan-600 font-bold">{topic.value}%</span>
                </div>
                <div className="h-2 rounded-full bg-slate-200 overflow-hidden"><div className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full" style={{ width: `${topic.value}%` }} /></div>
              </div>
            ))}
          </div>
        </div>
        <div className="glass-card p-5">
          <h3 className={`font-bold text-base mb-4 ${textColor}`}>Personalized Revision</h3>
          <div className="space-y-2">
            {examAnalytics.recommendations.map((item) => (
              <button key={item} className={`w-full text-left rounded-xl border p-3 ${itemBg} hover:border-cyan-500/30 transition-all`}>
                <p className={`text-sm font-bold ${textColor}`}>{item}</p>
                <p className={`text-xs mt-1 ${mutedColor}`}>Open related lesson, video, flashcards, or guided practice.</p>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 pb-6">
        <button onClick={onBack} className="px-4 py-2 rounded-lg bg-slate-500/10 border border-slate-500/20 text-slate-500 text-xs font-bold">Back to Center</button>
        <button onClick={onRetry} className="px-4 py-2 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-600 text-xs font-bold">Retry Exam</button>
        <button onClick={onReview} className="px-4 py-2 rounded-lg bg-cyan-500 text-white text-xs font-bold">Smart Review</button>
      </div>
    </div>
  );
}

function Metric({ label, value, color }: { label: string; value: string; color: string }) {
  const { theme } = useTheme();
  const textColor = theme === 'light' ? 'text-slate-900' : 'text-white';
  return (
    <div className="glass-card p-4">
      <p className={`text-2xl font-extrabold ${color}`}>{value}</p>
      <p className={`text-xs font-semibold mt-1 ${textColor}`}>{label}</p>
    </div>
  );
}