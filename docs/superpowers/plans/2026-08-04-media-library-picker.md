# Media Library Image Selector Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Allow admins to select existing image files from the website's Media Library when editing songs or performing batch uploads, avoiding duplicate file uploads and saving server storage.

**Architecture:** Add a `GET /upload/files` endpoint in Express backend that scans `backend/uploads/` for image files with metadata. On the frontend, build a modal UI (`MediaLibraryModal.jsx`) that renders a visual image thumbnail grid with search and category filter capabilities, and hook it up to thumbnail URL fields in `ManageSongs.jsx` and `BatchUploadModal.jsx`.

**Tech Stack:** Node.js, Express, React (Vite), TailwindCSS, Lucide React icons.

## Global Constraints

- Backend base uploads folder: `backend/uploads`
- Supported image extensions: `.jpg`, `.jpeg`, `.png`, `.webp`, `.gif`, `.svg`
- Clean error handling with fallback default values if network request fails

---

### Task 1: Backend Media Files Listing API Endpoint

**Files:**
- Modify: `backend/src/routes/uploadRoutes.js`
- Test: `backend/test_media_library_api.js`

**Interfaces:**
- Produces: `GET /upload/files?fileType=image&search=...` returning JSON:
  ```json
  {
    "success": true,
    "files": [
      {
        "url": "/uploads/thumbnails/example.webp",
        "filename": "example.webp",
        "size": 102400,
        "mtime": "2026-08-04T12:00:00.000Z",
        "category": "thumbnails"
      }
    ]
  }
  ```

- [ ] **Step 1: Write backend API automated test**

Create `backend/test_media_library_api.js`:
```javascript
import express from 'express';
import request from 'supertest';
import uploadRoutes from './src/routes/uploadRoutes.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use('/upload', uploadRoutes);

async function runTest() {
  console.log('Testing GET /upload/files endpoint...');
  
  // Ensure a test upload file exists
  const testDir = path.join(__dirname, 'uploads', 'thumbnails');
  if (!fs.existsSync(testDir)) fs.mkdirSync(testDir, { recursive: true });
  const testFilePath = path.join(testDir, 'test_media_lib_sample.png');
  fs.writeFileSync(testFilePath, 'fake image data');

  const res = await request(app).get('/upload/files?fileType=image');
  
  console.log('Response status:', res.status);
  console.log('Files count:', res.body?.files?.length);
  
  if (res.status === 200 && Array.isArray(res.body?.files)) {
    const found = res.body.files.some(f => f.filename === 'test_media_lib_sample.png');
    if (found) {
      console.log('✅ GET /upload/files API test PASSED');
      process.exit(0);
    }
  }
  
  console.error('❌ GET /upload/files API test FAILED');
  process.exit(1);
}

runTest().catch(err => {
  console.error(err);
  process.exit(1);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node backend/test_media_library_api.js`
Expected: FAIL with status 404 (route not defined)

- [ ] **Step 3: Implement `GET /upload/files` route in `backend/src/routes/uploadRoutes.js`**

Add the following route handler to `backend/src/routes/uploadRoutes.js`:
```javascript
router.get('/files', async (req, res) => {
  try {
    const { fileType = 'image', search = '' } = req.query;
    const uploadsDir = path.join(__dirname, '../../uploads');

    if (!fs.existsSync(uploadsDir)) {
      return res.json({ success: true, files: [] });
    }

    const imageExtensions = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg']);
    const results = [];

    const scanDirectory = (dirPath, categoryName = 'others') => {
      const items = fs.readdirSync(dirPath, { withFileTypes: true });

      for (const item of items) {
        const fullPath = path.join(dirPath, item.name);
        if (item.isDirectory()) {
          scanDirectory(fullPath, item.name);
        } else if (item.isFile()) {
          const ext = path.extname(item.name).toLowerCase();
          if (fileType === 'image' && !imageExtensions.has(ext)) {
            continue;
          }

          if (search && !item.name.toLowerCase().includes(search.toLowerCase())) {
            continue;
          }

          const stats = fs.statSync(fullPath);
          const relativePath = path.relative(uploadsDir, fullPath).replace(/\\/g, '/');

          results.push({
            url: `/uploads/${relativePath}`,
            filename: item.name,
            size: stats.size,
            mtime: stats.mtime.toISOString(),
            category: categoryName
          });
        }
      }
    };

    scanDirectory(uploadsDir);

    // Sort by most recent modification date first
    results.sort((a, b) => new Date(b.mtime) - new Date(a.mtime));

    return res.json({
      success: true,
      files: results
    });
  } catch (error) {
    console.error('Error scanning uploads directory:', error);
    return res.status(500).json({ error: 'Failed to retrieve media files' });
  }
});
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node backend/test_media_library_api.js`
Expected: `✅ GET /upload/files API test PASSED`

- [ ] **Step 5: Commit**

```bash
git add backend/src/routes/uploadRoutes.js backend/test_media_library_api.js
git commit -m "feat(api): add GET /upload/files endpoint to scan media uploads"
```

---

### Task 2: Frontend `<MediaLibraryModal />` Component

**Files:**
- Create: `frontend/src/components/Admin/MediaLibraryModal.jsx`

**Interfaces:**
- Props:
  - `isOpen`: boolean
  - `onClose`: function `() => void`
  - `onSelect`: function `(url: string) => void`
  - `title`: string (optional)

- [ ] **Step 1: Create `MediaLibraryModal.jsx` component**

Write the complete code for `frontend/src/components/Admin/MediaLibraryModal.jsx`:

```jsx
import React, { useState, useEffect, useMemo } from 'react';
import { X, Search, Image as ImageIcon, Loader2, Folder, Check } from 'lucide-react';
import axios from 'axios';

export default function MediaLibraryModal({ isOpen, onClose, onSelect, title = "Select from Media Library" }) {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedUrl, setSelectedUrl] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchMediaFiles();
      setSelectedUrl('');
    }
  }, [isOpen]);

  const fetchMediaFiles = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get('/api/upload/files?fileType=image');
      if (res.data?.files) {
        setFiles(res.data.files);
      }
    } catch (err) {
      console.error('Failed to fetch media library:', err);
      setError('Failed to load media files from server.');
    } finally {
      setLoading(false);
    }
  };

  const categories = useMemo(() => {
    const cats = new Set(['all']);
    files.forEach(f => {
      if (f.category) cats.add(f.category);
    });
    return Array.from(cats);
  }, [files]);

  const filteredFiles = useMemo(() => {
    return files.filter(file => {
      const matchesSearch = !search || file.filename.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = activeCategory === 'all' || file.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [files, search, activeCategory]);

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-surface-container-highest dark:bg-surface border border-outline-variant/30 w-full max-w-4xl max-h-[85vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden text-on-surface">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-outline-variant/20 flex items-center justify-between bg-surface-container-high/40">
          <div className="flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-primary" />
            <h3 className="font-bold text-lg text-on-surface">{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-on-surface-variant hover:text-on-surface rounded-full hover:bg-surface-variant/40 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar & Filter Bar */}
        <div className="p-4 border-b border-outline-variant/20 flex flex-col sm:flex-row items-center gap-4 justify-between bg-surface-container-low/30">
          {/* Search Input */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search images by name..."
              className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-outline-variant/40 bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>

          {/* Category Pills */}
          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-full capitalize transition-all whitespace-nowrap ${
                  activeCategory === cat
                    ? 'bg-primary text-on-primary shadow-sm'
                    : 'bg-surface-variant/40 text-on-surface-variant hover:bg-surface-variant'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Grid Content */}
        <div className="flex-1 overflow-y-auto p-6 min-h-[300px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 gap-3 text-on-surface-variant">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="text-sm">Scanning media library...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-64 text-error gap-2">
              <p>{error}</p>
              <button onClick={fetchMediaFiles} className="text-xs underline text-primary">Try again</button>
            </div>
          ) : filteredFiles.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 gap-2 text-on-surface-variant">
              <Folder className="w-12 h-12 stroke-[1.5] text-outline" />
              <p className="font-medium">No media files found</p>
              <p className="text-xs opacity-70">Upload images using the form to populate the library.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {filteredFiles.map((file) => {
                const isSelected = selectedUrl === file.url;
                return (
                  <div
                    key={file.url}
                    onClick={() => setSelectedUrl(file.url)}
                    className={`group relative rounded-xl border overflow-hidden cursor-pointer transition-all ${
                      isSelected
                        ? 'border-primary ring-2 ring-primary/30 shadow-md bg-primary/5'
                        : 'border-outline-variant/30 hover:border-primary/60 hover:shadow'
                    }`}
                  >
                    <div className="aspect-square w-full bg-surface-variant/20 overflow-hidden flex items-center justify-center relative">
                      <img
                        src={file.url}
                        alt={file.filename}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                      {isSelected && (
                        <div className="absolute inset-0 bg-primary/30 flex items-center justify-center">
                          <div className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center shadow">
                            <Check className="w-5 h-5" />
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="p-2 bg-surface text-xs border-t border-outline-variant/10">
                      <p className="font-semibold text-on-surface truncate" title={file.filename}>
                        {file.filename}
                      </p>
                      <p className="text-[10px] text-on-surface-variant/70 mt-0.5">
                        {formatFileSize(file.size)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-outline-variant/20 flex items-center justify-end gap-3 bg-surface-container-high/40">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium rounded-xl border border-outline-variant/40 hover:bg-surface-variant/30 transition-colors"
          >
            Cancel
          </button>
          <button
            disabled={!selectedUrl}
            onClick={() => {
              if (selectedUrl) {
                onSelect(selectedUrl);
                onClose();
              }
            }}
            className="px-5 py-2 text-sm font-semibold rounded-xl bg-primary text-on-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
          >
            Select Image
          </button>
        </div>

      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/components/Admin/MediaLibraryModal.jsx
git commit -m "feat(ui): add MediaLibraryModal component for visual image picking"
```

---

### Task 3: Form Integrations in `ManageSongs.jsx` and `BatchUploadModal.jsx`

**Files:**
- Modify: `frontend/src/components/Admin/ManageSongs.jsx`
- Modify: `frontend/src/components/Admin/BatchUploadModal.jsx`

- [ ] **Step 1: Integrate `<MediaLibraryModal />` into `ManageSongs.jsx`**

Import `MediaLibraryModal` in `ManageSongs.jsx` and add the state and `[ 🖼 Media Library ]` button next to `Thumbnail Image URL`:

```jsx
import MediaLibraryModal from './MediaLibraryModal';

// Inside ManageSongs component state:
const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
const [mediaTargetField, setMediaTargetField] = useState(null); // 'thumbnailUrl' or row index

// Next to Thumbnail Image URL label/input in form:
<div className="flex items-center gap-2">
  <button
    type="button"
    onClick={() => {
      setMediaTargetField('thumbnail');
      setIsMediaModalOpen(true);
    }}
    className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-secondary/10 text-secondary hover:bg-secondary/20 transition-colors flex items-center gap-1.5"
  >
    <ImageIcon className="w-3.5 h-3.5" />
    Media Library
  </button>
</div>

// Render MediaLibraryModal:
<MediaLibraryModal
  isOpen={isMediaModalOpen}
  onClose={() => setIsMediaModalOpen(false)}
  onSelect={(url) => {
    setFormData(prev => ({ ...prev, thumbnailUrl: url }));
  }}
/>
```

- [ ] **Step 2: Integrate `<MediaLibraryModal />` into `BatchUploadModal.jsx`**

Import `MediaLibraryModal` in `BatchUploadModal.jsx` and hook up thumbnail selection per song item:

```jsx
import MediaLibraryModal from './MediaLibraryModal';

// Inside BatchUploadModal component state:
const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
const [activeRowIndex, setActiveRowIndex] = useState(null);

// In song row card thumbnail input:
<button
  type="button"
  onClick={() => {
    setActiveRowIndex(index);
    setIsMediaModalOpen(true);
  }}
  className="px-2.5 py-1 text-[11px] font-medium rounded-lg bg-surface-variant text-on-surface hover:bg-surface-variant/80 transition-colors flex items-center gap-1"
>
  <ImageIcon className="w-3 h-3" />
  Library
</button>

// Render MediaLibraryModal:
<MediaLibraryModal
  isOpen={isMediaModalOpen}
  onClose={() => setIsMediaModalOpen(false)}
  onSelect={(url) => {
    if (activeRowIndex !== null) {
      updateSongRow(activeRowIndex, 'thumbnailUrl', url);
    }
  }}
/>
```

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/Admin/ManageSongs.jsx frontend/src/components/Admin/BatchUploadModal.jsx
git commit -m "feat(admin): integrate Media Library picker into ManageSongs and BatchUploadModal"
```

---

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-08-04-media-library-picker.md`.

Two execution options:

1. **Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration
2. **Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

Which approach?
