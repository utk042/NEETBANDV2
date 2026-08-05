import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { PDFParse } from 'pdf-parse';
import mammoth from 'mammoth';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });

function getFileExtension(file) {
  let ext = path.extname(file.originalname).toLowerCase();
  if (!ext && file.mimetype) {
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
  return ext;
}

router.post('/', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const type = req.body.type || 'others';
    const uploadDir = path.join(__dirname, '../../uploads', type);
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const ext = getFileExtension(req.file);
    const imageExtensions = new Set(['.png', '.jpg', '.jpeg', '.webp', '.gif', '.bmp', '.tiff', '.avif']);
    const isImage = (req.file.mimetype && req.file.mimetype.startsWith('image/')) || imageExtensions.has(ext);

    const originalBase = path.basename(req.file.originalname, ext || path.extname(req.file.originalname));
    const safeBase = originalBase.replace(/[^a-zA-Z0-9._-]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '');
    const suffix = safeBase ? `-${safeBase}` : '';

    let filename;
    let bufferToWrite;

    if (isImage) {
      bufferToWrite = await sharp(req.file.buffer)
        .webp({ lossless: true, quality: 100 })
        .toBuffer();
      filename = `${req.file.fieldname}-${Date.now()}-${Math.random().toString(36).slice(2)}${suffix}.webp`;
    } else {
      bufferToWrite = req.file.buffer;
      filename = `${req.file.fieldname}-${Date.now()}-${Math.random().toString(36).slice(2)}${suffix}${ext}`;
    }

    const filePath = path.join(uploadDir, filename);
    await fs.promises.writeFile(filePath, bufferToWrite);

    return res.json({
      url: `/uploads/${type}/${filename}`,
      originalName: req.file.originalname
    });
  } catch (error) {
    console.error('Error handling file upload:', error);
    return res.status(500).json({ error: 'Failed to upload file: ' + error.message });
  }
});

router.post('/parse', upload.single('file'), async (req, res) => {
  let tempFilePath = null;
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    const ext = path.extname(req.file.originalname).toLowerCase();
    const tempDir = path.join(__dirname, '../../uploads/temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    tempFilePath = path.join(tempDir, `parse-${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`);
    await fs.promises.writeFile(tempFilePath, req.file.buffer);

    let text = '';
    if (ext === '.pdf') {
      const dataBuffer = fs.readFileSync(tempFilePath);
      const parser = new PDFParse({ data: dataBuffer });
      const result = await parser.getText();
      text = result.text;
    } else if (ext === '.docx') {
      const result = await mammoth.extractRawText({ path: tempFilePath });
      text = result.value;
    } else if (ext === '.txt' || ext === '.md') {
      text = fs.readFileSync(tempFilePath, 'utf8');
    } else {
      return res.status(400).json({ error: 'Unsupported file format. Please upload PDF, DOCX, or TXT.' });
    }

    res.json({ text });
  } catch (error) {
    console.error('Error parsing document:', error);
    res.status(500).json({ error: 'Failed to parse document: ' + error.message });
  } finally {
    if (tempFilePath && fs.existsSync(tempFilePath)) {
      try {
        fs.unlinkSync(tempFilePath);
      } catch (e) {
        console.error('Error deleting temp file:', e);
      }
    }
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
