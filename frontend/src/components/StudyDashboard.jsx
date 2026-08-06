import React from 'react';
import { IconEye, IconBrain, IconMusic, IconListCheck } from '@tabler/icons-react';

export default function StudyDashboard() {
  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    e.currentTarget.style.setProperty('--mouse-x', `${x}px`);
    e.currentTarget.style.setProperty('--mouse-y', `${y}px`);
  };

  return (
    <div className="relative w-full max-w-[400px] h-[420px] mx-auto md:mr-12 -mt-12 z-10 select-none">

      {/* Floating Card 1: Eye-Friendly */}
      <div
        data-gsap="dash-card"
        onMouseMove={handleMouseMove}
        className="absolute top-0 left-[20px] w-[260px] p-5 bg-surface rounded-2xl border border-outline/20 shadow-lg transform -rotate-3 hover:rotate-0 hover:-translate-y-1 transition-all duration-300 group cursor-default z-40"
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
          <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 border border-primary/20">
            <IconEye size={24} />
          </div>
          <div>
            <div data-gsap="stat-number" className="font-headline-md text-xl text-on-surface font-extrabold leading-none">Eye-Friendly</div>
            <div className="text-sm text-on-surface-variant mt-1.5">Reduce Screen Strain</div>
          </div>
        </div>
      </div>

      {/* Floating Card 2: Active Recall */}
      <div
        data-gsap="dash-card"
        onMouseMove={handleMouseMove}
        className="absolute top-[100px] left-[130px] w-[260px] p-5 bg-surface rounded-2xl border border-outline/20 shadow-lg transform rotate-3 hover:rotate-0 hover:-translate-y-1 transition-all duration-300 group cursor-default z-30"
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
          <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 border border-primary/20">
            <IconBrain size={24} />
          </div>
          <div>
            <div data-gsap="stat-number" className="font-headline-md text-2xl text-on-surface font-extrabold leading-none">92%</div>
            <div className="text-sm text-on-surface-variant mt-1.5">Active Recall</div>
          </div>
        </div>
      </div>

      {/* Floating Card 3: 2000+ Study Songs */}
      <div
        data-gsap="dash-card"
        onMouseMove={handleMouseMove}
        className="absolute top-[200px] left-0 w-[260px] p-5 bg-surface rounded-2xl border border-outline/20 shadow-lg transform -rotate-2 hover:rotate-0 hover:-translate-y-1 transition-all duration-300 group cursor-default z-20"
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
          <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 border border-primary/20">
            <IconMusic size={24} />
          </div>
          <div>
            <div data-gsap="stat-number" className="font-headline-md text-2xl text-on-surface font-extrabold leading-none">2000+</div>
            <div className="text-sm text-on-surface-variant mt-1.5">Study Songs & Notes</div>
          </div>
        </div>
      </div>

      {/* Floating Card 4: Test Yourself */}
      <div
        data-gsap="dash-card"
        onMouseMove={handleMouseMove}
        className="absolute top-[300px] left-[70px] w-[260px] p-5 bg-surface rounded-2xl border border-outline/20 shadow-lg transform rotate-3 hover:rotate-0 hover:-translate-y-1 transition-all duration-300 group cursor-default z-10"
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
          <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 border border-primary/20">
            <IconListCheck size={24} />
          </div>
          <div>
            <div data-gsap="stat-number" className="font-headline-md text-xl text-on-surface font-extrabold leading-none">Test Yourself</div>
            <div className="text-sm text-on-surface-variant mt-1.5">Q&As and MCQs</div>
          </div>
        </div>
      </div>
    </div>
  );
}
