import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import {
  IconChevronDown,
  IconChevronUp,
  IconArrowLeft,
  IconArrowRight,
  IconList,
  IconX,
  IconBook2,
  IconMusic,
  IconHelp,
  IconVideo,
  IconFileText,
  IconCrown,
  IconPlayerPlayFilled,
  IconMessageQuestion,
  IconCheck,
  IconAlertCircle,
  IconLoader2,
  IconBookmark,
  IconSend,
  IconDna,
  IconAtom,
  IconFlask,
} from '@tabler/icons-react';
import { getLessonContent, getLessonQuiz, getLessonQa, getCourseById } from '../services/api';
import DocumentViewer from './Common/DocumentViewer';

const TYPE_META = {
  notes: { label: 'Notes',   Icon: IconFileText,        color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
  song:  { label: 'Song',    Icon: IconMusic,           color: 'text-purple-400',  bg: 'bg-purple-500/10 border-purple-500/20' },
  quiz:  { label: 'Quiz',    Icon: IconHelp,            color: 'text-amber-400',   bg: 'bg-amber-500/10 border-amber-500/20' },
  video: { label: 'Video',   Icon: IconVideo,           color: 'text-rose-400',    bg: 'bg-rose-500/10 border-rose-500/20' },
  qa:    { label: 'Flashcards', Icon: IconMessageQuestion, color: 'text-violet-400',  bg: 'bg-violet-500/10 border-violet-500/20' },
};

const SUBJECTS = [
  { id: 'Biology', Icon: IconDna },
  { id: 'Physics', Icon: IconAtom },
  { id: 'Chemistry', Icon: IconFlask },
];

const getSubjectIcon = (subjectName) => {
  const sub = SUBJECTS.find(s => s.id.toLowerCase() === (subjectName || '').toLowerCase());
  return sub ? sub.Icon : IconBook2;
};

function MathMarkdownContent({ content }) {
  const containerRef = React.useRef(null);

  useEffect(() => {
    if (containerRef.current && window.renderMathInElement) {
      try {
        window.renderMathInElement(containerRef.current, {
          delimiters: [
            { left: '$$', right: '$$', display: true },
            { left: '$', right: '$', display: false },
            { left: '\\(', right: '\\)', display: false },
            { left: '\\[', right: '\\]', display: true },
          ],
          throwOnError: false,
        });
      } catch (err) {
        console.error("KaTeX auto-render failed:", err);
      }
    }
  }, [content]);

  const processedContent = React.useMemo(() => {
    if (!content) return '';
    // 1. Convert unicode bullets at start of lines to markdown bullets
    let formatted = content.replace(/^[ \t]*[•▪◦⚫][ \t]*/gm, '- ');
    
    // 2. Append two spaces to lines to preserve single newlines as line breaks
    return formatted
      .split('\n')
      .map(line => {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#') || trimmed.startsWith('-') || trimmed.startsWith('*') || trimmed.match(/^\d+\./)) {
          return line;
        }
        return line + '  ';
      })
      .join('\n');
  }, [content]);

  return (
    <div ref={containerRef} className="prose max-w-none text-on-surface-variant text-sm leading-relaxed space-y-4 markdown-body">
      <ReactMarkdown 
        remarkPlugins={[remarkGfm]} 
        rehypePlugins={[rehypeRaw]}
        components={{
          h1: ({node, ...props}) => <h1 className="text-xl font-black text-on-surface mt-6 mb-3 border-b border-outline/10 pb-1" {...props} />,
          h2: ({node, ...props}) => {
            const children = props.children;
            const isNote = Array.isArray(children) ? children[0]?.startsWith?.('Note') : (typeof children === 'string' && children.startsWith('Note'));
            if (isNote) {
               return <h2 className="text-lg font-black text-primary border-b border-outline/10 pb-1 mt-8 mb-3 flex items-center gap-2" {...props} />;
            }
            return <h2 className="text-lg font-bold text-on-surface mt-5 mb-2.5" {...props} />;
          },
          h3: ({node, ...props}) => <h3 className="text-base font-bold text-on-surface mt-4 mb-2" {...props} />,
          strong: ({node, ...props}) => <strong className="font-extrabold text-on-surface" {...props} />,
          em: ({node, ...props}) => <em className="italic" {...props} />,
          code: ({node, inline, ...props}) => <code className="px-1.5 py-0.5 rounded bg-surface-container font-mono text-xs text-amber-400" {...props} />,
          pre: ({node, ...props}) => <pre className="p-4 rounded-xl bg-surface-container overflow-x-auto text-xs my-3 border border-outline/10" {...props} />,
          ul: ({node, ...props}) => <ul className="space-y-1 my-2 list-none" {...props} />,
          ol: ({node, ...props}) => <ol className="space-y-1 my-2 list-decimal ml-4" {...props} />,
          li: ({node, ...props}) => <li className="ml-4 list-disc pl-1 mb-1 text-on-surface-variant" {...props} />,
          p: ({node, ...props}) => <p className="mb-3 leading-relaxed text-sm" {...props} />,
          blockquote: ({node, ...props}) => <blockquote className="pl-4 mb-2 border-l-2 border-primary/40 text-on-surface-variant/90 text-sm leading-relaxed" {...props} />
        }}
      >
        {processedContent}
      </ReactMarkdown>
    </div>
  );
}

const AD_URLS = [
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', // Placeholder Ad 1
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', // Placeholder Ad 2
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3'  // Placeholder Ad 3
];

function AudioAdPlayer({ item, user }) {
  const [currentTrackIndex, setCurrentTrackIndex] = React.useState(0);
  
  React.useEffect(() => {
    setCurrentTrackIndex(0);
  }, [item._id]);

  const isFree = !user?.isPremium;
  const originalAudio = item.audioUrl || item.videoUrl;
  const tracks = isFree && originalAudio ? [...AD_URLS, originalAudio] : [originalAudio];
  
  const handleEnded = () => {
    if (currentTrackIndex < tracks.length - 1) {
      setCurrentTrackIndex(prev => prev + 1);
    }
  };

  const isAd = isFree && currentTrackIndex < AD_URLS.length && originalAudio;

  return (
    <div className="flex flex-col items-center justify-center py-12 text-center bg-surface-container/20 border border-outline/10 rounded-2xl p-6">
      <div className="w-16 h-16 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-4">
        <IconMusic size={28} className="text-purple-400" />
      </div>
      <p className="text-sm font-semibold text-on-surface mb-2">
        {isAd ? `Playing Ad ${currentTrackIndex + 1} of ${AD_URLS.length}...` : item.title}
      </p>
      {tracks[currentTrackIndex] ? (
        <audio 
          controls 
          autoPlay={currentTrackIndex > 0} 
          src={tracks[currentTrackIndex]} 
          onEnded={handleEnded}
          className="w-full max-w-md mt-4" 
        />
      ) : (
        <p className="text-xs text-on-surface-variant/60">No audio URL provided for this song yet.</p>
      )}
    </div>
  );
}

export default function CoursePlayer({ currentTrack, user, onUpgradeClick }) {
  const navigate = useNavigate();
  const { courseId, itemType, subjectIdx: subjectIdxParam, chapterIdx: chapterIdxParam, itemIdx: itemIdxParam } = useParams();

  const [course, setCourse] = useState(null);
  const [courseLoading, setCourseLoading] = useState(true);

  useEffect(() => {
    if (!courseId) return;
    setCourseLoading(true);
    getCourseById(courseId)
      .then(data => {
        setCourse(data);
      })
      .catch(err => {
        console.error("Failed to fetch course:", err);
      })
      .finally(() => {
        setCourseLoading(false);
      });
  }, [courseId]);

  const selectedSubjectIdx = subjectIdxParam !== undefined ? parseInt(subjectIdxParam, 10) - 1 : null;
  const selectedChapterIdx = chapterIdxParam !== undefined ? parseInt(chapterIdxParam, 10) - 1 : null;
  const selectedItemIdx = itemIdxParam !== undefined ? parseInt(itemIdxParam, 10) - 1 : null;
  
  // Temporary variable to prevent syntax errors until Task 3 is implemented
  const selectedLessonIdx = null;

  const [sidebarSubjectIdx, setSidebarSubjectIdx] = useState(0);

  // Sync sidebar subject with playing subject when URL changes
  useEffect(() => {
    if (selectedSubjectIdx !== null && selectedSubjectIdx >= 0) {
      setSidebarSubjectIdx(selectedSubjectIdx);
    }
  }, [selectedSubjectIdx]);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [headerHeight, setHeaderHeight] = useState(0);

  const getSlugType = (type) => {
    if (type === 'qa') return 'flashcards';
    return type;
  };

  const handleBack = () => navigate('/course');

  const bottomClass = currentTrack ? 'bottom-[152px] md:bottom-24' : 'bottom-20 md:bottom-24';

  const isItemLocked = (sIdx, cIdx, iIdx) => {
    if (user?.isPremium) return false;
    const subject = course?.subjects?.[sIdx];
    const chapter = subject?.chapters?.[cIdx];
    const item = chapter?.items?.[iIdx];
    return !!(item?.isPremium || chapter?.isPremium || subject?.isPremium || course?.isPremium);
  };

  // Normalise lessons from DB
  const lessons = React.useMemo(() => {
    return [...(course?.lessons || [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }, [course?.lessons]);
  const coverColor = course?.coverColor || '#ecc246';
  const SubjectIcon = getSubjectIcon(course?.subject);

  // Calculate total items across all lessons
  const totalItemsCount = (course?.subjects || []).reduce((acc, sub) => {
    return acc + (sub.chapters || []).reduce((capAcc, cap) => capAcc + (cap.items || []).length, 0);
  }, 0);

  useEffect(() => {
    const update = () => {
      const h = document.querySelector('header[data-gsap="header"]');
      setHeaderHeight(h ? h.offsetHeight : 0);
    };
    update();
    const ro = new ResizeObserver(update);
    const h = document.querySelector('header[data-gsap="header"]');
    if (h) ro.observe(h);
    return () => ro.disconnect();
  }, []);

  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [currentQuizQuestionIdx, setCurrentQuizQuestionIdx] = useState(0);
  const [markedForReview, setMarkedForReview] = useState({});

  // ── Flashcard state ──
  const [flashcardIdx, setFlashcardIdx] = useState(0);
  const [flashcardFlipped, setFlashcardFlipped] = useState(false);

  useEffect(() => {
    setQuizAnswers({});
    setQuizSubmitted(false);
    setQuizScore(0);
    setCurrentQuizQuestionIdx(0);
    setMarkedForReview({});
    setFlashcardIdx(0);
    setFlashcardFlipped(false);
  }, [selectedLessonIdx, selectedItemIdx]);

  const renderPaletteButtons = () => {
    if (!activeDetails?.questions) return null;
    return activeDetails.questions.map((_, qIdx) => {
      const isActive = qIdx === currentQuizQuestionIdx;
      const isAnswered = quizAnswers[qIdx] !== undefined && quizAnswers[qIdx] !== '';
      const isMarked = markedForReview[qIdx];
      
      let circleStyle = 'bg-surface-container/50 border-outline-variant/30 text-on-surface-variant hover:border-outline-variant';
      if (isAnswered) {
        circleStyle = 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 font-bold';
      }
      if (isMarked) {
        circleStyle = 'bg-purple-500/10 border-purple-500/30 text-purple-400 font-bold';
      }
      if (quizSubmitted) {
        const qObj = activeDetails.questions[qIdx];
        let correct = false;
        if (qObj.type === 'fill_in_the_blanks') {
          const userAns = (quizAnswers[qIdx] || '').toString().trim().toLowerCase();
          const correctAns = (qObj.correctText || '').toString().trim().toLowerCase();
          correct = userAns === correctAns && correctAns !== '';
        } else {
          correct = quizAnswers[qIdx] === qObj.correctIndex;
        }

        if (correct) {
          circleStyle = 'bg-emerald-500 text-black font-extrabold border-emerald-600';
        } else if (quizAnswers[qIdx] !== undefined && quizAnswers[qIdx] !== '') {
          circleStyle = 'bg-rose-500 text-white font-extrabold border-rose-600';
        } else {
          circleStyle = 'bg-surface-container/30 border-outline-variant/10 text-on-surface-variant/30';
        }
      }

      return (
        <button
          key={qIdx}
          onClick={() => setCurrentQuizQuestionIdx(qIdx)}
          className={`w-9 h-9 rounded-lg border text-[11px] font-bold transition-all duration-150 flex items-center justify-center ${circleStyle} ${
            isActive ? 'ring-2 ring-amber-500' : ''
          }`}
        >
          {qIdx + 1}
        </button>
      );
    });
  };

  const [detailsLoading, setDetailsLoading] = useState(false);
  const [activeDetails, setActiveDetails] = useState(null);

  const activeSubject = selectedSubjectIdx !== null ? course?.subjects?.[selectedSubjectIdx] : null;
  const activeChapter = selectedChapterIdx !== null ? activeSubject?.chapters?.[selectedChapterIdx] : null;
  const activeItem = activeChapter?.items?.[selectedItemIdx];

  useEffect(() => {
    if (selectedSubjectIdx === null || selectedChapterIdx === null || selectedItemIdx === null) {
      setActiveDetails(null);
      return;
    }
    if (isItemLocked(selectedSubjectIdx, selectedChapterIdx, selectedItemIdx)) {
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
  }, [selectedSubjectIdx, selectedChapterIdx, selectedItemIdx, activeItem?._id, activeItem?.type]);

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
  }, [activeDetails, selectedLessonIdx, selectedItemIdx, quizSubmitted]);

  // Traversal Helpers
  const getPreviousItem = () => {
    if (selectedSubjectIdx === null || selectedChapterIdx === null || selectedItemIdx === null || !course?.subjects) return null;
    
    if (selectedItemIdx > 0) {
      return { sIdx: selectedSubjectIdx, cIdx: selectedChapterIdx, iIdx: selectedItemIdx - 1 };
    }
    
    // Go to previous chapter's last item
    let cIdx = selectedChapterIdx - 1;
    const subject = course.subjects[selectedSubjectIdx];
    while (cIdx >= 0) {
      if (subject?.chapters?.[cIdx]?.items?.length > 0) {
        return { sIdx: selectedSubjectIdx, cIdx, iIdx: subject.chapters[cIdx].items.length - 1 };
      }
      cIdx--;
    }
    
    // Go to previous subject's last chapter's last item
    let sIdx = selectedSubjectIdx - 1;
    while (sIdx >= 0) {
      const prevSub = course.subjects[sIdx];
      let prevCIdx = (prevSub?.chapters?.length || 0) - 1;
      while (prevCIdx >= 0) {
        if (prevSub.chapters[prevCIdx]?.items?.length > 0) {
          return { sIdx, cIdx: prevCIdx, iIdx: prevSub.chapters[prevCIdx].items.length - 1 };
        }
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
    
    if (selectedItemIdx < (chapter?.items?.length || 0) - 1) {
      return { sIdx: selectedSubjectIdx, cIdx: selectedChapterIdx, iIdx: selectedItemIdx + 1 };
    }
    
    // Go to next chapter's first item
    let cIdx = selectedChapterIdx + 1;
    while (cIdx < (subject?.chapters?.length || 0)) {
      if (subject.chapters[cIdx]?.items?.length > 0) {
        return { sIdx: selectedSubjectIdx, cIdx, iIdx: 0 };
      }
      cIdx++;
    }
    
    // Go to next subject's first chapter's first item
    let sIdx = selectedSubjectIdx + 1;
    while (sIdx < (course.subjects?.length || 0)) {
      const nextSub = course.subjects[sIdx];
      let nextCIdx = 0;
      while (nextCIdx < (nextSub?.chapters?.length || 0)) {
         if (nextSub.chapters[nextCIdx]?.items?.length > 0) {
            return { sIdx, cIdx: nextCIdx, iIdx: 0 };
         }
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
  if (selectedLessonIdx === null || selectedItemIdx === null) {
    return (
      <div
        className={`fixed left-0 right-0 flex flex-col bg-surface text-on-surface overflow-hidden z-player-mobile ${bottomClass}`}
        style={{ top: headerHeight }}
      >
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <aside className="hidden lg:flex flex-col w-72 xl:w-80 border-r border-outline/10 bg-surface-container-low shrink-0 overflow-y-auto pb-28">
            <div className="p-5">
              <button
                onClick={handleBack}
                className="flex items-center gap-2 text-sm font-semibold text-on-surface-variant hover:text-on-surface transition-colors mb-5"
              >
                <IconArrowLeft size={16} /> Back to Courses
              </button>

              {/* Course preview card */}
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

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-surface-container rounded-xl p-3">
                  <p className="text-2xl font-bold text-on-surface">{lessons.length}</p>
                  <p className="text-[10px] text-on-surface-variant uppercase tracking-wider mt-0.5">Lessons</p>
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

          {/* Main */}
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-10 py-5 sm:py-8 pb-32 sm:pb-40">
              {/* Mobile back */}
              <button
                onClick={handleBack}
                className="flex items-center gap-2 text-sm font-semibold text-on-surface-variant hover:text-on-surface transition-colors mb-4 lg:hidden"
              >
                <IconArrowLeft size={16} /> Back to Courses
              </button>

              {/* Header */}
              <div className="mb-5">
                <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: coverColor }}>
                  {course?.subject} · {course?.class}
                </p>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-on-surface leading-tight">
                  {course?.title || 'Course Curriculum'}
                </h1>
                {course?.summary && (
                  <p className="text-sm text-on-surface-variant mt-2 max-w-xl">{course.summary}</p>
                )}
              </div>

              {/* Start CTA */}
              {course?.subjects?.length > 0 && course.subjects[0].chapters?.length > 0 && course.subjects[0].chapters[0].items?.length > 0 && (
                <button
                  onClick={() => {
                    const firstItem = course.subjects[0].chapters[0].items[0];
                    if (firstItem) {
                      navigate(`/course/${course._id}/${getSlugType(firstItem.type)}/1/1/1`);
                    }
                  }}
                  className="group flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm text-white mb-8 transition-all hover:brightness-110 active:scale-[0.98] shadow-lg"
                  style={{ background: coverColor, boxShadow: `0 4px 20px ${coverColor}44` }}
                >
                  <IconPlayerPlayFilled size={16} />
                  Start First Item
                  <IconArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </button>
              )}

              {/* Lesson list */}
              {!course?.subjects || course.subjects.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-outline/20 rounded-2xl">
                  <div className="w-16 h-16 rounded-2xl bg-surface-container border border-outline/10 flex items-center justify-center mb-4">
                    <IconBook2 size={28} className="text-on-surface-variant/40" />
                  </div>
                  <p className="text-sm font-semibold text-on-surface-variant">No lessons yet</p>
                  <p className="text-xs text-on-surface-variant/60 mt-1">The instructor hasn't added any content yet.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {(course?.subjects || []).map((subject, sIdx) => (
                    <div key={subject._id || sIdx} className="mb-8">
                      <h3 className="text-xl font-bold text-on-surface mb-4">{subject.title}</h3>
                      <div className="space-y-4">
                        {(subject.chapters || []).map((chapter, cIdx) => (
                          <div key={chapter._id || cIdx} className="rounded-2xl border border-outline/15 overflow-hidden bg-surface-container-lowest">
                            {/* Chapter Header */}
                            <div className="px-5 py-4 bg-surface-container-low flex items-center justify-between border-b border-outline/10">
                              <span className="font-extrabold text-sm sm:text-base text-on-surface truncate">
                                {chapter.title}
                              </span>
                            </div>
                            {/* Items */}
                            <div className="divide-y divide-outline/5">
                              {(chapter.items || []).map((item, itemIdx) => {
                                const meta = TYPE_META[item.type] || TYPE_META.notes;
                                const LIcon = meta.Icon;
                                const locked = isItemLocked(sIdx, cIdx, itemIdx);
                                return (
                                  <div key={item._id || itemIdx} className="group flex items-center justify-between gap-4 p-4 hover:bg-surface-container/30 transition-colors">
                                    <div className="flex items-center gap-3 min-w-0">
                                      <div className={`w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 ${meta.bg}`}>
                                        <LIcon size={15} stroke={2} className={meta.color} />
                                      </div>
                                      <div className="min-w-0">
                                        <p className="font-bold text-on-surface text-xs sm:text-sm leading-tight truncate group-hover:text-primary transition-colors flex items-center gap-1.5">
                                          {item.title}
                                          {locked && <IconCrown size={11} className="text-amber-400/80 shrink-0" />}
                                        </p>
                                        {item.duration && <p className="text-[10px] text-on-surface-variant mt-0.5 font-medium">{item.duration}</p>}
                                      </div>
                                    </div>
                                    {locked ? (
                                      <button onClick={onUpgradeClick} className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-[#342410] text-amber-400 border border-amber-500/20 flex items-center gap-1 hover:brightness-110 transition-all shrink-0">
                                        <IconCrown size={11} className="fill-current" /> Unlock
                                      </button>
                                    ) : (
                                      <button onClick={() => navigate(`/course/${course._id}/${getSlugType(item.type)}/${sIdx + 1}/${cIdx + 1}/${itemIdx + 1}`)} className="px-4 py-1.5 rounded-lg text-xs font-extrabold bg-[#16362f] text-emerald-400 border border-emerald-500/20 hover:brightness-110 active:scale-[0.97] transition-all shrink-0">
                                        Start
                                      </button>
                                    )}
                                  </div>
                                );
                              })}
                              {(!chapter.items || chapter.items.length === 0) && (
                                <div className="p-5 text-center text-xs text-on-surface-variant/50 italic">
                                  No items under this chapter yet.
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── LESSON VIEW (Playing an item) ─────────────────────────
  const lesson = lessons[selectedLessonIdx];
  const item = lesson?.items?.[selectedItemIdx];
  const meta = TYPE_META[item?.type] || TYPE_META.notes;
  const LIcon = meta.Icon;
  const locked = isItemLocked(selectedLessonIdx, selectedItemIdx);

  return (
    <div
      className={`fixed left-0 right-0 flex flex-col bg-surface text-on-surface overflow-hidden z-player-mobile ${bottomClass}`}
      style={{ top: headerHeight }}
    >
      {/* Top bar */}
      <div className="h-14 bg-surface-container-high border-b border-outline/10 flex items-center shrink-0 shadow-sm z-40">
        <button
          onClick={() => {
            navigate(`/course/${course._id}`);
          }}
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
            className="h-full px-4 flex items-center gap-2 hover:bg-surface-container-highest transition-colors font-semibold text-sm disabled:opacity-30"
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
              } else {
                navigate(`/course/${course._id}`);
              }
            }}
            className="h-full px-4 flex items-center gap-2 bg-primary text-on-primary hover:brightness-105 transition-all font-semibold text-sm"
            style={{ background: coverColor }}
          >
            <span className="hidden sm:inline">{nextItem ? 'Next' : 'Finish'}</span>
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
        {/* Backdrop for mobile drawer */}
        {isSidebarOpen && (
          <div 
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/60 z-20 lg:hidden animate-in fade-in duration-200"
            aria-hidden="true"
          />
        )}
        {/* Sidebar — accordion content tree */}
        <aside className={`
          absolute lg:static top-0 left-0 h-full w-72 bg-surface-container-low border-r border-outline/10
          flex flex-col z-30 transition-transform duration-300
          ${isSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'}
        `}>
          <div className="p-4 border-b border-outline/10">
            <p className="text-[11px] font-bold uppercase tracking-widest text-on-surface-variant">Course Contents</p>
            <p className="text-xs text-on-surface-variant/60 mt-0.5">{lessons.length} lessons · {totalItemsCount} items</p>
          </div>
          <div className="flex-1 overflow-y-auto pb-28 divide-y divide-outline/5">
            {lessons.map((l, lIdx) => {
              const items = l.items || [];
              const isCurrentLesson = lIdx === selectedLessonIdx;
              return (
                <div key={l._id || lIdx} className="bg-surface-container-lowest">
                  {/* Sidebar Lesson Header */}
                  <div className="px-4 py-3 bg-surface-container-low/60 flex items-center justify-between">
                    <span className="text-xs font-extrabold text-on-surface truncate pr-2">
                      {l.title}
                    </span>
                    {l.isPremium && <IconCrown size={11} className="text-amber-400 shrink-0" />}
                  </div>

                  {/* Sidebar Items list under lesson */}
                  <div className="divide-y divide-outline/5">
                    {items.map((subItem, itemIdx) => {
                      const isSelected = isCurrentLesson && itemIdx === selectedItemIdx;
                      const m = TYPE_META[subItem.type] || TYPE_META.notes;
                      const MIcon = m.Icon;
                      return (
                        <button
                          key={subItem._id || itemIdx}
                          onClick={() => {
                            navigate(`/course/${course._id}/${getSlugType(subItem.type)}/${lIdx + 1}/${itemIdx + 1}`);
                            setIsSidebarOpen(false);
                          }}
                          className={`w-full text-left flex items-center gap-2.5 px-4 py-2.5 text-xs transition-all border rounded-lg ${
                            isSelected 
                              ? 'bg-primary/15 font-bold border-primary/30 text-on-surface' 
                              : 'border-transparent hover:bg-surface-container-highest text-on-surface-variant'
                          }`}
                        >
                          <div className={`w-5.5 h-5.5 rounded-md border flex items-center justify-center shrink-0 ${m.bg}`}>
                            <MIcon size={10} stroke={2} className={m.color} />
                          </div>
                          <span className={`flex-1 truncate ${isSelected ? 'text-on-surface' : 'text-on-surface-variant'}`}>
                            {subItem.title}
                          </span>
                          {isItemLocked(lIdx, itemIdx) && (
                            <IconCrown size={11} className="text-amber-400/80 shrink-0" />
                          )}
                        </button>
                      );
                    })}
                    {items.length === 0 && (
                      <div className="px-4 py-2 text-[10px] text-on-surface-variant/40 italic">
                        No content items
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </aside>

        {/* Overlay for mobile sidebar */}
        {isSidebarOpen && (
          <div className="absolute inset-0 bg-black/50 z-20 lg:hidden" onClick={() => setIsSidebarOpen(false)} />
        )}

        {/* Item content area */}
        <main data-gsap="player-main" className="flex-1 overflow-y-auto bg-surface p-4 sm:p-6 lg:p-10 pb-32 sm:pb-40">
          <div className="max-w-3xl mx-auto w-full">

            {/* Active item header */}
            <div className="flex items-center gap-3 mb-5 pb-4 border-b border-outline/10">
              <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl border flex items-center justify-center shrink-0 ${meta.bg}`}>
                <LIcon size={18} stroke={1.5} className={meta.color} />
              </div>
              <div>
                <p className={`text-[10px] font-bold uppercase tracking-widest ${meta.color}`}>{meta.label}</p>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-on-surface leading-tight">{item?.title}</h1>
              </div>

              {lesson?.isPremium && (
                <span className="ml-auto flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
                  <IconCrown size={13} stroke={2} /> Premium
                </span>
              )}
            </div>

            {/* Duration */}
            {item?.duration && !locked && (
              <p className="text-xs font-mono text-on-surface-variant mb-6">Duration: {item.duration}</p>
            )}

            {/* Video embed */}
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
                {/* ── QUIZ RENDER ── */}
                {item?.type === 'quiz' && (
                  <div className="space-y-6">
                    {(!activeDetails?.questions || activeDetails.questions.length === 0) ? (
                      <div className="text-center py-10 border border-dashed border-outline/20 rounded-xl">
                        <IconAlertCircle className="mx-auto text-on-surface-variant/40 mb-2" size={24} />
                        <p className="text-sm text-on-surface-variant">This quiz has no questions yet.</p>
                      </div>
                    ) : (
                      <div className="flex flex-col lg:flex-row gap-6 items-start">
                        {/* Left Side: Question Pane */}
                        <div className="flex-1 w-full space-y-4">
                          {/* Quiz Summary Banner */}
                          {quizSubmitted && (
                            <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-center">
                              <p className="text-base font-bold text-on-surface">Quiz Completed!</p>
                              <p className="text-xs text-on-surface-variant mt-1">
                                You scored <span className="font-extrabold text-amber-400">{quizScore}</span> out of <span className="font-bold">{activeDetails.questions.length}</span>
                              </p>
                              <button
                                onClick={() => {
                                  setQuizAnswers({});
                                  setQuizSubmitted(false);
                                  setQuizScore(0);
                                  navigate('/checkout');
                                  setMarkedForReview({});
                                }}
                                className="mt-3 px-4 py-2 rounded-xl bg-amber-500 text-black font-bold text-xs hover:brightness-105 active:scale-95 transition-all shadow-sm"
                              >
                                Retry Quiz
                              </button>
                            </div>
                          )}

                          {/* Mobile Question Palette (just numbers, minimal style) */}
                          <div className="flex flex-wrap gap-3 lg:hidden">
                            {renderPaletteButtons()}
                          </div>

                          {/* Active Question Box */}
                          {(() => {
                            const q = activeDetails.questions[currentQuizQuestionIdx];
                            const selectedOpt = quizAnswers[currentQuizQuestionIdx];
                            return (
                              <div className="p-4 sm:p-6 rounded-2xl border border-outline/10 bg-surface-container-low/50 space-y-4">
                                <div className="flex items-center justify-between border-b border-outline/5 pb-3">
                                  <span className="text-xs font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full font-mono">
                                    Question {currentQuizQuestionIdx + 1} of {activeDetails.questions.length}
                                  </span>
                                  {markedForReview[currentQuizQuestionIdx] && (
                                    <span className="text-[10px] font-bold text-purple-400 bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded-md flex items-center gap-1">
                                      <IconBookmark size={10} className="fill-current" /> Marked for Review
                                    </span>
                                  )}
                                </div>

                                <p className="text-sm sm:text-base font-bold text-on-surface leading-relaxed">
                                  {q.question}
                                </p>

                                <div className="space-y-2.5 pt-2">
                                  {q.type === 'fill_in_the_blanks' ? (
                                    <div className="pt-2">
                                      <input 
                                        type="text" 
                                        placeholder="Type your answer here..."
                                        disabled={quizSubmitted}
                                        value={quizAnswers[currentQuizQuestionIdx] || ''}
                                        onChange={(e) => setQuizAnswers(prev => ({ ...prev, [currentQuizQuestionIdx]: e.target.value }))}
                                        className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 bg-background transition-colors ${
                                          quizSubmitted 
                                            ? (((quizAnswers[currentQuizQuestionIdx] || '').toString().trim().toLowerCase() === (q.correctText || '').toString().trim().toLowerCase()) ? 'border-emerald-500 text-emerald-400 bg-emerald-500/10 focus:ring-0' : 'border-rose-500 text-rose-400 bg-rose-500/10 focus:ring-0')
                                            : 'border-outline-variant/30 text-on-surface focus:ring-amber-500/30 focus:border-amber-500/40'
                                        }`}
                                      />
                                      {quizSubmitted && ((quizAnswers[currentQuizQuestionIdx] || '').toString().trim().toLowerCase() !== (q.correctText || '').toString().trim().toLowerCase()) && (
                                        <p className="text-emerald-400 text-xs font-bold mt-2 bg-emerald-500/10 px-3 py-2 rounded-lg inline-block border border-emerald-500/20">Correct Answer: {q.correctText}</p>
                                      )}
                                    </div>
                                  ) : (
                                    q.options.map((opt, oIdx) => {
                                      const isSelected = selectedOpt === oIdx;
                                      let btnStyle = 'border-outline-variant/30 hover:bg-surface-container-highest/50 text-on-surface-variant';
                                      let indexStyle = 'bg-surface-container text-on-surface-variant';
                                      
                                      if (isSelected) {
                                        btnStyle = 'border-amber-500 bg-amber-500/10 text-on-surface';
                                        indexStyle = 'bg-amber-500/20 text-amber-400 font-bold';
                                      }
                                      if (quizSubmitted) {
                                        if (oIdx === q.correctIndex) {
                                          btnStyle = 'border-emerald-500 bg-emerald-500/15 text-emerald-400 font-bold';
                                          indexStyle = 'bg-emerald-500/20 text-emerald-400';
                                        } else if (isSelected) {
                                          btnStyle = 'border-rose-500 bg-rose-500/15 text-rose-400 font-bold';
                                          indexStyle = 'bg-rose-500/20 text-rose-400';
                                        } else {
                                          btnStyle = 'border-outline-variant/20 text-on-surface-variant/40 cursor-not-allowed';
                                          indexStyle = 'bg-surface-container/30 text-on-surface-variant/30';
                                        }
                                      }

                                      return (
                                        <button
                                          key={oIdx}
                                          disabled={quizSubmitted}
                                          onClick={() => setQuizAnswers(prev => ({ ...prev, [currentQuizQuestionIdx]: oIdx }))}
                                          className={`w-full text-left px-4 py-3 rounded-xl border text-xs sm:text-sm transition-all duration-150 flex items-center justify-between ${btnStyle}`}
                                        >
                                          <div className="flex items-center gap-3">
                                            <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${indexStyle}`}>
                                              {String.fromCharCode(65 + oIdx)}
                                            </span>
                                            <span>{opt}</span>
                                          </div>
                                          {quizSubmitted && oIdx === q.correctIndex && (
                                            <IconCheck size={16} className="text-emerald-400 shrink-0" />
                                          )}
                                        </button>
                                      );
                                    })
                                  )}
                                </div>

                                {quizSubmitted && q.explanation && (
                                  <div className="text-xs text-on-surface-variant/80 mt-4 p-4 rounded-xl bg-primary/5 border border-primary/20 leading-relaxed">
                                    <strong className="text-amber-400 block mb-1">Explanation:</strong>
                                    {q.explanation}
                                  </div>
                                )}
                              </div>
                            );
                          })()}

                          {/* Control Buttons row */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
                            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                              {!quizSubmitted && (
                                <>
                                  <button
                                    onClick={() => {
                                      setMarkedForReview(prev => ({
                                        ...prev,
                                        [currentQuizQuestionIdx]: !prev[currentQuizQuestionIdx]
                                      }));
                                    }}
                                    className={`px-3 py-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all shrink-0 ${
                                      markedForReview[currentQuizQuestionIdx]
                                        ? 'bg-purple-500/10 border-purple-500/30 text-purple-400'
                                        : 'border-outline-variant/30 text-on-surface-variant hover:border-outline-variant hover:text-on-surface'
                                    }`}
                                  >
                                    <IconBookmark size={14} className={markedForReview[currentQuizQuestionIdx] ? 'fill-current' : ''} />
                                    {markedForReview[currentQuizQuestionIdx] ? 'Marked' : 'Mark Review'}
                                  </button>
                                  <button
                                    onClick={() => {
                                      setQuizAnswers(prev => {
                                        const copy = { ...prev };
                                        delete copy[currentQuizQuestionIdx];
                                        return copy;
                                      });
                                    }}
                                      disabled={quizAnswers[currentQuizQuestionIdx] === undefined || quizAnswers[currentQuizQuestionIdx] === ''}
                                      className="px-3 py-2 rounded-xl border border-outline-variant/30 text-on-surface-variant hover:border-outline-variant hover:text-on-surface text-xs font-bold transition-all disabled:opacity-30 disabled:cursor-not-allowed shrink-0"
                                    >
                                      Clear Response
                                    </button>
                                </>
                              )}
                            </div>

                            <div className="flex gap-2 w-full sm:w-auto justify-between sm:justify-end">
                              <button
                                onClick={() => setCurrentQuizQuestionIdx(prev => Math.max(0, prev - 1))}
                                disabled={currentQuizQuestionIdx === 0}
                                className="px-4 py-2 rounded-xl border border-outline-variant/30 text-on-surface-variant hover:border-outline-variant hover:text-on-surface text-xs font-bold flex items-center gap-1 transition-all disabled:opacity-30 disabled:cursor-not-allowed shrink-0"
                              >
                                <IconArrowLeft size={14} /> Prev
                              </button>

                              {currentQuizQuestionIdx < activeDetails.questions.length - 1 ? (
                                <button
                                  onClick={() => setCurrentQuizQuestionIdx(prev => prev + 1)}
                                  className="px-4 py-2 rounded-xl bg-surface-variant hover:bg-surface-container-highest text-on-surface text-xs font-bold flex items-center gap-1 transition-all shrink-0"
                                >
                                  Next <IconArrowRight size={14} />
                                </button>
                              ) : !quizSubmitted ? (
                                <button
                                  onClick={() => {
                                    let score = 0;
                                    activeDetails.questions.forEach((q, idx) => {
                                      if (q.type === 'fill_in_the_blanks') {
                                        const userAns = (quizAnswers[idx] || '').toString().trim().toLowerCase();
                                        const correctAns = (q.correctText || '').toString().trim().toLowerCase();
                                        if (userAns === correctAns && correctAns !== '') score++;
                                      } else {
                                        if (quizAnswers[idx] === q.correctIndex) score++;
                                      }
                                    });
                                    setQuizScore(score);
                                    setQuizSubmitted(true);
                                  }}
                                  className="px-4 py-2 rounded-xl bg-amber-500 text-black text-xs font-extrabold flex items-center gap-1 hover:brightness-105 active:scale-95 transition-all shadow-[0_4px_12px_rgba(201,162,39,0.2)] shrink-0"
                                >
                                  <IconSend size={14} /> Submit Quiz
                                </button>
                              ) : null}
                            </div>
                          </div>
                        </div>

                        {/* Right Side: Question Palette Panel (desktop only) */}
                        <div className="hidden lg:block w-full lg:w-56 shrink-0 rounded-2xl border border-outline/10 bg-surface-container-low/30 p-4 space-y-4">
                          <div className="flex items-center justify-between border-b border-outline/5 pb-2">
                            <span className="text-xs font-extrabold text-on-surface uppercase tracking-wider">Question Palette</span>
                            <span className="text-[10px] font-bold text-on-surface-variant bg-surface-container px-2 py-0.5 rounded-md">
                              {Object.keys(quizAnswers).length}/{activeDetails.questions.length}
                            </span>
                          </div>

                          <div className="grid grid-cols-5 gap-3">
                            {renderPaletteButtons()}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* ── Q&A FLASHCARD RENDER ── */}
                {item?.type === 'qa' && (
                  <div>
                    {(!activeDetails?.qas || activeDetails.qas.length === 0) ? (
                      <div className="text-center py-10 border border-dashed border-outline/20 rounded-xl">
                        <IconAlertCircle className="mx-auto text-on-surface-variant/40 mb-2" size={24} />
                        <p className="text-sm text-on-surface-variant">This Q&amp;A has no content yet.</p>
                      </div>
                    ) : (() => {
                      const qas = activeDetails.qas;
                      const total = qas.length;
                      const pair = qas[flashcardIdx];
                      const goNext = (e) => {
                        e?.stopPropagation();
                        setFlashcardFlipped(false);
                        setTimeout(() => setFlashcardIdx(i => Math.min(i + 1, total - 1)), 100);
                      };
                      const goPrev = (e) => {
                        e?.stopPropagation();
                        setFlashcardFlipped(false);
                        setTimeout(() => setFlashcardIdx(i => Math.max(i - 1, 0)), 100);
                      };
                      return (
                        <div
                          onKeyDown={(e) => {
                            if (e.key === 'ArrowRight') goNext();
                            else if (e.key === 'ArrowLeft') goPrev();
                            else if (e.key === ' ') { e.preventDefault(); setFlashcardFlipped(f => !f); }
                          }}
                          tabIndex={0}
                          className="outline-none"
                          aria-label="Flashcard viewer"
                        >
                          {/* Segmented progress bar */}
                          <div className="flex gap-1 mb-5" aria-hidden="true">
                            {qas.map((_, i) => (
                              <button
                                key={i}
                                className={`fc-seg${i === flashcardIdx ? ' active' : i < flashcardIdx ? ' done' : ''}`}
                                onClick={(e) => { e.stopPropagation(); setFlashcardFlipped(false); setFlashcardIdx(i); }}
                                tabIndex={-1}
                                aria-label={`Card ${i + 1}`}
                              />
                            ))}
                          </div>

                          {/* Card */}
                          <div className="flashcard-scene">
                            <div
                              className={`flashcard-card${flashcardFlipped ? ' is-flipped' : ''}`}
                              onClick={() => setFlashcardFlipped(f => !f)}
                              role="button"
                              aria-pressed={flashcardFlipped}
                              aria-label={flashcardFlipped ? 'Showing answer — tap to see question' : 'Showing question — tap to reveal answer'}
                            >
                              {/* FRONT — Question */}
                              <div
                                className="flashcard-face border-l-2"
                                style={{
                                  background: 'rgb(var(--color-surface-container) / 0.6)',
                                  border: '1px solid rgb(var(--color-outline) / 0.1)',
                                  borderLeftColor: 'rgb(139 92 246)',
                                  borderLeftWidth: '3px',
                                }}
                              >
                                {/* Flip state chip — top right */}
                                <span style={{
                                  position: 'absolute', top: '14px', right: '14px',
                                  fontSize: '10px', fontWeight: 600, letterSpacing: '0.06em',
                                  color: 'rgb(139 92 246)', opacity: 0.7,
                                  padding: '2px 8px', borderRadius: '9999px',
                                  border: '1px solid rgb(139 92 246 / 0.2)',
                                  background: 'rgb(139 92 246 / 0.07)',
                                  textTransform: 'uppercase',
                                }}>Q</span>

                                <p style={{
                                  fontSize: 'clamp(0.95rem, 2.5vw, 1.1rem)',
                                  fontWeight: 600,
                                  color: 'rgb(var(--color-on-surface))',
                                  lineHeight: 1.55,
                                  paddingRight: '2rem',
                                }}>
                                  {pair.question}
                                </p>

                                <span style={{
                                  marginTop: '1.25rem',
                                  fontSize: '11px',
                                  color: 'rgb(var(--color-on-surface-variant) / 0.35)',
                                  letterSpacing: '0.02em',
                                }}>
                                  Tap to reveal answer
                                </span>
                              </div>

                              {/* BACK — Answer */}
                              <div
                                className="flashcard-face"
                                style={{
                                  background: 'rgb(var(--color-surface-container) / 0.6)',
                                  border: '1px solid rgb(var(--color-outline) / 0.1)',
                                  borderLeftColor: 'rgb(16 185 129)',
                                  borderLeftWidth: '3px',
                                  transform: 'rotateY(180deg)',
                                  backfaceVisibility: 'hidden',
                                  WebkitBackfaceVisibility: 'hidden',
                                }}
                              >
                                <span style={{
                                  position: 'absolute', top: '14px', right: '14px',
                                  fontSize: '10px', fontWeight: 600, letterSpacing: '0.06em',
                                  color: 'rgb(16 185 129)', opacity: 0.7,
                                  padding: '2px 8px', borderRadius: '9999px',
                                  border: '1px solid rgb(16 185 129 / 0.2)',
                                  background: 'rgb(16 185 129 / 0.07)',
                                  textTransform: 'uppercase',
                                }}>A</span>

                                <p style={{
                                  fontSize: 'clamp(0.875rem, 2.2vw, 1rem)',
                                  color: 'rgb(var(--color-on-surface-variant))',
                                  lineHeight: 1.7,
                                  paddingRight: '2rem',
                                }}>
                                  {pair.answer}
                                </p>

                                <span style={{
                                  marginTop: '1.25rem',
                                  fontSize: '11px',
                                  color: 'rgb(var(--color-on-surface-variant) / 0.35)',
                                  letterSpacing: '0.02em',
                                }}>
                                  Tap to see question
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Navigation */}
                          <div className="flex items-center justify-between mt-4">
                            <button
                              onClick={goPrev}
                              disabled={flashcardIdx === 0}
                              className="w-9 h-9 rounded-lg flex items-center justify-center transition-all active:scale-95"
                              style={{
                                background: 'rgb(var(--color-surface-container) / 0.5)',
                                border: '1px solid rgb(var(--color-outline) / 0.12)',
                                color: flashcardIdx === 0
                                  ? 'rgb(var(--color-on-surface-variant) / 0.2)'
                                  : 'rgb(var(--color-on-surface-variant) / 0.7)',
                                cursor: flashcardIdx === 0 ? 'not-allowed' : 'pointer',
                              }}
                              aria-label="Previous card"
                            >
                              <IconArrowLeft size={15} stroke={1.75} />
                            </button>

                            <span className="text-xs font-mono text-on-surface-variant/40 tabular-nums">
                              {flashcardIdx + 1} / {total}
                            </span>

                            <button
                              onClick={goNext}
                              disabled={flashcardIdx === total - 1}
                              className="w-9 h-9 rounded-lg flex items-center justify-center transition-all active:scale-95"
                              style={{
                                background: 'rgb(var(--color-surface-container) / 0.5)',
                                border: '1px solid rgb(var(--color-outline) / 0.12)',
                                color: flashcardIdx === total - 1
                                  ? 'rgb(var(--color-on-surface-variant) / 0.2)'
                                  : 'rgb(var(--color-on-surface-variant) / 0.7)',
                                cursor: flashcardIdx === total - 1 ? 'not-allowed' : 'pointer',
                              }}
                              aria-label="Next card"
                            >
                              <IconArrowRight size={15} stroke={1.75} />
                            </button>
                          </div>

                          <p className="hidden sm:block text-center text-[10px] text-on-surface-variant/25 mt-3 font-mono tracking-wide">
                            ← → to navigate · space to flip
                          </p>
                        </div>
                      );
                    })()}
                  </div>
                )}


                {/* ── NOTES / TEXT RENDER ── */}
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

                {/* ── SONG/AUDIO RENDER ── */}
                {item?.type === 'song' && (
                  <AudioAdPlayer item={item} user={user} />
                )}

                {/* Empty state */}
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
