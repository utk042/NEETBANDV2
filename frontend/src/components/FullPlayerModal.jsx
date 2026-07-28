import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  IconChevronDown, IconPlayerSkipBackFilled, IconPlayerPlayFilled, IconPlayerPauseFilled, IconPlayerSkipForwardFilled,
  IconHeart, IconVolume, IconVolumeOff, IconRepeat, IconRepeatOnce, IconArrowsShuffle, IconMicrophone2, IconPictureInPicture, IconMusic,
  IconAlertTriangle, IconRotate
} from '@tabler/icons-react';
import logoImg from '../assets/logo.png';
import HeartButton from './Common/HeartButton';
import { usePlayer } from '../contexts/PlayerContext';
import { useUserAuth } from '../contexts/UserAuthContext';
import { formatTime } from '../utils/urlUtils';

export default function FullPlayerModal({ isOpen, onClose }) {
  const {
    currentTrack, isPlaying, isAnyAudioActive, currentTime, duration, isMuted, setIsMuted, volume, setVolume,
    togglePlay, handleNext: onNext, handlePrev: onPrev, handleSeek: onSeek,
    favoritedTrackIds, toggleFavorite: onToggleFavorite,
    isShuffled, setIsShuffled, repeatMode, cycleRepeat,
    requestPip, playbackError, retryPlayback,
    isAudioRollActive, activeRollType, isPlayingAd
  } = usePlayer();
  const { user } = useUserAuth();


  const navigate = useNavigate();
  const [lyrics, setLyrics] = useState([]);
  const [showLyrics, setShowLyrics] = useState(true);
  const lyricsContainerRef = useRef(null);
  const activeLyricRef = useRef(null);

  // Swipe to dismiss mobile gestures
  const [touchStart, setTouchStart] = useState(0);
  const [touchCurrent, setTouchCurrent] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);

  const handleTouchStart = (e) => {
    if (e.touches.length !== 1) return;
    // Only swipe dismiss when scrolled to the very top
    const scrollContainer = e.currentTarget;
    if (scrollContainer.scrollTop > 5) return;
    setTouchStart(e.touches[0].clientY);
    setTouchCurrent(e.touches[0].clientY);
    setIsSwiping(true);
  };

  const handleTouchMove = (e) => {
    if (!isSwiping) return;
    setTouchCurrent(e.touches[0].clientY);
  };

  const handleTouchEnd = () => {
    if (!isSwiping) return;
    const diff = touchCurrent - touchStart;
    const threshold = 120; // threshold in pixels to trigger close
    if (diff > threshold) {
      onClose();
    }
    setIsSwiping(false);
    setTouchStart(0);
    setTouchCurrent(0);
  };

  const dragTranslateY = isSwiping && touchCurrent > touchStart ? touchCurrent - touchStart : 0;
  const modalStyle = dragTranslateY > 0 ? {
    transform: `translateY(${dragTranslateY}px)`,
    transition: 'none'
  } : {};

  const displayTrack = currentTrack;

  const currentSeconds = currentTime || 0;
  const totalSeconds = (displayTrack && duration > 0) ? duration : (displayTrack?.durationSeconds || 1);
  const progressPercent = totalSeconds > 0 ? Math.min((currentSeconds / totalSeconds) * 100, 100) : 0;

  useEffect(() => {
    if (!displayTrack?.lyricsUrl) {
      setLyrics([]);
      return;
    }

    const parseTTML = (text) => {
      const parseTime = (timeStr) => {
        if (!timeStr) return 0;
        const parts = timeStr.split(':');
        if (parts.length === 3) return parseFloat(parts[0]) * 3600 + parseFloat(parts[1]) * 60 + parseFloat(parts[2]);
        if (parts.length === 2) return parseFloat(parts[0]) * 60 + parseFloat(parts[1]);
        return parseFloat(timeStr);
      };

      const extractFromTags = (pTags) => {
        const parsed = [];
        for (let i = 0; i < pTags.length; i++) {
          const p = pTags[i];
          const beginAttr = p.getAttribute('begin');
          if (!beginAttr) continue;
          const begin = parseTime(beginAttr);
          const endStr = p.getAttribute('end');
          const end = endStr ? parseTime(endStr) : begin + 5;
          const textContent = p.textContent.trim();
          if (textContent) parsed.push({ begin, end, text: textContent });
        }
        return parsed;
      };

      let parsed = [];
      try {
        const parser = new DOMParser();
        let doc = parser.parseFromString(text, 'text/xml');
        let pTags = doc.getElementsByTagName('p');
        
        if (!pTags || pTags.length === 0) {
          doc = parser.parseFromString(text, 'text/html');
          pTags = doc.getElementsByTagName('p');
        }
        
        parsed = extractFromTags(pTags);
      } catch (e) {
        console.error("DOMParser error for TTML:", e);
      }

      if (parsed.length === 0) {
        const regex = /<p\s+[^>]*begin="([^"]+)"[^>]*>([\s\S]*?)<\/p>/gi;
        let match;
        while ((match = regex.exec(text)) !== null) {
          const begin = parseTime(match[1]);
          const endMatch = match[0].match(/end="([^"]+)"/i);
          const endStr = endMatch ? endMatch[1] : null;
          const end = endStr ? parseTime(endStr) : begin + 5;
          let rawText = match[2].replace(/<[^>]+>/g, '').trim();
          rawText = rawText.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'");
          if (rawText) parsed.push({ begin, end, text: rawText });
        }
      }

      return parsed;
    };

    const parseLRC = (text) => {
      // LRC format: [MM:SS.xx]Lyric line
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
      // SRT format: index\nHH:MM:SS,ms --> HH:MM:SS,ms\nLyric text\n
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
        // Skip index line if it's just a number
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
      // Plain text: no timestamps, display as static lyrics with even spacing
      const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
      if (lines.length === 0) return [];
      return lines.map((line, i) => ({ begin: i * 5, end: (i + 1) * 5, text: line }));
    };

    const detectFormat = (url, text) => {
      const lower = url.toLowerCase();
      if (lower.endsWith('.ttml') || lower.includes('.ttml')) return 'ttml';
      if (lower.endsWith('.lrc') || lower.includes('.lrc')) return 'lrc';
      if (lower.endsWith('.srt') || lower.includes('.srt')) return 'srt';
      // Content sniffing
      if (text.includes('<?xml') || text.includes('<tt') || text.includes('<body')) return 'ttml';
      if (text.match(/\[\d{1,2}:\d{2}/)) return 'lrc';
      if (text.match(/\d+\n\d{2}:\d{2}:\d{2},\d{3} -->/)) return 'srt';
      return 'plain';
    };

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const lyricsUrl = displayTrack.lyricsUrl.startsWith('http://') || displayTrack.lyricsUrl.startsWith('https://') || displayTrack.lyricsUrl.startsWith('blob:')
      ? displayTrack.lyricsUrl
      : `${API_URL}${displayTrack.lyricsUrl.startsWith('/') ? '' : '/'}${displayTrack.lyricsUrl}`;

    fetch(lyricsUrl)
      .then(res => {
        if (!res.ok) throw new Error(`Lyrics file not found (status ${res.status})`);
        return res.text();
      })
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
        console.warn('Failed to load lyrics:', err.message || err);
        setLyrics([]);
      });
  }, [displayTrack?.lyricsUrl]);

  // Find active lyric index
  const activeLyricIndex = lyrics.findIndex(l => currentSeconds >= l.begin && currentSeconds <= l.end);

  // Auto-scroll to active lyric
  useEffect(() => {
    if (showLyrics && activeLyricRef.current && lyricsContainerRef.current) {
      activeLyricRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  }, [activeLyricIndex, showLyrics]);

  const handleScrub = (e) => {
    if (!onSeek) return;
    const rect = e.currentTarget.getBoundingClientRect();
    if (!rect || rect.width <= 0) return;
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const newPercent = clickX / width;
    if (isNaN(newPercent) || !isFinite(newPercent)) return;
    const newTime = Math.floor(newPercent * totalSeconds);
    if (isNaN(newTime) || !isFinite(newTime)) return;
    onSeek(Math.max(0, Math.min(newTime, totalSeconds)));
  };

  // Generate deterministic wave data
  const waveData = useMemo(() => {
    const numBars = 70;
    return Array.from({ length: numBars }).map((_, i) => {
      const t = i / numBars;
      // Composite of 3 sine waves at different frequencies for organic look
      const a = Math.sin(t * Math.PI * 4) * 30;
      const b = Math.sin(t * Math.PI * 8 + 1.2) * 20;
      const c = Math.cos(t * Math.PI * 2 + 0.5) * 15;
      const raw = Math.abs(a + b + c);
      return Math.max(15, Math.min(100, raw + 22));
    });
  }, []);

  if (!isOpen) return null;

  if (!displayTrack) {
    return (
      <div 
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={modalStyle}
        className="fixed inset-0 z-modal flex flex-col bg-surface/[0.98] transition-all duration-300 overflow-y-auto overflow-x-hidden no-scrollbar"
      >
        <div className="flex justify-between items-center p-4 md:px-8 shrink-0 relative">
          <div className="flex-1 flex justify-start z-10">
            <button onClick={onClose} className="p-2 text-on-surface hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded-full">
              <IconChevronDown size={32} />
            </button>
          </div>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center px-6">
          <IconMusic size={64} className="text-on-surface-variant mb-6 opacity-50" />
          <h2 className="text-2xl font-bold text-on-surface mb-2">No song to play</h2>
          <p className="text-on-surface-variant text-center max-w-sm">
            Play a track from your library or a course module to see it here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div 
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={modalStyle}
      className="fixed inset-0 z-modal flex flex-col bg-surface/[0.98] transition-all duration-300 overflow-y-auto overflow-x-hidden no-scrollbar"
    >
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes waveRise {
          0%   { transform: scaleY(0.4) translateY(0); }
          25%  { transform: scaleY(1.0) translateY(0); }
          50%  { transform: scaleY(0.6) translateY(0); }
          75%  { transform: scaleY(0.9) translateY(0); }
          100% { transform: scaleY(0.5) translateY(0); }
        }
        @keyframes waveFall {
          0%   { transform: scaleY(0.9) translateY(0); }
          50%  { transform: scaleY(0.5) translateY(0); }
          100% { transform: scaleY(0.8) translateY(0); }
        }
        .wave-bar-active {
          animation: waveRise var(--dur, 0.8s) ease-in-out infinite alternate;
          animation-delay: var(--delay, 0s);
          transform-origin: center;
        }
        .wave-bar-paused {
          animation: none;
          transform: scaleY(var(--static-scale, 0.6));
          transform-origin: center;
          transition: transform 0.4s ease-out;
        }
      ` }} />
      {/* Header */}
      <div className="flex justify-between items-center p-4 md:px-8 shrink-0 relative">
        <div className="flex-1 flex justify-start z-10">
          <button onClick={onClose} className="p-2 text-on-surface hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded-full">
            <IconChevronDown size={32} />
          </button>
        </div>
        <div className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center z-0 w-[60%] text-center">
          <span className={`text-xs font-bold uppercase tracking-widest truncate w-full ${(isPlayingAd || isAudioRollActive) ? 'text-amber-400 font-extrabold animate-pulse' : 'text-on-surface-variant'}`}>
            {(isPlayingAd || isAudioRollActive) ? (isPlayingAd ? 'Ad Playing' : activeRollType === 'guestAd' ? 'Guest Roll Playing' : 'Ad Playing') : 'Now Playing'}
          </span>
          <span className="text-sm font-semibold text-primary truncate w-full">{displayTrack.chapter || "NeetBand"}</span>
        </div>
        <div className="flex-1 flex justify-end items-center gap-2 z-10">
          {user?.isPremium && (
            <button
              onClick={requestPip}
              className="p-2 text-on-surface hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded-full"
              aria-label="Picture in Picture"
              title="Picture in Picture (Premium)"
            >
              <IconPictureInPicture size={28} />
            </button>
          )}
          {displayTrack.courseId && (
            <button 
              onClick={() => {
                onClose();
                const targetId = typeof displayTrack.courseId === 'object' && displayTrack.courseId !== null ? displayTrack.courseId._id : displayTrack.courseId;
                navigate(`/course/${targetId}`);
              }}
              className="w-11 h-11 flex items-center justify-center rounded-full transition-colors bg-surface-container-highest hover:bg-primary/20 text-on-surface hover:text-primary shadow-sm ring-1 ring-outline/10"
              title="Go to Related Course"
            >
              <div className="flex items-center justify-center font-black text-[18px] tracking-tighter">
                Q<span className="text-primary text-[20px]">3</span>
              </div>
            </button>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:flex-row items-center justify-center w-full max-w-6xl mx-auto px-6 md:px-12 pb-10 gap-6 md:gap-16 min-h-0">
        
        {/* Album Art & Lyrics */}
        <div className="w-full md:w-1/2 flex-1 min-h-0 flex flex-col items-center justify-center py-2">
          <div className="w-[75vw] max-w-[360px] md:max-w-[460px] aspect-square bg-black rounded-3xl overflow-hidden shadow-2xl border border-[var(--border-floating-card)] relative shrink min-h-0">
            <img 
              src={displayTrack.cover || logoImg} 
              alt={displayTrack.title} 
              className={`absolute inset-0 w-full h-full ${(!displayTrack.cover || displayTrack.cover === logoImg) ? 'object-contain p-8' : 'object-cover'} transition-all duration-700 ease-in-out ${(showLyrics && lyrics.length > 0) ? 'scale-110 blur-xl brightness-[0.25]' : 'scale-100 blur-0 brightness-100'}`} 
              onError={(e) => { e.target.onerror = null; e.target.src = logoImg; e.target.classList.remove('object-cover'); e.target.classList.add('object-contain', 'p-8'); }} />
            
            {/* Lyrics Overlay */}
            <div 
              className={`absolute inset-0 z-10 transition-opacity duration-500 ${(showLyrics && lyrics.length > 0) ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
            >
              <div 
                ref={lyricsContainerRef}
                className="absolute inset-0 overflow-y-auto no-scrollbar flex flex-col items-center px-6 md:px-12"
                style={{ 
                  paddingBottom: '50%', 
                  paddingTop: '50%',
                  maskImage: 'linear-gradient(transparent, black 15%, black 85%, transparent)',
                  WebkitMaskImage: 'linear-gradient(transparent, black 15%, black 85%, transparent)'
                }}
              >
                {lyrics.length > 0 ? lyrics.map((lyric, idx) => {
                  const isActive = idx === activeLyricIndex;
                  const isPassed = idx < activeLyricIndex;
                  return (
                    <div 
                      key={idx}
                      ref={isActive ? activeLyricRef : null}
                      className={`w-full text-center py-4 transition-all duration-500 cursor-pointer ${
                        isActive 
                          ? 'text-primary text-lg md:text-xl font-semibold drop-shadow-[0_0_12px_rgba(201,162,39,0.8)]'
                          : isPassed
                            ? 'text-white/40 text-lg md:text-xl font-medium'
                            : 'text-white/70 text-lg md:text-xl font-semibold hover:text-white'
                      }`}
                      onClick={() => {
                        if (isAudioRollActive) return;
                        onSeek && onSeek(lyric.begin);
                      }}
                    >
                      {lyric.text}
                    </div>
                  );
                }) : (
                  <div className="w-full text-center py-4 text-white/50 text-lg font-medium h-full flex items-center justify-center">
                    {displayTrack.lyricsUrl ? "Loading lyrics..." : "No lyrics available"}
                  </div>
                )}
              </div>
            </div>

            {/* Playback Error Overlay on Thumbnail */}
            {playbackError && (
              <div 
                onClick={(e) => { e.stopPropagation(); retryPlayback?.(); }}
                className="absolute inset-0 z-20 bg-black/65 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center cursor-pointer transition-all hover:bg-black/75 group/err"
              >
                <div className="w-12 h-12 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center mb-3 group-hover/err:scale-110 transition-transform">
                  <IconAlertTriangle size={24} />
                </div>
                <span className="text-sm font-bold text-white mb-1">Playback Error</span>
                <span className="text-xs text-white/75 max-w-xs mb-4 leading-relaxed">Failed to load audio stream. Please check your connection.</span>
                <button
                  onClick={(e) => { e.stopPropagation(); retryPlayback?.(); }}
                  className="px-4 py-1.5 bg-red-600 hover:bg-red-700 active:scale-95 text-white font-semibold text-xs rounded-full shadow-md transition-all flex items-center gap-1.5"
                >
                  <IconRotate size={14} />
                  Tap to Retry
                </button>
              </div>
            )}

            <div className={`absolute inset-0 bg-gradient-to-t from-surface/80 to-transparent pointer-events-none transition-opacity duration-500 ${(showLyrics && lyrics.length > 0) ? 'opacity-0' : 'opacity-100'}`}></div>
          </div>
        </div>

        {/* Controls Container */}
        <div className="w-full md:w-1/2 max-w-xl shrink-0 flex flex-col justify-center">
          <div className="flex justify-between items-end mb-8 md:mb-12">
            <div className="min-w-0 pr-4">
              <h2 className="text-3xl font-extrabold text-on-surface truncate mb-1">{displayTrack.title}</h2>
              <p className="text-lg text-primary/80 truncate">{displayTrack.subject || 'Biology'} • {displayTrack.grade || 'Class 12'}</p>
            </div>
            <HeartButton
              isFavorited={favoritedTrackIds?.includes(displayTrack.id || displayTrack._id)}
              onToggle={() => onToggleFavorite?.(displayTrack.id || displayTrack._id)}
              size={32}
              className="p-3 shrink-0"
              activeColorClass="text-primary"
              inactiveColorClass="text-on-surface hover:text-primary"
            />
          </div>

          {/* Wavy Progress Bar */}
          <div className="mb-8">
            <div 
              className="w-full h-12 flex items-center justify-between gap-[2px] cursor-pointer group"
              onClick={handleScrub}
            >
              {waveData.map((height, i) => {
                const isPlayed = (i / waveData.length) * 100 <= progressPercent;
                // Staggered timing — each bar gets a slightly different phase
                const dur = `${0.5 + (i % 5) * 0.08}s`;
                const delay = `${-((i * 0.07) % 0.8)}s`;
                const staticScale = (height / 100) * 0.9 + 0.1;

                return (
                  <div
                    key={i}
                    className={`flex-1 rounded-full transition-colors duration-300 ${
                      isPlayed
                        ? 'bg-primary shadow-[0_0_6px_rgba(201,162,39,0.4)]'
                        : 'bg-surface-container-highest/70 group-hover:bg-surface-container-highest'
                    } ${
                      isAnyAudioActive
                        ? 'wave-bar-active'
                        : 'wave-bar-paused'
                    }`}
                    style={{
                      height: `${height}%`,
                      '--dur': dur,
                      '--delay': delay,
                      '--static-scale': staticScale,
                    }}
                  />
                );
              })}
            </div>
            <div className="flex justify-between text-xs font-semibold text-on-surface-variant mt-3">
              <span>{formatTime(currentSeconds)}</span>
              <span>{displayTrack.duration || formatTime(totalSeconds)}</span>
            </div>
          </div>

          {/* Playback Controls */}
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={() => setIsShuffled(!isShuffled)}
              className={`p-2 rounded-full transition-colors ${isShuffled ? 'text-primary' : 'text-on-surface-variant hover:text-primary'}`}
              aria-label="Shuffle"
            >
              <IconArrowsShuffle size={28} />
            </button>
            
            <div className="flex items-center gap-4 sm:gap-8">
              <button onClick={onPrev} className="text-on-surface hover:text-primary transition-colors p-2" aria-label="Previous Track">
                <IconPlayerSkipBackFilled size={36} />
              </button>
              <button 
                onClick={playbackError ? retryPlayback : togglePlay}
                className="w-[84px] h-[84px] rounded-full bg-primary text-on-primary flex items-center justify-center shadow-[0_0_20px_rgba(201,162,39,0.3)] hover:scale-105 active:scale-95 transition-all shrink-0 duration-200"
                aria-label={playbackError ? 'Retry' : isAnyAudioActive ? 'Pause' : 'Play'}
                title={playbackError ? 'Retry Playback' : isAnyAudioActive ? 'Pause' : 'Play'}
              >
                {playbackError ? <IconRotate size={40} /> : isAnyAudioActive ? <IconPlayerPauseFilled size={40} /> : <IconPlayerPlayFilled size={40} />}
              </button>
              <button onClick={onNext} className="text-on-surface hover:text-primary transition-colors p-2" aria-label="Next Track">
                <IconPlayerSkipForwardFilled size={36} />
              </button>
            </div>

            <button
              onClick={cycleRepeat}
              className={`p-2 rounded-full transition-colors ${repeatMode !== 'none' ? 'text-primary' : 'text-on-surface-variant hover:text-primary'}`}
              aria-label={`Repeat Mode: ${repeatMode}`}
            >
              {repeatMode === 'one' ? <IconRepeatOnce size={28} /> : <IconRepeat size={28} />}
            </button>
          </div>

          {/* Bottom Bar (Volume Control Slider) */}
          <div className="flex justify-center items-center gap-3 hidden md:flex mt-4">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="hover:text-primary text-on-surface-variant transition-colors p-1"
              aria-label={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted || volume === 0 ? <IconVolumeOff size={24} className="opacity-50" /> : <IconVolume size={24} />}
            </button>
            <input
              type="range" min={0} max={1} step={0.01}
              value={isMuted ? 0 : volume}
              onChange={(e) => { setVolume(parseFloat(e.target.value)); if (parseFloat(e.target.value) > 0) setIsMuted(false); }}
              className="w-1/3 h-1.5 accent-primary bg-surface-container-highest rounded-full cursor-pointer"
              aria-label="Volume"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
