import fs from 'fs';
import path from 'path';

const designerPath = path.join(process.cwd(), 'src/components/Admin/CourseDesigner.jsx');
let designerCode = fs.readFileSync(designerPath, 'utf-8');

// 1. Rename variables
designerCode = designerCode
  .replace(/LessonItemCard/g, 'ChapterCard')
  .replace(/LessonCard/g, 'SubjectCard')
  .replace(/addLesson/g, 'addSubject')
  .replace(/lessons\.length/g, 'subjects.length')
  .replace(/lessons\.map/g, 'subjects.map')
  .replace(/setLessons/g, 'setSubjects')
  .replace(/\[lessons/g, '[subjects')
  .replace(/const lessons =/g, 'const subjects =')
  .replace(/lesson=\{/g, 'subject={')
  .replace(/lesson\./g, 'subject.')
  .replace(/items\./g, 'chapters.')
  .replace(/item\./g, 'chapter.')
  .replace(/items /g, 'chapters ')
  .replace(/ item /g, ' chapter ')
  .replace(/items\?/g, 'chapters?')
  .replace(/item\?/g, 'chapter?')
  .replace(/items\:/g, 'chapters:')
  .replace(/item\:/g, 'chapter:')
  .replace(/items\=/g, 'chapters=')
  .replace(/item\=/g, 'chapter=')
  .replace(/items\[/g, 'chapters[')
  .replace(/item\[/g, 'chapter[')
  .replace(/items,/g, 'chapters,')
  .replace(/item,/g, 'chapter,')
  .replace(/items\)/g, 'chapters)')
  .replace(/item\)/g, 'chapter)')
  .replace(/\{ items \}/g, '{ chapters }')
  .replace(/\{ item \}/g, '{ chapter }')
  .replace(/const items /g, 'const chapters ')
  .replace(/const item /g, 'const chapter ')
  .replace(/updateItem/g, 'updateChapter')
  .replace(/deleteItem/g, 'deleteChapter')
  .replace(/moveItem/g, 'moveChapter')
  .replace(/addItem/g, 'addChapter')
  .replace(/totalItems/g, 'totalChapters')
  .replace(/updateLesson/g, 'updateSubject')
  .replace(/deleteLesson/g, 'deleteSubject')
  .replace(/moveLesson/g, 'moveSubject')
  .replace(/totalLessons/g, 'totalSubjects')
  .replace(/>Lessons</g, '>Subjects<');

// Fix explicit useState
designerCode = designerCode.replace(
  `const [subjects, setSubjects] = useState(course.subjects || []);`,
  `const [subjects, setSubjects] = useState(course.subjects || course.lessons || []);`
);

// We need to completely replace the ChapterCard function.
// Let's use regex to find the start of function ChapterCard and end of it.
const chapterCardRegex = /function ChapterCard\(\{(.*?)\}\) \{([\s\S]*?)\n\}\n\nfunction SubjectCard/m;
const newChapterCard = `function ChapterCard({ chapter, index, chapters, onUpdate, onDelete, onMoveUp, onMoveDown, isFirst, isLast }) {
  const [expanded, setExpanded] = useState(true);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [autoConvertHtml, setAutoConvertHtml] = useState(true);
  const [isParsingFile, setIsParsingFile] = useState(false);
  const [activeTab, setActiveTab] = useState('notes'); // notes, qa, quiz

  const handlePaste = (e) => {
    const htmlData = e.clipboardData.getData('text/html');
    const plainText = e.clipboardData.getData('text/plain');
    
    if (autoConvertHtml && htmlData) {
      e.preventDefault();
      let markdown = htmlToMarkdown(htmlData);
      markdown = markdown.replace(/^[ \\t]*[•▪◦⚫][ \\t]*/gm, '- ');
      
      const textarea = e.target;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const currentValue = chapter.content || '';
      const newValue = currentValue.substring(0, start) + markdown + currentValue.substring(end);
      onUpdate({ content: newValue });
      setTimeout(() => {
        textarea.focus();
        textarea.selectionStart = textarea.selectionEnd = start + markdown.length;
      }, 0);
    } else if (plainText) {
      const hasUnicodeBullets = /^[ \\t]*[•▪◦⚫]/m.test(plainText);
      if (hasUnicodeBullets) {
        e.preventDefault();
        const formattedText = cleanDocumentText(plainText);
        const textarea = e.target;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const currentValue = chapter.content || '';
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
    const currentValue = chapter.content || '';
    if (!currentValue.trim()) return;
    onUpdate({ content: cleanDocumentText(currentValue) });
  };

  useEffect(() => {
    const hasData = chapter.content !== undefined || chapter.questions !== undefined || chapter.qas !== undefined;
    if (!hasData && expanded && chapter._id && !String(chapter._id).startsWith('temp_') && !String(chapter._id).startsWith('tmp_')) {
      const fetchDetails = async () => {
        setDetailsLoading(true);
        try {
          const [resC, resQ, resQa] = await Promise.all([
            getLessonContent(chapter._id).catch(() => ({ content: '' })),
            getLessonQuiz(chapter._id).catch(() => ({ questions: [] })),
            getLessonQa(chapter._id).catch(() => ({ qas: [] }))
          ]);
          onUpdate({ content: resC.content, questions: resQ.questions, qas: resQa.qas });
        } catch (err) {
          console.error("Failed to load chapter details:", err);
        } finally {
          setDetailsLoading(false);
        }
      };
      fetchDetails();
    }
  }, [expanded, chapter._id]);

  return (
    <div className={\`rounded-xl border transition-all duration-200 \${expanded ? 'border-primary/30 bg-surface-container-high' : 'border-outline-variant/15 bg-surface-container-low hover:border-outline-variant/30'}\`}>
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
        <div className="flex items-center gap-1 px-2.5 py-1 rounded-md border text-[10px] font-bold shrink-0 bg-primary/10 border-primary/20 text-primary">
          <IconBook2 size={11} stroke={2.5} /> Chapter
        </div>
        <input
          type="text"
          placeholder="Chapter Title"
          className="flex-1 min-w-0 bg-transparent text-xs font-semibold text-on-surface outline-none border-b border-transparent focus:border-primary/50 pb-0.5"
          value={chapter.title || ''}
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
              {/* Premium toggle */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-background border border-outline-variant/20">
                <div className="flex items-center gap-2">
                  <IconCrown size={14} className={chapter.isPremium ? 'text-amber-400' : 'text-on-surface-variant'} />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface">Premium Chapter (Locked for Free Users)</span>
                </div>
                <button
                  onClick={() => onUpdate({ isPremium: !chapter.isPremium })}
                  className={\`relative inline-flex h-5 w-9 items-center rounded-full transition-colors \${chapter.isPremium ? 'bg-amber-500' : 'bg-surface-variant'}\`}
                >
                  <span className="inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform shadow-sm" style={{ transform: chapter.isPremium ? 'translateX(18px)' : 'translateX(2px)' }} />
                </button>
              </div>

              {/* TABS */}
              <div className="flex gap-1 border-b border-outline-variant/20 mb-3">
                <button 
                  className={\`px-4 py-2 text-xs font-bold transition-colors border-b-2 \${activeTab === 'notes' ? 'border-emerald-400 text-emerald-400' : 'border-transparent text-on-surface-variant hover:text-on-surface'}\`}
                  onClick={() => setActiveTab('notes')}
                >
                  <div className="flex items-center gap-1.5"><IconFileText size={14}/> Notes</div>
                </button>
                <button 
                  className={\`px-4 py-2 text-xs font-bold transition-colors border-b-2 \${activeTab === 'qa' ? 'border-violet-400 text-violet-400' : 'border-transparent text-on-surface-variant hover:text-on-surface'}\`}
                  onClick={() => setActiveTab('qa')}
                >
                  <div className="flex items-center gap-1.5"><IconMessageQuestion size={14}/> Q&As</div>
                </button>
                <button 
                  className={\`px-4 py-2 text-xs font-bold transition-colors border-b-2 \${activeTab === 'quiz' ? 'border-amber-400 text-amber-400' : 'border-transparent text-on-surface-variant hover:text-on-surface'}\`}
                  onClick={() => setActiveTab('quiz')}
                >
                  <div className="flex items-center gap-1.5"><IconHelp size={14}/> Quiz</div>
                </button>
              </div>

              {/* NOTES TAB */}
              {activeTab === 'notes' && (
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <label className="text-[9px] font-bold uppercase tracking-widest text-emerald-400">Notes / Content</label>
                    <div className="flex items-center gap-2">
                      <label className="flex items-center gap-1 text-[10px] text-on-surface-variant cursor-pointer select-none">
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
                        className="px-2 py-0.5 rounded bg-surface border border-outline-variant/20 hover:border-outline-variant/50 text-[10px] font-bold text-on-surface-variant hover:text-on-surface transition-all"
                        title="Fix mid-sentence line breaks from PDF copy-paste"
                      >
                        Clean PDF Wraps
                      </button>
                      <button
                        type="button"
                        onClick={() => document.getElementById(\`doc-upload-\${chapter._id}\`).click()}
                        disabled={isParsingFile}
                        className="flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-[10px] font-bold text-emerald-400 transition-all disabled:opacity-50"
                      >
                        {isParsingFile ? (
                          <>
                            <IconLoader2 size={10} className="animate-spin" />
                            <span>Uploading...</span>
                          </>
                        ) : (
                          <>
                            <IconCloudUpload size={10} />
                            <span>Upload Document</span>
                          </>
                        )}
                      </button>
                      <input
                        id={\`doc-upload-\${chapter._id}\`}
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
                                ? \`\${import.meta.env.VITE_API_URL || 'http://localhost:5000'}\${res.url}\` 
                                : res.url;
                                
                              onUpdate({ fileUrl: finalUrl, fileType: type });
                            }
                          } catch (err) {
                            console.error('File upload failed:', err);
                          } finally {
                            setIsParsingFile(false);
                            e.target.value = ''; // Reset input
                          }
                        }}
                      />
                    </div>
                  </div>

                  {chapter.fileUrl ? (
                    <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl relative group">
                      <button
                        onClick={() => onUpdate({ fileUrl: '', fileType: 'link' })}
                        className="absolute top-2 right-2 p-1 bg-red-500/10 text-red-400 rounded-md transition-opacity hover:bg-red-500/20"
                        title="Remove attached document"
                      >
                        <IconTrash size={14} />
                      </button>
                      <p className="text-[10px] text-emerald-500 font-bold tracking-wider uppercase mb-3">Document Loaded as Notes</p>
                      <div className="flex gap-2 items-center mb-3 pr-8">
                        <input
                          type="text"
                          placeholder="Document link..."
                          className="flex-1 px-3 py-2 rounded-xl bg-background border border-outline-variant/40 text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                          value={chapter.fileUrl || ''}
                          onChange={e => onUpdate({ fileUrl: e.target.value, fileType: e.target.value.toLowerCase().endsWith('.pdf') ? 'pdf' : 'link' })}
                        />
                        <select
                          value={chapter.fileType || 'link'}
                          onChange={e => onUpdate({ fileType: e.target.value })}
                          className="px-2 py-2 rounded-xl bg-background border border-outline-variant/40 text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                        >
                          <option value="link">Auto (Link)</option>
                          <option value="pdf">PDF File</option>
                          <option value="doc">Word Doc</option>
                        </select>
                      </div>
                      <a href={chapter.fileUrl.startsWith('/') ? \`\${import.meta.env.VITE_API_URL || 'http://localhost:5000'}\${chapter.fileUrl}\` : chapter.fileUrl} target="_blank" rel="noreferrer" className="text-xs font-bold text-emerald-500 hover:underline">
                        Open in new tab to preview
                      </a>
                    </div>
                  ) : (
                    <>
                      <textarea
                        id={\`textarea-\${chapter._id}\`}
                        rows={6}
                        placeholder="Enter chapter notes, markdown, or key summary points..."
                        className="w-full px-3 py-2 rounded-xl bg-background border border-outline-variant/40 text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-emerald-500/30 placeholder:text-on-surface-variant/40 resize-y font-mono leading-relaxed"
                        value={chapter.content || ''}
                        onChange={e => onUpdate({ content: e.target.value })}
                        onPaste={handlePaste}
                        disabled={isParsingFile}
                      />
                      <div className="flex gap-2 items-center mt-2">
                        <input
                          type="text"
                          placeholder="Or paste a public document link here (e.g. https://.../file.pdf)"
                          className="flex-1 px-3 py-2 rounded-xl bg-background border border-outline-variant/40 text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-emerald-500/30 placeholder:text-on-surface-variant/40"
                          value={chapter.fileUrl || ''}
                          onChange={e => onUpdate({ fileUrl: e.target.value, fileType: e.target.value.toLowerCase().endsWith('.pdf') ? 'pdf' : 'link' })}
                        />
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* QA TAB */}
              {activeTab === 'qa' && (
                <div>
                  <QaEditor
                    qas={chapter.qas || []}
                    onChange={pairs => onUpdate({ qas: pairs })}
                  />
                </div>
              )}

              {/* QUIZ TAB */}
              {activeTab === 'quiz' && (
                <div>
                  <QuizEditor
                    questions={chapter.questions || []}
                    onChange={qs => onUpdate({ questions: qs })}
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

function SubjectCard`;

designerCode = designerCode.replace(chapterCardRegex, newChapterCard);

fs.writeFileSync(designerPath, designerCode, 'utf-8');
console.log('Done!');
