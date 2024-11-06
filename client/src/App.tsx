// src/App.tsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, RequireAuth } from './contexts/AuthContext';
import { MainLayout } from './components/layout/MainLayout';

// Pages
import LoginPage from './features/auth/LoginPage';
import RegisterPage from './features/auth/RegisterPage';
import ProjectsPage from './features/projects/ProjectsPage';
import ProjectDetails from './features/projects/ProjectDetails';
import TimeEntriesPage from './features/time-entries/TimeEntriesPage';
import TasksPage from './features/tasks/TasksPage';
import AnalyticsPage from './features/analytics/AnalyticsPage';
import InvoiceGenerator from './features/invoices/InvoiceGenerator';
import { TimerProvider } from './contexts/TimerContext';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
        <Router>
          <AuthProvider>
          <TimerProvider>
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* Protected Routes */}
              <Route element={<RequireAuth><MainLayout /></RequireAuth>}>
                <Route path="/" element={<TimeEntriesPage />} />
                <Route path="/projects" element={<ProjectsPage />} />
                <Route path="/projects/:id" element={<ProjectDetails />} />
                <Route path="/time-entries" element={<TimeEntriesPage />} />
                <Route path="/tasks" element={<TasksPage />} />
                <Route path="/analytics" element={<AnalyticsPage />} />
                <Route path="/invoices" element={<InvoiceGenerator />} />
              </Route>

              {/* Catch all route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            </TimerProvider>
          </AuthProvider>
        </Router>
    </QueryClientProvider>
  );
}

export default App;