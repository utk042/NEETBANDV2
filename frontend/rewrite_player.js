import fs from 'fs';
import path from 'path';

const playerPath = path.join(process.cwd(), 'src/components/CoursePlayer.jsx');
let playerCode = fs.readFileSync(playerPath, 'utf-8');

// Replacements
playerCode = playerCode
  .replace(/lessonIdxParam/g, 'subjectIdxParam')
  .replace(/itemIdxParam/g, 'chapterIdxParam')
  .replace(/lessonIdx/g, 'subjectIdx')
  .replace(/itemIdx/g, 'chapterIdx')
  .replace(/itemType/g, 'tab')
  .replace(/selectedLessonIdx/g, 'selectedSubjectIdx')
  .replace(/selectedItemIdx/g, 'selectedChapterIdx')
  .replace(/activeLesson/g, 'activeSubject')
  .replace(/activeItem/g, 'activeChapter')
  .replace(/totalItemsCount/g, 'totalChaptersCount')
  .replace(/previousItem/g, 'previousChapter')
  .replace(/nextItem/g, 'nextChapter')
  .replace(/prevItem/g, 'prevChapter')
  .replace(/isItemLocked/g, 'isChapterLocked')
  .replace(/getPreviousItem/g, 'getPreviousChapter')
  .replace(/getNextItem/g, 'getNextChapter')
  .replace(/lesson/g, 'subject')
  .replace(/lessons/g, 'subjects')
  .replace(/items/g, 'chapters')
  .replace(/item\./g, 'chapter.')
  .replace(/item\?/g, 'chapter?')
  .replace(/item /g, 'chapter ')
  .replace(/item,/g, 'chapter,')
  .replace(/item\)/g, 'chapter)')
  .replace(/\{ item \}/g, '{ chapter }')
  .replace(/>Lessons</g, '>Subjects<')
  .replace(/>Content Items</g, '>Chapters<');

// Replace activeDetails fetching logic
const detailsFetchingRegex = /const loadDetails = async \(\) => \{[\s\S]*?loadDetails\(\);\n  \}, \[selectedSubjectIdx, selectedChapterIdx, activeChapter\?._id, activeChapter\?\.type\]\);/m;
const newDetailsFetching = `
  const loadDetails = async () => {
    setDetailsLoading(true);
    try {
      let resData = null;
      if (tab === 'notes' || !tab) {
        const res = await getLessonContent(activeChapter._id).catch(()=>({content:''}));
        resData = { content: res.content };
      } else if (tab === 'quiz') {
        const res = await getLessonQuiz(activeChapter._id).catch(()=>({questions:[]}));
        resData = { questions: res.questions };
      } else if (tab === 'qa') {
        const res = await getLessonQa(activeChapter._id).catch(()=>({qas:[]}));
        resData = { qas: res.qas };
      }
      setActiveDetails(resData);
    } catch (err) {
      console.error("Failed to load chapter details:", err);
      setActiveDetails(null);
    } finally {
      setDetailsLoading(false);
    }
  };

  loadDetails();
}, [selectedSubjectIdx, selectedChapterIdx, activeChapter?._id, tab]);
`;
playerCode = playerCode.replace(detailsFetchingRegex, newDetailsFetching);

// Navigation helper
playerCode = playerCode.replace(
  /navigate\(\`\/course\/\$\{courseId\}\/\$\{getSlugType\(activeChapter\.type\)\}\/\$\{sIdx \+ 1\}\/\$\{cIdx \+ 1\}\`\);/g,
  `navigate(\`/course/\${courseId}/\${tab || 'notes'}/\${sIdx + 1}/\${cIdx + 1}\`);`
);

playerCode = playerCode.replace(
  /navigate\(\`\/course\/\$\{courseId\}\/\$\{getSlugType\(t\.type\)\}\/\$\{sIdx \+ 1\}\/\$\{cIdx \+ 1\}\`\)/g,
  `navigate(\`/course/\${courseId}/notes/\${sIdx + 1}/\${cIdx + 1}\`)` // default tab when clicking chapter in sidebar
);

playerCode = playerCode.replace(
  /navigate\(\`\/course\/\$\{courseId\}\/\$\{getSlugType\(activeChapter\.type\)\}\/\$\{c\.subjectIdx \+ 1\}\/\$\{c\.chapterIdx \+ 1\}\`\);/g,
  `navigate(\`/course/\${courseId}/\${tab || 'notes'}/\${c.subjectIdx + 1}/\${c.chapterIdx + 1}\`);`
);

// We need to inject the TABS UI in the main content area.
const mainHeaderRegex = /<h2 className="text-xl sm:text-2xl font-black text-on-surface">([\s\S]*?)<\/h2>/m;
const tabsInjection = `<h2 className="text-xl sm:text-2xl font-black text-on-surface">$1</h2>
                
                {/* TABS */}
                <div className="flex gap-1 border-b border-outline-variant/20 mb-6 mt-4">
                  <button 
                    className={\`px-4 py-2 text-sm font-bold transition-colors border-b-2 \${(tab === 'notes' || !tab) ? 'border-emerald-400 text-emerald-400' : 'border-transparent text-on-surface-variant hover:text-on-surface'}\`}
                    onClick={() => navigate(\`/course/\${courseId}/notes/\${selectedSubjectIdx + 1}/\${selectedChapterIdx + 1}\`)}
                  >
                    Notes
                  </button>
                  <button 
                    className={\`px-4 py-2 text-sm font-bold transition-colors border-b-2 \${tab === 'qa' ? 'border-violet-400 text-violet-400' : 'border-transparent text-on-surface-variant hover:text-on-surface'}\`}
                    onClick={() => navigate(\`/course/\${courseId}/qa/\${selectedSubjectIdx + 1}/\${selectedChapterIdx + 1}\`)}
                  >
                    Q&As
                  </button>
                  <button 
                    className={\`px-4 py-2 text-sm font-bold transition-colors border-b-2 \${tab === 'quiz' ? 'border-amber-400 text-amber-400' : 'border-transparent text-on-surface-variant hover:text-on-surface'}\`}
                    onClick={() => navigate(\`/course/\${courseId}/quiz/\${selectedSubjectIdx + 1}/\${selectedChapterIdx + 1}\`)}
                  >
                    Quiz
                  </button>
                </div>
`;
playerCode = playerCode.replace(mainHeaderRegex, tabsInjection);

// Replace "activeChapter.type === 'notes'" etc with "tab === 'notes'"
playerCode = playerCode.replace(/activeChapter\.type === 'notes'/g, "(tab === 'notes' || !tab)");
playerCode = playerCode.replace(/activeChapter\.type === 'lesson'/g, "false");
playerCode = playerCode.replace(/activeChapter\.type === 'reading'/g, "false");
playerCode = playerCode.replace(/activeChapter\.type === 'quiz'/g, "tab === 'quiz'");
playerCode = playerCode.replace(/activeChapter\.type === 'qa'/g, "tab === 'qa'");
playerCode = playerCode.replace(/activeChapter\.type === 'video'/g, "false");
playerCode = playerCode.replace(/activeChapter\.type === 'song'/g, "false");

// Update TYPE_META logic
playerCode = playerCode.replace(
  /const typeInfo = TYPE_META\[c\.type\] \|\| TYPE_META\['notes'\];/g,
  `const typeInfo = TYPE_META['notes'];`
);

playerCode = playerCode.replace(
  /const typeInfo = TYPE_META\[activeChapter\.type\] \|\| TYPE_META\['notes'\];/g,
  `const typeInfo = TYPE_META[tab] || TYPE_META['notes'];`
);

fs.writeFileSync(playerPath, playerCode, 'utf-8');
console.log('Player rewrite complete');
