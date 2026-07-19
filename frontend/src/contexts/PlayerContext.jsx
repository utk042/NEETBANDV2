import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { getSongs, recordSongPlay, recordSongComplete, recordSongDropOff, recordSongRepeat, recordSongShare } from '../services/api';
import { useDialog } from './DialogContext';
import SharePopup from '../components/Common/SharePopup';

const PlayerContext = createContext(null);

// Use the global API_URL pattern consistent with api.js
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export function PlayerProvider({ children, user }) {
  const [globalTracks, setGlobalTracks] = useState([]);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [queue, setQueue] = useState([]);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isShuffled, setIsShuffled] = useState(false);
  const [repeatMode, setRepeatMode] = useState('none'); // 'none' | 'one' | 'all'
  const [favoritedTrackIds, setFavoritedTrackIds] = useState([]);
  const [recentlyPlayedTrackIds, setRecentlyPlayedTrackIds] = useState(() => {
    try { return JSON.parse(localStorage.getItem('neetband_recently_played') || '[]'); } catch { return []; }
  });

  // Ad state
  const [adAudioUrls, setAdAudioUrls] = useState([]);
  const [isPlayingAd, setIsPlayingAd] = useState(false);
  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  const adQueueRef = useRef(null); // pending song to play after ads
  const [showSharePopup, setShowSharePopup] = useState(false);
  const [playedWatermarks, setPlayedWatermarks] = useState([]);
  const { confirm } = useDialog();

  const audioRef = useRef(null); // main audio element (in DOM via PlayerProvider render)
  const adAudioRef = useRef(null); // ad audio element (pre-roll)
  const midRollAudioRef = useRef(null); // mid-roll ad audio element
  const watermarkAudioRef = useRef(null); // watermark audio element
  const pipVideoRef = useRef(null); // hidden video for PIP
  const canvasRef = useRef(null); // canvas for album art
  const animFrameRef = useRef(null);

  // Drop-off tracking
  const lastDropOffSegment = useRef(-1);

  // Global Ad Config state
  const [adConfig, setAdConfig] = useState(null);
  const [playedAudioRolls, setPlayedAudioRolls] = useState([]);
  const [playedPopups, setPlayedPopups] = useState([]);
  const [showConfigPopup, setShowConfigPopup] = useState(false);

  // Fetch songs on mount
  useEffect(() => {
    getSongs().then(data => {
      const mapped = data.map(s => {
        const durationSecs = s.duration || 200;
        let formattedDuration = '';
        if (typeof durationSecs === 'number' || !isNaN(Number(durationSecs))) {
          const totalSecs = Number(durationSecs);
          const mins = Math.floor(totalSecs / 60);
          const secs = Math.floor(totalSecs % 60);
          formattedDuration = `${mins}:${secs < 10 ? '0' : ''}${secs}`;
        } else {
          formattedDuration = String(durationSecs);
        }

        return {
          ...s,
          id: s._id,
          grade: s.class,
          cover: s.thumbnailUrl || '',
          durationSeconds: durationSecs,
          duration: formattedDuration,
          premium: s.isPremium,
        };
      });
      setGlobalTracks(mapped);
      if (mapped.length > 0 && !currentTrack) setCurrentTrack(mapped[0]);
    }).catch(console.error);
  }, []);

  // Fetch ad URLs
  useEffect(() => {
    fetch(`${API_URL}/ads`)
      .then(r => r.json())
      .then(data => setAdAudioUrls(data.ads || []))
      .catch(() => setAdAudioUrls([]));
  }, []);

  // Fetch global Ad Config
  useEffect(() => {
    fetch(`${API_URL}/api/ad-config`)
      .then(r => r.json())
      .then(data => setAdConfig(data))
      .catch(() => setAdConfig(null));
  }, []);

  // Sync volume & mute to audio element
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted, currentTrack]);



  // Track time updates & drop-off tracking
  const handleTimeUpdate = useCallback(() => {
    if (!audioRef.current || !currentTrack) return;
    const t = audioRef.current.currentTime;
    setCurrentTime(t);
    const d = audioRef.current.duration || currentTrack.durationSeconds || 1;
    const pct = t / d;
    const segment = Math.min(Math.floor(pct * 10), 9);
    if (segment !== lastDropOffSegment.current && segment >= 0) {
      lastDropOffSegment.current = segment;
      if (currentTrack._id || currentTrack.id) {
        recordSongDropOff(currentTrack._id || currentTrack.id, segment).catch(() => {});
      }
    }

    // Guest user restriction (only 1st song of every chapter is free up to 20%)
    const isFirstSongOfChapter = globalTracks.find(t => t.chapter === currentTrack.chapter)?.id === (currentTrack._id || currentTrack.id);

    if (!user?.isLoggedIn && pct >= 0.2) {
      // Whether it's the 1st song or somehow a bypassed 2nd song, cut off at 20%
      audioRef.current.pause();
      setIsPlaying(false);
      confirm("Login Required", "Please login to continue listening.", {
        showCancel: false,
        confirmText: 'Login',
        confirmClass: 'bg-primary hover:bg-primary/95'
      }).then(res => {
        if (res) window.location.href = '/login';
      });
      return;
    }

    // Watermark/Ads logic for free users
    if (!user?.isPremium && currentTrack.watermarkUrl && currentTrack.watermarkPositions && currentTrack.watermarkPositions.length > 0) {
      const pct100 = pct * 100;
      const pos = currentTrack.watermarkPositions.find(p => pct100 >= p && pct100 < p + 2); // Trigger within a small window
      if (pos !== undefined && !playedWatermarks.includes(pos)) {
        setPlayedWatermarks(prev => [...prev, pos]);
        if (watermarkAudioRef.current) {
          audioRef.current.volume = 0.2; // Dip main volume
          watermarkAudioRef.current.src = currentTrack.watermarkUrl;
          watermarkAudioRef.current.currentTime = 0;
          watermarkAudioRef.current.play().catch(e => console.error(e));
          setShowSharePopup(true);
        }
      }
    }

    // Unified Audio Roll & Popup Ad Logic (Guests & Non-Premium)
    if (!user?.isPremium && adConfig) {
      const pct100 = pct * 100;

      // Audio Roll Check
      if (adConfig.audioRollPositions && adConfig.audioRollUrl) {
        const audioPos = adConfig.audioRollPositions.find(p => pct100 >= p && pct100 < p + 2);
        if (audioPos !== undefined && !playedAudioRolls.includes(audioPos)) {
          setPlayedAudioRolls(prev => [...prev, audioPos]);
          // Pause main audio, play audio roll ad
          audioRef.current.pause();
          setIsPlaying(false);
          
          if (midRollAudioRef.current) {
            midRollAudioRef.current.src = adConfig.audioRollUrl;
            midRollAudioRef.current.currentTime = 0;
            midRollAudioRef.current.play().catch(e => console.error(e));
          }
        }
      }

      // Popup Check
      if (adConfig.popupPositions && adConfig.popupHtml) {
        const popupPos = adConfig.popupPositions.find(p => pct100 >= p && pct100 < p + 2);
        if (popupPos !== undefined && !playedPopups.includes(popupPos)) {
          setPlayedPopups(prev => [...prev, popupPos]);
          setShowConfigPopup(true);
        }
      }
    }
  }, [currentTrack, user, playedWatermarks, playedAudioRolls, playedPopups, adConfig, confirm, globalTracks]);

  const handleLoadedMetadata = useCallback(() => {
    if (audioRef.current) setDuration(audioRef.current.duration);
  }, []);

  // Play ad sequence then the actual track
  const playWithAds = useCallback(async (track) => {
    // Guest Limit check
    const isFirstSongOfChapter = globalTracks.find(t => t.chapter === track.chapter)?.id === (track._id || track.id);
    
    if (!user?.isLoggedIn && !isFirstSongOfChapter) {
      // Guests cannot play anything except the 1st song of a chapter
      confirm("Login Required", "Please login to access more songs.", {
        showCancel: false,
        confirmText: 'Login',
        confirmClass: 'bg-primary hover:bg-primary/95'
      }).then(res => {
        if (res) window.location.href = '/login';
      });
      return;
    }

    const isPremium = user?.isPremium;
    if (isPremium || adAudioUrls.length === 0 || !track.audioUrl) {
      // No ads — play directly
      setCurrentTrack(track);
      setIsPlayingAd(false);
      setIsPlaying(true);
      lastDropOffSegment.current = -1;
      if (track._id || track.id) recordSongPlay(track._id || track.id).catch(() => {});
      return;
    }
    // Queue ads then the real track
    adQueueRef.current = track;
    setCurrentAdIndex(0);
    setIsPlayingAd(true);
    setIsPlaying(false);
  }, [adAudioUrls, user, confirm, globalTracks]);

  // Handle ad ended
  const handleAdEnded = useCallback(() => {
    const nextIdx = currentAdIndex + 1;
    if (nextIdx < adAudioUrls.length) {
      setCurrentAdIndex(nextIdx);
    } else {
      // All ads done — play the real track
      const track = adQueueRef.current;
      setIsPlayingAd(false);
      setCurrentTrack(track);
      setIsPlaying(true);
      lastDropOffSegment.current = -1;
      if (track?._id || track?.id) recordSongPlay(track._id || track.id).catch(() => {});
    }
  }, [currentAdIndex, adAudioUrls.length]);

  // Handle song ended
  const handleEnded = useCallback(() => {
    if (!currentTrack) return;
    const id = currentTrack._id || currentTrack.id;
    if (id) recordSongComplete(id).catch(() => {});
    if (repeatMode === 'one') {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
      if (id) recordSongRepeat(id).catch(() => {});
      return;
    }
    handleNext();
  }, [currentTrack, repeatMode]);

  const handleNext = useCallback(() => {
    const list = queue.length > 0 ? queue : globalTracks;
    if (list.length === 0) return;
    let idx = list.findIndex(t => t.id === currentTrack?.id);
    let nextIdx;
    if (isShuffled) {
      nextIdx = Math.floor(Math.random() * list.length);
    } else if (repeatMode === 'all') {
      nextIdx = (idx + 1) % list.length;
    } else {
      nextIdx = idx + 1;
      if (nextIdx >= list.length) { setIsPlaying(false); return; }
    }
    const next = list[nextIdx];
    if (!next) return;
    playWithAds(next);
  }, [queue, globalTracks, currentTrack, isShuffled, repeatMode, playWithAds]);

  const handlePrev = useCallback(() => {
    const list = queue.length > 0 ? queue : globalTracks;
    if (list.length === 0) return;
    // If >3s into track, restart it
    if (audioRef.current && audioRef.current.currentTime > 3) {
      audioRef.current.currentTime = 0;
      return;
    }
    const idx = list.findIndex(t => t.id === currentTrack?.id);
    const prevIdx = (idx - 1 + list.length) % list.length;
    playWithAds(list[prevIdx]);
  }, [queue, globalTracks, currentTrack, playWithAds]);

  const handleSeek = useCallback((time) => {
    setCurrentTime(time);
    if (audioRef.current) audioRef.current.currentTime = time;
  }, []);

  const togglePlay = useCallback(() => {
    if (!currentTrack?.audioUrl) return;
    if (isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
    } else {
      audioRef.current?.play().catch(() => setIsPlaying(false));
      setIsPlaying(true);
    }
  }, [isPlaying, currentTrack]);

  const handleTrackSelect = useCallback((track) => {
    if (currentTrack?.id === track.id) {
      togglePlay();
    } else {
      playWithAds(track);
      // Update recently played
      setRecentlyPlayedTrackIds(prev => {
        const filtered = prev.filter(id => id !== track.id);
        const next = [track.id, ...filtered].slice(0, 10);
        localStorage.setItem('neetband_recently_played', JSON.stringify(next));
        return next;
      });
    }
  }, [currentTrack, togglePlay, playWithAds]);

  const toggleFavorite = useCallback((trackId) => {
    setFavoritedTrackIds(prev =>
      prev.includes(trackId) ? prev.filter(id => id !== trackId) : [...prev, trackId]
    );
  }, []);

  const cycleRepeat = useCallback(() => {
    setRepeatMode(prev => prev === 'none' ? 'one' : prev === 'one' ? 'all' : 'none');
  }, []);

  const handleShare = useCallback((track) => {
    const t = track || currentTrack;
    if (!t) return;
    if (navigator.share) {
      navigator.share({ title: t.title, text: `Listen to ${t.title} on NeetBand!`, url: window.location.href });
    }
    if (t._id || t.id) recordSongShare(t._id || t.id).catch(() => {});
  }, [currentTrack]);

  // PIP support (premium only)
  const requestPip = useCallback(async () => {
    if (!currentTrack || !user?.isPremium) return;
    try {
      if (!pipVideoRef.current) return;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      canvas.width = 512;
      canvas.height = 512;
      
      const img = new Image();
      img.crossOrigin = 'anonymous';
      if (currentTrack.cover) {
        img.src = currentTrack.cover;
      }
      
      // Draw album art onto canvas
      const drawFrame = () => {
        ctx.fillStyle = '#0d1b2a';
        ctx.fillRect(0, 0, 512, 512);
        
        if (img.complete && img.naturalHeight !== 0) {
          ctx.drawImage(img, 0, 0, 512, 512);
        }
        
        // Draw title
        ctx.fillStyle = '#ecc246';
        ctx.font = 'bold 28px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(currentTrack.title || '', 256, 460);
        animFrameRef.current = requestAnimationFrame(drawFrame);
      };
      drawFrame();
      const stream = canvas.captureStream(24);
      pipVideoRef.current.srcObject = stream;
      await pipVideoRef.current.play();
      await pipVideoRef.current.requestPictureInPicture();
    } catch (e) {
      console.warn('PIP failed:', e);
    }
  }, [currentTrack, user]);

  // Sync play/pause to audio element when isPlaying changes
  useEffect(() => {
    if (!audioRef.current || isPlayingAd) return;
    if (isPlaying) {
      audioRef.current.play().catch(() => setIsPlaying(false));
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying, isPlayingAd]);

  // When track changes, reset and play
  useEffect(() => {
    if (!currentTrack?.audioUrl || !audioRef.current) return;
    audioRef.current.src = currentTrack.audioUrl;
    audioRef.current.load();
    lastDropOffSegment.current = -1;
    setPlayedWatermarks([]); // reset played watermarks
    setPlayedAudioRolls([]); // reset ad triggers
    setPlayedPopups([]);
    setShowConfigPopup(false);
    if (isPlaying) {
      audioRef.current.play().catch(() => setIsPlaying(false));
    }
  }, [currentTrack?.audioUrl]);

  // When ad index changes and ads are playing, update ad audio src
  useEffect(() => {
    if (!isPlayingAd || !adAudioRef.current) return;
    const url = adAudioUrls[currentAdIndex];
    if (!url) { handleAdEnded(); return; }
    adAudioRef.current.src = url;
    adAudioRef.current.load();
    adAudioRef.current.play().catch(() => handleAdEnded());
  }, [isPlayingAd, currentAdIndex]);

  const value = {
    globalTracks, setGlobalTracks,
    currentTrack, setCurrentTrack,
    isPlaying, setIsPlaying,
    currentTime, setCurrentTime,
    duration,
    queue, setQueue,
    isMuted, setIsMuted,
    volume, setVolume,
    isShuffled, setIsShuffled,
    repeatMode, cycleRepeat,
    favoritedTrackIds, toggleFavorite,
    recentlyPlayedTrackIds,
    isPlayingAd, currentAdIndex, adAudioUrls,
    togglePlay, handleTrackSelect, handleNext, handlePrev, handleSeek,
    handleShare, requestPip,
    audioRef, // expose for components that need direct access
    showConfigPopup, setShowConfigPopup, adConfig // expose popup state
  };

  // Update Media Session API
  useEffect(() => {
    if (!currentTrack || !('mediaSession' in navigator)) return;
    navigator.mediaSession.metadata = new MediaMetadata({
      title: currentTrack.title || 'NeetBand',
      artist: currentTrack.subject || 'NeetBand',
      album: currentTrack.chapter || currentTrack.grade || '',
      artwork: currentTrack.cover ? [{ src: currentTrack.cover, sizes: '512x512', type: 'image/png' }] : [],
    });
    navigator.mediaSession.setActionHandler('play', () => { audioRef.current?.play(); setIsPlaying(true); });
    navigator.mediaSession.setActionHandler('pause', () => { audioRef.current?.pause(); setIsPlaying(false); });
    navigator.mediaSession.setActionHandler('previoustrack', handlePrev);
    navigator.mediaSession.setActionHandler('nexttrack', handleNext);
  }, [currentTrack, handlePrev, handleNext]);

  return (
    <PlayerContext.Provider value={value}>
      {/* Global singleton audio elements */}
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        preload="metadata"
        style={{ display: 'none' }}
      />
      <audio
        ref={adAudioRef}
        onEnded={handleAdEnded}
        preload="metadata"
        style={{ display: 'none' }}
      />
      <audio
        ref={midRollAudioRef}
        onEnded={() => {
          if (audioRef.current) {
            audioRef.current.play().catch(e => console.error(e));
            setIsPlaying(true);
          }
        }}
        preload="auto"
        style={{ display: 'none' }}
      />
      <audio
        ref={watermarkAudioRef}
        onEnded={() => {
          if (audioRef.current && !isMuted) audioRef.current.volume = volume;
        }}
        preload="auto"
        style={{ display: 'none' }}
      />
      {/* Hidden video + canvas for PIP */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      <video ref={pipVideoRef} style={{ display: 'none' }} muted playsInline />
      {/* Ad banner overlay when ad is playing */}
      {isPlayingAd && (
        <div
          style={{
            position: 'fixed', bottom: 96, left: '50%', transform: 'translateX(-50%)',
            background: 'rgba(13,27,42,0.95)', border: '1px solid rgba(236,194,70,0.3)',
            borderRadius: 12, padding: '10px 20px', zIndex: 9999,
            color: '#ecc246', fontSize: 13, fontWeight: 700, backdropFilter: 'blur(10px)',
            display: 'flex', alignItems: 'center', gap: 10,
            boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
            pointerEvents: 'none',
          }}
        >
          <span
            className="animate-pulse"
            style={{ width: 8, height: 8, borderRadius: '50%', background: '#ecc246', display: 'inline-block' }}
          />
          Ad {currentAdIndex + 1} of {adAudioUrls.length} — Song plays after
        </div>
      )}
      <SharePopup 
        isOpen={showSharePopup} 
        onClose={() => setShowSharePopup(false)} 
        shareUrl={window.location.href}
        title={currentTrack?.title}
      />
      
      {/* HTML Config Popup Modal */}
      {showConfigPopup && adConfig?.popupHtml && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-surface relative border border-outline-variant/30 rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setShowConfigPopup(false)}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-surface-variant/50 hover:bg-surface-variant text-on-surface-variant hover:text-on-surface transition-colors z-10"
            >
              ✕
            </button>
            <div 
              className="p-6 pt-10"
              dangerouslySetInnerHTML={{ __html: adConfig.popupHtml }} 
            />
          </div>
        </div>
      )}

      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error('usePlayer must be used within PlayerProvider');
  return ctx;
}
