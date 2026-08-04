import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { PDFParse } from 'pdf-parse';
import mammoth from 'mammoth';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

const storage = multer.diskStorage({
  destination(req, file, cb) {
    const type = req.body.type || 'others'; 
    const uploadPath = path.join(__dirname, '../../uploads', type);
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename(req, file, cb) {
    let ext = path.extname(file.originalname).toLowerCase();
    
    if (!ext) {
      if (file.mimetype === 'audio/mpeg' || file.mimetype === 'audio/mp3') {
        ext = '.mp3';
      } else if (file.mimetype === 'audio/wav' || file.mimetype === 'audio/x-wav') {
        ext = '.wav';
      } else if (file.mimetype === 'audio/flac') {
        ext = '.flac';
      } else if (file.mimetype === 'audio/aac') {
        ext = '.aac';
      } else if (file.mimetype === 'audio/ogg') {
        ext = '.ogg';
      } else if (file.mimetype === 'audio/mp4') {
        ext = '.m4a';
      } else if (file.mimetype === 'audio/webm' || file.mimetype === 'video/webm') {
        ext = '.webm';
      } else if (file.mimetype === 'audio/3gpp' || file.mimetype === 'video/3gpp') {
        ext = '.3gp';
      }
    }

    const originalBase = path.basename(file.originalname, ext || path.extname(file.originalname));
    const safeBase = originalBase.replace(/[^a-zA-Z0-9._-]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '');
    const suffix = safeBase ? `-${safeBase}` : '';

    cb(
      null,
      `${file.fieldname}-${Date.now()}-${Math.random().toString(36).slice(2)}${suffix}${ext}`
    );
  },
});

const upload = multer({ storage });

router.post('/', upload.single('file'), (req, res) => {
  const type = req.body.type || 'others';
  // The static middleware in index.js serves the 'uploads' directory at /uploads
  // So the file will be accessible at /uploads/type/filename
  res.json({
    url: `/uploads/${type}/${req.file.filename}`,
    originalName: req.file.originalname
  });
});

router.post('/parse', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    const filePath = req.file.path;
    const ext = path.extname(req.file.originalname).toLowerCase();
    
    let text = '';
    
    if (ext === '.pdf') {
      const dataBuffer = fs.readFileSync(filePath);
      const parser = new PDFParse({ data: dataBuffer });
      const result = await parser.getText();
      text = result.text;
    } else if (ext === '.docx') {
      const result = await mammoth.extractRawText({ path: filePath });
      text = result.value;
    } else if (ext === '.txt' || ext === '.md') {
      text = fs.readFileSync(filePath, 'utf8');
    } else {
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      return res.status(400).json({ error: 'Unsupported file format. Please upload PDF, DOCX, or TXT.' });
    }
    
    // Clean up temporary file
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    
    res.json({ text });
  } catch (error) {
    console.error('Error parsing document:', error);
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ error: 'Failed to parse document: ' + error.message });
  }
});

router.delete('/', async (req, res) => {
  try {
    const { url } = req.body || {};
    if (!url || typeof url !== 'string' || !url.startsWith('/uploads/')) {
      return res.status(400).json({ error: 'Invalid file URL' });
    }
    const relativePath = path.normalize(url.replace(/^\/uploads\//, '')).replace(/^(\.\.[\/\\])+/, '');
    const absolutePath = path.join(__dirname, '../../uploads', relativePath);
    if (fs.existsSync(absolutePath)) {
      fs.unlinkSync(absolutePath);
      return res.json({ success: true, message: 'File deleted successfully' });
    }
    return res.status(404).json({ error: 'File not found' });
  } catch (err) {
    console.error('Error deleting upload:', err);
    return res.status(500).json({ error: 'Failed to delete file' });
  }
});

router.get('/files', async (req, res) => {
  try {
    const { fileType, search } = req.query;
    const uploadsDir = path.join(__dirname, '../../uploads');

    if (!fs.existsSync(uploadsDir)) {
      return res.json({ success: true, files: [] });
    }

    const getAllFiles = (dirPath) => {
      let results = [];
      if (!fs.existsSync(dirPath)) return results;
      const list = fs.readdirSync(dirPath, { withFileTypes: true });

      for (const item of list) {
        const fullPath = path.join(dirPath, item.name);
        if (item.isDirectory()) {
          results = results.concat(getAllFiles(fullPath));
        } else if (item.isFile()) {
          results.push(fullPath);
        }
      }
      return results;
    };

    const allFilePaths = getAllFiles(uploadsDir);

    const imageExts = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg']);

    let files = allFilePaths.map((filePath) => {
      const relPath = path.relative(uploadsDir, filePath).replace(/\\/g, '/');
      const filename = path.basename(filePath);
      const ext = path.extname(filename).toLowerCase();
      const parts = relPath.split('/');
      const category = parts.length > 1 ? parts[0] : 'others';
      const stats = fs.statSync(filePath);

      return {
        url: `/uploads/${relPath}`,
        filename,
        size: stats.size,
        mtime: stats.mtime.toISOString(),
        category,
        ext
      };
    });

    if (fileType === 'image') {
      files = files.filter(f => imageExts.has(f.ext));
    }

    if (search && typeof search === 'string' && search.trim() !== '') {
      const searchLower = search.trim().toLowerCase();
      files = files.filter(f => f.filename.toLowerCase().includes(searchLower));
    }

    files.sort((a, b) => new Date(b.mtime) - new Date(a.mtime));

    const resultFiles = files.map(({ ext, ...file }) => file);

    return res.json({
      success: true,
      files: resultFiles
    });
  } catch (error) {
    console.error('Error fetching upload files:', error);
    return res.status(500).json({ error: 'Failed to fetch upload files' });
  }
});

export default router;
