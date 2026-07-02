import React, { createContext, useContext, useState, useEffect } from 'react';
import { getAffiliateUserProfile } from '../services/api';

const AffiliateAuthContext = createContext(null);

export function AffiliateAuthProvider({ children }) {
  const [affiliateUser, setAffiliateUser] = useState({ isLoggedIn: false, name: '', email: '' });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('affiliate_token');
      if (token) {
        try {
          const profile = await getAffiliateUserProfile();
          setAffiliateUser({ ...profile, token, isLoggedIn: true });
        } catch (e) {
          localStorage.removeItem('affiliate_token');
          setAffiliateUser({ isLoggedIn: false, name: '', email: '' });
        }
      }
      setIsLoading(false);
    };

    fetchProfile();
  }, []);

  const login = (sessionUser) => {
    setAffiliateUser(sessionUser);
  };

  const logout = () => {
    localStorage.removeItem('affiliate_token');
    setAffiliateUser({ isLoggedIn: false, name: '', email: '' });
  };

  return (
    <AffiliateAuthContext.Provider value={{ affiliateUser, setAffiliateUser, login, logout, isAuthLoading: isLoading }}>
      {children}
    </AffiliateAuthContext.Provider>
  );
}

export function useAffiliateAuth() {
  const context = useContext(AffiliateAuthContext);
  if (!context) {
    throw new Error('useAffiliateAuth must be used within an AffiliateAuthProvider');
  }
  return context;
}
