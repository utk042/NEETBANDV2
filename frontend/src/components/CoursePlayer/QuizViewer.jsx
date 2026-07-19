import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { IconBookmark, IconCheck, IconArrowLeft, IconArrowRight, IconSend, IconAlertCircle } from '@tabler/icons-react';

export default React.memo(function QuizViewer({ activeDetails, onRetryFallback }) {
  const navigate = useNavigate();

  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [currentQuizQuestionIdx, setCurrentQuizQuestionIdx] = useState(0);
  const [markedForReview, setMarkedForReview] = useState({});

  useEffect(() => {
    setQuizAnswers({});
    setQuizSubmitted(false);
    setQuizScore(0);
    setCurrentQuizQuestionIdx(0);
    setMarkedForReview({});
  }, [activeDetails]);

  if (!activeDetails?.questions || activeDetails.questions.length === 0) {
    return (
      <div className="text-center py-10 border border-dashed border-outline/20 rounded-xl">
        <IconAlertCircle className="mx-auto text-on-surface-variant/40 mb-2" size={24} />
        <p className="text-sm text-on-surface-variant">This quiz has no questions yet.</p>
      </div>
    );
  }

  const renderPaletteButtons = () => {
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

  const q = activeDetails.questions[currentQuizQuestionIdx];
  const selectedOpt = quizAnswers[currentQuizQuestionIdx];

  return (
    <div className="flex flex-col lg:flex-row gap-6 items-start">
      <div className="flex-1 w-full space-y-4">
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
                if (onRetryFallback) onRetryFallback();
                else navigate('/checkout');
                setMarkedForReview({});
              }}
              className="mt-3 px-4 py-2 rounded-xl bg-amber-500 text-black font-bold text-xs hover:brightness-105 active:scale-95 transition-all shadow-sm"
            >
              Retry Quiz
            </button>
          </div>
        )}

        <div className="flex flex-wrap gap-3 lg:hidden">
          {renderPaletteButtons()}
        </div>

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
  );
});
