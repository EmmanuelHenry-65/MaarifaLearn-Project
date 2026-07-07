import { supabase } from '../lib/supabase';

export interface TutorAttachment {
  path: string;
  name: string;
  signedUrl: string | null;
}

export type MessageSender = 'user' | 'assistant';

export interface TutorMessage {
  id: string;
  sender: MessageSender;
  content: string;
  createdAt: string;
  attachment: TutorAttachment | null;
}

export interface TutorSession {
  id: string;
  messages: TutorMessage[];
}

export const PLACEHOLDER_ANSWER =
  'Thanks for asking! Real AI-powered answers are coming soon — this is a placeholder reply while the AI model integration is being built.';

const SIGNED_URL_TTL_SECONDS = 60 * 60;
export const MAX_ATTACHMENT_BYTES = 10 * 1024 * 1024;

// A follow-up question within this window continues the same conversation
// (so a real AI can eventually see the whole exchange as context, the way a
// Socratic back-and-forth needs to); after this long a gap, the next
// question starts a fresh conversation instead.
const SESSION_CONTINUATION_WINDOW_MS = 30 * 60 * 1000;

interface RawMessageRow {
  id: string;
  sender: string;
  content: string;
  created_at: string;
  attachment_path: string | null;
  attachment_name: string | null;
}

interface RawConversationRow {
  id: string;
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
    .select('id, messages ( id, sender, content, created_at, attachment_path, attachment_name )')
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
    messages: [...row.messages]
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
      .map((m) => toTutorMessage(m, signedUrlByPath)),
  }));
}

/** Whether a follow-up question should continue this session rather than start a new one. */
export function isSessionContinuable(session: TutorSession | undefined): session is TutorSession {
  if (!session || session.messages.length === 0) return false;
  const lastMessageAt = new Date(session.messages[session.messages.length - 1].createdAt).getTime();
  return Date.now() - lastMessageAt < SESSION_CONTINUATION_WINDOW_MS;
}

/**
 * Adds a question (and/or attachment) plus a placeholder assistant reply to
 * a conversation - continuing `existingConversationId` if given, otherwise
 * starting a new conversation first.
 */
export async function askTutor(
  userId: string,
  questionText: string,
  attachment: TutorAttachment | null = null,
  existingConversationId: string | null = null,
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

  const { data: inserted, error: msgError } = await supabase
    .from('messages')
    .insert([
      {
        conversation_id: conversationId,
        sender: 'user',
        content: displayText,
        attachment_path: attachment?.path ?? null,
        attachment_name: attachment?.name ?? null,
      },
      { conversation_id: conversationId, sender: 'assistant', content: PLACEHOLDER_ANSWER },
    ])
    .select('id, sender, content, created_at, attachment_path, attachment_name')
    .returns<RawMessageRow[]>();
  if (msgError) throw msgError;

  const signedUrlByPath = new Map<string, string>();
  if (attachment) signedUrlByPath.set(attachment.path, attachment.signedUrl ?? '');

  const userRow = inserted.find((m) => m.sender === 'user')!;
  const assistantRow = inserted.find((m) => m.sender === 'assistant')!;

  return {
    conversationId,
    userMessage: toTutorMessage(userRow, signedUrlByPath),
    assistantMessage: toTutorMessage(assistantRow, signedUrlByPath),
  };
}

/** How many questions this user asked today, for the "You asked N questions today" insight. */
export function countQuestionsToday(sessions: TutorSession[]): number {
  const todayKey = new Date().toDateString();
  return sessions
    .flatMap((s) => s.messages)
    .filter((m) => m.sender === 'user' && new Date(m.createdAt).toDateString() === todayKey).length;
}
