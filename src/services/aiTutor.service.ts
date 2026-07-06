import { supabase } from '../lib/supabase';

export interface TutorConversation {
  id: string;
  question: string;
  answer: string;
  createdAt: string;
}

export const PLACEHOLDER_ANSWER =
  'Thanks for asking! Real AI-powered answers are coming soon — this is a placeholder reply while the AI model integration is being built.';

interface RawConversationRow {
  id: string;
  created_at: string;
  messages: { sender: string; content: string; created_at: string }[];
}

/** Most recent conversations for the current user (RLS scopes to their own), reduced to a question/answer pair. */
export async function getRecentConversations(limit = 10): Promise<TutorConversation[]> {
  const { data, error } = await supabase
    .from('conversations')
    .select('id, created_at, messages ( sender, content, created_at )')
    .order('created_at', { ascending: false })
    .limit(limit)
    .returns<RawConversationRow[]>();

  if (error) throw error;

  return (data ?? []).map((row) => {
    const sorted = [...row.messages].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    return {
      id: row.id,
      question: sorted.find((m) => m.sender === 'user')?.content ?? '',
      answer: sorted.find((m) => m.sender === 'assistant')?.content ?? '',
      createdAt: row.created_at,
    };
  });
}

/** Creates a new conversation holding the user's question and a placeholder assistant reply. */
export async function askTutor(userId: string, questionText: string): Promise<TutorConversation> {
  const { data: conversation, error: convError } = await supabase
    .from('conversations')
    .insert({ profile_id: userId, title: questionText.slice(0, 80) })
    .select('id, created_at')
    .single();
  if (convError) throw convError;

  const { error: msgError } = await supabase.from('messages').insert([
    { conversation_id: conversation.id, sender: 'user', content: questionText },
    { conversation_id: conversation.id, sender: 'assistant', content: PLACEHOLDER_ANSWER },
  ]);
  if (msgError) throw msgError;

  return { id: conversation.id, question: questionText, answer: PLACEHOLDER_ANSWER, createdAt: conversation.created_at };
}

/** How many questions this user asked today, for the "You asked N questions today" insight. */
export function countQuestionsToday(conversations: TutorConversation[]): number {
  const todayKey = new Date().toDateString();
  return conversations.filter((c) => new Date(c.createdAt).toDateString() === todayKey).length;
}
