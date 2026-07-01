import React, { useState, useEffect } from 'react';
import {
  IconX, IconPlus, IconTrash, IconBook2,
  IconMusic, IconHelp, IconVideo, IconFileText, IconPencil,
  IconCheck, IconEye, IconEyeOff, IconCrown, IconChevronDown,
  IconChevronUp, IconArrowLeft, IconCloudUpload,
  IconSparkles, IconBulb, IconPlayerPlay, IconDeviceLaptop,
  IconMessageQuestion, IconCircleCheck, IconCircle, IconGripVertical,
  IconLoader2,
} from '@tabler/icons-react';
import {
  updateCourse,
  getLessonContent, updateLessonContent,
  getLessonQuiz, updateLessonQuiz,
  getLessonQa, updateLessonQa,
  uploadFile
} from '../../services/api';

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

// ── Helper: generate a temp ID ──────────────────────────────
const tempId = () => `tmp_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

// ── Quiz editor ─────────────────────────────────────────────
function QuizEditor({ questions = [], onChange }) {
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
      const options = [];
      let correctIndex = 0;
      let explanationText = '';
      
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        
        const optMatch = line.match(/^(?:\d+|\w)\s*[\)\.\-]\s*(.*)/i);
        if (optMatch) {
          options.push(optMatch[1].trim());
          continue;
        }
        
        const correctMatch = line.match(/^Correct:\s*(.*)/i);
        if (correctMatch) {
          const ansVal = correctMatch[1].trim();
          const numVal = parseInt(ansVal, 10);
          if (!isNaN(numVal)) {
            correctIndex = numVal - 1;
          } else if (ansVal.length === 1) {
            const code = ansVal.toLowerCase().charCodeAt(0);
            if (code >= 97 && code <= 122) {
              correctIndex = code - 97;
            }
          }
          continue;
        }
        
        const expMatch = line.match(/^Explanation:\s*(.*)/i);
        if (expMatch) {
          explanationText = expMatch[1].trim();
          continue;
        }
      }
      
      if (options.length === 0 && lines.length > 1) {
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i];
          if (!line.startsWith('Correct:') && !line.startsWith('Explanation:')) {
            options.push(line);
          }
        }
      }
      
      if (questionText) {
        parsedQs.push({
          _id: tempId(),
          question: questionText,
          options: options.length > 0 ? options : ['', '', '', ''],
          correctIndex: Math.max(0, Math.min(options.length - 1, correctIndex)),
          explanation: explanationText
        });
      }
    }
    
    if (parsedQs.length > 0) {
      onChange([...questions, ...parsedQs]);
      setRawText('');
      setShowRawPaste(false);
    } else {
      alert("No questions matched. Please follow the format:\nQ: [Question]\n1) Option 1\n2) Option 2\nCorrect: 1");
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

  const removeQ = (idx) => onChange(questions.filter((_, i) => i !== idx));

  return (
    <div className="space-y-4">
      {questions.map((q, qIdx) => (
        <div key={q._id || qIdx} className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 space-y-3">
          <div className="flex items-start gap-2">
            <div className="flex flex-col gap-2 shrink-0">
              <span className="text-[11px] font-bold text-amber-400 bg-amber-500/15 px-2 py-0.5 rounded-md text-center mt-1">Q{qIdx + 1}</span>
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
                className="text-[10px] font-bold bg-surface border border-outline-variant/30 text-on-surface rounded-md px-1 py-1 focus:outline-none focus:ring-1 focus:ring-amber-500/50"
              >
                <option value="mcq">MCQ</option>
                <option value="true_false">T / F</option>
                <option value="fill_in_the_blanks">Blanks</option>
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
            <p className="text-xs font-bold text-amber-400">Import MCQ Questions (Raw Paste)</p>
            <p className="text-[10px] text-on-surface-variant mt-0.5 leading-relaxed">
              Use this pattern to paste multiple questions at once:<br/>
              <span className="font-mono text-amber-300/80 block mt-1 bg-background/50 p-2 rounded text-[10px]">
                Q: Which model describes a plum pudding?<br/>
                1) Rutherford Model<br/>
                2) Bohr Model<br/>
                3) Thomson Model<br/>
                Correct: 3<br/>
                Explanation: Plum pudding is Thomson.<br/>
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
      alert("No Q&A pairs matched. Please follow the format:\nQ: [Question]\nA: [Answer]");
    }
  };

  const addPair = () => onChange([...qas, { _id: tempId(), question: '', answer: '' }]);
  const updatePair = (idx, patch) => onChange(qas.map((p, i) => i === idx ? { ...p, ...patch } : p));
  const removePair = (idx) => onChange(qas.filter((_, i) => i !== idx));

  return (
    <div className="space-y-3">
      {qas.map((pair, idx) => (
        <div key={pair._id || idx} className="rounded-xl border border-violet-500/20 bg-violet-500/5 p-4 space-y-2">
          <div className="flex items-center gap-2">
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

function LessonItemCard({ item, index, onUpdate, onDelete, onMoveUp, onMoveDown, isFirst, isLast }) {
  const [expanded, setExpanded] = useState(true);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const typeInfo = LESSON_TYPES.find(t => t.value === item.type) || LESSON_TYPES[0];
  const Icon = typeInfo.icon;

  useEffect(() => {
    const hasData = item.content !== undefined || item.questions !== undefined || item.qas !== undefined;
    if (!hasData && expanded && item._id && !String(item._id).startsWith('temp_') && !String(item._id).startsWith('tmp_')) {
      const fetchDetails = async () => {
        setDetailsLoading(true);
        try {
          if (item.type === 'notes' || item.type === 'lesson' || item.type === 'reading') {
            const res = await getLessonContent(item._id);
            onUpdate({ content: res.content });
          } else if (item.type === 'quiz') {
            const res = await getLessonQuiz(item._id);
            onUpdate({ questions: res.questions });
          } else if (item.type === 'qa') {
            const res = await getLessonQa(item._id);
            onUpdate({ qas: res.qas });
          }
        } catch (err) {
          console.error("Failed to load item details:", err);
        } finally {
          setDetailsLoading(false);
        }
      };
      fetchDetails();
    }
  }, [expanded, item._id, item.type]);

  return (
    <div className={`rounded-xl border transition-all duration-200 ${expanded ? 'border-primary/30 bg-surface-container-high' : 'border-outline-variant/15 bg-surface-container-low hover:border-outline-variant/30'}`}>
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
        <div className={`flex items-center gap-1 px-2.5 py-1 rounded-md border text-[10px] font-bold shrink-0 ${typeInfo.bg} ${typeInfo.color}`}>
          <Icon size={11} stroke={2.5} />
          {typeInfo.label}
        </div>
        <input
          type="text"
          placeholder="Item Name (e.g. Quick Notes, Quiz 1)"
          className="flex-1 min-w-0 bg-transparent text-xs font-semibold text-on-surface outline-none border-b border-transparent focus:border-primary/50 pb-0.5"
          value={item.title}
          onChange={e => onUpdate({ title: e.target.value })}
        />
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-1 rounded-md hover:bg-surface-variant transition-colors text-on-surface-variant hover:text-on-surface"
          >
            {expanded ? <IconChevronUp size={14} stroke={2} /> : <IconChevronDown size={14} stroke={2} />}
          </button>
          <button
            onClick={onDelete}
            className="p-1 rounded-md hover:bg-error/10 hover:text-error transition-colors text-on-surface-variant"
          >
            <IconTrash size={14} stroke={2} />
          </button>
        </div>
      </div>
      {expanded && (
        <div className="px-3 pb-3 pt-1 border-t border-outline-variant/10 space-y-3">
          {detailsLoading ? (
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <IconLoader2 className="animate-spin text-primary mb-2" size={20} />
              <p className="text-[10px] text-on-surface-variant">Loading details...</p>
            </div>
          ) : (
            <>
              <div>
                <label className="text-[9px] font-bold uppercase tracking-widest text-on-surface-variant mb-1 block">Item Type</label>
                <div className="flex flex-wrap gap-1.5">
                  {LESSON_TYPES.map(t => {
                    const TIcon = t.icon;
                    return (
                      <button
                        key={t.value}
                        onClick={() => onUpdate({ type: t.value })}
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-md border text-[10px] font-bold transition-all ${
                          item.type === t.value
                            ? `${t.bg} ${t.color} scale-105 shadow-sm`
                            : 'border-outline-variant/20 text-on-surface-variant hover:border-outline-variant'
                        }`}
                      >
                        <TIcon size={11} stroke={2.5} /> {t.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Item premium status */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-background border border-outline-variant/20">
                <div className="flex items-center gap-2">
                  <IconCrown size={14} className={item.isPremium ? 'text-amber-400' : 'text-on-surface-variant'} />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface">Premium Item (Locked for Free Users)</span>
                </div>
                <button
                  onClick={() => onUpdate({ isPremium: !item.isPremium })}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${item.isPremium ? 'bg-amber-500' : 'bg-surface-variant'}`}
                >
                  <span className="inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform shadow-sm" style={{ transform: item.isPremium ? 'translateX(18px)' : 'translateX(2px)' }} />
                </button>
              </div>

              {(item.type === 'notes' || item.type === 'lesson' || item.type === 'reading') && (
                <div>
                  <label className="text-[9px] font-bold uppercase tracking-widest text-emerald-400 mb-1.5 block">Notes / Content</label>
                  <textarea
                    rows={6}
                    placeholder="Enter lesson notes, markdown, or key summary points..."
                    className="w-full px-3 py-2 rounded-xl bg-background border border-outline-variant/40 text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-emerald-500/30 placeholder:text-on-surface-variant/40 resize-y font-mono leading-relaxed"
                    value={item.content || ''}
                    onChange={e => onUpdate({ content: e.target.value })}
                  />
                </div>
              )}
              {item.type === 'quiz' && (
                <div>
                  <label className="text-[9px] font-bold uppercase tracking-widest text-amber-400 mb-2 block">Quiz Questions</label>
                  <QuizEditor
                    questions={item.questions || []}
                    onChange={qs => onUpdate({ questions: qs })}
                  />
                </div>
              )}
              {item.type === 'qa' && (
                <div>
                  <label className="text-[9px] font-bold uppercase tracking-widest text-violet-400 mb-2 block">Q&A Pairs</label>
                  <QaEditor
                    qas={item.qas || []}
                    onChange={pairs => onUpdate({ qas: pairs })}
                  />
                </div>
              )}

            </>
          )}
        </div>
      )}
    </div>
  );
}

function LessonCard({ lesson, index, onUpdate, onDelete, onMoveUp, onMoveDown, isFirst, isLast }) {
  const [expanded, setExpanded] = useState(true);
  const [editing, setEditing] = useState(false);
  const items = lesson.items || [];

  const updateItem = (itemIdx, patch) => {
    onUpdate(prevLesson => ({
      items: (prevLesson.items || []).map((item, idx) => idx === itemIdx ? { ...item, ...patch } : item)
    }));
  };

  const deleteItem = (itemIdx) => {
    onUpdate(prevLesson => ({
      items: (prevLesson.items || []).filter((_, idx) => idx !== itemIdx)
    }));
  };

  const addItem = (type) => {
    const newItem = {
      _id: `temp_${Date.now()}`,
      title: '',
      type,
      duration: '',
      videoUrl: '',
      isPremium: true,
      order: items.length
    };
    onUpdate(prevLesson => ({
      items: [...(prevLesson.items || []), newItem]
    }));
  };

  const moveItem = (itemIdx, direction) => {
    onUpdate(prevLesson => {
      const arr = [...(prevLesson.items || [])];
      const targetIdx = itemIdx + direction;
      if (targetIdx < 0 || targetIdx >= arr.length) return {};
      [arr[itemIdx], arr[targetIdx]] = [arr[targetIdx], arr[itemIdx]];
      const updated = arr.map((item, idx) => ({ ...item, order: idx }));
      return { items: updated };
    });
  };

  return (
    <div className={`rounded-2xl border transition-all duration-200 ${expanded ? 'border-primary/40 bg-surface-container' : 'border-outline-variant/25 bg-surface-container-lowest hover:border-outline-variant/50'}`}>
      <div className="flex items-center gap-3 p-4">
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
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-bold shrink-0 bg-blue-500/10 border-blue-500/20 text-blue-400">
          <IconBook2 size={13} stroke={2.5} />
          Lesson Heading
        </div>
        <div className="flex-1 min-w-0">
          {editing ? (
            <input
              autoFocus
              className="w-full bg-transparent text-sm font-semibold text-on-surface outline-none border-b border-primary/50 pb-0.5"
              value={lesson.title}
              onChange={e => onUpdate({ title: e.target.value })}
              onBlur={() => setEditing(false)}
              onKeyDown={e => e.key === 'Enter' && setEditing(false)}
            />
          ) : (
            <button
              onClick={() => setEditing(true)}
              className="w-full text-left text-sm font-semibold text-on-surface truncate hover:text-primary transition-colors"
            >
              {lesson.title || <span className="text-on-surface-variant italic">Untitled Lesson Heading</span>}
            </button>
          )}
          {items.length > 0 && (
            <span className="text-[11px] text-on-surface-variant/70 block mt-0.5">
              {items.length} item{items.length !== 1 ? 's' : ''} under this lesson
            </span>
          )}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-1.5 rounded-lg hover:bg-surface-variant transition-colors text-on-surface-variant hover:text-on-surface"
          >
            {expanded ? <IconChevronUp size={16} stroke={2} /> : <IconChevronDown size={16} stroke={2} />}
          </button>
          <button
            onClick={onDelete}
            className="p-1.5 rounded-lg hover:bg-error/10 hover:text-error transition-colors text-on-surface-variant"
          >
            <IconTrash size={16} stroke={2} />
          </button>
        </div>
      </div>
      {expanded && (
        <div className="px-4 pb-4 pt-1 border-t border-outline-variant/20 space-y-4">
          <div className="pt-3">
            <label className="text-[11px] font-bold uppercase tracking-widest text-on-surface-variant mb-2 block">Lesson Description</label>
            <textarea
              rows={2}
              placeholder="Briefly describe what this lesson is about..."
              className="w-full px-3 py-2 rounded-xl bg-background border border-outline-variant/40 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40 placeholder:text-on-surface-variant/40 resize-none"
              value={lesson.description || ''}
              onChange={e => onUpdate({ description: e.target.value })}
            />
          </div>
          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-3 cursor-pointer">
              <button
                type="button"
                onClick={() => {
                  const newIsPremium = !lesson.isPremium;
                  onUpdate({ 
                    isPremium: newIsPremium,
                    items: items.map(item => ({ ...item, isPremium: newIsPremium }))
                  });
                }}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${lesson.isPremium ? 'bg-amber-500' : 'bg-surface-variant'}`}
              >
                <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform shadow-sm`} style={{ transform: lesson.isPremium ? 'translateX(18px)' : 'translateX(2px)' }} />
              </button>
              <span className="text-xs font-semibold text-on-surface flex items-center gap-1.5">
                <IconCrown size={13} className={lesson.isPremium ? 'text-amber-400' : 'text-on-surface-variant'} />
                Premium Content
              </span>
            </label>
          </div>
          <hr className="border-outline-variant/20 my-4" />
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold uppercase tracking-widest text-on-surface-variant block">Lesson Content Items</label>
            </div>
            <div className="space-y-2">
              {items.map((item, idx) => (
                <LessonItemCard
                  key={item._id || idx}
                  item={item}
                  index={idx}
                  onUpdate={patch => updateItem(idx, patch)}
                  onDelete={() => deleteItem(idx)}
                  onMoveUp={() => moveItem(idx, -1)}
                  onMoveDown={() => moveItem(idx, 1)}
                  isFirst={idx === 0}
                  isLast={idx === items.length - 1}
                />
              ))}
              {items.length === 0 && (
                <div className="text-center py-6 border border-dashed border-outline-variant/30 rounded-xl bg-surface-container-lowest">
                  <p className="text-xs text-on-surface-variant/60">No items added to this lesson yet.</p>
                </div>
              )}
            </div>
            <div className="flex flex-wrap gap-2 pt-2">
              {LESSON_TYPES.map(t => {
                const TIcon = t.icon;
                return (
                  <button
                    key={t.value}
                    onClick={() => addItem(t.value)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-bold transition-all hover:scale-105 active:scale-95 ${t.bg} ${t.color}`}
                  >
                    <IconPlus size={12} stroke={2.5} />
                    Add {t.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CourseDesigner({ course, onClose, onSaved }) {
  const [lessons, setLessons] = useState(course.lessons || []);
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

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const res = await uploadFile(file, 'courses/thumbnails');
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
      const fullUrl = `${backendUrl}${res.url}`;
      setMeta(m => ({ ...m, thumbnail: fullUrl }));
    } catch (err) {
      alert("Failed to upload file: " + err.message);
    }
  };

  const addLesson = () => {
    setLessons(prev => [...prev, {
      _id: `temp_${Date.now()}`,
      title: '',
      description: '',
      isPremium: true,
      order: prev.length,
      items: [],
    }]);
  };

  const updateLesson = (index, patch) => {
    setLessons(prev => prev.map((l, i) => {
      if (i !== index) return l;
      const appliedPatch = typeof patch === 'function' ? patch(l) : patch;
      return { ...l, ...appliedPatch };
    }));
  };

  const deleteLesson = (index) => {
    setLessons(prev => prev.filter((_, i) => i !== index));
  };

  const moveLesson = (index, direction) => {
    setLessons(prev => {
      const arr = [...prev];
      const target = index + direction;
      if (target < 0 || target >= arr.length) return arr;
      [arr[index], arr[target]] = [arr[target], arr[index]];
      return arr;
    });
  };

  const handleSave = async () => {
    // Validate — every lesson must have a title
    const untitled = lessons.findIndex(l => !l.title?.trim());
    if (untitled !== -1) {
      alert(`Lesson Heading ${untitled + 1} has no title. Please add a title before saving.`);
      return;
    }
    setSaving(true);
    try {
      // Clean lessons outline to save
      const cleanLessons = lessons.map((l, i) => {
        const cleanItems = (l.items || []).map((item, idx) => {
          const itemClean = {
            title: item.title?.trim() || `${LESSON_TYPES.find(t => t.value === item.type)?.label || 'Item'} ${idx + 1}`,
            type: item.type || 'notes',
            duration: item.duration || '',
            order: idx,
            isPremium: !!item.isPremium,
          };
          if (item._id && !String(item._id).startsWith('temp_') && !String(item._id).startsWith('tmp_')) {
            itemClean._id = item._id;
          }
          return itemClean;
        });

        const clean = {
          title: l.title.trim(),
          description: l.description || '',
          isPremium: !!l.isPremium,
          order: i,
          items: cleanItems,
        };
        if (l._id && !String(l._id).startsWith('temp_') && !String(l._id).startsWith('tmp_')) {
          clean._id = l._id;
        }
        return clean;
      });

      const updated = await updateCourse(course._id, {
        ...meta,
        lessons: cleanLessons,
      });

      // Now save details for all items inside all lessons
      const updatedLessons = updated?.lessons || [];
      for (let lIdx = 0; lIdx < updatedLessons.length; lIdx++) {
        const cleanL = updatedLessons[lIdx];
        const localL = lessons[lIdx];

        if (localL && localL.items) {
          const cleanItems = cleanL?.items || [];
          for (let iIdx = 0; iIdx < cleanItems.length; iIdx++) {
            const cleanItem = cleanItems[iIdx];
            const localItem = localL.items[iIdx];

            if (localItem) {
              const isNewItem = !localItem._id || String(localItem._id).startsWith('temp_') || String(localItem._id).startsWith('tmp_');
              
              if (cleanItem.type === 'notes' && (localItem.content !== undefined || isNewItem)) {
                await updateLessonContent(cleanItem._id, localItem.content || '');
              } else if (cleanItem.type === 'quiz' && (localItem.questions !== undefined || isNewItem)) {
                const cleanQs = (localItem.questions || []).map(q => {
                  const { _id: qid, ...qrest } = q;
                  const cq = { ...qrest };
                  if (qid && !String(qid).startsWith('tmp_') && !String(qid).startsWith('temp_')) cq._id = qid;
                  return cq;
                });
                await updateLessonQuiz(cleanItem._id, cleanQs);
              } else if (cleanItem.type === 'qa' && (localItem.qas !== undefined || isNewItem)) {
                const cleanQas = (localItem.qas || []).map(p => {
                  const { _id: pid, ...prest } = p;
                  const cp = { ...prest };
                  if (pid && !String(pid).startsWith('tmp_') && !String(pid).startsWith('temp_')) cp._id = pid;
                  return cp;
                });
                await updateLessonQa(cleanItem._id, cleanQas);
              }
            }
          }
        }
      }

      // Update local state with real DB IDs but keep our content!
      const mergedLessons = (updated?.lessons || []).map((serverL, lIdx) => {
        const localL = lessons[lIdx];
        if (!localL) return serverL;
        return {
          ...serverL,
          items: (serverL.items || []).map((serverI, iIdx) => {
            const localI = (localL.items || [])[iIdx];
            if (!localI) return serverI;
            return {
              ...serverI,
              content: localI.content,
              questions: localI.questions,
              qas: localI.qas
            };
          })
        };
      });
      setLessons(mergedLessons);

      setSaved(true);
      onSaved(updated);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      alert('Failed to save: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const totalLessons = lessons.length;
  const premiumCount = lessons.filter(l => l.isPremium).length;
  
  const totalItemsCount = lessons.reduce((acc, l) => acc + (l.items || []).length, 0);
  
  const typeBreakdown = LESSON_TYPES.map(t => {
    const count = lessons.reduce((acc, l) => {
      return acc + (l.items || []).filter(item => item.type === t.value).length;
    }, 0);
    return { ...t, count };
  }).filter(t => t.count > 0);

  return (
    <div className="fixed inset-0 z-[300] flex flex-col bg-[#0f1117] animate-in fade-in duration-200">
      {/* ─── Top Bar ─── */}
      <header className="shrink-0 flex items-center justify-between px-5 md:px-8 h-16 border-b border-white/[0.07] bg-[#0f1117]/95 backdrop-blur">
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

        <div className="flex items-center gap-2">
          {/* Publish toggle */}
          <button
            onClick={() => setMeta(m => ({ ...m, isPublished: !m.isPublished }))}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border transition-all ${
              meta.isPublished
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : 'bg-surface-variant/50 border-outline-variant/30 text-on-surface-variant'
            }`}
          >
            {meta.isPublished ? <IconEye size={15} stroke={2} /> : <IconEyeOff size={15} stroke={2} />}
            <span className="hidden sm:inline">{meta.isPublished ? 'Published' : 'Draft'}</span>
          </button>

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
          {/* Course card preview */}
          <div
            className="m-5 p-5 rounded-2xl flex flex-col gap-3 relative overflow-hidden"
            style={{ background: `linear-gradient(135deg, ${meta.coverColor}22, ${meta.coverColor}08)`, borderColor: `${meta.coverColor}30`, borderWidth: 1 }}
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: meta.coverColor + '33' }}>
              <IconBook2 size={20} stroke={1.5} style={{ color: meta.coverColor }} />
            </div>
            <div>
              <p className="font-bold text-on-surface leading-tight">{meta.title || 'Untitled Course'}</p>
              <p className="text-xs text-on-surface-variant mt-0.5">{meta.class} · {meta.subject}</p>
            </div>
            <div
              className="absolute top-0 right-0 w-20 h-20 rounded-bl-[100px] opacity-20"
              style={{ background: meta.coverColor }}
            />
          </div>

          {/* Stats */}
          <div className="px-5 grid grid-cols-2 gap-3 mb-5">
            <div className="bg-surface-container rounded-xl p-3">
              <p className="text-2xl font-bold text-on-surface">{totalLessons}</p>
              <p className="text-[11px] text-on-surface-variant uppercase tracking-wider mt-0.5">Items</p>
            </div>
            <div className="bg-surface-container rounded-xl p-3">
              <p className="text-2xl font-bold text-amber-400">{premiumCount}</p>
              <p className="text-[11px] text-on-surface-variant uppercase tracking-wider mt-0.5">Premium</p>
            </div>
          </div>

          {/* Type breakdown */}
          {typeBreakdown.length > 0 && (
            <div className="px-5 mb-5">
              <p className="text-[11px] font-bold uppercase tracking-widest text-on-surface-variant mb-3">Content Mix</p>
              <div className="space-y-2">
                {typeBreakdown.map(t => {
                  const TIcon = t.icon;
                  return (
                    <div key={t.value} className="flex items-center gap-2.5">
                      <div className={`w-6 h-6 rounded-lg border flex items-center justify-center ${t.bg}`}>
                        <TIcon size={13} stroke={2} className={t.color} />
                      </div>
                      <span className="text-xs text-on-surface-variant flex-1">{t.label}</span>
                      <span className="text-xs font-bold text-on-surface">{t.count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tips */}
          <div className="mx-5 mb-5 p-4 rounded-xl bg-primary/5 border border-primary/15">
            <div className="flex items-center gap-2 mb-2">
              <IconBulb size={14} className="text-primary" stroke={2} />
              <span className="text-[11px] font-bold uppercase tracking-widest text-primary">Tips</span>
            </div>
            <ul className="space-y-1.5">
              {['Start with a hook — put your strongest lesson first', 'Keep lessons under 15 min each', 'Mix content types to boost engagement', 'Mark key lessons as Premium'].map(tip => (
                <li key={tip} className="text-[11px] text-on-surface-variant leading-relaxed">{tip}</li>
              ))}
            </ul>
          </div>
        </aside>

        {/* ─── Main Editor ─── */}
        <main className="flex-1 overflow-y-auto">
          {/* Tab nav */}
          <div className="sticky top-0 z-10 bg-[#0f1117]/90 backdrop-blur border-b border-white/[0.07] px-6 md:px-8 flex gap-1">
            {[
              { id: 'curriculum', label: 'Curriculum', icon: IconBook2 },
              { id: 'settings', label: 'Course Settings', icon: IconSparkles },
              { id: 'preview', label: 'Student Preview', icon: IconDeviceLaptop },
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
          {activeTab === 'curriculum' && (
            <div className="p-6 md:p-8 max-w-3xl">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-on-surface">Curriculum Builder</h2>
                <p className="text-sm text-on-surface-variant mt-1">
                  Add lessons, songs, quizzes, and readings. Drag to reorder.
                </p>
              </div>

              {/* Lesson list */}
              <div className="space-y-3 mb-6">
                {lessons.length === 0 && (
                  <div className="text-center py-16 border border-dashed border-outline-variant/30 rounded-2xl">
                    <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-4">
                      <IconPlayerPlay size={26} stroke={1.5} className="text-primary" />
                    </div>
                    <h3 className="font-bold text-on-surface mb-1">No content yet</h3>
                    <p className="text-sm text-on-surface-variant mb-5">Add your first lesson to start building the curriculum.</p>
                    <button
                      onClick={addLesson}
                      className="bg-primary text-on-primary px-6 py-2.5 rounded-xl font-bold text-sm hover:brightness-110 active:scale-[0.98] transition-all"
                    >
                      Add First Lesson
                    </button>
                  </div>
                )}

                {lessons.map((lesson, i) => (
                  <LessonCard
                    key={lesson._id || i}
                    lesson={lesson}
                    index={i}
                    isFirst={i === 0}
                    isLast={i === lessons.length - 1}
                    onUpdate={patch => updateLesson(i, patch)}
                    onDelete={() => deleteLesson(i)}
                    onMoveUp={() => moveLesson(i, -1)}
                    onMoveDown={() => moveLesson(i, 1)}
                  />
                ))}
              </div>

              {/* Add buttons */}
              {lessons.length > 0 && (
                <button
                  onClick={addLesson}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-primary/20 text-primary bg-primary/10 text-xs font-bold transition-all hover:scale-105 active:scale-95 whitespace-nowrap"
                >
                  <IconPlus size={13} stroke={2.5} />
                  Add Lesson Heading
                </button>
              )}
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
                    <p className="text-xs text-on-surface-variant mt-0.5">Require subscription for full access. Free users can only learn sample items.</p>
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

          {/* ── Student Preview Tab ── */}
          {activeTab === 'preview' && (
            <div className="p-6 md:p-8">
              {/* Banner */}
              <div className="flex items-center gap-3 mb-6 px-4 py-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <IconDeviceLaptop size={18} className="text-amber-400 shrink-0" stroke={2} />
                <p className="text-sm text-amber-300 font-medium">
                  Live preview — updates as you edit. Save &amp; publish to make this visible to students.
                </p>
              </div>

              {/* ── Simulated student course page ── */}
              <div className="rounded-2xl overflow-hidden border border-white/[0.06] bg-[#12151f] shadow-2xl max-w-3xl">

                {/* Hero Banner */}
                <div
                  className="relative px-8 pt-10 pb-8 overflow-hidden"
                  style={{
                    background: `linear-gradient(135deg, ${meta.coverColor}35 0%, ${meta.coverColor}10 60%, transparent 100%)`,
                    borderBottom: `1px solid ${meta.coverColor}30`,
                  }}
                >
                  <div
                    className="absolute -top-12 -right-12 w-56 h-56 rounded-full blur-3xl opacity-20 pointer-events-none"
                    style={{ background: meta.coverColor }}
                  />
                  <div className="absolute bottom-0 left-0 right-0 h-px opacity-30"
                    style={{ background: `linear-gradient(90deg, transparent, ${meta.coverColor}, transparent)` }}
                  />

                  <div className="relative z-10 flex items-start gap-5">
                    <div
                      className="w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 shadow-lg"
                      style={{ background: `linear-gradient(135deg, ${meta.coverColor}ee, ${meta.coverColor}99)` }}
                    >
                      <IconBook2 size={28} stroke={1.5} className="text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center flex-wrap gap-2 mb-2">
                        <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: meta.coverColor }}>
                          {meta.subject || 'Subject'}
                        </span>
                        <span className="text-on-surface-variant/30">·</span>
                        <span className="text-[11px] text-on-surface-variant/60">{meta.class || 'Class'}</span>
                        <div className="ml-auto">
                          {meta.isPublished ? (
                            <span className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                              <IconEye size={11} stroke={2.5} /> Published
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-surface-variant/60 text-on-surface-variant border border-outline-variant/30">
                              <IconEyeOff size={11} stroke={2.5} /> Draft
                            </span>
                          )}
                        </div>
                      </div>
                      <h1 className="text-2xl font-bold text-white leading-tight mb-2">
                        {meta.title || <span className="opacity-40 italic">Untitled Course</span>}
                      </h1>
                      {meta.summary ? (
                        <p className="text-sm text-on-surface-variant leading-relaxed max-w-xl">{meta.summary}</p>
                      ) : (
                        <p className="text-sm text-on-surface-variant/30 italic">No summary added yet — add one in Course Settings.</p>
                      )}

                      {lessons.length > 0 && (
                        <div className="flex items-center flex-wrap gap-5 mt-4 pt-4 border-t border-white/[0.06]">
                          <div className="flex items-center gap-1.5 text-xs text-on-surface-variant">
                            <IconBook2 size={13} stroke={2} />
                            <span className="font-semibold text-on-surface">{lessons.length}</span> lesson{lessons.length !== 1 ? 's' : ''}
                          </div>
                          {premiumCount > 0 && (
                            <div className="flex items-center gap-1.5 text-xs text-amber-400">
                              <IconCrown size={13} stroke={2} />
                              <span className="font-semibold">{premiumCount}</span> premium
                            </div>
                          )}
                          {typeBreakdown.map(t => {
                            const TIcon = t.icon;
                            return (
                              <div key={t.value} className={`flex items-center gap-1.5 text-xs ${t.color}`}>
                                <TIcon size={13} stroke={2} />
                                <span className="font-semibold">{t.count}</span> {t.label.toLowerCase()}{t.count !== 1 ? 's' : ''}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Lesson list */}
                <div className="px-6 py-5">
                  {lessons.length === 0 ? (
                    <div className="text-center py-14">
                      <div className="w-14 h-14 rounded-2xl bg-surface-container border border-outline-variant/20 flex items-center justify-center mx-auto mb-4">
                        <IconPlayerPlay size={24} stroke={1} className="text-on-surface-variant/40" />
                      </div>
                      <p className="text-sm font-semibold text-on-surface-variant">No content yet</p>
                      <p className="text-xs text-on-surface-variant/50 mt-1">Add lessons in the Curriculum tab to see them here.</p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-widest text-on-surface-variant mb-4">
                        Course Content · {totalItemsCount} item{totalItemsCount !== 1 ? 's' : ''}
                      </p>
                      <div className="space-y-6">
                        {lessons.map((lesson, lessonIdx) => (
                          <div key={lesson._id || lessonIdx} className="space-y-3">
                            {/* Lesson Title Row */}
                            <div className="flex items-center gap-2 px-1">
                              <div className="w-6 h-6 rounded-md bg-surface-variant flex items-center justify-center text-xs font-bold text-on-surface-variant shrink-0">
                                {lessonIdx + 1}
                              </div>
                              <h3 className="text-sm font-bold text-on-surface truncate">
                                {lesson.title || <span className="italic opacity-40">Untitled Lesson</span>}
                              </h3>
                              {lesson.isPremium && (
                                <IconCrown size={14} className="text-amber-400 shrink-0 ml-1" />
                              )}
                            </div>

                            {/* Items List */}
                            <div className="space-y-2 pl-3 ml-3 border-l-2 border-outline-variant/10">
                              {(lesson.items || []).length === 0 ? (
                                <p className="text-xs text-on-surface-variant/50 italic py-2">No content items yet.</p>
                              ) : (
                                lesson.items.map((item, itemIdx) => {
                                  const typeInfo = LESSON_TYPES.find(t => t.value === item.type) || LESSON_TYPES[0];
                                  const LIcon = typeInfo.icon;
                                  const locked = item.isPremium;

                                  return (
                                    <div
                                      key={item._id || itemIdx}
                                      className={`group flex items-center gap-3 px-4 py-3 rounded-xl border transition-all ${
                                        locked
                                          ? 'bg-amber-500/5 border-amber-500/15'
                                          : 'bg-surface-container-lowest/60 border-white/[0.04] hover:bg-surface-container hover:border-white/[0.08]'
                                      }`}
                                    >
                                      {/* Type icon */}
                                      <div className={`w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 ${typeInfo.bg}`}>
                                        <LIcon size={15} stroke={2} className={typeInfo.color} />
                                      </div>

                                      {/* Content */}
                                      <div className="flex-1 min-w-0">
                                        <p className={`text-sm font-semibold truncate leading-tight ${locked ? 'text-on-surface-variant' : 'text-on-surface'}`}>
                                          {item.title || <span className="italic opacity-40">Untitled {typeInfo.label}</span>}
                                        </p>
                                        {(item.description || item.duration) && (
                                          <p className="text-xs text-on-surface-variant mt-0.5 truncate">
                                            {item.description}
                                            {item.description && item.duration && <span className="mx-1.5 opacity-30">·</span>}
                                            {item.duration && <span className="font-medium">{item.duration}</span>}
                                          </p>
                                        )}
                                      </div>

                                      {/* Right badges */}
                                      <div className="flex items-center gap-2 shrink-0">
                                        <span className={`hidden sm:inline-flex text-[10px] font-bold px-2 py-0.5 rounded-md border ${typeInfo.bg} ${typeInfo.color}`}>
                                          {typeInfo.label}
                                        </span>
                                        {locked ? (
                                          <span className="flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-lg bg-amber-500/15 border border-amber-500/25 text-amber-400">
                                            <IconCrown size={11} stroke={2.5} />
                                          </span>
                                        ) : (
                                          <div
                                            className="w-7 h-7 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                            style={{ background: meta.coverColor + '22' }}
                                          >
                                            <IconPlayerPlay size={13} stroke={2.5} style={{ color: meta.coverColor }} />
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Enroll CTA Footer */}
                <div
                  className="px-6 py-5 border-t flex items-center justify-between gap-4"
                  style={{ borderColor: `${meta.coverColor}20`, background: `${meta.coverColor}08` }}
                >
                  <div>
                    <p className="text-sm font-bold text-on-surface">
                      {meta.isPublished ? 'Ready to learn?' : 'Not yet published'}
                    </p>
                    <p className="text-xs text-on-surface-variant mt-0.5">
                      {lessons.length} lesson{lessons.length !== 1 ? 's' : ''}
                      {premiumCount > 0 ? ` · ${premiumCount} require premium` : ' · all free'}
                    </p>
                  </div>
                  <button
                    className="px-5 py-2.5 rounded-xl text-sm font-bold text-white shrink-0 transition-all hover:brightness-110 active:scale-[0.98] shadow-lg"
                    style={{ background: meta.coverColor, boxShadow: `0 4px 20px ${meta.coverColor}55` }}
                  >
                    {meta.isPublished ? 'Start Learning' : 'Publish First'}
                  </button>
                </div>
              </div>

              <p className="text-xs text-on-surface-variant/40 mt-4 text-center">
                Preview updates live. Students see this exact layout once the course is published.
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
