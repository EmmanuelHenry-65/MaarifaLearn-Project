import { supabase } from '../lib/supabase';

export type QuestionType = 'multiple_choice' | 'short_answer' | 'essay' | 'true_false';
export type Difficulty = 'easy' | 'medium' | 'hard';
export type PaperType = 'assignment' | 'midterm' | 'endterm' | 'mock' | 'kcse';
export type CompletionStatus = 'Not Started' | 'In Progress' | 'Completed';

export interface ExamSubject {
  id: string;
  code: string;
  name: string;
  icon: string;
  colorKey: string;
  /** Average percentage across this user's own submitted/graded attempts in the subject (0 if none yet). */
  readiness: number;
}

export interface ExamPaper {
  id: string;
  subjectId: string;
  subjectCode: string;
  subjectName: string;
  subjectIcon: string;
  subjectColorKey: string;
  title: string;
  slug: string | null;
  year: number | null;
  term: string | null;
  paperType: PaperType | null;
  durationMinutes: number | null;
  difficulty: Difficulty;
  totalMarks: number;
  questionCount: number;
  pdfUrl: string | null;
  completionStatus: CompletionStatus;
  /** Percentage from this user's most recent submitted/graded attempt on this paper, or null if never attempted. */
  latestScore: number | null;
  /** How many times this user has attempted this specific paper. */
  attemptCount: number;
}

export interface ExamQuestion {
  id: string;
  paperId: string;
  topicId: string | null;
  questionText: string;
  questionType: QuestionType;
  optionA: string | null;
  optionB: string | null;
  optionC: string | null;
  optionD: string | null;
  marks: number;
  markingScheme: string | null;
  aiExplanation: string | null;
}

export interface ExamStats {
  papersAttempted: number;
  averageScore: number;
  bestScore: number;
  totalPracticeMinutes: number;
}

export function difficultyLabel(d: Difficulty): 'Foundation' | 'Intermediate' | 'Advanced' {
  if (d === 'easy') return 'Foundation';
  if (d === 'hard') return 'Advanced';
  return 'Intermediate';
}

export function paperTypeLabel(t: PaperType | null): string {
  switch (t) {
    case 'kcse':
      return 'KCSE Practice';
    case 'mock':
      return 'Mock Exam';
    case 'midterm':
      return 'Midterm';
    case 'endterm':
      return 'End Term';
    case 'assignment':
      return 'Assignment';
    default:
      return 'Exam Paper';
  }
}

interface RawSubjectRow {
  id: string;
  code: string;
  name: string;
  icon: string | null;
  color_key: string | null;
}

interface RawAttemptForReadiness {
  percentage: number | string | null;
  status: string;
  paper: { subject_id: string } | null;
}

/** All exam subjects with this user's own readiness (average score) folded in. */
export async function getExamSubjects(userId: string): Promise<ExamSubject[]> {
  const [subjectsRes, attemptsRes] = await Promise.all([
    supabase.from('subjects').select('id, code, name, icon, color_key').returns<RawSubjectRow[]>(),
    supabase
      .from('exam_attempts')
      .select('percentage, status, paper:past_papers ( subject_id )')
      .eq('profile_id', userId)
      .in('status', ['submitted', 'graded'])
      .returns<RawAttemptForReadiness[]>(),
  ]);

  if (subjectsRes.error) throw subjectsRes.error;
  if (attemptsRes.error) throw attemptsRes.error;

  const scoresBySubject = new Map<string, number[]>();
  for (const attempt of attemptsRes.data ?? []) {
    const subjectId = attempt.paper?.subject_id;
    if (!subjectId) continue;
    const list = scoresBySubject.get(subjectId) ?? [];
    list.push(Number(attempt.percentage ?? 0));
    scoresBySubject.set(subjectId, list);
  }

  return (subjectsRes.data ?? []).map((row) => {
    const scores = scoresBySubject.get(row.id) ?? [];
    return {
      id: row.id,
      code: row.code,
      name: row.name,
      icon: row.icon ?? '',
      colorKey: row.color_key ?? row.code,
      readiness: scores.length ? Math.round(scores.reduce((sum, s) => sum + s, 0) / scores.length) : 0,
    };
  });
}

interface RawPaperRow {
  id: string;
  subject_id: string;
  title: string;
  slug: string | null;
  year: number | null;
  term: string | null;
  paper_type: PaperType | null;
  duration_minutes: number | null;
  difficulty: Difficulty | null;
  pdf_url: string | null;
  subject: { code: string; name: string; icon: string | null; color_key: string | null } | null;
  questions: { marks: number }[];
}

interface RawAttemptRow {
  paper_id: string;
  percentage: number | string | null;
  status: string;
  started_at: string;
}

/** Every past paper, joined with this user's own attempt history for completion status / score / attempt count. */
export async function getExamPapers(userId: string): Promise<ExamPaper[]> {
  const [papersRes, attemptsRes] = await Promise.all([
    supabase
      .from('past_papers')
      .select(
        `
        id, subject_id, title, slug, year, term, paper_type, duration_minutes, difficulty, pdf_url,
        subject:subjects ( code, name, icon, color_key ),
        questions ( marks )
      `,
      )
      .returns<RawPaperRow[]>(),
    supabase
      .from('exam_attempts')
      .select('paper_id, percentage, status, started_at')
      .eq('profile_id', userId)
      .order('started_at', { ascending: false })
      .returns<RawAttemptRow[]>(),
  ]);

  if (papersRes.error) throw papersRes.error;
  if (attemptsRes.error) throw attemptsRes.error;

  const attemptsByPaper = new Map<string, RawAttemptRow[]>();
  for (const attempt of attemptsRes.data ?? []) {
    const list = attemptsByPaper.get(attempt.paper_id) ?? [];
    list.push(attempt);
    attemptsByPaper.set(attempt.paper_id, list);
  }

  return (papersRes.data ?? [])
    .filter((row): row is RawPaperRow & { subject: NonNullable<RawPaperRow['subject']> } => Boolean(row.subject))
    .map((row) => {
      // attemptsRes is ordered newest-first, so [0] is this user's most recent attempt on this paper.
      const attempts = attemptsByPaper.get(row.id) ?? [];
      const latest = attempts[0];

      let completionStatus: CompletionStatus = 'Not Started';
      if (latest) completionStatus = latest.status === 'in_progress' ? 'In Progress' : 'Completed';

      return {
        id: row.id,
        subjectId: row.subject_id,
        subjectCode: row.subject.code,
        subjectName: row.subject.name,
        subjectIcon: row.subject.icon ?? '',
        subjectColorKey: row.subject.color_key ?? row.subject.code,
        title: row.title,
        slug: row.slug,
        year: row.year,
        term: row.term,
        paperType: row.paper_type,
        durationMinutes: row.duration_minutes,
        difficulty: row.difficulty ?? 'medium',
        totalMarks: row.questions.reduce((sum, q) => sum + q.marks, 0),
        questionCount: row.questions.length,
        pdfUrl: row.pdf_url,
        completionStatus,
        latestScore: latest && latest.status !== 'in_progress' ? Math.round(Number(latest.percentage ?? 0)) : null,
        attemptCount: attempts.length,
      };
    });
}

interface RawQuestionRow {
  id: string;
  paper_id: string;
  topic_id: string | null;
  question_text: string;
  question_type: QuestionType;
  option_a: string | null;
  option_b: string | null;
  option_c: string | null;
  option_d: string | null;
  marks: number;
  marking_scheme: string | null;
  ai_explanation: string | null;
}

/**
 * Questions for a single paper, via the column set the DB actually grants to
 * `authenticated` (correct_answer is revoked at the column level -- see
 * database/schema/18_rls_hardening.sql and 20_examinations_extensions.sql --
 * so it is never requested here).
 */
export async function getPaperQuestions(paperId: string): Promise<ExamQuestion[]> {
  const { data, error } = await supabase
    .from('questions')
    .select('id, paper_id, topic_id, question_text, question_type, option_a, option_b, option_c, option_d, marks, marking_scheme, ai_explanation')
    .eq('paper_id', paperId)
    .returns<RawQuestionRow[]>();

  if (error) throw error;

  return (data ?? []).map((row) => ({
    id: row.id,
    paperId: row.paper_id,
    topicId: row.topic_id,
    questionText: row.question_text,
    questionType: row.question_type,
    optionA: row.option_a,
    optionB: row.option_b,
    optionC: row.option_c,
    optionD: row.option_d,
    marks: row.marks,
    markingScheme: row.marking_scheme,
    aiExplanation: row.ai_explanation,
  }));
}

/** Resumes the user's existing in-progress attempt on this paper if one exists, otherwise starts a new one. */
export async function startAttempt(userId: string, paperId: string): Promise<string> {
  const { data: existing, error: findError } = await supabase
    .from('exam_attempts')
    .select('id')
    .eq('profile_id', userId)
    .eq('paper_id', paperId)
    .eq('status', 'in_progress')
    .maybeSingle();
  if (findError) throw findError;
  if (existing) return existing.id;

  const { data, error } = await supabase
    .from('exam_attempts')
    .insert({ profile_id: userId, paper_id: paperId, status: 'in_progress' })
    .select('id')
    .single();
  if (error) throw error;
  return data.id;
}

export interface AttemptResult {
  score: number;
  percentage: number;
  grade: string;
}

/**
 * Grades the attempt server-side via the submit_exam_attempt() RPC
 * (database/schema/20_examinations_extensions.sql). Clients cannot UPDATE
 * exam_attempts or write student_answers directly -- both are revoked --
 * so this RPC is the only path to a submitted score.
 */
export async function submitAttempt(attemptId: string, answers: Record<string, string>): Promise<AttemptResult> {
  const { data, error } = await supabase
    .rpc('submit_exam_attempt', { p_attempt_id: attemptId, p_answers: answers })
    .single<{ score: number | string; percentage: number | string; grade: string }>();
  if (error) throw error;

  return {
    score: Number(data.score),
    percentage: Number(data.percentage),
    grade: data.grade,
  };
}

export interface GradedAnswer {
  questionId: string;
  answer: string;
  marksAwarded: number;
  isCorrect: boolean | null;
}

/** This user's graded answers for one attempt, used by the Results/Review screens. */
export async function getAttemptAnswers(attemptId: string): Promise<GradedAnswer[]> {
  const { data, error } = await supabase
    .from('student_answers')
    .select('question_id, answer, marks_awarded, is_correct')
    .eq('attempt_id', attemptId)
    .returns<{ question_id: string; answer: string | null; marks_awarded: number | string; is_correct: boolean | null }[]>();
  if (error) throw error;

  return (data ?? []).map((row) => ({
    questionId: row.question_id,
    answer: row.answer ?? '',
    marksAwarded: Number(row.marks_awarded),
    isCorrect: row.is_correct,
  }));
}

export async function togglePaperBookmark(userId: string, paperId: string, shouldBookmark: boolean): Promise<void> {
  if (shouldBookmark) {
    const { error } = await supabase
      .from('bookmarks')
      .upsert({ profile_id: userId, paper_id: paperId }, { onConflict: 'profile_id,paper_id' });
    if (error) throw error;
  } else {
    const { error } = await supabase.from('bookmarks').delete().eq('profile_id', userId).eq('paper_id', paperId);
    if (error) throw error;
  }
}

export async function getBookmarkedPaperIds(userId: string): Promise<Set<string>> {
  const { data, error } = await supabase
    .from('bookmarks')
    .select('paper_id')
    .eq('profile_id', userId)
    .not('paper_id', 'is', null)
    .returns<{ paper_id: string }[]>();
  if (error) throw error;

  return new Set((data ?? []).map((row) => row.paper_id));
}

/** Papers-attempted / average / best score / total practice time, derived entirely from this user's real attempts. */
export async function getExamStats(userId: string): Promise<ExamStats> {
  const { data, error } = await supabase
    .from('exam_attempts')
    .select('paper_id, percentage, started_at, submitted_at')
    .eq('profile_id', userId)
    .in('status', ['submitted', 'graded'])
    .returns<{ paper_id: string; percentage: number | string | null; started_at: string; submitted_at: string | null }[]>();

  if (error) throw error;

  const attempts = data ?? [];
  const papersAttempted = new Set(attempts.map((a) => a.paper_id)).size;
  const scores = attempts.map((a) => Number(a.percentage ?? 0));
  const averageScore = scores.length ? Math.round(scores.reduce((sum, s) => sum + s, 0) / scores.length) : 0;
  const bestScore = scores.length ? Math.max(...scores) : 0;

  const totalPracticeMinutes = attempts.reduce((sum, a) => {
    if (!a.submitted_at) return sum;
    const minutes = (new Date(a.submitted_at).getTime() - new Date(a.started_at).getTime()) / 60000;
    return sum + Math.max(0, Math.round(minutes));
  }, 0);

  return { papersAttempted, averageScore, bestScore, totalPracticeMinutes };
}
