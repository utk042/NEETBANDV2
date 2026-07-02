import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import LMSLogin from '../components/Admin/LMSLogin';
import AdminDashboard from '../components/Admin/AdminDashboard';
import ProtectedRoute from '../components/ProtectedRoute';
import { useLmsAuth } from '../contexts/LmsAuthContext';
import NotFound from '../components/NotFound';

export default function LmsRoutes() {
  const { lmsUser, isAuthLoading, login } = useLmsAuth();
  const navigate = useNavigate();

  // Theme state for LMS
  const [theme, setTheme] = useState(() => {
    const stored = localStorage.getItem('theme');
    if (stored) return stored;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  return (
    <Routes>
      <Route path="/lms-login" element={
        <LMSLogin 
          onLoginSuccess={(sessionUser) => {
            login(sessionUser);
            navigate('/lms');
          }} 
          navigate={navigate} 
        />
      } />
      <Route path="/lms" element={
        <ProtectedRoute isLoggedIn={lmsUser.isLoggedIn} isAuthLoading={isAuthLoading} portalName="LMS" loginRoute="/lms-login">
          <AdminDashboard user={lmsUser} theme={theme} setTheme={setTheme} />
        </ProtectedRoute>
      } />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
