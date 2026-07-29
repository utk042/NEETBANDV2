# Free & Premium Course Access Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Enable non-logged-in guest users to view free courses and free lesson content (notes, videos, quizzes, flashcards, PDF downloads) while enforcing login and premium tier requirements for premium courses and premium content items.

**Architecture:** Remove route-level protection on course URLs in `UserRoutes.jsx`, enhance hierarchical `isPremium` checks in `lmsController.js` and `CoursePlayerUtils.jsx`, and implement clean in-page guest/free lock banners in `CoursePlayer.jsx`.

**Tech Stack:** React 18, React Router v6, Express.js, MongoDB/Mongoose, Tabler Icons.

## Global Constraints
- Do not require login for free courses or free course items.
- Protect premium courses and premium items from unauthenticated (401) or non-premium (403) access.
- Maintain existing user progress tracking for authenticated users without crashing for guests.

---

### Task 1: Backend LMS Access Control Enhancement

**Files:**
- Modify: `backend/src/controllers/lmsController.js`
- Test: `backend/test_api_suite.js`

**Interfaces:**
- Consumes: `Course` Mongoose model, `req.user` from `optionalAuth` middleware.
- Produces: `getLessonContent`, `getLessonQuiz`, `getLessonQa` returning 401 for guests on premium content, 403 for free users on premium content, and 200 for free content.

- [ ] **Step 1: Update `getLessonContent`, `getLessonQuiz`, and `getLessonQa` in `lmsController.js`**

```javascript
// In backend/src/controllers/lmsController.js

export const getLessonContent = async (req, res) => {
  try {
    const course = await Course.findOne({ "subjects.chapters.items._id": req.params.itemId });
    if (course) {
      let foundItem = null, foundChapter = null, foundSubject = null;
      course.subjects.forEach(s => {
        s.chapters.forEach(c => {
          const item = c.items.id(req.params.itemId);
          if (item) {
            foundItem = item;
            foundChapter = c;
            foundSubject = s;
          }
        });
      });
      const isPremiumContent = !!(course.isPremium || foundSubject?.isPremium || foundChapter?.isPremium || foundItem?.isPremium);
      if (isPremiumContent) {
        if (!req.user) {
          return res.status(401).json({ message: 'Login required for premium content.', isPremium: true });
        }
        if (!req.user.isPremium && req.user.role !== 'admin' && req.user.role !== 'owner') {
          return res.status(403).json({ message: 'Premium content. Upgrade required.', isPremium: true });
        }
      }
    }

    const doc = await LessonContent.findOne({ itemId: req.params.itemId });
    res.json({ content: doc ? doc.content : '' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getLessonQuiz = async (req, res) => {
  try {
    const course = await Course.findOne({ "subjects.chapters.items._id": req.params.itemId });
    if (course) {
      let foundItem = null, foundChapter = null, foundSubject = null;
      course.subjects.forEach(s => {
        s.chapters.forEach(c => {
          const item = c.items.id(req.params.itemId);
          if (item) {
            foundItem = item;
            foundChapter = c;
            foundSubject = s;
          }
        });
      });
      const isPremiumContent = !!(course.isPremium || foundSubject?.isPremium || foundChapter?.isPremium || foundItem?.isPremium);
      if (isPremiumContent) {
        if (!req.user) {
          return res.status(401).json({ message: 'Login required for premium content.', isPremium: true });
        }
        if (!req.user.isPremium && req.user.role !== 'admin' && req.user.role !== 'owner') {
          return res.status(403).json({ message: 'Premium content. Upgrade required.', isPremium: true });
        }
      }
    }

    const doc = await LessonQuiz.findOne({ itemId: req.params.itemId });
    const durVal = doc?.duration || doc?.timeLimit || 60;
    res.json({
      questions: doc ? doc.questions : [],
      duration: durVal,
      timeLimit: durVal
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getLessonQa = async (req, res) => {
  try {
    const course = await Course.findOne({ "subjects.chapters.items._id": req.params.itemId });
    if (course) {
      let foundItem = null, foundChapter = null, foundSubject = null;
      course.subjects.forEach(s => {
        s.chapters.forEach(c => {
          const item = c.items.id(req.params.itemId);
          if (item) {
            foundItem = item;
            foundChapter = c;
            foundSubject = s;
          }
        });
      });
      const isPremiumContent = !!(course.isPremium || foundSubject?.isPremium || foundChapter?.isPremium || foundItem?.isPremium);
      if (isPremiumContent) {
        if (!req.user) {
          return res.status(401).json({ message: 'Login required for premium content.', isPremium: true });
        }
        if (!req.user.isPremium && req.user.role !== 'admin' && req.user.role !== 'owner') {
          return res.status(403).json({ message: 'Premium content. Upgrade required.', isPremium: true });
        }
      }
    }

    const doc = await LessonQa.findOne({ itemId: req.params.itemId });
    res.json({ qas: doc ? doc.qas : [] });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
```

- [ ] **Step 2: Commit Backend Changes**

```bash
git add backend/src/controllers/lmsController.js
git commit -m "feat: enforce hierarchical premium checks in LMS controllers"
```

---

### Task 2: Frontend Lock Utilities & Public Route Configuration

**Files:**
- Modify: `frontend/src/components/CoursePlayer/CoursePlayerUtils.jsx`
- Modify: `frontend/src/routes/UserRoutes.jsx`

**Interfaces:**
- Consumes: `isItemLocked(user, course, sIdx, cIdx, iIdx)`
- Produces: Unprotected `/course/:courseId` routes for guests and updated lock checking logic.

- [ ] **Step 1: Update `isItemLocked` in `CoursePlayerUtils.jsx`**

```javascript
export const isItemLocked = (user, course, sIdx, cIdx, iIdx) => {
  if (user?.isPremium || user?.role === 'admin' || user?.role === 'owner') return false;
  
  // If no specific item indices are provided, check course level
  if (sIdx === undefined || sIdx === null || cIdx === undefined || cIdx === null || iIdx === undefined || iIdx === null) {
    return !!course?.isPremium;
  }

  const subject = course?.subjects?.[sIdx];
  const chapter = subject?.chapters?.[cIdx];
  const item = getChapterItems(chapter)[iIdx];

  return !!(course?.isPremium || subject?.isPremium || chapter?.isPremium || item?.isPremium);
};
```

- [ ] **Step 2: Remove `ProtectedRoute` wrapper from Course routes in `UserRoutes.jsx`**

In `frontend/src/routes/UserRoutes.jsx`:
Replace:
```jsx
            <Route path="/course/:courseId" element={
              <ProtectedRoute isLoggedIn={user?.isLoggedIn} isAuthLoading={isAuthLoading} portalName="Course Player" loginRoute="/login">
                <CoursePlayer currentTrack={currentTrack} user={user} onUpgradeClick={handleUpgradeClick} />
              </ProtectedRoute>
            } />
            <Route path="/course/:courseId/:itemType/:subjectIdx/:chapterIdx/:itemIdx" element={
              <ProtectedRoute isLoggedIn={user?.isLoggedIn} isAuthLoading={isAuthLoading} portalName="Course Player" loginRoute="/login">
                <CoursePlayer currentTrack={currentTrack} user={user} onUpgradeClick={handleUpgradeClick} />
              </ProtectedRoute>
            } />
```
With:
```jsx
            <Route path="/course/:courseId" element={
              <CoursePlayer currentTrack={currentTrack} user={user} onUpgradeClick={handleUpgradeClick} />
            } />
            <Route path="/course/:courseId/:itemType/:subjectIdx/:chapterIdx/:itemIdx" element={
              <CoursePlayer currentTrack={currentTrack} user={user} onUpgradeClick={handleUpgradeClick} />
            } />
```

- [ ] **Step 3: Commit Utility & Router Changes**

```bash
git add frontend/src/components/CoursePlayer/CoursePlayerUtils.jsx frontend/src/routes/UserRoutes.jsx
git commit -m "feat: allow public guest routing to courses and update isItemLocked hierarchy"
```

---

### Task 3: Course Player UI & Premium Course Lock View

**Files:**
- Modify: `frontend/src/components/CoursePlayer.jsx`

**Interfaces:**
- Consumes: `user`, `course`, `isItemLocked`, `onUpgradeClick`
- Produces: Premium Course Lock screen for guests and free users when viewing premium courses.

- [ ] **Step 1: Add Course-Level Lock Guard in `CoursePlayer.jsx`**

In `CoursePlayer.jsx`, check if the entire course is locked for the visitor:

```javascript
  const isCourseLocked = !!(course?.isPremium && !user?.isPremium && user?.role !== 'admin' && user?.role !== 'owner');
```

In the Overview view (when `selectedSubjectIdx === null`), if `isCourseLocked` is true:
Render a clear course lock overlay:
```jsx
  {isCourseLocked && (
    <div className="mb-6 p-6 rounded-3xl bg-amber-500/10 border border-amber-500/20 text-center flex flex-col items-center">
      <div className="w-14 h-14 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center mb-3">
        <IconCrown size={28} />
      </div>
      <h3 className="text-lg font-bold text-on-surface">Premium Course</h3>
      <p className="text-xs text-on-surface-variant max-w-md mt-1 mb-4">
        {!user || !user.isLoggedIn
          ? "This course is reserved for Premium Members. Please log in with a premium account to access full course material."
          : "This course is reserved for Premium Members. Upgrade your account to unlock all chapters and resources."}
      </p>
      <button
        onClick={onUpgradeClick}
        className="px-6 py-2.5 rounded-xl bg-amber-500 text-black font-bold text-xs hover:brightness-105 transition-all shadow-md"
      >
        {!user || !user.isLoggedIn ? "Log In to Access" : "Upgrade to Unlock"}
      </button>
    </div>
  )}
```

In the Lesson View (when viewing a lesson), if `isCourseLocked` is true or `locked` (item locked):
Show the lock container prompting the user to log in or upgrade.

- [ ] **Step 2: Commit CoursePlayer UI Changes**

```bash
git add frontend/src/components/CoursePlayer.jsx
git commit -m "feat: add premium course lock screen for guests and free users"
```

---

### Task 4: Automated & Manual Verification

- [ ] **Step 1: Test LMS API Endpoints for Guest & Auth Users**
- [ ] **Step 2: Manual UI Verification of Guest Access on Free vs Premium Courses**
