import type { ExamPaper } from '../../data/examData';
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
  const cardBg = theme === 'light' ? 'bg-white border-slate-200 shadow-sm' : 'bg-[rgba(17,24,50,0.6)] border-[rgba(56,78,135,0.2)]';
  const innerCardBg = theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-[rgba(17,24,50,0.4)] border-[rgba(56,78,135,0.15)]';

  const answered = paper.questions.filter((question) => answers[question.id]?.trim()).length;
  const correct = Math.max(1, Math.round(answered * 0.72)); // Mock calculation
  const incorrect = Math.max(0, answered - correct);
  const score = Math.min(100, Math.round((correct / paper.questions.length) * 100));
  const grade = score >= 80 ? 'A' : score >= 70 ? 'B' : score >= 60 ? 'C' : score >= 50 ? 'D' : 'E';
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="flex gap-6 mt-2 flex-1 min-h-0">
      {/* Main Content */}
      <div className="flex-1 min-w-0 space-y-4 overflow-y-auto pr-1">
        
        {/* Header Card */}
        <div className={`${cardBg} rounded-2xl p-6 flex items-center justify-between`}>
          <div>
            <span className="px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-[10px] font-bold uppercase tracking-wider">
              Exam Completed
            </span>
            <h2 className={`text-2xl font-extrabold mt-3 ${textColor}`}>{paper.title}</h2>
            <p className={`${mutedColor} text-sm mt-1`}>You completed this examination in {paper.durationMinutes - 15}m.</p>
            <div className="flex items-center gap-3 mt-5">
              <button onClick={onReview} className="px-5 py-2.5 rounded-xl bg-cyan-500 text-white text-sm font-bold hover:bg-cyan-400 transition-colors shadow-lg shadow-cyan-500/20">
                Smart Review
              </button>
              <button onClick={onBack} className="px-5 py-2.5 rounded-xl bg-transparent border border-[rgba(56,78,135,0.3)] text-gray-300 text-sm font-bold hover:bg-[rgba(56,78,135,0.1)] transition-colors">
                Back to Dashboard
              </button>
            </div>
          </div>
          
          <div className="flex items-center gap-8">
            <div className="text-center">
              <p className="text-5xl font-extrabold text-white">{grade}</p>
              <p className="text-gray-500 text-xs font-bold mt-1 uppercase tracking-wider">Grade</p>
            </div>
            <div className="relative w-28 h-28 flex items-center justify-center">
              <svg className="transform -rotate-90 w-full h-full">
                <circle cx="56" cy="56" r={radius} stroke="rgba(56,78,135,0.2)" strokeWidth="8" fill="transparent" />
                <circle cx="56" cy="56" r={radius} stroke="#22c55e" strokeWidth="8" fill="transparent" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} strokeLinecap="round" className="transition-all duration-1000 ease-out" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-extrabold text-white">{score}%</span>
                <span className="text-[10px] text-gray-500 font-bold uppercase">Score</span>
              </div>
            </div>
          </div>
        </div>

        {/* Analytics Row */}
        <div className="grid grid-cols-5 gap-4">
          {/* Topic Breakdown */}
          <div className={`${cardBg} rounded-2xl p-5 col-span-3`}>
            <h3 className={`font-bold text-base mb-5 ${textColor}`}>Topic Breakdown</h3>
            <div className="space-y-5">
              {[
                { topic: 'Algebra', value: 85 },
                { topic: 'Trigonometry', value: 40 },
                { topic: 'Statistics', value: 100 }
              ].map((item) => (
                <div key={item.topic}>
                  <div className="flex justify-between text-xs mb-2">
                    <span className={`font-semibold ${textColor}`}>{item.topic}</span>
                    <span className={`font-bold ${item.value < 50 ? 'text-red-500' : 'text-green-500'}`}>{item.value}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-[rgba(56,78,135,0.25)] overflow-hidden">
                    <div className={`h-full rounded-full ${item.value < 50 ? 'bg-red-500' : 'bg-green-500'}`} style={{ width: `${item.value}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Performance Analytics */}
          <div className={`${cardBg} rounded-2xl p-5 col-span-2`}>
            <h3 className={`font-bold text-base mb-5 ${textColor}`}>Performance Analytics</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className={`${innerCardBg} rounded-xl p-4`}>
                <p className="text-gray-500 text-[10px] font-bold uppercase mb-1">Correct Answers</p>
                <p className="text-2xl font-extrabold text-green-400">{correct}<span className="text-sm text-gray-500 font-normal">/{paper.questions.length}</span></p>
              </div>
              <div className={`${innerCardBg} rounded-xl p-4`}>
                <p className="text-gray-500 text-[10px] font-bold uppercase mb-1">Incorrect Answers</p>
                <p className="text-2xl font-extrabold text-red-400">{incorrect}<span className="text-sm text-gray-500 font-normal">/{paper.questions.length}</span></p>
              </div>
              <div className={`${innerCardBg} rounded-xl p-4`}>
                <p className="text-gray-500 text-[10px] font-bold uppercase mb-1">Time Per Question</p>
                <p className="text-2xl font-extrabold text-white">3.2<span className="text-sm text-gray-500 font-normal">m</span></p>
              </div>
              <div className={`${innerCardBg} rounded-xl p-4`}>
                <p className="text-gray-500 text-[10px] font-bold uppercase mb-1">Percentile Rank</p>
                <p className="text-2xl font-extrabold text-white">Top 15%</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Sidebar */}
      <div className="w-[300px] flex-shrink-0 space-y-4 overflow-y-auto pb-6">
        
        {/* AI Revision Plan */}
        <div className={`${cardBg} rounded-2xl p-5`}>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-yellow-400">✨</span>
            <h3 className={`font-bold text-base ${textColor}`}>AI Revision Plan</h3>
          </div>
          <p className={`${mutedColor} text-xs leading-relaxed mb-4`}>
            Based on your mock performance, you should focus on Geometry and Trigonometry. I have prepared a personalized study plan for you.
          </p>
          <button onClick={onRetry} className="w-full py-2.5 rounded-xl bg-cyan-500 text-white text-xs font-bold hover:bg-cyan-400 transition-colors shadow-lg shadow-cyan-500/20">
            Start AI Revision
          </button>
        </div>

        {/* Recommended Lessons */}
        <div className={`${cardBg} rounded-2xl p-5`}>
          <h3 className={`font-bold text-base mb-4 ${textColor}`}>Recommended Lessons</h3>
          <div className="space-y-3">
            {[
              { title: 'Trigonometric Ratios', icon: '▶', color: 'text-purple-400 border-purple-500/30 bg-purple-500/10' },
              { title: 'Completing the Square', icon: '▶', color: 'text-blue-400 border-blue-500/30 bg-blue-500/10' }
            ].map((lesson) => (
              <div key={lesson.title} className={`flex items-center gap-3 p-3 rounded-xl border ${innerCardBg} hover:border-cyan-500/30 transition-all cursor-pointer`}>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${lesson.color}`}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21" /></svg>
                </div>
                <p className={`text-xs font-semibold ${textColor}`}>{lesson.title}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}