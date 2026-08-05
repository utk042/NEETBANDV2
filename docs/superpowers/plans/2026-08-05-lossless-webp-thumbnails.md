# Lossless WebP Compression for Song Thumbnails Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement server-side 100% lossless WebP image compression for song thumbnail and image uploads using `sharp`.

**Architecture:** Update `uploadRoutes.js` to use `multer.memoryStorage()`. When an image upload is processed, convert the buffer to lossless WebP (`sharp(buffer).webp({ lossless: true, quality: 100 })`), assign a `.webp` extension, and save to `backend/uploads/<type>/`. Non-image uploads pass through untouched.

**Tech Stack:** Node.js, Express, Multer, `sharp`

## Global Constraints

- Image compression must be 100% lossless with zero quality loss.
- Non-image files (audio `.mp3`, `.wav`, lyrics `.lrc`, `.ttml`, docs `.pdf`, `.docx`) must preserve original formats and extensions.
- Image storage directories under `backend/uploads/` (e.g., `songs/thumbnails/`) must remain unchanged.

---

### Task 1: Add `sharp` Dependency to `backend/package.json`

**Files:**
- Modify: `backend/package.json:15-29`

**Interfaces:**
- Consumes: npm package `sharp`
- Produces: `sharp` module available in Node.js backend environment

- [ ] **Step 1: Install sharp dependency**

Run `npm install sharp` inside `backend` directory or add `"sharp": "^0.33.5"` to `backend/package.json`.

- [ ] **Step 2: Verify dependency installation**

Verify that `backend/package.json` includes `"sharp"`.

---

### Task 2: Implement Lossless WebP Compression in `uploadRoutes.js`

**Files:**
- Modify: `backend/src/routes/uploadRoutes.js`
- Test: `backend/test_api_suite.js`

**Interfaces:**
- Consumes: Upload requests sent to `POST /upload` or `POST /api/upload`
- Produces: WebP image files stored at `/uploads/<type>/<filename>.webp` and response JSON `{ url, originalName }`

- [ ] **Step 1: Update Multer to `memoryStorage()` and import `sharp`**

Import `sharp` at top of `uploadRoutes.js`. Replace `multer({ storage })` with memory storage for handling incoming files in memory.

```javascript
import sharp from 'sharp';

const storage = multer.memoryStorage();
const upload = multer({ storage });
```

- [ ] **Step 2: Update `POST /` upload handler with image detection & Sharp WebP conversion**

In `router.post('/', ...)`:
Check if `req.file.mimetype.startsWith('image/')` or if the extension is an image extension (`.png`, `.jpg`, `.jpeg`, `.webp`, `.gif`, `.bmp`, `.tiff`, `.avif`).

If image:
1. Process `req.file.buffer` using `sharp`:
   `const webpBuffer = await sharp(req.file.buffer).webp({ lossless: true, quality: 100 }).toBuffer();`
2. Set filename with `.webp` extension:
   `const filename = ${req.file.fieldname}-${Date.now()}-${Math.random().toString(36).slice(2)}${suffix}.webp;`
3. Write buffer to disk:
   `await fs.promises.writeFile(filePath, webpBuffer);`

If non-image:
1. Preserve original extension and name.
2. Write `req.file.buffer` directly to disk using `fs.promises.writeFile(filePath, req.file.buffer)`.

- [ ] **Step 3: Run backend test suite to verify uploads**

Run test command: `node backend/test_api_suite.js` (or test upload endpoint).

- [ ] **Step 4: Verify lossless WebP output file creation**

Verify that uploading an image outputs a valid `.webp` image in the designated uploads subdirectory.
