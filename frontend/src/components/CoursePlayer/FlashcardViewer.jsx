import React, { useState, useEffect, useRef } from 'react';
import { 
  IconAlertCircle, 
  IconArrowLeft, 
  IconArrowRight, 
  IconCheck
} from '@tabler/icons-react';
import MathMarkdownContent from './MathMarkdownContent';

export default React.memo(function FlashcardViewer({ activeDetails }) {
  const [flashcardIdx, setFlashcardIdx] = useState(0);
  const [flashcardFlipped, setFlashcardFlipped] = useState(false);
  const [mastered, setMastered] = useState({});
  const touchStartX = useRef(null);

  useEffect(() => {
    setFlashcardIdx(0);
    setFlashcardFlipped(false);
    setMastered({});
  }, [activeDetails]);

  if (!activeDetails?.qas || activeDetails.qas.length === 0) {
    return (
      <div className="text-center py-12 px-4 border border-dashed border-outline/20 rounded-2xl bg-surface-container-low/50">
        <IconAlertCircle className="mx-auto text-on-surface-variant/40 mb-3" size={32} />
        <p className="text-sm font-semibold text-on-surface">No Q&amp;As Available</p>
        <p className="text-xs text-on-surface-variant/60 mt-1">This flashcard deck has no questions added yet.</p>
      </div>
    );
  }

  const qas = activeDetails.qas;
  const total = qas.length;
  const pair = qas[flashcardIdx];
  const isMastered = !!mastered[flashcardIdx];

  const goNext = (e) => {
    e?.stopPropagation();
    if (flashcardIdx < total - 1) {
      setFlashcardFlipped(false);
      setTimeout(() => setFlashcardIdx(i => Math.min(i + 1, total - 1)), 60);
    }
  };

  const goPrev = (e) => {
    e?.stopPropagation();
    if (flashcardIdx > 0) {
      setFlashcardFlipped(false);
      setTimeout(() => setFlashcardIdx(i => Math.max(i - 1, 0)), 60);
    }
  };

  const toggleMastered = (e) => {
    e?.stopPropagation();
    setMastered(prev => ({ ...prev, [flashcardIdx]: !prev[flashcardIdx] }));
  };

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const diffX = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(diffX) > 40) {
      if (diffX < 0) goNext();
      else goPrev();
    }
    touchStartX.current = null;
  };

  const masteredCount = Object.values(mastered).filter(Boolean).length;

  return (
    <div
      onKeyDown={(e) => {
        if (e.key === 'ArrowRight') goNext();
        else if (e.key === 'ArrowLeft') goPrev();
        else if (e.key === ' ') { e.preventDefault(); setFlashcardFlipped(f => !f); }
      }}
      tabIndex={0}
      className="outline-none max-w-2xl mx-auto w-full flex flex-col select-none"
      aria-label="Flashcard viewer"
    >
      {/* Progress & Deck Status Bar */}
      <div className="mb-3 space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold text-on-surface-variant">
          <div className="flex items-center gap-2">
            <span className="text-primary font-mono font-bold tracking-wider">CARD {flashcardIdx + 1} OF {total}</span>
            {masteredCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px]">
                {masteredCount} Mastered
              </span>
            )}
          </div>
          <button
            onClick={toggleMastered}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all flex items-center gap-1.5 active:scale-95 ${
              isMastered
                ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400'
                : 'bg-surface-container-high/60 border-outline/10 text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <IconCheck size={13} className={isMastered ? 'opacity-100' : 'opacity-40'} />
            {isMastered ? 'Learned' : 'Mark Learned'}
          </button>
        </div>

        {/* Segmented Progress Line */}
        <div className="flex gap-1" aria-hidden="true">
          {qas.map((_, i) => (
            <button
              key={i}
              className={`fc-seg${i === flashcardIdx ? ' active' : i < flashcardIdx ? ' done' : ''}${mastered[i] ? ' mastered' : ''}`}
              onClick={(e) => { e.stopPropagation(); setFlashcardFlipped(false); setFlashcardIdx(i); }}
              tabIndex={-1}
              aria-label={`Go to card ${i + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Main Flashcard Scene */}
      <div className="relative">
        {/* Flashcard 3D Scene */}
        <div 
          className="flashcard-scene"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <div
            className={`flashcard-card${flashcardFlipped ? ' is-flipped' : ''}`}
            onClick={() => setFlashcardFlipped(f => !f)}
            role="button"
            aria-pressed={flashcardFlipped}
            aria-label={flashcardFlipped ? 'Showing answer — tap to see question' : 'Showing question — tap to reveal answer'}
          >
            {/* FRONT — Question */}
            <div className="flashcard-face flashcard-face--front">
              {/* Top Card Badge Header */}
              <div className="w-full flex items-center justify-between mb-3 pb-2 border-b border-outline/10 shrink-0">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                  <span className="text-[11px] font-bold tracking-wider text-indigo-400 uppercase font-mono">
                    QUESTION
                  </span>
                </div>
                <span className="text-[10px] font-mono text-on-surface-variant/50">
                  Tap to flip
                </span>
              </div>

              {/* Question Content */}
              <div className="flex-1 w-full min-h-0 overflow-y-auto show-scrollbar flex flex-col items-center justify-center p-2 text-center">
                <div className="w-full text-center">
                  <MathMarkdownContent content={pair?.question} className="text-center" />
                </div>
              </div>
            </div>

            {/* BACK — Answer */}
            <div className="flashcard-face flashcard-face--back">
              {/* Top Card Badge Header */}
              <div className="w-full flex items-center justify-between mb-3 pb-2 border-b border-outline/10 shrink-0">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span className="text-[11px] font-bold tracking-wider text-emerald-400 uppercase font-mono">
                    ANSWER
                  </span>
                </div>
                <span className="text-[10px] font-mono text-on-surface-variant/50">
                  Tap to flip
                </span>
              </div>

              {/* Answer Content */}
              <div className="flex-1 w-full min-h-0 overflow-y-auto show-scrollbar flex flex-col items-center justify-center p-2 text-center">
                <div className="w-full text-center">
                  <MathMarkdownContent content={pair?.answer} className="text-center" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Compact Navigation Toolbar */}
      <div className="flex items-center justify-between mt-3 px-1">
        <button
          onClick={goPrev}
          disabled={flashcardIdx === 0}
          className="px-4 py-2.5 rounded-xl flex items-center gap-2 text-xs font-semibold bg-surface-container-high/80 border border-outline/10 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
          aria-label="Previous card"
        >
          <IconArrowLeft size={15} stroke={2} />
          <span>Prev</span>
        </button>

        <span className="text-xs font-mono font-semibold text-on-surface-variant/60">
          {flashcardIdx + 1} / {total}
        </span>

        <button
          onClick={goNext}
          disabled={flashcardIdx === total - 1}
          className="px-4 py-2.5 rounded-xl flex items-center gap-2 text-xs font-semibold bg-surface-container-high/80 border border-outline/10 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
          aria-label="Next card"
        >
          <span>Next</span>
          <IconArrowRight size={15} stroke={2} />
        </button>
      </div>
    </div>
  );
});

