# Course Player Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Update `CoursePlayer` to support the 3-level folder structure (Subject > Chapter > Items) including routing, sidebar rendering, and prev/next navigation.

**Architecture:** We will modify `UserRoutes.jsx` to parse the extra route parameter (`subjectIdx`). We will update `CoursePlayer.jsx` to render a Subject selector at the top of the sidebar, and an accordion of Chapters for the selected Subject below it. The Next/Prev logic will traverse subjects -> chapters -> items.

**Tech Stack:** React, React Router, Tailwind CSS

## Global Constraints
- No test framework is currently installed, so verify changes manually by loading the app.
- All indexes in the URL are 1-based, but internally mapped to 0-based arrays.
- Stick to the existing UI styling and classes used in `CoursePlayer`.

---

### Task 1: Update Routes in UserRoutes.jsx

**Files:**
- Modify: `c:/Users/UTKARSH/Downloads/NEETBANBV2/frontend/src/routes/UserRoutes.jsx`

**Interfaces:**
- Consumes: The current `UserRoutes` configuration.
- Produces: A new `<Route>` definition for the 3-level CoursePlayer.

- [ ] **Step 1: Modify the routes in `UserRoutes.jsx`**

Replace:
```jsx
<Route path="/course/:courseId/:itemType/:lessonIdx/:itemIdx" element={<CoursePlayer currentTrack={currentTrack} user={user} onUpgradeClick={handleUpgradeClick} />} />
```
With:
```jsx
<Route path="/course/:courseId/:itemType/:subjectIdx/:chapterIdx/:itemIdx" element={<CoursePlayer currentTrack={currentTrack} user={user} onUpgradeClick={handleUpgradeClick} />} />
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/routes/UserRoutes.jsx
git commit -m "feat(player): update route to support subject index"
```

---

### Task 2: Update CoursePlayer Route Parsing and State

**Files:**
- Modify: `c:/Users/UTKARSH/Downloads/NEETBANBV2/frontend/src/components/CoursePlayer.jsx`

**Interfaces:**
- Consumes: `useParams()` from react-router-dom.
- Produces: `selectedSubjectIdx`, `selectedChapterIdx`, `selectedItemIdx` state.

- [ ] **Step 1: Update useParams and index calculations**

Find the `useParams` destructuring and index parsing:
```jsx
  const { courseId, itemType, lessonIdx: lessonIdxParam, itemIdx: itemIdxParam } = useParams();
```
Change to:
```jsx
  const { courseId, itemType, subjectIdx: subjectIdxParam, chapterIdx: chapterIdxParam, itemIdx: itemIdxParam } = useParams();
```

Change index parsing:
```jsx
  const selectedSubjectIdx = subjectIdxParam !== undefined ? parseInt(subjectIdxParam, 10) - 1 : null;
  const selectedChapterIdx = chapterIdxParam !== undefined ? parseInt(chapterIdxParam, 10) - 1 : null;
  const selectedItemIdx = itemIdxParam !== undefined ? parseInt(itemIdxParam, 10) - 1 : null;
```
Remove `selectedLessonIdx` completely.

- [ ] **Step 2: Add local state for Sidebar Subject selector**

Add a new state near the top of the component to track which subject is currently being viewed in the sidebar (which might be different from the playing one):
```jsx
  const [sidebarSubjectIdx, setSidebarSubjectIdx] = useState(0);

  // Sync sidebar subject with playing subject when URL changes
  useEffect(() => {
    if (selectedSubjectIdx !== null && selectedSubjectIdx >= 0) {
      setSidebarSubjectIdx(selectedSubjectIdx);
    }
  }, [selectedSubjectIdx]);
```

- [ ] **Step 3: Update total items calculation**

Replace the old `totalItemsCount` calculation:
```jsx
  const totalItemsCount = (course?.subjects || []).reduce((acc, sub) => {
    return acc + (sub.chapters || []).reduce((capAcc, cap) => capAcc + (cap.items || []).length, 0);
  }, 0);
```

- [ ] **Step 4: Update `isItemLocked`**

```jsx
  const isItemLocked = (sIdx, cIdx, iIdx) => {
    if (user?.isPremium) return false;
    const subject = course?.subjects?.[sIdx];
    const chapter = subject?.chapters?.[cIdx];
    const item = chapter?.items?.[iIdx];
    return !!(item?.isPremium || chapter?.isPremium || subject?.isPremium || course?.isPremium);
  };
```

- [ ] **Step 5: Commit**

```bash
git add frontend/src/components/CoursePlayer.jsx
git commit -m "feat(player): update route params and state for 3-level structure"
```

---

### Task 3: Update Prev/Next Navigation Logic

**Files:**
- Modify: `c:/Users/UTKARSH/Downloads/NEETBANBV2/frontend/src/components/CoursePlayer.jsx`

- [ ] **Step 1: Rewrite `getPreviousItem`**

Replace `getPreviousItem` with:
```jsx
  const getPreviousItem = () => {
    if (selectedSubjectIdx === null || selectedChapterIdx === null || selectedItemIdx === null || !course?.subjects) return null;
    
    if (selectedItemIdx > 0) {
      return { sIdx: selectedSubjectIdx, cIdx: selectedChapterIdx, iIdx: selectedItemIdx - 1 };
    }
    
    // Go to previous chapter's last item
    let cIdx = selectedChapterIdx - 1;
    const subject = course.subjects[selectedSubjectIdx];
    while (cIdx >= 0) {
      if (subject?.chapters?.[cIdx]?.items?.length > 0) {
        return { sIdx: selectedSubjectIdx, cIdx, iIdx: subject.chapters[cIdx].items.length - 1 };
      }
      cIdx--;
    }
    
    // Go to previous subject's last chapter's last item
    let sIdx = selectedSubjectIdx - 1;
    while (sIdx >= 0) {
      const prevSub = course.subjects[sIdx];
      let prevCIdx = (prevSub?.chapters?.length || 0) - 1;
      while (prevCIdx >= 0) {
        if (prevSub.chapters[prevCIdx]?.items?.length > 0) {
          return { sIdx, cIdx: prevCIdx, iIdx: prevSub.chapters[prevCIdx].items.length - 1 };
        }
        prevCIdx--;
      }
      sIdx--;
    }
    return null;
  };
```

- [ ] **Step 2: Rewrite `getNextItem`**

Replace `getNextItem` with:
```jsx
  const getNextItem = () => {
    if (selectedSubjectIdx === null || selectedChapterIdx === null || selectedItemIdx === null || !course?.subjects) return null;
    const subject = course.subjects[selectedSubjectIdx];
    const chapter = subject?.chapters?.[selectedChapterIdx];
    
    if (selectedItemIdx < (chapter?.items?.length || 0) - 1) {
      return { sIdx: selectedSubjectIdx, cIdx: selectedChapterIdx, iIdx: selectedItemIdx + 1 };
    }
    
    // Go to next chapter's first item
    let cIdx = selectedChapterIdx + 1;
    while (cIdx < (subject?.chapters?.length || 0)) {
      if (subject.chapters[cIdx]?.items?.length > 0) {
        return { sIdx: selectedSubjectIdx, cIdx, iIdx: 0 };
      }
      cIdx++;
    }
    
    // Go to next subject's first chapter's first item
    let sIdx = selectedSubjectIdx + 1;
    while (sIdx < (course.subjects?.length || 0)) {
      const nextSub = course.subjects[sIdx];
      let nextCIdx = 0;
      while (nextCIdx < (nextSub?.chapters?.length || 0)) {
         if (nextSub.chapters[nextCIdx]?.items?.length > 0) {
            return { sIdx, cIdx: nextCIdx, iIdx: 0 };
         }
         nextCIdx++;
      }
      sIdx++;
    }
    return null;
  };
```

- [ ] **Step 3: Update `activeLesson` and `activeItem` references**

Replace references:
```jsx
  const activeSubject = selectedSubjectIdx !== null ? course?.subjects?.[selectedSubjectIdx] : null;
  const activeChapter = selectedChapterIdx !== null ? activeSubject?.chapters?.[selectedChapterIdx] : null;
  const activeItem = activeChapter?.items?.[selectedItemIdx];
```
And replace the `isItemLocked(selectedLessonIdx, selectedItemIdx)` call in the `useEffect` with:
`isItemLocked(selectedSubjectIdx, selectedChapterIdx, selectedItemIdx)`
And ensure dependencies of `useEffect` are updated to `[selectedSubjectIdx, selectedChapterIdx, selectedItemIdx, activeItem?._id, activeItem?.type]`.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/components/CoursePlayer.jsx
git commit -m "feat(player): update next and prev navigation for 3 levels"
```

---

### Task 4: Update Player Top Bar and Main Content

**Files:**
- Modify: `c:/Users/UTKARSH/Downloads/NEETBANBV2/frontend/src/components/CoursePlayer.jsx`

- [ ] **Step 1: Update the Top Bar rendering**

In the top bar (`<div className="h-14 bg-surface-container-high ...">`), replace `lesson?.title` with `{activeSubject?.title} > {activeChapter?.title}`.
And replace `item?.title` with `activeItem?.title`.

- [ ] **Step 2: Update Prev/Next click handlers in Top Bar**

In the `onClick` for Prev:
```jsx
  if (prevItem) {
    const prevSub = course.subjects[prevItem.sIdx];
    const prevCap = prevSub?.chapters?.[prevItem.cIdx];
    const prevItemObj = prevCap?.items?.[prevItem.iIdx];
    if (prevItemObj) {
      navigate(`/course/${course._id}/${getSlugType(prevItemObj.type)}/${prevItem.sIdx + 1}/${prevItem.cIdx + 1}/${prevItem.iIdx + 1}`);
    }
  }
```

In the `onClick` for Next:
```jsx
  if (nextItem) {
    const nextSub = course.subjects[nextItem.sIdx];
    const nextCap = nextSub?.chapters?.[nextItem.cIdx];
    const nextItemObj = nextCap?.items?.[nextItem.iIdx];
    if (nextItemObj) {
      navigate(`/course/${course._id}/${getSlugType(nextItemObj.type)}/${nextItem.sIdx + 1}/${nextItem.cIdx + 1}/${nextItem.iIdx + 1}`);
    }
  }
```

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/CoursePlayer.jsx
git commit -m "feat(player): update top bar breadcrumbs and buttons"
```

---

### Task 5: Update the Overview/Landing UI

**Files:**
- Modify: `c:/Users/UTKARSH/Downloads/NEETBANBV2/frontend/src/components/CoursePlayer.jsx`

- [ ] **Step 1: Update "Start First Item" CTA**

In the overview section (where `selectedSubjectIdx === null`), update the CTA:
```jsx
  {course?.subjects?.length > 0 && course.subjects[0].chapters?.length > 0 && course.subjects[0].chapters[0].items?.length > 0 && (
    <button
      onClick={() => {
        const firstItem = course.subjects[0].chapters[0].items[0];
        if (firstItem) {
          navigate(`/course/${course._id}/${getSlugType(firstItem.type)}/1/1/1`);
        }
      }}
      ...
```

- [ ] **Step 2: Rewrite the list rendering in overview**

Replace the old `lessons.map` block with nested loops for subjects -> chapters -> items. For visual simplicity, group everything by Subject in large blocks, then Chapter blocks inside.

```jsx
  {(course?.subjects || []).map((subject, sIdx) => (
    <div key={subject._id || sIdx} className="mb-8">
      <h3 className="text-xl font-bold text-on-surface mb-4">{subject.title}</h3>
      <div className="space-y-4">
        {(subject.chapters || []).map((chapter, cIdx) => (
          <div key={chapter._id || cIdx} className="rounded-2xl border border-outline/15 overflow-hidden bg-surface-container-lowest">
            {/* Chapter Header */}
            <div className="px-5 py-4 bg-surface-container-low flex items-center justify-between border-b border-outline/10">
              <span className="font-extrabold text-sm sm:text-base text-on-surface truncate">
                {chapter.title}
              </span>
            </div>
            {/* Items */}
            <div className="divide-y divide-outline/5">
              {/* Similar to old item mapping, just pass sIdx, cIdx, iIdx to navigate and isItemLocked */}
            </div>
          </div>
        ))}
      </div>
    </div>
  ))}
```

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/CoursePlayer.jsx
git commit -m "feat(player): update overview UI to show subjects and chapters"
```

---

### Task 6: Update the Sidebar UI

**Files:**
- Modify: `c:/Users/UTKARSH/Downloads/NEETBANBV2/frontend/src/components/CoursePlayer.jsx`

- [ ] **Step 1: Add Subject Selector to Sidebar**

Inside `<aside className="...">`, right below the "Course Contents" header:
```jsx
  <div className="px-4 py-2 border-b border-outline/10">
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {(course?.subjects || []).map((sub, sIdx) => (
        <button
          key={sub._id || sIdx}
          onClick={() => setSidebarSubjectIdx(sIdx)}
          className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${
            sIdx === sidebarSubjectIdx 
              ? 'bg-primary text-on-primary' 
              : 'bg-surface-container-highest hover:bg-surface-variant text-on-surface-variant'
          }`}
          style={sIdx === sidebarSubjectIdx ? { background: coverColor } : {}}
        >
          {sub.title}
        </button>
      ))}
    </div>
  </div>
```

- [ ] **Step 2: Update Sidebar list rendering**

Replace the old `lessons.map` block with a single `(course?.subjects[sidebarSubjectIdx]?.chapters || []).map((chapter, cIdx) => ...)` block.
Ensure navigation links inside it are updated:
`navigate("/course/${course._id}/${getSlugType(subItem.type)}/${sidebarSubjectIdx + 1}/${cIdx + 1}/${itemIdx + 1}")`

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/CoursePlayer.jsx
git commit -m "feat(player): update sidebar with subject tabs and chapter accordions"
```
