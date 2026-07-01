import React, { useState, useEffect } from 'react';
import { 
  IconBook2, 
  IconClockHour4, 
  IconSend,
  IconBookmark,
  IconChevronLeft,
  IconChevronRight
} from '@tabler/icons-react';
import MockTestResult from './MockTestResult';

// Mock Data
const MOCK_QUESTIONS = [
  {
    id: 1,
    section: 'Physics',
    text: 'A particle is projected with a velocity v so that its horizontal range is twice the maximum height attained. The horizontal range is:',
    options: [
      { id: 'A', text: 'v² / g' },
      { id: 'B', text: '8v² / 5g' },
      { id: 'C', text: '4v² / 5g' },
      { id: 'D', text: 'v² / 2g' }
    ],
    correctAnswer: 'A',
    explanation: 'Planck constant (<i>h</i>) = <sup>Energy</sup>&frasl;<sub>Frequency</sub> = <sup>[ML²T⁻²]</sup>&frasl;<sub>[T⁻¹]</sub> = [ML²T⁻¹]. Angular Momentum (<i>L</i>) = <i>mvr</i> = [M][LT⁻¹][L] = [ML²T⁻¹].'
  },
  {
    id: 2,
    section: 'Physics',
    text: 'The kinetic energy of a body of mass 2kg and momentum of 2 Ns is:',
    options: [
      { id: 'A', text: '1 J' },
      { id: 'B', text: '2 J' },
      { id: 'C', text: '3 J' },
      { id: 'D', text: '4 J' }
    ],
    correctAnswer: 'B'
  },
  {
    id: 3,
    section: 'Chemistry',
    text: 'Which of the following has maximum number of molecules?',
    options: [
      { id: 'A', text: '7g N₂' },
      { id: 'B', text: '2g H₂' },
      { id: 'C', text: '16g NO₂' },
      { id: 'D', text: '16g O₂' }
    ],
    correctAnswer: 'A'
  },
  {
    id: 4,
    section: 'Chemistry',
    text: 'The oxidation state of Cr in K₂Cr₂O₇ is:',
    options: [
      { id: 'A', text: '+6' },
      { id: 'B', text: '+4' },
      { id: 'C', text: '+2' },
      { id: 'D', text: '+7' }
    ],
    correctAnswer: 'A'
  },
  {
    id: 5,
    section: 'Math',
    text: 'The value of ∫₀^(π/2) sin(x) dx is:',
    options: [
      { id: 'A', text: '0' },
      { id: 'B', text: '1' },
      { id: 'C', text: '-1' },
      { id: 'D', text: 'π/2' }
    ],
    correctAnswer: 'B'
  }
];

const MockTest = ({ onExit }) => {
  const [currentSection, setCurrentSection] = useState('Physics');
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(3 * 60 * 60 - 19); // 02:59:41
  
  // State: { questionId: { selectedOption: string | null, status: 'answered' | 'not-answered' | 'not-visited' | 'marked' } }
  const [userAnswers, setUserAnswers] = useState(() => {
    const initial = {};
    MOCK_QUESTIONS.forEach((q, i) => {
      initial[q.id] = { selectedOption: null, status: i === 0 ? 'not-answered' : 'not-visited' };
    });
    return initial;
  });

  const [paletteFilter, setPaletteFilter] = useState('All'); // 'All', 'Marked', 'Bookmarked' (treat Bookmarked as Marked for now)
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Format time (HH:MM:SS)
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => prev > 0 ? prev - 1 : 0);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const sections = ['Physics', 'Chemistry', 'Math'];
  const currentQuestion = MOCK_QUESTIONS[currentQuestionIdx];
  const currentState = userAnswers[currentQuestion.id];

  // Navigation Logic
  const goToQuestion = (index) => {
    // Before leaving current question, update its status if it's currently just 'not-answered' and an option was selected
    setUserAnswers(prev => {
      const current = prev[currentQuestion.id];
      const nextState = { ...prev };
      
      // If they selected something but it was marked as not-answered, it becomes answered
      if (current.selectedOption && current.status === 'not-answered') {
        nextState[currentQuestion.id] = { ...current, status: 'answered' };
      }
      // If we visit a new question, mark it not-answered (instead of not-visited)
      const nextQ = MOCK_QUESTIONS[index];
      if (nextState[nextQ.id].status === 'not-visited') {
        nextState[nextQ.id] = { ...nextState[nextQ.id], status: 'not-answered' };
      }
      return nextState;
    });

    setCurrentQuestionIdx(index);
    setCurrentSection(MOCK_QUESTIONS[index].section);
  };

  const handleNext = () => {
    if (currentQuestionIdx < MOCK_QUESTIONS.length - 1) {
      goToQuestion(currentQuestionIdx + 1);
    }
  };

  const handlePrev = () => {
    if (currentQuestionIdx > 0) {
      goToQuestion(currentQuestionIdx - 1);
    }
  };

  const handleOptionSelect = (optionId) => {
    setUserAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: {
        ...prev[currentQuestion.id],
        selectedOption: optionId,
        status: prev[currentQuestion.id].status === 'marked' ? 'marked' : 'answered' // Keep marked if marked, else answered
      }
    }));
  };

  const clearResponse = () => {
    setUserAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: {
        ...prev[currentQuestion.id],
        selectedOption: null,
        status: 'not-answered'
      }
    }));
  };

  const toggleMarkReview = () => {
    setUserAnswers(prev => {
      const st = prev[currentQuestion.id].status;
      return {
        ...prev,
        [currentQuestion.id]: {
          ...prev[currentQuestion.id],
          status: st === 'marked' ? (prev[currentQuestion.id].selectedOption ? 'answered' : 'not-answered') : 'marked'
        }
      };
    });
  };

  const submitTest = () => {
    setIsSubmitModalOpen(true);
  };

  // Filter palette questions
  const filteredQuestions = MOCK_QUESTIONS.filter(q => {
    if (paletteFilter === 'All') return true;
    if (paletteFilter === 'Marked') return userAnswers[q.id].status === 'marked';
    return true; // fallback
  });

  // Calculate stats for palette header
  const answeredCount = Object.values(userAnswers).filter(s => s.status === 'answered' || (s.status === 'marked' && s.selectedOption)).length;

  if (isSubmitted) {
    const timeTakenSeconds = (3 * 60 * 60 - 19) - timeLeft; // Original time minus remaining time
    return (
      <MockTestResult 
        questions={MOCK_QUESTIONS}
        userAnswers={userAnswers}
        timeTakenSeconds={timeTakenSeconds}
        onRetake={() => {
          setIsSubmitted(false);
          setCurrentQuestionIdx(0);
          setCurrentSection('Physics');
          setTimeLeft(3 * 60 * 60 - 19);
          const initial = {};
          MOCK_QUESTIONS.forEach((q, i) => {
            initial[q.id] = { selectedOption: null, status: i === 0 ? 'not-answered' : 'not-visited' };
          });
          setUserAnswers(initial);
        }}
        onDashboard={() => onExit()}
      />
    );
  }

  return (
    <div className="fixed inset-0 z-[100] bg-background flex flex-col font-sans overflow-hidden">
      
      {/* Top Navbar */}
      <header className="h-16 border-b border-outline/10 bg-surface flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface-variant flex items-center justify-center cursor-pointer transition-colors" onClick={onExit}>
            <IconChevronLeft size={24} />
          </div>
          <div>
            <h1 className="text-sm font-bold text-on-surface">JEE Mains Full Mock Test 1</h1>
            <p className="text-[10px] text-on-surface-variant uppercase tracking-wider font-semibold">Mock Environment</p>
          </div>
        </div>

        <div className="flex bg-surface-container rounded-full p-1">
          {sections.map(section => (
            <button
              key={section}
              onClick={() => {
                setCurrentSection(section);
                // Jump to first question of this section
                const firstIdx = MOCK_QUESTIONS.findIndex(q => q.section === section);
                if (firstIdx !== -1) goToQuestion(firstIdx);
              }}
              className={`px-6 py-1.5 rounded-full text-sm font-semibold transition-colors ${
                currentSection === section 
                  ? 'bg-surface text-on-surface shadow-sm' 
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              {section}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-primary/5 text-primary px-4 py-2 rounded-full font-bold">
            <IconClockHour4 size={18} />
            <span>{formatTime(timeLeft)}</span>
          </div>
          <button 
            onClick={submitTest}
            className="flex items-center gap-2 bg-primary text-on-primary px-5 py-2 rounded-full text-sm font-bold hover:bg-primary/90 transition-colors"
          >
            <IconSend size={16} />
            <span>Submit</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* Left Pane - Question Area */}
        <div className="flex-1 flex flex-col bg-background">
          
          {/* Question Header */}
          <div className="px-8 py-4 flex items-center justify-between bg-surface border-b border-outline/5 shrink-0">
            <div className="flex items-center gap-4">
              <span className="font-bold text-on-surface bg-surface-container px-3 py-1 rounded-md text-sm">
                Question {currentQuestion.id}
              </span>
              <div className="w-px h-4 bg-outline/20"></div>
              <span className="text-primary font-semibold text-sm">
                {currentSection} Section
              </span>
            </div>
            
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 text-xs font-bold text-green-600 bg-green-50 px-2.5 py-1 rounded-full border border-green-200">
                <IconSend size={12} className="rotate-[-45deg]" /> +4 MARKS
              </span>
              <span className="flex items-center gap-1 text-xs font-bold text-red-600 bg-red-50 px-2.5 py-1 rounded-full border border-red-200">
                <IconSend size={12} className="rotate-[135deg]" /> -1 MARK
              </span>
            </div>
          </div>

          {/* Question Content */}
          <div className="flex-1 overflow-y-auto px-8 py-6">
            <div className="bg-surface rounded-2xl border border-outline/10 p-6 shadow-sm mb-6 min-h-[120px]">
              <p className="text-lg text-on-surface mb-4 leading-relaxed whitespace-pre-wrap">
                {currentQuestion.text}
              </p>
            </div>

            <div className="space-y-4">
              {currentQuestion.options.map((opt) => {
                const isSelected = currentState.selectedOption === opt.id;
                return (
                  <label 
                    key={opt.id}
                    className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${
                      isSelected 
                        ? 'border-primary bg-primary/10' 
                        : 'border-outline/10 bg-surface hover:bg-surface-container hover:border-outline/20'
                    }`}
                  >
                    <div className="flex items-center gap-6">
                      <span className={`w-8 h-8 rounded flex items-center justify-center font-bold text-sm ${
                        isSelected ? 'bg-primary/20 text-primary' : 'bg-surface-container text-on-surface-variant'
                      }`}>
                        {opt.id}
                      </span>
                      <span className={`text-lg font-serif italic ${
                        isSelected ? 'text-primary font-bold' : 'text-on-surface'
                      }`}>{opt.text}</span>
                    </div>
                    <input 
                      type="radio" 
                      name={`question-option-${currentQuestion.id}`} 
                      className="w-5 h-5 text-primary border-outline/30 focus:ring-primary"
                      checked={isSelected}
                      onChange={() => handleOptionSelect(opt.id)}
                    />
                  </label>
                )
              })}
            </div>
          </div>

          {/* Question Footer */}
          <div className="px-8 py-4 bg-surface border-t border-outline/10 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-4">
              <button 
                onClick={toggleMarkReview}
                className={`text-sm font-semibold transition-colors flex items-center gap-2 px-3 py-2 rounded-lg ${
                  currentState.status === 'marked' 
                    ? 'bg-purple-100 text-purple-700 hover:bg-purple-200' 
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
                }`}
              >
                <IconBookmark size={20} className={currentState.status === 'marked' ? 'fill-current' : ''} />
                {currentState.status === 'marked' ? 'Unmark Review' : 'Mark Review'}
              </button>
              
              <button 
                onClick={clearResponse}
                disabled={!currentState.selectedOption}
                className="text-sm font-medium text-on-surface-variant hover:text-on-surface transition-colors ml-4 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Clear Response
              </button>
            </div>
            
            <div className="flex items-center gap-3">
              <button 
                onClick={handlePrev}
                disabled={currentQuestionIdx === 0}
                className="flex items-center gap-1 text-sm font-semibold text-on-surface-variant hover:text-on-surface px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <IconChevronLeft size={16} /> Prev
              </button>
              <button 
                onClick={handleNext}
                disabled={currentQuestionIdx === MOCK_QUESTIONS.length - 1}
                className="flex items-center gap-1 bg-primary text-on-primary px-6 py-2 rounded-full text-sm font-bold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next <IconChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Right Pane - Question Palette */}
        <div className="w-80 bg-surface border-l border-outline/10 flex flex-col shrink-0">
          <div className="p-4 border-b border-outline/5 flex items-center justify-between shrink-0">
            <h2 className="font-bold text-on-surface text-lg">Question Palette</h2>
            <span className="text-sm font-semibold text-on-surface-variant">{answeredCount}/{MOCK_QUESTIONS.length}</span>
          </div>

          <div className="px-4 py-3 border-b border-outline/5 flex justify-between shrink-0 gap-1">
            <button 
              onClick={() => setPaletteFilter('All')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-full transition-colors ${paletteFilter === 'All' ? 'bg-surface-container text-on-surface shadow-sm border border-outline/10' : 'text-on-surface-variant hover:bg-surface-container/50'}`}
            >
              All
            </button>
            <button 
              onClick={() => setPaletteFilter('Marked')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-full transition-colors ${paletteFilter === 'Marked' ? 'bg-surface-container text-on-surface shadow-sm border border-outline/10' : 'text-on-surface-variant hover:bg-surface-container/50'}`}
            >
              Marked
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            <div className="grid grid-cols-4 gap-3">
              {filteredQuestions.map((q) => {
                const qIdx = MOCK_QUESTIONS.findIndex(x => x.id === q.id);
                const isCurrent = qIdx === currentQuestionIdx;
                const status = userAnswers[q.id].status;
                const hasAnswer = userAnswers[q.id].selectedOption !== null;
                
                let btnClass = 'bg-surface border-outline/20 text-on-surface hover:border-outline/40';
                
                if (status === 'answered') {
                  btnClass = 'bg-green-100 border-green-300 text-green-700';
                } else if (status === 'not-answered') {
                  btnClass = 'bg-red-50 border-red-300 text-red-600';
                } else if (status === 'marked') {
                  btnClass = hasAnswer 
                    ? 'bg-purple-100 border-purple-500 text-purple-700 relative overflow-hidden' 
                    : 'bg-purple-100 border-purple-300 text-purple-700';
                }

                if (isCurrent) {
                  btnClass += ' ring-2 ring-primary ring-offset-2 dark:ring-offset-[#0f172a]'; // highlight current
                }

                return (
                  <button 
                    key={q.id}
                    onClick={() => goToQuestion(qIdx)}
                    className={`aspect-square rounded-lg flex items-center justify-center font-bold text-sm transition-all border ${btnClass}`}
                  >
                    {q.id}
                    {status === 'marked' && hasAnswer && (
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border border-white"></div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Legend */}
          <div className="p-4 bg-surface-container-low shrink-0 text-xs">
            <div className="grid grid-cols-2 gap-y-3 gap-x-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-400"></div>
                <span className="text-on-surface-variant font-medium">Answered</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-100 border border-red-300"></div>
                <span className="text-on-surface-variant font-medium">Not Answered</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-surface border border-outline/20"></div>
                <span className="text-on-surface-variant font-medium">Not Visited</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-purple-400"></div>
                <span className="text-on-surface-variant font-medium">Marked</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Submit Confirmation Modal */}
      {isSubmitModalOpen && (
        <div className="fixed inset-0 z-[200] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface rounded-2xl shadow-xl w-full max-w-md p-8 animate-in fade-in zoom-in duration-200">
            <h2 className="text-2xl font-bold text-on-surface mb-4">Finish and Submit?</h2>
            <p className="text-on-surface-variant mb-8 text-base leading-relaxed">
              You have answered <span className="font-bold text-primary">{answeredCount}</span> out of <span className="font-bold text-on-surface">{MOCK_QUESTIONS.length}</span> questions. Are you sure you want to end the test now?
            </p>
            <div className="flex items-center gap-3 justify-end">
              <button 
                onClick={() => setIsSubmitModalOpen(false)}
                className="px-5 py-2.5 rounded-xl border border-outline/20 font-bold text-on-surface hover:bg-surface-container transition-colors"
              >
                Keep Working
              </button>
              <button 
                onClick={() => {
                  setIsSubmitModalOpen(false);
                  setIsSubmitted(true);
                }}
                className="px-5 py-2.5 rounded-xl bg-[#dc2626] font-bold text-white hover:bg-[#b91c1c] transition-colors shadow-sm"
              >
                Yes, Submit Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MockTest;
