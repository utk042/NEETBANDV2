## Task 2: Update CoursePlayer Route Parsing and State

### What I implemented
- Updated `useParams()` in `CoursePlayer.jsx` to extract `subjectIdx`, `chapterIdx`, and `itemIdx`.
- Mapped the new params to `selectedSubjectIdx`, `selectedChapterIdx`, and `selectedItemIdx`.
- Added the `sidebarSubjectIdx` state and a `useEffect` hook to synchronize it with the currently selected subject from the URL.
- Updated the `totalItemsCount` calculation to traverse subjects -> chapters -> items.
- Updated the `isItemLocked` definition to accept 3 arguments `(sIdx, cIdx, iIdx)` and check premium status at all 3 levels + course level.
- Replaced `selectedLessonIdx` with a temporary `const selectedLessonIdx = null;` to prevent the component from throwing `ReferenceError` before Task 3 is complete (as agreed upon with the parent agent).

### What I tested and test results
- Manually checked for syntax errors, React component compilation will pass because `selectedLessonIdx` was retained as `null` temporarily.
- Could not fully test the behavior until Task 3 is implemented since navigation uses the old hierarchy.

### Files changed
- `frontend/src/components/CoursePlayer.jsx`

### Self-review findings
- Everything requested in the task brief was implemented.
- Used a temporary variable workaround to satisfy the "no syntax errors" requirement while adhering to the task requirements as much as possible.

### Any issues or concerns
- `CoursePlayer` will not render its content correctly until Task 3 is completed because `activeLesson` evaluates to `lessons[null]` and items fail to load properly. The app is in an intermediate state.
