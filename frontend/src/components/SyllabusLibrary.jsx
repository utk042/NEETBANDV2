import React, { useState, useRef, useEffect } from 'react';
import { IconChevronDown, IconPlayerPlay, IconPlayerPause, IconPlayerPlayFilled, IconPlayerPauseFilled, IconRotate2, IconRotate, IconArrowsShuffle, IconRepeat, IconPlaylist, IconVolume, IconSearch, IconDots, IconShare, IconHeart } from '@tabler/icons-react';
import { usePlayer } from '../contexts/PlayerContext';


export default function SyllabusLibrary({ tracks, currentTrack, isPlaying, onTrackSelect, currentTime, favoritedTrackIds, onToggleFavorite, onSeek }) {
  const { isShuffled, setIsShuffled, repeatMode, cycleRepeat } = usePlayer();
  const [searchQuery, setSearchQuery] = useState('');
  
  const [selectedClass, setSelectedClass] = useState('All');
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [selectedChapter, setSelectedChapter] = useState('All');
  const [openDropdown, setOpenDropdown] = useState(null); // 'class' | 'subject' | 'chapter' | null
  
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const displayTrack = currentTrack || tracks[0] || {
    id: 1,
    title: "Mendelian Genetics Anthem",
    chapter: "Genetics & Evolution",
    duration: "4:20",
    durationSeconds: 260,
    cover: ""
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const currentSeconds = currentTime || 0;
  const totalSeconds = displayTrack.durationSeconds || 260;
  const progressPercent = Math.min((currentSeconds / totalSeconds) * 100, 100);

  // Maintain consistent wave shapes between renders
  const waveformHeights = useRef(
    [...Array(90)].map(() => Math.floor(Math.random() * 65) + 15)
  );
  const waveSpeeds = useRef(
    [...Array(90)].map(() => (Math.random() * 0.8 + 0.6).toFixed(2))
  );
  const waveDelays = useRef(
    [...Array(90)].map(() => (Math.random() * 0.5).toFixed(2))
  );

  const chaptersList = React.useMemo(() => {
    const chapters = new Set();
    tracks.forEach(track => {
      if (!track.chapter) return;
      const classMatch = selectedClass === 'All' || track.grade === selectedClass || track.class === selectedClass;
      const subjectMatch = selectedSubject === 'All' || track.subject?.toLowerCase() === selectedSubject.toLowerCase();
      if (classMatch && subjectMatch) chapters.add(track.chapter);
    });
    return ['All', ...Array.from(chapters)];
  }, [tracks, selectedClass, selectedSubject]);

  const filteredTracks = React.useMemo(() => {
    return tracks.filter(track => {
      const classMatch = selectedClass === 'All' || track.grade === selectedClass || track.class === selectedClass;
      const subjectMatch = selectedSubject === 'All' || track.subject?.toLowerCase() === selectedSubject.toLowerCase();
      const chapterMatch = selectedChapter === 'All' || track.chapter === selectedChapter;
      const searchMatch = !searchQuery || 
        track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        track.chapter.toLowerCase().includes(searchQuery.toLowerCase());
      return classMatch && subjectMatch && chapterMatch && searchMatch;
    });
  }, [tracks, selectedClass, selectedSubject, selectedChapter, searchQuery]);

  return (
    <>
      <style>{`
        @keyframes sylWave {
          0%   { transform: scaleY(0.35) }
          50%  { transform: scaleY(1.0)  }
          100% { transform: scaleY(0.45) }
        }
        .syl-wave-active { 
          animation: sylWave var(--sdur) ease-in-out infinite alternate;
          animation-delay: var(--sdelay);
          transform-origin: bottom;
        }
      `}</style>
      <section id="syllabus-library" className="py-32 px-gutter bg-transparent relative overflow-hidden transition-colors duration-300">
      

      
      <div className="max-w-container-max mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <div data-gsap="syllabus-heading">
            <h2 className="font-headline-lg font-bold text-headline-lg-mobile md:text-4xl text-on-surface mb-3 text-balance">Browse by Syllabus</h2>
            <p className="font-body-md font-normal text-lg text-on-surface-variant opacity-80">Find the perfect study track for your current topic.</p>
          </div>
          
          <div data-gsap="syllabus-filters" ref={dropdownRef} className="flex flex-wrap gap-4 w-full md:w-auto relative z-30">
            {/* Class Dropdown */}
            <div className="relative">
              <button
                onClick={() => setOpenDropdown(openDropdown === 'class' ? null : 'class')}
                aria-haspopup="listbox"
                aria-expanded={openDropdown === 'class'}
                aria-label="Select Class"
                className={`px-5 py-2.5 rounded-full border font-label-md text-sm flex items-center gap-2 transition-[colors,border-color] duration-200 backdrop-blur-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 cursor-pointer ${selectedClass !== 'All' ? 'border-primary/50 text-primary bg-primary/10 shadow-[0_0_15px_rgba(201,162,39,0.05)]' : 'border-[var(--border-floating-card)] text-on-surface bg-surface hover:bg-surface-container hover:border-primary/50'}`}
              >
                {selectedClass === 'All' ? 'All Classes' : selectedClass} 
                <IconChevronDown size={18} className={`text-primary transition-transform duration-200 ${openDropdown === 'class' ? 'rotate-180' : ''}`} />
              </button>
              {openDropdown === 'class' && (
                <ul 
                  role="listbox" 
                  className="absolute top-full left-0 mt-2 w-48 bg-surface-container border border-outline/10 rounded-2xl shadow-2xl z-40 py-2 outline-none animate-in fade-in slide-in-from-top-1 duration-150"
                >
                  {['All', 'Class 11', 'Class 12', 'Class 10', 'Dropper'].map((cls) => (
                    <li
                      key={cls}
                      role="option"
                      aria-selected={selectedClass === cls}
                      tabIndex={0}
                      onClick={() => { setSelectedClass(cls); setSelectedChapter('All'); setOpenDropdown(null); }}
                      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { setSelectedClass(cls); setSelectedChapter('All'); setOpenDropdown(null); } }}
                      className={`px-4 py-2 text-sm text-on-surface-variant hover:text-on-surface hover:bg-primary/10 cursor-pointer transition-colors outline-none focus-visible:bg-primary/10 ${selectedClass === cls ? 'text-primary font-bold bg-primary/5' : ''}`}
                    >
                      {cls}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Subject Dropdown */}
            <div className="relative">
              <button
                onClick={() => setOpenDropdown(openDropdown === 'subject' ? null : 'subject')}
                aria-haspopup="listbox"
                aria-expanded={openDropdown === 'subject'}
                aria-label="Select Subject"
                className={`px-5 py-2.5 rounded-full border font-label-md text-sm flex items-center gap-2 transition-[colors,border-color] duration-200 backdrop-blur-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 cursor-pointer ${selectedSubject !== 'All' ? 'border-primary/50 text-primary bg-primary/10 shadow-[0_0_15px_rgba(201,162,39,0.05)]' : 'border-[var(--border-floating-card)] text-on-surface bg-surface hover:bg-surface-container hover:border-primary/50'}`}
              >
                {selectedSubject === 'All' ? 'All Subjects' : selectedSubject}
                <IconChevronDown size={18} className={`text-primary transition-transform duration-200 ${openDropdown === 'subject' ? 'rotate-180' : ''}`} />
              </button>
              {openDropdown === 'subject' && (
                <ul 
                  role="listbox" 
                  className="absolute top-full left-0 mt-2 w-48 bg-surface-container border border-outline/10 rounded-2xl shadow-2xl z-40 py-2 outline-none animate-in fade-in slide-in-from-top-1 duration-150"
                >
                  {['All', 'Biology', 'Physics', 'Chemistry'].map((sub) => (
                    <li
                      key={sub}
                      role="option"
                      aria-selected={selectedSubject === sub}
                      tabIndex={0}
                      onClick={() => { setSelectedSubject(sub); setSelectedChapter('All'); setOpenDropdown(null); }}
                      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { setSelectedSubject(sub); setSelectedChapter('All'); setOpenDropdown(null); } }}
                      className={`px-4 py-2 text-sm text-on-surface-variant hover:text-on-surface hover:bg-primary/10 cursor-pointer transition-colors outline-none focus-visible:bg-primary/10 ${selectedSubject === sub ? 'text-primary font-bold bg-primary/5' : ''}`}
                    >
                      {sub}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Chapter Dropdown */}
            <div className="relative">
              <button
                onClick={() => setOpenDropdown(openDropdown === 'chapter' ? null : 'chapter')}
                aria-haspopup="listbox"
                aria-expanded={openDropdown === 'chapter'}
                aria-label="Select Chapter"
                className="px-5 py-2.5 rounded-full border border-primary/50 text-primary font-label-md text-sm flex items-center gap-2 bg-primary/10 shadow-[0_0_15px_rgba(201,162,39,0.05)] transition-[colors,border-color,box-shadow] duration-200 backdrop-blur-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 cursor-pointer"
              >
                {selectedChapter === 'All' ? 'All Chapters' : selectedChapter}
                <IconChevronDown size={18} className={`text-primary transition-transform duration-200 ${openDropdown === 'chapter' ? 'rotate-180' : ''}`} />
              </button>
              {openDropdown === 'chapter' && (
                <ul 
                  role="listbox" 
                  className="absolute top-full right-0 mt-2 w-64 bg-surface-container border border-outline/10 rounded-2xl shadow-2xl z-40 py-2 outline-none max-h-60 overflow-y-auto animate-in fade-in slide-in-from-top-1 duration-150"
                >
                  {chaptersList.map((chap) => (
                    <li
                      key={chap}
                      role="option"
                      aria-selected={selectedChapter === chap}
                      tabIndex={0}
                      onClick={() => { setSelectedChapter(chap); setOpenDropdown(null); }}
                      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { setSelectedChapter(chap); setOpenDropdown(null); } }}
                      className={`px-4 py-2 text-sm text-on-surface-variant hover:text-on-surface hover:bg-primary/10 cursor-pointer transition-colors outline-none focus-visible:bg-primary/10 truncate ${selectedChapter === chap ? 'text-primary font-bold bg-primary/5' : ''}`}
                    >
                      {chap}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        {/* Table Container Box */}
        <div data-gsap="track-table" className="bg-surface-container-lowest rounded-3xl border border-primary/20 shadow-[var(--shadow-floating-card)] relative z-10 overflow-hidden flex flex-col">
          
          {/* Integrated Top Player Banner (Primary Color Redesign) */}
          <div className="bg-primary text-on-primary py-5 px-5 md:py-7 md:px-8 relative select-none overflow-hidden border-b border-[var(--border-nav-layout)] transition-colors duration-300">
            {/* Deep Dynamic Spotlights & Texture */}            {/* Subtle noise overlay */}
            <div className="absolute inset-0 opacity-[0.05] pointer-events-none mix-blend-overlay" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}></div>
            
            <div className="flex flex-col gap-4 md:gap-6 z-10 relative">
              {/* Row 1: Cover, Title, and Metadata (On Desktop), or Cover + Title + Mobile Play Button (On Mobile) */}
              <div className="flex items-center justify-between gap-4 w-full">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-12 h-12 md:w-20 md:h-20 bg-white/10 rounded-xl overflow-hidden flex-shrink-0 border border-white/20 shadow-sm relative group">
                    <img className="object-cover w-full h-full transform transition-transform duration-700 group-hover:scale-105" alt={displayTrack.title} src={displayTrack.cover || 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIHZpZXdCb3g9IjAgMCA0MDAgNDAwIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0iIzFhMWExYSIvPjwvc3ZnPg=='} width={80} height={80}/>
                    <div className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-xl pointer-events-none"></div>
                  </div>
                  
                  <div className="flex flex-col min-w-0 justify-center">
                    <span className="text-lg md:text-2xl font-headline-lg font-bold leading-tight tracking-tight truncate text-on-primary">
                      {`0${tracks.findIndex(t => t.id === displayTrack.id) + 1} ${displayTrack.title}`}
                    </span>
                    <span className="text-xs md:text-base font-medium text-on-primary/80 truncate mt-0.5">
                      {displayTrack.chapter}
                    </span>
                  </div>
                </div>

                {/* Right side of Row 1: Tracks/Min Badges (desktop) OR Mobile Play Button (mobile) */}
                <div className="flex items-center gap-3">
                  {/* Desktop Only Badges */}
                  <div className="hidden lg:flex items-center gap-3">
                    <span className="px-2.5 py-1 rounded-lg bg-white/20 backdrop-blur-sm border border-white/10 text-[10px] md:text-xs font-bold tracking-widest text-on-primary uppercase shadow-[0_2px_10px_rgba(0,0,0,0.1)]">
                      {tracks.length} TRACKS
                    </span>
                    <span className="text-[11px] md:text-xs font-semibold tracking-wider text-on-primary/60 uppercase">
                      24 MIN.
                    </span>
                  </div>
                  
                  {/* Mobile Only Play Button */}
                  <button 
                    onClick={() => onTrackSelect(displayTrack)}
                    className="lg:hidden w-11 h-11 rounded-full border border-white/30 flex items-center justify-center text-on-primary hover:bg-white/20 transition-all duration-300 flex-shrink-0 bg-white/10 backdrop-blur-md shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
                    aria-label={isPlaying ? 'Pause' : 'Play'}
                  >
                    {isPlaying ? (
                      <IconPlayerPauseFilled size={22} className="text-on-primary" aria-hidden="true" />
                    ) : (
                      <IconPlayerPlayFilled size={22} className="text-on-primary translate-x-[1px]" aria-hidden="true" />
                    )}
                  </button>
                </div>
              </div>

              {/* Row 2 on Desktop / Row 2-3 on Mobile: Controls, Scrubber & Subcontrols */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 w-full">
                
                {/* Desktop Play Button + Waveform Scrubber */}
                <div className="flex items-center gap-4 flex-1 min-w-0 w-full">
                  {/* Desktop Play Button */}
                  <button 
                    onClick={() => onTrackSelect(displayTrack)}
                    className="hidden lg:flex w-14 h-14 rounded-full border border-white/30 items-center justify-center text-on-primary hover:scale-105 hover:bg-white/20 transition-all duration-300 flex-shrink-0 bg-white/10 backdrop-blur-md shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 relative overflow-hidden group"
                    aria-label={isPlaying ? 'Pause' : 'Play'}
                  >
                    <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                    {isPlaying ? (
                      <IconPlayerPauseFilled size={28} className="text-on-primary relative z-10 drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]" aria-hidden="true" />
                    ) : (
                      <IconPlayerPlayFilled size={28} className="text-on-primary relative z-10 translate-x-[2px]" aria-hidden="true" />
                    )}
                  </button>
                  
                  {/* Waveform Scrubber */}
                  <div className="flex-1 flex items-center gap-3 min-w-0">
                    <span className="text-[11px] font-mono font-medium text-on-primary/70 tracking-wider">{formatTime(currentSeconds)}</span>
                    
                    <div className="flex-1 h-8 md:h-11 flex items-end justify-center gap-[1.5px] overflow-hidden relative cursor-pointer group">
                      {/* Interactive hover area for scrubber */}
                      <div className="absolute inset-0 z-20 group-hover:bg-white/5 transition-colors duration-300 rounded-lg"></div>
                      {waveformHeights.current.map((h, i) => {
                        const isActive = i / 90 <= progressPercent / 100;
                        return (
                          <div 
                            key={i} 
                            className={`w-[2px] rounded-t-sm flex-shrink-0 transition-colors duration-300 ${
                              isActive ? 'bg-on-primary' : 'bg-on-primary/30'
                            } ${isPlaying && isActive ? 'syl-wave-active' : ''}`}
                            style={{ 
                              height: `${h * 0.85}%`,
                              transformOrigin: 'bottom',
                              '--sdur': `${waveSpeeds.current[i]}s`,
                              '--sdelay': `-${waveDelays.current[i]}s`
                            }}
                          />
                        );
                      })}
                    </div>
                    
                    <span className="text-[11px] font-mono font-medium text-on-primary/70 tracking-wider">
                      -{formatTime(Math.max(0, totalSeconds - currentSeconds))}
                    </span>
                  </div>
                </div>

                {/* Sub-controls */}
                <div className="flex items-center justify-between lg:justify-end gap-4 lg:gap-5 text-on-primary/70 w-full lg:w-auto z-10 relative">
                  <div className="flex items-center gap-4 md:gap-5">
                    <button 
                      onClick={() => onSeek?.(Math.max(0, currentSeconds - 10))}
                      className="hover:text-on-primary hover:scale-110 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 rounded-xl flex items-center justify-center" 
                      aria-label="Replay 10s"
                    >
                      <IconRotate2 size={20} aria-hidden="true" />
                    </button>
                    <button 
                      onClick={() => onSeek?.(Math.min(totalSeconds, currentSeconds + 30))}
                      className="hover:text-on-primary hover:scale-110 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 rounded-xl flex items-center justify-center" 
                      aria-label="Forward 30s"
                    >
                      <IconRotate size={20} aria-hidden="true" />
                    </button>
                    <button 
                      onClick={() => setIsShuffled(!isShuffled)}
                      className={`${isShuffled ? 'text-on-primary' : 'text-on-primary/50 hover:text-on-primary'} hover:scale-110 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 rounded-xl flex items-center justify-center`} 
                      aria-label="Shuffle"
                    >
                      <IconArrowsShuffle size={20} aria-hidden="true" />
                    </button>
                    <button 
                      onClick={cycleRepeat}
                      className={`${repeatMode !== 'none' ? 'text-on-primary' : 'text-on-primary/50 hover:text-on-primary'} hover:scale-110 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 rounded-xl flex items-center justify-center`} 
                      aria-label={`Repeat (current mode: ${repeatMode})`}
                    >
                      <IconRepeat size={20} aria-hidden="true" />
                    </button>
                    <button className="hover:text-on-primary hover:scale-110 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 rounded-xl flex items-center justify-center" aria-label="Queue"><IconPlaylist size={20} aria-hidden="true" /></button>
                  </div>
                  <div className="hidden lg:block w-px h-4 bg-on-primary/20"></div>
                  <button className="hover:text-on-primary hover:scale-110 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 rounded-xl flex items-center justify-center" aria-label="Volume"><IconVolume size={20} aria-hidden="true" /></button>
                </div>
              </div>
            </div>
          </div>

          {/* Search Input Box */}
          <div className="px-6 py-4 border-b border-[var(--border-nav-layout)] bg-surface-container-low/40 z-10">
            <div className="relative w-full flex items-center">
              <IconSearch size={20} className="absolute left-4 text-on-surface-variant/60" aria-hidden="true" />
              <input 
                type="text" 
                name="search"
                autoComplete="off"
                aria-label="Search study tracks"
                placeholder="Enter any keyword… e.g. Genetics" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 bg-surface-container border border-[var(--border-floating-card)] rounded-xl text-on-surface placeholder-on-surface-variant/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:border-primary/50 transition-colors text-sm"
              />
            </div>
          </div>

          {/* Track List */}
          <div data-gsap="track-list" className="w-full flex flex-col z-10">
            {/* Header */}
            <div className="hidden md:flex px-6 py-3 text-on-surface-variant font-label-sm text-xs uppercase tracking-widest opacity-60 font-semibold border-b border-[var(--border-nav-layout)]">
              <div className="w-12"></div>
              <div className="flex-1">Title</div>
              <div className="w-24 lg:w-48 text-left">Class</div>
              <div className="w-28 lg:w-32 text-right"></div>
            </div>

            {/* Rows */}
            {filteredTracks.map((track) => {
              const isCurrent = currentTrack && currentTrack.id === track.id;
              const trackIndex = tracks.findIndex(t => t.id === track.id) + 1;
              const displayIndex = trackIndex < 10 ? `0${trackIndex}` : trackIndex;
              
              return (
                <div 
                  key={track.id}
                  data-gsap="track-item"
                  role="button"
                  tabIndex={0}
                  onClick={() => onTrackSelect(track)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onTrackSelect(track);
                    }
                  }}
                  className={`relative flex items-center px-4 md:px-6 py-4 transition-all duration-300 group cursor-pointer [&:not(:last-child)]:border-b focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 ${
                    isCurrent 
                      ? 'bg-primary/12 dark:bg-primary/18 border-primary/45 shadow-[0_2px_12px_rgba(201,162,39,0.08)]' 
                      : 'bg-transparent border-[var(--border-nav-layout)]/65 hover:bg-surface-container-low/50'
                  } ${
                    track.premium ? 'opacity-85 hover:opacity-100' : ''
                  }`}
                >
                  <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-0 pr-2">
                    {/* Play/Pause hover image overlay */}
                    <div className="w-10 h-10 rounded-xl overflow-hidden relative border border-[var(--border-floating-card)] flex-shrink-0 bg-surface-container block">
                      <img className="object-cover w-full h-full" alt={track.title} src={track.cover} width={40} height={40} loading="lazy"/>
                      <div className="absolute inset-0 bg-black/45 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        {isCurrent && isPlaying ? (
                          <IconPlayerPauseFilled size={20} className="text-white" aria-hidden="true" />
                        ) : (
                          <IconPlayerPlayFilled size={20} className="text-white translate-x-[1px]" aria-hidden="true" />
                        )}
                      </div>
                      {isCurrent && isPlaying && (
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                          <IconVolume size={20} className="text-primary" aria-hidden="true" />
                        </div>
                      )}
                    </div>
                    
                    {/* Track info & prefix display index */}
                    <div className="min-w-0 flex-1 flex flex-col">
                      <div className="font-headline-md text-[15px] md:text-base group-hover:text-primary transition-colors font-bold flex items-center gap-2 truncate">
                        <span className={`font-normal transition-colors duration-300 flex items-center flex-shrink-0 w-6 md:w-auto ${isCurrent ? 'text-primary' : 'text-on-surface-variant/80'}`}>
                          {isCurrent ? (
                             isPlaying ? (
                                <IconVolume size={18} className="text-primary flex-shrink-0" aria-hidden="true" />
                              ) : (
                                <IconPlayerPlayFilled size={18} className="text-primary flex-shrink-0 translate-x-[1px]" aria-hidden="true" />
                              )
                          ) : (
                            displayIndex
                          )}
                        </span>
                        <span className={`truncate ${isCurrent ? 'text-primary' : 'text-on-surface'}`}>{track.title}</span>
                        {track.premium && (
                          <span className="px-1.5 py-[1px] rounded-lg text-[8px] bg-primary/10 text-primary border border-primary/20 tracking-wider flex-shrink-0 font-normal hidden sm:inline-block">
                            PREMIUM
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-on-surface-variant/70 md:hidden mt-0.5 truncate pl-8">{track.chapter}</span>
                    </div>
                  </div>

                  {/* Class Column */}
                  <div className="hidden md:block w-24 lg:w-48 text-left font-body-md text-sm text-on-surface-variant font-medium truncate pr-4">
                    {track.class || track.grade || 'Class 12'}
                  </div>
                  
                  {/* Action Icons */}
                  <div className="w-auto md:w-28 lg:w-32 flex justify-end items-center gap-1 md:gap-3 text-on-surface-variant/60 flex-shrink-0">
                    <button className="hover:text-primary transition-colors p-1 md:p-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded-xl hidden sm:block flex items-center justify-center" aria-label="More options"><IconDots size={20} className="block" /></button>
                    <button className="hover:text-primary transition-colors p-1 md:p-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded-xl hidden sm:block flex items-center justify-center" aria-label="Share track"><IconShare size={20} className="block" /></button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); onToggleFavorite?.(track.id); }}
                      className={`hover:text-primary transition-colors p-1 md:p-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded-xl flex items-center justify-center ${favoritedTrackIds?.includes(track.id) ? 'text-primary' : ''}`} 
                      aria-label={favoritedTrackIds?.includes(track.id) ? "Remove from favorites" : "Add to favorites"}
                    >
                      <IconHeart size={20} className={`block ${favoritedTrackIds?.includes(track.id) ? 'fill-current' : ''}`} />
                    </button>
                  </div>
                </div>
              );
            })}
            
            {filteredTracks.length === 0 && (
              <div className="text-center py-10 text-on-surface-variant opacity-60">
                No tracks found matching "{searchQuery}"
              </div>
            )}
          </div>

        </div>
      </div>
    </section>
    </>
  );
}
