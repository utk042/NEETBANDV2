import React from 'react';
import { Link } from 'react-router-dom';
import { IconPlaylist, IconLockOpen, IconDownload, IconMusic, IconCheck, IconArrowDown, IconEyeOff, IconListCheck, IconPlayerPlay, IconSparkles, IconArrowRight } from '@tabler/icons-react';

const previewStyles = `
  /* ── Equalizer (2000+ Songs) ────────────────────────── */
  .feat-card:hover .eq-bar {
    animation: eqPulse var(--eq-dur, 0.55s) ease-in-out infinite alternate;
  }
  .feat-card:hover .eq-bar:nth-child(1)  { --eq-dur: 0.50s; animation-delay: 0.00s; }
  .feat-card:hover .eq-bar:nth-child(2)  { --eq-dur: 0.38s; animation-delay: 0.06s; }
  .feat-card:hover .eq-bar:nth-child(3)  { --eq-dur: 0.60s; animation-delay: 0.12s; }
  .feat-card:hover .eq-bar:nth-child(4)  { --eq-dur: 0.42s; animation-delay: 0.03s; }
  .feat-card:hover .eq-bar:nth-child(5)  { --eq-dur: 0.55s; animation-delay: 0.18s; }
  .feat-card:hover .eq-bar:nth-child(6)  { --eq-dur: 0.35s; animation-delay: 0.09s; }
  .feat-card:hover .eq-bar:nth-child(7)  { --eq-dur: 0.48s; animation-delay: 0.15s; }
  .feat-card:hover .eq-bar:nth-child(8)  { --eq-dur: 0.62s; animation-delay: 0.04s; }
  .feat-card:hover .eq-bar:nth-child(9)  { --eq-dur: 0.40s; animation-delay: 0.20s; }
  .feat-card:hover .eq-bar:nth-child(10) { --eq-dur: 0.52s; animation-delay: 0.08s; }
  .feat-card:hover .eq-bar:nth-child(11) { --eq-dur: 0.44s; animation-delay: 0.16s; }
  .feat-card:hover .eq-bar:nth-child(12) { --eq-dur: 0.58s; animation-delay: 0.02s; }
  .feat-card:hover .eq-bar:nth-child(13) { --eq-dur: 0.46s; animation-delay: 0.13s; }
  @keyframes eqPulse {
    from { transform: scaleY(0.15); }
    to   { transform: scaleY(1); }
  }

  /* ── Free Access Unlocked Player ───────────────────── */
  .feat-card:hover .free-badge {
    animation: freeGlow 1.2s ease-in-out infinite alternate;
  }
  .feat-card:hover .free-wave-bar {
    animation: freeWave var(--fw-dur, 0.5s) ease-in-out infinite alternate;
  }
  .feat-card:hover .free-wave-bar:nth-child(1) { --fw-dur: 0.45s; animation-delay: 0.0s; }
  .feat-card:hover .free-wave-bar:nth-child(2) { --fw-dur: 0.60s; animation-delay: 0.1s; }
  .feat-card:hover .free-wave-bar:nth-child(3) { --fw-dur: 0.35s; animation-delay: 0.2s; }
  .feat-card:hover .free-wave-bar:nth-child(4) { --fw-dur: 0.50s; animation-delay: 0.05s; }
  .feat-card:hover .free-wave-bar:nth-child(5) { --fw-dur: 0.65s; animation-delay: 0.15s; }
  @keyframes freeGlow {
    from { box-shadow: 0 0 4px rgba(201,162,39,0.2); border-color: rgba(201,162,39,0.4); }
    to   { box-shadow: 0 0 14px rgba(201,162,39,0.6); border-color: rgba(201,162,39,0.9); }
  }
  @keyframes freeWave {
    from { transform: scaleY(0.2); }
    to   { transform: scaleY(1); }
  }

  /* ── Download arrow float (Offline) ───────────────── */
  .feat-card:hover .dl-arrow-icon {
    animation: dlFloat 0.7s ease-in-out infinite;
  }
  .feat-card:hover .dl-progress {
    animation: dlFill 1.4s ease-out forwards;
  }
  @keyframes dlFloat {
    0%, 100% { transform: translateY(0); }
    50%       { transform: translateY(4px); }
  }
  @keyframes dlFill {
    from { width: 0%; }
    to   { width: 100%; }
  }

  /* ── Eye-Friendly Screen Off Mode ──────────────────── */
  .feat-card:hover .eye-pulse-ring {
    animation: eyePulseRing 1.8s ease-in-out infinite;
  }
  @keyframes eyePulseRing {
    0%   { transform: scale(0.97); opacity: 0.4; }
    50%  { transform: scale(1.04); opacity: 0.85; box-shadow: 0 0 18px rgba(201,162,39,0.35); }
    100% { transform: scale(0.97); opacity: 0.4; }
  }

  /* ── Bar chart grow (Mastery Tracking) ─────────────── */
  .feat-card:hover .chart-bar {
    animation: chartGrow 0.55s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }
  .feat-card:hover .chart-bar:nth-child(1) { animation-delay: 0.00s; }
  .feat-card:hover .chart-bar:nth-child(2) { animation-delay: 0.08s; }
  .feat-card:hover .chart-bar:nth-child(3) { animation-delay: 0.16s; }
  .feat-card:hover .chart-bar:nth-child(4) { animation-delay: 0.24s; }
  @keyframes chartGrow {
    from { transform: scaleY(0); opacity: 0; }
    to   { transform: scaleY(1); opacity: 1; }
  }

  /* ── MCQ option pulse (Interactive MCQs) ───────────── */
  .feat-card:hover .mcq-selected {
    animation: mcqPulse 1.1s ease-in-out infinite;
  }
  .feat-card:hover .mcq-dot {
    animation: dotPulse 1.1s ease-in-out infinite;
  }
  @keyframes mcqPulse {
    0%, 100% { box-shadow: 0 0 0px rgba(201,162,39,0); border-color: rgba(201,162,39,0.4); }
    50%       { box-shadow: 0 0 18px rgba(201,162,39,0.45); border-color: rgba(201,162,39,0.9); }
  }
  @keyframes dotPulse {
    0%, 100% { box-shadow: 0 0 4px rgba(201,162,39,0.3); }
    50%       { box-shadow: 0 0 14px rgba(201,162,39,0.7); }
  }

  @media (prefers-reduced-motion: reduce) {
    .feat-card:hover .eq-bar,
    .feat-card:hover .free-badge,
    .feat-card:hover .free-wave-bar,
    .feat-card:hover .dl-arrow-icon,
    .feat-card:hover .dl-progress,
    .feat-card:hover .eye-pulse-ring,
    .feat-card:hover .chart-bar,
    .feat-card:hover .mcq-selected,
    .feat-card:hover .mcq-dot {
      animation: none !important;
      transform: none !important;
      box-shadow: none !important;
    }
  }
`;

export default function Features() {
  return (
    <section className="py-32 px-gutter bg-transparent relative overflow-hidden transition-colors duration-300">
      <style>{previewStyles}</style>

      <div className="max-w-container-max mx-auto relative z-10">
        <div className="text-center mb-20" data-gsap="heading">
          <h2 className="font-headline-lg font-bold text-headline-lg-mobile md:text-4xl text-on-surface mb-5 text-balance">Why NEET BAND?</h2>
          <p className="font-body-md font-normal text-xl text-on-surface-variant max-w-2xl mx-auto opacity-80">Elevate your study routine with tools designed for auditory learners.</p>
        </div>
        
        <div data-gsap="feature-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

          {/* ── 1. 2000+ Study Songs & Quick Notes ────────────── */}
          <div data-gsap="feature-card" data-gsap-hover="card" className="feat-card">
            <div
              data-gsap="card-inner"
              className="relative bg-surface-container-low p-10 rounded-2xl border border-outline/20 hover:border-outline/40 transition-colors duration-300 flex flex-col items-start gap-5 shadow-sm h-full overflow-hidden group"
            >
              {/* Hover Glow Effect */}
              <div
                data-gsap="card-glow"
                className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 z-0"
              />
              <div className="relative z-10 w-14 h-14 rounded-xl bg-surface-container border border-[var(--border-floating-card)] flex items-center justify-center shadow-inner">
                <IconPlaylist size={32} className="text-primary" />
              </div>
              <h3 className="relative z-10 font-headline-md text-2xl text-on-surface">2000+ Study Songs & Quick Notes</h3>
              <p className="relative z-10 font-body-md text-base text-on-surface-variant leading-relaxed flex-1">Comprehensive coverage of Physics, Chemistry, Biology, and Math.</p>
              
              {/* Equalizer Spectrum Preview (Pure Visual) */}
              <div className="relative z-10 w-full mt-4 h-32 bg-surface-container/50 rounded-xl border border-[var(--border-floating-card)] px-4 flex items-end justify-center gap-1 shadow-inner overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-primary/10 to-transparent pointer-events-none"></div>
                {[
                  { h: 28 }, { h: 52 }, { h: 36 }, { h: 80 }, { h: 60 }, { h: 24 }, { h: 44 },
                  { h: 68 }, { h: 40 }, { h: 56 }, { h: 32 }, { h: 72 }, { h: 48 },
                ].map((bar, i) => (
                  <div
                    key={i}
                    className="eq-bar w-2 bg-primary/75 rounded-t-sm flex-shrink-0"
                    style={{
                      height: `${bar.h}%`,
                      transformOrigin: 'bottom',
                      willChange: 'transform',
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
          
          {/* ── 2. Free Access to all Study Songs ────────────── */}
          <div data-gsap="feature-card" data-gsap-hover="card" className="feat-card">
            <div
              data-gsap="card-inner"
              className="relative bg-surface-container-low p-10 rounded-2xl border border-outline/20 hover:border-outline/40 transition-colors duration-300 flex flex-col items-start gap-5 shadow-sm h-full overflow-hidden group"
            >
              {/* Hover Glow Effect */}
              <div
                data-gsap="card-glow"
                className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 z-0"
              />
              <div className="relative z-10 w-14 h-14 rounded-xl bg-surface-container border border-[var(--border-floating-card)] flex items-center justify-center shadow-inner">
                <IconLockOpen size={32} className="text-primary" />
              </div>
              <h3 className="relative z-10 font-headline-md text-2xl text-on-surface">Free Access to all Study Songs</h3>
              <p className="relative z-10 font-body-md text-base text-on-surface-variant leading-relaxed flex-1">Listen to curriculum-aligned audio tracks anytime, anywhere without barriers.</p>
              
              {/* Unlocked Audio Player Preview (Pure Visual) */}
              <div className="relative z-10 w-full mt-4 h-32 bg-surface-container/50 rounded-xl border border-[var(--border-floating-card)] p-4 flex items-center justify-between shadow-inner overflow-hidden">
                <div className="flex items-center gap-3 w-full">
                  <div className="free-badge w-10 h-10 rounded-xl bg-primary/10 border border-primary/40 text-primary flex items-center justify-center flex-shrink-0 shadow-inner">
                    <IconLockOpen size={18} />
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="w-3/4 h-2 bg-outline/30 rounded-full"></div>
                    <div className="w-1/2 h-1.5 bg-outline/15 rounded-full"></div>
                  </div>
                  <div className="flex items-end gap-1 h-6 flex-shrink-0 px-2 border-l border-outline/10">
                    {[50, 90, 40, 75, 60].map((h, idx) => (
                      <div key={idx} className="free-wave-bar w-1 bg-primary/80 rounded-t-sm" style={{ height: `${h}%`, transformOrigin: 'bottom' }}></div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* ── 3. Offline Listening & Downloads ──────────────── */}
          <div data-gsap="feature-card" data-gsap-hover="card" className="feat-card">
            <div
              data-gsap="card-inner"
              className="relative bg-surface-container-low p-10 rounded-2xl border border-outline/20 hover:border-outline/40 transition-colors duration-300 flex flex-col items-start gap-5 shadow-sm h-full overflow-hidden group"
            >
              {/* Hover Glow Effect */}
              <div
                data-gsap="card-glow"
                className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 z-0"
              />
              <div className="relative z-10 w-14 h-14 rounded-xl bg-surface-container border border-[var(--border-floating-card)] flex items-center justify-center shadow-inner">
                <IconDownload size={32} className="text-primary" />
              </div>
              <h3 className="relative z-10 font-headline-md text-2xl text-on-surface">
                Offline Listening <span className="block text-lg text-primary font-medium italic mt-1">&amp; Downloads</span>
              </h3>
              <p className="relative z-10 font-body-md text-base text-on-surface-variant leading-relaxed flex-1">
                Save tracks to your device and practice anywhere without internet connection or distractions.
              </p>
              
              {/* Download preview (Pure Visual) */}
              <div className="relative z-10 w-full mt-4 h-32 bg-surface-container/50 rounded-xl border border-[var(--border-floating-card)] p-4 flex flex-col justify-center gap-3 shadow-inner overflow-hidden">
                {/* File row 1 — downloaded */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                      <IconMusic size={14} className="text-primary" />
                    </div>
                    <div className="space-y-1.5">
                      <div className="w-20 h-1.5 bg-outline/30 rounded-full"></div>
                      <div className="w-12 h-1 bg-outline/10 rounded-full"></div>
                    </div>
                  </div>
                  <div className="w-5 h-5 rounded-full border border-primary text-primary flex items-center justify-center flex-shrink-0">
                    <IconCheck size={12} stroke={3} />
                  </div>
                </div>
                
                {/* File row 2 — downloading */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-outline/10 flex items-center justify-center flex-shrink-0">
                        <IconArrowDown size={14} stroke={3} className="dl-arrow-icon text-primary" />
                      </div>
                      <div className="space-y-1.5">
                        <div className="w-24 h-1.5 bg-outline/30 rounded-full"></div>
                        <div className="w-14 h-1 bg-outline/10 rounded-full"></div>
                      </div>
                    </div>
                  </div>
                  {/* Progress bar */}
                  <div className="w-full h-1 bg-outline/10 rounded-full overflow-hidden ml-11">
                    <div className="dl-progress h-full bg-primary/60 rounded-full" style={{ width: '0%', willChange: 'width' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* ── 4. Eye-Friendly Learning ─────────────────────── */}
          <div data-gsap="feature-card" data-gsap-hover="card" className="feat-card">
            <div
              data-gsap="card-inner"
              className="relative bg-gradient-to-br from-surface-container-low to-surface p-10 rounded-2xl border border-[var(--border-floating-card)] hover:border-primary/30 transition-[border-color] duration-300 flex flex-col items-start gap-5 md:col-span-2 lg:col-span-1 shadow-sm h-full overflow-hidden group"
            >
              {/* Hover Glow Effect */}
              <div
                data-gsap="card-glow"
                className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 z-0"
              />
              <div className="relative z-10 w-14 h-14 rounded-xl bg-surface-container border border-[var(--border-floating-card)] flex items-center justify-center shadow-inner">
                <IconEyeOff size={32} className="text-primary" />
              </div>
              <h3 className="relative z-10 font-headline-md text-2xl text-on-surface">
                Eye-Friendly Learning <span className="block text-lg text-primary font-medium italic mt-1">Helps Reduce Screen Strain</span>
              </h3>
              <p className="relative z-10 font-body-md text-base text-on-surface-variant leading-relaxed flex-1">
                Rhythmic audio lessons designed for zero eye fatigue and maximum NCERT retention.
              </p>
              
              {/* Screen Off / Audio Mode Preview (Pure Visual Aura Graphic) */}
              <div className="relative z-10 w-full mt-4 h-32 bg-surface-container/50 rounded-xl border border-[var(--border-floating-card)] p-4 flex items-center justify-center shadow-inner overflow-hidden">
                <div className="eye-pulse-ring relative w-16 h-16 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center text-primary shadow-inner">
                  <div className="absolute inset-0 rounded-full border border-primary/20 animate-ping opacity-25 pointer-events-none"></div>
                  <IconEyeOff size={26} />
                </div>
              </div>
            </div>
          </div>
          
          {/* ── 5. Test Yourself & Track Mastery ────────────── */}
          <div data-gsap="feature-card" data-gsap-hover="card" className="feat-card lg:col-span-2">
            <div
              data-gsap="card-inner"
              className="relative bg-surface-container-low p-10 rounded-2xl border border-outline/20 hover:border-outline/40 transition-colors duration-300 flex flex-col justify-center overflow-hidden shadow-sm h-full group"
            >
              {/* Hover Glow Effect */}
              <div
                data-gsap="card-glow"
                className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 z-0"
              />
              <div className="relative z-10 w-full flex flex-col md:flex-row justify-between items-center gap-10">
                <div className="flex-1">
                  <div className="w-14 h-14 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-6 shadow-inner">
                    <IconListCheck size={32} className="text-primary" />
                  </div>
                  <h3 className="font-headline-md text-2xl text-on-surface mb-3">
                    Test Yourself &amp; Track Mastery
                  </h3>
                  <p className="font-body-md text-base text-on-surface-variant leading-relaxed mb-6">
                    Test your knowledge immediately after listening. Practice Q&amp;As and track your subject mastery over time.
                  </p>
                  <Link
                    to="/pricing"
                    className="inline-flex items-center gap-2.5 px-6 py-3 rounded-xl bg-primary text-on-primary-fixed font-semibold text-sm hover:bg-primary-fixed hover:shadow-lg hover:shadow-primary/25 transition-all duration-300 group/btn"
                  >
                    <span>View Pricing Plans</span>
                    <IconArrowRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />
                  </Link>
                </div>

                
                {/* MCQ + Mastery Chart Preview (Unified Pure Visual) */}
                <div className="w-full md:w-1/2 h-44 bg-surface-container-highest/50 rounded-xl border border-outline/10 p-4 flex items-center gap-4 shadow-inner">
                  {/* Left: MCQ choices */}
                  <div className="flex-1 space-y-2">
                    <div className="w-full h-2 bg-outline/20 rounded-full"></div>
                    <div className="mcq-selected w-full h-7 bg-primary/10 border border-primary/30 rounded-lg flex items-center px-2.5">
                      <div className="mcq-dot w-2.5 h-2.5 rounded-full border border-primary mr-2 bg-primary flex-shrink-0"></div>
                      <div className="w-3/4 h-1.5 bg-primary/60 rounded-full"></div>
                    </div>
                    <div className="w-full h-7 bg-surface-container rounded-lg flex items-center px-2.5">
                      <div className="w-2.5 h-2.5 rounded-full border border-outline/30 mr-2 flex-shrink-0"></div>
                      <div className="w-1/2 h-1.5 bg-outline/20 rounded-full"></div>
                    </div>
                  </div>
                  
                  {/* Divider */}
                  <div className="w-px h-28 bg-outline/10"></div>
                  
                  {/* Right: Mastery Chart */}
                  <div className="w-24 h-28 flex items-end justify-between gap-1.5 pb-1">
                    {[
                      { h: 'h-8', color: 'bg-outline/15' },
                      { h: 'h-14', color: 'bg-outline/20' },
                      { h: 'h-20', color: 'bg-primary/50', border: 'border-primary/40' },
                      { h: 'h-24', color: 'bg-primary', border: 'border-primary' },
                    ].map((bar, i) => (
                      <div
                        key={i}
                        className={`chart-bar flex-1 ${bar.color} rounded-t-md ${bar.h} border-t border-x ${bar.border || 'border-[var(--border-floating-card)]'} relative overflow-hidden`}
                        style={{ transformOrigin: 'bottom', willChange: 'transform, opacity' }}
                      >
                        {i === 3 && <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-primary/30 to-transparent"></div>}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* ── Report Error Notice ─────────────────────────── */}
        <div className="mt-16 text-center border-t border-outline/10 pt-10">
          <p className="font-body-md text-sm md:text-base text-on-surface-variant/80 max-w-2xl mx-auto">
            Found an error in a study song or note?{' '}
            <Link 
              to="/contact" 
              className="text-primary font-semibold underline underline-offset-4 hover:text-primary-fixed transition-colors"
            >
              Report it here
            </Link>{' '}
            so we can review and correct it.
          </p>
        </div>
      </div>
    </section>
  );
}


