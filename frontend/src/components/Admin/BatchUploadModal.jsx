import React, { useState, useCallback, useRef, useEffect } from 'react';
import { uploadFile, createSong } from '../../services/api';
import SearchableSelect from '../ui/SearchableSelect';
import { useClassAndSubjectOptions } from '../../hooks/useClassAndSubjectOptions';
import { cleanSongTitle } from '../../utils/songTitleUtils';
import {
  IconUpload,
  IconX,
  IconMusic,
  IconCheck,
  IconAlertCircle,
  IconChevronDown,
  IconChevronUp,
  IconSettings,
  IconCopy,
  IconLoader2,
  IconTrash,
  IconFileMusic,
  IconArrowRight,
} from '@tabler/icons-react';

const AUDIO_EXTS = [
  'mp3', 'mpeg', 'mpga', 'wav', 'flac', 'aac', 'ogg', 'm4a',
  'opus', 'wma', 'm4p', 'mp2', 'aiff', 'aif', 'caf', 'webm',
  '3gp', 'amr', 'mid', 'midi'
];

function isAudioFile(file) {
  if (!file || !file.name) return false;
  const ext = file.name.trim().split('.').pop().toLowerCase();
  return (
    AUDIO_EXTS.includes(ext) ||
    (file.type && (file.type.startsWith('audio/') || file.type === 'application/octet-stream' || file.type === 'video/webm' || file.type === 'video/3gpp'))
  );
}

function formatBytes(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

function formatSeconds(s) {
  if (!s || isNaN(s)) return '--:--';
  const m = Math.floor(s / 60);
  const sec = Math.round(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

const defaultSongSettings = (adConfig) => ({
  title: '',
  class: '',
  subject: '',
  chapter: '',
  chapterNumber: '',
  courseId: '',
  thumbnailUrl: '',
  lyricsUrl: '',
  songType: 'Study',
  watermarkUrl: adConfig?.watermarkUrl || '',
  watermarkPositions: adConfig?.watermarkPositions || [20, 50, 90],
  audioRollsEnabled: adConfig?.audioRollsEnabled ?? true,
  popupsEnabled: adConfig?.popupsEnabled ?? true,
  popupPositions: adConfig?.popupPositions || [10, 40, 75],
  popupHtml: adConfig?.popupHtml || '',
});

// Status enum
const STATUS = {
  PENDING: 'pending',
  UPLOADING: 'uploading',
  PROCESSING: 'processing',
  DONE: 'done',
  ERROR: 'error',
};

// ─── Per-song settings panel ────────────────────────────────────────────────
function SongSettingsPanel({ song, onChange, courses, adConfig, existingClasses, availableSubjects, availableChapters }) {
  const inputClass =
    'w-full px-3 py-2 rounded-lg border border-outline-variant/40 bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all text-on-surface placeholder:text-on-surface-variant/40 text-sm';
  const labelClass = 'text-[11px] font-bold text-on-surface-variant mb-1 ml-0.5 uppercase tracking-wide block';

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3">
      <div className="sm:col-span-2">
        <label className={labelClass}>Song Title *</label>
        <input
          type="text"
          className={inputClass}
          placeholder="Song title..."
          value={song.title}
          onChange={(e) => onChange({ title: e.target.value })}
        />
      </div>
      <div>
        <label className={labelClass}>Class / Grade</label>
        <SearchableSelect
          className={inputClass}
          value={song.class}
          onChange={(val) => onChange({ class: val })}
          placeholder="Select or create..."
          options={existingClasses.map((c) => ({ value: c, label: c }))}
          creatable
        />
      </div>
      <div>
        <label className={labelClass}>Subject</label>
        <SearchableSelect
          className={inputClass}
          value={song.subject}
          onChange={(val) => onChange({ subject: val })}
          placeholder="Select or create..."
          options={availableSubjects.map((s) => ({ value: s, label: s }))}
          creatable
        />
      </div>
      <div>
        <label className={labelClass}>Chapter</label>
        <SearchableSelect
          className={inputClass}
          value={song.chapter}
          onChange={(val) => onChange({ chapter: val })}
          placeholder="Select or create..."
          options={availableChapters.map((ch) => ({ value: ch, label: ch }))}
          creatable
        />
      </div>
      <div>
        <label className={labelClass}>Chapter Number</label>
        <input
          type="text"
          className={inputClass}
          placeholder="e.g. 1"
          value={song.chapterNumber}
        />
      </div>
      <div>
        <label className={labelClass}>Related Course</label>
        <SearchableSelect
          className={inputClass}
          value={song.courseId}
          onChange={(val) => onChange({ courseId: val })}
          placeholder="Select course..."
          options={courses.map((c) => ({ value: c._id, label: c.title }))}
        />
      </div>
      <div>
        <label className={labelClass}>Song Type</label>
        <select
          className={inputClass}
          value={song.songType}
          onChange={(e) => onChange({ songType: e.target.value })}
        >
          <option value="Study">Study Song</option>
          <option value="Normal">Normal Song</option>
        </select>
      </div>

      <div className="sm:col-span-2 flex items-center gap-6 pt-1">
        <label className="flex items-center gap-2 cursor-pointer select-none text-sm text-on-surface-variant">
          <span>Audio Ads</span>
          <div className="relative">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={song.audioRollsEnabled}
              onChange={(e) => onChange({ audioRollsEnabled: e.target.checked })}
            />
            <div className="w-8 h-4 bg-surface-variant rounded-full peer peer-checked:bg-primary relative after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border after:border-slate-300 after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:after:translate-x-4" />
          </div>
          <span className={`text-xs font-bold ${song.audioRollsEnabled ? 'text-primary' : 'text-on-surface-variant/60'}`}>
            {song.audioRollsEnabled ? 'On' : 'Off'}
          </span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer select-none text-sm text-on-surface-variant">
          <span>Popup Ads</span>
          <div className="relative">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={song.popupsEnabled}
              onChange={(e) => onChange({ popupsEnabled: e.target.checked })}
            />
            <div className="w-8 h-4 bg-surface-variant rounded-full peer peer-checked:bg-primary relative after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border after:border-slate-300 after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:after:translate-x-4" />
          </div>
          <span className={`text-xs font-bold ${song.popupsEnabled ? 'text-primary' : 'text-on-surface-variant/60'}`}>
            {song.popupsEnabled ? 'On' : 'Off'}
          </span>
        </label>

      </div>
    </div>
  );
}

// ─── Single song row in the batch list ──────────────────────────────────────
function SongRow({ item, index, onChange, onRemove, courses, adConfig, existingClasses, existingSubjects, existingChapters, classToSubjects, subjectToChapters }) {
  const [expanded, setExpanded] = useState(index === 0);

  const availableSubjects =
    item.settings.class && classToSubjects[item.settings.class]
      ? classToSubjects[item.settings.class]
      : existingSubjects;

  const availableChapters =
    item.settings.subject && subjectToChapters[item.settings.subject]
      ? subjectToChapters[item.settings.subject]
      : existingChapters;

  const statusColors = {
    [STATUS.PENDING]: 'bg-surface-variant text-on-surface-variant',
    [STATUS.UPLOADING]: 'bg-blue-500/10 text-blue-500',
    [STATUS.PROCESSING]: 'bg-amber-500/10 text-amber-500',
    [STATUS.DONE]: 'bg-emerald-500/10 text-emerald-500',
    [STATUS.ERROR]: 'bg-red-500/10 text-red-500',
  };

  const statusLabel = {
    [STATUS.PENDING]: 'Queued',
    [STATUS.UPLOADING]: `Uploading ${item.uploadProgress ?? 0}%`,
    [STATUS.PROCESSING]: 'Saving...',
    [STATUS.DONE]: 'Done ✓',
    [STATUS.ERROR]: 'Failed',
  };

  const isActive = item.status !== STATUS.DONE && item.status !== STATUS.ERROR;

  return (
    <div className={`rounded-xl border transition-all duration-200 overflow-hidden ${
      item.status === STATUS.DONE ? 'border-emerald-500/30 bg-emerald-500/5' :
      item.status === STATUS.ERROR ? 'border-red-500/30 bg-red-500/5' :
      expanded ? 'border-primary/30 bg-primary/5' :
      'border-outline-variant/30 bg-surface-container-low'
    }`}>
      {/* Row header */}
      <div
        className="flex items-center gap-3 p-3 cursor-pointer select-none"
        onClick={() => isActive && setExpanded(!expanded)}
      >
        {/* Track icon / spinner */}
        <div className={`w-9 h-9 rounded-lg flex-shrink-0 flex items-center justify-center text-xs font-bold ${
          item.status === STATUS.DONE ? 'bg-emerald-500/20 text-emerald-500' :
          item.status === STATUS.ERROR ? 'bg-red-500/20 text-red-500' :
          item.status === STATUS.UPLOADING || item.status === STATUS.PROCESSING
            ? 'bg-blue-500/20 text-blue-500' :
          'bg-surface-variant text-on-surface-variant'
        }`}>
          {item.status === STATUS.DONE ? <IconCheck size={18} /> :
           item.status === STATUS.ERROR ? <IconAlertCircle size={18} /> :
           item.status === STATUS.UPLOADING || item.status === STATUS.PROCESSING
             ? <IconLoader2 size={18} className="animate-spin" /> :
           <IconFileMusic size={18} />
          }
        </div>

        {/* Name & meta */}
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-on-surface text-sm truncate">
            {item.settings.title || item.file.name}
          </div>
          <div className="text-xs text-on-surface-variant/70 flex items-center gap-2 mt-0.5">
            <span>{formatBytes(item.file.size)}</span>
            {item.duration && <><span>·</span><span>{formatSeconds(item.duration)}</span></>}
            {item.status === STATUS.ERROR && item.error && (
              <span className="text-red-500 truncate max-w-[180px]">— {item.error}</span>
            )}
          </div>
        </div>

        {/* Status badge */}
        <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full shrink-0 ${statusColors[item.status]}`}>
          {statusLabel[item.status]}
        </span>

        {/* Remove / expand */}
        {item.status !== STATUS.DONE && item.status !== STATUS.UPLOADING && item.status !== STATUS.PROCESSING && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onRemove(); }}
            className="w-7 h-7 flex items-center justify-center rounded-full bg-surface-variant/60 text-on-surface-variant hover:bg-red-500/10 hover:text-red-500 transition-colors shrink-0"
            title="Remove"
          >
            <IconX size={14} />
          </button>
        )}

        {isActive && (
          <div className="text-on-surface-variant/60 shrink-0">
            {expanded ? <IconChevronUp size={16} /> : <IconChevronDown size={16} />}
          </div>
        )}
      </div>

      {/* Upload progress bar */}
      {(item.status === STATUS.UPLOADING) && (
        <div className="h-1 bg-surface-variant mx-3 mb-3 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 transition-all duration-300 rounded-full"
            style={{ width: `${item.uploadProgress ?? 0}%` }}
          />
        </div>
      )}

      {/* Expanded settings */}
      {expanded && isActive && (
        <div className="px-3 pb-4 border-t border-outline-variant/20 pt-2">
          <SongSettingsPanel
            song={item.settings}
            onChange={(patch) => onChange({ settings: { ...item.settings, ...patch } })}
            courses={courses}
            adConfig={adConfig}
            existingClasses={existingClasses}
            availableSubjects={availableSubjects}
            availableChapters={availableChapters}
          />
        </div>
      )}
    </div>
  );
}

// ─── Main BatchUploadModal ───────────────────────────────────────────────────
export default function BatchUploadModal({ isOpen, onClose, onDone, adConfig, courses, songs }) {
  const [items, setItems] = useState([]);          // { id, file, settings, status, uploadProgress, error, duration }
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sharedMode, setSharedMode] = useState(false);
  const [sharedSettings, setSharedSettings] = useState(null);
  const [dropActive, setDropActive] = useState(false);
  const [dropCounter, setDropCounter] = useState(0);
  const fileInputRef = useRef(null);

  const { classes: existingClasses, subjects: existingSubjects, chapters: existingChapters, classToSubjects, subjectToChapters } = useClassAndSubjectOptions();

  // Reset when modal opens
  useEffect(() => {
    if (isOpen) {
      setItems([]);
      setIsSubmitting(false);
      setSharedMode(false);
      setSharedSettings(defaultSongSettings(adConfig));
      setDropActive(false);
      setDropCounter(0);
    }
  }, [isOpen]);

  const addFiles = useCallback((files) => {
    const audioFiles = Array.from(files).filter(isAudioFile);
    if (audioFiles.length === 0) return;

    const newItems = audioFiles.map((file) => {
      // Try to auto-detect duration
      const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const item = {
        id,
        file,
        settings: {
          ...defaultSongSettings(adConfig),
          title: cleanSongTitle(file.name),
        },
        status: STATUS.PENDING,
        uploadProgress: 0,
        error: null,
        duration: null,
      };

      // Auto-detect duration in background
      const audio = new Audio();
      audio.src = URL.createObjectURL(file);
      audio.onloadedmetadata = () => {
        if (audio.duration && !isNaN(audio.duration)) {
          setItems((prev) =>
            prev.map((i) => i.id === id ? { ...i, duration: Math.round(audio.duration) } : i)
          );
        }
        URL.revokeObjectURL(audio.src);
      };

      return item;
    });

    setItems((prev) => [...prev, ...newItems]);
  }, [adConfig]);

  // Drag & drop handlers on the modal backdrop
  const handleDragEnter = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDropCounter((c) => c + 1);
    setDropActive(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDropCounter((c) => {
      const next = c - 1;
      if (next <= 0) setDropActive(false);
      return Math.max(0, next);
    });
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDropActive(false);
    setDropCounter(0);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      addFiles(e.dataTransfer.files);
    }
  }, [addFiles]);

  const updateItem = useCallback((id, patch) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...patch } : i)));
  }, []);

  const removeItem = useCallback((id) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  // Apply shared settings to all pending items
  const applySharedToAll = () => {
    setItems((prev) =>
      prev.map((item) =>
        item.status === STATUS.PENDING || item.status === STATUS.ERROR
          ? {
              ...item,
              settings: {
                ...sharedSettings,
                title: item.settings.title || cleanSongTitle(item.file.name),
              },
            }
          : item
      )
    );
  };

  const handleSubmit = async () => {
    const pending = items.filter((i) => i.status === STATUS.PENDING || i.status === STATUS.ERROR);
    if (pending.length === 0) return;

    // Validate titles
    const missingTitle = pending.find((i) => !i.settings.title?.trim());
    if (missingTitle) {
      const el = document.getElementById(`song-title-${missingTitle.id}`);
      if (el) el.focus();
      return;
    }

    setIsSubmitting(true);

    for (const item of pending) {
      // 1. Upload audio file
      updateItem(item.id, { status: STATUS.UPLOADING, uploadProgress: 0, error: null });
      let audioUrl = '';
      try {
        const res = await uploadFile(item.file, 'songs/audio', (progress) => {
          updateItem(item.id, { uploadProgress: progress });
        });
        const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
        audioUrl = `${backendUrl}${res.url}`;
      } catch (err) {
        updateItem(item.id, { status: STATUS.ERROR, error: `Upload failed: ${err.message}` });
        continue;
      }

      // 2. Create song record
      updateItem(item.id, { status: STATUS.PROCESSING });
      try {
        const settings = sharedMode
          ? { ...sharedSettings, title: item.settings.title }
          : item.settings;

        const payload = {
          ...settings,
          audioUrl,
          duration: item.duration || '',
          courseId: settings.courseId || null,
        };
        await createSong(payload);
        updateItem(item.id, { status: STATUS.DONE });
      } catch (err) {
        updateItem(item.id, { status: STATUS.ERROR, error: `Save failed: ${err.message}` });
      }
    }

    setIsSubmitting(false);

    // If all done, notify parent
    const finalItems = items.map((i) =>
      pending.find((p) => p.id === i.id && i.status !== STATUS.ERROR) ? { ...i, status: STATUS.DONE } : i
    );
    const allDone = finalItems.every((i) => i.status === STATUS.DONE);
    if (allDone) {
      onDone?.();
    }
  };

  const pendingCount = items.filter((i) => i.status === STATUS.PENDING || i.status === STATUS.ERROR).length;
  const doneCount = items.filter((i) => i.status === STATUS.DONE).length;
  const allDone = items.length > 0 && doneCount === items.length;

  const availSharedSubjects =
    sharedSettings?.class && classToSubjects[sharedSettings.class]
      ? classToSubjects[sharedSettings.class]
      : existingSubjects;

  const availSharedChapters =
    sharedSettings?.subject && subjectToChapters[sharedSettings.subject]
      ? subjectToChapters[sharedSettings.subject]
      : existingChapters;

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/65 backdrop-blur-sm z-[9999] flex items-center justify-center p-3 md:p-6 animate-in fade-in duration-200"
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {/* Global drop overlay */}
      {dropActive && (
        <div className="absolute inset-0 z-[10000] flex items-center justify-center pointer-events-none">
          <div className="absolute inset-6 rounded-3xl border-4 border-dashed border-primary bg-primary/10 backdrop-blur-sm flex items-center justify-center">
            <div className="flex flex-col items-center gap-3 text-primary">
              <IconUpload size={48} strokeWidth={1.5} className="animate-bounce" />
              <span className="font-bold text-xl">Drop audio files here</span>
              <span className="text-sm opacity-75">MP3, MPEG, WAV, FLAC, AAC, OGG, M4A, WEBM, WMA supported</span>
            </div>
          </div>
        </div>
      )}

      {/* Single persistent hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="audio/*,audio/mpeg,audio/mp3,audio/x-mp3,audio/x-mpeg,audio/wav,audio/x-wav,audio/aac,audio/ogg,audio/flac,audio/mp4,audio/webm,audio/3gpp,audio/amr,.mp3,.mpeg,.mpga,.wav,.flac,.aac,.ogg,.m4a,.opus,.wma,.m4p,.mp2,.aiff,.aif,.caf,.webm,.3gp,.amr,.mid,.midi"
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            addFiles(e.target.files);
          }
          e.target.value = '';
        }}
      />

      <div className="bg-surface w-full max-w-3xl rounded-2xl shadow-2xl border border-outline-variant/30 flex flex-col max-h-[92vh] min-h-0 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex-shrink-0 flex items-center justify-between px-6 py-4 border-b border-outline-variant/20">
          <div>
            <h3 className="text-lg font-bold tracking-tight text-on-surface flex items-center gap-2">
              <IconUpload size={20} className="text-primary" />
              Batch Upload Songs
              {items.length > 0 && (
                <span className="text-sm font-semibold text-on-surface-variant/70 ml-1">
                  ({doneCount}/{items.length} done)
                </span>
              )}
            </h3>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Drag & drop multiple audio files or click to browse. Configure each song individually or use shared settings.
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-surface-variant/50 text-on-surface-variant hover:bg-surface-variant hover:text-on-surface transition-colors disabled:opacity-40"
          >
            <IconX size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {/* Drop zone (shown when empty) */}
          {items.length === 0 ? (
            <div
              className={`m-5 rounded-2xl border-2 border-dashed transition-all duration-200 flex flex-col items-center justify-center py-16 cursor-pointer gap-4 ${
                dropActive
                  ? 'border-primary bg-primary/10 scale-[1.01]'
                  : 'border-outline-variant/40 bg-surface-container-low hover:border-primary/50 hover:bg-primary/5'
              }`}
              onClick={() => fileInputRef.current?.click()}
            >
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all ${
                dropActive ? 'bg-primary text-on-primary scale-110' : 'bg-primary/10 text-primary'
              }`}>
                <IconMusic size={32} />
              </div>
              <div className="text-center">
                <p className="font-bold text-on-surface text-base">Drop audio files here</p>
                <p className="text-on-surface-variant text-sm mt-1">or <span className="text-primary font-semibold underline underline-offset-2">click to browse</span></p>
                <p className="text-on-surface-variant/60 text-xs mt-2">MP3, MPEG, WAV, FLAC, AAC, OGG, M4A, WEBM, WMA, OPUS • Multiple files at once</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-4 p-5">
              {/* Add more files button */}
              {!allDone && (
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isSubmitting}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl border border-dashed border-outline-variant/50 text-on-surface-variant hover:border-primary/50 hover:text-primary hover:bg-primary/5 text-sm font-medium transition-all disabled:opacity-40"
                  >
                    <IconUpload size={16} />
                    Add more files
                  </button>
                  <span className="text-xs text-on-surface-variant/60">or drag & drop anywhere</span>
                </div>
              )}

              {/* Shared settings toggle */}
              {!allDone && (
                <div className={`rounded-xl border transition-all ${
                  sharedMode ? 'border-primary/40 bg-primary/5' : 'border-outline-variant/30 bg-surface-container-low'
                }`}>
                  <button
                    type="button"
                    onClick={() => setSharedMode(!sharedMode)}
                    className="w-full flex items-center gap-3 p-3 text-left"
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                      sharedMode ? 'bg-primary text-on-primary' : 'bg-surface-variant text-on-surface-variant'
                    }`}>
                      <IconSettings size={17} />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-sm text-on-surface">Shared Settings</p>
                      <p className="text-xs text-on-surface-variant/70">Apply the same class, subject, chapter & ads to all songs</p>
                    </div>
                    <div className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${
                      sharedMode ? 'text-primary' : 'text-on-surface-variant/50'
                    }`}>
                      {sharedMode ? <IconChevronUp size={18} /> : <IconChevronDown size={18} />}
                    </div>
                  </button>

                  {sharedMode && sharedSettings && (
                    <div className="px-3 pb-4 border-t border-outline-variant/20 pt-2">
                      <SongSettingsPanel
                        song={sharedSettings}
                        onChange={(patch) => setSharedSettings((prev) => ({ ...prev, ...patch }))}
                        courses={courses}
                        adConfig={adConfig}
                        existingClasses={existingClasses}
                        availableSubjects={availSharedSubjects}
                        availableChapters={availSharedChapters}
                      />
                      <button
                        type="button"
                        onClick={applySharedToAll}
                        className="mt-4 flex items-center gap-2 px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg text-sm font-bold transition-colors"
                      >
                        <IconCopy size={15} />
                        Apply to all songs
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Song list */}
              <div className="flex flex-col gap-2.5">
                {items.map((item, index) => (
                  <SongRow
                    key={item.id}
                    item={item}
                    index={index}
                    onChange={(patch) => updateItem(item.id, patch)}
                    onRemove={() => removeItem(item.id)}
                    courses={courses}
                    adConfig={adConfig}
                    existingClasses={existingClasses}
                    existingSubjects={existingSubjects}
                    existingChapters={existingChapters}
                    classToSubjects={classToSubjects}
                    subjectToChapters={subjectToChapters}
                  />
                ))}
              </div>

              {/* All done summary */}
              {allDone && (
                <div className="flex flex-col items-center gap-3 py-6 text-emerald-500">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
                    <IconCheck size={28} />
                  </div>
                  <p className="font-bold text-base">All songs uploaded successfully!</p>
                  <p className="text-sm text-on-surface-variant">{doneCount} song{doneCount !== 1 ? 's' : ''} added to the library</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 px-5 py-4 border-t border-outline-variant/20 bg-surface-container-lowest/50 rounded-b-2xl flex items-center justify-between gap-3">
          <div className="text-xs text-on-surface-variant/60">
            {items.length > 0 && !allDone && (
              <span>{pendingCount} song{pendingCount !== 1 ? 's' : ''} ready to upload</span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={allDone ? onDone : onClose}
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl font-bold text-on-surface-variant hover:text-on-surface hover:bg-surface-variant transition-colors text-sm disabled:opacity-40"
            >
              {allDone ? 'Close' : 'Cancel'}
            </button>
            {!allDone && (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting || pendingCount === 0}
                className="bg-primary text-on-primary px-6 py-2.5 rounded-xl font-bold hover:brightness-110 active:scale-[0.98] transition-all flex items-center gap-2 shadow-md shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                {isSubmitting ? (
                  <><IconLoader2 size={17} className="animate-spin" /> Uploading...</>
                ) : (
                  <><IconArrowRight size={17} /> Upload {pendingCount > 0 ? `${pendingCount} Song${pendingCount !== 1 ? 's' : ''}` : 'All'}</>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
