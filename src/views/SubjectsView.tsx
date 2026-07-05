import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

const subjectsList = [
  // Mandatory
  { id: 'mathematics', name: 'Mathematics', category: 'core', progress: 82, completed: 24, total: 29, icon: '⨍', color: '#a855f7', barBg: 'bg-purple-500/20', fillClass: 'bg-purple-500', iconBg: 'bg-purple-500/15 border-purple-500/30 text-purple-400' },
  { id: 'english', name: 'English', category: 'core', progress: 75, completed: 20, total: 27, icon: '📖', color: '#3b82f6', barBg: 'bg-blue-500/20', fillClass: 'bg-blue-500', iconBg: 'bg-blue-500/15 border-blue-500/30 text-blue-400' },
  { id: 'kiswahili', name: 'Kiswahili', category: 'core', progress: 71, completed: 17, total: 24, icon: '🗣️', color: '#14b8a6', barBg: 'bg-teal-500/20', fillClass: 'bg-teal-500', iconBg: 'bg-teal-500/15 border-teal-500/30 text-teal-400' },
  { id: 'ict', name: 'ICT', category: 'core', progress: 88, completed: 22, total: 25, icon: '💻', color: '#22d3ee', barBg: 'bg-cyan-500/20', fillClass: 'bg-cyan-500', iconBg: 'bg-cyan-500/15 border-cyan-500/30 text-cyan-400' },
  { id: 'pe', name: 'Physical Education', category: 'core', progress: 45, completed: 9, total: 20, icon: '🏃', color: '#6366f1', barBg: 'bg-indigo-500/20', fillClass: 'bg-indigo-500', iconBg: 'bg-indigo-500/15 border-indigo-500/30 text-indigo-400' },
  { id: 'csl', name: 'Community Service Learning', category: 'core', progress: 54, completed: 11, total: 22, icon: '🤝', color: '#10b981', barBg: 'bg-emerald-500/20', fillClass: 'bg-emerald-500', iconBg: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400' },
  // Electives
  { id: 'chemistry', name: 'Chemistry', category: 'optional', progress: 56, completed: 14, total: 25, icon: '🧪', color: '#f97316', barBg: 'bg-orange-500/20', fillClass: 'bg-orange-500', iconBg: 'bg-orange-500/15 border-orange-500/30 text-orange-400' },
  { id: 'physics', name: 'Physics', category: 'optional', progress: 39, completed: 9, total: 23, icon: '⚛️', color: '#f59e0b', barBg: 'bg-amber-500/20', fillClass: 'bg-amber-500', iconBg: 'bg-amber-500/15 border-amber-500/30 text-amber-400' },
  { id: 'computer-studies', name: 'Computer Studies', category: 'optional', progress: 78, completed: 18, total: 24, icon: '🖥️', color: '#0ea5e9', barBg: 'bg-sky-500/20', fillClass: 'bg-sky-500', iconBg: 'bg-sky-500/15 border-sky-500/30 text-sky-400' },
];

const recentlyAccessed = [
  { topic: 'Photosynthesis in Plants', subject: 'Biology', form: 'Form 4', progress: 61, barColor: 'bg-gradient-to-r from-emerald-500 to-emerald-400' },
  { topic: 'Quadratic Equations', subject: 'Mathematics', form: 'Form 4', progress: 45, barColor: 'bg-gradient-to-r from-blue-500 to-blue-400' },
  { topic: 'Chemical Bonding', subject: 'Chemistry', form: 'Form 4', progress: 33, barColor: 'bg-gradient-to-r from-orange-500 to-orange-400' }
];

const performanceStats = [
  { name: 'Mathematics', progress: 82, fillClass: 'bg-purple-500' },
  { name: 'English', progress: 75, fillClass: 'bg-blue-500' },
  { name: 'Biology', progress: 68, fillClass: 'bg-emerald-500' },
  { name: 'Chemistry', progress: 56, fillClass: 'bg-orange-500' },
  { name: 'Geography', progress: 60, fillClass: 'bg-pink-500' }
];

export default function SubjectsView() {
  const [activeSubTab, setActiveSubTab] = useState<'All Subjects' | 'Core Subjects' | 'Optional Subjects'>('All Subjects');
  const [searchQuery, setSearchQuery] = useState('');
  const { theme } = useTheme();
  const rowBg = theme === 'light' ? 'bg-white border-slate-200' : 'bg-[rgba(17,24,50,0.5)] border-[rgba(56,78,135,0.15)]';
  const textColor = theme === 'light' ? 'text-slate-900' : 'text-white';
  const mutedColor = theme === 'light' ? 'text-slate-500' : 'text-gray-500';
  const subTextColor = theme === 'light' ? 'text-slate-600' : 'text-gray-400';

  const filteredSubjects = subjectsList.filter((sub) => {
    const matchesTab =
      activeSubTab === 'All Subjects' ||
      (activeSubTab === 'Core Subjects' && sub.category === 'core') ||
      (activeSubTab === 'Optional Subjects' && sub.category === 'optional');
    const matchesSearch = sub.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <div className="flex gap-6 mt-2 flex-1 min-h-0">
      {/* Left/Center Column */}
      <div className="flex-1 min-w-0 space-y-4 overflow-y-auto pr-1">
        
        {/* Navigation & Search Area */}
        <div className="flex items-center justify-between gap-4">
          {/* Sub Tabs */}
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

          {/* Search bar + Views Toggle */}
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
        <div className="grid grid-cols-4 gap-3">
          {filteredSubjects.map((sub) => (
            <Link
              key={sub.id}
              to={`/subjects/${sub.id}`}
              className="bg-[rgba(17,24,50,0.6)] border border-[rgba(56,78,135,0.2)] hover:border-cyan-500/30 rounded-xl p-4 transition-all flex flex-col justify-between relative group"
            >
              {/* Category badge */}
              <span className={`absolute top-2.5 right-2.5 px-1.5 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-wider ${
                sub.category === 'core'
                  ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                  : 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
              }`}>
                {sub.category === 'core' ? 'Core' : 'Optional'}
              </span>
              <div className="flex flex-col items-center text-center">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold border mb-3 shadow-lg ${sub.iconBg}`}>
                  {sub.icon}
                </div>
                <h4 className="text-white font-bold text-sm leading-tight">{sub.name}</h4>
                <p className="text-cyan-400 text-[11px] font-bold mt-1">{sub.progress}% Complete</p>
                <div className={`w-28 h-1 rounded-full ${sub.barBg} mt-2.5 overflow-hidden`}>
                  <div className={`h-full rounded-full ${sub.fillClass}`} style={{ width: `${sub.progress}%` }} />
                </div>
              </div>
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-[rgba(56,78,135,0.1)]">
                <span className="text-gray-500 text-[10px] font-bold">{sub.completed} / {sub.total} Lessons</span>
              </div>
              <div className="flex items-center gap-1.5 mt-2.5">
                <span className="flex-1 text-center px-2 py-1.5 rounded-md bg-cyan-500/10 border border-cyan-500/25 text-cyan-400 text-[10px] font-bold group-hover:bg-cyan-500/20 transition-colors">
                  Continue
                </span>
                <span className="flex-1 text-center px-2 py-1.5 rounded-md bg-purple-500/10 border border-purple-500/25 text-purple-400 text-[10px] font-bold group-hover:bg-purple-500/20 transition-colors">
                  Ask AI
                </span>
              </div>
            </Link>
          ))}
        </div>

        {/* Empty search state */}
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
            <button className="text-cyan-600 text-xs font-medium hover:text-cyan-700 transition-colors">View all</button>
          </div>
          <div className="space-y-2.5">
            {recentlyAccessed.map((lesson, i) => (
              <div key={i} className={`flex items-center justify-between p-3 rounded-xl border hover:border-cyan-500/30 transition-all ${rowBg}`}>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-600 text-sm font-semibold">
                    📖
                  </div>
                  <div>
                    <p className={`text-sm font-semibold leading-tight ${textColor}`}>{lesson.topic}</p>
                    <p className={`${mutedColor} text-[11px] leading-tight mt-0.5`}>{lesson.subject} • {lesson.form}</p>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  {/* Progress bar */}
                  <div className="flex items-center gap-2 w-44">
                    <div className={`flex-1 h-1.5 rounded-full overflow-hidden ${theme === 'light' ? 'bg-slate-200' : 'bg-[rgba(56,78,135,0.2)]'}`}>
                      <div className={`h-full rounded-full ${lesson.barColor}`} style={{ width: `${lesson.progress}%` }} />
                    </div>
                    <span className={`${subTextColor} text-xs font-semibold w-8 text-right`}>{lesson.progress}%</span>
                  </div>

                  {/* Continue Button */}
                  <button className="px-4 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-600 text-xs font-bold hover:bg-cyan-500/20 transition-colors">
                    Continue
                  </button>

                  {/* Play Button */}
                  <button className="w-6 h-6 rounded-full bg-cyan-500/10 border border-cyan-500/25 flex items-center justify-center text-cyan-600 hover:bg-cyan-500 hover:text-white transition-colors">
                    <svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor">
                      <polygon points="5,3 19,12 5,21" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Right Column */}
      <div className="w-[300px] flex-shrink-0 space-y-4 overflow-y-auto pb-6">
        {/* Overall Progress */}
        <div className="glass-card p-5">
          <h3 className="text-white font-bold text-base mb-4">Overall Progress</h3>
          <div className="flex items-center gap-4">
            {/* Avg Score Circular progress */}
            <div className="relative w-24 h-24 flex-shrink-0">
              <svg width="96" height="94" className="progress-ring">
                <circle
                  cx="48"
                  cy="47"
                  r="38"
                  stroke="rgba(56, 78, 135, 0.2)"
                  strokeWidth="6"
                  fill="none"
                />
                <circle
                  cx="48"
                  cy="47"
                  r="38"
                  stroke="url(#subjects-progress-gradient)"
                  strokeWidth="6"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 38}
                  strokeDashoffset={2 * Math.PI * 38 * (1 - 0.64)}
                />
                <defs>
                  <linearGradient id="subjects-progress-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#22d3ee" />
                    <stop offset="100%" stopColor="#3b82f6" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-white font-extrabold text-lg leading-none">64%</span>
                <span className="text-gray-500 text-[9px] mt-0.5">Average</span>
              </div>
            </div>

            {/* mini stats */}
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
                  <p className="text-white text-xs font-bold leading-tight">124</p>
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
                  <p className="text-white text-xs font-bold leading-tight">56</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                  <span className="text-[10px] font-black leading-none">XP</span>
                </div>
                <div>
                  <p className="text-gray-500 text-[10px]">XP Earned</p>
                  <p className="text-white text-xs font-bold leading-tight">2,560</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Subject Performance */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-bold text-base">Subject Performance</h3>
            <span className="text-gray-500 text-xs font-medium">This Week</span>
          </div>
          <div className="space-y-3.5">
            {performanceStats.map((stat, i) => (
              <div key={i} className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400 font-medium">{stat.name}</span>
                  <span className="text-white font-bold">{stat.progress}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-[rgba(56,78,135,0.2)] overflow-hidden">
                  <div className={`h-full rounded-full ${stat.fillClass}`} style={{ width: `${stat.progress}%` }} />
                </div>
              </div>
            ))}
          </div>
          <button className="w-full text-center text-cyan-400 hover:text-cyan-300 text-xs font-bold mt-4 pt-1 transition-colors">
            View Detailed Analytics
          </button>
        </div>

        {/* Recommended for You (Sidebar version) */}
        <div className="glass-card p-5">
          <h3 className="text-white font-bold text-base mb-1">Recommended for You</h3>
          <p className="text-gray-500 text-[11px] mb-3.5">Based on your performance</p>
          
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-[rgba(17,24,50,0.5)] border border-[rgba(56,78,135,0.15)] mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-400 text-sm">
                🧫
              </div>
              <div>
                <p className="text-white text-xs font-bold leading-tight">Improve in Cell Division</p>
                <p className="text-gray-500 text-[10px] mt-0.5">Biology • 15 min</p>
              </div>
            </div>
            <button className="w-6 h-6 rounded-full bg-cyan-500/10 border border-cyan-500/25 flex items-center justify-center text-cyan-400 hover:bg-cyan-500 hover:text-white transition-colors">
              <svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="5,3 19,12 5,21" />
              </svg>
            </button>
          </div>

          <button className="w-full text-center text-cyan-400 hover:text-cyan-300 text-xs font-bold pt-1 transition-colors">
            View All Recommendations
          </button>
        </div>

      </div>
    </div>
  );
}
