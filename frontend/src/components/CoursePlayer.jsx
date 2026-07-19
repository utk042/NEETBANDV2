import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  IconChevronRight,
  IconList,
  IconX,
  IconArrowLeft,
  IconArrowRight,
  IconCrown,
  IconPlayerPlayFilled,
  IconCheck,
  IconLoader2,
  IconBook2
} from '@tabler/icons-react';
import { getLessonContent, getLessonQuiz, getLessonQa, getCourseById, getCourseProgress, markItemComplete } from '../services/api';
import DocumentViewer from './Common/DocumentViewer';

import { TYPE_META, getSlugType, getChapterItems, isItemLocked, getSubjectIcon, DynamicIcon, calculateTotalItems } from './CoursePlayer/CoursePlayerUtils';
import CourseLessonSidebar from './CoursePlayer/CourseLessonSidebar';
import QuizViewer from './CoursePlayer/QuizViewer';
import FlashcardViewer from './CoursePlayer/FlashcardViewer';
import MathMarkdownContent from './CoursePlayer/MathMarkdownContent';
import AudioAdPlayer from './CoursePlayer/AudioAdPlayer';

export default function CoursePlayer({ currentTrack, user, onUpgradeClick }) {
  const navigate = useNavigate();
  const { courseId, itemType, subjectIdx: subjectIdxParam, chapterIdx: chapterIdxParam, itemIdx: itemIdxParam } = useParams();

  const [course, setCourse] = useState(null);
  const [courseLoading, setCourseLoading] = useState(true);
  const [completedItems, setCompletedItems] = useState([]);

  useEffect(() => {
    if (!courseId) return;
    setCourseLoading(true);
    getCourseById(courseId)
      .then(data => {
        setCourse(data);
        if (user) {
          getCourseProgress(courseId).then(progress => {
            setCompletedItems(progress.completedItems || []);
          }).catch(err => console.error("Failed to load progress:", err));
        }
      })
      .catch(err => console.error("Failed to fetch course:", err))
      .finally(() => setCourseLoading(false));
  }, [courseId, user]);

  const selectedSubjectIdx = subjectIdxParam !== undefined ? parseInt(subjectIdxParam, 10) - 1 : null;
  const selectedChapterIdx = chapterIdxParam !== undefined ? parseInt(chapterIdxParam, 10) - 1 : null;
  const selectedItemIdx = itemIdxParam !== undefined ? parseInt(itemIdxParam, 10) - 1 : null;

  // Overview folder drill-down state
  const [folderLevel, setFolderLevel] = useState('subjects'); 
  const [folderSubjectIdx, setFolderSubjectIdx] = useState(null);
  const [folderChapterIdx, setFolderChapterIdx] = useState(null);

  useEffect(() => {
    if (user && course && selectedSubjectIdx !== null && selectedChapterIdx !== null && selectedItemIdx !== null) {
      const subject = course.subjects?.[selectedSubjectIdx];
      const chapter = subject?.chapters?.[selectedChapterIdx];
      const items = getChapterItems(chapter);
      const item = items[selectedItemIdx];
      if (item && item._id && !completedItems.includes(item._id)) {
        markItemComplete(courseId, item._id).then(() => {
          setCompletedItems(prev => [...prev, item._id]);
        }).catch(console.error);
      }
    }
  }, [user, course, selectedSubjectIdx, selectedChapterIdx, selectedItemIdx, completedItems, courseId]);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [headerHeight, setHeaderHeight] = useState(0);

  useEffect(() => {
    let currentHeader = document.querySelector('header[data-gsap="header"]');
    const update = () => {
      const h = document.querySelector('header[data-gsap="header"]');
      setHeaderHeight(h ? h.offsetHeight : 0);
    };
    
    setTimeout(update, 50);
    update();

    const ro = new ResizeObserver(update);
    if (currentHeader) ro.observe(currentHeader);
    
    const mo = new MutationObserver(() => {
      const h = document.querySelector('header[data-gsap="header"]');
      if (h !== currentHeader) {
        if (currentHeader) ro.unobserve(currentHeader);
        currentHeader = h;
        if (currentHeader) ro.observe(currentHeader);
        update();
      }
    });
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      ro.disconnect();
      mo.disconnect();
    };
  }, [selectedItemIdx]);

  const [detailsLoading, setDetailsLoading] = useState(false);
  const [activeDetails, setActiveDetails] = useState(null);

  const activeSubject = course?.subjects?.[selectedSubjectIdx];
  const activeChapter = activeSubject?.chapters?.[selectedChapterIdx];
  const activeItem = getChapterItems(activeChapter)[selectedItemIdx];

  useEffect(() => {
    if (selectedSubjectIdx === null || selectedChapterIdx === null || selectedItemIdx === null) {
      setActiveDetails(null);
      return;
    }
    if (isItemLocked(user, course, selectedSubjectIdx, selectedChapterIdx, selectedItemIdx)) {
      setActiveDetails(null);
      return;
    }
    if (!activeItem || !activeItem._id) {
      setActiveDetails(null);
      return;
    }

    const loadDetails = async () => {
      setDetailsLoading(true);
      try {
        let resData = null;
        if (activeItem.type === 'notes') {
          const res = await getLessonContent(activeItem._id);
          resData = { content: res.content };
        } else if (activeItem.type === 'quiz') {
          const res = await getLessonQuiz(activeItem._id);
          resData = { questions: res.questions };
        } else if (activeItem.type === 'qa') {
          const res = await getLessonQa(activeItem._id);
          resData = { qas: res.qas };
        }
        setActiveDetails(resData);
      } catch (err) {
        console.error("Failed to load item details:", err);
        setActiveDetails(null);
      } finally {
        setDetailsLoading(false);
      }
    };

    loadDetails();
  }, [selectedSubjectIdx, selectedChapterIdx, selectedItemIdx, activeItem?._id, activeItem?.type, user, course]);

  // Auto-render LaTeX math in main content area whenever content updates
  useEffect(() => {
    const mainEl = document.querySelector('main[data-gsap="player-main"]');
    if (mainEl && window.renderMathInElement) {
      const timer = setTimeout(() => {
        try {
          window.renderMathInElement(mainEl, {
            delimiters: [
              { left: '$$', right: '$$', display: true },
              { left: '$', right: '$', display: false },
              { left: '\\(', right: '\\)', display: false },
              { left: '\\[', right: '\\]', display: true },
            ],
            throwOnError: false,
          });
        } catch (err) {
          console.error("KaTeX rendering failed:", err);
        }
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [activeDetails, selectedSubjectIdx, selectedChapterIdx, selectedItemIdx]);

  const handleBack = () => navigate('/course');
  const bottomClass = currentTrack ? 'bottom-[152px] md:bottom-24' : 'bottom-20 md:bottom-24';
  const coverColor = course?.coverColor || '#ecc246';
  const SubjectIcon = getSubjectIcon(course?.subject);
  const totalItemsCount = calculateTotalItems(course);

  const getPreviousItem = () => {
    if (selectedSubjectIdx === null || selectedChapterIdx === null || selectedItemIdx === null || !course?.subjects) return null;
    if (selectedItemIdx > 0) return { sIdx: selectedSubjectIdx, cIdx: selectedChapterIdx, iIdx: selectedItemIdx - 1 };
    
    let cIdx = selectedChapterIdx - 1;
    const subject = course.subjects[selectedSubjectIdx];
    while (cIdx >= 0) {
      const items = getChapterItems(subject?.chapters?.[cIdx]);
      if (items.length > 0) return { sIdx: selectedSubjectIdx, cIdx, iIdx: items.length - 1 };
      cIdx--;
    }
    
    let sIdx = selectedSubjectIdx - 1;
    while (sIdx >= 0) {
      const prevSub = course.subjects[sIdx];
      let prevCIdx = (prevSub?.chapters?.length || 0) - 1;
      while (prevCIdx >= 0) {
        const items = getChapterItems(prevSub.chapters[prevCIdx]);
        if (items.length > 0) return { sIdx, cIdx: prevCIdx, iIdx: items.length - 1 };
        prevCIdx--;
      }
      sIdx--;
    }
    return null;
  };

  const getNextItem = () => {
    if (selectedSubjectIdx === null || selectedChapterIdx === null || selectedItemIdx === null || !course?.subjects) return null;
    const subject = course.subjects[selectedSubjectIdx];
    const chapter = subject?.chapters?.[selectedChapterIdx];
    
    if (selectedItemIdx < getChapterItems(chapter).length - 1) {
      return { sIdx: selectedSubjectIdx, cIdx: selectedChapterIdx, iIdx: selectedItemIdx + 1 };
    }
    
    let cIdx = selectedChapterIdx + 1;
    while (cIdx < (subject?.chapters?.length || 0)) {
      if (getChapterItems(subject.chapters[cIdx]).length > 0) return { sIdx: selectedSubjectIdx, cIdx, iIdx: 0 };
      cIdx++;
    }
    
    let sIdx = selectedSubjectIdx + 1;
    while (sIdx < (course.subjects?.length || 0)) {
      const nextSub = course.subjects[sIdx];
      let nextCIdx = 0;
      while (nextCIdx < (nextSub?.chapters?.length || 0)) {
         if (getChapterItems(nextSub.chapters[nextCIdx]).length > 0) return { sIdx, cIdx: nextCIdx, iIdx: 0 };
         nextCIdx++;
      }
      sIdx++;
    }
    return null;
  };

  const prevItem = getPreviousItem();
  const nextItem = getNextItem();

  if (courseLoading || !course) {
    return (
      <div className="min-h-[60vh] w-full flex items-center justify-center bg-surface">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-primary/20 border-t-primary"></div>
      </div>
    );
  }

  // ── OVERVIEW ──────────────────────────────────────────────
  if (selectedSubjectIdx === null || selectedChapterIdx === null || selectedItemIdx === null) {
    return (
      <div
        className={`fixed left-0 right-0 flex flex-col bg-surface text-on-surface overflow-hidden z-player-mobile ${bottomClass}`}
        style={{ top: headerHeight }}
      >
        <div className="flex flex-1 overflow-hidden">
          <aside className="hidden lg:flex flex-col w-72 xl:w-80 border-r border-outline/10 bg-surface-container-low shrink-0 overflow-y-auto pb-28">
            <div className="p-5">
              <button
                onClick={handleBack}
                className="flex items-center gap-2 text-sm font-semibold text-on-surface-variant hover:text-on-surface transition-colors mb-5"
              >
                <IconArrowLeft size={16} /> Back to Courses
              </button>

              <div className="w-full p-1 rounded-2xl bg-surface-container-lowest/40 border border-outline/5 mb-4">
                <div
                  className="flex items-center gap-3.5 p-4 rounded-[calc(1rem-0.125rem)] border border-outline/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.03)]"
                  style={{
                    background: 'linear-gradient(180deg, rgb(var(--color-surface-container-low) / 0.4) 0%, rgb(var(--color-surface-container-lowest) / 0.8) 100%)'
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center bg-surface-variant/40 border border-outline/10 text-on-surface-variant transition-all duration-300"
                  >
                    <SubjectIcon size={20} stroke={1.5} style={{ color: coverColor }} />
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-on-surface text-sm leading-tight truncate">{course?.title || 'Course'}</p>
                    <p className="text-[10px] text-on-surface-variant mt-0.5 font-medium">{course?.class} · {course?.subject}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-surface-container rounded-xl p-3">
                  <p className="text-2xl font-bold text-on-surface">{course?.subjects?.length || 0}</p>
                  <p className="text-[10px] text-on-surface-variant uppercase tracking-wider mt-0.5">Subjects</p>
                </div>
                <div className="bg-surface-container rounded-xl p-3">
                  <p className="text-2xl font-bold text-on-surface">{totalItemsCount}</p>
                  <p className="text-[10px] text-on-surface-variant uppercase tracking-wider mt-0.5">Content Items</p>
                </div>
              </div>

              {course?.summary && (
                <p className="text-xs text-on-surface-variant leading-relaxed">{course.summary}</p>
              )}
            </div>
          </aside>

          <div className="flex-1 overflow-y-auto">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-10 py-5 sm:py-8 pb-32 sm:pb-40">
              <button
                onClick={handleBack}
                className="flex items-center gap-2 text-sm font-semibold text-on-surface-variant hover:text-on-surface transition-colors mb-4 lg:hidden"
              >
                <IconArrowLeft size={16} /> Back to Courses
              </button>

              <div className="mb-5">
                <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: coverColor }}>
                  {course?.subject} · {course?.class}
                </p>
                <div className="flex items-center gap-4 flex-wrap">
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-on-surface leading-tight">
                    {course?.title || 'Course Curriculum'}
                  </h1>
                  {user && totalItemsCount > 0 && (
                    <div className="flex items-center gap-2 mt-1 lg:mt-0">
                      <div className="w-72 h-2.5 bg-surface-container rounded-full overflow-hidden border border-outline/10">
                        <div 
                          className="h-full rounded-full transition-all duration-500 bg-emerald-500"
                          style={{ 
                            width: `${Math.min(100, Math.round((completedItems.length / totalItemsCount) * 100))}%`
                          }}
                        />
                      </div>
                      <span className="text-xs font-bold text-on-surface-variant">
                        {Math.min(100, Math.round((completedItems.length / totalItemsCount) * 100))}%
                      </span>
                    </div>
                  )}
                </div>
                {course?.summary && (
                  <p className="text-sm text-on-surface-variant mt-2 max-w-xl">{course.summary}</p>
                )}
              </div>

              {course?.subjects?.length > 0 && user && (
                <div className="mb-8">
                  {(() => {
                    let cNext = null;
                    let nextSIdx = 0; let nextCIdx = 0; let nextIIdx = 0;
                    for (let sIdx = 0; sIdx < course.subjects.length; sIdx++) {
                      const subject = course.subjects[sIdx];
                      for (let cIdx = 0; cIdx < (subject.chapters || []).length; cIdx++) {
                        const chapter = subject.chapters[cIdx];
                        const items = chapter.items || [];
                        for (let iIdx = 0; iIdx < items.length; iIdx++) {
                          const item = items[iIdx];
                          if (!completedItems.includes(item._id)) {
                            cNext = item; nextSIdx = sIdx; nextCIdx = cIdx; nextIIdx = iIdx;
                            break;
                          }
                        }
                        if (cNext) break;
                      }
                      if (cNext) break;
                    }
                    if (cNext) {
                      return (
                        <button
                          onClick={() => {
                            navigate(`/course/${course._id}/${getSlugType(cNext.type)}/${nextSIdx + 1}/${nextCIdx + 1}/${nextIIdx + 1}`);
                          }}
                          className="group flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm text-white transition-all hover:brightness-110 active:scale-[0.98] shadow-lg"
                          style={{ background: coverColor, boxShadow: `0 4px 20px ${coverColor}44` }}
                        >
                          <IconPlayerPlayFilled size={16} />
                          Continue Course
                          <IconArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                      );
                    }
                    return null;
                  })()}
                </div>
              )}

              {!course?.subjects || course.subjects.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-outline/20 rounded-2xl">
                  <div className="w-16 h-16 rounded-2xl bg-surface-container border border-outline/10 flex items-center justify-center mb-4">
                    <SubjectIcon size={28} className="text-on-surface-variant/40" />
                  </div>
                  <p className="text-sm font-semibold text-on-surface-variant">No lessons yet</p>
                  <p className="text-xs text-on-surface-variant/60 mt-1">The instructor hasn't added any content yet.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {folderLevel !== 'subjects' && (
                    <div className="flex items-center gap-2 mb-6 text-sm font-semibold text-on-surface-variant overflow-x-auto hide-scrollbar">
                      <button 
                        onClick={() => { setFolderLevel('subjects'); setFolderSubjectIdx(null); setFolderChapterIdx(null); }}
                        className="flex items-center gap-1 hover:text-primary transition-colors whitespace-nowrap"
                      >
                        <SubjectIcon size={16} /> Course Contents
                      </button>
                      {folderSubjectIdx !== null && (
                        <>
                          <IconChevronRight size={14} className="opacity-50 shrink-0" />
                          <button 
                            onClick={() => { setFolderLevel('chapters'); setFolderChapterIdx(null); }}
                            className={`flex items-center gap-1 hover:text-primary transition-colors whitespace-nowrap ${folderLevel === 'chapters' ? 'text-on-surface' : ''}`}
                          >
                            {course.subjects[folderSubjectIdx]?.title}
                          </button>
                        </>
                      )}
                      {folderLevel === 'items' && folderChapterIdx !== null && (
                        <>
                          <IconChevronRight size={14} className="opacity-50 shrink-0" />
                          <span className="text-on-surface flex items-center gap-1 whitespace-nowrap">
                            {course.subjects[folderSubjectIdx]?.chapters?.[folderChapterIdx]?.title}
                          </span>
                        </>
                      )}
                    </div>
                  )}

                  {folderLevel === 'subjects' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {(course?.subjects || []).map((subject, sIdx) => (
                        <button
                          key={subject._id || sIdx}
                          onClick={() => { setFolderSubjectIdx(sIdx); setFolderLevel('chapters'); }}
                          className="flex items-center gap-4 p-5 rounded-2xl border border-outline/10 bg-surface-container-lowest hover:bg-surface-container-low hover:border-outline/20 transition-all group text-left h-full"
                        >
                          <div className="w-12 h-12 rounded-xl bg-surface-variant flex items-center justify-center text-on-surface-variant group-hover:text-primary group-hover:bg-primary/10 transition-colors shrink-0">
                            <DynamicIcon name={subject.icon} fallback={IconBook2} size={24} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-on-surface group-hover:text-primary transition-colors truncate text-base">{subject.title}</h3>
                            <p className="text-[11px] text-on-surface-variant mt-1 font-medium">
                              {(subject.chapters || []).length} Chapters
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {folderLevel === 'chapters' && folderSubjectIdx !== null && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in slide-in-from-right-4 duration-300">
                      {(course.subjects[folderSubjectIdx]?.chapters || []).map((chapter, cIdx) => (
                        <button
                          key={chapter._id || cIdx}
                          onClick={() => { setFolderChapterIdx(cIdx); setFolderLevel('items'); }}
                          className="flex items-center gap-4 p-4 rounded-xl border border-outline/10 bg-surface-container-lowest hover:bg-surface-container-low hover:border-outline/20 transition-all group text-left"
                        >
                          <div className="w-10 h-10 rounded-lg bg-surface-variant flex items-center justify-center text-on-surface-variant group-hover:text-primary group-hover:bg-primary/10 transition-colors shrink-0">
                            <DynamicIcon name={chapter.icon} fallback={IconList} size={20} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-on-surface group-hover:text-primary transition-colors truncate text-sm">{chapter.title}</h4>
                            <p className="text-[11px] text-on-surface-variant mt-0.5 font-medium">
                              {getChapterItems(chapter).length} Items
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {folderLevel === 'items' && folderSubjectIdx !== null && folderChapterIdx !== null && (
                    <div className="rounded-2xl border border-outline/15 overflow-hidden bg-surface-container-lowest animate-in fade-in slide-in-from-right-4 duration-300">
                      <div className="divide-y divide-outline/5">
                        {(() => {
                          const chapter = course.subjects[folderSubjectIdx]?.chapters?.[folderChapterIdx];
                          const items = getChapterItems(chapter);
                          if (items.length === 0) {
                            return <div className="p-8 text-center text-sm font-medium text-on-surface-variant/60 italic border border-dashed border-outline/10 m-4 rounded-xl">No items in this chapter.</div>;
                          }
                          return items.map((item, itemIdx) => {
                            const meta = TYPE_META[item.type] || TYPE_META.notes;
                            const LIcon = meta.Icon;
                            const locked = isItemLocked(user, course, folderSubjectIdx, folderChapterIdx, itemIdx);
                            return (
                              <div 
                                key={item._id || itemIdx} 
                                onClick={() => locked ? onUpgradeClick() : navigate(`/course/${course._id}/${getSlugType(item.type)}/${folderSubjectIdx + 1}/${folderChapterIdx + 1}/${itemIdx + 1}`)}
                                className="w-full cursor-pointer group flex items-center justify-between gap-4 p-4 hover:bg-surface-container/30 transition-colors"
                              >
                                <div className="flex items-center gap-3 min-w-0">
                                  <div className={`w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 ${meta.bg}`}>
                                    <LIcon size={15} stroke={2} className={meta.color} />
                                  </div>
                                  <div className="min-w-0">
                                    <p className="font-bold text-on-surface text-xs sm:text-sm leading-tight truncate group-hover:text-primary transition-colors flex items-center gap-1.5">
                                      {item.title}
                                      {locked && <IconCrown size={11} className="text-amber-400/80 shrink-0" />}
                                      {!locked && item._id && completedItems.includes(item._id) && (
                                        <IconCheck size={14} className="text-emerald-500 shrink-0" />
                                      )}
                                    </p>
                                    {item.duration && <p className="text-[10px] text-on-surface-variant mt-0.5 font-medium">{item.duration}</p>}
                                  </div>
                                </div>
                                {locked ? (
                                  <div className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-[#342410] text-amber-400 border border-amber-500/20 flex items-center gap-1 group-hover:brightness-110 transition-all shrink-0">
                                    <IconCrown size={11} className="fill-current" /> Unlock
                                  </div>
                                ) : (
                                  <div className="w-8 h-8 flex items-center justify-center rounded-full group-hover:bg-surface-variant/50 text-on-surface-variant group-hover:text-on-surface transition-all shrink-0">
                                    <IconChevronRight size={18} stroke={2.5} />
                                  </div>
                                )}
                              </div>
                            );
                          });
                        })()}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── LESSON VIEW ─────────────────────────────────────────
  const item = activeItem;
  const meta = TYPE_META[item?.type] || TYPE_META.notes;
  const LIcon = meta.Icon;
  const locked = isItemLocked(user, course, selectedSubjectIdx, selectedChapterIdx, selectedItemIdx);

  return (
    <div
      className={`fixed left-0 right-0 flex flex-col bg-surface text-on-surface overflow-hidden z-player-mobile ${bottomClass}`}
      style={{ top: headerHeight }}
    >
      <div className="h-14 bg-surface-container-high border-b border-outline/10 flex items-center shrink-0 shadow-sm z-40">
        <button
          onClick={() => navigate(`/course/${course._id}`)}
          className="h-full px-4 flex items-center gap-2 hover:bg-surface-container-highest transition-colors border-r border-outline/10"
        >
          <IconArrowLeft size={18} />
          <span className="font-bold hidden sm:inline text-sm">{course?.title?.toUpperCase()}</span>
        </button>

        <div className="flex-1 px-4 min-w-0">
          <p className="text-xs text-on-surface-variant leading-none truncate mb-1">
            {activeSubject?.title} &gt; {activeChapter?.title}
          </p>
          <p className="text-sm font-bold text-on-surface leading-none truncate">
            {activeItem?.title}
          </p>
        </div>

        <div className="flex items-center h-full">
          <button
            onClick={() => {
              if (prevItem) {
                const prevSub = course.subjects[prevItem.sIdx];
                const prevCap = prevSub?.chapters?.[prevItem.cIdx];
                const prevItemObj = prevCap?.items?.[prevItem.iIdx];
                if (prevItemObj) {
                  navigate(`/course/${course._id}/${getSlugType(prevItemObj.type)}/${prevItem.sIdx + 1}/${prevItem.cIdx + 1}/${prevItem.iIdx + 1}`);
                }
              }
            }}
            disabled={!prevItem}
            className="h-full px-4 flex items-center gap-2 hover:bg-surface-container-highest transition-colors font-semibold text-sm disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <IconArrowLeft size={16} /> <span className="hidden sm:inline">Prev</span>
          </button>
          <button
            onClick={() => {
              if (nextItem) {
                const nextSub = course.subjects[nextItem.sIdx];
                const nextCap = nextSub?.chapters?.[nextItem.cIdx];
                const nextItemObj = nextCap?.items?.[nextItem.iIdx];
                if (nextItemObj) {
                  navigate(`/course/${course._id}/${getSlugType(nextItemObj.type)}/${nextItem.sIdx + 1}/${nextItem.cIdx + 1}/${nextItem.iIdx + 1}`);
                }
              }
            }}
            disabled={!nextItem}
            className="h-full px-4 flex items-center gap-2 bg-primary text-on-primary hover:brightness-105 transition-all font-semibold text-sm disabled:opacity-30 disabled:cursor-not-allowed"
            style={{ background: coverColor }}
          >
            <span className="hidden sm:inline">Next</span>
            <IconArrowRight size={16} />
          </button>
          <button
            className="h-full px-4 bg-surface-container-highest hover:bg-surface-variant transition-colors lg:hidden border-l border-outline/10"
            onClick={() => setIsSidebarOpen(s => !s)}
          >
            {isSidebarOpen ? <IconX size={20} /> : <IconList size={20} />}
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden relative">
        {isSidebarOpen && (
          <div 
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/60 z-20 lg:hidden animate-in fade-in duration-200"
            aria-hidden="true"
          />
        )}

        <CourseLessonSidebar 
          course={course}
          user={user}
          completedItems={completedItems}
          totalItemsCount={totalItemsCount}
          selectedSubjectIdx={selectedSubjectIdx}
          selectedChapterIdx={selectedChapterIdx}
          selectedItemIdx={selectedItemIdx}
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
          onUpgradeClick={onUpgradeClick}
        />

        <main data-gsap="player-main" className="flex-1 overflow-y-auto bg-surface p-4 sm:p-6 lg:p-10 pb-32 sm:pb-40">
          <div className="max-w-3xl mx-auto w-full">
            <div className="flex items-center gap-3 mb-5 pb-4 border-b border-outline/10">
              <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl border flex items-center justify-center shrink-0 ${meta.bg}`}>
                <LIcon size={18} stroke={1.5} className={meta.color} />
              </div>
              <div>
                <p className={`text-[10px] font-bold uppercase tracking-widest ${meta.color}`}>{meta.label}</p>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-on-surface leading-tight">{item?.title}</h1>
              </div>

              {(activeItem?.isPremium || course?.isPremium) && (
                <span className="ml-auto flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
                  <IconCrown size={13} stroke={2} /> Premium
                </span>
              )}
            </div>

            {item?.duration && !locked && (
              <p className="text-xs font-mono text-on-surface-variant mb-6">Duration: {item.duration}</p>
            )}

            {item?.type === 'video' && item?.videoUrl && !locked && (
              <div className="aspect-video w-full rounded-2xl overflow-hidden border border-outline/10 mb-6 shadow-lg">
                <iframe
                  src={item.videoUrl.replace('watch?v=', 'embed/')}
                  title={item.title}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            )}

            {locked ? (
              <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-primary/20 rounded-3xl p-6 bg-primary/5">
                <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-4">
                  <IconCrown size={30} className="text-amber-400 fill-current" />
                </div>
                <h3 className="text-lg font-bold text-on-surface">Premium Lesson Item</h3>
                <p className="text-xs text-on-surface-variant max-w-md mt-2 mb-6 leading-relaxed">
                  This study resource is reserved for Premium Scholars. Unlock all 2,000+ courses, audio anthems, notes, and interactive practice tests.
                </p>
                <button
                  onClick={onUpgradeClick}
                  className="px-6 py-2.5 rounded-xl bg-amber-500 text-black font-bold text-xs hover:brightness-105 active:scale-95 transition-all shadow-[0_4px_20px_rgba(201,162,39,0.3)]"
                >
                  Upgrade to Unlock
                </button>
              </div>
            ) : detailsLoading ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <IconLoader2 className="animate-spin text-primary mb-3" size={32} />
                <p className="text-sm text-on-surface-variant">Loading content details...</p>
              </div>
            ) : (
              <>
                {item?.type === 'quiz' && (
                  <QuizViewer activeDetails={activeDetails} onRetryFallback={() => navigate(`/course/${course._id}`)} />
                )}

                {item?.type === 'qa' && (
                  <FlashcardViewer activeDetails={activeDetails} />
                )}

                {(item?.type === 'notes' || item?.type === 'lesson' || item?.type === 'reading') && (
                  <div className="space-y-6">
                    {activeDetails?.content && (
                      <MathMarkdownContent content={activeDetails.content} />
                    )}
                    {item?.fileUrl && (
                      <div className="w-full mt-8">
                        <DocumentViewer 
                          fileUrl={item.fileUrl.startsWith('/') ? `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${item.fileUrl}` : item.fileUrl} 
                          fileType={item.fileType} 
                          title={item.title} 
                        />
                      </div>
                    )}
                  </div>
                )}

                {item?.type === 'song' && (
                  <AudioAdPlayer item={item} user={user} />
                )}

                {(item?.type === 'notes' || item?.type === 'lesson' || item?.type === 'reading') && !activeDetails?.content && !item?.fileUrl && (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div
                      className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                      style={{ background: coverColor + '20', border: `1px solid ${coverColor}30` }}
                    >
                      <LIcon size={28} stroke={1} style={{ color: coverColor }} />
                    </div>
                    <p className="text-sm font-semibold text-on-surface">{item?.title}</p>
                    <p className="text-xs text-on-surface-variant/60 mt-1">Content coming soon — the instructor hasn't added details yet.</p>
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
