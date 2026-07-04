import { useMemo, useState } from 'react';
import { examPapers, examSubjects } from '../data/examData';
import type { ExamMode, ExamPaper, ExamQuestion, ExamSubjectId } from '../data/examData';
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
import { useTheme } from '../context/ThemeContext';

type ExamScreen = 'dashboard' | 'list' | 'mode-select' | 'attempt' | 'results' | 'review';

const initialFilters: ExamFilterState = {
  year: 'All',
  term: 'All',
  difficulty: 'All',
  topic: 'All',
  type: 'All',
  duration: 'All',
  status: 'All',
  sort: 'Newest',
  query: '',
};

export default function ExamsView() {
  const { theme } = useTheme();
  const [selectedSubject, setSelectedSubject] = useState<ExamSubjectId>('mathematics');
  const [filters, setFilters] = useState(initialFilters);
  const [screen, setScreen] = useState<ExamScreen>('dashboard');
  const [activePaper, setActivePaper] = useState<ExamPaper | undefined>();
  const [examMode, setExamMode] = useState<ExamMode>('authentic');
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [flags, setFlags] = useState<Record<string, boolean>>({});
  const [questionBookmarks, setQuestionBookmarks] = useState<Record<string, boolean>>({});
  const [paperBookmarks, setPaperBookmarks] = useState<Record<string, boolean>>({});
  const [aiOpen, setAiOpen] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<ExamQuestion | undefined>();
  const [notice, setNotice] = useState('');

  const currentSubject = examSubjects.find((subject) => subject.id === selectedSubject) ?? examSubjects[0];
  const subjectPapers = examPapers.filter((paper) => paper.subjectId === selectedSubject);

  const filteredPapers = useMemo(() => {
    const filtered = subjectPapers.filter((paper) => {
      const matchesQuery = !filters.query || paper.title.toLowerCase().includes(filters.query.toLowerCase());
      const matchesYear = filters.year === 'All' || String(paper.year) === filters.year;
      const matchesTerm = filters.term === 'All' || paper.term === filters.term;
      const matchesDifficulty = filters.difficulty === 'All' || paper.difficulty === filters.difficulty;
      const matchesTopic = filters.topic === 'All' || paper.topics.includes(filters.topic);
      const matchesType = filters.type === 'All' || paper.type === filters.type;
      const matchesDuration = filters.duration === 'All' || (filters.duration === 'Under 2 hours' ? paper.durationMinutes < 120 : paper.durationMinutes >= 120);
      const matchesStatus = filters.status === 'All' || paper.completionStatus === filters.status;
      return matchesQuery && matchesYear && matchesTerm && matchesDifficulty && matchesTopic && matchesType && matchesDuration && matchesStatus;
    });
    return [...filtered].sort((a, b) => {
      if (filters.sort === 'Oldest') return a.year - b.year;
      if (filters.sort === 'Most Attempted') return b.attemptCount - a.attemptCount;
      return b.year - a.year;
    });
  }, [filters, subjectPapers]);

  const textColor = theme === 'light' ? 'text-slate-900' : 'text-white';
  const mutedColor = theme === 'light' ? 'text-slate-500' : 'text-gray-400';

  const startExam = (paper: ExamPaper, mode: ExamMode) => {
    setActivePaper(paper);
    setExamMode(mode);
    setAnswers({});
    setFlags({});
    setQuestionBookmarks({});
    setScreen('attempt');
    setNotice(mode === 'authentic' ? 'Authentic exam mode started. AI guidance disabled.' : 'AI guided mode started. Socratic tutor is available.');
  };

  const previewPaper = (paper: ExamPaper) => {
    setActivePaper(paper);
    setScreen('mode-select');
  };

  const downloadPaper = (paper: ExamPaper) => {
    setNotice(`${paper.title} download prepared. Supabase Storage integration will connect here later.`);
  };

  const togglePaperBookmark = (paperId: string) => setPaperBookmarks((prev) => ({ ...prev, [paperId]: !prev[paperId] }));
  const toggleFlag = (questionId: string) => setFlags((prev) => ({ ...prev, [questionId]: !prev[questionId] }));
  const toggleQuestionBookmark = (questionId: string) => setQuestionBookmarks((prev) => ({ ...prev, [questionId]: !prev[questionId] }));

  const progress = activePaper ? Math.round((Object.values(answers).filter(Boolean).length / activePaper.questions.length) * 100) : 0;

  return (
    <div className="flex flex-col gap-4 mt-2 flex-1 min-h-0">
      {notice && (
        <div className="glass-card px-4 py-3 flex items-center justify-between">
          <p className={`text-sm font-semibold ${textColor}`}>{notice}</p>
          <button onClick={() => setNotice('')} className="text-cyan-600 text-xs font-bold">Dismiss</button>
        </div>
      )}

      {screen !== 'attempt' && screen !== 'results' && screen !== 'review' && (
        <SubjectSelector subjects={examSubjects} selectedSubject={selectedSubject} onSelect={(id) => { setSelectedSubject(id); setScreen('list'); }} />
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
                bookmarked={Boolean(paperBookmarks[paper.id])}
                onPreview={previewPaper}
                onStart={startExam}
                onBookmark={togglePaperBookmark}
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
          <div className="grid grid-cols-2 gap-4 mt-5">
            <button onClick={() => startExam(activePaper, 'authentic')} className="text-left glass-card p-5 hover:border-cyan-500/30 transition-all">
              <h3 className={`font-bold text-lg ${textColor}`}>Authentic Examination Mode</h3>
              <p className={`text-sm mt-2 ${mutedColor}`}>A real examination simulation with no AI help, no hints, and no explanations until submission.</p>
              <span className="inline-flex mt-4 px-4 py-2 rounded-lg bg-blue-500 text-white text-xs font-bold">Start Authentic Exam</span>
            </button>
            <button onClick={() => startExam(activePaper, 'guided')} className="text-left glass-card p-5 hover:border-purple-500/30 transition-all">
              <h3 className={`font-bold text-lg ${textColor}`}>AI Guided Examination</h3>
              <p className={`text-sm mt-2 ${mutedColor}`}>A Socratic AI Tutor guides your thinking without directly revealing answers.</p>
              <span className="inline-flex mt-4 px-4 py-2 rounded-lg bg-purple-500 text-white text-xs font-bold">Start AI Walkthrough</span>
            </button>
          </div>
          <button onClick={() => setScreen('list')} className="mt-4 text-cyan-600 text-xs font-bold">Back to papers</button>
        </div>
      )}

      {screen === 'attempt' && activePaper && (
        <ExamInterface
          paper={activePaper}
          mode={examMode}
          answers={answers}
          flags={flags}
          bookmarks={questionBookmarks}
          onAnswer={(questionId, value) => setAnswers((prev) => ({ ...prev, [questionId]: value }))}
          onToggleFlag={toggleFlag}
          onToggleBookmark={toggleQuestionBookmark}
          onSubmit={() => setScreen('results')}
          onOpenAI={() => setAiOpen(true)}
          onQuestionChange={setCurrentQuestion}
        />
      )}

      {screen === 'results' && activePaper && (
        <ResultsDashboard paper={activePaper} answers={answers} onReview={() => setScreen('review')} onRetry={() => startExam(activePaper, examMode)} onBack={() => setScreen('dashboard')} />
      )}

      {screen === 'review' && activePaper && (
        <ReviewPanel paper={activePaper} answers={answers} onBackToResults={() => setScreen('results')} onGenerateSimilar={() => setNotice('Similar question generated and added to practice recommendations.')} />
      )}

      <FloatingAIButton isOpen={aiOpen} onClick={() => setAiOpen((value) => !value)} />
      <ExamAISidePanel open={aiOpen} subject={currentSubject} paper={activePaper} question={currentQuestion} mode={examMode} progress={progress} onClose={() => setAiOpen(false)} />
    </div>
  );
}