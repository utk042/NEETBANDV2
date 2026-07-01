import React from 'react';
import { IconBolt, IconBrain, IconMusic } from '@tabler/icons-react';

export default function StudyDashboard() {
  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    e.currentTarget.style.setProperty('--mouse-x', `${x}px`);
    e.currentTarget.style.setProperty('--mouse-y', `${y}px`);
  };

  return (
    <div className="relative w-full max-w-[360px] h-[320px] mx-auto md:mr-0 z-10 select-none">

      {/* Floating Card 1: Speed */}
      <div
        data-gsap="dash-card"
        onMouseMove={handleMouseMove}
        className="absolute top-0 left-0 w-[210px] p-4 bg-surface rounded-2xl border border-outline/20 shadow-md transform -rotate-3 hover:rotate-0 hover:-translate-y-1 transition-all duration-300 group cursor-default"
      >
        {/* Background Glow Container */}
        <div className="pointer-events-none absolute inset-0 rounded-2xl overflow-hidden z-0">
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{
              background: 'radial-gradient(160px circle at var(--mouse-x, 0px) var(--mouse-y, 0px), rgb(var(--color-primary-container) / 0.18), transparent 80%)'
            }}
          />
        </div>
        <div className="relative z-10 flex items-center gap-4 w-full h-full">
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 border border-primary/20">
            <IconBolt size={20} />
          </div>
          <div>
            <div data-gsap="stat-number" className="font-headline-md text-lg text-on-surface font-extrabold leading-none">4.8x</div>
            <div className="text-[11px] text-on-surface-variant mt-1">Faster Learning</div>
          </div>
        </div>
      </div>

      {/* Floating Card 2: Retention */}
      <div
        data-gsap="dash-card"
        onMouseMove={handleMouseMove}
        className="absolute top-[90px] right-0 w-[210px] p-4 bg-surface rounded-2xl border border-outline/20 shadow-md transform rotate-3 hover:rotate-0 hover:-translate-y-1 transition-all duration-300 group cursor-default"
      >
        {/* Background Glow Container */}
        <div className="pointer-events-none absolute inset-0 rounded-2xl overflow-hidden z-0">
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{
              background: 'radial-gradient(160px circle at var(--mouse-x, 0px) var(--mouse-y, 0px), rgb(var(--color-primary-container) / 0.18), transparent 80%)'
            }}
          />
        </div>
        <div className="relative z-10 flex items-center gap-4 w-full h-full">
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 border border-primary/20">
            <IconBrain size={20} />
          </div>
          <div>
            <div data-gsap="stat-number" className="font-headline-md text-lg text-on-surface font-extrabold leading-none">92%</div>
            <div className="text-[11px] text-on-surface-variant mt-1">Active Recall</div>
          </div>
        </div>
      </div>

      {/* Floating Card 3: Library */}
      <div
        data-gsap="dash-card"
        onMouseMove={handleMouseMove}
        className="absolute top-[180px] left-[20px] w-[210px] p-4 bg-surface rounded-2xl border border-outline/20 shadow-md transform -rotate-2 hover:rotate-0 hover:-translate-y-1 transition-all duration-300 group cursor-default"
      >
        {/* Background Glow Container */}
        <div className="pointer-events-none absolute inset-0 rounded-2xl overflow-hidden z-0">
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{
              background: 'radial-gradient(160px circle at var(--mouse-x, 0px) var(--mouse-y, 0px), rgb(var(--color-primary-container) / 0.18), transparent 80%)'
            }}
          />
        </div>
        <div className="relative z-10 flex items-center gap-4 w-full h-full">
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 border border-primary/20">
            <IconMusic size={20} />
          </div>
          <div>
            <div data-gsap="stat-number" className="font-headline-md text-lg text-on-surface font-extrabold leading-none">2000+</div>
            <div className="text-[11px] text-on-surface-variant mt-1">Study Songs</div>
          </div>
        </div>
      </div>
    </div>
  );
}
