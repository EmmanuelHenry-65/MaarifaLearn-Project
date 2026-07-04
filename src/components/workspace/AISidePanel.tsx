import { useState } from 'react';
import type { WorkspaceLesson, WorkspaceSubject, WorkspaceTopic } from '../../data/workspaceData';
import { useTheme } from '../../context/ThemeContext';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface AISidePanelProps {
  open: boolean;
  subject: WorkspaceSubject;
  lesson?: WorkspaceLesson;
  topic?: WorkspaceTopic;
  onClose: () => void;
}

const actions = ['Ask Question', 'Explain Concept', 'Summarize Lesson', 'Generate Quiz', 'Generate Flashcards', 'Solve Problem', 'Upload Notes', 'Upload Images', 'Upload PDFs'];

export default function AISidePanel({ open, subject, lesson, topic, onClose }: AISidePanelProps) {
  const { theme } = useTheme();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { id: 'seed', role: 'assistant', content: `I am ready to help with ${subject.name}${lesson ? `, especially ${lesson.title}` : ''}.` },
  ]);

  const textColor = theme === 'light' ? 'text-slate-900' : 'text-white';
  const mutedColor = theme === 'light' ? 'text-slate-500' : 'text-gray-400';
  const panelBg = theme === 'light' ? 'bg-white border-slate-200' : 'bg-[#0f1528] border-[rgba(56,78,135,0.35)]';
  const inputBg = theme === 'light' ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-[rgba(17,24,50,0.8)] border-[rgba(56,78,135,0.3)] text-gray-200';

  const send = (content = input) => {
    const clean = content.trim();
    if (!clean) return;
    const userMessage: Message = { id: crypto.randomUUID(), role: 'user', content: clean };
    const assistantMessage: Message = {
      id: crypto.randomUUID(),
      role: 'assistant',
      content: `Placeholder AI response: using context from ${subject.name}${lesson ? ` → ${lesson.title}` : ''}${topic ? ` → ${topic.title}` : ''}. This will later connect to RAG and GPT-5.5.`,
    };
    setMessages((prev) => [...prev, userMessage, assistantMessage]);
    setInput('');
  };

  return (
    <aside className={`fixed top-0 right-0 bottom-0 z-50 w-[380px] border-l p-5 transition-transform duration-300 ${panelBg} ${open ? 'translate-x-0' : 'translate-x-full'}`}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className={`font-extrabold text-lg ${textColor}`}>AI Study Assistant</h3>
          <p className={`text-xs mt-1 ${mutedColor}`}>{subject.name} • {lesson?.title ?? 'Workspace'} • {topic?.title ?? 'Current context'}</p>
        </div>
        <button onClick={onClose} className="w-9 h-9 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-600 flex items-center justify-center">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
        </button>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {actions.map((action) => (
          <button key={action} onClick={() => send(action)} className="px-2.5 py-1.5 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-600 text-[10px] font-bold hover:bg-purple-500/20 transition-colors">
            {action}
          </button>
        ))}
      </div>

      <div className="h-[calc(100vh-245px)] overflow-y-auto space-y-3 pr-1">
        {messages.map((message) => (
          <div key={message.id} className={`rounded-xl p-3 text-sm ${message.role === 'user' ? 'bg-cyan-500 text-white ml-8' : theme === 'light' ? 'bg-slate-50 border border-slate-200 text-slate-700 mr-8' : 'bg-[rgba(17,24,50,0.75)] border border-[rgba(56,78,135,0.18)] text-gray-300 mr-8'}`}>
            {message.content}
          </div>
        ))}
      </div>

      <div className="absolute left-5 right-5 bottom-5 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && send()}
          placeholder="Ask about this lesson..."
          className={`flex-1 px-3 py-2.5 rounded-xl border text-sm focus:outline-none focus:border-cyan-500/50 ${inputBg}`}
        />
        <button onClick={() => send()} className="w-11 h-11 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white flex items-center justify-center">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" /></svg>
        </button>
      </div>
    </aside>
  );
}