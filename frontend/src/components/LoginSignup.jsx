import React, { useState, useEffect } from 'react';
import { 
  IconEye, 
  IconEyeOff, 
  IconBrandGoogle, 
  IconAlertCircle, 
  IconCheck, 
  IconArrowRight,
  IconChevronLeft,
  IconMail
} from '@tabler/icons-react';
import { supabase } from '../services/supabaseClient';
import { loginWithSupabaseToken } from '../services/api';

export default function LoginSignup({ onLoginSuccess, navigate }) {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [authSubMode, setAuthSubMode] = useState('password'); // 'password', 'otp', 'otp-code', 'forgot', 'signup-verify'

  const isSupabaseConfigured = () => {
    const url = import.meta.env.VITE_SUPABASE_URL || '';
    const key = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
    return url && key && !url.includes('your-project-id') && !key.includes('placeholder-anon-key');
  };

  const checkConfig = () => {
    if (!isSupabaseConfigured()) {
      setFeedbackMsg({
        type: 'error',
        text: 'Supabase is not configured. Please replace placeholder keys in frontend/.env and backend/.env with your actual Supabase URL and Anon Key.'
      });
      return false;
    }
    return true;
  };

  // Eliminate body paddings and min-height constraints to prevent scrollbars on desktop viewports
  useEffect(() => {
    const originalMinHeight = document.body.style.minHeight;
    const originalPaddingTop = document.body.style.paddingTop;
    const originalPaddingBottom = document.body.style.paddingBottom;

    document.body.style.minHeight = '100dvh';
    document.body.style.paddingTop = '0px';
    document.body.style.paddingBottom = '0px';

    if (!isSupabaseConfigured()) {
      setFeedbackMsg({
        type: 'error',
        text: 'Supabase credentials are not configured. Please open frontend/.env and backend/.env and replace the placeholder keys with your actual Supabase project keys.'
      });
    }

    return () => {
      document.body.style.minHeight = originalMinHeight;
      document.body.style.paddingTop = originalPaddingTop;
      document.body.style.paddingBottom = originalPaddingBottom;
    };
  }, []);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    otpCode: ''
  });
  
  // Validation and Status States
  const [errors, setErrors] = useState({});
  const [feedbackMsg, setFeedbackMsg] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const toggleMode = () => {
    setIsLoginMode(!isLoginMode);
    setAuthSubMode('password');
    setFormData({ name: '', email: '', password: '', otpCode: '' });
    setErrors({});
    setFeedbackMsg(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for that field as user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  // Basic Form Validation
  const validateForm = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!isLoginMode && !formData.name.trim()) {
      newErrors.name = 'Full name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (authSubMode === 'password' && !formData.password) {
      newErrors.password = 'Password is required';
    } else if (authSubMode === 'password' && formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Traditional Signup (Email/Password)
  const handleTraditionalSignup = async (e) => {
    e.preventDefault();
    if (!checkConfig()) return;
    if (!validateForm()) return;
    setIsLoading(true);
    setFeedbackMsg(null);

    try {
      const { data: { session }, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: { full_name: formData.name },
          emailRedirectTo: window.location.origin + '/auth/callback'
        }
      });
      if (error) throw error;

      if (session) {
        // Auto-confirmed (email confirmation disabled in Supabase), sync immediately
        const backendData = await loginWithSupabaseToken(session.access_token);
        localStorage.setItem('user_token', backendData.token);
        
        setFeedbackMsg({ type: 'success', text: 'Account created and verified!' });
        
        setTimeout(() => {
          setIsLoading(false);
          onLoginSuccess({
            _id: backendData._id,
            name: backendData.name,
            email: backendData.email,
            role: backendData.role,
            membershipPlan: backendData.membershipPlan,
            isPremium: backendData.isPremium,
            streak: backendData.streak,
            isLoggedIn: true
          });
        }, 1000);
      } else {
        // Needs email verification confirmation link
        setAuthSubMode('signup-verify');
        setResendCooldown(60);
        setFeedbackMsg({ type: 'success', text: 'Confirmation link sent.' });
        setIsLoading(false);
      }
    } catch (err) {
      setFeedbackMsg({ type: 'error', text: err.message || 'An error occurred during sign up.' });
      setIsLoading(false);
    }
  };

  // Verify Signup OTP
  const handleVerifySignupOtp = async (e) => {
    e.preventDefault();
    if (!checkConfig()) return;
    if (!formData.otpCode || formData.otpCode.length !== 6) {
      setErrors({ otpCode: 'Please enter a valid 6-digit verification code' });
      return;
    }
    setIsLoading(true);
    setFeedbackMsg(null);

    try {
      const { data: { session }, error } = await supabase.auth.verifyOtp({
        email: formData.email,
        token: formData.otpCode,
        type: 'signup' // Verification type for confirming signup emails
      });
      if (error) throw error;
      if (!session) throw new Error('Verification succeeded but could not establish an active session.');

      // Sync and retrieve MongoDB details
      const backendData = await loginWithSupabaseToken(session.access_token);
      localStorage.setItem('user_token', backendData.token);

      setFeedbackMsg({ type: 'success', text: 'Email verified successfully!' });

      setTimeout(() => {
        setIsLoading(false);
        onLoginSuccess({
          _id: backendData._id,
          name: backendData.name,
          email: backendData.email,
          role: backendData.role,
          membershipPlan: backendData.membershipPlan,
          isPremium: backendData.isPremium,
          streak: backendData.streak,
          isLoggedIn: true
        });
      }, 1000);
    } catch (err) {
      setFeedbackMsg({ type: 'error', text: err.message || 'Invalid or expired OTP verification code.' });
      setIsLoading(false);
    }
  };

  // Traditional Login (Email/Password)
  const handleTraditionalLogin = async (e) => {
    e.preventDefault();
    if (!checkConfig()) return;
    if (!validateForm()) return;
    setIsLoading(true);
    setFeedbackMsg(null);

    try {
      const { data: { session }, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });
      if (error) throw error;
      if (!session) throw new Error("Verification pending or failed.");

      // Sync and retrieve MongoDB details
      const backendData = await loginWithSupabaseToken(session.access_token);
      localStorage.setItem('user_token', backendData.token);

      setFeedbackMsg({ type: 'success', text: `Welcome back, ${backendData.name}!` });

      setTimeout(() => {
        setIsLoading(false);
        onLoginSuccess({
          _id: backendData._id,
          name: backendData.name,
          email: backendData.email,
          role: backendData.role,
          membershipPlan: backendData.membershipPlan,
          isPremium: backendData.isPremium,
          streak: backendData.streak,
          isLoggedIn: true
        });
      }, 1000);
    } catch (err) {
      setFeedbackMsg({ type: 'error', text: err.message || 'Invalid email or password.' });
      setIsLoading(false);
    }
  };

  // Send Email OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!checkConfig()) return;
    if (!formData.email.trim()) {
      setErrors({ email: 'Email address is required' });
      return;
    }
    setIsLoading(true);
    setFeedbackMsg(null);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: formData.email,
        options: {
          shouldCreateUser: true,
          emailRedirectTo: window.location.origin + '/auth/callback'
        }
      });
      if (error) throw error;

      setAuthSubMode('otp-code');
      setResendCooldown(60);
      setFeedbackMsg({ type: 'success', text: '6-digit OTP code has been sent to your email!' });
    } catch (err) {
      setFeedbackMsg({ type: 'error', text: err.message || 'Failed to send verification code.' });
    } finally {
      setIsLoading(false);
    }
  };

  // Resend OTP/Link Code
  const handleResendOtp = async () => {
    if (!checkConfig()) return;
    if (resendCooldown > 0 || isLoading) return;

    setIsLoading(true);
    setFeedbackMsg(null);

    try {
      if (authSubMode === 'signup-verify') {
        const { error } = await supabase.auth.resend({
          type: 'signup',
          email: formData.email,
          options: {
            emailRedirectTo: window.location.origin + '/auth/callback'
          }
        });
        if (error) throw error;
        setFeedbackMsg({ type: 'success', text: 'Confirmation link resent.' });
      } else if (authSubMode === 'otp-code') {
        const { error } = await supabase.auth.signInWithOtp({
          email: formData.email,
          options: {
            shouldCreateUser: true,
            emailRedirectTo: window.location.origin + '/auth/callback'
          }
        });
        if (error) throw error;
        setFeedbackMsg({ type: 'success', text: 'New OTP code sent! Please check your inbox.' });
      }
      setResendCooldown(60);
    } catch (err) {
      setFeedbackMsg({ type: 'error', text: err.message || 'Failed to resend code.' });
    } finally {
      setIsLoading(false);
    }
  };

  // Verify Email OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!checkConfig()) return;
    if (!formData.otpCode || formData.otpCode.length !== 6) {
      setErrors({ otpCode: 'Please enter a valid 6-digit verification code' });
      return;
    }
    setIsLoading(true);
    setFeedbackMsg(null);

    try {
      const { data: { session }, error } = await supabase.auth.verifyOtp({
        email: formData.email,
        token: formData.otpCode,
        type: 'email'
      });
      if (error) throw error;
      if (!session) throw new Error('Could not establish an active session.');

      // Exchange with backend
      const backendData = await loginWithSupabaseToken(session.access_token);
      localStorage.setItem('user_token', backendData.token);

      setFeedbackMsg({ type: 'success', text: `Welcome, ${backendData.name}!` });

      setTimeout(() => {
        setIsLoading(false);
        onLoginSuccess({
          _id: backendData._id,
          name: backendData.name,
          email: backendData.email,
          role: backendData.role,
          membershipPlan: backendData.membershipPlan,
          isPremium: backendData.isPremium,
          streak: backendData.streak,
          isLoggedIn: true
        });
      }, 1000);
    } catch (err) {
      setFeedbackMsg({ type: 'error', text: err.message || 'Invalid or expired OTP code.' });
      setIsLoading(false);
    }
  };

  // Forgot Password Reset Request
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!checkConfig()) return;
    if (!formData.email.trim()) {
      setErrors({ email: 'Email address is required' });
      return;
    }
    setIsLoading(true);
    setFeedbackMsg(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(formData.email, {
        redirectTo: window.location.origin + '/auth/callback'
      });
      if (error) throw error;
      setFeedbackMsg({ type: 'success', text: 'Password reset link sent! Check your inbox.' });
    } catch (err) {
      setFeedbackMsg({ type: 'error', text: err.message || 'Failed to send password reset link.' });
    } finally {
      setIsLoading(false);
    }
  };

  // Google OAuth Initiator
  const handleGoogleLogin = async () => {
    if (!checkConfig()) return;
    setIsLoading(true);
    setFeedbackMsg(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin + '/auth/callback'
        }
      });
      if (error) throw error;
    } catch (err) {
      setFeedbackMsg({ type: 'error', text: err.message || 'Google OAuth initialization failed.' });
      setIsLoading(false);
    }
  };

  const getFormSubmitHandler = () => {
    if (!isLoginMode) {
      if (authSubMode === 'signup-verify') {
        return (e) => e.preventDefault();
      }
      return handleTraditionalSignup;
    }
    switch (authSubMode) {
      case 'forgot':
        return handleForgotPassword;
      case 'otp':
        return handleSendOtp;
      case 'otp-code':
        return handleVerifyOtp;
      case 'password':
      default:
        return handleTraditionalLogin;
    }
  };

  return (
    <section className="py-12 md:py-8 px-gutter min-h-[100dvh] flex items-center justify-center bg-transparent relative transition-colors duration-300">
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[rgba(var(--color-outline),0.1)] to-transparent"></div>
      
      {/* Absolute Back Button in Upper Left Corner */}
      <div className="absolute top-6 left-6 md:top-8 md:left-8 z-20">
        <button 
          type="button"
          onClick={() => navigate('/')}
          className="group flex items-center justify-center w-10 h-10 border border-[var(--border-floating-card)] hover:border-primary/30 rounded-full bg-surface-container/50 hover:bg-surface-container text-on-surface-variant hover:text-primary transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 shadow-sm hover:shadow active:scale-[0.95]"
          aria-label="Back to Home"
        >
          <IconChevronLeft size={20} className="transition-transform duration-200 group-hover:-translate-x-0.5" />
        </button>
      </div>

      <div className="w-full max-w-md" data-gsap="auth-container">

        {/* Auth Card Box */}
        <div className="bg-surface-container-lowest rounded-3xl border border-[var(--border-floating-card)] p-8 md:p-10 shadow-[var(--shadow-floating-card)] relative overflow-hidden">
          
          {/* Top Tabs (Only show in password / default register mode) */}
          {(authSubMode === 'password') && (
            <div className="flex border-b border-[var(--border-floating-card)] mb-8">
              <button
                type="button"
                onClick={() => { if (!isLoginMode) toggleMode(); }}
                className={`flex-1 pb-4 text-center font-headline-md text-lg font-bold transition-all border-b-2 focus-visible:outline-none ${
                  isLoginMode 
                    ? 'border-primary text-primary' 
                    : 'border-transparent text-on-surface-variant hover:text-on-surface'
                }`}
              >
                Log In
              </button>
              <button
                type="button"
                onClick={() => { if (isLoginMode) toggleMode(); }}
                className={`flex-1 pb-4 text-center font-headline-md text-lg font-bold transition-all border-b-2 focus-visible:outline-none ${
                  !isLoginMode 
                    ? 'border-primary text-primary' 
                    : 'border-transparent text-on-surface-variant hover:text-on-surface'
                }`}
              >
                Create Account
              </button>
            </div>
          )}

          <div className="mb-6">
            <h3 className="font-headline-lg text-2xl font-bold text-on-surface mb-2">
              {!isLoginMode 
                ? authSubMode === 'signup-verify'
                  ? 'Check your inbox'
                  : 'Join NeetBand' 
                : authSubMode === 'forgot'
                  ? 'Forgot Password'
                  : authSubMode === 'otp'
                    ? 'OTP Code Login'
                    : authSubMode === 'otp-code'
                      ? 'Verify OTP'
                      : 'Welcome back to NeetBand'}
            </h3>
            <p className="font-body-md text-sm text-on-surface-variant">
              {!isLoginMode 
                ? authSubMode === 'signup-verify'
                  ? `We sent a confirmation link to ${formData.email}. Please click the link to activate your account.`
                  : 'Turn long textbook chapters into memorable study songs.'
                : authSubMode === 'forgot'
                  ? 'Enter your email address and we will send you a password reset link.'
                  : authSubMode === 'otp'
                    ? 'Enter your email to receive a passwordless 6-digit login code.'
                    : authSubMode === 'otp-code'
                      ? `We sent a code to ${formData.email}. Enter it below.`
                      : 'Access your study playlist and check your MCQ recall scores.'}
            </p>
          </div>

          {/* Feedback message banner */}
          {feedbackMsg && (
            <div className={`mb-6 p-4 rounded-xl border flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300 ${
              feedbackMsg.type === 'success' 
                ? 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20' 
                : 'bg-error/10 text-error border-error/20'
            }`}>
              {feedbackMsg.type === 'success' ? (
                <IconCheck size={20} className="flex-shrink-0 mt-0.5" />
              ) : (
                <IconAlertCircle size={20} className="flex-shrink-0 mt-0.5" />
              )}
              <span className="font-body-md text-sm font-medium">{feedbackMsg.text}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={getFormSubmitHandler()} className="flex flex-col gap-5">
            
            {/* NAME FIELD (Sign Up Only, hide in verification) */}
            {(!isLoginMode && authSubMode !== 'signup-verify') && (
              <div className="flex flex-col gap-2">
                <label htmlFor="auth-name" className="font-label-md text-sm font-semibold text-on-surface-variant">
                  Full Name
                </label>
                <input 
                  type="text" 
                  id="auth-name" 
                  name="name" 
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g. Rahul Sharma"
                  disabled={isLoading}
                  aria-invalid={!!errors.name}
                  className={`px-4 py-3 rounded-xl bg-surface-container border text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all font-body-md ${
                    errors.name ? 'border-error' : 'border-[var(--border-floating-card)]'
                  }`}
                />
                {errors.name && (
                  <span className="text-error font-label-sm text-[11px] font-medium mt-1">{errors.name}</span>
                )}
              </div>
            )}

            {/* EMAIL FIELD (Sign up, normal login, OTP input, forgot password) */}
            {(authSubMode !== 'otp-code' && authSubMode !== 'signup-verify') && (
              <div className="flex flex-col gap-2">
                <label htmlFor="auth-email" className="font-label-md text-sm font-semibold text-on-surface-variant">
                  Email Address
                </label>
                <input 
                  type="email" 
                  id="auth-email" 
                  name="email" 
                  required
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="e.g. rahul@example.com"
                  disabled={isLoading}
                  aria-invalid={!!errors.email}
                  className={`px-4 py-3 rounded-xl bg-surface-container border text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all font-body-md ${
                    errors.email ? 'border-error' : 'border-[var(--border-floating-card)]'
                  }`}
                />
                {errors.email && (
                  <span className="text-error font-label-sm text-[11px] font-medium mt-1">{errors.email}</span>
                )}
              </div>
            )}

            {/* OTP CODE FIELD (OTP verification only) */}
            {authSubMode === 'otp-code' && (
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <label htmlFor="auth-otp" className="font-label-md text-sm font-semibold text-on-surface-variant">
                    Verification Code
                  </label>
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={resendCooldown > 0 || isLoading}
                    className={`font-label-sm text-xs font-semibold focus-visible:outline-none ${
                      resendCooldown > 0 || isLoading
                        ? 'text-on-surface-variant/40 cursor-not-allowed'
                        : 'text-primary hover:underline'
                    }`}
                  >
                    {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
                  </button>
                </div>
                <input 
                  type="text" 
                  id="auth-otp" 
                  name="otpCode" 
                  required
                  maxLength={6}
                  value={formData.otpCode}
                  onChange={handleInputChange}
                  placeholder="Enter 6-digit OTP"
                  disabled={isLoading}
                  aria-invalid={!!errors.otpCode}
                  className={`px-4 py-3 rounded-xl bg-surface-container border text-center text-xl tracking-[0.25em] font-bold text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all font-body-md ${
                    errors.otpCode ? 'border-error' : 'border-[var(--border-floating-card)]'
                  }`}
                />
                {errors.otpCode && (
                  <span className="text-error font-label-sm text-[11px] font-medium mt-1">{errors.otpCode}</span>
                )}
              </div>
            )}

            {/* LINK-BASED SIGNUP CONFIRMATION VIEW */}
            {authSubMode === 'signup-verify' && (
              <div className="flex flex-col items-center gap-5 text-center my-2">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                  <IconMail size={32} />
                </div>
                <p className="font-body-sm text-xs text-on-surface-variant max-w-[280px]">
                  Can't find the email? Check your spam folder or request a new link below.
                </p>
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={resendCooldown > 0 || isLoading}
                  className={`w-full py-3.5 rounded-xl border border-[var(--border-floating-card)] bg-surface-container font-label-md transition-all active:scale-[0.98] ${
                    resendCooldown > 0 || isLoading
                      ? 'text-on-surface-variant/40 cursor-not-allowed'
                      : 'text-primary hover:bg-surface-container-high hover:border-primary/20'
                  }`}
                >
                  {resendCooldown > 0 ? `Resend link in ${resendCooldown}s` : 'Resend link'}
                </button>
              </div>
            )}

            {/* PASSWORD FIELD (Password login and sign up only) */}
            {(authSubMode === 'password') && (
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <label htmlFor="auth-password" className="font-label-md text-sm font-semibold text-on-surface-variant">
                    Password
                  </label>
                  {isLoginMode && (
                    <button 
                      type="button"
                      onClick={() => {
                        setAuthSubMode('forgot');
                        setFeedbackMsg(null);
                        setErrors({});
                      }}
                      className="font-label-sm text-xs text-primary hover:underline focus-visible:outline-none"
                    >
                      Forgot Password?
                    </button>
                  )}
                </div>
                <div className="relative w-full">
                  <input 
                    type={showPassword ? 'text' : 'password'}
                    id="auth-password" 
                    name="password" 
                    required
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="At least 6 characters"
                    disabled={isLoading}
                    aria-invalid={!!errors.password}
                    className={`w-full px-4 py-3 pr-11 rounded-xl bg-surface-container border text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all font-body-md ${
                      errors.password ? 'border-error' : 'border-[var(--border-floating-card)]'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface focus:outline-none p-1 rounded"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <IconEyeOff size={18} /> : <IconEye size={18} />}
                  </button>
                </div>
                {errors.password && (
                  <span className="text-error font-label-sm text-[11px] font-medium mt-1">{errors.password}</span>
                )}
              </div>
            )}

            {/* SUBMIT BUTTON */}
            {authSubMode !== 'signup-verify' && (
              <button 
                type="submit" 
                disabled={isLoading}
                className="mt-2 w-full bg-primary hover:bg-primary-fixed hover:text-on-primary-fixed text-on-primary font-label-md py-3.5 rounded-xl transition-[colors,box-shadow,transform] duration-200 shadow-sm hover:shadow-md active:scale-[0.98] active:translate-y-[1px] flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-on-primary" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Processing...
                  </span>
                ) : (
                  <>
                    {!isLoginMode 
                      ? 'Create Account' 
                      : authSubMode === 'forgot'
                        ? 'Send Reset Link'
                        : authSubMode === 'otp'
                          ? 'Send Verification Code'
                          : authSubMode === 'otp-code'
                            ? 'Verify & Log In'
                            : 'Log In'}
                    <IconArrowRight size={18} />
                  </>
                )}
              </button>
            )}
          </form>

          {/* Sub-modes Switch Options */}
          <div className="mt-4 flex flex-col gap-2 text-center">
            {isLoginMode ? (
              <>
                {authSubMode === 'password' && (
                  <button
                    type="button"
                    onClick={() => {
                      setAuthSubMode('otp');
                      setErrors({});
                      setFeedbackMsg(null);
                    }}
                    className="font-label-sm text-sm text-primary hover:underline focus-visible:outline-none"
                  >
                    Log in with passwordless Email OTP
                  </button>
                )}

                {authSubMode === 'otp' && (
                  <button
                    type="button"
                    onClick={() => {
                      setAuthSubMode('password');
                      setErrors({});
                      setFeedbackMsg(null);
                    }}
                    className="font-label-sm text-sm text-primary hover:underline focus-visible:outline-none"
                  >
                    Back to Password Login
                  </button>
                )}

                {authSubMode === 'otp-code' && (
                  <button
                    type="button"
                    onClick={() => {
                      setAuthSubMode('otp');
                      setErrors({});
                      setFeedbackMsg(null);
                    }}
                    className="font-label-sm text-sm text-primary hover:underline focus-visible:outline-none"
                  >
                    Change Email / Go Back
                  </button>
                )}

                {authSubMode === 'forgot' && (
                  <button
                    type="button"
                    onClick={() => {
                      setAuthSubMode('password');
                      setErrors({});
                      setFeedbackMsg(null);
                    }}
                    className="font-label-sm text-sm text-primary hover:underline focus-visible:outline-none"
                  >
                    Back to Log In
                  </button>
                )}
              </>
            ) : (
              <>
                {authSubMode === 'signup-verify' && (
                  <button
                    type="button"
                    onClick={() => {
                      setAuthSubMode('password');
                      setErrors({});
                      setFeedbackMsg(null);
                    }}
                    className="font-label-sm text-sm text-primary hover:underline focus-visible:outline-none"
                  >
                    Edit email address
                  </button>
                )}
              </>
            )}
          </div>

          {/* SOCIAL LOGIN SECTIONS (Shown in all modes except OTP verification views) */}
          {(authSubMode !== 'otp-code' && authSubMode !== 'signup-verify') && (
            <>
              {/* Divider */}
              <div className="relative my-8 text-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[var(--border-floating-card)]"></div>
                </div>
                <span className="relative px-4 bg-surface-container-lowest font-label-sm text-xs text-on-surface-variant font-medium uppercase">
                  Or continue with
                </span>
              </div>

              {/* Social login buttons */}
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={isLoading}
                  className="flex-1 flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl border border-[var(--border-floating-card)] bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md transition-[colors,transform] duration-200 active:scale-[0.98] focus-visible:outline-none"
                >
                  <IconBrandGoogle size={20} className="text-red-500" />
                  <span>Google</span>
                </button>
              </div>
            </>
          )}

        </div>
      </div>
    </section>
  );
}
