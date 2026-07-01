import React, { useState } from 'react';
import { 
  IconRefresh, 
  IconArrowRight, 
  IconCheck, 
  IconX, 
  IconMinus,
  IconChevronDown,
  IconChevronUp,
  IconInfoCircle,
  IconChevronLeft
} from '@tabler/icons-react';

export default function MockTestResult({
  questions,
  userAnswers,
  timeTakenSeconds,
  onRetake,
  onDashboard
}) {
  const [mistakesOnly, setMistakesOnly] = useState(false);
  const [expandedQs, setExpandedQs] = useState([]);

  // Calculate Stats
  let correctCount = 0;
  let incorrectCount = 0;
  let skippedCount = 0;
  
  const subjectStats = {
    Physics: { correct: 0, total: 0 },
    Chemistry: { correct: 0, total: 0 },
    Math: { correct: 0, total: 0 }
  };

  questions.forEach(q => {
    subjectStats[q.section].total++;
    const ans = userAnswers[q.id];
    if (ans && ans.selectedOption) {
      if (ans.selectedOption === q.correctAnswer) {
        correctCount++;
        subjectStats[q.section].correct++;
      } else {
        incorrectCount++;
      }
    } else {
      skippedCount++;
    }
  });

  const totalQuestions = questions.length;
  // Assuming 4 marks per correct answer
  const score = correctCount * 4;
  const maxScore = totalQuestions * 4;
  const scorePercent = Math.round((score / maxScore) * 100);
  
  const accuracy = (correctCount + incorrectCount) > 0 
    ? ((correctCount / (correctCount + incorrectCount)) * 100).toFixed(1) 
    : '0.0';

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  };

  const toggleExpand = (id) => {
    setExpandedQs(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const filteredQuestions = mistakesOnly 
    ? questions.filter(q => userAnswers[q.id]?.selectedOption !== q.correctAnswer)
    : questions;

  return (
    <div className="fixed inset-0 z-[100] bg-background flex flex-col font-sans overflow-y-auto">
      {/* Top Back Button */}
      <div className="w-full max-w-5xl mx-auto px-4 md:px-8 pt-6">
        <button 
          onClick={onDashboard}
          className="flex items-center gap-2 text-sm font-bold text-on-surface-variant hover:text-on-surface transition-colors w-fit"
        >
          <IconChevronLeft size={20} /> Back to Course
        </button>
      </div>

      <div className="max-w-5xl mx-auto w-full p-4 md:p-8 pt-4 space-y-6 pb-20">
        
        {/* Top Hero Section */}
        <div className="bg-surface rounded-3xl shadow-sm border border-outline/10 overflow-hidden flex flex-col md:flex-row">
          
          {/* Left Side Info */}
          <div className="flex-1 p-8 flex flex-col justify-between">
            <div>
              <span className="inline-block px-3 py-1 rounded-full text-[10px] font-bold text-primary bg-primary/10 tracking-wider uppercase mb-6">
                Final Report
              </span>
              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-6xl font-black text-on-surface leading-none">{score}</span>
                <span className="text-3xl font-bold text-on-surface-variant/40">/{maxScore}</span>
              </div>
              <h2 className="text-xl font-medium text-on-surface mb-2">
                You've completed <span className="font-bold">JEE Mains Full Mock Test 1</span>
              </h2>
              <p className="text-sm text-on-surface-variant max-w-sm leading-relaxed mb-8">
                Room for growth. Review the detailed solutions to build a stronger foundation.
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <button 
                onClick={onRetake}
                className="flex items-center gap-2 px-6 py-2.5 rounded-full border border-outline/20 text-sm font-bold text-on-surface hover:bg-surface-container transition-colors"
              >
                <IconRefresh size={16} /> Retake
              </button>
              <button 
                onClick={onDashboard}
                className="flex items-center gap-2 bg-primary text-on-primary px-6 py-2.5 rounded-full text-sm font-bold hover:bg-primary/90 transition-colors shadow-sm"
              >
                Dashboard <IconArrowRight size={16} />
              </button>
            </div>
          </div>

          {/* Right Side Chart */}
          <div className="flex-1 bg-surface-container-highest p-8 flex items-center justify-center relative min-h-[300px]">
            {/* Simple CSS donut chart representation */}
            <div className="relative w-48 h-48 rounded-full flex items-center justify-center bg-surface-container-highest" 
                 style={{ 
                   background: `conic-gradient(#10B981 ${scorePercent}%, #EF4444 ${scorePercent}% 100%)` 
                 }}>
              <div className="absolute inset-4 rounded-full bg-surface-container-highest flex flex-col items-center justify-center">
                <span className="text-4xl font-bold text-on-surface">{scorePercent}%</span>
                <span className="text-[10px] font-bold text-on-surface-variant tracking-wider uppercase">SCORE</span>
              </div>
            </div>
          </div>
        </div>

        {/* Hero Footer Stats */}
        <div className="bg-surface rounded-2xl shadow-sm border border-outline/10 p-6 flex items-center justify-between divide-x divide-outline/10 text-center">
          <div className="flex-1 flex flex-col">
            <span className="text-[10px] font-bold text-on-surface-variant tracking-wider uppercase mb-1">Time Taken</span>
            <span className="text-lg font-bold text-on-surface">{formatTime(timeTakenSeconds)}</span>
          </div>
          <div className="flex-1 flex flex-col">
            <span className="text-[10px] font-bold text-on-surface-variant tracking-wider uppercase mb-1">Accuracy</span>
            <span className="text-lg font-bold text-on-surface">{accuracy}%</span>
          </div>
          <div className="flex-1 flex flex-col">
            <span className="text-[10px] font-bold text-on-surface-variant tracking-wider uppercase mb-1">Questions</span>
            <span className="text-lg font-bold text-on-surface">{totalQuestions}</span>
          </div>
        </div>

        {/* Middle Section: Leaderboard & Subject Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Leaderboard Card */}
          <div className="bg-surface rounded-2xl shadow-sm border border-outline/10 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-on-surface text-lg">Leaderboard</h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-surface-container text-on-surface-variant">Top 5</span>
            </div>
            
            <div className="space-y-3">
              {[
                { rank: 1, name: 'Aarav Patel', pts: 18 },
                { rank: 2, name: 'Sarah Lee', pts: 18 },
                { rank: 3, name: 'Rahul Singh', pts: 17 },
                { rank: 4, name: 'Emily Chen', pts: 16 },
                { rank: 5, name: 'You (You)', pts: score, isYou: true }
              ].sort((a,b) => b.pts - a.pts).map((user, idx) => (
                <div key={idx} className={`flex items-center justify-between p-3 rounded-xl border ${user.isYou ? 'border-primary/30 bg-primary/5' : 'border-outline/5 bg-surface-container-lowest'}`}>
                  <div className="flex items-center gap-4">
                    <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${idx < 3 ? 'bg-amber-100 text-amber-700' : 'bg-surface-container text-on-surface-variant'}`}>
                      #{idx + 1}
                    </span>
                    <span className={`text-sm font-semibold ${user.isYou ? 'text-primary' : 'text-on-surface'}`}>{user.name}</span>
                  </div>
                  <span className="text-sm font-bold text-on-surface-variant">
                    <span className="text-on-surface">{user.pts}</span> pts
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Subject Breakdown Card */}
          <div className="bg-surface rounded-2xl shadow-sm border border-outline/10 p-6">
            <h3 className="font-bold text-on-surface text-lg mb-6">Subject Breakdown</h3>
            <div className="space-y-6">
              {['Physics', 'Chemistry', 'Math'].map(subject => {
                const stats = subjectStats[subject];
                const pct = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;
                return (
                  <div key={subject}>
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h4 className="text-sm font-bold text-on-surface">{subject}</h4>
                        <p className="text-[10px] text-on-surface-variant">{stats.correct}/{stats.total} Correct</p>
                      </div>
                      <span className="text-sm font-bold text-primary">{pct}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-surface-container overflow-hidden">
                      <div className="h-full bg-amber-400 rounded-full" style={{ width: `${pct}%` }}></div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-green-500/10 dark:bg-green-500/20 rounded-2xl border border-green-500/30 dark:border-green-500/20 p-5 relative overflow-hidden">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center">
                <IconCheck size={14} />
              </div>
              <span className="text-xs font-bold text-green-700 dark:text-green-400 tracking-wider uppercase">Correct</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-black text-on-surface">{correctCount}</span>
            </div>
            <span className="text-xs text-on-surface-variant">Answers</span>
            <div className="absolute bottom-0 left-0 h-1 bg-green-500 w-1/3"></div>
          </div>

          <div className="bg-red-500/10 dark:bg-red-500/20 rounded-2xl border border-red-500/30 dark:border-red-500/20 p-5 relative overflow-hidden">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center">
                <IconX size={14} />
              </div>
              <span className="text-xs font-bold text-red-700 dark:text-red-400 tracking-wider uppercase">Incorrect</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-black text-on-surface">{incorrectCount}</span>
            </div>
            <span className="text-xs text-on-surface-variant">Answers</span>
            <div className="absolute bottom-0 left-0 h-1 bg-red-500 w-2/3"></div>
          </div>

          <div className="bg-surface rounded-2xl border border-outline/10 shadow-sm p-5 relative overflow-hidden">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded-full bg-surface-container-high text-on-surface-variant flex items-center justify-center">
                <IconMinus size={14} />
              </div>
              <span className="text-xs font-bold text-on-surface-variant tracking-wider uppercase">Skipped</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-black text-on-surface">{skippedCount}</span>
            </div>
            <span className="text-xs text-on-surface-variant">Questions</span>
            <div className="absolute bottom-0 left-0 h-1 bg-surface-container-high w-full"></div>
          </div>
        </div>

        {/* Deep Dive Section */}
        <div className="pt-4">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-on-surface">Deep Dive</h3>
              <p className="text-sm text-on-surface-variant">Detailed breakdown of every answer.</p>
            </div>
            <div className="flex items-center gap-3 bg-surface border border-outline/10 px-4 py-2 rounded-full">
              <span className="text-xs font-bold text-on-surface-variant">Filter</span>
              <label className="flex items-center cursor-pointer">
                <div className="relative">
                  <input type="checkbox" className="sr-only" checked={mistakesOnly} onChange={() => setMistakesOnly(!mistakesOnly)} />
                  <div className={`block w-8 h-5 rounded-full transition-colors ${mistakesOnly ? 'bg-primary' : 'bg-surface-container-high'}`}></div>
                  <div className={`dot absolute left-1 top-1 bg-white w-3 h-3 rounded-full transition-transform ${mistakesOnly ? 'transform translate-x-3' : ''}`}></div>
                </div>
                <div className="ml-2 text-xs font-bold text-on-surface">Mistakes Only</div>
              </label>
            </div>
          </div>

          <div className="space-y-3">
            {filteredQuestions.map((q, idx) => {
              const ans = userAnswers[q.id];
              const isAnswered = ans && ans.selectedOption !== null;
              const isCorrect = isAnswered && ans.selectedOption === q.correctAnswer;
              const isExpanded = expandedQs.includes(q.id);

              let badgeClass = "bg-surface-container text-on-surface-variant";
              let badgeText = "SKIPPED";
              
              if (isAnswered) {
                if (isCorrect) {
                  badgeClass = "bg-green-100 text-green-700 border border-green-200";
                  badgeText = "CORRECT";
                } else {
                  badgeClass = "bg-red-50 text-red-600 border border-red-200";
                  badgeText = "INCORRECT";
                }
              }

              return (
                <div key={q.id} className="bg-surface rounded-xl border border-outline/10 shadow-sm overflow-hidden">
                  <div 
                    className="p-4 flex items-center justify-between cursor-pointer hover:bg-surface-container-lowest transition-colors"
                    onClick={() => toggleExpand(q.id)}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-8 h-8 rounded shrink-0 flex items-center justify-center font-bold text-sm ${isAnswered ? (isCorrect ? 'bg-green-100 text-green-700' : 'bg-red-50 text-red-600') : 'bg-surface-container text-on-surface-variant'}`}>
                        {q.id}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${badgeClass}`}>
                            {badgeText}
                          </span>
                          <span className="text-[10px] text-on-surface-variant font-medium">|</span>
                          <span className="text-[10px] text-on-surface-variant font-medium">{q.section}</span>
                        </div>
                        <p className="text-sm font-semibold text-on-surface line-clamp-1">
                          {q.text}
                        </p>
                      </div>
                    </div>
                    <div className="text-on-surface-variant px-2">
                      {isExpanded ? <IconChevronUp size={20} /> : <IconChevronDown size={20} />}
                    </div>
                  </div>
                  
                  {isExpanded && (
                    <div className="p-6 border-t border-outline/5 bg-surface">
                      <h4 className="text-lg font-bold text-on-surface mb-6">{q.text}</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                        {q.options.map(opt => {
                          const isOptSelected = ans?.selectedOption === opt.id;
                          const isOptCorrect = opt.id === q.correctAnswer;
                          
                          let optClass = "border-outline/10 bg-surface-container-lowest hover:border-outline/30 text-on-surface-variant";
                          let badgeClass = "bg-surface-container text-on-surface-variant";
                          
                          if (isOptCorrect) {
                            optClass = "border-green-500/50 bg-green-500/10 dark:bg-green-500/20 text-green-700 dark:text-green-400 shadow-[0_0_0_1px_rgba(34,197,94,0.5)]";
                            badgeClass = "bg-green-500 text-white";
                          } else if (isOptSelected && !isOptCorrect) {
                            optClass = "border-red-500/50 bg-red-500/10 dark:bg-red-500/20 text-red-700 dark:text-red-400 shadow-[0_0_0_1px_rgba(239,68,68,0.5)]";
                            badgeClass = "bg-red-500 text-white";
                          }
                          
                          return (
                            <div key={opt.id} className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${optClass}`}>
                              <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${badgeClass}`}>
                                {opt.id}
                              </span>
                              <span className={`text-sm font-semibold flex-1 ${isOptCorrect || isOptSelected ? 'text-inherit' : 'text-on-surface-variant'}`}>{opt.text}</span>
                            </div>
                          )
                        })}
                      </div>

                      {q.explanation && (
                        <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6">
                          <div className="flex items-center gap-2 text-primary mb-4">
                            <IconInfoCircle size={18} />
                            <span className="text-xs font-bold tracking-widest uppercase">EXPLANATION</span>
                          </div>
                          <div className="text-sm text-on-surface-variant leading-relaxed">
                            <div dangerouslySetInnerHTML={{ __html: q.explanation }} />
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
