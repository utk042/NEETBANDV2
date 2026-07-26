# Song Protection Suite Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a robust, end-to-end Song Protection Suite covering backend Mongoose model/controller validation, frontend audio player resilience & auto-retry, admin form pre-flight audio URL testing, and an automated integration test suite for NeetBand songs.

**Architecture:** Mongoose schema validators in `Song.js`, validation logic in `songController.js`, HTML5 `<audio>` error listeners with exponential retry logic in `PlayerContext.jsx`, pre-flight audio verification in `ManageSongs.jsx`, and a complete node-based test suite in `backend/test_song_protection_suite.js`.

**Tech Stack:** Node.js, Express, Mongoose, React, Axios / HTML5 Audio API.

## Global Constraints

- `songType` must strictly be either `'Study'` or `'Normal'`.
- `duration` must be a non-negative number (`>= 0`).
- Audio retry attempts must cap at 3 with exponential backoff (1s, 2s, 4s).
- All file paths must be absolute or relative to project root.

---

### Task 1: Backend Data Integrity & Model Validation

**Files:**
- Modify: `backend/src/models/Song.js`
- Modify: `backend/src/controllers/songController.js`
- Test: `backend/test_song_protection_suite.js`

**Interfaces:**
- Consumes: Mongoose schema definitions and Express request objects.
- Produces: Strict schema validation and HTTP 400 responses on invalid song input payloads.

- [ ] **Step 1: Update `backend/src/models/Song.js` with strict field validators**

Add custom validators for `title`, `audioUrl`, `songType`, `duration`, `watermarkPositions`, and `popupPositions`.

```javascript
// backend/src/models/Song.js snippet additions:
title: {
  type: String,
  required: [true, 'Song title is required'],
  trim: true,
  minlength: [1, 'Title cannot be empty']
},
audioUrl: {
  type: String,
  required: [true, 'Audio URL is required'],
  trim: true
},
songType: {
  type: String,
  enum: {
    values: ['Normal', 'Study'],
    message: '{VALUE} is not a valid songType'
  },
  default: 'Study'
},
duration: {
  type: Number,
  min: [0, 'Duration cannot be negative']
}
```

- [ ] **Step 2: Update `backend/src/controllers/songController.js` validation**

Add explicit input validation check in `createSong` and `updateSong`.

```javascript
// backend/src/controllers/songController.js in createSong:
if (!req.body.title || !req.body.audioUrl) {
  return res.status(400).json({ message: 'Title and audioUrl are required' });
}
if (req.body.duration !== undefined && (typeof req.body.duration !== 'number' || req.body.duration < 0)) {
  return res.status(400).json({ message: 'Duration must be a positive number' });
}
```

- [ ] **Step 3: Test backend validation**

Run: `node -e "import Song from './src/models/Song.js'; const s = new Song({ title: '', audioUrl: '' }); const err = s.validateSync(); console.log('Errors:', Object.keys(err.errors));"` in `backend/`
Expected: Outputs `Errors: [ 'title', 'audioUrl' ]`

- [ ] **Step 4: Commit**

```bash
git add backend/src/models/Song.js backend/src/controllers/songController.js
git commit -m "feat: add strict schema and controller validation for songs"
```

---

### Task 2: Frontend Playback & Network Resilience in PlayerContext

**Files:**
- Modify: `frontend/src/contexts/PlayerContext.jsx:500-580`

**Interfaces:**
- Consumes: HTML5 Audio DOM events (`onError`, `onTimeUpdate`).
- Produces: Auto-retry state (`retryCount`), resilient time math, and user-facing error dialog.

- [ ] **Step 1: Add error handler & retry logic state in `PlayerContext.jsx`**

Add `audioRetryCountRef` and `handleAudioError` callback:

```javascript
const audioRetryCountRef = useRef(0);

const handleAudioError = useCallback((e) => {
  console.warn('Audio playback error encountered:', e);
  if (audioRetryCountRef.current < 3) {
    audioRetryCountRef.current += 1;
    const delay = Math.pow(2, audioRetryCountRef.current) * 1000; // 2s, 4s, 8s
    console.log(`Retrying audio playback (Attempt ${audioRetryCountRef.current}/3) in ${delay}ms...`);
    setTimeout(() => {
      if (audioRef.current && currentTrack?.audioUrl) {
        audioRef.current.load();
        if (isPlaying) audioRef.current.play().catch(() => {});
      }
    }, delay);
  } else {
    setIsPlaying(false);
    confirm("Audio Playback Error", "Failed to load audio stream after multiple retries. Please check your internet connection.", {
      showCancel: false,
      confirmText: 'OK'
    });
  }
}, [currentTrack, isPlaying, confirm]);
```

- [ ] **Step 2: Attach `onError={handleAudioError}` to primary audio element**

In `PlayerContext.jsx`:
```jsx
<audio
  ref={audioRef}
  onTimeUpdate={handleTimeUpdate}
  onLoadedMetadata={handleLoadedMetadata}
  onEnded={handleEnded}
  onError={handleAudioError}
  preload="metadata"
  style={{ display: 'none' }}
/>
```

- [ ] **Step 3: Reset retry count on track change**

In `useEffect` watching `currentTrack?.audioUrl`:
```javascript
audioRetryCountRef.current = 0;
```

- [ ] **Step 4: Commit**

```bash
git add frontend/src/contexts/PlayerContext.jsx
git commit -m "feat: add audio stream auto-retry and error recovery handling"
```

---

### Task 3: Admin Audio Pre-Flight Verification Tool in ManageSongs

**Files:**
- Modify: `frontend/src/components/Admin/ManageSongs.jsx`

**Interfaces:**
- Consumes: User-entered audio URL string in Admin form.
- Produces: Pre-flight check status badge ("Verifying...", "Valid Audio", "Invalid Audio/URL") and auto-detected duration.

- [ ] **Step 1: Add Audio URL Pre-Flight Test & Auto-Duration helper in `ManageSongs.jsx`**

Add `testingAudioUrl` state and `handleTestAudioUrl` function:

```javascript
const [testingAudioUrl, setTestingAudioUrl] = useState(false);
const [audioUrlValid, setAudioUrlValid] = useState(null);

const handleTestAudioUrl = async () => {
  if (!formData.audioUrl) {
    alert('Validation Error', 'Please enter an audio URL to test.');
    return;
  }
  setTestingAudioUrl(true);
  setAudioUrlValid(null);

  try {
    const audio = new Audio();
    audio.src = formData.audioUrl.startsWith('http') ? formData.audioUrl : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${formData.audioUrl}`;
    
    await new Promise((resolve, reject) => {
      audio.onloadedmetadata = () => {
        if (audio.duration && !isNaN(audio.duration)) {
          const detectedDuration = Math.round(audio.duration);
          setFormData(prev => ({ ...prev, duration: detectedDuration }));
        }
        resolve();
      };
      audio.onerror = () => reject(new Error('Failed to load audio from URL'));
      // Timeout after 8 seconds
      setTimeout(() => reject(new Error('Audio verification timed out')), 8000);
    });

    setAudioUrlValid(true);
    alert('Success', 'Audio URL is valid and accessible! Duration auto-detected.');
  } catch (err) {
    setAudioUrlValid(false);
    alert('Verification Failed', `Could not verify audio URL: ${err.message}`);
  } finally {
    setTestingAudioUrl(false);
  }
};
```

- [ ] **Step 2: Add "Test Audio URL" button next to Audio URL input**

In `ManageSongs.jsx` render form:
```jsx
<div className="flex gap-2 items-center">
  <input
    type="text"
    value={formData.audioUrl}
    onChange={(e) => {
      setFormData({ ...formData, audioUrl: e.target.value });
      setAudioUrlValid(null);
    }}
    placeholder="https://... or /uploads/..."
    className="flex-1 bg-surface-container border border-outline-variant/30 rounded-xl p-3 text-on-surface"
  />
  <button
    type="button"
    onClick={handleTestAudioUrl}
    disabled={testingAudioUrl || !formData.audioUrl}
    className="px-4 py-3 bg-surface-variant hover:bg-surface-variant/80 text-on-surface rounded-xl font-medium text-sm transition-colors shrink-0 disabled:opacity-50"
  >
    {testingAudioUrl ? 'Verifying...' : 'Test URL'}
  </button>
</div>
{audioUrlValid === true && <span className="text-xs text-emerald-500 font-semibold">✓ Valid Audio URL</span>}
{audioUrlValid === false && <span className="text-xs text-red-500 font-semibold">✕ Invalid or Unreachable URL</span>}
```

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/Admin/ManageSongs.jsx
git commit -m "feat: add pre-flight audio URL verification and auto-duration detection in ManageSongs"
```

---

### Task 4: Complete Automated Song Protection Suite Test

**Files:**
- Create: `backend/test_song_protection_suite.js`

**Interfaces:**
- Consumes: Song model, Controllers, and simulatePlayerLogic runner.
- Produces: Execution output asserting 100% pass rate across backend validation, player resilience, and ad/tier rules.

- [ ] **Step 1: Create `backend/test_song_protection_suite.js`**

Implement comprehensive tests covering:
1. Mongoose model schema validation.
2. Express controller HTTP 400 validation for invalid payloads.
3. Player Context auto-retry & resilience logic simulator.
4. Guest, Free, and Premium tier song accessibility boundaries.

- [ ] **Step 2: Run test suite and confirm 100% PASS**

Run: `node test_song_protection_suite.js` in `backend/`
Expected: Output showing `100% ALL TESTS PASSED`

- [ ] **Step 3: Commit**

```bash
git add backend/test_song_protection_suite.js
git commit -m "test: add automated test suite for Song Protection Suite"
```
