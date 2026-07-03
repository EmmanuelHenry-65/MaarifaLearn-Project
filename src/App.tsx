import { useState } from 'react';
import Sidebar from './components/Sidebar';
import TopNav from './components/TopNav';
import StatsCards from './components/StatsCards';
import ContinueLearning from './components/ContinueLearning';
import TodaysMission from './components/TodaysMission';
import AITutor from './components/AITutor';
import SubjectProgress from './components/SubjectProgress';
import UpcomingQuiz from './components/UpcomingQuiz';
import StudyPlanner from './components/StudyPlanner';
import LearningJourney from './components/LearningJourney';
import RecentAchievements from './components/RecentAchievements';
import MyLearningView from './views/MyLearningView';
import SubjectsView from './views/SubjectsView';
import AITutorView from './views/AITutorView';
import StudyPlannerView from './views/StudyPlannerView';
import PastPapersView from './views/PastPapersView';
import SettingsView from './views/SettingsView';
import AchievementsView from './views/AchievementsView';
import ResourcesView from './views/ResourcesView';

export default function App() {
  const [activeTab, setActiveTab] = useState('Dashboard');

  return (
    <div className="min-h-screen w-full bg-[#0a0e1a] text-gray-200 flex overflow-x-hidden">
      {/* Background subtle gradient overlay */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(6,182,212,0.04)_0%,transparent_50%)] pointer-events-none" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(139,92,246,0.03)_0%,transparent_50%)] pointer-events-none" />

      {/* Sidebar */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Area */}
      <div className="flex-1 ml-[200px] relative z-10 flex flex-col p-6 overflow-hidden min-w-0">
        {/* Header spans the full content width */}
        <TopNav activeTab={activeTab} />

        {/* Dynamic content tab switching */}
        {activeTab === 'My Learning' ? (
          <MyLearningView />
        ) : activeTab === 'Subjects' ? (
          <SubjectsView />
        ) : activeTab === 'AI Tutor' ? (
          <AITutorView />
        ) : activeTab === 'Study Planner' ? (
          <StudyPlannerView />
        ) : activeTab === 'Past Papers' ? (
          <PastPapersView />
        ) : activeTab === 'Settings' ? (
          <SettingsView />
        ) : activeTab === 'Accomplishments' ? (
          <AchievementsView />
        ) : activeTab === 'Resources' ? (
          <ResourcesView />
        ) : (
          <div className="flex gap-6 mt-2 flex-1 min-h-0">
            {/* Left/Center Column */}
            <div className="flex-1 min-w-0 space-y-4 overflow-y-auto pr-1">
              {/* Stats Row */}
              <StatsCards />

              {/* Continue Learning + Today's Mission Row */}
              <div className="grid grid-cols-5 gap-4">
                <div className="col-span-3">
                  <ContinueLearning />
                </div>
                <div className="col-span-2">
                  <TodaysMission />
                </div>
              </div>

              {/* My Subjects */}
              <SubjectProgress />

              {/* Bottom Row: Study Planner + Learning Journey */}
              <div className="grid grid-cols-5 gap-4 pb-6">
                <div className="col-span-2">
                  <StudyPlanner />
                </div>
                <div className="col-span-3">
                  <LearningJourney />
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="w-[300px] flex-shrink-0 space-y-4 overflow-y-auto pb-6">
              <AITutor />
              <UpcomingQuiz />
              <RecentAchievements />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
