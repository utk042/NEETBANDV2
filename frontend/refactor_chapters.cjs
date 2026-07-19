const fs = require('fs');
const p = 'src/components/Admin/CourseDesigner.jsx';
let c = fs.readFileSync(p, 'utf8');

// 1. Rename 'Add Subject Heading' to 'Add Subject'
c = c.replace(/>\s*Add Subject Heading\s*<\/button>/g, '>\n                  Add Subject\n                </button>');

// 2. Add selectedChapterIndex to state
c = c.replace(/const \[selectedSubjectIndex, setSelectedSubjectIndex\] = useState\(null\);/g, `const [selectedSubjectIndex, setSelectedSubjectIndex] = useState(null);\n  const [selectedChapterIndex, setSelectedChapterIndex] = useState(null);`);

// 3. Update 'Back to Subjects' to also reset chapter index
c = c.replace(/onClick=\{\(\) => setSelectedSubjectIndex\(null\)\}/g, 'onClick={() => { setSelectedSubjectIndex(null); setSelectedChapterIndex(null); }}');

// 4. Update the ChapterCard calls in CourseDesigner to pass onManageContent
c = c.replace(/isLast=\{idx === \(subjects\[selectedSubjectIndex\]\?\.chapters \|\| \[\]\)\.length - 1\}/g, `isLast={idx === (subjects[selectedSubjectIndex]?.chapters || []).length - 1}\n                    onManageContent={() => setSelectedChapterIndex(idx)}`);

// 5. Replace the ChapterCard component with new ChapterCard and ChapterContentEditor
const chapterCardRegex = /function ChapterCard\(\{[\s\S]*?(?=function SubjectCard)/m;
const extractedCard = fs.readFileSync('chapter_card_extracted.txt', 'utf8');

const newComponents = `
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
        <div className="flex items-center gap-1 px-2.5 py-1 rounded-md border text-[10px] font-bold shrink-0 bg-emerald-500/10 border-emerald-500/20 text-emerald-400">
          <IconBook2 size={11} stroke={2.5} />
          Chapter
        </div>
        <input
          type="text"
          placeholder={\`Chapter \${index + 1}\`}
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

function ChapterContentEditor({ chapter, onUpdate }) {
  const { toast } = useDialog();
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [autoConvertHtml, setAutoConvertHtml] = useState(true);
  const [isParsingFile, setIsParsingFile] = useState(false);
  const [activeTab, setActiveTab] = useState('notes');

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
      const currentValue = chapter.content || '';
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
    const hasData = chapter.content !== undefined && chapter.questions !== undefined && chapter.qas !== undefined;
    if (!hasData && chapter._id && !String(chapter._id).startsWith('temp_') && !String(chapter._id).startsWith('tmp_')) {
      const fetchDetails = async () => {
        setDetailsLoading(true);
        try {
          const [contentRes, quizRes, qaRes] = await Promise.all([
            getLessonContent(chapter._id).catch(() => ({ content: '' })),
            getLessonQuiz(chapter._id).catch(() => ({ questions: [] })),
            getLessonQa(chapter._id).catch(() => ({ qas: [] }))
          ]);
          onUpdate({ 
            content: contentRes.content || '', 
            questions: quizRes.questions || [], 
            qas: qaRes.qas || [] 
          });
        } catch (err) {
          console.error("Failed to load chapter details:", err);
        } finally {
          setDetailsLoading(false);
        }
      };
      fetchDetails();
    }
  }, [chapter._id]);

  if (detailsLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center border border-outline-variant/20 rounded-2xl bg-surface-container-low">
        <IconLoader2 className="animate-spin text-primary mb-2" size={24} />
        <p className="text-xs text-on-surface-variant">Loading content details...</p>
      </div>
    );
  }

  return (
    <div className="border border-outline-variant/20 rounded-2xl bg-surface-container-low p-4 md:p-6">
      <div className="flex border-b border-outline-variant/20 mb-4">
        {[
          { id: 'notes', label: 'Notes', icon: IconFileText },
          { id: 'quiz', label: 'Quiz', icon: IconHelpCircle },
          { id: 'qa', label: 'Q&A', icon: IconMessageCircle }
        ].map(t => {
          const TIcon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={\`flex items-center gap-1.5 px-4 py-3 text-xs font-bold border-b-2 transition-all \${
                activeTab === t.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-on-surface-variant hover:text-on-surface'
              }\`}
            >
              <TIcon size={16} stroke={2.5} /> {t.label}
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-between p-3 rounded-xl bg-background border border-outline-variant/20 mb-4">
        <div className="flex items-center gap-2">
          <IconCrown size={16} className={chapter.isPremium ? 'text-amber-400' : 'text-on-surface-variant'} />
          <span className="text-xs font-bold uppercase tracking-wider text-on-surface">Premium Item (Locked for Free Users)</span>
        </div>
        <button
          onClick={() => onUpdate({ isPremium: !chapter.isPremium })}
          className={\`relative inline-flex h-6 w-11 items-center rounded-full transition-colors \${chapter.isPremium ? 'bg-amber-500' : 'bg-surface-variant'}\`}
        >
          <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm" style={{ transform: chapter.isPremium ? 'translateX(22px)' : 'translateX(4px)' }} />
        </button>
      </div>

      {activeTab === 'notes' && (
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
                onClick={() => document.getElementById(\`doc-upload-\${chapter._id}\`).click()}
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
                    toast.error('Failed to upload file: ' + err.message);
                  } finally {
                    setIsParsingFile(false);
                    e.target.value = '';
                  }
                }}
              />
            </div>
          </div>

          {chapter.fileUrl ? (
            <div className="p-5 bg-emerald-500/5 border border-emerald-500/20 rounded-xl relative group">
              <button
                onClick={() => onUpdate({ fileUrl: '', fileType: 'link' })}
                className="absolute top-3 right-3 p-1.5 bg-red-500/10 text-red-400 rounded-md transition-opacity hover:bg-red-500/20"
                title="Remove attached document"
              >
                <IconTrash size={16} />
              </button>
              <p className="text-[11px] text-emerald-500 font-bold tracking-wider uppercase mb-4">Document Loaded as Notes</p>
              <div className="flex gap-3 items-center mb-4 pr-10">
                <input
                  type="text"
                  placeholder="Document link..."
                  className="flex-1 px-4 py-2.5 rounded-xl bg-background border border-outline-variant/40 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                  value={chapter.fileUrl || ''}
                  onChange={e => onUpdate({ fileUrl: e.target.value, fileType: e.target.value.toLowerCase().endsWith('.pdf') ? 'pdf' : 'link' })}
                />
                <select
                  value={chapter.fileType || 'link'}
                  onChange={e => onUpdate({ fileType: e.target.value })}
                  className="px-3 py-2.5 rounded-xl bg-background border border-outline-variant/40 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                >
                  <option value="link">Auto (Link)</option>
                  <option value="pdf">PDF File</option>
                  <option value="doc">Word Doc</option>
                </select>
              </div>
              <a href={chapter.fileUrl.startsWith('/') ? \`\${import.meta.env.VITE_API_URL || 'http://localhost:5000'}\${chapter.fileUrl}\` : chapter.fileUrl} target="_blank" rel="noreferrer" className="text-sm font-bold text-emerald-500 hover:underline">
                Open in new tab to preview
              </a>
            </div>
          ) : (
            <>
              <textarea
                id={\`textarea-\${chapter._id}\`}
                rows={10}
                placeholder="Enter chapter notes, markdown, or key summary points..."
                className="w-full px-4 py-3 rounded-xl bg-background border border-outline-variant/40 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-emerald-500/30 placeholder:text-on-surface-variant/40 resize-y font-mono leading-relaxed"
                value={chapter.content || ''}
                onChange={e => onUpdate({ content: e.target.value })}
                onPaste={handlePaste}
                disabled={isParsingFile}
              />
              <div className="flex gap-2 items-center mt-3">
                <input
                  type="text"
                  placeholder="Or paste a public document link here (e.g. https://.../file.pdf)"
                  className="flex-1 px-4 py-3 rounded-xl bg-background border border-outline-variant/40 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-emerald-500/30 placeholder:text-on-surface-variant/40"
                  value={chapter.fileUrl || ''}
                  onChange={e => onUpdate({ fileUrl: e.target.value, fileType: e.target.value.toLowerCase().endsWith('.pdf') ? 'pdf' : 'link' })}
                />
              </div>
            </>
          )}
        </div>
      )}
      {activeTab === 'quiz' && (
        <div>
          <label className="text-[10px] font-bold uppercase tracking-widest text-amber-400 mb-3 block">Quiz Questions</label>
          <QuizEditor
            questions={chapter.questions || []}
            onChange={qs => onUpdate({ questions: qs })}
          />
        </div>
      )}
      {activeTab === 'qa' && (
        <div>
          <label className="text-[10px] font-bold uppercase tracking-widest text-violet-400 mb-3 block">Q&A Pairs</label>
          <QaEditor
            qas={chapter.qas || []}
            onChange={pairs => onUpdate({ qas: pairs })}
          />
        </div>
      )}
    </div>
  );
}
`;

c = c.replace(chapterCardRegex, newComponents);

// 6. Now add the Level 3 (Content Editor) view inside the Curriculum Tab rendering
const renderChapterEditorRegex = /\{\/\* ── Settings Tab ── \*\/\}/;
const newLevel3 = `          {activeTab === 'curriculum' && selectedSubjectIndex !== null && selectedChapterIndex !== null && (
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
                    {subjects[selectedSubjectIndex]?.title || \`Subject \${selectedSubjectIndex + 1}\`}
                  </span>
                  <IconChevronDown size={12} className="-rotate-90 text-on-surface-variant" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-primary">
                    {(subjects[selectedSubjectIndex]?.chapters || [])[selectedChapterIndex]?.title || \`Chapter \${selectedChapterIndex + 1}\`}
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
`;

// Replace it, but wait! The second view (selectedSubjectIndex !== null) should also have selectedChapterIndex === null 
c = c.replace(/\{activeTab === 'curriculum' && selectedSubjectIndex !== null && \(/g, 
  "{activeTab === 'curriculum' && selectedSubjectIndex !== null && selectedChapterIndex === null && (");

c = c.replace(renderChapterEditorRegex, newLevel3);

fs.writeFileSync(p, c);
