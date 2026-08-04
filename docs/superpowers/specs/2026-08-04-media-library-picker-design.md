# Media Library Image Selector Design Spec

**Date**: 2026-08-04  
**Feature**: Option to select existing images from website Media Library when uploading/editing songs and batch uploads.

---

## 1. Overview & Goals

When creating or editing songs (and batch uploads) in the admin panel, users often reuse the same thumbnail or visual asset across multiple tracks. Currently, users have to either re-upload the file from their computer for each song (creating duplicate files on disk) or manually copy-paste an existing URL.

This feature adds a **Media Library Picker** modal to thumbnail/image upload fields across admin forms, allowing admins to visually browse, search, and select any previously uploaded image file from the server's `uploads/` directory.

---

## 2. Backend Architecture

### `GET /upload/files` Endpoint
Added to `backend/src/routes/uploadRoutes.js`.

* **Query Parameters**:
  * `fileType` (optional, default `image`): filters returned files by extension (`.jpg`, `.jpeg`, `.png`, `.webp`, `.gif`, `.svg`).
  * `search` (optional): string filter matching `filename` or relative path.
* **Scan Targets**:
  * Traverses subfolders in `backend/uploads/` (including `thumbnails/`, `images/`, `blogs/`, `others/`, etc.).
* **Response Format**:
  ```json
  {
    "success": true,
    "files": [
      {
        "url": "/uploads/thumbnails/file-1722750000-cover.webp",
        "filename": "file-1722750000-cover.webp",
        "size": 84200,
        "mtime": "2026-08-04T10:15:00.000Z",
        "category": "thumbnails"
      }
    ]
  }
  ```
* **Sorting**: Files are returned sorted by modification time (`mtime`) descending (most recently uploaded files first).

---

## 3. Frontend Architecture

### `MediaLibraryModal.jsx` Component
Location: `frontend/src/components/Admin/MediaLibraryModal.jsx`

* **Props**:
  * `isOpen` (`boolean`): modal visibility.
  * `onClose` (`() => void`): close callback.
  * `onSelect` (`(url: string) => void`): callback called when an image is picked.
  * `title` (`string`, optional): modal header title.
* **UI Features**:
  * **Header**: Modal title, live search text input ("Search by filename..."), and Close (`X`) button.
  * **Category Filter Pills**: `All`, `Thumbnails`, `Blogs`, `Others`.
  * **Image Grid**: Responsive grid (`grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3`).
  * **Thumbnail Card**: Aspect-square preview, filename label, human-readable file size (e.g. `120 KB`), and hover overlay with a "Select" button.
  * **State Handling**: Loading spinner state and empty state when no matching files exist.

---

## 4. Admin Forms Integration

### `ManageSongs.jsx`
* Next to the existing **`[ ⬆ UPLOAD ]`** button for **Thumbnail Image URL**, add a **`[ 🖼 MEDIA LIBRARY ]`** button.
* Clicking the button opens `<MediaLibraryModal />`.
* Selecting an image populates the song's `thumbnailUrl` state with the selected URL (e.g. `/uploads/thumbnails/...`).

### `BatchUploadModal.jsx`
* Next to the **Thumbnail Image URL** upload field in each song row within the batch queue, add a **`[ 🖼 MEDIA LIBRARY ]`** button.
* Selecting an image assigns the same thumbnail URL to that song row without needing duplicate uploads.

---

## 5. Verification & Testing Plan

1. **Backend Verification**:
   * Test `GET /upload/files` returns expected list of images from `backend/uploads/`.
   * Verify filename search and category filtering work correctly.
2. **Frontend Component Verification**:
   * Verify `<MediaLibraryModal />` opens, displays image grid, filters by search term, and handles empty/loading states gracefully.
3. **End-to-End Workflow**:
   * Open `ManageSongs.jsx` and `BatchUploadModal.jsx`.
   * Click `[ 🖼 MEDIA LIBRARY ]` on Thumbnail field.
   * Pick an image from the library modal.
   * Confirm the image URL is populated in the form input.
   * Save song and verify track thumbnail displays correctly.
