import React, { createContext, useContext, useState, useEffect } from 'react';
import { getUserProfile } from '../services/api';
import { supabase } from '../services/supabaseClient';

const UserAuthContext = createContext(null);

export function UserAuthProvider({ children }) {
  const [user, setUser] = useState({ isLoggedIn: false, name: '', email: '' });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('user_token');
      if (token) {
        try {
          const profile = await getUserProfile();
          setUser({ ...profile, token, isLoggedIn: true });
        } catch (e) {
          localStorage.removeItem('user_token');
          setUser({ isLoggedIn: false, name: '', email: '' });
        }
      }
      setIsLoading(false);
    };

    fetchProfile();
  }, []);

  const login = (sessionUser) => {
    setUser(sessionUser);
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.error('Failed to sign out from Supabase:', e);
    }
    localStorage.removeItem('user_token');
    localStorage.removeItem('neetband_current_user'); // Keeping from App.jsx just in case
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
