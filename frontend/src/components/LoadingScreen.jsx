import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import logoImg from '../assets/logo.png';

export default function LoadingScreen({ onComplete }) {
  const overlayRef = useRef(null);
  const logoRef = useRef(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      onComplete();
      return;
    }

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        onComplete: () => {
          onComplete();
        }
      });

      // Start hidden and slightly scaled down
      gsap.set(logoRef.current, {
        opacity: 0,
        scale: 0.92,
      });

      // Step 1: Smooth fade and scale in
      tl.to(logoRef.current, {
        opacity: 1,
        scale: 1,
        duration: 0.8,
        ease: 'power3.out',
      })
      // Step 2: Brief elegant pause
      .to({}, { duration: 0.5 })
      // Step 3: Fade out and scale up slightly (dissolve effect)
      .to(logoRef.current, {
        opacity: 0,
        scale: 1.05,
        duration: 0.4,
        ease: 'power2.in',
      })
      // Step 4: Fade overlay out smoothly to unblur and reveal page content
      .to(overlayRef.current, {
        opacity: 0,
        duration: 0.6,
        ease: 'power2.out',
      }, "-=0.2");
    }, overlayRef);

    return () => ctx.revert();
  }, [onComplete]);

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-loading flex flex-col items-center justify-center bg-background/80 backdrop-blur-xl"
      aria-live="polite"
      aria-busy="true"
    >
      {/* Minimal Logo Only */}
      <div ref={logoRef} className="flex items-center justify-center px-4">
        <img
          src={logoImg}
          alt="NeetBand Logo"
          className="h-28 md:h-32 w-auto object-contain"
          width={512}
          height={236}
        />
      </div>
    </div>
  );
}


