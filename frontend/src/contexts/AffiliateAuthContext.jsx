import React, { createContext, useContext, useState, useEffect } from 'react';
import { getAffiliateUserProfile, logoutAffiliateApi } from '../services/api';

const defaultAffiliateAuth = {
  affiliateUser: { isLoggedIn: false, name: '', email: '' },
  setAffiliateUser: () => {},
  login: () => {},
  logout: async () => {},
  isAuthLoading: false
};

const AffiliateAuthContext = createContext(defaultAffiliateAuth);

export function AffiliateAuthProvider({ children }) {
  const [affiliateUser, setAffiliateUser] = useState(() => {
    try {
      const storedUser = localStorage.getItem('neetband_affiliate_user');
      const token = localStorage.getItem('affiliate_token');
      if (storedUser && token) {
        const parsed = JSON.parse(storedUser);
        return { ...parsed, token, isLoggedIn: true };
      }
    } catch (e) {
      console.warn('Failed to parse cached affiliate user:', e);
    }
    return { isLoggedIn: false, name: '', email: '' };
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const handleUnauthorized = (event) => {
      localStorage.removeItem('affiliate_token');
      localStorage.removeItem('neetband_affiliate_user');
      setAffiliateUser({ isLoggedIn: false, name: '', email: '', sessionExpired: true });
    };

    window.addEventListener('neetband:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('neetband:unauthorized', handleUnauthorized);
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('affiliate_token');
      if (token) {
        try {
          const profile = await getAffiliateUserProfile();
          const fullUser = { ...profile, token, isLoggedIn: true };
          setAffiliateUser(fullUser);
          localStorage.setItem('neetband_affiliate_user', JSON.stringify(fullUser));
        } catch (e) {
          const isAuthError = e?.status === 401 || e?.status === 403 || e?.message?.includes('Not authorized') || e?.message?.includes('token');
          if (isAuthError) {
            localStorage.removeItem('affiliate_token');
            localStorage.removeItem('neetband_affiliate_user');
            setAffiliateUser({ isLoggedIn: false, name: '', email: '' });
          } else {
            console.warn('Affiliate profile fetch error (preserving cached session):', e);
          }
        }
      } else {
        localStorage.removeItem('neetband_affiliate_user');
        setAffiliateUser({ isLoggedIn: false, name: '', email: '' });
      }
      setIsLoading(false);
    };

    fetchProfile();
  }, []);

  const login = (sessionUser) => {
    const token = sessionUser.token || localStorage.getItem('affiliate_token');
    const updated = { ...sessionUser, token, isLoggedIn: true };
    setAffiliateUser(updated);
    localStorage.setItem('neetband_affiliate_user', JSON.stringify(updated));
  };

  const logout = async () => {
    try {
      await logoutAffiliateApi();
    } catch (e) {
      console.warn('Failed to invalidate affiliate session on server:', e);
    }
    localStorage.removeItem('affiliate_token');
    localStorage.removeItem('neetband_affiliate_user');
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
  return context || defaultAffiliateAuth;
}
