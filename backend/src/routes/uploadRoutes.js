import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

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
    cb(
      null,
      `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`
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

export default router;
