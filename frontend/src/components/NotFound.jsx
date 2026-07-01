import React from 'react';
import { IconMusicOff, IconArrowLeft } from '@tabler/icons-react';

export default function NotFound({ setCurrentPage }) {
  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center bg-background text-on-background px-4 relative overflow-hidden">
      
      {/* Background Decorative Elements */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[100px] pointer-events-none"></div>
      
      <div className="relative z-10 text-center flex flex-col items-center max-w-2xl">
        <div className="w-24 h-24 bg-surface rounded-3xl flex items-center justify-center mb-8 shadow-xl shadow-black/5 border border-outline-variant/30 text-primary animate-bounce-slow">
          <IconMusicOff size={48} stroke={1.5} />
        </div>
        
        <h1 className="text-8xl md:text-[120px] font-black tracking-tighter mb-4 text-transparent bg-clip-text bg-gradient-to-br from-on-background to-on-background/40">
          404
        </h1>
        
        <h2 className="text-2xl md:text-3xl font-bold mb-4 text-on-surface">
          Page Not Found
        </h2>
        
        <p className="text-on-surface-variant text-lg mb-10 max-w-md mx-auto">
          Oops! Looks like this track is missing from our playlist. The page you're looking for doesn't exist or has been moved.
        </p>
        
        <button
          onClick={() => setCurrentPage('home')}
          className="flex items-center gap-2 bg-primary text-on-primary px-8 py-4 rounded-full font-bold text-lg hover:scale-105 hover:shadow-[0_0_20px_rgba(var(--color-primary),0.4)] transition-all duration-300"
        >
          <IconArrowLeft size={24} />
          Back to Home
        </button>
      </div>
    </div>
  );
}
