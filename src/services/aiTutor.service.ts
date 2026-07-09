import { supabase } from '../lib/supabase';

export interface TutorAttachment {
  path: string;
  name: string;
  signedUrl: string | null;
}

export type MessageSender = 'user' | 'assistant';

export interface TutorSource {
  title: string;
  isCurriculum: boolean;
}

export interface TutorMessage {
  id: string;
  sender: MessageSender;
  content: string;
  createdAt: string;
  attachment: TutorAttachment | null;
  /** Real documents the AI Tutor's RAG pipeline actually retrieved for this answer -- null for user messages or if retrieval found nothing. */
  sources: TutorSource[] | null;
}

export interface TutorSession {
  id: string;
  title: string | null;
  createdAt: string;
  messages: TutorMessage[];
}

/**
 * What the learner is currently looking at in the app -- the one piece of
 * context that genuinely can't be recovered server-side (it's ephemeral UI
 * state, not persisted anywhere). Everything else (profile, progress, exam
 * history, streak, achievements...) the Edge Function fetches itself from
 * the DB, keyed by the authenticated profile_id, so callers don't need to
 * gather or duplicate it here.
 */
export interface TutorPageContext {
  pageName?: string;
  subject?: { id?: string; name: string };
  lesson?: { id?: string; title: string };
  topic?: { id?: string; title: string };
  pastPaper?: { id?: string; title: string };
  examQuestion?: { id?: string; text: string };
  examMode?: string;
}

export const FALLBACK_ANSWER =
  "Sorry, I couldn't reach the AI Tutor just now. Please try asking again in a moment.";

const SIGNED_URL_TTL_SECONDS = 60 * 60;
export const MAX_ATTACHMENT_BYTES = 10 * 1024 * 1024;

interface RawMessageRow {
  id: string;
  sender: string;
  content: string;
  created_at: string;
  attachment_path: string | null;
  attachment_name: string | null;
  sources: TutorSource[] | null;
}

interface RawConversationRow {
  id: string;
  title: string | null;
  created_at: string;
  messages: RawMessageRow[];
}

function toTutorMessage(row: RawMessageRow, signedUrlByPath: Map<string, string>): TutorMessage {
  return {
    id: row.id,
    sender: row.sender === 'assistant' ? 'assistant' : 'user',
    content: row.content,
    createdAt: row.created_at,
    attachment: row.attachment_path
      ? {
          path: row.attachment_path,
          name: row.attachment_name ?? 'Attachment',
          signedUrl: signedUrlByPath.get(row.attachment_path) ?? null,
        }
      : null,
    sources: row.sources && row.sources.length > 0 ? row.sources : null,
  };
}

/** Uploads a file to the private 'documents' bucket under the user's own folder and returns a signed URL. */
export async function uploadAttachment(userId: string, file: File): Promise<TutorAttachment> {
  if (file.size > MAX_ATTACHMENT_BYTES) {
    throw new Error('File is too large (max 10MB).');
  }

  const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_');
  const path = `${userId}/${Date.now()}-${safeName}`;

  const { error: uploadError } = await supabase.storage.from('documents').upload(path, file);
  if (uploadError) throw uploadError;

  const { data: signed, error: signError } = await supabase.storage.from('documents').createSignedUrl(path, SIGNED_URL_TTL_SECONDS);
  if (signError) throw signError;

  return { path, name: file.name, signedUrl: signed.signedUrl };
}

/** Most recent conversation sessions for the current user (RLS scopes to their own), each with its full message history. */
export async function getRecentSessions(limit = 10): Promise<TutorSession[]> {
  const { data, error } = await supabase
    .from('conversations')
    .select('id, title, created_at, messages ( id, sender, content, created_at, attachment_path, attachment_name, sources )')
    .order('created_at', { ascending: false })
    .limit(limit)
    .returns<RawConversationRow[]>();

  if (error) throw error;

  const rows = data ?? [];

  const attachmentPaths = rows
    .flatMap((row) => row.messages)
    .map((m) => m.attachment_path)
    .filter((p): p is string => Boolean(p));

  const signedUrlByPath = new Map<string, string>();
  if (attachmentPaths.length > 0) {
    const { data: signedUrls } = await supabase.storage.from('documents').createSignedUrls(attachmentPaths, SIGNED_URL_TTL_SECONDS);
    signedUrls?.forEach((s) => {
      if (s.signedUrl && s.path) signedUrlByPath.set(s.path, s.signedUrl);
    });
  }

  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    createdAt: row.created_at,
    messages: [...row.messages]
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
      .map((m) => toTutorMessage(m, signedUrlByPath)),
  }));
}

/**
 * Adds a question (and/or attachment) to a conversation, asks the real AI
 * Tutor (ai-tutor-chat Edge Function -- Socratic RAG over the student's own
 * uploaded materials) for a reply, and stores both messages - continuing
 * `existingConversationId` if given, otherwise starting a new conversation
 * first.
 */
export async function askTutor(
  userId: string,
  questionText: string,
  attachment: TutorAttachment | null = null,
  existingConversationId: string | null = null,
  pageContext: TutorPageContext | null = null,
): Promise<{ conversationId: string; userMessage: TutorMessage; assistantMessage: TutorMessage }> {
  const displayText = questionText || `Uploaded ${attachment?.name ?? 'a file'}`;

  let conversationId = existingConversationId;
  if (!conversationId) {
    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .insert({ profile_id: userId, title: displayText.slice(0, 80) })
      .select('id')
      .single<{ id: string }>();
    if (convError) throw convError;
    conversationId = conversation.id;
  }

  const { data: userRowData, error: userMsgError } = await supabase
    .from('messages')
    .insert({
      conversation_id: conversationId,
      sender: 'user',
      content: displayText,
      attachment_path: attachment?.path ?? null,
      attachment_name: attachment?.name ?? null,
    })
    .select('id, sender, content, created_at, attachment_path, attachment_name, sources')
    .single<RawMessageRow>();
  if (userMsgError) throw userMsgError;

  let answer = FALLBACK_ANSWER;
  let sources: TutorSource[] = [];
  try {
    const { data, error } = await supabase.functions.invoke<{ answer: string; sources?: TutorSource[]; error?: string }>('ai-tutor-chat', {
      body: {
        conversationId,
        question: displayText,
        attachmentPath: attachment?.path,
        attachmentName: attachment?.name,
        context: pageContext ?? undefined,
      },
    });
    if (error) throw error;
    if (data?.answer) answer = data.answer;
    if (data?.sources) sources = data.sources;
  } catch (err) {
    console.error('ai-tutor-chat failed:', err);
  }

  const { data: assistantRowData, error: assistantMsgError } = await supabase
    .from('messages')
    .insert({ conversation_id: conversationId, sender: 'assistant', content: answer, sources: sources.length > 0 ? sources : null })
    .select('id, sender, content, created_at, attachment_path, attachment_name, sources')
    .single<RawMessageRow>();
  if (assistantMsgError) throw assistantMsgError;

  const signedUrlByPath = new Map<string, string>();
  if (attachment) signedUrlByPath.set(attachment.path, attachment.signedUrl ?? '');

  return {
    conversationId,
    userMessage: toTutorMessage(userRowData, signedUrlByPath),
    assistantMessage: toTutorMessage(assistantRowData, signedUrlByPath),
  };
}

/** How many questions this user asked today, for the "You asked N questions today" insight. */
export function countQuestionsToday(sessions: TutorSession[]): number {
  const todayKey = new Date().toDateString();
  return sessions
    .flatMap((s) => s.messages)
    .filter((m) => m.sender === 'user' && new Date(m.createdAt).toDateString() === todayKey).length;
}
