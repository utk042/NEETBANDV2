import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

export default function CustomCursor() {
  const dotRef = useRef(null);
  const ringRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    // Only show on desktop (coarse pointers don't need a custom cursor)
    const mediaQuery = window.matchMedia('(pointer: fine)');
    if (!mediaQuery.matches) return;

    setIsVisible(true);

    const onMouseMove = (e) => {
      if (!dotRef.current || !ringRef.current) return;
      
      // Dot is w-2 h-2 (8px). Center offset is 4px.
      gsap.set(dotRef.current, {
        x: e.clientX - 4,
        y: e.clientY - 4,
      });

      // Ring is w-8 h-8 (32px). Center offset is 16px.
      gsap.to(ringRef.current, {
        x: e.clientX - 16,
        y: e.clientY - 16,
        duration: 0.15,
        ease: 'power3.out',
      });
    };

    const onMouseOver = (e) => {
      // Check if hovering over clickable elements
      if (
        e.target.tagName?.toLowerCase() === 'button' ||
        e.target.tagName?.toLowerCase() === 'a' ||
        e.target.closest('button') ||
        e.target.closest('a') ||
        e.target.classList?.contains('cursor-pointer') ||
        e.target.closest('.cursor-pointer')
      ) {
        setIsHovering(true);
      } else {
        setIsHovering(false);
      }
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseover', onMouseOver);

    // Initial scale setup - check if refs exist since they might not be rendered yet
    if (dotRef.current && ringRef.current) {
      gsap.set(dotRef.current, { scale: 1 });
      gsap.set(ringRef.current, { scale: 1 });
    }

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseover', onMouseOver);
    };
  }, []);

  // Handle hover animations with GSAP so it doesn't conflict with position transforms
  useEffect(() => {
    if (!isVisible || !dotRef.current || !ringRef.current) return;
    
    gsap.to(dotRef.current, {
      scale: isHovering ? 0 : 1,
      duration: 0.2,
      ease: 'power2.out'
    });
    
    gsap.to(ringRef.current, {
      scale: isHovering ? 1.5 : 1,
      backgroundColor: isHovering ? 'rgba(var(--color-primary), 0.1)' : 'transparent',
      duration: 0.2,
      ease: 'power2.out'
    });
  }, [isHovering, isVisible]);

  if (!isVisible) return null;

  return (
    <>
      <style>{`
        /* Hide default cursor on body and interactive elements if we are showing custom cursor */
        @media (pointer: fine) {
          body, a, button, .cursor-pointer {
            cursor: none !important;
          }
        }
      `}</style>
      
      {/* Outer Ring */}
      <div
        ref={ringRef}
        className="fixed top-0 left-0 w-8 h-8 border-2 border-primary rounded-full pointer-events-none z-[9998]"
      />

      {/* Inner Dot */}
      <div
        ref={dotRef}
        className="fixed top-0 left-0 w-2 h-2 bg-primary rounded-full pointer-events-none z-[9999]"
      />
    </>
  );
}
