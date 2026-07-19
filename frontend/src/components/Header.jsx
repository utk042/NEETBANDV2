import React, { useState, useEffect } from 'react';
import { IconMenu2, IconX, IconMoon, IconSun, IconLogin, IconSearch, IconHelp, IconPlayerPlay, IconPlayerPause } from '@tabler/icons-react';
import logoImg from '../assets/logo.png';
import { getNewsScrollSettings } from '../services/api';

export default function Header({ theme, toggleTheme, currentPage, navigate, user = { isLoggedIn: false }, onLogout }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [newsVisible, setNewsVisible] = useState(false);
  const [newsItems, setNewsItems] = useState([]);
  const [isPaused, setIsPaused] = useState(false);

  // Fetch news scroll settings dynamically
  useEffect(() => {
    const fetchNewsSettings = async () => {
      try {
        const settings = await getNewsScrollSettings();
        setNewsItems(settings.items || []);
        
        if (settings.enabled) {
          setNewsVisible(true);
        } else {
          setNewsVisible(false);
        }
      } catch (err) {
        console.error('Error fetching news settings:', err);
      }
    };

    const excludedPages = ['course-player', 'lms', 'lms-login', 'affiliate', 'affiliate-login', 'login', 'checkout'];
    if (!excludedPages.includes(currentPage)) {
      fetchNewsSettings();
    } else {
      setNewsVisible(false);
    }
  }, [currentPage]);

  // Prevent scrolling when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen]);

  // Handle mobile menu focus trap and restoration
  useEffect(() => {
    if (!mobileMenuOpen) return;

    const previousActiveElement = document.activeElement;
    const container = document.getElementById('mobile-menu-overlay');
    if (!container) return;

    let focusableElements = [];
    let firstElement = null;
    let lastElement = null;

    const handleKeyDown = (e) => {
      if (e.key !== 'Tab') return;
      if (focusableElements.length === 0) return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    };

    const timer = setTimeout(() => {
      focusableElements = Array.from(
        container.querySelectorAll(
          'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
        )
      );
      if (focusableElements.length > 0) {
        firstElement = focusableElements[0];
        lastElement = focusableElements[focusableElements.length - 1];
        firstElement.focus();
        container.addEventListener('keydown', handleKeyDown);
      }
    }, 50);

    return () => {
      clearTimeout(timer);
      if (container) {
        container.removeEventListener('keydown', handleKeyDown);
      }
      if (previousActiveElement && typeof previousActiveElement.focus === 'function') {
        previousActiveElement.focus();
      }
    };
  }, [mobileMenuOpen]);

  const handleNav = (e, page) => {
    e.preventDefault();
    navigate(page === 'home' ? '/' : `/${page}`);
    setMobileMenuOpen(false);
  };

  const linkClass = (page) => 
    `font-label-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded-xl px-3 py-2.5 ${currentPage === page ? 'text-primary font-bold hover:opacity-80' : 'text-on-surface hover:text-primary'}`;

  return (
    <>
      <header data-gsap="header" className="fixed top-0 w-full z-header bg-surface/95 border-b border-outline/20 transition-colors duration-300">
        <div className="flex justify-between items-center px-gutter py-4 md:py-2.5 w-full max-w-container-max mx-auto gap-8 relative z-header bg-transparent">
          <div className="flex items-center gap-sm">
            <button 
              onClick={() => {
                navigate('/');
                setMobileMenuOpen(false);
              }}
              className="focus-visible:outline-none rounded-xl active:scale-[0.98] transition-transform duration-200"
              aria-label="NeetBand Home"
            >
              <img alt="NeetBand Logo" className="h-16 md:h-20 w-[139px] md:w-[174px] object-contain transition-[height,width] duration-300" src={logoImg} width={512} height={236}/>
            </button>
          </div>
          
          <nav className="hidden lg:flex items-center gap-5">
            <a className={linkClass('home')} href="#" onClick={(e) => handleNav(e, 'home')}>Home</a>
            <a className={linkClass('library')} href="#" onClick={(e) => handleNav(e, 'library')}>Library</a>
            <a className={linkClass('course')} href="#" onClick={(e) => handleNav(e, 'course')}>Courses</a>
            <a className={linkClass('feed')} href="#" onClick={(e) => handleNav(e, 'feed')}>Feed</a>
            <a className={linkClass('blog')} href="#" onClick={(e) => handleNav(e, 'blog')}>Blog</a>
            <a className={linkClass('contact')} href="#" onClick={(e) => handleNav(e, 'contact')}>Contact</a>
          </nav>
          
          <div className="flex items-center gap-4">
            {/* Theme Toggle Button */}
            <button 
              id="theme-toggle" 
              onClick={toggleTheme}
              className="hidden md:flex p-2.5 rounded-full hover:bg-surface-container transition-colors text-on-surface items-center justify-center border border-[var(--border-floating-card)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50" 
              aria-label="Toggle Theme"
            >
              <IconMoon size={22} className="dark:hidden" aria-hidden="true" />
              <IconSun size={22} className="hidden dark:block" aria-hidden="true" />
            </button>
            
            {user.isLoggedIn ? (
                <div className="hidden md:flex items-center gap-3">

                  <button 
                    onClick={() => navigate('/dashboard')}
                    className="font-label-md px-5 py-2.5 rounded-xl text-on-primary bg-primary hover:bg-primary-fixed hover:text-on-primary-fixed font-bold transition-[colors,box-shadow,transform] duration-200 shadow-sm hover:shadow-md active:scale-[0.98] active:translate-y-[1px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                  >
                    Dashboard
                  </button>
                </div>
            ) : (
              currentPage !== 'login' && (
                <button 
                  onClick={() => navigate('/login')}
                  className="hidden md:flex group font-label-md text-on-primary bg-primary px-5 py-2.5 rounded-xl hover:bg-primary-fixed hover:text-on-primary-fixed transition-[colors,box-shadow,transform] shadow-sm hover:shadow-md active:scale-[0.98] active:translate-y-[1px] duration-200 flex items-center gap-2 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                >
                  Log In <IconLogin size={18} className="transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
                </button>
              )
            )}

            {/* Mobile Menu Toggle Button */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-primary hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded-xl relative w-10 h-10 flex items-center justify-center overflow-hidden"
              aria-label="Toggle Menu"
              aria-expanded={mobileMenuOpen}
            >
              <IconMenu2 size={24} className={`absolute transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${mobileMenuOpen ? 'rotate-90 opacity-0 scale-50' : 'rotate-0 opacity-100 scale-100'}`} aria-hidden="true" />
              <IconX size={24} className={`absolute transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${mobileMenuOpen ? 'rotate-0 opacity-100 scale-100' : '-rotate-90 opacity-0 scale-50'}`} aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* News Scroll */}
        {newsVisible && !mobileMenuOpen && newsItems.length > 0 && !['course-player', 'lms', 'lms-login', 'affiliate', 'affiliate-login', 'login', 'checkout'].includes(currentPage) && (
          <div className="w-full bg-primary/10 border-t border-primary/20 text-primary py-2 px-4 flex items-center justify-between overflow-hidden relative z-header-news">
            <div className="flex-1 overflow-hidden relative">
              <div 
                className="whitespace-nowrap animate-marquee flex items-center gap-8 font-medium text-sm hover:[animation-play-state:paused]"
                style={{ animationPlayState: isPaused ? 'paused' : 'running' }}
              >
                {[...newsItems, ...newsItems].map((item, idx) => (
                  <React.Fragment key={idx}>
                    <span>{item}</span>
                    {idx < (newsItems.length * 2) - 1 && <span>•</span>}
                  </React.Fragment>
                ))}
              </div>
            </div>
            <button 
              onClick={() => setIsPaused(!isPaused)}
              className="ml-4 shrink-0 text-primary hover:scale-110 transition-transform focus:outline-none rounded-md focus-visible:ring-2 focus-visible:ring-primary/50"
              aria-label={isPaused ? "Play news" : "Pause news"}
            >
              {isPaused ? <IconPlayerPlay size={18} /> : <IconPlayerPause size={18} />}
            </button>
          </div>
        )}
      </header>

      {/* Mobile Menu Full Page Overlay */}
      <div 
        id="mobile-menu-overlay"
        role="dialog"
        aria-modal="true"
        aria-label="Mobile Navigation Menu"
        className={`md:hidden fixed inset-0 bg-surface z-header-mobile flex flex-col justify-center items-center gap-8 transition-opacity duration-300 ease-in-out ${mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-surface-container to-surface opacity-95 pointer-events-none"></div> 
        
        {/* Animated Links */}
        <div className={`flex flex-col items-center gap-6 py-10 w-full overflow-y-auto max-h-screen transition-all duration-700 delay-100 ${mobileMenuOpen ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
          <a onClick={(e) => handleNav(e, 'home')} className={`font-headline-lg text-3xl md:text-5xl font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded-xl px-6 py-2 relative z-10 ${currentPage === 'home' ? 'text-primary hover:scale-110' : 'text-on-surface hover:text-primary hover:scale-110'}`} href="#">Home</a>
          <a onClick={(e) => handleNav(e, 'library')} className={`font-headline-lg text-3xl md:text-5xl font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded-xl px-6 py-2 relative z-10 ${currentPage === 'library' ? 'text-primary hover:scale-110' : 'text-on-surface hover:text-primary hover:scale-110'}`} href="#">Library</a>
          <a onClick={(e) => handleNav(e, 'feed')} className={`font-headline-lg text-3xl md:text-5xl font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded-xl px-6 py-2 relative z-10 ${currentPage === 'feed' ? 'text-primary hover:scale-110' : 'text-on-surface hover:text-primary hover:scale-110'}`} href="#">Feed</a>

          <a onClick={(e) => handleNav(e, 'blog')} className={`font-headline-lg text-3xl md:text-5xl font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded-xl px-6 py-2 relative z-10 ${currentPage === 'blog' ? 'text-primary hover:scale-110' : 'text-on-surface hover:text-primary hover:scale-110'}`} href="#">Blog</a>
          <a onClick={(e) => handleNav(e, 'course')} className={`font-headline-lg text-3xl md:text-5xl font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded-xl px-6 py-2 relative z-10 ${currentPage === 'course' ? 'text-primary hover:scale-110' : 'text-on-surface hover:text-primary hover:scale-110'}`} href="#">Courses</a>
          <a onClick={(e) => handleNav(e, 'contact')} className={`font-headline-lg text-3xl md:text-5xl font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded-xl px-6 py-2 relative z-10 ${currentPage === 'contact' ? 'text-primary hover:scale-110' : 'text-on-surface hover:text-primary hover:scale-110'}`} href="#">Contact Us</a>
          {!user.isLoggedIn && (
            <a 
              onClick={(e) => {
                e.preventDefault();
                navigate('/login');
                setMobileMenuOpen(false);
              }}
              className={`font-headline-lg text-3xl md:text-5xl font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded-xl px-6 py-2 relative z-10 ${
                currentPage === 'login' ? 'text-primary hover:scale-110' : 'text-on-surface hover:text-primary hover:scale-110'
              }`}
              href="#"
            >
              Log In
            </a>
          )}

          {/* Decorative Bottom Elements */}
          <div className="flex items-center gap-6 mt-4 z-10">
            <button 
              onClick={toggleTheme}
              className="text-on-surface-variant hover:text-primary hover:scale-110 transition-[colors,transform] duration-200 p-2.5 rounded-full bg-surface-container-high focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 flex items-center justify-center" 
              aria-label="Toggle Theme"
            >
              <IconMoon size={28} className="block dark:hidden" aria-hidden="true" />
              <IconSun size={28} className="block hidden dark:block" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

