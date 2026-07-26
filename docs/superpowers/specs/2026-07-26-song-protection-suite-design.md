# Design Spec: Song Protection Suite (Full-Spectrum Resilience & Validation)

**Date**: 2026-07-26  
**Status**: Approved  
**Topic**: Full-Spectrum Song Data Integrity, Playback Resilience, Admin Validation & Automated Testing Suite for NeetBand Songs (USP)

---

## 1. Context & Motivation

Songs (educational songs for NEET preparation and general study songs) represent NeetBand's primary Unique Selling Proposition (USP). Ensuring robust data integrity, resilient audio playback, strict admin creation/editing validation, and comprehensive automated test coverage is vital to maintaining platform reliability and monetization enforcement across Guest, Free, and Premium user tiers.

---

## 2. System Architecture & Components

The Song Protection Suite spans four core system layers:

```
+-----------------------------------------------------------------------+
|                         SONG PROTECTION SUITE                         |
+-----------------------------------------------------------------------+
| 1. Backend Data & Media Integrity (Song.js & songController.js)        |
| 2. Frontend Playback Resilience & Auto-Retry (PlayerContext.jsx)       |
| 3. Admin Content Verification & URL Test (ManageSongs.jsx)             |
| 4. Automated E2E & Integration Test Suite (test_song_protection.js)  |
+-----------------------------------------------------------------------+
```

---

## 3. Component Details & Requirements

### 3.1 Backend Data & Media Integrity
* **Target Files**: `backend/src/models/Song.js`, `backend/src/controllers/songController.js`
* **Requirements**:
  1. **Schema Validation**:
     - `title`: String, required, trimmed, non-empty.
     - `audioUrl`: String, required, must be a valid HTTP/HTTPS URL or valid local `/uploads/...` path.
     - `songType`: String, enum `['Study', 'Normal']`, default `'Study'`.
     - `duration`: Number, required, `>= 0`.
     - `watermarkPositions` & `popupPositions`: Array of Numbers, each between `0` and `100`.
  2. **Controller Safeguards (`createSong` / `updateSong`)**:
     - Validate input payloads before database mutation.
     - Return HTTP 400 with explicit error message if required fields fail validation.

### 3.2 Frontend Playback & Network Resilience
* **Target Files**: `frontend/src/contexts/PlayerContext.jsx`
* **Requirements**:
  1. **Audio Load Error Listener & Auto-Retry**:
     - Attach `onError` event listener to primary `<audio>` element (`audioRef`).
     - On error, attempt up to 3 automatic retries with exponential backoff (1s, 2s, 4s).
     - If all retries fail, pause audio and display a friendly alert dialog.
  2. **Safe Progress & Math Calculations**:
     - Guard all time update, duration, percentage, and drop-off bucket index calculations against `NaN`, `Infinity`, or negative numbers.
  3. **Ad & Tamper Enforcement**:
     - Ensure seeking or scrubbing cannot bypass triggered mid-roll audio ads, popups, or guest 20% limit triggers.

### 3.3 Admin Content Verification
* **Target Files**: `frontend/src/components/Admin/ManageSongs.jsx`
* **Requirements**:
  1. **"Test Audio URL" Button**:
     - Allow admins to test audio URL accessibility directly in the song modal.
     - Performs pre-flight verification to confirm HTTP 200/206 status and valid media headers.
  2. **Auto-Duration Extraction**:
     - Automatically calculate audio duration when a valid audio URL is entered or uploaded.
  3. **Strict Form Submission Check**:
     - Prevent submission if required fields are missing or audio test fails.

### 3.4 Automated Test Suite
* **Target Files**: `backend/test_song_protection_suite.js`
* **Requirements**:
  1. Test backend validation error handling (invalid URLs, missing titles, invalid songType, negative duration).
  2. Test frontend player state resilience simulator (auto-retry logic, ad queues, tier boundaries).
  3. Test Guest, Free, and Premium access enforcement rules.

---

## 4. Verification Plan

1. **Automated Tests**:
   - Run `node test_song_protection_suite.js` inside `backend/`.
   - Verify all test assertions pass cleanly with 0 failures.
2. **Manual Verification**:
   - Create and edit songs in Admin dashboard to verify "Test Audio URL" button and auto-duration extraction.
   - Verify player error handling and user tier limits in browser.
