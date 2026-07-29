import React from 'react';
import { IconPlayerPlayFilled, IconPlayerPauseFilled, IconPlayerSkipBackFilled, IconPlayerSkipForwardFilled, IconHeart, IconAlertTriangle, IconRotate, IconLoader2 } from '@tabler/icons-react';
import logoImg from '../assets/logo.png';
import HeartButton from './Common/HeartButton';
import { usePlayer } from '../contexts/PlayerContext';
import { useLyrics } from '../hooks/useLyrics';

export default function MobilePlayer({ onOpenFullPlayer }) {
  const {
    currentTrack, globalTracks, isAnyAudioActive, currentTime, duration, togglePlay, handleNext, handlePrev, handleSeek, favoritedTrackIds, toggleFavorite,
    playbackError, retryPlayback, isAudioRollActive, activeRollType, isPlayingAd, adConfig, isBuffering
  } = usePlayer();

  const displayTrack = currentTrack || (globalTracks && globalTracks.length > 0 ? globalTracks[0] : {
    title: "No Track Selected",
    chapter: "Select a track to start listening",
    cover: logoImg,
    durationSeconds: 0
  });

  const currentSeconds = currentTime || 0;
  const totalSeconds = (currentTrack && duration > 0) ? duration : (displayTrack.durationSeconds || 0);
  const progressPercent = totalSeconds > 0 ? Math.min((currentSeconds / totalSeconds) * 100, 100) : 0;

  const { activeLyric } = useLyrics(displayTrack?.lyricsUrl, currentSeconds);

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
          if (!rect || rect.width <= 0) return;
          const pct = (e.clientX - rect.left) / rect.width;
          if (isNaN(pct) || !isFinite(pct)) return;
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
            <span 
              className={`font-label-sm text-[10px] truncate ${playbackError ? 'text-red-500 font-medium' : (isPlayingAd || isAudioRollActive) ? 'text-amber-600 dark:text-amber-400 font-bold animate-pulse' : 'text-on-surface-variant opacity-70'}`}
              style={(isPlayingAd || isAudioRollActive) && adConfig?.adTextColor ? { color: adConfig.adTextColor } : undefined}
            >
              {playbackError ? (
                <span className="flex items-center gap-1">
                  <IconAlertTriangle size={12} className="shrink-0" />
                  Playback error • Tap to retry
                </span>
              ) : (isPlayingAd || isAudioRollActive) ? (
                activeRollType === 'guestAd' 
                  ? 'Guest Roll Playing' 
                  : (adConfig?.adBannerText || 'Study without interruptions. Upgrade to Premium for an ad-free experience.')
              ) : activeLyric ? (
                <span className="text-primary/95 italic font-medium truncate pr-2.5 inline-block">{activeLyric}</span>
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
            aria-label={playbackError ? 'Retry' : isAnyAudioActive ? 'Pause' : 'Play'}
          >
            {playbackError ? (
              <IconRotate size={24} className="text-red-500" aria-hidden="true" />
            ) : isBuffering ? (
              <IconLoader2 size={24} className="text-primary animate-spin" aria-hidden="true" />
            ) : isAnyAudioActive ? (
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
