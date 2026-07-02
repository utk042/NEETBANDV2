import React from 'react';
import { IconPlaylist, IconAlignLeft, IconDownload, IconMusic, IconCheck, IconArrowDown, IconSchool, IconListCheck } from '@tabler/icons-react';

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

  /* ── Lyrics scroll (Lyrics Sync) ───────────────────── */
  .feat-card:hover .lyric-active {
    animation: lyricPulse 1.3s ease-in-out infinite;
  }
  .feat-card:hover .lyric-dim {
    animation: lyricDim 1.3s ease-in-out infinite;
  }
  @keyframes lyricPulse {
    0%, 100% { width: 75%; opacity: 0.9; }
    50%       { width: 100%; opacity: 1; box-shadow: 0 0 12px rgba(201,162,39,0.35); }
  }
  @keyframes lyricDim {
    0%, 100% { opacity: 0.25; }
    50%       { opacity: 0.45; }
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

  /* ── Bar chart grow (CBSE) ─────────────────────────── */
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

  /* ── MCQ option pulse (Integrated MCQs) ────────────── */
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
    .feat-card:hover .lyric-active,
    .feat-card:hover .lyric-dim,
    .feat-card:hover .dl-arrow-icon,
    .feat-card:hover .dl-progress,
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
      


      
      <div className="max-w-container-max mx-auto relative z-10">
        <div className="text-center mb-20" data-gsap="heading">
          <h2 className="font-headline-lg font-bold text-headline-lg-mobile md:text-4xl text-on-surface mb-5 text-balance">Why Listen to Learn?</h2>
          <p className="font-body-md font-normal text-xl text-on-surface-variant max-w-2xl mx-auto opacity-80">Elevate your study routine with tools designed for auditory learners.</p>
        </div>
        
        <div data-gsap="feature-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

          {/* ── 2000+ Songs ─ Animated equalizer ─────────── */}
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
              <h3 className="relative z-10 font-headline-md text-2xl text-on-surface">2000+ Songs</h3>
              <p className="relative z-10 font-body-md text-base text-on-surface-variant leading-relaxed flex-1">Comprehensive coverage of Physics, Chemistry, Biology, and Math.</p>
              {/* Equalizer preview */}
              <div className="relative z-10 w-full mt-4 h-32 bg-surface-container/50 rounded-xl border border-[var(--border-floating-card)] px-4 flex items-end justify-center gap-1 shadow-inner overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent pointer-events-none"></div>
                {[
                  { h: 28 }, { h: 52 }, { h: 36 }, { h: 80 }, { h: 60 }, { h: 24 }, { h: 44 },
                  { h: 68 }, { h: 40 }, { h: 56 }, { h: 32 }, { h: 72 }, { h: 48 },
                ].map((bar, i) => (
                  <div
                    key={i}
                    className="eq-bar w-2.5 bg-primary/75 rounded-t-sm flex-shrink-0"
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
          
          {/* ── Lyrics Sync ─ Scrolling highlight ────────── */}
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
                <IconAlignLeft size={32} className="text-primary" />
              </div>
              <h3 className="relative z-10 font-headline-md text-2xl text-on-surface">Lyrics Sync</h3>
              <p className="relative z-10 font-body-md text-base text-on-surface-variant leading-relaxed flex-1">Follow along in real-time. Highlights key terms and formulas as they play.</p>
              {/* Lyrics preview */}
              <div className="relative z-10 w-full mt-4 h-32 bg-surface-container/50 rounded-xl border border-[var(--border-floating-card)] p-5 flex flex-col justify-center gap-3 shadow-inner overflow-hidden">
                <div className="lyric-dim h-2.5 bg-outline/25 rounded-full" style={{ width: '60%' }}></div>
                <div className="lyric-active h-3.5 bg-primary/50 rounded-full" style={{ width: '75%', willChange: 'width, box-shadow' }}></div>
                <div className="lyric-dim h-2.5 bg-outline/20 rounded-full" style={{ width: '80%', animationDelay: '0.15s' }}></div>
                <div className="lyric-dim h-2.5 bg-outline/15 rounded-full" style={{ width: '45%', animationDelay: '0.3s' }}></div>
              </div>
            </div>
          </div>
          
          {/* ── Offline Downloads ─ Download animation ───── */}
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
              <h3 className="relative z-10 font-headline-md text-2xl text-on-surface">Offline Downloads</h3>
              <p className="relative z-10 font-body-md text-base text-on-surface-variant leading-relaxed flex-1">Save tracks to your device. Study anywhere, without distractions or data.</p>
              {/* Download preview */}
              <div className="relative z-10 w-full mt-4 h-32 bg-surface-container/50 rounded-xl border border-[var(--border-floating-card)] p-4 flex flex-col gap-3 shadow-inner overflow-hidden">
                {/* File row 1 — downloaded */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                      <IconMusic size={14} className="text-primary" />
                    </div>
                    <div className="space-y-1.5">
                      <div className="w-16 h-1.5 bg-outline/30 rounded-full"></div>
                      <div className="w-10 h-1 bg-outline/10 rounded-full"></div>
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
                        <IconArrowDown size={14} stroke={3} className="dl-arrow-icon text-primary" style={{ display: 'inline-block' }} />
                      </div>
                      <div className="space-y-1.5">
                        <div className="w-20 h-1.5 bg-outline/30 rounded-full"></div>
                        <div className="w-12 h-1 bg-outline/10 rounded-full"></div>
                      </div>
                    </div>
                    <span className="text-[9px] text-primary/70 font-medium">Saving…</span>
                  </div>
                  {/* Progress bar */}
                  <div className="w-full h-1 bg-outline/10 rounded-full overflow-hidden ml-11">
                    <div className="dl-progress h-full bg-primary/60 rounded-full" style={{ width: '0%', willChange: 'width' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* ── CBSE 3-12 Aligned ─ Bar chart grow ────────── */}
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
                <IconSchool size={32} className="text-primary" />
              </div>
              <h3 className="relative z-10 font-headline-md text-2xl text-on-surface">CBSE 3-12 Aligned</h3>
              <p className="relative z-10 font-body-md text-base text-on-surface-variant leading-relaxed flex-1">Strictly adheres to the latest NCERT syllabus and board exam patterns.</p>
              {/* Bar chart preview */}
              <div className="relative z-10 w-full mt-4 h-32 bg-surface-container/50 rounded-xl border border-[var(--border-floating-card)] p-4 flex gap-3 shadow-inner items-end overflow-hidden">
                {[
                  { h: 'h-16', color: 'bg-outline/15' },
                  { h: 'h-24', color: 'bg-primary/40', border: 'border-primary/30' },
                  { h: 'h-20', color: 'bg-outline/15' },
                  { h: 'h-12', color: 'bg-outline/10' },
                ].map((bar, i) => (
                  <div
                    key={i}
                    className={`chart-bar flex-1 ${bar.color} rounded-t-lg ${bar.h} border-t border-x ${bar.border || 'border-[var(--border-floating-card)]'} relative overflow-hidden`}
                    style={{ transformOrigin: 'bottom', willChange: 'transform, opacity' }}
                  >
                    {i === 1 && <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-primary/20 to-transparent"></div>}
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* ── Integrated MCQs ─ Option pulse ──────────── */}
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
                  <h3 className="font-headline-md text-2xl text-on-surface mb-3">Integrated MCQs</h3>
                  <p className="font-body-md text-base text-on-surface-variant leading-relaxed">Test your knowledge immediately after listening. Track your mastery over time.</p>
                </div>
                <div className="w-full md:w-1/2 h-48 bg-surface-container-highest/50 rounded-xl border border-outline/10 p-5 flex flex-col justify-between shadow-inner">
                  <div className="w-3/4 h-3 bg-outline/10 rounded-full"></div>
                  {/* Option A — selected, pulses */}
                  <div className="mcq-selected w-full h-10 bg-primary/10 border border-primary/30 rounded-xl flex items-center px-4"
                       style={{ willChange: 'box-shadow, border-color' }}>
                    <div className="mcq-dot w-4 h-4 rounded-full border border-primary mr-3 bg-primary flex-shrink-0"
                         style={{ willChange: 'box-shadow' }}></div>
                    <div className="w-1/2 h-2.5 bg-primary/60 rounded-full"></div>
                  </div>
                  {/* Option B — idle */}
                  <div className="w-full h-10 bg-surface-container rounded-xl flex items-center px-4 border border-transparent">
                    <div className="w-4 h-4 rounded-full border border-outline/30 mr-3 flex-shrink-0"></div>
                    <div className="w-1/3 h-2.5 bg-outline/20 rounded-full"></div>
                  </div>
                  {/* Option C — idle */}
                  <div className="w-full h-10 bg-surface-container rounded-xl flex items-center px-4 border border-transparent">
                    <div className="w-4 h-4 rounded-full border border-outline/30 mr-3 flex-shrink-0"></div>
                    <div className="w-2/5 h-2.5 bg-outline/20 rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
