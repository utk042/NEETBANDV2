import React, { useState, useEffect } from 'react';
import {
  IconX, IconPlus, IconTrash, IconBook2,
  IconMusic, IconHelp, IconVideo, IconFileText, IconPencil,
  IconCheck, IconEye, IconEyeOff, IconCrown, IconChevronDown,
  IconChevronUp, IconArrowLeft, IconCloudUpload,
  IconSparkles, IconBulb, IconPlayerPlay, IconDeviceLaptop,
  IconMessageQuestion, IconCircleCheck, IconCircle, IconGripVertical,
  IconLoader2,
  IconDna,
  IconAtom,
  IconFlask,
  IconHelpCircle, IconMessageCircle, IconList,
} from '@tabler/icons-react';
import * as TablerIcons from '@tabler/icons-react';
import {
  updateCourse,
  getLessonContent, updateLessonContent,
  getLessonQuiz, updateLessonQuiz,
  getLessonQa, updateLessonQa,
  uploadFile,
  parseDocumentFile
} from '../../services/api';
import { useDialog } from '../../contexts/DialogContext';

const LESSON_TYPES = [
  { value: 'notes',   label: 'Notes',   icon: IconFileText,        color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
  { value: 'quiz',    label: 'Quiz',    icon: IconHelp,            color: 'text-amber-400',   bg: 'bg-emerald-500/10 border-amber-500/20 font-bold' },
  { value: 'qa',      label: 'Q&A',     icon: IconMessageQuestion, color: 'text-violet-400',  bg: 'bg-violet-500/10 border-violet-500/20' },
];

const COVER_COLORS = [
  '#ecc246', // primary gold (site primary — dark mode)
  '#c9a227', // primary-container gold
  '#d4a017', // deep amber
  '#b8860b', // dark goldenrod
  '#0d1c2e', // site surface / deep navy
  '#1a2e4a', // navy blue
  '#2d4a6e', // medium navy
  '#0f3460', // deep indigo-navy
  '#1b6b8a', // teal-navy (Physics blue)
  '#16a085', // emerald teal (Biology)
  '#a0522d', // sienna (warm accent)
  '#755b00', // primary light-mode
];

const SUBJECTS = [
  { id: 'Biology', Icon: IconDna },
  { id: 'Physics', Icon: IconAtom },
  { id: 'Chemistry', Icon: IconFlask },
];

const getSubjectIcon = (subjectName) => {
  const sub = SUBJECTS.find(s => s.id.toLowerCase() === (subjectName || '').toLowerCase());
  return sub ? sub.Icon : IconBook2;
};

const COMMON_ICONS = [
  'IconBook2', 'IconAtom', 'IconDna', 'IconFlask', 'IconCode',
  'IconLanguage', 'IconPalette', 'IconChartBar', 'IconCalculator', 
  'IconMicroscope', 'IconBrain', 'IconList', 'IconFolder', 'IconFileText',
  'IconBulb', 'IconStar', 'IconTrophy', 'IconTarget', 'IconFlame',
  'IconRocket', 'IconCompass', 'IconMap', 'IconMusic', 'IconVideo'
];

function DynamicIcon({ name, size = 24, className, stroke }) {
  const IconComponent = TablerIcons[name] || TablerIcons.IconBook2;
  return <IconComponent size={size} className={className} stroke={stroke} />;
}

function IconSelector({ value, onChange, size = 20, className }) {
  const [open, setOpen] = useState(false);
  
  return (
    <div className="relative">
      <button 
        onClick={(e) => { e.preventDefault(); setOpen(!open); }}
        className={`flex items-center justify-center hover:bg-surface-variant/50 rounded p-1 transition-colors ${className}`}
        title="Change Icon"
      >
        <DynamicIcon name={value} size={size} stroke={2.5} />
      </button>
      
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={(e) => { e.preventDefault(); setOpen(false); }} />
          <div className="absolute z-50 top-full left-0 mt-1 bg-surface-container-highest shadow-xl rounded-xl border border-outline/20 p-2 w-48 grid grid-cols-4 gap-1 max-h-48 overflow-y-auto">
            {COMMON_ICONS.map(iconName => (
              <button
                key={iconName}
                onClick={(e) => {
                  e.preventDefault();
                  onChange(iconName);
                  setOpen(false);
                }}
                className={`flex items-center justify-center p-2 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors ${value === iconName ? 'bg-primary/20 text-primary' : 'text-on-surface-variant'}`}
                title={iconName.replace('Icon', '')}
              >
                <DynamicIcon name={iconName} size={20} />
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ── Helper: generate a temp ID ────────────────────────────────────────────────────
const tempId = () => `tmp_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

// ── Quiz editor ─────────────────────────────────────────────
function QuizEditor({ questions = [], onChange }) {
  const { toast } = useDialog();
  const [showRawPaste, setShowRawPaste] = useState(false);
  const [rawText, setRawText] = useState('');

  const handleImportQuiz = () => {
    if (!rawText.trim()) return;
    const blocks = rawText.split(/(?:^|\n)\s*(?:Q|Question):\s*/i);
    const parsedQs = [];
    
    for (const block of blocks) {
      if (!block.trim()) continue;
      
      const lines = block.split('\n').map(l => l.trim()).filter(Boolean);
      if (lines.length === 0) continue;
      
      const questionText = lines[0];
      let options = [];
      let correctIndex = 0;
      let correctText = '';
      let explanationText = '';
      let qType = ''; // Defaults to empty, will auto-detect
      
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        
        // Parse Type
        const typeMatch = line.match(/^Type:\s*(.*)/i);
        if (typeMatch) {
          const typeVal = typeMatch[1].trim().toLowerCase();
          if (typeVal.includes('tf') || typeVal.includes('t/f') || typeVal.includes('true')) {
            qType = 'true_false';
          } else if (typeVal.includes('blank') || typeVal.includes('fill')) {
            qType = 'fill_in_the_blanks';
          } else {
            qType = 'mcq';
          }
          continue;
        }

        // Parse Options
        const optMatch = line.match(/^(?:\d+|\w)\s*[\)\.\-]\s*(.*)/i) || line.match(/^[\-\*]\s*(.*)/i);
        if (optMatch) {
          options.push(optMatch[1].trim());
          continue;
        }
        
        // Parse Correct
        const correctMatch = line.match(/^Correct:\s*(.*)/i);
        if (correctMatch) {
          correctText = correctMatch[1].trim();
          continue;
        }
        
        // Parse Explanation
        const expMatch = line.match(/^Explanation:\s*(.*)/i);
        if (expMatch) {
          explanationText = expMatch[1].trim();
          continue;
        }
      }
      
      // Auto-detect type if not explicitly set
      if (!qType) {
        const hasTrue = options.some(o => o.toLowerCase() === 'true');
        const hasFalse = options.some(o => o.toLowerCase() === 'false');
        if (options.length === 2 && hasTrue && hasFalse) {
          qType = 'true_false';
        } else if (options.length === 0 && correctText) {
          qType = 'fill_in_the_blanks';
        } else {
          qType = 'mcq';
        }
      }

      // Configure fields based on type
      if (qType === 'true_false') {
        options = ['True', 'False'];
        const ansLower = correctText.toLowerCase();
        if (ansLower === 'true' || ansLower === 't' || ansLower === '1' || ansLower === 'correct') {
          correctIndex = 0;
        } else if (ansLower === 'false' || ansLower === 'f' || ansLower === '2') {
          correctIndex = 1;
        } else {
          const numVal = parseInt(correctText, 10);
          correctIndex = (!isNaN(numVal) && numVal === 2) ? 1 : 0;
        }
      } else if (qType === 'fill_in_the_blanks') {
        options = [];
      } else {
        // MCQ type
        if (options.length === 0 && lines.length > 1) {
          // Fallback parsing if options don't start with numbers/bullets
          for (let i = 1; i < lines.length; i++) {
            const line = lines[i];
            if (!line.startsWith('Correct:') && !line.startsWith('Explanation:') && !line.startsWith('Type:')) {
              options.push(line);
            }
          }
        }
        if (options.length === 0) {
          options = ['', '', '', ''];
        }
        
        // Map correct index
        const numVal = parseInt(correctText, 10);
        if (!isNaN(numVal)) {
          correctIndex = numVal - 1;
        } else if (correctText.length === 1) {
          const code = correctText.toLowerCase().charCodeAt(0);
          if (code >= 97 && code <= 122) {
            correctIndex = code - 97;
          }
        }
        correctIndex = Math.max(0, Math.min(options.length - 1, correctIndex));
      }
      
      if (questionText) {
        parsedQs.push({
          _id: tempId(),
          type: qType,
          question: questionText,
          options,
          correctIndex,
          correctText: qType === 'fill_in_the_blanks' ? correctText : '',
          explanation: explanationText
        });
      }
    }
    
    if (parsedQs.length > 0) {
      onChange([...questions, ...parsedQs]);
      setRawText('');
      setShowRawPaste(false);
    } else {
      toast.error("No questions matched. Please follow the format:\nQ: [Question]\nType: [MCQ/TF/Blanks]\nCorrect: [Answer]");
    }
  };

  const addQ = () => onChange([...questions, {
    _id: tempId(), type: 'mcq', question: '', options: ['', '', '', ''], correctIndex: 0, correctText: '', explanation: ''
  }]);

  const updateQ = (idx, patch) => {
    const qs = questions.map((q, i) => i === idx ? { ...q, ...patch } : q);
    onChange(qs);
  };

  const updateOption = (qIdx, oIdx, val) => {
    const qs = questions.map((q, i) => {
      if (i !== qIdx) return q;
      const opts = q.options.map((o, j) => j === oIdx ? val : o);
      return { ...q, options: opts };
    });
    onChange(qs);
  };

  const addOption = (qIdx) => {
    const qs = questions.map((q, i) =>
      i === qIdx ? { ...q, options: [...q.options, ''] } : q
    );
    onChange(qs);
  };

  const removeOption = (qIdx, oIdx) => {
    const qs = questions.map((q, i) => {
      if (i !== qIdx) return q;
      const opts = q.options.filter((_, j) => j !== oIdx);
      const correctIndex = q.correctIndex >= opts.length ? 0 : q.correctIndex;
      return { ...q, options: opts, correctIndex };
    });
    onChange(qs);
  };

  const moveQ = (idx, direction) => {
    const targetIdx = idx + direction;
    if (targetIdx < 0 || targetIdx >= questions.length) return;
    const arr = [...questions];
    [arr[idx], arr[targetIdx]] = [arr[targetIdx], arr[idx]];
    onChange(arr);
  };

  const removeQ = (idx) => onChange(questions.filter((_, i) => i !== idx));

  return (
    <div className="space-y-4">
      {questions.map((q, qIdx) => (
        <div key={q._id || qIdx} className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 space-y-3">
          <div className="flex items-start gap-2">
            <div className="flex flex-col gap-2 shrink-0 items-center">
              <div className="flex flex-col gap-0.5 opacity-40">
                <button
                  type="button"
                  onClick={() => moveQ(qIdx, -1)}
                  disabled={qIdx === 0}
                  className="disabled:opacity-20 hover:opacity-100 transition-opacity text-amber-400"
                >
                  <IconChevronUp size={12} stroke={2.5} />
                </button>
                <button
                  type="button"
                  onClick={() => moveQ(qIdx, 1)}
                  disabled={qIdx === questions.length - 1}
                  className="disabled:opacity-20 hover:opacity-100 transition-opacity text-amber-400"
                >
                  <IconChevronDown size={12} stroke={2.5} />
                </button>
              </div>
              <span className="text-[11px] font-bold text-amber-400 bg-amber-500/15 px-2 py-0.5 rounded-md text-center">Q{qIdx + 1}</span>
              <select
                value={q.type || 'mcq'}
                onChange={(e) => {
                  const newType = e.target.value;
                  const patch = { type: newType };
                  if (newType === 'true_false') {
                    patch.options = ['True', 'False'];
                    patch.correctIndex = (q.correctIndex === 0 || q.correctIndex === 1) ? q.correctIndex : 0;
                  } else if (newType === 'fill_in_the_blanks') {
                    patch.correctText = q.correctText || '';
                  } else if (newType === 'mcq') {
                    patch.options = q.options?.length >= 2 ? q.options : ['', '', '', ''];
                  }
                  updateQ(qIdx, patch);
                }}
                className="text-[10px] font-extrabold bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-amber-500/30 hover:bg-amber-500/20 transition-all cursor-pointer appearance-none pr-5.5 bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%2523fbbf24%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:7px_7px] bg-[position:right_5px_center] bg-no-repeat"
              >
                <option value="mcq" className="bg-surface text-on-surface font-semibold">MCQ</option>
                <option value="true_false" className="bg-surface text-on-surface font-semibold">T / F</option>
                <option value="fill_in_the_blanks" className="bg-surface text-on-surface font-semibold">Blanks</option>
              </select>
            </div>
            <textarea
              rows={2}
              placeholder="Enter your question..."
              className="flex-1 px-3 py-2 rounded-lg bg-background border border-outline-variant/40 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-amber-500/40 placeholder:text-on-surface-variant/40 resize-none"
              value={q.question}
              onChange={e => updateQ(qIdx, { question: e.target.value })}
            />
            <button onClick={() => removeQ(qIdx)} className="p-1.5 rounded-lg hover:bg-error/10 hover:text-error text-on-surface-variant transition-colors shrink-0">
              <IconTrash size={14} />
            </button>
          </div>

          {/* Options */}
          <div className="space-y-2 pl-8">
            {(!q.type || q.type === 'mcq' || q.type === 'true_false') && (
              <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Options — click circle to mark correct answer</p>
            )}
            
            {(!q.type || q.type === 'mcq' || q.type === 'true_false') && q.options.map((opt, oIdx) => (
              <div key={oIdx} className="flex items-center gap-2">
                <button
                  onClick={() => updateQ(qIdx, { correctIndex: oIdx })}
                  className={`shrink-0 transition-colors ${q.correctIndex === oIdx ? 'text-emerald-400' : 'text-on-surface-variant/30 hover:text-on-surface-variant'}`}
                >
                  {q.correctIndex === oIdx
                    ? <IconCircleCheck size={18} stroke={2} />
                    : <IconCircle size={18} stroke={1.5} />}
                </button>
                <input
                  type="text"
                  placeholder={`Option ${oIdx + 1}`}
                  readOnly={q.type === 'true_false'}
                  className={`flex-1 px-3 py-1.5 rounded-lg text-sm text-on-surface focus:outline-none focus:ring-2 placeholder:text-on-surface-variant/40 bg-background border transition-colors ${
                    q.correctIndex === oIdx
                      ? 'border-emerald-500/40 focus:ring-emerald-500/30'
                      : 'border-outline-variant/40 focus:ring-primary/30'
                  } ${q.type === 'true_false' && 'opacity-80 cursor-default focus:ring-0'}`}
                  value={opt}
                  onChange={e => updateOption(qIdx, oIdx, e.target.value)}
                />
                {q.type !== 'true_false' && q.options.length > 2 && (
                  <button onClick={() => removeOption(qIdx, oIdx)} className="p-1 text-on-surface-variant/40 hover:text-error transition-colors">
                    <IconX size={13} />
                  </button>
                )}
              </div>
            ))}
            
            {(!q.type || q.type === 'mcq') && (
              <button
                onClick={() => addOption(qIdx)}
                className="flex items-center gap-1.5 text-xs font-semibold text-on-surface-variant/60 hover:text-on-surface-variant transition-colors mt-1 pl-1"
              >
                <IconPlus size={13} /> Add option
              </button>
            )}

            {q.type === 'fill_in_the_blanks' && (
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1">Correct Answer (Exact text match)</p>
                <input
                  type="text"
                  placeholder="Type the exact correct answer here..."
                  className="w-full px-3 py-2 rounded-lg text-sm text-on-surface focus:outline-none focus:ring-2 border-emerald-500/40 focus:ring-emerald-500/30 bg-background border transition-colors"
                  value={q.correctText || ''}
                  onChange={e => updateQ(qIdx, { correctText: e.target.value })}
                />
              </div>
            )}
          </div>

          {/* Explanation */}
          <div className="pl-8">
            <input
              type="text"
              placeholder="Explanation (shown after answer) — optional"
              className="w-full px-3 py-1.5 rounded-lg bg-background border border-outline-variant/30 text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-amber-500/30 placeholder:text-on-surface-variant/40"
              value={q.explanation || ''}
              onChange={e => updateQ(qIdx, { explanation: e.target.value })}
            />
          </div>
        </div>
      ))}

      <div className="flex gap-2">
        <button
          onClick={addQ}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed border-amber-500/30 text-amber-400 text-sm font-semibold hover:bg-amber-500/5 transition-colors"
        >
          <IconPlus size={16} /> Add Question
        </button>
        <button
          type="button"
          onClick={() => setShowRawPaste(!showRawPaste)}
          className={`px-4 py-3 rounded-xl border border-dashed font-semibold text-sm transition-all flex items-center gap-2 shrink-0 ${
            showRawPaste 
              ? 'border-amber-500 bg-amber-500/10 text-white' 
              : 'border-outline-variant/30 text-on-surface-variant hover:border-outline-variant hover:text-on-surface'
          }`}
        >
          Raw Paste
        </button>
      </div>

      {showRawPaste && (
        <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 space-y-3">
          <div>
            <p className="text-xs font-bold text-amber-400">Import Mixed Questions (Raw Paste)</p>
            <p className="text-[10px] text-on-surface-variant mt-0.5 leading-relaxed">
              Paste questions of different types (MCQ, True/False, Fill in the Blanks) at once:<br/>
              <span className="font-mono text-amber-300/80 block mt-1 bg-background/50 p-2.5 rounded text-[10px] space-y-2">
                Q: Which model describes a plum pudding?<br/>
                Type: MCQ<br/>
                1) Rutherford Model<br/>
                2) Bohr Model<br/>
                3) Thomson Model<br/>
                Correct: 3<br/>
                Explanation: Plum pudding is Thomson.<br/>
                <br/>
                Q: Light travels faster than sound.<br/>
                Type: T/F<br/>
                Correct: True<br/>
                <br/>
                Q: The capital of India is _______.<br/>
                Type: Blanks<br/>
                Correct: New Delhi<br/>
                Explanation: Capital was shifted in 1911.
              </span>
            </p>
          </div>
          <textarea
            rows={8}
            placeholder="Paste your questions here..."
            className="w-full px-3 py-2 rounded-lg bg-background border border-outline-variant/40 text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-amber-500/40 font-mono"
            value={rawText}
            onChange={e => setRawText(e.target.value)}
          />
          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={() => { setShowRawPaste(false); setRawText(''); }}
              className="px-3 py-1.5 rounded-lg border border-outline-variant/30 text-xs text-on-surface hover:bg-surface-variant transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleImportQuiz}
              className="px-3 py-1.5 rounded-lg bg-amber-500 text-black font-bold text-xs hover:brightness-105 active:scale-95 transition-all"
            >
              Parse & Import
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Q&A editor ──────────────────────────────────────────────
function QaEditor({ qas = [], onChange }) {
  const { toast } = useDialog();
  const [showRawPaste, setShowRawPaste] = useState(false);
  const [rawText, setRawText] = useState('');

  const handleImportQas = () => {
    if (!rawText.trim()) return;
    const pairs = [];
    const blockRegex = /(?:Q|Question):\s*(.*?)\s*\n(?:A|Answer):\s*([\s\S]*?)(?=(?:\n\s*(?:Q|Question):|$))/gim;
    let match;
    blockRegex.lastIndex = 0;
    while ((match = blockRegex.exec(rawText)) !== null) {
      pairs.push({
        _id: tempId(),
        question: match[1].trim(),
        answer: match[2].trim()
      });
    }
    if (pairs.length > 0) {
      onChange([...qas, ...pairs]);
      setRawText('');
      setShowRawPaste(false);
    } else {
      toast.error("No Q&A pairs matched. Please follow the format:\nQ: [Question]\nA: [Answer]");
    }
  };

  const addPair = () => onChange([...qas, { _id: tempId(), question: '', answer: '' }]);
  const updatePair = (idx, patch) => onChange(qas.map((p, i) => i === idx ? { ...p, ...patch } : p));
  const removePair = (idx) => onChange(qas.filter((_, i) => i !== idx));
  const movePair = (idx, direction) => {
    const targetIdx = idx + direction;
    if (targetIdx < 0 || targetIdx >= qas.length) return;
    const arr = [...qas];
    [arr[idx], arr[targetIdx]] = [arr[targetIdx], arr[idx]];
    onChange(arr);
  };

  return (
    <div className="space-y-3">
      {qas.map((pair, idx) => (
        <div key={pair._id || idx} className="rounded-xl border border-violet-500/20 bg-violet-500/5 p-4 space-y-2">
          <div className="flex items-center gap-2">
            <div className="flex flex-col gap-0.5 opacity-40 shrink-0">
              <button
                type="button"
                onClick={() => movePair(idx, -1)}
                disabled={idx === 0}
                className="disabled:opacity-20 hover:opacity-100 transition-opacity text-violet-400"
              >
                <IconChevronUp size={12} stroke={2.5} />
              </button>
              <button
                type="button"
                onClick={() => movePair(idx, 1)}
                disabled={idx === qas.length - 1}
                className="disabled:opacity-20 hover:opacity-100 transition-opacity text-violet-400"
              >
                <IconChevronDown size={12} stroke={2.5} />
              </button>
            </div>
            <span className="text-[10px] font-bold text-violet-400 uppercase tracking-widest shrink-0 w-5">Q</span>
            <input
              type="text"
              placeholder="Question..."
              className="flex-1 px-3 py-2 rounded-lg bg-background border border-outline-variant/40 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-violet-500/30 placeholder:text-on-surface-variant/40"
              value={pair.question}
              onChange={e => updatePair(idx, { question: e.target.value })}
            />
            <button onClick={() => removePair(idx)} className="p-1.5 rounded-lg hover:bg-error/10 hover:text-error text-on-surface-variant transition-colors shrink-0">
              <IconTrash size={14} />
            </button>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest shrink-0 w-5 mt-2.5">A</span>
            <textarea
              rows={2}
              placeholder="Answer..."
              className="flex-1 px-3 py-2 rounded-lg bg-background border border-outline-variant/40 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-violet-500/30 placeholder:text-on-surface-variant/40 resize-none"
              value={pair.answer}
              onChange={e => updatePair(idx, { answer: e.target.value })}
            />
          </div>
        </div>
      ))}
      <div className="flex gap-2">
        <button
          onClick={addPair}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed border-violet-500/30 text-violet-400 text-sm font-semibold hover:bg-violet-500/5 transition-colors"
        >
          <IconPlus size={16} /> Add Q&A Pair
        </button>
        <button
          type="button"
          onClick={() => setShowRawPaste(!showRawPaste)}
          className={`px-4 py-3 rounded-xl border border-dashed font-semibold text-sm transition-all flex items-center gap-2 shrink-0 ${
            showRawPaste 
              ? 'border-violet-500 bg-violet-500/10 text-white' 
              : 'border-outline-variant/30 text-on-surface-variant hover:border-outline-variant hover:text-on-surface'
          }`}
        >
          Raw Paste
        </button>
      </div>

      {showRawPaste && (
        <div className="p-4 rounded-xl border border-violet-500/20 bg-violet-500/5 space-y-3">
          <div>
            <p className="text-xs font-bold text-violet-400">Import Q&A Pairs (Raw Paste)</p>
            <p className="text-[10px] text-on-surface-variant mt-0.5 leading-relaxed">
              Use this pattern to paste multiple questions and answers at once:<br/>
              <span className="font-mono text-violet-300/80 block mt-1 bg-background/50 p-2 rounded text-[10px]">
                Q: What is the charge of an electron?<br/>
                A: -1.602 x 10^-19 C<br/>
                <br/>
                Q: Who discovered the neutron?<br/>
                A: James Chadwick in 1932.<br/>
              </span>
            </p>
          </div>
          <textarea
            rows={8}
            placeholder="Paste your Q&As here..."
            className="w-full px-3 py-2 rounded-lg bg-background border border-outline-variant/40 text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-violet-500/40 font-mono"
            value={rawText}
            onChange={e => setRawText(e.target.value)}
          />
          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={() => { setShowRawPaste(false); setRawText(''); }}
              className="px-3 py-1.5 rounded-lg border border-outline-variant/30 text-xs text-on-surface hover:bg-surface-variant transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleImportQas}
              className="px-3 py-1.5 rounded-lg bg-violet-500 text-black font-bold text-xs hover:brightness-105 active:scale-95 transition-all"
            >
              Parse & Import
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function htmlToMarkdown(html) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  
  function traverse(node) {
    if (node.nodeType === Node.TEXT_NODE) {
      return node.textContent;
    }
    
    if (node.nodeType !== Node.ELEMENT_NODE) {
      return '';
    }
    
    const tagName = node.tagName.toLowerCase();
    let childrenContent = '';
    for (const child of node.childNodes) {
      childrenContent += traverse(child);
    }
    
    switch (tagName) {
      case 'h1':
        return `\n\n# ${childrenContent.trim()}\n\n`;
      case 'h2':
        return `\n\n## ${childrenContent.trim()}\n\n`;
      case 'h3':
        return `\n\n### ${childrenContent.trim()}\n\n`;
      case 'h4':
        return `\n\n#### ${childrenContent.trim()}\n\n`;
      case 'h5':
        return `\n\n##### ${childrenContent.trim()}\n\n`;
      case 'h6':
        return `\n\n###### ${childrenContent.trim()}\n\n`;
      case 'p':
        return `\n\n${childrenContent.trim()}\n\n`;
      case 'strong':
      case 'b':
        return `**${childrenContent}**`;
      case 'em':
      case 'i':
        return `*${childrenContent}*`;
      case 'u':
        return `_${childrenContent}_`;
      case 'a':
        const href = node.getAttribute('href') || '';
        return `[${childrenContent}](${href})`;
      case 'ul':
        return `\n\n${childrenContent}\n\n`;
      case 'ol':
        return `\n\n${childrenContent}\n\n`;
      case 'li':
        const parentTag = node.parentNode ? node.parentNode.tagName.toLowerCase() : '';
        if (parentTag === 'ol') {
          const siblings = Array.from(node.parentNode.children);
          const index = siblings.indexOf(node) + 1;
          return `${index}. ${childrenContent.trim()}\n`;
        }
        return `- ${childrenContent.trim()}\n`;
      case 'br':
        return '\n';
      case 'div':
      case 'span':
        const style = node.getAttribute('style') || '';
        if (style.includes('font-weight: bold') || style.includes('font-weight: 700')) {
          childrenContent = `**${childrenContent}**`;
        }
        if (style.includes('font-style: italic')) {
          childrenContent = `*${childrenContent}*`;
        }
        if (tagName === 'div') {
          return `\n${childrenContent}\n`;
        }
        return childrenContent;
      default:
        return childrenContent;
    }
  }
  
  let markdown = traverse(doc.body);
  
  // Clean up excess newlines
  markdown = markdown
    .replace(/\n{3,}/g, '\n\n')
    .trim();
    
  return markdown;
}

function cleanDocumentText(text) {
  if (!text) return '';
  
  // Convert unicode bullets and ensure spacing for markdown lists
  let formatted = text.replace(/^[ \t]*[•▪◦⚫][ \t]*/gm, '- ');
  formatted = formatted.replace(/^[ \t]*-[ \t]*/gm, '- ');
  
  // Format single newlines into double newlines where appropriate (e.g. headers, list boundaries)
  // to avoid everything running together in markdown
  const paragraphs = formatted.split(/\n\s*\n/);
  const cleanedParagraphs = paragraphs.map(p => {
    const trimmed = p.trim();
    if (
      trimmed.startsWith('-') || 
      trimmed.startsWith('*') || 
      trimmed.match(/^\d+\./) || 
      trimmed.startsWith('#')
    ) {
      return p;
    }
    
    const lines = p.split(/\r?\n/);
    if (lines.length > 1) {
      let reconstructed = '';
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        const nextLine = lines[i + 1] ? lines[i + 1].trim() : '';
        
        if (!line) continue;
        
        const isHeader = line.length < 60 && !line.endsWith('.') && !line.endsWith(',') && !line.endsWith(';') && !line.endsWith(':') && !line.endsWith('?') && !line.endsWith('!');
        const isNextHeader = nextLine && nextLine.length < 60 && !nextLine.endsWith('.') && !nextLine.endsWith(',') && !nextLine.endsWith(';') && !nextLine.endsWith(':') && !nextLine.endsWith('?') && !nextLine.endsWith('!');
        const isNextList = nextLine.startsWith('-') || nextLine.startsWith('*') || !!nextLine.match(/^\d+\./);
        
        if (isHeader || isNextHeader || isNextList || line.startsWith('-') || line.startsWith('*')) {
          reconstructed += line + '\n\n';
        } else {
          reconstructed += line + ' ';
        }
      }
      return reconstructed.trim();
    }
    return p;
  });
  
  return cleanedParagraphs.join('\n\n').replace(/\n{3,}/g, '\n\n').trim();
}


function ChapterCard({ chapter, index, chapters, onUpdate, onDelete, onMoveUp, onMoveDown, isFirst, isLast, onManageContent }) {
  return (
    <div className="rounded-xl border transition-all duration-200 border-outline-variant/15 bg-surface-container-low hover:border-outline-variant/30">
      <div className="flex items-center gap-2 p-3">
        <div className="flex flex-col gap-0.5 shrink-0 opacity-45">
          <button onClick={onMoveUp} disabled={isFirst} className="disabled:opacity-20 hover:opacity-100 transition-opacity">
            <IconChevronUp size={12} stroke={2.5} />
          </button>
          <button onClick={onMoveDown} disabled={isLast} className="disabled:opacity-20 hover:opacity-100 transition-opacity">
            <IconChevronDown size={12} stroke={2.5} />
          </button>
        </div>
        <div className="w-6 h-6 rounded-md bg-surface-variant flex items-center justify-center shrink-0">
          <span className="text-[10px] font-bold text-on-surface-variant">{index + 1}</span>
        </div>
        <div className="flex items-center gap-1.5 px-1.5 py-1 rounded-md border text-[10px] font-bold shrink-0 bg-emerald-500/10 border-emerald-500/20 text-emerald-400">
          <IconSelector value={chapter.icon || 'IconList'} onChange={icon => onUpdate({ icon })} size={13} className="text-emerald-400" />
          Chapter
        </div>
        <input
          type="text"
          placeholder={`Chapter ${index + 1}`}
          className="flex-1 min-w-0 bg-transparent text-xs font-semibold text-on-surface outline-none border-b border-transparent focus:border-primary/50 pb-0.5"
          value={chapter.title || ''}
          onChange={e => onUpdate({ title: e.target.value })}
        />
        <div className="flex items-center gap-2 shrink-0 ml-auto sm:ml-0">
          <button
            onClick={onManageContent}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-variant hover:bg-surface-variant/80 transition-colors text-xs font-bold text-on-surface"
          >
            Manage Content
            <IconArrowLeft size={14} className="rotate-180" />
          </button>
          <button
            onClick={onDelete}
            className="p-1 rounded-md hover:bg-error/10 hover:text-error transition-colors text-on-surface-variant"
          >
            <IconTrash size={14} stroke={2} />
          </button>
        </div>
      </div>
    </div>
  );
}

function ItemContentEditor({ item, onUpdate, items = [] }) {
  const { toast } = useDialog();
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [autoConvertHtml, setAutoConvertHtml] = useState(true);
  const [isParsingFile, setIsParsingFile] = useState(false);

  useEffect(() => {
    const hasData = (item.type === 'notes' && item.content !== undefined) || 
                    (item.type === 'quiz' && item.questions !== undefined) || 
                    (item.type === 'qa' && item.qas !== undefined);
                    
    if (!hasData && item._id && !String(item._id).startsWith('temp_') && !String(item._id).startsWith('tmp_')) {
      const fetchDetails = async () => {
        setDetailsLoading(true);
        try {
          if (item.type === 'notes' || !item.type) {
            const res = await getLessonContent(item._id).catch(() => ({ content: '' }));
            onUpdate({ content: res.content || '' });
          } else if (item.type === 'quiz') {
            const res = await getLessonQuiz(item._id).catch(() => ({ questions: [] }));
            onUpdate({ questions: res.questions || [] });
          } else if (item.type === 'qa') {
            const res = await getLessonQa(item._id).catch(() => ({ qas: [] }));
            onUpdate({ qas: res.qas || [] });
          }
        } catch (err) {
          console.error("Failed to load item details:", err);
        } finally {
          setDetailsLoading(false);
        }
      };
      fetchDetails();
    }
  }, [item._id, item.type]);

  const handlePaste = (e) => {
    const htmlData = e.clipboardData.getData('text/html');
    const plainText = e.clipboardData.getData('text/plain');
    if (autoConvertHtml && htmlData) {
      e.preventDefault();
      let markdown = htmlToMarkdown(htmlData);
      markdown = markdown.replace(/^[ \t]*[•▪◦⚫][ \t]*/gm, '- ');
      const textarea = e.target;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const currentValue = item.content || '';
      const newValue = currentValue.substring(0, start) + markdown + currentValue.substring(end);
      onUpdate({ content: newValue });
      setTimeout(() => {
        textarea.focus();
        textarea.selectionStart = textarea.selectionEnd = start + markdown.length;
      }, 0);
    } else if (plainText) {
      const hasUnicodeBullets = /^[ \t]*[•▪◦⚫]/m.test(plainText);
      if (hasUnicodeBullets) {
        e.preventDefault();
        const formattedText = cleanDocumentText(plainText);
        const textarea = e.target;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const currentValue = item.content || '';
        const newValue = currentValue.substring(0, start) + formattedText + currentValue.substring(end);
        onUpdate({ content: newValue });
        setTimeout(() => {
          textarea.focus();
          textarea.selectionStart = textarea.selectionEnd = start + formattedText.length;
        }, 0);
      }
    }
  };

  const handleCleanPdfWraps = () => {
    const currentValue = item.content || '';
    if (!currentValue.trim()) return;
    onUpdate({ content: cleanDocumentText(currentValue) });
  };

  if (detailsLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center border border-outline-variant/20 rounded-2xl bg-surface-container-low">
        <IconLoader2 className="animate-spin text-primary mb-2" size={24} />
        <p className="text-xs text-on-surface-variant">Loading item details...</p>
      </div>
    );
  }

  return (
    <div className="border border-outline-variant/20 rounded-2xl bg-surface-container-low p-4 md:p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex-1">
          <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1 block">Item Title</label>
          <input
            type="text"
            className="w-full px-3 py-2 rounded-xl bg-background border border-outline-variant/40 text-sm font-bold text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40"
            value={item.title || ''}
            onChange={e => onUpdate({ title: e.target.value })}
            placeholder="e.g., Chapter 1 Notes"
          />
        </div>
        <div className="w-full md:w-48">
          <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1 block">Type</label>
          <select
            className="w-full px-3 py-2 rounded-xl bg-background border border-outline-variant/40 text-sm font-bold text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40"
            value={item.type || 'notes'}
            onChange={e => {
              const newType = e.target.value;
              let newTitle = item.title;
              
              const isDefaultTitle = /^Note \d+$/i.test(item.title) || 
                                     /^Quiz \d+$/i.test(item.title) || 
                                     /^Q&A \d+$/i.test(item.title) ||
                                     item.title === 'New Item';
                                     
              if (isDefaultTitle) {
                const count = items.filter(i => (i.type || 'notes') === newType).length;
                if (newType === 'notes') newTitle = `Note ${count + 1}`;
                else if (newType === 'quiz') newTitle = `Quiz ${count + 1}`;
                else if (newType === 'qa') newTitle = `Q&A ${count + 1}`;
              }
              
              onUpdate({ type: newType, title: newTitle });
            }}
          >
            <option value="notes">Notes / Text</option>
            <option value="quiz">Quiz</option>
            <option value="qa">Q&A / Flashcards</option>
          </select>
        </div>
      </div>

      <div className="flex items-center justify-between p-3 rounded-xl bg-background border border-outline-variant/20 mb-6">
        <div className="flex items-center gap-2">
          <IconCrown size={16} className={item.isPremium ? 'text-amber-400' : 'text-on-surface-variant'} />
          <span className="text-xs font-bold uppercase tracking-wider text-on-surface">Premium Item (Locked for Free Users)</span>
        </div>
        <button
          onClick={() => onUpdate({ isPremium: !item.isPremium })}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${item.isPremium ? 'bg-amber-500' : 'bg-surface-variant'}`}
        >
          <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm" style={{ transform: item.isPremium ? 'translateX(22px)' : 'translateX(4px)' }} />
        </button>
      </div>

      {(item.type === 'notes' || !item.type) && (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">Notes / Content</label>
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-1 text-[11px] text-on-surface-variant cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={autoConvertHtml}
                  onChange={(e) => setAutoConvertHtml(e.target.checked)}
                  className="rounded border-outline-variant/40 text-emerald-500 focus:ring-emerald-500/20 bg-background w-3 h-3"
                />
                <span>Auto-Format Paste</span>
              </label>

              <button
                type="button"
                onClick={handleCleanPdfWraps}
                className="px-3 py-1 rounded bg-surface border border-outline-variant/20 hover:border-outline-variant/50 text-[11px] font-bold text-on-surface-variant hover:text-on-surface transition-all"
                title="Fix mid-sentence line breaks from PDF copy-paste"
              >
                Clean PDF Wraps
              </button>

              <button
                type="button"
                onClick={() => document.getElementById(`doc-upload-${item._id}`).click()}
                disabled={isParsingFile}
                className="flex items-center gap-1 px-3 py-1 rounded bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-[11px] font-bold text-emerald-400 transition-all disabled:opacity-50"
              >
                {isParsingFile ? (
                  <>
                    <IconLoader2 size={12} className="animate-spin" />
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <IconCloudUpload size={12} />
                    <span>Upload Document</span>
                  </>
                )}
              </button>
              <input
                id={`doc-upload-${item._id}`}
                type="file"
                accept=".pdf,.doc,.docx"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  setIsParsingFile(true);
                  try {
                    const res = await uploadFile(file, 'document');
                    if (res.url) {
                      let type = 'link';
                      if (file.name.toLowerCase().endsWith('.pdf')) type = 'pdf';
                      if (file.name.toLowerCase().endsWith('.docx') || file.name.toLowerCase().endsWith('.doc')) type = 'doc';
                      const finalUrl = res.url.startsWith('/') 
                        ? `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${res.url}` 
                        : res.url;
                      onUpdate({ fileUrl: finalUrl, fileType: type });
                    }
                  } catch (err) {
                    console.error('File upload failed:', err);
                  } finally {
                    setIsParsingFile(false);
                    e.target.value = '';
                  }
                }}
              />
            </div>
          </div>

          {item.fileUrl ? (
            <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl relative group">
              <button
                onClick={() => onUpdate({ fileUrl: '', fileType: 'link' })}
                className="absolute top-2 right-2 p-1.5 bg-red-500/10 text-red-400 rounded-md transition-opacity hover:bg-red-500/20"
                title="Remove attached document"
              >
                <IconTrash size={16} />
              </button>
              <p className="text-[10px] text-emerald-500 font-bold tracking-wider uppercase mb-3">Document Loaded as Notes</p>
              <div className="flex gap-2 items-center mb-3 pr-8">
                <input
                  type="text"
                  placeholder="Document link..."
                  className="flex-1 px-3 py-2 rounded-xl bg-background border border-outline-variant/40 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                  value={item.fileUrl || ''}
                  onChange={e => onUpdate({ fileUrl: e.target.value, fileType: e.target.value.toLowerCase().endsWith('.pdf') ? 'pdf' : 'link' })}
                />
                <select
                  value={item.fileType || 'link'}
                  onChange={e => onUpdate({ fileType: e.target.value })}
                  className="px-3 py-2 rounded-xl bg-background border border-outline-variant/40 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                >
                  <option value="link">Auto (Link)</option>
                  <option value="pdf">PDF File</option>
                  <option value="doc">Word Doc</option>
                </select>
              </div>
              <a href={item.fileUrl.startsWith('/') ? `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${item.fileUrl}` : item.fileUrl} target="_blank" rel="noreferrer" className="text-sm font-bold text-emerald-500 hover:underline">
                Open in new tab to preview
              </a>
            </div>
          ) : (
            <>
              <textarea
                id={`textarea-${item._id}`}
                rows={12}
                placeholder="Enter item notes, markdown, or key summary points..."
                className="w-full px-4 py-3 rounded-xl bg-background border border-outline-variant/40 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-emerald-500/30 placeholder:text-on-surface-variant/40 resize-y font-mono leading-relaxed"
                value={item.content || ''}
                onChange={e => onUpdate({ content: e.target.value })}
                onPaste={handlePaste}
                disabled={isParsingFile}
              />
              <div className="flex gap-2 items-center mt-2">
                <input
                  type="text"
                  placeholder="Or paste a public document link here (e.g. https://.../file.pdf)"
                  className="flex-1 px-4 py-2.5 rounded-xl bg-background border border-outline-variant/40 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-emerald-500/30 placeholder:text-on-surface-variant/40"
                  value={item.fileUrl || ''}
                  onChange={e => onUpdate({ fileUrl: e.target.value, fileType: e.target.value.toLowerCase().endsWith('.pdf') ? 'pdf' : 'link' })}
                />
              </div>
            </>
          )}
        </div>
      )}

      {item.type === 'qa' && (
        <div className="mt-4">
          <QaEditor
            qas={item.qas || []}
            onChange={pairs => onUpdate({ qas: pairs })}
          />
        </div>
      )}

      {item.type === 'quiz' && (
        <div className="mt-4">
          <QuizEditor
            questions={item.questions || []}
            onChange={qs => onUpdate({ questions: qs })}
          />
        </div>
      )}
    </div>
  );
}

function ChapterContentEditor({ chapter, onUpdate }) {
  const items = chapter.items || [];
  const [selectedItemIndex, setSelectedItemIndex] = useState(null);

  if (selectedItemIndex !== null) {
    const item = items[selectedItemIndex];
    if (!item) {
      setSelectedItemIndex(null);
      return null;
    }
    return (
      <div className="animate-in fade-in slide-in-from-right-4 duration-300">
        <button 
          onClick={() => setSelectedItemIndex(null)}
          className="flex items-center gap-1.5 text-sm font-semibold text-on-surface-variant hover:text-on-surface transition-colors mb-6"
        >
          <IconArrowLeft size={16} stroke={2} />
          Back to Items
        </button>
        <ItemContentEditor 
          item={item} 
          items={items}
          onUpdate={(patch) => {
            const newItems = [...items];
            newItems[selectedItemIndex] = { ...item, ...patch };
            onUpdate({ items: newItems });
          }}
        />
      </div>
    );
  }

  return (
    <div className="border border-outline-variant/20 rounded-2xl bg-surface-container-low p-4 md:p-6 animate-in fade-in slide-in-from-left-4 duration-300">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-black text-on-surface">Items</h3>
          <p className="text-xs text-on-surface-variant mt-1">Manage notes, quizzes, and Q&As for this chapter.</p>
        </div>
        <button
          onClick={() => {
            const notesCount = items.filter(i => (i.type || 'notes') === 'notes').length;
            const newItem = { _id: `temp_${Date.now()}`, title: `Note ${notesCount + 1}`, type: 'notes', isPremium: false };
            onUpdate({ items: [...items, newItem] });
            setSelectedItemIndex(items.length);
          }}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-primary text-on-primary text-sm font-bold hover:brightness-110 transition-all shadow-sm"
        >
          <IconPlus size={16} stroke={2.5} />
          Add Item
        </button>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center border border-dashed border-outline-variant/20 rounded-2xl bg-background">
          <IconFileText className="text-on-surface-variant/40 mb-3" size={32} />
          <p className="text-sm font-bold text-on-surface-variant">No items yet</p>
          <p className="text-xs text-on-surface-variant/60 mt-1">Click "Add Item" to create notes, quizzes, or Q&As.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item, idx) => {
            let Icon = IconFileText;
            if (item.type === 'quiz') Icon = IconHelpCircle;
            if (item.type === 'qa') Icon = IconMessageCircle;
            return (
              <div 
                key={item._id || idx}
                className="flex items-center justify-between p-3 rounded-xl bg-background border border-outline-variant/20 hover:border-primary/30 group transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-surface-variant flex items-center justify-center text-on-surface-variant group-hover:text-primary transition-colors">
                    <Icon size={16} stroke={2.5} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-on-surface group-hover:text-primary transition-colors">{item.title || 'Untitled Item'}</p>
                    <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold mt-0.5">{item.type}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      if (idx > 0) {
                        const newItems = [...items];
                        [newItems[idx], newItems[idx-1]] = [newItems[idx-1], newItems[idx]];
                        onUpdate({ items: newItems });
                      }
                    }}
                    disabled={idx === 0}
                    className="p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-variant hover:text-on-surface disabled:opacity-30 transition-all"
                  >
                    <IconChevronUp size={16} />
                  </button>
                  <button
                    onClick={() => {
                      if (idx < items.length - 1) {
                        const newItems = [...items];
                        [newItems[idx], newItems[idx+1]] = [newItems[idx+1], newItems[idx]];
                        onUpdate({ items: newItems });
                      }
                    }}
                    disabled={idx === items.length - 1}
                    className="p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-variant hover:text-on-surface disabled:opacity-30 transition-all"
                  >
                    <IconChevronDown size={16} />
                  </button>
                  <button
                    onClick={() => setSelectedItemIndex(idx)}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold bg-primary/10 text-primary hover:bg-primary/20 transition-all ml-2"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm('Are you sure you want to delete this item?')) {
                        const newItems = items.filter((_, i) => i !== idx);
                        onUpdate({ items: newItems });
                      }
                    }}
                    className="p-1.5 rounded-lg text-error/70 hover:bg-error/10 hover:text-error transition-all ml-1"
                  >
                    <IconTrash size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function SubjectCard({ subject, index, onUpdate, onDelete, onMoveUp, onMoveDown, isFirst, isLast, onManageChapters }) {
  const [editing, setEditing] = useState(false);
  const chapters = subject.chapters || [];

  return (
    <div className="rounded-2xl border transition-all duration-200 border-outline-variant/25 bg-surface-container-lowest hover:border-outline-variant/50">
      <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 p-4">
        <div className="flex flex-col gap-0.5 shrink-0 opacity-40">
          <button onClick={onMoveUp} disabled={isFirst} className="disabled:opacity-20 hover:opacity-100 transition-opacity">
            <IconChevronUp size={14} stroke={2.5} />
          </button>
          <button onClick={onMoveDown} disabled={isLast} className="disabled:opacity-20 hover:opacity-100 transition-opacity">
            <IconChevronDown size={14} stroke={2.5} />
          </button>
        </div>
        <div className="w-7 h-7 rounded-lg bg-surface-variant flex items-center justify-center shrink-0">
          <span className="text-xs font-bold text-on-surface-variant">{index + 1}</span>
        </div>
        <div className="flex items-center gap-1.5 px-1.5 py-1.5 rounded-lg border text-xs font-bold shrink-0 bg-blue-500/10 border-blue-500/20 text-blue-400">
          <IconSelector value={subject.icon || 'IconBook2'} onChange={icon => onUpdate({ icon })} size={16} className="text-blue-400" />
          Subject Heading
        </div>
        <div className="flex-1 min-w-0">
          {editing ? (
            <input
              autoFocus
              placeholder={`Subject ${index + 1}`}
              className="w-full bg-transparent text-sm font-semibold text-on-surface outline-none border-b border-primary/50 pb-0.5"
              value={subject.title}
              onChange={e => onUpdate({ title: e.target.value })}
              onBlur={() => setEditing(false)}
              onKeyDown={e => e.key === 'Enter' && setEditing(false)}
            />
          ) : (
            <button
              onClick={() => setEditing(true)}
              className="w-full text-left text-sm font-semibold text-on-surface truncate hover:text-primary transition-colors"
            >
              {subject.title || <span className="text-on-surface-variant/40 italic">Subject {index + 1}</span>}
            </button>
          )}
          {chapters.length > 0 && (
            <span className="text-[11px] text-on-surface-variant/70 block mt-0.5">
              {chapters.length} item{chapters.length !== 1 ? 's' : ''} under this subject
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0 ml-auto sm:ml-0">
          <button
            onClick={onManageChapters}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-variant hover:bg-surface-variant/80 transition-colors text-xs font-bold text-on-surface"
          >
            Manage Chapters
            <IconArrowLeft size={14} className="rotate-180" />
          </button>
          <button
            onClick={onDelete}
            className="p-1.5 rounded-lg hover:bg-error/10 hover:text-error transition-colors text-on-surface-variant"
          >
            <IconTrash size={16} stroke={2} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CourseDesigner({ course, onClose, onSaved }) {
  const { toast } = useDialog();
  const [subjects, setSubjects] = useState(course.subjects || []);
  const [meta, setMeta] = useState({
    title: course.title,
    class: course.class,
    subject: course.subject,
    summary: course.summary || '',
    coverColor: course.coverColor || '#ecc246',
    isPublished: course.isPublished || false,
    isPremium: course.isPremium || false,
    thumbnail: course.thumbnail || '',
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState('curriculum'); // 'curriculum' | 'settings'
  const [selectedSubjectIndex, setSelectedSubjectIndex] = useState(null);
  const [selectedChapterIndex, setSelectedChapterIndex] = useState(null);
  const SubjectIcon = getSubjectIcon(meta.subject);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const res = await uploadFile(file, 'courses/thumbnails');
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
      const fullUrl = `${backendUrl}${res.url}`;
      setMeta(m => ({ ...m, thumbnail: fullUrl }));
    } catch (err) {
      toast.error("Failed to upload file: " + err.message);
    }
  };
  const addSubject = () => {
    setSubjects(prev => [...prev, {
      _id: `temp_${Date.now()}`,
      title: '',
      description: '',
      isPremium: false,
      order: prev.length,
      chapters: [],
    }]);
  };

    const updateSubject = (index, patch) => {
    setSubjects(prev => prev.map((l, i) => {
      if (i !== index) return l;
      const appliedPatch = typeof patch === 'function' ? patch(l) : patch;
      return { ...l, ...appliedPatch };
    }));
  };

  const deleteSubject = (index) => {
    setSubjects(prev => prev.filter((_, i) => i !== index));
  };

  const moveSubject = (index, direction) => {
    setSubjects(prev => {
      const arr = [...prev];
      const target = index + direction;
      if (target < 0 || target >= arr.length) return arr;
      [arr[index], arr[target]] = [arr[target], arr[index]];
      return arr;
    });
  };

  const handleSave = async () => {
    // Auto-fill untitled subjects with 'Subject X'
    const cleanSubjectsWithTitles = subjects.map((l, i) => ({
      ...l,
      title: l.title?.trim() || `Subject ${i + 1}`
    }));
    
    setSaving(true);
    try {
      // Clean subjects outline to save
      const cleanSubjects = cleanSubjectsWithTitles.map((l, i) => {
        const cleanChapters = (l.chapters || []).map((chapter, idx) => {
          const cleanItems = (chapter.items || []).map((item, iIdx) => {
             const cleanItem = {
                title: item.title?.trim() || `Item ${iIdx + 1}`,
                type: item.type || 'notes',
                order: iIdx,
                isPremium: !!item.isPremium,
                fileUrl: item.fileUrl || '',
                fileType: item.fileType || '',
             };
             if (item._id && !String(item._id).startsWith('temp_') && !String(item._id).startsWith('tmp_')) {
               cleanItem._id = item._id;
             }
             return cleanItem;
          });

          const cleanChapter = {
            title: chapter.title?.trim() || `Chapter ${idx + 1}`,
            description: chapter.description || '',
            icon: chapter.icon || '',
            order: idx,
            items: cleanItems
          };
          if (chapter._id && !String(chapter._id).startsWith('temp_') && !String(chapter._id).startsWith('tmp_')) {
            cleanChapter._id = chapter._id;
          }
          return cleanChapter;
        });

        const cleanL = {
          title: l.title?.trim() || `Subject ${i + 1}`,
          description: l.description || '',
          icon: l.icon || '',
          isPremium: l.isPremium || false,
          order: i,
          chapters: cleanChapters,
        };
        if (l._id && !String(l._id).startsWith('temp_') && !String(l._id).startsWith('tmp_')) {
          cleanL._id = l._id;
        }
        return cleanL;
      });

      const updated = await updateCourse(course._id, {
        ...meta,
        subjects: cleanSubjects,
      });

      // Now save details for all items inside all chapters inside all subjects
      const savePromises = [];
      const updatedSubjects = updated?.subjects || [];
      for (let lIdx = 0; lIdx < updatedSubjects.length; lIdx++) {
        const cleanL = updatedSubjects[lIdx];
        const localL = subjects[lIdx];

        if (localL && localL.chapters) {
          const cleanChapters = cleanL?.chapters || [];
          for (let cIdx = 0; cIdx < cleanChapters.length; cIdx++) {
            const cleanChapter = cleanChapters[cIdx];
            const localChapter = localL.chapters[cIdx];
            
            if (localChapter && localChapter.items) {
               const cleanItems = cleanChapter?.items || [];
               for (let iIdx = 0; iIdx < cleanItems.length; iIdx++) {
                 const cleanItem = cleanItems[iIdx];
                 const localItem = localChapter.items[iIdx];

                 if (localItem) {
                    const isNewItem = !localItem._id || String(localItem._id).startsWith('temp_') || String(localItem._id).startsWith('tmp_');
                    
                    if (localItem.content !== undefined || isNewItem) {
                      savePromises.push(updateLessonContent(cleanItem._id, localItem.content || ''));
                    }
                    if (localItem.questions !== undefined || isNewItem) {
                      const cleanQs = (localItem.questions || []).map(q => {
                        const { _id: qid, ...qrest } = q;
                        const cq = { ...qrest };
                        if (qid && !String(qid).startsWith('tmp_') && !String(qid).startsWith('temp_')) cq._id = qid;
                        return cq;
                      });
                      savePromises.push(updateLessonQuiz(cleanItem._id, cleanQs));
                    }
                    if (localItem.qas !== undefined || isNewItem) {
                       const cleanQas = (localItem.qas || []).map(p => {
                          const { _id: pid, ...prest } = p;
                          const cp = { ...prest };
                          if (pid && !String(pid).startsWith('tmp_') && !String(pid).startsWith('temp_')) cp._id = pid;
                          return cp;
                       });
                       savePromises.push(updateLessonQa(cleanItem._id, cleanQas));
                    }
                 }
               }
            }
          }
        }
      }

      if (savePromises.length > 0) {
        await Promise.all(savePromises);
      }

      // Update local state with real DB IDs but keep our content!
      const mergedSubjects = (updated?.subjects || []).map((serverL, lIdx) => {
        const localL = subjects[lIdx];
        if (!localL) return serverL;
        return {
          ...serverL,
          chapters: (serverL.chapters || []).map((serverC, cIdx) => {
            const localC = (localL.chapters || [])[cIdx];
            if (!localC) return serverC;
            return {
              ...serverC,
              items: (serverC.items || []).map((serverI, iIdx) => {
                 const localI = (localC.items || [])[iIdx];
                 if (!localI) return serverI;
                 return {
                    ...serverI,
                    content: localI.content,
                    questions: localI.questions,
                    qas: localI.qas
                 };
              })
            };
          })
        };
      });
      setSubjects(mergedSubjects);

      setSaved(true);
      onSaved(updated);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      toast.error('Failed to save: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const totalSubjects = subjects.length;
  const premiumCount = subjects.filter(l => l.isPremium).length;
  
  const totalChaptersCount = subjects.reduce((acc, l) => acc + (l.chapters || []).length, 0);
  
  

  return (
    <div className="fixed inset-0 z-modal-highest flex flex-col bg-surface animate-in fade-in duration-200">
      {/* ─── Top Bar ─── */}
      <header className="shrink-0 flex items-center justify-between px-5 md:px-8 h-16 border-b border-outline-variant/20 bg-surface/95 backdrop-blur">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="flex items-center gap-2 text-sm text-on-surface-variant hover:text-on-surface transition-colors group whitespace-nowrap"
          >
            <IconArrowLeft size={18} stroke={2} className="group-hover:-translate-x-0.5 transition-transform" />
            <span className="hidden sm:inline">Back to Courses</span>
          </button>
          <span className="text-on-surface-variant/30 hidden sm:inline">/</span>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md" style={{ background: meta.coverColor }} />
            <span className="text-sm font-bold text-on-surface truncate max-w-[200px]">{meta.title}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Publish toggle */}
          <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl border border-outline-variant/30 bg-surface-variant/20">
            <span className={`text-xs font-bold ${meta.isPublished ? 'text-emerald-400' : 'text-on-surface-variant'}`}>
              {meta.isPublished ? 'Published' : 'Draft'}
            </span>
            <button
              onClick={() => setMeta(m => ({ ...m, isPublished: !m.isPublished }))}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${meta.isPublished ? 'bg-emerald-500' : 'bg-surface-variant'}`}
            >
              <span className="inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform shadow-sm" style={{ transform: meta.isPublished ? 'translateX(18px)' : 'translateX(2px)' }} />
            </button>
          </div>

          {/* Save button */}
          <button
            onClick={handleSave}
            disabled={saving}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold transition-all shadow-md ${
              saved
                ? 'bg-emerald-500 text-white shadow-emerald-500/20'
                : 'bg-primary text-on-primary hover:brightness-110 active:scale-[0.98] shadow-primary/20'
            } disabled:opacity-60`}
          >
            {saved ? <IconCheck size={16} stroke={2.5} /> : <IconCloudUpload size={16} stroke={2} />}
            {saving ? 'Saving…' : saved ? 'Saved!' : 'Save'}
          </button>
        </div>
      </header>

      {/* ─── Body ─── */}
      <div className="flex-1 flex overflow-hidden">

        {/* ─── Left: Sidebar stats + tabs ─── */}
        <aside className="hidden lg:flex lg:w-72 xl:w-80 shrink-0 flex-col border-r border-white/[0.07] overflow-y-auto">
          {/* Course preview card */}
          <div className="m-5 p-1 rounded-2xl bg-surface-container-lowest/40 border border-outline/5">
            <div
              className="flex items-center gap-3.5 p-4 rounded-[calc(1rem-0.125rem)] border border-outline/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.03)]"
              style={{
                background: 'linear-gradient(180deg, rgb(var(--color-surface-container-low) / 0.4) 0%, rgb(var(--color-surface-container-lowest) / 0.8) 100%)'
              }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center bg-surface-variant/40 border border-outline/10 text-on-surface-variant transition-all duration-300"
              >
                <SubjectIcon size={20} stroke={1.5} style={{ color: meta.coverColor }} />
              </div>
              <div className="min-w-0">
                <p className="font-bold text-on-surface text-sm leading-tight truncate">{meta.title || 'Untitled Course'}</p>
                <p className="text-[10px] text-on-surface-variant mt-0.5 font-medium">{meta.class || 'Class'} · {meta.subject || 'Subject'}</p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="px-5 grid grid-cols-2 gap-3 mb-5">
            <div className="bg-surface-container rounded-xl p-3 border border-outline/5">
              <p className="text-2xl font-bold text-on-surface">{totalSubjects}</p>
              <p className="text-[11px] text-on-surface-variant uppercase tracking-wider mt-0.5">Subjects</p>
            </div>
            <div className="bg-surface-container rounded-xl p-3 border border-outline/5">
              <p className="text-2xl font-bold text-on-surface">{totalChaptersCount}</p>
              <p className="text-[11px] text-on-surface-variant uppercase tracking-wider mt-0.5">Chapters</p>
            </div>
          </div>



          {/* Tips */}
          <div className="mx-5 mb-5 p-4 rounded-xl bg-primary/5 border border-primary/15">
            <div className="flex items-center gap-2 mb-2">
              <IconBulb size={14} className="text-primary" stroke={2} />
              <span className="text-[11px] font-bold uppercase tracking-widest text-primary">Tips</span>
            </div>
            <ul className="space-y-1.5">
              {['Start with a hook — put your strongest subject first', 'Keep chapters under 15 min each', 'Mix content types to boost engagement', 'Mark key subjects as Premium'].map(tip => (
                <li key={tip} className="text-[11px] text-on-surface-variant leading-relaxed">{tip}</li>
              ))}
            </ul>
          </div>
        </aside>

        {/* ─── Main Editor ─── */}
        <main className="flex-1 overflow-y-auto">
          {/* Tab nav */}
          <div className="sticky top-0 z-10 bg-surface/90 backdrop-blur border-b border-outline-variant/20 px-4 sm:px-6 md:px-8 flex gap-1 overflow-x-auto hide-scrollbar">
            {[
              { id: 'curriculum', label: 'Curriculum', icon: IconBook2 },
              { id: 'settings', label: 'Course Settings', icon: IconSparkles },
            ].map(tab => {
              const TIcon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3.5 text-sm font-semibold border-b-2 transition-all ${
                    activeTab === tab.id
                      ? 'border-primary text-on-surface'
                      : 'border-transparent text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  <TIcon size={15} stroke={2} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* ── Curriculum Tab ── */}
          {activeTab === 'curriculum' && selectedSubjectIndex === null && (
            <div className="p-6 md:p-8 max-w-3xl">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-on-surface">Curriculum Builder</h2>
                <p className="text-sm text-on-surface-variant mt-1">
                  Add subjects and arrange your course outline.
                </p>
              </div>

              {/* Lesson list */}
              <div className="space-y-3 mb-6">
                {subjects.length === 0 && (
                  <div className="text-center py-16 border border-dashed border-outline-variant/30 rounded-2xl">
                    <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-4">
                      <IconPlayerPlay size={26} stroke={1.5} className="text-primary" />
                    </div>
                    <h3 className="font-bold text-on-surface mb-1">No content yet</h3>
                    <p className="text-sm text-on-surface-variant mb-5">Add your first subject to start building the curriculum.</p>
                    <button
                      onClick={addSubject}
                      className="bg-primary text-on-primary px-6 py-2.5 rounded-xl font-bold text-sm hover:brightness-110 active:scale-[0.98] transition-all"
                    >
                      Add First Subject
                    </button>
                  </div>
                )}

                {subjects.map((subject, i) => (
                  <SubjectCard
                    key={subject._id || i}
                    subject={subject}
                    index={i}
                    isFirst={i === 0}
                    isLast={i === subjects.length - 1}
                    onUpdate={patch => updateSubject(i, patch)}
                    onDelete={() => deleteSubject(i)}
                    onMoveUp={() => moveSubject(i, -1)}
                    onMoveDown={() => moveSubject(i, 1)}
                    onManageChapters={() => setSelectedSubjectIndex(i)}
                  />
                ))}
              </div>

              {/* Add buttons */}
              {subjects.length > 0 && (
                <button
                  onClick={addSubject}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-primary/20 text-primary bg-primary/10 text-xs font-bold transition-all hover:scale-105 active:scale-95 whitespace-nowrap"
                >
                  <IconPlus size={13} stroke={2.5} />
                  Add Subject
                </button>
              )}
            </div>
          )}

          {activeTab === 'curriculum' && selectedSubjectIndex !== null && selectedChapterIndex === null && (
            <div className="p-6 md:p-8 max-w-3xl">
              <div className="mb-6">
                <button 
                  onClick={() => { setSelectedSubjectIndex(null); setSelectedChapterIndex(null); }}
                  className="flex items-center gap-1.5 text-sm font-semibold text-on-surface-variant hover:text-on-surface transition-colors mb-4"
                >
                  <IconArrowLeft size={16} stroke={2} />
                  Back to Subjects
                </button>
                <h2 className="text-xl font-bold text-on-surface">{subjects[selectedSubjectIndex]?.title || `Subject ${selectedSubjectIndex + 1}`}</h2>
                <p className="text-sm text-on-surface-variant mt-1">
                  Manage chapters for this subject.
                </p>
              </div>

              <div className="space-y-3 mb-6">
                {(subjects[selectedSubjectIndex]?.chapters || []).length === 0 && (
                  <div className="text-center py-10 border border-dashed border-outline-variant/30 rounded-2xl bg-surface-container-lowest">
                    <p className="text-[13px] font-medium text-on-surface-variant/60 mb-4">No chapters added yet.</p>
                    <button
                      onClick={() => {
                        const newItem = { _id: `temp_${Date.now()}`, title: '', duration: '', videoUrl: '', isPremium: false, order: (subjects[selectedSubjectIndex]?.chapters || []).length };
                        updateSubject(selectedSubjectIndex, prev => ({ chapters: [...(prev.chapters || []), newItem] }));
                      }}
                      className="flex mx-auto items-center gap-1.5 px-4 py-2 rounded-xl border text-xs font-bold transition-all hover:scale-[1.02] active:scale-95 bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                    >
                      <IconPlus size={14} stroke={2.5} />
                      Add First Chapter
                    </button>
                  </div>
                )}
                
                {(subjects[selectedSubjectIndex]?.chapters || []).map((chapter, idx) => (
                  <ChapterCard
                    key={chapter._id || idx}
                    chapter={chapter}
                    index={idx}
                    chapters={subjects[selectedSubjectIndex].chapters || []}
                    onUpdate={patch => {
                      updateSubject(selectedSubjectIndex, prev => ({
                        chapters: (prev.chapters || []).map((ch, i) => i === idx ? { ...ch, ...patch } : ch)
                      }));
                    }}
                    onDelete={() => {
                      updateSubject(selectedSubjectIndex, prev => ({
                        chapters: (prev.chapters || []).filter((_, i) => i !== idx)
                      }));
                    }}
                    onMoveUp={() => {
                      updateSubject(selectedSubjectIndex, prev => {
                        const arr = [...(prev.chapters || [])];
                        if (idx > 0) { [arr[idx], arr[idx - 1]] = [arr[idx - 1], arr[idx]]; }
                        return { chapters: arr.map((ch, i) => ({ ...ch, order: i })) };
                      });
                    }}
                    onMoveDown={() => {
                      updateSubject(selectedSubjectIndex, prev => {
                        const arr = [...(prev.chapters || [])];
                        if (idx < arr.length - 1) { [arr[idx], arr[idx + 1]] = [arr[idx + 1], arr[idx]]; }
                        return { chapters: arr.map((ch, i) => ({ ...ch, order: i })) };
                      });
                    }}
                    isFirst={idx === 0}
                    isLast={idx === (subjects[selectedSubjectIndex]?.chapters || []).length - 1}
                    onManageContent={() => setSelectedChapterIndex(idx)}
                  />
                ))}
              </div>

              {(subjects[selectedSubjectIndex]?.chapters || []).length > 0 && (
                <button
                  onClick={() => {
                    const newItem = { _id: `temp_${Date.now()}`, title: '', duration: '', videoUrl: '', isPremium: false, order: (subjects[selectedSubjectIndex]?.chapters || []).length };
                    updateSubject(selectedSubjectIndex, prev => ({ chapters: [...(prev.chapters || []), newItem] }));
                  }}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border text-sm font-extrabold transition-all hover:scale-[1.02] active:scale-95 bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                >
                  <IconPlus size={16} stroke={2.5} />
                  Add Chapter
                </button>
              )}
            </div>
          )}

                    {activeTab === 'curriculum' && selectedSubjectIndex !== null && selectedChapterIndex !== null && (
            <div className="p-6 md:p-8 max-w-3xl">
              <div className="mb-6">
                <button 
                  onClick={() => setSelectedChapterIndex(null)}
                  className="flex items-center gap-1.5 text-sm font-semibold text-on-surface-variant hover:text-on-surface transition-colors mb-4"
                >
                  <IconArrowLeft size={16} stroke={2} />
                  Back to Chapters
                </button>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                    {subjects[selectedSubjectIndex]?.title || `Subject ${selectedSubjectIndex + 1}`}
                  </span>
                  <IconChevronDown size={12} className="-rotate-90 text-on-surface-variant" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-primary">
                    {(subjects[selectedSubjectIndex]?.chapters || [])[selectedChapterIndex]?.title || `Chapter ${selectedChapterIndex + 1}`}
                  </span>
                </div>
                <h2 className="text-xl font-bold text-on-surface">Manage Content</h2>
                <p className="text-sm text-on-surface-variant mt-1">
                  Edit notes, quizzes, and Q&A for this chapter.
                </p>
              </div>

              <ChapterContentEditor 
                chapter={(subjects[selectedSubjectIndex]?.chapters || [])[selectedChapterIndex]} 
                onUpdate={patch => {
                  const updatedSubjects = [...subjects];
                  const currentChapters = [...(updatedSubjects[selectedSubjectIndex].chapters || [])];
                  currentChapters[selectedChapterIndex] = { ...currentChapters[selectedChapterIndex], ...patch };
                  updatedSubjects[selectedSubjectIndex] = { ...updatedSubjects[selectedSubjectIndex], chapters: currentChapters };
                  setSubjects(updatedSubjects);
                }} 
              />
            </div>
          )}

          {/* ── Settings Tab ── */}

          {activeTab === 'settings' && (
            <div className="p-6 md:p-8 max-w-2xl space-y-8">
              <div>
                <h2 className="text-xl font-bold text-on-surface">Course Settings</h2>
                <p className="text-sm text-on-surface-variant mt-1">Configure the course metadata and appearance.</p>
              </div>

              {/* Basic info */}
              <div className="space-y-5">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-widest text-on-surface-variant">Course Title</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 rounded-xl bg-background border border-outline-variant/40 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40"
                    value={meta.title}
                    onChange={e => setMeta(m => ({ ...m, title: e.target.value }))}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-widest text-on-surface-variant">Class / Grade</label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 rounded-xl bg-background border border-outline-variant/40 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40"
                      value={meta.class}
                      onChange={e => setMeta(m => ({ ...m, class: e.target.value }))}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-widest text-on-surface-variant">Subject</label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 rounded-xl bg-background border border-outline-variant/40 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40"
                      value={meta.subject}
                      onChange={e => setMeta(m => ({ ...m, subject: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-widest text-on-surface-variant">Course Summary</label>
                  <textarea
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl bg-background border border-outline-variant/40 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
                    value={meta.summary}
                    onChange={e => setMeta(m => ({ ...m, summary: e.target.value }))}
                    placeholder="What will students learn in this course?"
                  />
                </div>
                <div className="flex flex-col gap-1.5 mt-4">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold uppercase tracking-widest text-on-surface-variant">Course Thumbnail Image URL</label>
                    <label className="text-[10px] font-bold text-primary cursor-pointer hover:underline flex items-center gap-1">
                      <IconCloudUpload size={14} /> Upload Image
                      <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                    </label>
                  </div>
                  <input
                    type="text"
                    className="w-full px-4 py-3 rounded-xl bg-background border border-outline-variant/40 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40"
                    placeholder="e.g. https://images.unsplash.com/photo-... or local asset path"
                    value={meta.thumbnail}
                    onChange={e => setMeta(m => ({ ...m, thumbnail: e.target.value }))}
                  />
                </div>
              </div>

              {/* Cover color */}
              <div>
                <label className="text-[11px] font-bold uppercase tracking-widest text-on-surface-variant mb-3 block">Cover Color</label>
                <div className="flex flex-wrap gap-3">
                  {COVER_COLORS.map(color => (
                    <button
                      key={color}
                      onClick={() => setMeta(m => ({ ...m, coverColor: color }))}
                      className="w-9 h-9 rounded-xl transition-transform hover:scale-110 active:scale-95"
                      style={{
                        background: color,
                        outline: meta.coverColor === color ? `3px solid ${color}` : 'none',
                        outlineOffset: 2,
                        boxShadow: meta.coverColor === color ? `0 0 12px ${color}66` : 'none',
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Premium Status */}
              <div className="p-5 rounded-2xl bg-surface-container border border-outline-variant/30">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <p className="font-bold text-on-surface">Premium Course</p>
                      <IconCrown size={15} className="text-amber-400" />
                    </div>
                    <p className="text-xs text-on-surface-variant mt-0.5">Require subscription for full access. Free users can only learn sample chapters.</p>
                  </div>
                  <button
                    onClick={() => setMeta(m => ({ ...m, isPremium: !m.isPremium }))}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 ${meta.isPremium ? 'bg-amber-500' : 'bg-surface-variant'}`}
                  >
                    <span
                      className="inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-300"
                      style={{ transform: meta.isPremium ? 'translateX(22px)' : 'translateX(4px)' }}
                    />
                  </button>
                </div>
              </div>

              {/* Publish */}
              <div className="p-5 rounded-2xl bg-surface-container border border-outline-variant/30">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-on-surface">Publish Course</p>
                    <p className="text-xs text-on-surface-variant mt-0.5">Students can only access published courses.</p>
                  </div>
                  <button
                    onClick={() => setMeta(m => ({ ...m, isPublished: !m.isPublished }))}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 ${meta.isPublished ? 'bg-emerald-500' : 'bg-surface-variant'}`}
                  >
                    <span
                      className="inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-300"
                      style={{ transform: meta.isPublished ? 'translateX(22px)' : 'translateX(4px)' }}
                    />
                  </button>
                </div>
              </div>
            </div>
          )}


        </main>
      </div>
    </div>
  );
}
