import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { getWorkspaceSubject } from '../data/workspaceData';
import { styleFor } from '../lib/subjectStyle';
import {
  ensureProfile,
  getMyLearningData,
  aggregateSubjects,
  type LearningTopic,
} from '../services/learning.service';

type Category = 'core' | 'optional';

const categoryFor = (code: string): Category => (getWorkspaceSubject(code)?.category === 'Elective' ? 'optional' : 'core');

export default function SubjectsView() {
  const [activeSubTab, setActiveSubTab] = useState<'All Subjects' | 'Core Subjects' | 'Optional Subjects'>('All Subjects');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(() => (localStorage.getItem('subjects-view-mode') === 'list' ? 'list' : 'grid'));
  const [showAllRecent, setShowAllRecent] = useState(false);
  const [topics, setTopics] = useState<LearningTopic[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const { theme } = useTheme();
  const { user } = useAuth();
  const navigate = useNavigate();

  const rowBg = theme === 'light' ? 'bg-white border-slate-200' : 'bg-[rgba(17,24,50,0.5)] border-[rgba(56,78,135,0.15)]';
  const textColor = theme === 'light' ? 'text-slate-900' : 'text-white';
  const mutedColor = theme === 'light' ? 'text-slate-500' : 'text-gray-500';
  const subTextColor = theme === 'light' ? 'text-slate-600' : 'text-gray-400';

  useEffect(() => {
    localStorage.setItem('subjects-view-mode', viewMode);
  }, [viewMode]);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    setLoading(true);
    setLoadError(null);
    (async () => {
      try {
        await ensureProfile(user);
        const data = await getMyLearningData();
        if (!cancelled) setTopics(data);
      } catch (err) {
        if (!cancelled) setLoadError(err instanceof Error ? err.message : 'Failed to load subjects.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const subjects = useMemo(
    () =>
      aggregateSubjects(topics)
        .map((s) => ({ ...s, category: categoryFor(s.code), style: styleFor(s.code) }))
        .sort((a, b) => a.name.localeCompare(b.name)),
    [topics],
  );

  const filteredSubjects = useMemo(
    () =>
      subjects.filter((sub) => {
        const matchesTab =
          activeSubTab === 'All Subjects' ||
          (activeSubTab === 'Core Subjects' && sub.category === 'core') ||
          (activeSubTab === 'Optional Subjects' && sub.category === 'optional');
        const matchesSearch = sub.name.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesTab && matchesSearch;
      }),
    [subjects, activeSubTab, searchQuery],
  );

  const recentlyAccessed = useMemo(
    () =>
      [...topics]
        .filter((t) => t.lastAccessedAt)
        .sort((a, b) => new Date(b.lastAccessedAt as string).getTime() - new Date(a.lastAccessedAt as string).getTime()),
    [topics],
  );

  const recommendation = useMemo(
    () => [...topics].filter((t) => !t.lastAccessedAt).sort((a, b) => a.lessonOrder - b.lessonOrder)[0],
    [topics],
  );

  const overallAvg = useMemo(() => {
    const touched = topics.filter((t) => t.lastAccessedAt);
    return touched.length ? Math.round(touched.reduce((sum, t) => sum + t.masteryScore, 0) / touched.length) : 0;
  }, [topics]);
  const completedCount = useMemo(() => topics.filter((t) => t.completed).length, [topics]);
  const startedCount = useMemo(() => topics.filter((t) => t.lastAccessedAt).length, [topics]);
  const xp = completedCount * 50;

  const visibleRecent = showAllRecent ? recentlyAccessed : recentlyAccessed.slice(0, 3);

  const goToWorkspace = (code: string) => navigate(`/workspace/${code}`);
  const goToDetail = (code: string) => navigate(`/subjects/${code}`);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-0">
        <p className={mutedColor}>Loading subjects...</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-0">
        <p className="text-red-400 text-sm">{loadError}</p>
      </div>
    );
  }

  return (
    <div className="flex gap-6 mt-2 flex-1 min-h-0">
      {/* Left/Center Column */}
      <div className="flex-1 min-w-0 space-y-4 overflow-y-auto pr-1">

        {/* Navigation & Search Area */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 border-b border-[rgba(56,78,135,0.15)] pb-1 flex-1">
            {(['All Subjects', 'Core Subjects', 'Optional Subjects'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveSubTab(tab)}
                className={`text-sm font-semibold pb-2 border-b-2 transition-all relative whitespace-nowrap ${
                  activeSubTab === tab
                    ? 'text-cyan-400 border-cyan-400 font-bold'
                    : 'text-gray-500 border-transparent hover:text-gray-300'
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
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search subjects..."
                className="w-44 px-3 py-1.5 rounded-lg bg-[rgba(17,24,50,0.8)] border border-[rgba(56,78,135,0.3)] text-gray-300 text-xs placeholder-gray-600 focus:outline-none focus:border-cyan-500/40"
              />
            </div>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg border transition-colors ${viewMode === 'grid' ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/25' : 'text-gray-500 border-transparent hover:text-gray-300'}`}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <rect x="3" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" />
                <rect x="14" y="14" width="7" height="7" rx="1" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg border transition-colors ${viewMode === 'list' ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/25' : 'text-gray-500 border-transparent hover:text-gray-300'}`}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="8" y1="6" x2="21" y2="6" />
                <line x1="8" y1="12" x2="21" y2="12" />
                <line x1="8" y1="18" x2="21" y2="18" />
                <line x1="3" y1="6" x2="3.01" y2="6" />
                <line x1="3" y1="12" x2="3.01" y2="12" />
                <line x1="3" y1="18" x2="3.01" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        {/* Subjects Grid/List */}
        <div className={viewMode === 'grid' ? 'grid grid-cols-4 gap-3' : 'space-y-2.5'}>
          {filteredSubjects.map((sub) => (
            <div
              key={sub.code}
              onClick={() => goToDetail(sub.code)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && goToDetail(sub.code)}
              className={`bg-[rgba(17,24,50,0.6)] border border-[rgba(56,78,135,0.2)] hover:border-cyan-500/30 rounded-xl p-4 transition-all relative group cursor-pointer ${
                viewMode === 'grid' ? 'flex flex-col justify-between' : 'flex items-center gap-4'
              }`}
            >
              <span className={`absolute top-2.5 right-2.5 px-1.5 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-wider ${
                sub.category === 'core'
                  ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                  : 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
              }`}>
                {sub.category === 'core' ? 'Core' : 'Optional'}
              </span>
              <div className={viewMode === 'grid' ? 'flex flex-col items-center text-center' : 'flex items-center gap-3 flex-1 min-w-0'}>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold border shadow-lg flex-shrink-0 ${sub.style.iconColor} ${viewMode === 'grid' ? 'mb-3' : ''}`}>
                  {sub.style.icon}
                </div>
                <div className={viewMode === 'list' ? 'min-w-0' : ''}>
                  <h4 className="text-white font-bold text-sm leading-tight">{sub.name}</h4>
                  <p className="text-cyan-400 text-[11px] font-bold mt-1">{sub.progress}% Complete</p>
                  {viewMode === 'grid' && (
                    <div className="w-28 h-1 rounded-full bg-[rgba(56,78,135,0.2)] mt-2.5 overflow-hidden">
                      <div className={`h-full rounded-full ${sub.style.barColor}`} style={{ width: `${sub.progress}%` }} />
                    </div>
                  )}
                </div>
              </div>
              <div className={viewMode === 'grid' ? 'flex items-center justify-between mt-3 pt-3 border-t border-[rgba(56,78,135,0.1)]' : 'flex-shrink-0'}>
                <span className="text-gray-500 text-[10px] font-bold">{sub.completedCount} / {sub.totalCount} Topics</span>
              </div>
              <div className={viewMode === 'grid' ? 'flex items-center gap-1.5 mt-2.5' : 'flex items-center gap-1.5 flex-shrink-0'}>
                <button
                  onClick={(e) => { e.stopPropagation(); goToWorkspace(sub.code); }}
                  className="flex-1 text-center px-2 py-1.5 rounded-md bg-cyan-500/10 border border-cyan-500/25 text-cyan-400 text-[10px] font-bold hover:bg-cyan-500/20 transition-colors"
                >
                  Continue
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); navigate('/ai-tutor'); }}
                  className="flex-1 text-center px-2 py-1.5 rounded-md bg-purple-500/10 border border-purple-500/25 text-purple-400 text-[10px] font-bold hover:bg-purple-500/20 transition-colors"
                >
                  Ask AI
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredSubjects.length === 0 && (
          <div className="glass-card p-10 flex flex-col items-center justify-center text-center">
            <span className="text-3xl mb-3">🔍</span>
            <p className="text-white font-bold text-sm">No subjects found</p>
            <p className="text-gray-500 text-xs mt-1">Try a different search term or switch tabs.</p>
          </div>
        )}

        {/* Recently Accessed */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className={`font-bold text-base ${textColor}`}>Recently Accessed</h3>
            {recentlyAccessed.length > 3 && (
              <button onClick={() => setShowAllRecent((v) => !v)} className="text-cyan-600 text-xs font-medium hover:text-cyan-700 transition-colors">
                {showAllRecent ? 'Show less' : 'View all'}
              </button>
            )}
          </div>
          {visibleRecent.length === 0 ? (
            <p className={`text-sm text-center py-4 ${mutedColor}`}>You haven't started any topics yet.</p>
          ) : (
            <div className="space-y-2.5">
              {visibleRecent.map((topic) => {
                const style = styleFor(topic.subjectCode);
                return (
                  <div key={topic.topicId} className={`flex items-center justify-between p-3 rounded-xl border hover:border-cyan-500/30 transition-all ${rowBg}`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg border flex items-center justify-center text-sm font-semibold ${style.iconColor}`}>
                        {style.icon}
                      </div>
                      <div>
                        <p className={`text-sm font-semibold leading-tight ${textColor}`}>{topic.topicTitle}</p>
                        <p className={`${mutedColor} text-[11px] leading-tight mt-0.5`}>{topic.subjectName} • {topic.lessonTitle}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-2 w-44">
                        <div className={`flex-1 h-1.5 rounded-full overflow-hidden ${theme === 'light' ? 'bg-slate-200' : 'bg-[rgba(56,78,135,0.2)]'}`}>
                          <div className={`h-full rounded-full ${style.barColor}`} style={{ width: `${topic.masteryScore}%` }} />
                        </div>
                        <span className={`${subTextColor} text-xs font-semibold w-8 text-right`}>{topic.masteryScore}%</span>
                      </div>

                      <button onClick={() => goToWorkspace(topic.subjectCode)} className="px-4 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-600 text-xs font-bold hover:bg-cyan-500/20 transition-colors">
                        Continue
                      </button>

                      <button onClick={() => goToWorkspace(topic.subjectCode)} className="w-6 h-6 rounded-full bg-cyan-500/10 border border-cyan-500/25 flex items-center justify-center text-cyan-600 hover:bg-cyan-500 hover:text-white transition-colors">
                        <svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor">
                          <polygon points="5,3 19,12 5,21" />
                        </svg>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

      {/* Right Column */}
      <div className="w-[300px] flex-shrink-0 space-y-4 overflow-y-auto pb-6">
        {/* Overall Progress */}
        <div className="glass-card p-5">
          <h3 className="text-white font-bold text-base mb-4">Overall Progress</h3>
          <div className="flex items-center gap-4">
            <div className="relative w-24 h-24 flex-shrink-0">
              <svg width="96" height="94" className="progress-ring">
                <circle cx="48" cy="47" r="38" stroke="rgba(56, 78, 135, 0.2)" strokeWidth="6" fill="none" />
                <circle
                  cx="48" cy="47" r="38"
                  stroke="url(#subjects-progress-gradient)"
                  strokeWidth="6" fill="none" strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 38}
                  strokeDashoffset={2 * Math.PI * 38 * (1 - overallAvg / 100)}
                />
                <defs>
                  <linearGradient id="subjects-progress-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#22d3ee" />
                    <stop offset="100%" stopColor="#3b82f6" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-white font-extrabold text-lg leading-none">{overallAvg}%</span>
                <span className="text-gray-500 text-[9px] mt-0.5">Average</span>
              </div>
            </div>

            <div className="flex-1 space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                  </svg>
                </div>
                <div>
                  <p className="text-gray-500 text-[10px]">Topics Completed</p>
                  <p className="text-white text-xs font-bold leading-tight">{completedCount}</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <circle cx="12" cy="12" r="10" />
                    <circle cx="12" cy="12" r="6" />
                    <circle cx="12" cy="12" r="2" />
                  </svg>
                </div>
                <div>
                  <p className="text-gray-500 text-[10px]">Topics Started</p>
                  <p className="text-white text-xs font-bold leading-tight">{startedCount}</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                  <span className="text-[10px] font-black leading-none">XP</span>
                </div>
                <div>
                  <p className="text-gray-500 text-[10px]">XP Earned</p>
                  <p className="text-white text-xs font-bold leading-tight">{xp.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Subject Performance */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-bold text-base">Subject Performance</h3>
            <span className="text-gray-500 text-xs font-medium">Overall</span>
          </div>
          <div className="space-y-3.5">
            {subjects.map((sub) => (
              <div key={sub.code} className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400 font-medium">{sub.name}</span>
                  <span className="text-white font-bold">{sub.progress}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-[rgba(56,78,135,0.2)] overflow-hidden">
                  <div className={`h-full rounded-full ${sub.style.barColor}`} style={{ width: `${sub.progress}%` }} />
                </div>
              </div>
            ))}
          </div>
          <button onClick={() => navigate('/my-learning')} className="w-full text-center text-cyan-400 hover:text-cyan-300 text-xs font-bold mt-4 pt-1 transition-colors">
            View Detailed Analytics
          </button>
        </div>

        {/* Recommended for You */}
        <div className="glass-card p-5">
          <h3 className="text-white font-bold text-base mb-1">Recommended for You</h3>
          <p className="text-gray-500 text-[11px] mb-3.5">Topics you haven't started yet</p>

          {recommendation ? (
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-[rgba(17,24,50,0.5)] border border-[rgba(56,78,135,0.15)] mb-3">
              <div className="flex items-center gap-2.5">
                <div className={`w-8 h-8 rounded-lg border flex items-center justify-center text-sm ${styleFor(recommendation.subjectCode).iconColor}`}>
                  {styleFor(recommendation.subjectCode).icon}
                </div>
                <div>
                  <p className="text-white text-xs font-bold leading-tight">{recommendation.topicTitle}</p>
                  <p className="text-gray-500 text-[10px] mt-0.5">{recommendation.subjectName} • {recommendation.lessonTitle}</p>
                </div>
              </div>
              <button onClick={() => goToWorkspace(recommendation.subjectCode)} className="w-6 h-6 rounded-full bg-cyan-500/10 border border-cyan-500/25 flex items-center justify-center text-cyan-400 hover:bg-cyan-500 hover:text-white transition-colors">
                <svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="5,3 19,12 5,21" />
                </svg>
              </button>
            </div>
          ) : (
            <p className="text-gray-500 text-xs text-center py-3">You've started every topic. Great work!</p>
          )}

          <button onClick={() => navigate('/my-learning')} className="w-full text-center text-cyan-400 hover:text-cyan-300 text-xs font-bold pt-1 transition-colors">
            View All Recommendations
          </button>
        </div>

      </div>
    </div>
  );
}
