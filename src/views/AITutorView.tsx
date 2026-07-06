import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  askTutor,
  getRecentConversations,
  countQuestionsToday,
  uploadAttachment,
  type TutorConversation,
  type TutorAttachment,
} from '../services/aiTutor.service';

function formatMessageTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

function displayName(user: { user_metadata?: { full_name?: string }; email?: string } | null): string {
  return user?.user_metadata?.full_name?.split(' ')[0] ?? user?.email?.split('@')[0] ?? 'there';
}

const starterPrompts = [
  { title: 'Explain a concept', prompt: 'Explain photosynthesis in simple terms.' },
  { title: 'Solve a problem', prompt: 'Solve: 2x² + 5x − 3 = 0' },
  { title: 'Summarize notes', prompt: 'Summarize the key points of the water cycle.' },
  { title: 'Generate a quiz', prompt: 'Generate a 5-question quiz on cell biology.' },
  { title: 'Create flashcards', prompt: 'Create flashcards for the types of chemical bonds.' },
];

const quickTools = [
  {
    title: 'Generate Quiz',
    iconBg: 'bg-purple-500/15 border-purple-500/30 text-purple-400',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="3" />
        <path d="M9 9a3 3 0 1 1 4.5 2.6c-.9.5-1.5 1-1.5 2.4" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
  },
  {
    title: 'Create Flashcards',
    iconBg: 'bg-teal-500/15 border-teal-500/30 text-teal-400',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="6" width="16" height="12" rx="2" />
        <path d="M22 6v12" />
        <line x1="6" y1="10" x2="14" y2="10" />
        <line x1="6" y1="14" x2="11" y2="14" />
      </svg>
    ),
  },
  {
    title: 'Solve Problem',
    iconBg: 'bg-pink-500/15 border-pink-500/30 text-pink-400',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M8 12h8M12 8v8" />
      </svg>
    ),
  },
  {
    title: 'Explain Topic',
    iconBg: 'bg-green-500/15 border-green-500/30 text-green-400',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        <line x1="9" y1="9" x2="15" y2="9" />
        <line x1="9" y1="13" x2="13" y2="13" />
      </svg>
    ),
  },
];

const popularQuestions = [
  'Explain mitosis in simple terms',
  'What is the difference between plant and animal cells?',
  'How do I solve simultaneous equations?',
  'Write a short essay about climate change',
];

function AttachmentChip({ name, url, onRemove }: { name: string; url: string | null; onRemove?: () => void }) {
  const content = (
    <span className="flex items-center gap-1.5 min-w-0">
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14,2 14,8 20,8" />
      </svg>
      <span className="truncate">{name}</span>
    </span>
  );
  return (
    <span className="inline-flex items-center gap-2 px-2.5 py-1 rounded-lg bg-[rgba(56,78,135,0.25)] text-[11px] max-w-full">
      {url ? (
        <a href={url} target="_blank" rel="noopener noreferrer" className="hover:underline min-w-0">
          {content}
        </a>
      ) : (
        content
      )}
      {onRemove && (
        <button onClick={onRemove} className="text-gray-400 hover:text-white flex-shrink-0" aria-label="Remove attachment">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      )}
    </span>
  );
}

function BotAvatar() {
  return (
    <div className="w-8 h-8 rounded-lg border flex items-center justify-center flex-shrink-0 bg-cyan-500/15 border-cyan-500/25 text-cyan-400">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="8" width="16" height="12" rx="3" />
        <path d="M12 8V4" />
        <circle cx="12" cy="3" r="1" fill="currentColor" stroke="none" />
        <circle cx="9" cy="14" r="1.2" fill="currentColor" stroke="none" />
        <circle cx="15" cy="14" r="1.2" fill="currentColor" stroke="none" />
      </svg>
    </div>
  );
}

export default function AITutorView() {
  const { user } = useAuth();
  const [question, setQuestion] = useState('');
  const [conversations, setConversations] = useState<TutorConversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [pendingAttachment, setPendingAttachment] = useState<TutorAttachment | null>(null);
  const threadEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    setLoading(true);
    setLoadError(null);
    getRecentConversations()
      .then((data) => {
        if (!cancelled) setConversations(data);
      })
      .catch((err) => {
        if (!cancelled) setLoadError(err instanceof Error ? err.message : 'Failed to load your conversations.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  useEffect(() => {
    threadEndRef.current?.scrollIntoView({ block: 'end' });
  }, [conversations.length]);

  async function handleAsk(text?: string) {
    const trimmed = (text ?? question).trim();
    if ((!trimmed && !pendingAttachment) || !user || sending) return;
    setSending(true);
    setQuestion('');
    const attachment = pendingAttachment;
    setPendingAttachment(null);
    try {
      const created = await askTutor(user.id, trimmed, attachment);
      setConversations((prev) => [...prev, created]);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Failed to send your question.');
    } finally {
      setSending(false);
    }
  }

  async function handleFileSelected(file: File | undefined) {
    if (!file || !user) return;
    setLoadError(null);
    setUploading(true);
    try {
      const attachment = await uploadAttachment(user.id, file);
      setPendingAttachment(attachment);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Failed to upload the file.');
    } finally {
      setUploading(false);
    }
  }

  const questionsToday = countQuestionsToday(conversations);
  const hasConversation = conversations.length > 0;

  const inputBar = (
    <div className="rounded-xl bg-[rgba(17,24,50,0.8)] border border-[rgba(56,78,135,0.3)] focus-within:border-cyan-500/40 transition-colors p-3">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,.pdf,.doc,.docx,.txt"
        className="hidden"
        onChange={(e) => {
          void handleFileSelected(e.target.files?.[0]);
          e.target.value = '';
        }}
      />
      {(uploading || pendingAttachment) && (
        <div className="mb-2">
          {uploading ? (
            <span className="text-gray-500 text-[11px]">Uploading...</span>
          ) : (
            pendingAttachment && (
              <AttachmentChip
                name={pendingAttachment.name}
                url={pendingAttachment.signedUrl}
                onRemove={() => setPendingAttachment(null)}
              />
            )
          )}
        </div>
      )}
      <div className="flex items-end gap-2">
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value.slice(0, 1000))}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleAsk();
            }
          }}
          placeholder="Ask anything..."
          rows={1}
          disabled={sending}
          className="flex-1 bg-transparent text-gray-300 text-sm placeholder-gray-600 focus:outline-none resize-none disabled:opacity-60 py-1.5"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading || sending}
          className="text-gray-500 hover:text-gray-300 transition-colors p-1.5 disabled:opacity-50 flex-shrink-0"
          aria-label="Attach a file"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
          </svg>
        </button>
        <button
          onClick={() => handleAsk()}
          disabled={sending || (!question.trim() && !pendingAttachment)}
          className="w-10 h-9 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white hover:shadow-lg hover:shadow-cyan-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none flex-shrink-0"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
          </svg>
        </button>
      </div>
      {loadError && <p className="text-red-400 text-xs mt-2">{loadError}</p>}
      <p className="text-gray-600 text-[10px] mt-2 text-center">AI can make mistakes. Always verify important information.</p>
    </div>
  );

  return (
    <div className="flex gap-6 mt-2 flex-1 min-h-0">
      {/* Center Column: greeting/empty-state OR chat thread, with input pinned below */}
      <div className="flex-1 min-w-0 flex flex-col min-h-0 gap-4">
        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-gray-500 text-sm">Loading your conversations...</p>
          </div>
        ) : !hasConversation ? (
          <>
            <div className="flex-1 flex flex-col items-center justify-center text-center gap-5 px-4">
              <div>
                <h2 className="text-white text-2xl font-extrabold">
                  Hi {displayName(user)}! <span aria-hidden="true">👋</span>
                </h2>
                <p className="text-gray-400 text-sm mt-1">How can I help you learn today?</p>
              </div>
              <div className="flex flex-wrap justify-center gap-2 max-w-xl">
                {starterPrompts.map((chip) => (
                  <button
                    key={chip.title}
                    onClick={() => handleAsk(chip.prompt)}
                    className="px-4 py-2 rounded-lg bg-[rgba(17,24,50,0.6)] border border-[rgba(56,78,135,0.25)] text-gray-300 text-xs font-semibold hover:border-cyan-500/30 hover:text-cyan-400 transition-all"
                  >
                    {chip.title}
                  </button>
                ))}
              </div>
            </div>
            {inputBar}
          </>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto space-y-4 pr-1">
              {conversations.map((conv) => (
                <div key={conv.id} className="space-y-3">
                  <div className="flex justify-end">
                    <div className="max-w-[75%] bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl rounded-br-sm px-4 py-2.5">
                      <p className="text-white text-sm leading-relaxed">{conv.question}</p>
                      {conv.attachment && (
                        <div className="mt-1.5">
                          <AttachmentChip name={conv.attachment.name} url={conv.attachment.signedUrl} />
                        </div>
                      )}
                      <p className="text-cyan-100 text-[10px] mt-1 text-right">{formatMessageTime(conv.createdAt)}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <BotAvatar />
                    <div className="max-w-[75%] bg-[rgba(17,24,50,0.7)] border border-[rgba(56,78,135,0.25)] rounded-2xl rounded-tl-sm px-4 py-2.5">
                      <p className="text-gray-300 text-sm leading-relaxed">{conv.answer}</p>
                    </div>
                  </div>
                </div>
              ))}
              <div ref={threadEndRef} />
            </div>
            {inputBar}
          </>
        )}
      </div>

      {/* Right Column */}
      <div className="w-[300px] flex-shrink-0 space-y-4 overflow-y-auto pb-6">

        {/* Today's AI Insights */}
        <div className="glass-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-cyan-400">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2l1.8 5.6L19 9l-5.2 1.4L12 16l-1.8-5.6L5 9l5.2-1.4z" />
                <path d="M19 15l.9 2.6L22 18l-2.1.7L19 21l-.9-2.3L16 18l2.1-.4z" />
              </svg>
            </span>
            <h3 className="text-white font-bold text-base">Today's AI Insights</h3>
          </div>
          <div className="space-y-2.5">
            <div className="flex items-start gap-3 p-3 rounded-xl bg-[rgba(17,24,50,0.5)] border border-[rgba(56,78,135,0.15)]">
              <div className="w-8 h-8 rounded-lg border flex items-center justify-center text-sm flex-shrink-0 bg-green-500/15 border-green-500/25">
                📈
              </div>
              <p className="text-gray-400 text-[11px] leading-relaxed">
                <span className="text-white font-semibold">
                  You asked {questionsToday} question{questionsToday === 1 ? '' : 's'} today.
                </span>{' '}
                Keep it up! Curiosity leads to mastery.
              </p>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-xl bg-[rgba(17,24,50,0.5)] border border-[rgba(56,78,135,0.15)]">
              <div className="w-8 h-8 rounded-lg border flex items-center justify-center text-sm flex-shrink-0 bg-orange-500/15 border-orange-500/25">
                💡
              </div>
              <p className="text-gray-400 text-[11px] leading-relaxed">
                <span className="text-white font-semibold">Try practicing more past papers</span> to improve your exam
                readiness.
              </p>
            </div>
          </div>
        </div>

        {/* Quick Tools */}
        <div className="glass-card p-5">
          <h3 className="text-white font-bold text-base mb-4">Quick Tools</h3>
          <div className="grid grid-cols-2 gap-2.5">
            {quickTools.map((tool) => (
              <button
                key={tool.title}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-[rgba(17,24,50,0.6)] border border-[rgba(56,78,135,0.2)] hover:border-cyan-500/30 transition-all text-left"
              >
                <div className={`w-8 h-8 rounded-lg border flex items-center justify-center flex-shrink-0 ${tool.iconBg}`}>
                  {tool.icon}
                </div>
                <span className="text-white text-[11px] font-semibold leading-tight">{tool.title}</span>
              </button>
            ))}
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="w-full flex items-center justify-center gap-2 mt-2.5 p-2.5 rounded-xl bg-[rgba(17,24,50,0.6)] border border-dashed border-[rgba(56,78,135,0.4)] hover:border-cyan-500/40 transition-all text-cyan-400 text-[11px] font-semibold disabled:opacity-50"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 14.9A7 7 0 1 1 15.7 8h1.8a4.5 4.5 0 0 1 2.5 8.2" />
              <polyline points="12,12 12,21" />
              <polyline points="8,16 12,12 16,16" />
            </svg>
            Upload & Ask
          </button>
        </div>

        {/* Popular Questions */}
        <div className="glass-card p-5">
          <h3 className="text-white font-bold text-base mb-4">Popular Questions</h3>
          <div className="space-y-2">
            {popularQuestions.map((q) => (
              <button
                key={q}
                onClick={() => handleAsk(q)}
                className="w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl bg-[rgba(17,24,50,0.5)] border border-[rgba(56,78,135,0.15)] text-left hover:border-cyan-500/30 transition-all group"
              >
                <span className="flex items-center gap-2.5 min-w-0">
                  <span className="w-5 h-5 rounded-full bg-[rgba(56,78,135,0.25)] flex items-center justify-center text-gray-400 text-[10px] font-bold shrink-0">?</span>
                  <span className="text-gray-400 text-[11px] leading-relaxed group-hover:text-gray-300">{q}</span>
                </span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-cyan-500 shrink-0">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12,5 19,12 12,19" />
                </svg>
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
