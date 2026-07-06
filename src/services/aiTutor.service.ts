import { supabase } from '../lib/supabase';

export interface TutorAttachment {
  path: string;
  name: string;
  signedUrl: string | null;
}

export interface TutorConversation {
  id: string;
  question: string;
  answer: string;
  createdAt: string;
  attachment: TutorAttachment | null;
}

export const PLACEHOLDER_ANSWER =
  'Thanks for asking! Real AI-powered answers are coming soon — this is a placeholder reply while the AI model integration is being built.';

const SIGNED_URL_TTL_SECONDS = 60 * 60;
export const MAX_ATTACHMENT_BYTES = 10 * 1024 * 1024;

interface RawMessageRow {
  sender: string;
  content: string;
  created_at: string;
  attachment_path: string | null;
  attachment_name: string | null;
}

interface RawConversationRow {
  id: string;
  created_at: string;
  messages: RawMessageRow[];
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

/** Most recent conversations for the current user (RLS scopes to their own), reduced to a question/answer pair. */
export async function getRecentConversations(limit = 10): Promise<TutorConversation[]> {
  const { data, error } = await supabase
    .from('conversations')
    .select('id, created_at, messages ( sender, content, created_at, attachment_path, attachment_name )')
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

  return rows.map((row) => {
    const sorted = [...row.messages].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    const userMessage = sorted.find((m) => m.sender === 'user');
    const assistantMessage = sorted.find((m) => m.sender === 'assistant');

    const attachment: TutorAttachment | null = userMessage?.attachment_path
      ? {
          path: userMessage.attachment_path,
          name: userMessage.attachment_name ?? 'Attachment',
          signedUrl: signedUrlByPath.get(userMessage.attachment_path) ?? null,
        }
      : null;

    return {
      id: row.id,
      question: userMessage?.content ?? '',
      answer: assistantMessage?.content ?? '',
      createdAt: row.created_at,
      attachment,
    };
  });
}

/** Creates a new conversation holding the user's question (and/or attachment) and a placeholder assistant reply. */
export async function askTutor(
  userId: string,
  questionText: string,
  attachment: TutorAttachment | null = null,
): Promise<TutorConversation> {
  const displayText = questionText || `Uploaded ${attachment?.name ?? 'a file'}`;

  const { data: conversation, error: convError } = await supabase
    .from('conversations')
    .insert({ profile_id: userId, title: displayText.slice(0, 80) })
    .select('id, created_at')
    .single();
  if (convError) throw convError;

  const { error: msgError } = await supabase.from('messages').insert([
    {
      conversation_id: conversation.id,
      sender: 'user',
      content: displayText,
      attachment_path: attachment?.path ?? null,
      attachment_name: attachment?.name ?? null,
    },
    { conversation_id: conversation.id, sender: 'assistant', content: PLACEHOLDER_ANSWER },
  ]);
  if (msgError) throw msgError;

  return {
    id: conversation.id,
    question: displayText,
    answer: PLACEHOLDER_ANSWER,
    createdAt: conversation.created_at,
    attachment,
  };
}

/** How many questions this user asked today, for the "You asked N questions today" insight. */
export function countQuestionsToday(conversations: TutorConversation[]): number {
  const todayKey = new Date().toDateString();
  return conversations.filter((c) => new Date(c.createdAt).toDateString() === todayKey).length;
}
