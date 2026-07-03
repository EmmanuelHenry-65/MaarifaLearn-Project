interface TopNavProps {
  activeTab: string;
}

export default function TopNav({ activeTab }: TopNavProps) {
  return (
    <header className="flex items-center justify-between mb-5 gap-4 min-w-0 w-full">
      <div className="min-w-0 flex items-center gap-3">
        {activeTab === 'AI Tutor' && (
          <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 animate-float">
            <img src="/images/ai-robot.png" alt="AI Tutor" className="w-full h-full object-cover" />
          </div>
        )}
        {activeTab === 'Study Planner' && (
          <div className="w-11 h-11 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center flex-shrink-0 text-blue-400">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </div>
        )}
        {activeTab === 'Past Papers' && (
          <div className="w-11 h-11 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center flex-shrink-0 text-purple-400">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14,2 14,8 20,8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10,9 9,9 8,9" />
            </svg>
          </div>
        )}
        {activeTab === 'Settings' && (
          <div className="w-11 h-11 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center flex-shrink-0 text-purple-400 shadow-lg shadow-purple-500/10">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06A1.65 1.65 0 0 0 15 19.4a1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06A2 2 0 1 1 7.04 4.3l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09A1.65 1.65 0 0 0 15 4.6a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9c.14.32.22.66.22 1H21a2 2 0 1 1 0 4h-1.38c0 .34-.08.68-.22 1z" />
            </svg>
          </div>
        )}
        {activeTab === 'Accomplishments' && (
          <div className="w-11 h-11 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center flex-shrink-0 text-purple-400">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="8" r="7" />
              <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
            </svg>
          </div>
        )}
        {activeTab === 'Resources' && (
          <div className="w-11 h-11 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center flex-shrink-0 text-purple-400">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
          </div>
        )}
        <div className="min-w-0">
          <h1 className="text-3xl font-extrabold text-white flex items-center gap-3 leading-none tracking-tight whitespace-nowrap">
            {activeTab === 'My Learning'
              ? 'My Learning'
              : activeTab === 'Subjects'
              ? 'Subjects'
              : activeTab === 'AI Tutor'
              ? 'AI Tutor'
              : activeTab === 'Study Planner'
              ? 'Study Planner'
              : activeTab === 'Past Papers'
              ? 'Past Papers'
               : activeTab === 'Settings'
               ? 'Settings'
               : activeTab === 'Accomplishments'
               ? 'Accomplishments'
               : activeTab === 'Resources'
               ? 'Resources'
               : 'Good morning, Emmanuel! 👋'}
          </h1>
          <p className="text-gray-400 text-sm mt-2 whitespace-nowrap">
            {activeTab === 'My Learning'
              ? 'Track your progress and continue your learning journey.'
              : activeTab === 'Subjects'
              ? 'Explore all subjects in the CBC curriculum. Track your progress and master every topic.'
              : activeTab === 'AI Tutor'
              ? 'Your intelligent learning companion. Ask anything, learn anything.'
              : activeTab === 'Study Planner'
              ? 'Plan your study, stay consistent, and achieve your goals.'
              : activeTab === 'Past Papers'
              ? 'Practice with real past papers and mark schemes to boost your exam performance.'
               : activeTab === 'Settings'
               ? 'Manage your account, preferences, and learning experience.'
               : activeTab === 'Accomplishments'
               ? 'Celebrate your wins and track your learning journey.'
               : activeTab === 'Resources'
               ? 'Discover high-quality learning materials aligned to the CBC curriculum.'
               : '"Every day is a step closer to your goals."'}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3 flex-shrink-0">
        {/* Country Selector */}
        <button className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[rgba(17,24,50,0.8)] border border-[rgba(56,78,135,0.3)] text-sm text-gray-200 hover:border-[rgba(56,78,135,0.5)] transition-all">
          <span className="flex items-center justify-center w-5 h-4 rounded-[3px] overflow-hidden relative text-[8px] font-bold text-white" style={{ background: 'linear-gradient(180deg, #000 0 33%, #b91c1c 33% 66%, #16a34a 66% 100%)' }}>
            <span className="relative z-10 drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]">KE</span>
          </span>
          <span>Kenya (CBC)</span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-500">
            <polyline points="6,9 12,15 18,9" />
          </svg>
        </button>
        {/* Grade Selector */}
        <button className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[rgba(17,24,50,0.8)] border border-[rgba(56,78,135,0.3)] text-sm text-gray-200 hover:border-[rgba(56,78,135,0.5)] transition-all">
          <span>Grade 10</span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-500">
            <polyline points="6,9 12,15 18,9" />
          </svg>
        </button>
        {/* Notification */}
        <button className="relative p-2.5 rounded-xl bg-[rgba(17,24,50,0.8)] border border-[rgba(56,78,135,0.3)] text-gray-400 hover:text-white hover:border-[rgba(56,78,135,0.5)] transition-all">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 01-3.46 0" />
          </svg>
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-cyan-400 rounded-full shadow-[0_0_6px_rgba(34,211,238,0.8)]" />
        </button>
        {/* Profile */}
        <button className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-xl bg-[rgba(17,24,50,0.8)] border border-[rgba(56,78,135,0.3)] hover:border-[rgba(56,78,135,0.5)] transition-all">
          <div className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0 ring-1 ring-[rgba(56,78,135,0.4)]">
            <img
              src="/images/avatar-emmanuel.jpg"
              alt="Emmanuel"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="text-left">
            <p className="text-white text-sm font-semibold leading-tight">Emmanuel</p>
            <p className="text-gray-500 text-[11px] leading-tight">Learner</p>
          </div>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-500 ml-1">
            <polyline points="6,9 12,15 18,9" />
          </svg>
        </button>
      </div>
    </header>
  );
}
