import React from 'react';
import { IconMusic, IconPlayerPlayFilled, IconPlayerPauseFilled, IconAlertTriangle, IconRotate } from '@tabler/icons-react';
import { usePlayer } from '../../contexts/PlayerContext';
import { resolveAudioUrl, formatTime } from '../../utils/urlUtils';

export default React.memo(function AudioAdPlayer({ item, user }) {
  const {
    currentTrack, isPlaying, currentTime, duration,
    togglePlay, handleTrackSelect, handleSeek,
    playbackError, retryPlayback, isAudioRollActive, activeRollType
  } = usePlayer();

  const originalAudio = resolveAudioUrl(item.audioUrl || item.videoUrl);

  const isThisTrackCurrent = currentTrack && (
    (currentTrack.id && item.id && currentTrack.id === item.id) ||
    (currentTrack._id && item._id && currentTrack._id === item._id) ||
    (currentTrack.id && item._id && currentTrack.id === item._id) ||
    (currentTrack._id && item.id && currentTrack._id === item.id) ||
    (currentTrack.audioUrl && originalAudio && currentTrack.audioUrl === originalAudio)
  );

  const isThisTrackPlaying = isThisTrackCurrent && isPlaying;

  const trackObj = {
    ...item,
    id: item._id || item.id,
    audioUrl: originalAudio,
    cover: item.cover || item.thumbnailUrl,
    durationSeconds: item.durationSeconds || item.duration || 200,
    songType: item.songType || 'Study'
  };

  const handlePlayClick = () => {
    if (isThisTrackCurrent) {
      if (playbackError) {
        retryPlayback?.();
      } else {
        togglePlay();
      }
    } else {
      handleTrackSelect(trackObj);
    }
  };

  const currentSecs = isThisTrackCurrent ? currentTime : 0;
  const totalSecs = isThisTrackCurrent && duration > 0 ? duration : (item.durationSeconds || 200);
  const progressPercent = totalSecs > 0 ? Math.min((currentSecs / totalSecs) * 100, 100) : 0;

  return (
    <div className="flex flex-col items-center justify-center py-8 text-center bg-surface-container/30 border border-outline/15 rounded-3xl p-6 sm:p-8 shadow-sm">
      <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4 text-primary shadow-sm">
        <IconMusic size={32} />
      </div>
      
      <h3 className="text-lg font-bold text-on-surface mb-1">
        {item.title}
      </h3>
      
      {item.subject && (
        <p className="text-xs text-on-surface-variant font-medium mb-4">
          {item.subject} {item.class ? `• ${item.class}` : ''}
        </p>
      )}

      {originalAudio ? (
        <div className="w-full max-w-md mt-2 flex flex-col items-center gap-4">
          {/* Controls & Status */}
          <div className="flex items-center gap-4 w-full justify-center">
            <button
              onClick={handlePlayClick}
              className="w-14 h-14 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer"
              aria-label={isThisTrackPlaying ? 'Pause' : 'Play'}
              title={isThisTrackPlaying ? 'Pause' : 'Play'}
            >
              {playbackError && isThisTrackCurrent ? (
                <IconRotate size={24} />
              ) : isThisTrackPlaying ? (
                <IconPlayerPauseFilled size={24} />
              ) : (
                <IconPlayerPlayFilled size={24} className="translate-x-[1px]" />
              )}
            </button>
          </div>

          {/* Ad Status / Error message */}
          {isThisTrackCurrent && playbackError && (
            <div className="flex items-center gap-1.5 text-xs text-red-500 font-medium">
              <IconAlertTriangle size={14} />
              Playback failed. Tap to retry.
            </div>
          )}

          {isThisTrackCurrent && isAudioRollActive && (
            <div className="text-xs font-bold text-amber-400 animate-pulse tracking-wide uppercase">
              {activeRollType === 'guestAd' ? 'Guest Ad Playing' : 'Mid-roll Ad Playing • Main Audio Paused'}
            </div>
          )}

          {/* Scrubber */}
          <div className="w-full space-y-1">
            <div 
              className="w-full h-2 bg-surface-container-highest rounded-full cursor-pointer overflow-hidden relative"
              onClick={(e) => {
                if (!isThisTrackCurrent) {
                  handleTrackSelect(trackObj);
                  return;
                }
                const rect = e.currentTarget.getBoundingClientRect();
                if (!rect || rect.width <= 0) return;
                const pct = (e.clientX - rect.left) / rect.width;
                if (isNaN(pct) || !isFinite(pct)) return;
                handleSeek(Math.max(0, Math.min(pct * totalSecs, totalSecs)));
              }}
            >
              <div 
                className="h-full bg-primary rounded-full transition-all duration-150"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] font-mono text-on-surface-variant px-0.5">
              <span>{formatTime(currentSecs)}</span>
              <span>{formatTime(totalSecs)}</span>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-xs text-on-surface-variant/60">No audio URL provided for this anthem yet.</p>
      )}
    </div>
  );
});
