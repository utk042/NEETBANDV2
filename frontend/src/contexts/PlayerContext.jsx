import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { getSongs, recordSongPlay, recordSongComplete, recordSongDropOff, recordSongRepeat, recordSongShare } from '../services/api';
import { useDialog } from './DialogContext';
import logoImg from '../assets/logo.png';
import { resolveAudioUrl, formatTime } from '../utils/urlUtils';

const PlayerContext = createContext(null);

// Use the global API_URL pattern consistent with api.js
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export function PlayerProvider({ children, user }) {
  const [globalTracks, setGlobalTracks] = useState([]);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
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

  // Track & playback state
  const [playbackError, setPlaybackError] = useState(null);

  // Ad state
  const [adAudioUrls, setAdAudioUrls] = useState([]);
  const [isPlayingAd, setIsPlayingAd] = useState(false);
  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  const adQueueRef = useRef(null); // pending song to play after ads

  const [playedWatermarks, setPlayedWatermarks] = useState([]);
  const playedWatermarksRef = useRef([]);

  const { confirm } = useDialog();

  const audioRef = useRef(null); // main audio element (in DOM via PlayerProvider render)
  const audioRetryCountRef = useRef(0);
  const retryTimeoutRef = useRef(null);
  const activePlayRequestIdRef = useRef(0);
  const isPlayingRef = useRef(false);
  isPlayingRef.current = isPlaying;
  const isMutedRef = useRef(isMuted);
  isMutedRef.current = isMuted;
  const volumeRef = useRef(volume);
  volumeRef.current = volume;
  const pendingSeekTimeRef = useRef(null);
  const currentAdIndexRef = useRef(0);

  const adAudioRef = useRef(null); // ad audio element (pre-roll)
  const midRollAudioRef = useRef(null); // mid-roll ad audio element
  const watermarkAudioRef = useRef(null); // watermark audio element
  const guestAdAudioRef = useRef(null); // guest ad audio element
  const [playedGuestAd, setPlayedGuestAd] = useState(false);
  const pipVideoRef = useRef(null); // hidden video for PIP
  const canvasRef = useRef(null); // canvas for album art
  const animFrameRef = useRef(null);

  // Drop-off tracking
  const lastDropOffSegment = useRef(-1);

  // Global Ad Config state
  const [adConfig, setAdConfig] = useState(null);
  const [playedAudioRolls, setPlayedAudioRolls] = useState([]);
  const playedAudioRollsRef = useRef([]);

  const [playedPopups, setPlayedPopups] = useState([]);
  const playedPopupsRef = useRef([]);

  const [showConfigPopup, setShowConfigPopup] = useState(false);

  // Audio roll & guest roll state tracking (with synchronous ref control to block race conditions)
  const [isAudioRollActive, setIsAudioRollActive] = useState(false);
  const isAudioRollActiveRef = useRef(false);

  const [activeRollType, setActiveRollType] = useState(null); // 'midroll' | 'guestAd' | null
  const [pendingSeekTime, setPendingSeekTime] = useState(null);

  const isDuckedRef = useRef(false);

  const setAudioRollActive = useCallback((val) => {
    isAudioRollActiveRef.current = val;
    setIsAudioRollActive(val);
  }, []);

  // Helper to stop all ad audio elements cleanly and restore main volume
  const stopAllAdAudio = useCallback(() => {
    isDuckedRef.current = false;
    isAudioRollActiveRef.current = false;
    setIsAudioRollActive(false);
    setActiveRollType(null);
    setIsPlayingAd(false);
    adQueueRef.current = null;

    if (adAudioRef.current) {
      try {
        adAudioRef.current.pause();
        adAudioRef.current.currentTime = 0;
      } catch (e) {}
    }
    if (midRollAudioRef.current) {
      try {
        midRollAudioRef.current.pause();
        midRollAudioRef.current.currentTime = 0;
      } catch (e) {}
    }
    if (guestAdAudioRef.current) {
      try {
        guestAdAudioRef.current.pause();
        guestAdAudioRef.current.currentTime = 0;
      } catch (e) {}
    }
    if (watermarkAudioRef.current) {
      try {
        watermarkAudioRef.current.pause();
        watermarkAudioRef.current.currentTime = 0;
      } catch (e) {}
    }
    if (audioRef.current) {
      const v = isMutedRef.current ? 0 : volumeRef.current;
      audioRef.current.volume = v;
    }
  }, []);

  const stopWatermark = useCallback(() => {
    isDuckedRef.current = false;
    if (watermarkAudioRef.current) {
      try {
        watermarkAudioRef.current.pause();
        watermarkAudioRef.current.currentTime = 0;
      } catch (e) {}
    }
    if (audioRef.current) {
      const v = isMutedRef.current ? 0 : volumeRef.current;
      audioRef.current.volume = v;
    }
  }, []);

  // Synchronous ref state helpers for event listeners
  const updatePlayedAudioRolls = useCallback((val) => {
    const next = typeof val === 'function' ? val(playedAudioRollsRef.current) : val;
    playedAudioRollsRef.current = next;
    setPlayedAudioRolls(next);
  }, []);

  const updatePlayedWatermarks = useCallback((val) => {
    const next = typeof val === 'function' ? val(playedWatermarksRef.current) : val;
    playedWatermarksRef.current = next;
    setPlayedWatermarks(next);
  }, []);

  const updatePlayedPopups = useCallback((val) => {
    const next = typeof val === 'function' ? val(playedPopupsRef.current) : val;
    playedPopupsRef.current = next;
    setPlayedPopups(next);
  }, []);

  const cancelPendingRetry = useCallback(() => {
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }
  }, []);

  // Safe play helper handling Promise rejections (e.g. AbortError or NotAllowedError)
  const safePlay = useCallback((audioEl, requestId) => {
    if (!audioEl) return Promise.reject(new Error('No audio element provided'));
    const promise = audioEl.play();
    if (promise !== undefined) {
      return promise.catch(err => {
        if (err && (err.name === 'AbortError' || err.name === 'NotAllowedError')) {
          console.warn('Audio play request interrupted or user interaction needed:', err.message || err);
        } else {
          console.error('Audio play error:', err);
        }
        if (requestId !== undefined && requestId !== activePlayRequestIdRef.current) {
          return;
        }
        throw err;
      });
    }
    return Promise.resolve();
  }, []);

  // Native media event listeners for main audio element synchronization
  const handleAudioPlay = useCallback(() => {
    if (!isPlayingAd && !isAudioRollActiveRef.current) {
      setIsPlaying(true);
      setIsBuffering(false);
    }
  }, [isPlayingAd]);

  const handleAudioPause = useCallback(() => {
    if (!isPlayingAd && !isAudioRollActiveRef.current) {
      setIsPlaying(false);
      stopWatermark();
    }
  }, [isPlayingAd, stopWatermark]);

  const handleAudioWaiting = useCallback(() => {
    setIsBuffering(true);
  }, []);

  const handleAudioPlaying = useCallback(() => {
    setIsBuffering(false);
  }, []);

  const handleAudioDurationChange = useCallback(() => {
    if (audioRef.current) {
      const rawDur = audioRef.current.duration;
      if (!isNaN(rawDur) && isFinite(rawDur) && rawDur > 0) {
        setDuration(rawDur);
      }
    }
  }, []);

  // Fetch songs on mount
  useEffect(() => {
    getSongs().then(data => {
      const mapped = data.map(s => {
        const durationSecs = Number(s.duration) || 200;
        const formattedDuration = formatTime(durationSecs);
        const resolvedAudio = resolveAudioUrl(s.audioUrl);
        const resolvedWatermark = s.watermarkUrl ? resolveAudioUrl(s.watermarkUrl) : '';

        return {
          ...s,
          id: s._id || s.id,
          grade: s.class,
          cover: s.thumbnailUrl || logoImg,
          durationSeconds: durationSecs,
          duration: formattedDuration,
          songType: s.songType || 'Study',
          audioUrl: resolvedAudio,
          watermarkUrl: resolvedWatermark,
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

  // Sync volume & mute to all audio elements
  useEffect(() => {
    const v = isMuted ? 0 : volume;
    const mainV = isDuckedRef.current ? v * 0.2 : v;
    if (audioRef.current) audioRef.current.volume = mainV;
    if (adAudioRef.current) adAudioRef.current.volume = v;
    if (midRollAudioRef.current) midRollAudioRef.current.volume = v;
    if (guestAdAudioRef.current) guestAdAudioRef.current.volume = v;
    if (watermarkAudioRef.current) watermarkAudioRef.current.volume = v;
  }, [volume, isMuted]);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      cancelPendingRetry();
    };
  }, [cancelPendingRetry]);

  // Sync state values to refs for use in async event handlers
  useEffect(() => { pendingSeekTimeRef.current = pendingSeekTime; }, [pendingSeekTime]);
  useEffect(() => { currentAdIndexRef.current = currentAdIndex; }, [currentAdIndex]);

  const showGuestLoginPrompt = useCallback(() => {
    confirm("Login Required", "Please login to continue listening.", {
      showCancel: false,
      confirmText: 'Login',
      confirmClass: 'bg-primary hover:bg-primary/95'
    }).then(res => {
      if (res) window.location.href = '/login';
    });
  }, [confirm]);

  const handleAudioError = useCallback((e) => {
    if (!audioRef.current || !currentTrack?.audioUrl) return;
    if (!audioRef.current.src || audioRef.current.src === window.location.href) return;

    console.warn('Audio playback error encountered:', e);
    cancelPendingRetry();

    if (audioRetryCountRef.current < 3) {
      audioRetryCountRef.current += 1;
      const delay = Math.pow(2, audioRetryCountRef.current - 1) * 1000; // 1s, 2s, 4s backoff
      console.log(`Retrying audio playback (Attempt ${audioRetryCountRef.current}/3) in ${delay}ms...`);
      retryTimeoutRef.current = setTimeout(() => {
        if (audioRef.current && currentTrack?.audioUrl) {
          const targetUrl = resolveAudioUrl(currentTrack.audioUrl);
          if (audioRef.current.src !== targetUrl) {
            audioRef.current.src = targetUrl;
          }
          audioRef.current.load();
          if (isPlayingRef.current && !isAudioRollActiveRef.current) {
            safePlay(audioRef.current, activePlayRequestIdRef.current).catch(err => {
              console.error('Retry play failed:', err);
              setIsPlaying(false);
            });
          }
        }
      }, delay);
    } else {
      setIsPlaying(false);
      setIsBuffering(false);
      setPlaybackError("Failed to load audio stream after multiple retries. Please check your internet connection.");
    }
  }, [currentTrack, safePlay, cancelPendingRetry]);

  const retryPlayback = useCallback(() => {
    setPlaybackError(null);
    audioRetryCountRef.current = 0;
    cancelPendingRetry();

    if (audioRef.current && currentTrack?.audioUrl) {
      const targetUrl = resolveAudioUrl(currentTrack.audioUrl);
      audioRef.current.src = targetUrl;
      audioRef.current.load();
      safePlay(audioRef.current, activePlayRequestIdRef.current).then(() => {
        setIsPlaying(true);
        setIsBuffering(false);
      }).catch(err => {
        console.error('Manual retry play failed:', err);
        setIsPlaying(false);
        setIsBuffering(false);
        setPlaybackError("Failed to load audio stream after multiple retries. Please check your internet connection.");
      });
    }
  }, [currentTrack, safePlay, cancelPendingRetry]);

  // Track time updates & drop-off tracking
  const handleTimeUpdate = useCallback(() => {
    if (!audioRef.current || !currentTrack) return;
    const rawTime = audioRef.current.currentTime;
    const t = (isNaN(rawTime) || !isFinite(rawTime) || rawTime < 0) ? 0 : rawTime;
    setCurrentTime(t);

    const rawDur = audioRef.current.duration;
    const fallbackDur = currentTrack.durationSeconds || 0;
    const d = (rawDur && isFinite(rawDur) && rawDur > 0) ? rawDur : (fallbackDur > 0 ? fallbackDur : 0);

    if (d <= 0) return;

    let pct = t / d;
    if (isNaN(pct) || !isFinite(pct) || pct < 0) pct = 0;
    if (pct > 1) pct = 1;

    const segment = Math.min(Math.floor(pct * 10), 9);
    if (segment !== lastDropOffSegment.current && segment >= 0) {
      lastDropOffSegment.current = segment;
      const id = currentTrack._id || currentTrack.id;
      if (id) {
        recordSongDropOff(id, segment);
      }
    }

    const isNormalSong = currentTrack.songType === 'Normal';

    // Guest user restriction (only 1st song of every chapter is free up to 20%)
    const trackId = currentTrack._id || currentTrack.id;
    const isFirstSongOfChapter = currentTrack.chapter
      ? (globalTracks.find(t => t.chapter === currentTrack.chapter)?.id === trackId || globalTracks.find(t => t.chapter === currentTrack.chapter)?._id === trackId)
      : true;

    if (!isNormalSong && !user?.isLoggedIn && isFirstSongOfChapter && pct >= 0.2) {
      if (!playedGuestAd) {
        setPlayedGuestAd(true);
        audioRef.current.pause();
        setIsPlaying(false);

        if (guestAdAudioRef.current && adConfig?.guestAdUrl) {
          const finalUrl = resolveAudioUrl(adConfig.guestAdUrl);
          setAudioRollActive(true);
          setActiveRollType('guestAd');
          guestAdAudioRef.current.src = finalUrl;
          guestAdAudioRef.current.load();
          guestAdAudioRef.current.currentTime = 0;
          safePlay(guestAdAudioRef.current).catch(e => {
            console.error('Failed to play guest ad', e);
            setAudioRollActive(false);
            setActiveRollType(null);
            showGuestLoginPrompt();
          });
        } else {
          showGuestLoginPrompt();
        }
      } else {
        audioRef.current.pause();
        setIsPlaying(false);
        showGuestLoginPrompt();
      }
      return;
    }

    // Watermark logic for free users
    if (!isNormalSong && !user?.isPremium && currentTrack.watermarkUrl && currentTrack.watermarkPositions && currentTrack.watermarkPositions.length > 0) {
      const pct100 = pct * 100;
      const currentWatermarks = playedWatermarksRef.current;
      const pos = currentTrack.watermarkPositions.find(p => pct100 >= p && !currentWatermarks.includes(p));
      if (pos !== undefined) {
        updatePlayedWatermarks(prev => [...prev, pos]);
        if (watermarkAudioRef.current) {
          isDuckedRef.current = true;
          const baseVol = isMutedRef.current ? 0 : volumeRef.current;
          audioRef.current.volume = baseVol * 0.2; // Dip main volume proportionally
          watermarkAudioRef.current.src = resolveAudioUrl(currentTrack.watermarkUrl);
          watermarkAudioRef.current.load();
          watermarkAudioRef.current.currentTime = 0;
          safePlay(watermarkAudioRef.current).catch(e => {
            console.error('Watermark play error:', e);
            stopWatermark();
          });
        }
      }
    }

    // Unified Audio Roll & Popup Ad Logic (Guests & Non-Premium)
    if (!isNormalSong && !user?.isPremium && !isAudioRollActiveRef.current) {
      const pct100 = pct * 100;
      const audioRollsActive = currentTrack.audioRollsEnabled ?? adConfig?.audioRollsEnabled ?? true;
      const popupsActive = currentTrack.popupsEnabled ?? adConfig?.popupsEnabled ?? true;

      const audioPositions = adConfig?.audioRollPositions;
      const audioUrl = adConfig?.audioRollUrl;
      const currentRolls = playedAudioRollsRef.current;

      if (audioRollsActive && audioPositions && audioPositions.length > 0 && audioUrl) {
        const unplayedPositions = audioPositions.filter(p => pct100 >= p && !currentRolls.includes(p));
        if (unplayedPositions.length > 0) {
          const audioPos = Math.min(...unplayedPositions);
          updatePlayedAudioRolls(prev => [...prev, audioPos]);

          // Pause main audio, play audio roll ad
          audioRef.current.pause();
          setIsPlaying(false);
          setAudioRollActive(true);
          setActiveRollType('midroll');
          
          if (midRollAudioRef.current) {
            const finalUrl = resolveAudioUrl(audioUrl);
            midRollAudioRef.current.src = finalUrl;
            midRollAudioRef.current.load();
            midRollAudioRef.current.currentTime = 0;
            safePlay(midRollAudioRef.current).catch(e => {
              console.error('Audio roll playback error:', e);
              setAudioRollActive(false);
              setActiveRollType(null);
              if (audioRef.current) {
                audioRef.current.volume = isMutedRef.current ? 0 : volumeRef.current;
                safePlay(audioRef.current, activePlayRequestIdRef.current).catch(err => console.error(err));
                setIsPlaying(true);
              }
            });
          }
        }
      }

      // Popup Check
      const popupPositions = (currentTrack.popupPositions && currentTrack.popupPositions.length > 0)
        ? currentTrack.popupPositions
        : adConfig?.popupPositions;
      const popupHtml = currentTrack.popupHtml || adConfig?.popupHtml;
      const currentPopups = playedPopupsRef.current;

      if (popupsActive && popupPositions && popupPositions.length > 0 && popupHtml) {
        const popupPos = popupPositions.find(p => pct100 >= p && pct100 < p + 2);
        if (popupPos !== undefined && !currentPopups.includes(popupPos)) {
          updatePlayedPopups(prev => [...prev, popupPos]);
          setShowConfigPopup(true);
        }
      }
    }
  }, [currentTrack, user, adConfig, globalTracks, playedGuestAd, showGuestLoginPrompt, updatePlayedWatermarks, updatePlayedAudioRolls, updatePlayedPopups, safePlay, stopWatermark, setAudioRollActive]);

  const handleLoadedMetadata = useCallback(() => {
    if (audioRef.current) {
      const rawDur = audioRef.current.duration;
      const validDur = (isNaN(rawDur) || !isFinite(rawDur) || rawDur < 0) ? 0 : rawDur;
      setDuration(validDur);

      if (pendingSeekTime !== null && !isAudioRollActiveRef.current) {
        const target = Math.max(0, Math.min(pendingSeekTime, validDur || pendingSeekTime));
        try {
          audioRef.current.currentTime = target;
          setCurrentTime(target);
        } catch (e) {
          console.warn('Seek on metadata load failed:', e);
        }
        setPendingSeekTime(null);
      }
    }
  }, [pendingSeekTime]);

  // Play ad sequence or directly start the track
  const playWithAds = useCallback((track) => {
    if (!track) return;
    const isNormalSong = track.songType === 'Normal';
    const trackId = track._id || track.id;

    // Guest Limit check
    const isFirstSongOfChapter = track.chapter
      ? (globalTracks.find(t => t.chapter === track.chapter)?.id === trackId || globalTracks.find(t => t.chapter === track.chapter)?._id === trackId)
      : true;
    
    if (!isNormalSong && !user?.isLoggedIn && !isFirstSongOfChapter) {
      confirm("Login Required", "Please login to access more songs.", {
        showCancel: false,
        confirmText: 'Login',
        confirmClass: 'bg-primary hover:bg-primary/95'
      }).then(res => {
        if (res) window.location.href = '/login';
      });
      return;
    }

    stopAllAdAudio();
    setPendingSeekTime(null);
    setCurrentTime(0);

    setPlaybackError(null);
    audioRetryCountRef.current = 0;
    cancelPendingRetry();

    lastDropOffSegment.current = -1;

    const audioRollsActive = track.audioRollsEnabled ?? adConfig?.audioRollsEnabled ?? true;

    if (!isNormalSong && !user?.isPremium && adAudioUrls.length > 0 && track.audioUrl && audioRollsActive) {
      // Queue pre-roll ads
      adQueueRef.current = track;
      setCurrentAdIndex(0);
      setIsPlayingAd(true);
      setIsPlaying(false);
      if (audioRef.current) audioRef.current.pause();
    } else {
      // Direct track playback
      setIsPlayingAd(false);
      setCurrentTrack(track);
      setIsPlaying(true);
      if (trackId) recordSongPlay(trackId);
    }
  }, [user, confirm, globalTracks, cancelPendingRetry, stopAllAdAudio, adAudioUrls, adConfig]);

  // Handle ad ended
  const handleAdEnded = useCallback(() => {
    if (!adQueueRef.current && !isPlayingAd) return;
    const nextIdx = currentAdIndexRef.current + 1;
    if (nextIdx < adAudioUrls.length) {
      currentAdIndexRef.current = nextIdx;
      setCurrentAdIndex(nextIdx);
    } else {
      // All pre-roll ads done — play the queued track
      const track = adQueueRef.current;
      adQueueRef.current = null;
      setIsPlayingAd(false);
      if (track) {
        setCurrentTrack(track);
        setIsPlaying(true);
        lastDropOffSegment.current = -1;
        const id = track._id || track.id;
        if (id) recordSongPlay(id);
      }
    }
  }, [adAudioUrls.length, isPlayingAd]);

  const handleNext = useCallback(() => {
    const list = queue.length > 0 ? queue : globalTracks;
    if (list.length === 0) return;
    const currentId = currentTrack?._id || currentTrack?.id;
    let idx = list.findIndex(t => (t._id || t.id) === currentId);
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

  // Handle song ended
  const handleEnded = useCallback(() => {
    if (!currentTrack) return;
    const id = currentTrack._id || currentTrack.id;
    if (id) recordSongComplete(id);
    if (repeatMode === 'one') {
      updatePlayedWatermarks([]);
      updatePlayedAudioRolls([]);
      updatePlayedPopups([]);
      setPlayedGuestAd(false);
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        safePlay(audioRef.current, activePlayRequestIdRef.current).catch(err => {
          if (err && err.name !== 'AbortError') setIsPlaying(false);
        });
      }
      if (id) recordSongRepeat(id);
      return;
    }
    handleNext();
  }, [currentTrack, repeatMode, handleNext, safePlay, updatePlayedWatermarks, updatePlayedAudioRolls, updatePlayedPopups]);

  const handlePrev = useCallback(() => {
    const list = queue.length > 0 ? queue : globalTracks;
    if (list.length === 0) return;
    // If >3s into track, restart it
    if (audioRef.current && audioRef.current.currentTime > 3) {
      audioRef.current.currentTime = 0;
      return;
    }
    const currentId = currentTrack?._id || currentTrack?.id;
    const idx = list.findIndex(t => (t._id || t.id) === currentId);
    const prevIdx = (idx - 1 + list.length) % list.length;
    playWithAds(list[prevIdx]);
  }, [queue, globalTracks, currentTrack, playWithAds]);

  const handleSeek = useCallback((time) => {
    if (!currentTrack || !audioRef.current) return;
    if (time === null || time === undefined || isNaN(time) || !isFinite(time)) return;

    const rawDur = audioRef.current.duration || currentTrack.durationSeconds || 1;
    const dur = (isNaN(rawDur) || !isFinite(rawDur) || rawDur <= 0) ? 1 : rawDur;
    const clampedTime = Math.max(0, Math.min(time, dur));
    const isNormalSong = currentTrack.songType === 'Normal';

    // If an audio roll is currently playing, queue the pending seek target
    if (isAudioRollActiveRef.current) {
      setPendingSeekTime(clampedTime);
      return;
    }

    stopWatermark();

    // 1. Guest limit enforcement (max 20% of duration for 1st song of chapter)
    const trackId = currentTrack._id || currentTrack.id;
    const isFirstSongOfChapter = currentTrack.chapter
      ? (globalTracks.find(t => t.chapter === currentTrack.chapter)?.id === trackId || globalTracks.find(t => t.chapter === currentTrack.chapter)?._id === trackId)
      : true;
    if (!isNormalSong && !user?.isLoggedIn) {
      const maxAllowedTime = 0.2 * dur;
      if (time >= maxAllowedTime || !isFirstSongOfChapter) {
        const clampedTarget = Math.min(time, maxAllowedTime);
        setCurrentTime(clampedTarget);
        if (audioRef.current && audioRef.current.readyState >= 1) {
          audioRef.current.currentTime = clampedTarget;
        } else {
          setPendingSeekTime(clampedTarget);
        }
        audioRef.current?.pause();
        setIsPlaying(false);

        if (!playedGuestAd && isFirstSongOfChapter) {
          setPlayedGuestAd(true);
          if (guestAdAudioRef.current && adConfig?.guestAdUrl) {
            const finalUrl = resolveAudioUrl(adConfig.guestAdUrl);
            setAudioRollActive(true);
            setActiveRollType('guestAd');
            guestAdAudioRef.current.src = finalUrl;
            guestAdAudioRef.current.load();
            guestAdAudioRef.current.currentTime = 0;
            safePlay(guestAdAudioRef.current).catch(e => {
              console.error('Failed to play guest ad:', e);
              setAudioRollActive(false);
              setActiveRollType(null);
              showGuestLoginPrompt();
            });
          } else {
            showGuestLoginPrompt();
          }
        } else {
          showGuestLoginPrompt();
        }
        return;
      }
    }

    // 2. Audio Roll enforcement for free / non-premium users
    if (!isNormalSong && !user?.isPremium) {
      const targetPct100 = (time / dur) * 100;
      const audioRollsActive = currentTrack.audioRollsEnabled ?? adConfig?.audioRollsEnabled ?? true;
      const audioPositions = adConfig?.audioRollPositions;
      const audioUrl = adConfig?.audioRollUrl;
      const currentRolls = playedAudioRollsRef.current;

      if (audioRollsActive && audioPositions && audioPositions.length > 0 && audioUrl) {
        const skippedUnplayed = audioPositions.filter(p => targetPct100 >= p && !currentRolls.includes(p));
        if (skippedUnplayed.length > 0) {
          const earliestRollPos = Math.min(...skippedUnplayed);
          const rollTime = (earliestRollPos / 100) * dur;

          updatePlayedAudioRolls(prev => [...prev, earliestRollPos]);
          setPendingSeekTime(time);

          setCurrentTime(rollTime);
          if (audioRef.current && audioRef.current.readyState >= 1) {
            audioRef.current.currentTime = rollTime;
          }
          audioRef.current?.pause();
          setIsPlaying(false);

          setAudioRollActive(true);
          setActiveRollType('midroll');
          if (midRollAudioRef.current) {
            const finalUrl = resolveAudioUrl(audioUrl);
            midRollAudioRef.current.src = finalUrl;
            midRollAudioRef.current.load();
            midRollAudioRef.current.currentTime = 0;
            safePlay(midRollAudioRef.current).catch(e => {
              console.error('Audio roll playback error on seek:', e);
              setAudioRollActive(false);
              setActiveRollType(null);
              if (audioRef.current) {
                audioRef.current.volume = isMutedRef.current ? 0 : volumeRef.current;
                if (audioRef.current.readyState >= 1) {
                  audioRef.current.currentTime = time;
                }
                safePlay(audioRef.current, activePlayRequestIdRef.current).catch(err => console.error(err));
                setIsPlaying(true);
              }
            });
          }
          return;
        }
      }
    }

    // Standard seek if no roll skipped or guest limit hit
    setCurrentTime(clampedTime);
    if (audioRef.current) {
      if (audioRef.current.readyState >= 1) {
        audioRef.current.currentTime = clampedTime;
      } else {
        setPendingSeekTime(clampedTime);
      }
    }
  }, [currentTrack, user, globalTracks, playedGuestAd, adConfig, showGuestLoginPrompt, updatePlayedAudioRolls, safePlay, stopWatermark, setAudioRollActive]);

  const togglePlay = useCallback(() => {
    if (isAudioRollActiveRef.current) {
      const activeElement = activeRollType === 'midroll' ? midRollAudioRef.current : guestAdAudioRef.current;
      if (activeElement) {
        if (!activeElement.paused) {
          activeElement.pause();
        } else {
          safePlay(activeElement).catch(e => console.error('Failed to resume ad roll:', e));
        }
      }
      return;
    }

    const trackToPlay = currentTrack || (globalTracks.length > 0 ? globalTracks[0] : null);
    if (!trackToPlay || !trackToPlay.audioUrl) return;
    if (!currentTrack) {
      playWithAds(trackToPlay);
      return;
    }
    if (isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
    } else {
      safePlay(audioRef.current, activePlayRequestIdRef.current)
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    }
  }, [isPlaying, currentTrack, globalTracks, playWithAds, activeRollType, safePlay]);

  const handleTrackSelect = useCallback((track) => {
    const currentId = currentTrack?._id || currentTrack?.id;
    const targetId = track?._id || track?.id;
    if (currentId && currentId === targetId) {
      togglePlay();
    } else {
      playWithAds(track);
      // Update recently played
      if (targetId) {
        setRecentlyPlayedTrackIds(prev => {
          const filtered = prev.filter(id => id !== targetId);
          const next = [targetId, ...filtered].slice(0, 10);
          localStorage.setItem('neetband_recently_played', JSON.stringify(next));
          return next;
        });
      }
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
    const id = t._id || t.id;
    if (id) recordSongShare(id);
  }, [currentTrack]);

  // PIP support (premium only)
  const stopPipAnimation = useCallback(() => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
  }, []);

  const requestPip = useCallback(async () => {
    if (!currentTrack || !user?.isPremium) return;
    try {
      if (!pipVideoRef.current || !canvasRef.current) return;
      stopPipAnimation();

      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      canvas.width = 512;
      canvas.height = 512;
      
      const img = new Image();
      img.crossOrigin = 'anonymous';
      if (currentTrack.cover) {
        img.src = currentTrack.cover;
      }
      
      const drawFrame = () => {
        ctx.fillStyle = '#0d1b2a';
        ctx.fillRect(0, 0, 512, 512);
        
        if (img.complete && img.naturalHeight !== 0) {
          ctx.drawImage(img, 0, 0, 512, 512);
        }
        
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
      stopPipAnimation();
    }
  }, [currentTrack, user, stopPipAnimation]);

  // Sync play/pause to audio element when isPlaying changes
  useEffect(() => {
    if (!audioRef.current || isPlayingAd || isAudioRollActiveRef.current) return;
    if (isPlaying) {
      if (audioRef.current.paused) {
        safePlay(audioRef.current, activePlayRequestIdRef.current).catch(err => {
          if (err && err.name !== 'AbortError') setIsPlaying(false);
        });
      }
    } else {
      if (!audioRef.current.paused) {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, isPlayingAd, safePlay]);

  const currentTrackId = currentTrack?._id || currentTrack?.id;

  // When track changes, reset audio element
  useEffect(() => {
    activePlayRequestIdRef.current += 1;
    const reqId = activePlayRequestIdRef.current;

    audioRetryCountRef.current = 0;
    cancelPendingRetry();
    setPlaybackError(null);
    setIsBuffering(false);

    stopAllAdAudio();
    setPendingSeekTime(null);
    setCurrentTime(0);

    const trackId = currentTrack?._id || currentTrack?.id;
    if (!currentTrack?.audioUrl || !audioRef.current || !trackId) return;

    const finalUrl = resolveAudioUrl(currentTrack.audioUrl);
    audioRef.current.src = finalUrl;
    audioRef.current.load();
    lastDropOffSegment.current = -1;

    updatePlayedWatermarks([]);
    updatePlayedAudioRolls([]);
    updatePlayedPopups([]);
    setPlayedGuestAd(false);
    setShowConfigPopup(false);

    if (isPlayingRef.current && !isPlayingAd) {
      safePlay(audioRef.current, reqId).catch(err => {
        if (reqId === activePlayRequestIdRef.current && err && err.name !== 'AbortError') {
          setIsPlaying(false);
        }
      });
    }
  }, [currentTrackId, safePlay, updatePlayedWatermarks, updatePlayedAudioRolls, updatePlayedPopups, stopAllAdAudio, cancelPendingRetry]);

  // When ad index changes and ads are playing, update ad audio src
  useEffect(() => {
    if (!isPlayingAd || !adAudioRef.current) return;
    const rawUrl = adAudioUrls[currentAdIndex];
    if (!rawUrl) { handleAdEnded(); return; }
    const url = resolveAudioUrl(rawUrl);
    adAudioRef.current.src = url;
    adAudioRef.current.load();
    safePlay(adAudioRef.current).catch(() => handleAdEnded());
  }, [isPlayingAd, currentAdIndex, adAudioUrls, handleAdEnded, safePlay]);

  // Update Media Session API: metadata & action handlers
  useEffect(() => {
    if (!currentTrack || !('mediaSession' in navigator)) return;
    try {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: currentTrack.title || 'NeetBand',
        artist: currentTrack.subject || 'NeetBand',
        album: currentTrack.chapter || currentTrack.grade || '',
        artwork: currentTrack.cover ? [{ src: currentTrack.cover, sizes: '512x512', type: 'image/png' }] : [],
      });

      const isAnyActive = isPlaying || isPlayingAd || isAudioRollActive;
      navigator.mediaSession.playbackState = isAnyActive ? 'playing' : 'paused';

      navigator.mediaSession.setActionHandler('play', () => {
        if (isAudioRollActiveRef.current) {
          const activeElement = activeRollType === 'midroll' ? midRollAudioRef.current : guestAdAudioRef.current;
          if (activeElement && activeElement.paused) {
            safePlay(activeElement).catch(console.error);
          }
        } else if (isPlayingAd) {
          if (adAudioRef.current && adAudioRef.current.paused) {
            safePlay(adAudioRef.current).catch(console.error);
          }
        } else {
          safePlay(audioRef.current, activePlayRequestIdRef.current);
          setIsPlaying(true);
        }
      });
      navigator.mediaSession.setActionHandler('pause', () => {
        if (isAudioRollActiveRef.current) {
          const activeElement = activeRollType === 'midroll' ? midRollAudioRef.current : guestAdAudioRef.current;
          activeElement?.pause();
        } else if (isPlayingAd) {
          adAudioRef.current?.pause();
        } else {
          audioRef.current?.pause();
          setIsPlaying(false);
        }
      });
      navigator.mediaSession.setActionHandler('previoustrack', handlePrev);
      navigator.mediaSession.setActionHandler('nexttrack', handleNext);

      if ('setActionHandler' in navigator.mediaSession) {
        navigator.mediaSession.setActionHandler('seekto', (details) => {
          if (details.seekTime !== undefined && details.seekTime !== null) {
            handleSeek(details.seekTime);
          }
        });
        navigator.mediaSession.setActionHandler('seekbackward', (details) => {
          const skipTime = details.seekOffset || 10;
          const ct = audioRef.current?.currentTime || 0;
          handleSeek(Math.max(0, ct - skipTime));
        });
        navigator.mediaSession.setActionHandler('seekforward', (details) => {
          const skipTime = details.seekOffset || 10;
          const dur = audioRef.current?.duration || currentTrack?.durationSeconds || 0;
          const ct = audioRef.current?.currentTime || 0;
          handleSeek(Math.min(dur, ct + skipTime));
        });
      }
    } catch (e) {
      console.warn('MediaSession configuration warning:', e);
    }

    return () => {
      if ('mediaSession' in navigator) {
        try {
          navigator.mediaSession.setActionHandler('play', null);
          navigator.mediaSession.setActionHandler('pause', null);
          navigator.mediaSession.setActionHandler('previoustrack', null);
          navigator.mediaSession.setActionHandler('nexttrack', null);
          if ('setActionHandler' in navigator.mediaSession) {
            navigator.mediaSession.setActionHandler('seekto', null);
            navigator.mediaSession.setActionHandler('seekbackward', null);
            navigator.mediaSession.setActionHandler('seekforward', null);
          }
        } catch (e) {}
      }
    };
  }, [currentTrack, handlePrev, handleNext, handleSeek, activeRollType, isPlaying, isPlayingAd, isAudioRollActive, safePlay]);

  // Update Media Session position state (separate effect to avoid handler thrashing on every time update)
  useEffect(() => {
    if (!('mediaSession' in navigator) || !duration || duration <= 0 || !isFinite(duration)) return;
    try {
      if ('setPositionState' in navigator.mediaSession) {
        const pos = Math.min(Math.max(0, currentTime), duration);
        if (isFinite(pos)) {
          navigator.mediaSession.setPositionState({
            duration: duration,
            playbackRate: 1,
            position: pos
          });
        }
      }
    } catch (e) {
      // Ignore position state errors silently
    }
  }, [currentTime, duration]);

  // Handle Picture-in-Picture event cleanup
  useEffect(() => {
    const video = pipVideoRef.current;
    if (!video) return;
    const handleLeavePip = () => {
      stopPipAnimation();
    };
    video.addEventListener('leavepictureinpicture', handleLeavePip);
    return () => {
      video.removeEventListener('leavepictureinpicture', handleLeavePip);
      stopPipAnimation();
    };
  }, [stopPipAnimation]);

  // Desktop Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      const target = e.target;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT' || target.isContentEditable)) {
        return;
      }
      if (e.code === 'Space') {
        e.preventDefault();
        togglePlay();
      } else if (e.code === 'KeyM') {
        e.preventDefault();
        setIsMuted(prev => !prev);
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        handleSeek(Math.max(0, currentTime - 5));
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        const dur = audioRef.current?.duration || currentTrack?.durationSeconds || 0;
        handleSeek(Math.min(dur, currentTime + 5));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlay, handleSeek, currentTime, currentTrack]);

  const isAnyAudioActive = isPlaying || isPlayingAd || isAudioRollActive;

  const value = {
    globalTracks, setGlobalTracks,
    currentTrack, setCurrentTrack,
    isPlaying, setIsPlaying,
    isAnyAudioActive,
    isBuffering,
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
    isAudioRollActive, activeRollType,
    togglePlay, handleTrackSelect, handleNext, handlePrev, handleSeek,
    handleShare, requestPip,
    audioRef,
    showConfigPopup, setShowConfigPopup, adConfig,
    playbackError, setPlaybackError, retryPlayback
  };

  return (
    <PlayerContext.Provider value={value}>
      {/* Global singleton audio elements */}
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onDurationChange={handleAudioDurationChange}
        onEnded={handleEnded}
        onError={handleAudioError}
        onPlay={handleAudioPlay}
        onPause={handleAudioPause}
        onWaiting={handleAudioWaiting}
        onPlaying={handleAudioPlaying}
        onCanPlay={handleAudioPlaying}
        onStalled={handleAudioWaiting}
        preload="metadata"
        style={{ display: 'none' }}
      />
      <audio
        ref={adAudioRef}
        onEnded={handleAdEnded}
        onError={handleAdEnded}
        onWaiting={handleAudioWaiting}
        onPlaying={handleAudioPlaying}
        onStalled={handleAudioWaiting}
        preload="metadata"
        style={{ display: 'none' }}
      />
      <audio
        ref={midRollAudioRef}
        onWaiting={handleAudioWaiting}
        onPlaying={handleAudioPlaying}
        onStalled={handleAudioWaiting}
        onPause={() => {
          if (isAudioRollActiveRef.current && activeRollType === 'midroll') {
            setIsBuffering(false);
          }
        }}
        onEnded={() => {
          const reqId = activePlayRequestIdRef.current;
          setAudioRollActive(false);
          setActiveRollType(null);

          const dur = audioRef.current?.duration || currentTrack?.durationSeconds || 1;
          const targetTime = pendingSeekTimeRef.current;
          setPendingSeekTime(null);

          // Check if there are any remaining skipped rolls before targetTime
          if (targetTime !== null && !user?.isPremium && currentTrack?.songType !== 'Normal') {
            const targetPct = (targetTime / dur) * 100;
            const audioPositions = (currentTrack?.audioRollPositions && currentTrack.audioRollPositions.length > 0)
              ? currentTrack.audioRollPositions
              : (adConfig?.audioRollPositions || []);
            const remainingSkipped = audioPositions.filter(p => targetPct >= p && !playedAudioRollsRef.current.includes(p));
            if (remainingSkipped.length > 0) {
              const nextRollPos = Math.min(...remainingSkipped);
              updatePlayedAudioRolls(prev => [...prev, nextRollPos]);
              setPendingSeekTime(targetTime);
              setAudioRollActive(true);
              setActiveRollType('midroll');
              if (midRollAudioRef.current && (adConfig?.audioRollUrl || currentTrack?.audioRollUrl)) {
                const finalUrl = resolveAudioUrl(currentTrack?.audioRollUrl || adConfig.audioRollUrl);
                midRollAudioRef.current.src = finalUrl;
                midRollAudioRef.current.load();
                midRollAudioRef.current.currentTime = 0;
                safePlay(midRollAudioRef.current).catch(console.error);
              }
              return;
            }
          }

          if (audioRef.current && reqId === activePlayRequestIdRef.current) {
            audioRef.current.volume = isMutedRef.current ? 0 : volumeRef.current;
            if (targetTime !== null && isFinite(targetTime) && targetTime >= 0) {
              if (audioRef.current.readyState >= 1) {
                audioRef.current.currentTime = targetTime;
                setCurrentTime(targetTime);
              } else {
                setPendingSeekTime(targetTime);
              }
            }
            safePlay(audioRef.current, reqId).catch(e => console.error(e));
            setIsPlaying(true);
          }
        }}
        onError={() => {
          console.warn('Mid-roll ad audio error, resuming track playback');
          const reqId = activePlayRequestIdRef.current;
          setAudioRollActive(false);
          setActiveRollType(null);

          const dur = audioRef.current?.duration || currentTrack?.durationSeconds || 1;
          const targetTime = pendingSeekTimeRef.current;
          setPendingSeekTime(null);

          if (targetTime !== null && !user?.isPremium && currentTrack?.songType !== 'Normal') {
            const targetPct = (targetTime / dur) * 100;
            const audioPositions = (currentTrack?.audioRollPositions && currentTrack.audioRollPositions.length > 0)
              ? currentTrack.audioRollPositions
              : (adConfig?.audioRollPositions || []);
            const remainingSkipped = audioPositions.filter(p => targetPct >= p && !playedAudioRollsRef.current.includes(p));
            if (remainingSkipped.length > 0) {
              const nextRollPos = Math.min(...remainingSkipped);
              updatePlayedAudioRolls(prev => [...prev, nextRollPos]);
              setPendingSeekTime(targetTime);
              setAudioRollActive(true);
              setActiveRollType('midroll');
              if (midRollAudioRef.current && (adConfig?.audioRollUrl || currentTrack?.audioRollUrl)) {
                const finalUrl = resolveAudioUrl(currentTrack?.audioRollUrl || adConfig.audioRollUrl);
                midRollAudioRef.current.src = finalUrl;
                midRollAudioRef.current.load();
                midRollAudioRef.current.currentTime = 0;
                safePlay(midRollAudioRef.current).catch(console.error);
              }
              return;
            }
          }

          if (audioRef.current && reqId === activePlayRequestIdRef.current) {
            audioRef.current.volume = isMutedRef.current ? 0 : volumeRef.current;
            if (targetTime !== null && isFinite(targetTime) && targetTime >= 0) {
              if (audioRef.current.readyState >= 1) {
                audioRef.current.currentTime = targetTime;
                setCurrentTime(targetTime);
              } else {
                setPendingSeekTime(targetTime);
              }
            }
            safePlay(audioRef.current, reqId).catch(e => console.error(e));
            setIsPlaying(true);
          }
        }}
        preload="auto"
        style={{ display: 'none' }}
      />
      <audio
        ref={guestAdAudioRef}
        onWaiting={handleAudioWaiting}
        onPlaying={handleAudioPlaying}
        onStalled={handleAudioWaiting}
        onPause={() => {
          if (isAudioRollActiveRef.current && activeRollType === 'guestAd') {
            setIsBuffering(false);
          }
        }}
        onEnded={() => {
          setAudioRollActive(false);
          setActiveRollType(null);
          setPendingSeekTime(null);
          if (audioRef.current) audioRef.current.pause();
          setIsPlaying(false);
          showGuestLoginPrompt();
        }}
        onError={() => {
          console.warn('Guest ad audio error');
          setAudioRollActive(false);
          setActiveRollType(null);
          setPendingSeekTime(null);
          if (audioRef.current) audioRef.current.pause();
          setIsPlaying(false);
          showGuestLoginPrompt();
        }}
        preload="auto"
        style={{ display: 'none' }}
      />
      <audio
        ref={watermarkAudioRef}
        onEnded={stopWatermark}
        onError={stopWatermark}
        preload="auto"
        style={{ display: 'none' }}
      />
      {/* Hidden video + canvas for PIP */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      <video ref={pipVideoRef} style={{ display: 'none' }} muted playsInline />

      {/* HTML Config Popup Modal */}
      {showConfigPopup && (currentTrack?.popupHtml || adConfig?.popupHtml) && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-surface relative border border-outline-variant/30 rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setShowConfigPopup(false)}
              aria-label="Close popup"
              title="Close"
              className="absolute top-3 right-3 w-9 h-9 flex items-center justify-center rounded-full bg-surface-variant/80 hover:bg-surface-variant text-on-surface hover:text-white transition-colors z-20 shadow-md font-bold text-lg cursor-pointer"
            >
              ✕
            </button>
            <div 
              className="p-6 pt-12"
              dangerouslySetInnerHTML={{ __html: currentTrack?.popupHtml || adConfig?.popupHtml }} 
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
