const missions = [
  { text: 'Complete 1 lesson', done: true, icon: '📗' },
  { text: 'Score 80%+ in a quiz', done: false, icon: '📊' },
  { text: 'Ask the AI tutor a question', done: false, icon: '🤖' },
];

export default function TodaysMission() {
  return (
    <div className="glass-card p-5 flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-bold text-lg">Today's Mission</h3>
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500/20 to-indigo-500/20 border border-purple-500/30 flex items-center justify-center">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-purple-400">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 8v4l3 3" />
          </svg>
        </div>
      </div>
      <div className="space-y-3 flex-1">
        {missions.map((m, i) => (
          <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg bg-[rgba(17,24,50,0.5)] border border-[rgba(56,78,135,0.15)]">
            <span className="text-base">{m.icon}</span>
            <span className={`flex-1 text-sm ${m.done ? 'text-gray-400 line-through' : 'text-gray-300'}`}>
              {m.text}
            </span>
            {m.done ? (
              <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20,6 9,17 4,12" />
                </svg>
              </div>
            ) : (
              <div className="w-6 h-6 rounded-full border-2 border-[rgba(56,78,135,0.4)]" />
            )}
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-[rgba(56,78,135,0.2)]">
        <div className="flex items-center gap-2">
          <span className="text-lg">🎁</span>
          <span className="text-gray-300 text-sm font-medium">Reward</span>
        </div>
        <span className="text-green-400 font-bold text-sm">+50 XP</span>
      </div>
    </div>
  );
}
