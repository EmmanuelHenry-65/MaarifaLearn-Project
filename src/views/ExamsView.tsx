import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useExamData } from '../hooks/useExamData';
import {
  startAttempt,
  submitAttempt,
  getPaperQuestions,
  getReviewQuestions,
  getAttemptAnswers,
  type ExamPaper,
  type ExamQuestion,
  type AttemptResult,
  type GradedAnswer,
} from '../services/examinations.service';
import AuthenticExamPanel from '../components/exams/AuthenticExamPanel';
import ExamAISidePanel from '../components/exams/ExamAISidePanel';
import ExamCard from '../components/exams/ExamCard';
import ExamDashboard from '../components/exams/ExamDashboard';
import ExamFilters from '../components/exams/ExamFilters';
import type { ExamFilterState } from '../components/exams/ExamFilters';
import ExamInterface from '../components/exams/ExamInterface';
import ResultsDashboard from '../components/exams/ResultsDashboard';
import ReviewPanel from '../components/exams/ReviewPanel';
import SubjectSelector from '../components/exams/SubjectSelector';
import FloatingAIButton from '../components/workspace/FloatingAIButton';
import { forceDownloadUrl } from '../utils/download';
import { useTheme } from '../context/ThemeContext';

export type ExamMode = 'authentic' | 'guided';
type ExamScreen = 'dashboard' | 'list' | 'mode-select' | 'attempt' | 'results' | 'review';

const initialFilters: ExamFilterState = {
  year: 'All',
  term: 'All',
  difficulty: 'All',
  type: 'All',
  duration: 'All',
  status: 'All',
  sort: 'Newest',
  query: '',
};

export default function ExamsView() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const { subjects, papers, bookmarkedIds, toggleBookmark, refresh, loading } = useExamData();

  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [filters, setFilters] = useState(initialFilters);
  const [screen, setScreen] = useState<ExamScreen>('dashboard');
  const [activePaper, setActivePaper] = useState<ExamPaper | undefined>();
  const [activeQuestions, setActiveQuestions] = useState<ExamQuestion[]>([]);
  const [examMode, setExamMode] = useState<ExamMode>('authentic');
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [attemptStartedAt, setAttemptStartedAt] = useState<number | null>(null);
  const [attemptResult, setAttemptResult] = useState<AttemptResult | null>(null);
  const [gradedAnswers, setGradedAnswers] = useState<GradedAnswer[]>([]);
  const [reviewQuestions, setReviewQuestions] = useState<ExamQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [flags, setFlags] = useState<Record<string, boolean>>({});
  const [questionBookmarks, setQuestionBookmarks] = useState<Record<string, boolean>>({});
  const [aiOpen, setAiOpen] = useState(false);
  const [showAuthenticPanel, setShowAuthenticPanel] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<ExamQuestion | undefined>();
  const [notice, setNotice] = useState('');

  const appliedDeepLink = useRef(false);

  // Deep-link support: /exams?subject=<id>&paper=<id> (used by Past Papers' "Start Practice" etc).
  useEffect(() => {
    if (appliedDeepLink.current || papers.length === 0) return;
    const paperId = searchParams.get('paper');
    const subjectParam = searchParams.get('subject');

    const foundPaper = paperId ? papers.find((p) => p.id === paperId) : undefined;
    if (foundPaper) {
      appliedDeepLink.current = true;
      setSelectedSubject(foundPaper.subjectId);
      setActivePaper(foundPaper);
      setScreen('mode-select');
      getPaperQuestions(foundPaper.id)
        .then(setActiveQuestions)
        .catch(() => setActiveQuestions([]));
      return;
    }

    if (subjectParam && subjects.some((s) => s.id === subjectParam)) {
      appliedDeepLink.current = true;
      setSelectedSubject(subjectParam);
    }
  }, [papers, subjects, searchParams]);

  // Default to the first subject once subjects have loaded, if nothing else selected it.
  useEffect(() => {
    if (selectedSubject || subjects.length === 0) return;
    setSelectedSubject(subjects[0].id);
  }, [subjects, selectedSubject]);

  const currentSubject = subjects.find((subject) => subject.id === selectedSubject) ?? subjects[0];
  const subjectPapers = useMemo(() => papers.filter((paper) => paper.subjectId === selectedSubject), [papers, selectedSubject]);

  const filteredPapers = useMemo(() => {
    const filtered = subjectPapers.filter((paper) => {
      const matchesQuery = !filters.query || paper.title.toLowerCase().includes(filters.query.toLowerCase());
      const matchesYear = filters.year === 'All' || String(paper.year) === filters.year;
      const matchesTerm = filters.term === 'All' || paper.term === filters.term;
      const matchesDifficulty = filters.difficulty === 'All' || paper.difficulty === filters.difficulty;
      const matchesType = filters.type === 'All' || paper.paperType === filters.type;
      const matchesDuration = filters.duration === 'All' || (filters.duration === 'Under 2 hours' ? (paper.durationMinutes ?? 0) < 120 : (paper.durationMinutes ?? 0) >= 120);
      const matchesStatus = filters.status === 'All' || paper.completionStatus === filters.status;
      return matchesQuery && matchesYear && matchesTerm && matchesDifficulty && matchesType && matchesDuration && matchesStatus;
    });
    return [...filtered].sort((a, b) => {
      if (filters.sort === 'Oldest') return (a.year ?? 0) - (b.year ?? 0);
      if (filters.sort === 'Most Attempted') return b.attemptCount - a.attemptCount;
      return (b.year ?? 0) - (a.year ?? 0);
    });
  }, [filters, subjectPapers]);

  const textColor = theme === 'light' ? 'text-slate-900' : 'text-white';
  const mutedColor = theme === 'light' ? 'text-slate-500' : 'text-gray-400';

  const previewPaper = async (paper: ExamPaper) => {
    setActivePaper(paper);
    setScreen('mode-select');
    setShowAuthenticPanel(false);
    try {
      setActiveQuestions(await getPaperQuestions(paper.id));
    } catch {
      setActiveQuestions([]);
    }
  };

  const startExam = async (paper: ExamPaper, mode: ExamMode) => {
    if (!user) return;
    try {
      const [id, questions] = await Promise.all([
        startAttempt(user.id, paper.id),
        activePaper?.id === paper.id && activeQuestions.length ? Promise.resolve(activeQuestions) : getPaperQuestions(paper.id),
      ]);
      setAttemptId(id);
      setActiveQuestions(questions);
      setActivePaper(paper);
      setExamMode(mode);
      setAnswers({});
      setFlags({});
      setQuestionBookmarks({});
      setAttemptResult(null);
      setGradedAnswers([]);
      setAttemptStartedAt(Date.now());
      setScreen('attempt');
      setNotice(mode === 'authentic' ? 'Authentic exam mode started. AI guidance disabled.' : 'AI guided mode started. Socratic tutor is available.');
    } catch {
      setNotice('Could not start the exam — please try again.');
    }
  };

  const submitExam = async () => {
    if (!attemptId) return;
    try {
      const result = await submitAttempt(attemptId, answers);
      setAttemptResult(result);
      const [graded, review] = await Promise.all([
        getAttemptAnswers(attemptId),
        getReviewQuestions(attemptId).catch(() => activeQuestions),
      ]);
      setGradedAnswers(graded);
      setReviewQuestions(review);
      setScreen('results');
      refresh();
    } catch {
      setNotice('Could not submit the exam — please try again.');
    }
  };

  const downloadPaper = (paper: ExamPaper) => {
    if (!paper.pdfUrl) {
      setNotice(`${paper.title}: PDF not uploaded yet.`);
      return;
    }
    window.open(forceDownloadUrl(paper.pdfUrl, `${paper.title}.pdf`), '_blank', 'noopener,noreferrer');
  };

  const toggleFlag = (questionId: string) => setFlags((prev) => ({ ...prev, [questionId]: !prev[questionId] }));
  const toggleQuestionBookmark = (questionId: string) => setQuestionBookmarks((prev) => ({ ...prev, [questionId]: !prev[questionId] }));

  const progress = activeQuestions.length ? Math.round((Object.values(answers).filter(Boolean).length / activeQuestions.length) * 100) : 0;
  const elapsedMinutes = attemptStartedAt ? Math.max(1, Math.round((Date.now() - attemptStartedAt) / 60000)) : 0;

  if (loading && subjects.length === 0) {
    return (
      <div className="flex items-center justify-center flex-1 min-h-0">
        <p className={`text-sm font-semibold ${mutedColor}`}>Loading exam center...</p>
      </div>
    );
  }

  if (!currentSubject) {
    return (
      <div className="flex items-center justify-center flex-1 min-h-0">
        <p className={`text-sm font-semibold ${mutedColor}`}>No subjects available yet.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 mt-2 flex-1 min-h-0">
      {notice && (
        <div className="glass-card px-4 py-3 flex items-center justify-between">
          <p className={`text-sm font-semibold ${textColor}`}>{notice}</p>
          <button onClick={() => setNotice('')} className="text-cyan-600 text-xs font-bold">Dismiss</button>
        </div>
      )}

      {screen !== 'attempt' && screen !== 'results' && screen !== 'review' && (
        <SubjectSelector subjects={subjects} selectedSubject={currentSubject.id} onSelect={(id) => { setSelectedSubject(id); setScreen('list'); }} />
      )}

      {screen === 'dashboard' && (
        <div className="flex-1 overflow-y-auto pr-1">
          <ExamDashboard
            currentSubject={currentSubject}
            recentExams={subjectPapers.slice(0, 3)}
            recommendedPapers={subjectPapers.slice(0, 3)}
            onContinue={(paper) => startExam(paper, 'authentic')}
            onSelectRecommended={previewPaper}
          />
          <div className="flex justify-end mt-4">
            <button onClick={() => setScreen('list')} className="px-4 py-2 rounded-lg bg-cyan-500 text-white text-xs font-bold">Browse All Exams</button>
          </div>
        </div>
      )}

      {screen === 'list' && (
        <div className="flex-1 overflow-y-auto pr-1 space-y-4">
          <ExamFilters filters={filters} papers={subjectPapers} onChange={setFilters} />
          <div className="grid grid-cols-2 gap-4">
            {filteredPapers.map((paper) => (
              <ExamCard
                key={paper.id}
                paper={paper}
                bookmarked={bookmarkedIds.has(paper.id)}
                onPreview={previewPaper}
                onStart={startExam}
                onBookmark={toggleBookmark}
                onDownload={downloadPaper}
              />
            ))}
          </div>
          {filteredPapers.length === 0 && (
            <div className="glass-card p-10 text-center">
              <p className={`font-bold ${textColor}`}>No exams match your filters.</p>
              <button onClick={() => setFilters(initialFilters)} className="mt-3 text-cyan-600 text-xs font-bold">Reset filters</button>
            </div>
          )}
        </div>
      )}

      {screen === 'mode-select' && activePaper && (
        <div className="glass-card p-6">
          <p className="text-cyan-600 text-xs font-bold uppercase">Choose Exam Mode</p>
          <h2 className={`text-2xl font-extrabold mt-1 ${textColor}`}>{activePaper.title}</h2>
          <p className={`text-sm mt-1 ${mutedColor}`}>{activePaper.year} • {activePaper.term} • {activePaper.durationMinutes} min • {activePaper.totalMarks} marks</p>

          {!showAuthenticPanel ? (
            <>
              {activePaper.questionCount === 0 && (
                <div className="mt-4 px-4 py-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 text-xs font-semibold">
                  This paper has no on-screen interactive questions — it's a downloadable exam only. Use "Authentic Paper Exam" below.
                </div>
              )}
              <div className="grid grid-cols-3 gap-4 mt-5">
                <button
                  onClick={() => startExam(activePaper, 'authentic')}
                  disabled={activePaper.questionCount === 0}
                  className="text-left glass-card p-5 hover:border-cyan-500/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-transparent"
                >
                  <h3 className={`font-bold text-lg ${textColor}`}>Quick Practice — No AI Help</h3>
                  <p className={`text-sm mt-2 ${mutedColor}`}>Answer on-screen, auto-graded instantly. No hints, no explanations until you submit.</p>
                  <span className="inline-flex mt-4 px-4 py-2 rounded-lg bg-blue-500 text-white text-xs font-bold">Start Quick Practice</span>
                </button>
                <button
                  onClick={() => startExam(activePaper, 'guided')}
                  disabled={activePaper.questionCount === 0}
                  className="text-left glass-card p-5 hover:border-purple-500/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-transparent"
                >
                  <h3 className={`font-bold text-lg ${textColor}`}>Quick Practice — AI Guided</h3>
                  <p className={`text-sm mt-2 ${mutedColor}`}>Answer on-screen with a Socratic AI Tutor guiding your thinking, without revealing answers.</p>
                  <span className="inline-flex mt-4 px-4 py-2 rounded-lg bg-purple-500 text-white text-xs font-bold">Start AI Walkthrough</span>
                </button>
                <button onClick={() => setShowAuthenticPanel(true)} className="text-left glass-card p-5 hover:border-green-500/30 transition-all">
                  <h3 className={`font-bold text-lg ${textColor}`}>Authentic Paper Exam</h3>
                  <p className={`text-sm mt-2 ${mutedColor}`}>Download the real exam paper, complete it offline like the real thing, then upload it for AI marking.</p>
                  <span className="inline-flex mt-4 px-4 py-2 rounded-lg bg-green-500 text-white text-xs font-bold">Download & Submit</span>
                </button>
              </div>
              <button onClick={() => setScreen('list')} className="mt-4 text-cyan-600 text-xs font-bold">Back to papers</button>
            </>
          ) : (
            <div className="mt-5">
              {user && <AuthenticExamPanel paper={activePaper} userId={user.id} />}
              <button onClick={() => setShowAuthenticPanel(false)} className="mt-4 text-cyan-600 text-xs font-bold">Back to mode selection</button>
            </div>
          )}
        </div>
      )}

      {screen === 'attempt' && activePaper && activeQuestions.length === 0 && (
        <div className="glass-card p-10 text-center">
          <p className={`font-bold ${textColor}`}>This paper has no interactive questions to practice.</p>
          <button onClick={() => setScreen('mode-select')} className="mt-3 text-cyan-600 text-xs font-bold">Back to mode selection</button>
        </div>
      )}

      {screen === 'attempt' && activePaper && activeQuestions.length > 0 && (
        <ExamInterface
          paper={activePaper}
          questions={activeQuestions}
          mode={examMode}
          answers={answers}
          flags={flags}
          bookmarks={questionBookmarks}
          onAnswer={(questionId, value) => setAnswers((prev) => ({ ...prev, [questionId]: value }))}
          onToggleFlag={toggleFlag}
          onToggleBookmark={toggleQuestionBookmark}
          onSubmit={submitExam}
          onOpenAI={() => setAiOpen(true)}
          onQuestionChange={setCurrentQuestion}
        />
      )}

      {screen === 'results' && activePaper && attemptResult && (
        <ResultsDashboard
          paper={activePaper}
          questions={activeQuestions}
          gradedAnswers={gradedAnswers}
          result={attemptResult}
          elapsedMinutes={elapsedMinutes}
          onReview={() => setScreen('review')}
          onRetry={() => startExam(activePaper, examMode)}
          onBack={() => setScreen('dashboard')}
        />
      )}

      {screen === 'review' && activePaper && (
        <ReviewPanel
          paper={activePaper}
          questions={reviewQuestions.length ? reviewQuestions : activeQuestions}
          answers={answers}
          gradedAnswers={gradedAnswers}
          onBackToResults={() => setScreen('results')}
          onGenerateSimilar={() => setNotice('Similar question generated and added to practice recommendations.')}
        />
      )}

      <FloatingAIButton isOpen={aiOpen} onClick={() => setAiOpen((value) => !value)} />
      <ExamAISidePanel open={aiOpen} subject={currentSubject} paper={activePaper} question={currentQuestion} mode={examMode} progress={progress} userId={user?.id ?? null} onClose={() => setAiOpen(false)} />
    </div>
  );
}
