// AI grading for short-answer/essay exam questions -- submit_exam_attempt()
// (a Postgres RPC) auto-grades multiple-choice/true-false but leaves
// short_answer/essay rows at marks_awarded = 0, is_correct = NULL forever,
// since a plain SQL function can't call an LLM. This Edge Function is the
// second pass: called right after submission, it grades every ungraded
// short-answer/essay answer against its marking scheme and finalizes the
// attempt's score.
//
// Deploy via `supabase functions deploy ai-grade-attempt` (uses the same
// OPENAI_API_KEY secret already set on the project).
//
// Request body: { attemptId: string }
// Response: { score: number, percentage: number, grade: string, gradedCount: number }

import { createClient } from 'npm:@supabase/supabase-js@2';

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')!;
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SYSTEM_PROMPT = `You are a strict but fair Kenyan Grade 10 CBE examiner grading short-answer and
essay exam questions against their official marking schemes. Award marks only for what the marking
scheme actually credits -- partial credit is fine when the scheme allows it, but do not invent credit
for content the scheme doesn't cover. If an answer is blank or completely off-topic, award 0.

You will be given a JSON array of questions, each with: questionId, questionText, markingScheme,
maxMarks, and the student's studentAnswer. Return ONLY valid JSON, no commentary, no markdown code
fences, as an array in exactly this structure:
[
  { "questionId": "...", "marksAwarded": <number, 0 to maxMarks>, "feedback": "<1-3 sentences: what
    was right, what was missing, referencing the marking scheme>" }
]
Return exactly one entry per question given, in any order.`;

function gradeToLetter(percentage: number): string {
  if (percentage >= 80) return 'A';
  if (percentage >= 70) return 'B';
  if (percentage >= 60) return 'C';
  if (percentage >= 50) return 'D';
  return 'E';
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS_HEADERS });

  try {
    const authHeader = req.headers.get('Authorization') ?? '';
    const { attemptId }: { attemptId: string } = await req.json();

    const userClient = createClient(SUPABASE_URL, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: authHeader } },
    });
    const {
      data: { user },
      error: userError,
    } = await userClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Not authenticated' }), { status: 401, headers: CORS_HEADERS });
    }

    // RLS on exam_attempts scopes this to profile_id = auth.uid(), so an
    // attemptId belonging to another student simply returns no row.
    const { data: attempt, error: attemptError } = await userClient
      .from('exam_attempts')
      .select('id, paper_id')
      .eq('id', attemptId)
      .maybeSingle<{ id: string; paper_id: string }>();
    if (attemptError || !attempt) {
      return new Response(JSON.stringify({ error: 'Attempt not found or not yours' }), { status: 404, headers: CORS_HEADERS });
    }

    const adminClient = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

    const { data: ungraded, error: ungradedError } = await adminClient
      .from('student_answers')
      .select('question_id, answer, questions!inner(question_text, question_type, marking_scheme, marks)')
      .eq('attempt_id', attemptId)
      .is('is_correct', null)
      .in('questions.question_type', ['short_answer', 'essay']);
    if (ungradedError) throw new Error(`Failed to read student_answers (check service_role grants): ${ungradedError.message}`);

    type UngradedRow = {
      question_id: string;
      answer: string | null;
      questions: { question_text: string; question_type: string; marking_scheme: string | null; marks: number };
    };
    const rows = (ungraded ?? []) as unknown as UngradedRow[];

    if (rows.length > 0) {
      const gradingInput = rows.map((r) => ({
        questionId: r.question_id,
        questionText: r.questions.question_text,
        markingScheme: r.questions.marking_scheme ?? 'No marking scheme provided -- use general subject knowledge to judge correctness.',
        maxMarks: r.questions.marks,
        studentAnswer: r.answer?.trim() || '(no answer submitted)',
      }));

      const chatRes = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { Authorization: `Bearer ${OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'gpt-5-mini',
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: JSON.stringify(gradingInput) },
          ],
        }),
      });
      if (!chatRes.ok) throw new Error(`Chat request failed: ${await chatRes.text()}`);
      const chatJson = await chatRes.json();
      const raw = chatJson.choices[0].message.content as string;

      let results: { questionId: string; marksAwarded: number; feedback: string }[] = [];
      try {
        results = JSON.parse(raw);
      } catch {
        // Best-effort -- if parsing fails, leave these rows ungraded rather than guess.
        results = [];
      }

      const byId = new Map(rows.map((r) => [r.question_id, r.questions.marks]));
      for (const result of results) {
        const maxMarks = byId.get(result.questionId);
        if (maxMarks === undefined) continue;
        const marksAwarded = Math.max(0, Math.min(maxMarks, Math.round(result.marksAwarded)));
        const { error: updateError } = await adminClient
          .from('student_answers')
          .update({ marks_awarded: marksAwarded, is_correct: marksAwarded >= maxMarks, ai_feedback: result.feedback ?? null })
          .eq('attempt_id', attemptId)
          .eq('question_id', result.questionId);
        if (updateError) throw new Error(`Failed to save grading result (check service_role grants): ${updateError.message}`);
      }
    }

    // Recompute the final score across every question (auto-graded MCQ/true-false
    // already in student_answers, plus whatever was just AI-graded above).
    const { data: allAnswers, error: allAnswersError } = await adminClient
      .from('student_answers')
      .select('marks_awarded')
      .eq('attempt_id', attemptId);
    if (allAnswersError) throw new Error(`Failed to recompute score: ${allAnswersError.message}`);

    const { data: allQuestions, error: allQuestionsError } = await adminClient
      .from('questions')
      .select('marks')
      .eq('paper_id', attempt.paper_id);
    if (allQuestionsError) throw new Error(`Failed to recompute total marks: ${allQuestionsError.message}`);

    const earnedMarks = (allAnswers ?? []).reduce((sum, a) => sum + Number(a.marks_awarded ?? 0), 0);
    const totalMarks = (allQuestions ?? []).reduce((sum, q) => sum + Number(q.marks ?? 0), 0);
    const percentage = totalMarks > 0 ? Math.round((earnedMarks / totalMarks) * 1000) / 10 : 0;
    const grade = gradeToLetter(percentage);

    const { error: finalUpdateError } = await adminClient
      .from('exam_attempts')
      .update({ score: earnedMarks, percentage, grade, status: 'graded' })
      .eq('id', attemptId);
    if (finalUpdateError) throw new Error(`Failed to finalize attempt (check service_role grants): ${finalUpdateError.message}`);

    return new Response(JSON.stringify({ score: earnedMarks, percentage, grade, gradedCount: rows.length }), {
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : 'Unknown error' }), {
      status: 500,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  }
});
