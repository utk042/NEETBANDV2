# Free & Premium Course & Content Access Design

## Overview
This feature enables non-logged-in guest users to browse and study free courses and free lesson content (notes, videos, quizzes, flashcards, PDF downloads) without requiring an account. At the same time, it strictly enforces login and premium subscription checks for premium courses and premium lesson items.

## Architecture & Data Flow

### 1. Route Access (`frontend/src/routes/UserRoutes.jsx`)
- `/course/:courseId` and `/course/:courseId/:itemType/:subjectIdx/:chapterIdx/:itemIdx` routes are updated to be publicly accessible (removed from `ProtectedRoute`).
- Guest users landing on a course URL are rendered directly into `CoursePlayer`.
- Upgrade & Login redirects are handled by `handleUpgradeClick`, saving `postLoginRedirect` to return the user to their target course after authentication.

### 2. Backend Permission Checks (`backend/src/controllers/lmsController.js`)
- `getLessonContent`, `getLessonQuiz`, and `getLessonQa` check hierarchical premium flags:
  - `isPremium = course.isPremium || subject.isPremium || chapter.isPremium || item.isPremium`
- Responses for premium content:
  - Guest (`!req.user`): `401 Unauthorized` (`message: "Login required for premium content."`)
  - Logged-in non-premium user: `403 Forbidden` (`message: "Premium content. Upgrade required."`)
  - Admin / Owner / Premium user: `200 OK` (returns content)

### 3. Utility Logic (`frontend/src/components/CoursePlayer/CoursePlayerUtils.jsx`)
- `isItemLocked(user, course, sIdx, cIdx, iIdx)` evaluates:
  - `user?.isPremium || user?.role === 'admin' || user?.role === 'owner'` => `false` (unlocked)
  - `course?.isPremium || subject?.isPremium || chapter?.isPremium || item?.isPremium` => `true` (locked)
  - Otherwise => `false` (unlocked for all)

### 4. UI Behavior (`frontend/src/components/CoursePlayer.jsx` & `QuizViewer.jsx`)
- **Premium Course Lock Screen**: If `course.isPremium` is true and the user is not premium/admin, an inline lock banner is displayed for both overview and lesson views:
  - Guest: "Log In to Access" button -> `/login`
  - Free User: "Upgrade to Unlock" button -> `/checkout`
- **Free Course & Lesson Access**: Non-logged-in users can view notes, watch videos, study flashcards, download notes PDFs, and complete quizzes.
- **Quiz Submission**: Local score calculation completes for guests; `submitQuiz` API calls catch 401 silently without breaking UI.
- **Progress Tracking**: `markItemComplete` and progress retrieval are executed conditionally `if (user)`.

## Verification Plan
1. Test non-logged-in access to a free course -> verify overview, notes, video, quiz, and QA are accessible.
2. Test non-logged-in access to a premium course -> verify lock banner is shown with "Log In to Access" button.
3. Test logged-in non-premium user on a premium course/item -> verify lock banner is shown with "Upgrade to Unlock" button.
4. Test premium user / admin on any course -> verify full access without locks.
