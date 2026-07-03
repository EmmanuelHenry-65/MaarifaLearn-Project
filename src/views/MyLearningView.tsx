import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  allSubjects,
  mandatorySubjects,
  electiveSubjects,
  continueLearning,
  recentLessons,
  todayMissions,
  upcomingQuizzes,
  learningJourney,
  aiPromptsBySubject,
  getSubject,
  type SubjectId,
} from '../data/subjects';

function SubjectCard({ subjectId }: { subjectId: SubjectId }) {
  const sub = getSubject(subjectId);
  return (
    <div className="bg-[rgba(17,24,50,0.6)] border border-[rgba(56,78,135,0.2)] hover:border-cyan-500/30 rounded-xl p-4 transition-all flex flex-col justify-between">
      <div>
        <div className="flex items-center gap-2.5 mb-3">
          <div className={`w-10 h-10 rounded-xl border flex items-center justify-center text-lg ${sub.iconBg}`}>
            {sub.icon}
          </div>
          <div>
            <p className="text-gray-400 text-[10px] uppercase font-bold tracking-wider leading-tight">
              {sub.group === 'mandatory' ? 'Mandatory' : 'Elective'}
            </p>
            <p className="text-white text-sm font-bold leading-tight">{sub.shortName}</p>
          </div>
        </div>
        <div className="flex items-center justify-between mt-3">
          <div className="flex-1 h-1.5 rounded-full bg-[rgba(56,78,135,0.2)] overflow-hidden mr-2">
            <div className={`h-full rounded-full ${sub.iconBg.split(' ')[0].replace('/10', '/60')}`} style={{ width: `${sub.progress}%` }} />
          </div>
          <span className="text-gray-300 text-[10px] font-bold whitespace-nowrap">{sub.progress}%</span>
        </div>
        <p className="text-gray-500 text-[10px] mt-1.5">
          {sub.lessonsCompleted} / {sub.totalLessons} lessons
        </p>
      </div>
      <div className="flex items-center gap-1.5 mt-3">
        <Link
          to={`/subjects/${sub.id}`}
          className="flex-1 px-2 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/25 text-cyan-400 text-[10px] font-bold text-center hover:bg-cyan-500/20 transition-colors"
        >
          Continue
        </Link>
        <Link
          to="/ai-tutor"
          className="flex-1 px-2 py-1.5 rounded-lg bg-purple-500/10 border border-purple-500/25 text-purple-400 text-[10px] font-bold text-center hover:bg-purple-500/20 transition-colors"
        >
          Ask AI
        </Link>
      </div>
    </div>
  );
}

function SectionHeader({ title, subtitle, right }: { title: string; subtitle?: string; right?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <div>
        <h3 className="text-white font-bold text-lg leading-tight">{title}</h3>
        {subtitle && <p className="text-gray-500 text-xs mt-0.5">{subtitle}</p>}
      </div>
      {right}
    </div>
  );
}

function MandatoryElectiveGrid({ ids }: { ids: SubjectId[] }) {
  return (
    <div className="grid grid-cols-3 lg:grid-cols-3 md:grid-cols-2 sm:grid-cols-1 gap-3">
      {ids.map((id) => (
        <SubjectCard key={id} subjectId={id} />
      ))}
    </div>
  );
}

function LessonRow({
  subjectId,
  topic,
  progress,
  barColor,
  form = 'Form 4',
}: {
  subjectId: SubjectId;
  topic: string;
  progress: number;
  barColor?: string;
  form?: string;
}) {
  const sub = getSubject(subjectId);
  return (
    <div className="flex items-center justify-between p-3 rounded-xl bg-[rgba(17,24,50,0.5)] border border-[rgba(56,78,135,0.15)] hover:border-[rgba(56,78,135,0.3)] transition-all">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className={`w-9 h-9 rounded-lg border flex items-center justify-center text-base flex-shrink-0 ${sub.iconBg}`}>
          {sub.icon}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-white text-sm font-semibold leading-tight truncate">{topic}</p>
          <p className="text-gray-500 text-[11px] leading-tight mt-0.5">
            {sub.shortName} • {form}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-6 flex-shrink-0 ml-4">
        <div className="flex items-center gap-2 w-44">
          <div className="flex-1 h-1.5 rounded-full bg-[rgba(56,78,135,0.2)] overflow-hidden">
            <div className={`h-full rounded-full ${barColor || sub.iconBg.split(' ')[0].replace('/10', '/80')}`} style={{ width: `${progress}%` }} />
          </div>
          <span className="text-gray-300 text-xs font-semibold w-8 text-right">{progress}%</span>
        </div>
        <Link
          to={`/subjects/${sub.id}`}
          className="px-4 py-1.5 rounded-lg bg-[rgba(34,211,238,0.06)] border border-cyan-500/20 text-cyan-400 text-xs font-bold hover:bg-cyan-500/10 transition-colors"
        >
          Continue
        </Link>
        <button className="text-gray-500 hover:text-cyan-400 transition-colors">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
          </svg>
        </button>
      </div>
    </div>
  );
}

const streakDays = [
  { day: 'M', done: true },
  { day: 'T', done: true },
  { day: 'W', done: true },
  { day: 'T', done: true },
  { day: 'F', done: true },
  { day: 'S', done: false },
  { day: 'S', done: false },
];

export default function MyLearningView() {
  const [activeTab, setActiveTab] = useState<'In Progress' | 'Completed' | 'Bookmarked'>('In Progress');

  // AI Tutor prompt suggestions (one per subject, deterministic)
  const aiSuggestions = allSubjects.map((s) => aiPromptsBySubject[s.id][0]);

  return (
    <div className="flex gap-6 mt-2 flex-1 min-h-0">
      {/* Left/Center Column */}
      <div className="flex-1 min-w-0 space-y-4 overflow-y-auto pr-1">

        {/* Mandatory Subjects */}
        <div className="glass-card p-5">
          <SectionHeader
            title="Mandatory Subjects"
            subtitle="Core subjects required by the CBC curriculum"
            right={
              <Link to="/subjects" className="text-cyan-400 text-xs font-medium hover:text-cyan-300">
                View all
              </Link>
            }
          />
          <MandatoryElectiveGrid ids={mandatorySubjects.map((s) => s.id)} />
        </div>

        {/* Elective Subjects */}
        <div className="glass-card p-5">
          <SectionHeader
            title="Elective Subjects"
            subtitle="Subjects chosen by the learner"
            right={
              <Link to="/subjects" className="text-cyan-400 text-xs font-medium hover:text-cyan-300">
                View all
              </Link>
            }
          />
          <MandatoryElectiveGrid ids={electiveSubjects.map((s) => s.id)} />
        </div>

        {/* Continue Learning Row */}
        <div className="glass-card p-5">
          <SectionHeader
            title="Continue Learning"
            subtitle="Pick up where you left off"
            right={
              <button className="text-cyan-400 text-xs font-medium hover:text-cyan-300">View all</button>
            }
          />
          <div className="grid grid-cols-4 gap-3">
            {continueLearning.map((cl, i) => {
              const sub = getSubject(cl.subjectId);
              return (
                <div
                  key={i}
                  className="bg-[rgba(17,24,50,0.6)] border border-[rgba(56,78,135,0.2)] hover:border-cyan-500/30 rounded-xl p-3.5 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`w-7 h-7 rounded-lg border flex items-center justify-center text-sm font-semibold ${sub.iconBg}`}>
                        {sub.icon}
                      </span>
                      <div>
                        <p className="text-gray-400 text-[10px] uppercase font-bold tracking-wider leading-tight">{sub.shortName}</p>
                        <p className="text-white text-xs font-bold leading-tight line-clamp-1">{cl.topic}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-3.5">
                      <div className="flex-1 h-1.5 rounded-full bg-[rgba(56,78,135,0.2)] overflow-hidden mr-2">
                        <div className={`h-full rounded-full ${sub.iconBg.split(' ')[0].replace('/10', '/80')}`} style={{ width: `${cl.progress}%` }} />
                      </div>
                      <span className="text-gray-300 text-[10px] font-bold whitespace-nowrap">{cl.progress}%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-1 text-gray-500 text-[10px]">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12,6 12,12 16,14" />
                      </svg>
                      {cl.timeLeft}
                    </div>
                    <Link
                      to={`/subjects/${sub.id}`}
                      className="w-6 h-6 rounded-full bg-cyan-500 flex items-center justify-center text-white shadow-md shadow-cyan-500/20 hover:scale-105 transition-transform"
                    >
                      <svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor">
                        <polygon points="5,3 19,12 5,21" />
                      </svg>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tabs: In Progress / Completed / Bookmarked */}
        <div className="glass-card p-5">
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

          <div className="space-y-2.5">
            {recentLessons.map((l, i) => (
              <LessonRow
                key={i}
                subjectId={l.subjectId}
                topic={l.topic}
                progress={l.progress}
              />
            ))}
          </div>
        </div>

        {/* Today's Mission */}
        <div className="glass-card p-5">
          <SectionHeader title="Today's Mission" subtitle="Subject-specific tasks to keep you on track" />
          <div className="space-y-2.5">
            {todayMissions.map((m, i) => {
              const sub = getSubject(m.subjectId);
              return (
                <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg bg-[rgba(17,24,50,0.5)] border border-[rgba(56,78,135,0.15)]">
                  <span className="text-base">{sub.icon}</span>
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
              );
            })}
          </div>
        </div>

        {/* AI Tutor Suggested Prompts */}
        <div className="glass-card p-5">
          <SectionHeader
            title="AI Tutor — Subject Prompts"
            subtitle="Quick prompts tailored to your subjects"
            right={
              <Link to="/ai-tutor" className="text-cyan-400 text-xs font-medium hover:text-cyan-300">
                Open AI Tutor
              </Link>
            }
          />
          <div className="grid grid-cols-3 gap-2.5">
            {aiSuggestions.slice(0, 6).map((p, i) => (
              <Link
                key={i}
                to="/ai-tutor"
                className="px-3 py-2.5 rounded-lg bg-[rgba(17,24,50,0.6)] border border-[rgba(56,78,135,0.25)] text-gray-300 text-xs hover:border-cyan-500/30 hover:text-cyan-400 transition-all"
              >
                {p}
              </Link>
            ))}
          </div>
        </div>

        {/* Learning Journey */}
        <div className="glass-card p-5">
          <SectionHeader
            title="Learning Journey"
            subtitle="Your progress across subjects"
          />
          <div className="flex items-center justify-between px-2">
            {learningJourney.map((node, i) => {
              const sub = getSubject(node.subjectId);
              const isLast = i === learningJourney.length - 1;
              return (
                <div key={i} className="flex flex-col items-center relative" style={{ width: '20%' }}>
                  {!isLast && (
                    <div
                      className={`absolute top-4 left-1/2 h-[2px] ${
                        node.completed ? 'bg-gradient-to-r from-green-500 to-cyan-500' : 'bg-[rgba(56,78,135,0.3)]'
                      }`}
                      style={{ width: '100%' }}
                    />
                  )}
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center relative z-10 ${
                      node.current
                        ? 'bg-gradient-to-br from-cyan-400 to-cyan-600 shadow-lg shadow-cyan-500/30'
                        : node.completed
                        ? 'bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg shadow-green-500/20'
                        : 'bg-[#111832] border-2 border-[rgba(56,78,135,0.35)]'
                    }`}
                  >
                    {node.locked ? (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-600">
                        <rect x="3" y="11" width="18" height="11" rx="2" />
                        <path d="M7 11V7a5 5 0 0110 0v4" />
                      </svg>
                    ) : (
                      <span className="text-sm">{sub.icon}</span>
                    )}
                  </div>
                  <span className={`text-[10px] mt-2 text-center leading-tight font-medium ${
                    node.current ? 'text-cyan-400 font-semibold' : node.completed ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    {node.topic}
                  </span>
                </div>
              );
            })}
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
            <div className="relative w-24 h-24 flex-shrink-0">
              <svg width="96" height="94" className="progress-ring">
                <circle cx="48" cy="47" r="38" stroke="rgba(56, 78, 135, 0.2)" strokeWidth="6" fill="none" />
                <circle cx="48" cy="47" r="38" stroke="url(#my-perf-gradient)" strokeWidth="6" fill="none" strokeLinecap="round" strokeDasharray={2 * Math.PI * 38} strokeDashoffset={2 * Math.PI * 38 * (1 - 0.78)} />
                <defs>
                  <linearGradient id="my-perf-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
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
                  <p className="text-white text-xs font-bold leading-tight">128</p>
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
                  <p className="text-white text-xs font-bold leading-tight">42</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                  <span className="text-[10px] font-black leading-none">XP</span>
                </div>
                <div>
                  <p className="text-gray-500 text-[10px]">XP Earned</p>
                  <p className="text-white text-xs font-bold leading-tight">12,800</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Study Streak */}
        <div className="glass-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-base">🔥</span>
            <h3 className="text-white font-bold text-base">Study Streak</h3>
          </div>
          <div className="flex items-center gap-4 mb-4">
            <div className="text-center">
              <p className="text-white font-extrabold text-3xl leading-none">7</p>
              <p className="text-gray-500 text-xs mt-1">Days</p>
            </div>
            <div className="flex-1">
              <p className="text-white text-xs font-bold">Keep it up! 🔥</p>
              <p className="text-gray-500 text-[11px] mt-0.5 leading-relaxed">You're building a great habit.</p>
            </div>
          </div>
          <div className="flex items-center justify-between px-1">
            {streakDays.map((sd, i) => (
              <div
                key={i}
                className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold border-2 ${
                  sd.done ? 'border-green-500 text-green-400' : 'border-[rgba(56,78,135,0.35)] text-gray-600'
                }`}
              >
                {sd.day}
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Lessons */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-bold text-base">Upcoming Quizzes</h3>
            <Link to="/study-planner" className="text-cyan-400 text-xs font-medium hover:text-cyan-300">View Calendar</Link>
          </div>

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
            {upcomingQuizzes.map((q, i) => {
              const sub = getSubject(q.subjectId);
              return (
                <div key={i} className="flex items-center justify-between p-2.5 rounded-xl bg-[rgba(17,24,50,0.5)] border border-[rgba(56,78,135,0.15)]">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-8 h-8 rounded-lg border flex items-center justify-center text-sm ${sub.iconBg}`}>
                      {sub.icon}
                    </div>
                    <div>
                      <p className="text-white text-xs font-bold leading-tight">{q.title}</p>
                      <p className="text-gray-500 text-[10px] mt-0.5">{sub.shortName}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-cyan-400 text-[10px] font-bold leading-tight">{q.date}</p>
                    <p className="text-gray-500 text-[10px] leading-tight mt-0.5">{q.questions} Q</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
