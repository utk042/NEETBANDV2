import React, { useEffect, useRef, useState } from 'react';

export default function CustomCursor() {
  const cursorRef = useRef(null);
  const [isHovering, setIsHovering] = useState(false);
  const [isOut, setIsOut] = useState(false);
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
        setIsHovering(true);
      } else {
        setIsHovering(false);
      }
    };

    const onMouseLeave = () => {
      setIsOut(true);
    };

    const onMouseEnter = () => {
      setIsOut(false);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseover', onMouseOver);
    document.addEventListener('mouseleave', onMouseLeave);
    document.addEventListener('mouseenter', onMouseEnter);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseover', onMouseOver);
      document.removeEventListener('mouseleave', onMouseLeave);
      document.removeEventListener('mouseenter', onMouseEnter);
    };
  }, []);

  if (!isVisible) return null;

  let cursorClass = '';
  if (isOut) {
    cursorClass = 'out';
  } else if (isHovering) {
    cursorClass = 'large';
  }

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
        ref={cursorRef}
        className={`mouse-pointer ${cursorClass}`}
      />
    </>
  );
}
