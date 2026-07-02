import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';
import { loginWithSupabaseToken } from '../services/api';
import { useUserAuth } from '../contexts/UserAuthContext';
import { IconEye, IconEyeOff, IconAlertCircle, IconCheck, IconArrowRight } from '@tabler/icons-react';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);
  
  const navigate = useNavigate();
  const { login } = useUserAuth();

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 6) {
      setFeedback({ type: 'error', text: 'Password must be at least 6 characters long.' });
      return;
    }
    if (password !== confirmPassword) {
      setFeedback({ type: 'error', text: 'Passwords do not match.' });
      return;
    }

    setIsLoading(true);
    setFeedback(null);

    try {
      // 1. Update password in Supabase
      const { data, error } = await supabase.auth.updateUser({ password });
      if (error) throw error;

      // 2. Fetch session to exchange token
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No active authentication session. Please try logging in again.');

      // 3. Exchange for MongoDB JWT
      const backendData = await loginWithSupabaseToken(session.access_token);
      localStorage.setItem('user_token', backendData.token);
      
      login({
        _id: backendData._id,
        name: backendData.name,
        email: backendData.email,
        role: backendData.role,
        membershipPlan: backendData.membershipPlan,
        isPremium: backendData.isPremium,
        streak: backendData.streak,
        isLoggedIn: true
      });

      setFeedback({ type: 'success', text: 'Password updated successfully! Redirecting...' });
      setTimeout(() => navigate('/'), 2000);
    } catch (err) {
      setFeedback({ type: 'error', text: err.message || 'Failed to update password.' });
      setIsLoading(false);
    }
  };

  return (
    <section className="py-12 md:py-16 px-gutter min-h-[85vh] flex items-center justify-center bg-transparent">
      <div className="w-full max-w-md bg-surface-container-lowest rounded-3xl border border-[var(--border-floating-card)] p-8 md:p-10 shadow-[var(--shadow-floating-card)] relative overflow-hidden">
        <h3 className="font-headline-lg text-2xl font-bold text-on-surface mb-2">Reset Password</h3>
        <p className="font-body-md text-sm text-on-surface-variant mb-6">Enter a new secure password for your account.</p>

        {feedback && (
          <div className={`mb-6 p-4 rounded-xl border flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300 ${
            feedback.type === 'success' ? 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20' : 'bg-error/10 text-error border-error/20'
          }`}>
            {feedback.type === 'success' ? (
              <IconCheck size={20} className="flex-shrink-0 mt-0.5" />
            ) : (
              <IconAlertCircle size={20} className="flex-shrink-0 mt-0.5" />
            )}
            <span className="font-body-md text-sm font-medium">{feedback.text}</span>
          </div>
        )}

        <form onSubmit={handleResetSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-2 relative">
            <label className="font-label-md text-sm font-semibold text-on-surface-variant">New Password</label>
            <div className="relative w-full">
              <input 
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                disabled={isLoading}
                className="w-full px-4 py-3 pr-11 rounded-xl bg-surface-container border border-[var(--border-floating-card)] text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all font-body-md"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface focus:outline-none p-1 rounded"
              >
                {showPassword ? <IconEyeOff size={18} /> : <IconEye size={18} />}
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-label-md text-sm font-semibold text-on-surface-variant">Confirm New Password</label>
            <input 
              type={showPassword ? 'text' : 'password'}
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm password"
              disabled={isLoading}
              className="w-full px-4 py-3 rounded-xl bg-surface-container border border-[var(--border-floating-card)] text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all font-body-md"
            />
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="mt-2 w-full bg-primary hover:bg-primary-fixed hover:text-on-primary-fixed text-on-primary font-label-md py-3.5 rounded-xl transition-[colors,box-shadow,transform] duration-200 shadow-sm hover:shadow-md active:scale-[0.98] active:translate-y-[1px] flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
          >
            {isLoading ? 'Updating...' : 'Update Password'}
            {!isLoading && <IconArrowRight size={18} />}
          </button>
        </form>
      </div>
    </section>
  );
}
