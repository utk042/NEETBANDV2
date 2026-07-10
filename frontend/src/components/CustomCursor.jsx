import React, { useEffect, useRef } from 'react';

export default function CustomCursor() {
  const cursorRef = useRef(null);

  useEffect(() => {
    // Only show on desktop (coarse pointers don't need a custom cursor)
    const mediaQuery = window.matchMedia('(pointer: fine)');
    if (!mediaQuery.matches) return;

    const cursor = cursorRef.current;
    if (!cursor) return;

    // Track mouse position
    const onMouseMove = (e) => {
      cursor.style.left = `${e.clientX}px`;
      cursor.style.top = `${e.clientY}px`;
    };

    // Hover effect using event delegation for instant class updates
    const onMouseOver = (e) => {
      const target = e.target;
      if (!target) return;

      const isClickable =
        target.tagName?.toLowerCase() === 'button' ||
        target.tagName?.toLowerCase() === 'a' ||
        target.closest('button') ||
        target.closest('a') ||
        target.classList?.contains('cursor-pointer') ||
        target.closest('.cursor-pointer') ||
        target.classList?.contains('pointer-large') ||
        target.closest('.pointer-large') ||
        target.classList?.contains('theme-btn') ||
        target.closest('.theme-btn');

      if (isClickable) {
        cursor.classList.add('large');
      } else {
        cursor.classList.remove('large');
      }
    };

    const onMouseLeave = () => {
      cursor.classList.add('out');
    };

    const onMouseEnter = () => {
      cursor.classList.remove('out');
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('mouseover', onMouseOver, { passive: true });
    document.addEventListener('mouseleave', onMouseLeave);
    document.addEventListener('mouseenter', onMouseEnter);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseover', onMouseOver);
      document.removeEventListener('mouseleave', onMouseLeave);
      document.removeEventListener('mouseenter', onMouseEnter);
    };
  }, []);

  return (
    <>
      <style>{`
        /* Hide default cursor on body and interactive elements if we are showing custom cursor */
        @media (pointer: fine) {
          body, a, button, .cursor-pointer {
            cursor: none !important;
          }
        }

        .mouse-pointer {
          position: fixed;
          top: 50%;
          left: -100px;
          -webkit-transform: translate(-50%, -50%);
          -ms-transform: translate(-50%, -50%);
          transform: translate(-50%, -50%);
          width: 10px;
          height: 10px;
          pointer-events: none;
          -webkit-box-sizing: border-box;
          box-sizing: border-box;
          z-index: 99999;
          -webkit-transition-property: width, height, background;
          -o-transition-property: width, height, background;
          transition-property: width, height, background;
          -webkit-transition-duration: .5s;
          -o-transition-duration: .5s;
          transition-duration: .5s;
          -webkit-transition-timing-function: cubic-bezier(.19, .94, .336, 1);
          -o-transition-timing-function: cubic-bezier(.19, .94, .336, 1);
          transition-timing-function: cubic-bezier(.19, .94, .336, 1);
          border-radius: 50%;
          background: #f4244f;
          overflow: hidden;
        }

        .mouse-pointer.out {
          width: 0;
          height: 0;
        }

        .mouse-pointer.large {
          width: 65px;
          height: 65px;
          background: rgba(224, 36, 79, 0) !important;
          -webkit-box-shadow: 0 0 30px rgba(224, 36, 79, 0.4);
          box-shadow: 0 0 30px rgba(224, 36, 79, 0.4);
        }
      `}</style>
      
      <div
        id="mouse-pointer"
        ref={cursorRef}
        className="mouse-pointer"
      />
    </>
  );
}
