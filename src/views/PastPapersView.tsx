import { useState } from 'react';
import { Link } from 'react-router-dom';

const stats = [
  { label: 'Papers Attempted', value: '24', sub: 'Keep practicing!', icon: '📄', color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' },
  { label: 'Average Score', value: '72%', sub: 'Good job!', icon: '✓', color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
  { label: 'Best Score', value: '89%', sub: 'Keep it up!', icon: '📈', color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/20' },
  { label: 'Total Practice Time', value: '18h 45m', sub: 'This month', icon: '🕒', color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/20' },
];

const subjects = [
  { name: 'Mathematics', icon: '⨍', color: 'bg-purple-500/10 border-purple-500/30 text-purple-400' },
  { name: 'English', icon: '📖', color: 'bg-blue-500/10 border-blue-500/30 text-blue-400' },
  { name: 'Biology', icon: '🌿', color: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' },
  { name: 'Chemistry', icon: '🧪', color: 'bg-orange-500/10 border-orange-500/30 text-orange-400' },
  { name: 'Physics', icon: '⚛️', color: 'bg-teal-500/10 border-teal-500/30 text-teal-400' },
  { name: 'History', icon: '🏛️', color: 'bg-pink-500/10 border-pink-500/30 text-pink-400' },
  { name: 'Geography', icon: '🌍', color: 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400' },
];

const papers = [
  { subject: 'Mathematics', paper: 'Paper 1', year: '2024', type: 'KCSE', duration: '2h 30m', marks: '100', score: 78, action: 'Continue Practice', icon: '⨍', color: 'bg-purple-500/10 border-purple-500/30 text-purple-400', ringColor: '#3b82f6' },
  { subject: 'English', paper: 'Paper 2', year: '2023', type: 'KCSE', duration: '2h 15m', marks: '100', score: 65, action: 'Review Attempt', icon: '📖', color: 'bg-blue-500/10 border-blue-500/30 text-blue-400', ringColor: '#3b82f6' },
  { subject: 'Biology', paper: 'Paper 1', year: '2022', type: 'KCSE', duration: '2h', marks: '100', score: 84, action: 'Start Practice', icon: '🌿', color: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400', ringColor: '#22c55e' },
  { subject: 'Chemistry', paper: 'Paper 2', year: '2023', type: 'KCSE', duration: '2h', marks: '100', score: 71, action: 'Start Practice', icon: '🧪', color: 'bg-orange-500/10 border-orange-500/30 text-orange-400', ringColor: '#f97316' },
  { subject: 'Physics', paper: 'Paper 1', year: '2024', type: 'KCSE', duration: '2h 30m', marks: '100', score: 60, action: 'Start Practice', icon: '⚛️', color: 'bg-teal-500/10 border-teal-500/30 text-teal-400', ringColor: '#06b6d4' },
  { subject: 'History', paper: 'Paper 2', year: '2021', type: 'KCSE', duration: '2h 15m', marks: '100', score: 55, action: 'Start Practice', icon: '🏛️', color: 'bg-pink-500/10 border-pink-500/30 text-pink-400', ringColor: '#ec4899' },
];

const recentActivity = [
  { subject: 'Mathematics', paper: 'Paper 1 (2024)', time: 'Attempted 2 days ago', score: '78%', icon: '⨍', color: 'bg-purple-500/10 border-purple-500/30 text-purple-400' },
  { subject: 'English', paper: 'Paper 2 (2023)', time: 'Reviewed 3 days ago', score: '65%', icon: '📖', color: 'bg-blue-500/10 border-blue-500/30 text-blue-400' },
  { subject: 'Biology', paper: 'Paper 1 (2022)', time: 'Attempted 5 days ago', score: '84%', icon: '🌿', color: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' },
  { subject: 'Chemistry', paper: 'Paper 2 (2023)', time: 'Started 1 week ago', score: '71%', icon: '🧪', color: 'bg-orange-500/10 border-orange-500/30 text-orange-400' },
];

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
  const [activeTab, setActiveTab] = useState<'All Papers' | 'My Attempts' | 'Bookmarked'>('All Papers');

  return (
    <div className="flex gap-6 mt-2 flex-1 min-h-0">
      {/* Left/Center Column */}
      <div className="flex-1 min-w-0 space-y-4 overflow-y-auto pr-1">
        
        {/* Stats Row */}
        <div className="grid grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <div key={i} className="glass-card p-4 flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl border flex items-center justify-center text-xl flex-shrink-0 ${stat.bg}`}>
                {stat.icon === '✓' ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={stat.color}><polyline points="20,6 9,17 4,12" /></svg>
                ) : stat.icon === '📈' ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={stat.color}><polyline points="22,7 13.5,15.5 8.5,10.5 2,17" /><polyline points="16,7 22,7 22,13" /></svg>
                ) : stat.icon === '🕒' ? (
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
          <h3 className="text-white font-bold text-base mb-4">Explore by Subject</h3>
          <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
            {subjects.map((sub, i) => (
              <button key={i} className="flex flex-col items-center gap-2 min-w-[80px] p-3 rounded-xl bg-[rgba(17,24,50,0.5)] border border-[rgba(56,78,135,0.15)] hover:border-cyan-500/30 transition-all group">
                <div className={`w-10 h-10 rounded-xl border flex items-center justify-center text-lg ${sub.color} group-hover:scale-110 transition-transform`}>
                  {sub.icon}
                </div>
                <span className="text-gray-400 text-[10px] font-semibold group-hover:text-white">{sub.name}</span>
              </button>
            ))}
            <button className="flex flex-col items-center justify-center min-w-[80px] p-3 rounded-xl border border-dashed border-[rgba(56,78,135,0.3)] hover:border-cyan-500/30 transition-all group">
              <div className="w-10 h-10 rounded-full bg-[rgba(56,78,135,0.2)] flex items-center justify-center text-cyan-400 mb-1 group-hover:bg-cyan-500/10">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12,5 19,12 12,19" /></svg>
              </div>
              <span className="text-cyan-400 text-[10px] font-semibold">View all</span>
            </button>
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
                <input type="text" placeholder="Search papers..." className="w-40 px-3 py-1.5 rounded-lg bg-[rgba(17,24,50,0.8)] border border-[rgba(56,78,135,0.3)] text-gray-300 text-xs placeholder-gray-600 focus:outline-none focus:border-cyan-500/40" />
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
              </div>
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[rgba(17,24,50,0.8)] border border-[rgba(56,78,135,0.3)] text-gray-300 text-xs hover:border-cyan-500/30 transition-all">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="22,3 2,3 10,12.46 10,19 14,21 14,12.46" /></svg>
                Filter
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6,9 12,15 18,9" /></svg>
              </button>
            </div>
          </div>

          {/* List */}
          <div className="space-y-2.5">
            {papers.map((p, i) => (
              <div key={i} className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-4 p-3.5 rounded-xl bg-[rgba(17,24,50,0.5)] border border-[rgba(56,78,135,0.15)] hover:border-[rgba(56,78,135,0.3)] transition-all">
                <div className="flex items-center gap-4 min-w-0">
                  <div className={`w-10 h-10 rounded-xl border flex items-center justify-center text-lg flex-shrink-0 ${p.color}`}>
                    {p.icon}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-white text-sm font-bold leading-tight truncate">{p.subject} – {p.paper}</p>
                      <span className="px-1.5 py-0.5 rounded bg-green-500/10 text-green-400 text-[9px] font-bold border border-green-500/20 flex-shrink-0">{p.year}</span>
                    </div>
                    <p className="text-gray-500 text-[10px] mt-1 flex items-center gap-1.5">
                      <span className="flex items-center gap-0.5 flex-shrink-0"><svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></svg> {p.type}</span>
                      <span className="flex-shrink-0">•</span>
                      <span className="flex-shrink-0">{p.duration}</span>
                      <span className="flex-shrink-0">•</span>
                      <span className="flex-shrink-0">{p.marks} Marks</span>
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <ScoreRing score={p.score} color={p.ringColor} />
                  <div className="flex flex-col">
                    <span className="text-white font-bold text-sm leading-none">{p.score}%</span>
                    <span className="text-gray-500 text-[10px] mt-1">Your Score</span>
                  </div>
                </div>
                <button className={`px-5 py-2 rounded-lg border text-sm font-bold transition-all whitespace-nowrap ${
                  p.action === 'Continue Practice' ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20' :
                  p.action === 'Review Attempt' ? 'bg-blue-500/10 border-blue-500/30 text-blue-400 hover:bg-blue-500/20' :
                  'bg-[rgba(17,24,50,0.8)] border-[rgba(56,78,135,0.3)] text-cyan-400 hover:border-cyan-500/30'
                }`}>
                  {p.action}
                </button>
                <button className="text-gray-500 hover:text-gray-300 transition-colors">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="1.6" /><circle cx="12" cy="12" r="1.6" /><circle cx="12" cy="19" r="1.6" /></svg>
                </button>
              </div>
            ))}
          </div>
          
          <button className="w-full flex items-center justify-center gap-1.5 text-cyan-400 hover:text-cyan-300 text-xs font-bold mt-5 py-1.5 transition-colors">
            Load more papers
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6,9 12,15 18,9" /></svg>
          </button>
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
            <input type="text" placeholder="Ask a question about any topic..." className="flex-1 px-3 py-2 rounded-lg bg-[rgba(17,24,50,0.8)] border border-[rgba(56,78,135,0.3)] text-gray-300 text-xs placeholder-gray-600 focus:outline-none focus:border-cyan-500/40" />
            <button className="w-8 h-8 rounded-lg bg-cyan-500 flex items-center justify-center text-white hover:bg-cyan-400 transition-colors">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12,5 19,12 12,19" /></svg>
            </button>
          </div>
          <p className="text-gray-500 text-[10px] font-bold mb-2">Try asking:</p>
          <div className="grid grid-cols-2 gap-1.5">
            {['Explain this concept', 'Help me solve a question', 'Why is this answer correct?', 'Give me a hint'].map((q, i) => (
              <button key={i} className="px-2 py-1.5 rounded bg-[rgba(17,24,50,0.5)] border border-[rgba(56,78,135,0.15)] text-gray-400 text-[10px] hover:border-cyan-500/30 hover:text-cyan-400 transition-all text-left truncate">
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Performance Overview */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-bold text-base">Performance Overview</h3>
            <button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[rgba(17,24,50,0.7)] border border-[rgba(56,78,135,0.25)] text-gray-300 text-[11px] font-semibold">
              This Month
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-gray-500"><polyline points="6,9 12,15 18,9" /></svg>
            </button>
          </div>
          <div className="flex items-center gap-5">
            <div className="relative w-24 h-24 flex-shrink-0">
              <svg width="96" height="94" className="progress-ring">
                <circle cx="48" cy="47" r="38" stroke="rgba(56, 78, 135, 0.2)" strokeWidth="8" fill="none" />
                <circle cx="48" cy="47" r="38" stroke="url(#perf-grad)" strokeWidth="8" fill="none" strokeLinecap="round" strokeDasharray={2 * Math.PI * 38} strokeDashoffset={2 * Math.PI * 38 * (1 - 0.72)} />
                <defs>
                  <linearGradient id="perf-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#a855f7" />
                    <stop offset="50%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#22d3ee" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-white font-extrabold text-lg leading-none">72%</span>
                <span className="text-gray-500 text-[9px] mt-0.5">Average Score</span>
              </div>
            </div>
            <div className="flex-1 space-y-2">
              {[
                { label: 'Excellent (80%+)', val: 8, color: 'bg-green-500' },
                { label: 'Good (60% - 79%)', val: 10, color: 'bg-cyan-500' },
                { label: 'Average (40% - 59%)', val: 4, color: 'bg-blue-500' },
                { label: 'Needs Improvement', val: 2, color: 'bg-pink-500' },
              ].map((item, i) => (
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
          <button className="w-full text-center text-cyan-400 hover:text-cyan-300 text-xs font-bold mt-4 py-2 rounded-lg bg-[rgba(17,24,50,0.5)] border border-[rgba(56,78,135,0.2)] hover:border-cyan-500/30 transition-all">
            View Detailed Analytics
          </button>
        </div>

        {/* Recent Activity */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-bold text-base">Recent Activity</h3>
            <button className="text-cyan-400 text-xs font-medium hover:text-cyan-300 transition-colors">View all</button>
          </div>
          <div className="space-y-3">
            {recentActivity.map((act, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={`w-7 h-7 rounded-lg border flex items-center justify-center text-xs flex-shrink-0 ${act.color}`}>
                    {act.icon}
                  </div>
                  <div className="min-w-0">
                    <p className="text-white text-xs font-semibold leading-tight truncate">{act.subject} {act.paper}</p>
                    <p className="text-gray-500 text-[10px] truncate">{act.time}</p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded bg-[rgba(56,78,135,0.2)] text-gray-300 text-[10px] font-bold flex-shrink-0 ml-2">{act.score}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
