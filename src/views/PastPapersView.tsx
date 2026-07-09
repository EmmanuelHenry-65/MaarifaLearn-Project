import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useExamData } from '../hooks/useExamData';
import { difficultyLabel, paperTypeLabel, type CompletionStatus, type Difficulty, type ExamPaper } from '../services/examinations.service';
import { forceDownloadUrl } from '../utils/download';

type TabKey = 'All Papers' | 'My Attempts' | 'Bookmarked';
type PerfRange = 'This Year' | 'Last Year' | 'All Time';

const DEFAULT_STYLE = { color: 'bg-slate-500/10 border-slate-500/30 text-slate-400', ring: '#94a3b8' };

const subjectStyles: Record<string, { color: string; ring: string }> = {
  mathematics: { color: 'bg-purple-500/10 border-purple-500/30 text-purple-400', ring: '#a855f7' },
  english: { color: 'bg-blue-500/10 border-blue-500/30 text-blue-400', ring: '#3b82f6' },
  kiswahili: { color: 'bg-teal-500/10 border-teal-500/30 text-teal-400', ring: '#14b8a6' },
  ict: { color: 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400', ring: '#22d3ee' },
  pe: { color: 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400', ring: '#6366f1' },
  csl: { color: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400', ring: '#10b981' },
  physics: { color: 'bg-amber-500/10 border-amber-500/30 text-amber-400', ring: '#f59e0b' },
  chemistry: { color: 'bg-orange-500/10 border-orange-500/30 text-orange-400', ring: '#f97316' },
  'computer-studies': { color: 'bg-pink-500/10 border-pink-500/30 text-pink-400', ring: '#ec4899' },
};

const styleFor = (colorKey: string) => subjectStyles[colorKey] ?? DEFAULT_STYLE;

const actionForStatus = (status: CompletionStatus) =>
  status === 'Completed' ? 'Review Attempt' : status === 'In Progress' ? 'Continue Practice' : 'Start Practice';

const tryAskingPrompts = ['Explain this concept', 'Help me solve a question', 'Why is this answer correct?', 'Give me a hint'];

function ScoreRing({ score, color }: { score: number; color: string }) {
  const radius = 16;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative w-10 h-10 flex-shrink-0">
      <svg width="40" height="40" className="progress-ring">
        <circle cx="20" cy="20" r={radius} stroke="rgba(56, 78, 135, 0.25)" strokeWidth="3" fill="none" />
        <circle cx="20" cy="20" r={radius} stroke={color} strokeWidth="3" fill="none" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset} />
      </svg>
    </div>
  );
}

export default function PastPapersView() {
  const navigate = useNavigate();
  const { subjects, papers, stats: realStats, bookmarkedIds, toggleBookmark: toggleBookmarkRemote, loading, error } = useExamData();

  const [activeTab, setActiveTab] = useState<TabKey>('All Papers');
  const [search, setSearch] = useState('');
  const [subjectFilter, setSubjectFilter] = useState<string | null>(null);
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [yearFilter, setYearFilter] = useState<'All' | number>('All');
  const [difficultyFilter, setDifficultyFilter] = useState<'All' | Difficulty>('All');
  const [visibleCount, setVisibleCount] = useState(6);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [notice, setNotice] = useState('');
  const [perfRange, setPerfRange] = useState<PerfRange>('This Year');
  const [showPerfMenu, setShowPerfMenu] = useState(false);
  const [aiQuestion, setAiQuestion] = useState('');

  const toggleBookmark = (paperId: string) => {
    toggleBookmarkRemote(paperId).catch(() => setNotice('Could not update bookmark — please try again.'));
  };

  const years = useMemo(() => Array.from(new Set(papers.map((p) => p.year).filter((y): y is number => y != null))).sort((a, b) => b - a), [papers]);
  const maxYear = years[0];

  const attemptedPapers = useMemo(() => papers.filter((p) => p.completionStatus !== 'Not Started'), [papers]);

  const stats = useMemo(() => {
    const hours = Math.floor(realStats.totalPracticeMinutes / 60);
    const minutes = realStats.totalPracticeMinutes % 60;

    return [
      { label: 'Papers Attempted', value: String(realStats.papersAttempted), sub: realStats.papersAttempted ? 'Keep practicing!' : 'Get started today', kind: 'file' as const, color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' },
      { label: 'Average Score', value: `${realStats.averageScore}%`, sub: realStats.averageScore >= 70 ? 'Good job!' : 'Room to improve', kind: 'check' as const, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
      { label: 'Best Score', value: `${realStats.bestScore}%`, sub: realStats.bestScore >= 80 ? 'Excellent!' : 'Keep it up!', kind: 'trend' as const, color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/20' },
      { label: 'Total Practice Time', value: `${hours}h ${minutes}m`, sub: 'All time', kind: 'clock' as const, color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/20' },
    ];
  }, [realStats]);

  const baseFiltered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return papers
      .filter((p) => {
        const matchesSubject = !subjectFilter || p.subjectId === subjectFilter;
        const matchesSearch = !q || p.title.toLowerCase().includes(q) || p.subjectName.toLowerCase().includes(q) || String(p.year).includes(q);
        const matchesYear = yearFilter === 'All' || p.year === yearFilter;
        const matchesDifficulty = difficultyFilter === 'All' || p.difficulty === difficultyFilter;
        return matchesSubject && matchesSearch && matchesYear && matchesDifficulty;
      })
      .sort((a, b) => (b.year ?? 0) - (a.year ?? 0));
  }, [papers, subjectFilter, search, yearFilter, difficultyFilter]);

  const tabFiltered = useMemo(() => {
    if (activeTab === 'My Attempts') return baseFiltered.filter((p) => p.completionStatus !== 'Not Started');
    if (activeTab === 'Bookmarked') return baseFiltered.filter((p) => bookmarkedIds.has(p.id));
    return baseFiltered;
  }, [baseFiltered, activeTab, bookmarkedIds]);

  const visiblePapers = tabFiltered.slice(0, visibleCount);
  const hasMore = visibleCount < tabFiltered.length;

  const recentActivity = useMemo(
    () =>
      [...attemptedPapers]
        .sort((a, b) => b.attemptCount - a.attemptCount)
        .slice(0, 4),
    [attemptedPapers]
  );

  const perfPapers = useMemo(() => {
    return attemptedPapers.filter((p) => {
      if (p.latestScore === null) return false;
      if (perfRange === 'This Year') return p.year === maxYear;
      if (perfRange === 'Last Year') return p.year === (maxYear ?? 0) - 1;
      return true;
    });
  }, [attemptedPapers, perfRange, maxYear]);

  const perfAverage = perfPapers.length ? Math.round(perfPapers.reduce((sum, p) => sum + (p.latestScore ?? 0), 0) / perfPapers.length) : 0;

  const perfBuckets = [
    { label: 'Excellent (80%+)', val: perfPapers.filter((p) => (p.latestScore ?? 0) >= 80).length, color: 'bg-green-500' },
    { label: 'Good (60% - 79%)', val: perfPapers.filter((p) => (p.latestScore ?? 0) >= 60 && (p.latestScore ?? 0) < 80).length, color: 'bg-cyan-500' },
    { label: 'Average (40% - 59%)', val: perfPapers.filter((p) => (p.latestScore ?? 0) >= 40 && (p.latestScore ?? 0) < 60).length, color: 'bg-blue-500' },
    { label: 'Needs Improvement', val: perfPapers.filter((p) => (p.latestScore ?? 0) < 40).length, color: 'bg-pink-500' },
  ];

  const resetFilters = () => {
    setSearch('');
    setSubjectFilter(null);
    setYearFilter('All');
    setDifficultyFilter('All');
  };

  const openPaper = (paper: ExamPaper) => navigate(`/exams?subject=${paper.subjectId}&paper=${paper.id}`);

  const handleDownload = (paper: ExamPaper) => {
    if (!paper.pdfUrl) return;
    window.open(forceDownloadUrl(paper.pdfUrl, `${paper.title}.pdf`), '_blank', 'noopener,noreferrer');
    setOpenMenuId(null);
  };

  // ?q= is the deep-link AITutorView actually reads (router state was silently
  // ignored, throwing the typed question away) -- it asks the question on arrival.
  const handleSendAI = () => {
    if (!aiQuestion.trim()) return;
    navigate(`/ai-tutor?q=${encodeURIComponent(aiQuestion)}`);
  };

  const handleQuickPrompt = (question: string) => navigate(`/ai-tutor?q=${encodeURIComponent(question)}`);

  if (loading && papers.length === 0) {
    return (
      <div className="flex items-center justify-center flex-1 min-h-0">
        <p className="text-gray-400 text-sm font-semibold">Loading past papers...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center flex-1 min-h-0">
        <p className="text-red-400 text-sm font-semibold">Could not load past papers: {error}</p>
      </div>
    );
  }

  return (
    <div className="flex gap-6 mt-2 flex-1 min-h-0">
      {/* Left/Center Column */}
      <div className="flex-1 min-w-0 space-y-4 overflow-y-auto pr-1">

        {notice && (
          <div className="glass-card px-4 py-3 flex items-center justify-between">
            <p className="text-sm font-semibold text-white">{notice}</p>
            <button onClick={() => setNotice('')} className="text-cyan-400 text-xs font-bold">Dismiss</button>
          </div>
        )}

        {/* Stats Row */}
        <div className="grid grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <div key={i} className="glass-card p-4 flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl border flex items-center justify-center text-xl flex-shrink-0 ${stat.bg}`}>
                {stat.kind === 'check' ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={stat.color}><polyline points="20,6 9,17 4,12" /></svg>
                ) : stat.kind === 'trend' ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={stat.color}><polyline points="22,7 13.5,15.5 8.5,10.5 2,17" /><polyline points="16,7 22,7 22,13" /></svg>
                ) : stat.kind === 'clock' ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={stat.color}><circle cx="12" cy="12" r="10" /><polyline points="12,6 12,12 16,14" /></svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={stat.color}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14,2 14,8 20,8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10,9 9,9 8,9" /></svg>
                )}
              </div>
              <div>
                <p className="text-gray-500 text-[10px] font-bold uppercase tracking-wider">{stat.label}</p>
                <p className="text-white text-xl font-extrabold leading-tight mt-0.5">{stat.value}</p>
                <p className="text-gray-500 text-[10px] mt-0.5">{stat.sub}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="glass-card p-4 flex items-center justify-between">
          <div>
            <h3 className="text-white font-bold text-base">Assessment & Examination Center</h3>
            <p className="text-gray-500 text-xs mt-1">Open authentic exams, timed mocks, AI walkthroughs, analytics, and smart review.</p>
          </div>
          <Link to="/exams" className="px-4 py-2 rounded-lg bg-cyan-500 text-white text-xs font-bold hover:bg-cyan-600 transition-colors">
            Open Exam Center
          </Link>
        </div>

        {/* Explore by Subject */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-bold text-base">Explore by Subject</h3>
            {subjectFilter && (
              <span className="text-cyan-400 text-[10px] font-bold">
                Filtering: {subjects.find((s) => s.id === subjectFilter)?.name}
              </span>
            )}
          </div>
          <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
            {subjects.map((sub) => {
              const style = styleFor(sub.colorKey);
              const active = subjectFilter === sub.id;
              return (
                <button
                  key={sub.id}
                  onClick={() => setSubjectFilter((prev) => (prev === sub.id ? null : sub.id))}
                  className={`flex flex-col items-center gap-2 min-w-[80px] p-3 rounded-xl bg-[rgba(17,24,50,0.5)] border transition-all group ${
                    active ? 'border-cyan-500/60 ring-1 ring-cyan-500/40' : 'border-[rgba(56,78,135,0.15)] hover:border-cyan-500/30'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl border flex items-center justify-center text-lg ${style.color} group-hover:scale-110 transition-transform`}>
                    {sub.icon}
                  </div>
                  <span className={`text-[10px] font-semibold group-hover:text-white ${active ? 'text-white' : 'text-gray-400'}`}>{sub.name}</span>
                </button>
              );
            })}
            {subjectFilter && (
              <button onClick={() => setSubjectFilter(null)} className="flex flex-col items-center justify-center min-w-[80px] p-3 rounded-xl border border-dashed border-[rgba(56,78,135,0.3)] hover:border-cyan-500/30 transition-all group">
                <div className="w-10 h-10 rounded-full bg-[rgba(56,78,135,0.2)] flex items-center justify-center text-cyan-400 mb-1 group-hover:bg-cyan-500/10">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                </div>
                <span className="text-cyan-400 text-[10px] font-semibold">Clear</span>
              </button>
            )}
          </div>
        </div>

        {/* Papers List */}
        <div className="glass-card p-5">
          {/* Tabs & Search */}
          <div className="flex items-center justify-between mb-5 gap-4">
            <div className="flex items-center gap-4 border-b border-[rgba(56,78,135,0.15)] pb-1 flex-1">
              {(['All Papers', 'My Attempts', 'Bookmarked'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`text-sm font-semibold pb-2 border-b-2 transition-all relative whitespace-nowrap ${
                    activeTab === tab ? 'text-cyan-400 border-cyan-400 font-bold' : 'text-gray-500 border-transparent hover:text-gray-300'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search papers..."
                  className="w-40 px-3 py-1.5 rounded-lg bg-[rgba(17,24,50,0.8)] border border-[rgba(56,78,135,0.3)] text-gray-300 text-xs placeholder-gray-600 focus:outline-none focus:border-cyan-500/40"
                />
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
              </div>
              <div className="relative">
                <button
                  onClick={() => setShowFilterPanel((v) => !v)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[rgba(17,24,50,0.8)] border text-xs transition-all ${
                    yearFilter !== 'All' || difficultyFilter !== 'All' ? 'border-cyan-500/40 text-cyan-400' : 'border-[rgba(56,78,135,0.3)] text-gray-300 hover:border-cyan-500/30'
                  }`}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="22,3 2,3 10,12.46 10,19 14,21 14,12.46" /></svg>
                  Filter
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6,9 12,15 18,9" /></svg>
                </button>
                {showFilterPanel && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setShowFilterPanel(false)} />
                    <div className="absolute right-0 top-9 z-20 w-56 rounded-lg border border-[rgba(56,78,135,0.3)] bg-[rgba(10,14,30,0.98)] shadow-xl p-3 space-y-3">
                      <div>
                        <label className="text-[10px] text-gray-500 font-bold uppercase">Year</label>
                        <select
                          value={String(yearFilter)}
                          onChange={(e) => setYearFilter(e.target.value === 'All' ? 'All' : Number(e.target.value))}
                          className="w-full mt-1 px-2 py-1.5 rounded-lg bg-[rgba(17,24,50,0.8)] border border-[rgba(56,78,135,0.3)] text-gray-300 text-xs focus:outline-none"
                        >
                          <option value="All">All Years</option>
                          {years.map((y) => (
                            <option key={y} value={y}>{y}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] text-gray-500 font-bold uppercase">Difficulty</label>
                        <select
                          value={difficultyFilter}
                          onChange={(e) => setDifficultyFilter(e.target.value as typeof difficultyFilter)}
                          className="w-full mt-1 px-2 py-1.5 rounded-lg bg-[rgba(17,24,50,0.8)] border border-[rgba(56,78,135,0.3)] text-gray-300 text-xs focus:outline-none"
                        >
                          <option value="All">All Levels</option>
                          <option value="easy">{difficultyLabel('easy')}</option>
                          <option value="medium">{difficultyLabel('medium')}</option>
                          <option value="hard">{difficultyLabel('hard')}</option>
                        </select>
                      </div>
                      <button onClick={() => { setYearFilter('All'); setDifficultyFilter('All'); }} className="text-cyan-400 text-[10px] font-bold">
                        Reset filters
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* List */}
          <div className="space-y-2.5">
            {visiblePapers.map((p) => {
              const style = styleFor(p.subjectColorKey);
              const action = actionForStatus(p.completionStatus);
              const bookmarked = bookmarkedIds.has(p.id);
              return (
                <div key={p.id} className="grid grid-cols-[1fr_auto_auto_auto_auto] items-center gap-4 p-3.5 rounded-xl bg-[rgba(17,24,50,0.5)] border border-[rgba(56,78,135,0.15)] hover:border-[rgba(56,78,135,0.3)] transition-all">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className={`w-10 h-10 rounded-xl border flex items-center justify-center text-lg flex-shrink-0 ${style.color}`}>
                      {p.subjectIcon}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-white text-sm font-bold leading-tight truncate">{p.subjectName} – {p.title}</p>
                        <span className="px-1.5 py-0.5 rounded bg-green-500/10 text-green-400 text-[9px] font-bold border border-green-500/20 flex-shrink-0">{p.year}</span>
                      </div>
                      <p className="text-gray-500 text-[10px] mt-1 flex items-center gap-1.5">
                        <span className="flex items-center gap-0.5 flex-shrink-0"><svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></svg> {paperTypeLabel(p.paperType)}</span>
                        <span className="flex-shrink-0">•</span>
                        <span className="flex-shrink-0">{Math.floor((p.durationMinutes ?? 0) / 60)}h {(p.durationMinutes ?? 0) % 60}m</span>
                        <span className="flex-shrink-0">•</span>
                        <span className="flex-shrink-0">{p.totalMarks} Marks</span>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {p.completionStatus === 'Not Started' ? (
                      <span className="text-gray-500 text-[10px] italic px-2">Not attempted yet</span>
                    ) : p.completionStatus === 'In Progress' || p.latestScore === null ? (
                      <span className="text-cyan-400 text-[10px] italic px-2">In progress...</span>
                    ) : (
                      <>
                        <ScoreRing score={p.latestScore} color={style.ring} />
                        <div className="flex flex-col">
                          <span className="text-white font-bold text-sm leading-none">{p.latestScore}%</span>
                          <span className="text-gray-500 text-[10px] mt-1">Your Score</span>
                        </div>
                      </>
                    )}
                  </div>
                  <button
                    onClick={() => openPaper(p)}
                    className={`px-5 py-2 rounded-lg border text-sm font-bold transition-all whitespace-nowrap ${
                      action === 'Continue Practice' ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20' :
                      action === 'Review Attempt' ? 'bg-blue-500/10 border-blue-500/30 text-blue-400 hover:bg-blue-500/20' :
                      'bg-[rgba(17,24,50,0.8)] border-[rgba(56,78,135,0.3)] text-cyan-400 hover:border-cyan-500/30'
                    }`}
                  >
                    {action}
                  </button>
                  <button onClick={() => toggleBookmark(p.id)} className={bookmarked ? 'text-yellow-400' : 'text-gray-500 hover:text-gray-300'} title={bookmarked ? 'Remove bookmark' : 'Add bookmark'}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill={bookmarked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" /></svg>
                  </button>
                  <div className="relative">
                    <button onClick={() => setOpenMenuId(openMenuId === p.id ? null : p.id)} className="text-gray-500 hover:text-gray-300 transition-colors">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="1.6" /><circle cx="12" cy="12" r="1.6" /><circle cx="12" cy="19" r="1.6" /></svg>
                    </button>
                    {openMenuId === p.id && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setOpenMenuId(null)} />
                        <div className="absolute right-0 top-6 z-20 w-44 rounded-lg border border-[rgba(56,78,135,0.3)] bg-[rgba(10,14,30,0.98)] shadow-xl py-1">
                          <button onClick={() => { openPaper(p); setOpenMenuId(null); }} className="w-full text-left px-3 py-2 text-xs text-gray-300 hover:bg-cyan-500/10 hover:text-cyan-400">Preview Paper</button>
                          <button onClick={() => { toggleBookmark(p.id); setOpenMenuId(null); }} className="w-full text-left px-3 py-2 text-xs text-gray-300 hover:bg-cyan-500/10 hover:text-cyan-400">{bookmarked ? 'Remove Bookmark' : 'Add Bookmark'}</button>
                          <button
                            onClick={() => handleDownload(p)}
                            disabled={!p.pdfUrl}
                            title={p.pdfUrl ? undefined : 'PDF not uploaded yet'}
                            className="w-full text-left px-3 py-2 text-xs text-gray-300 hover:bg-cyan-500/10 hover:text-cyan-400 disabled:text-gray-600 disabled:hover:bg-transparent disabled:cursor-not-allowed"
                          >
                            {p.pdfUrl ? 'Download PDF' : 'PDF not uploaded yet'}
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              );
            })}

            {!loading && tabFiltered.length === 0 && (
              <div className="py-10 text-center">
                <p className="text-gray-400 text-sm font-semibold">No papers match your filters.</p>
                <button onClick={resetFilters} className="mt-2 text-cyan-400 text-xs font-bold">Reset filters</button>
              </div>
            )}
          </div>

          {hasMore && (
            <button onClick={() => setVisibleCount((c) => c + 6)} className="w-full flex items-center justify-center gap-1.5 text-cyan-400 hover:text-cyan-300 text-xs font-bold mt-5 py-1.5 transition-colors">
              Load more papers
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6,9 12,15 18,9" /></svg>
            </button>
          )}
        </div>

      </div>

      {/* Right Column */}
      <div className="w-[300px] flex-shrink-0 space-y-4 overflow-y-auto pb-6">

        {/* AI Tutor Widget */}
        <div className="glass-card p-5 relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M8 14s1.5 2 4 2 4-2 4-2" /><line x1="9" y1="9" x2="9.01" y2="9" /><line x1="15" y1="9" x2="15.01" y2="9" /></svg>
              </div>
              <h3 className="text-white font-bold text-sm">AI Tutor</h3>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-[10px] font-bold">Socratic</span>
          </div>
          <p className="text-gray-400 text-[11px] mb-3 leading-relaxed">Stuck on a question? Ask our AI Tutor and get guided step-by-step help.</p>
          <div className="flex items-center gap-2 mb-3">
            <input
              type="text"
              value={aiQuestion}
              onChange={(e) => setAiQuestion(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSendAI(); }}
              placeholder="Ask a question about any topic..."
              className="flex-1 px-3 py-2 rounded-lg bg-[rgba(17,24,50,0.8)] border border-[rgba(56,78,135,0.3)] text-gray-300 text-xs placeholder-gray-600 focus:outline-none focus:border-cyan-500/40"
            />
            <button onClick={handleSendAI} className="w-8 h-8 rounded-lg bg-cyan-500 flex items-center justify-center text-white hover:bg-cyan-400 transition-colors">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12,5 19,12 12,19" /></svg>
            </button>
          </div>
          <p className="text-gray-500 text-[10px] font-bold mb-2">Try asking:</p>
          <div className="grid grid-cols-2 gap-1.5">
            {tryAskingPrompts.map((q, i) => (
              <button key={i} onClick={() => handleQuickPrompt(q)} className="px-2 py-1.5 rounded bg-[rgba(17,24,50,0.5)] border border-[rgba(56,78,135,0.15)] text-gray-400 text-[10px] hover:border-cyan-500/30 hover:text-cyan-400 transition-all text-left truncate">
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Performance Overview */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-bold text-base">Performance Overview</h3>
            <div className="relative">
              <button onClick={() => setShowPerfMenu((v) => !v)} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[rgba(17,24,50,0.7)] border border-[rgba(56,78,135,0.25)] text-gray-300 text-[11px] font-semibold">
                {perfRange}
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-gray-500"><polyline points="6,9 12,15 18,9" /></svg>
              </button>
              {showPerfMenu && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowPerfMenu(false)} />
                  <div className="absolute right-0 top-8 z-20 w-32 rounded-lg border border-[rgba(56,78,135,0.3)] bg-[rgba(10,14,30,0.98)] shadow-xl py-1">
                    {(['This Year', 'Last Year', 'All Time'] as const).map((range) => (
                      <button key={range} onClick={() => { setPerfRange(range); setShowPerfMenu(false); }} className={`w-full text-left px-3 py-1.5 text-xs ${perfRange === range ? 'text-cyan-400 font-bold' : 'text-gray-300 hover:text-cyan-400'}`}>
                        {range}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center gap-5">
            <div className="relative w-24 h-24 flex-shrink-0">
              <svg width="96" height="94" className="progress-ring">
                <circle cx="48" cy="47" r="38" stroke="rgba(56, 78, 135, 0.2)" strokeWidth="8" fill="none" />
                <circle cx="48" cy="47" r="38" stroke="url(#perf-grad)" strokeWidth="8" fill="none" strokeLinecap="round" strokeDasharray={2 * Math.PI * 38} strokeDashoffset={2 * Math.PI * 38 * (1 - perfAverage / 100)} />
                <defs>
                  <linearGradient id="perf-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#a855f7" />
                    <stop offset="50%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#22d3ee" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-white font-extrabold text-lg leading-none">{perfAverage}%</span>
                <span className="text-gray-500 text-[9px] mt-0.5">Average Score</span>
              </div>
            </div>
            <div className="flex-1 space-y-2">
              {perfBuckets.map((item, i) => (
                <div key={i} className="flex items-center justify-between text-[10px]">
                  <div className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${item.color}`} />
                    <span className="text-gray-400">{item.label}</span>
                  </div>
                  <span className="text-white font-bold">{item.val}</span>
                </div>
              ))}
            </div>
          </div>
          <button onClick={() => navigate('/exams')} className="w-full text-center text-cyan-400 hover:text-cyan-300 text-xs font-bold mt-4 py-2 rounded-lg bg-[rgba(17,24,50,0.5)] border border-[rgba(56,78,135,0.2)] hover:border-cyan-500/30 transition-all">
            View Detailed Analytics
          </button>
        </div>

        {/* Recent Activity */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-bold text-base">Recent Activity</h3>
            <button onClick={() => setActiveTab('My Attempts')} className="text-cyan-400 text-xs font-medium hover:text-cyan-300 transition-colors">View all</button>
          </div>
          <div className="space-y-3">
            {recentActivity.map((act) => {
              const style = styleFor(act.subjectColorKey);
              return (
                <button key={act.id} onClick={() => openPaper(act)} className="flex items-center justify-between w-full text-left">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={`w-7 h-7 rounded-lg border flex items-center justify-center text-xs flex-shrink-0 ${style.color}`}>
                      {act.subjectIcon}
                    </div>
                    <div className="min-w-0">
                      <p className="text-white text-xs font-semibold leading-tight truncate">{act.subjectName} {act.title}</p>
                      <p className="text-gray-500 text-[10px] truncate">{act.completionStatus} • {act.term}</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-[rgba(56,78,135,0.2)] text-gray-300 text-[10px] font-bold flex-shrink-0 ml-2">{act.latestScore ?? 0}%</span>
                </button>
              );
            })}
            {recentActivity.length === 0 && <p className="text-gray-500 text-[11px]">No activity yet — start a practice paper to see it here.</p>}
          </div>
        </div>

      </div>
    </div>
  );
}
