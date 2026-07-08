import { useState } from 'react';
import type { ExamPaper, ExamQuestion, ExamSubject } from '../../services/examinations.service';
import type { ExamMode } from '../../views/ExamsView';
import { useTheme } from '../../context/ThemeContext';
import { askTutor, type TutorMessage } from '../../services/aiTutor.service';

interface ExamAISidePanelProps {
  open: boolean;
  subject: ExamSubject;
  paper?: ExamPaper;
  question?: ExamQuestion;
  mode?: ExamMode;
  progress: number;
  userId: string | null;
  onClose: () => void;
}

const actions = ['Explain Concept', 'Give Hint', 'Break Question Into Steps', 'Generate Similar Question', 'Explain Mistakes', 'Summarize Topic'];

export default function ExamAISidePanel({ open, subject, paper, question, mode, progress, userId, onClose }: ExamAISidePanelProps) {
  const { theme } = useTheme();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<TutorMessage[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  const textColor = theme === 'light' ? 'text-slate-900' : 'text-white';
  const mutedColor = theme === 'light' ? 'text-slate-500' : 'text-gray-400';
  const panelBg = theme === 'light' ? 'bg-white border-slate-200' : 'bg-[#0f1528] border-[rgba(56,78,135,0.35)]';
  const inputBg = theme === 'light' ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-[rgba(17,24,50,0.8)] border-[rgba(56,78,135,0.3)] text-gray-200';

  const send = async (content = input) => {
    const clean = content.trim();
    if (!clean || !userId || sending) return;
    setInput('');
    setSending(true);
    const context = `[${subject.name}${paper ? ` → ${paper.title}` : ''}${question ? ` → current question: "${question.questionText}"` : ''}] ${clean}`;
    try {
      const result = await askTutor(userId, context, null, conversationId);
      setConversationId(result.conversationId);
      setMessages((prev) => [...prev, result.userMessage, result.assistantMessage]);
    } catch {
      // best-effort -- input already cleared, just drop the failed send
    } finally {
      setSending(false);
    }
  };

  return (
    <aside className={`fixed top-0 right-0 bottom-0 z-50 w-[390px] border-l p-5 transition-transform duration-300 ${panelBg} ${open ? 'translate-x-0' : 'translate-x-full'}`}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className={`font-extrabold text-lg ${textColor}`}>Exam AI Tutor</h3>
          <p className={`text-xs mt-1 ${mutedColor}`}>{subject.name} • {paper?.title ?? 'Exam Center'} • {mode ?? 'guided'} • {progress}% complete</p>
        </div>
        <button onClick={onClose} className="w-9 h-9 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-600 flex items-center justify-center">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
        </button>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {actions.map((action) => (
          <button key={action} onClick={() => send(action)} disabled={sending} className="px-2.5 py-1.5 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-600 text-[10px] font-bold hover:bg-purple-500/20 transition-colors disabled:opacity-40">
            {action}
          </button>
        ))}
      </div>

      <div className="h-[calc(100vh-250px)] overflow-y-auto space-y-3 pr-1">
        {messages.length === 0 && (
          <div className={`rounded-xl p-3 text-sm mr-8 ${theme === 'light' ? 'bg-slate-50 border border-slate-200 text-slate-700' : 'bg-[rgba(17,24,50,0.75)] border border-[rgba(56,78,135,0.18)] text-gray-300'}`}>
            I can guide you through {subject.name} using Socratic questions. I won't reveal answers immediately.
          </div>
        )}
        {messages.map((message) => (
          <div key={message.id} className={`rounded-xl p-3 text-sm ${message.sender === 'user' ? 'bg-cyan-500 text-white ml-8' : theme === 'light' ? 'bg-slate-50 border border-slate-200 text-slate-700 mr-8' : 'bg-[rgba(17,24,50,0.75)] border border-[rgba(56,78,135,0.18)] text-gray-300 mr-8'}`}>
            {message.content}
          </div>
        ))}
        {sending && (
          <div className={`rounded-xl p-3 text-sm mr-8 ${theme === 'light' ? 'bg-slate-50 border border-slate-200 text-slate-500' : 'bg-[rgba(17,24,50,0.75)] border border-[rgba(56,78,135,0.18)] text-gray-400'}`}>
            Thinking...
          </div>
        )}
      </div>

      <div className="absolute left-5 right-5 bottom-5 flex gap-2">
        <input value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={(event) => event.key === 'Enter' && send()} placeholder="Ask for a hint..." disabled={sending} className={`flex-1 px-3 py-2.5 rounded-xl border text-sm focus:outline-none focus:border-cyan-500/50 ${inputBg}`} />
        <button onClick={() => send()} disabled={sending} className="w-11 h-11 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white flex items-center justify-center disabled:opacity-50">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" /></svg>
        </button>
      </div>
    </aside>
  );
}
