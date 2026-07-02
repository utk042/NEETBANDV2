import React, { createContext, useContext, useState, useEffect } from 'react';
import { getLmsUserProfile } from '../services/api';

const LmsAuthContext = createContext(null);

export function LmsAuthProvider({ children }) {
  const [lmsUser, setLmsUser] = useState({ isLoggedIn: false, name: '', email: '' });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('lms_token');
      if (token) {
        try {
          const profile = await getLmsUserProfile();
          setLmsUser({ ...profile, token, isLoggedIn: true });
        } catch (e) {
          localStorage.removeItem('lms_token');
          setLmsUser({ isLoggedIn: false, name: '', email: '' });
        }
      }
      setIsLoading(false);
    };

    fetchProfile();
  }, []);

  const login = (sessionUser) => {
    setLmsUser(sessionUser);
  };

  const logout = () => {
    localStorage.removeItem('lms_token');
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
  if (!context) {
    throw new Error('useLmsAuth must be used within a LmsAuthProvider');
  }
  return context;
}
