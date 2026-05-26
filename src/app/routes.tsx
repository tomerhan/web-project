import { createBrowserRouter, Navigate, Outlet } from 'react-router';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Toaster } from 'sonner';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import LecturerDashboard from './components/dashboard/LecturerDashboard';
import ChatInterface from './components/chat/ChatInterface';
import Library from './components/library/Library';
import SettingsPage from './components/settings/SettingsPage';
import HistoryPage from './components/history/HistoryPage';
import AnalyzedReports from './components/analysis/AnalyzedReports';
import ChatAnalyzer from './components/analysis/ChatAnalyzer';
import MainLayout from './components/layout/MainLayout';

function Root() {
  return (
    <AuthProvider>
      <Outlet />
      <Toaster richColors position="bottom-right" />
    </AuthProvider>
  );
}

/** Student routes — renders sidebar layout */
function StudentLayout() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'lecturer') return <Navigate to="/lecturer" replace />;
  return <MainLayout />;
}

/** Lecturer dashboard — no sidebar */
function LecturerRoute() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'lecturer') return <Navigate to="/" replace />;
  return <LecturerDashboard />;
}

/** Lecturer viewing a specific student — no sidebar */
function StudentViewRoute() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <ChatInterface />;
}

function LoginRoute() {
  const { user } = useAuth();
  if (user) return <Navigate to={user.role === 'lecturer' ? '/lecturer' : '/'} replace />;
  return <Login />;
}

export const router = createBrowserRouter([
  {
    path: '/',
    Component: Root,
    children: [
      { path: 'login',    Component: LoginRoute },
      { path: 'register', Component: Register },

      /* Student pages — wrapped in sidebar layout */
      {
        Component: StudentLayout,
        children: [
          { index: true,             Component: ChatInterface },
          { path: 'chat-analyzer',   Component: ChatAnalyzer },
          { path: 'library',         Component: Library },
          { path: 'reports',   Component: AnalyzedReports },
          { path: 'settings',  Component: SettingsPage },
          { path: 'history',   Component: HistoryPage },
        ],
      },

      /* Standalone pages — no sidebar */
      { path: 'lecturer',        Component: LecturerRoute },
      { path: 'student/:id',     Component: StudentViewRoute },
    ],
  },
]);
