import StatsCards from '../components/StatsCards';
import ContinueLearning from '../components/ContinueLearning';
import TodaysMission from '../components/TodaysMission';
import AITutor from '../components/AITutor';
import SubjectProgress from '../components/SubjectProgress';
import UpcomingQuiz from '../components/UpcomingQuiz';
import StudyPlanner from '../components/StudyPlanner';
import LearningJourney from '../components/LearningJourney';
import RecentAchievements from '../components/RecentAchievements';

export default function DashboardPage() {
  return (
    <div className="flex gap-6 mt-2 flex-1 min-h-0">
      {/* Left/Center Column */}
      <div className="flex-1 min-w-0 space-y-4 overflow-y-auto pr-1">
        <StatsCards />
        <div className="grid grid-cols-5 gap-4">
          <div className="col-span-3">
            <ContinueLearning />
          </div>
          <div className="col-span-2">
            <TodaysMission />
          </div>
        </div>
        <SubjectProgress />
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
  );
}
