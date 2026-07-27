import React, { createContext, useContext, useState, useEffect } from 'react';
import { getUserProfile } from '../services/api';
import { supabase } from '../services/supabaseClient';

const UserAuthContext = createContext(null);

export function UserAuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const storedUser = localStorage.getItem('neetband_current_user');
      const token = localStorage.getItem('user_token');
      if (storedUser && token) {
        const parsed = JSON.parse(storedUser);
        return { ...parsed, token, isLoggedIn: true };
      }
    } catch (e) {
      console.warn('Failed to parse cached user:', e);
    }
    return { isLoggedIn: false, name: '', email: '' };
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('user_token');
      if (token) {
        try {
          const profile = await getUserProfile();
          const fullUser = { ...profile, token, isLoggedIn: true };
          setUser(fullUser);
          localStorage.setItem('neetband_current_user', JSON.stringify(fullUser));
        } catch (e) {
          const isAuthError = e?.status === 401 || e?.status === 403 || e?.message?.includes('Not authorized') || e?.message?.includes('token');
          if (isAuthError) {
            localStorage.removeItem('user_token');
            localStorage.removeItem('neetband_current_user');
            setUser({ isLoggedIn: false, name: '', email: '' });
          } else {
            console.warn('User profile fetch error (preserving cached session):', e);
          }
        }
      } else {
        localStorage.removeItem('neetband_current_user');
        setUser({ isLoggedIn: false, name: '', email: '' });
      }
      setIsLoading(false);
    };

    fetchProfile();
  }, []);

  const login = (sessionUser) => {
    const token = sessionUser.token || localStorage.getItem('user_token');
    const updated = { ...sessionUser, token, isLoggedIn: true };
    setUser(updated);
    localStorage.setItem('neetband_current_user', JSON.stringify(updated));
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.error('Failed to sign out from Supabase:', e);
    }
    localStorage.removeItem('user_token');
    localStorage.removeItem('neetband_current_user');
    setUser({ isLoggedIn: false, name: '', email: '' });
  };

  return (
    <UserAuthContext.Provider value={{ user, setUser, login, logout, isAuthLoading: isLoading }}>
      {children}
    </UserAuthContext.Provider>
  );
}

export function useUserAuth() {
  const context = useContext(UserAuthContext);
  if (!context) {
    throw new Error('useUserAuth must be used within a UserAuthProvider');
  }
  return context;
}
