import React, { useState, useEffect } from 'react';
import { IconAlertCircle, IconArrowLeft, IconArrowRight } from '@tabler/icons-react';

export default React.memo(function FlashcardViewer({ activeDetails }) {
  const [flashcardIdx, setFlashcardIdx] = useState(0);
  const [flashcardFlipped, setFlashcardFlipped] = useState(false);

  useEffect(() => {
    setFlashcardIdx(0);
    setFlashcardFlipped(false);
  }, [activeDetails]);

  if (!activeDetails?.qas || activeDetails.qas.length === 0) {
    return (
      <div className="text-center py-10 border border-dashed border-outline/20 rounded-xl">
        <IconAlertCircle className="mx-auto text-on-surface-variant/40 mb-2" size={24} />
        <p className="text-sm text-on-surface-variant">This Q&amp;A has no content yet.</p>
      </div>
    );
  }

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
              borderLeftColor: 'rgb(var(--color-info))',
              borderLeftWidth: '3px',
            }}
          >
            <span style={{
              position: 'absolute', top: '14px', right: '14px',
              fontSize: '10px', fontWeight: 600, letterSpacing: '0.06em',
              color: 'rgb(var(--color-info))', opacity: 0.7,
              padding: '2px 8px', borderRadius: '9999px',
              border: '1px solid rgb(var(--color-info) / 0.2)',
              background: 'rgb(var(--color-info) / 0.07)',
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
              borderLeftColor: 'rgb(var(--color-success))',
              borderLeftWidth: '3px',
              transform: 'rotateY(180deg)',
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
            }}
          >
            <span style={{
              position: 'absolute', top: '14px', right: '14px',
              fontSize: '10px', fontWeight: 600, letterSpacing: '0.06em',
              color: 'rgb(var(--color-success))', opacity: 0.7,
              padding: '2px 8px', borderRadius: '9999px',
              border: '1px solid rgb(var(--color-success) / 0.2)',
              background: 'rgb(var(--color-success) / 0.07)',
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
    </div>
  );
});
