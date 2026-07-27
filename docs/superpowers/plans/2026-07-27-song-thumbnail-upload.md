# Per-Song Thumbnail Upload in Batch Upload Modal Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a per-song thumbnail image upload field (with upload progress, drag-and-drop, and URL formatting) to individual song settings in `BatchUploadModal.jsx`, ensuring it is excluded from Shared Settings.

**Architecture:** Extend `SongSettingsPanel` in `BatchUploadModal.jsx` to include a thumbnail upload input inside the individual song section (`!hideTitle`). Uses `uploadFile` API service and `DragDropWrapper` UI component.

**Tech Stack:** React, JSX, Tailwind CSS, `@tabler/icons-react`.

## Global Constraints

- Thumbnail upload option must exist in separate song settings, NOT in shared settings (`hideTitle={true}`).
- Support `accept="image/*"` file selections and drag-and-drop file upload.
- Display progress bar when uploading and format uploaded URL using backend base URL.

---

### Task 1: Add Thumbnail Upload UI and State in `BatchUploadModal.jsx`

**Files:**
- Modify: `frontend/src/components/Admin/BatchUploadModal.jsx:80-250`

**Interfaces:**
- Consumes: `uploadFile` from `../../services/api`, `DragDropWrapper` from `../ui/DragDropWrapper`, `IconUpload` from `@tabler/icons-react`.
- Produces: Updated `SongSettingsPanel` component with thumbnail upload capability for individual songs.

- [ ] **Step 1: Add `thumbnailProgress` state and `handleThumbnailUpload` in `SongSettingsPanel`**

In `SongSettingsPanel`:
```jsx
const [thumbnailProgress, setThumbnailProgress] = useState(null);

const handleThumbnailUpload = async (eOrFile) => {
  let file;
  if (eOrFile && eOrFile.target && eOrFile.target.files) {
    file = eOrFile.target.files[0];
  } else {
    file = eOrFile;
  }
  if (!file) return;

  if (!file.type || !file.type.startsWith('image/')) {
    alert('Please select a valid image file for the thumbnail.');
    return;
  }

  setThumbnailProgress(0);
  try {
    const res = await uploadFile(file, 'songs/thumbnails', (progress) => {
      setThumbnailProgress(progress);
    });
    const backendUrl = import.meta.env.VITE_BACKEND_URL || import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const fullUrl = res.url.startsWith('http') ? res.url : `${backendUrl}${res.url.startsWith('/') ? '' : '/'}${res.url}`;
    onChange({ thumbnailUrl: fullUrl });
  } catch (err) {
    alert('Failed to upload thumbnail image: ' + err.message);
  } finally {
    setThumbnailProgress(null);
  }
};
```

- [ ] **Step 2: Update JSX Layout for Thumbnail and Lyrics Upload Fields**

Replace lines 214-249 in `BatchUploadModal.jsx` inside `!hideTitle` block with a 2-column grid containing both Thumbnail URL and Lyrics URL:

```jsx
{!hideTitle && (
  <>
    <div>
      <label className={labelClass}>
        Thumbnail Image URL <span className="opacity-60 lowercase font-normal">(optional)</span>
      </label>
      <DragDropWrapper onFileDrop={(file) => handleThumbnailUpload(file)}>
        <div className="relative">
          <input
            type="url"
            placeholder="https://..."
            className={`${inputClass} pr-28`}
            value={song.thumbnailUrl || ''}
            onChange={(e) => onChange({ thumbnailUrl: e.target.value })}
          />
          {thumbnailProgress !== null ? (
            <div className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[10px] uppercase font-bold text-primary bg-primary/10 px-2 py-1 rounded flex items-center gap-2 min-w-[70px] justify-center">
              <span>{thumbnailProgress}%</span>
              <div className="w-10 h-1 bg-primary/20 rounded-full overflow-hidden">
                <div className="h-full bg-primary transition-all duration-300" style={{ width: `${thumbnailProgress}%` }} />
              </div>
            </div>
          ) : (
            <label className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[10px] uppercase font-bold text-primary bg-primary/10 px-2 py-1 rounded cursor-pointer hover:bg-primary/20 transition-colors flex items-center gap-1">
              <IconUpload size={12} stroke={2.5} /> Upload
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={(e) => handleThumbnailUpload(e)}
              />
            </label>
          )}
        </div>
      </DragDropWrapper>
    </div>

    <div>
      <label className={labelClass}>
        Lyrics (.ttml) URL <span className="opacity-60 lowercase font-normal">(optional)</span>
      </label>
      <DragDropWrapper onFileDrop={(file) => handleLyricsUpload(file)}>
        <div className="relative">
          <input
            type="url"
            placeholder="https://..."
            className={`${inputClass} pr-28`}
            value={song.lyricsUrl || ''}
            onChange={(e) => onChange({ lyricsUrl: e.target.value })}
          />
          {lyricsProgress !== null ? (
            <div className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[10px] uppercase font-bold text-primary bg-primary/10 px-2 py-1 rounded flex items-center gap-2 min-w-[70px] justify-center">
              <span>{lyricsProgress}%</span>
              <div className="w-10 h-1 bg-primary/20 rounded-full overflow-hidden">
                <div className="h-full bg-primary transition-all duration-300" style={{ width: `${lyricsProgress}%` }} />
              </div>
            </div>
          ) : (
            <label className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[10px] uppercase font-bold text-primary bg-primary/10 px-2 py-1 rounded cursor-pointer hover:bg-primary/20 transition-colors flex items-center gap-1">
              <IconUpload size={12} stroke={2.5} /> Upload
              <input
                type="file"
                className="hidden"
                accept=".ttml,.txt,.lrc"
                onChange={(e) => handleLyricsUpload(e)}
              />
            </label>
          )}
        </div>
      </DragDropWrapper>
    </div>
  </>
)}
```

- [ ] **Step 3: Verification & Build Check**

Run frontend build/linter check to ensure syntax and imports are clean.
