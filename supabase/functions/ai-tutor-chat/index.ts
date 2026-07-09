// AI Tutor chat — Socratic RAG pipeline using OpenAI (gpt-5-mini + text-embedding-3-small),
// personalized with the learner's own profile, progress, and current activity.
//
// Deploy via the Supabase Dashboard (Edge Functions > Create a new function >
// paste this file > Deploy), or `supabase functions deploy ai-tutor-chat` if
// you have the CLI linked. Requires an OPENAI_API_KEY secret set on the
// project (Edge Functions > Secrets) -- never referenced from client code.
//
// Request body: { conversationId: string, question: string, attachmentPath?: string,
//                 attachmentName?: string, context?: TutorPageContext }
// Response: { answer: string }

import { createClient } from 'npm:@supabase/supabase-js@2';
import pdfParse from 'npm:pdf-parse@1.1.1';

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')!;
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SYSTEM_PROMPT = `You are Maarifa Learn's AI Tutor for Kenyan Grade 10 (CBE) students.
You are Socratic: guide the student to the answer with questions, hints, and small steps —
do not just state the final answer outright, unless the student is clearly stuck after a couple
of hints and asks directly for the answer. Keep responses short, encouraging, and age-appropriate.

You will be given a "LEARNER CONTEXT" system message describing this specific student: their
grade/curriculum, what page and subject/topic/paper they are currently viewing, recent progress,
exam performance, weak and strong topics, study plan, streak, and achievements. Use it to
personalize automatically — assume the current subject/topic unless the student clearly asks
about something else, and don't ask questions whose answers are already given in that context.
If official Maarifa Learn curriculum material for the relevant topic is provided, ground your
explanation in it and refer to it as the course material, not as something the student uploaded.
If context from the student's own uploaded materials (documents or images) is provided, ground
your guidance in it and mention specifically what part is relevant.`;

interface TutorPageContext {
  pageName?: string;
  subject?: { id?: string; name: string };
  lesson?: { id?: string; title: string };
  topic?: { id?: string; title: string };
  pastPaper?: { id?: string; title: string };
  examQuestion?: { id?: string; text: string };
  examMode?: string;
}

async function embed(text: string): Promise<number[]> {
  const res = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: { Authorization: `Bearer ${OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: 'text-embedding-3-small', input: text.slice(0, 8000), dimensions: 768 }),
  });
  if (!res.ok) throw new Error(`Embedding request failed: ${await res.text()}`);
  const json = await res.json();
  return json.data[0].embedding;
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
}

function imageMimeType(path: string): string | null {
  const lower = path.toLowerCase();
  if (lower.endsWith('.png')) return 'image/png';
  if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) return 'image/jpeg';
  if (lower.endsWith('.webp')) return 'image/webp';
  if (lower.endsWith('.gif')) return 'image/gif';
  return null;
}

/** Distinct-day streak counting backward from today (mirrors the client's learning.service streak logic). */
function computeStreakFromDates(dates: (string | null)[]): number {
  const days = new Set(dates.filter((d): d is string => Boolean(d)).map((d) => new Date(d).toDateString()));
  let streak = 0;
  const cursor = new Date();
  while (days.has(cursor.toDateString())) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

/** First topic in this subject (by lesson order) the learner hasn't completed yet, or null if none/unknown. */
async function getRecommendedNextTopic(
  adminClient: ReturnType<typeof createClient>,
  profileId: string,
  subjectName: string,
): Promise<string | null> {
  const { data: subjectRow } = await adminClient.from('subjects').select('id').ilike('name', subjectName).maybeSingle();
  if (!subjectRow) return null;

  const { data: lessonRows } = await adminClient
    .from('lessons')
    .select('id, lesson_order')
    .eq('subject_id', subjectRow.id)
    .order('lesson_order', { ascending: true });
  if (!lessonRows?.length) return null;

  const orderIndex = new Map(lessonRows.map((l: { id: string }, i: number) => [l.id, i]));
  const { data: topicRows } = await adminClient
    .from('topics')
    .select('id, title, lesson_id')
    .in('lesson_id', lessonRows.map((l: { id: string }) => l.id));
  if (!topicRows?.length) return null;

  const sortedTopics = [...topicRows].sort(
    (a: { lesson_id: string }, b: { lesson_id: string }) => (orderIndex.get(a.lesson_id) ?? 0) - (orderIndex.get(b.lesson_id) ?? 0),
  );

  const { data: progressRows } = await adminClient
    .from('progress')
    .select('topic_id, completed')
    .eq('profile_id', profileId)
    .in('topic_id', sortedTopics.map((t: { id: string }) => t.id));
  const completedSet = new Set((progressRows ?? []).filter((p: { completed: boolean }) => p.completed).map((p: { topic_id: string }) => p.topic_id));

  const next = sortedTopics.find((t: { id: string }) => !completedSet.has(t.id));
  return next?.title ?? null;
}

/** Gathers everything Maarifa Learn already knows about this student -- profile, progress, exam
 * history, study plan, achievements -- so the tutor never has to ask for it. Best-effort: any
 * individual query failing (e.g. no study plan yet) just omits that section instead of failing
 * the whole request. */
async function buildLearnerContextBlock(
  adminClient: ReturnType<typeof createClient>,
  profileId: string,
  conversationId: string,
  pageContext: TutorPageContext | undefined,
): Promise<string> {
  const [profileRes, preferencesRes, progressRes, examAttemptsRes, dueTasksRes, achievementsRes, recentConversationsRes, recommendedNextTopic, examSubmissionRes] =
    await Promise.all([
      adminClient.from('profiles').select('full_name, grade, school, curriculum, learning_pathway').eq('id', profileId).maybeSingle(),
      adminClient.from('user_preferences').select('daily_study_goal').eq('profile_id', profileId).maybeSingle(),
      adminClient
        .from('progress')
        .select('mastery_score, completed, last_accessed_at, topics!inner(title, lessons!inner(title, subjects!inner(name)))')
        .eq('profile_id', profileId)
        .order('last_accessed_at', { ascending: false })
        .limit(50),
      adminClient
        .from('exam_attempts')
        .select('percentage, submitted_at, past_papers!inner(title, subjects!inner(name))')
        .eq('profile_id', profileId)
        .not('percentage', 'is', null)
        .order('submitted_at', { ascending: false })
        .limit(10),
      adminClient
        .from('study_tasks')
        .select('title, due_date, subject, study_plans!inner(profile_id)')
        .eq('study_plans.profile_id', profileId)
        .eq('completed', false)
        .order('due_date', { ascending: true })
        .limit(5),
      adminClient.from('achievements').select('title, earned_at').eq('profile_id', profileId).order('earned_at', { ascending: false }).limit(5),
      adminClient.from('conversations').select('title').eq('profile_id', profileId).neq('id', conversationId).order('created_at', { ascending: false }).limit(5),
      pageContext?.subject?.name ? getRecommendedNextTopic(adminClient, profileId, pageContext.subject.name) : Promise.resolve(null),
      // Own reviewed "Authentic Paper Exam" feedback for the paper currently being
      // viewed -- pulled directly by profile_id + paper_id (never via the shared
      // RAG index), so a marking scheme can only ever surface for the exact
      // student who owns that already-graded submission.
      pageContext?.pastPaper?.id
        ? adminClient
            .from('exam_submissions')
            .select('ai_score, ai_percentage, ai_feedback')
            .eq('profile_id', profileId)
            .eq('paper_id', pageContext.pastPaper.id)
            .eq('status', 'reviewed')
            .order('reviewed_at', { ascending: false })
            .limit(1)
            .maybeSingle()
        : Promise.resolve({ data: null }),
    ]);

  const lines: string[] = [];

  const profile = profileRes.data as { full_name: string; grade: string | null; school: string | null; curriculum: string | null } | null;
  if (profile) {
    lines.push(
      `Learner: ${profile.full_name}, Grade ${profile.grade ?? 'unknown'}${profile.school ? ` at ${profile.school}` : ''}. Curriculum: ${profile.curriculum ?? 'Kenya CBC'}.`,
    );
  }

  if (pageContext) {
    const trail = [pageContext.pageName, pageContext.subject?.name, pageContext.lesson?.title, pageContext.topic?.title, pageContext.pastPaper?.title]
      .filter(Boolean)
      .join(' → ');
    if (trail) lines.push(`Currently viewing: ${trail}${pageContext.examMode ? ` (${pageContext.examMode} mode)` : ''}.`);
    if (pageContext.examQuestion?.text) lines.push(`Current exam question: "${pageContext.examQuestion.text}"`);
  }

  type ProgressRow = {
    mastery_score: number | null;
    completed: boolean;
    last_accessed_at: string | null;
    topics: { title: string; lessons: { title: string; subjects: { name: string } } };
  };
  const progressRows = (progressRes.data ?? []) as unknown as ProgressRow[];
  if (progressRows.length) {
    const streak = computeStreakFromDates(progressRows.map((r) => r.last_accessed_at));
    if (streak > 0) lines.push(`Current study streak: ${streak} day${streak === 1 ? '' : 's'} in a row.`);

    const recentlyViewed = progressRows.slice(0, 3).map((r) => `${r.topics.title} (${r.topics.lessons.subjects.name})`);
    if (recentlyViewed.length) lines.push(`Recently viewed topics: ${recentlyViewed.join(', ')}.`);

    const scored = progressRows.filter((r) => r.mastery_score != null);
    const weakest = [...scored].sort((a, b) => (a.mastery_score ?? 0) - (b.mastery_score ?? 0)).slice(0, 3);
    const strongest = [...scored].sort((a, b) => (b.mastery_score ?? 0) - (a.mastery_score ?? 0)).slice(0, 3);
    if (weakest.length) lines.push(`Weakest topics (lowest mastery): ${weakest.map((r) => `${r.topics.title} (${r.mastery_score}%)`).join(', ')}.`);
    if (strongest.length) lines.push(`Strongest topics: ${strongest.map((r) => `${r.topics.title} (${r.mastery_score}%)`).join(', ')}.`);
  }

  type ExamAttemptRow = { percentage: number; past_papers: { title: string; subjects: { name: string } } };
  const examAttempts = (examAttemptsRes.data ?? []) as unknown as ExamAttemptRow[];
  if (examAttempts.length) {
    const avg = Math.round(examAttempts.reduce((sum, a) => sum + a.percentage, 0) / examAttempts.length);
    const best = Math.max(...examAttempts.map((a) => a.percentage));
    const recent = examAttempts.slice(0, 3).map((a) => `${a.past_papers.subjects.name} ${a.past_papers.title}: ${a.percentage}%`);
    lines.push(`Exam performance: average ${avg}%, best ${best}%. Recent attempts: ${recent.join('; ')}.`);
  }

  type ExamSubmissionRow = { ai_score: number | null; ai_percentage: number | null; ai_feedback: string | null };
  const examSubmission = examSubmissionRes.data as ExamSubmissionRow | null;
  if (examSubmission?.ai_feedback && pageContext?.pastPaper) {
    lines.push(
      `The student has already been AI-marked on "${pageContext.pastPaper.title}" (the Authentic Paper Exam they're currently viewing)` +
        `${examSubmission.ai_percentage !== null ? `, scoring ${examSubmission.ai_percentage}%` : ''}. Marking feedback: ${examSubmission.ai_feedback} ` +
        `You may reference and expand on this feedback if the student asks about their performance or mistakes on this paper.`,
    );
  }

  type DueTaskRow = { title: string; due_date: string; subject: string | null };
  const dueTasks = (dueTasksRes.data ?? []) as unknown as DueTaskRow[];
  if (dueTasks.length) {
    lines.push(`Upcoming study plan tasks: ${dueTasks.map((t) => `${t.title}${t.subject ? ` (${t.subject})` : ''} due ${t.due_date}`).join('; ')}.`);
  }

  const preferences = preferencesRes.data as { daily_study_goal: number | null } | null;
  if (preferences?.daily_study_goal) lines.push(`Daily study goal: ${preferences.daily_study_goal} minutes.`);

  type AchievementRow = { title: string };
  const achievements = (achievementsRes.data ?? []) as unknown as AchievementRow[];
  if (achievements.length) lines.push(`Recent achievements/badges earned: ${achievements.map((a) => a.title).join(', ')}.`);

  if (recommendedNextTopic) lines.push(`Recommended next topic in ${pageContext?.subject?.name}: ${recommendedNextTopic}.`);

  type ConversationRow = { title: string | null };
  const recentConversations = (recentConversationsRes.data ?? []) as unknown as ConversationRow[];
  const conversationTitles = recentConversations.map((c) => c.title).filter(Boolean);
  if (conversationTitles.length) lines.push(`Previously discussed with this student: ${conversationTitles.join(', ')}.`);

  return lines.join('\n');
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS_HEADERS });

  try {
    const authHeader = req.headers.get('Authorization') ?? '';
    const {
      conversationId,
      question,
      attachmentPath,
      attachmentName,
      context: pageContext,
    }: {
      conversationId: string;
      question: string;
      attachmentPath?: string;
      attachmentName?: string;
      context?: TutorPageContext;
    } = await req.json();

    // Client scoped to the caller's own JWT -- used for anything that must
    // respect RLS / auth.uid() (match_documents, reading their own conversation).
    const userClient = createClient(SUPABASE_URL, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: authHeader } },
    });
    const {
      data: { user },
      error: userError,
    } = await userClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Not authenticated' }), { status: 401, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } });
    }

    // Service-role client -- writes to knowledge_documents and reads the learner's
    // own profile/progress/exam/achievement data to personalize this response.
    const adminClient = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

    // Recent conversation history, for multi-turn context (this conversation is confirmed
    // to belong to the caller via the userClient query below, which is RLS-scoped).
    const { data: history } = await userClient
      .from('messages')
      .select('sender, content')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })
      .limit(20);

    const learnerContextBlock = await buildLearnerContextBlock(adminClient, user.id, conversationId, pageContext).catch(() => '');

    let attachmentContext = '';
    let imageDataUrl: string | null = null;

    // If an attachment came with this question: PDFs get their text extracted and embedded
    // into knowledge_documents so future questions can retrieve them too; images are passed
    // directly to the vision-capable chat model for this one question (not embedded/retrieved,
    // since there's no text to search on).
    if (attachmentPath) {
      const { data: fileBlob } = await adminClient.storage.from('documents').download(attachmentPath);
      if (fileBlob) {
        const isPdf = attachmentPath.toLowerCase().endsWith('.pdf');
        const mimeType = imageMimeType(attachmentPath);
        if (isPdf) {
          try {
            const buffer = new Uint8Array(await fileBlob.arrayBuffer());
            const parsed = await pdfParse(buffer);
            const text = parsed.text.trim();
            if (text) {
              attachmentContext = text.slice(0, 6000);
              const embedding = await embed(text);
              await adminClient.from('knowledge_documents').insert({
                profile_id: user.id,
                title: attachmentName ?? 'Uploaded document',
                file_name: attachmentName ?? attachmentPath.split('/').pop(),
                file_url: attachmentPath,
                file_type: 'application/pdf',
                content: text,
                embedding,
              });
            }
          } catch {
            // Extraction failed (e.g. scanned/image-only PDF) -- continue without it.
          }
        } else if (mimeType) {
          const base64 = arrayBufferToBase64(await fileBlob.arrayBuffer());
          imageDataUrl = `data:${mimeType};base64,${base64}`;
        }
      }
    }

    // Retrieval: search both the shared curriculum knowledge base (every topic's
    // real explanation + worked example, embedded in bulk) and the student's own
    // past uploads for relevant context. is_curriculum tells us which is which so
    // we never present official curriculum text as "the student's own material".
    let curriculumContext = '';
    let personalContext = '';
    try {
      const queryEmbedding = await embed(question);
      const { data: matches } = await userClient.rpc('match_documents', {
        p_query_embedding: queryEmbedding,
        p_match_count: 5,
      });
      const typedMatches = (matches ?? []) as { title: string; content: string; is_curriculum: boolean }[];
      curriculumContext = typedMatches
        .filter((m) => m.is_curriculum)
        .map((m) => `From "${m.title}":\n${m.content.slice(0, 1500)}`)
        .join('\n\n');
      personalContext = typedMatches
        .filter((m) => !m.is_curriculum)
        .map((m) => `From "${m.title}":\n${m.content.slice(0, 1500)}`)
        .join('\n\n');
    } catch {
      // Retrieval is best-effort -- an empty knowledge base or a transient error
      // shouldn't block the tutor from answering.
    }

    const contextBlock = [attachmentContext && `Attached document:\n${attachmentContext}`, personalContext && `Relevant past material:\n${personalContext}`]
      .filter(Boolean)
      .join('\n\n');

    const finalUserContent = imageDataUrl
      ? [
          { type: 'text', text: question },
          { type: 'image_url', image_url: { url: imageDataUrl } },
        ]
      : question;

    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...(learnerContextBlock ? [{ role: 'system', content: `LEARNER CONTEXT:\n${learnerContextBlock}` }] : []),
      ...(curriculumContext ? [{ role: 'system', content: `Official Maarifa Learn curriculum material (not the student's own upload -- this is the real syllabus content for this topic):\n\n${curriculumContext}` }] : []),
      ...(contextBlock ? [{ role: 'system', content: `Context from the student's own materials:\n\n${contextBlock}` }] : []),
      ...(history ?? []).map((m: { sender: string; content: string }) => ({
        role: m.sender === 'assistant' ? 'assistant' : 'user',
        content: m.content,
      })),
      { role: 'user', content: finalUserContent },
    ];

    const chatRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'gpt-5-mini', messages }),
    });
    if (!chatRes.ok) throw new Error(`Chat request failed: ${await chatRes.text()}`);
    const chatJson = await chatRes.json();
    const answer = chatJson.choices[0].message.content as string;

    return new Response(JSON.stringify({ answer }), { headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } });
  } catch (err) {
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : 'Unknown error' }), {
      status: 500,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  }
});
