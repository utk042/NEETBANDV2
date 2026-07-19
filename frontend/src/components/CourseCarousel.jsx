import React, { useState, useRef, useEffect } from 'react';
import { IconChevronDown, IconCrown, IconChevronRight, IconBook2, IconChevronLeft, IconArrowRight } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { getCourses } from '../services/api';
import logoImg from '../assets/logo.png';
import { useClassAndSubjectOptions } from '../hooks/useClassAndSubjectOptions';

export default function CourseCarousel({ lmsCourses = [] }) {
  const navigate = useNavigate();
  const [courses, setCourses] = useState(lmsCourses);
  const [selectedClass, setSelectedClass] = useState('All');
  const [selectedSubject, setSelectedSubject] = useState('All');
  const { classes: existingClasses, subjects: existingSubjects, classToSubjects } = useClassAndSubjectOptions();
  
  const [openDropdown, setOpenDropdown] = useState(null);
  const dropdownRef = useRef(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (lmsCourses && lmsCourses.length > 0) {
      setCourses(lmsCourses);
    } else {
      getCourses().then(setCourses).catch(console.error);
    }
  }, [lmsCourses]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredCourses = React.useMemo(() => {
    return courses.filter(course => {
      if (!course.isPublished) return false;
      const classMatch = selectedClass === 'All' || course.class === selectedClass;
      const subjectMatch = selectedSubject === 'All' || course.subject?.toLowerCase() === selectedSubject.toLowerCase();
      return classMatch && subjectMatch;
    });
  }, [courses, selectedClass, selectedSubject]);

  const availableSubjects = selectedClass !== 'All' && classToSubjects[selectedClass]
    ? classToSubjects[selectedClass]
    : existingSubjects;

  const repeatCount = React.useMemo(() => {
    if (filteredCourses.length === 0) return 1;
    return Math.max(2, Math.ceil(12 / filteredCourses.length));
  }, [filteredCourses]);

  const displayCourses = React.useMemo(() => {
    const arr = [];
    for (let i = 0; i < repeatCount; i++) {
      arr.push(...filteredCourses);
    }
    return arr;
  }, [filteredCourses, repeatCount]);

  useEffect(() => {
    let intervalId;
    const scrollContainer = scrollRef.current;
    
    const startAutoScroll = () => {
      intervalId = setInterval(() => {
        if (scrollContainer && filteredCourses.length > 0) {
          const singleSetWidth = scrollContainer.scrollWidth / repeatCount;
          
          if (scrollContainer.scrollLeft >= singleSetWidth) {
            // Seamlessly jump back to the first set
            scrollContainer.style.scrollBehavior = 'auto';
            scrollContainer.scrollLeft = scrollContainer.scrollLeft - singleSetWidth;
            
            // Re-enable smooth scrolling for the next step after a frame
            requestAnimationFrame(() => {
              requestAnimationFrame(() => {
                scrollContainer.scrollBy({ left: 320, behavior: 'smooth' });
              });
            });
          } else {
            scrollContainer.scrollBy({ left: 320, behavior: 'smooth' });
          }
        }
      }, 3000);
    };

    startAutoScroll();

    const handleInteractionStart = () => clearInterval(intervalId);
    const handleInteractionEnd = () => startAutoScroll();

    if (scrollContainer) {
      scrollContainer.addEventListener('mouseenter', handleInteractionStart);
      scrollContainer.addEventListener('mouseleave', handleInteractionEnd);
      scrollContainer.addEventListener('touchstart', handleInteractionStart, { passive: true });
      scrollContainer.addEventListener('touchend', handleInteractionEnd, { passive: true });
    }

    return () => {
      clearInterval(intervalId);
      if (scrollContainer) {
        scrollContainer.removeEventListener('mouseenter', handleInteractionStart);
        scrollContainer.removeEventListener('mouseleave', handleInteractionEnd);
        scrollContainer.removeEventListener('touchstart', handleInteractionStart);
        scrollContainer.removeEventListener('touchend', handleInteractionEnd);
      }
    };
  }, [filteredCourses]);

  const scrollLeft = () => {
    if (scrollRef.current) scrollRef.current.scrollBy({ left: -320, behavior: 'smooth' });
  };
  
  const scrollRight = () => {
    if (scrollRef.current) scrollRef.current.scrollBy({ left: 320, behavior: 'smooth' });
  };

  const handleCourseSelect = (course) => {
    navigate(`/course/${course._id}`);
  };

  return (
    <section className="py-16 px-gutter bg-transparent relative overflow-hidden transition-colors duration-300">
      <div className="max-w-container-max mx-auto relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-6">
          <div data-gsap="heading">
            <h2 className="font-headline-lg font-bold text-headline-lg-mobile md:text-4xl text-on-surface mb-3 text-balance">Explore Courses</h2>
            <p className="font-body-md font-normal text-lg text-on-surface-variant max-w-2xl opacity-80">Discover immersive audio courses tailored for your preparation.</p>
          </div>
          
          <div ref={dropdownRef} className="flex flex-wrap gap-4 w-full md:w-auto relative z-30">
            {/* Class Dropdown */}
            <div className="relative">
              <button
                onClick={() => setOpenDropdown(openDropdown === 'class' ? null : 'class')}
                aria-haspopup="listbox"
                aria-expanded={openDropdown === 'class'}
                aria-label="Select Class"
                className={`px-5 py-2.5 rounded-full border font-label-md text-sm flex items-center gap-2 transition-[colors,border-color] duration-200 backdrop-blur-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 cursor-pointer ${selectedClass !== 'All' ? 'border-primary/50 text-primary bg-primary/10 shadow-[0_0_15px_rgba(201,162,39,0.05)]' : 'border-[var(--border-floating-card)] text-on-surface bg-surface hover:bg-surface-container hover:border-primary/50'}`}
              >
                <span className="truncate max-w-[120px]">{selectedClass === 'All' ? 'All Classes' : selectedClass}</span>
                <IconChevronDown size={18} className={`text-primary transition-transform duration-200 shrink-0 ${openDropdown === 'class' ? 'rotate-180' : ''}`} />
              </button>
              {openDropdown === 'class' && (
                <ul 
                  role="listbox" 
                  className="absolute top-full left-0 mt-2 w-48 bg-surface-container border border-outline/10 rounded-2xl shadow-2xl z-40 py-2 outline-none max-h-60 overflow-y-auto no-scrollbar animate-in fade-in slide-in-from-top-1 duration-150"
                >
                  {['All', ...existingClasses].map((cls) => (
                    <li
                      key={cls}
                      role="option"
                      aria-selected={selectedClass === cls}
                      tabIndex={0}
                      onClick={() => { setSelectedClass(cls); setSelectedSubject('All'); setOpenDropdown(null); }}
                      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { setSelectedClass(cls); setSelectedSubject('All'); setOpenDropdown(null); } }}
                      className={`px-4 py-2 text-sm text-on-surface-variant hover:text-on-surface hover:bg-primary/10 cursor-pointer transition-colors outline-none focus-visible:bg-primary/10 truncate ${selectedClass === cls ? 'text-primary font-bold bg-primary/5' : ''}`}
                      title={cls}
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
                <span className="truncate max-w-[120px]">{selectedSubject === 'All' ? 'All Subjects' : selectedSubject}</span>
                <IconChevronDown size={18} className={`text-primary transition-transform duration-200 shrink-0 ${openDropdown === 'subject' ? 'rotate-180' : ''}`} />
              </button>
              {openDropdown === 'subject' && (
                <ul 
                  role="listbox" 
                  className="absolute top-full right-0 md:left-0 mt-2 w-48 bg-surface-container border border-outline/10 rounded-2xl shadow-2xl z-40 py-2 outline-none max-h-60 overflow-y-auto no-scrollbar animate-in fade-in slide-in-from-top-1 duration-150"
                >
                  {['All', ...availableSubjects].map((sub) => (
                    <li
                      key={sub}
                      role="option"
                      aria-selected={selectedSubject === sub}
                      tabIndex={0}
                      onClick={() => { setSelectedSubject(sub); setOpenDropdown(null); }}
                      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { setSelectedSubject(sub); setOpenDropdown(null); } }}
                      className={`px-4 py-2 text-sm text-on-surface-variant hover:text-on-surface hover:bg-primary/10 cursor-pointer transition-colors outline-none focus-visible:bg-primary/10 truncate ${selectedSubject === sub ? 'text-primary font-bold bg-primary/5' : ''}`}
                      title={sub}
                    >
                      {sub}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* View All Button */}
            <button
              onClick={() => navigate('/course')}
              className="px-5 py-2.5 rounded-full border border-transparent font-label-md text-sm flex items-center gap-2 text-primary hover:bg-primary/10 transition-colors duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
            >
              View All
              <IconArrowRight size={18} />
            </button>
          </div>
        </div>

        <div className="relative group/carousel">
          <button onClick={scrollLeft} className="absolute -left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-surface-container border border-[var(--border-floating-card)] flex items-center justify-center opacity-0 group-hover/carousel:opacity-100 hover:bg-surface-container-highest transition-all shadow-lg text-on-surface cursor-pointer hidden md:flex">
            <IconChevronLeft size={24} />
          </button>
          
          <button onClick={scrollRight} className="absolute -right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-surface-container border border-[var(--border-floating-card)] flex items-center justify-center opacity-0 group-hover/carousel:opacity-100 hover:bg-surface-container-highest transition-all shadow-lg text-on-surface cursor-pointer hidden md:flex">
            <IconChevronRight size={24} />
          </button>

          <div 
            ref={scrollRef} 
            className="flex gap-6 overflow-x-auto pb-8 pt-4 px-2 no-scrollbar"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {displayCourses.length > 0 ? displayCourses.map((course, idx) => {
              const color = course.coverColor || '#ecc246';
              const hasSubjects = course.subjects && course.subjects.length > 0;
              const folderCount = hasSubjects ? course.subjects.length : (course.lessons?.length || 0);
              const folderLabel = hasSubjects ? 'subject' : 'lesson';
              const itemsCount = hasSubjects 
                ? course.subjects.reduce((acc, sub) => acc + (sub.chapters?.reduce((cAcc, chap) => cAcc + (chap.items?.length || 0), 0) || 0), 0)
                : (course.lessons?.reduce((acc, l) => acc + (l.items?.length || 0), 0) || 0);
              
              return (
                <div 
                  key={`${course._id}-${idx}`}
                  onClick={() => handleCourseSelect(course)}
                  className="shrink-0 w-[280px] sm:w-[320px] group relative bg-surface border border-outline/10 rounded-[1.5rem] overflow-hidden hover:border-primary/30 transition-all duration-500 cursor-pointer shadow-sm hover:shadow-xl hover:-translate-y-1 active:scale-[0.98] flex flex-col"
                >
                  <div className="h-44 overflow-hidden relative bg-surface-variant/20 flex items-center justify-center shrink-0 border-b border-outline/5">
                    <img 
                      src={course.thumbnail || logoImg} 
                      alt={course.title} 
                      className={`w-full h-full group-hover:scale-105 transition-transform duration-500 ${course.thumbnail ? 'object-cover' : 'object-contain scale-75 opacity-40'}`}
                      loading="lazy" 
                      onError={(e) => { 
                        e.target.onerror = null; 
                        e.target.src = logoImg; 
                        e.target.className = 'w-full h-full object-contain scale-75 opacity-40 group-hover:scale-[1.1] transition-transform duration-500';
                      }}
                    />
                    
                    <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
                      {course.isPremium && (
                        <span className="flex items-center gap-0.5 text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-amber-500/90 text-white backdrop-blur-md shadow-sm border border-white/20">
                          <IconCrown size={12} className="fill-current" /> Premium
                        </span>
                      )}
                      {course.isPublished ? (
                        <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/90 text-white backdrop-blur-md shadow-sm border border-white/20">Live</span>
                      ) : (
                        <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-black/60 text-white backdrop-blur-md shadow-sm border border-white/20">Draft</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="p-5 flex flex-col flex-1 bg-surface relative">
                    <p className="text-[11px] font-bold uppercase tracking-[0.15em] mb-1.5 transition-colors duration-300" style={{ color: `${color}cc` }}>
                      {course.subject || 'Subject'}
                    </p>
                    <h3 className="text-lg font-bold text-on-surface leading-snug mb-1 group-hover:text-primary transition-colors duration-300 line-clamp-2">
                      {course.title}
                    </h3>
                    <p className="text-sm text-on-surface-variant/80 mb-2">{course.class || 'Class'}</p>
                    
                    <div className="mt-auto flex items-center justify-end pt-2">
                      <div className="flex items-center gap-1 text-sm font-bold opacity-0 group-hover:opacity-100 transition-all duration-300 -translate-x-2 group-hover:translate-x-0" style={{ color }}>
                        <span>Open</span>
                        <IconArrowRight size={16} stroke={2} />
                      </div>
                    </div>
                  </div>
                </div>
              );
            }) : (
              <div className="w-full py-12 flex flex-col items-center justify-center text-center text-on-surface-variant opacity-60">
                <IconBook2 size={32} className="mb-3" />
                <p>No courses found for selected filters.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
