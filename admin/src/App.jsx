import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import OverviewPage from './pages/OverviewPage';
import ExerciseLibraryPage from './pages/ExerciseLibraryPage';
import WorkoutBuilderPage from './pages/WorkoutBuilderPage';
import ChallengeManagerPage from './pages/ChallengeManagerPage';
import GroupManagerPage from './pages/GroupManagerPage';
import UserManagerPage from './pages/UserManagerPage';
import ScheduledSessionsPage from './pages/ScheduledSessionsPage';
import NotificationCenterPage from './pages/NotificationCenterPage';
import AnalyticsPage from './pages/AnalyticsPage';
import SubscriptionManagerPage from './pages/SubscriptionManagerPage';
import ProtectedLayout from './components/layout/ProtectedLayout';

function ProtectedRoute({ children }) {
  const { token, loading } = useAuth();

  if (loading) {
    return <div className="bg-primary min-h-screen flex items-center justify-center text-text-primary">Loading...</div>;
  }

  if (!token) {
    return <Navigate to="/login" />;
  }

  return children;
}

function AppContent() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <ProtectedLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<OverviewPage />} />
        <Route path="exercises" element={<ExerciseLibraryPage />} />
        <Route path="workouts" element={<WorkoutBuilderPage />} />
        <Route path="challenges" element={<ChallengeManagerPage />} />
        <Route path="groups" element={<GroupManagerPage />} />
        <Route path="users" element={<UserManagerPage />} />
        <Route path="sessions" element={<ScheduledSessionsPage />} />
        <Route path="notifications" element={<NotificationCenterPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="subscriptions" element={<SubscriptionManagerPage />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </AuthProvider>
  );
}
