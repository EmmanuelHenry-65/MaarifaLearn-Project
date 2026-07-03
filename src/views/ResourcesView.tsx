import { useState } from 'react';

const filterTabs = ['All', 'Notes', 'Videos', 'eBooks', 'Articles', 'Worksheets', 'Animations', 'Audio'] as const;

const stats = [
  { label: 'Resources available', value: '2,450+', icon: '📚', color: 'text-purple-400 bg-purple-500/10 border-purple-500/20' },
  { label: 'Subjects covered', value: '18', icon: '📂', color: 'text-green-400 bg-green-500/10 border-green-500/20' },
  { label: 'CBC aligned content', value: 'CB', icon: '🎯', color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20' },
  { label: 'Updated', value: 'Regularly', icon: '🔄', color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
];

const subjects = [
  { name: 'Biology', count: 342, color: 'bg-emerald-500', icon: '🌿' },
  { name: 'Mathematics', count: 512, color: 'bg-blue-500', icon: '⨍' },
  { name: 'English', count: 428, color: 'bg-purple-500', icon: '📖' },
  { name: 'Chemistry', count: 298, color: 'bg-orange-500', icon: '🧪' },
  { name: 'Geography', count: 256, color: 'bg-teal-500', icon: '🌍' },
];

const featuredResources = [
  {
    title: 'Biology: Plant Cells Notes',
    desc: 'Comprehensive notes with diagrams and explanations.',
    type: 'NOTES',
    typeColor: 'bg-green-500',
    meta: 'PDF • 12 pages',
    image: 'bg-gradient-to-br from-green-800 to-emerald-900',
    icon: '🌿',
  },
  {
    title: 'Quadratic Equations',
    desc: 'Step-by-step explanation with worked examples.',
    type: 'VIDEO',
    typeColor: 'bg-purple-500',
    meta: 'YouTube • 18 min',
    image: 'bg-gradient-to-br from-purple-900 to-indigo-900',
    icon: '▶',
  },
  {
    title: 'Moving With Purpose',
    desc: 'CBC English setbook for Grade 10.',
    type: 'EBOOK',
    typeColor: 'bg-yellow-600',
    meta: 'PDF • 150 pages',
    image: 'bg-gradient-to-br from-amber-800 to-orange-900',
    icon: '📖',
  },
  {
    title: 'Circle Theorems Worksheet',
    desc: 'Practice questions with detailed solutions.',
    type: 'WORKSHEET',
    typeColor: 'bg-blue-500',
    meta: 'PDF • 3 pages',
    image: 'bg-gradient-to-br from-blue-900 to-slate-900',
    icon: '📝',
  },
  {
    title: 'DNA Structure Animation',
    desc: 'Interactive 3D animation to help you understand DNA.',
    type: 'ANIMATION',
    typeColor: 'bg-indigo-500',
    meta: 'Interactive',
    image: 'bg-gradient-to-br from-indigo-900 to-purple-900',
    icon: '🧬',
  },
];

const recommended = [
  { title: 'Chemistry Formulas Sheet', desc: 'Quick reference for important formulas.', type: 'PDF', grade: 'Grade 10', image: 'bg-blue-900' },
  { title: 'Trigonometry Basics', desc: 'Learn the fundamentals with easy examples.', type: 'VIDEO', grade: 'Grade 10', image: 'bg-indigo-900' },
  { title: 'History: Nationalism in Kenya', desc: 'Detailed notes with timelines and key events.', type: 'NOTES', grade: 'Grade 10', image: 'bg-green-900' },
];

const recentlyViewed = [
  { title: 'Biology: Human Digestive System Notes', time: 'Viewed 2 hours ago', type: 'NOTES', color: 'bg-green-500/10 text-green-400 border-green-500/20' },
  { title: 'Past Paper: Mathematics 2023', time: 'Viewed yesterday', type: 'PDF', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  { title: 'Chemical Bonding – Notes', time: 'Viewed 3 days ago', type: 'NOTES', color: 'bg-green-500/10 text-green-400 border-green-500/20' },
];

const popularSearches = ['Photosynthesis', 'Quadratic Equations', 'Nelson Mandela', 'Acids and Bases', 'Probability', 'Electricity'];

export default function ResourcesView() {
  const [activeTab, setActiveTab] = useState<typeof filterTabs[number]>('All');

  return (
    <div className="flex gap-6 mt-2 flex-1 min-h-0">
      {/* Main Content */}
      <div className="flex-1 min-w-0 space-y-4 overflow-y-auto pr-1">
        
        {/* Search Bar */}
        <div className="glass-card p-1 flex items-center">
          <input
            type="text"
            placeholder="Search for notes, videos, articles, eBooks and more..."
            className="flex-1 bg-transparent px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none"
          />
          <button className="p-3 rounded-lg bg-blue-600 text-white hover:bg-blue-500 transition-colors">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {filterTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
                activeTab === tab
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                  : 'bg-[rgba(17,24,50,0.6)] text-gray-400 hover:text-white hover:bg-[rgba(30,41,59,0.8)] border border-[rgba(56,78,135,0.2)]'
              }`}
            >
              {tab === 'All' && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>}
              {tab === 'Notes' && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14,2 14,8 20,8" /></svg>}
              {tab === 'Videos' && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" /><line x1="7" y1="2" x2="7" y2="22" /><line x1="17" y1="2" x2="17" y2="22" /><line x1="2" y1="12" x2="22" y2="12" /><line x1="2" y1="7" x2="7" y2="7" /><line x1="2" y1="17" x2="7" y2="17" /><line x1="17" y1="17" x2="22" y2="17" /><line x1="17" y1="7" x2="22" y2="7" /></svg>}
              {tab}
            </button>
          ))}
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <div key={i} className="glass-card p-4 flex items-center gap-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0 border ${stat.color}`}>
                {stat.icon}
              </div>
              <div>
                <p className="text-xl font-extrabold text-white leading-none">{stat.value}</p>
                <p className="text-gray-400 text-[10px] mt-1 font-medium">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Browse by Subject */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-bold text-base">Browse by Subject</h3>
            <button className="text-cyan-400 text-xs font-medium hover:text-cyan-300 flex items-center gap-1">
              View all subjects
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12,5 19,12 12,19" /></svg>
            </button>
          </div>
          <div className="grid grid-cols-6 gap-3">
            {subjects.map((sub, i) => (
              <div key={i} className="bg-[rgba(17,24,50,0.6)] border border-[rgba(56,78,135,0.2)] rounded-xl p-4 text-center flex flex-col items-center hover:border-cyan-500/30 transition-all cursor-pointer group">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl mb-2 ${sub.color} bg-opacity-20 border border-opacity-30 group-hover:scale-110 transition-transform`}>
                  {sub.icon}
                </div>
                <p className="text-white font-bold text-xs">{sub.name}</p>
                <p className="text-gray-500 text-[10px] mt-0.5">{sub.count} resources</p>
                <div className="w-full h-1 bg-[rgba(56,78,135,0.2)] rounded-full mt-3 overflow-hidden">
                  <div className={`h-full ${sub.color} rounded-full`} style={{ width: `${Math.min(100, (sub.count / 512) * 100)}%` }} />
                </div>
                <p className="text-[9px] text-gray-500 mt-1">Most popular</p>
              </div>
            ))}
            <div className="bg-[rgba(17,24,50,0.6)] border border-dashed border-[rgba(56,78,135,0.3)] rounded-xl p-4 text-center flex flex-col items-center justify-center hover:border-cyan-500/30 transition-all cursor-pointer group">
              <div className="w-10 h-10 rounded-full bg-[rgba(56,78,135,0.2)] flex items-center justify-center text-cyan-400 mb-2 group-hover:bg-cyan-500/10">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
              </div>
              <p className="text-cyan-400 font-bold text-xs">View all subjects</p>
            </div>
          </div>
        </div>

        {/* Featured Resources */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-white font-bold text-base">Featured Resources</h3>
              <p className="text-gray-500 text-xs">Hand-picked quality content for your learning journey.</p>
            </div>
            <button className="text-cyan-400 text-xs font-medium hover:text-cyan-300 flex items-center gap-1">
              View all
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12,5 19,12 12,19" /></svg>
            </button>
          </div>
          <div className="grid grid-cols-5 gap-4">
            {featuredResources.map((res, i) => (
              <div key={i} className="bg-[rgba(17,24,50,0.6)] border border-[rgba(56,78,135,0.2)] rounded-xl overflow-hidden hover:border-cyan-500/30 transition-all group cursor-pointer">
                <div className={`h-24 ${res.image} relative flex items-center justify-center`}>
                  <span className="absolute top-2 left-2 px-2 py-0.5 rounded text-[9px] font-bold text-white bg-black/40 backdrop-blur-sm border border-white/10">{res.type}</span>
                  <span className="text-4xl opacity-80 group-hover:scale-110 transition-transform">{res.icon}</span>
                  {res.type === 'VIDEO' || res.type === 'ANIMATION' ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/10 transition-colors">
                      <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="white"><polygon points="5,3 19,12 5,21" /></svg>
                      </div>
                    </div>
                  ) : null}
                </div>
                <div className="p-3">
                  <h4 className="text-white font-bold text-xs leading-tight mb-1 line-clamp-1">{res.title}</h4>
                  <p className="text-gray-500 text-[10px] leading-tight line-clamp-2 mb-3">{res.desc}</p>
                  <div className="flex items-center justify-between text-[10px] text-gray-400">
                    <span>{res.meta}</span>
                    <button className="text-gray-500 hover:text-cyan-400">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" /></svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {/* Carousel Dots */}
          <div className="flex items-center justify-center gap-2 mt-4">
            <button className="text-gray-500 hover:text-white"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15,18 9,12 15,6" /></svg></button>
            <div className="flex gap-1.5">
              <div className="w-6 h-1.5 rounded-full bg-blue-500" />
              <div className="w-1.5 h-1.5 rounded-full bg-[rgba(56,78,135,0.4)]" />
              <div className="w-1.5 h-1.5 rounded-full bg-[rgba(56,78,135,0.4)]" />
              <div className="w-1.5 h-1.5 rounded-full bg-[rgba(56,78,135,0.4)]" />
            </div>
            <button className="text-gray-500 hover:text-white"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9,18 15,12 9,6" /></svg></button>
          </div>
        </div>

      </div>

      {/* Right Sidebar */}
      <div className="w-[300px] flex-shrink-0 space-y-4 overflow-y-auto pb-6">
        
        {/* Find Resources Quickly */}
        <div className="glass-card p-5">
          <h3 className="text-white font-bold text-base mb-1">Find Resources Quickly</h3>
          <p className="text-gray-500 text-xs mb-3">Search by topic, keyword or resource type.</p>
          <div className="flex items-center gap-2 mb-4">
            <input type="text" placeholder="e.g. Photosynthesis, Algebra, etc." className="flex-1 px-3 py-2 rounded-lg bg-[rgba(17,24,50,0.8)] border border-[rgba(56,78,135,0.3)] text-gray-300 text-xs placeholder-gray-600 focus:outline-none focus:border-cyan-500/40" />
            <button className="p-2 rounded-lg bg-blue-600 text-white hover:bg-blue-500 transition-colors">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
            </button>
          </div>
          <p className="text-gray-500 text-[10px] font-bold mb-2">Popular searches</p>
          <div className="flex flex-wrap gap-2">
            {popularSearches.map((tag, i) => (
              <button key={i} className="px-2.5 py-1 rounded-full bg-[rgba(17,24,50,0.6)] border border-[rgba(56,78,135,0.2)] text-gray-400 text-[10px] hover:border-cyan-500/30 hover:text-cyan-400 transition-all">
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Recommended for You */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-white font-bold text-base">Recommended for You</h3>
            <button className="text-cyan-400 text-xs font-medium hover:text-cyan-300">View all</button>
          </div>
          <p className="text-gray-500 text-[10px] mb-3">Based on your subjects and progress</p>
          <div className="space-y-3">
            {recommended.map((rec, i) => (
              <div key={i} className="flex items-start gap-3 p-2 rounded-lg bg-[rgba(17,24,50,0.5)] border border-[rgba(56,78,135,0.1)] hover:border-[rgba(56,78,135,0.3)] transition-all cursor-pointer">
                <div className={`w-12 h-14 rounded ${rec.image} flex-shrink-0 flex items-center justify-center text-white border border-white/10`}>
                  {rec.type === 'PDF' && <span className="text-[10px] font-bold">PDF</span>}
                  {rec.type === 'VIDEO' && <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><polygon points="5,3 19,12 5,21" /></svg>}
                  {rec.type === 'NOTES' && <span className="text-lg">📝</span>}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold text-white ${rec.type === 'PDF' ? 'bg-red-500' : rec.type === 'VIDEO' ? 'bg-purple-500' : 'bg-green-500'}`}>{rec.type}</span>
                    <p className="text-white text-xs font-semibold leading-tight truncate">{rec.title}</p>
                  </div>
                  <p className="text-gray-500 text-[10px] leading-tight line-clamp-2">{rec.desc}</p>
                  <p className="text-gray-600 text-[9px] mt-1">{rec.grade}</p>
                </div>
                <button className="text-gray-500 hover:text-cyan-400 mt-1">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" /></svg>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Recently Viewed */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-white font-bold text-base">Recently Viewed</h3>
            <button className="text-cyan-400 text-xs font-medium hover:text-cyan-300">View all</button>
          </div>
          <div className="space-y-3">
            {recentlyViewed.map((item, i) => (
              <div key={i} className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded bg-[rgba(56,78,135,0.2)] flex items-center justify-center text-gray-400 flex-shrink-0">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14,2 14,8 20,8" /></svg>
                  </div>
                  <div className="min-w-0">
                    <p className="text-white text-xs font-semibold leading-tight truncate">{item.title}</p>
                    <p className="text-gray-500 text-[10px]">{item.time}</p>
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded text-[9px] font-bold border flex-shrink-0 ${item.color}`}>{item.type}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
