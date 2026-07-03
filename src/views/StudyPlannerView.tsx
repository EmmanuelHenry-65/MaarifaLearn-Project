const weekDays = [
  { day: 'Mon', date: '26 May', tasks: '3/4 tasks', done: true, today: false },
  { day: 'Tue', date: '27 May', tasks: '4/5 tasks', done: true, today: false },
  { day: 'Wed', date: '28 May', tasks: '2/4 tasks', done: true, today: false },
  { day: 'Thu', date: '29 May', tasks: '3/6 tasks', done: false, today: true },
  { day: 'Fri', date: '30 May', tasks: '0/5 tasks', done: false, today: false },
  { day: 'Sat', date: '31 May', tasks: '0/3 tasks', done: false, today: false },
  { day: 'Sun', date: '01 June', tasks: '0/2 tasks', done: false, today: false },
];

const todaysPlan = [
  {
    subject: 'Biology',
    topic: 'Nutrition in Plants',
    type: 'Lesson',
    time: '9:00 AM - 10:00 AM',
    status: 'Completed',
    icon: '🌿',
    iconBg: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400',
  },
  {
    subject: 'Mathematics',
    topic: 'Quadratic Equations',
    type: 'Practice',
    time: '10:30 AM - 11:30 AM',
    status: 'Completed',
    icon: '⨍',
    iconBg: 'bg-blue-500/15 border-blue-500/30 text-blue-400',
  },
  {
    subject: 'Chemistry',
    topic: 'Chemical Bonding',
    type: 'Lesson',
    time: '12:00 PM - 1:00 PM',
    status: 'In Progress',
    icon: '🧪',
    iconBg: 'bg-orange-500/15 border-orange-500/30 text-orange-400',
  },
  {
    subject: 'English',
    topic: 'Narrative Writing',
    type: 'Task',
    time: '2:00 PM - 3:00 PM',
    status: 'Upcoming',
    icon: '📖',
    iconBg: 'bg-blue-500/15 border-blue-500/30 text-blue-400',
  },
  {
    subject: 'Past Papers',
    topic: 'Biology Paper 1 (2024)',
    type: 'Past Paper',
    time: '4:00 PM - 5:00 PM',
    status: 'Upcoming',
    icon: '🎯',
    iconBg: 'bg-pink-500/15 border-pink-500/30 text-pink-400',
  },
  {
    subject: 'Revision',
    topic: 'Review notes and key concepts',
    type: 'Revision',
    time: '7:00 PM - 8:00 PM',
    status: 'Upcoming',
    icon: '📋',
    iconBg: 'bg-teal-500/15 border-teal-500/30 text-teal-400',
  },
];

const studyGoals = [
  { goal: 'Complete 25 tasks', progress: 48, label: '12 / 25', icon: '✅', iconColor: 'text-green-400' },
  { goal: 'Study 15 hours', progress: 50, label: '7.5 / 15 hrs', icon: '⏱️', iconColor: 'text-purple-400' },
  { goal: 'Attempt 3 past papers', progress: 33, label: '1 / 3', icon: '📄', iconColor: 'text-blue-400' },
];

const deadlines = [
  { date: '02', month: 'JUN', title: 'Mathematics Assignment', due: 'Due in 4 days', bg: 'bg-gradient-to-br from-orange-500 to-amber-600' },
  { date: '05', month: 'JUN', title: 'Biology Practical Report', due: 'Due in 7 days', bg: 'bg-gradient-to-br from-amber-600 to-yellow-700' },
  { date: '07', month: 'JUN', title: 'English Essay', due: 'Due in 9 days', bg: 'bg-gradient-to-br from-blue-500 to-indigo-600' },
];

const streakDays = [
  { day: 'M', done: true },
  { day: 'T', done: true },
  { day: 'W', done: true },
  { day: 'T', done: true },
  { day: 'F', done: true },
  { day: 'S', done: false },
  { day: 'S', done: false },
];

function StatusBadge({ status }: { status: string }) {
  if (status === 'Completed') {
    return (
      <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-500/10 border border-green-500/25 text-green-400 text-xs font-bold whitespace-nowrap">
        Completed
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20,6 9,17 4,12" />
        </svg>
      </span>
    );
  }
  if (status === 'In Progress') {
    return (
      <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/25 text-cyan-400 text-xs font-bold whitespace-nowrap">
        In Progress
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <circle cx="12" cy="12" r="9" />
        </svg>
      </span>
    );
  }
  return (
    <span className="px-3 py-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/25 text-indigo-400 text-xs font-bold whitespace-nowrap">
      Upcoming
    </span>
  );
}

export default function StudyPlannerView() {
  return (
    <div className="flex gap-6 mt-2 flex-1 min-h-0">
      {/* Left/Center Column */}
      <div className="flex-1 min-w-0 space-y-4 overflow-y-auto pr-1">

        {/* Weekly Overview */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-white font-bold text-lg leading-tight">Weekly Overview</h3>
              <p className="text-gray-500 text-xs mt-1">26 May – 01 June 2025</p>
            </div>
            <button className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-cyan-500/10 border border-cyan-500/25 text-cyan-400 text-xs font-bold hover:bg-cyan-500/20 transition-colors">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              View Calendar
            </button>
          </div>

          {/* Week Days */}
          <div className="grid grid-cols-7 gap-2">
            {weekDays.map((wd, i) => (
              <div
                key={i}
                className={`flex flex-col items-center py-3.5 px-1 rounded-xl transition-all ${
                  wd.today
                    ? 'bg-[rgba(30,42,90,0.55)] border border-cyan-500/30 shadow-lg shadow-cyan-500/5'
                    : 'bg-transparent'
                }`}
              >
                <span className={`text-xs font-bold ${wd.today ? 'text-white' : 'text-gray-300'}`}>{wd.day}</span>
                <span className="text-gray-500 text-[10px] mt-0.5">{wd.date}</span>
                {wd.today && (
                  <>
                    <span className="text-cyan-400 text-[10px] font-bold mt-1.5">Today</span>
                    <span className="w-4 h-px bg-cyan-500/50 mt-1" />
                  </>
                )}
                <div className="mt-2.5 mb-1.5">
                  {wd.done ? (
                    <span className="w-7 h-7 rounded-full border-2 border-green-500 flex items-center justify-center text-green-400">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20,6 9,17 4,12" />
                      </svg>
                    </span>
                  ) : !wd.today ? (
                    <span className="w-7 h-7 rounded-full border-2 border-[rgba(56,78,135,0.4)] block" />
                  ) : (
                    <span className="h-7 block" />
                  )}
                </div>
                <span className={`text-[10px] font-semibold ${wd.today ? 'text-gray-200' : 'text-gray-500'}`}>{wd.tasks}</span>
              </div>
            ))}
          </div>

          {/* Weekly Progress */}
          <div className="mt-5 pt-4 border-t border-[rgba(56,78,135,0.15)]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-white text-sm font-bold">Weekly Progress</span>
              <span className="text-gray-400 text-xs">
                12 / 29 tasks completed <span className="text-cyan-400 font-bold ml-1">41%</span>
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-[rgba(56,78,135,0.25)] overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400" style={{ width: '41%' }} />
            </div>
          </div>
        </div>

        {/* Today's Plan */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-baseline gap-3">
              <h3 className="text-white font-bold text-lg">Today's Plan</h3>
              <span className="text-gray-500 text-xs">Thursday, 29 May 2025</span>
            </div>
            <button className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[rgba(37,99,235,0.15)] border border-blue-500/30 text-blue-400 text-xs font-bold hover:bg-blue-500/20 transition-colors">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Add Task
            </button>
          </div>

          <div className="space-y-2.5">
            {todaysPlan.map((task, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-[rgba(17,24,50,0.5)] border border-[rgba(56,78,135,0.15)] hover:border-[rgba(56,78,135,0.3)] transition-all">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className={`w-10 h-10 rounded-xl border flex items-center justify-center text-base flex-shrink-0 ${task.iconBg}`}>
                    {task.icon}
                  </div>
                  <div className="min-w-0">
                    <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wide leading-tight">{task.subject}</p>
                    <p className="text-white text-sm font-semibold leading-tight mt-0.5">{task.topic}</p>
                    <p className="text-gray-500 text-[10px] mt-0.5 flex items-center gap-1">
                      <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14,2 14,8 20,8" />
                      </svg>
                      {task.type}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4 flex-shrink-0 ml-4">
                  <span className="px-3 py-1.5 rounded-lg bg-[rgba(17,24,50,0.7)] border border-[rgba(56,78,135,0.25)] text-gray-300 text-xs font-semibold whitespace-nowrap">
                    {task.time}
                  </span>
                  <span className="w-px h-6 bg-[rgba(56,78,135,0.25)]" />
                  <StatusBadge status={task.status} />
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

          <button className="w-full flex items-center justify-center gap-1.5 text-cyan-400 hover:text-cyan-300 text-xs font-bold mt-4 py-1.5 transition-colors">
            View Full Schedule
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="6,9 12,15 18,9" />
            </svg>
          </button>
        </div>

      </div>

      {/* Right Column */}
      <div className="w-[300px] flex-shrink-0 space-y-4 overflow-y-auto pb-6">

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
              <span
                key={i}
                className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-[10px] font-bold ${
                  sd.done
                    ? 'border-green-500 text-green-400'
                    : 'border-[rgba(56,78,135,0.35)] text-gray-600'
                }`}
              >
                {sd.day}
              </span>
            ))}
          </div>
        </div>

        {/* Study Goals */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-bold text-base">Study Goals</h3>
            <button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[rgba(17,24,50,0.7)] border border-[rgba(56,78,135,0.25)] text-gray-300 text-[11px] font-semibold">
              This Week
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-gray-500">
                <polyline points="6,9 12,15 18,9" />
              </svg>
            </button>
          </div>
          <div className="space-y-4">
            {studyGoals.map((goal, i) => (
              <div key={i}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="flex items-center gap-2 text-white text-xs font-semibold">
                    <span className={`text-sm ${goal.iconColor}`}>{goal.icon}</span>
                    {goal.goal}
                  </span>
                  <span className="text-gray-400 text-[11px] font-semibold">{goal.label}</span>
                </div>
                <div className="h-1.5 rounded-full bg-[rgba(56,78,135,0.25)] overflow-hidden ml-6">
                  <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400" style={{ width: `${goal.progress}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Deadlines */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-bold text-base">Upcoming Deadlines</h3>
            <button className="text-cyan-400 text-xs font-medium hover:text-cyan-300 transition-colors">View all</button>
          </div>
          <div className="space-y-2.5">
            {deadlines.map((dl, i) => (
              <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl bg-[rgba(17,24,50,0.5)] border border-[rgba(56,78,135,0.15)] hover:border-[rgba(56,78,135,0.3)] transition-all">
                <div className={`w-11 h-11 rounded-xl ${dl.bg} flex flex-col items-center justify-center text-white flex-shrink-0 shadow-lg`}>
                  <span className="text-sm font-extrabold leading-none">{dl.date}</span>
                  <span className="text-[8px] font-bold mt-0.5">{dl.month}</span>
                </div>
                <div className="min-w-0">
                  <p className="text-white text-xs font-bold leading-tight">{dl.title}</p>
                  <p className="text-gray-500 text-[11px] mt-0.5">{dl.due}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Focus Tip */}
        <div className="glass-card p-5 relative overflow-hidden">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-yellow-400">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 18h6M10 22h4" />
                <path d="M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.4 1 2.3h6c0-.9.4-1.8 1-2.3A7 7 0 0 0 12 2z" />
              </svg>
            </span>
            <h3 className="text-white font-bold text-base">Focus Tip</h3>
          </div>
          <div className="flex items-start gap-3">
            <p className="text-gray-400 text-xs leading-relaxed flex-1">
              Break your study into small sessions. 25 minutes of focus can take you further than you think.
            </p>
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500/20 to-indigo-500/10 border border-purple-500/20 flex items-center justify-center flex-shrink-0 text-3xl">
              ⏳
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
