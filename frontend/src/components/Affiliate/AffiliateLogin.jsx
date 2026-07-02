import React, { useState, useEffect } from 'react';
import { 
  IconEye, 
  IconEyeOff, 
  IconAlertCircle, 
  IconCheck, 
  IconArrowRight,
  IconChevronLeft
} from '@tabler/icons-react';
import { affiliateLogin } from '../../services/api';

export default function AffiliateLogin({ onLoginSuccess, navigate }) {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });
  
  // Validation and Status States
  const [errors, setErrors] = useState({});
  const [feedbackMsg, setFeedbackMsg] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const originalMinHeight = document.body.style.minHeight;
    const originalPaddingTop = document.body.style.paddingTop;
    const originalPaddingBottom = document.body.style.paddingBottom;

    document.body.style.minHeight = '100dvh';
    document.body.style.paddingTop = '0px';
    document.body.style.paddingBottom = '0px';

    return () => {
      document.body.style.minHeight = originalMinHeight;
      document.body.style.paddingTop = originalPaddingTop;
      document.body.style.paddingBottom = originalPaddingBottom;
    };
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setFeedbackMsg(null);

    try {
      const data = await affiliateLogin(formData.email, formData.password);
      
      setFeedbackMsg({ type: 'success', text: `Welcome back, ${data.name}!` });

      const sessionUser = {
        _id: data._id,
        name: data.name,
        email: data.email,
        promoCode: data.promoCode,
        isLoggedIn: true
      };
      
      localStorage.setItem('affiliate_token', data.token);
      
      setTimeout(() => {
        setIsLoading(false);
        onLoginSuccess(sessionUser);
      }, 1000);

    } catch (err) {
      setFeedbackMsg({ type: 'error', text: err.message || 'An error occurred during authentication' });
      setIsLoading(false);
    }
  };

  return (
    <section className="py-12 md:py-8 px-gutter min-h-[100dvh] flex items-center justify-center bg-transparent relative transition-colors duration-300">
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[rgba(var(--color-outline),0.1)] to-transparent"></div>
      
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
        <div className="bg-surface-container-lowest rounded-3xl border border-[var(--border-floating-card)] p-8 md:p-10 shadow-[var(--shadow-floating-card)] relative overflow-hidden">
          
          <div className="mb-6">
            <h3 className="font-headline-lg text-2xl font-bold text-on-surface mb-2">
              Affiliate Portal
            </h3>
            <p className="font-body-md text-sm text-on-surface-variant">
              Log in with your affiliate credentials to manage your referrals.
            </p>
          </div>

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

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <label htmlFor="affiliate-email" className="font-label-md text-sm font-semibold text-on-surface-variant">
                Affiliate Email
              </label>
              <input 
                type="email" 
                id="affiliate-email" 
                name="email" 
                required
                autoComplete="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="admin@neetband.com"
                disabled={isLoading}
                className={`px-4 py-3 rounded-xl bg-surface-container border text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all font-body-md ${
                  errors.email ? 'border-error' : 'border-[var(--border-floating-card)]'
                }`}
              />
              {errors.email && (
                <span className="text-error font-label-sm text-[11px] font-medium mt-0.5">{errors.email}</span>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="affiliate-password" className="font-label-md text-sm font-semibold text-on-surface-variant">
                Password
              </label>
              <div className="relative w-full">
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  id="affiliate-password" 
                  name="password" 
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter admin password"
                  disabled={isLoading}
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
                <span className="text-error font-label-sm text-[11px] font-medium mt-0.5">{errors.password}</span>
              )}
            </div>

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
                  Authenticating...
                </span>
              ) : (
                <>
                  Log In to Affiliate Panel
                  <IconArrowRight size={18} />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
