import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Layouts
import DashboardLayout from './layouts/DashboardLayout';
import AuthLayout from './layouts/AuthLayout';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';

// Dashboard & Feature Pages
import DashboardRouter from './pages/dashboard/DashboardRouter';
import BatchesPage from './pages/batches/BatchesPage';
import BatchDetailsPage from './pages/batches/BatchDetailsPage';
import StudentsPage from './pages/students/StudentsPage';
import EnrollmentsPage from './pages/enrollments/EnrollmentsPage';
import PaymentsPage from './pages/payments/PaymentsPage';
import AttendancePage from './pages/attendance/AttendancePage';
import NoticesPage from './pages/notices/NoticesPage';
import ProfilePage from './pages/profile/ProfilePage';
import SettingsPage from './pages/settings/SettingsPage';
import NotFoundPage from './pages/NotFoundPage';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Auth Routes */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
          </Route>

          {/* Protected Application Routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<DashboardLayout />}>
              <Route path="/dashboard" element={<DashboardRouter />} />
              <Route path="/batches" element={<BatchesPage />} />
              <Route path="/batches/:id" element={<BatchDetailsPage />} />
              <Route path="/students" element={<StudentsPage />} />
              <Route path="/enrollments" element={<EnrollmentsPage />} />
              <Route path="/payments" element={<PaymentsPage />} />
              <Route path="/attendance" element={<AttendancePage />} />
              <Route path="/notices" element={<NoticesPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>
          </Route>

          {/* Root Redirect */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* 404 Fallback */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
