import React from 'react';
import {
  IconFileText,
  IconMusic,
  IconHelp,
  IconVideo,
  IconMessageQuestion,
  IconBook2,
  IconDna,
  IconAtom,
  IconFlask,
} from '@tabler/icons-react';
import * as TablerIcons from '@tabler/icons-react';

export const TYPE_META = {
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

export const getSubjectIcon = (subjectName) => {
  const sub = SUBJECTS.find(s => s.id.toLowerCase() === (subjectName || '').toLowerCase());
  return sub ? sub.Icon : IconBook2;
};

export function DynamicIcon({ name, fallback: FallbackIcon = IconBook2, size = 24, className }) {
  if (!name) return <FallbackIcon size={size} className={className} />;
  const IconComponent = TablerIcons[name] || FallbackIcon;
  return <IconComponent size={size} className={className} />;
}

export const getSlugType = (type) => {
  if (type === 'qa') return 'flashcards';
  return type;
};

export const getChapterItems = (chapter) => {
  if (!chapter) return [];
  if (chapter.items && chapter.items.length > 0) return chapter.items;
  // Legacy support: if chapter has content fields directly
  if (chapter.fileUrl || chapter.videoUrl || chapter.content || chapter.audioUrl) {
    return [{
      ...chapter,
      type: chapter.type || (chapter.videoUrl ? 'video' : 'notes')
    }];
  }
  return [];
};

export const isItemLocked = (user, course, sIdx, cIdx, iIdx) => {
  if (user?.isPremium) return false;
  const subject = course?.subjects?.[sIdx];
  const chapter = subject?.chapters?.[cIdx];
  const item = getChapterItems(chapter)[iIdx];
  return !!(item?.isPremium || course?.isPremium);
};

export const calculateTotalItems = (course) => {
  return (course?.subjects || []).reduce((acc, sub) => {
    return acc + (sub.chapters || []).reduce((capAcc, cap) => capAcc + getChapterItems(cap).length, 0);
  }, 0);
};
