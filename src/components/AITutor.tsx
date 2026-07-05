import { useTheme } from '../context/ThemeContext';

const suggestions = [
  'Explain mitosis like I\'m 14',
  'Compare mitosis in Kenya and South Africa',
  'Generate 5 quiz questions on Cell Division',
];

export default function AITutor() {
  const { theme } = useTheme();
  const titleColor = theme === 'light' ? 'text-slate-900' : 'text-white';
  const textColor = theme === 'light' ? 'text-slate-600' : 'text-gray-400';
  const mutedColor = theme === 'light' ? 'text-slate-500' : 'text-gray-500';
  const inputBg = theme === 'light' ? 'bg-slate-100 border-slate-300 text-slate-900 placeholder-slate-400' : 'bg-[rgba(17,24,50,0.8)] border-[rgba(56,78,135,0.3)] text-gray-300 placeholder-gray-600';
  const suggestionBg = theme === 'light' ? 'bg-slate-50 border-slate-200 text-slate-700 hover:border-cyan-400 hover:text-slate-900' : 'bg-[rgba(17,24,50,0.5)] border-[rgba(56,78,135,0.2)] text-gray-400 hover:border-cyan-500/30 hover:text-gray-300';

  return (
    <div className="glass-card p-5 relative overflow-hidden">
      {/* Sparkles */}
      <div className="absolute top-3 right-3 text-cyan-400 text-[10px] animate-pulse">✦</div>
      <div className="absolute top-8 right-8 text-cyan-300 text-[6px] animate-pulse" style={{ animationDelay: '0.5s' }}>✦</div>
      
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className={`font-bold text-base ${titleColor}`}>Ask your AI Tutor</h3>
          <p className={`text-xs mt-1 leading-relaxed ${textColor}`}>
            I'm here to help you understand any topic!
          </p>
        </div>
        <div className="w-16 h-16 rounded-full overflow-hidden flex-shrink-0 animate-float">
          <img
            src="/images/ai-robot.png"
            alt="AI Tutor"
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Chat Input */}
      <div className="flex items-center gap-2 mb-4 mt-2">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Ask anything about your curriculum..."
            className={`w-full px-3 py-2.5 rounded-xl border text-xs focus:outline-none focus:border-cyan-500/40 ${inputBg}`}
          />
        </div>
        <button className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center flex-shrink-0 hover:shadow-lg hover:shadow-cyan-500/20 transition-all">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
          </svg>
        </button>
      </div>

      {/* Suggestions */}
      <div>
        <p className={`text-xs font-medium mb-2 ${mutedColor}`}>Try these</p>
        <div className="space-y-2">
          {suggestions.map((s, i) => (
            <button
              key={i}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl border text-xs transition-all text-left ${suggestionBg}`}
            >
              <span className="leading-relaxed">{s}</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-cyan-500 flex-shrink-0 ml-2">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12,5 19,12 12,19" />
              </svg>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
