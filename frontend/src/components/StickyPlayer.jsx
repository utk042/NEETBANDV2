import React from 'react';
import {
  IconVolume, IconVolumeOff, IconVolume2,
  IconPlayerSkipBackFilled, IconPlayerPlayFilled, IconPlayerPauseFilled, IconPlayerSkipForwardFilled,
  IconHeart, IconArrowsShuffle, IconRepeat, IconRepeatOnce, IconPictureInPicture,
  IconRotate, IconRotate2, IconAlertTriangle, IconLoader2
} from '@tabler/icons-react';
import logoImg from '../assets/logo.png';
import HeartButton from './Common/HeartButton';
import { usePlayer } from '../contexts/PlayerContext';
import { useUserAuth } from '../contexts/UserAuthContext';
import { useLyrics } from '../hooks/useLyrics';
import { formatTime } from '../utils/urlUtils';

export default function StickyPlayer({ onOpenFullPlayer }) {
  const {
    currentTrack, globalTracks, isPlaying, isAnyAudioActive, currentTime, duration, isMuted, setIsMuted, volume, setVolume,
    togglePlay, handleNext, handlePrev, handleSeek,
    favoritedTrackIds, toggleFavorite,
    isShuffled, setIsShuffled, repeatMode, cycleRepeat,
    requestPip, playbackError, retryPlayback,
    isAudioRollActive, activeRollType, isPlayingAd, adConfig, isBuffering
  } = usePlayer();
  const { user } = useUserAuth();

  const displayTrack = currentTrack || (globalTracks && globalTracks.length > 0 ? globalTracks[0] : {
    title: "No Track Selected",
    chapter: "Select a track to start listening",
    cover: logoImg,
    duration: "0:00",
    durationSeconds: 0
  });

  const currentSeconds = currentTime || 0;
  const totalSeconds = (currentTrack && duration > 0) ? duration : (displayTrack.durationSeconds || 0);
  const progressPercent = totalSeconds > 0 ? Math.min((currentSeconds / totalSeconds) * 100, 100) : 0;

  const { lyrics, activeLyric } = useLyrics(displayTrack?.lyricsUrl, currentSeconds);

  const handleScrub = (e) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    if (!rect || rect.width <= 0) return;
    const pct = (e.clientX - rect.left) / rect.width;
    if (isNaN(pct) || !isFinite(pct)) return;
    handleSeek(Math.max(0, Math.min(pct * totalSeconds, totalSeconds)));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      e.stopPropagation();
      handleSeek(Math.min(currentSeconds + 5, totalSeconds));
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      e.stopPropagation();
      handleSeek(Math.max(currentSeconds - 5, 0));
    }
  };

  const handleWrapperKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onOpenFullPlayer?.();
    }
  };

  const isFav = favoritedTrackIds?.includes(displayTrack.id || displayTrack._id);
  const repeatIcon = repeatMode === 'one' ? IconRepeatOnce : IconRepeat;
  const RepeatIcon = repeatIcon;

  return (
    <section
      role="button"
      aria-label="Open Full Screen Player"
      tabIndex={0}
      onClick={onOpenFullPlayer}
      onKeyDown={handleWrapperKeyDown}
      className="fixed bottom-0 left-0 w-full z-player-sticky bg-surface/90 backdrop-blur-md border-t border-outline/20 hidden md:block shadow-[0_-8px_30px_rgba(0,0,0,0.12)] transition-all duration-300 cursor-pointer hover:bg-surface/95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
    >
      {/* Progress Scrubber */}
      <div
        role="slider"
        aria-label="Progress"
        aria-valuenow={currentSeconds}
        aria-valuemin={0}
        aria-valuemax={totalSeconds}
        tabIndex={0}
        onClick={handleScrub}
        onKeyDown={handleKeyDown}
        className="w-full h-1.5 bg-surface-container-highest absolute top-0 left-0 cursor-pointer group focus-visible:outline-none"
      >
        <div
          className="h-full bg-gradient-to-r from-primary to-primary/80 relative group-hover:h-2.5 transition-all duration-150"
          style={{ width: `${progressPercent}%` }}
        >
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-white rounded-full shadow-[0_0_8px_rgba(201,162,39,0.6)] opacity-0 group-hover:opacity-100 transition-opacity border border-primary/20" />
        </div>
      </div>

      <div className="max-w-screen-2xl mx-auto px-8 h-20 flex items-center justify-between gap-4">
        {/* Left — Track info (1/3) */}
        <div className="flex items-center gap-3 w-1/3 min-w-0">
          <div className="w-12 h-12 bg-surface-container rounded-lg overflow-hidden shadow-sm border border-outline/10 flex-shrink-0">
            <img
              className={`w-full h-full ${(!displayTrack.cover || displayTrack.cover === logoImg) ? 'object-contain p-1 bg-black/20' : 'object-cover'}`}
              alt={displayTrack.title}
              src={displayTrack.cover || logoImg}
              onError={(e) => { e.target.onerror = null; e.target.src = logoImg; e.target.className = 'w-full h-full object-contain p-1 bg-black/20'; }}
              width={48} height={48}
            />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-bold text-on-surface truncate">{displayTrack.title}</span>
            <span className="text-xs text-primary/80 mt-0.5 truncate">{formatTime(currentSeconds)} / {displayTrack.duration || formatTime(totalSeconds)}</span>
          </div>
        </div>

        {/* Center — Live Lyrics, Ad Status, or Error Alert (1/3) */}
        <div className="w-1/3 flex justify-center text-center min-w-0">
          {playbackError ? (
            <div className="flex items-center gap-1.5 text-xs font-medium text-red-500 truncate">
              <IconAlertTriangle size={15} className="shrink-0" />
              <span className="truncate">Playback error.</span>
              <button
                onClick={(e) => { e.stopPropagation(); retryPlayback?.(); }}
                className="underline hover:text-red-600 font-semibold shrink-0 cursor-pointer ml-1"
              >
                Retry
              </button>
            </div>
          ) : (isPlayingAd || isAudioRollActive) ? (
            <div 
              className="flex items-center gap-2 text-xs font-bold text-amber-600 dark:text-amber-400 animate-pulse tracking-wide truncate"
              style={adConfig?.adTextColor ? { color: adConfig.adTextColor } : undefined}
            >
              <span className="w-2 h-2 rounded-full bg-amber-500 inline-block animate-ping"></span>
              {activeRollType === 'guestAd' 
                ? 'Guest Roll Playing' 
                : (adConfig?.adBannerText || 'Study without interruptions. Upgrade to Premium for an ad-free experience.')}
            </div>
          ) : (
            <p className="text-sm font-medium text-primary/95 italic truncate max-w-sm min-h-[1.25rem] pr-2.5 inline-block">
              {activeLyric}
            </p>
          )}
        </div>

        {/* Right — Controls (1/3) */}
        <div className="flex items-center justify-end gap-2 lg:gap-3 w-1/3 flex-shrink-0">
          <button
            onClick={(e) => { e.stopPropagation(); setIsShuffled(!isShuffled); }}
            className={`p-1.5 rounded-full transition-colors focus-visible:outline-none ${isShuffled ? 'text-primary' : 'text-on-surface-variant hover:text-primary'}`}
            aria-label="Shuffle"
          >
            <IconArrowsShuffle size={18} />
          </button>

          <button onClick={(e) => { e.stopPropagation(); handlePrev(); }} className="text-on-surface hover:text-primary transition-colors p-1.5" aria-label="Previous">
            <IconPlayerSkipBackFilled size={18} />
          </button>

          <button
            onClick={(e) => { e.stopPropagation(); handleSeek(Math.max(0, currentSeconds - 10)); }}
            className="text-on-surface-variant hover:text-primary transition-colors p-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded-full"
            aria-label="Replay 10s"
            title="Replay 10s"
          >
            <IconRotate2 size={18} />
          </button>

          <button
            onClick={(e) => { e.stopPropagation(); playbackError ? retryPlayback?.() : togglePlay(); }}
            className="bg-primary text-on-primary rounded-full w-9 h-9 flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-md flex-shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
            aria-label={playbackError ? 'Retry' : isAnyAudioActive ? 'Pause' : 'Play'}
            title={playbackError ? 'Retry Playback' : isAnyAudioActive ? 'Pause' : 'Play'}
          >
            {playbackError ? <IconRotate size={18} /> : isBuffering ? <IconLoader2 size={18} className="animate-spin" /> : isAnyAudioActive ? <IconPlayerPauseFilled size={18} /> : <IconPlayerPlayFilled size={18} className="translate-x-[1px]" />}
          </button>

          <button
            onClick={(e) => { e.stopPropagation(); handleSeek(Math.min(totalSeconds, currentSeconds + 30)); }}
            className="text-on-surface-variant hover:text-primary transition-colors p-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded-full"
            aria-label="Forward 30s"
            title="Forward 30s"
          >
            <IconRotate size={18} />
          </button>

          <button onClick={(e) => { e.stopPropagation(); handleNext(); }} className="text-on-surface hover:text-primary transition-colors p-1.5" aria-label="Next">
            <IconPlayerSkipForwardFilled size={18} />
          </button>

          <button
            onClick={(e) => { e.stopPropagation(); cycleRepeat(); }}
            className={`p-1.5 rounded-full transition-colors focus-visible:outline-none ${repeatMode !== 'none' ? 'text-primary' : 'text-on-surface-variant hover:text-primary'}`}
            aria-label={`Repeat: ${repeatMode}`}
          >
            <RepeatIcon size={18} />
          </button>

          <HeartButton
            isFavorited={isFav}
            onToggle={() => toggleFavorite?.(displayTrack.id || displayTrack._id)}
            size={18}
          />

          {/* Volume control */}
          <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="text-on-surface-variant hover:text-primary transition-colors focus-visible:outline-none p-1"
              aria-label={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted || volume === 0 ? <IconVolumeOff size={18} /> : volume < 0.5 ? <IconVolume2 size={18} /> : <IconVolume size={18} />}
            </button>
            <input
              type="range"
              min={0} max={1} step={0.01}
              value={isMuted ? 0 : volume}
              onChange={(e) => { setVolume(parseFloat(e.target.value)); if (parseFloat(e.target.value) > 0) setIsMuted(false); }}
              className="w-16 lg:w-20 h-1 accent-primary cursor-pointer"
              aria-label="Volume"
            />
          </div>

          {/* PIP — Premium only */}
          {user?.isPremium && (
            <button
              onClick={(e) => { e.stopPropagation(); requestPip(); }}
              className="text-on-surface-variant hover:text-primary transition-colors p-1.5 focus-visible:outline-none"
              aria-label="Picture in Picture"
              title="Picture in Picture (Premium)"
            >
              <IconPictureInPicture size={18} />
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
