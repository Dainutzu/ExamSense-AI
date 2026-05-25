import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './components/ui/Toast';
import ProtectedRoute from './components/ProtectedRoute';

import LandingPage   from './pages/LandingPage';
import LoginPage     from './pages/auth/LoginPage';
import SignupPage    from './pages/auth/SignupPage';
import DashboardPage from './pages/DashboardPage';
import UploadPage    from './pages/UploadPage';
import AnalysisPage  from './pages/AnalysisPage';
import HistoryPage   from './pages/HistoryPage';
import SettingsPage  from './pages/SettingsPage';

import './styles/globals.css';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            {/* Public */}
            <Route path="/"        element={<LandingPage />} />
            <Route path="/login"   element={<LoginPage />} />
            <Route path="/signup"  element={<SignupPage />} />

            {/* Protected */}
            <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
            <Route path="/upload"    element={<ProtectedRoute><UploadPage /></ProtectedRoute>} />
            <Route path="/analysis/:id" element={<ProtectedRoute><AnalysisPage /></ProtectedRoute>} />
            <Route path="/history"   element={<ProtectedRoute><HistoryPage /></ProtectedRoute>} />
            <Route path="/settings"  element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
