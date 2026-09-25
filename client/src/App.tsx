import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import AppLayout from './components/layout/AppLayout';
import AdminLayout from './components/layout/AdminLayout';
import SignIn from './pages/auth/SignIn';
import SignUp from './pages/auth/SignUp';
import ForgotPassword from './pages/auth/ForgotPassword';
import Dashboard from './pages/dashboard/Dashboard';
import SchedulePlanner from './pages/schedule/SchedulePlanner';
import MyCourses from './pages/courses/MyCourses';
import TasksAssignments from './pages/tasks/TasksAssignments';
import UserSettings from './pages/settings/UserSettings';
import AcademicPerformance from './pages/analytics/AcademicPerformance';
import IntelligentInsights from './pages/recommendations/IntelligentInsights';
import Notifications from './pages/notifications/Notifications';
import AdminLogin from './pages/admin/AdminLogin';
import AdminPanel from './pages/admin/AdminPanel';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  if (!isAuthenticated) return <Navigate to="/sign-in" replace />;
  return <>{children}</>;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const isAdmin = useAuthStore((s) => s.isAdmin);
  if (!isAdmin) return <Navigate to="/admin" replace />;
  return <>{children}</>;
}

function PlaceholderPage({ title }: { title: string }) {
  return (
    <div>
      <h1 className="text-3xl font-bold text-white">{title}</h1>
      <p className="text-white/50 mt-2">This page is coming soon.</p>
    </div>
  );
}

function AuthWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0D0F3C] text-white flex items-center justify-center">
      <div className="w-full max-w-md px-4">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#F5C518] rounded-full mb-4">
            <svg className="w-8 h-8 text-[#0D0F3C]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold"> Smart Study Planner</h1>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          {children}
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      {/* Student Auth Routes */}
      <Route path="/sign-in" element={<AuthWrapper><SignIn /></AuthWrapper>} />
      <Route path="/sign-up" element={<AuthWrapper><SignUp /></AuthWrapper>} />
      <Route path="/forgot-password" element={<AuthWrapper><ForgotPassword /></AuthWrapper>} />

      {/* Admin Auth (no wrapper) */}
      <Route path="/admin" element={<AdminLogin />} />

      {/* Protected Student Routes with App Layout */}
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Dashboard />} />
        <Route path="/schedule" element={<SchedulePlanner />} />
        <Route path="/courses" element={<MyCourses />} />
        <Route path="/tasks" element={<TasksAssignments />} />
        <Route path="/recommendations" element={<IntelligentInsights />} />
        <Route path="/analytics" element={<AcademicPerformance />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/settings" element={<UserSettings />} />
      </Route>

      {/* Protected Admin Routes with Admin Layout */}
      <Route
        element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }
      >
        <Route path="/admin/dashboard" element={<AdminPanel />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}