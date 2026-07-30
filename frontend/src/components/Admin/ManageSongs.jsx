import React, { useState, useEffect, useRef, useMemo } from 'react';
import api, { getSongs, createSong, updateSong, deleteSong, uploadFile, deleteUploadedFile, getCourses } from '../../services/api';
import { useDialog } from '../../contexts/DialogContext';
import { 
  IconPlus, IconMusic, IconCrown, IconLink, IconEdit, IconTrash, IconUpload, 
  IconStack2, IconLoader2, IconSearch, IconX, IconSortAscending, IconSortDescending, 
  IconFilter, IconChevronLeft, IconChevronRight, IconArrowsSort 
} from '@tabler/icons-react';
import logoImg from '../../assets/logo.png';
import BatchUploadModal from './BatchUploadModal';
import { cleanSongTitle } from '../../utils/songTitleUtils';

const getFullUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('blob:') || url.startsWith('data:')) return url;
  const backendUrl = import.meta.env.VITE_BACKEND_URL || import.meta.env.VITE_API_URL || 'http://localhost:5000';
  return `${backendUrl}${url.startsWith('/') ? '' : '/'}${url}`;
};

const WaveformSlider = ({ positions, onChange, audioUrl }) => {
  const trackRef = useRef(null);
  const [draggingIdx, setDraggingIdx] = useState(null);
  const [realBars, setRealBars] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const positionsRef = useRef(positions);
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    positionsRef.current = positions;
    onChangeRef.current = onChange;
  }, [positions, onChange]);

  useEffect(() => {
    if (!audioUrl) {
      setRealBars([]);
      return;
    }
    
    let isCancelled = false;
    let audioContext = null;
    const generateWaveform = async () => {
      setIsLoading(true);
      try {
        const fullAudioUrl = getFullUrl(audioUrl);
        const response = await fetch(fullAudioUrl);
        const arrayBuffer = await response.arrayBuffer();
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        
        if (isCancelled) return;
        
        const channelData = audioBuffer.getChannelData(0);
        const numBars = 50;
        const blockSize = Math.floor(channelData.length / numBars);
        const rawBars = [];
        
        for (let i = 0; i < numBars; i++) {
          let sum = 0;
          const startIdx = i * blockSize;
          for (let j = 0; j < blockSize; j++) {
            sum += Math.abs(channelData[startIdx + j]);
          }
          rawBars.push(sum / blockSize);
        }
        
        const max = Math.max(...rawBars);
        const normalized = rawBars.map(n => max ? Math.max(10, (n / max) * 100) : 10);
        setRealBars(normalized);
      } catch (err) {
        console.error("Waveform generation failed, falling back to dummy", err);
        // Fallback to random
        const fallback = [];
        for(let i = 0; i < 50; i++) fallback.push(Math.max(20, Math.sin(i * 0.5) * 40 + Math.random() * 40 + 20));
        setRealBars(fallback);
      } finally {
        if (audioContext && audioContext.state !== 'closed') {
          try { audioContext.close(); } catch (_) {}
        }
        setIsLoading(false);
      }
    };
    
    generateWaveform();
    return () => {
      isCancelled = true;
      if (audioContext && audioContext.state !== 'closed') {
        try { audioContext.close(); } catch (_) {}
      }
    };
  }, [audioUrl]);

  const waveformBars = realBars.length > 0 ? realBars : Array.from({length: 50}).fill(10);

  const handlePointerDown = (e, idx) => {
    e.preventDefault();
    setDraggingIdx(idx);
  };

  useEffect(() => {
    const handlePointerMove = (e) => {
      if (draggingIdx === null || !trackRef.current) return;
      const rect = trackRef.current.getBoundingClientRect();
      let pct = ((e.clientX - rect.left) / rect.width) * 100;
      pct = Math.max(0, Math.min(100, Math.round(pct)));
      
      const newPos = [...positionsRef.current];
      newPos[draggingIdx] = pct;
      onChangeRef.current(newPos);
    };

    const handlePointerUp = () => {
      setDraggingIdx(null);
    };

    if (draggingIdx !== null) {
      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);
    }
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [draggingIdx]);

  return (
    <div className="relative w-full h-20 mt-4 mb-8 touch-none group" ref={trackRef}>
      {/* Fake waveform background */}
      <div className={`absolute inset-0 flex items-center justify-between pointer-events-none gap-0.5 transition-opacity ${isLoading ? 'opacity-30 animate-pulse' : 'opacity-60'}`}>
        {waveformBars.map((height, i) => (
          <div key={i} className="flex-1 bg-outline-variant/60 rounded-full transition-all duration-300" style={{ height: `${height}%` }} />
        ))}
      </div>
      
      {/* Track line */}
      <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-outline-variant/50 -translate-y-1/2 rounded-full pointer-events-none" />
      
      {/* Markers */}
      {positions.map((pos, idx) => (
        <div
          key={idx}
          onPointerDown={(e) => handlePointerDown(e, idx)}
          className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full shadow-lg border-2 border-surface cursor-grab active:cursor-grabbing hover:scale-125 transition-transform z-10 flex items-center justify-center ${draggingIdx === idx ? 'bg-white scale-125 ring-4 ring-primary/30' : 'bg-primary'}`}
          style={{ left: `${pos}%` }}
        >
          <div className={`absolute -top-8 text-[11px] font-bold px-2 py-1 rounded-md shadow-sm transition-opacity ${draggingIdx === idx ? 'bg-primary text-on-primary opacity-100' : 'bg-surface text-on-surface-variant opacity-0'}`}>
            {pos}%
          </div>
          <div className={`absolute -bottom-7 text-[11px] font-bold transition-opacity ${draggingIdx === idx ? 'opacity-0' : 'opacity-100 text-primary'}`}>
            {pos}%
          </div>
        </div>
      ))}
    </div>
  );
};

import SearchableSelect from '../ui/SearchableSelect';
import DragDropWrapper from '../ui/DragDropWrapper';
import { useClassAndSubjectOptions } from '../../hooks/useClassAndSubjectOptions';

export default function ManageSongs() {
  const { toast, confirm, alert } = useDialog();
  const [songs, setSongs] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isComponentMounted = useRef(true);
  const [testingAudioUrl, setTestingAudioUrl] = useState(false);
  const [audioUrlValid, setAudioUrlValid] = useState(null);
  const [adConfig, setAdConfig] = useState({
    audioRollsEnabled: true,
    popupsEnabled: true,
    popupPositions: [10, 40, 75],
    popupHtml: ''
  });
  const [formData, setFormData] = useState({
    title: '', class: '', subject: '', chapter: '', chapterNumber: '', courseId: '', audioUrl: '', thumbnailUrl: '', lyricsUrl: '', duration: '', songType: 'Study',
    overrideGlobalAds: false,
    audioRollsEnabled: true,
    popupsEnabled: true, popupPositions: [10, 40, 75], popupHtml: ''
  });
  const [editingSongId, setEditingSongId] = useState(null);
  const [uploadedFileName, setUploadedFileName] = useState('');

  // Search, Filter, Sort & Pagination States
  const [isFiltersExpanded, setIsFiltersExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterClass, setFilterClass] = useState('All');
  const [filterSubject, setFilterSubject] = useState('All');
  const [filterChapter, setFilterChapter] = useState('All');
  const [filterType, setFilterType] = useState('All');
  const [sortBy, setSortBy] = useState('title'); // 'title' | 'class' | 'subject' | 'playCount' | 'createdAt'
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc' | 'desc'
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(50);

  const { classes: existingClasses, subjects: existingSubjects, chapters: existingChapters, classToSubjects, subjectToChapters, classSubjectToChapters } = useClassAndSubjectOptions();

  const availableSubjects = useMemo(() => {
    if (!formData.class) return existingSubjects;
    return classToSubjects[formData.class] || existingSubjects;
  }, [formData.class, existingSubjects, classToSubjects]);

  const availableChapters = useMemo(() => {
    if (formData.class && formData.subject) {
      const key = `${formData.class}|${formData.subject}`;
      return classSubjectToChapters[key] || existingChapters;
    }
    if (formData.subject) {
      return subjectToChapters[formData.subject] || existingChapters;
    }
    return existingChapters;
  }, [formData.class, formData.subject, existingChapters, subjectToChapters, classSubjectToChapters]);

  const [uploadProgress, setUploadProgress] = useState({});

  const handlePositionChange = (type, index, value) => {
    const num = parseInt(value, 10);
    if (isNaN(num)) return;
    const field = type === 'audioRoll' ? 'audioRollPositions' : 'popupPositions';
    const newPos = [...(formData[field] || [])];
    newPos[index] = num;
    setFormData(prev => ({ ...prev, [field]: newPos }));
  };

  const addPosition = (type) => {
    const field = type === 'audioRoll' ? 'audioRollPositions' : 'popupPositions';
    setFormData(prev => ({ ...prev, [field]: [...(prev[field] || []), 50] }));
  };

  const removePosition = (type, index) => {
    const field = type === 'audioRoll' ? 'audioRollPositions' : 'popupPositions';
    setFormData(prev => ({ ...prev, [field]: (prev[field] || []).filter((_, i) => i !== index) }));
  };

  const handleTestAudioUrl = async () => {
    if (!formData.audioUrl) {
      if (alert) alert('Validation Error', 'Please enter an audio URL to test.');
      else toast.error('Please enter an audio URL to test.');
      return;
    }
    setTestingAudioUrl(true);
    setAudioUrlValid(null);

    try {
      const audio = new Audio();
      const targetUrl = getFullUrl(formData.audioUrl);
      audio.src = targetUrl;

      await new Promise((resolve, reject) => {
        let timeoutId;
        const cleanup = () => {
          if (timeoutId) clearTimeout(timeoutId);
          audio.onloadedmetadata = null;
          audio.onerror = null;
        };

        audio.onloadedmetadata = () => {
          cleanup();
          if (audio.duration && !isNaN(audio.duration) && audio.duration !== Infinity) {
            const detectedDuration = Math.round(audio.duration);
            setFormData(prev => ({ ...prev, duration: detectedDuration }));
          }
          resolve();
        };

        audio.onerror = () => {
          cleanup();
          reject(new Error('Failed to load audio from URL'));
        };

        timeoutId = setTimeout(() => {
          cleanup();
          reject(new Error('Audio verification timed out after 8s'));
        }, 8000);
      });

      setAudioUrlValid(true);
      if (alert) alert('Success', 'Audio URL is valid and accessible! Duration auto-detected.');
      else toast.success('Audio URL is valid and accessible! Duration auto-detected.');
    } catch (err) {
      setAudioUrlValid(false);
      if (alert) alert('Verification Failed', `Could not verify audio URL: ${err.message}`);
      else toast.error(`Could not verify audio URL: ${err.message}`);
    } finally {
      setTestingAudioUrl(false);
    }
  };

  const newlyUploadedUrlsRef = useRef([]);

  const cleanupUnsavedUploads = () => {
    if (newlyUploadedUrlsRef.current.length > 0) {
      newlyUploadedUrlsRef.current.forEach(url => deleteUploadedFile(url));
      newlyUploadedUrlsRef.current = [];
    }
  };

  const closeAddSongModal = () => {
    cleanupUnsavedUploads();
    setIsAddSongModalOpen(false);
  };

  const handleFileUpload = async (eOrFile, field, folderType) => {
    const file = eOrFile?.target ? eOrFile.target.files?.[0] : eOrFile;
    if (!file) return;
    try {
      setUploadProgress(prev => ({ ...prev, [field]: 0 }));
      if (field === 'audioUrl' && file.name) {
        setUploadedFileName(file.name);
      }
      const res = await uploadFile(file, folderType, (progress) => {
        setUploadProgress(prev => ({ ...prev, [field]: progress }));
      });
      if (res.url) {
        const prevValue = formData[field];
        if (prevValue && typeof prevValue === 'string' && prevValue.includes('/uploads/')) {
          const oldRelative = prevValue.substring(prevValue.indexOf('/uploads/'));
          if (newlyUploadedUrlsRef.current.includes(oldRelative)) {
            deleteUploadedFile(oldRelative);
            newlyUploadedUrlsRef.current = newlyUploadedUrlsRef.current.filter(u => u !== oldRelative);
          }
        }
        newlyUploadedUrlsRef.current.push(res.url);
      }
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
      const fullUrl = `${backendUrl}${res.url}`;
      setFormData(prev => ({ ...prev, [field]: fullUrl }));
      if (field === 'audioUrl') {
        setAudioUrlValid(null);
        const sourceName = file?.name || res.originalName;
        if (sourceName) {
          const autoTitle = cleanSongTitle(sourceName);
          if (autoTitle) {
            setFormData(prev => ({
              ...prev,
              title: (!prev.title?.trim() || /\.[a-zA-Z0-9]{2,4}$/.test(prev.title.trim())) ? autoTitle : prev.title
            }));
          }
        }
      }
      toast.success("File uploaded successfully");
    } catch (err) {
      toast.error("Failed to upload file: " + err.message);
    } finally {
      setUploadProgress(prev => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
      if (eOrFile?.target) {
        eOrFile.target.value = null;
      }
    }
  };

  useEffect(() => {
    if (formData.audioUrl) {
      const fullUrl = getFullUrl(formData.audioUrl);
      const audio = new Audio(fullUrl);
      audio.onloadedmetadata = () => {
        if (audio.duration && !isNaN(audio.duration) && audio.duration !== Infinity) {
          setFormData(prev => ({ ...prev, duration: Math.round(audio.duration) }));
        }
      };
    }
  }, [formData.audioUrl]);
  const [isAddSongModalOpen, setIsAddSongModalOpen] = useState(false);
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);

  const handleOpenAddModal = () => {
    setAudioUrlValid(null);
    setTestingAudioUrl(false);
    setUploadedFileName('');
    setFormData({
      title: '', class: '', subject: '', chapter: '', chapterNumber: '', courseId: '', audioUrl: '', thumbnailUrl: '', lyricsUrl: '', duration: '', songType: 'Study',
      overrideGlobalAds: false,
      audioRollUrl: '',
      audioRollPositions: [],
      audioRollsEnabled: true,
      popupsEnabled: true,
      popupPositions: [],
      popupHtml: ''
    });
    setEditingSongId(null);
    setIsAddSongModalOpen(true);
  };

  const handleEditClick = (song) => {
    setAudioUrlValid(null);
    setTestingAudioUrl(false);
    setUploadedFileName('');
    setFormData({
      title: song.title || '',
      class: song.class || '',
      subject: song.subject || '',
      chapter: song.chapter || '',
      chapterNumber: song.chapterNumber || '',
      courseId: typeof song.courseId === 'object' && song.courseId !== null ? song.courseId._id : (song.courseId || ''),
      audioUrl: song.audioUrl || '',
      thumbnailUrl: song.thumbnailUrl || '',
      lyricsUrl: song.lyricsUrl || '',
      duration: song.duration || '',
      songType: song.songType || 'Study',
      overrideGlobalAds: Boolean(song.overrideGlobalAds),
      audioRollUrl: song.audioRollUrl || '',
      audioRollPositions: Array.isArray(song.audioRollPositions) ? song.audioRollPositions : [],
      audioRollsEnabled: song.audioRollsEnabled !== undefined ? song.audioRollsEnabled : true,
      popupsEnabled: song.popupsEnabled !== undefined ? song.popupsEnabled : true,
      popupPositions: Array.isArray(song.popupPositions) ? song.popupPositions : [],
      popupHtml: song.popupHtml !== undefined ? song.popupHtml : '',
      __v: song.__v
    });
    setEditingSongId(song._id);
    setIsAddSongModalOpen(true);
  };

  const handleDeleteClick = async (id) => {
    if (!await confirm("Delete Song", "Are you sure you want to delete this song?")) return;
    try {
      await deleteSong(id);
      toast.success("Song deleted successfully");
      fetchSongs();
    } catch (err) {
      toast.error("Failed to delete song: " + err.message);
    }
  };

  useEffect(() => {
    isComponentMounted.current = true;
    fetchSongs();
    fetchCourses();
    fetchAdConfig();
    return () => { isComponentMounted.current = false; };
  }, []);

  const fetchAdConfig = async () => {
    try {
      const res = await api.get('/api/ad-config');
      const data = res.data;
      if (data) {
        const backendUrl = import.meta.env.VITE_BACKEND_URL || import.meta.env.VITE_API_URL || 'http://localhost:5000';
        let wUrl = data.audioRollUrl || '';
        if (wUrl && !wUrl.startsWith('http')) {
          wUrl = `${backendUrl}${wUrl}`;
        }
        const config = {
          audioRollUrl: wUrl,
          audioRollPositions: data.audioRollPositions || [20, 50, 90],
          audioRollsEnabled: data.audioRollsEnabled !== undefined ? data.audioRollsEnabled : true,
          popupsEnabled: data.popupsEnabled !== undefined ? data.popupsEnabled : true,
          popupPositions: data.popupPositions || [10, 40, 75],
          popupHtml: data.popupHtml || ''
        };
        if (isComponentMounted.current) {
          setAdConfig(config);
        }
      }
    } catch (err) {
      console.error('Error fetching ad config', err);
      toast.error('Failed to fetch ad config');
    }
  };

  const fetchCourses = async () => {
    try {
      const data = await getCourses();
      if (isComponentMounted.current) {
        setCourses(data);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load courses');
    }
  };

  const fetchSongs = async () => {
    try {
      const data = await getSongs();
      if (isComponentMounted.current) setSongs(data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load songs');
    } finally {
      if (isComponentMounted.current) setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    if (Object.keys(uploadProgress).length > 0) {
      toast.info("Please wait for file upload to complete before saving.");
      return;
    }
    setIsSubmitting(true);
    try {
      const payload = { ...formData };
      
      const filterInvalid = (val) => val !== '' && val !== null && val !== undefined;
      payload.audioRollPositions = (payload.audioRollPositions || []).filter(filterInvalid).map(Number);
      payload.popupPositions = (payload.popupPositions || []).filter(filterInvalid).map(Number);
      
      const isInvalidPos = (p) => isNaN(p) || p < 0 || p > 100;
      if (payload.audioRollPositions.some(isInvalidPos) || payload.popupPositions.some(isInvalidPos)) {
        toast.error('All positions must be valid numbers between 0 and 100. Please correct or delete invalid fields before saving.');
        setIsSubmitting(false);
        return;
      }
      
      if (!payload.courseId) {
        payload.courseId = null;
      }
      if (payload.duration === '' || payload.duration === null || payload.duration === undefined || isNaN(Number(payload.duration))) {
        delete payload.duration;
      } else {
        payload.duration = Number(payload.duration);
      }
      if (payload.chapterNumber === '' || payload.chapterNumber === null || payload.chapterNumber === undefined || isNaN(Number(payload.chapterNumber))) {
        payload.chapterNumber = null;
      } else {
        payload.chapterNumber = Number(payload.chapterNumber);
      }

      if (editingSongId) {
        try {
          await updateSong(editingSongId, payload);
          toast.success("Song updated successfully");
        } catch (updateErr) {
          if (updateErr.message && (updateErr.message.includes('Conflict') || updateErr.message.includes('another user'))) {
            throw new Error('Conflict: Document was updated by another user. Please refresh to get the latest data and try again.');
          }
          throw updateErr;
        }
      } else {
        delete payload.__v;
        await createSong(payload);
        toast.success("Song added successfully");
      }
      newlyUploadedUrlsRef.current = [];
      setFormData({
        title: '', class: '', subject: '', chapter: '', chapterNumber: '', courseId: '', audioUrl: '', thumbnailUrl: '', lyricsUrl: '', duration: '', songType: 'Study',
        overrideGlobalAds: false,
        audioRollUrl: '',
        audioRollPositions: [],
        audioRollsEnabled: true,
        popupsEnabled: true,
        popupPositions: [], popupHtml: ''
      });
      setUploadedFileName('');
      setEditingSongId(null);
      setIsAddSongModalOpen(false);
      fetchSongs();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredAndSortedSongs = useMemo(() => {
    let result = [...songs];

    // Search query filter (title, subject, class, chapter)
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter(song => 
        (song.title && song.title.toLowerCase().includes(q)) ||
        (song.subject && song.subject.toLowerCase().includes(q)) ||
        (song.class && song.class.toLowerCase().includes(q)) ||
        (song.chapter && song.chapter.toLowerCase().includes(q))
      );
    }

    // Filter by Class
    if (filterClass !== 'All') {
      result = result.filter(song => song.class === filterClass);
    }

    // Filter by Subject
    if (filterSubject !== 'All') {
      result = result.filter(song => song.subject === filterSubject);
    }

    // Filter by Chapter
    if (filterChapter !== 'All') {
      result = result.filter(song => song.chapter === filterChapter);
    }

    // Filter by Song Type
    if (filterType !== 'All') {
      result = result.filter(song => (song.songType || 'Study') === filterType);
    }

    // Sort
    result.sort((a, b) => {
      let comp = 0;
      if (sortBy === 'title') {
        comp = (a.title || '').localeCompare(b.title || '', undefined, { sensitivity: 'base' });
      } else if (sortBy === 'class') {
        comp = (a.class || '').localeCompare(b.class || '', undefined, { numeric: true, sensitivity: 'base' });
      } else if (sortBy === 'subject') {
        comp = (a.subject || '').localeCompare(b.subject || '', undefined, { sensitivity: 'base' });
      } else if (sortBy === 'playCount') {
        comp = (a.playCount || 0) - (b.playCount || 0);
      } else if (sortBy === 'createdAt') {
        comp = new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
      }
      return sortOrder === 'asc' ? comp : -comp;
    });

    return result;
  }, [songs, searchQuery, filterClass, filterSubject, filterType, sortBy, sortOrder]);

  // Reset to page 1 on filter/sort/search change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterClass, filterSubject, filterChapter, filterType, sortBy, sortOrder, itemsPerPage]);

  const effectivePerPage = itemsPerPage === 'All' ? filteredAndSortedSongs.length || 1 : itemsPerPage;
  const totalPages = Math.max(1, Math.ceil(filteredAndSortedSongs.length / effectivePerPage));
  
  const displayedSongs = useMemo(() => {
    if (itemsPerPage === 'All') return filteredAndSortedSongs;
    const start = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedSongs.slice(start, start + itemsPerPage);
  }, [filteredAndSortedSongs, currentPage, itemsPerPage]);

  const handleHeaderSort = (field) => {
    if (sortBy === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setFilterClass('All');
    setFilterSubject('All');
    setFilterChapter('All');
    setFilterType('All');
    setSortBy('title');
    setSortOrder('asc');
  };

  const isFilterActive = searchQuery || filterClass !== 'All' || filterSubject !== 'All' || filterChapter !== 'All' || filterType !== 'All';

  const inputClass = "w-full px-4 py-3 rounded-xl border border-outline-variant/40 bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-300 text-on-surface placeholder:text-on-surface-variant/40";
  const labelClass = "text-sm font-bold text-on-surface-variant mb-1.5 ml-1 uppercase tracking-wide text-[11px]";

  return (
    <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Existing Songs Section */}
      <section>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-on-surface">Manage Songs</h2>
            <p className="text-xs text-on-surface-variant mt-1">Search, edit, and organize study songs across courses, classes, and subjects.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsBatchModalOpen(true)}
              className="bg-surface-container border border-outline-variant/40 text-on-surface px-4 py-2 rounded-xl flex items-center gap-2 font-medium hover:bg-surface-variant transition-colors text-sm whitespace-nowrap"
            >
              <IconStack2 size={18} /> Batch Upload
            </button>
            <button 
              onClick={handleOpenAddModal}
              className="bg-primary text-on-primary px-4 py-2 rounded-xl flex items-center gap-2 font-medium text-sm whitespace-nowrap"
            >
              <IconPlus size={18} /> Add Song
            </button>
          </div>
        </div>

        {/* Search, Filter & Sort Toolbar */}
        <div className="bg-surface-container-lowest p-4 md:p-5 rounded-2xl border border-[var(--border-floating-card)] shadow-xs mb-6 flex flex-col gap-4">
          
          {/* Top Row: Search Input + Toggle */}
          <div className="flex gap-3 items-center">
            {/* Search Input */}
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-on-surface-variant/60">
                <IconSearch size={19} />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search songs by title, subject, class, chapter..."
                className="w-full pl-10 pr-10 py-2.5 bg-surface-container/60 hover:bg-surface-container border border-outline-variant/40 rounded-xl text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-on-surface-variant hover:text-on-surface"
                  title="Clear Search"
                >
                  <IconX size={18} />
                </button>
              )}
            </div>

            {/* Filter Toggle Button */}
            <button
              onClick={() => setIsFiltersExpanded(!isFiltersExpanded)}
              className={`flex items-center justify-center gap-2 px-3 md:px-4 py-2.5 rounded-xl border transition-colors whitespace-nowrap ${
                isFiltersExpanded || isFilterActive
                  ? 'bg-primary/10 border-primary/30 text-primary'
                  : 'bg-surface-container/60 hover:bg-surface-container/80 border-outline-variant/40 text-on-surface-variant hover:text-on-surface'
              }`}
              title="Filter & Sort"
            >
              <IconFilter size={18} />
              <span className="hidden md:inline font-semibold text-sm">Filter & Sort</span>
            </button>
          </div>

          {/* Collapsible Filters Area */}
          {isFiltersExpanded && (
            <div className="flex flex-col gap-4 pt-3 border-t border-outline-variant/20 animate-in fade-in slide-in-from-top-2 duration-300">
              
              {/* Sort Controls */}
              <div className="flex items-center justify-between md:justify-start gap-2">
                <div className="bg-surface-container/40 hover:bg-surface-container/80 border border-outline-variant/30 px-3 py-2.5 rounded-xl text-xs transition-colors flex-1 md:flex-none">
                  <SearchableSelect
                    options={[
                      { value: 'title', label: 'Title (A-Z)' },
                      { value: 'class', label: 'Class' },
                      { value: 'subject', label: 'Subject' },
                      { value: 'playCount', label: 'Most Played' },
                      { value: 'createdAt', label: 'Date Added' }
                    ]}
                    value={sortBy}
                    onChange={(val) => setSortBy(val || 'title')}
                    placeholder="Sort By"
                    hideClearOption={true}
                    className="bg-transparent text-on-surface font-semibold focus:outline-none cursor-pointer min-w-[130px] w-full"
                  />
                </div>

                {/* Sort Direction Toggle */}
                <button
                  onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                  className="bg-surface-container/40 hover:bg-surface-container/80 border border-outline-variant/30 p-2.5 rounded-xl text-on-surface-variant hover:text-primary transition-colors flex items-center justify-center"
                  title={sortOrder === 'asc' ? 'Ascending Order' : 'Descending Order'}
                >
                  {sortOrder === 'asc' ? <IconSortAscending size={18} /> : <IconSortDescending size={18} />}
                </button>
              </div>

              {/* Bottom Row: Filters & Pagination */}
              <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
                <div className="grid grid-cols-2 md:flex md:flex-wrap items-center gap-2 w-full xl:w-auto">
                  
                  <div className="bg-surface-container/40 hover:bg-surface-container/80 border border-outline-variant/30 px-3 py-2 rounded-xl text-xs transition-colors">
                    <SearchableSelect
                      options={[
                        { value: 'All', label: 'All Classes' },
                        ...existingClasses.map(c => ({ value: c, label: c }))
                      ]}
                      value={filterClass}
                      onChange={(val) => setFilterClass(val || 'All')}
                      placeholder="All Classes"
                      hideClearOption={true}
                      className="bg-transparent text-on-surface font-semibold focus:outline-none min-w-[110px]"
                    />
                  </div>

                  <div className="bg-surface-container/40 hover:bg-surface-container/80 border border-outline-variant/30 px-3 py-2 rounded-xl text-xs transition-colors">
                    <SearchableSelect
                      options={[
                        { value: 'All', label: 'All Subjects' },
                        ...existingSubjects.map(s => ({ value: s, label: s }))
                      ]}
                      value={filterSubject}
                      onChange={(val) => setFilterSubject(val || 'All')}
                      placeholder="All Subjects"
                      hideClearOption={true}
                      className="bg-transparent text-on-surface font-semibold focus:outline-none min-w-[110px]"
                    />
                  </div>

                  <div className="bg-surface-container/40 hover:bg-surface-container/80 border border-outline-variant/30 px-3 py-2 rounded-xl text-xs transition-colors">
                    <SearchableSelect
                      options={[
                        { value: 'All', label: 'All Chapters' },
                        ...existingChapters.map(c => ({ value: c, label: c }))
                      ]}
                      value={filterChapter}
                      onChange={(val) => setFilterChapter(val || 'All')}
                      placeholder="All Chapters"
                      hideClearOption={true}
                      className="bg-transparent text-on-surface font-semibold focus:outline-none min-w-[110px]"
                    />
                  </div>

                  <div className="bg-surface-container/40 hover:bg-surface-container/80 border border-outline-variant/30 px-3 py-2 rounded-xl text-xs transition-colors">
                    <SearchableSelect
                      options={[
                        { value: 'All', label: 'All Types' },
                        { value: 'Study', label: 'Study' },
                        { value: 'Normal', label: 'Normal' }
                      ]}
                      value={filterType}
                      onChange={(val) => setFilterType(val || 'All')}
                      placeholder="All Types"
                      hideClearOption={true}
                      className="bg-transparent text-on-surface font-semibold focus:outline-none min-w-[100px]"
                    />
                  </div>

                  {/* Clear Filters */}
                  {isFilterActive && (
                    <button
                      onClick={handleClearFilters}
                      className="col-span-2 md:col-span-1 text-xs bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 px-3 py-2 rounded-xl font-bold transition-colors flex items-center justify-center gap-1"
                    >
                      <IconX size={14} /> Clear
                    </button>
                  )}
                </div>

                {/* Songs Counter & Per Page Dropdown */}
                <div className="flex items-center justify-between md:justify-end gap-3 text-xs text-on-surface-variant font-medium w-full xl:w-auto mt-2 xl:mt-0">
                  <span className="inline">
                    Showing <strong className="text-on-surface">{filteredAndSortedSongs.length === 0 ? 0 : (currentPage - 1) * effectivePerPage + 1} - {itemsPerPage === 'All' ? filteredAndSortedSongs.length : Math.min(currentPage * itemsPerPage, filteredAndSortedSongs.length)}</strong> of <strong className="text-on-surface">{songs.length}</strong>
                  </span>
                  
                  <div className="bg-surface-container/40 hover:bg-surface-container/80 border border-outline-variant/30 px-3 py-1.5 rounded-xl text-xs transition-colors flex items-center gap-2">
                    <span className="text-on-surface-variant/70">Per page:</span>
                    <SearchableSelect
                      options={[
                        { value: 25, label: '25' },
                        { value: 50, label: '50' },
                        { value: 100, label: '100' },
                        { value: 250, label: '250' },
                        { value: 'All', label: 'All' }
                      ]}
                      value={itemsPerPage}
                      onChange={(val) => setItemsPerPage(val === 'All' ? 'All' : (Number(val) || 50))}
                      placeholder="50"
                      hideClearOption={true}
                      className="bg-transparent text-on-surface font-bold focus:outline-none min-w-[50px]"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {loading ? (
          <div className="p-8 text-center text-on-surface-variant">Loading songs...</div>
        ) : (
          <div className="overflow-x-auto bg-surface-container-lowest rounded-2xl border border-[var(--border-floating-card)] shadow-sm">
            <table className="w-full min-w-[760px] text-left border-collapse">
              <thead>
                <tr className="border-b border-[var(--border-floating-card)] bg-surface-container/30 text-xs uppercase tracking-wider">
                  <th 
                    onClick={() => handleHeaderSort('title')}
                    className="p-4 font-bold text-on-surface-variant whitespace-nowrap cursor-pointer hover:text-primary transition-colors select-none"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Title</span>
                      {sortBy === 'title' && (
                        <span className="text-primary font-extrabold">{sortOrder === 'asc' ? '▲' : '▼'}</span>
                      )}
                    </div>
                  </th>
                  <th 
                    onClick={() => handleHeaderSort('class')}
                    className="p-4 font-bold text-on-surface-variant whitespace-nowrap cursor-pointer hover:text-primary transition-colors select-none"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Class</span>
                      {sortBy === 'class' && (
                        <span className="text-primary font-extrabold">{sortOrder === 'asc' ? '▲' : '▼'}</span>
                      )}
                    </div>
                  </th>
                  <th 
                    onClick={() => handleHeaderSort('subject')}
                    className="p-4 font-bold text-on-surface-variant whitespace-nowrap cursor-pointer hover:text-primary transition-colors select-none"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Subject</span>
                      {sortBy === 'subject' && (
                        <span className="text-primary font-extrabold">{sortOrder === 'asc' ? '▲' : '▼'}</span>
                      )}
                    </div>
                  </th>
                  <th className="p-4 font-bold text-on-surface-variant whitespace-nowrap">Chapter</th>
                  <th className="p-4 font-bold text-on-surface-variant whitespace-nowrap">Type</th>
                  <th 
                    onClick={() => handleHeaderSort('playCount')}
                    className="p-4 font-bold text-on-surface-variant text-center whitespace-nowrap cursor-pointer hover:text-primary transition-colors select-none"
                  >
                    <div className="flex items-center justify-center gap-1.5">
                      <span>Plays</span>
                      {sortBy === 'playCount' && (
                        <span className="text-primary font-extrabold">{sortOrder === 'asc' ? '▲' : '▼'}</span>
                      )}
                    </div>
                  </th>
                  <th className="p-4 font-bold text-on-surface-variant text-right whitespace-nowrap pr-6">Actions</th>
                </tr>
              </thead>
              <tbody>
                {displayedSongs.map(song => (
                  <tr key={song._id} className="border-b border-[var(--border-floating-card)] hover:bg-surface-container/50 transition-colors">
                    <td className="p-4 font-medium text-on-surface min-w-[200px] max-w-[300px]">
                      <div className="flex items-center gap-3">
                        <img 
                          src={song.thumbnailUrl ? getFullUrl(song.thumbnailUrl) : logoImg} 
                          onError={(e) => { e.target.onerror = null; e.target.src = logoImg; }}
                          alt="" 
                          className="w-9 h-9 rounded-lg object-cover flex-shrink-0 bg-surface-variant/40 border border-outline-variant/20 shadow-xs" 
                        />
                        <span className="line-clamp-2 leading-snug">{song.title}</span>
                      </div>
                    </td>
                    <td className="p-4 text-on-surface-variant whitespace-nowrap">{song.class || '-'}</td>
                    <td className="p-4 text-on-surface-variant whitespace-nowrap">{song.subject || '-'}</td>
                    <td className="p-4 text-on-surface-variant min-w-[160px]">
                      {song.chapter ? `${song.chapter} ${song.chapterNumber ? `(Ch ${song.chapterNumber})` : ''}` : '-'}
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${song.songType === 'Normal' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' : 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20'}`}>
                        {song.songType || 'Study'}
                      </span>
                    </td>
                    <td className="p-4 text-center font-mono font-bold text-on-surface whitespace-nowrap">{song.playCount || 0}</td>
                    <td className="p-4 whitespace-nowrap text-right pr-6">
                      <div className="inline-flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEditClick(song)}
                          className="p-2 text-on-surface-variant hover:text-primary transition-colors bg-surface-container rounded-lg hover:bg-primary/10"
                          title="Edit Song"
                        >
                          <IconEdit size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(song._id)}
                          className="p-2 text-on-surface-variant hover:text-error transition-colors bg-surface-container rounded-lg hover:bg-error/10"
                          title="Delete Song"
                        >
                          <IconTrash size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredAndSortedSongs.length === 0 && (
                  <tr>
                    <td colSpan="7" className="p-8 text-center text-on-surface-variant">
                      {isFilterActive ? 'No songs match your current search and filter criteria.' : 'No songs found.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Pagination Controls */}
            {totalPages > 1 && itemsPerPage !== 'All' && (
              <div className="flex flex-col sm:flex-row items-center justify-between p-4 border-t border-[var(--border-floating-card)] bg-surface-container/20 gap-3">
                <div className="text-xs text-on-surface-variant">
                  Page <strong className="text-on-surface">{currentPage}</strong> of <strong className="text-on-surface">{totalPages}</strong>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded-xl border border-outline-variant/30 text-on-surface hover:bg-surface-variant disabled:opacity-40 disabled:cursor-not-allowed transition-all text-xs font-semibold flex items-center gap-1"
                  >
                    <IconChevronLeft size={16} /> Prev
                  </button>
                  <div className="flex items-center gap-1 max-w-[240px] overflow-x-auto">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${currentPage === page ? 'bg-primary text-on-primary shadow-sm' : 'text-on-surface hover:bg-surface-variant'}`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-xl border border-outline-variant/30 text-on-surface hover:bg-surface-variant disabled:opacity-40 disabled:cursor-not-allowed transition-all text-xs font-semibold flex items-center gap-1"
                  >
                    Next <IconChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Add Song Modal */}
      {isAddSongModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-modal-high flex items-center justify-center p-4 md:p-6 animate-in fade-in duration-200">
          <div className="bg-surface w-full max-w-3xl rounded-2xl shadow-2xl border border-outline-variant/30 flex flex-col max-h-[90vh] min-h-0 animate-in zoom-in-95 duration-200">
            <div className="flex-shrink-0 flex items-center justify-between p-6 border-b border-outline-variant/30">
              <div>
                <h3 className="text-xl font-bold tracking-tight text-on-surface">{editingSongId ? 'Edit Song' : 'Add New Song'}</h3>
                <p className="text-on-surface-variant text-xs mt-1">{editingSongId ? 'Update details of the song.' : 'Upload a new track to the LMS library.'}</p>
              </div>

              <button 
                onClick={closeAddSongModal}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-surface-variant/50 text-on-surface-variant hover:text-on-surface hover:bg-surface-variant transition-colors"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
              </button>
            </div>
            
            <div className="flex-1 p-6 overflow-y-auto">
              <form id="add-song-form" onSubmit={handleSubmit} className="flex flex-col gap-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                  <div className="flex flex-col md:col-span-2">
                    <div className="flex items-center justify-between mb-1">
                      <label className={labelClass}>Song Title</label>
                      {(formData.audioUrl || uploadedFileName) && (
                        <button
                          type="button"
                          onClick={() => {
                            // Prefer the original uploaded filename (most reliable source),
                            // fall back to the server URL (works for new uploads with embedded original name)
                            const src = uploadedFileName || formData.audioUrl;
                            const clean = cleanSongTitle(src);
                            if (clean) setFormData(prev => ({ ...prev, title: clean }));
                          }}
                          className="text-[11px] font-semibold text-primary hover:underline flex items-center gap-1 cursor-pointer"
                          title="Extract clean song title without extension or underscores"
                        >
                          Auto-fill from filename
                        </button>
                      )}
                    </div>
                    <input 
                      type="text" 
                      required 
                      placeholder="e.g. The Cell Cycle Rap" 
                      className={inputClass} 
                      value={formData.title} 
                      onChange={e => setFormData({...formData, title: e.target.value})} 
                      onBlur={() => {
                        // Strip any accidentally-typed or pasted file extension on blur
                        if (formData.title && /\.[a-zA-Z0-9]{2,5}$/.test(formData.title.trim())) {
                          const cleaned = cleanSongTitle(formData.title);
                          if (cleaned) setFormData(prev => ({ ...prev, title: cleaned }));
                        }
                      }}
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className={labelClass}>Class / Grade <span className="opacity-60 lowercase font-normal">(optional)</span></label>
                    <SearchableSelect 
                      className={inputClass}
                      value={formData.class}
                      onChange={(val) => setFormData({...formData, class: val})}
                      placeholder="Select or Create Class..."
                      options={existingClasses.map(c => ({ value: c, label: c }))}
                      creatable={true}
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className={labelClass}>Subject <span className="opacity-60 lowercase font-normal">(optional)</span></label>
                    <SearchableSelect 
                      className={inputClass}
                      value={formData.subject}
                      onChange={(val) => setFormData({...formData, subject: val})}
                      placeholder="Select or Create Subject..."
                      options={availableSubjects.map(s => ({ value: s, label: s }))}
                      creatable={true}
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className={labelClass}>Chapter Name <span className="opacity-60 lowercase font-normal">(optional)</span></label>
                    <SearchableSelect 
                      className={inputClass}
                      value={formData.chapter}
                      placeholder="Select or Create Chapter..."
                      options={availableChapters.map(ch => ({ value: ch, label: ch }))}
                      creatable={true}
                      onChange={val => {
                        const newChapter = val;
                        let nextNumber = formData.chapterNumber;
                        if (newChapter) {
                          const leadingMatch = newChapter.match(/^(?:chapter|ch|unit)?\s*(\d+)/i);
                          if (leadingMatch) {
                            nextNumber = parseInt(leadingMatch[1], 10);
                          } else {
                            const songsInChapter = songs.filter(s => s.chapter?.trim().toLowerCase() === newChapter.trim().toLowerCase());
                            const originalSong = editingSongId ? songs.find(s => s._id === editingSongId) : null;
                            if (originalSong && originalSong.chapter?.trim().toLowerCase() === newChapter.trim().toLowerCase()) {
                              nextNumber = originalSong.chapterNumber || Math.max(1, songsInChapter.length);
                            } else {
                              nextNumber = songsInChapter.length + 1;
                            }
                          }
                        }
                        setFormData({...formData, chapter: newChapter, chapterNumber: nextNumber});
                      }} 
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className={labelClass}>Chapter Number <span className="opacity-60 lowercase font-normal">(auto-fetched)</span></label>
                    <input type="number" placeholder="e.g. 1" className={inputClass} value={formData.chapterNumber} onChange={e => setFormData({...formData, chapterNumber: e.target.value === '' ? '' : Number(e.target.value)})} />
                  </div>
                  <div className="flex flex-col">
                    <label className={labelClass}>Related Course <span className="opacity-60 lowercase font-normal">(optional)</span></label>
                    <SearchableSelect 
                      className={inputClass}
                      value={formData.courseId}
                      onChange={(val) => setFormData({...formData, courseId: val})}
                      placeholder="Select a related course"
                      options={courses.map(course => ({ value: course._id, label: course.title }))}
                    />
                  </div>
                </div>

                <div className="flex flex-col mt-2">
                    <div className="flex items-center gap-2 mb-4">
                      <IconLink size={18} className="text-on-surface-variant" />
                      <h4 className="font-bold text-on-surface">Media URLs</h4>
                      <div className="h-px bg-outline-variant/30 flex-1 ml-2"></div>
                    </div>
                  <div className="grid grid-cols-1 gap-y-4 mt-4">
                    <div className="flex flex-col">
                      <label className={labelClass}>Audio File URL</label>
                      <DragDropWrapper onFileDrop={(file) => handleFileUpload(file, 'audioUrl', 'songs/audio')}>
                        <div className="flex gap-2 items-center">
                          <div className="relative flex-1">
                            <input 
                              type="url" 
                              required 
                              placeholder="https://... or /uploads/..." 
                              className={`${inputClass} pr-24`} 
                              value={formData.audioUrl} 
                              onChange={e => {
                                setFormData({...formData, audioUrl: e.target.value});
                                setAudioUrlValid(null);
                              }} 
                            />
                            {uploadProgress.audioUrl !== undefined ? (
                              <div className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[10px] uppercase font-bold text-primary bg-primary/10 px-2 py-1 rounded flex items-center gap-2 min-w-[70px] justify-center">
                                <span>{uploadProgress.audioUrl}%</span>
                                <div className="w-10 h-1 bg-primary/20 rounded-full overflow-hidden">
                                  <div className="h-full bg-primary transition-all duration-300" style={{ width: `${uploadProgress.audioUrl}%` }} />
                                </div>
                              </div>
                            ) : (
                              <label className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[10px] uppercase font-bold text-primary bg-primary/10 px-2 py-1 rounded cursor-pointer hover:bg-primary/20 transition-colors flex items-center gap-1">
                                <IconUpload size={12} stroke={2.5} /> Upload
                                <input type="file" className="hidden" accept="audio/*,audio/mpeg,audio/mp3,audio/x-mp3,audio/x-mpeg,audio/wav,audio/x-wav,audio/aac,audio/ogg,audio/flac,audio/mp4,audio/webm,audio/3gpp,audio/amr,.mp3,.mpeg,.mpga,.wav,.flac,.aac,.ogg,.m4a,.opus,.wma,.m4p,.mp2,.aiff,.aif,.caf,.webm,.3gp,.amr,.mid,.midi" onChange={e => { handleFileUpload(e, 'audioUrl', 'songs/audio'); e.target.value = ''; }} />
                              </label>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={handleTestAudioUrl}
                            disabled={testingAudioUrl || !formData.audioUrl}
                            className="px-4 py-3 bg-surface-variant hover:bg-surface-variant/80 text-on-surface rounded-xl font-medium text-sm transition-colors shrink-0 disabled:opacity-50"
                          >
                            {testingAudioUrl ? 'Verifying...' : 'Test URL'}
                          </button>
                        </div>
                      </DragDropWrapper>
                      {audioUrlValid === true && (
                        <span className="mt-1 text-xs text-emerald-500 font-semibold flex items-center gap-1 ml-1">
                          ✓ Valid Audio URL
                        </span>
                      )}
                      {audioUrlValid === false && (
                        <span className="mt-1 text-xs text-red-500 font-semibold flex items-center gap-1 ml-1">
                          ✕ Invalid URL
                        </span>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                      <div className="flex flex-col">
                        <label className={labelClass}>Thumbnail Image URL <span className="opacity-60 lowercase font-normal">(optional)</span></label>
                        <DragDropWrapper onFileDrop={(file) => handleFileUpload(file, 'thumbnailUrl', 'songs/thumbnails')}>
                          <div className="relative">
                            <input type="url" placeholder="https://..." className={`${inputClass} pr-28`} value={formData.thumbnailUrl} onChange={e => setFormData({...formData, thumbnailUrl: e.target.value})} />
                            {uploadProgress.thumbnailUrl !== undefined ? (
                              <div className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[10px] uppercase font-bold text-primary bg-primary/10 px-2 py-1 rounded flex items-center gap-2 min-w-[70px] justify-center">
                                <span>{uploadProgress.thumbnailUrl}%</span>
                                <div className="w-10 h-1 bg-primary/20 rounded-full overflow-hidden">
                                  <div className="h-full bg-primary transition-all duration-300" style={{ width: `${uploadProgress.thumbnailUrl}%` }} />
                                </div>
                              </div>
                            ) : (
                              <label className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[10px] uppercase font-bold text-primary bg-primary/10 px-2 py-1 rounded cursor-pointer hover:bg-primary/20 transition-colors flex items-center gap-1">
                                <IconUpload size={12} stroke={2.5} /> Upload
                                <input type="file" className="hidden" accept="image/*" onChange={e => handleFileUpload(e, 'thumbnailUrl', 'songs/thumbnails')} />
                              </label>
                            )}
                          </div>
                        </DragDropWrapper>
                      </div>
                      <div className="flex flex-col">
                        <label className={labelClass}>Lyrics (.ttml) URL <span className="opacity-60 lowercase font-normal">(optional)</span></label>
                        <DragDropWrapper onFileDrop={(file) => handleFileUpload(file, 'lyricsUrl', 'songs/lyrics')}>
                          <div className="relative">
                            <input type="url" placeholder="https://..." className={`${inputClass} pr-28`} value={formData.lyricsUrl} onChange={e => setFormData({...formData, lyricsUrl: e.target.value})} />
                            {uploadProgress.lyricsUrl !== undefined ? (
                              <div className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[10px] uppercase font-bold text-primary bg-primary/10 px-2 py-1 rounded flex items-center gap-2 min-w-[70px] justify-center">
                                <span>{uploadProgress.lyricsUrl}%</span>
                                <div className="w-10 h-1 bg-primary/20 rounded-full overflow-hidden">
                                  <div className="h-full bg-primary transition-all duration-300" style={{ width: `${uploadProgress.lyricsUrl}%` }} />
                                </div>
                              </div>
                            ) : (
                              <label className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[10px] uppercase font-bold text-primary bg-primary/10 px-2 py-1 rounded cursor-pointer hover:bg-primary/20 transition-colors flex items-center gap-1">
                                <IconUpload size={12} stroke={2.5} /> Upload
                                <input type="file" className="hidden" accept=".ttml,.txt,.lrc" onChange={e => handleFileUpload(e, 'lyricsUrl', 'songs/lyrics')} />
                              </label>
                            )}
                          </div>
                        </DragDropWrapper>
                      </div>
                      <div className="flex flex-col">
                        <label className={labelClass}>Duration (seconds) <span className="opacity-60 lowercase font-normal">(auto-fetched)</span></label>
                        <input type="number" placeholder="Auto-calculated..." className={inputClass} value={formData.duration} onChange={e => setFormData({...formData, duration: e.target.value})} />
                      </div>
                    </div>
                    </div>
                  </div>
                  {/* OVERRIDE GLOBAL ADS */}
                  {formData.songType === 'Study' && (
                    <div className="flex items-center justify-between p-4 rounded-2xl bg-surface-container-low border border-outline-variant/30 mt-4 mb-2">
                      <div className="flex flex-col">
                        <span className="font-bold text-on-surface text-sm">Override Global Ads</span>
                        <span className="text-xs text-on-surface-variant mt-0.5">Ignore global ad settings and strictly use this song's ad config below. Checking this and leaving ad positions empty will disable ads for this song.</span>
                      </div>
                      <label className="flex items-center cursor-pointer select-none">
                        <input 
                          type="checkbox" 
                          checked={formData.overrideGlobalAds} 
                          onChange={(e) => setFormData(prev => ({ ...prev, overrideGlobalAds: e.target.checked }))} 
                          className="sr-only peer"
                        />
                        <div className="w-10 h-6 bg-surface-variant peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary relative"></div>
                      </label>
                    </div>
                  )}

                  {/* AUDIO & POPUP AD SETTINGS */}
                  {formData.songType === 'Normal' && (
                    <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-600 text-xs font-semibold mt-2">
                      <span>⚠️</span>
                      <span>Audio Ads &amp; Popup Ads are disabled for Normal Songs.</span>
                    </div>
                  )}
                  <div className={`flex flex-col gap-6 p-5 rounded-2xl bg-surface-container-low border border-outline-variant/30 mt-2 transition-opacity ${formData.songType === 'Normal' ? 'opacity-40 pointer-events-none select-none' : ''}`}>
                    {/* MID-ROLL AUDIO ADS SECTION */}
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center justify-between border-b border-outline-variant/30 pb-3">
                        <div className="flex items-center gap-2">
                          <IconMusic size={20} className="text-primary" />
                          <div>
                            <h4 className="font-bold text-on-surface text-base">Mid-Roll Audio Ads</h4>
                            <p className="text-xs text-on-surface-variant">Pause song at specified intervals to play an ad.</p>
                          </div>
                        </div>
                        <label className="flex items-center cursor-pointer gap-2 bg-surface px-3 py-1.5 rounded-xl border border-outline-variant/30 shrink-0 select-none">
                          <span className={`text-xs font-bold ${formData.audioRollsEnabled ? 'text-primary' : 'text-on-surface-variant'}`}>
                            {formData.audioRollsEnabled ? 'Enabled' : 'Disabled'}
                          </span>
                          <input 
                            type="checkbox" 
                            checked={formData.audioRollsEnabled} 
                            onChange={(e) => setFormData(prev => ({ ...prev, audioRollsEnabled: e.target.checked }))} 
                            className="sr-only peer"
                          />
                          <div className="w-9 h-5 bg-surface-variant peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary relative"></div>
                        </label>
                      </div>

                      {formData.audioRollsEnabled && (
                        <div className="flex flex-col gap-4 animate-in fade-in duration-200">
                          <div className="flex flex-col">
                            <label className={labelClass}>Audio Ad URL <span className="opacity-60 lowercase font-normal">(optional override)</span></label>
                            <DragDropWrapper onFileDrop={(file) => handleFileUpload(file, 'audioRollUrl', 'songs/ads')}>
                              <div className="relative">
                                <input type="url" placeholder="https://... (leave empty to use global ad)" className={`${inputClass} pr-28`} value={formData.audioRollUrl} onChange={e => setFormData({...formData, audioRollUrl: e.target.value})} />
                                {uploadProgress.audioRollUrl !== undefined ? (
                                  <div className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[10px] uppercase font-bold text-primary bg-primary/10 px-2 py-1 rounded flex items-center gap-2 min-w-[70px] justify-center">
                                    <span>{uploadProgress.audioRollUrl}%</span>
                                    <div className="w-10 h-1 bg-primary/20 rounded-full overflow-hidden">
                                      <div className="h-full bg-primary transition-all duration-300" style={{ width: `${uploadProgress.audioRollUrl}%` }} />
                                    </div>
                                  </div>
                                ) : (
                                  <label className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[10px] uppercase font-bold text-primary bg-primary/10 px-2 py-1 rounded cursor-pointer hover:bg-primary/20 transition-colors flex items-center gap-1">
                                    <IconUpload size={12} stroke={2.5} /> Upload
                                    <input type="file" className="hidden" accept="audio/*,audio/mpeg,audio/mp3,audio/x-mp3,audio/x-mpeg,audio/wav,audio/x-wav,audio/aac,audio/ogg,audio/flac,audio/mp4,audio/webm,audio/3gpp,audio/amr,.mp3,.mpeg,.mpga,.wav,.flac,.aac,.ogg,.m4a,.opus,.wma,.m4p,.mp2,.aiff,.aif,.caf,.webm,.3gp,.amr,.mid,.midi" onChange={e => { handleFileUpload(e, 'audioRollUrl', 'songs/ads'); e.target.value = ''; }} />
                                  </label>
                                )}
                              </div>
                            </DragDropWrapper>
                          </div>

                          <div className="flex flex-col gap-2">
                            <label className={labelClass}>Audio Ad Positions (% of song length)</label>
                            <div className="flex flex-wrap gap-2.5 items-center">
                              {(formData.audioRollPositions || []).map((pos, i) => (
                                <div key={i} className="flex items-center gap-1 bg-surface px-2.5 py-1.5 rounded-lg border border-outline-variant/30 shadow-xs">
                                  <input 
                                    type="number" 
                                    min="0" max="100" 
                                    value={pos} 
                                    onChange={(e) => handlePositionChange('audioRoll', i, e.target.value)}
                                    className="w-12 bg-transparent border-none text-on-surface focus:ring-0 p-0 text-center font-bold text-sm"
                                  />
                                  <span className="text-xs text-on-surface-variant font-bold">%</span>
                                  <button type="button" aria-label="Remove position" onClick={() => removePosition('audioRoll', i)} className="text-red-500 hover:text-red-400 ml-1 p-1 font-bold text-xs" title="Remove">
                                    ✕
                                  </button>
                                </div>
                              ))}
                              <button 
                                type="button"
                                onClick={() => addPosition('audioRoll')} 
                                className="flex items-center justify-center h-9 px-3 bg-surface hover:bg-surface-variant border border-outline-variant/30 rounded-lg text-on-surface transition-colors font-bold text-sm"
                                title="Add Position"
                              >
                                + Add Position
                              </button>
                            </div>
                            <WaveformSlider 
                              audioUrl={formData.audioUrl}
                              positions={formData.audioRollPositions || []}
                              onChange={(newPositions) => setFormData({ ...formData, audioRollPositions: newPositions })}
                            />
                          </div>
                        </div>
                      )}
                    </div>


                    {/* POPUP ADS SECTION */}
                    <div className="flex flex-col gap-4 pt-4 border-t border-outline-variant/30">
                      <div className="flex items-center justify-between border-b border-outline-variant/30 pb-3">
                        <div className="flex items-center gap-2">
                          <IconLink size={20} className="text-primary" />
                          <div>
                            <h4 className="font-bold text-on-surface text-base">Popup Ads</h4>
                            <p className="text-xs text-on-surface-variant font-medium">Display popups during song playback without pausing music.</p>
                          </div>
                        </div>
                        <label className="flex items-center cursor-pointer gap-2 bg-surface px-3 py-1.5 rounded-xl border border-outline-variant/30 shrink-0 select-none">
                          <span className={`text-xs font-bold ${formData.popupsEnabled ? 'text-primary' : 'text-on-surface-variant'}`}>
                            {formData.popupsEnabled ? 'Enabled' : 'Disabled'}
                          </span>
                          <input 
                            type="checkbox" 
                            checked={formData.popupsEnabled} 
                            onChange={(e) => setFormData(prev => ({ ...prev, popupsEnabled: e.target.checked }))} 
                            className="sr-only peer"
                          />
                          <div className="w-9 h-5 bg-surface-variant peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary relative"></div>
                        </label>
                      </div>

                      {formData.popupsEnabled && (
                        <div className="flex flex-col gap-4 animate-in fade-in duration-200">
                          <div className="flex flex-col gap-2">
                            <label className={labelClass}>Popup Ad Positions (% of song length)</label>
                            <div className="flex flex-wrap gap-2.5 items-center">
                              {(formData.popupPositions || []).map((pos, i) => (
                                <div key={i} className="flex items-center gap-1 bg-surface px-2.5 py-1.5 rounded-lg border border-outline-variant/30 shadow-xs">
                                  <input 
                                    type="number" 
                                    min="0" max="100" 
                                    value={pos} 
                                    onChange={(e) => handlePositionChange('popup', i, e.target.value)}
                                    className="w-12 bg-transparent border-none text-on-surface focus:ring-0 p-0 text-center font-bold text-sm"
                                  />
                                  <span className="text-xs text-on-surface-variant font-bold">%</span>
                                  <button type="button" aria-label="Remove position" onClick={() => removePosition('popup', i)} className="text-red-500 hover:text-red-400 ml-1 p-1 font-bold text-xs" title="Remove">
                                    ✕
                                  </button>
                                </div>
                              ))}
                              <button 
                                type="button"
                                onClick={() => addPosition('popup')} 
                                className="flex items-center justify-center h-9 px-3 bg-surface hover:bg-surface-variant border border-outline-variant/30 rounded-lg text-on-surface transition-colors font-bold text-sm"
                                title="Add Position"
                              >
                                + Add Position
                              </button>
                            </div>
                          </div>

                          <div className="flex flex-col">
                            <label className={labelClass}>Custom Popup Content (HTML / Text) <span className="opacity-60 lowercase font-normal">(optional override)</span></label>
                            <textarea 
                              value={formData.popupHtml}
                              onChange={(e) => setFormData({ ...formData, popupHtml: e.target.value })}
                              rows={3}
                              placeholder="<div class='text-center'><h2>Special Offer!</h2></div> (leave empty to use global popup)"
                              className="w-full bg-background border border-outline-variant/40 rounded-xl p-3 text-on-surface focus:border-primary focus:ring-1 focus:ring-primary font-mono text-xs"
                            />
                            {formData.popupHtml && (
                              <div className="mt-3">
                                <label className="block text-xs font-bold text-on-surface-variant mb-1">Live Preview</label>
                                <div className="bg-surface border border-outline-variant/30 rounded-xl p-3 relative flex items-center justify-center min-h-[70px] overflow-hidden text-on-surface text-sm">
                                  <div dangerouslySetInnerHTML={{ __html: formData.popupHtml }} />
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="mt-2">
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-bold text-on-surface-variant uppercase tracking-wide text-[11px] ml-1">Song Type</label>
                      <div className="grid grid-cols-2 gap-4">
                        <label className={`cursor-pointer flex flex-col p-4 rounded-xl border transition-all ${formData.songType === 'Study' ? 'border-primary bg-primary/5 shadow-sm' : 'border-outline-variant/40 bg-surface-variant/20 hover:bg-surface-variant/40'}`}>
                          <div className="flex items-center justify-between mb-2">
                            <div className="font-bold text-on-surface">Study Song</div>
                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${formData.songType === 'Study' ? 'border-primary' : 'border-outline-variant'}`}>
                              {formData.songType === 'Study' && <div className="w-2 h-2 rounded-full bg-primary" />}
                            </div>
                          </div>
                          <div className="text-xs text-on-surface-variant">Standard study material. Playback behaviour (ads/watermarks) depends on the user's subscription.</div>
                          <input type="radio" className="sr-only" name="songType" value="Study" checked={formData.songType === 'Study'} onChange={() => setFormData({...formData, songType: 'Study'})} />
                        </label>
                        <label className={`cursor-pointer flex flex-col p-4 rounded-xl border transition-all ${formData.songType === 'Normal' ? 'border-emerald-500 bg-emerald-500/5 shadow-sm' : 'border-outline-variant/40 bg-surface-variant/20 hover:bg-surface-variant/40'}`}>
                          <div className="flex items-center justify-between mb-2">
                            <div className="font-bold text-on-surface">Normal Song</div>
                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${formData.songType === 'Normal' ? 'border-emerald-500' : 'border-outline-variant'}`}>
                              {formData.songType === 'Normal' && <div className="w-2 h-2 rounded-full bg-emerald-500" />}
                            </div>
                          </div>
                          <div className="text-xs text-on-surface-variant">Standard ad-free track. Plays fully for everyone, ignoring subscription logic.</div>
                          <input type="radio" className="sr-only" name="songType" value="Normal" checked={formData.songType === 'Normal'} onChange={() => setFormData({...formData, songType: 'Normal', audioRollsEnabled: false, popupsEnabled: false})} />
                        </label>
                      </div>
                    </div>
                  </div>
              </form>
            </div>
            
            <div className="flex-shrink-0 p-6 border-t border-outline-variant/30 bg-surface-container-lowest/50 rounded-b-2xl flex justify-end gap-3">
              <button 
                onClick={closeAddSongModal}
                className="px-6 py-2.5 rounded-xl font-bold text-on-surface-variant hover:text-on-surface hover:bg-surface-variant transition-colors"
              >
                Cancel
              </button>
              <button 
                form="add-song-form"
                type="submit" 
                disabled={Object.keys(uploadProgress).length > 0 || isSubmitting}
                className="bg-primary text-on-primary px-8 py-2.5 rounded-xl font-bold hover:brightness-110 active:scale-[0.98] transition-all flex items-center gap-2 shadow-md shadow-primary/20 whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {Object.keys(uploadProgress).length > 0 ? (
                  <><IconLoader2 size={18} className="animate-spin" /> Uploading...</>
                ) : isSubmitting ? (
                  <><IconLoader2 size={18} className="animate-spin" /> Saving...</>
                ) : editingSongId ? (
                  <><IconEdit size={18} stroke={2.5} /> Update Song</>
                ) : (
                  <><IconPlus size={18} stroke={2.5} /> Add Song</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Batch Upload Modal */}
      <BatchUploadModal
        isOpen={isBatchModalOpen}
        onClose={() => setIsBatchModalOpen(false)}
        onDone={() => {
          setIsBatchModalOpen(false);
          fetchSongs();
        }}
        adConfig={adConfig}
        courses={courses}
        songs={songs}
      />
    </div>
  );
}
