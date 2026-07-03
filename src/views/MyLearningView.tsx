import { useState } from 'react';

const continueLearningCards = [
  {
    subject: 'Biology',
    topic: 'Photosynthesis in Plants',
    progress: 61,
    timeLeft: '15 min left',
    icon: '🌿',
    color: 'from-emerald-500/20 to-emerald-600/10',
    iconColor: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
    barColor: 'bg-gradient-to-r from-emerald-500 to-emerald-400'
  },
  {
    subject: 'Mathematics',
    topic: 'Quadratic Equations',
    progress: 45,
    timeLeft: '20 min left',
    icon: '⨍',
    color: 'from-blue-500/20 to-blue-600/10',
    iconColor: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
    barColor: 'bg-gradient-to-r from-blue-500 to-blue-400'
  },
  {
    subject: 'Chemistry',
    topic: 'Chemical Bonding',
    progress: 33,
    timeLeft: '20 min left',
    icon: '🧪',
    color: 'from-amber-500/20 to-amber-600/10',
    iconColor: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
    barColor: 'bg-gradient-to-r from-amber-500 to-amber-400'
  },
  {
    subject: 'English',
    topic: 'Narrative Writing',
    progress: 70,
    timeLeft: '10 min left',
    icon: '📖',
    color: 'from-purple-500/20 to-purple-600/10',
    iconColor: 'bg-purple-500/10 border-purple-500/20 text-purple-400',
    barColor: 'bg-gradient-to-r from-purple-500 to-purple-400'
  }
];

const lessonsList = [
  {
    subject: 'Biology',
    form: 'Form 4',
    topic: 'Photosynthesis in Plants',
    progress: 61,
    icon: '🌿',
    iconColor: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400',
    barColor: 'bg-gradient-to-r from-emerald-500 to-emerald-400'
  },
  {
    subject: 'Mathematics',
    form: 'Form 4',
    topic: 'Quadratic Equations',
    progress: 45,
    icon: '⨍',
    iconColor: 'bg-blue-500/15 border-blue-500/30 text-blue-400',
    barColor: 'bg-gradient-to-r from-blue-500 to-blue-400'
  },
  {
    subject: 'Chemistry',
    form: 'Form 4',
    topic: 'Chemical Bonding',
    progress: 33,
    icon: '🧪',
    iconColor: 'bg-amber-500/15 border-amber-500/30 text-amber-400',
    barColor: 'bg-gradient-to-r from-amber-500 to-amber-400'
  },
  {
    subject: 'English',
    form: 'Form 4',
    topic: 'Narrative Writing',
    progress: 70,
    icon: '📖',
    iconColor: 'bg-purple-500/15 border-purple-500/30 text-purple-400',
    barColor: 'bg-gradient-to-r from-purple-500 to-purple-400'
  },
  {
    subject: 'Biology',
    form: 'Form 4',
    topic: 'Cell Division',
    progress: 20,
    icon: '🧫',
    iconColor: 'bg-indigo-500/15 border-indigo-500/30 text-indigo-400',
    barColor: 'bg-gradient-to-r from-indigo-500 to-indigo-400'
  }
];

const recommendations = [
  { type: 'Watch', title: 'The Process of Photosynthesis', desc: 'Video • 12 min', icon: '📺' },
  { type: 'Practice', title: 'Algebraic Expressions Quiz', desc: 'Quiz • 15 min', icon: '📝' },
  { type: 'Read', title: 'Plant Cell Structure', desc: 'Article • 8 min', icon: '📄' }
];

const streakDays = [
  { day: 'M', active: true, streak: true },
  { day: 'T', active: true, streak: true },
  { day: 'W', active: true, streak: true },
  { day: 'T', active: true, streak: true },
  { day: 'F', active: true, streak: true },
  { day: 'S', active: true, streak: true },
  { day: 'S', active: false, streak: false }
];

const upcomingLessons = [
  { subject: 'Mathematics', topic: 'Quadratic Equations', when: 'Tomorrow', time: '10:00 AM', icon: '⨍', iconColor: 'bg-blue-500/15 border-blue-500/30 text-blue-400' },
  { subject: 'Biology', topic: 'Plant Structure', when: '03 Jul', time: '2:00 PM', icon: '🌿', iconColor: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400' },
  { subject: 'Chemistry', topic: 'Acids and Bases', when: '04 Jul', time: '11:00 AM', icon: '🧪', iconColor: 'bg-amber-500/15 border-amber-500/30 text-amber-400' }
];

export default function MyLearningView() {
  const [activeTab, setActiveTab] = useState<'In Progress' | 'Completed' | 'Bookmarked'>('In Progress');

  return (
    <div className="flex gap-6 mt-2 flex-1 min-h-0">
      {/* Left/Center Column */}
      <div className="flex-1 min-w-0 space-y-4 overflow-y-auto pr-1">
        
        {/* Continue Learning Row */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-bold text-lg">Continue Learning</h3>
            <button className="text-cyan-400 text-xs font-medium hover:text-cyan-300 transition-colors">View all</button>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {continueLearningCards.map((card, i) => (
              <div key={i} className="bg-[rgba(17,24,50,0.6)] border border-[rgba(56,78,135,0.2)] hover:border-cyan-500/30 rounded-xl p-3.5 transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`w-7 h-7 rounded-lg border flex items-center justify-center text-sm font-semibold ${card.iconColor}`}>
                      {card.icon}
                    </span>
                    <div>
                      <p className="text-gray-400 text-[10px] uppercase font-bold tracking-wider leading-tight">{card.subject}</p>
                      <p className="text-white text-xs font-bold leading-tight line-clamp-1">{card.topic}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-3.5">
                    <div className="flex-1 h-1.5 rounded-full bg-[rgba(56,78,135,0.2)] overflow-hidden mr-2">
                      <div className={`h-full rounded-full ${card.barColor}`} style={{ width: `${card.progress}%` }} />
                    </div>
                    <span className="text-gray-300 text-[10px] font-bold whitespace-nowrap">{card.progress}%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-1 text-gray-500 text-[10px]">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12,6 12,12 16,14" />
                    </svg>
                    {card.timeLeft}
                  </div>
                  <button className="w-6 h-6 rounded-full bg-cyan-500 flex items-center justify-center text-white shadow-md shadow-cyan-500/20 hover:scale-105 transition-transform">
                    <svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor">
                      <polygon points="5,3 19,12 5,21" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tab List Section */}
        <div className="glass-card p-5">
          {/* Sub Tabs */}
          <div className="flex items-center gap-4 mb-4 border-b border-[rgba(56,78,135,0.15)] pb-2">
            {(['In Progress', 'Completed', 'Bookmarked'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`text-sm font-semibold pb-1.5 border-b-2 transition-all relative ${
                  activeTab === tab
                    ? 'text-cyan-400 border-cyan-400 font-bold'
                    : 'text-gray-500 border-transparent hover:text-gray-300'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Lessons list */}
          <div className="space-y-2.5">
            {lessonsList.map((lesson, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-[rgba(17,24,50,0.5)] border border-[rgba(56,78,135,0.15)] hover:border-[rgba(56,78,135,0.3)] transition-all">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className={`w-9 h-9 rounded-lg border flex items-center justify-center text-base font-semibold flex-shrink-0 ${lesson.iconColor}`}>
                    {lesson.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-white text-sm font-semibold leading-tight">{lesson.topic}</p>
                    <p className="text-gray-500 text-[11px] leading-tight mt-0.5">{lesson.subject} • {lesson.form}</p>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  {/* Progress bar */}
                  <div className="flex items-center gap-2 w-44">
                    <div className="flex-1 h-1.5 rounded-full bg-[rgba(56,78,135,0.2)] overflow-hidden">
                      <div className={`h-full rounded-full ${lesson.barColor}`} style={{ width: `${lesson.progress}%` }} />
                    </div>
                    <span className="text-gray-300 text-xs font-semibold w-8 text-right">{lesson.progress}%</span>
                  </div>

                  {/* Continue Button */}
                  <button className="px-4 py-1.5 rounded-lg bg-[rgba(34,211,238,0.06)] border border-cyan-500/20 text-cyan-400 text-xs font-bold hover:bg-cyan-500/10 transition-colors">
                    Continue
                  </button>

                  {/* Bookmark Button */}
                  <button className="text-gray-500 hover:text-cyan-400 transition-colors">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button className="w-full text-center text-gray-400 hover:text-white text-xs font-semibold mt-4 py-1.5 transition-colors">
            View All My Learning
          </button>
        </div>

        {/* Recommended for You */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-3.5">
            <div>
              <h3 className="text-white font-bold text-base leading-tight">Recommended for You</h3>
              <p className="text-gray-500 text-xs">Based on your progress and performance</p>
            </div>
            <button className="text-cyan-400 text-xs font-medium hover:text-cyan-300 transition-colors">View all</button>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {recommendations.map((rec, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-[rgba(17,24,50,0.5)] border border-[rgba(56,78,135,0.15)] hover:border-[rgba(56,78,135,0.3)] transition-all">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{rec.icon}</span>
                  <div>
                    <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">{rec.type}: <span className="text-gray-300 normal-case font-medium">{rec.title}</span></p>
                    <p className="text-gray-500 text-[10px] mt-0.5">{rec.desc}</p>
                  </div>
                </div>
                <button className="w-6 h-6 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 hover:bg-cyan-500 hover:text-white transition-colors">
                  <svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor">
                    <polygon points="5,3 19,12 5,21" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Right Column */}
      <div className="w-[300px] flex-shrink-0 space-y-4 overflow-y-auto pb-6">
        {/* My Performance */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-bold text-base">My Performance</h3>
            <select className="bg-[rgba(17,24,50,0.8)] border border-[rgba(56,78,135,0.3)] text-gray-300 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none">
              <option>This Week</option>
              <option>This Month</option>
            </select>
          </div>
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
                  stroke="url(#performance-gradient)"
                  strokeWidth="6"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 38}
                  strokeDashoffset={2 * Math.PI * 38 * (1 - 0.78)}
                />
                <defs>
                  <linearGradient id="performance-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#22d3ee" />
                    <stop offset="100%" stopColor="#3b82f6" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-white font-extrabold text-lg leading-none">78%</span>
                <span className="text-gray-500 text-[9px] mt-0.5">Avg Score</span>
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
                  <p className="text-white text-xs font-bold leading-tight">18</p>
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
                  <p className="text-white text-xs font-bold leading-tight">12</p>
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

        {/* Study Streak */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-1.5">
              <span className="text-base">🔥</span>
              <h3 className="text-white font-bold text-base">Study Streak</h3>
            </div>
            <span className="text-orange-400 font-bold text-xs">7 Days</span>
          </div>
          <div className="flex items-center justify-between px-1">
            {streakDays.map((sd, i) => (
              <div key={i} className="flex flex-col items-center">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                    sd.streak
                      ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-md shadow-green-500/20'
                      : 'bg-[rgba(17,24,50,0.5)] border border-[rgba(56,78,135,0.2)] text-gray-500'
                  }`}
                >
                  {sd.streak ? (
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20,6 9,17 4,12" />
                    </svg>
                  ) : (
                    sd.day
                  )}
                </div>
              </div>
            ))}
          </div>
          <p className="text-gray-400 text-xs text-center mt-4">
            You're on fire! Keep it up! 🔥
          </p>
        </div>

        {/* Upcoming Lessons */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-bold text-base">Upcoming Lessons</h3>
            <button className="text-cyan-400 text-xs font-medium hover:text-cyan-300 transition-colors">View Calendar</button>
          </div>
          
          {/* Month navigator */}
          <div className="flex items-center justify-between bg-[rgba(17,24,50,0.4)] border border-[rgba(56,78,135,0.15)] rounded-lg px-3 py-1.5 mb-3">
            <button className="text-gray-500 hover:text-white transition-colors">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="15,18 9,12 15,6" />
              </svg>
            </button>
            <span className="text-white text-xs font-bold">July 2026</span>
            <button className="text-gray-500 hover:text-white transition-colors">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="9,18 15,12 9,6" />
              </svg>
            </button>
          </div>

          <div className="space-y-2.5">
            {upcomingLessons.map((les, i) => (
              <div key={i} className="flex items-center justify-between p-2.5 rounded-xl bg-[rgba(17,24,50,0.5)] border border-[rgba(56,78,135,0.15)]">
                <div className="flex items-center gap-2.5">
                  <div className={`w-8 h-8 rounded-lg border flex items-center justify-center text-sm ${les.iconColor}`}>
                    {les.icon}
                  </div>
                  <div>
                    <p className="text-white text-xs font-bold leading-tight">{les.topic}</p>
                    <p className="text-gray-500 text-[10px] mt-0.5">{les.subject}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-cyan-400 text-[10px] font-bold leading-tight">{les.when}</p>
                  <p className="text-gray-500 text-[10px] leading-tight mt-0.5">{les.time}</p>
                </div>
              </div>
            ))}
          </div>

          <button className="w-full btn-primary mt-4 py-2 text-white text-xs font-bold rounded-xl">
            Go to Study Planner
          </button>
        </div>

      </div>
    </div>
  );
}
