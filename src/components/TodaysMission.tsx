import { useTheme } from '../context/ThemeContext';

const missions = [
  { text: 'Complete 1 lesson', done: true, icon: '📗' },
  { text: 'Score 80%+ in a quiz', done: false, icon: '📊' },
  { text: 'Ask the AI tutor a question', done: false, icon: '🤖' },
];

export default function TodaysMission() {
  const { theme } = useTheme();
  const primaryText = theme === 'light' ? 'text-slate-900' : 'text-white';
  const itemBg = theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-[rgba(17,24,50,0.5)] border-[rgba(56,78,135,0.15)]';
  const itemText = theme === 'light' ? 'text-slate-700' : 'text-gray-300';
  const struckText = theme === 'light' ? 'text-slate-400' : 'text-gray-400';

  return (
    <div className="glass-card p-5 flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className={`font-bold text-lg ${primaryText}`}>Today's Mission</h3>
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500/20 to-indigo-500/20 border border-purple-500/30 flex items-center justify-center">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-purple-400">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 8v4l3 3" />
          </svg>
        </div>
      </div>
      <div className="space-y-3 flex-1">
        {missions.map((m, i) => (
          <div key={i} className={`flex items-center gap-3 p-2.5 rounded-lg border ${itemBg}`}>
            <span className="text-base">{m.icon}</span>
            <span className={`flex-1 text-sm ${m.done ? `line-through ${struckText}` : itemText}`}>
              {m.text}
            </span>
            {m.done ? (
              <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20,6 9,17 4,12" />
                </svg>
              </div>
            ) : (
              <div className={`w-6 h-6 rounded-full border-2 ${theme === 'light' ? 'border-slate-300' : 'border-[rgba(56,78,135,0.4)]'}`} />
            )}
          </div>
        ))}
      </div>
      <div className={`flex items-center justify-between mt-4 pt-3 border-t ${theme === 'light' ? 'border-slate-200' : 'border-[rgba(56,78,135,0.2)]'}`}>
        <div className="flex items-center gap-2">
          <span className="text-lg">🎁</span>
          <span className={`text-sm font-medium ${theme === 'light' ? 'text-slate-700' : 'text-gray-300'}`}>Reward</span>
        </div>
        <span className="text-green-500 font-bold text-sm">+50 XP</span>
      </div>
    </div>
  );
}
