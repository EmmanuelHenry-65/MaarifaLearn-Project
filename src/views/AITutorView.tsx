import { useState } from 'react';

const tryAsking = [
  'Explain photosynthesis',
  'Solve this equation',
  'Summarize this topic',
  'Generate quiz',
  'Create flashcards',
];

const quickActions = [
  {
    title: 'Explain a Topic',
    desc: 'Get simple explanations on any topic',
    iconBg: 'bg-green-500/15 border-green-500/30 text-green-400',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        <line x1="9" y1="9" x2="15" y2="9" />
        <line x1="9" y1="13" x2="13" y2="13" />
      </svg>
    ),
  },
  {
    title: 'Generate Quiz',
    desc: 'Create practice quizzes instantly',
    iconBg: 'bg-purple-500/15 border-purple-500/30 text-purple-400',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="3" />
        <path d="M9 9a3 3 0 1 1 4.5 2.6c-.9.5-1.5 1-1.5 2.4" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
  },
  {
    title: 'Summarize Notes',
    desc: 'Get concise summaries of any content',
    iconBg: 'bg-orange-500/15 border-orange-500/30 text-orange-400',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14,2 14,8 20,8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    ),
  },
  {
    title: 'Create Flashcards',
    desc: 'Turn topics into smart flashcards',
    iconBg: 'bg-teal-500/15 border-teal-500/30 text-teal-400',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="6" width="16" height="12" rx="2" />
        <path d="M22 6v12" />
        <line x1="6" y1="10" x2="14" y2="10" />
        <line x1="6" y1="14" x2="11" y2="14" />
      </svg>
    ),
  },
  {
    title: 'Solve Problems',
    desc: 'Get step-by-step solutions',
    iconBg: 'bg-pink-500/15 border-pink-500/30 text-pink-400',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M8 12h8M12 8v8" />
      </svg>
    ),
  },
];

const recentConversations = [
  {
    question: 'Explain the process of photosyntisis in plants.',
    answer: 'Photosynthesis is the process used by green plants to make their own food...',
    time: 'Today, 10:24 AM',
    tag: 'Biology',
    tagColor: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25',
    iconColor: 'bg-cyan-500/15 border-cyan-500/25 text-cyan-400',
  },
  {
    question: 'Solve: 2x² + 5x − 3 = 0 using factorization method.',
    answer: 'To solve 2x² + 5x − 3 = 0, we factorize the quadratic equation...',
    time: 'Yesterday, 4:15 PM',
    tag: 'Mathematics',
    tagColor: 'bg-blue-500/15 text-blue-400 border-blue-500/25',
    iconColor: 'bg-purple-500/15 border-purple-500/25 text-purple-400',
  },
  {
    question: 'Give me a summary of the Kenyan independence.',
    answer: 'Kenya gained independence on December 12, 1963 after years of struggle...',
    time: 'Yesterday, 1:02 PM',
    tag: 'History',
    tagColor: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/25',
    iconColor: 'bg-cyan-500/15 border-cyan-500/25 text-cyan-400',
  },
  {
    question: 'What are the main types of chemical bonds?',
    answer: 'The main types of chemical bonds are ionic, covalent and metallic bonds...',
    time: 'May 30, 2026',
    tag: 'Chemistry',
    tagColor: 'bg-orange-500/15 text-orange-400 border-orange-500/25',
    iconColor: 'bg-orange-500/15 border-orange-500/25 text-orange-400',
  },
];

const insights = [
  {
    icon: '📈',
    iconBg: 'bg-green-500/15 border-green-500/25',
    bold: 'You asked 8 questions today.',
    rest: 'Keep it up! Curiosity leads to mastery.',
  },
  {
    icon: '🎯',
    iconBg: 'bg-purple-500/15 border-purple-500/25',
    bold: 'Your top subject today is Biology.',
    rest: 'You spent 42% of your study time here.',
  },
  {
    icon: '💡',
    iconBg: 'bg-orange-500/15 border-orange-500/25',
    bold: 'Try practicing more past papers',
    rest: 'to improve your exam readiness.',
  },
];

const popularQuestions = [
  'Explain mitosis in simple terms',
  'What is the difference between plant and animal cells?',
  'How do I solve simultaneous equations?',
  'Write a short essay about climate change',
];

export default function AITutorView() {
  const [question, setQuestion] = useState('');

  return (
    <div className="flex gap-6 mt-2 flex-1 min-h-0">
      {/* Left/Center Column */}
      <div className="flex-1 min-w-0 space-y-4 overflow-y-auto pr-1">

        {/* Ask the AI Tutor anything */}
        <div className="glass-card p-5">
          <h3 className="text-white font-bold text-lg mb-4">Ask the AI Tutor anything</h3>
          <div className="rounded-xl bg-[rgba(17,24,50,0.8)] border border-[rgba(56,78,135,0.3)] focus-within:border-cyan-500/40 transition-colors p-4">
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value.slice(0, 1000))}
              placeholder="Type your question here..."
              rows={2}
              className="w-full bg-transparent text-gray-300 text-sm placeholder-gray-600 focus:outline-none resize-none"
            />
            <div className="flex items-center justify-between mt-2">
              <span className="text-gray-600 text-[11px]">{question.length}/1000</span>
              <div className="flex items-center gap-2">
                <button className="text-gray-500 hover:text-gray-300 transition-colors p-1.5">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                  </svg>
                </button>
                <button className="w-10 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white hover:shadow-lg hover:shadow-cyan-500/25 transition-all">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <p className="text-gray-500 text-xs font-medium mt-4 mb-2">Try asking about:</p>
          <div className="flex flex-wrap gap-2">
            {tryAsking.map((chip, i) => (
              <button
                key={i}
                onClick={() => setQuestion(chip)}
                className="px-3.5 py-1.5 rounded-lg bg-[rgba(17,24,50,0.6)] border border-[rgba(56,78,135,0.25)] text-gray-400 text-xs hover:border-cyan-500/30 hover:text-cyan-400 transition-all"
              >
                {chip}
              </button>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="glass-card p-5">
          <h3 className="text-white font-bold text-lg mb-4">Quick Actions</h3>
          <div className="grid grid-cols-5 gap-3">
            {quickActions.map((action, i) => (
              <div key={i} className="bg-[rgba(17,24,50,0.6)] border border-[rgba(56,78,135,0.2)] hover:border-cyan-500/30 rounded-xl p-3.5 transition-all flex flex-col cursor-pointer group">
                <div className={`w-11 h-11 rounded-xl border flex items-center justify-center mb-3 ${action.iconBg}`}>
                  {action.icon}
                </div>
                <p className="text-white text-xs font-bold leading-tight">{action.title}</p>
                <p className="text-gray-500 text-[10px] mt-1.5 leading-relaxed flex-1">{action.desc}</p>
                <div className="flex justify-end mt-2">
                  <span className="w-5 h-5 rounded-full bg-cyan-500/10 border border-cyan-500/25 flex items-center justify-center text-cyan-400 group-hover:bg-cyan-500 group-hover:text-white transition-colors">
                    <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <line x1="5" y1="12" x2="19" y2="12" />
                      <polyline points="12,5 19,12 12,19" />
                    </svg>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Conversations */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-bold text-lg">Recent Conversations</h3>
            <button className="text-cyan-400 text-xs font-medium hover:text-cyan-300 transition-colors">View all</button>
          </div>
          <div className="space-y-2.5">
            {recentConversations.map((conv, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-[rgba(17,24,50,0.5)] border border-[rgba(56,78,135,0.15)] hover:border-[rgba(56,78,135,0.3)] transition-all cursor-pointer">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className={`w-8 h-8 rounded-lg border flex items-center justify-center flex-shrink-0 ${conv.iconColor}`}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-white text-sm font-semibold leading-tight truncate">{conv.question}</p>
                    <p className="text-gray-500 text-[11px] leading-tight mt-0.5 truncate">{conv.answer}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 flex-shrink-0 ml-4">
                  <span className="text-gray-500 text-[11px] whitespace-nowrap">{conv.time}</span>
                  <span className={`px-2 py-0.5 rounded-full border text-[10px] font-semibold whitespace-nowrap ${conv.tagColor}`}>
                    {conv.tag}
                  </span>
                  <button className="text-gray-500 hover:text-gray-300 transition-colors">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                      <circle cx="12" cy="5" r="1.6" />
                      <circle cx="12" cy="12" r="1.6" />
                      <circle cx="12" cy="19" r="1.6" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-center mt-4 pt-3 border-t border-[rgba(56,78,135,0.15)]">
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[rgba(17,24,50,0.6)] border border-[rgba(56,78,135,0.25)] text-gray-300 text-xs font-semibold hover:border-cyan-500/30 hover:text-cyan-400 transition-all">
              New Conversation
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </button>
          </div>
        </div>

      </div>

      {/* Right Column */}
      <div className="w-[300px] flex-shrink-0 space-y-4 overflow-y-auto pb-6">

        {/* Today's AI Insights */}
        <div className="glass-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-cyan-400">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2l1.8 5.6L19 9l-5.2 1.4L12 16l-1.8-5.6L5 9l5.2-1.4z" />
                <path d="M19 15l.9 2.6L22 18l-2.1.7L19 21l-.9-2.3L16 18l2.1-.4z" />
              </svg>
            </span>
            <h3 className="text-white font-bold text-base">Today's AI Insights</h3>
          </div>
          <div className="space-y-2.5">
            {insights.map((ins, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-[rgba(17,24,50,0.5)] border border-[rgba(56,78,135,0.15)]">
                <div className={`w-8 h-8 rounded-lg border flex items-center justify-center text-sm flex-shrink-0 ${ins.iconBg}`}>
                  {ins.icon}
                </div>
                <p className="text-gray-400 text-[11px] leading-relaxed">
                  <span className="text-white font-semibold">{ins.bold}</span>{' '}
                  {ins.rest}
                </p>
              </div>
            ))}
          </div>
          <button className="w-full text-center text-cyan-400 hover:text-cyan-300 text-xs font-bold mt-4 py-2 rounded-lg bg-[rgba(17,24,50,0.5)] border border-[rgba(56,78,135,0.2)] hover:border-cyan-500/30 transition-all">
            View All Insights
          </button>
        </div>

        {/* Upload & Ask */}
        <div className="glass-card p-5">
          <h3 className="text-white font-bold text-base mb-4">Upload & Ask</h3>
          <div className="rounded-xl border border-dashed border-[rgba(56,78,135,0.4)] p-6 flex flex-col items-center text-center hover:border-cyan-500/40 transition-colors cursor-pointer">
            <span className="text-cyan-400 mb-3">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 14.9A7 7 0 1 1 15.7 8h1.8a4.5 4.5 0 0 1 2.5 8.2" />
                <polyline points="12,12 12,21" />
                <polyline points="8,16 12,12 16,16" />
              </svg>
            </span>
            <p className="text-gray-300 text-xs font-semibold">Upload notes, images or PDFs</p>
            <p className="text-gray-500 text-[11px] mt-1">and ask any question about them.</p>
            <button className="mt-4 px-4 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold hover:bg-cyan-500/20 transition-colors">
              Choose File
            </button>
          </div>
        </div>

        {/* Popular Questions */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-bold text-base">Popular Questions</h3>
            <button className="text-cyan-400 text-xs font-medium hover:text-cyan-300 transition-colors">View all</button>
          </div>
          <div className="space-y-2">
            {popularQuestions.map((q, i) => (
              <button
                key={i}
                onClick={() => setQuestion(q)}
                className="w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl bg-[rgba(17,24,50,0.5)] border border-[rgba(56,78,135,0.15)] text-left hover:border-cyan-500/30 transition-all group"
              >
                <span className="flex items-center gap-2.5 min-w-0">
                  <span className="w-5 h-5 rounded-full bg-[rgba(56,78,135,0.25)] flex items-center justify-center text-gray-400 text-[10px] font-bold shrink-0">?</span>
                  <span className="text-gray-400 text-[11px] leading-relaxed group-hover:text-gray-300">{q}</span>
                </span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-cyan-500 shrink-0">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12,5 19,12 12,19" />
                </svg>
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
