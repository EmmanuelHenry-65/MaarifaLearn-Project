import { useEffect, useRef, useState } from 'react';
import type { WorkspaceLesson, WorkspaceSubject, WorkspaceTopic } from '../../data/workspaceData';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { getRecentConversations, askTutor, uploadAttachment, MAX_ATTACHMENT_BYTES, type TutorConversation } from '../../services/aiTutor.service';

interface AISidePanelProps {
  open: boolean;
  subject: WorkspaceSubject;
  lesson?: WorkspaceLesson;
  topic?: WorkspaceTopic;
  onClose: () => void;
}

const quickActions = ['Explain Concept', 'Summarize Lesson', 'Generate Quiz', 'Generate Flashcards', 'Solve Problem'];
const uploadActions = ['Upload Notes', 'Upload Images', 'Upload PDFs'] as const;

export default function AISidePanel({ open, subject, lesson, topic, onClose }: AISidePanelProps) {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [input, setInput] = useState('');
  const [conversations, setConversations] = useState<TutorConversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const textColor = theme === 'light' ? 'text-slate-900' : 'text-white';
  const mutedColor = theme === 'light' ? 'text-slate-500' : 'text-gray-400';
  const panelBg = theme === 'light' ? 'bg-white border-slate-200' : 'bg-[#0f1528] border-[rgba(56,78,135,0.35)]';
  const inputBg = theme === 'light' ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-[rgba(17,24,50,0.8)] border-[rgba(56,78,135,0.3)] text-gray-200';

  const contextLabel = `${subject.name}${lesson ? ` → ${lesson.title}` : ''}${topic ? ` → ${topic.title}` : ''}`;

  useEffect(() => {
    if (!open || !user) return;
    let cancelled = false;
    setLoading(true);
    getRecentConversations()
      .then((list) => {
        if (!cancelled) setConversations(list);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [open, user]);

  async function send(questionText: string) {
    const clean = questionText.trim();
    if (!clean || !user || sending) return;
    setSending(true);
    try {
      const conversation = await askTutor(user.id, `[${contextLabel}] ${clean}`);
      setConversations((prev) => [conversation, ...prev]);
      setInput('');
    } catch {
      // best-effort
    } finally {
      setSending(false);
    }
  }

  async function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !user) return;
    setUploadError(null);
    if (file.size > MAX_ATTACHMENT_BYTES) {
      setUploadError('File is too large (max 10MB).');
      return;
    }
    setSending(true);
    try {
      const attachment = await uploadAttachment(user.id, file);
      const conversation = await askTutor(user.id, `[${contextLabel}]`, attachment);
      setConversations((prev) => [conversation, ...prev]);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Upload failed.');
    } finally {
      setSending(false);
    }
  }

  return (
    <aside className={`fixed top-0 right-0 bottom-0 z-50 w-[380px] border-l p-5 transition-transform duration-300 ${panelBg} ${open ? 'translate-x-0' : 'translate-x-full'}`}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className={`font-extrabold text-lg ${textColor}`}>AI Study Assistant</h3>
          <p className={`text-xs mt-1 ${mutedColor}`}>{contextLabel}</p>
        </div>
        <button onClick={onClose} className="w-9 h-9 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-600 flex items-center justify-center">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
        </button>
      </div>

      <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileSelected} />

      <div className="flex flex-wrap gap-2 mb-3">
        {quickActions.map((action) => (
          <button key={action} onClick={() => send(action)} disabled={sending} className="px-2.5 py-1.5 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-600 text-[10px] font-bold hover:bg-purple-500/20 transition-colors disabled:opacity-50">
            {action}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-2 mb-4">
        {uploadActions.map((action) => (
          <button key={action} onClick={() => fileInputRef.current?.click()} disabled={sending} className="px-2.5 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-600 text-[10px] font-bold hover:bg-cyan-500/20 transition-colors disabled:opacity-50">
            {action}
          </button>
        ))}
      </div>
      {uploadError && <p className="text-red-400 text-[11px] mb-3">{uploadError}</p>}

      <div className="h-[calc(100vh-330px)] overflow-y-auto space-y-3 pr-1">
        {loading ? (
          <p className={`text-sm ${mutedColor}`}>Loading conversation history...</p>
        ) : conversations.length === 0 ? (
          <p className={`text-sm ${mutedColor}`}>Ask a question to get started - your history here is shared with the main AI Tutor page.</p>
        ) : (
          [...conversations].reverse().map((conversation) => (
            <div key={conversation.id} className="space-y-2">
              <div className="rounded-xl p-3 text-sm bg-cyan-500 text-white ml-8">{conversation.question}</div>
              <div className={`rounded-xl p-3 text-sm mr-8 ${theme === 'light' ? 'bg-slate-50 border border-slate-200 text-slate-700' : 'bg-[rgba(17,24,50,0.75)] border border-[rgba(56,78,135,0.18)] text-gray-300'}`}>
                {conversation.answer}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="absolute left-5 right-5 bottom-5 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && send(input)}
          placeholder="Ask about this lesson..."
          disabled={sending}
          className={`flex-1 px-3 py-2.5 rounded-xl border text-sm focus:outline-none focus:border-cyan-500/50 ${inputBg}`}
        />
        <button onClick={() => send(input)} disabled={sending} className="w-11 h-11 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white flex items-center justify-center disabled:opacity-50">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" /></svg>
        </button>
      </div>
    </aside>
  );
}
