import { supabase } from '../lib/supabase';
import type { ResourceType } from '../hooks/useResourcesData';

export interface WorkspaceNote {
  id: string;
  title: string | null;
  content: string | null;
  pinned: boolean;
  createdAt: string;
}

export interface TopicResource {
  id: string;
  title: string;
  resourceType: ResourceType;
  url: string | null;
}

export interface TopicQuestion {
  id: string;
  questionText: string;
  questionType: string;
  optionA: string | null;
  optionB: string | null;
  optionC: string | null;
  optionD: string | null;
  marks: number;
}

export async function getNotesForTopic(userId: string, topicId: string): Promise<WorkspaceNote[]> {
  const { data, error } = await supabase
    .from('notes')
    .select('id, title, content, pinned, created_at')
    .eq('profile_id', userId)
    .eq('topic_id', topicId)
    .order('pinned', { ascending: false })
    .order('created_at', { ascending: false })
    .returns<{ id: string; title: string | null; content: string | null; pinned: boolean | null; created_at: string }[]>();

  if (error) throw error;

  return (data ?? []).map((row) => ({
    id: row.id,
    title: row.title,
    content: row.content,
    pinned: row.pinned ?? false,
    createdAt: row.created_at,
  }));
}

export async function createNote(userId: string, topicId: string, title: string, content: string): Promise<void> {
  const { error } = await supabase.from('notes').insert({ profile_id: userId, topic_id: topicId, title, content });
  if (error) throw error;
}

export async function deleteNote(noteId: string): Promise<void> {
  const { error } = await supabase.from('notes').delete().eq('id', noteId);
  if (error) throw error;
}

export async function toggleNotePinned(noteId: string, pinned: boolean): Promise<void> {
  const { error } = await supabase.from('notes').update({ pinned }).eq('id', noteId);
  if (error) throw error;
}

/** Real resources for a single topic (same table the Resources page reads, scoped down instead of global). */
export async function getResourcesForTopic(topicId: string): Promise<TopicResource[]> {
  const { data, error } = await supabase
    .from('resources')
    .select('id, title, resource_type, url')
    .eq('topic_id', topicId)
    .order('created_at', { ascending: false })
    .returns<{ id: string; title: string; resource_type: ResourceType; url: string | null }[]>();

  if (error) throw error;

  return (data ?? []).map((row) => ({ id: row.id, title: row.title, resourceType: row.resource_type, url: row.url }));
}

/** Real practice questions for a topic. correct_answer is intentionally never selectable (column-level GRANT). */
export async function getQuestionsForTopic(topicId: string): Promise<TopicQuestion[]> {
  const { data, error } = await supabase
    .from('questions')
    .select('id, question_text, question_type, option_a, option_b, option_c, option_d, marks')
    .eq('topic_id', topicId)
    .returns<
      { id: string; question_text: string; question_type: string; option_a: string | null; option_b: string | null; option_c: string | null; option_d: string | null; marks: number | null }[]
    >();

  if (error) throw error;

  return (data ?? []).map((row) => ({
    id: row.id,
    questionText: row.question_text,
    questionType: row.question_type,
    optionA: row.option_a,
    optionB: row.option_b,
    optionC: row.option_c,
    optionD: row.option_d,
    marks: row.marks ?? 1,
  }));
}

export interface BookmarkedTopic {
  topicId: string;
  topicTitle: string;
  lessonTitle: string;
}

/** This user's bookmarked topics within one subject, for the Workspace Bookmarks tab. */
export async function getBookmarkedTopicsForSubject(userId: string, subjectCode: string): Promise<BookmarkedTopic[]> {
  const { data, error } = await supabase
    .from('bookmarks')
    .select('topic:topics!inner(id, title, lesson:lessons!inner(title, subject:subjects!inner(code)))')
    .eq('profile_id', userId)
    .eq('topic.lesson.subject.code', subjectCode)
    .returns<{ topic: { id: string; title: string; lesson: { title: string; subject: { code: string } } } }[]>();

  if (error) throw error;

  return (data ?? [])
    .filter((row) => row.topic)
    .map((row) => ({ topicId: row.topic.id, topicTitle: row.topic.title, lessonTitle: row.topic.lesson.title }));
}
