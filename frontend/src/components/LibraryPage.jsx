import React, { useState, useRef, useEffect } from 'react';
import {
  IconSearch, IconBook2, IconPlayerPlayFilled,
  IconPlayerPauseFilled, IconHeart, IconArrowRight,
  IconArrowLeft, IconRefresh, IconDna, IconAtom, IconFlask, IconCrown, IconChevronDown
} from '@tabler/icons-react';

const EQ_STYLES = `
  @keyframes eqBar1 { 0%{height:25%} 100%{height:100%} }
  @keyframes eqBar2 { 0%{height:35%} 100%{height:80%}  }
  @keyframes eqBar3 { 0%{height:15%} 100%{height:95%}  }
  @keyframes eqBar4 { 0%{height:45%} 100%{height:65%}  }
  .eq-bar-1{animation:eqBar1 0.6s ease-in-out infinite alternate}
  .eq-bar-2{animation:eqBar2 0.8s ease-in-out infinite alternate}
  .eq-bar-3{animation:eqBar3 0.5s ease-in-out infinite alternate}
  .eq-bar-4{animation:eqBar4 0.7s ease-in-out infinite alternate}
`;

const SUBJECTS = [
  {
    id: 'Biology', label: 'Biology', chapters: '38 chapters', tag: 'NEET Core', Icon: IconDna,
    cardBg: 'bg-emerald-50 dark:bg-emerald-950/50',
    cardBorder: 'border-emerald-200 dark:border-emerald-800/60',
    cardHover: 'hover:border-emerald-400 dark:hover:border-emerald-600',
    accentText: 'text-emerald-700 dark:text-emerald-400',
    tagBg: 'bg-emerald-100 dark:bg-emerald-900/60',
    tagText: 'text-emerald-700 dark:text-emerald-400',
    iconColor: 'text-emerald-300 dark:text-emerald-700',
  },
  {
    id: 'Physics', label: 'Physics', chapters: '28 chapters', tag: 'Core Subject', Icon: IconAtom,
    cardBg: 'bg-sky-50 dark:bg-sky-950/50',
    cardBorder: 'border-sky-200 dark:border-sky-800/60',
    cardHover: 'hover:border-sky-400 dark:hover:border-sky-600',
    accentText: 'text-sky-700 dark:text-sky-400',
    tagBg: 'bg-sky-100 dark:bg-sky-900/60',
    tagText: 'text-sky-700 dark:text-sky-400',
    iconColor: 'text-sky-300 dark:text-sky-700',
  },
  {
    id: 'Chemistry', label: 'Chemistry', chapters: '30 chapters', tag: 'Core Subject', Icon: IconFlask,
    cardBg: 'bg-amber-50 dark:bg-amber-950/50',
    cardBorder: 'border-amber-200 dark:border-amber-800/60',
    cardHover: 'hover:border-amber-400 dark:hover:border-amber-600',
    accentText: 'text-amber-700 dark:text-amber-400',
    tagBg: 'bg-amber-100 dark:bg-amber-900/60',
    tagText: 'text-amber-700 dark:text-amber-400',
    iconColor: 'text-amber-300 dark:text-amber-700',
  },
];

const CLASSES = ['All', 'Class 11', 'Class 12', 'Class 10', 'Dropper'];

const getSubjectIcon = (subjectName) => {
  const sub = SUBJECTS.find(s => s.id.toLowerCase() === (subjectName || '').toLowerCase());
  return sub ? sub.Icon : IconBook2;
};


function EqBars() {
  return (
    <div className="flex items-end h-4 w-5 gap-[2px] shrink-0">
      <div className="w-[3px] bg-current rounded-t-[1px] eq-bar-1" />
      <div className="w-[3px] bg-current rounded-t-[1px] eq-bar-2" />
      <div className="w-[3px] bg-current rounded-t-[1px] eq-bar-3" />
      <div className="w-[3px] bg-current rounded-t-[1px] eq-bar-4" />
    </div>
  );
}

/* Reusable track row used in both catalog search results and detail view */
function TrackRow({ track, idx, isCurrent, isTrackPlaying, isFavorited, accentText, onPlay, onFavorite }) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onPlay}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onPlay(); }}
      className={`group flex items-center gap-4 px-4 py-3 rounded-xl cursor-pointer transition-all border ${
        isCurrent ? 'bg-surface-container border-primary/20' : 'border-transparent hover:bg-surface-container hover:border-outline/10'
      }`}
    >
      {/* Index / play icon */}
      <div className="w-6 shrink-0 flex items-center justify-center">
        {isTrackPlaying ? (
          <div className={accentText}><EqBars /></div>
        ) : (
          <>
            <span className={`text-xs font-mono text-on-surface-variant group-hover:hidden ${isCurrent ? 'hidden' : ''}`}>
              {String(idx + 1).padStart(2, '0')}
            </span>
            <span className={`hidden group-hover:flex items-center ${isCurrent ? 'flex' : ''}`}>
              <IconPlayerPlayFilled size={14} className={isCurrent ? accentText : 'text-on-surface-variant'} />
            </span>
          </>
        )}
      </div>

      {/* Thumbnail */}
      <div className="w-10 h-10 rounded-xl overflow-hidden border border-outline/10 shrink-0 relative">
        <img src={track.cover || track.image} alt="" className="w-full h-full object-cover" loading="lazy" />
        {isCurrent && (
          <div className="absolute inset-0 bg-black/25 flex items-center justify-center">
            {isTrackPlaying
              ? <IconPlayerPauseFilled size={12} className="text-white" />
              : <IconPlayerPlayFilled size={12} className="text-white" />}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold truncate ${isCurrent ? accentText : 'text-on-surface'}`}>
          {track.title}
        </p>
        <p className="text-[11px] text-on-surface-variant truncate mt-0.5">
          {track.subject && (
            <span className={`font-semibold ${accentText}`}>{track.subject} · </span>
          )}
          {track.chapter}
        </p>
      </div>

      {/* PRO badge */}
      {track.premium && (
        <span className="shrink-0 bg-primary/10 text-primary border border-primary/20 font-mono text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-wide">
          PRO
        </span>
      )}

      {/* Favorite */}
      <button
        onClick={(e) => { e.stopPropagation(); onFavorite && onFavorite(); }}
        aria-label={isFavorited ? 'Remove from favourites' : 'Add to favourites'}
        className={`shrink-0 p-1.5 rounded-lg transition-colors cursor-pointer ${
          isFavorited ? 'text-red-500' : 'text-on-surface-variant/40 hover:text-on-surface-variant'
        }`}
      >
        <IconHeart size={15} fill={isFavorited ? 'currentColor' : 'none'} />
      </button>

      {/* Duration */}
      <span className="shrink-0 text-xs text-on-surface-variant font-mono w-10 text-right">
        {track.duration}
      </span>
    </div>
  );
}

export default function LibraryPage({
  tracks = [],
  lmsCourses = [],
  currentTrack,
  isPlaying,
  onTrackSelect,
  onCourseSelect,
  favoritedTrackIds = [],
  onToggleFavorite,
  onUpgradeClick,
}) {
  const [selectedGrade, setSelectedGrade] = useState(null); // null = All
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [catalogSearch, setCatalogSearch] = useState('');
  const [subjectSearch, setSubjectSearch] = useState('');

  // Catalog dropdown filter state
  const [selectedCatalogSubject, setSelectedCatalogSubject] = useState('All');
  const [selectedCatalogChapter, setSelectedCatalogChapter] = useState('All');
  const [openCatalogDropdown, setOpenCatalogDropdown] = useState(null);
  const catalogDropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (catalogDropdownRef.current && !catalogDropdownRef.current.contains(e.target)) {
        setOpenCatalogDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const catalogChaptersList = React.useMemo(() => {
    const chapters = new Set();
    tracks.forEach(track => {
      if (!track.chapter) return;
      const classMatch = !selectedGrade || track.grade === selectedGrade || track.class === selectedGrade;
      const subjectMatch = selectedCatalogSubject === 'All' || track.subject?.toLowerCase() === selectedCatalogSubject.toLowerCase();
      if (classMatch && subjectMatch) chapters.add(track.chapter);
    });
    return ['All', ...Array.from(chapters)];
  }, [tracks, selectedGrade, selectedCatalogSubject]);

  /* ── filtered library tracks (for the track listing below courses) ── */
  const filteredLibraryTracks = React.useMemo(() => {
    return tracks.filter(track => {
      const classMatch = !selectedGrade || track.grade === selectedGrade || track.class === selectedGrade;
      const subjectMatch = selectedCatalogSubject === 'All' || track.subject?.toLowerCase() === selectedCatalogSubject.toLowerCase();
      const chapterMatch = selectedCatalogChapter === 'All' || track.chapter === selectedCatalogChapter;
      const searchMatch = !catalogSearch.trim() || 
        track.title.toLowerCase().includes(catalogSearch.trim().toLowerCase()) ||
        (track.chapter && track.chapter.toLowerCase().includes(catalogSearch.trim().toLowerCase())) ||
        (track.subject && track.subject.toLowerCase().includes(catalogSearch.trim().toLowerCase()));
      return classMatch && subjectMatch && chapterMatch && searchMatch;
    });
  }, [tracks, selectedGrade, selectedCatalogSubject, selectedCatalogChapter, catalogSearch]);

  /* ── catalog search results ── */
  const catalogResults = catalogSearch.trim()
    ? tracks.filter((t) => {
        const gradeMatch = !selectedGrade || t.grade === selectedGrade || t.classLevel === selectedGrade;
        const subjectMatch = selectedCatalogSubject === 'All' || t.subject?.toLowerCase() === selectedCatalogSubject.toLowerCase();
        const chapterMatch = selectedCatalogChapter === 'All' || t.chapter === selectedCatalogChapter;
        const q = catalogSearch.trim().toLowerCase();
        const textMatch =
          t.title.toLowerCase().includes(q) ||
          (t.chapter && t.chapter.toLowerCase().includes(q)) ||
          (t.subject && t.subject.toLowerCase().includes(q));
        return gradeMatch && subjectMatch && chapterMatch && textMatch;
      })
    : [];

  /* ── subject detail tracks ── */
  const subjectTracks = tracks.filter((t) => {
    const gradeMatch = !selectedGrade || t.grade === selectedGrade || t.classLevel === selectedGrade;
    const subjectMatch = t.subject === selectedSubject;
    const q = subjectSearch.trim().toLowerCase();
    const searchMatch = !q || t.title.toLowerCase().includes(q) || (t.chapter && t.chapter.toLowerCase().includes(q));
    return gradeMatch && subjectMatch && searchMatch;
  });

  const subjectConfig = SUBJECTS.find((s) => s.id === selectedSubject);

  /* ════════════════════════════════════════
     CATALOG VIEW
  ════════════════════════════════════════ */
  if (selectedSubject === null) {
    return (
      <div className="w-full min-h-screen bg-transparent text-on-surface pt-32 pb-36 select-none transition-colors duration-300">
        <style dangerouslySetInnerHTML={{ __html: EQ_STYLES }} />

        <div className="max-w-6xl mx-auto px-4 md:px-8 flex flex-col gap-10">

          {/* ── Page header ── */}
          <header className="flex flex-col gap-5">

            {/* Title row + Now Playing */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary font-bold mb-2">
                  Audio Syllabus
                </p>
                <h1 className="text-4xl md:text-5xl font-extrabold text-on-surface leading-none tracking-tight">
                  Your Courses
                </h1>
                <p className="text-sm text-on-surface-variant mt-2 max-w-sm">
                  NEET syllabus as immersive audio — designed for active recall.
                </p>
              </div>


            </div>

            {/* Class filter pills */}
            <nav aria-label="Filter by class" className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
              {CLASSES.map((cls) => {
                const active = cls === 'All' ? selectedGrade === null : selectedGrade === cls;
                return (
                  <button
                    key={cls}
                    onClick={() => { setSelectedGrade(cls === 'All' ? null : cls); setSelectedCatalogSubject('All'); setSelectedCatalogChapter('All'); }}
                    className={`shrink-0 px-5 py-2 rounded-full font-mono text-xs font-semibold border transition-all duration-200 ${
                      active
                        ? 'bg-primary text-on-primary border-primary shadow-sm'
                        : 'bg-surface-container text-on-surface-variant border-outline/10 hover:border-primary/30 hover:text-on-surface'
                    }`}
                  >
                    {cls === 'Dropper' ? (
                      <span className="flex items-center gap-1.5"><IconRefresh size={12} /> Dropper</span>
                    ) : cls}
                  </button>
                );
              })}
            </nav>

            {/* Subject & Chapter dropdown filters */}
            <div ref={catalogDropdownRef} className="flex flex-wrap gap-3 relative z-30">
              {/* Subject Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setOpenCatalogDropdown(openCatalogDropdown === 'subject' ? null : 'subject')}
                  aria-haspopup="listbox"
                  aria-expanded={openCatalogDropdown === 'subject'}
                  aria-label="Select Subject"
                  className={`px-5 py-2.5 rounded-full border font-mono text-xs font-semibold flex items-center gap-2 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 cursor-pointer ${selectedCatalogSubject !== 'All' ? 'border-primary/50 text-primary bg-primary/10' : 'border-outline/10 text-on-surface-variant bg-surface-container hover:border-primary/30 hover:text-on-surface'}`}
                >
                  {selectedCatalogSubject === 'All' ? 'All Subjects' : selectedCatalogSubject}
                  <IconChevronDown size={14} className={`transition-transform duration-200 ${openCatalogDropdown === 'subject' ? 'rotate-180' : ''}`} />
                </button>
                {openCatalogDropdown === 'subject' && (
                  <ul
                    role="listbox"
                    className="absolute top-full left-0 mt-2 w-48 bg-surface-container border border-outline/10 rounded-2xl shadow-2xl z-40 py-2 outline-none animate-in fade-in slide-in-from-top-1 duration-150"
                  >
                    {['All', 'Biology', 'Physics', 'Chemistry'].map((sub) => (
                      <li
                        key={sub}
                        role="option"
                        aria-selected={selectedCatalogSubject === sub}
                        tabIndex={0}
                        onClick={() => { setSelectedCatalogSubject(sub); setSelectedCatalogChapter('All'); setOpenCatalogDropdown(null); }}
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { setSelectedCatalogSubject(sub); setSelectedCatalogChapter('All'); setOpenCatalogDropdown(null); } }}
                        className={`px-4 py-2 text-sm text-on-surface-variant hover:text-on-surface hover:bg-primary/10 cursor-pointer transition-colors outline-none focus-visible:bg-primary/10 ${selectedCatalogSubject === sub ? 'text-primary font-bold bg-primary/5' : ''}`}
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
                  onClick={() => setOpenCatalogDropdown(openCatalogDropdown === 'chapter' ? null : 'chapter')}
                  aria-haspopup="listbox"
                  aria-expanded={openCatalogDropdown === 'chapter'}
                  aria-label="Select Chapter"
                  className={`px-5 py-2.5 rounded-full border font-mono text-xs font-semibold flex items-center gap-2 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 cursor-pointer ${selectedCatalogChapter !== 'All' ? 'border-primary/50 text-primary bg-primary/10' : 'border-outline/10 text-on-surface-variant bg-surface-container hover:border-primary/30 hover:text-on-surface'}`}
                >
                  {selectedCatalogChapter === 'All' ? 'All Chapters' : selectedCatalogChapter}
                  <IconChevronDown size={14} className={`transition-transform duration-200 ${openCatalogDropdown === 'chapter' ? 'rotate-180' : ''}`} />
                </button>
                {openCatalogDropdown === 'chapter' && (
                  <ul
                    role="listbox"
                    className="absolute top-full right-0 mt-2 w-64 bg-surface-container border border-outline/10 rounded-2xl shadow-2xl z-40 py-2 outline-none max-h-60 overflow-y-auto animate-in fade-in slide-in-from-top-1 duration-150"
                  >
                    {catalogChaptersList.map((chap) => (
                      <li
                        key={chap}
                        role="option"
                        aria-selected={selectedCatalogChapter === chap}
                        tabIndex={0}
                        onClick={() => { setSelectedCatalogChapter(chap); setOpenCatalogDropdown(null); }}
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { setSelectedCatalogChapter(chap); setOpenCatalogDropdown(null); } }}
                        className={`px-4 py-2 text-sm text-on-surface-variant hover:text-on-surface hover:bg-primary/10 cursor-pointer transition-colors outline-none focus-visible:bg-primary/10 truncate ${selectedCatalogChapter === chap ? 'text-primary font-bold bg-primary/5' : ''}`}
                      >
                        {chap}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {/* Catalog search bar */}
            <div className="relative">
              <IconSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/50" size={16} />
              <input
                type="text"
                placeholder="Search all chapters across subjects..."
                aria-label="Search all chapters"
                value={catalogSearch}
                onChange={(e) => setCatalogSearch(e.target.value)}
                className="w-full bg-surface-container border border-outline/10 rounded-2xl py-3 pl-11 pr-10 text-sm text-on-surface placeholder-on-surface-variant/40 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all"
              />
              {catalogSearch && (
                <button
                  onClick={() => setCatalogSearch('')}
                  aria-label="Clear search"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface font-bold text-lg cursor-pointer transition-colors"
                >
                  ×
                </button>
              )}
            </div>
          </header>

          {/* ── Divider ── */}
          <div className="h-px bg-outline/10" />

          {/* ── Body: search results OR subject cards ── */}
          {catalogSearch.trim() ? (
            /* Search results */
            <section className="flex flex-col gap-4">
              <p className="font-mono text-[10px] text-on-surface-variant uppercase tracking-widest">
                {catalogResults.length} result{catalogResults.length !== 1 ? 's' : ''} for &ldquo;{catalogSearch}&rdquo;
              </p>

              {catalogResults.length > 0 ? (
                <div className="flex flex-col gap-1">
                  {catalogResults.map((track, idx) => {
                    const subCfg = SUBJECTS.find((s) => s.id === track.subject);
                    return (
                      <TrackRow
                        key={track.id}
                        track={track}
                        idx={idx}
                        isCurrent={currentTrack?.id === track.id}
                        isTrackPlaying={currentTrack?.id === track.id && isPlaying}
                        isFavorited={favoritedTrackIds.includes(track.id)}
                        accentText={subCfg?.accentText || 'text-primary'}
                        onPlay={() => { setSelectedSubject(track.subject); onTrackSelect(track); }}
                        onFavorite={() => onToggleFavorite && onToggleFavorite(track.id)}
                      />
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-surface-container border border-outline/10 flex items-center justify-center mb-4">
                    <IconSearch size={24} className="text-on-surface-variant/40" />
                  </div>
                  <p className="text-sm text-on-surface-variant font-semibold">No chapters found</p>
                  <p className="text-xs text-on-surface-variant/60 mt-1">{selectedGrade} · &ldquo;{catalogSearch}&rdquo;</p>
                </div>
              )}
            </section>
          ) : (
            /* Course cards from LMS */
            <section className="flex flex-col gap-5">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-bold text-on-surface-variant uppercase tracking-widest font-mono">
                  Available Courses
                </h2>
                <span className="text-xs font-mono text-on-surface-variant">
                  {lmsCourses.filter(c => !selectedGrade || c.class === selectedGrade).length} courses
                </span>
              </div>

              {lmsCourses.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-outline/20 rounded-2xl">
                  <div className="w-16 h-16 rounded-2xl bg-surface-container border border-outline/10 flex items-center justify-center mb-4">
                    <IconBook2 size={28} className="text-on-surface-variant/40" />
                  </div>
                  <p className="text-sm font-semibold text-on-surface-variant">No courses yet</p>
                  <p className="text-xs text-on-surface-variant/60 mt-1">Courses added in the admin panel will appear here.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {lmsCourses
                    .filter(c => !selectedGrade || c.class === selectedGrade)
                    .map((course) => {
                      const color = course.coverColor || '#ecc246';
                      const lessonCount = course.lessons?.length || 0;
                      const totalItemsCount = course.lessons?.reduce((acc, l) => acc + (l.items?.length || 0), 0) || 0;
                      const SubjectIcon = getSubjectIcon(course.subject);
                      return (
                        <div
                          key={course._id}
                          role="button"
                          tabIndex={0}
                          onClick={() => onCourseSelect && onCourseSelect(course)}
                          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onCourseSelect && onCourseSelect(course); }}
                          className="group relative p-1.5 rounded-[2rem] bg-surface-container-lowest/40 border border-outline/5 hover:border-outline/20 transition-all duration-500 cursor-pointer hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-1 active:scale-[0.98] flex flex-col"
                        >
                          <div
                            className="flex flex-col flex-1 p-6 rounded-[calc(2rem-0.375rem)] border border-outline/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.03)] group-hover:border-primary/20 transition-all duration-500 overflow-hidden relative z-10"
                            style={{
                              background: 'linear-gradient(180deg, rgb(var(--color-surface-container-low) / 0.4) 0%, rgb(var(--color-surface-container-lowest) / 0.8) 100%)'
                            }}
                          >
                            {/* Thumbnail */}
                            {course.thumbnail && (
                              <div className="h-32 -mx-6 -mt-6 mb-5 overflow-hidden relative border-b border-outline/5 shrink-0">
                                <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                                <div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest via-transparent to-transparent" />
                              </div>
                            )}

                            {/* Icon + badge row */}
                            <div className="flex items-center justify-between mb-4">
                              <div
                                className="w-10 h-10 rounded-xl flex items-center justify-center bg-surface-variant/40 border border-outline/10 text-on-surface-variant group-hover:text-primary group-hover:border-primary/30 group-hover:bg-primary/5 transition-all duration-500"
                              >
                                <SubjectIcon size={20} stroke={1.5} />
                              </div>
                              <div className="flex items-center gap-1.5">
                                {course.isPremium && (
                                  <span className="flex items-center gap-0.5 text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                    <IconCrown size={10} className="fill-current" /> Premium
                                  </span>
                                )}
                                {course.isPublished ? (
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Live</span>
                                ) : (
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-surface-variant/60 text-on-surface-variant border border-outline/20">Draft</span>
                                )}
                              </div>
                            </div>

                            {/* Meta */}
                            <p
                              className="text-[10.5px] font-semibold uppercase tracking-[0.18em] mb-1.5 transition-colors duration-300"
                              style={{ color: `${color}cc` }}
                            >
                              {course.subject}
                            </p>
                            <h3 className="text-base font-bold text-on-surface leading-snug mb-1 group-hover:text-primary transition-colors duration-300 line-clamp-2">
                              {course.title}
                            </h3>
                            <p className="text-xs text-on-surface-variant/80 mb-4">{course.class}</p>

                            {course.summary && (
                              <p className="text-xs text-on-surface-variant/60 leading-relaxed line-clamp-2 mb-4">{course.summary}</p>
                            )}

                            {/* Footer */}
                            <div className="mt-auto pt-4 border-t border-outline/5 flex items-center justify-between">
                              <div className="flex items-center gap-2 text-xs text-on-surface-variant/80 font-medium">
                                <IconBook2 size={14} stroke={1.5} className="text-on-surface-variant/60" />
                                <span>{lessonCount} lesson{lessonCount !== 1 ? 's' : ''}</span>
                                <span className="text-outline/30">•</span>
                                <span>{totalItemsCount} item{totalItemsCount !== 1 ? 's' : ''}</span>
                              </div>
                              <div
                                className="flex items-center gap-1 text-xs font-bold translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300"
                                style={{ color }}
                              >
                                <span>Open</span>
                                <IconArrowRight size={14} stroke={2} className="transition-transform duration-300 group-hover:translate-x-0.5" />
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </section>
          )}

          {/* ── Study Tracks listing (filtered by Subject & Chapter) ── */}
          {!catalogSearch.trim() && (
            <section className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-bold text-on-surface-variant uppercase tracking-widest font-mono">
                  Study Tracks
                </h2>
                <span className="text-xs font-mono text-on-surface-variant">
                  {filteredLibraryTracks.length} track{filteredLibraryTracks.length !== 1 ? 's' : ''}
                </span>
              </div>

              {filteredLibraryTracks.length > 0 ? (
                <div className="flex flex-col gap-1">
                  {filteredLibraryTracks.map((track, idx) => {
                    const subCfg = SUBJECTS.find((s) => s.id === track.subject);
                    return (
                      <TrackRow
                        key={track.id}
                        track={track}
                        idx={idx}
                        isCurrent={currentTrack?.id === track.id}
                        isTrackPlaying={currentTrack?.id === track.id && isPlaying}
                        isFavorited={favoritedTrackIds.includes(track.id)}
                        accentText={subCfg?.accentText || 'text-primary'}
                        onPlay={() => onTrackSelect(track)}
                        onFavorite={() => onToggleFavorite && onToggleFavorite(track.id)}
                      />
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-surface-container border border-outline/10 flex items-center justify-center mb-4">
                    <IconSearch size={24} className="text-on-surface-variant/40" />
                  </div>
                  <p className="text-sm text-on-surface-variant font-semibold">No tracks found</p>
                  <p className="text-xs text-on-surface-variant/60 mt-1">
                    {selectedGrade || 'All Classes'} · {selectedCatalogSubject} · {selectedCatalogChapter}
                  </p>
                </div>
              )}
            </section>
          )}

        </div>
      </div>
    );
  }

  /* ════════════════════════════════════════
     DETAIL VIEW (subject selected)
  ════════════════════════════════════════ */
  return (
    <div className="w-full min-h-screen bg-transparent text-on-surface pb-36 select-none transition-colors duration-300">
      <style dangerouslySetInnerHTML={{ __html: EQ_STYLES }} />

      {/* ── Sticky topbar ── */}
      <div className="sticky top-0 z-30 bg-surface/90 backdrop-blur-xl border-b border-outline/10 pt-20 transition-colors duration-300">
        <div className="max-w-6xl mx-auto px-4 md:px-8">

          <div className="flex flex-wrap items-center gap-3 py-4">
            <button
              onClick={() => { setSelectedSubject(null); setSubjectSearch(''); }}
              className="flex items-center gap-2 text-on-surface-variant hover:text-on-surface transition-colors text-sm font-semibold"
            >
              <IconArrowLeft size={16} />
              <span className="hidden sm:inline">Courses</span>
            </button>

            <div className="h-4 w-px bg-outline/20" />

            <div className="flex items-center gap-2">
              {subjectConfig && (
                <span className={`w-2 h-2 rounded-full shrink-0 ${subjectConfig.accentText.replace('text-', 'bg-').split(' ')[0]}`} />
              )}
              <span className="text-sm font-bold text-on-surface">{selectedSubject}</span>
              <span className="font-mono text-xs text-on-surface-variant">· {selectedGrade}</span>
            </div>

            <div className="ml-auto flex gap-2 overflow-x-auto no-scrollbar">
              {CLASSES.map((cls) => {
                const active = selectedGrade === cls;
                return (
                  <button
                    key={cls}
                    onClick={() => setSelectedGrade(cls)}
                    className={`shrink-0 px-3 py-1 rounded-full font-mono text-[10px] font-semibold border transition-all duration-200 ${
                      active
                        ? 'bg-primary text-on-primary border-primary'
                        : 'bg-surface-container text-on-surface-variant border-outline/10 hover:border-primary/30 hover:text-on-surface'
                    }`}
                  >
                    {cls}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Subject search bar */}
          <div className="relative pb-4">
            <IconSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/50" size={15} />
            <input
              type="text"
              placeholder={`Search ${selectedSubject} chapters...`}
              aria-label="Search study chapters"
              value={subjectSearch}
              onChange={(e) => setSubjectSearch(e.target.value)}
              className="w-full bg-surface-container border border-outline/10 rounded-xl py-2.5 pl-10 pr-10 text-sm text-on-surface placeholder-on-surface-variant/40 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all"
            />
            {subjectSearch && (
              <button
                onClick={() => setSubjectSearch('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface font-bold text-base cursor-pointer"
              >
                ×
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Track list ── */}
      <div className="max-w-6xl mx-auto px-4 md:px-8 pt-6">
        <p className="font-mono text-[10px] text-on-surface-variant uppercase tracking-widest mb-4">
          {subjectTracks.length} {subjectTracks.length === 1 ? 'chapter' : 'chapters'}
        </p>

        <div className="flex flex-col gap-1">
          {subjectTracks.map((track, idx) => (
            <TrackRow
              key={track.id}
              track={{ ...track, subject: null }}
              idx={idx}
              isCurrent={currentTrack?.id === track.id}
              isTrackPlaying={currentTrack?.id === track.id && isPlaying}
              isFavorited={favoritedTrackIds.includes(track.id)}
              accentText={subjectConfig?.accentText || 'text-primary'}
              onPlay={() => onTrackSelect(track)}
              onFavorite={() => onToggleFavorite && onToggleFavorite(track.id)}
            />
          ))}
        </div>

        {subjectTracks.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-surface-container border border-outline/10 flex items-center justify-center mb-4">
              <IconBook2 size={28} className="text-on-surface-variant/40" />
            </div>
            <p className="text-sm text-on-surface-variant font-semibold">No chapters found</p>
            <p className="text-xs text-on-surface-variant/60 mt-1">
              {selectedGrade} · {selectedSubject}
              {subjectSearch && ` · "${subjectSearch}"`}
            </p>
            {subjectSearch && (
              <button
                onClick={() => setSubjectSearch('')}
                className="mt-4 text-xs font-bold text-primary hover:opacity-70 transition-opacity cursor-pointer"
              >
                Clear search
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
