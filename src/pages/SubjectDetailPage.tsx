import { useParams, Link } from 'react-router-dom';

const subjectData: Record<string, { name: string; icon: string; progress: number; color: string; description: string }> = {
  mathematics: { name: 'Mathematics', icon: '⨍', progress: 82, color: 'text-blue-400 bg-blue-500/10 border-blue-500/30', description: 'Master algebra, geometry, calculus and more.' },
  english: { name: 'English', icon: '📖', progress: 75, color: 'text-purple-400 bg-purple-500/10 border-purple-500/30', description: 'Build strong communication and literary skills.' },
  kiswahili: { name: 'Kiswahili', icon: '🗣️', progress: 71, color: 'text-teal-400 bg-teal-500/10 border-teal-500/30', description: 'Kusoma, kuandika na kuzungumza Kiswahili.' },
  cre: { name: 'Christian Religious Education', icon: '⛪', progress: 70, color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30', description: 'Explore Christian beliefs, values and traditions.' },
  pe: { name: 'Physical Education', icon: '🏃', progress: 45, color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30', description: 'Build fitness, teamwork and sportsmanship.' },
  ict: { name: 'ICT', icon: '💻', progress: 88, color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30', description: 'Learn digital literacy, programming and more.' },
  chemistry: { name: 'Chemistry', icon: '🧪', progress: 56, color: 'text-orange-400 bg-orange-500/10 border-orange-500/30', description: 'Explore matter, reactions, and the elements.' },
  physics: { name: 'Physics', icon: '⚛️', progress: 39, color: 'text-amber-400 bg-amber-500/10 border-amber-500/30', description: 'Understand the laws of motion, energy and the universe.' },
  'computer-science': { name: 'Computer Science', icon: '🖥️', progress: 78, color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30', description: 'Learn algorithms, data structures and software engineering.' },
};

export default function SubjectDetailPage() {
  const { subjectId = '' } = useParams();
  const data = subjectData[subjectId] || {
    name: subjectId.replace(/-/g, ' '),
    icon: '📚',
    progress: 0,
    color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
    description: 'Explore lessons, resources and AI guidance for this subject.',
  };

  return (
    <div className="flex-1 min-w-0 space-y-4 overflow-y-auto pr-1">
      <Link to="/subjects" className="inline-flex items-center gap-1.5 text-cyan-400 text-sm font-semibold hover:text-cyan-300 transition-colors">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15,18 9,12 15,6" /></svg>
        Back to Subjects
      </Link>

      <div className="glass-card p-6">
        <div className="flex items-center gap-4">
          <div className={`w-16 h-16 rounded-2xl border flex items-center justify-center text-3xl ${data.color}`}>
            {data.icon}
          </div>
          <div className="flex-1">
            <h2 className="text-white font-extrabold text-2xl capitalize">{data.name}</h2>
            <p className="text-gray-400 text-sm mt-1">{data.description}</p>
          </div>
          <Link to="/workspace" className="px-4 py-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-sm font-bold hover:bg-cyan-500/20">
            Open Workspace
          </Link>
          <Link to="/ai-tutor" className="px-4 py-2 rounded-lg bg-purple-500/10 border border-purple-500/30 text-purple-400 text-sm font-bold hover:bg-purple-500/20">
            Ask AI Tutor
          </Link>
        </div>
        <div className="mt-5">
          <div className="flex justify-between text-sm mb-1.5">
            <span className="text-gray-300 font-semibold">Overall Progress</span>
            <span className="text-cyan-400 font-bold">{data.progress}%</span>
          </div>
          <div className="h-2 rounded-full bg-[rgba(56,78,135,0.25)] overflow-hidden">
            <div className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-cyan-400" style={{ width: `${data.progress}%` }} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="glass-card p-5">
          <h3 className="text-white font-bold text-base mb-3">Lessons Completed</h3>
          <p className="text-3xl font-extrabold text-cyan-400">{Math.round((data.progress / 100) * 30)}</p>
          <p className="text-gray-500 text-xs mt-1">out of 30 total lessons</p>
        </div>
        <div className="glass-card p-5">
          <h3 className="text-white font-bold text-base mb-3">Average Score</h3>
          <p className="text-3xl font-extrabold text-green-400">78%</p>
          <p className="text-gray-500 text-xs mt-1">across all quizzes</p>
        </div>
        <div className="glass-card p-5">
          <h3 className="text-white font-bold text-base mb-3">Study Time</h3>
          <p className="text-3xl font-extrabold text-purple-400">12h 30m</p>
          <p className="text-gray-500 text-xs mt-1">this month</p>
        </div>
      </div>

      <div className="glass-card p-5">
        <h3 className="text-white font-bold text-base mb-4">Continue Learning</h3>
        <div className="space-y-2.5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-[rgba(17,24,50,0.5)] border border-[rgba(56,78,135,0.15)]">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-lg border flex items-center justify-center ${data.color}`}>{data.icon}</div>
                <div>
                  <p className="text-white text-sm font-semibold leading-tight">Lesson {i}: Topic {i}</p>
                  <p className="text-gray-500 text-[11px] mt-0.5">Coming soon • placeholder content</p>
                </div>
              </div>
              <Link to="/ai-tutor" className="px-3 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold hover:bg-cyan-500/20">
                Continue
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
