# Course Player Navigation Redesign

## Objective
Update the `CoursePlayer` frontend to reflect the 3-level folder structure already present in the backend model (`Course > Subjects > Chapters > Items`). Currently, the frontend only expects a 2-level structure (`Lessons > Items`).

## Target Audience & Usage
Students using the `CoursePlayer` to consume content. The interface must remain clean and not overwhelmed by too many deeply nested folders at once.

## Proposed Design (Approach C)
The sidebar will use a hybrid approach:
1. **Subject Selector**: A horizontal scrollable list of pills (or a dropdown) at the top of the sidebar to choose the current `Subject` (e.g. Physics, Chemistry, Biology).
2. **Chapter Accordion**: The main area of the sidebar will render a list of `Chapters` belonging to the selected `Subject`. Each `Chapter` acts as an accordion that contains its `Items`.

## URL Routing Updates
To uniquely identify an item in this 3-level structure, the URL will be updated.
- **Old Route**: `/course/:courseId/:itemType/:lessonIdx/:itemIdx`
- **New Route**: `/course/:courseId/:itemType/:subjectIdx/:chapterIdx/:itemIdx` (using 1-based indexing for backward consistency with the old approach).

## State Management (`CoursePlayer.jsx`)
- Derive `selectedSubjectIdx`, `selectedChapterIdx`, and `selectedItemIdx` from the URL params.
- If only `/course/:courseId` is visited, default to the first Subject, first Chapter, first Item, and redirect.
- The active Subject shown in the sidebar dropdown/pills should default to the `selectedSubjectIdx` of the currently playing item. Users can change the dropdown to browse other subjects without immediately losing their place, but clicking an item in another subject will navigate them and update the active playing context.

## Navigation Logic (Prev / Next Buttons)
The `getPreviousItem` and `getNextItem` helpers will be rewritten to traverse the 3-level tree:
- **Next**: Item -> Next Item. If last item -> Next Chapter, First Item. If last chapter -> Next Subject, First Chapter, First Item.
- **Prev**: Item -> Prev Item. If first item -> Prev Chapter, Last Item. If first chapter -> Prev Subject, Last Chapter, Last Item.

## Display Updates
- The breadcrumb at the top of the player will be updated to display: `{Subject Name} > {Chapter Name} > {Item Name}`.
- Unlock logic (`isItemLocked`) will check `course.isPremium`, `subject.isPremium`, `chapter.isPremium`, and `item.isPremium`.
