import React, { useState, useEffect, useMemo, useRef } from 'react';
import { IconChevronDown, IconPlayerSkipBackFilled, IconPlayerPlayFilled, IconPlayerPauseFilled, IconPlayerSkipForwardFilled, IconHeart, IconVolume, IconRepeat, IconArrowsShuffle, IconMicrophone2 } from '@tabler/icons-react';
import defaultCover from '../assets/dna_replication_thumbnail.png';

export default function FullPlayerModal({ isOpen, onClose, currentTrack, isPlaying, togglePlay, currentTime, onNext, onPrev, onSeek, favoritedTrackIds, onToggleFavorite }) {
  const [lyrics, setLyrics] = useState([]);
  const [showLyrics, setShowLyrics] = useState(false);
  const lyricsContainerRef = useRef(null);
  const activeLyricRef = useRef(null);


  const displayTrack = currentTrack || {
    title: "DNA Replication",
    chapter: "Molecular Basis of Inheritance",
    cover: defaultCover,
    duration: "6:12",
    durationSeconds: 372
  };

  const currentSeconds = currentTime || 0;
  const totalSeconds = displayTrack.durationSeconds || 372;
  const progressPercent = Math.min((currentSeconds / totalSeconds) * 100, 100);

  useEffect(() => {
    if (displayTrack.lyricsUrl) {
      fetch(displayTrack.lyricsUrl)
        .then(res => res.text())
        .then(text => {
          const parser = new DOMParser();
          const doc = parser.parseFromString(text, 'text/xml');
          const pTags = doc.getElementsByTagName('p');
          const parsed = [];
          
          const parseTime = (timeStr) => {
            if (!timeStr) return 0;
            const parts = timeStr.split(':');
            let seconds = 0;
            if (parts.length === 3) {
              seconds = parseFloat(parts[0]) * 3600 + parseFloat(parts[1]) * 60 + parseFloat(parts[2]);
            } else if (parts.length === 2) {
              seconds = parseFloat(parts[0]) * 60 + parseFloat(parts[1]);
            } else {
              seconds = parseFloat(timeStr);
            }
            return seconds;
          };

          for (let i = 0; i < pTags.length; i++) {
            const p = pTags[i];
            const begin = parseTime(p.getAttribute('begin'));
            let endStr = p.getAttribute('end');
            let end = endStr ? parseTime(endStr) : begin + 5; // Default 5s if no end
            const text = p.textContent.trim();
            if (text) {
              parsed.push({ begin, end, text });
            }
          }
          setLyrics(parsed);
        })
        .catch(err => {
          console.error("Failed to load lyrics:", err);
          setLyrics([]);
        });
    } else {
      setLyrics([]);
    }
  }, [displayTrack.lyricsUrl]);

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

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleScrub = (e) => {
    if (!onSeek) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const newPercent = clickX / width;
    const newTime = Math.floor(newPercent * totalSeconds);
    onSeek(Math.max(0, Math.min(newTime, totalSeconds)));
  };

  // Generate deterministic wave data
  const waveData = useMemo(() => {
    const numBars = 60;
    return Array.from({ length: numBars }).map((_, i) => {
      const phase1 = Math.sin((i / numBars) * Math.PI * 6) * 30;
      const phase2 = Math.sin((i / numBars) * Math.PI * 12) * 15;
      const phase3 = Math.cos((i / numBars) * Math.PI * 3) * 20;
      return Math.min(100, Math.abs(phase1 + phase2 + phase3) + 20); // between 20% and 100%
    });
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[50] flex flex-col bg-surface/95 backdrop-blur-xl transition-all duration-300 pt-20 md:pt-24 pb-20 md:pb-0 overflow-y-auto overflow-x-hidden no-scrollbar">
      {/* Header */}
      <div className="flex justify-between items-center p-4 md:px-8 shrink-0">
        <button onClick={onClose} className="p-2 text-on-surface hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded-full">
          <IconChevronDown size={32} />
        </button>
        <div className="flex flex-col items-center">
          <span className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Now Playing</span>
          <span className="text-sm font-semibold text-primary">{displayTrack.chapter || "NeetBand"}</span>
        </div>
        <button 
          onClick={() => setShowLyrics(!showLyrics)}
          className={`p-2 rounded-full transition-colors ${showLyrics ? 'text-primary bg-primary/10' : 'text-on-surface hover:text-primary'} ${!displayTrack.lyricsUrl && 'opacity-50 cursor-not-allowed'}`}
          disabled={!displayTrack.lyricsUrl}
          title={displayTrack.lyricsUrl ? "Toggle Lyrics" : "No lyrics available"}
        >
          <IconMicrophone2 size={28} />
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:flex-row items-center justify-center w-full max-w-6xl mx-auto px-6 md:px-12 pb-10 gap-6 md:gap-16 min-h-0">
        
        {/* Album Art & Lyrics */}
        <div className="w-full md:w-1/2 flex-1 min-h-0 flex flex-col items-center justify-center py-2">
          <div className="w-[75vw] max-w-[360px] md:max-w-[460px] aspect-square bg-black rounded-3xl overflow-hidden shadow-2xl border border-[var(--border-floating-card)] relative shrink min-h-0">
            <img 
              src={displayTrack.cover} 
              alt={displayTrack.title} 
              className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-in-out ${showLyrics ? 'scale-110 blur-xl brightness-[0.25]' : 'scale-100 blur-0 brightness-100'}`} 
            />
            
            {/* Lyrics Overlay */}
            <div 
              className={`absolute inset-0 z-10 transition-opacity duration-500 ${showLyrics ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
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
                          ? 'text-primary text-2xl md:text-3xl font-extrabold scale-110 drop-shadow-[0_0_12px_rgba(201,162,39,0.8)]'
                          : isPassed
                            ? 'text-white/40 text-lg md:text-xl font-medium'
                            : 'text-white/70 text-lg md:text-xl font-semibold hover:text-white'
                      }`}
                      onClick={() => onSeek && onSeek(lyric.begin)}
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

            <div className={`absolute inset-0 bg-gradient-to-t from-surface/80 to-transparent pointer-events-none transition-opacity duration-500 ${showLyrics ? 'opacity-0' : 'opacity-100'}`}></div>
          </div>
        </div>

        {/* Controls Container */}
        <div className="w-full md:w-1/2 max-w-xl shrink-0 flex flex-col justify-center">
          <div className="flex justify-between items-end mb-8 md:mb-12">
          <div className="min-w-0 pr-4">
            <h2 className="text-3xl font-extrabold text-on-surface truncate mb-1">{displayTrack.title}</h2>
            <p className="text-lg text-primary/80 truncate">{displayTrack.subject || 'Biology'} • {displayTrack.grade || 'Class 12'}</p>
          </div>
          <button 
            onClick={() => onToggleFavorite?.(displayTrack.id)}
            className={`p-3 rounded-full transition-colors flex-shrink-0 ${favoritedTrackIds?.includes(displayTrack.id) ? 'text-primary' : 'text-on-surface hover:text-primary'}`}
          >
            <IconHeart size={32} className={favoritedTrackIds?.includes(displayTrack.id) ? 'fill-current' : ''} />
          </button>
        </div>

        {/* Wavy Progress Bar */}
        <div className="mb-8">
          <div 
            className="w-full h-12 flex items-center justify-between gap-[2px] cursor-pointer group"
            onClick={handleScrub}
          >
            {waveData.map((height, i) => {
              const isPlayed = (i / waveData.length) * 100 <= progressPercent;
              return (
                <div 
                  key={i}
                  className={`flex-1 rounded-full transition-colors duration-300 ${isPlayed ? 'bg-primary shadow-[0_0_8px_rgba(201,162,39,0.5)]' : 'bg-surface-container-highest group-hover:bg-surface-container-highest/80'}`}
                  style={{ height: `${height}%` }}
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
          <button className="text-on-surface-variant hover:text-primary transition-colors p-2"><IconArrowsShuffle size={28} /></button>
          
          <div className="flex items-center gap-4 sm:gap-8">
            <button onClick={onPrev} className="text-on-surface hover:text-primary transition-colors p-2">
              <IconPlayerSkipBackFilled size={36} />
            </button>
            <button 
              onClick={togglePlay}
              className="w-[84px] h-[84px] rounded-full bg-primary text-on-primary flex items-center justify-center shadow-[0_0_20px_rgba(201,162,39,0.3)] hover:scale-105 transition-transform shrink-0"
            >
              {isPlaying ? <IconPlayerPauseFilled size={40} /> : <IconPlayerPlayFilled size={40} className="translate-x-1" />}
            </button>
            <button onClick={onNext} className="text-on-surface hover:text-primary transition-colors p-2">
              <IconPlayerSkipForwardFilled size={36} />
            </button>
          </div>

          <button className="text-on-surface-variant hover:text-primary transition-colors p-2"><IconRepeat size={28} /></button>
        </div>

          {/* Bottom Bar (Volume, etc) */}
          <div className="flex justify-center items-center gap-4 text-on-surface-variant hidden md:flex mt-4">
            <IconVolume size={24} />
            <div className="w-1/3 h-1.5 bg-surface-container-highest rounded-full cursor-pointer">
              <div className="w-2/3 h-full bg-on-surface-variant rounded-full"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
