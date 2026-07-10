import React, { useEffect, useRef, useState } from 'react';

export default function CustomCursor() {
  const pointerRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only show on desktop (touch devices don't need a custom cursor)
    const mediaQuery = window.matchMedia('(pointer: fine)');
    if (!mediaQuery.matches) return;

    setIsVisible(true);

    const onMouseMove = (e) => {
      if (!pointerRef.current) return;
      pointerRef.current.style.left = e.clientX + 'px';
      pointerRef.current.style.top = e.clientY + 'px';
    };

    const onMouseOver = (e) => {
      if (!pointerRef.current) return;
      if (
        e.target.tagName?.toLowerCase() === 'button' ||
        e.target.tagName?.toLowerCase() === 'a' ||
        e.target.tagName?.toLowerCase() === 'input' ||
        e.target.tagName?.toLowerCase() === 'textarea' ||
        e.target.tagName?.toLowerCase() === 'select' ||
        e.target.tagName?.toLowerCase() === 'label' ||
        e.target.closest('button') ||
        e.target.closest('a') ||
        e.target.classList?.contains('cursor-pointer') ||
        e.target.closest('.cursor-pointer')
      ) {
        pointerRef.current.classList.add('large');
      } else {
        pointerRef.current.classList.remove('large');
      }
    };

    const onMouseLeave = () => {
      if (!pointerRef.current) return;
      pointerRef.current.style.left = '-100px';
    };

    const onMouseEnter = () => {
      if (!pointerRef.current) return;
      // Position will be set by mousemove
    };

    document.body.addEventListener('mousemove', onMouseMove);
    document.body.addEventListener('mouseover', onMouseOver);
    document.body.addEventListener('mouseleave', onMouseLeave);
    document.body.addEventListener('mouseenter', onMouseEnter);

    return () => {
      document.body.removeEventListener('mousemove', onMouseMove);
      document.body.removeEventListener('mouseover', onMouseOver);
      document.body.removeEventListener('mouseleave', onMouseLeave);
      document.body.removeEventListener('mouseenter', onMouseEnter);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <>
      <style>{`
        @media (pointer: fine) {
          body, a, button, input, textarea, select, label, .cursor-pointer {
            cursor: none !important;
          }
        }

        .ck-mouse-pointer {
          position: fixed;
          top: 50%;
          left: -100px;
          transform: translate(-50%, -50%);
          width: 10px;
          height: 10px;
          pointer-events: none;
          box-sizing: border-box;
          z-index: 9999;
          transition-property: width, height, background, box-shadow;
          transition-duration: .5s;
          transition-timing-function: cubic-bezier(.19, .94, .336, 1);
          border-radius: 50%;
          background: rgb(var(--color-primary));
          overflow: hidden;
        }

        .ck-mouse-pointer.large {
          width: 65px;
          height: 65px;
          background: rgba(var(--color-primary), 0) !important;
          box-shadow: 0 0 30px rgba(var(--color-primary), 0.4);
        }
      `}</style>

      <div
        ref={pointerRef}
        className="ck-mouse-pointer"
      />
    </>
  );
}
