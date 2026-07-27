import React from 'react';
import { IconPlayerPlayFilled, IconPlayerPauseFilled, IconPlayerSkipBackFilled, IconPlayerSkipForwardFilled, IconHeart, IconAlertTriangle, IconRotate } from '@tabler/icons-react';
import logoImg from '../assets/logo.png';
import HeartButton from './Common/HeartButton';
import { usePlayer } from '../contexts/PlayerContext';

export default function MobilePlayer({ onOpenFullPlayer }) {
  const {
    currentTrack, globalTracks, isPlaying, currentTime, togglePlay, handleNext, handlePrev, handleSeek, favoritedTrackIds, toggleFavorite,
    playbackError, retryPlayback
  } = usePlayer();

  const displayTrack = currentTrack || (globalTracks && globalTracks.length > 0 ? globalTracks[0] : {
    title: "No Track Selected",
    chapter: "Select a track to start listening",
    cover: logoImg,
    durationSeconds: 0
  });

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
            <img alt={displayTrack.title} className={`w-full h-full ${(!displayTrack.cover || displayTrack.cover === logoImg) ? 'object-contain p-1 bg-black/20' : 'object-cover'}`} src={displayTrack.cover || logoImg} width={40} height={40} onError={(e) => { e.target.onerror = null; e.target.src = logoImg; e.target.className = 'w-full h-full object-contain p-1 bg-black/20'; }} />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-headline-md text-label-md text-on-surface truncate">{displayTrack.title}</span>
            <span className={`font-label-sm text-[10px] truncate ${playbackError ? 'text-red-500 font-medium' : 'text-on-surface-variant opacity-70'}`}>
              {playbackError ? (
                <span className="flex items-center gap-1">
                  <IconAlertTriangle size={12} className="shrink-0" />
                  Playback error • Tap to retry
                </span>
              ) : displayTrack.chapter}
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Favorite button — hidden on extra-narrow mobile screens (<375px) to prevent title text clipping */}
          <HeartButton
            isFavorited={isFav}
            onToggle={() => toggleFavorite?.(displayTrack.id || displayTrack._id)}
            size={24}
            className="w-11 h-11 hidden min-[375px]:flex"
            activeColorClass="text-primary"
            inactiveColorClass="text-on-surface hover:text-primary"
          />
          
          <button 
            onClick={(e) => { e.stopPropagation(); playbackError ? retryPlayback?.() : togglePlay(); }}
            className="w-11 h-11 flex items-center justify-center text-on-surface hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded-full"
            aria-label={playbackError ? 'Retry' : isPlaying ? 'Pause' : 'Play'}
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
