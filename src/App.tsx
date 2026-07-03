import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './AppLayout';
import DashboardPage from './pages/DashboardPage';
import MyLearningPage from './pages/MyLearningPage';
import SubjectsPage from './pages/SubjectsPage';
import SubjectDetailPage from './pages/SubjectDetailPage';
import AITutorPage from './pages/AITutorPage';
import StudyPlannerPage from './pages/StudyPlannerPage';
import PastPapersPage from './pages/PastPapersPage';
import ResourcesPage from './pages/ResourcesPage';
import AccomplishmentsPage from './pages/AccomplishmentsPage';
import SettingsPage from './pages/SettingsPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/my-learning" element={<MyLearningPage />} />
          <Route path="/subjects" element={<SubjectsPage />} />
          <Route path="/subjects/:subjectId" element={<SubjectDetailPage />} />
          <Route path="/ai-tutor" element={<AITutorPage />} />
          <Route path="/study-planner" element={<StudyPlannerPage />} />
          <Route path="/past-papers" element={<PastPapersPage />} />
          <Route path="/resources" element={<ResourcesPage />} />
          <Route path="/accomplishments" element={<AccomplishmentsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
