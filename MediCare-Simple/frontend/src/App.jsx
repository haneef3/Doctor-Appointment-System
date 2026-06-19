// src/App.jsx — Root router
// ─────────────────────────────────────────────────────────────
import { Routes, Route, Navigate } from 'react-router-dom'
import { AppProvider, useApp } from './context/AppContext'

import Navbar           from './components/Navbar'
import Toast            from './components/Toast'

import HomePage         from './pages/HomePage'
import DoctorsPage      from './pages/DoctorsPage'
import BookPage         from './pages/BookPage'
import DashboardPage    from './pages/DashboardPage'
import LoginPage        from './pages/LoginPage'
import AdminLoginPage   from './pages/AdminLoginPage'
import DoctorLoginPage  from './pages/DoctorLoginPage'

// Simple protected route wrapper
const ProtectedRoute = ({ children }) => {
  const { user } = useApp();
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

export default function App() {
  return (
    <AppProvider>
      <Navbar />
      <Toast />

      <Routes>
        <Route path="/"             element={<HomePage />}         />
        <Route path="/doctors"      element={<DoctorsPage />}      />
        <Route path="/login"        element={<LoginPage />}        />
        <Route path="/admin-login"  element={<AdminLoginPage />}   />
        <Route path="/doctor-login" element={<DoctorLoginPage />}  />
        
        {/* Protected Routes */}
        <Route path="/book"         element={<ProtectedRoute><BookPage /></ProtectedRoute>} />
        <Route path="/book/:doctorId" element={<ProtectedRoute><BookPage /></ProtectedRoute>} />
        <Route path="/dashboard"    element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />

        {/* Catch-all */}
        <Route path="*"             element={<Navigate to="/" replace />} />
      </Routes>
    </AppProvider>
  )
}
