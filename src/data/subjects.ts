export type Subject = {
  id: SubjectId;
  name: string;
  shortName: string;
  icon: string;
  group: 'mandatory' | 'elective';
  color: string;
  iconBg: string;
  progress: number;
  lessonsCompleted: number;
  totalLessons: number;
  description: string;
};

export type SubjectId =
  | 'mathematics'
  | 'english'
  | 'kiswahili'
  | 'cre'
  | 'pe'
  | 'ict'
  | 'chemistry'
  | 'physics'
  | 'computer-science';

// Centralized subject registry. Every page imports from here.
export const subjects: Record<SubjectId, Subject> = {
  mathematics: {
    id: 'mathematics',
    name: 'Mathematics',
    shortName: 'Mathematics',
    icon: '⨍',
    group: 'mandatory',
    color: 'text-blue-400',
    iconBg: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
    progress: 82,
    lessonsCompleted: 24,
    totalLessons: 29,
    description: 'Master algebra, geometry, and problem solving.',
  },
  english: {
    id: 'english',
    name: 'English',
    shortName: 'English',
    icon: '📖',
    group: 'mandatory',
    color: 'text-purple-400',
    iconBg: 'bg-purple-500/10 border-purple-500/30 text-purple-400',
    progress: 75,
    lessonsCompleted: 20,
    totalLessons: 27,
    description: 'Build strong communication and literary skills.',
  },
  kiswahili: {
    id: 'kiswahili',
    name: 'Kiswahili',
    shortName: 'Kiswahili',
    icon: '🗣️',
    group: 'mandatory',
    color: 'text-teal-400',
    iconBg: 'bg-teal-500/10 border-teal-500/30 text-teal-400',
    progress: 71,
    lessonsCompleted: 17,
    totalLessons: 24,
    description: 'Kusoma, kuandika na kuzungumza Kiswahili.',
  },
  cre: {
    id: 'cre',
    name: 'Christian Religious Education',
    shortName: 'CRE',
    icon: '⛪',
    group: 'mandatory',
    color: 'text-yellow-400',
    iconBg: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400',
    progress: 70,
    lessonsCompleted: 14,
    totalLessons: 20,
    description: 'Explore Christian beliefs, values and traditions.',
  },
  pe: {
    id: 'pe',
    name: 'Physical Education',
    shortName: 'PE',
    icon: '🏃',
    group: 'mandatory',
    color: 'text-indigo-400',
    iconBg: 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400',
    progress: 45,
    lessonsCompleted: 9,
    totalLessons: 20,
    description: 'Build fitness, teamwork and sportsmanship.',
  },
  ict: {
    id: 'ict',
    name: 'ICT',
    shortName: 'ICT',
    icon: '💻',
    group: 'mandatory',
    color: 'text-cyan-400',
    iconBg: 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400',
    progress: 88,
    lessonsCompleted: 22,
    totalLessons: 25,
    description: 'Digital literacy, networking and productivity tools.',
  },
  chemistry: {
    id: 'chemistry',
    name: 'Chemistry',
    shortName: 'Chemistry',
    icon: '🧪',
    group: 'elective',
    color: 'text-orange-400',
    iconBg: 'bg-orange-500/10 border-orange-500/30 text-orange-400',
    progress: 56,
    lessonsCompleted: 14,
    totalLessons: 25,
    description: 'Explore matter, reactions, and the elements.',
  },
  physics: {
    id: 'physics',
    name: 'Physics',
    shortName: 'Physics',
    icon: '⚛️',
    group: 'elective',
    color: 'text-amber-400',
    iconBg: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
    progress: 39,
    lessonsCompleted: 9,
    totalLessons: 23,
    description: 'Understand the laws of motion, energy and the universe.',
  },
  'computer-science': {
    id: 'computer-science',
    name: 'Computer Science',
    shortName: 'Computer Science',
    icon: '🖥️',
    group: 'elective',
    color: 'text-cyan-400',
    iconBg: 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400',
    progress: 78,
    lessonsCompleted: 19,
    totalLessons: 24,
    description: 'Algorithms, programming and software engineering.',
  },
};

export const allSubjects: Subject[] = Object.values(subjects);
export const mandatorySubjects: Subject[] = allSubjects.filter((s) => s.group === 'mandatory');
export const electiveSubjects: Subject[] = allSubjects.filter((s) => s.group === 'elective');

// AI Tutor suggested prompts (subject-specific, generated from registry)
export const aiPromptsBySubject: Record<SubjectId, string[]> = {
  mathematics: [
    'Explain quadratic equations step by step',
    'Help me solve this algebra problem',
    'Quiz me on geometry formulas',
  ],
  english: [
    'Help me write an essay introduction',
    'Explain parts of speech in English',
    'Quiz me on comprehension skills',
  ],
  kiswahili: [
    'Help me revise Kiswahili grammar',
    'Explain sarufi ya Kiswahili',
    'Quiz me on fasihi andhadhari',
  ],
  cre: [
    'Explain the Sermon on the Mount',
    'Help me understand Christian values',
    'Quiz me on the Books of the Bible',
  ],
  pe: [
    'Explain warm-up routines for athletes',
    'Help me design a fitness plan',
    'Quiz me on rules of common sports',
  ],
  ict: [
    'Help me understand computer networks',
    'Explain how the internet works',
    'Quiz me on spreadsheet formulas',
  ],
  chemistry: [
    'Help me understand chemical bonding',
    'Explain the periodic table trends',
    'Quiz me on balancing equations',
  ],
  physics: [
    'Quiz me on Newton\'s Laws of Motion',
    'Explain the laws of thermodynamics',
    'Help me solve circuit problems',
  ],
  'computer-science': [
    'Explain Python functions and loops',
    'Help me understand data structures',
    'Quiz me on algorithms and Big-O',
  ],
};

// Sample lessons used by Continue Learning & My Learning
export const continueLearning = [
  { subjectId: 'mathematics' as SubjectId, topic: 'Quadratic Equations', timeLeft: '15 min left', progress: 82 },
  { subjectId: 'chemistry' as SubjectId, topic: 'Chemical Bonding', timeLeft: '20 min left', progress: 56 },
  { subjectId: 'physics' as SubjectId, topic: 'Newton\'s Laws of Motion', timeLeft: '20 min left', progress: 39 },
  { subjectId: 'english' as SubjectId, topic: 'Essay Writing Skills', timeLeft: '10 min left', progress: 75 },
];

export const recentLessons = [
  { subjectId: 'mathematics' as SubjectId, topic: 'Algebraic Expressions', progress: 75 },
  { subjectId: 'computer-science' as SubjectId, topic: 'Introduction to Python', progress: 60 },
  { subjectId: 'kiswahili' as SubjectId, topic: 'Sarufi ya Kiswahili', progress: 80 },
  { subjectId: 'physics' as SubjectId, topic: 'Forces and Motion', progress: 50 },
  { subjectId: 'ict' as SubjectId, topic: 'Computer Networks', progress: 90 },
];

// Today's Mission tasks (all subject-related)
export const todayMissions = [
  { text: 'Complete 1 Mathematics lesson', done: true, subjectId: 'mathematics' as SubjectId },
  { text: 'Score 80%+ in a Chemistry quiz', done: false, subjectId: 'chemistry' as SubjectId },
  { text: 'Ask the AI tutor about Physics', done: false, subjectId: 'physics' as SubjectId },
];

// Upcoming Quizzes
export const upcomingQuizzes = [
  { subjectId: 'mathematics' as SubjectId, title: 'Mathematics Quiz — Algebra', date: 'Tomorrow, 10:00 AM', questions: 20 },
  { subjectId: 'chemistry' as SubjectId, title: 'Chemistry Quiz — Chemical Bonding', date: '03 Jul, 2:00 PM', questions: 18 },
  { subjectId: 'physics' as SubjectId, title: 'Physics Quiz — Forces', date: '05 Jul, 11:00 AM', questions: 15 },
];

// Past papers (only 9 subjects, realistic years)
export const pastPapers = [
  { subjectId: 'mathematics' as SubjectId, paper: 'Paper 1', year: 2024, score: 78, ringColor: '#3b82f6', action: 'Continue Practice' },
  { subjectId: 'english' as SubjectId, paper: 'Paper 2', year: 2023, score: 65, ringColor: '#3b82f6', action: 'Review Attempt' },
  { subjectId: 'chemistry' as SubjectId, paper: 'Paper 2', year: 2023, score: 71, ringColor: '#f97316', action: 'Start Practice' },
  { subjectId: 'physics' as SubjectId, paper: 'Paper 1', year: 2024, score: 60, ringColor: '#06b6d4', action: 'Start Practice' },
  { subjectId: 'computer-science' as SubjectId, paper: 'Paper 1', year: 2025, score: 55, ringColor: '#ec4899', action: 'Start Practice' },
  { subjectId: 'kiswahili' as SubjectId, paper: 'Paper 1', year: 2024, score: 73, ringColor: '#14b8a6', action: 'Start Practice' },
  { subjectId: 'ict' as SubjectId, paper: 'Paper 1', year: 2025, score: 84, ringColor: '#22d3ee', action: 'Start Practice' },
  { subjectId: 'cre' as SubjectId, paper: 'Paper 1', year: 2022, score: 70, ringColor: '#eab308', action: 'Start Practice' },
  { subjectId: 'pe' as SubjectId, paper: 'Paper 1', year: 2023, score: 68, ringColor: '#6366f1', action: 'Start Practice' },
];

// Study Planner schedule (today)
export const todaySchedule = [
  { subjectId: 'mathematics' as SubjectId, topic: 'Quadratic Equations', time: '9:00 AM - 10:00 AM', status: 'Completed' as const },
  { subjectId: 'chemistry' as SubjectId, topic: 'Chemical Bonding', time: '10:30 AM - 11:30 AM', status: 'Completed' as const },
  { subjectId: 'physics' as SubjectId, topic: 'Newton\'s Laws', time: '12:00 PM - 1:00 PM', status: 'In Progress' as const },
  { subjectId: 'english' as SubjectId, topic: 'Essay Writing', time: '2:00 PM - 3:00 PM', status: 'Upcoming' as const },
  { subjectId: 'ict' as SubjectId, topic: 'Networking Basics', time: '4:00 PM - 5:00 PM', status: 'Upcoming' as const },
  { subjectId: 'computer-science' as SubjectId, topic: 'Python Functions', time: '7:00 PM - 8:00 PM', status: 'Upcoming' as const },
];

// Resources (all 9 subjects)
export const resources = [
  { subjectId: 'mathematics' as SubjectId, type: 'NOTES', title: 'Mathematics Formula Sheet', desc: 'Quick reference for important formulas.', meta: 'PDF • 12 pages' },
  { subjectId: 'chemistry' as SubjectId, type: 'VIDEO', title: 'Chemical Bonding Explained', desc: 'Step-by-step explanation with examples.', meta: 'YouTube • 18 min' },
  { subjectId: 'physics' as SubjectId, type: 'ANIMATION', title: 'Physics Simulation: Forces', desc: 'Interactive 3D simulation for Newton\'s laws.', meta: 'Interactive' },
  { subjectId: 'computer-science' as SubjectId, type: 'EBOOK', title: 'Computer Science Programming Guide', desc: 'Beginner-friendly programming textbook.', meta: 'PDF • 150 pages' },
  { subjectId: 'english' as SubjectId, type: 'WORKSHEET', title: 'English Essay Writing Practice', desc: 'Practice questions with model answers.', meta: 'PDF • 3 pages' },
  { subjectId: 'kiswahili' as SubjectId, type: 'NOTES', title: 'Kiswahili Fasihi Notes', desc: 'Comprehensive notes on fasihi andhadhari.', meta: 'PDF • 8 pages' },
  { subjectId: 'cre' as SubjectId, type: 'EBOOK', title: 'CRE Bible Study Notes', desc: 'Detailed Bible study and analysis.', meta: 'PDF • 22 pages' },
  { subjectId: 'pe' as SubjectId, type: 'NOTES', title: 'PE Fitness Guide', desc: 'Personal fitness routines and tips.', meta: 'PDF • 6 pages' },
  { subjectId: 'ict' as SubjectId, type: 'VIDEO', title: 'ICT Networking Notes', desc: 'Comprehensive networking concepts.', meta: 'YouTube • 24 min' },
];

// Accomplishments (all subject-based)
export const accomplishments = [
  { name: 'Mathematics Master', desc: 'Complete all 29 Mathematics lessons', earned: true, date: 'May 24, 2025', glowColor: 'shadow-blue-500/40' },
  { name: 'Physics Explorer', desc: 'Score 70%+ in 5 Physics quizzes', earned: true, date: 'Jun 1, 2025', glowColor: 'shadow-amber-500/40' },
  { name: 'Chemistry Champion', desc: 'Complete 15 Chemistry lessons', earned: true, date: 'May 20, 2025', glowColor: 'shadow-orange-500/40' },
  { name: 'ICT Innovator', desc: 'Complete all ICT lessons', earned: true, date: 'May 10, 2025', glowColor: 'shadow-cyan-500/40' },
  { name: 'Computer Science Coder', desc: 'Complete 10 coding challenges', earned: true, date: 'Jun 1, 2025', glowColor: 'shadow-cyan-500/40' },
  { name: 'English Communicator', desc: 'Complete 20 English lessons', earned: true, date: 'May 24, 2025', glowColor: 'shadow-purple-500/40' },
  { name: 'Kiswahili Scholar', desc: 'Score 80%+ in 5 Kiswahili quizzes', earned: false, progress: '3 / 5' },
  { name: 'CRE Achiever', desc: 'Complete all CRE lessons', earned: false, progress: '14 / 20' },
  { name: 'PE Star Athlete', desc: 'Complete all PE lessons', earned: false, progress: '9 / 20' },
];

// Recent achievements feed
export const recentAchievements = [
  { subjectId: 'mathematics' as SubjectId, title: 'Completed a Mathematics lesson', xp: '+20 XP', time: '2 days ago' },
  { subjectId: 'chemistry' as SubjectId, title: 'Scored 85% in Chemistry Quiz', xp: '+30 XP', time: 'Yesterday' },
  { subjectId: 'ict' as SubjectId, title: 'Completed ICT Lesson on Networks', xp: '+20 XP', time: '3 days ago' },
  { subjectId: 'physics' as SubjectId, title: 'Solved a Physics Past Paper', xp: '+40 XP', time: '5 days ago' },
  { subjectId: 'computer-science' as SubjectId, title: 'Submitted Python Project', xp: '+50 XP', time: '1 week ago' },
];

// Quick insights for AI Tutor
export const aiInsights = [
  { subjectId: 'mathematics' as SubjectId, bold: 'You asked 8 questions today.', rest: 'Keep it up! Curiosity leads to mastery.' },
  { subjectId: 'chemistry' as SubjectId, bold: 'Your top subject today is Chemistry.', rest: 'You spent 42% of your study time here.' },
  { subjectId: 'ict' as SubjectId, bold: 'Try practicing more ICT quizzes', rest: 'to improve your exam readiness.' },
];

// Dashboard subject progress cards (showcases all 9 with circle progress)
export const subjectProgressCards = [
  { subjectId: 'mathematics' as SubjectId, status: 'Strong', statusColor: 'text-blue-400', barClass: 'bg-blue-500' },
  { subjectId: 'chemistry' as SubjectId, status: 'Good', statusColor: 'text-orange-400', barClass: 'bg-orange-500' },
  { subjectId: 'physics' as SubjectId, status: 'Needs focus', statusColor: 'text-amber-400', barClass: 'bg-amber-500' },
  { subjectId: 'english' as SubjectId, status: 'Good', statusColor: 'text-purple-400', barClass: 'bg-purple-500' },
  { subjectId: 'kiswahili' as SubjectId, status: 'Good', statusColor: 'text-teal-400', barClass: 'bg-teal-500' },
  { subjectId: 'ict' as SubjectId, status: 'Strong', statusColor: 'text-cyan-400', barClass: 'bg-cyan-500' },
  { subjectId: 'cre' as SubjectId, status: 'Good', statusColor: 'text-yellow-400', barClass: 'bg-yellow-500' },
  { subjectId: 'pe' as SubjectId, status: 'Needs focus', statusColor: 'text-indigo-400', barClass: 'bg-indigo-500' },
  { subjectId: 'computer-science' as SubjectId, status: 'Strong', statusColor: 'text-pink-400', barClass: 'bg-pink-500' },
];

// Learning journey path (subject-themed checkpoints)
export const learningJourney = [
  { subjectId: 'mathematics' as SubjectId, topic: 'Algebra Basics', completed: true },
  { subjectId: 'mathematics' as SubjectId, topic: 'Quadratic Equations', completed: true, current: true },
  { subjectId: 'chemistry' as SubjectId, topic: 'Chemical Bonding', locked: true },
  { subjectId: 'physics' as SubjectId, topic: 'Forces and Motion', locked: true },
  { subjectId: 'computer-science' as SubjectId, topic: 'Python Functions', locked: true },
];

// Helper to get subject display info
export function getSubject(id: SubjectId): Subject {
  return subjects[id];
}
