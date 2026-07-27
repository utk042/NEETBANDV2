import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { IconBookmark, IconCheck, IconArrowLeft, IconArrowRight, IconSend, IconAlertCircle, IconClock } from '@tabler/icons-react';
import { submitQuiz } from '../../services/api';

const checkBlankAnswer = (userAns, correctText) => {
  const u = (userAns || '').toString().trim().toLowerCase();
  if (!u) return false;
  const cArr = (correctText || '').toString().split('/').map(s => s.trim().toLowerCase()).filter(Boolean);
  return cArr.includes(u);
};

const parseDurationSeconds = (val) => {
  if (val === undefined || val === null) return 60 * 60;
  const numStr = String(val).replace(/\D+/g, '');
  const parsed = parseInt(numStr, 10);
  return (!isNaN(parsed) && parsed > 0) ? parsed * 60 : 60 * 60;
};

const formatTime = (seconds) => {
  if (isNaN(seconds) || seconds <= 0) return '00:00';
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  if (hrs > 0) {
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export default React.memo(function QuizViewer({ activeDetails, onRetryFallback }) {
  const navigate = useNavigate();

  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [currentQuizQuestionIdx, setCurrentQuizQuestionIdx] = useState(0);
  const [markedForReview, setMarkedForReview] = useState({});
  
  // Timer & Submission modal states
  const totalQuestions = activeDetails?.questions?.length || 0;
  const customMins = activeDetails?.timeLimit || activeDetails?.duration || activeDetails?.timerMinutes;
  const defaultDuration = parseDurationSeconds(customMins);

  const [timeLeft, setTimeLeft] = useState(defaultDuration);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [isAutoSubmitted, setIsAutoSubmitted] = useState(false);

  // Keep a ref to quizAnswers to avoid stale closures in timer auto-submit
  const quizAnswersRef = useRef(quizAnswers);
  useEffect(() => {
    quizAnswersRef.current = quizAnswers;
  }, [quizAnswers]);

  // Unique identifier for quiz to prevent unnecessary timer/state resets on parent re-renders
  const quizKey = activeDetails?._id || activeDetails?.id || activeDetails?.title || (activeDetails?.questions?.length ? `q_len_${activeDetails.questions.length}` : null);

  useEffect(() => {
    setQuizAnswers({});
    setQuizSubmitted(false);
    setQuizScore(0);
    setCurrentQuizQuestionIdx(0);
    setMarkedForReview({});
    setShowSubmitModal(false);
    setIsAutoSubmitted(false);

    const initialMins = activeDetails?.timeLimit || activeDetails?.duration || activeDetails?.timerMinutes;
    setTimeLeft(parseDurationSeconds(initialMins));
  }, [quizKey]);

  const handleFinalSubmit = useCallback((autoSubmit = false) => {
    let score = 0;
    const currentAnswers = quizAnswersRef.current;
    const answersList = [];

    (activeDetails?.questions || []).forEach((qObj, idx) => {
      let isCorrect = false;
      if (qObj.type === 'fill_in_the_blanks') {
        isCorrect = checkBlankAnswer(currentAnswers[idx], qObj.correctText);
      } else {
        isCorrect = (currentAnswers[idx] === qObj.correctIndex);
      }
      if (isCorrect) score++;

      answersList.push({
        questionId: qObj._id || idx,
        userAnswer: currentAnswers[idx] !== undefined ? currentAnswers[idx] : ''
      });
    });

    setQuizScore(score);
    setQuizSubmitted(true);
    setShowSubmitModal(false);
    if (autoSubmit) setIsAutoSubmitted(true);

    const quizId = activeDetails?._id || activeDetails?.quizId || activeDetails?.itemId;
    if (quizId && answersList.length > 0) {
      submitQuiz(quizId, answersList).catch(err => {
        console.warn("Quiz submission status:", err);
      });
    }
  }, [activeDetails]);

  // Stable Countdown timer logic without stale closure bug
  useEffect(() => {
    if (quizSubmitted) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleFinalSubmit(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [quizSubmitted, handleFinalSubmit]);

  if (!activeDetails?.questions || activeDetails.questions.length === 0) {
    return (
      <div className="text-center py-10 border border-dashed border-outline/20 rounded-xl">
        <IconAlertCircle className="mx-auto text-on-surface-variant/40 mb-2" size={24} />
        <p className="text-sm text-on-surface-variant">This quiz has no questions yet.</p>
      </div>
    );
  }

  // Ensure index is within safe bounds
  const currentIdx = Math.min(Math.max(0, currentQuizQuestionIdx), activeDetails.questions.length - 1);
  const q = activeDetails.questions[currentIdx];

  if (!q) {
    return (
      <div className="text-center py-10 border border-dashed border-outline/20 rounded-xl">
        <IconAlertCircle className="mx-auto text-on-surface-variant/40 mb-2" size={24} />
        <p className="text-sm text-on-surface-variant">Question unavailable.</p>
      </div>
    );
  }

  const answeredCount = Object.keys(quizAnswers).filter(k => quizAnswers[k] !== undefined && quizAnswers[k] !== '').length;
  const unansweredCount = activeDetails.questions.length - answeredCount;
  const markedCount = Object.keys(markedForReview).filter(k => markedForReview[k]).length;

  const renderPaletteButtons = () => {
    return activeDetails.questions.map((_, qIdx) => {
      const isActive = qIdx === currentIdx;
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
        if (qObj?.type === 'fill_in_the_blanks') {
          correct = checkBlankAnswer(quizAnswers[qIdx], qObj.correctText);
        } else {
          correct = quizAnswers[qIdx] === qObj?.correctIndex;
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

  const selectedOpt = quizAnswers[currentIdx];

  return (
    <div className="flex flex-col lg:flex-row gap-6 items-start relative">
      {/* Submit Confirmation Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-surface-container-high border border-outline-variant/30 text-on-surface rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3 border-b border-outline-variant/20 pb-3">
              <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0">
                <IconSend size={22} />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-on-surface">Submit Quiz?</h3>
                <p className="text-xs text-on-surface-variant">Are you sure you want to finish and submit now?</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 py-2 text-center">
              <div className="bg-surface-container/60 p-3 rounded-xl border border-outline-variant/10">
                <div className="text-lg font-extrabold text-emerald-400">{answeredCount}</div>
                <div className="text-[10px] text-on-surface-variant font-medium">Answered</div>
              </div>
              <div className="bg-surface-container/60 p-3 rounded-xl border border-outline-variant/10">
                <div className="text-lg font-extrabold text-rose-400">{unansweredCount}</div>
                <div className="text-[10px] text-on-surface-variant font-medium">Unanswered</div>
              </div>
              <div className="bg-surface-container/60 p-3 rounded-xl border border-outline-variant/10">
                <div className="text-lg font-extrabold text-purple-400">{markedCount}</div>
                <div className="text-[10px] text-on-surface-variant font-medium">For Review</div>
              </div>
            </div>

            {unansweredCount > 0 && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-start gap-2">
                <IconAlertCircle size={16} className="shrink-0 mt-0.5" />
                <span>You still have <strong>{unansweredCount}</strong> unanswered question{unansweredCount > 1 ? 's' : ''}. They will be scored as zero if submitted.</span>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowSubmitModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-outline-variant/30 text-on-surface-variant hover:bg-surface-container-highest/50 font-bold text-xs transition-all"
              >
                Continue Quiz
              </button>
              <button
                onClick={() => handleFinalSubmit(false)}
                className="flex-1 py-2.5 rounded-xl bg-amber-500 text-black font-extrabold text-xs hover:brightness-105 active:scale-95 transition-all shadow-md flex items-center justify-center gap-1.5"
              >
                <IconSend size={14} /> Confirm & Submit
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 w-full space-y-4">
        {quizSubmitted && (
          <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-center">
            <p className="text-base font-bold text-on-surface">
              {isAutoSubmitted ? "Time's Up! Quiz Auto-Submitted" : 'Quiz Completed!'}
            </p>
            <p className="text-xs text-on-surface-variant mt-1">
              You scored <span className="font-extrabold text-amber-400">{quizScore}</span> out of <span className="font-bold">{activeDetails.questions.length}</span>
            </p>
            <button
              onClick={() => {
                setQuizAnswers({});
                setQuizSubmitted(false);
                setQuizScore(0);
                setCurrentQuizQuestionIdx(0);
                setMarkedForReview({});
                setTimeLeft(defaultDuration);
                setIsAutoSubmitted(false);
                if (onRetryFallback) onRetryFallback();
              }}
              className="mt-3 px-4 py-2 rounded-xl bg-amber-500 text-black font-bold text-xs hover:brightness-105 active:scale-95 transition-all shadow-sm"
            >
              Retry Quiz
            </button>
          </div>
        )}

        <div className="flex flex-col gap-3 lg:hidden">
          <div className="flex items-center justify-between">
            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold border transition-all ${
              quizSubmitted 
                ? 'bg-surface-container/50 border-outline-variant/20 text-on-surface-variant'
                : timeLeft < 60
                ? 'bg-rose-500/20 border-rose-500/50 text-rose-400 animate-pulse'
                : timeLeft < 300
                ? 'bg-amber-500/20 border-amber-500/40 text-amber-400'
                : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
            }`}>
              <IconClock size={14} className={!quizSubmitted && timeLeft < 60 ? 'animate-spin' : ''} />
              <span>{quizSubmitted ? 'Time Up' : formatTime(timeLeft)}</span>
            </div>

            {!quizSubmitted && (
              <button
                onClick={() => setShowSubmitModal(true)}
                className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 font-extrabold text-xs flex items-center gap-1 hover:bg-amber-500 hover:text-black transition-all"
              >
                <IconSend size={12} /> Submit
              </button>
            )}
          </div>
          <div className="grid grid-cols-5 sm:grid-cols-8 gap-2 max-h-36 overflow-y-auto p-1 pr-1.5 scrollbar-thin">
            {renderPaletteButtons()}
          </div>
        </div>

        <div className="p-4 sm:p-6 rounded-2xl border border-outline/10 bg-surface-container-low/50 space-y-4">
          <div className="flex items-center justify-between border-b border-outline/5 pb-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full font-mono">
                Question {currentIdx + 1} of {activeDetails.questions.length}
              </span>
              {markedForReview[currentIdx] && (
                <span className="text-[10px] font-bold text-purple-400 bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded-md flex items-center gap-1">
                  <IconBookmark size={10} className="fill-current" /> Marked for Review
                </span>
              )}
            </div>

            {/* Desktop Timer Pill */}
            <div className={`hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold border transition-all ${
              quizSubmitted 
                ? 'bg-surface-container/50 border-outline-variant/20 text-on-surface-variant'
                : timeLeft < 60
                ? 'bg-rose-500/20 border-rose-500/50 text-rose-400 animate-pulse'
                : timeLeft < 300
                ? 'bg-amber-500/20 border-amber-500/40 text-amber-400'
                : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
            }`}>
              <IconClock size={14} className={!quizSubmitted && timeLeft < 60 ? 'animate-spin' : ''} />
              <span>{quizSubmitted ? 'Completed' : formatTime(timeLeft)}</span>
            </div>
          </div>

          <p className="text-sm sm:text-base font-bold text-on-surface leading-relaxed">
            {q.question}
          </p>

          <div className="space-y-2.5 pt-2">
            {q.type === 'fill_in_the_blanks' ? (
              <div className="pt-2 space-y-2">
                <input 
                  type="text" 
                  placeholder="Type your answer here..."
                  disabled={quizSubmitted}
                  value={quizAnswers[currentIdx] || ''}
                  onChange={(e) => setQuizAnswers(prev => ({ ...prev, [currentIdx]: e.target.value }))}
                  className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 bg-background transition-colors ${
                    quizSubmitted 
                      ? (checkBlankAnswer(quizAnswers[currentIdx], q.correctText) ? 'border-emerald-500 text-emerald-400 bg-emerald-500/10 focus:ring-0' : 'border-rose-500 text-rose-400 bg-rose-500/10 focus:ring-0')
                      : 'border-outline-variant/30 text-on-surface focus:ring-amber-500/30 focus:border-amber-500/40'
                  }`}
                />
                {quizSubmitted && (
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    {checkBlankAnswer(quizAnswers[currentIdx], q.correctText) ? (
                      <span className="text-emerald-400 text-xs font-bold bg-emerald-500/10 px-3 py-2 rounded-lg border border-emerald-500/20 flex items-center gap-1.5">
                        <IconCheck size={14} /> Correct Answer: <span className="font-semibold">{q.correctText}</span>
                      </span>
                    ) : (
                      <>
                        <span className="text-rose-400 text-xs font-bold bg-rose-500/10 px-3 py-2 rounded-lg border border-rose-500/20">
                          Your Answer: <span className="font-semibold">{quizAnswers[currentIdx]?.trim() || '(Not Answered / Blank)'}</span>
                        </span>
                        <span className="text-emerald-400 text-xs font-bold bg-emerald-500/10 px-3 py-2 rounded-lg border border-emerald-500/20 flex items-center gap-1.5">
                          <IconCheck size={14} /> Correct Answer: <span className="font-semibold">{q.correctText}</span>
                        </span>
                      </>
                    )}
                  </div>
                )}
              </div>
            ) : (
              (q.options || []).map((opt, oIdx) => {
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
                    onClick={() => setQuizAnswers(prev => ({ ...prev, [currentIdx]: oIdx }))}
                    className={`w-full text-left px-4 py-3 rounded-xl border text-xs sm:text-sm transition-all duration-150 flex items-center justify-between ${btnStyle}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${indexStyle}`}>
                        {String.fromCharCode(65 + oIdx)}
                      </span>
                      <span>{opt}</span>
                    </div>
                    {quizSubmitted && (
                      <div className="flex items-center gap-2 shrink-0">
                        {isSelected && oIdx === q.correctIndex && (
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                            <IconCheck size={12} /> Your Choice (Correct)
                          </span>
                        )}
                        {isSelected && oIdx !== q.correctIndex && (
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-400 border border-rose-500/30">
                            Your Choice
                          </span>
                        )}
                        {!isSelected && oIdx === q.correctIndex && (
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                            <IconCheck size={12} /> Correct Answer
                          </span>
                        )}
                      </div>
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
                      [currentIdx]: !prev[currentIdx]
                    }));
                  }}
                  className={`px-3 py-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all shrink-0 ${
                    markedForReview[currentIdx]
                      ? 'bg-purple-500/10 border-purple-500/30 text-purple-400'
                      : 'border-outline-variant/30 text-on-surface-variant hover:border-outline-variant hover:text-on-surface'
                  }`}
                >
                  <IconBookmark size={14} className={markedForReview[currentIdx] ? 'fill-current' : ''} />
                  {markedForReview[currentIdx] ? 'Marked' : 'Mark Review'}
                </button>
                <button
                  onClick={() => {
                    setQuizAnswers(prev => {
                      const copy = { ...prev };
                      delete copy[currentIdx];
                      return copy;
                    });
                  }}
                  disabled={quizAnswers[currentIdx] === undefined || quizAnswers[currentIdx] === ''}
                  className="px-3 py-2 rounded-xl border border-outline-variant/30 text-on-surface-variant hover:border-outline-variant hover:text-on-surface text-xs font-bold transition-all disabled:opacity-30 disabled:cursor-not-allowed shrink-0"
                >
                  Clear Response
                </button>
              </>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
            <button
              onClick={() => setCurrentQuizQuestionIdx(prev => Math.max(0, prev - 1))}
              disabled={currentIdx === 0}
              className="px-4 py-2 rounded-xl border border-outline-variant/30 text-on-surface-variant hover:border-outline-variant hover:text-on-surface text-xs font-bold flex items-center gap-1 transition-all disabled:opacity-30 disabled:cursor-not-allowed shrink-0"
            >
              <IconArrowLeft size={14} /> Prev
            </button>

            {!quizSubmitted && (
              <button
                onClick={() => setShowSubmitModal(true)}
                className="px-4 py-2 rounded-xl bg-amber-500 text-black text-xs font-extrabold flex items-center gap-1.5 hover:brightness-105 active:scale-95 transition-all shadow-[0_4px_12px_rgba(201,162,39,0.2)] shrink-0"
              >
                <IconSend size={14} /> Submit Quiz
              </button>
            )}

            {currentIdx < activeDetails.questions.length - 1 && (
              <button
                onClick={() => setCurrentQuizQuestionIdx(prev => prev + 1)}
                className="px-4 py-2 rounded-xl bg-surface-variant hover:bg-surface-container-highest text-on-surface text-xs font-bold flex items-center gap-1 transition-all shrink-0"
              >
                Next <IconArrowRight size={14} />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="hidden lg:flex flex-col w-full lg:w-56 shrink-0 rounded-2xl border border-outline/10 bg-surface-container-low/30 p-4 max-h-[calc(100vh-220px)] sticky top-4">
        <div className="flex items-center justify-between border-b border-outline/5 pb-2 mb-3 shrink-0">
          <span className="text-xs font-extrabold text-on-surface uppercase tracking-wider">Question Palette</span>
          <span className="text-[10px] font-bold text-on-surface-variant bg-surface-container px-2 py-0.5 rounded-md font-mono">
            {Object.keys(quizAnswers).length}/{activeDetails.questions.length}
          </span>
        </div>

        <div className="grid grid-cols-5 gap-2.5 overflow-y-auto max-h-[340px] p-1 pr-1.5 scrollbar-thin flex-1">
          {renderPaletteButtons()}
        </div>

        {!quizSubmitted && (
          <button
            onClick={() => setShowSubmitModal(true)}
            className="w-full py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500 text-amber-400 hover:text-black font-extrabold text-xs transition-all flex items-center justify-center gap-1.5 shadow-sm mt-4 shrink-0"
          >
            <IconSend size={14} /> Submit Quiz
          </button>
        )}
      </div>
    </div>
  );
});
