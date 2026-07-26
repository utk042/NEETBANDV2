import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';
import { loginWithSupabaseToken } from '../services/api';
import { useUserAuth } from '../contexts/UserAuthContext';

export default function AuthCallback() {
  const navigate = useNavigate();
  const { login } = useUserAuth();
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    let mounted = true;
    let redirectTimer = null;

    const processSession = async (session) => {
      try {
        // Exchange Supabase token for local backend JWT
        const data = await loginWithSupabaseToken(session.access_token);
        if (!mounted) return;
        localStorage.setItem('user_token', data.token);
        login({
          _id: data._id,
          name: data.name,
          email: data.email,
          role: data.role,
          membershipPlan: data.membershipPlan,
          isPremium: data.isPremium,
          streak: data.streak,
          isLoggedIn: true
        });
        navigate('/');
      } catch (err) {
        if (!mounted) return;
        console.error('Callback authentication error:', err);
        setErrorMsg(err.message || "Failed to authenticate.");
        redirectTimer = setTimeout(() => { if (mounted) navigate('/login'); }, 4000);
      }
    };

    const handleCallback = async () => {
      try {
        // Handle recovery flow (Password Reset Link) redirection
        const hash = window.location.hash || '';
        const params = new URLSearchParams(hash.replace('#', '?'));
        const type = params.get('type');

        if (type === 'recovery') {
          navigate('/auth/reset-password');
          return;
        }

        // Primary: try getSession() which works if the hash has already been consumed
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        
        if (session) {
          await processSession(session);
          return;
        }

        // Fallback: Supabase may not have parsed the URL hash yet on first render.
        // onAuthStateChange fires reliably after the OAuth redirect is processed.
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, authSession) => {
            if (!mounted) return;
            if (authSession) {
              subscription.unsubscribe();
              await processSession(authSession);
            } else if (event === 'SIGNED_OUT' || event === 'USER_UPDATED') {
              subscription.unsubscribe();
              if (mounted) {
                setErrorMsg("No active session found.");
                redirectTimer = setTimeout(() => { if (mounted) navigate('/login'); }, 3000);
              }
            }
          }
        );

        // Safety timeout: if auth state never fires, redirect after 8s
        redirectTimer = setTimeout(() => {
          if (mounted && !session) {
            subscription.unsubscribe();
            setErrorMsg("Authentication timed out. Please try again.");
            setTimeout(() => { if (mounted) navigate('/login'); }, 2000);
          }
        }, 8000);

      } catch (err) {
        if (!mounted) return;
        console.error('Callback authentication error:', err);
        setErrorMsg(err.message || "Failed to authenticate.");
        redirectTimer = setTimeout(() => { if (mounted) navigate('/login'); }, 4000);
      }
    };

    handleCallback();

    return () => {
      mounted = false;
      if (redirectTimer) clearTimeout(redirectTimer);
    };
  }, [navigate, login]);

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center bg-transparent px-4">
      <div className="bg-surface-container-lowest border border-[var(--border-floating-card)] p-8 rounded-3xl text-center max-w-sm w-full shadow-lg">
        {errorMsg ? (
          <>
            <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4 text-red-500 text-2xl">
              ⚠️
            </div>
            <h3 className="text-xl font-bold text-on-surface mb-2">Authentication Failed</h3>
            <p className="text-sm text-on-surface-variant mb-4">{errorMsg}</p>
            <p className="text-xs text-primary">Redirecting back to login...</p>
          </>
        ) : (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-2 border-primary/20 border-t-primary mx-auto mb-4"></div>
            <h3 className="text-xl font-bold text-on-surface mb-2">Setting up session</h3>
            <p className="text-sm text-on-surface-variant">Connecting you securely to NeetBand...</p>
          </>
        )}
      </div>
    </div>
  );
}
