# Fix All Broken Player Buttons & UI Symmetry Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix all broken or missing player button functionalities and establish symmetric UI layout across StickyPlayer, FullPlayerModal, MobilePlayer, and PlayerCard by integrating usePlayer from PlayerContext and removing prop drilling.

**Architecture:** Retrieve playback states and handlers directly from PlayerContext using the `usePlayer` hook in each component. Remove prop drilling from UserRoutes.jsx and update StickyPlayer, FullPlayerModal, MobilePlayer, and PlayerCard to consume only necessary or zero props.

**Tech Stack:** React, React Router, Tailwind CSS, Tabler Icons.

## Global Constraints
- Do NOT break the compilation.
- Commit all changes with message: `feat: fix broken player buttons, integrate PlayerContext, and restore UI symmetry`
- Write your report to C:\Users\UTKARSH\.gemini\antigravity\brain\31c83efd-8f9e-4021-844c-f68c6a5b3339\task-5-report.md

---

### Task 1: Complete Rewrite of StickyPlayer.jsx

**Files:**
- Modify: `frontend/src/components/StickyPlayer.jsx`

**Interfaces:**
- Consumes: `usePlayer` hook from `../contexts/PlayerContext` and `useUserAuth` hook from `../contexts/UserAuthContext`.
- Props: only accepts `onOpenFullPlayer` callback.

- [ ] **Step 1: Implement StickyPlayer with live lyrics support and controls on the right**
  Update `frontend/src/components/StickyPlayer.jsx` to fetch and parse lyrics if available, rendering the current active lyric line (or falling back to subject/chapter) in the center 1/3, and displaying all playback controls (shuffle, prev, play/pause, next, repeat, fav, volume slider, PIP) in the right 1/3 for layout symmetry.

- [ ] **Step 2: Verify StickyPlayer compiles cleanly**
  Run compilation or lint checks on the modified file to ensure no syntax errors.

---

### Task 2: Implement FullPlayerModal.jsx Key Functional Fixes

**Files:**
- Modify: `frontend/src/components/FullPlayerModal.jsx`

- [ ] **Step 1: Integrate usePlayer, useUserAuth, and fix all controls**
  Modify `frontend/src/components/FullPlayerModal.jsx` to use `usePlayer()` directly, removing props like `currentTrack`, `isPlaying`, `togglePlay`, `currentTime`, `onNext`, `onPrev`, `onSeek`, `favoritedTrackIds`, `onToggleFavorite`, `isMuted`, `onToggleMute`. Wire up shuffle and repeat buttons, replace the mute-only bar with a real volume range input slider, and render a PIP button (premium users only) next to the microphone/lyrics toggle.

- [ ] **Step 2: Verify FullPlayerModal compiles cleanly**
  Ensure all imports (such as `IconRepeatOnce` and `IconPictureInPicture`) are correct and no syntax/runtime issues exist.

---

### Task 3: Implement MobilePlayer.jsx Fixes

**Files:**
- Modify: `frontend/src/components/MobilePlayer.jsx`

- [ ] **Step 1: Add Prev button and connect usePlayer**
  Modify `frontend/src/components/MobilePlayer.jsx` to fetch state/handlers from `usePlayer()` directly. Add the Prev button (skip back icon) between the favorite button and play button. Make the progress bar interactive using the seek handler. Align the UI symmetrically.

- [ ] **Step 2: Verify MobilePlayer compiles cleanly**
  Check that the layout aligns correctly and has no broken references.

---

### Task 4: Implement PlayerCard.jsx Fixes

**Files:**
- Modify: `frontend/src/components/PlayerCard.jsx`

- [ ] **Step 1: Connect usePlayer and animate Waveform**
  Modify `frontend/src/components/PlayerCard.jsx` to fetch state/handlers from `usePlayer()` directly. Wire up Prev/Next buttons. Replace the fake static bars of the waveform with animated ones that bounce when `isPlaying` is true using a CSS animation or keyframes class (similar to Task 4).

- [ ] **Step 2: Verify PlayerCard compiles cleanly**
  Ensure no compiler errors or style issues.

---

### Task 5: Clean up UserRoutes.jsx Props

**Files:**
- Modify: `frontend/src/routes/UserRoutes.jsx`

- [ ] **Step 1: Remove unnecessary props from StickyPlayer, MobilePlayer, and FullPlayerModal**
  Modify `frontend/src/routes/UserRoutes.jsx` to remove all unused drilled props from the player instances, keeping only the minimal ones: `onOpenFullPlayer` for `StickyPlayer`/`MobilePlayer`, and `isOpen` and `onClose` for `FullPlayerModal`.

- [ ] **Step 2: Build/Run the project to verify functionality**
  Verify the application builds successfully and functions as expected.

- [ ] **Step 3: Commit all changes**
  Run:
  ```bash
  git add frontend/src/components/StickyPlayer.jsx frontend/src/components/FullPlayerModal.jsx frontend/src/components/MobilePlayer.jsx frontend/src/components/PlayerCard.jsx frontend/src/routes/UserRoutes.jsx
  git commit -m "feat: fix broken player buttons, integrate PlayerContext, and restore UI symmetry"
  ```
