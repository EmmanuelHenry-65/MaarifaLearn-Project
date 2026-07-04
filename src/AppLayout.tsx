import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import TopNav from './components/TopNav';
import { useTheme } from './context/ThemeContext';

const routeToTitle: Record<string, { title: string; subtitle: string }> = {
  '/': { title: 'Good morning, Emmanuel! 👋', subtitle: '"Every day is a step closer to your goals."' },
  '/my-learning': { title: 'My Learning', subtitle: 'Track your progress and continue your learning journey.' },
  '/subjects': { title: 'Subjects', subtitle: 'Explore all subjects in the CBC curriculum. Track your progress and master every topic.' },
  '/ai-tutor': { title: 'AI Tutor', subtitle: 'Your intelligent learning companion. Ask anything, learn anything.' },
  '/study-planner': { title: 'Study Planner', subtitle: 'Plan your study, stay consistent, and achieve your goals.' },
  '/past-papers': { title: 'Past Papers', subtitle: 'Practice with real past papers and mark schemes to boost your exam performance.' },
  '/exams': { title: 'Assessment Center', subtitle: 'Practice authentic exams, timed papers, AI walkthroughs, and smart review.' },
  '/settings': { title: 'Settings', subtitle: 'Manage your account, preferences, and learning experience.' },
  '/accomplishments': { title: 'Accomplishments', subtitle: 'Celebrate your wins and track your learning journey.' },
  '/resources': { title: 'Resources', subtitle: 'Discover high-quality learning materials aligned to the CBC curriculum.' },
  '/workspace': { title: 'Learning Workspace', subtitle: 'Study deeply with subject tools, practice, notes, and AI support.' },
};

const pathToLabel: Record<string, string> = {
  '/': 'Dashboard',
  '/my-learning': 'My Learning',
  '/subjects': 'Subjects',
  '/ai-tutor': 'AI Tutor',
  '/study-planner': 'Study Planner',
  '/past-papers': 'Past Papers',
  '/exams': 'Past Papers',
  '/settings': 'Settings',
  '/accomplishments': 'Accomplishments',
  '/resources': 'Resources',
  '/workspace': 'My Learning',
};

export default function AppLayout() {
  const location = useLocation();
  const { theme } = useTheme();

  // For subject detail pages like /subjects/mathematics, treat as Subjects
  const isSubjectDetail = location.pathname.startsWith('/subjects/');
  const isWorkspace = location.pathname.startsWith('/workspace');
  const key = isSubjectDetail ? '/subjects' : isWorkspace ? '/workspace' : location.pathname;
  const meta = routeToTitle[key] || routeToTitle['/'];

  const activeTab = pathToLabel[key] || 'Dashboard';

  return (
    <div className={`min-h-screen w-full flex overflow-x-hidden transition-colors duration-300 ${theme === 'light' ? 'bg-slate-50 text-slate-900' : 'bg-[#0a0e1a] text-gray-200'}`}>
      {/* Background subtle gradient overlay */}
      <div className={`fixed inset-0 pointer-events-none transition-opacity duration-500 ${theme === 'light' ? 'opacity-20 bg-[radial-gradient(ellipse_at_top_right,rgba(6,182,212,0.1)_0%,transparent_50%)]' : 'bg-[radial-gradient(ellipse_at_top_right,rgba(6,182,212,0.04)_0%,transparent_50%)]'}`} />
      <div className={`fixed inset-0 pointer-events-none transition-opacity duration-500 ${theme === 'light' ? 'opacity-10 bg-[radial-gradient(ellipse_at_bottom_left,rgba(139,92,246,0.05)_0%,transparent_50%)]' : 'bg-[radial-gradient(ellipse_at_bottom_left,rgba(139,92,246,0.03)_0%,transparent_50%)]'}`} />

      <Sidebar activeTab={activeTab} />

      <div className="flex-1 ml-[200px] relative z-10 flex flex-col p-6 overflow-hidden min-w-0">
        <TopNav title={meta.title} subtitle={meta.subtitle} />
        <div key={location.pathname} className="page-transition flex-1 min-h-0">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
