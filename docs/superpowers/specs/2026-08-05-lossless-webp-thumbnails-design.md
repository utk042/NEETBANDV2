# Design Spec: Lossless WebP Compression for Song Thumbnails and Image Uploads

**Date:** 2026-08-05  
**Topic:** Lossless WebP Image Upload Compression  
**Status:** Approved  

## Overview
When song thumbnails (and other images) are uploaded to the platform, they are currently saved to disk without compression in their original formats (PNG, JPEG, etc.). To optimize storage efficiency, improve frontend page load speeds, and maintain 100% pixel fidelity with zero quality degradation, all uploaded images will undergo server-side lossless WebP compression using `sharp`.

## Requirements
1. All image uploads (e.g., song thumbnails uploaded to `/uploads/songs/thumbnails/`, course thumbnails, blog thumbnails, profile pictures, etc.) must be losslessly compressed into `.webp` format.
2. The compression must be 100% lossless (`{ lossless: true, quality: 100 }`), producing pixel-identical outputs while reducing file size by 25%–45%.
3. Uploaded non-image files (such as audio `.mp3`, `.wav`, lyrics `.lrc`, `.ttml`, documents `.pdf`, `.docx`) must remain untouched and be stored with their original file extensions.
4. Images remain stored in their existing designated subdirectories under `backend/uploads/` (e.g., `backend/uploads/songs/thumbnails/`).

## System Architecture & Technical Flow

```
[ Frontend Upload Request ]
           │
           ▼
[ POST /upload or /api/upload ]
           │
           ▼
   [ Multer Storage ] (in memory buffer)
           │
     Is file image?
      ├── YES ──► [ sharp(buffer).webp({ lossless: true }) ] ──► Save as .webp to /uploads/<type>/
      └── NO  ──► Save original buffer to /uploads/<type>/
```

### Components Changed

#### 1. `backend/package.json`
- Add dependency: `"sharp": "^0.33.5"` (or latest compatible version).

#### 2. `backend/src/routes/uploadRoutes.js`
- Configure `multer` with `memoryStorage()` for incoming file handling.
- In `POST /upload` handler:
  - Detect image mimetypes (`file.mimetype.startsWith('image/')` or image extension).
  - Use `sharp(file.buffer).webp({ lossless: true, quality: 100 })` to compress image files to WebP.
  - Generate safe filenames with `.webp` extension for image files.
  - Save file buffers asynchronously using `fs.promises.writeFile`.
  - Handle errors gracefully if file processing fails.

## Verification Plan

### Automated & Manual Verification
1. Run backend test suite (`node test_api_suite.js`) to ensure existing API contracts remain intact.
2. Upload a song thumbnail image (PNG/JPEG) via the upload endpoint or Manage Songs admin panel.
3. Verify that:
   - The file saved under `backend/uploads/songs/thumbnails/` has a `.webp` extension.
   - The file size is reduced compared to the original image.
   - The image displays perfectly without pixelation or compression artifacts.
   - Non-image files (e.g. `.mp3` or `.lrc`) upload unchanged.
