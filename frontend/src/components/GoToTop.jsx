import React, { useState, useEffect } from 'react';
import { IconArrowUp } from '@tabler/icons-react';

export default function GoToTop({ currentPage }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only show on home page
    if (currentPage !== 'home') {
      setIsVisible(false);
      return;
    }

    const toggleVisibility = () => {
      if (window.scrollY > 600) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    
    // Check initial scroll position
    toggleVisibility();

    return () => window.removeEventListener('scroll', toggleVisibility);
  }, [currentPage]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  if (currentPage !== 'home') return null;

  return (
    <button
      onClick={scrollToTop}
      aria-label="Go to top"
      className={`fixed bottom-[160px] md:bottom-[112px] right-6 md:right-8 z-[90] p-2.5 rounded-full bg-primary text-on-primary shadow-[0_0_15px_rgba(var(--color-primary),0.3)] hover:scale-110 hover:shadow-[0_0_25px_rgba(var(--color-primary),0.5)] hover:bg-primary-fixed hover:text-on-primary-fixed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 transition-all duration-300 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'
      }`}
    >
      <IconArrowUp size={20} />
    </button>
  );
}
