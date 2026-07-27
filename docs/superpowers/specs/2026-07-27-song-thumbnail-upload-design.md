# Per-Song Thumbnail Upload in BatchUploadModal Design Spec

## Overview
Add per-song thumbnail image upload functionality to `BatchUploadModal` in the admin interface, matching the existing lyrics upload pattern. This allows admins to upload or enter a custom thumbnail URL for each individual song in a batch upload, without adding it to the shared settings (as thumbnails are specific to individual songs).

## Requirements & Scope
- **Separate Songs Only**: Thumbnail upload field will only appear in individual song settings rows (`!hideTitle`), NOT in the Shared Settings panel.
- **File Upload & Drag-and-Drop**: Support uploading image files (`image/*`) via file browser or drag-and-drop via `DragDropWrapper`.
- **Progress & Validation**: Display animated progress indicator during upload, handle backend URL formatting, and catch upload errors gracefully.
- **UI Consistency**: Position Thumbnail Upload side-by-side with Lyrics Upload in individual song cards for a balanced 2-column responsive layout.

## Component Changes

### `frontend/src/components/Admin/BatchUploadModal.jsx`
1. **`SongSettingsPanel` Component**:
   - Add state: `thumbnailProgress` (null or number 0-100).
   - Add handler: `handleThumbnailUpload(eOrFile)` which calls `uploadFile(file, 'songs/thumbnails', ...)` with error handling and full URL formatting.
   - Layout: Update `Lyrics (.ttml) URL` and `Thumbnail Image URL` to sit in a responsive 2-column layout (`sm:col-span-1` each) inside the `!hideTitle` block.
   - Include drag-and-drop via `DragDropWrapper`, `accept="image/*"`, progress bar display, and instant `onChange({ thumbnailUrl: fullUrl })` callback.

2. **Data Flow & Storage**:
   - Default thumbnail value: `thumbnailUrl: ''` already defined in `defaultSongSettings`.
   - On upload / input change: updates `item.settings.thumbnailUrl`.
   - On submit / retry: `item.settings.thumbnailUrl` is automatically included in `createSong` API payload.

## Error Handling & Edge Cases
- **Upload Failures**: Trapped in try/catch block; displays alert and clears progress state cleanly.
- **Invalid File Selection**: Restricts file dialog to `accept="image/*"` and validates file presence.
- **Shared Settings Isolation**: Shared settings passes `hideTitle={true}`, ensuring thumbnail input is excluded from shared settings.

## Verification Plan
1. Open Batch Upload modal in admin dashboard.
2. Verify Shared Settings panel does NOT show Thumbnail upload.
3. Expand individual queued song row and verify "Thumbnail Image URL" field is present next to "Lyrics (.ttml) URL".
4. Upload an image file via file selector and via drag-and-drop; verify upload progress and resulting URL value.
5. Submit batch upload and verify `thumbnailUrl` is saved to backend song record.
