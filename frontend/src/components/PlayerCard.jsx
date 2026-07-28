import React from 'react';
import { IconActivity, IconPlayerSkipBackFilled, IconPlayerPlayFilled, IconPlayerPauseFilled, IconPlayerSkipForwardFilled } from '@tabler/icons-react';
import logoImg from '../assets/logo.png';
import { usePlayer } from '../contexts/PlayerContext';

export default function PlayerCard() {
  const { currentTrack, isAnyAudioActive, togglePlay, handleNext, handlePrev } = usePlayer();

  // Fallback when no track is selected
  const displayTrack = currentTrack || {
    title: "No Track Selected",
    chapter: "Select a track to start listening",
    cover: logoImg,
    premium: false
  };

  const waveformBars = [30, 50, 100, 60, 40, 70, 30, 50, 80, 40, 20, 60];

  return (
    <>
      <style>{`
        @keyframes cardWave {
          0%   { transform: scaleY(0.3) }
          50%  { transform: scaleY(1.0) }
          100% { transform: scaleY(0.4) }
        }
        .card-wave-active {
          animation: cardWave var(--dur, 1s) ease-in-out infinite alternate;
          animation-delay: var(--delay, 0s);
          transform-origin: bottom;
        }
        .card-wave-paused {
          transform: scaleY(0.4);
          transform-origin: bottom;
          transition: transform 0.3s ease-out;
        }
      `}</style>
      <div className="glass-panel p-6 rounded-2xl w-[340px] shadow-[var(--shadow-floating-card)] relative transform hover:-translate-y-2 transition-all duration-500 border border-[var(--border-floating-card)] glow-hover bg-surface">
        <div className="absolute -top-4 -right-4 bg-primary text-on-primary p-3 rounded-full shadow-[0_0_20px_rgba(201,162,39,0.3)] flex items-center justify-center">
          <IconActivity size={24} className={isAnyAudioActive ? "animate-pulse" : ""} aria-hidden="true" />
        </div>
        
        <div className="w-full h-48 bg-surface-container-highest rounded-xl mb-6 overflow-hidden relative shadow-inner border border-[var(--border-floating-card)]">
          <img 
            className={`w-full h-full opacity-90 hover:scale-105 transition-transform duration-700 ${(!displayTrack.cover || displayTrack.cover === logoImg) ? 'object-contain p-4 bg-black/20' : 'object-cover object-center'}`} 
            alt={displayTrack.title}
            src={displayTrack.cover || logoImg}
            onError={(e) => { e.target.onerror = null; e.target.src = logoImg; e.target.className = 'w-full h-full opacity-90 hover:scale-105 transition-transform duration-700 object-contain p-4 bg-black/20'; }}
            width={292}
            height={192}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-surface/80 to-transparent pointer-events-none"></div>
        </div>
        
        <div className="flex justify-between items-start mb-4">
          <div className="min-w-0 flex-1">
            <h3 className="font-headline-md text-xl text-on-surface truncate font-bold">{displayTrack.title}</h3>
            <p className="font-body-md text-sm text-primary/80 mt-1">{displayTrack.chapter}</p>
          </div>
        </div>
        
        {/* Animated Waveform */}
        <div className="flex items-end gap-[3px] h-10 mb-6 opacity-80" aria-hidden="true">
          {waveformBars.map((height, i) => {
            const dur = `${0.6 + (i % 4) * 0.15}s`;
            const delay = `${-((i * 0.12) % 0.8)}s`;
            return (
              <div
                key={i}
                className={`flex-1 bg-primary rounded-full ${
                  isAnyAudioActive ? 'card-wave-active' : 'card-wave-paused'
                }`}
                style={{
                  height: `${height}%`,
                  '--dur': dur,
                  '--delay': delay
                }}
              />
            );
          })}
        </div>
        
        <div className="flex items-center justify-between px-2">
          <button 
            onClick={() => currentTrack && handlePrev()}
            disabled={!currentTrack}
            className={`text-on-surface-variant transition-colors p-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded-full flex items-center justify-center ${!currentTrack ? 'opacity-40 cursor-not-allowed' : 'hover:text-primary'}`} 
            aria-label="Previous Track"
          >
            <IconPlayerSkipBackFilled size={28} className="block" />
          </button>
          <button 
            onClick={() => currentTrack && togglePlay()}
            disabled={!currentTrack}
            className={`bg-primary text-on-primary rounded-full w-16 h-16 flex items-center justify-center transition-transform shadow-[0_0_20px_rgba(201,162,39,0.4)] flex-shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 ${!currentTrack ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110'}`}
            aria-label={isAnyAudioActive ? 'Pause' : 'Play'}
          >
            {isAnyAudioActive ? (
              <IconPlayerPauseFilled size={32} className="text-on-primary" aria-hidden="true" />
            ) : (
              <IconPlayerPlayFilled size={32} className="text-on-primary translate-x-[2px]" aria-hidden="true" />
            )}
          </button>
          <button 
            onClick={() => currentTrack && handleNext()}
            disabled={!currentTrack}
            className={`text-on-surface-variant transition-colors p-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded-full flex items-center justify-center ${!currentTrack ? 'opacity-40 cursor-not-allowed' : 'hover:text-primary'}`} 
            aria-label="Next Track"
          >
            <IconPlayerSkipForwardFilled size={28} className="block" />
          </button>
        </div>
      </div>
    </>
  );
}

