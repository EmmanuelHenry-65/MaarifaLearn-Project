import { useEffect, useMemo, useState } from 'react';
import type { ExamMode, ExamPaper, ExamQuestion } from '../../data/examData';
import { useTheme } from '../../context/ThemeContext';

interface ExamInterfaceProps {
  paper: ExamPaper;
  mode: ExamMode;
  answers: Record<string, string>;
  flags: Record<string, boolean>;
  bookmarks: Record<string, boolean>;
  onAnswer: (questionId: string, answer: string) => void;
  onToggleFlag: (questionId: string) => void;
  onToggleBookmark: (questionId: string) => void;
  onSubmit: () => void;
  onOpenAI: () => void;
  onQuestionChange: (question: ExamQuestion) => void;
}

export default function ExamInterface({ paper, mode, answers, flags, bookmarks, onAnswer, onToggleFlag, onToggleBookmark, onSubmit, onOpenAI, onQuestionChange }: ExamInterfaceProps) {
  const { theme } = useTheme();
  const [index, setIndex] = useState(0);
  const [remaining, setRemaining] = useState(paper.durationMinutes * 60);
  const [paused, setPaused] = useState(false);
  const [tool, setTool] = useState<string | null>(null);

  const question = paper.questions[index];
  const answeredCount = paper.questions.filter((item) => answers[item.id]?.trim()).length;
  const progress = Math.round((answeredCount / paper.questions.length) * 100);
  const textColor = theme === 'light' ? 'text-slate-900' : 'text-white';
  const mutedColor = theme === 'light' ? 'text-slate-500' : 'text-gray-400';
  const panelBg = theme === 'light' ? 'bg-white border-slate-200 shadow-sm' : 'bg-[rgba(17,24,50,0.55)] border-[rgba(56,78,135,0.18)]';
  const answerBg = theme === 'light' ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-[rgba(17,24,50,0.75)] border-[rgba(56,78,135,0.25)] text-gray-200';

  useEffect(() => onQuestionChange(question), [question, onQuestionChange]);

  useEffect(() => {
    if (paused || remaining <= 0) return;
    const id = window.setInterval(() => setRemaining((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearInterval(id);
  }, [paused, remaining]);

  useEffect(() => {
    if (remaining === 0) onSubmit();
  }, [onSubmit, remaining]);

  const minutes = Math.floor(remaining / 60).toString().padStart(2, '0');
  const seconds = (remaining % 60).toString().padStart(2, '0');
  const urgent = remaining < 300;

  const tools = useMemo(() => getToolsForPaper(paper.subjectId), [paper.subjectId]);

  return (
    <div className="flex gap-4 flex-1 min-h-0">
      <aside className="w-[230px] flex-shrink-0 space-y-4">
        <div className="glass-card p-4">
          <p className={`font-bold text-sm ${textColor}`}>Timer</p>
          <div className={`mt-3 text-3xl font-extrabold ${urgent ? 'text-red-500' : 'text-cyan-600'}`}>{minutes}:{seconds}</div>
          {mode === 'guided' && (
            <button onClick={() => setPaused((value) => !value)} className="mt-3 w-full px-3 py-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-600 text-xs font-bold">
              {paused ? 'Resume' : 'Pause'}
            </button>
          )}
          <div className="mt-3 h-2 rounded-full bg-slate-200 overflow-hidden">
            <div className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500" style={{ width: `${progress}%` }} />
          </div>
          <p className={`mt-2 text-xs ${mutedColor}`}>{answeredCount}/{paper.questions.length} answered</p>
        </div>

        <div className="glass-card p-4">
          <p className={`font-bold text-sm mb-3 ${textColor}`}>Question Navigator</p>
          <div className="grid grid-cols-5 gap-2">
            {paper.questions.map((item, itemIndex) => (
              <button
                key={item.id}
                onClick={() => setIndex(itemIndex)}
                className={`h-9 rounded-lg border text-xs font-bold ${
                  itemIndex === index
                    ? 'bg-cyan-500 text-white border-cyan-500'
                    : answers[item.id]
                      ? 'bg-green-500/10 border-green-500/25 text-green-600'
                      : flags[item.id]
                        ? 'bg-yellow-500/10 border-yellow-500/25 text-yellow-600'
                        : 'bg-slate-500/10 border-slate-500/20 text-slate-500'
                }`}
              >
                {itemIndex + 1}
              </button>
            ))}
          </div>
        </div>
      </aside>

      <main className="flex-1 min-w-0 space-y-4 overflow-y-auto pr-1">
        <div className="glass-card p-5">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="px-2 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-600 text-[10px] font-bold">Question {index + 1}</span>
                <span className="px-2 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-600 text-[10px] font-bold">{question.marks} marks</span>
                <span className="px-2 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 text-[10px] font-bold">{question.topic}</span>
                <span className="px-2 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-600 text-[10px] font-bold">{question.difficulty}</span>
              </div>
              <h2 className={`text-xl font-extrabold ${textColor}`}>{paper.title}</h2>
              <p className={`text-xs mt-1 ${mutedColor}`}>{mode === 'authentic' ? 'Authentic Examination Mode: no hints or AI guidance.' : 'AI Guided Examination: Socratic tutor available.'}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => onToggleFlag(question.id)} className={`px-3 py-2 rounded-lg border text-xs font-bold ${flags[question.id] ? 'bg-yellow-500/10 border-yellow-500/25 text-yellow-600' : 'bg-slate-500/10 border-slate-500/20 text-slate-500'}`}>Flag</button>
              <button onClick={() => onToggleBookmark(question.id)} className={`px-3 py-2 rounded-lg border text-xs font-bold ${bookmarks[question.id] ? 'bg-purple-500/10 border-purple-500/25 text-purple-600' : 'bg-slate-500/10 border-slate-500/20 text-slate-500'}`}>Bookmark</button>
              {mode === 'guided' && <button onClick={onOpenAI} className="px-3 py-2 rounded-lg bg-cyan-500 text-white text-xs font-bold">Ask AI</button>}
            </div>
          </div>

          <QuestionViewer question={question} value={answers[question.id] ?? ''} onChange={(value) => onAnswer(question.id, value)} answerBg={answerBg} textColor={textColor} mutedColor={mutedColor} />
        </div>

        <div className={`rounded-2xl border p-4 ${panelBg}`}>
          <div className="flex flex-wrap gap-2 mb-3">
            {tools.map((item) => <button key={item} onClick={() => setTool(tool === item ? null : item)} className={`px-3 py-2 rounded-lg border text-xs font-bold ${tool === item ? 'bg-cyan-500 text-white border-cyan-500' : 'bg-cyan-500/10 border-cyan-500/20 text-cyan-600'}`}>{item}</button>)}
          </div>
          {tool && <ToolContent tool={tool} subjectId={paper.subjectId} mutedColor={mutedColor} answerBg={answerBg} />}
        </div>

        <div className="flex items-center justify-between pb-6">
          <button disabled={index === 0} onClick={() => setIndex((value) => Math.max(0, value - 1))} className="px-4 py-2 rounded-lg bg-slate-500/10 border border-slate-500/20 text-slate-500 text-xs font-bold disabled:opacity-40">Previous</button>
          <div className="flex gap-2">
            <button onClick={() => setIndex((value) => Math.min(paper.questions.length - 1, value + 1))} className="px-4 py-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-600 text-xs font-bold">Next</button>
            <button onClick={onSubmit} className="px-4 py-2 rounded-lg bg-green-500 text-white text-xs font-bold">Submit Exam</button>
          </div>
        </div>
      </main>
    </div>
  );
}

function QuestionViewer({ question, value, onChange, answerBg, textColor, mutedColor }: { question: ExamQuestion; value: string; onChange: (value: string) => void; answerBg: string; textColor: string; mutedColor: string }) {
  return (
    <div>
      <p className={`text-base font-semibold leading-relaxed ${textColor}`}>{question.prompt}</p>
      <div className="mt-4">
        {question.type === 'multiple-choice' && question.options ? (
          <div className="space-y-2">
            {question.options.map((option) => (
              <button key={option} onClick={() => onChange(option)} className={`w-full text-left px-4 py-3 rounded-xl border text-sm ${value === option ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-600 font-bold' : answerBg}`}>
                {option}
              </button>
            ))}
          </div>
        ) : question.type === 'essay' ? (
          <textarea value={value} onChange={(event) => onChange(event.target.value)} className={`w-full min-h-[220px] rounded-xl border p-4 text-sm focus:outline-none focus:border-cyan-500/50 ${answerBg}`} placeholder="Write your answer here..." />
        ) : (
          <textarea value={value} onChange={(event) => onChange(event.target.value)} className={`w-full min-h-[120px] rounded-xl border p-4 text-sm focus:outline-none focus:border-cyan-500/50 ${answerBg}`} placeholder={question.type === 'code' ? 'Write pseudocode or code here...' : 'Show your working or answer here...'} />
        )}
      </div>
      <p className={`mt-3 text-xs ${mutedColor}`}>Question type: {question.type.replace('-', ' ')}</p>
    </div>
  );
}

function getToolsForPaper(subjectId: string) {
  const common = ['Reference Materials'];
  if (subjectId === 'mathematics') return ['Scientific Calculator', 'Formula Sheet', 'Working Scratchpad', 'Graph Placeholder', 'Equation Editor'];
  if (subjectId === 'physics') return ['Calculator', 'Formula Sheet', 'Unit Converter', 'Working Area'];
  if (subjectId === 'chemistry') return ['Periodic Table', 'Equation Workspace', 'Calculator', 'Reaction Reference'];
  if (subjectId === 'computer-studies') return ['Code Editor', 'Algorithm Workspace', 'Flowchart Viewer'];
  if (subjectId === 'ict') return ['Practical Workspace', 'Technology Diagrams', 'Digital Literacy Tasks'];
  if (subjectId === 'english') return ['Essay Planner', 'Writing Area', 'Reading Passage'];
  if (subjectId === 'kiswahili') return ['Insha Workspace', 'Sarufi Reference', 'Reading Passage'];
  if (subjectId === 'csl') return ['Reflection Workspace', 'Project Analysis', 'Case Study Viewer'];
  if (subjectId === 'pe') return ['Sports Rule Reference', 'Movement Diagrams', 'Wellness Notes'];
  return common;
}

function ToolContent({ tool, subjectId, mutedColor, answerBg }: { tool: string; subjectId: string; mutedColor: string; answerBg: string }) {
  if (/calculator|converter/i.test(tool)) return <div className="grid grid-cols-4 gap-2 max-w-xs">{['7','8','9','÷','4','5','6','×','1','2','3','-','0','.','=','+'].map((key) => <button key={key} className="h-9 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-600 font-bold">{key}</button>)}</div>;
  if (/formula|periodic|reference|sarufi|sports/i.test(tool)) return <p className={`text-sm ${mutedColor}`}>Reference panel for {subjectId}: key formulas, concepts, rules, and quick definitions appear here.</p>;
  if (/code/i.test(tool)) return <pre className={`rounded-xl border p-3 text-xs overflow-x-auto ${answerBg}`}>{`function answer(question) {
  const plan = analyze(question);
  return solve(plan);
}`}</pre>;
  return <textarea className={`w-full min-h-[90px] rounded-xl border p-3 text-sm ${answerBg}`} placeholder={`Use ${tool} here...`} />;
}