import React, { useEffect, useRef, useState } from 'react';

export default function CustomCursor() {
  const cursorRef = useRef(null);
  const [cursorClass, setCursorClass] = useState('');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only show on desktop (coarse pointers don't need a custom cursor)
    const mediaQuery = window.matchMedia('(pointer: fine)');
    if (!mediaQuery.matches) return;

    setIsVisible(true);

    const onMouseMove = (e) => {
      if (!cursorRef.current) return;
      cursorRef.current.style.left = `${e.clientX}px`;
      cursorRef.current.style.top = `${e.clientY}px`;
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
        setCursorClass('large');
      } else {
        setCursorClass('');
      }
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseover', onMouseOver);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseover', onMouseOver);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <>
      <style>{`
        /* Hide default cursor on body and interactive elements if we are showing custom cursor */
        @media (pointer: fine) {
          body, a, button, .cursor-pointer, select, input, textarea {
            cursor: none !important;
          }
        }

        .mouse-pointer {
          position: fixed;
          top: 0;
          left: 0;
          -webkit-transform: translate(-50%, -50%);
          -ms-transform: translate(-50%, -50%);
          transform: translate(-50%, -50%);
          width: 10px;
          height: 10px;
          pointer-events: none;
          -webkit-box-sizing: border-box;
          box-sizing: border-box;
          z-index: 99999;
          -webkit-transition-property: width, height, background, border, box-shadow;
          -o-transition-property: width, height, background, border, box-shadow;
          transition-property: width, height, background, border, box-shadow;
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

        body.out .mouse-pointer {
          width: 0;
          height: 0;
        }

        .mouse-pointer.large {
          width: 65px;
          height: 65px;
          background: rgba(224, 36, 79, 0) !important;
          border: 1px solid rgba(224, 36, 79, 0.2);
          -webkit-box-shadow: 0 0 30px rgba(224, 36, 79, 0.6);
          box-shadow: 0 0 30px rgba(224, 36, 79, 0.6);
        }
      `}</style>
      
      <div
        ref={cursorRef}
        className={`mouse-pointer ${cursorClass}`}
      />
    </>
  );
}
