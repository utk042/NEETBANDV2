import React, { useState } from 'react';
import { 
  IconCircleCheckFilled, 
  IconMail, 
  IconPhone, 
  IconMapPin, 
  IconClock, 
  IconHeartFilled, 
  IconShieldCheck,
  IconBrandFacebookFilled,
  IconBrandInstagram,
  IconBrandYoutubeFilled,
  IconBrandWhatsapp
} from '@tabler/icons-react';
import logoImg from '../assets/logo.png';
import { subscribeNewsletter } from '../services/api';

export default function Footer({ navigate }) {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [error, setError] = useState('');

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('Email is required');
      return;
    }
    const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!isValid) {
      setError('Please enter a valid email address');
      return;
    }
    try {
      await subscribeNewsletter(email);
      setSubscribed(true);
      setError('');
      setEmail('');
    } catch (err) {
      setError(err.message || 'Subscription failed. Please try again.');
    }
  };

  return (
    <footer className="w-full bg-surface border-t border-[var(--border-nav-layout)] px-gutter pt-20 pb-12 md:pb-12 z-10 relative overflow-hidden transition-all duration-300">
      <div className="max-w-container-max mx-auto relative">
        
        {/* Top Section: Newsletter split layout */}
        <div className="flex flex-col lg:flex-row justify-between items-center gap-8 border-b border-[var(--border-nav-layout)] pb-12 mb-12 w-full">
          
          {/* Newsletter text info */}
          <div className="flex flex-col gap-2 max-w-xl w-full text-left">
            <h3 className="font-headline-md text-lg text-on-surface font-extrabold tracking-tight">
              Stay Ahead in Your Studies
            </h3>
            <p className="font-body-md text-sm text-on-surface-variant/80 leading-relaxed">
              Weekly mnemonics, hand-picked study tracks, and revision hacks delivered straight to your inbox.
            </p>
          </div>

          {/* Newsletter Form input/button */}
          <div className="max-w-md w-full">
            {subscribed ? (
              <div className="flex items-center gap-2.5 text-primary font-body-md text-sm bg-primary/10 border border-primary/20 px-4 py-3 rounded-2xl">
                <IconCircleCheckFilled size={20} className="flex-shrink-0" />
                <span>You’re in! Check your inbox for your first set of study tracks.</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex flex-col gap-2 w-full">
                <div className="flex flex-col sm:flex-row gap-2.5 w-full">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (error) setError('');
                    }}
                    placeholder="Enter your email address… e.g. name@domain.com"
                    aria-label="Your email address"
                    className="px-5 py-3 rounded-xl bg-surface-container border border-[var(--border-floating-card)] text-sm text-on-surface placeholder-on-surface-variant/40 focus:outline-none focus:ring-2 focus:ring-primary/45 focus:border-primary transition-[background-color,border-color,box-shadow] duration-200 flex-1"
                  />
                  <button
                    type="submit"
                    className="px-6 py-3 rounded-xl bg-primary hover:bg-primary-fixed hover:text-on-primary-fixed text-on-primary font-label-md text-sm transition-all shadow-sm hover:shadow-md active:scale-[0.98] active:translate-y-[1px] whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                  >
                    Subscribe
                  </button>
                </div>
                {error && (
                  <span className="text-error text-xs ml-4 font-body-md">{error}</span>
                )}
              </form>
            )}
          </div>

        </div>

        {/* Middle Section: Columns Grid */}
        <div className="flex flex-wrap gap-10 border-b border-[var(--border-nav-layout)] pb-12 mb-12">
          
          {/* Brand Info */}
          <div className="flex flex-col items-start gap-4 min-w-[200px] flex-[2]">
            <img alt="NeetBand Logo" className="h-16 md:h-20 w-auto object-contain" src={logoImg} width={512} height={236}/>
            <p className="font-body-md text-sm text-on-surface-variant/80 max-w-[300px] leading-relaxed">
              Premium curriculum-aligned study songs designed to boost active recall and reduce screen fatigue. Turn textbooks into sound.
            </p>
          </div>

          {/* Platform Links */}
          <div className="flex flex-col gap-4 min-w-[140px] flex-1">
            <h4 className="font-headline-md text-sm text-on-surface font-extrabold uppercase tracking-widest">Platform</h4>
            <nav className="flex flex-col gap-3">
              <a href="#" onClick={(e) => { e.preventDefault(); navigate('/pricing'); }} className="font-body-md text-sm text-on-surface-variant/80 hover:text-primary transition-all duration-200 hover:translate-x-1.5 inline-block font-semibold">Pricing Plans</a>
              <a href="#" onClick={(e) => { e.preventDefault(); navigate('/'); setTimeout(() => document.getElementById('syllabus-library')?.scrollIntoView({ behavior: 'smooth' }), 100); }} className="font-body-md text-sm text-on-surface-variant/80 hover:text-primary transition-all duration-200 hover:translate-x-1.5 inline-block">Syllabus Library</a>
              <a href="#" onClick={(e) => { e.preventDefault(); navigate('/student-hub'); }} className="font-body-md text-sm text-on-surface-variant/80 hover:text-primary transition-all duration-200 hover:translate-x-1.5 inline-block">Student Hub</a>
              <a href="#" onClick={(e) => { e.preventDefault(); navigate('/blog'); }} className="font-body-md text-sm text-on-surface-variant/80 hover:text-primary transition-all duration-200 hover:translate-x-1.5 inline-block">Study Insights</a>
              <a href="#" onClick={(e) => { e.preventDefault(); navigate('/about'); }} className="font-body-md text-sm text-on-surface-variant/80 hover:text-primary transition-all duration-200 hover:translate-x-1.5 inline-block">About Us</a>
            </nav>
          </div>

          {/* Legal Links */}
          <div className="flex flex-col gap-4 min-w-[140px] flex-1">
            <h4 className="font-headline-md text-sm text-on-surface font-extrabold uppercase tracking-widest">Legal</h4>
            <nav className="flex flex-col gap-3">
              <a href="#" onClick={(e) => { e.preventDefault(); navigate('/terms'); }} className="font-body-md text-sm text-on-surface-variant/80 hover:text-primary transition-all duration-200 hover:translate-x-1.5 inline-block">Terms &amp; Conditions</a>
              <a href="#" onClick={(e) => { e.preventDefault(); navigate('/privacy'); }} className="font-body-md text-sm text-on-surface-variant/80 hover:text-primary transition-all duration-200 hover:translate-x-1.5 inline-block">Privacy Policy</a>
              <a href="#" onClick={(e) => { e.preventDefault(); navigate('/refund'); }} className="font-body-md text-sm text-on-surface-variant/80 hover:text-primary transition-all duration-200 hover:translate-x-1.5 inline-block">Refund Policy</a>
            </nav>
          </div>

          {/* Company Links */}
          <div className="flex flex-col gap-4 min-w-[140px] flex-1">
            <h4 className="font-headline-md text-sm text-on-surface font-extrabold uppercase tracking-widest">Company</h4>
            <nav className="flex flex-col gap-3">
              <a href="#" onClick={(e) => { e.preventDefault(); navigate('/careers'); }} className="font-body-md text-sm text-on-surface-variant/80 hover:text-primary transition-all duration-200 hover:translate-x-1.5 inline-block">Careers</a>
              <a href="#" onClick={(e) => { e.preventDefault(); navigate('/advertise'); }} className="font-body-md text-sm text-on-surface-variant/80 hover:text-primary transition-all duration-200 hover:translate-x-1.5 inline-block">Advertise</a>
              <a href="#" onClick={(e) => { e.preventDefault(); navigate('/partner'); }} className="font-body-md text-sm text-on-surface-variant/80 hover:text-primary transition-all duration-200 hover:translate-x-1.5 inline-block">Partner With Us</a>
            </nav>
          </div>

          {/* Follow Us */}
          <div className="flex flex-col gap-3 min-w-[130px] flex-1">
            <h4 className="font-headline-md text-sm text-on-surface font-extrabold uppercase tracking-widest">
              FOLLOW US
            </h4>
            <p className="font-body-md text-xs text-on-surface-variant/75 leading-relaxed">
              Stay connected with us.
            </p>
            <div className="flex items-center gap-2">
              <a 
                href="https://facebook.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                aria-label="Facebook"
                className="w-8 h-8 rounded-full bg-surface-container-high/80 border border-outline/20 text-on-surface-variant/90 hover:text-on-surface hover:border-outline/40 hover:scale-105 transition-all duration-200 flex items-center justify-center shrink-0"
              >
                <IconBrandFacebookFilled size={16} />
              </a>
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                aria-label="Instagram"
                className="w-8 h-8 rounded-full bg-surface-container-high/80 border border-outline/20 text-on-surface-variant/90 hover:text-on-surface hover:border-outline/40 hover:scale-105 transition-all duration-200 flex items-center justify-center shrink-0"
              >
                <IconBrandInstagram size={16} />
              </a>
              <a 
                href="https://youtube.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                aria-label="YouTube"
                className="w-8 h-8 rounded-full bg-surface-container-high/80 border border-outline/20 text-on-surface-variant/90 hover:text-on-surface hover:border-outline/40 hover:scale-105 transition-all duration-200 flex items-center justify-center shrink-0"
              >
                <IconBrandYoutubeFilled size={16} />
              </a>
              <a 
                href="https://whatsapp.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                aria-label="WhatsApp"
                className="w-8 h-8 rounded-full bg-surface-container-high/80 border border-outline/20 text-on-surface-variant/90 hover:text-on-surface hover:border-outline/40 hover:scale-105 transition-all duration-200 flex items-center justify-center shrink-0"
              >
                <IconBrandWhatsapp size={16} />
              </a>
            </div>
          </div>

          {/* Support & Contact */}
          <div className="flex flex-col gap-4 min-w-[200px] flex-[2]">
            <h4 className="font-headline-md text-sm text-on-surface font-extrabold uppercase tracking-widest">Contact &amp; Support</h4>
            <ul className="flex flex-col gap-3.5 text-sm text-on-surface-variant/80 font-body-md">
              <li className="flex items-start gap-2.5">
                <IconMail size={18} className="text-primary mt-0.5 flex-shrink-0" />
                <a href="#" onClick={(e) => { e.preventDefault(); navigate('/contact'); }} className="hover:text-primary transition-colors">support@neetband.com</a>
              </li>
              <li className="flex items-start gap-2.5">
                <IconPhone size={18} className="text-primary mt-0.5 flex-shrink-0" />
                <a href="tel:+918047193393" className="hover:text-primary transition-colors">+91 80 4719 3393</a>
              </li>
              <li className="flex items-start gap-2.5">
                <IconMapPin size={18} className="text-primary mt-0.5 flex-shrink-0" />
                <span className="leading-relaxed">Sector 62, Noida,<br/>Uttar Pradesh, 201301</span>
              </li>
              <li className="flex items-start gap-2.5">
                <IconClock size={18} className="text-primary mt-0.5 flex-shrink-0" />
                <span>Mon - Sat: 9 AM - 6 PM</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section: Copyright, Badges & Legal links */}
        <div className="flex flex-col lg:flex-row justify-between items-center gap-8">
          
          {/* Left: Copyright & Legal */}
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 text-center sm:text-left">
            <p className="font-body-md text-xs text-on-surface-variant/70">
              © {new Date().getFullYear()} NeetBand. All rights reserved.
            </p>
            <span className="hidden sm:inline text-on-surface-variant/30">·</span>
            <nav className="flex items-center gap-4">
              <a href="#" onClick={(e) => { e.preventDefault(); navigate('/terms'); }} className="font-body-md text-xs text-on-surface-variant/60 hover:text-primary transition-colors">Terms</a>
              <a href="#" onClick={(e) => { e.preventDefault(); navigate('/privacy'); }} className="font-body-md text-xs text-on-surface-variant/60 hover:text-primary transition-colors">Privacy</a>
              <a href="#" onClick={(e) => { e.preventDefault(); navigate('/refund'); }} className="font-body-md text-xs text-on-surface-variant/60 hover:text-primary transition-colors">Refund</a>
            </nav>
          </div>

          {/* Right: Startup Badge & Trust Badges */}
          <div className="flex flex-wrap items-center justify-center gap-4">
            {/* Startup India Recognition label */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface-container-high/80 border border-outline/15 text-xs text-on-surface-variant/90 shadow-xs transition-colors hover:border-primary/30">
              <IconShieldCheck size={16} className="text-emerald-500 shrink-0" />
              <span className="font-semibold tracking-tight">DPIIT-Recognised · Startup India</span>
            </div>

          </div>

        </div>

        {/* Disclaimer Note */}
        <div className="mt-8 pt-8 border-t border-[var(--border-nav-layout)] flex flex-col items-center justify-center text-center w-full">
          <p className="font-body-md text-xs text-on-surface-variant/70 max-w-4xl mx-auto leading-relaxed">
            <strong>NEET BAND</strong> is a brand of WisdomArrow Ventures Private Limited, a company incorporated under the Ministry of Corporate Affairs (MCA) and registered with the Department for Promotion of Industry and Internal Trade (DPIIT) as a <strong>Startup India-recognised platform</strong> (verifiable at the Startup India portal).
          </p>
        </div>

      </div>
    </footer>
  );
}
