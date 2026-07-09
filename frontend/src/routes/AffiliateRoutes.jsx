import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import AffiliateLogin from '../components/Affiliate/AffiliateLogin';
import AffiliateDashboard from '../components/Affiliate/AffiliateDashboard';
import ProtectedRoute from '../components/ProtectedRoute';
import { useAffiliateAuth } from '../contexts/AffiliateAuthContext';
import NotFound from '../components/NotFound';

export default function AffiliateRoutes() {
  const { affiliateUser, isAuthLoading, login } = useAffiliateAuth();
  const navigate = useNavigate();

  // Theme state for Affiliate
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
      <Route path="/affiliate-login" element={
        <AffiliateLogin 
          onLoginSuccess={(sessionUser) => {
            login(sessionUser);
            navigate('/affiliate');
          }} 
          navigate={navigate} 
        />
      } />
      <Route path="/affiliate" element={
        <ProtectedRoute isLoggedIn={affiliateUser.isLoggedIn} isAuthLoading={isAuthLoading} portalName="Affiliate" loginRoute="/affiliate-login">
          <AffiliateDashboard 
            user={affiliateUser} 
            navigate={navigate} 
            theme={theme} 
            setTheme={setTheme} 
          />
        </ProtectedRoute>
      } />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
