import React from 'react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const menuItems = [
  { icon: 'home', label: 'Dashboard' },
  { icon: 'learning', label: 'My Learning' },
  { icon: 'subjects', label: 'Subjects' },
  { icon: 'ai', label: 'AI Tutor' },
  { icon: 'planner', label: 'Study Planner' },
  { icon: 'papers', label: 'Past Papers' },
  { icon: 'resources', label: 'Resources' },
  { icon: 'achievements', label: 'Accomplishments' },
  { icon: 'settings', label: 'Settings' },
];

const icons: Record<string, React.JSX.Element> = {
  home: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
      <polyline points="9,22 9,12 15,12 15,22" />
    </svg>
  ),
  learning: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z" />
      <path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z" />
    </svg>
  ),
  subjects: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  ),
  ai: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
    </svg>
  ),
  planner: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  ),
  papers: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <polyline points="14,2 14,8 20,8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  ),
  resources: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" />
    </svg>
  ),
  achievements: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="7" />
      <polyline points="8.21,13.89 7,23 12,20 17,23 15.79,13.88" />
    </svg>
  ),
  settings: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
    </svg>
  ),
};

export default function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  return (
    <aside className="fixed left-0 top-0 bottom-0 w-[200px] flex flex-col bg-gradient-to-b from-[#0d1225] to-[#0a0e1a] border-r border-[rgba(56,78,135,0.2)] z-50">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5 flex-shrink-0">
        <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-teal-400 to-blue-600 flex items-center justify-center shadow-lg shadow-teal-500/20">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
          </svg>
        </div>
        <div>
          <span className="text-white font-bold text-sm leading-tight block">Maarifa</span>
          <span className="text-teal-400 font-bold text-sm leading-tight block">Learn</span>
        </div>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 px-2 space-y-0.5 overflow-y-auto min-h-0">
        {menuItems.map((item) => (
          <button
            key={item.label}
            onClick={() => setActiveTab(item.label)}
            className={`sidebar-item w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-all ${
              activeTab === item.label
                ? 'active text-cyan-400 bg-cyan-400/10 border-l-[3px] border-cyan-400 font-bold'
                : 'text-gray-400 hover:text-gray-200 border-l-[3px] border-transparent'
            }`}
          >
            <span className={activeTab === item.label ? 'text-cyan-400' : 'text-gray-500'}>
              {icons[item.icon]}
            </span>
            {item.label}
          </button>
        ))}
      </nav>

      {/* Profile & Motivation container at the bottom */}
      <div className="flex-shrink-0 p-3 space-y-3 bg-gradient-to-t from-[#0a0e1a] via-[#0d1225] to-transparent">
        {/* Motivational Card */}
        <div className="p-3.5 rounded-xl bg-gradient-to-br from-[#1a1040] to-[#15103a] border border-[rgba(100,60,180,0.3)] relative overflow-hidden">
          <div className="text-center mb-1">
            <span className="text-2xl">🏆</span>
          </div>
          <p className="text-white font-bold text-xs text-center">Keep Learning!</p>
          <p className="text-gray-400 text-[10px] text-center mt-1 leading-relaxed">
            Consistency today, excellence tomorrow.
          </p>
          <div className="absolute top-1 right-2 text-yellow-400 text-[8px]">✦</div>
          <div className="absolute top-2 left-2 text-yellow-400 text-[6px]">✦</div>
        </div>

        {/* Small profile item as in mockup 2 */}
        <div className="flex items-center gap-2.5 p-2 rounded-xl bg-[rgba(17,24,50,0.5)] border border-[rgba(56,78,135,0.15)]">
          <div className="w-7 h-7 rounded-full overflow-hidden flex-shrink-0 ring-1 ring-[rgba(56,78,135,0.3)]">
            <img
              src="/images/avatar-emmanuel.jpg"
              alt="Emmanuel"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="text-left flex-1 min-w-0">
            <p className="text-white text-xs font-semibold leading-tight truncate">Emmanuel</p>
            <p className="text-gray-500 text-[10px] leading-tight truncate">Learner</p>
          </div>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-500 mr-0.5">
            <polyline points="6,9 12,15 18,9" />
          </svg>
        </div>
      </div>
    </aside>
  );
}
