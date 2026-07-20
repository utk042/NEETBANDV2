import React, { useState, useEffect, useRef, useMemo } from 'react';
import api, { getSongs, createSong, updateSong, deleteSong, uploadFile, getCourses } from '../../services/api';
import { useDialog } from '../../contexts/DialogContext';
import { IconPlus, IconMusic, IconCrown, IconLink, IconEdit, IconTrash, IconUpload } from '@tabler/icons-react';

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
    const generateWaveform = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(audioUrl);
        const arrayBuffer = await response.arrayBuffer();
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
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
        setIsLoading(false);
      }
    };
    
    generateWaveform();
    return () => { isCancelled = true; };
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
import { useClassAndSubjectOptions } from '../../hooks/useClassAndSubjectOptions';

export default function ManageSongs() {
  const { toast, confirm } = useDialog();
  const [songs, setSongs] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adConfig, setAdConfig] = useState({ watermarkUrl: '', watermarkPositions: [20, 50, 90] });
  const [formData, setFormData] = useState({
    title: '', class: '', subject: '', chapter: '', chapterNumber: '', courseId: '', audioUrl: '', thumbnailUrl: '', lyricsUrl: '', duration: '', isPremium: false, watermarkUrl: '', watermarkPositions: [20, 50, 90]
  });
  const [editingSongId, setEditingSongId] = useState(null);

  const { classes: existingClasses, subjects: existingSubjects, chapters: existingChapters, classToSubjects, subjectToChapters } = useClassAndSubjectOptions();

  const availableSubjects = formData.class && classToSubjects[formData.class]
    ? classToSubjects[formData.class]
    : existingSubjects;

  const availableChapters = formData.subject && subjectToChapters[formData.subject]
    ? subjectToChapters[formData.subject]
    : existingChapters;

  const [uploadProgress, setUploadProgress] = useState({});

  const handleFileUpload = async (e, field, folderType) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploadProgress(prev => ({ ...prev, [field]: 0 }));
      const res = await uploadFile(file, folderType, (progress) => {
        setUploadProgress(prev => ({ ...prev, [field]: progress }));
      });
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
      const fullUrl = `${backendUrl}${res.url}`;
      setFormData(prev => ({ ...prev, [field]: fullUrl }));
      toast.success("File uploaded successfully");
    } catch (err) {
      toast.error("Failed to upload file: " + err.message);
    } finally {
      setUploadProgress(prev => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
      e.target.value = null;
    }
  };

  useEffect(() => {
    if (formData.audioUrl) {
      const audio = new Audio(formData.audioUrl);
      audio.onloadedmetadata = () => {
        if (audio.duration && !isNaN(audio.duration) && audio.duration !== Infinity) {
          setFormData(prev => ({ ...prev, duration: Math.round(audio.duration) }));
        }
      };
    }
  }, [formData.audioUrl]);
  const [isAddSongModalOpen, setIsAddSongModalOpen] = useState(false);

  const handleOpenAddModal = () => {
    setFormData({ title: '', class: '', subject: '', chapter: '', chapterNumber: '', courseId: '', audioUrl: '', thumbnailUrl: '', lyricsUrl: '', duration: '', isPremium: false, watermarkUrl: adConfig.watermarkUrl, watermarkPositions: adConfig.watermarkPositions });
    setEditingSongId(null);
    setIsAddSongModalOpen(true);
  };

  const handleEditClick = (song) => {
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
      isPremium: song.isPremium !== false,
      watermarkUrl: song.watermarkUrl || adConfig.watermarkUrl || '',
      watermarkPositions: (song.watermarkPositions && song.watermarkPositions.length > 0) ? song.watermarkPositions : (adConfig.watermarkPositions || [20, 50, 90])
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
    fetchSongs();
    fetchCourses();
    fetchAdConfig();
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
          watermarkUrl: wUrl,
          watermarkPositions: data.audioRollPositions || [20, 50, 90]
        };
        setAdConfig(config);
        // Also update formData if not editing
        if (!editingSongId && !isAddSongModalOpen) {
          setFormData(prev => ({ ...prev, watermarkUrl: config.watermarkUrl, watermarkPositions: config.watermarkPositions }));
        }
      }
    } catch (err) {
      console.error('Error fetching ad config', err);
    }
  };

  const fetchCourses = async () => {
    try {
      const data = await getCourses();
      setCourses(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSongs = async () => {
    try {
      const data = await getSongs();
      setSongs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData };
      if (!payload.courseId) {
        payload.courseId = null;
      }

      if (editingSongId) {
        await updateSong(editingSongId, payload);
        toast.success("Song updated successfully");
      } else {
        await createSong(payload);
        toast.success("Song added successfully");
      }
      setFormData({ title: '', class: '', subject: '', chapter: '', chapterNumber: '', courseId: '', audioUrl: '', thumbnailUrl: '', lyricsUrl: '', duration: '', isPremium: false, watermarkUrl: adConfig.watermarkUrl, watermarkPositions: adConfig.watermarkPositions });
      setEditingSongId(null);
      setIsAddSongModalOpen(false);
      fetchSongs();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const inputClass = "w-full px-4 py-3 rounded-xl border border-outline-variant/40 bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-300 text-on-surface placeholder:text-on-surface-variant/40";
  const labelClass = "text-sm font-bold text-on-surface-variant mb-1.5 ml-1 uppercase tracking-wide text-[11px]";

  // Watermark Preview Logic
  const [previewing, setPreviewing] = useState(false);
  const audioRef = useRef(null);
  const watermarkAudioRef = useRef(null);

  const handlePreview = () => {
    if (!formData.audioUrl) return toast.error("Please add an audio URL first");
    if (!formData.watermarkUrl) return toast.error("Please upload an audio watermark first");
    
    if (previewing) {
      if (audioRef.current) audioRef.current.pause();
      if (watermarkAudioRef.current) watermarkAudioRef.current.pause();
      setPreviewing(false);
      return;
    }
    
    setPreviewing(true);
    audioRef.current = new Audio(formData.audioUrl);
    watermarkAudioRef.current = new Audio(formData.watermarkUrl);
    
    audioRef.current.play();
    
    let lastPlayedPos = -1;
    audioRef.current.ontimeupdate = () => {
      if (!audioRef.current) return;
      const pct = (audioRef.current.currentTime / audioRef.current.duration) * 100;
      
      const pos = formData.watermarkPositions.find(p => pct >= p && pct < p + 5);
      if (pos && pos !== lastPlayedPos) {
        lastPlayedPos = pos;
        audioRef.current.volume = 0.2; // dip volume
        watermarkAudioRef.current.currentTime = 0;
        watermarkAudioRef.current.play();
      }
    };
    
    watermarkAudioRef.current.onended = () => {
      if (audioRef.current) audioRef.current.volume = 1;
    };
    
    audioRef.current.onended = () => {
      setPreviewing(false);
    };
  };

  useEffect(() => {
    return () => {
      if (audioRef.current) audioRef.current.pause();
      if (watermarkAudioRef.current) watermarkAudioRef.current.pause();
    };
  }, []);

  return (
    <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Existing Songs Section */}
      <section>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-on-surface">Manage Songs</h2>
          <button 
            onClick={handleOpenAddModal}
            className="bg-primary text-on-primary px-4 py-2 rounded-xl flex items-center gap-2 font-medium"
          >
            <IconPlus size={20} /> Add Song
          </button>
        </div>

        {loading ? (
          <div className="p-8 text-center text-on-surface-variant">Loading songs...</div>
        ) : (
          <div className="overflow-x-auto bg-surface-container-lowest rounded-2xl border border-[var(--border-floating-card)] shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[var(--border-floating-card)]">
                  <th className="p-4 font-semibold text-on-surface-variant">Title</th>
                  <th className="p-4 font-semibold text-on-surface-variant">Class</th>
                  <th className="p-4 font-semibold text-on-surface-variant">Subject</th>
                  <th className="p-4 font-semibold text-on-surface-variant">Chapter</th>
                  <th className="p-4 font-semibold text-on-surface-variant">Type</th>
                  <th className="p-4 font-semibold text-on-surface-variant text-center">Plays</th>
                  <th className="p-4 font-semibold text-on-surface-variant text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {songs.map(song => (
                  <tr key={song._id} className="border-b border-[var(--border-floating-card)] hover:bg-surface-container/50">
                    <td className="p-4 font-medium text-on-surface">{song.title}</td>
                    <td className="p-4 text-on-surface-variant">{song.class || '-'}</td>
                    <td className="p-4 text-on-surface-variant">{song.subject || '-'}</td>
                    <td className="p-4 text-on-surface-variant">
                      {song.chapter ? `${song.chapter} ${song.chapterNumber ? `(Ch ${song.chapterNumber})` : ''}` : '-'}
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${song.isPremium ? 'bg-amber-500/10 text-amber-600' : 'bg-emerald-500/10 text-emerald-600'}`}>
                        {song.isPremium ? 'Premium' : 'Free'}
                      </span>
                    </td>
                    <td className="p-4 text-center font-mono font-bold text-on-surface">{song.playCount || 0}</td>
                    <td className="p-4 flex items-center justify-end gap-2">
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
                    </td>
                  </tr>
                ))}
                {songs.length === 0 && (
                  <tr>
                    <td colSpan="6" className="p-8 text-center text-on-surface-variant">No songs found.</td>
                  </tr>
                )}
              </tbody>
            </table>
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
                onClick={() => setIsAddSongModalOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-surface-variant/50 text-on-surface-variant hover:text-on-surface hover:bg-surface-variant transition-colors"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
              </button>
            </div>
            
            <div className="flex-1 p-6 overflow-y-auto">
              <form id="add-song-form" onSubmit={handleSubmit} className="flex flex-col gap-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                  <div className="flex flex-col md:col-span-2">
                    <label className={labelClass}>Song Title</label>
                    <input type="text" required placeholder="e.g. The Cell Cycle Rap" className={inputClass} value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
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
                          const songsInChapter = songs.filter(s => s.chapter?.trim().toLowerCase() === newChapter.trim().toLowerCase());
                          const originalSong = editingSongId ? songs.find(s => s._id === editingSongId) : null;
                          
                          if (originalSong && originalSong.chapter?.trim().toLowerCase() === newChapter.trim().toLowerCase()) {
                            nextNumber = originalSong.chapterNumber || Math.max(1, songsInChapter.length);
                          } else {
                            nextNumber = songsInChapter.length + 1;
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
                      <div className="relative">
                        <input type="url" required placeholder="https://..." className={`${inputClass} pr-24`} value={formData.audioUrl} onChange={e => setFormData({...formData, audioUrl: e.target.value})} />
                        <label className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[10px] uppercase font-bold text-primary bg-primary/10 px-2 py-1 rounded cursor-pointer hover:bg-primary/20 transition-colors flex items-center gap-1">
                          <IconUpload size={12} stroke={2.5} /> Upload
                          <input type="file" className="hidden" accept="audio/*,.mp3,.wav,.flac,.aac,.ogg,.m4a" onChange={e => handleFileUpload(e, 'audioUrl', 'songs/audio')} />
                        </label>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                      <div className="flex flex-col">
                        <label className={labelClass}>Thumbnail Image URL <span className="opacity-60 lowercase font-normal">(optional)</span></label>
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
                      </div>
                      <div className="flex flex-col">
                        <label className={labelClass}>Lyrics (.ttml) URL <span className="opacity-60 lowercase font-normal">(optional)</span></label>
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
                      </div>
                      <div className="flex flex-col">
                        <label className={labelClass}>Duration (seconds) <span className="opacity-60 lowercase font-normal">(auto-fetched)</span></label>
                        <input type="number" placeholder="Auto-calculated..." className={inputClass} value={formData.duration} onChange={e => setFormData({...formData, duration: e.target.value})} />
                      </div>
                    </div>
                    </div>
                  </div>

                  <div className="flex flex-col mt-2">
                    <div className="flex items-center gap-2 mb-4">
                      <IconMusic size={18} className="text-on-surface-variant" />
                      <h4 className="font-bold text-on-surface">Audio Watermark / Ads</h4>
                      <div className="h-px bg-outline-variant/30 flex-1 ml-2"></div>
                    </div>
                    <div className="grid grid-cols-1 gap-y-4">
                      <div className="flex flex-col">
                        <label className={labelClass}>Watermark Audio URL <span className="opacity-60 lowercase font-normal">(optional)</span></label>
                        <div className="relative">
                          <input type="url" placeholder="https://..." className={`${inputClass} pr-28`} value={formData.watermarkUrl} onChange={e => setFormData({...formData, watermarkUrl: e.target.value})} />
                          {uploadProgress.watermarkUrl !== undefined ? (
                            <div className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[10px] uppercase font-bold text-primary bg-primary/10 px-2 py-1 rounded flex items-center gap-2 min-w-[70px] justify-center">
                              <span>{uploadProgress.watermarkUrl}%</span>
                              <div className="w-10 h-1 bg-primary/20 rounded-full overflow-hidden">
                                <div className="h-full bg-primary transition-all duration-300" style={{ width: `${uploadProgress.watermarkUrl}%` }} />
                              </div>
                            </div>
                          ) : (
                            <label className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[10px] uppercase font-bold text-primary bg-primary/10 px-2 py-1 rounded cursor-pointer hover:bg-primary/20 transition-colors flex items-center gap-1">
                              <IconUpload size={12} stroke={2.5} /> Upload
                              <input type="file" className="hidden" accept="audio/*,.mp3,.wav,.flac,.aac,.ogg,.m4a" onChange={e => handleFileUpload(e, 'watermarkUrl', 'songs/watermarks')} />
                            </label>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex flex-col">
                        <label className={labelClass}>Positions (% of song length)</label>
                        <WaveformSlider 
                          audioUrl={formData.audioUrl}
                          positions={formData.watermarkPositions}
                          onChange={(newPositions) => setFormData({ ...formData, watermarkPositions: newPositions })}
                        />
                      </div>
                      
                      
                      {formData.watermarkUrl && (
                        <div>
                          <button
                            type="button"
                            onClick={handlePreview}
                            className="bg-surface-variant text-on-surface-variant hover:text-on-surface hover:bg-surface-container px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors"
                          >
                            <IconMusic size={16} /> {previewing ? 'Stop Preview' : 'Preview Song with Watermark'}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-2">
                    <label className="flex items-center justify-between md:justify-start cursor-pointer group w-full md:w-auto md:inline-flex md:gap-6 p-4 rounded-xl border border-outline-variant/40 bg-surface-variant/20 hover:bg-surface-variant/40 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${formData.isPremium ? 'bg-amber-500/10 text-amber-500' : 'bg-outline-variant/20 text-on-surface-variant'}`}>
                          <IconCrown size={20} />
                        </div>
                        <div>
                          <div className="font-bold text-on-surface text-[15px]">Premium Track</div>
                          <div className="text-xs text-on-surface-variant mt-0.5">Only available to subscribed users</div>
                        </div>
                      </div>
                      <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${formData.isPremium ? 'bg-amber-500' : 'bg-outline-variant/50'}`}>
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.isPremium ? 'translate-x-6' : 'translate-x-1'}`} />
                      </div>
                      <input type="checkbox" className="sr-only" checked={formData.isPremium} onChange={e => setFormData({...formData, isPremium: e.target.checked})} />
                    </label>
                  </div>
              </form>
            </div>
            
            <div className="flex-shrink-0 p-6 border-t border-outline-variant/30 bg-surface-container-lowest/50 rounded-b-2xl flex justify-end gap-3">
              <button 
                onClick={() => setIsAddSongModalOpen(false)}
                className="px-6 py-2.5 rounded-xl font-bold text-on-surface-variant hover:text-on-surface hover:bg-surface-variant transition-colors"
              >
                Cancel
              </button>
              <button 
                form="add-song-form"
                type="submit" 
                className="bg-primary text-on-primary px-8 py-2.5 rounded-xl font-bold hover:brightness-110 active:scale-[0.98] transition-all flex items-center gap-2 shadow-md shadow-primary/20 whitespace-nowrap"
              >
                {editingSongId ? <><IconEdit size={18} stroke={2.5} /> Update Song</> : <><IconPlus size={18} stroke={2.5} /> Add Song</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
