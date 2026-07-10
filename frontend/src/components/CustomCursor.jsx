import { useEffect, useRef } from 'react';

export default function CustomCursor() {
  const cursorRef = useRef(null);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(pointer: fine)');
    if (!mediaQuery.matches) return;

    const el = cursorRef.current;
    if (!el) return;

    // Exact JS from thecolourkart.in/public/assets/js/script.js
    const onMouseMove = (n) => {
      el.style.left = n.clientX + "px";
      el.style.top = n.clientY + "px";
    };

    // Their hover logic: buttons, links, .cursor-pointer get "large"
    const onMouseEnterLarge = () => el.classList.add("large");
    const onMouseLeaveLarge = () => el.classList.remove("large");

    const bindHoverTargets = () => {
      document.querySelectorAll("a, button, .cursor-pointer").forEach((t) => {
        t.removeEventListener("mouseenter", onMouseEnterLarge);
        t.removeEventListener("mouseleave", onMouseLeaveLarge);
        t.addEventListener("mouseenter", onMouseEnterLarge);
        t.addEventListener("mouseleave", onMouseLeaveLarge);
      });
    };

    // Their body.out logic for when mouse leaves the window
    const onDocLeave = () => document.body.classList.add("out");
    const onDocEnter = () => document.body.classList.remove("out");

    document.getElementsByTagName("body")[0].addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseleave", onDocLeave);
    document.addEventListener("mouseenter", onDocEnter);

    // Bind once now, then re-bind periodically for dynamically added elements
    bindHoverTargets();
    const observer = new MutationObserver(() => bindHoverTargets());
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      document.getElementsByTagName("body")[0].removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseleave", onDocLeave);
      document.removeEventListener("mouseenter", onDocEnter);
      observer.disconnect();
    };
  }, []);

  // Touch devices: render nothing
  if (typeof window !== 'undefined' && window.matchMedia('(pointer: fine)').matches === false) {
    return null;
  }

  return (
    <>
      <style>{`
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
  z-index: 9999;
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

body.out .mouse-pointer {
  width: 0;
  height: 0;
}

.mouse-pointer.large {
  width: 65px;
  height: 65px;
  background: rgba(224,36,79,.0) !important;
  -webkit-box-shadow: 0 0 30px rgba(224,36,79, 0.4);
  box-shadow: 0 0 30px rgba(224,36,79, 0.4);
}

.touch .mouse-pointer {
  display: none;
}
      `}</style>
      <div ref={cursorRef} className="mouse-pointer" id="mouse-pointer" />
    </>
  );
}
