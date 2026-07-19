import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { IconChevronDown, IconCheck, IconCrown } from '@tabler/icons-react';
import { TYPE_META, getSlugType, getChapterItems, isItemLocked } from './CoursePlayerUtils';

export default React.memo(function CourseLessonSidebar({
  course,
  user,
  completedItems,
  totalItemsCount,
  selectedSubjectIdx,
  selectedChapterIdx,
  selectedItemIdx,
  isSidebarOpen,
  setIsSidebarOpen,
  onUpgradeClick,
}) {
  const navigate = useNavigate();
  
  const [sidebarSubjectIdx, setSidebarSubjectIdx] = useState(0);
  const [expandedChapters, setExpandedChapters] = useState({});

  useEffect(() => {
    if (selectedSubjectIdx !== null && selectedSubjectIdx >= 0) {
      setSidebarSubjectIdx(selectedSubjectIdx);
    }
  }, [selectedSubjectIdx]);

  useEffect(() => {
    if (selectedChapterIdx !== null && selectedChapterIdx >= 0) {
      setExpandedChapters(prev => ({ ...prev, [selectedChapterIdx]: true }));
    }
  }, [selectedChapterIdx, selectedSubjectIdx]);

  return (
    <aside className={`
      absolute lg:static top-0 left-0 h-full w-72 bg-surface-container-low border-r border-outline/10
      flex flex-col z-30 transition-transform duration-300
      ${isSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'}
    `}>
      <div className="p-4 border-b border-outline/10">
        <p className="text-[11px] font-bold uppercase tracking-widest text-on-surface-variant">Course Contents</p>
        <p className="text-xs text-on-surface-variant/60 mt-0.5">{course?.subjects?.length || 0} subjects · {totalItemsCount} items</p>
      </div>
      {/* Subject Tabs */}
      <div className="flex px-2 py-2 overflow-x-auto hide-scrollbar gap-2 border-b border-outline/10 bg-surface-container-low shrink-0">
        {(course?.subjects || []).map((sub, sIdx) => {
          const isSelected = sIdx === sidebarSubjectIdx;
          return (
            <button
              key={sub._id || sIdx}
              onClick={() => setSidebarSubjectIdx(sIdx)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${
                isSelected 
                  ? 'bg-surface-variant text-on-surface' 
                  : 'text-on-surface-variant hover:bg-surface-container-highest'
              }`}
            >
              {sub.title}
            </button>
          );
        })}
      </div>

      <div className="flex-1 overflow-y-auto pb-28 divide-y divide-outline/5">
        {(() => {
          const activeSidebarSubject = course?.subjects?.[sidebarSubjectIdx];
          if (!activeSidebarSubject || !activeSidebarSubject.chapters || activeSidebarSubject.chapters.length === 0) {
            return <div className="p-4 text-xs text-on-surface-variant/50 text-center italic">No content in this subject.</div>;
          }
          return activeSidebarSubject.chapters.map((chapter, cIdx) => {
            return (
              <div key={chapter._id || cIdx} className="bg-surface-container-lowest">
                {/* Sidebar Chapter Header */}
                <button 
                  onClick={() => setExpandedChapters(prev => ({ ...prev, [cIdx]: !prev[cIdx] }))}
                  className="w-full text-left px-4 py-3 bg-surface-container-low/60 flex items-center justify-between hover:bg-surface-container/50 transition-colors"
                >
                  <span className="text-xs font-extrabold text-on-surface truncate pr-2">
                    {chapter.title}
                  </span>
                  <IconChevronDown 
                    size={14} 
                    className={`text-on-surface-variant transition-transform duration-200 ${expandedChapters[cIdx] ? 'rotate-180' : ''}`}
                  />
                </button>

                {/* Sidebar Items list under chapter */}
                {expandedChapters[cIdx] && (
                  <div className="divide-y divide-outline/5 animate-in slide-in-from-top-2 duration-200">
                  {(chapter.items || []).map((subItem, itemIdx) => {
                    const isSelected = sidebarSubjectIdx === selectedSubjectIdx && cIdx === selectedChapterIdx && itemIdx === selectedItemIdx;
                    const m = TYPE_META[subItem.type] || TYPE_META.notes;
                    const MIcon = m.Icon;
                    const locked = isItemLocked(user, course, sidebarSubjectIdx, cIdx, itemIdx);
                    return (
                      <button
                        key={subItem._id || itemIdx}
                        onClick={() => {
                          if (!locked) {
                            navigate(`/course/${course._id}/${getSlugType(subItem.type)}/${sidebarSubjectIdx + 1}/${cIdx + 1}/${itemIdx + 1}`);
                            setIsSidebarOpen(false);
                          } else {
                            onUpgradeClick();
                          }
                        }}
                        className={`w-full text-left flex items-center gap-2.5 px-4 py-2.5 text-xs transition-all border rounded-lg ${
                          isSelected 
                            ? 'bg-primary/15 font-bold border-primary/30 text-on-surface' 
                            : 'border-transparent text-on-surface-variant hover:bg-surface-container/50'
                        }`}
                      >
                        <div className={`w-6 h-6 rounded border flex items-center justify-center shrink-0 ${
                          isSelected ? 'bg-primary/20 border-primary/30 text-primary' : 'bg-surface-container-highest border-outline/10'
                        }`}>
                          <MIcon size={12} stroke={2.5} className={isSelected ? 'text-primary' : m.color} />
                        </div>
                        <span className="truncate flex-1 leading-tight flex items-center gap-1.5">
                          {subItem.title}
                          {locked && <IconCrown size={10} className="text-amber-400/80 shrink-0" />}
                          {!locked && subItem._id && completedItems.includes(subItem._id) && (
                            <IconCheck size={12} className="text-emerald-500 shrink-0 ml-auto" />
                          )}
                        </span>
                        {subItem.duration && (
                          <span className="text-[9px] opacity-60 font-medium shrink-0">{subItem.duration}</span>
                        )}
                      </button>
                    );
                  })}
                  {(!chapter.items || chapter.items.length === 0) && (
                    <div className="px-4 py-2 text-[10px] text-on-surface-variant/40 italic">
                      No items
                    </div>
                  )}
                  </div>
                )}
              </div>
            );
          });
        })()}
      </div>
    </aside>
  );
});
