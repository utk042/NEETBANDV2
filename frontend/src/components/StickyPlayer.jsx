import React from 'react';
import { IconVolume, IconPlayerSkipBackFilled, IconPlayerPlayFilled, IconPlayerPauseFilled, IconPlayerSkipForwardFilled, IconHeart } from '@tabler/icons-react';
import defaultCover from '../assets/dna_replication_thumbnail.png';

export default function StickyPlayer({ currentTrack, isPlaying, togglePlay, currentTime, onNext, onPrev, onSeek, favoritedTrackIds, onToggleFavorite, onOpenFullPlayer }) {
  const displayTrack = currentTrack || {
    title: "DNA Replication Mnemonic",
    chapter: "Molecular Basis of Inheritance",
    cover: defaultCover,
    duration: "6:12",
    durationSeconds: 372
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const currentSeconds = currentTime || 0;
  const totalSeconds = displayTrack.durationSeconds || 372;
  const progressPercent = Math.min((currentSeconds / totalSeconds) * 100, 100);

  const handleScrub = (e) => {
    if (!onSeek) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const newPercent = clickX / width;
    const newTime = Math.floor(newPercent * totalSeconds);
    onSeek(Math.max(0, Math.min(newTime, totalSeconds)));
  };

  const handleKeyDown = (e) => {
    if (!onSeek) return;
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      onSeek(Math.min(currentSeconds + 5, totalSeconds));
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      onSeek(Math.max(currentSeconds - 5, 0));
    }
  };

  return (
    <section 
      onClick={onOpenFullPlayer}
      className="fixed bottom-0 left-0 w-full z-[45] bg-surface/85 backdrop-blur-md border-t border-outline/20 hidden md:block shadow-[0_-8px_30px_rgba(0,0,0,0.04)] dark:shadow-[0_-8px_30px_rgba(0,0,0,0.2)] transition-all duration-300 fixed-bottom-safe cursor-pointer hover:bg-surface/90"
    >
      {/* Progress Scrubber */}
      <div 
        role="slider"
        aria-label="Progress scrubber"
        aria-valuenow={currentSeconds}
        aria-valuemin="0"
        aria-valuemax={totalSeconds}
        aria-valuetext={`${formatTime(currentSeconds)} of ${displayTrack.duration}`}
        tabIndex={0}
        onClick={(e) => { e.stopPropagation(); handleScrub(e); }}
        onKeyDown={handleKeyDown}
        className="w-full h-1.5 bg-surface-container-highest absolute top-0 left-0 cursor-pointer group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
      >
        <div 
          className="h-full bg-gradient-to-r from-primary to-primary-container relative group-hover:h-2 transition-all"
          style={{ width: `${progressPercent}%` }}
        >
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-[0_0_10px_rgba(201,162,39,0.5)] opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity border border-[var(--border-floating-card)]"></div>
        </div>
      </div>
      
      <div className="max-w-container-max mx-auto px-gutter h-24 flex items-center justify-between">
        {/* Track info */}
        <div className="flex items-center gap-4 w-1/3 min-w-0">
          <div className="w-14 h-14 bg-surface-container rounded-lg overflow-hidden shadow-sm border border-[var(--border-floating-card)] flex-shrink-0">
            <img className="object-cover w-full h-full" alt={displayTrack.title} src={displayTrack.cover} width={56} height={56}/>
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-headline-md text-base text-on-surface font-bold truncate">{displayTrack.title}</span>
            <span className="font-label-sm text-sm text-primary/80 mt-0.5">
              {formatTime(currentSeconds)} / {displayTrack.duration}
            </span>
          </div>
        </div>
        
        {/* Chapter/Middle Lyric */}
        <div className="w-1/3 flex justify-center text-center">
          <p className="font-body-md text-base text-primary/90 italic truncate max-w-sm">
            {isPlaying ? `"Playing: ${displayTrack.title}"` : '"Welcome to NeetBand player!"'}
          </p>
        </div>
        
        {/* Controls */}
        <div className="w-1/3 flex justify-end items-center gap-6">
          <button 
            onClick={(e) => { e.stopPropagation(); onToggleFavorite?.(displayTrack.id); }}
            className={`transition-colors p-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded-full flex items-center justify-center ${favoritedTrackIds?.includes(displayTrack.id) ? 'text-primary' : 'text-on-surface-variant hover:text-primary'}`} 
            aria-label={favoritedTrackIds?.includes(displayTrack.id) ? "Remove from favorites" : "Add to favorites"}
          >
            <IconHeart size={24} className={`block ${favoritedTrackIds?.includes(displayTrack.id) ? 'fill-current' : ''}`} />
          </button>
          <button 
            onClick={(e) => e.stopPropagation()} 
            className="text-on-surface-variant hover:text-primary transition-colors p-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded-full flex items-center justify-center" 
            aria-label="Mute/Unmute"
          >
            <IconVolume size={24} className="block" />
          </button>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={(e) => { e.stopPropagation(); onPrev(); }}
              className="text-on-surface-variant hover:text-primary transition-colors p-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded-full flex items-center justify-center" 
              aria-label="Previous Track"
            >
              <IconPlayerSkipBackFilled size={28} className="block" />
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); togglePlay(); }}
              className="bg-primary text-on-primary rounded-full w-12 h-12 flex items-center justify-center hover:scale-110 transition-transform shadow-sm flex-shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <IconPlayerPauseFilled size={28} className="text-on-primary" aria-hidden="true" />
              ) : (
                <IconPlayerPlayFilled size={28} className="text-on-primary translate-x-[1.5px]" aria-hidden="true" />
              )}
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); onNext(); }}
              className="text-on-surface-variant hover:text-primary transition-colors p-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded-full flex items-center justify-center" 
              aria-label="Next Track"
            >
              <IconPlayerSkipForwardFilled size={28} className="block" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
