import React, { createContext, useContext, useState, useEffect } from 'react';
import { getLmsUserProfile, logoutApi } from '../services/api';

const defaultLmsAuth = {
  lmsUser: { isLoggedIn: false, name: '', email: '' },
  setLmsUser: () => {},
  login: () => {},
  logout: async () => {},
  isAuthLoading: false
};

const LmsAuthContext = createContext(defaultLmsAuth);

export function LmsAuthProvider({ children }) {
  const [lmsUser, setLmsUser] = useState(() => {
    try {
      const storedUser = localStorage.getItem('neetband_lms_user');
      const token = localStorage.getItem('lms_token');
      if (storedUser && token && token !== 'undefined' && token !== 'null') {
        const parsed = JSON.parse(storedUser);
        return { ...parsed, token, isLoggedIn: true };
      }
    } catch (e) {
      console.warn('Failed to parse cached LMS user:', e);
    }
    return { isLoggedIn: false, name: '', email: '' };
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const handleUnauthorized = (event) => {
      localStorage.removeItem('lms_token');
      localStorage.removeItem('neetband_lms_user');
      setLmsUser({ isLoggedIn: false, name: '', email: '', sessionExpired: true });
    };

    window.addEventListener('neetband:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('neetband:unauthorized', handleUnauthorized);
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('lms_token');
      if (token && token !== 'undefined' && token !== 'null') {
        try {
          const profile = await getLmsUserProfile();
          const fullUser = { ...profile, token, isLoggedIn: true };
          setLmsUser(fullUser);
          localStorage.setItem('neetband_lms_user', JSON.stringify(fullUser));
        } catch (e) {
          const isAuthError = e?.status === 401 || e?.status === 403 || e?.message?.includes('Not authorized') || e?.message?.includes('token');
          if (isAuthError) {
            localStorage.removeItem('lms_token');
            localStorage.removeItem('neetband_lms_user');
            setLmsUser({ isLoggedIn: false, name: '', email: '' });
          } else {
            console.warn('LMS profile fetch error (preserving cached session):', e);
          }
        }
      } else {
        localStorage.removeItem('lms_token');
        localStorage.removeItem('neetband_lms_user');
        setLmsUser({ isLoggedIn: false, name: '', email: '' });
      }
      setIsLoading(false);
    };

    fetchProfile();
  }, []);

  const login = (sessionUser) => {
    const token = sessionUser.token || localStorage.getItem('lms_token');
    const updated = { ...sessionUser, token, isLoggedIn: true };
    setLmsUser(updated);
    localStorage.setItem('neetband_lms_user', JSON.stringify(updated));
  };

  const logout = async () => {
    try {
      await logoutApi();
    } catch (e) {
      console.warn('Failed to invalidate LMS session on server:', e);
    }
    localStorage.removeItem('lms_token');
    localStorage.removeItem('neetband_lms_user');
    setLmsUser({ isLoggedIn: false, name: '', email: '' });
  };

  return (
    <LmsAuthContext.Provider value={{ lmsUser, setLmsUser, login, logout, isAuthLoading: isLoading }}>
      {children}
    </LmsAuthContext.Provider>
  );
}

export function useLmsAuth() {
  const context = useContext(LmsAuthContext);
  return context || defaultLmsAuth;
}
