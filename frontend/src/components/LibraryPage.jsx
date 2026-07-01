import React, { useState } from 'react';
import {
  IconSearch, IconBook2, IconPlayerPlayFilled,
  IconPlayerPauseFilled, IconHeart, IconArrowRight,
  IconArrowLeft, IconRefresh, IconDna, IconAtom, IconFlask, IconCrown
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
        <img src={track.cover || track.image} alt="" className="w-full h-full object-cover" />
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

  /* ── catalog search results ── */
  const catalogResults = catalogSearch.trim()
    ? tracks.filter((t) => {
        const gradeMatch = !selectedGrade || t.grade === selectedGrade || t.classLevel === selectedGrade;
        const q = catalogSearch.trim().toLowerCase();
        const textMatch =
          t.title.toLowerCase().includes(q) ||
          (t.chapter && t.chapter.toLowerCase().includes(q)) ||
          (t.subject && t.subject.toLowerCase().includes(q));
        return gradeMatch && textMatch;
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
                    onClick={() => setSelectedGrade(cls === 'All' ? null : cls)}
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
                      return (
                        <div
                          key={course._id}
                          role="button"
                          tabIndex={0}
                          onClick={() => onCourseSelect && onCourseSelect(course)}
                          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onCourseSelect && onCourseSelect(course); }}
                          className="group relative overflow-hidden rounded-2xl border border-outline/10 hover:border-primary/30 transition-all duration-300 cursor-pointer shadow-sm hover:shadow-lg hover:-translate-y-1 active:scale-[0.98] flex flex-col"
                          style={{ background: `linear-gradient(135deg, ${color}18 0%, ${color}06 100%)` }}
                        >
                          {/* Thumbnail or Color Accent Bar */}
                           {course.thumbnail ? (
                             <div className="h-32 w-full overflow-hidden relative border-b border-outline/5 shrink-0">
                               <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                               <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent" />
                             </div>
                           ) : (
                             <div className="h-1.5 w-full shrink-0" style={{ background: `linear-gradient(90deg, ${color}, ${color}88)` }} />
                           )}

                           {/* Decorative orb */}
                           <div
                             className="absolute top-0 right-0 w-32 h-32 rounded-full blur-2xl opacity-20 pointer-events-none"
                             style={{ background: color }}
                           />

                           <div className="p-5 flex flex-col flex-1 relative z-10">
                             {/* Icon + badge row */}
                             <div className="flex items-center justify-between mb-4">
                               <div
                                 className="w-10 h-10 rounded-xl flex items-center justify-center"
                                 style={{ background: color + '30' }}
                               >
                                 <IconBook2 size={20} stroke={1.5} style={{ color }} />
                               </div>
                               <div className="flex items-center gap-1.5">
                                 {course.isPremium && (
                                   <span className="flex items-center gap-0.5 text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                     <IconCrown size={10} className="fill-current" /> Premium
                                   </span>
                                 )}
                                 {course.isPublished ? (
                                   <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">Live</span>
                                 ) : (
                                   <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-surface-variant/60 text-on-surface-variant border border-outline/20">Draft</span>
                                 )}
                               </div>
                             </div>

                            {/* Meta */}
                            <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color }}>
                              {course.subject}
                            </p>
                            <h3 className="text-base font-bold text-on-surface leading-tight mb-1 group-hover:text-primary transition-colors line-clamp-2">
                              {course.title}
                            </h3>
                            <p className="text-xs text-on-surface-variant mb-3">{course.class}</p>

                            {course.summary && (
                              <p className="text-xs text-on-surface-variant/70 leading-relaxed line-clamp-2 mb-3">{course.summary}</p>
                            )}

                            {/* Footer */}
                            <div className="mt-auto pt-3 border-t border-outline/10 flex items-center justify-between">
                              <span className="text-xs text-on-surface-variant flex items-center gap-1.5">
                                <IconBook2 size={12} /> {lessonCount} lesson{lessonCount !== 1 ? 's' : ''} · {totalItemsCount} item{totalItemsCount !== 1 ? 's' : ''}
                              </span>
                              <div
                                className="flex items-center gap-1 text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity"
                                style={{ color }}
                              >
                                Open <IconArrowRight size={13} />
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
