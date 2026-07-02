import React from 'react';
import {
  IconVolume, IconVolumeOff, IconVolume2,
  IconPlayerSkipBackFilled, IconPlayerPlayFilled, IconPlayerPauseFilled, IconPlayerSkipForwardFilled,
  IconHeart, IconArrowsShuffle, IconRepeat, IconRepeatOnce, IconPictureInPicture
} from '@tabler/icons-react';
import defaultCover from '../assets/dna_replication_thumbnail.png';
import { usePlayer } from '../contexts/PlayerContext';
import { useUserAuth } from '../contexts/UserAuthContext';

export default function StickyPlayer({ onOpenFullPlayer }) {
  const {
    currentTrack, isPlaying, currentTime, isMuted, setIsMuted, volume, setVolume,
    togglePlay, handleNext, handlePrev, handleSeek,
    favoritedTrackIds, toggleFavorite,
    isShuffled, setIsShuffled, repeatMode, cycleRepeat,
    requestPip,
  } = usePlayer();
  const { user } = useUserAuth();

  const [lyrics, setLyrics] = React.useState([]);

  const displayTrack = currentTrack || {
    title: "DNA Replication Mnemonic",
    chapter: "Molecular Basis of Inheritance",
    cover: defaultCover,
    duration: "6:12",
    durationSeconds: 372
  };

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec < 10 ? '0' : ''}${sec}`;
  };

  const currentSeconds = currentTime || 0;
  const totalSeconds = displayTrack.durationSeconds || 372;
  const progressPercent = totalSeconds > 0 ? Math.min((currentSeconds / totalSeconds) * 100, 100) : 0;

  React.useEffect(() => {
    if (!displayTrack.lyricsUrl) {
      setLyrics([]);
      return;
    }

    const parseTTML = (text) => {
      const parser = new DOMParser();
      const doc = parser.parseFromString(text, 'text/xml');
      const pTags = doc.getElementsByTagName('p');
      const parsed = [];
      const parseTime = (timeStr) => {
        if (!timeStr) return 0;
        const parts = timeStr.split(':');
        if (parts.length === 3) return parseFloat(parts[0]) * 3600 + parseFloat(parts[1]) * 60 + parseFloat(parts[2]);
        if (parts.length === 2) return parseFloat(parts[0]) * 60 + parseFloat(parts[1]);
        return parseFloat(timeStr);
      };
      for (let i = 0; i < pTags.length; i++) {
        const p = pTags[i];
        const begin = parseTime(p.getAttribute('begin'));
        const endStr = p.getAttribute('end');
        const end = endStr ? parseTime(endStr) : begin + 5;
        const text = p.textContent.trim();
        if (text) parsed.push({ begin, end, text });
      }
      return parsed;
    };

    const parseLRC = (text) => {
      const lines = text.split('\n');
      const timeRegex = /\[(\d{1,2}):(\d{2})(?:[.:](\d{1,3}))?\]/g;
      const parsed = [];
      const entries = [];
      for (const line of lines) {
        const matches = [...line.matchAll(timeRegex)];
        if (matches.length === 0) continue;
        const lyricText = line.replace(timeRegex, '').trim();
        if (!lyricText) continue;
        for (const match of matches) {
          const mins = parseInt(match[1], 10);
          const secs = parseInt(match[2], 10);
          const ms = match[3] ? parseInt(match[3].padEnd(3, '0'), 10) : 0;
          const begin = mins * 60 + secs + ms / 1000;
          entries.push({ begin, text: lyricText });
        }
      }
      entries.sort((a, b) => a.begin - b.begin);
      for (let i = 0; i < entries.length; i++) {
        const end = entries[i + 1] ? entries[i + 1].begin : entries[i].begin + 5;
        parsed.push({ begin: entries[i].begin, end, text: entries[i].text });
      }
      return parsed;
    };

    const parseSRT = (text) => {
      const parseTimestamp = (ts) => {
        const [hms, ms] = ts.split(',');
        const [h, m, s] = hms.split(':').map(Number);
        return h * 3600 + m * 60 + s + (parseInt(ms, 10) || 0) / 1000;
      };
      const blocks = text.trim().split(/\n\s*\n/);
      const parsed = [];
      for (const block of blocks) {
        const lines = block.split('\n').map(l => l.trim()).filter(Boolean);
        if (lines.length < 2) continue;
        let startLine = 0;
        if (/^\d+$/.test(lines[0])) startLine = 1;
        const timeLine = lines[startLine];
        if (!timeLine || !timeLine.includes('-->')) continue;
        const [startStr, endStr] = timeLine.split('-->').map(s => s.trim());
        const begin = parseTimestamp(startStr);
        const end = parseTimestamp(endStr);
        const lyricText = lines.slice(startLine + 1).join(' ').trim();
        if (lyricText) parsed.push({ begin, end, text: lyricText });
      }
      return parsed;
    };

    const parsePlainText = (text) => {
      const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
      if (lines.length === 0) return [];
      return lines.map((line, i) => ({ begin: i * 5, end: (i + 1) * 5, text: line }));
    };

    const detectFormat = (url, text) => {
      const lower = url.toLowerCase();
      if (lower.endsWith('.ttml') || lower.includes('.ttml')) return 'ttml';
      if (lower.endsWith('.lrc') || lower.includes('.lrc')) return 'lrc';
      if (lower.endsWith('.srt') || lower.includes('.srt')) return 'srt';
      if (text.includes('<?xml') || text.includes('<tt') || text.includes('<body')) return 'ttml';
      if (text.match(/\[\d{1,2}:\d{2}/)) return 'lrc';
      if (text.match(/\d+\n\d{2}:\d{2}:\d{2},\d{3} -->/)) return 'srt';
      return 'plain';
    };

    fetch(displayTrack.lyricsUrl)
      .then(res => res.text())
      .then(text => {
        const format = detectFormat(displayTrack.lyricsUrl, text);
        let parsed = [];
        if (format === 'ttml') parsed = parseTTML(text);
        else if (format === 'lrc') parsed = parseLRC(text);
        else if (format === 'srt') parsed = parseSRT(text);
        else parsed = parsePlainText(text);
        setLyrics(parsed);
      })
      .catch(err => {
        console.error('Failed to load lyrics:', err);
        setLyrics([]);
      });
  }, [displayTrack.lyricsUrl]);

  const activeLyricIndex = lyrics.findIndex(l => currentSeconds >= l.begin && currentSeconds <= l.end);
  const activeLyric = lyrics[activeLyricIndex]?.text || displayTrack.title;

  const handleScrub = (e) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
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
              className="object-cover w-full h-full"
              alt={displayTrack.title}
              src={displayTrack.cover || defaultCover}
              onError={(e) => { e.target.onerror = null; e.target.src = defaultCover; }}
              width={48} height={48}
            />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-bold text-on-surface truncate">{displayTrack.title}</span>
            <span className="text-xs text-primary/80 mt-0.5 truncate">{formatTime(currentSeconds)} / {displayTrack.duration || formatTime(totalSeconds)}</span>
          </div>
        </div>

        {/* Center — Live Lyrics (1/3) */}
        <div className="w-1/3 flex justify-center text-center min-w-0">
          <p className="text-sm font-medium text-primary/95 italic truncate max-w-sm">
            {activeLyric}
          </p>
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
            onClick={(e) => { e.stopPropagation(); togglePlay(); }}
            className="bg-primary text-on-primary rounded-full w-9 h-9 flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-md flex-shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <IconPlayerPauseFilled size={18} /> : <IconPlayerPlayFilled size={18} className="translate-x-[1px]" />}
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

          <button
            onClick={(e) => { e.stopPropagation(); toggleFavorite?.(displayTrack.id || displayTrack._id); }}
            className={`p-1.5 rounded-full transition-colors focus-visible:outline-none ${isFav ? 'text-primary' : 'text-on-surface-variant hover:text-primary'}`}
            aria-label={isFav ? 'Remove from favorites' : 'Add to favorites'}
          >
            <IconHeart size={18} className={isFav ? 'fill-current' : ''} />
          </button>

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
