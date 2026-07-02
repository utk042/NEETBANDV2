import React from 'react';
import { IconPlayerPlayFilled, IconPlayerPauseFilled, IconPlayerSkipBackFilled, IconPlayerSkipForwardFilled, IconHeart } from '@tabler/icons-react';
import defaultCover from '../assets/mendelian_genetics_anthem.png';
import { usePlayer } from '../contexts/PlayerContext';

export default function MobilePlayer({ onOpenFullPlayer }) {
  const {
    currentTrack, isPlaying, currentTime, togglePlay, handleNext, handlePrev, handleSeek, favoritedTrackIds, toggleFavorite
  } = usePlayer();

  const displayTrack = currentTrack || {
    title: "Mendelian Genetics Anthem",
    chapter: "Biology • Genetics & Evolution",
    cover: defaultCover,
    durationSeconds: 260
  };

  const currentSeconds = currentTime || 0;
  const totalSeconds = displayTrack.durationSeconds || 260;
  const progressPercent = Math.min((currentSeconds / totalSeconds) * 100, 100);

  const handleWrapperKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onOpenFullPlayer?.();
    }
  };

  const isFav = favoritedTrackIds?.includes(displayTrack.id || displayTrack._id);

  return (
    <div 
      role="button"
      aria-label="Open Full Screen Player"
      tabIndex={0}
      onClick={onOpenFullPlayer}
      onKeyDown={handleWrapperKeyDown}
      className="fixed bottom-20 left-0 w-full z-player-mobile bg-background/85 backdrop-blur-md border-t border-[var(--border-nav-bar)] md:hidden shadow-[0_-8px_30px_rgba(0,0,0,0.04)] dark:shadow-[0_-8px_30px_rgba(0,0,0,0.2)] transition-all duration-300 cursor-pointer hover:bg-background/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
    >
      {/* Progress Bar */}
      <div 
        className="w-full h-1 bg-surface-container-highest cursor-pointer" 
        role="progressbar" 
        aria-valuenow={progressPercent} 
        aria-valuemin="0" 
        aria-valuemax="100" 
        aria-label="Audio progress"
        onClick={(e) => {
          e.stopPropagation();
          const rect = e.currentTarget.getBoundingClientRect();
          const pct = (e.clientX - rect.left) / rect.width;
          handleSeek(Math.max(0, Math.min(pct * totalSeconds, totalSeconds)));
        }}
      >
        <div 
          className="h-full bg-primary shadow-[0_0_8px_rgba(201,162,39,0.5)] transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        ></div>
      </div>
      
      <div className="flex items-center justify-between px-4 py-3 gap-4">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-10 h-10 rounded bg-surface-container-highest overflow-hidden flex-shrink-0 border border-[var(--border-floating-card)]">
            <img alt={displayTrack.title} className="w-full h-full object-cover" src={displayTrack.cover || defaultCover} width={40} height={40} onError={(e) => { e.target.onerror = null; e.target.src = defaultCover; }} />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-headline-md text-label-md text-on-surface truncate">{displayTrack.title}</span>
            <span className="font-label-sm text-[10px] text-on-surface-variant opacity-70 truncate">{displayTrack.chapter}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Favorite button — hidden on extra-narrow mobile screens (<375px) to prevent title text clipping */}
          <button 
            onClick={(e) => { e.stopPropagation(); toggleFavorite?.(displayTrack.id || displayTrack._id); }}
            className={`w-11 h-11 hidden min-[375px]:flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded-full ${isFav ? 'text-primary' : 'text-on-surface hover:text-primary'}`}
            aria-label={isFav ? "Remove from favorites" : "Add to favorites"}
          >
            <IconHeart size={24} className={`block ${isFav ? 'fill-current' : ''}`} />
          </button>
          
          <button 
            onClick={(e) => { e.stopPropagation(); togglePlay(); }}
            className="w-11 h-11 flex items-center justify-center text-on-surface hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded-full"
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <IconPlayerPauseFilled size={24} className="text-on-surface" aria-hidden="true" />
            ) : (
              <IconPlayerPlayFilled size={24} className="text-on-surface" aria-hidden="true" />
            )}
          </button>
          
          <button 
            onClick={(e) => { e.stopPropagation(); handleNext(); }}
            className="w-11 h-11 flex items-center justify-center text-on-surface hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded-full"
            aria-label="Next Track"
          >
            <IconPlayerSkipForwardFilled size={24} className="block text-on-surface" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}
