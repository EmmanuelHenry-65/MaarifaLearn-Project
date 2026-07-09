import type { ExamPaper, ExamQuestion, AttemptResult, GradedAnswer } from '../../services/examinations.service';
import { useTheme } from '../../context/ThemeContext';

interface ResultsDashboardProps {
  paper: ExamPaper;
  questions: ExamQuestion[];
  gradedAnswers: GradedAnswer[];
  result: AttemptResult;
  elapsedMinutes: number;
  gradingEssays?: boolean;
  onReview: () => void;
  onRetry: () => void;
  onRetryGrading: () => void;
  onBack: () => void;
}

export default function ResultsDashboard({ paper, questions, gradedAnswers, result, elapsedMinutes, gradingEssays, onReview, onRetry, onRetryGrading, onBack }: ResultsDashboardProps) {
  const { theme } = useTheme();
  const textColor = theme === 'light' ? 'text-slate-900' : 'text-white';
  const mutedColor = theme === 'light' ? 'text-slate-500' : 'text-gray-400';
  const cardBg = theme === 'light' ? 'bg-white border-slate-200 shadow-sm' : 'bg-[rgba(17,24,50,0.6)] border-[rgba(56,78,135,0.2)]';
  const innerCardBg = theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-[rgba(17,24,50,0.4)] border-[rgba(56,78,135,0.15)]';

  const answersByQuestion = new Map(gradedAnswers.map((a) => [a.questionId, a]));
  const autoGraded = gradedAnswers.filter((a) => a.isCorrect !== null);
  const correct = autoGraded.filter((a) => a.isCorrect).length;
  const incorrect = autoGraded.length - correct;
  const pendingReview = gradedAnswers.filter((a) => a.isCorrect === null).length;
  const score = Math.round(result.percentage);
  const grade = result.grade;
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;
  const timePerQuestion = questions.length ? (elapsedMinutes / questions.length).toFixed(1) : '0.0';

  return (
    <div className="flex flex-col lg:flex-row gap-6 mt-2 flex-1 min-h-0 overflow-y-auto lg:overflow-visible">
      {/* Main Content */}
      <div className="flex-1 min-w-0 space-y-4 lg:overflow-y-auto pr-1">

        {/* Header Card */}
        <div className={`${cardBg} rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5`}>
          <div>
            <span className="px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-[10px] font-bold uppercase tracking-wider">
              Exam Completed
            </span>
            <h2 className={`text-2xl font-extrabold mt-3 ${textColor}`}>{paper.title}</h2>
            <p className={`${mutedColor} text-sm mt-1`}>You completed this examination in {elapsedMinutes}m.</p>
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
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
          {/* Question Breakdown */}
          <div className={`${cardBg} rounded-2xl p-5 sm:col-span-3`}>
            <h3 className={`font-bold text-base mb-5 ${textColor}`}>Question Breakdown</h3>
            <div className="space-y-3">
              {questions.map((q, i) => {
                const graded = answersByQuestion.get(q.id);
                const label = graded?.isCorrect === true ? 'Correct' : graded?.isCorrect === false ? 'Incorrect' : 'Pending review';
                const color = graded?.isCorrect === true ? 'text-green-500' : graded?.isCorrect === false ? 'text-red-500' : 'text-amber-500';
                const barColor = graded?.isCorrect === true ? 'bg-green-500' : graded?.isCorrect === false ? 'bg-red-500' : 'bg-amber-500';
                const width = graded ? (graded.isCorrect === null ? 50 : graded.isCorrect ? 100 : 0) : 0;
                return (
                  <div key={q.id}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className={`font-semibold ${textColor}`}>Question {i + 1} ({q.marks} marks)</span>
                      <span className={`font-bold ${color}`}>{label}</span>
                    </div>
                    <div className="h-2 rounded-full bg-[rgba(56,78,135,0.25)] overflow-hidden">
                      <div className={`h-full rounded-full ${barColor}`} style={{ width: `${width}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Performance Analytics */}
          <div className={`${cardBg} rounded-2xl p-5 sm:col-span-2`}>
            <h3 className={`font-bold text-base mb-5 ${textColor}`}>Performance Analytics</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className={`${innerCardBg} rounded-xl p-4`}>
                <p className="text-gray-500 text-[10px] font-bold uppercase mb-1">Correct Answers</p>
                <p className="text-2xl font-extrabold text-green-400">{correct}<span className="text-sm text-gray-500 font-normal">/{autoGraded.length}</span></p>
              </div>
              <div className={`${innerCardBg} rounded-xl p-4`}>
                <p className="text-gray-500 text-[10px] font-bold uppercase mb-1">Incorrect Answers</p>
                <p className="text-2xl font-extrabold text-red-400">{incorrect}<span className="text-sm text-gray-500 font-normal">/{autoGraded.length}</span></p>
              </div>
              <div className={`${innerCardBg} rounded-xl p-4`}>
                <p className="text-gray-500 text-[10px] font-bold uppercase mb-1">Time Per Question</p>
                <p className="text-2xl font-extrabold text-white">{timePerQuestion}<span className="text-sm text-gray-500 font-normal">m</span></p>
              </div>
              <div className={`${innerCardBg} rounded-xl p-4`}>
                <p className="text-gray-500 text-[10px] font-bold uppercase mb-1">Pending Review</p>
                <p className="text-2xl font-extrabold text-white">{pendingReview}<span className="text-sm text-gray-500 font-normal"> questions</span></p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Sidebar */}
      <div className="w-full lg:w-[300px] flex-shrink-0 space-y-4 lg:overflow-y-auto pb-6">

        {/* AI Revision Plan */}
        <div className={`${cardBg} rounded-2xl p-5`}>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-yellow-400">✨</span>
            <h3 className={`font-bold text-base ${textColor}`}>AI Revision Plan</h3>
          </div>
          <p className={`${mutedColor} text-xs leading-relaxed mb-4`}>
            {incorrect > 0
              ? `You got ${incorrect} of ${autoGraded.length} auto-graded questions wrong. Retry this paper to reinforce ${paper.subjectName}, or ask the AI Tutor about the questions you missed.`
              : `Strong work on ${paper.subjectName}. Retry this paper anytime to keep it fresh, or move on to another paper.`}
          </p>
          <button onClick={onRetry} className="w-full py-2.5 rounded-xl bg-cyan-500 text-white text-xs font-bold hover:bg-cyan-400 transition-colors shadow-lg shadow-cyan-500/20">
            Retry This Paper
          </button>
        </div>

        {/* Pending Review Notice */}
        {pendingReview > 0 && (
          <div className={`${cardBg} rounded-2xl p-5`}>
            <h3 className={`font-bold text-base mb-2 ${textColor}`}>{gradingEssays ? 'AI Grading In Progress' : 'Pending Review'}</h3>
            <p className={`${mutedColor} text-xs leading-relaxed`}>
              {gradingEssays
                ? `The AI is grading ${pendingReview} short-answer/essay ${pendingReview === 1 ? 'question' : 'questions'} against the marking scheme now — your score above will update in a few seconds.`
                : `${pendingReview} short-answer/essay ${pendingReview === 1 ? 'question' : 'questions'} on this paper could not be graded automatically. Open Smart Review to see the marking scheme and your answer, or retry AI grading below.`}
            </p>
            {!gradingEssays && (
              <button
                onClick={onRetryGrading}
                className="w-full mt-3 py-2.5 rounded-xl bg-amber-500 text-white text-xs font-bold hover:bg-amber-400 transition-colors"
              >
                Retry Grading
              </button>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
