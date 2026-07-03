import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  allSubjects,
  mandatorySubjects,
  electiveSubjects,
  recentLessons,
  getSubject,
  type SubjectId,
} from '../data/subjects';

const barFillClass: Record<SubjectId, string> = {
  mathematics: 'bg-blue-500',
  english: 'bg-purple-500',
  kiswahili: 'bg-teal-500',
  cre: 'bg-yellow-500',
  pe: 'bg-indigo-500',
  ict: 'bg-cyan-500',
  chemistry: 'bg-orange-500',
  physics: 'bg-amber-500',
  'computer-science': 'bg-pink-500',
};

const barBgClass: Record<SubjectId, string> = {
  mathematics: 'bg-blue-500/20',
  english: 'bg-purple-500/20',
  kiswahili: 'bg-teal-500/20',
  cre: 'bg-yellow-500/20',
  pe: 'bg-indigo-500/20',
  ict: 'bg-cyan-500/20',
  chemistry: 'bg-orange-500/20',
  physics: 'bg-amber-500/20',
  'computer-science': 'bg-pink-500/20',
};

export default function SubjectsView() {
  const [activeSubTab, setActiveSubTab] = useState<'All Subjects' | 'Mandatory Subjects' | 'Elective Subjects'>('All Subjects');
  const [searchQuery, setSearchQuery] = useState('');

  const baseList =
    activeSubTab === 'Mandatory Subjects'
      ? mandatorySubjects
      : activeSubTab === 'Elective Subjects'
      ? electiveSubjects
      : allSubjects;

  const filteredSubjects = baseList.filter((sub) =>
    sub.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex gap-6 mt-2 flex-1 min-h-0">
      {/* Left/Center Column */}
      <div className="flex-1 min-w-0 space-y-4 overflow-y-auto pr-1">

        {/* Navigation & Search Area */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 border-b border-[rgba(56,78,135,0.15)] pb-1 flex-1">
            {(['All Subjects', 'Mandatory Subjects', 'Elective Subjects'] as const).map((tab) => (
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
            <button className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/25">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <rect x="3" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" />
                <rect x="14" y="14" width="7" height="7" rx="1" />
              </svg>
            </button>
            <button className="p-1.5 rounded-lg text-gray-500 hover:text-gray-300">
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

        {/* Subjects Grid */}
        <div className="grid grid-cols-3 gap-3">
          {filteredSubjects.map((sub) => (
            <div key={sub.id} className="bg-[rgba(17,24,50,0.6)] border border-[rgba(56,78,135,0.2)] hover:border-cyan-500/30 rounded-xl p-4 transition-all flex flex-col justify-between relative">
              <span
                className={`absolute top-2.5 right-2.5 px-1.5 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-wider ${
                  sub.group === 'mandatory'
                    ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                    : 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                }`}
              >
                {sub.group === 'mandatory' ? 'Mandatory' : 'Elective'}
              </span>
              <div className="flex flex-col items-center text-center">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold border mb-3 shadow-lg ${sub.iconBg}`}>
                  {sub.icon}
                </div>
                <h4 className="text-white font-bold text-sm leading-tight">{sub.name}</h4>
                <p className="text-cyan-400 text-[11px] font-bold mt-1">{sub.progress}% Complete</p>
                <div className={`w-28 h-1 rounded-full ${barBgClass[sub.id]} mt-2.5 overflow-hidden`}>
                  <div className={`h-full rounded-full ${barFillClass[sub.id]}`} style={{ width: `${sub.progress}%` }} />
                </div>
                <p className="text-gray-500 text-[10px] mt-2 line-clamp-1">{sub.description}</p>
              </div>
              <div className="flex items-center gap-1.5 mt-4 pt-3 border-t border-[rgba(56,78,135,0.1)]">
                <Link
                  to={`/subjects/${sub.id}`}
                  className="flex-1 px-2 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/25 text-cyan-400 text-[10px] font-bold text-center hover:bg-cyan-500/20 transition-colors"
                >
                  Continue
                </Link>
                <Link
                  to="/ai-tutor"
                  className="flex-1 px-2 py-1.5 rounded-lg bg-purple-500/10 border border-purple-500/25 text-purple-400 text-[10px] font-bold text-center hover:bg-purple-500/20 transition-colors"
                >
                  Ask AI
                </Link>
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
            <h3 className="text-white font-bold text-base">Recently Accessed</h3>
            <button className="text-cyan-400 text-xs font-medium hover:text-cyan-300 transition-colors">View all</button>
          </div>
          <div className="space-y-2.5">
            {recentLessons.slice(0, 3).map((lesson, i) => {
              const sub = getSubject(lesson.subjectId as SubjectId);
              return (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-[rgba(17,24,50,0.5)] border border-[rgba(56,78,135,0.15)] hover:border-[rgba(56,78,135,0.3)] transition-all">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg border flex items-center justify-center text-sm ${sub.iconBg}`}>
                      {sub.icon}
                    </div>
                    <div>
                      <p className="text-white text-sm font-semibold leading-tight">{lesson.topic}</p>
                      <p className="text-gray-500 text-[11px] leading-tight mt-0.5">{sub.shortName} • Form 4</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2 w-44">
                      <div className="flex-1 h-1.5 rounded-full bg-[rgba(56,78,135,0.2)] overflow-hidden">
                        <div className={`h-full rounded-full ${barFillClass[lesson.subjectId]}`} style={{ width: `${lesson.progress}%` }} />
                      </div>
                      <span className="text-gray-300 text-xs font-semibold w-8 text-right">{lesson.progress}%</span>
                    </div>

                    <Link
                      to={`/subjects/${lesson.subjectId}`}
                      className="px-4 py-1.5 rounded-lg bg-[rgba(34,211,238,0.06)] border border-cyan-500/20 text-cyan-400 text-xs font-bold hover:bg-cyan-500/10 transition-colors"
                    >
                      Continue
                    </Link>
                    <button className="w-6 h-6 rounded-full bg-cyan-500/10 border border-cyan-500/25 flex items-center justify-center text-cyan-400 hover:bg-cyan-500 hover:text-white transition-colors">
                      <svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor">
                        <polygon points="5,3 19,12 5,21" />
                      </svg>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Right Column */}
      <div className="w-[300px] flex-shrink-0 space-y-4 overflow-y-auto pb-6">
        {/* Overall Progress */}
        <div className="glass-card p-5">
          <h3 className="text-white font-bold text-base mb-4">Overall Progress</h3>
          <div className="flex items-center gap-4">
            {(() => {
              const totalLessons = allSubjects.reduce((a: number, s) => a + s.totalLessons, 0);
              const completed = allSubjects.reduce((a: number, s) => a + s.lessonsCompleted, 0);
              const pct = Math.round((completed / totalLessons) * 100);
              return (
                <>
                  <div className="relative w-24 h-24 flex-shrink-0">
                    <svg width="96" height="94" className="progress-ring">
                      <circle cx="48" cy="47" r="38" stroke="rgba(56, 78, 135, 0.2)" strokeWidth="6" fill="none" />
                      <circle
                        cx="48"
                        cy="47"
                        r="38"
                        stroke="url(#subjects-progress-gradient)"
                        strokeWidth="6"
                        fill="none"
                        strokeLinecap="round"
                        strokeDasharray={2 * Math.PI * 38}
                        strokeDashoffset={2 * Math.PI * 38 * (1 - pct / 100)}
                      />
                      <defs>
                        <linearGradient id="subjects-progress-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#22d3ee" />
                          <stop offset="100%" stopColor="#3b82f6" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-white font-extrabold text-lg leading-none">{pct}%</span>
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
                        <p className="text-gray-500 text-[10px]">Lessons Completed</p>
                        <p className="text-white text-xs font-bold leading-tight">{completed}</p>
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
                        <p className="text-gray-500 text-[10px]">Quizzes Taken</p>
                        <p className="text-white text-xs font-bold leading-tight">{Math.round(completed * 0.35)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                        <span className="text-[10px] font-black leading-none">XP</span>
                      </div>
                      <div>
                        <p className="text-gray-500 text-[10px]">XP Earned</p>
                        <p className="text-white text-xs font-bold leading-tight">{(completed * 100).toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                </>
              );
            })()}
          </div>
        </div>

        {/* Subject Performance */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-bold text-base">Subject Performance</h3>
            <span className="text-gray-500 text-xs font-medium">This Week</span>
          </div>
          <div className="space-y-3.5">
            {allSubjects.slice(0, 5).map((sub) => (
              <div key={sub.id} className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400 font-medium">{sub.shortName}</span>
                  <span className="text-white font-bold">{sub.progress}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-[rgba(56,78,135,0.2)] overflow-hidden">
                  <div className={`h-full rounded-full ${barFillClass[sub.id]}`} style={{ width: `${sub.progress}%` }} />
                </div>
              </div>
            ))}
          </div>
          <button className="w-full text-center text-cyan-400 hover:text-cyan-300 text-xs font-bold mt-4 pt-1 transition-colors">
            View Detailed Analytics
          </button>
        </div>

        {/* Recommended for You */}
        <div className="glass-card p-5">
          <h3 className="text-white font-bold text-base mb-1">Recommended for You</h3>
          <p className="text-gray-500 text-[11px] mb-3.5">Based on your performance</p>

          {(() => {
            const weakest = [...allSubjects].sort((a, b) => a.progress - b.progress)[0];
            return (
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-[rgba(17,24,50,0.5)] border border-[rgba(56,78,135,0.15)] mb-3">
                <div className="flex items-center gap-2.5">
                  <div className={`w-8 h-8 rounded-lg border flex items-center justify-center text-sm ${weakest.iconBg}`}>
                    {weakest.icon}
                  </div>
                  <div>
                    <p className="text-white text-xs font-bold leading-tight">Improve in {weakest.name}</p>
                    <p className="text-gray-500 text-[10px] mt-0.5">{weakest.shortName} • 15 min</p>
                  </div>
                </div>
                <button className="w-6 h-6 rounded-full bg-cyan-500/10 border border-cyan-500/25 flex items-center justify-center text-cyan-400 hover:bg-cyan-500 hover:text-white transition-colors">
                  <svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor">
                    <polygon points="5,3 19,12 5,21" />
                  </svg>
                </button>
              </div>
            );
          })()}

          <button className="w-full text-center text-cyan-400 hover:text-cyan-300 text-xs font-bold pt-1 transition-colors">
            View All Recommendations
          </button>
        </div>
      </div>
    </div>
  );
}
