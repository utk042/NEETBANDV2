import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import AffiliateLogin from '../components/Affiliate/AffiliateLogin';
import AffiliateDashboard from '../components/Affiliate/AffiliateDashboard';
import ProtectedRoute from '../components/ProtectedRoute';
import { useAffiliateAuth } from '../contexts/AffiliateAuthContext';
import NotFound from '../components/NotFound';
import { updateAffiliateProfile } from '../services/api';

export default function AffiliateRoutes() {
  const { affiliateUser, setAffiliateUser, isAuthLoading, login } = useAffiliateAuth();
  const navigate = useNavigate();

  // Local user state initialized from localStorage
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('neetband_affiliate_user');
    return stored ? JSON.parse(stored) : null;
  });

  // Sync local user state with authentication context changes
  useEffect(() => {
    if (affiliateUser && affiliateUser.isLoggedIn) {
      setUser(affiliateUser);
      localStorage.setItem('neetband_affiliate_user', JSON.stringify(affiliateUser));
    } else if (!isAuthLoading) {
      setUser(null);
    }
  }, [affiliateUser, isAuthLoading]);

  // Callback to update user profile in backend API, local state, global context and localStorage
  const handleUserUpdate = async (updatedUser) => {
    const data = await updateAffiliateProfile(updatedUser);
    const activeUser = user || affiliateUser || {};
    const fullUpdatedUser = {
      ...activeUser,
      name: data.name || updatedUser.name,
      email: data.email || activeUser.email,
      promoCode: data.promoCode || activeUser.promoCode,
      token: activeUser.token,
      isLoggedIn: true
    };
    localStorage.setItem('neetband_affiliate_user', JSON.stringify(fullUpdatedUser));
    setUser(fullUpdatedUser);
    setAffiliateUser(fullUpdatedUser);
  };

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

  const displayUser = user || affiliateUser;

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
            user={displayUser} 
            onUserUpdate={handleUserUpdate}
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
