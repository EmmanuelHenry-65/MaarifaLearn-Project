// AI exam marking -- grades an uploaded "Authentic Paper Exam" answer sheet
// against the official marking-scheme PDF for that paper. These papers have
// no structured `questions` rows (see 24_past_papers_marking_scheme.sql), so
// grading is holistic: the whole answer sheet vs. the whole marking scheme,
// not question-by-question DB joins.
//
// Real Kenyan marking-scheme PDFs are often scans with no embedded text layer
// (confirmed: pdf-parse extracts 0 characters from them), so this sends PDFs
// to OpenAI as native `file` content parts rather than pre-extracting text --
// OpenAI's vision-capable models extract both text AND render page images
// server-side, which handles scanned documents correctly.
//
// Deploy via `supabase functions deploy ai-mark-exam` (uses the same
// OPENAI_API_KEY secret already set on the project for ai-tutor-chat).
//
// Request body: { submissionId: string }
// Response: { aiScore: number | null, aiPercentage: number | null, aiFeedback: string }

import { createClient } from 'npm:@supabase/supabase-js@2';

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')!;
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SYSTEM_PROMPT = `You are a strict but fair Kenyan Grade 10 CBE examiner marking a student's
completed exam paper against the official marking scheme provided below. Award marks only for
what the marking scheme actually credits -- do not be lenient or generous, and do not invent
credit for answers the scheme does not cover. If the student's answers are partially illegible
or missing, mark only what you can clearly read and say so plainly in your feedback rather than
guessing generously in their favour.

Return ONLY valid JSON, no commentary, no markdown code fences, in exactly this structure:
{
  "totalMarksAvailable": <number, the total marks available per the marking scheme>,
  "marksAwarded": <number, total marks you awarded the student>,
  "feedback": "<several sentences of specific, honest feedback: what they got right, what they
    got wrong or missed, and concrete advice for improvement, referencing specific questions
    where possible>"
}

If the student's answer sheet could not be read at all (e.g. blank, corrupted, or completely
illegible), set both numbers to null and explain clearly in "feedback" what went wrong and what
the student should try instead (e.g. re-uploading a clearer photo).`;

function imageMimeType(path: string): string | null {
  const lower = path.toLowerCase();
  if (lower.endsWith('.png')) return 'image/png';
  if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) return 'image/jpeg';
  if (lower.endsWith('.webp')) return 'image/webp';
  if (lower.endsWith('.gif')) return 'image/gif';
  return null;
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

type ContentPart =
  | { type: 'text'; text: string }
  | { type: 'image_url'; image_url: { url: string } }
  | { type: 'file'; file: { filename: string; file_data: string } };

/** Downloads a file (from a private bucket or a public URL) and returns it as a
 * file/image content part for the OpenAI vision-capable chat model, or null if
 * it couldn't be downloaded or isn't a recognized type. */
async function toContentPart(bytes: ArrayBuffer, filename: string): Promise<ContentPart | null> {
  if (filename.toLowerCase().endsWith('.pdf')) {
    return { type: 'file', file: { filename, file_data: `data:application/pdf;base64,${arrayBufferToBase64(bytes)}` } };
  }
  const mimeType = imageMimeType(filename);
  if (mimeType) {
    return { type: 'image_url', image_url: { url: `data:${mimeType};base64,${arrayBufferToBase64(bytes)}` } };
  }
  return null;
}

async function downloadPrivateFile(adminClient: ReturnType<typeof createClient>, path: string): Promise<ArrayBuffer | null> {
  const { data: blob } = await adminClient.storage.from('documents').download(path);
  return blob ? blob.arrayBuffer() : null;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS_HEADERS });

  try {
    const authHeader = req.headers.get('Authorization') ?? '';
    const { submissionId }: { submissionId: string } = await req.json();

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

    // RLS on exam_submissions already scopes SELECT to profile_id = auth.uid(),
    // so a submissionId belonging to another student simply returns no row here.
    // Note: no guard on submission.status here -- re-running marking is
    // idempotent (it just overwrites the previous result), which is what lets
    // a student retry a submission that got stuck at 'ai_reviewing' because a
    // prior run crashed or timed out before reaching the final status update.
    const { data: submission, error: submissionError } = await userClient
      .from('exam_submissions')
      .select('id, paper_id, file_path, status')
      .eq('id', submissionId)
      .maybeSingle<{ id: string; paper_id: string; file_path: string; status: string }>();
    if (submissionError || !submission) {
      return new Response(JSON.stringify({ error: 'Submission not found or not yours' }), { status: 404, headers: CORS_HEADERS });
    }

    // Service-role client -- only this can update exam_submissions (students have
    // no UPDATE grant at all, per 22_exam_submissions.sql) and read the
    // admin-only marking_scheme_pdf_path column on past_papers.
    const adminClient = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

    const { error: markReviewingError } = await adminClient.from('exam_submissions').update({ status: 'ai_reviewing' }).eq('id', submissionId);
    if (markReviewingError) throw new Error(`Failed to update submission status (check service_role grants on exam_submissions): ${markReviewingError.message}`);

    const { data: paper, error: paperError } = await adminClient
      .from('past_papers')
      .select('title, pdf_url, marking_scheme_pdf_path')
      .eq('id', submission.paper_id)
      .maybeSingle<{ title: string; pdf_url: string | null; marking_scheme_pdf_path: string | null }>();
    if (paperError) throw new Error(`Failed to read past_papers (check service_role grants): ${paperError.message}`);

    let markingSchemePart: ContentPart | null = null;
    if (paper?.marking_scheme_pdf_path) {
      const bytes = await downloadPrivateFile(adminClient, paper.marking_scheme_pdf_path);
      if (bytes) markingSchemePart = await toContentPart(bytes, paper.marking_scheme_pdf_path);
    }

    // The original exam paper (public bucket) gives full question text/context,
    // which marking schemes don't always restate in full. Best-effort only.
    let examPaperPart: ContentPart | null = null;
    if (paper?.pdf_url) {
      try {
        const res = await fetch(paper.pdf_url);
        if (res.ok) examPaperPart = await toContentPart(await res.arrayBuffer(), paper.pdf_url);
      } catch {
        // Best-effort -- marking can proceed on the marking scheme alone.
      }
    }

    let studentPart: ContentPart | null = null;
    const studentBytes = await downloadPrivateFile(adminClient, submission.file_path);
    if (studentBytes) studentPart = await toContentPart(studentBytes, submission.file_path);

    let aiScore: number | null = null;
    let aiPercentage: number | null = null;
    let aiFeedback: string;

    if (!markingSchemePart) {
      aiFeedback = "This paper's marking scheme couldn't be read, so it could not be AI-marked. Please check back later.";
    } else if (!studentPart) {
      aiFeedback = "We couldn't read your submitted answer sheet (it may be corrupted or in an unsupported format). Please try re-uploading a clear photo (JPG/PNG) or PDF.";
    } else {
      const userContent: ContentPart[] = [
        { type: 'text', text: 'Official marking scheme:' },
        markingSchemePart,
        ...(examPaperPart ? [{ type: 'text' as const, text: 'Original exam paper (for full question context):' }, examPaperPart] : []),
        { type: 'text', text: "Student's submitted answer sheet:" },
        studentPart,
        { type: 'text', text: "Mark this student's submission against the marking scheme above and return the JSON result." },
      ];

      const chatRes = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { Authorization: `Bearer ${OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'gpt-5-mini',
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: userContent },
          ],
        }),
      });
      if (!chatRes.ok) throw new Error(`Chat request failed: ${await chatRes.text()}`);
      const chatJson = await chatRes.json();
      const raw = chatJson.choices[0].message.content as string;

      try {
        const parsed = JSON.parse(raw);
        const total = typeof parsed.totalMarksAvailable === 'number' ? parsed.totalMarksAvailable : null;
        const awarded = typeof parsed.marksAwarded === 'number' ? parsed.marksAwarded : null;
        aiScore = awarded;
        aiPercentage = total && awarded !== null ? Math.round((awarded / total) * 100) : null;
        aiFeedback = typeof parsed.feedback === 'string' ? parsed.feedback : 'Marking completed, but feedback could not be parsed.';
      } catch {
        aiFeedback = `Marking completed, but the result could not be parsed cleanly. Raw response: ${raw.slice(0, 2000)}`;
      }
    }

    const { error: finalUpdateError } = await adminClient
      .from('exam_submissions')
      .update({
        status: 'reviewed',
        ai_score: aiScore,
        ai_percentage: aiPercentage,
        ai_feedback: aiFeedback,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', submissionId);
    if (finalUpdateError) throw new Error(`Failed to save marking result (check service_role grants on exam_submissions): ${finalUpdateError.message}`);

    return new Response(JSON.stringify({ aiScore, aiPercentage, aiFeedback }), { headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } });
  } catch (err) {
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : 'Unknown error' }), {
      status: 500,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  }
});
