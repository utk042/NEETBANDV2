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
    
    // Some browsers/OS might map mp3 to .mpeg extension or no extension
    if (ext === '.mpeg' || ext === '') {
      if (file.mimetype === 'audio/mpeg' || file.mimetype === 'audio/mp3') {
        ext = '.mp3';
      } else if (file.mimetype === 'audio/wav') {
        ext = '.wav';
      } else if (file.mimetype === 'audio/flac') {
        ext = '.flac';
      } else if (file.mimetype === 'audio/aac') {
        ext = '.aac';
      } else if (file.mimetype === 'audio/ogg') {
        ext = '.ogg';
      } else if (file.mimetype === 'audio/mp4') {
        ext = '.m4a';
      }
    }

    cb(
      null,
      `${file.fieldname}-${Date.now()}${ext}`
    );
  },
});

const upload = multer({ storage });

router.post('/', upload.single('file'), (req, res) => {
  const type = req.body.type || 'others';
  // The static middleware in index.js serves the 'uploads' directory at /uploads
  // So the file will be accessible at /uploads/type/filename
  res.json({ url: `/uploads/${type}/${req.file.filename}` });
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

export default router;
