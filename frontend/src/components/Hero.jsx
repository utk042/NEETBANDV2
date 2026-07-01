import React from 'react';
import { IconArrowRight } from '@tabler/icons-react';
import StudyDashboard from './StudyDashboard';
import heroVideo from '../assets/vid1.mp4';

export default function Hero({ currentTrack, isPlaying, togglePlay, onUpgradeClick }) {
  return (
    <section className="relative min-h-[100dvh] flex items-center justify-center overflow-hidden w-full pt-40 pb-44 md:pb-60">
      {/* Background Video */}
      <div className="absolute inset-0 z-0" data-gsap="hero-bg">
        <video 
          src={heroVideo}
          autoPlay
          loop
          muted
          playsInline
          width={1920}
          height={1080}
          className="object-cover w-full h-full opacity-[var(--bg-opacity-hero)] mix-blend-[var(--bg-blend-hero)] transition-[opacity] duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-surface/20 via-surface/65 to-surface"></div>
      </div>
      
      <div className="relative z-10 max-w-container-max mx-auto px-gutter w-full grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-24 items-center">
        <div className="space-y-8 max-w-2xl pt-20 md:pt-10" data-gsap="hero-text">
          <h1 className="font-display-lg font-extrabold text-4xl sm:text-5xl md:text-[56px] md:leading-[1.1] text-on-surface text-balance leading-tight">
            Study Smarter. <br/>
            <span className="text-primary">Remember</span> More.
          </h1>
          
          <p className="font-body-lg font-normal text-on-surface-variant max-w-xl text-lg opacity-80">
            Curriculum-aligned study songs designed to boost retention and reduce eye strain. Turn hours of reading into minutes of listening.
          </p>
          
          <div className="pt-4">
            <button className="group bg-primary hover:bg-primary-fixed hover:text-on-primary-fixed text-on-primary font-label-md px-8 py-4 rounded-xl transition-[colors,box-shadow,transform] duration-200 shadow-sm hover:shadow-md active:scale-[0.98] active:translate-y-[1px] flex items-center justify-center gap-2 hover:-translate-y-0.5 inline-flex w-full sm:w-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50">
              Start Listening <IconArrowRight size={20} className="transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
            </button>
          </div>
        </div>
        
        <div className="hidden md:flex justify-end relative">
          <StudyDashboard />
        </div>
      </div>
    </section>
  );
}
