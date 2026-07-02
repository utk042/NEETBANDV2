import React from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import AffiliateLogin from '../components/Affiliate/AffiliateLogin';
import AffiliateDashboard from '../components/Affiliate/AffiliateDashboard';
import ProtectedRoute from '../components/ProtectedRoute';
import { useAffiliateAuth } from '../contexts/AffiliateAuthContext';
import NotFound from '../components/NotFound';

export default function AffiliateRoutes() {
  const { affiliateUser, isAuthLoading, login } = useAffiliateAuth();
  const navigate = useNavigate();

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
          <AffiliateDashboard user={affiliateUser} navigate={navigate} />
        </ProtectedRoute>
      } />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
