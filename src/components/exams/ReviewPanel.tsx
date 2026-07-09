import { useState } from 'react';
import type { ExamPaper, ExamQuestion, GradedAnswer } from '../../services/examinations.service';
import { useTheme } from '../../context/ThemeContext';

interface ReviewPanelProps {
  paper: ExamPaper;
  questions: ExamQuestion[];
  answers: Record<string, string>;
  gradedAnswers: GradedAnswer[];
  onBackToResults: () => void;
  onOpenRelatedLesson: () => void;
  onGenerateSimilar: (questionId: string) => void;
}

export default function ReviewPanel({ paper, questions, answers, gradedAnswers, onBackToResults, onOpenRelatedLesson, onGenerateSimilar }: ReviewPanelProps) {
  const { theme } = useTheme();
  const [activeIndex, setActiveIndex] = useState(0);
  const question = questions[activeIndex] ?? questions[0];
  const graded = question ? gradedAnswers.find((a) => a.questionId === question.id) : undefined;
  const textColor = theme === 'light' ? 'text-slate-900' : 'text-white';
  const mutedColor = theme === 'light' ? 'text-slate-500' : 'text-gray-400';
  const panelBg = theme === 'light' ? 'bg-white border-slate-200 shadow-sm' : 'bg-[rgba(17,24,50,0.55)] border-[rgba(56,78,135,0.18)]';

  const resultLabel = graded === undefined ? 'Not answered' : graded.isCorrect === true ? 'Correct' : graded.isCorrect === false ? 'Incorrect' : 'Pending review';
  const resultColor = graded?.isCorrect === true ? textColor : graded?.isCorrect === false ? 'text-red-500' : textColor;

  if (!question) {
    return (
      <div className="glass-card p-6 flex-1 flex flex-col items-center justify-center gap-3">
        <p className={`text-sm ${mutedColor}`}>No questions to review for this attempt.</p>
        <button onClick={onBackToResults} className="px-4 py-2 rounded-lg bg-slate-500/10 border border-slate-500/20 text-slate-500 text-xs font-bold">Back to Results</button>
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row gap-4 flex-1 min-h-0 overflow-y-auto sm:overflow-visible">
      <aside className="w-full sm:w-[230px] flex-shrink-0 glass-card p-4">
        <h3 className={`font-bold text-base mb-3 ${textColor}`}>Smart Review</h3>
        <div className="space-y-2">
          {questions.map((item, index) => (
            <button key={item.id} onClick={() => setActiveIndex(index)} className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold ${activeIndex === index ? 'bg-cyan-500 text-white' : 'bg-cyan-500/10 text-cyan-600'}`}>
              Question {index + 1} • {item.marks} marks
            </button>
          ))}
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto pr-1 space-y-4">
        <div className="glass-card p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-cyan-600 text-xs font-bold uppercase">Review Question {activeIndex + 1}</p>
              <h2 className={`text-xl font-extrabold mt-1 ${textColor}`}>{question.questionText}</h2>
              <p className={`text-xs mt-1 ${mutedColor}`}>{paper.subjectName} • {question.questionType.replace('_', ' ')}</p>
            </div>
            <button onClick={onBackToResults} className="px-4 py-2 rounded-lg bg-slate-500/10 border border-slate-500/20 text-slate-500 text-xs font-bold">Back to Results</button>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <InfoCard title="Your Answer" value={answers[question.id] || 'No answer submitted'} />
          <InfoCard title="Result" value={resultLabel} valueClassName={resultColor} />
        </div>
        <div className={`rounded-2xl border p-5 ${panelBg}`}>
          <h3 className={`font-bold text-base ${textColor}`}>Marking Scheme</h3>
          <p className={`text-sm mt-2 ${mutedColor}`}>{question.markingScheme ?? 'No marking scheme provided for this question.'}</p>
        </div>
        {graded?.aiFeedback && (
          <div className={`rounded-2xl border p-5 ${panelBg}`}>
            <h3 className={`font-bold text-base ${textColor}`}>AI Feedback on Your Answer</h3>
            <p className={`text-sm mt-2 ${mutedColor}`}>{graded.aiFeedback}</p>
          </div>
        )}
        <div className={`rounded-2xl border p-5 ${panelBg}`}>
          <h3 className={`font-bold text-base ${textColor}`}>AI Explanation</h3>
          <p className={`text-sm mt-2 ${mutedColor}`}>{question.aiExplanation ?? 'No AI explanation available for this question yet.'}</p>
          <div className="flex flex-wrap gap-2 mt-4">
            <button onClick={onOpenRelatedLesson} className="px-3 py-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-600 text-xs font-bold">Open Related Lesson</button>
            <button onClick={() => onGenerateSimilar(question.id)} className="px-3 py-2 rounded-lg bg-green-500/10 border border-green-500/20 text-green-600 text-xs font-bold">Generate Similar Question</button>
          </div>
        </div>
      </main>
    </div>
  );
}

function InfoCard({ title, value, valueClassName }: { title: string; value: string; valueClassName?: string }) {
  const { theme } = useTheme();
  const textColor = theme === 'light' ? 'text-slate-900' : 'text-white';
  const mutedColor = theme === 'light' ? 'text-slate-500' : 'text-gray-400';
  return (
    <div className="glass-card p-5">
      <p className="text-cyan-600 text-xs font-bold uppercase">{title}</p>
      <p className={`text-sm mt-2 font-bold ${valueClassName ?? (title === 'Your Answer' ? mutedColor : textColor)}`}>{value}</p>
    </div>
  );
}
