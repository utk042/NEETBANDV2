import React, { useRef, useEffect, useState, useCallback } from 'react';
import statsSectionHero from '../assets/stats_section_hero.png';

// Inject the pop keyframe once
const KEYFRAME_ID = 'stat-pop-kf';
if (typeof document !== 'undefined' && !document.getElementById(KEYFRAME_ID)) {
  const s = document.createElement('style');
  s.id = KEYFRAME_ID;
  s.textContent = `
    @keyframes statPop {
      0%   { transform: scale(1); }
      55%  { transform: scale(1.07); }
      100% { transform: scale(1); }
    }
    .stat-pop { animation: statPop 0.38s cubic-bezier(.22,.68,0,1.6) forwards; }
  `;
  document.head.appendChild(s);
}

/**
 * CountUp — animates a number from 0 to `to`.
 * - Only attaches its IntersectionObserver once `appReady` is true.
 * - Uses decimal interpolation so even small integers (e.g. 3) feel animated.
 * - Fires a CSS scale-pop when the final value lands.
 * - `delay` staggers multiple stats so they fire in sequence.
 */
function CountUp({ to, suffix = '', duration = 1600, delay = 0, appReady = false }) {
  const [display, setDisplay] = useState('0');
  const [popped, setPopped] = useState(false);
  const wrapRef = useRef(null);
  const fired = useRef(false);

  const animate = useCallback(() => {
    setTimeout(() => {
      const t0 = performance.now();
      const tick = (now) => {
        const p = Math.min((now - t0) / duration, 1);
        const eased = 1 - (1 - p) ** 4;          // quartic ease-out
        const raw = eased * to;

        // Show one decimal while animating; snap to integer when done
        if (p < 1) {
          setDisplay(raw < 10 ? raw.toFixed(1) : String(Math.round(raw)));
          requestAnimationFrame(tick);
        } else {
          setDisplay(String(to));
          setPopped(true);
          setTimeout(() => setPopped(false), 400);
        }
      };
      requestAnimationFrame(tick);
    }, delay);
  }, [to, duration, delay]);

  useEffect(() => {
    // Don't attach observer until loading screen is gone
    if (!appReady) return;

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || fired.current) return;
        fired.current = true;
        animate();
      },
      { threshold: 0, rootMargin: '0px 0px -80px 0px' }
    );
    if (wrapRef.current) obs.observe(wrapRef.current);
    return () => obs.disconnect();
  }, [appReady, animate]); // re-runs when appReady flips true

  return (
    <span ref={wrapRef} className={popped ? 'stat-pop' : ''} style={{ display: 'inline-block' }}>
      {display}{suffix}
    </span>
  );
}

export default function StatsSection({ appReady = false }) {
  return (
    <section className="relative w-full overflow-hidden" aria-label="Impact statistics" style={{ minHeight: '75vh' }}>

      {/* ── Full-bleed photograph ── */}
      <img
        src={statsSectionHero}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-cover object-center"
        style={{ filter: 'grayscale(18%) contrast(1.05)' }}
        loading="lazy"
      />

      {/* ── Film-grain noise overlay ── */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.06'/%3E%3C/svg%3E")`,
          backgroundSize: '200px 200px',
          opacity: 0.35,
          mixBlendMode: 'overlay',
        }}
      />

      {/* ── Graduated dark scrim — bottom-heavy so text pops ── */}
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(to top, rgba(5,5,8,0.97) 0%, rgba(5,5,8,0.72) 45%, rgba(5,5,8,0.18) 80%, rgba(5,5,8,0.05) 100%)',
        }}
      />
      {/* Left edge fade — bleeds into background on wide screens */}
      <div
        aria-hidden="true"
        className="absolute inset-y-0 left-0 w-1/3 hidden lg:block"
        style={{ background: 'linear-gradient(to right, rgba(5,5,8,0.7), transparent)' }}
      />

      {/* ── Content: anchored to bottom-left ── */}
      <div className="relative z-10 flex flex-col justify-end h-full px-6 md:px-14 lg:px-20 pb-12 md:pb-16 lg:pb-20" style={{ minHeight: '75vh' }}>

        {/* Headline — set at editorial scale, flush left */}
        <h2 className="font-headline-lg font-black text-white leading-[0.92] tracking-tighter mb-8"
          style={{ fontSize: 'clamp(2.6rem, 7vw, 5.5rem)', maxWidth: '14ch' }}>
          Study with your eyes{' '}
          <span className="text-primary italic">closed.</span>
        </h2>

        {/* Stats — horizontal, raw, no containers, no borders */}
        {/* Deliberately misaligned: 3× gets more visual weight via font-size variance */}
        <div className="flex flex-wrap items-end gap-x-10 gap-y-6">

          {/* Stat 1 — dominant weight */}
          <div>
            <p className="font-black text-white leading-none tracking-tighter"
              style={{ fontSize: 'clamp(3rem, 8vw, 6rem)', lineHeight: 1 }}>
              <CountUp to={3} suffix="×" duration={1400} delay={0} appReady={appReady} />
            </p>
            <p className="text-white/55 text-xs font-medium mt-1 uppercase tracking-[0.12em]">
              memory retention
            </p>
          </div>

          {/* Vertical rule — thin, color-accented */}
          <div className="hidden sm:block self-stretch w-px bg-white/15 mx-2" style={{ minHeight: '3.5rem' }} />

          {/* Stat 2 */}
          <div>
            <p className="font-black text-white leading-none"
              style={{ fontSize: 'clamp(2rem, 5vw, 3.75rem)', lineHeight: 1 }}>
              <CountUp to={500} suffix="+" duration={1200} delay={220} appReady={appReady} />
            </p>
            <p className="text-white/55 text-xs font-medium mt-1 uppercase tracking-[0.12em]">
              audio tracks
            </p>
          </div>

          <div className="hidden sm:block self-stretch w-px bg-white/15 mx-2" style={{ minHeight: '3.5rem' }} />

          {/* Stat 3 */}
          <div>
            <p className="font-black text-white leading-none"
              style={{ fontSize: 'clamp(2rem, 5vw, 3.75rem)', lineHeight: 1 }}>
              <CountUp to={12} suffix="k+" duration={1200} delay={440} appReady={appReady} />
            </p>
            <p className="text-white/55 text-xs font-medium mt-1 uppercase tracking-[0.12em]">
              students
            </p>
          </div>
        </div>

        {/* One-line qualifier — set small, not italic, not a quote */}
        <p className="mt-6 text-white/40 text-xs font-medium tracking-wide max-w-[42ch]">
          Auditory encoding fires a memory pathway that works while you commute, rest, or exercise — no screen needed.
        </p>
      </div>
    </section>
  );
}
