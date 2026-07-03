import { useTheme } from '../context/ThemeContext';

const nodes = [
  { name: 'Cell Structure', completed: true },
  { name: 'Levels of\nOrganization', completed: true },
  { name: 'Photosynthesis', current: true, completed: true },
  { name: 'Respiration', locked: true },
  { name: 'Genetics', locked: true },
];

export default function LearningJourney() {
  const { theme } = useTheme();
  const primaryText = theme === 'light' ? 'text-slate-900' : 'text-white';
  const connectorBg = theme === 'light' ? 'bg-slate-300/80' : 'bg-[rgba(56,78,135,0.3)]';

  return (
    <div className="glass-card p-5 h-full flex flex-col">
      <div className="flex items-center justify-between mb-5">
        <h3 className={`font-bold text-base ${primaryText}`}>Learning Journey</h3>
        <button className="text-cyan-500 text-xs font-medium hover:text-cyan-400 transition-colors">View full map</button>
      </div>
      <div className="flex-1 flex items-center">
        <div className="flex items-start justify-between w-full relative">
          <div className={`absolute top-5 left-[10%] right-[10%] h-[2px] ${connectorBg}`} />
          <div className="absolute top-5 left-[10%] h-[2px] bg-gradient-to-r from-green-500 to-cyan-500" style={{ width: '50%' }} />
          
          {nodes.map((node, i) => (
            <div key={i} className="flex flex-col items-center relative z-10" style={{ width: '20%' }}>
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  node.current
                    ? 'bg-gradient-to-br from-cyan-400 to-cyan-600 shadow-lg shadow-cyan-500/40 ring-2 ring-cyan-400/30'
                    : node.completed
                    ? 'bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg shadow-green-500/20'
                    : theme === 'light'
                      ? 'bg-white border-2 border-slate-300'
                      : 'bg-[#111832] border-2 border-[rgba(56,78,135,0.35)]'
                }`}
              >
                {node.locked ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={theme === 'light' ? 'text-slate-400' : 'text-gray-600'}>
                    <rect x="3" y="11" width="18" height="11" rx="2" />
                    <path d="M7 11V7a5 5 0 0110 0v4" />
                  </svg>
                ) : (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20,6 9,17 4,12" />
                  </svg>
                )}
              </div>
              <span className={`text-[10px] mt-2.5 text-center leading-tight font-medium whitespace-pre-line ${
                node.current ? 'text-cyan-500 font-semibold' : node.completed ? (theme === 'light' ? 'text-slate-700' : 'text-gray-300') : (theme === 'light' ? 'text-slate-400' : 'text-gray-600')
              }`}>
                {node.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
