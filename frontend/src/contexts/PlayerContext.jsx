import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { getSongs, recordSongPlay, recordSongComplete, recordSongDropOff, recordSongRepeat, recordSongShare } from '../services/api';
import { useDialog } from './DialogContext';
import logoImg from '../assets/logo.png';
import { resolveAudioUrl, formatTime } from '../utils/urlUtils';
import { IconAlertTriangle } from '@tabler/icons-react';

const PlayerContext = createContext(null);

// Use the global API_URL pattern consistent with api.js
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export function PlayerProvider({ children, user }) {
  const [globalTracks, setGlobalTracks] = useState([]);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, _setIsPlaying] = useState(false);
  const isPlayingRef = useRef(false);
  const setIsPlaying = useCallback((val) => {
    isPlayingRef.current = typeof val === 'function' ? val(isPlayingRef.current) : val;
    _setIsPlaying(val);
  }, []);
  const [isBuffering, setIsBuffering] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [queue, setQueue] = useState([]);
  const [isMuted, _setIsMuted] = useState(false);
  const isMutedRef = useRef(false);
  const setIsMuted = useCallback((val) => {
    isMutedRef.current = typeof val === 'function' ? val(isMutedRef.current) : val;
    _setIsMuted(val);
  }, []);
  const [volume, _setVolume] = useState(1);
  const volumeRef = useRef(1);
  const setVolume = useCallback((val) => {
    volumeRef.current = typeof val === 'function' ? val(volumeRef.current) : val;
    _setVolume(val);
  }, []);
  const [isShuffled, setIsShuffled] = useState(false);
  const [repeatMode, setRepeatMode] = useState('none'); // 'none' | 'one' | 'all'
  const [favoritedTrackIds, setFavoritedTrackIds] = useState(() => {
    try { return JSON.parse(localStorage.getItem('neetband_favorites') || '[]'); } catch { return []; }
  });
  const [recentlyPlayedTrackIds, setRecentlyPlayedTrackIds] = useState(() => {
    try { return JSON.parse(localStorage.getItem('neetband_recently_played') || '[]'); } catch { return []; }
  });

  // Track & playback state
  const [playbackError, setPlaybackError] = useState(null);

  // Ad state
  const [isAdPaused, setIsAdPaused] = useState(false);


  const { confirm, toast } = useDialog();

  const audioRef = useRef(null); // main audio element (in DOM via PlayerProvider render)
  const lastLoadedTrackIdRef = useRef(null);
  const audioRetryCountRef = useRef(0);
  const retryTimeoutRef = useRef(null);
  const activePlayRequestIdRef = useRef(0);
  const midRollPlayRequestIdRef = useRef(0);
  const pendingSeekTimeRef = useRef(null);
  const resumeAfterAdRef = useRef(true);

  const midRollAudioRef = useRef(null); // mid-roll ad audio element
  const guestAdAudioRef = useRef(null); // guest ad audio element
  const [playedGuestAd, setPlayedGuestAd] = useState(false);
  const playedGuestAdRef = useRef(false);

  const updatePlayedGuestAd = useCallback((val) => {
    playedGuestAdRef.current = val;
    setPlayedGuestAd(val);
  }, []);

  const pipVideoRef = useRef(null); // hidden video for PIP
  const canvasRef = useRef(null); // canvas for album art
  const animFrameRef = useRef(null);

  // Drop-off tracking
  const lastDropOffSegment = useRef(-1);

  // Mount tracking
  const isMountedRef = useRef(true);
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

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

  const [activeRollType, _setActiveRollType] = useState(null); // 'midroll' | 'guestAd' | null
  const activeRollTypeRef = useRef(null);
  const setActiveRollType = useCallback((val) => {
    activeRollTypeRef.current = val;
    _setActiveRollType(val);
  }, []);
  const [pendingSeekTime, setPendingSeekTime] = useState(null);

  const updatePendingSeekTime = useCallback((time) => {
    pendingSeekTimeRef.current = time;
    setPendingSeekTime(time);
  }, []);

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
    setIsBuffering(false);
    if (midRollAudioRef.current) {
      midRollAudioRef.current.pause();
      if (midRollAudioRef.current.readyState >= 1) {
        midRollAudioRef.current.currentTime = 0;
      }
    }
    if (guestAdAudioRef.current) {
      guestAdAudioRef.current.pause();
      if (guestAdAudioRef.current.readyState >= 1) {
        guestAdAudioRef.current.currentTime = 0;
      }
    }

    if (audioRef.current) {
      const v = isMutedRef.current ? 0 : volumeRef.current;
      audioRef.current.volume = v;
    }
  }, []);

  const stopWatermark = useCallback(() => {
    // No-op for now, prevents ReferenceError
  }, []);



  const updateMediaSessionPosition = useCallback(() => {
    if (!('mediaSession' in navigator) || !audioRef.current) return;
    const dur = audioRef.current.duration;
    if (!dur || !isFinite(dur) || dur <= 0) return;
    
    try {
      if ('setPositionState' in navigator.mediaSession) {
        const pos = Math.min(Math.max(0, audioRef.current.currentTime), dur);
        if (isFinite(pos)) {
          navigator.mediaSession.setPositionState({
            duration: dur,
            playbackRate: audioRef.current.playbackRate || 1,
            position: pos
          });
        }
      }
    } catch (e) {}
  }, []);

  // Synchronous ref state helpers for event listeners
  const updatePlayedAudioRolls = useCallback((val) => {
    const next = typeof val === 'function' ? val(playedAudioRollsRef.current) : val;
    playedAudioRollsRef.current = next;
    setPlayedAudioRolls(next);
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
      return promise.then(() => {
        if (requestId !== undefined && requestId !== activePlayRequestIdRef.current) {
          const err = new Error('Play request superseded');
          err.name = 'AbortError';
          throw err;
        }
      }).catch(err => {
        if (err && err.name === 'NotAllowedError') {
          console.warn('Browser blocked autoplay. User interaction required:', err.message || err);
          setIsPlaying(false);
          setIsBuffering(false);
          setPlaybackError('Autoplay blocked by browser. Tap Play to start.');
        } else if (err && (err.name === 'AbortError' || err.message === 'Play request superseded')) {
          console.warn('Audio play request interrupted:', err.message || err);
        } else {
          console.error('Audio play error:', err);
        }
        throw err;
      });
    }
    return Promise.resolve();
  }, []);

  // Native media event listeners for main audio element synchronization
  const handleAudioPlay = useCallback(() => {
    if (!isAudioRollActiveRef.current) {
      setIsPlaying(true);
      setIsBuffering(false);
      updateMediaSessionPosition();
    }
  }, [updateMediaSessionPosition]);

  const handleAudioPause = useCallback(() => {
    if (!isAudioRollActiveRef.current) {
      setIsPlaying(false);
      setIsBuffering(false);
      stopWatermark();
      updateMediaSessionPosition();
    }
  }, [updateMediaSessionPosition]);

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

  const [systemNotice, setSystemNotice] = useState(null);

  const fetchWithRetry = useCallback(async (fetcherFn, resourceName, retries = 4, backoff = 1000, showNotice = true) => {
    for (let i = 0; i < retries; i++) {
      if (!isMountedRef.current) throw new Error('Unmounted');
      try {
        const data = await fetcherFn();
        if (!isMountedRef.current) throw new Error('Unmounted');
        if (showNotice) setSystemNotice(null);
        return data;
      } catch (err) {
        if (!isMountedRef.current || err.message === 'Unmounted') throw err;
        if (i < retries - 1) {
          if (showNotice) setSystemNotice(`Network error fetching ${resourceName} (Attempt ${i + 1}/${retries}). Retrying in ${backoff / 1000}s...`);
          await new Promise(res => setTimeout(res, backoff));
          backoff *= 2;
        } else {
          if (showNotice) setSystemNotice(`Failed to fetch ${resourceName}. Some features may be unavailable or operating in degraded mode.`);
          throw err;
        }
      }
    }
  }, []);

  // Fetch songs on mount
  useEffect(() => {
    fetchWithRetry(() => getSongs(), 'songs').then(data => {
      const mapped = data.map(s => {
        const durationSecs = (s.duration != null && !isNaN(Number(s.duration))) ? Number(s.duration) : 200;
        const formattedDuration = formatTime(durationSecs);
        const resolvedAudio = resolveAudioUrl(s.audioUrl);

        return {
          ...s,
          id: s._id || s.id,
          grade: s.class,
          cover: s.thumbnailUrl || logoImg,
          durationSeconds: durationSecs,
          duration: formattedDuration,
          songType: s.songType || 'Study',
          audioUrl: resolvedAudio,
        };
      });
      setGlobalTracks(mapped);
      if (mapped.length > 0 && !lastLoadedTrackIdRef.current) {
        const firstTrack = mapped[0];
        setCurrentTrack(firstTrack);
        if (audioRef.current && firstTrack.audioUrl) {
          audioRef.current.src = resolveAudioUrl(firstTrack.audioUrl);
          lastLoadedTrackIdRef.current = firstTrack._id || firstTrack.id;
          audioRef.current.load();
        }
      }
    }).catch(err => {
      if (err.message !== 'Unmounted') console.error(err);
    });
  }, [fetchWithRetry]);

  // Fetch global Ad Config
  useEffect(() => {
    let isMounted = true;
    fetchWithRetry(async () => {
      const r = await fetch(`${API_URL}/api/ad-config`);
      if (!r.ok) throw new Error('Fetch failed');
      return r.json();
    }, 'ad config', 4, 1000, false).then(data => {
      if (isMounted) setAdConfig(data);
    }).catch((err) => {
      if (isMounted && err.message !== 'Unmounted') setAdConfig(null);
    });
    return () => { isMounted = false; };
  }, [fetchWithRetry]);

  // Sync volume & mute to all audio elements
  useEffect(() => {
    const v = isMuted ? 0 : volume;
    const mainV = isDuckedRef.current ? v * 0.2 : v;
    if (audioRef.current) audioRef.current.volume = mainV;
    if (midRollAudioRef.current) midRollAudioRef.current.volume = v;
    if (guestAdAudioRef.current) guestAdAudioRef.current.volume = v;

  }, [volume, isMuted]);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      cancelPendingRetry();
    };
  }, [cancelPendingRetry]);

  // Sync state values to refs for use in async event handlers

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
    if (e?.target?.error?.code === 1) return; // Ignore MEDIA_ERR_ABORTED
    if (!audioRef.current || !currentTrack?.audioUrl) return;
    if (!audioRef.current.src || audioRef.current.src === window.location.href) return;

    console.warn('Audio playback error encountered:', e);
    cancelPendingRetry();

    const failedTime = audioRef.current.currentTime || 0;

    if (audioRetryCountRef.current < 3) {
      audioRetryCountRef.current += 1;
      const delay = Math.pow(2, audioRetryCountRef.current - 1) * 1000; // 1s, 2s, 4s backoff
      console.log(`Retrying audio playback (Attempt ${audioRetryCountRef.current}/3) in ${delay}ms...`);
      retryTimeoutRef.current = setTimeout(async () => {
        if (audioRef.current && currentTrack?.audioUrl) {
          let latestUrl = currentTrack.audioUrl;
          try {
            const trackId = currentTrack._id || currentTrack.id;
            const r = await fetch(`${API_URL}/api/songs/${trackId}`);
            if (r.ok) {
              const freshTrack = await r.json();
              if (freshTrack.audioUrl) latestUrl = freshTrack.audioUrl;
            }
          } catch (e) {
            console.warn('Failed to fetch fresh URL, falling back to cached', e);
          }

          if (audioRef.current) {
            const targetUrl = resolveAudioUrl(latestUrl);
            const cacheBusterUrl = (targetUrl.startsWith('blob:') || targetUrl.startsWith('data:'))
              ? targetUrl
              : (targetUrl.includes('?') ? `${targetUrl}&retry=${Date.now()}` : `${targetUrl}?retry=${Date.now()}`);
              
            updatePendingSeekTime(failedTime);
            audioRef.current.src = cacheBusterUrl;
            lastLoadedTrackIdRef.current = currentTrack._id || currentTrack.id;
            audioRef.current.load();
            if (isPlayingRef.current && !isAudioRollActiveRef.current) {
              safePlay(audioRef.current, activePlayRequestIdRef.current).catch(err => {
                if (err?.name !== 'AbortError') {
                  console.error('Retry play failed:', err);
                  setIsPlaying(false);
                }
              });
            }
          }
        }
      }, delay);
    } else {
      setIsPlaying(false);
      setIsBuffering(false);
      setPlaybackError("Failed to load audio stream after multiple retries. Please check your internet connection.");
    }
  }, [currentTrack, safePlay, cancelPendingRetry]);

  const retryPlayback = useCallback(async () => {
    setPlaybackError(null);
    audioRetryCountRef.current = 0;
    cancelPendingRetry();

    if (!currentTrack) return;

    let latestUrl = currentTrack.audioUrl;
    try {
      const trackId = currentTrack._id || currentTrack.id;
      if (trackId) {
        const r = await fetch(`${API_URL}/api/songs/${trackId}`);
        if (r.ok) {
          const freshTrack = await r.json();
          if (freshTrack.audioUrl) {
            latestUrl = freshTrack.audioUrl;
            setCurrentTrack(prev => prev ? { ...prev, audioUrl: resolveAudioUrl(freshTrack.audioUrl) } : prev);
          }
        }
      }
    } catch (e) {
      console.warn('Failed to fetch fresh URL, falling back to cached', e);
    }

    if (latestUrl && audioRef.current) {
      const targetUrl = resolveAudioUrl(latestUrl);
      const cacheBusterUrl = (targetUrl.startsWith('blob:') || targetUrl.startsWith('data:'))
        ? targetUrl
        : (targetUrl.includes('?') ? `${targetUrl}&retry=${Date.now()}` : `${targetUrl}?retry=${Date.now()}`);

      const failedTime = audioRef.current.currentTime || 0;
      updatePendingSeekTime(failedTime);
      audioRef.current.src = cacheBusterUrl;
      lastLoadedTrackIdRef.current = currentTrack._id || currentTrack.id;
      audioRef.current.load();
      safePlay(audioRef.current, activePlayRequestIdRef.current).then(() => {
        setIsPlaying(true);
        setIsBuffering(false);
      }).catch(err => {
        if (err?.name !== 'AbortError') {
          console.error('Manual retry play failed:', err);
          setIsPlaying(false);
          setIsBuffering(false);
          setPlaybackError("Failed to load audio stream after multiple retries. Please check your internet connection.");
        }
      });
    } else {
      setIsPlaying(false);
      setIsBuffering(false);
      setPlaybackError("Audio URL is missing");
    }
  }, [currentTrack, safePlay, cancelPendingRetry]);

  // Track time updates & drop-off tracking
  const handleTimeUpdate = useCallback(() => {
    if (!audioRef.current || !currentTrack) return;
    
    // Stop processing track time updates if any ad roll or pre-roll is actively playing
    if (isAudioRollActiveRef.current) return;

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
      : (globalTracks[0]?.id === trackId || globalTracks[0]?._id === trackId);

    if (!isNormalSong && !user?.isLoggedIn && (!isFirstSongOfChapter || pct >= 0.2)) {
      if (!playedGuestAdRef.current) {
        updatePlayedGuestAd(true);
        stopWatermark();
        audioRef.current.pause();
        setIsPlaying(false);

        if (guestAdAudioRef.current && adConfig?.guestAdUrl) {
          const finalUrl = resolveAudioUrl(adConfig.guestAdUrl);
          setAudioRollActive(true);
          setActiveRollType('guestAd');
          if (guestAdAudioRef.current.src !== finalUrl) {
            guestAdAudioRef.current.src = finalUrl;
            guestAdAudioRef.current.load();
          } else if (guestAdAudioRef.current.readyState >= 1) {
            guestAdAudioRef.current.currentTime = 0;
          }
          safePlay(guestAdAudioRef.current).catch(e => {
            if (e?.name === 'AbortError') return;
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



    // Unified Audio Roll & Popup Ad Logic (Guests & Non-Premium)
    if (!isNormalSong && !user?.isPremium && !isAudioRollActiveRef.current) {
      const pct100 = pct * 100;
      const globalAudioRollsEnabled = adConfig?.audioRollsEnabled !== undefined ? adConfig.audioRollsEnabled : true;
      const audioRollsActive = currentTrack.overrideGlobalAds ? (currentTrack.audioRollsEnabled ?? true) : globalAudioRollsEnabled;
      const globalPopupsEnabled = adConfig?.popupsEnabled !== undefined ? adConfig.popupsEnabled : true;
      const popupsEnabled = currentTrack.overrideGlobalAds ? (currentTrack.popupsEnabled ?? true) : globalPopupsEnabled;

      const rawPositions = currentTrack.overrideGlobalAds
        ? (currentTrack.audioRollPositions || [])
        : (adConfig?.audioRollPositions || []);
      const audioPositions = (rawPositions || []).filter(p => p > 0);
      const audioUrl = currentTrack.overrideGlobalAds
        ? currentTrack.audioRollUrl
        : adConfig?.audioRollUrl;
      const currentRolls = playedAudioRollsRef.current;

      if (audioRollsActive && audioPositions.length > 0 && audioUrl && !isDuckedRef.current) {
        const unplayedPositions = audioPositions.filter(p => pct100 >= p && !currentRolls.includes(p)).sort((a, b) => a - b);
        if (unplayedPositions.length > 0) {
          const nextPosition = unplayedPositions[0];
          updatePlayedAudioRolls(prev => Array.from(new Set([...prev, nextPosition])));

          // Strict Mutual Exclusion: Pause & stop all other audio elements to prevent echo/double sound
          stopAllAdAudio();
          stopWatermark();
          if (audioRef.current) {
            audioRef.current.pause();
          }
          setIsPlaying(false);
          resumeAfterAdRef.current = true;
          setAudioRollActive(true);
          setActiveRollType('midroll');
          midRollPlayRequestIdRef.current = activePlayRequestIdRef.current;
          
          if (midRollAudioRef.current) {
            const finalUrl = resolveAudioUrl(audioUrl);
            if (midRollAudioRef.current.src !== finalUrl) {
              midRollAudioRef.current.src = finalUrl;
              midRollAudioRef.current.load();
            } else if (midRollAudioRef.current.readyState >= 1) {
              midRollAudioRef.current.currentTime = 0;
            }
            safePlay(midRollAudioRef.current).catch(e => {
              if (e?.name === 'AbortError') return;
              console.error('Audio roll playback error:', e);
              setAudioRollActive(false);
              setActiveRollType(null);
              if (audioRef.current) {
                audioRef.current.volume = isMutedRef.current ? 0 : volumeRef.current;
                safePlay(audioRef.current, activePlayRequestIdRef.current).then(() => {
                  setIsPlaying(true);
                }).catch(err => {
                  if (err && err.name !== 'AbortError') {
                    setIsPlaying(false);
                    setPlaybackError('Unable to resume audio. Tap Play to try again.');
                  }
                });
              }
            });
          }
        }
      }

      // Popup Check
      const popupPositions = currentTrack.overrideGlobalAds
        ? (currentTrack.popupPositions || [])
        : (adConfig?.popupPositions || []);
      const popupHtml = currentTrack.overrideGlobalAds
        ? currentTrack.popupHtml
        : adConfig?.popupHtml;
      const currentPopups = playedPopupsRef.current;

      if (popupsEnabled && popupPositions && popupPositions.length > 0 && popupHtml) {
        const unplayedPopups = popupPositions.filter(p => pct100 >= p && !currentPopups.includes(p)).sort((a, b) => a - b);
        if (unplayedPopups.length > 0) {
          const nextPosition = unplayedPopups[0];
          updatePlayedPopups(prev => Array.from(new Set([...prev, nextPosition])));
          setShowConfigPopup(true);
        }
      }
    }
  }, [currentTrack, user, adConfig, globalTracks, playedGuestAd, showGuestLoginPrompt, updatePlayedAudioRolls, updatePlayedPopups, safePlay, stopAllAdAudio, setAudioRollActive, updatePlayedGuestAd]);

  const handleLoadedMetadata = useCallback(() => {
    if (audioRef.current) {
      const rawDur = audioRef.current.duration;
      const validDur = (isNaN(rawDur) || !isFinite(rawDur) || rawDur < 0) ? 0 : rawDur;
      setDuration(validDur);

      if (pendingSeekTimeRef.current !== null && !isAudioRollActiveRef.current) {
        const target = Math.max(0, Math.min(pendingSeekTimeRef.current, validDur || pendingSeekTimeRef.current));
        try {
          audioRef.current.currentTime = target;
          setCurrentTime(target);
        } catch (e) {
          console.warn('Seek on metadata load failed:', e);
        }
        updatePendingSeekTime(null);
      }
    }
  }, [pendingSeekTime]);

  // Play ad sequence or directly start the track
  const playWithAds = useCallback((track, skipStartRolls = false) => {
    if (!track) return;
    if (!track.audioUrl) {
      stopAllAdAudio();
      updatePendingSeekTime(null);
      setCurrentTime(0);
      setDuration(0);
      setCurrentTrack(track);
      setIsPlaying(false);
      setIsBuffering(false);
      setPlaybackError("Audio URL is missing");
      return;
    }
    activePlayRequestIdRef.current += 1;
    const isNormalSong = track.songType === 'Normal';
    const trackId = track._id || track.id;

    // Guest Limit check
    const isFirstSongOfChapter = track.chapter
      ? (globalTracks.find(t => t.chapter === track.chapter)?.id === trackId || globalTracks.find(t => t.chapter === track.chapter)?._id === trackId)
      : (globalTracks[0]?.id === trackId || globalTracks[0]?._id === trackId);
    
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
    updatePendingSeekTime(null);
    setCurrentTime(0);
    setDuration(0);

    setPlaybackError(null);
    audioRetryCountRef.current = 0;
    cancelPendingRetry();

    lastDropOffSegment.current = -1;

    updatePlayedAudioRolls(skipStartRolls ? [0] : []);
    updatePlayedPopups(skipStartRolls ? [0] : []);
    updatePlayedGuestAd(false);
    setShowConfigPopup(false);

    // Direct track playback
    setCurrentTrack(track);
    setIsPlaying(true);
    if (trackId) recordSongPlay(trackId);

    if (audioRef.current && track.audioUrl) {
      audioRef.current.src = resolveAudioUrl(track.audioUrl);
      lastLoadedTrackIdRef.current = track._id || track.id;
      audioRef.current.load();
      activePlayRequestIdRef.current += 1;
      safePlay(audioRef.current, activePlayRequestIdRef.current).catch(err => {
        if (err && err.name !== 'AbortError') {
          setIsPlaying(false);
          setPlaybackError('Unable to play audio. Tap Play to try again.');
        }
      });
    }
  }, [user, confirm, globalTracks, cancelPendingRetry, stopAllAdAudio, adConfig, updatePlayedAudioRolls, updatePlayedPopups, safePlay, updatePlayedGuestAd]);

  const handleNext = useCallback((isManual = true) => {
    const manual = isManual !== false;
    const list = queue.length > 0 ? queue : globalTracks;
    if (list.length === 0) {
      if (audioRef.current) audioRef.current.pause();
      stopAllAdAudio();
      stopWatermark();
      setIsPlaying(false);
      setCurrentTrack(null);
      setPlaybackError("No songs available to play.");
      return;
    }
    const currentId = currentTrack?._id || currentTrack?.id;
    let idx = list.findIndex(t => (t._id || t.id) === currentId);
    let nextIdx;
    if (isShuffled) {
      nextIdx = Math.floor(Math.random() * list.length);
    } else if (repeatMode === 'all') {
      nextIdx = (idx + 1) % list.length;
    } else {
      nextIdx = idx + 1;
      if (nextIdx >= list.length) { 
        if (audioRef.current) audioRef.current.pause();
        stopAllAdAudio();
        stopWatermark();
        setIsPlaying(false); 
        return; 
      }
    }
    const next = list[nextIdx];
    if (!next) return;
    playWithAds(next, manual);
  }, [queue, globalTracks, currentTrack, isShuffled, repeatMode, playWithAds, stopAllAdAudio, stopWatermark]);

  // Handle song ended
  const handleEnded = useCallback(() => {
    if (!currentTrack) return;
    const id = currentTrack._id || currentTrack.id;
    if (id) recordSongComplete(id);
    if (repeatMode === 'one') {

      updatePlayedAudioRolls([]);
      updatePlayedPopups([]);
      updatePlayedGuestAd(false);
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        safePlay(audioRef.current, activePlayRequestIdRef.current).catch(err => {
          if (err && err.name !== 'AbortError') {
            setIsPlaying(false);
            setPlaybackError('Unable to play audio. Tap Play to try again.');
          }
        });
      }
      if (id) recordSongRepeat(id);
      return;
    }
    handleNext(false); // Auto-advance, so not manual
  }, [currentTrack, repeatMode, handleNext, safePlay, updatePlayedAudioRolls, updatePlayedPopups, updatePlayedGuestAd]);

  const handlePrev = useCallback((isManual = true) => {
    const manual = isManual !== false;
    const list = queue.length > 0 ? queue : globalTracks;
    if (list.length === 0) {
      setIsPlaying(false);
      setCurrentTrack(null);
      setPlaybackError("No songs available to play.");
      return;
    }
    // If >3s into track, restart it
    if (audioRef.current && audioRef.current.currentTime > 3) {
      audioRef.current.currentTime = 0;
      return;
    }
    const currentId = currentTrack?._id || currentTrack?.id;
    const idx = list.findIndex(t => (t._id || t.id) === currentId);
    let prevIdx;
    if (repeatMode === 'all') {
      prevIdx = (idx - 1 + list.length) % list.length;
    } else {
      prevIdx = idx - 1;
      if (prevIdx < 0) {
        if (audioRef.current) audioRef.current.currentTime = 0;
        return;
      }
    }
    playWithAds(list[prevIdx], manual);
  }, [queue, globalTracks, currentTrack, playWithAds, repeatMode]);

  const handleSeek = useCallback((time) => {
    if (!currentTrack || !audioRef.current) return;
    if (time === null || time === undefined || isNaN(time) || !isFinite(time)) return;

    const fallbackDur = currentTrack.durationSeconds > 0 ? currentTrack.durationSeconds : 1;
    const rawAudioDur = audioRef.current.duration;
    const dur = (!isNaN(rawAudioDur) && isFinite(rawAudioDur) && rawAudioDur > 0) ? rawAudioDur : fallbackDur;
    let clampedTime = Math.max(0, Math.min(time, dur));
    const isNormalSong = currentTrack.songType === 'Normal';

    // If an audio roll is currently playing, queue the pending seek target
    if (isAudioRollActiveRef.current) {
      updatePendingSeekTime(clampedTime);
      return;
    }

    // 1. Guest limit enforcement (max 20% of duration for 1st song of chapter)
    const trackId = currentTrack._id || currentTrack.id;
    const isFirstSongOfChapter = currentTrack.chapter
      ? (globalTracks.find(t => t.chapter === currentTrack.chapter)?.id === trackId || globalTracks.find(t => t.chapter === currentTrack.chapter)?._id === trackId)
      : (globalTracks[0]?.id === trackId || globalTracks[0]?._id === trackId);
    if (!isNormalSong && !user?.isLoggedIn) {
      const maxAllowedTime = 0.2 * dur;
      if (clampedTime >= maxAllowedTime || !isFirstSongOfChapter) {
        clampedTime = Math.min(clampedTime, maxAllowedTime);
        setCurrentTime(clampedTime);
        
        if (isAudioRollActiveRef.current) {
          updatePendingSeekTime(clampedTime);
        } else if (audioRef.current && audioRef.current.readyState >= 1) {
          audioRef.current.currentTime = clampedTime;
        } else {
          updatePendingSeekTime(clampedTime);
        }
        
        audioRef.current?.pause();
        setIsPlaying(false);

        if (!playedGuestAdRef.current && isFirstSongOfChapter) {
          updatePlayedGuestAd(true);
          if (guestAdAudioRef.current && adConfig?.guestAdUrl) {
            const finalUrl = resolveAudioUrl(adConfig.guestAdUrl);
            setAudioRollActive(true);
            setActiveRollType('guestAd');
            if (guestAdAudioRef.current.src !== finalUrl) {
              guestAdAudioRef.current.src = finalUrl;
              guestAdAudioRef.current.load();
            } else if (guestAdAudioRef.current.readyState >= 1) {
              guestAdAudioRef.current.currentTime = 0;
            }
            safePlay(guestAdAudioRef.current).catch(e => {
              if (e?.name === 'AbortError') return;
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

      // Prune played arrays if scrubbing backward to prevent the ad-skipping exploit
      updatePlayedAudioRolls(prev => prev.filter(p => p <= targetPct100));
      updatePlayedPopups(prev => prev.filter(p => p <= targetPct100));

      // Mark skipped popups as played and show popup if valid
      const globalPopupsEnabled = adConfig?.popupsEnabled !== undefined ? adConfig.popupsEnabled : true;
      const popupsActive = globalPopupsEnabled && (currentTrack.popupsEnabled ?? true);
      const popupHtml = currentTrack.popupHtml !== undefined ? currentTrack.popupHtml : adConfig?.popupHtml;
      
      if (popupsActive && popupHtml) {
        const popupPositions = currentTrack.overrideGlobalAds
          ? (currentTrack.popupPositions || [])
          : (adConfig?.popupPositions || []);
        if (popupPositions && popupPositions.length > 0) {
          const skippedPopups = popupPositions.filter(p => targetPct100 >= p && !playedPopupsRef.current.includes(p));
          if (skippedPopups.length > 0) {
            updatePlayedPopups(prev => Array.from(new Set([...prev, ...skippedPopups])));
            setShowConfigPopup(true);
          }
        }
      }

      const globalAudioRollsEnabled = adConfig?.audioRollsEnabled !== undefined ? adConfig.audioRollsEnabled : true;
      const audioRollsActive = globalAudioRollsEnabled && (currentTrack.audioRollsEnabled ?? true);
      const rawPositions = currentTrack.overrideGlobalAds
        ? (currentTrack.audioRollPositions || [])
        : (adConfig?.audioRollPositions || []);
      const audioPositions = rawPositions.filter(p => p > 0);
      const audioUrl = currentTrack.audioRollUrl || adConfig?.audioRollUrl;
      const currentRolls = playedAudioRollsRef.current;

      if (audioRollsActive && audioPositions.length > 0 && audioUrl) {
        const skippedUnplayed = audioPositions.filter(p => targetPct100 >= p && !currentRolls.includes(p));
        if (skippedUnplayed.length > 0) {
          // Mark ALL skipped ads as played so we don't loop them
          updatePlayedAudioRolls(prev => {
            const next = new Set([...prev, ...skippedUnplayed]);
            return Array.from(next);
          });
          updatePendingSeekTime(time);

          resumeAfterAdRef.current = isPlayingRef.current;
          audioRef.current?.pause();
          setIsPlaying(false);

          setAudioRollActive(true);
          setActiveRollType('midroll');
          midRollPlayRequestIdRef.current = activePlayRequestIdRef.current;
          if (midRollAudioRef.current) {
            const finalUrl = resolveAudioUrl(audioUrl);
            if (midRollAudioRef.current.src !== finalUrl) {
              midRollAudioRef.current.src = finalUrl;
              midRollAudioRef.current.load();
            } else if (midRollAudioRef.current.readyState >= 1) {
              midRollAudioRef.current.currentTime = 0;
            }
            safePlay(midRollAudioRef.current).catch(e => {
              if (e?.name === 'AbortError') return;
              console.error('Audio roll playback error on seek:', e);
              setAudioRollActive(false);
              setActiveRollType(null);
              updatePendingSeekTime(null);
              if (audioRef.current) {
                audioRef.current.volume = isMutedRef.current ? 0 : volumeRef.current;
                if (audioRef.current.readyState >= 1) {
                  audioRef.current.currentTime = time;
                }
                safePlay(audioRef.current, activePlayRequestIdRef.current).then(() => {
                  setIsPlaying(true);
                }).catch(err => {
                  if (err && err.name !== 'AbortError') {
                    setIsPlaying(false);
                    setPlaybackError('Unable to resume audio. Tap Play to try again.');
                  }
                });
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
        updateMediaSessionPosition();
      } else {
        updatePendingSeekTime(clampedTime);
      }
    }
  }, [currentTrack, user, globalTracks, playedGuestAd, adConfig, showGuestLoginPrompt, updatePlayedAudioRolls, safePlay, setAudioRollActive, updatePlayedGuestAd, updatePendingSeekTime, updateMediaSessionPosition]);

  const togglePlay = useCallback(() => {
    if (isAudioRollActiveRef.current) {
      const activeElement = activeRollTypeRef.current === 'midroll' ? midRollAudioRef.current : guestAdAudioRef.current;
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

    // Prevent guest play loop if past 20% limit
    const dur = audioRef.current?.duration || trackToPlay.durationSeconds || 1;
    const isNormalSong = trackToPlay.songType === 'Normal';
    const trackId = trackToPlay._id || trackToPlay.id;
    const isFirstSongOfChapter = trackToPlay.chapter
      ? (globalTracks.find(t => t.chapter === trackToPlay.chapter)?.id === trackId || globalTracks.find(t => t.chapter === trackToPlay.chapter)?._id === trackId)
      : (globalTracks[0]?.id === trackId || globalTracks[0]?._id === trackId);
      
    if (!isNormalSong && !user?.isLoggedIn && (!isFirstSongOfChapter || (audioRef.current && audioRef.current.currentTime >= 0.2 * dur))) {
      showGuestLoginPrompt();
      return; // Block playback
    }

    if (!currentTrack) {
      playWithAds(trackToPlay);
      return;
    }
    if (audioRef.current && !audioRef.current.paused) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else if (audioRef.current) {
      if (audioRef.current.ended) {

        updatePlayedAudioRolls([]);
        updatePlayedPopups([]);
        updatePlayedGuestAd(false);
      }
      safePlay(audioRef.current, activePlayRequestIdRef.current)
        .then(() => setIsPlaying(true))
        .catch(err => {
          if (err?.name !== 'AbortError') setIsPlaying(false);
        });
    }
  }, [currentTrack, globalTracks, playWithAds, safePlay, user, showGuestLoginPrompt, updatePlayedAudioRolls, updatePlayedPopups, updatePlayedGuestAd]);

  const handleTrackSelect = useCallback((track) => {
    const currentId = currentTrack?._id || currentTrack?.id;
    const targetId = track?._id || track?.id;
    if (currentId && currentId === targetId) {
      togglePlay();
    } else {
      playWithAds(track, true); // Manual track select
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
    setFavoritedTrackIds(prev => {
      const next = prev.includes(trackId) ? prev.filter(id => id !== trackId) : [...prev, trackId];
      try { localStorage.setItem('neetband_favorites', JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);

  const cycleRepeat = useCallback(() => {
    setRepeatMode(prev => prev === 'none' ? 'one' : prev === 'one' ? 'all' : 'none');
  }, []);

  const handleShare = useCallback((track) => {
    const t = track || currentTrack;
    if (!t) return;
    if (navigator.share) {
      navigator.share({ title: t.title, text: `Listen to ${t.title} on NeetBand!`, url: window.location.href }).catch((e) => console.log('Share dismissed or failed:', e));
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
      
      let lastDrawTime = 0;
      const drawFrame = (timestamp) => {
        // Redraw only occasionally (e.g. 1 FPS) to keep PIP video stream alive without draining CPU
        if (timestamp - lastDrawTime > 1000) {
          lastDrawTime = timestamp;
          ctx.fillStyle = '#0d1b2a';
          ctx.fillRect(0, 0, 512, 512);
          
          if (img.complete && img.naturalHeight !== 0) {
            ctx.drawImage(img, 0, 0, 512, 512);
          }
          
          ctx.fillStyle = '#ecc246';
          ctx.font = 'bold 28px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(currentTrack.title || '', 256, 460);
        }
        animFrameRef.current = requestAnimationFrame(drawFrame);
      };
      // Start the loop
      animFrameRef.current = requestAnimationFrame(drawFrame);
      const stream = canvas.captureStream(24);
      pipVideoRef.current.srcObject = stream;
      await pipVideoRef.current.play();
      await pipVideoRef.current.requestPictureInPicture();
    } catch (e) {
      console.warn('PIP failed:', e);
      stopPipAnimation();
    }
  }, [currentTrack, user, stopPipAnimation]);



  const currentTrackId = currentTrack?._id || currentTrack?.id;

  // Update Media Session API: metadata
  useEffect(() => {
    if (!currentTrack || !('mediaSession' in navigator)) return;
    try {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: currentTrack.title || 'NeetBand',
        artist: currentTrack.subject || 'NeetBand',
        album: currentTrack.chapter || currentTrack.grade || '',
        artwork: currentTrack.cover ? [{ src: currentTrack.cover, sizes: '512x512', type: 'image/png' }] : [],
      });
    } catch (e) {
      console.warn('MediaSession metadata configuration warning:', e);
    }
  }, [currentTrack]);

  // Update Media Session API: playback state
  useEffect(() => {
    if (!('mediaSession' in navigator)) return;
    try {
      const isAnyActive = isPlaying || isAudioRollActive;
      navigator.mediaSession.playbackState = isAnyActive ? 'playing' : 'paused';
    } catch (e) {}
  }, [isPlaying, isAudioRollActive]);

  // Update Media Session API: action handlers
  useEffect(() => {
    if (!currentTrack || !('mediaSession' in navigator)) return;
    try {
      navigator.mediaSession.setActionHandler('play', () => {
        if (isAudioRollActiveRef.current) {
          const activeElement = activeRollTypeRef.current === 'midroll' ? midRollAudioRef.current : guestAdAudioRef.current;
          if (activeElement && activeElement.paused) {
            safePlay(activeElement).catch(console.error);
          }
        } else {
          if (audioRef.current && audioRef.current.ended) {

            updatePlayedAudioRolls([]);
            updatePlayedPopups([]);
            updatePlayedGuestAd(false);
          }
          safePlay(audioRef.current, activePlayRequestIdRef.current);
          setIsPlaying(true);
        }
      });
      navigator.mediaSession.setActionHandler('pause', () => {
        if (isAudioRollActiveRef.current) {
          const activeElement = activeRollTypeRef.current === 'midroll' ? midRollAudioRef.current : guestAdAudioRef.current;
          activeElement?.pause();
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
          const rawDur = audioRef.current?.duration;
          const dur = (typeof rawDur === 'number' && !isNaN(rawDur) && isFinite(rawDur) && rawDur > 0) ? rawDur : (currentTrack?.durationSeconds || 0);
          const ct = audioRef.current?.currentTime || 0;
          handleSeek(dur > 0 ? Math.min(dur, ct + skipTime) : ct + skipTime);
        });
      }
    } catch (e) {
      console.warn('MediaSession action handler configuration warning:', e);
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
  }, [currentTrack, handlePrev, handleNext, handleSeek, safePlay, updatePlayedAudioRolls, updatePlayedPopups, updatePlayedGuestAd]);

  // The Media Session position state is now updated in updateMediaSessionPosition
  // which is called intelligently on play/pause/seek, rather than thrashing 
  // the position state every 250ms on timeupdate.

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
        const ct = audioRef.current?.currentTime || 0;
        handleSeek(Math.max(0, ct - 5));
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        const dur = audioRef.current?.duration || currentTrack?.durationSeconds || 0;
        const ct = audioRef.current?.currentTime || 0;
        handleSeek(Math.min(dur, ct + 5));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlay, handleSeek, currentTrack]);

  const isAnyAudioActive = isPlaying || (isAudioRollActive && !isAdPaused);

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
        ref={midRollAudioRef}
        onWaiting={handleAudioWaiting}
        onPlaying={handleAudioPlaying}
        onStalled={handleAudioWaiting}
        onPlay={() => setIsAdPaused(false)}
        onPause={() => {
          setIsAdPaused(true);
          if (isAudioRollActiveRef.current && activeRollType === 'midroll') {
            setIsBuffering(false);
          }
        }}
        onEnded={() => {
          const reqId = midRollPlayRequestIdRef.current;
          setAudioRollActive(false);
          setActiveRollType(null);

          const targetTime = pendingSeekTimeRef.current;
          updatePendingSeekTime(null);

          if (audioRef.current && reqId === activePlayRequestIdRef.current) {
            audioRef.current.volume = isMutedRef.current ? 0 : volumeRef.current;
            if (targetTime !== null && isFinite(targetTime) && targetTime >= 0) {
              if (audioRef.current.readyState >= 1) {
                audioRef.current.currentTime = targetTime;
                setCurrentTime(targetTime);
              } else {
                updatePendingSeekTime(targetTime);
              }
            }
            if (resumeAfterAdRef.current) {
              safePlay(audioRef.current, reqId).then(() => {
                setIsPlaying(true);
              }).catch(e => {
                if (e && e.name !== 'AbortError') {
                  setIsPlaying(false);
                  setPlaybackError('Unable to resume audio. Tap Play to try again.');
                }
              });
            }
          }
        }}
        onError={(e) => {
          if (e?.target?.error?.code === 1) return;
          console.warn('Mid-roll ad audio error, resuming track playback');
          const reqId = midRollPlayRequestIdRef.current;
          setAudioRollActive(false);
          setActiveRollType(null);

          const targetTime = pendingSeekTimeRef.current;
          updatePendingSeekTime(null);

          if (audioRef.current && reqId === activePlayRequestIdRef.current) {
            audioRef.current.volume = isMutedRef.current ? 0 : volumeRef.current;
            if (targetTime !== null && isFinite(targetTime) && targetTime >= 0) {
              if (audioRef.current.readyState >= 1) {
                audioRef.current.currentTime = targetTime;
                setCurrentTime(targetTime);
              } else {
                updatePendingSeekTime(targetTime);
              }
            }
            if (resumeAfterAdRef.current) {
              safePlay(audioRef.current, reqId).then(() => {
                setIsPlaying(true);
              }).catch(e => {
                if (e && e.name !== 'AbortError') {
                  setIsPlaying(false);
                  setPlaybackError('Unable to resume audio. Tap Play to try again.');
                }
              });
            }
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
        onPlay={() => setIsAdPaused(false)}
        onPause={() => {
          setIsAdPaused(true);
          if (isAudioRollActiveRef.current && activeRollType === 'guestAd') {
            setIsBuffering(false);
          }
        }}
        onEnded={() => {
          setAudioRollActive(false);
          setActiveRollType(null);
          updatePendingSeekTime(null);
          if (audioRef.current) audioRef.current.pause();
          setIsPlaying(false);
          showGuestLoginPrompt();
        }}
        onError={(e) => {
          if (e?.target?.error?.code === 1) return;
          console.warn('Guest ad audio error');
          setAudioRollActive(false);
          setActiveRollType(null);
          updatePendingSeekTime(null);
          if (audioRef.current) audioRef.current.pause();
          setIsPlaying(false);
          showGuestLoginPrompt();
        }}
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

      {systemNotice && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] bg-surface-container border border-red-500/30 text-on-surface px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 backdrop-blur-md text-sm font-medium animate-in slide-in-from-top-4 max-w-[90vw] w-[320px]">
          <div className="bg-red-500/10 text-red-500 p-1.5 rounded-full shrink-0">
            <IconAlertTriangle className="w-5 h-5" />
          </div>
          <p className="flex-1 text-xs opacity-90">{systemNotice}</p>
          <button onClick={() => setSystemNotice(null)} className="shrink-0 text-on-surface-variant hover:text-on-surface p-1 rounded-full hover:bg-surface-variant transition-colors">
            ✕
          </button>
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
