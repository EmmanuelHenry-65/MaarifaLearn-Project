import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  askTutor,
  getRecentSessions,
  countQuestionsToday,
  uploadAttachment,
  type TutorSession,
  type TutorAttachment,
} from '../services/aiTutor.service';
import Spinner from '../components/common/Spinner';

function formatMessageTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

function formatSessionTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const diffMins = Math.round(diffMs / 60000);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.round(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.round(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return new Date(iso).toLocaleDateString();
}

function sessionLabel(session: TutorSession): string {
  if (session.title?.trim()) return session.title.trim();
  const firstUserMessage = session.messages.find((m) => m.sender === 'user');
  return firstUserMessage?.content.slice(0, 60) ?? 'New conversation';
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
    prompt: 'Generate a short quiz for me — ask me which subject and topic first if I haven\'t said.',
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
    prompt: 'Create 5 flashcards for a topic I\'m studying — ask me which one first if I haven\'t said.',
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
    prompt: 'Help me solve a problem step by step — ask me what the problem is.',
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
    prompt: 'Explain a topic to me in simple terms — ask me which one first if I haven\'t said.',
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
  const [searchParams, setSearchParams] = useSearchParams();
  const appliedDeepLink = useRef(false);
  const [question, setQuestion] = useState('');
  const [sessions, setSessions] = useState<TutorSession[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [pendingAttachment, setPendingAttachment] = useState<TutorAttachment | null>(null);
  const [historyOpen, setHistoryOpen] = useState(true);
  const threadEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    setLoading(true);
    setLoadError(null);
    getRecentSessions()
      .then((data) => {
        // getRecentSessions fetches newest-first -- keep that order for the history list.
        if (!cancelled) setSessions(data);
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

  // null activeConversationId means "new chat, not started yet" -- the greeting/starter-prompt
  // state below. Opening a past conversation from history, or sending a first message, sets it.
  const activeSession = sessions.find((s) => s.id === activeConversationId);
  const activeMessages = activeSession?.messages ?? [];

  useEffect(() => {
    threadEndRef.current?.scrollIntoView({ block: 'end' });
  }, [activeMessages.length]);

  function startNewChat() {
    setActiveConversationId(null);
    setQuestion('');
    setPendingAttachment(null);
    setLoadError(null);
  }

  async function handleAsk(text?: string) {
    const trimmed = (text ?? question).trim();
    if ((!trimmed && !pendingAttachment) || !user || sending) return;
    setSending(true);
    setQuestion('');
    const attachment = pendingAttachment;
    setPendingAttachment(null);
    try {
      const result = await askTutor(user.id, trimmed, attachment, activeConversationId, { pageName: 'AI Tutor' });
      setActiveConversationId(result.conversationId);
      setSessions((prev) => {
        const existing = prev.find((s) => s.id === result.conversationId);
        if (existing) {
          return prev.map((s) =>
            s.id === result.conversationId ? { ...s, messages: [...s.messages, result.userMessage, result.assistantMessage] } : s,
          );
        }
        const newSession: TutorSession = {
          id: result.conversationId,
          title: trimmed.slice(0, 80) || null,
          createdAt: new Date().toISOString(),
          messages: [result.userMessage, result.assistantMessage],
        };
        return [newSession, ...prev];
      });
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Failed to send your question.');
    } finally {
      setSending(false);
    }
  }

  // Deep-link support: /ai-tutor?q=<question> -- lets the Dashboard widget and
  // exam review's "Generate Similar Question" hand off a real typed question
  // instead of discarding it and dropping the student on an empty chat.
  useEffect(() => {
    if (appliedDeepLink.current || !user) return;
    const q = searchParams.get('q');
    if (!q) return;
    appliedDeepLink.current = true;
    handleAsk(q);
    setSearchParams({}, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, searchParams]);

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

  const questionsToday = countQuestionsToday(sessions);
  const hasConversation = activeMessages.length > 0;

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
        {!loading && (
          <div className="flex items-center justify-between">
            <p className="text-gray-500 text-xs font-semibold truncate pr-3">{activeSession ? sessionLabel(activeSession) : 'New conversation'}</p>
            <button
              onClick={startNewChat}
              disabled={!hasConversation}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[rgba(17,24,50,0.6)] border border-[rgba(56,78,135,0.3)] text-gray-300 text-xs font-semibold hover:border-cyan-500/40 hover:text-cyan-400 transition-all disabled:opacity-40 disabled:hover:border-[rgba(56,78,135,0.3)] disabled:hover:text-gray-300"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              New Chat
            </button>
          </div>
        )}
        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <Spinner size="md" label="Loading your conversations..." />
          </div>
        ) : !hasConversation ? (
          <>
            <div className="flex flex-col items-center text-center gap-5 px-4 pt-10">
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
            <div className="max-w-2xl w-full mx-auto">{inputBar}</div>
          </>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto space-y-3 pr-1" style={{ maxHeight: 'calc(100vh - 260px)' }}>
              {activeMessages.map((msg) =>
                msg.sender === 'user' ? (
                  <div key={msg.id} className="flex justify-end">
                    <div className="max-w-[75%] bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl rounded-br-sm px-4 py-2.5">
                      <p className="text-white text-sm leading-relaxed">{msg.content}</p>
                      {msg.attachment && (
                        <div className="mt-1.5">
                          <AttachmentChip name={msg.attachment.name} url={msg.attachment.signedUrl} />
                        </div>
                      )}
                      <p className="text-cyan-100 text-[10px] mt-1 text-right">{formatMessageTime(msg.createdAt)}</p>
                    </div>
                  </div>
                ) : (
                  <div key={msg.id} className="flex items-start gap-2.5">
                    <BotAvatar />
                    <div className="max-w-[75%] bg-[#1e293b] border border-[rgba(100,130,200,0.35)] rounded-2xl rounded-tl-sm px-4 py-2.5 shadow-sm">
                      <p className="text-gray-100 text-sm leading-relaxed">{msg.content}</p>
                      {msg.sources && msg.sources.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-[rgba(100,130,200,0.2)]">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1.5">Sourced from</p>
                          <div className="flex flex-wrap gap-1.5">
                            {msg.sources.map((source) => (
                              <span
                                key={source.title}
                                className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-semibold ${
                                  source.isCurriculum
                                    ? 'bg-cyan-500/10 border border-cyan-500/25 text-cyan-300'
                                    : 'bg-purple-500/10 border border-purple-500/25 text-purple-300'
                                }`}
                              >
                                {source.isCurriculum ? '📄' : '🗒️'} {source.title}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ),
              )}
              <div ref={threadEndRef} />
            </div>
            {inputBar}
          </>
        )}
      </div>

      {/* Right Column */}
      <div className="w-[300px] flex-shrink-0 space-y-4 overflow-y-auto pb-6">

        {/* Recent Conversations */}
        <div className="glass-card p-5">
          <button onClick={() => setHistoryOpen((v) => !v)} className="w-full flex items-center justify-between mb-4">
            <h3 className="text-white font-bold text-base">Recent Conversations{sessions.length > 0 ? ` (${sessions.length})` : ''}</h3>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={`text-gray-500 transition-transform flex-shrink-0 ${historyOpen ? 'rotate-180' : ''}`}
            >
              <polyline points="6,9 12,15 18,9" />
            </svg>
          </button>
          {!historyOpen ? null : loading ? (
            <Spinner />
          ) : sessions.length === 0 ? (
            <p className="text-gray-500 text-xs">No conversations yet — ask a question to get started.</p>
          ) : (
            <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
              {sessions.map((session) => (
                <button
                  key={session.id}
                  onClick={() => setActiveConversationId(session.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-all ${
                    session.id === activeConversationId
                      ? 'bg-cyan-500/15 border border-cyan-500/30 text-cyan-300'
                      : 'bg-[rgba(17,24,50,0.5)] border border-[rgba(56,78,135,0.15)] text-gray-400 hover:border-cyan-500/20'
                  }`}
                >
                  <p className="truncate font-semibold">{sessionLabel(session)}</p>
                  <p className="text-[10px] mt-0.5 opacity-70">{formatSessionTime(session.createdAt)}</p>
                </button>
              ))}
            </div>
          )}
        </div>

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
              {/* A generic study tip, labeled as such -- not passed off as a
                  personalized insight (nothing here reads the user's data). */}
              <p className="text-gray-400 text-[11px] leading-relaxed">
                <span className="text-white font-semibold">Study tip:</span> practicing past papers under timed
                conditions is one of the fastest ways to improve exam readiness.
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
                onClick={() => handleAsk(tool.prompt)}
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
